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
	getImage( "data/card_male.png" );
	getImage( "data/card_female.png" );
	getImage( "data/FONDO.png" );
	getImage( "data/PELOS detras.png" );
	getImage( "data/CABEZA.png" );
	getImage( "data/CARA.png" );
	getImage( "data/PELOS.png" );
	getImage( "data/ATREZZO.png" );

}

CardMaker.prototype.buildCard = function( card, force )
{
	var canvas = this._card_canvas;
	canvas.width = 256; //template.width;
	canvas.height = 128; //template.height;

	//still loading
	if(num_loading_images)
		return;

	if( card._image && !force && !card._must_update )
		return card._image;

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

	//background
	var background = null;
	switch( card.type )
	{
		case Card.TYPE_PERSON: background = getImage( card.gender == "F" ? "data/card_female.png" : "data/card_male.png" ); break;
		case Card.TYPE_EVENT: background = getImage( "data/card_event.png" ); break;
		case Card.TYPE_GOAL: background = getImage( "data/card_goal.png" ); break;
	}
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
	}
	else if( card.type == Card.TYPE_GOAL )
	{
				
	}

	//text
	ctx.fillStyle = "white";
	ctx.font = "18px Tahoma";
	ctx.fillText( card.name, 120,24 );

	
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
	this.gl = GL.create( {canvas: canvas });
	enableWebGLCanvas( canvas );

	this.card_size = [2,2,1];
	this.hover_card_size = [2.2,2.2,1.2];

	this.camera = new RD.Camera();
	this.camera.lookAt([0,70,40],[0,0,0],[0,1,0]);
	this.camera.perspective( 60, 1, 0.1,200);

	this.hard_camera = new RD.Camera();
	this.hard_camera.lookAt([0,10,10],[0,0,0],[0,1,0]);
	this.hard_camera.perspective( 60, 1, 0.1,100);

	this.scene_renderer = new RD.Renderer( this.gl );
	this.scene_renderer.loadShaders("data/shaders.txt");
	this.scene_renderer.default_texture_settings.minFilter = GL.NEAREST;
	this.scene_renderer.default_texture_settings.magFilter = GL.NEAREST;

	this.scene = new RD.Scene();

	this.floor_node = new RD.SceneNode({ name: "floor", layer: 4, mesh:"planeXZ", texture: "data/table.png", scale:11.5 });
	this.scene.root.addChild( this.floor_node );
	this.bg_node = new RD.SceneNode({ name: "bg", layer: 4, mesh:"planeXZ", texture: "data/background.png", position: [0,-3,0],scale:50 });
	this.scene.root.addChild( this.bg_node );

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

	//table slots
	this.slots = {
		table_pool: [],
		couples_A: [],
		couples_B: []
	};

	for(var i = 0; i < WebGLGameRenderer.table_slots.length; ++i)
	{
		var slot_pos = WebGLGameRenderer.table_slots[i];
		var node = new RD.SceneNode({ position: slot_pos, name: "table_slot_" + i, color: [0.3,0.2,0.1,1], mesh: "planeXZ", texture: "data/card_marker.png", scaling: this.card_size });
		var slot = { slot: "pool", index: i, _node: node };
		node._card = slot;
		this.slots_node.addChild( node );
		this.slots.table_pool.push( slot );
	}

	for(var i = 0; i < WebGLGameRenderer.couple_slots.length; ++i)
	{
		var slot_pos = WebGLGameRenderer.couple_slots[i];
		var node = new RD.SceneNode({ position: slot_pos, name: "couple_A_slot_" + i, color: [0.6,0.2,0.3,1], mesh: "planeXZ", texture: "data/card_marker.png", scaling: this.card_size });
		var slot = { slot: "couple", side:"A", index: i, _node: node };
		node._card = slot;
		this.slots_node.addChild( node );
		this.slots.couples_A.push( slot );

		var node = new RD.SceneNode({ position: [slot_pos[0],slot_pos[1],-slot_pos[2]], name: "couple_B_slot_" + i, color: [0.6,0.2,0.3,1], mesh: "planeXZ", texture: "data/card_marker.png", scaling: this.card_size });
		var slot = { slot: "couple", side:"B", index: i, _node: node };
		node._card = slot;
		this.slots_node.addChild( node );
		this.slots.couples_B.push( slot );
	}

	this.card_maker = new CardMaker();
}

WebGLGameRenderer.table_slots = [
	[-1.2,0,-1.8],[1.2,0,-1.8],
	[-1.2,0,-0.6],[1.2,0,-0.6],
	[-1.2,0,0.6],[1.2,0,0.6],
	[-1.2,0,1.8],[1.2,0,1.8]];

WebGLGameRenderer.couple_slots = [
	[-3.5,0,4.8],[-1.2,0,4.8],[1.2,0,4.8],[3.5,0,4.8]
];

WebGLGameRenderer.prototype = Object.create( CanvasGameRenderer.prototype ); //inherit

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

	if(target)
	{
		node.position = target._node.position;
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
	gl.clearColor(0.2,0.2,0.2,1);
	gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
	
	//render table
	this.scene_renderer.render( this.scene, this.camera );

	//render hand
	//this.renderCards( player.hand );
}

WebGLGameRenderer.prototype.preRender = function( game )
{
	var size = this.card_size;
	//iterate through all cards
	for(var i = 0; i < game.players.length; ++i)
	{
		var player = game.players[i];

		//render hand only player 1
		if( i == 0 )
		{
			var num_cards = player.hand.length;
			for(var j = 0; j < num_cards; ++j)
			{
				var card = player.hand[j];
				var node = this.getCardNode(card);
				var high = card._hover ? 0.2 : 0;
				node.position = [j*(size[0]+0.1) - (num_cards-1)*0.5*size[0],4,8 + j * 0.01];
				node.setEulerRotation(0,0,0.5);
				node.scaling = card._hover ? 1.1 : 1;
			}
		}
	}

	//pool cards
	for( var i = 0; i < 8; ++i)
	{
		var card = game.cards.pool[i];
		var slot = this.slots.table_pool[i];
		if( card )
		{
			this.cardToSlot( card, "pool", i );
			slot._node.enabled = false;
		}
		else
		{
			slot._node.enabled = true;
			slot._node.texture = slot._hover ? "data/card_marker_highlight.png" : "data/card_marker.png";
		}
	}

	//couples
	for(var i = 0; i < this.slots.couples_A.length; ++i)
	{
		var slot = this.slots.couples_A[i];
		slot._node.texture = slot._hover ? "data/card_marker_highlight.png" : "data/card_marker.png";
	}
	for(var i = 0; i < this.slots.couples_B.length; ++i)
	{
		var slot = this.slots.couples_B[i];
		slot._node.texture = slot._hover ? "data/card_marker_highlight.png" : "data/card_marker.png";
	}
}

WebGLGameRenderer.prototype.highlightCard = function( card, v )
{
	if(!this._highlight_node)
		this._highlight_node = new RD.SceneNode({ position: [0,0.02,0], layers: 4, name: "highlight", color: [1,1,1,1], mesh: "planeXZ", texture: "data/card_marker.png", scaling: [2.2,2.2,1.1] });

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
	this.scene_renderer.renderMesh( model, mesh, tex, null, shader );
}
*/

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

