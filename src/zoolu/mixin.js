/**
 * ZOOLU v2.0.0.alpha1
 * http://zoolucms.org/
 *
 * @category ZOOLU
 * @package MIXIN
 * @copyright Copyright (c) 2011-2012 MASSIVE ART WebServices (http://www.massiveart.com)
 * @license http://zoolucms.org/license
 */
(function(window, ZOOLU, $, undefined) {

    'use strict';

    function log() {
        if (window.debug) {
            window.log.apply(window, $.merge(['ZOOLU', 'MIXIN'], arguments));
        }
    }

    /** @namespace */
    ZOOLU.MIXIN = {};

    /**
     * This is an event API that can be mixed into other objects.
     * @class
     * @author <a href="mailto:thomas@chirimoya.at">Thomas Schedler</a>
     */
    ZOOLU.MIXIN.Events = /** @lends ZOOLU.MIXIN.Events# */ {

        /**
         * Enables event consumption and management on the provided class. This needs to be called
         * from the context of the object in which events are to be enabled.
         *
         * @public
         * @example
         *  var MyObj = function() {
         *      this.init = function() {
         *          ZOOLU.MIXIN.Events.enable.call(this);
         *      };
         *
         *      this.log = function() {
         *          console.log(this);
         *          this.trigger('log');
         *      };
         *
         *      this.init();
         *  };
         *
         *  var obj = new MyObj();
         *  obj.on('log', function() { console.log('Event triggered!'); });
         *  obj.log();
         */
        enable: function() {

            if (!this.listeners) {
                this.listeners = { };
            }

            /** @ignore */
            this.trigger = function(event, args) {
                ZOOLU.MIXIN.Events.trigger.call(this, event, args);
            }.bind(this);

            /** @ignore */
            this.on = function(event, callback) {
                ZOOLU.MIXIN.Events.on.call(this, event, callback);
            }.bind(this);

            /** @ignore */
            this.off = function(event, callback) {
                ZOOLU.MIXIN.Events.off.call(this, event, callback);
            }.bind(this);
        },

        /**
         * Triggers the provided <code>event</code> and executes all listeners attached
         * to it. If <code>args</code> is provided, they will be passed along to the listeners.
         *
         * @public
         * @param {String} event The name of the event to trigger
         * @param {Array} args Optional array of args to pass to the listeners
         */
        trigger: function(event, args) {
            if (!!this.listeners[event]) {
            	if(args == undefined){
            		args = [];
            	}
                for (var i = -1, length = this.listeners[event].length; ++i < length;) {
                    // execute in the global scope (window), though this could also be customized
                	this.listeners[event][i].apply(window, args);
                }
            }
        },

        /**
         * Binds the execution of the provided <code>callback</code> when the <code>event</code> is triggered.
         *
         * @public
         * @param {String} event The name of the event to bind
         * @param {Function} callback A function to bind to the event
         */
        on: function(event, callback) {

            if (!this.listeners[event]) {
                this.listeners[event] = [];
            }

            // verify a function is being added
            if (callback instanceof Function) {
                this.listeners[event].push(callback);
            }
        },

        /**
         * Removes the provided <code>callback</code> from the <code>event</code>. If no function is
         * provided, all listeners for this event are removed.
         *
         * @public
         * @param {String} event The name of the event to unbind
         * @param {Function} callback An optional listener to be removed
         */
        off: function(event, callback) {
            if (!!this.listeners[event] && this.listeners[event].length > 0) {
                // if a listener is provided
                if (!!callback) {
                    var callbacks = [];

                    for (var i = -1, length = this.listeners[event].length; ++i < length;) {
                        if (callback !== this.listeners[event][i]) {
                            callbacks.push(this.listeners[event][i]);
                        }
                    }
                    this.listeners[event] = callbacks;
                } else { // no listener, so remove them all
                    this.listeners[event] = [];
                }
            }
        }
    };

})(window, window.ZOOLU, window.jQuery);