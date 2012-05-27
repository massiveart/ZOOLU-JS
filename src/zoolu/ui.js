/**
 * ZOOLU v2.0.0.alpha1
 * http://zoolucms.org/
 *
 * @category ZOOLU
 * @package UI
 * @copyright Copyright (c) 2011-2012 MASSIVE ART WebServices (http://www.massiveart.com)
 * @license http://zoolucms.org/license
 */
(function(window, ZOOLU, $, undefined) {

    'use strict';

    function log() {
        if (window.debug) {
            window.log.apply(window, $.merge(['ZOOLU', 'UI'], arguments));
        }
    }

    /** @namespace */
    ZOOLU.UI = { };

    /**
     * ZOOLU UI Exception
     *
     * @class
     * @constructor
     * @example
     *  throw new ZOOLU.UI.Exception('Message for the catcher.');
     *
     * @param {String|Null} message Message which is throw to the catcher
     * @author <a href="mailto:thomas@chirimoya.at">Thomas Schedler</a>
     */
    ZOOLU.UI.Exception = function(message) {
        this.name = 'ZOOLU.UI.Exception';
        this.message = message || 'Something went wrong!';
    };

    ZOOLU.UI.Exception.prototype = /** @lends ZOOLU.UI.Exception# */ {

        constructor: ZOOLU.UI.Exception,

        /**
         * Make the exception convert to a pretty string when used as
         * a string. (e.g. by the error console)
         * @return {String}
         */
        toString: function() {
            return this.name + ': "' + this.message + '"';
        }
    };

    /**
     * ZOOLU ColumnTree UI Element
     *
     * @class
     * @constructor
     * @example
     *  var columnTree = new ZOOLU.UI.ColumnTree('#tree', {
     *      url: '/nodes',
     *      hasChildren: { 'folder': true }
     *  });
     *
     * @borrows ZOOLU.MIXIN.Events#trigger as #trigger
     * @borrows ZOOLU.MIXIN.Events#on as #on
     * @borrows ZOOLU.MIXIN.Events#off as #off
     * @param {String} container Selector to get the column tree container
     * @param {Object} options Default options will be merged with the given options
     * @throws {ZOOLU.UI.Exception} ColumnTree container doesn't exist!
     * @author <a href="mailto:thomas@chirimoya.at">Thomas Schedler</a>
     */
    ZOOLU.UI.ColumnTree = function(container, options) {
        this.$container = $(container);

        if (!this.$container.length) {
            throw new ZOOLU.UI.Exception("ColumnTree container doesn't exist!");
        }

        // add css class
        this.$container.addClass('column-tree');

        // extend default options with given
        this.options = $.extend({
            hasChildren: { },
            urlAddOnForLoadingNodeChildren: '/children',
            rowMaxLength: 30
        }, options);

        this.level = 0;
        this.selectedId = null;

        this.$selected = null;
        this.$currentColumn = null;

        this.data = [];

        // add event API
        ZOOLU.MIXIN.Events.enable.call(this);

        log('ColumnTree', 'construct', this);

        // try to load first level
        this.load();
    };

    ZOOLU.UI.ColumnTree.prototype = /** @lends ZOOLU.UI.ColumnTree# */ {

        constructor: ZOOLU.UI.ColumnTree,

        /**
         * Loads nodes from the given REST service entry point (<code>options.url</code>).
         * If there is a selected node, the children of this node will be loaded.
         * @triggers ColumnTree.load
         */
        load: function() {
            log('ColumnTree', 'load');

            if (this.options.url) {
                this.trigger('ColumnTree.load');

                // add column if is missing for the current level
                if (this.$container.find('.column').length <= this.level) {
                    this.addColumn();
                }

                this.$currentColumn = $('#column-' + this.level);
                this.$currentColumn.addClass('busy');

                $.ajax({
                    url: this.selectedId ? this.options.url + '/' + this.selectedId + this.options.urlAddOnForLoadingNodeChildren : this.options.url,
                    type: 'GET',
                    dataType: 'JSON',
                    success: function(data) {
                        log('ColumnTree', 'load', 'success', data);
                        this.updateData(data);
                        this.updateView();
                    }.bind(this),
                    error: function(jqXHR, textStatus) {
                        log('ColumnTree', 'load', 'error', textStatus);
                        this.$currentColumn.removeClass('busy');
                        // TODO
                    }.bind(this)
                });
            }
        },

        /**
         *
         */
        updateData: function(data) {
            log('ColumnTree', 'updateData');

            this.data[this.level] = data;
        },

        /**
         *
         * @throws {ZOOLU.UI.Exception} Current column not found!
         */
        updateView: function() {
            log('ColumnTree', 'updateView');

            if (!this.$currentColumn.length) {
                throw new ZOOLU.UI.Exception('Current column not found!');
            }

            this.$currentColumn.removeClass('busy');

            this.$list = $('<ul class="list"/>');

            // http://jsperf.com/loops3/2
            for (var i = -1, length = this.data[this.level].length; ++i < length;) {
                this.prepareRow(this.data[this.level][i]).appendTo(this.$list);
            }

            this.$currentColumn.html(this.$list);

            // cleanup
            delete this.$row;
            delete this.$list;
        },

        /**
         *
         */
        addColumn: function() {
            log('ColumnTree', 'addColumn');
            this.$container.append($('<div class="column"/>').attr('id', 'column-' + this.level).data('level', this.level));
        },

        /**
         *
         * @return {Object}
         */
        prepareRow: function(node) {
            log('ColumnTree', 'prepareRow', arguments);

            this.$row = $('<li class="row ' + node.type + '"/>').attr('id', 'row-' + node.id + '-' + node.type);
            this.$row.html(ZOOLU.UTIL.String.truncateInBetween(node.name, this.options.rowMaxLength));

            // store node data to the element
            this.$row.data('id', node.id);
            this.$row.data('type', node.type);
            this.$row.data('level', this.level);

            this.attachRowObservers(node);

            return this.$row;
        },

        /**
         *
         */
        attachRowObservers: function() {
            log('ColumnTree', 'attachRowObservers', arguments);

            this.$row.on('click', function(event) {
                this.select(event.target);
            }.bind(this));
        },

        /**
         *
         * @param {Object} element Element which has been selected
         * @triggers ColumnTree.select with the selected object
         */
        select: function(element) {
            log('ColumnTree', 'select', arguments);

            this.$selected = $(element);
            this.trigger('ColumnTree.select', [this.$selected]);
            this.updateSelectedMarker();

            this.$selected.addClass('selected');

            this.selectedId = this.$selected.data('id');
            this.level = this.$selected.data('level');

            // cleanup tree
            this.$container.find('.column').each(function(index, element) {
                if ($(element).data('level') > this.level) {
                    $(element).html('');
                }
            }.bind(this));

            if (this.options.hasChildren.hasOwnProperty(this.$selected.data('type')) &&
                this.options.hasChildren[this.$selected.data('type')] === true) {

                this.level++;
                this.load();
            }
        },

        /**
         *
         */
        updateSelectedMarker: function() {
            // TODO
        }
    };

    /**
     * ZOOLU Layout UI Element
     *
     * @class
     * @constructor
     * @example
     *  var layout = new ZOOLU.UI.Layout('#layout');
     *
     * @borrows ZOOLU.MIXIN.Events#trigger as #trigger
     * @borrows ZOOLU.MIXIN.Events#on as #on
     * @borrows ZOOLU.MIXIN.Events#off as #off
     * @param {String} container Selector to get the layout container
     * @param {Object} options Default options will be merged with the given options
     * @throws {ZOOLU.UI.Exception} Layout container doesn't exist!
     * @author <a href="mailto:thomas@chirimoya.at">Thomas Schedler</a>
     */
    ZOOLU.UI.Layout = function(container, options) {
        this.$container = $(container);

        if (!this.$container.length) {
            throw new ZOOLU.UI.Exception("Layout container doesn't exist!");
        }

        // add css class
        this.$container.addClass('layout');

        this.panels = [];

        // extend default options with given
        this.options = $.extend({
            fullPage: true,
            possiblePanels: ['west', 'north', 'center'],
            hasChildPanels: ['center']
        }, options);

        // add event API
        ZOOLU.MIXIN.Events.enable.call(this);

        log('Layout', 'construct', this);

        this.initialize();
    };

    ZOOLU.UI.Layout.prototype = /** @lends ZOOLU.UI.Layout# */ {

        constructor: ZOOLU.UI.Layout,

        initialize: function() {

            log('Layout', 'initialize');

            for (var i = -1, length = this.options.possiblePanels.length; ++i < length;) {
                this.$container.find('> .' + this.options.possiblePanels[i]).each(this.initPanel.bind(this));
            }
        },

        /**
         * Callback
         * @private
         * @param idx
         * @param el
         */
        initPanel: function(idx, el) {

            log('Layout', 'initPanel', arguments);

            this.addPanel(new ZOOLU.UI.Layout.Panel(el, this.options));
        },

        addPanel: function(panel){

            log('Layout', 'addPanel', arguments);

            this.panels.push(panel);
        }
    };

    /**
     * ZOOLU Layout Panel UI Element
     *
     * @class
     * @constructor
     * @private
     * @borrows ZOOLU.MIXIN.Events#trigger as #trigger
     * @borrows ZOOLU.MIXIN.Events#on as #on
     * @borrows ZOOLU.MIXIN.Events#off as #off
     * @param {String} element Selector to get the panel
     * @param {Object} options Default options will be merged with the given options
     * @throws {ZOOLU.UI.Exception} Panel doesn't exist!
     * @author <a href="mailto:thomas@chirimoya.at">Thomas Schedler</a>
     */
    ZOOLU.UI.Layout.Panel = function(element, options) {
        this.$element = $(element);

        if (!this.$element.length) {
            throw new ZOOLU.UI.Exception("Panel doesn't exist!");
        }

        // add css class
        this.$element.addClass('panel');

        // extend default options with given
        this.options = $.extend({

        }, options);

        // add event API
        ZOOLU.MIXIN.Events.enable.call(this);

        log('Layout', 'Panel', 'construct', this);
    };

    ZOOLU.UI.Layout.Panel.prototype = /** @lends ZOOLU.UI.Layout.Panel# */ {

        constructor: ZOOLU.UI.Layout.Panel
    };

})(window, window.ZOOLU, window.jQuery);