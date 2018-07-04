
const indexOf = (arr, key) => Array.from(arr).indexOf(key);
const forEach = (arr, fn) => Array.from(arr).forEach(fn);

const defineProp = (function() {
	try {
		Object.defineProperty({}, '_', {});
		return function(obj, name, value) {
			Object.defineProperty(obj, name, {
				writable: true,
				enumerable: false,
				configurable: true,
				value: value
			});
		};
	} catch (e) {
		return function(obj, name, value) {
			obj[name] = value;
		};
	}
})();

var globals = ['Array', 'Boolean', 'Date', 'Error', 'EvalError', 'Function',
	'Infinity', 'JSON', 'Math', 'NaN', 'Number', 'Object', 'RangeError',
	'ReferenceError', 'RegExp', 'String', 'SyntaxError', 'TypeError', 'URIError',
	'decodeURI', 'decodeURIComponent', 'encodeURI', 'encodeURIComponent', 'escape',
	'eval', 'isFinite', 'isNaN', 'parseFloat', 'parseInt', 'undefined', 'unescape'];

function Context() {}
Context.prototype = {};

var Script = exports.Script = function NodeScript(code) {
	if (!(this instanceof Script)) return new Script(code);
	this.code = code;
};

Script.prototype.runInContext = function(context) {
	if (!(context instanceof Context)) {
		throw new TypeError("needs a 'context' argument.");
	}

	var iframe = document.createElement('iframe');
	if (!iframe.style) iframe.style = {};
	iframe.style.display = 'none';

	document.body.appendChild(iframe);

	var win = iframe.contentWindow;
	var wEval = win.eval;
	var wExecScript = win.execScript;

	if (!wEval && wExecScript) {
		// win.eval() magically appears when this is called in IE:
		wExecScript.call(win, 'null');
		wEval = win.eval;
	}

	forEach(Object.keys(context), function(key) {
		win[key] = context[key];
	});

	forEach(globals, function(key) {
		if (context[key]) {
			win[key] = context[key];
		}
	});

	var winKeys = Object.keys(win);

	var res = wEval.call(win, this.code);

	forEach(Object.keys(win), function(key) {
		// Avoid copying circular objects like `top` and `window` by only
		// updating existing context properties or new properties in the `win`
		// that was only introduced after the eval.
		if (key in context || indexOf(winKeys, key) === -1) {
			context[key] = win[key];
		}
	});

	forEach(globals, function(key) {
		if (!(key in context)) {
			defineProp(context, key, win[key]);
		}
	});

	document.body.removeChild(iframe);

	return res;
};

/*
Script.prototype.runInThisContext = function() {
	return eval(this.code); // maybe...
};
*/

Script.prototype.runInNewContext = function(context) {
	var ctx = Script.createContext(context);
	var res = this.runInContext(ctx);

	forEach(Object.keys(ctx), function(key) {
		context[key] = ctx[key];
	});

	return res;
};

Script.prototype.runInIFrame = function(iframe, context) {
	var win = iframe.contentWindow;
	var wEval = win.eval;
	var wExecScript = win.execScript;

	if (!wEval && wExecScript) {
		// win.eval() magically appears when this is called in IE:
		wExecScript.call(win, 'null');
		wEval = win.eval;
	}

	forEach(Object.keys(context), function(key) {
		win[key] = context[key];
	});

	forEach(globals, function(key) {
		if (context[key]) {
			win[key] = context[key];
		}
	});

	var winKeys = Object.keys(win);

	var res = wEval.call(win, this.code);

	forEach(Object.keys(win), function(key) {
		// Avoid copying circular objects like `top` and `window` by only
		// updating existing context properties or new properties in the `win`
		// that was only introduced after the eval.
		if (key in context || indexOf(winKeys, key) === -1) {
			context[key] = win[key];
		}
	});

	forEach(globals, function(key) {
		if (!(key in context)) {
			defineProp(context, key, win[key]);
		}
	});

	return res;
};

forEach(Object.keys(Script.prototype), function(name) {
	exports[name] = Script[name] = function(code) {
		var s = new Script(code);
		return s[name].apply(s, [].slice.call(arguments, 1));
	};
});

exports.createScript = function(code) {
	return new exports.Script(code);
};

exports.createContext = Script.createContext = function(context) {
	var copy = new Context();
	if (typeof context === 'object') {
		forEach(Object.keys(context), function(key) {
			copy[key] = context[key];
		});
	}
	return copy;
};
