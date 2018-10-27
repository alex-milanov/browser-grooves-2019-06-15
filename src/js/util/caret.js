'use strict';

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

const get = el => {
	let range = window.getSelection().getRangeAt(0);
	// start
	let startLi = (range.startContainer.tagName === 'LI')
		? range.startContainer : getParent(range.startContainer, 'LI');
	let startColRange = document.createRange();
	startColRange.setStart(startLi, 0);
	startColRange.setEnd(range.startContainer, range.startOffset);
	// end
	let endLi = (range.endContainer.tagName === 'LI')
		? range.endContainer : getParent(range.endContainer, 'LI');
	let endColRange = document.createRange();
	endColRange.setStart(endLi, 0);
	endColRange.setEnd(range.endContainer, range.endOffset);
	return {
		start: {
			row: getElIndex(startLi),
			col: startColRange.toString().length
		},
		end: {
			row: getElIndex(endLi),
			col: endColRange.toString().length
		}
	};
};

const set = (el, pos) => {
	const startLi = Array.from(el.querySelectorAll('li'))[pos.start.row];
	const endLi = Array.from(el.querySelectorAll('li'))[pos.end.row];
	if (!startLi) return;
	const startRp = getRangePoint(startLi, pos.start.col);
	const endRp = getRangePoint(endLi, pos.end.col);
	// console.log(rp);
	let range = document.createRange();
	try {
		range.setStart(startRp.el, startRp.offset);
		range.setEnd(endRp.el, endRp.offset);
	} catch (e) {
		console.log(e);
		range.setStart(startRp.el, 0);
		range.setEnd(endRp.el, 0);
	}
	const sel = window.getSelection();
	sel.removeAllRanges();
	sel.addRange(range);
};

const indent = (el, direction = 'right') => {
	let range = window.getSelection().getRangeAt(0);
	let startLi = (range.startContainer.tagName === 'LI')
		? range.startContainer : getParent(range.startContainer, 'LI');
	let startIndex = getElIndex(startLi);
	let endLi = (range.endContainer.tagName === 'LI')
		? range.endContainer : getParent(range.endContainer, 'LI');
	let endIndex = getElIndex(endLi);
	if (startIndex === endIndex && direction === 'right') {
		document.execCommand('insertHTML', false, '&#009');
	} else {
		Array.from(startLi.parentNode.children)
			.filter((li, i) => i >= startIndex && i <= endIndex)
			.forEach(li => {
				if (direction === 'right') {
					let tabSpan = document.createElement('span');
					tabSpan.innerHTML = '\t';
					li.prepend(tabSpan);
				} else {
					console.log(`>${li.children[0].innerHTML}<`);
					Array.from(li.children).forEach(spEl => spEl.innerHTML === '' && spEl.remove());
					li.children[0].innerHTML = li.children[0].innerHTML.replace(/^\t/, '');
				}
			});
	}
};

module.exports = {
	get,
	set,
	indent
};
