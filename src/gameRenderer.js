//There are two versions, one based on Canvas2D and once based on WebGL



//**********************
function WebGLGameRenderer( canvas )
{
	this.canvas = canvas;
	this.gl = GL.create( {canvas: canvas });
	enableWebGLCanvas( canvas );

	this.scene = new RD.Scene();
	this.scene_renderer = new RD.Renderer( this.canvas );
}

WebGLGameRenderer.prototype = Object.create( CanvasGameRenderer.prototype ); //inherit

WebGLGameRenderer.prototype.renderGame = function( game, player )
{
	gl.clearColor(0,1,0,1);
	gl.clear( gl.COLOR_BUFFER_BIT );


}

WebGLGameRenderer.prototype.renderCards = function()
{
	
}

//******************************************
function CanvasGameRenderer( canvas, on_ready )
{
	this.imgs = {};
	this.canvas = canvas;
	this._card_canvas = document.createElement("canvas");
	this.getImage( "data/card.png", inner );

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

CanvasGameRenderer.prototype.buildCard = function( card, force )
{
	var canvas = this._card_canvas;
	var img = this.imgs[ "data/card.png" ];
	if( !img || img.loading )
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

CanvasGameRenderer.prototype.getImage = function(url, on_load)
{
	if( this.imgs[ url ] )
		return this.imgs[ url ];
	var img = new Image();
	img.onload = inner;
	img.src = url;
	img.loading = true;
	this.imgs[url] = img;

	function inner()
	{
		this.loading = false;
		if(	on_load )
			on_load( img );
	}
	return img;
}