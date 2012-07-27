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
            this.$container.width(this.totalColumnWidth());
            this.$container.append($('<div class="column"/>').attr('id', 'column-' + this.level).data('level', this.level));
        },

        /**
         * Returns the sum of all column widths + the width of the added one
         */
        totalColumnWidth: function() {
            var intWidth = $('.column').outerWidth();
            this.$container.find('.column').each(function() {
                intWidth = intWidth + $(this).outerWidth();
            });
            return intWidth;
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
            log('passed at');
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
            for (var i = -1, length = orientations.length; ++i < length;) {
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
                this.tmpWidth = this.$element.width();
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

    /**
     * ZOOLU Modal View UI Element
     *
     * @class
     * @constructor
     * @public
     * @borrows ZOOLU.MIXIN.Events#trigger as #trigger
     * @borrows ZOOLU.MIXIN.Events#on as #on
     * @borrows ZOOLU.MIXIN.Events#off as #off
     * @triggers Modal.activate
     * @triggers Modal.deactivate
     * @param {Object} options Default options will be merged with the given options
     * @example
     *
     *  var modal = new ZOOLU.UI.Modal({
     *      fadeIn: true,
     *      headerTitle. 'My first ZOOLU Modal View'
     *  });
     *
     * @author <a href="mailto:marcel.moosbrugger@bws.ac.at">Marcel Moosbrugger</a>
     */
    ZOOLU.UI.Modal = function(options) {
        this.$element = null;
        this.$background = null;
        this.$header = null;
        this.$headerTitle = null;
        this.$headerClose = null;
        this.$content = null;
        this.content = '';
        this.$footer = null;
        this.$footerClose = null;
        this.footerButtons = [];
        this.css = [];
        this.$footerButtons = null;

        // extend default options with given
        this.options = $.extend({
            top: false, //CSS valid value or false
            bottom: false, //CSS valid value or false
            left: false, //CSS valid value or false
            right: false, //CSS valid value or false
            fadeIn: false, //true for a pretty fade in
            fadeInDuration: 600, // ms
            fadeOut: false, //enable/disable fade out
            fadeOutDuration: 600, //ms
            header: true, //false for no footer
            headerTitle: 'This is a title', //String - Headline displayed in header
            headerTitleClass: 'headline', //String - CSS class for header
            headerClose: true, //enable/disable closing in the header
            headerCloseClass: 'close', //String - CSS class
            footer: true, //enable/disable footer
            footerClose: true, //enable/disable closing in the footer
            footerCloseClass: 'close', //String - CSS class
            footerCloseText: 'Cancel', //String
            footerButtons: true, //enable/disable buttons in the footer
            footerButtonsContainerClass: 'buttons', //String - CSS class
            footerButtonDefaultClass: 'button', //String - CSS class
            overlay: true, //false for no overlay
            overlayClass: 'modalOverlay', //String - CSS class
            overlayColor: '#000000', //CSS valid background-color
            overlayClose: true, //enable/disable closing with click on the overlay
            overlayOpacity: '0.5', //CSS valid value for opacity
            draggable: true, //enable/disable dragging for the modal View
            draggableGrid: false, //x,y values e.g. [50,30]
            draggableOnlyOnHeader: true, //enable/disable dragging only on the header
            resizable: true, //enables/disables resizing for the modal view
            resizeMinWidth: 10, //Integer or null
            resizeMaxWidth: null, //Integer or null
            resizeMinHeight: 10, //Integer or null
            resizeMaxHeight: null                   //Integer or null
        }, options);

        // add event API
        ZOOLU.MIXIN.Events.enable.call(this);

        log('Modal', 'construct', this);
    };

    ZOOLU.UI.Modal.prototype = {

        constructor: ZOOLU.UI.Layout.Modal,

        /**
         * Displays the Modal View either with or without fading
         *
         * @public
         * @example
         *
         * var modal = new ZOOLU.UI.Modal();
         * modal.display();
         *
         * @author <a href="mailto:marcel.moosbrugger@bws.ac.at">Marcel Moosbrugger</a>
         */
        display: function() {
            this.buildModal();
            this.buildOverlay();
            this.initBoxEvents();

            if (this.options.fadeIn === true) {
                this.$element.hide();
                this.$overlay.hide();
                $('body').append(this.$element);
                this.setPosition();
                $('body').append(this.$overlay);
                this.$element.fadeIn(this.options.fadeInDuration);
                this.$overlay.fadeTo(this.options.fadeInDuration, this.options.overlayOpacity);
            } else {
                $('body').append(this.$element);
                this.setPosition();
                $('body').append(this.$overlay);
            }
            this.trigger('Modal.activate');
        },

        /**
         * Pushes the passed CSS-Style into a private array <code>this.css</code>
         *
         * @public
         * @param {String} prop - valid CSS property
         * @param {String} value - valid CSS value for the property
         * @example
         *
         * var modal = new ZOOLU.UI.Modal();
         * modal.addCSS('width', '200px');
         *
         * @author <a href="mailto:marcel.moosbrugger@bws.ac.at">Marcel Moosbrugger</a>
         */
        addCSS: function(prop, value) {
            this.css.push([prop, value]);
        },

        /**
         * Initializes the CSS-Styles form the private array <code>this.css</code>
         *
         * @private
         * @author <a href="mailto:marcel.moosbrugger@bws.ac.at">Marcel Moosbrugger</a>
         */
        initCSS: function() {
            if (this.css !== []) {
                for (var i = -1, length = this.css.length; ++i < length;) {
                    this.$element.css(this.css[i][0], this.css[i][1]);
                }
            }
        },

        /**
         * Executes all Initializing-Functions and appends the header, the content and
         * the footer the the Modal View
         *
         * @private
         * @author <a href="mailto:marcel.moosbrugger@bws.ac.at">Marcel Moosbrugger</a>
         */
        buildModal: function() {
            this.initElement();
            this.initHeader();
            this.initContent();
            this.initFooter();

            this.$element.append(this.$header);
            this.$element.append(this.$content);
            this.$element.append(this.$footer);
        },

        /**
         * Initzializes the Overlay and sets important CSS-Styles
         *
         * @private
         * @author <a href="mailto:marcel.moosbrugger@bws.ac.at">Marcel Moosbrugger</a>
         */
        buildOverlay: function() {
            if (this.options.overlay === true) {
                this.$overlay = $('<div class="' + this.options.overlayClass + '"/>');
                this.$overlay.css({
                    'position': 'fixed',
                    'top': '0px',
                    'left': '0px',
                    'width': '100%',
                    'height': '100%',
                    'background-color': this.options.overlayColor
                });
            }
        },

        /**
         * Initializes the Modal View
         *
         * @private
         * @author <a href="mailto:marcel.moosbrugger@bws.ac.at">Marcel Moosbrugger</a>
         */
        initElement: function() {
            log('Init Element');
            this.$element = $('<div class="modal"/>');
            this.initCSS();
        },

        initHeader: function() {
            if (this.options.header === true) {
                log('Init Header');
                this.$header = $('<div class="header"/>');

                if (!!this.options.headerTitle) {
                    this.$headerTitle = $('<div class="' + this.options.headerTitleClass + '"/>');
                    this.$headerTitle.html(this.options.headerTitle);
                    this.$header.append(this.$headerTitle);
                }

                if (this.options.headerClose === true) {
                    this.$headerClose = $('<div class="' + this.options.headerCloseClass + '"/>');
                    this.$header.append(this.$headerClose);
                }
            }
        },

        /**
         * Initializes the content
         *
         * @private
         * @author <a href="mailto:marcel.moosbrugger@bws.ac.at">Marcel Moosbrugger</a>
         */
        initContent: function() {
            log('Init Content');
            this.$content = $('<div class="content"/>');
            this.$content.html(this.content);
        },

        /**
         * Adds the passed content to a privat variable <code>this.content</code>
         *
         * @public
         * @param content - a valid value for the jQuery .html()-Method
         * @example
         *
         *  var modal = new ZOOLU.UI.Modal();
         *  modal.addContent('<h1>Content Headline</h1>');
         *  modal.addContent($('<div class="subcontent"/>'));
         *
         * @author <a href="mailto:marcel.moosbrugger@bws.ac.at">Marcel Moosbrugger</a>
         */
        addContent: function(content) {
            this.content = this.content + content;
        },

        /**
         * Initializes the footer
         *
         * @private
         * @author <a href="mailto:marcel.moosbrugger@bws.ac.at">Marcel Moosbrugger</a>
         */
        initFooter: function() {
            if (this.options.footer === true) {
                log('Init Footer');
                this.$footer = $('<div class="footer"/>');

                if (this.options.footerClose === true) {
                    this.$footerClose = $('<div class="' + this.options.footerCloseClass + '"/>');
                    this.$footerClose.html(this.options.footerCloseText);
                    this.$footer.append(this.$footerClose);
                }

                if (this.options.footerButtons === true && this.footerButtons !== []) {
                    this.initFooterButtons();
                    this.$footer.append(this.$footerButtons);
                }
            }
        },

        /**
         * Pushes buttons from the passed object into a private array <code>this.footerButtons</code>
         *
         * @public
         * @param {Object} buttons - the buttons are added to the footer
         * @example
         *
         *  var modal = new ZOOLU.UI.Modal();
         *
         *  modal.addFooterButtons([
         *   {content: 'Button 1', callBack: function(){ alert('Button 1 clicked'); }, cssClass:  'button', elementId: 'button1'},
         *   {content: 'Button 2', callBack: function(){ alert('Button 2 clicked'); }, cssClass:  'button', elementId: 'button2'},
         *   {content: 'Button 3', callBack: function(){ alert('Button 3 clicked'); }, cssClass:  'button', elementId: 'button3'}
         *  ]);
         *
         * @author <a href="mailto:marcel.moosbrugger@bws.ac.at">Marcel Moosbrugger</a>
         */
        addFooterButtons: function(buttons) {
            if (typeof buttons === 'object') {
                for (var i = -1, length = buttons.length; ++i < length;) {
                    var button = [],
                        bhtml = buttons[i].content,
                        bcallback = buttons[i].callBack,
                        bclass = buttons[i].cssClass || this.options.footerButtonDefaultClass,
                        bid = buttons[i].elementId || '';
                    button.push(bhtml, bcallback, bclass, bid);
                    this.footerButtons.push(button);
                }
            } else {
                throw new ZOOLU.UI.Exception('Buttons argument must be an array but was ' + typeof buttons);
            }
        },

        /**
         * Initializes the footer-buttons
         *
         * @private
         * @author <a href="mailto:marcel.moosbrugger@bws.ac.at">Marcel Moosbrugger</a>
         */
        initFooterButtons: function() {
            this.$footerButtons = $('<div class="' + this.options.footerButtonsContainerClass + '"/>');

            for (var i = -1, length = this.footerButtons.length; ++i < length;) {
                var button = $('<div/>'),
                    bhtml = this.footerButtons[i][0],
                    bcallback = this.footerButtons[i][1],
                    bclass = this.footerButtons[i][2],
                    bid = this.footerButtons[i][3];
                button.html(bhtml);
                button.addClass(bclass);
                button.attr('id', bid);
                button.on('click', bcallback);
                this.$footerButtons.append(button);
                log(this.$footerButtons);
            }
        },

        /**
         * Sets the position of the Modal View according to the options
         * default is the center of the screen
         *
         * @private
         * @author <a href="mailto:marcel.moosbrugger@bws.ac.at">Marcel Moosbrugger</a>
         */
        setPosition: function() {
            this.$element.css('position', 'absolute');

            if (this.options.left !== false) {
                this.$element.css('left', this.options.left);
            } else if (this.options.right !== false) {
                this.$element.css('right', this.options.right);
            } else {
                this.$element.css({
                    'left': '50%',
                    'margin-left': '-' + this.$element.outerWidth() / 2 + 'px'
                });
            }

            if (this.options.top !== false) {
                this.$element.css('top', this.options.top);
            } else if (this.options.bottom !== false) {
                this.$element.css('bottom', this.options.bottom);
            } else {
                this.$element.css({
                    'top': '50%',
                    'margin-top': '-' + this.$element.outerHeight() / 2 + 'px'
                });
            }
        },

        /**
         * Initializes all events which are needed by the the Modal View itselfs
         * or by one of its children.
         *
         * @private
         * @author <a href="mailto:marcel.moosbrugger@bws.ac.at">Marcel Moosbrugger</a>
         */
        initBoxEvents: function() {
            if (this.options.draggable === true && this.options.draggableOnlyOnHeader === true && !!this.$header) {
                this.$header.on('mousedown', function() {
                    this.$element.draggable({
                        disabled: false,
                        grid: this.options.draggableGrid
                    });
                }.bind(this));
                this.$header.on('mouseup', function() {
                    this.$element.draggable({disabled: true});
                }.bind(this));
            } else if (this.options.draggable === true) {
                this.$element.draggable({
                    grid: this.options.draggableGrid
                });
            }
            if (this.options.resizable === true) {
                this.$element.resizable({
                    handles: 'se',
                    maxHeight: this.options.resizeMaxHeight,
                    minHeight: this.options.resizeMinHeight,
                    maxWidth: this.options.resizeMaxWidth,
                    minWidth: this.options.resizeMinWidth
                });
            }
            if (!!this.$headerClose) {
                this.$headerClose.on('click', function() {
                    this.close();
                }.bind(this));
            }
            if (!!this.$footerClose) {
                this.$footerClose.on('click', function() {
                    this.close();
                }.bind(this));
            }
            if (!!this.$overlay && this.options.overlayClose === true) {
                this.$overlay.on('click', function() {
                    this.close();
                }.bind(this));
            }
        },

        /**
         * Closes the Modal View according to the given options. (Either with or
         * without fading)
         *
         * @example
         *
         *  var modal = new ZOOLU.UI.Modal();
         *  modal.display();
         *  modal.close();
         *
         * @public
         * @author <a href="mailto:marcel.moosbrugger@bws.ac.at">Marcel Moosbrugger</a>
         */
        close: function() {
            if (this.options.fadeOut === true) {
                this.$element.fadeOut(this.options.fadeOutDuration, function() {
                    this.$element.remove();
                }.bind(this));
                if (!!this.$overlay) {
                    this.$overlay.fadeOut(this.options.fadeOutDuration, function() {
                        this.$overlay.remove();
                    }.bind(this));
                }
            } else {
                this.$element.remove();
                if (!!this.$overlay) {
                    this.$overlay.remove();
                }
            }
            this.trigger('Modal.deactivate');
        }
    };

})(window, window.ZOOLU, window.jQuery);
