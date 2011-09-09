
//     Underscore.js 1.1.7
//     (c) 2011 Jeremy Ashkenas, DocumentCloud Inc.
//     Underscore is freely distributable under the MIT license.
//     Portions of Underscore are inspired or borrowed from Prototype,
//     Oliver Steele's Functional, and John Resig's Micro-Templating.
//     For all details and documentation:
//     http://documentcloud.github.com/underscore

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `global` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Establish the object that gets returned to break out of a loop iteration.
  var breaker = {};

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var slice            = ArrayProto.slice,
      unshift          = ArrayProto.unshift,
      toString         = ObjProto.toString,
      hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeForEach      = ArrayProto.forEach,
    nativeMap          = ArrayProto.map,
    nativeReduce       = ArrayProto.reduce,
    nativeReduceRight  = ArrayProto.reduceRight,
    nativeFilter       = ArrayProto.filter,
    nativeEvery        = ArrayProto.every,
    nativeSome         = ArrayProto.some,
    nativeIndexOf      = ArrayProto.indexOf,
    nativeLastIndexOf  = ArrayProto.lastIndexOf,
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind;

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) { return new wrapper(obj); };

  // Export the Underscore object for **CommonJS**, with backwards-compatibility
  // for the old `require()` API. If we're not in CommonJS, add `_` to the
  // global object.
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = _;
    _._ = _;
  } else {
    // Exported as a string, for Closure Compiler "advanced" mode.
    root['_'] = _;
  }

  // Current version.
  _.VERSION = '1.1.7';

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles objects with the built-in `forEach`, arrays, and raw objects.
  // Delegates to **ECMAScript 5**'s native `forEach` if available.
  var each = _.each = _.forEach = function(obj, iterator, context) {
    if (obj == null) return;
    if (nativeForEach && obj.forEach === nativeForEach) {
      obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
      for (var i = 0, l = obj.length; i < l; i++) {
        if (i in obj && iterator.call(context, obj[i], i, obj) === breaker) return;
      }
    } else {
      for (var key in obj) {
        if (hasOwnProperty.call(obj, key)) {
          if (iterator.call(context, obj[key], key, obj) === breaker) return;
        }
      }
    }
  };

  // Return the results of applying the iterator to each element.
  // Delegates to **ECMAScript 5**'s native `map` if available.
  _.map = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
    each(obj, function(value, index, list) {
      results[results.length] = iterator.call(context, value, index, list);
    });
    return results;
  };

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`. Delegates to **ECMAScript 5**'s native `reduce` if available.
  _.reduce = _.foldl = _.inject = function(obj, iterator, memo, context) {
    var initial = memo !== void 0;
    if (obj == null) obj = [];
    if (nativeReduce && obj.reduce === nativeReduce) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
    }
    each(obj, function(value, index, list) {
      if (!initial) {
        memo = value;
        initial = true;
      } else {
        memo = iterator.call(context, memo, value, index, list);
      }
    });
    if (!initial) throw new TypeError("Reduce of empty array with no initial value");
    return memo;
  };

  // The right-associative version of reduce, also known as `foldr`.
  // Delegates to **ECMAScript 5**'s native `reduceRight` if available.
  _.reduceRight = _.foldr = function(obj, iterator, memo, context) {
    if (obj == null) obj = [];
    if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
      if (context) iterator = _.bind(iterator, context);
      return memo !== void 0 ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);
    }
    var reversed = (_.isArray(obj) ? obj.slice() : _.toArray(obj)).reverse();
    return _.reduce(reversed, iterator, memo, context);
  };

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, iterator, context) {
    var result;
    any(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) {
        result = value;
        return true;
      }
    });
    return result;
  };

  // Return all the elements that pass a truth test.
  // Delegates to **ECMAScript 5**'s native `filter` if available.
  // Aliased as `select`.
  _.filter = _.select = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeFilter && obj.filter === nativeFilter) return obj.filter(iterator, context);
    each(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) results[results.length] = value;
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    each(obj, function(value, index, list) {
      if (!iterator.call(context, value, index, list)) results[results.length] = value;
    });
    return results;
  };

  // Determine whether all of the elements match a truth test.
  // Delegates to **ECMAScript 5**'s native `every` if available.
  // Aliased as `all`.
  _.every = _.all = function(obj, iterator, context) {
    var result = true;
    if (obj == null) return result;
    if (nativeEvery && obj.every === nativeEvery) return obj.every(iterator, context);
    each(obj, function(value, index, list) {
      if (!(result = result && iterator.call(context, value, index, list))) return breaker;
    });
    return result;
  };

  // Determine if at least one element in the object matches a truth test.
  // Delegates to **ECMAScript 5**'s native `some` if available.
  // Aliased as `any`.
  var any = _.some = _.any = function(obj, iterator, context) {
    iterator = iterator || _.identity;
    var result = false;
    if (obj == null) return result;
    if (nativeSome && obj.some === nativeSome) return obj.some(iterator, context);
    each(obj, function(value, index, list) {
      if (result |= iterator.call(context, value, index, list)) return breaker;
    });
    return !!result;
  };

  // Determine if a given value is included in the array or object using `===`.
  // Aliased as `contains`.
  _.include = _.contains = function(obj, target) {
    var found = false;
    if (obj == null) return found;
    if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
    any(obj, function(value) {
      if (found = value === target) return true;
    });
    return found;
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    return _.map(obj, function(value) {
      return (method.call ? method || value : value[method]).apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, function(value){ return value[key]; });
  };

  // Return the maximum element or (element-based computation).
  _.max = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj)) return Math.max.apply(Math, obj);
    var result = {computed : -Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed >= result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj)) return Math.min.apply(Math, obj);
    var result = {computed : Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed < result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Sort the object's values by a criterion produced by an iterator.
  _.sortBy = function(obj, iterator, context) {
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value : value,
        criteria : iterator.call(context, value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria, b = right.criteria;
      return a < b ? -1 : a > b ? 1 : 0;
    }), 'value');
  };

  // Groups the object's values by a criterion produced by an iterator
  _.groupBy = function(obj, iterator) {
    var result = {};
    each(obj, function(value, index) {
      var key = iterator(value, index);
      (result[key] || (result[key] = [])).push(value);
    });
    return result;
  };

  // Use a comparator function to figure out at what index an object should
  // be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iterator) {
    iterator || (iterator = _.identity);
    var low = 0, high = array.length;
    while (low < high) {
      var mid = (low + high) >> 1;
      iterator(array[mid]) < iterator(obj) ? low = mid + 1 : high = mid;
    }
    return low;
  };

  // Safely convert anything iterable into a real, live array.
  _.toArray = function(iterable) {
    if (!iterable)                return [];
    if (iterable.toArray)         return iterable.toArray();
    if (_.isArray(iterable))      return slice.call(iterable);
    if (_.isArguments(iterable))  return slice.call(iterable);
    return _.values(iterable);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    return _.toArray(obj).length;
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head`. The **guard** check allows it to work
  // with `_.map`.
  _.first = _.head = function(array, n, guard) {
    return (n != null) && !guard ? slice.call(array, 0, n) : array[0];
  };

  // Returns everything but the first entry of the array. Aliased as `tail`.
  // Especially useful on the arguments object. Passing an **index** will return
  // the rest of the values in the array from that index onward. The **guard**
  // check allows it to work with `_.map`.
  _.rest = _.tail = function(array, index, guard) {
    return slice.call(array, (index == null) || guard ? 1 : index);
  };

  // Get the last element of an array.
  _.last = function(array) {
    return array[array.length - 1];
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, function(value){ return !!value; });
  };

  // Return a completely flattened version of an array.
  _.flatten = function(array) {
    return _.reduce(array, function(memo, value) {
      if (_.isArray(value)) return memo.concat(_.flatten(value));
      memo[memo.length] = value;
      return memo;
    }, []);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted) {
    return _.reduce(array, function(memo, el, i) {
      if (0 == i || (isSorted === true ? _.last(memo) != el : !_.include(memo, el))) memo[memo.length] = el;
      return memo;
    }, []);
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(_.flatten(arguments));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays. (Aliased as "intersect" for back-compat.)
  _.intersection = _.intersect = function(array) {
    var rest = slice.call(arguments, 1);
    return _.filter(_.uniq(array), function(item) {
      return _.every(rest, function(other) {
        return _.indexOf(other, item) >= 0;
      });
    });
  };

  // Take the difference between one array and another.
  // Only the elements present in just the first array will remain.
  _.difference = function(array, other) {
    return _.filter(array, function(value){ return !_.include(other, value); });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    var args = slice.call(arguments);
    var length = _.max(_.pluck(args, 'length'));
    var results = new Array(length);
    for (var i = 0; i < length; i++) results[i] = _.pluck(args, "" + i);
    return results;
  };

  // If the browser doesn't supply us with indexOf (I'm looking at you, **MSIE**),
  // we need this function. Return the position of the first occurrence of an
  // item in an array, or -1 if the item is not included in the array.
  // Delegates to **ECMAScript 5**'s native `indexOf` if available.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = function(array, item, isSorted) {
    if (array == null) return -1;
    var i, l;
    if (isSorted) {
      i = _.sortedIndex(array, item);
      return array[i] === item ? i : -1;
    }
    if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item);
    for (i = 0, l = array.length; i < l; i++) if (array[i] === item) return i;
    return -1;
  };


  // Delegates to **ECMAScript 5**'s native `lastIndexOf` if available.
  _.lastIndexOf = function(array, item) {
    if (array == null) return -1;
    if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) return array.lastIndexOf(item);
    var i = array.length;
    while (i--) if (array[i] === item) return i;
    return -1;
  };

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (arguments.length <= 1) {
      stop = start || 0;
      start = 0;
    }
    step = arguments[2] || 1;

    var len = Math.max(Math.ceil((stop - start) / step), 0);
    var idx = 0;
    var range = new Array(len);

    while(idx < len) {
      range[idx++] = start;
      start += step;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Binding with arguments is also known as `curry`.
  // Delegates to **ECMAScript 5**'s native `Function.bind` if available.
  // We check for `func.bind` first, to fail fast when `func` is undefined.
  _.bind = function(func, obj) {
    if (func.bind === nativeBind && nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    var args = slice.call(arguments, 2);
    return function() {
      return func.apply(obj, args.concat(slice.call(arguments)));
    };
  };

  // Bind all of an object's methods to that object. Useful for ensuring that
  // all callbacks defined on an object belong to it.
  _.bindAll = function(obj) {
    var funcs = slice.call(arguments, 1);
    if (funcs.length == 0) funcs = _.functions(obj);
    each(funcs, function(f) { obj[f] = _.bind(obj[f], obj); });
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memo = {};
    hasher || (hasher = _.identity);
    return function() {
      var key = hasher.apply(this, arguments);
      return hasOwnProperty.call(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments));
    };
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){ return func.apply(func, args); }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = function(func) {
    return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
  };

  // Internal function used to implement `_.throttle` and `_.debounce`.
  var limit = function(func, wait, debounce) {
    var timeout;
    return function() {
      var context = this, args = arguments;
      var throttler = function() {
        timeout = null;
        func.apply(context, args);
      };
      if (debounce) clearTimeout(timeout);
      if (debounce || !timeout) timeout = setTimeout(throttler, wait);
    };
  };

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time.
  _.throttle = function(func, wait) {
    return limit(func, wait, false);
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds.
  _.debounce = function(func, wait) {
    return limit(func, wait, true);
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = function(func) {
    var ran = false, memo;
    return function() {
      if (ran) return memo;
      ran = true;
      return memo = func.apply(this, arguments);
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return function() {
      var args = [func].concat(slice.call(arguments));
      return wrapper.apply(this, args);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var funcs = slice.call(arguments);
    return function() {
      var args = slice.call(arguments);
      for (var i = funcs.length - 1; i >= 0; i--) {
        args = [funcs[i].apply(this, args)];
      }
      return args[0];
    };
  };

  // Returns a function that will only be executed after being called N times.
  _.after = function(times, func) {
    return function() {
      if (--times < 1) { return func.apply(this, arguments); }
    };
  };


  // Object Functions
  // ----------------

  // Retrieve the names of an object's properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = nativeKeys || function(obj) {
    if (obj !== Object(obj)) throw new TypeError('Invalid object');
    var keys = [];
    for (var key in obj) if (hasOwnProperty.call(obj, key)) keys[keys.length] = key;
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    return _.map(obj, _.identity);
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      for (var prop in source) {
        if (source[prop] !== void 0) obj[prop] = source[prop];
      }
    });
    return obj;
  };

  // Fill in a given object with default properties.
  _.defaults = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      for (var prop in source) {
        if (obj[prop] == null) obj[prop] = source[prop];
      }
    });
    return obj;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    // Check object identity.
    if (a === b) return true;
    // Different types?
    var atype = typeof(a), btype = typeof(b);
    if (atype != btype) return false;
    // Basic equality test (watch out for coercions).
    if (a == b) return true;
    // One is falsy and the other truthy.
    if ((!a && b) || (a && !b)) return false;
    // Unwrap any wrapped objects.
    if (a._chain) a = a._wrapped;
    if (b._chain) b = b._wrapped;
    // One of them implements an isEqual()?
    if (a.isEqual) return a.isEqual(b);
    if (b.isEqual) return b.isEqual(a);
    // Check dates' integer values.
    if (_.isDate(a) && _.isDate(b)) return a.getTime() === b.getTime();
    // Both are NaN?
    if (_.isNaN(a) && _.isNaN(b)) return false;
    // Compare regular expressions.
    if (_.isRegExp(a) && _.isRegExp(b))
      return a.source     === b.source &&
             a.global     === b.global &&
             a.ignoreCase === b.ignoreCase &&
             a.multiline  === b.multiline;
    // If a is not an object by this point, we can't handle it.
    if (atype !== 'object') return false;
    // Check for different array lengths before comparing contents.
    if (a.length && (a.length !== b.length)) return false;
    // Nothing else worked, deep compare the contents.
    var aKeys = _.keys(a), bKeys = _.keys(b);
    // Different object sizes?
    if (aKeys.length != bKeys.length) return false;
    // Recursive comparison of contents.
    for (var key in a) if (!(key in b) || !_.isEqual(a[key], b[key])) return false;
    return true;
  };

  // Is a given array or object empty?
  _.isEmpty = function(obj) {
    if (_.isArray(obj) || _.isString(obj)) return obj.length === 0;
    for (var key in obj) if (hasOwnProperty.call(obj, key)) return false;
    return true;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType == 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) === '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    return obj === Object(obj);
  };

  // Is a given variable an arguments object?
  _.isArguments = function(obj) {
    return !!(obj && hasOwnProperty.call(obj, 'callee'));
  };

  // Is a given value a function?
  _.isFunction = function(obj) {
    return !!(obj && obj.constructor && obj.call && obj.apply);
  };

  // Is a given value a string?
  _.isString = function(obj) {
    return !!(obj === '' || (obj && obj.charCodeAt && obj.substr));
  };

  // Is a given value a number?
  _.isNumber = function(obj) {
    return !!(obj === 0 || (obj && obj.toExponential && obj.toFixed));
  };

  // Is the given value `NaN`? `NaN` happens to be the only value in JavaScript
  // that does not equal itself.
  _.isNaN = function(obj) {
    return obj !== obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false;
  };

  // Is a given value a date?
  _.isDate = function(obj) {
    return !!(obj && obj.getTimezoneOffset && obj.setUTCFullYear);
  };

  // Is the given value a regular expression?
  _.isRegExp = function(obj) {
    return !!(obj && obj.test && obj.exec && (obj.ignoreCase || obj.ignoreCase === false));
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iterators.
  _.identity = function(value) {
    return value;
  };

  // Run a function **n** times.
  _.times = function (n, iterator, context) {
    for (var i = 0; i < n; i++) iterator.call(context, i);
  };

  // Add your own custom functions to the Underscore object, ensuring that
  // they're correctly added to the OOP wrapper as well.
  _.mixin = function(obj) {
    each(_.functions(obj), function(name){
      addToWrapper(name, _[name] = obj[name]);
    });
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = idCounter++;
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g
  };

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  _.template = function(str, data) {
    var c  = _.templateSettings;
    var tmpl = 'var __p=[],print=function(){__p.push.apply(__p,arguments);};' +
      'with(obj||{}){__p.push(\'' +
      str.replace(/\\/g, '\\\\')
         .replace(/'/g, "\\'")
         .replace(c.interpolate, function(match, code) {
           return "'," + code.replace(/\\'/g, "'") + ",'";
         })
         .replace(c.evaluate || null, function(match, code) {
           return "');" + code.replace(/\\'/g, "'")
                              .replace(/[\r\n\t]/g, ' ') + "__p.push('";
         })
         .replace(/\r/g, '\\r')
         .replace(/\n/g, '\\n')
         .replace(/\t/g, '\\t')
         + "');}return __p.join('');";
    var func = new Function('obj', tmpl);
    return data ? func(data) : func;
  };

  // The OOP Wrapper
  // ---------------

  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.
  var wrapper = function(obj) { this._wrapped = obj; };

  // Expose `wrapper.prototype` as `_.prototype`
  _.prototype = wrapper.prototype;

  // Helper function to continue chaining intermediate results.
  var result = function(obj, chain) {
    return chain ? _(obj).chain() : obj;
  };

  // A method to easily add functions to the OOP wrapper.
  var addToWrapper = function(name, func) {
    wrapper.prototype[name] = function() {
      var args = slice.call(arguments);
      unshift.call(args, this._wrapped);
      return result(func.apply(_, args), this._chain);
    };
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    wrapper.prototype[name] = function() {
      method.apply(this._wrapped, arguments);
      return result(this._wrapped, this._chain);
    };
  });

  // Add all accessor Array functions to the wrapper.
  each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    wrapper.prototype[name] = function() {
      return result(method.apply(this._wrapped, arguments), this._chain);
    };
  });

  // Start chaining a wrapped Underscore object.
  wrapper.prototype.chain = function() {
    this._chain = true;
    return this;
  };

  // Extracts the result from a wrapped and chained object.
  wrapper.prototype.value = function() {
    return this._wrapped;
  };

})();
var requiredScripts = {};
var reqPath = 'src/';
var req = function(path, callback) {
    if(!(path in requiredScripts)) {
        requiredScripts[path] = true;
        var scr = document.createElement('script');
        scr.src = reqPath + path;
        src.addEventHandler('load', function(e) {
            callback();
        }, true);
    } else {
        if(callback) callback();
    }
};
_.mixin({
   has: function(object, key, func) {
       if(object[key] !== undefined)  {
           func.call(object, object[key]);
           return true;
       }
   },
   clamp: function(num, max, min) {
       return Math.min(Math.Max(num, max), min);
   }
});
function generatePath(ns) { 
    var target = window;
    if(ns.length != 0) {
        _(ns).each(function(item) {
            if(target[item] === undefined)
                target[item] = {};
            target = target[item];
        });
    }
    return target;
}
var def = function(name, proto) {
    var DefClass = function() {
        this.init.apply(this, arguments);
    };
    DefClass.prototype.init = function(){};
    _(proto).has('extend', function(val) {
        DefClass.prototype = new val;
        DefClass.prototype.constructor = DefClass;
    });
    _(proto).has('mixins', function(mixins) { 
        _(mixins).each(function(val) {
            _(DefClass.prototype).extend(val.prototype)
        });
    });
    _(proto).has('statics', function(statics){
        _(DefClass).extend(statics);
    });
    _(DefClass.prototype).extend(proto);
    var ns = name.split('.');
    name = ns.pop();
    var ref = generatePath(ns);
    if(proto.singleton) {
        ref[name] = new DefClass();
    } else {
        ref[name] = DefClass;
    }
    _(proto).has('alias', function(alias) {
        var aliasNS = alias.split('.');
        var alias = aliasNS.pop();
        
        generatePath(aliasNS)[alias] = ref[name];
    });
    return ref;
};

/**
 * Provides requestAnimationFrame in a cross browser way.
 * http://paulirish.com/2011/requestanimationframe-for-smart-animating/
 */

if ( !window.requestAnimationFrame ) {

    window.requestAnimationFrame = ( function() {

		return window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.oRequestAnimationFrame ||
		window.msRequestAnimationFrame ||
		function( /* function FrameRequestCallback */ callback, /* DOMElement Element */ element ) {

			window.setTimeout( callback, 1000 / 60 );

		};

	} )();

}
def('Jxl', {
    singleton: true,
    config: function(config) {
        if(config === undefined) config = {};
        var self = this;
        width = (config.width === undefined) ? 240 : config.width;
        height = (config.height === undefined) ? 160 : config.height;
        self.canvas = (config.canvas !== undefined) ? config.canvas : document.createElement('canvas');
        if(config.scale !== undefined) {
            self.setScale(config.scale);
        } else {
            self.setScale(new Jxl.Point({x:1,y:1}));
        }
        self.buffer = self.canvas.getContext('2d');
        self.showBB = false;
        self._width(width);
        self.state = new Jxl.State();
        self.audio = new Jxl.Audio();
        self.mouse = new Jxl.Mouse();
        self.keys = new Jxl.Keyboard();
        self._height(height);
        self.refresh = 16;
        self.running = false;
        self.delta = 0;
        self.fullScreen = false;
        self.keepResolution = false;
        self.date = new Date();
        self._scrollTarget = new Jxl.Point();
        self.unfollow();
        self.scroll = new Jxl.Point();
        self.renderedFrames = 0;
        Jxl.Util.setWorldBounds(0,0,this.width, this.height);
    },
    scale: {
        x: 1, y:1
    },
    follow: function(target, lerp) { 
        if(lerp == undefined) lerp = 1;
        this.followTarget= target;
        this.followLerp = lerp;
        this._scrollTarget.x = (this.width >> 1)-this.followTarget.x-(this.followTarget.width>>1);
        this._scrollTarget.y = (this.height >> 1)-this.followTarget.y-(this.followTarget.height>>1);
        
        this.scroll.x = this._scrollTarget.x;
        this.scroll.y = this._scrollTarget.y;
        this.doFollow();
    },
    doFollow: function() {
        if(this.followTarget != null) {
            this._scrollTarget.x = (this.width>>1)-this.followTarget.x-(this.followTarget.width>>1);
            this._scrollTarget.y = (this.height>>1)-this.followTarget.y-(this.followTarget.height>>1);
            if((this.followLead != null)){
                this._scrollTarget.x -= this.followTarget.velocity.x*this.followLead.x;
                this. _scrollTarget.y -= this.followTarget.velocity.y*this.followLead.y;
            }
            this.scroll.x += (this._scrollTarget.x-this.scroll.x)*this.followLerp*Jxl.delta;
            this.scroll.y += (this._scrollTarget.y-this.scroll.y)*this.followLerp*Jxl.delta;
            if(this.followMin != null) {
                if(this.scroll.x > this.followMin.x)
                    this.scroll.x = this.followMin.x;
                if(this.scroll.y > this.followMin.y)
                    this.scroll.y = this.followMin.y;
            }
            if(this.followMax != null) {
                if(this.scroll.x < this.followMax.x)
                    this.scroll.x = this.followMax.x;
                if(this.scroll.y < this.followMax.y)
                    this.scroll.y = this.followMax.y;
            }
        }
    },
    unfollow: function() {
        this.followTarget = null;
        this.followLead = null;
        this.followLerp = 1;
        this.followMin = null;
        this.followMax = null;
        if(this.scroll == null)
            this.scroll = new Jxl.Point();
        else
            this.scroll.x = scroll.y = 0;
        if(this._scrollTarget == null)
            this._scrollTarget = new Jxl.Point();
        else
            this._scrollTarget.x = this._scrollTarget.y = 0;
    },
    _width: function(width) {
        if(width != undefined) {
            this.screenWidth(width*this.scale.x);
            this.width = Math.floor(width);
        }
    },
    _height: function(height) {
        if(height != undefined) {
            this.screenHeight(height*this.scale.y);
            this.height = Math.floor(height);
        }
    },
    unpause: function() {
        if(!this.running) {
            this.running = true;
            this.audio.unpause();
            this.keys = {};
            this.lastUpdate = new Date();
            this.UI.pause.destroy();
        }
    },
    pause: function() {
        if(this.running) {
            this.running = false;
            this.audio.pause();
            this.UI.pause.render(document.body);
        }
    },
    screenWidth: function(width) {
        if(width != undefined) {
            this.canvas.width = width;
        }
        return this.canvas.width; 
    },
    screenHeight: function(height) {
        if(height != undefined) {
            this.canvas.height = height;
        }
        return this.canvas.height;
    },
    start: function() {
        var self = this;
        self.date = new Date();
        this.lastUpdate = this.date.getTime();
        if(!this.running) {
            this.running = true;
            this.interval = setInterval(function() {
                if(self.running) {
                    self.date = new Date();
                    var curTime = self.date.getTime();
                    var delta = (curTime - self.lastUpdate)/1000;
                    self.update(delta < 1 ? delta : 0);
                    self.lastUpdate = curTime;
                }
            }, this.refresh);
        }
    },
    setScale: function(scale) {
        this.scale = scale;
        this._width(this.width);
        this._height(this.height);
    },
    update: function(delta) {
        this.delta = delta;
        this.doFollow();
        this.state.update();
        this.state.preProcess();
        Jxl.buffer.clearRect(0,0, Jxl.canvas.width, Jxl.canvas.height);
        this.state.render();
        this.mouse.render();        
        this.keys.update();
        this.audio.update();
        this.state.postProcess();
    }
});


/***
 * Represents a single point in space
 ***/
def('Jxl.Point', {
    init: function(params) {
        _(this).extend({
            x: 0,
            y: 0
        });
        this.applyParams(params);
    },
    applyParams: function(params) {
        if(params)_(this).extend(params);
    }
});
/***
 * Represents a Rectangle
 ***/
def('Jxl.Rect', {
    extend: Jxl.Point,
    init: function(params) {
        Jxl.Point.prototype.init.call(this, params);
        _(this).extend({
            width: 0,
            height: 0
        });
        this.applyParams(params);
    },
    left: function() {
        return this.x;
    },
    right: function() {
        return this.x + this.width;
    },
    top: function() {
        return this.y;
    },
    bottom: function() {
        return this.y+this.height;
    }
});
/***
 * Base Game Object.
 ***/
def('Jxl.Object', {
    extend: Jxl.Rect,
    init: function(params) {
       Jxl.Rect.prototype.init.call(this, params);
       _(this).extend({
            _point: new Jxl.Point(),
            origin: new Jxl.Point(),
            velocity: new Jxl.Point(),
            acceleration: new Jxl.Point(),
            _pZero: new Jxl.Point(),
            drag: new Jxl.Point(),
            maxVelocity: new Jxl.Point({x: 10000, y: 10000}),
            scrollFactor: new Jxl.Point({x: 1, y: 1}),
            colHullX: new Jxl.Rect(),
            colHullY: new Jxl.Rect(),
            colVector: new Jxl.Point(),
            colOffsets: [new Jxl.Point()],
            colHullMinus: new Jxl.Point(),
            border: {
                visible: false,
                thickness: 2,
                color: '#f00'
            },
            collideLeft: true,
            collideRight: true,
            collideTop: true,
            collideBottom: true,
            angle: 0,
            angularVelocity: 0,
            angularDrag: 0,
            angularAcceleration: 0,
            maxAngular: 10000,
            thrust: 0,
            exists: true,
            visible: true,
            active: true,
            solid: true,
            fixed: false,
            moves: true,
            health: 1,
            dead: false,
            _flicker: false,
            _flickerTimer: -1,
            _group: false
       });
       this.applyParams(params);
    },
    refreshHulls: function() {
        var cx = this.colHullMinus.x,
            cy = this.colHullMinus.y;
        this.colHullX.x = this.x + cx;
        this.colHullX.y = this.y + cy;
        this.colHullX.width = this.width - cx;
        this.colHullX.height = this.height - cy;
        this.colHullY.x = this.x + cx;
        this.colHullY.y = this.y + cx;
        this.colHullY.width = this.width - cx;
        this.colHullY.height = this.height - cx;
    },
    updateMotion: function() {
        if(!this.moves) return;
        if(this.solid) this.refreshHulls();
        this.onFloor = false;
        var vc = (Jxl.Util.computeVelocity(this.angularVelocity, this.angularAcceleration, this.angularDrag, this.maxAngular) - this.angularVelocity)/2;
        this.angularVelocity += vc;
        this.angle += this.angularVelocity*Jxl.delta;
        this.angularVelocity += vc;
        
        var thrustComponents;
        if(this.thrust != 0 ) {
            thrustComponents = Jxl.Util.rotatePoint(-this.thrust, 0, 0, 0,this.angle);
            var maxComponents = Jxl.Util.rotatePoint(-this.maxThrust, 0, 0, 0, this.angle);
            var max = Math.abs(maxComponents.x);
            if(max > Math.abs(maxComponents.y)) maxComponents.y = max;
            else max = Math.abs(maxComponents.y);
            this.maxVelocity.x = this.maxVelocity.y = Math.abs(max);
        } else {
            thrustComponents = this._pZero;
        }
        
        vc = (Jxl.Util.computeVelocity(this.velocity.x, this.acceleration.x+thrustComponents.x,this.drag.x, this.maxVelocity.x) - this.velocity.x)/2;
        this.velocity.x += vc;
        var xd = this.velocity.x * Jxl.delta;
        this.velocity.x += vc;
        
        vc = (Jxl.Util.computeVelocity(this.velocity.y, this.acceleration.y+thrustComponents.y, this.drag.y, this.maxVelocity.y) - this.velocity.y)/2;
        this.velocity.y += vc;
        var yd = this.velocity.y * Jxl.delta;
        this.velocity.y += vc;
        
        this.x += xd;
        this.y += yd;
        
        if(!this.solid) return;
        
        this.colVector.x = xd;
        this.colVector.y = yd;
        this.colHullX.width += Math.abs(xd);
        if(this.colVector.x < 0) this.colHullX.x += this.colVector.x;
        this.colHullY.x = this.x;
        this.colHullY.height += Math.abs(this.colVector.y);
        if(this.colVector.y < 0) this.colHullY.y += this.colVector.y;
    },
    updateFlickering: function() {
        if(this.flickering()) {
            if(this._flickerTimer > 0) {
                this._flickerTimer -= Jxl.delta;
                if(this._flickerTimer == 0) this._flickerTimer = -1;
            }
            if(this._flickerTimer < 0) this.flicker(-1);
            else {
                this._flicker = !this._flicker;
                this.visible = !this._flicker;
            }
        }
    },
    update: function() {
        this.updateMotion();
        this.updateFlickering();
    },
    flicker: function(duration) {
        if(duration == undefined) duration = 1;
        this._flickerTimer = duration;
        if(this._flickerTimer < 0) {
            this._flicker = false;
            this.visible = true;
        }
    },
    reset: function(x, y) {
        if(x == undefined) x = 0;
        if(y == undefined) y = 0;
        this.x = x;
        this.y = y;
        this.exists = true;
        this.dead = false;
    },
    overlaps: function(object) {
        this._point = this.getScreenXY(this._point);
        var tx = this._point.x;
        var ty = this._point.y;
        var tw = this.width;
        var th = this.height;
        if(this.isSprite != undefined) {
            var ts = this;
            tw = ts.frameWidth;
            th = ts.frameHeight;
        }
        this._point = object.getScreenXY(this._point);
        var ox = this._point.x;
        var oy = this._point.y;
        var ow = this.object.width;
        var oh = this.object.height;
        
        if(object.isSprite != undefined) {
            var os = object;
            ow = os.frameWidth;
            oh = os.frameHeight;
        }
        if((ox <= tx-ow) || (ox >= tx+tw) || (oy <= ty-oh) || (oy >= ty+th))
            return false;
        return true; 
    },
    overlapsPoint: function(x, y, perPixel) {
        if(perPixel == undefined) perPixel = false;
        
        x += Math.floor(Jxl.scroll.x);
        y += Math.floor(Jxl.scroll.y);
        this._point = this.getScreenXY(this._point);
        if((x <= this._point.x) || (x >= this._point.x+this.width) || (y <= this._point.y) || (y >= this._point.y+this.height))
            return false;
        return true;
    },
    collide: function(object) {
        if(object == undefined) object = this;
        return Jxl.Util.collide(this, object);
    },
    preCollide: function(object) {},
    hitLeft: function(contact, velocity) {
        if(!this.fixed) this.velocity.x = velocity;
    },
    hitRight: function(contact, velocity) {
        this.hitLeft(contact, velocity);
    },
    hitTop: function(contact, velocity) {
        if(!this.fixed) this.velocity.y = velocity;
    },
    hitBottom: function(contact, velocity) {
        this.onFloor = true; 
        if(!this.fixed) this.velocity.y = velocity;
    },
    flickering: function() {
        return this._flickerTimer >= 0;
    },
    hurt: function(damage) {
        if((this.health -= damage) <= 0 ) this.kill();
    },
    kill: function() {
        this.exists = false;
        this.dead = true;
    },
    render: function() {
        if(this.border.visible) {
            this._point = this.getScreenXY(this._point);
            this.renderBorder(); 
        }
    },
    renderBorder: function(point) {
        Jxl.buffer.strokeStyle = this.border.color;
        Jxl.buffer.lineWidth = this.border.thickness;
        Jxl.buffer.strokeRect(this._point.x-this.border.thickness, this._point.y-this.border.thickness, this.width+this.border.thickness, this.height+this.border.thickness);
    },
    getScreenXY: function(point) {
        if(point == undefined) point = new Jxl.Point();
        point.x = Math.floor(this.x+Jxl.Util.roundingError)+Math.floor(Jxl.scroll.x*this.scrollFactor.x);
        point.y = Math.floor(this.y+Jxl.Util.roundingError)+Math.floor(Jxl.scroll.y*this.scrollFactor.y);
        return point;
    }
});


def('Jxl.Group', {
    extend: Jxl.Object,
    init: function(params) {
        Jxl.Object.prototype.init.call(this, params);
        _(this).extend({
            _group: true,
            solid: false,
            members: [],
            _last: new Jxl.Point(),
            _first: true
        });
        this.applyParams(params);
    },
    statics: {
        ASCENDING: -1,
        DESCENDING: 1
    },
    add: function(object, ShareScroll) {
        ShareScroll = (ShareScroll === undefined) ? false : ShareScroll;
        if (this.members.indexOf(object) < 0) this.members[this.members.length] = object;
        if (ShareScroll) object.scrollFactor = this.scrollFactor;
        return object;
    },
    replace: function(OldObject, NewObject) {
        var index = this.members.indexOf(OldObject);
        if ((index < 0) || (index >= this.members.length)) return null;
        this.members[index] = NewObject;
        return NewObject;
    },
    remove: function(object, Splice) {
        Splice = (Splice === undefined) ? false : Splice;
        var index = this.members.indexOf(object);
        if ((index < 0) || (index >= this.members.length)) return null;
        if (Splice) this.members.splice(index, 1);
        else this.members[index] = null;
        return object;
    },
    sort: function(Index, Order) {
        Index = (Index === undefined) ? "y" : Index;
        Order = (Order === undefined) ? Jxl.Group.ASCENDING : Order;
        this._sortIndex = Index;
        this._sortOrder = Order;
        this.members.sort(this.sortHandler);
    },
    getFirstAvail: function() {
        var i = 0;
        var o;
        var ml = this.members.length;
        while (i < ml) {
            o = this.members[i++];
            if ((o != undefined) && !o.exists) return o;
        }
        return null;
    },
    getFirstNull: function() {
        var i = 0;
        var ml = this.members.length;
        while (i < ml) {
            if (this.members[i] == undefined) return i;
            else i++;
        }
        return -1;
    },
    resetFirstAvail: function(X, Y) {
        X = (X === undefined) ? 0 : X;
        Y = (Y === undefined) ? 0 : Y;
        var o = this.getFirstAvail();
        if (o == null) return false;
        o.reset(X, Y);
        return true;
    },
    getFirstExtant: function() {
        var i = 0;
        var o;
        var ml = this.members.length;
        while (i < ml) {
            o = this.members[i++];
            if ((o != null) && o.exists) return o;
        }
        return null;
    },
    getFirstAlive: function() {
        var i = 0;
        var o;
        var ml = this.members.length;
        while (i < ml) {
            o = this.members[i++];
            if ((o != null) && o.exists && !o.dead) return o;
        }
        return null;
    },
    getFirstDead: function() {
        var i = 0;
        var o;
        var ml = this.members.length;
        while (i < ml) {
            o = this.members[i++];
            if ((o != null) && o.dead) return o;
        }
        return null;
    },
    countLiving: function() {
        var count = -1;
        var i = 0;
        var o;
        var ml = this.members.length;
        while (i < ml) {
            o = this.members[i++];
            if (o != null) {
                if (count < 0) count = 0;
                if (o.exists && !o.dead) count++;
            }
        }
        return count;
    },
    countDead: function() {
        var count = -1;
        var i = 0;
        var o;
        var ml = this.members.length;
        while (i < ml) {
            o = this.members[i++];
            if (o != null) {
                if (count < 0) count = 0;
                if (o.dead) count++;
            }
        }
        return count;
    },
    countOnScreen: function() {
        var count = -1;
        var i = 0;
        var o;
        var ml = this.members.length;
        while (i < ml) {
            o = this.members[i++];
            if (o != null) {
                if (count < 0) count = 0;
                if (o.onScreen()) count++;
            }
        }
        return count;
    },
    getRandom: function() {
        var c = 0;
        var o = null;
        var l = this.members.length;
        var i = Math.floor(Jxl.Util.random() * l);
        while ((o === null || o === undefined) && (c < this.members.length)) {
            o = this.members[(++i) % l];
            c++;
        }
        return o;
    },
    saveOldPosition: function() {
        if (this._first) {
            this._first = false;
            this._last.x = 0;
            this._last.y = 0;
            return;
        }
        this._last.x = this.x;
        this._last.y = this.y;
    },
    updateMembers: function(delta) {
        var mx;
        var my;
        var moved = false;
        if ((this.x != this._last.x) || (this.y != this._last.y)) {
            moved = true;
            mx = this.x - this._last.x;
            my = this.y - this._last.y;
        }
        var i = 0;
        var o;
        var ml = this.members.length;
        while (i < ml) {
            o = this.members[i++];
            if ((o != null) && o.exists) {
                if (moved) {
                    if (o._group) o.reset(o.x + mx, o.y + my);
                    else {
                        o.x += mx;
                        o.y += my;
                    }
                }
                if (o.active) o.update(delta);
                if (moved && o.solid) {
                    o.colHullX.width += ((mx > 0) ? mx : -mx);
                    if (mx < 0) o.colHullX.x += mx;
                    o.colHullY.x = this.x;
                    o.colHullY.height += ((my > 0) ? my : -my);
                    if (my < 0) o.colHullY.y += my;
                    o.colVector.x += mx;
                    o.colVector.y += my;
                }
            }
        }
    },
    update: function() {
        this.saveOldPosition();
        this.updateMotion();
        this.updateMembers();
        this.updateFlickering();
    },
    renderMembers: function() {
        var i = 0;
        var o;
        var ml = this.members.length;
        while (i < ml) {
            o = this.members[i++];
            if ((o != null) && o.exists && o.visible) o.render();
        }
    },
    render: function() {
        this.renderMembers();
    },
    killMembers: function() {
        var i = 0;
        var o;
        var ml = this.members.length;
        while (i < ml) {
            o = this.members[i++];
            if (o != null) o.kill();
        }
    },
    kill: function() {
        this.killMembers();
        Jxl.Object.prototype.kill.call(this);
    },
    destroyMembers: function() {
        var i = 0;
        var o;
        var ml = this.members.length;
        while (i < ml) {
            o = members[i++];
            if (o != null) o.destroy();
        }
        this.members.length = 0;
    },
    destroy: function() {
        this.destroyMembers();
        this.parent();
    },
    reset: function(X, Y) {
        this.saveOldPosition();
        this.parent(X, Y);
        var mx;
        var my;
        var moved = false;
        if ((this.x != this._last.x) || (this.y != this._last.y)) {
            moved = true;
            mx = this.x - this._last.x;
            my = this.y - this._last.y;
        }
        var i = 0;
        var o;
        var ml = this.members.length;
        while (i < ml) {
            o = members[i++];
            if ((o != null) && o.exists) {
                if (moved) {
                    if (o._group) o.reset(o.x + mx, o.y + my);
                    else {
                        o.x += mx;
                        o.y += my;
                        if (this.solid) {
                            o.colHullX.width += ((mx > 0) ? mx : -mx);
                            if (mx < 0) o.colHullX.x += mx;
                            o.colHullY.x = this.x;
                            o.colHullY.height += ((my > 0) ? my : -my);
                            if (my < 0) o.colHullY.y += my;
                            o.colVector.x += mx;
                            o.colVector.y += my;
                        }
                    }
                }
            }
        }
    },
    sortHandler: function(Obj1, Obj2) {
        if (Obj1[this._sortIndex] < Obj2[this._sortIndex]) return this._sortOrder;
        else if (Obj1[this._sortIndex] > Obj2[this._sortIndex]) return -this._sortOrder;
        return 0;
    }
});
def('Jxl.State', {
    init: function(params) {
        _(this).extend({
            defaultGroup: new Jxl.Group()
        });
        _(this).extend(params);
    },
    add: function(object) {
        return this.defaultGroup.add(object);
    },
    remove: function(object) {
	    this.defaultGroup.remove(object);
    },
    preProcess: function() {
    },
    update: function() {
        this.defaultGroup.update();
    },
    collide: function() {
        Jxl.Util.collide(this.defaultGroup, this.defaultGroup);
    },
    render: function() {
        this.defaultGroup.render();
    },
    postProcess: function() {},
    destroy: function() {
        this.defaultGroup.destroy();
    }
});

def('Jxl.Sprite', {
    extend: Jxl.Object,
    init: function(params) {
        var self = this;
        Jxl.Object.prototype.init.call(this, params);
        _(this).extend({
            isSprite: true,
            width: 32,
            height: 32,
            angle: 0,
            _alpha: 1,
        	_color: 0x00ffffff,
        	_blend: null,
        	_facing: 1,
        	_animations: {},
        	reverse: false,
        	_curFrame: 0,
        	_frameTimer: 0,
        	finished: false,
            rotPoint: new Jxl.Point(),
        	_caf: 0,
            scale: new Jxl.Point({x: 1,y: 1}),
            offset: new Jxl.Point(),
        	_curAnim: null,
        	animated: false
        });
        this.loadGraphic(params);
    },
    play: function(name, force) {
        this.animated = true;
        if(force == undefined) force = false;
        if(!force && this._curAnim != null && name == this._curAnim.name) return;
        this._curFrame = 0;
        this._caf = 0;
        this._curAnim = this._animations[name];
        this._curFrame = this._curAnim.frames[this._caf]; 
    },
    flip: function() {
        this.bufferCTX.scale(-1,1);
        this.bufferCTX.translate(-this.buffer.width, 0); 
    },
    calcFrame: function() {
        this.buffer.width = this.buffer.width;
        this.bufferCTX.clearRect(0, 0, this.buffer.width, this.buffer.height);
        var rx = this._curFrame * this.width;
        var ry = 0;
        if(rx > this.graphic.width) {
            ry = Math.floor(rx/this.graphic.width)*this.height;
            rx = rx % this.graphic.width;
        }
        if(this.reverse) this.flip();
        this.bufferCTX.drawImage(this.graphic.scaled, rx*Jxl.scale.x, ry*Jxl.scale.y, this.width*Jxl.scale.x, this.height*Jxl.scale.y, 0, 0, this.width*Jxl.scale.x, this.height*Jxl.scale.y);
    },
    // Rotations are stored on the fly instead of prebaked since they are cheaper here than in flixel.
    render: function() {
        if(!this.visible) return;
        if(this.animated || this.reverse) this.calcFrame();
        var rCan = this.buffer;
        this._point = this.getScreenXY(this._point);
	    if(this.border.visible || Jxl.showBB) this.renderBorder(this._point);
        if(this.angle != 0) {
            Jxl.buffer.save();
            this.rotPoint.x = this._point.x+this.width/2;
            this.rotPoint.y = this._point.y+this.height/2;
            Jxl.buffer.translate(this.rotPoint.x, this.rotPoint.y);
            Jxl.buffer.rotate(this.angle*Math.PI/180);
            Jxl.buffer.translate(-this.rotPoint.x, -this.rotPoint.y);
            Jxl.buffer.drawImage(rCan, this._point.x*Jxl.scale.x, this._point.y*Jxl.scale.y, this.buffer.width*this.scale.x, this.buffer.height*this.scale.y);    
            Jxl.buffer.restore();
        } else {
             Jxl.buffer.drawImage(rCan, this._point.x*Jxl.scale.x, this._point.y*Jxl.scale.y, this.buffer.width*this.scale.x, this.buffer.height*this.scale.y);    
        }
        
    },
    onEmit: function() {},
    updateAnimation: function() {
        if((this._curAnim != null) && (this._curAnim.delay > 0) && (this._curAnim.looped || !this.finished )) {
            this._frameTimer += Jxl.delta;
            if(this._frameTimer > this._curAnim.delay) {
                this._frameTimer -= this._curAnim.delay;
                if(this._caf == this._curAnim.frames.length-1) {
                    if(this._curAnim.looped) this._caf = 0;
                    this.finished = true;
					this.animationComplete(this._curAnim.name, this._curAnim.looped);
                } else {
                    this._caf++;
                }
                this._curFrame = this._curAnim.frames[this._caf];
            }
        }
    },
    animationComplete: function(name, isLooped) {},
    addAnimation: function(name, frames, frameRate, looped ) {
        if(frameRate == undefined)
            frameRate = 0;
        if(looped == undefined)
            looped = true;
        this._animations[name] = new Jxl.Anim(name, frames, frameRate, looped);
    },
    update: function() {
        this.updateMotion();
        this.updateAnimation();
        this.updateFlickering();
    },
    getScreenXY: function(point) {
        if(point == undefined) point = new Jxl.Point();
        point.x = Math.floor(this.x+Jxl.Util.roundingError)+Math.floor(Jxl.scroll.x*this.scrollFactor.x) - this.offset.x;
        point.y = Math.floor(this.y+Jxl.Util.roundingError)+Math.floor(Jxl.scroll.y*this.scrollFactor.y) - this.offset.y;
        return point;
    },
    overlapsPoint: function(game, x, y, perPixel) {
        if(perPixel == undefined) perPixel = false;
        
        x -= Math.floor(Jxl.scroll.x);
        y -= Math.floor(Jxl.scroll.y);
        this._point = this.getScreenXY(this._point);
    
        if((x <= this._point.x) || (x >= this._point.x+this.width) || (y <= this._point.y) || (y >= this._point.y+this.height))
            return false;
        return true;
    },
    getFacing: function() {
        return this._facing;
    },
    setFacing: function(Direction) {
        var c = this._facing != Direction;
        this._facing = Direction;
        if(c) this.calcFrame();
    },
    resetHelpers: function () {
        this._boundsVisible = false;
        this.origin.x = this.width*0.5;
        this.origin.y = this.height*0.5;
        if(this.graphic) this.frames = Math.floor(this.graphic.width/this.width*this.graphic.height/this.height);
        this._caf = 0;
        this.refreshHulls();
        this._graphicCTX = this.graphic.getContext('2d');
    },
    loadGraphic: function(params) {
        this.applyParams(params);
        this.buffer = document.createElement('canvas');
        this.buffer.width = this.width*Jxl.scale.x;
        this.buffer.height = this.height*Jxl.scale.y;
        if(this.graphic == undefined) {
            this.graphic = document.createElement('canvas');
            this.graphic.scaled = this.graphic;
        }
        this.bufferCTX = this.buffer.getContext('2d');
        this.bufferCTX.drawImage(this.graphic.scaled, this.width*Jxl.scale.x, this.height*Jxl.scale.y); 
        this.resetHelpers();
        return this;
    },
    createGraphic: function(Width, Height, Color) {
        Color = ( Color == undefined) ? 0xFFFFFFFF : Color;
        this.graphic = document.createElement('canvas');
        var ctx = this.graphic.getContext('2d');
        this.width = this.graphic.width = this.frameWidth = Width;
	    this.height = this.graphic.height = this.frameHeight = Height;
        ctx.fillStyle = Jxl.Util.makeRGBA(Color);
        ctx.fillRect(0, 0, Width, Height);
        this.loadGraphic();
        return this;
    }
});
Jxl.Sprite.LEFT = 0;
Jxl.Sprite.RIGHT = 1;
Jxl.Sprite.UP = 2;
Jxl.Sprite.DOWN = 3;


def('Jxl.Anim', {
    init: function(name, frames, frameRate, looped){
        this.name = name;
        this.delay = 0;
        if(frameRate > 0)
            this.delay = frameRate;
        this.frames = frames;
        this.looped = looped;
    }
});

def('Jxl.TileMap', {
    extend: Jxl.Object,
    init: function(params) {
        Jxl.Object.prototype.init.call(this, params);
        _(this).extend({
            auto: Jxl.TileMapOFF,
            collideIndex: 1,
            noCollide: {},
            startingIndex: 0,
            drawIndex: 1,
            widthInTiles: 0,
            heightInTiles: 0,
            totalTiles: 0,
            _buffer: null,
            _bufferLoc: new Jxl.Point(),
            _flashRect2: new Jxl.Rect(),
            _flashRect: new Jxl.Rect(),
            _data: null,
            _tileWidth: 0,
            _tileHeight: 0,
            _rects: null,
            _pixels: null,
            _block: new Jxl.Object({
                width: 0,
                height: 0,
                fixed: true
            }),
            _callbacks: new Array(),
            fixed: true
       });
       this.loadMap(params);
    },
    /* You need a minimum of MapData, TileGraphic, TileWidth, TileHeight to loadGraphic completely.*/
    loadMap: function(params) {
        this.applyParams(params);
        
        if(this.tileGraphic) {
            var c, cols, rows = this.mapData.split("\n");
            this.heightInTiles = rows.length;
            this._data = [];
            for (var r = 0; r < this.heightInTiles; r++) {
                cols = rows[r].split(",");
                if (cols.length <= 1) {
                    this.heightInTiles--;
                    continue;
                }
                if (this.widthInTiles == 0) this.widthInTiles = cols.length
                for (c = 0; c < this.widthInTiles; c++)
                this._data.push(cols[c]);
            }
    
            //Pre-Process the map data if its auto-tiled
            var i;
            this.totalTiles = this.widthInTiles * this.heightInTiles;
            if (this.auto > Jxl.TileMapOFF) {
                this.collideIndex = this.startingIndex = this.drawIndex = 1;
                i = 0;
                while (i < this.totalTiles)c
                this.autoTile(i++);
            }
    
            this._pixels = this.tileGraphic;
    
            if (this.tileWidth == undefined) this._tileWidth = this._pixels.height;
            else this._tileWidth = this.tileWidth;
            if (this.tileHeight == undefined) this._tileHeight = this._tileWidth;
            else this._tileHeight = this.tileHeight;
    
            this._block.width = this._tileWidth;
            this._block.height = this._tileHeight;
    
            this.width = this.widthInTiles * this._tileWidth;
            this.height = this.heightInTiles * this._tileHeight;
    
            this._rects = new Array(this.totalTiles);
            for (i = 0; i < this.totalTiles; i++)
            this.updateTile(i);
    
            this._screenRows = Math.ceil(Jxl.height / this._tileHeight) + 1;
            if (this._screenRows > this.heightInTiles) this._screenRows = this.heightInTiles;
            this._screenCols = Math.ceil(Jxl.width / this._tileWidth) + 1;
            if (this._screenCols > this.widthInTiles) this._screenCols = this.widthInTiles;
        }
        return this;
    },
    render: function() {
        this._point = this.getScreenXY(this._point);
        var _flashPoint = new Jxl.Point({
            x: this._point.x,
            y: this._point.y
        });

        var tx = Math.floor(-this._point.x / this._tileWidth);
        var ty = Math.floor(-this._point.y / this._tileHeight);
        if (tx < 0) tx = 0;
        if (tx > this.widthInTiles - this._screenCols) tx = this.widthInTiles - this._screenCols;
        if (ty < 0) ty = 0;
        if (ty > this.heightInTiles - this._screenRows) ty = this.heightInTiles - this._screenRows;
        var ri = ty * this.widthInTiles + tx;
        _flashPoint.x += tx * this._tileWidth;
        _flashPoint.y += ty * this._tileHeight;
        var opx = _flashPoint.x;
        var c;
        var cri;
        for (var r = 0; r < this._screenRows; r++) {
            cri = ri;
            for (c = 0; c < this._screenCols; c++) {
                var _flashRect = this._rects[cri++];
                if (_flashRect != null) Jxl.buffer.drawImage(this._pixels.scaled, _flashRect[0]*Jxl.scale.x, _flashRect[1]*Jxl.scale.y, _flashRect[2]*Jxl.scale.x, _flashRect[3]*Jxl.scale.y, _flashPoint.x*Jxl.scale.x, _flashPoint.y*Jxl.scale.y, this._tileWidth*Jxl.scale.x, this._tileHeight*Jxl.scale.y);
                _flashPoint.x += this._tileWidth;
            }
            ri += this.widthInTiles;
            _flashPoint.x = opx;
            _flashPoint.y += this._tileHeight;
        }
    },
    updateTile: function(index) {
        if (this._data[index] < this.drawIndex) {
            this._rects[index] = null;
            return;
        }
        var rx = (this._data[index] - this.startingIndex) * this._tileWidth;
        var ry = 0;
        if (rx >= this._pixels.width) {
            ry = Math.floor(Math.abs(rx / this._pixels.width)) * this._tileHeight;
            rx = rx % this._pixels.width;
        }
        this._rects[index] = [rx, ry, this._tileWidth, this._tileHeight];
    },
    autoTile: function(Index) {
        if (this._data[Index] == 0) return;
        this._data[Index] = 0;
        if ((Index - this.widthInTiles < 0) || (this._data[Index - this.widthInTiles] > 0)) //UP
        this._data[Index] += 1;
        if ((Index % this.widthInTiles >= this.widthInTiles - 1) || (this._data[Index + 1] > 0)) //RIGHT
        this._data[Index] += 2;
        if ((Index + this.widthInTiles >= this.totalTiles) || (this._data[Index + this.widthInTiles] > 0)) //DOWN
        this._data[Index] += 4;
        if ((Index % this.widthInTiles <= 0) || (this._data[Index - 1] > 0)) //LEFT
        this._data[Index] += 8;

        //The alternate algo checks for interior corners
        if ((this.auto == Jxl.TileMapALT) && (this._data[Index] == 15)) {
            if ((Index % this.widthInTiles > 0) && (Index + this.widthInTiles < this.totalTiles) && (this._data[Index + this.widthInTiles - 1] <= 0)) this._data[Index] = 1; //BOTTOM LEFT OPEN
            if ((Index % this.widthInTiles > 0) && (Index - this.widthInTiles >= 0) && (this._data[Index - this.widthInTiles - 1] <= 0)) this._data[Index] = 2; //TOP LEFT OPEN
            if ((Index % this.widthInTiles < this.widthInTiles - 1) && (Index - this.widthInTiles >= 0) && (this._data[Index - this.widthInTiles + 1] <= 0)) this._data[Index] = 4; //TOP RIGHT OPEN
            if ((Index % this.widthInTiles < this.widthInTiles - 1) && (Index + this.widthInTiles < this.totalTiles) && (this._data[Index + this.widthInTiles + 1] <= 0)) this._data[Index] = 8; //BOTTOM RIGHT OPEN
        }
        this._data[Index] += 1;
    },
    overlaps: function(Core) {
        var d;

        var dd;
        var blocks = new Array();

        //First make a list of all the blocks we'll use for collision
        var ix = Math.floor((Core.x - this.x) / this._tileWidth);
        var iy = Math.floor((Core.y - this.y) / this._tileHeight);
        var iw = Math.ceil(Core.width / this._tileWidth) + 1;
        var ih = Math.ceil(Core.height / this._tileHeight) + 1;
        var r = 0;
        var c;
        while (r < ih) {
            if (r >= this.heightInTiles) break;
            d = (iy + r) * this.widthInTiles + ix;
            c = 0;
            while (c < iw) {
                if (c >= this.widthInTiles) break;
                dd = Math.floor(this._data[d + c]);
                if (dd >= this.collideIndex && !(dd in this.noCollide)) {
                    blocks.push({
                        x: this.x + (ix + c) * this._tileWidth,
                        y: this.y + (iy + r) * this._tileHeight,
                        data: dd
                    });
                }
                c++;
            }
            r++;
        }

        //Then check for overlaps
        var bl = blocks.length;
        var hx = false;
        var i = 0;
        while (i < bl) {
            this._block.x = blocks[i].x;
            this._block.y = blocks[i++].y;
            if (this._block.overlaps(Core)) return true;
        }
        return false;
    },
    renderTileBB: function(X, Y) {
        if ((X >= this.widthInTiles) || (Y >= this.heightInTiles)) return;
        Jxl.buffer.strokeStyle = this.border.color;
        Jxl.buffer.lineWidth = this.border.thickness;
        Jxl.buffer.strokeRect(this._point.x - this.border.thickness + X * this.tileWidth, this._point.y - this.border.thickness + Y * this.tileHeight, this.tileWidth + this.border.thickness, this.tileHeight + this.border.thickness);
    },
    setTile: function(X, Y, Tile, UpdateGraphics) {
        UpdateGraphics = (UpdateGraphics === undefined) ? true : UpdateGraphics;
        if ((X >= this.widthInTiles) || (Y >= this.heightInTiles)) return false;
        return this.setTileByIndex(Y * this.widthInTiles + X, Tile, UpdateGraphics);
    },
    setTileByIndex: function(Index, Tile, UpdateGraphics) {
        UpdateGraphics = (UpdateGraphics === undefined) ? true : UpdateGraphics;
        if (Index >= this._data.length) return false;

        var ok = true;
        this._data[Index] = Tile;

        if (!UpdateGraphics) return ok;

        this.refresh = true;

        if (this.auto == Jxl.TilemapOFF) {
            this.updateTile(Index);
            return ok;
        }

        //If this map is autotiled and it changes, locally update the arrangement
        var i;
        var r = Math.floor(Index / this.widthInTiles) - 1;
        var rl = r + 3;
        var c = Index % this.widthInTiles - 1;
        var cl = c + 3;
        while (r < rl) {
            c = cl - 3;
            while (c < cl) {
                if ((r >= 0) && (r < this.heightInTiles) && (c >= 0) && (c < this.widthInTiles)) {
                    i = r * this.widthInTiles + c;
                    this.autoTile(i);
                    this.updateTile(i);
                }
                c++;
            }
            r++;
        }

        return ok;
    },
    overlapsPoint: function(X, Y, PerPixel) {
        var t = getTile(
        Math.floor((X - this.x) / this._tileWidth), Math.floor((Y - this.y) / this._tileHeight));
        return (t >= this.collideIndex && !(t in this.noCollide));
    },
    refreshHulls: function() {
        this.colHullX.x = 0;
        this.colHullX.y = 0;
        this.colHullX.width = this._tileWidth;
        this.colHullX.height = this._tileHeight;
        this.colHullY.x = 0;
        this.colHullY.y = 0;
        this.colHullY.width = this._tileWidth;
        this.colHullY.height = this._tileHeight;
    },
    preCollide: function(Obj) {
        var r;
        var c;
        var cp;
        var rs;
        var col = 0;
        var ix = Math.floor((Obj.x - this.x) / this._tileWidth);
        var iy = Math.floor((Obj.y - this.y) / this._tileHeight);

        var iw = ix + Math.ceil(Obj.width / this._tileWidth + 1);
        var ih = iy + Math.ceil(Obj.height / this._tileHeight + 1);
        if (ix < 0) ix = 0;
        if (iy < 0) iy = 0;
        if (iw > this.widthInTiles) iw = this.widthInTiles;
        if (ih > this.heightInTiles) ih = this.heightInTiles;
        rs = iy * this.widthInTiles;
        r = iy;
        for (r = iy; r < ih; r++) {
            for (c = ix; c < iw; c++) {
                cp = Math.floor(Math.abs(this._data[rs + c])) ;
                if (cp >= this.collideIndex && !(cp in this.noCollide) ) this.colOffsets[col++] = new Jxl.Point({
                    x: this.x + c * this._tileWidth,
                    y: this.y + r * this._tileHeight
                });
            }
            rs += this.widthInTiles;
        }
        if (this.colOffsets.length != col) this.colOffsets.length = col;
    },
    ray: function(StartX, StartY, EndX, EndY, Result, Resolution) {
        Resolution = (Resolution === undefined) ? 1 : Resolution;
        var step = this._tileWidth;
        if (this._tileHeight < this._tileWidth) {
            step = this._tileHeight;
        }
        step /= Resolution;
        var dx = EndX - StartX;
        var dy = EndY - StartY;
        var distance = Math.sqrt(dx * dx + dy * dy);
        var steps = Math.ceil(distance / step);
        var stepX = dx / steps;
        var stepY = dy / steps;
        var curX = StartX - stepX;
        var curY = StartY - stepY;
        var tx;
        var ty;
        var cp;
        var i = 0;
        while (i < steps) {
            curX += stepX;
            curY += stepY;

            if ((curX < 0) || (curX > width) || (curY < 0) || (curY > height)) {
                i++;
                continue;
            }

            tx = curX / this._tileWidth;
            ty = curY / this._tileHeight;
            cp = (Math.floor(this._data[ty * this.widthInTiles + tx]));
            if (cp >= this.collideIndex && !(cp in this.noCollide)) {
                //Some basic helper stuff
                tx *= this._tileWidth;
                ty *= this._tileHeight;
                var rx = 0;
                var ry = 0;
                var q;
                var lx = curX - stepX;
                var ly = curY - stepY;

                //Figure out if it crosses the X boundary
                q = tx;
                if (dx < 0) q += this._tileWidth;
                rx = q;
                ry = ly + stepY * ((q - lx) / stepX);
                if ((ry > ty) && (ry < ty + this._tileHeight)) {
                    if (Result === undefined) Result = new Jxl.Point();
                    Result.x = rx;
                    Result.y = ry;
                    return true;
                }

                //Else, figure out if it crosses the Y boundary
                q = ty;
                if (dy < 0) q += this._tileHeight;
                rx = lx + stepX * ((q - ly) / stepY);
                ry = q;
                if ((rx > tx) && (rx < tx + this._tileWidth)) {
                    if (Result === undefined) Result = new Jxl.Point();
                    Result.x = rx;
                    Result.y = ry;
                    return true;
                }
                return false;
            }
            i++;
        }
        return false;
    }
});
Jxl.TileMapOFF = 0;
Jxl.TileMapAUTO = 1;
Jxl.TileMapALT = 2;
Jxl.TileMap.arrayToCSV = function(Data, Width) {
    var r = 0;
    var c;
    var csv = "";
    var Height = Data.length / Width;
    while (r < Height) {
        c = 0;
        while (c < Width) {
            if (c == 0) {
                if (r == 0) csv += Data[0];
                else csv += "\n" + Data[r * Width];
            }
            else csv += ", " + Data[r * Width + c];
            c++;
        }
        r++;
    }
    return csv;
}

def('Jxl.Audio', {
    init: function() {
        this.sounds = {};
        this.channels = [];
        for(var i=0;i<16;i++) {
            this.channels[i] = document.createElement('audio');
            this.channels[i].dead = true;
        }
    },
    play: function(name, loop,  volume, start, finish) {
        if(name in this.sounds) {
            for(var i = 0;i < this.channels.length; i++) {
                if(this.channels[i].dead) {
                    this.channels[i].dead = false;
                    this.channels[i].src = this.sounds[name].src;
                    this.channels[i].start = 0;
                    this.channels[i].finish = this.sounds[name].duration;
                    if(volume) {
                        this.channels[i].volume = volume;
                    } else {
                        this.channels[i].volume = 1;
                    }
                    if(loop) {
                        this.channels[i].loop = true;
                    } else {
                        this.channels[i].loop = false;
                    }
                    if(start) {
                        this.channels[i].currentTime = start;
                        this.channels[i].start = start;
                    }
                    if(finish) this.channels[i].finish = finish;
                    this.channels[i].play();
                    return;
                }
            }
        }
    },
    unpause: function () {
        for(var i = 0; i < this.channels.length; i++) {
            if(!this.channels[i].dead) this.channels[i].play();
        }
    },
    pause: function() {
        for(var i = 0; i < this.channels.length; i++) {
           if(!this.channels[i].dead) this.channels[i].pause();
        }
    },
    update: function() {
        var i = this.channels.length-1;
        while(i >= 0 ) {
            if(!this.channels[i].paused && this.channels[i].currentTime >= this.channels[i].finish) {
                if(this.channels[i].loop) {
                    this.channels[i].currentTime = this.channels[i].start;
                } else {
                    this.channels[i].dead = true;
                    this.channels[i].pause();
                }
            }
            i--;
        }
    },
    add: function(name, audio) {
        this.sounds[name] = audio;
    }
});
def('Jxl.AssetManager', {
    init: function() {
        this.assets = {};
	    this.batches = [];
    },
    alias: 'Jxl.am',
    singleton: true,
    get: function(name) {
        return this.assets[name];
    },
    reload: function(callback) {
    	var self = this;
    	var ln = this.batches.length, ct = 0;
    	_(this.batches).each(function(batch) {
    	    self.load(batch, function() {
        		ct++;
        		if(callback != undefined && ln == ct) callback();
    	    });
    	});
    },
    load: function(assets, callback, progress) {
    	var self = this,
        ct = 0,
        ln = 0;
        if(assets.images) {
            _(assets.images).each(function(val, key) {
                self.loadAsset('image', key, val, function(asset) {
                   ct++;
                   if(callback != undefined && ct >= ln) callback();
                   if(progress)progress(ct, ln);
                });
                ln++;
            });
        }
        if(assets.sounds) {
            _(assets.sounds).each(function(val, key) {
                self.loadAsset('sound', key, val, function(asset) {
                   ct++;
                   if(callback != undefined && ct >= ln) callback();
                   if(progress)progress(ct, ln);
                });
                ln++;
            });
        }
        if(assets.data) {
           _(assets.data).each(function(val, key) {
                self.loadAsset('data', key, val, function(asset) {
                    ct++;
                    if(callback != undefined && ct >= ln) callback();
                    if(progress)progress(ct, ln);
                });
                ln++;
           });
        }
    },
    loadAsset: function(type, name, src, callback) {
      var self = this;
      if(name in this.assets) {
        if(callback) callback();
        return;
      }
      switch(type) {
        case 'audio':
        case 'sound': 
            var temp = new Audio(src);
            temp.src = src;
            temp.load();
            this.assets[name] = temp;
            Jxl.audio.add(name, temp);
            if(callback) callback(temp);
            break;
        case 'image':
            var temp = document.createElement('img');
            temp.src = src;
            temp.addEventListener('load', function() {
                var can = document.createElement('canvas');
                can.width = this.width;
                can.height = this.height;
                var ctx = can.getContext('2d');
                ctx.drawImage(this, 0, 0);
   
                if(Jxl.scale.x != 1 || Jxl.scale.y != 1) {
                    can.scaled = scaleImage(can, Jxl.scale);
                }
                self.assets[name] = can;
                if(callback) callback(can);
            }, true);
        break;
        case 'data':
            var xmlHTTP = new XMLHttpRequest();
            xmlHTTP.onreadystatechange = function() {
                if(xmlHTTP.readyState == 4 && xmlHTTP.status==200) {
                    self.assets[name] = xmlHTTP.responseText;
                    if(callback) callback(xmlHTTP.responseText);
                }
            }
            xmlHTTP.open("GET", src, true);
            xmlHTTP.send();
      }
    }
});


function scaleImage(img, scale) {
    var tmp = document.createElement('canvas');
    tmp.width = img.width*scale.x;
    tmp.height = img.height*scale.y;
    var ctx = tmp.getContext('2d');
    var imgCtx = img.getContext('2d');
    var imgData = imgCtx.getImageData(0, 0, img.width, img.height);  
    var tmpData = ctx.getImageData(0, 0, tmp.width, tmp.height);

    for(var x=0; x < tmp.width; x++) {
        for(var y=0; y < tmp.height; y++) {
            var i = 4*(Math.floor(y/Jxl.scale.y)*img.width+Math.floor(x/Jxl.scale.x));
            var ni = 4*(y*tmp.width+x);
            
            for(var s=0; s<4;s++) {
                tmpData.data[ni+s] = imgData.data[i+s];
            }
        }
    }
    ctx.putImageData(tmpData, 0, 0);
    return tmp;
}

/*** Utility ***/
def('Jxl.List', {
    init: function() {
        this.object = null;
        this.next = null;
    }
});

def('Jxl.QuadTree', {
    extend: Jxl.Rect,
    init: function(x, y, width, height, parent) {
        Jxl.Rect.prototype.init.call(this, x, y, width, height);
        this._headA = this._tailA = new Jxl.List();
        this._headB = this._tailB = new Jxl.List();

        if (parent != undefined) {
            var itr;
            var ot;
            if (parent._headA.object != null) {
                itr = parent._headA;
                while (itr != null) {
                    if (this._tailA.object != null) {
                        ot = this._tailA;
                        this._tailA = new Jxl.List();
                        ot.next = this._tailA;
                    }
                    this.tailA.object = itr.object;
                    itr = itr.next;
                }
            }
            if (parent._headB.object != null) {
                itr = parent._headB;
                while (itr != null) {
                    if (this._tailB.object != null) {
                        ot = this._tailB;
                        this._tailB = new Jxl.List();
                        ot.next = this._tailB;
                    }
                    this._tailB.object = itr.object;
                    itr = itr.next;
                }
            }
        }
        else {
            this._min = (this.width + this.height) / (2 * Jxl.Util.quadTreeDivisions);
        }
        this._canSubdivide = (this.width > this._min) || (this.height > Jxl.QuadTree._min);
        this._nw = null;
        this._ne = null;
        this._se = null;
        this._sw = null;
        this._l = this.x;
        this._r = this.x + this.width;
        this._hw = this.width / 2;
        this._mx = this._l + this._hw;
        this._t = this.y;
        this._b = this.y + this.height;
        this._hh = this.height / 2;
        this._my = this._t + this._hh;
    },
    add: function(obj, list) {
        Jxl.QuadTree._oa = list;

        if (obj._group) {
            var m;
            var members = obj.members;
            var l = members.length;

            for (var i = 0; i < l; i++) {
                m = members[i];
                if ((m !== null) && m.exists) {
                    if (m._group) this.add(m, list);
                    else if (m.solid) {
                        Jxl.QuadTree._o = m;
                        Jxl.QuadTree._ol = Jxl.QuadTree._o.x;
                        Jxl.QuadTree._ot = Jxl.QuadTree._o.y;
                        Jxl.QuadTree._or = Jxl.QuadTree._o.x + Jxl.QuadTree._o.width;
                        Jxl.QuadTree._ob = Jxl.QuadTree._o.y + Jxl.QuadTree._o.height;
                        this.addObject();
                    }
                }
            }
        }
        if (obj.solid) {
            Jxl.QuadTree._o = obj;
            Jxl.QuadTree._ol = Jxl.QuadTree._o.x;
            Jxl.QuadTree._ot = Jxl.QuadTree._o.y;
            Jxl.QuadTree._or = Jxl.QuadTree._o.x + Jxl.QuadTree._o.width;
            Jxl.QuadTree._ob = Jxl.QuadTree._o.y + Jxl.QuadTree._o.height;
            this.addObject();
        }
    },
    addObject: function() {
        //If this quad (not its children) lies entirely inside this object, add it here
        if (!this._canSubdivide || ((this._l >= Jxl.QuadTree._ol) && (this._r <= Jxl.QuadTree._or) && (this._t >= Jxl.QuadTree._ot) && (this._b <= Jxl.QuadTree._ob))) {
            this.addToList();
            return;
        }

        //See if the selected object fits completely inside any of the quadrants
        if ((Jxl.QuadTree._ol > this._l) && (Jxl.QuadTree._or < this._mx)) {
            if ((Jxl.QuadTree._ot > this._t) && (Jxl.QuadTree._ob < this._my)) {
                if (this._nw === null) this._nw = new Jxl.QuadTree(this._l, this._t, this._hw, this._hh, this);
                this._nw.addObject();
                return;
            }
            if ((Jxl.QuadTree._ot > this._my) && (Jxl.QuadTree._ob < this._b)) {
                if (this._sw === null) this._sw = new Jxl.QuadTree(this._l, this._my, this._hw, this._hh, this);
                this._sw.addObject();
                return;
            }
        }
        if ((Jxl.QuadTree._ol > this._mx) && (Jxl.QuadTree._or < this._r)) {
            if ((Jxl.QuadTree._ot > this._t) && (Jxl.QuadTree._ob < this._my)) {
                if (this._ne === null) this._ne = new Jxl.QuadTree(this._mx, this._t, this._hw, this._hh, this);
                this._ne.addObject();
                return;
            }
            if ((Jxl.QuadTree._ot > this._my) && (Jxl.QuadTree._ob < this._b)) {
                if (this._se === null) this._se = new Jxl.QuadTree(this._mx, this._my, this._hw, this._hh, this);
                this._se.addObject();
                return;
            }
        }

        //If it wasn't completely contained we have to check out the partial overlaps
        if ((Jxl.QuadTree._or > this._l) && (Jxl.QuadTree._ol < this._mx) && (Jxl.QuadTree._ob > this._t) && (Jxl.QuadTree._ot < this._my)) {
            if (this._nw === null) this._nw = new Jxl.QuadTree(this._l, this._t, this._hw, this._hh, this);
            this._nw.addObject();
        }
        if ((Jxl.QuadTree._or > this._mx) && (Jxl.QuadTree._ol < this._r) && (Jxl.QuadTree._ob > this._t) && (Jxl.QuadTree._ot < this._my)) {
            if (this._ne === null) this._ne = new Jxl.QuadTree(this._mx, this._t, this._hw, this._hh, this);
            this._ne.addObject();
        }
        if ((Jxl.QuadTree._or > this._mx) && (Jxl.QuadTree._ol < this._r) && (Jxl.QuadTree._ob > this._my) && (Jxl.QuadTree._ot < this._b)) {
            if (this._se === null) this._se = new Jxl.QuadTree(this._mx, this._my, this._hw, this._hh, this);
            this._se.addObject();
        }
        if ((Jxl.QuadTree._or > this._l) && (Jxl.QuadTree._ol < this._mx) && (Jxl.QuadTree._ob > this._my) && (Jxl.QuadTree._ot < this._b)) {
            if (this._sw === null) this._sw = new Jxl.QuadTree(this._l, this._my, this._hw, this._hh, this);
            this._sw.addObject();
        }
    },
    addToList: function() {
        var ot;
        if (Jxl.QuadTree._oa == Jxl.QuadTree.A_LIST) {
            if (this._tailA.object !== null) {
                ot = this._tailA;
                this._tailA = new Jxl.List();
                ot.next = this._tailA;
            }
            this._tailA.object = Jxl.QuadTree._o;
        }
        else {
            if (this._tailB.object !== null) {
                ot = this._tailB;
                this._tailB = new Jxl.List();
                ot.next = this._tailB;
            }
            this._tailB.object = Jxl.QuadTree._o;
        }
        if (!this._canSubdivide) return;
        if (this._nw !== null) this._nw.addToList();
        if (this._ne !== null) this._ne.addToList();
        if (this._se !== null) this._se.addToList();
        if (this._sw !== null) this._sw.addToList();
    },
    overlap: function(BothLists, Callback) {
        BothLists = (BothLists === undefined) ? true : BothLists;
        Callback = (Callback === undefined) ? null : Callback;

        Jxl.QuadTree._oc = Callback;
        var c = false;
        var itr;
        if (BothLists) {
            //An A-B list comparison
            Jxl.QuadTree._oa = Jxl.QuadTree.B_LIST;
            if (this._headA.object !== null) {
                itr = this._headA;
                while (itr !== null) {
                    Jxl.QuadTree._o = itr.object;
                    if (Jxl.QuadTree._o.exists && Jxl.QuadTree._o.solid && this.overlapNode()) c = true;
                    itr = itr.next;
                }
            }
            Jxl.QuadTree._oa = Jxl.QuadTree.A_LIST;
            if (this._headB.object !== null) {
                itr = this._headB;
                while (itr !== null) {
                    Jxl.QuadTree._o = itr.object;
                    if (Jxl.QuadTree._o.exists && Jxl.QuadTree._o.solid) {
                        if ((this._nw !== null) && this._nw.overlapNode()) c = true;
                        if ((this._ne !== null) && this._ne.overlapNode()) c = true;
                        if ((this._se !== null) && this._se.overlapNode()) c = true;
                        if ((this._sw !== null) && this._sw.overlapNode()) c = true;
                    }
                    itr = itr.next;
                }
            }
        }
        else {
            //Just checking the A list against itself
            if (this._headA.object !== null) {
                itr = this._headA;
                while (itr != null) {
                    Jxl.QuadTree._o = itr.object;
                    if (Jxl.QuadTree._o.exists && Jxl.QuadTree._o.solid && this.overlapNode(itr.next)) c = true;
                    itr = itr.next;
                }
            }
        }

        //Advance through the tree by calling overlap on each child
        if ((this._nw != null) && this._nw.overlap(BothLists, Jxl.QuadTree._oc)) c = true;
        if ((this._ne != null) && this._ne.overlap(BothLists, Jxl.QuadTree._oc)) c = true;
        if ((this._se != null) && this._se.overlap(BothLists, Jxl.QuadTree._oc)) c = true;
        if ((this._sw != null) && this._sw.overlap(BothLists, Jxl.QuadTree._oc)) c = true;

        return c;
    },
    overlapNode: function(Iterator) {
        Iterator = (Iterator === undefined) ? null : Iterator;

        //member list setup
        var c = false;
        var co;
        var itr = Iterator;
        if (itr == null) {
            if (this._oa == Jxl.QuadTree.A_LIST) itr = this._headA;
            else itr = this._headB;
        }

        //Make sure this is a valid list to walk first!
        if (itr.object != null) {
            //Walk the list and check for overlaps
            while (itr != null) {
                co = itr.object;
                if ((Jxl.QuadTree._o === co) || !co.exists || !Jxl.QuadTree._o.exists || !co.solid || !Jxl.QuadTree._o.solid || (Jxl.QuadTree._o.x + Jxl.QuadTree._o.width < co.x + Jxl.Util.roundingError) || (Jxl.QuadTree._o.x + Jxl.Util.roundingError > co.x + co.width) || (Jxl.QuadTree._o.y + Jxl.QuadTree._o.height < co.y + Jxl.Util.roundingError) || (Jxl.QuadTree._o.y + Jxl.Util.roundingError > co.y + co.height)) {
                    itr = itr.next;
                    continue;
                }
                if (Jxl.QuadTree._oc == null) {
                    Jxl.QuadTree._o.kill();
                    co.kill();
                    c = true;
                }
                else if (Jxl.QuadTree._oc(Jxl.QuadTree._o, co)) c = true;
                itr = itr.next;
            }
        }
        return c;
    }
});
Jxl.QuadTree.A_LIST = 0;
Jxl.QuadTree.B_LIST = 1;
Jxl.QuadTree.divisions = 3;
Jxl.QuadTree.quadTree = null;
Jxl.QuadTree.bounds = null;

def('Jxl.Util', {
    roundingError: 0.0000001,
    quadTreeDivisions: 3,
    singleton: true,
    random: function(Seed) {
        if ((Seed == undefined) || Seed === undefined) return Math.random();
        else {
            //Make sure the seed value is OK
            if (Seed == 0) Seed = Number.MIN_VALUE; // don't think this works
            if (Seed >= 1) {
                if ((Seed % 1) == 0) Seed /= Math.PI;
                Seed %= 1;
            }
            else if (Seed < 0) Seed = (Seed % 1) + 1;

            //Then do an LCG thing and return a predictable random number
            return ((69621 * Math.floor(Seed * 0x7FFFFFFF)) % 0x7FFFFFFF) / 0x7FFFFFFF;
        }
    },
    overlap: function(obj1, obj2, callback) {
        if ((obj1 == null) || !obj1.exists || (obj2 == null) || !obj2.exists) return false;
        quadTree = new Jxl.QuadTree(Jxl.QuadTree.bounds.x, Jxl.QuadTree.bounds.y, Jxl.QuadTree.bounds.width, Jxl.QuadTree.bounds.height);
        quadTree.add(obj1, Jxl.QuadTree.A_LIST);
        if (obj1 === obj2) return quadTree.overlap(false, callback);
        quadTree.add(obj2, Jxl.QuadTree.B_LIST);
        return quadTree.overlap(true, callback);
    },
    makeRGBA: function(Color) {
        var f = Color.toString(16);
        var a = parseInt(f.substr(0, 2), 16) / 255;
        var r = parseInt(f.substr(2, 2), 16);
        var g = parseInt(f.substr(4, 2), 16);
        var b = parseInt(f.substr(6, 2), 16);

        return ("rgba(" + r + "," + g + "," + b + "," + a + ")");
    },
    collide: function(obj1, obj2) {
        if ((obj1 == null) || !obj1.exists || (obj2 == null) || !obj2.exists) return false;

        quadTree = new Jxl.QuadTree(Jxl.QuadTree.bounds.x, Jxl.QuadTree.bounds.y, Jxl.QuadTree.bounds.width, Jxl.QuadTree.bounds.height);
        quadTree.add(obj1, Jxl.QuadTree.A_LIST);
        var match = obj1 === obj2;
        if (!match) quadTree.add(obj2, Jxl.QuadTree.B_LIST);
        var cx = quadTree.overlap(!match, Jxl.Util.solveXCollision);
        var cy = quadTree.overlap(!match, Jxl.Util.solveYCollision);
        return cx || cy;
    },
    rotatePoint: function(x, y, pivotX, pivotY, angle, p) {
        if (p == undefined) p = new JxlPoint();
        var radians = -angle / 180 * Math.PI;
        var dx = x - pivotX;
        var dy = pivotY - y;
        p.x = pivotX + Math.cos(radians) * dx - Math.sin(radians) * dy;
        p.y = pivotY - (Math.sin(radians) * dx + Math.cos(radians) * dy);
        return p;
    },
    solveXCollision: function(obj1, obj2) {
        //Avoid messed up collisions ahead of time
        var o1 = obj1.colVector.x;
        var o2 = obj2.colVector.x;
        if (o1 == o2) return false;

        //Give the objs a heads up that we're about to resolve some collisions
        obj1.preCollide(obj2);
        obj2.preCollide(obj1);

        //Basic resolution variables
        var f1;
        var f2;
        var overlap;
        var hit = false;
        var p1hn2;

        //Directional variables
        var obj1Stopped = o1 == 0;
        var obj1MoveNeg = o1 < 0;
        var obj1MovePos = o1 > 0;
        var obj2Stopped = o2 == 0;
        var obj2MoveNeg = o2 < 0;
        var obj2MovePos = o2 > 0;

        //Offset loop variables
        var i1;
        var i2;
        var obj1Hull = obj1.colHullX;
        var obj2Hull = obj2.colHullX;
        var co1 = obj1.colOffsets;
        var co2 = obj2.colOffsets;
        var l1 = co1.length;
        var l2 = co2.length;
        var ox1;
        var oy1;
        var ox2;
        var oy2;
        var r1;
        var r2;
        var sv1;
        var sv2;

        //Decide based on obj's movement patterns if it was a right-side or left-side collision
        p1hn2 = ((obj1Stopped && obj2MoveNeg) || (obj1MovePos && obj2Stopped) || (obj1MovePos && obj2MoveNeg) || //the obvious cases
        (obj1MoveNeg && obj2MoveNeg && (((o1 > 0) ? o1 : -o1) < ((o2 > 0) ? o2 : -o2))) || //both moving left, obj2 overtakes obj1
        (obj1MovePos && obj2MovePos && (((o1 > 0) ? o1 : -o1) > ((o2 > 0) ? o2 : -o2)))); //both moving right, obj1 overtakes obj2
        //Check to see if these objs allow these collisions
        if (p1hn2 ? (!obj1.collideRight || !obj2.collideLeft) : (!obj1.collideLeft || !obj2.collideRight)) return false;

        //this looks insane, but we're just looping through collision offsets on each obj
        for (i1 = 0; i1 < l1; i1++) {
            ox1 = co1[i1].x;
            oy1 = co1[i1].y;
            obj1Hull.x += ox1;
            obj1Hull.y += oy1;
            for (i2 = 0; i2 < l2; i2++) {
                ox2 = co2[i2].x;
                oy2 = co2[i2].y;
                obj2Hull.x += ox2;
                obj2Hull.y += oy2;

                //See if it's a actually a valid collision
                if ((obj1Hull.x + obj1Hull.width < obj2Hull.x + Jxl.Util.roundingError) || (obj1Hull.x + Jxl.Util.roundingError > obj2Hull.x + obj2Hull.width) || (obj1Hull.y + obj1Hull.height < obj2Hull.y + Jxl.Util.roundingError) || (obj1Hull.y + Jxl.Util.roundingError > obj2Hull.y + obj2Hull.height)) {
                    obj2Hull.x -= ox2;
                    obj2Hull.y -= oy2;
                    continue;
                }

                //Calculate the overlap between the objs
                if (p1hn2) {
                    if (obj1MoveNeg) r1 = obj1Hull.x + obj1.colHullY.width;
                    else r1 = obj1Hull.x + obj1Hull.width;
                    if (obj2MoveNeg) r2 = obj2Hull.x;
                    else r2 = obj2Hull.x + obj2Hull.width - obj2.colHullY.width;
                }
                else {
                    if (obj2MoveNeg) r1 = -obj2Hull.x - obj2.colHullY.width;
                    else r1 = -obj2Hull.x - obj2Hull.width;
                    if (obj1MoveNeg) r2 = -obj1Hull.x;
                    else r2 = -obj1Hull.x - obj1Hull.width + obj1.colHullY.width;
                }
                overlap = r1 - r2;

                //Last chance to skip out on a bogus collision resolution
                if ((overlap == 0) || ((!obj1.fixed && ((overlap > 0) ? overlap : -overlap) > obj1Hull.width * 0.8)) || ((!obj2.fixed && ((overlap > 0) ? overlap : -overlap) > obj2Hull.width * 0.8))) {
                    obj2Hull.x -= ox2;
                    obj2Hull.y -= oy2;
                    continue;
                }

                hit = true;

                //Adjust the objs according to their flags and stuff
                sv1 = obj2.velocity.x;
                sv2 = obj1.velocity.x;
                if (!obj1.fixed && obj2.fixed) {
                    if (obj1._group) obj1.reset(obj1.x - overlap, obj1.y);
                    else obj1.x -= overlap;
                }
                else if (obj1.fixed && !obj2.fixed) {
                    if (obj2._group) obj2.reset(obj2.x + overlap, obj2.y);
                    else obj2.x += overlap;
                }
                else if (!obj1.fixed && !obj2.fixed) {
                    overlap /= 2;
                    if (obj1._group) obj1.reset(obj1.x - overlap, obj1.y);
                    else obj1.x -= overlap;
                    if (obj2._group) obj2.reset(obj2.x + overlap, obj2.y);
                    else obj2.x += overlap;
                    sv1 /= 2;
                    sv2 /= 2;
                }
                if (p1hn2) {
                    obj1.hitRight(obj2, sv1);
                    obj2.hitLeft(obj1, sv2);
                }
                else {
                    obj1.hitLeft(obj2, sv1);
                    obj2.hitRight(obj1, sv2);
                }

                //Adjust collision hulls if necessary
                if (!obj1.fixed && (overlap != 0)) {
                    if (p1hn2) obj1Hull.width -= overlap;
                    else {
                        obj1Hull.x -= overlap;
                        obj1Hull.width += overlap;
                    }
                    obj1.colHullY.x -= overlap;
                }
                if (!obj2.fixed && (overlap != 0)) {
                    if (p1hn2) {
                        obj2Hull.x += overlap;
                        obj2Hull.width -= overlap;
                    }
                    else obj2Hull.width += overlap;
                    obj2.colHullY.x += overlap;
                }
                obj2Hull.x -= ox2;
                obj2Hull.y -= oy2;
            }
            obj1Hull.x -= ox1;
            obj1Hull.y -= oy1;
        }

        return hit;
    },
    solveYCollision: function(obj1, obj2) {
        var o1 = obj1.colVector.y;
        var o2 = obj2.colVector.y;
        if (o1 == o2) return false;

        //Give the objs a heads up that we're about to resolve some collisions
        obj1.preCollide(obj2);
        obj2.preCollide(obj1);

        //Basic resolution variables
        var overlap;
        var hit = false;
        var p1hn2;

        //Directional variables
        var obj1Stopped = o1 == 0;
        var obj1MoveNeg = o1 < 0;
        var obj1MovePos = o1 > 0;
        var obj2Stopped = o2 == 0;
        var obj2MoveNeg = o2 < 0;
        var obj2MovePos = o2 > 0;

        //Offset loop variables
        var i1;
        var i2;
        var obj1Hull = obj1.colHullY;
        var obj2Hull = obj2.colHullY;
        var co1 = obj1.colOffsets;
        var co2 = obj2.colOffsets;
        var l1 = co1.length;
        var l2 = co2.length;
        var ox1;
        var oy1;
        var ox2;
        var oy2;
        var r1;
        var r2;
        var sv1;
        var sv2;

        //Decide based on obj's movement patterns if it was a top or bottom collision
        p1hn2 = ((obj1Stopped && obj2MoveNeg) || (obj1MovePos && obj2Stopped) || (obj1MovePos && obj2MoveNeg) || //the obvious cases
        (obj1MoveNeg && obj2MoveNeg && (((o1 > 0) ? o1 : -o1) < ((o2 > 0) ? o2 : -o2))) || //both moving up, obj2 overtakes obj1
        (obj1MovePos && obj2MovePos && (((o1 > 0) ? o1 : -o1) > ((o2 > 0) ? o2 : -o2)))); //both moving down, obj1 overtakes obj2
        //Check to see if these objs allow these collisions
        if (p1hn2 ? (!obj1.collideBottom || !obj2.collideTop) : (!obj1.collideTop || !obj2.collideBottom)) return false;

        //this looks insane, but we're just looping through collision offsets on each obj
        for (i1 = 0; i1 < l1; i1++) {
            ox1 = co1[i1].x;
            oy1 = co1[i1].y;
            obj1Hull.x += ox1;
            obj1Hull.y += oy1;
            for (i2 = 0; i2 < l2; i2++) {
                ox2 = co2[i2].x;
                oy2 = co2[i2].y;
                obj2Hull.x += ox2;
                obj2Hull.y += oy2;

                //See if it's a actually a valid collision
                if ((obj1Hull.x + obj1Hull.width < obj2Hull.x + Jxl.Util.roundingError) || (obj1Hull.x + Jxl.Util.roundingError > obj2Hull.x + obj2Hull.width) || (obj1Hull.y + obj1Hull.height < obj2Hull.y + Jxl.Util.roundingError) || (obj1Hull.y + Jxl.Util.roundingError > obj2Hull.y + obj2Hull.height)) {
                    obj2Hull.x -= ox2;
                    obj2Hull.y -= oy2;
                    continue;
                }

                //Calculate the overlap between the objs
                if (p1hn2) {
                    if (obj1MoveNeg) r1 = obj1Hull.y + obj1.colHullX.height;
                    else r1 = obj1Hull.y + obj1Hull.height;
                    if (obj2MoveNeg) r2 = obj2Hull.y;
                    else r2 = obj2Hull.y + obj2Hull.height - obj2.colHullX.height;
                }
                else {
                    if (obj2MoveNeg) r1 = -obj2Hull.y - obj2.colHullX.height;
                    else r1 = -obj2Hull.y - obj2Hull.height;
                    if (obj1MoveNeg) r2 = -obj1Hull.y;
                    else r2 = -obj1Hull.y - obj1Hull.height + obj1.colHullX.height;
                }
                overlap = r1 - r2;

                //Last chance to skip out on a bogus collision resolution
                if ((overlap == 0) || ((!obj1.fixed && ((overlap > 0) ? overlap : -overlap) > obj1Hull.height * 0.8)) || ((!obj2.fixed && ((overlap > 0) ? overlap : -overlap) > obj2Hull.height * 0.8))) {
                    obj2Hull.x -= ox2;
                    obj2Hull.y -= oy2;
                    continue;
                }
                hit = true;

                //Adjust the objs according to their flags and stuff
                sv1 = obj2.velocity.y;
                sv2 = obj1.velocity.y;
                if (!obj1.fixed && obj2.fixed) {
                    if (obj1._group) obj1.reset(obj1.x, obj1.y - overlap);
                    else obj1.y -= overlap;
                }
                else if (obj1.fixed && !obj2.fixed) {
                    if (obj2._group) obj2.reset(obj2.x, obj2.y + overlap);
                    else obj2.y += overlap;
                }
                else if (!obj1.fixed && !obj2.fixed) {
                    overlap /= 2;
                    if (obj1._group) obj1.reset(obj1.x, obj1.y - overlap);
                    else obj1.y -= overlap;
                    if (obj2._group) obj2.reset(obj2.x, obj2.y + overlap);
                    else obj2.y += overlap;
                    sv1 /= 2;
                    sv2 /= 2;
                }
                if (p1hn2) {
                    obj1.hitBottom(obj2, sv1);
                    obj2.hitTop(obj1, sv2);
                }
                else {
                    obj1.hitTop(obj2, sv1);
                    obj2.hitBottom(obj1, sv2);
                }

                //Adjust collision hulls if necessary
                if (!obj1.fixed && (overlap != 0)) {
                    if (p1hn2) {
                        obj1Hull.y -= overlap;

                        //This code helps stuff ride horizontally moving platforms.
                        if (obj2.fixed && obj2.moves) {
                            sv1 = obj2.colVector.x;
                            obj1.x += sv1;
                            obj1Hull.x += sv1;
                            obj1.colHullX.x += sv1;
                        }
                    }
                    else {
                        obj1Hull.y -= overlap;
                        obj1Hull.height += overlap;
                    }
                }
                if (!obj2.fixed && (overlap != 0)) {
                    if (p1hn2) {
                        obj2Hull.y += overlap;
                        obj2Hull.height -= overlap;
                    }
                    else {
                        obj2Hull.height += overlap;

                        //This code helps stuff ride horizontally moving platforms.
                        if (obj1.fixed && obj1.moves) {
                            sv2 = obj1.colVector.x;
                            obj2.x += sv2;
                            obj2Hull.x += sv2;
                            obj2.colHullX.x += sv2;
                        }
                    }
                }
                obj2Hull.x -= ox2;
                obj2Hull.y -= oy2;
            }
            obj1Hull.x -= ox1;
            obj1Hull.y -= oy1;
        }

        return hit;
    },
    getAngle: function(x, y) {
        return Math.atan2(y, x) * 180 / Math.PI;
    },
    computeVelocity: function(velocity, acceleration, drag, max) {
        if (acceleration == undefined) acceleration = 0;
        if (drag == undefined) drag = 0;
        if (max == undefined) max = 10000;

        if (acceleration != 0) velocity += acceleration * Jxl.delta;
        else if (drag != 0) {
            var d = drag * Jxl.delta;
            if (velocity - d > 0) velocity -= d;
            else if (velocity + d < 0) velocity += d;
            else velocity = 0;
        }
        if ((velocity != 0) && (max != 10000)) {
            if (velocity > max) velocity = max;
            else if (velocity < -max) velocity = -max;
        }
        return velocity;
    },
    range: function(min, max) {
        return Math.random()*(Math.abs(min)+max)-Math.abs(min);
    },
    setWorldBounds: function(X, Y, Width, Height, Divisions) {
        //Set default values for optional parameters
        X = ((X == undefined)) ? 0 : X;
        Y = ((Y == undefined)) ? 0 : Y;
        Width = ((Width == undefined)) ? 0 : Width;
        Height = ((Height == undefined)) ? 0 : Height;
        Divisions = ((Divisions == undefined)) ? 3 : Divisions;

        if (Jxl.QuadTree.bounds == null) Jxl.QuadTree.bounds = new Jxl.Rect();
        Jxl.QuadTree.bounds.x = X;
        Jxl.QuadTree.bounds.y = Y;
        if (Width > 0) Jxl.QuadTree.bounds.width = Width;
        if (Height > 0) Jxl.QuadTree.bounds.height = Height;
        if (Divisions > 0) Jxl.QuadTree.divisions = Divisions;
    }
});

def('Jxl.Particle', {
    extend: Jxl.Sprite,
    init: function(options) {
        Jxl.Sprite.prototype.init.call(this, params);
        this._bounce = params.bounce;
    },
    hitSide: function(Contact, Velocity) {
        this.velocity.x = -this.velocity.x * this._bounce;
        if (this.angularVelocity != 0) this.angularVelocity = -this.angularVelocity * this._bounce;
    },
    hitBottom: function(Contact, Velocity) {
        this.onFloor = true;
        if (((this.velocity.y > 0) ? this.velocity.y : -this.velocity.y) > this._bounce * 100) {
            this.velocity.y = -this.velocity.y * this._bounce;
            if (this.angularVelocity != 0) this.angularVelocity *= -this._bounce;
        }
        else {
            this.angularVelocity = 0;
            Jxl.Sprite.prototype.hitBottom.call(this, Contact, Velocity);
        }
        this.velocity.x *= this._bounce;
    }
});

def('Jxl.Emitter', {
    extend: Jxl.Group,
    init: function(params) {
        Jxl.Group.prototype.init.call(this, params);
        _(this).extend({
            width: 0,
            height: 0,
            minParticleSpeed: new Jxl.Point({
                x: -100,
                y: -100
            }),
            maxParticleSpeed: new Jxl.Point({
                x: 100,
                y: 100
            }),
            minRotation: -360,
            maxRotation: 360,
            gravity: 400,
            particleDrag: new Jxl.Point(),
            delay: 0,
            quantity: 0,
            _counter: 0,
            _explode: true,
            _particle: 0,
            exists: false,
            on: false,
            justEmitted: false
        });
        this.applyParams(params);
    },
    createSprites: function(Graphics, Quantity, Dimensions, Multiple, Collide, Bounce) {
        Quantity = (Quantity == undefined) ? 50 : Quantity;
        Dimensions = (Dimensions === undefined) ? new JxlPoint(Graphics.width, Graphics.height) : Dimensions;
        Multiple = (Multiple === undefined) ? true : Multiple;
        Collide = (Collide == undefined) ? 0 : Collide;
        Bounce = (Bounce == undefined) ? 0 : Bounce;

        this.members = new Array();
        var r;
        var s;
        var tf = 1;
        var sw;
        var sh;
        if (Multiple) {
            s = new Jxl.Sprite().loadGraphic({graphic:Graphics, animated:true, width: Dimensions.x, height:Dimensions.y});
            tf = s.frames;
        }
        var i = 0;
        while (i < Quantity) {
            if ((Collide) && (Bounce > 0)) s = new Jxl.Particle({
                bounce: Bounce
            });
            else s = new Jxl.Sprite();

            if (Multiple) {
                r = Math.random() * tf;
                s.loadGraphic({graphic:Graphics, animated:true, width: Dimensions.x, height:Dimensions.y});
                s.frame = r;
            }
            else {
                s.loadGraphic({graphic:Graphics});
            }
            if (Collide > 0) {
                sw = s.width;
                sh = s.height;
                s.width *= Collide;
                s.height *= Collide;
                s.offset.x = (sw - s.width) / 2;
                s.offset.y = (sh - s.height) / 2;
                s.solid = true;
            }
            else s.solid = false;
            s.exists = false;
            this.add(s);
            i++;
        }
        return this;
    },
    setSize: function(Width, Height) {
        this.width = Width;
        this.height = Height;
    },
    setXSpeed: function(Min, Max) {
        Min = (Min == undefined) ? 0 : Min;
        Max = (Max == undefined) ? 0 : Max;

        this.minParticleSpeed.x = Min;
        this.maxParticleSpeed.x = Max;
    },
    setYSpeed: function(Min, Max) {
        Min = (Min == undefined) ? 0 : Min;
        Max = (Max == undefined) ? 0 : Max;

        this.minParticleSpeed.y = Min;
        this.maxParticleSpeed.y = Max;
    },
    setRotation: function(Min, Max) {
        Min = (Min == undefined) ? 0 : Min;
        Max = (Max == undefined) ? 0 : Max;

        this.minRotation = Min;
        this.maxRotation = Max;
    },
    updateEmitter: function() {
        if (this._explode) {
            this._timer += Jxl.delta;
            if ((this.delay > 0) && (this._timer > this.delay)) {
                this.kill();
                return;
            }
            if (this.on) {
                this.on = false;
                var i = this._particle;
                var l = this.members.length;
                if (this.quantity > 0) l = this.quantity;
                l += this._particle;
                while (i < l) {
                    this.emitParticle();
                    i++;
                }
            }
            return;
        }
        if (!this.on) return;
        this._timer += Jxl.delta;
        while ((this._timer > this.delay) && ((this.quantity <= 0) || (this._counter < this.quantity))) {
            this._timer -= this.delay;
            this.emitParticle();
        }
    },
    updateMembers: function() {
        var o;
        var i = 0;
        var l = this.members.length;
        while (i < l) {
            o = this.members[i++];
            if ((o !== undefined && o !== null) && o.exists && o.active) o.update();
        }
    },
    update: function() {
        this.justEmitted = false;
        Jxl.Group.prototype.update.call(this);
        this.updateEmitter();
    },
    start: function(Explode, Delay, Quantity) {
        Explode = (Explode === undefined) ? true : Explode;
        Delay = isNaN(Delay) ? 0 : Delay;
        Quantity = (Quantity == undefined) ? 0 : Quantity;

        if (this.members.length <= 0) {
            return this;
        }
        this._explode = Explode;
        if (!this._explode) this._counter = 0;
        if (!this.exists) this._particle = 0;
        this.exists = true;
        this.visible = true;
        this.active = true;
        this.dead = false;
        this.on = true;
        this._timer = 0;
        if (this.quantity == 0) this.quantity = Quantity;
        else if (Quantity != 0) this.quantity = Quantity;
        if (Delay != 0) this.delay = Delay;
        if (this.delay < 0) this.delay = -this.delay;
        if (this.delay == 0) {
            if (Explode) this.delay = 3; //default value for particle explosions
            else this.delay = 0.1; //default value for particle streams
        }
        return this;
    },
    emitParticle: function() {
        this._counter++;
        var s = this.members[this._particle];
        s.visible = true;
        s.exists = true;
        s.active = true;
        s.x = this.x - (s.width >> 1) + Math.random() * this.width;
        s.y = this.y - (s.height >> 1) + Math.random() * this.height;
        s.velocity.x = this.minParticleSpeed.x;
        if (this.minParticleSpeed.x != this.maxParticleSpeed.x) s.velocity.x += Math.random() * (this.maxParticleSpeed.x - this.minParticleSpeed.x);
        s.velocity.y = this.minParticleSpeed.y;
        if (this.minParticleSpeed.y != this.maxParticleSpeed.y) s.velocity.y += Math.random() * (this.maxParticleSpeed.y - this.minParticleSpeed.y);
        s.acceleration.y = this.gravity;
        s.angularVelocity = this.minRotation;
        if (this.minRotation != this.maxRotation) s.angularVelocity += Math.random() * (this.maxRotation - this.minRotation);
        if (s.angularVelocity != 0) s.angle = Math.random() * 360 - 180;
        s.drag.x = this.particleDrag.x;
        s.drag.y = this.particleDrag.y;
        this._particle++;
        if (this._particle >= this.members.length) this._particle = 0;
        s.onEmit();
        this.justEmitted = true;
    },
    stop: function(Delay) {
        Delay = (Delay == undefined) ? 3 : Delay;

        this._explode = true;
        this.delay = Delay;
        if (this.delay < 0) this.delay = -Delay;
        this.on = false;
    },
    at: function(Obj) {
        Obj.resetHelpers();
        this.x = Obj.x + Obj.origin.x;
        this.y = Obj.y + Obj.origin.y;
    },
    kill: function() {
        Jxl.Group.prototype.kill.call(this);
        this.on = false;
    },
    render: function() {
        Jxl.Group.prototype.render.call(this);
    }
});
def('Jxl.Mouse', {
    extend: Jxl.Object,
    init: function() {
        Jxl.Object.prototype.init.call(this);
        var self = this;
        Jxl.canvas.addEventListener('mousemove', function(e) {
            self.x = e.x/Jxl.scale.x;
            self.y = e.y/Jxl.scale.x;
        }, true);
        Jxl.canvas.addEventListener('click', function(e) {
            //collide with objects.. set special flag about type of click
        }, true);
        Jxl.canvas.addEventListener('contextmenu', function(e){
            console.log([self.x, self.y]);
            if(e.preventDefault)
                e.preventDefault();
            else
                e.returnValue= false;
            return false;
        }, true);
        _(this).extend({
            scrollFactor: new Jxl.Point({x: 0, y: 0}),
        });
    },
    width: 1,
    height: 1
});

def('Jxl.Keyboard', {
    init: function() {
        var self = this;
        window.addEventListener('keydown', function(e) {
            self.keys[String.fromCharCode(e.keyCode)] = true;
            self.keys[e.keyCode] = true;
            e.preventDefault();
            if(!(e.keyCode in self.pressed)) {
                self.pressed[String.fromCharCode(e.keyCode)] = true;
                self.pressed[e.keyCode] = true;
            }   
        }, true);
        window.addEventListener('keyup', function(e) {
            e.preventDefault();
            delete self.keys[e.keyCode];
            delete self.keys[String.fromCharCode(e.keyCode)];
            delete self.pressed[String.fromCharCode(e.keyCode)];
            delete self.pressed[e.keyCode];
        }, true);

        document.body.addEventListener('touchstart', function(e) {
            self.touch = true;
            self.touchPress = true;
            e.preventDefault();
        }, true);
        document.body.addEventListener('touchstop', function(e) {
            self.touch = false;
            e.preventDefault();
        }, true);
        
    },
    touch: false,
    touchPress: false,
    pressed: {},
    keys: {},
    on: function(key) {
        return this.keys[key];
    },
    press: function(key) {
        return this.pressed[key];
    },
    update: function() {
        var self = this;
        _(this.pressed).each(function(val, key) {
            self.pressed[key] = false; 
        });
        self.touchPress = false;
    }
});
