//There are two versions, one based on Canvas2D and once based on WebGL

//GLOBALS
//Images manager
var imgs = {};
var num_loading_images = 0;
function getImage( url, on_load, on_error )
{
	if( imgs[ url ] )
		return imgs[ url ];
	var img = new Image();
	img.src = url;
	img.is_loading = true;
	imgs[url] = img;
	num_loading_images++;

	img.onload = inner;
	img.onerror = on_error;

	function inner()
	{
		num_loading_images--;
		this.is_loading = false;
		if(	on_load )
			on_load( img );
	}

	return img;
}

//craetes a visual representation of a card
function CardMaker( on_ready )
{
	var that = this;
	this._card_canvas = document.createElement("canvas");
	this._temp_canvas = document.createElement("canvas");
	getImage( "data/card_male.png" );
	getImage( "data/card_male_back.png" );
	getImage( "data/card_female.png" );
	getImage( "data/card_female_back.png" );
	getImage( "data/card_goal.png" );
	getImage( "data/card_goal_back.png" );
	getImage( "data/card_event.png" );
	getImage( "data/card_event_back.png" );
	getImage( "data/card_child_back.png" );
	getImage( "data/FONDO.png" );
	getImage( "data/PELOS detras.png" );
	getImage( "data/CABEZA.png" );
	getImage( "data/CARA.png" );
	getImage( "data/PELOS.png" );
	getImage( "data/ATREZZO.png" );
	getImage( "data/iconosObjetivos.png" );
	getImage( "data/iconosTraits.png" );
	getImage( "data/iconosEventos.png" );
	
}

CardMaker.prototype.buildCard = function( card, force )
{
	var canvas = this._card_canvas;
	var temp = this._temp_canvas;
	temp.width = canvas.width = 256; //template.width;
	temp.height = canvas.height = 128; //template.height;

	//still loading
	if(num_loading_images)
		return;

	if( card._image && !force && !card._must_update )
		return card._image;

	console.log(" + Card BUILT: " + card.toString() );

	var layers = [
		getImage( "data/FONDO.png" ),
		getImage( "data/PELOS detras.png" ),
		getImage( "data/CABEZA.png" ),
		getImage( "data/CARA.png" ),
		getImage( "data/PELOS.png" ),
		getImage( "data/ATREZZO.png" )
	];

	var ctx = canvas.getContext("2d");
	ctx.imageSmoothingEnabled = false;
	ctx.clearRect(0,0,canvas.width,canvas.height);
	ctx.textAlign = "left";

	var ctx_temp = canvas.getContext("2d");
	ctx_temp.imageSmoothingEnabled = false;
	ctx_temp.clearRect(0,0,canvas.width,canvas.height);

	//background
	var background = null;
	switch( card.type )
	{
		case Card.TYPE_PERSON: background = getImage( card.gender == "F" ? "data/card_female.png" : "data/card_male.png" ); break;
		case Card.TYPE_EVENT: background = getImage( "data/card_event.png" ); break;
		case Card.TYPE_GOAL: background = getImage( "data/card_goal.png" ); break;
		default: 
			background = getImage( "data/card_child_back.png" ); break;
	}
	if(background)
		ctx.drawImage( background, 0,0 );

	if( card.type == Card.TYPE_PERSON )
	{
		ctx.save();
		ctx.beginPath();
		ctx.rect(8,8,100,114);
		ctx.clip();

		//fill face
		var s = 128;
		var offsetx = Math.random()*3;
		var offsety = Math.random()*3;
		for(var i = 0; i < layers.length; ++i)
		{
			var layer = layers[i];
			var celdax = Math.floor(Math.random() * 4);
			var celday = Math.floor(Math.random() * 2) + (card.gender == "F" ? 2 : 0);
			ctx.drawImage( layer, celdax*s, celday*s, s,s, -4 + offsetx,offsety,s,s );
		}

		ctx.restore();

		//traits
		var traits = getImage( "data/iconosTraits.png" );
		ctx.fillStyle = "black";
		ctx.font = "12px Tahoma";
		var index = 0;
		for(var i = 0; i < card.traits.length; ++i)
		{
			var t = card.traits[i];
			if( !t.level )
				continue;
			var str = TRAIT.TYPE_STR[ t.type ] || "???";
			ctx.fillText( str + ":" + t.level, 215, 20 + 20 * i );
			ctx.drawImage( traits, (t.level - 1) * 32, t.type * 32,32,32, 124 + (index%2)*40, 40 + Math.floor(index/2)*32, 32,32 );
			index++;
		}
	}
	else if( card.type == Card.TYPE_GOAL )
	{
		var traits = getImage( "data/iconosTraits.png" );
		var goals = getImage( "data/iconosObjetivos.png" );
		//score: 1, requisites: {ATH: 3}
		var index = 0;
		if(card._template)
		{
			for(var i in card._template.requisites)
			{
				var level = card._template.requisites[i];
				if( !level )
					continue;
				var type = TRAIT.TYPES[i];
				//ctx.fillText( TRAIT.TYPE_STR[ t.type ] + ":" + t.level, 215, 20 + 20 * i );
				ctx.drawImage( traits, (level - 1) * 32, type * 32,32,32, 110 + (index%2)*60, 16 + Math.floor(index/2)*60, 60,60 );
				index++;
			}

			if( card._template.icon )
				ctx.drawImage( goals, card._template.icon[0] * 128, card._template.icon[1] * 128, 128,128, 0,0, 128, 128 );

			ctx.fillStyle = "white";
			ctx.font = "24px Tahoma";
			ctx.textAlign = "center";
			ctx.fillText( card._template.score, 224,110 );
			ctx.textAlign = "left";
		}
	}
	else if( card.type == Card.TYPE_EVENT )
	{
		var events = getImage( "data/iconosEventos.png" );
		ctx.fillStyle = "white";
		ctx.font = "20px Tahoma";
		var template = card._template;
		var y = 50;
		if (template.action)
		{
			ctx.fillText( template.action, 120, y );
		}
		else
			for( var i in template.power)
			{
				var level = template.power[i];
				ctx.fillText( i + (level > 0 ? " +" : " ") + template.power[i], 120, y );
				y += 26;
			}
		if( template.icon )
			ctx.drawImage( events, template.icon[0] * 128, template.icon[1] * 128, 128,128, 0,0, 128, 128 );
	}

	//text
	if(card.name)
	{
		ctx.fillStyle = "white";
		ctx.font = "13px Tahoma";
		ctx.fillText( card.name, 118,22 );
	}

	if(card.id)
	{
		ctx.fillStyle = "#555";
		ctx.fillText( card.id, 10,18 );
	}
	
	var final_image = card._image || new Image();
	final_image.src = canvas.toDataURL();
	card._image = final_image;
	card._must_update = false;
	return final_image;
}


//**********************
function WebGLGameRenderer( canvas )
{
	this.canvas = canvas;

	this.card_size = [2,2,1];
	this.hover_card_size = [2.2,2.2,1.2];

	this.camera = new RD.Camera();
	this.camera.lookAt([0,70,40],[0,0,0],[0,1,0]);
	this.camera.perspective( 60, 1, 0.1,200);

	this.hard_camera = new RD.Camera();
	this.hard_camera.lookAt([0,10,10],[0,0,0],[0,1,0]);
	this.hard_camera.perspective( 60, 1, 0.1,100);

	this.scene = new RD.Scene();

	this.floor_node = new RD.SceneNode({ name: "floor", layer: 4, mesh:"planeXZ", texture: "data/table.png", scale:11.5 });
	this.scene.root.addChild( this.floor_node );

	var bgcolor = [0.3,0.3,0.3,1];
	this.bg_node = new RD.SceneNode({ texture: "data/roots_1.png", position: [0,-14,0], color:bgcolor, scale:100, name:"bg", layer: 4, mesh:"planeXZ"});
	this.scene.root.addChild( this.bg_node );
	this.bg2_node = new RD.SceneNode({ texture: "data/roots_4.png", position: [0,-10,0], color:bgcolor, scale:80, name:"bg", layer: 4, mesh:"planeXZ"});
	this.scene.root.addChild( this.bg2_node );
	this.bg3_node = new RD.SceneNode({ texture: "data/roots_3.png", position: [0,-7,0], color:bgcolor, scale:50, name:"bg", layer: 4, mesh:"planeXZ"});
	this.scene.root.addChild( this.bg3_node );
	this.bg4_node = new RD.SceneNode({ texture: "data/roots_2.png", position: [0,-3,0], color:bgcolor, scale:30, name:"bg", layer: 4, mesh:"planeXZ"});
	this.scene.root.addChild( this.bg4_node );

	this.deckA_node = new RD.SceneNode({ name: "deck", layer: 4, mesh:"data/deck.obj", texture: "data/card_male_back.png", scale:0.5 });
	this.deckA_node.flags.two_sided = true;
	this.deckA_node.position = [-4.8,0.1,1.2];
	this.deckA_node.rotate( Math.PI * 0.5, [0,1,0]);
	this.scene.root.addChild( this.deckA_node );

	this.deckB_node = new RD.SceneNode({ name: "deck", layer: 4, mesh:"data/deck.obj", texture: "data/card_female_back.png", scale:0.5 });
	this.deckB_node.flags.two_sided = true;
	this.deckB_node.position = [-4.8,0.1,-1.2];
	this.deckB_node.rotate( Math.PI*0.5, [0,1,0] );
	this.scene.root.addChild( this.deckB_node );

	this.slots_node = new RD.SceneNode();
	this.slots_node.position = [0,0.01,0];
	this.scene.root.addChild( this.slots_node );

	//all cards on the game should be inside this node
	this.cards_node = new RD.SceneNode();
	this.cards_node.position = [0,0.02,0];
	this.scene.root.addChild( this.cards_node );

	/*
	this.player_hand = new RD.SceneNode();
	this.player_hand.position = [0,4,5];
	this.player_hand.setEulerRotation(0,0,0.5);
	this.cards_node.addChild( this.player_hand );
	*/

	//slots
	this.slots = {
		table_pool: [],
		couples_A: [],
		couples_B: [],
		goals: []
	};

	//pool slots
	for(var i = 0; i < WebGLGameRenderer.table_slots.length; ++i)
	{
		var slot_pos = WebGLGameRenderer.table_slots[i];
		var slot_info = { slot: "pool", name:"pool_" + i, index: i };
		var node = this.createSlot( slot_pos,slot_info );
		this.slots.table_pool.push( slot_info );
	}

	//frontline slots
	for(var i = 0; i < WebGLGameRenderer.couple_slots.length; ++i)
	{
		var slot_pos = WebGLGameRenderer.couple_slots[i];
		var slot_info = { slot: "couple", side:"A", index: i, name: "couple_A_slot_" + i };
		var node = this.createSlot( slot_pos, slot_info );
		this.slots.couples_A.push( slot_info );

		var slot_pos = WebGLGameRenderer.couple_slots[i];
		var slot_info = { slot: "couple", side:"B", index: i, name: "couple_B_slot_" + i };
		var node = this.createSlot( [slot_pos[0],slot_pos[1],-slot_pos[2]], slot_info );
		this.slots.couples_B.push( slot_info );
	}

	//goals slots
	for(var i = 0; i < WebGLGameRenderer.goal_slots.length; ++i)
	{
		var slot_pos = WebGLGameRenderer.goal_slots[i];
		var slot_info = { slot: "goal", name:"goal_" + i, index: i };
		var node = this.createSlot( slot_pos,slot_info );
		node.rotate( -90 * DEG2RAD, [0,1,0] );
		this.slots.goals.push( slot_info );
	}

	this.card_maker = new CardMaker();
}

WebGLGameRenderer.prototype.createSlot = function( slot_pos, slot_info )
{
	var node = new RD.SceneNode({ layers: 4, position: slot_pos, name: slot_info.name, });
	var node2 = new RD.SceneNode({ layers: 4, name: slot_info.name + "_2", color: [0.3,0.2,0.1,1], mesh: "planeXZ", texture: "data/card_marker.png" , scaling: this.card_size });
	node.addChild(node2);
	node._card = slot_info;
	node2._card = slot_info;
	slot_info._node = node;
	slot_info._node2 = node2;
	this.slots_node.addChild( node );
	return node;
}


WebGLGameRenderer.table_slots = [
	[-1.2,0,-1.8],[1.2,0,-1.8],
	[-1.2,0,-0.6],[1.2,0,-0.6],
	[-1.2,0,0.6],[1.2,0,0.6],
	[-1.2,0,1.8],[1.2,0,1.8]];

WebGLGameRenderer.couple_slots = [
	[-3.5,0,4.8],[-1.2,0,4.8],[1.2,0,4.8],[3.5,0,4.8]
];

WebGLGameRenderer.goal_slots = [
	[4.8,0,-2.4],[4.8,0,0],[4.8,0,2.4]
];

//WebGLGameRenderer.prototype = Object.create( CanvasGameRenderer.prototype ); //inherit

WebGLGameRenderer.prototype.cardToSlot = function( card, type, index )
{
	index = index || 0;
	var node = this.getCardNode( card );
	if(!node)
		return;

	var target = null;

	if(type == "pool")
	{
		target = this.slots.table_pool[index];
	}
	else if(type == "couples_A")
	{
		target = this.slots.couples_A[index];
	}
	else if(type == "couples_B")
	{
		target = this.slots.couples_B[index];
	}
	else if(type == "goals")
	{
		target = this.slots.goals[index];
	}
	else
	{
		target = this.floor_node;
	}

	if(target)
	{
		var target_node = target.constructor === RD.SceneNode ? target : target._node;

		vec3.lerp( node.position, node.position, target_node.position, 0.1 );
		//node.position = target_node.position;
		node.rotation = target_node.rotation;
		node.move([0,0.03,0]);
	}
}

WebGLGameRenderer.prototype.renderGame = function( game, player, settings )
{
	//debug
	if(!this.test_card)
		this.test_card = new Card(game);
	//this.cardToSlot( this.test_card, "pool", 1 );

	//camera according to player
	var f = 0.05;
	this.hard_camera.lookAt([0 + settings.cam_offset[0] * 2,11 - settings.cam_offset[1] * 2,11],[0,-2,0],[0,1,0]);
	this.camera.position = vec3.lerp(this.camera.position,this.camera.position,this.hard_camera.position,f);
	this.camera.target = vec3.lerp(this.camera.target,this.camera.target,this.hard_camera.target,f);
	var aspect = gl.canvas.width / gl.canvas.height;
	this.camera.perspective( 50, aspect, 0.1,200);

	//prerender; create nodes and position all
	this.preRender(game);

	//clear
	gl.clearColor(0.1,0.1,0.1,1);
	gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
	
	//render table
	GFX.scene_renderer.render( this.scene, this.camera );
}

WebGLGameRenderer.prototype.preRender = function( game )
{
	var size = this.card_size;

	var current_player = game.getCurrentPlayer();
	var in_event_mode = game.current_player == 0 && game.players[0].offered_event_card;
	//iterate through all cards
	for(var i = 0; i < game.players.length; ++i)
	{
		var player = game.players[i];

		//hand (only player 1)
		if( i == 0 )
		{
			var num_cards = player.hand.length;
			for(var j = 0; j < num_cards; ++j)
			{
				var card = player.hand[j];
				var node = this.getCardNode(card);
				var high = card._hover ? 0.2 : 0;
				var pos = [j*(size[0]+0.1) - (num_cards-1)*0.5*size[0],4,8 + j * 0.01];
				vec3.lerp( node.position, node.position, pos, 0.2 );
				node.setEulerRotation(0,0,0.5);
				//card._front_node.layers = 3;
				card._lane = "hand";
				card._selectable = true;
				var scale = card._hover ? 1.1 : 1;
				node.scaling = Math.lerp( scale, node.scaling[0], 0.9 );
			}
		}

		//front line
		var num_cards = player.frontline.length;
		for(var j = 0; j < num_cards; ++j)
		{
			var card = player.frontline[j];
			card._lane = "front";
			card._selectable = false;
			var node = this.getCardNode(card);
			//card._front_node.layers = 4;
			this.cardToSlot( card, i == 0 ? "couples_A" : "couples_B", j );
		}
	}

	//pool cards
	for( var i = 0; i < 8; ++i)
	{
		var card = game.cards.pool[i];
		card._selectable = in_event_mode ? false : true;

		var slot = this.slots.table_pool[i];
		if( card )
		{
			this.cardToSlot( card, "pool", i );
			slot._node.enabled = false;
		}
		else
		{
			slot._node.enabled = true;
			slot._node2.texture = slot._hover ? "data/card_marker_highlight.png" : "data/card_marker.png";
		}
	}

	//couples
	/*
	for(var i = 0; i < this.slots.couples_A.length; ++i)
	{
		var slot = this.slots.couples_A[i];
		slot._node2.texture = slot._hover ? "data/card_marker_highlight.png" : "data/card_marker.png";
	}
	for(var i = 0; i < this.slots.couples_B.length; ++i)
	{
		var slot = this.slots.couples_B[i];
		slot._node2.texture = slot._hover ? "data/card_marker_highlight.png" : "data/card_marker.png";
	}
	*/

	//goals
	for(var i = 0; i < game.cards.activeGoals.length; ++i)
	{
		var card = game.cards.activeGoals[i];
		card._selectable = false;
		var node = this.getCardNode(card);
		this.cardToSlot( card,"goals", i );
	}
}

WebGLGameRenderer.prototype.onCardDestroyed = function( player, pool, card, index )
{
	console.log(" + Card DESTROYED: " + card.toString() );
	if( !card._node )
		return;

	Tween.easeProperty( card._node, "position", [0,10,0], 3000 );
	Tween.easeProperty( card._node, "rotation", quat.create(), 3000 );

	if(1)
	setTimeout( function(){
		//remove node
		if( card._node )
			card._node.parentNode.removeChild( card._node );

		//free texture
		if(	card._texture )
		{
			delete gl.textures[ card._texture.name ];
			card._texture.delete();
		}
	},3000);
}


WebGLGameRenderer.prototype.highlightCard = function( card, v )
{
	if(!this._highlight_node)
		this._highlight_node = new RD.SceneNode({ position: [0,0.02,0], layers: 4, name: "highlight", color: [1,1,1,1], mesh: "planeXZ", texture: "data/card_marker.png", scaling: [2.2,2.2,1.1] });

	if( !v )
	{
		if(this._highlight_node._parent)
			this._highlight_node._parent.removeChild( this._highlight_node );
		return;
	}

	if( this._highlight_node._parent != card._node )
	{
		if(this._highlight_node._parent)
			this._highlight_node._parent.removeChild( this._highlight_node );
		if(card._node)
			card._node.addChild( this._highlight_node ); 
	}

}

WebGLGameRenderer.prototype.tweenNodeToNode = function( node, node )
{
	
}

WebGLGameRenderer.prototype.getCardNode = function(card)
{
	if(!card._node) //create
	{
		card._node = new RD.SceneNode(); //use pool?
		card._node.position = [0,20 + Math.random() * 20,0];
		//card._node.scaling = this.card_size;
		this.cards_node.addChild( card._node );

		var front_node = new RD.SceneNode();
		front_node.mesh = "planeXZ";
		front_node.id = "card_" + card.id;
		front_node.flags.two_sided = false;
		front_node._card = card; //double link
		front_node.scaling = this.card_size;
		card._front_node = front_node;
		card._node.addChild(front_node);

		var back_side = new RD.SceneNode(); 
		back_side.mesh = "planeXZ";
		back_side.texture = "data/card_"+(card.gender=="F"?"fe":"")+"male_back.png";
		back_side.setEulerRotation([0,0,Math.PI-0.00001]);
		back_side.layers = 4;
		back_side.id = "back_side";
		back_side.scaling = this.card_size;
		//back_side.position = [0,0.1,0];
		//back_side.scaling = [1,1,0.5];
		card._back_node = this.card_size;
		card._node.addChild(back_side);
	}

	var node = card._front_node;
	var tex = this.getCardTexture( card );
	if(tex)
		node.texture = tex.name;
	return card._node;
}

WebGLGameRenderer.prototype.testRay = function( ray )
{
	this.last_collision = this.last_collision || vec3.create();
	return this.scene.testRay( ray, this.last_collision, 100, 3, false );
}

WebGLGameRenderer.prototype.getCardTexture = function( card )
{
	if(card._texture && !card._must_update )
		return card._texture;

	//update image
	var img = this.card_maker.buildCard( card );
	if(!img || !img.width )
		return null;

	//update texture
	var tex = new GL.Texture.fromImage( img, { filter: gl.NEAREST } );
	tex.name = ":card_" + card.id;
	gl.textures[ tex.name ] = tex;
	card._texture = tex;
	return tex;
}

//******************************************
function CanvasGameRenderer( canvas, on_ready )
{
	this.imgs = {};
	this.canvas = canvas;

	this.card_maker = new CardMaker();


	function inner()
	{
		if(on_ready)
			on_ready();
	}
}

//renders the game from the point of view of the player
CanvasGameRenderer.prototype.renderGame = function( game, player )
{
	var canvas = this.canvas;
	var w = canvas.width;
	var h = canvas.height;
	var ctx = this.canvas.getContext("2d");
	ctx.fillStyle = "red";
	ctx.fillRect(0,0,w,h);


	//place camera according to user view
}


/*
WebGLGameRenderer.prototype.renderCards = function( cards )
{
	var m = mat4.create();
	for(var i = 0; i < 3; ++i )
	{
		//var card = cards[i];
		var card = this.test_card;
		var tex = this.getCardTexture( card );
		if( !tex || !tex.width )
			continue;

		//position
		mat4.identity(m);
		var aspect = tex.width / tex.height;
		mat4.translate(m,m,[i * 2,0.2,0]);
		//render
		this.renderCard( card, m );
	}
}

WebGLGameRenderer.prototype.renderCard = function( card, model )
{
	var camera = this.camera;
	var mesh = gl.meshes["planeXZ"];
	var shader = gl.shaders["card"];
	var tex = this.getCardTexture( card );
	if(!tex || !shader)
		return;

	gl.disable( gl.BLEND );
	gl.disable( gl.CULL_FACE );
	var aspect = tex.width / tex.height;
	mat4.scale(model, model, [2,2*aspect,2] );
	GFX.scene_renderer.renderMesh( model, mesh, tex, null, shader );
}
*/