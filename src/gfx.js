var GFX = {

	init: function( canvas )
	{
		this.canvas = canvas;
		//create renderer
		//this.renderer = new CanvasGameRenderer( this.canvas );
		this.renderer = new WebGLGameRenderer( this.canvas );
	},

	renderGame: function( game, player )
	{
		var canvas = this.canvas;
		canvas.width = document.body.offsetWidth;
		canvas.height = document.body.offsetHeight;
		//render background?

		//show the game
		this.renderer.renderGame( game, player );

		//render menus?
	}
};