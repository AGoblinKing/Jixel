Ext.define('SE.Home', {
    extend: 'Ext.container.Viewport', 
    layout: 'border',
    items: [{
        region: 'north',
        xtype: 'seMenuBar'
    }, {
        region: 'east',
        xtype: 'seInfo'
    }, {
        region: 'center',
        xtype: 'seGame'
    }]
});