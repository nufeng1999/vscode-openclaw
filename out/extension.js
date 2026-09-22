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

// node_modules/adm-zip/util/constants.js
var require_constants = __commonJS({
  "node_modules/adm-zip/util/constants.js"(exports2, module2) {
    module2.exports = {
      /* The local file header */
      LOCHDR: 30,
      // LOC header size
      LOCSIG: 67324752,
      // "PK\003\004"
      LOCVER: 4,
      // version needed to extract
      LOCFLG: 6,
      // general purpose bit flag
      LOCHOW: 8,
      // compression method
      LOCTIM: 10,
      // modification time (2 bytes time, 2 bytes date)
      LOCCRC: 14,
      // uncompressed file crc-32 value
      LOCSIZ: 18,
      // compressed size
      LOCLEN: 22,
      // uncompressed size
      LOCNAM: 26,
      // filename length
      LOCEXT: 28,
      // extra field length
      /* The Data descriptor */
      EXTSIG: 134695760,
      // "PK\007\008"
      EXTHDR: 16,
      // EXT header size
      EXTCRC: 4,
      // uncompressed file crc-32 value
      EXTSIZ: 8,
      // compressed size
      EXTLEN: 12,
      // uncompressed size
      /* The central directory file header */
      CENHDR: 46,
      // CEN header size
      CENSIG: 33639248,
      // "PK\001\002"
      CENVEM: 4,
      // version made by
      CENVER: 6,
      // version needed to extract
      CENFLG: 8,
      // encrypt, decrypt flags
      CENHOW: 10,
      // compression method
      CENTIM: 12,
      // modification time (2 bytes time, 2 bytes date)
      CENCRC: 16,
      // uncompressed file crc-32 value
      CENSIZ: 20,
      // compressed size
      CENLEN: 24,
      // uncompressed size
      CENNAM: 28,
      // filename length
      CENEXT: 30,
      // extra field length
      CENCOM: 32,
      // file comment length
      CENDSK: 34,
      // volume number start
      CENATT: 36,
      // internal file attributes
      CENATX: 38,
      // external file attributes (host system dependent)
      CENOFF: 42,
      // LOC header offset
      /* The entries in the end of central directory */
      ENDHDR: 22,
      // END header size
      ENDSIG: 101010256,
      // "PK\005\006"
      ENDSUB: 8,
      // number of entries on this disk
      ENDTOT: 10,
      // total number of entries
      ENDSIZ: 12,
      // central directory size in bytes
      ENDOFF: 16,
      // offset of first CEN header
      ENDCOM: 20,
      // zip file comment length
      END64HDR: 20,
      // zip64 END header size
      END64SIG: 117853008,
      // zip64 Locator signature, "PK\006\007"
      END64START: 4,
      // number of the disk with the start of the zip64
      END64OFF: 8,
      // relative offset of the zip64 end of central directory
      END64NUMDISKS: 16,
      // total number of disks
      ZIP64SIG: 101075792,
      // zip64 signature, "PK\006\006"
      ZIP64HDR: 56,
      // zip64 record minimum size
      ZIP64LEAD: 12,
      // leading bytes at the start of the record, not counted by the value stored in ZIP64SIZE
      ZIP64SIZE: 4,
      // zip64 size of the central directory record
      ZIP64VEM: 12,
      // zip64 version made by
      ZIP64VER: 14,
      // zip64 version needed to extract
      ZIP64DSK: 16,
      // zip64 number of this disk
      ZIP64DSKDIR: 20,
      // number of the disk with the start of the record directory
      ZIP64SUB: 24,
      // number of entries on this disk
      ZIP64TOT: 32,
      // total number of entries
      ZIP64SIZB: 40,
      // zip64 central directory size in bytes
      ZIP64OFF: 48,
      // offset of start of central directory with respect to the starting disk number
      ZIP64EXTRA: 56,
      // extensible data sector
      /* Compression methods */
      STORED: 0,
      // no compression
      SHRUNK: 1,
      // shrunk
      REDUCED1: 2,
      // reduced with compression factor 1
      REDUCED2: 3,
      // reduced with compression factor 2
      REDUCED3: 4,
      // reduced with compression factor 3
      REDUCED4: 5,
      // reduced with compression factor 4
      IMPLODED: 6,
      // imploded
      // 7 reserved for Tokenizing compression algorithm
      DEFLATED: 8,
      // deflated
      ENHANCED_DEFLATED: 9,
      // enhanced deflated
      PKWARE: 10,
      // PKWare DCL imploded
      // 11 reserved by PKWARE
      BZIP2: 12,
      //  compressed using BZIP2
      // 13 reserved by PKWARE
      LZMA: 14,
      // LZMA
      // 15-17 reserved by PKWARE
      IBM_TERSE: 18,
      // compressed using IBM TERSE
      IBM_LZ77: 19,
      // IBM LZ77 z
      AES_ENCRYPT: 99,
      // WinZIP AES encryption method
      /* General purpose bit flag */
      // values can obtained with expression 2**bitnr
      FLG_ENC: 1,
      // Bit 0: encrypted file
      FLG_COMP1: 2,
      // Bit 1, compression option
      FLG_COMP2: 4,
      // Bit 2, compression option
      FLG_DESC: 8,
      // Bit 3, data descriptor
      FLG_ENH: 16,
      // Bit 4, enhanced deflating
      FLG_PATCH: 32,
      // Bit 5, indicates that the file is compressed patched data.
      FLG_STR: 64,
      // Bit 6, strong encryption (patented)
      // Bits 7-10: Currently unused.
      FLG_EFS: 2048,
      // Bit 11: Language encoding flag (EFS)
      // Bit 12: Reserved by PKWARE for enhanced compression.
      // Bit 13: encrypted the Central Directory (patented).
      // Bits 14-15: Reserved by PKWARE.
      FLG_MSK: 4096,
      // mask header values
      /* Load type */
      FILE: 2,
      BUFFER: 1,
      NONE: 0,
      /* 4.5 Extensible data fields */
      EF_ID: 0,
      EF_SIZE: 2,
      /* Header IDs */
      ID_ZIP64: 1,
      ID_AVINFO: 7,
      ID_PFS: 8,
      ID_OS2: 9,
      ID_NTFS: 10,
      ID_OPENVMS: 12,
      ID_UNIX: 13,
      ID_FORK: 14,
      ID_PATCH: 15,
      ID_X509_PKCS7: 20,
      ID_X509_CERTID_F: 21,
      ID_X509_CERTID_C: 22,
      ID_STRONGENC: 23,
      ID_RECORD_MGT: 24,
      ID_X509_PKCS7_RL: 25,
      ID_IBM1: 101,
      ID_IBM2: 102,
      ID_POSZIP: 18064,
      EF_ZIP64_OR_32: 4294967295,
      EF_ZIP64_OR_16: 65535,
      EF_ZIP64_SUNCOMP: 0,
      EF_ZIP64_SCOMP: 8,
      EF_ZIP64_RHO: 16,
      EF_ZIP64_DSN: 24
    };
  }
});

// node_modules/adm-zip/util/errors.js
var require_errors = __commonJS({
  "node_modules/adm-zip/util/errors.js"(exports2) {
    var errors = {
      /* Header error messages */
      INVALID_LOC: "Invalid LOC header (bad signature)",
      INVALID_CEN: "Invalid CEN header (bad signature)",
      INVALID_END: "Invalid END header (bad signature)",
      /* Descriptor */
      DESCRIPTOR_NOT_EXIST: "No descriptor present",
      DESCRIPTOR_UNKNOWN: "Unknown descriptor format",
      DESCRIPTOR_FAULTY: "Descriptor data is malformed",
      /* ZipEntry error messages*/
      NO_DATA: "Nothing to decompress",
      BAD_CRC: "CRC32 checksum failed {0}",
      FILE_IN_THE_WAY: "There is a file in the way: {0}",
      UNKNOWN_METHOD: "Invalid/unsupported compression method",
      /* Inflater error messages */
      AVAIL_DATA: "inflate::Available inflate data did not terminate",
      INVALID_DISTANCE: "inflate::Invalid literal/length or distance code in fixed or dynamic block",
      TO_MANY_CODES: "inflate::Dynamic block code description: too many length or distance codes",
      INVALID_REPEAT_LEN: "inflate::Dynamic block code description: repeat more than specified lengths",
      INVALID_REPEAT_FIRST: "inflate::Dynamic block code description: repeat lengths with no first length",
      INCOMPLETE_CODES: "inflate::Dynamic block code description: code lengths codes incomplete",
      INVALID_DYN_DISTANCE: "inflate::Dynamic block code description: invalid distance code lengths",
      INVALID_CODES_LEN: "inflate::Dynamic block code description: invalid literal/length code lengths",
      INVALID_STORE_BLOCK: "inflate::Stored block length did not match one's complement",
      INVALID_BLOCK_TYPE: "inflate::Invalid block type (type == 3)",
      /* ADM-ZIP error messages */
      CANT_EXTRACT_FILE: "Could not extract the file",
      CANT_OVERRIDE: "Target file already exists",
      DISK_ENTRY_TOO_LARGE: "Number of disk entries is too large",
      NO_ZIP: "No zip file was loaded",
      NO_ENTRY: "Entry doesn't exist",
      DIRECTORY_CONTENT_ERROR: "A directory cannot have content",
      FILE_NOT_FOUND: 'File not found: "{0}"',
      NOT_IMPLEMENTED: "Not implemented",
      INVALID_FILENAME: "Invalid filename",
      INVALID_FORMAT: "Invalid or unsupported zip format. No END header found",
      INVALID_PASS_PARAM: "Incompatible password parameter",
      WRONG_PASSWORD: "Wrong Password",
      /* ADM-ZIP */
      COMMENT_TOO_LONG: "Comment is too long",
      // Comment can be max 65535 bytes long (NOTE: some non-US characters may take more space)
      EXTRA_FIELD_PARSE_ERROR: "Extra field parsing error"
    };
    function E(message) {
      return function(...args) {
        if (args.length) {
          message = message.replace(/\{(\d)\}/g, (_, n) => args[n] || "");
        }
        return new Error("ADM-ZIP: " + message);
      };
    }
    for (const msg of Object.keys(errors)) {
      exports2[msg] = E(errors[msg]);
    }
  }
});

// node_modules/adm-zip/util/utils.js
var require_utils = __commonJS({
  "node_modules/adm-zip/util/utils.js"(exports2, module2) {
    var fsystem = require("fs");
    var pth = require("path");
    var Constants = require_constants();
    var Errors = require_errors();
    var isWin = typeof process === "object" && "win32" === process.platform;
    var is_Obj = (obj) => typeof obj === "object" && obj !== null;
    var crcTable = new Uint32Array(256).map((t, c) => {
      for (let k = 0; k < 8; k++) {
        if ((c & 1) !== 0) {
          c = 3988292384 ^ c >>> 1;
        } else {
          c >>>= 1;
        }
      }
      return c >>> 0;
    });
    function Utils(opts) {
      this.sep = pth.sep;
      this.fs = fsystem;
      if (is_Obj(opts)) {
        if (is_Obj(opts.fs) && typeof opts.fs.statSync === "function") {
          this.fs = opts.fs;
        }
      }
    }
    module2.exports = Utils;
    Utils.prototype.makeDir = function(folder) {
      const self = this;
      function mkdirSync3(fpath) {
        let resolvedPath = fpath.split(self.sep)[0];
        fpath.split(self.sep).forEach(function(name) {
          if (!name || name.substr(-1, 1) === ":")
            return;
          resolvedPath += self.sep + name;
          var stat;
          try {
            stat = self.fs.statSync(resolvedPath);
          } catch (e) {
            if (e.message && e.message.startsWith("ENOENT")) {
              self.fs.mkdirSync(resolvedPath);
            } else {
              throw e;
            }
          }
          if (stat && stat.isFile())
            throw Errors.FILE_IN_THE_WAY(`"${resolvedPath}"`);
        });
      }
      mkdirSync3(folder);
    };
    Utils.prototype.writeFileTo = function(path6, content, overwrite, attr) {
      const self = this;
      if (self.fs.existsSync(path6)) {
        if (!overwrite)
          return false;
        var stat = self.fs.statSync(path6);
        if (stat.isDirectory()) {
          return false;
        }
      }
      var folder = pth.dirname(path6);
      if (!self.fs.existsSync(folder)) {
        self.makeDir(folder);
      }
      var fd;
      try {
        fd = self.fs.openSync(path6, "w", 438);
      } catch (e) {
        self.fs.chmodSync(path6, 438);
        fd = self.fs.openSync(path6, "w", 438);
      }
      if (fd) {
        try {
          self.fs.writeSync(fd, content, 0, content.length, 0);
        } finally {
          self.fs.closeSync(fd);
        }
      }
      self.fs.chmodSync(path6, attr || 438);
      return true;
    };
    Utils.prototype.writeFileToAsync = function(path6, content, overwrite, attr, callback) {
      if (typeof attr === "function") {
        callback = attr;
        attr = void 0;
      }
      const self = this;
      self.fs.exists(path6, function(exist) {
        if (exist && !overwrite)
          return callback(false);
        self.fs.stat(path6, function(err, stat) {
          if (exist && stat.isDirectory()) {
            return callback(false);
          }
          var folder = pth.dirname(path6);
          self.fs.exists(folder, function(exists) {
            if (!exists)
              self.makeDir(folder);
            self.fs.open(path6, "w", 438, function(err2, fd) {
              if (err2) {
                self.fs.chmod(path6, 438, function() {
                  self.fs.open(path6, "w", 438, function(err3, fd2) {
                    self.fs.write(fd2, content, 0, content.length, 0, function() {
                      self.fs.close(fd2, function() {
                        self.fs.chmod(path6, attr || 438, function() {
                          callback(true);
                        });
                      });
                    });
                  });
                });
              } else if (fd) {
                self.fs.write(fd, content, 0, content.length, 0, function() {
                  self.fs.close(fd, function() {
                    self.fs.chmod(path6, attr || 438, function() {
                      callback(true);
                    });
                  });
                });
              } else {
                self.fs.chmod(path6, attr || 438, function() {
                  callback(true);
                });
              }
            });
          });
        });
      });
    };
    Utils.prototype.findFiles = function(path6) {
      const self = this;
      function findSync(dir, pattern, recursive) {
        if (typeof pattern === "boolean") {
          recursive = pattern;
          pattern = void 0;
        }
        let files = [];
        self.fs.readdirSync(dir).forEach(function(file) {
          const path7 = pth.join(dir, file);
          const stat = self.fs.statSync(path7);
          if (!pattern || pattern.test(path7)) {
            files.push(pth.normalize(path7) + (stat.isDirectory() ? self.sep : ""));
          }
          if (stat.isDirectory() && recursive)
            files = files.concat(findSync(path7, pattern, recursive));
        });
        return files;
      }
      return findSync(path6, void 0, true);
    };
    Utils.prototype.findFilesAsync = function(dir, cb) {
      const self = this;
      let results = [];
      self.fs.readdir(dir, function(err, list) {
        if (err)
          return cb(err);
        let list_length = list.length;
        if (!list_length)
          return cb(null, results);
        list.forEach(function(file) {
          file = pth.join(dir, file);
          self.fs.stat(file, function(err2, stat) {
            if (err2)
              return cb(err2);
            if (stat) {
              results.push(pth.normalize(file) + (stat.isDirectory() ? self.sep : ""));
              if (stat.isDirectory()) {
                self.findFilesAsync(file, function(err3, res) {
                  if (err3)
                    return cb(err3);
                  results = results.concat(res);
                  if (!--list_length)
                    cb(null, results);
                });
              } else {
                if (!--list_length)
                  cb(null, results);
              }
            }
          });
        });
      });
    };
    Utils.prototype.getAttributes = function() {
    };
    Utils.prototype.setAttributes = function() {
    };
    Utils.crc32update = function(crc, byte) {
      return crcTable[(crc ^ byte) & 255] ^ crc >>> 8;
    };
    Utils.crc32 = function(buf) {
      if (typeof buf === "string") {
        buf = Buffer.from(buf, "utf8");
      }
      let len = buf.length;
      let crc = ~0;
      for (let off = 0; off < len; )
        crc = Utils.crc32update(crc, buf[off++]);
      return ~crc >>> 0;
    };
    Utils.methodToString = function(method) {
      switch (method) {
        case Constants.STORED:
          return "STORED (" + method + ")";
        case Constants.DEFLATED:
          return "DEFLATED (" + method + ")";
        default:
          return "UNSUPPORTED (" + method + ")";
      }
    };
    Utils.canonical = function(path6) {
      if (!path6)
        return "";
      const safeSuffix = pth.posix.normalize("/" + path6.split("\\").join("/"));
      return pth.join(".", safeSuffix);
    };
    Utils.zipnamefix = function(path6) {
      if (!path6)
        return "";
      const safeSuffix = pth.posix.normalize("/" + path6.split("\\").join("/"));
      return pth.posix.join(".", safeSuffix);
    };
    Utils.findLast = function(arr, callback) {
      if (!Array.isArray(arr))
        throw new TypeError("arr is not array");
      const len = arr.length >>> 0;
      for (let i = len - 1; i >= 0; i--) {
        if (callback(arr[i], i, arr)) {
          return arr[i];
        }
      }
      return void 0;
    };
    Utils.sanitize = function(prefix, name) {
      prefix = pth.resolve(pth.normalize(prefix));
      var parts = name.split("/");
      for (var i = 0, l = parts.length; i < l; i++) {
        var path6 = pth.normalize(pth.join(prefix, parts.slice(i, l).join(pth.sep)));
        if (path6 === prefix || path6.startsWith(prefix + pth.sep)) {
          return path6;
        }
      }
      return pth.normalize(pth.join(prefix, pth.basename(name)));
    };
    Utils.toBuffer = function toBuffer(input, encoder) {
      if (Buffer.isBuffer(input)) {
        return input;
      } else if (input instanceof Uint8Array) {
        return Buffer.from(input);
      } else {
        return typeof input === "string" ? encoder(input) : Buffer.alloc(0);
      }
    };
    Utils.readBigUInt64LE = function(buffer, index) {
      const lo = buffer.readUInt32LE(index);
      const hi = buffer.readUInt32LE(index + 4);
      return hi * 4294967296 + lo;
    };
    Utils.writeBigUInt64LE = function(buffer, value, index) {
      const lo = value >>> 0;
      const hi = Math.floor(value / 4294967296) >>> 0;
      buffer.writeUInt32LE(lo, index);
      buffer.writeUInt32LE(hi, index + 4);
    };
    Utils.fromDOS2Date = function(val) {
      return new Date((val >> 25 & 127) + 1980, Math.max((val >> 21 & 15) - 1, 0), Math.max(val >> 16 & 31, 1), val >> 11 & 31, val >> 5 & 63, (val & 31) << 1);
    };
    Utils.fromDate2DOS = function(val) {
      let date = 0;
      let time = 0;
      if (val.getFullYear() > 1979) {
        date = (val.getFullYear() - 1980 & 127) << 9 | val.getMonth() + 1 << 5 | val.getDate();
        time = val.getHours() << 11 | val.getMinutes() << 5 | val.getSeconds() >> 1;
      }
      return date << 16 | time;
    };
    Utils.isWin = isWin;
    Utils.crcTable = crcTable;
  }
});

// node_modules/adm-zip/util/fattr.js
var require_fattr = __commonJS({
  "node_modules/adm-zip/util/fattr.js"(exports2, module2) {
    var pth = require("path");
    module2.exports = function(path6, { fs: fs5 }) {
      var _path = path6 || "", _obj = newAttr(), _stat = null;
      function newAttr() {
        return {
          directory: false,
          readonly: false,
          hidden: false,
          executable: false,
          mtime: 0,
          atime: 0
        };
      }
      if (_path && fs5.existsSync(_path)) {
        _stat = fs5.statSync(_path);
        _obj.directory = _stat.isDirectory();
        _obj.mtime = _stat.mtime;
        _obj.atime = _stat.atime;
        _obj.executable = (73 & _stat.mode) !== 0;
        _obj.readonly = (128 & _stat.mode) === 0;
        _obj.hidden = pth.basename(_path)[0] === ".";
      } else {
        console.warn("Invalid path: " + _path);
      }
      return {
        get directory() {
          return _obj.directory;
        },
        get readOnly() {
          return _obj.readonly;
        },
        get hidden() {
          return _obj.hidden;
        },
        get mtime() {
          return _obj.mtime;
        },
        get atime() {
          return _obj.atime;
        },
        get executable() {
          return _obj.executable;
        },
        decodeAttributes: function() {
        },
        encodeAttributes: function() {
        },
        toJSON: function() {
          return {
            path: _path,
            isDirectory: _obj.directory,
            isReadOnly: _obj.readonly,
            isHidden: _obj.hidden,
            isExecutable: _obj.executable,
            mTime: _obj.mtime,
            aTime: _obj.atime
          };
        },
        toString: function() {
          return JSON.stringify(this.toJSON(), null, "	");
        }
      };
    };
  }
});

// node_modules/adm-zip/util/decoder.js
var require_decoder = __commonJS({
  "node_modules/adm-zip/util/decoder.js"(exports2, module2) {
    module2.exports = {
      efs: true,
      encode: (data) => Buffer.from(data, "utf8"),
      decode: (data) => data.toString("utf8")
    };
  }
});

// node_modules/adm-zip/util/index.js
var require_util = __commonJS({
  "node_modules/adm-zip/util/index.js"(exports2, module2) {
    module2.exports = require_utils();
    module2.exports.Constants = require_constants();
    module2.exports.Errors = require_errors();
    module2.exports.FileAttr = require_fattr();
    module2.exports.decoder = require_decoder();
  }
});

// node_modules/adm-zip/headers/entryHeader.js
var require_entryHeader = __commonJS({
  "node_modules/adm-zip/headers/entryHeader.js"(exports2, module2) {
    var Utils = require_util();
    var Constants = Utils.Constants;
    module2.exports = function() {
      var _verMade = 20, _version = 10, _flags = 0, _method = 0, _time = 0, _crc = 0, _compressedSize = 0, _size = 0, _fnameLen = 0, _extraLen = 0, _comLen = 0, _diskStart = 0, _inattr = 0, _attr = 0, _offset = 0;
      _verMade |= Utils.isWin ? 2560 : 768;
      _flags |= Constants.FLG_EFS;
      const _localHeader = {
        extraLen: 0
      };
      const uint32 = (val) => Math.max(0, val) >>> 0;
      const uint16 = (val) => Math.max(0, val) & 65535;
      const uint8 = (val) => Math.max(0, val) & 255;
      _time = Utils.fromDate2DOS(/* @__PURE__ */ new Date());
      return {
        get made() {
          return _verMade;
        },
        set made(val) {
          _verMade = val;
        },
        get version() {
          return _version;
        },
        set version(val) {
          _version = val;
        },
        get flags() {
          return _flags;
        },
        set flags(val) {
          _flags = val;
        },
        get flags_efs() {
          return (_flags & Constants.FLG_EFS) > 0;
        },
        set flags_efs(val) {
          if (val) {
            _flags |= Constants.FLG_EFS;
          } else {
            _flags &= ~Constants.FLG_EFS;
          }
        },
        get flags_desc() {
          return (_flags & Constants.FLG_DESC) > 0;
        },
        set flags_desc(val) {
          if (val) {
            _flags |= Constants.FLG_DESC;
          } else {
            _flags &= ~Constants.FLG_DESC;
          }
        },
        get method() {
          return _method;
        },
        set method(val) {
          switch (val) {
            case Constants.STORED:
              this.version = 10;
              break;
            case Constants.DEFLATED:
            default:
              this.version = 20;
          }
          _method = val;
        },
        get time() {
          return Utils.fromDOS2Date(this.timeval);
        },
        set time(val) {
          val = new Date(val);
          this.timeval = Utils.fromDate2DOS(val);
        },
        get timeval() {
          return _time;
        },
        set timeval(val) {
          _time = uint32(val);
        },
        get timeHighByte() {
          return uint8(_time >>> 8);
        },
        get crc() {
          return _crc;
        },
        set crc(val) {
          _crc = uint32(val);
        },
        get compressedSize() {
          return _compressedSize;
        },
        set compressedSize(val) {
          _compressedSize = uint32(val);
        },
        get size() {
          return _size;
        },
        set size(val) {
          _size = uint32(val);
        },
        get fileNameLength() {
          return _fnameLen;
        },
        set fileNameLength(val) {
          _fnameLen = val;
        },
        get extraLength() {
          return _extraLen;
        },
        set extraLength(val) {
          _extraLen = val;
        },
        get extraLocalLength() {
          return _localHeader.extraLen;
        },
        set extraLocalLength(val) {
          _localHeader.extraLen = val;
        },
        get commentLength() {
          return _comLen;
        },
        set commentLength(val) {
          _comLen = val;
        },
        get diskNumStart() {
          return _diskStart;
        },
        set diskNumStart(val) {
          _diskStart = uint32(val);
        },
        get inAttr() {
          return _inattr;
        },
        set inAttr(val) {
          _inattr = uint32(val);
        },
        get attr() {
          return _attr;
        },
        set attr(val) {
          _attr = uint32(val);
        },
        // get Unix file permissions
        get fileAttr() {
          return (_attr || 0) >> 16 & 4095;
        },
        get offset() {
          return _offset;
        },
        set offset(val) {
          _offset = uint32(val);
        },
        get encrypted() {
          return (_flags & Constants.FLG_ENC) === Constants.FLG_ENC;
        },
        get centralHeaderSize() {
          return Constants.CENHDR + _fnameLen + _extraLen + _comLen;
        },
        get realDataOffset() {
          return _offset + Constants.LOCHDR + _localHeader.fnameLen + _localHeader.extraLen;
        },
        get localHeader() {
          return _localHeader;
        },
        loadLocalHeaderFromBinary: function(input) {
          var data = input.slice(_offset, _offset + Constants.LOCHDR);
          if (data.readUInt32LE(0) !== Constants.LOCSIG) {
            throw Utils.Errors.INVALID_LOC();
          }
          _localHeader.version = data.readUInt16LE(Constants.LOCVER);
          _localHeader.flags = data.readUInt16LE(Constants.LOCFLG);
          _localHeader.flags_desc = (_localHeader.flags & Constants.FLG_DESC) > 0;
          _localHeader.method = data.readUInt16LE(Constants.LOCHOW);
          _localHeader.time = data.readUInt32LE(Constants.LOCTIM);
          _localHeader.crc = data.readUInt32LE(Constants.LOCCRC);
          _localHeader.compressedSize = data.readUInt32LE(Constants.LOCSIZ);
          _localHeader.size = data.readUInt32LE(Constants.LOCLEN);
          _localHeader.fnameLen = data.readUInt16LE(Constants.LOCNAM);
          _localHeader.extraLen = data.readUInt16LE(Constants.LOCEXT);
          const extraStart = _offset + Constants.LOCHDR + _localHeader.fnameLen;
          const extraEnd = extraStart + _localHeader.extraLen;
          return input.slice(extraStart, extraEnd);
        },
        loadFromBinary: function(data) {
          if (data.length !== Constants.CENHDR || data.readUInt32LE(0) !== Constants.CENSIG) {
            throw Utils.Errors.INVALID_CEN();
          }
          _verMade = data.readUInt16LE(Constants.CENVEM);
          _version = data.readUInt16LE(Constants.CENVER);
          _flags = data.readUInt16LE(Constants.CENFLG);
          _method = data.readUInt16LE(Constants.CENHOW);
          _time = data.readUInt32LE(Constants.CENTIM);
          _crc = data.readUInt32LE(Constants.CENCRC);
          _compressedSize = data.readUInt32LE(Constants.CENSIZ);
          _size = data.readUInt32LE(Constants.CENLEN);
          _fnameLen = data.readUInt16LE(Constants.CENNAM);
          _extraLen = data.readUInt16LE(Constants.CENEXT);
          _comLen = data.readUInt16LE(Constants.CENCOM);
          _diskStart = data.readUInt16LE(Constants.CENDSK);
          _inattr = data.readUInt16LE(Constants.CENATT);
          _attr = data.readUInt32LE(Constants.CENATX);
          _offset = data.readUInt32LE(Constants.CENOFF);
        },
        localHeaderToBinary: function() {
          var data = Buffer.alloc(Constants.LOCHDR);
          data.writeUInt32LE(Constants.LOCSIG, 0);
          data.writeUInt16LE(_version, Constants.LOCVER);
          data.writeUInt16LE(_flags & ~Constants.FLG_DESC, Constants.LOCFLG);
          data.writeUInt16LE(_method, Constants.LOCHOW);
          data.writeUInt32LE(_time, Constants.LOCTIM);
          data.writeUInt32LE(_crc, Constants.LOCCRC);
          data.writeUInt32LE(_compressedSize, Constants.LOCSIZ);
          data.writeUInt32LE(_size, Constants.LOCLEN);
          data.writeUInt16LE(_fnameLen, Constants.LOCNAM);
          data.writeUInt16LE(_localHeader.extraLen, Constants.LOCEXT);
          return data;
        },
        centralHeaderToBinary: function() {
          var data = Buffer.alloc(Constants.CENHDR + _fnameLen + _extraLen + _comLen);
          data.writeUInt32LE(Constants.CENSIG, 0);
          data.writeUInt16LE(_verMade, Constants.CENVEM);
          data.writeUInt16LE(_version, Constants.CENVER);
          data.writeUInt16LE(_flags & ~Constants.FLG_DESC, Constants.CENFLG);
          data.writeUInt16LE(_method, Constants.CENHOW);
          data.writeUInt32LE(_time, Constants.CENTIM);
          data.writeUInt32LE(_crc, Constants.CENCRC);
          data.writeUInt32LE(_compressedSize, Constants.CENSIZ);
          data.writeUInt32LE(_size, Constants.CENLEN);
          data.writeUInt16LE(_fnameLen, Constants.CENNAM);
          data.writeUInt16LE(_extraLen, Constants.CENEXT);
          data.writeUInt16LE(_comLen, Constants.CENCOM);
          data.writeUInt16LE(_diskStart, Constants.CENDSK);
          data.writeUInt16LE(_inattr, Constants.CENATT);
          data.writeUInt32LE(_attr, Constants.CENATX);
          data.writeUInt32LE(_offset, Constants.CENOFF);
          return data;
        },
        toJSON: function() {
          const bytes = function(nr) {
            return nr + " bytes";
          };
          return {
            made: _verMade,
            version: _version,
            flags: _flags,
            method: Utils.methodToString(_method),
            time: this.time,
            crc: "0x" + _crc.toString(16).toUpperCase(),
            compressedSize: bytes(_compressedSize),
            size: bytes(_size),
            fileNameLength: bytes(_fnameLen),
            extraLength: bytes(_extraLen),
            commentLength: bytes(_comLen),
            diskNumStart: _diskStart,
            inAttr: _inattr,
            attr: _attr,
            offset: _offset,
            centralHeaderSize: bytes(Constants.CENHDR + _fnameLen + _extraLen + _comLen)
          };
        },
        toString: function() {
          return JSON.stringify(this.toJSON(), null, "	");
        }
      };
    };
  }
});

// node_modules/adm-zip/headers/mainHeader.js
var require_mainHeader = __commonJS({
  "node_modules/adm-zip/headers/mainHeader.js"(exports2, module2) {
    var Utils = require_util();
    var Constants = Utils.Constants;
    module2.exports = function() {
      var _volumeEntries = 0, _totalEntries = 0, _size = 0, _offset = 0, _commentLength = 0;
      const needsZip64 = () => _volumeEntries > Constants.EF_ZIP64_OR_16 || _totalEntries > Constants.EF_ZIP64_OR_16 || _size > Constants.EF_ZIP64_OR_32 || _offset > Constants.EF_ZIP64_OR_32;
      return {
        get diskEntries() {
          return _volumeEntries;
        },
        set diskEntries(val) {
          _volumeEntries = _totalEntries = val;
        },
        get totalEntries() {
          return _totalEntries;
        },
        set totalEntries(val) {
          _totalEntries = _volumeEntries = val;
        },
        get size() {
          return _size;
        },
        set size(val) {
          _size = val;
        },
        get offset() {
          return _offset;
        },
        set offset(val) {
          _offset = val;
        },
        get commentLength() {
          return _commentLength;
        },
        set commentLength(val) {
          _commentLength = val;
        },
        get mainHeaderSize() {
          return (needsZip64() ? Constants.ZIP64HDR + Constants.END64HDR : 0) + Constants.ENDHDR + _commentLength;
        },
        loadFromBinary: function(data) {
          if ((data.length !== Constants.ENDHDR || data.readUInt32LE(0) !== Constants.ENDSIG) && (data.length < Constants.ZIP64HDR || data.readUInt32LE(0) !== Constants.ZIP64SIG)) {
            throw Utils.Errors.INVALID_END();
          }
          if (data.readUInt32LE(0) === Constants.ENDSIG) {
            _volumeEntries = data.readUInt16LE(Constants.ENDSUB);
            _totalEntries = data.readUInt16LE(Constants.ENDTOT);
            _size = data.readUInt32LE(Constants.ENDSIZ);
            _offset = data.readUInt32LE(Constants.ENDOFF);
            _commentLength = data.readUInt16LE(Constants.ENDCOM);
          } else {
            _volumeEntries = Utils.readBigUInt64LE(data, Constants.ZIP64SUB);
            _totalEntries = Utils.readBigUInt64LE(data, Constants.ZIP64TOT);
            _size = Utils.readBigUInt64LE(data, Constants.ZIP64SIZB);
            _offset = Utils.readBigUInt64LE(data, Constants.ZIP64OFF);
            _commentLength = 0;
          }
        },
        toBinary: function() {
          if (!needsZip64()) {
            var b = Buffer.alloc(Constants.ENDHDR + _commentLength);
            b.writeUInt32LE(Constants.ENDSIG, 0);
            b.writeUInt32LE(0, 4);
            b.writeUInt16LE(_volumeEntries, Constants.ENDSUB);
            b.writeUInt16LE(_totalEntries, Constants.ENDTOT);
            b.writeUInt32LE(_size, Constants.ENDSIZ);
            b.writeUInt32LE(_offset, Constants.ENDOFF);
            b.writeUInt16LE(_commentLength, Constants.ENDCOM);
            b.fill(" ", Constants.ENDHDR);
            return b;
          }
          var b = Buffer.alloc(this.mainHeaderSize);
          let offset = 0;
          b.writeUInt32LE(Constants.ZIP64SIG, offset);
          Utils.writeBigUInt64LE(b, Constants.ZIP64HDR - Constants.ZIP64LEAD, offset + Constants.ZIP64SIZE);
          b.writeUInt16LE(45, offset + Constants.ZIP64VEM);
          b.writeUInt16LE(45, offset + Constants.ZIP64VER);
          b.writeUInt32LE(0, offset + Constants.ZIP64DSK);
          b.writeUInt32LE(0, offset + Constants.ZIP64DSKDIR);
          Utils.writeBigUInt64LE(b, _volumeEntries, offset + Constants.ZIP64SUB);
          Utils.writeBigUInt64LE(b, _totalEntries, offset + Constants.ZIP64TOT);
          Utils.writeBigUInt64LE(b, _size, offset + Constants.ZIP64SIZB);
          Utils.writeBigUInt64LE(b, _offset, offset + Constants.ZIP64OFF);
          const zip64EndOffset = _offset + _size;
          offset += Constants.ZIP64HDR;
          b.writeUInt32LE(Constants.END64SIG, offset);
          b.writeUInt32LE(0, offset + Constants.END64START);
          Utils.writeBigUInt64LE(b, zip64EndOffset, offset + Constants.END64OFF);
          b.writeUInt32LE(1, offset + Constants.END64NUMDISKS);
          offset += Constants.END64HDR;
          b.writeUInt32LE(Constants.ENDSIG, offset);
          b.writeUInt32LE(0, offset + 4);
          b.writeUInt16LE(Math.min(_volumeEntries, Constants.EF_ZIP64_OR_16), offset + Constants.ENDSUB);
          b.writeUInt16LE(Math.min(_totalEntries, Constants.EF_ZIP64_OR_16), offset + Constants.ENDTOT);
          b.writeUInt32LE(Math.min(_size, Constants.EF_ZIP64_OR_32), offset + Constants.ENDSIZ);
          b.writeUInt32LE(Math.min(_offset, Constants.EF_ZIP64_OR_32), offset + Constants.ENDOFF);
          b.writeUInt16LE(_commentLength, offset + Constants.ENDCOM);
          b.fill(" ", offset + Constants.ENDHDR);
          return b;
        },
        toJSON: function() {
          const offset = function(nr, len) {
            let offs = nr.toString(16).toUpperCase();
            while (offs.length < len)
              offs = "0" + offs;
            return "0x" + offs;
          };
          return {
            diskEntries: _volumeEntries,
            totalEntries: _totalEntries,
            size: _size + " bytes",
            offset: offset(_offset, 4),
            commentLength: _commentLength
          };
        },
        toString: function() {
          return JSON.stringify(this.toJSON(), null, "	");
        }
      };
    };
  }
});

// node_modules/adm-zip/headers/index.js
var require_headers = __commonJS({
  "node_modules/adm-zip/headers/index.js"(exports2) {
    exports2.EntryHeader = require_entryHeader();
    exports2.MainHeader = require_mainHeader();
  }
});

// node_modules/adm-zip/methods/deflater.js
var require_deflater = __commonJS({
  "node_modules/adm-zip/methods/deflater.js"(exports2, module2) {
    module2.exports = function(inbuf) {
      var zlib = require("zlib");
      var opts = { chunkSize: (parseInt(inbuf.length / 1024) + 1) * 1024 };
      return {
        deflate: function() {
          return zlib.deflateRawSync(inbuf, opts);
        },
        deflateAsync: function(callback) {
          var tmp = zlib.createDeflateRaw(opts), parts = [], total = 0;
          tmp.on("data", function(data) {
            parts.push(data);
            total += data.length;
          });
          tmp.on("end", function() {
            var buf = Buffer.alloc(total), written = 0;
            buf.fill(0);
            for (var i = 0; i < parts.length; i++) {
              var part = parts[i];
              part.copy(buf, written);
              written += part.length;
            }
            callback && callback(buf);
          });
          tmp.end(inbuf);
        }
      };
    };
  }
});

// node_modules/adm-zip/methods/inflater.js
var require_inflater = __commonJS({
  "node_modules/adm-zip/methods/inflater.js"(exports2, module2) {
    var version = +(process?.versions?.node ?? "").split(".")[0] || 0;
    module2.exports = function(inbuf, expectedLength) {
      var zlib = require("zlib");
      const option = version >= 15 && expectedLength > 0 ? { maxOutputLength: expectedLength } : {};
      return {
        inflate: function() {
          return zlib.inflateRawSync(inbuf, option);
        },
        inflateAsync: function(callback) {
          var tmp = zlib.createInflateRaw(option), parts = [], total = 0;
          tmp.on("data", function(data) {
            parts.push(data);
            total += data.length;
          });
          tmp.on("end", function() {
            var buf = Buffer.alloc(total), written = 0;
            buf.fill(0);
            for (var i = 0; i < parts.length; i++) {
              var part = parts[i];
              part.copy(buf, written);
              written += part.length;
            }
            callback && callback(buf);
          });
          tmp.end(inbuf);
        }
      };
    };
  }
});

// node_modules/adm-zip/methods/zipcrypto.js
var require_zipcrypto = __commonJS({
  "node_modules/adm-zip/methods/zipcrypto.js"(exports2, module2) {
    "use strict";
    var { randomFillSync } = require("crypto");
    var Errors = require_errors();
    var crctable = new Uint32Array(256).map((t, crc) => {
      for (let j = 0; j < 8; j++) {
        if (0 !== (crc & 1)) {
          crc = crc >>> 1 ^ 3988292384;
        } else {
          crc >>>= 1;
        }
      }
      return crc >>> 0;
    });
    var uMul = (a, b) => Math.imul(a, b) >>> 0;
    var crc32update = (pCrc32, bval) => {
      return crctable[(pCrc32 ^ bval) & 255] ^ pCrc32 >>> 8;
    };
    var genSalt = () => {
      if ("function" === typeof randomFillSync) {
        return randomFillSync(Buffer.alloc(12));
      } else {
        return genSalt.node();
      }
    };
    genSalt.node = () => {
      const salt = Buffer.alloc(12);
      const len = salt.length;
      for (let i = 0; i < len; i++)
        salt[i] = Math.random() * 256 & 255;
      return salt;
    };
    var config = {
      genSalt
    };
    function Initkeys(pw) {
      const pass = Buffer.isBuffer(pw) ? pw : Buffer.from(pw);
      this.keys = new Uint32Array([305419896, 591751049, 878082192]);
      for (let i = 0; i < pass.length; i++) {
        this.updateKeys(pass[i]);
      }
    }
    Initkeys.prototype.updateKeys = function(byteValue) {
      const keys = this.keys;
      keys[0] = crc32update(keys[0], byteValue);
      keys[1] += keys[0] & 255;
      keys[1] = uMul(keys[1], 134775813) + 1;
      keys[2] = crc32update(keys[2], keys[1] >>> 24);
      return byteValue;
    };
    Initkeys.prototype.next = function() {
      const k = (this.keys[2] | 2) >>> 0;
      return uMul(k, k ^ 1) >> 8 & 255;
    };
    function make_decrypter(pwd) {
      const keys = new Initkeys(pwd);
      return function(data) {
        const result = Buffer.alloc(data.length);
        let pos = 0;
        for (let c of data) {
          result[pos++] = keys.updateKeys(c ^ keys.next());
        }
        return result;
      };
    }
    function make_encrypter(pwd) {
      const keys = new Initkeys(pwd);
      return function(data, result, pos = 0) {
        if (!result)
          result = Buffer.alloc(data.length);
        for (let c of data) {
          const k = keys.next();
          result[pos++] = c ^ k;
          keys.updateKeys(c);
        }
        return result;
      };
    }
    function decrypt(data, header, pwd) {
      if (!data || !Buffer.isBuffer(data) || data.length < 12) {
        return Buffer.alloc(0);
      }
      const decrypter = make_decrypter(pwd);
      const salt = decrypter(data.slice(0, 12));
      const verifyByte = (header.flags & 8) === 8 ? header.timeHighByte : header.crc >>> 24;
      if (salt[11] !== verifyByte) {
        throw Errors.WRONG_PASSWORD();
      }
      return decrypter(data.slice(12));
    }
    function _salter(data) {
      if (Buffer.isBuffer(data) && data.length >= 12) {
        config.genSalt = function() {
          return data.slice(0, 12);
        };
      } else if (data === "node") {
        config.genSalt = genSalt.node;
      } else {
        config.genSalt = genSalt;
      }
    }
    function encrypt(data, header, pwd, oldlike = false) {
      if (data == null)
        data = Buffer.alloc(0);
      if (!Buffer.isBuffer(data))
        data = Buffer.from(data.toString());
      const encrypter = make_encrypter(pwd);
      const salt = config.genSalt();
      salt[11] = header.crc >>> 24 & 255;
      if (oldlike)
        salt[10] = header.crc >>> 16 & 255;
      const result = Buffer.alloc(data.length + 12);
      encrypter(salt, result);
      return encrypter(data, result, 12);
    }
    module2.exports = { decrypt, encrypt, _salter };
  }
});

// node_modules/adm-zip/methods/index.js
var require_methods = __commonJS({
  "node_modules/adm-zip/methods/index.js"(exports2) {
    exports2.Deflater = require_deflater();
    exports2.Inflater = require_inflater();
    exports2.ZipCrypto = require_zipcrypto();
  }
});

// node_modules/adm-zip/zipEntry.js
var require_zipEntry = __commonJS({
  "node_modules/adm-zip/zipEntry.js"(exports2, module2) {
    var Utils = require_util();
    var Headers = require_headers();
    var Constants = Utils.Constants;
    var Methods = require_methods();
    module2.exports = function(options, input) {
      var _centralHeader = new Headers.EntryHeader(), _entryName = Buffer.alloc(0), _comment = Buffer.alloc(0), _isDirectory = false, uncompressedData = null, _extra = Buffer.alloc(0), _extralocal = Buffer.alloc(0), _efs = true;
      const opts = options;
      const decoder = typeof opts.decoder === "object" ? opts.decoder : Utils.decoder;
      _efs = decoder.hasOwnProperty("efs") ? decoder.efs : false;
      function getCompressedDataFromZip() {
        if (!input || !(input instanceof Uint8Array)) {
          return Buffer.alloc(0);
        }
        _extralocal = _centralHeader.loadLocalHeaderFromBinary(input);
        return input.slice(_centralHeader.realDataOffset, _centralHeader.realDataOffset + _centralHeader.compressedSize);
      }
      function crc32OK(data) {
        if (!_centralHeader.flags_desc && !_centralHeader.localHeader.flags_desc) {
          if (Utils.crc32(data) !== _centralHeader.localHeader.crc) {
            return false;
          }
        } else {
          const descriptor = {};
          const dataEndOffset = _centralHeader.realDataOffset + _centralHeader.compressedSize;
          if (input.readUInt32LE(dataEndOffset) == Constants.LOCSIG || input.readUInt32LE(dataEndOffset) == Constants.CENSIG) {
            throw Utils.Errors.DESCRIPTOR_NOT_EXIST();
          }
          if (input.readUInt32LE(dataEndOffset) == Constants.EXTSIG) {
            descriptor.crc = input.readUInt32LE(dataEndOffset + Constants.EXTCRC);
            descriptor.compressedSize = input.readUInt32LE(dataEndOffset + Constants.EXTSIZ);
            descriptor.size = input.readUInt32LE(dataEndOffset + Constants.EXTLEN);
          } else if (input.readUInt16LE(dataEndOffset + 12) === 19280) {
            descriptor.crc = input.readUInt32LE(dataEndOffset + Constants.EXTCRC - 4);
            descriptor.compressedSize = input.readUInt32LE(dataEndOffset + Constants.EXTSIZ - 4);
            descriptor.size = input.readUInt32LE(dataEndOffset + Constants.EXTLEN - 4);
          } else {
            throw Utils.Errors.DESCRIPTOR_UNKNOWN();
          }
          if (descriptor.compressedSize !== _centralHeader.compressedSize || descriptor.size !== _centralHeader.size || descriptor.crc !== _centralHeader.crc) {
            throw Utils.Errors.DESCRIPTOR_FAULTY();
          }
          if (Utils.crc32(data) !== descriptor.crc) {
            return false;
          }
        }
        return true;
      }
      function decompress(async, callback, pass) {
        if (typeof callback === "undefined" && typeof async === "string") {
          pass = async;
          async = void 0;
        }
        if (_isDirectory) {
          if (async && callback) {
            callback(Buffer.alloc(0), Utils.Errors.DIRECTORY_CONTENT_ERROR());
          }
          return Buffer.alloc(0);
        }
        var compressedData = getCompressedDataFromZip();
        if (compressedData.length === 0) {
          if (async && callback)
            callback(compressedData);
          return compressedData;
        }
        if (_centralHeader.encrypted) {
          if ("string" !== typeof pass && !Buffer.isBuffer(pass)) {
            throw Utils.Errors.INVALID_PASS_PARAM();
          }
          compressedData = Methods.ZipCrypto.decrypt(compressedData, _centralHeader, pass);
        }
        var data = Buffer.alloc(_centralHeader.size);
        switch (_centralHeader.method) {
          case Utils.Constants.STORED:
            compressedData.copy(data);
            if (!crc32OK(data)) {
              if (async && callback)
                callback(data, Utils.Errors.BAD_CRC());
              throw Utils.Errors.BAD_CRC();
            } else {
              if (async && callback)
                callback(data);
              return data;
            }
          case Utils.Constants.DEFLATED:
            var inflater = new Methods.Inflater(compressedData, _centralHeader.size);
            if (!async) {
              const result = inflater.inflate(data);
              result.copy(data, 0);
              if (!crc32OK(data)) {
                throw Utils.Errors.BAD_CRC(`"${decoder.decode(_entryName)}"`);
              }
              return data;
            } else {
              inflater.inflateAsync(function(result) {
                result.copy(result, 0);
                if (callback) {
                  if (!crc32OK(result)) {
                    callback(result, Utils.Errors.BAD_CRC());
                  } else {
                    callback(result);
                  }
                }
              });
            }
            break;
          default:
            if (async && callback)
              callback(Buffer.alloc(0), Utils.Errors.UNKNOWN_METHOD());
            throw Utils.Errors.UNKNOWN_METHOD();
        }
      }
      function compress(async, callback) {
        if ((!uncompressedData || !uncompressedData.length) && Buffer.isBuffer(input)) {
          if (async && callback)
            callback(getCompressedDataFromZip());
          return getCompressedDataFromZip();
        }
        if (uncompressedData.length && !_isDirectory) {
          var compressedData;
          switch (_centralHeader.method) {
            case Utils.Constants.STORED:
              _centralHeader.compressedSize = _centralHeader.size;
              compressedData = Buffer.alloc(uncompressedData.length);
              uncompressedData.copy(compressedData);
              if (async && callback)
                callback(compressedData);
              return compressedData;
            default:
            case Utils.Constants.DEFLATED:
              var deflater = new Methods.Deflater(uncompressedData);
              if (!async) {
                var deflated = deflater.deflate();
                _centralHeader.compressedSize = deflated.length;
                return deflated;
              } else {
                deflater.deflateAsync(function(data) {
                  compressedData = Buffer.alloc(data.length);
                  _centralHeader.compressedSize = data.length;
                  data.copy(compressedData);
                  callback && callback(compressedData);
                });
              }
              deflater = null;
              break;
          }
        } else if (async && callback) {
          callback(Buffer.alloc(0));
        } else {
          return Buffer.alloc(0);
        }
      }
      function readUInt64LE(buffer, offset) {
        return Utils.readBigUInt64LE(buffer, offset);
      }
      function parseExtra(data) {
        try {
          var offset = 0;
          var signature, size, part;
          while (offset + 4 < data.length) {
            signature = data.readUInt16LE(offset);
            offset += 2;
            size = data.readUInt16LE(offset);
            offset += 2;
            part = data.slice(offset, offset + size);
            offset += size;
            if (Constants.ID_ZIP64 === signature) {
              parseZip64ExtendedInformation(part);
            }
          }
        } catch (error) {
          throw Utils.Errors.EXTRA_FIELD_PARSE_ERROR();
        }
      }
      function parseZip64ExtendedInformation(data) {
        var size, compressedSize, offset, diskNumStart;
        if (data.length >= Constants.EF_ZIP64_SCOMP) {
          size = readUInt64LE(data, Constants.EF_ZIP64_SUNCOMP);
          if (_centralHeader.size === Constants.EF_ZIP64_OR_32) {
            _centralHeader.size = size;
          }
        }
        if (data.length >= Constants.EF_ZIP64_RHO) {
          compressedSize = readUInt64LE(data, Constants.EF_ZIP64_SCOMP);
          if (_centralHeader.compressedSize === Constants.EF_ZIP64_OR_32) {
            _centralHeader.compressedSize = compressedSize;
          }
        }
        if (data.length >= Constants.EF_ZIP64_DSN) {
          offset = readUInt64LE(data, Constants.EF_ZIP64_RHO);
          if (_centralHeader.offset === Constants.EF_ZIP64_OR_32) {
            _centralHeader.offset = offset;
          }
        }
        if (data.length >= Constants.EF_ZIP64_DSN + 4) {
          diskNumStart = data.readUInt32LE(Constants.EF_ZIP64_DSN);
          if (_centralHeader.diskNumStart === Constants.EF_ZIP64_OR_16) {
            _centralHeader.diskNumStart = diskNumStart;
          }
        }
      }
      return {
        get entryName() {
          return decoder.decode(_entryName);
        },
        get rawEntryName() {
          return _entryName;
        },
        set entryName(val) {
          _entryName = Utils.toBuffer(val, decoder.encode);
          var lastChar = _entryName[_entryName.length - 1];
          _isDirectory = lastChar === 47 || lastChar === 92;
          _centralHeader.fileNameLength = _entryName.length;
        },
        get efs() {
          if (typeof _efs === "function") {
            return _efs(this.entryName);
          } else {
            return _efs;
          }
        },
        get extra() {
          return _extra;
        },
        set extra(val) {
          _extra = val;
          _centralHeader.extraLength = val.length;
          parseExtra(val);
        },
        get comment() {
          return decoder.decode(_comment);
        },
        set comment(val) {
          _comment = Utils.toBuffer(val, decoder.encode);
          _centralHeader.commentLength = _comment.length;
          if (_comment.length > 65535)
            throw Utils.Errors.COMMENT_TOO_LONG();
        },
        get name() {
          var n = decoder.decode(_entryName);
          return _isDirectory ? n.substr(n.length - 1).split("/").pop() : n.split("/").pop();
        },
        get isDirectory() {
          return _isDirectory;
        },
        getCompressedData: function() {
          return compress(false, null);
        },
        getCompressedDataAsync: function(callback) {
          compress(true, callback);
        },
        setData: function(value) {
          uncompressedData = Utils.toBuffer(value, Utils.decoder.encode);
          if (!_isDirectory && uncompressedData.length) {
            _centralHeader.size = uncompressedData.length;
            _centralHeader.method = Utils.Constants.DEFLATED;
            _centralHeader.crc = Utils.crc32(value);
            _centralHeader.changed = true;
          } else {
            _centralHeader.method = Utils.Constants.STORED;
          }
        },
        getData: function(pass) {
          if (_centralHeader.changed) {
            return uncompressedData;
          } else {
            return decompress(false, null, pass);
          }
        },
        getDataAsync: function(callback, pass) {
          if (_centralHeader.changed) {
            callback(uncompressedData);
          } else {
            decompress(true, callback, pass);
          }
        },
        set attr(attr) {
          _centralHeader.attr = attr;
        },
        get attr() {
          return _centralHeader.attr;
        },
        set header(data) {
          _centralHeader.loadFromBinary(data);
        },
        get header() {
          return _centralHeader;
        },
        packCentralHeader: function() {
          _centralHeader.flags_efs = this.efs;
          _centralHeader.extraLength = _extra.length;
          var header = _centralHeader.centralHeaderToBinary();
          var addpos = Utils.Constants.CENHDR;
          _entryName.copy(header, addpos);
          addpos += _entryName.length;
          _extra.copy(header, addpos);
          addpos += _centralHeader.extraLength;
          _comment.copy(header, addpos);
          return header;
        },
        packLocalHeader: function() {
          let addpos = 0;
          _centralHeader.flags_efs = this.efs;
          _centralHeader.extraLocalLength = _extralocal.length;
          const localHeaderBuf = _centralHeader.localHeaderToBinary();
          const localHeader = Buffer.alloc(localHeaderBuf.length + _entryName.length + _centralHeader.extraLocalLength);
          localHeaderBuf.copy(localHeader, addpos);
          addpos += localHeaderBuf.length;
          _entryName.copy(localHeader, addpos);
          addpos += _entryName.length;
          _extralocal.copy(localHeader, addpos);
          addpos += _extralocal.length;
          return localHeader;
        },
        toJSON: function() {
          const bytes = function(nr) {
            return "<" + (nr && nr.length + " bytes buffer" || "null") + ">";
          };
          return {
            entryName: this.entryName,
            name: this.name,
            comment: this.comment,
            isDirectory: this.isDirectory,
            header: _centralHeader.toJSON(),
            compressedData: bytes(input),
            data: bytes(uncompressedData)
          };
        },
        toString: function() {
          return JSON.stringify(this.toJSON(), null, "	");
        }
      };
    };
  }
});

// node_modules/adm-zip/zipFile.js
var require_zipFile = __commonJS({
  "node_modules/adm-zip/zipFile.js"(exports2, module2) {
    var ZipEntry = require_zipEntry();
    var Headers = require_headers();
    var Utils = require_util();
    module2.exports = function(inBuffer, options) {
      var entryList = [], entryTable = {}, _comment = Buffer.alloc(0), mainHeader = new Headers.MainHeader(), loadedEntries = false;
      var password = null;
      const temporary = /* @__PURE__ */ new Set();
      const opts = options;
      const { noSort, decoder } = opts;
      if (inBuffer) {
        readMainHeader(opts.readEntries);
      } else {
        loadedEntries = true;
      }
      function makeTemporaryFolders() {
        const foldersList = /* @__PURE__ */ new Set();
        for (const elem of Object.keys(entryTable)) {
          const elements = elem.split("/");
          elements.pop();
          if (!elements.length)
            continue;
          for (let i = 0; i < elements.length; i++) {
            const sub = elements.slice(0, i + 1).join("/") + "/";
            foldersList.add(sub);
          }
        }
        for (const elem of foldersList) {
          if (!(elem in entryTable)) {
            const tempfolder = new ZipEntry(opts);
            tempfolder.entryName = elem;
            tempfolder.attr = 16;
            tempfolder.temporary = true;
            entryList.push(tempfolder);
            entryTable[tempfolder.entryName] = tempfolder;
            temporary.add(tempfolder);
          }
        }
      }
      function readEntries() {
        loadedEntries = true;
        entryTable = {};
        if (mainHeader.diskEntries > (inBuffer.length - mainHeader.offset) / Utils.Constants.CENHDR) {
          throw Utils.Errors.DISK_ENTRY_TOO_LARGE();
        }
        entryList = new Array(mainHeader.diskEntries);
        var index = mainHeader.offset;
        for (var i = 0; i < entryList.length; i++) {
          var tmp = index, entry = new ZipEntry(opts, inBuffer);
          entry.header = inBuffer.slice(tmp, tmp += Utils.Constants.CENHDR);
          entry.entryName = inBuffer.slice(tmp, tmp += entry.header.fileNameLength);
          if (entry.header.extraLength) {
            entry.extra = inBuffer.slice(tmp, tmp += entry.header.extraLength);
          }
          if (entry.header.commentLength)
            entry.comment = inBuffer.slice(tmp, tmp + entry.header.commentLength);
          index += entry.header.centralHeaderSize;
          entryList[i] = entry;
          entryTable[entry.entryName] = entry;
        }
        temporary.clear();
        makeTemporaryFolders();
      }
      function readMainHeader(readNow) {
        var i = inBuffer.length - Utils.Constants.ENDHDR, max = Math.max(0, i - 65535), n = max, endStart = inBuffer.length, endOffset = -1, commentEnd = 0;
        const trailingSpace = typeof opts.trailingSpace === "boolean" ? opts.trailingSpace : false;
        if (trailingSpace)
          max = 0;
        for (i; i >= n; i--) {
          if (inBuffer[i] !== 80)
            continue;
          if (inBuffer.readUInt32LE(i) === Utils.Constants.ENDSIG) {
            endOffset = i;
            commentEnd = i;
            endStart = i + Utils.Constants.ENDHDR;
            n = i - Utils.Constants.END64HDR;
            continue;
          }
          if (inBuffer.readUInt32LE(i) === Utils.Constants.END64SIG) {
            n = max;
            continue;
          }
          if (inBuffer.readUInt32LE(i) === Utils.Constants.ZIP64SIG) {
            endOffset = i;
            endStart = i + Utils.readBigUInt64LE(inBuffer, i + Utils.Constants.ZIP64SIZE) + Utils.Constants.ZIP64LEAD;
            break;
          }
        }
        if (endOffset == -1)
          throw Utils.Errors.INVALID_FORMAT();
        mainHeader.loadFromBinary(inBuffer.slice(endOffset, endStart));
        if (mainHeader.commentLength) {
          _comment = inBuffer.slice(commentEnd + Utils.Constants.ENDHDR);
        }
        if (readNow)
          readEntries();
      }
      function sortEntries() {
        if (entryList.length > 1 && !noSort) {
          entryList.sort((a, b) => a.entryName.toLowerCase().localeCompare(b.entryName.toLowerCase()));
        }
      }
      return {
        /**
         * Returns an array of ZipEntry objects existent in the current opened archive
         * @return Array
         */
        get entries() {
          if (!loadedEntries) {
            readEntries();
          }
          return entryList.filter((e) => !temporary.has(e));
        },
        /**
         * Archive comment
         * @return {String}
         */
        get comment() {
          return decoder.decode(_comment);
        },
        set comment(val) {
          _comment = Utils.toBuffer(val, decoder.encode);
          mainHeader.commentLength = _comment.length;
        },
        getEntryCount: function() {
          if (!loadedEntries) {
            return mainHeader.diskEntries;
          }
          return entryList.length;
        },
        forEach: function(callback) {
          this.entries.forEach(callback);
        },
        /**
         * Returns a reference to the entry with the given name or null if entry is inexistent
         *
         * @param entryName
         * @return ZipEntry
         */
        getEntry: function(entryName) {
          if (!loadedEntries) {
            readEntries();
          }
          return entryTable[entryName] || null;
        },
        /**
         * Adds the given entry to the entry list
         *
         * @param entry
         */
        setEntry: function(entry) {
          if (!loadedEntries) {
            readEntries();
          }
          entryList.push(entry);
          entryTable[entry.entryName] = entry;
          mainHeader.totalEntries = entryList.length;
        },
        /**
         * Removes the file with the given name from the entry list.
         *
         * If the entry is a directory, then all nested files and directories will be removed
         * @param entryName
         * @returns {void}
         */
        deleteFile: function(entryName, withsubfolders = true) {
          if (!loadedEntries) {
            readEntries();
          }
          const entry = entryTable[entryName];
          const list = this.getEntryChildren(entry, withsubfolders).map((child) => child.entryName);
          list.forEach(this.deleteEntry);
        },
        /**
         * Removes the entry with the given name from the entry list.
         *
         * @param {string} entryName
         * @returns {void}
         */
        deleteEntry: function(entryName) {
          if (!loadedEntries) {
            readEntries();
          }
          const entry = entryTable[entryName];
          const index = entryList.indexOf(entry);
          if (index >= 0) {
            entryList.splice(index, 1);
            delete entryTable[entryName];
            mainHeader.totalEntries = entryList.length;
          }
        },
        /**
         *  Iterates and returns all nested files and directories of the given entry
         *
         * @param entry
         * @return Array
         */
        getEntryChildren: function(entry, subfolders = true) {
          if (!loadedEntries) {
            readEntries();
          }
          if (typeof entry === "object") {
            if (entry.isDirectory && subfolders) {
              const list = [];
              const name = entry.entryName;
              for (const zipEntry of entryList) {
                if (zipEntry.entryName.startsWith(name)) {
                  list.push(zipEntry);
                }
              }
              return list;
            } else {
              return [entry];
            }
          }
          return [];
        },
        /**
         *  How many child elements entry has
         *
         * @param {ZipEntry} entry
         * @return {integer}
         */
        getChildCount: function(entry) {
          if (entry && entry.isDirectory) {
            const list = this.getEntryChildren(entry);
            return list.includes(entry) ? list.length - 1 : list.length;
          }
          return 0;
        },
        /**
         * Returns the zip file
         *
         * @return Buffer
         */
        compressToBuffer: function() {
          if (!loadedEntries) {
            readEntries();
          }
          sortEntries();
          const dataBlock = [];
          const headerBlocks = [];
          let totalSize = 0;
          let dindex = 0;
          mainHeader.size = 0;
          mainHeader.offset = 0;
          let totalEntries = 0;
          for (const entry of this.entries) {
            const compressedData = entry.getCompressedData();
            entry.header.offset = dindex;
            const localHeader = entry.packLocalHeader();
            const dataLength = localHeader.length + compressedData.length;
            dindex += dataLength;
            dataBlock.push(localHeader);
            dataBlock.push(compressedData);
            const centralHeader = entry.packCentralHeader();
            headerBlocks.push(centralHeader);
            mainHeader.size += centralHeader.length;
            totalSize += dataLength + centralHeader.length;
            totalEntries++;
          }
          totalSize += mainHeader.mainHeaderSize;
          mainHeader.offset = dindex;
          mainHeader.totalEntries = totalEntries;
          dindex = 0;
          const outBuffer = Buffer.alloc(totalSize);
          for (const content of dataBlock) {
            content.copy(outBuffer, dindex);
            dindex += content.length;
          }
          for (const content of headerBlocks) {
            content.copy(outBuffer, dindex);
            dindex += content.length;
          }
          const mh = mainHeader.toBinary();
          if (_comment) {
            _comment.copy(mh, mh.length - _comment.length);
          }
          mh.copy(outBuffer, dindex);
          inBuffer = outBuffer;
          loadedEntries = false;
          return outBuffer;
        },
        toAsyncBuffer: function(onSuccess, onFail, onItemStart, onItemEnd) {
          try {
            if (!loadedEntries) {
              readEntries();
            }
            sortEntries();
            const dataBlock = [];
            const centralHeaders = [];
            let totalSize = 0;
            let dindex = 0;
            let totalEntries = 0;
            mainHeader.size = 0;
            mainHeader.offset = 0;
            const compress2Buffer = function(entryLists) {
              if (entryLists.length > 0) {
                const entry = entryLists.shift();
                const name = entry.entryName + entry.extra.toString();
                if (onItemStart)
                  onItemStart(name);
                entry.getCompressedDataAsync(function(compressedData) {
                  if (onItemEnd)
                    onItemEnd(name);
                  entry.header.offset = dindex;
                  const localHeader = entry.packLocalHeader();
                  const dataLength = localHeader.length + compressedData.length;
                  dindex += dataLength;
                  dataBlock.push(localHeader);
                  dataBlock.push(compressedData);
                  const centalHeader = entry.packCentralHeader();
                  centralHeaders.push(centalHeader);
                  mainHeader.size += centalHeader.length;
                  totalSize += dataLength + centalHeader.length;
                  totalEntries++;
                  compress2Buffer(entryLists);
                });
              } else {
                totalSize += mainHeader.mainHeaderSize;
                mainHeader.offset = dindex;
                mainHeader.totalEntries = totalEntries;
                dindex = 0;
                const outBuffer = Buffer.alloc(totalSize);
                dataBlock.forEach(function(content) {
                  content.copy(outBuffer, dindex);
                  dindex += content.length;
                });
                centralHeaders.forEach(function(content) {
                  content.copy(outBuffer, dindex);
                  dindex += content.length;
                });
                const mh = mainHeader.toBinary();
                if (_comment) {
                  _comment.copy(mh, mh.length - _comment.length);
                }
                mh.copy(outBuffer, dindex);
                inBuffer = outBuffer;
                loadedEntries = false;
                onSuccess(outBuffer);
              }
            };
            compress2Buffer(Array.from(this.entries));
          } catch (e) {
            onFail(e);
          }
        }
      };
    };
  }
});

// node_modules/adm-zip/adm-zip.js
var require_adm_zip = __commonJS({
  "node_modules/adm-zip/adm-zip.js"(exports2, module2) {
    var Utils = require_util();
    var pth = require("path");
    var ZipEntry = require_zipEntry();
    var ZipFile = require_zipFile();
    var get_Bool = (...val) => Utils.findLast(val, (c) => typeof c === "boolean");
    var get_Str = (...val) => Utils.findLast(val, (c) => typeof c === "string");
    var get_Fun = (...val) => Utils.findLast(val, (c) => typeof c === "function");
    var defaultOptions = {
      // option "noSort" : if true it disables files sorting
      noSort: false,
      // read entries during load (initial loading may be slower)
      readEntries: false,
      // default method is none
      method: Utils.Constants.NONE,
      // file system
      fs: null
    };
    module2.exports = function(input, options) {
      let inBuffer = null;
      const opts = Object.assign(/* @__PURE__ */ Object.create(null), defaultOptions);
      if (input && "object" === typeof input) {
        if (!(input instanceof Uint8Array)) {
          Object.assign(opts, input);
          input = opts.input ? opts.input : void 0;
          if (opts.input)
            delete opts.input;
        }
        if (Buffer.isBuffer(input)) {
          inBuffer = input;
          opts.method = Utils.Constants.BUFFER;
          input = void 0;
        }
      }
      Object.assign(opts, options);
      const filetools = new Utils(opts);
      if (typeof opts.decoder !== "object" || typeof opts.decoder.encode !== "function" || typeof opts.decoder.decode !== "function") {
        opts.decoder = Utils.decoder;
      }
      if (input && "string" === typeof input) {
        if (filetools.fs.existsSync(input)) {
          opts.method = Utils.Constants.FILE;
          opts.filename = input;
          inBuffer = filetools.fs.readFileSync(input);
        } else {
          throw Utils.Errors.INVALID_FILENAME();
        }
      }
      const _zip = new ZipFile(inBuffer, opts);
      const { canonical, sanitize, zipnamefix } = Utils;
      function getEntry(entry) {
        if (entry && _zip) {
          var item;
          if (typeof entry === "string")
            item = _zip.getEntry(pth.posix.normalize(entry));
          if (typeof entry === "object" && typeof entry.entryName !== "undefined" && typeof entry.header !== "undefined")
            item = _zip.getEntry(entry.entryName);
          if (item) {
            return item;
          }
        }
        return null;
      }
      function fixPath(zipPath) {
        const { join: join5, normalize, sep: sep2 } = pth.posix;
        return join5(pth.isAbsolute(zipPath) ? "/" : ".", normalize(sep2 + zipPath.split("\\").join(sep2) + sep2));
      }
      function filenameFilter(filterfn) {
        if (filterfn instanceof RegExp) {
          return /* @__PURE__ */ function(rx) {
            return function(filename) {
              return rx.test(filename);
            };
          }(filterfn);
        } else if ("function" !== typeof filterfn) {
          return () => true;
        }
        return filterfn;
      }
      const relativePath = (local, entry) => {
        let lastChar = entry.slice(-1);
        lastChar = lastChar === filetools.sep ? filetools.sep : "";
        return pth.relative(local, entry) + lastChar;
      };
      return {
        /**
         * Extracts the given entry from the archive and returns the content as a Buffer object
         * @param {ZipEntry|string} entry ZipEntry object or String with the full path of the entry
         * @param {Buffer|string} [pass] - password
         * @return Buffer or Null in case of error
         */
        readFile: function(entry, pass) {
          var item = getEntry(entry);
          return item && item.getData(pass) || null;
        },
        /**
         * Returns how many child elements has on entry (directories) on files it is always 0
         * @param {ZipEntry|string} entry ZipEntry object or String with the full path of the entry
         * @returns {integer}
         */
        childCount: function(entry) {
          const item = getEntry(entry);
          if (item) {
            return _zip.getChildCount(item);
          }
        },
        /**
         * Asynchronous readFile
         * @param {ZipEntry|string} entry ZipEntry object or String with the full path of the entry
         * @param {callback} callback
         *
         * @return Buffer or Null in case of error
         */
        readFileAsync: function(entry, callback) {
          var item = getEntry(entry);
          if (item) {
            item.getDataAsync(callback);
          } else {
            callback(null, "getEntry failed for:" + entry);
          }
        },
        /**
         * Extracts the given entry from the archive and returns the content as plain text in the given encoding
         * @param {ZipEntry|string} entry - ZipEntry object or String with the full path of the entry
         * @param {string} encoding - Optional. If no encoding is specified utf8 is used
         *
         * @return String
         */
        readAsText: function(entry, encoding) {
          var item = getEntry(entry);
          if (item) {
            var data = item.getData();
            if (data && data.length) {
              return data.toString(encoding || "utf8");
            }
          }
          return "";
        },
        /**
         * Asynchronous readAsText
         * @param {ZipEntry|string} entry ZipEntry object or String with the full path of the entry
         * @param {callback} callback
         * @param {string} [encoding] - Optional. If no encoding is specified utf8 is used
         *
         * @return String
         */
        readAsTextAsync: function(entry, callback, encoding) {
          var item = getEntry(entry);
          if (item) {
            item.getDataAsync(function(data, err) {
              if (err) {
                callback(data, err);
                return;
              }
              if (data && data.length) {
                callback(data.toString(encoding || "utf8"));
              } else {
                callback("");
              }
            });
          } else {
            callback("");
          }
        },
        /**
         * Remove the entry from the file or the entry and all it's nested directories and files if the given entry is a directory
         *
         * @param {ZipEntry|string} entry
         * @param {boolean} withsubfolders
         * @returns {void}
         */
        deleteFile: function(entry, withsubfolders = true) {
          var item = getEntry(entry);
          if (item) {
            _zip.deleteFile(item.entryName, withsubfolders);
          }
        },
        /**
         * Remove the entry from the file or directory without affecting any nested entries
         *
         * @param {ZipEntry|string} entry
         * @returns {void}
         */
        deleteEntry: function(entry) {
          var item = getEntry(entry);
          if (item) {
            _zip.deleteEntry(item.entryName);
          }
        },
        /**
         * Adds a comment to the zip. The zip must be rewritten after adding the comment.
         *
         * @param {string} comment
         */
        addZipComment: function(comment) {
          _zip.comment = comment;
        },
        /**
         * Returns the zip comment
         *
         * @return String
         */
        getZipComment: function() {
          return _zip.comment || "";
        },
        /**
         * Adds a comment to a specified zipEntry. The zip must be rewritten after adding the comment
         * The comment cannot exceed 65535 characters in length
         *
         * @param {ZipEntry} entry
         * @param {string} comment
         */
        addZipEntryComment: function(entry, comment) {
          var item = getEntry(entry);
          if (item) {
            item.comment = comment;
          }
        },
        /**
         * Returns the comment of the specified entry
         *
         * @param {ZipEntry} entry
         * @return String
         */
        getZipEntryComment: function(entry) {
          var item = getEntry(entry);
          if (item) {
            return item.comment || "";
          }
          return "";
        },
        /**
         * Updates the content of an existing entry inside the archive. The zip must be rewritten after updating the content
         *
         * @param {ZipEntry} entry
         * @param {Buffer} content
         */
        updateFile: function(entry, content) {
          var item = getEntry(entry);
          if (item) {
            item.setData(content);
          }
        },
        /**
         * Adds a file from the disk to the archive
         *
         * @param {string} localPath File to add to zip
         * @param {string} [zipPath] Optional path inside the zip
         * @param {string} [zipName] Optional name for the file
         * @param {string} [comment] Optional file comment
         */
        addLocalFile: function(localPath, zipPath, zipName, comment) {
          if (filetools.fs.existsSync(localPath)) {
            zipPath = zipPath ? fixPath(zipPath) : "";
            const p = pth.win32.basename(pth.win32.normalize(localPath));
            zipPath += zipName ? zipName : p;
            const _attr = filetools.fs.statSync(localPath);
            const data = _attr.isFile() ? filetools.fs.readFileSync(localPath) : Buffer.alloc(0);
            if (_attr.isDirectory())
              zipPath += filetools.sep;
            this.addFile(zipPath, data, comment, _attr);
          } else {
            throw Utils.Errors.FILE_NOT_FOUND(localPath);
          }
        },
        /**
         * Callback for showing if everything was done.
         *
         * @callback doneCallback
         * @param {Error} err - Error object
         * @param {boolean} done - was request fully completed
         */
        /**
         * Adds a file from the disk to the archive
         *
         * @param {(object|string)} options - options object, if it is string it us used as localPath.
         * @param {string} options.localPath - Local path to the file.
         * @param {string} [options.comment] - Optional file comment.
         * @param {string} [options.zipPath] - Optional path inside the zip
         * @param {string} [options.zipName] - Optional name for the file
         * @param {doneCallback} callback - The callback that handles the response.
         */
        addLocalFileAsync: function(options2, callback) {
          options2 = typeof options2 === "object" ? options2 : { localPath: options2 };
          const localPath = pth.resolve(options2.localPath);
          const { comment } = options2;
          let { zipPath, zipName } = options2;
          const self = this;
          filetools.fs.stat(localPath, function(err, stats) {
            if (err)
              return callback(err, false);
            zipPath = zipPath ? fixPath(zipPath) : "";
            const p = pth.win32.basename(pth.win32.normalize(localPath));
            zipPath += zipName ? zipName : p;
            if (stats.isFile()) {
              filetools.fs.readFile(localPath, function(err2, data) {
                if (err2)
                  return callback(err2, false);
                self.addFile(zipPath, data, comment, stats);
                return setImmediate(callback, void 0, true);
              });
            } else if (stats.isDirectory()) {
              zipPath += filetools.sep;
              self.addFile(zipPath, Buffer.alloc(0), comment, stats);
              return setImmediate(callback, void 0, true);
            }
          });
        },
        /**
         * Adds a local directory and all its nested files and directories to the archive
         *
         * @param {string} localPath - local path to the folder
         * @param {string} [zipPath] - optional path inside zip
         * @param {(RegExp|function)} [filter] - optional RegExp or Function if files match will be included.
         */
        addLocalFolder: function(localPath, zipPath, filter) {
          filter = filenameFilter(filter);
          zipPath = zipPath ? fixPath(zipPath) : "";
          localPath = pth.normalize(localPath);
          if (filetools.fs.existsSync(localPath)) {
            const items = filetools.findFiles(localPath);
            const self = this;
            if (items.length) {
              for (const filepath of items) {
                const p = pth.join(zipPath, relativePath(localPath, filepath));
                if (filter(p)) {
                  self.addLocalFile(filepath, pth.dirname(p));
                }
              }
            }
          } else {
            throw Utils.Errors.FILE_NOT_FOUND(localPath);
          }
        },
        /**
         * Asynchronous addLocalFolder
         * @param {string} localPath
         * @param {callback} callback
         * @param {string} [zipPath] optional path inside zip
         * @param {RegExp|function} [filter] optional RegExp or Function if files match will
         *               be included.
         */
        addLocalFolderAsync: function(localPath, callback, zipPath, filter) {
          filter = filenameFilter(filter);
          zipPath = zipPath ? fixPath(zipPath) : "";
          localPath = pth.normalize(localPath);
          var self = this;
          filetools.fs.open(localPath, "r", function(err) {
            if (err && err.code === "ENOENT") {
              callback(void 0, Utils.Errors.FILE_NOT_FOUND(localPath));
            } else if (err) {
              callback(void 0, err);
            } else {
              var items = filetools.findFiles(localPath);
              var i = -1;
              var next = function() {
                i += 1;
                if (i < items.length) {
                  var filepath = items[i];
                  var p = relativePath(localPath, filepath).split("\\").join("/");
                  p = p.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\x20-\x7E]/g, "");
                  if (filter(p)) {
                    filetools.fs.stat(filepath, function(er0, stats) {
                      if (er0)
                        callback(void 0, er0);
                      if (stats.isFile()) {
                        filetools.fs.readFile(filepath, function(er1, data) {
                          if (er1) {
                            callback(void 0, er1);
                          } else {
                            self.addFile(zipPath + p, data, "", stats);
                            next();
                          }
                        });
                      } else {
                        self.addFile(zipPath + p + "/", Buffer.alloc(0), "", stats);
                        next();
                      }
                    });
                  } else {
                    process.nextTick(() => {
                      next();
                    });
                  }
                } else {
                  callback(true, void 0);
                }
              };
              next();
            }
          });
        },
        /**
         * Adds a local directory and all its nested files and directories to the archive
         *
         * @param {object | string} options - options object, if it is string it us used as localPath.
         * @param {string} options.localPath - Local path to the folder.
         * @param {string} [options.zipPath] - optional path inside zip.
         * @param {RegExp|function} [options.filter] - optional RegExp or Function if files match will be included.
         * @param {function|string} [options.namefix] - optional function to help fix filename
         * @param {doneCallback} callback - The callback that handles the response.
         *
         */
        addLocalFolderAsync2: function(options2, callback) {
          const self = this;
          options2 = typeof options2 === "object" ? options2 : { localPath: options2 };
          const localPath = pth.resolve(fixPath(options2.localPath));
          let { zipPath, filter, namefix } = options2;
          if (filter instanceof RegExp) {
            filter = /* @__PURE__ */ function(rx) {
              return function(filename) {
                return rx.test(filename);
              };
            }(filter);
          } else if ("function" !== typeof filter) {
            filter = function() {
              return true;
            };
          }
          zipPath = zipPath ? fixPath(zipPath) : "";
          if (namefix === "latin1") {
            namefix = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\x20-\x7E]/g, "");
          }
          if (typeof namefix !== "function")
            namefix = (str) => str;
          const relPathFix = (entry) => pth.join(zipPath, namefix(relativePath(localPath, entry)));
          const fileNameFix = (entry) => pth.win32.basename(pth.win32.normalize(namefix(entry)));
          filetools.fs.open(localPath, "r", function(err) {
            if (err && err.code === "ENOENT") {
              callback(void 0, Utils.Errors.FILE_NOT_FOUND(localPath));
            } else if (err) {
              callback(void 0, err);
            } else {
              filetools.findFilesAsync(localPath, function(err2, fileEntries) {
                if (err2)
                  return callback(err2);
                fileEntries = fileEntries.filter((dir) => filter(relPathFix(dir)));
                if (!fileEntries.length)
                  callback(void 0, false);
                setImmediate(
                  fileEntries.reverse().reduce(function(next, entry) {
                    return function(err3, done) {
                      if (err3 || done === false)
                        return setImmediate(next, err3, false);
                      self.addLocalFileAsync(
                        {
                          localPath: entry,
                          zipPath: pth.dirname(relPathFix(entry)),
                          zipName: fileNameFix(entry)
                        },
                        next
                      );
                    };
                  }, callback)
                );
              });
            }
          });
        },
        /**
         * Adds a local directory and all its nested files and directories to the archive
         *
         * @param {string} localPath - path where files will be extracted
         * @param {object} props - optional properties
         * @param {string} [props.zipPath] - optional path inside zip
         * @param {RegExp|function} [props.filter] - optional RegExp or Function if files match will be included.
         * @param {function|string} [props.namefix] - optional function to help fix filename
         */
        addLocalFolderPromise: function(localPath, props) {
          return new Promise((resolve3, reject) => {
            this.addLocalFolderAsync2(Object.assign({ localPath }, props), (err, done) => {
              if (err)
                reject(err);
              if (done)
                resolve3(this);
            });
          });
        },
        /**
         * Allows you to create a entry (file or directory) in the zip file.
         * If you want to create a directory the entryName must end in / and a null buffer should be provided.
         * Comment and attributes are optional
         *
         * @param {string} entryName
         * @param {Buffer | string} content - file content as buffer or utf8 coded string
         * @param {string} [comment] - file comment
         * @param {number | object} [attr] - number as unix file permissions, object as filesystem Stats object
         */
        addFile: function(entryName, content, comment, attr) {
          entryName = zipnamefix(entryName);
          let entry = getEntry(entryName);
          const update = entry != null;
          if (!update) {
            entry = new ZipEntry(opts);
            entry.entryName = entryName;
          }
          entry.comment = comment || "";
          const isStat = "object" === typeof attr && attr instanceof filetools.fs.Stats;
          if (isStat) {
            entry.header.time = attr.mtime;
          }
          var fileattr = entry.isDirectory ? 16 : 0;
          let unix = entry.isDirectory ? 16384 : 32768;
          if (isStat) {
            unix |= 4095 & attr.mode;
          } else if ("number" === typeof attr) {
            unix |= 4095 & attr;
          } else {
            unix |= entry.isDirectory ? 493 : 420;
          }
          fileattr = (fileattr | unix << 16) >>> 0;
          entry.attr = fileattr;
          entry.setData(content);
          if (!update)
            _zip.setEntry(entry);
          return entry;
        },
        /**
         * Returns an array of ZipEntry objects representing the files and folders inside the archive
         *
         * @param {string} [password]
         * @returns Array
         */
        getEntries: function(password) {
          _zip.password = password;
          return _zip ? _zip.entries : [];
        },
        /**
         * Returns a ZipEntry object representing the file or folder specified by ``name``.
         *
         * @param {string} name
         * @return ZipEntry
         */
        getEntry: function(name) {
          return getEntry(name);
        },
        getEntryCount: function() {
          return _zip.getEntryCount();
        },
        forEach: function(callback) {
          return _zip.forEach(callback);
        },
        /**
         * Extracts the given entry to the given targetPath
         * If the entry is a directory inside the archive, the entire directory and it's subdirectories will be extracted
         *
         * @param {string|ZipEntry} entry - ZipEntry object or String with the full path of the entry
         * @param {string} targetPath - Target folder where to write the file
         * @param {boolean} [maintainEntryPath=true] - If maintainEntryPath is true and the entry is inside a folder, the entry folder will be created in targetPath as well. Default is TRUE
         * @param {boolean} [overwrite=false] - If the file already exists at the target path, the file will be overwriten if this is true.
         * @param {boolean} [keepOriginalPermission=false] - The file will be set as the permission from the entry if this is true.
         * @param {string} [outFileName] - String If set will override the filename of the extracted file (Only works if the entry is a file)
         *
         * @return Boolean
         */
        extractEntryTo: function(entry, targetPath, maintainEntryPath, overwrite, keepOriginalPermission, outFileName) {
          overwrite = get_Bool(false, overwrite);
          keepOriginalPermission = get_Bool(false, keepOriginalPermission);
          maintainEntryPath = get_Bool(true, maintainEntryPath);
          outFileName = get_Str(keepOriginalPermission, outFileName);
          var item = getEntry(entry);
          if (!item) {
            throw Utils.Errors.NO_ENTRY();
          }
          var entryName = canonical(item.entryName);
          var target = sanitize(targetPath, outFileName && !item.isDirectory ? canonical(outFileName) : maintainEntryPath ? entryName : pth.basename(entryName));
          if (item.isDirectory) {
            var children = _zip.getEntryChildren(item);
            children.forEach(function(child) {
              if (child.isDirectory)
                return;
              var content2 = child.getData();
              if (!content2) {
                throw Utils.Errors.CANT_EXTRACT_FILE();
              }
              var name = canonical(child.entryName);
              var childName = sanitize(targetPath, maintainEntryPath ? name : pth.basename(name));
              const fileAttr2 = keepOriginalPermission ? child.header.fileAttr : void 0;
              filetools.writeFileTo(childName, content2, overwrite, fileAttr2);
            });
            return true;
          }
          var content = item.getData(_zip.password);
          if (!content)
            throw Utils.Errors.CANT_EXTRACT_FILE();
          if (filetools.fs.existsSync(target) && !overwrite) {
            throw Utils.Errors.CANT_OVERRIDE();
          }
          const fileAttr = keepOriginalPermission ? entry.header.fileAttr : void 0;
          filetools.writeFileTo(target, content, overwrite, fileAttr);
          return true;
        },
        /**
         * Test the archive
         * @param {string} [pass]
         */
        test: function(pass) {
          if (!_zip) {
            return false;
          }
          for (var entry of _zip.entries) {
            try {
              if (entry.isDirectory) {
                continue;
              }
              var content = _zip.entries[entry].getData(pass);
              if (!content) {
                return false;
              }
            } catch (err) {
              return false;
            }
          }
          return true;
        },
        /**
         * Extracts the entire archive to the given location
         *
         * @param {string} targetPath Target location
         * @param {boolean} [overwrite=false] If the file already exists at the target path, the file will be overwriten if this is true.
         *                  Default is FALSE
         * @param {boolean} [keepOriginalPermission=false] The file will be set as the permission from the entry if this is true.
         *                  Default is FALSE
         * @param {string|Buffer} [pass] password
         */
        extractAllTo: function(targetPath, overwrite, keepOriginalPermission, pass) {
          keepOriginalPermission = get_Bool(false, keepOriginalPermission);
          pass = get_Str(keepOriginalPermission, pass);
          overwrite = get_Bool(false, overwrite);
          if (!_zip)
            throw Utils.Errors.NO_ZIP();
          _zip.entries.forEach(function(entry) {
            var entryName = sanitize(targetPath, canonical(entry.entryName));
            if (entry.isDirectory) {
              filetools.makeDir(entryName);
              return;
            }
            var content = entry.getData(pass);
            if (!content) {
              throw Utils.Errors.CANT_EXTRACT_FILE();
            }
            const fileAttr = keepOriginalPermission ? entry.header.fileAttr : void 0;
            filetools.writeFileTo(entryName, content, overwrite, fileAttr);
            try {
              filetools.fs.utimesSync(entryName, entry.header.time, entry.header.time);
            } catch (err) {
              throw Utils.Errors.CANT_EXTRACT_FILE();
            }
          });
        },
        /**
         * Asynchronous extractAllTo
         *
         * @param {string} targetPath Target location
         * @param {boolean} [overwrite=false] If the file already exists at the target path, the file will be overwriten if this is true.
         *                  Default is FALSE
         * @param {boolean} [keepOriginalPermission=false] The file will be set as the permission from the entry if this is true.
         *                  Default is FALSE
         * @param {function} callback The callback will be executed when all entries are extracted successfully or any error is thrown.
         */
        extractAllToAsync: function(targetPath, overwrite, keepOriginalPermission, callback) {
          callback = get_Fun(overwrite, keepOriginalPermission, callback);
          keepOriginalPermission = get_Bool(false, keepOriginalPermission);
          overwrite = get_Bool(false, overwrite);
          if (!callback) {
            return new Promise((resolve3, reject) => {
              this.extractAllToAsync(targetPath, overwrite, keepOriginalPermission, function(err) {
                if (err) {
                  reject(err);
                } else {
                  resolve3(this);
                }
              });
            });
          }
          if (!_zip) {
            callback(Utils.Errors.NO_ZIP());
            return;
          }
          targetPath = pth.resolve(targetPath);
          const getPath = (entry) => sanitize(targetPath, pth.normalize(canonical(entry.entryName)));
          const getError = (msg, file) => new Error(msg + ': "' + file + '"');
          const dirEntries = [];
          const fileEntries = [];
          _zip.entries.forEach((e) => {
            if (e.isDirectory) {
              dirEntries.push(e);
            } else {
              fileEntries.push(e);
            }
          });
          for (const entry of dirEntries) {
            const dirPath = getPath(entry);
            const dirAttr = keepOriginalPermission ? entry.header.fileAttr : void 0;
            try {
              filetools.makeDir(dirPath);
              if (dirAttr)
                filetools.fs.chmodSync(dirPath, dirAttr);
              filetools.fs.utimesSync(dirPath, entry.header.time, entry.header.time);
            } catch (er) {
              callback(getError("Unable to create folder", dirPath));
            }
          }
          fileEntries.reverse().reduce(function(next, entry) {
            return function(err) {
              if (err) {
                next(err);
              } else {
                const entryName = pth.normalize(canonical(entry.entryName));
                const filePath = sanitize(targetPath, entryName);
                entry.getDataAsync(function(content, err_1) {
                  if (err_1) {
                    next(err_1);
                  } else if (!content) {
                    next(Utils.Errors.CANT_EXTRACT_FILE());
                  } else {
                    const fileAttr = keepOriginalPermission ? entry.header.fileAttr : void 0;
                    filetools.writeFileToAsync(filePath, content, overwrite, fileAttr, function(succ) {
                      if (!succ) {
                        next(getError("Unable to write file", filePath));
                      }
                      filetools.fs.utimes(filePath, entry.header.time, entry.header.time, function(err_2) {
                        if (err_2) {
                          next(getError("Unable to set times", filePath));
                        } else {
                          next();
                        }
                      });
                    });
                  }
                });
              }
            };
          }, callback)();
        },
        /**
         * Writes the newly created zip file to disk at the specified location or if a zip was opened and no ``targetFileName`` is provided, it will overwrite the opened zip
         *
         * @param {string} targetFileName
         * @param {function} callback
         */
        writeZip: function(targetFileName, callback) {
          if (arguments.length === 1) {
            if (typeof targetFileName === "function") {
              callback = targetFileName;
              targetFileName = "";
            }
          }
          if (!targetFileName && opts.filename) {
            targetFileName = opts.filename;
          }
          if (!targetFileName)
            return;
          var zipData = _zip.compressToBuffer();
          if (zipData) {
            var ok = filetools.writeFileTo(targetFileName, zipData, true);
            if (typeof callback === "function")
              callback(!ok ? new Error("failed") : null, "");
          }
        },
        /**
                 *
                 * @param {string} targetFileName
                 * @param {object} [props]
                 * @param {boolean} [props.overwrite=true] If the file already exists at the target path, the file will be overwriten if this is true.
                 * @param {boolean} [props.perm] The file will be set as the permission from the entry if this is true.
        
                 * @returns {Promise<void>}
                 */
        writeZipPromise: function(targetFileName, props) {
          const { overwrite, perm } = Object.assign({ overwrite: true }, props);
          return new Promise((resolve3, reject) => {
            if (!targetFileName && opts.filename)
              targetFileName = opts.filename;
            if (!targetFileName)
              reject("ADM-ZIP: ZIP File Name Missing");
            this.toBufferPromise().then((zipData) => {
              const ret = (done) => done ? resolve3(done) : reject("ADM-ZIP: Wasn't able to write zip file");
              filetools.writeFileToAsync(targetFileName, zipData, overwrite, perm, ret);
            }, reject);
          });
        },
        /**
         * @returns {Promise<Buffer>} A promise to the Buffer.
         */
        toBufferPromise: function() {
          return new Promise((resolve3, reject) => {
            _zip.toAsyncBuffer(resolve3, reject);
          });
        },
        /**
         * Returns the content of the entire zip file as a Buffer object
         *
         * @prop {function} [onSuccess]
         * @prop {function} [onFail]
         * @prop {function} [onItemStart]
         * @prop {function} [onItemEnd]
         * @returns {Buffer}
         */
        toBuffer: function(onSuccess, onFail, onItemStart, onItemEnd) {
          if (typeof onSuccess === "function") {
            _zip.toAsyncBuffer(onSuccess, onFail, onItemStart, onItemEnd);
            return null;
          }
          return _zip.compressToBuffer();
        }
      };
    };
  }
});

// src/extension.ts
var extension_exports = {};
__export(extension_exports, {
  _handleDownloadModelscopeAgent: () => _handleDownloadModelscopeAgent,
  activate: () => activate,
  deactivate: () => deactivate
});
module.exports = __toCommonJS(extension_exports);
var vscode5 = __toESM(require("vscode"));

// src/gateway.ts
var WebSocket = __toESM(require("ws"));
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
      this.ws = new WebSocket.WebSocket(wsUrl);
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
      const nonce = msg.payload?.nonce;
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
          p.reject(new Error(msg.error?.message || "request failed"));
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
    const nodeId = this.deviceIdentity?.deviceId;
    if (!nodeId)
      return;
    const agentId = nodeId;
    try {
      this.log(`configureExecHost: agentId=${agentId}`);
      const configResult = await this.request("config.get", {});
      const baseHash = configResult?.hash;
      let config = configResult?.config;
      if (!config && configResult?.raw) {
        try {
          config = JSON.parse(configResult.raw);
        } catch {
        }
      }
      if (!config)
        config = configResult;
      const agentEntries = config?.agents?.entries || {};
      this.log(`agents.entries has ${Object.keys(agentEntries).length} entries`);
      const existing = agentEntries[agentId];
      if (existing) {
        if (existing.tools?.exec?.host === "node") {
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
    if (!this.ws || this.ws.readyState !== WebSocket.WebSocket.OPEN) {
      throw new Error("not connected");
    }
    return new Promise((resolve3, reject) => {
      const id = this.genId();
      this.pending.set(id, { resolve: resolve3, reject });
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
    return this.deviceIdentity?.deviceId ?? null;
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
      this.ws = new WebSocket.WebSocket(wsUrl);
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
      const nonce = msg.payload?.nonce;
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
          p.reject(new Error(msg.error?.message || "request failed"));
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
        instanceId: this.deviceIdentity?.deviceId || ""
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
          const fs5 = require("fs");
          if (fs5.existsSync(cwd))
            return cwd;
        } catch {
        }
      }
      if (/^[A-Za-z]:/.test(cwd)) {
        try {
          const fs5 = require("fs");
          if (fs5.existsSync(cwd))
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
    return selected?.result || "deny";
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
    return new Promise((resolve3, reject) => {
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
          resolve3({
            stdout: stdout || "",
            stderr: stderr || "",
            exitCode: -1,
            success: false,
            timedOut: true,
            error: "Command timed out"
          });
        } else if (error && !hasOutput) {
          resolve3({
            stdout: stdout || "",
            stderr: stderr || "",
            exitCode: error.code || 1,
            success: false,
            timedOut: false,
            error: error.message || ""
          });
        } else {
          resolve3({
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
    if (!this.ws || this.ws.readyState !== WebSocket.WebSocket.OPEN) {
      throw new Error("not connected");
    }
    return new Promise((resolve3, reject) => {
      const id = Math.random().toString(36).substring(2, 12);
      this.pending.set(id, { resolve: resolve3, reject });
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
var os2 = __toESM(require("os"));
var path3 = __toESM(require("path"));
var vscode2 = __toESM(require("vscode"));

// src/agentTree.ts
var fs = __toESM(require("fs"));
var path2 = __toESM(require("path"));
function buildAgentsTree(dir, maxDepth = 3, depth = 0, log2 = (msg) => log(msg, LOG_INFO)) {
  const children = [];
  let hasAgentsMd = false;
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    hasAgentsMd = entries.some((e) => e.name === "AGENTS.md");
    for (const entry of entries) {
      if (entry.name.startsWith("."))
        continue;
      const fullPath = path2.join(dir, entry.name);
      const node = { name: entry.name, path: fullPath };
      if (entry.isDirectory()) {
        node.type = "directory";
        let childHasAgentsMd = false;
        try {
          const childEntries = fs.readdirSync(fullPath, { withFileTypes: true });
          childHasAgentsMd = childEntries.some((e) => e.name === "AGENTS.md");
        } catch (e) {
        }
        node.hasAgentsMd = childHasAgentsMd;
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
    log2(`buildAgentsTree: read ${dir} failed: ${err?.message || err}`);
  }
  children.sort((a, b) => {
    if (a.type === "directory" && b.type !== "directory")
      return -1;
    if (a.type !== "directory" && b.type === "directory")
      return 1;
    return a.name.localeCompare(b.name);
  });
  return { name: path2.basename(dir) || dir, path: dir, type: "directory", children, hasAgentsMd };
}
function loadExpandedPaths(context) {
  return context.globalState.get("openclaw.agentsTreeExpandedPaths", {}) || {};
}
function saveExpandedPaths(context, state) {
  context.globalState.update("openclaw.agentsTreeExpandedPaths", state);
}
function handleRequestAgentsTree(agentsDir, postToWebview, log2, context) {
  try {
    const dir = agentsDir;
    if (!dir || !fs.existsSync(dir)) {
      postToWebview({ type: "agentsTree", tree: null, dir: dir || "" });
      return;
    }
    const tree = buildAgentsTree(dir, 3, 0, log2);
    const expandedPaths = context ? loadExpandedPaths(context) : {};
    postToWebview({ type: "agentsTree", tree, dir, expandedPaths });
  } catch (err) {
    log2(`handleRequestAgentsTree error: ${err?.message || err}`);
    postToWebview({ type: "agentsTree", tree: null, dir: agentsDir, expandedPaths: {} });
  }
}
function handleSaveExpandedPaths(expandedPaths, context, log2) {
  try {
    saveExpandedPaths(context, expandedPaths);
    log2(`[saveExpandedPaths] saved ${Object.keys(expandedPaths).length} expanded path(s)`);
  } catch (err) {
    log2(`[saveExpandedPaths] error: ${err?.message || err}`);
  }
}

// src/modelscopeHandler.ts
var vscode = __toESM(require("vscode"));
async function handleFetchModelscopeAgents(ctx, page, pageSize, category) {
  try {
    console.log("[MS-H] handleFetchModelscopeAgents called, page:", page, "pageSize:", pageSize, "category:", category);
    const url = `https://modelscope.cn/api/v1/dolphin/agents`;
    const criterion = category ? [{
      Category: "Catalogues",
      Predicate: "contains",
      StringValues: [category]
    }] : [];
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Origin": "https://modelscope.cn",
        "Referer": `https://modelscope.cn/agents?page=${page}`,
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      },
      body: JSON.stringify({
        PageSize: pageSize,
        PageNumber: page,
        Query: "",
        Sort: "Default",
        Criterion: criterion,
        WithTopCollection: false
      })
    });
    console.log("[MS-H] API response status:", response.status, "page:", page);
    const data = await response.json();
    if (!data.Success || !data.Data || !Array.isArray(data.Data.AgentList)) {
      ctx.postToWebview({ type: "modelscopeAgentsError", error: String(data.Message || "\u8BF7\u6C42\u5931\u8D25") });
      return;
    }
    const apiTotalCount = data.Data.TotalCount;
    const batch = data.Data.AgentList.map((raw) => {
      const name = String(raw.Name || "");
      const path6 = String(raw.Path || "");
      const fullId = path6 && name ? path6 + "/" + name : name;
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
    const agents = batch;
    console.log("[MS-H] Posting result, agents count:", agents.length, "apiTotalCount:", apiTotalCount);
    ctx.postToWebview({
      type: "modelscopeAgentsResult",
      agents,
      totalCount: apiTotalCount,
      page,
      pageSize
    });
  } catch (error) {
    ctx.postToWebview({
      type: "modelscopeAgentsError",
      error: error instanceof Error ? error.message : "\u7F51\u7EDC\u9519\u8BEF"
    });
  }
}

// src/webviewHandler.ts
function filePathToFileUri(p) {
  return require("url").pathToFileURL(p).href;
}
function parseFileUriList(raw) {
  const { fileURLToPath } = require("url");
  const out = [];
  for (const line of String(raw || "").split(/\r?\n/)) {
    const t = line.trim();
    if (!t)
      continue;
    if (!/^file:/i.test(t)) {
      console.warn("[parseFileUriList] skipped non-file uri: " + t);
      continue;
    }
    try {
      const m = t.match(/^file:\/\/([^\/]+)(\/.*)?$/i);
      if (m && m[1] && m[1].toLowerCase() !== "localhost") {
        console.warn("[parseFileUriList] skipped remote file uri: " + t);
        continue;
      }
      const p = fileURLToPath(t);
      if (p)
        out.push(p);
    } catch (e) {
      console.warn('[parseFileUriList] failed to parse uri "' + t + '": ' + String(e));
    }
  }
  return out;
}
function setSystemClipboardFileList(p, isCut) {
  try {
    const absPath = path3.resolve(p);
    if (!fs2.existsSync(absPath)) {
      console.warn("[setSystemClipboardFileList] path not found: " + absPath);
      return;
    }
    const { execSync } = require("child_process");
    if (process.platform === "win32") {
      const dropEffect = isCut ? 2 : 1;
      const psScript = "[Console]::OutputEncoding = [System.Text.Encoding]::UTF8; Add-Type -AssemblyName System.Windows.Forms; $files = New-Object System.Collections.Specialized.StringCollection; $files.Add('" + absPath + "'); $data = New-Object System.Windows.Forms.DataObject; $data.SetFileDropList($files); $ms = New-Object System.IO.MemoryStream(4); $bw = New-Object System.IO.BinaryWriter($ms); $bw.Write([int]" + dropEffect + "); $bw.Flush(); $ms.Position = 0; $data.SetData('Preferred DropEffect', $ms); [System.Windows.Forms.Clipboard]::SetDataObject($data, $true); Write-Output 'CLIP_FILE_SET_OK';";
      const encoded = Buffer.from(psScript, "utf16le").toString("base64");
      try {
        const out = execSync("powershell -NoProfile -STA -EncodedCommand " + encoded, {
          timeout: 15e3,
          encoding: "utf8"
        });
        if (!String(out || "").includes("CLIP_FILE_SET_OK")) {
          console.error("[setSystemClipboardFileList] marker missing, stdout:", String(out || ""));
        } else {
          console.log("[setSystemClipboardFileList] clipboard write OK: " + absPath + (isCut ? " (cut)" : " (copy)"));
        }
      } catch (execErr) {
        console.error("[setSystemClipboardFileList] execSync failed:", execErr);
      }
    } else if (process.platform === "darwin") {
      const script = 'on run {f}\n  tell application "Finder" to set the clipboard to POSIX file f as \xABclass furl\xBB\nend run';
      try {
        execSync("osascript -e " + JSON.stringify(script) + " -- " + JSON.stringify(absPath), {
          timeout: 15e3,
          encoding: "utf8"
        });
        console.log("[setSystemClipboardFileList] clipboard write OK (darwin): " + absPath);
      } catch (execErr) {
        console.error("[setSystemClipboardFileList] osascript failed (darwin):", execErr);
      }
    } else {
      const uri = filePathToFileUri(absPath);
      const tmpUriFile = path3.join(os2.tmpdir(), "openclaw-clip-uri-" + Date.now() + ".txt");
      fs2.writeFileSync(tmpUriFile, uri + "\n", "utf8");
      const mkCommand = (bin, args) => {
        const cmd = bin + " " + args.map((a) => JSON.stringify(a)).join(" ") + " < " + JSON.stringify(tmpUriFile);
        return cmd;
      };
      let succeeded = false;
      try {
        execSync(mkCommand("xclip", ["-selection", "clipboard", "-t", "text/uri-list"]), {
          timeout: 15e3,
          encoding: "utf8"
        });
        succeeded = true;
      } catch (e1) {
        try {
          execSync(mkCommand("wl-copy", ["-t", "text/uri-list"]), {
            timeout: 15e3,
            encoding: "utf8"
          });
          succeeded = true;
        } catch (e2) {
          console.warn("[setSystemClipboardFileList] xclip/wl-copy unavailable, fallback to text uri-list");
        }
      }
      try {
        fs2.unlinkSync(tmpUriFile);
      } catch (e) {
      }
      if (succeeded) {
        console.log("[setSystemClipboardFileList] clipboard write OK (linux): " + absPath);
      } else {
        try {
          execSync(mkCommand("xclip", ["-selection", "clipboard"]), { timeout: 15e3, encoding: "utf8" });
          console.log("[setSystemClipboardFileList] clipboard write OK (linux, text fallback): " + absPath);
        } catch (e3) {
          try {
            execSync(mkCommand("wl-copy", []), { timeout: 15e3, encoding: "utf8" });
            console.log("[setSystemClipboardFileList] clipboard write OK (linux, text fallback): " + absPath);
          } catch (e4) {
            console.error("[setSystemClipboardFileList] clipboard write failed (linux):", e4);
          }
        }
      }
      return;
    }
  } catch (err) {
    console.error("[setSystemClipboardFileList] error:", err);
  }
}
function readSystemClipboardFiles() {
  try {
    const { execSync } = require("child_process");
    if (process.platform === "win32") {
      const psScript = "[Console]::OutputEncoding = [System.Text.Encoding]::UTF8; Add-Type -AssemblyName System.Windows.Forms; $files = [System.Windows.Forms.Clipboard]::GetFileDropList(); if ($files -eq $null -or $files.Count -eq 0) { Write-Output 'EMPTY'; exit; } $data = [System.Windows.Forms.Clipboard]::GetDataObject(); $op = 'copy'; if ($data -ne $null -and $data.GetDataPresent('Preferred DropEffect')) {   $ms = $data.GetData('Preferred DropEffect');   if ($ms -ne $null) { try { $ms.Position = 0; $br = New-Object System.IO.BinaryReader($ms);     $intVal = $br.ReadInt32(); $br.Close();     if ($intVal -eq 2) { $op = 'cut' } elseif ($intVal -eq 1) { $op = 'copy' }   } finally { if ($ms) { $ms.Dispose() } } } } Write-Output 'OK'; foreach ($f in $files) { Write-Output $f }; Write-Output ('OP:' + $op);";
      const encoded = Buffer.from(psScript, "utf16le").toString("base64");
      try {
        const out = execSync("powershell -NoProfile -STA -EncodedCommand " + encoded, {
          timeout: 15e3,
          encoding: "utf8"
        });
        const lines = String(out || "").trim().split(/\r\n|\n/);
        if (lines.length === 0 || lines[0] !== "OK") {
          return null;
        }
        const opLine = lines[lines.length - 1];
        if (!opLine.startsWith("OP:")) {
          return null;
        }
        const opStr = opLine.substring(3);
        const operation = opStr === "cut" ? "cut" : "copy";
        const paths = lines.slice(1, -1).map((line) => line.trim()).filter((line) => line.length > 0);
        if (paths.length === 0) {
          return null;
        }
        console.log("[readSystemClipboardFiles] read " + paths.length + " file(s) from clipboard, op=" + operation);
        return { paths, operation };
      } catch (execErr) {
        console.error("[readSystemClipboardFiles] execSync failed:", execErr);
        return null;
      }
    } else if (process.platform === "darwin") {
      const script = 'try\n  set theFiles to the clipboard as \xABclass furl\xBB\n  if theFiles is "" then return "EMPTY"\n  set out to "OK"\n  repeat with f in theFiles\n    set out to out & linefeed & (f as string)\n  end repeat\n  return out\non error\n  return "EMPTY"\nend try';
      try {
        const out = execSync("osascript -e " + JSON.stringify(script), {
          timeout: 15e3,
          encoding: "utf8"
        });
        const lines = String(out || "").trim().split(/\r?\n/);
        if (lines.length === 0 || lines[0] !== "OK") {
          return null;
        }
        const paths = parseFileUriList(lines.slice(1).join("\n"));
        if (paths.length === 0)
          return null;
        console.log("[readSystemClipboardFiles] read " + paths.length + " file(s) from clipboard (darwin)");
        return { paths, operation: "copy" };
      } catch (execErr) {
        console.error("[readSystemClipboardFiles] osascript failed (darwin):", execErr);
        return null;
      }
    } else {
      const readCmd = (bin, args) => bin + " " + args.map((a) => JSON.stringify(a)).join(" ");
      let out = null;
      try {
        out = String(execSync(readCmd("xclip", ["-selection", "clipboard", "-o", "-t", "text/uri-list"]), {
          timeout: 15e3,
          encoding: "utf8"
        }) || "");
      } catch (e1) {
        try {
          out = String(execSync(readCmd("wl-paste", ["-t", "text/uri-list"]), {
            timeout: 15e3,
            encoding: "utf8"
          }) || "");
        } catch (e2) {
          console.warn("[readSystemClipboardFiles] xclip/wl-paste unavailable (linux):", e2);
          return null;
        }
      }
      const paths = parseFileUriList(out || "");
      if (paths.length === 0)
        return null;
      console.log("[readSystemClipboardFiles] read " + paths.length + " file(s) from clipboard (linux)");
      return { paths, operation: "copy" };
    }
  } catch (err) {
    console.error("[readSystemClipboardFiles] error:", err);
    return null;
  }
}
var pendingClipboard = null;
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
      await handleRequestAgentsTree(ctx.agentsDir, ctx.postToWebview.bind(ctx), ctx.log.bind(ctx), ctx.context);
      break;
    case "saveExpandedPaths":
      if (ctx.context && msg.expandedPaths) {
        handleSaveExpandedPaths(msg.expandedPaths, ctx.context, ctx.log.bind(ctx));
      } else {
        ctx.log("[saveExpandedPaths] skipped: missing context or expandedPaths");
      }
      break;
    case "fetchModelscopeAgents":
      await handleFetchModelscopeAgents(ctx, msg.page || 1, msg.pageSize || 12, msg.category || "");
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
          const os4 = require("os");
          const tmpB64 = path3.join(os4.tmpdir(), "openclaw-clip-" + Date.now() + ".b64");
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
          vscode2.window.showErrorMessage(vscode2.l10n.t("Failed to open file") + ": " + (e?.message || e));
        }
      }
      break;
    }
    case "createAgent":
      if (msg.path) {
        vscode2.commands.executeCommand("openclaw.createAgent", vscode2.Uri.file(msg.path));
      }
      break;
    case "fileCut": {
      const p = msg.path;
      if (p) {
        pendingClipboard = { path: p, operation: "cut" };
        setSystemClipboardFileList(p, true);
        ctx.postToWebview({ type: "clipboardState", hasPendingClipboard: true });
        ctx.log("[fileCut] clipboard set: cut " + p);
      }
      break;
    }
    case "fileCopy": {
      const p = msg.path;
      if (p) {
        pendingClipboard = { path: p, operation: "copy" };
        setSystemClipboardFileList(p, false);
        ctx.postToWebview({ type: "clipboardState", hasPendingClipboard: true });
        ctx.log("[fileCopy] clipboard set: copy " + p);
      }
      break;
    }
    case "filePaste": {
      let src = pendingClipboard;
      if (!src) {
        const sysClipboard = readSystemClipboardFiles();
        if (sysClipboard && sysClipboard.paths.length > 0) {
          for (const filePath of sysClipboard.paths) {
            src = { path: filePath, operation: sysClipboard.operation };
            if (!src)
              continue;
            const targetDir2 = msg.targetDir || msg.path;
            if (!targetDir2 || !fs2.existsSync(src.path)) {
              ctx.log("[filePaste] invalid source: " + src.path);
              continue;
            }
            try {
              const srcName = path3.basename(src.path);
              let destPath = path3.join(targetDir2, srcName);
              let counter = 1;
              while (fs2.existsSync(destPath)) {
                const ext = path3.extname(srcName);
                const base = ext ? srcName.slice(0, srcName.length - ext.length) : srcName;
                destPath = path3.join(targetDir2, base + " - Copy" + (counter > 1 ? counter : "") + (ext ? ext : ""));
                counter++;
              }
              if (src.operation === "cut") {
                const srcRoot = path3.parse(src.path).root;
                const destRoot = path3.parse(destPath).root;
                if (path3.dirname(src.path) !== path3.dirname(destPath) || srcRoot !== destRoot) {
                  if (fs2.existsSync(src.path) && fs2.statSync(src.path).isDirectory()) {
                    await fs2.promises.cp(src.path, destPath, { recursive: true });
                    await fs2.promises.rm(src.path, { recursive: true, force: true });
                  } else {
                    await fs2.promises.copyFile(src.path, destPath);
                    await fs2.promises.unlink(src.path);
                  }
                } else {
                  await fs2.promises.rename(src.path, destPath);
                }
              } else {
                if (fs2.existsSync(src.path) && fs2.statSync(src.path).isDirectory()) {
                  await fs2.promises.cp(src.path, destPath, { recursive: true });
                } else {
                  await fs2.promises.copyFile(src.path, destPath);
                }
              }
              ctx.log("[filePaste] pasted " + src.path + " -> " + destPath);
              handleRequestAgentsTree(ctx.agentsDir, ctx.postToWebview.bind(ctx), ctx.log.bind(ctx), ctx.context);
            } catch (err) {
              ctx.log("[filePaste] error: " + (err?.message || err));
              vscode2.window.showErrorMessage(vscode2.l10n.t("Paste failed: {0}", String(err?.message || err)));
            }
          }
          pendingClipboard = null;
          ctx.postToWebview({ type: "clipboardState", hasPendingClipboard: false });
          break;
        } else {
          ctx.log("[filePaste] no pending clipboard");
          break;
        }
      }
      if (!src)
        break;
      const targetDir = msg.targetDir || msg.path;
      if (!targetDir || !fs2.existsSync(src.path)) {
        ctx.log("[filePaste] invalid source: " + src.path);
        break;
      }
      try {
        const srcName = path3.basename(src.path);
        let destPath = path3.join(targetDir, srcName);
        let counter = 1;
        while (fs2.existsSync(destPath)) {
          const ext = path3.extname(srcName);
          const base = ext ? srcName.slice(0, srcName.length - ext.length) : srcName;
          destPath = path3.join(targetDir, base + " - Copy" + (counter > 1 ? counter : "") + (ext ? ext : ""));
          counter++;
        }
        if (src.operation === "cut") {
          const srcRoot = path3.parse(src.path).root;
          const destRoot = path3.parse(destPath).root;
          if (path3.dirname(src.path) !== path3.dirname(destPath) || srcRoot !== destRoot) {
            if (fs2.existsSync(src.path) && fs2.statSync(src.path).isDirectory()) {
              await fs2.promises.cp(src.path, destPath, { recursive: true });
              await fs2.promises.rm(src.path, { recursive: true, force: true });
            } else {
              await fs2.promises.copyFile(src.path, destPath);
              await fs2.promises.unlink(src.path);
            }
          } else {
            await fs2.promises.rename(src.path, destPath);
          }
        } else {
          if (fs2.existsSync(src.path) && fs2.statSync(src.path).isDirectory()) {
            await fs2.promises.cp(src.path, destPath, { recursive: true });
          } else {
            await fs2.promises.copyFile(src.path, destPath);
          }
        }
        pendingClipboard = null;
        ctx.postToWebview({ type: "clipboardState", hasPendingClipboard: false });
        ctx.log("[filePaste] pasted " + src.path + " -> " + destPath);
        handleRequestAgentsTree(ctx.agentsDir, ctx.postToWebview.bind(ctx), ctx.log.bind(ctx), ctx.context);
      } catch (err) {
        ctx.log("[filePaste] error: " + (err?.message || err));
        vscode2.window.showErrorMessage(vscode2.l10n.t("Paste failed: {0}", String(err?.message || err)));
      }
      break;
    }
    case "fileDelete": {
      const filePath = msg.path;
      const fileName = msg.name;
      if (!filePath || !fs2.existsSync(filePath)) {
        ctx.log(`[fileDelete] path not found: ${filePath}`);
        vscode2.window.showErrorMessage(vscode2.l10n.t("\u6587\u4EF6/\u6587\u4EF6\u5939\u4E0D\u5B58\u5728: {0}", fileName));
        break;
      }
      const stat = fs2.statSync(filePath);
      const isDirectory = stat.isDirectory();
      const itemType = isDirectory ? "\u6587\u4EF6\u5939" : "\u6587\u4EF6";
      const choice = await vscode2.window.showWarningMessage(
        vscode2.l10n.t("\u786E\u8BA4\u5220\u9664{itemType} '{name}'?", { itemType, name: fileName }),
        { modal: true },
        vscode2.l10n.t("\u5220\u9664"),
        vscode2.l10n.t("\u53D6\u6D88")
      );
      if (choice !== vscode2.l10n.t("\u5220\u9664")) {
        break;
      }
      try {
        if (isDirectory) {
          await fs2.promises.rm(filePath, { recursive: true, force: true });
        } else {
          await fs2.promises.unlink(filePath);
        }
        ctx.log(`[fileDelete] \u6210\u529F\u5220\u9664${itemType}: ${filePath}`);
        handleRequestAgentsTree(ctx.agentsDir, ctx.postToWebview.bind(ctx), ctx.log.bind(ctx), ctx.context);
      } catch (err) {
        ctx.log(`[fileDelete] \u5220\u9664${itemType}\u5931\u8D25: ${err?.message || err}`);
        vscode2.window.showErrorMessage(
          vscode2.l10n.t("\u5220\u9664{0}\u5931\u8D25: {1}", itemType, String(err?.message || err))
        );
      }
      break;
    }
    case "fileMove": {
      const sourcePath = msg.sourcePath;
      const targetDir = msg.targetDir;
      if (!sourcePath || !targetDir || typeof sourcePath !== "string" || typeof targetDir !== "string") {
        ctx.log(`[fileMove] invalid parameters: sourcePath=${sourcePath}, targetDir=${targetDir}`);
        vscode2.window.showErrorMessage(vscode2.l10n.t("\u79FB\u52A8\u53C2\u6570\u65E0\u6548"));
        break;
      }
      if (!fs2.existsSync(sourcePath)) {
        ctx.log(`[fileMove] source not found: ${sourcePath}`);
        vscode2.window.showErrorMessage(vscode2.l10n.t("\u6E90\u8DEF\u5F84\u4E0D\u5B58\u5728: {0}", sourcePath));
        break;
      }
      if (!fs2.existsSync(targetDir)) {
        ctx.log(`[fileMove] target dir not found: ${targetDir}`);
        vscode2.window.showErrorMessage(vscode2.l10n.t("\u76EE\u6807\u76EE\u5F55\u4E0D\u5B58\u5728: {0}", targetDir));
        break;
      }
      const srcResolved = path3.resolve(sourcePath);
      const targetResolved = path3.resolve(targetDir);
      if (srcResolved === targetResolved) {
        ctx.log(`[fileMove] invalid move: source equals target`);
        vscode2.window.showErrorMessage(vscode2.l10n.t("\u6E90\u548C\u76EE\u6807\u4E0D\u80FD\u76F8\u540C"));
        break;
      }
      if (targetResolved.startsWith(srcResolved + path3.sep)) {
        ctx.log(`[fileMove] invalid move: target is inside source`);
        vscode2.window.showErrorMessage(vscode2.l10n.t("\u4E0D\u80FD\u5C06\u76EE\u5F55\u79FB\u52A8\u5230\u5176\u81EA\u8EAB\u6216\u5B50\u76EE\u5F55\u4E2D"));
        break;
      }
      const baseName = path3.basename(sourcePath);
      const destPath = path3.join(targetDir, baseName);
      if (fs2.existsSync(destPath)) {
        ctx.log(`[fileMove] destination exists: ${destPath}`);
        vscode2.window.showErrorMessage(vscode2.l10n.t("\u76EE\u6807\u4F4D\u7F6E\u5DF2\u5B58\u5728\u540C\u540D\u6587\u4EF6/\u6587\u4EF6\u5939: {0}", baseName));
        break;
      }
      try {
        await fs2.promises.rename(sourcePath, destPath);
        ctx.log(`[fileMove] moved ${sourcePath} -> ${destPath}`);
        handleRequestAgentsTree(ctx.agentsDir, ctx.postToWebview.bind(ctx), ctx.log.bind(ctx), ctx.context);
      } catch (err) {
        ctx.log(`[fileMove] error: ${err?.message || err}`);
        vscode2.window.showErrorMessage(vscode2.l10n.t("\u79FB\u52A8\u5931\u8D25: {0}", String(err?.message || err)));
      }
      break;
    }
    case "fileRename": {
      const oldPath = msg.path;
      const oldName = msg.name;
      const newName = msg.newName;
      if (!oldPath || !fs2.existsSync(oldPath)) {
        ctx.log(`[fileRename] path not found: ${oldPath}`);
        vscode2.window.showErrorMessage(vscode2.l10n.t("\u6587\u4EF6/\u6587\u4EF6\u5939\u4E0D\u5B58\u5728: {0}", oldName));
        break;
      }
      if (!newName || newName === oldName)
        break;
      const parentDir = path3.dirname(oldPath);
      const newPath = path3.join(parentDir, newName);
      try {
        await fs2.promises.rename(oldPath, newPath);
        ctx.log(`[fileRename] \u91CD\u547D\u540D\u6210\u529F: ${oldPath} -> ${newPath}`);
        handleRequestAgentsTree(ctx.agentsDir, ctx.postToWebview.bind(ctx), ctx.log.bind(ctx), ctx.context);
      } catch (err) {
        ctx.log(`[fileRename] \u91CD\u547D\u540D\u5931\u8D25: ${err?.message || err}`);
        vscode2.window.showErrorMessage(vscode2.l10n.t("\u91CD\u547D\u540D\u5931\u8D25: {0}", String(err?.message || err)));
      }
      break;
    }
    case "toggleSupervision":
      await ctx.handleToggleSupervision(msg.enabled);
      break;
    case "fileNew": {
      const dirPath = msg.path;
      if (!dirPath || !fs2.existsSync(dirPath)) {
        ctx.log(`[fileNew] path not found: ${dirPath}`);
        vscode2.window.showErrorMessage(vscode2.l10n.t("\u76EE\u5F55\u4E0D\u5B58\u5728: {0}", dirPath));
        break;
      }
      const fileName = (msg.name || "").trim();
      if (!fileName) {
        ctx.log(`[fileNew] \u6587\u4EF6\u540D\u4E3A\u7A7A`);
        break;
      }
      const newFilePath = path3.join(dirPath, fileName);
      try {
        await fs2.promises.writeFile(newFilePath, "");
        ctx.log(`[fileNew] \u521B\u5EFA\u6587\u4EF6\u6210\u529F: ${newFilePath}`);
        handleRequestAgentsTree(ctx.agentsDir, ctx.postToWebview.bind(ctx), ctx.log.bind(ctx), ctx.context);
      } catch (err) {
        ctx.log(`[fileNew] \u521B\u5EFA\u6587\u4EF6\u5931\u8D25: ${err?.message || err}`);
        vscode2.window.showErrorMessage(vscode2.l10n.t("\u521B\u5EFA\u6587\u4EF6\u5931\u8D25: {0}", String(err?.message || err)));
      }
      break;
    }
    case "folderNew": {
      const dirPath = msg.path;
      if (!dirPath || !fs2.existsSync(dirPath)) {
        ctx.log(`[folderNew] path not found: ${dirPath}`);
        vscode2.window.showErrorMessage(vscode2.l10n.t("\u76EE\u5F55\u4E0D\u5B58\u5728: {0}", dirPath));
        break;
      }
      const folderName = (msg.name || "").trim();
      if (!folderName) {
        ctx.log(`[folderNew] \u6587\u4EF6\u5939\u540D\u4E3A\u7A7A`);
        break;
      }
      const newFolderPath = path3.join(dirPath, folderName);
      try {
        await fs2.promises.mkdir(newFolderPath, { recursive: true });
        ctx.log(`[folderNew] \u521B\u5EFA\u6587\u4EF6\u5939\u6210\u529F: ${newFolderPath}`);
        handleRequestAgentsTree(ctx.agentsDir, ctx.postToWebview.bind(ctx), ctx.log.bind(ctx), ctx.context);
      } catch (err) {
        ctx.log(`[folderNew] \u521B\u5EFA\u6587\u4EF6\u5939\u5931\u8D25: ${err?.message || err}`);
        vscode2.window.showErrorMessage(vscode2.l10n.t("\u521B\u5EFA\u6587\u4EF6\u5939\u5931\u8D25: {0}", String(err?.message || err)));
      }
      break;
    }
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
    const allTasks = res?.tasks || [];
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
    const models = res?.models || [];
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
    const agents = res?.agents || [];
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
  position: relative;
}
/* \u2500\u2500 Custom hover tooltip for truncated description \u2500\u2500 */
.ms-desc-tooltip {
  display: none;
  position: fixed;
  max-width: 26ch;
  min-width: 120px;
  background: var(--bg2, #252526);
  border: 1px solid var(--border, #444);
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 12px;
  color: var(--text, #cccccc);
  line-height: 1.55;
  word-break: break-word;
  white-space: normal;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);
  z-index: 10000;
  pointer-events: none;
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
/* \u2500\u2500 Context Menu \u2500\u2500 */
.ms-context-menu {
  display: none;
  position: fixed;
  z-index: 99999;
  background: var(--bg2, #252526);
  border: 1px solid var(--border, #444);
  border-radius: 8px;
  box-shadow: 0 6px 24px rgba(0,0,0,0.45);
  min-width: 180px;
  padding: 4px 0;
  overflow: hidden;
}
.ms-context-menu.visible {
  display: block;
}
.ms-context-menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 14px;
  font-size: 12px;
  color: var(--text, #cccccc);
  cursor: pointer;
  transition: background 0.12s;
  white-space: nowrap;
}
.ms-context-menu-item:hover {
  background: var(--hover, rgba(128,128,128,0.14));
  color: #fff;
}
.ms-context-menu-item .menu-icon {
  width: 16px;
  text-align: center;
  flex-shrink: 0;
}
.ms-context-menu-sep {
  height: 1px;
  background: var(--border, #444);
  margin: 4px 8px;
}
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
/* \u641C\u7D22\u6846\u6837\u5F0F */
.modelscope-search {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px 4px;
}
.modelscope-search-input {
  flex: 1;
  padding: 6px 12px;
  border: 1px solid var(--input-border);
  border-radius: 6px;
  background: var(--input-bg);
  color: var(--text);
  font-size: 12px;
  font-family: inherit;
  outline: none;
  transition: border-color 0.15s;
}
.modelscope-search-input:focus {
  border-color: var(--accent);
}
.modelscope-search-clear {
  padding: 6px 12px;
  border: 1px solid var(--input-border);
  border-radius: 6px;
  background: transparent;
  color: var(--text-muted);
  font-size: 12px;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  white-space: nowrap;
}
.modelscope-search-clear:hover {
  background: var(--hover);
  color: var(--text);
}
/* \u5206\u7C7B\u6807\u7B7E\u533A\uFF1A\u641C\u7D22\u6846\u4E0B\u65B9\uFF0C\u6A2A\u5411\u6392\u5217\uFF0C\u53EF\u6EDA\u52A8 */
.modelscope-categories {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  overflow-x: auto;
  flex-shrink: 0;
}
.modelscope-categories::-webkit-scrollbar { height: 4px; }
.modelscope-categories::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }
.modelscope-cat-tag {
  padding: 4px 12px;
  border: 1px solid var(--input-border);
  border-radius: 999px;
  background: transparent;
  color: var(--text-muted);
  font-size: 12px;
  font-family: inherit;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}
.modelscope-cat-tag:hover {
  background: var(--hover);
  color: var(--text);
}
.modelscope-cat-tag.active {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
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
.modelscope-page-input {
  width: 50px;
  text-align: center;
  padding: 2px 4px;
  border: 1px solid var(--input-border);
  border-radius: 4px;
  background: var(--input-bg);
  color: var(--text);
  font-size: 12px;
  font-family: inherit;
  outline: none;
  transition: border-color 0.15s;
}
.modelscope-page-input:focus {
  border-color: var(--accent);
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
            <div id="modelscope-search" class="modelscope-search" style="display:none;">
              <input type="text" id="modelscope-search-input" class="modelscope-search-input" placeholder="\u641C\u7D22 Modelscope Agents (\u540D\u79F0\u3001\u63CF\u8FF0\u3001\u6807\u7B7E...)">
              <button type="button" id="modelscope-search-clear" class="modelscope-search-clear" title="\u6E05\u9664\u641C\u7D22">\u6E05\u9664\u641C\u7D22</button>
            </div>
            <div id="modelscope-categories" class="modelscope-categories" style="display:none;"></div>
            <div id="modelscope-grid" class="modelscope-grid"></div>
            <!-- \u53F3\u952E\u83DC\u5355\u5BB9\u5668 -->
            <div id="ms-context-menu" class="ms-context-menu">
              <div class="ms-context-menu-item" data-action="download-local"><span class="menu-icon">&#128229;</span><span>\u4E0B\u8F7D\u5230\u672C\u5730</span></div>
              <div class="ms-context-menu-item" data-action="download-select"><span class="menu-icon">&#128193;</span><span>\u4E0B\u8F7D\u5230\u2026</span></div>
              <div class="ms-context-menu-sep"></div>
              <div class="ms-context-menu-item" data-action="open-detail"><span class="menu-icon">&#128279;</span><span>\u67E5\u770B\u8BE6\u60C5</span></div>
            </div>
            <div id="modelscope-loading" class="modelscope-loading" style="display:none;"><div class="modelscope-loading-spinner"></div>\u6B63\u5728\u52A0\u8F7D ModelScope \u667A\u80FD\u4F53...</div>
            <div id="modelscope-error" class="modelscope-error" style="display:none;"></div>
            <div id="modelscope-empty" class="modelscope-empty" style="display:none;">\u6682\u65E0\u667A\u80FD\u4F53</div>
            <div id="modelscope-no-results" class="modelscope-empty" style="display:none;">\u65E0\u5339\u914D\u7ED3\u679C</div>
            <div id="modelscope-pagination" class="modelscope-pagination" style="display:none;">
              <button id="modelscope-prev" class="modelscope-page-btn" disabled>\u4E0A\u4E00\u9875</button>
              <span class="modelscope-page-info">\u7B2C <input type="number" id="modelscope-page-input" class="modelscope-page-input" value="1" min="1" max="1" style="width:50px;text-align:center;"> / <span id="modelscope-page-total">1</span> \u9875 (\u5171 <span id="modelscope-page-count">0</span>)</span>
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

  // \u5206\u7C7B\u6620\u5C04\u8868\uFF1A\u4E2D\u6587\u6807\u7B7E \u2192 \u82F1\u6587\u5206\u7C7B\u540D\uFF08Criterion \u67E5\u8BE2\u7528\uFF09
  // \u6587\u6863\u6765\u6E90\uFF1Amodelscope-categories-final.md \u4E2D\u82F1\u6587\u6620\u5C04\u8868
  var MODELSCOPE_CATEGORIES = [
    { label: '\u5168\u90E8', value: '' },
    { label: '\u5F00\u53D1\u5DE5\u5177', value: 'development-tools' },
    { label: '\u6559\u80B2', value: 'education' },
    { label: '\u8BBE\u8BA1', value: 'design' },
    { label: '\u5E02\u573A\u8425\u9500', value: 'marketing' },
    { label: '\u9500\u552E', value: 'sales' },
    { label: '\u4EA7\u54C1', value: 'product' },
    { label: '\u91D1\u878D', value: 'finance' },
    { label: '\u751F\u6D3B\u52A9\u7406', value: 'life-assistant' },
    { label: '\u5A31\u4E50', value: 'entertainment' },
    { label: '\u5176\u4ED6', value: 'others' }
  ];

  // \u6E32\u67D3\u5206\u7C7B\u6807\u7B7E\u533A\uFF08\u4E8B\u4EF6\u59D4\u6258\uFF0C\u7ED1\u5B9A\u4E00\u6B21\uFF09
  function renderModelscopeCategories() {
    var el = document.getElementById('modelscope-categories');
    if (!el || el.children.length > 0) return; // \u5DF2\u6E32\u67D3\u5219\u8DF3\u8FC7
    var html = '';
    for (var i = 0; i < MODELSCOPE_CATEGORIES.length; i++) {
      var c = MODELSCOPE_CATEGORIES[i];
      html += '<button type="button" class="modelscope-cat-tag' + (c.value === (modelscopeState.category || '') ? ' active' : '') + '"'
        + ' data-category="' + c.value + '" title="' + (c.value || '\u6E05\u9664\u5206\u7C7B\u7B5B\u9009\uFF0C\u67E5\u770B\u5168\u90E8') + '">' + c.label + '</button>';
    }
    el.innerHTML = html;
  }

  // \u9AD8\u4EAE\u5F53\u524D\u9009\u4E2D\u7684\u5206\u7C7B\u6807\u7B7E
  function updateModelscopeCategoryHighlight() {
    var el = document.getElementById('modelscope-categories');
    if (!el) return;
    el.querySelectorAll('.modelscope-cat-tag').forEach(function(t) {
      t.classList.toggle('active', (t.getAttribute('data-category') || '') === (modelscopeState.category || ''));
    });
  }

  // \u5207\u6362\u5206\u7C7B\uFF1A\u91CD\u7F6E PageNumber=1\uFF0C\u6E05\u9664\u641C\u7D22\u5173\u952E\u8BCD\uFF0C\u6309\u65B0\u5206\u7C7B\u91CD\u65B0\u62C9\u53D6
  function selectModelscopeCategory(category) {
    if (modelscopeState.category === category) return; // \u91CD\u590D\u70B9\u51FB\u540C\u4E00\u5206\u7C7B
    modelscopeState.category = category;
    updateModelscopeCategoryHighlight();
    var searchInputEl = document.getElementById('modelscope-search-input');
    if (searchInputEl && searchInputEl.value) {
      searchInputEl.value = '';
    }
    modelscopeState.searchKeyword = '';
    modelscopeState.page = 1;
    fetchModelscopeAgents(1, category);
  }

  // Build ModelScope download URL from agentId
  // agentId format: "ms-agent/foo" or "@user/Bar"
  function buildModelscopeDownloadUrl(agentId) {
    if (!agentId) return '';
    // Strip leading slash if present
    var id = agentId.replace(/^\\//, '');
    return 'https://modelscope.cn/agents/' + id + '/archive/zip/master';
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
    // \u641C\u7D22\u6846\u4EC5\u5728 ModelScope \u9875\u7B7E\u6FC0\u6D3B\u4E14\u5DF2\u6709\u6570\u636E\u65F6\u663E\u793A
    var searchEl = document.getElementById('modelscope-search');
    if (searchEl) searchEl.style.display = (tab === 'modelscope' && modelscopeState.agents && modelscopeState.agents.length > 0) ? 'flex' : 'none';
    console.log('[MS] switchAgentsSubTab: panelId=' + panelId, 'panel class=' + (panel ? panel.className : 'null'), 'panel display=' + (panel ? getComputedStyle(panel).display : 'null'));
    // \u5206\u7C7B\u6807\u7B7E\u533A\u4E0E\u641C\u7D22\u6846\u540C\u6B65\u663E\u793A/\u9690\u85CF\uFF08\u6570\u636E\u52A0\u8F7D\u540E\u624D\u6709\u610F\u4E49\uFF09
    var catEl = document.getElementById('modelscope-categories');
    if (catEl) catEl.style.display = (tab === 'modelscope' && modelscopeState.loaded) ? 'flex' : 'none';
    if (tab === 'local') {
      // \u5207\u6362\u5230\u672C\u5730 Tab \u65F6\uFF0C\u91CD\u65B0\u52A0\u8F7D\u76EE\u5F55\u6811\uFF08\u4ECE\u6587\u4EF6\u7CFB\u7EDF\u5237\u65B0\uFF09
      console.log('[MS] switchAgentsSubTab: refreshing local agents tree');
      vscode.postMessage({ type: 'requestAgentsTree' });
    }
    if (tab === 'modelscope') {
      if (!modelscopeState.loaded && !modelscopeState.loading) {
        console.log('[MS] calling fetchModelscopeAgents(1)');
        fetchModelscopeAgents(1);
      }
    }
  }

  // Fetch ModelScope agents from extension host
  // category: \u82F1\u6587\u5206\u7C7B\u540D\uFF08\u5982 'finance'\uFF09\uFF0C\u7A7A\u5B57\u7B26\u4E32/undefined = \u5168\u90E8
  function fetchModelscopeAgents(page, category) {
    console.log('[MS] fetchModelscopeAgents called, page:', page, 'category:', category, 'modelscopeState.page before:', modelscopeState.page);
    // \u5206\u9875\u64CD\u4F5C\u65F6\u81EA\u52A8\u6E05\u9664\u641C\u7D22\u5173\u952E\u8BCD\uFF0C\u907F\u514D\u65B0\u9875\u6570\u636E\u88AB\u65E7\u641C\u7D22\u8FC7\u6EE4
    var searchInputEl = document.getElementById('modelscope-search-input');
    if (searchInputEl && searchInputEl.value) {
      searchInputEl.value = '';
    }
    modelscopeState.searchKeyword = '';
    modelscopeState.loading = true;
    modelscopeState.page = page;
    // \u5206\u7C7B\uFF1A\u672A\u4F20\u53C2\u5219\u6CBF\u7528\u5F53\u524D state.category\uFF08\u5982\u4ECE\u5206\u9875\u6309\u94AE\u8FDB\u6765\uFF09\uFF1B\u4F20\u5165\u7A7A\u5B57\u7B26\u4E32\u8868\u793A\u5207\u56DE\u5168\u90E8
    if (category !== undefined) modelscopeState.category = category;
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
    console.log('[MS] posting fetchModelscopeAgents message, page:', page, 'pageSize:', modelscopeState.pageSize, 'category:', modelscopeState.category);
    var noResultsEl = document.getElementById('modelscope-no-results');
    if (noResultsEl) noResultsEl.style.display = 'none';
    var catEl = document.getElementById('modelscope-categories');
    if (catEl && modelscopeState.loaded) catEl.style.display = 'flex';
    vscode.postMessage({ type: 'fetchModelscopeAgents', page: page, pageSize: modelscopeState.pageSize, category: modelscopeState.category || '' });
  }

  // \u6309\u5173\u952E\u8BCD\u672C\u5730\u8FC7\u6EE4 Agent \u5217\u8868\uFF08\u5339\u914D display_name/name/description/categories/custom_tags\uFF09
  function filterAgentsByKeyword(keyword, agents) {
    if (!keyword) return agents;
    var kw = keyword.toLowerCase().trim();
    return agents.filter(function(a) {
      var haystack = (a.display_name || '') + ' ' + (a.name || '') + ' ' +
        (a.description || '') + ' ' + (a.categories || []).join(' ') + ' ' +
        (a.custom_tags || []).join(' ');
      return haystack.toLowerCase().indexOf(kw) >= 0;
    });
  }

  // \u6267\u884C\u672C\u5730\u641C\u7D22\u8FC7\u6EE4\uFF1A\u4F5C\u7528\u4E8E\u5F53\u524D\u9875\u5DF2\u52A0\u8F7D\u5217\u8868\uFF1B\u641C\u7D22\u6FC0\u6D3B\u65F6\u9690\u85CF\u5206\u9875
  function applyModelscopeSearch() {
    var input = document.getElementById('modelscope-search-input');
    var keyword = input ? input.value : '';
    modelscopeState.searchKeyword = keyword;
    var agents = modelscopeState.agents || [];
    var filtered = filterAgentsByKeyword(keyword, agents);
    console.log('[MS-Search] keyword:', keyword, 'loaded:', agents.length, 'matched:', filtered.length);
    var noResultsEl = document.getElementById('modelscope-no-results');
    var emptyEl = document.getElementById('modelscope-empty');
    var paginationEl = document.getElementById('modelscope-pagination');
    if (keyword.trim()) {
      // \u641C\u7D22\u6FC0\u6D3B\uFF1A\u9690\u85CF\u5206\u9875\uFF0C\u663E\u793A\u8FC7\u6EE4\u7ED3\u679C\u6216"\u65E0\u5339\u914D\u7ED3\u679C"\u5360\u4F4D
      if (paginationEl) paginationEl.style.display = 'none';
      if (emptyEl) emptyEl.style.display = 'none';
      if (filtered.length === 0) {
        var grid = document.getElementById('modelscope-grid');
        if (grid) grid.innerHTML = '';
        if (noResultsEl) noResultsEl.style.display = 'block';
      } else {
        if (noResultsEl) noResultsEl.style.display = 'none';
        renderModelscopeGrid(filtered);
      }
    } else {
      // \u6E05\u9664\u641C\u7D22\uFF1A\u6062\u590D\u5B8C\u6574\u5217\u8868\u4E0E\u5206\u9875\u63A7\u4EF6
      if (noResultsEl) noResultsEl.style.display = 'none';
      if (agents.length === 0) {
        if (emptyEl && modelscopeState.loaded) emptyEl.style.display = 'block';
      } else {
        if (emptyEl) emptyEl.style.display = 'none';
        renderModelscopeGrid(agents);
        renderModelscopePagination();
      }
    }
  }

  // \u641C\u7D22\u8F93\u5165\u9632\u6296\uFF1A300ms \u540E\u6267\u884C\u672C\u5730\u8FC7\u6EE4\uFF0C\u907F\u514D\u9891\u7E41\u89E6\u53D1
  var msSearchTimer = null;
  function onModelscopeSearchInput() {
    if (msSearchTimer) clearTimeout(msSearchTimer);
    msSearchTimer = setTimeout(applyModelscopeSearch, 300);
  }

  // Open agent detail on modelscope.cn
  function openModelscopeAgent(agentId) {
    vscode.postMessage({ type: 'openModelscopeAgent', agentId: agentId });
  }

  // Render agent cards grid (event delegation, no inline handlers)
  function renderModelscopeGrid(agents) {
    console.log('[MS] renderModelscopeGrid called with', agents.length, 'agents');
    if (agents.length > 0) {
      console.log('[MS] First agent:', JSON.stringify(agents[0]));
    }
    var grid = document.getElementById('modelscope-grid');
    if (!grid) {
      console.log('[MS] ERROR: modelscope-grid element not found');
      return;
    }
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
        + '<div class="modelscope-card-desc"' + ((a.description || '').length > 40 ? ' data-full-desc="' + escapeHtml(a.description) + '"' : '') + '>'
        + escapeHtml((a.description || '').substring(0, 120))
        + '</div>'
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
  }

  // Render pagination controls
  function renderModelscopePagination() {
    var totalPages = Math.max(1, Math.ceil(modelscopeState.totalCount / modelscopeState.pageSize));
    console.log('[MS] renderModelscopePagination, page:', modelscopeState.page, 'totalPages:', totalPages, 'totalCount:', modelscopeState.totalCount);
    var pageInputEl = document.getElementById('modelscope-page-input');
    var pageTotalEl = document.getElementById('modelscope-page-total');
    var pageCountEl = document.getElementById('modelscope-page-count');
    var prevBtn = document.getElementById('modelscope-prev');
    var nextBtn = document.getElementById('modelscope-next');
    var paginationEl = document.getElementById('modelscope-pagination');
    if (pageInputEl) {
      pageInputEl.value = modelscopeState.page;
      pageInputEl.max = String(totalPages);
    }
    if (pageTotalEl) pageTotalEl.textContent = String(totalPages);
    if (pageCountEl) pageCountEl.textContent = String(modelscopeState.totalCount);
    if (prevBtn) prevBtn.disabled = modelscopeState.page <= 1;
    if (nextBtn) nextBtn.disabled = modelscopeState.page >= totalPages;
    if (paginationEl) paginationEl.style.display = 'flex';
  }
  // ModelScope pagination buttons
  var msPrevBtn = document.getElementById('modelscope-prev');
  var msNextBtn = document.getElementById('modelscope-next');
  if (msPrevBtn) {
    msPrevBtn.addEventListener('click', function() {
      var pageInputEl = document.getElementById('modelscope-page-input');
      var currentPage = parseInt(pageInputEl.value, 10) || 1;
      if (currentPage > 1) fetchModelscopeAgents(currentPage - 1);
    });
  }
  if (msNextBtn) {
    msNextBtn.addEventListener('click', function() {
      var pageInputEl = document.getElementById('modelscope-page-input');
      var currentPage = parseInt(pageInputEl.value, 10) || 1;
      fetchModelscopeAgents(currentPage + 1);
    });
  }

  // \u9875\u7801\u8F93\u5165\u6846\uFF1A\u53EA\u5141\u8BB8\u6570\u5B57 + \u56DE\u8F66\u8DF3\u8F6C\u6307\u5B9A\u9875
  var msPageInput = document.getElementById('modelscope-page-input');
  if (msPageInput) {
    // \u9650\u5236\u53EA\u80FD\u8F93\u5165\u6570\u5B57\uFF08type=number \u4E5F\u8FC7\u6EE4 e/+/- \u7B49\u5B57\u7B26\uFF09
    msPageInput.addEventListener('input', function() {
      this.value = this.value.replace(/[^0-9]/g, '');
    });
    // Enter \u952E\uFF1A\u6821\u9A8C\u9875\u7801\u8303\u56F4\u540E\u8DF3\u9875
    msPageInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        var totalPages = Math.max(1, Math.ceil(modelscopeState.totalCount / modelscopeState.pageSize));
        var page = parseInt(this.value, 10);
        if (isNaN(page) || page < 1 || page > totalPages) {
          // \u975E\u6CD5\u9875\u7801\uFF1A\u6062\u590D\u4E3A\u5F53\u524D\u9875\u5E76\u5931\u7126
          this.value = modelscopeState.page;
          this.blur();
          return;
        }
        if (page === modelscopeState.page) {
          // \u9875\u7801\u672A\u53D8\u5316\uFF1A\u4EC5\u5931\u7126
          this.blur();
          return;
        }
        // \u6E05\u9664\u641C\u7D22\u72B6\u6001\uFF0C\u907F\u514D\u65B0\u9875\u6570\u636E\u88AB\u65E7\u641C\u7D22\u5173\u952E\u8BCD\u8FC7\u6EE4
        var searchInput = document.getElementById('modelscope-search-input');
        if (searchInput && searchInput.value) {
          searchInput.value = '';
        }
        modelscopeState.searchKeyword = '';
        // \u4FDD\u7559\u5F53\u524D\u5206\u7C7B\u7B5B\u9009\uFF0C\u8DF3\u8F6C\u9875\u7801\u65F6\u4F7F\u7528
        fetchModelscopeAgents(page, modelscopeState.category);
        this.blur();
      }
    });
  }

  // \u641C\u7D22\u8F93\u5165\u6846\u7ED1\u5B9A\uFF1Ainput \u4E8B\u4EF6 + 300ms \u9632\u6296\u89E6\u53D1\u672C\u5730\u8FC7\u6EE4
  var msSearchInput = document.getElementById('modelscope-search-input');
  if (msSearchInput) {
    msSearchInput.addEventListener('input', onModelscopeSearchInput);
  }
  // \u6E05\u9664\u641C\u7D22\u6309\u94AE\uFF1A\u6E05\u7A7A\u8F93\u5165\u5E76\u6062\u590D\u5B8C\u6574\u5217\u8868
  var msSearchClear = document.getElementById('modelscope-search-clear');
  if (msSearchClear) {
    msSearchClear.addEventListener('click', function() {
      var input = document.getElementById('modelscope-search-input');
      if (input) input.value = '';
      applyModelscopeSearch();
    });
  }

  // \u5206\u7C7B\u6807\u7B7E\u70B9\u51FB\u4E8B\u4EF6\uFF08\u4E8B\u4EF6\u59D4\u6258\uFF0C\u7ED1\u5B9A\u4E00\u6B21\uFF1B\u6807\u7B7E\u5185\u5BB9\u7531 renderModelscopeCategories \u751F\u6210\uFF09
  var msCategories = document.getElementById('modelscope-categories');
  if (msCategories) {
    msCategories.addEventListener('click', function(e) {
      var tag = e.target.closest('.modelscope-cat-tag');
      if (!tag) return;
      selectModelscopeCategory(tag.getAttribute('data-category') || '');
    });
  }

  // \u2500\u2500 Context Menu \u2500\u2500
  var msContextMenu = document.getElementById('ms-context-menu');
  var msMenuAgentId = null;

  function _closeMsContextMenu() {
    if (msContextMenu) msContextMenu.classList.remove('visible');
    msMenuAgentId = null;
  }
  // Close on any outside click / scroll / escape
  document.addEventListener('click', function(e) {
    if (!msContextMenu || msContextMenu === e.target) return;
    if (!msContextMenu.contains(e.target)) _closeMsContextMenu();
  });
  document.addEventListener('contextmenu', function() { _closeMsContextMenu(); });
  document.addEventListener('scroll', _closeMsContextMenu, true);
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') _closeMsContextMenu();
  });

  // Context menu item click handler
  if (msContextMenu) {
    msContextMenu.addEventListener('click', function(e) {
      var item = e.target.closest('.ms-context-menu-item');
      if (!item || !msMenuAgentId) return;
      var action = item.getAttribute('data-action');
      if (action === 'download-local') {
        vscode.postMessage({ type: 'downloadModelscopeAgent', agentId: msMenuAgentId, destType: 'local' });
      } else if (action === 'download-select') {
        vscode.postMessage({ type: 'downloadModelscopeAgent', agentId: msMenuAgentId, destType: 'select' });
      } else if (action === 'open-detail') {
        openModelscopeAgent(msMenuAgentId);
      }
      _closeMsContextMenu();
    });
  }

  // Initialize event delegation for ModelScope grid (bind ONCE)
  var msGrid = document.getElementById('modelscope-grid');
  if (msGrid) {
    // Context menu on right-click
    msGrid.addEventListener('contextmenu', function(e) {
      var card = e.target.closest('.modelscope-agent-card');
      if (!card) return;
      e.preventDefault();
      e.stopPropagation();
      msMenuAgentId = card.dataset.agentId;
      if (msContextMenu) {
        var x = e.clientX, y = e.clientY;
        // Keep menu inside viewport
        var mw = 200, mh = 120;
        if (x + mw > window.innerWidth) x = window.innerWidth - mw - 4;
        if (y + mh > window.innerHeight) y = window.innerHeight - mh - 4;
        if (x < 4) x = 4;
        if (y < 4) y = 4;
        msContextMenu.style.left = x + 'px';
        msContextMenu.style.top = y + 'px';
        msContextMenu.classList.add('visible');
      }
    });

    msGrid.addEventListener('click', function(e) {
      var openBtn = e.target.closest('.modelscope-open-btn');
      if (openBtn) {
        e.stopPropagation();
        openModelscopeAgent(openBtn.dataset.agentId);
        return;
      }
      var card = e.target.closest('.modelscope-agent-card');
      if (card) openModelscopeAgent(card.dataset.agentId);
    });

    // \u2500\u2500 Tooltip hover handler for truncated descriptions \u2500\u2500
    // Tooltip is dynamically created and appended to document.body to escape
    // the parent's -webkit-line-clamp overflow:hidden clipping in webviews.
    var msTooltipEl = null;
    function _createMsTooltip(el) {
      if (!msTooltipEl) {
        msTooltipEl = document.createElement('div');
        msTooltipEl.className = 'ms-desc-tooltip';
        document.body.appendChild(msTooltipEl);
      }
      msTooltipEl.textContent = el.getAttribute('data-full-desc') || '';
    }
    function _positionMsTooltip(tipEl, descEl) {
      var rect = descEl.getBoundingClientRect();
      var tipRect = tipEl.getBoundingClientRect();
      var top = rect.bottom + 4;
      var left = rect.left;
      if (left + 220 > window.innerWidth) left = window.innerWidth - 230;
      if (left < 10) left = 10;
      if (top + tipRect.height > window.innerHeight - 10) {
        top = rect.top - tipRect.height - 4;
      }
      tipEl.style.top = Math.max(4, top) + 'px';
      tipEl.style.left = left + 'px';
    }
    msGrid.addEventListener('mouseover', function(e) {
      var desc = e.target.closest('.modelscope-card-desc[data-full-desc]');
      if (!desc) return;
      _createMsTooltip(desc);
      if (!msTooltipEl) return;
      _positionMsTooltip(msTooltipEl, desc);
      msTooltipEl.style.display = 'block';
    }, true);
    msGrid.addEventListener('mouseout', function(e) {
      var desc = e.target.closest('.modelscope-card-desc[data-full-desc]');
      if (!desc) return;
      var related = e.relatedTarget;
      if (related && desc.contains(related)) return;
      if (msTooltipEl) msTooltipEl.style.display = 'none';
    }, true);
  }
  // \u521D\u59CB\u5316\u5206\u7C7B\u6807\u7B7E\u533A
  renderModelscopeCategories();
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
.agents-tree-item.dragging {
  opacity: 0.4;
  background-color: rgba(0, 120, 215, 0.2);
}
.agents-tree-item.drag-over {
  background-color: rgba(0, 120, 215, 0.3);
  outline: 2px solid var(--accent, #3794ff);
  outline-offset: -2px;
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
/* Agents Tree Context Menu */
.agents-tree-context-menu {
  display: none;
  position: fixed;
  z-index: 99999;
  background: var(--bg2, #252526);
  border: 1px solid var(--border, #444);
  border-radius: 8px;
  box-shadow: 0 6px 24px rgba(0,0,0,0.45);
  min-width: 180px;
  padding: 4px 0;
  overflow: hidden;
  font-size: 12px;
}
.agents-tree-context-menu.visible {
  display: block;
}
.agents-tree-context-menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 14px;
  cursor: pointer;
  white-space: nowrap;
  color: var(--text, #cccccc);
  transition: background 0.12s;
}
.agents-tree-context-menu-item:hover {
  background: var(--hover, rgba(128,128,128,0.14));
}
.agents-tree-context-menu-item-disabled {
  color: var(--text-muted, #777777);
  cursor: default;
  pointer-events: none;
}
.agents-tree-context-menu-separator {
  height: 1px;
  margin: 4px 0;
  background: var(--border, #444);
}
/* Agents Tree Inline Rename\uFF08\u539F\u5730\u91CD\u547D\u540D\u8F93\u5165\u6846\uFF09 */
.agents-tree-item.editing {
  background-color: rgba(0, 120, 215, 0.2);
  outline: 1px solid var(--accent, #3794ff);
  outline-offset: -1px;
  border-radius: 4px;
  transition: background-color 0.15s ease;
}
.agents-tree-rename-input {
  flex: 1;
  min-width: 0;
  font-family: inherit;
  font-size: inherit;
  font-weight: inherit;
  color: var(--text, #cccccc);
  background: var(--input-bg, #3c3c3c);
  border: 1px solid var(--accent, #3794ff);
  border-radius: 3px;
  padding: 1px 4px;
  margin: 0;
  outline: none;
  box-shadow: 0 0 0 2px rgba(0, 120, 215, 0.25);
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
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
  let agentTreeHasPendingClipboard = false;
  // \u667A\u80FD\u4F53\u76EE\u5F55\u6811\u5C55\u5F00\u72B6\u6001\uFF08key: \u76EE\u5F55\u8DEF\u5F84\uFF0Cvalue: true=\u5C55\u5F00\uFF09
  // \u53CC\u7AEF\u6301\u4E45\u5316\uFF1Awebview \u4FA7\u5148\u5199\u5165 localStorage\uFF0C\u518D\u540C\u6B65\u7ED9 host \u5B58\u5165 globalState
  let agentsTreeExpandedPaths = {};
  const AGENTS_TREE_EXPANDED_KEY = 'openclaw.agentsTreeExpandedPaths';
  function loadAgentsTreeExpandedPaths() {
    try {
      var raw = localStorage.getItem(AGENTS_TREE_EXPANDED_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') agentsTreeExpandedPaths = parsed;
      }
    } catch (e) { agentsTreeExpandedPaths = {}; }
  }
  function saveAgentsTreeExpandedPaths() {
    try {
      localStorage.setItem(AGENTS_TREE_EXPANDED_KEY, JSON.stringify(agentsTreeExpandedPaths));
    } catch (e) { /* localStorage \u4E0D\u53EF\u7528\u65F6\u5FFD\u7565 */ }
    if (typeof vscode !== 'undefined') {
      vscode.postMessage({ type: 'saveExpandedPaths', expandedPaths: agentsTreeExpandedPaths });
    }
  }
  loadAgentsTreeExpandedPaths();
  // ModelScope agents state
  let modelscopeState = {
    page: 1,
    pageSize: 12,
    totalCount: 0,
    agents: [],
    loading: false,
    loaded: false,
    searchKeyword: '',
    category: ''
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
        agentTreeHasPendingClipboard = msg.hasPendingClipboard ?? false;
        // \u63A5\u6536 host \u4F20\u6765\u7684\u5C55\u5F00\u72B6\u6001\uFF08globalState \u6301\u4E45\u5316\uFF09\uFF0C\u8986\u76D6\u672C\u5730\uFF08\u542B localStorage\uFF09
        if (msg.expandedPaths && typeof msg.expandedPaths === 'object') {
          agentsTreeExpandedPaths = msg.expandedPaths;
          try {
            localStorage.setItem(AGENTS_TREE_EXPANDED_KEY, JSON.stringify(agentsTreeExpandedPaths));
          } catch (e) { /* ignore */ }
        }
        renderLocalAgentsTree();
        break;
      case 'clipboardState':
        // host \u5728 fileCut/fileCopy/filePaste \u540E\u63A8\u9001\u526A\u8D34\u677F\u72B6\u6001\uFF0C\u4EC5\u66F4\u65B0\u7C98\u8D34\u83DC\u5355\u7684\u53EF\u7528\u6027\u6807\u5FD7
        agentTreeHasPendingClipboard = msg.hasPendingClipboard ?? false;
        break;
      case 'modelscopeAgentsResult':
        console.log('[MS] modelscopeAgentsResult handler, agents count:', msg.agents ? msg.agents.length : 0);
        console.log('[MS] Received page:', msg.page, 'totalCount:', msg.totalCount);
        modelscopeState.loading = false;
        modelscopeState.loaded = true;
        modelscopeState.agents = msg.agents || [];
        modelscopeState.totalCount = msg.totalCount || 0;
        modelscopeState.page = msg.page || 1;
        // \u540C\u6B65\u540E\u7AEF\u5B9E\u9645\u8FD4\u56DE\u7684 pageSize\uFF08\u54CD\u5E94\u4E2D\u643A\u5E26\uFF09\uFF0C\u907F\u514D\u524D\u7AEF\u59CB\u7EC8\u6309\u521D\u59CB\u503C\u6E32\u67D3
        if (msg.pageSize && msg.pageSize > 0) modelscopeState.pageSize = msg.pageSize;
        console.log('[MS] Updated state - page:', modelscopeState.page, 'agents length:', modelscopeState.agents.length);
        var msLoadingEl = document.getElementById('modelscope-loading');
        var msErrorEl = document.getElementById('modelscope-error');
        var msEmptyEl = document.getElementById('modelscope-empty');
        var msNoResultsEl = document.getElementById('modelscope-no-results');
        var msSearchEl = document.getElementById('modelscope-search');
        if (msLoadingEl) msLoadingEl.style.display = 'none';
        if (msErrorEl) msErrorEl.style.display = 'none';
        // \u663E\u793A\u641C\u7D22\u6846\u4E0E\u5206\u7C7B\u6807\u7B7E\u533A\uFF08\u6570\u636E\u5230\u8FBE\u540E\uFF09
        if (msSearchEl) msSearchEl.style.display = 'flex';
        var msCatEl = document.getElementById('modelscope-categories');
        if (msCatEl) msCatEl.style.display = 'flex';
        updateModelscopeCategoryHighlight();
        // \u82E5\u5B58\u5728\u641C\u7D22\u5173\u952E\u8BCD\uFF0C\u5E94\u7528\u672C\u5730\u8FC7\u6EE4\u540E\u518D\u6E32\u67D3
        var currentKeyword = modelscopeState.searchKeyword || '';
        var filteredAgents = filterAgentsByKeyword(currentKeyword, modelscopeState.agents);
        if (currentKeyword.trim()) {
          // \u641C\u7D22\u6FC0\u6D3B\u72B6\u6001\uFF1A\u9690\u85CF\u5206\u9875\uFF0C\u6309\u8FC7\u6EE4\u7ED3\u679C\u6E32\u67D3
          if (msEmptyEl) msEmptyEl.style.display = 'none';
          var msPagEl2 = document.getElementById('modelscope-pagination');
          if (msPagEl2) msPagEl2.style.display = 'none';
          if (filteredAgents.length === 0) {
            var msGridEl2 = document.getElementById('modelscope-grid');
            if (msGridEl2) msGridEl2.innerHTML = '';
            if (msNoResultsEl) msNoResultsEl.style.display = 'block';
          } else {
            if (msNoResultsEl) msNoResultsEl.style.display = 'none';
            renderModelscopeGrid(filteredAgents);
          }
        } else {
          // \u65E0\u641C\u7D22\u5173\u952E\u8BCD\uFF1A\u6B63\u5E38\u6E32\u67D3\u5B8C\u6574\u5217\u8868
          if (msNoResultsEl) msNoResultsEl.style.display = 'none';
          if (modelscopeState.agents.length === 0) {
            if (msEmptyEl) msEmptyEl.style.display = 'block';
            var msPagEl3 = document.getElementById('modelscope-pagination');
            if (msPagEl3) msPagEl3.style.display = 'none';
          } else {
            if (msEmptyEl) msEmptyEl.style.display = 'none';
            renderModelscopeGrid(modelscopeState.agents);
            renderModelscopePagination();
          }
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
          msErrorEl2.innerHTML = '\u52A0\u8F7D\u5931\u8D25: ' + escapeHtml(msg.error || '\u672A\u77E5\u9519\u8BEF') + '<br><button class="retry-btn" onclick="fetchModelscopeAgents(' + modelscopeState.page + ', modelscopeState.category)">\u91CD\u8BD5</button>';
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
    /**
     * \u542F\u52A8\u539F\u5730\u91CD\u547D\u540D\u7F16\u8F91\u6A21\u5F0F
     * @param nodeInfo \u8282\u70B9\u4FE1\u606F { name, path, type }
     * @param itemNameSpan \u663E\u793A\u540D\u79F0\u7684 span \u5143\u7D20
     */
    function startRename(nodeInfo, itemNameSpan) {
      // \u5982\u679C\u5DF2\u7ECF\u5728\u7F16\u8F91\u5176\u4ED6\u8282\u70B9\uFF0C\u5148\u53D6\u6D88
      stopRename();

      var item = itemNameSpan.parentElement;
      if (!item || !itemNameSpan) return;

      // \u4FDD\u5B58\u5F53\u524D\u8282\u70B9\u72B6\u6001
      var currentName = nodeInfo.name;
      var currentPath = nodeInfo.path;
      var currentType = nodeInfo.type;

      // \u6807\u8BB0\u7F16\u8F91\u72B6\u6001
      item.classList.add('editing');

      // \u521B\u5EFA\u8F93\u5165\u6846\uFF0C\u66FF\u6362\u540D\u79F0 span
      var input = document.createElement('input');
      input.type = 'text';
      input.className = 'agents-tree-rename-input';
      input.value = currentName;

      // \u83B7\u53D6\u8F93\u5165\u6846\u5E94\u5360\u7528\u7684\u5BBD\u5EA6\uFF08\u4E0E\u5F53\u524D\u540D\u79F0\u5927\u81F4\u5339\u914D\uFF09
      // \u5C06\u8F93\u5165\u6846\u63D2\u5165\u5230\u540D\u79F0\u4F4D\u7F6E
      itemNameSpan.style.display = 'none';
      item.insertBefore(input, itemNameSpan.nextElementSibling || null);

      // \u81EA\u52A8\u9009\u4E2D\u6587\u672C
      var selectStart = 0;
      var selectEnd = currentName.length;
      // \u53BB\u6389\u6269\u5C55\u540D\u4FBF\u4E8E\u53EA\u7F16\u8F91\u6587\u4EF6\u540D\u90E8\u5206\uFF08\u5982 test.ts -> \u53EA\u9009 test\uFF09
      var dotIdx = currentName.lastIndexOf('.');
      if (dotIdx > 0 && currentType === 'file') {
        selectEnd = dotIdx;
      }
      input.setSelectionRange(selectStart, selectEnd);
      input.focus();

      // \u786E\u8BA4\u91CD\u547D\u540D
      function confirmRename(newName) {
        if (!newName || newName === currentName) {
          // \u53D6\u6D88\uFF1A\u6062\u590D\u539F\u59CB\u72B6\u6001
          cancelRename();
          return;
        }
        // \u53D1\u9001\u91CD\u547D\u540D\u8BF7\u6C42\u5230 host
        if (typeof vscode !== 'undefined') {
          vscode.postMessage({ type: 'fileRename', path: currentPath, name: currentName, newName: newName });
        }
        // \u672C\u5730\u66F4\u65B0\u663E\u793A\u540D\u79F0\uFF08\u4E50\u89C2\u66F4\u65B0\uFF09
        currentName = newName;
        itemNameSpan.textContent = newName;
        input.remove();
        itemNameSpan.style.display = '';
        item.classList.remove('editing');
      }

      // \u53D6\u6D88\u91CD\u547D\u540D
      function cancelRename() {
        input.remove();
        itemNameSpan.style.display = '';
        item.classList.remove('editing');
      }

      // \u5168\u5C40\u53D6\u6D88\u51FD\u6570\uFF08\u7528\u4E8E stopRename\uFF09
      window._currentRenameState = { confirm: confirmRename, cancel: cancelRename };

      // Enter \u786E\u8BA4
      input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          confirmRename(input.value.trim());
        } else if (e.key === 'Escape') {
          e.preventDefault();
          cancelRename();
        }
      });

      // \u5931\u7126\u65F6\u81EA\u52A8\u786E\u8BA4\uFF08\u5982\u679C\u8F93\u5165\u6846\u8FD8\u5728\uFF09
      input.addEventListener('blur', function() {
        // \u5EF6\u8FDF\u4E00\u70B9\u68C0\u67E5\uFF0C\u907F\u514D\u4E0E keydown \u51B2\u7A81
        setTimeout(function() {
          if (document.body.contains(input) && window._currentRenameState) {
            confirmRename(input.value.trim());
          }
        }, 100);
      });
    }

    /** \u505C\u6B62\u5F53\u524D\u7684\u91CD\u547D\u540D\u7F16\u8F91\u72B6\u6001 */
    function stopRename() {
      if (window._currentRenameState) {
        window._currentRenameState.cancel();
        delete window._currentRenameState;
      }
    }

    /**
     * \u5728\u76EE\u5F55\u6811\u4E2D\u63D2\u5165\u5185\u8054\u65B0\u5EFA\u6587\u4EF6/\u6587\u4EF6\u5939\u8F93\u5165\u6846\uFF08\u7C7B\u4F3C startRename \u7684\u4EA4\u4E92\u65B9\u5F0F\uFF09
     * @param dirNode \u76EE\u5F55\u8282\u70B9\u6570\u636E { path, type, name }
     * @param kind 'file' \u6216 'folder'
     * @param wrapperEl \u76EE\u5F55\u8282\u70B9\u7684 DOM wrapper \u5143\u7D20 (.agents-tree-node)
     */
    function startNewItem(dirNode, kind, wrapperEl) {
      // \u5982\u679C\u6B63\u5728\u91CD\u547D\u540D\uFF0C\u5148\u53D6\u6D88
      stopRename();

      // \u83B7\u53D6 item \u5143\u7D20\uFF08wrapper \u7684\u76F4\u63A5\u5B50\u5143\u7D20\u4E2D class \u542B agents-tree-item \u8005\uFF09
      var itemEl = null;
      for (var i = 0; i < wrapperEl.children.length; i++) {
        if (wrapperEl.children[i].classList.contains('agents-tree-item')) {
          itemEl = wrapperEl.children[i];
          break;
        }
      }
      if (!itemEl) return;

      // \u67E5\u627E\u6216\u521B\u5EFA childrenWrapper
      var childrenWrapper = null;
      for (var j = 0; j < wrapperEl.children.length; j++) {
        if (wrapperEl.children[j].classList.contains('agents-tree-children')) {
          childrenWrapper = wrapperEl.children[j];
          break;
        }
      }

      var wasHidden = false;
      var wasCreated = false;

      if (!childrenWrapper) {
        // \u7A7A\u76EE\u5F55\uFF1A\u521B\u5EFA childrenWrapper
        childrenWrapper = document.createElement('div');
        childrenWrapper.className = 'agents-tree-children';
        wrapperEl.appendChild(childrenWrapper);
        wasCreated = true;
      } else {
        // \u5DF2\u6709 childrenWrapper\uFF1A\u5982\u679C\u9690\u85CF\u5219\u4E34\u65F6\u663E\u793A
        wasHidden = childrenWrapper.style.display === 'none';
        if (wasHidden) {
          childrenWrapper.style.display = '';
          var arrowEl = itemEl.querySelector('.agents-tree-arrow');
          if (arrowEl) arrowEl.textContent = '\u25BE';
        }
      }

      // \u8BA1\u7B97\u5B50\u8282\u70B9\u7684\u7F29\u8FDB\uFF08depth + 1\uFF09
      var currentPadding = parseInt(itemEl.style.paddingLeft, 10) || 8;
      var currentDepth = Math.round((currentPadding - 8) / 16);
      var childPadding = ((currentDepth + 1) * 16 + 8) + 'px';

      // \u521B\u5EFA\u4E34\u65F6\u8F93\u5165\u884C
      var tempItem = document.createElement('div');
      tempItem.className = 'agents-tree-item editing';
      tempItem.style.paddingLeft = childPadding;

      var spacer = document.createElement('span');
      spacer.className = 'agents-tree-arrow';
      spacer.innerHTML = '&nbsp;';

      var iconSpan = document.createElement('span');
      iconSpan.className = 'agents-tree-icon';
      iconSpan.textContent = kind === 'file' ? '\u{1F4C4}' : '\u{1F4C1}';

      var input = document.createElement('input');
      input.type = 'text';
      input.className = 'agents-tree-rename-input';
      input.placeholder = kind === 'file' ? '\u8F93\u5165\u6587\u4EF6\u540D...' : '\u8F93\u5165\u6587\u4EF6\u5939\u540D...';

      tempItem.appendChild(spacer);
      tempItem.appendChild(iconSpan);
      tempItem.appendChild(input);

      // \u63D2\u5165\u5230 childrenWrapper \u6700\u524D\u9762
      childrenWrapper.insertBefore(tempItem, childrenWrapper.firstChild);

      input.focus();

      // \u786E\u8BA4\u521B\u5EFA
      function confirmNew() {
        var name = input.value.trim();
        if (!name) {
          cleanup();
          return;
        }
        if (typeof vscode !== 'undefined') {
          vscode.postMessage({ type: kind === 'file' ? 'fileNew' : 'folderNew', path: dirNode.path, name: name });
        }
        cleanup();
      }

      // \u6E05\u7406\u4E34\u65F6\u884C\u53CA\u6062\u590D\u72B6\u6001
      function cleanup() {
        if (tempItem.parentElement) {
          tempItem.remove();
        }
        // \u5982\u679C childrenWrapper \u662F\u65B0\u5EFA\u7684\u4E14\u73B0\u5728\u4E3A\u7A7A\uFF0C\u79FB\u9664\u5B83
        if (wasCreated && childrenWrapper && childrenWrapper.children.length === 0) {
          childrenWrapper.remove();
        }
        // \u5982\u679C\u539F\u6765\u9690\u85CF\uFF0C\u6062\u590D\u9690\u85CF\u72B6\u6001
        if (wasHidden && childrenWrapper && childrenWrapper.parentElement) {
          childrenWrapper.style.display = 'none';
          var arrowEl2 = itemEl.querySelector('.agents-tree-arrow');
          if (arrowEl2) arrowEl2.textContent = '\u25B8';
        }
        if (window._currentRenameState) {
          delete window._currentRenameState;
        }
      }

      // \u5168\u5C40\u72B6\u6001\uFF08\u4E0E stopRename \u534F\u8C03\uFF09
      window._currentRenameState = { confirm: confirmNew, cancel: cleanup };

      // Enter \u786E\u8BA4 / Esc \u53D6\u6D88
      input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          confirmNew();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          cleanup();
        }
      });

      // \u5931\u7126\u81EA\u52A8\u786E\u8BA4\uFF08\u5982\u679C\u4E34\u65F6\u884C\u8FD8\u5728 DOM \u4E2D\uFF09
      input.addEventListener('blur', function() {
        setTimeout(function() {
          if (document.body.contains(tempItem) && window._currentRenameState) {
            confirmNew();
          }
        }, 100);
      });
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
      
      // Enable drag and drop for file/folder movement
      item.draggable = true;
      
      // Drag start - store source path and add visual feedback
      item.addEventListener('dragstart', function(e) {
        e.dataTransfer.setData('text/plain', node.path);
        item.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
      });
      
      // Drag end - clean up visual feedback
      item.addEventListener('dragend', function(e) {
        item.classList.remove('dragging');
        // Clean up all possible drag hover states
        document.querySelectorAll('.agents-tree-item.drag-over').forEach(function(el) {
          el.classList.remove('drag-over');
        });
      });
      
      // Drag enter - highlight target if it's a folder
      item.addEventListener('dragenter', function(e) {
        e.preventDefault(); // Must prevent default to allow drop
        if (node.type === 'directory') {
          item.classList.add('drag-over');
        }
      });
      
      // Dragover - maintain highlight
      item.addEventListener('dragover', function(e) {
        e.preventDefault(); // Must prevent default to allow drop
        if (node.type === 'directory') {
          item.classList.add('drag-over');
        }
      });
      
      // Drag leave - remove highlight
      item.addEventListener('dragleave', function(e) {
        if (node.type === 'directory') {
          item.classList.remove('drag-over');
        }
      });
      
      // Handle drop - process the move operation
      item.addEventListener('drop', function(e) {
        e.preventDefault();
        if (node.type === 'directory') {
          item.classList.remove('drag-over');
          // Get source path
          var sourcePath = e.dataTransfer.getData('text/plain');
          if (sourcePath && sourcePath.trim() !== '') {
            // Send move message to host
            var targetDir = node.path;
            vscode.postMessage({
              type: 'fileMove',
              sourcePath: sourcePath,
              targetDir: targetDir
            });
          }
        }
      });

      // \u6784\u5EFA\u7EDF\u4E00\u7684\u6587\u4EF6\u64CD\u4F5C\u53F3\u952E\u83DC\u5355
      function buildContextMenu(e) {
        e.preventDefault();
        e.stopPropagation();

        // Remove any existing context menu
        var existingMenu = document.querySelector('.agents-tree-context-menu');
        if (existingMenu) existingMenu.remove();

        var menu = document.createElement('div');
        menu.className = 'agents-tree-context-menu';
        menu.style.left = e.clientX + 'px';
        menu.style.top = e.clientY + 'px';

        // \u8BA1\u7B97\u7C98\u8D34\u76EE\u6807\u76EE\u5F55\uFF1A\u76EE\u5F55\u8282\u70B9\u81EA\u8EAB\uFF0C\u6587\u4EF6\u8282\u70B9\u53D6\u7236\u76EE\u5F55
        var targetDir = node.type === 'directory' ? node.path : (function() {
          // \u53D6\u7236\u76EE\u5F55\u8DEF\u5F84\uFF0C\u517C\u5BB9 / \u548C  \u5206\u9694\u7B26
          var lastSlashPos = Math.max(node.path.lastIndexOf('/'), node.path.lastIndexOf('\\\\'));
          return lastSlashPos > 0 ? node.path.substring(0, lastSlashPos) : node.path;
        })();

        function addMenuAction(label, type, disabled) {
          var el = document.createElement('div');
          el.className = 'agents-tree-context-menu-item' + (disabled ? ' agents-tree-context-menu-item-disabled' : '');
          el.textContent = label;
          if (!disabled) {
            el.addEventListener('click', function() {
              menu.remove();
              if (typeof vscode === 'undefined') return;
              if (type === 'fileCut') {
                vscode.postMessage({ type: 'fileCut', path: node.path });
              } else if (type === 'fileCopy') {
                vscode.postMessage({ type: 'fileCopy', path: node.path });
              } else if (type === 'filePaste') {
                vscode.postMessage({ type: 'filePaste', path: node.path, nodeType: node.type, targetDir: targetDir });
              } else if (type === 'fileDelete') {
                vscode.postMessage({ type: 'fileDelete', path: node.path, name: node.name });
              } else if (type === 'fileRename') {
                startRename({ name: node.name, path: node.path, type: node.type }, nameSpan);
              } else if (type === 'copyPath') {
                vscode.postMessage({ type: 'copyPath', path: node.path });
              } else if (type === 'fileNew') {
                startNewItem(node, 'file', wrapper);
              } else if (type === 'folderNew') {
                startNewItem(node, 'folder', wrapper);
              }
            });
          }
          menu.appendChild(el);
          return el;
        }

        // \u6587\u4EF6\u64CD\u4F5C\u83DC\u5355\u9879
        addMenuAction('\u526A\u5207', 'fileCut', false);
        addMenuAction('\u590D\u5236', 'fileCopy', false);
        addMenuAction('\u7C98\u8D34', 'filePaste', false);
        addMenuAction('\u5220\u9664', 'fileDelete', false);
        addMenuAction('\u91CD\u547D\u540D', 'fileRename', false);
        addMenuAction('\u590D\u5236\u8DEF\u5F84', 'copyPath', false);

        // \u76EE\u5F55\u8282\u70B9\uFF1A\u65B0\u5EFA\u6587\u4EF6/\u6587\u4EF6\u5939
        if (node.type === 'directory') {
          var sep2 = document.createElement('div');
          sep2.className = 'agents-tree-context-menu-separator';
          menu.appendChild(sep2);
          addMenuAction('\u65B0\u5EFA\u6587\u4EF6...', 'fileNew', false);
          addMenuAction('\u65B0\u5EFA\u6587\u4EF6\u5939...', 'folderNew', false);
        }

        // \u76EE\u5F55\u8282\u70B9\uFF1A\u8FFD\u52A0"\u521B\u5EFA\u667A\u80FD\u4F53"\uFF08\u4EC5\u5F53\u76EE\u5F55\u5305\u542B AGENTS.md \u65F6\uFF09
        if (node.type === 'directory' && node.hasAgentsMd) {
          var sep = document.createElement('div');
          sep.className = 'agents-tree-context-menu-separator';
          menu.appendChild(sep);
          var createAgentItem = document.createElement('div');
          createAgentItem.className = 'agents-tree-context-menu-item';
          createAgentItem.textContent = '\u521B\u5EFA\u667A\u80FD\u4F53';
          createAgentItem.addEventListener('click', function() {
            if (typeof vscode !== 'undefined') {
              vscode.postMessage({ type: 'createAgent', path: node.path });
            }
            menu.remove();
          });
          menu.appendChild(createAgentItem);
        }

        menu.classList.add('visible');
        document.body.appendChild(menu);

        // Close menu on click outside or ESC
        function closeMenu() {
          menu.remove();
          document.removeEventListener('click', closeMenu);
          document.removeEventListener('keydown', onKeyDown);
        }
        function onKeyDown(e) {
          if (e.key === 'Escape') closeMenu();
        }
        // Use setTimeout to avoid immediate closure from the current click
        setTimeout(function() {
          document.addEventListener('click', closeMenu);
          document.addEventListener('keydown', onKeyDown);
        }, 0);
      }

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
          // \u4ECE\u6301\u4E45\u5316\u7684\u5C55\u5F00\u72B6\u6001\u6062\u590D\uFF1A\u9ED8\u8BA4\u6298\u53E0\uFF0C\u5C55\u5F00\u8DEF\u5F84\u96C6\u542B\u8BE5\u76EE\u5F55\u8DEF\u5F84\u65F6\u5C55\u5F00
          var isExpanded = false;
          try {
            isExpanded = agentsTreeExpandedPaths && agentsTreeExpandedPaths[node.path] === true;
          } catch (e) { isExpanded = false; }
          childrenWrapper.style.display = isExpanded ? '' : 'none';
          if (isExpanded) arrow.textContent = '\u25BE';
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
            // \u540C\u6B65\u5C55\u5F00\u72B6\u6001\u5230 Set \u7ED3\u6784\u5E76\u6301\u4E45\u5316\uFF08localStorage + postMessage \u5230 host globalState\uFF09
            try {
              if (isHidden) {
                agentsTreeExpandedPaths[node.path] = true;
              } else {
                delete agentsTreeExpandedPaths[node.path];
              }
              saveAgentsTreeExpandedPaths();
            } catch (err) { /* \u6301\u4E45\u5316\u5931\u8D25\u4E0D\u5F71\u54CD\u5C55\u5F00/\u6298\u53E0\u4EA4\u4E92 */ }
          });

          // Context menu for directory nodes (\u7EDF\u4E00\u6587\u4EF6\u64CD\u4F5C\u83DC\u5355)
          item.addEventListener('contextmenu', function(e) {
            buildContextMenu(e);
          });
        } else {
          // Empty directory: no arrow, just a spacer to align with files
          var spacer = document.createElement('span');
          spacer.className = 'agents-tree-arrow';
          spacer.innerHTML = '&nbsp;';
          item.insertBefore(spacer, iconSpan);
          item.title = t('Empty directory');
          item.classList.add('empty-dir');

          // Context menu for empty directory nodes (\u7EDF\u4E00\u6587\u4EF6\u64CD\u4F5C\u83DC\u5355)
          item.addEventListener('contextmenu', function(e) {
            buildContextMenu(e);
          });
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
        
        // Add context menu for file nodes
        item.addEventListener('contextmenu', function(e) {
          e.preventDefault();
          e.stopPropagation();

          // Remove any existing context menu
          var existingMenu = document.querySelector('.agents-tree-context-menu');
          if (existingMenu) existingMenu.remove();

          var menu = document.createElement('div');
          menu.className = 'agents-tree-context-menu';
          menu.style.left = e.clientX + 'px';
          menu.style.top = e.clientY + 'px';

          // \u8BA1\u7B97\u7C98\u8D34\u76EE\u6807\u76EE\u5F55\uFF1A\u6587\u4EF6\u8282\u70B9\u53D6\u7236\u76EE\u5F55
          var targetDir = (function() {
            // \u53D6\u7236\u76EE\u5F55\u8DEF\u5F84\uFF0C\u517C\u5BB9 / \u548C  \u5206\u9694\u7B26
            var lastSlashPos = Math.max(node.path.lastIndexOf('/'), node.path.lastIndexOf('\\\\'));
            return lastSlashPos > 0 ? node.path.substring(0, lastSlashPos) : node.path;
          })();

          function addMenuAction(label, type, disabled) {
            var el = document.createElement('div');
            el.className = 'agents-tree-context-menu-item' + (disabled ? ' agents-tree-context-menu-item-disabled' : '');
            el.textContent = label;
            if (!disabled) {
              el.addEventListener('click', function() {
                menu.remove();
                if (typeof vscode === 'undefined') return;
                if (type === 'fileCut') {
                  vscode.postMessage({ type: 'fileCut', path: node.path });
                } else if (type === 'fileCopy') {
                  vscode.postMessage({ type: 'fileCopy', path: node.path });
                } else if (type === 'filePaste') {
                  vscode.postMessage({ type: 'filePaste', path: node.path, nodeType: node.type, targetDir: targetDir });
                } else if (type === 'fileDelete') {
                  vscode.postMessage({ type: 'fileDelete', path: node.path, name: node.name });
                } else if (type === 'fileRename') {
                  startRename({ name: node.name, path: node.path, type: node.type }, nameSpan);
                } else if (type === 'copyPath') {
                  vscode.postMessage({ type: 'copyPath', path: node.path });
                } else if (type === 'fileNew') {
                  startNewItem(node, 'file', wrapper);
                } else if (type === 'folderNew') {
                  startNewItem(node, 'folder', wrapper);
                }
              });
            }
            menu.appendChild(el);
            return el;
          }

          // \u6587\u4EF6\u64CD\u4F5C\u83DC\u5355\u9879
          addMenuAction('\u526A\u5207', 'fileCut', false);
          addMenuAction('\u590D\u5236', 'fileCopy', false);
          addMenuAction('\u7C98\u8D34', 'filePaste', false);
          addMenuAction('\u5220\u9664', 'fileDelete', false);
          addMenuAction('\u91CD\u547D\u540D', 'fileRename', false);
          addMenuAction('\u590D\u5236\u8DEF\u5F84', 'copyPath', false);

          menu.classList.add('visible');
          document.body.appendChild(menu);

          // Close menu on click outside or ESC
          function closeMenu() {
            menu.remove();
            document.removeEventListener('click', closeMenu);
            document.removeEventListener('keydown', onKeyDown);
          }
          function onKeyDown(e) {
            if (e.key === 'Escape') closeMenu();
          }
          // Use setTimeout to avoid immediate closure from the current click
          setTimeout(function() {
            document.addEventListener('click', closeMenu);
            document.addEventListener('keydown', onKeyDown);
          }, 0);
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
var OpenClawChatView = class _OpenClawChatView {
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
      log(`AgentsDIR create failed: ${mkdirErr?.message || mkdirErr}`, LOG_INFO, ch);
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
  static {
    this.viewType = "openclaw.chatView";
  }
  static {
    this.SUBAGENT_ACTIVITY_TIMEOUT_MS = 6e4;
  }
  static {
    this.AUTO_CONTINUE_MAX = 3;
  }
  static {
    this.ERROR_PATTERNS = [
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
  }
  get agentPrefix() {
    return `agent:${this.activeAgent.id}:`;
  }
  gwSessionKey(localKey) {
    return this.agentPrefix + (localKey || this.currentSessionKey);
  }
  show() {
    this.view?.webview.postMessage({ type: "show" });
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
    const sessionKey = this.resolveSession(payload?.sessionKey);
    const rawSessionKey = payload?.sessionKey || "";
    const state = typeof payload?.state === "string" ? payload.state : "";
    if (this.supervisorPendingSessionKey && rawSessionKey === this.supervisorPendingSessionKey) {
      if (state === "delta") {
        const text = await this.extractDeltaText(payload?.message);
        if (text) {
          this.supervisorAccumulated += text;
          this.log(`Supervisor delta chunk: +${text.length} chars (total=${this.supervisorAccumulated.length})`);
        }
      } else if (state === "final") {
        const finalText = await this.extractDeltaText(payload?.message);
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
    this.log(`chatEvent: state=${state} session=${sessionKey} hasMsg=${!!payload?.message}`);
    if (state === "delta") {
      const text = await this.extractDeltaText(payload?.message);
      this.log(`delta len=${text.length} preview=${text.substring(0, 80)}`);
      if (text) {
        this.postToWebview({ type: "streamDelta", sessionKey, agentId: this.activeAgent.id, text });
      }
    } else if (state === "final") {
      this.log(`stream final`);
      const finalMsg = payload?.message;
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
      const errorMsg = payload?.errorMessage || "unknown error";
      this.log(`stream error: ${errorMsg}`);
      this.postToWebview({ type: "streamError", sessionKey, agentId: this.activeAgent.id, error: errorMsg });
      this.setBusy(false);
    } else {
      this.log(`unknown chat state: ${state}`);
    }
  }
  // Match Obsidian plugin's handleStreamEvent
  handleStreamEvent(payload) {
    const stream = typeof payload?.stream === "string" ? payload.stream : "";
    const state = typeof payload?.state === "string" ? payload.state : "";
    const data = payload?.data || {};
    const toolName = data.name || data.toolName || payload?.toolName || payload?.name || "";
    const phase = data.phase || payload?.phase || "";
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
    const mediaUrls = message.openclawDelivery?.mediaUrls;
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
        if (result?.url) {
          const absoluteUrl = result.url.startsWith("/") ? httpBase + result.url : result.url;
          this.log(`toAbsoluteMediaUrl: resolved ${sessionKey}/${attachmentId} -> ${absoluteUrl}`);
          return absoluteUrl;
        }
      } catch (err) {
        this.log(`toAbsoluteMediaUrl: artifacts.download(${prefix}) failed for ${sessionKey}/${attachmentId}: ${err?.message || err}`);
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
              if (sub?.type === "text" && sub.text) {
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
      const mediaUrls = content?.openclawDelivery?.mediaUrls;
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
      localResourceRoots: [vscode4.Uri.file(this.context.extensionPath)]
    };
    webviewView.webview.html = this.getHtml();
    if (this._messageHandlerDisposable) {
      this._messageHandlerDisposable.dispose();
      this._messageHandlerDisposable = void 0;
    }
    this._messageHandlerDisposable = webviewView.webview.onDidReceiveMessage(async (msg) => {
      if (msg.type === "downloadModelscopeAgent" && this.onDownloadModelscopeAgent) {
        await this.onDownloadModelscopeAgent(msg.agentId, msg.destType);
        return;
      }
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
        const errMsg = sendErr?.message || "";
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
            this.log(`Retry after /new failed: ${retryErr?.message}`);
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
        const errMsg = sendErr?.message || "";
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
        const sep2 = cleanQuery.indexOf("/");
        if (sep2 > 0) {
          const folderName = cleanQuery.substring(0, sep2);
          const folder = folders.find((f) => f.name.toLowerCase() === folderName.toLowerCase());
          if (folder) {
            const relPath = cleanQuery.substring(sep2 + 1);
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
    try {
      const res = await this.gateway.request("sessions.list", {
        archived: false,
        includeGlobal: true,
        includeUnknown: true,
        includeDerivedTitles: true,
        limit: 100
      });
      this.sessions = res?.sessions || [];
      this.log(`sessions.list: ${this.sessions.length} \u6761`);
      for (const s of this.sessions || []) {
        this.log(`  session: key=${JSON.stringify(s?.key || "")} id=${s?.sessionId || "-"} name=${JSON.stringify(s?.["device-info"]?.["device-name"] || s?.displayName || s?.derivedTitle || "")}`);
      }
      this.postToWebview({ type: "sessionsList", sessions: this.sessions });
    } catch (err) {
      this.log(`sessions.list error: ${err.message}`);
      this.postToWebview({ type: "sessionsList", sessions: [] });
    }
  }
  resolveActiveAgent() {
    if (!this.agents || this.agents.length === 0)
      return;
    const currentId = this.activeAgent?.id;
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
    try {
      const res = await this.gateway.request("config.get", {});
      const config = res?.config || res || {};
      const agentDefaults = config?.agents?.defaults || {};
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
    try {
      const agentListRes = await this.gateway.request("agents.list", {});
      const agents = agentListRes?.agents || [];
      const agent = agents.find((a) => a.id === this.activeAgent.id);
      let workspace4 = agent?.workspace || "";
      if (!workspace4) {
        const configRes = await this.gateway.request("config.get", {});
        const config = configRes?.config || configRes || {};
        workspace4 = config?.agents?.defaults?.workspace || config?.workspace || "";
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
      this.log(`Supervisor handshake failed: ${err?.message || err}`);
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
      const msgs = res?.messages || [];
      this.log(`chat.history returned ${msgs.length} messages`);
      let lastContent = "";
      for (let i = msgs.length - 1; i >= 0; i--) {
        const m = msgs[i];
        this.log(`  Checking message ${i}: role=${m.role}, hasContent=${!!m.content}`);
        if (m.role === "assistant") {
          const text = await this.extractHistoryContent(m.content);
          this.log(`  Assistant message text length: ${text?.length || 0}`);
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
          this.log(`Supervisor replied: ${reply?.substring(0, 50)}... (not stop signal, continuing)`);
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
    return new Promise((resolve3) => {
      this.supervisorPendingSessionKey = supervisorSessionKey;
      this.supervisorResponseResolver = resolve3;
      this.supervisorAccumulated = "";
      const timeout = setTimeout(() => {
        this.log(`Supervisor response timeout after ${timeoutMs}ms (accumulated=${this.supervisorAccumulated.length})`);
        this.supervisorTimeout = null;
        this.supervisorPendingSessionKey = null;
        this.supervisorResponseResolver = null;
        resolve3(this.supervisorAccumulated || null);
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
      const msgs = res?.messages || [];
      this.log(`history: ${msgs.length} messages (key=agent:${targetAgentId}:${sessionKey} id=${res?.sessionId || sessionId || "-"})`);
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
    this.view?.webview.postMessage(msg);
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

// src/extension.ts
var https = __toESM(require("https"));
var http = __toESM(require("http"));
var fs4 = __toESM(require("fs"));
var os3 = __toESM(require("os"));
var path5 = __toESM(require("path"));
var import_adm_zip = __toESM(require_adm_zip());
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
  chatView.onDownloadModelscopeAgent = async (agentId, destType) => {
    await _handleDownloadModelscopeAgent({
      postToWebview: (msg) => chatView.postToWebview(msg),
      agentsDir: chatView.agentsDirectory,
      log: (m) => outputChannel.appendLine(m)
    }, agentId, destType);
  };
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
    outputChannel.appendLine(`doApproveAndReconnect: nodeDeviceId=${nodeDeviceId?.substring(0, 16)}...`);
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
    nodeApproved = false;
    const version = result?.server?.version ?? result?.payload?.server?.version ?? "";
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
    }),
    vscode5.commands.registerCommand("openclaw.createAgent", async (uri) => {
      const dirPath = uri.fsPath;
      const agentsMdPath = path5.join(dirPath, "AGENTS.md");
      if (!fs4.existsSync(agentsMdPath)) {
        vscode5.window.showWarningMessage(
          vscode5.l10n.t("Directory '{0}' does not contain AGENTS.md. Please add AGENTS.md first.", path5.basename(dirPath))
        );
        return;
      }
      const promptTemplate = config.get("promptForNewAgent", "");
      if (!promptTemplate) {
        vscode5.window.showWarningMessage(vscode5.l10n.t("openclaw.promptForNewAgent setting is empty. Please configure it first."));
        return;
      }
      const finalPrompt = promptTemplate.replace(/\{workspace\}/g, dirPath);
      chatView.setInputText(finalPrompt);
      chatView.show();
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
      const changedSessionKey = payload?.sessionKey || "";
      outputChannel.appendLine(`progressCard.changed: sessionKey=${changedSessionKey} revision=${payload?.revision ?? "null"}`);
      setTimeout(async () => {
        try {
          const result = await gateway.request("progressCard.get", {
            sessionKey: changedSessionKey
          });
          const card = result?.card;
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
async function _handleDownloadModelscopeAgent(ctx, agentId, destType) {
  try {
    ctx.log(`[MS-Download] Starting download for agent: ${agentId}, destType: ${destType}`);
    const downloadUrl = `https://modelscope.cn/agents/${agentId}/archive/zip/master`;
    ctx.log(`[MS-Download] Download URL: ${downloadUrl}`);
    let targetDir;
    if (destType === "local") {
      targetDir = ctx.agentsDir;
      ctx.log(`[MS-Download] Using configured agentsDir: ${targetDir}`);
    } else {
      const selectedUri = await vscode5.window.showOpenDialog({
        canSelectFiles: false,
        canSelectFolders: true,
        canSelectMany: false,
        openLabel: "Download here"
      });
      if (!selectedUri || selectedUri.length === 0) {
        ctx.log(`[MS-Download] User cancelled directory selection`);
        ctx.postToWebview({ type: "notify", text: "Download cancelled" });
        return;
      }
      targetDir = selectedUri[0].fsPath;
      ctx.log(`[MS-Download] User selected directory: ${targetDir}`);
    }
    if (!fs4.existsSync(targetDir)) {
      fs4.mkdirSync(targetDir, { recursive: true });
      ctx.log(`[MS-Download] Created target directory: ${targetDir}`);
    }
    const agentDirName = agentId.replace(/[\/\\:*?"<>|]/g, "_");
    const agentTargetDir = path5.join(targetDir, agentDirName);
    ctx.log(`[MS-Download] Agent target directory: ${agentTargetDir}`);
    const dirExists = fs4.existsSync(agentTargetDir);
    if (dirExists && destType === "local") {
      const overwrite = await vscode5.window.showWarningMessage(
        `Directory "${agentDirName}" already exists. Overwrite?`,
        { modal: true },
        "Yes",
        "No"
      );
      if (overwrite !== "Yes") {
        ctx.log(`[MS-Download] User cancelled overwrite`);
        ctx.postToWebview({ type: "notify", text: "Download cancelled" });
        return;
      }
      fs4.rmSync(agentTargetDir, { recursive: true, force: true });
      ctx.log(`[MS-Download] Removed existing directory`);
    }
    ctx.log(`[MS-Download] Downloading ZIP...`);
    const zipBuffer = await downloadZip(downloadUrl);
    ctx.log(`[MS-Download] Download complete, size: ${zipBuffer.length} bytes`);
    ctx.log(`[MS-Download] Extracting ZIP...`);
    const zip = new import_adm_zip.default(zipBuffer);
    zip.extractAllTo(
      agentTargetDir,
      true
      /* overwrite */
    );
    ctx.log(`[MS-Download] Extraction complete to: ${agentTargetDir}`);
    const relativePath = path5.relative(os3.homedir(), agentTargetDir);
    const displayPath = relativePath.startsWith("..") ? agentTargetDir : `~/${relativePath}`;
    ctx.log(`[MS-Download] Successfully downloaded to: ${displayPath}`);
    ctx.postToWebview({
      type: "notify",
      text: `Successfully downloaded to ${displayPath}`
    });
    vscode5.window.showInformationMessage(`ModelScope \u667A\u80FD\u4F53\u5DF2\u4E0B\u8F7D\u5230: ${displayPath}`);
  } catch (error) {
    ctx.log(`[MS-Download] Error: ${error.message}`);
    ctx.postToWebview({
      type: "notify",
      text: `Download failed: ${error.message}`
    });
    vscode5.window.showErrorMessage(`ModelScope \u667A\u80FD\u4F53\u4E0B\u8F7D\u5931\u8D25: ${error.message}`);
  }
}
function downloadZip(url) {
  return new Promise((resolve3, reject) => {
    const lib = url.startsWith("https") ? https : http;
    const req = lib.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}!`));
        res.resume();
        return;
      }
      const chunks = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => {
        resolve3(Buffer.concat(chunks));
      });
    });
    req.on("error", (err) => {
      reject(err);
    });
    req.setTimeout(3e4, () => {
      req.destroy();
      reject(new Error("Request timeout"));
    });
  });
}
function deactivate() {
  gateway?.disconnect();
  nodeHost?.disconnect();
}
async function updateNodeAgentConfig(gw, nodeDeviceId, channel) {
  const agentId = nodeDeviceId;
  channel.appendLine(`updateNodeAgentConfig: ${agentId}`);
  const configResult = await gw.request("config.get", {});
  const baseHash = configResult?.hash;
  let config = configResult?.config;
  if (!config && configResult?.raw) {
    try {
      config = JSON.parse(configResult.raw);
    } catch {
    }
  }
  if (!config)
    config = configResult;
  const agentEntries = config?.agents?.entries || {};
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
  channel.appendLine(`config.patch result: ok=${result?.ok}`);
}
async function updateNodeAgentName(gw, nodeDeviceId, displayName, channel) {
  const agentId = nodeDeviceId;
  channel.appendLine(`updateNodeAgentName: ${agentId} -> ${displayName}`);
  const configResult = await gw.request("config.get", {});
  const baseHash = configResult?.hash;
  let config = configResult?.config;
  if (!config && configResult?.raw) {
    try {
      config = JSON.parse(configResult.raw);
    } catch {
    }
  }
  if (!config)
    config = configResult;
  const agentEntries = config?.agents?.entries || {};
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
  channel.appendLine(`updateNodeAgentName result: ok=${result?.ok}`);
}
async function approveNodePairing(gw, nodeDeviceId, channel) {
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
    const entryNodeId = entry.nodeId || entry.deviceId || entry.device?.id || "";
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
    const entryNodeId = entry.nodeId || entry.deviceId || entry.device?.id || "";
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
        const newToken = approveResult?.token || approveResult?.pairedNode?.token || "";
        if (newToken) {
          channel.appendLine(`Got pairing token: ${newToken.substring(0, 16)}...`);
          nodeHost.setToken(newToken);
        }
        if (approveResult?.displayName) {
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
      const entryNodeId = entry.nodeId || entry.deviceId || entry.device?.id || "";
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
  return new Promise((resolve3) => setTimeout(resolve3, ms));
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  _handleDownloadModelscopeAgent,
  activate,
  deactivate
});
