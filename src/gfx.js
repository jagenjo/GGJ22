var GFX = {
	init: function( canvas )
	{
		this.canvas = canvas;
		//create renderer
		this.renderer = new CanvasGameRenderer(this.canvas);
	},

	renderGame: function( game, player )
	{
		//render background?

		//show the game
		this.renderer.render( game, player );

		//render menus?
	}
};