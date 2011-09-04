Ext.define('SE.MenuBar', {
    extend: 'Ext.toolbar.Toolbar',
    alias: 'widget.seMenuBar',
    items: [{
        text: 'Change Project',
        handler: function() {
            Ext.create('SE.ProjectDialog');
        }
    }]
});

Ext.define('SE.ProjectDialog', {
    extend: 'Ext.window.Window',
    modal: true,
    autoShow: true,
    title: 'Open a Project',
    bodyPadding: 10,
    resizable: false,
    autoRender: true,
    items: [{
        xtype: 'textfield',
        fieldLabel: 'Path to Project'
    }],
    buttons: [{
        text: 'Open',
        handler: function() {
            this.up('window').destroy();
        }
    }]
});