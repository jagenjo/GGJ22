var PLAYSTAGE = {
	name: "play",

	init: function()
	{
		
	},

	render: function()
	{
		var player  = this.game.getCurrentPlayer();
		GFX.renderGame( this.game, player );
	}
};

CORE.addStage( PLAYSTAGE );