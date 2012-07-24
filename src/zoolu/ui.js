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
     *  throw new ZOOLU.UI.Exception('Message for the catcher!');
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
         *
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
        this.selectedElementIds = [];

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
         *
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
         * Updates instance data object with the fetched data
         * from the REST-Service for the current level.
         */
        updateData: function(data) {
            log('ColumnTree', 'updateData');

            this.data[this.level] = data;
        },

        /**
         * Updates current column with a list (<code>&lt;ul class="list"/&gt;</code>)
         * and the associated rows (<code>&lt;li class="row ' + node.type + '"/&gt;</code>)
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
         * Adds a new column to the tree (<code>&lt;div class="column"/&gt;</code>).
         */
        addColumn: function() {
            log('ColumnTree', 'addColumn');
            this.$container.append($('<div class="column"/>').attr('id', 'column-' + this.level).data('level', this.level));
        },

        /**
         * Prepares the row element (<code>&lt;li class="row ' + node.type + '"/&gt;</code>)
         * with all the properties. Stores node data (id, type, level) at the DOM element.
         *
         * @return {Object}
         */
        prepareRow: function(node) {
            log('ColumnTree', 'prepareRow', arguments);

            this.$row = $('<li class="row ' + node.type + '"/>').attr('id', 'row-' + node.id + '-' + node.type);
            this.$row.html(ZOOLU.UTIL.String.truncateInBetween(node.name, this.options.rowMaxLength));

            // store node data at the element
            this.$row.data('id', node.id);
            this.$row.data('type', node.type);
            this.$row.data('level', this.level);

            this.attachRowObservers(node);

            return this.$row;
        },

        /**
         * Attaches all observers (click, ...) to the row element.
         */
        attachRowObservers: function() {
            log('ColumnTree', 'attachRowObservers', arguments);

            this.$row.on('click', function(event) {
                this.select(event.target);
            }.bind(this));
        },

        /**
         * Selects a row element of a list. Loads the node children if the option
         * <code>hasChildren</code> is set for this kind of node-type.
         *
         * @param {Object} element Element which has been selected
         * @triggers ColumnTree.select with the selected object
         */
        select: function(element) {
            log('ColumnTree', 'select', arguments);

            this.$selected = $(element);
            this.selectedId = this.$selected.data('id');
            this.level = this.$selected.data('level');

            this.trigger('ColumnTree.select', [this.$selected]);
            this.updateSelectedMarker();

            // cleanup tree
            this.$container.find('.column').each(function(index, element) {
                if ($(element).data('level') > this.level) {

                    // cleanup dom
                    $(element).html('');

                    // cleanup data
                    delete(this.data[$(element).data('level')]);
                    delete(this.selectedElementIds[$(element).data('level')]);
                }
            }.bind(this));

            if (this.options.hasChildren.hasOwnProperty(this.$selected.data('type')) &&
                this.options.hasChildren[this.$selected.data('type')] === true) {

                this.level++;
                this.load();
            }
        },

        /**
         * Updates the selected marker of the current column.
         */
        updateSelectedMarker: function() {
            log('ColumnTree', 'updateSelectedMarker');

            if (this.selectedElementIds[this.level]) {
                log($('#' + this.selectedElementIds[this.level]));
                $('#' + this.selectedElementIds[this.level]).removeClass('selected');
            }

            this.$selected.addClass('selected');
            this.selectedElementIds[this.level] = this.$selected.attr('id');
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
        this.$container.addClass('busy');

        this.height = this.$container.outerHeight(true);
        this.width = this.$container.outerWidth(true);

        this.panels = {};

        // extend default options with given
        this.options = $.extend({
            fullScreen: true
        }, options);

        // add event API
        ZOOLU.MIXIN.Events.enable.call(this);

        log('Layout', 'construct', this);

        this.initialize();
    };

    ZOOLU.UI.Layout.prototype = /** @lends ZOOLU.UI.Layout# */ {

        constructor: ZOOLU.UI.Layout,

        CONST: {
            orientations: ['west', 'north', 'center']
        },

        initialize: function() {
            var panels;

            log('Layout', 'initialize');

            // if full screen, set some default html & body css properties
            if (this.options.fullScreen) {
                $('html').css({
                    height: '100%',
                    overflow: 'hidden',
                    overflowX: 'hidden',
                    overflowY: 'hidden'
                });

                $('body').css({
                    position: 'relative',
                    height: '100%',
                    overflow: 'hidden',
                    overflowX: 'hidden',
                    overflowY: 'hidden',
                    margin: 0,
                    padding: 0,
                    border: 'none'
                });
            }

            // find and init all panels
            for (var i = -1, length = this.CONST.orientations.length; ++i < length;) {
                panels = this.$container.find('> .' + this.CONST.orientations[i]);
                if (panels.length) {
                    this.initPanel(panels.first(), this.CONST.orientations[i]);
                }
            }

            this.arrange();

            // resize observer
            $(window).resize(this.arrange.bind(this));
        },

        enable: function() {

            // FIXME ??

            /** @ignore */
            this.initPanel = function(panel, orientation) {
                ZOOLU.UI.Layout.prototype.initPanel.call(this, panel, orientation);
            }.bind(this);

            /** @ignore */
            this.addPanel = function(panel) {
                ZOOLU.UI.Layout.prototype.addPanel.call(this, panel);
            }.bind(this);

            /** @ignore */
            this.arrange = function() {
                ZOOLU.UI.Layout.prototype.arrange.call(this);
            }.bind(this);
        },

        /**
         * Initialize panel of the current layout.
         *
         * @param {Object} panel Panel of the current layout
         * @param {String} orientation Orientation of the given panel
         */
        initPanel: function(panel, orientation) {

            log('Layout', 'initPanel', arguments);

            this.addPanel(new ZOOLU.UI.Layout.Panel(panel, this, orientation, this.options));
        },

        /**
         * Add instance of ZOOLU.UI.Layout.Panel to the current layout.
         *
         * @param {ZOOLU.UI.Layout.Panel} panel Instance of ZOOLU.UI.Layout.Panel
         */
        addPanel: function(panel) {

            log('Layout', 'addPanel', arguments);

            this.panels[panel.orientation] = panel;

            panel.on('Layout.Panel.resize', this.arrange.bind(this));
        },

        /**
         * Arrange all layout panels.
         */
        arrange: function() {

            if (!!this.layout) {
                log('Layout', 'Panel', 'arrange');
            } else {
                log('Layout', 'arrange');
            }

            //TODO cleanup!!!

            this.updateDimension();

            // west
            this.left = 0;
            if (this.panels.hasOwnProperty('west')) {
                this.panels.west.setPositionLeft(this.left);
                this.left += this.panels.west.width;
            }

            // north
            this.top = 0;
            if (this.panels.hasOwnProperty('north')) {
                this.panels.north.setPositionTop(this.top);
                this.top += this.panels.north.height;
            }

            // center
            if (this.panels.hasOwnProperty('center')) {
                this.panels.center.setPositionLeft(this.left);
                this.panels.center.setPositionTop(this.top);
                this.panels.center.updateDimension(
                    (this.left === 0 ? '100%' : this.width - this.left),
                    (this.top === 0 ? '100%' : this.height - this.top)
                );

                if (this.panels.center.hasChildren) {
                    this.panels.center.arrange();
                }
            }

            this.unbusy();
        },

        unbusy: function() {
            this.$container.removeClass('busy');
        },

        updateDimension: function(width, height) {
            if (!!width) {
                this.$container.width(width);
            }

            if (!!height) {
                this.$container.height(height);
            }

            this.height = this.$container.outerHeight(true);
            this.width = this.$container.outerWidth(true);
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
     * @param {ZOOLU.UI.Layout} layout Instance of the parent ZOOLU.UI.Layout
     * @param {Object} options Default options will be merged with the given options
     * @throws {ZOOLU.UI.Exception} Panel doesn't exist!
     * @author <a href="mailto:thomas@chirimoya.at">Thomas Schedler</a>
     */
    ZOOLU.UI.Layout.Panel = function(element, layout, orientation, options) {
        this.$element = $(element);
        this.layout = layout;
        this.orientation = orientation;
        this.hasChildren = false;
        this.handler = null;
        this.handlerCursor = '';
        this.minimizer = null;
        this.closed = false;
        this.tmpHeight = 0;
        this.tmpWidth = 0;

        if (!this.$element.length) {
            throw new ZOOLU.UI.Exception("Panel doesn't exist!");
        }

        // add css class
        this.$element.addClass('panel');

        this.height = this.$element.outerHeight(true);
        this.width = this.$element.outerWidth(true);

        // extend default options with given
        this.options = $.extend({
            minimizeHeight: 5,
            minimizeWidth: 50,
            minimizeOrientations: ['north', 'west'],
            storeDimensions: true
        }, options);

        // add event API
        ZOOLU.MIXIN.Events.enable.call(this);

        log('Layout', 'Panel', 'construct', this);

        this.initialize();

        if (this.orientation === 'center') {
            ZOOLU.UI.Layout.prototype.enable.call(this);
            this.panels = {};
            this.initializeLayout();
        }
    };

    ZOOLU.UI.Layout.Panel.prototype = /** @lends ZOOLU.UI.Layout.Panel# */ {

        constructor: ZOOLU.UI.Layout.Panel,

        initialize: function() {
            if (this.options.storeDimensions === true) {
                this.store = ZOOLU.STORE.Cookie.getInstance();
                log('PANEL.' + this.orientation + '.height', this.store.get('PANEL.' + this.orientation + '.height'));
                log('PANEL.' + this.orientation + '.width', this.store.get('PANEL.' + this.orientation + '.width'));
            }
            this.applyStoredDimensions();

            this.$handler = $('<div class="handler"/>');
            this.$handler.appendTo(this.$element);
            this.$handlerCursor = this.$handler.css('cursor');
            this.addMinimizer(this.$handler, this.options.minimizeOrientations);

            this.$minimizer.click(function(event) {
                event.stopPropagation();
                if (this.closed === false) {
                    this.$handler.trigger('Layout.Panel.minimize');
                    this.minimize();
                } else {
                    this.$handler.trigger('Layout.Panel.maximize');
                    this.maximize(this.tmpHeight);
                }
            }.bind(this));
            
            this.toggleHandlerEvents();
            
        },

        /**
         * Adds a Minimizer DOM-Element into an other DOM-Element
         *
         * @private
         * @param {Object} DOM-Object in which the minimizer is added
         * @param {Array} Array that specifies to which panels Minimizer are added.
         * @example
         *  this.addMinimizer($('.handler'), ['west', 'north']);
         * @author <a href="mailto:marcel.moosbrugger@bws.ac.at">Marcel Moosbrugger</a>
         */
        addMinimizer: function(element, orientations) {
            this.$minimizer = $('<div class="minimizer"/>');
            for (var i = 0; i < orientations.length; i++) {
                if (this.orientation === orientations[i]) {
                    this.$minimizer.appendTo(element);
                }
            }
        },

        initializeLayout: function() {
            var panels;

            log('Layout', 'Panel', 'initialize');

            // find and init all panels
            for (var i = -1, length = ZOOLU.UI.Layout.prototype.CONST.orientations.length; ++i < length;) {
                panels = this.$element.find('> .' + ZOOLU.UI.Layout.prototype.CONST.orientations[i]);
                if (panels.length) {
                    this.hasChildren = true;
                    this.initPanel(panels.first(), ZOOLU.UI.Layout.prototype.CONST.orientations[i]);
                }
            }
        },

        /**
         * Gets the Cookies for the current panel and applys the width and height of
         * the cookie to the element (if they are given)
         *
         * @private
         * @author <a href="mailto:marcel.moosbrugger@bws.ac.at">Marcel Moosbrugger</a>
         */
        applyStoredDimensions: function() {
            if (!!this.store) {
                if (this.store.get('PANEL.' + this.orientation + '.height') !== null) {
                    this.updateDimension(null, this.store.get('PANEL.' + this.orientation + '.height'));
                    this.trigger('Layout.Panel.resize');
                }
                if (this.store.get('PANEL.' + this.orientation + '.width') !== null) {
                    this.updateDimension(this.store.get('PANEL.' + this.orientation + '.width'));
                    this.trigger('Layout.Panel.resize');
                }
                this.tmpWidth = this.$element.width();
                this.tmpHeight = this.$element.height();
            }
        },

        /**
         * Stores a width and a height in a cookie
         *
         * @private
         * @param {Integer} width Width to store
         * @param {Integer} height Height to store
         * @author <a href="mailto:marcel.moosbrugger@bws.ac.at">Marcel Moosbrugger</a>
         */
        storeDimensions: function(width, height) {
            if (!!this.store) {
                if (!!width || width === 0) {
                    this.store.set('PANEL.' + this.orientation + '.width', width);
                }
                if (!!height || height === 0) {
                    this.store.set('PANEL.' + this.orientation + '.height', height);
                }
            }
        },


        /**
         * Minimize the panel, triggers resize event, removes the resize event from the handler
         * and adds an onclick event to the handler
         *
         * @private
         * @author <a href="mailto:marcel.moosbrugger@bws.ac.at">Marcel Moosbrugger</a>
         */
        minimize: function() {
            if (this.orientation === 'west') {
                this.updateDimension(this.options.minimizeWidth);
            } else {
                this.tmpHeight = this.$element.height();
                this.updateDimension(null, this.options.minimizeHeight);
            }
            this.trigger('Layout.Panel.resize');
            this.removeEvent(this.$handler, 'mousedown');
            this.toggleHandlerEvents(this.closed);
            this.closed = true;
        },

        /**
         * Maximize the panel to the last width/height, triggers a resize event,
         * removes the click-Event from the handler, adds the resize event back to the handler
         *
         * @private
         * @author <a href="mailto:marcel.moosbrugger@bws.ac.at">Marcel Moosbrugger</a>
         */
        maximize: function() {
            if (this.orientation === 'west') {
                this.updateDimension(this.tmpWidth);
            } else {
                this.updateDimension(null, this.tmpHeight);
            }
            this.trigger('Layout.Panel.resize');
            this.removeEvent(this.$handler, 'click');
            this.toggleHandlerEvents(this.closed);
            this.closed = false;
        },

        /**
         * Toggles the resize and the click event for the handler
         *
         * @private
         * @param {Boolean} action In accordance with minimized/maximized - true: currently minimized
         * @author <a href="mailto:marcel.moosbrugger@bws.ac.at">Marcel Moosbrugger</a>
         */
        toggleHandlerEvents: function(action) {
            if (action === false) /*minimize*/ {
                this.$handler.css('cursor', 'pointer');
                this.$handler.bind('click', function() {
                    this.$handler.trigger('Layout.Panel.maximize');
                    this.maximize(this.tmpHeight);
                }.bind(this));
            } else /*maximize*/ {
                this.$handler.css('cursor', this.handlerCursor);
                // TODO cleanup!!!
                this.$handler.mousedown(function(event) {
                    $(document).on('mousemove.layout', this.resize.bind(this));
                }.bind(this));  
                
                this.$handler.mouseup(function() {
                    $(document).off('mousemove.layout');
                });
            }
        },

        /**
         * Removes an event from an element
         *
         * @private
         * @param {Object} element DOM-Object from which the event will be removed
         * @param {String} event Event which will be removed
         * @author <a href="mailto:marcel.moosbrugger@bws.ac.at">Marcel Moosbrugger</a>
         */
        removeEvent: function(element, event) {
            element.unbind(event);
        },

        /**
         *
         * @param {Object} event
         * @triggers Layout.Panel.resize
         */
        resize: function(event) {
            //log(event.pageX + ', ' + event.pageY);

            if (this.orientation === 'west') {
                this.updateDimension(event.pageX + (this.$handler.width() / 2));
            } else {
                this.updateDimension(null, event.pageY + (this.$handler.height() / 2));
            }

            this.trigger('Layout.Panel.resize');
        },

        unbusy: function() {
            this.$element.removeClass('busy');
        },

        updateDimension: function(width, height) {
            if (!!width || width === 0) {
                this.$element.width(width);
                this.storeDimensions(width);
            }

            if (!!height || height === 0) {
                this.$element.height(height);
                this.storeDimensions(null, height);
            }

            this.height = this.$element.outerHeight(true);
            this.width = this.$element.outerWidth(true);
        },

        setPositionLeft: function(left) {

            log('Layout', 'Panel', 'setPositionLeft', this.orientation);

            this.$element.css({left: left});
        },

        setPositionTop: function(top) {

            log('Layout', 'Panel', 'setPositionTop', this.orientation);

            this.$element.css({top: top});
        }

    };

})(window, window.ZOOLU, window.jQuery);
