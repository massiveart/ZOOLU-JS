TestCase('ZOOLU.MIXIN', {
    setUp: function() {
        this.eventApi = {};
    },
    
    tearDown: function() {
    
    },
    
    'test Event Api enable': function() {
        ZOOLU.MIXIN.Events.enable.call(this.eventApi);
    
        assertEquals('Type of the listener Object', 'object', typeof this.eventApi.listeners);
        assertEquals('Type of the listener Object', 'function', typeof this.eventApi.trigger);
        assertEquals('Type of the listener Object', 'function', typeof this.eventApi.on);
        assertEquals('Type of the listener Object', 'function', typeof this.eventApi.off);
    },
    
    'test Event Api on': function() {
        var eventName, callback;
        eventName = 'testEvent';
    
        ZOOLU.MIXIN.Events.enable.call(this.eventApi);
        this.eventApi.on(eventName, function() {
            callback = 'do something';
        });
    
        assertEquals('Stored Event type', 'object', typeof this.eventApi.listeners[eventName]);
        assertEquals('Stored Callback type', 'function', typeof this.eventApi.listeners[eventName][0]);
    },
    
    'test Event Api trigger': function() {
        var eventName, callbackResult, triggerArg, argValue;
        eventName = 'testEvent';
        argValue = 'this is a string';
    
        ZOOLU.MIXIN.Events.enable.call(this.eventApi);
        this.eventApi.on(eventName, function(arg) {
            callbackResult = 2 + 2;
            triggerArg = arg;
        });
        this.eventApi.trigger(eventName, [ argValue ]);
    
        assertEquals('Result of callback', 4, callbackResult);
        assertEquals('Trigger passed argument', argValue, triggerArg);
    },
    
    'test Event Api off': function() {
        var eventName1, eventName2, callbackOneRemove, callbackOneStay, callbackAll1, callbackAll2;
        eventName1 = 'testEvent';
        eventName2 = 'testEvent2';
        callbackOneRemove = function() {
            var calc = 2 + 2;
        };
        callbackOneStay = function() {
            var calc = 2 + 2;
        };
        callbackAll1 = function() {
            var calc = 2 + 2;
        };
        callbackAll2 = function() {
            var calc = 2 + 2;
        };
    
        ZOOLU.MIXIN.Events.enable.call(this.eventApi);
    
        this.eventApi.on(eventName1, callbackOneRemove);
        this.eventApi.on(eventName1, callbackOneStay);
        this.eventApi.off(eventName1, callbackOneRemove);
    
        this.eventApi.on(eventName2, callbackAll1);
        this.eventApi.on(eventName2, callbackAll2);
        this.eventApi.off(eventName2);
    
        assertEquals('Second Callback from Event 1 - now on first place', callbackOneStay, this.eventApi.listeners[eventName1][0]);
        assertEquals('Removed callback from Event 1', 'undefined', typeof this.eventApi.listeners[eventName1][1]);
        assertEquals('First removed callback from Event 2', 'undefined', typeof this.eventApi.listeners[eventName2][0]);
        assertEquals('Second removed callback from Event 2', 'undefined', typeof this.eventApi.listeners[eventName2][1]);
    }
});
