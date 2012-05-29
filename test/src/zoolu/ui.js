TestCase('ZOOLU.UI', {
    setUp: function() {
        this.$tree = $('<div id="tree"/>');
        $('body').append(this.$tree);

        this.server = sinon.fakeServer.create();

        this.server.respondWith('GET', '/nodes',
            [200, { 'Content-Type': 'application/json' },
                '[{ "id": 1, "type": "page", "name": "Home" },' +
                ' { "id": 2, "type": "folder", "name": "News" }]']);

        this.server.respondWith('GET', '/nodes/2/children',
            [200, { 'Content-Type': 'application/json' },
                '[{ "id": 3, "type": "start-page", "name": "News" },' +
                ' { "id": 4, "type": "page", "name": "New major release ZOOLU 2.0" },' +
                ' { "id": 5, "type": "folder", "name": "Archive" }]']);

        this.server.respondWith('GET', '/nodes/5/children',
            [200, { 'Content-Type': 'application/json' },
                '[{ "id": 6, "type": "start-page", "name": "Archive" },' +
                ' { "id": 7, "type": "page", "name": "New major release ZOOLU 1.3" },' +
                ' { "id": 8, "type": "page", "name": "New major release ZOOLU 1.2" }]']);
    },

    tearDown: function() {
        this.server.restore();
    },

    'test column tree instantiation': function() {
        try {
            var columnTree = new ZOOLU.UI.ColumnTree('#tree');
        } catch (e) {
            fail('Column tree instantiation');
        }

        assertEquals('Column tree instance', 'object', typeof columnTree);
    },

    'test column tree load nodes': function() {
        try {
            var columnTree = new ZOOLU.UI.ColumnTree('#tree', { url: '/nodes', hasChildren: { 'folder': true } });
            this.server.respond();
        } catch (e) {
            fail('Column tree instantiation');
        }

        assertEquals('Column data length', 2, columnTree.data[columnTree.level].length);
        assertEquals('Column length', 1, $('#tree .column').length);
        assertEquals('First column', 1, $('#column-0').length);
        assertEquals('First column rows', 2, $('#column-0 .row').length);
    },

    'test column tree select node': function() {
        try {
            var columnTree = new ZOOLU.UI.ColumnTree('#tree', { url: '/nodes', hasChildren: { 'folder': true } });
            this.server.respond();
        } catch (e) {
            fail('Column tree instantiation');
        }

        var event = sinon.spy();
        columnTree.on('ColumnTree.select', event);

        // select folder and load children
        $('#row-2-folder').click();
        this.server.respond();

        assertTrue('ColumnTree select event triggered', event.calledOnce);
        assertEquals('ColumnTree selected element id', 'row-2-folder', $(event.args[0][0]).attr('id'))
        assertEquals('Second column', 1, $('#column-1').length);
        assertEquals('Second column rows', 3, $('#column-1 .row').length);
    },

    'test column tree select nested node': function() {
        try {
            var columnTree = new ZOOLU.UI.ColumnTree('#tree', { url: '/nodes', hasChildren: { 'folder': true } });
            this.server.respond();
        } catch (e) {
            fail('Column tree instantiation');
        }

        var event = sinon.spy();
        columnTree.on('ColumnTree.select', event);

        // select folder and load children
        $('#row-2-folder').click();
        this.server.respond();

        // select folder and load children
        $('#row-5-folder').click();
        this.server.respond();

    }
});
