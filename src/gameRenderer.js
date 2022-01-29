//There are two versions, one based on Canvas2D and once based on WebGL

//GLOBALS
//Images manager
var imgs = {};
function getImage( url, on_load, on_error )
{
	if( imgs[ url ] )
		return imgs[ url ];
	var img = new Image();
	img.onload = inner;
	img.src = url;
	img.is_loading = true;
	imgs[url] = img;
	img.onerror = on_error;

	function inner()
	{
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
	getImage( "data/card.png", inner );

	function inner(img)
	{
		that._card_template = img;
		if(on_ready)
			on_ready();
	}
}

CardMaker.prototype.buildCard = function( card, force )
{
	var canvas = this._card_canvas;
	var template = this._card_template;
	if( !template || template.is_loading )
		return null;

	if( card._image && !force && !card._must_update )
		return card._image;

	canvas.width = template.width;
	canvas.height = template.height;

	var ctx = canvas.getContext("2d");
	ctx.drawImage( template, 0,0 );
	ctx.fillStyle = "black";
	ctx.fillText( "TEST", 20,20 );

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

	this.camera = new RD.Camera();
	this.camera.lookAt([0,10,40],[0,0,0],[0,1,0]);
	this.camera.perspective( 60, 1, 0.1,100);

	this.hard_camera = new RD.Camera();
	this.hard_camera.lookAt([0,10,10],[0,0,0],[0,1,0]);
	this.hard_camera.perspective( 60, 1, 0.1,100);

	this.scene_renderer = new RD.Renderer( this.gl );

	this.scene = new RD.Scene();
	this.floor_node = new RD.SceneNode({ mesh:"planeXZ", texture: "data/table.png", scale:[12,12,12] });
	this.scene.root.addChild( this.floor_node );
	this.cards_node = new RD.SceneNode();
	this.scene.root.addChild( this.cards_node );

	this.scene_renderer.loadShaders("data/shaders.txt");

	this.card_maker = new CardMaker();

	this.test_card = new Card(1);
}

WebGLGameRenderer.prototype = Object.create( CanvasGameRenderer.prototype ); //inherit

WebGLGameRenderer.prototype.renderGame = function( game, player )
{
	//camera according to player
	var f = 0.05;
	this.hard_camera.lookAt([0,10,10],[0,-2,0],[0,1,0]);
	this.camera.position = vec3.lerp(this.camera.position,this.camera.position,this.hard_camera.position,f);
	this.camera.target = vec3.lerp(this.camera.target,this.camera.target,this.hard_camera.target,f);

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
	//iterate through all cards
	for(var i = 0; i < game.players.length; ++i)
	{
		var player = game.players[i];

		for(var j = 0; j < player.hand.length; ++j)
		{
			var card = player.hand[j];
			var node = this.getCardNode();
			node.position = [j*2,0,0];
		}
	}

}

WebGLGameRenderer.prototype.getCardNode = function(card)
{
	if(card._node)
		return card._node;

	var node = card._node || new RD.SceneNode();
	node.mesh = "planeXZ";
	if(!node._parent)
		this.cards_node.addChild(node);

	node.texture = this.getCardTexture( card );

	card._node = node;
	return node;
}

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

