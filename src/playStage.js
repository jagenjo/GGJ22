var PLAYSTAGE = {
	name: "play",
	settings: {
		cam_offset:[0,0],
	},

	hover: null,

	init: function()
	{
		this.game = new Game();
		this.game.init();

	},

	render: function()
	{
		var ray = GFX.ray;
		var hover = GFX.renderer.testRay( ray );
		if(hover && hover._card)
			hover = hover._card;
		else
			hover = null;

		gl.canvas.style.cursor = hover ? "pointer" : "";

		if(hover != this.hover)
		{
			if(this.hover)
				this.hover._hover = false;
			this.hover = hover;
			if (this.hover)
				this.hover._hover = true;
		}

		var player = this.game.getCurrentPlayer();

		GFX.resizeBuffer();
		GFX.renderer.renderGame( this.game, player, this.settings );

		if(this.hover && this.hover.constructor == Card )
			this.previewCard( this.hover );
	},

	previewCard: function(card)
	{
		var tex = card._texture;
		if(!tex)
			return;
		gl.disable( gl.DEPTH_TEST );
		gl.viewport(gl.canvas.width*0.5-256,gl.canvas.height-128*2-10,256*2,128*2);
		tex.toViewport();
		gl.viewport(0,0,gl.canvas.width,gl.canvas.height);
	},
	
	onmouse: function(e)
	{
		var camera = GFX.renderer.camera;
		var ray = camera.getRay(e.offsetX, gl.canvas.height - e.offsetY, null, GFX.ray );

		if( e.type == "mousedown" )
		{
			if(	this.hover )
			{
				GFX.renderer.highlightCard( this.hover );
			}
		}

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