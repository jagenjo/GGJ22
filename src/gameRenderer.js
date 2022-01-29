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
	img.loading = true;
	imgs[url] = img;
	img.onerror = on_error;

	function inner()
	{
		this.loading = false;
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
	getImage( "data/card.png", on_ready );

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
	if( !template || img.template )
		return null;

	if( card._image && !force && !card._must_update )
		return card._image;

	var ctx = canvas.getContext("2d");
	ctx.drawImage( img, 0,0 );
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
	this.camera.lookAt([10,10,10],[0,0,0],[0,1,0]);
	this.camera.perspective( 60, 1, 0.1,100);

	this.scene = new RD.Scene();
	this.scene_renderer = new RD.Renderer( this.gl );

	this.card_maker = new CardMaker();
}

WebGLGameRenderer.prototype = Object.create( CanvasGameRenderer.prototype ); //inherit

WebGLGameRenderer.prototype.renderGame = function( game, player )
{
	gl.clearColor(0,1,0,1);
	gl.clear( gl.COLOR_BUFFER_BIT );

	//render hand
	this.renderCards( player.hand );
}

WebGLGameRenderer.prototype.renderCards = function( cards )
{
	var camera = this.camera;
	var mesh = gl.meshes["plane"];
	var color = [1,1,1,1];
	var shader = gl.shaders["card"];
	if(!shader)
		return;

	gl.disable( gl.BLEND );
	gl.disable( gl.CULL_FACE );

	var m = mat4.create();
	for(var i = 0; i < cards.length; ++i )
	{
		var card = cards[i];
		var tex = this.getCardTexture( card );
		mat4.identity(m);
		var aspect = tex.width / tex.height;
		mat4.translate(m,m,[i * 2,0,0]);
		mat4.scale(m,m,[2,2*aspect,2]);
		this.renderer.renderMesh( m, mesh, tex, color, shader );
	}
}

WebGLGameRenderer.prototype.getCardTexture = function( card )
{
	if(card._texture && !card._must_update )
		return card._texture;

	//update image
	var img = this.card_maker.buildCard( card );

	//update texture
	var tex = new GL.Texture.fromImage( img );
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

