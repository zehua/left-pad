'use strict';
var oN = require('./O(n)');
var es6Repeat = require('./es6Repeat');
var current = require('../');

var Benchmark = require('benchmark');

var str = "abcd"
var len = 100;

function buildSuite (note, fns, args) {
  console.log(note);
  var suite = new Benchmark.Suite;

  Object.keys(fns).forEach(function (name) {
    suite.add(name, function () {
      fns[name].apply(null, args);
    });
  });
  suite.on('cycle', function (event) {
    console.log(String(event.target));
  }).on('complete', function () {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
  });

  return suite;
}

function leftPadDirectPrepend (str, len, ch) {
  // convert `str` to `string`
  str = str + '';
  // `len` is the `pad`'s length now
  len = len - str.length;
  // doesn't need to pad
  if (len <= 0) return str;
  // `ch` defaults to `' '`
  if (!ch && ch !== 0) ch = ' ';
  // convert `ch` to `string`
  ch = ch + '';
  // cache common use cases
  if (ch === ' ' && len < 10) return cache[len] + str;
  // loop
  while (true) {
    // add `ch` to `pad` if `len` is odd
    if (len & 1) str = ch + str;
    // devide `len` by 2, ditch the fraction
    len >>= 1;
    // "double" the `ch` so this operation count grows logarithmically on `len`
    // each time `ch` is "doubled", the `len` would need to be "doubled" too
    // similar to finding a value in binary search tree, hence O(log(n))
    if (len) ch += ch;
    // `len` is 0, exit the loop
    else break;
  }
  //str[0]; // v8 string uses cons, indexing forces it to flatten it to be fair
  return str;
}

function leftPadWhileLen (str, len, ch) {
  // convert `str` to `string`
  str = str + '';
  // `len` is the `pad`'s length now
  len = len - str.length;
  // doesn't need to pad
  if (len <= 0) return str;
  // `ch` defaults to `' '`
  if (!ch && ch !== 0) ch = ' ';
  // convert `ch` to `string`
  ch = ch + '';
  // cache common use cases
  if (ch === ' ' && len < 10) return cache[len] + str;
  // loop
  while (len) {
    // add `ch` to `pad` if `len` is odd
    if (len & 1) str = ch + str;
    // devide `len` by 2, ditch the fraction
    len >>= 1;
    // "double" the `ch` so this operation count grows logarithmically on `len`
    // each time `ch` is "doubled", the `len` would need to be "doubled" too
    // similar to finding a value in binary search tree, hence O(log(n))
    ch += ch;
  }
  //str[0]; // v8 string uses cons, indexing forces it to flatten it to be fair
  return str;
}

function leftPadWhileLenTuned (str, len, ch) {
  // convert `str` to `string`
  str = str + '';
  // `len` is the `pad`'s length now
  len = len - str.length;
  // doesn't need to pad
  if (len <= 0) return str;
  // `ch` defaults to `' '`
  if (!ch && ch !== 0) ch = ' ';
  // convert `ch` to `string`
  ch = ch + '';
  // cache common use cases
  if (ch === ' ' && len < 10) return cache[len] + str;
  // loop
  if (len & 1) str = ch + str;
  len >>= 1;
  while (len) {
    // "double" the `ch` so this operation count grows logarithmically on `len`
    // each time `ch` is "doubled", the `len` would need to be "doubled" too
    // similar to finding a value in binary search tree, hence O(log(n))
    ch += ch;
    // add `ch` to `pad` if `len` is odd
    if (len & 1) str = ch + str;
    // devide `len` by 2, ditch the fraction
    len >>= 1;
  }
  return str;
}

var fns = {
  //'O(n)': oN,
  'Current': current,
  'Prepend': leftPadDirectPrepend,
  'Len    ': leftPadWhileLen,
  'LenOpt ': leftPadWhileLenTuned
};

buildSuite('-> pad 100 spaces to str of len 4', fns, ['abcd', 104, ' ']).run();
buildSuite('-> pad 100 spaces to str of len 4', fns, ['abcd', 104, ' ']).run();
buildSuite('-> pad 10 spaces to str of len 4', fns, ['abcd', 14,  ' ']).run();
//buildSuite('-> pad 9 spaces to str of len 4', fns, ['abcd', 13,  ' ']).run();
buildSuite('-> pad 100 to str of len 100', fns, ['0012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789123456789', 200, ' ']).run();
buildSuite('-> pad 10 to str of len 100', fns, ['0012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789123456789', 110, ' ']).run();
//buildSuite('-> pad 9 to str of len 100', fns, ['0012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789123456789', 109, ' ']).run();
