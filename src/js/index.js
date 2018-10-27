'use strict';

// lib
const Rx = require('rx');
const $ = Rx.Observable;

window.marked = require('marked');

// iblokz
const vdom = require('iblokz-snabbdom-helpers');
const {obj, arr} = require('iblokz-data');

// app
const app = require('./util/app');
let actions = require('./actions');
let ui = require('./ui');
let actions$;
const state$ = new Rx.BehaviorSubject();

const gamepad = require('./util/gamepad');

// adapt actions
actions = app.adapt(actions);

// hot reloading
if (module.hot) {
	// actions
	actions$ = $.fromEventPattern(
    h => module.hot.accept("./actions", h)
	).flatMap(() => {
		actions = app.adapt(require('./actions'));
		return actions.stream.startWith(state => state);
	}).merge(actions.stream);
	// ui
	module.hot.accept("./ui", function() {
		ui = require('./ui');
		// actions.ping();
	});
} else {
	actions$ = actions.stream;
}
// reduce actions to state
actions$
	/*
	.map(action => (
		action.path && console.log(action.path.join('.'), action.payload),
		console.log(action),
		action)a
	)
	*/
	.startWith(() => actions.initial)
	.scan((state, change) => change(state), {})
	.map(state => (console.log(state), state))
	.subscribe(state => state$.onNext(state));

document.addEventListener('keydown', e => {
	console.log(e.key, e.target, e);
	if (e.target.contentEditable === 'true') {
		switch (e.key) {
			case 'Escape':
				e.target.blur();
				e.preventDefault();
				window
					.getSelection()
					.removeAllRanges();
				document.querySelector('.slides').focus();
				break;
			// case 'Tab':
			// 	e.preventDefault();
			// 	document.execCommand('insertHTML', false, '&#009');
			// 	break;
			default:
				break;
		}
		return;
	}
	if (e.key === 'E' && e.shiftKey === true && e.ctrlKey === true)
		actions.toggleControls();

	if (e.key === 'ArrowUp') actions.move('top');
	if (e.key === 'ArrowRight') actions.move('right');
	if (e.key === 'ArrowDown') actions.move('bottom');
	if (e.key === 'ArrowLeft') actions.move('left');
});

// state -> ui
const ui$ = state$.map(state => ui({state, actions}))
	.map(uiTree => (console.log({uiTree}), uiTree));

vdom.patchStream(ui$, '#ui');

actions.loadSlides();

let tries = 0;
let intervalId = window.setInterval(() => {
	if (window.LiveReload || tries === 20) clearInterval(intervalId);

	if (window.LiveReload) {
		window.LiveReload.reloader.reloadPage = (...args) => console.log({reloadPage: args});
		const _reload = window.LiveReload.reloader.reload.bind(window.LiveReload.reloader);
		window.LiveReload.reloader.reload = (...args) => {
			console.log({reload: args});
			if (args[0].match(/slides\.md$/i)) actions.loadSlides();
			_reload(...args);
		};
	}
	// window.LiveReload.on('reload', (...args) => console.log({reload: args}));
}, 200);

gamepad.changes()
	.map(pads => (console.log({pads}), pads))
	// .withLatestFrom(pressedKeys$, (pads, keys) => ({pads, keys}))
	.subscribe(pads => {
		console.log(pads[0]);
		if (pads[0]) {
			if (pads[0].axes[1] < 0) actions.move('top');
			if (pads[0].axes[0] > 0) actions.move('right');
			if (pads[0].axes[1] > 0) actions.move('bottom');
			if (pads[0].axes[0] < 0) actions.move('left');
		}
	});

function iResize() {
	window.requestAnimationFrame(iResize);
	Array.from(document.querySelectorAll('iframe')).forEach(iframe => {
		iframe.style.height = iframe.contentWindow.document.body.scrollHeight + 'px';
	});
}

iResize();

// livereload impl.
if (module.hot) {
	document.write(`<script src="http://${(location.host || 'localhost').split(':')[0]}` +
	`:35729/livereload.js?snipver=1"></script>`);
}
