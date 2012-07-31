if (!Function.prototype.bind) {
    /**
     * @link https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/bind
     */
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

/**
 * @link http://paulirish.com/2009/log-a-lightweight-wrapper-for-consolelog/
 * @example
 *  log('inside coolFunc',this,arguments);
 */
window.log = function() {
    this.log.history = this.log.history || [];   // store logs to an array for reference
    this.log.history.push(arguments);
    if (this.console) {
        this.console.log(Array.prototype.slice.call(arguments));
    }
};

window.debug = false;

/**
 * ZOOLU v2.0.0.alpha1
 * http://zoolucms.org/
 *
 * @category ZOOLU
 * @copyright Copyright (c) 2011-2012 MASSIVE ART WebServices (http://www.massiveart.com)
 * @license http://zoolucms.org/license
 */
(function(window, $, undefined) {

    'use strict';

    function log() {
        if (window.debug) {
            window.log.apply(window, $.merge(['ZOOLU'], arguments));
        }
    }

    var ZOOLU;

    /** @namespace */
    ZOOLU = {
        /**
         * ZOOLU version
         * @var {String}
         */
        version: '2.0.0.alpha1'
    };

    // expose ZOOLU to the global object
    window.ZOOLU = window.$z = ZOOLU;

})(window, window.jQuery);

