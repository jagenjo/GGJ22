var PLAYSTAGE = {
	name: "play",

	init: function()
	{
		this.game = new Game();
		this.game.init();
	},

	render: function()
	{
		var player = this.game.getCurrentPlayer();
		GFX.renderGame( this.game, player );
	}
};

CORE.addStage( PLAYSTAGE );