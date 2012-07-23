TestCase('ZOOLU.UTIL', {
    setUp: function() {

    },

    tearDown: function() {

    },

    'test truncate': function() {
        var limit, tooLongString, shortString;

        limit = 10;
        tooLongString = ZOOLU.UTIL.String.truncate('ThisStringIsWayTooLong', limit);
        shortString = ZOOLU.UTIL.String.truncate('thisFits', limit);

        assertEquals('Too long string length', limit, tooLongString.length);
        assertEquals('Fiting string length', 8, shortString.length);
        assertEquals('Truncated integer', '', ZOOLU.UTIL.String.truncate(11, limit));
        assertEquals('Truncated boolean', '', ZOOLU.UTIL.String.truncate(true, limit));
    },

    'test truncate at word boundaries': function() {
        var limit, tooLongString, shortString, moreWords;

        limit = 10;
        tooLongString = ZOOLU.UTIL.String.truncateAtWordBoundaries('ThisStringIsWayTooLong', limit);
        shortString = ZOOLU.UTIL.String.truncateAtWordBoundaries('thisFits', limit);
        moreWords = ZOOLU.UTIL.String.truncateAtWordBoundaries('Truncate after first word', limit);

        assertEquals('Too long string length', limit + 4, tooLongString.length);
        assertEquals('Fiting string length', 8, shortString.length);
        assertEquals('More words truncate length', 12, moreWords.length);
        assertEquals('Truncated integer', '', ZOOLU.UTIL.String.truncateAtWordBoundaries(11, limit));
        assertEquals('Truncated boolean', '', ZOOLU.UTIL.String.truncateAtWordBoundaries(true, limit));
    },

    'test truncate in between': function() {
        var limit, ownSeparator, tooLongString, truncatedByOwnSep, shortString, containsOwnSep, containsDefaultSep;

        limit = 10;
        ownSeparator = ' -- ';
        tooLongString = ZOOLU.UTIL.String.truncateInBetween('ThisStringIsWayTooLong', limit);
        truncatedByOwnSep = ZOOLU.UTIL.String.truncateInBetween('ThisIsAnotherLongString', limit, ownSeparator);
        shortString = ZOOLU.UTIL.String.truncateInBetween('thisFits', limit);
        containsOwnSep = truncatedByOwnSep.indexOf(ownSeparator) !== -1;
        containsDefaultSep = tooLongString.indexOf(' ... ') !== -1;

        assertEquals('Too long string length', limit,tooLongString.length);
        assertEquals('Fiting string length', 8, shortString.length);
        assertTrue('Contains the own separator', containsOwnSep);
        assertTrue('Contains the default separator', containsDefaultSep);
        assertEquals('Truncated integer', '', ZOOLU.UTIL.String.truncateInBetween(11, limit));
        assertEquals('Truncated boolean', '', ZOOLU.UTIL.String.truncateInBetween(false, limit));
    }
});
