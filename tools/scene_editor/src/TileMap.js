Ext.define('SE.Src', {
    mixins: ['Ext.util.Observable'],
    name: 'src',
    listeners: {
        'ctx': function(view, record, item) {
            Ext.create('Ext.menu.Menu', {
                items: [{
                    text: 'Create',
                    menu: [{
                        text: 'Scene',
                        handler: function() {
                            SE.Model.add('src', Ext.create('SE.Scene', {
                                name: 'New Scene'
                            });
                        }
                    }, {
                        text: 'TileMap',
                        handler: function() {
                            record.appendChild(SE.TileMap);
                        }
                    }, {
                        text: 'Sprite'
                    }, {
                        text: 'Group'
                    }]
                }]
            }).show().alignTo(item);
        }
    }
});

Ext.define('SE.Resources', function() {
    mixins: ['Ext.util.Observable'],
    name: 'resources',
    data: [{
        name: 'images'
    }, {
        name: 'sounds'
    }],
    listeners: {
        'ctx': function(view, record, item) {
            Ext.create('Ext.menu.Menu', {
                items: [{
                    text: 'Upload',
                    menu: [{
                        text: 'Image',
                        handler: function() {
                            SE.Model.add('src', Ext.create('SE.Scene', {
                                name: 'New Scene'
                            });
                        }
                    }, {
                        text: 'Sound',
                        handler: function() {
                            record.appendChild(SE.TileMap);
                        }
                    }]
                }]
            }).show().alignTo(item);
        }
    }
});

Ext.define('SE.Index', function() {
    mixins: ['Ext.util.Observable'],
    name: 'index'
});

Ext.define('SE.Model', {
    singleton: true,
    mixins: ['Ext.util.Observable'],
    init: function() {
        
    }, 
    update: function(path, updates) {
    
    },
    add: function(path, item) {
        path.split('.');
    },
    data: [new SE.Src(), new SE.Resources(), new SE.Index()]
});


Ext.define('SE.TileMap', {
    data: [{
        name: 'name',
        xtype: 'textfield',
        value: 'New TileMap'
    },{
        name: 'graphic',
        xtype: 'textfield',
        type: 'image'
    },{
        name: 'tileWidth',
        xtype: 'textfield',
        type: 'int' 
    },{
        name: 'tileHeight',
        xtype: 'textfield',
        type: 'int'
    },{
        name: 'x',
        xtype: 'textfield',
        type: 'float'
    },{
        name: 'y',
        xtype: 'textfield',
        type: 'float'
    },{
        name: 'mapData',
        type: 'csv'
    }],
    ctx: function(view, record, item) {
        this.item = item;
        this.record = record;
        this.view = view;
        Ext.create('Ext.menu.Menu', {
            items: [{
                text: 'Delete', 
                handler: function() {
                    record.destroy();
                }
            }]
        }).show().alignTo(item);
    },
    click: function(view, record, item) {
        this.item = item;
        this.record = record;
        this.view = view;
        this.updateInfo();
        var iP = Ext.getCmp('infoPanel');
        iP.removeAll(true);
        iP.add(this.info);
    },
    dblclick: function() {
        //add a tab to the 
    },
    updateRecord: function() {
        //this.record.setText(this.data.name.value);
    },
    updateInfo: function() {
        var self = this;
        this.info.data = this;
        this.info.removeAll(true);
        _(this.data).each(function(item, key) {
            if(item.xtype) {
                item.fieldLabel = key;
                item.name = key;
                self.info.add(Ext.create('widget.'+item.xtype, item)); 
            }
        });
    },
    edit: Ext.create('Ext.panel.Panel', {
        
    }),
    info: Ext.create('Ext.form.Panel', {
        bodyPadding: 10,
        buttons: [{
            text: 'Save',
            handler: function() {
                var form = this.up('form');
                _(form.getValues()).each(function(item, key) {
                    form.data.data[key].value = item;
                });
                form.data.updateRecord();
            }
        }]
    })
});
