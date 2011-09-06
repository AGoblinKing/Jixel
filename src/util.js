/*** Utility ***/
def('Jxl.List', {
    init: function() {
        this.object = null;
        this.next = null;
    }
});

def('Jxl.QuadTree', {
    extend: Jxl.Rect,
    init: function(x, y, width, height, parent) {
        Jxl.Rect.prototype.init.call(this, x, y, width, height);
        this._headA = this._tailA = new Jxl.List();
        this._headB = this._tailB = new Jxl.List();

        if (parent != undefined) {
            var itr;
            var ot;
            if (parent._headA.object != null) {
                itr = parent._headA;
                while (itr != null) {
                    if (this._tailA.object != null) {
                        ot = this._tailA;
                        this._tailA = new Jxl.List();
                        ot.next = this._tailA;
                    }
                    this.tailA.object = itr.object;
                    itr = itr.next;
                }
            }
            if (parent._headB.object != null) {
                itr = parent._headB;
                while (itr != null) {
                    if (this._tailB.object != null) {
                        ot = this._tailB;
                        this._tailB = new Jxl.List();
                        ot.next = this._tailB;
                    }
                    this._tailB.object = itr.object;
                    itr = itr.next;
                }
            }
        }
        else {
            this._min = (this.width + this.height) / (2 * Jxl.Util.quadTreeDivisions);
        }
        this._canSubdivide = (this.width > this._min) || (this.height > Jxl.QuadTree._min);
        this._nw = null;
        this._ne = null;
        this._se = null;
        this._sw = null;
        this._l = this.x;
        this._r = this.x + this.width;
        this._hw = this.width / 2;
        this._mx = this._l + this._hw;
        this._t = this.y;
        this._b = this.y + this.height;
        this._hh = this.height / 2;
        this._my = this._t + this._hh;
    },
    add: function(obj, list) {
        Jxl.QuadTree._oa = list;

        if (obj._group) {
            var m;
            var members = obj.members;
            var l = members.length;

            for (var i = 0; i < l; i++) {
                m = members[i];
                if ((m !== null) && m.exists) {
                    if (m._group) this.add(m, list);
                    else if (m.solid) {
                        Jxl.QuadTree._o = m;
                        Jxl.QuadTree._ol = Jxl.QuadTree._o.x;
                        Jxl.QuadTree._ot = Jxl.QuadTree._o.y;
                        Jxl.QuadTree._or = Jxl.QuadTree._o.x + Jxl.QuadTree._o.width;
                        Jxl.QuadTree._ob = Jxl.QuadTree._o.y + Jxl.QuadTree._o.height;
                        this.addObject();
                    }
                }
            }
        }
        if (obj.solid) {
            Jxl.QuadTree._o = obj;
            Jxl.QuadTree._ol = Jxl.QuadTree._o.x;
            Jxl.QuadTree._ot = Jxl.QuadTree._o.y;
            Jxl.QuadTree._or = Jxl.QuadTree._o.x + Jxl.QuadTree._o.width;
            Jxl.QuadTree._ob = Jxl.QuadTree._o.y + Jxl.QuadTree._o.height;
            this.addObject();
        }
    },
    addObject: function() {
        //If this quad (not its children) lies entirely inside this object, add it here
        if (!this._canSubdivide || ((this._l >= Jxl.QuadTree._ol) && (this._r <= Jxl.QuadTree._or) && (this._t >= Jxl.QuadTree._ot) && (this._b <= Jxl.QuadTree._ob))) {
            this.addToList();
            return;
        }

        //See if the selected object fits completely inside any of the quadrants
        if ((Jxl.QuadTree._ol > this._l) && (Jxl.QuadTree._or < this._mx)) {
            if ((Jxl.QuadTree._ot > this._t) && (Jxl.QuadTree._ob < this._my)) {
                if (this._nw === null) this._nw = new Jxl.QuadTree(this._l, this._t, this._hw, this._hh, this);
                this._nw.addObject();
                return;
            }
            if ((Jxl.QuadTree._ot > this._my) && (Jxl.QuadTree._ob < this._b)) {
                if (this._sw === null) this._sw = new Jxl.QuadTree(this._l, this._my, this._hw, this._hh, this);
                this._sw.addObject();
                return;
            }
        }
        if ((Jxl.QuadTree._ol > this._mx) && (Jxl.QuadTree._or < this._r)) {
            if ((Jxl.QuadTree._ot > this._t) && (Jxl.QuadTree._ob < this._my)) {
                if (this._ne === null) this._ne = new Jxl.QuadTree(this._mx, this._t, this._hw, this._hh, this);
                this._ne.addObject();
                return;
            }
            if ((Jxl.QuadTree._ot > this._my) && (Jxl.QuadTree._ob < this._b)) {
                if (this._se === null) this._se = new Jxl.QuadTree(this._mx, this._my, this._hw, this._hh, this);
                this._se.addObject();
                return;
            }
        }

        //If it wasn't completely contained we have to check out the partial overlaps
        if ((Jxl.QuadTree._or > this._l) && (Jxl.QuadTree._ol < this._mx) && (Jxl.QuadTree._ob > this._t) && (Jxl.QuadTree._ot < this._my)) {
            if (this._nw === null) this._nw = new Jxl.QuadTree(this._l, this._t, this._hw, this._hh, this);
            this._nw.addObject();
        }
        if ((Jxl.QuadTree._or > this._mx) && (Jxl.QuadTree._ol < this._r) && (Jxl.QuadTree._ob > this._t) && (Jxl.QuadTree._ot < this._my)) {
            if (this._ne === null) this._ne = new Jxl.QuadTree(this._mx, this._t, this._hw, this._hh, this);
            this._ne.addObject();
        }
        if ((Jxl.QuadTree._or > this._mx) && (Jxl.QuadTree._ol < this._r) && (Jxl.QuadTree._ob > this._my) && (Jxl.QuadTree._ot < this._b)) {
            if (this._se === null) this._se = new Jxl.QuadTree(this._mx, this._my, this._hw, this._hh, this);
            this._se.addObject();
        }
        if ((Jxl.QuadTree._or > this._l) && (Jxl.QuadTree._ol < this._mx) && (Jxl.QuadTree._ob > this._my) && (Jxl.QuadTree._ot < this._b)) {
            if (this._sw === null) this._sw = new Jxl.QuadTree(this._l, this._my, this._hw, this._hh, this);
            this._sw.addObject();
        }
    },
    addToList: function() {
        var ot;
        if (Jxl.QuadTree._oa == Jxl.QuadTree.A_LIST) {
            if (this._tailA.object !== null) {
                ot = this._tailA;
                this._tailA = new Jxl.List();
                ot.next = this._tailA;
            }
            this._tailA.object = Jxl.QuadTree._o;
        }
        else {
            if (this._tailB.object !== null) {
                ot = this._tailB;
                this._tailB = new Jxl.List();
                ot.next = this._tailB;
            }
            this._tailB.object = Jxl.QuadTree._o;
        }
        if (!this._canSubdivide) return;
        if (this._nw !== null) this._nw.addToList();
        if (this._ne !== null) this._ne.addToList();
        if (this._se !== null) this._se.addToList();
        if (this._sw !== null) this._sw.addToList();
    },
    overlap: function(BothLists, Callback) {
        BothLists = (BothLists === undefined) ? true : BothLists;
        Callback = (Callback === undefined) ? null : Callback;

        Jxl.QuadTree._oc = Callback;
        var c = false;
        var itr;
        if (BothLists) {
            //An A-B list comparison
            Jxl.QuadTree._oa = Jxl.QuadTree.B_LIST;
            if (this._headA.object !== null) {
                itr = this._headA;
                while (itr !== null) {
                    Jxl.QuadTree._o = itr.object;
                    if (Jxl.QuadTree._o.exists && Jxl.QuadTree._o.solid && this.overlapNode()) c = true;
                    itr = itr.next;
                }
            }
            Jxl.QuadTree._oa = Jxl.QuadTree.A_LIST;
            if (this._headB.object !== null) {
                itr = this._headB;
                while (itr !== null) {
                    Jxl.QuadTree._o = itr.object;
                    if (Jxl.QuadTree._o.exists && Jxl.QuadTree._o.solid) {
                        if ((this._nw !== null) && this._nw.overlapNode()) c = true;
                        if ((this._ne !== null) && this._ne.overlapNode()) c = true;
                        if ((this._se !== null) && this._se.overlapNode()) c = true;
                        if ((this._sw !== null) && this._sw.overlapNode()) c = true;
                    }
                    itr = itr.next;
                }
            }
        }
        else {
            //Just checking the A list against itself
            if (this._headA.object !== null) {
                itr = this._headA;
                while (itr != null) {
                    Jxl.QuadTree._o = itr.object;
                    if (Jxl.QuadTree._o.exists && Jxl.QuadTree._o.solid && this.overlapNode(itr.next)) c = true;
                    itr = itr.next;
                }
            }
        }

        //Advance through the tree by calling overlap on each child
        if ((this._nw != null) && this._nw.overlap(BothLists, Jxl.QuadTree._oc)) c = true;
        if ((this._ne != null) && this._ne.overlap(BothLists, Jxl.QuadTree._oc)) c = true;
        if ((this._se != null) && this._se.overlap(BothLists, Jxl.QuadTree._oc)) c = true;
        if ((this._sw != null) && this._sw.overlap(BothLists, Jxl.QuadTree._oc)) c = true;

        return c;
    },
    overlapNode: function(Iterator) {
        Iterator = (Iterator === undefined) ? null : Iterator;

        //member list setup
        var c = false;
        var co;
        var itr = Iterator;
        if (itr == null) {
            if (this._oa == Jxl.QuadTree.A_LIST) itr = this._headA;
            else itr = this._headB;
        }

        //Make sure this is a valid list to walk first!
        if (itr.object != null) {
            //Walk the list and check for overlaps
            while (itr != null) {
                co = itr.object;
                if ((Jxl.QuadTree._o === co) || !co.exists || !Jxl.QuadTree._o.exists || !co.solid || !Jxl.QuadTree._o.solid || (Jxl.QuadTree._o.x + Jxl.QuadTree._o.width < co.x + Jxl.Util.roundingError) || (Jxl.QuadTree._o.x + Jxl.Util.roundingError > co.x + co.width) || (Jxl.QuadTree._o.y + Jxl.QuadTree._o.height < co.y + Jxl.Util.roundingError) || (Jxl.QuadTree._o.y + Jxl.Util.roundingError > co.y + co.height)) {
                    itr = itr.next;
                    continue;
                }
                if (Jxl.QuadTree._oc == null) {
                    Jxl.QuadTree._o.kill();
                    co.kill();
                    c = true;
                }
                else if (Jxl.QuadTree._oc(Jxl.QuadTree._o, co)) c = true;
                itr = itr.next;
            }
        }
        return c;
    }
});
Jxl.QuadTree.A_LIST = 0;
Jxl.QuadTree.B_LIST = 1;
Jxl.QuadTree.divisions = 3;
Jxl.QuadTree.quadTree = null;
Jxl.QuadTree.bounds = null;

def('Jxl.Util', {
    roundingError: 0.0000001,
    quadTreeDivisions: 3,
    singleton: true,
    random: function(Seed) {
        if ((Seed == undefined) || Seed === undefined) return Math.random();
        else {
            //Make sure the seed value is OK
            if (Seed == 0) Seed = Number.MIN_VALUE; // don't think this works
            if (Seed >= 1) {
                if ((Seed % 1) == 0) Seed /= Math.PI;
                Seed %= 1;
            }
            else if (Seed < 0) Seed = (Seed % 1) + 1;

            //Then do an LCG thing and return a predictable random number
            return ((69621 * Math.floor(Seed * 0x7FFFFFFF)) % 0x7FFFFFFF) / 0x7FFFFFFF;
        }
    },
    overlap: function(obj1, obj2, callback) {
        if ((obj1 == null) || !obj1.exists || (obj2 == null) || !obj2.exists) return false;
        quadTree = new Jxl.QuadTree(Jxl.QuadTree.bounds.x, Jxl.QuadTree.bounds.y, Jxl.QuadTree.bounds.width, Jxl.QuadTree.bounds.height);
        quadTree.add(obj1, Jxl.QuadTree.A_LIST);
        if (obj1 === obj2) return quadTree.overlap(false, callback);
        quadTree.add(obj2, Jxl.QuadTree.B_LIST);
        return quadTree.overlap(true, callback);
    },
    makeRGBA: function(Color) {
        var f = Color.toString(16);
        var a = parseInt(f.substr(0, 2), 16) / 255;
        var r = parseInt(f.substr(2, 2), 16);
        var g = parseInt(f.substr(4, 2), 16);
        var b = parseInt(f.substr(6, 2), 16);

        return ("rgba(" + r + "," + g + "," + b + "," + a + ")");
    },
    collide: function(obj1, obj2) {
        if ((obj1 == null) || !obj1.exists || (obj2 == null) || !obj2.exists) return false;

        quadTree = new Jxl.QuadTree(Jxl.QuadTree.bounds.x, Jxl.QuadTree.bounds.y, Jxl.QuadTree.bounds.width, Jxl.QuadTree.bounds.height);
        quadTree.add(obj1, Jxl.QuadTree.A_LIST);
        var match = obj1 === obj2;
        if (!match) quadTree.add(obj2, Jxl.QuadTree.B_LIST);
        var cx = quadTree.overlap(!match, Jxl.Util.solveXCollision);
        var cy = quadTree.overlap(!match, Jxl.Util.solveYCollision);
        return cx || cy;
    },
    rotatePoint: function(x, y, pivotX, pivotY, angle, p) {
        if (p == undefined) p = new JxlPoint();
        var radians = -angle / 180 * Math.PI;
        var dx = x - pivotX;
        var dy = pivotY - y;
        p.x = pivotX + Math.cos(radians) * dx - Math.sin(radians) * dy;
        p.y = pivotY - (Math.sin(radians) * dx + Math.cos(radians) * dy);
        return p;
    },
    solveXCollision: function(obj1, obj2) {
        //Avoid messed up collisions ahead of time
        var o1 = obj1.colVector.x;
        var o2 = obj2.colVector.x;
        if (o1 == o2) return false;

        //Give the objs a heads up that we're about to resolve some collisions
        obj1.preCollide(obj2);
        obj2.preCollide(obj1);

        //Basic resolution variables
        var f1;
        var f2;
        var overlap;
        var hit = false;
        var p1hn2;

        //Directional variables
        var obj1Stopped = o1 == 0;
        var obj1MoveNeg = o1 < 0;
        var obj1MovePos = o1 > 0;
        var obj2Stopped = o2 == 0;
        var obj2MoveNeg = o2 < 0;
        var obj2MovePos = o2 > 0;

        //Offset loop variables
        var i1;
        var i2;
        var obj1Hull = obj1.colHullX;
        var obj2Hull = obj2.colHullX;
        var co1 = obj1.colOffsets;
        var co2 = obj2.colOffsets;
        var l1 = co1.length;
        var l2 = co2.length;
        var ox1;
        var oy1;
        var ox2;
        var oy2;
        var r1;
        var r2;
        var sv1;
        var sv2;

        //Decide based on obj's movement patterns if it was a right-side or left-side collision
        p1hn2 = ((obj1Stopped && obj2MoveNeg) || (obj1MovePos && obj2Stopped) || (obj1MovePos && obj2MoveNeg) || //the obvious cases
        (obj1MoveNeg && obj2MoveNeg && (((o1 > 0) ? o1 : -o1) < ((o2 > 0) ? o2 : -o2))) || //both moving left, obj2 overtakes obj1
        (obj1MovePos && obj2MovePos && (((o1 > 0) ? o1 : -o1) > ((o2 > 0) ? o2 : -o2)))); //both moving right, obj1 overtakes obj2
        //Check to see if these objs allow these collisions
        if (p1hn2 ? (!obj1.collideRight || !obj2.collideLeft) : (!obj1.collideLeft || !obj2.collideRight)) return false;

        //this looks insane, but we're just looping through collision offsets on each obj
        for (i1 = 0; i1 < l1; i1++) {
            ox1 = co1[i1].x;
            oy1 = co1[i1].y;
            obj1Hull.x += ox1;
            obj1Hull.y += oy1;
            for (i2 = 0; i2 < l2; i2++) {
                ox2 = co2[i2].x;
                oy2 = co2[i2].y;
                obj2Hull.x += ox2;
                obj2Hull.y += oy2;

                //See if it's a actually a valid collision
                if ((obj1Hull.x + obj1Hull.width < obj2Hull.x + Jxl.Util.roundingError) || (obj1Hull.x + Jxl.Util.roundingError > obj2Hull.x + obj2Hull.width) || (obj1Hull.y + obj1Hull.height < obj2Hull.y + Jxl.Util.roundingError) || (obj1Hull.y + Jxl.Util.roundingError > obj2Hull.y + obj2Hull.height)) {
                    obj2Hull.x -= ox2;
                    obj2Hull.y -= oy2;
                    continue;
                }

                //Calculate the overlap between the objs
                if (p1hn2) {
                    if (obj1MoveNeg) r1 = obj1Hull.x + obj1.colHullY.width;
                    else r1 = obj1Hull.x + obj1Hull.width;
                    if (obj2MoveNeg) r2 = obj2Hull.x;
                    else r2 = obj2Hull.x + obj2Hull.width - obj2.colHullY.width;
                }
                else {
                    if (obj2MoveNeg) r1 = -obj2Hull.x - obj2.colHullY.width;
                    else r1 = -obj2Hull.x - obj2Hull.width;
                    if (obj1MoveNeg) r2 = -obj1Hull.x;
                    else r2 = -obj1Hull.x - obj1Hull.width + obj1.colHullY.width;
                }
                overlap = r1 - r2;

                //Last chance to skip out on a bogus collision resolution
                if ((overlap == 0) || ((!obj1.fixed && ((overlap > 0) ? overlap : -overlap) > obj1Hull.width * 0.8)) || ((!obj2.fixed && ((overlap > 0) ? overlap : -overlap) > obj2Hull.width * 0.8))) {
                    obj2Hull.x -= ox2;
                    obj2Hull.y -= oy2;
                    continue;
                }

                hit = true;

                //Adjust the objs according to their flags and stuff
                sv1 = obj2.velocity.x;
                sv2 = obj1.velocity.x;
                if (!obj1.fixed && obj2.fixed) {
                    if (obj1._group) obj1.reset(obj1.x - overlap, obj1.y);
                    else obj1.x -= overlap;
                }
                else if (obj1.fixed && !obj2.fixed) {
                    if (obj2._group) obj2.reset(obj2.x + overlap, obj2.y);
                    else obj2.x += overlap;
                }
                else if (!obj1.fixed && !obj2.fixed) {
                    overlap /= 2;
                    if (obj1._group) obj1.reset(obj1.x - overlap, obj1.y);
                    else obj1.x -= overlap;
                    if (obj2._group) obj2.reset(obj2.x + overlap, obj2.y);
                    else obj2.x += overlap;
                    sv1 /= 2;
                    sv2 /= 2;
                }
                if (p1hn2) {
                    obj1.hitRight(obj2, sv1);
                    obj2.hitLeft(obj1, sv2);
                }
                else {
                    obj1.hitLeft(obj2, sv1);
                    obj2.hitRight(obj1, sv2);
                }

                //Adjust collision hulls if necessary
                if (!obj1.fixed && (overlap != 0)) {
                    if (p1hn2) obj1Hull.width -= overlap;
                    else {
                        obj1Hull.x -= overlap;
                        obj1Hull.width += overlap;
                    }
                    obj1.colHullY.x -= overlap;
                }
                if (!obj2.fixed && (overlap != 0)) {
                    if (p1hn2) {
                        obj2Hull.x += overlap;
                        obj2Hull.width -= overlap;
                    }
                    else obj2Hull.width += overlap;
                    obj2.colHullY.x += overlap;
                }
                obj2Hull.x -= ox2;
                obj2Hull.y -= oy2;
            }
            obj1Hull.x -= ox1;
            obj1Hull.y -= oy1;
        }

        return hit;
    },
    solveYCollision: function(obj1, obj2) {
        var o1 = obj1.colVector.y;
        var o2 = obj2.colVector.y;
        if (o1 == o2) return false;

        //Give the objs a heads up that we're about to resolve some collisions
        obj1.preCollide(obj2);
        obj2.preCollide(obj1);

        //Basic resolution variables
        var overlap;
        var hit = false;
        var p1hn2;

        //Directional variables
        var obj1Stopped = o1 == 0;
        var obj1MoveNeg = o1 < 0;
        var obj1MovePos = o1 > 0;
        var obj2Stopped = o2 == 0;
        var obj2MoveNeg = o2 < 0;
        var obj2MovePos = o2 > 0;

        //Offset loop variables
        var i1;
        var i2;
        var obj1Hull = obj1.colHullY;
        var obj2Hull = obj2.colHullY;
        var co1 = obj1.colOffsets;
        var co2 = obj2.colOffsets;
        var l1 = co1.length;
        var l2 = co2.length;
        var ox1;
        var oy1;
        var ox2;
        var oy2;
        var r1;
        var r2;
        var sv1;
        var sv2;

        //Decide based on obj's movement patterns if it was a top or bottom collision
        p1hn2 = ((obj1Stopped && obj2MoveNeg) || (obj1MovePos && obj2Stopped) || (obj1MovePos && obj2MoveNeg) || //the obvious cases
        (obj1MoveNeg && obj2MoveNeg && (((o1 > 0) ? o1 : -o1) < ((o2 > 0) ? o2 : -o2))) || //both moving up, obj2 overtakes obj1
        (obj1MovePos && obj2MovePos && (((o1 > 0) ? o1 : -o1) > ((o2 > 0) ? o2 : -o2)))); //both moving down, obj1 overtakes obj2
        //Check to see if these objs allow these collisions
        if (p1hn2 ? (!obj1.collideBottom || !obj2.collideTop) : (!obj1.collideTop || !obj2.collideBottom)) return false;

        //this looks insane, but we're just looping through collision offsets on each obj
        for (i1 = 0; i1 < l1; i1++) {
            ox1 = co1[i1].x;
            oy1 = co1[i1].y;
            obj1Hull.x += ox1;
            obj1Hull.y += oy1;
            for (i2 = 0; i2 < l2; i2++) {
                ox2 = co2[i2].x;
                oy2 = co2[i2].y;
                obj2Hull.x += ox2;
                obj2Hull.y += oy2;

                //See if it's a actually a valid collision
                if ((obj1Hull.x + obj1Hull.width < obj2Hull.x + Jxl.Util.roundingError) || (obj1Hull.x + Jxl.Util.roundingError > obj2Hull.x + obj2Hull.width) || (obj1Hull.y + obj1Hull.height < obj2Hull.y + Jxl.Util.roundingError) || (obj1Hull.y + Jxl.Util.roundingError > obj2Hull.y + obj2Hull.height)) {
                    obj2Hull.x -= ox2;
                    obj2Hull.y -= oy2;
                    continue;
                }

                //Calculate the overlap between the objs
                if (p1hn2) {
                    if (obj1MoveNeg) r1 = obj1Hull.y + obj1.colHullX.height;
                    else r1 = obj1Hull.y + obj1Hull.height;
                    if (obj2MoveNeg) r2 = obj2Hull.y;
                    else r2 = obj2Hull.y + obj2Hull.height - obj2.colHullX.height;
                }
                else {
                    if (obj2MoveNeg) r1 = -obj2Hull.y - obj2.colHullX.height;
                    else r1 = -obj2Hull.y - obj2Hull.height;
                    if (obj1MoveNeg) r2 = -obj1Hull.y;
                    else r2 = -obj1Hull.y - obj1Hull.height + obj1.colHullX.height;
                }
                overlap = r1 - r2;

                //Last chance to skip out on a bogus collision resolution
                if ((overlap == 0) || ((!obj1.fixed && ((overlap > 0) ? overlap : -overlap) > obj1Hull.height * 0.8)) || ((!obj2.fixed && ((overlap > 0) ? overlap : -overlap) > obj2Hull.height * 0.8))) {
                    obj2Hull.x -= ox2;
                    obj2Hull.y -= oy2;
                    continue;
                }
                hit = true;

                //Adjust the objs according to their flags and stuff
                sv1 = obj2.velocity.y;
                sv2 = obj1.velocity.y;
                if (!obj1.fixed && obj2.fixed) {
                    if (obj1._group) obj1.reset(obj1.x, obj1.y - overlap);
                    else obj1.y -= overlap;
                }
                else if (obj1.fixed && !obj2.fixed) {
                    if (obj2._group) obj2.reset(obj2.x, obj2.y + overlap);
                    else obj2.y += overlap;
                }
                else if (!obj1.fixed && !obj2.fixed) {
                    overlap /= 2;
                    if (obj1._group) obj1.reset(obj1.x, obj1.y - overlap);
                    else obj1.y -= overlap;
                    if (obj2._group) obj2.reset(obj2.x, obj2.y + overlap);
                    else obj2.y += overlap;
                    sv1 /= 2;
                    sv2 /= 2;
                }
                if (p1hn2) {
                    obj1.hitBottom(obj2, sv1);
                    obj2.hitTop(obj1, sv2);
                }
                else {
                    obj1.hitTop(obj2, sv1);
                    obj2.hitBottom(obj1, sv2);
                }

                //Adjust collision hulls if necessary
                if (!obj1.fixed && (overlap != 0)) {
                    if (p1hn2) {
                        obj1Hull.y -= overlap;

                        //This code helps stuff ride horizontally moving platforms.
                        if (obj2.fixed && obj2.moves) {
                            sv1 = obj2.colVector.x;
                            obj1.x += sv1;
                            obj1Hull.x += sv1;
                            obj1.colHullX.x += sv1;
                        }
                    }
                    else {
                        obj1Hull.y -= overlap;
                        obj1Hull.height += overlap;
                    }
                }
                if (!obj2.fixed && (overlap != 0)) {
                    if (p1hn2) {
                        obj2Hull.y += overlap;
                        obj2Hull.height -= overlap;
                    }
                    else {
                        obj2Hull.height += overlap;

                        //This code helps stuff ride horizontally moving platforms.
                        if (obj1.fixed && obj1.moves) {
                            sv2 = obj1.colVector.x;
                            obj2.x += sv2;
                            obj2Hull.x += sv2;
                            obj2.colHullX.x += sv2;
                        }
                    }
                }
                obj2Hull.x -= ox2;
                obj2Hull.y -= oy2;
            }
            obj1Hull.x -= ox1;
            obj1Hull.y -= oy1;
        }

        return hit;
    },
    getAngle: function(x, y) {
        return Math.atan2(y, x) * 180 / Math.PI;
    },
    computeVelocity: function(velocity, acceleration, drag, max) {
        if (acceleration == undefined) acceleration = 0;
        if (drag == undefined) drag = 0;
        if (max == undefined) max = 10000;

        if (acceleration != 0) velocity += acceleration * Jxl.delta;
        else if (drag != 0) {
            var d = drag * Jxl.delta;
            if (velocity - d > 0) velocity -= d;
            else if (velocity + d < 0) velocity += d;
            else velocity = 0;
        }
        if ((velocity != 0) && (max != 10000)) {
            if (velocity > max) velocity = max;
            else if (velocity < -max) velocity = -max;
        }
        return velocity;
    },
    range: function(min, max) {
        return Math.random()*(Math.abs(min)+max)-Math.abs(min);
    },
    setWorldBounds: function(X, Y, Width, Height, Divisions) {
        //Set default values for optional parameters
        X = ((X == undefined)) ? 0 : X;
        Y = ((Y == undefined)) ? 0 : Y;
        Width = ((Width == undefined)) ? 0 : Width;
        Height = ((Height == undefined)) ? 0 : Height;
        Divisions = ((Divisions == undefined)) ? 3 : Divisions;

        if (Jxl.QuadTree.bounds == null) Jxl.QuadTree.bounds = new Jxl.Rect();
        Jxl.QuadTree.bounds.x = X;
        Jxl.QuadTree.bounds.y = Y;
        if (Width > 0) Jxl.QuadTree.bounds.width = Width;
        if (Height > 0) Jxl.QuadTree.bounds.height = Height;
        if (Divisions > 0) Jxl.QuadTree.divisions = Divisions;
    }
});
