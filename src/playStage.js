var PLAYSTAGE = {
	name: "play",
	settings: {
		cam_offset:[0,0],
	},

	init: function()
	{
		this.game = new Game();
		this.game.init();

	},

	render: function()
	{
		var player = this.game.getCurrentPlayer();
		GFX.renderGame( this.game, player, this.settings );
	},
	
	onmouse: function(e)
	{
		if( e.type == "mousemove" )
		{
			this.settings.cam_offset[0] = (e.offsetX / gl.canvas.width) - 0.5;
			this.settings.cam_offset[1] = (e.offsetY / gl.canvas.width) - 0.5;
		}
	},

	onkey: function(e)
	{
		
	}
};

CORE.addStage( PLAYSTAGE );