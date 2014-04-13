var gui = null;
var tickController = null;
var engine = null;
var timer = null;
var earth = null;
var earthOrbit = null;
var satelliteMap = {};
var axisLines = null;

var mouse = new THREE.Vector2(), INTERSECTED;
var selectedSatellite = null;

var projector = new THREE.Projector();


var appOptions = {
	guiOpacity : 0.9
};

var modelOptions = {
	pathsVisible : true,
	
	timeWarp : 25000
};

var satelliteArray = [];
var pilotSatellite = false;
var camera = null;
var cameraNeedsReset = false;
var newlySelectedSatellite = false;

var categories = [
	{ category : "STATIONS", description : "Space Stations", enabled : true },
	{ category : "SCIENCE", description : "Science", enabled : false },
	{ category : "VISUAL", description : "Potentially Visible", enabled : true },
	{ category : "AMATEUR", description : "Amateur Radio", enabled : false },
	{ category : "GEO", description : "Geostationary", enabled : true },
	{ category : "GPS", description : "GPS", enabled : false },
	{ category : "TLE-NEW", description : "Recent Launches", enabled : false },
	{ category : "BEIDOU", description : "Beidou", enabled : false },
	{ category : "CUBESAT", description : "CubeSats", enabled : false },
	{ category : "DMC", description : "Disaster Monitoring", enabled : false },
	{ category : "EDUCATION", description : "Education", enabled : false },
	{ category : "ENGINEERING", description : "Engineering", enabled : false },
	{ category : "GALILEO", description : "Galileo", enabled : false },
	{ category : "GEODETIC", description : "Geodetic", enabled : false },
	{ category : "GLO-OPS", description : "Glonass Operational", enabled : false },
	{ category : "GLOBALSTAR", description : "Globalstar", enabled : false },
	{ category : "GOES", description : "GOES", enabled : false },
	{ category : "GORIZONT", description : "Gorizont", enabled : false },
	{ category : "GPS-OPS", description : "GPS Operational", enabled : false },
	{ category : "INTELSAT", description : "Intelsat", enabled : false },
	{ category : "IRIDIUM", description : "Iridium", enabled : false },
	{ category : "MILITARY", description : "Misc. Military", enabled : false },
	{ category : "MOLNIYA", description : "Molniya", enabled : false },
	{ category : "MUSSON", description : "Russian LEO Nav", enabled : false },
	{ category : "NNSS", description : "Navy Nav System", enabled : false },
	{ category : "NOAA", description : "NOAA", enabled : false },
	{ category : "ORBCOMM", description : "Orbcomm", enabled : false },
	{ category : "OTHER", description : "Other", enabled : false },
	{ category : "OTHER-COMM", description : "Other Comm.", enabled : false },
	{ category : "RADAR", description : "Radar Calibration", enabled : false },
	{ category : "RADUGA", description : "Raduga", enabled : false },
	{ category : "RESOURCE", description : "Earth Resources", enabled : false },
	{ category : "SARSAT", description : "Search & Rescue", enabled : false },
	{ category : "SBAS", description : "Sat-Based Aug.", enabled : false },
	{ category : "TDRSS", description : "Tracking & Data Relay", enabled : false },
	{ category : "WEATHER", description : "Weather", enabled : false },
	{ category : "X-COMM", description : "Experimental Comm.", enabled : false }/*,
	{ category : "1999-025", description : "FENGYUN 1C Debris", enabled : false },
	{ category : "IRIDIUM-33-DEBRIS", description : "Iridium 33 Debris", enabled : false },
	{ category : "COSMOS-2251-DEBRIS", description : "Cosmos 2251 Debris", enabled : false },
	{ category : "2012-044", description : "BREEZE-M R/B Breakup", enabled : false }*/
	//{ category : "", description : "", enabled : false },
];

var categoryOptions = {

};
	
function setLoadingStatus(status)
{
	$( "#loading-status" ).html(status);
}

function displayErrorMessage(title, body)
{
	console.error("Error: " + title + ": " + body);
	
	$( "#error-message-dialog" ).attr("title", title);
	$( "#error-message-title" ).text(title);
	$( "#error-message-body" ).text(body);
	
	$( "#error-message-dialog" ).dialog( "open" );
	
}	

function isUserMobile()
{
	return /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent);
}
			


jQuery.fn.center = function () {
    this.css("position","absolute");
    this.css("top", Math.max(0, (($(window).height() - $(this).outerHeight()) / 2) + 
                                                $(window).scrollTop()) + "px");
    this.css("left", Math.max(0, (($(window).width() - $(this).outerWidth()) / 2) + 
                                                $(window).scrollLeft()) + "px");
    return this;
}

function rgbToHex(r, g, b) {
	return (new THREE.Color()).setRGB(r, g, b).getHex();
}

function getOrbitColor(f)
{
	var r = (1 * f) + (0 * (1 - f));
	var g = (0 * f) + (1 * (1 - f));
	var b = 0;
	return rgbToHex(r, g, b);
}


function addToPrimaryScene(obj) {
	engine.context.objects.push(obj);
	engine.context.primaryScene.add(obj);
}

function satelliteHasCategory(satellite, category) {
	for (var i = 0; i < satellite.categories.length; i++) {
		if (satellite.categories[i] == category) {
			return true;
		}
	}
	return false;
}

function getOrbitOpacity(satellite) {
	if (satelliteHasCategory(satellite, "STATIONS")) {
		return 1.0;
	}
	
	return 0.25;
}

function getOrbitColor(satellite) {

	if (satellite.orbit.isDebris == "yes") {
		return 0xFF0000;
	} else if (satelliteHasCategory(satellite, "GEO")) {
		return 0x00FF00;
	} else if (satelliteHasCategory(satellite, "MILITARY")) {
		return 0xFFFF00;
	} else if (satelliteHasCategory(satellite, "STATIONS")) {
		return 0xFFFFFF;
	}

	return 0xFFFFFF;
}

function createOrbitor(context, satellite, tickController) {

	
	satellite.orbit.scale = 1.0;
	satellite.orbit.opacity = getOrbitOpacity(satellite);
	satellite.orbit.semiMajorAxis = satellite.orbit.semiMajorAxis / 6371 * 200;
	satellite.orbit.color = getOrbitColor(satellite);
	
	var texture = (satellite.orbit.name == "ISS (ZARYA)") ? "/img/sprites/iss_100x100.png" : "/img/sprites/satellite_100x100.png";
	var size = (satellite.orbit.name == "ISS (ZARYA)") ? 25 : 15;
	satellite.dot = new KMG.DotPlotObject(context, {color:0xFF0000, size: size, texture: texture });
	satellite.dot.position.set(-200, 0, 0);
	addToPrimaryScene(satellite.dot);
	
	var orbit = new KMG.EllipticalOrbit(satellite.orbit);
	
	satellite.path = new KMG.OrbitPathLine(context, satellite.orbit, orbit);

	
	addToPrimaryScene(satellite.path);
	
	satellite.orbiter =  new KMG.EllipticalOrbiter(context, satellite.dot, 1.0, 0.1 / 365.25, orbit, null, tickController, true);
	
}


function isSatelliteVisible(satellite) {
	
	for (var i = 0; i < satellite.categories.length; i++) {
		var category = satellite.categories[i];
		if (categoryOptions[category]) {
			return true;
		}
	}
	return false;
};

function setCategoryVisibility(property, visible) {
	
	for (key in satelliteMap) {
		var satellite = satelliteMap[key];
		
		if (satelliteHasCategory(satellite, property)) {
			satellite.dot.setVisibility(isSatelliteVisible(satellite));
			satellite.path.setVisibility(isSatelliteVisible(satellite));
		}
		
	}

}

function setPathVisibility(visible) {
	for (key in satelliteMap) {
		var satellite = satelliteMap[key];
			
		satellite.path.setVisibility(isSatelliteVisible(satellite) && visible);
		
	}
}

function onDocumentMouseDown( event ) {

	console.log('onDocumentMouseDown');

	// tickController.speed = 1 + (1000 * modelOptions.tickDelayGui);

	// $("#date-container").text(moment(tickController.tickDate).format("LLL"));
	var context = engine.context;
	var mouseOverRadius = 0.033;
	
	var vector = new THREE.Vector3( mouse.x, mouse.y, 1 );
	for(var key in satelliteMap) {
		var satellite = satelliteMap[key];
		
		var pos = satellite.dot.position.clone();
		projector.projectVector( pos, context.camera );
		
		if (vector.distanceTo(pos) <= mouseOverRadius && satellite.dot.visible) {
			if (!satellite.nameSprite) {
				satellite.nameSprite = new KMG.BillBoardTextObject(context, satellite.name, {});
				context.primaryScene.add(satellite.nameSprite);
			}

			satellite.nameSprite.position = satellite.dot.position;
			// selectedSatellite = satellite;
			// context.camera.position.x = satellite.dot.position.x;
			// context.camera.position.y = satellite.dot.position.y;
			// context.camera.position.z = satellite.dot.position.z;

			// var vectorPointingAtEarth = new THREE.Vector3(-1*satellite.dot.position.x, -1*satellite.dot.position.y, -1*satellite.dot.position.z);
			// context.camera.lookAt(vectorPointingAtEarth);

			// console.log('nameSprite is attaching');
		
		} else if (satellite.nameSprite) {
			context.primaryScene.remove(satellite.nameSprite);
			satellite.nameSprite = null;
		
		}
		
	}
	
	
	return false;	
	
}

function setCameraToSatellite(satellite) {
	// console.log('setCameraToSatellite');
	if(!pilotSatellite) {
		console.log('setCameraToSatellite - !pilotSatellite');
		return; //We dont need to set camera if we dont have toggle enabled
	}
	var context = engine.context;
	selectedSatellite = satellite;
	context.camera.position.x = satellite.dot.position.x;
	context.camera.position.y = satellite.dot.position.y;
	context.camera.position.z = satellite.dot.position.z;

	if(newlySelectedSatellite) {
		var vectorPointingAtEarth = new THREE.Vector3(-1*satellite.dot.position.x, -1*satellite.dot.position.y, -1*satellite.dot.position.z);
		context.camera.lookAt(vectorPointingAtEarth);
		newlySelectedSatellite = false;
	}
}

function resetCamera() {
	console.log('resetCamera');
	var camera = engine.context.camera;
	camera.position.x = 0;
	camera.position.y = 0;
	camera.position.z = 700;
	camera.lookAt(new THREE.Vector3(0, 0 , 100));
}

function getSatelliteByName(satName) {
	var satToReturn = null;
	for(var key in satelliteMap) {
		var satellite = satelliteMap[key];
		if(satellite.name == satName) {
			satToReturn = satellite;
			break;
		}
	}
	return satToReturn;
}

function createMoon(planet, moonConfig)
{
	planet.addMoon(moonConfig);

	// if (createMoonGui) {
	// 	createMoonGui(moonConfig);
	// }
		
	planet.context.configChanged = true;
};
	



$(function() {

	$("body").on({
		mousemove : function(event) {
			event.preventDefault();
			mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
			mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
		}
	});
	
	setLoadingStatus("Setting up viewport&hellip;");

	document.addEventListener( 'mousedown', onDocumentMouseDown, false );

	
	var visibleAboutDialogSection = function() {
		if ($( "#about-dialog-about" ).css("display") === "block") {
			return $( "#about-dialog-about" );
		} else if ($( "#about-dialog-instructions" ).css("display") === "block") {
			return $( "#about-dialog-instructions" );
		} else if ($( "#about-dialog-changes" ).css("display") === "block") {
			return $( "#about-dialog-changes" );
		} else {
			return null;
		}
	};
	
	var onAboutDialogSection = function(section) {
	
		var visibleSection = visibleAboutDialogSection();
		if (visibleSection !== null) {
			var options = {};
			visibleSection.hide( "fade", 200, function() {
				$( "#about-dialog-"+section ).removeAttr( "style" ).hide().fadeIn(200);
			});
		} else {
			$( "#about-dialog-"+section ).removeAttr( "style" ).hide().fadeIn(200);
		}
	};
	
	$( "#about-dialog-radios" ).buttonset();
	$( "#radio_about" ).change(function(e) {
		onAboutDialogSection("about");
	});
	$( "#radio_instructions" ).change(function(e) {
		onAboutDialogSection("instructions");
	});
	$( "#radio_changes" ).change(function(e) {
		onAboutDialogSection("changes");
	});
	$( "#about-dialog-about" ).css("display", "none");
	$( "#about-dialog-instructions" ).css("display", "none");
	$( "#about-dialog-changes" ).css("display", "none");
	onAboutDialogSection("about");
	$("input:radio[name='about_dialog_radio'][value='about']").prop("checked", true);
	
	
	
	$( "#dialog" ).dialog({
		width: 600,
		autoOpen: false,
		show: {
			effect: "drop",
			duration: 400
		},
		hide: {
			effect: "drop",
			duration: 400
		}
	});
	$( "#about-link" ).click(function() {
		
		$( "#dialog" ).dialog( "open" );

	});
	
	
	$( "#error-message-dialog" ).dialog({
		width: 600,
		autoOpen: false,
		modal: true,
		show: {
			effect: "drop",
			duration: 400
		},
		hide: {
			effect: "drop",
			duration: 400
		},
		buttons: {
			Ok : function() {
				$( this ).dialog( "close" );
			}
		}
	});

	if (!window.WebGLRenderingContext || !Detector.webgl) {
		Detector.addGetWebGLMessage();
	}
	
	setLoadingStatus("Loading Earth...");
	
	var tex = {
		name : "earth",
		texture : "/img/planets_small/earth.jpg",
		bumpMap : "",
		normalMap : "/img/flat_normalmap_128x64.jpg",
		specularMap : "/img/earth_specularmap_flat_1024x512.jpg",
		enabled : true
	};
	KMG.textures.push(tex);
	
	var config = KMG.Util.extend({}, KMG.DefaultConfig);
	config.initWithShadows = false;
	
	//config.backgroundType = "image";
	//config.backgroundImage = "Yale Bright Star Map";
	//config.backgroundImageType = "sphere";
	config.textureResolution = "1024x512";
	config.noPlanet = true;
	config.enableFps = false;
	config.sunlightDirection = 180;
	config.starQuantity = 9.5;
	
	var sceneReadyCallback = function() {
		
	};
	var contextLostCallback = function(event) {
		console.error("UI: WebGL Context Lost, displaying notification");
		displayErrorMessage("WebGL Error", "WebGL Context Lost! Please refresh to restart the application");
	};
	var sceneCallbacks = {
		sceneReadyCallback : sceneReadyCallback,
		contextLostCallback : contextLostCallback
	};
	
	var filterTo = AppEnv.getUrlVar("sat");
	if (filterTo) {
		for (var i = 0; i < categories.length; i++) {
			categories[i].enabled = true;
		}
	
	}
	
	//Click handler for adjusting camera to satellite
	
	engine = new KMG.Planet(document.getElementById( 'container' ), config, sceneCallbacks);
	var context = engine.context;
	camera = context.camera;
		
	
	earthOrbit = new KMG.EllipticalOrbit(KMG.OrbitDefinitions.earth);
	var earthConfig = KMG.Util.extend({radius:200, fog:false, scale:1.0, texture:"earth", material:KMG.MaterialPhong}, KMG.DefaultTexturedSphereOptions);
	earth = new KMG.TexturedSphereObject(context, earthConfig);
	addToPrimaryScene(earth);

	var moonConfig = KMG.Util.extend({}, KMG.DefaultMoonConfig);
	createMoon(engine, moonConfig);



	
	//axisLines = new KMG.LibrationAxisLines(context, {});
	//addToPrimaryScene(axisLines);

	tickController = new KMG.TimeBasedTickController(modelOptions.timeWarp);
	tickController.resetToToday();
	context.objects.push(tickController);

	setLoadingStatus("Loading Satellite Database...");
	
	
	var sceneScript = new function() {
		var scope = this;
		var planet, config, context;
		
		var isVisible = false;
		
		var projector = new THREE.Projector();
		var mouseOverRadius = 0.033;
		
		this.onScriptInitialize = function(_planet, _config, _context) {
			planet = _planet;
			config = _config;
			context = _context;
			
		};
		
		
		
		
		this.onFrameHandler = function(planet, config, context) {

			// console.log('onFrameHandler firing');

			tickController.speed = 1 + (1000 * modelOptions.tickDelayGui);

			$("#date-container").text(moment(tickController.tickDate).format("LLL"));
			
			// var vector = new THREE.Vector3( mouse.x, mouse.y, 1 );
			//Uncomment this code to have mouse overs to show names of satellites. 
			//Personally, its laggy, so I've commented out.
			// for(var key in satelliteMap) {
			// 	var satellite = satelliteMap[key];
				
			// 	var pos = satellite.dot.position.clone();
			// 	projector.projectVector( pos, context.camera );
				
			// 	if (vector.distanceTo(pos) <= mouseOverRadius && satellite.dot.visible) {
			// 		if (!satellite.nameSprite) {
			// 			satellite.nameSprite = new KMG.BillBoardTextObject(context, satellite.name, {});
			// 			context.primaryScene.add(satellite.nameSprite);
			// 		}

			// 		satellite.nameSprite.position = satellite.dot.position;
			// 		// console.log('nameSprite is attaching');
				
			// 	} else if (satellite.nameSprite) {
			// 		context.primaryScene.remove(satellite.nameSprite);
			// 		satellite.nameSprite = null;
				
			// 	}
				
			// }
			if(pilotSatellite) {
				setCameraToSatellite(selectedSatellite);
				// newlySelectedSatellite = false;
			} else if(cameraNeedsReset) {
				resetCamera();
				cameraNeedsReset = false;
			}
			
			
			return false;	
		};
		
		
		function orbitAngleToZAxis(pos) {
			var p = new THREE.Vector3(pos.x, 0, pos.z);
			p.normalize();

			// Relative to a line along the positive z-axis
			var angle = p.angleTo(new THREE.Vector3(0, 0, 100)) ;
			if (p.x < 0) {
				angle = KMG.RAD_180 + (KMG.RAD_180 - angle);
			}
			return angle;
		}

		var sun = new KMG.SunlightPositioning();
		var iauRotation = new KMG.IAUEarthRotation();
		this.onRenderHandler = function(planet, config, context) {
			

			var earthPos = earthOrbit.positionAtTime(tickController.tickJulian);
			var sunAngle = orbitAngleToZAxis(earthPos);
			
			var inclination = (new THREE.Vector3(earthPos.x, 0, earthPos.z)).angleTo(earthPos);
			if (earthPos.y > 0) {
				inclination *= -1;
			}
			
			
			
			var rotationalQ = iauRotation.computeRotationalQuaternion(tickController.tickJulian);
			
			earth.rotation.setFromQuaternion(rotationalQ);
			earth.updateMatrix();

			context.lights.primaryDirectional.position = new THREE.Vector3(0.0, 0, -149597870.700);
			context.lights.primaryDirectional.position.applyEuler(new THREE.Euler(0, sunAngle, 0, 'YXZ'));

			for(var key in satelliteMap) {
				var satellite = satelliteMap[key];
				if (satellite.dot.visible) {
					satellite.dot.position.applyQuaternion(rotationalQ.noMeridian);
					satellite.path.rotation.setFromQuaternion(rotationalQ.noMeridian);
				}
			}
			
		};
	};
	engine.applySceneScriptInstance(sceneScript);
	
	var starFlareNames = [];
	for (var i = 0; i < KMG.starFlares.length; i++) {
		starFlareNames[i] = KMG.starFlares[i].name;
	}

	
	
	var guiChangeListener = function() {
		
	};
	gui = new KMG.GUI(config, guiChangeListener);
		
	gui.onVisibilityChanged = function(visible) {
		var setDisplay = visible ? "block" : "none";
		$("#page-title-container").css("display", setDisplay);
		$("#inline-instructions").css("display", setDisplay);
		$("#instructions-link-container").css("display", setDisplay);
		$("#stats").css("display", setDisplay);
		$("#ce-left").css("display", setDisplay);
		$("#share-buttons").css("display", setDisplay);
	};
	
	
	var optionsGui = gui.left.createBlock("Options", appOptions, function() {
		gui.setOpacity(appOptions.guiOpacity);
	});
	optionsGui.setExpandedState(KMG.Closed);
	optionsGui.addAction('Hide Controls', function() {
		gui.setVisible(false);
	});
	optionsGui.addRange('guiOpacity', 'GUI Transparency:', 0.0, 1.0, 0.01);
	
	
	
	var modelGui = gui.left.createBlock("Model", modelOptions);
	

	var startLabel = (AppEnv.getUrlVar("start")) ? "Pause" : 'Start Animation';
	modelGui.addAction(startLabel, function(e, btn) {
		if (tickController.isActive()) {
			btn.button( "option", "label", "Resume" );
			tickController.stop();
		} else {
			btn.button( "option", "label", "Pause" );
			tickController.start();
		}
	});
	
	modelGui.addToggle('pathsVisible', 'Show Orbits:').addChangeListener(function(property, title, oldValue, newValue) {
		setPathVisibility(newValue);
	});
	modelOptions.tickDelayGui = .05;
	var warp = AppEnv.getUrlVar("warp");
	if (warp) {
		modelOptions.tickDelayGui = parseFloat(warp);
	}
	modelGui.addRange('tickDelayGui', 'Animation Speed', 0, 1, .01);	
	
	var categoryGui = gui.right.createBlock("Categories", categoryOptions);
	if (filterTo) { 
		categoryGui.setVisible(false);
	}
	var categoryToggle = function(gui, category) {
		
		gui.addToggle(category.category, category.description).addChangeListener(function(property, title, oldValue, newValue) {
			setCategoryVisibility(category.category, newValue);
		});
	
	};
	
	
	for (var i = 0; i < categories.length; i++) {
		var category = categories[i];
		
		categoryOptions[category.category] = category.enabled;
		var c = new categoryToggle(categoryGui, category);
	}

	var localStarGui = gui.right.createBlock("Local Star");
		localStarGui.setExpandedState(KMG.Closed);
		localStarGui.addToggle('displayLocalStar', 'Display Local Star:');
		localStarGui.addRange('localStarDistance', 'Size:', 0.0, 10.0, 0.01);
		localStarGui.addSelect('localStarTexture', 'Texture:', starFlareNames);
		// localStarGui.addColor('localStarColor', 'Color:');
		localStarGui.addToggle('starColorAffectsPlanetLighting', 'Planet Lighting:');
		localStarGui.addToggle('lensFlareEnabled', 'Lens Flare:');


	
	//engine.context.controls.rotate(0, -KMG.RAD_90);
	//engine.context.controls.rotate(30 * (Math.PI / 180), 0);

	engine.start();
	
	KMG.keyCommandBindManager.engine = engine;
	// var bindResult = KMG.keyCommandBindManager.bindAll();
	// if (bindResult.screenshot) {
	// 	document.getElementById('inline-instructions').innerHTML	+= ", <i>f</i> for fullscreen.";
	// }
	
	
	if (AppEnv.getUrlVar("start")) {
		tickController.start();
	}
	
	$.ajax({
		url: "/js/norad_tle_satellites_no_debris.js",
		dataType: "script",
		success: function(data, textStatus, jqxhr) {
			

			
			
			setLoadingStatus("Rendering satellites...");
			for (var i = 0; i < KMG.ORBITS.length; i++) {
			// for (var i = 0; i < 10; i++) {
				var group = KMG.ORBITS[i];
				var groupName = group.name;
				
				if (categoryOptions[groupName] == undefined) {
					categoryOptions[groupName] = false;
					categoryGui.addToggle(groupName, groupName).addChangeListener(function(property, title, oldValue, newValue) {
						setCategoryVisibility(property, newValue);
					});
				}
				
				
				
				for (var e = 0; e < group.entries.length; e++) {
					var entry = group.entries[e];
					
					
					
					if (!filterTo || (filterTo == entry.satelliteNumber)) {
					//if (entry.name == "ISS (ZARYA)") {
						if (satelliteMap[entry.satelliteNumber]) {
							satelliteMap[entry.satelliteNumber].categories.push(groupName);
							continue;
						}
						
						
						var satellite = {
							name : entry.name,
							orbit : KMG.Util.clone(entry),
							categories : [groupName],
							dot : null,
							path : null,
							orbiter : null
						};
						satelliteMap[entry.satelliteNumber] = satellite;
						//Adding to array to cross associate for the drop down of satellites
						satelliteArray.push(entry.name);
					}
				}
				
			}
			
			for (key in satelliteMap) {
				var satellite = satelliteMap[key];
				createOrbitor(context, satellite, tickController);
			}
			
			// Double check the category visibility...
			for (var i = 0; i < KMG.ORBITS.length; i++) {
				var group = KMG.ORBITS[i];
				var groupName = group.name;
				setCategoryVisibility(groupName, false);
			}

			var satelliteGui = gui.left.createBlock("Satellites");

			satelliteGui.addSelect('satelliteToPilot', 'Satellite to Pilot', satelliteArray).addChangeListener(function(property, title, oldValue, newValue){
				var satellite = getSatelliteByName(newValue);
				selectedSatellite = satellite;
				newlySelectedSatellite = true;
				setCameraToSatellite(satellite);
			});

			satelliteGui.addToggle('pilotSatellite', 'Pilot Satellite').addChangeListener(function(property, title, oldValue, newValue) {
				pilotSatellite = newValue;
				cameraNeedsReset = true;
				newlySelectedSatellite = true;
			});

			satelliteGui.addAction('Mount Geostationary Satellite', function() {
				var sat = getSatelliteByName('BEIDOU G1');
				selectedSatellite = sat;
				newlySelectedSatellite = true;
				setCameraToSatellite(sat);
			});

			//the first run through, we need to have the first item in the list get selected.
			//NOTE: Beidou needs to exist, it may not. 
			try {
				var sat = getSatelliteByName('BEIDOU G1');
				selectedSatellite = sat;
				newlySelectedSatellite = true;
				setCameraToSatellite(sat);
			} catch (ex) {}

			
			$( "#loading-screen" ).css("display", "none");
		}
	});
	
	
	
});	