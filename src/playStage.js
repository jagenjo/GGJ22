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
		this.game.onCardDestroyed = GFX.renderer.onCardDestroyed.bind(this);
	},

	onEnter: function( prev_stage )
	{
		//return; //MUTE

		if(!this.audio)
		{
			this.audio = new Audio();
			this.audio.autoplay = true;
			this.audio.loop = true;
		}

		if( prev_stage != CONFIRM_COUPLE_STAGE )
			this.audio.src = "data/sounds/intro_piano.mp3";
		this.audio.volume = 0.4;
	},

	onLeave: function()
	{
		
	},

	render: function()
	{
		var player = this.game.getCurrentPlayer();

		GFX.resizeBuffer();
		GFX.renderer.renderGame( this.game, player, this.settings );

		if( CORE.current_stage == this )
			this.renderUI();
	},
	
	renderUI: function()
	{
		gl.start2D();
		GFX.drawTitle( this.game.current_player == 0 ? "haz pareja" : "juega la IA", gl.canvas.width * 0.5, 30 );
		if(this.hover && this.hover.constructor == Card )
			GFX.drawCard2D( this.hover, gl.canvas.width * 0.5, 200, 2 );
	},

	update: function(dt)
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
			{
				this.hover._hover = true;
				GFX.playSound("data/sounds/bip.wav",0.3);
			}
		}

		if( this.game.current_player != 0 ) //AI TURN
		{
			if( this.must_play_AI )
				this.playAI();
		}
	},

	onmouse: function(e)
	{
		var camera = GFX.renderer.camera;
		var ray = camera.getRay(e.offsetX, gl.canvas.height - e.offsetY, null, GFX.ray );

		if( e.type == "mousedown" )
		{
			if(	this.hover && this.game.current_player == 0 )
			{
				if( this.hover.constructor == Card ) //highlight
				{
					if( this.selected && this.selected != this.hover )
					{
						CONFIRM_COUPLE_STAGE.first_card = this.selected;
						CONFIRM_COUPLE_STAGE.second_card = this.hover;
						GFX.renderer.highlightCard( this.hover, false );
						this.hover = null;
						CORE.changeStage( CONFIRM_COUPLE_STAGE );
					}
					else
					{
						this.selected = this.hover;
						GFX.renderer.highlightCard( this.hover, true );
					}
				}
				else //clicking empty slot
				{
					
				}
			}
			else if( this.selected )
			{
				GFX.renderer.highlightCard( this.selected, false );
				this.selected = null;
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
		
	},

	playAI: function()
	{
		if(1) //in couples phase
		{
			var player = this.game.getCurrentPlayer();
			player.addAction( "pair_cards", player.hand.random().id, this.game.cards.pool.random().id );
			this.game.endTurn();
		}

		this.must_play_AI = false;
	}
};

CORE.addStage( PLAYSTAGE );




//minor stages
var CONFIRM_COUPLE_STAGE = {
	name: "confirm_couple",

	hover: null,

	first_card: null,
	second_card: null,

	init: function()
	{
		/*
		this.camera = new RD.Camera();
		this.scene = new RD.Scene();
		this.first_node = new RD.SceneNode({scale: PLAYSTAGE.card_size});
		this.scene.root.addChild( this.first_node );
		this.second_node = new RD.SceneNode({scale: PLAYSTAGE.card_size});
		this.scene.root.addChild( this.second_node );
		*/
	},

	render: function()
	{
		PLAYSTAGE.render();

		gl.start2D();
		gl.fillColor = [0,0,0,0.9];
		gl.fillRect(0,0,gl.canvas.width, gl.canvas.height);

		GFX.drawTitle( "confirmar pareja", gl.canvas.width * 0.5, gl.canvas.height * 0.25 );
		GFX.drawIcon( [0,0], gl.canvas.width * 0.5, gl.canvas.height * 0.5 );

		GFX.drawTitle( "confirmar", gl.canvas.width * 0.4, gl.canvas.height * 0.75 );
		GFX.drawTitle( "cancelar", gl.canvas.width * 0.6, gl.canvas.height * 0.75 );

		//RENDER
		GFX.drawCard2D( this.first_card, gl.canvas.width * 0.25, gl.canvas.height * 0.5 );
		GFX.drawCard2D( this.second_card, gl.canvas.width * 0.75, gl.canvas.height * 0.5 );

		gl.finish2D();
	},

	onmouse: function(e)
	{
		var camera = GFX.renderer.camera;

		if( e.type == "mousedown" )
		{
			if( isInsideRect( CORE.mouse, [gl.canvas.width * 0.4 - 128, gl.canvas.height * 0.75 - 32, 256, 64 ] ) )
			{
				//do action
				var player = PLAYSTAGE.game.getCurrentPlayer();
				player.addAction( "pair_cards", this.first_card.id, this.second_card.id );
				PLAYSTAGE.game.endTurn();
				this.first_card = null;
				this.second_card = null;
				PLAYSTAGE.selected = null;
				CORE.changeStage( PLAYSTAGE );
				GFX.playSound("data/sounds/child.mp3",0.3);
				setTimeout(function(){
					PLAYSTAGE.must_play_AI = true;
				},1500);
			}
			else if( isInsideRect( CORE.mouse, [gl.canvas.width * 0.6 - 128, gl.canvas.height * 0.75 - 32, 256, 64 ] ) )
			{
				CORE.changeStage( PLAYSTAGE );
			}
		}
		else if( e.type == "mousemove" )
		{
		}
	},

	onkey: function(e)
	{
		if(e.code == "Escape")
			CORE.changeStage( PLAYSTAGE );
	}
};

function isInsideRect( pos, area )
{
	if( pos[0] < area[0] || 
		pos[1] < area[1] || 
		pos[0] > (area[0] + area[2]) || 
		pos[1] > (area[1] + area[3]) )
		return false;
	return true;
}

CORE.addStage( CONFIRM_COUPLE_STAGE );
