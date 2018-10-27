# Intro to Creative Coding
... with JavaScript and Web APIs

## Motivation

### My Framework
![app-architecture](./assets/img/app-architecture.png)

### Example
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

## D3

### Example 1
```js

var nodes = [].concat(
	d3.range(80).map(function() { return {type: "a"}; }),
	d3.range(160).map(function() { return {type: "b"}; })
);

var node = d3.select(document.querySelector('#ui'))
	.append('svg')
	.attr('width', '640').attr('height', '400')
	.attr('viewBox', '-320 -200 640 400')
	.append("g")
	.selectAll("circle")
	.data(nodes)
	.enter().append("circle")
	.attr("r", 2.5)
	.attr("fill", function(d) { return d.type === "a" ? "brown" : "aqua"; })

var simulation = d3.forceSimulation(nodes)
	.force("charge", d3.forceCollide().radius(5))
	.force("r", d3.forceRadial(function(d) { return d.type === "a" ? 100 : 200;}))
	.on("tick", ticked);

function ticked() {
	node
		.attr("cx", function(d) { return d.x; })
		.attr("cy", function(d) { return d.y; });
}
```

### Resources
- https://d3js.org

## THREE

### Example 1
```js
var camera, scene, renderer;
var mesh;
const dim = [window.innerWidth, 400];
init();
animate();
function init() {
	camera = new THREE.PerspectiveCamera( 70, dim[0] / dim[1], 1, 1000 );
	camera.position.z = 400;
	scene = new THREE.Scene();
	var texture = new THREE.TextureLoader().load('/assets/img/crate.gif');
	var geometry = new THREE.BoxBufferGeometry( 200, 200, 200 );
	var material = new THREE.MeshBasicMaterial( { map: texture } );
	mesh = new THREE.Mesh( geometry, material );
	scene.add( mesh );
	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( dim[0], dim[1] );
	document.querySelector('#ui').appendChild( renderer.domElement );
	//
	window.addEventListener( 'resize', onWindowResize, false );
}
function onWindowResize() {
	camera.aspect = dim[0] / dim[1];
	camera.updateProjectionMatrix();
	renderer.setSize( dim[0], dim[1] );
}
function animate() {
	requestAnimationFrame( animate );
	mesh.rotation.x += 0.005;
	mesh.rotation.y += 0.01;
	renderer.render( scene, camera );
}

```

### Resources
- https://threejs.org/

## Web Audio

### Make Sound
```js
var button = document.createElement('button');
button.innerHTML = 'Make Sound';
button.addEventListener('click', ev => makeSound())
document.querySelector('#ui').appendChild(button);

// get audio context instance
var context = new AudioContext()

function makeSound() {
	// create a new oscillator node and connect it to the context destination
	var oscillator = context.createOscillator()
	oscillator.connect(context.destination)

	// trigger it to start and schedule it to stop after 2 sec
	oscillator.start(context.currentTime)
	oscillator.stop(context.currentTime + 2)
	// disconnect it after 2 sec
	setTimeout(() => oscillator.disconnect(context.destination),2000)
}
```

### Sawtooth A
```js
var button = document.createElement('button');
button.innerHTML = 'Make Sound';
button.addEventListener('click', ev => makeSound())
document.querySelector('#ui').appendChild(button);

// get audio context instance
var context = new AudioContext()

function makeSound() {
	// create a new oscillator node and connect it to the context destination
	var oscillator = context.createOscillator()
	oscillator.connect(context.destination)

	oscillator.type = 'sawtooth'
	oscillator.frequency.value = 880

	// trigger it to start and schedule it to stop after 1 sec
	oscillator.start(context.currentTime)
	oscillator.stop(context.currentTime + 1)
	// disconnect it after 1 sec
	setTimeout(() => oscillator.disconnect(context.destination),1000)
}
```

### A Melody
```js
var button = document.createElement('button');
button.innerHTML = 'Play Melody';
button.addEventListener('click', ev => playMelody())
document.querySelector('#ui').appendChild(button);

// get audio context instance
var context = new AudioContext()

function playMelody() {
	makeSound('C4', 0)
	makeSound('E4', 1)
	makeSound('C4', 2)
	makeSound('E4', 3)
	makeSound('G4', 4)
}

function makeSound(note = 'A4', start = 0) {

	// create a new oscillator node and connect it to the context destination
	var oscillator = context.createOscillator()
	oscillator.connect(context.destination)

	oscillator.type = 'sawtooth'
	oscillator.frequency.value = noteToFrequency(note)

	// trigger it to start and schedule it to stop after 1 sec
	oscillator.start(context.currentTime + start)
	oscillator.stop(context.currentTime + start + 1)
	// disconnect it after 1 sec
	setTimeout(() => oscillator.disconnect(context.destination), (start + 1) * 1000)
}

function noteToFrequency(note) {
	var notes = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];
	var keyNumber;
	var octave;

	if (note.length === 3) {
		octave = note.charAt(2);
	} else {
		octave = note.charAt(1);
	}

	keyNumber = notes.indexOf(note.slice(0, -1));

	if (keyNumber < 3) {
		keyNumber = keyNumber + 12 + ((octave - 1) * 12) + 1;
	} else {
		keyNumber = keyNumber + ((octave - 1) * 12) + 1;
	}

	return 440 * Math.pow(2, (keyNumber - 49) / 12);
}
```

### Keyboard playing
```js
const keys = ['z', 's', 'x', 'd', 'c', 'v', 'g', 'b', 'h', 'n', 'j', 'm'];
const notes = ['C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4'];
document.querySelector('#ui')
	.addEventListener('keyup', ev =>
		ev.key && keys.indexOf(ev.key) > -1
			&& makeSound(notes[keys.indexOf(ev.key)])
	)
document.querySelector('#ui').appendChild(
	document.createElement('textarea')
)

// get audio context instance
var context = new AudioContext()

function makeSound(note = 'A4', start = 0) {

	// create a new oscillator node and connect it to the context destination
	var oscillator = context.createOscillator()
	oscillator.connect(context.destination)

	oscillator.type = 'sawtooth'
	oscillator.frequency.value = noteToFrequency(note)

	// trigger it to start and schedule it to stop after 1 sec
	oscillator.start(context.currentTime + start)
	oscillator.stop(context.currentTime + start + 1)
	// disconnect it after 1 sec
	setTimeout(() => oscillator.disconnect(context.destination), (start + 1) * 1000)
}

function noteToFrequency(note) {
	var notes = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];
	var keyNumber;
	var octave;

	if (note.length === 3) {
		octave = note.charAt(2);
	} else {
		octave = note.charAt(1);
	}

	keyNumber = notes.indexOf(note.slice(0, -1));

	if (keyNumber < 3) {
		keyNumber = keyNumber + 12 + ((octave - 1) * 12) + 1;
	} else {
		keyNumber = keyNumber + ((octave - 1) * 12) + 1;
	}

	return 440 * Math.pow(2, (keyNumber - 49) / 12);
}
```

### Useful Resources
- http://mmckegg.github.io/web-audio-school/
- https://www.webaudioweekly.com/

## Web MIDI

### Basic Interaction
```js

var inputsEl = document.createElement('pre');
inputsEl.innerHTML = 'Inputs:';
document.querySelector('#ui').appendChild(inputsEl);

if (navigator.requestMIDIAccess)
	navigator.requestMIDIAccess().then(onMIDIInit, onMIDIReject)

function numberToNote(number) {
	var notes = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
	var octave = parseInt(number/12, 10);
	var step = number - octave * 12;
	var pitch = notes[step];
	return {pitch: pitch+""+octave, midi: number};
}
function hookUpMIDIInput(midiAccess) {
	let inputs = [];
	midiAccess.inputs.forEach(input => inputs.push(input));
	inputs.forEach(input => {
		input.onmidimessage = MIDIMessageEventHandler
	});
	inputsEl.innerHTML = `Inputs: \n${inputs.map(i => i.name).join('\n')}`;
}
function onMIDIInit(midiAccess) {
	hookUpMIDIInput(midiAccess);
	midiAccess.onstatechange= connection => hookUpMIDIInput(connection.currentTarget);
}
function onMIDIReject(err) {
	alert("The MIDI system failed to start.  You're gonna have a bad time.");
}
function MIDIMessageEventHandler(event) {
	if(event.data[1]){
		var number = event.data[1];
		var note = numberToNote(number);
		switch (event.data[0] & 0xf0) {
			case 0x90:
				if (event.data[2] != 0) {  // if velocity != 0, this is a note-on message
					noteOn(note.pitch, event.data[2]);
					return;
				} else {
					noteOff(note.pitch)
				}
			case 0x80:
				noteOff(note.pitch);
				return;
		}
	}
}

// get audio context instance
var context = context || new AudioContext()

function noteOn(note = 'A4', velocity = 1, start = 0) {
	// create a new oscillator node and connect it to the context destination
	var oscillator = context.createOscillator()
	oscillator.connect(context.destination)

	oscillator.type = 'sawtooth'
	oscillator.frequency.value = noteToFrequency(note)

	// trigger it to start and schedule it to stop after 0.3 sec
	oscillator.start(context.currentTime + start)
	oscillator.stop(context.currentTime + start + 0.3)
	// disconnect it after 0.3 sec
	setTimeout(() => oscillator.disconnect(context.destination), (start + 0.3) * 1000)
}

function noteOff(note) {

}


function noteToFrequency(note) {
	var notes = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];
	var keyNumber;
	var octave;

	if (note.length === 3) {
		octave = note.charAt(2);
	} else {
		octave = note.charAt(1);
	}

	keyNumber = notes.indexOf(note.slice(0, -1));

	if (keyNumber < 3) {
		keyNumber = keyNumber + 12 + ((octave - 1) * 12) + 1;
	} else {
		keyNumber = keyNumber + ((octave - 1) * 12) + 1;
	}

	return 440 * Math.pow(2, (keyNumber - 49) / 12);
}

```

## Examples

### 2D Platformer

### 3rd view runner

### The Jam Station

## Links
- https://fb.com/groups/musictechbg
- https://github.com/alex-milanov
- https://www.wrlds.com/ - bouncing ball with accelerator
- [Background Photo](https://unsplash.com/photos/y3FkHW1cyBE) by Arif Wahid on Unsplash
