
/* File: postprocessing/BloomPass.js */
/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.BloomPass = function ( strength, kernelSize, sigma, resolution ) {

	strength = ( strength !== undefined ) ? strength : 1;
	kernelSize = ( kernelSize !== undefined ) ? kernelSize : 25;
	sigma = ( sigma !== undefined ) ? sigma : 4.0;
	resolution = ( resolution !== undefined ) ? resolution : 256;

	// render targets

	var pars = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat };

	this.renderTargetX = new THREE.WebGLRenderTarget( resolution, resolution, pars );
	this.renderTargetY = new THREE.WebGLRenderTarget( resolution, resolution, pars );

	// copy material

	if ( THREE.CopyShader === undefined )
		console.error( "THREE.BloomPass relies on THREE.CopyShader" );

	var copyShader = THREE.CopyShader;

	this.copyUniforms = THREE.UniformsUtils.clone( copyShader.uniforms );

	this.copyUniforms[ "opacity" ].value = strength;

	this.materialCopy = new THREE.ShaderMaterial( {

		uniforms: this.copyUniforms,
		vertexShader: copyShader.vertexShader,
		fragmentShader: copyShader.fragmentShader,
		blending: THREE.AdditiveBlending,
		transparent: true

	} );

	// convolution material

	if ( THREE.ConvolutionShader === undefined )
		console.error( "THREE.BloomPass relies on THREE.ConvolutionShader" );

	var convolutionShader = THREE.ConvolutionShader;

	this.convolutionUniforms = THREE.UniformsUtils.clone( convolutionShader.uniforms );

	this.convolutionUniforms[ "uImageIncrement" ].value = THREE.BloomPass.blurx;
	this.convolutionUniforms[ "cKernel" ].value = THREE.ConvolutionShader.buildKernel( sigma );

	this.materialConvolution = new THREE.ShaderMaterial( {

		uniforms: this.convolutionUniforms,
		vertexShader:  convolutionShader.vertexShader,
		fragmentShader: convolutionShader.fragmentShader,
		defines: {
			"KERNEL_SIZE_FLOAT": kernelSize.toFixed( 1 ),
			"KERNEL_SIZE_INT": kernelSize.toFixed( 0 )
		}

	} );

	this.enabled = true;
	this.needsSwap = false;
	this.clear = false;

};

THREE.BloomPass.prototype = {

	render: function ( renderer, writeBuffer, readBuffer, delta, maskActive ) {

		if ( maskActive ) renderer.context.disable( renderer.context.STENCIL_TEST );

		// Render quad with blured scene into texture (convolution pass 1)

		THREE.EffectComposer.quad.material = this.materialConvolution;

		this.convolutionUniforms[ "tDiffuse" ].value = readBuffer;
		this.convolutionUniforms[ "uImageIncrement" ].value = THREE.BloomPass.blurX;

		renderer.render( THREE.EffectComposer.scene, THREE.EffectComposer.camera, this.renderTargetX, true );


		// Render quad with blured scene into texture (convolution pass 2)

		this.convolutionUniforms[ "tDiffuse" ].value = this.renderTargetX;
		this.convolutionUniforms[ "uImageIncrement" ].value = THREE.BloomPass.blurY;

		renderer.render( THREE.EffectComposer.scene, THREE.EffectComposer.camera, this.renderTargetY, true );

		// Render original scene with superimposed blur to texture

		THREE.EffectComposer.quad.material = this.materialCopy;

		this.copyUniforms[ "tDiffuse" ].value = this.renderTargetY;

		if ( maskActive ) renderer.context.enable( renderer.context.STENCIL_TEST );

		renderer.render( THREE.EffectComposer.scene, THREE.EffectComposer.camera, readBuffer, this.clear );

	}

};

THREE.BloomPass.blurX = new THREE.Vector2( 0.001953125, 0.0 );
THREE.BloomPass.blurY = new THREE.Vector2( 0.0, 0.001953125 );

/* File: postprocessing/DotScreenPass.js */
/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.DotScreenPass = function ( center, angle, scale ) {

	if ( THREE.DotScreenShader === undefined )
		console.error( "THREE.DotScreenPass relies on THREE.DotScreenShader" );

	var shader = THREE.DotScreenShader;

	this.uniforms = THREE.UniformsUtils.clone( shader.uniforms );

	if ( center !== undefined ) this.uniforms[ "center" ].value.copy( center );
	if ( angle !== undefined ) this.uniforms[ "angle"].value = angle;
	if ( scale !== undefined ) this.uniforms[ "scale"].value = scale;

	this.material = new THREE.ShaderMaterial( {

		uniforms: this.uniforms,
		vertexShader: shader.vertexShader,
		fragmentShader: shader.fragmentShader

	} );

	this.enabled = true;
	this.renderToScreen = false;
	this.needsSwap = true;

};

THREE.DotScreenPass.prototype = {

	render: function ( renderer, writeBuffer, readBuffer, delta ) {

		this.uniforms[ "tDiffuse" ].value = readBuffer;
		this.uniforms[ "tSize" ].value.set( readBuffer.width, readBuffer.height );

		THREE.EffectComposer.quad.material = this.material;

		if ( this.renderToScreen ) {

			renderer.render( THREE.EffectComposer.scene, THREE.EffectComposer.camera );

		} else {

			renderer.render( THREE.EffectComposer.scene, THREE.EffectComposer.camera, writeBuffer, false );

		}

	}

};

/* File: postprocessing/EffectComposer.js */
/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.EffectComposer = function ( renderer, renderTarget ) {

	this.renderer = renderer;

	if ( renderTarget === undefined ) {

		var width = window.innerWidth || 1;
		var height = window.innerHeight || 1;
		var parameters = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat, stencilBuffer: false };

		renderTarget = new THREE.WebGLRenderTarget( width, height, parameters );

	}

	this.renderTarget1 = renderTarget;
	this.renderTarget2 = renderTarget.clone();

	this.writeBuffer = this.renderTarget1;
	this.readBuffer = this.renderTarget2;

	this.passes = [];

	if ( THREE.CopyShader === undefined )
		console.error( "THREE.EffectComposer relies on THREE.CopyShader" );

	this.copyPass = new THREE.ShaderPass( THREE.CopyShader );

};




THREE.EffectComposer.prototype = {

	swapBuffers: function() {

		var tmp = this.readBuffer;
		this.readBuffer = this.writeBuffer;
		this.writeBuffer = tmp;

	},
	
	containsPass: function ( pass ) {
		
		for (var i = 0; i < this.passes.length; i++) {
			if (this.passes[i] == pass) {
				return true;
			}
		}
	
		return false;
	},
	
	removePass: function ( pass ) {
		
		var newPasses = [];
		for (var i = 0; i < this.passes.length; i++) {
			if (this.passes[i] != pass) {
				newPasses.push(this.passes[i]);
			}
		}
		this.passes = newPasses;
	},
	
	addPass: function ( pass ) {

		this.passes.push( pass );

	},

	insertPass: function ( pass, index ) {

		this.passes.splice( index, 0, pass );

	},

	render: function ( delta ) {
		this.writeBuffer = this.renderTarget1;
		this.readBuffer = this.renderTarget2;

		var maskActive = false;

		var pass, i, il = this.passes.length;

		for ( i = 0; i < il; i ++ ) {

			pass = this.passes[ i ];

			if ( !pass.enabled ) continue;

			pass.render( this.renderer, this.writeBuffer, this.readBuffer, delta, maskActive );

			if ( pass.needsSwap ) {

				if ( maskActive ) {

					var context = this.renderer.context;

					context.stencilFunc( context.NOTEQUAL, 1, 0xffffffff );

					this.copyPass.render( this.renderer, this.writeBuffer, this.readBuffer, delta );

					context.stencilFunc( context.EQUAL, 1, 0xffffffff );

				}

				this.swapBuffers();

			}

			if ( pass instanceof THREE.MaskPass ) {

				maskActive = true;

			} else if ( pass instanceof THREE.ClearMaskPass ) {

				maskActive = false;

			}

		}

	},

	reset: function ( renderTarget ) {

		if ( renderTarget === undefined ) {

			renderTarget = this.renderTarget1.clone();

			renderTarget.width = window.innerWidth;
			renderTarget.height = window.innerHeight;

		}

		this.renderTarget1 = renderTarget;
		this.renderTarget2 = renderTarget.clone();

		this.writeBuffer = this.renderTarget1;
		this.readBuffer = this.renderTarget2;

	},

	setSize: function ( width, height ) {

		var renderTarget = this.renderTarget1.clone();

		renderTarget.width = width;
		renderTarget.height = height;

		this.reset( renderTarget );

	}

};

// shared ortho camera

THREE.EffectComposer.camera = new THREE.OrthographicCamera( -1, 1, 1, -1, 0, 1 );

THREE.EffectComposer.quad = new THREE.Mesh( new THREE.PlaneGeometry( 2, 2 ), null );

THREE.EffectComposer.scene = new THREE.Scene();
THREE.EffectComposer.scene.add( THREE.EffectComposer.quad );

/* File: postprocessing/FilmPass.js */
/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.FilmPass = function ( noiseIntensity, scanlinesIntensity, scanlinesCount, grayscale ) {

	if ( THREE.FilmShader === undefined )
		console.error( "THREE.FilmPass relies on THREE.FilmShader" );

	var shader = THREE.FilmShader;

	this.uniforms = THREE.UniformsUtils.clone( shader.uniforms );

	this.material = new THREE.ShaderMaterial( {

		uniforms: this.uniforms,
		vertexShader: shader.vertexShader,
		fragmentShader: shader.fragmentShader

	} );

	if ( grayscale !== undefined )	this.uniforms.grayscale.value = grayscale;
	if ( noiseIntensity !== undefined ) this.uniforms.nIntensity.value = noiseIntensity;
	if ( scanlinesIntensity !== undefined ) this.uniforms.sIntensity.value = scanlinesIntensity;
	if ( scanlinesCount !== undefined ) this.uniforms.sCount.value = scanlinesCount;

	this.enabled = true;
	this.renderToScreen = false;
	this.needsSwap = true;

};

THREE.FilmPass.prototype = {

	render: function ( renderer, writeBuffer, readBuffer, delta ) {

		this.uniforms[ "tDiffuse" ].value = readBuffer;
		this.uniforms[ "time" ].value += delta;

		THREE.EffectComposer.quad.material = this.material;

		if ( this.renderToScreen ) {

			renderer.render( THREE.EffectComposer.scene, THREE.EffectComposer.camera );

		} else {

			renderer.render( THREE.EffectComposer.scene, THREE.EffectComposer.camera, writeBuffer, false );

		}

	}

};

/* File: postprocessing/MaskPass.js */
/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.MaskPass = function ( scene, camera ) {

	this.scene = scene;
	this.camera = camera;

	this.enabled = true;
	this.clear = true;
	this.needsSwap = false;

	this.inverse = false;

};

THREE.MaskPass.prototype = {

	render: function ( renderer, writeBuffer, readBuffer, delta ) {

		var context = renderer.context;

		// don't update color or depth

		context.colorMask( false, false, false, false );
		context.depthMask( false );

		// set up stencil

		var writeValue, clearValue;

		if ( this.inverse ) {

			writeValue = 0;
			clearValue = 1;

		} else {

			writeValue = 1;
			clearValue = 0;

		}

		context.enable( context.STENCIL_TEST );
		context.stencilOp( context.REPLACE, context.REPLACE, context.REPLACE );
		context.stencilFunc( context.ALWAYS, writeValue, 0xffffffff );
		context.clearStencil( clearValue );

		// draw into the stencil buffer

		renderer.render( this.scene, this.camera, readBuffer, this.clear );
		renderer.render( this.scene, this.camera, writeBuffer, this.clear );

		// re-enable update of color and depth

		context.colorMask( true, true, true, true );
		context.depthMask( true );

		// only render where stencil is set to 1

		context.stencilFunc( context.EQUAL, 1, 0xffffffff );  // draw if == 1
		context.stencilOp( context.KEEP, context.KEEP, context.KEEP );

	}

};


THREE.ClearMaskPass = function () {

	this.enabled = true;

};

THREE.ClearMaskPass.prototype = {

	render: function ( renderer, writeBuffer, readBuffer, delta ) {

		var context = renderer.context;

		context.disable( context.STENCIL_TEST );

	}

};

/* File: postprocessing/RenderPass.js */
/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.RenderPass = function ( scene, camera, overrideMaterial, clearColor, clearAlpha ) {

	this.scene = scene;
	this.camera = camera;

	this.overrideMaterial = overrideMaterial;

	this.clearColor = clearColor;
	this.clearAlpha = ( clearAlpha !== undefined ) ? clearAlpha : 1;

	this.oldClearColor = new THREE.Color();
	this.oldClearAlpha = 1;

	this.enabled = true;
	this.clear = true;
	this.needsSwap = false;

};

THREE.RenderPass.prototype = {

	__render: function (scene, renderer, writeBuffer, readBuffer, delta, clear ) {
		scene.overrideMaterial = this.overrideMaterial;

		if ( this.clearColor ) {

			this.oldClearColor.copy( renderer.getClearColor() );
			this.oldClearAlpha = renderer.getClearAlpha();

			renderer.setClearColor( this.clearColor, this.clearAlpha );

		}
		

		renderer.render( scene, this.camera, readBuffer, clear );
		
		
		if ( this.clearColor ) {

			renderer.setClearColor( this.oldClearColor, this.oldClearAlpha );

		}

		scene.overrideMaterial = null;
		
	},


	render: function ( renderer, writeBuffer, readBuffer, delta ) {
		

		if (this.scene instanceof Array) {
			for (var i = 0; i < this.scene.length; i++) {
				this.__render(this.scene[i], renderer, writeBuffer, readBuffer, delta, (this.clear && i == 0));
			}
		} else {
			this.__render(this.scene, renderer, writeBuffer, readBuffer, delta, this.clear);
		}

	}

};

/* File: postprocessing/SavePass.js */
/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.SavePass = function ( renderTarget ) {

	if ( THREE.CopyShader === undefined )
		console.error( "THREE.SavePass relies on THREE.CopyShader" );

	var shader = THREE.CopyShader;

	this.textureID = "tDiffuse";

	this.uniforms = THREE.UniformsUtils.clone( shader.uniforms );

	this.material = new THREE.ShaderMaterial( {

		uniforms: this.uniforms,
		vertexShader: shader.vertexShader,
		fragmentShader: shader.fragmentShader

	} );

	this.renderTarget = renderTarget;

	if ( this.renderTarget === undefined ) {

		this.renderTargetParameters = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat, stencilBuffer: false };
		this.renderTarget = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, this.renderTargetParameters );

	}

	this.enabled = true;
	this.needsSwap = false;
	this.clear = false;

};

THREE.SavePass.prototype = {

	render: function ( renderer, writeBuffer, readBuffer, delta ) {

		if ( this.uniforms[ this.textureID ] ) {

			this.uniforms[ this.textureID ].value = readBuffer;

		}

		THREE.EffectComposer.quad.material = this.material;

		renderer.render( THREE.EffectComposer.scene, THREE.EffectComposer.camera, this.renderTarget, this.clear );

	}

};

/* File: postprocessing/ShaderPass.js */
/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.ShaderPass = function ( shader, textureID ) {

	this.textureID = ( textureID !== undefined ) ? textureID : "tDiffuse";

	this.uniforms = THREE.UniformsUtils.clone( shader.uniforms );

	this.material = new THREE.ShaderMaterial( {

		uniforms: this.uniforms,
		vertexShader: shader.vertexShader,
		fragmentShader: shader.fragmentShader

	} );

	this.renderToScreen = false;

	this.enabled = true;
	this.needsSwap = true;
	this.clear = false;

};

THREE.ShaderPass.prototype = {

	render: function ( renderer, writeBuffer, readBuffer, delta ) {

		if ( this.uniforms[ this.textureID ] ) {

			this.uniforms[ this.textureID ].value = readBuffer;

		}

		THREE.EffectComposer.quad.material = this.material;

		if ( this.renderToScreen ) {

			renderer.render( THREE.EffectComposer.scene, THREE.EffectComposer.camera );

		} else {

			renderer.render( THREE.EffectComposer.scene, THREE.EffectComposer.camera, writeBuffer, this.clear );

		}

	}

};

/* File: postprocessing/TexturePass.js */
/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.TexturePass = function ( texture, opacity ) {

	if ( THREE.CopyShader === undefined )
		console.error( "THREE.TexturePass relies on THREE.CopyShader" );

	var shader = THREE.CopyShader;

	this.uniforms = THREE.UniformsUtils.clone( shader.uniforms );

	this.uniforms[ "opacity" ].value = ( opacity !== undefined ) ? opacity : 1.0;
	this.uniforms[ "tDiffuse" ].value = texture;

	this.material = new THREE.ShaderMaterial( {

		uniforms: this.uniforms,
		vertexShader: shader.vertexShader,
		fragmentShader: shader.fragmentShader

	} );

	this.enabled = true;
	this.needsSwap = false;

};

THREE.TexturePass.prototype = {

	render: function ( renderer, writeBuffer, readBuffer, delta ) {

		THREE.EffectComposer.quad.material = this.material;

		renderer.render( THREE.EffectComposer.scene, THREE.EffectComposer.camera, readBuffer );

	}

};

/* File: postprocessing/GodRaysPass.js */


// See http://threejs.org/examples/webgl_postprocessing_godrays.html
THREE.GodRaysPass = function(config, primaryScene, secondaryScene, camera) {
	
	var scene = primaryScene;
	this.scene = scene;
	this.camera = camera;
	this.config = config;
	
	this.enabled = true;
	this.clear = true;
	this.needsSwap = false;
	
	var scope = this;
	
	
	
	var bgColor = 0x000000;
	var sunColor = 0xffee00;
	var postprocessing = { enabled : true };
	
	var width = window.innerWidth || 2;
	var height = window.innerHeight || 2;
	
	var materialDepth = new THREE.MeshDepthMaterial();
	var projector = new THREE.Projector();
	
	postprocessing.scene = new THREE.Scene();

	postprocessing.camera = new THREE.OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2,  height / 2, height / - 2, -10000, 10000 );
	postprocessing.camera.position.z = 100;

	postprocessing.scene.add( postprocessing.camera );

	var pars = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat };
	postprocessing.rtTextureColors = new THREE.WebGLRenderTarget( window.innerWidth, height, pars );

	// Switching the depth formats to luminance from rgb doesn't seem to work. I didn't
	// investigate further for now.
	// pars.format = THREE.LuminanceFormat;

	// I would have this quarter size and use it as one of the ping-pong render
	// targets but the aliasing causes some temporal flickering

	postprocessing.rtTextureDepth = new THREE.WebGLRenderTarget( window.innerWidth, height, pars );

	// Aggressive downsize god-ray ping-pong render targets to minimize cost

	var w = window.innerWidth / 4.0;
	var h = height / 4.0;
	postprocessing.rtTextureGodRays1 = new THREE.WebGLRenderTarget( w, h, pars );
	postprocessing.rtTextureGodRays2 = new THREE.WebGLRenderTarget( w, h, pars );

	// god-ray shaders

	var godraysGenShader = THREE.ShaderGodRays[ "godrays_generate" ];
	postprocessing.godrayGenUniforms = THREE.UniformsUtils.clone( godraysGenShader.uniforms );
	postprocessing.materialGodraysGenerate = new THREE.ShaderMaterial( {

		uniforms: postprocessing.godrayGenUniforms,
		vertexShader: godraysGenShader.vertexShader,
		fragmentShader: godraysGenShader.fragmentShader

	} );

	var godraysCombineShader = THREE.ShaderGodRays[ "godrays_combine" ];
	postprocessing.godrayCombineUniforms = THREE.UniformsUtils.clone( godraysCombineShader.uniforms );
	postprocessing.materialGodraysCombine = new THREE.ShaderMaterial( {

		uniforms: postprocessing.godrayCombineUniforms,
		vertexShader: godraysCombineShader.vertexShader,
		fragmentShader: godraysCombineShader.fragmentShader

	} );

	/*
	var godraysFakeSunShader = THREE.ShaderGodRays[ "godrays_fake_sun" ];
	postprocessing.godraysFakeSunUniforms = THREE.UniformsUtils.clone( godraysFakeSunShader.uniforms );
	postprocessing.materialGodraysFakeSun = new THREE.ShaderMaterial( {

		uniforms: postprocessing.godraysFakeSunUniforms,
		vertexShader: godraysFakeSunShader.vertexShader,
		fragmentShader: godraysFakeSunShader.fragmentShader

	} );

	postprocessing.godraysFakeSunUniforms.bgColor.value.setHex( bgColor );
	postprocessing.godraysFakeSunUniforms.sunColor.value.setHex( sunColor );
	*/
	
	postprocessing.godrayCombineUniforms.fGodRayIntensity.value = 0.75;

	postprocessing.quad = new THREE.Mesh( new THREE.PlaneGeometry( window.innerWidth, height ), postprocessing.materialGodraysGenerate );
	postprocessing.quad.position.z = -9900;
	postprocessing.scene.add( postprocessing.quad );

	this.setIntensity = function(intensity) {
		postprocessing.godrayCombineUniforms.fGodRayIntensity.value = intensity;
	};
	
	function getSunPosition(type, direction) {
		var position = null;
		
		if (type === "Directional") {
			position = new THREE.Vector3(-5000.0, 0, 0);
			position.rotateY(direction*(Math.PI/180.0));
		} else {
			position = new THREE.Vector3(0, 0, 0);
		}

		return position;
	}
	
	this.render = function(renderer, writeBuffer, readBuffer, delta, clear) {
		//console.info("Rendering God Rays...");
		//renderer.render( scene, camera, readBuffer, true );
		
		//return;
		// Find the screenspace position of the sun
		//var sunPosition = new THREE.Vector3(0, 0, 0);
		var sunPosition = getSunPosition(this.config.lightingType, this.config.sunlightDirection);
		var screenSpacePosition = new THREE.Vector3(0, 0, 0);
		screenSpacePosition.copy( sunPosition );
		projector.projectVector( screenSpacePosition, camera );

		screenSpacePosition.x = ( screenSpacePosition.x + 1 ) / 2;
		screenSpacePosition.y = ( screenSpacePosition.y + 1 ) / 2;

		// Give it to the god-ray and sun shaders

		postprocessing.godrayGenUniforms[ "vSunPositionScreenSpace" ].value.x = screenSpacePosition.x;
		postprocessing.godrayGenUniforms[ "vSunPositionScreenSpace" ].value.y = screenSpacePosition.y;

		//postprocessing.godraysFakeSunUniforms[ "vSunPositionScreenSpace" ].value.x = screenSpacePosition.x;
		//postprocessing.godraysFakeSunUniforms[ "vSunPositionScreenSpace" ].value.y = screenSpacePosition.y;

		// -- Draw sky and sun --
		renderer.clearTarget( postprocessing.rtTextureColors, true, true, false );
		// Clear colors and depths, will clear to sky color
		/*
		renderer.clearTarget( postprocessing.rtTextureColors, true, true, false );

		// Sun render. Runs a shader that gives a brightness based on the screen
		// space distance to the sun. Not very efficient, so i make a scissor
		// rectangle around the suns position to avoid rendering surrounding pixels.

		var sunsqH = 0.74 * height; // 0.74 depends on extent of sun from shader
		var sunsqW = 0.74 * height; // both depend on height because sun is aspect-corrected

		screenSpacePosition.x *= window.innerWidth;
		screenSpacePosition.y *= height;

		renderer.setScissor( screenSpacePosition.x - sunsqW / 2, screenSpacePosition.y - sunsqH / 2, sunsqW, sunsqH );
		renderer.enableScissorTest( true );

		postprocessing.godraysFakeSunUniforms[ "fAspect" ].value = window.innerWidth / height;

		postprocessing.scene.overrideMaterial = postprocessing.materialGodraysFakeSun;
		renderer.render( postprocessing.scene, postprocessing.camera, postprocessing.rtTextureColors );

		renderer.enableScissorTest( false );
*/
		// -- Draw scene objects --

		// Colors

		scene.overrideMaterial = null;
		renderer.render( secondaryScene, camera, postprocessing.rtTextureColors );
		renderer.render( scene, camera, postprocessing.rtTextureColors );
		
		
		
		// Depth

		scene.overrideMaterial = materialDepth;
		renderer.render( scene, camera, postprocessing.rtTextureDepth, true );

		// -- Render god-rays --

		// Maximum length of god-rays (in texture space [0,1]X[0,1])

		var filterLen = 1.0;

		// Samples taken by filter

		var TAPS_PER_PASS = 6.0;

		// Pass order could equivalently be 3,2,1 (instead of 1,2,3), which
		// would start with a small filter support and grow to large. however
		// the large-to-small order produces less objectionable aliasing artifacts that
		// appear as a glimmer along the length of the beams

		// pass 1 - render into first ping-pong target

		var pass = 1.0;
		var stepLen = filterLen * Math.pow( TAPS_PER_PASS, -pass );

		postprocessing.godrayGenUniforms[ "fStepSize" ].value = stepLen;
		postprocessing.godrayGenUniforms[ "tInput" ].value = postprocessing.rtTextureDepth;

		postprocessing.scene.overrideMaterial = postprocessing.materialGodraysGenerate;

		renderer.render( postprocessing.scene, postprocessing.camera, postprocessing.rtTextureGodRays2 );

		// pass 2 - render into second ping-pong target

		pass = 2.0;
		stepLen = filterLen * Math.pow( TAPS_PER_PASS, -pass );

		postprocessing.godrayGenUniforms[ "fStepSize" ].value = stepLen;
		postprocessing.godrayGenUniforms[ "tInput" ].value = postprocessing.rtTextureGodRays2;

		renderer.render( postprocessing.scene, postprocessing.camera, postprocessing.rtTextureGodRays1  );

		// pass 3 - 1st RT

		pass = 3.0;
		stepLen = filterLen * Math.pow( TAPS_PER_PASS, -pass );

		postprocessing.godrayGenUniforms[ "fStepSize" ].value = stepLen;
		postprocessing.godrayGenUniforms[ "tInput" ].value = postprocessing.rtTextureGodRays1;

		renderer.render( postprocessing.scene, postprocessing.camera , postprocessing.rtTextureGodRays2  );

		// final pass - composite god-rays onto colors

		postprocessing.godrayCombineUniforms["tColors"].value = postprocessing.rtTextureColors;
		postprocessing.godrayCombineUniforms["tGodRays"].value = postprocessing.rtTextureGodRays2;

		postprocessing.scene.overrideMaterial = postprocessing.materialGodraysCombine;

		renderer.render( postprocessing.scene, postprocessing.camera, readBuffer, true);
		postprocessing.scene.overrideMaterial = null;
	};
};