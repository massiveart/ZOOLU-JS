describe('ZOOLU.UI', function() {

    var $tree, server;

    beforeEach(function() {
        $tree = $('<div id="tree"/>');
        $('body').append($tree);

        server = sinon.fakeServer.create();

        server.respondWith('GET', '/nodes',
            [200, { 'Content-Type': 'application/json' },
                '[{ "id": 1, "type": "page", "name": "Home" },' +
                ' { "id": 2, "type": "folder", "name": "News" }]']);

        server.respondWith('GET', '/nodes/2/children',
            [200, { 'Content-Type': 'application/json' },
                '[{ "id": 3, "type": "start-page", "name": "News" },' +
                ' { "id": 4, "type": "page", "name": "New major release ZOOLU 2.0" },' +
                ' { "id": 5, "type": "folder", "name": "Archive" }]']);

        server.respondWith('GET', '/nodes/5/children',
            [200, { 'Content-Type': 'application/json' },
                '[{ "id": 6, "type": "start-page", "name": "Archive" },' +
                ' { "id": 7, "type": "page", "name": "New major release ZOOLU 1.3" },' +
                ' { "id": 8, "type": "page", "name": "New major release ZOOLU 1.2" }]']);
    });

    afterEach(function(){
        server.restore();
        $tree.remove();
    });

    it('ColumnTree load nodes', function() {
        try {
            var columnTree = new ZOOLU.UI.ColumnTree('#tree', { url: '/nodes', hasChildren: { 'folder': true } });
            server.respond();
        } catch (e) {

        }

        expect(columnTree.data[columnTree.level].length).toEqual(2);
    });
});
