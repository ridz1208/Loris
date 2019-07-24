require=(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict'

exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

// Support decoding URL-safe base64 strings, as Node.js does.
// See: https://en.wikipedia.org/wiki/Base64#URL_applications
revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function getLens (b64) {
  var len = b64.length

  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // Trim off extra bytes after placeholder bytes are found
  // See: https://github.com/beatgammit/base64-js/issues/42
  var validLen = b64.indexOf('=')
  if (validLen === -1) validLen = len

  var placeHoldersLen = validLen === len
    ? 0
    : 4 - (validLen % 4)

  return [validLen, placeHoldersLen]
}

// base64 is 4/3 + up to two characters of the original data
function byteLength (b64) {
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function _byteLength (b64, validLen, placeHoldersLen) {
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function toByteArray (b64) {
  var tmp
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]

  var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen))

  var curByte = 0

  // if there are placeholders, only get up to the last complete 4 chars
  var len = placeHoldersLen > 0
    ? validLen - 4
    : validLen

  for (var i = 0; i < len; i += 4) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 18) |
      (revLookup[b64.charCodeAt(i + 1)] << 12) |
      (revLookup[b64.charCodeAt(i + 2)] << 6) |
      revLookup[b64.charCodeAt(i + 3)]
    arr[curByte++] = (tmp >> 16) & 0xFF
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 2) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 2) |
      (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 1) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 10) |
      (revLookup[b64.charCodeAt(i + 1)] << 4) |
      (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] +
    lookup[num >> 12 & 0x3F] +
    lookup[num >> 6 & 0x3F] +
    lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp =
      ((uint8[i] << 16) & 0xFF0000) +
      ((uint8[i + 1] << 8) & 0xFF00) +
      (uint8[i + 2] & 0xFF)
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(
      uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)
    ))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    parts.push(
      lookup[tmp >> 2] +
      lookup[(tmp << 4) & 0x3F] +
      '=='
    )
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + uint8[len - 1]
    parts.push(
      lookup[tmp >> 10] +
      lookup[(tmp >> 4) & 0x3F] +
      lookup[(tmp << 2) & 0x3F] +
      '='
    )
  }

  return parts.join('')
}

},{}],2:[function(require,module,exports){

},{}],3:[function(require,module,exports){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

'use strict'

var base64 = require('base64-js')
var ieee754 = require('ieee754')

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

var K_MAX_LENGTH = 0x7fffffff
exports.kMaxLength = K_MAX_LENGTH

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Print warning and recommend using `buffer` v4.x which has an Object
 *               implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * We report that the browser does not support typed arrays if the are not subclassable
 * using __proto__. Firefox 4-29 lacks support for adding new properties to `Uint8Array`
 * (See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438). IE 10 lacks support
 * for __proto__ and has a buggy typed array implementation.
 */
Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport()

if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== 'undefined' &&
    typeof console.error === 'function') {
  console.error(
    'This browser lacks typed array (Uint8Array) support which is required by ' +
    '`buffer` v5.x. Use `buffer` v4.x if you require old browser support.'
  )
}

function typedArraySupport () {
  // Can typed array instances can be augmented?
  try {
    var arr = new Uint8Array(1)
    arr.__proto__ = {__proto__: Uint8Array.prototype, foo: function () { return 42 }}
    return arr.foo() === 42
  } catch (e) {
    return false
  }
}

Object.defineProperty(Buffer.prototype, 'parent', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.buffer
  }
})

Object.defineProperty(Buffer.prototype, 'offset', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.byteOffset
  }
})

function createBuffer (length) {
  if (length > K_MAX_LENGTH) {
    throw new RangeError('The value "' + length + '" is invalid for option "size"')
  }
  // Return an augmented `Uint8Array` instance
  var buf = new Uint8Array(length)
  buf.__proto__ = Buffer.prototype
  return buf
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new TypeError(
        'The "string" argument must be of type string. Received type number'
      )
    }
    return allocUnsafe(arg)
  }
  return from(arg, encodingOrOffset, length)
}

// Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
if (typeof Symbol !== 'undefined' && Symbol.species != null &&
    Buffer[Symbol.species] === Buffer) {
  Object.defineProperty(Buffer, Symbol.species, {
    value: null,
    configurable: true,
    enumerable: false,
    writable: false
  })
}

Buffer.poolSize = 8192 // not used by this implementation

function from (value, encodingOrOffset, length) {
  if (typeof value === 'string') {
    return fromString(value, encodingOrOffset)
  }

  if (ArrayBuffer.isView(value)) {
    return fromArrayLike(value)
  }

  if (value == null) {
    throw TypeError(
      'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
      'or Array-like Object. Received type ' + (typeof value)
    )
  }

  if (isInstance(value, ArrayBuffer) ||
      (value && isInstance(value.buffer, ArrayBuffer))) {
    return fromArrayBuffer(value, encodingOrOffset, length)
  }

  if (typeof value === 'number') {
    throw new TypeError(
      'The "value" argument must not be of type number. Received type number'
    )
  }

  var valueOf = value.valueOf && value.valueOf()
  if (valueOf != null && valueOf !== value) {
    return Buffer.from(valueOf, encodingOrOffset, length)
  }

  var b = fromObject(value)
  if (b) return b

  if (typeof Symbol !== 'undefined' && Symbol.toPrimitive != null &&
      typeof value[Symbol.toPrimitive] === 'function') {
    return Buffer.from(
      value[Symbol.toPrimitive]('string'), encodingOrOffset, length
    )
  }

  throw new TypeError(
    'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
    'or Array-like Object. Received type ' + (typeof value)
  )
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(value, encodingOrOffset, length)
}

// Note: Change prototype *after* Buffer.from is defined to workaround Chrome bug:
// https://github.com/feross/buffer/pull/148
Buffer.prototype.__proto__ = Uint8Array.prototype
Buffer.__proto__ = Uint8Array

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be of type number')
  } else if (size < 0) {
    throw new RangeError('The value "' + size + '" is invalid for option "size"')
  }
}

function alloc (size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(size).fill(fill, encoding)
      : createBuffer(size).fill(fill)
  }
  return createBuffer(size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(size, fill, encoding)
}

function allocUnsafe (size) {
  assertSize(size)
  return createBuffer(size < 0 ? 0 : checked(size) | 0)
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(size)
}

function fromString (string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('Unknown encoding: ' + encoding)
  }

  var length = byteLength(string, encoding) | 0
  var buf = createBuffer(length)

  var actual = buf.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    buf = buf.slice(0, actual)
  }

  return buf
}

function fromArrayLike (array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  var buf = createBuffer(length)
  for (var i = 0; i < length; i += 1) {
    buf[i] = array[i] & 255
  }
  return buf
}

function fromArrayBuffer (array, byteOffset, length) {
  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('"offset" is outside of buffer bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('"length" is outside of buffer bounds')
  }

  var buf
  if (byteOffset === undefined && length === undefined) {
    buf = new Uint8Array(array)
  } else if (length === undefined) {
    buf = new Uint8Array(array, byteOffset)
  } else {
    buf = new Uint8Array(array, byteOffset, length)
  }

  // Return an augmented `Uint8Array` instance
  buf.__proto__ = Buffer.prototype
  return buf
}

function fromObject (obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    var buf = createBuffer(len)

    if (buf.length === 0) {
      return buf
    }

    obj.copy(buf, 0, 0, len)
    return buf
  }

  if (obj.length !== undefined) {
    if (typeof obj.length !== 'number' || numberIsNaN(obj.length)) {
      return createBuffer(0)
    }
    return fromArrayLike(obj)
  }

  if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
    return fromArrayLike(obj.data)
  }
}

function checked (length) {
  // Note: cannot use `length < K_MAX_LENGTH` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= K_MAX_LENGTH) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + K_MAX_LENGTH.toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return b != null && b._isBuffer === true &&
    b !== Buffer.prototype // so Buffer.isBuffer(Buffer.prototype) will be false
}

Buffer.compare = function compare (a, b) {
  if (isInstance(a, Uint8Array)) a = Buffer.from(a, a.offset, a.byteLength)
  if (isInstance(b, Uint8Array)) b = Buffer.from(b, b.offset, b.byteLength)
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError(
      'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
    )
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!Array.isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (isInstance(buf, Uint8Array)) {
      buf = Buffer.from(buf)
    }
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    throw new TypeError(
      'The "string" argument must be one of type string, Buffer, or ArrayBuffer. ' +
      'Received type ' + typeof string
    )
  }

  var len = string.length
  var mustMatch = (arguments.length > 2 && arguments[2] === true)
  if (!mustMatch && len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) {
          return mustMatch ? -1 : utf8ToBytes(string).length // assume utf8
        }
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// This property is used by `Buffer.isBuffer` (and the `is-buffer` npm package)
// to detect a Buffer instance. It's not possible to use `instanceof Buffer`
// reliably in a browserify context because there could be multiple different
// copies of the 'buffer' package in use. This method works even for Buffer
// instances that were created from another copy of the `buffer` package.
// See: https://github.com/feross/buffer/issues/154
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.toLocaleString = Buffer.prototype.toString

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  str = this.toString('hex', 0, max).replace(/(.{2})/g, '$1 ').trim()
  if (this.length > max) str += ' ... '
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (isInstance(target, Uint8Array)) {
    target = Buffer.from(target, target.offset, target.byteLength)
  }
  if (!Buffer.isBuffer(target)) {
    throw new TypeError(
      'The "target" argument must be one of type Buffer or Uint8Array. ' +
      'Received type ' + (typeof target)
    )
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset // Coerce to Number.
  if (numberIsNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  var strLen = string.length

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (numberIsNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset >>> 0
    if (isFinite(length)) {
      length = length >>> 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
        : (firstByte > 0xBF) ? 2
          : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + (bytes[i + 1] * 256))
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf = this.subarray(start, end)
  // Return an augmented `Uint8Array` instance
  newBuf.__proto__ = Buffer.prototype
  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset + 3] = (value >>> 24)
  this[offset + 2] = (value >>> 16)
  this[offset + 1] = (value >>> 8)
  this[offset] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  this[offset + 2] = (value >>> 16)
  this[offset + 3] = (value >>> 24)
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!Buffer.isBuffer(target)) throw new TypeError('argument should be a Buffer')
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('Index out of range')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start

  if (this === target && typeof Uint8Array.prototype.copyWithin === 'function') {
    // Use built-in when available, missing from IE11
    this.copyWithin(targetStart, start, end)
  } else if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (var i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, end),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if ((encoding === 'utf8' && code < 128) ||
          encoding === 'latin1') {
        // Fast path: If `val` fits into a single byte, use that numeric value.
        val = code
      }
    }
  } else if (typeof val === 'number') {
    val = val & 255
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : Buffer.from(val, encoding)
    var len = bytes.length
    if (len === 0) {
      throw new TypeError('The value "' + val +
        '" is invalid for argument "value"')
    }
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node takes equal signs as end of the Base64 encoding
  str = str.split('=')[0]
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = str.trim().replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

// ArrayBuffer or Uint8Array objects from other contexts (i.e. iframes) do not pass
// the `instanceof` check but they should be treated as of that type.
// See: https://github.com/feross/buffer/issues/166
function isInstance (obj, type) {
  return obj instanceof type ||
    (obj != null && obj.constructor != null && obj.constructor.name != null &&
      obj.constructor.name === type.name)
}
function numberIsNaN (obj) {
  // For IE11 support
  return obj !== obj // eslint-disable-line no-self-compare
}

},{"base64-js":1,"ieee754":6}],4:[function(require,module,exports){
(function (Buffer){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.

function isArray(arg) {
  if (Array.isArray) {
    return Array.isArray(arg);
  }
  return objectToString(arg) === '[object Array]';
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = Buffer.isBuffer;

function objectToString(o) {
  return Object.prototype.toString.call(o);
}

}).call(this,{"isBuffer":require("../../is-buffer/index.js")})
},{"../../is-buffer/index.js":8}],5:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var objectCreate = Object.create || objectCreatePolyfill
var objectKeys = Object.keys || objectKeysPolyfill
var bind = Function.prototype.bind || functionBindPolyfill

function EventEmitter() {
  if (!this._events || !Object.prototype.hasOwnProperty.call(this, '_events')) {
    this._events = objectCreate(null);
    this._eventsCount = 0;
  }

  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
var defaultMaxListeners = 10;

var hasDefineProperty;
try {
  var o = {};
  if (Object.defineProperty) Object.defineProperty(o, 'x', { value: 0 });
  hasDefineProperty = o.x === 0;
} catch (err) { hasDefineProperty = false }
if (hasDefineProperty) {
  Object.defineProperty(EventEmitter, 'defaultMaxListeners', {
    enumerable: true,
    get: function() {
      return defaultMaxListeners;
    },
    set: function(arg) {
      // check whether the input is a positive number (whose value is zero or
      // greater and not a NaN).
      if (typeof arg !== 'number' || arg < 0 || arg !== arg)
        throw new TypeError('"defaultMaxListeners" must be a positive number');
      defaultMaxListeners = arg;
    }
  });
} else {
  EventEmitter.defaultMaxListeners = defaultMaxListeners;
}

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
  if (typeof n !== 'number' || n < 0 || isNaN(n))
    throw new TypeError('"n" argument must be a positive number');
  this._maxListeners = n;
  return this;
};

function $getMaxListeners(that) {
  if (that._maxListeners === undefined)
    return EventEmitter.defaultMaxListeners;
  return that._maxListeners;
}

EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
  return $getMaxListeners(this);
};

// These standalone emit* functions are used to optimize calling of event
// handlers for fast cases because emit() itself often has a variable number of
// arguments and can be deoptimized because of that. These functions always have
// the same number of arguments and thus do not get deoptimized, so the code
// inside them can execute faster.
function emitNone(handler, isFn, self) {
  if (isFn)
    handler.call(self);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self);
  }
}
function emitOne(handler, isFn, self, arg1) {
  if (isFn)
    handler.call(self, arg1);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self, arg1);
  }
}
function emitTwo(handler, isFn, self, arg1, arg2) {
  if (isFn)
    handler.call(self, arg1, arg2);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self, arg1, arg2);
  }
}
function emitThree(handler, isFn, self, arg1, arg2, arg3) {
  if (isFn)
    handler.call(self, arg1, arg2, arg3);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self, arg1, arg2, arg3);
  }
}

function emitMany(handler, isFn, self, args) {
  if (isFn)
    handler.apply(self, args);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].apply(self, args);
  }
}

EventEmitter.prototype.emit = function emit(type) {
  var er, handler, len, args, i, events;
  var doError = (type === 'error');

  events = this._events;
  if (events)
    doError = (doError && events.error == null);
  else if (!doError)
    return false;

  // If there is no 'error' event listener then throw.
  if (doError) {
    if (arguments.length > 1)
      er = arguments[1];
    if (er instanceof Error) {
      throw er; // Unhandled 'error' event
    } else {
      // At least give some kind of context to the user
      var err = new Error('Unhandled "error" event. (' + er + ')');
      err.context = er;
      throw err;
    }
    return false;
  }

  handler = events[type];

  if (!handler)
    return false;

  var isFn = typeof handler === 'function';
  len = arguments.length;
  switch (len) {
      // fast cases
    case 1:
      emitNone(handler, isFn, this);
      break;
    case 2:
      emitOne(handler, isFn, this, arguments[1]);
      break;
    case 3:
      emitTwo(handler, isFn, this, arguments[1], arguments[2]);
      break;
    case 4:
      emitThree(handler, isFn, this, arguments[1], arguments[2], arguments[3]);
      break;
      // slower
    default:
      args = new Array(len - 1);
      for (i = 1; i < len; i++)
        args[i - 1] = arguments[i];
      emitMany(handler, isFn, this, args);
  }

  return true;
};

function _addListener(target, type, listener, prepend) {
  var m;
  var events;
  var existing;

  if (typeof listener !== 'function')
    throw new TypeError('"listener" argument must be a function');

  events = target._events;
  if (!events) {
    events = target._events = objectCreate(null);
    target._eventsCount = 0;
  } else {
    // To avoid recursion in the case that type === "newListener"! Before
    // adding it to the listeners, first emit "newListener".
    if (events.newListener) {
      target.emit('newListener', type,
          listener.listener ? listener.listener : listener);

      // Re-assign `events` because a newListener handler could have caused the
      // this._events to be assigned to a new object
      events = target._events;
    }
    existing = events[type];
  }

  if (!existing) {
    // Optimize the case of one listener. Don't need the extra array object.
    existing = events[type] = listener;
    ++target._eventsCount;
  } else {
    if (typeof existing === 'function') {
      // Adding the second element, need to change to array.
      existing = events[type] =
          prepend ? [listener, existing] : [existing, listener];
    } else {
      // If we've already got an array, just append.
      if (prepend) {
        existing.unshift(listener);
      } else {
        existing.push(listener);
      }
    }

    // Check for listener leak
    if (!existing.warned) {
      m = $getMaxListeners(target);
      if (m && m > 0 && existing.length > m) {
        existing.warned = true;
        var w = new Error('Possible EventEmitter memory leak detected. ' +
            existing.length + ' "' + String(type) + '" listeners ' +
            'added. Use emitter.setMaxListeners() to ' +
            'increase limit.');
        w.name = 'MaxListenersExceededWarning';
        w.emitter = target;
        w.type = type;
        w.count = existing.length;
        if (typeof console === 'object' && console.warn) {
          console.warn('%s: %s', w.name, w.message);
        }
      }
    }
  }

  return target;
}

EventEmitter.prototype.addListener = function addListener(type, listener) {
  return _addListener(this, type, listener, false);
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.prependListener =
    function prependListener(type, listener) {
      return _addListener(this, type, listener, true);
    };

function onceWrapper() {
  if (!this.fired) {
    this.target.removeListener(this.type, this.wrapFn);
    this.fired = true;
    switch (arguments.length) {
      case 0:
        return this.listener.call(this.target);
      case 1:
        return this.listener.call(this.target, arguments[0]);
      case 2:
        return this.listener.call(this.target, arguments[0], arguments[1]);
      case 3:
        return this.listener.call(this.target, arguments[0], arguments[1],
            arguments[2]);
      default:
        var args = new Array(arguments.length);
        for (var i = 0; i < args.length; ++i)
          args[i] = arguments[i];
        this.listener.apply(this.target, args);
    }
  }
}

function _onceWrap(target, type, listener) {
  var state = { fired: false, wrapFn: undefined, target: target, type: type, listener: listener };
  var wrapped = bind.call(onceWrapper, state);
  wrapped.listener = listener;
  state.wrapFn = wrapped;
  return wrapped;
}

EventEmitter.prototype.once = function once(type, listener) {
  if (typeof listener !== 'function')
    throw new TypeError('"listener" argument must be a function');
  this.on(type, _onceWrap(this, type, listener));
  return this;
};

EventEmitter.prototype.prependOnceListener =
    function prependOnceListener(type, listener) {
      if (typeof listener !== 'function')
        throw new TypeError('"listener" argument must be a function');
      this.prependListener(type, _onceWrap(this, type, listener));
      return this;
    };

// Emits a 'removeListener' event if and only if the listener was removed.
EventEmitter.prototype.removeListener =
    function removeListener(type, listener) {
      var list, events, position, i, originalListener;

      if (typeof listener !== 'function')
        throw new TypeError('"listener" argument must be a function');

      events = this._events;
      if (!events)
        return this;

      list = events[type];
      if (!list)
        return this;

      if (list === listener || list.listener === listener) {
        if (--this._eventsCount === 0)
          this._events = objectCreate(null);
        else {
          delete events[type];
          if (events.removeListener)
            this.emit('removeListener', type, list.listener || listener);
        }
      } else if (typeof list !== 'function') {
        position = -1;

        for (i = list.length - 1; i >= 0; i--) {
          if (list[i] === listener || list[i].listener === listener) {
            originalListener = list[i].listener;
            position = i;
            break;
          }
        }

        if (position < 0)
          return this;

        if (position === 0)
          list.shift();
        else
          spliceOne(list, position);

        if (list.length === 1)
          events[type] = list[0];

        if (events.removeListener)
          this.emit('removeListener', type, originalListener || listener);
      }

      return this;
    };

EventEmitter.prototype.removeAllListeners =
    function removeAllListeners(type) {
      var listeners, events, i;

      events = this._events;
      if (!events)
        return this;

      // not listening for removeListener, no need to emit
      if (!events.removeListener) {
        if (arguments.length === 0) {
          this._events = objectCreate(null);
          this._eventsCount = 0;
        } else if (events[type]) {
          if (--this._eventsCount === 0)
            this._events = objectCreate(null);
          else
            delete events[type];
        }
        return this;
      }

      // emit removeListener for all listeners on all events
      if (arguments.length === 0) {
        var keys = objectKeys(events);
        var key;
        for (i = 0; i < keys.length; ++i) {
          key = keys[i];
          if (key === 'removeListener') continue;
          this.removeAllListeners(key);
        }
        this.removeAllListeners('removeListener');
        this._events = objectCreate(null);
        this._eventsCount = 0;
        return this;
      }

      listeners = events[type];

      if (typeof listeners === 'function') {
        this.removeListener(type, listeners);
      } else if (listeners) {
        // LIFO order
        for (i = listeners.length - 1; i >= 0; i--) {
          this.removeListener(type, listeners[i]);
        }
      }

      return this;
    };

function _listeners(target, type, unwrap) {
  var events = target._events;

  if (!events)
    return [];

  var evlistener = events[type];
  if (!evlistener)
    return [];

  if (typeof evlistener === 'function')
    return unwrap ? [evlistener.listener || evlistener] : [evlistener];

  return unwrap ? unwrapListeners(evlistener) : arrayClone(evlistener, evlistener.length);
}

EventEmitter.prototype.listeners = function listeners(type) {
  return _listeners(this, type, true);
};

EventEmitter.prototype.rawListeners = function rawListeners(type) {
  return _listeners(this, type, false);
};

EventEmitter.listenerCount = function(emitter, type) {
  if (typeof emitter.listenerCount === 'function') {
    return emitter.listenerCount(type);
  } else {
    return listenerCount.call(emitter, type);
  }
};

EventEmitter.prototype.listenerCount = listenerCount;
function listenerCount(type) {
  var events = this._events;

  if (events) {
    var evlistener = events[type];

    if (typeof evlistener === 'function') {
      return 1;
    } else if (evlistener) {
      return evlistener.length;
    }
  }

  return 0;
}

EventEmitter.prototype.eventNames = function eventNames() {
  return this._eventsCount > 0 ? Reflect.ownKeys(this._events) : [];
};

// About 1.5x faster than the two-arg version of Array#splice().
function spliceOne(list, index) {
  for (var i = index, k = i + 1, n = list.length; k < n; i += 1, k += 1)
    list[i] = list[k];
  list.pop();
}

function arrayClone(arr, n) {
  var copy = new Array(n);
  for (var i = 0; i < n; ++i)
    copy[i] = arr[i];
  return copy;
}

function unwrapListeners(arr) {
  var ret = new Array(arr.length);
  for (var i = 0; i < ret.length; ++i) {
    ret[i] = arr[i].listener || arr[i];
  }
  return ret;
}

function objectCreatePolyfill(proto) {
  var F = function() {};
  F.prototype = proto;
  return new F;
}
function objectKeysPolyfill(obj) {
  var keys = [];
  for (var k in obj) if (Object.prototype.hasOwnProperty.call(obj, k)) {
    keys.push(k);
  }
  return k;
}
function functionBindPolyfill(context) {
  var fn = this;
  return function () {
    return fn.apply(context, arguments);
  };
}

},{}],6:[function(require,module,exports){
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = (e * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = (m * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = ((value * c) - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}],7:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],8:[function(require,module,exports){
/*!
 * Determine if an object is a Buffer
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */

// The _isBuffer check is for Safari 5-7 support, because it's missing
// Object.prototype.constructor. Remove this eventually
module.exports = function (obj) {
  return obj != null && (isBuffer(obj) || isSlowBuffer(obj) || !!obj._isBuffer)
}

function isBuffer (obj) {
  return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
}

// For Node v0.10 support. Remove this eventually.
function isSlowBuffer (obj) {
  return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isBuffer(obj.slice(0, 0))
}

},{}],9:[function(require,module,exports){
var toString = {}.toString;

module.exports = Array.isArray || function (arr) {
  return toString.call(arr) == '[object Array]';
};

},{}],10:[function(require,module,exports){
(function (process){
'use strict';

if (!process.version ||
    process.version.indexOf('v0.') === 0 ||
    process.version.indexOf('v1.') === 0 && process.version.indexOf('v1.8.') !== 0) {
  module.exports = { nextTick: nextTick };
} else {
  module.exports = process
}

function nextTick(fn, arg1, arg2, arg3) {
  if (typeof fn !== 'function') {
    throw new TypeError('"callback" argument must be a function');
  }
  var len = arguments.length;
  var args, i;
  switch (len) {
  case 0:
  case 1:
    return process.nextTick(fn);
  case 2:
    return process.nextTick(function afterTickOne() {
      fn.call(null, arg1);
    });
  case 3:
    return process.nextTick(function afterTickTwo() {
      fn.call(null, arg1, arg2);
    });
  case 4:
    return process.nextTick(function afterTickThree() {
      fn.call(null, arg1, arg2, arg3);
    });
  default:
    args = new Array(len - 1);
    i = 0;
    while (i < args.length) {
      args[i++] = arguments[i];
    }
    return process.nextTick(function afterTick() {
      fn.apply(null, args);
    });
  }
}


}).call(this,require('_process'))
},{"_process":11}],11:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],12:[function(require,module,exports){
module.exports = require('./lib/_stream_duplex.js');

},{"./lib/_stream_duplex.js":13}],13:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// a duplex stream is just a stream that is both readable and writable.
// Since JS doesn't have multiple prototypal inheritance, this class
// prototypally inherits from Readable, and then parasitically from
// Writable.

'use strict';

/*<replacement>*/

var pna = require('process-nextick-args');
/*</replacement>*/

/*<replacement>*/
var objectKeys = Object.keys || function (obj) {
  var keys = [];
  for (var key in obj) {
    keys.push(key);
  }return keys;
};
/*</replacement>*/

module.exports = Duplex;

/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/

var Readable = require('./_stream_readable');
var Writable = require('./_stream_writable');

util.inherits(Duplex, Readable);

{
  // avoid scope creep, the keys array can then be collected
  var keys = objectKeys(Writable.prototype);
  for (var v = 0; v < keys.length; v++) {
    var method = keys[v];
    if (!Duplex.prototype[method]) Duplex.prototype[method] = Writable.prototype[method];
  }
}

function Duplex(options) {
  if (!(this instanceof Duplex)) return new Duplex(options);

  Readable.call(this, options);
  Writable.call(this, options);

  if (options && options.readable === false) this.readable = false;

  if (options && options.writable === false) this.writable = false;

  this.allowHalfOpen = true;
  if (options && options.allowHalfOpen === false) this.allowHalfOpen = false;

  this.once('end', onend);
}

Object.defineProperty(Duplex.prototype, 'writableHighWaterMark', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function () {
    return this._writableState.highWaterMark;
  }
});

// the no-half-open enforcer
function onend() {
  // if we allow half-open state, or if the writable side ended,
  // then we're ok.
  if (this.allowHalfOpen || this._writableState.ended) return;

  // no more data can be written.
  // But allow more writes to happen in this tick.
  pna.nextTick(onEndNT, this);
}

function onEndNT(self) {
  self.end();
}

Object.defineProperty(Duplex.prototype, 'destroyed', {
  get: function () {
    if (this._readableState === undefined || this._writableState === undefined) {
      return false;
    }
    return this._readableState.destroyed && this._writableState.destroyed;
  },
  set: function (value) {
    // we ignore the value if the stream
    // has not been initialized yet
    if (this._readableState === undefined || this._writableState === undefined) {
      return;
    }

    // backward compatibility, the user is explicitly
    // managing destroyed
    this._readableState.destroyed = value;
    this._writableState.destroyed = value;
  }
});

Duplex.prototype._destroy = function (err, cb) {
  this.push(null);
  this.end();

  pna.nextTick(cb, err);
};
},{"./_stream_readable":15,"./_stream_writable":17,"core-util-is":4,"inherits":7,"process-nextick-args":10}],14:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// a passthrough stream.
// basically just the most minimal sort of Transform stream.
// Every written chunk gets output as-is.

'use strict';

module.exports = PassThrough;

var Transform = require('./_stream_transform');

/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/

util.inherits(PassThrough, Transform);

function PassThrough(options) {
  if (!(this instanceof PassThrough)) return new PassThrough(options);

  Transform.call(this, options);
}

PassThrough.prototype._transform = function (chunk, encoding, cb) {
  cb(null, chunk);
};
},{"./_stream_transform":16,"core-util-is":4,"inherits":7}],15:[function(require,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

/*<replacement>*/

var pna = require('process-nextick-args');
/*</replacement>*/

module.exports = Readable;

/*<replacement>*/
var isArray = require('isarray');
/*</replacement>*/

/*<replacement>*/
var Duplex;
/*</replacement>*/

Readable.ReadableState = ReadableState;

/*<replacement>*/
var EE = require('events').EventEmitter;

var EElistenerCount = function (emitter, type) {
  return emitter.listeners(type).length;
};
/*</replacement>*/

/*<replacement>*/
var Stream = require('./internal/streams/stream');
/*</replacement>*/

/*<replacement>*/

var Buffer = require('safe-buffer').Buffer;
var OurUint8Array = global.Uint8Array || function () {};
function _uint8ArrayToBuffer(chunk) {
  return Buffer.from(chunk);
}
function _isUint8Array(obj) {
  return Buffer.isBuffer(obj) || obj instanceof OurUint8Array;
}

/*</replacement>*/

/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/

/*<replacement>*/
var debugUtil = require('util');
var debug = void 0;
if (debugUtil && debugUtil.debuglog) {
  debug = debugUtil.debuglog('stream');
} else {
  debug = function () {};
}
/*</replacement>*/

var BufferList = require('./internal/streams/BufferList');
var destroyImpl = require('./internal/streams/destroy');
var StringDecoder;

util.inherits(Readable, Stream);

var kProxyEvents = ['error', 'close', 'destroy', 'pause', 'resume'];

function prependListener(emitter, event, fn) {
  // Sadly this is not cacheable as some libraries bundle their own
  // event emitter implementation with them.
  if (typeof emitter.prependListener === 'function') return emitter.prependListener(event, fn);

  // This is a hack to make sure that our error handler is attached before any
  // userland ones.  NEVER DO THIS. This is here only because this code needs
  // to continue to work with older versions of Node.js that do not include
  // the prependListener() method. The goal is to eventually remove this hack.
  if (!emitter._events || !emitter._events[event]) emitter.on(event, fn);else if (isArray(emitter._events[event])) emitter._events[event].unshift(fn);else emitter._events[event] = [fn, emitter._events[event]];
}

function ReadableState(options, stream) {
  Duplex = Duplex || require('./_stream_duplex');

  options = options || {};

  // Duplex streams are both readable and writable, but share
  // the same options object.
  // However, some cases require setting options to different
  // values for the readable and the writable sides of the duplex stream.
  // These options can be provided separately as readableXXX and writableXXX.
  var isDuplex = stream instanceof Duplex;

  // object stream flag. Used to make read(n) ignore n and to
  // make all the buffer merging and length checks go away
  this.objectMode = !!options.objectMode;

  if (isDuplex) this.objectMode = this.objectMode || !!options.readableObjectMode;

  // the point at which it stops calling _read() to fill the buffer
  // Note: 0 is a valid value, means "don't call _read preemptively ever"
  var hwm = options.highWaterMark;
  var readableHwm = options.readableHighWaterMark;
  var defaultHwm = this.objectMode ? 16 : 16 * 1024;

  if (hwm || hwm === 0) this.highWaterMark = hwm;else if (isDuplex && (readableHwm || readableHwm === 0)) this.highWaterMark = readableHwm;else this.highWaterMark = defaultHwm;

  // cast to ints.
  this.highWaterMark = Math.floor(this.highWaterMark);

  // A linked list is used to store data chunks instead of an array because the
  // linked list can remove elements from the beginning faster than
  // array.shift()
  this.buffer = new BufferList();
  this.length = 0;
  this.pipes = null;
  this.pipesCount = 0;
  this.flowing = null;
  this.ended = false;
  this.endEmitted = false;
  this.reading = false;

  // a flag to be able to tell if the event 'readable'/'data' is emitted
  // immediately, or on a later tick.  We set this to true at first, because
  // any actions that shouldn't happen until "later" should generally also
  // not happen before the first read call.
  this.sync = true;

  // whenever we return null, then we set a flag to say
  // that we're awaiting a 'readable' event emission.
  this.needReadable = false;
  this.emittedReadable = false;
  this.readableListening = false;
  this.resumeScheduled = false;

  // has it been destroyed
  this.destroyed = false;

  // Crypto is kind of old and crusty.  Historically, its default string
  // encoding is 'binary' so we have to make this configurable.
  // Everything else in the universe uses 'utf8', though.
  this.defaultEncoding = options.defaultEncoding || 'utf8';

  // the number of writers that are awaiting a drain event in .pipe()s
  this.awaitDrain = 0;

  // if true, a maybeReadMore has been scheduled
  this.readingMore = false;

  this.decoder = null;
  this.encoding = null;
  if (options.encoding) {
    if (!StringDecoder) StringDecoder = require('string_decoder/').StringDecoder;
    this.decoder = new StringDecoder(options.encoding);
    this.encoding = options.encoding;
  }
}

function Readable(options) {
  Duplex = Duplex || require('./_stream_duplex');

  if (!(this instanceof Readable)) return new Readable(options);

  this._readableState = new ReadableState(options, this);

  // legacy
  this.readable = true;

  if (options) {
    if (typeof options.read === 'function') this._read = options.read;

    if (typeof options.destroy === 'function') this._destroy = options.destroy;
  }

  Stream.call(this);
}

Object.defineProperty(Readable.prototype, 'destroyed', {
  get: function () {
    if (this._readableState === undefined) {
      return false;
    }
    return this._readableState.destroyed;
  },
  set: function (value) {
    // we ignore the value if the stream
    // has not been initialized yet
    if (!this._readableState) {
      return;
    }

    // backward compatibility, the user is explicitly
    // managing destroyed
    this._readableState.destroyed = value;
  }
});

Readable.prototype.destroy = destroyImpl.destroy;
Readable.prototype._undestroy = destroyImpl.undestroy;
Readable.prototype._destroy = function (err, cb) {
  this.push(null);
  cb(err);
};

// Manually shove something into the read() buffer.
// This returns true if the highWaterMark has not been hit yet,
// similar to how Writable.write() returns true if you should
// write() some more.
Readable.prototype.push = function (chunk, encoding) {
  var state = this._readableState;
  var skipChunkCheck;

  if (!state.objectMode) {
    if (typeof chunk === 'string') {
      encoding = encoding || state.defaultEncoding;
      if (encoding !== state.encoding) {
        chunk = Buffer.from(chunk, encoding);
        encoding = '';
      }
      skipChunkCheck = true;
    }
  } else {
    skipChunkCheck = true;
  }

  return readableAddChunk(this, chunk, encoding, false, skipChunkCheck);
};

// Unshift should *always* be something directly out of read()
Readable.prototype.unshift = function (chunk) {
  return readableAddChunk(this, chunk, null, true, false);
};

function readableAddChunk(stream, chunk, encoding, addToFront, skipChunkCheck) {
  var state = stream._readableState;
  if (chunk === null) {
    state.reading = false;
    onEofChunk(stream, state);
  } else {
    var er;
    if (!skipChunkCheck) er = chunkInvalid(state, chunk);
    if (er) {
      stream.emit('error', er);
    } else if (state.objectMode || chunk && chunk.length > 0) {
      if (typeof chunk !== 'string' && !state.objectMode && Object.getPrototypeOf(chunk) !== Buffer.prototype) {
        chunk = _uint8ArrayToBuffer(chunk);
      }

      if (addToFront) {
        if (state.endEmitted) stream.emit('error', new Error('stream.unshift() after end event'));else addChunk(stream, state, chunk, true);
      } else if (state.ended) {
        stream.emit('error', new Error('stream.push() after EOF'));
      } else {
        state.reading = false;
        if (state.decoder && !encoding) {
          chunk = state.decoder.write(chunk);
          if (state.objectMode || chunk.length !== 0) addChunk(stream, state, chunk, false);else maybeReadMore(stream, state);
        } else {
          addChunk(stream, state, chunk, false);
        }
      }
    } else if (!addToFront) {
      state.reading = false;
    }
  }

  return needMoreData(state);
}

function addChunk(stream, state, chunk, addToFront) {
  if (state.flowing && state.length === 0 && !state.sync) {
    stream.emit('data', chunk);
    stream.read(0);
  } else {
    // update the buffer info.
    state.length += state.objectMode ? 1 : chunk.length;
    if (addToFront) state.buffer.unshift(chunk);else state.buffer.push(chunk);

    if (state.needReadable) emitReadable(stream);
  }
  maybeReadMore(stream, state);
}

function chunkInvalid(state, chunk) {
  var er;
  if (!_isUint8Array(chunk) && typeof chunk !== 'string' && chunk !== undefined && !state.objectMode) {
    er = new TypeError('Invalid non-string/buffer chunk');
  }
  return er;
}

// if it's past the high water mark, we can push in some more.
// Also, if we have no data yet, we can stand some
// more bytes.  This is to work around cases where hwm=0,
// such as the repl.  Also, if the push() triggered a
// readable event, and the user called read(largeNumber) such that
// needReadable was set, then we ought to push more, so that another
// 'readable' event will be triggered.
function needMoreData(state) {
  return !state.ended && (state.needReadable || state.length < state.highWaterMark || state.length === 0);
}

Readable.prototype.isPaused = function () {
  return this._readableState.flowing === false;
};

// backwards compatibility.
Readable.prototype.setEncoding = function (enc) {
  if (!StringDecoder) StringDecoder = require('string_decoder/').StringDecoder;
  this._readableState.decoder = new StringDecoder(enc);
  this._readableState.encoding = enc;
  return this;
};

// Don't raise the hwm > 8MB
var MAX_HWM = 0x800000;
function computeNewHighWaterMark(n) {
  if (n >= MAX_HWM) {
    n = MAX_HWM;
  } else {
    // Get the next highest power of 2 to prevent increasing hwm excessively in
    // tiny amounts
    n--;
    n |= n >>> 1;
    n |= n >>> 2;
    n |= n >>> 4;
    n |= n >>> 8;
    n |= n >>> 16;
    n++;
  }
  return n;
}

// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function howMuchToRead(n, state) {
  if (n <= 0 || state.length === 0 && state.ended) return 0;
  if (state.objectMode) return 1;
  if (n !== n) {
    // Only flow one buffer at a time
    if (state.flowing && state.length) return state.buffer.head.data.length;else return state.length;
  }
  // If we're asking for more than the current hwm, then raise the hwm.
  if (n > state.highWaterMark) state.highWaterMark = computeNewHighWaterMark(n);
  if (n <= state.length) return n;
  // Don't have enough
  if (!state.ended) {
    state.needReadable = true;
    return 0;
  }
  return state.length;
}

// you can override either this method, or the async _read(n) below.
Readable.prototype.read = function (n) {
  debug('read', n);
  n = parseInt(n, 10);
  var state = this._readableState;
  var nOrig = n;

  if (n !== 0) state.emittedReadable = false;

  // if we're doing read(0) to trigger a readable event, but we
  // already have a bunch of data in the buffer, then just trigger
  // the 'readable' event and move on.
  if (n === 0 && state.needReadable && (state.length >= state.highWaterMark || state.ended)) {
    debug('read: emitReadable', state.length, state.ended);
    if (state.length === 0 && state.ended) endReadable(this);else emitReadable(this);
    return null;
  }

  n = howMuchToRead(n, state);

  // if we've ended, and we're now clear, then finish it up.
  if (n === 0 && state.ended) {
    if (state.length === 0) endReadable(this);
    return null;
  }

  // All the actual chunk generation logic needs to be
  // *below* the call to _read.  The reason is that in certain
  // synthetic stream cases, such as passthrough streams, _read
  // may be a completely synchronous operation which may change
  // the state of the read buffer, providing enough data when
  // before there was *not* enough.
  //
  // So, the steps are:
  // 1. Figure out what the state of things will be after we do
  // a read from the buffer.
  //
  // 2. If that resulting state will trigger a _read, then call _read.
  // Note that this may be asynchronous, or synchronous.  Yes, it is
  // deeply ugly to write APIs this way, but that still doesn't mean
  // that the Readable class should behave improperly, as streams are
  // designed to be sync/async agnostic.
  // Take note if the _read call is sync or async (ie, if the read call
  // has returned yet), so that we know whether or not it's safe to emit
  // 'readable' etc.
  //
  // 3. Actually pull the requested chunks out of the buffer and return.

  // if we need a readable event, then we need to do some reading.
  var doRead = state.needReadable;
  debug('need readable', doRead);

  // if we currently have less than the highWaterMark, then also read some
  if (state.length === 0 || state.length - n < state.highWaterMark) {
    doRead = true;
    debug('length less than watermark', doRead);
  }

  // however, if we've ended, then there's no point, and if we're already
  // reading, then it's unnecessary.
  if (state.ended || state.reading) {
    doRead = false;
    debug('reading or ended', doRead);
  } else if (doRead) {
    debug('do read');
    state.reading = true;
    state.sync = true;
    // if the length is currently zero, then we *need* a readable event.
    if (state.length === 0) state.needReadable = true;
    // call internal read method
    this._read(state.highWaterMark);
    state.sync = false;
    // If _read pushed data synchronously, then `reading` will be false,
    // and we need to re-evaluate how much data we can return to the user.
    if (!state.reading) n = howMuchToRead(nOrig, state);
  }

  var ret;
  if (n > 0) ret = fromList(n, state);else ret = null;

  if (ret === null) {
    state.needReadable = true;
    n = 0;
  } else {
    state.length -= n;
  }

  if (state.length === 0) {
    // If we have nothing in the buffer, then we want to know
    // as soon as we *do* get something into the buffer.
    if (!state.ended) state.needReadable = true;

    // If we tried to read() past the EOF, then emit end on the next tick.
    if (nOrig !== n && state.ended) endReadable(this);
  }

  if (ret !== null) this.emit('data', ret);

  return ret;
};

function onEofChunk(stream, state) {
  if (state.ended) return;
  if (state.decoder) {
    var chunk = state.decoder.end();
    if (chunk && chunk.length) {
      state.buffer.push(chunk);
      state.length += state.objectMode ? 1 : chunk.length;
    }
  }
  state.ended = true;

  // emit 'readable' now to make sure it gets picked up.
  emitReadable(stream);
}

// Don't emit readable right away in sync mode, because this can trigger
// another read() call => stack overflow.  This way, it might trigger
// a nextTick recursion warning, but that's not so bad.
function emitReadable(stream) {
  var state = stream._readableState;
  state.needReadable = false;
  if (!state.emittedReadable) {
    debug('emitReadable', state.flowing);
    state.emittedReadable = true;
    if (state.sync) pna.nextTick(emitReadable_, stream);else emitReadable_(stream);
  }
}

function emitReadable_(stream) {
  debug('emit readable');
  stream.emit('readable');
  flow(stream);
}

// at this point, the user has presumably seen the 'readable' event,
// and called read() to consume some data.  that may have triggered
// in turn another _read(n) call, in which case reading = true if
// it's in progress.
// However, if we're not ended, or reading, and the length < hwm,
// then go ahead and try to read some more preemptively.
function maybeReadMore(stream, state) {
  if (!state.readingMore) {
    state.readingMore = true;
    pna.nextTick(maybeReadMore_, stream, state);
  }
}

function maybeReadMore_(stream, state) {
  var len = state.length;
  while (!state.reading && !state.flowing && !state.ended && state.length < state.highWaterMark) {
    debug('maybeReadMore read 0');
    stream.read(0);
    if (len === state.length)
      // didn't get any data, stop spinning.
      break;else len = state.length;
  }
  state.readingMore = false;
}

// abstract method.  to be overridden in specific implementation classes.
// call cb(er, data) where data is <= n in length.
// for virtual (non-string, non-buffer) streams, "length" is somewhat
// arbitrary, and perhaps not very meaningful.
Readable.prototype._read = function (n) {
  this.emit('error', new Error('_read() is not implemented'));
};

Readable.prototype.pipe = function (dest, pipeOpts) {
  var src = this;
  var state = this._readableState;

  switch (state.pipesCount) {
    case 0:
      state.pipes = dest;
      break;
    case 1:
      state.pipes = [state.pipes, dest];
      break;
    default:
      state.pipes.push(dest);
      break;
  }
  state.pipesCount += 1;
  debug('pipe count=%d opts=%j', state.pipesCount, pipeOpts);

  var doEnd = (!pipeOpts || pipeOpts.end !== false) && dest !== process.stdout && dest !== process.stderr;

  var endFn = doEnd ? onend : unpipe;
  if (state.endEmitted) pna.nextTick(endFn);else src.once('end', endFn);

  dest.on('unpipe', onunpipe);
  function onunpipe(readable, unpipeInfo) {
    debug('onunpipe');
    if (readable === src) {
      if (unpipeInfo && unpipeInfo.hasUnpiped === false) {
        unpipeInfo.hasUnpiped = true;
        cleanup();
      }
    }
  }

  function onend() {
    debug('onend');
    dest.end();
  }

  // when the dest drains, it reduces the awaitDrain counter
  // on the source.  This would be more elegant with a .once()
  // handler in flow(), but adding and removing repeatedly is
  // too slow.
  var ondrain = pipeOnDrain(src);
  dest.on('drain', ondrain);

  var cleanedUp = false;
  function cleanup() {
    debug('cleanup');
    // cleanup event handlers once the pipe is broken
    dest.removeListener('close', onclose);
    dest.removeListener('finish', onfinish);
    dest.removeListener('drain', ondrain);
    dest.removeListener('error', onerror);
    dest.removeListener('unpipe', onunpipe);
    src.removeListener('end', onend);
    src.removeListener('end', unpipe);
    src.removeListener('data', ondata);

    cleanedUp = true;

    // if the reader is waiting for a drain event from this
    // specific writer, then it would cause it to never start
    // flowing again.
    // So, if this is awaiting a drain, then we just call it now.
    // If we don't know, then assume that we are waiting for one.
    if (state.awaitDrain && (!dest._writableState || dest._writableState.needDrain)) ondrain();
  }

  // If the user pushes more data while we're writing to dest then we'll end up
  // in ondata again. However, we only want to increase awaitDrain once because
  // dest will only emit one 'drain' event for the multiple writes.
  // => Introduce a guard on increasing awaitDrain.
  var increasedAwaitDrain = false;
  src.on('data', ondata);
  function ondata(chunk) {
    debug('ondata');
    increasedAwaitDrain = false;
    var ret = dest.write(chunk);
    if (false === ret && !increasedAwaitDrain) {
      // If the user unpiped during `dest.write()`, it is possible
      // to get stuck in a permanently paused state if that write
      // also returned false.
      // => Check whether `dest` is still a piping destination.
      if ((state.pipesCount === 1 && state.pipes === dest || state.pipesCount > 1 && indexOf(state.pipes, dest) !== -1) && !cleanedUp) {
        debug('false write response, pause', src._readableState.awaitDrain);
        src._readableState.awaitDrain++;
        increasedAwaitDrain = true;
      }
      src.pause();
    }
  }

  // if the dest has an error, then stop piping into it.
  // however, don't suppress the throwing behavior for this.
  function onerror(er) {
    debug('onerror', er);
    unpipe();
    dest.removeListener('error', onerror);
    if (EElistenerCount(dest, 'error') === 0) dest.emit('error', er);
  }

  // Make sure our error handler is attached before userland ones.
  prependListener(dest, 'error', onerror);

  // Both close and finish should trigger unpipe, but only once.
  function onclose() {
    dest.removeListener('finish', onfinish);
    unpipe();
  }
  dest.once('close', onclose);
  function onfinish() {
    debug('onfinish');
    dest.removeListener('close', onclose);
    unpipe();
  }
  dest.once('finish', onfinish);

  function unpipe() {
    debug('unpipe');
    src.unpipe(dest);
  }

  // tell the dest that it's being piped to
  dest.emit('pipe', src);

  // start the flow if it hasn't been started already.
  if (!state.flowing) {
    debug('pipe resume');
    src.resume();
  }

  return dest;
};

function pipeOnDrain(src) {
  return function () {
    var state = src._readableState;
    debug('pipeOnDrain', state.awaitDrain);
    if (state.awaitDrain) state.awaitDrain--;
    if (state.awaitDrain === 0 && EElistenerCount(src, 'data')) {
      state.flowing = true;
      flow(src);
    }
  };
}

Readable.prototype.unpipe = function (dest) {
  var state = this._readableState;
  var unpipeInfo = { hasUnpiped: false };

  // if we're not piping anywhere, then do nothing.
  if (state.pipesCount === 0) return this;

  // just one destination.  most common case.
  if (state.pipesCount === 1) {
    // passed in one, but it's not the right one.
    if (dest && dest !== state.pipes) return this;

    if (!dest) dest = state.pipes;

    // got a match.
    state.pipes = null;
    state.pipesCount = 0;
    state.flowing = false;
    if (dest) dest.emit('unpipe', this, unpipeInfo);
    return this;
  }

  // slow case. multiple pipe destinations.

  if (!dest) {
    // remove all.
    var dests = state.pipes;
    var len = state.pipesCount;
    state.pipes = null;
    state.pipesCount = 0;
    state.flowing = false;

    for (var i = 0; i < len; i++) {
      dests[i].emit('unpipe', this, unpipeInfo);
    }return this;
  }

  // try to find the right one.
  var index = indexOf(state.pipes, dest);
  if (index === -1) return this;

  state.pipes.splice(index, 1);
  state.pipesCount -= 1;
  if (state.pipesCount === 1) state.pipes = state.pipes[0];

  dest.emit('unpipe', this, unpipeInfo);

  return this;
};

// set up data events if they are asked for
// Ensure readable listeners eventually get something
Readable.prototype.on = function (ev, fn) {
  var res = Stream.prototype.on.call(this, ev, fn);

  if (ev === 'data') {
    // Start flowing on next tick if stream isn't explicitly paused
    if (this._readableState.flowing !== false) this.resume();
  } else if (ev === 'readable') {
    var state = this._readableState;
    if (!state.endEmitted && !state.readableListening) {
      state.readableListening = state.needReadable = true;
      state.emittedReadable = false;
      if (!state.reading) {
        pna.nextTick(nReadingNextTick, this);
      } else if (state.length) {
        emitReadable(this);
      }
    }
  }

  return res;
};
Readable.prototype.addListener = Readable.prototype.on;

function nReadingNextTick(self) {
  debug('readable nexttick read 0');
  self.read(0);
}

// pause() and resume() are remnants of the legacy readable stream API
// If the user uses them, then switch into old mode.
Readable.prototype.resume = function () {
  var state = this._readableState;
  if (!state.flowing) {
    debug('resume');
    state.flowing = true;
    resume(this, state);
  }
  return this;
};

function resume(stream, state) {
  if (!state.resumeScheduled) {
    state.resumeScheduled = true;
    pna.nextTick(resume_, stream, state);
  }
}

function resume_(stream, state) {
  if (!state.reading) {
    debug('resume read 0');
    stream.read(0);
  }

  state.resumeScheduled = false;
  state.awaitDrain = 0;
  stream.emit('resume');
  flow(stream);
  if (state.flowing && !state.reading) stream.read(0);
}

Readable.prototype.pause = function () {
  debug('call pause flowing=%j', this._readableState.flowing);
  if (false !== this._readableState.flowing) {
    debug('pause');
    this._readableState.flowing = false;
    this.emit('pause');
  }
  return this;
};

function flow(stream) {
  var state = stream._readableState;
  debug('flow', state.flowing);
  while (state.flowing && stream.read() !== null) {}
}

// wrap an old-style stream as the async data source.
// This is *not* part of the readable stream interface.
// It is an ugly unfortunate mess of history.
Readable.prototype.wrap = function (stream) {
  var _this = this;

  var state = this._readableState;
  var paused = false;

  stream.on('end', function () {
    debug('wrapped end');
    if (state.decoder && !state.ended) {
      var chunk = state.decoder.end();
      if (chunk && chunk.length) _this.push(chunk);
    }

    _this.push(null);
  });

  stream.on('data', function (chunk) {
    debug('wrapped data');
    if (state.decoder) chunk = state.decoder.write(chunk);

    // don't skip over falsy values in objectMode
    if (state.objectMode && (chunk === null || chunk === undefined)) return;else if (!state.objectMode && (!chunk || !chunk.length)) return;

    var ret = _this.push(chunk);
    if (!ret) {
      paused = true;
      stream.pause();
    }
  });

  // proxy all the other methods.
  // important when wrapping filters and duplexes.
  for (var i in stream) {
    if (this[i] === undefined && typeof stream[i] === 'function') {
      this[i] = function (method) {
        return function () {
          return stream[method].apply(stream, arguments);
        };
      }(i);
    }
  }

  // proxy certain important events.
  for (var n = 0; n < kProxyEvents.length; n++) {
    stream.on(kProxyEvents[n], this.emit.bind(this, kProxyEvents[n]));
  }

  // when we try to consume some more bytes, simply unpause the
  // underlying stream.
  this._read = function (n) {
    debug('wrapped _read', n);
    if (paused) {
      paused = false;
      stream.resume();
    }
  };

  return this;
};

Object.defineProperty(Readable.prototype, 'readableHighWaterMark', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function () {
    return this._readableState.highWaterMark;
  }
});

// exposed for testing purposes only.
Readable._fromList = fromList;

// Pluck off n bytes from an array of buffers.
// Length is the combined lengths of all the buffers in the list.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function fromList(n, state) {
  // nothing buffered
  if (state.length === 0) return null;

  var ret;
  if (state.objectMode) ret = state.buffer.shift();else if (!n || n >= state.length) {
    // read it all, truncate the list
    if (state.decoder) ret = state.buffer.join('');else if (state.buffer.length === 1) ret = state.buffer.head.data;else ret = state.buffer.concat(state.length);
    state.buffer.clear();
  } else {
    // read part of list
    ret = fromListPartial(n, state.buffer, state.decoder);
  }

  return ret;
}

// Extracts only enough buffered data to satisfy the amount requested.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function fromListPartial(n, list, hasStrings) {
  var ret;
  if (n < list.head.data.length) {
    // slice is the same for buffers and strings
    ret = list.head.data.slice(0, n);
    list.head.data = list.head.data.slice(n);
  } else if (n === list.head.data.length) {
    // first chunk is a perfect match
    ret = list.shift();
  } else {
    // result spans more than one buffer
    ret = hasStrings ? copyFromBufferString(n, list) : copyFromBuffer(n, list);
  }
  return ret;
}

// Copies a specified amount of characters from the list of buffered data
// chunks.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function copyFromBufferString(n, list) {
  var p = list.head;
  var c = 1;
  var ret = p.data;
  n -= ret.length;
  while (p = p.next) {
    var str = p.data;
    var nb = n > str.length ? str.length : n;
    if (nb === str.length) ret += str;else ret += str.slice(0, n);
    n -= nb;
    if (n === 0) {
      if (nb === str.length) {
        ++c;
        if (p.next) list.head = p.next;else list.head = list.tail = null;
      } else {
        list.head = p;
        p.data = str.slice(nb);
      }
      break;
    }
    ++c;
  }
  list.length -= c;
  return ret;
}

// Copies a specified amount of bytes from the list of buffered data chunks.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function copyFromBuffer(n, list) {
  var ret = Buffer.allocUnsafe(n);
  var p = list.head;
  var c = 1;
  p.data.copy(ret);
  n -= p.data.length;
  while (p = p.next) {
    var buf = p.data;
    var nb = n > buf.length ? buf.length : n;
    buf.copy(ret, ret.length - n, 0, nb);
    n -= nb;
    if (n === 0) {
      if (nb === buf.length) {
        ++c;
        if (p.next) list.head = p.next;else list.head = list.tail = null;
      } else {
        list.head = p;
        p.data = buf.slice(nb);
      }
      break;
    }
    ++c;
  }
  list.length -= c;
  return ret;
}

function endReadable(stream) {
  var state = stream._readableState;

  // If we get here before consuming all the bytes, then that is a
  // bug in node.  Should never happen.
  if (state.length > 0) throw new Error('"endReadable()" called on non-empty stream');

  if (!state.endEmitted) {
    state.ended = true;
    pna.nextTick(endReadableNT, state, stream);
  }
}

function endReadableNT(state, stream) {
  // Check that we didn't get one last unshift.
  if (!state.endEmitted && state.length === 0) {
    state.endEmitted = true;
    stream.readable = false;
    stream.emit('end');
  }
}

function indexOf(xs, x) {
  for (var i = 0, l = xs.length; i < l; i++) {
    if (xs[i] === x) return i;
  }
  return -1;
}
}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./_stream_duplex":13,"./internal/streams/BufferList":18,"./internal/streams/destroy":19,"./internal/streams/stream":20,"_process":11,"core-util-is":4,"events":5,"inherits":7,"isarray":9,"process-nextick-args":10,"safe-buffer":25,"string_decoder/":27,"util":2}],16:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// a transform stream is a readable/writable stream where you do
// something with the data.  Sometimes it's called a "filter",
// but that's not a great name for it, since that implies a thing where
// some bits pass through, and others are simply ignored.  (That would
// be a valid example of a transform, of course.)
//
// While the output is causally related to the input, it's not a
// necessarily symmetric or synchronous transformation.  For example,
// a zlib stream might take multiple plain-text writes(), and then
// emit a single compressed chunk some time in the future.
//
// Here's how this works:
//
// The Transform stream has all the aspects of the readable and writable
// stream classes.  When you write(chunk), that calls _write(chunk,cb)
// internally, and returns false if there's a lot of pending writes
// buffered up.  When you call read(), that calls _read(n) until
// there's enough pending readable data buffered up.
//
// In a transform stream, the written data is placed in a buffer.  When
// _read(n) is called, it transforms the queued up data, calling the
// buffered _write cb's as it consumes chunks.  If consuming a single
// written chunk would result in multiple output chunks, then the first
// outputted bit calls the readcb, and subsequent chunks just go into
// the read buffer, and will cause it to emit 'readable' if necessary.
//
// This way, back-pressure is actually determined by the reading side,
// since _read has to be called to start processing a new chunk.  However,
// a pathological inflate type of transform can cause excessive buffering
// here.  For example, imagine a stream where every byte of input is
// interpreted as an integer from 0-255, and then results in that many
// bytes of output.  Writing the 4 bytes {ff,ff,ff,ff} would result in
// 1kb of data being output.  In this case, you could write a very small
// amount of input, and end up with a very large amount of output.  In
// such a pathological inflating mechanism, there'd be no way to tell
// the system to stop doing the transform.  A single 4MB write could
// cause the system to run out of memory.
//
// However, even in such a pathological case, only a single written chunk
// would be consumed, and then the rest would wait (un-transformed) until
// the results of the previous transformed chunk were consumed.

'use strict';

module.exports = Transform;

var Duplex = require('./_stream_duplex');

/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/

util.inherits(Transform, Duplex);

function afterTransform(er, data) {
  var ts = this._transformState;
  ts.transforming = false;

  var cb = ts.writecb;

  if (!cb) {
    return this.emit('error', new Error('write callback called multiple times'));
  }

  ts.writechunk = null;
  ts.writecb = null;

  if (data != null) // single equals check for both `null` and `undefined`
    this.push(data);

  cb(er);

  var rs = this._readableState;
  rs.reading = false;
  if (rs.needReadable || rs.length < rs.highWaterMark) {
    this._read(rs.highWaterMark);
  }
}

function Transform(options) {
  if (!(this instanceof Transform)) return new Transform(options);

  Duplex.call(this, options);

  this._transformState = {
    afterTransform: afterTransform.bind(this),
    needTransform: false,
    transforming: false,
    writecb: null,
    writechunk: null,
    writeencoding: null
  };

  // start out asking for a readable event once data is transformed.
  this._readableState.needReadable = true;

  // we have implemented the _read method, and done the other things
  // that Readable wants before the first _read call, so unset the
  // sync guard flag.
  this._readableState.sync = false;

  if (options) {
    if (typeof options.transform === 'function') this._transform = options.transform;

    if (typeof options.flush === 'function') this._flush = options.flush;
  }

  // When the writable side finishes, then flush out anything remaining.
  this.on('prefinish', prefinish);
}

function prefinish() {
  var _this = this;

  if (typeof this._flush === 'function') {
    this._flush(function (er, data) {
      done(_this, er, data);
    });
  } else {
    done(this, null, null);
  }
}

Transform.prototype.push = function (chunk, encoding) {
  this._transformState.needTransform = false;
  return Duplex.prototype.push.call(this, chunk, encoding);
};

// This is the part where you do stuff!
// override this function in implementation classes.
// 'chunk' is an input chunk.
//
// Call `push(newChunk)` to pass along transformed output
// to the readable side.  You may call 'push' zero or more times.
//
// Call `cb(err)` when you are done with this chunk.  If you pass
// an error, then that'll put the hurt on the whole operation.  If you
// never call cb(), then you'll never get another chunk.
Transform.prototype._transform = function (chunk, encoding, cb) {
  throw new Error('_transform() is not implemented');
};

Transform.prototype._write = function (chunk, encoding, cb) {
  var ts = this._transformState;
  ts.writecb = cb;
  ts.writechunk = chunk;
  ts.writeencoding = encoding;
  if (!ts.transforming) {
    var rs = this._readableState;
    if (ts.needTransform || rs.needReadable || rs.length < rs.highWaterMark) this._read(rs.highWaterMark);
  }
};

// Doesn't matter what the args are here.
// _transform does all the work.
// That we got here means that the readable side wants more data.
Transform.prototype._read = function (n) {
  var ts = this._transformState;

  if (ts.writechunk !== null && ts.writecb && !ts.transforming) {
    ts.transforming = true;
    this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform);
  } else {
    // mark that we need a transform, so that any data that comes in
    // will get processed, now that we've asked for it.
    ts.needTransform = true;
  }
};

Transform.prototype._destroy = function (err, cb) {
  var _this2 = this;

  Duplex.prototype._destroy.call(this, err, function (err2) {
    cb(err2);
    _this2.emit('close');
  });
};

function done(stream, er, data) {
  if (er) return stream.emit('error', er);

  if (data != null) // single equals check for both `null` and `undefined`
    stream.push(data);

  // if there's nothing in the write buffer, then that means
  // that nothing more will ever be provided
  if (stream._writableState.length) throw new Error('Calling transform done when ws.length != 0');

  if (stream._transformState.transforming) throw new Error('Calling transform done when still transforming');

  return stream.push(null);
}
},{"./_stream_duplex":13,"core-util-is":4,"inherits":7}],17:[function(require,module,exports){
(function (process,global,setImmediate){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// A bit simpler than readable streams.
// Implement an async ._write(chunk, encoding, cb), and it'll handle all
// the drain event emission and buffering.

'use strict';

/*<replacement>*/

var pna = require('process-nextick-args');
/*</replacement>*/

module.exports = Writable;

/* <replacement> */
function WriteReq(chunk, encoding, cb) {
  this.chunk = chunk;
  this.encoding = encoding;
  this.callback = cb;
  this.next = null;
}

// It seems a linked list but it is not
// there will be only 2 of these for each stream
function CorkedRequest(state) {
  var _this = this;

  this.next = null;
  this.entry = null;
  this.finish = function () {
    onCorkedFinish(_this, state);
  };
}
/* </replacement> */

/*<replacement>*/
var asyncWrite = !process.browser && ['v0.10', 'v0.9.'].indexOf(process.version.slice(0, 5)) > -1 ? setImmediate : pna.nextTick;
/*</replacement>*/

/*<replacement>*/
var Duplex;
/*</replacement>*/

Writable.WritableState = WritableState;

/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/

/*<replacement>*/
var internalUtil = {
  deprecate: require('util-deprecate')
};
/*</replacement>*/

/*<replacement>*/
var Stream = require('./internal/streams/stream');
/*</replacement>*/

/*<replacement>*/

var Buffer = require('safe-buffer').Buffer;
var OurUint8Array = global.Uint8Array || function () {};
function _uint8ArrayToBuffer(chunk) {
  return Buffer.from(chunk);
}
function _isUint8Array(obj) {
  return Buffer.isBuffer(obj) || obj instanceof OurUint8Array;
}

/*</replacement>*/

var destroyImpl = require('./internal/streams/destroy');

util.inherits(Writable, Stream);

function nop() {}

function WritableState(options, stream) {
  Duplex = Duplex || require('./_stream_duplex');

  options = options || {};

  // Duplex streams are both readable and writable, but share
  // the same options object.
  // However, some cases require setting options to different
  // values for the readable and the writable sides of the duplex stream.
  // These options can be provided separately as readableXXX and writableXXX.
  var isDuplex = stream instanceof Duplex;

  // object stream flag to indicate whether or not this stream
  // contains buffers or objects.
  this.objectMode = !!options.objectMode;

  if (isDuplex) this.objectMode = this.objectMode || !!options.writableObjectMode;

  // the point at which write() starts returning false
  // Note: 0 is a valid value, means that we always return false if
  // the entire buffer is not flushed immediately on write()
  var hwm = options.highWaterMark;
  var writableHwm = options.writableHighWaterMark;
  var defaultHwm = this.objectMode ? 16 : 16 * 1024;

  if (hwm || hwm === 0) this.highWaterMark = hwm;else if (isDuplex && (writableHwm || writableHwm === 0)) this.highWaterMark = writableHwm;else this.highWaterMark = defaultHwm;

  // cast to ints.
  this.highWaterMark = Math.floor(this.highWaterMark);

  // if _final has been called
  this.finalCalled = false;

  // drain event flag.
  this.needDrain = false;
  // at the start of calling end()
  this.ending = false;
  // when end() has been called, and returned
  this.ended = false;
  // when 'finish' is emitted
  this.finished = false;

  // has it been destroyed
  this.destroyed = false;

  // should we decode strings into buffers before passing to _write?
  // this is here so that some node-core streams can optimize string
  // handling at a lower level.
  var noDecode = options.decodeStrings === false;
  this.decodeStrings = !noDecode;

  // Crypto is kind of old and crusty.  Historically, its default string
  // encoding is 'binary' so we have to make this configurable.
  // Everything else in the universe uses 'utf8', though.
  this.defaultEncoding = options.defaultEncoding || 'utf8';

  // not an actual buffer we keep track of, but a measurement
  // of how much we're waiting to get pushed to some underlying
  // socket or file.
  this.length = 0;

  // a flag to see when we're in the middle of a write.
  this.writing = false;

  // when true all writes will be buffered until .uncork() call
  this.corked = 0;

  // a flag to be able to tell if the onwrite cb is called immediately,
  // or on a later tick.  We set this to true at first, because any
  // actions that shouldn't happen until "later" should generally also
  // not happen before the first write call.
  this.sync = true;

  // a flag to know if we're processing previously buffered items, which
  // may call the _write() callback in the same tick, so that we don't
  // end up in an overlapped onwrite situation.
  this.bufferProcessing = false;

  // the callback that's passed to _write(chunk,cb)
  this.onwrite = function (er) {
    onwrite(stream, er);
  };

  // the callback that the user supplies to write(chunk,encoding,cb)
  this.writecb = null;

  // the amount that is being written when _write is called.
  this.writelen = 0;

  this.bufferedRequest = null;
  this.lastBufferedRequest = null;

  // number of pending user-supplied write callbacks
  // this must be 0 before 'finish' can be emitted
  this.pendingcb = 0;

  // emit prefinish if the only thing we're waiting for is _write cbs
  // This is relevant for synchronous Transform streams
  this.prefinished = false;

  // True if the error was already emitted and should not be thrown again
  this.errorEmitted = false;

  // count buffered requests
  this.bufferedRequestCount = 0;

  // allocate the first CorkedRequest, there is always
  // one allocated and free to use, and we maintain at most two
  this.corkedRequestsFree = new CorkedRequest(this);
}

WritableState.prototype.getBuffer = function getBuffer() {
  var current = this.bufferedRequest;
  var out = [];
  while (current) {
    out.push(current);
    current = current.next;
  }
  return out;
};

(function () {
  try {
    Object.defineProperty(WritableState.prototype, 'buffer', {
      get: internalUtil.deprecate(function () {
        return this.getBuffer();
      }, '_writableState.buffer is deprecated. Use _writableState.getBuffer ' + 'instead.', 'DEP0003')
    });
  } catch (_) {}
})();

// Test _writableState for inheritance to account for Duplex streams,
// whose prototype chain only points to Readable.
var realHasInstance;
if (typeof Symbol === 'function' && Symbol.hasInstance && typeof Function.prototype[Symbol.hasInstance] === 'function') {
  realHasInstance = Function.prototype[Symbol.hasInstance];
  Object.defineProperty(Writable, Symbol.hasInstance, {
    value: function (object) {
      if (realHasInstance.call(this, object)) return true;
      if (this !== Writable) return false;

      return object && object._writableState instanceof WritableState;
    }
  });
} else {
  realHasInstance = function (object) {
    return object instanceof this;
  };
}

function Writable(options) {
  Duplex = Duplex || require('./_stream_duplex');

  // Writable ctor is applied to Duplexes, too.
  // `realHasInstance` is necessary because using plain `instanceof`
  // would return false, as no `_writableState` property is attached.

  // Trying to use the custom `instanceof` for Writable here will also break the
  // Node.js LazyTransform implementation, which has a non-trivial getter for
  // `_writableState` that would lead to infinite recursion.
  if (!realHasInstance.call(Writable, this) && !(this instanceof Duplex)) {
    return new Writable(options);
  }

  this._writableState = new WritableState(options, this);

  // legacy.
  this.writable = true;

  if (options) {
    if (typeof options.write === 'function') this._write = options.write;

    if (typeof options.writev === 'function') this._writev = options.writev;

    if (typeof options.destroy === 'function') this._destroy = options.destroy;

    if (typeof options.final === 'function') this._final = options.final;
  }

  Stream.call(this);
}

// Otherwise people can pipe Writable streams, which is just wrong.
Writable.prototype.pipe = function () {
  this.emit('error', new Error('Cannot pipe, not readable'));
};

function writeAfterEnd(stream, cb) {
  var er = new Error('write after end');
  // TODO: defer error events consistently everywhere, not just the cb
  stream.emit('error', er);
  pna.nextTick(cb, er);
}

// Checks that a user-supplied chunk is valid, especially for the particular
// mode the stream is in. Currently this means that `null` is never accepted
// and undefined/non-string values are only allowed in object mode.
function validChunk(stream, state, chunk, cb) {
  var valid = true;
  var er = false;

  if (chunk === null) {
    er = new TypeError('May not write null values to stream');
  } else if (typeof chunk !== 'string' && chunk !== undefined && !state.objectMode) {
    er = new TypeError('Invalid non-string/buffer chunk');
  }
  if (er) {
    stream.emit('error', er);
    pna.nextTick(cb, er);
    valid = false;
  }
  return valid;
}

Writable.prototype.write = function (chunk, encoding, cb) {
  var state = this._writableState;
  var ret = false;
  var isBuf = !state.objectMode && _isUint8Array(chunk);

  if (isBuf && !Buffer.isBuffer(chunk)) {
    chunk = _uint8ArrayToBuffer(chunk);
  }

  if (typeof encoding === 'function') {
    cb = encoding;
    encoding = null;
  }

  if (isBuf) encoding = 'buffer';else if (!encoding) encoding = state.defaultEncoding;

  if (typeof cb !== 'function') cb = nop;

  if (state.ended) writeAfterEnd(this, cb);else if (isBuf || validChunk(this, state, chunk, cb)) {
    state.pendingcb++;
    ret = writeOrBuffer(this, state, isBuf, chunk, encoding, cb);
  }

  return ret;
};

Writable.prototype.cork = function () {
  var state = this._writableState;

  state.corked++;
};

Writable.prototype.uncork = function () {
  var state = this._writableState;

  if (state.corked) {
    state.corked--;

    if (!state.writing && !state.corked && !state.finished && !state.bufferProcessing && state.bufferedRequest) clearBuffer(this, state);
  }
};

Writable.prototype.setDefaultEncoding = function setDefaultEncoding(encoding) {
  // node::ParseEncoding() requires lower case.
  if (typeof encoding === 'string') encoding = encoding.toLowerCase();
  if (!(['hex', 'utf8', 'utf-8', 'ascii', 'binary', 'base64', 'ucs2', 'ucs-2', 'utf16le', 'utf-16le', 'raw'].indexOf((encoding + '').toLowerCase()) > -1)) throw new TypeError('Unknown encoding: ' + encoding);
  this._writableState.defaultEncoding = encoding;
  return this;
};

function decodeChunk(state, chunk, encoding) {
  if (!state.objectMode && state.decodeStrings !== false && typeof chunk === 'string') {
    chunk = Buffer.from(chunk, encoding);
  }
  return chunk;
}

Object.defineProperty(Writable.prototype, 'writableHighWaterMark', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function () {
    return this._writableState.highWaterMark;
  }
});

// if we're already writing something, then just put this
// in the queue, and wait our turn.  Otherwise, call _write
// If we return false, then we need a drain event, so set that flag.
function writeOrBuffer(stream, state, isBuf, chunk, encoding, cb) {
  if (!isBuf) {
    var newChunk = decodeChunk(state, chunk, encoding);
    if (chunk !== newChunk) {
      isBuf = true;
      encoding = 'buffer';
      chunk = newChunk;
    }
  }
  var len = state.objectMode ? 1 : chunk.length;

  state.length += len;

  var ret = state.length < state.highWaterMark;
  // we must ensure that previous needDrain will not be reset to false.
  if (!ret) state.needDrain = true;

  if (state.writing || state.corked) {
    var last = state.lastBufferedRequest;
    state.lastBufferedRequest = {
      chunk: chunk,
      encoding: encoding,
      isBuf: isBuf,
      callback: cb,
      next: null
    };
    if (last) {
      last.next = state.lastBufferedRequest;
    } else {
      state.bufferedRequest = state.lastBufferedRequest;
    }
    state.bufferedRequestCount += 1;
  } else {
    doWrite(stream, state, false, len, chunk, encoding, cb);
  }

  return ret;
}

function doWrite(stream, state, writev, len, chunk, encoding, cb) {
  state.writelen = len;
  state.writecb = cb;
  state.writing = true;
  state.sync = true;
  if (writev) stream._writev(chunk, state.onwrite);else stream._write(chunk, encoding, state.onwrite);
  state.sync = false;
}

function onwriteError(stream, state, sync, er, cb) {
  --state.pendingcb;

  if (sync) {
    // defer the callback if we are being called synchronously
    // to avoid piling up things on the stack
    pna.nextTick(cb, er);
    // this can emit finish, and it will always happen
    // after error
    pna.nextTick(finishMaybe, stream, state);
    stream._writableState.errorEmitted = true;
    stream.emit('error', er);
  } else {
    // the caller expect this to happen before if
    // it is async
    cb(er);
    stream._writableState.errorEmitted = true;
    stream.emit('error', er);
    // this can emit finish, but finish must
    // always follow error
    finishMaybe(stream, state);
  }
}

function onwriteStateUpdate(state) {
  state.writing = false;
  state.writecb = null;
  state.length -= state.writelen;
  state.writelen = 0;
}

function onwrite(stream, er) {
  var state = stream._writableState;
  var sync = state.sync;
  var cb = state.writecb;

  onwriteStateUpdate(state);

  if (er) onwriteError(stream, state, sync, er, cb);else {
    // Check if we're actually ready to finish, but don't emit yet
    var finished = needFinish(state);

    if (!finished && !state.corked && !state.bufferProcessing && state.bufferedRequest) {
      clearBuffer(stream, state);
    }

    if (sync) {
      /*<replacement>*/
      asyncWrite(afterWrite, stream, state, finished, cb);
      /*</replacement>*/
    } else {
      afterWrite(stream, state, finished, cb);
    }
  }
}

function afterWrite(stream, state, finished, cb) {
  if (!finished) onwriteDrain(stream, state);
  state.pendingcb--;
  cb();
  finishMaybe(stream, state);
}

// Must force callback to be called on nextTick, so that we don't
// emit 'drain' before the write() consumer gets the 'false' return
// value, and has a chance to attach a 'drain' listener.
function onwriteDrain(stream, state) {
  if (state.length === 0 && state.needDrain) {
    state.needDrain = false;
    stream.emit('drain');
  }
}

// if there's something in the buffer waiting, then process it
function clearBuffer(stream, state) {
  state.bufferProcessing = true;
  var entry = state.bufferedRequest;

  if (stream._writev && entry && entry.next) {
    // Fast case, write everything using _writev()
    var l = state.bufferedRequestCount;
    var buffer = new Array(l);
    var holder = state.corkedRequestsFree;
    holder.entry = entry;

    var count = 0;
    var allBuffers = true;
    while (entry) {
      buffer[count] = entry;
      if (!entry.isBuf) allBuffers = false;
      entry = entry.next;
      count += 1;
    }
    buffer.allBuffers = allBuffers;

    doWrite(stream, state, true, state.length, buffer, '', holder.finish);

    // doWrite is almost always async, defer these to save a bit of time
    // as the hot path ends with doWrite
    state.pendingcb++;
    state.lastBufferedRequest = null;
    if (holder.next) {
      state.corkedRequestsFree = holder.next;
      holder.next = null;
    } else {
      state.corkedRequestsFree = new CorkedRequest(state);
    }
    state.bufferedRequestCount = 0;
  } else {
    // Slow case, write chunks one-by-one
    while (entry) {
      var chunk = entry.chunk;
      var encoding = entry.encoding;
      var cb = entry.callback;
      var len = state.objectMode ? 1 : chunk.length;

      doWrite(stream, state, false, len, chunk, encoding, cb);
      entry = entry.next;
      state.bufferedRequestCount--;
      // if we didn't call the onwrite immediately, then
      // it means that we need to wait until it does.
      // also, that means that the chunk and cb are currently
      // being processed, so move the buffer counter past them.
      if (state.writing) {
        break;
      }
    }

    if (entry === null) state.lastBufferedRequest = null;
  }

  state.bufferedRequest = entry;
  state.bufferProcessing = false;
}

Writable.prototype._write = function (chunk, encoding, cb) {
  cb(new Error('_write() is not implemented'));
};

Writable.prototype._writev = null;

Writable.prototype.end = function (chunk, encoding, cb) {
  var state = this._writableState;

  if (typeof chunk === 'function') {
    cb = chunk;
    chunk = null;
    encoding = null;
  } else if (typeof encoding === 'function') {
    cb = encoding;
    encoding = null;
  }

  if (chunk !== null && chunk !== undefined) this.write(chunk, encoding);

  // .end() fully uncorks
  if (state.corked) {
    state.corked = 1;
    this.uncork();
  }

  // ignore unnecessary end() calls.
  if (!state.ending && !state.finished) endWritable(this, state, cb);
};

function needFinish(state) {
  return state.ending && state.length === 0 && state.bufferedRequest === null && !state.finished && !state.writing;
}
function callFinal(stream, state) {
  stream._final(function (err) {
    state.pendingcb--;
    if (err) {
      stream.emit('error', err);
    }
    state.prefinished = true;
    stream.emit('prefinish');
    finishMaybe(stream, state);
  });
}
function prefinish(stream, state) {
  if (!state.prefinished && !state.finalCalled) {
    if (typeof stream._final === 'function') {
      state.pendingcb++;
      state.finalCalled = true;
      pna.nextTick(callFinal, stream, state);
    } else {
      state.prefinished = true;
      stream.emit('prefinish');
    }
  }
}

function finishMaybe(stream, state) {
  var need = needFinish(state);
  if (need) {
    prefinish(stream, state);
    if (state.pendingcb === 0) {
      state.finished = true;
      stream.emit('finish');
    }
  }
  return need;
}

function endWritable(stream, state, cb) {
  state.ending = true;
  finishMaybe(stream, state);
  if (cb) {
    if (state.finished) pna.nextTick(cb);else stream.once('finish', cb);
  }
  state.ended = true;
  stream.writable = false;
}

function onCorkedFinish(corkReq, state, err) {
  var entry = corkReq.entry;
  corkReq.entry = null;
  while (entry) {
    var cb = entry.callback;
    state.pendingcb--;
    cb(err);
    entry = entry.next;
  }
  if (state.corkedRequestsFree) {
    state.corkedRequestsFree.next = corkReq;
  } else {
    state.corkedRequestsFree = corkReq;
  }
}

Object.defineProperty(Writable.prototype, 'destroyed', {
  get: function () {
    if (this._writableState === undefined) {
      return false;
    }
    return this._writableState.destroyed;
  },
  set: function (value) {
    // we ignore the value if the stream
    // has not been initialized yet
    if (!this._writableState) {
      return;
    }

    // backward compatibility, the user is explicitly
    // managing destroyed
    this._writableState.destroyed = value;
  }
});

Writable.prototype.destroy = destroyImpl.destroy;
Writable.prototype._undestroy = destroyImpl.undestroy;
Writable.prototype._destroy = function (err, cb) {
  this.end();
  cb(err);
};
}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("timers").setImmediate)
},{"./_stream_duplex":13,"./internal/streams/destroy":19,"./internal/streams/stream":20,"_process":11,"core-util-is":4,"inherits":7,"process-nextick-args":10,"safe-buffer":25,"timers":28,"util-deprecate":29}],18:[function(require,module,exports){
'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Buffer = require('safe-buffer').Buffer;
var util = require('util');

function copyBuffer(src, target, offset) {
  src.copy(target, offset);
}

module.exports = function () {
  function BufferList() {
    _classCallCheck(this, BufferList);

    this.head = null;
    this.tail = null;
    this.length = 0;
  }

  BufferList.prototype.push = function push(v) {
    var entry = { data: v, next: null };
    if (this.length > 0) this.tail.next = entry;else this.head = entry;
    this.tail = entry;
    ++this.length;
  };

  BufferList.prototype.unshift = function unshift(v) {
    var entry = { data: v, next: this.head };
    if (this.length === 0) this.tail = entry;
    this.head = entry;
    ++this.length;
  };

  BufferList.prototype.shift = function shift() {
    if (this.length === 0) return;
    var ret = this.head.data;
    if (this.length === 1) this.head = this.tail = null;else this.head = this.head.next;
    --this.length;
    return ret;
  };

  BufferList.prototype.clear = function clear() {
    this.head = this.tail = null;
    this.length = 0;
  };

  BufferList.prototype.join = function join(s) {
    if (this.length === 0) return '';
    var p = this.head;
    var ret = '' + p.data;
    while (p = p.next) {
      ret += s + p.data;
    }return ret;
  };

  BufferList.prototype.concat = function concat(n) {
    if (this.length === 0) return Buffer.alloc(0);
    if (this.length === 1) return this.head.data;
    var ret = Buffer.allocUnsafe(n >>> 0);
    var p = this.head;
    var i = 0;
    while (p) {
      copyBuffer(p.data, ret, i);
      i += p.data.length;
      p = p.next;
    }
    return ret;
  };

  return BufferList;
}();

if (util && util.inspect && util.inspect.custom) {
  module.exports.prototype[util.inspect.custom] = function () {
    var obj = util.inspect({ length: this.length });
    return this.constructor.name + ' ' + obj;
  };
}
},{"safe-buffer":25,"util":2}],19:[function(require,module,exports){
'use strict';

/*<replacement>*/

var pna = require('process-nextick-args');
/*</replacement>*/

// undocumented cb() API, needed for core, not for public API
function destroy(err, cb) {
  var _this = this;

  var readableDestroyed = this._readableState && this._readableState.destroyed;
  var writableDestroyed = this._writableState && this._writableState.destroyed;

  if (readableDestroyed || writableDestroyed) {
    if (cb) {
      cb(err);
    } else if (err && (!this._writableState || !this._writableState.errorEmitted)) {
      pna.nextTick(emitErrorNT, this, err);
    }
    return this;
  }

  // we set destroyed to true before firing error callbacks in order
  // to make it re-entrance safe in case destroy() is called within callbacks

  if (this._readableState) {
    this._readableState.destroyed = true;
  }

  // if this is a duplex stream mark the writable part as destroyed as well
  if (this._writableState) {
    this._writableState.destroyed = true;
  }

  this._destroy(err || null, function (err) {
    if (!cb && err) {
      pna.nextTick(emitErrorNT, _this, err);
      if (_this._writableState) {
        _this._writableState.errorEmitted = true;
      }
    } else if (cb) {
      cb(err);
    }
  });

  return this;
}

function undestroy() {
  if (this._readableState) {
    this._readableState.destroyed = false;
    this._readableState.reading = false;
    this._readableState.ended = false;
    this._readableState.endEmitted = false;
  }

  if (this._writableState) {
    this._writableState.destroyed = false;
    this._writableState.ended = false;
    this._writableState.ending = false;
    this._writableState.finished = false;
    this._writableState.errorEmitted = false;
  }
}

function emitErrorNT(self, err) {
  self.emit('error', err);
}

module.exports = {
  destroy: destroy,
  undestroy: undestroy
};
},{"process-nextick-args":10}],20:[function(require,module,exports){
module.exports = require('events').EventEmitter;

},{"events":5}],21:[function(require,module,exports){
module.exports = require('./readable').PassThrough

},{"./readable":22}],22:[function(require,module,exports){
exports = module.exports = require('./lib/_stream_readable.js');
exports.Stream = exports;
exports.Readable = exports;
exports.Writable = require('./lib/_stream_writable.js');
exports.Duplex = require('./lib/_stream_duplex.js');
exports.Transform = require('./lib/_stream_transform.js');
exports.PassThrough = require('./lib/_stream_passthrough.js');

},{"./lib/_stream_duplex.js":13,"./lib/_stream_passthrough.js":14,"./lib/_stream_readable.js":15,"./lib/_stream_transform.js":16,"./lib/_stream_writable.js":17}],23:[function(require,module,exports){
module.exports = require('./readable').Transform

},{"./readable":22}],24:[function(require,module,exports){
module.exports = require('./lib/_stream_writable.js');

},{"./lib/_stream_writable.js":17}],25:[function(require,module,exports){
/* eslint-disable node/no-deprecated-api */
var buffer = require('buffer')
var Buffer = buffer.Buffer

// alternative to using Object.keys for old browsers
function copyProps (src, dst) {
  for (var key in src) {
    dst[key] = src[key]
  }
}
if (Buffer.from && Buffer.alloc && Buffer.allocUnsafe && Buffer.allocUnsafeSlow) {
  module.exports = buffer
} else {
  // Copy properties from require('buffer')
  copyProps(buffer, exports)
  exports.Buffer = SafeBuffer
}

function SafeBuffer (arg, encodingOrOffset, length) {
  return Buffer(arg, encodingOrOffset, length)
}

// Copy static methods from Buffer
copyProps(Buffer, SafeBuffer)

SafeBuffer.from = function (arg, encodingOrOffset, length) {
  if (typeof arg === 'number') {
    throw new TypeError('Argument must not be a number')
  }
  return Buffer(arg, encodingOrOffset, length)
}

SafeBuffer.alloc = function (size, fill, encoding) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  var buf = Buffer(size)
  if (fill !== undefined) {
    if (typeof encoding === 'string') {
      buf.fill(fill, encoding)
    } else {
      buf.fill(fill)
    }
  } else {
    buf.fill(0)
  }
  return buf
}

SafeBuffer.allocUnsafe = function (size) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  return Buffer(size)
}

SafeBuffer.allocUnsafeSlow = function (size) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  return buffer.SlowBuffer(size)
}

},{"buffer":3}],26:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

module.exports = Stream;

var EE = require('events').EventEmitter;
var inherits = require('inherits');

inherits(Stream, EE);
Stream.Readable = require('readable-stream/readable.js');
Stream.Writable = require('readable-stream/writable.js');
Stream.Duplex = require('readable-stream/duplex.js');
Stream.Transform = require('readable-stream/transform.js');
Stream.PassThrough = require('readable-stream/passthrough.js');

// Backwards-compat with node 0.4.x
Stream.Stream = Stream;



// old-style streams.  Note that the pipe method (the only relevant
// part of this class) is overridden in the Readable class.

function Stream() {
  EE.call(this);
}

Stream.prototype.pipe = function(dest, options) {
  var source = this;

  function ondata(chunk) {
    if (dest.writable) {
      if (false === dest.write(chunk) && source.pause) {
        source.pause();
      }
    }
  }

  source.on('data', ondata);

  function ondrain() {
    if (source.readable && source.resume) {
      source.resume();
    }
  }

  dest.on('drain', ondrain);

  // If the 'end' option is not supplied, dest.end() will be called when
  // source gets the 'end' or 'close' events.  Only dest.end() once.
  if (!dest._isStdio && (!options || options.end !== false)) {
    source.on('end', onend);
    source.on('close', onclose);
  }

  var didOnEnd = false;
  function onend() {
    if (didOnEnd) return;
    didOnEnd = true;

    dest.end();
  }


  function onclose() {
    if (didOnEnd) return;
    didOnEnd = true;

    if (typeof dest.destroy === 'function') dest.destroy();
  }

  // don't leave dangling pipes when there are errors.
  function onerror(er) {
    cleanup();
    if (EE.listenerCount(this, 'error') === 0) {
      throw er; // Unhandled stream error in pipe.
    }
  }

  source.on('error', onerror);
  dest.on('error', onerror);

  // remove all the event listeners that were added.
  function cleanup() {
    source.removeListener('data', ondata);
    dest.removeListener('drain', ondrain);

    source.removeListener('end', onend);
    source.removeListener('close', onclose);

    source.removeListener('error', onerror);
    dest.removeListener('error', onerror);

    source.removeListener('end', cleanup);
    source.removeListener('close', cleanup);

    dest.removeListener('close', cleanup);
  }

  source.on('end', cleanup);
  source.on('close', cleanup);

  dest.on('close', cleanup);

  dest.emit('pipe', source);

  // Allow for unix-like usage: A.pipe(B).pipe(C)
  return dest;
};

},{"events":5,"inherits":7,"readable-stream/duplex.js":12,"readable-stream/passthrough.js":21,"readable-stream/readable.js":22,"readable-stream/transform.js":23,"readable-stream/writable.js":24}],27:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

/*<replacement>*/

var Buffer = require('safe-buffer').Buffer;
/*</replacement>*/

var isEncoding = Buffer.isEncoding || function (encoding) {
  encoding = '' + encoding;
  switch (encoding && encoding.toLowerCase()) {
    case 'hex':case 'utf8':case 'utf-8':case 'ascii':case 'binary':case 'base64':case 'ucs2':case 'ucs-2':case 'utf16le':case 'utf-16le':case 'raw':
      return true;
    default:
      return false;
  }
};

function _normalizeEncoding(enc) {
  if (!enc) return 'utf8';
  var retried;
  while (true) {
    switch (enc) {
      case 'utf8':
      case 'utf-8':
        return 'utf8';
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return 'utf16le';
      case 'latin1':
      case 'binary':
        return 'latin1';
      case 'base64':
      case 'ascii':
      case 'hex':
        return enc;
      default:
        if (retried) return; // undefined
        enc = ('' + enc).toLowerCase();
        retried = true;
    }
  }
};

// Do not cache `Buffer.isEncoding` when checking encoding names as some
// modules monkey-patch it to support additional encodings
function normalizeEncoding(enc) {
  var nenc = _normalizeEncoding(enc);
  if (typeof nenc !== 'string' && (Buffer.isEncoding === isEncoding || !isEncoding(enc))) throw new Error('Unknown encoding: ' + enc);
  return nenc || enc;
}

// StringDecoder provides an interface for efficiently splitting a series of
// buffers into a series of JS strings without breaking apart multi-byte
// characters.
exports.StringDecoder = StringDecoder;
function StringDecoder(encoding) {
  this.encoding = normalizeEncoding(encoding);
  var nb;
  switch (this.encoding) {
    case 'utf16le':
      this.text = utf16Text;
      this.end = utf16End;
      nb = 4;
      break;
    case 'utf8':
      this.fillLast = utf8FillLast;
      nb = 4;
      break;
    case 'base64':
      this.text = base64Text;
      this.end = base64End;
      nb = 3;
      break;
    default:
      this.write = simpleWrite;
      this.end = simpleEnd;
      return;
  }
  this.lastNeed = 0;
  this.lastTotal = 0;
  this.lastChar = Buffer.allocUnsafe(nb);
}

StringDecoder.prototype.write = function (buf) {
  if (buf.length === 0) return '';
  var r;
  var i;
  if (this.lastNeed) {
    r = this.fillLast(buf);
    if (r === undefined) return '';
    i = this.lastNeed;
    this.lastNeed = 0;
  } else {
    i = 0;
  }
  if (i < buf.length) return r ? r + this.text(buf, i) : this.text(buf, i);
  return r || '';
};

StringDecoder.prototype.end = utf8End;

// Returns only complete characters in a Buffer
StringDecoder.prototype.text = utf8Text;

// Attempts to complete a partial non-UTF-8 character using bytes from a Buffer
StringDecoder.prototype.fillLast = function (buf) {
  if (this.lastNeed <= buf.length) {
    buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, this.lastNeed);
    return this.lastChar.toString(this.encoding, 0, this.lastTotal);
  }
  buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, buf.length);
  this.lastNeed -= buf.length;
};

// Checks the type of a UTF-8 byte, whether it's ASCII, a leading byte, or a
// continuation byte. If an invalid byte is detected, -2 is returned.
function utf8CheckByte(byte) {
  if (byte <= 0x7F) return 0;else if (byte >> 5 === 0x06) return 2;else if (byte >> 4 === 0x0E) return 3;else if (byte >> 3 === 0x1E) return 4;
  return byte >> 6 === 0x02 ? -1 : -2;
}

// Checks at most 3 bytes at the end of a Buffer in order to detect an
// incomplete multi-byte UTF-8 character. The total number of bytes (2, 3, or 4)
// needed to complete the UTF-8 character (if applicable) are returned.
function utf8CheckIncomplete(self, buf, i) {
  var j = buf.length - 1;
  if (j < i) return 0;
  var nb = utf8CheckByte(buf[j]);
  if (nb >= 0) {
    if (nb > 0) self.lastNeed = nb - 1;
    return nb;
  }
  if (--j < i || nb === -2) return 0;
  nb = utf8CheckByte(buf[j]);
  if (nb >= 0) {
    if (nb > 0) self.lastNeed = nb - 2;
    return nb;
  }
  if (--j < i || nb === -2) return 0;
  nb = utf8CheckByte(buf[j]);
  if (nb >= 0) {
    if (nb > 0) {
      if (nb === 2) nb = 0;else self.lastNeed = nb - 3;
    }
    return nb;
  }
  return 0;
}

// Validates as many continuation bytes for a multi-byte UTF-8 character as
// needed or are available. If we see a non-continuation byte where we expect
// one, we "replace" the validated continuation bytes we've seen so far with
// a single UTF-8 replacement character ('\ufffd'), to match v8's UTF-8 decoding
// behavior. The continuation byte check is included three times in the case
// where all of the continuation bytes for a character exist in the same buffer.
// It is also done this way as a slight performance increase instead of using a
// loop.
function utf8CheckExtraBytes(self, buf, p) {
  if ((buf[0] & 0xC0) !== 0x80) {
    self.lastNeed = 0;
    return '\ufffd';
  }
  if (self.lastNeed > 1 && buf.length > 1) {
    if ((buf[1] & 0xC0) !== 0x80) {
      self.lastNeed = 1;
      return '\ufffd';
    }
    if (self.lastNeed > 2 && buf.length > 2) {
      if ((buf[2] & 0xC0) !== 0x80) {
        self.lastNeed = 2;
        return '\ufffd';
      }
    }
  }
}

// Attempts to complete a multi-byte UTF-8 character using bytes from a Buffer.
function utf8FillLast(buf) {
  var p = this.lastTotal - this.lastNeed;
  var r = utf8CheckExtraBytes(this, buf, p);
  if (r !== undefined) return r;
  if (this.lastNeed <= buf.length) {
    buf.copy(this.lastChar, p, 0, this.lastNeed);
    return this.lastChar.toString(this.encoding, 0, this.lastTotal);
  }
  buf.copy(this.lastChar, p, 0, buf.length);
  this.lastNeed -= buf.length;
}

// Returns all complete UTF-8 characters in a Buffer. If the Buffer ended on a
// partial character, the character's bytes are buffered until the required
// number of bytes are available.
function utf8Text(buf, i) {
  var total = utf8CheckIncomplete(this, buf, i);
  if (!this.lastNeed) return buf.toString('utf8', i);
  this.lastTotal = total;
  var end = buf.length - (total - this.lastNeed);
  buf.copy(this.lastChar, 0, end);
  return buf.toString('utf8', i, end);
}

// For UTF-8, a replacement character is added when ending on a partial
// character.
function utf8End(buf) {
  var r = buf && buf.length ? this.write(buf) : '';
  if (this.lastNeed) return r + '\ufffd';
  return r;
}

// UTF-16LE typically needs two bytes per character, but even if we have an even
// number of bytes available, we need to check if we end on a leading/high
// surrogate. In that case, we need to wait for the next two bytes in order to
// decode the last character properly.
function utf16Text(buf, i) {
  if ((buf.length - i) % 2 === 0) {
    var r = buf.toString('utf16le', i);
    if (r) {
      var c = r.charCodeAt(r.length - 1);
      if (c >= 0xD800 && c <= 0xDBFF) {
        this.lastNeed = 2;
        this.lastTotal = 4;
        this.lastChar[0] = buf[buf.length - 2];
        this.lastChar[1] = buf[buf.length - 1];
        return r.slice(0, -1);
      }
    }
    return r;
  }
  this.lastNeed = 1;
  this.lastTotal = 2;
  this.lastChar[0] = buf[buf.length - 1];
  return buf.toString('utf16le', i, buf.length - 1);
}

// For UTF-16LE we do not explicitly append special replacement characters if we
// end on a partial character, we simply let v8 handle that.
function utf16End(buf) {
  var r = buf && buf.length ? this.write(buf) : '';
  if (this.lastNeed) {
    var end = this.lastTotal - this.lastNeed;
    return r + this.lastChar.toString('utf16le', 0, end);
  }
  return r;
}

function base64Text(buf, i) {
  var n = (buf.length - i) % 3;
  if (n === 0) return buf.toString('base64', i);
  this.lastNeed = 3 - n;
  this.lastTotal = 3;
  if (n === 1) {
    this.lastChar[0] = buf[buf.length - 1];
  } else {
    this.lastChar[0] = buf[buf.length - 2];
    this.lastChar[1] = buf[buf.length - 1];
  }
  return buf.toString('base64', i, buf.length - n);
}

function base64End(buf) {
  var r = buf && buf.length ? this.write(buf) : '';
  if (this.lastNeed) return r + this.lastChar.toString('base64', 0, 3 - this.lastNeed);
  return r;
}

// Pass bytes on through for single-byte encodings (e.g. ascii, latin1, hex)
function simpleWrite(buf) {
  return buf.toString(this.encoding);
}

function simpleEnd(buf) {
  return buf && buf.length ? this.write(buf) : '';
}
},{"safe-buffer":25}],28:[function(require,module,exports){
(function (setImmediate,clearImmediate){
var nextTick = require('process/browser.js').nextTick;
var apply = Function.prototype.apply;
var slice = Array.prototype.slice;
var immediateIds = {};
var nextImmediateId = 0;

// DOM APIs, for completeness

exports.setTimeout = function() {
  return new Timeout(apply.call(setTimeout, window, arguments), clearTimeout);
};
exports.setInterval = function() {
  return new Timeout(apply.call(setInterval, window, arguments), clearInterval);
};
exports.clearTimeout =
exports.clearInterval = function(timeout) { timeout.close(); };

function Timeout(id, clearFn) {
  this._id = id;
  this._clearFn = clearFn;
}
Timeout.prototype.unref = Timeout.prototype.ref = function() {};
Timeout.prototype.close = function() {
  this._clearFn.call(window, this._id);
};

// Does not start the time, just sets up the members needed.
exports.enroll = function(item, msecs) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = msecs;
};

exports.unenroll = function(item) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = -1;
};

exports._unrefActive = exports.active = function(item) {
  clearTimeout(item._idleTimeoutId);

  var msecs = item._idleTimeout;
  if (msecs >= 0) {
    item._idleTimeoutId = setTimeout(function onTimeout() {
      if (item._onTimeout)
        item._onTimeout();
    }, msecs);
  }
};

// That's not how node.js implements it but the exposed api is the same.
exports.setImmediate = typeof setImmediate === "function" ? setImmediate : function(fn) {
  var id = nextImmediateId++;
  var args = arguments.length < 2 ? false : slice.call(arguments, 1);

  immediateIds[id] = true;

  nextTick(function onNextTick() {
    if (immediateIds[id]) {
      // fn.call() is faster so we optimize for the common use-case
      // @see http://jsperf.com/call-apply-segu
      if (args) {
        fn.apply(null, args);
      } else {
        fn.call(null);
      }
      // Prevent ids from leaking
      exports.clearImmediate(id);
    }
  });

  return id;
};

exports.clearImmediate = typeof clearImmediate === "function" ? clearImmediate : function(id) {
  delete immediateIds[id];
};
}).call(this,require("timers").setImmediate,require("timers").clearImmediate)
},{"process/browser.js":11,"timers":28}],29:[function(require,module,exports){
(function (global){

/**
 * Module exports.
 */

module.exports = deprecate;

/**
 * Mark that a method should not be used.
 * Returns a modified function which warns once by default.
 *
 * If `localStorage.noDeprecation = true` is set, then it is a no-op.
 *
 * If `localStorage.throwDeprecation = true` is set, then deprecated functions
 * will throw an Error when invoked.
 *
 * If `localStorage.traceDeprecation = true` is set, then deprecated functions
 * will invoke `console.trace()` instead of `console.error()`.
 *
 * @param {Function} fn - the function to deprecate
 * @param {String} msg - the string to print to the console when `fn` is invoked
 * @returns {Function} a new "deprecated" version of `fn`
 * @api public
 */

function deprecate (fn, msg) {
  if (config('noDeprecation')) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (config('throwDeprecation')) {
        throw new Error(msg);
      } else if (config('traceDeprecation')) {
        console.trace(msg);
      } else {
        console.warn(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
}

/**
 * Checks `localStorage` for boolean values for the given `name`.
 *
 * @param {String} name
 * @returns {Boolean}
 * @api private
 */

function config (name) {
  // accessing global.localStorage can trigger a DOMException in sandboxed iframes
  try {
    if (!global.localStorage) return false;
  } catch (_) {
    return false;
  }
  var val = global.localStorage[name];
  if (null == val) return false;
  return String(val).toLowerCase() === 'true';
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],30:[function(require,module,exports){
var MD5 = require('md5.js')

module.exports = function (buffer) {
  return new MD5().update(buffer).digest()
}

},{"md5.js":33}],31:[function(require,module,exports){
'use strict'
var Buffer = require('safe-buffer').Buffer
var Transform = require('stream').Transform
var inherits = require('inherits')

function throwIfNotStringOrBuffer (val, prefix) {
  if (!Buffer.isBuffer(val) && typeof val !== 'string') {
    throw new TypeError(prefix + ' must be a string or a buffer')
  }
}

function HashBase (blockSize) {
  Transform.call(this)

  this._block = Buffer.allocUnsafe(blockSize)
  this._blockSize = blockSize
  this._blockOffset = 0
  this._length = [0, 0, 0, 0]

  this._finalized = false
}

inherits(HashBase, Transform)

HashBase.prototype._transform = function (chunk, encoding, callback) {
  var error = null
  try {
    this.update(chunk, encoding)
  } catch (err) {
    error = err
  }

  callback(error)
}

HashBase.prototype._flush = function (callback) {
  var error = null
  try {
    this.push(this.digest())
  } catch (err) {
    error = err
  }

  callback(error)
}

HashBase.prototype.update = function (data, encoding) {
  throwIfNotStringOrBuffer(data, 'Data')
  if (this._finalized) throw new Error('Digest already called')
  if (!Buffer.isBuffer(data)) data = Buffer.from(data, encoding)

  // consume data
  var block = this._block
  var offset = 0
  while (this._blockOffset + data.length - offset >= this._blockSize) {
    for (var i = this._blockOffset; i < this._blockSize;) block[i++] = data[offset++]
    this._update()
    this._blockOffset = 0
  }
  while (offset < data.length) block[this._blockOffset++] = data[offset++]

  // update length
  for (var j = 0, carry = data.length * 8; carry > 0; ++j) {
    this._length[j] += carry
    carry = (this._length[j] / 0x0100000000) | 0
    if (carry > 0) this._length[j] -= 0x0100000000 * carry
  }

  return this
}

HashBase.prototype._update = function () {
  throw new Error('_update is not implemented')
}

HashBase.prototype.digest = function (encoding) {
  if (this._finalized) throw new Error('Digest already called')
  this._finalized = true

  var digest = this._digest()
  if (encoding !== undefined) digest = digest.toString(encoding)

  // reset state
  this._block.fill(0)
  this._blockOffset = 0
  for (var i = 0; i < 4; ++i) this._length[i] = 0

  return digest
}

HashBase.prototype._digest = function () {
  throw new Error('_digest is not implemented')
}

module.exports = HashBase

},{"inherits":32,"safe-buffer":40,"stream":26}],32:[function(require,module,exports){
arguments[4][7][0].apply(exports,arguments)
},{"dup":7}],33:[function(require,module,exports){
(function (Buffer){
'use strict'
var inherits = require('inherits')
var HashBase = require('hash-base')

var ARRAY16 = new Array(16)

function MD5 () {
  HashBase.call(this, 64)

  // state
  this._a = 0x67452301
  this._b = 0xefcdab89
  this._c = 0x98badcfe
  this._d = 0x10325476
}

inherits(MD5, HashBase)

MD5.prototype._update = function () {
  var M = ARRAY16
  for (var i = 0; i < 16; ++i) M[i] = this._block.readInt32LE(i * 4)

  var a = this._a
  var b = this._b
  var c = this._c
  var d = this._d

  a = fnF(a, b, c, d, M[0], 0xd76aa478, 7)
  d = fnF(d, a, b, c, M[1], 0xe8c7b756, 12)
  c = fnF(c, d, a, b, M[2], 0x242070db, 17)
  b = fnF(b, c, d, a, M[3], 0xc1bdceee, 22)
  a = fnF(a, b, c, d, M[4], 0xf57c0faf, 7)
  d = fnF(d, a, b, c, M[5], 0x4787c62a, 12)
  c = fnF(c, d, a, b, M[6], 0xa8304613, 17)
  b = fnF(b, c, d, a, M[7], 0xfd469501, 22)
  a = fnF(a, b, c, d, M[8], 0x698098d8, 7)
  d = fnF(d, a, b, c, M[9], 0x8b44f7af, 12)
  c = fnF(c, d, a, b, M[10], 0xffff5bb1, 17)
  b = fnF(b, c, d, a, M[11], 0x895cd7be, 22)
  a = fnF(a, b, c, d, M[12], 0x6b901122, 7)
  d = fnF(d, a, b, c, M[13], 0xfd987193, 12)
  c = fnF(c, d, a, b, M[14], 0xa679438e, 17)
  b = fnF(b, c, d, a, M[15], 0x49b40821, 22)

  a = fnG(a, b, c, d, M[1], 0xf61e2562, 5)
  d = fnG(d, a, b, c, M[6], 0xc040b340, 9)
  c = fnG(c, d, a, b, M[11], 0x265e5a51, 14)
  b = fnG(b, c, d, a, M[0], 0xe9b6c7aa, 20)
  a = fnG(a, b, c, d, M[5], 0xd62f105d, 5)
  d = fnG(d, a, b, c, M[10], 0x02441453, 9)
  c = fnG(c, d, a, b, M[15], 0xd8a1e681, 14)
  b = fnG(b, c, d, a, M[4], 0xe7d3fbc8, 20)
  a = fnG(a, b, c, d, M[9], 0x21e1cde6, 5)
  d = fnG(d, a, b, c, M[14], 0xc33707d6, 9)
  c = fnG(c, d, a, b, M[3], 0xf4d50d87, 14)
  b = fnG(b, c, d, a, M[8], 0x455a14ed, 20)
  a = fnG(a, b, c, d, M[13], 0xa9e3e905, 5)
  d = fnG(d, a, b, c, M[2], 0xfcefa3f8, 9)
  c = fnG(c, d, a, b, M[7], 0x676f02d9, 14)
  b = fnG(b, c, d, a, M[12], 0x8d2a4c8a, 20)

  a = fnH(a, b, c, d, M[5], 0xfffa3942, 4)
  d = fnH(d, a, b, c, M[8], 0x8771f681, 11)
  c = fnH(c, d, a, b, M[11], 0x6d9d6122, 16)
  b = fnH(b, c, d, a, M[14], 0xfde5380c, 23)
  a = fnH(a, b, c, d, M[1], 0xa4beea44, 4)
  d = fnH(d, a, b, c, M[4], 0x4bdecfa9, 11)
  c = fnH(c, d, a, b, M[7], 0xf6bb4b60, 16)
  b = fnH(b, c, d, a, M[10], 0xbebfbc70, 23)
  a = fnH(a, b, c, d, M[13], 0x289b7ec6, 4)
  d = fnH(d, a, b, c, M[0], 0xeaa127fa, 11)
  c = fnH(c, d, a, b, M[3], 0xd4ef3085, 16)
  b = fnH(b, c, d, a, M[6], 0x04881d05, 23)
  a = fnH(a, b, c, d, M[9], 0xd9d4d039, 4)
  d = fnH(d, a, b, c, M[12], 0xe6db99e5, 11)
  c = fnH(c, d, a, b, M[15], 0x1fa27cf8, 16)
  b = fnH(b, c, d, a, M[2], 0xc4ac5665, 23)

  a = fnI(a, b, c, d, M[0], 0xf4292244, 6)
  d = fnI(d, a, b, c, M[7], 0x432aff97, 10)
  c = fnI(c, d, a, b, M[14], 0xab9423a7, 15)
  b = fnI(b, c, d, a, M[5], 0xfc93a039, 21)
  a = fnI(a, b, c, d, M[12], 0x655b59c3, 6)
  d = fnI(d, a, b, c, M[3], 0x8f0ccc92, 10)
  c = fnI(c, d, a, b, M[10], 0xffeff47d, 15)
  b = fnI(b, c, d, a, M[1], 0x85845dd1, 21)
  a = fnI(a, b, c, d, M[8], 0x6fa87e4f, 6)
  d = fnI(d, a, b, c, M[15], 0xfe2ce6e0, 10)
  c = fnI(c, d, a, b, M[6], 0xa3014314, 15)
  b = fnI(b, c, d, a, M[13], 0x4e0811a1, 21)
  a = fnI(a, b, c, d, M[4], 0xf7537e82, 6)
  d = fnI(d, a, b, c, M[11], 0xbd3af235, 10)
  c = fnI(c, d, a, b, M[2], 0x2ad7d2bb, 15)
  b = fnI(b, c, d, a, M[9], 0xeb86d391, 21)

  this._a = (this._a + a) | 0
  this._b = (this._b + b) | 0
  this._c = (this._c + c) | 0
  this._d = (this._d + d) | 0
}

MD5.prototype._digest = function () {
  // create padding and handle blocks
  this._block[this._blockOffset++] = 0x80
  if (this._blockOffset > 56) {
    this._block.fill(0, this._blockOffset, 64)
    this._update()
    this._blockOffset = 0
  }

  this._block.fill(0, this._blockOffset, 56)
  this._block.writeUInt32LE(this._length[0], 56)
  this._block.writeUInt32LE(this._length[1], 60)
  this._update()

  // produce result
  var buffer = new Buffer(16)
  buffer.writeInt32LE(this._a, 0)
  buffer.writeInt32LE(this._b, 4)
  buffer.writeInt32LE(this._c, 8)
  buffer.writeInt32LE(this._d, 12)
  return buffer
}

function rotl (x, n) {
  return (x << n) | (x >>> (32 - n))
}

function fnF (a, b, c, d, m, k, s) {
  return (rotl((a + ((b & c) | ((~b) & d)) + m + k) | 0, s) + b) | 0
}

function fnG (a, b, c, d, m, k, s) {
  return (rotl((a + ((b & d) | (c & (~d))) + m + k) | 0, s) + b) | 0
}

function fnH (a, b, c, d, m, k, s) {
  return (rotl((a + (b ^ c ^ d) + m + k) | 0, s) + b) | 0
}

function fnI (a, b, c, d, m, k, s) {
  return (rotl((a + ((c ^ (b | (~d)))) + m + k) | 0, s) + b) | 0
}

module.exports = MD5

}).call(this,require("buffer").Buffer)
},{"buffer":3,"hash-base":31,"inherits":32}],34:[function(require,module,exports){
exports.pbkdf2 = require('./lib/async')
exports.pbkdf2Sync = require('./lib/sync')

},{"./lib/async":35,"./lib/sync":38}],35:[function(require,module,exports){
(function (process,global){
var checkParameters = require('./precondition')
var defaultEncoding = require('./default-encoding')
var sync = require('./sync')
var Buffer = require('safe-buffer').Buffer

var ZERO_BUF
var subtle = global.crypto && global.crypto.subtle
var toBrowser = {
  'sha': 'SHA-1',
  'sha-1': 'SHA-1',
  'sha1': 'SHA-1',
  'sha256': 'SHA-256',
  'sha-256': 'SHA-256',
  'sha384': 'SHA-384',
  'sha-384': 'SHA-384',
  'sha-512': 'SHA-512',
  'sha512': 'SHA-512'
}
var checks = []
function checkNative (algo) {
  if (global.process && !global.process.browser) {
    return Promise.resolve(false)
  }
  if (!subtle || !subtle.importKey || !subtle.deriveBits) {
    return Promise.resolve(false)
  }
  if (checks[algo] !== undefined) {
    return checks[algo]
  }
  ZERO_BUF = ZERO_BUF || Buffer.alloc(8)
  var prom = browserPbkdf2(ZERO_BUF, ZERO_BUF, 10, 128, algo)
    .then(function () {
      return true
    }).catch(function () {
      return false
    })
  checks[algo] = prom
  return prom
}

function browserPbkdf2 (password, salt, iterations, length, algo) {
  return subtle.importKey(
    'raw', password, {name: 'PBKDF2'}, false, ['deriveBits']
  ).then(function (key) {
    return subtle.deriveBits({
      name: 'PBKDF2',
      salt: salt,
      iterations: iterations,
      hash: {
        name: algo
      }
    }, key, length << 3)
  }).then(function (res) {
    return Buffer.from(res)
  })
}

function resolvePromise (promise, callback) {
  promise.then(function (out) {
    process.nextTick(function () {
      callback(null, out)
    })
  }, function (e) {
    process.nextTick(function () {
      callback(e)
    })
  })
}
module.exports = function (password, salt, iterations, keylen, digest, callback) {
  if (typeof digest === 'function') {
    callback = digest
    digest = undefined
  }

  digest = digest || 'sha1'
  var algo = toBrowser[digest.toLowerCase()]

  if (!algo || typeof global.Promise !== 'function') {
    return process.nextTick(function () {
      var out
      try {
        out = sync(password, salt, iterations, keylen, digest)
      } catch (e) {
        return callback(e)
      }
      callback(null, out)
    })
  }

  checkParameters(password, salt, iterations, keylen)
  if (typeof callback !== 'function') throw new Error('No callback provided to pbkdf2')
  if (!Buffer.isBuffer(password)) password = Buffer.from(password, defaultEncoding)
  if (!Buffer.isBuffer(salt)) salt = Buffer.from(salt, defaultEncoding)

  resolvePromise(checkNative(algo).then(function (resp) {
    if (resp) return browserPbkdf2(password, salt, iterations, keylen, algo)

    return sync(password, salt, iterations, keylen, digest)
  }), callback)
}

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./default-encoding":36,"./precondition":37,"./sync":38,"_process":11,"safe-buffer":40}],36:[function(require,module,exports){
(function (process){
var defaultEncoding
/* istanbul ignore next */
if (process.browser) {
  defaultEncoding = 'utf-8'
} else {
  var pVersionMajor = parseInt(process.version.split('.')[0].slice(1), 10)

  defaultEncoding = pVersionMajor >= 6 ? 'utf-8' : 'binary'
}
module.exports = defaultEncoding

}).call(this,require('_process'))
},{"_process":11}],37:[function(require,module,exports){
(function (Buffer){
var MAX_ALLOC = Math.pow(2, 30) - 1 // default in iojs

function checkBuffer (buf, name) {
  if (typeof buf !== 'string' && !Buffer.isBuffer(buf)) {
    throw new TypeError(name + ' must be a buffer or string')
  }
}

module.exports = function (password, salt, iterations, keylen) {
  checkBuffer(password, 'Password')
  checkBuffer(salt, 'Salt')

  if (typeof iterations !== 'number') {
    throw new TypeError('Iterations not a number')
  }

  if (iterations < 0) {
    throw new TypeError('Bad iterations')
  }

  if (typeof keylen !== 'number') {
    throw new TypeError('Key length not a number')
  }

  if (keylen < 0 || keylen > MAX_ALLOC || keylen !== keylen) { /* eslint no-self-compare: 0 */
    throw new TypeError('Bad key length')
  }
}

}).call(this,{"isBuffer":require("C:/Users/Normand/AppData/Roaming/npm/node_modules/browserify/node_modules/is-buffer/index.js")})
},{"C:/Users/Normand/AppData/Roaming/npm/node_modules/browserify/node_modules/is-buffer/index.js":8}],38:[function(require,module,exports){
var md5 = require('create-hash/md5')
var rmd160 = require('ripemd160')
var sha = require('sha.js')

var checkParameters = require('./precondition')
var defaultEncoding = require('./default-encoding')
var Buffer = require('safe-buffer').Buffer
var ZEROS = Buffer.alloc(128)
var sizes = {
  md5: 16,
  sha1: 20,
  sha224: 28,
  sha256: 32,
  sha384: 48,
  sha512: 64,
  rmd160: 20,
  ripemd160: 20
}

function Hmac (alg, key, saltLen) {
  var hash = getDigest(alg)
  var blocksize = (alg === 'sha512' || alg === 'sha384') ? 128 : 64

  if (key.length > blocksize) {
    key = hash(key)
  } else if (key.length < blocksize) {
    key = Buffer.concat([key, ZEROS], blocksize)
  }

  var ipad = Buffer.allocUnsafe(blocksize + sizes[alg])
  var opad = Buffer.allocUnsafe(blocksize + sizes[alg])
  for (var i = 0; i < blocksize; i++) {
    ipad[i] = key[i] ^ 0x36
    opad[i] = key[i] ^ 0x5C
  }

  var ipad1 = Buffer.allocUnsafe(blocksize + saltLen + 4)
  ipad.copy(ipad1, 0, 0, blocksize)
  this.ipad1 = ipad1
  this.ipad2 = ipad
  this.opad = opad
  this.alg = alg
  this.blocksize = blocksize
  this.hash = hash
  this.size = sizes[alg]
}

Hmac.prototype.run = function (data, ipad) {
  data.copy(ipad, this.blocksize)
  var h = this.hash(ipad)
  h.copy(this.opad, this.blocksize)
  return this.hash(this.opad)
}

function getDigest (alg) {
  function shaFunc (data) {
    return sha(alg).update(data).digest()
  }

  if (alg === 'rmd160' || alg === 'ripemd160') return rmd160
  if (alg === 'md5') return md5
  return shaFunc
}

function pbkdf2 (password, salt, iterations, keylen, digest) {
  checkParameters(password, salt, iterations, keylen)

  if (!Buffer.isBuffer(password)) password = Buffer.from(password, defaultEncoding)
  if (!Buffer.isBuffer(salt)) salt = Buffer.from(salt, defaultEncoding)

  digest = digest || 'sha1'

  var hmac = new Hmac(digest, password, salt.length)

  var DK = Buffer.allocUnsafe(keylen)
  var block1 = Buffer.allocUnsafe(salt.length + 4)
  salt.copy(block1, 0, 0, salt.length)

  var destPos = 0
  var hLen = sizes[digest]
  var l = Math.ceil(keylen / hLen)

  for (var i = 1; i <= l; i++) {
    block1.writeUInt32BE(i, salt.length)

    var T = hmac.run(block1, hmac.ipad1)
    var U = T

    for (var j = 1; j < iterations; j++) {
      U = hmac.run(U, hmac.ipad2)
      for (var k = 0; k < hLen; k++) T[k] ^= U[k]
    }

    T.copy(DK, destPos)
    destPos += hLen
  }

  return DK
}

module.exports = pbkdf2

},{"./default-encoding":36,"./precondition":37,"create-hash/md5":30,"ripemd160":39,"safe-buffer":40,"sha.js":42}],39:[function(require,module,exports){
'use strict'
var Buffer = require('buffer').Buffer
var inherits = require('inherits')
var HashBase = require('hash-base')

var ARRAY16 = new Array(16)

var zl = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
  7, 4, 13, 1, 10, 6, 15, 3, 12, 0, 9, 5, 2, 14, 11, 8,
  3, 10, 14, 4, 9, 15, 8, 1, 2, 7, 0, 6, 13, 11, 5, 12,
  1, 9, 11, 10, 0, 8, 12, 4, 13, 3, 7, 15, 14, 5, 6, 2,
  4, 0, 5, 9, 7, 12, 2, 10, 14, 1, 3, 8, 11, 6, 15, 13
]

var zr = [
  5, 14, 7, 0, 9, 2, 11, 4, 13, 6, 15, 8, 1, 10, 3, 12,
  6, 11, 3, 7, 0, 13, 5, 10, 14, 15, 8, 12, 4, 9, 1, 2,
  15, 5, 1, 3, 7, 14, 6, 9, 11, 8, 12, 2, 10, 0, 4, 13,
  8, 6, 4, 1, 3, 11, 15, 0, 5, 12, 2, 13, 9, 7, 10, 14,
  12, 15, 10, 4, 1, 5, 8, 7, 6, 2, 13, 14, 0, 3, 9, 11
]

var sl = [
  11, 14, 15, 12, 5, 8, 7, 9, 11, 13, 14, 15, 6, 7, 9, 8,
  7, 6, 8, 13, 11, 9, 7, 15, 7, 12, 15, 9, 11, 7, 13, 12,
  11, 13, 6, 7, 14, 9, 13, 15, 14, 8, 13, 6, 5, 12, 7, 5,
  11, 12, 14, 15, 14, 15, 9, 8, 9, 14, 5, 6, 8, 6, 5, 12,
  9, 15, 5, 11, 6, 8, 13, 12, 5, 12, 13, 14, 11, 8, 5, 6
]

var sr = [
  8, 9, 9, 11, 13, 15, 15, 5, 7, 7, 8, 11, 14, 14, 12, 6,
  9, 13, 15, 7, 12, 8, 9, 11, 7, 7, 12, 7, 6, 15, 13, 11,
  9, 7, 15, 11, 8, 6, 6, 14, 12, 13, 5, 14, 13, 13, 7, 5,
  15, 5, 8, 11, 14, 14, 6, 14, 6, 9, 12, 9, 12, 5, 15, 8,
  8, 5, 12, 9, 12, 5, 14, 6, 8, 13, 6, 5, 15, 13, 11, 11
]

var hl = [0x00000000, 0x5a827999, 0x6ed9eba1, 0x8f1bbcdc, 0xa953fd4e]
var hr = [0x50a28be6, 0x5c4dd124, 0x6d703ef3, 0x7a6d76e9, 0x00000000]

function RIPEMD160 () {
  HashBase.call(this, 64)

  // state
  this._a = 0x67452301
  this._b = 0xefcdab89
  this._c = 0x98badcfe
  this._d = 0x10325476
  this._e = 0xc3d2e1f0
}

inherits(RIPEMD160, HashBase)

RIPEMD160.prototype._update = function () {
  var words = ARRAY16
  for (var j = 0; j < 16; ++j) words[j] = this._block.readInt32LE(j * 4)

  var al = this._a | 0
  var bl = this._b | 0
  var cl = this._c | 0
  var dl = this._d | 0
  var el = this._e | 0

  var ar = this._a | 0
  var br = this._b | 0
  var cr = this._c | 0
  var dr = this._d | 0
  var er = this._e | 0

  // computation
  for (var i = 0; i < 80; i += 1) {
    var tl
    var tr
    if (i < 16) {
      tl = fn1(al, bl, cl, dl, el, words[zl[i]], hl[0], sl[i])
      tr = fn5(ar, br, cr, dr, er, words[zr[i]], hr[0], sr[i])
    } else if (i < 32) {
      tl = fn2(al, bl, cl, dl, el, words[zl[i]], hl[1], sl[i])
      tr = fn4(ar, br, cr, dr, er, words[zr[i]], hr[1], sr[i])
    } else if (i < 48) {
      tl = fn3(al, bl, cl, dl, el, words[zl[i]], hl[2], sl[i])
      tr = fn3(ar, br, cr, dr, er, words[zr[i]], hr[2], sr[i])
    } else if (i < 64) {
      tl = fn4(al, bl, cl, dl, el, words[zl[i]], hl[3], sl[i])
      tr = fn2(ar, br, cr, dr, er, words[zr[i]], hr[3], sr[i])
    } else { // if (i<80) {
      tl = fn5(al, bl, cl, dl, el, words[zl[i]], hl[4], sl[i])
      tr = fn1(ar, br, cr, dr, er, words[zr[i]], hr[4], sr[i])
    }

    al = el
    el = dl
    dl = rotl(cl, 10)
    cl = bl
    bl = tl

    ar = er
    er = dr
    dr = rotl(cr, 10)
    cr = br
    br = tr
  }

  // update state
  var t = (this._b + cl + dr) | 0
  this._b = (this._c + dl + er) | 0
  this._c = (this._d + el + ar) | 0
  this._d = (this._e + al + br) | 0
  this._e = (this._a + bl + cr) | 0
  this._a = t
}

RIPEMD160.prototype._digest = function () {
  // create padding and handle blocks
  this._block[this._blockOffset++] = 0x80
  if (this._blockOffset > 56) {
    this._block.fill(0, this._blockOffset, 64)
    this._update()
    this._blockOffset = 0
  }

  this._block.fill(0, this._blockOffset, 56)
  this._block.writeUInt32LE(this._length[0], 56)
  this._block.writeUInt32LE(this._length[1], 60)
  this._update()

  // produce result
  var buffer = Buffer.alloc ? Buffer.alloc(20) : new Buffer(20)
  buffer.writeInt32LE(this._a, 0)
  buffer.writeInt32LE(this._b, 4)
  buffer.writeInt32LE(this._c, 8)
  buffer.writeInt32LE(this._d, 12)
  buffer.writeInt32LE(this._e, 16)
  return buffer
}

function rotl (x, n) {
  return (x << n) | (x >>> (32 - n))
}

function fn1 (a, b, c, d, e, m, k, s) {
  return (rotl((a + (b ^ c ^ d) + m + k) | 0, s) + e) | 0
}

function fn2 (a, b, c, d, e, m, k, s) {
  return (rotl((a + ((b & c) | ((~b) & d)) + m + k) | 0, s) + e) | 0
}

function fn3 (a, b, c, d, e, m, k, s) {
  return (rotl((a + ((b | (~c)) ^ d) + m + k) | 0, s) + e) | 0
}

function fn4 (a, b, c, d, e, m, k, s) {
  return (rotl((a + ((b & d) | (c & (~d))) + m + k) | 0, s) + e) | 0
}

function fn5 (a, b, c, d, e, m, k, s) {
  return (rotl((a + (b ^ (c | (~d))) + m + k) | 0, s) + e) | 0
}

module.exports = RIPEMD160

},{"buffer":3,"hash-base":31,"inherits":32}],40:[function(require,module,exports){
arguments[4][25][0].apply(exports,arguments)
},{"buffer":3,"dup":25}],41:[function(require,module,exports){
var Buffer = require('safe-buffer').Buffer

// prototype class for hash functions
function Hash (blockSize, finalSize) {
  this._block = Buffer.alloc(blockSize)
  this._finalSize = finalSize
  this._blockSize = blockSize
  this._len = 0
}

Hash.prototype.update = function (data, enc) {
  if (typeof data === 'string') {
    enc = enc || 'utf8'
    data = Buffer.from(data, enc)
  }

  var block = this._block
  var blockSize = this._blockSize
  var length = data.length
  var accum = this._len

  for (var offset = 0; offset < length;) {
    var assigned = accum % blockSize
    var remainder = Math.min(length - offset, blockSize - assigned)

    for (var i = 0; i < remainder; i++) {
      block[assigned + i] = data[offset + i]
    }

    accum += remainder
    offset += remainder

    if ((accum % blockSize) === 0) {
      this._update(block)
    }
  }

  this._len += length
  return this
}

Hash.prototype.digest = function (enc) {
  var rem = this._len % this._blockSize

  this._block[rem] = 0x80

  // zero (rem + 1) trailing bits, where (rem + 1) is the smallest
  // non-negative solution to the equation (length + 1 + (rem + 1)) === finalSize mod blockSize
  this._block.fill(0, rem + 1)

  if (rem >= this._finalSize) {
    this._update(this._block)
    this._block.fill(0)
  }

  var bits = this._len * 8

  // uint32
  if (bits <= 0xffffffff) {
    this._block.writeUInt32BE(bits, this._blockSize - 4)

  // uint64
  } else {
    var lowBits = (bits & 0xffffffff) >>> 0
    var highBits = (bits - lowBits) / 0x100000000

    this._block.writeUInt32BE(highBits, this._blockSize - 8)
    this._block.writeUInt32BE(lowBits, this._blockSize - 4)
  }

  this._update(this._block)
  var hash = this._hash()

  return enc ? hash.toString(enc) : hash
}

Hash.prototype._update = function () {
  throw new Error('_update must be implemented by subclass')
}

module.exports = Hash

},{"safe-buffer":40}],42:[function(require,module,exports){
var exports = module.exports = function SHA (algorithm) {
  algorithm = algorithm.toLowerCase()

  var Algorithm = exports[algorithm]
  if (!Algorithm) throw new Error(algorithm + ' is not supported (we accept pull requests)')

  return new Algorithm()
}

exports.sha = require('./sha')
exports.sha1 = require('./sha1')
exports.sha224 = require('./sha224')
exports.sha256 = require('./sha256')
exports.sha384 = require('./sha384')
exports.sha512 = require('./sha512')

},{"./sha":43,"./sha1":44,"./sha224":45,"./sha256":46,"./sha384":47,"./sha512":48}],43:[function(require,module,exports){
/*
 * A JavaScript implementation of the Secure Hash Algorithm, SHA-0, as defined
 * in FIPS PUB 180-1
 * This source code is derived from sha1.js of the same repository.
 * The difference between SHA-0 and SHA-1 is just a bitwise rotate left
 * operation was added.
 */

var inherits = require('inherits')
var Hash = require('./hash')
var Buffer = require('safe-buffer').Buffer

var K = [
  0x5a827999, 0x6ed9eba1, 0x8f1bbcdc | 0, 0xca62c1d6 | 0
]

var W = new Array(80)

function Sha () {
  this.init()
  this._w = W

  Hash.call(this, 64, 56)
}

inherits(Sha, Hash)

Sha.prototype.init = function () {
  this._a = 0x67452301
  this._b = 0xefcdab89
  this._c = 0x98badcfe
  this._d = 0x10325476
  this._e = 0xc3d2e1f0

  return this
}

function rotl5 (num) {
  return (num << 5) | (num >>> 27)
}

function rotl30 (num) {
  return (num << 30) | (num >>> 2)
}

function ft (s, b, c, d) {
  if (s === 0) return (b & c) | ((~b) & d)
  if (s === 2) return (b & c) | (b & d) | (c & d)
  return b ^ c ^ d
}

Sha.prototype._update = function (M) {
  var W = this._w

  var a = this._a | 0
  var b = this._b | 0
  var c = this._c | 0
  var d = this._d | 0
  var e = this._e | 0

  for (var i = 0; i < 16; ++i) W[i] = M.readInt32BE(i * 4)
  for (; i < 80; ++i) W[i] = W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16]

  for (var j = 0; j < 80; ++j) {
    var s = ~~(j / 20)
    var t = (rotl5(a) + ft(s, b, c, d) + e + W[j] + K[s]) | 0

    e = d
    d = c
    c = rotl30(b)
    b = a
    a = t
  }

  this._a = (a + this._a) | 0
  this._b = (b + this._b) | 0
  this._c = (c + this._c) | 0
  this._d = (d + this._d) | 0
  this._e = (e + this._e) | 0
}

Sha.prototype._hash = function () {
  var H = Buffer.allocUnsafe(20)

  H.writeInt32BE(this._a | 0, 0)
  H.writeInt32BE(this._b | 0, 4)
  H.writeInt32BE(this._c | 0, 8)
  H.writeInt32BE(this._d | 0, 12)
  H.writeInt32BE(this._e | 0, 16)

  return H
}

module.exports = Sha

},{"./hash":41,"inherits":32,"safe-buffer":40}],44:[function(require,module,exports){
/*
 * A JavaScript implementation of the Secure Hash Algorithm, SHA-1, as defined
 * in FIPS PUB 180-1
 * Version 2.1a Copyright Paul Johnston 2000 - 2002.
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 * See http://pajhome.org.uk/crypt/md5 for details.
 */

var inherits = require('inherits')
var Hash = require('./hash')
var Buffer = require('safe-buffer').Buffer

var K = [
  0x5a827999, 0x6ed9eba1, 0x8f1bbcdc | 0, 0xca62c1d6 | 0
]

var W = new Array(80)

function Sha1 () {
  this.init()
  this._w = W

  Hash.call(this, 64, 56)
}

inherits(Sha1, Hash)

Sha1.prototype.init = function () {
  this._a = 0x67452301
  this._b = 0xefcdab89
  this._c = 0x98badcfe
  this._d = 0x10325476
  this._e = 0xc3d2e1f0

  return this
}

function rotl1 (num) {
  return (num << 1) | (num >>> 31)
}

function rotl5 (num) {
  return (num << 5) | (num >>> 27)
}

function rotl30 (num) {
  return (num << 30) | (num >>> 2)
}

function ft (s, b, c, d) {
  if (s === 0) return (b & c) | ((~b) & d)
  if (s === 2) return (b & c) | (b & d) | (c & d)
  return b ^ c ^ d
}

Sha1.prototype._update = function (M) {
  var W = this._w

  var a = this._a | 0
  var b = this._b | 0
  var c = this._c | 0
  var d = this._d | 0
  var e = this._e | 0

  for (var i = 0; i < 16; ++i) W[i] = M.readInt32BE(i * 4)
  for (; i < 80; ++i) W[i] = rotl1(W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16])

  for (var j = 0; j < 80; ++j) {
    var s = ~~(j / 20)
    var t = (rotl5(a) + ft(s, b, c, d) + e + W[j] + K[s]) | 0

    e = d
    d = c
    c = rotl30(b)
    b = a
    a = t
  }

  this._a = (a + this._a) | 0
  this._b = (b + this._b) | 0
  this._c = (c + this._c) | 0
  this._d = (d + this._d) | 0
  this._e = (e + this._e) | 0
}

Sha1.prototype._hash = function () {
  var H = Buffer.allocUnsafe(20)

  H.writeInt32BE(this._a | 0, 0)
  H.writeInt32BE(this._b | 0, 4)
  H.writeInt32BE(this._c | 0, 8)
  H.writeInt32BE(this._d | 0, 12)
  H.writeInt32BE(this._e | 0, 16)

  return H
}

module.exports = Sha1

},{"./hash":41,"inherits":32,"safe-buffer":40}],45:[function(require,module,exports){
/**
 * A JavaScript implementation of the Secure Hash Algorithm, SHA-256, as defined
 * in FIPS 180-2
 * Version 2.2-beta Copyright Angel Marin, Paul Johnston 2000 - 2009.
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 *
 */

var inherits = require('inherits')
var Sha256 = require('./sha256')
var Hash = require('./hash')
var Buffer = require('safe-buffer').Buffer

var W = new Array(64)

function Sha224 () {
  this.init()

  this._w = W // new Array(64)

  Hash.call(this, 64, 56)
}

inherits(Sha224, Sha256)

Sha224.prototype.init = function () {
  this._a = 0xc1059ed8
  this._b = 0x367cd507
  this._c = 0x3070dd17
  this._d = 0xf70e5939
  this._e = 0xffc00b31
  this._f = 0x68581511
  this._g = 0x64f98fa7
  this._h = 0xbefa4fa4

  return this
}

Sha224.prototype._hash = function () {
  var H = Buffer.allocUnsafe(28)

  H.writeInt32BE(this._a, 0)
  H.writeInt32BE(this._b, 4)
  H.writeInt32BE(this._c, 8)
  H.writeInt32BE(this._d, 12)
  H.writeInt32BE(this._e, 16)
  H.writeInt32BE(this._f, 20)
  H.writeInt32BE(this._g, 24)

  return H
}

module.exports = Sha224

},{"./hash":41,"./sha256":46,"inherits":32,"safe-buffer":40}],46:[function(require,module,exports){
/**
 * A JavaScript implementation of the Secure Hash Algorithm, SHA-256, as defined
 * in FIPS 180-2
 * Version 2.2-beta Copyright Angel Marin, Paul Johnston 2000 - 2009.
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 *
 */

var inherits = require('inherits')
var Hash = require('./hash')
var Buffer = require('safe-buffer').Buffer

var K = [
  0x428A2F98, 0x71374491, 0xB5C0FBCF, 0xE9B5DBA5,
  0x3956C25B, 0x59F111F1, 0x923F82A4, 0xAB1C5ED5,
  0xD807AA98, 0x12835B01, 0x243185BE, 0x550C7DC3,
  0x72BE5D74, 0x80DEB1FE, 0x9BDC06A7, 0xC19BF174,
  0xE49B69C1, 0xEFBE4786, 0x0FC19DC6, 0x240CA1CC,
  0x2DE92C6F, 0x4A7484AA, 0x5CB0A9DC, 0x76F988DA,
  0x983E5152, 0xA831C66D, 0xB00327C8, 0xBF597FC7,
  0xC6E00BF3, 0xD5A79147, 0x06CA6351, 0x14292967,
  0x27B70A85, 0x2E1B2138, 0x4D2C6DFC, 0x53380D13,
  0x650A7354, 0x766A0ABB, 0x81C2C92E, 0x92722C85,
  0xA2BFE8A1, 0xA81A664B, 0xC24B8B70, 0xC76C51A3,
  0xD192E819, 0xD6990624, 0xF40E3585, 0x106AA070,
  0x19A4C116, 0x1E376C08, 0x2748774C, 0x34B0BCB5,
  0x391C0CB3, 0x4ED8AA4A, 0x5B9CCA4F, 0x682E6FF3,
  0x748F82EE, 0x78A5636F, 0x84C87814, 0x8CC70208,
  0x90BEFFFA, 0xA4506CEB, 0xBEF9A3F7, 0xC67178F2
]

var W = new Array(64)

function Sha256 () {
  this.init()

  this._w = W // new Array(64)

  Hash.call(this, 64, 56)
}

inherits(Sha256, Hash)

Sha256.prototype.init = function () {
  this._a = 0x6a09e667
  this._b = 0xbb67ae85
  this._c = 0x3c6ef372
  this._d = 0xa54ff53a
  this._e = 0x510e527f
  this._f = 0x9b05688c
  this._g = 0x1f83d9ab
  this._h = 0x5be0cd19

  return this
}

function ch (x, y, z) {
  return z ^ (x & (y ^ z))
}

function maj (x, y, z) {
  return (x & y) | (z & (x | y))
}

function sigma0 (x) {
  return (x >>> 2 | x << 30) ^ (x >>> 13 | x << 19) ^ (x >>> 22 | x << 10)
}

function sigma1 (x) {
  return (x >>> 6 | x << 26) ^ (x >>> 11 | x << 21) ^ (x >>> 25 | x << 7)
}

function gamma0 (x) {
  return (x >>> 7 | x << 25) ^ (x >>> 18 | x << 14) ^ (x >>> 3)
}

function gamma1 (x) {
  return (x >>> 17 | x << 15) ^ (x >>> 19 | x << 13) ^ (x >>> 10)
}

Sha256.prototype._update = function (M) {
  var W = this._w

  var a = this._a | 0
  var b = this._b | 0
  var c = this._c | 0
  var d = this._d | 0
  var e = this._e | 0
  var f = this._f | 0
  var g = this._g | 0
  var h = this._h | 0

  for (var i = 0; i < 16; ++i) W[i] = M.readInt32BE(i * 4)
  for (; i < 64; ++i) W[i] = (gamma1(W[i - 2]) + W[i - 7] + gamma0(W[i - 15]) + W[i - 16]) | 0

  for (var j = 0; j < 64; ++j) {
    var T1 = (h + sigma1(e) + ch(e, f, g) + K[j] + W[j]) | 0
    var T2 = (sigma0(a) + maj(a, b, c)) | 0

    h = g
    g = f
    f = e
    e = (d + T1) | 0
    d = c
    c = b
    b = a
    a = (T1 + T2) | 0
  }

  this._a = (a + this._a) | 0
  this._b = (b + this._b) | 0
  this._c = (c + this._c) | 0
  this._d = (d + this._d) | 0
  this._e = (e + this._e) | 0
  this._f = (f + this._f) | 0
  this._g = (g + this._g) | 0
  this._h = (h + this._h) | 0
}

Sha256.prototype._hash = function () {
  var H = Buffer.allocUnsafe(32)

  H.writeInt32BE(this._a, 0)
  H.writeInt32BE(this._b, 4)
  H.writeInt32BE(this._c, 8)
  H.writeInt32BE(this._d, 12)
  H.writeInt32BE(this._e, 16)
  H.writeInt32BE(this._f, 20)
  H.writeInt32BE(this._g, 24)
  H.writeInt32BE(this._h, 28)

  return H
}

module.exports = Sha256

},{"./hash":41,"inherits":32,"safe-buffer":40}],47:[function(require,module,exports){
var inherits = require('inherits')
var SHA512 = require('./sha512')
var Hash = require('./hash')
var Buffer = require('safe-buffer').Buffer

var W = new Array(160)

function Sha384 () {
  this.init()
  this._w = W

  Hash.call(this, 128, 112)
}

inherits(Sha384, SHA512)

Sha384.prototype.init = function () {
  this._ah = 0xcbbb9d5d
  this._bh = 0x629a292a
  this._ch = 0x9159015a
  this._dh = 0x152fecd8
  this._eh = 0x67332667
  this._fh = 0x8eb44a87
  this._gh = 0xdb0c2e0d
  this._hh = 0x47b5481d

  this._al = 0xc1059ed8
  this._bl = 0x367cd507
  this._cl = 0x3070dd17
  this._dl = 0xf70e5939
  this._el = 0xffc00b31
  this._fl = 0x68581511
  this._gl = 0x64f98fa7
  this._hl = 0xbefa4fa4

  return this
}

Sha384.prototype._hash = function () {
  var H = Buffer.allocUnsafe(48)

  function writeInt64BE (h, l, offset) {
    H.writeInt32BE(h, offset)
    H.writeInt32BE(l, offset + 4)
  }

  writeInt64BE(this._ah, this._al, 0)
  writeInt64BE(this._bh, this._bl, 8)
  writeInt64BE(this._ch, this._cl, 16)
  writeInt64BE(this._dh, this._dl, 24)
  writeInt64BE(this._eh, this._el, 32)
  writeInt64BE(this._fh, this._fl, 40)

  return H
}

module.exports = Sha384

},{"./hash":41,"./sha512":48,"inherits":32,"safe-buffer":40}],48:[function(require,module,exports){
var inherits = require('inherits')
var Hash = require('./hash')
var Buffer = require('safe-buffer').Buffer

var K = [
  0x428a2f98, 0xd728ae22, 0x71374491, 0x23ef65cd,
  0xb5c0fbcf, 0xec4d3b2f, 0xe9b5dba5, 0x8189dbbc,
  0x3956c25b, 0xf348b538, 0x59f111f1, 0xb605d019,
  0x923f82a4, 0xaf194f9b, 0xab1c5ed5, 0xda6d8118,
  0xd807aa98, 0xa3030242, 0x12835b01, 0x45706fbe,
  0x243185be, 0x4ee4b28c, 0x550c7dc3, 0xd5ffb4e2,
  0x72be5d74, 0xf27b896f, 0x80deb1fe, 0x3b1696b1,
  0x9bdc06a7, 0x25c71235, 0xc19bf174, 0xcf692694,
  0xe49b69c1, 0x9ef14ad2, 0xefbe4786, 0x384f25e3,
  0x0fc19dc6, 0x8b8cd5b5, 0x240ca1cc, 0x77ac9c65,
  0x2de92c6f, 0x592b0275, 0x4a7484aa, 0x6ea6e483,
  0x5cb0a9dc, 0xbd41fbd4, 0x76f988da, 0x831153b5,
  0x983e5152, 0xee66dfab, 0xa831c66d, 0x2db43210,
  0xb00327c8, 0x98fb213f, 0xbf597fc7, 0xbeef0ee4,
  0xc6e00bf3, 0x3da88fc2, 0xd5a79147, 0x930aa725,
  0x06ca6351, 0xe003826f, 0x14292967, 0x0a0e6e70,
  0x27b70a85, 0x46d22ffc, 0x2e1b2138, 0x5c26c926,
  0x4d2c6dfc, 0x5ac42aed, 0x53380d13, 0x9d95b3df,
  0x650a7354, 0x8baf63de, 0x766a0abb, 0x3c77b2a8,
  0x81c2c92e, 0x47edaee6, 0x92722c85, 0x1482353b,
  0xa2bfe8a1, 0x4cf10364, 0xa81a664b, 0xbc423001,
  0xc24b8b70, 0xd0f89791, 0xc76c51a3, 0x0654be30,
  0xd192e819, 0xd6ef5218, 0xd6990624, 0x5565a910,
  0xf40e3585, 0x5771202a, 0x106aa070, 0x32bbd1b8,
  0x19a4c116, 0xb8d2d0c8, 0x1e376c08, 0x5141ab53,
  0x2748774c, 0xdf8eeb99, 0x34b0bcb5, 0xe19b48a8,
  0x391c0cb3, 0xc5c95a63, 0x4ed8aa4a, 0xe3418acb,
  0x5b9cca4f, 0x7763e373, 0x682e6ff3, 0xd6b2b8a3,
  0x748f82ee, 0x5defb2fc, 0x78a5636f, 0x43172f60,
  0x84c87814, 0xa1f0ab72, 0x8cc70208, 0x1a6439ec,
  0x90befffa, 0x23631e28, 0xa4506ceb, 0xde82bde9,
  0xbef9a3f7, 0xb2c67915, 0xc67178f2, 0xe372532b,
  0xca273ece, 0xea26619c, 0xd186b8c7, 0x21c0c207,
  0xeada7dd6, 0xcde0eb1e, 0xf57d4f7f, 0xee6ed178,
  0x06f067aa, 0x72176fba, 0x0a637dc5, 0xa2c898a6,
  0x113f9804, 0xbef90dae, 0x1b710b35, 0x131c471b,
  0x28db77f5, 0x23047d84, 0x32caab7b, 0x40c72493,
  0x3c9ebe0a, 0x15c9bebc, 0x431d67c4, 0x9c100d4c,
  0x4cc5d4be, 0xcb3e42b6, 0x597f299c, 0xfc657e2a,
  0x5fcb6fab, 0x3ad6faec, 0x6c44198c, 0x4a475817
]

var W = new Array(160)

function Sha512 () {
  this.init()
  this._w = W

  Hash.call(this, 128, 112)
}

inherits(Sha512, Hash)

Sha512.prototype.init = function () {
  this._ah = 0x6a09e667
  this._bh = 0xbb67ae85
  this._ch = 0x3c6ef372
  this._dh = 0xa54ff53a
  this._eh = 0x510e527f
  this._fh = 0x9b05688c
  this._gh = 0x1f83d9ab
  this._hh = 0x5be0cd19

  this._al = 0xf3bcc908
  this._bl = 0x84caa73b
  this._cl = 0xfe94f82b
  this._dl = 0x5f1d36f1
  this._el = 0xade682d1
  this._fl = 0x2b3e6c1f
  this._gl = 0xfb41bd6b
  this._hl = 0x137e2179

  return this
}

function Ch (x, y, z) {
  return z ^ (x & (y ^ z))
}

function maj (x, y, z) {
  return (x & y) | (z & (x | y))
}

function sigma0 (x, xl) {
  return (x >>> 28 | xl << 4) ^ (xl >>> 2 | x << 30) ^ (xl >>> 7 | x << 25)
}

function sigma1 (x, xl) {
  return (x >>> 14 | xl << 18) ^ (x >>> 18 | xl << 14) ^ (xl >>> 9 | x << 23)
}

function Gamma0 (x, xl) {
  return (x >>> 1 | xl << 31) ^ (x >>> 8 | xl << 24) ^ (x >>> 7)
}

function Gamma0l (x, xl) {
  return (x >>> 1 | xl << 31) ^ (x >>> 8 | xl << 24) ^ (x >>> 7 | xl << 25)
}

function Gamma1 (x, xl) {
  return (x >>> 19 | xl << 13) ^ (xl >>> 29 | x << 3) ^ (x >>> 6)
}

function Gamma1l (x, xl) {
  return (x >>> 19 | xl << 13) ^ (xl >>> 29 | x << 3) ^ (x >>> 6 | xl << 26)
}

function getCarry (a, b) {
  return (a >>> 0) < (b >>> 0) ? 1 : 0
}

Sha512.prototype._update = function (M) {
  var W = this._w

  var ah = this._ah | 0
  var bh = this._bh | 0
  var ch = this._ch | 0
  var dh = this._dh | 0
  var eh = this._eh | 0
  var fh = this._fh | 0
  var gh = this._gh | 0
  var hh = this._hh | 0

  var al = this._al | 0
  var bl = this._bl | 0
  var cl = this._cl | 0
  var dl = this._dl | 0
  var el = this._el | 0
  var fl = this._fl | 0
  var gl = this._gl | 0
  var hl = this._hl | 0

  for (var i = 0; i < 32; i += 2) {
    W[i] = M.readInt32BE(i * 4)
    W[i + 1] = M.readInt32BE(i * 4 + 4)
  }
  for (; i < 160; i += 2) {
    var xh = W[i - 15 * 2]
    var xl = W[i - 15 * 2 + 1]
    var gamma0 = Gamma0(xh, xl)
    var gamma0l = Gamma0l(xl, xh)

    xh = W[i - 2 * 2]
    xl = W[i - 2 * 2 + 1]
    var gamma1 = Gamma1(xh, xl)
    var gamma1l = Gamma1l(xl, xh)

    // W[i] = gamma0 + W[i - 7] + gamma1 + W[i - 16]
    var Wi7h = W[i - 7 * 2]
    var Wi7l = W[i - 7 * 2 + 1]

    var Wi16h = W[i - 16 * 2]
    var Wi16l = W[i - 16 * 2 + 1]

    var Wil = (gamma0l + Wi7l) | 0
    var Wih = (gamma0 + Wi7h + getCarry(Wil, gamma0l)) | 0
    Wil = (Wil + gamma1l) | 0
    Wih = (Wih + gamma1 + getCarry(Wil, gamma1l)) | 0
    Wil = (Wil + Wi16l) | 0
    Wih = (Wih + Wi16h + getCarry(Wil, Wi16l)) | 0

    W[i] = Wih
    W[i + 1] = Wil
  }

  for (var j = 0; j < 160; j += 2) {
    Wih = W[j]
    Wil = W[j + 1]

    var majh = maj(ah, bh, ch)
    var majl = maj(al, bl, cl)

    var sigma0h = sigma0(ah, al)
    var sigma0l = sigma0(al, ah)
    var sigma1h = sigma1(eh, el)
    var sigma1l = sigma1(el, eh)

    // t1 = h + sigma1 + ch + K[j] + W[j]
    var Kih = K[j]
    var Kil = K[j + 1]

    var chh = Ch(eh, fh, gh)
    var chl = Ch(el, fl, gl)

    var t1l = (hl + sigma1l) | 0
    var t1h = (hh + sigma1h + getCarry(t1l, hl)) | 0
    t1l = (t1l + chl) | 0
    t1h = (t1h + chh + getCarry(t1l, chl)) | 0
    t1l = (t1l + Kil) | 0
    t1h = (t1h + Kih + getCarry(t1l, Kil)) | 0
    t1l = (t1l + Wil) | 0
    t1h = (t1h + Wih + getCarry(t1l, Wil)) | 0

    // t2 = sigma0 + maj
    var t2l = (sigma0l + majl) | 0
    var t2h = (sigma0h + majh + getCarry(t2l, sigma0l)) | 0

    hh = gh
    hl = gl
    gh = fh
    gl = fl
    fh = eh
    fl = el
    el = (dl + t1l) | 0
    eh = (dh + t1h + getCarry(el, dl)) | 0
    dh = ch
    dl = cl
    ch = bh
    cl = bl
    bh = ah
    bl = al
    al = (t1l + t2l) | 0
    ah = (t1h + t2h + getCarry(al, t1l)) | 0
  }

  this._al = (this._al + al) | 0
  this._bl = (this._bl + bl) | 0
  this._cl = (this._cl + cl) | 0
  this._dl = (this._dl + dl) | 0
  this._el = (this._el + el) | 0
  this._fl = (this._fl + fl) | 0
  this._gl = (this._gl + gl) | 0
  this._hl = (this._hl + hl) | 0

  this._ah = (this._ah + ah + getCarry(this._al, al)) | 0
  this._bh = (this._bh + bh + getCarry(this._bl, bl)) | 0
  this._ch = (this._ch + ch + getCarry(this._cl, cl)) | 0
  this._dh = (this._dh + dh + getCarry(this._dl, dl)) | 0
  this._eh = (this._eh + eh + getCarry(this._el, el)) | 0
  this._fh = (this._fh + fh + getCarry(this._fl, fl)) | 0
  this._gh = (this._gh + gh + getCarry(this._gl, gl)) | 0
  this._hh = (this._hh + hh + getCarry(this._hl, hl)) | 0
}

Sha512.prototype._hash = function () {
  var H = Buffer.allocUnsafe(64)

  function writeInt64BE (h, l, offset) {
    H.writeInt32BE(h, offset)
    H.writeInt32BE(l, offset + 4)
  }

  writeInt64BE(this._ah, this._al, 0)
  writeInt64BE(this._bh, this._bl, 8)
  writeInt64BE(this._ch, this._cl, 16)
  writeInt64BE(this._dh, this._dl, 24)
  writeInt64BE(this._eh, this._el, 32)
  writeInt64BE(this._fh, this._fl, 40)
  writeInt64BE(this._gh, this._gl, 48)
  writeInt64BE(this._hh, this._hl, 56)

  return H
}

module.exports = Sha512

},{"./hash":41,"inherits":32,"safe-buffer":40}],49:[function(require,module,exports){
module.exports={
  "0": ["\u0000","\u0001","\u0002","\u0003","\u0004","\u0005","\u0006","\u0007","\b","\t","\n","\u000b","\f","\r","\u000e","\u000f","\u0010","\u0011","\u0012","\u0013","\u0014","\u0015","\u0016","\u0017","\u0018","\u0019","\u001a","\u001b","\u001c","\u001d","\u001e","\u001f"," ","!","\"","#","$","%","&","'","(",")","*","+",",","-",".","/","0","1","2","3","4","5","6","7","8","9",":",";","<","=",">","?","@","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","[","\\","]","^","_","`","a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","{","|","}","~","\u007f","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","",""," ","!","C/","PS","$?","Y=","|","SS","\"","(c)","a","<<","!","","(r)","-","deg","+-","2","3","'","u","P","*",",","1","o",">>","1/4","1/2","3/4","?","A","A","A","A","A","A","AE","C","E","E","E","E","I","I","I","I","D","N","O","O","O","O","O","x","O","U","U","U","U","U","Th","ss","a","a","a","a","a","a","ae","c","e","e","e","e","i","i","i","i","d","n","o","o","o","o","o","/","o","u","u","u","u","y","th","y"],
  "1": ["A","a","A","a","A","a","C","c","C","c","C","c","C","c","D","d","D","d","E","e","E","e","E","e","E","e","E","e","G","g","G","g","G","g","G","g","H","h","H","h","I","i","I","i","I","i","I","i","I","i","IJ","ij","J","j","K","k","k","L","l","L","l","L","l","L","l","L","l","N","n","N","n","N","n","'n","NG","ng","O","o","O","o","O","o","OE","oe","R","r","R","r","R","r","S","s","S","s","S","s","S","s","T","t","T","t","T","t","U","u","U","u","U","u","U","u","U","u","U","u","W","w","Y","y","Y","Z","z","Z","z","Z","z","s","b","B","B","b","6","6","O","C","c","D","D","D","d","d","3","@","E","F","f","G","G","hv","I","I","K","k","l","l","W","N","n","O","O","o","OI","oi","P","p","YR","2","2","SH","sh","t","T","t","T","U","u","Y","V","Y","y","Z","z","ZH","ZH","zh","zh","2","5","5","ts","w","|","||","|=","!","DZ","Dz","dz","LJ","Lj","lj","NJ","Nj","nj","A","a","I","i","O","o","U","u","U","u","U","u","U","u","U","u","@","A","a","A","a","AE","ae","G","g","G","g","K","k","O","o","O","o","ZH","zh","j","DZ","D","dz","G","g","HV","W","N","n","A","a","AE","ae","O","o"],
  "2": ["A","a","A","a","E","e","E","e","I","i","I","i","O","o","O","o","R","r","R","r","U","u","U","u","S","s","T","t","Y","y","H","h","N","d","OU","ou","Z","z","A","a","E","e","O","o","O","o","O","o","O","o","Y","y","l","n","t","j","db","qp","A","C","c","L","T","s","z","?","?","B","U","V","E","e","J","j","Q","q","R","r","Y","y","a","a","a","b","o","c","d","d","e","@","@","e","e","e","e","j","g","g","g","g","u","Y","h","h","i","i","I","l","l","l","lZ","W","W","m","n","n","n","o","OE","O","F","R","R","R","R","r","r","R","R","R","s","S","j","S","S","t","t","U","U","v","^","W","Y","Y","z","z","Z","Z","?","?","?","C","@","B","E","G","H","j","k","L","q","?","?","dz","dZ","dz","ts","tS","tC","fN","ls","lz","WW","]]","h","h","k","h","j","r","r","r","r","w","y","'","\"","`","'","`","`","'","?","?","<",">","^","V","^","V","'","-","/","\\",",","_","\\","/",":",".","`","'","^","V","+","-","V",".","@",",","~","\"","R","X","G","l","s","x","?","","","","","","","","V","=","\"",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
  "3": ["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"","","",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"'",",",null,null,null,null,"",null,null,null,"?",null,null,null,null,null,"","","A",";","E","I","I",null,"O",null,"U","O","I","A","V","G","D","E","Z","I","Th","I","K","L","M","N","X","O","P","R",null,"S","T","Y","F","H","Ps","O","I","Y","a","e","i","i","y","a","v","g","d","e","z","i","th","i","k","l","m","n","x","o","p","r","s","s","t","y","f","h","ps","o","i","y","o","y","o",null,"b","th","U","U","U","ph","p","&",null,null,"St","st","W","w","Q","q","Sp","sp","Sh","sh","F","f","Kh","kh","H","h","G","g","CH","ch","Ti","ti","k","r","c","j",null,null,null,null,null,null,null,null,null,null,null,null],
  "4": ["Jo","Yo","Dj","Gj","Ie","Dz","I","Yi","J","Lj","Nj","Tsh","Kj","I","U","Dzh","A","B","V","G","D","E","Zh","Z","I","Y","K","L","M","N","O","P","R","S","T","U","F","H","C","Ch","Sh","Shch","","Y","","E","Yu","Ya","a","b","v","g","d","e","zh","z","i","y","k","l","m","n","o","p","r","s","t","u","f","h","c","ch","sh","shch","","y","","e","yu","ya","je","yo","dj","gj","ie","dz","i","yi","j","lj","nj","tsh","kj","i","u","dzh","O","o","E","e","Ie","ie","E","e","Ie","ie","O","o","Io","io","Ks","ks","Ps","ps","F","f","Y","y","Y","y","u","u","O","o","O","o","Ot","ot","Q","q","*1000*","","","","",null,"*100.000*","*1.000.000*",null,null,"\"","\"","R'","r'","G'","g'","G'","g'","G'","g'","Zh'","zh'","Z'","z'","K'","k'","K'","k'","K'","k'","K'","k'","N'","n'","Ng","ng","P'","p'","Kh","kh","S'","s'","T'","t'","U","u","U'","u'","Kh'","kh'","Tts","tts","Ch'","ch'","Ch'","ch'","H","h","Ch","ch","Ch'","ch'","`","Zh","zh","K'","k'",null,null,"N'","n'",null,null,"Ch","ch",null,null,null,"a","a","A","a","Ae","ae","Ie","ie","@","@","@","@","Zh","zh","Z","z","Dz","dz","I","i","I","i","O","o","O","o","O","o","E","e","U","u","U","u","U","u","Ch","ch",null,null,"Y","y",null,null,null,null,null,null],
  "5": [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"A","B","G","D","E","Z","E","E","T`","Zh","I","L","Kh","Ts","K","H","Dz","Gh","Ch","M","Y","N","Sh","O","Ch`","P","J","Rh","S","V","T","R","Ts`","W","P`","K`","O","F",null,null,"<","'","/","!",",","?",".",null,"a","b","g","d","e","z","e","e","t`","zh","i","l","kh","ts","k","h","dz","gh","ch","m","y","n","sh","o","ch`","p","j","rh","s","v","t","r","ts`","w","p`","k`","o","f","ew",null,".","-",null,null,null,null,null,null,"","","","","","","","","","","","","","","","","",null,"","","","","","","","","","","","","","@","e","a","o","i","e","e","a","a","o",null,"u","'","","","","","","",":","",null,null,null,null,null,null,null,null,null,null,null,"","b","g","d","h","v","z","kh","t","y","k","k","l","m","m","n","n","s","`","p","p","ts","ts","q","r","sh","t",null,null,null,null,null,"V","oy","i","'","\"",null,null,null,null,null,null,null,null,null,null,null],
  "6": [null,null,null,null,null,null,null,null,null,null,null,null,",",null,null,null,null,null,null,null,null,null,null,null,null,null,null,";",null,null,null,"?",null,"","a","'","w'","","y'","","b","@","t","th","j","H","kh","d","dh","r","z","s","sh","S","D","T","Z","aa","G",null,null,null,null,null,"","f","q","k","l","m","n","h","w","~","y","an","un","in","a","u","i","W","","","'","'",null,null,null,null,null,null,null,null,null,null,"0","1","2","3","4","5","6","7","8","9","%",".",",","*",null,null,"","'","'","'","","'","'w","'u","'y","tt","tth","b","t","T","p","th","bh","'h","H","ny","dy","H","ch","cch","dd","D","D","Dt","dh","ddh","d","D","D","rr","R","R","R","R","R","R","j","R","S","S","S","S","S","T","GH","F","F","F","v","f","ph","Q","Q","kh","k","K","K","ng","K","g","G","N","G","G","G","L","L","L","L","N","N","N","N","N","h","Ch","hy","h","H","@","W","oe","oe","u","yu","yu","W","v","y","Y","Y","W","","","y","y'",".","ae","","","","","","","","@","#","","","","","","","","","","","^","","","","",null,null,"0","1","2","3","4","5","6","7","8","9","Sh","D","Gh","&","+m",null],
  "7": ["//","/",",","!","!","-",",",",",";","?","~","{","}","*",null,"","'","","b","g","g","d","d","h","w","z","H","t","t","y","yh","k","l","m","n","s","s","`","p","p","S","q","r","sh","t",null,null,null,"a","a","a","A","A","A","e","e","e","E","i","i","u","u","u","o","","`","'","","","X","Q","@","@","|","+",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"h","sh","n","r","b","L","k","'","v","m","f","dh","th","l","g","ny","s","d","z","t","y","p","j","ch","tt","hh","kh","th","z","sh","s","d","t","z","`","gh","q","w","a","aa","i","ee","u","oo","e","ey","o","oa","",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
  "9": [null,"N","N","H",null,"a","aa","i","ii","u","uu","R","L","eN","e","e","ai","oN","o","o","au","k","kh","g","gh","ng","c","ch","j","jh","ny","tt","tth","dd","ddh","nn","t","th","d","dh","n","nnn","p","ph","b","bh","m","y","r","rr","l","l","lll","v","sh","ss","s","h",null,null,"'","'","aa","i","ii","u","uu","R","RR","eN","e","e","ai","oN","o","o","au","",null,null,"AUM","'","'","`","'",null,null,null,"q","khh","ghh","z","dddh","rh","f","yy","RR","LL","L","LL"," / "," // ","0","1","2","3","4","5","6","7","8","9",".",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"N","N","H",null,"a","aa","i","ii","u","uu","R","RR",null,null,"e","ai",null,null,"o","au","k","kh","g","gh","ng","c","ch","j","jh","ny","tt","tth","dd","ddh","nn","t","th","d","dh","n",null,"p","ph","b","bh","m","y","r",null,"l",null,null,null,"sh","ss","s","h",null,null,"'",null,"aa","i","ii","u","uu","R","RR",null,null,"e","ai",null,null,"o","au","",null,null,null,null,null,null,null,null,null,"+",null,null,null,null,"rr","rh",null,"yy","RR","LL","L","LL",null,null,"0","1","2","3","4","5","6","7","8","9","r'","r`","Rs","Rs","1/","2/","3/","4/"," 1 - 1/","/16","",null,null,null,null,null],
  "10": [null,null,"N",null,null,"a","aa","i","ii","u","uu",null,null,null,null,"ee","ai",null,null,"oo","au","k","kh","g","gh","ng","c","ch","j","jh","ny","tt","tth","dd","ddh","nn","t","th","d","dh","n",null,"p","ph","b","bb","m","y","r",null,"l","ll",null,"v","sh",null,"s","h",null,null,"'",null,"aa","i","ii","u","uu",null,null,null,null,"ee","ai",null,null,"oo","au","",null,null,null,null,null,null,null,null,null,null,null,"khh","ghh","z","rr",null,"f",null,null,null,null,null,null,null,"0","1","2","3","4","5","6","7","8","9","N","H","","","G.E.O.",null,null,null,null,null,null,null,null,null,null,null,null,"N","N","H",null,"a","aa","i","ii","u","uu","R",null,"eN",null,"e","ai","oN",null,"o","au","k","kh","g","gh","ng","c","ch","j","jh","ny","tt","tth","dd","ddh","nn","t","th","d","dh","n",null,"p","ph","b","bh","m","ya","r",null,"l","ll",null,"v","sh","ss","s","h",null,null,"'","'","aa","i","ii","u","uu","R","RR","eN",null,"e","ai","oN",null,"o","au","",null,null,"AUM",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"RR",null,null,null,null,null,"0","1","2","3","4","5","6","7","8","9",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
  "11": [null,"N","N","H",null,"a","aa","i","ii","u","uu","R","L",null,null,"e","ai",null,null,"o","au","k","kh","g","gh","ng","c","ch","j","jh","ny","tt","tth","dd","ddh","nn","t","th","d","dh","n",null,"p","ph","b","bh","m","y","r",null,"l","ll",null,"","sh","ss","s","h",null,null,"'","'","aa","i","ii","u","uu","R",null,null,null,"e","ai",null,null,"o","au","",null,null,null,null,null,null,null,null,"+","+",null,null,null,null,"rr","rh",null,"yy","RR","LL",null,null,null,null,"0","1","2","3","4","5","6","7","8","9","",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"N","H",null,"a","aa","i","ii","u","uu",null,null,null,"e","ee","ai",null,"o","oo","au","k",null,null,null,"ng","c",null,"j",null,"ny","tt",null,null,null,"nn","t",null,null,null,"n","nnn","p",null,null,null,"m","y","r","rr","l","ll","lll","v",null,"ss","s","h",null,null,null,null,"aa","i","ii","u","uu",null,null,null,"e","ee","ai",null,"o","oo","au","",null,null,null,null,null,null,null,null,null,"+",null,null,null,null,null,null,null,null,null,null,null,null,null,null,"0","1","2","3","4","5","6","7","8","9","+10+","+100+","+1000+",null,null,null,null,null,null,null,null,null,null,null,null,null],
  "12": [null,"N","N","H",null,"a","aa","i","ii","u","uu","R","L",null,"e","ee","ai",null,"o","oo","au","k","kh","g","gh","ng","c","ch","j","jh","ny","tt","tth","dd","ddh","nn","t","th","d","dh","n",null,"p","ph","b","bh","m","y","r","rr","l","ll",null,"v","sh","ss","s","h",null,null,null,null,"aa","i","ii","u","uu","R","RR",null,"e","ee","ai",null,"o","oo","au","",null,null,null,null,null,null,null,"+","+",null,null,null,null,null,null,null,null,null,"RR","LL",null,null,null,null,"0","1","2","3","4","5","6","7","8","9",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"N","H",null,"a","aa","i","ii","u","uu","R","L",null,"e","ee","ai",null,"o","oo","au","k","kh","g","gh","ng","c","ch","j","jh","ny","tt","tth","dd","ddh","nn","t","th","d","dh","n",null,"p","ph","b","bh","m","y","r","rr","l","ll",null,"v","sh","ss","s","h",null,null,null,null,"aa","i","ii","u","uu","R","RR",null,"e","ee","ai",null,"o","oo","au","",null,null,null,null,null,null,null,"+","+",null,null,null,null,null,null,null,"lll",null,"RR","LL",null,null,null,null,"0","1","2","3","4","5","6","7","8","9",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
  "13": [null,null,"N","H",null,"a","aa","i","ii","u","uu","R","L",null,"e","ee","ai",null,"o","oo","au","k","kh","g","gh","ng","c","ch","j","jh","ny","tt","tth","dd","ddh","nn","t","th","d","dh","n",null,"p","ph","b","bh","m","y","r","rr","l","ll","lll","v","sh","ss","s","h",null,null,null,null,"aa","i","ii","u","uu","R",null,null,"e","ee","ai","","o","oo","au","",null,null,null,null,null,null,null,null,null,"+",null,null,null,null,null,null,null,null,"RR","LL",null,null,null,null,"0","1","2","3","4","5","6","7","8","9",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"N","H",null,"a","aa","ae","aae","i","ii","u","uu","R","RR","L","LL","e","ee","ai","o","oo","au",null,null,null,"k","kh","g","gh","ng","nng","c","ch","j","jh","ny","jny","nyj","tt","tth","dd","ddh","nn","nndd","t","th","d","dh","n",null,"nd","p","ph","b","bh","m","mb","y","r",null,"l",null,null,"v","sh","ss","s","h","ll","f",null,null,null,"",null,null,null,null,"aa","ae","aae","i","ii","u",null,"uu",null,"R","e","ee","ai","o","oo","au","L",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"RR","LL"," . ",null,null,null,null,null,null,null,null,null,null,null],
  "14": [null,"k","kh","kh","kh","kh","kh","ng","cch","ch","ch","ch","ch","y","d","t","th","th","th","n","d","t","th","th","th","n","b","p","ph","f","ph","f","ph","m","y","r","R","l","L","w","s","s","s","h","l","`","h","~","a","a","aa","am","i","ii","ue","uue","u","uu","'",null,null,null,null,"Bh.","e","ae","o","ai","ai","ao","+","","","","","","","M",""," * ","0","1","2","3","4","5","6","7","8","9"," // "," /// ",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"k","kh",null,"kh",null,null,"ng","ch",null,"s",null,null,"ny",null,null,null,null,null,null,"d","h","th","th",null,"n","b","p","ph","f","ph","f",null,"m","y","r",null,"l",null,"w",null,null,"s","h",null,"`","","~","a","","aa","am","i","ii","y","yy","u","uu",null,"o","l","ny",null,null,"e","ei","o","ay","ai",null,"+",null,"","","","","","M",null,null,"0","1","2","3","4","5","6","7","8","9",null,null,"hn","hm",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
  "15": ["AUM","","","","","","",""," // "," * ","","-"," / "," / "," // "," -/ "," +/ "," X/ "," /XX/ "," /X/ ",",","","","","","","","","","","","","0","1","2","3","4","5","6","7","8","9",".5","1.5","2.5","3.5","4.5","5.5","6.5","7.5","8.5","-.5","+","*","^","_","","~",null,"]","[[","]]","","","k","kh","g","gh","ng","c","ch","j",null,"ny","tt","tth","dd","ddh","nn","t","th","d","dh","n","p","ph","b","bh","m","ts","tsh","dz","dzh","w","zh","z","'","y","r","l","sh","ssh","s","h","a","kss","r",null,null,null,null,null,null,"aa","i","ii","u","uu","R","RR","L","LL","e","ee","o","oo","M","H","i","ii","","","","","","","","","","",null,null,null,null,"k","kh","g","gh","ng","c","ch","j",null,"ny","tt","tth","dd","ddh","nn","t","th","d","dh","n","p","ph","b","bh","m","ts","tsh","dz","dzh","w","zh","z","'","y","r","l","sh","ss","s","h","a","kss","w","y","r",null,"X"," :X: "," /O/ "," /o/ "," \\o\\ "," (O) ","","","","","","","","","",null,null,"",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
  "16": ["k","kh","g","gh","ng","c","ch","j","jh","ny","nny","tt","tth","dd","ddh","nn","tt","th","d","dh","n","p","ph","b","bh","m","y","r","l","w","s","h","ll","a",null,"i","ii","u","uu","e",null,"o","au",null,"aa","i","ii","u","uu","e","ai",null,null,null,"N","'",":","",null,null,null,null,null,null,"0","1","2","3","4","5","6","7","8","9"," / "," // ","n*","r*","l*","e*","sh","ss","R","RR","L","LL","R","RR","L","LL",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"A","B","G","D","E","V","Z","T`","I","K","L","M","N","O","P","Zh","R","S","T","U","P`","K`","G'","Q","Sh","Ch`","C`","Z'","C","Ch","X","J","H","E","Y","W","Xh","OE",null,null,null,null,null,null,null,null,null,null,"a","b","g","d","e","v","z","t`","i","k","l","m","n","o","p","zh","r","s","t","u","p`","k`","g'","q","sh","ch`","c`","z'","c","ch","x","j","h","e","y","w","xh","oe","f",null,null,null,null," // ",null,null,null,null],
  "17": ["g","gg","n","d","dd","r","m","b","bb","s","ss","","j","jj","c","k","t","p","h","ng","nn","nd","nb","dg","rn","rr","rh","rN","mb","mN","bg","bn","","bs","bsg","bst","bsb","bss","bsj","bj","bc","bt","bp","bN","bbN","sg","sn","sd","sr","sm","sb","sbg","sss","s","sj","sc","sk","st","sp","sh","","","","","Z","g","d","m","b","s","Z","","j","c","t","p","N","j","","","","","ck","ch","","","pb","pN","hh","Q",null,null,null,null,null,"","","a","ae","ya","yae","eo","e","yeo","ye","o","wa","wae","oe","yo","u","weo","we","wi","yu","eu","yi","i","a-o","a-u","ya-o","ya-yo","eo-o","eo-u","eo-eu","yeo-o","yeo-u","o-eo","o-e","o-ye","o-o","o-u","yo-ya","yo-yae","yo-yeo","yo-o","yo-i","u-a","u-ae","u-eo-eu","u-ye","u-u","yu-a","yu-eo","yu-e","yu-yeo","yu-ye","yu-u","yu-i","eu-u","eu-eu","yi-u","i-a","i-ya","i-o","i-u","i-eu","i-U","U","U-eo","U-u","U-i","UU",null,null,null,null,null,"g","gg","gs","n","nj","nh","d","l","lg","lm","lb","ls","lt","lp","lh","m","b","bs","s","ss","ng","j","c","k","t","p","h","gl","gsg","ng","nd","ns","nZ","nt","dg","tl","lgs","ln","ld","lth","ll","lmg","lms","lbs","lbh","rNp","lss","lZ","lk","lQ","mg","ml","mb","ms","mss","mZ","mc","mh","mN","bl","bp","ph","pN","sg","sd","sl","sb","Z","g","ss","","kh","N","Ns","NZ","pb","pN","hn","hl","hm","hb","Q",null,null,null,null,null,null],
  "18": ["ha","hu","hi","haa","hee","he","ho",null,"la","lu","li","laa","lee","le","lo","lwa","hha","hhu","hhi","hhaa","hhee","hhe","hho","hhwa","ma","mu","mi","maa","mee","me","mo","mwa","sza","szu","szi","szaa","szee","sze","szo","szwa","ra","ru","ri","raa","ree","re","ro","rwa","sa","su","si","saa","see","se","so","swa","sha","shu","shi","shaa","shee","she","sho","shwa","qa","qu","qi","qaa","qee","qe","qo",null,"qwa",null,"qwi","qwaa","qwee","qwe",null,null,"qha","qhu","qhi","qhaa","qhee","qhe","qho",null,"qhwa",null,"qhwi","qhwaa","qhwee","qhwe",null,null,"ba","bu","bi","baa","bee","be","bo","bwa","va","vu","vi","vaa","vee","ve","vo","vwa","ta","tu","ti","taa","tee","te","to","twa","ca","cu","ci","caa","cee","ce","co","cwa","xa","xu","xi","xaa","xee","xe","xo",null,"xwa",null,"xwi","xwaa","xwee","xwe",null,null,"na","nu","ni","naa","nee","ne","no","nwa","nya","nyu","nyi","nyaa","nyee","nye","nyo","nywa","'a","'u",null,"'aa","'ee","'e","'o","'wa","ka","ku","ki","kaa","kee","ke","ko",null,"kwa",null,"kwi","kwaa","kwee","kwe",null,null,"kxa","kxu","kxi","kxaa","kxee","kxe","kxo",null,"kxwa",null,"kxwi","kxwaa","kxwee","kxwe",null,null,"wa","wu","wi","waa","wee","we","wo",null,"`a","`u","`i","`aa","`ee","`e","`o",null,"za","zu","zi","zaa","zee","ze","zo","zwa","zha","zhu","zhi","zhaa","zhee","zhe","zho","zhwa","ya","yu","yi","yaa","yee","ye","yo",null,"da","du","di","daa","dee","de","do","dwa","dda","ddu","ddi","ddaa","ddee","dde","ddo","ddwa"],
  "19": ["ja","ju","ji","jaa","jee","je","jo","jwa","ga","gu","gi","gaa","gee","ge","go",null,"gwa",null,"gwi","gwaa","gwee","gwe",null,null,"gga","ggu","ggi","ggaa","ggee","gge","ggo",null,"tha","thu","thi","thaa","thee","the","tho","thwa","cha","chu","chi","chaa","chee","che","cho","chwa","pha","phu","phi","phaa","phee","phe","pho","phwa","tsa","tsu","tsi","tsaa","tsee","tse","tso","tswa","tza","tzu","tzi","tzaa","tzee","tze","tzo",null,"fa","fu","fi","faa","fee","fe","fo","fwa","pa","pu","pi","paa","pee","pe","po","pwa","rya","mya","fya",null,null,null,null,null,null," ",".",",",";",":",":: ","?","//","1","2","3","4","5","6","7","8","9","10+","20+","30+","40+","50+","60+","70+","80+","90+","100+","10,000+",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"a","e","i","o","u","v","ga","ka","ge","gi","go","gu","gv","ha","he","hi","ho","hu","hv","la","le","li","lo","lu","lv","ma","me","mi","mo","mu","na","hna","nah","ne","ni","no","nu","nv","qua","que","qui","quo","quu","quv","sa","s","se","si","so","su","sv","da","ta","de","te","di","ti","do","du","dv","dla","tla","tle","tli","tlo","tlu","tlv","tsa","tse","tsi","tso","tsu","tsv","wa","we","wi","wo","wu","wv","ya","ye","yi","yo","yu","yv",null,null,null,null,null,null,null,null,null,null,null],
  "20": [null,"ai","aai","i","ii","u","uu","oo","ee","i","a","aa","we","we","wi","wi","wii","wii","wo","wo","woo","woo","woo","wa","wa","waa","waa","waa","ai","w","'","t","k","sh","s","n","w","n",null,"w","c","?","l","en","in","on","an","pai","paai","pi","pii","pu","puu","poo","hee","hi","pa","paa","pwe","pwe","pwi","pwi","pwii","pwii","pwo","pwo","pwoo","pwoo","pwa","pwa","pwaa","pwaa","pwaa","p","p","h","tai","taai","ti","tii","tu","tuu","too","dee","di","ta","taa","twe","twe","twi","twi","twii","twii","two","two","twoo","twoo","twa","twa","twaa","twaa","twaa","t","tte","tti","tto","tta","kai","kaai","ki","kii","ku","kuu","koo","ka","kaa","kwe","kwe","kwi","kwi","kwii","kwii","kwo","kwo","kwoo","kwoo","kwa","kwa","kwaa","kwaa","kwaa","k","kw","keh","kih","koh","kah","gai","caai","gi","gii","gu","guu","coo","ga","gaa","cwe","cwe","cwi","cwi","cwii","cwii","cwo","cwo","cwoo","cwoo","cwa","cwa","cwaa","cwaa","cwaa","g","th","mai","maai","mi","mii","mu","muu","moo","ma","maa","mwe","mwe","mwi","mwi","mwii","mwii","mwo","mwo","mwoo","mwoo","mwa","mwa","mwaa","mwaa","mwaa","m","m","mh","m","m","nai","naai","ni","nii","nu","nuu","noo","na","naa","nwe","nwe","nwa","nwa","nwaa","nwaa","nwaa","n","ng","nh","lai","laai","li","lii","lu","luu","loo","la","laa","lwe","lwe","lwi","lwi","lwii","lwii","lwo","lwo","lwoo","lwoo","lwa","lwa","lwaa","lwaa","l","l","l","sai","saai","si","sii","su","suu","soo","sa","saa","swe","swe","swi","swi","swii","swii","swo","swo","swoo","swoo"],
  "21": ["swa","swa","swaa","swaa","swaa","s","s","sw","s","sk","skw","sW","spwa","stwa","skwa","scwa","she","shi","shii","sho","shoo","sha","shaa","shwe","shwe","shwi","shwi","shwii","shwii","shwo","shwo","shwoo","shwoo","shwa","shwa","shwaa","shwaa","sh","jai","yaai","ji","jii","ju","juu","yoo","ja","jaa","ywe","ywe","ywi","ywi","ywii","ywii","ywo","ywo","ywoo","ywoo","ywa","ywa","ywaa","ywaa","ywaa","j","y","y","yi","re","rai","le","raai","ri","rii","ru","ruu","lo","ra","raa","la","rwaa","rwaa","r","r","r","vai","faai","vi","vii","vu","vuu","va","vaa","fwaa","fwaa","v","the","the","thi","thi","thii","thii","tho","thoo","tha","thaa","thwaa","thwaa","th","tthe","tthi","ttho","ttha","tth","tye","tyi","tyo","tya","he","hi","hii","ho","hoo","ha","haa","h","h","hk","qaai","qi","qii","qu","quu","qa","qaa","q","tlhe","tlhi","tlho","tlha","re","ri","ro","ra","ngaai","ngi","ngii","ngu","nguu","nga","ngaa","ng","nng","she","shi","sho","sha","the","thi","tho","tha","th","lhi","lhii","lho","lhoo","lha","lhaa","lh","the","thi","thii","tho","thoo","tha","thaa","th","b","e","i","o","a","we","wi","wo","wa","ne","ni","no","na","ke","ki","ko","ka","he","hi","ho","ha","ghu","gho","ghe","ghee","ghi","gha","ru","ro","re","ree","ri","ra","wu","wo","we","wee","wi","wa","hwu","hwo","hwe","hwee","hwi","hwa","thu","tho","the","thee","thi","tha","ttu","tto","tte","ttee","tti","tta","pu","po","pe","pee","pi","pa","p","gu","go","ge","gee","gi","ga","khu","kho","khe","khee","khi","kha","kku","kko","kke","kkee","kki"],
  "22": ["kka","kk","nu","no","ne","nee","ni","na","mu","mo","me","mee","mi","ma","yu","yo","ye","yee","yi","ya","ju","ju","jo","je","jee","ji","ji","ja","jju","jjo","jje","jjee","jji","jja","lu","lo","le","lee","li","la","dlu","dlo","dle","dlee","dli","dla","lhu","lho","lhe","lhee","lhi","lha","tlhu","tlho","tlhe","tlhee","tlhi","tlha","tlu","tlo","tle","tlee","tli","tla","zu","zo","ze","zee","zi","za","z","z","dzu","dzo","dze","dzee","dzi","dza","su","so","se","see","si","sa","shu","sho","she","shee","shi","sha","sh","tsu","tso","tse","tsee","tsi","tsa","chu","cho","che","chee","chi","cha","ttsu","ttso","ttse","ttsee","ttsi","ttsa","X",".","qai","ngai","nngi","nngii","nngo","nngoo","nnga","nngaa",null,null,null,null,null,null,null,null,null," ","b","l","f","s","n","h","d","t","c","q","m","g","ng","z","r","a","o","u","e","i","ch","th","ph","p","x","p","<",">",null,null,null,"f","v","u","yr","y","w","th","th","a","o","ac","ae","o","o","o","oe","on","r","k","c","k","g","ng","g","g","w","h","h","h","h","n","n","n","i","e","j","g","ae","a","eo","p","z","s","s","s","c","z","t","t","d","b","b","p","p","e","m","m","m","l","l","ng","ng","d","o","ear","ior","qu","qu","qu","s","yr","yr","yr","q","x",".",":","+","17","18","19",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
  "23": [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"k","kh","g","gh","ng","c","ch","j","jh","ny","t","tth","d","ddh","nn","t","th","d","dh","n","p","ph","b","bh","m","y","r","l","v","sh","ss","s","h","l","q","a","aa","i","ii","u","uk","uu","uuv","ry","ryy","ly","lyy","e","ai","oo","oo","au","a","aa","aa","i","ii","y","yy","u","uu","ua","oe","ya","ie","e","ae","ai","oo","au","M","H","a`","","","","r","","!","","","","","","."," // ",":","+","++"," * "," /// ","KR","'",null,null,null,"0","1","2","3","4","5","6","7","8","9",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
  "24": [" @ "," ... ",",",". ",": "," // ","","-",",",". ","","","","","",null,"0","1","2","3","4","5","6","7","8","9",null,null,null,null,null,null,"a","e","i","o","u","O","U","ee","n","ng","b","p","q","g","m","l","s","sh","t","d","ch","j","y","r","w","f","k","kha","ts","z","h","zr","lh","zh","ch","-","e","i","o","u","O","U","ng","b","p","q","g","m","t","d","ch","j","ts","y","w","k","g","h","jy","ny","dz","e","i","iy","U","u","ng","k","g","h","p","sh","t","d","j","f","g","h","ts","z","r","ch","zh","i","k","r","f","zh",null,null,null,null,null,null,null,null,null,"H","X","W","M"," 3 "," 333 ","a","i","k","ng","c","tt","tth","dd","nn","t","d","p","ph","ss","zh","z","a","t","zh","gh","ng","c","jh","tta","ddh","t","dh","ss","cy","zh","z","u","y","bh","'",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
  "30": ["A","a","B","b","B","b","B","b","C","c","D","d","D","d","D","d","D","d","D","d","E","e","E","e","E","e","E","e","E","e","F","f","G","g","H","h","H","h","H","h","H","h","H","h","I","i","I","i","K","k","K","k","K","k","L","l","L","l","L","l","L","l","M","m","M","m","M","m","N","n","N","n","N","n","N","n","O","o","O","o","O","o","O","o","P","p","P","p","R","r","R","r","R","r","R","r","S","s","S","s","S","s","S","s","S","s","T","t","T","t","T","t","T","t","U","u","U","u","U","u","U","u","U","u","V","v","V","v","W","w","W","w","W","w","W","w","W","w","X","x","X","x","Y","y","Z","z","Z","z","Z","z","h","t","w","y","a","S",null,null,null,null,"A","a","A","a","A","a","A","a","A","a","A","a","A","a","A","a","A","a","A","a","A","a","A","a","E","e","E","e","E","e","E","e","E","e","E","e","E","e","E","e","I","i","I","i","O","o","O","o","O","o","O","o","O","o","O","o","O","o","O","o","O","o","O","o","O","o","O","o","U","u","U","u","U","u","U","u","U","u","U","u","U","u","Y","y","Y","y","Y","y","Y","y",null,null,null,null,null,null],
  "31": ["a","a","a","a","a","a","a","a","A","A","A","A","A","A","A","A","e","e","e","e","e","e",null,null,"E","E","E","E","E","E",null,null,"e","e","e","e","e","e","e","e","E","E","E","E","E","E","E","E","i","i","i","i","i","i","i","i","I","I","I","I","I","I","I","I","o","o","o","o","o","o",null,null,"O","O","O","O","O","O",null,null,"u","u","u","u","u","u","u","u",null,"U",null,"U",null,"U",null,"U","o","o","o","o","o","o","o","o","O","O","O","O","O","O","O","O","a","a","e","e","e","e","i","i","o","o","u","u","o","o",null,null,"a","a","a","a","a","a","a","a","A","A","A","A","A","A","A","A","e","e","e","e","e","e","e","e","E","E","E","E","E","E","E","E","o","o","o","o","o","o","o","o","O","O","O","O","O","O","O","O","a","a","a","a","a",null,"a","a","A","A","A","A","A","'","i","'","~","\"~","e","e","e",null,"e","e","E","E","E","E","E","'`","''","'~","i","i","i","i",null,null,"i","i","I","I","I","I",null,"`'","`'","`~","u","u","u","u","R","R","u","u","U","U","U","U","R","\"`","\"'","`",null,null,"o","o","o",null,"o","o","O","O","O","O","O","'","`",null],
  "32": [" "," "," "," "," "," "," "," "," "," "," "," ","","","","","-","-","-","-","--","--","||","_","'","'",",","'","\"","\"",",,","\"","+","++","*","*>",".","..","...",".","\n","\n\n","","","","",""," ","%0","%00","'","''","'''","`","``","```","^","<",">","*","!!","!?","-","_","-","^","***","--","/","-[","]-",null,"?!","!?","7","PP","(]","[)",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"","","","","","","0","","","","4","5","6","7","8","9","+","-","=","(",")","n","0","1","2","3","4","5","6","7","8","9","+","-","=","(",")",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"ECU","CL","Cr","FF","L","mil","N","Pts","Rs","W","NS","D","EU","K","T","Dr",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"","","","","","","","","","","","","","","","","","","","",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
  "33": ["","","C","","","","","","","","g","H","H","H","h","","I","I","L","l","lb","N","no","(p)","P","P","Q","R","R","R","","","(sm)","(tel)","(tm)","","Z","",null,"mho","Z","",null,null,"B","C","e","e","","F",null,"M","o","","","","","i","Q","(fax)","pi","","","Pi","","G","L","L","Y","D","d","e","i","j","","","per","",null,null,null,null,null," 1/3 "," 2/3 "," 1/5 "," 2/5 "," 3/5 "," 4/5 "," 1/6 "," 5/6 "," 1/8 "," 3/8 "," 5/8 "," 7/8 "," 1/","I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII","L","C","D","M","i","ii","iii","iv","v","vi","vii","viii","ix","x","xi","xii","l","c","d","m","(D","D)","((|))",")",null,null,null,null,null,null,null,null,null,null,null,null,"-","|","-","|","-","|","\\","/","\\","/","-","-","~","~","-","|","-","|","-","-","-","|","-","|","|","-","-","-","-","-","-","|","|","|","|","|","|","|","^","V","\\","=","V","^","-","-","|","|","-","-","|","|","=","|","=","=","|","=","|","=","=","=","=","=","=","|","=","|","=","|","\\","/","\\","/","=","=","~","~","|","|","-","|","-","|","-","-","-","|","-","|","|","|","|","|","|","|","-","\\","\\","|",null,null,null,null,null,null,null,null,null,null,null,null],
  "36": ["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"","","","","","","","","","","",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
  "37": ["-","-","|","|","-","-","|","|","-","-","|","|","+","+","+","+","+","+","+","+","+","+","+","+","+","+","+","+","+","+","+","+","+","+","+","+","+","+","+","+","+","+","+","+","+","+","+","+","+","+","+","+","+","+","+","+","+","+","+","+","+","+","+","+","+","+","+","+","+","+","+","+","+","+","+","+","-","-","|","|","-","|","+","+","+","+","+","+","+","+","+","+","+","+","+","+","+","+","+","+","+","+","+","+","+","+","+","+","+","+","+","+","+","/","\\","X","-","|","-","|","-","|","-","|","-","|","-","|","#","#","#","#","#","#","#","#","#","#","#","#","#","#","#","#","#","#","#","#","-","|",null,null,null,null,null,null,null,null,null,null,"#","#","#","#","#","#","#","#","#","#","#","#","#","#","#","#","#","#","^","^","^","^",">",">",">",">",">",">","V","V","V","V","<","<","<","<","<","<","*","*","*","*","*","*","*","*","*","*","*","*","*","*","*","*","*","*","*","*","*","*","*","*","*","*","*","*","*","*","*","*","*","#","#","#","#","#","^","^","^","O","#","#","#","#","#","#","#","#",null,null,null,null,null,null,null,null],
  "38": ["","","","","","","","","","","","","","","","","","","","",null,null,null,null,null,"","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
  "39": [null,"","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","",null,null,"","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","",null,"","","","","","","","","","","","","","",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
  "40": [" ","a","1","b","'","k","2","l","@","c","i","f","/","m","s","p","\"","e","3","h","9","o","6","r","^","d","j","g",">","n","t","q",",","*","5","<","-","u","8","v",".","%","[","$","+","x","!","&",";",":","4","\\","0","z","7","(","_","?","w","]","#","y",")","=","[d7]","[d17]","[d27]","[d127]","[d37]","[d137]","[d237]","[d1237]","[d47]","[d147]","[d247]","[d1247]","[d347]","[d1347]","[d2347]","[d12347]","[d57]","[d157]","[d257]","[d1257]","[d357]","[d1357]","[d2357]","[d12357]","[d457]","[d1457]","[d2457]","[d12457]","[d3457]","[d13457]","[d23457]","[d123457]","[d67]","[d167]","[d267]","[d1267]","[d367]","[d1367]","[d2367]","[d12367]","[d467]","[d1467]","[d2467]","[d12467]","[d3467]","[d13467]","[d23467]","[d123467]","[d567]","[d1567]","[d2567]","[d12567]","[d3567]","[d13567]","[d23567]","[d123567]","[d4567]","[d14567]","[d24567]","[d124567]","[d34567]","[d134567]","[d234567]","[d1234567]","[d8]","[d18]","[d28]","[d128]","[d38]","[d138]","[d238]","[d1238]","[d48]","[d148]","[d248]","[d1248]","[d348]","[d1348]","[d2348]","[d12348]","[d58]","[d158]","[d258]","[d1258]","[d358]","[d1358]","[d2358]","[d12358]","[d458]","[d1458]","[d2458]","[d12458]","[d3458]","[d13458]","[d23458]","[d123458]","[d68]","[d168]","[d268]","[d1268]","[d368]","[d1368]","[d2368]","[d12368]","[d468]","[d1468]","[d2468]","[d12468]","[d3468]","[d13468]","[d23468]","[d123468]","[d568]","[d1568]","[d2568]","[d12568]","[d3568]","[d13568]","[d23568]","[d123568]","[d4568]","[d14568]","[d24568]","[d124568]","[d34568]","[d134568]","[d234568]","[d1234568]","[d78]","[d178]","[d278]","[d1278]","[d378]","[d1378]","[d2378]","[d12378]","[d478]","[d1478]","[d2478]","[d12478]","[d3478]","[d13478]","[d23478]","[d123478]","[d578]","[d1578]","[d2578]","[d12578]","[d3578]","[d13578]","[d23578]","[d123578]","[d4578]","[d14578]","[d24578]","[d124578]","[d34578]","[d134578]","[d234578]","[d1234578]","[d678]","[d1678]","[d2678]","[d12678]","[d3678]","[d13678]","[d23678]","[d123678]","[d4678]","[d14678]","[d24678]","[d124678]","[d34678]","[d134678]","[d234678]","[d1234678]","[d5678]","[d15678]","[d25678]","[d125678]","[d35678]","[d135678]","[d235678]","[d1235678]","[d45678]","[d145678]","[d245678]","[d1245678]","[d345678]","[d1345678]","[d2345678]","[d12345678]"],
  "48": [" ",",",". ","\"","[JIS]","\"","/","0","<","> ","<<",">> ","[","] ","{","} ","[(",")] ","@","X ","[","] ","[[","]] ","((",")) ","[[","]] ","~ ","``","''",",,","@","1","2","3","4","5","6","7","8","9","","","","","","","~","+","+","+","+","","@"," // ","+10+","+20+","+30+",null,null,null,"","",null,"a","a","i","i","u","u","e","e","o","o","ka","ga","ki","gi","ku","gu","ke","ge","ko","go","sa","za","si","zi","su","zu","se","ze","so","zo","ta","da","ti","di","tu","tu","du","te","de","to","do","na","ni","nu","ne","no","ha","ba","pa","hi","bi","pi","hu","bu","pu","he","be","pe","ho","bo","po","ma","mi","mu","me","mo","ya","ya","yu","yu","yo","yo","ra","ri","ru","re","ro","wa","wa","wi","we","wo","n","vu",null,null,null,null,"","","","","\"","\"",null,null,"a","a","i","i","u","u","e","e","o","o","ka","ga","ki","gi","ku","gu","ke","ge","ko","go","sa","za","si","zi","su","zu","se","ze","so","zo","ta","da","ti","di","tu","tu","du","te","de","to","do","na","ni","nu","ne","no","ha","ba","pa","hi","bi","pi","hu","bu","pu","he","be","pe","ho","bo","po","ma","mi","mu","me","mo","ya","ya","yu","yu","yo","yo","ra","ri","ru","re","ro","wa","wa","wi","we","wo","n","vu","ka","ke","va","vi","ve","vo","","","\"","\"",null],
  "49": [null,null,null,null,null,"B","P","M","F","D","T","N","L","G","K","H","J","Q","X","ZH","CH","SH","R","Z","C","S","A","O","E","EH","AI","EI","AU","OU","AN","EN","ANG","ENG","ER","I","U","IU","V","NG","GN",null,null,null,null,"g","gg","gs","n","nj","nh","d","dd","r","lg","lm","lb","ls","lt","lp","rh","m","b","bb","bs","s","ss","","j","jj","c","k","t","p","h","a","ae","ya","yae","eo","e","yeo","ye","o","wa","wae","oe","yo","u","weo","we","wi","yu","eu","yi","i","","nn","nd","ns","nZ","lgs","ld","lbs","lZ","lQ","mb","ms","mZ","mN","bg","","bsg","bst","bj","bt","bN","bbN","sg","sn","sd","sb","sj","Z","","N","Ns","NZ","pN","hh","Q","yo-ya","yo-yae","yo-i","yu-yeo","yu-ye","yu-i","U","U-i",null,"","","","","","","","","","","","","","","","","BU","ZI","JI","GU","EE","ENN","OO","ONN","IR","ANN","INN","UNN","IM","NGG","AINN","AUNN","AM","OM","ONG","INNN","P","T","K","H",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
  "50": ["(g)","(n)","(d)","(r)","(m)","(b)","(s)","()","(j)","(c)","(k)","(t)","(p)","(h)","(ga)","(na)","(da)","(ra)","(ma)","(ba)","(sa)","(a)","(ja)","(ca)","(ka)","(ta)","(pa)","(ha)","(ju)",null,null,null,"(1) ","(2) ","(3) ","(4) ","(5) ","(6) ","(7) ","(8) ","(9) ","(10) ","(Yue) ","(Huo) ","(Shui) ","(Mu) ","(Jin) ","(Tu) ","(Ri) ","(Zhu) ","(You) ","(She) ","(Ming) ","(Te) ","(Cai) ","(Zhu) ","(Lao) ","(Dai) ","(Hu) ","(Xue) ","(Jian) ","(Qi) ","(Zi) ","(Xie) ","(Ji) ","(Xiu) ","<<",">>",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"(g)","(n)","(d)","(r)","(m)","(b)","(s)","()","(j)","(c)","(k)","(t)","(p)","(h)","(ga)","(na)","(da)","(ra)","(ma)","(ba)","(sa)","(a)","(ja)","(ca)","(ka)","(ta)","(pa)","(ha)",null,null,null,"KIS ","(1) ","(2) ","(3) ","(4) ","(5) ","(6) ","(7) ","(8) ","(9) ","(10) ","(Yue) ","(Huo) ","(Shui) ","(Mu) ","(Jin) ","(Tu) ","(Ri) ","(Zhu) ","(You) ","(She) ","(Ming) ","(Te) ","(Cai) ","(Zhu) ","(Lao) ","(Mi) ","(Nan) ","(Nu) ","(Shi) ","(You) ","(Yin) ","(Zhu) ","(Xiang) ","(Xiu) ","(Xie) ","(Zheng) ","(Shang) ","(Zhong) ","(Xia) ","(Zuo) ","(You) ","(Yi) ","(Zong) ","(Xue) ","(Jian) ","(Qi) ","(Zi) ","(Xie) ","(Ye) ",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"1M","2M","3M","4M","5M","6M","7M","8M","9M","10M","11M","12M",null,null,null,null,"a","i","u","u","o","ka","ki","ku","ke","ko","sa","si","su","se","so","ta","ti","tu","te","to","na","ni","nu","ne","no","ha","hi","hu","he","ho","ma","mi","mu","me","mo","ya","yu","yo","ra","ri","ru","re","ro","wa","wi","we","wo",null],
  "51": ["apartment","alpha","ampere","are","inning","inch","won","escudo","acre","ounce","ohm","kai-ri","carat","calorie","gallon","gamma","giga","guinea","curie","guilder","kilo","kilogram","kilometer","kilowatt","gram","gram ton","cruzeiro","krone","case","koruna","co-op","cycle","centime","shilling","centi","cent","dozen","desi","dollar","ton","nano","knot","heights","percent","parts","barrel","piaster","picul","pico","building","farad","feet","bushel","franc","hectare","peso","pfennig","hertz","pence","page","beta","point","volt","hon","pound","hall","horn","micro","mile","mach","mark","mansion","micron","milli","millibar","mega","megaton","meter","yard","yard","yuan","liter","lira","rupee","ruble","rem","roentgen","watt","0h","1h","2h","3h","4h","5h","6h","7h","8h","9h","10h","11h","12h","13h","14h","15h","16h","17h","18h","19h","20h","21h","22h","23h","24h","HPA","da","AU","bar","oV","pc",null,null,null,null,"Heisei","Syouwa","Taisyou","Meiji","Inc.","pA","nA","microamp","mA","kA","kB","MB","GB","cal","kcal","pF","nF","microFarad","microgram","mg","kg","Hz","kHz","MHz","GHz","THz","microliter","ml","dl","kl","fm","nm","micrometer","mm","cm","km","mm^2","cm^2","m^2","km^2","mm^4","cm^3","m^3","km^3","m/s","m/s^2","Pa","kPa","MPa","GPa","rad","rad/s","rad/s^2","ps","ns","microsecond","ms","pV","nV","microvolt","mV","kV","MV","pW","nW","microwatt","mW","kW","MW","kOhm","MOhm","a.m.","Bq","cc","cd","C/kg","Co.","dB","Gy","ha","HP","in","K.K.","KM","kt","lm","ln","log","lx","mb","mil","mol","pH","p.m.","PPM","PR","sr","Sv","Wb",null,null,"1d","2d","3d","4d","5d","6d","7d","8d","9d","10d","11d","12d","13d","14d","15d","16d","17d","18d","19d","20d","21d","22d","23d","24d","25d","26d","27d","28d","29d","30d","31d",null],
  "78": ["Yi ","Ding ","Kao ","Qi ","Shang ","Xia ",null,"Wan ","Zhang ","San ","Shang ","Xia ","Ji ","Bu ","Yu ","Mian ","Gai ","Chou ","Chou ","Zhuan ","Qie ","Pi ","Shi ","Shi ","Qiu ","Bing ","Ye ","Cong ","Dong ","Si ","Cheng ","Diu ","Qiu ","Liang ","Diu ","You ","Liang ","Yan ","Bing ","Sang ","Gun ","Jiu ","Ge ","Ya ","Qiang ","Zhong ","Ji ","Jie ","Feng ","Guan ","Chuan ","Chan ","Lin ","Zhuo ","Zhu ","Ha ","Wan ","Dan ","Wei ","Zhu ","Jing ","Li ","Ju ","Pie ","Fu ","Yi ","Yi ","Nai ","Shime ","Jiu ","Jiu ","Zhe ","Me ","Yi ",null,"Zhi ","Wu ","Zha ","Hu ","Fa ","Le ","Zhong ","Ping ","Pang ","Qiao ","Hu ","Guai ","Cheng ","Cheng ","Yi ","Yin ",null,"Mie ","Jiu ","Qi ","Ye ","Xi ","Xiang ","Gai ","Diu ","Hal ",null,"Shu ","Twul ","Shi ","Ji ","Nang ","Jia ","Kel ","Shi ",null,"Ol ","Mai ","Luan ","Cal ","Ru ","Xue ","Yan ","Fu ","Sha ","Na ","Gan ","Sol ","El ","Cwul ",null,"Gan ","Chi ","Gui ","Gan ","Luan ","Lin ","Yi ","Jue ","Liao ","Ma ","Yu ","Zheng ","Shi ","Shi ","Er ","Chu ","Yu ","Yu ","Yu ","Yun ","Hu ","Qi ","Wu ","Jing ","Si ","Sui ","Gen ","Gen ","Ya ","Xie ","Ya ","Qi ","Ya ","Ji ","Tou ","Wang ","Kang ","Ta ","Jiao ","Hai ","Yi ","Chan ","Heng ","Mu ",null,"Xiang ","Jing ","Ting ","Liang ","Xiang ","Jing ","Ye ","Qin ","Bo ","You ","Xie ","Dan ","Lian ","Duo ","Wei ","Ren ","Ren ","Ji ","La ","Wang ","Yi ","Shi ","Ren ","Le ","Ding ","Ze ","Jin ","Pu ","Chou ","Ba ","Zhang ","Jin ","Jie ","Bing ","Reng ","Cong ","Fo ","San ","Lun ","Sya ","Cang ","Zi ","Shi ","Ta ","Zhang ","Fu ","Xian ","Xian ","Tuo ","Hong ","Tong ","Ren ","Qian ","Gan ","Yi ","Di ","Dai ","Ling ","Yi ","Chao ","Chang ","Sa ",null,"Yi ","Mu ","Men ","Ren ","Jia ","Chao ","Yang ","Qian ","Zhong ","Pi ","Wan ","Wu ","Jian ","Jie ","Yao ","Feng ","Cang ","Ren ","Wang ","Fen ","Di ","Fang "],
  "79": ["Zhong ","Qi ","Pei ","Yu ","Diao ","Dun ","Wen ","Yi ","Xin ","Kang ","Yi ","Ji ","Ai ","Wu ","Ji ","Fu ","Fa ","Xiu ","Jin ","Bei ","Dan ","Fu ","Tang ","Zhong ","You ","Huo ","Hui ","Yu ","Cui ","Chuan ","San ","Wei ","Chuan ","Che ","Ya ","Xian ","Shang ","Chang ","Lun ","Cang ","Xun ","Xin ","Wei ","Zhu ",null,"Xuan ","Nu ","Bo ","Gu ","Ni ","Ni ","Xie ","Ban ","Xu ","Ling ","Zhou ","Shen ","Qu ","Si ","Beng ","Si ","Jia ","Pi ","Yi ","Si ","Ai ","Zheng ","Dian ","Han ","Mai ","Dan ","Zhu ","Bu ","Qu ","Bi ","Shao ","Ci ","Wei ","Di ","Zhu ","Zuo ","You ","Yang ","Ti ","Zhan ","He ","Bi ","Tuo ","She ","Yu ","Yi ","Fo ","Zuo ","Kou ","Ning ","Tong ","Ni ","Xuan ","Qu ","Yong ","Wa ","Qian ",null,"Ka ",null,"Pei ","Huai ","He ","Lao ","Xiang ","Ge ","Yang ","Bai ","Fa ","Ming ","Jia ","Er ","Bing ","Ji ","Hen ","Huo ","Gui ","Quan ","Tiao ","Jiao ","Ci ","Yi ","Shi ","Xing ","Shen ","Tuo ","Kan ","Zhi ","Gai ","Lai ","Yi ","Chi ","Kua ","Guang ","Li ","Yin ","Shi ","Mi ","Zhu ","Xu ","You ","An ","Lu ","Mou ","Er ","Lun ","Tong ","Cha ","Chi ","Xun ","Gong ","Zhou ","Yi ","Ru ","Jian ","Xia ","Jia ","Zai ","Lu ","Ko ","Jiao ","Zhen ","Ce ","Qiao ","Kuai ","Chai ","Ning ","Nong ","Jin ","Wu ","Hou ","Jiong ","Cheng ","Zhen ","Zuo ","Chou ","Qin ","Lu ","Ju ","Shu ","Ting ","Shen ","Tuo ","Bo ","Nan ","Hao ","Bian ","Tui ","Yu ","Xi ","Cu ","E ","Qiu ","Xu ","Kuang ","Ku ","Wu ","Jun ","Yi ","Fu ","Lang ","Zu ","Qiao ","Li ","Yong ","Hun ","Jing ","Xian ","San ","Pai ","Su ","Fu ","Xi ","Li ","Fu ","Ping ","Bao ","Yu ","Si ","Xia ","Xin ","Xiu ","Yu ","Ti ","Che ","Chou ",null,"Yan ","Lia ","Li ","Lai ",null,"Jian ","Xiu ","Fu ","He ","Ju ","Xiao ","Pai ","Jian ","Biao ","Chu ","Fei ","Feng ","Ya ","An ","Bei ","Yu ","Xin ","Bi ","Jian "],
  "80": ["Chang ","Chi ","Bing ","Zan ","Yao ","Cui ","Lia ","Wan ","Lai ","Cang ","Zong ","Ge ","Guan ","Bei ","Tian ","Shu ","Shu ","Men ","Dao ","Tan ","Jue ","Chui ","Xing ","Peng ","Tang ","Hou ","Yi ","Qi ","Ti ","Gan ","Jing ","Jie ","Sui ","Chang ","Jie ","Fang ","Zhi ","Kong ","Juan ","Zong ","Ju ","Qian ","Ni ","Lun ","Zhuo ","Wei ","Luo ","Song ","Leng ","Hun ","Dong ","Zi ","Ben ","Wu ","Ju ","Nai ","Cai ","Jian ","Zhai ","Ye ","Zhi ","Sha ","Qing ",null,"Ying ","Cheng ","Jian ","Yan ","Nuan ","Zhong ","Chun ","Jia ","Jie ","Wei ","Yu ","Bing ","Ruo ","Ti ","Wei ","Pian ","Yan ","Feng ","Tang ","Wo ","E ","Xie ","Che ","Sheng ","Kan ","Di ","Zuo ","Cha ","Ting ","Bei ","Ye ","Huang ","Yao ","Zhan ","Chou ","Yan ","You ","Jian ","Xu ","Zha ","Ci ","Fu ","Bi ","Zhi ","Zong ","Mian ","Ji ","Yi ","Xie ","Xun ","Si ","Duan ","Ce ","Zhen ","Ou ","Tou ","Tou ","Bei ","Za ","Lu ","Jie ","Wei ","Fen ","Chang ","Gui ","Sou ","Zhi ","Su ","Xia ","Fu ","Yuan ","Rong ","Li ","Ru ","Yun ","Gou ","Ma ","Bang ","Dian ","Tang ","Hao ","Jie ","Xi ","Shan ","Qian ","Jue ","Cang ","Chu ","San ","Bei ","Xiao ","Yong ","Yao ","Tan ","Suo ","Yang ","Fa ","Bing ","Jia ","Dai ","Zai ","Tang ",null,"Bin ","Chu ","Nuo ","Can ","Lei ","Cui ","Yong ","Zao ","Zong ","Peng ","Song ","Ao ","Chuan ","Yu ","Zhai ","Cou ","Shang ","Qiang ","Jing ","Chi ","Sha ","Han ","Zhang ","Qing ","Yan ","Di ","Xi ","Lu ","Bei ","Piao ","Jin ","Lian ","Lu ","Man ","Qian ","Xian ","Tan ","Ying ","Dong ","Zhuan ","Xiang ","Shan ","Qiao ","Jiong ","Tui ","Zun ","Pu ","Xi ","Lao ","Chang ","Guang ","Liao ","Qi ","Deng ","Chan ","Wei ","Ji ","Fan ","Hui ","Chuan ","Jian ","Dan ","Jiao ","Jiu ","Seng ","Fen ","Xian ","Jue ","E ","Jiao ","Jian ","Tong ","Lin ","Bo ","Gu ",null,"Su ","Xian ","Jiang ","Min ","Ye ","Jin ","Jia ","Qiao ","Pi ","Feng ","Zhou ","Ai ","Sai "],
  "81": ["Yi ","Jun ","Nong ","Chan ","Yi ","Dang ","Jing ","Xuan ","Kuai ","Jian ","Chu ","Dan ","Jiao ","Sha ","Zai ",null,"Bin ","An ","Ru ","Tai ","Chou ","Chai ","Lan ","Ni ","Jin ","Qian ","Meng ","Wu ","Ning ","Qiong ","Ni ","Chang ","Lie ","Lei ","Lu ","Kuang ","Bao ","Du ","Biao ","Zan ","Zhi ","Si ","You ","Hao ","Chen ","Chen ","Li ","Teng ","Wei ","Long ","Chu ","Chan ","Rang ","Shu ","Hui ","Li ","Luo ","Zan ","Nuo ","Tang ","Yan ","Lei ","Nang ","Er ","Wu ","Yun ","Zan ","Yuan ","Xiong ","Chong ","Zhao ","Xiong ","Xian ","Guang ","Dui ","Ke ","Dui ","Mian ","Tu ","Chang ","Er ","Dui ","Er ","Xin ","Tu ","Si ","Yan ","Yan ","Shi ","Shi ","Dang ","Qian ","Dou ","Fen ","Mao ","Shen ","Dou ","Bai ","Jing ","Li ","Huang ","Ru ","Wang ","Nei ","Quan ","Liang ","Yu ","Ba ","Gong ","Liu ","Xi ",null,"Lan ","Gong ","Tian ","Guan ","Xing ","Bing ","Qi ","Ju ","Dian ","Zi ","Ppwun ","Yang ","Jian ","Shou ","Ji ","Yi ","Ji ","Chan ","Jiong ","Mao ","Ran ","Nei ","Yuan ","Mao ","Gang ","Ran ","Ce ","Jiong ","Ce ","Zai ","Gua ","Jiong ","Mao ","Zhou ","Mou ","Gou ","Xu ","Mian ","Mi ","Rong ","Yin ","Xie ","Kan ","Jun ","Nong ","Yi ","Mi ","Shi ","Guan ","Meng ","Zhong ","Ju ","Yuan ","Ming ","Kou ","Lam ","Fu ","Xie ","Mi ","Bing ","Dong ","Tai ","Gang ","Feng ","Bing ","Hu ","Chong ","Jue ","Hu ","Kuang ","Ye ","Leng ","Pan ","Fu ","Min ","Dong ","Xian ","Lie ","Xia ","Jian ","Jing ","Shu ","Mei ","Tu ","Qi ","Gu ","Zhun ","Song ","Jing ","Liang ","Qing ","Diao ","Ling ","Dong ","Gan ","Jian ","Yin ","Cou ","Yi ","Li ","Cang ","Ming ","Zhuen ","Cui ","Si ","Duo ","Jin ","Lin ","Lin ","Ning ","Xi ","Du ","Ji ","Fan ","Fan ","Fan ","Feng ","Ju ","Chu ","Tako ","Feng ","Mok ","Ci ","Fu ","Feng ","Ping ","Feng ","Kai ","Huang ","Kai ","Gan ","Deng ","Ping ","Qu ","Xiong ","Kuai ","Tu ","Ao ","Chu ","Ji ","Dang ","Han ","Han ","Zao "],
  "82": ["Dao ","Diao ","Dao ","Ren ","Ren ","Chuang ","Fen ","Qie ","Yi ","Ji ","Kan ","Qian ","Cun ","Chu ","Wen ","Ji ","Dan ","Xing ","Hua ","Wan ","Jue ","Li ","Yue ","Lie ","Liu ","Ze ","Gang ","Chuang ","Fu ","Chu ","Qu ","Ju ","Shan ","Min ","Ling ","Zhong ","Pan ","Bie ","Jie ","Jie ","Bao ","Li ","Shan ","Bie ","Chan ","Jing ","Gua ","Gen ","Dao ","Chuang ","Kui ","Ku ","Duo ","Er ","Zhi ","Shua ","Quan ","Cha ","Ci ","Ke ","Jie ","Gui ","Ci ","Gui ","Kai ","Duo ","Ji ","Ti ","Jing ","Lou ","Gen ","Ze ","Yuan ","Cuo ","Xue ","Ke ","La ","Qian ","Cha ","Chuang ","Gua ","Jian ","Cuo ","Li ","Ti ","Fei ","Pou ","Chan ","Qi ","Chuang ","Zi ","Gang ","Wan ","Bo ","Ji ","Duo ","Qing ","Yan ","Zhuo ","Jian ","Ji ","Bo ","Yan ","Ju ","Huo ","Sheng ","Jian ","Duo ","Duan ","Wu ","Gua ","Fu ","Sheng ","Jian ","Ge ","Zha ","Kai ","Chuang ","Juan ","Chan ","Tuan ","Lu ","Li ","Fou ","Shan ","Piao ","Kou ","Jiao ","Gua ","Qiao ","Jue ","Hua ","Zha ","Zhuo ","Lian ","Ju ","Pi ","Liu ","Gui ","Jiao ","Gui ","Jian ","Jian ","Tang ","Huo ","Ji ","Jian ","Yi ","Jian ","Zhi ","Chan ","Cuan ","Mo ","Li ","Zhu ","Li ","Ya ","Quan ","Ban ","Gong ","Jia ","Wu ","Mai ","Lie ","Jin ","Keng ","Xie ","Zhi ","Dong ","Zhu ","Nu ","Jie ","Qu ","Shao ","Yi ","Zhu ","Miao ","Li ","Jing ","Lao ","Lao ","Juan ","Kou ","Yang ","Wa ","Xiao ","Mou ","Kuang ","Jie ","Lie ","He ","Shi ","Ke ","Jing ","Hao ","Bo ","Min ","Chi ","Lang ","Yong ","Yong ","Mian ","Ke ","Xun ","Juan ","Qing ","Lu ","Pou ","Meng ","Lai ","Le ","Kai ","Mian ","Dong ","Xu ","Xu ","Kan ","Wu ","Yi ","Xun ","Weng ","Sheng ","Lao ","Mu ","Lu ","Piao ","Shi ","Ji ","Qin ","Qiang ","Jiao ","Quan ","Yang ","Yi ","Jue ","Fan ","Juan ","Tong ","Ju ","Dan ","Xie ","Mai ","Xun ","Xun ","Lu ","Li ","Che ","Rang ","Quan ","Bao ","Shao ","Yun ","Jiu ","Bao ","Gou ","Wu "],
  "83": ["Yun ","Mwun ","Nay ","Gai ","Gai ","Bao ","Cong ",null,"Xiong ","Peng ","Ju ","Tao ","Ge ","Pu ","An ","Pao ","Fu ","Gong ","Da ","Jiu ","Qiong ","Bi ","Hua ","Bei ","Nao ","Chi ","Fang ","Jiu ","Yi ","Za ","Jiang ","Kang ","Jiang ","Kuang ","Hu ","Xia ","Qu ","Bian ","Gui ","Qie ","Zang ","Kuang ","Fei ","Hu ","Tou ","Gui ","Gui ","Hui ","Dan ","Gui ","Lian ","Lian ","Suan ","Du ","Jiu ","Qu ","Xi ","Pi ","Qu ","Yi ","Qia ","Yan ","Bian ","Ni ","Qu ","Shi ","Xin ","Qian ","Nian ","Sa ","Zu ","Sheng ","Wu ","Hui ","Ban ","Shi ","Xi ","Wan ","Hua ","Xie ","Wan ","Bei ","Zu ","Zhuo ","Xie ","Dan ","Mai ","Nan ","Dan ","Ji ","Bo ","Shuai ","Bu ","Kuang ","Bian ","Bu ","Zhan ","Qia ","Lu ","You ","Lu ","Xi ","Gua ","Wo ","Xie ","Jie ","Jie ","Wei ","Ang ","Qiong ","Zhi ","Mao ","Yin ","Wei ","Shao ","Ji ","Que ","Luan ","Shi ","Juan ","Xie ","Xu ","Jin ","Que ","Wu ","Ji ","E ","Qing ","Xi ",null,"Han ","Zhan ","E ","Ting ","Li ","Zhe ","Han ","Li ","Ya ","Ya ","Yan ","She ","Zhi ","Zha ","Pang ",null,"He ","Ya ","Zhi ","Ce ","Pang ","Ti ","Li ","She ","Hou ","Ting ","Zui ","Cuo ","Fei ","Yuan ","Ce ","Yuan ","Xiang ","Yan ","Li ","Jue ","Sha ","Dian ","Chu ","Jiu ","Qin ","Ao ","Gui ","Yan ","Si ","Li ","Chang ","Lan ","Li ","Yan ","Yan ","Yuan ","Si ","Gong ","Lin ","Qiu ","Qu ","Qu ","Uk ","Lei ","Du ","Xian ","Zhuan ","San ","Can ","Can ","Can ","Can ","Ai ","Dai ","You ","Cha ","Ji ","You ","Shuang ","Fan ","Shou ","Guai ","Ba ","Fa ","Ruo ","Shi ","Shu ","Zhuo ","Qu ","Shou ","Bian ","Xu ","Jia ","Pan ","Sou ","Gao ","Wei ","Sou ","Die ","Rui ","Cong ","Kou ","Gu ","Ju ","Ling ","Gua ","Tao ","Kou ","Zhi ","Jiao ","Zhao ","Ba ","Ding ","Ke ","Tai ","Chi ","Shi ","You ","Qiu ","Po ","Xie ","Hao ","Si ","Tan ","Chi ","Le ","Diao ","Ji ",null,"Hong "],
  "84": ["Mie ","Xu ","Mang ","Chi ","Ge ","Xuan ","Yao ","Zi ","He ","Ji ","Diao ","Cun ","Tong ","Ming ","Hou ","Li ","Tu ","Xiang ","Zha ","Xia ","Ye ","Lu ","A ","Ma ","Ou ","Xue ","Yi ","Jun ","Chou ","Lin ","Tun ","Yin ","Fei ","Bi ","Qin ","Qin ","Jie ","Bu ","Fou ","Ba ","Dun ","Fen ","E ","Han ","Ting ","Hang ","Shun ","Qi ","Hong ","Zhi ","Shen ","Wu ","Wu ","Chao ","Ne ","Xue ","Xi ","Chui ","Dou ","Wen ","Hou ","Ou ","Wu ","Gao ","Ya ","Jun ","Lu ","E ","Ge ","Mei ","Ai ","Qi ","Cheng ","Wu ","Gao ","Fu ","Jiao ","Hong ","Chi ","Sheng ","Ne ","Tun ","Fu ","Yi ","Dai ","Ou ","Li ","Bai ","Yuan ","Kuai ",null,"Qiang ","Wu ","E ","Shi ","Quan ","Pen ","Wen ","Ni ","M ","Ling ","Ran ","You ","Di ","Zhou ","Shi ","Zhou ","Tie ","Xi ","Yi ","Qi ","Ping ","Zi ","Gu ","Zi ","Wei ","Xu ","He ","Nao ","Xia ","Pei ","Yi ","Xiao ","Shen ","Hu ","Ming ","Da ","Qu ","Ju ","Gem ","Za ","Tuo ","Duo ","Pou ","Pao ","Bi ","Fu ","Yang ","He ","Zha ","He ","Hai ","Jiu ","Yong ","Fu ","Que ","Zhou ","Wa ","Ka ","Gu ","Ka ","Zuo ","Bu ","Long ","Dong ","Ning ","Tha ","Si ","Xian ","Huo ","Qi ","Er ","E ","Guang ","Zha ","Xi ","Yi ","Lie ","Zi ","Mie ","Mi ","Zhi ","Yao ","Ji ","Zhou ","Ge ","Shuai ","Zan ","Xiao ","Ke ","Hui ","Kua ","Huai ","Tao ","Xian ","E ","Xuan ","Xiu ","Wai ","Yan ","Lao ","Yi ","Ai ","Pin ","Shen ","Tong ","Hong ","Xiong ","Chi ","Wa ","Ha ","Zai ","Yu ","Di ","Pai ","Xiang ","Ai ","Hen ","Kuang ","Ya ","Da ","Xiao ","Bi ","Yue ",null,"Hua ","Sasou ","Kuai ","Duo ",null,"Ji ","Nong ","Mou ","Yo ","Hao ","Yuan ","Long ","Pou ","Mang ","Ge ","E ","Chi ","Shao ","Li ","Na ","Zu ","He ","Ku ","Xiao ","Xian ","Lao ","Bo ","Zhe ","Zha ","Liang ","Ba ","Mie ","Le ","Sui ","Fou ","Bu ","Han ","Heng ","Geng ","Shuo ","Ge "],
  "85": ["You ","Yan ","Gu ","Gu ","Bai ","Han ","Suo ","Chun ","Yi ","Ai ","Jia ","Tu ","Xian ","Huan ","Li ","Xi ","Tang ","Zuo ","Qiu ","Che ","Wu ","Zao ","Ya ","Dou ","Qi ","Di ","Qin ","Ma ","Mal ","Hong ","Dou ","Kes ","Lao ","Liang ","Suo ","Zao ","Huan ","Lang ","Sha ","Ji ","Zuo ","Wo ","Feng ","Yin ","Hu ","Qi ","Shou ","Wei ","Shua ","Chang ","Er ","Li ","Qiang ","An ","Jie ","Yo ","Nian ","Yu ","Tian ","Lai ","Sha ","Xi ","Tuo ","Hu ","Ai ","Zhou ","Nou ","Ken ","Zhuo ","Zhuo ","Shang ","Di ","Heng ","Lan ","A ","Xiao ","Xiang ","Tun ","Wu ","Wen ","Cui ","Sha ","Hu ","Qi ","Qi ","Tao ","Dan ","Dan ","Ye ","Zi ","Bi ","Cui ","Chuo ","He ","Ya ","Qi ","Zhe ","Pei ","Liang ","Xian ","Pi ","Sha ","La ","Ze ","Qing ","Gua ","Pa ","Zhe ","Se ","Zhuan ","Nie ","Guo ","Luo ","Yan ","Di ","Quan ","Tan ","Bo ","Ding ","Lang ","Xiao ",null,"Tang ","Chi ","Ti ","An ","Jiu ","Dan ","Ke ","Yong ","Wei ","Nan ","Shan ","Yu ","Zhe ","La ","Jie ","Hou ","Han ","Die ","Zhou ","Chai ","Wai ","Re ","Yu ","Yin ","Zan ","Yao ","Wo ","Mian ","Hu ","Yun ","Chuan ","Hui ","Huan ","Huan ","Xi ","He ","Ji ","Kui ","Zhong ","Wei ","Sha ","Xu ","Huang ","Du ","Nie ","Xuan ","Liang ","Yu ","Sang ","Chi ","Qiao ","Yan ","Dan ","Pen ","Can ","Li ","Yo ","Zha ","Wei ","Miao ","Ying ","Pen ","Phos ","Kui ","Xi ","Yu ","Jie ","Lou ","Ku ","Sao ","Huo ","Ti ","Yao ","He ","A ","Xiu ","Qiang ","Se ","Yong ","Su ","Hong ","Xie ","Yi ","Suo ","Ma ","Cha ","Hai ","Ke ","Ta ","Sang ","Tian ","Ru ","Sou ","Wa ","Ji ","Pang ","Wu ","Xian ","Shi ","Ge ","Zi ","Jie ","Luo ","Weng ","Wa ","Si ","Chi ","Hao ","Suo ","Jia ","Hai ","Suo ","Qin ","Nie ","He ","Cis ","Sai ","Ng ","Ge ","Na ","Dia ","Ai ",null,"Tong ","Bi ","Ao ","Ao ","Lian ","Cui ","Zhe ","Mo ","Sou ","Sou ","Tan "],
  "86": ["Di ","Qi ","Jiao ","Chong ","Jiao ","Kai ","Tan ","San ","Cao ","Jia ","Ai ","Xiao ","Piao ","Lou ","Ga ","Gu ","Xiao ","Hu ","Hui ","Guo ","Ou ","Xian ","Ze ","Chang ","Xu ","Po ","De ","Ma ","Ma ","Hu ","Lei ","Du ","Ga ","Tang ","Ye ","Beng ","Ying ","Saai ","Jiao ","Mi ","Xiao ","Hua ","Mai ","Ran ","Zuo ","Peng ","Lao ","Xiao ","Ji ","Zhu ","Chao ","Kui ","Zui ","Xiao ","Si ","Hao ","Fu ","Liao ","Qiao ","Xi ","Xiu ","Tan ","Tan ","Mo ","Xun ","E ","Zun ","Fan ","Chi ","Hui ","Zan ","Chuang ","Cu ","Dan ","Yu ","Tun ","Cheng ","Jiao ","Ye ","Xi ","Qi ","Hao ","Lian ","Xu ","Deng ","Hui ","Yin ","Pu ","Jue ","Qin ","Xun ","Nie ","Lu ","Si ","Yan ","Ying ","Da ","Dan ","Yu ","Zhou ","Jin ","Nong ","Yue ","Hui ","Qi ","E ","Zao ","Yi ","Shi ","Jiao ","Yuan ","Ai ","Yong ","Jue ","Kuai ","Yu ","Pen ","Dao ","Ge ","Xin ","Dun ","Dang ","Sin ","Sai ","Pi ","Pi ","Yin ","Zui ","Ning ","Di ","Lan ","Ta ","Huo ","Ru ","Hao ","Xia ","Ya ","Duo ","Xi ","Chou ","Ji ","Jin ","Hao ","Ti ","Chang ",null,null,"Ca ","Ti ","Lu ","Hui ","Bo ","You ","Nie ","Yin ","Hu ","Mo ","Huang ","Zhe ","Li ","Liu ","Haai ","Nang ","Xiao ","Mo ","Yan ","Li ","Lu ","Long ","Fu ","Dan ","Chen ","Pin ","Pi ","Xiang ","Huo ","Mo ","Xi ","Duo ","Ku ","Yan ","Chan ","Ying ","Rang ","Dian ","La ","Ta ","Xiao ","Jiao ","Chuo ","Huan ","Huo ","Zhuan ","Nie ","Xiao ","Ca ","Li ","Chan ","Chai ","Li ","Yi ","Luo ","Nang ","Zan ","Su ","Xi ","So ","Jian ","Za ","Zhu ","Lan ","Nie ","Nang ",null,null,"Wei ","Hui ","Yin ","Qiu ","Si ","Nin ","Jian ","Hui ","Xin ","Yin ","Nan ","Tuan ","Tuan ","Dun ","Kang ","Yuan ","Jiong ","Pian ","Yun ","Cong ","Hu ","Hui ","Yuan ","You ","Guo ","Kun ","Cong ","Wei ","Tu ","Wei ","Lun ","Guo ","Qun ","Ri ","Ling ","Gu ","Guo ","Tai ","Guo ","Tu ","You "],
  "87": ["Guo ","Yin ","Hun ","Pu ","Yu ","Han ","Yuan ","Lun ","Quan ","Yu ","Qing ","Guo ","Chuan ","Wei ","Yuan ","Quan ","Ku ","Fu ","Yuan ","Yuan ","E ","Tu ","Tu ","Tu ","Tuan ","Lue ","Hui ","Yi ","Yuan ","Luan ","Luan ","Tu ","Ya ","Tu ","Ting ","Sheng ","Pu ","Lu ","Iri ","Ya ","Zai ","Wei ","Ge ","Yu ","Wu ","Gui ","Pi ","Yi ","Di ","Qian ","Qian ","Zhen ","Zhuo ","Dang ","Qia ","Akutsu ","Yama ","Kuang ","Chang ","Qi ","Nie ","Mo ","Ji ","Jia ","Zhi ","Zhi ","Ban ","Xun ","Tou ","Qin ","Fen ","Jun ","Keng ","Tun ","Fang ","Fen ","Ben ","Tan ","Kan ","Pi ","Zuo ","Keng ","Bi ","Xing ","Di ","Jing ","Ji ","Kuai ","Di ","Jing ","Jian ","Tan ","Li ","Ba ","Wu ","Fen ","Zhui ","Po ","Pan ","Tang ","Kun ","Qu ","Tan ","Zhi ","Tuo ","Gan ","Ping ","Dian ","Gua ","Ni ","Tai ","Pi ","Jiong ","Yang ","Fo ","Ao ","Liu ","Qiu ","Mu ","Ke ","Gou ","Xue ","Ba ","Chi ","Che ","Ling ","Zhu ","Fu ","Hu ","Zhi ","Chui ","La ","Long ","Long ","Lu ","Ao ","Tay ","Pao ",null,"Xing ","Dong ","Ji ","Ke ","Lu ","Ci ","Chi ","Lei ","Gai ","Yin ","Hou ","Dui ","Zhao ","Fu ","Guang ","Yao ","Duo ","Duo ","Gui ","Cha ","Yang ","Yin ","Fa ","Gou ","Yuan ","Die ","Xie ","Ken ","Jiong ","Shou ","E ","Ha ","Dian ","Hong ","Wu ","Kua ",null,"Tao ","Dang ","Kai ","Gake ","Nao ","An ","Xing ","Xian ","Huan ","Bang ","Pei ","Ba ","Yi ","Yin ","Han ","Xu ","Chui ","Cen ","Geng ","Ai ","Peng ","Fang ","Que ","Yong ","Xun ","Jia ","Di ","Mai ","Lang ","Xuan ","Cheng ","Yan ","Jin ","Zhe ","Lei ","Lie ","Bu ","Cheng ","Gomi ","Bu ","Shi ","Xun ","Guo ","Jiong ","Ye ","Nian ","Di ","Yu ","Bu ","Ya ","Juan ","Sui ","Pi ","Cheng ","Wan ","Ju ","Lun ","Zheng ","Kong ","Chong ","Dong ","Dai ","Tan ","An ","Cai ","Shu ","Beng ","Kan ","Zhi ","Duo ","Yi ","Zhi ","Yi ","Pei ","Ji ","Zhun ","Qi ","Sao ","Ju ","Ni "],
  "88": ["Ku ","Ke ","Tang ","Kun ","Ni ","Jian ","Dui ","Jin ","Gang ","Yu ","E ","Peng ","Gu ","Tu ","Leng ",null,"Ya ","Qian ",null,"An ",null,"Duo ","Nao ","Tu ","Cheng ","Yin ","Hun ","Bi ","Lian ","Guo ","Die ","Zhuan ","Hou ","Bao ","Bao ","Yu ","Di ","Mao ","Jie ","Ruan ","E ","Geng ","Kan ","Zong ","Yu ","Huang ","E ","Yao ","Yan ","Bao ","Ji ","Mei ","Chang ","Du ","Tuo ","Yin ","Feng ","Zhong ","Jie ","Zhen ","Feng ","Gang ","Chuan ","Jian ","Pyeng ","Toride ","Xiang ","Huang ","Leng ","Duan ",null,"Xuan ","Ji ","Ji ","Kuai ","Ying ","Ta ","Cheng ","Yong ","Kai ","Su ","Su ","Shi ","Mi ","Ta ","Weng ","Cheng ","Tu ","Tang ","Que ","Zhong ","Li ","Peng ","Bang ","Sai ","Zang ","Dui ","Tian ","Wu ","Cheng ","Xun ","Ge ","Zhen ","Ai ","Gong ","Yan ","Kan ","Tian ","Yuan ","Wen ","Xie ","Liu ","Ama ","Lang ","Chang ","Peng ","Beng ","Chen ","Cu ","Lu ","Ou ","Qian ","Mei ","Mo ","Zhuan ","Shuang ","Shu ","Lou ","Chi ","Man ","Biao ","Jing ","Qi ","Shu ","Di ","Zhang ","Kan ","Yong ","Dian ","Chen ","Zhi ","Xi ","Guo ","Qiang ","Jin ","Di ","Shang ","Mu ","Cui ","Yan ","Ta ","Zeng ","Qi ","Qiang ","Liang ",null,"Zhui ","Qiao ","Zeng ","Xu ","Shan ","Shan ","Ba ","Pu ","Kuai ","Dong ","Fan ","Que ","Mo ","Dun ","Dun ","Dun ","Di ","Sheng ","Duo ","Duo ","Tan ","Deng ","Wu ","Fen ","Huang ","Tan ","Da ","Ye ","Sho ","Mama ","Yu ","Qiang ","Ji ","Qiao ","Ken ","Yi ","Pi ","Bi ","Dian ","Jiang ","Ye ","Yong ","Bo ","Tan ","Lan ","Ju ","Huai ","Dang ","Rang ","Qian ","Xun ","Lan ","Xi ","He ","Ai ","Ya ","Dao ","Hao ","Ruan ","Mama ","Lei ","Kuang ","Lu ","Yan ","Tan ","Wei ","Huai ","Long ","Long ","Rui ","Li ","Lin ","Rang ","Ten ","Xun ","Yan ","Lei ","Ba ",null,"Shi ","Ren ",null,"Zhuang ","Zhuang ","Sheng ","Yi ","Mai ","Ke ","Zhu ","Zhuang ","Hu ","Hu ","Kun ","Yi ","Hu ","Xu ","Kun ","Shou ","Mang ","Zun "],
  "89": ["Shou ","Yi ","Zhi ","Gu ","Chu ","Jiang ","Feng ","Bei ","Cay ","Bian ","Sui ","Qun ","Ling ","Fu ","Zuo ","Xia ","Xiong ",null,"Nao ","Xia ","Kui ","Xi ","Wai ","Yuan ","Mao ","Su ","Duo ","Duo ","Ye ","Qing ","Uys ","Gou ","Gou ","Qi ","Meng ","Meng ","Yin ","Huo ","Chen ","Da ","Ze ","Tian ","Tai ","Fu ","Guai ","Yao ","Yang ","Hang ","Gao ","Shi ","Ben ","Tai ","Tou ","Yan ","Bi ","Yi ","Kua ","Jia ","Duo ","Kwu ","Kuang ","Yun ","Jia ","Pa ","En ","Lian ","Huan ","Di ","Yan ","Pao ","Quan ","Qi ","Nai ","Feng ","Xie ","Fen ","Dian ",null,"Kui ","Zou ","Huan ","Qi ","Kai ","Zha ","Ben ","Yi ","Jiang ","Tao ","Zang ","Ben ","Xi ","Xiang ","Fei ","Diao ","Xun ","Keng ","Dian ","Ao ","She ","Weng ","Pan ","Ao ","Wu ","Ao ","Jiang ","Lian ","Duo ","Yun ","Jiang ","Shi ","Fen ","Huo ","Bi ","Lian ","Duo ","Nu ","Nu ","Ding ","Nai ","Qian ","Jian ","Ta ","Jiu ","Nan ","Cha ","Hao ","Xian ","Fan ","Ji ","Shuo ","Ru ","Fei ","Wang ","Hong ","Zhuang ","Fu ","Ma ","Dan ","Ren ","Fu ","Jing ","Yan ","Xie ","Wen ","Zhong ","Pa ","Du ","Ji ","Keng ","Zhong ","Yao ","Jin ","Yun ","Miao ","Pei ","Shi ","Yue ","Zhuang ","Niu ","Yan ","Na ","Xin ","Fen ","Bi ","Yu ","Tuo ","Feng ","Yuan ","Fang ","Wu ","Yu ","Gui ","Du ","Ba ","Ni ","Zhou ","Zhuo ","Zhao ","Da ","Nai ","Yuan ","Tou ","Xuan ","Zhi ","E ","Mei ","Mo ","Qi ","Bi ","Shen ","Qie ","E ","He ","Xu ","Fa ","Zheng ","Min ","Ban ","Mu ","Fu ","Ling ","Zi ","Zi ","Shi ","Ran ","Shan ","Yang ","Man ","Jie ","Gu ","Si ","Xing ","Wei ","Zi ","Ju ","Shan ","Pin ","Ren ","Yao ","Tong ","Jiang ","Shu ","Ji ","Gai ","Shang ","Kuo ","Juan ","Jiao ","Gou ","Mu ","Jian ","Jian ","Yi ","Nian ","Zhi ","Ji ","Ji ","Xian ","Heng ","Guang ","Jun ","Kua ","Yan ","Ming ","Lie ","Pei ","Yan ","You ","Yan ","Cha ","Shen ","Yin ","Chi ","Gui ","Quan ","Zi "],
  "90": ["Song ","Wei ","Hong ","Wa ","Lou ","Ya ","Rao ","Jiao ","Luan ","Ping ","Xian ","Shao ","Li ","Cheng ","Xiao ","Mang ","Fu ","Suo ","Wu ","Wei ","Ke ","Lai ","Chuo ","Ding ","Niang ","Xing ","Nan ","Yu ","Nuo ","Pei ","Nei ","Juan ","Shen ","Zhi ","Han ","Di ","Zhuang ","E ","Pin ","Tui ","Han ","Mian ","Wu ","Yan ","Wu ","Xi ","Yan ","Yu ","Si ","Yu ","Wa ",null,"Xian ","Ju ","Qu ","Shui ","Qi ","Xian ","Zhui ","Dong ","Chang ","Lu ","Ai ","E ","E ","Lou ","Mian ","Cong ","Pou ","Ju ","Po ","Cai ","Ding ","Wan ","Biao ","Xiao ","Shu ","Qi ","Hui ","Fu ","E ","Wo ","Tan ","Fei ","Wei ","Jie ","Tian ","Ni ","Quan ","Jing ","Hun ","Jing ","Qian ","Dian ","Xing ","Hu ","Wa ","Lai ","Bi ","Yin ","Chou ","Chuo ","Fu ","Jing ","Lun ","Yan ","Lan ","Kun ","Yin ","Ya ","Ju ","Li ","Dian ","Xian ","Hwa ","Hua ","Ying ","Chan ","Shen ","Ting ","Dang ","Yao ","Wu ","Nan ","Ruo ","Jia ","Tou ","Xu ","Yu ","Wei ","Ti ","Rou ","Mei ","Dan ","Ruan ","Qin ","Hui ","Wu ","Qian ","Chun ","Mao ","Fu ","Jie ","Duan ","Xi ","Zhong ","Mei ","Huang ","Mian ","An ","Ying ","Xuan ","Jie ","Wei ","Mei ","Yuan ","Zhen ","Qiu ","Ti ","Xie ","Tuo ","Lian ","Mao ","Ran ","Si ","Pian ","Wei ","Wa ","Jiu ","Hu ","Ao ",null,"Bou ","Xu ","Tou ","Gui ","Zou ","Yao ","Pi ","Xi ","Yuan ","Ying ","Rong ","Ru ","Chi ","Liu ","Mei ","Pan ","Ao ","Ma ","Gou ","Kui ","Qin ","Jia ","Sao ","Zhen ","Yuan ","Cha ","Yong ","Ming ","Ying ","Ji ","Su ","Niao ","Xian ","Tao ","Pang ","Lang ","Nao ","Bao ","Ai ","Pi ","Pin ","Yi ","Piao ","Yu ","Lei ","Xuan ","Man ","Yi ","Zhang ","Kang ","Yong ","Ni ","Li ","Di ","Gui ","Yan ","Jin ","Zhuan ","Chang ","Ce ","Han ","Nen ","Lao ","Mo ","Zhe ","Hu ","Hu ","Ao ","Nen ","Qiang ","Ma ","Pie ","Gu ","Wu ","Jiao ","Tuo ","Zhan ","Mao ","Xian ","Xian ","Mo ","Liao ","Lian ","Hua "],
  "91": ["Gui ","Deng ","Zhi ","Xu ","Yi ","Hua ","Xi ","Hui ","Rao ","Xi ","Yan ","Chan ","Jiao ","Mei ","Fan ","Fan ","Xian ","Yi ","Wei ","Jiao ","Fu ","Shi ","Bi ","Shan ","Sui ","Qiang ","Lian ","Huan ","Xin ","Niao ","Dong ","Yi ","Can ","Ai ","Niang ","Neng ","Ma ","Tiao ","Chou ","Jin ","Ci ","Yu ","Pin ","Yong ","Xu ","Nai ","Yan ","Tai ","Ying ","Can ","Niao ","Wo ","Ying ","Mian ","Kaka ","Ma ","Shen ","Xing ","Ni ","Du ","Liu ","Yuan ","Lan ","Yan ","Shuang ","Ling ","Jiao ","Niang ","Lan ","Xian ","Ying ","Shuang ","Shuai ","Quan ","Mi ","Li ","Luan ","Yan ","Zhu ","Lan ","Zi ","Jie ","Jue ","Jue ","Kong ","Yun ","Zi ","Zi ","Cun ","Sun ","Fu ","Bei ","Zi ","Xiao ","Xin ","Meng ","Si ","Tai ","Bao ","Ji ","Gu ","Nu ","Xue ",null,"Zhuan ","Hai ","Luan ","Sun ","Huai ","Mie ","Cong ","Qian ","Shu ","Chan ","Ya ","Zi ","Ni ","Fu ","Zi ","Li ","Xue ","Bo ","Ru ","Lai ","Nie ","Nie ","Ying ","Luan ","Mian ","Ning ","Rong ","Ta ","Gui ","Zhai ","Qiong ","Yu ","Shou ","An ","Tu ","Song ","Wan ","Rou ","Yao ","Hong ","Yi ","Jing ","Zhun ","Mi ","Zhu ","Dang ","Hong ","Zong ","Guan ","Zhou ","Ding ","Wan ","Yi ","Bao ","Shi ","Shi ","Chong ","Shen ","Ke ","Xuan ","Shi ","You ","Huan ","Yi ","Tiao ","Shi ","Xian ","Gong ","Cheng ","Qun ","Gong ","Xiao ","Zai ","Zha ","Bao ","Hai ","Yan ","Xiao ","Jia ","Shen ","Chen ","Rong ","Huang ","Mi ","Kou ","Kuan ","Bin ","Su ","Cai ","Zan ","Ji ","Yuan ","Ji ","Yin ","Mi ","Kou ","Qing ","Que ","Zhen ","Jian ","Fu ","Ning ","Bing ","Huan ","Mei ","Qin ","Han ","Yu ","Shi ","Ning ","Qin ","Ning ","Zhi ","Yu ","Bao ","Kuan ","Ning ","Qin ","Mo ","Cha ","Ju ","Gua ","Qin ","Hu ","Wu ","Liao ","Shi ","Zhu ","Zhai ","Shen ","Wei ","Xie ","Kuan ","Hui ","Liao ","Jun ","Huan ","Yi ","Yi ","Bao ","Qin ","Chong ","Bao ","Feng ","Cun ","Dui ","Si ","Xun ","Dao ","Lu ","Dui ","Shou "],
  "92": ["Po ","Feng ","Zhuan ","Fu ","She ","Ke ","Jiang ","Jiang ","Zhuan ","Wei ","Zun ","Xun ","Shu ","Dui ","Dao ","Xiao ","Ji ","Shao ","Er ","Er ","Er ","Ga ","Jian ","Shu ","Chen ","Shang ","Shang ","Mo ","Ga ","Chang ","Liao ","Xian ","Xian ",null,"Wang ","Wang ","You ","Liao ","Liao ","Yao ","Mang ","Wang ","Wang ","Wang ","Ga ","Yao ","Duo ","Kui ","Zhong ","Jiu ","Gan ","Gu ","Gan ","Tui ","Gan ","Gan ","Shi ","Yin ","Chi ","Kao ","Ni ","Jin ","Wei ","Niao ","Ju ","Pi ","Ceng ","Xi ","Bi ","Ju ","Jie ","Tian ","Qu ","Ti ","Jie ","Wu ","Diao ","Shi ","Shi ","Ping ","Ji ","Xie ","Chen ","Xi ","Ni ","Zhan ","Xi ",null,"Man ","E ","Lou ","Ping ","Ti ","Fei ","Shu ","Xie ","Tu ","Lu ","Lu ","Xi ","Ceng ","Lu ","Ju ","Xie ","Ju ","Jue ","Liao ","Jue ","Shu ","Xi ","Che ","Tun ","Ni ","Shan ",null,"Xian ","Li ","Xue ","Nata ",null,"Long ","Yi ","Qi ","Ren ","Wu ","Han ","Shen ","Yu ","Chu ","Sui ","Qi ",null,"Yue ","Ban ","Yao ","Ang ","Ya ","Wu ","Jie ","E ","Ji ","Qian ","Fen ","Yuan ","Qi ","Cen ","Qian ","Qi ","Cha ","Jie ","Qu ","Gang ","Xian ","Ao ","Lan ","Dao ","Ba ","Zuo ","Zuo ","Yang ","Ju ","Gang ","Ke ","Gou ","Xue ","Bei ","Li ","Tiao ","Ju ","Yan ","Fu ","Xiu ","Jia ","Ling ","Tuo ","Pei ","You ","Dai ","Kuang ","Yue ","Qu ","Hu ","Po ","Min ","An ","Tiao ","Ling ","Chi ","Yuri ","Dong ","Cem ","Kui ","Xiu ","Mao ","Tong ","Xue ","Yi ","Kura ","He ","Ke ","Luo ","E ","Fu ","Xun ","Die ","Lu ","An ","Er ","Gai ","Quan ","Tong ","Yi ","Mu ","Shi ","An ","Wei ","Hu ","Zhi ","Mi ","Li ","Ji ","Tong ","Wei ","You ","Sang ","Xia ","Li ","Yao ","Jiao ","Zheng ","Luan ","Jiao ","E ","E ","Yu ","Ye ","Bu ","Qiao ","Qun ","Feng ","Feng ","Nao ","Li ","You ","Xian ","Hong ","Dao ","Shen ","Cheng ","Tu ","Geng ","Jun ","Hao ","Xia ","Yin ","Yu "],
  "93": ["Lang ","Kan ","Lao ","Lai ","Xian ","Que ","Kong ","Chong ","Chong ","Ta ","Lin ","Hua ","Ju ","Lai ","Qi ","Min ","Kun ","Kun ","Zu ","Gu ","Cui ","Ya ","Ya ","Gang ","Lun ","Lun ","Leng ","Jue ","Duo ","Zheng ","Guo ","Yin ","Dong ","Han ","Zheng ","Wei ","Yao ","Pi ","Yan ","Song ","Jie ","Beng ","Zu ","Jue ","Dong ","Zhan ","Gu ","Yin ",null,"Ze ","Huang ","Yu ","Wei ","Yang ","Feng ","Qiu ","Dun ","Ti ","Yi ","Zhi ","Shi ","Zai ","Yao ","E ","Zhu ","Kan ","Lu ","Yan ","Mei ","Gan ","Ji ","Ji ","Huan ","Ting ","Sheng ","Mei ","Qian ","Wu ","Yu ","Zong ","Lan ","Jue ","Yan ","Yan ","Wei ","Zong ","Cha ","Sui ","Rong ","Yamashina ","Qin ","Yu ","Kewashii ","Lou ","Tu ","Dui ","Xi ","Weng ","Cang ","Dang ","Hong ","Jie ","Ai ","Liu ","Wu ","Song ","Qiao ","Zi ","Wei ","Beng ","Dian ","Cuo ","Qian ","Yong ","Nie ","Cuo ","Ji ",null,"Tao ","Song ","Zong ","Jiang ","Liao ","Kang ","Chan ","Die ","Cen ","Ding ","Tu ","Lou ","Zhang ","Zhan ","Zhan ","Ao ","Cao ","Qu ","Qiang ","Zui ","Zui ","Dao ","Dao ","Xi ","Yu ","Bo ","Long ","Xiang ","Ceng ","Bo ","Qin ","Jiao ","Yan ","Lao ","Zhan ","Lin ","Liao ","Liao ","Jin ","Deng ","Duo ","Zun ","Jiao ","Gui ","Yao ","Qiao ","Yao ","Jue ","Zhan ","Yi ","Xue ","Nao ","Ye ","Ye ","Yi ","E ","Xian ","Ji ","Xie ","Ke ","Xi ","Di ","Ao ","Zui ",null,"Ni ","Rong ","Dao ","Ling ","Za ","Yu ","Yue ","Yin ",null,"Jie ","Li ","Sui ","Long ","Long ","Dian ","Ying ","Xi ","Ju ","Chan ","Ying ","Kui ","Yan ","Wei ","Nao ","Quan ","Chao ","Cuan ","Luan ","Dian ","Dian ",null,"Yan ","Yan ","Yan ","Nao ","Yan ","Chuan ","Gui ","Chuan ","Zhou ","Huang ","Jing ","Xun ","Chao ","Chao ","Lie ","Gong ","Zuo ","Qiao ","Ju ","Gong ","Kek ","Wu ","Pwu ","Pwu ","Chai ","Qiu ","Qiu ","Ji ","Yi ","Si ","Ba ","Zhi ","Zhao ","Xiang ","Yi ","Jin ","Xun ","Juan ","Phas ","Xun ","Jin ","Fu "],
  "94": ["Za ","Bi ","Shi ","Bu ","Ding ","Shuai ","Fan ","Nie ","Shi ","Fen ","Pa ","Zhi ","Xi ","Hu ","Dan ","Wei ","Zhang ","Tang ","Dai ","Ma ","Pei ","Pa ","Tie ","Fu ","Lian ","Zhi ","Zhou ","Bo ","Zhi ","Di ","Mo ","Yi ","Yi ","Ping ","Qia ","Juan ","Ru ","Shuai ","Dai ","Zheng ","Shui ","Qiao ","Zhen ","Shi ","Qun ","Xi ","Bang ","Dai ","Gui ","Chou ","Ping ","Zhang ","Sha ","Wan ","Dai ","Wei ","Chang ","Sha ","Qi ","Ze ","Guo ","Mao ","Du ","Hou ","Zheng ","Xu ","Mi ","Wei ","Wo ","Fu ","Yi ","Bang ","Ping ","Tazuna ","Gong ","Pan ","Huang ","Dao ","Mi ","Jia ","Teng ","Hui ","Zhong ","Shan ","Man ","Mu ","Biao ","Guo ","Ze ","Mu ","Bang ","Zhang ","Jiong ","Chan ","Fu ","Zhi ","Hu ","Fan ","Chuang ","Bi ","Hei ",null,"Mi ","Qiao ","Chan ","Fen ","Meng ","Bang ","Chou ","Mie ","Chu ","Jie ","Xian ","Lan ","Gan ","Ping ","Nian ","Qian ","Bing ","Bing ","Xing ","Gan ","Yao ","Huan ","You ","You ","Ji ","Guang ","Pi ","Ting ","Ze ","Guang ","Zhuang ","Mo ","Qing ","Bi ","Qin ","Dun ","Chuang ","Gui ","Ya ","Bai ","Jie ","Xu ","Lu ","Wu ",null,"Ku ","Ying ","Di ","Pao ","Dian ","Ya ","Miao ","Geng ","Ci ","Fu ","Tong ","Pang ","Fei ","Xiang ","Yi ","Zhi ","Tiao ","Zhi ","Xiu ","Du ","Zuo ","Xiao ","Tu ","Gui ","Ku ","Pang ","Ting ","You ","Bu ","Ding ","Cheng ","Lai ","Bei ","Ji ","An ","Shu ","Kang ","Yong ","Tuo ","Song ","Shu ","Qing ","Yu ","Yu ","Miao ","Sou ","Ce ","Xiang ","Fei ","Jiu ","He ","Hui ","Liu ","Sha ","Lian ","Lang ","Sou ","Jian ","Pou ","Qing ","Jiu ","Jiu ","Qin ","Ao ","Kuo ","Lou ","Yin ","Liao ","Dai ","Lu ","Yi ","Chu ","Chan ","Tu ","Si ","Xin ","Miao ","Chang ","Wu ","Fei ","Guang ","Koc ","Kuai ","Bi ","Qiang ","Xie ","Lin ","Lin ","Liao ","Lu ",null,"Ying ","Xian ","Ting ","Yong ","Li ","Ting ","Yin ","Xun ","Yan ","Ting ","Di ","Po ","Jian ","Hui ","Nai ","Hui ","Gong ","Nian "],
  "95": ["Kai ","Bian ","Yi ","Qi ","Nong ","Fen ","Ju ","Yan ","Yi ","Zang ","Bi ","Yi ","Yi ","Er ","San ","Shi ","Er ","Shi ","Shi ","Gong ","Diao ","Yin ","Hu ","Fu ","Hong ","Wu ","Tui ","Chi ","Jiang ","Ba ","Shen ","Di ","Zhang ","Jue ","Tao ","Fu ","Di ","Mi ","Xian ","Hu ","Chao ","Nu ","Jing ","Zhen ","Yi ","Mi ","Quan ","Wan ","Shao ","Ruo ","Xuan ","Jing ","Dun ","Zhang ","Jiang ","Qiang ","Peng ","Dan ","Qiang ","Bi ","Bi ","She ","Dan ","Jian ","Gou ","Sei ","Fa ","Bi ","Kou ","Nagi ","Bie ","Xiao ","Dan ","Kuo ","Qiang ","Hong ","Mi ","Kuo ","Wan ","Jue ","Ji ","Ji ","Gui ","Dang ","Lu ","Lu ","Tuan ","Hui ","Zhi ","Hui ","Hui ","Yi ","Yi ","Yi ","Yi ","Huo ","Huo ","Shan ","Xing ","Wen ","Tong ","Yan ","Yan ","Yu ","Chi ","Cai ","Biao ","Diao ","Bin ","Peng ","Yong ","Piao ","Zhang ","Ying ","Chi ","Chi ","Zhuo ","Tuo ","Ji ","Pang ","Zhong ","Yi ","Wang ","Che ","Bi ","Chi ","Ling ","Fu ","Wang ","Zheng ","Cu ","Wang ","Jing ","Dai ","Xi ","Xun ","Hen ","Yang ","Huai ","Lu ","Hou ","Wa ","Cheng ","Zhi ","Xu ","Jing ","Tu ","Cong ",null,"Lai ","Cong ","De ","Pai ","Xi ",null,"Qi ","Chang ","Zhi ","Cong ","Zhou ","Lai ","Yu ","Xie ","Jie ","Jian ","Chi ","Jia ","Bian ","Huang ","Fu ","Xun ","Wei ","Pang ","Yao ","Wei ","Xi ","Zheng ","Piao ","Chi ","De ","Zheng ","Zheng ","Bie ","De ","Chong ","Che ","Jiao ","Wei ","Jiao ","Hui ","Mei ","Long ","Xiang ","Bao ","Qu ","Xin ","Shu ","Bi ","Yi ","Le ","Ren ","Dao ","Ding ","Gai ","Ji ","Ren ","Ren ","Chan ","Tan ","Te ","Te ","Gan ","Qi ","Shi ","Cun ","Zhi ","Wang ","Mang ","Xi ","Fan ","Ying ","Tian ","Min ","Min ","Zhong ","Chong ","Wu ","Ji ","Wu ","Xi ","Ye ","You ","Wan ","Cong ","Zhong ","Kuai ","Yu ","Bian ","Zhi ","Qi ","Cui ","Chen ","Tai ","Tun ","Qian ","Nian ","Hun ","Xiong ","Niu ","Wang ","Xian ","Xin ","Kang ","Hu ","Kai ","Fen "],
  "96": ["Huai ","Tai ","Song ","Wu ","Ou ","Chang ","Chuang ","Ju ","Yi ","Bao ","Chao ","Min ","Pei ","Zuo ","Zen ","Yang ","Kou ","Ban ","Nu ","Nao ","Zheng ","Pa ","Bu ","Tie ","Gu ","Hu ","Ju ","Da ","Lian ","Si ","Chou ","Di ","Dai ","Yi ","Tu ","You ","Fu ","Ji ","Peng ","Xing ","Yuan ","Ni ","Guai ","Fu ","Xi ","Bi ","You ","Qie ","Xuan ","Cong ","Bing ","Huang ","Xu ","Chu ","Pi ","Xi ","Xi ","Tan ","Koraeru ","Zong ","Dui ",null,"Ki ","Yi ","Chi ","Ren ","Xun ","Shi ","Xi ","Lao ","Heng ","Kuang ","Mu ","Zhi ","Xie ","Lian ","Tiao ","Huang ","Die ","Hao ","Kong ","Gui ","Heng ","Xi ","Xiao ","Shu ","S ","Kua ","Qiu ","Yang ","Hui ","Hui ","Chi ","Jia ","Yi ","Xiong ","Guai ","Lin ","Hui ","Zi ","Xu ","Chi ","Xiang ","Nu ","Hen ","En ","Ke ","Tong ","Tian ","Gong ","Quan ","Xi ","Qia ","Yue ","Peng ","Ken ","De ","Hui ","E ","Kyuu ","Tong ","Yan ","Kai ","Ce ","Nao ","Yun ","Mang ","Yong ","Yong ","Yuan ","Pi ","Kun ","Qiao ","Yue ","Yu ","Yu ","Jie ","Xi ","Zhe ","Lin ","Ti ","Han ","Hao ","Qie ","Ti ","Bu ","Yi ","Qian ","Hui ","Xi ","Bei ","Man ","Yi ","Heng ","Song ","Quan ","Cheng ","Hui ","Wu ","Wu ","You ","Li ","Liang ","Huan ","Cong ","Yi ","Yue ","Li ","Nin ","Nao ","E ","Que ","Xuan ","Qian ","Wu ","Min ","Cong ","Fei ","Bei ","Duo ","Cui ","Chang ","Men ","Li ","Ji ","Guan ","Guan ","Xing ","Dao ","Qi ","Kong ","Tian ","Lun ","Xi ","Kan ","Kun ","Ni ","Qing ","Chou ","Dun ","Guo ","Chan ","Liang ","Wan ","Yuan ","Jin ","Ji ","Lin ","Yu ","Huo ","He ","Quan ","Tan ","Ti ","Ti ","Nie ","Wang ","Chuo ","Bu ","Hun ","Xi ","Tang ","Xin ","Wei ","Hui ","E ","Rui ","Zong ","Jian ","Yong ","Dian ","Ju ","Can ","Cheng ","De ","Bei ","Qie ","Can ","Dan ","Guan ","Duo ","Nao ","Yun ","Xiang ","Zhui ","Die ","Huang ","Chun ","Qiong ","Re ","Xing ","Ce ","Bian ","Hun ","Zong ","Ti "],
  "97": ["Qiao ","Chou ","Bei ","Xuan ","Wei ","Ge ","Qian ","Wei ","Yu ","Yu ","Bi ","Xuan ","Huan ","Min ","Bi ","Yi ","Mian ","Yong ","Kai ","Dang ","Yin ","E ","Chen ","Mou ","Ke ","Ke ","Yu ","Ai ","Qie ","Yan ","Nuo ","Gan ","Yun ","Zong ","Sai ","Leng ","Fen ",null,"Kui ","Kui ","Que ","Gong ","Yun ","Su ","Su ","Qi ","Yao ","Song ","Huang ","Ji ","Gu ","Ju ","Chuang ","Ni ","Xie ","Kai ","Zheng ","Yong ","Cao ","Sun ","Shen ","Bo ","Kai ","Yuan ","Xie ","Hun ","Yong ","Yang ","Li ","Sao ","Tao ","Yin ","Ci ","Xu ","Qian ","Tai ","Huang ","Yun ","Shen ","Ming ",null,"She ","Cong ","Piao ","Mo ","Mu ","Guo ","Chi ","Can ","Can ","Can ","Cui ","Min ","Te ","Zhang ","Tong ","Ao ","Shuang ","Man ","Guan ","Que ","Zao ","Jiu ","Hui ","Kai ","Lian ","Ou ","Song ","Jin ","Yin ","Lu ","Shang ","Wei ","Tuan ","Man ","Qian ","She ","Yong ","Qing ","Kang ","Di ","Zhi ","Lou ","Juan ","Qi ","Qi ","Yu ","Ping ","Liao ","Cong ","You ","Chong ","Zhi ","Tong ","Cheng ","Qi ","Qu ","Peng ","Bei ","Bie ","Chun ","Jiao ","Zeng ","Chi ","Lian ","Ping ","Kui ","Hui ","Qiao ","Cheng ","Yin ","Yin ","Xi ","Xi ","Dan ","Tan ","Duo ","Dui ","Dui ","Su ","Jue ","Ce ","Xiao ","Fan ","Fen ","Lao ","Lao ","Chong ","Han ","Qi ","Xian ","Min ","Jing ","Liao ","Wu ","Can ","Jue ","Cu ","Xian ","Tan ","Sheng ","Pi ","Yi ","Chu ","Xian ","Nao ","Dan ","Tan ","Jing ","Song ","Han ","Jiao ","Wai ","Huan ","Dong ","Qin ","Qin ","Qu ","Cao ","Ken ","Xie ","Ying ","Ao ","Mao ","Yi ","Lin ","Se ","Jun ","Huai ","Men ","Lan ","Ai ","Lin ","Yan ","Gua ","Xia ","Chi ","Yu ","Yin ","Dai ","Meng ","Ai ","Meng ","Dui ","Qi ","Mo ","Lan ","Men ","Chou ","Zhi ","Nuo ","Nuo ","Yan ","Yang ","Bo ","Zhi ","Kuang ","Kuang ","You ","Fu ","Liu ","Mie ","Cheng ",null,"Chan ","Meng ","Lan ","Huai ","Xuan ","Rang ","Chan ","Ji ","Ju ","Huan ","She ","Yi "],
  "98": ["Lian ","Nan ","Mi ","Tang ","Jue ","Gang ","Gang ","Gang ","Ge ","Yue ","Wu ","Jian ","Xu ","Shu ","Rong ","Xi ","Cheng ","Wo ","Jie ","Ge ","Jian ","Qiang ","Huo ","Qiang ","Zhan ","Dong ","Qi ","Jia ","Die ","Zei ","Jia ","Ji ","Shi ","Kan ","Ji ","Kui ","Gai ","Deng ","Zhan ","Chuang ","Ge ","Jian ","Jie ","Yu ","Jian ","Yan ","Lu ","Xi ","Zhan ","Xi ","Xi ","Chuo ","Dai ","Qu ","Hu ","Hu ","Hu ","E ","Shi ","Li ","Mao ","Hu ","Li ","Fang ","Suo ","Bian ","Dian ","Jiong ","Shang ","Yi ","Yi ","Shan ","Hu ","Fei ","Yan ","Shou ","T ","Cai ","Zha ","Qiu ","Le ","Bu ","Ba ","Da ","Reng ","Fu ","Hameru ","Zai ","Tuo ","Zhang ","Diao ","Kang ","Yu ","Ku ","Han ","Shen ","Cha ","Yi ","Gu ","Kou ","Wu ","Tuo ","Qian ","Zhi ","Ren ","Kuo ","Men ","Sao ","Yang ","Niu ","Ban ","Che ","Rao ","Xi ","Qian ","Ban ","Jia ","Yu ","Fu ","Ao ","Xi ","Pi ","Zhi ","Zi ","E ","Dun ","Zhao ","Cheng ","Ji ","Yan ","Kuang ","Bian ","Chao ","Ju ","Wen ","Hu ","Yue ","Jue ","Ba ","Qin ","Zhen ","Zheng ","Yun ","Wan ","Nu ","Yi ","Shu ","Zhua ","Pou ","Tou ","Dou ","Kang ","Zhe ","Pou ","Fu ","Pao ","Ba ","Ao ","Ze ","Tuan ","Kou ","Lun ","Qiang ",null,"Hu ","Bao ","Bing ","Zhi ","Peng ","Tan ","Pu ","Pi ","Tai ","Yao ","Zhen ","Zha ","Yang ","Bao ","He ","Ni ","Yi ","Di ","Chi ","Pi ","Za ","Mo ","Mo ","Shen ","Ya ","Chou ","Qu ","Min ","Chu ","Jia ","Fu ","Zhan ","Zhu ","Dan ","Chai ","Mu ","Nian ","La ","Fu ","Pao ","Ban ","Pai ","Ling ","Na ","Guai ","Qian ","Ju ","Tuo ","Ba ","Tuo ","Tuo ","Ao ","Ju ","Zhuo ","Pan ","Zhao ","Bai ","Bai ","Di ","Ni ","Ju ","Kuo ","Long ","Jian ",null,"Yong ","Lan ","Ning ","Bo ","Ze ","Qian ","Hen ","Gua ","Shi ","Jie ","Zheng ","Nin ","Gong ","Gong ","Quan ","Shuan ","Cun ","Zan ","Kao ","Chi ","Xie ","Ce ","Hui ","Pin ","Zhuai ","Shi ","Na "],
  "99": ["Bo ","Chi ","Gua ","Zhi ","Kuo ","Duo ","Duo ","Zhi ","Qie ","An ","Nong ","Zhen ","Ge ","Jiao ","Ku ","Dong ","Ru ","Tiao ","Lie ","Zha ","Lu ","Die ","Wa ","Jue ","Mushiru ","Ju ","Zhi ","Luan ","Ya ","Zhua ","Ta ","Xie ","Nao ","Dang ","Jiao ","Zheng ","Ji ","Hui ","Xun ","Ku ","Ai ","Tuo ","Nuo ","Cuo ","Bo ","Geng ","Ti ","Zhen ","Cheng ","Suo ","Suo ","Keng ","Mei ","Long ","Ju ","Peng ","Jian ","Yi ","Ting ","Shan ","Nuo ","Wan ","Xie ","Cha ","Feng ","Jiao ","Wu ","Jun ","Jiu ","Tong ","Kun ","Huo ","Tu ","Zhuo ","Pou ","Le ","Ba ","Han ","Shao ","Nie ","Juan ","Ze ","Song ","Ye ","Jue ","Bu ","Huan ","Bu ","Zun ","Yi ","Zhai ","Lu ","Sou ","Tuo ","Lao ","Sun ","Bang ","Jian ","Huan ","Dao ",null,"Wan ","Qin ","Peng ","She ","Lie ","Min ","Men ","Fu ","Bai ","Ju ","Dao ","Wo ","Ai ","Juan ","Yue ","Zong ","Chen ","Chui ","Jie ","Tu ","Ben ","Na ","Nian ","Nuo ","Zu ","Wo ","Xi ","Xian ","Cheng ","Dian ","Sao ","Lun ","Qing ","Gang ","Duo ","Shou ","Diao ","Pou ","Di ","Zhang ","Gun ","Ji ","Tao ","Qia ","Qi ","Pai ","Shu ","Qian ","Ling ","Yi ","Ya ","Jue ","Zheng ","Liang ","Gua ","Yi ","Huo ","Shan ","Zheng ","Lue ","Cai ","Tan ","Che ","Bing ","Jie ","Ti ","Kong ","Tui ","Yan ","Cuo ","Zou ","Ju ","Tian ","Qian ","Ken ","Bai ","Shou ","Jie ","Lu ","Guo ","Haba ",null,"Zhi ","Dan ","Mang ","Xian ","Sao ","Guan ","Peng ","Yuan ","Nuo ","Jian ","Zhen ","Jiu ","Jian ","Yu ","Yan ","Kui ","Nan ","Hong ","Rou ","Pi ","Wei ","Sai ","Zou ","Xuan ","Miao ","Ti ","Nie ","Cha ","Shi ","Zong ","Zhen ","Yi ","Shun ","Heng ","Bian ","Yang ","Huan ","Yan ","Zuan ","An ","Xu ","Ya ","Wo ","Ke ","Chuai ","Ji ","Ti ","La ","La ","Cheng ","Kai ","Jiu ","Jiu ","Tu ","Jie ","Hui ","Geng ","Chong ","Shuo ","She ","Xie ","Yuan ","Qian ","Ye ","Cha ","Zha ","Bei ","Yao ",null,null,"Lan ","Wen ","Qin "],
  "100": ["Chan ","Ge ","Lou ","Zong ","Geng ","Jiao ","Gou ","Qin ","Yong ","Que ","Chou ","Chi ","Zhan ","Sun ","Sun ","Bo ","Chu ","Rong ","Beng ","Cuo ","Sao ","Ke ","Yao ","Dao ","Zhi ","Nu ","Xie ","Jian ","Sou ","Qiu ","Gao ","Xian ","Shuo ","Sang ","Jin ","Mie ","E ","Chui ","Nuo ","Shan ","Ta ","Jie ","Tang ","Pan ","Ban ","Da ","Li ","Tao ","Hu ","Zhi ","Wa ","Xia ","Qian ","Wen ","Qiang ","Tian ","Zhen ","E ","Xi ","Nuo ","Quan ","Cha ","Zha ","Ge ","Wu ","En ","She ","Kang ","She ","Shu ","Bai ","Yao ","Bin ","Sou ","Tan ","Sa ","Chan ","Suo ","Liao ","Chong ","Chuang ","Guo ","Bing ","Feng ","Shuai ","Di ","Qi ","Sou ","Zhai ","Lian ","Tang ","Chi ","Guan ","Lu ","Luo ","Lou ","Zong ","Gai ","Hu ","Zha ","Chuang ","Tang ","Hua ","Cui ","Nai ","Mo ","Jiang ","Gui ","Ying ","Zhi ","Ao ","Zhi ","Nie ","Man ","Shan ","Kou ","Shu ","Suo ","Tuan ","Jiao ","Mo ","Mo ","Zhe ","Xian ","Keng ","Piao ","Jiang ","Yin ","Gou ","Qian ","Lue ","Ji ","Ying ","Jue ","Pie ","Pie ","Lao ","Dun ","Xian ","Ruan ","Kui ","Zan ","Yi ","Xun ","Cheng ","Cheng ","Sa ","Nao ","Heng ","Si ","Qian ","Huang ","Da ","Zun ","Nian ","Lin ","Zheng ","Hui ","Zhuang ","Jiao ","Ji ","Cao ","Dan ","Dan ","Che ","Bo ","Che ","Jue ","Xiao ","Liao ","Ben ","Fu ","Qiao ","Bo ","Cuo ","Zhuo ","Zhuan ","Tuo ","Pu ","Qin ","Dun ","Nian ",null,"Xie ","Lu ","Jiao ","Cuan ","Ta ","Han ","Qiao ","Zhua ","Jian ","Gan ","Yong ","Lei ","Kuo ","Lu ","Shan ","Zhuo ","Ze ","Pu ","Chuo ","Ji ","Dang ","Suo ","Cao ","Qing ","Jing ","Huan ","Jie ","Qin ","Kuai ","Dan ","Xi ","Ge ","Pi ","Bo ","Ao ","Ju ","Ye ",null,"Mang ","Sou ","Mi ","Ji ","Tai ","Zhuo ","Dao ","Xing ","Lan ","Ca ","Ju ","Ye ","Ru ","Ye ","Ye ","Ni ","Hu ","Ji ","Bin ","Ning ","Ge ","Zhi ","Jie ","Kuo ","Mo ","Jian ","Xie ","Lie ","Tan ","Bai ","Sou ","Lu ","Lue ","Rao ","Zhi "],
  "101": ["Pan ","Yang ","Lei ","Sa ","Shu ","Zan ","Nian ","Xian ","Jun ","Huo ","Li ","La ","Han ","Ying ","Lu ","Long ","Qian ","Qian ","Zan ","Qian ","Lan ","San ","Ying ","Mei ","Rang ","Chan ",null,"Cuan ","Xi ","She ","Luo ","Jun ","Mi ","Li ","Zan ","Luan ","Tan ","Zuan ","Li ","Dian ","Wa ","Dang ","Jiao ","Jue ","Lan ","Li ","Nang ","Zhi ","Gui ","Gui ","Qi ","Xin ","Pu ","Sui ","Shou ","Kao ","You ","Gai ","Yi ","Gong ","Gan ","Ban ","Fang ","Zheng ","Bo ","Dian ","Kou ","Min ","Wu ","Gu ","He ","Ce ","Xiao ","Mi ","Chu ","Ge ","Di ","Xu ","Jiao ","Min ","Chen ","Jiu ","Zhen ","Duo ","Yu ","Chi ","Ao ","Bai ","Xu ","Jiao ","Duo ","Lian ","Nie ","Bi ","Chang ","Dian ","Duo ","Yi ","Gan ","San ","Ke ","Yan ","Dun ","Qi ","Dou ","Xiao ","Duo ","Jiao ","Jing ","Yang ","Xia ","Min ","Shu ","Ai ","Qiao ","Ai ","Zheng ","Di ","Zhen ","Fu ","Shu ","Liao ","Qu ","Xiong ","Xi ","Jiao ","Sen ","Jiao ","Zhuo ","Yi ","Lian ","Bi ","Li ","Xiao ","Xiao ","Wen ","Xue ","Qi ","Qi ","Zhai ","Bin ","Jue ","Zhai ",null,"Fei ","Ban ","Ban ","Lan ","Yu ","Lan ","Wei ","Dou ","Sheng ","Liao ","Jia ","Hu ","Xie ","Jia ","Yu ","Zhen ","Jiao ","Wo ","Tou ","Chu ","Jin ","Chi ","Yin ","Fu ","Qiang ","Zhan ","Qu ","Zhuo ","Zhan ","Duan ","Zhuo ","Si ","Xin ","Zhuo ","Zhuo ","Qin ","Lin ","Zhuo ","Chu ","Duan ","Zhu ","Fang ","Xie ","Hang ","Yu ","Shi ","Pei ","You ","Mye ","Pang ","Qi ","Zhan ","Mao ","Lu ","Pei ","Pi ","Liu ","Fu ","Fang ","Xuan ","Jing ","Jing ","Ni ","Zu ","Zhao ","Yi ","Liu ","Shao ","Jian ","Es ","Yi ","Qi ","Zhi ","Fan ","Piao ","Fan ","Zhan ","Guai ","Sui ","Yu ","Wu ","Ji ","Ji ","Ji ","Huo ","Ri ","Dan ","Jiu ","Zhi ","Zao ","Xie ","Tiao ","Xun ","Xu ","Xu ","Xu ","Gan ","Han ","Tai ","Di ","Xu ","Chan ","Shi ","Kuang ","Yang ","Shi ","Wang ","Min ","Min ","Tun ","Chun ","Wu "],
  "102": ["Yun ","Bei ","Ang ","Ze ","Ban ","Jie ","Kun ","Sheng ","Hu ","Fang ","Hao ","Gui ","Chang ","Xuan ","Ming ","Hun ","Fen ","Qin ","Hu ","Yi ","Xi ","Xin ","Yan ","Ze ","Fang ","Tan ","Shen ","Ju ","Yang ","Zan ","Bing ","Xing ","Ying ","Xuan ","Pei ","Zhen ","Ling ","Chun ","Hao ","Mei ","Zuo ","Mo ","Bian ","Xu ","Hun ","Zhao ","Zong ","Shi ","Shi ","Yu ","Fei ","Die ","Mao ","Ni ","Chang ","Wen ","Dong ","Ai ","Bing ","Ang ","Zhou ","Long ","Xian ","Kuang ","Tiao ","Chao ","Shi ","Huang ","Huang ","Xuan ","Kui ","Xu ","Jiao ","Jin ","Zhi ","Jin ","Shang ","Tong ","Hong ","Yan ","Gai ","Xiang ","Shai ","Xiao ","Ye ","Yun ","Hui ","Han ","Han ","Jun ","Wan ","Xian ","Kun ","Zhou ","Xi ","Cheng ","Sheng ","Bu ","Zhe ","Zhe ","Wu ","Han ","Hui ","Hao ","Chen ","Wan ","Tian ","Zhuo ","Zui ","Zhou ","Pu ","Jing ","Xi ","Shan ","Yi ","Xi ","Qing ","Qi ","Jing ","Gui ","Zhen ","Yi ","Zhi ","An ","Wan ","Lin ","Liang ","Chang ","Wang ","Xiao ","Zan ","Hi ","Xuan ","Xuan ","Yi ","Xia ","Yun ","Hui ","Fu ","Min ","Kui ","He ","Ying ","Du ","Wei ","Shu ","Qing ","Mao ","Nan ","Jian ","Nuan ","An ","Yang ","Chun ","Yao ","Suo ","Jin ","Ming ","Jiao ","Kai ","Gao ","Weng ","Chang ","Qi ","Hao ","Yan ","Li ","Ai ","Ji ","Gui ","Men ","Zan ","Xie ","Hao ","Mu ","Mo ","Cong ","Ni ","Zhang ","Hui ","Bao ","Han ","Xuan ","Chuan ","Liao ","Xian ","Dan ","Jing ","Pie ","Lin ","Tun ","Xi ","Yi ","Ji ","Huang ","Tai ","Ye ","Ye ","Li ","Tan ","Tong ","Xiao ","Fei ","Qin ","Zhao ","Hao ","Yi ","Xiang ","Xing ","Sen ","Jiao ","Bao ","Jing ","Yian ","Ai ","Ye ","Ru ","Shu ","Meng ","Xun ","Yao ","Pu ","Li ","Chen ","Kuang ","Die ",null,"Yan ","Huo ","Lu ","Xi ","Rong ","Long ","Nang ","Luo ","Luan ","Shai ","Tang ","Yan ","Chu ","Yue ","Yue ","Qu ","Yi ","Geng ","Ye ","Hu ","He ","Shu ","Cao ","Cao ","Noboru ","Man ","Ceng ","Ceng ","Ti "],
  "103": ["Zui ","Can ","Xu ","Hui ","Yin ","Qie ","Fen ","Pi ","Yue ","You ","Ruan ","Peng ","Ban ","Fu ","Ling ","Fei ","Qu ",null,"Nu ","Tiao ","Shuo ","Zhen ","Lang ","Lang ","Juan ","Ming ","Huang ","Wang ","Tun ","Zhao ","Ji ","Qi ","Ying ","Zong ","Wang ","Tong ","Lang ",null,"Meng ","Long ","Mu ","Deng ","Wei ","Mo ","Ben ","Zha ","Zhu ","Zhu ",null,"Zhu ","Ren ","Ba ","Po ","Duo ","Duo ","Dao ","Li ","Qiu ","Ji ","Jiu ","Bi ","Xiu ","Ting ","Ci ","Sha ","Eburi ","Za ","Quan ","Qian ","Yu ","Gan ","Wu ","Cha ","Shan ","Xun ","Fan ","Wu ","Zi ","Li ","Xing ","Cai ","Cun ","Ren ","Shao ","Tuo ","Di ","Zhang ","Mang ","Chi ","Yi ","Gu ","Gong ","Du ","Yi ","Qi ","Shu ","Gang ","Tiao ","Moku ","Soma ","Tochi ","Lai ","Sugi ","Mang ","Yang ","Ma ","Miao ","Si ","Yuan ","Hang ","Fei ","Bei ","Jie ","Dong ","Gao ","Yao ","Xian ","Chu ","Qun ","Pa ","Shu ","Hua ","Xin ","Chou ","Zhu ","Chou ","Song ","Ban ","Song ","Ji ","Yue ","Jin ","Gou ","Ji ","Mao ","Pi ","Bi ","Wang ","Ang ","Fang ","Fen ","Yi ","Fu ","Nan ","Xi ","Hu ","Ya ","Dou ","Xun ","Zhen ","Yao ","Lin ","Rui ","E ","Mei ","Zhao ","Guo ","Zhi ","Cong ","Yun ","Waku ","Dou ","Shu ","Zao ",null,"Li ","Haze ","Jian ","Cheng ","Matsu ","Qiang ","Feng ","Nan ","Xiao ","Xian ","Ku ","Ping ","Yi ","Xi ","Zhi ","Guai ","Xiao ","Jia ","Jia ","Gou ","Fu ","Mo ","Yi ","Ye ","Ye ","Shi ","Nie ","Bi ","Duo ","Yi ","Ling ","Bing ","Ni ","La ","He ","Pan ","Fan ","Zhong ","Dai ","Ci ","Yang ","Fu ","Bo ","Mou ","Gan ","Qi ","Ran ","Rou ","Mao ","Zhao ","Song ","Zhe ","Xia ","You ","Shen ","Ju ","Tuo ","Zuo ","Nan ","Ning ","Yong ","Di ","Zhi ","Zha ","Cha ","Dan ","Gu ","Pu ","Jiu ","Ao ","Fu ","Jian ","Bo ","Duo ","Ke ","Nai ","Zhu ","Bi ","Liu ","Chai ","Zha ","Si ","Zhu ","Pei ","Shi ","Guai ","Cha ","Yao ","Jue ","Jiu ","Shi "],
  "104": ["Zhi ","Liu ","Mei ","Hoy ","Rong ","Zha ",null,"Biao ","Zhan ","Jie ","Long ","Dong ","Lu ","Sayng ","Li ","Lan ","Yong ","Shu ","Xun ","Shuan ","Qi ","Zhen ","Qi ","Li ","Yi ","Xiang ","Zhen ","Li ","Su ","Gua ","Kan ","Bing ","Ren ","Xiao ","Bo ","Ren ","Bing ","Zi ","Chou ","Yi ","Jie ","Xu ","Zhu ","Jian ","Zui ","Er ","Er ","You ","Fa ","Gong ","Kao ","Lao ","Zhan ","Li ","Yin ","Yang ","He ","Gen ","Zhi ","Chi ","Ge ","Zai ","Luan ","Fu ","Jie ","Hang ","Gui ","Tao ","Guang ","Wei ","Kuang ","Ru ","An ","An ","Juan ","Yi ","Zhuo ","Ku ","Zhi ","Qiong ","Tong ","Sang ","Sang ","Huan ","Jie ","Jiu ","Xue ","Duo ","Zhui ","Yu ","Zan ","Kasei ","Ying ","Masu ",null,"Zhan ","Ya ","Nao ","Zhen ","Dang ","Qi ","Qiao ","Hua ","Kuai ","Jiang ","Zhuang ","Xun ","Suo ","Sha ","Zhen ","Bei ","Ting ","Gua ","Jing ","Bo ","Ben ","Fu ","Rui ","Tong ","Jue ","Xi ","Lang ","Liu ","Feng ","Qi ","Wen ","Jun ","Gan ","Cu ","Liang ","Qiu ","Ting ","You ","Mei ","Bang ","Long ","Peng ","Zhuang ","Di ","Xuan ","Tu ","Zao ","Ao ","Gu ","Bi ","Di ","Han ","Zi ","Zhi ","Ren ","Bei ","Geng ","Jian ","Huan ","Wan ","Nuo ","Jia ","Tiao ","Ji ","Xiao ","Lu ","Huan ","Shao ","Cen ","Fen ","Song ","Meng ","Wu ","Li ","Li ","Dou ","Cen ","Ying ","Suo ","Ju ","Ti ","Jie ","Kun ","Zhuo ","Shu ","Chan ","Fan ","Wei ","Jing ","Li ","Bing ","Fumoto ","Shikimi ","Tao ","Zhi ","Lai ","Lian ","Jian ","Zhuo ","Ling ","Li ","Qi ","Bing ","Zhun ","Cong ","Qian ","Mian ","Qi ","Qi ","Cai ","Gun ","Chan ","Te ","Fei ","Pai ","Bang ","Pou ","Hun ","Zong ","Cheng ","Zao ","Ji ","Li ","Peng ","Yu ","Yu ","Gu ","Hun ","Dong ","Tang ","Gang ","Wang ","Di ","Xi ","Fan ","Cheng ","Zhan ","Qi ","Yuan ","Yan ","Yu ","Quan ","Yi ","Sen ","Ren ","Chui ","Leng ","Qi ","Zhuo ","Fu ","Ke ","Lai ","Zou ","Zou ","Zhuo ","Guan ","Fen ","Fen ","Chen ","Qiong ","Nie "],
  "105": ["Wan ","Guo ","Lu ","Hao ","Jie ","Yi ","Chou ","Ju ","Ju ","Cheng ","Zuo ","Liang ","Qiang ","Zhi ","Zhui ","Ya ","Ju ","Bei ","Jiao ","Zhuo ","Zi ","Bin ","Peng ","Ding ","Chu ","Chang ","Kunugi ","Momiji ","Jian ","Gui ","Xi ","Du ","Qian ","Kunugi ","Soko ","Shide ","Luo ","Zhi ","Ken ","Myeng ","Tafu ",null,"Peng ","Zhan ",null,"Tuo ","Sen ","Duo ","Ye ","Fou ","Wei ","Wei ","Duan ","Jia ","Zong ","Jian ","Yi ","Shen ","Xi ","Yan ","Yan ","Chuan ","Zhan ","Chun ","Yu ","He ","Zha ","Wo ","Pian ","Bi ","Yao ","Huo ","Xu ","Ruo ","Yang ","La ","Yan ","Ben ","Hun ","Kui ","Jie ","Kui ","Si ","Feng ","Xie ","Tuo ","Zhi ","Jian ","Mu ","Mao ","Chu ","Hu ","Hu ","Lian ","Leng ","Ting ","Nan ","Yu ","You ","Mei ","Song ","Xuan ","Xuan ","Ying ","Zhen ","Pian ","Ye ","Ji ","Jie ","Ye ","Chu ","Shun ","Yu ","Cou ","Wei ","Mei ","Di ","Ji ","Jie ","Kai ","Qiu ","Ying ","Rou ","Heng ","Lou ","Le ","Hazou ","Katsura ","Pin ","Muro ","Gai ","Tan ","Lan ","Yun ","Yu ","Chen ","Lu ","Ju ","Sakaki ",null,"Pi ","Xie ","Jia ","Yi ","Zhan ","Fu ","Nai ","Mi ","Lang ","Rong ","Gu ","Jian ","Ju ","Ta ","Yao ","Zhen ","Bang ","Sha ","Yuan ","Zi ","Ming ","Su ","Jia ","Yao ","Jie ","Huang ","Gan ","Fei ","Zha ","Qian ","Ma ","Sun ","Yuan ","Xie ","Rong ","Shi ","Zhi ","Cui ","Yun ","Ting ","Liu ","Rong ","Tang ","Que ","Zhai ","Si ","Sheng ","Ta ","Ke ","Xi ","Gu ","Qi ","Kao ","Gao ","Sun ","Pan ","Tao ","Ge ","Xun ","Dian ","Nou ","Ji ","Shuo ","Gou ","Chui ","Qiang ","Cha ","Qian ","Huai ","Mei ","Xu ","Gang ","Gao ","Zhuo ","Tuo ","Hashi ","Yang ","Dian ","Jia ","Jian ","Zui ","Kashi ","Ori ","Bin ","Zhu ",null,"Xi ","Qi ","Lian ","Hui ","Yong ","Qian ","Guo ","Gai ","Gai ","Tuan ","Hua ","Cu ","Sen ","Cui ","Beng ","You ","Hu ","Jiang ","Hu ","Huan ","Kui ","Yi ","Nie ","Gao ","Kang ","Gui ","Gui ","Cao ","Man ","Jin "],
  "106": ["Di ","Zhuang ","Le ","Lang ","Chen ","Cong ","Li ","Xiu ","Qing ","Shuang ","Fan ","Tong ","Guan ","Ji ","Suo ","Lei ","Lu ","Liang ","Mi ","Lou ","Chao ","Su ","Ke ","Shu ","Tang ","Biao ","Lu ","Jiu ","Shu ","Zha ","Shu ","Zhang ","Men ","Mo ","Niao ","Yang ","Tiao ","Peng ","Zhu ","Sha ","Xi ","Quan ","Heng ","Jian ","Cong ",null,"Hokuso ","Qiang ","Tara ","Ying ","Er ","Xin ","Zhi ","Qiao ","Zui ","Cong ","Pu ","Shu ","Hua ","Kui ","Zhen ","Zun ","Yue ","Zhan ","Xi ","Xun ","Dian ","Fa ","Gan ","Mo ","Wu ","Qiao ","Nao ","Lin ","Liu ","Qiao ","Xian ","Run ","Fan ","Zhan ","Tuo ","Lao ","Yun ","Shun ","Tui ","Cheng ","Tang ","Meng ","Ju ","Cheng ","Su ","Jue ","Jue ","Tan ","Hui ","Ji ","Nuo ","Xiang ","Tuo ","Ning ","Rui ","Zhu ","Chuang ","Zeng ","Fen ","Qiong ","Ran ","Heng ","Cen ","Gu ","Liu ","Lao ","Gao ","Chu ","Zusa ","Nude ","Ca ","San ","Ji ","Dou ","Shou ","Lu ",null,null,"Yuan ","Ta ","Shu ","Jiang ","Tan ","Lin ","Nong ","Yin ","Xi ","Sui ","Shan ","Zui ","Xuan ","Cheng ","Gan ","Ju ","Zui ","Yi ","Qin ","Pu ","Yan ","Lei ","Feng ","Hui ","Dang ","Ji ","Sui ","Bo ","Bi ","Ding ","Chu ","Zhua ","Kuai ","Ji ","Jie ","Jia ","Qing ","Zhe ","Jian ","Qiang ","Dao ","Yi ","Biao ","Song ","She ","Lin ","Kunugi ","Cha ","Meng ","Yin ","Tao ","Tai ","Mian ","Qi ","Toan ","Bin ","Huo ","Ji ","Qian ","Mi ","Ning ","Yi ","Gao ","Jian ","Yin ","Er ","Qing ","Yan ","Qi ","Mi ","Zhao ","Gui ","Chun ","Ji ","Kui ","Po ","Deng ","Chu ",null,"Mian ","You ","Zhi ","Guang ","Qian ","Lei ","Lei ","Sa ","Lu ","Li ","Cuan ","Lu ","Mie ","Hui ","Ou ","Lu ","Jie ","Gao ","Du ","Yuan ","Li ","Fei ","Zhuo ","Sou ","Lian ","Tamo ","Chu ",null,"Zhu ","Lu ","Yan ","Li ","Zhu ","Chen ","Jie ","E ","Su ","Huai ","Nie ","Yu ","Long ","Lai ",null,"Xian ","Kwi ","Ju ","Xiao ","Ling ","Ying ","Jian ","Yin ","You ","Ying "],
  "107": ["Xiang ","Nong ","Bo ","Chan ","Lan ","Ju ","Shuang ","She ","Wei ","Cong ","Quan ","Qu ","Cang ",null,"Yu ","Luo ","Li ","Zan ","Luan ","Dang ","Jue ","Em ","Lan ","Lan ","Zhu ","Lei ","Li ","Ba ","Nang ","Yu ","Ling ","Tsuki ","Qian ","Ci ","Huan ","Xin ","Yu ","Yu ","Qian ","Ou ","Xu ","Chao ","Chu ","Chi ","Kai ","Yi ","Jue ","Xi ","Xu ","Xia ","Yu ","Kuai ","Lang ","Kuan ","Shuo ","Xi ","Ai ","Yi ","Qi ","Hu ","Chi ","Qin ","Kuan ","Kan ","Kuan ","Kan ","Chuan ","Sha ","Gua ","Yin ","Xin ","Xie ","Yu ","Qian ","Xiao ","Yi ","Ge ","Wu ","Tan ","Jin ","Ou ","Hu ","Ti ","Huan ","Xu ","Pen ","Xi ","Xiao ","Xu ","Xi ","Sen ","Lian ","Chu ","Yi ","Kan ","Yu ","Chuo ","Huan ","Zhi ","Zheng ","Ci ","Bu ","Wu ","Qi ","Bu ","Bu ","Wai ","Ju ","Qian ","Chi ","Se ","Chi ","Se ","Zhong ","Sui ","Sui ","Li ","Cuo ","Yu ","Li ","Gui ","Dai ","Dai ","Si ","Jian ","Zhe ","Mo ","Mo ","Yao ","Mo ","Cu ","Yang ","Tian ","Sheng ","Dai ","Shang ","Xu ","Xun ","Shu ","Can ","Jue ","Piao ","Qia ","Qiu ","Su ","Qing ","Yun ","Lian ","Yi ","Fou ","Zhi ","Ye ","Can ","Hun ","Dan ","Ji ","Ye ","Zhen ","Yun ","Wen ","Chou ","Bin ","Ti ","Jin ","Shang ","Yin ","Diao ","Cu ","Hui ","Cuan ","Yi ","Dan ","Du ","Jiang ","Lian ","Bin ","Du ","Tsukusu ","Jian ","Shu ","Ou ","Duan ","Zhu ","Yin ","Qing ","Yi ","Sha ","Que ","Ke ","Yao ","Jun ","Dian ","Hui ","Hui ","Gu ","Que ","Ji ","Yi ","Ou ","Hui ","Duan ","Yi ","Xiao ","Wu ","Guan ","Mu ","Mei ","Mei ","Ai ","Zuo ","Du ","Yu ","Bi ","Bi ","Bi ","Pi ","Pi ","Bi ","Chan ","Mao ",null,null,"Pu ","Mushiru ","Jia ","Zhan ","Sai ","Mu ","Tuo ","Xun ","Er ","Rong ","Xian ","Ju ","Mu ","Hao ","Qiu ","Dou ","Mushiru ","Tan ","Pei ","Ju ","Duo ","Cui ","Bi ","San ",null,"Mao ","Sui ","Yu ","Yu ","Tuo ","He ","Jian ","Ta ","San "],
  "108": ["Lu ","Mu ","Li ","Tong ","Rong ","Chang ","Pu ","Luo ","Zhan ","Sao ","Zhan ","Meng ","Luo ","Qu ","Die ","Shi ","Di ","Min ","Jue ","Mang ","Qi ","Pie ","Nai ","Qi ","Dao ","Xian ","Chuan ","Fen ","Ri ","Nei ",null,"Fu ","Shen ","Dong ","Qing ","Qi ","Yin ","Xi ","Hai ","Yang ","An ","Ya ","Ke ","Qing ","Ya ","Dong ","Dan ","Lu ","Qing ","Yang ","Yun ","Yun ","Shui ","San ","Zheng ","Bing ","Yong ","Dang ","Shitamizu ","Le ","Ni ","Tun ","Fan ","Gui ","Ting ","Zhi ","Qiu ","Bin ","Ze ","Mian ","Cuan ","Hui ","Diao ","Han ","Cha ","Zhuo ","Chuan ","Wan ","Fan ","Dai ","Xi ","Tuo ","Mang ","Qiu ","Qi ","Shan ","Pai ","Han ","Qian ","Wu ","Wu ","Xun ","Si ","Ru ","Gong ","Jiang ","Chi ","Wu ","Tsuchi ",null,"Tang ","Zhi ","Chi ","Qian ","Mi ","Yu ","Wang ","Qing ","Jing ","Rui ","Jun ","Hong ","Tai ","Quan ","Ji ","Bian ","Bian ","Gan ","Wen ","Zhong ","Fang ","Xiong ","Jue ","Hang ","Niou ","Qi ","Fen ","Xu ","Xu ","Qin ","Yi ","Wo ","Yun ","Yuan ","Hang ","Yan ","Shen ","Chen ","Dan ","You ","Dun ","Hu ","Huo ","Qie ","Mu ","Rou ","Mei ","Ta ","Mian ","Wu ","Chong ","Tian ","Bi ","Sha ","Zhi ","Pei ","Pan ","Zhui ","Za ","Gou ","Liu ","Mei ","Ze ","Feng ","Ou ","Li ","Lun ","Cang ","Feng ","Wei ","Hu ","Mo ","Mei ","Shu ","Ju ","Zan ","Tuo ","Tuo ","Tuo ","He ","Li ","Mi ","Yi ","Fa ","Fei ","You ","Tian ","Zhi ","Zhao ","Gu ","Zhan ","Yan ","Si ","Kuang ","Jiong ","Ju ","Xie ","Qiu ","Yi ","Jia ","Zhong ","Quan ","Bo ","Hui ","Mi ","Ben ","Zhuo ","Chu ","Le ","You ","Gu ","Hong ","Gan ","Fa ","Mao ","Si ","Hu ","Ping ","Ci ","Fan ","Chi ","Su ","Ning ","Cheng ","Ling ","Pao ","Bo ","Qi ","Si ","Ni ","Ju ","Yue ","Zhu ","Sheng ","Lei ","Xuan ","Xue ","Fu ","Pan ","Min ","Tai ","Yang ","Ji ","Yong ","Guan ","Beng ","Xue ","Long ","Lu ",null,"Bo ","Xie ","Po ","Ze ","Jing ","Yin "],
  "109": ["Zhou ","Ji ","Yi ","Hui ","Hui ","Zui ","Cheng ","Yin ","Wei ","Hou ","Jian ","Yang ","Lie ","Si ","Ji ","Er ","Xing ","Fu ","Sa ","Suo ","Zhi ","Yin ","Wu ","Xi ","Kao ","Zhu ","Jiang ","Luo ",null,"An ","Dong ","Yi ","Mou ","Lei ","Yi ","Mi ","Quan ","Jin ","Mo ","Wei ","Xiao ","Xie ","Hong ","Xu ","Shuo ","Kuang ","Tao ","Qie ","Ju ","Er ","Zhou ","Ru ","Ping ","Xun ","Xiong ","Zhi ","Guang ","Huan ","Ming ","Huo ","Wa ","Qia ","Pai ","Wu ","Qu ","Liu ","Yi ","Jia ","Jing ","Qian ","Jiang ","Jiao ","Cheng ","Shi ","Zhuo ","Ce ","Pal ","Kuai ","Ji ","Liu ","Chan ","Hun ","Hu ","Nong ","Xun ","Jin ","Lie ","Qiu ","Wei ","Zhe ","Jun ","Han ","Bang ","Mang ","Zhuo ","You ","Xi ","Bo ","Dou ","Wan ","Hong ","Yi ","Pu ","Ying ","Lan ","Hao ","Lang ","Han ","Li ","Geng ","Fu ","Wu ","Lian ","Chun ","Feng ","Yi ","Yu ","Tong ","Lao ","Hai ","Jin ","Jia ","Chong ","Weng ","Mei ","Sui ","Cheng ","Pei ","Xian ","Shen ","Tu ","Kun ","Pin ","Nie ","Han ","Jing ","Xiao ","She ","Nian ","Tu ","Yong ","Xiao ","Xian ","Ting ","E ","Su ","Tun ","Juan ","Cen ","Ti ","Li ","Shui ","Si ","Lei ","Shui ","Tao ","Du ","Lao ","Lai ","Lian ","Wei ","Wo ","Yun ","Huan ","Di ",null,"Run ","Jian ","Zhang ","Se ","Fu ","Guan ","Xing ","Shou ","Shuan ","Ya ","Chuo ","Zhang ","Ye ","Kong ","Wo ","Han ","Tuo ","Dong ","He ","Wo ","Ju ","Gan ","Liang ","Hun ","Ta ","Zhuo ","Dian ","Qie ","De ","Juan ","Zi ","Xi ","Yao ","Qi ","Gu ","Guo ","Han ","Lin ","Tang ","Zhou ","Peng ","Hao ","Chang ","Shu ","Qi ","Fang ","Chi ","Lu ","Nao ","Ju ","Tao ","Cong ","Lei ","Zhi ","Peng ","Fei ","Song ","Tian ","Pi ","Dan ","Yu ","Ni ","Yu ","Lu ","Gan ","Mi ","Jing ","Ling ","Lun ","Yin ","Cui ","Qu ","Huai ","Yu ","Nian ","Shen ","Piao ","Chun ","Wa ","Yuan ","Lai ","Hun ","Qing ","Yan ","Qian ","Tian ","Miao ","Zhi ","Yin ","Mi "],
  "110": ["Ben ","Yuan ","Wen ","Re ","Fei ","Qing ","Yuan ","Ke ","Ji ","She ","Yuan ","Shibui ","Lu ","Zi ","Du ",null,"Jian ","Min ","Pi ","Tani ","Yu ","Yuan ","Shen ","Shen ","Rou ","Huan ","Zhu ","Jian ","Nuan ","Yu ","Qiu ","Ting ","Qu ","Du ","Feng ","Zha ","Bo ","Wo ","Wo ","Di ","Wei ","Wen ","Ru ","Xie ","Ce ","Wei ","Ge ","Gang ","Yan ","Hong ","Xuan ","Mi ","Ke ","Mao ","Ying ","Yan ","You ","Hong ","Miao ","Xing ","Mei ","Zai ","Hun ","Nai ","Kui ","Shi ","E ","Pai ","Mei ","Lian ","Qi ","Qi ","Mei ","Tian ","Cou ","Wei ","Can ","Tuan ","Mian ","Hui ","Mo ","Xu ","Ji ","Pen ","Jian ","Jian ","Hu ","Feng ","Xiang ","Yi ","Yin ","Zhan ","Shi ","Jie ","Cheng ","Huang ","Tan ","Yu ","Bi ","Min ","Shi ","Tu ","Sheng ","Yong ","Qu ","Zhong ","Suei ","Jiu ","Jiao ","Qiou ","Yin ","Tang ","Long ","Huo ","Yuan ","Nan ","Ban ","You ","Quan ","Chui ","Liang ","Chan ","Yan ","Chun ","Nie ","Zi ","Wan ","Shi ","Man ","Ying ","Ratsu ","Kui ",null,"Jian ","Xu ","Lu ","Gui ","Gai ",null,null,"Po ","Jin ","Gui ","Tang ","Yuan ","Suo ","Yuan ","Lian ","Yao ","Meng ","Zhun ","Sheng ","Ke ","Tai ","Da ","Wa ","Liu ","Gou ","Sao ","Ming ","Zha ","Shi ","Yi ","Lun ","Ma ","Pu ","Wei ","Li ","Cai ","Wu ","Xi ","Wen ","Qiang ","Ze ","Shi ","Su ","Yi ","Zhen ","Sou ","Yun ","Xiu ","Yin ","Rong ","Hun ","Su ","Su ","Ni ","Ta ","Shi ","Ru ","Wei ","Pan ","Chu ","Chu ","Pang ","Weng ","Cang ","Mie ","He ","Dian ","Hao ","Huang ","Xi ","Zi ","Di ","Zhi ","Ying ","Fu ","Jie ","Hua ","Ge ","Zi ","Tao ","Teng ","Sui ","Bi ","Jiao ","Hui ","Gun ","Yin ","Gao ","Long ","Zhi ","Yan ","She ","Man ","Ying ","Chun ","Lu ","Lan ","Luan ",null,"Bin ","Tan ","Yu ","Sou ","Hu ","Bi ","Biao ","Zhi ","Jiang ","Kou ","Shen ","Shang ","Di ","Mi ","Ao ","Lu ","Hu ","Hu ","You ","Chan ","Fan ","Yong ","Gun ","Man "],
  "111": ["Qing ","Yu ","Piao ","Ji ","Ya ","Jiao ","Qi ","Xi ","Ji ","Lu ","Lu ","Long ","Jin ","Guo ","Cong ","Lou ","Zhi ","Gai ","Qiang ","Li ","Yan ","Cao ","Jiao ","Cong ","Qun ","Tuan ","Ou ","Teng ","Ye ","Xi ","Mi ","Tang ","Mo ","Shang ","Han ","Lian ","Lan ","Wa ","Li ","Qian ","Feng ","Xuan ","Yi ","Man ","Zi ","Mang ","Kang ","Lei ","Peng ","Shu ","Zhang ","Zhang ","Chong ","Xu ","Huan ","Kuo ","Jian ","Yan ","Chuang ","Liao ","Cui ","Ti ","Yang ","Jiang ","Cong ","Ying ","Hong ","Xun ","Shu ","Guan ","Ying ","Xiao ",null,null,"Xu ","Lian ","Zhi ","Wei ","Pi ","Jue ","Jiao ","Po ","Dang ","Hui ","Jie ","Wu ","Pa ","Ji ","Pan ","Gui ","Xiao ","Qian ","Qian ","Xi ","Lu ","Xi ","Xuan ","Dun ","Huang ","Min ","Run ","Su ","Liao ","Zhen ","Zhong ","Yi ","Di ","Wan ","Dan ","Tan ","Chao ","Xun ","Kui ","Yie ","Shao ","Tu ","Zhu ","San ","Hei ","Bi ","Shan ","Chan ","Chan ","Shu ","Tong ","Pu ","Lin ","Wei ","Se ","Se ","Cheng ","Jiong ","Cheng ","Hua ","Jiao ","Lao ","Che ","Gan ","Cun ","Heng ","Si ","Shu ","Peng ","Han ","Yun ","Liu ","Hong ","Fu ","Hao ","He ","Xian ","Jian ","Shan ","Xi ","Oki ",null,"Lan ",null,"Yu ","Lin ","Min ","Zao ","Dang ","Wan ","Ze ","Xie ","Yu ","Li ","Shi ","Xue ","Ling ","Man ","Zi ","Yong ","Kuai ","Can ","Lian ","Dian ","Ye ","Ao ","Huan ","Zhen ","Chan ","Man ","Dan ","Dan ","Yi ","Sui ","Pi ","Ju ","Ta ","Qin ","Ji ","Zhuo ","Lian ","Nong ","Guo ","Jin ","Fen ","Se ","Ji ","Sui ","Hui ","Chu ","Ta ","Song ","Ding ",null,"Zhu ","Lai ","Bin ","Lian ","Mi ","Shi ","Shu ","Mi ","Ning ","Ying ","Ying ","Meng ","Jin ","Qi ","Pi ","Ji ","Hao ","Ru ","Zui ","Wo ","Tao ","Yin ","Yin ","Dui ","Ci ","Huo ","Jing ","Lan ","Jun ","Ai ","Pu ","Zhuo ","Wei ","Bin ","Gu ","Qian ","Xing ","Hama ","Kuo ","Fei ",null,"Boku ","Jian ","Wei ","Luo ","Zan ","Lu ","Li "],
  "112": ["You ","Yang ","Lu ","Si ","Jie ","Ying ","Du ","Wang ","Hui ","Xie ","Pan ","Shen ","Biao ","Chan ","Mo ","Liu ","Jian ","Pu ","Se ","Cheng ","Gu ","Bin ","Huo ","Xian ","Lu ","Qin ","Han ","Ying ","Yong ","Li ","Jing ","Xiao ","Ying ","Sui ","Wei ","Xie ","Huai ","Hao ","Zhu ","Long ","Lai ","Dui ","Fan ","Hu ","Lai ",null,null,"Ying ","Mi ","Ji ","Lian ","Jian ","Ying ","Fen ","Lin ","Yi ","Jian ","Yue ","Chan ","Dai ","Rang ","Jian ","Lan ","Fan ","Shuang ","Yuan ","Zhuo ","Feng ","She ","Lei ","Lan ","Cong ","Qu ","Yong ","Qian ","Fa ","Guan ","Que ","Yan ","Hao ","Hyeng ","Sa ","Zan ","Luan ","Yan ","Li ","Mi ","Shan ","Tan ","Dang ","Jiao ","Chan ",null,"Hao ","Ba ","Zhu ","Lan ","Lan ","Nang ","Wan ","Luan ","Xun ","Xian ","Yan ","Gan ","Yan ","Yu ","Huo ","Si ","Mie ","Guang ","Deng ","Hui ","Xiao ","Xiao ","Hu ","Hong ","Ling ","Zao ","Zhuan ","Jiu ","Zha ","Xie ","Chi ","Zhuo ","Zai ","Zai ","Can ","Yang ","Qi ","Zhong ","Fen ","Niu ","Jiong ","Wen ","Po ","Yi ","Lu ","Chui ","Pi ","Kai ","Pan ","Yan ","Kai ","Pang ","Mu ","Chao ","Liao ","Gui ","Kang ","Tun ","Guang ","Xin ","Zhi ","Guang ","Guang ","Wei ","Qiang ",null,"Da ","Xia ","Zheng ","Zhu ","Ke ","Zhao ","Fu ","Ba ","Duo ","Duo ","Ling ","Zhuo ","Xuan ","Ju ","Tan ","Pao ","Jiong ","Pao ","Tai ","Tai ","Bing ","Yang ","Tong ","Han ","Zhu ","Zha ","Dian ","Wei ","Shi ","Lian ","Chi ","Huang ",null,"Hu ","Shuo ","Lan ","Jing ","Jiao ","Xu ","Xing ","Quan ","Lie ","Huan ","Yang ","Xiao ","Xiu ","Xian ","Yin ","Wu ","Zhou ","Yao ","Shi ","Wei ","Tong ","Xue ","Zai ","Kai ","Hong ","Luo ","Xia ","Zhu ","Xuan ","Zheng ","Po ","Yan ","Hui ","Guang ","Zhe ","Hui ","Kao ",null,"Fan ","Shao ","Ye ","Hui ",null,"Tang ","Jin ","Re ",null,"Xi ","Fu ","Jiong ","Che ","Pu ","Jing ","Zhuo ","Ting ","Wan ","Hai ","Peng ","Lang ","Shan ","Hu ","Feng ","Chi ","Rong "],
  "113": ["Hu ","Xi ","Shu ","He ","Xun ","Ku ","Jue ","Xiao ","Xi ","Yan ","Han ","Zhuang ","Jun ","Di ","Xie ","Ji ","Wu ",null,null,"Han ","Yan ","Huan ","Men ","Ju ","Chou ","Bei ","Fen ","Lin ","Kun ","Hun ","Tun ","Xi ","Cui ","Wu ","Hong ","Ju ","Fu ","Wo ","Jiao ","Cong ","Feng ","Ping ","Qiong ","Ruo ","Xi ","Qiong ","Xin ","Zhuo ","Yan ","Yan ","Yi ","Jue ","Yu ","Gang ","Ran ","Pi ","Gu ",null,"Sheng ","Chang ","Shao ",null,null,null,null,"Chen ","He ","Kui ","Zhong ","Duan ","Xia ","Hui ","Feng ","Lian ","Xuan ","Xing ","Huang ","Jiao ","Jian ","Bi ","Ying ","Zhu ","Wei ","Tuan ","Tian ","Xi ","Nuan ","Nuan ","Chan ","Yan ","Jiong ","Jiong ","Yu ","Mei ","Sha ","Wei ","Ye ","Xin ","Qiong ","Rou ","Mei ","Huan ","Xu ","Zhao ","Wei ","Fan ","Qiu ","Sui ","Yang ","Lie ","Zhu ","Jie ","Gao ","Gua ","Bao ","Hu ","Yun ","Xia ",null,null,"Bian ","Gou ","Tui ","Tang ","Chao ","Shan ","N ","Bo ","Huang ","Xie ","Xi ","Wu ","Xi ","Yun ","He ","He ","Xi ","Yun ","Xiong ","Nai ","Shan ","Qiong ","Yao ","Xun ","Mi ","Lian ","Ying ","Wen ","Rong ","Oozutsu ",null,"Qiang ","Liu ","Xi ","Bi ","Biao ","Zong ","Lu ","Jian ","Shou ","Yi ","Lou ","Feng ","Sui ","Yi ","Tong ","Jue ","Zong ","Yun ","Hu ","Yi ","Zhi ","Ao ","Wei ","Liao ","Han ","Ou ","Re ","Jiong ","Man ",null,"Shang ","Cuan ","Zeng ","Jian ","Xi ","Xi ","Xi ","Yi ","Xiao ","Chi ","Huang ","Chan ","Ye ","Qian ","Ran ","Yan ","Xian ","Qiao ","Zun ","Deng ","Dun ","Shen ","Jiao ","Fen ","Si ","Liao ","Yu ","Lin ","Tong ","Shao ","Fen ","Fan ","Yan ","Xun ","Lan ","Mei ","Tang ","Yi ","Jing ","Men ",null,null,"Ying ","Yu ","Yi ","Xue ","Lan ","Tai ","Zao ","Can ","Sui ","Xi ","Que ","Cong ","Lian ","Hui ","Zhu ","Xie ","Ling ","Wei ","Yi ","Xie ","Zhao ","Hui ","Tatsu ","Nung ","Lan ","Ru ","Xian ","Kao ","Xun ","Jin ","Chou ","Chou ","Yao "],
  "114": ["He ","Lan ","Biao ","Rong ","Li ","Mo ","Bao ","Ruo ","Lu ","La ","Ao ","Xun ","Kuang ","Shuo ",null,"Li ","Lu ","Jue ","Liao ","Yan ","Xi ","Xie ","Long ","Ye ",null,"Rang ","Yue ","Lan ","Cong ","Jue ","Tong ","Guan ",null,"Che ","Mi ","Tang ","Lan ","Zhu ",null,"Ling ","Cuan ","Yu ","Zhua ","Tsumekanmuri ","Pa ","Zheng ","Pao ","Cheng ","Yuan ","Ai ","Wei ",null,"Jue ","Jue ","Fu ","Ye ","Ba ","Die ","Ye ","Yao ","Zu ","Shuang ","Er ","Qiang ","Chuang ","Ge ","Zang ","Die ","Qiang ","Yong ","Qiang ","Pian ","Ban ","Pan ","Shao ","Jian ","Pai ","Du ","Chuang ","Tou ","Zha ","Bian ","Die ","Bang ","Bo ","Chuang ","You ",null,"Du ","Ya ","Cheng ","Niu ","Ushihen ","Pin ","Jiu ","Mou ","Tuo ","Mu ","Lao ","Ren ","Mang ","Fang ","Mao ","Mu ","Gang ","Wu ","Yan ","Ge ","Bei ","Si ","Jian ","Gu ","You ","Ge ","Sheng ","Mu ","Di ","Qian ","Quan ","Quan ","Zi ","Te ","Xi ","Mang ","Keng ","Qian ","Wu ","Gu ","Xi ","Li ","Li ","Pou ","Ji ","Gang ","Zhi ","Ben ","Quan ","Run ","Du ","Ju ","Jia ","Jian ","Feng ","Pian ","Ke ","Ju ","Kao ","Chu ","Xi ","Bei ","Luo ","Jie ","Ma ","San ","Wei ","Li ","Dun ","Tong ",null,"Jiang ","Ikenie ","Li ","Du ","Lie ","Pi ","Piao ","Bao ","Xi ","Chou ","Wei ","Kui ","Chou ","Quan ","Fan ","Ba ","Fan ","Qiu ","Ji ","Cai ","Chuo ","An ","Jie ","Zhuang ","Guang ","Ma ","You ","Kang ","Bo ","Hou ","Ya ","Yin ","Huan ","Zhuang ","Yun ","Kuang ","Niu ","Di ","Qing ","Zhong ","Mu ","Bei ","Pi ","Ju ","Ni ","Sheng ","Pao ","Xia ","Tuo ","Hu ","Ling ","Fei ","Pi ","Ni ","Ao ","You ","Gou ","Yue ","Ju ","Dan ","Po ","Gu ","Xian ","Ning ","Huan ","Hen ","Jiao ","He ","Zhao ","Ji ","Xun ","Shan ","Ta ","Rong ","Shou ","Tong ","Lao ","Du ","Xia ","Shi ","Hua ","Zheng ","Yu ","Sun ","Yu ","Bi ","Mang ","Xi ","Juan ","Li ","Xia ","Yin ","Suan ","Lang ","Bei ","Zhi ","Yan "],
  "115": ["Sha ","Li ","Han ","Xian ","Jing ","Pai ","Fei ","Yao ","Ba ","Qi ","Ni ","Biao ","Yin ","Lai ","Xi ","Jian ","Qiang ","Kun ","Yan ","Guo ","Zong ","Mi ","Chang ","Yi ","Zhi ","Zheng ","Ya ","Meng ","Cai ","Cu ","She ","Kari ","Cen ","Luo ","Hu ","Zong ","Ji ","Wei ","Feng ","Wo ","Yuan ","Xing ","Zhu ","Mao ","Wei ","Yuan ","Xian ","Tuan ","Ya ","Nao ","Xie ","Jia ","Hou ","Bian ","You ","You ","Mei ","Zha ","Yao ","Sun ","Bo ","Ming ","Hua ","Yuan ","Sou ","Ma ","Yuan ","Dai ","Yu ","Shi ","Hao ",null,"Yi ","Zhen ","Chuang ","Hao ","Man ","Jing ","Jiang ","Mu ","Zhang ","Chan ","Ao ","Ao ","Hao ","Cui ","Fen ","Jue ","Bi ","Bi ","Huang ","Pu ","Lin ","Yu ","Tong ","Yao ","Liao ","Shuo ","Xiao ","Swu ","Ton ","Xi ","Ge ","Juan ","Du ","Hui ","Kuai ","Xian ","Xie ","Ta ","Xian ","Xun ","Ning ","Pin ","Huo ","Nou ","Meng ","Lie ","Nao ","Guang ","Shou ","Lu ","Ta ","Xian ","Mi ","Rang ","Huan ","Nao ","Luo ","Xian ","Qi ","Jue ","Xuan ","Miao ","Zi ","Lu ","Lu ","Yu ","Su ","Wang ","Qiu ","Ga ","Ding ","Le ","Ba ","Ji ","Hong ","Di ","Quan ","Gan ","Jiu ","Yu ","Ji ","Yu ","Yang ","Ma ","Gong ","Wu ","Fu ","Wen ","Jie ","Ya ","Fen ","Bian ","Beng ","Yue ","Jue ","Yun ","Jue ","Wan ","Jian ","Mei ","Dan ","Pi ","Wei ","Huan ","Xian ","Qiang ","Ling ","Dai ","Yi ","An ","Ping ","Dian ","Fu ","Xuan ","Xi ","Bo ","Ci ","Gou ","Jia ","Shao ","Po ","Ci ","Ke ","Ran ","Sheng ","Shen ","Yi ","Zu ","Jia ","Min ","Shan ","Liu ","Bi ","Zhen ","Zhen ","Jue ","Fa ","Long ","Jin ","Jiao ","Jian ","Li ","Guang ","Xian ","Zhou ","Gong ","Yan ","Xiu ","Yang ","Xu ","Luo ","Su ","Zhu ","Qin ","Ken ","Xun ","Bao ","Er ","Xiang ","Yao ","Xia ","Heng ","Gui ","Chong ","Xu ","Ban ","Pei ",null,"Dang ","Ei ","Hun ","Wen ","E ","Cheng ","Ti ","Wu ","Wu ","Cheng ","Jun ","Mei ","Bei ","Ting ","Xian ","Chuo "],
  "116": ["Han ","Xuan ","Yan ","Qiu ","Quan ","Lang ","Li ","Xiu ","Fu ","Liu ","Ye ","Xi ","Ling ","Li ","Jin ","Lian ","Suo ","Chiisai ",null,"Wan ","Dian ","Pin ","Zhan ","Cui ","Min ","Yu ","Ju ","Chen ","Lai ","Wen ","Sheng ","Wei ","Dian ","Chu ","Zhuo ","Pei ","Cheng ","Hu ","Qi ","E ","Kun ","Chang ","Qi ","Beng ","Wan ","Lu ","Cong ","Guan ","Yan ","Diao ","Bei ","Lin ","Qin ","Pi ","Pa ","Que ","Zhuo ","Qin ","Fa ",null,"Qiong ","Du ","Jie ","Hun ","Yu ","Mao ","Mei ","Chun ","Xuan ","Ti ","Xing ","Dai ","Rou ","Min ","Zhen ","Wei ","Ruan ","Huan ","Jie ","Chuan ","Jian ","Zhuan ","Yang ","Lian ","Quan ","Xia ","Duan ","Yuan ","Ye ","Nao ","Hu ","Ying ","Yu ","Huang ","Rui ","Se ","Liu ","Shi ","Rong ","Suo ","Yao ","Wen ","Wu ","Jin ","Jin ","Ying ","Ma ","Tao ","Liu ","Tang ","Li ","Lang ","Gui ","Zhen ","Qiang ","Cuo ","Jue ","Zhao ","Yao ","Ai ","Bin ","Tu ","Chang ","Kun ","Zhuan ","Cong ","Jin ","Yi ","Cui ","Cong ","Qi ","Li ","Ying ","Suo ","Qiu ","Xuan ","Ao ","Lian ","Man ","Zhang ","Yin ",null,"Ying ","Zhi ","Lu ","Wu ","Deng ","Xiou ","Zeng ","Xun ","Qu ","Dang ","Lin ","Liao ","Qiong ","Su ","Huang ","Gui ","Pu ","Jing ","Fan ","Jin ","Liu ","Ji ",null,"Jing ","Ai ","Bi ","Can ","Qu ","Zao ","Dang ","Jiao ","Gun ","Tan ","Hui ","Huan ","Se ","Sui ","Tian ",null,"Yu ","Jin ","Lu ","Bin ","Shou ","Wen ","Zui ","Lan ","Xi ","Ji ","Xuan ","Ruan ","Huo ","Gai ","Lei ","Du ","Li ","Zhi ","Rou ","Li ","Zan ","Qiong ","Zhe ","Gui ","Sui ","La ","Long ","Lu ","Li ","Zan ","Lan ","Ying ","Mi ","Xiang ","Xi ","Guan ","Dao ","Zan ","Huan ","Gua ","Bo ","Die ","Bao ","Hu ","Zhi ","Piao ","Ban ","Rang ","Li ","Wa ","Dekaguramu ","Jiang ","Qian ","Fan ","Pen ","Fang ","Dan ","Weng ","Ou ","Deshiguramu ","Miriguramu ","Thon ","Hu ","Ling ","Yi ","Ping ","Ci ","Hekutogura ","Juan ","Chang ","Chi ","Sarake ","Dang ","Meng ","Pou "],
  "117": ["Zhui ","Ping ","Bian ","Zhou ","Zhen ","Senchigura ","Ci ","Ying ","Qi ","Xian ","Lou ","Di ","Ou ","Meng ","Zhuan ","Peng ","Lin ","Zeng ","Wu ","Pi ","Dan ","Weng ","Ying ","Yan ","Gan ","Dai ","Shen ","Tian ","Tian ","Han ","Chang ","Sheng ","Qing ","Sheng ","Chan ","Chan ","Rui ","Sheng ","Su ","Sen ","Yong ","Shuai ","Lu ","Fu ","Yong ","Beng ","Feng ","Ning ","Tian ","You ","Jia ","Shen ","Zha ","Dian ","Fu ","Nan ","Dian ","Ping ","Ting ","Hua ","Ting ","Quan ","Zi ","Meng ","Bi ","Qi ","Liu ","Xun ","Liu ","Chang ","Mu ","Yun ","Fan ","Fu ","Geng ","Tian ","Jie ","Jie ","Quan ","Wei ","Fu ","Tian ","Mu ","Tap ","Pan ","Jiang ","Wa ","Da ","Nan ","Liu ","Ben ","Zhen ","Chu ","Mu ","Mu ","Ce ","Cen ","Gai ","Bi ","Da ","Zhi ","Lue ","Qi ","Lue ","Pan ","Kesa ","Fan ","Hua ","Yu ","Yu ","Mu ","Jun ","Yi ","Liu ","Yu ","Die ","Chou ","Hua ","Dang ","Chuo ","Ji ","Wan ","Jiang ","Sheng ","Chang ","Tuan ","Lei ","Ji ","Cha ","Liu ","Tatamu ","Tuan ","Lin ","Jiang ","Jiang ","Chou ","Bo ","Die ","Die ","Pi ","Nie ","Dan ","Shu ","Shu ","Zhi ","Yi ","Chuang ","Nai ","Ding ","Bi ","Jie ","Liao ","Gong ","Ge ","Jiu ","Zhou ","Xia ","Shan ","Xu ","Nue ","Li ","Yang ","Chen ","You ","Ba ","Jie ","Jue ","Zhi ","Xia ","Cui ","Bi ","Yi ","Li ","Zong ","Chuang ","Feng ","Zhu ","Pao ","Pi ","Gan ","Ke ","Ci ","Xie ","Qi ","Dan ","Zhen ","Fa ","Zhi ","Teng ","Ju ","Ji ","Fei ","Qu ","Dian ","Jia ","Xian ","Cha ","Bing ","Ni ","Zheng ","Yong ","Jing ","Quan ","Chong ","Tong ","Yi ","Kai ","Wei ","Hui ","Duo ","Yang ","Chi ","Zhi ","Hen ","Ya ","Mei ","Dou ","Jing ","Xiao ","Tong ","Tu ","Mang ","Pi ","Xiao ","Suan ","Pu ","Li ","Zhi ","Cuo ","Duo ","Wu ","Sha ","Lao ","Shou ","Huan ","Xian ","Yi ","Peng ","Zhang ","Guan ","Tan ","Fei ","Ma ","Lin ","Chi ","Ji ","Dian ","An ","Chi ","Bi ","Bei ","Min ","Gu ","Dui ","E ","Wei "],
  "118": ["Yu ","Cui ","Ya ","Zhu ","Cu ","Dan ","Shen ","Zhung ","Ji ","Yu ","Hou ","Feng ","La ","Yang ","Shen ","Tu ","Yu ","Gua ","Wen ","Huan ","Ku ","Jia ","Yin ","Yi ","Lu ","Sao ","Jue ","Chi ","Xi ","Guan ","Yi ","Wen ","Ji ","Chuang ","Ban ","Lei ","Liu ","Chai ","Shou ","Nue ","Dian ","Da ","Pie ","Tan ","Zhang ","Biao ","Shen ","Cu ","Luo ","Yi ","Zong ","Chou ","Zhang ","Zhai ","Sou ","Suo ","Que ","Diao ","Lou ","Lu ","Mo ","Jin ","Yin ","Ying ","Huang ","Fu ","Liao ","Long ","Qiao ","Liu ","Lao ","Xian ","Fei ","Dan ","Yin ","He ","Yan ","Ban ","Xian ","Guan ","Guai ","Nong ","Yu ","Wei ","Yi ","Yong ","Pi ","Lei ","Li ","Shu ","Dan ","Lin ","Dian ","Lin ","Lai ","Pie ","Ji ","Chi ","Yang ","Xian ","Jie ","Zheng ",null,"Li ","Huo ","Lai ","Shaku ","Dian ","Xian ","Ying ","Yin ","Qu ","Yong ","Tan ","Dian ","Luo ","Luan ","Luan ","Bo ",null,"Gui ","Po ","Fa ","Deng ","Fa ","Bai ","Bai ","Qie ","Bi ","Zao ","Zao ","Mao ","De ","Pa ","Jie ","Huang ","Gui ","Ci ","Ling ","Gao ","Mo ","Ji ","Jiao ","Peng ","Gao ","Ai ","E ","Hao ","Han ","Bi ","Wan ","Chou ","Qian ","Xi ","Ai ","Jiong ","Hao ","Huang ","Hao ","Ze ","Cui ","Hao ","Xiao ","Ye ","Po ","Hao ","Jiao ","Ai ","Xing ","Huang ","Li ","Piao ","He ","Jiao ","Pi ","Gan ","Pao ","Zhou ","Jun ","Qiu ","Cun ","Que ","Zha ","Gu ","Jun ","Jun ","Zhou ","Zha ","Gu ","Zhan ","Du ","Min ","Qi ","Ying ","Yu ","Bei ","Zhao ","Zhong ","Pen ","He ","Ying ","He ","Yi ","Bo ","Wan ","He ","Ang ","Zhan ","Yan ","Jian ","He ","Yu ","Kui ","Fan ","Gai ","Dao ","Pan ","Fu ","Qiu ","Sheng ","Dao ","Lu ","Zhan ","Meng ","Li ","Jin ","Xu ","Jian ","Pan ","Guan ","An ","Lu ","Shu ","Zhou ","Dang ","An ","Gu ","Li ","Mu ","Cheng ","Gan ","Xu ","Mang ","Mang ","Zhi ","Qi ","Ruan ","Tian ","Xiang ","Dun ","Xin ","Xi ","Pan ","Feng ","Dun ","Min "],
  "119": ["Ming ","Sheng ","Shi ","Yun ","Mian ","Pan ","Fang ","Miao ","Dan ","Mei ","Mao ","Kan ","Xian ","Ou ","Shi ","Yang ","Zheng ","Yao ","Shen ","Huo ","Da ","Zhen ","Kuang ","Ju ","Shen ","Chi ","Sheng ","Mei ","Mo ","Zhu ","Zhen ","Zhen ","Mian ","Di ","Yuan ","Die ","Yi ","Zi ","Zi ","Chao ","Zha ","Xuan ","Bing ","Mi ","Long ","Sui ","Dong ","Mi ","Die ","Yi ","Er ","Ming ","Xuan ","Chi ","Kuang ","Juan ","Mou ","Zhen ","Tiao ","Yang ","Yan ","Mo ","Zhong ","Mai ","Zhao ","Zheng ","Mei ","Jun ","Shao ","Han ","Huan ","Di ","Cheng ","Cuo ","Juan ","E ","Wan ","Xian ","Xi ","Kun ","Lai ","Jian ","Shan ","Tian ","Hun ","Wan ","Ling ","Shi ","Qiong ","Lie ","Yai ","Jing ","Zheng ","Li ","Lai ","Sui ","Juan ","Shui ","Sui ","Du ","Bi ","Bi ","Mu ","Hun ","Ni ","Lu ","Yi ","Jie ","Cai ","Zhou ","Yu ","Hun ","Ma ","Xia ","Xing ","Xi ","Gun ","Cai ","Chun ","Jian ","Mei ","Du ","Hou ","Xuan ","Ti ","Kui ","Gao ","Rui ","Mou ","Xu ","Fa ","Wen ","Miao ","Chou ","Kui ","Mi ","Weng ","Kou ","Dang ","Chen ","Ke ","Sou ","Xia ","Qiong ","Mao ","Ming ","Man ","Shui ","Ze ","Zhang ","Yi ","Diao ","Ou ","Mo ","Shun ","Cong ","Lou ","Chi ","Man ","Piao ","Cheng ","Ji ","Meng ",null,"Run ","Pie ","Xi ","Qiao ","Pu ","Zhu ","Deng ","Shen ","Shun ","Liao ","Che ","Xian ","Kan ","Ye ","Xu ","Tong ","Mou ","Lin ","Kui ","Xian ","Ye ","Ai ","Hui ","Zhan ","Jian ","Gu ","Zhao ","Qu ","Wei ","Chou ","Sao ","Ning ","Xun ","Yao ","Huo ","Meng ","Mian ","Bin ","Mian ","Li ","Kuang ","Jue ","Xuan ","Mian ","Huo ","Lu ","Meng ","Long ","Guan ","Man ","Xi ","Chu ","Tang ","Kan ","Zhu ","Mao ","Jin ","Lin ","Yu ","Shuo ","Ce ","Jue ","Shi ","Yi ","Shen ","Zhi ","Hou ","Shen ","Ying ","Ju ","Zhou ","Jiao ","Cuo ","Duan ","Ai ","Jiao ","Zeng ","Huo ","Bai ","Shi ","Ding ","Qi ","Ji ","Zi ","Gan ","Wu ","Tuo ","Ku ","Qiang ","Xi ","Fan ","Kuang "],
  "120": ["Dang ","Ma ","Sha ","Dan ","Jue ","Li ","Fu ","Min ","Nuo ","Huo ","Kang ","Zhi ","Qi ","Kan ","Jie ","Fen ","E ","Ya ","Pi ","Zhe ","Yan ","Sui ","Zhuan ","Che ","Dun ","Pan ","Yan ",null,"Feng ","Fa ","Mo ","Zha ","Qu ","Yu ","Luo ","Tuo ","Tuo ","Di ","Zhai ","Zhen ","Ai ","Fei ","Mu ","Zhu ","Li ","Bian ","Nu ","Ping ","Peng ","Ling ","Pao ","Le ","Po ","Bo ","Po ","Shen ","Za ","Nuo ","Li ","Long ","Tong ",null,"Li ","Aragane ","Chu ","Keng ","Quan ","Zhu ","Kuang ","Huo ","E ","Nao ","Jia ","Lu ","Wei ","Ai ","Luo ","Ken ","Xing ","Yan ","Tong ","Peng ","Xi ",null,"Hong ","Shuo ","Xia ","Qiao ",null,"Wei ","Qiao ",null,"Keng ","Xiao ","Que ","Chan ","Lang ","Hong ","Yu ","Xiao ","Xia ","Mang ","Long ","Iong ","Che ","Che ","E ","Liu ","Ying ","Mang ","Que ","Yan ","Sha ","Kun ","Yu ",null,"Kaki ","Lu ","Chen ","Jian ","Nue ","Song ","Zhuo ","Keng ","Peng ","Yan ","Zhui ","Kong ","Ceng ","Qi ","Zong ","Qing ","Lin ","Jun ","Bo ","Ding ","Min ","Diao ","Jian ","He ","Lu ","Ai ","Sui ","Que ","Ling ","Bei ","Yin ","Dui ","Wu ","Qi ","Lun ","Wan ","Dian ","Gang ","Pei ","Qi ","Chen ","Ruan ","Yan ","Die ","Ding ","Du ","Tuo ","Jie ","Ying ","Bian ","Ke ","Bi ","Wei ","Shuo ","Zhen ","Duan ","Xia ","Dang ","Ti ","Nao ","Peng ","Jian ","Di ","Tan ","Cha ","Seki ","Qi ",null,"Feng ","Xuan ","Que ","Que ","Ma ","Gong ","Nian ","Su ","E ","Ci ","Liu ","Si ","Tang ","Bang ","Hua ","Pi ","Wei ","Sang ","Lei ","Cuo ","Zhen ","Xia ","Qi ","Lian ","Pan ","Wei ","Yun ","Dui ","Zhe ","Ke ","La ",null,"Qing ","Gun ","Zhuan ","Chan ","Qi ","Ao ","Peng ","Lu ","Lu ","Kan ","Qiang ","Chen ","Yin ","Lei ","Biao ","Qi ","Mo ","Qi ","Cui ","Zong ","Qing ","Chuo ",null,"Ji ","Shan ","Lao ","Qu ","Zeng ","Deng ","Jian ","Xi ","Lin ","Ding ","Dian ","Huang ","Pan ","Za ","Qiao ","Di ","Li "],
  "121": ["Tani ","Jiao ",null,"Zhang ","Qiao ","Dun ","Xian ","Yu ","Zhui ","He ","Huo ","Zhai ","Lei ","Ke ","Chu ","Ji ","Que ","Dang ","Yi ","Jiang ","Pi ","Pi ","Yu ","Pin ","Qi ","Ai ","Kai ","Jian ","Yu ","Ruan ","Meng ","Pao ","Ci ",null,null,"Mie ","Ca ","Xian ","Kuang ","Lei ","Lei ","Zhi ","Li ","Li ","Fan ","Que ","Pao ","Ying ","Li ","Long ","Long ","Mo ","Bo ","Shuang ","Guan ","Lan ","Zan ","Yan ","Shi ","Shi ","Li ","Reng ","She ","Yue ","Si ","Qi ","Ta ","Ma ","Xie ","Xian ","Xian ","Zhi ","Qi ","Zhi ","Beng ","Dui ","Zhong ",null,"Yi ","Shi ","You ","Zhi ","Tiao ","Fu ","Fu ","Mi ","Zu ","Zhi ","Suan ","Mei ","Zuo ","Qu ","Hu ","Zhu ","Shen ","Sui ","Ci ","Chai ","Mi ","Lu ","Yu ","Xiang ","Wu ","Tiao ","Piao ","Zhu ","Gui ","Xia ","Zhi ","Ji ","Gao ","Zhen ","Gao ","Shui ","Jin ","Chen ","Gai ","Kun ","Di ","Dao ","Huo ","Tao ","Qi ","Gu ","Guan ","Zui ","Ling ","Lu ","Bing ","Jin ","Dao ","Zhi ","Lu ","Shan ","Bei ","Zhe ","Hui ","You ","Xi ","Yin ","Zi ","Huo ","Zhen ","Fu ","Yuan ","Wu ","Xian ","Yang ","Ti ","Yi ","Mei ","Si ","Di ",null,"Zhuo ","Zhen ","Yong ","Ji ","Gao ","Tang ","Si ","Ma ","Ta ",null,"Xuan ","Qi ","Yu ","Xi ","Ji ","Si ","Chan ","Tan ","Kuai ","Sui ","Li ","Nong ","Ni ","Dao ","Li ","Rang ","Yue ","Ti ","Zan ","Lei ","Rou ","Yu ","Yu ","Chi ","Xie ","Qin ","He ","Tu ","Xiu ","Si ","Ren ","Tu ","Zi ","Cha ","Gan ","Yi ","Xian ","Bing ","Nian ","Qiu ","Qiu ","Chong ","Fen ","Hao ","Yun ","Ke ","Miao ","Zhi ","Geng ","Bi ","Zhi ","Yu ","Mi ","Ku ","Ban ","Pi ","Ni ","Li ","You ","Zu ","Pi ","Ba ","Ling ","Mo ","Cheng ","Nian ","Qin ","Yang ","Zuo ","Zhi ","Zhi ","Shu ","Ju ","Zi ","Huo ","Ji ","Cheng ","Tong ","Zhi ","Huo ","He ","Yin ","Zi ","Zhi ","Jie ","Ren ","Du ","Yi ","Zhu ","Hui ","Nong ","Fu "],
  "122": ["Xi ","Kao ","Lang ","Fu ","Ze ","Shui ","Lu ","Kun ","Gan ","Geng ","Ti ","Cheng ","Tu ","Shao ","Shui ","Ya ","Lun ","Lu ","Gu ","Zuo ","Ren ","Zhun ","Bang ","Bai ","Ji ","Zhi ","Zhi ","Kun ","Leng ","Peng ","Ke ","Bing ","Chou ","Zu ","Yu ","Su ","Lue ",null,"Yi ","Xi ","Bian ","Ji ","Fu ","Bi ","Nuo ","Jie ","Zhong ","Zong ","Xu ","Cheng ","Dao ","Wen ","Lian ","Zi ","Yu ","Ji ","Xu ","Zhen ","Zhi ","Dao ","Jia ","Ji ","Gao ","Gao ","Gu ","Rong ","Sui ","You ","Ji ","Kang ","Mu ","Shan ","Men ","Zhi ","Ji ","Lu ","Su ","Ji ","Ying ","Wen ","Qiu ","Se ",null,"Yi ","Huang ","Qie ","Ji ","Sui ","Xiao ","Pu ","Jiao ","Zhuo ","Tong ","Sai ","Lu ","Sui ","Nong ","Se ","Hui ","Rang ","Nuo ","Yu ","Bin ","Ji ","Tui ","Wen ","Cheng ","Huo ","Gong ","Lu ","Biao ",null,"Rang ","Zhuo ","Li ","Zan ","Xue ","Wa ","Jiu ","Qiong ","Xi ","Qiong ","Kong ","Yu ","Sen ","Jing ","Yao ","Chuan ","Zhun ","Tu ","Lao ","Qie ","Zhai ","Yao ","Bian ","Bao ","Yao ","Bing ","Wa ","Zhu ","Jiao ","Qiao ","Diao ","Wu ","Gui ","Yao ","Zhi ","Chuang ","Yao ","Tiao ","Jiao ","Chuang ","Jiong ","Xiao ","Cheng ","Kou ","Cuan ","Wo ","Dan ","Ku ","Ke ","Zhui ","Xu ","Su ","Guan ","Kui ","Dou ",null,"Yin ","Wo ","Wa ","Ya ","Yu ","Ju ","Qiong ","Yao ","Yao ","Tiao ","Chao ","Yu ","Tian ","Diao ","Ju ","Liao ","Xi ","Wu ","Kui ","Chuang ","Zhao ",null,"Kuan ","Long ","Cheng ","Cui ","Piao ","Zao ","Cuan ","Qiao ","Qiong ","Dou ","Zao ","Long ","Qie ","Li ","Chu ","Shi ","Fou ","Qian ","Chu ","Hong ","Qi ","Qian ","Gong ","Shi ","Shu ","Miao ","Ju ","Zhan ","Zhu ","Ling ","Long ","Bing ","Jing ","Jing ","Zhang ","Yi ","Si ","Jun ","Hong ","Tong ","Song ","Jing ","Diao ","Yi ","Shu ","Jing ","Qu ","Jie ","Ping ","Duan ","Shao ","Zhuan ","Ceng ","Deng ","Cui ","Huai ","Jing ","Kan ","Jing ","Zhu ","Zhu ","Le ","Peng ","Yu ","Chi ","Gan "],
  "123": ["Mang ","Zhu ","Utsubo ","Du ","Ji ","Xiao ","Ba ","Suan ","Ji ","Zhen ","Zhao ","Sun ","Ya ","Zhui ","Yuan ","Hu ","Gang ","Xiao ","Cen ","Pi ","Bi ","Jian ","Yi ","Dong ","Shan ","Sheng ","Xia ","Di ","Zhu ","Na ","Chi ","Gu ","Li ","Qie ","Min ","Bao ","Tiao ","Si ","Fu ","Ce ","Ben ","Pei ","Da ","Zi ","Di ","Ling ","Ze ","Nu ","Fu ","Gou ","Fan ","Jia ","Ge ","Fan ","Shi ","Mao ","Po ","Sey ","Jian ","Qiong ","Long ","Souke ","Bian ","Luo ","Gui ","Qu ","Chi ","Yin ","Yao ","Xian ","Bi ","Qiong ","Gua ","Deng ","Jiao ","Jin ","Quan ","Sun ","Ru ","Fa ","Kuang ","Zhu ","Tong ","Ji ","Da ","Xing ","Ce ","Zhong ","Kou ","Lai ","Bi ","Shai ","Dang ","Zheng ","Ce ","Fu ","Yun ","Tu ","Pa ","Li ","Lang ","Ju ","Guan ","Jian ","Han ","Tong ","Xia ","Zhi ","Cheng ","Suan ","Shi ","Zhu ","Zuo ","Xiao ","Shao ","Ting ","Ce ","Yan ","Gao ","Kuai ","Gan ","Chou ","Kago ","Gang ","Yun ","O ","Qian ","Xiao ","Jian ","Pu ","Lai ","Zou ","Bi ","Bi ","Bi ","Ge ","Chi ","Guai ","Yu ","Jian ","Zhao ","Gu ","Chi ","Zheng ","Jing ","Sha ","Zhou ","Lu ","Bo ","Ji ","Lin ","Suan ","Jun ","Fu ","Zha ","Gu ","Kong ","Qian ","Quan ","Jun ","Chui ","Guan ","Yuan ","Ce ","Ju ","Bo ","Ze ","Qie ","Tuo ","Luo ","Dan ","Xiao ","Ruo ","Jian ","Xuan ","Bian ","Sun ","Xiang ","Xian ","Ping ","Zhen ","Sheng ","Hu ","Shi ","Zhu ","Yue ","Chun ","Lu ","Wu ","Dong ","Xiao ","Ji ","Jie ","Huang ","Xing ","Mei ","Fan ","Chui ","Zhuan ","Pian ","Feng ","Zhu ","Hong ","Qie ","Hou ","Qiu ","Miao ","Qian ",null,"Kui ","Sik ","Lou ","Yun ","He ","Tang ","Yue ","Chou ","Gao ","Fei ","Ruo ","Zheng ","Gou ","Nie ","Qian ","Xiao ","Cuan ","Gong ","Pang ","Du ","Li ","Bi ","Zhuo ","Chu ","Shai ","Chi ","Zhu ","Qiang ","Long ","Lan ","Jian ","Bu ","Li ","Hui ","Bi ","Di ","Cong ","Yan ","Peng ","Sen ","Zhuan ","Pai ","Piao ","Dou ","Yu ","Mie ","Zhuan "],
  "124": ["Ze ","Xi ","Guo ","Yi ","Hu ","Chan ","Kou ","Cu ","Ping ","Chou ","Ji ","Gui ","Su ","Lou ","Zha ","Lu ","Nian ","Suo ","Cuan ","Sasara ","Suo ","Le ","Duan ","Yana ","Xiao ","Bo ","Mi ","Si ","Dang ","Liao ","Dan ","Dian ","Fu ","Jian ","Min ","Kui ","Dai ","Qiao ","Deng ","Huang ","Sun ","Lao ","Zan ","Xiao ","Du ","Shi ","Zan ",null,"Pai ","Hata ","Pai ","Gan ","Ju ","Du ","Lu ","Yan ","Bo ","Dang ","Sai ","Ke ","Long ","Qian ","Lian ","Bo ","Zhou ","Lai ",null,"Lan ","Kui ","Yu ","Yue ","Hao ","Zhen ","Tai ","Ti ","Mi ","Chou ","Ji ",null,"Hata ","Teng ","Zhuan ","Zhou ","Fan ","Sou ","Zhou ","Kuji ","Zhuo ","Teng ","Lu ","Lu ","Jian ","Tuo ","Ying ","Yu ","Lai ","Long ","Shinshi ","Lian ","Lan ","Qian ","Yue ","Zhong ","Qu ","Lian ","Bian ","Duan ","Zuan ","Li ","Si ","Luo ","Ying ","Yue ","Zhuo ","Xu ","Mi ","Di ","Fan ","Shen ","Zhe ","Shen ","Nu ","Xie ","Lei ","Xian ","Zi ","Ni ","Cun ",null,"Qian ","Kume ","Bi ","Ban ","Wu ","Sha ","Kang ","Rou ","Fen ","Bi ","Cui ",null,"Li ","Chi ","Nukamiso ","Ro ","Ba ","Li ","Gan ","Ju ","Po ","Mo ","Cu ","Nian ","Zhou ","Li ","Su ","Tiao ","Li ","Qi ","Su ","Hong ","Tong ","Zi ","Ce ","Yue ","Zhou ","Lin ","Zhuang ","Bai ",null,"Fen ","Ji ",null,"Sukumo ","Liang ","Xian ","Fu ","Liang ","Can ","Geng ","Li ","Yue ","Lu ","Ju ","Qi ","Cui ","Bai ","Zhang ","Lin ","Zong ","Jing ","Guo ","Kouji ","San ","San ","Tang ","Bian ","Rou ","Mian ","Hou ","Xu ","Zong ","Hu ","Jian ","Zan ","Ci ","Li ","Xie ","Fu ","Ni ","Bei ","Gu ","Xiu ","Gao ","Tang ","Qiu ","Sukumo ","Cao ","Zhuang ","Tang ","Mi ","San ","Fen ","Zao ","Kang ","Jiang ","Mo ","San ","San ","Nuo ","Xi ","Liang ","Jiang ","Kuai ","Bo ","Huan ",null,"Zong ","Xian ","Nuo ","Tuan ","Nie ","Li ","Zuo ","Di ","Nie ","Tiao ","Lan ","Mi ","Jiao ","Jiu ","Xi ","Gong ","Zheng ","Jiu ","You "],
  "125": ["Ji ","Cha ","Zhou ","Xun ","Yue ","Hong ","Yu ","He ","Wan ","Ren ","Wen ","Wen ","Qiu ","Na ","Zi ","Tou ","Niu ","Fou ","Jie ","Shu ","Chun ","Pi ","Yin ","Sha ","Hong ","Zhi ","Ji ","Fen ","Yun ","Ren ","Dan ","Jin ","Su ","Fang ","Suo ","Cui ","Jiu ","Zha ","Kinu ","Jin ","Fu ","Zhi ","Ci ","Zi ","Chou ","Hong ","Zha ","Lei ","Xi ","Fu ","Xie ","Shen ","Bei ","Zhu ","Qu ","Ling ","Zhu ","Shao ","Gan ","Yang ","Fu ","Tuo ","Zhen ","Dai ","Zhuo ","Shi ","Zhong ","Xian ","Zu ","Jiong ","Ban ","Ju ","Mo ","Shu ","Zui ","Wata ","Jing ","Ren ","Heng ","Xie ","Jie ","Zhu ","Chou ","Gua ","Bai ","Jue ","Kuang ","Hu ","Ci ","Geng ","Geng ","Tao ","Xie ","Ku ","Jiao ","Quan ","Gai ","Luo ","Xuan ","Bing ","Xian ","Fu ","Gei ","Tong ","Rong ","Tiao ","Yin ","Lei ","Xie ","Quan ","Xu ","Lun ","Die ","Tong ","Si ","Jiang ","Xiang ","Hui ","Jue ","Zhi ","Jian ","Juan ","Chi ","Mian ","Zhen ","Lu ","Cheng ","Qiu ","Shu ","Bang ","Tong ","Xiao ","Wan ","Qin ","Geng ","Xiu ","Ti ","Xiu ","Xie ","Hong ","Xi ","Fu ","Ting ","Sui ","Dui ","Kun ","Fu ","Jing ","Hu ","Zhi ","Yan ","Jiong ","Feng ","Ji ","Sok ","Kase ","Zong ","Lin ","Duo ","Li ","Lu ","Liang ","Chou ","Quan ","Shao ","Qi ","Qi ","Zhun ","Qi ","Wan ","Qian ","Xian ","Shou ","Wei ","Qi ","Tao ","Wan ","Gang ","Wang ","Beng ","Zhui ","Cai ","Guo ","Cui ","Lun ","Liu ","Qi ","Zhan ","Bei ","Chuo ","Ling ","Mian ","Qi ","Qie ","Tan ","Zong ","Gun ","Zou ","Yi ","Zi ","Xing ","Liang ","Jin ","Fei ","Rui ","Min ","Yu ","Zong ","Fan ","Lu ","Xu ","Yingl ","Zhang ","Kasuri ","Xu ","Xiang ","Jian ","Ke ","Xian ","Ruan ","Mian ","Qi ","Duan ","Zhong ","Di ","Min ","Miao ","Yuan ","Xie ","Bao ","Si ","Qiu ","Bian ","Huan ","Geng ","Cong ","Mian ","Wei ","Fu ","Wei ","Yu ","Gou ","Miao ","Xie ","Lian ","Zong ","Bian ","Yun ","Yin ","Ti ","Gua ","Zhi ","Yun ","Cheng ","Chan ","Dai "],
  "126": ["Xia ","Yuan ","Zong ","Xu ","Nawa ","Odoshi ","Geng ","Sen ","Ying ","Jin ","Yi ","Zhui ","Ni ","Bang ","Gu ","Pan ","Zhou ","Jian ","Cuo ","Quan ","Shuang ","Yun ","Xia ","Shuai ","Xi ","Rong ","Tao ","Fu ","Yun ","Zhen ","Gao ","Ru ","Hu ","Zai ","Teng ","Xian ","Su ","Zhen ","Zong ","Tao ","Horo ","Cai ","Bi ","Feng ","Cu ","Li ","Suo ","Yin ","Xi ","Zong ","Lei ","Zhuan ","Qian ","Man ","Zhi ","Lu ","Mo ","Piao ","Lian ","Mi ","Xuan ","Zong ","Ji ","Shan ","Sui ","Fan ","Shuai ","Beng ","Yi ","Sao ","Mou ","Zhou ","Qiang ","Hun ","Sem ","Xi ","Jung ","Xiu ","Ran ","Xuan ","Hui ","Qiao ","Zeng ","Zuo ","Zhi ","Shan ","San ","Lin ","Yu ","Fan ","Liao ","Chuo ","Zun ","Jian ","Rao ","Chan ","Rui ","Xiu ","Hui ","Hua ","Zuan ","Xi ","Qiang ","Un ","Da ","Sheng ","Hui ","Xi ","Se ","Jian ","Jiang ","Huan ","Zao ","Cong ","Jie ","Jiao ","Bo ","Chan ","Yi ","Nao ","Sui ","Yi ","Shai ","Xu ","Ji ","Bin ","Qian ","Lan ","Pu ","Xun ","Zuan ","Qi ","Peng ","Li ","Mo ","Lei ","Xie ","Zuan ","Kuang ","You ","Xu ","Lei ","Xian ","Chan ","Kou ","Lu ","Chan ","Ying ","Cai ","Xiang ","Xian ","Zui ","Zuan ","Luo ","Xi ","Dao ","Lan ","Lei ","Lian ","Si ","Jiu ","Yu ","Hong ","Zhou ","Xian ","He ","Yue ","Ji ","Wan ","Kuang ","Ji ","Ren ","Wei ","Yun ","Hong ","Chun ","Pi ","Sha ","Gang ","Na ","Ren ","Zong ","Lun ","Fen ","Zhi ","Wen ","Fang ","Zhu ","Yin ","Niu ","Shu ","Xian ","Gan ","Xie ","Fu ","Lian ","Zu ","Shen ","Xi ","Zhi ","Zhong ","Zhou ","Ban ","Fu ","Zhuo ","Shao ","Yi ","Jing ","Dai ","Bang ","Rong ","Jie ","Ku ","Rao ","Die ","Heng ","Hui ","Gei ","Xuan ","Jiang ","Luo ","Jue ","Jiao ","Tong ","Geng ","Xiao ","Juan ","Xiu ","Xi ","Sui ","Tao ","Ji ","Ti ","Ji ","Xu ","Ling ",null,"Xu ","Qi ","Fei ","Chuo ","Zhang ","Gun ","Sheng ","Wei ","Mian ","Shou ","Beng ","Chou ","Tao ","Liu ","Quan ","Zong ","Zhan ","Wan ","Lu "],
  "127": ["Zhui ","Zi ","Ke ","Xiang ","Jian ","Mian ","Lan ","Ti ","Miao ","Qi ","Yun ","Hui ","Si ","Duo ","Duan ","Bian ","Xian ","Gou ","Zhui ","Huan ","Di ","Lu ","Bian ","Min ","Yuan ","Jin ","Fu ","Ru ","Zhen ","Feng ","Shuai ","Gao ","Chan ","Li ","Yi ","Jian ","Bin ","Piao ","Man ","Lei ","Ying ","Suo ","Mou ","Sao ","Xie ","Liao ","Shan ","Zeng ","Jiang ","Qian ","Zao ","Huan ","Jiao ","Zuan ","Fou ","Xie ","Gang ","Fou ","Que ","Fou ","Kaakeru ","Bo ","Ping ","Hou ",null,"Gang ","Ying ","Ying ","Qing ","Xia ","Guan ","Zun ","Tan ","Chang ","Qi ","Weng ","Ying ","Lei ","Tan ","Lu ","Guan ","Wang ","Wang ","Gang ","Wang ","Han ",null,"Luo ","Fu ","Mi ","Fa ","Gu ","Zhu ","Ju ","Mao ","Gu ","Min ","Gang ","Ba ","Gua ","Ti ","Juan ","Fu ","Lin ","Yan ","Zhao ","Zui ","Gua ","Zhuo ","Yu ","Zhi ","An ","Fa ","Nan ","Shu ","Si ","Pi ","Ma ","Liu ","Ba ","Fa ","Li ","Chao ","Wei ","Bi ","Ji ","Zeng ","Tong ","Liu ","Ji ","Juan ","Mi ","Zhao ","Luo ","Pi ","Ji ","Ji ","Luan ","Yang ","Mie ","Qiang ","Ta ","Mei ","Yang ","You ","You ","Fen ","Ba ","Gao ","Yang ","Gu ","Qiang ","Zang ","Gao ","Ling ","Yi ","Zhu ","Di ","Xiu ","Qian ","Yi ","Xian ","Rong ","Qun ","Qun ","Qian ","Huan ","Zui ","Xian ","Yi ","Yashinau ","Qiang ","Xian ","Yu ","Geng ","Jie ","Tang ","Yuan ","Xi ","Fan ","Shan ","Fen ","Shan ","Lian ","Lei ","Geng ","Nou ","Qiang ","Chan ","Yu ","Gong ","Yi ","Chong ","Weng ","Fen ","Hong ","Chi ","Chi ","Cui ","Fu ","Xia ","Pen ","Yi ","La ","Yi ","Pi ","Ling ","Liu ","Zhi ","Qu ","Xi ","Xie ","Xiang ","Xi ","Xi ","Qi ","Qiao ","Hui ","Hui ","Xiao ","Se ","Hong ","Jiang ","Di ","Cui ","Fei ","Tao ","Sha ","Chi ","Zhu ","Jian ","Xuan ","Shi ","Pian ","Zong ","Wan ","Hui ","Hou ","He ","He ","Han ","Ao ","Piao ","Yi ","Lian ","Qu ",null,"Lin ","Pen ","Qiao ","Ao ","Fan ","Yi ","Hui ","Xuan ","Dao "],
  "128": ["Yao ","Lao ",null,"Kao ","Mao ","Zhe ","Qi ","Gou ","Gou ","Gou ","Die ","Die ","Er ","Shua ","Ruan ","Er ","Nai ","Zhuan ","Lei ","Ting ","Zi ","Geng ","Chao ","Hao ","Yun ","Pa ","Pi ","Chi ","Si ","Chu ","Jia ","Ju ","He ","Chu ","Lao ","Lun ","Ji ","Tang ","Ou ","Lou ","Nou ","Gou ","Pang ","Ze ","Lou ","Ji ","Lao ","Huo ","You ","Mo ","Huai ","Er ","Zhe ","Ting ","Ye ","Da ","Song ","Qin ","Yun ","Chi ","Dan ","Dan ","Hong ","Geng ","Zhi ",null,"Nie ","Dan ","Zhen ","Che ","Ling ","Zheng ","You ","Wa ","Liao ","Long ","Zhi ","Ning ","Tiao ","Er ","Ya ","Die ","Gua ",null,"Lian ","Hao ","Sheng ","Lie ","Pin ","Jing ","Ju ","Bi ","Di ","Guo ","Wen ","Xu ","Ping ","Cong ","Shikato ",null,"Ting ","Yu ","Cong ","Kui ","Tsuraneru ","Kui ","Cong ","Lian ","Weng ","Kui ","Lian ","Lian ","Cong ","Ao ","Sheng ","Song ","Ting ","Kui ","Nie ","Zhi ","Dan ","Ning ","Qie ","Ji ","Ting ","Ting ","Long ","Yu ","Yu ","Zhao ","Si ","Su ","Yi ","Su ","Si ","Zhao ","Zhao ","Rou ","Yi ","Le ","Ji ","Qiu ","Ken ","Cao ","Ge ","Di ","Huan ","Huang ","Yi ","Ren ","Xiao ","Ru ","Zhou ","Yuan ","Du ","Gang ","Rong ","Gan ","Cha ","Wo ","Chang ","Gu ","Zhi ","Han ","Fu ","Fei ","Fen ","Pei ","Pang ","Jian ","Fang ","Zhun ","You ","Na ","Hang ","Ken ","Ran ","Gong ","Yu ","Wen ","Yao ","Jin ","Pi ","Qian ","Xi ","Xi ","Fei ","Ken ","Jing ","Tai ","Shen ","Zhong ","Zhang ","Xie ","Shen ","Wei ","Zhou ","Die ","Dan ","Fei ","Ba ","Bo ","Qu ","Tian ","Bei ","Gua ","Tai ","Zi ","Ku ","Zhi ","Ni ","Ping ","Zi ","Fu ","Pang ","Zhen ","Xian ","Zuo ","Pei ","Jia ","Sheng ","Zhi ","Bao ","Mu ","Qu ","Hu ","Ke ","Yi ","Yin ","Xu ","Yang ","Long ","Dong ","Ka ","Lu ","Jing ","Nu ","Yan ","Pang ","Kua ","Yi ","Guang ","Gai ","Ge ","Dong ","Zhi ","Xiao ","Xiong ","Xiong ","Er ","E ","Xing ","Pian ","Neng ","Zi ","Gui "],
  "129": ["Cheng ","Tiao ","Zhi ","Cui ","Mei ","Xie ","Cui ","Xie ","Mo ","Mai ","Ji ","Obiyaakasu ",null,"Kuai ","Sa ","Zang ","Qi ","Nao ","Mi ","Nong ","Luan ","Wan ","Bo ","Wen ","Guan ","Qiu ","Jiao ","Jing ","Rou ","Heng ","Cuo ","Lie ","Shan ","Ting ","Mei ","Chun ","Shen ","Xie ","De ","Zui ","Cu ","Xiu ","Xin ","Tuo ","Pao ","Cheng ","Nei ","Fu ","Dou ","Tuo ","Niao ","Noy ","Pi ","Gu ","Gua ","Li ","Lian ","Zhang ","Cui ","Jie ","Liang ","Zhou ","Pi ","Biao ","Lun ","Pian ","Guo ","Kui ","Chui ","Dan ","Tian ","Nei ","Jing ","Jie ","La ","Yi ","An ","Ren ","Shen ","Chuo ","Fu ","Fu ","Ju ","Fei ","Qiang ","Wan ","Dong ","Pi ","Guo ","Zong ","Ding ","Wu ","Mei ","Ruan ","Zhuan ","Zhi ","Cou ","Gua ","Ou ","Di ","An ","Xing ","Nao ","Yu ","Chuan ","Nan ","Yun ","Zhong ","Rou ","E ","Sai ","Tu ","Yao ","Jian ","Wei ","Jiao ","Yu ","Jia ","Duan ","Bi ","Chang ","Fu ","Xian ","Ni ","Mian ","Wa ","Teng ","Tui ","Bang ","Qian ","Lu ","Wa ","Sou ","Tang ","Su ","Zhui ","Ge ","Yi ","Bo ","Liao ","Ji ","Pi ","Xie ","Gao ","Lu ","Bin ","Ou ","Chang ","Lu ","Guo ","Pang ","Chuai ","Piao ","Jiang ","Fu ","Tang ","Mo ","Xi ","Zhuan ","Lu ","Jiao ","Ying ","Lu ","Zhi ","Tara ","Chun ","Lian ","Tong ","Peng ","Ni ","Zha ","Liao ","Cui ","Gui ","Xiao ","Teng ","Fan ","Zhi ","Jiao ","Shan ","Wu ","Cui ","Run ","Xiang ","Sui ","Fen ","Ying ","Tan ","Zhua ","Dan ","Kuai ","Nong ","Tun ","Lian ","Bi ","Yong ","Jue ","Chu ","Yi ","Juan ","La ","Lian ","Sao ","Tun ","Gu ","Qi ","Cui ","Bin ","Xun ","Ru ","Huo ","Zang ","Xian ","Biao ","Xing ","Kuan ","La ","Yan ","Lu ","Huo ","Zang ","Luo ","Qu ","Zang ","Luan ","Ni ","Zang ","Chen ","Qian ","Wo ","Guang ","Zang ","Lin ","Guang ","Zi ","Jiao ","Nie ","Chou ","Ji ","Gao ","Chou ","Mian ","Nie ","Zhi ","Zhi ","Ge ","Jian ","Die ","Zhi ","Xiu ","Tai ","Zhen ","Jiu ","Xian ","Yu ","Cha "],
  "130": ["Yao ","Yu ","Chong ","Xi ","Xi ","Jiu ","Yu ","Yu ","Xing ","Ju ","Jiu ","Xin ","She ","She ","Yadoru ","Jiu ","Shi ","Tan ","Shu ","Shi ","Tian ","Dan ","Pu ","Pu ","Guan ","Hua ","Tan ","Chuan ","Shun ","Xia ","Wu ","Zhou ","Dao ","Gang ","Shan ","Yi ",null,"Pa ","Tai ","Fan ","Ban ","Chuan ","Hang ","Fang ","Ban ","Que ","Hesaki ","Zhong ","Jian ","Cang ","Ling ","Zhu ","Ze ","Duo ","Bo ","Xian ","Ge ","Chuan ","Jia ","Lu ","Hong ","Pang ","Xi ",null,"Fu ","Zao ","Feng ","Li ","Shao ","Yu ","Lang ","Ting ",null,"Wei ","Bo ","Meng ","Nian ","Ju ","Huang ","Shou ","Zong ","Bian ","Mao ","Die ",null,"Bang ","Cha ","Yi ","Sao ","Cang ","Cao ","Lou ","Dai ","Sori ","Yao ","Tong ","Yofune ","Dang ","Tan ","Lu ","Yi ","Jie ","Jian ","Huo ","Meng ","Qi ","Lu ","Lu ","Chan ","Shuang ","Gen ","Liang ","Jian ","Jian ","Se ","Yan ","Fu ","Ping ","Yan ","Yan ","Cao ","Cao ","Yi ","Le ","Ting ","Qiu ","Ai ","Nai ","Tiao ","Jiao ","Jie ","Peng ","Wan ","Yi ","Chai ","Mian ","Mie ","Gan ","Qian ","Yu ","Yu ","Shuo ","Qiong ","Tu ","Xia ","Qi ","Mang ","Zi ","Hui ","Sui ","Zhi ","Xiang ","Bi ","Fu ","Tun ","Wei ","Wu ","Zhi ","Qi ","Shan ","Wen ","Qian ","Ren ","Fou ","Kou ","Jie ","Lu ","Xu ","Ji ","Qin ","Qi ","Yuan ","Fen ","Ba ","Rui ","Xin ","Ji ","Hua ","Hua ","Fang ","Wu ","Jue ","Gou ","Zhi ","Yun ","Qin ","Ao ","Chu ","Mao ","Ya ","Fei ","Reng ","Hang ","Cong ","Yin ","You ","Bian ","Yi ","Susa ","Wei ","Li ","Pi ","E ","Xian ","Chang ","Cang ","Meng ","Su ","Yi ","Yuan ","Ran ","Ling ","Tai ","Tiao ","Di ","Miao ","Qiong ","Li ","Yong ","Ke ","Mu ","Pei ","Bao ","Gou ","Min ","Yi ","Yi ","Ju ","Pi ","Ruo ","Ku ","Zhu ","Ni ","Bo ","Bing ","Shan ","Qiu ","Yao ","Xian ","Ben ","Hong ","Ying ","Zha ","Dong ","Ju ","Die ","Nie ","Gan ","Hu ","Ping ","Mei ","Fu ","Sheng ","Gu ","Bi ","Wei "],
  "131": ["Fu ","Zhuo ","Mao ","Fan ","Qie ","Mao ","Mao ","Ba ","Zi ","Mo ","Zi ","Di ","Chi ","Ji ","Jing ","Long ",null,"Niao ",null,"Xue ","Ying ","Qiong ","Ge ","Ming ","Li ","Rong ","Yin ","Gen ","Qian ","Chai ","Chen ","Yu ","Xiu ","Zi ","Lie ","Wu ","Ji ","Kui ","Ce ","Chong ","Ci ","Gou ","Guang ","Mang ","Chi ","Jiao ","Jiao ","Fu ","Yu ","Zhu ","Zi ","Jiang ","Hui ","Yin ","Cha ","Fa ","Rong ","Ru ","Chong ","Mang ","Tong ","Zhong ",null,"Zhu ","Xun ","Huan ","Kua ","Quan ","Gai ","Da ","Jing ","Xing ","Quan ","Cao ","Jing ","Er ","An ","Shou ","Chi ","Ren ","Jian ","Ti ","Huang ","Ping ","Li ","Jin ","Lao ","Shu ","Zhuang ","Da ","Jia ","Rao ","Bi ","Ze ","Qiao ","Hui ","Qi ","Dang ",null,"Rong ","Hun ","Ying ","Luo ","Ying ","Xun ","Jin ","Sun ","Yin ","Mai ","Hong ","Zhou ","Yao ","Du ","Wei ","Chu ","Dou ","Fu ","Ren ","Yin ","He ","Bi ","Bu ","Yun ","Di ","Tu ","Sui ","Sui ","Cheng ","Chen ","Wu ","Bie ","Xi ","Geng ","Li ","Fu ","Zhu ","Mo ","Li ","Zhuang ","Ji ","Duo ","Qiu ","Sha ","Suo ","Chen ","Feng ","Ju ","Mei ","Meng ","Xing ","Jing ","Che ","Xin ","Jun ","Yan ","Ting ","Diao ","Cuo ","Wan ","Han ","You ","Cuo ","Jia ","Wang ","You ","Niu ","Shao ","Xian ","Lang ","Fu ","E ","Mo ","Wen ","Jie ","Nan ","Mu ","Kan ","Lai ","Lian ","Shi ","Wo ","Usagi ","Lian ","Huo ","You ","Ying ","Ying ","Nuc ","Chun ","Mang ","Mang ","Ci ","Wan ","Jing ","Di ","Qu ","Dong ","Jian ","Zou ","Gu ","La ","Lu ","Ju ","Wei ","Jun ","Nie ","Kun ","He ","Pu ","Zi ","Gao ","Guo ","Fu ","Lun ","Chang ","Chou ","Song ","Chui ","Zhan ","Men ","Cai ","Ba ","Li ","Tu ","Bo ","Han ","Bao ","Qin ","Juan ","Xi ","Qin ","Di ","Jie ","Pu ","Dang ","Jin ","Zhao ","Tai ","Geng ","Hua ","Gu ","Ling ","Fei ","Jin ","An ","Wang ","Beng ","Zhou ","Yan ","Ju ","Jian ","Lin ","Tan ","Shu ","Tian ","Dao "],
  "132": ["Hu ","Qi ","He ","Cui ","Tao ","Chun ","Bei ","Chang ","Huan ","Fei ","Lai ","Qi ","Meng ","Ping ","Wei ","Dan ","Sha ","Huan ","Yan ","Yi ","Tiao ","Qi ","Wan ","Ce ","Nai ","Kutabireru ","Tuo ","Jiu ","Tie ","Luo ",null,null,"Meng ",null,"Yaji ",null,"Ying ","Ying ","Ying ","Xiao ","Sa ","Qiu ","Ke ","Xiang ","Wan ","Yu ","Yu ","Fu ","Lian ","Xuan ","Yuan ","Nan ","Ze ","Wo ","Chun ","Xiao ","Yu ","Pian ","Mao ","An ","E ","Luo ","Ying ","Huo ","Gua ","Jiang ","Mian ","Zuo ","Zuo ","Ju ","Bao ","Rou ","Xi ","Xie ","An ","Qu ","Jian ","Fu ","Lu ","Jing ","Pen ","Feng ","Hong ","Hong ","Hou ","Yan ","Tu ","Zhu ","Zi ","Xiang ","Shen ","Ge ","Jie ","Jing ","Mi ","Huang ","Shen ","Pu ","Gai ","Dong ","Zhou ","Qian ","Wei ","Bo ","Wei ","Pa ","Ji ","Hu ","Zang ","Jia ","Duan ","Yao ","Jun ","Cong ","Quan ","Wei ","Xian ","Kui ","Ting ","Hun ","Xi ","Shi ","Qi ","Lan ","Zong ","Yao ","Yuan ","Mei ","Yun ","Shu ","Di ","Zhuan ","Guan ","Sukumo ","Xue ","Chan ","Kai ","Kui ",null,"Jiang ","Lou ","Wei ","Pai ",null,"Sou ","Yin ","Shi ","Chun ","Shi ","Yun ","Zhen ","Lang ","Nu ","Meng ","He ","Que ","Suan ","Yuan ","Li ","Ju ","Xi ","Pang ","Chu ","Xu ","Tu ","Liu ","Wo ","Zhen ","Qian ","Zu ","Po ","Cuo ","Yuan ","Chu ","Yu ","Kuai ","Pan ","Pu ","Pu ","Na ","Shuo ","Xi ","Fen ","Yun ","Zheng ","Jian ","Ji ","Ruo ","Cang ","En ","Mi ","Hao ","Sun ","Zhen ","Ming ","Sou ","Xu ","Liu ","Xi ","Gu ","Lang ","Rong ","Weng ","Gai ","Cuo ","Shi ","Tang ","Luo ","Ru ","Suo ","Xian ","Bei ","Yao ","Gui ","Bi ","Zong ","Gun ","Za ","Xiu ","Ce ","Hai ","Lan ",null,"Ji ","Li ","Can ","Lang ","Yu ",null,"Ying ","Mo ","Diao ","Tiao ","Mao ","Tong ","Zhu ","Peng ","An ","Lian ","Cong ","Xi ","Ping ","Qiu ","Jin ","Chun ","Jie ","Wei ","Tui ","Cao ","Yu ","Yi ","Ji ","Liao ","Bi ","Lu ","Su "],
  "133": ["Bu ","Zhang ","Luo ","Jiang ","Man ","Yan ","Ling ","Ji ","Piao ","Gun ","Han ","Di ","Su ","Lu ","She ","Shang ","Di ","Mie ","Xun ","Man ","Bo ","Di ","Cuo ","Zhe ","Sen ","Xuan ","Wei ","Hu ","Ao ","Mi ","Lou ","Cu ","Zhong ","Cai ","Po ","Jiang ","Mi ","Cong ","Niao ","Hui ","Jun ","Yin ","Jian ","Yan ","Shu ","Yin ","Kui ","Chen ","Hu ","Sha ","Kou ","Qian ","Ma ","Zang ","Sonoko ","Qiang ","Dou ","Lian ","Lin ","Kou ","Ai ","Bi ","Li ","Wei ","Ji ","Xun ","Sheng ","Fan ","Meng ","Ou ","Chan ","Dian ","Xun ","Jiao ","Rui ","Rui ","Lei ","Yu ","Qiao ","Chu ","Hua ","Jian ","Mai ","Yun ","Bao ","You ","Qu ","Lu ","Rao ","Hui ","E ","Teng ","Fei ","Jue ","Zui ","Fa ","Ru ","Fen ","Kui ","Shun ","Rui ","Ya ","Xu ","Fu ","Jue ","Dang ","Wu ","Tong ","Si ","Xiao ","Xi ","Long ","Yun ",null,"Qi ","Jian ","Yun ","Sun ","Ling ","Yu ","Xia ","Yong ","Ji ","Hong ","Si ","Nong ","Lei ","Xuan ","Yun ","Yu ","Xi ","Hao ","Bo ","Hao ","Ai ","Wei ","Hui ","Wei ","Ji ","Ci ","Xiang ","Luan ","Mie ","Yi ","Leng ","Jiang ","Can ","Shen ","Qiang ","Lian ","Ke ","Yuan ","Da ","Ti ","Tang ","Xie ","Bi ","Zhan ","Sun ","Lian ","Fan ","Ding ","Jie ","Gu ","Xie ","Shu ","Jian ","Kao ","Hong ","Sa ","Xin ","Xun ","Yao ","Hie ","Sou ","Shu ","Xun ","Dui ","Pin ","Wei ","Neng ","Chou ","Mai ","Ru ","Piao ","Tai ","Qi ","Zao ","Chen ","Zhen ","Er ","Ni ","Ying ","Gao ","Cong ","Xiao ","Qi ","Fa ","Jian ","Xu ","Kui ","Jie ","Bian ","Diao ","Mi ","Lan ","Jin ","Cang ","Miao ","Qiong ","Qie ","Xian ",null,"Ou ","Xian ","Su ","Lu ","Yi ","Xu ","Xie ","Li ","Yi ","La ","Lei ","Xiao ","Di ","Zhi ","Bei ","Teng ","Yao ","Mo ","Huan ","Piao ","Fan ","Sou ","Tan ","Tui ","Qiong ","Qiao ","Wei ","Liu ","Hui ",null,"Gao ","Yun ",null,"Li ","Shu ","Chu ","Ai ","Lin ","Zao ","Xuan ","Chen ","Lai ","Huo "],
  "134": ["Tuo ","Wu ","Rui ","Rui ","Qi ","Heng ","Lu ","Su ","Tui ","Mang ","Yun ","Pin ","Yu ","Xun ","Ji ","Jiong ","Xian ","Mo ","Hagi ","Su ","Jiong ",null,"Nie ","Bo ","Rang ","Yi ","Xian ","Yu ","Ju ","Lian ","Lian ","Yin ","Qiang ","Ying ","Long ","Tong ","Wei ","Yue ","Ling ","Qu ","Yao ","Fan ","Mi ","Lan ","Kui ","Lan ","Ji ","Dang ","Katsura ","Lei ","Lei ","Hua ","Feng ","Zhi ","Wei ","Kui ","Zhan ","Huai ","Li ","Ji ","Mi ","Lei ","Huai ","Luo ","Ji ","Kui ","Lu ","Jian ","San ",null,"Lei ","Quan ","Xiao ","Yi ","Luan ","Men ","Bie ","Hu ","Hu ","Lu ","Nue ","Lu ","Si ","Xiao ","Qian ","Chu ","Hu ","Xu ","Cuo ","Fu ","Xu ","Xu ","Lu ","Hu ","Yu ","Hao ","Jiao ","Ju ","Guo ","Bao ","Yan ","Zhan ","Zhan ","Kui ","Ban ","Xi ","Shu ","Chong ","Qiu ","Diao ","Ji ","Qiu ","Cheng ","Shi ",null,"Di ","Zhe ","She ","Yu ","Gan ","Zi ","Hong ","Hui ","Meng ","Ge ","Sui ","Xia ","Chai ","Shi ","Yi ","Ma ","Xiang ","Fang ","E ","Pa ","Chi ","Qian ","Wen ","Wen ","Rui ","Bang ","Bi ","Yue ","Yue ","Jun ","Qi ","Ran ","Yin ","Qi ","Tian ","Yuan ","Jue ","Hui ","Qin ","Qi ","Zhong ","Ya ","Ci ","Mu ","Wang ","Fen ","Fen ","Hang ","Gong ","Zao ","Fu ","Ran ","Jie ","Fu ","Chi ","Dou ","Piao ","Xian ","Ni ","Te ","Qiu ","You ","Zha ","Ping ","Chi ","You ","He ","Han ","Ju ","Li ","Fu ","Ran ","Zha ","Gou ","Pi ","Bo ","Xian ","Zhu ","Diao ","Bie ","Bing ","Gu ","Ran ","Qu ","She ","Tie ","Ling ","Gu ","Dan ","Gu ","Ying ","Li ","Cheng ","Qu ","Mou ","Ge ","Ci ","Hui ","Hui ","Mang ","Fu ","Yang ","Wa ","Lie ","Zhu ","Yi ","Xian ","Kuo ","Jiao ","Li ","Yi ","Ping ","Ji ","Ha ","She ","Yi ","Wang ","Mo ","Qiong ","Qie ","Gui ","Gong ","Zhi ","Man ","Ebi ","Zhi ","Jia ","Rao ","Si ","Qi ","Xing ","Lie ","Qiu ","Shao ","Yong ","Jia ","Shui ","Che ","Bai ","E ","Han "],
  "135": ["Shu ","Xuan ","Feng ","Shen ","Zhen ","Fu ","Xian ","Zhe ","Wu ","Fu ","Li ","Lang ","Bi ","Chu ","Yuan ","You ","Jie ","Dan ","Yan ","Ting ","Dian ","Shui ","Hui ","Gua ","Zhi ","Song ","Fei ","Ju ","Mi ","Qi ","Qi ","Yu ","Jun ","Zha ","Meng ","Qiang ","Si ","Xi ","Lun ","Li ","Die ","Tiao ","Tao ","Kun ","Gan ","Han ","Yu ","Bang ","Fei ","Pi ","Wei ","Dun ","Yi ","Yuan ","Su ","Quan ","Qian ","Rui ","Ni ","Qing ","Wei ","Liang ","Guo ","Wan ","Dong ","E ","Ban ","Di ","Wang ","Can ","Yang ","Ying ","Guo ","Chan ",null,"La ","Ke ","Ji ","He ","Ting ","Mai ","Xu ","Mian ","Yu ","Jie ","Shi ","Xuan ","Huang ","Yan ","Bian ","Rou ","Wei ","Fu ","Yuan ","Mei ","Wei ","Fu ","Ruan ","Xie ","You ","Qiu ","Mao ","Xia ","Ying ","Shi ","Chong ","Tang ","Zhu ","Zong ","Ti ","Fu ","Yuan ","Hui ","Meng ","La ","Du ","Hu ","Qiu ","Die ","Li ","Gua ","Yun ","Ju ","Nan ","Lou ","Qun ","Rong ","Ying ","Jiang ",null,"Lang ","Pang ","Si ","Xi ","Ci ","Xi ","Yuan ","Weng ","Lian ","Sou ","Ban ","Rong ","Rong ","Ji ","Wu ","Qiu ","Han ","Qin ","Yi ","Bi ","Hua ","Tang ","Yi ","Du ","Nai ","He ","Hu ","Hui ","Ma ","Ming ","Yi ","Wen ","Ying ","Teng ","Yu ","Cang ","So ","Ebi ","Man ",null,"Shang ","Zhe ","Cao ","Chi ","Di ","Ao ","Lu ","Wei ","Zhi ","Tang ","Chen ","Piao ","Qu ","Pi ","Yu ","Jian ","Luo ","Lou ","Qin ","Zhong ","Yin ","Jiang ","Shuai ","Wen ","Jiao ","Wan ","Zhi ","Zhe ","Ma ","Ma ","Guo ","Liu ","Mao ","Xi ","Cong ","Li ","Man ","Xiao ","Kamakiri ","Zhang ","Mang ","Xiang ","Mo ","Zui ","Si ","Qiu ","Te ","Zhi ","Peng ","Peng ","Jiao ","Qu ","Bie ","Liao ","Pan ","Gui ","Xi ","Ji ","Zhuan ","Huang ","Fei ","Lao ","Jue ","Jue ","Hui ","Yin ","Chan ","Jiao ","Shan ","Rao ","Xiao ","Mou ","Chong ","Xun ","Si ",null,"Cheng ","Dang ","Li ","Xie ","Shan ","Yi ","Jing ","Da ","Chan ","Qi "],
  "136": ["Ci ","Xiang ","She ","Luo ","Qin ","Ying ","Chai ","Li ","Ze ","Xuan ","Lian ","Zhu ","Ze ","Xie ","Mang ","Xie ","Qi ","Rong ","Jian ","Meng ","Hao ","Ruan ","Huo ","Zhuo ","Jie ","Bin ","He ","Mie ","Fan ","Lei ","Jie ","La ","Mi ","Li ","Chun ","Li ","Qiu ","Nie ","Lu ","Du ","Xiao ","Zhu ","Long ","Li ","Long ","Feng ","Ye ","Beng ","Shang ","Gu ","Juan ","Ying ",null,"Xi ","Can ","Qu ","Quan ","Du ","Can ","Man ","Jue ","Jie ","Zhu ","Zha ","Xie ","Huang ","Niu ","Pei ","Nu ","Xin ","Zhong ","Mo ","Er ","Ke ","Mie ","Xi ","Xing ","Yan ","Kan ","Yuan ",null,"Ling ","Xuan ","Shu ","Xian ","Tong ","Long ","Jie ","Xian ","Ya ","Hu ","Wei ","Dao ","Chong ","Wei ","Dao ","Zhun ","Heng ","Qu ","Yi ","Yi ","Bu ","Gan ","Yu ","Biao ","Cha ","Yi ","Shan ","Chen ","Fu ","Gun ","Fen ","Shuai ","Jie ","Na ","Zhong ","Dan ","Ri ","Zhong ","Zhong ","Xie ","Qi ","Xie ","Ran ","Zhi ","Ren ","Qin ","Jin ","Jun ","Yuan ","Mei ","Chai ","Ao ","Niao ","Hui ","Ran ","Jia ","Tuo ","Ling ","Dai ","Bao ","Pao ","Yao ","Zuo ","Bi ","Shao ","Tan ","Ju ","He ","Shu ","Xiu ","Zhen ","Yi ","Pa ","Bo ","Di ","Wa ","Fu ","Gun ","Zhi ","Zhi ","Ran ","Pan ","Yi ","Mao ","Tuo ","Na ","Kou ","Xian ","Chan ","Qu ","Bei ","Gun ","Xi ","Ne ","Bo ","Horo ","Fu ","Yi ","Chi ","Ku ","Ren ","Jiang ","Jia ","Cun ","Mo ","Jie ","Er ","Luo ","Ru ","Zhu ","Gui ","Yin ","Cai ","Lie ","Kamishimo ","Yuki ","Zhuang ","Dang ",null,"Kun ","Ken ","Niao ","Shu ","Jia ","Kun ","Cheng ","Li ","Juan ","Shen ","Pou ","Ge ","Yi ","Yu ","Zhen ","Liu ","Qiu ","Qun ","Ji ","Yi ","Bu ","Zhuang ","Shui ","Sha ","Qun ","Li ","Lian ","Lian ","Ku ","Jian ","Fou ","Chan ","Bi ","Gun ","Tao ","Yuan ","Ling ","Chi ","Chang ","Chou ","Duo ","Biao ","Liang ","Chang ","Pei ","Pei ","Fei ","Yuan ","Luo ","Guo ","Yan ","Du ","Xi ","Zhi ","Ju ","Qi "],
  "137": ["Ji ","Zhi ","Gua ","Ken ","Che ","Ti ","Ti ","Fu ","Chong ","Xie ","Bian ","Die ","Kun ","Duan ","Xiu ","Xiu ","He ","Yuan ","Bao ","Bao ","Fu ","Yu ","Tuan ","Yan ","Hui ","Bei ","Chu ","Lu ","Ena ","Hitoe ","Yun ","Da ","Gou ","Da ","Huai ","Rong ","Yuan ","Ru ","Nai ","Jiong ","Suo ","Ban ","Tun ","Chi ","Sang ","Niao ","Ying ","Jie ","Qian ","Huai ","Ku ","Lian ","Bao ","Li ","Zhe ","Shi ","Lu ","Yi ","Die ","Xie ","Xian ","Wei ","Biao ","Cao ","Ji ","Jiang ","Sen ","Bao ","Xiang ","Chihaya ","Pu ","Jian ","Zhuan ","Jian ","Zui ","Ji ","Dan ","Za ","Fan ","Bo ","Xiang ","Xin ","Bie ","Rao ","Man ","Lan ","Ao ","Duo ","Gui ","Cao ","Sui ","Nong ","Chan ","Lian ","Bi ","Jin ","Dang ","Shu ","Tan ","Bi ","Lan ","Pu ","Ru ","Zhi ",null,"Shu ","Wa ","Shi ","Bai ","Xie ","Bo ","Chen ","Lai ","Long ","Xi ","Xian ","Lan ","Zhe ","Dai ","Tasuki ","Zan ","Shi ","Jian ","Pan ","Yi ","Ran ","Ya ","Xi ","Xi ","Yao ","Feng ","Tan ",null,"Biao ","Fu ","Ba ","He ","Ji ","Ji ","Jian ","Guan ","Bian ","Yan ","Gui ","Jue ","Pian ","Mao ","Mi ","Mi ","Mie ","Shi ","Si ","Zhan ","Luo ","Jue ","Mi ","Tiao ","Lian ","Yao ","Zhi ","Jun ","Xi ","Shan ","Wei ","Xi ","Tian ","Yu ","Lan ","E ","Du ","Qin ","Pang ","Ji ","Ming ","Ying ","Gou ","Qu ","Zhan ","Jin ","Guan ","Deng ","Jian ","Luo ","Qu ","Jian ","Wei ","Jue ","Qu ","Luo ","Lan ","Shen ","Di ","Guan ","Jian ","Guan ","Yan ","Gui ","Mi ","Shi ","Zhan ","Lan ","Jue ","Ji ","Xi ","Di ","Tian ","Yu ","Gou ","Jin ","Qu ","Jiao ","Jiu ","Jin ","Cu ","Jue ","Zhi ","Chao ","Ji ","Gu ","Dan ","Zui ","Di ","Shang ","Hua ","Quan ","Ge ","Chi ","Jie ","Gui ","Gong ","Hong ","Jie ","Hun ","Qiu ","Xing ","Su ","Ni ","Ji ","Lu ","Zhi ","Zha ","Bi ","Xing ","Hu ","Shang ","Gong ","Zhi ","Xue ","Chu ","Xi ","Yi ","Lu ","Jue ","Xi ","Yan ","Xi "],
  "138": ["Yan ","Yan ","Ding ","Fu ","Qiu ","Qiu ","Jiao ","Hong ","Ji ","Fan ","Xun ","Diao ","Hong ","Cha ","Tao ","Xu ","Jie ","Yi ","Ren ","Xun ","Yin ","Shan ","Qi ","Tuo ","Ji ","Xun ","Yin ","E ","Fen ","Ya ","Yao ","Song ","Shen ","Yin ","Xin ","Jue ","Xiao ","Ne ","Chen ","You ","Zhi ","Xiong ","Fang ","Xin ","Chao ","She ","Xian ","Sha ","Tun ","Xu ","Yi ","Yi ","Su ","Chi ","He ","Shen ","He ","Xu ","Zhen ","Zhu ","Zheng ","Gou ","Zi ","Zi ","Zhan ","Gu ","Fu ","Quan ","Die ","Ling ","Di ","Yang ","Li ","Nao ","Pan ","Zhou ","Gan ","Yi ","Ju ","Ao ","Zha ","Tuo ","Yi ","Qu ","Zhao ","Ping ","Bi ","Xiong ","Qu ","Ba ","Da ","Zu ","Tao ","Zhu ","Ci ","Zhe ","Yong ","Xu ","Xun ","Yi ","Huang ","He ","Shi ","Cha ","Jiao ","Shi ","Hen ","Cha ","Gou ","Gui ","Quan ","Hui ","Jie ","Hua ","Gai ","Xiang ","Wei ","Shen ","Chou ","Tong ","Mi ","Zhan ","Ming ","E ","Hui ","Yan ","Xiong ","Gua ","Er ","Beng ","Tiao ","Chi ","Lei ","Zhu ","Kuang ","Kua ","Wu ","Yu ","Teng ","Ji ","Zhi ","Ren ","Su ","Lang ","E ","Kuang ","E ","Shi ","Ting ","Dan ","Bo ","Chan ","You ","Heng ","Qiao ","Qin ","Shua ","An ","Yu ","Xiao ","Cheng ","Jie ","Xian ","Wu ","Wu ","Gao ","Song ","Pu ","Hui ","Jing ","Shuo ","Zhen ","Shuo ","Du ","Yasashi ","Chang ","Shui ","Jie ","Ke ","Qu ","Cong ","Xiao ","Sui ","Wang ","Xuan ","Fei ","Chi ","Ta ","Yi ","Na ","Yin ","Diao ","Pi ","Chuo ","Chan ","Chen ","Zhun ","Ji ","Qi ","Tan ","Zhui ","Wei ","Ju ","Qing ","Jian ","Zheng ","Ze ","Zou ","Qian ","Zhuo ","Liang ","Jian ","Zhu ","Hao ","Lun ","Shen ","Biao ","Huai ","Pian ","Yu ","Die ","Xu ","Pian ","Shi ","Xuan ","Shi ","Hun ","Hua ","E ","Zhong ","Di ","Xie ","Fu ","Pu ","Ting ","Jian ","Qi ","Yu ","Zi ","Chuan ","Xi ","Hui ","Yin ","An ","Xian ","Nan ","Chen ","Feng ","Zhu ","Yang ","Yan ","Heng ","Xuan ","Ge ","Nuo ","Qi "],
  "139": ["Mou ","Ye ","Wei ",null,"Teng ","Zou ","Shan ","Jian ","Bo ","Ku ","Huang ","Huo ","Ge ","Ying ","Mi ","Xiao ","Mi ","Xi ","Qiang ","Chen ","Nue ","Ti ","Su ","Bang ","Chi ","Qian ","Shi ","Jiang ","Yuan ","Xie ","Xue ","Tao ","Yao ","Yao ",null,"Yu ","Biao ","Cong ","Qing ","Li ","Mo ","Mo ","Shang ","Zhe ","Miu ","Jian ","Ze ","Jie ","Lian ","Lou ","Can ","Ou ","Guan ","Xi ","Zhuo ","Ao ","Ao ","Jin ","Zhe ","Yi ","Hu ","Jiang ","Man ","Chao ","Han ","Hua ","Chan ","Xu ","Zeng ","Se ","Xi ","She ","Dui ","Zheng ","Nao ","Lan ","E ","Ying ","Jue ","Ji ","Zun ","Jiao ","Bo ","Hui ","Zhuan ","Mu ","Zen ","Zha ","Shi ","Qiao ","Tan ","Zen ","Pu ","Sheng ","Xuan ","Zao ","Tan ","Dang ","Sui ","Qian ","Ji ","Jiao ","Jing ","Lian ","Nou ","Yi ","Ai ","Zhan ","Pi ","Hui ","Hua ","Yi ","Yi ","Shan ","Rang ","Nou ","Qian ","Zhui ","Ta ","Hu ","Zhou ","Hao ","Ye ","Ying ","Jian ","Yu ","Jian ","Hui ","Du ","Zhe ","Xuan ","Zan ","Lei ","Shen ","Wei ","Chan ","Li ","Yi ","Bian ","Zhe ","Yan ","E ","Chou ","Wei ","Chou ","Yao ","Chan ","Rang ","Yin ","Lan ","Chen ","Huo ","Zhe ","Huan ","Zan ","Yi ","Dang ","Zhan ","Yan ","Du ","Yan ","Ji ","Ding ","Fu ","Ren ","Ji ","Jie ","Hong ","Tao ","Rang ","Shan ","Qi ","Tuo ","Xun ","Yi ","Xun ","Ji ","Ren ","Jiang ","Hui ","Ou ","Ju ","Ya ","Ne ","Xu ","E ","Lun ","Xiong ","Song ","Feng ","She ","Fang ","Jue ","Zheng ","Gu ","He ","Ping ","Zu ","Shi ","Xiong ","Zha ","Su ","Zhen ","Di ","Zou ","Ci ","Qu ","Zhao ","Bi ","Yi ","Yi ","Kuang ","Lei ","Shi ","Gua ","Shi ","Jie ","Hui ","Cheng ","Zhu ","Shen ","Hua ","Dan ","Gou ","Quan ","Gui ","Xun ","Yi ","Zheng ","Gai ","Xiang ","Cha ","Hun ","Xu ","Zhou ","Jie ","Wu ","Yu ","Qiao ","Wu ","Gao ","You ","Hui ","Kuang ","Shuo ","Song ","Ai ","Qing ","Zhu ","Zou ","Nuo ","Du ","Zhuo ","Fei ","Ke ","Wei "],
  "140": ["Yu ","Shui ","Shen ","Diao ","Chan ","Liang ","Zhun ","Sui ","Tan ","Shen ","Yi ","Mou ","Chen ","Die ","Huang ","Jian ","Xie ","Nue ","Ye ","Wei ","E ","Yu ","Xuan ","Chan ","Zi ","An ","Yan ","Di ","Mi ","Pian ","Xu ","Mo ","Dang ","Su ","Xie ","Yao ","Bang ","Shi ","Qian ","Mi ","Jin ","Man ","Zhe ","Jian ","Miu ","Tan ","Zen ","Qiao ","Lan ","Pu ","Jue ","Yan ","Qian ","Zhan ","Chen ","Gu ","Qian ","Hong ","Xia ","Jue ","Hong ","Han ","Hong ","Xi ","Xi ","Huo ","Liao ","Han ","Du ","Long ","Dou ","Jiang ","Qi ","Shi ","Li ","Deng ","Wan ","Bi ","Shu ","Xian ","Feng ","Zhi ","Zhi ","Yan ","Yan ","Shi ","Chu ","Hui ","Tun ","Yi ","Tun ","Yi ","Jian ","Ba ","Hou ","E ","Cu ","Xiang ","Huan ","Jian ","Ken ","Gai ","Qu ","Fu ","Xi ","Bin ","Hao ","Yu ","Zhu ","Jia ",null,"Xi ","Bo ","Wen ","Huan ","Bin ","Di ","Zong ","Fen ","Yi ","Zhi ","Bao ","Chai ","Han ","Pi ","Na ","Pi ","Gou ","Na ","You ","Diao ","Mo ","Si ","Xiu ","Huan ","Kun ","He ","He ","Mo ","Han ","Mao ","Li ","Ni ","Bi ","Yu ","Jia ","Tuan ","Mao ","Pi ","Xi ","E ","Ju ","Mo ","Chu ","Tan ","Huan ","Jue ","Bei ","Zhen ","Yuan ","Fu ","Cai ","Gong ","Te ","Yi ","Hang ","Wan ","Pin ","Huo ","Fan ","Tan ","Guan ","Ze ","Zhi ","Er ","Zhu ","Shi ","Bi ","Zi ","Er ","Gui ","Pian ","Bian ","Mai ","Dai ","Sheng ","Kuang ","Fei ","Tie ","Yi ","Chi ","Mao ","He ","Bi ","Lu ","Ren ","Hui ","Gai ","Pian ","Zi ","Jia ","Xu ","Zei ","Jiao ","Gai ","Zang ","Jian ","Ying ","Xun ","Zhen ","She ","Bin ","Bin ","Qiu ","She ","Chuan ","Zang ","Zhou ","Lai ","Zan ","Si ","Chen ","Shang ","Tian ","Pei ","Geng ","Xian ","Mai ","Jian ","Sui ","Fu ","Tan ","Cong ","Cong ","Zhi ","Ji ","Zhang ","Du ","Jin ","Xiong ","Shun ","Yun ","Bao ","Zai ","Lai ","Feng ","Cang ","Ji ","Sheng ","Ai ","Zhuan ","Fu ","Gou ","Sai ","Ze ","Liao "],
  "141": ["Wei ","Bai ","Chen ","Zhuan ","Zhi ","Zhui ","Biao ","Yun ","Zeng ","Tan ","Zan ","Yan ",null,"Shan ","Wan ","Ying ","Jin ","Gan ","Xian ","Zang ","Bi ","Du ","Shu ","Yan ",null,"Xuan ","Long ","Gan ","Zang ","Bei ","Zhen ","Fu ","Yuan ","Gong ","Cai ","Ze ","Xian ","Bai ","Zhang ","Huo ","Zhi ","Fan ","Tan ","Pin ","Bian ","Gou ","Zhu ","Guan ","Er ","Jian ","Bi ","Shi ","Tie ","Gui ","Kuang ","Dai ","Mao ","Fei ","He ","Yi ","Zei ","Zhi ","Jia ","Hui ","Zi ","Ren ","Lu ","Zang ","Zi ","Gai ","Jin ","Qiu ","Zhen ","Lai ","She ","Fu ","Du ","Ji ","Shu ","Shang ","Si ","Bi ","Zhou ","Geng ","Pei ","Tan ","Lai ","Feng ","Zhui ","Fu ","Zhuan ","Sai ","Ze ","Yan ","Zan ","Yun ","Zeng ","Shan ","Ying ","Gan ","Chi ","Xi ","She ","Nan ","Xiong ","Xi ","Cheng ","He ","Cheng ","Zhe ","Xia ","Tang ","Zou ","Zou ","Li ","Jiu ","Fu ","Zhao ","Gan ","Qi ","Shan ","Qiong ","Qin ","Xian ","Ci ","Jue ","Qin ","Chi ","Ci ","Chen ","Chen ","Die ","Ju ","Chao ","Di ","Se ","Zhan ","Zhu ","Yue ","Qu ","Jie ","Chi ","Chu ","Gua ","Xue ","Ci ","Tiao ","Duo ","Lie ","Gan ","Suo ","Cu ","Xi ","Zhao ","Su ","Yin ","Ju ","Jian ","Que ","Tang ","Chuo ","Cui ","Lu ","Qu ","Dang ","Qiu ","Zi ","Ti ","Qu ","Chi ","Huang ","Qiao ","Qiao ","Yao ","Zao ","Ti ",null,"Zan ","Zan ","Zu ","Pa ","Bao ","Ku ","Ke ","Dun ","Jue ","Fu ","Chen ","Jian ","Fang ","Zhi ","Sa ","Yue ","Pa ","Qi ","Yue ","Qiang ","Tuo ","Tai ","Yi ","Nian ","Ling ","Mei ","Ba ","Die ","Ku ","Tuo ","Jia ","Ci ","Pao ","Qia ","Zhu ","Ju ","Die ","Zhi ","Fu ","Pan ","Ju ","Shan ","Bo ","Ni ","Ju ","Li ","Gen ","Yi ","Ji ","Dai ","Xian ","Jiao ","Duo ","Zhu ","Zhuan ","Kua ","Zhuai ","Gui ","Qiong ","Kui ","Xiang ","Chi ","Lu ","Beng ","Zhi ","Jia ","Tiao ","Cai ","Jian ","Ta ","Qiao ","Bi ","Xian ","Duo ","Ji ","Ju ","Ji ","Shu ","Tu "],
  "142": ["Chu ","Jing ","Nie ","Xiao ","Bo ","Chi ","Qun ","Mou ","Shu ","Lang ","Yong ","Jiao ","Chou ","Qiao ",null,"Ta ","Jian ","Qi ","Wo ","Wei ","Zhuo ","Jie ","Ji ","Nie ","Ju ","Ju ","Lun ","Lu ","Leng ","Huai ","Ju ","Chi ","Wan ","Quan ","Ti ","Bo ","Zu ","Qie ","Ji ","Cu ","Zong ","Cai ","Zong ","Peng ","Zhi ","Zheng ","Dian ","Zhi ","Yu ","Duo ","Dun ","Chun ","Yong ","Zhong ","Di ","Zhe ","Chen ","Chuai ","Jian ","Gua ","Tang ","Ju ","Fu ","Zu ","Die ","Pian ","Rou ","Nuo ","Ti ","Cha ","Tui ","Jian ","Dao ","Cuo ","Xi ","Ta ","Qiang ","Zhan ","Dian ","Ti ","Ji ","Nie ","Man ","Liu ","Zhan ","Bi ","Chong ","Lu ","Liao ","Cu ","Tang ","Dai ","Suo ","Xi ","Kui ","Ji ","Zhi ","Qiang ","Di ","Man ","Zong ","Lian ","Beng ","Zao ","Nian ","Bie ","Tui ","Ju ","Deng ","Ceng ","Xian ","Fan ","Chu ","Zhong ","Dun ","Bo ","Cu ","Zu ","Jue ","Jue ","Lin ","Ta ","Qiao ","Qiao ","Pu ","Liao ","Dun ","Cuan ","Kuang ","Zao ","Ta ","Bi ","Bi ","Zhu ","Ju ","Chu ","Qiao ","Dun ","Chou ","Ji ","Wu ","Yue ","Nian ","Lin ","Lie ","Zhi ","Li ","Zhi ","Chan ","Chu ","Duan ","Wei ","Long ","Lin ","Xian ","Wei ","Zuan ","Lan ","Xie ","Rang ","Xie ","Nie ","Ta ","Qu ","Jie ","Cuan ","Zuan ","Xi ","Kui ","Jue ","Lin ","Shen ","Gong ","Dan ","Segare ","Qu ","Ti ","Duo ","Duo ","Gong ","Lang ","Nerau ","Luo ","Ai ","Ji ","Ju ","Tang ","Utsuke ",null,"Yan ","Shitsuke ","Kang ","Qu ","Lou ","Lao ","Tuo ","Zhi ","Yagate ","Ti ","Dao ","Yagate ","Yu ","Che ","Ya ","Gui ","Jun ","Wei ","Yue ","Xin ","Di ","Xuan ","Fan ","Ren ","Shan ","Qiang ","Shu ","Tun ","Chen ","Dai ","E ","Na ","Qi ","Mao ","Ruan ","Ren ","Fan ","Zhuan ","Hong ","Hu ","Qu ","Huang ","Di ","Ling ","Dai ","Ao ","Zhen ","Fan ","Kuang ","Ang ","Peng ","Bei ","Gu ","Ku ","Pao ","Zhu ","Rong ","E ","Ba ","Zhou ","Zhi ","Yao ","Ke ","Yi ","Qing ","Shi ","Ping "],
  "143": ["Er ","Qiong ","Ju ","Jiao ","Guang ","Lu ","Kai ","Quan ","Zhou ","Zai ","Zhi ","She ","Liang ","Yu ","Shao ","You ","Huan ","Yun ","Zhe ","Wan ","Fu ","Qing ","Zhou ","Ni ","Ling ","Zhe ","Zhan ","Liang ","Zi ","Hui ","Wang ","Chuo ","Guo ","Kan ","Yi ","Peng ","Qian ","Gun ","Nian ","Pian ","Guan ","Bei ","Lun ","Pai ","Liang ","Ruan ","Rou ","Ji ","Yang ","Xian ","Chuan ","Cou ","Qun ","Ge ","You ","Hong ","Shu ","Fu ","Zi ","Fu ","Wen ","Ben ","Zhan ","Yu ","Wen ","Tao ","Gu ","Zhen ","Xia ","Yuan ","Lu ","Jiu ","Chao ","Zhuan ","Wei ","Hun ","Sori ","Che ","Jiao ","Zhan ","Pu ","Lao ","Fen ","Fan ","Lin ","Ge ","Se ","Kan ","Huan ","Yi ","Ji ","Dui ","Er ","Yu ","Xian ","Hong ","Lei ","Pei ","Li ","Li ","Lu ","Lin ","Che ","Ya ","Gui ","Xuan ","Di ","Ren ","Zhuan ","E ","Lun ","Ruan ","Hong ","Ku ","Ke ","Lu ","Zhou ","Zhi ","Yi ","Hu ","Zhen ","Li ","Yao ","Qing ","Shi ","Zai ","Zhi ","Jiao ","Zhou ","Quan ","Lu ","Jiao ","Zhe ","Fu ","Liang ","Nian ","Bei ","Hui ","Gun ","Wang ","Liang ","Chuo ","Zi ","Cou ","Fu ","Ji ","Wen ","Shu ","Pei ","Yuan ","Xia ","Zhan ","Lu ","Che ","Lin ","Xin ","Gu ","Ci ","Ci ","Pi ","Zui ","Bian ","La ","La ","Ci ","Xue ","Ban ","Bian ","Bian ","Bian ",null,"Bian ","Ban ","Ci ","Bian ","Bian ","Chen ","Ru ","Nong ","Nong ","Zhen ","Chuo ","Chuo ","Suberu ","Reng ","Bian ","Bian ","Sip ","Ip ","Liao ","Da ","Chan ","Gan ","Qian ","Yu ","Yu ","Qi ","Xun ","Yi ","Guo ","Mai ","Qi ","Za ","Wang ","Jia ","Zhun ","Ying ","Ti ","Yun ","Jin ","Hang ","Ya ","Fan ","Wu ","Da ","E ","Huan ","Zhe ","Totemo ","Jin ","Yuan ","Wei ","Lian ","Chi ","Che ","Ni ","Tiao ","Zhi ","Yi ","Jiong ","Jia ","Chen ","Dai ","Er ","Di ","Po ","Wang ","Die ","Ze ","Tao ","Shu ","Tuo ","Kep ","Jing ","Hui ","Tong ","You ","Mi ","Beng ","Ji ","Nai ","Yi ","Jie ","Zhui ","Lie ","Xun "],
  "144": ["Tui ","Song ","Gua ","Tao ","Pang ","Hou ","Ni ","Dun ","Jiong ","Xuan ","Xun ","Bu ","You ","Xiao ","Qiu ","Tou ","Zhu ","Qiu ","Di ","Di ","Tu ","Jing ","Ti ","Dou ","Yi ","Zhe ","Tong ","Guang ","Wu ","Shi ","Cheng ","Su ","Zao ","Qun ","Feng ","Lian ","Suo ","Hui ","Li ","Sako ","Lai ","Ben ","Cuo ","Jue ","Beng ","Huan ","Dai ","Lu ","You ","Zhou ","Jin ","Yu ","Chuo ","Kui ","Wei ","Ti ","Yi ","Da ","Yuan ","Luo ","Bi ","Nuo ","Yu ","Dang ","Sui ","Dun ","Sui ","Yan ","Chuan ","Chi ","Ti ","Yu ","Shi ","Zhen ","You ","Yun ","E ","Bian ","Guo ","E ","Xia ","Huang ","Qiu ","Dao ","Da ","Wei ","Appare ","Yi ","Gou ","Yao ","Chu ","Liu ","Xun ","Ta ","Di ","Chi ","Yuan ","Su ","Ta ","Qian ",null,"Yao ","Guan ","Zhang ","Ao ","Shi ","Ce ","Chi ","Su ","Zao ","Zhe ","Dun ","Di ","Lou ","Chi ","Cuo ","Lin ","Zun ","Rao ","Qian ","Xuan ","Yu ","Yi ","Wu ","Liao ","Ju ","Shi ","Bi ","Yao ","Mai ","Xie ","Sui ","Huan ","Zhan ","Teng ","Er ","Miao ","Bian ","Bian ","La ","Li ","Yuan ","Yao ","Luo ","Li ","Yi ","Ting ","Deng ","Qi ","Yong ","Shan ","Han ","Yu ","Mang ","Ru ","Qiong ",null,"Kuang ","Fu ","Kang ","Bin ","Fang ","Xing ","Na ","Xin ","Shen ","Bang ","Yuan ","Cun ","Huo ","Xie ","Bang ","Wu ","Ju ","You ","Han ","Tai ","Qiu ","Bi ","Pei ","Bing ","Shao ","Bei ","Wa ","Di ","Zou ","Ye ","Lin ","Kuang ","Gui ","Zhu ","Shi ","Ku ","Yu ","Gai ","Ge ","Xi ","Zhi ","Ji ","Xun ","Hou ","Xing ","Jiao ","Xi ","Gui ","Nuo ","Lang ","Jia ","Kuai ","Zheng ","Otoko ","Yun ","Yan ","Cheng ","Dou ","Chi ","Lu ","Fu ","Wu ","Fu ","Gao ","Hao ","Lang ","Jia ","Geng ","Jun ","Ying ","Bo ","Xi ","Bei ","Li ","Yun ","Bu ","Xiao ","Qi ","Pi ","Qing ","Guo ","Zhou ","Tan ","Zou ","Ping ","Lai ","Ni ","Chen ","You ","Bu ","Xiang ","Dan ","Ju ","Yong ","Qiao ","Yi ","Du ","Yan ","Mei "],
  "145": ["Ruo ","Bei ","E ","Yu ","Juan ","Yu ","Yun ","Hou ","Kui ","Xiang ","Xiang ","Sou ","Tang ","Ming ","Xi ","Ru ","Chu ","Zi ","Zou ","Ju ","Wu ","Xiang ","Yun ","Hao ","Yong ","Bi ","Mo ","Chao ","Fu ","Liao ","Yin ","Zhuan ","Hu ","Qiao ","Yan ","Zhang ","Fan ","Qiao ","Xu ","Deng ","Bi ","Xin ","Bi ","Ceng ","Wei ","Zheng ","Mao ","Shan ","Lin ","Po ","Dan ","Meng ","Ye ","Cao ","Kuai ","Feng ","Meng ","Zou ","Kuang ","Lian ","Zan ","Chan ","You ","Qi ","Yan ","Chan ","Zan ","Ling ","Huan ","Xi ","Feng ","Zan ","Li ","You ","Ding ","Qiu ","Zhuo ","Pei ","Zhou ","Yi ","Hang ","Yu ","Jiu ","Yan ","Zui ","Mao ","Dan ","Xu ","Tou ","Zhen ","Fen ","Sakenomoto ",null,"Yun ","Tai ","Tian ","Qia ","Tuo ","Zuo ","Han ","Gu ","Su ","Po ","Chou ","Zai ","Ming ","Luo ","Chuo ","Chou ","You ","Tong ","Zhi ","Xian ","Jiang ","Cheng ","Yin ","Tu ","Xiao ","Mei ","Ku ","Suan ","Lei ","Pu ","Zui ","Hai ","Yan ","Xi ","Niang ","Wei ","Lu ","Lan ","Yan ","Tao ","Pei ","Zhan ","Chun ","Tan ","Zui ","Chuo ","Cu ","Kun ","Ti ","Mian ","Du ","Hu ","Xu ","Xing ","Tan ","Jiu ","Chun ","Yun ","Po ","Ke ","Sou ","Mi ","Quan ","Chou ","Cuo ","Yun ","Yong ","Ang ","Zha ","Hai ","Tang ","Jiang ","Piao ","Shan ","Yu ","Li ","Zao ","Lao ","Yi ","Jiang ","Pu ","Jiao ","Xi ","Tan ","Po ","Nong ","Yi ","Li ","Ju ","Jiao ","Yi ","Niang ","Ru ","Xun ","Chou ","Yan ","Ling ","Mi ","Mi ","Niang ","Xin ","Jiao ","Xi ","Mi ","Yan ","Bian ","Cai ","Shi ","You ","Shi ","Shi ","Li ","Chong ","Ye ","Liang ","Li ","Jin ","Jin ","Qiu ","Yi ","Diao ","Dao ","Zhao ","Ding ","Po ","Qiu ","He ","Fu ","Zhen ","Zhi ","Ba ","Luan ","Fu ","Nai ","Diao ","Shan ","Qiao ","Kou ","Chuan ","Zi ","Fan ","Yu ","Hua ","Han ","Gong ","Qi ","Mang ","Ri ","Di ","Si ","Xi ","Yi ","Chai ","Shi ","Tu ","Xi ","Nu ","Qian ","Ishiyumi ","Jian ","Pi ","Ye ","Yin "],
  "146": ["Ba ","Fang ","Chen ","Xing ","Tou ","Yue ","Yan ","Fu ","Pi ","Na ","Xin ","E ","Jue ","Dun ","Gou ","Yin ","Qian ","Ban ","Ji ","Ren ","Chao ","Niu ","Fen ","Yun ","Ji ","Qin ","Pi ","Guo ","Hong ","Yin ","Jun ","Shi ","Yi ","Zhong ","Nie ","Gai ","Ri ","Huo ","Tai ","Kang ","Habaki ","Irori ","Ngaak ",null,"Duo ","Zi ","Ni ","Tu ","Shi ","Min ","Gu ","E ","Ling ","Bing ","Yi ","Gu ","Ba ","Pi ","Yu ","Si ","Zuo ","Bu ","You ","Dian ","Jia ","Zhen ","Shi ","Shi ","Tie ","Ju ","Zhan ","Shi ","She ","Xuan ","Zhao ","Bao ","He ","Bi ","Sheng ","Chu ","Shi ","Bo ","Zhu ","Chi ","Za ","Po ","Tong ","Qian ","Fu ","Zhai ","Liu ","Qian ","Fu ","Li ","Yue ","Pi ","Yang ","Ban ","Bo ","Jie ","Gou ","Shu ","Zheng ","Mu ","Ni ","Nie ","Di ","Jia ","Mu ","Dan ","Shen ","Yi ","Si ","Kuang ","Ka ","Bei ","Jian ","Tong ","Xing ","Hong ","Jiao ","Chi ","Er ","Ge ","Bing ","Shi ","Mou ","Jia ","Yin ","Jun ","Zhou ","Chong ","Shang ","Tong ","Mo ","Lei ","Ji ","Yu ","Xu ","Ren ","Zun ","Zhi ","Qiong ","Shan ","Chi ","Xian ","Xing ","Quan ","Pi ","Tie ","Zhu ","Hou ","Ming ","Kua ","Yao ","Xian ","Xian ","Xiu ","Jun ","Cha ","Lao ","Ji ","Pi ","Ru ","Mi ","Yi ","Yin ","Guang ","An ","Diou ","You ","Se ","Kao ","Qian ","Luan ","Kasugai ","Ai ","Diao ","Han ","Rui ","Shi ","Keng ","Qiu ","Xiao ","Zhe ","Xiu ","Zang ","Ti ","Cuo ","Gua ","Gong ","Zhong ","Dou ","Lu ","Mei ","Lang ","Wan ","Xin ","Yun ","Bei ","Wu ","Su ","Yu ","Chan ","Ting ","Bo ","Han ","Jia ","Hong ","Cuan ","Feng ","Chan ","Wan ","Zhi ","Si ","Xuan ","Wu ","Wu ","Tiao ","Gong ","Zhuo ","Lue ","Xing ","Qian ","Shen ","Han ","Lue ","Xie ","Chu ","Zheng ","Ju ","Xian ","Tie ","Mang ","Pu ","Li ","Pan ","Rui ","Cheng ","Gao ","Li ","Te ","Pyeng ","Zhu ",null,"Tu ","Liu ","Zui ","Ju ","Chang ","Yuan ","Jian ","Gang ","Diao ","Tao ","Chang "],
  "147": ["Lun ","Kua ","Ling ","Bei ","Lu ","Li ","Qiang ","Pou ","Juan ","Min ","Zui ","Peng ","An ","Pi ","Xian ","Ya ","Zhui ","Lei ","A ","Kong ","Ta ","Kun ","Du ","Wei ","Chui ","Zi ","Zheng ","Ben ","Nie ","Cong ","Qun ","Tan ","Ding ","Qi ","Qian ","Zhuo ","Qi ","Yu ","Jin ","Guan ","Mao ","Chang ","Tian ","Xi ","Lian ","Tao ","Gu ","Cuo ","Shu ","Zhen ","Lu ","Meng ","Lu ","Hua ","Biao ","Ga ","Lai ","Ken ","Kazari ","Bu ","Nai ","Wan ","Zan ",null,"De ","Xian ",null,"Huo ","Liang ",null,"Men ","Kai ","Ying ","Di ","Lian ","Guo ","Xian ","Du ","Tu ","Wei ","Cong ","Fu ","Rou ","Ji ","E ","Rou ","Chen ","Ti ","Zha ","Hong ","Yang ","Duan ","Xia ","Yu ","Keng ","Xing ","Huang ","Wei ","Fu ","Zhao ","Cha ","Qie ","She ","Hong ","Kui ","Tian ","Mou ","Qiao ","Qiao ","Hou ","Tou ","Cong ","Huan ","Ye ","Min ","Jian ","Duan ","Jian ","Song ","Kui ","Hu ","Xuan ","Duo ","Jie ","Zhen ","Bian ","Zhong ","Zi ","Xiu ","Ye ","Mei ","Pai ","Ai ","Jie ",null,"Mei ","Chuo ","Ta ","Bang ","Xia ","Lian ","Suo ","Xi ","Liu ","Zu ","Ye ","Nou ","Weng ","Rong ","Tang ","Suo ","Qiang ","Ge ","Shuo ","Chui ","Bo ","Pan ","Sa ","Bi ","Sang ","Gang ","Zi ","Wu ","Ying ","Huang ","Tiao ","Liu ","Kai ","Sun ","Sha ","Sou ","Wan ","Hao ","Zhen ","Zhen ","Luo ","Yi ","Yuan ","Tang ","Nie ","Xi ","Jia ","Ge ","Ma ","Juan ","Kasugai ","Habaki ","Suo ",null,null,null,"Na ","Lu ","Suo ","Ou ","Zu ","Tuan ","Xiu ","Guan ","Xuan ","Lian ","Shou ","Ao ","Man ","Mo ","Luo ","Bi ","Wei ","Liu ","Di ","Qiao ","Cong ","Yi ","Lu ","Ao ","Keng ","Qiang ","Cui ","Qi ","Chang ","Tang ","Man ","Yong ","Chan ","Feng ","Jing ","Biao ","Shu ","Lou ","Xiu ","Cong ","Long ","Zan ","Jian ","Cao ","Li ","Xia ","Xi ","Kang ",null,"Beng ",null,null,"Zheng ","Lu ","Hua ","Ji ","Pu ","Hui ","Qiang ","Po ","Lin ","Suo ","Xiu ","San ","Cheng "],
  "148": ["Kui ","Si ","Liu ","Nao ","Heng ","Pie ","Sui ","Fan ","Qiao ","Quan ","Yang ","Tang ","Xiang ","Jue ","Jiao ","Zun ","Liao ","Jie ","Lao ","Dui ","Tan ","Zan ","Ji ","Jian ","Zhong ","Deng ","Ya ","Ying ","Dui ","Jue ","Nou ","Ti ","Pu ","Tie ",null,null,"Ding ","Shan ","Kai ","Jian ","Fei ","Sui ","Lu ","Juan ","Hui ","Yu ","Lian ","Zhuo ","Qiao ","Qian ","Zhuo ","Lei ","Bi ","Tie ","Huan ","Ye ","Duo ","Guo ","Dang ","Ju ","Fen ","Da ","Bei ","Yi ","Ai ","Zong ","Xun ","Diao ","Zhu ","Heng ","Zhui ","Ji ","Nie ","Ta ","Huo ","Qing ","Bin ","Ying ","Kui ","Ning ","Xu ","Jian ","Jian ","Yari ","Cha ","Zhi ","Mie ","Li ","Lei ","Ji ","Zuan ","Kuang ","Shang ","Peng ","La ","Du ","Shuo ","Chuo ","Lu ","Biao ","Bao ","Lu ",null,null,"Long ","E ","Lu ","Xin ","Jian ","Lan ","Bo ","Jian ","Yao ","Chan ","Xiang ","Jian ","Xi ","Guan ","Cang ","Nie ","Lei ","Cuan ","Qu ","Pan ","Luo ","Zuan ","Luan ","Zao ","Nie ","Jue ","Tang ","Shu ","Lan ","Jin ","Qiu ","Yi ","Zhen ","Ding ","Zhao ","Po ","Diao ","Tu ","Qian ","Chuan ","Shan ","Ji ","Fan ","Diao ","Men ","Nu ","Xi ","Chai ","Xing ","Gai ","Bu ","Tai ","Ju ","Dun ","Chao ","Zhong ","Na ","Bei ","Gang ","Ban ","Qian ","Yao ","Qin ","Jun ","Wu ","Gou ","Kang ","Fang ","Huo ","Tou ","Niu ","Ba ","Yu ","Qian ","Zheng ","Qian ","Gu ","Bo ","E ","Po ","Bu ","Ba ","Yue ","Zuan ","Mu ","Dan ","Jia ","Dian ","You ","Tie ","Bo ","Ling ","Shuo ","Qian ","Liu ","Bao ","Shi ","Xuan ","She ","Bi ","Ni ","Pi ","Duo ","Xing ","Kao ","Lao ","Er ","Mang ","Ya ","You ","Cheng ","Jia ","Ye ","Nao ","Zhi ","Dang ","Tong ","Lu ","Diao ","Yin ","Kai ","Zha ","Zhu ","Xian ","Ting ","Diu ","Xian ","Hua ","Quan ","Sha ","Jia ","Yao ","Ge ","Ming ","Zheng ","Se ","Jiao ","Yi ","Chan ","Chong ","Tang ","An ","Yin ","Ru ","Zhu ","Lao ","Pu ","Wu ","Lai ","Te ","Lian ","Keng "],
  "149": ["Xiao ","Suo ","Li ","Zheng ","Chu ","Guo ","Gao ","Tie ","Xiu ","Cuo ","Lue ","Feng ","Xin ","Liu ","Kai ","Jian ","Rui ","Ti ","Lang ","Qian ","Ju ","A ","Qiang ","Duo ","Tian ","Cuo ","Mao ","Ben ","Qi ","De ","Kua ","Kun ","Chang ","Xi ","Gu ","Luo ","Chui ","Zhui ","Jin ","Zhi ","Xian ","Juan ","Huo ","Pou ","Tan ","Ding ","Jian ","Ju ","Meng ","Zi ","Qie ","Ying ","Kai ","Qiang ","Song ","E ","Cha ","Qiao ","Zhong ","Duan ","Sou ","Huang ","Huan ","Ai ","Du ","Mei ","Lou ","Zi ","Fei ","Mei ","Mo ","Zhen ","Bo ","Ge ","Nie ","Tang ","Juan ","Nie ","Na ","Liu ","Hao ","Bang ","Yi ","Jia ","Bin ","Rong ","Biao ","Tang ","Man ","Luo ","Beng ","Yong ","Jing ","Di ","Zu ","Xuan ","Liu ","Tan ","Jue ","Liao ","Pu ","Lu ","Dui ","Lan ","Pu ","Cuan ","Qiang ","Deng ","Huo ","Lei ","Huan ","Zhuo ","Lian ","Yi ","Cha ","Biao ","La ","Chan ","Xiang ","Chang ","Chang ","Jiu ","Ao ","Die ","Qu ","Liao ","Mi ","Chang ","Men ","Ma ","Shuan ","Shan ","Huo ","Men ","Yan ","Bi ","Han ","Bi ","San ","Kai ","Kang ","Beng ","Hong ","Run ","San ","Xian ","Xian ","Jian ","Min ","Xia ","Yuru ","Dou ","Zha ","Nao ","Jian ","Peng ","Xia ","Ling ","Bian ","Bi ","Run ","He ","Guan ","Ge ","Ge ","Fa ","Chu ","Hong ","Gui ","Min ","Se ","Kun ","Lang ","Lu ","Ting ","Sha ","Ju ","Yue ","Yue ","Chan ","Qu ","Lin ","Chang ","Shai ","Kun ","Yan ","Min ","Yan ","E ","Hun ","Yu ","Wen ","Xiang ","Bao ","Xiang ","Qu ","Yao ","Wen ","Ban ","An ","Wei ","Yin ","Kuo ","Que ","Lan ","Du ",null,"Phwung ","Tian ","Nie ","Ta ","Kai ","He ","Que ","Chuang ","Guan ","Dou ","Qi ","Kui ","Tang ","Guan ","Piao ","Kan ","Xi ","Hui ","Chan ","Pi ","Dang ","Huan ","Ta ","Wen ",null,"Men ","Shuan ","Shan ","Yan ","Han ","Bi ","Wen ","Chuang ","Run ","Wei ","Xian ","Hong ","Jian ","Min ","Kang ","Men ","Zha ","Nao ","Gui ","Wen ","Ta ","Min ","Lu ","Kai "],
  "150": ["Fa ","Ge ","He ","Kun ","Jiu ","Yue ","Lang ","Du ","Yu ","Yan ","Chang ","Xi ","Wen ","Hun ","Yan ","E ","Chan ","Lan ","Qu ","Hui ","Kuo ","Que ","Ge ","Tian ","Ta ","Que ","Kan ","Huan ","Fu ","Fu ","Le ","Dui ","Xin ","Qian ","Wu ","Yi ","Tuo ","Yin ","Yang ","Dou ","E ","Sheng ","Ban ","Pei ","Keng ","Yun ","Ruan ","Zhi ","Pi ","Jing ","Fang ","Yang ","Yin ","Zhen ","Jie ","Cheng ","E ","Qu ","Di ","Zu ","Zuo ","Dian ","Ling ","A ","Tuo ","Tuo ","Po ","Bing ","Fu ","Ji ","Lu ","Long ","Chen ","Xing ","Duo ","Lou ","Mo ","Jiang ","Shu ","Duo ","Xian ","Er ","Gui ","Yu ","Gai ","Shan ","Xun ","Qiao ","Xing ","Chun ","Fu ","Bi ","Xia ","Shan ","Sheng ","Zhi ","Pu ","Dou ","Yuan ","Zhen ","Chu ","Xian ","Tou ","Nie ","Yun ","Xian ","Pei ","Pei ","Zou ","Yi ","Dui ","Lun ","Yin ","Ju ","Chui ","Chen ","Pi ","Ling ","Tao ","Xian ","Lu ","Sheng ","Xian ","Yin ","Zhu ","Yang ","Reng ","Shan ","Chong ","Yan ","Yin ","Yu ","Ti ","Yu ","Long ","Wei ","Wei ","Nie ","Dui ","Sui ","An ","Huang ","Jie ","Sui ","Yin ","Gai ","Yan ","Hui ","Ge ","Yun ","Wu ","Wei ","Ai ","Xi ","Tang ","Ji ","Zhang ","Dao ","Ao ","Xi ","Yin ",null,"Rao ","Lin ","Tui ","Deng ","Pi ","Sui ","Sui ","Yu ","Xian ","Fen ","Ni ","Er ","Ji ","Dao ","Xi ","Yin ","E ","Hui ","Long ","Xi ","Li ","Li ","Li ","Zhui ","He ","Zhi ","Zhun ","Jun ","Nan ","Yi ","Que ","Yan ","Qian ","Ya ","Xiong ","Ya ","Ji ","Gu ","Huan ","Zhi ","Gou ","Jun ","Ci ","Yong ","Ju ","Chu ","Hu ","Za ","Luo ","Yu ","Chou ","Diao ","Sui ","Han ","Huo ","Shuang ","Guan ","Chu ","Za ","Yong ","Ji ","Xi ","Chou ","Liu ","Li ","Nan ","Xue ","Za ","Ji ","Ji ","Yu ","Yu ","Xue ","Na ","Fou ","Se ","Mu ","Wen ","Fen ","Pang ","Yun ","Li ","Li ","Ang ","Ling ","Lei ","An ","Bao ","Meng ","Dian ","Dang ","Xing ","Wu ","Zhao "],
  "151": ["Xu ","Ji ","Mu ","Chen ","Xiao ","Zha ","Ting ","Zhen ","Pei ","Mei ","Ling ","Qi ","Chou ","Huo ","Sha ","Fei ","Weng ","Zhan ","Yin ","Ni ","Chou ","Tun ","Lin ",null,"Dong ","Ying ","Wu ","Ling ","Shuang ","Ling ","Xia ","Hong ","Yin ","Mo ","Mai ","Yun ","Liu ","Meng ","Bin ","Wu ","Wei ","Huo ","Yin ","Xi ","Yi ","Ai ","Dan ","Deng ","Xian ","Yu ","Lu ","Long ","Dai ","Ji ","Pang ","Yang ","Ba ","Pi ","Wei ",null,"Xi ","Ji ","Mai ","Meng ","Meng ","Lei ","Li ","Huo ","Ai ","Fei ","Dai ","Long ","Ling ","Ai ","Feng ","Li ","Bao ",null,"He ","He ","Bing ","Qing ","Qing ","Jing ","Tian ","Zhen ","Jing ","Cheng ","Qing ","Jing ","Jing ","Dian ","Jing ","Tian ","Fei ","Fei ","Kao ","Mi ","Mian ","Mian ","Pao ","Ye ","Tian ","Hui ","Ye ","Ge ","Ding ","Cha ","Jian ","Ren ","Di ","Du ","Wu ","Ren ","Qin ","Jin ","Xue ","Niu ","Ba ","Yin ","Sa ","Na ","Mo ","Zu ","Da ","Ban ","Yi ","Yao ","Tao ","Tuo ","Jia ","Hong ","Pao ","Yang ","Tomo ","Yin ","Jia ","Tao ","Ji ","Xie ","An ","An ","Hen ","Gong ","Kohaze ","Da ","Qiao ","Ting ","Wan ","Ying ","Sui ","Tiao ","Qiao ","Xuan ","Kong ","Beng ","Ta ","Zhang ","Bing ","Kuo ","Ju ","La ","Xie ","Rou ","Bang ","Yi ","Qiu ","Qiu ","He ","Xiao ","Mu ","Ju ","Jian ","Bian ","Di ","Jian ","On ","Tao ","Gou ","Ta ","Bei ","Xie ","Pan ","Ge ","Bi ","Kuo ","Tang ","Lou ","Gui ","Qiao ","Xue ","Ji ","Jian ","Jiang ","Chan ","Da ","Huo ","Xian ","Qian ","Du ","Wa ","Jian ","Lan ","Wei ","Ren ","Fu ","Mei ","Juan ","Ge ","Wei ","Qiao ","Han ","Chang ",null,"Rou ","Xun ","She ","Wei ","Ge ","Bei ","Tao ","Gou ","Yun ",null,"Bi ","Wei ","Hui ","Du ","Wa ","Du ","Wei ","Ren ","Fu ","Han ","Wei ","Yun ","Tao ","Jiu ","Jiu ","Xian ","Xie ","Xian ","Ji ","Yin ","Za ","Yun ","Shao ","Le ","Peng ","Heng ","Ying ","Yun ","Peng ","Yin ","Yin ","Xiang "],
  "152": ["Hu ","Ye ","Ding ","Qing ","Pan ","Xiang ","Shun ","Han ","Xu ","Yi ","Xu ","Gu ","Song ","Kui ","Qi ","Hang ","Yu ","Wan ","Ban ","Dun ","Di ","Dan ","Pan ","Po ","Ling ","Ce ","Jing ","Lei ","He ","Qiao ","E ","E ","Wei ","Jie ","Gua ","Shen ","Yi ","Shen ","Hai ","Dui ","Pian ","Ping ","Lei ","Fu ","Jia ","Tou ","Hui ","Kui ","Jia ","Le ","Tian ","Cheng ","Ying ","Jun ","Hu ","Han ","Jing ","Tui ","Tui ","Pin ","Lai ","Tui ","Zi ","Zi ","Chui ","Ding ","Lai ","Yan ","Han ","Jian ","Ke ","Cui ","Jiong ","Qin ","Yi ","Sai ","Ti ","E ","E ","Yan ","Hun ","Kan ","Yong ","Zhuan ","Yan ","Xian ","Xin ","Yi ","Yuan ","Sang ","Dian ","Dian ","Jiang ","Ku ","Lei ","Liao ","Piao ","Yi ","Man ","Qi ","Rao ","Hao ","Qiao ","Gu ","Xun ","Qian ","Hui ","Zhan ","Ru ","Hong ","Bin ","Xian ","Pin ","Lu ","Lan ","Nie ","Quan ","Ye ","Ding ","Qing ","Han ","Xiang ","Shun ","Xu ","Xu ","Wan ","Gu ","Dun ","Qi ","Ban ","Song ","Hang ","Yu ","Lu ","Ling ","Po ","Jing ","Jie ","Jia ","Tian ","Han ","Ying ","Jiong ","Hai ","Yi ","Pin ","Hui ","Tui ","Han ","Ying ","Ying ","Ke ","Ti ","Yong ","E ","Zhuan ","Yan ","E ","Nie ","Man ","Dian ","Sang ","Hao ","Lei ","Zhan ","Ru ","Pin ","Quan ","Feng ","Biao ","Oroshi ","Fu ","Xia ","Zhan ","Biao ","Sa ","Ba ","Tai ","Lie ","Gua ","Xuan ","Shao ","Ju ","Bi ","Si ","Wei ","Yang ","Yao ","Sou ","Kai ","Sao ","Fan ","Liu ","Xi ","Liao ","Piao ","Piao ","Liu ","Biao ","Biao ","Biao ","Liao ",null,"Se ","Feng ","Biao ","Feng ","Yang ","Zhan ","Biao ","Sa ","Ju ","Si ","Sou ","Yao ","Liu ","Piao ","Biao ","Biao ","Fei ","Fan ","Fei ","Fei ","Shi ","Shi ","Can ","Ji ","Ding ","Si ","Tuo ","Zhan ","Sun ","Xiang ","Tun ","Ren ","Yu ","Juan ","Chi ","Yin ","Fan ","Fan ","Sun ","Yin ","Zhu ","Yi ","Zhai ","Bi ","Jie ","Tao ","Liu ","Ci ","Tie ","Si ","Bao ","Shi ","Duo "],
  "153": ["Hai ","Ren ","Tian ","Jiao ","Jia ","Bing ","Yao ","Tong ","Ci ","Xiang ","Yang ","Yang ","Er ","Yan ","Le ","Yi ","Can ","Bo ","Nei ","E ","Bu ","Jun ","Dou ","Su ","Yu ","Shi ","Yao ","Hun ","Guo ","Shi ","Jian ","Zhui ","Bing ","Xian ","Bu ","Ye ","Tan ","Fei ","Zhang ","Wei ","Guan ","E ","Nuan ","Hun ","Hu ","Huang ","Tie ","Hui ","Jian ","Hou ","He ","Xing ","Fen ","Wei ","Gu ","Cha ","Song ","Tang ","Bo ","Gao ","Xi ","Kui ","Liu ","Sou ","Tao ","Ye ","Yun ","Mo ","Tang ","Man ","Bi ","Yu ","Xiu ","Jin ","San ","Kui ","Zhuan ","Shan ","Chi ","Dan ","Yi ","Ji ","Rao ","Cheng ","Yong ","Tao ","Hui ","Xiang ","Zhan ","Fen ","Hai ","Meng ","Yan ","Mo ","Chan ","Xiang ","Luo ","Zuan ","Nang ","Shi ","Ding ","Ji ","Tuo ","Xing ","Tun ","Xi ","Ren ","Yu ","Chi ","Fan ","Yin ","Jian ","Shi ","Bao ","Si ","Duo ","Yi ","Er ","Rao ","Xiang ","Jia ","Le ","Jiao ","Yi ","Bing ","Bo ","Dou ","E ","Yu ","Nei ","Jun ","Guo ","Hun ","Xian ","Guan ","Cha ","Kui ","Gu ","Sou ","Chan ","Ye ","Mo ","Bo ","Liu ","Xiu ","Jin ","Man ","San ","Zhuan ","Nang ","Shou ","Kui ","Guo ","Xiang ","Fen ","Ba ","Ni ","Bi ","Bo ","Tu ","Han ","Fei ","Jian ","An ","Ai ","Fu ","Xian ","Wen ","Xin ","Fen ","Bin ","Xing ","Ma ","Yu ","Feng ","Han ","Di ","Tuo ","Tuo ","Chi ","Xun ","Zhu ","Zhi ","Pei ","Xin ","Ri ","Sa ","Yin ","Wen ","Zhi ","Dan ","Lu ","You ","Bo ","Bao ","Kuai ","Tuo ","Yi ","Qu ",null,"Qu ","Jiong ","Bo ","Zhao ","Yuan ","Peng ","Zhou ","Ju ","Zhu ","Nu ","Ju ","Pi ","Zang ","Jia ","Ling ","Zhen ","Tai ","Fu ","Yang ","Shi ","Bi ","Tuo ","Tuo ","Si ","Liu ","Ma ","Pian ","Tao ","Zhi ","Rong ","Teng ","Dong ","Xun ","Quan ","Shen ","Jiong ","Er ","Hai ","Bo ","Zhu ","Yin ","Luo ","Shuu ","Dan ","Xie ","Liu ","Ju ","Song ","Qin ","Mang ","Liang ","Han ","Tu ","Xuan ","Tui ","Jun "],
  "154": ["E ","Cheng ","Xin ","Ai ","Lu ","Zhui ","Zhou ","She ","Pian ","Kun ","Tao ","Lai ","Zong ","Ke ","Qi ","Qi ","Yan ","Fei ","Sao ","Yan ","Jie ","Yao ","Wu ","Pian ","Cong ","Pian ","Qian ","Fei ","Huang ","Jian ","Huo ","Yu ","Ti ","Quan ","Xia ","Zong ","Kui ","Rou ","Si ","Gua ","Tuo ","Kui ","Sou ","Qian ","Cheng ","Zhi ","Liu ","Pang ","Teng ","Xi ","Cao ","Du ","Yan ","Yuan ","Zou ","Sao ","Shan ","Li ","Zhi ","Shuang ","Lu ","Xi ","Luo ","Zhang ","Mo ","Ao ","Can ","Piao ","Cong ","Qu ","Bi ","Zhi ","Yu ","Xu ","Hua ","Bo ","Su ","Xiao ","Lin ","Chan ","Dun ","Liu ","Tuo ","Zeng ","Tan ","Jiao ","Tie ","Yan ","Luo ","Zhan ","Jing ","Yi ","Ye ","Tuo ","Bin ","Zou ","Yan ","Peng ","Lu ","Teng ","Xiang ","Ji ","Shuang ","Ju ","Xi ","Huan ","Li ","Biao ","Ma ","Yu ","Tuo ","Xun ","Chi ","Qu ","Ri ","Bo ","Lu ","Zang ","Shi ","Si ","Fu ","Ju ","Zou ","Zhu ","Tuo ","Nu ","Jia ","Yi ","Tai ","Xiao ","Ma ","Yin ","Jiao ","Hua ","Luo ","Hai ","Pian ","Biao ","Li ","Cheng ","Yan ","Xin ","Qin ","Jun ","Qi ","Qi ","Ke ","Zhui ","Zong ","Su ","Can ","Pian ","Zhi ","Kui ","Sao ","Wu ","Ao ","Liu ","Qian ","Shan ","Piao ","Luo ","Cong ","Chan ","Zou ","Ji ","Shuang ","Xiang ","Gu ","Wei ","Wei ","Wei ","Yu ","Gan ","Yi ","Ang ","Tou ","Xie ","Bao ","Bi ","Chi ","Ti ","Di ","Ku ","Hai ","Qiao ","Gou ","Kua ","Ge ","Tui ","Geng ","Pian ","Bi ","Ke ","Ka ","Yu ","Sui ","Lou ","Bo ","Xiao ","Pang ","Bo ","Ci ","Kuan ","Bin ","Mo ","Liao ","Lou ","Nao ","Du ","Zang ","Sui ","Ti ","Bin ","Kuan ","Lu ","Gao ","Gao ","Qiao ","Kao ","Qiao ","Lao ","Zao ","Biao ","Kun ","Kun ","Ti ","Fang ","Xiu ","Ran ","Mao ","Dan ","Kun ","Bin ","Fa ","Tiao ","Peng ","Zi ","Fa ","Ran ","Ti ","Pao ","Pi ","Mao ","Fu ","Er ","Rong ","Qu ","Gong ","Xiu ","Gua ","Ji ","Peng ","Zhua ","Shao ","Sha "],
  "155": ["Ti ","Li ","Bin ","Zong ","Ti ","Peng ","Song ","Zheng ","Quan ","Zong ","Shun ","Jian ","Duo ","Hu ","La ","Jiu ","Qi ","Lian ","Zhen ","Bin ","Peng ","Mo ","San ","Man ","Man ","Seng ","Xu ","Lie ","Qian ","Qian ","Nong ","Huan ","Kuai ","Ning ","Bin ","Lie ","Rang ","Dou ","Dou ","Nao ","Hong ","Xi ","Dou ","Han ","Dou ","Dou ","Jiu ","Chang ","Yu ","Yu ","Li ","Juan ","Fu ","Qian ","Gui ","Zong ","Liu ","Gui ","Shang ","Yu ","Gui ","Mei ","Ji ","Qi ","Jie ","Kui ","Hun ","Ba ","Po ","Mei ","Xu ","Yan ","Xiao ","Liang ","Yu ","Tui ","Qi ","Wang ","Liang ","Wei ","Jian ","Chi ","Piao ","Bi ","Mo ","Ji ","Xu ","Chou ","Yan ","Zhan ","Yu ","Dao ","Ren ","Ji ","Eri ","Gong ","Tuo ","Diao ","Ji ","Xu ","E ","E ","Sha ","Hang ","Tun ","Mo ","Jie ","Shen ","Fan ","Yuan ","Bi ","Lu ","Wen ","Hu ","Lu ","Za ","Fang ","Fen ","Na ","You ","Namazu ","Todo ","He ","Xia ","Qu ","Han ","Pi ","Ling ","Tuo ","Bo ","Qiu ","Ping ","Fu ","Bi ","Ji ","Wei ","Ju ","Diao ","Bo ","You ","Gun ","Pi ","Nian ","Xing ","Tai ","Bao ","Fu ","Zha ","Ju ","Gu ","Kajika ","Tong ",null,"Ta ","Jie ","Shu ","Hou ","Xiang ","Er ","An ","Wei ","Tiao ","Zhu ","Yin ","Lie ","Luo ","Tong ","Yi ","Qi ","Bing ","Wei ","Jiao ","Bu ","Gui ","Xian ","Ge ","Hui ","Bora ","Mate ","Kao ","Gori ","Duo ","Jun ","Ti ","Man ","Xiao ","Za ","Sha ","Qin ","Yu ","Nei ","Zhe ","Gun ","Geng ","Su ","Wu ","Qiu ","Ting ","Fu ","Wan ","You ","Li ","Sha ","Sha ","Gao ","Meng ","Ugui ","Asari ","Subashiri ","Kazunoko ","Yong ","Ni ","Zi ","Qi ","Qing ","Xiang ","Nei ","Chun ","Ji ","Diao ","Qie ","Gu ","Zhou ","Dong ","Lai ","Fei ","Ni ","Yi ","Kun ","Lu ","Jiu ","Chang ","Jing ","Lun ","Ling ","Zou ","Li ","Meng ","Zong ","Zhi ","Nian ","Shachi ","Dojou ","Sukesou ","Shi ","Shen ","Hun ","Shi ","Hou ","Xing ","Zhu ","La ","Zong ","Ji ","Bian ","Bian "],
  "156": ["Huan ","Quan ","Ze ","Wei ","Wei ","Yu ","Qun ","Rou ","Die ","Huang ","Lian ","Yan ","Qiu ","Qiu ","Jian ","Bi ","E ","Yang ","Fu ","Sai ","Jian ","Xia ","Tuo ","Hu ","Muroaji ","Ruo ","Haraka ","Wen ","Jian ","Hao ","Wu ","Fang ","Sao ","Liu ","Ma ","Shi ","Shi ","Yin ","Z ","Teng ","Ta ","Yao ","Ge ","Rong ","Qian ","Qi ","Wen ","Ruo ","Hatahata ","Lian ","Ao ","Le ","Hui ","Min ","Ji ","Tiao ","Qu ","Jian ","Sao ","Man ","Xi ","Qiu ","Biao ","Ji ","Ji ","Zhu ","Jiang ","Qiu ","Zhuan ","Yong ","Zhang ","Kang ","Xue ","Bie ","Jue ","Qu ","Xiang ","Bo ","Jiao ","Xun ","Su ","Huang ","Zun ","Shan ","Shan ","Fan ","Jue ","Lin ","Xun ","Miao ","Xi ","Eso ","Kyou ","Fen ","Guan ","Hou ","Kuai ","Zei ","Sao ","Zhan ","Gan ","Gui ","Sheng ","Li ","Chang ","Hatahata ","Shiira ","Mutsu ","Ru ","Ji ","Xu ","Huo ","Shiira ","Li ","Lie ","Li ","Mie ","Zhen ","Xiang ","E ","Lu ","Guan ","Li ","Xian ","Yu ","Dao ","Ji ","You ","Tun ","Lu ","Fang ","Ba ","He ","Bo ","Ping ","Nian ","Lu ","You ","Zha ","Fu ","Bo ","Bao ","Hou ","Pi ","Tai ","Gui ","Jie ","Kao ","Wei ","Er ","Tong ","Ze ","Hou ","Kuai ","Ji ","Jiao ","Xian ","Za ","Xiang ","Xun ","Geng ","Li ","Lian ","Jian ","Li ","Shi ","Tiao ","Gun ","Sha ","Wan ","Jun ","Ji ","Yong ","Qing ","Ling ","Qi ","Zou ","Fei ","Kun ","Chang ","Gu ","Ni ","Nian ","Diao ","Jing ","Shen ","Shi ","Zi ","Fen ","Die ","Bi ","Chang ","Shi ","Wen ","Wei ","Sai ","E ","Qiu ","Fu ","Huang ","Quan ","Jiang ","Bian ","Sao ","Ao ","Qi ","Ta ","Yin ","Yao ","Fang ","Jian ","Le ","Biao ","Xue ","Bie ","Man ","Min ","Yong ","Wei ","Xi ","Jue ","Shan ","Lin ","Zun ","Huo ","Gan ","Li ","Zhan ","Guan ","Niao ","Yi ","Fu ","Li ","Jiu ","Bu ","Yan ","Fu ","Diao ","Ji ","Feng ","Nio ","Gan ","Shi ","Feng ","Ming ","Bao ","Yuan ","Zhi ","Hu ","Qin ","Fu ","Fen ","Wen ","Jian ","Shi ","Yu "],
  "157": ["Fou ","Yiao ","Jue ","Jue ","Pi ","Huan ","Zhen ","Bao ","Yan ","Ya ","Zheng ","Fang ","Feng ","Wen ","Ou ","Te ","Jia ","Nu ","Ling ","Mie ","Fu ","Tuo ","Wen ","Li ","Bian ","Zhi ","Ge ","Yuan ","Zi ","Qu ","Xiao ","Zhi ","Dan ","Ju ","You ","Gu ","Zhong ","Yu ","Yang ","Rong ","Ya ","Tie ","Yu ","Shigi ","Ying ","Zhui ","Wu ","Er ","Gua ","Ai ","Zhi ","Yan ","Heng ","Jiao ","Ji ","Lie ","Zhu ","Ren ","Yi ","Hong ","Luo ","Ru ","Mou ","Ge ","Ren ","Jiao ","Xiu ","Zhou ","Zhi ","Luo ","Chidori ","Toki ","Ten ","Luan ","Jia ","Ji ","Yu ","Huan ","Tuo ","Bu ","Wu ","Juan ","Yu ","Bo ","Xun ","Xun ","Bi ","Xi ","Jun ","Ju ","Tu ","Jing ","Ti ","E ","E ","Kuang ","Hu ","Wu ","Shen ","Lai ","Ikaruga ","Kakesu ","Lu ","Ping ","Shu ","Fu ","An ","Zhao ","Peng ","Qin ","Qian ","Bei ","Diao ","Lu ","Que ","Jian ","Ju ","Tu ","Ya ","Yuan ","Qi ","Li ","Ye ","Zhui ","Kong ","Zhui ","Kun ","Sheng ","Qi ","Jing ","Yi ","Yi ","Jing ","Zi ","Lai ","Dong ","Qi ","Chun ","Geng ","Ju ","Qu ","Isuka ","Kikuitadaki ","Ji ","Shu ",null,"Chi ","Miao ","Rou ","An ","Qiu ","Ti ","Hu ","Ti ","E ","Jie ","Mao ","Fu ","Chun ","Tu ","Yan ","He ","Yuan ","Pian ","Yun ","Mei ","Hu ","Ying ","Dun ","Mu ","Ju ","Tsugumi ","Cang ","Fang ","Gu ","Ying ","Yuan ","Xuan ","Weng ","Shi ","He ","Chu ","Tang ","Xia ","Ruo ","Liu ","Ji ","Gu ","Jian ","Zhun ","Han ","Zi ","Zi ","Ni ","Yao ","Yan ","Ji ","Li ","Tian ","Kou ","Ti ","Ti ","Ni ","Tu ","Ma ","Jiao ","Gao ","Tian ","Chen ","Li ","Zhuan ","Zhe ","Ao ","Yao ","Yi ","Ou ","Chi ","Zhi ","Liao ","Rong ","Lou ","Bi ","Shuang ","Zhuo ","Yu ","Wu ","Jue ","Yin ","Quan ","Si ","Jiao ","Yi ","Hua ","Bi ","Ying ","Su ","Huang ","Fan ","Jiao ","Liao ","Yan ","Kao ","Jiu ","Xian ","Xian ","Tu ","Mai ","Zun ","Yu ","Ying ","Lu ","Tuan ","Xian ","Xue ","Yi ","Pi "],
  "158": ["Shu ","Luo ","Qi ","Yi ","Ji ","Zhe ","Yu ","Zhan ","Ye ","Yang ","Pi ","Ning ","Huo ","Mi ","Ying ","Meng ","Di ","Yue ","Yu ","Lei ","Bao ","Lu ","He ","Long ","Shuang ","Yue ","Ying ","Guan ","Qu ","Li ","Luan ","Niao ","Jiu ","Ji ","Yuan ","Ming ","Shi ","Ou ","Ya ","Cang ","Bao ","Zhen ","Gu ","Dong ","Lu ","Ya ","Xiao ","Yang ","Ling ","Zhi ","Qu ","Yuan ","Xue ","Tuo ","Si ","Zhi ","Er ","Gua ","Xiu ","Heng ","Zhou ","Ge ","Luan ","Hong ","Wu ","Bo ","Li ","Juan ","Hu ","E ","Yu ","Xian ","Ti ","Wu ","Que ","Miao ","An ","Kun ","Bei ","Peng ","Qian ","Chun ","Geng ","Yuan ","Su ","Hu ","He ","E ","Gu ","Qiu ","Zi ","Mei ","Mu ","Ni ","Yao ","Weng ","Liu ","Ji ","Ni ","Jian ","He ","Yi ","Ying ","Zhe ","Liao ","Liao ","Jiao ","Jiu ","Yu ","Lu ","Xuan ","Zhan ","Ying ","Huo ","Meng ","Guan ","Shuang ","Lu ","Jin ","Ling ","Jian ","Xian ","Cuo ","Jian ","Jian ","Yan ","Cuo ","Lu ","You ","Cu ","Ji ","Biao ","Cu ","Biao ","Zhu ","Jun ","Zhu ","Jian ","Mi ","Mi ","Wu ","Liu ","Chen ","Jun ","Lin ","Ni ","Qi ","Lu ","Jiu ","Jun ","Jing ","Li ","Xiang ","Yan ","Jia ","Mi ","Li ","She ","Zhang ","Lin ","Jing ","Ji ","Ling ","Yan ","Cu ","Mai ","Mai ","Ge ","Chao ","Fu ","Mian ","Mian ","Fu ","Pao ","Qu ","Qu ","Mou ","Fu ","Xian ","Lai ","Qu ","Mian ",null,"Feng ","Fu ","Qu ","Mian ","Ma ","Mo ","Mo ","Hui ","Ma ","Zou ","Nen ","Fen ","Huang ","Huang ","Jin ","Guang ","Tian ","Tou ","Heng ","Xi ","Kuang ","Heng ","Shu ","Li ","Nian ","Chi ","Hei ","Hei ","Yi ","Qian ","Dan ","Xi ","Tuan ","Mo ","Mo ","Qian ","Dai ","Chu ","You ","Dian ","Yi ","Xia ","Yan ","Qu ","Mei ","Yan ","Jing ","Yu ","Li ","Dang ","Du ","Can ","Yin ","An ","Yan ","Tan ","An ","Zhen ","Dai ","Can ","Yi ","Mei ","Dan ","Yan ","Du ","Lu ","Zhi ","Fen ","Fu ","Fu ","Min ","Min ","Yuan "],
  "159": ["Cu ","Qu ","Chao ","Wa ","Zhu ","Zhi ","Mang ","Ao ","Bie ","Tuo ","Bi ","Yuan ","Chao ","Tuo ","Ding ","Mi ","Nai ","Ding ","Zi ","Gu ","Gu ","Dong ","Fen ","Tao ","Yuan ","Pi ","Chang ","Gao ","Qi ","Yuan ","Tang ","Teng ","Shu ","Shu ","Fen ","Fei ","Wen ","Ba ","Diao ","Tuo ","Tong ","Qu ","Sheng ","Shi ","You ","Shi ","Ting ","Wu ","Nian ","Jing ","Hun ","Ju ","Yan ","Tu ","Ti ","Xi ","Xian ","Yan ","Lei ","Bi ","Yao ","Qiu ","Han ","Wu ","Wu ","Hou ","Xi ","Ge ","Zha ","Xiu ","Weng ","Zha ","Nong ","Nang ","Qi ","Zhai ","Ji ","Zi ","Ji ","Ji ","Qi ","Ji ","Chi ","Chen ","Chen ","He ","Ya ","Ken ","Xie ","Pao ","Cuo ","Shi ","Zi ","Chi ","Nian ","Ju ","Tiao ","Ling ","Ling ","Chu ","Quan ","Xie ","Ken ","Nie ","Jiu ","Yao ","Chuo ","Kun ","Yu ","Chu ","Yi ","Ni ","Cuo ","Zou ","Qu ","Nen ","Xian ","Ou ","E ","Wo ","Yi ","Chuo ","Zou ","Dian ","Chu ","Jin ","Ya ","Chi ","Chen ","He ","Ken ","Ju ","Ling ","Pao ","Tiao ","Zi ","Ken ","Yu ","Chuo ","Qu ","Wo ","Long ","Pang ","Gong ","Pang ","Yan ","Long ","Long ","Gong ","Kan ","Ta ","Ling ","Ta ","Long ","Gong ","Kan ","Gui ","Qiu ","Bie ","Gui ","Yue ","Chui ","He ","Jue ","Xie ","Yu ",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
  "160": ["it","ix","i","ip","iet","iex","ie","iep","at","ax","a","ap","uox","uo","uop","ot","ox","o","op","ex","e","wu","bit","bix","bi","bip","biet","biex","bie","biep","bat","bax","ba","bap","buox","buo","buop","bot","box","bo","bop","bex","be","bep","but","bux","bu","bup","burx","bur","byt","byx","by","byp","byrx","byr","pit","pix","pi","pip","piex","pie","piep","pat","pax","pa","pap","puox","puo","puop","pot","pox","po","pop","put","pux","pu","pup","purx","pur","pyt","pyx","py","pyp","pyrx","pyr","bbit","bbix","bbi","bbip","bbiet","bbiex","bbie","bbiep","bbat","bbax","bba","bbap","bbuox","bbuo","bbuop","bbot","bbox","bbo","bbop","bbex","bbe","bbep","bbut","bbux","bbu","bbup","bburx","bbur","bbyt","bbyx","bby","bbyp","nbit","nbix","nbi","nbip","nbiex","nbie","nbiep","nbat","nbax","nba","nbap","nbot","nbox","nbo","nbop","nbut","nbux","nbu","nbup","nburx","nbur","nbyt","nbyx","nby","nbyp","nbyrx","nbyr","hmit","hmix","hmi","hmip","hmiex","hmie","hmiep","hmat","hmax","hma","hmap","hmuox","hmuo","hmuop","hmot","hmox","hmo","hmop","hmut","hmux","hmu","hmup","hmurx","hmur","hmyx","hmy","hmyp","hmyrx","hmyr","mit","mix","mi","mip","miex","mie","miep","mat","max","ma","map","muot","muox","muo","muop","mot","mox","mo","mop","mex","me","mut","mux","mu","mup","murx","mur","myt","myx","my","myp","fit","fix","fi","fip","fat","fax","fa","fap","fox","fo","fop","fut","fux","fu","fup","furx","fur","fyt","fyx","fy","fyp","vit","vix","vi","vip","viet","viex","vie","viep","vat","vax","va","vap","vot","vox","vo","vop","vex","vep","vut","vux","vu","vup","vurx","vur","vyt","vyx","vy","vyp","vyrx","vyr"],
  "161": ["dit","dix","di","dip","diex","die","diep","dat","dax","da","dap","duox","duo","dot","dox","do","dop","dex","de","dep","dut","dux","du","dup","durx","dur","tit","tix","ti","tip","tiex","tie","tiep","tat","tax","ta","tap","tuot","tuox","tuo","tuop","tot","tox","to","top","tex","te","tep","tut","tux","tu","tup","turx","tur","ddit","ddix","ddi","ddip","ddiex","ddie","ddiep","ddat","ddax","dda","ddap","dduox","dduo","dduop","ddot","ddox","ddo","ddop","ddex","dde","ddep","ddut","ddux","ddu","ddup","ddurx","ddur","ndit","ndix","ndi","ndip","ndiex","ndie","ndat","ndax","nda","ndap","ndot","ndox","ndo","ndop","ndex","nde","ndep","ndut","ndux","ndu","ndup","ndurx","ndur","hnit","hnix","hni","hnip","hniet","hniex","hnie","hniep","hnat","hnax","hna","hnap","hnuox","hnuo","hnot","hnox","hnop","hnex","hne","hnep","hnut","nit","nix","ni","nip","niex","nie","niep","nax","na","nap","nuox","nuo","nuop","not","nox","no","nop","nex","ne","nep","nut","nux","nu","nup","nurx","nur","hlit","hlix","hli","hlip","hliex","hlie","hliep","hlat","hlax","hla","hlap","hluox","hluo","hluop","hlox","hlo","hlop","hlex","hle","hlep","hlut","hlux","hlu","hlup","hlurx","hlur","hlyt","hlyx","hly","hlyp","hlyrx","hlyr","lit","lix","li","lip","liet","liex","lie","liep","lat","lax","la","lap","luot","luox","luo","luop","lot","lox","lo","lop","lex","le","lep","lut","lux","lu","lup","lurx","lur","lyt","lyx","ly","lyp","lyrx","lyr","git","gix","gi","gip","giet","giex","gie","giep","gat","gax","ga","gap","guot","guox","guo","guop","got","gox","go","gop","get","gex","ge","gep","gut","gux","gu","gup","gurx","gur","kit","kix","ki","kip","kiex","kie","kiep","kat"],
  "162": ["kax","ka","kap","kuox","kuo","kuop","kot","kox","ko","kop","ket","kex","ke","kep","kut","kux","ku","kup","kurx","kur","ggit","ggix","ggi","ggiex","ggie","ggiep","ggat","ggax","gga","ggap","gguot","gguox","gguo","gguop","ggot","ggox","ggo","ggop","gget","ggex","gge","ggep","ggut","ggux","ggu","ggup","ggurx","ggur","mgiex","mgie","mgat","mgax","mga","mgap","mguox","mguo","mguop","mgot","mgox","mgo","mgop","mgex","mge","mgep","mgut","mgux","mgu","mgup","mgurx","mgur","hxit","hxix","hxi","hxip","hxiet","hxiex","hxie","hxiep","hxat","hxax","hxa","hxap","hxuot","hxuox","hxuo","hxuop","hxot","hxox","hxo","hxop","hxex","hxe","hxep","ngiex","ngie","ngiep","ngat","ngax","nga","ngap","nguot","nguox","nguo","ngot","ngox","ngo","ngop","ngex","nge","ngep","hit","hiex","hie","hat","hax","ha","hap","huot","huox","huo","huop","hot","hox","ho","hop","hex","he","hep","wat","wax","wa","wap","wuox","wuo","wuop","wox","wo","wop","wex","we","wep","zit","zix","zi","zip","ziex","zie","ziep","zat","zax","za","zap","zuox","zuo","zuop","zot","zox","zo","zop","zex","ze","zep","zut","zux","zu","zup","zurx","zur","zyt","zyx","zy","zyp","zyrx","zyr","cit","cix","ci","cip","ciet","ciex","cie","ciep","cat","cax","ca","cap","cuox","cuo","cuop","cot","cox","co","cop","cex","ce","cep","cut","cux","cu","cup","curx","cur","cyt","cyx","cy","cyp","cyrx","cyr","zzit","zzix","zzi","zzip","zziet","zziex","zzie","zziep","zzat","zzax","zza","zzap","zzox","zzo","zzop","zzex","zze","zzep","zzux","zzu","zzup","zzurx","zzur","zzyt","zzyx","zzy","zzyp","zzyrx","zzyr","nzit","nzix","nzi","nzip","nziex","nzie","nziep","nzat","nzax","nza","nzap","nzuox","nzuo","nzox","nzop","nzex","nze","nzux","nzu"],
  "163": ["nzup","nzurx","nzur","nzyt","nzyx","nzy","nzyp","nzyrx","nzyr","sit","six","si","sip","siex","sie","siep","sat","sax","sa","sap","suox","suo","suop","sot","sox","so","sop","sex","se","sep","sut","sux","su","sup","surx","sur","syt","syx","sy","syp","syrx","syr","ssit","ssix","ssi","ssip","ssiex","ssie","ssiep","ssat","ssax","ssa","ssap","ssot","ssox","sso","ssop","ssex","sse","ssep","ssut","ssux","ssu","ssup","ssyt","ssyx","ssy","ssyp","ssyrx","ssyr","zhat","zhax","zha","zhap","zhuox","zhuo","zhuop","zhot","zhox","zho","zhop","zhet","zhex","zhe","zhep","zhut","zhux","zhu","zhup","zhurx","zhur","zhyt","zhyx","zhy","zhyp","zhyrx","zhyr","chat","chax","cha","chap","chuot","chuox","chuo","chuop","chot","chox","cho","chop","chet","chex","che","chep","chux","chu","chup","churx","chur","chyt","chyx","chy","chyp","chyrx","chyr","rrax","rra","rruox","rruo","rrot","rrox","rro","rrop","rret","rrex","rre","rrep","rrut","rrux","rru","rrup","rrurx","rrur","rryt","rryx","rry","rryp","rryrx","rryr","nrat","nrax","nra","nrap","nrox","nro","nrop","nret","nrex","nre","nrep","nrut","nrux","nru","nrup","nrurx","nrur","nryt","nryx","nry","nryp","nryrx","nryr","shat","shax","sha","shap","shuox","shuo","shuop","shot","shox","sho","shop","shet","shex","she","shep","shut","shux","shu","shup","shurx","shur","shyt","shyx","shy","shyp","shyrx","shyr","rat","rax","ra","rap","ruox","ruo","ruop","rot","rox","ro","rop","rex","re","rep","rut","rux","ru","rup","rurx","rur","ryt","ryx","ry","ryp","ryrx","ryr","jit","jix","ji","jip","jiet","jiex","jie","jiep","juot","juox","juo","juop","jot","jox","jo","jop","jut","jux","ju","jup","jurx","jur","jyt","jyx","jy","jyp","jyrx","jyr","qit","qix","qi","qip"],
  "164": ["qiet","qiex","qie","qiep","quot","quox","quo","quop","qot","qox","qo","qop","qut","qux","qu","qup","qurx","qur","qyt","qyx","qy","qyp","qyrx","qyr","jjit","jjix","jji","jjip","jjiet","jjiex","jjie","jjiep","jjuox","jjuo","jjuop","jjot","jjox","jjo","jjop","jjut","jjux","jju","jjup","jjurx","jjur","jjyt","jjyx","jjy","jjyp","njit","njix","nji","njip","njiet","njiex","njie","njiep","njuox","njuo","njot","njox","njo","njop","njux","nju","njup","njurx","njur","njyt","njyx","njy","njyp","njyrx","njyr","nyit","nyix","nyi","nyip","nyiet","nyiex","nyie","nyiep","nyuox","nyuo","nyuop","nyot","nyox","nyo","nyop","nyut","nyux","nyu","nyup","xit","xix","xi","xip","xiet","xiex","xie","xiep","xuox","xuo","xot","xox","xo","xop","xyt","xyx","xy","xyp","xyrx","xyr","yit","yix","yi","yip","yiet","yiex","yie","yiep","yuot","yuox","yuo","yuop","yot","yox","yo","yop","yut","yux","yu","yup","yurx","yur","yyt","yyx","yy","yyp","yyrx","yyr",null,null,null,"Qot","Li","Kit","Nyip","Cyp","Ssi","Ggop","Gep","Mi","Hxit","Lyr","Bbut","Mop","Yo","Put","Hxuo","Tat","Ga",null,null,"Ddur","Bur","Gguo","Nyop","Tu","Op","Jjut","Zot","Pyt","Hmo","Yit","Vur","Shy","Vep","Za","Jo",null,"Jjy","Got","Jjie","Wo","Du","Shur","Lie","Cy","Cuop","Cip","Hxop","Shat",null,"Shop","Che","Zziet",null,"Ke",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
  "167": ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "A", "a", "A", "a", "HENG", "heng", "TZ", "tz", "3", "3", "4", "4", "4", "4", "F", "S", "AA", "aa", "AO", "ao", "AU", "au", "AV", "av", "AV-", "av-", "AY", "ay", "C", "c", "K", "k", "K", "k", "K", "k", "L", "l", "L", "l", "O", "o", "O", "o", "OO", "oo", "P", "p", "P", "p", "P", "p", "Q", "q", "Q", "q", "R", "r", "R", "r", "V", "v", "VY", "vy", "Z", "z", "TH", "th", "TH", "th", "Y", "y", "ET", "et", "IS", "is", "CON", "con", "US", "us", "dum", "lum", "num", "rum", "RUM", "tum", "um", "D", "d", "F", "f", "G", "G", "g", "L", "l", "R", "r", "S", "s", "T", "t", "^", ":", "=", "'", "'", "H", "l", ".", "N", "n", "C", "c", "c", "h", "B", "b", "F", "f", "AE", "ae", "OE", "oe", "UE", "ue", "G", "g", "K", "k", "N", "n", "R", "r", "S", "s", "H", "E", "G", "L", "I", "Q", "K", "T", "J", "CHI", "B", "b", "O", "o", "U", "u", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "I", "H", "oe", "M", "F", "P", "M", "I", "M1"],
  "172": ["ga","gag","gagg","gags","gan","ganj","ganh","gad","gal","galg","galm","galb","gals","galt","galp","galh","gam","gab","gabs","gas","gass","gang","gaj","gac","gak","gat","gap","gah","gae","gaeg","gaegg","gaegs","gaen","gaenj","gaenh","gaed","gael","gaelg","gaelm","gaelb","gaels","gaelt","gaelp","gaelh","gaem","gaeb","gaebs","gaes","gaess","gaeng","gaej","gaec","gaek","gaet","gaep","gaeh","gya","gyag","gyagg","gyags","gyan","gyanj","gyanh","gyad","gyal","gyalg","gyalm","gyalb","gyals","gyalt","gyalp","gyalh","gyam","gyab","gyabs","gyas","gyass","gyang","gyaj","gyac","gyak","gyat","gyap","gyah","gyae","gyaeg","gyaegg","gyaegs","gyaen","gyaenj","gyaenh","gyaed","gyael","gyaelg","gyaelm","gyaelb","gyaels","gyaelt","gyaelp","gyaelh","gyaem","gyaeb","gyaebs","gyaes","gyaess","gyaeng","gyaej","gyaec","gyaek","gyaet","gyaep","gyaeh","geo","geog","geogg","geogs","geon","geonj","geonh","geod","geol","geolg","geolm","geolb","geols","geolt","geolp","geolh","geom","geob","geobs","geos","geoss","geong","geoj","geoc","geok","geot","geop","geoh","ge","geg","gegg","gegs","gen","genj","genh","ged","gel","gelg","gelm","gelb","gels","gelt","gelp","gelh","gem","geb","gebs","ges","gess","geng","gej","gec","gek","get","gep","geh","gyeo","gyeog","gyeogg","gyeogs","gyeon","gyeonj","gyeonh","gyeod","gyeol","gyeolg","gyeolm","gyeolb","gyeols","gyeolt","gyeolp","gyeolh","gyeom","gyeob","gyeobs","gyeos","gyeoss","gyeong","gyeoj","gyeoc","gyeok","gyeot","gyeop","gyeoh","gye","gyeg","gyegg","gyegs","gyen","gyenj","gyenh","gyed","gyel","gyelg","gyelm","gyelb","gyels","gyelt","gyelp","gyelh","gyem","gyeb","gyebs","gyes","gyess","gyeng","gyej","gyec","gyek","gyet","gyep","gyeh","go","gog","gogg","gogs","gon","gonj","gonh","god","gol","golg","golm","golb","gols","golt","golp","golh","gom","gob","gobs","gos","goss","gong","goj","goc","gok","got","gop","goh","gwa","gwag","gwagg","gwags"],
  "173": ["gwan","gwanj","gwanh","gwad","gwal","gwalg","gwalm","gwalb","gwals","gwalt","gwalp","gwalh","gwam","gwab","gwabs","gwas","gwass","gwang","gwaj","gwac","gwak","gwat","gwap","gwah","gwae","gwaeg","gwaegg","gwaegs","gwaen","gwaenj","gwaenh","gwaed","gwael","gwaelg","gwaelm","gwaelb","gwaels","gwaelt","gwaelp","gwaelh","gwaem","gwaeb","gwaebs","gwaes","gwaess","gwaeng","gwaej","gwaec","gwaek","gwaet","gwaep","gwaeh","goe","goeg","goegg","goegs","goen","goenj","goenh","goed","goel","goelg","goelm","goelb","goels","goelt","goelp","goelh","goem","goeb","goebs","goes","goess","goeng","goej","goec","goek","goet","goep","goeh","gyo","gyog","gyogg","gyogs","gyon","gyonj","gyonh","gyod","gyol","gyolg","gyolm","gyolb","gyols","gyolt","gyolp","gyolh","gyom","gyob","gyobs","gyos","gyoss","gyong","gyoj","gyoc","gyok","gyot","gyop","gyoh","gu","gug","gugg","gugs","gun","gunj","gunh","gud","gul","gulg","gulm","gulb","guls","gult","gulp","gulh","gum","gub","gubs","gus","guss","gung","guj","guc","guk","gut","gup","guh","gweo","gweog","gweogg","gweogs","gweon","gweonj","gweonh","gweod","gweol","gweolg","gweolm","gweolb","gweols","gweolt","gweolp","gweolh","gweom","gweob","gweobs","gweos","gweoss","gweong","gweoj","gweoc","gweok","gweot","gweop","gweoh","gwe","gweg","gwegg","gwegs","gwen","gwenj","gwenh","gwed","gwel","gwelg","gwelm","gwelb","gwels","gwelt","gwelp","gwelh","gwem","gweb","gwebs","gwes","gwess","gweng","gwej","gwec","gwek","gwet","gwep","gweh","gwi","gwig","gwigg","gwigs","gwin","gwinj","gwinh","gwid","gwil","gwilg","gwilm","gwilb","gwils","gwilt","gwilp","gwilh","gwim","gwib","gwibs","gwis","gwiss","gwing","gwij","gwic","gwik","gwit","gwip","gwih","gyu","gyug","gyugg","gyugs","gyun","gyunj","gyunh","gyud","gyul","gyulg","gyulm","gyulb","gyuls","gyult","gyulp","gyulh","gyum","gyub","gyubs","gyus","gyuss","gyung","gyuj","gyuc","gyuk","gyut","gyup","gyuh","geu","geug","geugg","geugs","geun","geunj","geunh","geud"],
  "174": ["geul","geulg","geulm","geulb","geuls","geult","geulp","geulh","geum","geub","geubs","geus","geuss","geung","geuj","geuc","geuk","geut","geup","geuh","gyi","gyig","gyigg","gyigs","gyin","gyinj","gyinh","gyid","gyil","gyilg","gyilm","gyilb","gyils","gyilt","gyilp","gyilh","gyim","gyib","gyibs","gyis","gyiss","gying","gyij","gyic","gyik","gyit","gyip","gyih","gi","gig","gigg","gigs","gin","ginj","ginh","gid","gil","gilg","gilm","gilb","gils","gilt","gilp","gilh","gim","gib","gibs","gis","giss","ging","gij","gic","gik","git","gip","gih","gga","ggag","ggagg","ggags","ggan","gganj","gganh","ggad","ggal","ggalg","ggalm","ggalb","ggals","ggalt","ggalp","ggalh","ggam","ggab","ggabs","ggas","ggass","ggang","ggaj","ggac","ggak","ggat","ggap","ggah","ggae","ggaeg","ggaegg","ggaegs","ggaen","ggaenj","ggaenh","ggaed","ggael","ggaelg","ggaelm","ggaelb","ggaels","ggaelt","ggaelp","ggaelh","ggaem","ggaeb","ggaebs","ggaes","ggaess","ggaeng","ggaej","ggaec","ggaek","ggaet","ggaep","ggaeh","ggya","ggyag","ggyagg","ggyags","ggyan","ggyanj","ggyanh","ggyad","ggyal","ggyalg","ggyalm","ggyalb","ggyals","ggyalt","ggyalp","ggyalh","ggyam","ggyab","ggyabs","ggyas","ggyass","ggyang","ggyaj","ggyac","ggyak","ggyat","ggyap","ggyah","ggyae","ggyaeg","ggyaegg","ggyaegs","ggyaen","ggyaenj","ggyaenh","ggyaed","ggyael","ggyaelg","ggyaelm","ggyaelb","ggyaels","ggyaelt","ggyaelp","ggyaelh","ggyaem","ggyaeb","ggyaebs","ggyaes","ggyaess","ggyaeng","ggyaej","ggyaec","ggyaek","ggyaet","ggyaep","ggyaeh","ggeo","ggeog","ggeogg","ggeogs","ggeon","ggeonj","ggeonh","ggeod","ggeol","ggeolg","ggeolm","ggeolb","ggeols","ggeolt","ggeolp","ggeolh","ggeom","ggeob","ggeobs","ggeos","ggeoss","ggeong","ggeoj","ggeoc","ggeok","ggeot","ggeop","ggeoh","gge","ggeg","ggegg","ggegs","ggen","ggenj","ggenh","gged","ggel","ggelg","ggelm","ggelb","ggels","ggelt","ggelp","ggelh","ggem","ggeb","ggebs","gges","ggess","ggeng","ggej","ggec","ggek","gget","ggep","ggeh","ggyeo","ggyeog","ggyeogg","ggyeogs","ggyeon","ggyeonj","ggyeonh","ggyeod","ggyeol","ggyeolg","ggyeolm","ggyeolb"],
  "175": ["ggyeols","ggyeolt","ggyeolp","ggyeolh","ggyeom","ggyeob","ggyeobs","ggyeos","ggyeoss","ggyeong","ggyeoj","ggyeoc","ggyeok","ggyeot","ggyeop","ggyeoh","ggye","ggyeg","ggyegg","ggyegs","ggyen","ggyenj","ggyenh","ggyed","ggyel","ggyelg","ggyelm","ggyelb","ggyels","ggyelt","ggyelp","ggyelh","ggyem","ggyeb","ggyebs","ggyes","ggyess","ggyeng","ggyej","ggyec","ggyek","ggyet","ggyep","ggyeh","ggo","ggog","ggogg","ggogs","ggon","ggonj","ggonh","ggod","ggol","ggolg","ggolm","ggolb","ggols","ggolt","ggolp","ggolh","ggom","ggob","ggobs","ggos","ggoss","ggong","ggoj","ggoc","ggok","ggot","ggop","ggoh","ggwa","ggwag","ggwagg","ggwags","ggwan","ggwanj","ggwanh","ggwad","ggwal","ggwalg","ggwalm","ggwalb","ggwals","ggwalt","ggwalp","ggwalh","ggwam","ggwab","ggwabs","ggwas","ggwass","ggwang","ggwaj","ggwac","ggwak","ggwat","ggwap","ggwah","ggwae","ggwaeg","ggwaegg","ggwaegs","ggwaen","ggwaenj","ggwaenh","ggwaed","ggwael","ggwaelg","ggwaelm","ggwaelb","ggwaels","ggwaelt","ggwaelp","ggwaelh","ggwaem","ggwaeb","ggwaebs","ggwaes","ggwaess","ggwaeng","ggwaej","ggwaec","ggwaek","ggwaet","ggwaep","ggwaeh","ggoe","ggoeg","ggoegg","ggoegs","ggoen","ggoenj","ggoenh","ggoed","ggoel","ggoelg","ggoelm","ggoelb","ggoels","ggoelt","ggoelp","ggoelh","ggoem","ggoeb","ggoebs","ggoes","ggoess","ggoeng","ggoej","ggoec","ggoek","ggoet","ggoep","ggoeh","ggyo","ggyog","ggyogg","ggyogs","ggyon","ggyonj","ggyonh","ggyod","ggyol","ggyolg","ggyolm","ggyolb","ggyols","ggyolt","ggyolp","ggyolh","ggyom","ggyob","ggyobs","ggyos","ggyoss","ggyong","ggyoj","ggyoc","ggyok","ggyot","ggyop","ggyoh","ggu","ggug","ggugg","ggugs","ggun","ggunj","ggunh","ggud","ggul","ggulg","ggulm","ggulb","gguls","ggult","ggulp","ggulh","ggum","ggub","ggubs","ggus","gguss","ggung","gguj","gguc","gguk","ggut","ggup","gguh","ggweo","ggweog","ggweogg","ggweogs","ggweon","ggweonj","ggweonh","ggweod","ggweol","ggweolg","ggweolm","ggweolb","ggweols","ggweolt","ggweolp","ggweolh","ggweom","ggweob","ggweobs","ggweos","ggweoss","ggweong","ggweoj","ggweoc","ggweok","ggweot","ggweop","ggweoh","ggwe","ggweg","ggwegg","ggwegs","ggwen","ggwenj","ggwenh","ggwed","ggwel","ggwelg","ggwelm","ggwelb","ggwels","ggwelt","ggwelp","ggwelh"],
  "176": ["ggwem","ggweb","ggwebs","ggwes","ggwess","ggweng","ggwej","ggwec","ggwek","ggwet","ggwep","ggweh","ggwi","ggwig","ggwigg","ggwigs","ggwin","ggwinj","ggwinh","ggwid","ggwil","ggwilg","ggwilm","ggwilb","ggwils","ggwilt","ggwilp","ggwilh","ggwim","ggwib","ggwibs","ggwis","ggwiss","ggwing","ggwij","ggwic","ggwik","ggwit","ggwip","ggwih","ggyu","ggyug","ggyugg","ggyugs","ggyun","ggyunj","ggyunh","ggyud","ggyul","ggyulg","ggyulm","ggyulb","ggyuls","ggyult","ggyulp","ggyulh","ggyum","ggyub","ggyubs","ggyus","ggyuss","ggyung","ggyuj","ggyuc","ggyuk","ggyut","ggyup","ggyuh","ggeu","ggeug","ggeugg","ggeugs","ggeun","ggeunj","ggeunh","ggeud","ggeul","ggeulg","ggeulm","ggeulb","ggeuls","ggeult","ggeulp","ggeulh","ggeum","ggeub","ggeubs","ggeus","ggeuss","ggeung","ggeuj","ggeuc","ggeuk","ggeut","ggeup","ggeuh","ggyi","ggyig","ggyigg","ggyigs","ggyin","ggyinj","ggyinh","ggyid","ggyil","ggyilg","ggyilm","ggyilb","ggyils","ggyilt","ggyilp","ggyilh","ggyim","ggyib","ggyibs","ggyis","ggyiss","ggying","ggyij","ggyic","ggyik","ggyit","ggyip","ggyih","ggi","ggig","ggigg","ggigs","ggin","gginj","gginh","ggid","ggil","ggilg","ggilm","ggilb","ggils","ggilt","ggilp","ggilh","ggim","ggib","ggibs","ggis","ggiss","gging","ggij","ggic","ggik","ggit","ggip","ggih","na","nag","nagg","nags","nan","nanj","nanh","nad","nal","nalg","nalm","nalb","nals","nalt","nalp","nalh","nam","nab","nabs","nas","nass","nang","naj","nac","nak","nat","nap","nah","nae","naeg","naegg","naegs","naen","naenj","naenh","naed","nael","naelg","naelm","naelb","naels","naelt","naelp","naelh","naem","naeb","naebs","naes","naess","naeng","naej","naec","naek","naet","naep","naeh","nya","nyag","nyagg","nyags","nyan","nyanj","nyanh","nyad","nyal","nyalg","nyalm","nyalb","nyals","nyalt","nyalp","nyalh","nyam","nyab","nyabs","nyas","nyass","nyang","nyaj","nyac","nyak","nyat","nyap","nyah","nyae","nyaeg","nyaegg","nyaegs","nyaen","nyaenj","nyaenh","nyaed","nyael","nyaelg","nyaelm","nyaelb","nyaels","nyaelt","nyaelp","nyaelh","nyaem","nyaeb","nyaebs","nyaes"],
  "177": ["nyaess","nyaeng","nyaej","nyaec","nyaek","nyaet","nyaep","nyaeh","neo","neog","neogg","neogs","neon","neonj","neonh","neod","neol","neolg","neolm","neolb","neols","neolt","neolp","neolh","neom","neob","neobs","neos","neoss","neong","neoj","neoc","neok","neot","neop","neoh","ne","neg","negg","negs","nen","nenj","nenh","ned","nel","nelg","nelm","nelb","nels","nelt","nelp","nelh","nem","neb","nebs","nes","ness","neng","nej","nec","nek","net","nep","neh","nyeo","nyeog","nyeogg","nyeogs","nyeon","nyeonj","nyeonh","nyeod","nyeol","nyeolg","nyeolm","nyeolb","nyeols","nyeolt","nyeolp","nyeolh","nyeom","nyeob","nyeobs","nyeos","nyeoss","nyeong","nyeoj","nyeoc","nyeok","nyeot","nyeop","nyeoh","nye","nyeg","nyegg","nyegs","nyen","nyenj","nyenh","nyed","nyel","nyelg","nyelm","nyelb","nyels","nyelt","nyelp","nyelh","nyem","nyeb","nyebs","nyes","nyess","nyeng","nyej","nyec","nyek","nyet","nyep","nyeh","no","nog","nogg","nogs","non","nonj","nonh","nod","nol","nolg","nolm","nolb","nols","nolt","nolp","nolh","nom","nob","nobs","nos","noss","nong","noj","noc","nok","not","nop","noh","nwa","nwag","nwagg","nwags","nwan","nwanj","nwanh","nwad","nwal","nwalg","nwalm","nwalb","nwals","nwalt","nwalp","nwalh","nwam","nwab","nwabs","nwas","nwass","nwang","nwaj","nwac","nwak","nwat","nwap","nwah","nwae","nwaeg","nwaegg","nwaegs","nwaen","nwaenj","nwaenh","nwaed","nwael","nwaelg","nwaelm","nwaelb","nwaels","nwaelt","nwaelp","nwaelh","nwaem","nwaeb","nwaebs","nwaes","nwaess","nwaeng","nwaej","nwaec","nwaek","nwaet","nwaep","nwaeh","noe","noeg","noegg","noegs","noen","noenj","noenh","noed","noel","noelg","noelm","noelb","noels","noelt","noelp","noelh","noem","noeb","noebs","noes","noess","noeng","noej","noec","noek","noet","noep","noeh","nyo","nyog","nyogg","nyogs","nyon","nyonj","nyonh","nyod","nyol","nyolg","nyolm","nyolb","nyols","nyolt","nyolp","nyolh","nyom","nyob","nyobs","nyos","nyoss","nyong","nyoj","nyoc"],
  "178": ["nyok","nyot","nyop","nyoh","nu","nug","nugg","nugs","nun","nunj","nunh","nud","nul","nulg","nulm","nulb","nuls","nult","nulp","nulh","num","nub","nubs","nus","nuss","nung","nuj","nuc","nuk","nut","nup","nuh","nweo","nweog","nweogg","nweogs","nweon","nweonj","nweonh","nweod","nweol","nweolg","nweolm","nweolb","nweols","nweolt","nweolp","nweolh","nweom","nweob","nweobs","nweos","nweoss","nweong","nweoj","nweoc","nweok","nweot","nweop","nweoh","nwe","nweg","nwegg","nwegs","nwen","nwenj","nwenh","nwed","nwel","nwelg","nwelm","nwelb","nwels","nwelt","nwelp","nwelh","nwem","nweb","nwebs","nwes","nwess","nweng","nwej","nwec","nwek","nwet","nwep","nweh","nwi","nwig","nwigg","nwigs","nwin","nwinj","nwinh","nwid","nwil","nwilg","nwilm","nwilb","nwils","nwilt","nwilp","nwilh","nwim","nwib","nwibs","nwis","nwiss","nwing","nwij","nwic","nwik","nwit","nwip","nwih","nyu","nyug","nyugg","nyugs","nyun","nyunj","nyunh","nyud","nyul","nyulg","nyulm","nyulb","nyuls","nyult","nyulp","nyulh","nyum","nyub","nyubs","nyus","nyuss","nyung","nyuj","nyuc","nyuk","nyut","nyup","nyuh","neu","neug","neugg","neugs","neun","neunj","neunh","neud","neul","neulg","neulm","neulb","neuls","neult","neulp","neulh","neum","neub","neubs","neus","neuss","neung","neuj","neuc","neuk","neut","neup","neuh","nyi","nyig","nyigg","nyigs","nyin","nyinj","nyinh","nyid","nyil","nyilg","nyilm","nyilb","nyils","nyilt","nyilp","nyilh","nyim","nyib","nyibs","nyis","nyiss","nying","nyij","nyic","nyik","nyit","nyip","nyih","ni","nig","nigg","nigs","nin","ninj","ninh","nid","nil","nilg","nilm","nilb","nils","nilt","nilp","nilh","nim","nib","nibs","nis","niss","ning","nij","nic","nik","nit","nip","nih","da","dag","dagg","dags","dan","danj","danh","dad","dal","dalg","dalm","dalb","dals","dalt","dalp","dalh","dam","dab","dabs","das","dass","dang","daj","dac","dak","dat","dap","dah"],
  "179": ["dae","daeg","daegg","daegs","daen","daenj","daenh","daed","dael","daelg","daelm","daelb","daels","daelt","daelp","daelh","daem","daeb","daebs","daes","daess","daeng","daej","daec","daek","daet","daep","daeh","dya","dyag","dyagg","dyags","dyan","dyanj","dyanh","dyad","dyal","dyalg","dyalm","dyalb","dyals","dyalt","dyalp","dyalh","dyam","dyab","dyabs","dyas","dyass","dyang","dyaj","dyac","dyak","dyat","dyap","dyah","dyae","dyaeg","dyaegg","dyaegs","dyaen","dyaenj","dyaenh","dyaed","dyael","dyaelg","dyaelm","dyaelb","dyaels","dyaelt","dyaelp","dyaelh","dyaem","dyaeb","dyaebs","dyaes","dyaess","dyaeng","dyaej","dyaec","dyaek","dyaet","dyaep","dyaeh","deo","deog","deogg","deogs","deon","deonj","deonh","deod","deol","deolg","deolm","deolb","deols","deolt","deolp","deolh","deom","deob","deobs","deos","deoss","deong","deoj","deoc","deok","deot","deop","deoh","de","deg","degg","degs","den","denj","denh","ded","del","delg","delm","delb","dels","delt","delp","delh","dem","deb","debs","des","dess","deng","dej","dec","dek","det","dep","deh","dyeo","dyeog","dyeogg","dyeogs","dyeon","dyeonj","dyeonh","dyeod","dyeol","dyeolg","dyeolm","dyeolb","dyeols","dyeolt","dyeolp","dyeolh","dyeom","dyeob","dyeobs","dyeos","dyeoss","dyeong","dyeoj","dyeoc","dyeok","dyeot","dyeop","dyeoh","dye","dyeg","dyegg","dyegs","dyen","dyenj","dyenh","dyed","dyel","dyelg","dyelm","dyelb","dyels","dyelt","dyelp","dyelh","dyem","dyeb","dyebs","dyes","dyess","dyeng","dyej","dyec","dyek","dyet","dyep","dyeh","do","dog","dogg","dogs","don","donj","donh","dod","dol","dolg","dolm","dolb","dols","dolt","dolp","dolh","dom","dob","dobs","dos","doss","dong","doj","doc","dok","dot","dop","doh","dwa","dwag","dwagg","dwags","dwan","dwanj","dwanh","dwad","dwal","dwalg","dwalm","dwalb","dwals","dwalt","dwalp","dwalh","dwam","dwab","dwabs","dwas","dwass","dwang","dwaj","dwac","dwak","dwat","dwap","dwah","dwae","dwaeg","dwaegg","dwaegs"],
  "180": ["dwaen","dwaenj","dwaenh","dwaed","dwael","dwaelg","dwaelm","dwaelb","dwaels","dwaelt","dwaelp","dwaelh","dwaem","dwaeb","dwaebs","dwaes","dwaess","dwaeng","dwaej","dwaec","dwaek","dwaet","dwaep","dwaeh","doe","doeg","doegg","doegs","doen","doenj","doenh","doed","doel","doelg","doelm","doelb","doels","doelt","doelp","doelh","doem","doeb","doebs","does","doess","doeng","doej","doec","doek","doet","doep","doeh","dyo","dyog","dyogg","dyogs","dyon","dyonj","dyonh","dyod","dyol","dyolg","dyolm","dyolb","dyols","dyolt","dyolp","dyolh","dyom","dyob","dyobs","dyos","dyoss","dyong","dyoj","dyoc","dyok","dyot","dyop","dyoh","du","dug","dugg","dugs","dun","dunj","dunh","dud","dul","dulg","dulm","dulb","duls","dult","dulp","dulh","dum","dub","dubs","dus","duss","dung","duj","duc","duk","dut","dup","duh","dweo","dweog","dweogg","dweogs","dweon","dweonj","dweonh","dweod","dweol","dweolg","dweolm","dweolb","dweols","dweolt","dweolp","dweolh","dweom","dweob","dweobs","dweos","dweoss","dweong","dweoj","dweoc","dweok","dweot","dweop","dweoh","dwe","dweg","dwegg","dwegs","dwen","dwenj","dwenh","dwed","dwel","dwelg","dwelm","dwelb","dwels","dwelt","dwelp","dwelh","dwem","dweb","dwebs","dwes","dwess","dweng","dwej","dwec","dwek","dwet","dwep","dweh","dwi","dwig","dwigg","dwigs","dwin","dwinj","dwinh","dwid","dwil","dwilg","dwilm","dwilb","dwils","dwilt","dwilp","dwilh","dwim","dwib","dwibs","dwis","dwiss","dwing","dwij","dwic","dwik","dwit","dwip","dwih","dyu","dyug","dyugg","dyugs","dyun","dyunj","dyunh","dyud","dyul","dyulg","dyulm","dyulb","dyuls","dyult","dyulp","dyulh","dyum","dyub","dyubs","dyus","dyuss","dyung","dyuj","dyuc","dyuk","dyut","dyup","dyuh","deu","deug","deugg","deugs","deun","deunj","deunh","deud","deul","deulg","deulm","deulb","deuls","deult","deulp","deulh","deum","deub","deubs","deus","deuss","deung","deuj","deuc","deuk","deut","deup","deuh","dyi","dyig","dyigg","dyigs","dyin","dyinj","dyinh","dyid"],
  "181": ["dyil","dyilg","dyilm","dyilb","dyils","dyilt","dyilp","dyilh","dyim","dyib","dyibs","dyis","dyiss","dying","dyij","dyic","dyik","dyit","dyip","dyih","di","dig","digg","digs","din","dinj","dinh","did","dil","dilg","dilm","dilb","dils","dilt","dilp","dilh","dim","dib","dibs","dis","diss","ding","dij","dic","dik","dit","dip","dih","dda","ddag","ddagg","ddags","ddan","ddanj","ddanh","ddad","ddal","ddalg","ddalm","ddalb","ddals","ddalt","ddalp","ddalh","ddam","ddab","ddabs","ddas","ddass","ddang","ddaj","ddac","ddak","ddat","ddap","ddah","ddae","ddaeg","ddaegg","ddaegs","ddaen","ddaenj","ddaenh","ddaed","ddael","ddaelg","ddaelm","ddaelb","ddaels","ddaelt","ddaelp","ddaelh","ddaem","ddaeb","ddaebs","ddaes","ddaess","ddaeng","ddaej","ddaec","ddaek","ddaet","ddaep","ddaeh","ddya","ddyag","ddyagg","ddyags","ddyan","ddyanj","ddyanh","ddyad","ddyal","ddyalg","ddyalm","ddyalb","ddyals","ddyalt","ddyalp","ddyalh","ddyam","ddyab","ddyabs","ddyas","ddyass","ddyang","ddyaj","ddyac","ddyak","ddyat","ddyap","ddyah","ddyae","ddyaeg","ddyaegg","ddyaegs","ddyaen","ddyaenj","ddyaenh","ddyaed","ddyael","ddyaelg","ddyaelm","ddyaelb","ddyaels","ddyaelt","ddyaelp","ddyaelh","ddyaem","ddyaeb","ddyaebs","ddyaes","ddyaess","ddyaeng","ddyaej","ddyaec","ddyaek","ddyaet","ddyaep","ddyaeh","ddeo","ddeog","ddeogg","ddeogs","ddeon","ddeonj","ddeonh","ddeod","ddeol","ddeolg","ddeolm","ddeolb","ddeols","ddeolt","ddeolp","ddeolh","ddeom","ddeob","ddeobs","ddeos","ddeoss","ddeong","ddeoj","ddeoc","ddeok","ddeot","ddeop","ddeoh","dde","ddeg","ddegg","ddegs","dden","ddenj","ddenh","dded","ddel","ddelg","ddelm","ddelb","ddels","ddelt","ddelp","ddelh","ddem","ddeb","ddebs","ddes","ddess","ddeng","ddej","ddec","ddek","ddet","ddep","ddeh","ddyeo","ddyeog","ddyeogg","ddyeogs","ddyeon","ddyeonj","ddyeonh","ddyeod","ddyeol","ddyeolg","ddyeolm","ddyeolb","ddyeols","ddyeolt","ddyeolp","ddyeolh","ddyeom","ddyeob","ddyeobs","ddyeos","ddyeoss","ddyeong","ddyeoj","ddyeoc","ddyeok","ddyeot","ddyeop","ddyeoh","ddye","ddyeg","ddyegg","ddyegs","ddyen","ddyenj","ddyenh","ddyed","ddyel","ddyelg","ddyelm","ddyelb"],
  "182": ["ddyels","ddyelt","ddyelp","ddyelh","ddyem","ddyeb","ddyebs","ddyes","ddyess","ddyeng","ddyej","ddyec","ddyek","ddyet","ddyep","ddyeh","ddo","ddog","ddogg","ddogs","ddon","ddonj","ddonh","ddod","ddol","ddolg","ddolm","ddolb","ddols","ddolt","ddolp","ddolh","ddom","ddob","ddobs","ddos","ddoss","ddong","ddoj","ddoc","ddok","ddot","ddop","ddoh","ddwa","ddwag","ddwagg","ddwags","ddwan","ddwanj","ddwanh","ddwad","ddwal","ddwalg","ddwalm","ddwalb","ddwals","ddwalt","ddwalp","ddwalh","ddwam","ddwab","ddwabs","ddwas","ddwass","ddwang","ddwaj","ddwac","ddwak","ddwat","ddwap","ddwah","ddwae","ddwaeg","ddwaegg","ddwaegs","ddwaen","ddwaenj","ddwaenh","ddwaed","ddwael","ddwaelg","ddwaelm","ddwaelb","ddwaels","ddwaelt","ddwaelp","ddwaelh","ddwaem","ddwaeb","ddwaebs","ddwaes","ddwaess","ddwaeng","ddwaej","ddwaec","ddwaek","ddwaet","ddwaep","ddwaeh","ddoe","ddoeg","ddoegg","ddoegs","ddoen","ddoenj","ddoenh","ddoed","ddoel","ddoelg","ddoelm","ddoelb","ddoels","ddoelt","ddoelp","ddoelh","ddoem","ddoeb","ddoebs","ddoes","ddoess","ddoeng","ddoej","ddoec","ddoek","ddoet","ddoep","ddoeh","ddyo","ddyog","ddyogg","ddyogs","ddyon","ddyonj","ddyonh","ddyod","ddyol","ddyolg","ddyolm","ddyolb","ddyols","ddyolt","ddyolp","ddyolh","ddyom","ddyob","ddyobs","ddyos","ddyoss","ddyong","ddyoj","ddyoc","ddyok","ddyot","ddyop","ddyoh","ddu","ddug","ddugg","ddugs","ddun","ddunj","ddunh","ddud","ddul","ddulg","ddulm","ddulb","dduls","ddult","ddulp","ddulh","ddum","ddub","ddubs","ddus","dduss","ddung","dduj","dduc","dduk","ddut","ddup","dduh","ddweo","ddweog","ddweogg","ddweogs","ddweon","ddweonj","ddweonh","ddweod","ddweol","ddweolg","ddweolm","ddweolb","ddweols","ddweolt","ddweolp","ddweolh","ddweom","ddweob","ddweobs","ddweos","ddweoss","ddweong","ddweoj","ddweoc","ddweok","ddweot","ddweop","ddweoh","ddwe","ddweg","ddwegg","ddwegs","ddwen","ddwenj","ddwenh","ddwed","ddwel","ddwelg","ddwelm","ddwelb","ddwels","ddwelt","ddwelp","ddwelh","ddwem","ddweb","ddwebs","ddwes","ddwess","ddweng","ddwej","ddwec","ddwek","ddwet","ddwep","ddweh","ddwi","ddwig","ddwigg","ddwigs","ddwin","ddwinj","ddwinh","ddwid","ddwil","ddwilg","ddwilm","ddwilb","ddwils","ddwilt","ddwilp","ddwilh"],
  "183": ["ddwim","ddwib","ddwibs","ddwis","ddwiss","ddwing","ddwij","ddwic","ddwik","ddwit","ddwip","ddwih","ddyu","ddyug","ddyugg","ddyugs","ddyun","ddyunj","ddyunh","ddyud","ddyul","ddyulg","ddyulm","ddyulb","ddyuls","ddyult","ddyulp","ddyulh","ddyum","ddyub","ddyubs","ddyus","ddyuss","ddyung","ddyuj","ddyuc","ddyuk","ddyut","ddyup","ddyuh","ddeu","ddeug","ddeugg","ddeugs","ddeun","ddeunj","ddeunh","ddeud","ddeul","ddeulg","ddeulm","ddeulb","ddeuls","ddeult","ddeulp","ddeulh","ddeum","ddeub","ddeubs","ddeus","ddeuss","ddeung","ddeuj","ddeuc","ddeuk","ddeut","ddeup","ddeuh","ddyi","ddyig","ddyigg","ddyigs","ddyin","ddyinj","ddyinh","ddyid","ddyil","ddyilg","ddyilm","ddyilb","ddyils","ddyilt","ddyilp","ddyilh","ddyim","ddyib","ddyibs","ddyis","ddyiss","ddying","ddyij","ddyic","ddyik","ddyit","ddyip","ddyih","ddi","ddig","ddigg","ddigs","ddin","ddinj","ddinh","ddid","ddil","ddilg","ddilm","ddilb","ddils","ddilt","ddilp","ddilh","ddim","ddib","ddibs","ddis","ddiss","dding","ddij","ddic","ddik","ddit","ddip","ddih","ra","rag","ragg","rags","ran","ranj","ranh","rad","ral","ralg","ralm","ralb","rals","ralt","ralp","ralh","ram","rab","rabs","ras","rass","rang","raj","rac","rak","rat","rap","rah","rae","raeg","raegg","raegs","raen","raenj","raenh","raed","rael","raelg","raelm","raelb","raels","raelt","raelp","raelh","raem","raeb","raebs","raes","raess","raeng","raej","raec","raek","raet","raep","raeh","rya","ryag","ryagg","ryags","ryan","ryanj","ryanh","ryad","ryal","ryalg","ryalm","ryalb","ryals","ryalt","ryalp","ryalh","ryam","ryab","ryabs","ryas","ryass","ryang","ryaj","ryac","ryak","ryat","ryap","ryah","ryae","ryaeg","ryaegg","ryaegs","ryaen","ryaenj","ryaenh","ryaed","ryael","ryaelg","ryaelm","ryaelb","ryaels","ryaelt","ryaelp","ryaelh","ryaem","ryaeb","ryaebs","ryaes","ryaess","ryaeng","ryaej","ryaec","ryaek","ryaet","ryaep","ryaeh","reo","reog","reogg","reogs","reon","reonj","reonh","reod","reol","reolg","reolm","reolb","reols","reolt","reolp","reolh","reom","reob","reobs","reos"],
  "184": ["reoss","reong","reoj","reoc","reok","reot","reop","reoh","re","reg","regg","regs","ren","renj","renh","red","rel","relg","relm","relb","rels","relt","relp","relh","rem","reb","rebs","res","ress","reng","rej","rec","rek","ret","rep","reh","ryeo","ryeog","ryeogg","ryeogs","ryeon","ryeonj","ryeonh","ryeod","ryeol","ryeolg","ryeolm","ryeolb","ryeols","ryeolt","ryeolp","ryeolh","ryeom","ryeob","ryeobs","ryeos","ryeoss","ryeong","ryeoj","ryeoc","ryeok","ryeot","ryeop","ryeoh","rye","ryeg","ryegg","ryegs","ryen","ryenj","ryenh","ryed","ryel","ryelg","ryelm","ryelb","ryels","ryelt","ryelp","ryelh","ryem","ryeb","ryebs","ryes","ryess","ryeng","ryej","ryec","ryek","ryet","ryep","ryeh","ro","rog","rogg","rogs","ron","ronj","ronh","rod","rol","rolg","rolm","rolb","rols","rolt","rolp","rolh","rom","rob","robs","ros","ross","rong","roj","roc","rok","rot","rop","roh","rwa","rwag","rwagg","rwags","rwan","rwanj","rwanh","rwad","rwal","rwalg","rwalm","rwalb","rwals","rwalt","rwalp","rwalh","rwam","rwab","rwabs","rwas","rwass","rwang","rwaj","rwac","rwak","rwat","rwap","rwah","rwae","rwaeg","rwaegg","rwaegs","rwaen","rwaenj","rwaenh","rwaed","rwael","rwaelg","rwaelm","rwaelb","rwaels","rwaelt","rwaelp","rwaelh","rwaem","rwaeb","rwaebs","rwaes","rwaess","rwaeng","rwaej","rwaec","rwaek","rwaet","rwaep","rwaeh","roe","roeg","roegg","roegs","roen","roenj","roenh","roed","roel","roelg","roelm","roelb","roels","roelt","roelp","roelh","roem","roeb","roebs","roes","roess","roeng","roej","roec","roek","roet","roep","roeh","ryo","ryog","ryogg","ryogs","ryon","ryonj","ryonh","ryod","ryol","ryolg","ryolm","ryolb","ryols","ryolt","ryolp","ryolh","ryom","ryob","ryobs","ryos","ryoss","ryong","ryoj","ryoc","ryok","ryot","ryop","ryoh","ru","rug","rugg","rugs","run","runj","runh","rud","rul","rulg","rulm","rulb","ruls","rult","rulp","rulh","rum","rub","rubs","rus","russ","rung","ruj","ruc"],
  "185": ["ruk","rut","rup","ruh","rweo","rweog","rweogg","rweogs","rweon","rweonj","rweonh","rweod","rweol","rweolg","rweolm","rweolb","rweols","rweolt","rweolp","rweolh","rweom","rweob","rweobs","rweos","rweoss","rweong","rweoj","rweoc","rweok","rweot","rweop","rweoh","rwe","rweg","rwegg","rwegs","rwen","rwenj","rwenh","rwed","rwel","rwelg","rwelm","rwelb","rwels","rwelt","rwelp","rwelh","rwem","rweb","rwebs","rwes","rwess","rweng","rwej","rwec","rwek","rwet","rwep","rweh","rwi","rwig","rwigg","rwigs","rwin","rwinj","rwinh","rwid","rwil","rwilg","rwilm","rwilb","rwils","rwilt","rwilp","rwilh","rwim","rwib","rwibs","rwis","rwiss","rwing","rwij","rwic","rwik","rwit","rwip","rwih","ryu","ryug","ryugg","ryugs","ryun","ryunj","ryunh","ryud","ryul","ryulg","ryulm","ryulb","ryuls","ryult","ryulp","ryulh","ryum","ryub","ryubs","ryus","ryuss","ryung","ryuj","ryuc","ryuk","ryut","ryup","ryuh","reu","reug","reugg","reugs","reun","reunj","reunh","reud","reul","reulg","reulm","reulb","reuls","reult","reulp","reulh","reum","reub","reubs","reus","reuss","reung","reuj","reuc","reuk","reut","reup","reuh","ryi","ryig","ryigg","ryigs","ryin","ryinj","ryinh","ryid","ryil","ryilg","ryilm","ryilb","ryils","ryilt","ryilp","ryilh","ryim","ryib","ryibs","ryis","ryiss","rying","ryij","ryic","ryik","ryit","ryip","ryih","ri","rig","rigg","rigs","rin","rinj","rinh","rid","ril","rilg","rilm","rilb","rils","rilt","rilp","rilh","rim","rib","ribs","ris","riss","ring","rij","ric","rik","rit","rip","rih","ma","mag","magg","mags","man","manj","manh","mad","mal","malg","malm","malb","mals","malt","malp","malh","mam","mab","mabs","mas","mass","mang","maj","mac","mak","mat","map","mah","mae","maeg","maegg","maegs","maen","maenj","maenh","maed","mael","maelg","maelm","maelb","maels","maelt","maelp","maelh","maem","maeb","maebs","maes","maess","maeng","maej","maec","maek","maet","maep","maeh"],
  "186": ["mya","myag","myagg","myags","myan","myanj","myanh","myad","myal","myalg","myalm","myalb","myals","myalt","myalp","myalh","myam","myab","myabs","myas","myass","myang","myaj","myac","myak","myat","myap","myah","myae","myaeg","myaegg","myaegs","myaen","myaenj","myaenh","myaed","myael","myaelg","myaelm","myaelb","myaels","myaelt","myaelp","myaelh","myaem","myaeb","myaebs","myaes","myaess","myaeng","myaej","myaec","myaek","myaet","myaep","myaeh","meo","meog","meogg","meogs","meon","meonj","meonh","meod","meol","meolg","meolm","meolb","meols","meolt","meolp","meolh","meom","meob","meobs","meos","meoss","meong","meoj","meoc","meok","meot","meop","meoh","me","meg","megg","megs","men","menj","menh","med","mel","melg","melm","melb","mels","melt","melp","melh","mem","meb","mebs","mes","mess","meng","mej","mec","mek","met","mep","meh","myeo","myeog","myeogg","myeogs","myeon","myeonj","myeonh","myeod","myeol","myeolg","myeolm","myeolb","myeols","myeolt","myeolp","myeolh","myeom","myeob","myeobs","myeos","myeoss","myeong","myeoj","myeoc","myeok","myeot","myeop","myeoh","mye","myeg","myegg","myegs","myen","myenj","myenh","myed","myel","myelg","myelm","myelb","myels","myelt","myelp","myelh","myem","myeb","myebs","myes","myess","myeng","myej","myec","myek","myet","myep","myeh","mo","mog","mogg","mogs","mon","monj","monh","mod","mol","molg","molm","molb","mols","molt","molp","molh","mom","mob","mobs","mos","moss","mong","moj","moc","mok","mot","mop","moh","mwa","mwag","mwagg","mwags","mwan","mwanj","mwanh","mwad","mwal","mwalg","mwalm","mwalb","mwals","mwalt","mwalp","mwalh","mwam","mwab","mwabs","mwas","mwass","mwang","mwaj","mwac","mwak","mwat","mwap","mwah","mwae","mwaeg","mwaegg","mwaegs","mwaen","mwaenj","mwaenh","mwaed","mwael","mwaelg","mwaelm","mwaelb","mwaels","mwaelt","mwaelp","mwaelh","mwaem","mwaeb","mwaebs","mwaes","mwaess","mwaeng","mwaej","mwaec","mwaek","mwaet","mwaep","mwaeh","moe","moeg","moegg","moegs"],
  "187": ["moen","moenj","moenh","moed","moel","moelg","moelm","moelb","moels","moelt","moelp","moelh","moem","moeb","moebs","moes","moess","moeng","moej","moec","moek","moet","moep","moeh","myo","myog","myogg","myogs","myon","myonj","myonh","myod","myol","myolg","myolm","myolb","myols","myolt","myolp","myolh","myom","myob","myobs","myos","myoss","myong","myoj","myoc","myok","myot","myop","myoh","mu","mug","mugg","mugs","mun","munj","munh","mud","mul","mulg","mulm","mulb","muls","mult","mulp","mulh","mum","mub","mubs","mus","muss","mung","muj","muc","muk","mut","mup","muh","mweo","mweog","mweogg","mweogs","mweon","mweonj","mweonh","mweod","mweol","mweolg","mweolm","mweolb","mweols","mweolt","mweolp","mweolh","mweom","mweob","mweobs","mweos","mweoss","mweong","mweoj","mweoc","mweok","mweot","mweop","mweoh","mwe","mweg","mwegg","mwegs","mwen","mwenj","mwenh","mwed","mwel","mwelg","mwelm","mwelb","mwels","mwelt","mwelp","mwelh","mwem","mweb","mwebs","mwes","mwess","mweng","mwej","mwec","mwek","mwet","mwep","mweh","mwi","mwig","mwigg","mwigs","mwin","mwinj","mwinh","mwid","mwil","mwilg","mwilm","mwilb","mwils","mwilt","mwilp","mwilh","mwim","mwib","mwibs","mwis","mwiss","mwing","mwij","mwic","mwik","mwit","mwip","mwih","myu","myug","myugg","myugs","myun","myunj","myunh","myud","myul","myulg","myulm","myulb","myuls","myult","myulp","myulh","myum","myub","myubs","myus","myuss","myung","myuj","myuc","myuk","myut","myup","myuh","meu","meug","meugg","meugs","meun","meunj","meunh","meud","meul","meulg","meulm","meulb","meuls","meult","meulp","meulh","meum","meub","meubs","meus","meuss","meung","meuj","meuc","meuk","meut","meup","meuh","myi","myig","myigg","myigs","myin","myinj","myinh","myid","myil","myilg","myilm","myilb","myils","myilt","myilp","myilh","myim","myib","myibs","myis","myiss","mying","myij","myic","myik","myit","myip","myih","mi","mig","migg","migs","min","minj","minh","mid"],
  "188": ["mil","milg","milm","milb","mils","milt","milp","milh","mim","mib","mibs","mis","miss","ming","mij","mic","mik","mit","mip","mih","ba","bag","bagg","bags","ban","banj","banh","bad","bal","balg","balm","balb","bals","balt","balp","balh","bam","bab","babs","bas","bass","bang","baj","bac","bak","bat","bap","bah","bae","baeg","baegg","baegs","baen","baenj","baenh","baed","bael","baelg","baelm","baelb","baels","baelt","baelp","baelh","baem","baeb","baebs","baes","baess","baeng","baej","baec","baek","baet","baep","baeh","bya","byag","byagg","byags","byan","byanj","byanh","byad","byal","byalg","byalm","byalb","byals","byalt","byalp","byalh","byam","byab","byabs","byas","byass","byang","byaj","byac","byak","byat","byap","byah","byae","byaeg","byaegg","byaegs","byaen","byaenj","byaenh","byaed","byael","byaelg","byaelm","byaelb","byaels","byaelt","byaelp","byaelh","byaem","byaeb","byaebs","byaes","byaess","byaeng","byaej","byaec","byaek","byaet","byaep","byaeh","beo","beog","beogg","beogs","beon","beonj","beonh","beod","beol","beolg","beolm","beolb","beols","beolt","beolp","beolh","beom","beob","beobs","beos","beoss","beong","beoj","beoc","beok","beot","beop","beoh","be","beg","begg","begs","ben","benj","benh","bed","bel","belg","belm","belb","bels","belt","belp","belh","bem","beb","bebs","bes","bess","beng","bej","bec","bek","bet","bep","beh","byeo","byeog","byeogg","byeogs","byeon","byeonj","byeonh","byeod","byeol","byeolg","byeolm","byeolb","byeols","byeolt","byeolp","byeolh","byeom","byeob","byeobs","byeos","byeoss","byeong","byeoj","byeoc","byeok","byeot","byeop","byeoh","bye","byeg","byegg","byegs","byen","byenj","byenh","byed","byel","byelg","byelm","byelb","byels","byelt","byelp","byelh","byem","byeb","byebs","byes","byess","byeng","byej","byec","byek","byet","byep","byeh","bo","bog","bogg","bogs","bon","bonj","bonh","bod","bol","bolg","bolm","bolb"],
  "189": ["bols","bolt","bolp","bolh","bom","bob","bobs","bos","boss","bong","boj","boc","bok","bot","bop","boh","bwa","bwag","bwagg","bwags","bwan","bwanj","bwanh","bwad","bwal","bwalg","bwalm","bwalb","bwals","bwalt","bwalp","bwalh","bwam","bwab","bwabs","bwas","bwass","bwang","bwaj","bwac","bwak","bwat","bwap","bwah","bwae","bwaeg","bwaegg","bwaegs","bwaen","bwaenj","bwaenh","bwaed","bwael","bwaelg","bwaelm","bwaelb","bwaels","bwaelt","bwaelp","bwaelh","bwaem","bwaeb","bwaebs","bwaes","bwaess","bwaeng","bwaej","bwaec","bwaek","bwaet","bwaep","bwaeh","boe","boeg","boegg","boegs","boen","boenj","boenh","boed","boel","boelg","boelm","boelb","boels","boelt","boelp","boelh","boem","boeb","boebs","boes","boess","boeng","boej","boec","boek","boet","boep","boeh","byo","byog","byogg","byogs","byon","byonj","byonh","byod","byol","byolg","byolm","byolb","byols","byolt","byolp","byolh","byom","byob","byobs","byos","byoss","byong","byoj","byoc","byok","byot","byop","byoh","bu","bug","bugg","bugs","bun","bunj","bunh","bud","bul","bulg","bulm","bulb","buls","bult","bulp","bulh","bum","bub","bubs","bus","buss","bung","buj","buc","buk","but","bup","buh","bweo","bweog","bweogg","bweogs","bweon","bweonj","bweonh","bweod","bweol","bweolg","bweolm","bweolb","bweols","bweolt","bweolp","bweolh","bweom","bweob","bweobs","bweos","bweoss","bweong","bweoj","bweoc","bweok","bweot","bweop","bweoh","bwe","bweg","bwegg","bwegs","bwen","bwenj","bwenh","bwed","bwel","bwelg","bwelm","bwelb","bwels","bwelt","bwelp","bwelh","bwem","bweb","bwebs","bwes","bwess","bweng","bwej","bwec","bwek","bwet","bwep","bweh","bwi","bwig","bwigg","bwigs","bwin","bwinj","bwinh","bwid","bwil","bwilg","bwilm","bwilb","bwils","bwilt","bwilp","bwilh","bwim","bwib","bwibs","bwis","bwiss","bwing","bwij","bwic","bwik","bwit","bwip","bwih","byu","byug","byugg","byugs","byun","byunj","byunh","byud","byul","byulg","byulm","byulb","byuls","byult","byulp","byulh"],
  "190": ["byum","byub","byubs","byus","byuss","byung","byuj","byuc","byuk","byut","byup","byuh","beu","beug","beugg","beugs","beun","beunj","beunh","beud","beul","beulg","beulm","beulb","beuls","beult","beulp","beulh","beum","beub","beubs","beus","beuss","beung","beuj","beuc","beuk","beut","beup","beuh","byi","byig","byigg","byigs","byin","byinj","byinh","byid","byil","byilg","byilm","byilb","byils","byilt","byilp","byilh","byim","byib","byibs","byis","byiss","bying","byij","byic","byik","byit","byip","byih","bi","big","bigg","bigs","bin","binj","binh","bid","bil","bilg","bilm","bilb","bils","bilt","bilp","bilh","bim","bib","bibs","bis","biss","bing","bij","bic","bik","bit","bip","bih","bba","bbag","bbagg","bbags","bban","bbanj","bbanh","bbad","bbal","bbalg","bbalm","bbalb","bbals","bbalt","bbalp","bbalh","bbam","bbab","bbabs","bbas","bbass","bbang","bbaj","bbac","bbak","bbat","bbap","bbah","bbae","bbaeg","bbaegg","bbaegs","bbaen","bbaenj","bbaenh","bbaed","bbael","bbaelg","bbaelm","bbaelb","bbaels","bbaelt","bbaelp","bbaelh","bbaem","bbaeb","bbaebs","bbaes","bbaess","bbaeng","bbaej","bbaec","bbaek","bbaet","bbaep","bbaeh","bbya","bbyag","bbyagg","bbyags","bbyan","bbyanj","bbyanh","bbyad","bbyal","bbyalg","bbyalm","bbyalb","bbyals","bbyalt","bbyalp","bbyalh","bbyam","bbyab","bbyabs","bbyas","bbyass","bbyang","bbyaj","bbyac","bbyak","bbyat","bbyap","bbyah","bbyae","bbyaeg","bbyaegg","bbyaegs","bbyaen","bbyaenj","bbyaenh","bbyaed","bbyael","bbyaelg","bbyaelm","bbyaelb","bbyaels","bbyaelt","bbyaelp","bbyaelh","bbyaem","bbyaeb","bbyaebs","bbyaes","bbyaess","bbyaeng","bbyaej","bbyaec","bbyaek","bbyaet","bbyaep","bbyaeh","bbeo","bbeog","bbeogg","bbeogs","bbeon","bbeonj","bbeonh","bbeod","bbeol","bbeolg","bbeolm","bbeolb","bbeols","bbeolt","bbeolp","bbeolh","bbeom","bbeob","bbeobs","bbeos","bbeoss","bbeong","bbeoj","bbeoc","bbeok","bbeot","bbeop","bbeoh","bbe","bbeg","bbegg","bbegs","bben","bbenj","bbenh","bbed","bbel","bbelg","bbelm","bbelb","bbels","bbelt","bbelp","bbelh","bbem","bbeb","bbebs","bbes"],
  "191": ["bbess","bbeng","bbej","bbec","bbek","bbet","bbep","bbeh","bbyeo","bbyeog","bbyeogg","bbyeogs","bbyeon","bbyeonj","bbyeonh","bbyeod","bbyeol","bbyeolg","bbyeolm","bbyeolb","bbyeols","bbyeolt","bbyeolp","bbyeolh","bbyeom","bbyeob","bbyeobs","bbyeos","bbyeoss","bbyeong","bbyeoj","bbyeoc","bbyeok","bbyeot","bbyeop","bbyeoh","bbye","bbyeg","bbyegg","bbyegs","bbyen","bbyenj","bbyenh","bbyed","bbyel","bbyelg","bbyelm","bbyelb","bbyels","bbyelt","bbyelp","bbyelh","bbyem","bbyeb","bbyebs","bbyes","bbyess","bbyeng","bbyej","bbyec","bbyek","bbyet","bbyep","bbyeh","bbo","bbog","bbogg","bbogs","bbon","bbonj","bbonh","bbod","bbol","bbolg","bbolm","bbolb","bbols","bbolt","bbolp","bbolh","bbom","bbob","bbobs","bbos","bboss","bbong","bboj","bboc","bbok","bbot","bbop","bboh","bbwa","bbwag","bbwagg","bbwags","bbwan","bbwanj","bbwanh","bbwad","bbwal","bbwalg","bbwalm","bbwalb","bbwals","bbwalt","bbwalp","bbwalh","bbwam","bbwab","bbwabs","bbwas","bbwass","bbwang","bbwaj","bbwac","bbwak","bbwat","bbwap","bbwah","bbwae","bbwaeg","bbwaegg","bbwaegs","bbwaen","bbwaenj","bbwaenh","bbwaed","bbwael","bbwaelg","bbwaelm","bbwaelb","bbwaels","bbwaelt","bbwaelp","bbwaelh","bbwaem","bbwaeb","bbwaebs","bbwaes","bbwaess","bbwaeng","bbwaej","bbwaec","bbwaek","bbwaet","bbwaep","bbwaeh","bboe","bboeg","bboegg","bboegs","bboen","bboenj","bboenh","bboed","bboel","bboelg","bboelm","bboelb","bboels","bboelt","bboelp","bboelh","bboem","bboeb","bboebs","bboes","bboess","bboeng","bboej","bboec","bboek","bboet","bboep","bboeh","bbyo","bbyog","bbyogg","bbyogs","bbyon","bbyonj","bbyonh","bbyod","bbyol","bbyolg","bbyolm","bbyolb","bbyols","bbyolt","bbyolp","bbyolh","bbyom","bbyob","bbyobs","bbyos","bbyoss","bbyong","bbyoj","bbyoc","bbyok","bbyot","bbyop","bbyoh","bbu","bbug","bbugg","bbugs","bbun","bbunj","bbunh","bbud","bbul","bbulg","bbulm","bbulb","bbuls","bbult","bbulp","bbulh","bbum","bbub","bbubs","bbus","bbuss","bbung","bbuj","bbuc","bbuk","bbut","bbup","bbuh","bbweo","bbweog","bbweogg","bbweogs","bbweon","bbweonj","bbweonh","bbweod","bbweol","bbweolg","bbweolm","bbweolb","bbweols","bbweolt","bbweolp","bbweolh","bbweom","bbweob","bbweobs","bbweos","bbweoss","bbweong","bbweoj","bbweoc"],
  "192": ["bbweok","bbweot","bbweop","bbweoh","bbwe","bbweg","bbwegg","bbwegs","bbwen","bbwenj","bbwenh","bbwed","bbwel","bbwelg","bbwelm","bbwelb","bbwels","bbwelt","bbwelp","bbwelh","bbwem","bbweb","bbwebs","bbwes","bbwess","bbweng","bbwej","bbwec","bbwek","bbwet","bbwep","bbweh","bbwi","bbwig","bbwigg","bbwigs","bbwin","bbwinj","bbwinh","bbwid","bbwil","bbwilg","bbwilm","bbwilb","bbwils","bbwilt","bbwilp","bbwilh","bbwim","bbwib","bbwibs","bbwis","bbwiss","bbwing","bbwij","bbwic","bbwik","bbwit","bbwip","bbwih","bbyu","bbyug","bbyugg","bbyugs","bbyun","bbyunj","bbyunh","bbyud","bbyul","bbyulg","bbyulm","bbyulb","bbyuls","bbyult","bbyulp","bbyulh","bbyum","bbyub","bbyubs","bbyus","bbyuss","bbyung","bbyuj","bbyuc","bbyuk","bbyut","bbyup","bbyuh","bbeu","bbeug","bbeugg","bbeugs","bbeun","bbeunj","bbeunh","bbeud","bbeul","bbeulg","bbeulm","bbeulb","bbeuls","bbeult","bbeulp","bbeulh","bbeum","bbeub","bbeubs","bbeus","bbeuss","bbeung","bbeuj","bbeuc","bbeuk","bbeut","bbeup","bbeuh","bbyi","bbyig","bbyigg","bbyigs","bbyin","bbyinj","bbyinh","bbyid","bbyil","bbyilg","bbyilm","bbyilb","bbyils","bbyilt","bbyilp","bbyilh","bbyim","bbyib","bbyibs","bbyis","bbyiss","bbying","bbyij","bbyic","bbyik","bbyit","bbyip","bbyih","bbi","bbig","bbigg","bbigs","bbin","bbinj","bbinh","bbid","bbil","bbilg","bbilm","bbilb","bbils","bbilt","bbilp","bbilh","bbim","bbib","bbibs","bbis","bbiss","bbing","bbij","bbic","bbik","bbit","bbip","bbih","sa","sag","sagg","sags","san","sanj","sanh","sad","sal","salg","salm","salb","sals","salt","salp","salh","sam","sab","sabs","sas","sass","sang","saj","sac","sak","sat","sap","sah","sae","saeg","saegg","saegs","saen","saenj","saenh","saed","sael","saelg","saelm","saelb","saels","saelt","saelp","saelh","saem","saeb","saebs","saes","saess","saeng","saej","saec","saek","saet","saep","saeh","sya","syag","syagg","syags","syan","syanj","syanh","syad","syal","syalg","syalm","syalb","syals","syalt","syalp","syalh","syam","syab","syabs","syas","syass","syang","syaj","syac","syak","syat","syap","syah"],
  "193": ["syae","syaeg","syaegg","syaegs","syaen","syaenj","syaenh","syaed","syael","syaelg","syaelm","syaelb","syaels","syaelt","syaelp","syaelh","syaem","syaeb","syaebs","syaes","syaess","syaeng","syaej","syaec","syaek","syaet","syaep","syaeh","seo","seog","seogg","seogs","seon","seonj","seonh","seod","seol","seolg","seolm","seolb","seols","seolt","seolp","seolh","seom","seob","seobs","seos","seoss","seong","seoj","seoc","seok","seot","seop","seoh","se","seg","segg","segs","sen","senj","senh","sed","sel","selg","selm","selb","sels","selt","selp","selh","sem","seb","sebs","ses","sess","seng","sej","sec","sek","set","sep","seh","syeo","syeog","syeogg","syeogs","syeon","syeonj","syeonh","syeod","syeol","syeolg","syeolm","syeolb","syeols","syeolt","syeolp","syeolh","syeom","syeob","syeobs","syeos","syeoss","syeong","syeoj","syeoc","syeok","syeot","syeop","syeoh","sye","syeg","syegg","syegs","syen","syenj","syenh","syed","syel","syelg","syelm","syelb","syels","syelt","syelp","syelh","syem","syeb","syebs","syes","syess","syeng","syej","syec","syek","syet","syep","syeh","so","sog","sogg","sogs","son","sonj","sonh","sod","sol","solg","solm","solb","sols","solt","solp","solh","som","sob","sobs","sos","soss","song","soj","soc","sok","sot","sop","soh","swa","swag","swagg","swags","swan","swanj","swanh","swad","swal","swalg","swalm","swalb","swals","swalt","swalp","swalh","swam","swab","swabs","swas","swass","swang","swaj","swac","swak","swat","swap","swah","swae","swaeg","swaegg","swaegs","swaen","swaenj","swaenh","swaed","swael","swaelg","swaelm","swaelb","swaels","swaelt","swaelp","swaelh","swaem","swaeb","swaebs","swaes","swaess","swaeng","swaej","swaec","swaek","swaet","swaep","swaeh","soe","soeg","soegg","soegs","soen","soenj","soenh","soed","soel","soelg","soelm","soelb","soels","soelt","soelp","soelh","soem","soeb","soebs","soes","soess","soeng","soej","soec","soek","soet","soep","soeh","syo","syog","syogg","syogs"],
  "194": ["syon","syonj","syonh","syod","syol","syolg","syolm","syolb","syols","syolt","syolp","syolh","syom","syob","syobs","syos","syoss","syong","syoj","syoc","syok","syot","syop","syoh","su","sug","sugg","sugs","sun","sunj","sunh","sud","sul","sulg","sulm","sulb","suls","sult","sulp","sulh","sum","sub","subs","sus","suss","sung","suj","suc","suk","sut","sup","suh","sweo","sweog","sweogg","sweogs","sweon","sweonj","sweonh","sweod","sweol","sweolg","sweolm","sweolb","sweols","sweolt","sweolp","sweolh","sweom","sweob","sweobs","sweos","sweoss","sweong","sweoj","sweoc","sweok","sweot","sweop","sweoh","swe","sweg","swegg","swegs","swen","swenj","swenh","swed","swel","swelg","swelm","swelb","swels","swelt","swelp","swelh","swem","sweb","swebs","swes","swess","sweng","swej","swec","swek","swet","swep","sweh","swi","swig","swigg","swigs","swin","swinj","swinh","swid","swil","swilg","swilm","swilb","swils","swilt","swilp","swilh","swim","swib","swibs","swis","swiss","swing","swij","swic","swik","swit","swip","swih","syu","syug","syugg","syugs","syun","syunj","syunh","syud","syul","syulg","syulm","syulb","syuls","syult","syulp","syulh","syum","syub","syubs","syus","syuss","syung","syuj","syuc","syuk","syut","syup","syuh","seu","seug","seugg","seugs","seun","seunj","seunh","seud","seul","seulg","seulm","seulb","seuls","seult","seulp","seulh","seum","seub","seubs","seus","seuss","seung","seuj","seuc","seuk","seut","seup","seuh","syi","syig","syigg","syigs","syin","syinj","syinh","syid","syil","syilg","syilm","syilb","syils","syilt","syilp","syilh","syim","syib","syibs","syis","syiss","sying","syij","syic","syik","syit","syip","syih","si","sig","sigg","sigs","sin","sinj","sinh","sid","sil","silg","silm","silb","sils","silt","silp","silh","sim","sib","sibs","sis","siss","sing","sij","sic","sik","sit","sip","sih","ssa","ssag","ssagg","ssags","ssan","ssanj","ssanh","ssad"],
  "195": ["ssal","ssalg","ssalm","ssalb","ssals","ssalt","ssalp","ssalh","ssam","ssab","ssabs","ssas","ssass","ssang","ssaj","ssac","ssak","ssat","ssap","ssah","ssae","ssaeg","ssaegg","ssaegs","ssaen","ssaenj","ssaenh","ssaed","ssael","ssaelg","ssaelm","ssaelb","ssaels","ssaelt","ssaelp","ssaelh","ssaem","ssaeb","ssaebs","ssaes","ssaess","ssaeng","ssaej","ssaec","ssaek","ssaet","ssaep","ssaeh","ssya","ssyag","ssyagg","ssyags","ssyan","ssyanj","ssyanh","ssyad","ssyal","ssyalg","ssyalm","ssyalb","ssyals","ssyalt","ssyalp","ssyalh","ssyam","ssyab","ssyabs","ssyas","ssyass","ssyang","ssyaj","ssyac","ssyak","ssyat","ssyap","ssyah","ssyae","ssyaeg","ssyaegg","ssyaegs","ssyaen","ssyaenj","ssyaenh","ssyaed","ssyael","ssyaelg","ssyaelm","ssyaelb","ssyaels","ssyaelt","ssyaelp","ssyaelh","ssyaem","ssyaeb","ssyaebs","ssyaes","ssyaess","ssyaeng","ssyaej","ssyaec","ssyaek","ssyaet","ssyaep","ssyaeh","sseo","sseog","sseogg","sseogs","sseon","sseonj","sseonh","sseod","sseol","sseolg","sseolm","sseolb","sseols","sseolt","sseolp","sseolh","sseom","sseob","sseobs","sseos","sseoss","sseong","sseoj","sseoc","sseok","sseot","sseop","sseoh","sse","sseg","ssegg","ssegs","ssen","ssenj","ssenh","ssed","ssel","sselg","sselm","sselb","ssels","sselt","sselp","sselh","ssem","sseb","ssebs","sses","ssess","sseng","ssej","ssec","ssek","sset","ssep","sseh","ssyeo","ssyeog","ssyeogg","ssyeogs","ssyeon","ssyeonj","ssyeonh","ssyeod","ssyeol","ssyeolg","ssyeolm","ssyeolb","ssyeols","ssyeolt","ssyeolp","ssyeolh","ssyeom","ssyeob","ssyeobs","ssyeos","ssyeoss","ssyeong","ssyeoj","ssyeoc","ssyeok","ssyeot","ssyeop","ssyeoh","ssye","ssyeg","ssyegg","ssyegs","ssyen","ssyenj","ssyenh","ssyed","ssyel","ssyelg","ssyelm","ssyelb","ssyels","ssyelt","ssyelp","ssyelh","ssyem","ssyeb","ssyebs","ssyes","ssyess","ssyeng","ssyej","ssyec","ssyek","ssyet","ssyep","ssyeh","sso","ssog","ssogg","ssogs","sson","ssonj","ssonh","ssod","ssol","ssolg","ssolm","ssolb","ssols","ssolt","ssolp","ssolh","ssom","ssob","ssobs","ssos","ssoss","ssong","ssoj","ssoc","ssok","ssot","ssop","ssoh","sswa","sswag","sswagg","sswags","sswan","sswanj","sswanh","sswad","sswal","sswalg","sswalm","sswalb"],
  "196": ["sswals","sswalt","sswalp","sswalh","sswam","sswab","sswabs","sswas","sswass","sswang","sswaj","sswac","sswak","sswat","sswap","sswah","sswae","sswaeg","sswaegg","sswaegs","sswaen","sswaenj","sswaenh","sswaed","sswael","sswaelg","sswaelm","sswaelb","sswaels","sswaelt","sswaelp","sswaelh","sswaem","sswaeb","sswaebs","sswaes","sswaess","sswaeng","sswaej","sswaec","sswaek","sswaet","sswaep","sswaeh","ssoe","ssoeg","ssoegg","ssoegs","ssoen","ssoenj","ssoenh","ssoed","ssoel","ssoelg","ssoelm","ssoelb","ssoels","ssoelt","ssoelp","ssoelh","ssoem","ssoeb","ssoebs","ssoes","ssoess","ssoeng","ssoej","ssoec","ssoek","ssoet","ssoep","ssoeh","ssyo","ssyog","ssyogg","ssyogs","ssyon","ssyonj","ssyonh","ssyod","ssyol","ssyolg","ssyolm","ssyolb","ssyols","ssyolt","ssyolp","ssyolh","ssyom","ssyob","ssyobs","ssyos","ssyoss","ssyong","ssyoj","ssyoc","ssyok","ssyot","ssyop","ssyoh","ssu","ssug","ssugg","ssugs","ssun","ssunj","ssunh","ssud","ssul","ssulg","ssulm","ssulb","ssuls","ssult","ssulp","ssulh","ssum","ssub","ssubs","ssus","ssuss","ssung","ssuj","ssuc","ssuk","ssut","ssup","ssuh","ssweo","ssweog","ssweogg","ssweogs","ssweon","ssweonj","ssweonh","ssweod","ssweol","ssweolg","ssweolm","ssweolb","ssweols","ssweolt","ssweolp","ssweolh","ssweom","ssweob","ssweobs","ssweos","ssweoss","ssweong","ssweoj","ssweoc","ssweok","ssweot","ssweop","ssweoh","sswe","ssweg","sswegg","sswegs","sswen","sswenj","sswenh","sswed","sswel","sswelg","sswelm","sswelb","sswels","sswelt","sswelp","sswelh","sswem","ssweb","sswebs","sswes","sswess","ssweng","sswej","sswec","sswek","sswet","sswep","ssweh","sswi","sswig","sswigg","sswigs","sswin","sswinj","sswinh","sswid","sswil","sswilg","sswilm","sswilb","sswils","sswilt","sswilp","sswilh","sswim","sswib","sswibs","sswis","sswiss","sswing","sswij","sswic","sswik","sswit","sswip","sswih","ssyu","ssyug","ssyugg","ssyugs","ssyun","ssyunj","ssyunh","ssyud","ssyul","ssyulg","ssyulm","ssyulb","ssyuls","ssyult","ssyulp","ssyulh","ssyum","ssyub","ssyubs","ssyus","ssyuss","ssyung","ssyuj","ssyuc","ssyuk","ssyut","ssyup","ssyuh","sseu","sseug","sseugg","sseugs","sseun","sseunj","sseunh","sseud","sseul","sseulg","sseulm","sseulb","sseuls","sseult","sseulp","sseulh"],
  "197": ["sseum","sseub","sseubs","sseus","sseuss","sseung","sseuj","sseuc","sseuk","sseut","sseup","sseuh","ssyi","ssyig","ssyigg","ssyigs","ssyin","ssyinj","ssyinh","ssyid","ssyil","ssyilg","ssyilm","ssyilb","ssyils","ssyilt","ssyilp","ssyilh","ssyim","ssyib","ssyibs","ssyis","ssyiss","ssying","ssyij","ssyic","ssyik","ssyit","ssyip","ssyih","ssi","ssig","ssigg","ssigs","ssin","ssinj","ssinh","ssid","ssil","ssilg","ssilm","ssilb","ssils","ssilt","ssilp","ssilh","ssim","ssib","ssibs","ssis","ssiss","ssing","ssij","ssic","ssik","ssit","ssip","ssih","a","ag","agg","ags","an","anj","anh","ad","al","alg","alm","alb","als","alt","alp","alh","am","ab","abs","as","ass","ang","aj","ac","ak","at","ap","ah","ae","aeg","aegg","aegs","aen","aenj","aenh","aed","ael","aelg","aelm","aelb","aels","aelt","aelp","aelh","aem","aeb","aebs","aes","aess","aeng","aej","aec","aek","aet","aep","aeh","ya","yag","yagg","yags","yan","yanj","yanh","yad","yal","yalg","yalm","yalb","yals","yalt","yalp","yalh","yam","yab","yabs","yas","yass","yang","yaj","yac","yak","yat","yap","yah","yae","yaeg","yaegg","yaegs","yaen","yaenj","yaenh","yaed","yael","yaelg","yaelm","yaelb","yaels","yaelt","yaelp","yaelh","yaem","yaeb","yaebs","yaes","yaess","yaeng","yaej","yaec","yaek","yaet","yaep","yaeh","eo","eog","eogg","eogs","eon","eonj","eonh","eod","eol","eolg","eolm","eolb","eols","eolt","eolp","eolh","eom","eob","eobs","eos","eoss","eong","eoj","eoc","eok","eot","eop","eoh","e","eg","egg","egs","en","enj","enh","ed","el","elg","elm","elb","els","elt","elp","elh","em","eb","ebs","es","ess","eng","ej","ec","ek","et","ep","eh","yeo","yeog","yeogg","yeogs","yeon","yeonj","yeonh","yeod","yeol","yeolg","yeolm","yeolb","yeols","yeolt","yeolp","yeolh","yeom","yeob","yeobs","yeos"],
  "198": ["yeoss","yeong","yeoj","yeoc","yeok","yeot","yeop","yeoh","ye","yeg","yegg","yegs","yen","yenj","yenh","yed","yel","yelg","yelm","yelb","yels","yelt","yelp","yelh","yem","yeb","yebs","yes","yess","yeng","yej","yec","yek","yet","yep","yeh","o","og","ogg","ogs","on","onj","onh","od","ol","olg","olm","olb","ols","olt","olp","olh","om","ob","obs","os","oss","ong","oj","oc","ok","ot","op","oh","wa","wag","wagg","wags","wan","wanj","wanh","wad","wal","walg","walm","walb","wals","walt","walp","walh","wam","wab","wabs","was","wass","wang","waj","wac","wak","wat","wap","wah","wae","waeg","waegg","waegs","waen","waenj","waenh","waed","wael","waelg","waelm","waelb","waels","waelt","waelp","waelh","waem","waeb","waebs","waes","waess","waeng","waej","waec","waek","waet","waep","waeh","oe","oeg","oegg","oegs","oen","oenj","oenh","oed","oel","oelg","oelm","oelb","oels","oelt","oelp","oelh","oem","oeb","oebs","oes","oess","oeng","oej","oec","oek","oet","oep","oeh","yo","yog","yogg","yogs","yon","yonj","yonh","yod","yol","yolg","yolm","yolb","yols","yolt","yolp","yolh","yom","yob","yobs","yos","yoss","yong","yoj","yoc","yok","yot","yop","yoh","u","ug","ugg","ugs","un","unj","unh","ud","ul","ulg","ulm","ulb","uls","ult","ulp","ulh","um","ub","ubs","us","uss","ung","uj","uc","uk","ut","up","uh","weo","weog","weogg","weogs","weon","weonj","weonh","weod","weol","weolg","weolm","weolb","weols","weolt","weolp","weolh","weom","weob","weobs","weos","weoss","weong","weoj","weoc","weok","weot","weop","weoh","we","weg","wegg","wegs","wen","wenj","wenh","wed","wel","welg","welm","welb","wels","welt","welp","welh","wem","web","webs","wes","wess","weng","wej","wec"],
  "199": ["wek","wet","wep","weh","wi","wig","wigg","wigs","win","winj","winh","wid","wil","wilg","wilm","wilb","wils","wilt","wilp","wilh","wim","wib","wibs","wis","wiss","wing","wij","wic","wik","wit","wip","wih","yu","yug","yugg","yugs","yun","yunj","yunh","yud","yul","yulg","yulm","yulb","yuls","yult","yulp","yulh","yum","yub","yubs","yus","yuss","yung","yuj","yuc","yuk","yut","yup","yuh","eu","eug","eugg","eugs","eun","eunj","eunh","eud","eul","eulg","eulm","eulb","euls","eult","eulp","eulh","eum","eub","eubs","eus","euss","eung","euj","euc","euk","eut","eup","euh","yi","yig","yigg","yigs","yin","yinj","yinh","yid","yil","yilg","yilm","yilb","yils","yilt","yilp","yilh","yim","yib","yibs","yis","yiss","ying","yij","yic","yik","yit","yip","yih","i","ig","igg","igs","in","inj","inh","id","il","ilg","ilm","ilb","ils","ilt","ilp","ilh","im","ib","ibs","is","iss","ing","ij","ic","ik","it","ip","ih","ja","jag","jagg","jags","jan","janj","janh","jad","jal","jalg","jalm","jalb","jals","jalt","jalp","jalh","jam","jab","jabs","jas","jass","jang","jaj","jac","jak","jat","jap","jah","jae","jaeg","jaegg","jaegs","jaen","jaenj","jaenh","jaed","jael","jaelg","jaelm","jaelb","jaels","jaelt","jaelp","jaelh","jaem","jaeb","jaebs","jaes","jaess","jaeng","jaej","jaec","jaek","jaet","jaep","jaeh","jya","jyag","jyagg","jyags","jyan","jyanj","jyanh","jyad","jyal","jyalg","jyalm","jyalb","jyals","jyalt","jyalp","jyalh","jyam","jyab","jyabs","jyas","jyass","jyang","jyaj","jyac","jyak","jyat","jyap","jyah","jyae","jyaeg","jyaegg","jyaegs","jyaen","jyaenj","jyaenh","jyaed","jyael","jyaelg","jyaelm","jyaelb","jyaels","jyaelt","jyaelp","jyaelh","jyaem","jyaeb","jyaebs","jyaes","jyaess","jyaeng","jyaej","jyaec","jyaek","jyaet","jyaep","jyaeh"],
  "200": ["jeo","jeog","jeogg","jeogs","jeon","jeonj","jeonh","jeod","jeol","jeolg","jeolm","jeolb","jeols","jeolt","jeolp","jeolh","jeom","jeob","jeobs","jeos","jeoss","jeong","jeoj","jeoc","jeok","jeot","jeop","jeoh","je","jeg","jegg","jegs","jen","jenj","jenh","jed","jel","jelg","jelm","jelb","jels","jelt","jelp","jelh","jem","jeb","jebs","jes","jess","jeng","jej","jec","jek","jet","jep","jeh","jyeo","jyeog","jyeogg","jyeogs","jyeon","jyeonj","jyeonh","jyeod","jyeol","jyeolg","jyeolm","jyeolb","jyeols","jyeolt","jyeolp","jyeolh","jyeom","jyeob","jyeobs","jyeos","jyeoss","jyeong","jyeoj","jyeoc","jyeok","jyeot","jyeop","jyeoh","jye","jyeg","jyegg","jyegs","jyen","jyenj","jyenh","jyed","jyel","jyelg","jyelm","jyelb","jyels","jyelt","jyelp","jyelh","jyem","jyeb","jyebs","jyes","jyess","jyeng","jyej","jyec","jyek","jyet","jyep","jyeh","jo","jog","jogg","jogs","jon","jonj","jonh","jod","jol","jolg","jolm","jolb","jols","jolt","jolp","jolh","jom","job","jobs","jos","joss","jong","joj","joc","jok","jot","jop","joh","jwa","jwag","jwagg","jwags","jwan","jwanj","jwanh","jwad","jwal","jwalg","jwalm","jwalb","jwals","jwalt","jwalp","jwalh","jwam","jwab","jwabs","jwas","jwass","jwang","jwaj","jwac","jwak","jwat","jwap","jwah","jwae","jwaeg","jwaegg","jwaegs","jwaen","jwaenj","jwaenh","jwaed","jwael","jwaelg","jwaelm","jwaelb","jwaels","jwaelt","jwaelp","jwaelh","jwaem","jwaeb","jwaebs","jwaes","jwaess","jwaeng","jwaej","jwaec","jwaek","jwaet","jwaep","jwaeh","joe","joeg","joegg","joegs","joen","joenj","joenh","joed","joel","joelg","joelm","joelb","joels","joelt","joelp","joelh","joem","joeb","joebs","joes","joess","joeng","joej","joec","joek","joet","joep","joeh","jyo","jyog","jyogg","jyogs","jyon","jyonj","jyonh","jyod","jyol","jyolg","jyolm","jyolb","jyols","jyolt","jyolp","jyolh","jyom","jyob","jyobs","jyos","jyoss","jyong","jyoj","jyoc","jyok","jyot","jyop","jyoh","ju","jug","jugg","jugs"],
  "201": ["jun","junj","junh","jud","jul","julg","julm","julb","juls","jult","julp","julh","jum","jub","jubs","jus","juss","jung","juj","juc","juk","jut","jup","juh","jweo","jweog","jweogg","jweogs","jweon","jweonj","jweonh","jweod","jweol","jweolg","jweolm","jweolb","jweols","jweolt","jweolp","jweolh","jweom","jweob","jweobs","jweos","jweoss","jweong","jweoj","jweoc","jweok","jweot","jweop","jweoh","jwe","jweg","jwegg","jwegs","jwen","jwenj","jwenh","jwed","jwel","jwelg","jwelm","jwelb","jwels","jwelt","jwelp","jwelh","jwem","jweb","jwebs","jwes","jwess","jweng","jwej","jwec","jwek","jwet","jwep","jweh","jwi","jwig","jwigg","jwigs","jwin","jwinj","jwinh","jwid","jwil","jwilg","jwilm","jwilb","jwils","jwilt","jwilp","jwilh","jwim","jwib","jwibs","jwis","jwiss","jwing","jwij","jwic","jwik","jwit","jwip","jwih","jyu","jyug","jyugg","jyugs","jyun","jyunj","jyunh","jyud","jyul","jyulg","jyulm","jyulb","jyuls","jyult","jyulp","jyulh","jyum","jyub","jyubs","jyus","jyuss","jyung","jyuj","jyuc","jyuk","jyut","jyup","jyuh","jeu","jeug","jeugg","jeugs","jeun","jeunj","jeunh","jeud","jeul","jeulg","jeulm","jeulb","jeuls","jeult","jeulp","jeulh","jeum","jeub","jeubs","jeus","jeuss","jeung","jeuj","jeuc","jeuk","jeut","jeup","jeuh","jyi","jyig","jyigg","jyigs","jyin","jyinj","jyinh","jyid","jyil","jyilg","jyilm","jyilb","jyils","jyilt","jyilp","jyilh","jyim","jyib","jyibs","jyis","jyiss","jying","jyij","jyic","jyik","jyit","jyip","jyih","ji","jig","jigg","jigs","jin","jinj","jinh","jid","jil","jilg","jilm","jilb","jils","jilt","jilp","jilh","jim","jib","jibs","jis","jiss","jing","jij","jic","jik","jit","jip","jih","jja","jjag","jjagg","jjags","jjan","jjanj","jjanh","jjad","jjal","jjalg","jjalm","jjalb","jjals","jjalt","jjalp","jjalh","jjam","jjab","jjabs","jjas","jjass","jjang","jjaj","jjac","jjak","jjat","jjap","jjah","jjae","jjaeg","jjaegg","jjaegs","jjaen","jjaenj","jjaenh","jjaed"],
  "202": ["jjael","jjaelg","jjaelm","jjaelb","jjaels","jjaelt","jjaelp","jjaelh","jjaem","jjaeb","jjaebs","jjaes","jjaess","jjaeng","jjaej","jjaec","jjaek","jjaet","jjaep","jjaeh","jjya","jjyag","jjyagg","jjyags","jjyan","jjyanj","jjyanh","jjyad","jjyal","jjyalg","jjyalm","jjyalb","jjyals","jjyalt","jjyalp","jjyalh","jjyam","jjyab","jjyabs","jjyas","jjyass","jjyang","jjyaj","jjyac","jjyak","jjyat","jjyap","jjyah","jjyae","jjyaeg","jjyaegg","jjyaegs","jjyaen","jjyaenj","jjyaenh","jjyaed","jjyael","jjyaelg","jjyaelm","jjyaelb","jjyaels","jjyaelt","jjyaelp","jjyaelh","jjyaem","jjyaeb","jjyaebs","jjyaes","jjyaess","jjyaeng","jjyaej","jjyaec","jjyaek","jjyaet","jjyaep","jjyaeh","jjeo","jjeog","jjeogg","jjeogs","jjeon","jjeonj","jjeonh","jjeod","jjeol","jjeolg","jjeolm","jjeolb","jjeols","jjeolt","jjeolp","jjeolh","jjeom","jjeob","jjeobs","jjeos","jjeoss","jjeong","jjeoj","jjeoc","jjeok","jjeot","jjeop","jjeoh","jje","jjeg","jjegg","jjegs","jjen","jjenj","jjenh","jjed","jjel","jjelg","jjelm","jjelb","jjels","jjelt","jjelp","jjelh","jjem","jjeb","jjebs","jjes","jjess","jjeng","jjej","jjec","jjek","jjet","jjep","jjeh","jjyeo","jjyeog","jjyeogg","jjyeogs","jjyeon","jjyeonj","jjyeonh","jjyeod","jjyeol","jjyeolg","jjyeolm","jjyeolb","jjyeols","jjyeolt","jjyeolp","jjyeolh","jjyeom","jjyeob","jjyeobs","jjyeos","jjyeoss","jjyeong","jjyeoj","jjyeoc","jjyeok","jjyeot","jjyeop","jjyeoh","jjye","jjyeg","jjyegg","jjyegs","jjyen","jjyenj","jjyenh","jjyed","jjyel","jjyelg","jjyelm","jjyelb","jjyels","jjyelt","jjyelp","jjyelh","jjyem","jjyeb","jjyebs","jjyes","jjyess","jjyeng","jjyej","jjyec","jjyek","jjyet","jjyep","jjyeh","jjo","jjog","jjogg","jjogs","jjon","jjonj","jjonh","jjod","jjol","jjolg","jjolm","jjolb","jjols","jjolt","jjolp","jjolh","jjom","jjob","jjobs","jjos","jjoss","jjong","jjoj","jjoc","jjok","jjot","jjop","jjoh","jjwa","jjwag","jjwagg","jjwags","jjwan","jjwanj","jjwanh","jjwad","jjwal","jjwalg","jjwalm","jjwalb","jjwals","jjwalt","jjwalp","jjwalh","jjwam","jjwab","jjwabs","jjwas","jjwass","jjwang","jjwaj","jjwac","jjwak","jjwat","jjwap","jjwah","jjwae","jjwaeg","jjwaegg","jjwaegs","jjwaen","jjwaenj","jjwaenh","jjwaed","jjwael","jjwaelg","jjwaelm","jjwaelb"],
  "203": ["jjwaels","jjwaelt","jjwaelp","jjwaelh","jjwaem","jjwaeb","jjwaebs","jjwaes","jjwaess","jjwaeng","jjwaej","jjwaec","jjwaek","jjwaet","jjwaep","jjwaeh","jjoe","jjoeg","jjoegg","jjoegs","jjoen","jjoenj","jjoenh","jjoed","jjoel","jjoelg","jjoelm","jjoelb","jjoels","jjoelt","jjoelp","jjoelh","jjoem","jjoeb","jjoebs","jjoes","jjoess","jjoeng","jjoej","jjoec","jjoek","jjoet","jjoep","jjoeh","jjyo","jjyog","jjyogg","jjyogs","jjyon","jjyonj","jjyonh","jjyod","jjyol","jjyolg","jjyolm","jjyolb","jjyols","jjyolt","jjyolp","jjyolh","jjyom","jjyob","jjyobs","jjyos","jjyoss","jjyong","jjyoj","jjyoc","jjyok","jjyot","jjyop","jjyoh","jju","jjug","jjugg","jjugs","jjun","jjunj","jjunh","jjud","jjul","jjulg","jjulm","jjulb","jjuls","jjult","jjulp","jjulh","jjum","jjub","jjubs","jjus","jjuss","jjung","jjuj","jjuc","jjuk","jjut","jjup","jjuh","jjweo","jjweog","jjweogg","jjweogs","jjweon","jjweonj","jjweonh","jjweod","jjweol","jjweolg","jjweolm","jjweolb","jjweols","jjweolt","jjweolp","jjweolh","jjweom","jjweob","jjweobs","jjweos","jjweoss","jjweong","jjweoj","jjweoc","jjweok","jjweot","jjweop","jjweoh","jjwe","jjweg","jjwegg","jjwegs","jjwen","jjwenj","jjwenh","jjwed","jjwel","jjwelg","jjwelm","jjwelb","jjwels","jjwelt","jjwelp","jjwelh","jjwem","jjweb","jjwebs","jjwes","jjwess","jjweng","jjwej","jjwec","jjwek","jjwet","jjwep","jjweh","jjwi","jjwig","jjwigg","jjwigs","jjwin","jjwinj","jjwinh","jjwid","jjwil","jjwilg","jjwilm","jjwilb","jjwils","jjwilt","jjwilp","jjwilh","jjwim","jjwib","jjwibs","jjwis","jjwiss","jjwing","jjwij","jjwic","jjwik","jjwit","jjwip","jjwih","jjyu","jjyug","jjyugg","jjyugs","jjyun","jjyunj","jjyunh","jjyud","jjyul","jjyulg","jjyulm","jjyulb","jjyuls","jjyult","jjyulp","jjyulh","jjyum","jjyub","jjyubs","jjyus","jjyuss","jjyung","jjyuj","jjyuc","jjyuk","jjyut","jjyup","jjyuh","jjeu","jjeug","jjeugg","jjeugs","jjeun","jjeunj","jjeunh","jjeud","jjeul","jjeulg","jjeulm","jjeulb","jjeuls","jjeult","jjeulp","jjeulh","jjeum","jjeub","jjeubs","jjeus","jjeuss","jjeung","jjeuj","jjeuc","jjeuk","jjeut","jjeup","jjeuh","jjyi","jjyig","jjyigg","jjyigs","jjyin","jjyinj","jjyinh","jjyid","jjyil","jjyilg","jjyilm","jjyilb","jjyils","jjyilt","jjyilp","jjyilh"],
  "204": ["jjyim","jjyib","jjyibs","jjyis","jjyiss","jjying","jjyij","jjyic","jjyik","jjyit","jjyip","jjyih","jji","jjig","jjigg","jjigs","jjin","jjinj","jjinh","jjid","jjil","jjilg","jjilm","jjilb","jjils","jjilt","jjilp","jjilh","jjim","jjib","jjibs","jjis","jjiss","jjing","jjij","jjic","jjik","jjit","jjip","jjih","ca","cag","cagg","cags","can","canj","canh","cad","cal","calg","calm","calb","cals","calt","calp","calh","cam","cab","cabs","cas","cass","cang","caj","cac","cak","cat","cap","cah","cae","caeg","caegg","caegs","caen","caenj","caenh","caed","cael","caelg","caelm","caelb","caels","caelt","caelp","caelh","caem","caeb","caebs","caes","caess","caeng","caej","caec","caek","caet","caep","caeh","cya","cyag","cyagg","cyags","cyan","cyanj","cyanh","cyad","cyal","cyalg","cyalm","cyalb","cyals","cyalt","cyalp","cyalh","cyam","cyab","cyabs","cyas","cyass","cyang","cyaj","cyac","cyak","cyat","cyap","cyah","cyae","cyaeg","cyaegg","cyaegs","cyaen","cyaenj","cyaenh","cyaed","cyael","cyaelg","cyaelm","cyaelb","cyaels","cyaelt","cyaelp","cyaelh","cyaem","cyaeb","cyaebs","cyaes","cyaess","cyaeng","cyaej","cyaec","cyaek","cyaet","cyaep","cyaeh","ceo","ceog","ceogg","ceogs","ceon","ceonj","ceonh","ceod","ceol","ceolg","ceolm","ceolb","ceols","ceolt","ceolp","ceolh","ceom","ceob","ceobs","ceos","ceoss","ceong","ceoj","ceoc","ceok","ceot","ceop","ceoh","ce","ceg","cegg","cegs","cen","cenj","cenh","ced","cel","celg","celm","celb","cels","celt","celp","celh","cem","ceb","cebs","ces","cess","ceng","cej","cec","cek","cet","cep","ceh","cyeo","cyeog","cyeogg","cyeogs","cyeon","cyeonj","cyeonh","cyeod","cyeol","cyeolg","cyeolm","cyeolb","cyeols","cyeolt","cyeolp","cyeolh","cyeom","cyeob","cyeobs","cyeos","cyeoss","cyeong","cyeoj","cyeoc","cyeok","cyeot","cyeop","cyeoh","cye","cyeg","cyegg","cyegs","cyen","cyenj","cyenh","cyed","cyel","cyelg","cyelm","cyelb","cyels","cyelt","cyelp","cyelh","cyem","cyeb","cyebs","cyes"],
  "205": ["cyess","cyeng","cyej","cyec","cyek","cyet","cyep","cyeh","co","cog","cogg","cogs","con","conj","conh","cod","col","colg","colm","colb","cols","colt","colp","colh","com","cob","cobs","cos","coss","cong","coj","coc","cok","cot","cop","coh","cwa","cwag","cwagg","cwags","cwan","cwanj","cwanh","cwad","cwal","cwalg","cwalm","cwalb","cwals","cwalt","cwalp","cwalh","cwam","cwab","cwabs","cwas","cwass","cwang","cwaj","cwac","cwak","cwat","cwap","cwah","cwae","cwaeg","cwaegg","cwaegs","cwaen","cwaenj","cwaenh","cwaed","cwael","cwaelg","cwaelm","cwaelb","cwaels","cwaelt","cwaelp","cwaelh","cwaem","cwaeb","cwaebs","cwaes","cwaess","cwaeng","cwaej","cwaec","cwaek","cwaet","cwaep","cwaeh","coe","coeg","coegg","coegs","coen","coenj","coenh","coed","coel","coelg","coelm","coelb","coels","coelt","coelp","coelh","coem","coeb","coebs","coes","coess","coeng","coej","coec","coek","coet","coep","coeh","cyo","cyog","cyogg","cyogs","cyon","cyonj","cyonh","cyod","cyol","cyolg","cyolm","cyolb","cyols","cyolt","cyolp","cyolh","cyom","cyob","cyobs","cyos","cyoss","cyong","cyoj","cyoc","cyok","cyot","cyop","cyoh","cu","cug","cugg","cugs","cun","cunj","cunh","cud","cul","culg","culm","culb","culs","cult","culp","culh","cum","cub","cubs","cus","cuss","cung","cuj","cuc","cuk","cut","cup","cuh","cweo","cweog","cweogg","cweogs","cweon","cweonj","cweonh","cweod","cweol","cweolg","cweolm","cweolb","cweols","cweolt","cweolp","cweolh","cweom","cweob","cweobs","cweos","cweoss","cweong","cweoj","cweoc","cweok","cweot","cweop","cweoh","cwe","cweg","cwegg","cwegs","cwen","cwenj","cwenh","cwed","cwel","cwelg","cwelm","cwelb","cwels","cwelt","cwelp","cwelh","cwem","cweb","cwebs","cwes","cwess","cweng","cwej","cwec","cwek","cwet","cwep","cweh","cwi","cwig","cwigg","cwigs","cwin","cwinj","cwinh","cwid","cwil","cwilg","cwilm","cwilb","cwils","cwilt","cwilp","cwilh","cwim","cwib","cwibs","cwis","cwiss","cwing","cwij","cwic"],
  "206": ["cwik","cwit","cwip","cwih","cyu","cyug","cyugg","cyugs","cyun","cyunj","cyunh","cyud","cyul","cyulg","cyulm","cyulb","cyuls","cyult","cyulp","cyulh","cyum","cyub","cyubs","cyus","cyuss","cyung","cyuj","cyuc","cyuk","cyut","cyup","cyuh","ceu","ceug","ceugg","ceugs","ceun","ceunj","ceunh","ceud","ceul","ceulg","ceulm","ceulb","ceuls","ceult","ceulp","ceulh","ceum","ceub","ceubs","ceus","ceuss","ceung","ceuj","ceuc","ceuk","ceut","ceup","ceuh","cyi","cyig","cyigg","cyigs","cyin","cyinj","cyinh","cyid","cyil","cyilg","cyilm","cyilb","cyils","cyilt","cyilp","cyilh","cyim","cyib","cyibs","cyis","cyiss","cying","cyij","cyic","cyik","cyit","cyip","cyih","ci","cig","cigg","cigs","cin","cinj","cinh","cid","cil","cilg","cilm","cilb","cils","cilt","cilp","cilh","cim","cib","cibs","cis","ciss","cing","cij","cic","cik","cit","cip","cih","ka","kag","kagg","kags","kan","kanj","kanh","kad","kal","kalg","kalm","kalb","kals","kalt","kalp","kalh","kam","kab","kabs","kas","kass","kang","kaj","kac","kak","kat","kap","kah","kae","kaeg","kaegg","kaegs","kaen","kaenj","kaenh","kaed","kael","kaelg","kaelm","kaelb","kaels","kaelt","kaelp","kaelh","kaem","kaeb","kaebs","kaes","kaess","kaeng","kaej","kaec","kaek","kaet","kaep","kaeh","kya","kyag","kyagg","kyags","kyan","kyanj","kyanh","kyad","kyal","kyalg","kyalm","kyalb","kyals","kyalt","kyalp","kyalh","kyam","kyab","kyabs","kyas","kyass","kyang","kyaj","kyac","kyak","kyat","kyap","kyah","kyae","kyaeg","kyaegg","kyaegs","kyaen","kyaenj","kyaenh","kyaed","kyael","kyaelg","kyaelm","kyaelb","kyaels","kyaelt","kyaelp","kyaelh","kyaem","kyaeb","kyaebs","kyaes","kyaess","kyaeng","kyaej","kyaec","kyaek","kyaet","kyaep","kyaeh","keo","keog","keogg","keogs","keon","keonj","keonh","keod","keol","keolg","keolm","keolb","keols","keolt","keolp","keolh","keom","keob","keobs","keos","keoss","keong","keoj","keoc","keok","keot","keop","keoh"],
  "207": ["ke","keg","kegg","kegs","ken","kenj","kenh","ked","kel","kelg","kelm","kelb","kels","kelt","kelp","kelh","kem","keb","kebs","kes","kess","keng","kej","kec","kek","ket","kep","keh","kyeo","kyeog","kyeogg","kyeogs","kyeon","kyeonj","kyeonh","kyeod","kyeol","kyeolg","kyeolm","kyeolb","kyeols","kyeolt","kyeolp","kyeolh","kyeom","kyeob","kyeobs","kyeos","kyeoss","kyeong","kyeoj","kyeoc","kyeok","kyeot","kyeop","kyeoh","kye","kyeg","kyegg","kyegs","kyen","kyenj","kyenh","kyed","kyel","kyelg","kyelm","kyelb","kyels","kyelt","kyelp","kyelh","kyem","kyeb","kyebs","kyes","kyess","kyeng","kyej","kyec","kyek","kyet","kyep","kyeh","ko","kog","kogg","kogs","kon","konj","konh","kod","kol","kolg","kolm","kolb","kols","kolt","kolp","kolh","kom","kob","kobs","kos","koss","kong","koj","koc","kok","kot","kop","koh","kwa","kwag","kwagg","kwags","kwan","kwanj","kwanh","kwad","kwal","kwalg","kwalm","kwalb","kwals","kwalt","kwalp","kwalh","kwam","kwab","kwabs","kwas","kwass","kwang","kwaj","kwac","kwak","kwat","kwap","kwah","kwae","kwaeg","kwaegg","kwaegs","kwaen","kwaenj","kwaenh","kwaed","kwael","kwaelg","kwaelm","kwaelb","kwaels","kwaelt","kwaelp","kwaelh","kwaem","kwaeb","kwaebs","kwaes","kwaess","kwaeng","kwaej","kwaec","kwaek","kwaet","kwaep","kwaeh","koe","koeg","koegg","koegs","koen","koenj","koenh","koed","koel","koelg","koelm","koelb","koels","koelt","koelp","koelh","koem","koeb","koebs","koes","koess","koeng","koej","koec","koek","koet","koep","koeh","kyo","kyog","kyogg","kyogs","kyon","kyonj","kyonh","kyod","kyol","kyolg","kyolm","kyolb","kyols","kyolt","kyolp","kyolh","kyom","kyob","kyobs","kyos","kyoss","kyong","kyoj","kyoc","kyok","kyot","kyop","kyoh","ku","kug","kugg","kugs","kun","kunj","kunh","kud","kul","kulg","kulm","kulb","kuls","kult","kulp","kulh","kum","kub","kubs","kus","kuss","kung","kuj","kuc","kuk","kut","kup","kuh","kweo","kweog","kweogg","kweogs"],
  "208": ["kweon","kweonj","kweonh","kweod","kweol","kweolg","kweolm","kweolb","kweols","kweolt","kweolp","kweolh","kweom","kweob","kweobs","kweos","kweoss","kweong","kweoj","kweoc","kweok","kweot","kweop","kweoh","kwe","kweg","kwegg","kwegs","kwen","kwenj","kwenh","kwed","kwel","kwelg","kwelm","kwelb","kwels","kwelt","kwelp","kwelh","kwem","kweb","kwebs","kwes","kwess","kweng","kwej","kwec","kwek","kwet","kwep","kweh","kwi","kwig","kwigg","kwigs","kwin","kwinj","kwinh","kwid","kwil","kwilg","kwilm","kwilb","kwils","kwilt","kwilp","kwilh","kwim","kwib","kwibs","kwis","kwiss","kwing","kwij","kwic","kwik","kwit","kwip","kwih","kyu","kyug","kyugg","kyugs","kyun","kyunj","kyunh","kyud","kyul","kyulg","kyulm","kyulb","kyuls","kyult","kyulp","kyulh","kyum","kyub","kyubs","kyus","kyuss","kyung","kyuj","kyuc","kyuk","kyut","kyup","kyuh","keu","keug","keugg","keugs","keun","keunj","keunh","keud","keul","keulg","keulm","keulb","keuls","keult","keulp","keulh","keum","keub","keubs","keus","keuss","keung","keuj","keuc","keuk","keut","keup","keuh","kyi","kyig","kyigg","kyigs","kyin","kyinj","kyinh","kyid","kyil","kyilg","kyilm","kyilb","kyils","kyilt","kyilp","kyilh","kyim","kyib","kyibs","kyis","kyiss","kying","kyij","kyic","kyik","kyit","kyip","kyih","ki","kig","kigg","kigs","kin","kinj","kinh","kid","kil","kilg","kilm","kilb","kils","kilt","kilp","kilh","kim","kib","kibs","kis","kiss","king","kij","kic","kik","kit","kip","kih","ta","tag","tagg","tags","tan","tanj","tanh","tad","tal","talg","talm","talb","tals","talt","talp","talh","tam","tab","tabs","tas","tass","tang","taj","tac","tak","tat","tap","tah","tae","taeg","taegg","taegs","taen","taenj","taenh","taed","tael","taelg","taelm","taelb","taels","taelt","taelp","taelh","taem","taeb","taebs","taes","taess","taeng","taej","taec","taek","taet","taep","taeh","tya","tyag","tyagg","tyags","tyan","tyanj","tyanh","tyad"],
  "209": ["tyal","tyalg","tyalm","tyalb","tyals","tyalt","tyalp","tyalh","tyam","tyab","tyabs","tyas","tyass","tyang","tyaj","tyac","tyak","tyat","tyap","tyah","tyae","tyaeg","tyaegg","tyaegs","tyaen","tyaenj","tyaenh","tyaed","tyael","tyaelg","tyaelm","tyaelb","tyaels","tyaelt","tyaelp","tyaelh","tyaem","tyaeb","tyaebs","tyaes","tyaess","tyaeng","tyaej","tyaec","tyaek","tyaet","tyaep","tyaeh","teo","teog","teogg","teogs","teon","teonj","teonh","teod","teol","teolg","teolm","teolb","teols","teolt","teolp","teolh","teom","teob","teobs","teos","teoss","teong","teoj","teoc","teok","teot","teop","teoh","te","teg","tegg","tegs","ten","tenj","tenh","ted","tel","telg","telm","telb","tels","telt","telp","telh","tem","teb","tebs","tes","tess","teng","tej","tec","tek","tet","tep","teh","tyeo","tyeog","tyeogg","tyeogs","tyeon","tyeonj","tyeonh","tyeod","tyeol","tyeolg","tyeolm","tyeolb","tyeols","tyeolt","tyeolp","tyeolh","tyeom","tyeob","tyeobs","tyeos","tyeoss","tyeong","tyeoj","tyeoc","tyeok","tyeot","tyeop","tyeoh","tye","tyeg","tyegg","tyegs","tyen","tyenj","tyenh","tyed","tyel","tyelg","tyelm","tyelb","tyels","tyelt","tyelp","tyelh","tyem","tyeb","tyebs","tyes","tyess","tyeng","tyej","tyec","tyek","tyet","tyep","tyeh","to","tog","togg","togs","ton","tonj","tonh","tod","tol","tolg","tolm","tolb","tols","tolt","tolp","tolh","tom","tob","tobs","tos","toss","tong","toj","toc","tok","tot","top","toh","twa","twag","twagg","twags","twan","twanj","twanh","twad","twal","twalg","twalm","twalb","twals","twalt","twalp","twalh","twam","twab","twabs","twas","twass","twang","twaj","twac","twak","twat","twap","twah","twae","twaeg","twaegg","twaegs","twaen","twaenj","twaenh","twaed","twael","twaelg","twaelm","twaelb","twaels","twaelt","twaelp","twaelh","twaem","twaeb","twaebs","twaes","twaess","twaeng","twaej","twaec","twaek","twaet","twaep","twaeh","toe","toeg","toegg","toegs","toen","toenj","toenh","toed","toel","toelg","toelm","toelb"],
  "210": ["toels","toelt","toelp","toelh","toem","toeb","toebs","toes","toess","toeng","toej","toec","toek","toet","toep","toeh","tyo","tyog","tyogg","tyogs","tyon","tyonj","tyonh","tyod","tyol","tyolg","tyolm","tyolb","tyols","tyolt","tyolp","tyolh","tyom","tyob","tyobs","tyos","tyoss","tyong","tyoj","tyoc","tyok","tyot","tyop","tyoh","tu","tug","tugg","tugs","tun","tunj","tunh","tud","tul","tulg","tulm","tulb","tuls","tult","tulp","tulh","tum","tub","tubs","tus","tuss","tung","tuj","tuc","tuk","tut","tup","tuh","tweo","tweog","tweogg","tweogs","tweon","tweonj","tweonh","tweod","tweol","tweolg","tweolm","tweolb","tweols","tweolt","tweolp","tweolh","tweom","tweob","tweobs","tweos","tweoss","tweong","tweoj","tweoc","tweok","tweot","tweop","tweoh","twe","tweg","twegg","twegs","twen","twenj","twenh","twed","twel","twelg","twelm","twelb","twels","twelt","twelp","twelh","twem","tweb","twebs","twes","twess","tweng","twej","twec","twek","twet","twep","tweh","twi","twig","twigg","twigs","twin","twinj","twinh","twid","twil","twilg","twilm","twilb","twils","twilt","twilp","twilh","twim","twib","twibs","twis","twiss","twing","twij","twic","twik","twit","twip","twih","tyu","tyug","tyugg","tyugs","tyun","tyunj","tyunh","tyud","tyul","tyulg","tyulm","tyulb","tyuls","tyult","tyulp","tyulh","tyum","tyub","tyubs","tyus","tyuss","tyung","tyuj","tyuc","tyuk","tyut","tyup","tyuh","teu","teug","teugg","teugs","teun","teunj","teunh","teud","teul","teulg","teulm","teulb","teuls","teult","teulp","teulh","teum","teub","teubs","teus","teuss","teung","teuj","teuc","teuk","teut","teup","teuh","tyi","tyig","tyigg","tyigs","tyin","tyinj","tyinh","tyid","tyil","tyilg","tyilm","tyilb","tyils","tyilt","tyilp","tyilh","tyim","tyib","tyibs","tyis","tyiss","tying","tyij","tyic","tyik","tyit","tyip","tyih","ti","tig","tigg","tigs","tin","tinj","tinh","tid","til","tilg","tilm","tilb","tils","tilt","tilp","tilh"],
  "211": ["tim","tib","tibs","tis","tiss","ting","tij","tic","tik","tit","tip","tih","pa","pag","pagg","pags","pan","panj","panh","pad","pal","palg","palm","palb","pals","palt","palp","palh","pam","pab","pabs","pas","pass","pang","paj","pac","pak","pat","pap","pah","pae","paeg","paegg","paegs","paen","paenj","paenh","paed","pael","paelg","paelm","paelb","paels","paelt","paelp","paelh","paem","paeb","paebs","paes","paess","paeng","paej","paec","paek","paet","paep","paeh","pya","pyag","pyagg","pyags","pyan","pyanj","pyanh","pyad","pyal","pyalg","pyalm","pyalb","pyals","pyalt","pyalp","pyalh","pyam","pyab","pyabs","pyas","pyass","pyang","pyaj","pyac","pyak","pyat","pyap","pyah","pyae","pyaeg","pyaegg","pyaegs","pyaen","pyaenj","pyaenh","pyaed","pyael","pyaelg","pyaelm","pyaelb","pyaels","pyaelt","pyaelp","pyaelh","pyaem","pyaeb","pyaebs","pyaes","pyaess","pyaeng","pyaej","pyaec","pyaek","pyaet","pyaep","pyaeh","peo","peog","peogg","peogs","peon","peonj","peonh","peod","peol","peolg","peolm","peolb","peols","peolt","peolp","peolh","peom","peob","peobs","peos","peoss","peong","peoj","peoc","peok","peot","peop","peoh","pe","peg","pegg","pegs","pen","penj","penh","ped","pel","pelg","pelm","pelb","pels","pelt","pelp","pelh","pem","peb","pebs","pes","pess","peng","pej","pec","pek","pet","pep","peh","pyeo","pyeog","pyeogg","pyeogs","pyeon","pyeonj","pyeonh","pyeod","pyeol","pyeolg","pyeolm","pyeolb","pyeols","pyeolt","pyeolp","pyeolh","pyeom","pyeob","pyeobs","pyeos","pyeoss","pyeong","pyeoj","pyeoc","pyeok","pyeot","pyeop","pyeoh","pye","pyeg","pyegg","pyegs","pyen","pyenj","pyenh","pyed","pyel","pyelg","pyelm","pyelb","pyels","pyelt","pyelp","pyelh","pyem","pyeb","pyebs","pyes","pyess","pyeng","pyej","pyec","pyek","pyet","pyep","pyeh","po","pog","pogg","pogs","pon","ponj","ponh","pod","pol","polg","polm","polb","pols","polt","polp","polh","pom","pob","pobs","pos"],
  "212": ["poss","pong","poj","poc","pok","pot","pop","poh","pwa","pwag","pwagg","pwags","pwan","pwanj","pwanh","pwad","pwal","pwalg","pwalm","pwalb","pwals","pwalt","pwalp","pwalh","pwam","pwab","pwabs","pwas","pwass","pwang","pwaj","pwac","pwak","pwat","pwap","pwah","pwae","pwaeg","pwaegg","pwaegs","pwaen","pwaenj","pwaenh","pwaed","pwael","pwaelg","pwaelm","pwaelb","pwaels","pwaelt","pwaelp","pwaelh","pwaem","pwaeb","pwaebs","pwaes","pwaess","pwaeng","pwaej","pwaec","pwaek","pwaet","pwaep","pwaeh","poe","poeg","poegg","poegs","poen","poenj","poenh","poed","poel","poelg","poelm","poelb","poels","poelt","poelp","poelh","poem","poeb","poebs","poes","poess","poeng","poej","poec","poek","poet","poep","poeh","pyo","pyog","pyogg","pyogs","pyon","pyonj","pyonh","pyod","pyol","pyolg","pyolm","pyolb","pyols","pyolt","pyolp","pyolh","pyom","pyob","pyobs","pyos","pyoss","pyong","pyoj","pyoc","pyok","pyot","pyop","pyoh","pu","pug","pugg","pugs","pun","punj","punh","pud","pul","pulg","pulm","pulb","puls","pult","pulp","pulh","pum","pub","pubs","pus","puss","pung","puj","puc","puk","put","pup","puh","pweo","pweog","pweogg","pweogs","pweon","pweonj","pweonh","pweod","pweol","pweolg","pweolm","pweolb","pweols","pweolt","pweolp","pweolh","pweom","pweob","pweobs","pweos","pweoss","pweong","pweoj","pweoc","pweok","pweot","pweop","pweoh","pwe","pweg","pwegg","pwegs","pwen","pwenj","pwenh","pwed","pwel","pwelg","pwelm","pwelb","pwels","pwelt","pwelp","pwelh","pwem","pweb","pwebs","pwes","pwess","pweng","pwej","pwec","pwek","pwet","pwep","pweh","pwi","pwig","pwigg","pwigs","pwin","pwinj","pwinh","pwid","pwil","pwilg","pwilm","pwilb","pwils","pwilt","pwilp","pwilh","pwim","pwib","pwibs","pwis","pwiss","pwing","pwij","pwic","pwik","pwit","pwip","pwih","pyu","pyug","pyugg","pyugs","pyun","pyunj","pyunh","pyud","pyul","pyulg","pyulm","pyulb","pyuls","pyult","pyulp","pyulh","pyum","pyub","pyubs","pyus","pyuss","pyung","pyuj","pyuc"],
  "213": ["pyuk","pyut","pyup","pyuh","peu","peug","peugg","peugs","peun","peunj","peunh","peud","peul","peulg","peulm","peulb","peuls","peult","peulp","peulh","peum","peub","peubs","peus","peuss","peung","peuj","peuc","peuk","peut","peup","peuh","pyi","pyig","pyigg","pyigs","pyin","pyinj","pyinh","pyid","pyil","pyilg","pyilm","pyilb","pyils","pyilt","pyilp","pyilh","pyim","pyib","pyibs","pyis","pyiss","pying","pyij","pyic","pyik","pyit","pyip","pyih","pi","pig","pigg","pigs","pin","pinj","pinh","pid","pil","pilg","pilm","pilb","pils","pilt","pilp","pilh","pim","pib","pibs","pis","piss","ping","pij","pic","pik","pit","pip","pih","ha","hag","hagg","hags","han","hanj","hanh","had","hal","halg","halm","halb","hals","halt","halp","halh","ham","hab","habs","has","hass","hang","haj","hac","hak","hat","hap","hah","hae","haeg","haegg","haegs","haen","haenj","haenh","haed","hael","haelg","haelm","haelb","haels","haelt","haelp","haelh","haem","haeb","haebs","haes","haess","haeng","haej","haec","haek","haet","haep","haeh","hya","hyag","hyagg","hyags","hyan","hyanj","hyanh","hyad","hyal","hyalg","hyalm","hyalb","hyals","hyalt","hyalp","hyalh","hyam","hyab","hyabs","hyas","hyass","hyang","hyaj","hyac","hyak","hyat","hyap","hyah","hyae","hyaeg","hyaegg","hyaegs","hyaen","hyaenj","hyaenh","hyaed","hyael","hyaelg","hyaelm","hyaelb","hyaels","hyaelt","hyaelp","hyaelh","hyaem","hyaeb","hyaebs","hyaes","hyaess","hyaeng","hyaej","hyaec","hyaek","hyaet","hyaep","hyaeh","heo","heog","heogg","heogs","heon","heonj","heonh","heod","heol","heolg","heolm","heolb","heols","heolt","heolp","heolh","heom","heob","heobs","heos","heoss","heong","heoj","heoc","heok","heot","heop","heoh","he","heg","hegg","hegs","hen","henj","henh","hed","hel","helg","helm","helb","hels","helt","help","helh","hem","heb","hebs","hes","hess","heng","hej","hec","hek","het","hep","heh"],
  "214": ["hyeo","hyeog","hyeogg","hyeogs","hyeon","hyeonj","hyeonh","hyeod","hyeol","hyeolg","hyeolm","hyeolb","hyeols","hyeolt","hyeolp","hyeolh","hyeom","hyeob","hyeobs","hyeos","hyeoss","hyeong","hyeoj","hyeoc","hyeok","hyeot","hyeop","hyeoh","hye","hyeg","hyegg","hyegs","hyen","hyenj","hyenh","hyed","hyel","hyelg","hyelm","hyelb","hyels","hyelt","hyelp","hyelh","hyem","hyeb","hyebs","hyes","hyess","hyeng","hyej","hyec","hyek","hyet","hyep","hyeh","ho","hog","hogg","hogs","hon","honj","honh","hod","hol","holg","holm","holb","hols","holt","holp","holh","hom","hob","hobs","hos","hoss","hong","hoj","hoc","hok","hot","hop","hoh","hwa","hwag","hwagg","hwags","hwan","hwanj","hwanh","hwad","hwal","hwalg","hwalm","hwalb","hwals","hwalt","hwalp","hwalh","hwam","hwab","hwabs","hwas","hwass","hwang","hwaj","hwac","hwak","hwat","hwap","hwah","hwae","hwaeg","hwaegg","hwaegs","hwaen","hwaenj","hwaenh","hwaed","hwael","hwaelg","hwaelm","hwaelb","hwaels","hwaelt","hwaelp","hwaelh","hwaem","hwaeb","hwaebs","hwaes","hwaess","hwaeng","hwaej","hwaec","hwaek","hwaet","hwaep","hwaeh","hoe","hoeg","hoegg","hoegs","hoen","hoenj","hoenh","hoed","hoel","hoelg","hoelm","hoelb","hoels","hoelt","hoelp","hoelh","hoem","hoeb","hoebs","hoes","hoess","hoeng","hoej","hoec","hoek","hoet","hoep","hoeh","hyo","hyog","hyogg","hyogs","hyon","hyonj","hyonh","hyod","hyol","hyolg","hyolm","hyolb","hyols","hyolt","hyolp","hyolh","hyom","hyob","hyobs","hyos","hyoss","hyong","hyoj","hyoc","hyok","hyot","hyop","hyoh","hu","hug","hugg","hugs","hun","hunj","hunh","hud","hul","hulg","hulm","hulb","huls","hult","hulp","hulh","hum","hub","hubs","hus","huss","hung","huj","huc","huk","hut","hup","huh","hweo","hweog","hweogg","hweogs","hweon","hweonj","hweonh","hweod","hweol","hweolg","hweolm","hweolb","hweols","hweolt","hweolp","hweolh","hweom","hweob","hweobs","hweos","hweoss","hweong","hweoj","hweoc","hweok","hweot","hweop","hweoh","hwe","hweg","hwegg","hwegs"],
  "215": ["hwen","hwenj","hwenh","hwed","hwel","hwelg","hwelm","hwelb","hwels","hwelt","hwelp","hwelh","hwem","hweb","hwebs","hwes","hwess","hweng","hwej","hwec","hwek","hwet","hwep","hweh","hwi","hwig","hwigg","hwigs","hwin","hwinj","hwinh","hwid","hwil","hwilg","hwilm","hwilb","hwils","hwilt","hwilp","hwilh","hwim","hwib","hwibs","hwis","hwiss","hwing","hwij","hwic","hwik","hwit","hwip","hwih","hyu","hyug","hyugg","hyugs","hyun","hyunj","hyunh","hyud","hyul","hyulg","hyulm","hyulb","hyuls","hyult","hyulp","hyulh","hyum","hyub","hyubs","hyus","hyuss","hyung","hyuj","hyuc","hyuk","hyut","hyup","hyuh","heu","heug","heugg","heugs","heun","heunj","heunh","heud","heul","heulg","heulm","heulb","heuls","heult","heulp","heulh","heum","heub","heubs","heus","heuss","heung","heuj","heuc","heuk","heut","heup","heuh","hyi","hyig","hyigg","hyigs","hyin","hyinj","hyinh","hyid","hyil","hyilg","hyilm","hyilb","hyils","hyilt","hyilp","hyilh","hyim","hyib","hyibs","hyis","hyiss","hying","hyij","hyic","hyik","hyit","hyip","hyih","hi","hig","higg","higs","hin","hinj","hinh","hid","hil","hilg","hilm","hilb","hils","hilt","hilp","hilh","him","hib","hibs","his","hiss","hing","hij","hic","hik","hit","hip","hih",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
  "249": ["Kay ","Kayng ","Ke ","Ko ","Kol ","Koc ","Kwi ","Kwi ","Kyun ","Kul ","Kum ","Na ","Na ","Na ","La ","Na ","Na ","Na ","Na ","Na ","Nak ","Nak ","Nak ","Nak ","Nak ","Nak ","Nak ","Nan ","Nan ","Nan ","Nan ","Nan ","Nan ","Nam ","Nam ","Nam ","Nam ","Nap ","Nap ","Nap ","Nang ","Nang ","Nang ","Nang ","Nang ","Nay ","Nayng ","No ","No ","No ","No ","No ","No ","No ","No ","No ","No ","No ","No ","Nok ","Nok ","Nok ","Nok ","Nok ","Nok ","Non ","Nong ","Nong ","Nong ","Nong ","Noy ","Noy ","Noy ","Noy ","Nwu ","Nwu ","Nwu ","Nwu ","Nwu ","Nwu ","Nwu ","Nwu ","Nuk ","Nuk ","Num ","Nung ","Nung ","Nung ","Nung ","Nung ","Twu ","La ","Lak ","Lak ","Lan ","Lyeng ","Lo ","Lyul ","Li ","Pey ","Pen ","Pyen ","Pwu ","Pwul ","Pi ","Sak ","Sak ","Sam ","Sayk ","Sayng ","Sep ","Sey ","Sway ","Sin ","Sim ","Sip ","Ya ","Yak ","Yak ","Yang ","Yang ","Yang ","Yang ","Yang ","Yang ","Yang ","Yang ","Ye ","Ye ","Ye ","Ye ","Ye ","Ye ","Ye ","Ye ","Ye ","Ye ","Ye ","Yek ","Yek ","Yek ","Yek ","Yen ","Yen ","Yen ","Yen ","Yen ","Yen ","Yen ","Yen ","Yen ","Yen ","Yen ","Yen ","Yen ","Yen ","Yel ","Yel ","Yel ","Yel ","Yel ","Yel ","Yem ","Yem ","Yem ","Yem ","Yem ","Yep ","Yeng ","Yeng ","Yeng ","Yeng ","Yeng ","Yeng ","Yeng ","Yeng ","Yeng ","Yeng ","Yeng ","Yeng ","Yeng ","Yey ","Yey ","Yey ","Yey ","O ","Yo ","Yo ","Yo ","Yo ","Yo ","Yo ","Yo ","Yo ","Yo ","Yo ","Yong ","Wun ","Wen ","Yu ","Yu ","Yu ","Yu ","Yu ","Yu ","Yu ","Yu ","Yu ","Yu ","Yuk ","Yuk ","Yuk ","Yun ","Yun ","Yun ","Yun ","Yul ","Yul ","Yul ","Yul ","Yung ","I ","I ","I ","I ","I ","I ","I ","I ","I ","I ","I ","I ","I ","I ","Ik ","Ik ","In ","In ","In ","In ","In ","In ","In ","Im ","Im ","Im ","Ip ","Ip ","Ip ","Cang ","Cek ","Ci ","Cip ","Cha ","Chek "],
  "250": ["Chey ","Thak ","Thak ","Thang ","Thayk ","Thong ","Pho ","Phok ","Hang ","Hang ","Hyen ","Hwak ","Wu ","Huo ",null,null,"Zhong ",null,"Qing ",null,null,"Xi ","Zhu ","Yi ","Li ","Shen ","Xiang ","Fu ","Jing ","Jing ","Yu ",null,"Hagi ",null,"Zhu ",null,null,"Yi ","Du ",null,null,null,"Fan ","Si ","Guan ",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
  "251": ["ff","fi","fl","ffi","ffl","st","st",null,null,null,null,null,null,null,null,null,null,null,null,"mn","me","mi","vn","mkh",null,null,null,null,null,"yi","","ay","`","","d","h","k","l","m","m","t","+","sh","s","sh","s","a","a","","b","g","d","h","v","z",null,"t","y","k","k","l",null,"l",null,"n","n",null,"p","p",null,"ts","ts","r","sh","t","vo","b","k","p","l","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","",""],
  "252": ["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","",""],
  "253": ["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","",null,null,"","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"","","","","","","","","","","","",null,null,null,null],
  "254": [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"","","","~",null,null,null,null,null,null,null,null,null,null,null,null,"..","--","-","_","_","(",") ","{","} ","[","] ","[(",")] ","<<",">> ","<","> ","[","] ","{","}",null,null,null,null,"","","","","","","",",",",",".","",";",":","?","!","-","(",")","{","}","{","}","#","&","*","+","-","<",">","=","","\\","$","%","@",null,null,null,null,"","","",null,"",null,"","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","",null,null,""],
  "255": [null,"!","\"","#","$","%","&","'","(",")","*","+",",","-",".","/","0","1","2","3","4","5","6","7","8","9",":",";","<","=",">","?","@","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","[","\\","]","^","_","`","a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","{","|","}","~",null,null,".","[","]",",","*","wo","a","i","u","e","o","ya","yu","yo","tu","+","a","i","u","e","o","ka","ki","ku","ke","ko","sa","si","su","se","so","ta","ti","tu","te","to","na","ni","nu","ne","no","ha","hi","hu","he","ho","ma","mi","mu","me","mo","ya","yu","yo","ra","ri","ru","re","ro","wa","n",":",";","","g","gg","gs","n","nj","nh","d","dd","r","lg","lm","lb","ls","lt","lp","rh","m","b","bb","bs","s","ss","","j","jj","c","k","t","p","h",null,null,null,"a","ae","ya","yae","eo","e",null,null,"yeo","ye","o","wa","wae","oe",null,null,"yo","u","weo","we","wi","yu",null,null,"eu","yi","i",null,null,null,"/C","PS","!","-","|","Y=","W=",null,"|","-","|","-","|","#","O",null,null,null,null,null,null,null,null,null,null,"{","|","}","","","",""]
}


},{}],50:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.slugify = exports.transliterate = undefined;

var _transliterate = require('./transliterate');

var _transliterate2 = _interopRequireDefault(_transliterate);

var _slugify = require('./slugify');

var _slugify2 = _interopRequireDefault(_slugify);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.transliterate = _transliterate2.default;
exports.slugify = _slugify2.default;
},{"./slugify":51,"./transliterate":52}],51:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _transliterate = require('./transliterate');

var _transliterate2 = _interopRequireDefault(_transliterate);

var _utils = require('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Slugify
const defaultOptions = {
  lowercase: true,
  separator: '-',
  replace: [],
  replaceAfter: [],
  ignore: []
};
let configOptions = {};

const slugify = (str, options) => {
  const opt = options ? (0, _utils.mergeOptions)(defaultOptions, options) : (0, _utils.mergeOptions)(defaultOptions, configOptions);
  // remove leading and trailing separators
  const sep = (0, _utils.escapeRegExp)(opt.separator);
  opt.replaceAfter.push([/[^a-zA-Z0-9]+/g, opt.separator], [new RegExp(`^(${sep})+|(${sep})+$`, 'g'), '']);
  const transliterateOptions = { replaceAfter: opt.replaceAfter, replace: opt.replace, ignore: opt.ignore };
  let slug = (0, _transliterate2.default)(str, transliterateOptions);
  if (opt.lowercase) {
    slug = slug.toLowerCase();
  }
  return slug;
};

slugify.config = options => {
  if (options === undefined) {
    return configOptions;
  }
  configOptions = (0, _utils.mergeOptions)(defaultOptions, options);
  return configOptions;
};

exports.default = slugify;
},{"./transliterate":52,"./utils":53}],52:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.replaceStr = undefined;

var _utils = require('./utils');

var _charmap = require('../../data/charmap.json');

var _charmap2 = _interopRequireDefault(_charmap);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let charmap = {};
const defaultOptions = {
  unknown: '[?]',
  replace: [],
  replaceAfter: [],
  ignore: [],
  trim: true
};
let configOptions = {};

/* istanbul ignore next */
const replaceStr = exports.replaceStr = (source, replace) => {
  let str = source;
  for (const item of replace) {
    if (item[0] instanceof RegExp) {
      if (!item[0].global) {
        item[0] = new RegExp(item[0].toString().replace(/^\/|\/$/), `${item[0].flags}g`);
      }
    } else if (typeof item[0] === 'string') {
      item[0] = new RegExp((0, _utils.escapeRegExp)(item[0]), 'g');
    }
    if (item[0] instanceof RegExp) {
      str = str.replace(item[0], item[1]);
    }
  }
  return str;
};

/**
 * @param {string} sourceStr The string which is being transliterated
 * @param {object} options options
 */
/* istanbul ignore next */
const transliterate = (sourceStr, options) => {
  const opt = options ? (0, _utils.mergeOptions)(defaultOptions, options) : (0, _utils.mergeOptions)(defaultOptions, configOptions);
  let str = String(sourceStr);
  let i;let j;let splitted;let result;let ignore;let ord;
  if (opt.ignore instanceof Array && opt.ignore.length > 0) {
    for (i in opt.ignore) {
      splitted = str.split(opt.ignore[i]);
      result = [];
      for (j in splitted) {
        ignore = opt.ignore.slice(0);
        ignore.splice(i, 1);
        result.push(transliterate(splitted[j], (0, _utils.mergeOptions)(opt, { ignore, trim: false })));
      }
      return result.join(opt.ignore[i]);
    }
  }
  str = replaceStr(str, opt.replace);
  str = (0, _utils.fixChineseSpace)(str);
  const strArr = (0, _utils.ucs2decode)(str);
  const strArrNew = [];

  for (ord of strArr) {
    // These characters are also transliteratable. Will improve it later if needed
    if (ord > 0xffff) {
      strArrNew.push(opt.unknown);
    } else {
      const offset = ord >> 8;
      if (typeof charmap[offset] === 'undefined') {
        charmap[offset] = _charmap2.default[offset] || [];
      }
      ord &= 0xff;
      const text = charmap[offset][ord];
      if (typeof text === 'undefined' || text === null) {
        strArrNew.push(opt.unknown);
      } else {
        strArrNew.push(charmap[offset][ord]);
      }
    }
  }
  // trim spaces at the beginning and ending of the string
  if (opt.trim && strArrNew.length > 1) {
    opt.replaceAfter.push([/(^ +?)|( +?$)/g, '']);
  }
  let strNew = strArrNew.join('');

  strNew = replaceStr(strNew, opt.replaceAfter);
  return strNew;
};

transliterate.setCharmap = customCharmap => {
  charmap = customCharmap || charmap;
  return charmap;
};

transliterate.config = options => {
  if (options === undefined) {
    return configOptions;
  }
  configOptions = (0, _utils.mergeOptions)(defaultOptions, options);
  return configOptions;
};

exports.default = transliterate;
},{"../../data/charmap.json":49,"./utils":53}],53:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
// Credit: https://github.com/bestiejs/punycode.js/blob/master/LICENSE-MIT.txt
const ucs2decode = exports.ucs2decode = string => {
  const output = [];
  let counter = 0;
  while (counter < string.length) {
    const value = string.charCodeAt(counter++);
    if (value >= 0xD800 && value <= 0xDBFF && counter < string.length) {
      // high surrogate, and there is a next character
      const extra = string.charCodeAt(counter++);
      if ((extra & 0xFC00) === 0xDC00) {
        // low surrogate
        output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
      } else {
        // unmatched surrogate; only append this code unit, in case the next
        // code unit is the high surrogate of a surrogate pair
        output.push(value);
        counter--;
      }
    } else {
      output.push(value);
    }
  }
  return output;
};

// add additional space between Chinese and English.
const fixChineseSpace = exports.fixChineseSpace = str => str.replace(/([^\u4e00-\u9fa5\W])([\u4e00-\u9fa5])/g, '$1 $2');

// Escape regular expression string
const escapeRegExp = exports.escapeRegExp = sourceStr => {
  let str = sourceStr;
  if (str === null || str === undefined) {
    str = '';
  }
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
};

/**
 * Merge configuration options. Use deep merge if option is an array.
 */
const mergeOptions = exports.mergeOptions = (defaultOptions, options) => {
  const result = {};
  const opt = options || {};
  for (const key in defaultOptions) {
    result[key] = opt[key] === undefined ? defaultOptions[key] : opt[key];
    if (result[key] instanceof Array) {
      result[key] = result[key].slice(0);
    }
    // convert object version of the 'replace' option into array version
    if (key === 'replace' && typeof result[key] === 'object' && !(result[key] instanceof Array)) {
      const replaceArr = [];
      for (const source in result.replace) {
        replaceArr.push([source, result.replace[source]]);
      }
      result.replace = replaceArr;
    }
  }
  return result;
};

const parseCmdEqualOption = exports.parseCmdEqualOption = option => {
  let opt = option || {};
  const replaceToken = '__REPLACE_TOKEN__';
  let tmpToken = replaceToken;
  let result;
  while (opt.indexOf(tmpToken) > -1) {
    tmpToken += tmpToken;
  }
  // escape for \\=
  if (opt.match(/[^\\]\\\\=/)) {
    opt = opt.replace(/([^\\])\\\\=/g, '$1\\=');
    // escape for \=
  } else if (opt.match(/[^\\]\\=/)) {
    opt = opt.replace(/([^\\])\\=/g, `$1${tmpToken}`);
  }
  result = opt.split('=').map(value => value.replace(new RegExp(tmpToken, 'g'), '='));
  if (result.length !== 2) {
    result = false;
  }
  return result;
};
},{}],"open-science-identity":[function(require,module,exports){
"use strict";
/** This class implements a strict hashing function for identifying
 *   a patient or subject in a study such that the resulting signature
 *   cannot be mapped back to the patient's private information.
 *
 *   Based on the Ruby implementation by Pierre Rioux.
 *
 *   John Saigle <john.saigle@mcgill.ca>
 */

let pbkdf2 = require('pbkdf2');
let transliterate = require('transliteration');

function OpenScienceIdentity(attributes = []){
    this.PBKDF2_ITERATIONS = 10000;
    this.PBKDF2_HASH_FUNCTION = 'sha256';
    this.PBKDF2_KEY_LENGTH = 32;

    this.GENDER_VALUES = [
        'male',
        'female',
        'unknown',
        'other'
    ];
    this.DOB_REGEX = /^(19|20)\d\d-(0[1-9]|1[012])-(0[1-9]|[12]\d|3[01])$/;
    this.bad_attributes = [];

    this.gender        = attributes['gender']        || '';
    this.first_name    = attributes['first_name']    || '';
    this.middle_name   = attributes['middle_name']   || '';
    this.last_name     = attributes['last_name']     || '';
    this.birth_day     = attributes['birth_day']     || '';
    this.city_of_birth = attributes['city_of_birth'] || '';
}

OpenScienceIdentity.prototype.cleanGender = function() {
    return this.plainAlpha(this.gender);
};
OpenScienceIdentity.prototype.cleanFirstName = function() {
    return this.plainAlpha(this.first_name);
};
OpenScienceIdentity.prototype.cleanMiddleName = function() {
    return this.plainAlpha(this.middle_name);
};
OpenScienceIdentity.prototype.cleanLastName = function() {
    return this.plainAlpha(this.last_name);
};
OpenScienceIdentity.prototype.cleanBirthDay = function() {
    return this.plainAlpha(this.birth_day);
};
OpenScienceIdentity.prototype.cleanCityOfBirth = function() {
    return this.plainAlpha(this.city_of_birth);
};

OpenScienceIdentity.prototype.valid = function() {
    this.bad_attributes = [];
    if (! this.cleanFirstName()) {
        this.bad_attributes.push('first name');
    }
    // No check for middle name because it's optional
    if (! this.cleanLastName()) {
        this.bad_attributes.push('last name');
    }
    if (! this.cleanGender() || ! this.GENDER_VALUES.includes(this.cleanGender())
       ) 
   {
       this.bad_attributes.push('gender');
   }
   if (! this.birth_day || ! this.birth_day.match(this.DOB_REGEX))
   {
       this.bad_attributes.push('birthday');
   }
   if (! this.cleanCityOfBirth()) {
       this.bad_attributes.push('city of birth');
   }
   return this.bad_attributes.length === 0;
};

OpenScienceIdentity.prototype.validate = function() {
    if (! this.valid()) {
        throw "Not all identity components have valid initial values: " 
        + this.bad_attributes.join(',');
    }
};

OpenScienceIdentity.prototype.signatureKey = function() {
    let components = [
        this.cleanGender(),
        this.cleanFirstName(),
        this.cleanMiddleName(),
        this.cleanLastName(),
        this.cleanBirthDay(),
        this.cleanCityOfBirth()
    ];
    // e.g. "male|pierre|tiberius|rioux|19211231|newyorkcity"
    return components.join('|');
};

OpenScienceIdentity.prototype.plainAlpha = function(string) {
    let cleaned = transliterate.transliterate(string);
    cleaned = cleaned.toLowerCase();
    cleaned = cleaned.replace(/[^a-z0-9]+/g, '');
    return cleaned;
};

OpenScienceIdentity.prototype.toSignature = function() {
    this.validate();
    let sig_key = this.signatureKey();
    let salt = this.reverseString(sig_key);
    // Calculate hash. See below links for details.
    //      <https://nodejs.org/api/crypto.html#crypto_crypto_pbkdf2sync_password_salt_iterations_keylen_digest>
    //      <https://github.com/crypto-browserify/pbkdf2>
    let hash = pbkdf2.pbkdf2Sync(
        sig_key,
        salt,
        this.PBKDF2_ITERATIONS,
        this.PBKDF2_KEY_LENGTH,
        this.PBKDF2_HASH_FUNCTION
    );
    return hash.toString('hex');
};

// The below is an implementation of naive (i.e. not Unicode-aware) string
// reversal implemented in JavaScript and taken from StackOverflow
// <https://stackoverflow.com/a/959004/6189922>.
// It should work for our purposes since this will be only be called on the
// variable `sig_key` which represents a concatenation of "clean" input fields
// which have been transliterated into plain ASCII.
OpenScienceIdentity.prototype.reverseString = function(s) {
    return s.split('').reverse().join('');
};

exports.OpenScienceIdentity = OpenScienceIdentity;
},{"pbkdf2":34,"transliteration":50}]},{},[]);
