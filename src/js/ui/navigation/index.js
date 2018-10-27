'use strict';

// dom
const {
	section, button, span, h1, h2, pre, code,
	form, fieldset, label, legend, input, select, option,
	ul, li, i
} = require('iblokz-snabbdom-helpers');

const directionMap = {
	top: ({index, slides}) => (slides[index[0]] instanceof Array && index[1] > 0)
		? [index[0], index[1] - 1] : index,
	left: ({index, slides}) => (index[0] > 0)
		? [index[0] - 1, 0] : index,
	bottom: ({index, slides}) => (slides[index[0]] instanceof Array && (index[1] < slides[index[0]].length - 1))
		? [index[0], index[1] + 1] : index,
	right: ({index, slides}) => (index[0] < slides.length - 1)
		? [index[0] + 1, 0] : index
};

module.exports = ({state, actions}) => section('.navigation', [
	button('.nav-top', {
		on: {click: () => actions.move('top')},
		attrs: {
			disabled: !(state.index[1] > 0)
		}
	}, i('.fa.fa-chevron-up')),
	button('.nav-left', {
		on: {click: () => actions.move('left')},
		attrs: {
			disabled: !(state.index[0] > 0)
		}
	}, i('.fa.fa-chevron-left')),
	button('.nav-right', {
		on: {click: () => actions.move('right')},
		attrs: {
			disabled: !(state.index[0] < state.slides.length - 1)
		}
	}, i('.fa.fa-chevron-right')),
	button('.nav-bottom', {
		on: {click: () => actions.move('bottom')},
		attrs: {
			disabled: !(state.slides[state.index[0]] instanceof Array
				&& (state.index[1] < state.slides[state.index[0]].length - 1))
		}
	}, i('.fa.fa-chevron-down'))
]);
