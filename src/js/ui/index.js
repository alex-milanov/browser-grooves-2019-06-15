'use strict';

// dom
const {
	section, button, span, h1, h2, pre, code,
	form, fieldset, label, legend, input, select, option,
	h
} = require('iblokz-snabbdom-helpers');

const slides = require('./slides');
const controls = require('./controls');
const navigation = require('./navigation');

module.exports = ({state, actions}) => section('#ui', [
	slides({state, actions}),
	controls({state, actions}),
	navigation({state, actions})
	// h(`audio.clip`, {
	// 	attrs: {
	// 		loop: true,
	// 		autoplay: true
	// 	}
	// }, [
	// 	h(`source`, {
	// 		attrs: {
	// 			src: '/assets/audio/clip.ogg',
	// 			type: 'audio/ogg'
	// 		}
	// 	})
	// ])
]);
