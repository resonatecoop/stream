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

var calculateCost = exports.calculateCost = function calculateCost(count) {
  if (count > 8) {
    return 0;
  }
  for (var cost = 2, i = 0; i < count;) {
    cost *= 2;
    i++;
  }
  return cost;
};

var calculateRemainingCost = exports.calculateRemainingCost = function calculateRemainingCost(count) {
  if (count > 8) {
    return 0;
  }
  for (var cost = 0, i = 0; i < count;) {
    cost += calculateCost(i);
    i++;
  }
  return 1022 - cost;
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