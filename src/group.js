def('Jxl.Group', {
    extend: Jxl.Object,
    init: function(params) {
        Jxl.Object.prototype.init.call(this, params);
        _(this).extend({
            _group: true,
            solid: false,
            members: [],
            _last: new Jxl.Point(),
            _first: true
        });
        this.applyParams(params);
    },
    statics: {
        ASCENDING: -1,
        DESCENDING: 1
    },
    add: function(object, ShareScroll) {
        ShareScroll = (ShareScroll === undefined) ? false : ShareScroll;
        if (this.members.indexOf(object) < 0) this.members[this.members.length] = object;
        if (ShareScroll) object.scrollFactor = this.scrollFactor;
        return object;
    },
    replace: function(OldObject, NewObject) {
        var index = this.members.indexOf(OldObject);
        if ((index < 0) || (index >= this.members.length)) return null;
        this.members[index] = NewObject;
        return NewObject;
    },
    remove: function(object, Splice) {
        Splice = (Splice === undefined) ? false : Splice;
        var index = this.members.indexOf(object);
        if ((index < 0) || (index >= this.members.length)) return null;
        if (Splice) this.members.splice(index, 1);
        else this.members[index] = null;
        return object;
    },
    sort: function(Index, Order) {
        Index = (Index === undefined) ? "y" : Index;
        Order = (Order === undefined) ? Jxl.Group.ASCENDING : Order;
        this._sortIndex = Index;
        this._sortOrder = Order;
        this.members.sort(this.sortHandler);
    },
    getFirstAvail: function() {
        var i = 0;
        var o;
        var ml = this.members.length;
        while (i < ml) {
            o = this.members[i++];
            if ((o != undefined) && !o.exists) return o;
        }
        return null;
    },
    getFirstNull: function() {
        var i = 0;
        var ml = this.members.length;
        while (i < ml) {
            if (this.members[i] == undefined) return i;
            else i++;
        }
        return -1;
    },
    resetFirstAvail: function(X, Y) {
        X = (X === undefined) ? 0 : X;
        Y = (Y === undefined) ? 0 : Y;
        var o = this.getFirstAvail();
        if (o == null) return false;
        o.reset(X, Y);
        return true;
    },
    getFirstExtant: function() {
        var i = 0;
        var o;
        var ml = this.members.length;
        while (i < ml) {
            o = this.members[i++];
            if ((o != null) && o.exists) return o;
        }
        return null;
    },
    getFirstAlive: function() {
        var i = 0;
        var o;
        var ml = this.members.length;
        while (i < ml) {
            o = this.members[i++];
            if ((o != null) && o.exists && !o.dead) return o;
        }
        return null;
    },
    getFirstDead: function() {
        var i = 0;
        var o;
        var ml = this.members.length;
        while (i < ml) {
            o = this.members[i++];
            if ((o != null) && o.dead) return o;
        }
        return null;
    },
    countLiving: function() {
        var count = -1;
        var i = 0;
        var o;
        var ml = this.members.length;
        while (i < ml) {
            o = this.members[i++];
            if (o != null) {
                if (count < 0) count = 0;
                if (o.exists && !o.dead) count++;
            }
        }
        return count;
    },
    countDead: function() {
        var count = -1;
        var i = 0;
        var o;
        var ml = this.members.length;
        while (i < ml) {
            o = this.members[i++];
            if (o != null) {
                if (count < 0) count = 0;
                if (o.dead) count++;
            }
        }
        return count;
    },
    countOnScreen: function() {
        var count = -1;
        var i = 0;
        var o;
        var ml = this.members.length;
        while (i < ml) {
            o = this.members[i++];
            if (o != null) {
                if (count < 0) count = 0;
                if (o.onScreen()) count++;
            }
        }
        return count;
    },
    getRandom: function() {
        var c = 0;
        var o = null;
        var l = this.members.length;
        var i = Math.floor(Jxl.Util.random() * l);
        while ((o === null || o === undefined) && (c < this.members.length)) {
            o = this.members[(++i) % l];
            c++;
        }
        return o;
    },
    saveOldPosition: function() {
        if (this._first) {
            this._first = false;
            this._last.x = 0;
            this._last.y = 0;
            return;
        }
        this._last.x = this.x;
        this._last.y = this.y;
    },
    updateMembers: function(delta) {
        var mx;
        var my;
        var moved = false;
        if ((this.x != this._last.x) || (this.y != this._last.y)) {
            moved = true;
            mx = this.x - this._last.x;
            my = this.y - this._last.y;
        }
        var i = 0;
        var o;
        var ml = this.members.length;
        while (i < ml) {
            o = this.members[i++];
            if ((o != null) && o.exists) {
                if (moved) {
                    if (o._group) o.reset(o.x + mx, o.y + my);
                    else {
                        o.x += mx;
                        o.y += my;
                    }
                }
                if (o.active) o.update(delta);
                if (moved && o.solid) {
                    o.colHullX.width += ((mx > 0) ? mx : -mx);
                    if (mx < 0) o.colHullX.x += mx;
                    o.colHullY.x = this.x;
                    o.colHullY.height += ((my > 0) ? my : -my);
                    if (my < 0) o.colHullY.y += my;
                    o.colVector.x += mx;
                    o.colVector.y += my;
                }
            }
        }
    },
    update: function() {
        this.saveOldPosition();
        this.updateMotion();
        this.updateMembers();
        this.updateFlickering();
    },
    renderMembers: function() {
        var i = 0;
        var o;
        var ml = this.members.length;
        while (i < ml) {
            o = this.members[i++];
            if ((o != null) && o.exists && o.visible) o.render();
        }
    },
    render: function() {
        this.renderMembers();
    },
    killMembers: function() {
        var i = 0;
        var o;
        var ml = this.members.length;
        while (i < ml) {
            o = this.members[i++];
            if (o != null) o.kill();
        }
    },
    kill: function() {
        this.killMembers();
        Jxl.Object.prototype.kill.call(this);
    },
    destroyMembers: function() {
        var i = 0;
        var o;
        var ml = this.members.length;
        while (i < ml) {
            o = members[i++];
            if (o != null) o.destroy();
        }
        this.members.length = 0;
    },
    destroy: function() {
        this.destroyMembers();
        this.parent();
    },
    reset: function(X, Y) {
        this.saveOldPosition();
        this.parent(X, Y);
        var mx;
        var my;
        var moved = false;
        if ((this.x != this._last.x) || (this.y != this._last.y)) {
            moved = true;
            mx = this.x - this._last.x;
            my = this.y - this._last.y;
        }
        var i = 0;
        var o;
        var ml = this.members.length;
        while (i < ml) {
            o = members[i++];
            if ((o != null) && o.exists) {
                if (moved) {
                    if (o._group) o.reset(o.x + mx, o.y + my);
                    else {
                        o.x += mx;
                        o.y += my;
                        if (this.solid) {
                            o.colHullX.width += ((mx > 0) ? mx : -mx);
                            if (mx < 0) o.colHullX.x += mx;
                            o.colHullY.x = this.x;
                            o.colHullY.height += ((my > 0) ? my : -my);
                            if (my < 0) o.colHullY.y += my;
                            o.colVector.x += mx;
                            o.colVector.y += my;
                        }
                    }
                }
            }
        }
    },
    sortHandler: function(Obj1, Obj2) {
        if (Obj1[this._sortIndex] < Obj2[this._sortIndex]) return this._sortOrder;
        else if (Obj1[this._sortIndex] > Obj2[this._sortIndex]) return -this._sortOrder;
        return 0;
    }
});