var Orbiter = function Orbiter() {
	var self = this;

	var categoryOptions = {

	};

	var filterTo = AppEnv.getUrlVar("sat");
	if (filterTo) {
		for (var i = 0; i < categories.length; i++) {
			categories[i].enabled = true;
		}
	
	}
	var satelliteMap = {};

	var config = KMG.Util.extend({}, KMG.DefaultConfig);
	config.initWithShadows = false;
	
	//config.backgroundType = "image";
	//config.backgroundImage = "Yale Bright Star Map";
	//config.backgroundImageType = "sphere";
	config.textureResolution = "1024x512";
	config.noPlanet = true;
	//config.noStars = true;
	config.displayLocalStar = false;
	config.lensFlareEnabled = false;
	config.enableFps = false;
	config.sunlightDirection = 180;
	config.starQuantity = 9.5;

	var modelOptions = {
		pathsVisible : true,
		
		timeWarp : 25000
	};


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

	var engine = new KMG.Planet(document.getElementById( 'container' ), config, sceneCallbacks);
	var context = engine.context;

	var tickController = new KMG.TimeBasedTickController(modelOptions.timeWarp);
	tickController.resetToToday();
	context.objects.push(tickController);

	function getOrbitOpacity(satellite) {
		if (satelliteHasCategory(satellite, "STATIONS")) {
			return 1.0;
		}
		
		return 0.25;
	}

	function satelliteHasCategory(satellite, category) {
		for (var i = 0; i < satellite.categories.length; i++) {
			if (satellite.categories[i] == category) {
				return true;
			}
		}
		return false;
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


	function addToPrimaryScene(obj) {
		engine.context.objects.push(obj);
		engine.context.primaryScene.add(obj);
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



	function createOrbitor(context, satellite, tickController) {

	
		satellite.orbit.scale = 1.0;
		satellite.orbit.opacity = getOrbitOpacity(satellite);
		satellite.orbit.semiMajorAxis = satellite.orbit.semiMajorAxis / 6371 * 200;
		satellite.orbit.color = getOrbitColor(satellite);
		
		var texture = (satellite.orbit.name == "ISS (ZARYA)") ? "/img/sprites/iss_100x100.png" : "/img/satellite_100x100.png";
		var size = (satellite.orbit.name == "ISS (ZARYA)") ? 25 : 15;
		satellite.dot = new KMG.DotPlotObject(context, {color:0xFF0000, size: size, texture: texture });
		satellite.dot.position.set(-200, 0, 0);
		addToPrimaryScene(satellite.dot);
		
		var orbit = new KMG.EllipticalOrbit(satellite.orbit);
		
		satellite.path = new KMG.OrbitPathLine(context, satellite.orbit, orbit);

		
		addToPrimaryScene(satellite.path);
		
		satellite.orbiter =  new KMG.EllipticalOrbiter(context, satellite.dot, 1.0, 0.1 / 365.25, orbit, null, tickController, true);
		
	}




	self.loadOrbits = function loadOrbits() {
		// alert('loading');
		$.ajax({
			// url: "/data/tle/norad_tle_satellites_no_debris.json",
			url: "/js/norad_tle_satellites_no_debris.js",
			dataType: "script",
			success: function(data, textStatus, jqxhr) {
				

				
				
				// setLoadingStatus("Rendering satellites...");
				for (var i = 0; i < KMG.ORBITS.length; i++) {
					var group = KMG.ORBITS[i];
					var groupName = group.name;
					
					// if (categoryOptions[groupName] == undefined) {
					// 	categoryOptions[groupName] = false;
					// 	categoryGui.addToggle(groupName, groupName).addChangeListener(function(property, title, oldValue, newValue) {
					// 		setCategoryVisibility(property, newValue);
					// 	});
					// }
					
					
					
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
				
				$( "#loading-screen" ).css("display", "none");
			}
		});

	};
};