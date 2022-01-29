/**
* Allows to launch tweening 
*
* @class Tween
* @constructor
*/

var Tween = {
	MAX_EASINGS: 256, //to avoid problems

	LINEAR: 0,

	EASE_IN_QUAD: 1,
	EASE_OUT_QUAD: 2,
	EASE_IN_OUT_QUAD: 3,
	QUAD: 3,

	EASE_IN_CUBIC: 4,
	EASE_OUT_CUBIC: 5,
	EASE_IN_OUT_CUBIC: 6,
	CUBIC: 6,

	EASE_IN_QUART: 7,
	EASE_OUT_QUART: 8,
	EASE_IN_OUT_QUART: 9,
	QUART: 9,

	EASE_IN_SINE: 10,
	EASE_OUT_SINE: 11,
	EASE_IN_OUT_SINE: 12,
	SINE: 12,

	EASE_IN_EXPO: 13,
	EASE_OUT_EXPO: 14,
	EASE_IN_OUT_EXPO: 15,
	EXPO: 15,

	EASE_IN_BACK: 16,
	EASE_OUT_BACK: 17,
	EASE_IN_OUT_BACK: 18,
	BACK: 18,

	EASE_IN_ELASTIC: 19,
	EASE_OUT_ELASTIC: 20,
	EASE_IN_OUT_ELASTIC: 21,
	ELASTIC: 21,

	EASE_IN_BOUNCE: 22,
	EASE_OUT_BOUNCE: 23,
	EASE_IN_OUT_BOUNCE: 24,
	BOUNCE: 24,

	current_easings: [],
	_alife: [], //temporal array
	_temp: [], //another temporal

	catch_exceptions: false,

	reset: function()
	{
		this.current_easings = [];
		this._alife = [];
	},

	easeProperty: function( object, property, target, time, easing_function, on_complete, on_progress )
	{
		if( !object )
			throw("ease object cannot be null");
		if( target === undefined )
			throw("target value must be defined");
		if(object[property] === undefined)
			throw("property not found in object, must be initialized to a value");

		//cancel previous in case we already have one for this property
		if(this.current_easings.length)
		{
			for(var i = 0; i < this.current_easings.length; ++i)
			{
				var easing = this.current_easings[i];
				if( easing.object !== object || easing.property != property )
					continue;
				this.current_easings.splice(i,1); //remove old one
				break;		
			}
		}

		if( easing_function == null )
			easing_function = this.EASE_IN_OUT_QUAD;

		//clone to avoid problems
		var origin = null;
		
		if(property)
			origin = this.cloneObject( object[ property ] );
		else
			origin = this.cloneObject( object );
		target = this.cloneObject( target );

		//precompute target value size
		var size = 0;
		if(target.constructor === Number)
			size = -1;
		else if(target && target.length !== undefined)
			size = target.length;

		var type = null;
		var type_info = object.constructor["@" + property];
		if( type_info )
			type = type_info.type;

		var data = { 
			object: object, 
			property: property, 
			origin: origin, 
			target: target, 
			current: 0, 
			time: time, 
			easing: easing_function, 
			on_complete: on_complete, 
			on_progress: on_progress, 
			size: size, 
			type: type,
			running: true,
			paused: false,
			cancel: function() { this.canceled = true; }
		};

		for(var i = 0; i < this.current_easings.length; ++i)
		{
			if( this.current_easings[i].object == object && this.current_easings[i].property == property )
			{
				this.current_easings[i] = data; //replace old easing
				break;
			}
		}

		if(this.current_easings.length >= this.MAX_EASINGS)
		{
			var easing = this.current_easings.shift();
			//TODO: this could be improved applyting the target value right now
		}

		this.current_easings.push( data );
		return data;
	},

	easeObject: function( object, target, time, easing_function, on_complete, on_progress )
	{
		if( !object || !target )
			throw("ease object cannot be null");

		if( easing_function == null )
			easing_function = this.EASE_IN_OUT_QUAD;

		//clone to avoid problems
		var origin = this.cloneObject( object );
		target = this.cloneObject( target );

		//precompute size
		var size = 0;
		if(target.length !== undefined)
			size = target.length;

		var data = { 
			object: object,
			origin: origin,
			target: target,
			current: 0,
			time: time,
			easing: easing_function,
			on_complete: on_complete,
			on_progress: on_progress,
			size: size,
			paused: false,
			cancel: function() { this.canceled = true; }
		};

		for(var i = 0; i < this.current_easings.length; ++i)
		{
			if( this.current_easings[i].object == object )
			{
				this.current_easings[i] = data; //replace old easing
				break;
			}
		}

		if(this.current_easings.length >= this.MAX_EASINGS)
		{
			this.current_easings.shift();
		}

		this.current_easings.push( data );
		return data;
	},

	cancelEaseObject: function( object, property )
	{
		if( !this.current_easings.length )
			return;
		
		var easings = this.current_easings;
		for(var i = 0, l = easings.length; i < l; ++i)
		{
			var item = easings[i];
			if( item.object != object)
				continue;
			if( property && item.property != property)
				continue;
			item.canceled = true;
		}
	},

	//updates all the active tweens
	update: function( dt )
	{
		if( !this.current_easings.length )
			return;

		var easings = this.current_easings;
		this.current_easings = this._temp; //empty it to control incomming tweens during this update
		this.current_easings.length = 0;
		var alive = this._alife;
		alive.length = easings.length;
		var pos = 0;

		//for every pending easing method
		for(var i = 0, l = easings.length; i < l; ++i)
		{
			var item = easings[i];
			item.current += dt;
			var t = 1;

			if(item.canceled) //it wont be added to the alive list so it will be removed
				continue;

			else if(item.current < item.time)
			{
				if(!item.paused)
					t = item.current / item.time;
				alive[ pos ] = item;
				pos += 1;
				if(item.paused)
					continue;
			}

			var f = this.getEaseFactor( t, item.easing );

			var result = null;

			if(item.size)
			{
				if(item.size == -1) //number
					item.object[ item.property ] = item.target * f + item.origin * ( 1.0 - f );
				else //array
				{
					var property = item.object[ item.property ];

					if(item.type && item.type == "quat")
						quat.slerp( property, item.origin, item.target, f );
					else
					{
						//regular linear interpolation
						for(var j = 0; j < item.size; ++j)
							property[j] = item.target[j] * f + item.origin[j] * ( 1.0 - f );
					}
				}
				if(item.object.mustUpdate !== undefined)
					item.object.mustUpdate = true;
			}

			if(item.on_progress)
				item.on_progress( item );

			if(t >= 1)
			{
				if(item.on_complete)
					item.on_complete( item );
				item.running = false;
			}
		}

		alive.length = pos; //trim

		//add incomming tweens
		for(var i = 0; i < this.current_easings.length; ++i)
			alive.push( this.current_easings[i] );

		this.current_easings = alive;
		this._alife = easings;
	},

	getEaseFactor: function(t,type)
	{
		if(t>1) 
			t = 1;
		else if(t < 0)
			t = 0;
		var s = 1.70158;
		if(type == null)
			type = this.LINEAR;

		switch(type)
		{
			case this.LINEAR: return t;
			case this.EASE_IN_QUAD: return (t*t);
			case this.EASE_OUT_QUAD: return 1 - (1 - t) * (1 - t);
			case this.EASE_IN_OUT_QUAD: { 
				t *= 2;
				if( t < 1 ) return 0.5 * t * t;
				t -= 1;
				return -0.5 * ((t)*(t-2) - 1);
			};

			case this.EASE_IN_CUBIC: return t*t*t;
			case this.EASE_OUT_CUBIC: {
				t -= 1;
				return t*t*t + 1;
			};
			case this.EASE_IN_OUT_CUBIC: {
				t *= 2;
				if( t < 1 )
					return 0.5 * t*t*t;
				t -= 2;
				return 0.5*(t*t*t + 2);
			};

			case this.EASE_IN_QUART: return t*t*t*t;
			case this.EASE_OUT_QUART: {
				t -= 1;
				return -(t*t*t*t - 1);
			}
			case this.EASE_IN_OUT_QUART: {
				t *= 2;
				if( t < 1 ) return 0.5*t*t*t*t;
				else {
					t -= 2;
					return -0.5 * (t*t*t*t - 2);
				}
			}

			case this.EASE_IN_SINE:	return 1-Math.cos( t * Math.PI / 2 );
			case this.EASE_OUT_SINE:	return Math.sin( t * Math.PI / 2 );
			case this.EASE_IN_OUT_SINE: return -0.5 * ( Math.cos( Math.PI * t ) - 1 );

			case this.EASE_IN_EXPO: return t == 0 ? 0 : Math.pow( 2, 10 * (t - 1) );
			case this.EASE_OUT_EXPO: return t == 1 ? 1 : 1 - Math.pow( 2, -10 * t );
			case this.EASE_IN_OUT_EXPO: {
				if( t == 0 ) return 0;
				if( t == 1 ) return 1;
				t *= 2;
				if( t < 1 ) return 0.5 * Math.pow( 2, 10 * (t - 1) );
				return 0.5 * ( -Math.pow( 2, -10 * (t - 1)) + 2);
			}

			case this.EASE_IN_BACK: return t * t * ((s+1)*t - s);
			case this.EASE_OUT_BACK: return (t*t*((s+1)*t + s) + 1);
			case this.EASE_IN_OUT_BACK: {
				t *= 2;
				if( t < 1 ) {
					s *= 1.525;
					return 0.5*(t*t*((s+1)*t - s));
				}
				else {
					t -= 2;
					s *= 1.525;
					return 0.5*(t*t*((s+1)*t+ s) + 2);
				}
			};

			case this.EASE_IN_ELASTIC: return easeInElastic(t);
			case this.EASE_OUT_ELASTIC: return easeOutElastic(t);
			case this.EASE_IN_OUT_ELASTIC: return easeInOutElastic(t);

			case this.EASE_IN_BOUNCE: return 1.0 - easeOutBounce(1.0 - t);
			case this.EASE_OUT_BOUNCE: return easeOutBounce(t);
			case this.EASE_IN_OUT_BOUNCE: return x < 0.5 ? (1 - easeOutBounce(1 - 2 * x)) / 2 : (1 + easeOutBounce(2 * x - 1)) / 2;

		}
		return t;
	},

	/**
	* Clones an object (no matter where the object came from)
	* - It skip attributes starting with "_" or "jQuery" or functions
	* - it tryes to see which is the best copy to perform
	* - to the rest it applies JSON.parse( JSON.stringify ( obj ) )
	* - use it carefully
	* @method cloneObject
	* @param {Object} object the object to clone
	* @param {Object} target=null optional, the destination object
	* @param {bool} recursive=false optional, if you want to encode objects recursively
	* @param {bool} only_existing=false optional, only assign to methods existing in the target object
	* @param {bool} encode_objets=false optional, if a special object is found, encode it as ["@ENC",node,object]
	* @return {Object} returns the cloned object (target if it is specified)
	*/
	cloneObject: function( object, target, recursive, only_existing, encode_objects )
	{
		if(object === undefined)
			return undefined;
		if(object === null)
			return null;

		//base type
		switch( object.constructor )
		{
			case String:
			case Number:
			case Boolean:
				return object;
		}

		//typed array
		if( object.constructor.BYTES_PER_ELEMENT )
		{
			if(!target)
				return new object.constructor( object );
			if(target.set)
				target.set(object);
			else if(target.construtor === Array)
			{
				for(var i = 0; i < object.length; ++i)
					target[i] = object[i];
			}
			else
				throw("cloneObject: target has no set method");
			return target;
		}

		var o = target;
		if(o === undefined || o === null)
		{
			if(object.constructor === Array)
				o = [];
			else
				o = {};
		}

		//copy every property of this object
		for(var i in object)
		{
			if(i[0] == "@" || i[0] == "_" || i.substr(0,6) == "jQuery") //skip vars with _ (they are private) or '@' (they are definitions)
				continue;

			if(only_existing && !target.hasOwnProperty(i) && !target.__proto__.hasOwnProperty(i) ) //target[i] === undefined)
				continue;

			//if(o.constructor === Array) //not necessary
			//	i = parseInt(i);

			var v = object[i];
			if(v == null)
				o[i] = null;			
			else if ( isFunction(v) ) //&& Object.getOwnPropertyDescriptor(object, i) && Object.getOwnPropertyDescriptor(object, i).get )
				continue;//o[i] = v;
			else if (v.constructor === File ) 
				o[i] = null;
			else if (v.constructor === Number || v.constructor === String || v.constructor === Boolean ) //elemental types
				o[i] = v;
			else if( v.buffer && v.byteLength && v.buffer.constructor === ArrayBuffer ) //typed arrays are ugly when serialized
			{
				if(o[i] && v && only_existing) 
				{
					if(o[i].length == v.length) //typed arrays force to fit in the same container
						o[i].set( v );
				}
				else
					o[i] = new v.constructor(v); //clone typed array
			}
			else if ( v.constructor === Array ) //clone regular array (container and content!)
			{
				//not safe to use concat or slice(0) because it doesnt clone content, only container
				if( o[i] && o[i].set && o[i].length >= v.length ) //reuse old container
				{
					o[i].set(v);
					continue;
				}
				o[i] = this.cloneObject( v ); 
			}
			else //Objects: 
			{
				if( v.constructor.is_resource )
				{
					console.error("Resources cannot be saved as a property of a component nor script, they must be saved individually as files in the file system. If assigning them to a component/script use private variables (name start with underscore) to avoid being serialized.");
					continue;
				}

				if( v.constructor !== Object && !target && !v.toJSON )
				{
					console.warn("Cannot clone internal classes:", v," When serializing an object I found a var with a class that doesnt support serialization. If this var shouldnt be serialized start the name with underscore.'");
					continue;
				}

				if( v.toJSON )
					o[i] = v.toJSON();
				else if( recursive )
					o[i] = this.cloneObject( v, null, true );
				else {
					if(v.constructor !== Object)
						console.warn("Cannot clone internal classes:", v," When serializing an object I found a var with a class that doesnt support serialization. If this var shouldnt be serialized start the name with underscore.'" );

					if(this.catch_exceptions)
					{
						try
						{
							//prevent circular recursions //slow but safe
							o[i] = JSON.parse( JSON.stringify(v) );
						}
						catch (err)
						{
							console.error(err);
						}
					}
					else //slow but safe
					{
						o[i] = JSON.parse( JSON.stringify(v) );
					}
				}
			}
		}
		return o;
	}	
};

function easeOutBounce(x) {
	var n1 = 7.5625;
	var d1 = 2.75;

	if (x < 1 / d1) {
		return n1 * x * x;
	} else if (x < 2 / d1) {
		return n1 * (x -= 1.5 / d1) * x + 0.75;
	} else if (x < 2.5 / d1) {
		return n1 * (x -= 2.25 / d1) * x + 0.9375;
	} else {
		return n1 * (x -= 2.625 / d1) * x + 0.984375;
	}
}

function easeInElastic( x ) {
	var c4 = (2 * Math.PI) / 3;
	return x === 0
	  ? 0
	  : x === 1
	  ? 1
	  : -Math.pow(2, 10 * x - 10) * Math.sin((x * 10 - 10.75) * c4);
}

function easeOutElastic( x ) {
	var c4 = (2 * Math.PI) / 3;
	return x === 0
	  ? 0
	  : x === 1
	  ? 1
	  : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
}

function easeInOutElastic(x) {
	var c5 = (2 * Math.PI) / 4.5;
	return x === 0
	  ? 0
	  : x === 1
	  ? 1
	  : x < 0.5
	  ? -(Math.pow(2, 20 * x - 10) * Math.sin((20 * x - 11.125) * c5)) / 2
	  : (Math.pow(2, -20 * x + 10) * Math.sin((20 * x - 11.125) * c5)) / 2 + 1;
}