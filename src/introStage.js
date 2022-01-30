var INTROSTAGE = {
	name: "intro",

	init: function()
	{
		this.camera = new RD.Camera();
		this.camera.perspective( 50, gl.canvas.width / gl.canvas.height, 0.1, 100 );
		this.camera.lookAt([0,-0.1,2],[0,0,0],[0,1,0]);

		this.scene = new RD.Scene();

		this.bg1 = new RD.SceneNode({ position:[0,0,-1], scale: [2,1,1], mesh:"plane", texture:"data/intro_1.png" })
		this.scene.root.addChild( this.bg1 );

		for(var i = 0; i < 10; ++i )
		{
			var index = Math.floor(Math.random()*2)+2;
			var layer = new RD.SceneNode({ position:[0,0,-1 + i*0.3], scale: [2,1,1], mesh:"plane", texture:"data/intro_"+index+".png" })
			this.scene.root.addChild( layer );
		}
	},

	onEnter: function()
	{
		if(!this.audio)
		{
			this.audio = new Audio();
			this.audio.autoplay = true;
			this.audio.loop = true;
		}

		this.audio.src = "data/sounds/intro_epic.mp3";
		this.audio.volume = 0.4;
	},

	onLeave: function()
	{
		if(!this.audio.paused)
			this.audio.pause();
	},

	render: function()
	{
		GFX.resizeBuffer();
		GFX.scene_renderer.clear( [0.165,0.165,0.165,1] );

		var offsetx = (CORE.mouse[0] / gl.canvas.width) - 0.5;
		var offsety = (CORE.mouse[1] / gl.canvas.height) - 0.5;
		this.camera.lookAt([offsetx * 0.5,offsety * 0.3-0.1,2],[0,offsety * -0.2,0],[0,1,0]);

		GFX.scene_renderer.render( this.scene, this.camera );

		gl.start2D();
		var img = getImage("data/intro_title.png");
		if(img && img.width)
			gl.drawImage( img, gl.canvas.width * 0.5 - 300, -100, 600, 600 );
	},

	onmouse: function(e)
	{
		if(e.type == "mousedown")
			CORE.changeStage( PLAYSTAGE );
	}
};

CORE.addStage( INTROSTAGE );