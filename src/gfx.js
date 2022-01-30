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
	}
};