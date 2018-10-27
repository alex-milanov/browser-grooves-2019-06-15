'use strict';

// lib
const Rx = require('rx');
const $ = Rx.Observable;

const prettify = require('code-prettify');
const vm = require('../../../util/vm');
const caret = require('../../../util/caret');
const app = require('../../../util/app');

// dom
const vdom = require('iblokz-snabbdom-helpers');
const {
	section, button, span, h1, h2, h3, pre, code,
	form, fieldset, label, legend, input, select, option,
	ul, li, h, p
} = vdom;

// libraries
const d3 = require('d3');
const THREE = require('three');

const libs = {
	d3,
	THREE
};

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
			vdom,
			app,
			navigator
		}));
	} catch (e) {
		err = e;
	}
	cb({res, log, err});
};

const cleanupCode = code => code
	.split('\n')
	.map(s => s.trimRight())
	.map(s => s.replace(new RegExp('&nbps;', 'ig'), ''))
	.filter(s => s !== '' && s !== ' ')
	.join('\n');

const removeChildren = (el, selector = '*') => Array.from(el.querySelectorAll(selector)).forEach(child => {
	el.removeChild(child);
});

const createBefore = (type, el) => {
	let newEl = document.createElement(type);
	el.parentNode.insertBefore(newEl, el);
	return newEl;
};

// clear and prep output and console
const prepOutput = parentNode => {
	removeChildren(parentNode, 'iframe');
	let iframe = createBefore('IFRAME', parentNode.querySelector('.console'));
	iframe.classList.add('sandbox');
	iframe.contentWindow.document.body.innerHTML = `
<style>
	* {font-size: 18px;}
	body {padding: 0px; margin: 0px}
	p, pre {padding: 4px;}
</style>
<section id="ui"></section>
`;
	parentNode.querySelector('.console').innerHTML = '';
	return iframe;
};

const process = (type, sourceCode, iframe) => {
	const console$ = new Rx.ReplaySubject();
	if (type === 'js') {
		sandbox(sourceCode, iframe, libs, ({res, log, err}) => {
			if (err) console$.onNext(`<p class="err">${err}</p>\n`);
			if (log) log.map(l => prettify.prettyPrintOne(JSON.stringify(l)))
				.forEach(l => console$.onNext(`${l}\n`));
		});
	}
	return console$;
};

// ui
module.exports = ({
	source, pos = {start: {row: 0, col: 0}, end: {row: 0, col: 0}}, type = 'js',
	change = code => {},
	updatePos = pos => {},
	undo = () => {},
	redo = () => {}
}) => span('.codebin', [
	code(`.source[type="${type}"][spellcheck="false"][contenteditable="true"][spellcheck="false"]`, {
		hook: {
			// insert: ({elm}) => caret.set(elm, pos),
			// update: ({elm}) => caret.set(elm, pos)
		},
		props: {
			innerHTML: prettify.prettyPrintOne(source, type, true),
			spellcheck: false
		},
		on: {
			keydown: ev => {
				console.log(`>${ev.key}<`);
				if (ev.key === 'Tab') {
					ev.preventDefault();
					caret.indent(ev.target, ev.shiftKey === true ? 'left' : 'right');
					ev.target.dispatchEvent(new Event('input'));
					console.log('tabbing');
					// document.execCommand('insertHTML', false, '&#009');
					// document.execCommand('indent');
				} else if (ev.key === 'z' && ev.ctrlKey) {
					undo();
				} else if (ev.key === 'y' && ev.ctrlKey) {
					redo();
				}
			},
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
						const pos = caret.get(el);
						console.log(pos);
						let sourceCode = unprettify(el.innerHTML);
						change(sourceCode, pos);
						let iframe = prepOutput(el.parentNode.querySelector('.output'));
						process(type, cleanupCode(sourceCode), iframe)
							.catch(err => console.log(err))
							.subscribe(l => {
								console.log(l);
								el.parentNode.querySelector('.console').innerHTML += l;
							});
						// setTimeout(() => caret.set(el, pos));
						/*
						sourceCode = cleanupCode(sourceCode);
						// clear and prep output and console
						let iframe = prepOutput(el.parentNode.querySelector('.output'));

						// process code
						process(type, sourceCode, iframe)
							.catch(err => console.log(err))
							.subscribe(l => {
								console.log(l);
								el.parentNode.querySelector('.console').innerHTML += l;
							});
						*/

						return 1;
					})
			)).pop().subscribe(),
			keyup: ev => {
				const pos = caret.get(ev.target);
				console.log(pos);
			}
		}
	}),
	span('.output', [
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
					// clear and prep output and console
					let iframe = prepOutput(elm.parentNode);

					// process code
					process(type, cleanupCode(source), iframe)
						.catch(err => console.log(err))
						.subscribe(l => {
							console.log(l);
							elm.innerHTML += l;
						});
				}
				// update: ({elm}) => {
				// 	// clear and prep output and console
				// 	let iframe = prepOutput(elm.parentNode);
        //
				// 	// process code
				// 	process(type, cleanupCode(source), iframe)
				// 		.catch(err => console.log(err))
				// 		.subscribe(l => {
				// 			console.log(l);
				// 			elm.innerHTML += l;
				// 		});
				// }
			}
		})
	])
]);
