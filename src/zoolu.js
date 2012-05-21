// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/bind
if (!Function.prototype.bind) {
    Function.prototype.bind = function(oThis) {
        if (typeof this !== 'function') {
            // closest thing possible to the ECMAScript 5 internal IsCallable function
            throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
        }

        var aArgs = Array.prototype.slice.call(arguments, 1),
            fToBind = this,
            fNOP = function() {
            },
            fBound = function() {
                return fToBind.apply(this instanceof fNOP ? this : oThis || window, aArgs.concat(Array.prototype.slice.call(arguments)));
            };

        fNOP.prototype = this.prototype;
        fBound.prototype = new fNOP();

        return fBound;
    };
}

// usage: log('inside coolFunc',this,arguments);
// http://paulirish.com/2009/log-a-lightweight-wrapper-for-consolelog/
window.log = function() {
    log.history = log.history || [];   // store logs to an array for reference
    log.history.push(arguments);
    if (this.console) {
        console.log(Array.prototype.slice.call(arguments));
    }
};

window.debug = false;

/*!
 * ZOOLU JavaScript Library 0.1.0
 * http://zoolucms.org/
 *
 * Copyright 2012, Thomas Schedler
 * http://zoolucms.org/license
 */
(function(window, $, undefined) {

    'use strict';

    function log() {
        if (window.debug) window.log.apply(this, $.merge(['ZOOLU'], arguments));
    }

    var ZOOLU = {
        version: '0.1.0'
    };

    // expose ZOOLU to the global object
    window.ZOOLU = ZOOLU;

})(window, window.jQuery);