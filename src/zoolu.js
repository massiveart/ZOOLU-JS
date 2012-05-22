// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/bind
if (!Function.prototype.bind) {
    Function.prototype.bind = function(oThis) {
        if (typeof this !== 'function') {
            // closest thing possible to the ECMAScript 5 internal IsCallable function
            throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
        }

        var Args = Array.prototype.slice.call(arguments, 1),
            ToBind = this,
            NOP = function() {
            },
            Bound = function() {
                return ToBind.apply(this instanceof NOP ? this : oThis || window, Args.concat(Array.prototype.slice.call(arguments)));
            };

        NOP.prototype = this.prototype;
        Bound.prototype = new NOP();

        return Bound;
    };
}

// usage: log('inside coolFunc',this,arguments);
// http://paulirish.com/2009/log-a-lightweight-wrapper-for-consolelog/
window.log = function() {
    this.log.history = this.log.history || [];   // store logs to an array for reference
    this.log.history.push(arguments);
    if (this.console) {
        this.console.log(Array.prototype.slice.call(arguments));
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
        if (window.debug) {
            window.log.apply(window, $.merge(['ZOOLU'], arguments));
        }
    }

    var ZOOLU = {
        version: '0.1.0'
    };

    // expose ZOOLU to the global object
    window.ZOOLU = ZOOLU;

})(window, window.jQuery);