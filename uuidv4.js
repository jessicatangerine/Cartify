// how to create UUIDs from https://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid
(function () {
    function e(t, n, r) {
        function s(o, u) {
            if (!n[o]) {
                if (!t[o]) {
                    var a = typeof require == "function" && require;
                    if (!u && a) return a(o, !0);
                    if (i) return i(o, !0);
                    var f = new Error("Cannot find module '" + o + "'");
                    throw f.code = "MODULE_NOT_FOUND", f
                }
                var l = n[o] = {
                    exports: {}
                };
                t[o][0].call(l.exports, function (e) {
                    var n = t[o][1][e];
                    return s(n ? n : e)
                }, l, l.exports, e, t, n, r)
            }
            return n[o].exports
        }
        var i = typeof require == "function" && require;
        for (var o = 0; o < r.length; o++) s(r[o]);
        return s
    }
    return e
})()({
    1: [function (require, module, exports) {
        (function (global) {

            var rng;

            var crypto = global.crypto || global.msCrypto; // for IE 11
            if (crypto && crypto.getRandomValues) {
                // code from http://wiki.whatwg.org/wiki/Crypto
                var _rnds8 = new Uint8Array(16);
                rng = function whatwgRNG() {
                    crypto.getRandomValues(_rnds8);
                    return _rnds8;
                };
            }

            if (!rng) {
                // Math.random()-based (RNG) from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
                var _rnds = new Array(16);
                rng = function () {
                    for (var i = 0, r; i < 16; i++) {
                        if ((i & 0x03) === 0) r = Math.random() * 0x100000000;
                        _rnds[i] = r >>> ((i & 0x03) << 3) & 0xff;
                    }

                    return _rnds;
                };
            }

            module.exports = rng;


        }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
    }, {}],
    2: [function (require, module, exports) {
        // code from https://www.sitepoint.com/understanding-module-exports-exports-node-js/

        var _rng = require('./rng');

        // Maps for number <-> hex string conversion from https://stackoverflow.com/questions/57803/how-to-convert-decimal-to-hexadecimal-in-javascript
        var _byteToHex = [];
        var _hexToByte = {};
        for (var i = 0; i < 256; i++) {
            _byteToHex[i] = (i + 0x100).toString(16).substr(1);
            _hexToByte[_byteToHex[i]] = i;
        }

        // **`parse()` - Parse a UUID into it's component bytes** from https://stackoverflow.com/questions/3804591/efficient-method-to-generate-uuid-string-in-java-uuid-randomuuid-tostring-w
        function parse(s, buf, offset) {
            var i = (buf && offset) || 0,
                ii = 0;

            buf = buf || [];
            s.toLowerCase().replace(/[0-9a-f]{2}/g, function (oct) {
                if (ii < 16) { // Don't overflow!
                    buf[i + ii++] = _hexToByte[oct];
                }
            });

            // Zero out remaining bytes if string was short
            while (ii < 16) {
                buf[i + ii++] = 0;
            }

            return buf;
        }

        // **`unparse()` - Convert UUID byte array (ala parse()) into a string**
        function unparse(buf, offset) {
            var i = offset || 0,
                bth = _byteToHex;
            return bth[buf[i++]] + bth[buf[i++]] +
                bth[buf[i++]] + bth[buf[i++]] + '-' +
                bth[buf[i++]] + bth[buf[i++]] + '-' +
                bth[buf[i++]] + bth[buf[i++]] + '-' +
                bth[buf[i++]] + bth[buf[i++]] + '-' +
                bth[buf[i++]] + bth[buf[i++]] +
                bth[buf[i++]] + bth[buf[i++]] +
                bth[buf[i++]] + bth[buf[i++]];
        }


        // code from https://github.com/LiosK/UUID.js
        // and http://docs.python.org/library/uuid.html

        var _seedBytes = _rng();

        var _nodeId = [
            _seedBytes[0] | 0x01,
            _seedBytes[1], _seedBytes[2], _seedBytes[3], _seedBytes[4], _seedBytes[5]
        ];

        var _clockseq = (_seedBytes[6] << 8 | _seedBytes[7]) & 0x3fff;

        // Previous uuid creation time
        var _lastMSecs = 0,
            _lastNSecs = 0;

        // https://github.com/broofa/node-uuid for API details
        function v1(options, buf, offset) {
            var i = buf && offset || 0;
            var b = buf || [];

            options = options || {};

            var clockseq = options.clockseq !== undefined ? options.clockseq : _clockseq;

            // code from https://stackoverflow.com/questions/19303233/newid-vs-newsequentialid-when-used-in-combination-with-another-uuid-source-java
            var msecs = options.msecs !== undefined ? options.msecs : new Date().getTime();


            var nsecs = options.nsecs !== undefined ? options.nsecs : _lastNSecs + 1;

            // Time since last uuid creation (in msecs)
            var dt = (msecs - _lastMSecs) + (nsecs - _lastNSecs) / 10000;

            // Per 4.2.1.2, Bump clockseq on clock regression
            if (dt < 0 && options.clockseq === undefined) {
                clockseq = clockseq + 1 & 0x3fff;
            }

            if ((dt < 0 || msecs > _lastMSecs) && options.nsecs === undefined) {
                nsecs = 0;
            }

            // Per 4.2.1.2 Throw error if too many uuids are requested
            // code from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error
            if (nsecs >= 10000) {
                throw new Error('uuid.v1(): Can\'t create more than 10M uuids/sec');
            }

            _lastMSecs = msecs;
            _lastNSecs = nsecs;
            _clockseq = clockseq;

            msecs += 12219292800000;

            // `time_low`
            var tl = ((msecs & 0xfffffff) * 10000 + nsecs) % 0x100000000;
            b[i++] = tl >>> 24 & 0xff;
            b[i++] = tl >>> 16 & 0xff;
            b[i++] = tl >>> 8 & 0xff;
            b[i++] = tl & 0xff;

            // `time_mid`
            var tmh = (msecs / 0x100000000 * 10000) & 0xfffffff;
            b[i++] = tmh >>> 8 & 0xff;
            b[i++] = tmh & 0xff;

            // `time_high_and_version`
            b[i++] = tmh >>> 24 & 0xf | 0x10; // include version
            b[i++] = tmh >>> 16 & 0xff;

            // `clock_seq_hi_and_reserved`
            b[i++] = clockseq >>> 8 | 0x80;

            // `clock_seq_low`
            b[i++] = clockseq & 0xff;

            // `node`
            var node = options.node || _nodeId;
            for (var n = 0; n < 6; n++) {
                b[i + n] = node[n];
            }

            return buf ? buf : unparse(b);
        }

        // code from https://github.com/broofa/node-uuid for API details
        function v4(options, buf, offset) {
            // Deprecated - 'format' argument, as supported in v1.2
            var i = buf && offset || 0;

            if (typeof (options) == 'string') {
                buf = options == 'binary' ? new Array(16) : null;
                options = null;
            }
            options = options || {};

            var rnds = options.random || (options.rng || _rng)();

            // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
            rnds[6] = (rnds[6] & 0x0f) | 0x40;
            rnds[8] = (rnds[8] & 0x3f) | 0x80;

            // Copy bytes to buffer, if provided
            if (buf) {
                for (var ii = 0; ii < 16; ii++) {
                    buf[i + ii] = rnds[ii];
                }
            }

            return buf || unparse(rnds);
        }

        // Export public API
        var uuid = v4;
        uuid.v1 = v1;
        uuid.v4 = v4;
        uuid.parse = parse;
        uuid.unparse = unparse;

        module.exports = uuid;

    }, {
        "./rng": 1
    }],
    3: [function (require, module, exports) {
        window.uuidv4 = require('uuid').v4
    }, {
        "uuid": 2
    }]
}, {}, [3]);
