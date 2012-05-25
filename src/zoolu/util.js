/**
 * ZOOLU UTIL JavaScript Library 0.1.0
 * http://zoolucms.org/
 *
 * @author Thomas Schedler <ths@massiveart.com>
 *
 * http://zoolucms.org/license
 */
(function(window, ZOOLU, $, undefined) {

    'use strict';

    function log() {
        if (window.debug) {
            window.log.apply(window, $.merge(['ZOOLU', 'UTIL'], arguments));
        }
    }

    /** @namespace */
    ZOOLU.UTIL = {};

    /**
     * @class
     */
    ZOOLU.UTIL.String = /** @lends ZOOLU.UTIL.String */{

        /**
         * Truncate a string to the given length and adding an ellipsis.
         *
         * @public
         * @param {String} str String to be truncated
         * @param {Integer} limit Max length of the string
         * @return string
         */
        truncate: function(str, limit) {
            log('String', 'truncate');

            if (typeof str !== 'string') {
                return '';
            }

            if (str.length > limit) {
                return str.slice(0, limit - 3) + '...';
            } else {
                return str;
            }
        },

        /**
         * Truncate a string to the given length, breaking at word boundaries and adding an ellipsis.
         *
         * @public
         * @param {String} str String to be truncated
         * @param {Integer} limit Max length of the string
         * @return string
         */
        truncateAtWordBoundaries: function(str, limit) {
            log('String', 'truncateAtWordBoundaries');

            var bits, i;

            if (typeof str !== 'string') {
                return '';
            }

            bits = str.split('');

            if (bits.length > limit) {
                for (i = bits.length - 1; i > -1; --i) {
                    if (i > limit) {
                        bits.length = i;
                    } else if (' ' === bits[i]) {
                        bits.length = i;
                        break;
                    }
                }
                bits.push(' ...');
            }

            return bits.join('');
        },

        /**
         * Truncate a string to the given length and adding an ellipsis in between.
         *
         * @public
         * @param {String} str String to be truncated
         * @param {Integer} limit Max length of the string
         * @return string
         */
        truncateInBetween: function(str, limit, separator) {
            log('String', 'truncateAtTheMiddle');

            if (typeof str !== 'string') {
                return '';
            }

            if (str.length > limit) {
                separator = separator || ' ... ';

                var sepLen = separator.length,
                    charsToShow = limit - sepLen,
                    frontChars = Math.ceil(charsToShow / 3 * 2),
                    backChars = Math.floor(charsToShow / 3 * 1);

                return str.substr(0, frontChars) + separator + str.substr(str.length - backChars);
            } else {
                return str;
            }

        }

    };

})(window, window.ZOOLU, window.jQuery);