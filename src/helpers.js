function isFunction(o){
	return typeof o === "function";
}
function isObject(o){
    return typeof o === "object";
}

var isArray = function(a){	return a instanceof Array; };

function toString(obj, stack){
	if(stack && (stack.length > 15 || stack.indexOf(obj) >= 0)){ return '...'; }
	if(obj == null){ return String(obj); }
	if(typeof obj == "string"){ return '"'+obj+'"'; }
	stack = [obj].concat(stack);
	if(isFunction(obj)){ return obj.name || obj.toString(stack); }
	if(isArray(obj)){
		return '[' + obj.map(function(item) {
				return toString(item, stack);
			}).join(', ') + ']';
	}
	if(obj && isObject(obj)){
		var indent = (new Array(stack.length)).join('\t');
		return '{' + Object.keys(obj).map(function(key){
				return '\n\t' + indent + key + ': ' + toString(obj[key], stack);
			}).join(',') + '\n' + indent + '}';
	}
	return String(obj)
}

function bettertypeof(obj){
	return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1];
}

function cloneArray(arr){
	return Array.prototype.slice.call(arr);
}

function merge(base, ext, replace){
	if(ext instanceof Object){
		for(var p in ext){
			if(ext.hasOwnProperty(p)){
				if(base.hasOwnProperty(p)){
					if(base[p] instanceof Object){
						merge(base[p], ext[p], replace);
					} else if(replace){
						base[p] = ext[p];
					}
				} else {
					base[p] = ext[p];
				}
			}
		}
	}
	return base
}

var canSetProto = !!Object.setPrototypeOf || {__proto__:[]} instanceof Array;
Object.setPrototypeOf = Object.setPrototypeOf || (canSetProto
    ? function(o, p){ o.__proto__ = p; }
    : function(o, p){ for(var k in p){ o[k] = p[k]; } ensureProto(o, p); });

Object.getPrototypeOf = Object.getPrototypeOf && canSetProto ? Object.getPrototypeOf : function(o){
    return o.__proto__ || (o.constructor ? o.constructor.prototype : null);
};

function ensureProto(o, p){
	if(!canSetProto){
		Object.defineProperty(o, "__proto__", { enumerable: false, writable: true, value: p });
	}
}

function setProto(constructor, proto, protoConstructor){
	constructor.prototype = Object.create(proto);
	constructor.prototype.constructor = protoConstructor || constructor;
	ensureProto(constructor.prototype, proto);
}

function setConstructor(model, constructor){
	Object.setPrototypeOf(model, constructor.prototype);
	Object.defineProperty(model, "constructor", {enumerable: false, writable: true, value: constructor});
}

var isProxySupported = (typeof Proxy === "function");