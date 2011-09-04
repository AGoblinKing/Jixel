Ext.define('SE.TileMap', {
    extend: 'Ext.data.NodeInterface',
    text: 'New TileMap',
    leaf: true,
    data: {
        'name': {
            type: 'text',
            default: 'New Sprite'
        },
        'graphic': {
            type: 'image',
            default: undefined
        },
        'tileWidth': {
            type: 'int'  
        },
        'tileHeight': {
            type: 'int'
        },
        'x': {
            type: 'float'
        },
        'y': {
            type: 'float'
        },
        'mapData': {
            type: 'csv'
        }
    },
    ctx: function(view, record, item) {
        Ext.create('Ext.menu.Menu', {
            items: [{
                text: 'Delete'  
            }]
        });
    },
    click: function() {
        //basically update the info Panel  
    },
    dblclick: function() {
        //add a tab to the 
    },
    updateInfo: function() {
        this.info.removeAll(true);
        _(this.fields).each(function(item, key) {
            switch(item.type) {
                case 'string': 
                    
            }
        });
    },
    edit: Ext.create('Ext.panel.Panel', {
    
    }),
    info: Ext.create('Ext.form.Panel', {
        buttons: [{
            text: 'Save'  
        }]
    })
});