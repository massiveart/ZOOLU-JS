TestCase('ZOOLU.UI.Dropdown', {
    setUp: function() {
        var dom = '<a class="button" id="button1">' +
                      'Toggle Button' +
                      '<div class="dropdown">' +
                          '<ul>' +
                              '<li>This is a Button</li>' +
                              '<li>with a Dropdown</li>' +
                              '<li>ini it.</li>' +
                          '</ul>' +
                      '</div>' +
                  ' </a>';

        $('body').append(dom);
    },

    tearDown: function() {

    },

    'test dropdown instantiation': function() {
        try {
            var dropdown = new ZOOLU.UI.Dropdown('#button1', {});
        } catch (e) {
            fail('Dropdown instantiation failed!');
        }

        assertEquals('ZOOLU.UI.Dropdown object', 'object', typeof dropdown);
    },

    'test dropdown instantiation exception': function() {
        try {
            var dropdown = new ZOOLU.UI.Dropdown('#thisContdoesntexist', {});
        } catch (e) {
            var error = e;
        }

        assertEquals('Thrown ZOOLU.UI.Exception', 'ZOOLU.UI.Exception', error.name);
    },

    'test dropdown get dropdown container': function() {
        try {
            var dropdown = new ZOOLU.UI.Dropdown('#button1', {});
        } catch (e) {
            fail('Dropdown instantiation failed!');
        }
        dropdown.getDropdownContainer();

        assertEquals('Dropdown DOM object', 'object', typeof dropdown.$dropdown);
    },

    'test dropdown add CSS': function() {
        var setWidth = '800px';
        try {
            var dropdown = new ZOOLU.UI.Dropdown('#button1', {});
        } catch (e) {
            fail('Dropdown instantiation failed!');
        }
        dropdown.addCSS({
            width: setWidth
        });

        assertEquals('Set width via addCSS', setWidth, dropdown.$dropdown.css('width'));
    },

    'test dropdown add CSS exception': function() {
        try {
            var dropdown = new ZOOLU.UI.Dropdown('#button1', {});
        } catch (e) {
            fail('Dropdown instantiation failed!');
        }
        try {
            dropdown.addCSS('This is not an object');
        } catch (e) {
            var error = e;
        }
        assertEquals('Thrown ZOOLU.UI.Exception', 'ZOOLU.UI.Exception', error.name);
    },


    'test dropdown bind events': function() {
        try {
            var dropdown = new ZOOLU.UI.Dropdown('#button1', {
                closeOnClick: true,
                resizable: true,
                triggerEvent: 'click'
            });
            var dropdown2 = new ZOOLU.UI.Dropdown('#button1', {
                closeOnClick: false,
                closeOnMouseLeave: true,
                resizable: false,
                triggerEvent: 'click'
            });
        } catch (e) {
            fail('Dropdown instantiation failed!');
        }
        dropdown.bindEvents();
        dropdown.$dropdown.click();
        $(document).click();
        dropdown2.bindEvents();
        dropdown2.$activator.click();
    },

    'test dropdown open': function() {
        try {
            var dropdown = new ZOOLU.UI.Dropdown('#button1', {
                slideDown: true,
                fadeIn: false
            });
            var dropdown2 = new ZOOLU.UI.Dropdown('#button1', {
                slideDown: false,
                fadeIn: true
            });
            var dropdown3 = new ZOOLU.UI.Dropdown('#button1', {
                slideDown: false,
                fadeIn: false
            });
        } catch (e) {
            fail('Dropdown instantiation failed!');
        }

        dropdown.open();
        dropdown2.open();
        dropdown3.open();

        assertTrue('Opened attribute', dropdown.opened);
        assertTrue('Opened attribute', dropdown2.opened);
        assertTrue('Opened attribute', dropdown3.opened);
    },

    'test dropdown close': function() {
        try {
            var dropdown = new ZOOLU.UI.Dropdown('#button1', {
                slideUp: true,
                fadeOut: false
            });
            var dropdown2 = new ZOOLU.UI.Dropdown('#button1', {
                slideUp: false,
                fadeOut: true
            });
            var dropdown3 = new ZOOLU.UI.Dropdown('#button1', {
                slideUp: false,
                fadeOut: false
            });
        } catch (e) {
            fail('Dropdown instantiation failed!');
        }

        dropdown.open();
        dropdown2.open();
        dropdown3.open();
        dropdown.close();
        dropdown2.close();
        dropdown3.close();

        assertFalse('Opened attribute', dropdown.opened);
        assertFalse('Opened attribute', dropdown2.opened);
        assertFalse('Opened attribute', dropdown3.opened);
    },

    'test dropdown toggle': function() {
        var open, close;
        try {
            var dropdown = new ZOOLU.UI.Dropdown('#button1', {});
        } catch (e) {
            fail('Dropdown instantiation failed!');
        }
        dropdown.toggle();
        assertTrue('Opened attribute', dropdown.opened);
        dropdown.toggle();
        assertFalse('Opened attribute', dropdown.opened);
    }
});
