TestCase('ZOOLU.UI.Tablelist', {
    setUp: function() {
        this.container = $('<div id="jsonList"></div>');
        $('body').append(this.container);
        
        this.server = sinon.fakeServer.create();
        
        /*Sorting requests begin*/
        this.server.respondWith('GET', '/list?sort=&sortType=&pageEntries=20&page=1',
                [200, { 'Content-Type': 'application/json' },
                    '{"amount":6,"page":1,"items":[["<img src=../assets/img/icons/tmp_icon.png />","D Title","be","Elvis Presley"],["<img src=../assets/img/icons/tmp_icon.png />","A Title","en","Netsky"],["<img src=../assets/img/icons/tmp_icon.png />","C Title","cn","Marylin Monroe"],["<img src=../assets/img/icons/tmp_icon.png />","E Title","ga","Johnny Cash"],["<img src=../assets/img/icons/tmp_icon.png />","B Title","de","Kurt Cobain"],["<img src=../assets/img/icons/tmp_icon.png />","F Title","ru","John Lennon"]]}']);

        this.server.respondWith('GET', '/list?sort=title&sortType=asc&pageEntries=20&page=1',
                [200, { 'Content-Type': 'application/json' },
                    '{"amount":6,"page":1,"items":[["<img src=../assets/img/icons/tmp_icon.png />","A Title","en","Netsky"],["<img src=../assets/img/icons/tmp_icon.png />","B Title","de","Kurt Cobain"],["<img src=../assets/img/icons/tmp_icon.png />","C Title","cn","Marylin Monroe"],["<img src=../assets/img/icons/tmp_icon.png />","D Title","be","Elvis Presley"],["<img src=../assets/img/icons/tmp_icon.png />","E Title","ga","Johnny Cash"],["<img src=../assets/img/icons/tmp_icon.png />","F Title","ru","John Lennon"]]}']);

        this.server.respondWith('GET', '/list?sort=title&sortType=desc&pageEntries=20&page=1',
                [200, { 'Content-Type': 'application/json' },
                    '{"amount":6,"page":1,"items":[["<img src=../assets/img/icons/tmp_icon.png />","F Title","ru","John Lennon"],["<img src=../assets/img/icons/tmp_icon.png />","E Title","ga","Johnny Cash"],["<img src=../assets/img/icons/tmp_icon.png />","D Title","be","Elvis Presley"],["<img src=../assets/img/icons/tmp_icon.png />","C Title","cn","Marylin Monroe"],["<img src=../assets/img/icons/tmp_icon.png />","B Title","de","Kurt Cobain"],["<img src=../assets/img/icons/tmp_icon.png />","A Title","en","Netsky"]]}']);

        this.server.respondWith('GET', '/list?sort=language&sortType=asc&pageEntries=20&page=1',
                [200, { 'Content-Type': 'application/json' },
                    '{"amount":6,"page":1,"items":[["<img src=../assets/img/icons/tmp_icon.png />","D Title","be","Elvis Presley"],["<img src=../assets/img/icons/tmp_icon.png />","C Title","cn","Marylin Monroe"],["<img src=../assets/img/icons/tmp_icon.png />","B Title","de","Kurt Cobain"],["<img src=../assets/img/icons/tmp_icon.png />","A Title","en","Netsky"],["<img src=../assets/img/icons/tmp_icon.png />","E Title","ga","Johnny Cash"],["<img src=../assets/img/icons/tmp_icon.png />","F Title","ru","John Lennon"]]}']);

        this.server.respondWith('GET', '/list?sort=language&sortType=desc&pageEntries=20&page=1',
                [200, { 'Content-Type': 'application/json' },
                    '{"amount":6,"page":1,"items":[["<img src=../assets/img/icons/tmp_icon.png />","F Title","ru","John Lennon"],["<img src=../assets/img/icons/tmp_icon.png />","E Title","ga","Johnny Cash"],["<img src=../assets/img/icons/tmp_icon.png />","A Title","en","Netsky"],["<img src=../assets/img/icons/tmp_icon.png />","B Title","de","Kurt Cobain"],["<img src=../assets/img/icons/tmp_icon.png />","C Title","cn","Marylin Monroe"],["<img src=../assets/img/icons/tmp_icon.png />","D Title","be","Elvis Presley"]]}']);

        this.server.respondWith('GET', '/list?sort=creator&sortType=asc&pageEntries=20&page=1',
                [200, { 'Content-Type': 'application/json' },
                    '{"amount":6,"page":1,"items":[["<img src=../assets/img/icons/tmp_icon.png />","D Title","be","Elvis Presley"],["<img src=../assets/img/icons/tmp_icon.png />","F Title","ru","John Lennon"],["<img src=../assets/img/icons/tmp_icon.png />","E Title","ga","Johnny Cash"],["<img src=../assets/img/icons/tmp_icon.png />","B Title","de","Kurt Cobain"],["<img src=../assets/img/icons/tmp_icon.png />","C Title","cn","Marylin Monroe"],["<img src=../assets/img/icons/tmp_icon.png />","A Title","en","Netsky"]]}']);

        this.server.respondWith('GET', '/list?sort=creator&sortType=desc&pageEntries=20&page=1',
                [200, { 'Content-Type': 'application/json' },
                    '{"amount":6,"page":1,"items":[["<img src=../assets/img/icons/tmp_icon.png />","A Title","en","Netsky"],["<img src=../assets/img/icons/tmp_icon.png />","C Title","cn","Marylin Monroe"],["<img src=../assets/img/icons/tmp_icon.png />","B Title","de","Kurt Cobain"],["<img src=../assets/img/icons/tmp_icon.png />","E Title","ga","Johnny Cash"],["<img src=../assets/img/icons/tmp_icon.png />","F Title","ru","John Lennon"],["<img src=../assets/img/icons/tmp_icon.png />","D Title","be","Elvis Presley"]]}']);
        /*Sorting request end*/
        
        
        /*Paging requests begin*/
        this.server.respondWith('GET', '/list??sort=&sortType=&pageEntries=2&page=1',
                [200, { 'Content-Type': 'application/json' },
                    '{"amount":6,"page":1,"items":[["<img src=../assets/img/icons/tmp_icon.png />","B Title","de","Kurt Cobain"],["<img src=../assets/img/icons/tmp_icon.png />","A Title","en","Netsky"]]}']);
        
        this.server.respondWith('GET', '/list?sort=&sortType=&pageEntries=2&page=1',
                [200, { 'Content-Type': 'application/json' },
                    '{"amount":6,"page":1,"items":[["<img src=../assets/img/icons/tmp_icon.png />","A Title","en","Netsky"],["<img src=../assets/img/icons/tmp_icon.png />","B Title","de","Kurt Cobain"]]}']);

        this.server.respondWith('GET', '/list?sort=&sortType=&pageEntries=2&page=2',
                [200, { 'Content-Type': 'application/json' },
                    '{"amount":6,"page":2,"items":[["<img src=../assets/img/icons/tmp_icon.png />","C Title","cn","Marylin Monroe"],["<img src=../assets/img/icons/tmp_icon.png />","D Title","be","Elvis Presley"]]}']);

        this.server.respondWith('GET', '/list?sort=&sortType=&pageEntries=2&page=3',
                [200, { 'Content-Type': 'application/json' },
                    '{"amount":6,"page":3,"items":[["<img src=../assets/img/icons/tmp_icon.png />","E Title","ga","Johnny Cash"],["<img src=../assets/img/icons/tmp_icon.png />","F Title","ru","John Lennon"]]}']);    
        /*Paging request end*/ 
    },

    tearDown: function() {
        this.server.restore();
    },
    
    'test tablelist instantiation': function() {
        try {
            var jsonList = new ZOOLU.UI.Tablelist('#jsonList', '/list', {
                domPagination: false,
                calculatePagination: true,
                header: [
                   { name: 'icon', title: '', sort: false }, 
                   { name: 'title', title: 'Titel', sort: true },
                   { name: 'language', title: 'Language', sort: true },
                   { name: 'creator', title: 'Creator', sort: true }
                ]
            });
        } catch(e) {
            fail('Tablelist instantiation failed');
        }
        
        assertEquals('ZOOLU.UI.Tablelist object', 'object', typeof jsonList);
    },
    
    'test tablelist instantiation exception': function() {
        var error;
        try {
            var jsonList = new ZOOLU.UI.Tablelist('#thisContainerdoesntexist', '/list', {
                domPagination: false,
                calculatePagination: true,
                header: [
                   { name: 'icon', title: '', sort: false }, 
                   { name: 'title', title: 'Titel', sort: true },
                   { name: 'language', title: 'Language', sort: true },
                   { name: 'creator', title: 'Creator', sort: true }
                ]
            });
        } catch(e) {
            error = e;
        }
        
        assertEquals('Thrown ZOOLU.UI.Exception', 'ZOOLU.UI.Exception', error.name);
    },
    
    'test tablelist build': function() {
        try {
            var jsonList = new ZOOLU.UI.Tablelist('#jsonList', '/list', {
                domPagination: false,
                calculatePagination: true,
                header: [
                   { name: 'icon', title: '', sort: false }, 
                   { name: 'title', title: 'Titel', sort: true },
                   { name: 'language', title: 'Language', sort: true },
                   { name: 'creator', title: 'Creator', sort: true }
                ]
            });
            this.server.respond();
        } catch(e) {
            fail('Tablelist instantiation failed');
        }
        jsonList.build();
        
        assertEquals('Table DOM Object', 'object', typeof jsonList.$table);
    },
    
    'test tablelist initialize': function() {
        try {
            var jsonList = new ZOOLU.UI.Tablelist('#jsonList', '/list', {
                domPagination: false,
                calculatePagination: true,
                header: [
                   { name: 'icon', title: '', sort: false }, 
                   { name: 'title', title: 'Titel', sort: true },
                   { name: 'language', title: 'Language', sort: true },
                   { name: 'creator', title: 'Creator', sort: true }
                ]
            });
            this.server.respond();
        } catch(e) {
            fail('Tablelist instantiation failed');
        }
        jsonList.build();
        
        var domList = new ZOOLU.UI.Tablelist('#jsonList', null, {
            domPagination: true,
            calculatePagination: true
        });
        
        assertEquals('Table DOM Object', 'object', typeof domList.$table);
    },
    
    'test tablelist initialize table header': function() {
        try {
            var jsonList = new ZOOLU.UI.Tablelist('#jsonList', '/list', {
                domPagination: false,
                calculatePagination: true,
                header: [
                   { name: 'icon', title: '', sort: false }, 
                   { name: 'title', title: 'Titel', sort: true },
                   { name: 'language', title: 'Language', sort: true },
                   { name: 'creator', title: 'Creator', sort: true }
                ]
            });
            this.server.respond();
        } catch(e) {
            fail('Tablelist instantiation failed');
        }
        jsonList.initTableHeader();
        
        assertEquals('Initialized Table-Head-Row Object', 'object', typeof jsonList.theadRow);
    },
    
    'test tablelist initialize table header exceptions': function() {
        var error;
        try {
            var jsonList = new ZOOLU.UI.Tablelist('#jsonList', '/list', {
                domPagination: false,
                calculatePagination: true,
                header: [
                   { name: 'icon', title: '', sort: false }, 
                   { name: 'title', title: 'Titel', sort: true },
                   { name: 'language', title: 'Language', sort: true },
                   { name: 'creator', title: 'Creator', sort: true }
                ]
            });
        } catch(e) {
            fail('Tablelist instantiation failed');
        }
        try {
            jsonList.initTableHeader();
        } catch(e) {
            error = e;
        }
        
        assertEquals('Thrown ZOOLU.UI.Exception', 'ZOOLU.UI.Exception', error.name);
    },
    
    'test tablelist initialize table body': function() {
        try {
            var jsonList = new ZOOLU.UI.Tablelist('#jsonList', '/list', {
                domPagination: false,
                calculatePagination: true,
                header: [
                   { name: 'icon', title: '', sort: false }, 
                   { name: 'title', title: 'Titel', sort: true },
                   { name: 'language', title: 'Language', sort: true },
                   { name: 'creator', title: 'Creator', sort: true }
                ]
            });
            this.server.respond();
        } catch(e) {
            fail('Tablelist instantiation failed');
        }
        jsonList.initTableBody();
        
        assertEquals('Initialized Table-Body Object', 'object', typeof jsonList.$tbody);
    },
    
    'test tablelist initialize table body exceptions': function() {
        var error;
        try {
            var jsonList = new ZOOLU.UI.Tablelist('#jsonList', '/list', {
                domPagination: false,
                calculatePagination: true,
                header: [
                   { name: 'icon', title: '', sort: false }, 
                   { name: 'title', title: 'Titel', sort: true },
                   { name: 'language', title: 'Language', sort: true },
                   { name: 'creator', title: 'Creator', sort: true }
                ]
            });
        } catch(e) {
            fail('Tablelist instantiation failed');
        }
        try {
            jsonList.initTableBody();
        } catch(e) {
            error = e;
        }
        
        assertEquals('Thrown ZOOLU.UI.Exception', 'ZOOLU.UI.Exception', error.name);
    },
    
    'test tablelist initialize pagination': function() {
        try {
            var jsonList = new ZOOLU.UI.Tablelist('#jsonList', '/list', {
                domPagination: false,
                calculatePagination: true,
                header: [
                   { name: 'icon', title: '', sort: false }, 
                   { name: 'title', title: 'Titel', sort: true },
                   { name: 'language', title: 'Language', sort: true },
                   { name: 'creator', title: 'Creator', sort: true }
                ]
            });
            this.server.respond();
        } catch(e) {
            fail('Tablelist instantiation failed');
        }
        jsonList.initPagination();
        
        assertEquals('Initialized Pagination DOM-Object', 'object', typeof jsonList.pagination.$element);
        assertEquals('Initialized PageEntries DOM-Object', 'object', typeof jsonList.pagination.$pageentries);
        assertEquals('Initialized Back DOM-Object', 'object', typeof jsonList.pagination.$back);
        assertEquals('Initialized Pager DOM-Object', 'object', typeof jsonList.pagination.$pagination);
        assertEquals('Initialized Next DOM-Object', 'object', typeof jsonList.pagination.$next);
    },
    
    'test tablelist initialize pagination exception': function() {
        var error;
        try {
            var jsonList = new ZOOLU.UI.Tablelist('#jsonList', '/list', {
                domPagination: false,
                calculatePagination: true,
                header: [
                   { name: 'icon', title: '', sort: false }, 
                   { name: 'title', title: 'Titel', sort: true },
                   { name: 'language', title: 'Language', sort: true },
                   { name: 'creator', title: 'Creator', sort: true }
                ]
            });
        } catch(e) {
            fail('Tablelist instantiation failed');
        }
        try {
            jsonList.initPagination(); 
        } catch(e) {
            error = e;
        }
        
        assertEquals('Thrown ZOOLU.UI.Exception', 'ZOOLU.UI.Exception', error.name);
    },
    
    'test tablelist reset': function() {
        try {
            var jsonList = new ZOOLU.UI.Tablelist('#jsonList', '/list', {
                domPagination: false,
                calculatePagination: true,
                header: [
                   { name: 'icon', title: '', sort: false }, 
                   { name: 'title', title: 'Titel', sort: true },
                   { name: 'language', title: 'Language', sort: true },
                   { name: 'creator', title: 'Creator', sort: true }
                ]
            });
            this.server.respond();
        } catch(e) {
            fail('Tablelist instantiation failed');
        }
        jsonList.reset();
        
        assertEquals('Tbody DOM object', 'object', typeof jsonList.$tbody);
        assertEquals('Deleted HTML from Tbody', ' ', jsonList.$tbody.html());
    },
    
    'test tablelist load JSON': function() {
        try {
            var jsonList = new ZOOLU.UI.Tablelist('#jsonList', '/list', {
                domPagination: false,
                calculatePagination: true,
                header: [
                   { name: 'icon', title: '', sort: false }, 
                   { name: 'title', title: 'Titel', sort: true },
                   { name: 'language', title: 'Language', sort: true },
                   { name: 'creator', title: 'Creator', sort: true }
                ]
            });
            this.server.respond();
        } catch(e) {
            fail('Tablelist instantiation failed');
        }
        jsonList.loadJson('/list?sort=&sortType=&pageEntries=20&page=1');
        
        assertEquals('returned JSON object', 'object', typeof jsonList.jsonObj);
        assertEquals('returned amount attribute', 6, jsonList.amount);
        assertEquals('returned page attribute', 1, jsonList.page);
    },
    
    'test tablelist get PageEntries options': function() {
        var options;
        try {
            var jsonList = new ZOOLU.UI.Tablelist('#jsonList', '/list', {
                domPagination: false,
                calculatePagination: true,
                header: [
                   { name: 'icon', title: '', sort: false }, 
                   { name: 'title', title: 'Titel', sort: true },
                   { name: 'language', title: 'Language', sort: true },
                   { name: 'creator', title: 'Creator', sort: true }
                ]
            });
            this.server.respond();
        } catch(e) {
            fail('Tablelist instantiation failed');
        }
        jsonList.pageEntries = 20;
        options = jsonList.getPageEntriesOptions();
        
        assertEquals('Returned HTML-String', 'string', typeof options);
    },
    
    'test tablelist get Pagination options': function() {
        var options;
        try {
            var jsonList = new ZOOLU.UI.Tablelist('#jsonList', '/list', {
                domPagination: false,
                calculatePagination: true,
                header: [
                   { name: 'icon', title: '', sort: false }, 
                   { name: 'title', title: 'Titel', sort: true },
                   { name: 'language', title: 'Language', sort: true },
                   { name: 'creator', title: 'Creator', sort: true }
                ]
            });
            this.server.respond();
        } catch(e) {
            fail('Tablelist instantiation failed');
        }
        options = jsonList.getPaginationOptions();
        
        assertEquals('Returned HTML-String', 'string', typeof options);
    },
    
    'test tablelist hide pagination buttons': function() {
        var options;
        try {
            var jsonList = new ZOOLU.UI.Tablelist('#jsonList', '/list', {
                domPagination: false,
                calculatePagination: true,
                hideNextOnLastPage: true,
                hideBackOnFirstPage: true,
                header: [
                   { name: 'icon', title: '', sort: false }, 
                   { name: 'title', title: 'Titel', sort: true },
                   { name: 'language', title: 'Language', sort: true },
                   { name: 'creator', title: 'Creator', sort: true }
                ]
            });
            this.server.respond();
        } catch(e) {
            fail('Tablelist instantiation failed');
        }
        jsonList.pageEntries = 20;
        jsonList.loadJson(jsonList.getURI());
        jsonList.hidePaginationButtons();
    },
    
    'test tablelist add checkboxes': function() {
        var options;
        try {
            var jsonList = new ZOOLU.UI.Tablelist('#jsonList', '/list', {
                domPagination: false,
                calculatePagination: true,
                selectable: true,
                header: [
                   { name: 'icon', title: '', sort: false }, 
                   { name: 'title', title: 'Titel', sort: true },
                   { name: 'language', title: 'Language', sort: true },
                   { name: 'creator', title: 'Creator', sort: true }
                ]
            });
            this.server.respond();
        } catch(e) {
            fail('Tablelist instantiation failed');
        }
        jsonList.addCheckboxes();
        
        assertEquals('Row Checkbox DOM Object', 'object', typeof jsonList.tableRows[0].$checkbox);
        assertEquals('Select All Checkbox DOM Object', 'object', typeof jsonList.theadRow.$checkbox);
    },
    
    'test tablelist add row CSS-Class': function() {
        var cssClass = 'testclass';
        var options;
        try {
            var jsonList = new ZOOLU.UI.Tablelist('#jsonList', '/list', {
                domPagination: false,
                calculatePagination: true,
                rowCSSClass: cssClass,
                header: [
                   { name: 'icon', title: '', sort: false }, 
                   { name: 'title', title: 'Titel', sort: true },
                   { name: 'language', title: 'Language', sort: true },
                   { name: 'creator', title: 'Creator', sort: true }
                ]
            });
            this.server.respond();
        } catch(e) {
            fail('Tablelist instantiation failed');
        }
        jsonList.options.rowClassAddType = false;
        for (var i = -1, length = jsonList.tableRows.length; ++i < length;) {
            jsonList.addRowCSSClass(i);
        };
        assertTrue('Added CSS Class', jsonList.tableRows[0].$element.hasClass(cssClass));
        
        jsonList.options.rowClassAddType = 'odd';
        for (var i = -1, length = jsonList.tableRows.length; ++i < length;) {
            jsonList.tableRows[i].$element.removeClass(cssClass);
            jsonList.addRowCSSClass(i);
        };
        assertTrue('Added CSS Class - odd', jsonList.tableRows[0].$element.hasClass(cssClass));
        assertFalse('Has no CSS Class - odd', jsonList.tableRows[1].$element.hasClass(cssClass));
        
        jsonList.options.rowClassAddType = 'even';
        for (var i = -1, length = jsonList.tableRows.length; ++i < length;) {
            jsonList.tableRows[i].$element.removeClass(cssClass);
            jsonList.addRowCSSClass(i);
        };
        assertTrue('Added CSS Class - odd', jsonList.tableRows[1].$element.hasClass(cssClass));
        assertFalse('Has no CSS Class - odd', jsonList.tableRows[0].$element.hasClass(cssClass));
    },
    
    'test tablelist add row CSS-Class': function() {
        var options;
        try {
            var jsonList = new ZOOLU.UI.Tablelist('#jsonList', '/list', {
                domPagination: false,
                calculatePagination: true,
                header: [
                   { name: 'icon', title: '', sort: false }, 
                   { name: 'title', title: 'Titel', sort: true },
                   { name: 'language', title: 'Language', sort: true },
                   { name: 'creator', title: 'Creator', sort: true }
                ]
            });
            this.server.respond();
        } catch(e) {
            fail('Tablelist instantiation failed');
        }
        jsonList.bindEvents();
        jsonList.theadRow.$checkbox.click();
        jsonList.pagination.$back.click();
        jsonList.pagination.$next.click();
    },
    
    'test tablelist get URI': function() {
        try {
            var jsonList = new ZOOLU.UI.Tablelist('#jsonList', '/list', {
                domPagination: false,
                calculatePagination: true,
                header: [
                   { name: 'icon', title: '', sort: false }, 
                   { name: 'title', title: 'Titel', sort: true },
                   { name: 'language', title: 'Language', sort: true },
                   { name: 'creator', title: 'Creator', sort: true }
                ]
            });
            this.server.respond();
        } catch(e) {
            fail('Tablelist instantiation failed');
        }
        var uri = jsonList.getURI();
        assertEquals('Returned uri string', 'string', typeof uri);
    },
    
    'test tablelist change page entries': function() {
        var cell;
        try {
            var jsonList = new ZOOLU.UI.Tablelist('#jsonList', '/list', {
                domPagination: false,
                calculatePagination: true,
                header: [
                   { name: 'icon', title: '', sort: false }, 
                   { name: 'title', title: 'Titel', sort: true },
                   { name: 'language', title: 'Language', sort: true },
                   { name: 'creator', title: 'Creator', sort: true }
                ]
            });
            this.server.respond();
        } catch(e) {
            fail('Tablelist instantiation failed');
        }
        jsonList.changePageEntries(20);
        jsonList.changePageEntries();
    },
    
    'test tablelist change page': function() {
        var cell;
        try {
            var jsonList = new ZOOLU.UI.Tablelist('#jsonList', '/list', {
                domPagination: false,
                calculatePagination: true,
                header: [
                   { name: 'icon', title: '', sort: false }, 
                   { name: 'title', title: 'Titel', sort: true },
                   { name: 'language', title: 'Language', sort: true },
                   { name: 'creator', title: 'Creator', sort: true }
                ]
            });
            this.server.respond();
        } catch(e) {
            fail('Tablelist instantiation failed');
        }
        jsonList.changePage(2);
        jsonList.changePageEntries();
    },
    
    'test tablelist sort': function() {
        var cell;
        try {
            var jsonList = new ZOOLU.UI.Tablelist('#jsonList', '/list', {
                domPagination: false,
                calculatePagination: true,
                header: [
                   { name: 'icon', title: '', sort: false }, 
                   { name: 'title', title: 'Titel', sort: true },
                   { name: 'language', title: 'Language', sort: true },
                   { name: 'creator', title: 'Creator', sort: true }
                ]
            });
            this.server.respond();
        } catch(e) {
            fail('Tablelist instantiation failed');
        }
        cell = jsonList.theadRow.titleCells[1];
        jsonList.sort(cell);
        jsonList.sort(cell);
        assertTrue('Sorted attribute of the cell', cell.sorted);
    },
    
    'test tablelist select': function() {
        try {
            var jsonList = new ZOOLU.UI.Tablelist('#jsonList', '/list', {
                domPagination: false,
                calculatePagination: true,
                header: [
                   { name: 'icon', title: '', sort: false }, 
                   { name: 'title', title: 'Titel', sort: true },
                   { name: 'language', title: 'Language', sort: true },
                   { name: 'creator', title: 'Creator', sort: true }
                ]
            });
            this.server.respond();
        } catch(e) {
            fail('Tablelist instantiation failed');
        }
        jsonList.select(0);
        assertTrue('Selected Attribute of the row', jsonList.tableRows[0].selected);
    },
    
    'test tablelist unselect': function() {
        try {
            var jsonList = new ZOOLU.UI.Tablelist('#jsonList', '/list', {
                domPagination: false,
                calculatePagination: true,
                header: [
                   { name: 'icon', title: '', sort: false }, 
                   { name: 'title', title: 'Titel', sort: true },
                   { name: 'language', title: 'Language', sort: true },
                   { name: 'creator', title: 'Creator', sort: true }
                ]
            });
            this.server.respond();
        } catch(e) {
            fail('Tablelist instantiation failed');
        }
        jsonList.select(0);
        jsonList.unselect(0);
        assertFalse('Selected Attribute of the row', jsonList.tableRows[0].selected);
    },
    
    'test tablelist toggle': function() {
        try {
            var jsonList = new ZOOLU.UI.Tablelist('#jsonList', '/list', {
                domPagination: false,
                calculatePagination: true,
                header: [
                   { name: 'icon', title: '', sort: false }, 
                   { name: 'title', title: 'Titel', sort: true },
                   { name: 'language', title: 'Language', sort: true },
                   { name: 'creator', title: 'Creator', sort: true }
                ]
            });
            this.server.respond();
        } catch(e) {
            fail('Tablelist instantiation failed');
        }
        jsonList.toggle(0);
        assertTrue('Selected Attribute of the row', jsonList.tableRows[0].selected);
        jsonList.toggle(0);
        assertFalse('Selected Attribute of the row', jsonList.tableRows[0].selected);
    },
    
    'test tablelist select all': function() {
        try {
            var jsonList = new ZOOLU.UI.Tablelist('#jsonList', '/list', {
                domPagination: false,
                calculatePagination: true,
                header: [
                   { name: 'icon', title: '', sort: false }, 
                   { name: 'title', title: 'Titel', sort: true },
                   { name: 'language', title: 'Language', sort: true },
                   { name: 'creator', title: 'Creator', sort: true }
                ]
            });
            this.server.respond();
        } catch(e) {
            fail('Tablelist instantiation failed');
        }
        jsonList.selectAll();
        assertTrue('Selected Attribute of the first row', jsonList.tableRows[0].selected);
        assertTrue('Selected Attribute of the last row', jsonList.tableRows[1].selected);
    },
    
    'test tablelist unselect all': function() {
        try {
            var jsonList = new ZOOLU.UI.Tablelist('#jsonList', '/list', {
                domPagination: false,
                calculatePagination: true,
                header: [
                   { name: 'icon', title: '', sort: false }, 
                   { name: 'title', title: 'Titel', sort: true },
                   { name: 'language', title: 'Language', sort: true },
                   { name: 'creator', title: 'Creator', sort: true }
                ]
            });
            this.server.respond();
        } catch(e) {
            fail('Tablelist instantiation failed');
        }
        jsonList.unselectAll();
        assertFalse('Selected Attribute of the first row', jsonList.tableRows[0].selected);
        assertFalse('Selected Attribute of the last row', jsonList.tableRows[1].selected);
    },
    
    'test tablelist toggle all': function() {
        try {
            var jsonList = new ZOOLU.UI.Tablelist('#jsonList', '/list', {
                domPagination: false,
                calculatePagination: true,
                header: [
                   { name: 'icon', title: '', sort: false }, 
                   { name: 'title', title: 'Titel', sort: true },
                   { name: 'language', title: 'Language', sort: true },
                   { name: 'creator', title: 'Creator', sort: true }
                ]
            });
            this.server.respond();
        } catch(e) {
            fail('Tablelist instantiation failed');
        }
        jsonList.toggleAll();
        assertTrue('Selected Attribute of the first row', jsonList.tableRows[0].selected);
        assertTrue('Selected Attribute of the last row', jsonList.tableRows[1].selected);
        jsonList.toggleAll();
        assertFalse('Selected Attribute of the first row', jsonList.tableRows[0].selected);
        assertFalse('Selected Attribute of the last row', jsonList.tableRows[1].selected);
    },
    
    'test tablelist observe select': function() {
        try {
            var jsonList = new ZOOLU.UI.Tablelist('#jsonList', '/list', {
                domPagination: false,
                calculatePagination: true,
                header: [
                   { name: 'icon', title: '', sort: false }, 
                   { name: 'title', title: 'Titel', sort: true },
                   { name: 'language', title: 'Language', sort: true },
                   { name: 'creator', title: 'Creator', sort: true }
                ]
            });
            this.server.respond();
        } catch(e) {
            fail('Tablelist instantiation failed');
        }
        jsonList.observeSelect();
        for (var i = -1, length = jsonList.tableRows.length; ++i < length;) {
            jsonList.tableRows[i].selected = true;
        }
        jsonList.observeSelect();
        
        assertTrue('All selected attribute', jsonList.allSelected);
    },
    
    'test tablelist get selected rows': function() {
        var selectedRows;
        try {
            var jsonList = new ZOOLU.UI.Tablelist('#jsonList', '/list', {
                domPagination: false,
                calculatePagination: true,
                header: [
                   { name: 'icon', title: '', sort: false }, 
                   { name: 'title', title: 'Titel', sort: true },
                   { name: 'language', title: 'Language', sort: true },
                   { name: 'creator', title: 'Creator', sort: true }
                ]
            });
            this.server.respond();
        } catch(e) {
            fail('Tablelist instantiation failed');
        }
        jsonList.select(0);
        selectedRows = jsonList.getSelectedRows();
        
        assertEquals('Amount of selected rows returned', 1, selectedRows.length);
    }    
});
