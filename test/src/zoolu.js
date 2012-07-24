// enable debug mode
window.debug = true;

TestCase('ZOOLU', {
    'test version': function() {
        assertEquals('2.0.0.alpha1', ZOOLU.version);
    }
});
