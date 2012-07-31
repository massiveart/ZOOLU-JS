TestCase('ZOOLU.UI.Button', {
    setUp: function() {
        var button = $('<a class="button" id="button1"/>');
        $('body').append(button);
    },

    tearDown: function() {

    },
    
    'test button instantiation': function() {
        try {
            var button = new ZOOLU.UI.Button('#button1', function(){2+2;}, {});
        } catch(e) {
            fail('Button instantiation failed!');
        }
        
        assertEquals('ZOOLU.UI.Button object', 'object', typeof button);
        assertEquals('Button callback', 'function', typeof button.callback);
    },
    
    'test button group instantiation exception': function() {
        try {
            var button = new ZOOLU.UI.Button('#thisContdoesntexist', function(){2+2;}, {});
        } catch(e) {
            var error = e;
        }
        
        assertEquals('Thrown ZOOLU.UI.Exception', 'ZOOLU.UI.Exception', error.name);
   },
    
    'test button select': function() {
        try {
            var button = new ZOOLU.UI.Button('#button1', function(){2+2;}, {});
        } catch(e) {
            fail('Button instantiation failed!');
        }
        button.select();
        
        assertTrue('Active Class added to the button', button.$element.hasClass(button.options.toggleClass));
        assertTrue('Selected attribute of the button', button.selected);
    },
    
    'test button autoselect': function() {
        try {
            var button = new ZOOLU.UI.Button('#button1', function(){2+2;}, {
                autoselect: true
            });
        } catch(e) {
            fail('Button instantiation failed!');
        }
        
        assertTrue('Active Class added to the button', button.$element.hasClass(button.options.toggleClass));
        assertTrue('Selected attribute of the button', button.selected);
    },
    
    'test button unselect': function() {
        try {
            var button = new ZOOLU.UI.Button('#button1', function(){2+2;}, {});
        } catch(e) {
            fail('Button instantiation failed!');
        }
        button.select();
        button.unselect();
        
        assertFalse('Active Class removed from the button', button.$element.hasClass(button.options.toggleClass));
        assertFalse('Selected attribute of the button', button.selected);
    },
    
    'test button execute callback': function() {
        var callbackResult;
        try {
            var button = new ZOOLU.UI.Button('#button1', function(){
                callbackResult = 2 + 2;
            });
        } catch(e) {
            fail('Button instantiation failed!');
        }
        button.selected = true;
        button.exeCallback();
        
        assertEquals('Result of the callback', 4, callbackResult);
    },
    
    'test button event select unselect': function() {
        var callbackResult;
        try {
            var button = new ZOOLU.UI.Button('#button1', function(){
                callbackResult = 2 + 2;
            });
        } catch(e) {
            fail('Button instantiation failed!');
        }
        
        //open/close
        button.$element.click();
        button.$element.click();
    },
    
    'test button add toggle class': function() {
        try {
            var button = new ZOOLU.UI.Button('#button1', function(){2+2;}, {
                toggle: true
            });
        } catch(e) {
            fail('Button instantiation failed!');
        }
        button.addToggleClass();
        
        assertTrue('Added CSS-Class', button.$element.hasClass(button.options.toggleClass));
    },
    
    'test button remove toggle class': function() {
        try {
            var button = new ZOOLU.UI.Button('#button1', function(){2+2;}, {
                toggle: true
            });
        } catch(e) {
            fail('Button instantiation failed!');
        }
        button.addToggleClass();
        button.removeToggleClass();
        
        assertFalse('Removed CSS-Class', button.$element.hasClass(button.options.toggleClass));
    },
    
    'test button bind toggle back handler': function() {
        try {
            var button = new ZOOLU.UI.Button('#button1', function(){2+2;}, {
                toggle: true,
                toggleBackOnlyOnButton: false,
                triggerEvent: 'click'
            });
            var button2 = new ZOOLU.UI.Button('#button1', function(){2+2;}, {
                toggle: true,
                toggleBackOnlyOnButton: true,
                toggleBackOnMouseLeave: true
            });
        } catch(e) {
            fail('Button instantiation failed!');
        }
        button.bindToggleBackHandler();        
        button.$element.click();
        button2.bindToggleBackHandler();     
    }

});
