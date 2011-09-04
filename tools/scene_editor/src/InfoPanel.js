Ext.define('SE.InfoPanel', {
    extend: 'Ext.tab.Panel',
    alias: 'widget.seInfo',
    width: 300,
    resizeable: true,
    dockable: true,
    items: [{
        title: 'Project',
        xtype: 'seProject'
    }]
});

Ext.define('SE.Project', {
    extend: 'Ext.data.TreeStore',
    singleton: true,
    root: {
        expanded: true,
        text: 'Project Name',
        children: [{
            text: 'src',
            ctx: function(view, record, item) {
                Ext.create('Ext.menu.Menu', {
                    items: [{
                        text: 'Create',
                        menu: [{
                            text: 'Scene',
                            handler: function() {
                                record.appendChild({
                                    text: 'New Scene',
                                    leaf: true
                                });
                            }
                        }, {
                            text: 'TileMap'
                        }, {
                            text: 'Sprite'
                        }, {
                            text: 'Group'
                        }]
                    }]
                }).show().alignTo(item);
            }
        },{
            text: 'resources',
            children: [{
                text: 'images'  
            }, {
                text: 'sounds'
            }]
        }, {
            text: 'index',
            leaf: true,
            click: function() {
                console.log(this);
            }
        }]
    }
});

Ext.define('SE.ProjectPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.seProject',
    items: [{
        xtype: 'treepanel',
        store: SE.Project,
        flex:1,
        listeners: {
            'itemclick': function(view, record) {
                if(record.raw.click != undefined) record.raw.click(view, record, item);
            },
            'itemcontextmenu': {
                fn: function(view, record, item, index, e) {
                    if(record.raw.ctx != undefined) record.raw.ctx(view, record, item);
                    e.preventDefault();
                }
            }
        }
    }],
    height: "100%",
    layout: {
        type: 'vbox',
        align: 'stretch'
    }
});