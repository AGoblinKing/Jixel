Jxl.UI = {};
Jxl.UI.Object = new Class({
    initialize: function(properties) {
	this.members = Object.merge(this.members, properties.members);
	properties.members = undefined;
	this.properties = Object.merge(this.properties, properties);
    },
    properties: {},
    members: {},
    rendered: false,
    render: function(to) {
        this.rendered = true;
	var self = this;
	this.html = new Element('div', this.properties);
	Object.each(this.members, function(value, key) {
	    self.html.grab(value.render().html.set('id', key));
	});
	if(to !== undefined) to.grab(this.html);
	return this;
    },
    destroy: function() {
        this.rendered = false;
	this.html.dispose();
    }
});

Jxl.UI.Dialog = new Class({
    Extends: Jxl.UI.Object,
    render: function(to) {
	this.parent();
	this.html.set('class', 'jxDialog');
	if(this.properties.modal === true) {
	    this.html = new Element('div', {
		'class': 'jxModal'
	    }).grab(this.html);
	}
	if(to !== undefined) to.grab(this.html);
	return this;
    }
});

Jxl.UI.Button = new Class({
    Extends: Jxl.UI.Object,
    properties: {
	class: 'jxlButton'
    }
});

Jxl.UI.fps = new Jxl.UI.Object({
    styles: {
        fontWeight: 'bold',
        position:'fixed',
        top:'0px',
        right:'0px'
    }
});