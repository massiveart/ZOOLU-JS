/**
 * ZOOLU v2.0.0.alpha1
 * http://zoolucms.org/
 *
 * @category ZOOLU
 * @package UTIL
 * @copyright Copyright (c) 2011-2012 MASSIVE ART WebServices (http://www.massiveart.com)
 * @license http://zoolucms.org/license
 */
(function(window, ZOOLU, $, undefined) {

    'use strict';

    function log() {
        if (window.debug) {
            window.log.apply(window, $.merge(['ZOOLU', 'STORE'], arguments));
        }
    }

    /** @namespace */
    ZOOLU.STORE = { };

    /**
     * @namespace
     * @example
     *  var store = ZOOLU.STORE.Cookie.getInstance();
     *  store.set('UI.Layout.height', 80);
     *  store.get('UI.Layout.height');
     *
     * @author <a href="mailto:thomas@chirimoya.at">Thomas Schedler</a>
     */
    ZOOLU.STORE.Cookie = /** @lends ZOOLU.STORE.Cookie */ (function() {

        var instance;
        var counter = 1;

        function init() {
            var properties = JSON.parse($.cookie('ZOOLU')) || { };

            return {

                set: function(key, value) {
                    properties[key] = value;
                    $.cookie('ZOOLU', JSON.stringify(properties));
                },

                get: function(key) {
                    return (properties[key]) ? properties[key] : null;
                }
            };
        }

        ;

        return {
            getInstance: function() {
                if (!instance) {
                    instance = init();
                }
                return instance;
            }
        };
    })();

})(window, window.ZOOLU, window.jQuery);
