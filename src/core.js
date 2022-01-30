//CORE class to handle different stages and resend events 
//Not dependant of WebGL
var CORE = {

	stages: {},
	default_stage: null,
	current_stage: null,
	files: {},
	
	mouse: [],
	buttons: 0,

	init: function()
	{
		this.iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
		document.addEventListener( "visibilitychange", this.handleVisibilityChange.bind(this), false);
    
		//init modules
		this.initGFX();
		
		//init stages
		for(var i in this.stages)
			this.stages[i].init();
			
		this.changeStage( "play" );
		this.enableFileDrop();

		this.start();
	},

	initGFX: function()
	{
		//create canvas
		this.canvas = document.querySelector("canvas");
		this._on_mouse_bind = this.processMouse.bind(this);
		this._on_key_bind = this.processKey.bind(this);
		this.canvas.addEventListener("mousedown", this._on_mouse_bind );
		this.canvas.addEventListener("mousemove", this._on_mouse_bind );
		this.canvas.addEventListener("mouseup", this._on_mouse_bind );
		this.canvas.addEventListener("mousewheel", this._on_mouse_bind );
		document.body.addEventListener("keydown", this._on_key_bind );
		document.body.addEventListener("keyup", this._on_key_bind );

		GFX.init( this.canvas );
	},

	start: function()
	{
		var last = getTime();
		function loop()
		{
			requestAnimationFrame( loop );
			var now = getTime();
			var dt = (now - last);
			CORE.render();
			CORE.update(dt);
			last = now;
		}

		//main loop
		loop();		
	},

	addStage: function( stage )
	{
		console.log("Stage: " + stage.name );
		if(!this.default_stage || stage.default_stage )
			this.default_stage = stage;
		this.stages[ stage.name ] = stage;
	},
	
	changeStage: function( stage )
	{
		if(stage.constructor === String )
			stage = this.stages[ stage ];

		if(stage == this.current_stage || !stage)
			return;

		if( this.current_stage && this.current_stage.onDisable )	
			this.current_stage.onDisable();
	
		this.current_stage = stage;
		
		if(this.current_stage.onEnable)
			this.current_stage.onEnable();
	},

	processMouse: function(e)
	{
		this.onmouse(e);
		e.preventDefault();
	},

	processKey: function(e)
	{
		
	},

	//events to stages
	onmouse: function(e)
	{
		this.mouse[0] = e.offsetX;
		this.mouse[1] = e.offsetY;
		this.buttons = e.buttons;

		if(this.current_stage.onmouse)
			this.current_stage.onmouse(e);
	},

	onkeydown: function(e)
	{
		this.debugKeys(e);
		if(this.current_stage.onkey)
			this.current_stage.onkey(e);
	},

	render: function()
	{
		if(this.current_stage.render)
			this.current_stage.render();
	},

	update: function(dt)
	{
		if(this.current_stage && this.current_stage.update)
			this.current_stage.update(dt);
		Tween.update(dt);
	},
	
	handleVisibilityChange: function(e)
	{
		//console.log("visibility!");
		if(this.current_stage.onTabEnter)
			this.current_stage.onTabEnter( !document.hidden );
	},

	enableFileDrop: function()
	{
		var that = this;
		var element = document.body;
		element.addEventListener("dragenter", onDragEvent);

		function onDragEvent(evt)
		{
			element.addEventListener("dragexit", onDragEvent);
			element.addEventListener("dragover", onDragEvent);
			element.addEventListener("drop", onDrop);
			evt.stopPropagation();
			evt.preventDefault();
		}

		function onDrop(evt)
		{
			evt.stopPropagation();
			evt.preventDefault();

			element.removeEventListener("dragexit", onDragEvent);
			element.removeEventListener("dragover", onDragEvent);
			element.removeEventListener("drop", onDrop);

			if(evt.dataTransfer.files)
			{
				var files = evt.dataTransfer.files;
				for(var i = 0; i < files.length; ++i)
				{
					var file = files[i];
					var url = URL.createObjectURL( file, {} );
					if(file.name.indexOf(".jpg") != -1 || file.name.indexOf(".png") != -1)
					{
						GFX.loadTexture( url, null, (function(v){
							gl.textures["textures/" + this.file.name ] = v;
						}).bind({file: file}));
					}
					else if(file.name.indexOf(".obj") != -1 )
					{
						GFX.loadMesh( url, null, (function(v){
							gl.meshes["meshes/" + this.file.name ] = v;
						}).bind({file: file}));
					}
					else
						CORE.onFileDrop(file);
				}
			}

			return true;
		}
	},

	onFileDrop: function(file)
	{
		if( this.current_stage.onFileDrop)
			this.current_stage.onFileDrop(file);
	},

	downloadFile: function( filename, data, dataType )
	{
		if(!data)
		{
			console.warn("No file provided to download");
			return;
		}

		if(!dataType)
		{
			if(data.constructor === String )
				dataType = 'text/plain';
			else
				dataType = 'application/octet-stream';
		}

		var file = null;
		if(data.constructor !== File && data.constructor !== Blob)
			file = new Blob( [ data ], {type : dataType});
		else
			file = data;

		var url = URL.createObjectURL( file );
		var element = document.createElement("a");
		element.setAttribute('href', url);
		element.setAttribute('download', filename );
		element.style.display = 'none';
		document.body.appendChild(element);
		element.click();
		document.body.removeChild(element);
		setTimeout( function(){ URL.revokeObjectURL( url ); }, 1000*60 ); //wait one minute to revoke url
	},	

	debugKeys: function(e)
	{
		if(e.code == "F1")
		{
			CORE.changeStage( PLAYSTAGE );
			e.preventDefault();
		}
		if(e.code == "F2")
		{
			//CORE.changeStage( EDITORSTAGE );
			e.preventDefault();
		}
		//if(e.code == "KeyR")
		//	GFX.reloadShaders();

		if(e.keyCode == 9) //tab
		{
			//PLAYSTAGE.toggleDebugTab();
			//e.preventDefault();
		}
	},

	takeScreenshot: function()
	{
		var encoding = "image/png";
		var canvas = this.canvas;
		canvas.toBlob(inner,encoding);

		function inner(blob)
		{
			CORE.downloadFile( "screenshot.png", blob, encoding );
		}		
	}
};


