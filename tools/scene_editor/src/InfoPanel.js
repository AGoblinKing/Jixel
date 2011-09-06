Ext.define('SE.InfoPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.seInfo',
    width: 300,
    resizeable: true,
    dockable: true,
    layout: {
        type: 'vbox',
        align: 'stretch'
    },
    items: [{
        title: 'Project',
        xtype: 'seProject'
    }, {
        xtype: 'seInfoView'
    }]
});

Ext.define('SE.InfoView', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.seInfoView',
    id: 'infoPanel',
    flex: 1,
    title: 'Info'
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
                            text: 'TileMap',
                            handler: function() {
                                record.appendChild(SE.TileMap);
                                view.forceComponentLayout();
                            }
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
            'itemclick': function(view, record, item) {
                if(record.data.click != undefined) record.data.click(view, record, item);
                if(record.raw && record.raw.click != undefined) record.raw.click(view, record, item);
            },
            'itemcontextmenu': {
                fn: function(view, record, item, index, e) {
                    if(record.data.ctx != undefined) record.data.ctx(view, record, item);
                    if(record.raw && record.raw.ctx != undefined) record.raw.ctx(view, record, item);
                    e.preventDefault();
                }
            }
        }
    }],
    flex:1,
    layout: {
        type: 'vbox',
        align: 'stretch'
    }
});
