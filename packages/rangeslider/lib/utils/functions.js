'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * Create a random uuid
 */
var uuid = exports.uuid = function uuid() {
  var s4 = function s4() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  };
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
};

/**
 * Delays a function for the given number of milliseconds, and then calls
 * it with the arguments supplied.
 *
 * @param  {Function} fn   function
 * @param  {Number}   wait delay
 * @param  {Number}   args arguments
 * @return {Function}
 */
var delay = exports.delay = function delay(fn, wait) {
  for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    args[_key - 2] = arguments[_key];
  }

  return setTimeout(function () {
    return fn.apply(null, args);
  }, wait);
};

/**
 * Returns a debounced function that will make sure the given
 * function is not triggered too much.
 *
 * @param  {Function} fn Function to debounce.
 * @param  {Number}   debounceDuration OPTIONAL. The amount of time in milliseconds for which we will debounce the
 *         function. (defaults to 100ms)
 * @return {Function}
 */
var debounce = exports.debounce = function debounce(fn) {
  var debounceDuration = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 100;
  return function () {
    for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    if (!fn.debouncing) {
      fn.lastReturnVal = fn.apply(window, args);
      fn.debouncing = true;
    }
    clearTimeout(fn.debounceTimeout);
    fn.debounceTimeout = setTimeout(function () {
      fn.debouncing = false;
    }, debounceDuration);
    return fn.lastReturnVal;
  };
};

var isString = exports.isString = function isString(obj) {
  return obj === '' + obj;
};

var isArray = exports.isArray = function isArray(obj) {
  return Object.prototype.toString.call(obj) === '[object Array]';
};

var isNumberLike = exports.isNumberLike = function isNumberLike(obj) {
  return obj !== null && obj !== undefined && (isString(obj) && isFinite(parseFloat(obj)) || isFinite(obj));
};

var getFirsNumberLike = exports.getFirsNumberLike = function getFirsNumberLike() {
  for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
    args[_key3] = arguments[_key3];
  }

  if (!args.length) {
    return null;
  }

  for (var i = 0, len = args.length; i < len; i++) {
    if (isNumberLike(args[i])) {
      return args[i];
    }
  }

  return null;
};

var isObject = exports.isObject = function isObject(obj) {
  return Object.prototype.toString.call(obj) === '[object Object]';
};

var simpleExtend = exports.simpleExtend = function simpleExtend(defaultOpt, options) {
  var opt = {};

  for (var key in defaultOpt) {
    opt[key] = defaultOpt[key];
  }
  for (var _key4 in options) {
    opt[_key4] = options[_key4];
  }

  return opt;
};

var between = exports.between = function between(pos, min, max) {
  if (pos < min) {
    return min;
  }
  if (pos > max) {
    return max;
  }
  return pos;
};