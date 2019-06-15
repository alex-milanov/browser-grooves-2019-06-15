# Browser grooves
a Brief introduction to **WebAudio** and **WebMIDI** APIs

## Motivation

### Music Tech Meetups
[![music-tech-meetup-2019-06-11](./assets/img/music-tech-meetup-2019-06-11.png)](./assets/videos/music-tech-meetup-2019-06-11.mp4)

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

## Web Audio
![patchage](./assets/img/patchage.jpeg)

### The Context
![oscillator-basic](./assets/svg/audiocontext.svg)

-

`var context = new AudioContext();`

### Some Oscillation
![oscillator-basic](./assets/svg/oscillator-basic.svg)

-

`var oscillator = context.createOscillator();`

`oscillator.connect(context.destination);`


### Make some noise
![oscillator-basic](./assets/svg/oscillator-basic.svg)

```js
// get audio context instance
var context = new AudioContext()

function makeSound() {
	// create a new oscillator node and connect it to the context destination
	var oscillator = context.createOscillator()
	oscillator.connect(context.destination)

	// trigger it to start and schedule it to stop after 2 sec
	oscillator.start(context.currentTime)
	oscillator.stop(context.currentTime + 2)
	// disconnect it also after 2 sec
	setTimeout(() => oscillator.disconnect(context.destination),2000)
}

// some ui
var button = document.createElement('button');
button.innerHTML = 'Make Sound';
button.addEventListener('click', ev => makeSound())
document.querySelector('#ui').appendChild(button);
```

### hmm...
![oscillator-basic](./assets/svg/oscillator-basic.svg)
```js
// get audio context instance
var context = new AudioContext()

function makeSound() {
	// create a new oscillator node and connect it to the context destination
	var oscillator = context.createOscillator()
	oscillator.connect(context.destination)

	// set the type to sawtooth wave
	oscillator.type = 'sawtooth'
	// set the frequency to 880Hz
	oscillator.frequency.value = 880

	// trigger it to start and schedule it to stop after 1 sec
	oscillator.start(context.currentTime)
	oscillator.stop(context.currentTime + 1)
	// disconnect it after 1 sec
	setTimeout(() => oscillator.disconnect(context.destination),1000)
}

// some ui
var button = document.createElement('button');
button.innerHTML = 'Make Sound';
button.addEventListener('click', ev => makeSound())
document.querySelector('#ui').appendChild(button);
```

### Mega Gain
![oscillator-basic](./assets/svg/gain.svg)

-

`var volume = context.createGain()`

`volume.gain.value = 0.4`

`volume.connect(context.destination)`

### Volume Control
![oscillator-basic](./assets/svg/gain.svg)
```js
// get audio context instance
var context = new AudioContext();
// create a gain node to control volume
var volume = context.createGain();
volume.gain.value = 0.4;
volume.connect(context.destination);

function changeVolume(value) {
	volume.gain.value = value;
}

function makeSound() {
	// create a new oscillator node and connect it to the context destination
	var oscillator = context.createOscillator();
	oscillator.connect(volume);

	// set the type to sawtooth wave
	oscillator.type = 'sawtooth';
	// set the frequency to 880Hz
	oscillator.frequency.value = 880;

	// trigger it to start and schedule it to stop after 1 sec
	oscillator.start(context.currentTime);
	oscillator.stop(context.currentTime + 1);
	// disconnect it after 1 sec
	setTimeout(() => oscillator.disconnect(context.destination),1000);
}

// some ui
var button = document.createElement('button');
button.innerHTML = 'Make Sound';
button.addEventListener('click', ev => makeSound());
document.querySelector('#ui').appendChild(button);
// volume control
var slider = document.createElement('input');
slider.type = 'range';
slider.min = 0;
slider.max = 1;
slider.step = 0.1;
slider.value = volume.gain.value;
slider.addEventListener('change', ev => changeVolume(ev.target.value))
document.querySelector('#ui').appendChild(slider);
```

### cheezy melody

```js

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

// ui
var button = document.createElement('button');
button.innerHTML = 'Play Melody';
button.addEventListener('click', ev => playMelody())
document.querySelector('#ui').appendChild(button);
```

### Useful Resources
- http://mmckegg.github.io/web-audio-school/
- http://g200kg.github.io/WebAudioDesigner/
- https://www.webaudioweekly.com/


## Web MIDI
![midi-setup](./assets/img/midi-setup.jpg)

### MIDI
[![midi-desc](./assets/img/midi-desc.png)](https://en.wikipedia.org/wiki/MIDI)
- technical standard from early 80s
- communications protocol, digital interface & electrical connectors
- (not the piano roll editor)

### General MIDI
[![general-midi](./assets/img/general-midi.png)](https://en.wikipedia.org/wiki/General_MIDI)
- standardized specification for
- electronic musical instruments that respond to MIDI messages
- extensions: Yamaha XG, Roland GS

### MIDI Message
[![midi-message](./assets/img/midi-message.png)](https://www.midi.org/specifications-old/item/table-1-summary-of-midi-message)
- 3 8bit words (bytes) transmitted serially at a rate of 31.25 kbit/s
- 1 status and 2 data bytes
- channel voice: noteOn/noteOff, control change, program change
- channel mode, system common, system real-time


### Code Example
```js
// request midi access
if (navigator.requestMIDIAccess)
	navigator.requestMIDIAccess().then(onMIDIInit, onMIDIReject)

function onMIDIInit(midiAccess) {
	hookUpMIDIInput(midiAccess);
	midiAccess.onstatechange= connection => hookUpMIDIInput(connection.currentTarget);
}

function onMIDIReject(err) {
	alert("The MIDI system failed to start.  You're gonna have a bad time.");
}

function hookUpMIDIInput(midiAccess) {
	let inputs = [];
	// push the inputs in array
	midiAccess.inputs.forEach(input => inputs.push(input));
	// hook midi messages
	inputs.forEach(input => {
		input.onmidimessage = MIDIMessageEventHandler
	});
	// display inputs
	inputsEl.innerHTML = `Inputs: \n${inputs.map(i => i.name).join('\n')}`;
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

function numberToNote(number) {
	var notes = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
	var octave = parseInt(number/12, 10);
	var step = number - octave * 12;
	var pitch = notes[step];
	return {pitch: pitch+""+octave, midi: number};
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

// ui
var inputsEl = document.createElement('pre');
inputsEl.innerHTML = 'Inputs:';
document.querySelector('#ui').appendChild(inputsEl);

```

### Links and Resources
- https://en.wikipedia.org/wiki/MIDI
- https://www.midi.org/specifications-old/
- [Youtube: The Basics of MIDI Playlist](https://www.youtube.com/watch?v=HaSkpYXAVBM&list=PLkX4vguQdLMiE1ya62wVb45A_gSegBQmc&index=1)


### Wall of shame
- [Bug 836897 (webmidi) Implement the WebMIDI API](https://bugzilla.mozilla.org/show_bug.cgi?id=836897)
- Bugzilla: Opened	7 years ago

## Apps

### The Jam Station
![jam-station](./assets/img/jam-station.png)

### The Jam Station
- Web Based DAW with **WebAudio**, **WebMIDI**, **GamepadAPI** ...
- includes a Modular Synth and a Beat Sequencer
- ... Session Manager and MIDI Routing
- https://github.com/alex-milanov/jam-station
- https://alex-milanov.github.io/jam-station
- https://www.youtube.com/watch?v=J-ShH4g7hWM - at Open Fest 2018

### JS Loop Station
![jam-station](./assets/img/js-loop-station.png)

### JS Loop Station
- Web Based Looper app
- Inspiration from Boss/Roland's RC505 Loopstation
- **WebAudio**, **WebMIDI**, Audio Recording and manipulation
- https://github.com/alex-milanov/js-loop-station
- https://alex-milanov.github.io/js-loop-station/dist

### xAmplR
![jam-station](./assets/img/xamplr.png)

### xAmplR
- Web based Sampling and Drumpad App, reminiscent of Akai MPC
- Uses AudioCommons API to search freesound and other CC sample sources
- Won a price at last years Music Hackathon at Abbey Road Studios
- https://github.com/alex-milanov/xAmplR
- https://alex-milanov.github.io/xAmplR/dist/

## Other Examples
- https://webaudiodemos.appspot.com/
- http://nicroto.github.io/viktor/
- https://io808.com/
- https://www.webaudiomodules.org/wamsynths/dexed

## Links

### Me
- http://alexmilanov.com - not touched since 2015
- https://github.com/alex-milanov
- https://gitlab.com/alex-milanov
- [https://twitter.com/alex_milanov_](https://twitter.com/alex_milanov_)

### MusicTechBG
- https://fb.com/groups/musictechbg
- http://t.me/musictechbg
- https://www.meetup.com/MusicTechBG/
- http://musictech.bg - soon(ish)

### Graphics
- [Background Photo](https://unsplash.com/photos/HwFv8EZYC_o) by Manuel Sardo on Unsplash

## Next
![MusicTechMeetupVarna](./assets/img/MusicTechMeetupVarna.png)
- 18.06 19:30 Music Tech Meetup | Varna vol2
- https://www.facebook.com/events/461877467905846/
