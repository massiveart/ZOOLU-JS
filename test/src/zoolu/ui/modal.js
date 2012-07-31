TestCase('ZOOLU.UI.Modal', {
    setUp: function() {

    },

    tearDown: function() {

    },
    
    'test initialize modal view ': function() {
        try {
            var modal = new ZOOLU.UI.Modal();
        } catch(e) {
            fail('Initialization failed');
        }
        
        assertEquals('Modal view object', 'object', typeof modal);
    },
    
    'test modal add css': function() {
        var prop = 'width',
            value = '200px';
        try {
            var modal = new ZOOLU.UI.Modal();
        } catch(e) {
            fail('Initialization failed');
        }
        modal.addCSS(prop, value);
        
        assertEquals('Pushed CSS-property', prop, modal.css[0][0]);
        assertEquals('Pushed CSS-value', value, modal.css[0][1]);
    },
    
    'test modal initialize css': function() {
        var prop = 'width',
        value = '200px',
        returnedValue;
        try {
            var modal = new ZOOLU.UI.Modal();
        } catch(e) {
            fail('Initialization failed');
        }
        modal.addCSS(prop, value);
        modal.$element = $('<div/>');
        modal.initCSS();
        returnedValue = modal.$element.css(prop);
        
        assertEquals('Applyed value for the CSS-property', value, returnedValue);
    },
    
    'test modal build overlay': function() {
        var ovClass = 'testClass';
        try {
            var modal = new ZOOLU.UI.Modal({
                overlay: true,
                overlayClass: ovClass,
                overlayColor: '#123456'
            });
        } catch(e) {
            fail('Initialization failed');
        }
        modal.buildOverlay();
        
        assertEquals('Overlay DOM Object', 'object', typeof modal.$overlay);
        assertTrue('Applied CSS Class', modal.$overlay.hasClass(ovClass));
        assertTrue('Applied CSS background-color', !!modal.$overlay.css('background-color'));
    },
    
    'test initialize the modal view dom': function() {
        try {
            var modal = new ZOOLU.UI.Modal();
        } catch(e) {
            fail('Initialization failed');
        }
        modal.initElement();
        
        assertEquals('Modal view DOM Object', 'object', typeof modal.$element);
    },
    
    'test initialize the header dom': function() {
        var hTitle = 'This is a title',
            hTitleClass = 'testTitleClass',
            hCloseClass ='testCloseClass';
        try {
            var modal = new ZOOLU.UI.Modal({
                header: true,
                headerTitle: hTitle,
                headerTitleClass: hTitleClass,
                headerClose: true,
                headerCloseClass: hCloseClass
            });
        } catch(e) {
            fail('Initialization failed');
        }
        modal.initHeader();
        
        assertEquals('Header DOM Object', 'object', typeof modal.$header);
        assertTrue('Applied headerTitle DOM with CSS-class', modal.$header.html().indexOf(hTitleClass) !== -1);
        assertTrue('Applied headerTitle', modal.$header.html().indexOf(hTitle) !== -1);
        assertTrue('Applied close DOM with CSS-class', modal.$header.html().indexOf(hCloseClass) !== -1);
        
    },
    
    'test initialize the content dom': function() {
        try {
            var modal = new ZOOLU.UI.Modal();
        } catch(e) {
            fail('Initialization failed');
        }
        modal.initContent();
        
        assertEquals('Initialized Content DOM Object', 'object', typeof modal.$content);
    },
    
    'test modal view add content': function() {
        var content = 'testContent';
        try {
            var modal = new ZOOLU.UI.Modal();
        } catch(e) {
            fail('Initialization failed');
        }
        modal.addContent(content);
        
        assertEquals('Content added to the content attribute', content, modal.content);
    },
    
    'test modal view add footer buttons': function() {
        var bContent = 'Button 1',
            bClass = 'button',
            bId = 'button1',
            btn;

        try {
            var modal = new ZOOLU.UI.Modal({
                footer: true,
                footerButtons: true
            });
        } catch(e) {
            fail('Initialization failed');
        }
        modal.addFooterButtons([
            {content: bContent, callBack: function(){ 2+2; }, cssClass: bClass, elementId: bId}
        ]);

        btn = modal.footerButtons[0];
        assertEquals('Pushed Button content', bContent, btn.content);
        assertEquals('Pushed Button callback', 'function', typeof btn.callBack);
        assertEquals('Pushed Button CSS-class', bClass, btn.cssClass);
        assertEquals('Pushed Button ID', bId, btn.elementId);
    },
    
    'test add footer buttons exception': function() {
        try {
            var modal = new ZOOLU.UI.Modal({
                footer: true,
                footerButtons: true
            });
        } catch(e) {
            fail('Initialization failed');
        }
        try {
            modal.addFooterButtons(1);
        } catch(e) {
            var error = e;
        }
        
        assertEquals('Thrown ZOOLU.UI Exception', 'ZOOLU.UI.Exception', error.name);
    },
    
    'test initzialize footer buttons': function() {
        var bcClass = 'testclass',
            bContent = 'this is button content';
        try {
            var modal = new ZOOLU.UI.Modal({
                footer: true,
                footerButtons: true,
                footerButtonsContainerClass: bcClass
            });
        } catch(e) {
            fail('Initialization failed');
        }
        modal.addFooterButtons([
            {content: bContent, callBack: function(){ 2+2; }, cssClass: 'button', elementId: 'button1'}
        ]);
        modal.initFooterButtons();
        
        assertTrue('Initialized Footer Buttons DOM Object', modal.$footerButtons.hasClass(bcClass));
        assertTrue('Button DOM added to the Footer Buttons DOM', modal.$footerButtons.html().indexOf(bContent) !== -1);
    },
    
    'test initialize the footer dom': function() {
        var fCloseClass = 'closeClass',
            fCloseText = 'cancleIt';
        try {
            var modal = new ZOOLU.UI.Modal({
                footer: true,
                footerClose: true,
                footerCloseClass: fCloseClass,
                footerCloseText: fCloseText,
                footerButtons: true
            });
        } catch(e) {
            fail('Initialization failed');
        }
        modal.addFooterButtons([
            {content: 'Button 1', callBack: function(){ 2+2; }, cssClass: 'button', elementId: 'button1'}
        ]);
        modal.initFooter();
        
        assertEquals('Footer DOM Object', 'object', typeof modal.$footer);
        assertTrue('Applied close DOM with CSS-class', modal.$footer.html().indexOf(fCloseClass) !== -1);
        assertTrue('Applied close text', modal.$footer.html().indexOf(fCloseText) !== -1);
    },
    
    'test modal view set position': function() {
        var mleft = '200px',
            mtop = '300px';
            mright = '50px';
            mbottom = '144px';
        try {
            var modal = new ZOOLU.UI.Modal({
                left: mleft,
                top: mtop
            });
            var modal1 = new ZOOLU.UI.Modal({
                bottom: mbottom,
                right: mright
            });
            var modal2 = new ZOOLU.UI.Modal();
        } catch(e) {
            fail('Initialization failed');
        }
        modal.initElement();
        modal.setPosition();
        modal1.initElement();
        modal1.setPosition();
        modal2.initElement();
        modal2.setPosition();
        
        assertEquals('Applied CSS-style left', mleft, modal.$element.css('left'));
        assertEquals('Applied CSS-style top', mtop, modal.$element.css('top'));
        assertEquals('Applied CSS-style right', mright, modal1.$element.css('right'));
        assertEquals('Applied CSS-style bottom', mbottom, modal1.$element.css('bottom'));
    },
    
    'test modal view display - fadein': function() {
        try {
            var modal = new ZOOLU.UI.Modal();
            var modal2 = new ZOOLU.UI.Modal();
        } catch(e) {
            fail('Initialization failed');
        }
        modal.options.fadeIn = true;
        modal.display();
        
        modal2.options.fadeIn = false;
        modal2.display();
        assertTrue('Modal View DOM appended to the body with fadeIn', $('body').html().indexOf(modal.$element.html()) !== -1);
        assertTrue('Modal View DOM appended to the body without fadeIn', $('body').html().indexOf(modal2.$element.html()) !== -1);
    },
    
    'test modal view close': function() {
        try {
            var modal = new ZOOLU.UI.Modal();
            var modal2 = new ZOOLU.UI.Modal();
        } catch(e) {
            fail('Initialization failed');
        }
        modal.options.fadeOut = true;
        modal.display();
        modal.close();
        
        modal2.options.fadeOut = false;
        modal2.display();
        modal2.close();
        
        setTimeout(function(){assertEquals('Modal View DOM appended to the body without fadeOut', -1, $('body').html().indexOf(modal.$element.html()));}, modal.options.fadeOutDuration + 500);
        setTimeout(function(){assertEquals('Modal View DOM appended to the body without fadeOut', -1, $('body').html().indexOf(modal2.$element.html()));}, 500);
    },
    
    'test initialize box events': function() {
        try {
            var modal = new ZOOLU.UI.Modal({
                fadeIn: false,
                fadeOut: false,
                draggable: true,
                resizable : true,
                headerClose: true,
                footerClose: true,
                overlay: true,
                overlayClose: true
            });
            var modal2 = new ZOOLU.UI.Modal({
                draggable: true,
                resizable : false,
                headerClose: false,
                footerClose: false,
                overlay: false
            });
        } catch(e) {
            fail('Initialization failed');
        }
        modal.buildModal();
        modal.buildOverlay();
        modal.initBoxEvents();
        
        modal.$headerClose.click();
        modal.display();
        modal.$footerClose.click();
        modal.display();
        modal.$overlay.click();
        
        modal2.buildModal();
        modal2.buildOverlay();
        modal2.initBoxEvents();
    }
});
