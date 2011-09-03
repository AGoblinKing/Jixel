var requiredScripts = {};
var reqPath = 'src/';
var req = function(path, callback) {
    if(!(path in requiredScripts)) {
        requiredScripts[path] = true;
        var scr = document.createElement('script');
        scr.src = reqPath + path;
        src.addEventHandler('load', function(e) {
            callback();
        }, true);
    } else {
        if(callback) callback();
    }
};
_.mixin({
   has: function(object, key, func) {
       if(object[key] !== undefined)  {
           func.call(object, object[key]);
           return true;
       }
   },
   clamp: function(num, max, min) {
       return Math.min(Math.Max(num, max), min);
   }
});
function generatePath(ns) { 
    var target = window;
    if(ns.length != 0) {
        _(ns).each(function(item) {
            if(target[item] === undefined)
                target[item] = {};
            target = target[item];
        });
    }
    return target;
}
var def = function(name, proto) {
    var DefClass = function() {
        this.init.apply(this, arguments);
    };
    DefClass.prototype.init = function(){};
    _(proto).has('extend', function(val) {
        DefClass.prototype = new val();
        DefClass.prototype.constructor = DefClass;
    });
    _(proto).has('mixins', function(mixins) { 
        _(mixins).each(function(val) {
            _(DefClass.prototype).extend(val.prototype)
        });
    });
    _(proto).has('statics', function(statics){
        _(DefClass).extend(statics);
    });
    _(DefClass.prototype).extend(proto);
    var ns = name.split('.');
    name = ns.pop();
    var ref = generatePath(ns);
    if(proto.singleton) {
        ref[name] = new DefClass();
    } else {
        ref[name] = DefClass;
    }
    _(proto).has('alias', function(alias) {
        var aliasNS = alias.split('.');
        var alias = aliasNS.pop();
        
        generatePath(aliasNS)[alias] = ref[name];
    });
    return ref;
};