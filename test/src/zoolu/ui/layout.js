TestCase('ZOOLU.UI.Layout', {
    setUp: function() {
        var layoutCont = $('<div id="layout"/>');
        var westCont = $('<div class="west"/>');
        var centerCont = $('<div class="center" id="center"/>');
        var centerNorthCont = $('<div class="north"/>');
        var centerCenterCont = $('<div class="center"/>');
        
        layoutCont.appendTo('body');
            westCont.appendTo(layoutCont);
            centerCont.appendTo(layoutCont);
                centerNorthCont.appendTo(centerCont);
                centerCenterCont.appendTo(centerCont);
    },

    tearDown: function() {

    },

    'test Layout instantiation': function() {
//        try {
           var layout = new ZOOLU.UI.Layout('#layout'); 
//        } catch (e) {
//            fail('Layout instantiation');
//        }
        
        assertEquals('Instance of Layout Class', 'object', typeof layout);
    }
});
