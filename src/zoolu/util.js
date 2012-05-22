/*!
 * ZOOLU UI JavaScript Library 0.1.0
 * http://zoolucms.org/
 *
 * Copyright 2012, Thomas Schedler
 * http://zoolucms.org/license
 */
(function(window, ZOOLU, $, undefined) {

    'use strict';

    function log() {
        if (window.debug) {
            window.log.apply(window, $.merge(['ZOOLU', 'UTIL'], arguments));
        }
    }

    var Events = {
        fire: function(event, args) {
            if (!!this.listeners[event]) {
                for (var i = -1, length = this.listeners[event].length; ++i < length;) {
                    // execute in the global scope (window), though this could also be customized
                    this.listeners[event][i].apply(window, args);
                }
            }
        },

        on: function(event, callback) {
            // verify we have events enabled
            Events.enable.call(this, event);

            if (!this.listeners[event]) {
                this.listeners[event] = [];
            }

            // verify a function is being added
            if (callback instanceof Function) {
                this.listeners[event].push(callback);
            }
        },

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
        },

        enable: function() {

            if (!this.listeners) {
                this.listeners = {};
            }

            this.fire = function(event, args) {
                Events.fire.call(this, event, args);
            }.bind(this);

            this.on = function(event, callback) {
                Events.on.call(this, event, callback);
            }.bind(this);

            this.off = function(event, callback) {
                Events.off.call(this, event, callback);
            }.bind(this);
        }
    };

    var String = {

    };

    $.extend(ZOOLU, {
        UTIL: {
            Events: Events,
            String: String
        }
    });

})(window, window.ZOOLU, window.jQuery);