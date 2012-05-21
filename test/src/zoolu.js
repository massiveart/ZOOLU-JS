// enable debug mode
window.debug = true;

TestCase('ZOOLU', {
    'test version': function() {
        assertEquals('0.1.0', ZOOLU.version);
    }
});