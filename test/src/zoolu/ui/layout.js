TestCase('ZOOLU.UI.Layout', {
    setUp: function() {
        var layoutCont = $('<div id="layout" class="busy" role="main"/>');
        var westCont = $('<div class="west"/>');
        var centerCont = $('<div class="center" id="center"/>');
        var centerNorthCont = $('<div class="north"/>');
        var centerCenterCont = $('<div class="center"/>');
                
                 centerCont.append(centerNorthCont);
                 centerCont.append(centerCenterCont);
             layoutCont.append(centerCont);
             layoutCont.append(westCont);
         $('body').append(layoutCont);
                
        
        layoutCont.css('width', '1000px');
        layoutCont.css('height', '500px');
            westCont.css('height', '200px');
            westCont.css('width', '500px');
            centerCont.css('width', '800px');
            centerCont.css('height', '500px');
                centerNorthCont.css('width', '800px');
                centerNorthCont.css('height', '250px');
                centerCenterCont.css('width', '800px');
                centerCenterCont.css('height', '250px');
    },

    tearDown: function() {

    },

    'test Layout and layout.panel instantiation': function() {
        try {
           var layout = new ZOOLU.UI.Layout('#layout'); 
        } catch (e) {
            fail('Layout instantiation');
        }
        
        assertEquals('Instance of Layout Class', 'object', typeof layout);
        assertEquals('Panel west object', 'object', typeof layout.panels['west']);
        assertEquals('Panel center object', 'object', typeof layout.panels['center']);
    },
    
    'test layout update dimension': function() {
        var width = 400, height = 200;
        try {
            var layout = new ZOOLU.UI.Layout('#layout'); 
         } catch (e) {
             fail('Layout instantiation');
         }
         layout.updateDimension(width, height);
         
         assertEquals('Width of the layout.container', width, layout.$container.width());
         assertEquals('Height of the layout.container', height, layout.$container.height());
    },
    
    'test layout.panel add minimizer': function() {
        try {
            var layout = new ZOOLU.UI.Layout('#layout', {
                minimizeOrientations: ['south']
            }); 
         } catch (e) {
             fail('Layout instantiation');
         }
         
         layout.panels['west'].addMinimizer(layout.panels['west'].$handler, ['west']);
         
         assertTrue('Minimizer DOM Element', !!$('#layout .west .handler .minimizer').length);
    },
    
    'test layout.panel apply stored dimensions': function() {
        var storeWidth = 211, storeHeight = 322;
        var store = ZOOLU.STORE.Cookie.getInstance();
        store.set('PANEL.west.height', storeHeight);
        store.set('PANEL.west.width', storeWidth);
        
        try {
            var layout = new ZOOLU.UI.Layout('#layout', {
                storeDimensions: true
            }); 
         } catch (e) {
             fail('Layout instantiation');
         }
         
         assertEquals('Stored Width', storeWidth, $('#layout .west').width());
         assertEquals('Stored Height', storeHeight, $('#layout .west').height());
    },
    
    'test layout.panel minimize': function() {
        var minHeight = 15, minWidth = 10;
        try {
            var layout = new ZOOLU.UI.Layout('#layout', {
                minimizeHeight: minHeight,
                minimizeWidth: minWidth
            }); 
         } catch (e) {
             fail('Layout instantiation');
         }
         
         layout.panels['west'].minimize();
         layout.panels['center'].panels['north'].minimize();
         
         assertEquals('Panel West Width', minWidth, layout.panels['west'].$element.width());
         assertEquals('Panel North Height', minHeight, layout.panels['center'].panels['north'].$element.height());
         assertTrue('Closed Attribute', layout.panels['west'].closed);
    },
    
    'test layout.panel maximize': function() {
        var currentWidth = $('#layout .west').width(), currentHeight = $('#layout .center .north').height();
        try {
            var layout = new ZOOLU.UI.Layout('#layout', {
                storeDimensions: false,
                minimizeHeight: 10,
                minimizeWidth: 10
            }); 
         } catch (e) {
             fail('Layout instantiation');
         }
         
         layout.panels['west'].minimize();
         layout.panels['center'].panels['north'].minimize();
         layout.panels['west'].maximize();
         layout.panels['center'].panels['north'].maximize();
         
         assertEquals('Recoverd Panel width', currentWidth, layout.panels['west'].$element.width());
         assertEquals('Recoverd Panel height', currentHeight, layout.panels['center'].panels['north'].$element.height());
    },
    
    'test layout.panel resize': function() {
        var beginningWidth = $('#layout .west').width(), beginningHeight = $('#layout .center .north').height();
        
        try {
            var layout = new ZOOLU.UI.Layout('#layout', {
                storeDimensions: false
            }); 
         } catch (e) {
             fail('Layout instantiation');
         }
         
         layout.panels['west'].resize({
             pageX: 321
         });
         layout.panels['center'].panels['north'].resize({
             pageY: 321
         });
         
         assertTrue('Width changed - Panel West', beginningWidth != layout.panels['west'].$element.width());
         assertTrue('Height changed - Panel North', beginningHeight != layout.panels['center'].panels['north'].$element.width());
    },
    
    'test layout.panel update dimension': function() {
        var newWidth = 10, newHeight = 10;
        try {
            var layout = new ZOOLU.UI.Layout('#layout', {
                storeDimensions: false
            }); 
         } catch (e) {
             fail('Layout instantiation');
         }
         
         layout.panels['west'].updateDimension(newWidth);
         layout.panels['center'].panels['north'].updateDimension(null, newHeight);
         
         assertEquals('Updated width - panel west', newWidth, layout.panels['west'].$element.width());
         assertEquals('Updated height - panel north', newHeight, layout.panels['center'].panels['north'].$element.height());
    },
    
    'test layout.panel set position left': function() {
        var posLeft = 144;
        try {
            var layout = new ZOOLU.UI.Layout('#layout', {
                storeDimensions: false
            }); 
         } catch (e) {
             fail('Layout instantiation');
         }
         layout.panels['west'].$element.css('position','relative');
         layout.panels['west'].setPositionLeft(posLeft);
         
         assertEquals('New position left - panel west', posLeft+'px', layout.panels['west'].$element.css('left'));
    },
    
    'test layout.panel set position top': function() {
             var posTop = 133;
             try {
                 var layout = new ZOOLU.UI.Layout('#layout', {
                     storeDimensions: false
                 }); 
              } catch (e) {
                  fail('Layout instantiation');
              }
              layout.panels['west'].$element.css('position','relative');
              layout.panels['west'].setPositionTop(posTop);
              
              assertEquals('New position top - panel north', posTop+'px', layout.panels['west'].$element.css('top'));
         }
});
