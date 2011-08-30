Jxl.UI = {};
Jxl.UI.Object = new Class({
    Implements: [Options],
    initialize: function(options) {
        this.setOptions(options);
        Object.merge(this, this.options);
    },
    rendered: false,
    render: function(to) {
        this.rendered = true;
	var self = this;
	this.html = new Element('div', this.attr);
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
	if(this.modal === true) {
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
    attr: {
	class: 'jxButton'
    }
});

Jxl.UI.pause = new Jxl.UI.Dialog({
    attr: {
	id: 'pauseMenu',
	html: 'Jixel is Paused'
    },
    members: {
	'unpause': new Jxl.UI.Button({
	    attr: {
		html: 'Resume!',
		events: {
		    click: function() {
			Jxl.unpause();
		    }
		}
	    }
	})
    },
   modal: true
});

Jxl.UI.fps = new Jxl.UI.Object({
    attr: {
	styles: {
	    fontWeight: 'bold',
	    position:'fixed',
	    top:'0px',
	    right:'0px'
	}
    }
});