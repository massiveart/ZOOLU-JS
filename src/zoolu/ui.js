/**
 * ZOOLU UI JavaScript Library 0.1.0
 * http://zoolucms.org/
 *
 * @copyright Thomas Schedler <thomas@chirimoya.at>
 *
 * http://zoolucms.org/license
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
     * ZOOLU ColumnTree UI Element
     *
     * @class
     * @example
     *  var columnTree = new ZOOLU.UI.ColumnTree('#tree', {
     *      url: '/nodes',
     *      hasChildren: { 'folder': true }
     *  });
     *
     * @borrows ZOOLU.UTIL.Events#fire as #fire
     * @borrows ZOOLU.UTIL.Events#on as #on
     * @borrows ZOOLU.UTIL.Events#off as #off
     * @param {String} container Selector to get the column tree container
     * @param {Object} options Default options will be merged with the given options
     */
    ZOOLU.UI.ColumnTree = function(container, options) {
        this.$container = $(container);

        if (!this.$container.length) {
            throw "Column container doesn't exist!";
        }

        this.$container.addClass('column-tree');

        this.options = $.extend({
            hasChildren: { },
            urlAddOnForLoadingNodeChildren: '/children'
        }, options);

        this.level = 0;
        this.selectedId = null;

        this.$selected = null;
        this.$currentColumn = null;

        this.data = [];

        log('ColumnTree', 'construct', this);

        ZOOLU.UTIL.Events.enable.call(this);

        this.load();
    };

    ZOOLU.UI.ColumnTree.prototype = /** @lends ZOOLU.UI.ColumnTree# */{

        constructor: ZOOLU.UI.ColumnTree,

        /**
         * Loads nodes from the given REST service entry point (<code>options.url</code>).
         * If there is a selected node, his children will be loaded.
         *
         * @public
         */
        load: function() {
            log('ColumnTree', 'load');

            if (this.options.url) {
                this.fire('ColumnTree.load');

                if (this.$container.find('.column').length <= this.level) {
                    this.addColumn();
                }

                this.$currentColumn = $('#column-' + this.level);
                this.$currentColumn.addClass('busy');

                $.ajax({
                    url: this.selectedId ? this.options.url + '/' + this.selectedId + this.options.urlAddOnForLoadingNodeChildren : this.options.url,
                    type: 'GET',
                    dataType: 'JSON',
                    success: function(data, textStatus, jqXHR) {
                        log('ColumnTree', 'load', 'success', data);
                        this.updateData(data);
                        this.updateView();
                    }.bind(this),
                    error: function(jqXHR, textStatus, errorThrown) {
                        log('ColumnTree', 'load', 'error', textStatus);
                        this.$currentColumn.removeClass('busy');
                        // TODO
                    }.bind(this)
                });
            }
        },

        updateData: function(data) {
            log('ColumnTree', 'updateData');

            this.data[this.level] = data;
        },

        updateView: function() {
            log('ColumnTree', 'updateView');

            if (!this.$currentColumn.length) {
                throw "Current column not found!";
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

            log('ColumnTree', 'updateView', this.$currentColumn);
        },

        addColumn: function() {
            log('ColumnTree', 'addColumn');
            this.$container.append($('<div class="column"/>').attr('id', 'column-' + this.level).data('level', this.level));
        },

        prepareRow: function(node) {
            log('ColumnTree', 'prepareRow', arguments);

            this.$row = $('<li class="row ' + node.type + '"/>').attr('id', 'row-' + node.id + '-' + node.type);
            this.$row.html(node.name);

            // store node data to the element
            this.$row.data('id', node.id);
            this.$row.data('type', node.type);
            this.$row.data('level', this.level);

            this.attachRowObservers(node);

            return this.$row;
        },

        attachRowObservers: function() {
            log('ColumnTree', 'attachRowObservers', arguments);

            this.$row.on('click', function(event) {
                this.select(event.target);
            }.bind(this));
        },

        select: function(element) {
            log('ColumnTree', 'select', arguments);
            this.$selected = $(element);
            this.fire('ColumnTree.select', [this.$selected]);

            this.$selected.addClass('selected');

            this.selectedId = this.$selected.data('id');
            this.level = this.$selected.data('level');

            this.$container.find('.column').each(function(index, element) {
                log(element);
                if ($(element).data('level') > this.level) {
                    $(element).html('');
                }
            }.bind(this));

            if (this.options.hasChildren.hasOwnProperty(this.$selected.data('type')) &&
                this.options.hasChildren[this.$selected.data('type')] === true) {

                this.level++;
                this.load();
            }
        }
    };

})(window, window.ZOOLU, window.jQuery);