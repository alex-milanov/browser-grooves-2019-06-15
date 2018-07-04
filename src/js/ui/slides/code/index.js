'use strict';

// lib
const Rx = require('rx');
const $ = Rx.Observable;

const prettify = require('code-prettify');
const vm = require('../../../util/vm');

// dom
const vdom = require('iblokz/adapters/vdom');
const {
	section, button, span, h1, h2, h3, pre, code,
	form, fieldset, label, legend, input, select, option,
	ul, li, h, p
} = vdom;

const unprettify = html => {
	const tDiv = document.createElement('div');
	tDiv.innerHTML = html
		.replace(/<\/?ol[^>]*>/g, '')
		.replace(/<li[^>]*>/g, '')
		.replace(/<\/li>/g, '^^nl^^')
		.replace('<br>', '');
	// console.log(tDiv.innerHTML);
	const text = tDiv.textContent
		.replace(/\^\^nl\^\^/g, '\n');
	// console.log(text);
	// tDiv.innerHTML = html;
	// const text = tDiv.textContent;
	return text;
};

const getParent = (el, tagName) => (el.parentNode.tagName === tagName)
	? el.parentNode
	: getParent(el.parentNode, tagName);

const getElIndex = el => Array.from(el.parentNode.children).indexOf(el);

const getRangePoint = (el, offset) =>
	(el.nodeType === 3 || el.childNodes.length === 0)
		? ({el, offset: (el.textContent.length < offset) ? el.textContent.length : offset})
		: Array.from(el.childNodes).reduce(
			(rp, child) => (rp.el !== el)
				? rp
				: (child.textContent.length >= rp.offset)
					? getRangePoint(child, rp.offset)
					: {el, offset: rp.offset - child.textContent.length},
			{el, offset}
		);

const caret = {
	get: el => {
		let range = window.getSelection().getRangeAt(0);
		let parentLi = (range.startContainer.tagName === 'LI')
			? range.startContainer : getParent(range.startContainer, 'LI');
		let colRange = document.createRange();
		colRange.setStart(parentLi, 0);
		colRange.setEnd(range.startContainer, range.startOffset);
		const row = getElIndex(parentLi);
		const col = colRange.toString().length;
		return {
			row,
			col
		};
	},
	set: (el, pos) => {
		const parentLi = Array.from(el.querySelectorAll('li'))[pos.row];
		const rp = getRangePoint(parentLi, pos.col);
		console.log(rp);
		let range = document.createRange();
		range.setStart(rp.el, rp.offset);
		range.setEnd(rp.el, rp.offset);
		const sel = window.getSelection();
		sel.removeAllRanges();
		sel.addRange(range);
	}
};

const sandbox = (source, iframe, context = {}, cb) => {
	let log = [];
	let err = null;
	let res = null;
	try {
		res = vm.runInIFrame(source, iframe, Object.assign(context, {
			console: {log: (...args) => {
				console.log(args);
				log.push(args);
			}},
			Rx,
			$,
			vdom
		}));
	} catch (e) {
		err = e;
	}
	cb({res, log, err});
};

const removeChildren = (el, selector = '*') => Array.from(el.querySelectorAll(selector)).forEach(child => {
	el.removeChild(child);
});

const createBefore = (type, el) => {
	removeChildren(el.parentNode, 'iframe');
	let newEl = document.createElement(type);
	el.parentNode.insertBefore(newEl, el);
	return newEl;
};

module.exports = (source, type = 'js') => span('.codebin', [
	code(`.source[type="${type}"][contenteditable="true"][spellcheck="false"]`, {
		props: {
			innerHTML: prettify.prettyPrintOne(source, type, true)
		},
		on: {
			focus: ({target}) => [$.fromEvent(target, 'input')
				.map(ev => ev.target)
				.takeUntil($.fromEvent(target, 'blur'))
				.share()
			].map(inputs$ => $.merge(
					inputs$.debounce(200).map(el => {
						const pos = caret.get(el);
						const sourceCode = unprettify(el.innerHTML);
						el.innerHTML = prettify.prettyPrintOne(sourceCode, type, true);
						caret.set(el, pos);
						return 1;
					}),
					inputs$.debounce(500).map(el => {
						if (type === 'js') {
							const sourceCode = unprettify(el.innerHTML);
							removeChildren(el.parentNode.querySelector('.output'), 'iframe');
							let iframe = createBefore('IFRAME', el.parentNode.querySelector('.console'));
							iframe.contentWindow.document.body.innerHTML = '<style>* {font-size: 24px;}</style><section id="ui"></section>';
							sandbox(sourceCode, iframe, {}, ({res, log, err}) => {
								el.parentNode.querySelector('.console').innerHTML = [].concat(
									err ? [`<p class="err">${err}</p>`] : [],
									log ? log.map(l => prettify.prettyPrintOne(JSON.stringify(l))) : []
									// res ? [`> ${res}`] : []
								).join('\n\n');
							});
						}
						return 1;
					})
			)).pop().subscribe(),
			keyup: ev => {
				const pos = caret.get(ev.target);
				console.log(pos);
			}
		}
	}),
	(type === 'js')
		? span('.output', [
			h('iframe.sandbox', {
				hook: {
					insert: ({elm}) => {
						elm.contentWindow.document.body.innerHTML = '<section id="ui"></section>';
					}
				}
			}),
			code('.console', {
				hook: {
					insert: ({elm}) => {
						if (type === 'js') {
							removeChildren(elm.parentNode, 'iframe');
							let iframe = createBefore('IFRAME', elm);
							iframe.contentWindow.document.body.innerHTML = '<style>* {font-size: 24px;}</style><section id="ui"></section>';
							sandbox(source, iframe, {}, ({res, log, err}) => {
								elm.innerHTML = [].concat(
									err ? [`<span class="err">${err}</span>`] : [],
									log ? log.map(l => prettify.prettyPrintOne(JSON.stringify(l))) : []
									// res ? [`> ${res}`] : []
								).join('\n\n');
							});
						}
					}
				}
			})
		])
	: ''
]);
