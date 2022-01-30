var GFX = {

	init: function( canvas )
	{
		this.canvas = canvas;
		//create renderer
		//this.renderer = new CanvasGameRenderer( this.canvas );
		this.renderer = new WebGLGameRenderer( this.canvas );

		this.ray = new RD.Ray();
	},

	resizeBuffer: function()
	{
		var canvas = this.canvas;
		canvas.width = document.body.offsetWidth;
		canvas.height = document.body.offsetHeight;
		gl.viewport(0,0,canvas.width,canvas.height);
	},

	drawTitle: function(title, x, y)
	{
		var atlas = {
			"tu turno":[0,0],
			"juega la IA":[1,0],
			"haz pareja":[0,1],
			"asigna evento":[1,1],
			"final de ronda":[0,2],
			"final de era":[1,2],
			"final de juego":[0,3],
			"ultima ronda":[1,3],
			"has ganado":[0,4],
			"has perdido":[1,4],
			"confirmar":[0,5],
			"cancelar":[1,5],
			"confirmar pareja":[0,6],
			"elegir dominante":[1,6]
		};
		var textos = getImage("data/textos.png");
		var t = atlas[title];
		if(!t)
			return;
		var sx = t[0] * 256;
		var sy = t[1] * 64;
		gl.drawImage( textos, sx,sy,256,64, x - 128,y - 32, 256,64 );
	},

	drawIcon: function(index, x, y)
	{
		var img = getImage("data/icons.png");
		if(!img)
			return;
		var sx = index[0] * 128;
		var sy = index[1] * 128;
		gl.imageSmoothingEnabled = false;
		gl.drawImage( img, sx,sy,128,128, x - 64,y - 64, 128,128 );
	},

	drawCard2D: function(card,x,y,scale)
	{
		var tex = card._texture;
		if(!tex)
			return;
		var shader = gl.shaders["card_screen"];
		if(!shader)
			return;
		scale = scale || 2;
		gl.disable( gl.DEPTH_TEST );
		gl.viewport(x-256*scale/2,gl.canvas.height-128*scale/2-y,256*scale,128*scale);
		tex.toViewport(shader);
		gl.viewport(0,0,gl.canvas.width,gl.canvas.height);
		gl.disable( gl.CULL_FACE );
		gl.disable( gl.DEPTH_TEST );
		gl.disable( gl.BLEND );
	}
};