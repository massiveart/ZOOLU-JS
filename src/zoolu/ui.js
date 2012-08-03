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
                    this.footerButtons.push(buttons[i]);
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
                    bhtml = this.footerButtons[i].content,
                    bcallback = this.footerButtons[i].callBack || '',
                    bclass = this.footerButtons[i].cssClass || this.options.footerButtonDefaultClass,
                    bid = this.footerButtons[i].elementId;
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

    /**
     * ZOOLU Button UI Element
     *
     * @class
     * @constructor
     * @public
     * @borrows ZOOLU.MIXIN.Events#trigger as #trigger
     * @borrows ZOOLU.MIXIN.Events#on as #on
     * @borrows ZOOLU.MIXIN.Events#off as #off
     * @triggers Button.select
     * @triggers Button.unselect
     * @param {String} element - jQuery selector for the button
     * @param {Function} callback - Callback-function for the button
     * @param {Object} options - Default options will be merged with the given options
     * @example
     *
     *  var myButton = new ZOOLU.UI.Button('#myButton', myCallback, {
     *      toggle: false,
     *      triggerEvent: 'mouseenter'
     *  });
     *
     * @author <a href="mailto:marcel.moosbrugger@bws.ac.at">Marcel Moosbrugger</a>
     */
    ZOOLU.UI.Button = function(element, callback, options) {
        this.$element = $(element);
        this.callback = callback;
        this.selected = false;

        if (!this.$element.length) {
            throw new ZOOLU.UI.Exception('Button container does not exist');
        }

        // extend default options with given
        this.options = $.extend({
            toggle: true, //true/false - for unselecting and selecting
            toggleBackOnlyOnButton: true, //true/false - for toggle back with click at the document
            toggleBackOnMouseLeave: false, //true/false - for toggle back on mouseleave
            triggerEvent: 'click', //Event which triggers the button
            toggleClass: 'active', //CSS-Class gets added to clicked buttons
            autoselect: false, //true/false - selects the button onload
            unselect: true, //true/false - button can be selected but not unselected (toggle must be enabled)
            callBackOnUnselect: false           //true/false - for executeing the callback on unselect
        }, options);

        // add event API
        ZOOLU.MIXIN.Events.enable.call(this);

        log('Button', 'construct', this);
        this.initialize();
    };

    ZOOLU.UI.Button.prototype = {

        constructor: ZOOLU.UI.Button,

        initialize: function() {
            if (this.options.autoselect === true) {
                this.select();
                this.exeCallback();
            }

            this.$element.bind(this.options.triggerEvent, function(event) {
                event.stopPropagation();
                if (this.options.toggle === false || this.selected === false) {
                    this.select();
                    this.exeCallback();
                } else if (this.options.unselect === true) {
                    this.unselect();
                    this.exeCallback();
                }
            }.bind(this));
        },

        /**
         * Selects the button (doesn't execute the callback)
         *
         * @public
         * @triggers Button.select
         * @example
         *
         *  var myButton = new ZOOLU.UI.Button('#button', myCallback, {});
         *  myButton.select();
         *
         * @author <a href="mailto:marcel.moosbrugger@bws.ac.at">Marcel Moosbrugger</a>
         */
        select: function() {
            this.addToggleClass();
            this.trigger('Button.select');
            this.selected = true;
            this.bindToggleBackHandler();
        },

        /**
         * Unselects the button
         *
         * @public
         * @triggers Button.unselect
         * @example
         *
         *  var myButton = new ZOOLU.UI.Button('#button', myCallback, {});
         *  myButton.unselect();
         *
         * @author <a href="mailto:marcel.moosbrugger@bws.ac.at">Marcel Moosbrugger</a>
         */
        unselect: function() {
            this.removeToggleClass();
            this.trigger('Button.unselect');
            this.selected = false;
        },

        /**
         * Executes the callback-function of the button
         *
         * @public
         * @example
         *
         *  var myButton = new ZOOLU.UI.Button('#button', myCallback, {});
         *  myButton.exeCallback;
         *
         * @author <a href="mailto:marcel.moosbrugger@bws.ac.at">Marcel Moosbrugger</a>
         */
        exeCallback: function() {
            if (typeof this.callback === 'function') {
                if (this.options.callBackOnUnselect === true || this.selected === true) {
                    this.callback.call();
                }
            }
        },

        /**
         * Adds a CSS-Class to the button
         *
         * @private
         * @author <a href="mailto:marcel.moosbrugger@bws.ac.at">Marcel Moosbrugger</a>
         */
        addToggleClass: function() {
            if (this.options.toggle === true) {
                this.$element.addClass(this.options.toggleClass);
            }
        },

        /**
         * Removes the CSS-Class from the button
         *
         * @private
         * @author <a href="mailto:marcel.moosbrugger@bws.ac.at">Marcel Moosbrugger</a>
         */
        removeToggleClass: function() {
            if (this.options.toggle === true) {
                this.$element.removeClass(this.options.toggleClass);
            }
        },

        /**
         * Binds an event for unselecting the button - either with click at the document,
         * or on mouseleave
         *
         * @private
         * @author <a href="mailto:marcel.moosbrugger@bws.ac.at">Marcel Moosbrugger</a>
         */
        bindToggleBackHandler: function() {
            if (this.options.toggleBackOnlyOnButton === false && this.options.toggle === true) {
                $(document).bind(this.options.triggerEvent, function() {
                    this.unselect();
                }.bind(this));
            } else if (this.options.toggleBackOnMouseLeave === true && this.options.toggle === true) {
                this.$element.bind('mouseleave', function() {
                    this.unselect();
                }.bind(this));
            }
        }
    };

    /**
     * ZOOLU Button Group UI Element
     *
     * @class
     * @constructor
     * @public
     * @borrows ZOOLU.MIXIN.Events#trigger as #trigger
     * @borrows ZOOLU.MIXIN.Events#on as #on
     * @borrows ZOOLU.MIXIN.Events#off as #off
     * @param {String} container - jQuery Selektor for the Button Group Container
     * @param {Array} callbacks - Callback functions get applied to the buttons in the order they are declared
     * @param {Object} options - Default options will be merged with the given options
     * @example
     *
     *   var myButtonGroup = new ZOOLU.UI.ButtonGroup('#myButtonGroup', [
     *       function(){alert('Callback 1');},
     *       function(){alert('Callback 2');},
     *       function(){alert('Callback 3');},
     *   ], {
     *      dataToggle: radio,
     *      buttonClass: 'btn'
     *   });
     *
     * @author <a href="mailto:marcel.moosbrugger@bws.ac.at">Marcel Moosbrugger</a>
     */
    ZOOLU.UI.ButtonGroup = function(container, callbacks, options) {
        this.$container = $(container);
        this.callbacks = callbacks;
        this.buttons = [];

        if (!this.$container.length) {
            throw new ZOOLU.UI.Exception('Button Group container does not exist');
        }

        // extend default options with given
        this.options = $.extend({
            dataToggle: false, //false or radio
            buttonClass: 'button', //CSS-Class
            buttonOptions: {}           //Options for ZOOLU.UI.Button
        }, options);

        // add event API
        ZOOLU.MIXIN.Events.enable.call(this);

        log('Button Group', 'construct', this);
        this.initialize();
    };

    ZOOLU.UI.ButtonGroup.prototype = {

        constructor: ZOOLU.UI.ButtonGroup,

        CONST: {
            dataToggle: {
                radio: 'radio'
            }
        },

        initialize: function() {
            this.initButtons();
            this.initCallbacks();
        },

        /**
         * Initializes all buttons - ZOOLU.UI.Buttons get stored in {Array} this.buttons
         *
         * @private
         * @author <a href="mailto:marcel.moosbrugger@bws.ac.at">Marcel Moosbrugger</a>
         */
        initButtons: function() {
            var buttons = this.$container.find('.' + this.options.buttonClass);
            for (var i = -1, length = buttons.length; ++i < length;) {
                this.buttons[i] = new ZOOLU.UI.Button(buttons[i], null, this.options.buttonOptions);
                this.attachObserver(i);
            }
        },

        /**
         * Sets the Callback for the ZOOLU.UI.Buttons
         *
         * @private
         * @author <a href="mailto:marcel.moosbrugger@bws.ac.at">Marcel Moosbrugger</a>
         */
        initCallbacks: function() {
            if (!!this.callbacks) {
                for (var i = -1, length = this.callbacks.length; ++i < length;) {
                    if (!!this.buttons[i]) {
                        if (typeof this.callbacks[i] === 'function') {
                            this.buttons[i].callback = this.callbacks[i];
                        } else {
                            throw new ZOOLU.UI.Exception('Defined Callback is not a function');
                        }
                    } else {
                        throw new ZOOLU.UI.Exception('Too many Callbacks or not enough buttons');
                    }
                }
            }
        },

        /**
         * Attaches an observer, which listens for Button.select. On Button.select
         * this.dataToggleHandler() is executed
         *
         * @private
         * @author <a href="mailto:marcel.moosbrugger@bws.ac.at">Marcel Moosbrugger</a>
         */
        attachObserver: function(index) {
            this.buttons[index].on('Button.select', function() {
                this.dataToggleHandler(index);
            }.bind(this));
        },

        /**
         * Handles the data toggling - unselects all buttons except the clicked one
         * if dataToggle is radio
         *
         * @private
         * @author <a href="mailto:marcel.moosbrugger@bws.ac.at">Marcel Moosbrugger</a>
         */
        dataToggleHandler: function(selected) {
            if (this.options.dataToggle === this.CONST.dataToggle.radio) {
                for (var i = -1, length = this.buttons.length; ++i < length;) {
                    if (this.buttons[i] !== this.buttons[selected]) {
                        this.buttons[i].unselect();
                    }
                }
            }
        },

        /**
         * Returns an Array with all selected buttons of the Button Group in it
         *
         * @public
         * @example
         *
         *   var myButtonGroup = new ZOOLU.UI.ButtonGroup('#myButtonGroup', [
         *       function(){alert('Callback 1');},
         *       function(){alert('Callback 2');},
         *       function(){alert('Callback 3');},
         *   ], {});
         *
         *   var selectedButtonsArray = myButtonGroup.getSelectedButtons();
         *
         * @return {Array}
         * @author <a href="mailto:marcel.moosbrugger@bws.ac.at">Marcel Moosbrugger</a>
         */
        getSelectedButtons: function() {
            var selectedButtons = [],
                i = -1,
                length = this.buttons.length;
            for (; ++i < length;) {
                if (this.buttons[i].selected === true) {
                    selectedButtons.push(this.buttons[i]);
                }
            }
            return selectedButtons;
        }
    };

    /**
     * ZOOLU Dropdown UI Element
     *
     * @class
     * @constructor
     * @public
     * @borrows ZOOLU.MIXIN.Events#trigger as #trigger
     * @borrows ZOOLU.MIXIN.Events#on as #on
     * @borrows ZOOLU.MIXIN.Events#off as #off
     * @triggers Dropdown.open
     * @triggers Dropdown.close
     * @param {String} activator - jQuery Selektor for the activator
     * @param {Object} options - Default options will be merged with the given options
     * @example
     *
     *  var myDropdown = new ZOOLU.UI.Dropdown('#myDropdown', {
     *      fadeIn: true,
     *      fadeOut: true,
     *      closeOnMouseLeave: true
     *  });
     *
     * @author <a href="mailto:marcel.moosbrugger@bws.ac.at">Marcel Moosbrugger</a>
     */
    ZOOLU.UI.Dropdown = function(activator, options) {
        this.$activator = $(activator);
        this.$dropdown = null;
        this.opened = false;

        if (!this.$activator.length) {
            throw new ZOOLU.UI.Exception('Dropdown activator container does not exist');
        }

        // extend default options with given
        this.options = $.extend({
            dropdownClass: 'dropdown', //CSS-Class of the dropdown
            closeOnClick: true, //true/false - for closing with click on the document
            closeOnMouseLeave: false, //true/false - closes on mouseleave
            triggerEvent: 'click', //Event which triggers the dropdown
            resizable: true, //enables/disables resizing for the modal view
            resizeMinWidth: 10, //Integer or null
            resizeMaxWidth: null, //Integer or null
            resizeMinHeight: 10, //Integer or null
            resizeMaxHeight: null, //Integer or null
            slideDown: false, //true/false
            slideDownDuration: 500, //ms
            slideUp: false, //true/false
            slideUpDuration: 500, //ms
            fadeIn: false, //true/false
            fadeInDuration: 800, //ms
            fadeOut: false, //true/false
            fadeOutDuration: 800                    //ms
        }, options);

        // add event API
        ZOOLU.MIXIN.Events.enable.call(this);

        log('Dropdown', 'construct', this);
        this.initialize();
    };

    ZOOLU.UI.Dropdown.prototype = {

        constructor: ZOOLU.UI.Dropdown,

        initialize: function() {
            this.getDropdownContainer();
            this.applyStartingOptions();
            this.bindEvents();
        },

        /**
         * Gets the Dropdown-Container vom the DOM-Structure
         *
         * @private
         * @author <a href="mailto:marcel.moosbrugger@bws.ac.at">Marcel Moosbrugger</a>
         */
        getDropdownContainer: function() {
            var dropdown = this.$activator.find('.' + this.options.dropdownClass);
            if (dropdown.length === 1) {
                this.$dropdown = dropdown;
            } else if (dropdown.length > 1) {
                throw new ZOOLU.UI.Exception('More than one Dropdowns found!');
            } else if (dropdown.length < 1) {
                throw new ZOOLU.UI.Exception('No Dropdown found!');
            }
        },

        /**
         * Adds CSS to the dropdown Container
         *
         * @public
         * @example
         *
         *  var myDropdown = new ZOOLU.UI.Dropdown('#myDropdown', {});
         *  myDropdown.addCSS({
         *      width: '200px',
         *      height: '500px',
         *      background-color: '#FFFFFF'
         *  });
         *
         * @author <a href="mailto:marcel.moosbrugger@bws.ac.at">Marcel Moosbrugger</a>
         */
        addCSS: function(css) {
            if (typeof css === 'object') {
                this.$dropdown.css(css);
            } else {
                throw new ZOOLU.UI.Exception('Type of CSS argument must be "object" but was ' + typeof css);
            }
        },

        /**
         * Applys options which are needed at the beginning
         *
         * @public
         * @author <a href="mailto:marcel.moosbrugger@bws.ac.at">Marcel Moosbrugger</a>
         */
        applyStartingOptions: function() {
            this.$dropdown.hide();
        },

        /**
         * Binds diffrent events which are needed for the dropdown
         *
         * @private
         * @author <a href="mailto:marcel.moosbrugger@bws.ac.at">Marcel Moosbrugger</a>
         */
        bindEvents: function() {
            this.$activator.bind(this.options.triggerEvent, function() {
                this.toggle();
            }.bind(this));
            this.$dropdown.bind(this.options.triggerEvent, function(event) {
                event.stopPropagation();
            });

            if (this.options.closeOnClick === true) {
                $(document).bind('click', function() {
                    this.close();
                }.bind(this));
            } else if (this.options.closeOnMouseLeave === true) {
                this.$activator.bind('mouseleave', function() {
                    this.close();
                }.bind(this));
            }
            if (this.options.resizable === true) {
                this.$dropdown.resizable({
                    handles: 'se',
                    maxHeight: this.options.resizeMaxHeight,
                    minHeight: this.options.resizeMinHeight,
                    maxWidth: this.options.resizeMaxWidth,
                    minWidth: this.options.resizeMinWidth
                });
            }
        },

        /**
         * Toggles the dropdown (open/close)
         *
         * @public
         * @example
         *
         *  var myDropdown = new ZOOLU.UI.Dropdown('#myDropdown', {});
         *  myDropdown.toggle();
         *
         * @author <a href="mailto:marcel.moosbrugger@bws.ac.at">Marcel Moosbrugger</a>
         */
        toggle: function() {
            if (this.opened === false) {
                this.open();
            } else {
                this.close();
            }
        },

        /**
         * Opens the dropdown
         *
         * @public
         * @example
         *
         *  var myDropdown = new ZOOLU.UI.Dropdown('#myDropdown', {});
         *  myDropdown.open();
         *
         * @author <a href="mailto:marcel.moosbrugger@bws.ac.at">Marcel Moosbrugger</a>
         */
        open: function() {
            if (this.options.slideDown === true) {
                this.$dropdown.slideDown(this.options.slideDownDuration);
            } else if (this.options.fadeIn === true) {
                this.$dropdown.fadeIn(this.options.fadeInDuration);
            } else {
                this.$dropdown.show();
            }
            this.trigger('Dropdown.open');
            this.opened = true;
        },

        /**
         * Closes the dropdown
         *
         * @public
         * @example
         *
         *  var myDropdown = new ZOOLU.UI.Dropdown('#myDropdown', {});
         *  myDropdown.close();
         *
         * @author <a href="mailto:marcel.moosbrugger@bws.ac.at">Marcel Moosbrugger</a>
         */
        close: function() {
            if (this.options.slideUp === true) {
                this.$dropdown.slideUp(this.options.slideUpDuration);
            } else if (this.options.fadeOut === true) {
                this.$dropdown.fadeOut(this.options.fadeOutDuration);
            } else {
                this.$dropdown.hide();
            }
            this.trigger('Dropdown.close');
            this.opened = false;
        }
    };

    /**
     * ZOOLU Tablelist UI Element
     *
     * @class
     * @constructor
     * @public
     * @borrows ZOOLU.MIXIN.Events#trigger as #trigger
     * @borrows ZOOLU.MIXIN.Events#on as #on
     * @borrows ZOOLU.MIXIN.Events#off as #off
     * @param {Object} options - Default options will be merged with the given options
     * @author <a href="mailto:marcel.moosbrugger@bws.ac.at">Marcel Moosbrugger</a>
     */
    ZOOLU.UI.Tablelist = function(element, uri, options) {
        this.$element = $(element);
        this.pagination = {
            $element: null,
            $pageentries: null,
            $back: null,
            $pagination: null,
            $next: null
        };
        this.$tbody = null;
        this.$thead = null;
        this.theadRow = {
            $element: null,
            $checkboxCont: null,
            $checkbox: null,
            titleCells: []
        };
        this.eventsBound = false;
        this.tableRows = [];
        this.allSelected = false;
        this.amount = 0;
        this.page = 0;
        this.lastPage = 0;
        this.pageEntries = 0;
        this.sortname = '';
        this.sortType = '';

        //attributes for JSON rendering
        this.uri = uri;
        this.jsonObj = null;
        this.$table = null;

        if (!this.$element.length) {
            throw new ZOOLU.UI.Exception('Tablelist element does not exist');
        }

        // extend default options with given
        this.options = $.extend({
            tableClass: 'tablelist',
            rowCSSClass: 'row', //CSS-Class or false
            rowClassAddType: 'odd', //'odd' or 'even'
            selectable: true,
            selectEvent: 'click',
            selectedClass: 'selected',
            checkboxClass: 'checkbox',
            domPagination: false,
            calculatePagination: false,
            paginationClass: 'tablelistnav',
            navPageEntriesClass: 'pageentries',
            navPaginationClass: 'pagination',
            navPaginationBackClass: 'back',
            navPaginationNextClass: 'next',
            hideNextOnLastPage: true,
            hideBackOnFirstPage: true,
            sortable: true,
            header: false,
            pageEntriesSteps: [2, 20, 50, 100, 500],
            descClass: 'desc',
            ascClass: 'asc',
            titleClass: 'title',
            sortParameterName: 'sort',
            sortTypeParameterName: 'sortType',
            pageEntriesParameterName: 'pageEntries',
            pageParameterName: 'page'
        }, options);

        // add event API
        ZOOLU.MIXIN.Events.enable.call(this);

        log('Tablelist', 'construct', this);

        if (!!this.uri) {
            log('Render', this);
            this.render();
        } else {
            log('Initialize', this);
            this.initialize();
        }

    };

    ZOOLU.UI.Tablelist.prototype = {

        constructor: ZOOLU.UI.Tablelist,

        CONST: {
            sortTypes: {
                desc: 'desc',
                asc: 'asc'
            },
            rowClassAddTypes: {
                odd: 'odd',
                even: 'even'
            }
        },

        /**
         * Initializes the Tablelist form the DOM (DOM)
         *
         * @private
         * @author <a href="mailto:marcel.moosbrugger@bws.ac.at">Marcel Moosbrugger</a>
         */
        initialize: function() {
            this.getStartingData();
            this.initTableHeader();
            this.initTableBody();
            this.initPagination();
            this.addCheckboxes();
            this.bindEvents();
        },

        /**
         * Renders JSON into the Tablelist (JSON)
         *
         * @private
         * @author <a href="mailto:marcel.moosbrugger@bws.ac.at">Marcel Moosbrugger</a>
         */
        render: function() {
            this.getStartingData();
            this.loadJson(this.getURI());
        },

        /**
         * Executes all building-methods and appends the elements to the DOM (JSON)
         *
         * @private
         * @author <a href="mailto:marcel.moosbrugger@bws.ac.at">Marcel Moosbrugger</a>
         */
        build: function() {
            this.reset();
            this.buildTable();
            this.buildTHeader();
            this.buildTBody();

            if (this.options.domPagination === true) {
                this.initPagination();
            } else {
                this.buildPagination();
            }


            this.$table.append(this.$thead);
            this.$table.append(this.$tbody);
            this.$table.append(this.$tfoot);
            this.$element.prepend(this.$table);
            this.$element.append(this.pagination.$element);

            this.addCheckboxes();
            this.bindEvents();
        },

        /**
         * Delets the table body dom and resets some variables for new loading (JSON)
         *
         * @private
         * @author <a href="mailto:marcel.moosbrugger@bws.ac.at">Marcel Moosbrugger</a>
         */
        reset: function() {
            if (!!this.$tbody) {
                this.$tbody.html(' ');
            }

            this.tableRows = [];
            if (!!this.theadRow.$checkbox) {
                this.theadRow.$checkbox.removeAttr('checked');
                this.allSelected = false; 
            }
        },

        /**
         * Configures variables for the beginning
         *
         * @private
         * @author <a href="mailto:marcel.moosbrugger@bws.ac.at">Marcel Moosbrugger</a>
         */
        getStartingData: function() {
            this.pageEntries = this.options.pageEntriesSteps[0];
            this.page = 1;
        },

        /**
         * Loads JSON from an URI and calls methods for building (JSON)
         *
         * @private
         * @param {String} uri - Location of the JSON and parameters
         * @author <a href="mailto:marcel.moosbrugger@bws.ac.at">Marcel Moosbrugger</a>
         */
        loadJson: function(uri) {
            $.ajax({
                url: uri,
                type: 'GET',
                dataType: 'JSON',
                success: function(data) {
                    this.jsonObj = data;
                    this.amount = this.jsonObj.amount;
                    this.page = this.jsonObj.page;
                    this.lastPage = Math.ceil(this.amount / this.pageEntries);
                    this.build();
                }.bind(this),
                error: function(jqXHR, textStatus) {
                }.bind(this)
            });
            this.trigger('Tablelist.load');
        },


        /**
         * Generates the <option> tags for the Page-Entries-Select
         *
         * @private
         * @author <a href="mailto:marcel.moosbrugger@bws.ac.at">Marcel Moosbrugger</a>
         */
        getPageEntriesOptions: function() {
            var options = '<option value="' + this.options.pageEntriesSteps[0] + '">' + this.options.pageEntriesSteps[0] + '</option>';
            for (var i = -1, length = this.options.pageEntriesSteps.length; ++i < length;) {
                if (this.amount > this.options.pageEntriesSteps[i] && !!this.options.pageEntriesSteps[i + 1]) {
                    if (this.options.pageEntriesSteps[i + 1] === this.pageEntries) {
                        options = options + '<option value="' + this.options.pageEntriesSteps[i + 1] + '" selected="selected">' + this.options.pageEntriesSteps[i + 1] + '</option>';
                    } else {
                        options = options + '<option value="' + this.options.pageEntriesSteps[i + 1] + '">' + this.options.pageEntriesSteps[i + 1] + '</option>';
                    }
                } else {
                    break;
                }
            }
            return options;
        },

        /**
         * Generates the <option> tags for the Pagination-Select
         *
         * @private
         * @author <a href="mailto:marcel.moosbrugger@bws.ac.at">Marcel Moosbrugger</a>
         */
        getPaginationOptions: function() {
            var options = '';
            for (var i = 0; ++i <= this.lastPage;) {
                if (i === this.page) {
                    options = options + '<option selected="selected" value="' + i + '">' + i + '</option>';
                } else {
                    options = options + '<option value="' + i + '">' + i + '</option>';
                }
            }
            return options;
        },

        /**
         * Builds the DOM-Objects for the Tablelist-Table (JSON)
         *
         * @private
         * @author <a href="mailto:marcel.moosbrugger@bws.ac.at">Marcel Moosbrugger</a>
         */
        buildTable: function() {
            if (!this.$table) {
                log('Build Table');
                this.$table = $('<table class="' + this.options.tableClass + '"/>'),
                    this.$thead = $('<thead/>'),
                    this.$tbody = $('<tbody/>'),
                    this.$tfoot = $('<tfoot/>');
            }
        },

        /**
         * Builds the Table-Head, Table-Row and the Title Cells DOM Objects (JSON)
         *
         * @private
         * @author <a href="mailto:marcel.moosbrugger@bws.ac.at">Marcel Moosbrugger</a>
         */
        buildTHeader: function() {
            if (!this.theadRow.$element) {
                log('Build Table Header');
                this.theadRow.$element = $('<tr/>');
                for (var i = -1, length = this.options.header.length; ++i < length;) {
                    this.theadRow.titleCells[i] = {
                        $element: $('<th>' + this.options.header[i].title + '</th>'),
                        name: this.options.header[i].name,
                        sort: this.options.header[i].sort,
                        sorted: false,
                        sortType: this.CONST.sortTypes.desc
                    };
                    if (this.theadRow.titleCells[i].$element.html() !== '') {
                        log('add');
                        this.theadRow.titleCells[i].$element.addClass(this.options.titleClass);
                    }
                    this.theadRow.$element.append(this.theadRow.titleCells[i].$element);
                    this.bindCellEvents(i);
                }
                this.$thead.append(this.theadRow.$element);
            }
        },

        /**
         * Builds the Table-Body DOM Object with the Table-Row Objects
         * Calls the <code>bindRowEvents</code> method for each row
         *
         * @private
         * @author <a href="mailto:marcel.moosbrugger@bws.ac.at">Marcel Moosbrugger</a>
         */
        buildTBody: function() {
            log('Build Table Body');
            var tablerow, tablecell;
            for (var i = -1, amountRows = this.jsonObj.items.length; ++i < amountRows;) {
                tablerow = $('<tr/>');
                for (var x = -1, amountCells = this.jsonObj.items[i].length; ++x < amountCells;) {
                    tablecell = $('<td class="' + this.options.header[x].name + '">' + this.jsonObj.items[i][x] + '</td>');
                    tablerow.append(tablecell);
                }
                this.tableRows.push({
                    $element: $(tablerow),
                    $checkboxCell: null,
                    $checkbox: null,
                    selected: false
                });
                this.$tbody.append(this.tableRows[i].$element);
                this.addRowCSSClass(i);
                this.bindRowEvents(i);
            }
        },

        /**
         * Builds a default Pagination-DOM-Object if no Pagination is in the DOM yet (JSON)
         *
         * @private
         * @author <a href="mailto:marcel.moosbrugger@bws.ac.at">Marcel Moosbrugger</a>
         */
        buildPagination: function() {
            if (!this.pagination.$element) {
                this.pagination.$element = $('<div class=' + this.options.paginationClass + '/>');
                this.pagination.$pageentries = $('<div class="' + this.options.navPageEntriesClass + '"/>');
                this.pagination.$pagination = $('<div class="' + this.options.navPaginationClass + '"/>');
                this.pagination.$next = $('<a href="#" class="' + this.options.navPaginationNextClass + '">Next</a>');
                this.pagination.$back = $('<a href="#" class="' + this.options.navPaginationBackClass + '">Back</a>');

                var entries = '<span>Page entries</span>' +
                    '<select>' +
                    this.getPageEntriesOptions() +
                    '</select>';

                var pager = '<span>Page</span>' +
                    '<select>' +
                    this.getPaginationOptions() +
                    '</select>';

                this.pagination.$pageentries.append(entries);
                this.pagination.$pagination.append(this.pagination.$back);
                this.pagination.$pagination.append(pager);
                this.pagination.$pagination.append(this.pagination.$next);

                this.pagination.$element.append(this.pagination.$pageentries);
                this.pagination.$element.append(this.pagination.$pagination);

                this.hidePaginationButtons();
            }
        },

        /**
         * Initializes the Table Header and the Title Cells (DOM)
         *
         * @private
         * @author <a href="mailto:marcel.moosbrugger@bws.ac.at">Marcel Moosbrugger</a>
         */
        initTableHeader: function() {
            this.$thead = this.$element.find('thead');
            if (this.$thead.length !== 1) {
                throw new ZOOLU.UI.Exception('Table Head initialisation failed');
            }

            this.theadRow = {
                $element: $(this.$thead.find('tr')),
                $checkboxCont: null,
                $checkbox: null,
                titleCells: []
            };
            if (this.theadRow.$element.length !== 1) {
                throw new ZOOLU.UI.Exception('Table Head row initialisation failed');
            }

            var titleCells = {
                $element: this.theadRow.$element.find('th')
            };
            for (var i = -1, length = titleCells.length; ++i < length;) {
                this.theadRow.titleCells.push($(titleCells[i].$element));
                if ($(titleCells[i]).$element.html() !== '') {
                    this.bindCellEvents(i);
                }
            }
        },

        /**
         * Initializes the Table Body, with the Table-Rows
         * Calls the <code>bindRowEvents</code> method for each row (DOM)
         *
         * @private
         * @author <a href="mailto:marcel.moosbrugger@bws.ac.at">Marcel Moosbrugger</a>
         */
        initTableBody: function() {
            var tbody = this.$element.find('tbody');
            if (tbody.length === 1) {
                this.$tbody = tbody;
            } else {
                throw new ZOOLU.UI.Exception('Table Body initialisation failed');
            }
            var rows = this.$tbody.find('tr');
            for (var i = -1, length = rows.length; ++i < length;) {
                this.tableRows.push({
                    $element: $(rows[i]),
                    $checkboxCell: null,
                    $checkbox: null,
                    selected: false
                });
                this.bindRowEvents(i);
                this.addRowCSSClass(i);
            }
        },

        /**
         * Initializes the Pagination
         *
         * @private
         * @author <a href="mailto:marcel.moosbrugger@bws.ac.at">Marcel Moosbrugger</a>
         */
        initPagination: function() {
            this.pagination.$element = this.$element.find('.' + this.options.paginationClass);
            if (!this.pagination.$element.length) {
                throw new ZOOLU.UI.Exception('Tablelist pagination element does not exist');
            }
            this.pagination.$pageentries = this.pagination.$element.find('.' + this.options.navPageEntriesClass);
            this.pagination.$back = this.pagination.$element.find('.' + this.options.navPaginationBackClass);
            this.pagination.$pagination = this.pagination.$element.find('.' + this.options.navPaginationClass);
            this.pagination.$next = this.pagination.$element.find('.' + this.options.navPaginationNextClass);

            if (!this.pagination.$pageentries.length ||
                !this.pagination.$back.length ||
                !this.pagination.$pagination.length ||
                !this.pagination.$next.length) {
                throw new ZOOLU.UI.Exception('Tablelist pagination initialisation failed');
            } else if (this.options.calculatePagination === true) {
                this.pagination.$pageentries.find('select').html(this.getPageEntriesOptions());
                this.pagination.$pagination.find('select').html(this.getPaginationOptions());
            }
            this.hidePaginationButtons();
        },

        /**
         * Hides (if activated) the back button on the first page and the next
         * button on the last page
         *
         * @private
         * @author <a href="mailto:marcel.moosbrugger@bws.ac.at">Marcel Moosbrugger</a>
         */
        hidePaginationButtons: function() {
            if (this.options.hideNextOnLastPage === true && this.page === this.lastPage) {
                this.pagination.$next.hide();
            } else {
                this.pagination.$next.show();
            }
            if (this.options.hideBackOnFirstPage === true && this.page === 1) {
                this.pagination.$back.hide();
            } else {
                this.pagination.$back.show();
            }
        },

        /**
         * Adds Checkboxes for each row and a Select-All-Checkbox for the header
         *
         * @private
         * @author <a href="mailto:marcel.moosbrugger@bws.ac.at">Marcel Moosbrugger</a>
         */
        addCheckboxes: function() {
            if (this.options.selectable === true) {
                var checkbox = '<input type="checkbox" />';

                for (var i = -1, length = this.tableRows.length; ++i < length;) {
                    this.tableRows[i].$checkboxCell = $('<td class="' + this.options.checkboxClass + '"/>');
                    this.tableRows[i].$checkbox = $(checkbox);
                    this.tableRows[i].$checkboxCell.append(this.tableRows[i].$checkbox);
                    this.tableRows[i].$element.prepend(this.tableRows[i].$checkboxCell);
                }

                if (!this.theadRow.$checkboxCell) {
                    this.theadRow.$checkboxCell = $('<th class="' + this.options.checkboxClass + '"/>');
                    this.theadRow.$checkbox = $(checkbox);
                    this.theadRow.$checkboxCell.append(this.theadRow.$checkbox);
                    this.theadRow.$element.prepend(this.theadRow.$checkboxCell);
                }
            }
        },

        /**
         * Adds the CSS-Class configured in <code>this.options.rowCSSClass</code>
         * to the Table rows according to the rule configured in <code>this.options.rowClassAddType</code>
         *
         * @private
         * @param {Integer} index - Index of the row in the tableRows Array
         * @author <a href="mailto:marcel.moosbrugger@bws.ac.at">Marcel Moosbrugger</a>
         */
        addRowCSSClass: function(index) {
            if (this.options.rowCSSClass !== false) {
                if (this.options.rowClassAddType === false) {
                    this.tableRows[index].$element.addClass(this.options.rowCSSClass);
                } else if (this.options.rowClassAddType === this.CONST.rowClassAddTypes.odd && (index + 1) % 2 !== 0) {
                    this.tableRows[index].$element.addClass(this.options.rowCSSClass);
                } else if (this.options.rowClassAddType === this.CONST.rowClassAddTypes.even && (index + 1) % 2 === 0) {
                    this.tableRows[index].$element.addClass(this.options.rowCSSClass);
                }
            }
        },

        /**
         * Binds various events for the checkboxes and pagination
         * The eventsBound attribute ensures that all events get only bound once.
         *
         * @private
         * @author <a href="mailto:marcel.moosbrugger@bws.ac.at">Marcel Moosbrugger</a>
         */
        bindEvents: function() {
            if (this.eventsBound === false) {
                if (this.options.selectable === true) {
                    this.theadRow.$checkbox.on('click', function() {
                        this.toggleAll();
                    }.bind(this));
                    this.on('Tablelist.row.toggle', function() {
                        this.observeSelect();
                    }.bind(this));
                }

                this.pagination.$pageentries.on('change', function() {
                    this.changePageEntries();
                }.bind(this));
                this.pagination.$pagination.on('change', function() {
                    this.changePage();
                }.bind(this));
                this.pagination.$back.on('click', function() {
                    this.changePage(this.page - 1);
                }.bind(this));
                this.pagination.$next.on('click', function() {
                    this.changePage(this.page + 1);
                }.bind(this));

                this.eventsBound = true;
            }
        },

        /**
         * Binds Events for each Row
         *
         * @private
         * @author <a href="mailto:marcel.moosbrugger@bws.ac.at">Marcel Moosbrugger</a>
         */
        bindRowEvents: function(index) {
            if (this.options.selectable === true) {
                this.tableRows[index].$element.bind(this.options.selectEvent, function() {
                    this.toggle(index);
                }.bind(this));
            }
        },

        /**
         * Binds Events for each title cell
         *
         * @private
         * @author <a href="mailto:marcel.moosbrugger@bws.ac.at">Marcel Moosbrugger</a>
         */
        bindCellEvents: function(index) {
            if (this.options.sortable === true && this.theadRow.titleCells[index].sort === true) {
                this.theadRow.titleCells[index].$element.bind('click', function() {
                    this.sort(this.theadRow.titleCells[index]);
                }.bind(this));
            }
        },

        /**
         * Changes the pageEntries attribute and sends an AJAX request
         *
         * @public
         * @param {Integer} entries - amount of page entries
         * @example
         *
         *  var myTablelist = new ZOOLU.UI.Tablelist('#myContainer', '/list', { });
         *  myTablelist.changePageEntries(500);
         *
         * @author <a href="mailto:marcel.moosbrugger@bws.ac.at">Marcel Moosbrugger</a>
         */
        changePageEntries: function(entries) {
            if (!!entries) {
                this.pageEntries = entries;
            } else {
                this.pageEntries = parseInt(this.pagination.$pageentries.find('select option:selected').val(), 10);
            }
            this.loadJson(this.getURI());
        },

        /**
         * Changes the page attribute and sends an AJAX request
         *
         * @public
         * @param {Integer} page - Page to load
         * @example
         *
         *  var myTablelist = new ZOOLU.UI.Tablelist('#myContainer', '/list', { });
         *  myTablelist.changePage(2);
         *
         * @author <a href="mailto:marcel.moosbrugger@bws.ac.at">Marcel Moosbrugger</a>
         */
        changePage: function(page) {
            if (!!page) {
                if (page <= this.lastPage) /*Back or next clicked*/ {
                    this.page = page;
                    this.loadJson(this.getURI());
                }
            } else if (page !== 0) /*Select changed*/ {
                this.page = parseInt(this.pagination.$pagination.find('select option:selected').val(), 10);
                this.loadJson(this.getURI());
            }
        },

        /**
         * Generates the URI for the AJAX-Requests
         *
         * @private
         * @author <a href="mailto:marcel.moosbrugger@bws.ac.at">Marcel Moosbrugger</a>
         */
        getURI: function() {
            var uri = this.uri +
                '?' + this.options.sortParameterName + '=' + this.sortname +
                '&' + this.options.sortTypeParameterName + '=' + this.sortType +
                '&' + this.options.pageEntriesParameterName + '=' + this.pageEntries +
                '&' + this.options.pageParameterName + '=' + this.page;
            log(uri);
            return uri;
        },

        /**
         * Setts the attributes which are needed to get data sorted
         * Calls the <code>loadJson</code> method and passes the URI
         * Sets and removes CSS-Classes
         *
         * @private
         * @triggers Tablelist.sort
         * @param {Object} cell - Object which contains the TitleCell DOM Object and various other attributes
         * @author <a href="mailto:marcel.moosbrugger@bws.ac.at">Marcel Moosbrugger</a>
         */
        sort: function(cell) {
            var cssClass;
            this.sortname = cell.name;

            if (cell.sortType === this.CONST.sortTypes.desc) {
                this.sortType = this.CONST.sortTypes.asc;
                cssClass = this.options.ascClass;
                cell.$element.removeClass(this.options.descClass);
            } else {
                this.sortType = this.CONST.sortTypes.desc;
                cssClass = this.options.descClass;
                cell.$element.removeClass(this.options.ascClass);
            }

            cell.$element.addClass(cssClass);
            cell.sortType = this.sortType;
            cell.sorted = true;
            for (var i = -1, length = this.theadRow.titleCells.length; ++i < length;) {
                if (this.theadRow.titleCells[i].name !== cell.name) {
                    this.theadRow.titleCells[i].$element.removeClass(this.options.ascClass);
                    this.theadRow.titleCells[i].$element.removeClass(this.options.descClass);
                    this.theadRow.titleCells[i].sorted = false;
                    this.theadRow.titleCells[i].sortType = this.CONST.sortTypes.desc;
                }
            }

            this.loadJson(this.getURI());
            this.trigger('Tablelist.sort');
        },

        /**
         * Selects or unselects a row
         *
         * @public
         * @triggers Tablelist.row.toggle
         * @param {Integer} index - Index of the row in the tableRows Array
         * @author <a href="mailto:marcel.moosbrugger@bws.ac.at">Marcel Moosbrugger</a>
         */
        toggle: function(index) {
            if (this.tableRows[index].selected === false) {
                this.select(index);
            } else {
                this.unselect(index);
            }
            this.trigger('Tablelist.row.toggle');
        },

        /**
         * Selects a row
         *
         * @prublic
         * @triggers Tablelist.row.select
         * @param {Integer} index - Index of the row in the tableRows Array
         * @author <a href="mailto:marcel.moosbrugger@bws.ac.at">Marcel Moosbrugger</a>
         */
        select: function(index) {
            this.tableRows[index].$element.addClass(this.options.selectedClass);
            this.tableRows[index].$checkbox.attr('checked', true);
            this.tableRows[index].selected = true;
            this.trigger('Tablelist.row.select');
        },

        /**
         * Unselects a row
         *
         * @public
         * @triggers Tablelist.row.unselect
         * @param {Integer} index - Index of the row in the tableRows Array
         * @author <a href="mailto:marcel.moosbrugger@bws.ac.at">Marcel Moosbrugger</a>
         */
        unselect: function(index) {
            this.tableRows[index].$element.removeClass(this.options.selectedClass);
            this.tableRows[index].$checkbox.attr('checked', false);
            this.tableRows[index].selected = false;
            this.trigger('Tablelist.row.unselect');
        },

        /**
         * Selects or unselects all rows
         *
         * @public
         * @triggers Tablelist.toggleall
         * @author <a href="mailto:marcel.moosbrugger@bws.ac.at">Marcel Moosbrugger</a>
         */
        toggleAll: function() {
            if (this.allSelected === false) {
                this.selectAll();
                this.allSelected = true;
            } else {
                this.unselectAll();
                this.allSelected = false;
            }
            this.trigger('Tablelist.toggleall');
        },

        /**
         * Selects all rows
         *
         * @public
         * @triggers Tablelist.selectall
         * @author <a href="mailto:marcel.moosbrugger@bws.ac.at">Marcel Moosbrugger</a>
         */
        selectAll: function() {
            for (var i = -1, length = this.tableRows.length; ++i < length;) {
                this.select(i);
            }
            this.trigger('Tablelist.selectall');
        },

        /**
         * Unselects all rows
         *
         * @public
         * @triggers Tablelist.unselectall
         * @author <a href="mailto:marcel.moosbrugger@bws.ac.at">Marcel Moosbrugger</a>
         */
        unselectAll: function() {
            for (var i = -1, length = this.tableRows.length; ++i < length;) {
                this.unselect(i);
            }
            this.trigger('Tablelist.unselectall');
        },

        /**
         * Ensures that the Select-All-Checkbox is checked if all rows got selected manually,
         * or is unchecked if not all are selected
         *
         * @private
         * @author <a href="mailto:marcel.moosbrugger@bws.ac.at">Marcel Moosbrugger</a>
         */
        observeSelect: function() {
            var allselected = true;
            for (var i = -1, length = this.tableRows.length; ++i < length;) {
                if (this.tableRows[i].selected === false) {
                    allselected = false;
                    break;
                }
            }
            this.allSelected = allselected;
            this.theadRow.$checkbox.attr('checked', allselected);
        },

        /**
         * Returns an Array with all selected rows in it
         *
         * @public
         * @return {Array} rows
         * @example
         *
         *  var myTablelist('#myContainer', '/folder', { });
         *  var selectedContainer = myTablelist.getSelectedRows();
         *
         * @author <a href="mailto:marcel.moosbrugger@bws.ac.at">Marcel Moosbrugger</a>
         */
        getSelectedRows: function() {
            var rows = [];
            for (var i = -1, length = this.tableRows.length; ++i < length;) {
                if (this.tableRows[i].selected === true) {
                    rows.push(this.tableRows[i].$element);
                }
            }
            return rows;
        }
    };
})(window, window.ZOOLU, window.jQuery);
