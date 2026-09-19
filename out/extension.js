"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// node_modules/ws/lib/constants.js
var require_constants = __commonJS({
  "node_modules/ws/lib/constants.js"(exports2, module2) {
    "use strict";
    var BINARY_TYPES = ["nodebuffer", "arraybuffer", "fragments"];
    var hasBlob = typeof Blob !== "undefined";
    if (hasBlob)
      BINARY_TYPES.push("blob");
    module2.exports = {
      BINARY_TYPES,
      CLOSE_TIMEOUT: 3e4,
      EMPTY_BUFFER: Buffer.alloc(0),
      GUID: "258EAFA5-E914-47DA-95CA-C5AB0DC85B11",
      hasBlob,
      kForOnEventAttribute: Symbol("kIsForOnEventAttribute"),
      kListener: Symbol("kListener"),
      kStatusCode: Symbol("status-code"),
      kWebSocket: Symbol("websocket"),
      NOOP: () => {
      }
    };
  }
});

// node_modules/ws/lib/buffer-util.js
var require_buffer_util = __commonJS({
  "node_modules/ws/lib/buffer-util.js"(exports2, module2) {
    "use strict";
    var { EMPTY_BUFFER } = require_constants();
    var FastBuffer = Buffer[Symbol.species];
    function concat(list, totalLength) {
      if (list.length === 0)
        return EMPTY_BUFFER;
      if (list.length === 1)
        return list[0];
      const target = Buffer.allocUnsafe(totalLength);
      let offset = 0;
      for (let i = 0; i < list.length; i++) {
        const buf = list[i];
        target.set(buf, offset);
        offset += buf.length;
      }
      if (offset < totalLength) {
        return new FastBuffer(target.buffer, target.byteOffset, offset);
      }
      return target;
    }
    function _mask(source, mask, output, offset, length) {
      for (let i = 0; i < length; i++) {
        output[offset + i] = source[i] ^ mask[i & 3];
      }
    }
    function _unmask(buffer, mask) {
      for (let i = 0; i < buffer.length; i++) {
        buffer[i] ^= mask[i & 3];
      }
    }
    function toArrayBuffer(buf) {
      if (buf.length === buf.buffer.byteLength) {
        return buf.buffer;
      }
      return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.length);
    }
    function toBuffer(data) {
      toBuffer.readOnly = true;
      if (Buffer.isBuffer(data))
        return data;
      let buf;
      if (data instanceof ArrayBuffer) {
        buf = new FastBuffer(data);
      } else if (ArrayBuffer.isView(data)) {
        buf = new FastBuffer(data.buffer, data.byteOffset, data.byteLength);
      } else {
        buf = Buffer.from(data);
        toBuffer.readOnly = false;
      }
      return buf;
    }
    module2.exports = {
      concat,
      mask: _mask,
      toArrayBuffer,
      toBuffer,
      unmask: _unmask
    };
    if (!process.env.WS_NO_BUFFER_UTIL) {
      try {
        const bufferUtil = require("bufferutil");
        module2.exports.mask = function(source, mask, output, offset, length) {
          if (length < 48)
            _mask(source, mask, output, offset, length);
          else
            bufferUtil.mask(source, mask, output, offset, length);
        };
        module2.exports.unmask = function(buffer, mask) {
          if (buffer.length < 32)
            _unmask(buffer, mask);
          else
            bufferUtil.unmask(buffer, mask);
        };
      } catch (e) {
      }
    }
  }
});

// node_modules/ws/lib/limiter.js
var require_limiter = __commonJS({
  "node_modules/ws/lib/limiter.js"(exports2, module2) {
    "use strict";
    var kDone = Symbol("kDone");
    var kRun = Symbol("kRun");
    var Limiter = class {
      /**
       * Creates a new `Limiter`.
       *
       * @param {Number} [concurrency=Infinity] The maximum number of jobs allowed
       *     to run concurrently
       */
      constructor(concurrency) {
        this[kDone] = () => {
          this.pending--;
          this[kRun]();
        };
        this.concurrency = concurrency || Infinity;
        this.jobs = [];
        this.pending = 0;
      }
      /**
       * Adds a job to the queue.
       *
       * @param {Function} job The job to run
       * @public
       */
      add(job) {
        this.jobs.push(job);
        this[kRun]();
      }
      /**
       * Removes a job from the queue and runs it if possible.
       *
       * @private
       */
      [kRun]() {
        if (this.pending === this.concurrency)
          return;
        if (this.jobs.length) {
          const job = this.jobs.shift();
          this.pending++;
          job(this[kDone]);
        }
      }
    };
    module2.exports = Limiter;
  }
});

// node_modules/ws/lib/permessage-deflate.js
var require_permessage_deflate = __commonJS({
  "node_modules/ws/lib/permessage-deflate.js"(exports2, module2) {
    "use strict";
    var zlib = require("zlib");
    var bufferUtil = require_buffer_util();
    var Limiter = require_limiter();
    var { kStatusCode } = require_constants();
    var FastBuffer = Buffer[Symbol.species];
    var TRAILER = Buffer.from([0, 0, 255, 255]);
    var kPerMessageDeflate = Symbol("permessage-deflate");
    var kTotalLength = Symbol("total-length");
    var kCallback = Symbol("callback");
    var kBuffers = Symbol("buffers");
    var kError = Symbol("error");
    var zlibLimiter;
    var PerMessageDeflate2 = class {
      /**
       * Creates a PerMessageDeflate instance.
       *
       * @param {Object} [options] Configuration options
       * @param {(Boolean|Number)} [options.clientMaxWindowBits] Advertise support
       *     for, or request, a custom client window size
       * @param {Boolean} [options.clientNoContextTakeover=false] Advertise/
       *     acknowledge disabling of client context takeover
       * @param {Number} [options.concurrencyLimit=10] The number of concurrent
       *     calls to zlib
       * @param {Boolean} [options.isServer=false] Create the instance in either
       *     server or client mode
       * @param {Number} [options.maxPayload=0] The maximum allowed message length
       * @param {(Boolean|Number)} [options.serverMaxWindowBits] Request/confirm the
       *     use of a custom server window size
       * @param {Boolean} [options.serverNoContextTakeover=false] Request/accept
       *     disabling of server context takeover
       * @param {Number} [options.threshold=1024] Size (in bytes) below which
       *     messages should not be compressed if context takeover is disabled
       * @param {Object} [options.zlibDeflateOptions] Options to pass to zlib on
       *     deflate
       * @param {Object} [options.zlibInflateOptions] Options to pass to zlib on
       *     inflate
       */
      constructor(options) {
        this._options = options || {};
        this._threshold = this._options.threshold !== void 0 ? this._options.threshold : 1024;
        this._maxPayload = this._options.maxPayload | 0;
        this._isServer = !!this._options.isServer;
        this._deflate = null;
        this._inflate = null;
        this.params = null;
        if (!zlibLimiter) {
          const concurrency = this._options.concurrencyLimit !== void 0 ? this._options.concurrencyLimit : 10;
          zlibLimiter = new Limiter(concurrency);
        }
      }
      /**
       * @type {String}
       */
      static get extensionName() {
        return "permessage-deflate";
      }
      /**
       * Create an extension negotiation offer.
       *
       * @return {Object} Extension parameters
       * @public
       */
      offer() {
        const params = {};
        if (this._options.serverNoContextTakeover) {
          params.server_no_context_takeover = true;
        }
        if (this._options.clientNoContextTakeover) {
          params.client_no_context_takeover = true;
        }
        if (this._options.serverMaxWindowBits) {
          params.server_max_window_bits = this._options.serverMaxWindowBits;
        }
        if (this._options.clientMaxWindowBits) {
          params.client_max_window_bits = this._options.clientMaxWindowBits;
        } else if (this._options.clientMaxWindowBits == null) {
          params.client_max_window_bits = true;
        }
        return params;
      }
      /**
       * Accept an extension negotiation offer/response.
       *
       * @param {Array} configurations The extension negotiation offers/reponse
       * @return {Object} Accepted configuration
       * @public
       */
      accept(configurations) {
        configurations = this.normalizeParams(configurations);
        this.params = this._isServer ? this.acceptAsServer(configurations) : this.acceptAsClient(configurations);
        return this.params;
      }
      /**
       * Releases all resources used by the extension.
       *
       * @public
       */
      cleanup() {
        if (this._inflate) {
          this._inflate.close();
          this._inflate = null;
        }
        if (this._deflate) {
          const callback = this._deflate[kCallback];
          this._deflate.close();
          this._deflate = null;
          if (callback) {
            callback(
              new Error(
                "The deflate stream was closed while data was being processed"
              )
            );
          }
        }
      }
      /**
       *  Accept an extension negotiation offer.
       *
       * @param {Array} offers The extension negotiation offers
       * @return {Object} Accepted configuration
       * @private
       */
      acceptAsServer(offers) {
        const opts = this._options;
        const accepted = offers.find((params) => {
          if (opts.serverNoContextTakeover === false && params.server_no_context_takeover || params.server_max_window_bits && (opts.serverMaxWindowBits === false || typeof opts.serverMaxWindowBits === "number" && opts.serverMaxWindowBits > params.server_max_window_bits) || typeof opts.clientMaxWindowBits === "number" && (typeof params.client_max_window_bits === "number" ? opts.clientMaxWindowBits > params.client_max_window_bits : !params.client_max_window_bits)) {
            return false;
          }
          return true;
        });
        if (!accepted) {
          throw new Error("None of the extension offers can be accepted");
        }
        if (opts.serverNoContextTakeover) {
          accepted.server_no_context_takeover = true;
        }
        if (opts.clientNoContextTakeover) {
          accepted.client_no_context_takeover = true;
        }
        if (typeof opts.serverMaxWindowBits === "number") {
          accepted.server_max_window_bits = opts.serverMaxWindowBits;
        }
        if (typeof opts.clientMaxWindowBits === "number") {
          accepted.client_max_window_bits = opts.clientMaxWindowBits;
        } else if (accepted.client_max_window_bits === true || opts.clientMaxWindowBits === false) {
          delete accepted.client_max_window_bits;
        }
        return accepted;
      }
      /**
       * Accept the extension negotiation response.
       *
       * @param {Array} response The extension negotiation response
       * @return {Object} Accepted configuration
       * @private
       */
      acceptAsClient(response) {
        const params = response[0];
        if (this._options.clientNoContextTakeover === false && params.client_no_context_takeover) {
          throw new Error('Unexpected parameter "client_no_context_takeover"');
        }
        if (!params.client_max_window_bits) {
          if (typeof this._options.clientMaxWindowBits === "number") {
            params.client_max_window_bits = this._options.clientMaxWindowBits;
          }
        } else if (this._options.clientMaxWindowBits === false || typeof this._options.clientMaxWindowBits === "number" && params.client_max_window_bits > this._options.clientMaxWindowBits) {
          throw new Error(
            'Unexpected or invalid parameter "client_max_window_bits"'
          );
        }
        return params;
      }
      /**
       * Normalize parameters.
       *
       * @param {Array} configurations The extension negotiation offers/reponse
       * @return {Array} The offers/response with normalized parameters
       * @private
       */
      normalizeParams(configurations) {
        configurations.forEach((params) => {
          Object.keys(params).forEach((key) => {
            let value = params[key];
            if (value.length > 1) {
              throw new Error(`Parameter "${key}" must have only a single value`);
            }
            value = value[0];
            if (key === "client_max_window_bits") {
              if (value !== true) {
                const num = +value;
                if (!Number.isInteger(num) || num < 8 || num > 15) {
                  throw new TypeError(
                    `Invalid value for parameter "${key}": ${value}`
                  );
                }
                value = num;
              } else if (!this._isServer) {
                throw new TypeError(
                  `Invalid value for parameter "${key}": ${value}`
                );
              }
            } else if (key === "server_max_window_bits") {
              const num = +value;
              if (!Number.isInteger(num) || num < 8 || num > 15) {
                throw new TypeError(
                  `Invalid value for parameter "${key}": ${value}`
                );
              }
              value = num;
            } else if (key === "client_no_context_takeover" || key === "server_no_context_takeover") {
              if (value !== true) {
                throw new TypeError(
                  `Invalid value for parameter "${key}": ${value}`
                );
              }
            } else {
              throw new Error(`Unknown parameter "${key}"`);
            }
            params[key] = value;
          });
        });
        return configurations;
      }
      /**
       * Decompress data. Concurrency limited.
       *
       * @param {Buffer} data Compressed data
       * @param {Boolean} fin Specifies whether or not this is the last fragment
       * @param {Function} callback Callback
       * @public
       */
      decompress(data, fin, callback) {
        zlibLimiter.add((done) => {
          this._decompress(data, fin, (err, result) => {
            done();
            callback(err, result);
          });
        });
      }
      /**
       * Compress data. Concurrency limited.
       *
       * @param {(Buffer|String)} data Data to compress
       * @param {Boolean} fin Specifies whether or not this is the last fragment
       * @param {Function} callback Callback
       * @public
       */
      compress(data, fin, callback) {
        zlibLimiter.add((done) => {
          this._compress(data, fin, (err, result) => {
            done();
            callback(err, result);
          });
        });
      }
      /**
       * Decompress data.
       *
       * @param {Buffer} data Compressed data
       * @param {Boolean} fin Specifies whether or not this is the last fragment
       * @param {Function} callback Callback
       * @private
       */
      _decompress(data, fin, callback) {
        const endpoint = this._isServer ? "client" : "server";
        if (!this._inflate) {
          const key = `${endpoint}_max_window_bits`;
          const windowBits = typeof this.params[key] !== "number" ? zlib.Z_DEFAULT_WINDOWBITS : this.params[key];
          this._inflate = zlib.createInflateRaw({
            ...this._options.zlibInflateOptions,
            windowBits
          });
          this._inflate[kPerMessageDeflate] = this;
          this._inflate[kTotalLength] = 0;
          this._inflate[kBuffers] = [];
          this._inflate.on("error", inflateOnError);
          this._inflate.on("data", inflateOnData);
        }
        this._inflate[kCallback] = callback;
        this._inflate.write(data);
        if (fin)
          this._inflate.write(TRAILER);
        this._inflate.flush(() => {
          const err = this._inflate[kError];
          if (err) {
            this._inflate.close();
            this._inflate = null;
            callback(err);
            return;
          }
          const data2 = bufferUtil.concat(
            this._inflate[kBuffers],
            this._inflate[kTotalLength]
          );
          if (this._inflate._readableState.endEmitted) {
            this._inflate.close();
            this._inflate = null;
          } else {
            this._inflate[kTotalLength] = 0;
            this._inflate[kBuffers] = [];
            if (fin && this.params[`${endpoint}_no_context_takeover`]) {
              this._inflate.reset();
            }
          }
          callback(null, data2);
        });
      }
      /**
       * Compress data.
       *
       * @param {(Buffer|String)} data Data to compress
       * @param {Boolean} fin Specifies whether or not this is the last fragment
       * @param {Function} callback Callback
       * @private
       */
      _compress(data, fin, callback) {
        const endpoint = this._isServer ? "server" : "client";
        if (!this._deflate) {
          const key = `${endpoint}_max_window_bits`;
          const windowBits = typeof this.params[key] !== "number" ? zlib.Z_DEFAULT_WINDOWBITS : this.params[key];
          this._deflate = zlib.createDeflateRaw({
            ...this._options.zlibDeflateOptions,
            windowBits
          });
          this._deflate[kTotalLength] = 0;
          this._deflate[kBuffers] = [];
          this._deflate.on("data", deflateOnData);
        }
        this._deflate[kCallback] = callback;
        this._deflate.write(data);
        this._deflate.flush(zlib.Z_SYNC_FLUSH, () => {
          if (!this._deflate) {
            return;
          }
          let data2 = bufferUtil.concat(
            this._deflate[kBuffers],
            this._deflate[kTotalLength]
          );
          if (fin) {
            data2 = new FastBuffer(data2.buffer, data2.byteOffset, data2.length - 4);
          }
          this._deflate[kCallback] = null;
          this._deflate[kTotalLength] = 0;
          this._deflate[kBuffers] = [];
          if (fin && this.params[`${endpoint}_no_context_takeover`]) {
            this._deflate.reset();
          }
          callback(null, data2);
        });
      }
    };
    module2.exports = PerMessageDeflate2;
    function deflateOnData(chunk) {
      this[kBuffers].push(chunk);
      this[kTotalLength] += chunk.length;
    }
    function inflateOnData(chunk) {
      this[kTotalLength] += chunk.length;
      if (this[kPerMessageDeflate]._maxPayload < 1 || this[kTotalLength] <= this[kPerMessageDeflate]._maxPayload) {
        this[kBuffers].push(chunk);
        return;
      }
      this[kError] = new RangeError("Max payload size exceeded");
      this[kError].code = "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH";
      this[kError][kStatusCode] = 1009;
      this.removeListener("data", inflateOnData);
      this.reset();
    }
    function inflateOnError(err) {
      this[kPerMessageDeflate]._inflate = null;
      if (this[kError]) {
        this[kCallback](this[kError]);
        return;
      }
      err[kStatusCode] = 1007;
      this[kCallback](err);
    }
  }
});

// node_modules/ws/lib/validation.js
var require_validation = __commonJS({
  "node_modules/ws/lib/validation.js"(exports2, module2) {
    "use strict";
    var { isUtf8 } = require("buffer");
    var { hasBlob } = require_constants();
    var tokenChars = [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      // 0 - 15
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      // 16 - 31
      0,
      1,
      0,
      1,
      1,
      1,
      1,
      1,
      0,
      0,
      1,
      1,
      0,
      1,
      1,
      0,
      // 32 - 47
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      0,
      0,
      0,
      0,
      0,
      0,
      // 48 - 63
      0,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      // 64 - 79
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      0,
      0,
      0,
      1,
      1,
      // 80 - 95
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      // 96 - 111
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      0,
      1,
      0,
      1,
      0
      // 112 - 127
    ];
    function isValidStatusCode(code) {
      return code >= 1e3 && code <= 1014 && code !== 1004 && code !== 1005 && code !== 1006 || code >= 3e3 && code <= 4999;
    }
    function _isValidUTF8(buf) {
      const len = buf.length;
      let i = 0;
      while (i < len) {
        if ((buf[i] & 128) === 0) {
          i++;
        } else if ((buf[i] & 224) === 192) {
          if (i + 1 === len || (buf[i + 1] & 192) !== 128 || (buf[i] & 254) === 192) {
            return false;
          }
          i += 2;
        } else if ((buf[i] & 240) === 224) {
          if (i + 2 >= len || (buf[i + 1] & 192) !== 128 || (buf[i + 2] & 192) !== 128 || buf[i] === 224 && (buf[i + 1] & 224) === 128 || // Overlong
          buf[i] === 237 && (buf[i + 1] & 224) === 160) {
            return false;
          }
          i += 3;
        } else if ((buf[i] & 248) === 240) {
          if (i + 3 >= len || (buf[i + 1] & 192) !== 128 || (buf[i + 2] & 192) !== 128 || (buf[i + 3] & 192) !== 128 || buf[i] === 240 && (buf[i + 1] & 240) === 128 || // Overlong
          buf[i] === 244 && buf[i + 1] > 143 || buf[i] > 244) {
            return false;
          }
          i += 4;
        } else {
          return false;
        }
      }
      return true;
    }
    function isBlob(value) {
      return hasBlob && typeof value === "object" && typeof value.arrayBuffer === "function" && typeof value.type === "string" && typeof value.stream === "function" && (value[Symbol.toStringTag] === "Blob" || value[Symbol.toStringTag] === "File");
    }
    module2.exports = {
      isBlob,
      isValidStatusCode,
      isValidUTF8: _isValidUTF8,
      tokenChars
    };
    if (isUtf8) {
      module2.exports.isValidUTF8 = function(buf) {
        return buf.length < 24 ? _isValidUTF8(buf) : isUtf8(buf);
      };
    } else if (!process.env.WS_NO_UTF_8_VALIDATE) {
      try {
        const isValidUTF8 = require("utf-8-validate");
        module2.exports.isValidUTF8 = function(buf) {
          return buf.length < 32 ? _isValidUTF8(buf) : isValidUTF8(buf);
        };
      } catch (e) {
      }
    }
  }
});

// node_modules/ws/lib/receiver.js
var require_receiver = __commonJS({
  "node_modules/ws/lib/receiver.js"(exports2, module2) {
    "use strict";
    var { Writable } = require("stream");
    var PerMessageDeflate2 = require_permessage_deflate();
    var {
      BINARY_TYPES,
      EMPTY_BUFFER,
      kStatusCode,
      kWebSocket
    } = require_constants();
    var { concat, toArrayBuffer, unmask } = require_buffer_util();
    var { isValidStatusCode, isValidUTF8 } = require_validation();
    var FastBuffer = Buffer[Symbol.species];
    var GET_INFO = 0;
    var GET_PAYLOAD_LENGTH_16 = 1;
    var GET_PAYLOAD_LENGTH_64 = 2;
    var GET_MASK = 3;
    var GET_DATA = 4;
    var INFLATING = 5;
    var DEFER_EVENT = 6;
    var Receiver2 = class extends Writable {
      /**
       * Creates a Receiver instance.
       *
       * @param {Object} [options] Options object
       * @param {Boolean} [options.allowSynchronousEvents=true] Specifies whether
       *     any of the `'message'`, `'ping'`, and `'pong'` events can be emitted
       *     multiple times in the same tick
       * @param {String} [options.binaryType=nodebuffer] The type for binary data
       * @param {Object} [options.extensions] An object containing the negotiated
       *     extensions
       * @param {Boolean} [options.isServer=false] Specifies whether to operate in
       *     client or server mode
       * @param {Number} [options.maxBufferedChunks=0] The maximum number of
       *     buffered data chunks
       * @param {Number} [options.maxFragments=0] The maximum number of message
       *     fragments
       * @param {Number} [options.maxPayload=0] The maximum allowed message length
       * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
       *     not to skip UTF-8 validation for text and close messages
       */
      constructor(options = {}) {
        super();
        this._allowSynchronousEvents = options.allowSynchronousEvents !== void 0 ? options.allowSynchronousEvents : true;
        this._binaryType = options.binaryType || BINARY_TYPES[0];
        this._extensions = options.extensions || {};
        this._isServer = !!options.isServer;
        this._maxBufferedChunks = options.maxBufferedChunks | 0;
        this._maxFragments = options.maxFragments | 0;
        this._maxPayload = options.maxPayload | 0;
        this._skipUTF8Validation = !!options.skipUTF8Validation;
        this[kWebSocket] = void 0;
        this._bufferedBytes = 0;
        this._buffers = [];
        this._compressed = false;
        this._payloadLength = 0;
        this._mask = void 0;
        this._fragmented = 0;
        this._masked = false;
        this._fin = false;
        this._opcode = 0;
        this._totalPayloadLength = 0;
        this._messageLength = 0;
        this._numFragments = 0;
        this._fragments = [];
        this._errored = false;
        this._loop = false;
        this._state = GET_INFO;
      }
      /**
       * Implements `Writable.prototype._write()`.
       *
       * @param {Buffer} chunk The chunk of data to write
       * @param {String} encoding The character encoding of `chunk`
       * @param {Function} cb Callback
       * @private
       */
      _write(chunk, encoding, cb) {
        if (this._opcode === 8 && this._state == GET_INFO)
          return cb();
        if (this._maxBufferedChunks > 0 && this._buffers.length >= this._maxBufferedChunks) {
          cb(
            this.createError(
              RangeError,
              "Too many buffered chunks",
              false,
              1008,
              "WS_ERR_TOO_MANY_BUFFERED_PARTS"
            )
          );
          return;
        }
        this._bufferedBytes += chunk.length;
        this._buffers.push(chunk);
        this.startLoop(cb);
      }
      /**
       * Consumes `n` bytes from the buffered data.
       *
       * @param {Number} n The number of bytes to consume
       * @return {Buffer} The consumed bytes
       * @private
       */
      consume(n) {
        this._bufferedBytes -= n;
        if (n === this._buffers[0].length)
          return this._buffers.shift();
        if (n < this._buffers[0].length) {
          const buf = this._buffers[0];
          this._buffers[0] = new FastBuffer(
            buf.buffer,
            buf.byteOffset + n,
            buf.length - n
          );
          return new FastBuffer(buf.buffer, buf.byteOffset, n);
        }
        const dst = Buffer.allocUnsafe(n);
        do {
          const buf = this._buffers[0];
          const offset = dst.length - n;
          if (n >= buf.length) {
            dst.set(this._buffers.shift(), offset);
          } else {
            dst.set(new Uint8Array(buf.buffer, buf.byteOffset, n), offset);
            this._buffers[0] = new FastBuffer(
              buf.buffer,
              buf.byteOffset + n,
              buf.length - n
            );
          }
          n -= buf.length;
        } while (n > 0);
        return dst;
      }
      /**
       * Starts the parsing loop.
       *
       * @param {Function} cb Callback
       * @private
       */
      startLoop(cb) {
        this._loop = true;
        do {
          switch (this._state) {
            case GET_INFO:
              this.getInfo(cb);
              break;
            case GET_PAYLOAD_LENGTH_16:
              this.getPayloadLength16(cb);
              break;
            case GET_PAYLOAD_LENGTH_64:
              this.getPayloadLength64(cb);
              break;
            case GET_MASK:
              this.getMask();
              break;
            case GET_DATA:
              this.getData(cb);
              break;
            case INFLATING:
            case DEFER_EVENT:
              this._loop = false;
              return;
          }
        } while (this._loop);
        if (!this._errored)
          cb();
      }
      /**
       * Reads the first two bytes of a frame.
       *
       * @param {Function} cb Callback
       * @private
       */
      getInfo(cb) {
        if (this._bufferedBytes < 2) {
          this._loop = false;
          return;
        }
        const buf = this.consume(2);
        if ((buf[0] & 48) !== 0) {
          const error = this.createError(
            RangeError,
            "RSV2 and RSV3 must be clear",
            true,
            1002,
            "WS_ERR_UNEXPECTED_RSV_2_3"
          );
          cb(error);
          return;
        }
        const compressed = (buf[0] & 64) === 64;
        if (compressed && !this._extensions[PerMessageDeflate2.extensionName]) {
          const error = this.createError(
            RangeError,
            "RSV1 must be clear",
            true,
            1002,
            "WS_ERR_UNEXPECTED_RSV_1"
          );
          cb(error);
          return;
        }
        this._fin = (buf[0] & 128) === 128;
        this._opcode = buf[0] & 15;
        this._payloadLength = buf[1] & 127;
        if (this._opcode === 0) {
          if (compressed) {
            const error = this.createError(
              RangeError,
              "RSV1 must be clear",
              true,
              1002,
              "WS_ERR_UNEXPECTED_RSV_1"
            );
            cb(error);
            return;
          }
          if (!this._fragmented) {
            const error = this.createError(
              RangeError,
              "invalid opcode 0",
              true,
              1002,
              "WS_ERR_INVALID_OPCODE"
            );
            cb(error);
            return;
          }
          this._opcode = this._fragmented;
        } else if (this._opcode === 1 || this._opcode === 2) {
          if (this._fragmented) {
            const error = this.createError(
              RangeError,
              `invalid opcode ${this._opcode}`,
              true,
              1002,
              "WS_ERR_INVALID_OPCODE"
            );
            cb(error);
            return;
          }
          this._compressed = compressed;
        } else if (this._opcode > 7 && this._opcode < 11) {
          if (!this._fin) {
            const error = this.createError(
              RangeError,
              "FIN must be set",
              true,
              1002,
              "WS_ERR_EXPECTED_FIN"
            );
            cb(error);
            return;
          }
          if (compressed) {
            const error = this.createError(
              RangeError,
              "RSV1 must be clear",
              true,
              1002,
              "WS_ERR_UNEXPECTED_RSV_1"
            );
            cb(error);
            return;
          }
          if (this._payloadLength > 125 || this._opcode === 8 && this._payloadLength === 1) {
            const error = this.createError(
              RangeError,
              `invalid payload length ${this._payloadLength}`,
              true,
              1002,
              "WS_ERR_INVALID_CONTROL_PAYLOAD_LENGTH"
            );
            cb(error);
            return;
          }
        } else {
          const error = this.createError(
            RangeError,
            `invalid opcode ${this._opcode}`,
            true,
            1002,
            "WS_ERR_INVALID_OPCODE"
          );
          cb(error);
          return;
        }
        if (!this._fin && !this._fragmented)
          this._fragmented = this._opcode;
        this._masked = (buf[1] & 128) === 128;
        if (this._isServer) {
          if (!this._masked) {
            const error = this.createError(
              RangeError,
              "MASK must be set",
              true,
              1002,
              "WS_ERR_EXPECTED_MASK"
            );
            cb(error);
            return;
          }
        } else if (this._masked) {
          const error = this.createError(
            RangeError,
            "MASK must be clear",
            true,
            1002,
            "WS_ERR_UNEXPECTED_MASK"
          );
          cb(error);
          return;
        }
        if (this._payloadLength === 126)
          this._state = GET_PAYLOAD_LENGTH_16;
        else if (this._payloadLength === 127)
          this._state = GET_PAYLOAD_LENGTH_64;
        else
          this.haveLength(cb);
      }
      /**
       * Gets extended payload length (7+16).
       *
       * @param {Function} cb Callback
       * @private
       */
      getPayloadLength16(cb) {
        if (this._bufferedBytes < 2) {
          this._loop = false;
          return;
        }
        this._payloadLength = this.consume(2).readUInt16BE(0);
        this.haveLength(cb);
      }
      /**
       * Gets extended payload length (7+64).
       *
       * @param {Function} cb Callback
       * @private
       */
      getPayloadLength64(cb) {
        if (this._bufferedBytes < 8) {
          this._loop = false;
          return;
        }
        const buf = this.consume(8);
        const num = buf.readUInt32BE(0);
        if (num > Math.pow(2, 53 - 32) - 1) {
          const error = this.createError(
            RangeError,
            "Unsupported WebSocket frame: payload length > 2^53 - 1",
            false,
            1009,
            "WS_ERR_UNSUPPORTED_DATA_PAYLOAD_LENGTH"
          );
          cb(error);
          return;
        }
        this._payloadLength = num * Math.pow(2, 32) + buf.readUInt32BE(4);
        this.haveLength(cb);
      }
      /**
       * Payload length has been read.
       *
       * @param {Function} cb Callback
       * @private
       */
      haveLength(cb) {
        if (this._payloadLength && this._opcode < 8) {
          this._totalPayloadLength += this._payloadLength;
          if (this._totalPayloadLength > this._maxPayload && this._maxPayload > 0) {
            const error = this.createError(
              RangeError,
              "Max payload size exceeded",
              false,
              1009,
              "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH"
            );
            cb(error);
            return;
          }
        }
        if (this._masked)
          this._state = GET_MASK;
        else
          this._state = GET_DATA;
      }
      /**
       * Reads mask bytes.
       *
       * @private
       */
      getMask() {
        if (this._bufferedBytes < 4) {
          this._loop = false;
          return;
        }
        this._mask = this.consume(4);
        this._state = GET_DATA;
      }
      /**
       * Reads data bytes.
       *
       * @param {Function} cb Callback
       * @private
       */
      getData(cb) {
        let data = EMPTY_BUFFER;
        if (this._payloadLength) {
          if (this._bufferedBytes < this._payloadLength) {
            this._loop = false;
            return;
          }
          data = this.consume(this._payloadLength);
          if (this._masked && (this._mask[0] | this._mask[1] | this._mask[2] | this._mask[3]) !== 0) {
            unmask(data, this._mask);
          }
        }
        if (this._opcode > 7) {
          this.controlMessage(data, cb);
          return;
        }
        if (this._maxFragments > 0 && ++this._numFragments > this._maxFragments) {
          const error = this.createError(
            RangeError,
            "Too many message fragments",
            false,
            1008,
            "WS_ERR_TOO_MANY_BUFFERED_PARTS"
          );
          cb(error);
          return;
        }
        if (this._compressed) {
          this._state = INFLATING;
          this.decompress(data, cb);
          return;
        }
        if (data.length) {
          this._messageLength = this._totalPayloadLength;
          this._fragments.push(data);
        }
        this.dataMessage(cb);
      }
      /**
       * Decompresses data.
       *
       * @param {Buffer} data Compressed data
       * @param {Function} cb Callback
       * @private
       */
      decompress(data, cb) {
        const perMessageDeflate = this._extensions[PerMessageDeflate2.extensionName];
        perMessageDeflate.decompress(data, this._fin, (err, buf) => {
          if (err)
            return cb(err);
          if (buf.length) {
            this._messageLength += buf.length;
            if (this._messageLength > this._maxPayload && this._maxPayload > 0) {
              const error = this.createError(
                RangeError,
                "Max payload size exceeded",
                false,
                1009,
                "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH"
              );
              cb(error);
              return;
            }
            this._fragments.push(buf);
          }
          this.dataMessage(cb);
          if (this._state === GET_INFO)
            this.startLoop(cb);
        });
      }
      /**
       * Handles a data message.
       *
       * @param {Function} cb Callback
       * @private
       */
      dataMessage(cb) {
        if (!this._fin) {
          this._state = GET_INFO;
          return;
        }
        const messageLength = this._messageLength;
        const fragments = this._fragments;
        this._totalPayloadLength = 0;
        this._messageLength = 0;
        this._fragmented = 0;
        this._numFragments = 0;
        this._fragments = [];
        if (this._opcode === 2) {
          let data;
          if (this._binaryType === "nodebuffer") {
            data = concat(fragments, messageLength);
          } else if (this._binaryType === "arraybuffer") {
            data = toArrayBuffer(concat(fragments, messageLength));
          } else if (this._binaryType === "blob") {
            data = new Blob(fragments);
          } else {
            data = fragments;
          }
          if (this._allowSynchronousEvents) {
            this.emit("message", data, true);
            this._state = GET_INFO;
          } else {
            this._state = DEFER_EVENT;
            setImmediate(() => {
              this.emit("message", data, true);
              this._state = GET_INFO;
              this.startLoop(cb);
            });
          }
        } else {
          const buf = concat(fragments, messageLength);
          if (!this._skipUTF8Validation && !isValidUTF8(buf)) {
            const error = this.createError(
              Error,
              "invalid UTF-8 sequence",
              true,
              1007,
              "WS_ERR_INVALID_UTF8"
            );
            cb(error);
            return;
          }
          if (this._state === INFLATING || this._allowSynchronousEvents) {
            this.emit("message", buf, false);
            this._state = GET_INFO;
          } else {
            this._state = DEFER_EVENT;
            setImmediate(() => {
              this.emit("message", buf, false);
              this._state = GET_INFO;
              this.startLoop(cb);
            });
          }
        }
      }
      /**
       * Handles a control message.
       *
       * @param {Buffer} data Data to handle
       * @return {(Error|RangeError|undefined)} A possible error
       * @private
       */
      controlMessage(data, cb) {
        if (this._opcode === 8) {
          if (data.length === 0) {
            this._loop = false;
            this.emit("conclude", 1005, EMPTY_BUFFER);
            this.end();
          } else {
            const code = data.readUInt16BE(0);
            if (!isValidStatusCode(code)) {
              const error = this.createError(
                RangeError,
                `invalid status code ${code}`,
                true,
                1002,
                "WS_ERR_INVALID_CLOSE_CODE"
              );
              cb(error);
              return;
            }
            const buf = new FastBuffer(
              data.buffer,
              data.byteOffset + 2,
              data.length - 2
            );
            if (!this._skipUTF8Validation && !isValidUTF8(buf)) {
              const error = this.createError(
                Error,
                "invalid UTF-8 sequence",
                true,
                1007,
                "WS_ERR_INVALID_UTF8"
              );
              cb(error);
              return;
            }
            this._loop = false;
            this.emit("conclude", code, buf);
            this.end();
          }
          this._state = GET_INFO;
          return;
        }
        if (this._allowSynchronousEvents) {
          this.emit(this._opcode === 9 ? "ping" : "pong", data);
          this._state = GET_INFO;
        } else {
          this._state = DEFER_EVENT;
          setImmediate(() => {
            this.emit(this._opcode === 9 ? "ping" : "pong", data);
            this._state = GET_INFO;
            this.startLoop(cb);
          });
        }
      }
      /**
       * Builds an error object.
       *
       * @param {function(new:Error|RangeError)} ErrorCtor The error constructor
       * @param {String} message The error message
       * @param {Boolean} prefix Specifies whether or not to add a default prefix to
       *     `message`
       * @param {Number} statusCode The status code
       * @param {String} errorCode The exposed error code
       * @return {(Error|RangeError)} The error
       * @private
       */
      createError(ErrorCtor, message, prefix, statusCode, errorCode) {
        this._loop = false;
        this._errored = true;
        const err = new ErrorCtor(
          prefix ? `Invalid WebSocket frame: ${message}` : message
        );
        Error.captureStackTrace(err, this.createError);
        err.code = errorCode;
        err[kStatusCode] = statusCode;
        return err;
      }
    };
    module2.exports = Receiver2;
  }
});

// node_modules/ws/lib/sender.js
var require_sender = __commonJS({
  "node_modules/ws/lib/sender.js"(exports2, module2) {
    "use strict";
    var { Duplex } = require("stream");
    var { randomFillSync } = require("crypto");
    var {
      types: { isUint8Array }
    } = require("util");
    var PerMessageDeflate2 = require_permessage_deflate();
    var { EMPTY_BUFFER, kWebSocket, NOOP } = require_constants();
    var { isBlob, isValidStatusCode } = require_validation();
    var { mask: applyMask, toBuffer } = require_buffer_util();
    var kByteLength = Symbol("kByteLength");
    var maskBuffer = Buffer.alloc(4);
    var RANDOM_POOL_SIZE = 8 * 1024;
    var randomPool;
    var randomPoolPointer = RANDOM_POOL_SIZE;
    var DEFAULT = 0;
    var DEFLATING = 1;
    var GET_BLOB_DATA = 2;
    var Sender2 = class _Sender {
      /**
       * Creates a Sender instance.
       *
       * @param {Duplex} socket The connection socket
       * @param {Object} [extensions] An object containing the negotiated extensions
       * @param {Function} [generateMask] The function used to generate the masking
       *     key
       */
      constructor(socket, extensions, generateMask) {
        this._extensions = extensions || {};
        if (generateMask) {
          this._generateMask = generateMask;
          this._maskBuffer = Buffer.alloc(4);
        }
        this._socket = socket;
        this._firstFragment = true;
        this._compress = false;
        this._bufferedBytes = 0;
        this._queue = [];
        this._state = DEFAULT;
        this.onerror = NOOP;
        this[kWebSocket] = void 0;
      }
      /**
       * Frames a piece of data according to the HyBi WebSocket protocol.
       *
       * @param {(Buffer|String)} data The data to frame
       * @param {Object} options Options object
       * @param {Boolean} [options.fin=false] Specifies whether or not to set the
       *     FIN bit
       * @param {Function} [options.generateMask] The function used to generate the
       *     masking key
       * @param {Boolean} [options.mask=false] Specifies whether or not to mask
       *     `data`
       * @param {Buffer} [options.maskBuffer] The buffer used to store the masking
       *     key
       * @param {Number} options.opcode The opcode
       * @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
       *     modified
       * @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
       *     RSV1 bit
       * @return {(Buffer|String)[]} The framed data
       * @public
       */
      static frame(data, options) {
        let mask;
        let merge = false;
        let offset = 2;
        let skipMasking = false;
        if (options.mask) {
          mask = options.maskBuffer || maskBuffer;
          if (options.generateMask) {
            options.generateMask(mask);
          } else {
            if (randomPoolPointer === RANDOM_POOL_SIZE) {
              if (randomPool === void 0) {
                randomPool = Buffer.alloc(RANDOM_POOL_SIZE);
              }
              randomFillSync(randomPool, 0, RANDOM_POOL_SIZE);
              randomPoolPointer = 0;
            }
            mask[0] = randomPool[randomPoolPointer++];
            mask[1] = randomPool[randomPoolPointer++];
            mask[2] = randomPool[randomPoolPointer++];
            mask[3] = randomPool[randomPoolPointer++];
          }
          skipMasking = (mask[0] | mask[1] | mask[2] | mask[3]) === 0;
          offset = 6;
        }
        let dataLength;
        if (typeof data === "string") {
          if ((!options.mask || skipMasking) && options[kByteLength] !== void 0) {
            dataLength = options[kByteLength];
          } else {
            data = Buffer.from(data);
            dataLength = data.length;
          }
        } else {
          dataLength = data.length;
          merge = options.mask && options.readOnly && !skipMasking;
        }
        let payloadLength = dataLength;
        if (dataLength >= 65536) {
          offset += 8;
          payloadLength = 127;
        } else if (dataLength > 125) {
          offset += 2;
          payloadLength = 126;
        }
        const target = Buffer.allocUnsafe(merge ? dataLength + offset : offset);
        target[0] = options.fin ? options.opcode | 128 : options.opcode;
        if (options.rsv1)
          target[0] |= 64;
        target[1] = payloadLength;
        if (payloadLength === 126) {
          target.writeUInt16BE(dataLength, 2);
        } else if (payloadLength === 127) {
          target[2] = target[3] = 0;
          target.writeUIntBE(dataLength, 4, 6);
        }
        if (!options.mask)
          return [target, data];
        target[1] |= 128;
        target[offset - 4] = mask[0];
        target[offset - 3] = mask[1];
        target[offset - 2] = mask[2];
        target[offset - 1] = mask[3];
        if (skipMasking)
          return [target, data];
        if (merge) {
          applyMask(data, mask, target, offset, dataLength);
          return [target];
        }
        applyMask(data, mask, data, 0, dataLength);
        return [target, data];
      }
      /**
       * Sends a close message to the other peer.
       *
       * @param {Number} [code] The status code component of the body
       * @param {(String|Buffer)} [data] The message component of the body
       * @param {Boolean} [mask=false] Specifies whether or not to mask the message
       * @param {Function} [cb] Callback
       * @public
       */
      close(code, data, mask, cb) {
        let buf;
        if (code === void 0) {
          buf = EMPTY_BUFFER;
        } else if (typeof code !== "number" || !isValidStatusCode(code)) {
          throw new TypeError("First argument must be a valid error code number");
        } else if (data === void 0 || !data.length) {
          buf = Buffer.allocUnsafe(2);
          buf.writeUInt16BE(code, 0);
        } else {
          const length = Buffer.byteLength(data);
          if (length > 123) {
            throw new RangeError("The message must not be greater than 123 bytes");
          }
          buf = Buffer.allocUnsafe(2 + length);
          buf.writeUInt16BE(code, 0);
          if (typeof data === "string") {
            buf.write(data, 2);
          } else if (isUint8Array(data)) {
            buf.set(data, 2);
          } else {
            throw new TypeError("Second argument must be a string or a Uint8Array");
          }
        }
        const options = {
          [kByteLength]: buf.length,
          fin: true,
          generateMask: this._generateMask,
          mask,
          maskBuffer: this._maskBuffer,
          opcode: 8,
          readOnly: false,
          rsv1: false
        };
        if (this._state !== DEFAULT) {
          this.enqueue([this.dispatch, buf, false, options, cb]);
        } else {
          this.sendFrame(_Sender.frame(buf, options), cb);
        }
      }
      /**
       * Sends a ping message to the other peer.
       *
       * @param {*} data The message to send
       * @param {Boolean} [mask=false] Specifies whether or not to mask `data`
       * @param {Function} [cb] Callback
       * @public
       */
      ping(data, mask, cb) {
        let byteLength;
        let readOnly;
        if (typeof data === "string") {
          byteLength = Buffer.byteLength(data);
          readOnly = false;
        } else if (isBlob(data)) {
          byteLength = data.size;
          readOnly = false;
        } else {
          data = toBuffer(data);
          byteLength = data.length;
          readOnly = toBuffer.readOnly;
        }
        if (byteLength > 125) {
          throw new RangeError("The data size must not be greater than 125 bytes");
        }
        const options = {
          [kByteLength]: byteLength,
          fin: true,
          generateMask: this._generateMask,
          mask,
          maskBuffer: this._maskBuffer,
          opcode: 9,
          readOnly,
          rsv1: false
        };
        if (isBlob(data)) {
          if (this._state !== DEFAULT) {
            this.enqueue([this.getBlobData, data, false, options, cb]);
          } else {
            this.getBlobData(data, false, options, cb);
          }
        } else if (this._state !== DEFAULT) {
          this.enqueue([this.dispatch, data, false, options, cb]);
        } else {
          this.sendFrame(_Sender.frame(data, options), cb);
        }
      }
      /**
       * Sends a pong message to the other peer.
       *
       * @param {*} data The message to send
       * @param {Boolean} [mask=false] Specifies whether or not to mask `data`
       * @param {Function} [cb] Callback
       * @public
       */
      pong(data, mask, cb) {
        let byteLength;
        let readOnly;
        if (typeof data === "string") {
          byteLength = Buffer.byteLength(data);
          readOnly = false;
        } else if (isBlob(data)) {
          byteLength = data.size;
          readOnly = false;
        } else {
          data = toBuffer(data);
          byteLength = data.length;
          readOnly = toBuffer.readOnly;
        }
        if (byteLength > 125) {
          throw new RangeError("The data size must not be greater than 125 bytes");
        }
        const options = {
          [kByteLength]: byteLength,
          fin: true,
          generateMask: this._generateMask,
          mask,
          maskBuffer: this._maskBuffer,
          opcode: 10,
          readOnly,
          rsv1: false
        };
        if (isBlob(data)) {
          if (this._state !== DEFAULT) {
            this.enqueue([this.getBlobData, data, false, options, cb]);
          } else {
            this.getBlobData(data, false, options, cb);
          }
        } else if (this._state !== DEFAULT) {
          this.enqueue([this.dispatch, data, false, options, cb]);
        } else {
          this.sendFrame(_Sender.frame(data, options), cb);
        }
      }
      /**
       * Sends a data message to the other peer.
       *
       * @param {*} data The message to send
       * @param {Object} options Options object
       * @param {Boolean} [options.binary=false] Specifies whether `data` is binary
       *     or text
       * @param {Boolean} [options.compress=false] Specifies whether or not to
       *     compress `data`
       * @param {Boolean} [options.fin=false] Specifies whether the fragment is the
       *     last one
       * @param {Boolean} [options.mask=false] Specifies whether or not to mask
       *     `data`
       * @param {Function} [cb] Callback
       * @public
       */
      send(data, options, cb) {
        const perMessageDeflate = this._extensions[PerMessageDeflate2.extensionName];
        let opcode = options.binary ? 2 : 1;
        let rsv1 = options.compress;
        let byteLength;
        let readOnly;
        if (typeof data === "string") {
          byteLength = Buffer.byteLength(data);
          readOnly = false;
        } else if (isBlob(data)) {
          byteLength = data.size;
          readOnly = false;
        } else {
          data = toBuffer(data);
          byteLength = data.length;
          readOnly = toBuffer.readOnly;
        }
        if (this._firstFragment) {
          this._firstFragment = false;
          if (rsv1 && perMessageDeflate && perMessageDeflate.params[perMessageDeflate._isServer ? "server_no_context_takeover" : "client_no_context_takeover"]) {
            rsv1 = byteLength >= perMessageDeflate._threshold;
          }
          this._compress = rsv1;
        } else {
          rsv1 = false;
          opcode = 0;
        }
        if (options.fin)
          this._firstFragment = true;
        const opts = {
          [kByteLength]: byteLength,
          fin: options.fin,
          generateMask: this._generateMask,
          mask: options.mask,
          maskBuffer: this._maskBuffer,
          opcode,
          readOnly,
          rsv1
        };
        if (isBlob(data)) {
          if (this._state !== DEFAULT) {
            this.enqueue([this.getBlobData, data, this._compress, opts, cb]);
          } else {
            this.getBlobData(data, this._compress, opts, cb);
          }
        } else if (this._state !== DEFAULT) {
          this.enqueue([this.dispatch, data, this._compress, opts, cb]);
        } else {
          this.dispatch(data, this._compress, opts, cb);
        }
      }
      /**
       * Gets the contents of a blob as binary data.
       *
       * @param {Blob} blob The blob
       * @param {Boolean} [compress=false] Specifies whether or not to compress
       *     the data
       * @param {Object} options Options object
       * @param {Boolean} [options.fin=false] Specifies whether or not to set the
       *     FIN bit
       * @param {Function} [options.generateMask] The function used to generate the
       *     masking key
       * @param {Boolean} [options.mask=false] Specifies whether or not to mask
       *     `data`
       * @param {Buffer} [options.maskBuffer] The buffer used to store the masking
       *     key
       * @param {Number} options.opcode The opcode
       * @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
       *     modified
       * @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
       *     RSV1 bit
       * @param {Function} [cb] Callback
       * @private
       */
      getBlobData(blob, compress, options, cb) {
        this._bufferedBytes += options[kByteLength];
        this._state = GET_BLOB_DATA;
        blob.arrayBuffer().then((arrayBuffer) => {
          if (this._socket.destroyed) {
            const err = new Error(
              "The socket was closed while the blob was being read"
            );
            process.nextTick(callCallbacks, this, err, cb);
            return;
          }
          this._bufferedBytes -= options[kByteLength];
          const data = toBuffer(arrayBuffer);
          if (!compress) {
            this._state = DEFAULT;
            this.sendFrame(_Sender.frame(data, options), cb);
            this.dequeue();
          } else {
            this.dispatch(data, compress, options, cb);
          }
        }).catch((err) => {
          process.nextTick(onError, this, err, cb);
        });
      }
      /**
       * Dispatches a message.
       *
       * @param {(Buffer|String)} data The message to send
       * @param {Boolean} [compress=false] Specifies whether or not to compress
       *     `data`
       * @param {Object} options Options object
       * @param {Boolean} [options.fin=false] Specifies whether or not to set the
       *     FIN bit
       * @param {Function} [options.generateMask] The function used to generate the
       *     masking key
       * @param {Boolean} [options.mask=false] Specifies whether or not to mask
       *     `data`
       * @param {Buffer} [options.maskBuffer] The buffer used to store the masking
       *     key
       * @param {Number} options.opcode The opcode
       * @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
       *     modified
       * @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
       *     RSV1 bit
       * @param {Function} [cb] Callback
       * @private
       */
      dispatch(data, compress, options, cb) {
        if (!compress) {
          this.sendFrame(_Sender.frame(data, options), cb);
          return;
        }
        const perMessageDeflate = this._extensions[PerMessageDeflate2.extensionName];
        this._bufferedBytes += options[kByteLength];
        this._state = DEFLATING;
        perMessageDeflate.compress(data, options.fin, (_, buf) => {
          if (this._socket.destroyed) {
            const err = new Error(
              "The socket was closed while data was being compressed"
            );
            callCallbacks(this, err, cb);
            return;
          }
          this._bufferedBytes -= options[kByteLength];
          this._state = DEFAULT;
          options.readOnly = false;
          this.sendFrame(_Sender.frame(buf, options), cb);
          this.dequeue();
        });
      }
      /**
       * Executes queued send operations.
       *
       * @private
       */
      dequeue() {
        while (this._state === DEFAULT && this._queue.length) {
          const params = this._queue.shift();
          this._bufferedBytes -= params[3][kByteLength];
          Reflect.apply(params[0], this, params.slice(1));
        }
      }
      /**
       * Enqueues a send operation.
       *
       * @param {Array} params Send operation parameters.
       * @private
       */
      enqueue(params) {
        this._bufferedBytes += params[3][kByteLength];
        this._queue.push(params);
      }
      /**
       * Sends a frame.
       *
       * @param {(Buffer | String)[]} list The frame to send
       * @param {Function} [cb] Callback
       * @private
       */
      sendFrame(list, cb) {
        if (list.length === 2) {
          this._socket.cork();
          this._socket.write(list[0]);
          this._socket.write(list[1], cb);
          this._socket.uncork();
        } else {
          this._socket.write(list[0], cb);
        }
      }
    };
    module2.exports = Sender2;
    function callCallbacks(sender, err, cb) {
      if (typeof cb === "function")
        cb(err);
      for (let i = 0; i < sender._queue.length; i++) {
        const params = sender._queue[i];
        const callback = params[params.length - 1];
        if (typeof callback === "function")
          callback(err);
      }
    }
    function onError(sender, err, cb) {
      callCallbacks(sender, err, cb);
      sender.onerror(err);
    }
  }
});

// node_modules/ws/lib/event-target.js
var require_event_target = __commonJS({
  "node_modules/ws/lib/event-target.js"(exports2, module2) {
    "use strict";
    var { kForOnEventAttribute, kListener } = require_constants();
    var kCode = Symbol("kCode");
    var kData = Symbol("kData");
    var kError = Symbol("kError");
    var kMessage = Symbol("kMessage");
    var kReason = Symbol("kReason");
    var kTarget = Symbol("kTarget");
    var kType = Symbol("kType");
    var kWasClean = Symbol("kWasClean");
    var Event = class {
      /**
       * Create a new `Event`.
       *
       * @param {String} type The name of the event
       * @throws {TypeError} If the `type` argument is not specified
       */
      constructor(type) {
        this[kTarget] = null;
        this[kType] = type;
      }
      /**
       * @type {*}
       */
      get target() {
        return this[kTarget];
      }
      /**
       * @type {String}
       */
      get type() {
        return this[kType];
      }
    };
    Object.defineProperty(Event.prototype, "target", { enumerable: true });
    Object.defineProperty(Event.prototype, "type", { enumerable: true });
    var CloseEvent = class extends Event {
      /**
       * Create a new `CloseEvent`.
       *
       * @param {String} type The name of the event
       * @param {Object} [options] A dictionary object that allows for setting
       *     attributes via object members of the same name
       * @param {Number} [options.code=0] The status code explaining why the
       *     connection was closed
       * @param {String} [options.reason=''] A human-readable string explaining why
       *     the connection was closed
       * @param {Boolean} [options.wasClean=false] Indicates whether or not the
       *     connection was cleanly closed
       */
      constructor(type, options = {}) {
        super(type);
        this[kCode] = options.code === void 0 ? 0 : options.code;
        this[kReason] = options.reason === void 0 ? "" : options.reason;
        this[kWasClean] = options.wasClean === void 0 ? false : options.wasClean;
      }
      /**
       * @type {Number}
       */
      get code() {
        return this[kCode];
      }
      /**
       * @type {String}
       */
      get reason() {
        return this[kReason];
      }
      /**
       * @type {Boolean}
       */
      get wasClean() {
        return this[kWasClean];
      }
    };
    Object.defineProperty(CloseEvent.prototype, "code", { enumerable: true });
    Object.defineProperty(CloseEvent.prototype, "reason", { enumerable: true });
    Object.defineProperty(CloseEvent.prototype, "wasClean", { enumerable: true });
    var ErrorEvent = class extends Event {
      /**
       * Create a new `ErrorEvent`.
       *
       * @param {String} type The name of the event
       * @param {Object} [options] A dictionary object that allows for setting
       *     attributes via object members of the same name
       * @param {*} [options.error=null] The error that generated this event
       * @param {String} [options.message=''] The error message
       */
      constructor(type, options = {}) {
        super(type);
        this[kError] = options.error === void 0 ? null : options.error;
        this[kMessage] = options.message === void 0 ? "" : options.message;
      }
      /**
       * @type {*}
       */
      get error() {
        return this[kError];
      }
      /**
       * @type {String}
       */
      get message() {
        return this[kMessage];
      }
    };
    Object.defineProperty(ErrorEvent.prototype, "error", { enumerable: true });
    Object.defineProperty(ErrorEvent.prototype, "message", { enumerable: true });
    var MessageEvent = class extends Event {
      /**
       * Create a new `MessageEvent`.
       *
       * @param {String} type The name of the event
       * @param {Object} [options] A dictionary object that allows for setting
       *     attributes via object members of the same name
       * @param {*} [options.data=null] The message content
       */
      constructor(type, options = {}) {
        super(type);
        this[kData] = options.data === void 0 ? null : options.data;
      }
      /**
       * @type {*}
       */
      get data() {
        return this[kData];
      }
    };
    Object.defineProperty(MessageEvent.prototype, "data", { enumerable: true });
    var EventTarget = {
      /**
       * Register an event listener.
       *
       * @param {String} type A string representing the event type to listen for
       * @param {(Function|Object)} handler The listener to add
       * @param {Object} [options] An options object specifies characteristics about
       *     the event listener
       * @param {Boolean} [options.once=false] A `Boolean` indicating that the
       *     listener should be invoked at most once after being added. If `true`,
       *     the listener would be automatically removed when invoked.
       * @public
       */
      addEventListener(type, handler, options = {}) {
        for (const listener of this.listeners(type)) {
          if (!options[kForOnEventAttribute] && listener[kListener] === handler && !listener[kForOnEventAttribute]) {
            return;
          }
        }
        let wrapper;
        if (type === "message") {
          wrapper = function onMessage(data, isBinary) {
            const event = new MessageEvent("message", {
              data: isBinary ? data : data.toString()
            });
            event[kTarget] = this;
            callListener(handler, this, event);
          };
        } else if (type === "close") {
          wrapper = function onClose(code, message) {
            const event = new CloseEvent("close", {
              code,
              reason: message.toString(),
              wasClean: this._closeFrameReceived && this._closeFrameSent
            });
            event[kTarget] = this;
            callListener(handler, this, event);
          };
        } else if (type === "error") {
          wrapper = function onError(error) {
            const event = new ErrorEvent("error", {
              error,
              message: error.message
            });
            event[kTarget] = this;
            callListener(handler, this, event);
          };
        } else if (type === "open") {
          wrapper = function onOpen() {
            const event = new Event("open");
            event[kTarget] = this;
            callListener(handler, this, event);
          };
        } else {
          return;
        }
        wrapper[kForOnEventAttribute] = !!options[kForOnEventAttribute];
        wrapper[kListener] = handler;
        if (options.once) {
          this.once(type, wrapper);
        } else {
          this.on(type, wrapper);
        }
      },
      /**
       * Remove an event listener.
       *
       * @param {String} type A string representing the event type to remove
       * @param {(Function|Object)} handler The listener to remove
       * @public
       */
      removeEventListener(type, handler) {
        for (const listener of this.listeners(type)) {
          if (listener[kListener] === handler && !listener[kForOnEventAttribute]) {
            this.removeListener(type, listener);
            break;
          }
        }
      }
    };
    module2.exports = {
      CloseEvent,
      ErrorEvent,
      Event,
      EventTarget,
      MessageEvent
    };
    function callListener(listener, thisArg, event) {
      if (typeof listener === "object" && listener.handleEvent) {
        listener.handleEvent.call(listener, event);
      } else {
        listener.call(thisArg, event);
      }
    }
  }
});

// node_modules/ws/lib/extension.js
var require_extension = __commonJS({
  "node_modules/ws/lib/extension.js"(exports2, module2) {
    "use strict";
    var { tokenChars } = require_validation();
    function push(dest, name, elem) {
      if (dest[name] === void 0)
        dest[name] = [elem];
      else
        dest[name].push(elem);
    }
    function parse(header) {
      const offers = /* @__PURE__ */ Object.create(null);
      let params = /* @__PURE__ */ Object.create(null);
      let mustUnescape = false;
      let isEscaping = false;
      let inQuotes = false;
      let extensionName;
      let paramName;
      let start = -1;
      let code = -1;
      let end = -1;
      let i = 0;
      for (; i < header.length; i++) {
        code = header.charCodeAt(i);
        if (extensionName === void 0) {
          if (end === -1 && tokenChars[code] === 1) {
            if (start === -1)
              start = i;
          } else if (i !== 0 && (code === 32 || code === 9)) {
            if (end === -1 && start !== -1)
              end = i;
          } else if (code === 59 || code === 44) {
            if (start === -1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
            if (end === -1)
              end = i;
            const name = header.slice(start, end);
            if (code === 44) {
              push(offers, name, params);
              params = /* @__PURE__ */ Object.create(null);
            } else {
              extensionName = name;
            }
            start = end = -1;
          } else {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
        } else if (paramName === void 0) {
          if (end === -1 && tokenChars[code] === 1) {
            if (start === -1)
              start = i;
          } else if (code === 32 || code === 9) {
            if (end === -1 && start !== -1)
              end = i;
          } else if (code === 59 || code === 44) {
            if (start === -1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
            if (end === -1)
              end = i;
            push(params, header.slice(start, end), true);
            if (code === 44) {
              push(offers, extensionName, params);
              params = /* @__PURE__ */ Object.create(null);
              extensionName = void 0;
            }
            start = end = -1;
          } else if (code === 61 && start !== -1 && end === -1) {
            paramName = header.slice(start, i);
            start = end = -1;
          } else {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
        } else {
          if (isEscaping) {
            if (tokenChars[code] !== 1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
            if (start === -1)
              start = i;
            else if (!mustUnescape)
              mustUnescape = true;
            isEscaping = false;
          } else if (inQuotes) {
            if (tokenChars[code] === 1) {
              if (start === -1)
                start = i;
            } else if (code === 34 && start !== -1) {
              inQuotes = false;
              end = i;
            } else if (code === 92) {
              isEscaping = true;
            } else {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
          } else if (code === 34 && header.charCodeAt(i - 1) === 61) {
            inQuotes = true;
          } else if (end === -1 && tokenChars[code] === 1) {
            if (start === -1)
              start = i;
          } else if (start !== -1 && (code === 32 || code === 9)) {
            if (end === -1)
              end = i;
          } else if (code === 59 || code === 44) {
            if (start === -1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
            if (end === -1)
              end = i;
            let value = header.slice(start, end);
            if (mustUnescape) {
              value = value.replace(/\\/g, "");
              mustUnescape = false;
            }
            push(params, paramName, value);
            if (code === 44) {
              push(offers, extensionName, params);
              params = /* @__PURE__ */ Object.create(null);
              extensionName = void 0;
            }
            paramName = void 0;
            start = end = -1;
          } else {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
        }
      }
      if (start === -1 || inQuotes || code === 32 || code === 9) {
        throw new SyntaxError("Unexpected end of input");
      }
      if (end === -1)
        end = i;
      const token = header.slice(start, end);
      if (extensionName === void 0) {
        push(offers, token, params);
      } else {
        if (paramName === void 0) {
          push(params, token, true);
        } else if (mustUnescape) {
          push(params, paramName, token.replace(/\\/g, ""));
        } else {
          push(params, paramName, token);
        }
        push(offers, extensionName, params);
      }
      return offers;
    }
    function format(extensions) {
      return Object.keys(extensions).map((extension2) => {
        let configurations = extensions[extension2];
        if (!Array.isArray(configurations))
          configurations = [configurations];
        return configurations.map((params) => {
          return [extension2].concat(
            Object.keys(params).map((k) => {
              let values = params[k];
              if (!Array.isArray(values))
                values = [values];
              return values.map((v) => v === true ? k : `${k}=${v}`).join("; ");
            })
          ).join("; ");
        }).join(", ");
      }).join(", ");
    }
    module2.exports = { format, parse };
  }
});

// node_modules/ws/lib/websocket.js
var require_websocket = __commonJS({
  "node_modules/ws/lib/websocket.js"(exports2, module2) {
    "use strict";
    var EventEmitter2 = require("events");
    var https = require("https");
    var http = require("http");
    var net = require("net");
    var tls = require("tls");
    var { randomBytes: randomBytes2, createHash: createHash2 } = require("crypto");
    var { Duplex, Readable } = require("stream");
    var { URL } = require("url");
    var PerMessageDeflate2 = require_permessage_deflate();
    var Receiver2 = require_receiver();
    var Sender2 = require_sender();
    var { isBlob } = require_validation();
    var {
      BINARY_TYPES,
      CLOSE_TIMEOUT,
      EMPTY_BUFFER,
      GUID,
      kForOnEventAttribute,
      kListener,
      kStatusCode,
      kWebSocket,
      NOOP
    } = require_constants();
    var {
      EventTarget: { addEventListener, removeEventListener }
    } = require_event_target();
    var { format, parse } = require_extension();
    var { toBuffer } = require_buffer_util();
    var kAborted = Symbol("kAborted");
    var protocolVersions = [8, 13];
    var readyStates = ["CONNECTING", "OPEN", "CLOSING", "CLOSED"];
    var subprotocolRegex = /^[!#$%&'*+\-.0-9A-Z^_`|a-z~]+$/;
    var WebSocket2 = class _WebSocket extends EventEmitter2 {
      /**
       * Create a new `WebSocket`.
       *
       * @param {(String|URL)} address The URL to which to connect
       * @param {(String|String[])} [protocols] The subprotocols
       * @param {Object} [options] Connection options
       */
      constructor(address, protocols, options) {
        super();
        this._binaryType = BINARY_TYPES[0];
        this._closeCode = 1006;
        this._closeFrameReceived = false;
        this._closeFrameSent = false;
        this._closeMessage = EMPTY_BUFFER;
        this._closeTimer = null;
        this._errorEmitted = false;
        this._extensions = {};
        this._paused = false;
        this._protocol = "";
        this._readyState = _WebSocket.CONNECTING;
        this._receiver = null;
        this._sender = null;
        this._socket = null;
        if (address !== null) {
          this._bufferedAmount = 0;
          this._isServer = false;
          this._redirects = 0;
          if (protocols === void 0) {
            protocols = [];
          } else if (!Array.isArray(protocols)) {
            if (typeof protocols === "object" && protocols !== null) {
              options = protocols;
              protocols = [];
            } else {
              protocols = [protocols];
            }
          }
          initAsClient(this, address, protocols, options);
        } else {
          this._autoPong = options.autoPong;
          this._closeTimeout = options.closeTimeout;
          this._isServer = true;
        }
      }
      /**
       * For historical reasons, the custom "nodebuffer" type is used by the default
       * instead of "blob".
       *
       * @type {String}
       */
      get binaryType() {
        return this._binaryType;
      }
      set binaryType(type) {
        if (!BINARY_TYPES.includes(type))
          return;
        this._binaryType = type;
        if (this._receiver)
          this._receiver._binaryType = type;
      }
      /**
       * @type {Number}
       */
      get bufferedAmount() {
        if (!this._socket)
          return this._bufferedAmount;
        return this._socket._writableState.length + this._sender._bufferedBytes;
      }
      /**
       * @type {String}
       */
      get extensions() {
        return Object.keys(this._extensions).join();
      }
      /**
       * @type {Boolean}
       */
      get isPaused() {
        return this._paused;
      }
      /**
       * @type {Function}
       */
      /* istanbul ignore next */
      get onclose() {
        return null;
      }
      /**
       * @type {Function}
       */
      /* istanbul ignore next */
      get onerror() {
        return null;
      }
      /**
       * @type {Function}
       */
      /* istanbul ignore next */
      get onopen() {
        return null;
      }
      /**
       * @type {Function}
       */
      /* istanbul ignore next */
      get onmessage() {
        return null;
      }
      /**
       * @type {String}
       */
      get protocol() {
        return this._protocol;
      }
      /**
       * @type {Number}
       */
      get readyState() {
        return this._readyState;
      }
      /**
       * @type {String}
       */
      get url() {
        return this._url;
      }
      /**
       * Set up the socket and the internal resources.
       *
       * @param {Duplex} socket The network socket between the server and client
       * @param {Buffer} head The first packet of the upgraded stream
       * @param {Object} options Options object
       * @param {Boolean} [options.allowSynchronousEvents=false] Specifies whether
       *     any of the `'message'`, `'ping'`, and `'pong'` events can be emitted
       *     multiple times in the same tick
       * @param {Function} [options.generateMask] The function used to generate the
       *     masking key
       * @param {Number} [options.maxBufferedChunks=0] The maximum number of
       *     buffered data chunks
       * @param {Number} [options.maxFragments=0] The maximum number of message
       *     fragments
       * @param {Number} [options.maxPayload=0] The maximum allowed message size
       * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
       *     not to skip UTF-8 validation for text and close messages
       * @private
       */
      setSocket(socket, head, options) {
        const receiver = new Receiver2({
          allowSynchronousEvents: options.allowSynchronousEvents,
          binaryType: this.binaryType,
          extensions: this._extensions,
          isServer: this._isServer,
          maxBufferedChunks: options.maxBufferedChunks,
          maxFragments: options.maxFragments,
          maxPayload: options.maxPayload,
          skipUTF8Validation: options.skipUTF8Validation
        });
        const sender = new Sender2(socket, this._extensions, options.generateMask);
        this._receiver = receiver;
        this._sender = sender;
        this._socket = socket;
        receiver[kWebSocket] = this;
        sender[kWebSocket] = this;
        socket[kWebSocket] = this;
        receiver.on("conclude", receiverOnConclude);
        receiver.on("drain", receiverOnDrain);
        receiver.on("error", receiverOnError);
        receiver.on("message", receiverOnMessage);
        receiver.on("ping", receiverOnPing);
        receiver.on("pong", receiverOnPong);
        sender.onerror = senderOnError;
        if (socket.setTimeout)
          socket.setTimeout(0);
        if (socket.setNoDelay)
          socket.setNoDelay();
        if (head.length > 0)
          socket.unshift(head);
        socket.on("close", socketOnClose);
        socket.on("data", socketOnData);
        socket.on("end", socketOnEnd);
        socket.on("error", socketOnError);
        this._readyState = _WebSocket.OPEN;
        this.emit("open");
      }
      /**
       * Emit the `'close'` event.
       *
       * @private
       */
      emitClose() {
        if (!this._socket) {
          this._readyState = _WebSocket.CLOSED;
          this.emit("close", this._closeCode, this._closeMessage);
          return;
        }
        if (this._extensions[PerMessageDeflate2.extensionName]) {
          this._extensions[PerMessageDeflate2.extensionName].cleanup();
        }
        this._receiver.removeAllListeners();
        this._readyState = _WebSocket.CLOSED;
        this.emit("close", this._closeCode, this._closeMessage);
      }
      /**
       * Start a closing handshake.
       *
       *          +----------+   +-----------+   +----------+
       *     - - -|ws.close()|-->|close frame|-->|ws.close()|- - -
       *    |     +----------+   +-----------+   +----------+     |
       *          +----------+   +-----------+         |
       * CLOSING  |ws.close()|<--|close frame|<--+-----+       CLOSING
       *          +----------+   +-----------+   |
       *    |           |                        |   +---+        |
       *                +------------------------+-->|fin| - - - -
       *    |         +---+                      |   +---+
       *     - - - - -|fin|<---------------------+
       *              +---+
       *
       * @param {Number} [code] Status code explaining why the connection is closing
       * @param {(String|Buffer)} [data] The reason why the connection is
       *     closing
       * @public
       */
      close(code, data) {
        if (this.readyState === _WebSocket.CLOSED)
          return;
        if (this.readyState === _WebSocket.CONNECTING) {
          const msg = "WebSocket was closed before the connection was established";
          abortHandshake(this, this._req, msg);
          return;
        }
        if (this.readyState === _WebSocket.CLOSING) {
          if (this._closeFrameSent && (this._closeFrameReceived || this._receiver._writableState.errorEmitted)) {
            this._socket.end();
          }
          return;
        }
        this._readyState = _WebSocket.CLOSING;
        this._sender.close(code, data, !this._isServer, (err) => {
          if (err)
            return;
          this._closeFrameSent = true;
          if (this._closeFrameReceived || this._receiver._writableState.errorEmitted) {
            this._socket.end();
          }
        });
        setCloseTimer(this);
      }
      /**
       * Pause the socket.
       *
       * @public
       */
      pause() {
        if (this.readyState === _WebSocket.CONNECTING || this.readyState === _WebSocket.CLOSED) {
          return;
        }
        this._paused = true;
        this._socket.pause();
      }
      /**
       * Send a ping.
       *
       * @param {*} [data] The data to send
       * @param {Boolean} [mask] Indicates whether or not to mask `data`
       * @param {Function} [cb] Callback which is executed when the ping is sent
       * @public
       */
      ping(data, mask, cb) {
        if (this.readyState === _WebSocket.CONNECTING) {
          throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
        }
        if (typeof data === "function") {
          cb = data;
          data = mask = void 0;
        } else if (typeof mask === "function") {
          cb = mask;
          mask = void 0;
        }
        if (typeof data === "number")
          data = data.toString();
        if (this.readyState !== _WebSocket.OPEN) {
          sendAfterClose(this, data, cb);
          return;
        }
        if (mask === void 0)
          mask = !this._isServer;
        this._sender.ping(data || EMPTY_BUFFER, mask, cb);
      }
      /**
       * Send a pong.
       *
       * @param {*} [data] The data to send
       * @param {Boolean} [mask] Indicates whether or not to mask `data`
       * @param {Function} [cb] Callback which is executed when the pong is sent
       * @public
       */
      pong(data, mask, cb) {
        if (this.readyState === _WebSocket.CONNECTING) {
          throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
        }
        if (typeof data === "function") {
          cb = data;
          data = mask = void 0;
        } else if (typeof mask === "function") {
          cb = mask;
          mask = void 0;
        }
        if (typeof data === "number")
          data = data.toString();
        if (this.readyState !== _WebSocket.OPEN) {
          sendAfterClose(this, data, cb);
          return;
        }
        if (mask === void 0)
          mask = !this._isServer;
        this._sender.pong(data || EMPTY_BUFFER, mask, cb);
      }
      /**
       * Resume the socket.
       *
       * @public
       */
      resume() {
        if (this.readyState === _WebSocket.CONNECTING || this.readyState === _WebSocket.CLOSED) {
          return;
        }
        this._paused = false;
        if (!this._receiver._writableState.needDrain)
          this._socket.resume();
      }
      /**
       * Send a data message.
       *
       * @param {*} data The message to send
       * @param {Object} [options] Options object
       * @param {Boolean} [options.binary] Specifies whether `data` is binary or
       *     text
       * @param {Boolean} [options.compress] Specifies whether or not to compress
       *     `data`
       * @param {Boolean} [options.fin=true] Specifies whether the fragment is the
       *     last one
       * @param {Boolean} [options.mask] Specifies whether or not to mask `data`
       * @param {Function} [cb] Callback which is executed when data is written out
       * @public
       */
      send(data, options, cb) {
        if (this.readyState === _WebSocket.CONNECTING) {
          throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
        }
        if (typeof options === "function") {
          cb = options;
          options = {};
        }
        if (typeof data === "number")
          data = data.toString();
        if (this.readyState !== _WebSocket.OPEN) {
          sendAfterClose(this, data, cb);
          return;
        }
        const opts = {
          binary: typeof data !== "string",
          mask: !this._isServer,
          compress: true,
          fin: true,
          ...options
        };
        if (!this._extensions[PerMessageDeflate2.extensionName]) {
          opts.compress = false;
        }
        this._sender.send(data || EMPTY_BUFFER, opts, cb);
      }
      /**
       * Forcibly close the connection.
       *
       * @public
       */
      terminate() {
        if (this.readyState === _WebSocket.CLOSED)
          return;
        if (this.readyState === _WebSocket.CONNECTING) {
          const msg = "WebSocket was closed before the connection was established";
          abortHandshake(this, this._req, msg);
          return;
        }
        if (this._socket) {
          this._readyState = _WebSocket.CLOSING;
          this._socket.destroy();
        }
      }
    };
    Object.defineProperty(WebSocket2, "CONNECTING", {
      enumerable: true,
      value: readyStates.indexOf("CONNECTING")
    });
    Object.defineProperty(WebSocket2.prototype, "CONNECTING", {
      enumerable: true,
      value: readyStates.indexOf("CONNECTING")
    });
    Object.defineProperty(WebSocket2, "OPEN", {
      enumerable: true,
      value: readyStates.indexOf("OPEN")
    });
    Object.defineProperty(WebSocket2.prototype, "OPEN", {
      enumerable: true,
      value: readyStates.indexOf("OPEN")
    });
    Object.defineProperty(WebSocket2, "CLOSING", {
      enumerable: true,
      value: readyStates.indexOf("CLOSING")
    });
    Object.defineProperty(WebSocket2.prototype, "CLOSING", {
      enumerable: true,
      value: readyStates.indexOf("CLOSING")
    });
    Object.defineProperty(WebSocket2, "CLOSED", {
      enumerable: true,
      value: readyStates.indexOf("CLOSED")
    });
    Object.defineProperty(WebSocket2.prototype, "CLOSED", {
      enumerable: true,
      value: readyStates.indexOf("CLOSED")
    });
    [
      "binaryType",
      "bufferedAmount",
      "extensions",
      "isPaused",
      "protocol",
      "readyState",
      "url"
    ].forEach((property) => {
      Object.defineProperty(WebSocket2.prototype, property, { enumerable: true });
    });
    ["open", "error", "close", "message"].forEach((method) => {
      Object.defineProperty(WebSocket2.prototype, `on${method}`, {
        enumerable: true,
        get() {
          for (const listener of this.listeners(method)) {
            if (listener[kForOnEventAttribute])
              return listener[kListener];
          }
          return null;
        },
        set(handler) {
          for (const listener of this.listeners(method)) {
            if (listener[kForOnEventAttribute]) {
              this.removeListener(method, listener);
              break;
            }
          }
          if (typeof handler !== "function")
            return;
          this.addEventListener(method, handler, {
            [kForOnEventAttribute]: true
          });
        }
      });
    });
    WebSocket2.prototype.addEventListener = addEventListener;
    WebSocket2.prototype.removeEventListener = removeEventListener;
    module2.exports = WebSocket2;
    function initAsClient(websocket, address, protocols, options) {
      const opts = {
        allowSynchronousEvents: true,
        autoPong: true,
        closeTimeout: CLOSE_TIMEOUT,
        protocolVersion: protocolVersions[1],
        maxBufferedChunks: 256 * 1024,
        maxFragments: 16 * 1024,
        maxPayload: 100 * 1024 * 1024,
        skipUTF8Validation: false,
        perMessageDeflate: true,
        followRedirects: false,
        maxRedirects: 10,
        ...options,
        socketPath: void 0,
        hostname: void 0,
        protocol: void 0,
        timeout: void 0,
        method: "GET",
        host: void 0,
        path: void 0,
        port: void 0
      };
      websocket._autoPong = opts.autoPong;
      websocket._closeTimeout = opts.closeTimeout;
      if (!protocolVersions.includes(opts.protocolVersion)) {
        throw new RangeError(
          `Unsupported protocol version: ${opts.protocolVersion} (supported versions: ${protocolVersions.join(", ")})`
        );
      }
      let parsedUrl;
      if (address instanceof URL) {
        parsedUrl = address;
      } else {
        try {
          parsedUrl = new URL(address);
        } catch {
          throw new SyntaxError(`Invalid URL: ${address}`);
        }
      }
      if (parsedUrl.protocol === "http:") {
        parsedUrl.protocol = "ws:";
      } else if (parsedUrl.protocol === "https:") {
        parsedUrl.protocol = "wss:";
      }
      websocket._url = parsedUrl.href;
      const isSecure = parsedUrl.protocol === "wss:";
      const isIpcUrl = parsedUrl.protocol === "ws+unix:";
      let invalidUrlMessage;
      if (parsedUrl.protocol !== "ws:" && !isSecure && !isIpcUrl) {
        invalidUrlMessage = `The URL's protocol must be one of "ws:", "wss:", "http:", "https:", or "ws+unix:"`;
      } else if (isIpcUrl && !parsedUrl.pathname) {
        invalidUrlMessage = "The URL's pathname is empty";
      } else if (parsedUrl.hash) {
        invalidUrlMessage = "The URL contains a fragment identifier";
      }
      if (invalidUrlMessage) {
        const err = new SyntaxError(invalidUrlMessage);
        if (websocket._redirects === 0) {
          throw err;
        } else {
          emitErrorAndClose(websocket, err);
          return;
        }
      }
      const defaultPort = isSecure ? 443 : 80;
      const key = randomBytes2(16).toString("base64");
      const request = isSecure ? https.request : http.request;
      const protocolSet = /* @__PURE__ */ new Set();
      let perMessageDeflate;
      opts.createConnection = opts.createConnection || (isSecure ? tlsConnect : netConnect);
      opts.defaultPort = opts.defaultPort || defaultPort;
      opts.port = parsedUrl.port || defaultPort;
      opts.host = parsedUrl.hostname.startsWith("[") ? parsedUrl.hostname.slice(1, -1) : parsedUrl.hostname;
      opts.headers = {
        ...opts.headers,
        "Sec-WebSocket-Version": opts.protocolVersion,
        "Sec-WebSocket-Key": key,
        Connection: "Upgrade",
        Upgrade: "websocket"
      };
      opts.path = parsedUrl.pathname + parsedUrl.search;
      opts.timeout = opts.handshakeTimeout;
      if (opts.perMessageDeflate) {
        perMessageDeflate = new PerMessageDeflate2({
          ...opts.perMessageDeflate,
          isServer: false,
          maxPayload: opts.maxPayload
        });
        opts.headers["Sec-WebSocket-Extensions"] = format({
          [PerMessageDeflate2.extensionName]: perMessageDeflate.offer()
        });
      }
      if (protocols.length) {
        for (const protocol of protocols) {
          if (typeof protocol !== "string" || !subprotocolRegex.test(protocol) || protocolSet.has(protocol)) {
            throw new SyntaxError(
              "An invalid or duplicated subprotocol was specified"
            );
          }
          protocolSet.add(protocol);
        }
        opts.headers["Sec-WebSocket-Protocol"] = protocols.join(",");
      }
      if (opts.origin) {
        if (opts.protocolVersion < 13) {
          opts.headers["Sec-WebSocket-Origin"] = opts.origin;
        } else {
          opts.headers.Origin = opts.origin;
        }
      }
      if (parsedUrl.username || parsedUrl.password) {
        opts.auth = `${parsedUrl.username}:${parsedUrl.password}`;
      }
      if (isIpcUrl) {
        const parts = opts.path.split(":");
        opts.socketPath = parts[0];
        opts.path = parts[1];
      }
      let req;
      if (opts.followRedirects) {
        if (websocket._redirects === 0) {
          websocket._originalIpc = isIpcUrl;
          websocket._originalSecure = isSecure;
          websocket._originalHostOrSocketPath = isIpcUrl ? opts.socketPath : parsedUrl.host;
          const headers = options && options.headers;
          options = { ...options, headers: {} };
          if (headers) {
            for (const [key2, value] of Object.entries(headers)) {
              options.headers[key2.toLowerCase()] = value;
            }
          }
        } else if (websocket.listenerCount("redirect") === 0) {
          const isSameHost = isIpcUrl ? websocket._originalIpc ? opts.socketPath === websocket._originalHostOrSocketPath : false : websocket._originalIpc ? false : parsedUrl.host === websocket._originalHostOrSocketPath;
          if (!isSameHost || websocket._originalSecure && !isSecure) {
            delete opts.headers.authorization;
            delete opts.headers.cookie;
            if (!isSameHost)
              delete opts.headers.host;
            opts.auth = void 0;
          }
        }
        if (opts.auth && !options.headers.authorization) {
          options.headers.authorization = "Basic " + Buffer.from(opts.auth).toString("base64");
        }
        req = websocket._req = request(opts);
        if (websocket._redirects) {
          websocket.emit("redirect", websocket.url, req);
        }
      } else {
        req = websocket._req = request(opts);
      }
      if (opts.timeout) {
        req.on("timeout", () => {
          abortHandshake(websocket, req, "Opening handshake has timed out");
        });
      }
      req.on("error", (err) => {
        if (req === null || req[kAborted])
          return;
        req = websocket._req = null;
        emitErrorAndClose(websocket, err);
      });
      req.on("response", (res) => {
        const location = res.headers.location;
        const statusCode = res.statusCode;
        if (location && opts.followRedirects && statusCode >= 300 && statusCode < 400) {
          if (++websocket._redirects > opts.maxRedirects) {
            abortHandshake(websocket, req, "Maximum redirects exceeded");
            return;
          }
          req.abort();
          let addr;
          try {
            addr = new URL(location, address);
          } catch (e) {
            const err = new SyntaxError(`Invalid URL: ${location}`);
            emitErrorAndClose(websocket, err);
            return;
          }
          initAsClient(websocket, addr, protocols, options);
        } else if (!websocket.emit("unexpected-response", req, res)) {
          abortHandshake(
            websocket,
            req,
            `Unexpected server response: ${res.statusCode}`
          );
        }
      });
      req.on("upgrade", (res, socket, head) => {
        websocket.emit("upgrade", res);
        if (websocket.readyState !== WebSocket2.CONNECTING)
          return;
        req = websocket._req = null;
        const upgrade = res.headers.upgrade;
        if (upgrade === void 0 || upgrade.toLowerCase() !== "websocket") {
          abortHandshake(websocket, socket, "Invalid Upgrade header");
          return;
        }
        const digest = createHash2("sha1").update(key + GUID).digest("base64");
        if (res.headers["sec-websocket-accept"] !== digest) {
          abortHandshake(websocket, socket, "Invalid Sec-WebSocket-Accept header");
          return;
        }
        const serverProt = res.headers["sec-websocket-protocol"];
        let protError;
        if (serverProt !== void 0) {
          if (!protocolSet.size) {
            protError = "Server sent a subprotocol but none was requested";
          } else if (!protocolSet.has(serverProt)) {
            protError = "Server sent an invalid subprotocol";
          }
        } else if (protocolSet.size) {
          protError = "Server sent no subprotocol";
        }
        if (protError) {
          abortHandshake(websocket, socket, protError);
          return;
        }
        if (serverProt)
          websocket._protocol = serverProt;
        const secWebSocketExtensions = res.headers["sec-websocket-extensions"];
        if (secWebSocketExtensions !== void 0) {
          if (!perMessageDeflate) {
            const message = "Server sent a Sec-WebSocket-Extensions header but no extension was requested";
            abortHandshake(websocket, socket, message);
            return;
          }
          let extensions;
          try {
            extensions = parse(secWebSocketExtensions);
          } catch (err) {
            const message = "Invalid Sec-WebSocket-Extensions header";
            abortHandshake(websocket, socket, message);
            return;
          }
          const extensionNames = Object.keys(extensions);
          if (extensionNames.length !== 1 || extensionNames[0] !== PerMessageDeflate2.extensionName) {
            const message = "Server indicated an extension that was not requested";
            abortHandshake(websocket, socket, message);
            return;
          }
          try {
            perMessageDeflate.accept(extensions[PerMessageDeflate2.extensionName]);
          } catch (err) {
            const message = "Invalid Sec-WebSocket-Extensions header";
            abortHandshake(websocket, socket, message);
            return;
          }
          websocket._extensions[PerMessageDeflate2.extensionName] = perMessageDeflate;
        }
        websocket.setSocket(socket, head, {
          allowSynchronousEvents: opts.allowSynchronousEvents,
          generateMask: opts.generateMask,
          maxBufferedChunks: opts.maxBufferedChunks,
          maxFragments: opts.maxFragments,
          maxPayload: opts.maxPayload,
          skipUTF8Validation: opts.skipUTF8Validation
        });
      });
      if (opts.finishRequest) {
        opts.finishRequest(req, websocket);
      } else {
        req.end();
      }
    }
    function emitErrorAndClose(websocket, err) {
      websocket._readyState = WebSocket2.CLOSING;
      websocket._errorEmitted = true;
      websocket.emit("error", err);
      websocket.emitClose();
    }
    function netConnect(options) {
      options.path = options.socketPath;
      return net.connect(options);
    }
    function tlsConnect(options) {
      options.path = void 0;
      if (!options.servername && options.servername !== "") {
        options.servername = net.isIP(options.host) ? "" : options.host;
      }
      return tls.connect(options);
    }
    function abortHandshake(websocket, stream, message) {
      websocket._readyState = WebSocket2.CLOSING;
      const err = new Error(message);
      Error.captureStackTrace(err, abortHandshake);
      if (stream.setHeader) {
        stream[kAborted] = true;
        stream.abort();
        if (stream.socket && !stream.socket.destroyed) {
          stream.socket.destroy();
        }
        process.nextTick(emitErrorAndClose, websocket, err);
      } else {
        stream.destroy(err);
        stream.once("error", websocket.emit.bind(websocket, "error"));
        stream.once("close", websocket.emitClose.bind(websocket));
      }
    }
    function sendAfterClose(websocket, data, cb) {
      if (data) {
        const length = isBlob(data) ? data.size : toBuffer(data).length;
        if (websocket._socket)
          websocket._sender._bufferedBytes += length;
        else
          websocket._bufferedAmount += length;
      }
      if (cb) {
        const err = new Error(
          `WebSocket is not open: readyState ${websocket.readyState} (${readyStates[websocket.readyState]})`
        );
        process.nextTick(cb, err);
      }
    }
    function receiverOnConclude(code, reason) {
      const websocket = this[kWebSocket];
      websocket._closeFrameReceived = true;
      websocket._closeMessage = reason;
      websocket._closeCode = code;
      if (websocket._socket[kWebSocket] === void 0)
        return;
      websocket._socket.removeListener("data", socketOnData);
      process.nextTick(resume, websocket._socket);
      if (code === 1005)
        websocket.close();
      else
        websocket.close(code, reason);
    }
    function receiverOnDrain() {
      const websocket = this[kWebSocket];
      if (!websocket.isPaused)
        websocket._socket.resume();
    }
    function receiverOnError(err) {
      const websocket = this[kWebSocket];
      if (websocket._socket[kWebSocket] !== void 0) {
        websocket._socket.removeListener("data", socketOnData);
        process.nextTick(resume, websocket._socket);
        websocket.close(err[kStatusCode]);
      }
      if (!websocket._errorEmitted) {
        websocket._errorEmitted = true;
        websocket.emit("error", err);
      }
    }
    function receiverOnFinish() {
      this[kWebSocket].emitClose();
    }
    function receiverOnMessage(data, isBinary) {
      this[kWebSocket].emit("message", data, isBinary);
    }
    function receiverOnPing(data) {
      const websocket = this[kWebSocket];
      if (websocket._autoPong)
        websocket.pong(data, !this._isServer, NOOP);
      websocket.emit("ping", data);
    }
    function receiverOnPong(data) {
      this[kWebSocket].emit("pong", data);
    }
    function resume(stream) {
      stream.resume();
    }
    function senderOnError(err) {
      const websocket = this[kWebSocket];
      if (websocket.readyState === WebSocket2.CLOSED)
        return;
      if (websocket.readyState === WebSocket2.OPEN) {
        websocket._readyState = WebSocket2.CLOSING;
        setCloseTimer(websocket);
      }
      this._socket.end();
      if (!websocket._errorEmitted) {
        websocket._errorEmitted = true;
        websocket.emit("error", err);
      }
    }
    function setCloseTimer(websocket) {
      websocket._closeTimer = setTimeout(
        websocket._socket.destroy.bind(websocket._socket),
        websocket._closeTimeout
      );
    }
    function socketOnClose() {
      const websocket = this[kWebSocket];
      this.removeListener("close", socketOnClose);
      this.removeListener("data", socketOnData);
      this.removeListener("end", socketOnEnd);
      websocket._readyState = WebSocket2.CLOSING;
      if (!this._readableState.endEmitted && !websocket._closeFrameReceived && !websocket._receiver._writableState.errorEmitted && this._readableState.length !== 0) {
        const chunk = this.read(this._readableState.length);
        websocket._receiver.write(chunk);
      }
      websocket._receiver.end();
      this[kWebSocket] = void 0;
      clearTimeout(websocket._closeTimer);
      if (websocket._receiver._writableState.finished || websocket._receiver._writableState.errorEmitted) {
        websocket.emitClose();
      } else {
        websocket._receiver.on("error", receiverOnFinish);
        websocket._receiver.on("finish", receiverOnFinish);
      }
    }
    function socketOnData(chunk) {
      if (!this[kWebSocket]._receiver.write(chunk)) {
        this.pause();
      }
    }
    function socketOnEnd() {
      const websocket = this[kWebSocket];
      websocket._readyState = WebSocket2.CLOSING;
      websocket._receiver.end();
      this.end();
    }
    function socketOnError() {
      const websocket = this[kWebSocket];
      this.removeListener("error", socketOnError);
      this.on("error", NOOP);
      if (websocket) {
        websocket._readyState = WebSocket2.CLOSING;
        this.destroy();
      }
    }
  }
});

// node_modules/ws/lib/stream.js
var require_stream = __commonJS({
  "node_modules/ws/lib/stream.js"(exports2, module2) {
    "use strict";
    var WebSocket2 = require_websocket();
    var { Duplex } = require("stream");
    function emitClose(stream) {
      stream.emit("close");
    }
    function duplexOnEnd() {
      if (!this.destroyed && this._writableState.finished) {
        this.destroy();
      }
    }
    function duplexOnError(err) {
      this.removeListener("error", duplexOnError);
      this.destroy();
      if (this.listenerCount("error") === 0) {
        this.emit("error", err);
      }
    }
    function createWebSocketStream2(ws, options) {
      let terminateOnDestroy = true;
      const duplex = new Duplex({
        ...options,
        autoDestroy: false,
        emitClose: false,
        objectMode: false,
        writableObjectMode: false
      });
      ws.on("message", function message(msg, isBinary) {
        const data = !isBinary && duplex._readableState.objectMode ? msg.toString() : msg;
        if (!duplex.push(data))
          ws.pause();
      });
      ws.once("error", function error(err) {
        if (duplex.destroyed)
          return;
        terminateOnDestroy = false;
        duplex.destroy(err);
      });
      ws.once("close", function close() {
        if (duplex.destroyed)
          return;
        duplex.push(null);
      });
      duplex._destroy = function(err, callback) {
        if (ws.readyState === ws.CLOSED) {
          callback(err);
          process.nextTick(emitClose, duplex);
          return;
        }
        let called = false;
        ws.once("error", function error(err2) {
          called = true;
          callback(err2);
        });
        ws.once("close", function close() {
          if (!called)
            callback(err);
          process.nextTick(emitClose, duplex);
        });
        if (terminateOnDestroy)
          ws.terminate();
      };
      duplex._final = function(callback) {
        if (ws.readyState === ws.CONNECTING) {
          ws.once("open", function open() {
            duplex._final(callback);
          });
          return;
        }
        if (ws._socket === null)
          return;
        if (ws._socket._writableState.finished) {
          callback();
          if (duplex._readableState.endEmitted)
            duplex.destroy();
        } else {
          ws._socket.once("finish", function finish() {
            callback();
          });
          ws.close();
        }
      };
      duplex._read = function() {
        if (ws.isPaused)
          ws.resume();
      };
      duplex._write = function(chunk, encoding, callback) {
        if (ws.readyState === ws.CONNECTING) {
          ws.once("open", function open() {
            duplex._write(chunk, encoding, callback);
          });
          return;
        }
        ws.send(chunk, callback);
      };
      duplex.on("end", duplexOnEnd);
      duplex.on("error", duplexOnError);
      return duplex;
    }
    module2.exports = createWebSocketStream2;
  }
});

// node_modules/ws/lib/subprotocol.js
var require_subprotocol = __commonJS({
  "node_modules/ws/lib/subprotocol.js"(exports2, module2) {
    "use strict";
    var { tokenChars } = require_validation();
    function parse(header) {
      const protocols = /* @__PURE__ */ new Set();
      let start = -1;
      let end = -1;
      let i = 0;
      for (i; i < header.length; i++) {
        const code = header.charCodeAt(i);
        if (end === -1 && tokenChars[code] === 1) {
          if (start === -1)
            start = i;
        } else if (i !== 0 && (code === 32 || code === 9)) {
          if (end === -1 && start !== -1)
            end = i;
        } else if (code === 44) {
          if (start === -1) {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
          if (end === -1)
            end = i;
          const protocol2 = header.slice(start, end);
          if (protocols.has(protocol2)) {
            throw new SyntaxError(`The "${protocol2}" subprotocol is duplicated`);
          }
          protocols.add(protocol2);
          start = end = -1;
        } else {
          throw new SyntaxError(`Unexpected character at index ${i}`);
        }
      }
      if (start === -1 || end !== -1) {
        throw new SyntaxError("Unexpected end of input");
      }
      const protocol = header.slice(start, i);
      if (protocols.has(protocol)) {
        throw new SyntaxError(`The "${protocol}" subprotocol is duplicated`);
      }
      protocols.add(protocol);
      return protocols;
    }
    module2.exports = { parse };
  }
});

// node_modules/ws/lib/websocket-server.js
var require_websocket_server = __commonJS({
  "node_modules/ws/lib/websocket-server.js"(exports2, module2) {
    "use strict";
    var EventEmitter2 = require("events");
    var http = require("http");
    var { Duplex } = require("stream");
    var { createHash: createHash2 } = require("crypto");
    var extension2 = require_extension();
    var PerMessageDeflate2 = require_permessage_deflate();
    var subprotocol2 = require_subprotocol();
    var WebSocket2 = require_websocket();
    var { CLOSE_TIMEOUT, GUID, kWebSocket } = require_constants();
    var keyRegex = /^[+/0-9A-Za-z]{22}==$/;
    var RUNNING = 0;
    var CLOSING = 1;
    var CLOSED = 2;
    var WebSocketServer2 = class extends EventEmitter2 {
      /**
       * Create a `WebSocketServer` instance.
       *
       * @param {Object} options Configuration options
       * @param {Boolean} [options.allowSynchronousEvents=true] Specifies whether
       *     any of the `'message'`, `'ping'`, and `'pong'` events can be emitted
       *     multiple times in the same tick
       * @param {Boolean} [options.autoPong=true] Specifies whether or not to
       *     automatically send a pong in response to a ping
       * @param {Number} [options.backlog=511] The maximum length of the queue of
       *     pending connections
       * @param {Boolean} [options.clientTracking=true] Specifies whether or not to
       *     track clients
       * @param {Number} [options.closeTimeout=30000] Duration in milliseconds to
       *     wait for the closing handshake to finish after `websocket.close()` is
       *     called
       * @param {Function} [options.handleProtocols] A hook to handle protocols
       * @param {String} [options.host] The hostname where to bind the server
       * @param {Number} [options.maxBufferedChunks=262144] The maximum number of
       *     buffered data chunks
       * @param {Number} [options.maxFragments=16384] The maximum number of message
       *     fragments
       * @param {Number} [options.maxPayload=104857600] The maximum allowed message
       *     size
       * @param {Boolean} [options.noServer=false] Enable no server mode
       * @param {String} [options.path] Accept only connections matching this path
       * @param {(Boolean|Object)} [options.perMessageDeflate=false] Enable/disable
       *     permessage-deflate
       * @param {Number} [options.port] The port where to bind the server
       * @param {(http.Server|https.Server)} [options.server] A pre-created HTTP/S
       *     server to use
       * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
       *     not to skip UTF-8 validation for text and close messages
       * @param {Function} [options.verifyClient] A hook to reject connections
       * @param {Function} [options.WebSocket=WebSocket] Specifies the `WebSocket`
       *     class to use. It must be the `WebSocket` class or class that extends it
       * @param {Function} [callback] A listener for the `listening` event
       */
      constructor(options, callback) {
        super();
        options = {
          allowSynchronousEvents: true,
          autoPong: true,
          maxBufferedChunks: 256 * 1024,
          maxFragments: 16 * 1024,
          maxPayload: 100 * 1024 * 1024,
          skipUTF8Validation: false,
          perMessageDeflate: false,
          handleProtocols: null,
          clientTracking: true,
          closeTimeout: CLOSE_TIMEOUT,
          verifyClient: null,
          noServer: false,
          backlog: null,
          // use default (511 as implemented in net.js)
          server: null,
          host: null,
          path: null,
          port: null,
          WebSocket: WebSocket2,
          ...options
        };
        if (options.port == null && !options.server && !options.noServer || options.port != null && (options.server || options.noServer) || options.server && options.noServer) {
          throw new TypeError(
            'One and only one of the "port", "server", or "noServer" options must be specified'
          );
        }
        if (options.port != null) {
          this._server = http.createServer((req, res) => {
            const body = http.STATUS_CODES[426];
            res.writeHead(426, {
              "Content-Length": body.length,
              "Content-Type": "text/plain"
            });
            res.end(body);
          });
          this._server.listen(
            options.port,
            options.host,
            options.backlog,
            callback
          );
        } else if (options.server) {
          this._server = options.server;
        }
        if (this._server) {
          const emitConnection = this.emit.bind(this, "connection");
          this._removeListeners = addListeners(this._server, {
            listening: this.emit.bind(this, "listening"),
            error: this.emit.bind(this, "error"),
            upgrade: (req, socket, head) => {
              this.handleUpgrade(req, socket, head, emitConnection);
            }
          });
        }
        if (options.perMessageDeflate === true)
          options.perMessageDeflate = {};
        if (options.clientTracking) {
          this.clients = /* @__PURE__ */ new Set();
          this._shouldEmitClose = false;
        }
        this.options = options;
        this._state = RUNNING;
      }
      /**
       * Returns the bound address, the address family name, and port of the server
       * as reported by the operating system if listening on an IP socket.
       * If the server is listening on a pipe or UNIX domain socket, the name is
       * returned as a string.
       *
       * @return {(Object|String|null)} The address of the server
       * @public
       */
      address() {
        if (this.options.noServer) {
          throw new Error('The server is operating in "noServer" mode');
        }
        if (!this._server)
          return null;
        return this._server.address();
      }
      /**
       * Stop the server from accepting new connections and emit the `'close'` event
       * when all existing connections are closed.
       *
       * @param {Function} [cb] A one-time listener for the `'close'` event
       * @public
       */
      close(cb) {
        if (this._state === CLOSED) {
          if (cb) {
            this.once("close", () => {
              cb(new Error("The server is not running"));
            });
          }
          process.nextTick(emitClose, this);
          return;
        }
        if (cb)
          this.once("close", cb);
        if (this._state === CLOSING)
          return;
        this._state = CLOSING;
        if (this.options.noServer || this.options.server) {
          if (this._server) {
            this._removeListeners();
            this._removeListeners = this._server = null;
          }
          if (this.clients) {
            if (!this.clients.size) {
              process.nextTick(emitClose, this);
            } else {
              this._shouldEmitClose = true;
            }
          } else {
            process.nextTick(emitClose, this);
          }
        } else {
          const server = this._server;
          this._removeListeners();
          this._removeListeners = this._server = null;
          server.close(() => {
            emitClose(this);
          });
        }
      }
      /**
       * See if a given request should be handled by this server instance.
       *
       * @param {http.IncomingMessage} req Request object to inspect
       * @return {Boolean} `true` if the request is valid, else `false`
       * @public
       */
      shouldHandle(req) {
        if (this.options.path) {
          const index = req.url.indexOf("?");
          const pathname = index !== -1 ? req.url.slice(0, index) : req.url;
          if (pathname !== this.options.path)
            return false;
        }
        return true;
      }
      /**
       * Handle a HTTP Upgrade request.
       *
       * @param {http.IncomingMessage} req The request object
       * @param {Duplex} socket The network socket between the server and client
       * @param {Buffer} head The first packet of the upgraded stream
       * @param {Function} cb Callback
       * @public
       */
      handleUpgrade(req, socket, head, cb) {
        socket.on("error", socketOnError);
        const key = req.headers["sec-websocket-key"];
        const upgrade = req.headers.upgrade;
        const version = +req.headers["sec-websocket-version"];
        if (req.method !== "GET") {
          const message = "Invalid HTTP method";
          abortHandshakeOrEmitwsClientError(this, req, socket, 405, message);
          return;
        }
        if (upgrade === void 0 || upgrade.toLowerCase() !== "websocket") {
          const message = "Invalid Upgrade header";
          abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
          return;
        }
        if (key === void 0 || !keyRegex.test(key)) {
          const message = "Missing or invalid Sec-WebSocket-Key header";
          abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
          return;
        }
        if (version !== 13 && version !== 8) {
          const message = "Missing or invalid Sec-WebSocket-Version header";
          abortHandshakeOrEmitwsClientError(this, req, socket, 400, message, {
            "Sec-WebSocket-Version": "13, 8"
          });
          return;
        }
        if (!this.shouldHandle(req)) {
          abortHandshake(socket, 400);
          return;
        }
        const secWebSocketProtocol = req.headers["sec-websocket-protocol"];
        let protocols = /* @__PURE__ */ new Set();
        if (secWebSocketProtocol !== void 0) {
          try {
            protocols = subprotocol2.parse(secWebSocketProtocol);
          } catch (err) {
            const message = "Invalid Sec-WebSocket-Protocol header";
            abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
            return;
          }
        }
        const secWebSocketExtensions = req.headers["sec-websocket-extensions"];
        const extensions = {};
        if (this.options.perMessageDeflate && secWebSocketExtensions !== void 0) {
          const perMessageDeflate = new PerMessageDeflate2({
            ...this.options.perMessageDeflate,
            isServer: true,
            maxPayload: this.options.maxPayload
          });
          try {
            const offers = extension2.parse(secWebSocketExtensions);
            if (offers[PerMessageDeflate2.extensionName]) {
              perMessageDeflate.accept(offers[PerMessageDeflate2.extensionName]);
              extensions[PerMessageDeflate2.extensionName] = perMessageDeflate;
            }
          } catch (err) {
            const message = "Invalid or unacceptable Sec-WebSocket-Extensions header";
            abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
            return;
          }
        }
        if (this.options.verifyClient) {
          const info = {
            origin: req.headers[`${version === 8 ? "sec-websocket-origin" : "origin"}`],
            secure: !!(req.socket.authorized || req.socket.encrypted),
            req
          };
          if (this.options.verifyClient.length === 2) {
            this.options.verifyClient(info, (verified, code, message, headers) => {
              if (!verified) {
                return abortHandshake(socket, code || 401, message, headers);
              }
              this.completeUpgrade(
                extensions,
                key,
                protocols,
                req,
                socket,
                head,
                cb
              );
            });
            return;
          }
          if (!this.options.verifyClient(info))
            return abortHandshake(socket, 401);
        }
        this.completeUpgrade(extensions, key, protocols, req, socket, head, cb);
      }
      /**
       * Upgrade the connection to WebSocket.
       *
       * @param {Object} extensions The accepted extensions
       * @param {String} key The value of the `Sec-WebSocket-Key` header
       * @param {Set} protocols The subprotocols
       * @param {http.IncomingMessage} req The request object
       * @param {Duplex} socket The network socket between the server and client
       * @param {Buffer} head The first packet of the upgraded stream
       * @param {Function} cb Callback
       * @throws {Error} If called more than once with the same socket
       * @private
       */
      completeUpgrade(extensions, key, protocols, req, socket, head, cb) {
        if (!socket.readable || !socket.writable)
          return socket.destroy();
        if (socket[kWebSocket]) {
          throw new Error(
            "server.handleUpgrade() was called more than once with the same socket, possibly due to a misconfiguration"
          );
        }
        if (this._state > RUNNING)
          return abortHandshake(socket, 503);
        const digest = createHash2("sha1").update(key + GUID).digest("base64");
        const headers = [
          "HTTP/1.1 101 Switching Protocols",
          "Upgrade: websocket",
          "Connection: Upgrade",
          `Sec-WebSocket-Accept: ${digest}`
        ];
        const ws = new this.options.WebSocket(null, void 0, this.options);
        if (protocols.size) {
          const protocol = this.options.handleProtocols ? this.options.handleProtocols(protocols, req) : protocols.values().next().value;
          if (protocol) {
            headers.push(`Sec-WebSocket-Protocol: ${protocol}`);
            ws._protocol = protocol;
          }
        }
        if (extensions[PerMessageDeflate2.extensionName]) {
          const params = extensions[PerMessageDeflate2.extensionName].params;
          const value = extension2.format({
            [PerMessageDeflate2.extensionName]: [params]
          });
          headers.push(`Sec-WebSocket-Extensions: ${value}`);
          ws._extensions = extensions;
        }
        this.emit("headers", headers, req);
        socket.write(headers.concat("\r\n").join("\r\n"));
        socket.removeListener("error", socketOnError);
        ws.setSocket(socket, head, {
          allowSynchronousEvents: this.options.allowSynchronousEvents,
          maxBufferedChunks: this.options.maxBufferedChunks,
          maxFragments: this.options.maxFragments,
          maxPayload: this.options.maxPayload,
          skipUTF8Validation: this.options.skipUTF8Validation
        });
        if (this.clients) {
          this.clients.add(ws);
          ws.on("close", () => {
            this.clients.delete(ws);
            if (this._shouldEmitClose && !this.clients.size) {
              process.nextTick(emitClose, this);
            }
          });
        }
        cb(ws, req);
      }
    };
    module2.exports = WebSocketServer2;
    function addListeners(server, map) {
      for (const event of Object.keys(map))
        server.on(event, map[event]);
      return function removeListeners() {
        for (const event of Object.keys(map)) {
          server.removeListener(event, map[event]);
        }
      };
    }
    function emitClose(server) {
      server._state = CLOSED;
      server.emit("close");
    }
    function socketOnError() {
      this.destroy();
    }
    function abortHandshake(socket, code, message, headers) {
      message = message || http.STATUS_CODES[code];
      headers = {
        Connection: "close",
        "Content-Type": "text/html",
        "Content-Length": Buffer.byteLength(message),
        ...headers
      };
      socket.once("finish", socket.destroy);
      socket.end(
        `HTTP/1.1 ${code} ${http.STATUS_CODES[code]}\r
` + Object.keys(headers).map((h) => `${h}: ${headers[h]}`).join("\r\n") + "\r\n\r\n" + message
      );
    }
    function abortHandshakeOrEmitwsClientError(server, req, socket, code, message, headers) {
      if (server.listenerCount("wsClientError")) {
        const err = new Error(message);
        Error.captureStackTrace(err, abortHandshakeOrEmitwsClientError);
        server.emit("wsClientError", err, socket, req);
      } else {
        abortHandshake(socket, code, message, headers);
      }
    }
  }
});

// src/extension.ts
var extension_exports = {};
__export(extension_exports, {
  activate: () => activate,
  deactivate: () => deactivate
});
module.exports = __toCommonJS(extension_exports);
var vscode5 = __toESM(require("vscode"));

// node_modules/ws/wrapper.mjs
var import_stream = __toESM(require_stream(), 1);
var import_extension = __toESM(require_extension(), 1);
var import_permessage_deflate = __toESM(require_permessage_deflate(), 1);
var import_receiver = __toESM(require_receiver(), 1);
var import_sender = __toESM(require_sender(), 1);
var import_subprotocol = __toESM(require_subprotocol(), 1);
var import_websocket = __toESM(require_websocket(), 1);
var import_websocket_server = __toESM(require_websocket_server(), 1);

// src/gateway.ts
var import_events = require("events");
var crypto = __toESM(require("crypto"));

// src/logLevel.ts
var LOG_NONE = 0;
var LOG_ERROR = 1;
var LOG_WARN = 2;
var LOG_INFO = 3;
var LOG_DEBUG = 4;
var LOG_TRACE = 5;
var LOG_LEVEL_NAMES = {
  [LOG_NONE]: "None",
  [LOG_ERROR]: "Error",
  [LOG_WARN]: "Warn",
  [LOG_INFO]: "Info",
  [LOG_DEBUG]: "Debug",
  [LOG_TRACE]: "Trace"
};
var _logLevel = LOG_INFO;
function setLogLevel(level) {
  _logLevel = level;
}
function getLogLevel() {
  return _logLevel;
}
function log(message, level = LOG_INFO, channel) {
  if (channel && _logLevel >= level) {
    channel.appendLine(message);
  }
}

// src/gateway.ts
var OpenClawGateway = class extends import_events.EventEmitter {
  constructor(url, token, channel) {
    super();
    this.ws = null;
    this.pending = /* @__PURE__ */ new Map();
    this._connected = false;
    this.reconnectTimer = null;
    this.reconnectDelay = 800;
    this.maxReconnectDelay = 15e3;
    this.connectSent = false;
    this.connectNonce = null;
    this.connectTimer = null;
    this.deviceIdentity = null;
    this.deviceKeyObject = null;
    this.closed = false;
    this.url = url;
    this.token = token;
    const ch = channel;
    this.log = (msg) => log(msg, LOG_DEBUG, ch);
  }
  get connected() {
    return this._connected;
  }
  getDeviceIdentity() {
    return this.deviceIdentity;
  }
  getDeviceKeyObject() {
    return this.deviceKeyObject;
  }
  async initDeviceIdentity(store) {
    let identity = store.get("deviceIdentityV2");
    if (!identity) {
      this.log("Generating new device identity...");
      const { publicKey, privateKey } = crypto.generateKeyPairSync("ed25519");
      const pubSpki = publicKey.export({ type: "spki", format: "der" });
      const pubRaw = pubSpki.subarray(pubSpki.length - 32);
      const privRaw = privateKey.export({ type: "pkcs8", format: "der" });
      const deviceId = crypto.createHash("sha256").update(pubRaw).digest("hex");
      identity = {
        deviceId,
        publicKey: base64UrlEncode(pubRaw),
        privateKey: base64UrlEncode(privRaw)
      };
      store.update("deviceIdentityV2", identity);
      this.log(`New device ID: ${deviceId}`);
    } else {
      this.log(`Loaded existing device ID: ${identity.deviceId}`);
    }
    this.deviceIdentity = identity;
    const derBuffer = base64UrlDecode(identity.privateKey);
    this.deviceKeyObject = crypto.createPrivateKey({
      key: Buffer.from(derBuffer),
      format: "der",
      type: "pkcs8"
    });
  }
  connect() {
    this.closed = false;
    if (this.ws) {
      try {
        this.ws.close();
      } catch {
      }
      this.ws = null;
    }
    this.connectSent = false;
    this.connectNonce = null;
    if (this.connectTimer) {
      clearTimeout(this.connectTimer);
      this.connectTimer = null;
    }
    const wsUrl = this.normalizeUrl(this.url);
    if (!wsUrl) {
      this.log(`ERROR: Invalid gateway URL: ${this.url}`);
      this.emit("error", "Invalid gateway URL");
      return;
    }
    this.log(`Connecting to ${wsUrl}...`);
    try {
      this.ws = new import_websocket.default(wsUrl);
    } catch (err) {
      this.log(`ERROR: WebSocket constructor failed: ${err.message}`);
      this.emit("error", err.message);
      this.scheduleReconnect();
      return;
    }
    this.ws.on("open", () => {
      this.log("WebSocket opened, waiting for challenge or sending connect in 750ms...");
      this.connectTimer = setTimeout(() => {
        this.connectTimer = null;
        if (!this.connectSent) {
          this.log("No challenge received, sending connect (v1)...");
          this.sendConnect().catch((err) => {
            this.log(`ERROR: sendConnect failed: ${err.message}`);
          });
        }
      }, 750);
    });
    this.ws.on("message", (data) => {
      this.handleRawMessage(data.toString());
    });
    this.ws.on("close", (code, reason) => {
      const reasonStr = reason.toString();
      this.log(`WebSocket closed: code=${code} reason=${reasonStr}`);
      this._connected = false;
      this.connectSent = false;
      if (this.connectTimer) {
        clearTimeout(this.connectTimer);
        this.connectTimer = null;
      }
      this.emit("disconnected");
      this.emit("close", code, reasonStr);
      if (!this.closed) {
        this.scheduleReconnect();
      }
    });
    this.ws.on("error", (err) => {
      this.log(`ERROR: WebSocket error: ${err.message}`);
      this.emit("error", err.message);
    });
  }
  handleRawMessage(raw) {
    var _a, _b;
    let msg;
    try {
      msg = JSON.parse(raw);
    } catch {
      return;
    }
    if (msg.type === "event" && (msg.event === "heartbeat" || msg.event === "tick" || msg.event === "health")) {
      this.emit("event", msg);
      if (msg.event) {
        this.emit(msg.event, { payload: msg.payload, seq: msg.seq });
      }
      return;
    }
    const summary = raw.length > 300 ? raw.substring(0, 300) + "..." : raw;
    this.log(`\u2190 ${summary}`);
    if (msg.type === "event" && msg.event === "connect.challenge") {
      const nonce = (_a = msg.payload) == null ? void 0 : _a.nonce;
      this.log(`Challenge received, nonce=${nonce ? nonce.substring(0, 8) + "..." : "none"}`);
      if (typeof nonce === "string") {
        this.connectNonce = nonce;
      }
      if (!this.connectSent) {
        this.log("Sending connect (v2, with nonce)...");
        this.sendConnect().catch((err) => {
          this.log(`ERROR: sendConnect failed: ${err.message}`);
        });
      }
      return;
    }
    if (msg.type === "res") {
      const id = msg.id || "";
      const p = this.pending.get(id);
      if (p) {
        this.pending.delete(id);
        if (msg.ok) {
          this.log(`RES OK [${id}]: ${JSON.stringify(msg.payload).substring(0, 100)}`);
          p.resolve(msg.payload);
        } else {
          this.log(`RES ERR [${id}]: ${JSON.stringify(msg.error)}`);
          p.reject(new Error(((_b = msg.error) == null ? void 0 : _b.message) || "request failed"));
        }
      } else {
        this.log(`RES for unknown id [${id}], ignoring`);
      }
      return;
    }
    if (msg.type === "event") {
      this.log(`EVENT: ${msg.event} seq=${msg.seq}`);
      this.emit("event", msg);
      if (msg.event) {
        this.emit(msg.event, { payload: msg.payload, seq: msg.seq });
      }
      return;
    }
  }
  // ─── Auto Configure ───
  async configureExecHost() {
    var _a, _b, _c, _d;
    const nodeId = (_a = this.deviceIdentity) == null ? void 0 : _a.deviceId;
    if (!nodeId)
      return;
    const agentId = nodeId;
    try {
      this.log(`configureExecHost: agentId=${agentId}`);
      const configResult = await this.request("config.get", {});
      const baseHash = configResult == null ? void 0 : configResult.hash;
      let config = configResult == null ? void 0 : configResult.config;
      if (!config && (configResult == null ? void 0 : configResult.raw)) {
        try {
          config = JSON.parse(configResult.raw);
        } catch {
        }
      }
      if (!config)
        config = configResult;
      const agentEntries = ((_b = config == null ? void 0 : config.agents) == null ? void 0 : _b.entries) || {};
      this.log(`agents.entries has ${Object.keys(agentEntries).length} entries`);
      const existing = agentEntries[agentId];
      if (existing) {
        if (((_d = (_c = existing.tools) == null ? void 0 : _c.exec) == null ? void 0 : _d.host) === "node") {
          this.log(`Agent ${agentId} already has tools.exec.host=node, skipping.`);
          return;
        }
        if (!existing.tools)
          existing.tools = {};
        if (!existing.tools.exec)
          existing.tools.exec = {};
        existing.tools.exec.host = "node";
      } else {
        agentEntries[agentId] = {
          name: "OpenClaw VSCode",
          tools: { exec: { host: "node" } }
        };
      }
      const patch = {
        raw: JSON.stringify({ agents: { entries: agentEntries } }),
        baseHash: baseHash || void 0,
        replacePaths: ["agents.entries"]
      };
      this.log(`config.patch agents.entries with replacePaths (count=${Object.keys(agentEntries).length})...`);
      const result = await this.request("config.patch", patch, 9e4);
      this.log(`config.patch result: ${JSON.stringify(result).substring(0, 300)}`);
    } catch (err) {
      this.log(`WARNING: configureExecHost failed: ${err.message}`);
    }
  }
  // ─── Connect ───
  async sendConnect() {
    if (this.connectSent)
      return;
    this.connectSent = true;
    const clientId = "gateway-client";
    const clientMode = "ui";
    const role = "operator";
    const scopes = ["operator.admin", "operator.write", "operator.read", "operator.pairing"];
    const signedAt = Date.now();
    this.log(`sendConnect: starting, deviceIdentity=${!!this.deviceIdentity}, keyObject=${!!this.deviceKeyObject}`);
    const params = {
      minProtocol: 4,
      maxProtocol: 4,
      client: {
        id: clientId,
        version: "0.0.1",
        platform: "vscode",
        mode: clientMode
      },
      role,
      scopes,
      auth: this.token ? { token: this.token } : void 0
    };
    if (this.deviceIdentity && this.deviceKeyObject) {
      try {
        const messageToSign = this.buildSignMessage(
          this.connectNonce,
          this.deviceIdentity.deviceId,
          clientId,
          clientMode,
          role,
          scopes,
          signedAt,
          this.token
        );
        this.log(`Sign: ${messageToSign.substring(0, 80)}...`);
        const signature = this.signMessage(messageToSign);
        params.device = {
          id: this.deviceIdentity.deviceId,
          publicKey: this.deviceIdentity.publicKey,
          signature,
          signedAt,
          nonce: this.connectNonce || void 0
        };
        this.log(`Device: ${this.deviceIdentity.deviceId}`);
      } catch (err) {
        this.log(`ERROR: Device signing failed: ${err}`);
      }
    } else {
      this.log("WARNING: No device identity, connecting without device auth");
    }
    try {
      this.log(`Sending connect request (role=${role}, mode=${clientMode})...`);
      const msgStr = JSON.stringify({ type: "req", id: "__connect__", method: "connect", params });
      this.log(`CONNECT REQ: ${msgStr.substring(0, 300)}`);
      const result = await this.request("connect", params);
      this.log(`CONNECT SUCCESS! ${JSON.stringify(result).substring(0, 200)}`);
      this._connected = true;
      this.reconnectDelay = 800;
      this.emit("connected", result);
    } catch (err) {
      this.log(`ERROR: Connect FAILED: ${err.message}`);
      this.emit("error", `Connect failed: ${err.message}`);
      if (this.ws) {
        this.ws.close(4008, "connect failed");
      }
    }
  }
  buildSignMessage(nonce, deviceId, clientId, clientMode, role, scopes, signedAtMs, token) {
    const version = nonce ? "v2" : "v1";
    const parts = [
      version,
      deviceId,
      clientId,
      clientMode,
      role,
      scopes.join(","),
      String(signedAtMs),
      token || ""
    ];
    if (version === "v2") {
      parts.push(nonce || "");
    }
    return parts.join("|");
  }
  signMessage(message) {
    if (!this.deviceKeyObject) {
      throw new Error("Device key not initialized");
    }
    const data = Buffer.from(message, "utf-8");
    const signature = crypto.sign(null, data, this.deviceKeyObject);
    return base64UrlEncode(signature);
  }
  async request(method, params = {}, timeoutMs = 6e4) {
    if (!this.ws || this.ws.readyState !== import_websocket.default.OPEN) {
      throw new Error("not connected");
    }
    return new Promise((resolve2, reject) => {
      const id = this.genId();
      this.pending.set(id, { resolve: resolve2, reject });
      const msg = { type: "req", id, method, params };
      const msgStr = JSON.stringify(msg);
      this.log(`\u2192 ${method} [${id}]: ${msgStr.length > 200 ? msgStr.substring(0, 200) + "..." : msgStr}`);
      this.ws.send(msgStr);
      setTimeout(() => {
        if (this.pending.has(id)) {
          this.pending.delete(id);
          reject(new Error(`Request timed out: ${method}`));
        }
      }, timeoutMs);
    });
  }
  normalizeUrl(url) {
    let p = url.trim();
    if (p.startsWith("https://"))
      p = "wss://" + p.slice(8);
    else if (p.startsWith("http://"))
      p = "ws://" + p.slice(7);
    if (!p.startsWith("ws://") && !p.startsWith("wss://"))
      return null;
    return p.replace(/\/+$/, "");
  }
  scheduleReconnect() {
    if (this.reconnectTimer || this.closed)
      return;
    this.log(`Reconnecting in ${this.reconnectDelay}ms...`);
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, this.reconnectDelay);
    this.reconnectDelay = Math.min(this.reconnectDelay * 1.7, this.maxReconnectDelay);
  }
  disconnect() {
    this.closed = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.connectTimer) {
      clearTimeout(this.connectTimer);
      this.connectTimer = null;
    }
    if (this.ws) {
      try {
        this.ws.close();
      } catch {
      }
      this.ws = null;
    }
    this._connected = false;
  }
  updateConfig(url, token) {
    this.url = url;
    this.token = token;
  }
  resetDeviceIdentity(store) {
    store.update("deviceIdentityV2", void 0);
    this.deviceIdentity = null;
    this.deviceKeyObject = null;
    this.log("Device identity cleared. Will regenerate on next connect.");
  }
  genId() {
    return Math.random().toString(36).substring(2, 12);
  }
};
var NodeHost = class extends import_events.EventEmitter {
  constructor(url, token, channel) {
    super();
    this.ws = null;
    this.pending = /* @__PURE__ */ new Map();
    this._connected = false;
    this.reconnectTimer = null;
    this.reconnectDelay = 1e3;
    this.maxReconnectDelay = 3e4;
    this.connectSent = false;
    this.connectNonce = null;
    this.connectTimer = null;
    this.deviceIdentity = null;
    this.deviceKeyObject = null;
    this.closed = false;
    this.alwaysApprovedCommands = /* @__PURE__ */ new Set();
    this.alwaysApprovedCwds = /* @__PURE__ */ new Set();
    this.url = url;
    this.token = token;
    const ch = channel;
    this.log = (msg) => log(msg, LOG_DEBUG, ch);
  }
  get connected() {
    return this._connected;
  }
  getDeviceId() {
    var _a;
    return ((_a = this.deviceIdentity) == null ? void 0 : _a.deviceId) ?? null;
  }
  setToken(token) {
    this.token = token;
  }
  getToken() {
    return this.token;
  }
  async initDeviceIdentity(store) {
    let identity = store.get("nodeDeviceIdentityV2");
    if (!identity) {
      this.log("Generating new node device identity...");
      const { publicKey, privateKey } = crypto.generateKeyPairSync("ed25519");
      const pubSpki = publicKey.export({ type: "spki", format: "der" });
      const pubRaw = pubSpki.subarray(pubSpki.length - 32);
      const privRaw = privateKey.export({ type: "pkcs8", format: "der" });
      const deviceId = crypto.createHash("sha256").update(pubRaw).digest("hex");
      identity = {
        deviceId,
        publicKey: base64UrlEncode(pubRaw),
        privateKey: base64UrlEncode(privRaw)
      };
      store.update("nodeDeviceIdentityV2", identity);
      this.log(`New node device ID: ${deviceId}`);
    } else {
      this.log(`Loaded node device ID: ${identity.deviceId}`);
    }
    this.deviceIdentity = identity;
    const derBuffer = base64UrlDecode(identity.privateKey);
    this.deviceKeyObject = crypto.createPrivateKey({
      key: Buffer.from(derBuffer),
      format: "der",
      type: "pkcs8"
    });
  }
  connect() {
    this.closed = false;
    if (this.ws) {
      try {
        this.ws.close();
      } catch {
      }
      this.ws = null;
    }
    this.connectSent = false;
    this.connectNonce = null;
    if (this.connectTimer) {
      clearTimeout(this.connectTimer);
      this.connectTimer = null;
    }
    let wsUrl = this.url.trim();
    if (wsUrl.startsWith("https://"))
      wsUrl = "wss://" + wsUrl.slice(8);
    else if (wsUrl.startsWith("http://"))
      wsUrl = "ws://" + wsUrl.slice(7);
    if (!wsUrl.startsWith("ws://") && !wsUrl.startsWith("wss://")) {
      this.log(`ERROR: Invalid URL: ${this.url}`);
      return;
    }
    wsUrl = wsUrl.replace(/\/+$/, "");
    this.log(`Connecting to ${wsUrl} (role=node)...`);
    try {
      this.ws = new import_websocket.default(wsUrl);
    } catch (err) {
      this.log(`ERROR: WebSocket failed: ${err.message}`);
      this.scheduleReconnect();
      return;
    }
    this.ws.on("open", () => {
      this.log("WebSocket opened, waiting for challenge...");
      this.connectTimer = setTimeout(() => {
        this.connectTimer = null;
        if (!this.connectSent) {
          this.sendConnect();
        }
      }, 750);
    });
    this.ws.on("message", (data) => {
      this.handleRawMessage(data.toString());
    });
    this.ws.on("close", (code, reason) => {
      this.log(`Closed: code=${code} reason=${reason.toString()}`);
      this._connected = false;
      this.connectSent = false;
      if (this.connectTimer) {
        clearTimeout(this.connectTimer);
        this.connectTimer = null;
      }
      this.emit("disconnected");
      if (!this.closed) {
        this.scheduleReconnect();
      }
    });
    this.ws.on("error", (err) => {
      this.log(`ERROR: ${err.message}`);
    });
  }
  handleRawMessage(raw) {
    var _a, _b;
    let msg;
    try {
      msg = JSON.parse(raw);
    } catch {
      return;
    }
    if (msg.type === "event" && (msg.event === "heartbeat" || msg.event === "tick" || msg.event === "health")) {
      this.emit("event", msg);
      if (msg.event) {
        this.emit(msg.event, { payload: msg.payload, seq: msg.seq });
      }
      return;
    }
    const summary = raw.length > 300 ? raw.substring(0, 300) + "..." : raw;
    this.log(`\u2190 ${summary}`);
    if (msg.type === "event" && msg.event === "connect.challenge") {
      const nonce = (_a = msg.payload) == null ? void 0 : _a.nonce;
      if (typeof nonce === "string") {
        this.connectNonce = nonce;
      }
      if (!this.connectSent) {
        this.sendConnect();
      }
      return;
    }
    if (msg.type === "res") {
      const id = msg.id || "";
      const p = this.pending.get(id);
      if (p) {
        this.pending.delete(id);
        if (msg.ok) {
          p.resolve(msg.payload);
        } else {
          p.reject(new Error(((_b = msg.error) == null ? void 0 : _b.message) || "request failed"));
        }
      }
      return;
    }
    if (msg.type === "event") {
      this.emit("event", msg);
      if (msg.event) {
        this.emit(msg.event, { payload: msg.payload, seq: msg.seq });
      }
      if (msg.event === "node.invoke.request") {
        this.handleInvokeRequest(msg.payload);
      }
      return;
    }
  }
  // ─── Node connect (role=node, scopes=[]) ───
  async sendConnect() {
    var _a;
    if (this.connectSent)
      return;
    this.connectSent = true;
    const clientId = "node-host";
    const clientMode = "node";
    const role = "node";
    const scopes = [];
    const signedAt = Date.now();
    const nonce = this.connectNonce || crypto.randomBytes(16).toString("hex");
    this.log(`sendConnect: clientId=${clientId}, mode=${clientMode}, nonce=${nonce.substring(0, 8)}...`);
    const params = {
      minProtocol: 4,
      maxProtocol: 4,
      client: {
        id: clientId,
        displayName: "OpenClaw VSCode",
        version: "0.0.1",
        platform: "vscode",
        deviceFamily: "desktop",
        modelIdentifier: "VSCode",
        mode: clientMode,
        instanceId: ((_a = this.deviceIdentity) == null ? void 0 : _a.deviceId) || ""
      },
      caps: ["system"],
      commands: [
        "system.run.prepare",
        "system.run",
        "system.which",
        "system.execApprovals.get",
        "system.execApprovals.set"
      ],
      role,
      scopes,
      auth: this.token ? { token: this.token } : void 0
    };
    if (this.deviceIdentity && this.deviceKeyObject) {
      try {
        const messageToSign = this.buildSignMessage(
          nonce,
          this.deviceIdentity.deviceId,
          clientId,
          clientMode,
          role,
          scopes,
          signedAt,
          this.token
        );
        const signature = this.signMessage(messageToSign);
        params.device = {
          id: this.deviceIdentity.deviceId,
          publicKey: this.deviceIdentity.publicKey,
          signature,
          signedAt,
          nonce
        };
      } catch (err) {
        this.log(`ERROR: Signing failed: ${err}`);
      }
    } else {
      this.log("WARNING: No device identity, connecting without device auth");
    }
    try {
      this.log(`Sending connect (role=${role}, commands=${params.commands.join(",")})...`);
      const result = await this.request("connect", params);
      this._connected = true;
      this.reconnectDelay = 1e3;
      this.log(`Connected as node: ${JSON.stringify(result).substring(0, 200)}`);
      this.emit("connected", result);
    } catch (err) {
      this.log(`ERROR: Connect failed: ${err.message}`);
      if (this.ws) {
        this.ws.close(4008, "connect failed");
      }
    }
  }
  // ─── node.invoke.request handler ───
  async handleInvokeRequest(payload) {
    if (!payload || typeof payload !== "object")
      return;
    const id = payload.id;
    const nodeId = payload.nodeId;
    const command = payload.command;
    if (!id || !nodeId || !command)
      return;
    let params = {};
    if (typeof payload.paramsJSON === "string") {
      try {
        params = JSON.parse(payload.paramsJSON);
      } catch {
      }
    } else if (payload.params) {
      params = payload.params;
    }
    this.log(`INVOKE: ${command} id=${id}`);
    try {
      const result = await this.executeCommand(command, params);
      await this.sendInvokeResult(id, nodeId, { ok: true, payload: result });
    } catch (err) {
      this.log(`INVOKE ERROR: ${command} \u2192 ${err.message}`);
      await this.sendInvokeResult(id, nodeId, {
        ok: false,
        error: { code: "COMMAND_ERROR", message: err.message }
      });
    }
  }
  async sendInvokeResult(id, nodeId, result) {
    const params = { id, nodeId, ok: result.ok };
    if (result.ok && result.payload !== void 0) {
      params.payload = result.payload;
      params.payloadJSON = JSON.stringify(result.payload);
    } else if (!result.ok) {
      params.error = result.error;
    }
    await this.request("node.invoke.result", params);
  }
  // ─── Command execution ───
  resolveCwd(cwd) {
    if (cwd) {
      const normalized = cwd.replace(/\\/g, "/");
      if (normalized.startsWith("/")) {
        try {
          const fs4 = require("fs");
          if (fs4.existsSync(cwd))
            return cwd;
        } catch {
        }
      }
      if (/^[A-Za-z]:/.test(cwd)) {
        try {
          const fs4 = require("fs");
          if (fs4.existsSync(cwd))
            return cwd;
        } catch {
        }
      }
    }
    const fallback = process.env.HOME || process.env.USERPROFILE || process.env.HOMEPATH || "/tmp";
    this.log(`CWD resolved: ${cwd || "(none)"} \u2192 ${fallback}`);
    return fallback;
  }
  resolveCommand(params) {
    const raw = params.rawCommand;
    if (raw && typeof raw === "string" && raw.trim())
      return raw.trim();
    const cmd = params.command || params.cmd;
    if (!cmd)
      return "";
    if (Array.isArray(cmd)) {
      if (cmd.length >= 3) {
        const shell = String(cmd[0] || "").toLowerCase();
        const flag = String(cmd[1] || "");
        const isUnixShell = shell.endsWith("/sh") || shell.endsWith("/bash") || shell === "sh" || shell === "bash";
        const isWinShell = shell === "cmd" || shell === "cmd.exe" || shell === "powershell" || shell === "pwsh";
        if ((flag === "-c" || flag === "-lc" || flag === "/c") && (isUnixShell || isWinShell)) {
          return cmd[2];
        }
      }
      return cmd.join(" ");
    }
    return String(cmd || "");
  }
  async executeCommand(command, params) {
    switch (command) {
      case "system.run":
        return this.handleSystemRun(params);
      case "system.run.prepare":
        return this.handleSystemRunPrepare(params);
      case "system.which":
        return this.handleSystemWhich(params);
      case "system.execApprovals.get":
        return { approved: this.isCwdApproved(params.cwd || "") };
      case "system.execApprovals.set":
        if (params.approved && params.cwd) {
          this.alwaysApprovedCwds.add(params.cwd);
        }
        return { approved: true };
      default:
        throw new Error(`Unknown command: ${command}`);
    }
  }
  handleSystemRunPrepare(params) {
    const cmd = params.command || params.rawCommand || "";
    const cwd = this.resolveCwd(params.cwd);
    const argv = typeof cmd === "string" ? cmd.split(/\s+/) : Array.isArray(cmd) ? cmd : [cmd];
    return Promise.resolve({
      argv,
      cwd,
      execPolicy: "allow",
      allowAlwaysCoverage: "full"
    });
  }
  handleSystemWhich(params) {
    const { execSync } = require("child_process");
    const name = params.name || params.command;
    if (!name)
      return Promise.resolve({ found: false });
    try {
      const which = process.platform === "win32" ? "where" : "which";
      const result = execSync(`${which} ${name}`, { encoding: "utf-8", timeout: 5e3, shell: true }).trim();
      return Promise.resolve({ found: true, path: result.split("\n")[0].trim() });
    } catch {
      return Promise.resolve({ found: false });
    }
  }
  async promptForApproval(command, cwd) {
    const vscode6 = require("vscode");
    const items = [
      { label: `$(check) ${vscode6.l10n.t("Allow Once")}`, description: vscode6.l10n.t("Allow this command to run one time"), result: "allowOnce" },
      { label: `$(shield) ${vscode6.l10n.t("Always Allow")}`, description: vscode6.l10n.t("Remember this command and always allow"), result: "alwaysAllow" },
      { label: `$(close) ${vscode6.l10n.t("Deny")}`, description: vscode6.l10n.t("Block this command from running"), result: "deny" }
    ];
    const selected = await vscode6.window.showQuickPick(items, {
      placeHolder: vscode6.l10n.t("Command: {0}\nDirectory: {1}", command, cwd),
      title: vscode6.l10n.t("OpenClaw Node: Command Approval")
    });
    return (selected == null ? void 0 : selected.result) || "deny";
  }
  isCwdApproved(cwd) {
    const normalized = cwd.replace(/\\/g, "/").replace(/\/+$/, "");
    for (const approved of this.alwaysApprovedCwds) {
      const normalizedApproved = approved.replace(/\\/g, "/").replace(/\/+$/, "");
      if (normalized === normalizedApproved || normalized.startsWith(normalizedApproved + "/")) {
        return true;
      }
    }
    return false;
  }
  async handleSystemRun(params) {
    const cmdStr = this.resolveCommand(params);
    const cwd = this.resolveCwd(params.cwd);
    const timeoutMs = params.timeoutMs || params.timeout || 12e4;
    if (!cmdStr) {
      throw new Error("No command specified");
    }
    this.log(`EXEC input: command=${JSON.stringify(params.command)} rawCommand=${JSON.stringify(params.rawCommand)} cwd=${JSON.stringify(params.cwd)} type=${typeof params.command}`);
    this.log(`EXEC: ${cmdStr} (cwd=${cwd}, timeout=${timeoutMs})`);
    if (!this.isCwdApproved(cwd)) {
      const decision = await this.promptForApproval(cmdStr, cwd);
      this.log(`EXEC approval: ${decision}`);
      if (decision === "deny") {
        return {
          stdout: "",
          stderr: "Command denied by user",
          exitCode: 1,
          success: false,
          timedOut: false,
          error: "Command denied by user"
        };
      }
      if (decision === "alwaysAllow") {
        this.alwaysApprovedCwds.add(cwd);
        this.log(`EXEC: Always Allow registered for cwd=${cwd}`);
      }
    }
    return new Promise((resolve2, reject) => {
      const { exec } = require("child_process");
      let shellOpt = true;
      if (process.platform === "win32") {
        const lower = cmdStr.toLowerCase().trim();
        if (lower.startsWith("powershell ") || lower.startsWith("pwsh ")) {
          shellOpt = "powershell.exe";
        } else if (lower.startsWith("wsl ")) {
          shellOpt = "wsl.exe";
        }
      }
      const child = exec(cmdStr, {
        cwd,
        timeout: timeoutMs,
        maxBuffer: 1024 * 1024 * 10,
        env: { ...process.env, ...params.env },
        shell: shellOpt
      }, (error, stdout, stderr) => {
        const hasOutput = !!(stdout || "").trim();
        if (error && error.killed) {
          resolve2({
            stdout: stdout || "",
            stderr: stderr || "",
            exitCode: -1,
            success: false,
            timedOut: true,
            error: "Command timed out"
          });
        } else if (error && !hasOutput) {
          resolve2({
            stdout: stdout || "",
            stderr: stderr || "",
            exitCode: error.code || 1,
            success: false,
            timedOut: false,
            error: error.message || ""
          });
        } else {
          resolve2({
            stdout: stdout || "",
            stderr: stderr || "",
            exitCode: 0,
            success: true,
            timedOut: false,
            error: null
          });
        }
      });
      child.on("error", (err) => {
        reject(err);
      });
    });
  }
  // ─── Helpers ───
  buildSignMessage(nonce, deviceId, clientId, clientMode, role, scopes, signedAtMs, token) {
    const version = nonce ? "v2" : "v1";
    const parts = [
      version,
      deviceId,
      clientId,
      clientMode,
      role,
      scopes.join(","),
      String(signedAtMs),
      token || ""
    ];
    if (version === "v2") {
      parts.push(nonce || "");
    }
    return parts.join("|");
  }
  signMessage(message) {
    if (!this.deviceKeyObject)
      throw new Error("Key not initialized");
    const data = Buffer.from(message, "utf-8");
    const signature = crypto.sign(null, data, this.deviceKeyObject);
    return base64UrlEncode(signature);
  }
  async request(method, params = {}, timeoutMs = 6e4) {
    if (!this.ws || this.ws.readyState !== import_websocket.default.OPEN) {
      throw new Error("not connected");
    }
    return new Promise((resolve2, reject) => {
      const id = Math.random().toString(36).substring(2, 12);
      this.pending.set(id, { resolve: resolve2, reject });
      const msg = { type: "req", id, method, params };
      this.ws.send(JSON.stringify(msg));
      setTimeout(() => {
        if (this.pending.has(id)) {
          this.pending.delete(id);
          reject(new Error(`Request timed out: ${method}`));
        }
      }, timeoutMs);
    });
  }
  scheduleReconnect() {
    if (this.reconnectTimer || this.closed)
      return;
    this.log(`Reconnecting in ${this.reconnectDelay}ms...`);
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, this.reconnectDelay);
    this.reconnectDelay = Math.min(this.reconnectDelay * 1.5, this.maxReconnectDelay);
  }
  disconnect() {
    this.closed = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.connectTimer) {
      clearTimeout(this.connectTimer);
      this.connectTimer = null;
    }
    if (this.ws) {
      try {
        this.ws.close();
      } catch {
      }
      this.ws = null;
    }
    this._connected = false;
  }
};
function base64UrlEncode(buffer) {
  let buf;
  if (Buffer.isBuffer(buffer)) {
    buf = buffer;
  } else if (buffer instanceof Uint8Array) {
    buf = Buffer.from(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  } else {
    buf = Buffer.from(buffer);
  }
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function base64UrlDecode(str) {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4)
    base64 += "=";
  return Buffer.from(base64, "base64");
}

// src/chatView.ts
var vscode4 = __toESM(require("vscode"));
var fs3 = __toESM(require("fs"));
var path4 = __toESM(require("path"));

// src/utils.ts
var os = __toESM(require("os"));
var path = __toESM(require("path"));
function resolveAgentsDir(configValue) {
  const value = (configValue || "").trim();
  if (!value) {
    return path.join(os.homedir(), ".openclaw", "agents");
  }
  let expanded = value;
  if (expanded === "~") {
    expanded = os.homedir();
  } else if (expanded.startsWith("~/") || expanded.startsWith("~\\")) {
    expanded = path.join(os.homedir(), expanded.slice(2));
  }
  return path.resolve(expanded);
}
function getMediaInfo(ext) {
  switch (ext) {
    case ".png":
      return { mimeType: "image/png", tag: "img" };
    case ".jpg":
    case ".jpeg":
      return { mimeType: "image/jpeg", tag: "img" };
    case ".gif":
      return { mimeType: "image/gif", tag: "img" };
    case ".webp":
      return { mimeType: "image/webp", tag: "img" };
    case ".svg":
      return { mimeType: "image/svg+xml", tag: "img" };
    case ".mp4":
      return { mimeType: "video/mp4", tag: "video" };
    case ".webm":
      return { mimeType: "video/webm", tag: "video" };
    case ".ogv":
      return { mimeType: "video/ogg", tag: "video" };
    case ".avi":
      return { mimeType: "video/x-msvideo", tag: "video" };
    case ".mov":
      return { mimeType: "video/quicktime", tag: "video" };
    case ".mp3":
      return { mimeType: "audio/mpeg", tag: "audio" };
    case ".wav":
      return { mimeType: "audio/wav", tag: "audio" };
    case ".ogg":
    case ".oga":
      return { mimeType: "audio/ogg", tag: "audio" };
    case ".m4a":
      return { mimeType: "audio/mp4", tag: "audio" };
    case ".flac":
      return { mimeType: "audio/flac", tag: "audio" };
    default:
      return { mimeType: "application/octet-stream", tag: "video" };
  }
}
function getNonce() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
function genId() {
  return Math.random().toString(36).substring(2, 12);
}
var MIME_MAP = {
  ".txt": "text/plain",
  ".md": "text/markdown",
  ".json": "application/json",
  ".js": "application/javascript",
  ".ts": "application/typescript",
  ".jsx": "application/javascript",
  ".tsx": "application/typescript",
  ".py": "text/x-python",
  ".rb": "text/x-ruby",
  ".go": "text/x-go",
  ".rs": "text/x-rust",
  ".java": "text/x-java",
  ".c": "text/x-c",
  ".cpp": "text/x-c++",
  ".h": "text/x-c",
  ".hpp": "text/x-c++",
  ".cs": "text/x-csharp",
  ".php": "text/x-php",
  ".swift": "text/x-swift",
  ".kt": "text/x-kotlin",
  ".scala": "text/x-scala",
  ".html": "text/html",
  ".htm": "text/html",
  ".css": "text/css",
  ".scss": "text/x-scss",
  ".less": "text/x-less",
  ".xml": "application/xml",
  ".yaml": "application/yaml",
  ".yml": "application/yaml",
  ".toml": "application/toml",
  ".ini": "text/plain",
  ".cfg": "text/plain",
  ".sh": "text/x-shellscript",
  ".bash": "text/x-shellscript",
  ".zsh": "text/x-shellscript",
  ".fish": "text/x-shellscript",
  ".bat": "text/plain",
  ".cmd": "text/plain",
  ".ps1": "text/plain",
  ".sql": "text/x-sql",
  ".graphql": "text/x-graphql",
  ".env": "text/plain",
  ".gitignore": "text/plain",
  ".dockerignore": "text/plain",
  ".csv": "text/csv",
  ".tsv": "text/tab-separated-values",
  ".log": "text/plain",
  ".conf": "text/plain",
  ".config": "text/plain",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".bmp": "image/bmp",
  ".ico": "image/x-icon",
  ".tiff": "image/tiff",
  ".pdf": "application/pdf",
  ".zip": "application/zip",
  ".gz": "application/gzip",
  ".tar": "application/x-tar",
  ".mp3": "audio/mpeg",
  ".mp4": "video/mp4",
  ".wav": "audio/wav",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".wasm": "application/wasm"
};
function getMimeType(filePath) {
  const dot = filePath.lastIndexOf(".");
  if (dot === -1)
    return "text/plain";
  const ext = filePath.substring(dot).toLowerCase();
  return MIME_MAP[ext] || "text/plain";
}
function stripMedia(text) {
  if (!text)
    return "";
  let t = String(text);
  t = t.replace(/<audio[^>]*>[\s\S]*?<\/audio>/gi, "");
  t = t.replace(/<audio[\s\S]*?>/gi, "");
  t = t.split("\n").filter((line) => !line.startsWith("MEDIA:")).join("\n");
  return t.trim();
}
function normText(text) {
  if (!text)
    return "";
  return String(text).replace(/\s+/g, " ").trim();
}
function isPreamble(text, seenPreambleTexts) {
  if (!seenPreambleTexts.length)
    return false;
  const norm = normText(stripMedia(text));
  if (!norm)
    return false;
  return seenPreambleTexts.some((p) => normText(p) === norm);
}

// src/webviewHandler.ts
var fs2 = __toESM(require("fs"));
var path3 = __toESM(require("path"));
var vscode2 = __toESM(require("vscode"));

// src/agentTree.ts
var fs = __toESM(require("fs"));
var path2 = __toESM(require("path"));
function buildAgentsTree(dir, maxDepth = 3, depth = 0, log2 = (msg) => log(msg, LOG_INFO)) {
  const children = [];
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name.startsWith("."))
        continue;
      const fullPath = path2.join(dir, entry.name);
      const node = { name: entry.name, path: fullPath };
      if (entry.isDirectory()) {
        node.type = "directory";
        if (depth < maxDepth) {
          node.children = buildAgentsTree(fullPath, maxDepth, depth + 1, log2).children;
        } else {
          node.children = [];
        }
      } else if (entry.isFile()) {
        node.type = "file";
        node.children = void 0;
      } else {
        node.type = "file";
        node.children = void 0;
      }
      children.push(node);
    }
  } catch (err) {
    log2(`buildAgentsTree: read ${dir} failed: ${(err == null ? void 0 : err.message) || err}`);
  }
  children.sort((a, b) => {
    if (a.type === "directory" && b.type !== "directory")
      return -1;
    if (a.type !== "directory" && b.type === "directory")
      return 1;
    return a.name.localeCompare(b.name);
  });
  return { name: path2.basename(dir) || dir, path: dir, type: "directory", children };
}
function handleRequestAgentsTree(agentsDir, postToWebview, log2) {
  try {
    const dir = agentsDir;
    if (!dir || !fs.existsSync(dir)) {
      postToWebview({ type: "agentsTree", tree: null, dir: dir || "" });
      return;
    }
    const tree = buildAgentsTree(dir, 3, 0, log2);
    postToWebview({ type: "agentsTree", tree, dir });
  } catch (err) {
    log2(`handleRequestAgentsTree error: ${(err == null ? void 0 : err.message) || err}`);
    postToWebview({ type: "agentsTree", tree: null, dir: agentsDir });
  }
}

// src/modelscopeHandler.ts
var vscode = __toESM(require("vscode"));
async function handleFetchModelscopeAgents(ctx, page, pageSize) {
  try {
    console.log("[MS-H] handleFetchModelscopeAgents called, page:", page, "pageSize:", pageSize);
    const url = "https://modelscope.cn/api/v1/agents?PageNumber=" + page + "&PageSize=" + pageSize;
    const response = await fetch(url);
    console.log("[MS-H] API response status:", response.status);
    const data = await response.json();
    if (data.Success && data.Data && Array.isArray(data.Data.AgentList)) {
      const agents = data.Data.AgentList.map((raw) => {
        const name = String(raw.Name || "");
        const path5 = String(raw.Path || "");
        const fullId = path5 && name ? path5 + "/" + name : name;
        return {
          id: fullId,
          name,
          display_name: String(raw.DisplayName || raw.Name || ""),
          description: String(raw.Description || ""),
          categories: Array.isArray(raw.Catalogues) ? raw.Catalogues : [],
          custom_tags: Array.isArray(raw.CustomTags) ? raw.CustomTags : [],
          framework: String(raw.Framework || ""),
          downloads: Number(raw.Downloads || 0),
          likes: Number(raw.Stars || 0),
          logo_url: String(raw.LogoUrl || "")
        };
      });
      console.log("[MS-H] Posting result, agents count:", agents.length);
      ctx.postToWebview({
        type: "modelscopeAgentsResult",
        agents,
        totalCount: Number(data.Data.TotalCount || 0),
        page,
        pageSize
      });
    } else {
      ctx.postToWebview({ type: "modelscopeAgentsError", error: String(data.Message || "\u8BF7\u6C42\u5931\u8D25") });
    }
  } catch (error) {
    ctx.postToWebview({
      type: "modelscopeAgentsError",
      error: error instanceof Error ? error.message : "\u7F51\u7EDC\u9519\u8BEF"
    });
  }
}

// src/webviewHandler.ts
async function handleWebviewMessage(msg, ctx, webviewView) {
  switch (msg.type) {
    case "webviewReady":
      if (ctx.gateway.connected) {
        await ctx.handleRequestAgents();
        await ctx.handleRequestModels();
        await ctx.handleRequestSessions();
        await ctx.handleRequestTasks();
        await ctx.handleLoadDefaults();
        await ctx.handleLoadMessages(ctx.currentSessionKey);
      }
      ctx.postToWebview({
        type: "init",
        sessionKey: ctx.currentSessionKey,
        gwSessionKey: ctx.gwSessionKey(),
        model: ctx.currentModel,
        connected: ctx.gateway.connected,
        agent: ctx.activeAgent,
        gatewayUrl: ctx.gatewayUrl,
        thinkingLevel: ctx.thinkingLevel,
        verboseLevel: ctx.verboseLevel,
        messageHistory: ctx.messageHistory,
        supervisionEnabled: ctx.supervisionEnabled,
        version: ctx.serverVersion
      });
      break;
    case "sendMessage":
      await ctx.handleSendMessage(msg.text, msg.fileRefs, msg.attachments);
      break;
    case "stopStream":
      await ctx.handleStopStream();
      break;
    case "selectModel":
      ctx.currentModel = msg.model;
      break;
    case "cycleThinking":
      await ctx.cycleThinking();
      break;
    case "cycleVerbose":
      await ctx.cycleVerbose();
      break;
    case "requestModels":
      await ctx.handleRequestModels();
      break;
    case "requestSessions":
      await ctx.handleRequestSessions();
      break;
    case "requestAgents":
      await ctx.handleRequestAgents();
      break;
    case "requestAgentsTree":
      await handleRequestAgentsTree(ctx.agentsDir, ctx.postToWebview.bind(ctx), ctx.log.bind(ctx));
      break;
    case "fetchModelscopeAgents":
      await handleFetchModelscopeAgents(ctx, msg.page || 1, msg.pageSize || 9);
      break;
    case "openModelscopeAgent":
      if (msg.agentId) {
        vscode2.env.openExternal(vscode2.Uri.parse("https://modelscope.cn/agents/" + msg.agentId));
      }
      break;
    case "requestTasks":
      await ctx.handleRequestTasks();
      break;
    case "switchSession": {
      const ssGwKey = msg.sessionKey || "";
      const agentMatch = ssGwKey.match(/^agent:([^:]+):/);
      let sessionAgentId;
      if (agentMatch) {
        sessionAgentId = agentMatch[1];
        const ag = ctx.agents.find((a) => a.id === sessionAgentId);
        if (ag && (!ctx.activeAgent || ctx.activeAgent.id !== sessionAgentId)) {
          ctx.activeAgent = ag;
          ctx.postToWebview({ type: "agentSwitched", agent: ctx.activeAgent });
        }
      }
      const ssLocalKey = ctx.resolveSession(ssGwKey);
      ctx.currentSessionKey = ssLocalKey;
      await ctx.handleLoadMessages(ssLocalKey, sessionAgentId, msg.sessionId);
      break;
    }
    case "switchTab":
      if (msg.sessionKey) {
        const match = msg.sessionKey.match(/^agent:([^:]+):/);
        if (match) {
          const agentId = match[1];
          const ag = ctx.agents.find((a) => a.id === agentId);
          if (ag) {
            ctx.activeAgent = ag;
          }
        }
      }
      if (msg.agentId && (!ctx.activeAgent || ctx.activeAgent.id !== msg.agentId)) {
        const ag = ctx.agents.find((a) => a.id === msg.agentId);
        if (ag) {
          ctx.activeAgent = ag;
        } else {
          const byName = ctx.agents.find((a) => (a.name || "") === msg.agentId);
          if (byName)
            ctx.activeAgent = byName;
        }
      }
      const localSessionKey = ctx.resolveSession(msg.sessionKey || "main");
      ctx.currentSessionKey = localSessionKey;
      await ctx.handleLoadMessages(localSessionKey, void 0, msg.sessionId);
      ctx.postToWebview({ type: "agentSwitched", agent: ctx.activeAgent });
      break;
    case "deleteSession":
      await ctx.handleDeleteSession(msg.sessionKey);
      break;
    case "addChatTabFromSession": {
      const sessionKey = msg.sessionKey || "";
      const deviceName = msg.deviceName || sessionKey;
      const parts = deviceName.split(":");
      let tabLabel = parts[0].trim();
      if (tabLabel.length > 15)
        tabLabel = tabLabel.substring(0, 15) + "\u2026";
      let tabAgentId = "main";
      const match = sessionKey.match(/^agent:([^:]+):/);
      if (match)
        tabAgentId = match[1];
      const newTab = {
        id: "tab-" + sessionKey + "-" + Date.now(),
        label: tabLabel,
        agentId: tabAgentId,
        sessionKey,
        sessionId: msg.sessionId,
        messages: []
      };
      ctx.postToWebview({ type: "addChatTab", tab: newTab });
      ctx.currentSessionKey = ctx.resolveSession(sessionKey);
      await ctx.handleLoadMessages(ctx.currentSessionKey, tabAgentId, msg.sessionId);
      break;
    }
    case "switchAgent":
      await ctx.handleSwitchAgent(msg.agentId);
      break;
    case "copyCommand":
      await vscode2.env.clipboard.writeText(msg.text);
      vscode2.window.showInformationMessage(vscode2.l10n.t("Copied to clipboard"));
      break;
    case "copyImage": {
      const dataUrl = msg.dataUrl;
      if (dataUrl && typeof dataUrl === "string") {
        try {
          const base64Data = dataUrl.replace(/^data:image\/png;base64,/, "");
          const os2 = require("os");
          const tmpB64 = path3.join(os2.tmpdir(), "openclaw-clip-" + Date.now() + ".b64");
          fs2.writeFileSync(tmpB64, base64Data, "utf8");
          const psScript = "$b64 = [IO.File]::ReadAllText('" + tmpB64 + "').Trim(); Add-Type -AssemblyName System.Drawing; Add-Type -AssemblyName System.Windows.Forms; $bytes = [Convert]::FromBase64String($b64); $ms = New-Object System.IO.MemoryStream(,$bytes); $img = [System.Drawing.Image]::FromStream($ms); [System.Windows.Forms.Clipboard]::SetImage($img); $img.Dispose(); $ms.Dispose(); Write-Output 'CLIP_SET_OK';";
          const encoded = Buffer.from(psScript, "utf16le").toString("base64");
          const child_process = require("child_process");
          child_process.exec(
            "powershell -NoProfile -STA -EncodedCommand " + encoded,
            { timeout: 15e3 },
            (pErr, pStdout) => {
              try {
                fs2.unlinkSync(tmpB64);
              } catch (e) {
              }
              if (pErr || !String(pStdout || "").includes("CLIP_SET_OK")) {
                console.error("[copyImage] clipboard write failed:", pErr ? String(pErr) : "marker missing", String(pStdout || ""));
                vscode2.window.showErrorMessage(vscode2.l10n.t("Failed to copy image, please check output log"));
              } else {
                console.log("[copyImage] clipboard write OK");
              }
            }
          );
        } catch (copyErr) {
          console.error("copyImage failed:", copyErr);
          vscode2.window.showErrorMessage(vscode2.l10n.t("Copy image failed: {0}", String(copyErr)));
        }
      }
      break;
    }
    case "exportImage": {
      const dataUrl = msg.dataUrl;
      if (!dataUrl || typeof dataUrl !== "string") {
        vscode2.window.showErrorMessage(vscode2.l10n.t("Export failed: no image data received"));
        break;
      }
      try {
        const base64Data = dataUrl.replace(/^data:image\/png;base64,/, "");
        const ts = Date.now();
        const defaultName = "mermaid-" + ts + ".png";
        const saveUri = await vscode2.window.showSaveDialog({
          title: vscode2.l10n.t("Export Mermaid diagram as PNG"),
          defaultUri: vscode2.Uri.file(path3.join(require("os").homedir(), "Downloads", defaultName)),
          filters: { [vscode2.l10n.t("PNG Image (*.png)")]: ["png"] }
        });
        if (!saveUri) {
          console.log("[exportImage] user cancelled save dialog");
          break;
        }
        await vscode2.workspace.fs.writeFile(saveUri, Buffer.from(base64Data, "base64"));
        console.log("[exportImage] file written:", saveUri.fsPath);
        vscode2.window.showInformationMessage(vscode2.l10n.t("Exported: {0}", saveUri.fsPath));
      } catch (exportErr) {
        console.error("exportImage failed:", exportErr);
        vscode2.window.showErrorMessage(vscode2.l10n.t("Export failed: {0}", String(exportErr)));
      }
      break;
    }
    case "notify":
      if (msg && typeof msg.text === "string" && msg.text) {
        vscode2.window.showInformationMessage(msg.text);
      }
      break;
    case "mermaidError":
      if (msg.text) {
        vscode2.window.showWarningMessage(
          vscode2.l10n.t("Mermaid diagram render failed: {0}", msg.text)
        );
      }
      break;
    case "openSettings":
      vscode2.commands.executeCommand("workbench.action.openSettings", "openclaw");
      break;
    case "openModelPicker":
      vscode2.commands.executeCommand("openclaw.settings");
      break;
    case "searchFiles":
      await ctx.handleSearchFiles(msg.query, msg.requestId);
      break;
    case "openWorkdir":
      await ctx.handleOpenWorkdir();
      break;
    case "openFile": {
      const p = msg.path;
      if (p) {
        try {
          const uri = vscode2.Uri.file(p);
          const doc = await vscode2.workspace.openTextDocument(uri);
          await vscode2.window.showTextDocument(doc, { preview: true });
        } catch (e) {
          vscode2.window.showErrorMessage(vscode2.l10n.t("Failed to open file") + ": " + ((e == null ? void 0 : e.message) || e));
        }
      }
      break;
    }
    case "toggleSupervision":
      await ctx.handleToggleSupervision(msg.enabled);
      break;
    case "reconnect":
      vscode2.commands.executeCommand("openclaw.reconnect");
      break;
  }
}

// src/taskManager.ts
async function handleRequestTasks(cv) {
  cv.log(`handleRequestTasks called`);
  try {
    const res = await cv.gateway.request("tasks.list", {
      limit: 500
    });
    const allTasks = (res == null ? void 0 : res.tasks) || [];
    const activeTasks = allTasks.filter((t) => t.status === "queued" || t.status === "running");
    cv.log(`tasks.list: ${activeTasks.length} \u6761 (\u603B ${allTasks.length} \u6761)`);
    cv.postToWebview({ type: "tasksList", tasks: activeTasks });
  } catch (err) {
    cv.log(`tasks.list error: ${err.message}`);
    cv.postToWebview({ type: "tasksList", tasks: [] });
  }
}
async function handleRequestModels(cv) {
  cv.log(`handleRequestModels called`);
  try {
    const res = await cv.gateway.request("models.list", {});
    const models = (res == null ? void 0 : res.models) || [];
    cv.log(`models.list: ${models.length} models`);
    cv.postToWebview({ type: "modelsList", models });
  } catch (err) {
    cv.log(`models.list error: ${err.message}`);
    cv.postToWebview({ type: "modelsList", models: [] });
  }
}
async function handleRequestAgents(cv) {
  cv.log(`handleRequestAgents called`);
  try {
    const res = await cv.gateway.request("agents.list", {});
    const agents = (res == null ? void 0 : res.agents) || [];
    if (agents.length === 0)
      agents.push({ id: "main", name: "Agent" });
    cv.agents = agents;
    cv.log(`agents.list: ${agents.length} agents`);
    cv.postToWebview({ type: "agentsList", agents });
    cv.postToWebview({ type: "agentSwitched", agent: cv.activeAgent });
    if (typeof cv.resolveActiveAgent === "function")
      cv.resolveActiveAgent();
  } catch (err) {
    cv.log(`agents.list error: ${err.message}`);
    cv.postToWebview({ type: "agentsList", agents: [] });
  }
}

// src/uiRenderer.ts
var vscode3 = __toESM(require("vscode"));

// src/modelscopeUi.ts
function getModelscopeCss() {
  return `
/* \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
   Agents SUB-TABS (\u672C\u5730 / ModelScope)
   \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 */
.agents-sub-tabs {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}
.agents-sub-tab {
  padding: 4px 12px;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 12px;
  font-family: inherit;
  line-height: 1.4;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
  white-space: nowrap;
}
.agents-sub-tab:hover {
  background: rgba(128, 128, 128, 0.14);
  color: var(--text);
}
.agents-sub-tab.active {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
}
.agents-sub-panel {
  display: none;
  flex-direction: column;
  min-height: 0;
}
.agents-sub-panel.active {
  display: flex;
}

/* \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
   ModelScope Panel
   \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 */
.modelscope-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  padding: 8px;
}
.modelscope-agent-card {
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 12px;
  background: rgba(128, 128, 128, 0.04);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 6px;
  transition: transform 0.15s, box-shadow 0.15s, border-color 0.15s;
  overflow: hidden;
  min-width: 0;
}
.modelscope-agent-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  border-color: var(--accent);
}
.modelscope-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}
.modelscope-card-logo {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  object-fit: cover;
  background: rgba(128, 128, 128, 0.12);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: var(--text-muted);
}
.modelscope-card-title {
  font-weight: 600;
  font-size: 13px;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
  flex: 1;
}
.modelscope-card-desc {
  font-size: 12px;
  color: var(--text-muted);
  line-height: 1.45;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 3.2em;
}
.modelscope-card-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 11px;
  color: var(--text-muted);
  flex-wrap: wrap;
}
.modelscope-card-meta .ms-meta-item {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  white-space: nowrap;
}
.modelscope-card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 4px;
}
.modelscope-tag {
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 3px;
  background: rgba(128, 128, 128, 0.12);
  color: var(--text-muted);
  white-space: nowrap;
}
.modelscope-tag.cat {
  background: rgba(55, 148, 255, 0.15);
  color: var(--accent);
}
/* \u5361\u7247\u5185\u90E8\u5C0F\u6309\u94AE\u6761 */
.modelscope-card-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: auto;
  padding-top: 2px;
}
.modelscope-open-btn {
  font-size: 11px;
  color: var(--accent);
  border: 1px solid var(--accent);
  background: transparent;
  padding: 2px 10px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.modelscope-open-btn:hover {
  background: var(--accent);
  color: #fff;
}

.modelscope-loading {
  text-align: center;
  padding: 24px 12px;
  color: var(--text-muted);
  font-size: 12px;
}
.modelscope-loading-spinner {
  width: 24px;
  height: 24px;
  border: 3px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 10px;
}
.modelscope-error {
  text-align: center;
  padding: 24px 12px;
  color: #cc4444;
  font-size: 12px;
  line-height: 1.6;
}
.modelscope-error .retry-btn {
  display: inline-block;
  margin-top: 8px;
  padding: 4px 14px;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: transparent;
  color: var(--text);
  cursor: pointer;
  font-size: 12px;
  font-family: inherit;
}
.modelscope-error .retry-btn:hover {
  background: var(--hover);
}
.modelscope-empty {
  text-align: center;
  padding: 24px 12px;
  color: var(--text-muted);
  font-size: 12px;
}
.modelscope-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 8px;
  border-top: 1px solid var(--border);
  margin-top: 4px;
  flex-shrink: 0;
}
.modelscope-page-btn {
  padding: 4px 12px;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: transparent;
  color: var(--text);
  cursor: pointer;
  font-size: 12px;
  font-family: inherit;
  transition: background 0.15s, color 0.15s;
}
.modelscope-page-btn:hover:not(:disabled) {
  background: rgba(128, 128, 128, 0.14);
}
.modelscope-page-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.modelscope-page-info {
  font-size: 12px;
  color: var(--text-muted);
  white-space: nowrap;
}
`;
}
function getModelscopeHtml() {
  return `
        <div id="agents-panel-header" style="display:flex;justify-content:space-between;align-items:center;padding:6px 10px;border-bottom:1px solid var(--border);flex-shrink:0;">
          <span id="agents-panel-title" style="font-weight:600;color:var(--text);font-size:13px;text-transform:uppercase;letter-spacing:0.5px;">Agents</span>
          <div class="agents-sub-tabs">
            <button type="button" class="agents-sub-tab active" data-subtab="local">\u672C\u5730</button>
            <button type="button" class="agents-sub-tab" data-subtab="modelscope">ModelScope</button>
          </div>
        </div>
        <div id="tabAgentsContent" style="padding:8px 12px;overflow-y:auto;flex:1;">
          <div id="agents-local-panel" class="agents-sub-panel active"></div>
          <div id="agents-modelscope-panel" class="agents-sub-panel">
            <div id="modelscope-grid" class="modelscope-grid"></div>
            <div id="modelscope-loading" class="modelscope-loading" style="display:none;"><div class="modelscope-loading-spinner"></div>\u6B63\u5728\u52A0\u8F7D ModelScope \u667A\u80FD\u4F53...</div>
            <div id="modelscope-error" class="modelscope-error" style="display:none;"></div>
            <div id="modelscope-empty" class="modelscope-empty" style="display:none;">\u6682\u65E0\u667A\u80FD\u4F53</div>
            <div id="modelscope-pagination" class="modelscope-pagination" style="display:none;">
              <button id="modelscope-prev" class="modelscope-page-btn" disabled>\u4E0A\u4E00\u9875</button>
              <span id="modelscope-page-info" class="modelscope-page-info">\u7B2C 1 / 1 \u9875</span>
              <button id="modelscope-next" class="modelscope-page-btn" disabled>\u4E0B\u4E00\u9875</button>
            </div>
          </div>
        </div>
`;
}
function getModelscopeJs() {
  return `
  // HTML escape utility
  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, function(c) {
      return ({'&':'&','<':'<','>':'>','"':'"',"'":'&#39;'})[c];
    });
  }

  // Switch between Local / ModelScope sub-panels
  function switchAgentsSubTab(tab) {
    console.log('[MS] switchAgentsSubTab called, tab:', tab);
    document.querySelectorAll('.agents-sub-tab').forEach(function(el) {
      el.classList.remove('active');
    });
    var btn = document.querySelector('[data-subtab="' + tab + '"]');
    if (btn) btn.classList.add('active');
    document.querySelectorAll('.agents-sub-panel').forEach(function(el) {
      el.classList.remove('active');
    });
    console.log('[MS] modelscopeState.loaded:', modelscopeState.loaded, 'loading:', modelscopeState.loading);
    var panelId = (tab === 'local') ? 'agents-local-panel' : 'agents-modelscope-panel';
    var panel = document.getElementById(panelId);
    if (panel) panel.classList.add('active');
    console.log('[MS-DOM] switchAgentsSubTab: panelId=' + panelId, 'panel class=' + (panel ? panel.className : 'null'), 'panel display=' + (panel ? getComputedStyle(panel).display : 'null'));
    if (tab === 'modelscope') {
      if (!modelscopeState.loaded && !modelscopeState.loading) {
        console.log('[MS] calling fetchModelscopeAgents(1)');
        fetchModelscopeAgents(1);
      }
    }
  }

  // Fetch ModelScope agents from extension host
  function fetchModelscopeAgents(page) {
    console.log('[MS] fetchModelscopeAgents called, page:', page);
    modelscopeState.loading = true;
    modelscopeState.page = page;
    var loadingEl = document.getElementById('modelscope-loading');
    var errorEl = document.getElementById('modelscope-error');
    var emptyEl = document.getElementById('modelscope-empty');
    var gridEl = document.getElementById('modelscope-grid');
    var paginationEl = document.getElementById('modelscope-pagination');
    if (loadingEl) loadingEl.style.display = 'block';
    if (errorEl) errorEl.style.display = 'none';
    if (emptyEl) emptyEl.style.display = 'none';
    if (gridEl) gridEl.innerHTML = '';
    if (paginationEl) paginationEl.style.display = 'none';
    console.log('[MS] posting fetchModelscopeAgents message');
    vscode.postMessage({ type: 'fetchModelscopeAgents', page: page, pageSize: modelscopeState.pageSize });
  }

  // Open agent detail on modelscope.cn
  function openModelscopeAgent(agentId) {
    vscode.postMessage({ type: 'openModelscopeAgent', agentId: agentId });
  }

  // Render agent cards grid (event delegation, no inline handlers)
  function renderModelscopeGrid(agents) {
    var grid = document.getElementById('modelscope-grid');
    if (!grid) return;
    var html = '';
    for (var i = 0; i < agents.length; i++) {
      var a = agents[i];
      var tags = (a.custom_tags || []).slice(0, 3).map(function(t) {
        return '<span class="modelscope-tag">' + escapeHtml(t) + '</span>';
      }).join('');
      var cats = (a.categories || []).slice(0, 2).map(function(c) {
        return '<span class="modelscope-tag cat">' + escapeHtml(c) + '</span>';
      }).join('');
      var safeId = String(a.id || ''); // escapeHtml will handle XSS
      html += '<div class="modelscope-agent-card" data-agent-id="' + escapeHtml(safeId) + '">'
        + '<div class="modelscope-card-header">'
        + (a.logo_url ? '<img class="modelscope-card-logo" src="' + escapeHtml(a.logo_url) + '" alt="">' : '<div class="modelscope-card-logo">&#129302;</div>')
        + '<div class="modelscope-card-title" title="' + escapeHtml(a.display_name || '') + '">' + escapeHtml(a.display_name || a.id || '') + '</div>'
        + '</div>'
        + '<div class="modelscope-card-desc">' + escapeHtml((a.description || '').substring(0, 120)) + '</div>'
        + '<div class="modelscope-card-meta">'
        + '<span class="ms-meta-item">&#11015; ' + (a.downloads || 0) + '</span>'
        + '<span class="ms-meta-item">&#9733; ' + (a.likes || 0) + '</span>'
        + (a.framework ? '<span class="ms-meta-item">' + escapeHtml(a.framework) + '</span>' : '')
        + '</div>'
        + '<div class="modelscope-card-tags">' + cats + tags + '</div>'
        + '<div class="modelscope-card-actions">'
        + '<button class="modelscope-open-btn" data-action="open" data-agent-id="' + escapeHtml(safeId) + '">&#25171;&#24320;&#35814;&#24773;</button>'
        + '</div></div>';
    }
    grid.innerHTML = html;
    console.log('[MS-DOM] renderModelscopeGrid: grid child count=' + grid.children.length, 'grid rect=' + JSON.stringify(grid.getBoundingClientRect()));
    // Event delegation for card clicks
    grid.addEventListener('click', function(e) {
      var openBtn = e.target.closest('.modelscope-open-btn');
      if (openBtn) {
        e.stopPropagation();
        openModelscopeAgent(openBtn.dataset.agentId);
        return;
      }
      var card = e.target.closest('.modelscope-agent-card');
      if (card) openModelscopeAgent(card.dataset.agentId);
    });
  }

  // Render pagination controls
  function renderModelscopePagination() {
    var totalPages = Math.max(1, Math.ceil(modelscopeState.totalCount / modelscopeState.pageSize));
    var pageInfoEl = document.getElementById('modelscope-page-info');
    var prevBtn = document.getElementById('modelscope-prev');
    var nextBtn = document.getElementById('modelscope-next');
    var paginationEl = document.getElementById('modelscope-pagination');
    if (pageInfoEl) pageInfoEl.textContent = '\u7B2C ' + modelscopeState.page + ' / ' + totalPages + ' \u9875 (\u5171 ' + modelscopeState.totalCount + ')';
    if (prevBtn) prevBtn.disabled = modelscopeState.page <= 1;
    if (nextBtn) nextBtn.disabled = modelscopeState.page >= totalPages;
    if (paginationEl) paginationEl.style.display = 'flex';
  }
  // ModelScope pagination buttons
  var msPrevBtn = document.getElementById('modelscope-prev');
  var msNextBtn = document.getElementById('modelscope-next');
  if (msPrevBtn) {
    msPrevBtn.addEventListener('click', function() {
      if (modelscopeState.page > 1) fetchModelscopeAgents(modelscopeState.page - 1);
    });
  }
  if (msNextBtn) {
    msNextBtn.addEventListener('click', function() {
      fetchModelscopeAgents(modelscopeState.page + 1);
    });
  }

  // Bind agents-sub-tab click events
  (function() {
    var btns = document.querySelectorAll('.agents-sub-tab');
    for (var i = 0; i < btns.length; i++) {
      btns[i].addEventListener('click', function() {
        var tab = this.getAttribute('data-subtab');
        switchAgentsSubTab(tab);
      });
    }
  })();
`;
}

// src/uiRenderer.ts
function getHtml() {
  const nonce = getNonce();
  return (
    /*html*/
    `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline' https://cdnjs.cloudflare.com https://unpkg.com; script-src 'nonce-${nonce}' https://cdnjs.cloudflare.com https://unpkg.com; img-src data: https: blob: http:; media-src data: https: http:;">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
:root {
  --bg: var(--vscode-sideBar-background);
  --bg2: var(--vscode-editor-background);
  --text: var(--vscode-sideBar-foreground);
  --text-muted: var(--vscode-descriptionForeground);
  --border: var(--vscode-widget-border);
  --accent: var(--vscode-textLink-foreground, #3794ff);
  --input-bg: var(--vscode-input-background);
  --input-border: var(--vscode-input-border);
  --hover: var(--vscode-list-hoverBackground);
}
body {
  font-family: var(--vscode-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
  font-size: var(--vscode-font-size, 13px);
  color: var(--text);
  background: var(--bg);
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

/* \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
   HUD PANEL (top) \u2014 Agent Card + Sessions
   \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 */
#hud-panel {
  flex-shrink: 0;
  max-height: 45vh;
  overflow-y: auto;
  border-bottom: 2px solid var(--border);
}
#hud-panel::-webkit-scrollbar { width: 4px; }
#hud-panel::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

.agent-card {
  background: rgba(128, 128, 128, 0.04);
  border: 1px solid rgba(128, 128, 128, 0.1);
  margin: 8px 10px 4px;
  border-radius: 10px;
  overflow: hidden;
}

.agent-identity {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
}

.agent-orb {
  width: 36px; height: 36px; border-radius: 50%;
  display: inline-flex; align-items: center; justify-content: center;
  background: rgba(128, 128, 128, 0.12);
  color: var(--text-muted);
  flex-shrink: 0; font-size: 18px;
}
.agent-orb.online { color: #4ade80; }

.agent-info { min-width: 0; flex: 1; }
.agent-name { font-size: 14px; font-weight: 600; color: var(--text); line-height: 1.25; }
.agent-status { font-size: 12px; color: var(--text-muted); line-height: 1.3; }
.agent-status.online { color: #4ade80; }

/* Reconnect \u6309\u94AE\u6837\u5F0F\uFF1A\u4F4D\u4E8E agent-status \u53F3\u4FA7\uFF0C\u79BB\u7EBF\u65F6\u663E\u793A */
.btn-reconnect {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  margin-left: 8px;
  line-height: 1.4;
  flex-shrink: 0;
}
.btn-reconnect:hover {
  background: rgba(128, 128, 128, 0.2);
}

.hud-group-label {
  font-weight: 600; letter-spacing: 0.06em;
  color: var(--text-muted); text-transform: uppercase;
  font-size: 11px; margin: 8px 10px 4px; padding: 0;
}

.hud-section {
  margin: 0 6px 6px;
  border: 1px solid rgba(128, 128, 128, 0.14);
  border-radius: 10px;
  background: rgba(128, 128, 128, 0.04);
  overflow: hidden;
}

.hud-section-toggle {
  width: 100%; display: flex; align-items: center; gap: 8px;
  padding: 8px 10px; border: none; border-radius: 0;
  background: transparent; color: var(--text-muted);
  cursor: pointer; text-align: left; font-family: inherit; font-size: inherit;
  border-bottom: 1px solid rgba(128, 128, 128, 0.12); min-height: 40px;
}
.hud-section-toggle:disabled { cursor: default; }
.hud-section-toggle:not(:disabled):hover { background: rgba(128, 128, 128, 0.1); color: var(--text); }
.hud-section-label { color: var(--text-muted); flex: 0 0 auto; font-size: 11px; font-weight: 500; letter-spacing: 0.04em; text-transform: uppercase; }
.hud-section-value { flex: 1; min-width: 0; text-align: right; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 12px; display: flex; align-items: center; gap: 6px; }
.hud-section-chevron { color: var(--text-muted); opacity: 0.35; font-size: 13px; flex: 0 0 auto; }
.hud-section-toggle:disabled .hud-section-chevron { visibility: hidden; }
.open-workdir-btn {
  width: 24px; height: 24px; border-radius: 4px; border: 1px solid var(--border);
  background: transparent; color: var(--text-muted); cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px;
}
.open-workdir-btn:hover { background: var(--hover); color: var(--text); }
.open-workdir-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.device-item { display: flex; align-items: center; gap: 8px; padding: 8px 12px; cursor: pointer; border-bottom: 1px solid rgba(128, 128, 128, 0.08); }
.device-item:last-child { border-bottom: none; }
.device-item:hover { background: rgba(128, 128, 128, 0.06); transform: scale(1.01); }
.device-item.active { background: rgba(128, 128, 128, 0.1); }
.device-dot { width: 8px; height: 8px; border-radius: 50%; background: #888; flex-shrink: 0; }
.device-dot.active { background: var(--accent); }
.device-info { min-width: 0; flex: 1; }
.device-name { font-size: 12px; font-weight: 500; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.device-meta { font-size: 11px; color: var(--text-muted); }
.device-tokens { font-size: 11px; color: var(--text-muted); white-space: nowrap; }
.device-delete { background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 2px 4px; border-radius: 3px; opacity: 0; font-size: 12px; }
.device-item:hover .device-delete { opacity: 1; }
.device-delete:hover { color: #cc4444; background: rgba(204,68,68,0.1); }

.pairing-banner { background: var(--bg2); border: 1px solid var(--border); border-radius: 8px; padding: 12px 14px; margin: 8px 10px; color: var(--text); }
.pairing-title { font-weight: 600; color: var(--accent); margin: 0 0 6px 0; font-size: 13px; }
.pairing-desc { margin: 0 0 8px 0; font-size: 12px; color: var(--text-muted); line-height: 1.4; }
.pairing-label { font-size: 11px; font-weight: 500; color: var(--text-muted); margin: 8px 0 4px 0; }
.pairing-copy-box { background: var(--input-bg); border: 1px solid var(--input-border); border-radius: 6px; padding: 6px 8px; font-family: var(--vscode-editor-font-family, monospace); font-size: 12px; cursor: pointer; display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
.pairing-copy-box:hover { background: var(--hover); }
.pairing-copy-box code { color: var(--text); flex: 1; user-select: all; }
.pairing-copy-btn { font-size: 11px; color: var(--text-muted); margin-left: 8px; white-space: nowrap; }
.pairing-wait { display: flex; align-items: center; gap: 6px; margin-top: 10px; padding-top: 8px; border-top: 1px solid var(--border); font-size: 12px; color: var(--text-muted); }
.pairing-spinner { width: 12px; height: 12px; border: 2px solid var(--border); border-top-color: var(--accent); border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.busy-indicator {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  margin: 0 10px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: rgba(128, 128, 128, 0.06);
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 500;
}
.busy-indicator::before {
  content: "";
  width: 12px;
  height: 12px;
  border: 2px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  flex-shrink: 0;
}
.busy-indicator.hidden { display: none; }

/* Subagent activity indicator (Requirement A) */
.subagent-indicator {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  margin: 0 10px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: rgba(100, 160, 255, 0.06);
  color: var(--text-muted);
  font-size: 11px;
  font-weight: 500;
  transition: opacity 0.3s ease, max-height 0.3s ease, padding 0.3s ease, margin 0.3s ease;
  opacity: 1;
  max-height: 40px;
  overflow: hidden;
}
.subagent-indicator::before {
  content: "";
  width: 10px;
  height: 10px;
  border: 2px solid var(--border);
  border-top-color: #6aa0ff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  flex-shrink: 0;
}
.subagent-indicator.hidden {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
  margin-top: 0;
  margin-bottom: 0;
  border-width: 0;
}

/* sessions_yield indicator (Requirement B) */
.yield-indicator {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  margin: 0 10px;
  border: 1px solid rgba(230, 190, 60, 0.35);
  border-radius: 8px;
  background: rgba(230, 190, 60, 0.08);
  color: #e6be3c;
  font-size: 11px;
  font-weight: 500;
  transition: opacity 0.3s ease, max-height 0.3s ease, padding 0.3s ease, margin 0.3s ease;
  opacity: 1;
  max-height: 40px;
  overflow: hidden;
}
.yield-indicator::before {
  content: "";
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #e6be3c;
  animation: yield-pulse 1.2s ease-in-out infinite;
  flex-shrink: 0;
}
@keyframes yield-pulse {
  0%, 100% { opacity: 0.4; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.2); }
}
.yield-indicator.hidden {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
  margin-top: 0;
  margin-bottom: 0;
  border-width: 0;
}

.hud-footer { padding: 4px 10px 8px; display: flex; align-items: center; }
.hud-footer-badge { display: inline-flex; font-size: 11px; color: var(--text-muted); border: 1px solid rgba(128, 128, 128, 0.18); border-radius: 999px; padding: 3px 10px; letter-spacing: 0.02em; }

/* \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
   CHAT PANEL (bottom) \u2014 Messages + Input
   \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 */
#chat-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
}

/* Top row: messages + progress panel side by side */
#top-row {
  flex: 1;
  display: flex;
  flex-direction: row;
  overflow: hidden;
  min-height: 0;
}

/* Left messages container */
#messages-container {
  flex: 1;
  min-width: 200px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
}

/* Right progress note panel */
#progress-note-panel {
  width: 280px;
  min-width: 220px;
  max-width: 450px;
  background: var(--background);
  border-left: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  flex-shrink: 0;
}
#progress-note-panel.collapsed {
  width: 0 !important;
  min-width: 0 !important;
  max-width: 0 !important;
  border-left: none;
  overflow: hidden;
}
#progress-note-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 10px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}
#progress-note-panel-title {
  font-weight: 600;
  color: var(--text);
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
#progress-note-panel-toggle {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 14px;
  padding: 2px 6px;
  border-radius: 4px;
  line-height: 1;
}
#progress-note-panel-toggle:hover {
  background: var(--hover);
  color: var(--text);
}
#progress-note-panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}
#progress-note-panel-content::-webkit-scrollbar { width: 4px; }
#progress-note-panel-content::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }
.progress-resize-handle { width: 4px; cursor: ew-resize; background: transparent; flex-shrink: 0; }
.progress-resize-handle:hover { background: var(--accent); opacity: 0.5; }
.progress-resize-handle.dragging { background: var(--accent); opacity: 0.7; }
#progress-note-panel.collapsed + .progress-resize-handle { width: 4px; cursor: ew-resize; background: var(--accent); opacity: 0.3; }
/* \u53F3\u4FA7 overlay \u6837\u5F0F */
#progress-note-panel.right-overlay { position: absolute; right: 0; top: 0; bottom: 0; z-index: 1000; }
#progress-note-panel.right-overlay .tab-pane { height: 100%; overflow-y: auto; }

/* Panel Tab \u680F */
.panel-tabs {
  display: flex;
  gap: 0;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
  padding: 0 6px;
}
.panel-tab {
  padding: 6px 12px;
  font-size: 12px;
  color: var(--text-muted);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: color 0.15s, border-color 0.15s;
}
.panel-tab:hover { color: var(--text); }
.panel-tab.active {
  color: var(--text);
  border-bottom-color: var(--accent);
  font-weight: 600;
}

/* Panel Tab \u5185\u5BB9\u533A */
.panel-tab-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
}
.tab-pane {
  display: none;
  flex: 1;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
}
.tab-pane.active { display: flex; }

.context-bar { height: 3px; background: rgba(128, 128, 128, 0.1); flex-shrink: 0; }
.context-fill { height: 100%; background: var(--accent); transition: width 0.3s; width: 0%; }
.context-fill.warning { background: #e2c044; }
.context-fill.danger { background: #cc4444; }

.tabs-bar { display: flex; align-items: center; gap: 2px; padding: 4px 10px; border-bottom: 1px solid var(--border); overflow-x: auto; flex-shrink: 0; }
.tabs-bar::-webkit-scrollbar { height: 0; }
.tab-item { display: flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; white-space: nowrap; flex-shrink: 0; }
.tab-item:hover { background: var(--hover); color: var(--text); }
.tab-item.active { background: var(--accent); color: #fff; }
.tab-close {
  margin-left: 4px;
  font-size: 14px;
  line-height: 1;
  opacity: 0;
  border-radius: 3px;
  padding: 0 2px;
  transition: opacity 0.15s;
}
.tab-item:hover .tab-close { opacity: 0.7; }
.tab-close:hover { opacity: 1 !important; background: rgba(255,255,255,0.15); }
.tab-add { background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 4px 6px; border-radius: 4px; font-size: 16px; }
.tab-add:hover { background: var(--hover); color: var(--text); }

.messages { flex: 1; overflow-y: auto; padding: 12px; display: flex; flex-direction: column; gap: 12px; min-height: 0; }
.messages::-webkit-scrollbar { width: 6px; }
.messages::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
.msg { display: flex; flex-direction: column; gap: 4px; }
.msg-user { align-items: flex-end; }
.msg-assistant { align-items: flex-start; }
.msg-bubble { max-width: 92%; padding: 10px 14px; border-radius: 12px; line-height: 1.55; word-break: break-word; white-space: pre-wrap; }
.msg-user .msg-bubble { background: var(--accent); color: #fff; border-bottom-right-radius: 4px; }
.msg-assistant .msg-bubble { background: var(--bg2); border: 1px solid var(--border); border-bottom-left-radius: 4px; }
.msg-time { font-size: 10px; color: var(--text-muted); padding: 0 4px; }
.msg-attachments { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
.msg-attachment-img { max-width: 200px; max-height: 200px; border-radius: 8px; border: 1px solid var(--border); object-fit: cover; }
.msg-bubble a { color: inherit; text-decoration: underline; }

.tool-call { display: flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 8px; background: rgba(128, 128, 128, 0.06); border: 1px solid var(--border); font-size: 12px; color: var(--text-muted); }

.typing { display: none; align-items: center; gap: 8px; padding: 8px 14px; font-size: 12px; color: var(--text-muted); }
.typing.active { display: flex; }
.typing-dots { display: flex; gap: 3px; }
.typing-dots span { width: 5px; height: 5px; border-radius: 50%; background: var(--text-muted); animation: blink 1.4s infinite; }
.typing-dots span:nth-child(2) { animation-delay: 0.2s; }
.typing-dots span:nth-child(3) { animation-delay: 0.4s; }
@keyframes blink { 0%, 80%, 100% { opacity: 0.3; } 40% { opacity: 1; } }

#input-area { padding: 8px 10px 12px; border-top: 1px solid var(--border); flex-shrink: 0; min-height: 80px; max-height: 50vh; position: relative; }
.input-meta { display: flex; align-items: center; gap: 6px; margin-bottom: 6px; }
.bar-chip { font-size: 11px; color: var(--text-muted); padding: 2px 6px; border-radius: 4px; cursor: pointer; }
.bar-chip:hover { background: var(--hover); color: var(--text); }
.bar-sep { color: var(--border); font-size: 10px; }
.input-row { display: flex; align-items: flex-end; gap: 6px; }
.input-box { flex: 1; background: var(--input-bg); border: 1px solid var(--input-border); color: var(--text); border-radius: 10px; padding: 10px 14px; font-size: 13px; font-family: inherit; resize: none; outline: none; min-height: 40px; line-height: 1.4; }
.input-box:focus { border-color: var(--accent); }
.resize-handle { height: 4px; cursor: ns-resize; background: transparent; flex-shrink: 0; transition: background 0.15s; }
.resize-handle:hover { background: var(--accent); opacity: 0.5; }
.resize-handle.dragging { background: var(--accent); opacity: 0.7; }
.send-btn { width: 36px; height: 36px; border-radius: 50%; border: none; background: var(--accent); color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.send-btn:hover { opacity: 0.85; }
.stop-btn { width: 36px; height: 36px; border-radius: 50%; border: none; background: #cc4444; color: #fff; cursor: pointer; display: none; align-items: center; justify-content: center; flex-shrink: 0; }
.stop-btn.active { display: flex; }
.stop-btn:hover { background: #aa3333; }

.empty-state { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; color: var(--text-muted); gap: 8px; padding: 20px; text-align: center; }
.empty-icon { font-size: 32px; opacity: 0.5; }
.empty-text { font-size: 13px; line-height: 1.5; }

/* Markdown in assistant bubbles */
.msg-assistant .msg-bubble h1, .msg-assistant .msg-bubble h2, .msg-assistant .msg-bubble h3,
.msg-assistant .msg-bubble h4, .msg-assistant .msg-bubble h5, .msg-assistant .msg-bubble h6 {
  margin: 8px 0 4px; line-height: 1.3;
}
.msg-assistant .msg-bubble h1 { font-size: 1.2em; }
.msg-assistant .msg-bubble h2 { font-size: 1.1em; }
.msg-assistant .msg-bubble h3 { font-size: 1em; }
.msg-assistant .msg-bubble p { margin: 4px 0; }
.msg-assistant .msg-bubble ul, .msg-assistant .msg-bubble ol {
  margin: 4px 0; padding-left: 20px;
}
.msg-assistant .msg-bubble li { margin: 2px 0; }
.msg-assistant .msg-bubble code {
  background: rgba(128,128,128,0.15); padding: 1px 4px; border-radius: 3px;
  font-family: var(--vscode-editor-font-family, monospace); font-size: 0.9em;
}
.msg-assistant .msg-bubble pre {
  background: rgba(0,0,0,0.2); border: 1px solid var(--border); border-radius: 6px;
  padding: 8px 10px; overflow-x: auto; margin: 6px 0;
}
.msg-assistant .msg-bubble pre code {
  background: none; padding: 0; font-size: 0.85em; line-height: 1.4;
}
.msg-assistant .msg-bubble blockquote {
  border-left: 3px solid var(--accent); padding-left: 10px; margin: 6px 0;
  color: var(--text-muted);
}
.msg-assistant .msg-bubble table {
  border-collapse: collapse; margin: 6px 0; width: 100%;
}
.msg-assistant .msg-bubble th, .msg-assistant .msg-bubble td {
  border: 1px solid var(--border); padding: 4px 8px; text-align: left; font-size: 12px;
}
.msg-assistant .msg-bubble th { background: rgba(128,128,128,0.1); font-weight: 600; }
.msg-assistant .msg-bubble a { color: var(--accent); text-decoration: none; }
.msg-assistant .msg-bubble a:hover { text-decoration: underline; }
.msg-assistant .msg-bubble hr {
  border: none; border-top: 1px solid var(--border); margin: 8px 0;
}
.msg-assistant .msg-bubble strong { font-weight: 600; }
.msg-assistant .msg-bubble em { font-style: italic; }
.msg-assistant .msg-bubble img { max-width: 100%; border-radius: 4px; display: block; margin: 4px 0; }
.msg-assistant .msg-bubble video { max-width: 100%; max-height: 400px; border-radius: 4px; display: block; margin: 4px 0; }
.msg-assistant .msg-bubble p:has(img), .msg-assistant .msg-bubble p:has(video) { margin: 0; }

/* \u8BED\u97F3\u6D88\u606F\u6837\u5F0F */
.msg-audio-bubble audio { max-width: 100%; display: block; margin: 4px 0; }

/* Mermaid diagram container */
.msg-assistant .msg-bubble .mermaid-wrapper {
  margin: 8px 0;
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
}
.msg-assistant .msg-bubble .mermaid-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 12px;
  background: rgba(128,128,128,0.08);
  border-bottom: 1px solid var(--border);
}
.msg-assistant .msg-bubble .mermaid-label {
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 500;
}
.msg-assistant .msg-bubble .mermaid-copy {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s;
}
.msg-assistant .msg-bubble .mermaid-copy:hover {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
}
.msg-assistant .msg-bubble .mermaid-btn-group {
  display: flex;
  align-items: center;
  gap: 4px;
}
/* \u901A\u7528 Mermaid \u6309\u94AE\u6837\u5F0F\uFF08\u56FE\u50CF/\u6E90\u7801/\u590D\u5236/\u5BFC\u51FA \u7EDF\u4E00\uFF09 */
.msg-assistant .msg-bubble .mermaid-btn,
.msg-assistant .msg-bubble .mermaid-copy-btn {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s;
}
.msg-assistant .msg-bubble .mermaid-btn:hover,
.msg-assistant .msg-bubble .mermaid-copy-btn:hover {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
}
.msg-assistant .msg-bubble .mermaid-btn.active,
.msg-assistant .msg-bubble .mermaid-copy-btn.copied {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
}
.msg-assistant .msg-bubble .mermaid-container {
  padding: 12px;
  text-align: center;
  overflow-x: auto;
}
/* \u8BA9\u542B Mermaid \u7684 bubble \u4E0D\u53D7 msg-bubble \u5168\u5C40 max-width \u9650\u5236\uFF0C\u81EA\u52A8\u6491\u6EE1 */
.msg-assistant .msg-bubble:has(.mermaid-full-width) {
  max-width: 100%;
}
.msg-assistant .msg-bubble .mermaid-container svg {
  width: 100%;
  height: auto;
}
.msg-assistant .msg-bubble .mermaid-wrapper {
  width: 100%;
}
.msg-assistant .msg-bubble .mermaid-source {
  margin: 0 !important;
  padding: 0 !important;
}
.msg-assistant .msg-bubble .mermaid-error {
  background: rgba(0,0,0,0.2);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 12px;
  color: var(--text-muted);
}
  padding: 8px 10px;
  font-family: monospace;
  font-size: 0.85em;
  color: #cc4444;
  overflow-x: auto;
  white-space: pre-wrap;
}

/* HUD Toggle */
.hud-toggle {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 4px 6px;
  border-radius: 4px;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.hud-toggle:hover { background: var(--hover); color: var(--text); }
.hud-toggle.active { color: var(--accent); }
#hud-panel.hidden { display: none; }

/* Agent Buttons Row */
.agent-buttons {
  display: flex;
  gap: 6px;
  padding: 6px 14px 10px;
  overflow-x: auto;
  flex-wrap: nowrap;
}
.agent-buttons::-webkit-scrollbar { height: 0; }
.agent-btn {
  flex-shrink: 0;
  padding: 5px 12px;
  border-radius: 8px;
  border: 1px solid rgba(128,128,128,0.18);
  background: rgba(128,128,128,0.06);
  color: var(--text-muted);
  font-size: 12px;
  font-family: inherit;
  cursor: pointer;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: background 0.15s, color 0.15s;
}
.agent-btn:hover { background: rgba(128,128,128,0.14); color: var(--text); }
.agent-btn.active { background: var(--accent); color: #fff; border-color: var(--accent); }
.agent-btn-emoji { font-size: 13px; }

/* Attachment Preview */
.attachment-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 6px;
  max-height: 120px;
  overflow-y: auto;
}
.attachment-preview::-webkit-scrollbar { width: 4px; }
.attachment-preview::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }
.attachment-preview:empty { display: none; }
.attachment-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(128, 128, 128, 0.1);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 4px 8px;
  font-size: 11px;
  color: var(--text);
  max-width: 200px;
}
.attachment-chip-icon { flex-shrink: 0; font-size: 10px; font-family: Consolas, monospace; font-weight: bold; color: var(--accent, #3794ff); }
.attachment-chip-info { min-width: 0; flex: 1; overflow: hidden; }
.attachment-chip-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
}
.attachment-chip-size { color: var(--text-muted); font-size: 10px; }
.attachment-chip-remove {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0 2px;
  font-size: 14px;
  line-height: 1;
  border-radius: 3px;
  flex-shrink: 0;
}
.attachment-chip-remove:hover { color: #cc4444; background: rgba(204,68,68,0.1); }
.attach-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 18px;
}
.attach-btn:hover { background: var(--hover); color: var(--text); }

/* @ Mention Dropdown */
.at-dropdown {
  position: absolute;
  bottom: 100%;
  left: 0;
  right: 0;
  max-height: 240px;
  overflow-y: auto;
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 8px;
  box-shadow: 0 -4px 12px rgba(0,0,0,0.25);
  display: none;
  z-index: 100;
}
.at-dropdown.visible { display: block; }
.at-dropdown::-webkit-scrollbar { width: 4px; }
.at-dropdown::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }
.at-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  cursor: pointer;
  font-size: 12px;
  color: var(--text);
  border-bottom: 1px solid rgba(128,128,128,0.08);
}
.at-item:last-child { border-bottom: none; }
.at-item:hover, .at-item.active { background: var(--hover); }
.at-icon { flex-shrink: 0; width: 16px; text-align: center; font-size: 13px; color: var(--text-muted); }
.at-label { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.at-empty { padding: 10px 12px; font-size: 12px; color: var(--text-muted); text-align: center; }
.slash-separator {
  padding: 4px 12px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--text-muted);
  letter-spacing: 0.5px;
  border-bottom: 1px solid rgba(128,128,128,0.08);
  cursor: default;
}

/* Progress card styles - theme-adaptive */
.progress-card {
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 16px;
  margin: 12px 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  transition: all 0.3s ease;
}
.progress-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}
.progress-card .title {
  font-weight: 600;
  color: var(--text);
  margin-bottom: 8px;
  font-size: 15px;
}
.progress-card .progress-bar {
  height: 6px;
  background: var(--border);
  border-radius: 3px;
  margin: 8px 0;
  overflow: hidden;
}
.progress-card .progress-fill {
  height: 100%;
  background: var(--accent);
  transition: width 0.4s ease;
}
.progress-card .status {
  font-size: 13px;
  color: var(--text-muted);
}
.progress-card .steps {
  margin-top: 12px;
  font-size: 13px;
  color: var(--text-muted);
}
/* Step status indicators */
.step-item { display: flex; align-items: flex-start; gap: 6px; margin: 3px 0; font-size: 12px; }
.step-icon { flex-shrink: 0; width: 16px; text-align: center; }
.step-icon.completed { color: #4ade80; }
.step-icon.in_progress { color: #facc15; }
.step-icon.pending { color: var(--text-muted); }
.step-text { flex: 1; word-break: break-word; }
/* Markdown elements inside progress-card (for marked.parse output) */
.progress-card h1, .progress-card h2, .progress-card h3,
.progress-card h4, .progress-card h5, .progress-card h6 {
  margin: 8px 0 4px 0; line-height: 1.3;
}
.progress-card h1 { font-size: 1.2em; }
.progress-card h2 { font-size: 1.1em; }
.progress-card h3 { font-size: 1em; }
.progress-card p { margin: 4px 0; }
.progress-card ul, .progress-card ol { margin: 4px 0; padding-left: 20px; }
.progress-card li { margin: 2px 0; }
.progress-card code {
  background: rgba(128,128,128,0.15); padding: 1px 4px; border-radius: 3px;
  font-family: var(--vscode-editor-font-family, monospace); font-size: 0.9em;
}
.progress-card pre {
  background: rgba(0,0,0,0.1); border: 1px solid var(--border); border-radius: 6px;
  padding: 8px 10px; overflow-x: auto; margin: 6px 0;
}
.progress-card pre code { background: none; padding: 0; font-size: 0.85em; line-height: 1.4; }
.progress-card blockquote {
  border-left: 3px solid var(--accent); padding-left: 10px; margin: 6px 0;
  color: var(--text-muted);
}
.progress-card table { border-collapse: collapse; margin: 6px 0; width: 100%; }
.progress-card th, .progress-card td {
  border: 1px solid var(--border); padding: 4px 8px; text-align: left; font-size: 12px;
}
.progress-card th { background: rgba(128,128,128,0.1); font-weight: 600; }
.progress-card td { }
.progress-card strong { font-weight: 600; }
.progress-card em { font-style: italic; }
.progress-card a { color: var(--accent); text-decoration: none; }
.progress-card a:hover { text-decoration: underline; }
.progress-card hr { border: none; border-top: 1px solid var(--border); margin: 8px 0; }
.progress-card-copy-btn { background: none; border: none; cursor: pointer; font-size: 16px; padding: 2px 4px; margin-left: 2px; }
.progress-card-md-btn { background: none; border: none; cursor: pointer; font-size: 16px; padding: 2px 4px; margin-left: 2px; }
.progress-card .copy-bar { display: flex; align-items: center; gap: 4px; padding-bottom: 6px; border-bottom: 1px solid var(--border); margin-bottom: 6px; }
/* Agents Tree Styles */
.agents-tree {
  padding: 8px;
}
${getModelscopeCss()}
.agents-tree-item {
  display: flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  user-select: none;
}
.agents-tree-item:hover {
  background-color: rgba(128, 128, 128, 0.1);
}
.agents-tree-item.active {
  background-color: rgba(0, 120, 215, 0.15);
  border-left: 2px solid var(--accent);
}
.agents-tree-item.folder {
  font-weight: 500;
}
.agents-tree-item.file {
  font-weight: normal;
  opacity: 0.8;
}
.agents-tree-item.file:hover {
  opacity: 1;
}
.agents-tree-icon {
  margin-right: 6px;
  flex-shrink: 0;
  width: 16px;
  text-align: center;
}
.agents-tree-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.agents-tree-depth-0 { margin-left: 0px; }
.agents-tree-depth-1 { margin-left: 16px; }
.agents-tree-depth-2 { margin-left: 32px; }
.agents-tree-depth-3 { margin-left: 48px; }
.agents-tree-depth-4 { margin-left: 64px; }
.agents-tree-node { display: flex; flex-direction: column; }
.agents-tree-arrow {
  width: 16px;
  text-align: center;
  flex-shrink: 0;
  cursor: pointer;
  user-select: none;
  color: var(--text-muted);
  font-size: 10px;
  line-height: 1;
}
.agents-tree-children {
  overflow: hidden;
}
.agents-tree-item.empty-dir {
  opacity: 0.5;
  color: var(--text-muted);
}
.agents-tree-item.folder {
  font-weight: 500;
}
</style>
</head>
<body>

<!-- \u2550\u2550\u2550 HUD PANEL \u2550\u2550\u2550 -->
<div id="hud-panel">
  <div class="agent-card" id="agentCard">
    <div class="agent-identity">
      <div class="agent-orb" id="agentOrb">\u{1F916}</div>
      <div class="agent-info">
        <div class="agent-name" id="agentName">Agent</div>
        <div style="display:flex;align-items:center;">
          <div class="agent-status" id="agentStatus">Connecting...</div>
          <button class="btn-reconnect" id="btnReconnect" style="display:none;">${vscode3.l10n.t("Reconnect")}</button>
        </div>
      </div>
    </div>
    <div class="agent-buttons" id="agentButtons"></div>
    <div class="hud-group-label">SETTINGS</div>
    <div class="hud-section">
      <button class="hud-section-toggle" id="btnModel">
        <span class="hud-section-label">AI MODEL</span>
        <span class="hud-section-value" id="modelValue">default</span>
        <span class="hud-section-chevron">\u203A</span>
      </button>
      <button class="hud-section-toggle" id="btnReliability">
        <span class="hud-section-label">RELIABILITY</span>
        <span class="hud-section-value" id="reliabilityValue">default</span>
        <span class="hud-section-chevron">\u203A</span>
      </button>
      <button class="hud-section-toggle" id="btnServer">
        <span class="hud-section-label">SERVER</span>
        <span class="hud-section-value" id="serverValue">127.0.0.1:18789</span>
        <span class="hud-section-chevron">\u203A</span>
      </button>
    </div>
    <div class="hud-group-label">SESSIONS</div>
    <div class="hud-section">
      <div id="sessionsList"></div>
    </div>
    <div class="hud-footer">
      <span class="hud-footer-badge" id="footerVersion">OPENCLAW v...</span>
    </div>
  </div>

  <div class="pairing-banner" id="pairingBanner" style="display:none;">
    <div class="pairing-title">Device pairing required</div>
    <p class="pairing-desc">This device needs approval before it can connect.</p>
    <p class="pairing-label">Run on the server:</p>
    <div class="pairing-copy-box" id="pairingCopyBox">
      <code>openclaw devices approve --latest</code>
      <span class="pairing-copy-btn">Copy</span>
    </div>
    <p class="pairing-desc">Or tell your bot: "approve the pending device"</p>
    <div class="pairing-wait">
      <div class="pairing-spinner"></div>
      <span>Waiting for approval...</span>
    </div>
  </div>
</div>

<!-- \u2550\u2550\u2550 CHAT PANEL \u2550\u2550\u2550 -->
<div id="chat-panel">
  <div id="top-row">
    <div id="messages-container">
  <div class="context-bar"><div class="context-fill" id="contextFill"></div></div>
  <div class="tabs-bar" id="tabsBar">
    <button class="hud-toggle" id="hudToggle" title="${vscode3.l10n.t("Toggle HUD Panel")}">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
    </button>
    <div class="tab-item active" data-session="main">Chat</div>
    <button class="tab-add" id="btnAddTab" title="${vscode3.l10n.t("New chat")}">+</button>
  </div>
  <div class="messages" id="messages">
    <div class="empty-state" id="emptyState">
      <div class="empty-icon">\u{1F4AC}</div>
      <div class="empty-text">${vscode3.l10n.t("Start a conversation with your AI agent")}</div>
    </div>
  </div>
  <div class="typing" id="typing">
    <div class="typing-dots"><span></span><span></span><span></span></div>
    <span id="typingText">${vscode3.l10n.t("Thinking...")}</span>
  </div>
  <div id="busyIndicator" class="busy-indicator hidden"></div>
  <div id="subagentIndicator" class="subagent-indicator hidden"></div>
  <div id="yieldIndicator" class="yield-indicator hidden"></div>
  <div class="resize-handle" id="resizeHandle" title="${vscode3.l10n.t("Drag to resize")}"></div>
  </div> <!-- /messages-container -->
    <div class="progress-resize-handle" id="progressResizeHandle" title="Drag to resize panel"></div>
    <div id="progress-note-panel">
      <div class="panel-tabs">
        <div class="panel-tab active" data-tab="notes">${vscode3.l10n.t("Progress Notes")}</div>
        <div class="panel-tab" data-tab="tasks">${vscode3.l10n.t("Tasks")}</div>
        <div class="panel-tab" data-tab="sessions">${vscode3.l10n.t("Sessions")}</div>
        <div class="panel-tab" data-tab="agents">${vscode3.l10n.t("Agents")}</div>
        <button id="progress-note-panel-toggle" title="${vscode3.l10n.t("Toggle progress note panel")}" style="margin-left:auto;background:none;border:none;color:var(--text-muted);cursor:pointer;font-size:14px;padding:4px 8px;border-radius:4px;line-height:1;">\u25C0\u25B6</button>
      </div>
      <div class="panel-tab-content">
        <div id="tab-notes" class="tab-pane active">
          <div id="progress-note-panel-header">
            <span id="progress-note-panel-title">${vscode3.l10n.t("Progress Notes")}</span>
          </div>
          <div id="progress-note-panel-content">
            <div style="color:var(--text-muted);font-size:12px;text-align:center;padding:20px 10px;">${vscode3.l10n.t("Progress notes will appear here")}</div>
          </div>
        </div>
        <div id="tab-tasks" class="tab-pane">
          <div id="tasksListContent" style="padding:8px 12px;overflow-y:auto;flex:1;">
            <div style="color:var(--text-muted);font-size:12px;text-align:center;padding:20px 10px;">${vscode3.l10n.t("No tasks")}</div>
          </div>
        </div>
        <div id="tab-sessions" class="tab-pane">
          <div id="tabSessionsContent" style="padding:8px 12px;overflow-y:auto;flex:1;">
            <div style="color:var(--text-muted);font-size:12px;text-align:center;padding:20px 10px;">${vscode3.l10n.t("No sessions")}</div>
          </div>
        </div>
        <div id="tab-agents" class="tab-pane">
${getModelscopeHtml()}
        </div>
      </div>
    </div>
  </div> <!-- /top-row -->
  <div id="input-area" class="input-area">
    <div class="input-meta">
      <span class="bar-chip" id="thinkingChip">think: default</span>
      <span class="bar-sep">\xB7</span>
      <span class="bar-chip" id="verboseChip">steps: default</span>
      <label class="supervision-check" title="${vscode3.l10n.t("Automatic supervision agent.\nAutomatically disable after task execution is completed")}" style="margin-left:6px;cursor:pointer;display:flex;align-items:center;gap:4px;">
        <input type="checkbox" id="supervisionCheck" title="${vscode3.l10n.t("Supervision")}">
        <span>${vscode3.l10n.t("Supervision")}</span>
      </label>
      <button class="open-workdir-btn" id="openWorkdirBtn" title="${vscode3.l10n.t("Open the current agent workspace")}" style="display:none;">\u{1F4C1}</button>
    </div>
    <div class="attachment-preview" id="attachmentPreview"></div>
    <div class="input-row" style="position:relative;">
      <button class="stop-btn" id="stopBtn" title="${vscode3.l10n.t("Stop")}">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="4" width="16" height="16" rx="2"/></svg>
      </button>
      <button class="attach-btn" id="attachBtn" title="${vscode3.l10n.t("Attach files")}">\u{1F4CE}</button>
      <input type="file" id="attachInput" multiple style="visibility:hidden;position:absolute;left:-9999px;top:-9999px;" accept="*/*">
      <div style="flex:1;position:relative;">
        <div class="at-dropdown" id="atDropdown"></div>
        <div class="at-dropdown" id="slashDropdown"></div>
        <textarea class="input-box" id="inputBox" placeholder="${vscode3.l10n.t("Message OpenClaw...")}" rows="1" style="width:100%;"></textarea>
      </div>
      <button class="send-btn" id="sendBtn" title="${vscode3.l10n.t("Send")}">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
      </button>
    </div>
  </div>
</div>

<script nonce="${nonce}" src="https://cdnjs.cloudflare.com/ajax/libs/marked/15.0.7/marked.min.js"></script>
<script nonce="${nonce}" src="https://unpkg.com/mermaid@11.4.1/dist/mermaid.min.js"></script>
<script nonce="${nonce}">
(function() {
  const vscode = acquireVsCodeApi();
  const $ = (sel) => document.querySelector(sel);
  const messagesEl = $('#messages');
  const inputBox = $('#inputBox');
  const sendBtn = $('#sendBtn');
  const stopBtn = $('#stopBtn');
  const typingEl = $('#typing');
  const emptyState = $('#emptyState');
  const modelValue = $('#modelValue');
  const reliabilityValue = $('#reliabilityValue');
  const serverValue = $('#serverValue');
  const sessionsList = $('#sessionsList');
  const contextFill = $('#contextFill');
  const agentOrb = $('#agentOrb');
  const agentNameEl = $('#agentName');
  const agentStatusEl = $('#agentStatus');
  const pairingBanner = $('#pairingBanner');
  const thinkingChip = $('#thinkingChip');
  const verboseChip = $('#verboseChip');
  const openWorkdirBtn = $('#openWorkdirBtn');
  const supervisionCheck = $('#supervisionCheck');

  let connected = false;
  let streaming = false;
  let sessions = [];
  let agents = [];
  let currentSession = 'main';
  let agent = { id: 'main', name: 'Agent', emoji: '\u{1F916}' };
  let currentModel = '';
  let thinkingLevel = '';
  let verboseLevel = '';
  let gatewayUrl = '';
  let hudVisible = false;
  let agentsTreeData = null;
  let agentsTreeDir = '';
  // ModelScope agents state
  let modelscopeState = {
    page: 1,
    pageSize: 9,
    totalCount: 0,
    agents: [],
    loading: false,
    loaded: false
  };
  // Inject ModelScope JS functions
  ${getModelscopeJs()}
  let messageHistory = [];
  let historyIndex = -1;

  // Initialize mermaid
  if (typeof mermaid !== 'undefined') {
    mermaid.initialize({ startOnLoad: false, theme: 'dark', securityLevel: 'loose', flowchart: { htmlLabels: false }, htmlLabels: false });
  }

  // @ mention state
  let atVisible = false;
  let atQuery = '';
  let atFiles = [];
  let atSelectedIndex = 0;
  let atRequestId = '';
  let atTriggerPos = -1;
  let atFileRefs = [];
  const atDropdown = $('#atDropdown');
  const slashDropdown = $('#slashDropdown');

  let slashVisible = false;
  let slashFilter = '';
  let slashSelectedIndex = 0;
  const SLASH_COMMANDS = [
    { separator: true, label: 'SESSION' },
    { cmd: '/new', desc: 'Start a new chat session' },
    { cmd: '/stop', desc: 'Stop the current response' },
    { cmd: '/reset', desc: 'Reset session context' },
    { cmd: '/compact', desc: 'Compact session messages' },
    { separator: true, label: 'MODEL & STATUS' },
    { cmd: '/status', desc: 'Show session status' },
    { cmd: '/models', desc: 'List available models' },
    { cmd: '/model', desc: 'Switch active model' },
    { separator: true, label: 'HELP' },
    { cmd: '/commands', desc: 'List available commands' },
    { cmd: '/help', desc: 'Show help information' },
  ];

  // Tab management: each tab = { id, label, agentId, sessionKey, messages[] }
  let tabs = [{ id: 'tab-main', label: 'Chat', agentId: 'main', sessionKey: 'main', messages: [] }];
  let activeTabId = 'tab-main';
  let streamEl = null;
  let activeTabMessages = [];

  // Attachment state (independent from fileRefs/@mention)
  const MAX_ATTACH_SIZE = 10 * 1024 * 1024; // 10MB per file
  let attachments = []; // [{name, size, mimeType, data(base64)}]
  const attachmentPreview = document.getElementById('attachmentPreview');
  const attachBtnEl = document.getElementById('attachBtn');
  const attachInputEl = document.getElementById('attachInput');

  function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  function getFileIcon(mimeType) {
    // Use ASCII text tags instead of emoji for reliable rendering across all webview themes/fonts
    if (!mimeType) return '[FILE]';
    if (mimeType.startsWith('image/')) return '[IMG]';
    if (mimeType.startsWith('video/')) return '[VID]';
    if (mimeType.startsWith('audio/')) return '[AUD]';
    if (mimeType.startsWith('text/') || mimeType.includes('json') || mimeType.includes('xml') || mimeType.includes('yaml') || mimeType.includes('javascript') || mimeType.includes('typescript')) return '[TXT]';
    if (mimeType === 'application/pdf') return '[PDF]';
    if (mimeType.startsWith('application/zip') || mimeType.startsWith('application/gzip') || mimeType.startsWith('application/x-')) return '[ZIP]';
    return '[FILE]';
  }

  function renderAttachments() {
    if (!attachmentPreview) return;
    if (attachments.length === 0) {
      attachmentPreview.innerHTML = '';
      return;
    }
    attachmentPreview.innerHTML = '';
    for (let i = 0; i < attachments.length; i++) {
      const a = attachments[i];
      const chip = document.createElement('div');
      chip.className = 'attachment-chip';
      chip.innerHTML = '<span class="attachment-chip-icon">' + getFileIcon(a.mimeType) + '</span>' +
        '<div class="attachment-chip-info"><div class="attachment-chip-name">' + a.name + '</div>' +
        '<div class="attachment-chip-size">' + formatFileSize(a.size) + '</div></div>' +
        '<button class="attachment-chip-remove" data-index="' + i + '" title="Remove">\xD7</button>';
      attachmentPreview.appendChild(chip);
    }
  }

  function addAttachments(files) {
    console.log('[Attach] addAttachments called, files.count:', files.length);
    if (!files || files.length === 0) {
      console.warn('[Attach] No files provided');
      return;
    }
    let pending = 0;
    let loaded = 0;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      console.log('[Attach] Processing file:', file.name, 'size:', file.size, 'type:', file.type);
      if (file.size > MAX_ATTACH_SIZE) {
        console.warn('[Attach] File exceeds limit, skipping:', file.name);
        alert('"' + file.name + '" exceeds 10MB limit and was skipped.');
        continue;
      }
      pending++;
      const reader = new FileReader();
      reader.onload = () => {
        const data = reader.result;
        console.log('[Attach] FileReader.onload for:', file.name, 'data.length:', data ? String(data).length : 'null');
        if (typeof data === 'string') {
          const base64Part = data.split(',')[1] || '';
          attachments.push({
            name: file.name,
            size: file.size,
            mimeType: file.type || 'application/octet-stream',
            data: base64Part
          });
          loaded++;
          console.log('[Attach] File loaded successfully:', file.name, 'loaded=', loaded, '/', pending);
          if (loaded === pending) {
            console.log('[Attach] All files loaded, calling renderAttachments');
            renderAttachments();
          }
        }
      };
      reader.onerror = (err) => {
        console.error('[Attach] FileReader.onerror for:', file.name, 'error:', err);
        loaded++;
        if (loaded === pending) {
          console.log('[Attach] All files done (some may have failed), calling renderAttachments');
          renderAttachments();
        }
      };
      reader.readAsDataURL(file);
    }
  }

  function removeAttachment(index) {
    attachments.splice(index, 1);
    renderAttachments();
  }

  function getActiveTab() { return tabs.find(t => t.id === activeTabId) || tabs[0]; }

  // \u8BB0\u5F55\u6B63\u5728\u6D41\u5F0F\u8F93\u51FA\u7684 agent \u7ED1\u5B9A\u5230\u54EA\u4E2A tab\uFF08\u907F\u514D\u4E0D\u540C agent \u7684\u6D88\u606F\u4E92\u76F8\u4E32\u53F0\uFF09
  const streamAgentBindings = {};

  function tabForStreamEvent(msg) {
    const streamAgent = msg.agentId || (agent && agent.id) || 'main';
    const boundTabId = streamAgentBindings[streamAgent];
    const active = getActiveTab();
    // \u6709\u7ED1\u5B9A\uFF1A\u6D41\u53EA\u5F71\u54CD\u7ED1\u5B9A tab\uFF08\u82E5\u4E0D\u5728\u524D\u53F0\u5219\u5FFD\u7565\u6D41\u5F0F\u6E32\u67D3\uFF1B\u5386\u53F2\u91CD\u8F7D\u4F1A\u8865\u5168\u6D88\u606F\uFF09
    return boundTabId ? boundTabId === active.id : true;
  }

  // \u70B9\u51FB\u4F1A\u8BDD\u5217\u8868 / \u6536\u5230 loadMessages / userMessage \u65F6\u7684 tab \u8DEF\u7531\uFF1A
  // 1) \u5DF2\u6709\u8BE5 agent \u7684 tab \u2192 \u76F4\u63A5\u590D\u7528\uFF1B
  // 2) tab-main \u4ECD\u662F\u5360\u4F4D 'main'\uFF08\u5C1A\u672A\u7ED1\u5B9A\u914D\u7F6E\u7684 OpenClaw: Agent ID\uFF09\u2192 \u590D\u7528\u5B83\u7ED1\u5B9A\u5230\u8BE5 agent\uFF1B
  // 3) \u5426\u5219\u65B0\u5EFA\u8BE5 agent \u7684\u4E13\u5C5E tab\u3002\u7EDD\u4E0D\u628A\u5DF2\u7ED1\u5B9A\u914D\u7F6E agent \u7684 Chat tab \u91CD\u65B0\u7ED1\u5B9A\u5230\u522B\u7684 agent\u3002
  function getOrCreateTabByAgentId(agentId) {
    let tab = tabs.find(t => t.agentId === agentId);
    if (!tab) {
      const defaultTab = tabs.find(t => t.id === 'tab-main' && t.agentId === 'main');
      if (defaultTab) {
        tab = defaultTab;
        tab.agentId = agentId || 'main';
        tab.sessionKey = 'main';
        const ag = agents.find(a => a.id === tab.agentId);
        if (ag) tab.label = ag.name || ag.id;
      } else {
        const ag = agents.find(a => a.id === agentId);
        const resolvedAgentId = agentId || (agent && agent.id) || 'main';
        tab = {
          id: 'tab-agent-' + agentId + '-' + Date.now(),
          label: (ag && (ag.name || ag.id)) || agentId,
          agentId: agentId,
          sessionKey: 'agent:' + resolvedAgentId + ':main',
          messages: []
        };
        tabs.push(tab);
      }
      renderTabs();
    }
    return tab;
  }

  renderTabs();
  vscode.postMessage({ type: 'webviewReady' });

  // HUD toggle
  const hudPanel = document.getElementById('hud-panel');
  const hudToggle = document.getElementById('hudToggle');
  if (hudPanel) hudPanel.classList.add('hidden');
  if (hudToggle) {
    hudToggle.addEventListener('click', () => {
      hudVisible = !hudVisible;
      hudPanel.classList.toggle('hidden', !hudVisible);
      hudToggle.classList.toggle('active', hudVisible);
    });
  }

  $('#btnModel').addEventListener('click', () => vscode.postMessage({ type: 'openModelPicker' }));
  $('#btnReliability').addEventListener('click', () => {
    vscode.postMessage({ type: 'cycleThinking' });
    vscode.postMessage({ type: 'cycleVerbose' });
  });
  $('#btnServer').addEventListener('click', () => vscode.postMessage({ type: 'openSettings' }));
  $('#pairingCopyBox').addEventListener('click', () => {
    vscode.postMessage({ type: 'copyCommand', text: 'openclaw devices approve --latest' });
  });

  // Resize handle logic
  const resizeHandle = document.getElementById('resizeHandle');
  const inputArea = document.querySelector('.input-area');
  let isResizing = false;
  let startY = 0;
  let startHeight = 0;

  // Load saved height from localStorage
  const savedHeight = localStorage.getItem('openclaw.inputAreaHeight');
  if (savedHeight) {
    inputArea.style.height = savedHeight + 'px';
    adjustInputBoxHeight();
  }

  function adjustInputBoxHeight() {
    const inputMeta = document.querySelector('.input-meta');
    const metaHeight = inputMeta ? inputMeta.offsetHeight + 6 : 0;
    const inputRow = document.querySelector('.input-row');
    const rowPadding = 20; // approximate padding
    const availableHeight = inputArea.offsetHeight - metaHeight - rowPadding;
    inputBox.style.height = Math.max(40, availableHeight) + 'px';
  }

  
  const progressNotePanel = document.getElementById('progress-note-panel');
  const progressResizeHandle = document.getElementById('progressResizeHandle');
  let isPanelResizing = false;
  let panelStartX = 0;
  let panelStartWidth = 0;
  const progressNoteToggle = document.getElementById('progress-note-panel-toggle');
  const messagesContainer = document.getElementById('messages-container');

  // Load saved panel state
  const savedPanelCollapsed = localStorage.getItem('openclaw.progressNoteCollapsed');
  if (progressNotePanel) {
    if (savedPanelCollapsed === 'true') {
      progressNotePanel.classList.add('collapsed');
    }
  }
  const savedPanelWidth = localStorage.getItem('openclaw.progressNotePanelWidth');
  if (savedPanelWidth && progressNotePanel) {
    progressNotePanel.style.width = savedPanelWidth + 'px';
  }

  if (progressNoteToggle) {
    progressNoteToggle.addEventListener('click', () => {
      if (!progressNotePanel) return;
      const isCollapsed = progressNotePanel.classList.toggle('collapsed');
      progressNoteToggle.textContent = isCollapsed ? '\u25C0' : '\u25B6';
      localStorage.setItem('openclaw.progressNoteCollapsed', isCollapsed.toString());
      updatePanelPosition();
    });
  }

  // \u68C0\u6D4B\u662F\u5426\u5728\u6700\u53F3\u4FA7\uFF08\u5BB9\u5668\u53F3\u8FB9\u8DDD < 50px \u89C6\u4E3A\u53F3\u8FB9\u754C\uFF09
  function updatePanelPosition() {
    if (!progressNotePanel) return;
    const rect = progressNotePanel.getBoundingClientRect();
    const containerRect = document.querySelector('.chat-container')?.getBoundingClientRect();
    if (containerRect && (containerRect.right - rect.right) < 50) {
      progressNotePanel.classList.add('right-overlay');
    } else {
      progressNotePanel.classList.remove('right-overlay');
    }
  }
  // \u5728 panel \u5C55\u5F00/\u6298\u53E0\u3001\u7A97\u53E3 resize \u65F6\u8C03\u7528
  window.addEventListener('resize', updatePanelPosition);

  // Tab \u5207\u6362
  document.querySelectorAll('.panel-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.panel-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById('tab-' + tab.dataset.tab).classList.add('active');
      
      // \u5237\u65B0\u5BF9\u5E94\u9762\u677F\u6570\u636E
      if (tab.dataset.tab === 'tasks') {
        vscode.postMessage({ type: 'requestTasks' });
      } else if (tab.dataset.tab === 'sessions') {
        vscode.postMessage({ type: 'requestSessions' });
      } else if (tab.dataset.tab === 'agents') {
        vscode.postMessage({ type: 'requestAgentsTree' });
      }
    });
  });
if (resizeHandle) {
    resizeHandle.addEventListener('mousedown', (e) => {
      isResizing = true;
      startY = e.clientY;
      startHeight = inputArea.offsetHeight;
      resizeHandle.classList.add('dragging');
      document.body.style.cursor = 'ns-resize';
      document.body.style.userSelect = 'none';
      e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
      if (!isResizing) return;
      const delta = startY - e.clientY;
      let newHeight = startHeight + delta;
      const minHeight = 80;
      const maxHeight = window.innerHeight * 0.5;
      newHeight = Math.max(minHeight, Math.min(maxHeight, newHeight));
      inputArea.style.height = newHeight + 'px';
      adjustInputBoxHeight();
    });

    document.addEventListener('mouseup', () => {
      if (isResizing) {
        isResizing = false;
        resizeHandle.classList.remove('dragging');
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        localStorage.setItem('openclaw.inputAreaHeight', inputArea.offsetHeight.toString());
      }
    });
  }

  // \u9762\u677F\u62D6\u62FD\u8C03\u6574\u5BBD\u5EA6
  if (progressResizeHandle && progressNotePanel) {
    progressResizeHandle.addEventListener('mousedown', (e) => {
      // \u5982\u679C\u9762\u677F\u662F\u6298\u53E0\u72B6\u6001\uFF0C\u5148\u5C55\u5F00\u9762\u677F
      if (progressNotePanel.classList.contains('collapsed')) {
        progressNotePanel.classList.remove('collapsed');
        progressNoteToggle.textContent = '\u25B6';
        localStorage.setItem('openclaw.progressNoteCollapsed', 'false');
        updatePanelPosition();
      }
      
      isPanelResizing = true;
      panelStartX = e.clientX;
      panelStartWidth = progressNotePanel.offsetWidth;
      progressResizeHandle.classList.add('dragging');
      progressNotePanel.classList.add('resizing');
      document.body.style.cursor = 'ew-resize';
      document.body.style.userSelect = 'none';
      e.preventDefault();
    });

    // \u53CC\u51FB\u5C55\u5F00\u9762\u677F
    progressResizeHandle.addEventListener('dblclick', (e) => {
      if (progressNotePanel.classList.contains('collapsed')) {
        progressNotePanel.classList.remove('collapsed');
        progressNoteToggle.textContent = '\u25B6';
        localStorage.setItem('openclaw.progressNoteCollapsed', 'false');
        updatePanelPosition();
      }
      e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
      if (!isPanelResizing) return;
      const delta = panelStartX - e.clientX;
      let newWidth = panelStartWidth + delta;
      const minWidth = 180;
      const maxWidth = window.innerWidth * 0.6;
      newWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
      progressNotePanel.style.width = newWidth + 'px';
    });

    document.addEventListener('mouseup', () => {
      if (isPanelResizing) {
        isPanelResizing = false;
        progressResizeHandle.classList.remove('dragging');
        progressNotePanel.classList.remove('resizing');
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        localStorage.setItem('openclaw.progressNotePanelWidth', progressNotePanel.offsetWidth.toString());
      }
    });
  }

  inputBox.addEventListener('input', () => {
    inputBox.style.height = 'auto';
    inputBox.style.height = Math.max(inputBox.scrollHeight, 40) + 'px';
    checkAtTrigger();
    checkSlashTrigger();
  });
  inputBox.addEventListener('keydown', (e) => {
    if (atVisible) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (atFiles.length > 0) {
          atSelectedIndex = (atSelectedIndex + 1) % atFiles.length;
          renderAtDropdown();
        }
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (atFiles.length > 0) {
          atSelectedIndex = (atSelectedIndex - 1 + atFiles.length) % atFiles.length;
          renderAtDropdown();
        }
        return;
      }
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (atFiles.length > 0) {
          selectAtItem(atFiles[atSelectedIndex]);
        }
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        hideAtDropdown();
        return;
      }
    }
    if (slashVisible) {
      const filtered = getFilteredSlashCommands();
      const commandsOnly = filtered.filter((c) => !c.separator);
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (commandsOnly.length > 0) {
          slashSelectedIndex = (slashSelectedIndex + 1) % commandsOnly.length;
          updateSlashActive();
        }
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (commandsOnly.length > 0) {
          slashSelectedIndex = (slashSelectedIndex - 1 + commandsOnly.length) % commandsOnly.length;
          updateSlashActive();
        }
        return;
      }
      if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          if (commandsOnly.length > 0) {
            selectSlashCommand(commandsOnly[slashSelectedIndex]);
          } else {
            // No matching commands - send as message to gateway for processing
            hideSlashDropdown();
            sendMessage();
          }
          return;
        }
      if (e.key === 'Escape') {
        e.preventDefault();
        hideSlashDropdown();
        return;
      }
    }
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    if (e.ctrlKey && e.key === 'ArrowUp') {
      e.preventDefault();
      if (messageHistory.length === 0) return;
      if (historyIndex < messageHistory.length - 1) {
        historyIndex++;
        inputBox.value = messageHistory[messageHistory.length - 1 - historyIndex];
        inputBox.style.height = 'auto';
        inputBox.style.height = Math.max(inputBox.scrollHeight, 40) + 'px';
      }
    }
    if (e.ctrlKey && e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        historyIndex--;
        inputBox.value = messageHistory[messageHistory.length - 1 - historyIndex];
        inputBox.style.height = 'auto';
        inputBox.style.height = Math.max(inputBox.scrollHeight, 40) + 'px';
      } else if (historyIndex === 0) {
        historyIndex = -1;
        inputBox.value = '';
        inputBox.style.height = 'auto';
      }
    }
  });
  sendBtn.addEventListener('click', sendMessage);
  stopBtn.addEventListener('click', () => {
    inputBox.value = '/stop';
    sendMessage();
  });

  // Attachment button: trigger hidden file input
  if (attachBtnEl) {
    attachBtnEl.addEventListener('click', () => {
      console.log('[Attach] attachBtn clicked, attachInputEl exists:', !!attachInputEl);
      if (attachInputEl) {
        attachInputEl.click();
      }
    });
  }
  // File input change: add selected files as attachments
  if (attachInputEl) {
    attachInputEl.addEventListener('change', (e) => {
      console.log('[Attach] change event fired, files.length:', e.target.files ? e.target.files.length : 0);
      if (attachInputEl.files && attachInputEl.files.length > 0) {
        addAttachments(attachInputEl.files);
        attachInputEl.value = ''; // reset for next selection
      }
    });
  }
  // Attachment preview: handle remove button clicks (event delegation)
  if (attachmentPreview) {
    attachmentPreview.addEventListener('click', (e) => {
      const target = e.target;
      if (target && target.classList && target.classList.contains('attachment-chip-remove')) {
        const idx = parseInt(target.getAttribute('data-index') || '0', 10);
        removeAttachment(idx);
      }
    });
  }
  // Paste: capture pasted files (e.g. screenshots)
  inputBox.addEventListener('paste', (e) => {
    console.log('[Attach] paste event fired');
    const items = e.clipboardData && e.clipboardData.items;
    if (!items) return;
    const files = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.kind === 'file') {
        const file = item.getAsFile();
        if (file) files.push(file);
      }
    }
    console.log('[Attach] paste: files found:', files.length);
    if (files.length > 0) {
      e.preventDefault();
      addAttachments(files);
    }
  });
  // Drag & drop: capture dropped files onto the input area
  const inputAreaEl = document.querySelector('.input-area');
  if (inputAreaEl) {
    inputAreaEl.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
    });
    inputAreaEl.addEventListener('drop', (e) => {
      console.log('[Attach] drop event fired, files.count:', e.dataTransfer ? e.dataTransfer.files.length : 0);
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        addAttachments(e.dataTransfer.files);
      }
    });
  }
  thinkingChip.addEventListener('click', () => vscode.postMessage({ type: 'cycleThinking' }));
  verboseChip.addEventListener('click', () => vscode.postMessage({ type: 'cycleVerbose' }));

  // Supervision checkbox: toggle and notify extension host
  if (supervisionCheck) {
    supervisionCheck.addEventListener('change', () => {
      vscode.postMessage({ 
        type: 'toggleSupervision', 
        enabled: supervisionCheck.checked 
      });
    });
  }

  // Open workdir button: send message to extension host
  if (openWorkdirBtn) {
    openWorkdirBtn.addEventListener('click', () => {
      vscode.postMessage({ type: 'openWorkdir' });
    });
  }

  // Slash dropdown: event delegation (set up once, survives re-renders)
  slashDropdown.addEventListener('mousedown', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const item = e.target.closest('.at-item');
    if (!item || !item.dataset.cmd) return;
    inputBox.value = item.dataset.cmd + ' ';
    inputBox.setSelectionRange(inputBox.value.length, inputBox.value.length);
    inputBox.focus();
    hideSlashDropdown();
    inputBox.style.height = 'auto';
    inputBox.style.height = Math.max(inputBox.scrollHeight, 40) + 'px';
  });
  slashDropdown.addEventListener('mousemove', (e) => {
    const item = e.target.closest('.at-item');
    if (!item) return;
    const items = Array.from(slashDropdown.querySelectorAll('.at-item'));
    const idx = items.indexOf(item);
    if (idx >= 0 && idx !== slashSelectedIndex) {
      slashSelectedIndex = idx;
      updateSlashActive();
    }
  });

  window.addEventListener('message', (e) => {
    const msg = e.data;
    console.log('[MS] Received message type:', msg.type);
    switch (msg.type) {
      case 'init':
        connected = msg.connected;
        agent = msg.agent || agent;
        currentModel = msg.model || '';
        thinkingLevel = msg.thinkingLevel || '';
        verboseLevel = msg.verboseLevel || '';
        gatewayUrl = msg.gatewayUrl || '';
        messageHistory = msg.messageHistory || [];
        historyIndex = -1;
        // \u52A8\u6001\u66F4\u65B0\u9875\u811A\u7248\u672C\u53F7\uFF08\u670D\u52A1\u5668\u8FD4\u56DE\u4E86\u7248\u672C\u4FE1\u606F\u65F6\uFF09
        if (msg.version) {
          const footerVersion = document.getElementById('footerVersion');
          if (footerVersion) footerVersion.textContent = 'OPENCLAW v' + msg.version;
        }
        updateAgentCard();
        updateChips();
        serverValue.textContent = (gatewayUrl && gatewayUrl.indexOf('://') >= 0) ? gatewayUrl.slice(gatewayUrl.indexOf('://') + 3) : '${vscode3.l10n.t("not configured")}';
        if (msg.sessionKey) currentSession = msg.gwSessionKey || msg.sessionKey;
        // Show open-workdir button on init if connected
        if (openWorkdirBtn) {
          openWorkdirBtn.style.display = connected ? '' : 'none';
        }
        // Set supervision checkbox state
        if (supervisionCheck) {
          supervisionCheck.checked = !!msg.supervisionEnabled;
        }
// Update default tab with resolved agent/session from init message
      if (tabs.length > 0) {
        tabs[0].agentId = msg.agent.id;
        // tab \u7EDF\u4E00\u4FDD\u5B58\u5B8C\u6574 gwKey\uFF08\u5982 agent:<id>:main\uFF09\uFF0C\u4FDD\u8BC1\u6309 sessionKey \u67E5\u91CD\u53EF\u5339\u914D Chat tab
        tabs[0].sessionKey = msg.gwSessionKey || msg.sessionKey || tabs[0].sessionKey;
        // If we have stored messages for this tab, use them
        if (activeTabMessages.length > 0 && tabs[0].id === activeTabId) {
          tabs[0].messages = activeTabMessages.slice();
        }
        // Re-render tabs and agent buttons to reflect updated agentId/sessionKey
        renderTabs();
        renderAgentButtons();
      }
        break;
      case 'connectionStatus':
        connected = msg.connected;
        agent = msg.agent || agent;
        updateAgentCard();
        // Show open-workdir button only when connected (local gateway)
        if (openWorkdirBtn) {
          openWorkdirBtn.style.display = connected ? '' : 'none';
        }
        // Set supervision checkbox state
        if (supervisionCheck) {
          supervisionCheck.checked = !!msg.supervisionEnabled;
        }
        if (connected) {
          vscode.postMessage({ type: 'requestModels' });
          vscode.postMessage({ type: 'requestSessions' });
          vscode.postMessage({ type: 'requestAgents' });
          pairingBanner.style.display = 'none';
        }
        break;
      case 'supervisionState':
        if (supervisionCheck) {
          supervisionCheck.checked = !!msg.enabled;
        }
        break;
      case 'modelsList': renderModels(msg.models); break;
      case 'tasksList':
        renderTasks(msg.tasks);
        break;
      case 'sessionsList':
        sessions = msg.sessions || [];
        renderSessions();
        updateContextMeter();
        break;
      case 'agentsList':
        agents = msg.agents || [];
        renderAgentButtons();
        renderLocalAgentsTree();
        break;
      case 'agentsTree':
        agentsTreeData = msg.tree;
        agentsTreeDir = msg.dir || '';
        renderLocalAgentsTree();
        break;
      case 'modelscopeAgentsResult':
        console.log('[MS] modelscopeAgentsResult handler, agents count:', msg.agents ? msg.agents.length : 0);
        modelscopeState.loading = false;
        modelscopeState.loaded = true;
        modelscopeState.agents = msg.agents || [];
        modelscopeState.totalCount = msg.totalCount || 0;
        modelscopeState.page = msg.page || 1;
        var msLoadingEl = document.getElementById('modelscope-loading');
        var msErrorEl = document.getElementById('modelscope-error');
        var msEmptyEl = document.getElementById('modelscope-empty');
        if (msLoadingEl) msLoadingEl.style.display = 'none';
        if (msErrorEl) msErrorEl.style.display = 'none';
        if (modelscopeState.agents.length === 0) {
          if (msEmptyEl) msEmptyEl.style.display = 'block';
          var msPagEl = document.getElementById('modelscope-pagination');
          if (msPagEl) msPagEl.style.display = 'none';
        } else {
          if (msEmptyEl) msEmptyEl.style.display = 'none';
          renderModelscopeGrid(modelscopeState.agents);
          renderModelscopePagination();
        }
        var msGridEl = document.getElementById('modelscope-grid');
        var msPanelEl = document.getElementById('agents-modelscope-panel');
        console.log('[MS-DOM] result handler: grid exists=' + !!msGridEl, 'grid innerHTML length=' + (msGridEl ? msGridEl.innerHTML.length : 0), 'panel class=' + (msPanelEl ? msPanelEl.className : 'null'), 'panel display=' + (msPanelEl ? getComputedStyle(msPanelEl).display : 'null'));
        break;
      case 'modelscopeAgentsError':
        console.log('[MS] modelscopeAgentsError handler, error:', msg.error);
        modelscopeState.loading = false;
        var msLoadingEl2 = document.getElementById('modelscope-loading');
        var msErrorEl2 = document.getElementById('modelscope-error');
        if (msLoadingEl2) msLoadingEl2.style.display = 'none';
        if (msErrorEl2) {
          msErrorEl2.style.display = 'block';
          msErrorEl2.innerHTML = '\u52A0\u8F7D\u5931\u8D25: ' + escapeHtml(msg.error || '\u672A\u77E5\u9519\u8BEF') + '<br><button class="retry-btn" onclick="fetchModelscopeAgents(' + modelscopeState.page + ')">\u91CD\u8BD5</button>';
        }
        break;
      case 'defaultsLoaded':
        thinkingLevel = msg.thinkingLevel || '';
        verboseLevel = msg.verboseLevel || '';
        updateChips();
        break;
      case 'thinkingChanged': thinkingLevel = msg.level; updateChips(); break;
      case 'verboseChanged': verboseLevel = msg.level; updateChips(); break;
      case 'agentSwitched':
        agent = msg.agent;
        updateAgentCard();
        renderAgentButtons();
        renderTabs();
        break;
      case 'userMessage': {
        // \u4F18\u5148\u6309 gwKey \u5339\u914D\u4E13\u5C5E\u4F1A\u8BDD tab\uFF1B\u5426\u5219\u56DE\u9000\u5230 agentId \u8DEF\u7531
        let tab = msg.gwKey ? tabs.find(t => t.sessionKey === msg.gwKey) : undefined;
        if (!tab) {
          const targetAgent = msg.agentId || (agent && agent.id) || 'main';
          tab = getOrCreateTabByAgentId(targetAgent);
        }
        if (tab.id === activeTabId) {
          appendMessage(msg.message);
          activeTabMessages.push(msg.message);
        } else {
          tab.messages.push(msg.message);
        }
        break;
      }
      case 'loadMessages': {
        // \u4F18\u5148\u6309\u5B8C\u6574 sessionKey\uFF08gwKey\uFF09\u5339\u914D\u4E13\u5C5E tab\uFF0C\u907F\u514D\u540C agent \u4E0B\u591A\u4E2A\u4F1A\u8BDD\u8DEF\u7531\u9519 tab
        let tab = msg.gwKey ? tabs.find(t => t.sessionKey === msg.gwKey) : undefined;
        if (!tab) {
          const targetAgent = msg.agentId || (agent && agent.id) || 'main';
          tab = getOrCreateTabByAgentId(targetAgent);
        }
        tab.sessionKey = msg.gwKey || msg.sessionKey || tab.sessionKey;
        tab.sessionId = msg.sessionId || tab.sessionId;
        tab.messages = (msg.messages || []).slice();
        if (tab.id === activeTabId) {
          currentSession = tab.sessionKey;
          clearMessages();
          activeTabMessages = tab.messages;
          for (const m of tab.messages) appendMessage(m);
        }
        break;
      }
      case 'activateAgentChat':
        // \u5207\u6362\u5230\u8BE5 agent \u7684\u9ED8\u8BA4\u804A\u5929\u754C\u9762\uFF08\u590D\u7528 agent \u6309\u94AE\u5207\u6362\u903B\u8F91\uFF09
        if (msg.agentId) {
          let tab = tabs.find(t => t.agentId === msg.agentId);
          if (!tab) {
            const ag = agents.find(a => a.id === msg.agentId);
            tab = {
              id: 'tab-' + msg.agentId + '-' + Date.now(),
              label: (ag && (ag.name || ag.id)) || msg.agentId,
              agentId: msg.agentId,
              sessionKey: 'agent:' + msg.agentId + ':main',
              messages: []
            };
            tabs.push(tab);
          }
          switchToTab(tab.id);
        }
        break;
      case 'addChatTab':
        if (msg.tab) {
          // \u53BB\u91CD\uFF1A\u540C\u4E00 sessionKey \u5DF2\u6709 tab \u5219\u76F4\u63A5\u5207\u6362
          const existing = tabs.find(t => t.sessionKey === msg.tab.sessionKey);
          if (existing) {
            switchToTab(existing.id);
          } else {
            tabs.push(msg.tab);
            switchToTab(msg.tab.id);
            renderTabs();
          }
        }
        break;
      case 'clearMessages':
        clearMessages();
        activeTabMessages = [];
        const ct = getActiveTab();
        if (ct) ct.messages = [];
        break;
      case 'streamStart': {
        const streamAgent = msg.agentId || (agent && agent.id) || 'main';
        streamAgentBindings[streamAgent] = getActiveTab().id;
        // Clean up any leftover streamEl (fix for residual content interfering with new stream)
        if (streamEl) {
          streamEl.remove();
          streamEl = null;
        }
        streaming = true;
        showTyping(true, '${vscode3.l10n.t("Thinking...")}');
        sendBtn.style.display = 'none';
        stopBtn.classList.add('active');
        attachBtnEl.style.display = 'none';
        emptyState.style.display = 'none';
        break;
      }
      case 'streamDelta':
        if (!tabForStreamEvent(msg)) break;
        streaming = true;
        emptyState.style.display = 'none';
        showTyping(false);
        updateStream(msg.text, false);
        break;
      case 'streamDone': {
        if (!tabForStreamEvent(msg)) break;
        streaming = false;
        // Capture bubble content BEFORE clearing streamEl
        let finalText = '';
        if (streamEl) {
          const bubble = streamEl.querySelector('.msg-bubble');
          if (bubble) finalText = bubble.textContent || '';
        }
        // Do NOT call updateStream('', true) as it clears the content
        showTyping(false);
        sendBtn.style.display = '';
        stopBtn.classList.remove('active');
        attachBtnEl.style.display = '';
        // Handle empty response
        if (!finalText.trim()) {
          // Empty response: remove the streamEl to avoid empty bubble
          if (streamEl) {
            streamEl.remove();
          }
        } else {
          // Non-empty response: content is already in DOM, just add to history
          activeTabMessages.push({
            role: 'assistant',
            text: finalText,
            timestamp: Date.now()
          });
          // streamEl remains in DOM with correct content
        }
        // Clear the streamEl reference (but not the DOM content)
        streamEl = null;
        // \u6D41\u5F0F\u8F93\u51FA\u5B8C\u6210\u540E\u6E32\u67D3 Mermaid \u56FE\u8868\uFF08\u5426\u5219\u9700\u8981\u5237\u65B0\u624D\u80FD\u6E32\u67D3\uFF09
        renderMermaidBlocks();
        break;
      }
      case 'streamError': {
        if (!tabForStreamEvent(msg)) break;
        streaming = false;
        appendMessage({ role: 'assistant', text: 'Error: ' + msg.error, timestamp: Date.now() });
        showTyping(false);
        sendBtn.style.display = '';
        stopBtn.classList.remove('active');
        attachBtnEl.style.display = '';
        // Store error message in activeTabMessages
        activeTabMessages.push({ role: 'assistant', text: 'Error: ' + msg.error, timestamp: Date.now() });
        break;
      }
      case 'toolCall':
        emptyState.style.display = 'none';
        showTyping(true, msg.phase === 'start' ? msg.label : '${vscode3.l10n.t("Thinking...")}');
        break;
      case 'historyUpdated':
        messageHistory = msg.messageHistory || [];
        historyIndex = -1;
        break;
      case 'fileResults':
        if (msg.requestId === atRequestId && atVisible) {
          atFiles = msg.files || [];
          renderAtDropdown();
        }
        break;
      case 'autoContinueFailed': {
        if (!tabForStreamEvent(msg)) break;
        streaming = false;
        appendMessage({ role: 'assistant', text: '${vscode3.l10n.t("Auto-continue failed after {0} attempts")}'.replace('{0}', msg.count), timestamp: Date.now() });
        showTyping(false);
        sendBtn.style.display = '';
        stopBtn.classList.remove('active');
        attachBtnEl.style.display = '';
        activeTabMessages.push({ role: 'assistant', text: '${vscode3.l10n.t("Auto-continue failed after {0} attempts")}'.replace('{0}', msg.count), timestamp: Date.now() });
        this.setBusy(false);
        break;
      }
      case 'busyState': {
        const busyEl = document.getElementById('busyIndicator');
        if (busyEl) {
          busyEl.textContent = msg.label || '';
          busyEl.classList.toggle('hidden', !msg.busy);
        }
        break;
      }
      case 'subagentState': {
        const el = document.getElementById('subagentIndicator');
        if (el) {
          el.textContent = msg.label || '';
          el.classList.toggle('hidden', !msg.active);
        }
        break;
      }
      case 'yieldState': {
        const el = document.getElementById('yieldIndicator');
        if (el) {
          el.textContent = msg.label || '';
          el.classList.toggle('hidden', !msg.active);
        }
        break;
      }
      case 'progressCard': {
        renderProgressCard(msg);
        break;
      }
      case 'setInputText':
        if (inputBox && msg.text) {
          inputBox.value = msg.text;
          inputBox.dispatchEvent(new Event('input', { bubbles: true }));
          inputBox.focus();
        }
        break;
    }
  });

  function sendMessage() {
    const text = inputBox.value.trim();
    if (!text || !connected) return;
    // \u89E3\u6790 fileRefs \u4E2D\u7684 #L\u884C\u53F7 \u6216 #L\u884C\u53F7-#K\u884C\u53F7 \u683C\u5F0F
    const refs = atFileRefs.map(ref => {
      const rangeMatch = ref.match(/^(.+?)#L(d+)-#L?(d+)$/);
      if (rangeMatch) return { path: rangeMatch[1], startLine: parseInt(rangeMatch[2]), endLine: parseInt(rangeMatch[3]) };
      const singleMatch = ref.match(/^(.+?)#L(d+)$/);
      if (singleMatch) return { path: singleMatch[1], line: parseInt(singleMatch[2]) };
      return { path: ref };
    });
    inputBox.value = '';
    inputBox.style.height = 'auto';
    historyIndex = -1;
    atFileRefs = [];
    hideAtDropdown();
    vscode.postMessage({ type: 'sendMessage', text, fileRefs: refs, attachments: attachments.slice() });
    attachments = [];
    renderAttachments();
  }

  function checkAtTrigger() {
    const val = inputBox.value;
    const pos = inputBox.selectionStart;
    if (pos < 0) { hideAtDropdown(); return; }
    const before = val.substring(0, pos);
    const atIndex = before.lastIndexOf('@');
    if (atIndex >= 0) {
      const rawQuery = before.slice(atIndex + 1);
      // \u53BB\u6389 #L\u884C\u53F7 \u6216 #L\u884C\u53F7-#K\u884C\u53F7 \u540E\u7F00\u7528\u4E8E\u641C\u7D22
      const hashIndex = rawQuery.indexOf('#L');
      const query = hashIndex > 0 ? rawQuery.substring(0, hashIndex) : rawQuery;
      if (query.indexOf(' ') === -1 && query.indexOf('	') === -1) {
        atTriggerPos = atIndex;
        atQuery = query;
        atRequestId = Math.random().toString(36).substring(2, 10);
        atSelectedIndex = 0;
        atVisible = true;
        vscode.postMessage({ type: 'searchFiles', query: atQuery, requestId: atRequestId });
        atDropdown.classList.add('visible');
        renderAtDropdown();
        return;
      }
    }
    hideAtDropdown();
  }

  function hideAtDropdown() {
    atVisible = false;
    atFiles = [];
    atTriggerPos = -1;
    atDropdown.classList.remove('visible');
  }

  function renderAtDropdown() {
    if (!atVisible) return;
    if (atFiles.length === 0) {
      atDropdown.innerHTML = '<div class="at-empty">${vscode3.l10n.t("No matching files")}</div>';
      return;
    }
    atDropdown.innerHTML = '';
    const maxShow = Math.min(atFiles.length, 10);
    for (let i = 0; i < maxShow; i++) {
      const f = atFiles[i];
      const div = document.createElement('div');
      div.className = 'at-item' + (i === atSelectedIndex ? ' active' : '');
      const icon = document.createElement('span');
      icon.className = 'at-icon';
      icon.textContent = f.isDir ? '\u{1F4C1}' : '\u{1F4C4}';
      const label = document.createElement('span');
      label.className = 'at-label';
      label.textContent = f.path;
      div.appendChild(icon);
      div.appendChild(label);
      const idx = i;
      div.addEventListener('mouseenter', () => { atSelectedIndex = idx; renderAtDropdown(); });
      div.addEventListener('click', (e) => { e.preventDefault(); selectAtItem(f); });
      atDropdown.appendChild(div);
    }
    const activeItem = atDropdown.querySelector('.at-item.active');
    if (activeItem) activeItem.scrollIntoView({ block: 'nearest' });
  }

  function selectAtItem(file) {
    const val = inputBox.value;
    const pos = inputBox.selectionStart;
    const before = val.substring(0, atTriggerPos);
    const after = val.substring(pos);
    // \u68C0\u67E5\u7528\u6237\u662F\u5426\u5DF2\u8F93\u5165 #L\u884C\u53F7 \u6216 #L\u884C\u53F7-#K\u884C\u53F7
    const currentQuery = val.substring(atTriggerPos + 1, pos);
    const hashMatch = currentQuery.match(/#L(d+)(?:-#L?(d+))?$/);
    let lineSuffix = '';
    if (hashMatch) {
      lineSuffix = '#L' + hashMatch[1];
      if (hashMatch[2]) {
        lineSuffix += '-#L' + hashMatch[2];
      }
    }
    const basePath = file.isDir ? file.path + '/' : file.path + ' ';
    const insert = '@' + basePath + lineSuffix;
    inputBox.value = before + insert + after;
    const newPos = before.length + insert.length;
    inputBox.setSelectionRange(newPos, newPos);
    inputBox.focus();
    
    // \u76EE\u5F55\u9009\u62E9\u540E\u4E0D\u9690\u85CF\u4E0B\u62C9\u6846\uFF0C\u800C\u662F\u89E6\u53D1 checkAtTrigger \u663E\u793A\u5B50\u76EE\u5F55\u5185\u5BB9
    // \u9690\u85CF\u903B\u8F91\u79FB\u5230 checkAtTrigger \u4E2D\u5904\u7406
    if (!file.isDir) {
      const refPath = lineSuffix ? file.path + lineSuffix : file.path;
      if (!atFileRefs.includes(refPath)) atFileRefs.push(refPath);
      hideAtDropdown();
      inputBox.style.height = 'auto';
      inputBox.style.height = Math.max(inputBox.scrollHeight, 40) + 'px';
    } else {
      // \u76EE\u5F55\uFF1A\u624B\u52A8\u89E6\u53D1 checkAtTrigger \u4EE5\u641C\u7D22\u5B50\u76EE\u5F55\u5185\u5BB9
      // JS \u8BBE\u7F6E value \u4E0D\u4F1A\u81EA\u52A8\u89E6\u53D1 input \u4E8B\u4EF6
      atVisible = false;
      atDropdown.classList.remove('visible');
      checkAtTrigger();
    }
  }

  // \u2500\u2500\u2500 / Command Dropdown \u2500\u2500\u2500
  function getFilteredSlashCommands() {
    if (!slashFilter) return SLASH_COMMANDS;
    const q = slashFilter.toLowerCase();
    // Filter commands; keep separators only if they have matching commands after them
    const result = [];
    let pendingSep = null;
    for (const c of SLASH_COMMANDS) {
      if (c.separator) { pendingSep = c; continue; }
      const hit = c.cmd.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q);
      if (hit) {
        if (pendingSep) { result.push(pendingSep); pendingSep = null; }
        result.push(c);
      }
    }
    return result;
  }

  function checkSlashTrigger() {
    if (atVisible) { hideSlashDropdown(); return; }
    const val = inputBox.value;
    const pos = inputBox.selectionStart;
    if (pos < 0) { hideSlashDropdown(); return; }
    const before = val.substring(0, pos);
    if (atVisible) { hideSlashDropdown(); return; }
    const slashIndex = before.lastIndexOf('/');
    if (slashIndex === 0) {
      const query = before.slice(1);
      if (query.indexOf(' ') === -1 && query.indexOf('	') === -1) {
        slashFilter = query;
        slashSelectedIndex = 0;
        slashVisible = true;
        slashDropdown.classList.add('visible');
        renderSlashDropdown();
        return;
      }
    }
    hideSlashDropdown();
  }

  function hideSlashDropdown() {
    slashVisible = false;
    slashFilter = '';
    slashDropdown.classList.remove('visible');
  }

  function renderSlashDropdown() {
    if (!slashVisible) return;
    const filtered = getFilteredSlashCommands();
    if (filtered.length === 0) {
      slashDropdown.innerHTML = '<div class="at-empty">${vscode3.l10n.t("No matching commands")}</div>';
      return;
    }
    slashDropdown.innerHTML = '';
    // Only count command items for max show and navigation
    const commandsOnly = filtered.filter((c) => !c.separator);
    const maxShow = Math.min(commandsOnly.length, 10);
    let cmdIdx = 0;
    for (let i = 0; i < filtered.length && cmdIdx < maxShow; i++) {
      const c = filtered[i];
      if (c.separator) {
        const sepDiv = document.createElement('div');
        sepDiv.className = 'slash-separator';
        sepDiv.textContent = c.label || '';
        slashDropdown.appendChild(sepDiv);
        continue;
      }
      const div = document.createElement('div');
      div.className = 'at-item' + (cmdIdx === slashSelectedIndex ? ' active' : '');
      div.dataset.cmd = c.cmd;
      div.innerHTML = '<span class="at-icon">\u26A1</span><span class="at-label">' + c.cmd + '</span><span style="font-size:11px;color:var(--text-muted);margin-left:8px;white-space:nowrap;">' + c.desc + '</span>';
      slashDropdown.appendChild(div);
      cmdIdx++;
    }
    const activeItem = slashDropdown.querySelector('.at-item.active');
    if (activeItem) activeItem.scrollIntoView({ block: 'center' });
  }

  function updateSlashActive() {
    const items = slashDropdown.querySelectorAll('.at-item');
    items.forEach((el, i) => el.classList.toggle('active', i === slashSelectedIndex));
    const activeItem = slashDropdown.querySelector('.at-item.active');
    if (activeItem) activeItem.scrollIntoView({ block: 'center' });
  }

  function selectSlashCommand(cmd) {
    inputBox.value = cmd.cmd + ' ';
    inputBox.setSelectionRange(inputBox.value.length, inputBox.value.length);
    inputBox.focus();
    hideSlashDropdown();
    inputBox.style.height = 'auto';
    inputBox.style.height = Math.max(inputBox.scrollHeight, 40) + 'px';
  }

  function copyProgressCard(btn) {
    var card = btn.closest('.progress-card');
    if (!card) return;
    var clone = card.cloneNode(true);
    clone.querySelectorAll('.progress-card-copy-btn').forEach(function(b) { b.remove(); });
    var text = (clone.textContent || '').trim();
    if (!text) return;
    navigator.clipboard.writeText(text).then(function() {
      btn.textContent = '\u2705';
      setTimeout(function() { btn.textContent = '\u{1F4CB}'; }, 1500);
    }).catch(function() {});
  }

  function copyProgressCardAsMarkdown(btn) {
    var card = btn.closest('.progress-card');
    if (!card) return;
    
    var mdText = card.getAttribute('data-raw-markdown') || '';
    
    if (!mdText) {
      var clone = card.cloneNode(true);
      clone.querySelectorAll('.progress-card-copy-btn, .progress-card-md-btn').forEach(function(b) { b.remove(); });
      mdText = htmlToMarkdown(clone);
    }
    
    if (!mdText) return;
    
    navigator.clipboard.writeText(mdText).then(function() {
      btn.textContent = '\u2705';
      setTimeout(function() { btn.textContent = '\u{1F4DD}'; }, 1500);
    }).catch(function() {});
  }

  /** \u5C06 HTML \u5143\u7D20\u9012\u5F52\u8F6C\u6362\u4E3A Markdown \u6587\u672C */
  function htmlToMarkdown(el) {
    if (!el) return '';
    var BT = String.fromCharCode(96);
    var TBT = BT + BT + BT;
    function processNode(node) {
      if (node.nodeType === 3) return node.textContent || '';
      if (node.nodeType !== 1) return '';
      var tag = node.tagName.toLowerCase();
      var inner = '';
      for (var i = 0; i < node.childNodes.length; i++) {
        inner += processNode(node.childNodes[i]);
      }
      switch (tag) {
        case 'h1': return '# ' + inner.trim() + '\\n\\n';
        case 'h2': return '## ' + inner.trim() + '\\n\\n';
        case 'h3': return '### ' + inner.trim() + '\\n\\n';
        case 'h4': return '#### ' + inner.trim() + '\\n\\n';
        case 'h5': return '##### ' + inner.trim() + '\\n\\n';
        case 'h6': return '###### ' + inner.trim() + '\\n\\n';
        case 'p': return inner.trim() + '\\n\\n';
        case 'br': return '\\n';
        case 'hr': return '\\n---\\n\\n';
        case 'strong': case 'b': return '**' + inner.trim() + '**';
        case 'em': case 'i': return '*' + inner.trim() + '*';
        case 'code': {
          if (node.parentElement && node.parentElement.tagName.toLowerCase() === 'pre') return inner;
          return BT + inner + BT;
        }
        case 'pre': return '\\n' + TBT + '\\n' + inner.trim() + '\\n' + TBT + '\\n\\n';
        case 'blockquote': return inner.split('\\n').map(function(l) { return '> ' + l; }).join('\\n') + '\\n\\n';
        case 'ul': {
          var items = '';
          for (var j = 0; j < node.children.length; j++) {
            items += '- ' + processNode(node.children[j]).trim() + '\\n';
          }
          return items + '\\n';
        }
        case 'ol': {
          var items2 = '';
          var idx = 1;
          for (var j2 = 0; j2 < node.children.length; j2++) {
            items2 += idx + '. ' + processNode(node.children[j2]).trim() + '\\n';
            idx++;
          }
          return items2 + '\\n';
        }
        case 'li': return inner;
        case 'a': {
          var href = node.getAttribute('href') || '';
          return '[' + inner.trim() + '](' + href + ')';
        }
        case 'img': {
          var src = node.getAttribute('src') || '';
          var alt = node.getAttribute('alt') || '';
          return '![' + alt + '](' + src + ')';
        }
        case 'input': {
          if (node.type === 'checkbox') {
            return node.checked ? '- [x] ' : '- [ ] ';
          }
          return '';
        }
        case 'div': case 'section': case 'article': case 'main':
          return inner + '\\n';
        case 'table': {
          var rows = [];
          var trs = node.querySelectorAll('tr');
          for (var ti = 0; ti < trs.length; ti++) {
            var cells = [];
            var tds = trs[ti].querySelectorAll('td, th');
            for (var di = 0; di < tds.length; di++) {
              cells.push(processNode(tds[di]).trim());
            }
            rows.push(cells);
          }
          if (rows.length === 0) return inner;
          var md = '| ' + rows[0].join(' | ') + ' |\\n';
          var seps = [];
          for (var si = 0; si < rows[0].length; si++) seps.push('---');
          md += '| ' + seps.join(' | ') + ' |\\n';
          for (var ri = 1; ri < rows.length; ri++) {
            md += '| ' + rows[ri].join(' | ') + ' |\\n';
          }
          return md + '\\n';
        }
        default: return inner;
      }
    }
    var result = processNode(el);
    return result.replace(/\\n{3,}/g, '\\n\\n').trim();
  }

  // \u590D\u5236 Notes \u9762\u677F\u5168\u90E8\u5185\u5BB9
  const progressCopyAllBtn = document.getElementById('progressCopyAllBtn');
  if (progressCopyAllBtn) {
    progressCopyAllBtn.addEventListener('click', () => {
      const noteContent = document.getElementById('progress-note-panel-content');
      if (!noteContent) return;
      const clone = noteContent.cloneNode(true);
      clone.querySelectorAll('.progress-card-copy-btn').forEach(b => b.remove());
      clone.querySelectorAll('#progressCopyAllBtn, #progressCopyMarkdownBtn').forEach(b => b.remove());
      const text = (clone.textContent || '').trim();
      if (!text) return;
      navigator.clipboard.writeText(text).then(() => {
        progressCopyAllBtn.textContent = '\u2705';
        setTimeout(() => { progressCopyAllBtn.textContent = '\u{1F4CB}'; }, 1500);
      }).catch(() => {});
    });
  }

  // \u{1F4DD} \u6309\u94AE\uFF1A\u590D\u5236 Markdown \u683C\u5F0F
  const progressCopyMarkdownBtn = document.getElementById('progressCopyMarkdownBtn');
  if (progressCopyMarkdownBtn) {
    progressCopyMarkdownBtn.addEventListener('click', () => {
      const noteContent = document.getElementById('progress-note-panel-content');
      if (!noteContent) return;
      var mdCard = noteContent.querySelector('.progress-card[data-raw-markdown]');
      var mdText = '';
      if (mdCard) {
        mdText = mdCard.getAttribute('data-raw-markdown') || '';
      }
      if (!mdText) {
        var clone = noteContent.cloneNode(true);
        clone.querySelectorAll('.progress-card-copy-btn').forEach(b => b.remove());
        clone.querySelectorAll('#progressCopyAllBtn, #progressCopyMarkdownBtn').forEach(b => b.remove());
        mdText = htmlToMarkdown(clone);
      }
      if (!mdText) return;
      navigator.clipboard.writeText(mdText).then(() => {
        progressCopyMarkdownBtn.textContent = '\u2705';
        setTimeout(() => { progressCopyMarkdownBtn.textContent = '\u{1F4DD}'; }, 1500);
      }).catch(() => {});
    });
  }

  function renderProgressCard(msg) {
    const data = msg.data;
    const noteContent = document.getElementById('progress-note-panel-content');
    // vs10n: webview l10n helper with Chinese fallback
    const t = (str, ...args) => {
      if (vscode && vscode.l10n && typeof vscode.l10n.t === 'function') return vscode.l10n.t(str, ...args);
      // webview fallback dictionary (zh-CN)
      const dict = { 'No tasks': '\u65E0\u4EFB\u52A1', 'No sessions': '\u65E0\u4F1A\u8BDD', 'Tasks': '\u4EFB\u52A1', 'Sessions': '\u4F1A\u8BDD', 'Progress Notes': '\u8FDB\u5EA6\u5907\u6CE8', 'In progress': '\u8FDB\u884C\u4E2D', 'Steps': '\u6B65\u9AA4', 'Processing...': '\u5904\u7406\u4E2D...', 'Progress notes will appear here': '\u8FDB\u5EA6\u5907\u6CE8\u5C06\u663E\u793A\u5728\u6B64\u5904' };
      return dict[str] || str;
    };

    // \u2500\u2500 \u6E05\u9664\u5206\u652F\uFF1Adata \u4E3A null/undefined \u65F6\u6E05\u7A7A Notes \u9762\u677F \u2500\u2500
    if (!data) {
        if (noteContent) {
            noteContent.innerHTML = '<div style="color:var(--text-muted);font-size:12px;text-align:center;padding:20px 10px;">' + t('Progress notes will appear here') + '</div>';
        }
        return;
    }

    // \u2500\u2500 \u4F18\u5148\u652F\u6301\u7EAF markdown \u683C\u5F0F\uFF08Gateway \u8FD4\u56DE\u53EA\u6709 markdown \u5B57\u6BB5\u7684\u60C5\u51B5\uFF09\u2500\u2500
    if (noteContent && data && data.markdown) {
      // \u79FB\u9664\u5360\u4F4D\u63D0\u793A\u6587\u672C
      const placeholder = noteContent.querySelector('div[style*="text-align:center"]');
      if (placeholder && placeholder.textContent.includes('Progress notes will appear here')) {
        placeholder.remove();
      }
      // \u4F7F\u7528 marked.parse() \u5C06 markdown \u8F6C\u4E3A HTML\uFF0C\u5426\u5219\u56DE\u9000\u4E3A <pre> \u6587\u672C
      const noteHTML = '<div class="progress-card" style="margin:8px 0;">' +
        (typeof marked !== 'undefined' ? marked.parse(data.markdown) : '<pre>' + data.markdown + '</pre>') +
        '</div>';
      noteContent.innerHTML = noteHTML;
      // \u6E32\u67D3 plan \u5217\u8868\uFF08\u82E5 plan \u5B57\u6BB5\u5B58\u5728\u4E14\u975E\u7A7A\uFF0C\u4F18\u5148\u4E8E steps\uFF09
      const stepList = (data.steps && data.steps.length > 0) ? data.steps : (data.plan && data.plan.length > 0 ? data.plan : null);
      if (stepList) {
        const stepsHTML = '<div style="margin-top:8px;font-size:12px;color:var(--text-muted);border-top:1px solid var(--border);padding-top:8px;">' +
          '<div style="margin-bottom:4px;font-weight:600;">' + t('Steps') + ':</div>' +
          stepList.map((s, i) => {
            const stepText = (typeof s === 'object' && s !== null) ? (s.step || JSON.stringify(s)) : String(s);
            const stepStatus = (typeof s === 'object' && s !== null) ? (s.status || '') : '';
            const icon = stepStatus === 'completed' ? '\u2705' : stepStatus === 'in_progress' ? '\u23F3' : '\u2B1C';
            const iconClass = stepStatus === 'completed' ? 'completed' : stepStatus === 'in_progress' ? 'in_progress' : 'pending';
            return '<div class="step-item"><span class="step-icon ' + iconClass + '">' + icon + '</span><span class="step-text">' + (i+1) + '. ' + stepText + '</span></div>';
          }).join('') +
          '</div>';
        noteContent.insertAdjacentHTML('beforeend', stepsHTML);
      }
      // \u6DFB\u52A0\u590D\u5236\u6309\u94AE\u548C\u5B58\u50A8\u539F\u59CB Markdown
      const mdCard = noteContent.querySelector('.progress-card');
      if (mdCard) {
        mdCard.setAttribute('data-raw-markdown', data.markdown);
        const copyBtn = document.createElement('button');
        copyBtn.className = 'progress-card-copy-btn';
        copyBtn.textContent = '\u{1F4CB}';
        copyBtn.title = 'Copy content';
        copyBtn.onclick = function() { copyProgressCard(this); };
        // \u521B\u5EFA copy-bar \u5BB9\u5668\u5305\u88F9\u4E24\u4E2A\u6309\u94AE
        const bar = document.createElement('div');
        bar.className = 'copy-bar';
        mdCard.prepend(bar);
        bar.appendChild(copyBtn);
        // \u6DFB\u52A0 Copy as Markdown \u6309\u94AE
        const mdCopyBtn = document.createElement('button');
        mdCopyBtn.className = 'progress-card-md-btn';
        mdCopyBtn.textContent = '\u{1F4DD}';
        mdCopyBtn.title = 'Copy as Markdown';
        mdCopyBtn.onclick = function() { copyProgressCardAsMarkdown(this); };
        bar.appendChild(mdCopyBtn);
      }
      noteContent.scrollTop = noteContent.scrollHeight;
      return;
    }

    // \u2500\u2500 \u539F\u6709\u7ED3\u6784\u5316\u5B57\u6BB5\u903B\u8F91\uFF08\u4FDD\u7559\u5411\u540E\u517C\u5BB9\uFF09\u2500\u2500
    const { title, description, progress, status, steps: stepListFromData } = data || {};
    const steps = stepListFromData || data.steps || data.plan;
    const cardHTML = 
      '<div class="progress-card">' +
      '  <div class="title">' + (title || t('Processing...')) + '</div>' +
      (description ? '  <div style="margin-bottom:8px;color:var(--text-muted);font-size:14px;">' + description + '</div>' : '') +
      '  <div class="progress-bar">' +
      '    <div class="progress-fill" style="width: ' + (progress || 0) + '%"></div>' +
      '  </div>' +
      '  <div class="status">' +
      '    ' + (status || t('In progress')) + ' \u2022 ' + (progress || 0) + '%' +
      '  </div>' +
      (steps && steps.length ? '  <div style="margin-top:12px;font-size:13px;color:var(--text-muted);">' + t('Steps') + ' ' + steps.map((s, i) => {
            const stepText = (typeof s === 'object' && s !== null) ? (s.step || JSON.stringify(s)) : String(s);
            const stepStatus = (typeof s === 'object' && s !== null) ? (s.status || '') : '';
            const icon = stepStatus === 'completed' ? '\u2705' : stepStatus === 'in_progress' ? '\u23F3' : '\u2B1C';
            return '<span style="margin-right:8px;">">' + icon + ' ' + (i+1) + '. ' + stepText + '</span>';
          }).join('') + '</div>' : '') +
      '</div>';
    appendMessage({ role: 'assistant', text: cardHTML, timestamp: Date.now() });
    // Also update the side panel
    if (noteContent && title) {
      const noteHTML =
        '<div class="progress-card" style="margin:8px 0;">' +
        '  <div class="title">' + title + '</div>' +
        (description ? '  <div style="margin-bottom:6px;color:var(--text-muted);font-size:12px;">' + description + '</div>' : '') +
        '  <div class="progress-bar">' +
        '    <div class="progress-fill" style="width: ' + (progress || 0) + '%"></div>' +
        '  </div>' +
        '  <div class="status" style="font-size:12px;">' +
        '    ' + (status || t('In progress')) + ' \u2022 ' + (progress || 0) + '%' +
        '  </div>' +
        (steps && steps.length ? '  <div style="margin-top:8px;font-size:12px;color:var(--text-muted);">' + t('Steps') + ' ' + steps.map((s, i) => {
            const stepText = (typeof s === 'object' && s !== null) ? (s.step || JSON.stringify(s)) : String(s);
            const stepStatus = (typeof s === 'object' && s !== null) ? (s.status || '') : '';
            const icon = stepStatus === 'completed' ? '\u2705' : stepStatus === 'in_progress' ? '\u23F3' : '\u2B1C';
            return '<div class="step-item"><span class="step-icon ' + (stepStatus === 'completed' ? 'completed' : stepStatus === 'in_progress' ? 'in_progress' : 'pending') + '">' + icon + '</span><span class="step-text">' + (i+1) + '. ' + stepText + '</span></div>';
          }).join('') + '</div>' : '') +
        '</div>';
      // Remove placeholder text if present
      const placeholder2 = noteContent.querySelector('div[style*="text-align:center"]');
      if (placeholder2 && placeholder2.textContent.includes('Progress notes will appear here')) {
        placeholder2.remove();
      }
      noteContent.insertAdjacentHTML('beforeend', noteHTML);
      // \u4E3A\u6700\u540E\u4E00\u5F20\u7ED3\u6784\u5316\u5361\u7247\u6DFB\u52A0 Copy as Markdown \u6309\u94AE
      const lastCard = noteContent.querySelector('.progress-card:last-child');
      if (lastCard) {
        const existingBtn = lastCard.querySelector('.progress-card-copy-btn');
        if (existingBtn) {
          // \u521B\u5EFA copy-bar \u5BB9\u5668\u5305\u88F9\u4E24\u4E2A\u6309\u94AE
          const bar2 = document.createElement('div');
          bar2.className = 'copy-bar';
          existingBtn.parentNode.insertBefore(bar2, existingBtn);
          bar2.appendChild(existingBtn);
          const mdCopyBtn = document.createElement('button');
          mdCopyBtn.className = 'progress-card-md-btn';
          mdCopyBtn.textContent = '\u{1F4DD}';
          mdCopyBtn.title = 'Copy as Markdown';
          mdCopyBtn.onclick = function() { copyProgressCardAsMarkdown(this); };
          bar2.appendChild(mdCopyBtn);
        }
      }
      noteContent.scrollTop = noteContent.scrollHeight;
    }
  }

  function appendMessage(msg) {
    emptyState.style.display = 'none';
    const div = document.createElement('div');
    div.className = 'msg msg-' + msg.role;
    const bubble = document.createElement('div');
    bubble.className = 'msg-bubble';
    if (msg.role === 'assistant' && typeof marked !== 'undefined') {
      bubble.innerHTML = marked.parse(msg.text);
    } else {
      bubble.textContent = msg.text;
    }
    div.appendChild(bubble);
    
    // \u5904\u7406\u52A9\u624B\u6D88\u606F\u4E2D\u7684\u97F3\u9891\u9644\u4EF6\uFF08TTS \u8BED\u97F3\u56DE\u590D\uFF09
    // \u76F4\u63A5\u5728 bubble \u4E2D\u67E5\u627E <audio> \u5143\u7D20\uFF08msg.text \u5DF2\u7ECF\u8FC7 resolveMediaPaths \u8F6C\u6362\uFF0CMEDIA: \u5DF2\u88AB\u66FF\u6362\u4E3A <audio>\uFF09
    if (msg.role === 'assistant') {
      const audioElements = bubble.querySelectorAll('audio');
      if (audioElements.length > 0) {
        // \u5C06\u5E26\u6709\u97F3\u9891\u7684\u6D88\u606F\u6807\u8BB0\u4E3A\u8BED\u97F3\u6D88\u606F\u6837\u5F0F
        bubble.classList.add('msg-audio-bubble');
        // \u4F7F\u7528 <audio> \u539F\u751F\u63A7\u5236\u6309\u94AE
        for (let i = 0; i < audioElements.length; i++) {
          const audio = audioElements[i];
          audio.controls = true;
          audio.preload = 'metadata';
          audio.style.cssText = 'max-width:100%;display:block;margin:4px 0;';
        }
      }
    }
    
    // Render attachments (for user-sent images)
    if (msg.attachments && msg.attachments.length > 0) {
      const attachDiv = document.createElement('div');
      attachDiv.className = 'msg-attachments';
      for (const att of msg.attachments) {
        if (att.data && att.mimeType && att.mimeType.startsWith('image/')) {
          const img = document.createElement('img');
          img.src = 'data:' + att.mimeType + ';base64,' + att.data;
          img.className = 'msg-attachment-img';
          img.alt = att.name || '${vscode3.l10n.t("attachment")}';
          attachDiv.appendChild(img);
        } else if (att.data) {
          const link = document.createElement('a');
          link.href = 'data:' + att.mimeType + ';base64,' + att.data;
          link.textContent = att.name || '${vscode3.l10n.t("attachment")}';
          link.download = att.name || 'download';
          attachDiv.appendChild(link);
        }
      }
      if (attachDiv.children.length > 0) {
        div.appendChild(attachDiv);
      }
    }
    
    if (msg.timestamp) {
      const time = document.createElement('div');
      time.className = 'msg-time';
      time.textContent = new Date(msg.timestamp).toLocaleTimeString();
      div.appendChild(time);
    }
    messagesEl.appendChild(div);
    if (msg.role === 'assistant') renderMermaidBlocks();
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function clearMessages() {
    messagesEl.innerHTML = '';
    messagesEl.appendChild(emptyState);
    emptyState.style.display = '';
  }

  // \u590D\u5236\u7EAF\u6587\u672C\u5230\u526A\u8D34\u677F\uFF08\u5E26\u201C\u5DF2\u590D\u5236\u201D\u53CD\u9988\uFF09
  async function copyTextToClipboard(text, btnEl) {
    try {
      await navigator.clipboard.writeText(text);
      showCopied(btnEl);
    } catch (err) {
      console.error('Copy source failed:', err);
    }
  }

  // \u5C06\u6E32\u67D3\u540E\u7684 SVG \u8F6C\u4E3A PNG dataUrl\uFF0C\u4EA4\u7ED9\u5BBF\u4E3B\u5F39\u51FA\u4FDD\u5B58\u5BF9\u8BDD\u6846\u5199\u5165\u672C\u5730\u6587\u4EF6
  async function exportSvgToPng(svgContainer, btnEl) {
    const svgEl = svgContainer ? svgContainer.querySelector('svg') : null;
    console.log('[Mermaid Export] start, svgEl=', !!svgEl);
    if (!svgEl) {
      console.error('[Mermaid Export] No SVG found');
      vscode.postMessage({ type: 'notify', text: '${vscode3.l10n.t("SVG not found, cannot export")}' });
      return;
    }
    try {
      const xml = new XMLSerializer().serializeToString(svgEl);
      const svgBlob = new Blob([xml], { type: 'image/svg+xml;charset=utf-8' });
      let dataUrl;
      // \u590D\u7528\u4E0E\u590D\u5236\u76F8\u540C\u7684 createImageBitmap \u4F18\u5148 + DOMParser \u515C\u5E95\u903B\u8F91
      const rect = svgEl.getBoundingClientRect();
      const w = Math.max(1, Math.round(rect.width));
      const h = Math.max(1, Math.round(rect.height));
      try {
        const bitmap = await createImageBitmap(svgBlob);
        const canvas = document.createElement('canvas');
        canvas.width = w * 2;
        canvas.height = h * 2;
        const ctx = canvas.getContext('2d');
        ctx.scale(2, 2);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(bitmap, 0, 0, w, h);
        bitmap.close();
        dataUrl = canvas.toDataURL('image/png');
        console.log('[Mermaid Export] dataUrl len (bitmap)=', dataUrl.length);
      } catch (bmpErr) {
        console.log('[Mermaid Export] createImageBitmap failed:', bmpErr.message);
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(xml, 'image/svg+xml');
        svgDoc.querySelectorAll('foreignObject').forEach(fo => {
          const text = fo.textContent || '';
          if (text) {
            const g = svgDoc.createElement('g');
            const t = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'text');
            t.setAttribute('x', fo.getAttribute('x') || '0');
            t.setAttribute('y', fo.getAttribute('y') || '1em');
            t.textContent = text;
            g.appendChild(t);
            fo.parentNode.replaceChild(g, fo);
          }
        });
        const cleanBlob = new Blob([new XMLSerializer().serializeToString(svgDoc.documentElement)], { type: 'image/svg+xml;charset=utf-8' });
        const cleanUrl = URL.createObjectURL(cleanBlob);
        const img = new Image();
        await new Promise((resolve, reject) => {
          const timer = setTimeout(() => reject(new Error('SVG image load timeout')), 5000);
          img.onload = () => { clearTimeout(timer); resolve(null); };
          img.onerror = () => { clearTimeout(timer); reject(new Error('SVG image load failed')); };
          img.src = cleanUrl;
        });
        const canvas = document.createElement('canvas');
        canvas.width = w * 2;
        canvas.height = h * 2;
        const ctx = canvas.getContext('2d');
        ctx.scale(2, 2);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        dataUrl = canvas.toDataURL('image/png');
        console.log('[Mermaid Export] dataUrl len (domparser)=', dataUrl.length);
        URL.revokeObjectURL(cleanUrl);
      }
      vscode.postMessage({ type: 'exportImage', dataUrl: dataUrl });
      console.log('[Mermaid Export] postMessage sent');
      if (btnEl) {
        const orig = btnEl.dataset.originalText || btnEl.textContent;
        btnEl.dataset.originalText = orig;
        btnEl.textContent = '${vscode3.l10n.t("Exported")}';
        btnEl.classList.add('copied');
        setTimeout(() => { btnEl.textContent = orig; btnEl.classList.remove('copied'); }, 1500);
      }
    } catch (err) {
      console.error('[Mermaid Export] catch:', err);
      if (btnEl) {
        const orig = btnEl.dataset.originalText || btnEl.textContent;
        btnEl.dataset.originalText = orig;
        btnEl.textContent = '${vscode3.l10n.t("Export failed")}';
        btnEl.classList.add('copied');
        setTimeout(() => { btnEl.textContent = orig; btnEl.classList.remove('copied'); }, 1500);
      }
      vscode.postMessage({ type: 'notify', text: '${vscode3.l10n.t("Export failed")}: ' + (err && err.message ? err.message : String(err)) });
    }
  }

  // \u5C06\u6E32\u67D3\u540E\u7684 SVG \u8F6C\u4E3A PNG\uFF0C\u7ECF\u6269\u5C55\u5BBF\u4E3B\u5199\u5165\u7CFB\u7EDF\u526A\u8D34\u677F\uFF08webview \u65E0\u6CD5\u76F4\u63A5\u5199\u56FE\u7247\u526A\u8D34\u677F\uFF09
  async function copySvgToClipboard(svgContainer, btnEl) {
    const svgEl = svgContainer ? svgContainer.querySelector('svg') : null;
    console.log('[Mermaid Copy] start, svgEl=', !!svgEl);
    if (!svgEl) {
      console.error('[Mermaid] No SVG found for copy');
      return;
    }
    try {
      // \u8BCA\u65AD\uFF1A\u68C0\u6D4B SVG \u662F\u5426\u542B\u4F1A\u5BFC\u81F4 canvas \u6C61\u67D3\u7684\u8282\u70B9
      const hasForeign = svgEl.querySelector('foreignObject') !== null;
      const hasImage = svgEl.querySelector('image') !== null;
      const styleCount = svgEl.querySelectorAll('style').length;
      console.log('[Mermaid Copy] svg diagnostics:', JSON.stringify({ hasForeign, hasImage, styleCount, childNodes: svgEl.childNodes.length }));
      const xml = new XMLSerializer().serializeToString(svgEl);
      const svgBlob = new Blob([xml], { type: 'image/svg+xml;charset=utf-8' });
      let dataUrl;
      try {
        const rect = svgEl.getBoundingClientRect();
        const w = Math.max(1, Math.round(rect.width));
        const h = Math.max(1, Math.round(rect.height));
        console.log('[Mermaid Copy] rect=', JSON.stringify({w, h}));
        
        // \u65B9\u6848A\uFF1A\u5C1D\u8BD5 createImageBitmap\uFF08\u7ED5\u8FC7 CSP blob: \u9650\u5236\uFF09
        try {
          const bitmap = await createImageBitmap(svgBlob);
          const canvas = document.createElement('canvas');
          canvas.width = w * 2;
          canvas.height = h * 2;
          const ctx = canvas.getContext('2d');
          ctx.scale(2, 2);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, w, h);
          ctx.drawImage(bitmap, 0, 0, w, h);
          bitmap.close();
          dataUrl = canvas.toDataURL('image/png');
          console.log('[Mermaid Copy] dataUrl len (bitmap)=', dataUrl.length);
        } catch (bmpErr) {
          console.log('[Mermaid Copy] createImageBitmap failed:', bmpErr.message);
          
          // \u65B9\u6848B\uFF1ADOMParser \u89E3\u6790 SVG \u2192 foreignObject \u8F6C g \u7EC4\u6E32\u67D3
          const parser = new DOMParser();
          const svgDoc = parser.parseFromString(xml, 'image/svg+xml');
          const foNodes = svgDoc.querySelectorAll('foreignObject');
          foNodes.forEach(fo => {
            const textContent = fo.textContent || '';
            if (textContent) {
              const g = svgDoc.createElement('g');
              const tspan = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'text');
              tspan.setAttribute('x', fo.getAttribute('x') || '0');
              tspan.setAttribute('y', fo.getAttribute('y') || '1em');
              tspan.textContent = textContent;
              g.appendChild(tspan);
              fo.parentNode.replaceChild(g, fo);
            }
          });
          
          const sanitizedXml = new XMLSerializer().serializeToString(svgDoc.documentElement);
          const cleanBlob = new Blob([sanitizedXml], { type: 'image/svg+xml;charset=utf-8' });
          const cleanUrl = URL.createObjectURL(cleanBlob);
          const img = new Image();
          await new Promise((resolve, reject) => {
            const timer = setTimeout(() => reject(new Error('SVG image load timeout')), 5000);
            img.onload = () => { clearTimeout(timer); resolve(null); };
            img.onerror = (e) => { clearTimeout(timer); reject(new Error('SVG image load failed: ' + (e.message || ''))); };
            img.src = cleanUrl;
          });
          
          const canvas = document.createElement('canvas');
          canvas.width = w * 2;
          canvas.height = h * 2;
          const ctx = canvas.getContext('2d');
          ctx.scale(2, 2);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, w, h);
          ctx.drawImage(img, 0, 0, w, h);
          dataUrl = canvas.toDataURL('image/png');
          console.log('[Mermaid Copy] dataUrl len (domparser)=', dataUrl.length);
          URL.revokeObjectURL(cleanUrl);
        }
      } catch (err) {
        console.error('[Mermaid Copy] inner try/catch failed:', err);
        throw err;
      }
      vscode.postMessage({ type: 'copyImage', dataUrl: dataUrl });
      console.log('[Mermaid Copy] postMessage sent');
      showCopied(btnEl);
    } catch (err) {
      console.error('[Mermaid Copy] catch:', err);
      if (btnEl) {
        const orig = btnEl.dataset.originalText || btnEl.textContent;
        btnEl.dataset.originalText = orig;
        btnEl.textContent = '${vscode3.l10n.t("Copy failed")}';
        btnEl.classList.add('copied');
        setTimeout(() => { btnEl.textContent = orig; btnEl.classList.remove('copied'); }, 1500);
      }
    }
  }

  function showCopied(btnEl) {
    if (!btnEl) return;
    const originalText = btnEl.dataset.originalText || btnEl.textContent;
    btnEl.dataset.originalText = originalText;
    btnEl.textContent = '${vscode3.l10n.t("Copied")}';
    btnEl.classList.add('copied');
    setTimeout(() => {
      btnEl.textContent = originalText;
      btnEl.classList.remove('copied');
    }, 1000);
  }

  function renderMermaidBlocks() {
    if (typeof mermaid === 'undefined') return;
    // \u4F7F\u7528 requestAnimationFrame \u786E\u4FDD DOM \u5DF2\u6E32\u67D3
    requestAnimationFrame(() => {
      setTimeout(() => {
        // \u5339\u914D\u6240\u6709 code \u5757\uFF08\u5305\u62EC user \u548C assistant \u6D88\u606F\uFF09
        const allBlocks = document.querySelectorAll('pre code');
        allBlocks.forEach((block) => {
          const codeText = (block.textContent || '').trim();
          console.log('[Mermaid] Block content preview:', JSON.stringify(codeText.substring(0, 80)));
          // \u68C0\u6D4B mermaid \u8BED\u6CD5\u5173\u952E\u5B57
          if (!codeText.match(/^(flowchart|graph|sequenceDiagram|classDiagram|stateDiagram|erDiagram|gantt|pie|journey|C4|requirements|gitGraph|mindmap|quadrantChart)/m)) return;
          const pre = block.parentElement;
          // \u9632\u6B62\u91CD\u590D\u6E32\u67D3\uFF1A\u6E32\u67D3\u8FC7\u7684 pre \u4F1A\u52A0 mermaid-source \u7C7B
          if (!pre || pre.classList.contains('mermaid-source')) return;
          const svgId = 'mermaid-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6);
          mermaid.render(svgId, codeText)
          .then(svgResult => {
            // v11.4.1: render \u8FD4\u56DE {id, svg} \u5BF9\u8C61\uFF0C\u7528 svgResult.svg \u83B7\u53D6 SVG \u5B57\u7B26\u4E32
            const svgCode = svgResult.svg;
            // Mermaid v11.x \u5728\u8BED\u6CD5\u9519\u8BEF\u65F6\u4F1A resolve \u8FD4\u56DE\u542B\u9519\u8BEF\u6587\u672C\u7684 SVG \u800C\u975E reject\uFF0C
            // \u9700\u5728 .then() \u4E2D\u8FC7\u6EE4\uFF0C\u907F\u514D\u9519\u8BEF\u6587\u672C\u6C61\u67D3 UI
            if (svgCode && (svgCode.includes('Syntax error') || svgCode.includes('Error:'))) {
              if (typeof vscode !== 'undefined') {
                vscode.postMessage({ type: 'mermaidError', text: 'Mermaid syntax error' });
              }
              return;
            }
            // \u4FDD\u7559\u539F\u59CB\u4EE3\u7801\u5757\uFF0C\u5E76\u5728\u5176\u4E0A\u65B9\u63D2\u5165\u6E32\u67D3\u7ED3\u679C + \u590D\u5236\u6309\u94AE
            const wrapper = document.createElement('div');
            wrapper.className = 'mermaid-wrapper mermaid-full-width';
            
            const header = document.createElement('div');
            header.className = 'mermaid-header';
            const label = document.createElement('span');
            label.className = 'mermaid-label';
            label.textContent = '${vscode3.l10n.t("Mermaid")}';
            
            const svgContainer = document.createElement('div');
            svgContainer.className = 'mermaid-container';
            svgContainer.innerHTML = svgCode;
            
            // \u89C6\u56FE\u5207\u6362\u6309\u94AE\u7EC4
            const viewToggle = document.createElement('div');
            viewToggle.className = 'mermaid-view-toggle';
            const btnGraphic = document.createElement('button');
            btnGraphic.className = 'mermaid-btn mermaid-btn-graphic active';
            btnGraphic.textContent = '${vscode3.l10n.t("Image")}';
            btnGraphic.type = 'button';
            const btnSource = document.createElement('button');
            btnSource.className = 'mermaid-btn mermaid-btn-source';
            btnSource.textContent = '${vscode3.l10n.t("Source")}';
            btnSource.type = 'button';
            
            // \u5207\u6362\u663E\u793A\u903B\u8F91
            function toggleView(showGraphic) {
              svgContainer.style.display = showGraphic ? '' : 'none';
              pre.style.display = showGraphic ? 'none' : '';
              btnGraphic.classList.toggle('active', showGraphic);
              btnSource.classList.toggle('active', !showGraphic);
            }
            
            btnGraphic.addEventListener('click', () => toggleView(true));
            btnSource.addEventListener('click', () => toggleView(false));
            
            // \u590D\u5236\u6309\u94AE\uFF08\u6839\u636E\u5F53\u524D\u6FC0\u6D3B\u89C6\u56FE\u590D\u5236\u5BF9\u5E94\u5185\u5BB9\uFF09
            const copyBtn = document.createElement('button');
            copyBtn.className = 'mermaid-btn mermaid-copy-btn';
            copyBtn.textContent = '${vscode3.l10n.t("Copy")}';
            copyBtn.type = 'button';
            copyBtn.addEventListener('click', () => {
              if (btnGraphic.classList.contains('active')) {
                copySvgToClipboard(svgContainer, copyBtn);
              } else {
                copyTextToClipboard(codeText, copyBtn);
              }
            });
            
            // \u5BFC\u51FA\u6309\u94AE\uFF08\u56FE\u6A21\u5F0F \u2192 PNG \u5BFC\u51FA\u4E3A\u672C\u5730\u6587\u4EF6\uFF1B\u6E90\u7801\u6A21\u5F0F\u7981\u7528\uFF09
            const exportBtn = document.createElement('button');
            exportBtn.className = 'mermaid-btn mermaid-export-btn';
            exportBtn.textContent = '${vscode3.l10n.t("Export")}';
            exportBtn.type = 'button';
            exportBtn.title = '${vscode3.l10n.t("Export current Mermaid diagram as PNG file")}';
            exportBtn.addEventListener('click', () => {
              if (!btnGraphic.classList.contains('active')) {
                vscode.postMessage({ type: 'notify', text: '${vscode3.l10n.t("Please switch to diagram mode before exporting")}' });
                return;
              }
              exportSvgToPng(svgContainer, exportBtn);
            });
            
            header.appendChild(label);
            viewToggle.appendChild(btnGraphic);
            viewToggle.appendChild(btnSource);
            header.appendChild(viewToggle);
            
            // \u6309\u94AE\u7EC4\uFF08\u590D\u5236 + \u5BFC\u51FA\uFF09
            const btnGroup = document.createElement('div');
            btnGroup.className = 'mermaid-btn-group';
            btnGroup.appendChild(copyBtn);
            btnGroup.appendChild(exportBtn);
            header.appendChild(btnGroup);
            
            wrapper.appendChild(header);
            wrapper.appendChild(svgContainer);
            
            // \u7528 wrapper \u5305\u88F9\uFF0C\u4FDD\u7559\u539F pre \u5728\u4E0B\u65B9\uFF08\u9ED8\u8BA4\u663E\u793A\u56FE\uFF0C\u6E90\u7801\u53EF\u901A\u8FC7\u6309\u94AE\u5207\u6362\uFF09
            pre.parentNode.insertBefore(wrapper, pre);
            pre.classList.add('mermaid-source');
            pre.style.display = 'none';
          })
          .catch(err => {
            console.error('Mermaid render error:', err);
            const errMsg = String(err && err.message ? err.message : (typeof err === 'string' ? err : JSON.stringify(err)));
            // \u4E0D\u518D\u5728webview\u4E2D\u521B\u5EFA\u9519\u8BEFdiv\uFF0C\u6539\u4E3A\u53D1\u9001\u901A\u77E5\u7ED9\u6269\u5C55\u5BBF\u4E3B
            if (typeof vscode !== 'undefined') {
              vscode.postMessage({ 
                type: 'mermaidError', 
                text: errMsg.substring(0, 200)
              });
            }
          });
      });
    }, 100);  // \u589E\u52A0\u5EF6\u8FDF\uFF0C\u786E\u4FDD DOM \u5B8C\u5168\u6E32\u67D3
    });
  }

  function updateStream(text, done) {
    if (!streamEl && !done) {
      emptyState.style.display = 'none';
      streamEl = document.createElement('div');
      streamEl.className = 'msg msg-assistant';
      const bubble = document.createElement('div');
      bubble.className = 'msg-bubble';
      streamEl.appendChild(bubble);
      messagesEl.appendChild(streamEl);
    }
    if (streamEl) {
      const bubble = streamEl.querySelector('.msg-bubble');
      if (bubble) {
        if (text && typeof marked !== 'undefined') {
          bubble.innerHTML = marked.parse(text);
        } else {
          bubble.textContent = text;
        }
      }
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }
    if (done) {
      renderMermaidBlocks();
      streamEl = null;
    }
  }

  function showTyping(show, text) {
    typingEl.classList.toggle('active', show);
    const typingText = document.getElementById('typingText');
    if (typingText && text) typingText.textContent = text;
    if (show) messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function updateAgentCard() {
    agentOrb.textContent = agent.emoji || '\u{1F916}';
    agentOrb.className = 'agent-orb' + (connected ? ' online' : '');
    agentNameEl.textContent = agent.name || agent.id || '${vscode3.l10n.t("Agent")}';
    agentStatusEl.textContent = connected ? '${vscode3.l10n.t("online")}' : '${vscode3.l10n.t("disconnected")}';
    agentStatusEl.className = 'agent-status' + (connected ? ' online' : '');
    const btnReconnectEl = document.getElementById('btnReconnect');
    if (btnReconnectEl) {
      btnReconnectEl.style.display = connected ? 'none' : '';
      // \u70B9\u51FB\u91CD\u8FDE\uFF1A\u5411 extension \u53D1\u9001 reconnect \u6D88\u606F\uFF08idempotent\uFF0C\u91CD\u590D\u8D4B\u503C\u5B89\u5168\uFF09
      btnReconnectEl.onclick = () => {
        if (typeof vscode !== 'undefined') {
          vscode.postMessage({ type: 'reconnect' });
        }
      };
    }
  }

  function updateChips() {
    thinkingChip.textContent = '${vscode3.l10n.t("think: ")}' + (thinkingLevel || '${vscode3.l10n.t("default")}');
    verboseChip.textContent = '${vscode3.l10n.t("steps: ")}' + (verboseLevel || '${vscode3.l10n.t("default")}');
    reliabilityValue.textContent = (thinkingLevel || '${vscode3.l10n.t("default")}') + ' \xB7 ' + (verboseLevel || '${vscode3.l10n.t("default")}');
  }

  function renderModels(models) {
    modelValue.textContent = currentModel ? currentModel.split('/').pop() : '${vscode3.l10n.t("default")}';
  }

  function renderTasks(tasks) {
    const container = document.getElementById('tasksListContent');
    if (!container) return;
    // vs10n: webview's acquireVsCodeApi() does not expose l10n; use it only if available.
    const t = (str, ...args) => {
      if (vscode && vscode.l10n && typeof vscode.l10n.t === 'function') return vscode.l10n.t(str, ...args);
      const dict = { 'No tasks': '\u65E0\u4EFB\u52A1', 'No sessions': '\u65E0\u4F1A\u8BDD', 'Tasks': '\u4EFB\u52A1', 'Sessions': '\u4F1A\u8BDD', 'Progress Notes': '\u8FDB\u5EA6\u5907\u6CE8', 'In progress': '\u8FDB\u884C\u4E2D', 'Steps': '\u6B65\u9AA4', 'Processing...': '\u5904\u7406\u4E2D...', 'Progress notes will appear here': '\u8FDB\u5EA6\u5907\u6CE8\u5C06\u663E\u793A\u5728\u6B64\u5904', 'Running': '\u8FD0\u884C\u4E2D', 'Queued': '\u6392\u961F\u4E2D', 'Succeeded': '\u5DF2\u5B8C\u6210', 'Failed': '\u5931\u8D25', 'Cancelled': '\u5DF2\u53D6\u6D88', 'Timed out': '\u8D85\u65F6', 'Blocked': '\u963B\u585E', 'Lost': '\u4E22\u5931', 'Unknown': '\u672A\u77E5', 'Agent': '\u667A\u80FD\u4F53', 'Just now': '\u521A\u521A', '{0}m ago': '{0}\u5206\u949F\u524D', '{0}h ago': '{0}\u5C0F\u65F6\u524D', '{0}d ago': '{0}\u5929\u524D', 'Subagent': '\u5B50\u667A\u80FD\u4F53', 'Cron job': '\u5B9A\u65F6\u4EFB\u52A1' };
      return dict[str] || str;
    };
    if (!tasks || tasks.length === 0) {
      container.innerHTML = '<div style="color:var(--text-muted);font-size:12px;text-align:center;padding:20px 10px;">' + t('No tasks') + '</div>';
      return;
    }
    const statusMap = {
      running: { color: '#4caf50', text: t('Running') },
      queued: { color: '#ff9800', text: t('Queued') },
      succeeded: { color: '#2196f3', text: t('Succeeded') },
      failed: { color: '#f44336', text: t('Failed') },
      cancelled: { color: '#9e9e9e', text: t('Cancelled') },
      timed_out: { color: '#9e9e9e', text: t('Timed out') },
      blocked: { color: '#ff5722', text: t('Blocked') },
      lost: { color: '#9e9e9e', text: t('Lost') }
    };
    function truncate(str, maxLen) {
      if (!str) return '';
      return str.length > maxLen ? str.substring(0, maxLen) + '\u2026' : str;
    }
    function relTime(ts) {
      if (!ts) return '';
      const diff = Date.now() - ts;
      if (diff < 0) return '';
      const m = Math.floor(diff / 60000);
      if (m < 1) return t('Just now');
      if (m < 60) return t('{0}m ago', m);
      const h = Math.floor(m / 60);
      if (h < 24) return t('{0}h ago', h);
      return t('{0}d ago', Math.floor(h / 24));
    }
    let html = '';
    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i];
      const statusInfo = statusMap[task.status] || { color: '#ff9800', text: task.status || t('Unknown') };
      // \u4F18\u5148\u7EA7\uFF1Alabel > task\uFF08\u622A\u65AD50\u5B57\u7B26\uFF09> sourceId
      const displayName = task.label || truncate(task.task, 50) || task.sourceId || task.taskId;
      const timeText = relTime(task.endedAt || task.createdAt);
      html += '<div style="padding:8px 0;border-bottom:1px solid var(--border);font-size:12px;">';
      // \u7B2C\u4E00\u884C\uFF1A\u540D\u79F0 + \u76F8\u5BF9\u65F6\u95F4
      html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">';
      html += '<span style="font-weight:500;">' + displayName + '</span>';
      html += '<span style="color:var(--text-muted);font-size:11px;">' + timeText + '</span>';
      html += '</div>';
      // \u7B2C\u4E8C\u884C\uFF1A\u25CF \u72B6\u6001 + runtime\u6807\u7B7E + \u667A\u80FD\u4F53\uFF08\u540C\u4E00\u884C\uFF09
      const runtimeLabel = { cli: 'CLI', subagent: t('Subagent'), cron: t('Cron job'), acp: 'ACP' }[task.runtime] || task.runtime || '';
      let metaLine = '<span style="color:' + statusInfo.color + ';font-size:11px;">\u25CF ' + statusInfo.text + '</span>';
      if (runtimeLabel) metaLine += '<span style="color:var(--text-muted);font-size:11px;margin-left:8px;">' + runtimeLabel + '</span>';
      if (task.agentId) metaLine += '<span style="color:var(--text-muted);font-size:11px;margin-left:8px;">' + t('Agent') + ': ' + task.agentId + '</span>';
      html += '<div style="display:flex;align-items:center;margin-bottom:2px;">' + metaLine + '</div>';
      // \u7B2C\u4E09\u884C\uFF1A\u6458\u8981 = terminalSummary || progressSummary
      const summaryText = task.terminalSummary || task.progressSummary || '';
      if (summaryText) {
        html += '<div style="color:var(--text-secondary);font-size:11px;margin-top:2px;">' + truncate(summaryText, 120) + '</div>';
      } else if (task.task && task.task !== task.label && task.task.length > 20) {
        html += '<div style="color:var(--text-secondary);font-size:11px;margin-top:2px;">' + truncate(task.task, 100) + '</div>';
      }
      html += '</div>';
    }
    container.innerHTML = html;
  }

  // \u7B80\u5316\u8BBE\u5907\u540D\u79F0\uFF1A\u4ECE\u5B8C\u6574\u5B57\u7B26\u4E32\u4E2D\u63D0\u53D6\u6709\u610F\u4E49\u7684\u90E8\u5206
  // \u683C\u5F0F\u793A\u4F8B\uFF1A"hostname:macaddress:pid" \u2192 \u53D6\u5192\u53F7\u5206\u9694\u7684\u7B2C\u4E00\u6BB5
  // \u5982\u679C\u592A\u77ED\uFF08< 5\u5B57\u7B26\uFF09\uFF0C\u76F4\u63A5\u8FD4\u56DE\u539F\u503C
  function simplifyDeviceName(name) {
    if (!name) return '';
    // \u4F18\u5148\u53D6\u5192\u53F7\u5206\u9694\u7684\u7B2C\u4E00\u6BB5\uFF08hostname \u90E8\u5206\uFF09
    const parts = name.split(':');
    const firstPart = parts[0].trim();
    // \u5982\u679C\u7B2C\u4E00\u6BB5\u6709\u610F\u4E49\uFF08\u81F3\u5C112\u4E2A\u5B57\u7B26\u4E14\u4E0D\u8D85\u8FC715\u4E2A\u5B57\u7B26\uFF09\uFF0C\u4F7F\u7528\u5B83
    if (firstPart.length >= 2 && firstPart.length <= 15) return firstPart;
    // \u5426\u5219\u4F7F\u7528\u6574\u4E2A\u5B57\u7B26\u4E32\uFF0C\u4F46\u622A\u65AD\u523020\u5B57\u7B26
    return name.length > 20 ? name.substring(0, 20) + '\u2026' : name;
  }

  function renderSessions() {
    const t = (str, ...args) => {
      if (vscode && vscode.l10n && typeof vscode.l10n.t === 'function') return vscode.l10n.t(str, ...args);
      const dict = { 'No tasks': '\u65E0\u4EFB\u52A1', 'No sessions': '\u65E0\u4F1A\u8BDD', 'Tasks': '\u4EFB\u52A1', 'Sessions': '\u4F1A\u8BDD', 'Progress Notes': '\u8FDB\u5EA6\u5907\u6CE8', 'In progress': '\u8FDB\u884C\u4E2D', 'Steps': '\u6B65\u9AA4', 'Processing...': '\u5904\u7406\u4E2D...', 'Progress notes will appear here': '\u8FDB\u5EA6\u5907\u6CE8\u5C06\u663E\u793A\u5728\u6B64\u5904' };
      return dict[str] || str;
    };
    // Build a single shared HTML list so both panels stay in sync
    const buildList = (activeKey) => {
      let html = '';
      for (const session of sessions) {
        const cls = 'device-item' + (session.key === activeKey ? ' active' : '');
        const dotCls = 'device-dot' + (session.key === activeKey ? ' active' : '');
        // \u63D0\u53D6 device-info.device-name \u7528\u4E8E\u663E\u793A
        const deviceName = session['device-info']?.['device-name'] || session.displayName || session.key;
        const simplifiedName = simplifyDeviceName(deviceName);
        html += '<div class="' + cls + '" data-key="' + session.key + '" data-sid="' + (session.sessionId || '') + '" data-device-name="' + deviceName + '">';
        html += '<div class="' + dotCls + '"></div>';
        html += '<div class="device-info"><div class="device-name">' + simplifiedName + '</div><div class="device-meta">' + (session.status ? '[' + session.status + '] ' : '') + (session.agentId || session.key) + (session.sessionId ? ' \xB7 ' + session.sessionId.slice(0, 8) : '') + '</div></div>';
        if (session.totalTokens) html += '<div class="device-tokens">' + formatTokens(session.totalTokens) + '</div>';
        html += '<button class="device-delete">\xD7</button>';
        html += '</div>';
      }
      return html;
    };
    // Update HUD panel (sessionsList)
    sessionsList.innerHTML = '';
    if (sessions.length === 0) {
      sessionsList.innerHTML = '<div style="padding:8px 12px;font-size:12px;color:var(--text-muted);">' + t('No sessions') + '</div>';
    } else {
      sessionsList.innerHTML = buildList(currentSession);
      // Attach click handlers after DOM insertion
      sessionsList.querySelectorAll('.device-item[data-key]').forEach(el => {
        el.addEventListener('click', () => {
          const key = el.getAttribute('data-key') || '';
          const deviceName = el.getAttribute('data-device-name') || '';
          const sid = el.getAttribute('data-sid') || undefined;
          currentSession = key;
          // \u4F1A\u8BDD\u70B9\u51FB\uFF1A\u521B\u5EFA/\u5207\u6362\u8BE5 sessionKey \u7684\u4E13\u5C5E tab\uFF0C\u7EDD\u4E0D\u590D\u7528 Chat tab
          vscode.postMessage({ type: 'addChatTabFromSession', sessionKey: key, deviceName: deviceName, sessionId: sid });
          renderSessions();
        });
        el.querySelector('.device-delete')?.addEventListener('click', (e) => {
          e.stopPropagation();
          vscode.postMessage({ type: 'deleteSession', sessionKey: el.getAttribute('data-key') });
        });
      });
    }
    // Also update the progress-note-panel tab-sessions content
    const tabSessionsEl = document.getElementById('tabSessionsContent');
    if (tabSessionsEl) {
      if (sessions.length === 0) {
        tabSessionsEl.innerHTML = '<div style="color:var(--text-muted);font-size:12px;text-align:center;padding:20px 10px;">' + t('No sessions') + '</div>';
      } else {
        tabSessionsEl.innerHTML = buildList(currentSession);
        tabSessionsEl.querySelectorAll('.device-item[data-key]').forEach(el => {
          el.addEventListener('click', () => {
            const sessionKey = el.getAttribute('data-key');
            const deviceName = el.getAttribute('data-device-name') || '';
            const sid = el.getAttribute('data-sid') || undefined;
            // \u70B9\u51FB tabSessionsContent \u4E2D\u7684\u4F1A\u8BDD\u65F6\uFF0C\u6DFB\u52A0\u65B0\u7684 chat tab \u5E76\u52A0\u8F7D\u5386\u53F2
            vscode.postMessage({
              type: 'addChatTabFromSession',
              sessionKey: sessionKey,
              deviceName: deviceName,
              sessionId: sid
            });
          });
          el.querySelector('.device-delete')?.addEventListener('click', (e) => {
            e.stopPropagation();
            vscode.postMessage({ type: 'deleteSession', sessionKey: el.getAttribute('data-key') });
          });
        });
      }
    }
  }

  function updateContextMeter() {
    const s = sessions.find(x => x.key === currentSession);
    if (s && s.totalTokens && s.contextTokens) {
      const pct = Math.min(100, Math.round(s.totalTokens / s.contextTokens * 100));
      contextFill.style.width = pct + '%';
      contextFill.className = 'context-fill' + (pct > 90 ? ' danger' : pct > 70 ? ' warning' : '');
    } else {
      contextFill.style.width = '0%';
      contextFill.className = 'context-fill';
    }
  }

  function renderAgentButtons() {
    const container = document.getElementById('agentButtons');
    if (!container) return;
    container.innerHTML = '';
    if (agents.length <= 1) return;
    for (const a of agents) {
      const btn = document.createElement('button');
      btn.className = 'agent-btn' + (a.id === agent.id ? ' active' : '');
      const emoji = document.createElement('span');
      emoji.className = 'agent-btn-emoji';
      emoji.textContent = a.emoji || '\u{1F916}';
      const name = document.createElement('span');
      name.textContent = a.name || a.id;
      btn.appendChild(emoji);
      btn.appendChild(name);
      btn.addEventListener('click', () => {
        // Find existing tab for this agent or create new one
        let tab = tabs.find(t => t.agentId === a.id);
        if (!tab) {
          tab = {
            id: 'tab-' + a.id + '-' + Date.now(),
            label: a.name || a.id,
            agentId: a.id,
            sessionKey: 'agent:' + a.id + ':main',
            messages: []
          };
          tabs.push(tab);
        }
        switchToTab(tab.id);
      });
      container.appendChild(btn);
    }
  }

  function renderLocalAgentsTree() {
    // \u6E32\u67D3\u5230 agents-local-panel \u5185\u90E8\uFF08\u907F\u514D\u6E05\u7A7A modelscope \u9762\u677F\uFF09\uFF0C\u82E5\u4E0D\u5B58\u5728\u5219\u56DE\u9000\u5230 tabAgentsContent
    var container = document.getElementById('agents-local-panel');
    if (!container) container = document.getElementById('tabAgentsContent');
    if (!container) return;
    container.innerHTML = '';
    // vs10n: webview l10n helper with Chinese fallback
    const t = (str, ...args) => {
      if (vscode && vscode.l10n && typeof vscode.l10n.t === 'function') return vscode.l10n.t(str, ...args);
      // webview fallback dictionary (zh-CN)
      const dict = { 'No agents': '\u65E0\u667A\u80FD\u4F53', 'Empty directory': '\u7A7A\u76EE\u5F55' };
      return dict[str] || str;
    };
    if (!agentsTreeData) {
      const emptyDiv = document.createElement('div');
      emptyDiv.style.cssText = 'color:var(--text-muted);font-size:12px;text-align:center;padding:20px 10px;';
      emptyDiv.textContent = t('No agents');
      container.appendChild(emptyDiv);
      return;
    }
    function getIcon(node) {
      if (node.type === 'directory') {
        if (node.children && node.children.length > 0) return '\u{1F4C2}';
        return '\u{1F4C1}';
      }
      var name = (node.name || '').toLowerCase();
      if (name.endsWith('.md') || name.endsWith('.txt')) return '\u{1F4C4}';
      if (name.endsWith('.json') || name.endsWith('.yaml') || name.endsWith('.yml')) return '\u2699\uFE0F';
      if (name.endsWith('.js') || name.endsWith('.ts')) return '\u{1F4DC}';
      return '\u{1F4C4}';
    }
    function createItem(node, depth) {
      var item = document.createElement('div');
      item.className = 'agents-tree-item ' + (node.type === 'directory' ? 'folder' : 'file');
      item.style.paddingLeft = (depth * 16 + 8) + 'px';
      var iconSpan = document.createElement('span');
      iconSpan.className = 'agents-tree-icon';
      iconSpan.textContent = getIcon(node);
      var nameSpan = document.createElement('span');
      nameSpan.className = 'agents-tree-name';
      nameSpan.textContent = node.name;
      item.appendChild(iconSpan);
      item.appendChild(nameSpan);
      // Wrap each node in a wrapper div so children nest properly
      var wrapper = document.createElement('div');
      wrapper.className = 'agents-tree-node';
      wrapper.appendChild(item);

      if (node.type === 'directory') {
        var hasChildren = node.children && node.children.length > 0;
        if (hasChildren) {
          // Arrow indicator: collapsed = \u25B8, expanded = \u25BE
          var arrow = document.createElement('span');
          arrow.className = 'agents-tree-arrow';
          arrow.textContent = '\u25B8';
          item.insertBefore(arrow, iconSpan);

          var childrenWrapper = document.createElement('div');
          childrenWrapper.className = 'agents-tree-children';
          childrenWrapper.style.display = 'none';
          node.children.forEach(function(child) {
            var childWrapper = createItem(child, depth + 1);
            childrenWrapper.appendChild(childWrapper);
          });
          wrapper.appendChild(childrenWrapper);

          item.addEventListener('click', function(e) {
            e.stopPropagation();
            var isHidden = childrenWrapper.style.display === 'none';
            childrenWrapper.style.display = isHidden ? '' : 'none';
            arrow.textContent = isHidden ? '\u25BE' : '\u25B8';
          });
        } else {
          // Empty directory: no arrow, just a spacer to align with files
          var spacer = document.createElement('span');
          spacer.className = 'agents-tree-arrow';
          spacer.innerHTML = '&nbsp;';
          item.insertBefore(spacer, iconSpan);
          item.title = t('Empty directory');
          item.classList.add('empty-dir');
        }
      } else {
        // File: no arrow, just a spacer to align with directories
        var spacer = document.createElement('span');
        spacer.className = 'agents-tree-arrow';
        spacer.innerHTML = '&nbsp;';
        item.insertBefore(spacer, iconSpan);
        item.addEventListener('click', function(e) {
          e.stopPropagation();
          if (typeof vscode !== 'undefined') {
            vscode.postMessage({ type: 'openFile', path: node.path });
          }
        });
      }
      return wrapper;
    }
    var rootWrapper = createItem(agentsTreeData, 0);
    container.appendChild(rootWrapper);
    return rootWrapper;
  }

  function renderTabs() {
    const tabBar = document.getElementById('tabsBar');
    if (!tabBar) return;
    tabBar.querySelectorAll('.tab-item').forEach(el => el.remove());
    for (const t of tabs) {
      const div = document.createElement('div');
      div.className = 'tab-item' + (t.id === activeTabId ? ' active' : '');
      div.dataset.tabId = t.id;
      // \u6DFB\u52A0 tooltip \u663E\u793A\u4F1A\u8BDD\u4FE1\u606F
      let tooltipText = t.label;
      if (t.sessionKey) {
        const agentObj = agents.find(a => a.id === t.agentId);
        const agentName = agentObj?.name || t.agentId;
        const shortKey = t.sessionKey.length > 25 ? t.sessionKey.substring(0, 22) + '...' : t.sessionKey;
        tooltipText = agentName + ' | ' + shortKey;
      }
      div.title = tooltipText;
      const label = document.createElement('span');
      label.textContent = t.label;
      div.appendChild(label);
      // Close button (not for the default Chat tab)
      if (t.id !== 'tab-main') {
        const close = document.createElement('span');
        close.className = 'tab-close';
        close.textContent = '\xD7';
        close.addEventListener('click', (e) => {
          e.stopPropagation();
          closeTab(t.id);
        });
        div.appendChild(close);
      }
      div.addEventListener('click', () => switchToTab(t.id));
      tabBar.insertBefore(div, document.getElementById('btnAddTab'));
    }
  }

  function closeTab(tabId) {
    const idx = tabs.findIndex(t => t.id === tabId);
    if (idx < 0 || tabId === 'tab-main') return;
    tabs.splice(idx, 1);
    if (activeTabId === tabId) {
      // Switch to the last tab, or default Chat tab
      const newTab = tabs[Math.min(idx, tabs.length - 1)] || tabs[0];
      switchToTab(newTab.id);
    } else {
      renderTabs();
    }
  }

  function switchToTab(tabId) {
    const tab = tabs.find(t => t.id === tabId);
    if (!tab) return;
    // Save current tab's messages
    const oldTab = getActiveTab();
    if (oldTab) oldTab.messages = activeTabMessages.slice();
    activeTabId = tabId;
    agent = agents.find(a => a.id === tab.agentId) || agent;
    currentSession = tab.sessionKey;
    // Load new tab's messages
    activeTabMessages = (tab.messages || []).slice();
    clearMessages();
    for (const m of activeTabMessages) appendMessage(m);
    updateAgentCard();
    renderAgentButtons();
    renderTabs();
    // Tell extension to switch agent/session
    vscode.postMessage({ type: 'switchTab', agentId: tab.agentId, sessionKey: tab.sessionKey, sessionId: tab.sessionId });
  }

  function formatTokens(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(0) + 'K';
    return n.toString();
  }
})();
</script>
</body>
</html>`
  );
}

// src/chatView.ts
var _OpenClawChatView = class _OpenClawChatView {
  constructor(context, gateway2, channel) {
    this.messages = [];
    this.sessions = [];
    this.agents = [];
    this.activeAgent = { id: "main", name: "Agent", emoji: "\u{1F916}" };
    this.currentModel = "";
    this.currentSessionKey = "main";
    this.thinkingLevel = "";
    this.verboseLevel = "";
    this.gatewayUrl = "";
    this.agentsDir = "";
    this.messageHistory = [];
    this.autoContinueCount = 0;
    this.supervisionEnabled = false;
    this.supervisionTimer = null;
    this.lastSupervisedContent = "";
    this.supervisorBusy = false;
    this.supervisorPendingSessionKey = null;
    this.supervisorResponseResolver = null;
    this.supervisorTimeout = null;
    this.supervisorAccumulated = "";
    this.busyCount = 0;
    this.serverVersion = "";
    this.seenPreambleTexts = [];
    // Subagent activity tracking (Requirement A)
    this.lastSubagentEventMs = 0;
    this.activeSubagentCount = 0;
    this.subagentTimer = null;
    // sessions_yield tracking (Requirement B): set when busy + active subagent
    this.yieldState = false;
    this.yieldTimer = null;
    this.historyReloadTimer = null;
    this.context = context;
    this.gateway = gateway2;
    const ch = channel;
    this.log = (msg) => log(msg, LOG_INFO, ch);
    this.messageHistory = context.globalState.get("openclaw.messageHistory", []);
    const config = vscode4.workspace.getConfiguration("openclaw");
    this.gatewayUrl = config.get("gatewayUrl", "ws://127.0.0.1:18789");
    const configAgentId = config.get("agentId", "");
    const configSessionKey = config.get("sessionKey", "");
    if (configAgentId) {
      this.activeAgent = { id: configAgentId, name: configAgentId, emoji: "\u{1F916}" };
    }
    if (configSessionKey) {
      this.currentSessionKey = configSessionKey;
    }
    const configAgentsDir = config.get("agentsDir", "");
    this.agentsDir = resolveAgentsDir(configAgentsDir);
    try {
      if (!fs3.existsSync(this.agentsDir)) {
        fs3.mkdirSync(this.agentsDir, { recursive: true });
        log(`AgentsDIR created: ${this.agentsDir}`, LOG_INFO, ch);
      }
    } catch (mkdirErr) {
      log(`AgentsDIR create failed: ${(mkdirErr == null ? void 0 : mkdirErr.message) || mkdirErr}`, LOG_INFO, ch);
    }
    this.gateway.on("task.ended", () => {
      this.handleRequestTasks();
    });
    this.gateway.on("task.updated", () => {
      this.handleRequestTasks();
    });
    this.gateway.on("session.updated", () => {
      this.handleRequestSessions();
    });
    this.gateway.on("session.created", () => {
      this.handleRequestSessions();
    });
    this.gateway.on("session.deleted", () => {
      this.handleRequestSessions();
    });
  }
  get agentPrefix() {
    return `agent:${this.activeAgent.id}:`;
  }
  gwSessionKey(localKey) {
    return this.agentPrefix + (localKey || this.currentSessionKey);
  }
  show() {
    var _a;
    (_a = this.view) == null ? void 0 : _a.webview.postMessage({ type: "show" });
  }
  /** 已解析的 AgentsDIR（绝对路径，默认 <home>/.openclaw/agents），已确保目录存在 */
  get agentsDirectory() {
    return this.agentsDir;
  }
  setInputText(text) {
    this.postToWebview({ type: "setInputText", text });
  }
  newChat() {
    this.messages = [];
    this.currentSessionKey = "main";
    this.postToWebview({ type: "clearMessages" });
  }
  updateConnectionStatus(connected, serverVersion) {
    this.serverVersion = serverVersion || this.serverVersion;
    this.postToWebview({
      type: "init",
      sessionKey: this.currentSessionKey,
      gwSessionKey: this.gwSessionKey(),
      model: this.currentModel,
      connected,
      agent: this.activeAgent,
      gatewayUrl: this.gatewayUrl,
      thinkingLevel: this.thinkingLevel,
      verboseLevel: this.verboseLevel,
      messageHistory: this.messageHistory,
      supervisionEnabled: this.supervisionEnabled,
      version: this.serverVersion
    });
    this.postToWebview({
      type: "connectionStatus",
      connected,
      agent: this.activeAgent
    });
    if (connected) {
      this.handleRequestModels().catch(() => {
      });
      this.handleRequestSessions().catch(() => {
      });
      this.handleRequestAgents().catch(() => {
      });
      this.handleRequestTasks().catch(() => {
      });
      this.handleLoadMessages(this.currentSessionKey).catch(() => {
      });
    } else {
      this.busyCount = 0;
      this.postToWebview({ type: "busyState", busy: false, label: "" });
      this.activeSubagentCount = 0;
      this.postToWebview({ type: "subagentState", active: false, label: "", state: "" });
      this.updateYieldState();
    }
  }
  /**
   * Public method to send text to the chat view
   * @param text The text to send
   */
  async sendText(text) {
    await this.handleSendMessage(text);
  }
  /**
   * 处理进度卡片更新
   * @param card 进度卡片对象，null 表示清除
   */
  handleProgressCardUpdate(card) {
    if (!this.view)
      return;
    if (card) {
      this.postToWebview({
        type: "progressCard",
        data: {
          title: card.title,
          description: card.description,
          progress: card.progress,
          status: card.status,
          steps: card.steps || card.plan,
          // 优先使用 card.steps，回退到 card.plan
          plan: card.plan,
          markdown: card.markdown,
          revision: card.revision
        }
      });
    } else {
      this.postToWebview({ type: "progressCard", data: null });
    }
  }
  // Match Obsidian plugin's handleChatEvent
  async handleChatEvent(payload) {
    const sessionKey = this.resolveSession(payload == null ? void 0 : payload.sessionKey);
    const rawSessionKey = (payload == null ? void 0 : payload.sessionKey) || "";
    const state = typeof (payload == null ? void 0 : payload.state) === "string" ? payload.state : "";
    if (this.supervisorPendingSessionKey && rawSessionKey === this.supervisorPendingSessionKey) {
      if (state === "delta") {
        const text = await this.extractDeltaText(payload == null ? void 0 : payload.message);
        if (text) {
          this.supervisorAccumulated += text;
          this.log(`Supervisor delta chunk: +${text.length} chars (total=${this.supervisorAccumulated.length})`);
        }
      } else if (state === "final") {
        const finalText = await this.extractDeltaText(payload == null ? void 0 : payload.message);
        const fullReply = finalText || this.supervisorAccumulated;
        this.log(`Supervisor final reply: ${fullReply.substring(0, 80)}...`);
        if (this.supervisorTimeout) {
          clearTimeout(this.supervisorTimeout);
          this.supervisorTimeout = null;
        }
        this.supervisorPendingSessionKey = null;
        const resolver = this.supervisorResponseResolver;
        this.supervisorResponseResolver = null;
        this.supervisorAccumulated = "";
        if (resolver) {
          resolver(fullReply);
        }
        return;
      } else if (state === "error") {
        if (this.supervisorTimeout) {
          clearTimeout(this.supervisorTimeout);
          this.supervisorTimeout = null;
        }
        this.supervisorPendingSessionKey = null;
        const resolver = this.supervisorResponseResolver;
        this.supervisorResponseResolver = null;
        this.supervisorAccumulated = "";
        if (resolver) {
          resolver(null);
        }
        return;
      }
    }
    if (rawSessionKey && rawSessionKey.includes("subagent")) {
      const m = rawSessionKey.match(/^agent:([^:]+):/);
      if (m && m[1] === this.activeAgent.id) {
        this.lastSubagentEventMs = Date.now();
        this.activeSubagentCount++;
        this.startSubagentTimer();
        const tail = rawSessionKey.split(":").pop() || "subagent";
        const shortLabel = tail.length > 12 ? tail.substring(0, 8) + "\u2026" : tail;
        this.postToWebview({
          type: "subagentState",
          active: true,
          label: vscode4.l10n.t("Subagent active: {0}", shortLabel),
          state
        });
        this.updateYieldState();
      }
      return;
    }
    if (rawSessionKey) {
      const m = rawSessionKey.match(/^agent:([^:]+):/);
      if (m && m[1] !== this.activeAgent.id) {
        this.log(`chatEvent discarded: agent=${m[1]} != current=${this.activeAgent.id}`);
        return;
      }
    }
    this.log(`chatEvent: state=${state} session=${sessionKey} hasMsg=${!!(payload == null ? void 0 : payload.message)}`);
    if (state === "delta") {
      const text = await this.extractDeltaText(payload == null ? void 0 : payload.message);
      this.log(`delta len=${text.length} preview=${text.substring(0, 80)}`);
      if (text) {
        this.postToWebview({ type: "streamDelta", sessionKey, agentId: this.activeAgent.id, text });
      }
    } else if (state === "final") {
      this.log(`stream final`);
      const finalMsg = payload == null ? void 0 : payload.message;
      if (finalMsg) {
        const finalText = await this.extractDeltaText(finalMsg);
        this.log(`final text len=${finalText.length}`);
        if (finalText) {
          const isErrorResponse = _OpenClawChatView.ERROR_PATTERNS.some(
            (pattern) => finalText.includes(pattern)
          );
          if (isErrorResponse) {
            this.autoContinueCount++;
            this.log(`Auto-continue retry ${this.autoContinueCount}/${_OpenClawChatView.AUTO_CONTINUE_MAX}`);
            if (this.autoContinueCount >= _OpenClawChatView.AUTO_CONTINUE_MAX) {
              this.postToWebview({
                type: "autoContinueFailed",
                sessionKey,
                count: this.autoContinueCount
              });
              this.autoContinueCount = 0;
            } else {
              this.postToWebview({ type: "streamDelta", sessionKey, agentId: this.activeAgent.id, text: finalText });
              this.postToWebview({ type: "streamDone", sessionKey, agentId: this.activeAgent.id });
              this.sendContinueMessage();
              return;
            }
          } else {
            if (this.autoContinueCount > 0) {
              this.autoContinueCount = 0;
              this.context.globalState.update("openclaw.autoContinueCount", 0);
            }
            this.postToWebview({ type: "streamDelta", sessionKey, agentId: this.activeAgent.id, text: finalText });
          }
        }
      }
      this.postToWebview({ type: "streamDone", sessionKey, agentId: this.activeAgent.id });
      this.setBusy(false);
      this.scheduleHistoryReload(sessionKey, this.activeAgent.id);
    } else if (state === "aborted") {
      this.log(`stream aborted`);
      this.postToWebview({ type: "streamDone", sessionKey, agentId: this.activeAgent.id });
      this.setBusy(false);
      this.scheduleHistoryReload(sessionKey, this.activeAgent.id);
    } else if (state === "error") {
      const errorMsg = (payload == null ? void 0 : payload.errorMessage) || "unknown error";
      this.log(`stream error: ${errorMsg}`);
      this.postToWebview({ type: "streamError", sessionKey, agentId: this.activeAgent.id, error: errorMsg });
      this.setBusy(false);
    } else {
      this.log(`unknown chat state: ${state}`);
    }
  }
  // Match Obsidian plugin's handleStreamEvent
  handleStreamEvent(payload) {
    const stream = typeof (payload == null ? void 0 : payload.stream) === "string" ? payload.stream : "";
    const state = typeof (payload == null ? void 0 : payload.state) === "string" ? payload.state : "";
    const data = (payload == null ? void 0 : payload.data) || {};
    const toolName = data.name || data.toolName || (payload == null ? void 0 : payload.toolName) || (payload == null ? void 0 : payload.name) || "";
    const phase = data.phase || (payload == null ? void 0 : payload.phase) || "";
    this.log(`streamEvent: stream=${stream} state=${state} tool=${toolName} phase=${phase}`);
    if (data.kind === "preamble" && typeof data.progressText === "string" && data.progressText.trim()) {
      const t = data.progressText.trim();
      if (!this.seenPreambleTexts.includes(t)) {
        this.seenPreambleTexts.push(t);
        if (this.seenPreambleTexts.length > 50)
          this.seenPreambleTexts.shift();
      }
      return;
    }
    if (toolName && (phase === "start" || state === "tool_use")) {
      const label = `${toolName}`;
      this.postToWebview({ type: "toolCall", label, phase: "start" });
    } else if (toolName && phase === "result") {
      this.postToWebview({ type: "toolCall", label: toolName, phase: "result" });
    }
  }
  async extractDeltaText(message) {
    var _a;
    if (typeof message === "string")
      return await this.resolveMediaPaths(message);
    if (!message)
      return "";
    const content = message.content ?? message;
    let text = "";
    if (Array.isArray(content)) {
      for (const item of content) {
        if (typeof item === "string") {
          text += item;
        } else if (item && typeof item === "object" && "text" in item) {
          text += (text ? "\n" : "") + String(item.text);
        }
      }
    } else if (typeof content === "string") {
      text = content;
    } else {
      text = message.text || "";
    }
    const mediaUrls = (_a = message.openclawDelivery) == null ? void 0 : _a.mediaUrls;
    if (mediaUrls && mediaUrls.length > 0) {
      const audioParts = [];
      for (const mediaPath of mediaUrls) {
        const audioTag = await this.convertMediaToMarkdown(mediaPath);
        if (audioTag) {
          audioParts.push(audioTag);
        }
      }
      if (audioParts.length > 0) {
        text = text + "\n" + audioParts.join("\n");
      }
    }
    return await this.resolveMediaPaths(text);
  }
  async resolveMediaPaths(text) {
    if (!text || text.indexOf("MEDIA:") === -1)
      return text;
    const segments = text.split("\n");
    const resolvedSegments = [];
    for (const segment of segments) {
      if (segment.indexOf("MEDIA:") === 0) {
        const rest = segment.slice(6).trim();
        const typePrefixMatch = rest.match(/^(audio|video|img|image):(.+)$/);
        let mediaPath;
        let forcedTag;
        if (typePrefixMatch) {
          forcedTag = typePrefixMatch[1] === "image" ? "img" : typePrefixMatch[1];
          mediaPath = typePrefixMatch[2].trim();
        } else {
          mediaPath = rest;
        }
        const result = await this.convertMediaToMarkdown(mediaPath, forcedTag);
        if (result) {
          resolvedSegments.push(result);
        }
      } else {
        resolvedSegments.push(segment);
      }
    }
    return resolvedSegments.join("\n");
  }
  async convertMediaToMarkdown(mediaPath, forcedTag) {
    try {
      if (!mediaPath)
        return null;
      if (mediaPath.startsWith("http://") || mediaPath.startsWith("https://") || mediaPath.startsWith("/api/chat/media/")) {
        const tag2 = await this.buildRemoteMediaTag(mediaPath);
        if (forcedTag && (forcedTag === "audio" || forcedTag === "video")) {
          const absoluteUrl = mediaPath.startsWith("/api/chat/media/") ? await this.toAbsoluteMediaUrl(mediaPath) : mediaPath;
          return this.buildMediaTag(forcedTag, absoluteUrl);
        }
        return tag2;
      }
      const normalizedPath = mediaPath.replace(/\\/g, "/");
      let buffer;
      try {
        buffer = fs3.readFileSync(mediaPath);
      } catch {
        try {
          buffer = fs3.readFileSync(normalizedPath);
        } catch {
          return null;
        }
      }
      const ext = path4.extname(mediaPath).toLowerCase();
      const mediaInfo = getMediaInfo(ext);
      let mimeType = mediaInfo.mimeType;
      let tag = mediaInfo.tag;
      const base64 = buffer.toString("base64");
      const dataUrl = `data:${mimeType};base64,${base64}`;
      return this.buildMediaTag(tag, dataUrl);
    } catch {
      return null;
    }
  }
  /**
    * 将网关媒体相对路径（/api/chat/media/...）转为带 mediaTicket 的绝对 HTTP URL。
  * webview 中相对路径会解析到 vscode-webview:// 基址（非 HTTP 服务器），无法加载媒体；
  * 网关地址为 ws:// 或 wss://，据此推导出对应 http/https 基址。
  * 通过 RPC artifacts.download 获取包含 mediaTicket 鉴权的完整 URL。
  */
  async toAbsoluteMediaUrl(url) {
    if (!url.startsWith("/api/chat/media/"))
      return url;
    const match = url.match(/\/api\/chat\/media\/outgoing\/([^/]+)\/([^/]+)\/full/);
    if (!match) {
      const httpBase2 = this.gatewayUrl.replace(/^ws:\/\//, "http://").replace(/^wss:\/\//, "https://").replace(/\/+$/, "");
      return `${httpBase2}${url}`;
    }
    const [, sessionKeyEncoded, attachmentId] = match;
    const sessionKey = decodeURIComponent(sessionKeyEncoded);
    const httpBase = this.gatewayUrl.replace(/^ws:\/\//, "http://").replace(/^wss:\/\//, "https://").replace(/\/+$/, "");
    for (const prefix of ["artifact_managed_media_", "artifact_managed_image_"]) {
      try {
        const artifactId = prefix + attachmentId;
        const result = await this.gateway.request("artifacts.download", {
          artifactId,
          sessionKey
        });
        if (result == null ? void 0 : result.url) {
          const absoluteUrl = result.url.startsWith("/") ? httpBase + result.url : result.url;
          this.log(`toAbsoluteMediaUrl: resolved ${sessionKey}/${attachmentId} -> ${absoluteUrl}`);
          return absoluteUrl;
        }
      } catch (err) {
        this.log(`toAbsoluteMediaUrl: artifacts.download(${prefix}) failed for ${sessionKey}/${attachmentId}: ${(err == null ? void 0 : err.message) || err}`);
      }
    }
    return `${httpBase}${url}`;
  }
  /**
   * 为远程 URL 直接生成 HTML 标签（video/audio/img）。
   * 外部 URL 直接作为 src 使用，webview 需开启 enableResourceLoading 才能加载。
   * 网关媒体相对路径（/api/chat/media/...）自动转绝对 HTTP URL，避免解析到 vscode-webview:// 基址。
   */
  async buildRemoteMediaTag(url) {
    const cleanUrl = url.split("#")[0].split("?")[0];
    const ext = path4.extname(cleanUrl).toLowerCase();
    let { tag } = getMediaInfo(ext);
    if (!ext) {
      const lower = url.toLowerCase();
      if (lower.includes("/audio/") || lower.endsWith("/audio")) {
        tag = "audio";
      } else if (lower.includes("/video/") || lower.endsWith("/video")) {
        tag = "video";
      } else {
        tag = "audio";
      }
    }
    const src = await this.toAbsoluteMediaUrl(url);
    return this.buildMediaTag(tag, src);
  }
  /**
   * 根据标签名与数据源生成最终 HTML 标签。
   * video/audio 添加 controls 属性；img 添加样式限制大小。
   */
  buildMediaTag(tag, src) {
    if (tag === "video") {
      return `<video src="${src}" controls preload="metadata" style="max-width:100%;max-height:400px;border-radius:6px;"></video>`;
    } else if (tag === "audio") {
      return `<audio src="${src}" controls preload="metadata" style="max-width:100%;"></audio>`;
    } else {
      return `<img src="${src}" alt="media" style="max-width:100%;max-height:400px;border-radius:6px;" />`;
    }
  }
  async extractHistoryContent(content) {
    var _a;
    if (typeof content === "string")
      return await this.resolveMediaPaths(content);
    if (!content)
      return "";
    if (Array.isArray(content)) {
      let text = "";
      for (const block of content) {
        if (block.type === "text" && block.text) {
          text += (text ? "\n" : "") + block.text;
        } else if (block.type === "tool_result" && block.content) {
          if (typeof block.content === "string") {
            text += (text ? "\n" : "") + block.content;
          } else if (Array.isArray(block.content)) {
            for (const sub of block.content) {
              if ((sub == null ? void 0 : sub.type) === "text" && sub.text) {
                text += (text ? "\n" : "") + sub.text;
              }
            }
          }
        } else if ((block.type === "audio" || block.type === "file" || block.type === "media") && (block.content || block.url)) {
          let mediaPath = "";
          if (typeof block.url === "string" && block.url) {
            mediaPath = block.url;
          } else if (typeof block.content === "string") {
            mediaPath = block.content;
          } else if (block.content && typeof block.content === "object") {
            mediaPath = block.content.path || block.content.url || "";
          }
          if (mediaPath) {
            if (mediaPath.startsWith("/api/chat/media/")) {
              text += (text ? "\n" : "") + "MEDIA:" + block.type + ":" + mediaPath;
            } else {
              text += (text ? "\n" : "") + "MEDIA:" + mediaPath;
            }
          }
        }
      }
      const mediaUrls = (_a = content == null ? void 0 : content.openclawDelivery) == null ? void 0 : _a.mediaUrls;
      if (mediaUrls && mediaUrls.length > 0) {
        const audioParts = [];
        for (const mediaPath of mediaUrls) {
          const audioTag = await this.convertMediaToMarkdown(mediaPath);
          if (audioTag)
            audioParts.push(audioTag);
        }
        if (audioParts.length > 0) {
          text += (text ? "\n" : "") + audioParts.join("\n");
        }
      }
      return await this.resolveMediaPaths(text);
    }
    return "";
  }
  resolveSession(sessionKey) {
    if (!sessionKey)
      return this.currentSessionKey;
    const prefix = this.agentPrefix;
    if (prefix && sessionKey.startsWith(prefix)) {
      return sessionKey.slice(prefix.length);
    }
    const match = sessionKey.match(/^agent:[^:]+:(.+)$/);
    if (match)
      return match[1];
    return sessionKey;
  }
  resolveWebviewView(webviewView, _context, _token) {
    this.view = webviewView;
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: []
    };
    webviewView.webview.html = this.getHtml();
    webviewView.webview.onDidReceiveMessage(async (msg) => {
      handleWebviewMessage(msg, this);
    });
  }
  async handleSendMessage(text, fileRefs, webviewAttachments) {
    if (!text.trim())
      return;
    if (!this.gateway.connected) {
      vscode4.window.showWarningMessage(vscode4.l10n.t("OpenClaw: Not connected to gateway"));
      return;
    }
    if (this.autoContinueCount > 0) {
      this.autoContinueCount = 0;
      this.context.globalState.update("openclaw.autoContinueCount", 0);
    }
    const userMsg = {
      role: "user",
      text,
      timestamp: Date.now()
    };
    let attachments = [];
    if (webviewAttachments && webviewAttachments.length > 0) {
      attachments = webviewAttachments.map((a) => ({
        type: "file",
        mimeType: a.mimeType,
        fileName: a.name,
        content: a.data
      }));
    } else if (fileRefs) {
      attachments = await this.buildAttachments(fileRefs);
    }
    this.messages.push(userMsg);
    this.messageHistory.push(text);
    if (this.messageHistory.length > 200) {
      this.messageHistory = this.messageHistory.slice(-200);
    }
    this.context.globalState.update("openclaw.messageHistory", this.messageHistory);
    const msgWithAttachments = webviewAttachments && webviewAttachments.length > 0 || attachments.length > 0 ? {
      ...userMsg,
      attachments: webviewAttachments || []
    } : userMsg;
    this.postToWebview({ type: "userMessage", message: msgWithAttachments, agentId: this.activeAgent.id, gwKey: this.gwSessionKey() });
    this.postToWebview({ type: "historyUpdated", messageHistory: this.messageHistory });
    const runId = genId();
    this.postToWebview({ type: "streamStart", runId, agentId: this.activeAgent.id });
    try {
      let res;
      try {
        res = await this.gateway.request("chat.send", {
          sessionKey: this.gwSessionKey(),
          message: text,
          deliver: false,
          idempotencyKey: runId,
          ...attachments.length > 0 ? { attachments } : {}
        });
      } catch (sendErr) {
        const errMsg = (sendErr == null ? void 0 : sendErr.message) || "";
        if (errMsg.includes("ended during restart recovery")) {
          this.log(`Session ended, sending /new to create replacement...`);
          try {
            await this.gateway.request("chat.send", {
              sessionKey: this.gwSessionKey(),
              message: "/new",
              deliver: false,
              idempotencyKey: genId()
            });
            await new Promise((r) => setTimeout(r, 1e3));
            this.log(`Retrying send after /new...`);
            res = await this.gateway.request("chat.send", {
              sessionKey: this.gwSessionKey(),
              message: text,
              deliver: false,
              idempotencyKey: runId,
              ...attachments.length > 0 ? { attachments } : {}
            });
          } catch (retryErr) {
            this.log(`Retry after /new failed: ${retryErr == null ? void 0 : retryErr.message}`);
            throw sendErr;
          }
        } else {
          throw sendErr;
        }
      }
      this.setBusy(true);
      if (res && typeof res === "object" && res.aborted === false && (!Array.isArray(res.runIds) || res.runIds.length === 0)) {
        this.postToWebview({ type: "streamDone", runId, agentId: this.activeAgent.id });
        const replyText = this.formatCommandResponse(text, res);
        const assistantMsg = {
          role: "assistant",
          text: replyText,
          timestamp: Date.now()
        };
        this.messages.push(assistantMsg);
        this.postToWebview({ type: "userMessage", message: assistantMsg, agentId: this.activeAgent.id, gwKey: this.gwSessionKey() });
        this.setBusy(false);
      }
    } catch (err) {
      this.messages.push({
        role: "assistant",
        text: `Error: ${err}`,
        timestamp: Date.now()
      });
      this.postToWebview({ type: "streamDone", runId, agentId: this.activeAgent.id });
      this.setBusy(false);
    }
  }
  /**
   * Send a message without adding it to local history (used for auto-continue).
   * Note: do NOT call setBusy(true) here -- the parent send is already busy.
   * The parent busyCount will be decremented when the final/aborted/error state arrives.
   */
  async sendContinueMessage() {
    if (!this.gateway.connected)
      return;
    const runId = genId();
    this.postToWebview({ type: "streamStart", runId, agentId: this.activeAgent.id });
    try {
      try {
        await this.gateway.request("chat.send", {
          sessionKey: this.gwSessionKey(),
          message: "Continue",
          deliver: false,
          idempotencyKey: runId
        });
      } catch (sendErr) {
        const errMsg = (sendErr == null ? void 0 : sendErr.message) || "";
        if (errMsg.includes("ended during restart recovery")) {
          this.log(`Continue: session ended, sending /new...`);
          await this.gateway.request("chat.send", {
            sessionKey: this.gwSessionKey(),
            message: "/new",
            deliver: false,
            idempotencyKey: genId()
          });
          await new Promise((r) => setTimeout(r, 1e3));
          await this.gateway.request("chat.send", {
            sessionKey: this.gwSessionKey(),
            message: "Continue",
            deliver: false,
            idempotencyKey: runId
          });
        } else {
          throw sendErr;
        }
      }
    } catch {
      this.postToWebview({ type: "streamDone", runId, agentId: this.activeAgent.id });
      this.setBusy(false);
    }
  }
  async buildAttachments(fileRefs) {
    if (!fileRefs || fileRefs.length === 0)
      return [];
    const attachments = [];
    const MAX_TOTAL = 20 * 1024 * 1024;
    let totalSize = 0;
    const folders = vscode4.workspace.workspaceFolders;
    const rootUri = folders && folders.length > 0 ? folders[0].uri : void 0;
    for (const relPath of fileRefs) {
      if (totalSize >= MAX_TOTAL)
        break;
      try {
        if (!rootUri)
          continue;
        const fileUri = vscode4.Uri.joinPath(rootUri, relPath);
        const stat = await vscode4.workspace.fs.stat(fileUri);
        if (stat.size > MAX_TOTAL)
          continue;
        if (totalSize + stat.size > MAX_TOTAL)
          continue;
        const bytes = await vscode4.workspace.fs.readFile(fileUri);
        const mimeType = getMimeType(relPath);
        const content = Buffer.from(bytes).toString("base64");
        attachments.push({
          type: "file",
          mimeType,
          fileName: relPath.split("/").pop() || relPath,
          content
        });
        totalSize += stat.size;
      } catch {
      }
    }
    return attachments;
  }
  formatCommandResponse(command, response) {
    const cmd = command.trim().toLowerCase();
    if (!response)
      return "No response";
    if (cmd === "/stop") {
      if (response.aborted === true) {
        return "Stream stopped successfully";
      } else {
        return "No active stream to stop";
      }
    }
    if (cmd === "/new") {
      return "New chat session started";
    }
    if (cmd === "/models") {
      if (response.models && Array.isArray(response.models)) {
        return `Available models: ${response.models.join(", ")}`;
      }
      return "Models list retrieved";
    }
    if (cmd === "/help") {
      return "Available commands: /stop /new /models /help";
    }
    if (response.message)
      return response.message;
    if (response.ok !== void 0) {
      const okStr = response.ok === true ? "Success" : "Failed";
      if (response.aborted !== void 0) {
        return `${okStr}${response.aborted ? " (aborted)" : ""}`;
      }
      return okStr;
    }
    return JSON.stringify(response);
  }
  async handleStopStream() {
    try {
      await this.gateway.request("chat.abort", {
        sessionKey: this.gwSessionKey()
      });
    } catch {
    }
  }
  async handleSearchFiles(query, requestId) {
    try {
      const folders = vscode4.workspace.workspaceFolders;
      if (!folders || folders.length === 0) {
        this.postToWebview({ type: "fileResults", requestId, files: [] });
        return;
      }
      let pattern = "**/*";
      const cleanQuery = query ? query.replace(/[/\\]+$/, "") : "";
      let isRootFolder = false;
      if (!query) {
        pattern = "**/*";
      } else {
        const lastSlashIndex = Math.max(query.lastIndexOf("/"), query.lastIndexOf("\\"));
        if (lastSlashIndex > 0) {
          let dirPrefix = query.substring(0, lastSlashIndex).replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");
          const fileKeyword = query.substring(lastSlashIndex + 1);
          const rootFolderNames = folders.map((f) => f.name.toLowerCase());
          isRootFolder = rootFolderNames.includes(dirPrefix.toLowerCase());
          if (isRootFolder) {
            const targetFolder = folders.find((f) => f.name.toLowerCase() === dirPrefix.toLowerCase());
            if (!targetFolder) {
              return this.processSearchResults([], [...folders], cleanQuery, requestId, isRootFolder);
            }
            const basePattern = fileKeyword ? `**/*${fileKeyword}*` : `**/*`;
            const relativePattern = new vscode4.RelativePattern(targetFolder, basePattern);
            const uris2 = await vscode4.workspace.findFiles(relativePattern, "**/node_modules/**", 200);
            return this.processSearchResults(uris2, [...folders], cleanQuery, requestId, isRootFolder);
          } else if (fileKeyword) {
            pattern = `${dirPrefix}/**/*${fileKeyword}*`;
          } else if (lastSlashIndex === query.length - 1) {
            pattern = `${dirPrefix}/**/*`;
          }
        } else {
          pattern = `**/*${query.replace(/[/\\]/g, "*")}*`;
        }
      }
      const uris = await vscode4.workspace.findFiles(pattern, "**/node_modules/**", 200);
      return this.processSearchResults(uris, [...folders], cleanQuery, requestId, isRootFolder);
    } catch {
      this.postToWebview({ type: "fileResults", requestId, files: [] });
    }
  }
  async processSearchResults(uris, folders, cleanQuery, requestId, isRootFolder) {
    const files = [];
    const seen = /* @__PURE__ */ new Set();
    if (cleanQuery) {
      let browseUri;
      let displayPrefix = "";
      if (folders.length === 1) {
        const folder = folders[0];
        if (isRootFolder) {
          browseUri = folder.uri;
          displayPrefix = "";
        } else {
          browseUri = vscode4.Uri.joinPath(folder.uri, cleanQuery);
          displayPrefix = cleanQuery;
        }
      } else {
        const sep = cleanQuery.indexOf("/");
        if (sep > 0) {
          const folderName = cleanQuery.substring(0, sep);
          const folder = folders.find((f) => f.name.toLowerCase() === folderName.toLowerCase());
          if (folder) {
            const relPath = cleanQuery.substring(sep + 1);
            browseUri = vscode4.Uri.joinPath(folder.uri, relPath);
            displayPrefix = cleanQuery;
          }
        } else if (isRootFolder) {
          const folder = folders.find((f) => f.name.toLowerCase() === cleanQuery.toLowerCase());
          if (folder) {
            browseUri = folder.uri;
            displayPrefix = folder.name;
          }
        }
      }
      if (browseUri) {
        try {
          const entries = await vscode4.workspace.fs.readDirectory(browseUri);
          for (const [name, type] of entries) {
            if (name.startsWith("."))
              continue;
            const isDir = (type & vscode4.FileType.Directory) !== 0;
            const fullPath = displayPrefix ? `${displayPrefix}/${name}` : name;
            if (!seen.has(fullPath)) {
              seen.add(fullPath);
              files.push({ path: fullPath, isDir });
            }
          }
        } catch {
        }
      }
    }
    for (const uri of uris) {
      const workspaceFolder = vscode4.workspace.getWorkspaceFolder(uri);
      const relativePath = vscode4.workspace.asRelativePath(uri, false).replace(/\\/g, "/");
      let fullPath;
      if (folders.length > 1 && workspaceFolder) {
        fullPath = `${workspaceFolder.name}/${relativePath}`;
      } else {
        fullPath = relativePath;
      }
      if (seen.has(fullPath))
        continue;
      seen.add(fullPath);
      const parts = fullPath.split("/");
      let isDir = false;
      try {
        const stat = await vscode4.workspace.fs.stat(uri);
        isDir = (stat.type & vscode4.FileType.Directory) !== 0;
      } catch {
        isDir = false;
      }
      if (cleanQuery && !isRootFolder) {
        const q = cleanQuery.toLowerCase();
        const name = parts[parts.length - 1].toLowerCase();
        const full = fullPath.toLowerCase();
        if (!name.includes(q) && !full.includes(q))
          continue;
      }
      files.push({ path: fullPath, isDir });
      if (files.length >= 30)
        break;
    }
    const folders2 = [];
    if (!isRootFolder) {
      for (const folder of folders) {
        const folderName = folder.name;
        if (cleanQuery && !folderName.toLowerCase().includes(cleanQuery.toLowerCase()))
          continue;
        folders2.push({ path: folderName, isDir: true });
      }
    }
    this.postToWebview({
      type: "fileResults",
      requestId,
      files: [...folders2.slice(0, 5), ...files.slice(0, 30)]
    });
  }
  async handleRequestModels() {
    return handleRequestModels(this);
  }
  async handleRequestSessions() {
    var _a;
    try {
      const res = await this.gateway.request("sessions.list", {
        archived: false,
        includeGlobal: true,
        includeUnknown: true,
        includeDerivedTitles: true,
        limit: 100
      });
      this.sessions = (res == null ? void 0 : res.sessions) || [];
      this.log(`sessions.list: ${this.sessions.length} \u6761`);
      for (const s of this.sessions || []) {
        this.log(`  session: key=${JSON.stringify((s == null ? void 0 : s.key) || "")} id=${(s == null ? void 0 : s.sessionId) || "-"} name=${JSON.stringify(((_a = s == null ? void 0 : s["device-info"]) == null ? void 0 : _a["device-name"]) || (s == null ? void 0 : s.displayName) || (s == null ? void 0 : s.derivedTitle) || "")}`);
      }
      this.postToWebview({ type: "sessionsList", sessions: this.sessions });
    } catch (err) {
      this.log(`sessions.list error: ${err.message}`);
      this.postToWebview({ type: "sessionsList", sessions: [] });
    }
  }
  resolveActiveAgent() {
    var _a;
    if (!this.agents || this.agents.length === 0)
      return;
    const currentId = (_a = this.activeAgent) == null ? void 0 : _a.id;
    if (!currentId)
      return;
    let match = this.agents.find((a) => a.id === currentId);
    if (!match) {
      match = this.agents.find((a) => (a.name || "") === currentId);
    }
    if (match) {
      this.activeAgent = {
        id: match.id,
        name: match.name || match.id,
        emoji: match.emoji || "\u{1F916}"
      };
    }
  }
  async handleRequestAgents() {
    return handleRequestAgents(this);
  }
  async handleRequestTasks() {
    return handleRequestTasks(this);
  }
  async handleLoadDefaults() {
    var _a;
    try {
      const res = await this.gateway.request("config.get", {});
      const config = (res == null ? void 0 : res.config) || res || {};
      const agentDefaults = ((_a = config == null ? void 0 : config.agents) == null ? void 0 : _a.defaults) || {};
      this.thinkingLevel = agentDefaults.thinkingDefault || "";
      this.verboseLevel = agentDefaults.verboseDefault || "";
      this.postToWebview({
        type: "defaultsLoaded",
        thinkingLevel: this.thinkingLevel,
        verboseLevel: this.verboseLevel
      });
    } catch {
    }
  }
  async cycleThinking() {
    const levels = ["", "off", "low", "medium", "high"];
    const idx = levels.indexOf(this.thinkingLevel);
    this.thinkingLevel = levels[(idx + 1) % levels.length];
    this.postToWebview({ type: "thinkingChanged", level: this.thinkingLevel });
  }
  async cycleVerbose() {
    const levels = ["", "off", "on", "full"];
    const idx = levels.indexOf(this.verboseLevel);
    this.verboseLevel = levels[(idx + 1) % levels.length];
    this.postToWebview({ type: "verboseChanged", level: this.verboseLevel });
  }
  async handleOpenWorkdir() {
    var _a, _b;
    try {
      const agentListRes = await this.gateway.request("agents.list", {});
      const agents = (agentListRes == null ? void 0 : agentListRes.agents) || [];
      const agent = agents.find((a) => a.id === this.activeAgent.id);
      let workspace4 = (agent == null ? void 0 : agent.workspace) || "";
      if (!workspace4) {
        const configRes = await this.gateway.request("config.get", {});
        const config = (configRes == null ? void 0 : configRes.config) || configRes || {};
        workspace4 = ((_b = (_a = config == null ? void 0 : config.agents) == null ? void 0 : _a.defaults) == null ? void 0 : _b.workspace) || (config == null ? void 0 : config.workspace) || "";
      }
      if (!workspace4) {
        vscode4.window.showWarningMessage(vscode4.l10n.t("Could not determine working directory"));
        return;
      }
      const normalizedPath = workspace4.replace(/^[a-z]:/i, (match) => match.toUpperCase());
      const workspaceUri = vscode4.Uri.file(normalizedPath);
      const folders = vscode4.workspace.workspaceFolders;
      let alreadyExists = false;
      if (folders) {
        for (const folder of folders) {
          if (folder.uri.fsPath.toLowerCase() === workspaceUri.fsPath.toLowerCase()) {
            alreadyExists = true;
            break;
          }
        }
      }
      if (alreadyExists) {
        await vscode4.commands.executeCommand("workbench.view.explorer");
        await vscode4.commands.executeCommand("revealInExplorer", workspaceUri);
        await vscode4.commands.executeCommand("list.expand");
        vscode4.window.showInformationMessage(vscode4.l10n.t("Expanded workspace folder: {0}", workspaceUri.fsPath));
        return;
      }
      const currentFolders = vscode4.workspace.workspaceFolders;
      const replaceFolders = currentFolders ? currentFolders.map((f) => ({ uri: f.uri })) : [];
      replaceFolders.push({ uri: workspaceUri });
      const success = vscode4.workspace.updateWorkspaceFolders(
        0,
        currentFolders ? currentFolders.length : 0,
        ...replaceFolders
      );
      if (success) {
        vscode4.window.showInformationMessage(vscode4.l10n.t("Added folder to workspace: {0}", workspaceUri.fsPath));
      } else {
        vscode4.window.showErrorMessage(
          `Failed to add folder to workspace: ${workspaceUri.fsPath}. You may need to open a workspace (.code-workspace) file first.`
        );
      }
    } catch (err) {
      this.log(`openWorkdir error: ${err.message}`);
      vscode4.window.showErrorMessage(vscode4.l10n.t("Failed to open working directory: {0}", err.message));
    }
  }
  async handleToggleSupervision(enabled) {
    this.log(`handleToggleSupervision called with enabled=${enabled}`);
    this.supervisionEnabled = enabled;
    this.log(`Supervision ${enabled ? "enabled" : "disabled"}`);
    this.postToWebview({ type: "supervisionState", enabled });
    if (enabled) {
      this.log("About to call startSupervision()");
      await this.startSupervision();
      this.log("startSupervision() returned");
    } else {
      this.log("About to call stopSupervision()");
      this.stopSupervision();
      this.log("stopSupervision() returned");
    }
  }
  async startSupervision() {
    this.log(`startSupervision called, supervisionEnabled=${this.supervisionEnabled}, timer=${this.supervisionTimer !== null}`);
    if (this.supervisionTimer) {
      this.log("Timer already running, skipping start");
      return;
    }
    const config = vscode4.workspace.getConfiguration("openclaw");
    const intervalMinutes = config.get("supervisor.intervalMinutes", 5) || 5;
    const reminderMessage = config.get("supervisor.reminderMessage", "") || "";
    const agentId = config.get("supervisor.agentId", "") || "";
    const stopInquiryMethod = config.get("supervisor.stopInquiryMethod", "") || "";
    const stopSignalReply = config.get("supervisor.stopSignalReply", "yes") || "yes";
    const stopSignalContent = config.get("supervisor.stopSignalContent", "") || "";
    this.log(`Config read: interval=${intervalMinutes}min, agentId=${agentId}, reminder=${reminderMessage.substring(0, 30)}, inquiryMethod=${stopInquiryMethod}, stopSignal=${stopSignalReply}, stopSignalContent=${stopSignalContent.substring(0, 30)}`);
    if (!agentId) {
      this.log("ERROR: agentId is empty! Cannot start supervision.");
      vscode4.window.showWarningMessage(vscode4.l10n.t("OpenClaw: Supervisor agent ID not configured"));
      this.supervisionEnabled = false;
      return;
    }
    this.log(`Starting supervision with interval ${intervalMinutes}min, agent=${agentId}`);
    const supervisorSessionKey = `agent:${agentId}:main`;
    const HELLO_MESSAGE = "hello\uFF0C Next, we are ready to have a dialogue on supervision and judgment.Do not reply to the previous sentence.";
    this.log(`Sending supervisor handshake: ${HELLO_MESSAGE}`);
    try {
      const runId = genId();
      await this.gateway.request("chat.send", {
        sessionKey: supervisorSessionKey,
        message: HELLO_MESSAGE,
        deliver: false,
        idempotencyKey: runId
      });
      const handshakeReply = await this.waitForSupervisorResponse(supervisorSessionKey, 3e4);
      this.log(`Supervisor handshake completed. Supervisor agent reply: ${handshakeReply ? handshakeReply : "(no reply within timeout)"}`);
    } catch (err) {
      this.log(`Supervisor handshake failed: ${(err == null ? void 0 : err.message) || err}`);
    }
    this.supervisionTimer = setInterval(async () => {
      this.log("Interval timer fired, calling runSupervisionCheck...");
      await this.runSupervisionCheck(intervalMinutes, reminderMessage, agentId, stopInquiryMethod, stopSignalReply, stopSignalContent);
      this.log("runSupervisionCheck completed");
    }, intervalMinutes * 60 * 1e3);
    this.log("Running immediate supervision check...");
    this.runSupervisionCheck(intervalMinutes, reminderMessage, agentId, stopInquiryMethod, stopSignalReply, stopSignalContent).then(() => {
      this.log("Immediate supervision check completed");
    }).catch((err) => {
      this.log(`Immediate supervision check error: ${err.message}`);
    });
  }
  stopSupervision() {
    this.log(`stopSupervision called, timer=${this.supervisionTimer !== null}`);
    if (this.supervisionTimer) {
      clearInterval(this.supervisionTimer);
      this.supervisionTimer = null;
      this.log("Supervision timer cleared");
    }
    if (this.supervisorBusy) {
      this.log("WARNING: supervisorBusy is still true, clearing it");
      this.supervisorBusy = false;
    }
    if (this.supervisorTimeout) {
      clearTimeout(this.supervisorTimeout);
      this.supervisorTimeout = null;
      this.log("Supervisor request timeout cleared");
    }
    this.supervisorPendingSessionKey = null;
    this.supervisorResponseResolver = null;
    this.supervisorAccumulated = "";
    this.log("Supervision stopped");
  }
  async runSupervisionCheck(intervalMinutes, reminderMessage, agentId, stopInquiryMethod, stopSignalReply, stopSignalContent) {
    this.log(`runSupervisionCheck called: supervisionEnabled=${this.supervisionEnabled}, supervisorBusy=${this.supervisorBusy}`);
    if (!this.supervisionEnabled) {
      this.log("Supervision not enabled, returning");
      return;
    }
    try {
      this.log(`Fetching chat history for session: ${this.gwSessionKey()}`);
      const res = await this.gateway.request("chat.history", {
        sessionKey: this.gwSessionKey(),
        limit: 10
      });
      const msgs = (res == null ? void 0 : res.messages) || [];
      this.log(`chat.history returned ${msgs.length} messages`);
      let lastContent = "";
      for (let i = msgs.length - 1; i >= 0; i--) {
        const m = msgs[i];
        this.log(`  Checking message ${i}: role=${m.role}, hasContent=${!!m.content}`);
        if (m.role === "assistant") {
          const text = await this.extractHistoryContent(m.content);
          this.log(`  Assistant message text length: ${(text == null ? void 0 : text.length) || 0}`);
          if (text && !text.startsWith("HEARTBEAT")) {
            lastContent = text;
            this.log(`  Found last assistant content (length=${lastContent.length}), breaking`);
            break;
          }
        }
      }
      this.log(`Supervision check: last content length=${lastContent.length}, previous=${this.lastSupervisedContent.length}`);
      const isFirstCheck = this.lastSupervisedContent.length === 0;
      if (this.supervisorBusy) {
        this.log(`Supervisor inquiry skipped: already busy`);
        return;
      }
      this.supervisorBusy = true;
      this.log(`Inquiring supervisor every check: ${agentId}`);
      const inquiry = `${stopInquiryMethod}\uFF1A${lastContent}`;
      const supervisorSessionKey = `agent:${agentId}:main`;
      this.log(`Sending inquiry to supervisor session ${supervisorSessionKey}: ${inquiry.substring(0, 50)}...`);
      const runId = genId();
      try {
        await this.gateway.request("chat.send", {
          sessionKey: supervisorSessionKey,
          message: inquiry,
          deliver: false,
          idempotencyKey: runId
        });
        this.log(`Waiting for supervisor response (timeout 120s)...`);
        const reply = await this.waitForSupervisorResponse(supervisorSessionKey);
        if (reply && reply.toLowerCase().trim() === stopSignalReply.toLowerCase().trim()) {
          this.log(`Supervisor replied with stop signal: "${reply}"`);
          this.supervisionEnabled = false;
          this.stopSupervision();
          this.postToWebview({ type: "supervisionState", enabled: false });
          vscode4.window.showInformationMessage(vscode4.l10n.t("Supervision stopped by supervisor agent"));
          this.supervisorBusy = false;
          return;
        } else {
          this.log(`Supervisor replied: ${reply == null ? void 0 : reply.substring(0, 50)}... (not stop signal, continuing)`);
        }
        this.supervisorBusy = false;
      } catch (err) {
        this.log(`Supervisor inquiry failed: ${err.message}`);
        this.supervisorBusy = false;
      }
      if (isFirstCheck) {
        this.log(`First check, storing content baseline (length=${lastContent.length})`);
        this.lastSupervisedContent = lastContent;
        return;
      }
      if (lastContent === this.lastSupervisedContent && lastContent.length > 0) {
        this.log(`Content SAME (length=${lastContent.length}) \u2192 sending reminder`);
        if (reminderMessage) {
          this.log(`Sending reminder to active agent: ${reminderMessage.substring(0, 50)}...`);
          const runId2 = genId();
          try {
            await this.gateway.request("chat.send", {
              sessionKey: this.gwSessionKey(),
              message: reminderMessage,
              deliver: false,
              idempotencyKey: runId2
            });
            this.log(`Reminder sent successfully`);
          } catch (err) {
            this.log(`Reminder send failed: ${err.message}`);
          }
        } else {
          this.log(`WARNING: reminderMessage is empty, skip sending`);
        }
      } else if (lastContent !== this.lastSupervisedContent && lastContent.length > 0) {
        this.log(`Content DIFFERENT: previous=${this.lastSupervisedContent.length}, current=${lastContent.length}`);
        if (stopSignalContent) {
          const stopSignals = stopSignalContent.split("|").map((s) => s.trim()).filter((s) => s.length > 0);
          if (stopSignals.some((signal) => lastContent.includes(signal))) {
            this.log(`stopSignalContent matched in changed content: "${stopSignalContent.substring(0, 30)}"`);
            this.supervisionEnabled = false;
            this.stopSupervision();
            this.postToWebview({ type: "supervisionState", enabled: false });
            vscode4.window.showInformationMessage(vscode4.l10n.t("Supervision stopped: stop signal content detected"));
            return;
          } else {
            this.log(`stopSignalContent not matched (or empty), continuing`);
          }
        }
      } else {
        this.log(`Last content is empty, updating baseline`);
      }
      this.lastSupervisedContent = lastContent;
    } catch (err) {
      this.log(`Supervision check error: ${err.message}`);
    }
  }
  waitForSupervisorResponse(supervisorSessionKey, timeoutMs = 12e4) {
    return new Promise((resolve2) => {
      this.supervisorPendingSessionKey = supervisorSessionKey;
      this.supervisorResponseResolver = resolve2;
      this.supervisorAccumulated = "";
      const timeout = setTimeout(() => {
        this.log(`Supervisor response timeout after ${timeoutMs}ms (accumulated=${this.supervisorAccumulated.length})`);
        this.supervisorTimeout = null;
        this.supervisorPendingSessionKey = null;
        this.supervisorResponseResolver = null;
        resolve2(this.supervisorAccumulated || null);
      }, timeoutMs);
      this.supervisorTimeout = timeout;
    });
  }
  async handleLoadMessages(sessionKey, agentId, sessionId) {
    const targetAgentId = agentId || this.activeAgent.id;
    try {
      const res = await this.gateway.request("chat.history", {
        sessionKey: `agent:${targetAgentId}:${sessionKey}`,
        limit: 200
      });
      const msgs = (res == null ? void 0 : res.messages) || [];
      this.log(`history: ${msgs.length} messages (key=agent:${targetAgentId}:${sessionKey} id=${(res == null ? void 0 : res.sessionId) || sessionId || "-"})`);
      const parsed = await Promise.all(
        msgs.filter((m) => m.role === "user" || m.role === "assistant").map(async (m) => ({
          role: m.role,
          text: await this.extractHistoryContent(m.content),
          timestamp: m.timestamp || Date.now(),
          contentBlocks: Array.isArray(m.content) ? m.content : void 0
        }))
      );
      let filtered = parsed.filter((m) => typeof m.text === "string" && m.text.trim() && !m.text.startsWith("HEARTBEAT"));
      if (filtered.length > 0 && filtered[0].role === "user") {
        filtered.shift();
      }
      const preambleFiltered = filtered.filter((m) => {
        if (m.role !== "assistant" || !this.seenPreambleTexts.length)
          return true;
        return !isPreamble(m.text, this.seenPreambleTexts);
      });
      const seen = /* @__PURE__ */ new Set();
      const merged = [];
      for (const m of preambleFiltered) {
        const cleanText = normText(stripMedia(m.text));
        if (!cleanText && /<audio/i.test(m.text)) {
          merged.push(m);
          continue;
        }
        const key = m.role + "\0" + cleanText;
        const isMedia = /<audio/i.test(m.text) || m.text.indexOf("MEDIA:") === 0;
        if (isMedia) {
          const idx = merged.findIndex((x) => x.role + "\0" + normText(stripMedia(x.text)) === key);
          if (idx >= 0) {
            merged[idx] = m;
          } else {
            merged.push(m);
          }
          seen.add(key);
        } else {
          if (seen.has(key))
            continue;
          seen.add(key);
          merged.push(m);
        }
      }
      this.log(`history dedup: ${parsed.length} parsed -> ${merged.length} shown (audio=${merged.filter((m) => /<audio/i.test(m.text)).length})`);
      this.postToWebview({ type: "loadMessages", sessionKey, gwKey: `agent:${targetAgentId}:${sessionKey}`, agentId: targetAgentId, sessionId, messages: merged });
    } catch (err) {
      this.log(`history error: ${err.message}`);
      this.postToWebview({ type: "loadMessages", sessionKey, gwKey: `agent:${targetAgentId}:${sessionKey}`, agentId: targetAgentId, sessionId, messages: [] });
    }
  }
  async handleDeleteSession(sessionKey) {
    try {
      await this.gateway.request("sessions.delete", { sessionKey: this.gwSessionKey(sessionKey) });
      await this.handleRequestSessions();
    } catch {
    }
  }
  async handleSwitchAgent(agentId) {
    const agent = this.agents.find((a) => a.id === agentId);
    if (agent) {
      this.activeAgent = agent;
      this.currentSessionKey = "main";
      this.postToWebview({
        type: "agentSwitched",
        agent: this.activeAgent
      });
      await this.handleLoadMessages("main");
      await this.handleRequestSessions();
    }
  }
  postToWebview(msg) {
    var _a;
    (_a = this.view) == null ? void 0 : _a.webview.postMessage(msg);
  }
  /**
   * 运行结束后延迟重新拉取历史，使服务端最终消息（含 TTS 语音/音频）立即呈现。
   * 使用防抖，避免同一 run 的 final/aborted 触发多次重复刷新。
   */
  scheduleHistoryReload(sessionKey, agentId) {
    if (this.historyReloadTimer)
      clearTimeout(this.historyReloadTimer);
    const localKey = this.resolveSession(sessionKey) || this.currentSessionKey;
    const targetAgentId = agentId || this.activeAgent.id;
    this.historyReloadTimer = setTimeout(async () => {
      this.historyReloadTimer = null;
      try {
        await this.handleLoadMessages(localKey, targetAgentId);
      } catch {
      }
    }, 900);
  }
  setBusy(active) {
    if (active)
      this.busyCount = Math.max(1, this.busyCount + 1);
    else
      this.busyCount = Math.max(0, this.busyCount - 1);
    const n = this.busyCount;
    this.postToWebview({
      type: "busyState",
      busy: n > 0,
      label: n > 1 ? vscode4.l10n.t("Processing ({0} queued)", n) : vscode4.l10n.t("Processing...")
    });
    this.updateYieldState();
  }
  /**
   * Start (or reset) the subagent activity timeout timer.
   * When no subagent event arrives within SUBAGENT_ACTIVITY_TIMEOUT_MS,
   * the indicator is hidden automatically.
   */
  startSubagentTimer() {
    if (this.subagentTimer)
      clearTimeout(this.subagentTimer);
    this.subagentTimer = setTimeout(() => {
      this.subagentTimer = null;
      this.activeSubagentCount = 0;
      this.postToWebview({
        type: "subagentState",
        active: false,
        label: "",
        state: ""
      });
      this.updateYieldState();
    }, _OpenClawChatView.SUBAGENT_ACTIVITY_TIMEOUT_MS);
  }
  /**
   * Requirement B: heuristic sessions_yield detection.
   * Yield state = busyCount > 0 AND there is recent subagent activity.
   */
  updateYieldState() {
    const shouldYield = this.busyCount > 0 && Date.now() - this.lastSubagentEventMs < _OpenClawChatView.SUBAGENT_ACTIVITY_TIMEOUT_MS && this.activeSubagentCount > 0;
    if (shouldYield === this.yieldState)
      return;
    this.yieldState = shouldYield;
    this.postToWebview({
      type: "yieldState",
      active: shouldYield,
      label: shouldYield ? vscode4.l10n.t("Waiting for subagent\u2026") : ""
    });
  }
  getHtml() {
    return getHtml();
  }
};
_OpenClawChatView.viewType = "openclaw.chatView";
_OpenClawChatView.SUBAGENT_ACTIVITY_TIMEOUT_MS = 6e4;
_OpenClawChatView.AUTO_CONTINUE_MAX = 3;
_OpenClawChatView.ERROR_PATTERNS = [
  "The agent run failed before producing a reply",
  // ✅ GATEWAY_ASSISTANT_ERROR_FALLBACK_TEXT
  "Agent run ended before producing a complete result",
  // ✅ formatAbandonedLivenessError 产出
  "Agent run blocked before producing a usable result",
  // ✅ formatBlockedLivenessError 产出
  "Agent failed before reply",
  // ✅ AGENT_FAILED_BEFORE_REPLY_TEXT
  "Agent run failed",
  // ✅ 通用后备文本
  "ACP turn failed before completion"
  // ✅ ACP 轮次失败
];
var OpenClawChatView = _OpenClawChatView;

// src/extension.ts
var gateway;
var nodeHost;
var chatView;
var outputChannel;
async function activate(context) {
  outputChannel = vscode5.window.createOutputChannel("OpenClaw");
  outputChannel.appendLine("Extension activating...");
  outputChannel.show(true);
  const config = vscode5.workspace.getConfiguration("openclaw");
  const url = config.get("gatewayUrl", "ws://127.0.0.1:18789");
  const token = config.get("token", "");
  gateway = new OpenClawGateway(url, token, outputChannel);
  chatView = new OpenClawChatView(context, gateway, outputChannel);
  await gateway.initDeviceIdentity({
    get(key) {
      return context.globalState.get(key);
    },
    update(key, value) {
      context.globalState.update(key, value);
    }
  });
  nodeHost = new NodeHost(url, token, outputChannel);
  await nodeHost.initDeviceIdentity({
    get(key) {
      return context.globalState.get(key);
    },
    update(key, value) {
      context.globalState.update(key, value);
    }
  });
  const nodeDeviceId = nodeHost.getDeviceId();
  let nodeApproved = false;
  async function doApproveAndReconnect() {
    if (nodeApproved)
      return;
    outputChannel.appendLine(`doApproveAndReconnect: nodeDeviceId=${nodeDeviceId == null ? void 0 : nodeDeviceId.substring(0, 16)}...`);
    try {
      const result = await approveNodePairing(gateway, nodeDeviceId || "", outputChannel);
      if (result.approved || result.alreadyPaired) {
        nodeApproved = true;
        if (result.displayName) {
          await updateNodeAgentName(gateway, nodeDeviceId || "", result.displayName, outputChannel);
        }
        if (result.approved) {
          outputChannel.appendLine("Pairing approved! Reconnecting node in 2s...");
          await sleep(2e3);
          nodeHost.disconnect();
          await sleep(500);
          nodeHost.connect();
        } else {
          outputChannel.appendLine("Already paired, no reconnect needed");
        }
      }
    } catch (err) {
      outputChannel.appendLine(`WARNING: approveNodePairing failed: ${err.message}`);
    }
  }
  gateway.on("connected", async (result) => {
    var _a, _b, _c;
    nodeApproved = false;
    const version = ((_a = result == null ? void 0 : result.server) == null ? void 0 : _a.version) ?? ((_c = (_b = result == null ? void 0 : result.payload) == null ? void 0 : _b.server) == null ? void 0 : _c.version) ?? "";
    chatView.updateConnectionStatus(true, version);
    if (nodeDeviceId) {
      try {
        await updateNodeAgentConfig(gateway, nodeDeviceId, outputChannel);
      } catch (err) {
        outputChannel.appendLine(`WARNING: updateNodeAgentConfig failed: ${err.message}`);
      }
      setTimeout(() => doApproveAndReconnect(), 3e3);
    }
  });
  gateway.on("node.pair.requested", (msg) => {
    outputChannel.appendLine(`[EVENT] node.pair.requested: ${JSON.stringify(msg).substring(0, 300)}`);
    setTimeout(() => doApproveAndReconnect(), 500);
  });
  nodeHost.on("connected", () => {
    outputChannel.appendLine("[NodeHost] connected, checking pairing in 3s...");
    setTimeout(() => doApproveAndReconnect(), 3e3);
  });
  context.subscriptions.push(
    vscode5.commands.registerCommand("openclaw.openChat", () => {
      chatView.show();
    }),
    vscode5.commands.registerCommand("openclaw.reconnect", () => {
      gateway.disconnect();
      nodeHost.disconnect();
      gateway.connect();
      nodeHost.connect();
    }),
    vscode5.commands.registerCommand("openclaw.approvePairing", () => {
      doApproveAndReconnect();
    }),
    vscode5.commands.registerCommand("openclaw.newChat", () => {
      chatView.newChat();
    }),
    vscode5.commands.registerCommand("openclaw.settings", () => {
      vscode5.commands.executeCommand("workbench.action.openSettings", "openclaw");
    }),
    vscode5.commands.registerCommand("openclaw.resetDevice", () => {
      gateway.resetDeviceIdentity({
        get(key) {
          return context.globalState.get(key);
        },
        update(key, value) {
          context.globalState.update(key, value);
        }
      });
      context.globalState.update("nodeDeviceIdentityV2", void 0);
      gateway.disconnect();
      nodeHost.disconnect();
      vscode5.window.showInformationMessage(vscode5.l10n.t("Device identities cleared. Reconnecting..."));
      gateway.connect();
      nodeHost.connect();
    }),
    vscode5.window.registerWebviewViewProvider("openclaw.chatView", chatView, {
      webviewOptions: { retainContextWhenHidden: true }
    }),
    vscode5.commands.registerCommand("openclaw.switchWorkdir", (uri) => {
      const folderPath = uri.fsPath;
      chatView.sendText(`Switch the working directory to ${folderPath}`);
      chatView.show();
    }),
    vscode5.commands.registerCommand("openclaw.analyzeProject", (uri) => {
      const folderPath = uri.fsPath;
      chatView.sendText(vscode5.l10n.t("Analyze the code structure, file organization and tech stack of the project at {0}", folderPath));
      chatView.show();
    }),
    vscode5.commands.registerCommand("openclaw.setInputText", (text) => {
      chatView.setInputText(text);
    }),
    vscode5.commands.registerCommand("openclaw.setLogLevel", async () => {
      const levels = ["None", "Error", "Warn", "Info", "Debug", "Trace"];
      const currentLevel = levels[getLogLevel()] || "Info";
      const selected = await vscode5.window.showQuickPick(levels, {
        placeHolder: vscode5.l10n.t("Select log level (current: {0})", currentLevel),
        title: vscode5.l10n.t("OpenClaw: Set Log Level")
      });
      if (selected) {
        const levelMap = {
          "None": 0,
          "Error": 1,
          "Warn": 2,
          "Info": 3,
          "Debug": 4,
          "Trace": 5
        };
        setLogLevel(levelMap[selected]);
        await config.update("logLevel", selected, vscode5.ConfigurationTarget.Global);
        vscode5.window.showInformationMessage(vscode5.l10n.t("Log level changed to: {0}", selected));
      }
    })
  );
  gateway.on("disconnected", () => {
    chatView.updateConnectionStatus(false);
  });
  gateway.on("notification", (notif) => {
    outputChannel.appendLine(`NOTIFY: ${notif.title} - ${notif.message}`);
    vscode5.window.showInformationMessage(`${notif.title}: ${notif.message}`);
  });
  gateway.on("event", (msg) => {
    const event = msg.event;
    const payload = msg.payload || {};
    if (event === "heartbeat" || event === "tick" || event === "health") {
      return;
    }
    outputChannel.appendLine(`Event: ${event} state=${payload.state || "-"} session=${payload.sessionKey || "-"}`);
    if (event === "chat") {
      chatView.handleChatEvent(payload);
    } else if (event === "stream" || event === "agent") {
      chatView.handleStreamEvent(payload);
    } else if (event === "progressCard.changed") {
      const changedSessionKey = (payload == null ? void 0 : payload.sessionKey) || "";
      outputChannel.appendLine(`progressCard.changed: sessionKey=${changedSessionKey} revision=${(payload == null ? void 0 : payload.revision) ?? "null"}`);
      setTimeout(async () => {
        try {
          const result = await gateway.request("progressCard.get", {
            sessionKey: changedSessionKey
          });
          const card = result == null ? void 0 : result.card;
          if (card) {
            outputChannel.appendLine(`progressCard.get: got card (revision=${card.revision}, markdown=${(card.markdown || "").substring(0, 80)}...)`);
            chatView.handleProgressCardUpdate(card);
          } else {
            outputChannel.appendLine("progressCard.get: card is null (cleared)");
            chatView.handleProgressCardUpdate(null);
          }
        } catch (err) {
          outputChannel.appendLine(`progressCard.get failed: ${err.message}`);
        }
      }, 100);
    }
  });
  const logLevelConfig = config.get("logLevel", "Info");
  const logLevelMap = {
    "None": 0,
    "Error": 1,
    "Warn": 2,
    "Info": 3,
    "Debug": 4,
    "Trace": 5
  };
  setLogLevel(logLevelMap[logLevelConfig] ?? 3);
  outputChannel.appendLine(`Log level set to: ${logLevelConfig} (${getLogLevel()})`);
  gateway.connect();
  nodeHost.connect();
}
function deactivate() {
  gateway == null ? void 0 : gateway.disconnect();
  nodeHost == null ? void 0 : nodeHost.disconnect();
}
async function updateNodeAgentConfig(gw, nodeDeviceId, channel) {
  var _a;
  const agentId = nodeDeviceId;
  channel.appendLine(`updateNodeAgentConfig: ${agentId}`);
  const configResult = await gw.request("config.get", {});
  const baseHash = configResult == null ? void 0 : configResult.hash;
  let config = configResult == null ? void 0 : configResult.config;
  if (!config && (configResult == null ? void 0 : configResult.raw)) {
    try {
      config = JSON.parse(configResult.raw);
    } catch {
    }
  }
  if (!config)
    config = configResult;
  const agentEntries = ((_a = config == null ? void 0 : config.agents) == null ? void 0 : _a.entries) || {};
  for (const key of Object.keys(agentEntries)) {
    if (key.startsWith("node-"))
      delete agentEntries[key];
  }
  agentEntries[agentId] = {
    name: "OpenClaw VSCode",
    tools: { exec: { host: "node", node: "OpenClaw VSCode", notifyOnExit: false } }
  };
  const patch = {
    raw: JSON.stringify({ agents: { entries: agentEntries } }),
    baseHash: baseHash || void 0,
    replacePaths: ["agents.entries"]
  };
  channel.appendLine(`config.patch agents.entries (count=${Object.keys(agentEntries).length})...`);
  const result = await gw.request("config.patch", patch, 9e4);
  channel.appendLine(`config.patch result: ok=${result == null ? void 0 : result.ok}`);
}
async function updateNodeAgentName(gw, nodeDeviceId, displayName, channel) {
  var _a;
  const agentId = nodeDeviceId;
  channel.appendLine(`updateNodeAgentName: ${agentId} -> ${displayName}`);
  const configResult = await gw.request("config.get", {});
  const baseHash = configResult == null ? void 0 : configResult.hash;
  let config = configResult == null ? void 0 : configResult.config;
  if (!config && (configResult == null ? void 0 : configResult.raw)) {
    try {
      config = JSON.parse(configResult.raw);
    } catch {
    }
  }
  if (!config)
    config = configResult;
  const agentEntries = ((_a = config == null ? void 0 : config.agents) == null ? void 0 : _a.entries) || {};
  const existing = agentEntries[agentId];
  if (!existing || existing.name === displayName) {
    channel.appendLine(`updateNodeAgentName: no change needed`);
    return;
  }
  existing.name = displayName;
  const patch = {
    raw: JSON.stringify({ agents: { entries: agentEntries } }),
    baseHash: baseHash || void 0,
    replacePaths: ["agents.entries"]
  };
  const result = await gw.request("config.patch", patch, 9e4);
  channel.appendLine(`updateNodeAgentName result: ok=${result == null ? void 0 : result.ok}`);
}
async function approveNodePairing(gw, nodeDeviceId, channel) {
  var _a, _b, _c, _d;
  channel.appendLine(`approveNodePairing: looking for pending pairs...`);
  let listResult;
  try {
    listResult = await gw.request("node.pair.list", {});
  } catch (err) {
    channel.appendLine(`node.pair.list failed: ${err.message}`);
    return { approved: false, alreadyPaired: false };
  }
  channel.appendLine(`node.pair.list: ${JSON.stringify(listResult).substring(0, 800)}`);
  let approved = false;
  let alreadyPaired = false;
  let displayName;
  const allEntries = [];
  if (Array.isArray(listResult)) {
    allEntries.push(...listResult);
  } else if (listResult) {
    const pending = listResult.pending || listResult.requests || [];
    const paired = listResult.paired || listResult.nodes || [];
    if (Array.isArray(pending))
      allEntries.push(...pending);
    if (Array.isArray(paired))
      allEntries.push(...paired);
    for (const key of Object.keys(listResult)) {
      if (Array.isArray(listResult[key])) {
        for (const item of listResult[key]) {
          if (item && typeof item === "object") {
            allEntries.push(item);
          }
        }
      }
    }
  }
  channel.appendLine(`Total entries found: ${allEntries.length}`);
  for (const entry of allEntries) {
    if (!entry || typeof entry !== "object")
      continue;
    const entryNodeId = entry.nodeId || entry.deviceId || ((_a = entry.device) == null ? void 0 : _a.id) || "";
    if (entryNodeId === nodeDeviceId) {
      if (entry.displayName) {
        displayName = entry.displayName;
        channel.appendLine(`Found displayName for paired node: ${displayName}`);
      }
    }
  }
  for (const entry of allEntries) {
    if (!entry || typeof entry !== "object")
      continue;
    const entryNodeId = entry.nodeId || entry.deviceId || ((_b = entry.device) == null ? void 0 : _b.id) || "";
    const requestId = entry.requestId || entry.id || "";
    const status = entry.status || "";
    const token = entry.token || "";
    channel.appendLine(`  entry: id=${requestId} nodeId=${String(entryNodeId).substring(0, 16)}... status=${status} hasToken=${!!token}`);
    if (status === "pending" || status === "awaiting_approval" || !status && requestId) {
      channel.appendLine(`Approving pairing: ${requestId} for node ${entryNodeId.substring(0, 16)}...`);
      try {
        const approveResult = await gw.request("node.pair.approve", {
          requestId
        }, 3e4);
        channel.appendLine(`node.pair.approve result: ${JSON.stringify(approveResult).substring(0, 500)}`);
        const newToken = (approveResult == null ? void 0 : approveResult.token) || ((_c = approveResult == null ? void 0 : approveResult.pairedNode) == null ? void 0 : _c.token) || "";
        if (newToken) {
          channel.appendLine(`Got pairing token: ${newToken.substring(0, 16)}...`);
          nodeHost.setToken(newToken);
        }
        if (approveResult == null ? void 0 : approveResult.displayName) {
          displayName = approveResult.displayName;
        }
        approved = true;
      } catch (err) {
        channel.appendLine(`node.pair.approve failed: ${err.message}`);
      }
    }
  }
  if (!approved) {
    for (const entry of allEntries) {
      if (!entry || typeof entry !== "object")
        continue;
      const entryNodeId = entry.nodeId || entry.deviceId || ((_d = entry.device) == null ? void 0 : _d.id) || "";
      if (entryNodeId === nodeDeviceId) {
        alreadyPaired = true;
        channel.appendLine(`Node ${nodeDeviceId.substring(0, 16)}... already paired`);
        break;
      }
    }
  }
  return { approved, alreadyPaired, displayName };
}
function sleep(ms) {
  return new Promise((resolve2) => setTimeout(resolve2, ms));
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  activate,
  deactivate
});
