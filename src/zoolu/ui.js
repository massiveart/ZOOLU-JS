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
            window.log.apply(window, $.merge(['ZOOLU', 'UI'], arguments));
        }
    }

    var ColumnTree = function(container, options) {
        this.$container = $(container);

        if (!this.$container.length) {
            throw "Column container doesn't exist!";
        }

        this.$container.addClass('column-tree');

        this.options = $.extend({
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

    ColumnTree.prototype = {

        CONST: {
            nodeTypes: {
                folder: 'folder',
                page: 'page',
                startPage: 'start-page'
            }
        },

        constructor: ColumnTree,

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

            if (this.$selected.data('type') === ColumnTree.prototype.CONST.nodeTypes.folder) {
                this.level++;
                this.load();
            }
        }
    };

    $.extend(ZOOLU, {
        UI: {
            ColumnTree: ColumnTree
        }
    });

})(window, window.ZOOLU, window.jQuery);