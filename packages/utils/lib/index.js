'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * Return next multiple of given integer
 */

var nextMultiple = exports.nextMultiple = function nextMultiple() {
  var n = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
  var m = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 10;

  if (n % m === 0 || n === 0) return n + m;
  return Math.ceil(n / m) * m;
};

var formatCredit = exports.formatCredit = function formatCredit(tokens) {
  return (tokens / 1000).toFixed(4);
};

var range = exports.range = function range(start, end) {
  var step = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;

  var allNumbers = [start, end, step].every(Number.isFinite);

  if (!allNumbers) {
    throw new TypeError('range() expects only finite numbers as arguments.');
  }

  if (step <= 0) {
    throw new Error('step must be a number greater than 0.');
  }

  if (start > end) {
    step = -step;
  }

  var length = Math.floor(Math.abs((end - start) / step)) + 1;

  return Array.from(Array(length), function (x, index) {
    return start + index * step;
  });
};