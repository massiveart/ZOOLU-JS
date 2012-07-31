TestCase('ZOOLU.UI.ButtonGroup', {
    setUp: function() {
        var buttonGroup = '<div class="buttons" id="button-group1">' +
                            '<a class="button">Button 1</a>' +
                            '<a class="button">Button 2</a>' +
                            '<a class="button">Button 3</a>' +
                          '</div>';
        $('body').append(buttonGroup);
    },

    tearDown: function() {

    },
    
    'test button group instantiation exception': function() {
        try {
            var buttonGroup = new ZOOLU.UI.ButtonGroup('#thisContdoesntexist', [
                function(){2+2;},
                function(){3+3;},
                function(){4+4;}
            ], {})
        } catch(e) {
            var error = e;
        }
        
        assertEquals('Thrown ZOOLU.UI.Exception', 'ZOOLU.UI.Exception', error.name);
   },
    
    'test button group instantiation': function() {
         try {
             var buttonGroup = new ZOOLU.UI.ButtonGroup('#button-group1', [
                 function(){2+2;},
                 function(){3+3;},
                 function(){4+4;}
             ], {})
         } catch(e) {
             fail('Button Group instantiation failed!');
         }
         
         assertEquals('ZOOLU.UI.ButtonGroup object', 'object', typeof buttonGroup);
    },
    
    'test button group buttons init': function() {
        try {
            var buttonGroup = new ZOOLU.UI.ButtonGroup('#button-group1', [
                function(){2+2;},
                function(){3+3;},
                function(){4+4;}
            ], {})
        } catch(e) {
            fail('Button Group instantiation failed!');
        }
        buttonGroup.initButtons();
        
        assertTrue('ZOOLU.UI.Buttons in an array', buttonGroup.buttons[0] instanceof ZOOLU.UI.Button);
   },
   
   'test button group callback init': function() {
       try {
           var buttonGroup = new ZOOLU.UI.ButtonGroup('#button-group1', [
               function(){2+2;},
               function(){3+3;},
               function(){4+4;}
           ], {})
       } catch(e) {
           fail('Button Group instantiation failed!');
       }
       buttonGroup.initCallbacks();
       
       assertEquals('Initialized callback function', 'function', typeof buttonGroup.buttons[0].callback);
  },
  
  'test button group callback init exception': function() {
      try {
          var buttonGroup = new ZOOLU.UI.ButtonGroup('#button-group1', [
              function(){2+2;},
              function(){3+3;},
              function(){4+4;},
              function(){5+5}
          ], {})
      } catch(e) {
          var error = e;
      }
      
      assertEquals('Thrown ZOOLU.UI.Exception', 'ZOOLU.UI.Exception', error.name);
  },
  
  'test button group callback init exception 2': function() {
      try {
          var buttonGroup = new ZOOLU.UI.ButtonGroup('#button-group1', [
              'This is not a function',
              function(){3+3;},
              function(){4+4;},
          ], {})
      } catch(e) {
          var error = e;
      }
      
      assertEquals('Thrown ZOOLU.UI.Exception', 'ZOOLU.UI.Exception', error.name);
  },
  
  'test button group data toggle handler': function() {
      try {
          var buttonGroup = new ZOOLU.UI.ButtonGroup('#button-group1', [
              function(){2+2;},
              function(){3+3;},
              function(){4+4;}
          ], {
              dataToggle: 'radio'
          })
      } catch(e) {
          fail('Button Group instantiation failed!');
      }
      var buttons = buttonGroup.buttons;
      
      buttons[0].select();
      buttons[1].select();
      buttonGroup.dataToggleHandler(1);
      
      assertFalse('Removed CSS-Class form the first selected button', buttons[0].$element.hasClass(buttons[0].options.toggleClass));
      assertTrue('Active CSS-Class from the second selected button', buttons[1].$element.hasClass(buttons[1].options.toggleClass));
  },
  
  'test button group data toggle handler': function() {
      try {
          var buttonGroup = new ZOOLU.UI.ButtonGroup('#button-group1', [
              function(){2+2;},
              function(){3+3;},
              function(){4+4;}
          ], {})
      } catch(e) {
          fail('Button Group instantiation failed!');
      }
      
      buttonGroup.buttons[0].select();
      buttonGroup.buttons[1].select();
      var selectedButtons = buttonGroup.getSelectedButtons();
      
      assertEquals('Number of the selected buttons', 2, selectedButtons.length);
  }  
   
});
