TestCase('ZOOLU.STORE', {
    setUp: function() {

    },

    tearDown: function() {

    },

    'test store get instance': function() {
        try {
            var store = ZOOLU.STORE.Cookie.getInstance();
        } catch (e) {
            fail('Store initialising');
        }
        
        assertEquals('Store Cookie object', 'object', typeof store);
        assertEquals('Cookie Set function', 'function', typeof store.set);
        assertEquals('Cookie Get function', 'function', typeof store.get);
    },
    
    'test store set cookie': function() {
        var testSet, store, properties;
        try {
            store = ZOOLU.STORE.Cookie.getInstance();
        } catch (e) {
            fail('Store initialising');
        }
        testSet = 'this is a test';
        store.set('test', testSet);
        properties = JSON.parse($.cookie('ZOOLU')) || { };
        
        assertEquals('Set Cookie value', testSet, properties['test']);
    },
    
    'test store get cookie': function() {
        var testSet, store;
        try {
            store = ZOOLU.STORE.Cookie.getInstance();
        } catch (e) {
            fail('Store initialising');
        }
        testSet = 'give me cookies'
        store.set('Test', testSet);
        
        assertEquals('Get Cookie value', testSet, store.get('Test'));
    }
});
