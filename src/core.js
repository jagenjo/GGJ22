//CORE class to handle different stages and resend events 

var CORE = {

	stages: {},
	default_stage: null,
	active_stages: [],
	current_stage: null,
	files: {},

	init: function()
	{
		this.iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
		document.addEventListener( "visibilitychange", this.handleVisibilityChange.bind(this), false);
    

		//init modules
		this.initGFX();
		
		//init stages
		for(var i in this.stages)
			this.stages[i].init();
			
		this.changeToStage( this.default_stage );
		this.enableFileDrop();
	},

	initGFX: function()
	{
		//craete canvas or WebGL
	},

	addStage: function( stage )
	{
		console.log("Stage: " + stage.name );
		if(!this.default_stage || stage.default_stage )
			this.default_stage = stage;
		this.stages[ stage.name ] = stage;
	},
	
	changeToStage: function( stage )
	{
		for(var i = 0; i < this.active_stages.length; ++i)
		{
			var active_stage = this.active_stages[i];
			if( active_stage.onDisable )	
				active_stage.onDisable();
		}
	
		if(stage.constructor === String )
			stage = this.stages[ stage ];
		this.active_stages.length = 1;
		this.active_stages[0] = stage;
		this.current_stage = stage;
		
		if(stage.onEnable)
			stage.onEnable();
	},

	//events to stages
	onmouse: function(e)
	{
		for(var i = 0; i < this.active_stages.length; ++i)
		{
			if(this.active_stages[i].onmouse)
				this.active_stages[i].onmouse(e);
		}
	},

	onmousewheel: function(e)
	{
		for(var i = 0; i < this.active_stages.length; ++i)
		{
			if(this.active_stages[i].onmousewheel)
				this.active_stages[i].onmousewheel(e);
		}
	},

	onkeydown: function(e)
	{
		this.debugKeys(e);

		for(var i = 0; i < this.active_stages.length; ++i)
		{
			if(this.active_stages[i].onkeydown)
				this.active_stages[i].onkeydown(e);
		}
	},

	render: function()
	{
		for(var i = 0; i < this.active_stages.length; ++i)
		{
			if(this.active_stages[i].render)
				this.active_stages[i].render();
		}
	},

	update: function(dt)
	{
		for(var i = 0; i < this.active_stages.length; ++i)
		{
			if(this.active_stages[i].update)
				this.active_stages[i].update(dt);
		}
	},
	
	handleVisibilityChange: function(e)
	{
		//console.log("visibility!");
		for(var i = 0; i < this.active_stages.length; ++i)
		{
			if(this.active_stages[i].onTabEnter)
				this.active_stages[i].onTabEnter( !document.hidden );
		}
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
		for(var i = 0; i < this.active_stages.length; ++i)
		{
			if(this.active_stages[i].onFileDrop)
				this.active_stages[i].onFileDrop(file);
		}
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
			CORE.changeToStage( PLAYSTAGE );
			e.preventDefault();
		}
		if(e.code == "F2")
		{
			CORE.changeToStage( EDITORSTAGE );
			e.preventDefault();
		}
		if(e.code == "KeyR")
			GFX.reloadShaders();
		if(e.code == "KeyF")
			GFX.game_renderer.map_renderer.freeze_frustum = !GFX.game_renderer.map_renderer.freeze_frustum;

		if(e.keyCode == 9) //tab
		{
			PLAYSTAGE.toggleDebugTab();
			e.preventDefault();
		}
	}
};


