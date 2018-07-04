# iBlokz Slides App Architecture

## press down to go to the next sub slide ...

### ... press again for a surprise

### ... here is some code
```js
// actions
const actions$ = new Rx.Subject();
const actions = {
	incr: () => actions$.onNext(
		state => ({num: state.num + 1})),
	initial: {num: 0}
};

// ui
const {div, span, button} = vdom;
const ui = ({state, actions}) => div('#ui', [
	button({on:{click: () => actions.incr()}}, 'Incr'),
	span(`Num: ${state.num}`)
]);

// reducing the stream of actions to the app state
const state$ = actions$
	.startWith(() => actions.initial)
	.scan((state, reducer) => reducer(state), {})
	.share();

// mapping the state to the ui
const ui$ = state$.map(state => ui({state, actions}));

vdom.patchStream(ui$, document.querySelector('#ui'));
```

## Let's look at the app architecture ...

### ... here
![app-architecture](./assets/img/app-architecture.png)

## More Info
- https://tiny.cc/iblokz-dev-guide
- https://github.io/iblokz/ui-boilerplate
- https://github.com/alex-milanov/simple-tasks-example
