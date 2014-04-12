
/* File: PlanetMaker.js */
/**
 * PlanetMaker JavaScript Library
 * http://planetmaker.wthr.us
 * 
 * Copyright 2013 Kevin M. Gill <kmsmgill@gmail.com>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 */


var KMG = KMG || { REVISION: '1' };
KMG.Util = {};


self.console = self.console || {

	info: function () {},
	log: function () {},
	debug: function () {},
	warn: function () {},
	error: function () {}

};

KMG.RAD_360 = 360 * (Math.PI / 180);
KMG.RAD_270 = 270 * (Math.PI / 180);
KMG.RAD_180 = 180 * (Math.PI / 180);
KMG.RAD_90 = 90 * (Math.PI / 180);
KMG.RAD_45 = 45 * (Math.PI / 180);
KMG.AU_TO_KM = 149597870.700;
KMG.PI_BY_180 = (Math.PI / 180);
KMG._180_BY_PI = (180 / Math.PI);


/* File: Math.js */
KMG.Math = {};


KMG.Math.sinh = function(a) {
	return (Math.exp(a) - Math.exp(-a)) / 2;
}

KMG.Math.cosh = function(a) {
	return (Math.pow(Math.E, a) + Math.pow(Math.E, -a)) / 2;
}

KMG.Math.sign = function(a) {
	return (a >= 0.0) ? 1 : -1;
}

KMG.Math.radians = function(d) {
	return d * (Math.PI / 180);
}

KMG.Math.degrees = function(r) {
	return r * (180 / Math.PI);
}

KMG.Math.sqr = function(v) {
	return v * v;
};

KMG.Math.clamp = function(v, within) {
	if (!within) {
		within = 360;
	}
	return v - within * Math.floor(v / within);
};




KMG.Math.dsin = function(v) {
	return Math.sin(v * Math.PI / 180);
};

KMG.Math.dcos = function(v) {
	return Math.cos(v * Math.PI / 180);
};

KMG.Math.dtan = function(v) {
	return Math.tan(v * Math.PI / 180);
};


KMG.Math.dasin = function(v) {
	return Math.asin(v) * 180 / Math.PI;
};

KMG.Math.dacos = function(v) {
	return Math.acos(v) * 180 / Math.PI;
};

KMG.Math.datan2 = function(y, x) {
	return Math.atan2(y, x) * 180 / Math.PI;
};

KMG.Math.datan = function(v) {
	return KMG.Math.dasin(v / Math.sqrt(Math.pow(v, 2) + 1));
};




KMG.Math.round = function(v, factor) {
	if (!factor) {
		factor = 1000;
	}
	
	return Math.floor(v * factor) / factor;
};

KMG.Math.trimTo360Radians = function(x) {	
	if( x > 0.0 ) {
		while( x > KMG.RAD_360 )
			x = x-KMG.RAD_360;
	} else {
		while( x< 0.0 )
			x =x+ KMG.RAD_360;
	}
	return x;
}

KMG.Math.trimTo360 = function(x) {	
	if( x > 0.0 ) {
		while( x > 360.0 )
			x = x-360.0;
	} else {
		while( x< 0.0 )
			x =x+ 360.0;
	}
	return x;
}


KMG.Math.fixThetaDegrees = function(degrees){
	var limited;
    degrees /= 360.0;
    limited = 360.0 * (degrees - Math.floor(degrees));
    if (limited < 0)
		limited += 360.0;
	return limited;
}
        
KMG.Math.fixPhiDegrees = function(degrees) {
	degrees += 90.0;
	var limited;
	degrees /= 180.0;
	limited = 180.0 * (degrees - Math.floor(degrees));
	if (limited < 0)
			limited += 180.0;
	return limited - 90.0;
}




KMG.Math.getPoint3D = function(theta, // Longitude, in degrees
                               phi, // Latitude, in degrees
                               radius) {

	//theta += 90.0;
	theta = KMG.Math.fixThetaDegrees(theta) * KMG.PI_BY_180;
    phi = KMG.Math.fixPhiDegrees(phi) * KMG.PI_BY_180;

                
	var _y = Math.sqrt(KMG.Math.sqr(radius) - KMG.Math.sqr(radius * Math.cos(phi)));
    var r0 = Math.sqrt(KMG.Math.sqr(radius) - KMG.Math.sqr(_y));

    var _b = r0 * Math.cos(theta );
    var _z = Math.sqrt(KMG.Math.sqr(r0) - KMG.Math.sqr(_b));
    var _x = Math.sqrt(KMG.Math.sqr(r0) - KMG.Math.sqr(_z));

                
    if (theta <= KMG.RAD_90) {
		_z *= -1.0;
	} else if (theta  <= KMG.RAD_180) {
		_x *= -1.0;
		_z *= -1.0;
	} else if (theta  <= KMG.RAD_270) {
		_x *= -1.0;
	}

	if (phi >= 0) { 
		_y = Math.abs(_y);
	} else {
		_y = Math.abs(_y) * -1;
	}
	return new THREE.Vector3(_x, _y, _z);
}



KMG.Math.convertCartesianEquatorialToEcliptic = function(equatorial) {
	var e = 23.4 * KMG.PI_BY_180;
	
	var m = new THREE.Matrix3();
	m.set(1, 0, 0, 
		  0, Math.cos(e), Math.sin(e), 
		  0, -Math.sin(e), Math.cos(e));
	
	var ecliptic = equatorial.clone().applyMatrix3(m);
	return ecliptic;
};


// Duffet-Smith, Peter: Practical Astronomy with Your Calculator, page 42
KMG.Math.convertEquatorialToEcliptic = function(ra, dec) {
	var e = 23.4;
	
	var Y = KMG.Math.dsin(ra) * KMG.Math.dcos(e) + KMG.Math.dtan(dec) * KMG.Math.dsin(e);
	var X = KMG.Math.dcos(ra);
	
	var l = KMG.Math.datan2(Y, X);
	var b = KMG.Math.dasin(KMG.Math.dsin(dec) * KMG.Math.dcos(e) - KMG.Math.dcos(dec) * KMG.Math.dsin(e) * KMG.Math.dsin(ra));
	
	return {
		l : l,
		b : b
	};
};





/* File: StarFlares.js */



KMG.starFlares = [
	{
		name : "Yellow Star",
		texture : "/img/lensflare0.png"
	},
	{
		name : "Aura",
		texture : "/img/aura.png"
	},
	{
		name : "Corona",
		texture : "/img/corona.png"
	},
	{
		name : "i0",
		texture : "/img/i0.png"
	},
	{
		name : "Nova",
		texture : "/img/nova.png"
	},
	{
		name : "Sparkle",
		texture : "/img/sparkle.png"
	},
	{
		name : "Star",
		texture : "/img/star.png"
	},
	{
		name : "Sun",
		texture : "/img/sun.png"
	},/*
	{
		name : "Sun (Actual)",
		texture : "/img/sun_actual.png"
	},*/
	{
		name : "Solar Corona SDO/AIA 3/12/2012 17:30:01 UT",
		texture : "/img/latest_2048_0171.png"
	}
];
/* File: Backgrounds.js */


KMG.backgrounds = [
	{
		name : "Starfield",
		
		// I'm not sure the exact origin of this image. If you know, or you made it, 
		// please let me know at kevin@wthr.us so I can provide proper credit.
		texture : "/img/starfield2_1900x1250.jpg",
		enabled : true
	},
	{
		name : "Tycho Star Map",
		texture : "/img/tycho8-2048x1024.jpg",
		enabled : true
	},
	{
		name : "Hipparcos Star Map",
		texture : "/img/hipp8-2048x1024.jpg",
		enabled : true
	},
	{
		name : "Yale Bright Star Map",
		texture : "/img/yale8-2048x1024.jpg",
		enabled : true
	},
	{   // http://apod.nasa.gov/apod/ap110224.html
		name : "NGC 1999: South of Orion",
		texture : "/img/n1999_block.jpg",
		enabled : true
	},
	{   // http://apod.nasa.gov/apod/ap110219.html
		name : "Spiral Galaxy NGC 2841",
		texture : "/img/ngc2841c_hst_lg.jpg",
		enabled : true
	},
	{   // http://apod.nasa.gov/apod/ap110215.html
		name : "North America Nebula in Infrared",
		texture : "/img/northamerica_spitzer_3000.jpg",
		enabled : true
	},
	{   // http://apod.nasa.gov/apod/ap110215.html
		name : "North America Nebula (Optical Light)",
		texture : "/img/northamerica_v_900.jpg",
		enabled : true
	},
	{   // http://apod.nasa.gov/apod/ap110214.html
		name : "The Rosette Nebula ",
		texture : "/img/rosette_lula_1700.jpg",
		enabled : true
	},
	{ // http://photojournal.jpl.nasa.gov/catalog/PIA07745
		name : "Icy Crescent of Dione",
		texture : "/img/PIA07745_dione.jpg",
		enabled : true
	},
	{
		name : "Custom",
		texture : null,
		enabled : true
	},
	{
		name : "Webcam",
		texture : null,
		enabled : false
	}
];
/* File: Clouds.js */

KMG.clouds = [
	{
		name : "xPlanet Daily Global Cloud Map",
		texture : "/img/xplanet/0/clouds_xplanet_texture_2048x1024.png",
		bumpMap : "/img/xplanet/0/clouds_2048.jpg",
		aoMap : "/img/xplanet/0/clouds_ao_2048.jpg",
		normalMap : null
	},
	{
		name : "NASA Blue Marble Global Composite Clouds",
		texture : "/img/clouds_texture_#resolution#.png",
		bumpMap : "/img/clouds_bumpmap_#resolution#.jpg",
		normalMap : "/img/clouds_normalmap_#resolution#.jpg",
		aoMap : "/img/clouds_ao_#resolution#.jpg",
	},
	{
		name : "Gas Giant Banded Clouds",
		texture : "/img/gasgiant-clouds-#resolution#.png",
		bumpMap : "/img/gasgiant-clouds-bumpmap-#resolution#.jpg",
		normalMap : "/img/gasgiant-clouds-normalmap-#resolution#.jpg",
		aoMap : "/img/gasgiant-clouds-ao-#resolution#.jpg",
	}
];
/* File: Textures.js */

KMG.textures = [
	{
		name : "Earth - Blue Marble",
		texture : "/img/earth_bluemarble_#resolution#.jpg",
		bumpMap : "/img/earth_bumpmap_flat_#resolution#.jpg",
		normalMap : "/img/earth_normalmap_flat_#resolution#.jpg",
		specularMap : "/img/earth_specularmap_flat_#resolution#.jpg",
		enabled : true
	},
	{
		name : "Earth - Blue Marble / Oceans & Ice",
		texture : "/img/earth_bluemarble_land_ocean_ice_texture_#resolution#.jpg",
		bumpMap : "/img/earth_bumpmap_flat_#resolution#.jpg",
		normalMap : "/img/earth_normalmap_flat_#resolution#.jpg",
		specularMap : "/img/earth_specularmap_flat_#resolution#.jpg",
		enabled : true
	},
	{
		name : "Earth - Blue Marble w/ Bathy",
		texture : "/img/earth.topo.bathy.200407.3x#resolution#.jpg",
		bumpMap : "/img/earth_bumpmap_#resolution#.jpg",
		normalMap : "/img/earth_normalmap_#resolution#.jpg",
		specularMap : "/img/earth_specularmap_flat_#resolution#.jpg",
		enabled : true
	},
	{
		name : "Earth - Blue Marble w/ Bathy (Flat Ocean Shading)",
		texture : "/img/earth.topo.bathy.200407.3x#resolution#.jpg",
		bumpMap : "/img/earth_bumpmap_flat_#resolution#.jpg",
		normalMap :  "/img/earth_normalmap_flat_#resolution#.jpg",
		specularMap : "/img/earth_specularmap_flat_#resolution#.jpg",
		enabled : true
	},
	{
		name : "Earth - GEBCO8 Altimetry & Bathy",
		texture : "/img/earth_gebco8_texture_#resolution#.jpg",
		bumpMap : "/img/earth_bumpmap_#resolution#.jpg",
		normalMap : "/img/earth_normalmap_#resolution#.jpg",
		specularMap : "/img/earth_specularmap_flat_#resolution#.jpg",
		enabled : true
	},
	{
		name : "Earth - Blue Marble Night Lights",
		texture : "/img/earth_nightlights_#resolution#.jpg",
		bumpMap : "/img/earth_bumpmap_flat_#resolution#.jpg",
		normalMap : "/img/earth_normalmap_flat_#resolution#.jpg",
		specularMap : "/img/flat_black_texture.jpg",
		enabled : true
	},
	{
		name : "Earth - Vegetation as Seen by Suomi NPP",
		texture : "/img/SMNDVI-2012-week25_#resolution#.jpg",
		bumpMap : "/img/earth_bumpmap_flat_#resolution#.jpg",
		normalMap : "/img/earth_normalmap_flat_#resolution#.jpg",
		specularMap : "/img/flat_black_texture.jpg",
		enabled : true
	},
	{
		name : "Earth - City Lights as Seen by Suomi NPP",
		texture : "/img/blackmarble-suomi-npp-texture-#resolution#.jpg",
		bumpMap : "/img/earth_bumpmap_flat_#resolution#.jpg",
		normalMap : "/img/earth_normalmap_flat_#resolution#.jpg",
		specularMap : "/img/flat_black_texture.jpg",
		enabled : true
	},
	{
		name : "Mars",
		texture : "/img/tx_composite.adjusted.#resolution#.jpg",
		bumpMap : "/img/mars_mola_bumpmap_#resolution#.jpg",
		normalMap : "/img/mars_mola_normalmap_#resolution#.jpg",
		specularMap :"/img/flat_black_texture.jpg",
		enabled : true
	},
	{
		name : "Mars - MOLA Altimetry",
		texture : "/img/mars_mola_hypsometric_#resolution#.jpg",
		bumpMap : "/img/mars_mola_bumpmap_#resolution#.jpg",
		normalMap : "/img/mars_mola_normalmap_#resolution#.jpg",
		specularMap : "/img/flat_black_texture.jpg",
		enabled : true
	},
	{
		name : "Mars with Oceans",
		texture : "/img/mars_wetred_texture_#resolution#.jpg",
		bumpMap : "/img/mars_mola_bumpmap_sealevel_#resolution#.jpg",
		normalMap : "/img/mars_mola_normalmap_flat_#resolution#.jpg",
		specularMap : "/img/mars_mola_specularmap_#resolution#.jpg",
		enabled : true
	},
	{
		name : "Living Mars",
		texture : "/img/mars-wet-flora-layer-v3-#resolution#.jpg",
		bumpMap : "/img/mars_mola_bumpmap_sealevel_#resolution#.jpg",
		normalMap : "/img/mars_mola_normalmap_flat_#resolution#.jpg",
		specularMap : "/img/mars_mola_specularmap_#resolution#.jpg",
		enabled : true
	},
	{
		name : "Moon",
		texture : "/img/moon_8k_color_brim16_revhemi_#resolution#.jpg",
		bumpMap : "/img/moon_lro_bumpmap_#resolution#.jpg",
		normalMap : "/img/moon_lro_normalmap_#resolution#.jpg",
		specularMap : "/img/flat_black_texture.jpg",
		enabled : true
	},
	{
		name : "Moon - LRO Altimetry",
		texture : "/img/moon_lro_hypsometric_#resolution#.jpg",
		bumpMap : "/img/moon_lro_bumpmap_#resolution#.jpg",
		normalMap : "/img/moon_lro_normalmap_#resolution#.jpg",
		specularMap : "/img/flat_black_texture.jpg",
		enabled : true
	},
	{
		name : "Jupiter",
		texture : "/img/jupiter_johnw_texture_#resolution#.jpg",
		bumpMap :  null,
		normalMap : "/img/flat_normalmap_128x64.jpg",
		specularMap : "/img/flat_black_texture.jpg",
		enabled : true
	},
	{
		name : "Saturn",
		texture : "/img/th_saturn_texture_#resolution#.jpg",
		bumpMap :  null,
		normalMap : "/img/flat_normalmap_128x64.jpg",
		specularMap : "/img/flat_black_texture.jpg",
		enabled : true
	},
	{
		name : "Venus",
		texture : "/img/ven0mss2_jpl_mariner10_#resolution#.jpg",
		bumpMap :  null,
		normalMap : "/img/flat_normalmap_128x64.jpg",
		specularMap : "/img/flat_black_texture.jpg",
		enabled : true
	},
	{
		name : "Venus - Magellan RADAR",
		texture : "/img/venmap_jpl_magellan_#resolution#.jpg",
		bumpMap :  null,
		normalMap : "/img/flat_normalmap_128x64.jpg",
		specularMap : "/img/flat_black_texture.jpg",
		enabled : true
	},
	{
		name : "Terrestrial Planet X.0",
		texture : "/img/libnoise_0/terrainsurface_#resolution#.jpg",
		bumpMap :  "/img/libnoise_0/terrainbump_#resolution#.jpg",
		normalMap : "/img/libnoise_0/terrainnormal_#resolution#.jpg",
		specularMap : "/img/libnoise_0/terrainspec_#resolution#.jpg",
		enabled : true
	},
	{
		name : "Terrestrial Planet X.1",
		texture : "/img/libnoise_1/terrainsurface_#resolution#.jpg",
		bumpMap :  "/img/libnoise_1/terrainbump_#resolution#.jpg",
		normalMap : "/img/libnoise_1/terrainnormal_#resolution#.jpg",
		specularMap : "/img/libnoise_1/terrainspec_#resolution#.jpg",
		enabled : true
	},
	{
		name : "Terrestrial Planet X.2",
		texture : "/img/libnoise_2/terrainsurface_#resolution#.jpg",
		bumpMap :  "/img/libnoise_2/terrainbump_#resolution#.jpg",
		normalMap : "/img/libnoise_2/terrainnormal_#resolution#.jpg",
		specularMap : "/img/libnoise_2/terrainspec_#resolution#.jpg",
		enabled : true
	},
	{
		name : "Terrestrial Planet X.3",
		texture : "/img/libnoise_3/terrainsurface_#resolution#.jpg",
		bumpMap :  "/img/libnoise_3/terrainbump_#resolution#.jpg",
		normalMap : "/img/libnoise_3/terrainnormal_#resolution#.jpg",
		specularMap : "/img/libnoise_3/terrainspec_#resolution#.jpg",
		enabled : true
	},
	{
		name : "Terrestrial Planet X.3 (Gray)",
		texture : "/img/libnoise_3/terrainsurface_gray_#resolution#.jpg",
		bumpMap :  "/img/libnoise_3/terrainbump_#resolution#.jpg",
		normalMap : "/img/libnoise_3/terrainnormal_#resolution#.jpg",
		specularMap : "/img/libnoise_3/terrainspec_#resolution#.jpg",
		enabled : true
	},
	{
		name : "Gas Giant (Browns)",
		texture : "/img/gas_0/orange_and_browns_#resolution#.jpg",
		bumpMap :  null,
		normalMap : "/img/flat_normalmap_128x64.jpg",
		specularMap : "/img/flat_black_texture.jpg",
		enabled : true
	},
	{
		name : "Gas Giant (Purples)",
		texture : "/img/gas_1/purples_texture_#resolution#.jpg",
		bumpMap :  null,
		normalMap : "/img/flat_normalmap_128x64.jpg",
		specularMap : "/img/flat_black_texture.jpg",
		enabled : true
	},
	{
		name : "Gas Giant 3 (Grey)",
		texture : "/img/gas_2/gas_giant_texture_grey_#resolution#.jpg",
		bumpMap :  "/img/gas_2/gas_giant_texture_grey_#resolution#.jpg",
		normalMap : "/img/flat_normalmap_128x64.jpg",
		specularMap : "/img/flat_black_texture.jpg",
		enabled : true
	},
	{
		name : "Gas Giant 3 (Grey, Inverted)",
		texture : "/img/gas_2/gas_giant_texture_grey_inverted_#resolution#.jpg",
		bumpMap :  "/img/gas_2/gas_giant_texture_grey_inverted_#resolution#.jpg",
		normalMap : "/img/flat_normalmap_128x64.jpg",
		specularMap : "/img/flat_black_texture.jpg",
		enabled : true
	},
	{
		name : "Gas Giant 4",
		texture : "/img/gasgiant-4-texture-#resolution#.jpg",
		bumpMap :  null,
		normalMap : "/img/flat_normalmap_128x64.jpg",
		specularMap : "/img/flat_black_texture.jpg",
		enabled : true
	},
	{
		name : "Sun",
		texture : "/img/th_sun_basetexture_#resolution#.jpg",
		bumpMap :  null,
		normalMap :  "/img/flat_normalmap_128x64.jpg",
		specularMap : "/img/flat_black_texture.jpg",
		enabled : true
	},
	{
		name : "Custom",
		texture : "",
		bumpMap : "",
		normalMap : "",
		specularMap : "",
		enabled : true,
		sourceProperties : {
			texture : {},
			bumpMap : {},
			normalMap : {},
			specularMap : {}
		}
	},
	{
		name : "Webcam",
		texture : null,
		bumpMap : "",
		normalMap : "",
		specularMap : "",
		enabled : false
	}
];

/* File: Rings.js */

/**
 * Some rings from Celestia plus others based on stock GIMP (www.gimp.org) gradiants.
 */
KMG.rings = [
	{
		name : "Saturn",
		texture : "/img/saturn-rings.png"
	},
	{
		name : "Uranus",
		texture : "/img/uranus-rings.png"
	},
	{
		name : "Neptune",
		texture : "/img/neptune-rings.png"
	},
	{
		name : "Grays",
		texture : "/img/grays-ring.png"
	},
	{
		name : "Abstract3",
		texture : "/img/abstract3-ring.png"
	},
	{
		name : "Anuerism",
		texture : "/img/anuerism-ring.png"
	},
	{
		name : "Browns",
		texture : "/img/browns-ring.png"
	},
	{
		name : "Brushed Aluminum",
		texture : "/img/brushed-aluminum-ring.png"
	},
	{
		name : "Flare Glow Angular 1",
		texture : "/img/flare-glow-angular-1-ring.png"
	},
	{
		name : "Golden",
		texture : "/img/golden-ring.png"
	},
	{
		name : "Greens",
		texture : "/img/greens-ring.png"
	},
	{
		name : "Red Tube",
		texture : "/img/red-tube-ring.png"
	},
	{
		name : "Yellow Contrast",
		texture : "/img/yellow-contrast-ring.png"
	},
	{
		name : "Yellow Orange",
		texture : "/img/yellow-orange-ring.png"
	}
];
/* File: NightLights.js */
KMG.lights = [
	{
		name : "Earth - Blue Marble Night Lights",
		texture : "/img/earth_nightlightsonly_#resolution#.gif"
	}
];

/* File: DefaultConfig.js */

KMG.DefaultConfig = {
	version : 2.0,
	initWithShadows : true,
	shadows : false,
	shadowDarkness : 0.5,
	radius : 200,
	cloudsRadius : 200.5,
	textureResolution : "2048x1024",
	enableFps : false,
	postprocessingEnabled : true,
	
	useScript : true,
	
	// Light
	lightingType : "Directional", // or "Point"
	sunlightDirection : 60.0,
	realtimeSunlight : false,
	sunlightDate : (new Date()).getTime(),
	localStarDistance : 1.0,
	displayLocalStar : true,
	localStarTexture : KMG.starFlares[0].name,
	localStarColor : [ 255, 255, 255 ],
	starColorAffectsPlanetLighting : true,
	lensFlareEnabled : false,
	
	// Surface
	texture : KMG.textures[1].name,
	surfaceDetail : 1.0,
	elevationScale : 0,
	shininess : 60,
	diffuseIntensity : 170,
	specularIntensity : 4,
	ambientIntensity : 0,
	emissiveIntensity : 0,
	enableCityLights : true,
	cityLightsIntensity : 1.0,
	flattening : 0.0033528,
	axialTilt : 0.0,
	surfaceColorMode : "Normal",
	surfaceHue : 0.5,
	surfaceSaturation : 0.0,
	surfaceLightness : 0.75,
	surfaceWrapRGB : 0.031,
	surfaceRotation : 0.0,
	scaleSurface : 1.0, 
	
	moonTemplate : {
		id : "",
		displayMoon : true,
		moonTexture : KMG.textures[12].name,
		moonColorMode : "Normal",
		moonHue : 0.5,
		moonSaturation : 0.0,
		moonLightness : 0.75,
		moonSurfaceDetail : 0.2,
		moonElevationScale : 0,
		moonShininess : 60,
		moonDiffuseIntensity : 90,
		moonSpecularIntensity : 0,
		moonAmbientIntensity : 8,
		moonEmissiveIntensity : 0,
		moonDistance : 1.0,
		moonScale : 1.0,
		moonAngle : 45,
		moonRotation : 160.0,
		shadows : false
	},
	moons : [],
	

	// Clouds
	cloudsTexture : KMG.clouds[1].name,
	displayClouds : true,
	cloudsHue : 0.5,
	cloudsSaturation : 0.0,
	cloudsLightness : 0.75,
	cloudsDetail : 0.6,
	cloudsElevation : 0.25,
	cloudsThickness : 0,
	cloudsOpacity : 1.0,
	cloudsCastShadows : true,
	cloudsShadowLevel : 0.8,
	cloudsDiffuseIntensity : 170,
	cloudsSpecularIntensity : 4,
	cloudsAmbientIntensity : 60,
	
	// Atmosphere
	displayAtmosphere : true,
	atmosphereColor : [ 0.40784 * 255, 0.541 * 255, 0.69 * 255 ],
	atmosphereScale : 1.0,
	atmosphereIntensity : 0.7,
	atmosphereRadius : 202.0, 

	// Ring
	displayRing : false,
	ringTexture : KMG.rings[0].name,
	ringHue : 0.5,
	ringSaturation : 0.0,
	ringLightness : 0.75,
	ringInnerRadius : 260.0,
	ringOutterRadius : 400.0,
	ringAngle : 0.0,
	showShadows : true,
	ringOpacity : 1.0,
	
	
	// Background
	backgroundType : 'stars',
	backgroundImage : 'Starfield',
	backgroundImageType : 'flat',
	backgroundImageFitType : 'stretch',
	starQuantity : 6.5, // 0 - 10
	
	// Effects
	enableGodRays : false,
	godRaysIntensity : 0.75,
	enableBlur : false,
	blurAmount : 0.5,
	enableBloom : false,
	bloomStrength : 0.5,
	enableBleach : false,
	bleachAmount : 0.95,
	enableFilm : false,
	noiseIntensity : 0.35,
	scanlinesIntensity : 0.75,
	scanlinesCount : 2048,
	filmGrayscale : false,
	enableSepia : false,
	sepiaAmount : 0.9,
	
	camera : {
		positionZ : 700,
		fieldOfView : 45,
		near : 0.01,
		far : 10000000,
		
		useSecondaryParameters : false,
		fieldOfViewSecondary : 45,
		nearSecondary : 0.01,
		farSecondary : 10000000
	},
	controls : {
		rotateSpeed : 0.5
	}
};

/* File: ImageUtils.js */

KMG.ImageUtils = function ( ) {
	
	var scope = this;
	var canvas = document.createElement( 'canvas' );
	var context = canvas.getContext( '2d' );

	
	this.convertToGrayScale = function(img) {
		var w = img.image.width;
		var h = img.image.height;
		
		if (!w || !h) {
			return null;
		}
		
		canvas.width = w;
		canvas.height = h;
		context.drawImage(img.image, 0, 0, w, h, 0, 0, w, h);
		var data = context.getImageData(0, 0, w, h);
		
		var color = new THREE.Color( 0x000000 );
		var map = THREE.ImageUtils.generateDataTexture( w, h, color );
		
		//
		for(var n = 0; n < data.width * data.height; n++) {
			var dataIndex = n*4;
			var texIndex = n*3;
			var intesity = data.data[dataIndex+0] * 0.2989 + data.data[dataIndex+1] * 0.5870 + data.data[dataIndex+2] * 0.1140;
			
			map.image.data[texIndex+0] = intesity;
			map.image.data[texIndex+1] = intesity;
			map.image.data[texIndex+2] = intesity;
		}
		
		canvas.width = 1;
		canvas.height = 1;
		return map;

	};

};

/* File: TextureMap.js */

KMG.TextureMap = {

	map : {},
	textureResolution : "2048x1024",
	texturesLoading : 0,
	sceneReadyCallback : null,
	resourceLoadingStart : null,
	resourceLoadingFinish : null,
	renderCallback : null,
	
	onResourceLoaded : function()
	{
		KMG.TextureMap.texturesLoading--;
		if (KMG.TextureMap.sceneReadyCallback && KMG.TextureMap.texturesLoading === 0) {
			KMG.TextureMap.sceneReadyCallback();
		}
		
		if (KMG.TextureMap.resourceLoadingFinish) {
			KMG.TextureMap.resourceLoadingFinish(true, KMG.TextureMap.texturesLoading);
		}
	},
	
	setupEncodedTexture : function(dat) {
		var img = new Image();
		var t = new THREE.Texture(img);
		t.wrapS = THREE.RepeatWrapping;

		img.onload = function() {
			t.needsUpdate = true;
			KMG.TextureMap.onResourceLoaded();
			if (KMG.TextureMap.renderCallback !== null) {
				KMG.TextureMap.renderCallback();
			}
		};
		img.src = dat;
		return t;
	},

	
	loadTexture : function(url, onload, noCache)
	{

		if (!url || url.length === 0) {
			return null;
		}
		
		if (!onload) {
			onload = KMG.TextureMap.onResourceLoaded;
		} else {
			var origOnload = onload;
			onload = function() {
				origOnload();
				KMG.TextureMap.onResourceLoaded();
			};
		}
		
		url = url.replace("#resolution#", KMG.TextureMap.textureResolution);
		
		if (KMG.TextureMap.map[url] !== undefined && !noCache) {
			return KMG.TextureMap.map[url];
		}
		
		if (KMG.TextureMap.resourceLoadingStart) {
			KMG.TextureMap.resourceLoadingStart(url);
		}
		
		KMG.TextureMap.texturesLoading++;
		
		var tex = null;
		if (/^data:/i.test(url)) {
			tex = KMG.TextureMap.setupEncodedTexture(url);
			onload();
		} else {
			tex = THREE.ImageUtils.loadTexture( url, {}, onload, onload );
		}
		
		tex.repeat.set( 0.998, 0.998 );
		tex.offset.set( 0.001, 0.001 )
		tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
		tex.format = THREE.RGBFormat;
		//KMG.TextureMap.map[url].anisotropy = 4;
		
		if (!noCache) {
			KMG.TextureMap.map[url] = tex;
		} 
		
		return tex;
	},
	
	getDefinitionByName : function(list, name) 
	{
		for (var i = 0; i < list.length; i++) {
			if (list[i].name == name) {
				return list[i];
			}
		}
		return null;
	},
	
	getCloudDefinitionByName : function( name )
	{
		return KMG.TextureMap.getDefinitionByName(KMG.clouds, name);
	},
	
	getRingDefinitionByName : function( name )
	{
		return KMG.TextureMap.getDefinitionByName(KMG.rings, name);
	},
	
	getTextureDefinitionByName : function( name )
	{
		return KMG.TextureMap.getDefinitionByName(KMG.textures, name);
	},
	
	getBackgroundDefinitionByName : function( name )
	{
		return KMG.TextureMap.getDefinitionByName(KMG.backgrounds, name);
	},
	
	getFlareDefinitionByName : function( name )
	{
		return KMG.TextureMap.getDefinitionByName(KMG.starFlares, name);
	}

};

/* File: Util.js */

KMG.Util = {};

KMG.Util.isUserMobile = function()
{
	return /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent);
}

KMG.Util.cardinalDirectionByValue = function(value, ifPos, ifNeg) {
	return (value >= 0) ? ifPos : ifNeg;
}

KMG.Util.formatDegrees = function(value, ifPos, ifNeg) {
	
	value = KMG.Math.round(value, 1000);
	
	var fmt = Math.abs(value) + "&deg;";
	if (ifPos && ifNeg) {
		fmt += KMG.Util.cardinalDirectionByValue(value, ifPos, ifNeg);
	}
	return fmt;
}

KMG.Util.formatDegreesToHours = function(value, ifPos, ifNeg) {
	
	var h = Math.floor(Math.abs(value));
	var m = Math.floor((Math.abs(value) - h) * 60);
	var s = KMG.Math.round(((Math.abs(value) - h) * 60 - m) * 60, 100);

	if (h < 10) {
		h = "0" + h;
	}
	
	if (m < 10) {
		m = "0" + m;
	}
	
	var fmt = h + "h " + m + "m " + s + "s";
	if (ifPos && ifNeg) {
		fmt += KMG.Util.cardinalDirectionByValue(value, ifPos, ifNeg);
	}
	return fmt;
}

KMG.Util.formatDegreesToMinutes = function(value, ifPos, ifNeg) {
	
	var d = Math.floor(Math.abs(value));
	var m = Math.floor((Math.abs(value) - d) * 60);
	var s = KMG.Math.round(((Math.abs(value) - d) * 60 - m) * 60, 100);
	
	var fmt = d + "&deg; " + m + "\' " + s + "\"";
	if (ifPos && ifNeg) {
		fmt += KMG.Util.cardinalDirectionByValue(value, ifPos, ifNeg);
	}
	return fmt;
}


KMG.Util.intensityToWhiteColor = function(intensity)
{
	intensity = parseInt(intensity);
	var rgb = "rgb("+intensity+","+intensity+","+intensity+")";
	return new THREE.Color(rgb);
};

KMG.Util.arrayToColor = function(array)
{
	var r = parseInt(array[0]);
	var g = parseInt(array[1]);
	var b = parseInt(array[2]);
	var a = (array.length >= 4) ? parseInt(array[3]) : 255.0;
	var rgb = "rgb("+r+","+g+","+b+")";
	return new THREE.Color(rgb);
};

KMG.Util.rgbToArray = function(rgb)
{
	var c = new THREE.Color(rgb);
	return new THREE.Vector3(c.r, c.g, c.b);
}


KMG.Util.eyePosition = function(context)
{
	return context.camera.position;
};
	
KMG.Util.eyeDistanceToCenter = function(context)
{
	return context.primaryScene.position.distanceTo(KMG.Util.eyePosition(context));
};
	
KMG.Util.surfaceDistance = function(context, radius)
{
	return KMG.Util.eyeDistanceToCenter(context) - radius;
};


//farClipDistance
KMG.Util.horizonDistance = function(context, radius)
{
	var r = radius;
	var e = KMG.Util.surfaceDistance(context, radius);
	var f = Math.sqrt(e * (2 * r + e));
	return f;
};

// TODO: Strengthen this...
KMG.Util.clone = function(object) 
{
	if (typeof object !== "object") {
		return object;
	}

	var cloned;
	
	if (object instanceof Array) {
		cloned = new Array();
		for (var i = 0; i < object.length; i++) {
			cloned.push(KMG.Util.clone(object[i]));
		}
	} else {
		cloned = {};
		for(var key in object) {
			cloned[key] = KMG.Util.clone(object[key]);
		};
	}
	
	return cloned;
};

// TODO: Strengthen this...
KMG.Util.extend = function(target, source) {

	//var extended = KMG.Util.clone(target);
	var extended = target;
	for(var key in source) {
		if (key === "displayClouds") {
			var snoofle;
		}
		if (extended[key] === undefined) {
			extended[key] = KMG.Util.clone(source[key]);
		}
		
		if (extended[key] && typeof extended[key] === "object") {
			extended[key] = KMG.Util.extend(extended[key], source[key]);
		}
	
	}
	
	return extended;
};

// http://www.csgnetwork.com/juliangregcalconv.html
KMG.Util.julianToDate = function(jd) {
	var _jd = jd;
		
	jd += 0.5;
	var z = Math.floor(jd);
	var f = jd - z;
	if (z < 2299161) {
		var A = z;
	} else {
		var omega = Math.floor((z-1867216.25)/36524.25);
		var A = z + 1 + omega - Math.floor(omega/4);
	}
	var B = A + 1524;
	var C = Math.floor((B-122.1)/365.25);
	var D = Math.floor(365.25*C);
	var Epsilon = Math.floor((B-D)/30.6001);
	var dayGreg = B - D - Math.floor(30.6001*Epsilon) + f;
	var monthGreg, yearGreg;
	if (Epsilon < 14) {
		monthGreg = Epsilon - 1;
	} else {
		monthGreg = Epsilon - 13;
	}
	if (monthGreg > 2) {
		yearGreg = C - 4716;
	} else {
		yearGreg = C - 4715;
	}
	
	var year = yearGreg;
	var month = monthGreg;
	var day = Math.floor(dayGreg);
	
	var dayMinutes = Math.floor((dayGreg - day) * 1440.0);
	var hour = Math.floor(dayMinutes / 60.0);
	var minute = Math.floor(dayMinutes - (hour * 60.0));
	var second = Math.floor(60.0 * (dayMinutes - (hour * 60.0) -minute));
	
	return new Date(year, month - 1, day, hour, minute, second, 0);
};


// http://www.csgnetwork.com/juliandatetime.html
KMG.Util.dateToJulian = function(year, month, day, hour, minute, second, tz) {

	/*
	var extra = 100.0*year + month - 190002.5;
	var rjd = 367.0*year;
	rjd -= Math.floor(7.0*(year+Math.floor((month+9.0)/12.0))/4.0);
	rjd += Math.floor(275.0*month/9.0) ;
	rjd += day;
	rjd += (hour + (minute + second/60.0)/60.)/24.0;
	rjd += 1721013.5;
	rjd -= 0.5*extra/Math.abs(extra);
	rjd += 0.5;
	
	return rjd;*/
	if (!tz) {
		tz = 0;
	}
	var day_decimal, julian_day, a;

	day_decimal = day + (hour - tz + (minute + second / 60.0) / 60.0) / 24.0;

	if (month < 3) {
		month += 12;
		year--;
	}

	julian_day = Math.floor(365.25 * (year + 4716.0)) + Math.floor(30.6001 * (month + 1)) + day_decimal - 1524.5;
	if (julian_day > 2299160.0) {
		a = Math.floor(year / 100);
		julian_day += (2 - a + Math.floor(a / 4));
	}

	return julian_day;
};

KMG.Util.millisToJulian = function(millis) {
	var d = new Date(millis);
	var jd =  KMG.Util.dateToJulian(d.getFullYear(),
							d.getMonth() + 1,
							d.getDate(),
							d.getHours(),
							d.getMinutes(),
							d.getSeconds());
	return jd;
};


KMG.Util.julianNow = function() {
	var d = new Date();
	return KMG.Util.dateToJulian(d.getUTCFullYear(),
						d.getUTCMonth() + 1,
						d.getUTCDate(),
						d.getUTCHours(),
						d.getUTCMinutes(),
						d.getUTCSeconds());
	
}

KMG.Util.formatJulianDay = function(jd, isUtc, format) {
	if (!format) {
		format = "LLL";
	}
	var dt = KMG.Util.julianToDate(jd);
	if (isUtc) 
		return moment(dt).format(format);
	else 
		return moment(dt).utc().format(format);
};

/*
KMG.Util.getTimezoneOffset = function() {
	return (new Date()).getTimezoneOffset() * 1000;
};

KMG.Util.getTimezoneOffsetJulians = function() {
	return (new Date()).getTimezoneOffset() / 60 / 24;
};
*/




/* File: MoonCalc.js */
/**
 * Lunar Algorithms
 * http://www.apoapsys.com
 * 
 * Copyright 2014 Kevin M. Gill <kmsmgill@gmail.com>
 *
 * Uses algorithms from:
 * Meeus, Jean: Astronomical Algorithms.
 * Richmond, Virg.: Willmann-Bell, 2009.
 * ISBN: 978-0943396613
 * http://amzn.com/0943396611
 * Chapter 13: Transformation of Coordinates
 * Chapter 22: Nutation and the Obliquity of the Ecliptic
 * Chapter 25: Solar Coordinates
 * Chapter 47: Position of the Moon
 * Chapter 48: Illuminated Fraction of the Moon's Disk
 * Chapter 49: Phases of the Moon
 * 
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 */

var KMG = (!KMG) ? {} : KMG;

KMG.MoonCalc = function() {

	function sin(v) {
		return Math.sin(v * Math.PI / 180);
	}

	function cos(v) {
		return Math.cos(v * Math.PI / 180);
	}

	function tan(v) {
		return Math.tan(v * Math.PI / 180);
	}


	function cramp(v, within) {
		return v - within * Math.floor(v / within);
	}

	function deg(v) {
		return cramp(v, 360);
	}

	function asin(v) {
		return Math.asin(v) * 180 / Math.PI;
	}

	function acos(v) {
		return Math.acos(v) * 180 / Math.PI;
	}

	function atan2(y, x) {
		return Math.atan2(y, x) * 180 / Math.PI;
	}

	function atan(v) {
		return asin(v / Math.sqrt(pow(v, 2) + 1));
	}

	function sqrt(v) {
		return Math.sqrt(v);
	}

	function pow(v, e) {
		return Math.pow(v, e);
	}

	function degToDecimal(degrees, minutes, seconds) {
		return degrees + (minutes / 60) + (seconds / 60 / 60);
	}

	function secToDecimal(seconds) {
		return degToDecimal(0, 0, seconds);
	}

	function minToDecimal(minutes, seconds) {
		if (!seconds) // Checking for undefined or null
			seconds = 0;
		return degToDecimal(0, minutes, seconds);
	}


	function positionOfTheSun(T, lunarContext) {
		
		if (!lunarContext || !lunarContext.obliquity || lunarContext.obliquity.T != T) {
			obliquity = nutationAndObliquity(T, lunarContext);
		} else {
			obliquity = lunarContext.obliquity;
		}
		
		// Geometric mean longitude of the Sun
		var L0 = 280.46646 + 36000.76983 * T + 0.0003032 * pow(T, 2);
		L0 = deg(L0);
		
		// Mean anomaly of the Sun
		var M = 357.52911 + 35999.05029 * T - 0.0001537 * pow(T, 2);
		M = deg(M);
		
		// Eccentricity of the Earth's orbit
		var e = 0.016708634 - 0.000042037 * T - 0.0000001267 * pow(T, 2);
		
		// Sun's equation of the center
		var C = (1.914602 - 0.004817 * T - 0.000014 * pow(T, 2)) * sin(M)
				+ (0.019993 - 0.000101 * T) * sin(2 * M)
				+ 0.000289 * sin(3 * M);
		
		// True longitude of the Sun
		var O = L0 + C;
		
		// True anomaly of the Sun
		var v = M + C;
		
		// Sun's radius vector (distance between the centers of
		// the Sun and the Earth, in AU)
		var R = (1.000001018 * (1 - pow(e, 2))) / (1 + e * cos(v));
		
		// Something important...
		var Î© = 125.04 - 1934.136 * T;
		
		// Apparent longitude of the Sun
		var Î» = O - 0.00569 - 0.00478 * sin(Î©);
		
		var Îµ = obliquity.Îµ;
		
		var X = cos(Îµ) * sin(O);
		var Y = cos(O);
		
		// Right Ascension of the Sun
		var Î± = atan2(Y, X);
		Î± = deg(Î±);
		
		// Declination of the Sun
		var Î´ = asin(sin(Îµ) * sin(O));
		
		Y = cos(Îµ) * sin(Î»);
		X = cos(Î»);
		
		// Apparent Right Ascension of the Sun
		var Î±App = atan2(Y, X);
		Î±App = deg(Î±App);
		
		// Apparent Declination of the Sun
		var Î´App = asin(sin(Îµ + 0.00256 * cos(Î©)) * sin(Î»));
		
		var sunPosition = {
			Î© : Î©,
			Î» : Î»,
			Î± : Î±,
			Î´ : Î´,
			Î±App : Î±App,
			Î´App : Î´App,
			L0 : L0,
			M : M,
			e : e,
			C : C,
			O : O,
			v : v,
			R : R,
			T : T
		};
		
		if (lunarContext) {
			lunarContext.sunPosition = sunPosition;
		}
		
		return sunPosition;
	}


	// Periodic terms for the longitude (sigmaI) and distance (sigmaR) of the Moon. 
	// Unit is 0.000001 degree for sigmaI, and 0.001 kilometer for sigmaR
	// Table 47.A, Chapter 47, Page 339
	var table47A = [
		[0,  0,  1,  0,  6288774, -20905355],
		[2,  0, -1,  0,  1274027,  -3699111],
		[2,  0,  0,  0,   658314,  -2955968],
		[0,  0,  2,  0,   213618,   -569925],
		[0,  1,  0,  0,  -185116,     48888],
		[0,  0,  0,  2,  -114332,     -3149],
		[2,  0, -2,  0,    58793,    246158],
		[2, -1, -1,  0,    57066,   -152138],
		[2,  0,  1,  0,    53322,   -170733],
		[2, -1,  0,  0,    45758,   -204586],
		[0,  1, -1,  0,   -40923,   -129620],
		[1,  0,  0,  0,   -34720,    108743],
		[0,  1,  1,  0,   -30383,    104755],
		[2,  0,  0, -2,    15327,     10321], 
		[0,  0,  1,  2,   -12528,         0],
		[0,  0,  1, -2,    10980,     79661],
		[4,  0, -1,  0,    10675,    -34728],
		[0,  0,  3,  0,    10034,    -23210],
		[4,  0, -2,  0,     8548,    -21636],
		[2,  1, -1,  0,    -7888,     24208],
		[2,  1,  0,  0,    -6766,     30824],
		[1,  0, -1,  0,    -5163,     -8379],
		[1,  1,  0,  0,     4987,    -16675],
		[2, -1,  1,  0,     4036,    -12831],
		[2,  0,  2,  0,     3994,    -10445],
		[4,  0,  0,  0,     3861,    -11650],
		[2,  0, -3,  0,     3665,     14403],
		[0,  1, -2,  0,    -2689,     -7003],
		[2,  0, -1,  2,    -2602,         0],
		[2, -1, -2,  0,     2390,     10056],
		[1,  0,  1,  0,    -2348,      6322],
		[2, -2,  0,  0,     2236,     -9884],
		[0,  1,  2,  0,    -2120,      5751],
		[0,  2,  0,  0,    -2069,         0],
		[2, -2, -1,  0,     2048,     -4950],
		[2,  0,  1, -2,    -1773,      4130],
		[2,  0,  0,  2,    -1595,         0],
		[4, -1, -1,  0,     1215,     -3958],
		[0,  0,  2,  2,    -1110,         0],
		[3,  0, -1,  0,     -892,      3258],
		[2,  1,  1,  0,     -810,      2616],
		[4, -1, -2,  0,      759,     -1897],
		[0,  2, -1,  0,     -713,     -2117],
		[2,  2, -1,  0,     -700,      2354],
		[2,  1, -2,  0,      691,         0],
		[2, -1,  0, -2,      596,         0],
		[4,  0,  1,  0,      549,     -1423],
		[0,  0,  4,  0,      537,     -1117],
		[4, -1,  0,  0,      520,     -1571],
		[1,  0, -2,  0,     -487,     -1739],
		[2,  1,  0, -2,     -399,         0],
		[0,  0,  2, -2,     -381,     -4421],
		[1,  1,  1,  0,      351,         0],
		[3,  0, -2,  0,     -340,         0],
		[4,  0, -3,  0,      330,         0],
		[2, -1,  2,  0,      327,         0],
		[0,  2,  1,  0,     -323,      1165],
		[1,  1, -1,  0,      299,         0],
		[2,  0,  3,  0,      294,         0],
		[2,  0, -1, -2,        0,      8752]];

	// Periodic terms for the latitude of the Moon (sigmaB)
	// The unit is 0.000001 degree
	var table47B = [
		[0,  0,  0,  1,  5128122],
		[0,  0,  1,  1,   280602],
		[0,  0,  1, -1,   277693],
		[2,  0,  0, -1,   173237],
		[2,  0, -1,  1,    55413],
		[2,  0, -1, -1,    46271],
		[2,  0,  0,  1,    32573],
		[0,  0,  2,  1,    17198],
		[2,  0,  1, -1,     9266],
		[0,  0,  2, -1,     8822],
		[2, -1,  0, -1,     8216],
		[2,  0, -2, -1,     4324],
		[2,  0,  1,  1,     4200],
		[2,  1,  0, -1,    -3359],
		[2, -1, -1,  1,     2463],
		[2, -1,  0,  1,     2211],
		[2, -1, -1, -1,     2065],
		[0,  1, -1, -1,    -1870],
		[4,  0, -1, -1,     1828],
		[0,  1,  0,  1,    -1794],
		[0,  0,  0,  3,    -1749],
		[0,  1, -1,  1,    -1565],
		[1,  0,  0,  1,    -1491],
		[0,  1,  1,  1,    -1475],
		[0,  1,  1, -1,    -1410],
		[0,  1,  0, -1,    -1344],
		[1,  0,  0, -1,    -1335],
		[0,  0,  3,  1,     1107],
		[4,  0,  0, -1,     1021],
		[4,  0, -1,  1,      833],
		[0,  0,  1, -3,      777],
		[4,  0, -2,  1,      671],
		[2,  0,  0, -3,      607],
		[2,  0,  2, -1,      596],
		[2, -1,  1, -1,      491],
		[2,  0, -2,  1,     -451],
		[0,  0,  3, -1,      439],
		[2,  0,  2,  1,      422],
		[2,  0, -3, -1,      421],
		[2,  1, -1,  1,     -366],
		[2,  1,  0,  1,     -351],
		[4,  0,  0,  1,      331],
		[2, -1,  1,  1,      315],
		[2, -2,  0, -1,      302],
		[0,  0,  1,  3,     -283],
		[2,  1,  1, -1,     -229],
		[1,  1,  0, -1,      223],
		[1,  1,  0,  1,      223],
		[0,  1, -2, -1,     -220],
		[2,  1, -1, -1,     -220],
		[1,  0,  1,  1,     -185],
		[2, -1, -2, -1,      181],
		[0,  1,  2,  1,     -177],
		[4,  0, -2, -1,      176],
		[4, -1, -1, -1,      166],
		[1,  0,  1, -1,     -164],
		[4,  0,  1, -1,      132],
		[1,  0, -1, -1,     -119],
		[4, -1,  0, -1,      115],
		[2, -2,  0,  1,      107]];

	// Periodic terms for the nutation in longitude and in obliquity.
	// Units is 0.0001
	var table22A = [
		[ 0,  0,  0,  0,  1, -171996, -174.2, 92025,  8.9],
		[-2,  0,  0,  2,  2,  -13187,   -1.6,  5736, -3.1],
		[ 0,  0,  0,  2,  2,   -2274,   -0.2,   977, -0.5],
		[ 0,  0,  0,  0,  0,    2062,    0.2,  -895,  0.5],
		[ 0,  1,  0,  0,  0,    1426,   -3.4,    54, -0.1],
		[ 0,  0,  1,  0,  0,     712,    0.1,    -7,  0.0],
		[-2,  1,  0,  2,  2,    -517,    1.2,   224, -0.6],
		[ 0,  0,  0,  2,  1,    -386,   -0.4,   200,  0.0],
		[ 0,  0,  1,  2,  2,    -301,    0.0,   129, -0.1],
		[-2, -1,  0,  2,  2,     217,   -0.5,   -95,  0.3],
		[-2,  0,  1,  0,  0,    -158,    0.0,     0,  0.0],
		[-2,  0,  0,  2,  1,     129,    0.1,   -70,  0.0],
		[ 0,  0, -1,  2,  2,     123,    0.0,   -53,  0.0],
		[ 2,  0,  0,  0,  0,      63,    0.0,     0,  0.0],
		[ 0,  0,  1,  0,  1,      63,    0.1,   -33,  0.0],
		[ 2,  0, -1,  2,  2,     -59,    0.0,    26,  0.0],
		[ 0,  0, -1,  0,  1,     -58,   -0.1,    32,  0.0],
		[ 0,  0,  1,  2,  1,     -51,    0.0,    27,  0.0],
		[-2,  0,  2,  0,  0,      48,    0.0,     0,  0.0],
		[ 0,  0, -2,  2,  1,      46,    0.0,   -24,  0.0],
		[ 2,  0,  0,  2,  2,     -38,    0.0,    16,  0.0],
		[ 0,  0,  2,  2,  2,     -31,    0.0,    13,  0.0],
		[ 0,  0,  2,  0,  0,      29,    0.0,     0,  0.0],
		[-2,  0,  1,  2,  2,      29,    0.0,   -12,  0.0],
		[ 0,  0,  0,  2,  0,      26,    0.0,     0,  0.0],
		[-2,  0,  0,  2,  0,     -22,    0.0,     0,  0.0],
		[ 0,  0, -1,  2,  1,      21,    0.0,   -10,  0.0],
		[ 0,  2,  0,  0,  0,      17,   -0.1,     0,  0.0],
		[ 2,  0, -1,  0,  1,      16,    0.0,     8,  0.0],
		[-2,  2,  0,  2,  2,     -16,    0.1,     7,  0.0],
		[ 0,  1,  0,  0,  1,     -15,    0.0,     9,  0.0],
		[-2,  0,  1,  0,  1,     -13,    0.0,     7,  0.0],
		[ 0, -1,  0,  0,  1,     -12,    0.0,     6,  0.0],
		[ 0,  0,  2, -2,  0,      11,    0.0,     0,  0.0],
		[ 2,  0, -1,  2,  1,     -10,    0.0,     5,  0.0],
		[ 2,  0,  1,  2,  2,      -8,    0.0,     3,  0.0],
		[ 0,  1,  0,  2,  2,       7,    0.0,    -3,  0.0],
		[-2,  1,  1,  0,  0,      -7,    0.0,     0,  0.0],
		[ 0, -1,  0,  2,  0,      -7,    0.0,     3,  0.0],
		[ 2,  0,  0,  2,  1,      -7,    0.0,     3,  0.0],
		[ 2,  0,  1,  0,  0,       6,    0.0,     0,  0.0],
		[-2,  0,  2,  2,  2,       6,    0.0,    -3,  0.0],
		[-2,  0,  1,  2,  1,       6,    0.0,    -3,  0.0],
		[ 2,  0, -2,  0,  1,      -6,    0.0,     3,  0.0],
		[ 2,  0,  0,  0,  1,      -6,    0.0,     3,  0.0],
		[ 0, -1,  1,  0,  0,       5,    0.0,     0,  0.0],
		[-2, -1,  0,  2,  1,      -5,    0.0,     3,  0.0],
		[-2,  0,  0,  0,  1,      -5,    0.0,     3,  0.0],
		[ 0,  0,  2,  2,  1,      -5,    0.0,     3,  0.0],
		[-2,  0,  2,  0,  1,       4,    0.0,     0,  0.0],
		[-2,  1,  0, -2,  1,       4,    0.0,     0,  0.0],
		[ 0,  0,  1, -2,  0,       4,    0.0,     0,  0.0],
		[-1,  0,  1,  0,  0,      -4,    0.0,     0,  0.0],
		[-2,  1,  0,  0,  0,      -4,    0.0,     0,  0.0],
		[ 1,  0,  0,  0,  0,      -4,    0.0,     0,  0.0],
		[ 0,  0,  1,  2,  0,       3,    0.0,     0,  0.0],
		[ 0,  0, -2,  2,  2,      -3,    0.0,     0,  0.0],
		[-1, -1,  1,  0,  0,      -3,    0.0,     0,  0.0],
		[ 0,  1,  1,  0,  0,      -3,    0.0,     0,  0.0],
		[ 0, -1,  1,  2,  2,      -3,    0.0,     0,  0.0],
		[ 2, -1, -1,  2,  2,      -3,    0.0,     0,  0.0],
		[ 0,  0,  3,  2,  2,      -3,    0.0,     0,  0.0],
		[ 2, -1,  0,  2,  2,      -3,    0.0,     0,  0.0]];

	// Chapter 22
	function nutationAndObliquity(T, lunarContext) {
		
		// Mean Elongation Of The Moon From The Sun
		var D = 297.85036 + 445267.111480 * T - 0.0019142 * (T * T) + (T * T * T) / 189474;

		// Mean Anomaly of the Sun (Earth)
		var M = 357.52772 + 35999.050340 * T - 0.0001603 * (T * T) - (T * T * T) / 300000;



		// Mean Anomaly of the Moon
		var M_ = 134.96298 + 477198.867398 * T + 0.0086972 * (T * T) + (T * T * T) / 56250;



		// Moon's Argument of Latitude (ch. 22)
		var F = 93.27191 + 483202.017538 * T - 0.0036825 * (T * T) + (T * T * T) / 327270;



		// Longitude of teh ascending node of the Moon's mean orbit on the ecliptic
		// Measured from the mean equinox of the date (ch. 22)
		var Î© = 125.04452 - 1934.136261 * T + 0.0020708 * (T * T) + (T * T * T) / 450000;




		// Mean Longitude of the Sun
		var L = 280.4665 + 36000.7698 * T;

		// Mean Longitude of the Moon
		var L_ = 218.3165 + 481267.8813 * T;

		// Time measured in units of 10000 Julian years since J2000.0
		var U = T / 100;
		
		// Mean obliquity of the ecliptic
		var Îµ0 = degToDecimal(23, 26, 21.448)
						-degToDecimal(0, 0, 46.8150) * T
						-1.55 * pow(U, 2)
						+ 1999.25 * pow(U, 3)
						- 51.38 * pow(U, 4)
						- 249.67 * pow(U, 5)
						- 39.05 * pow(U, 6)
						+ 7.12 * pow(U, 7)
						+ 27.87 * pow(U, 8)
						+ 5.79 * pow(U, 9)
						+ 2.45 * pow(U, 10);
		
		D = deg(D);
		M = deg(M);
		M_ = deg(M_);
		F = deg(F);
		Î© = deg(Î©);


		// Nutation in Longitude Limited accuracy:
		var Î”Ïˆ = -17.20 * sin(Î©) - 1.32 * sin(2 * L) - 0.23 * sin(2 * L_) + 0.21 * sin(2 * Î©);
		
		// Nutation in Obliquity Limited accuracy:
		var Î”Îµ = 9.20 * cos(Î©) + 0.57 * cos(2 * L) + 0.10 * cos(2 * L_) - 0.09 * cos(2 * Î©);
		
		// True obliquity of the ecliptic
		var Îµ = Îµ0 + Î”Îµ / 60 / 60;
		
		/*
		// Nutation in Longitude
		var deltaPsi = 0
		
		// Nutation in Obliquity
		var deltaEpsilon = 0;
		
		for (var i = 0; i < table22A.length; i++) {
			var row = table22A[i];
			
			var arg = row[0] * D + row[1] * M + row[2] * M_ + row[3] * F + row[4] * omega;
			
			var v0 = (row[5]) ? row[5] : 1;
			var v1 = (row[6]) ? row[6]  * T : 1;
			
			var v2 = (row[7]) ? row[7] : 1;
			var v3 = (row[8]) ? row[8] * T : 1;
			
			deltaPsi += v0 * sin(arg) + v1 * sin(arg);
			deltaEpsilon += v2 * cos(arg) + v3 * cos(arg);
		}
		*/
		
		

		var obliquity = {
			T : T,
			D : D,
			M : M,
			M_ : M_,
			F : F,
			Î© : Î©,
			Î”Ïˆ : Î”Ïˆ,
			Î”Îµ : deg(Î”Îµ),
			Îµ0 : Îµ0,
			Îµ : Îµ
		};
		
		if (lunarContext) {
			lunarContext.obliquity = obliquity;
		}
		
		return obliquity;

	}




	// Chapter 47
	function positionOfTheMoon(T, lunarContext) {
		
		var nutation;
		if (!lunarContext || !lunarContext.nutation || lunarContext.nutation.T != T) {
			nutation = nutationAndObliquity(T, lunarContext);
		} else {
			nutation = lunarContext.nutation;
		}
		
		// Mean Longitude of the Sun (ch. 22)
		var L = 280.4665 + 36000.7698 * T;
		
		// Mean Longitude of the Moon (ch. 47.1), or Mean Equinox of the Date, including the constant term of the 
		// effect of the light time (-0.70)
		var L_ = 218.3164477 + 481267.88123421 * T - 0.0015786 * (T * T) + (T * T * T) / 538841 - (T * T * T * T) / 65194000;
		
		// Mean Elongation of the Moon (ch. 47.2)
		var D = 297.8501921 + 445267.1114034 * T - 0.0018819 * (T * T) + (T * T * T) / 545868 - (T * T * T * T) / 113065000;

		// Mean Anomaly of the Sun (ch. 47.3)
		var M = 357.5291092 + 35999.0502909 * T - 0.0001536 * (T * T) + (T * T * T) / 24490000;
		
		// Mean Anomaly of the Moon (ch. 47.4)
		var M_ = 134.9633964 + 477198.8675005 * T + 0.0087414 * (T * T) + (T * T * T) / 69699 - (T * T * T *T) / 14712000;
		
		// Moon's Argument of Latitude (mean distance of the Moon from it's ascending node) (ch. 47.5)
		var F = 93.2720950 + 483202.0175233 * T - 0.0036539 * (T * T) - (T * T * T) / 3526000 + (T * T * T * T) / 863310000;
		
		// Longitude of the Mean Ascending Node (ch. 47.7)
		var Î© = 125.0445479 - 1934.1362891 * T + 0.0020754 * (T * T) + (T * T * T) / 467441 - (T * T * T * T) / 60616000;
		
		var A1 = 119.75 + 131.849 * T;
		var A2 = 53.09 + 479264.290 * T;
		var A3 = 313.45 + 481266.484 * T;
		
		// Eccentricity of the Earth's orbit around the Sun
		var E = 1 - 0.002516 * T - 0.0000074 * (T * T);
		
		L = deg(L);
		L_ = deg(L_);
		D = deg(D);
		M = deg(M);
		M_ = deg(M_);
		F = deg(F);
		A1 = deg(A1);
		A2 = deg(A2);
		A3 = deg(A3);
		
		// Longitude of the Moon, unit is 0.000001 degrees
		var Î£l = 0;
		var Î£r = 0;
		var Î£b = 0;
		
		for (var i = 0; i < table47A.length; i++) {
			var row = table47A[i];
			var e;
			if (row[1] == 1 || row[1] == -1) {
				e = E;
			} else if (row[1] == 2 || row[1] == -2) {
				e = E * E;
			} else {
				e = 1;
			}
			
			Î£l += row[4] * e * sin(row[0] * D + row[1] * M + row[2] * M_ + row[3] * F);
			Î£r += row[5] * e * cos(row[0] * D + row[1] * M + row[2] * M_ + row[3] * F);		
			
		}
		
		Î£l += 3958 * sin(A1)
				+ 1962 * sin(L_ - F)
				+ 318 * sin(A2);
		
		
		for (var i = 0; i < table47B.length; i++) {
			var row = table47B[i];
			var e;
			if (row[1] == 1 || row[1] == -1) {
				e = E;
			} else if (row[1] == 2 || row[1] == -2) {
				e = E * E;
			} else {
				e = 1;
			}
			
			Î£b += row[4] * e * sin(row[0] * D + row[1] * M + row[2] * M_ + row[3] * F);
		}
		
		Î£b += -2235 * sin(L_)
				+ 382 * sin(A3)
				+ 175 * sin(A1 - F)
				+ 175 * sin(A1 + F)
				+ 127 * sin(L_ - M_)
				- 115 * sin(L_ + M_);
		
		// Geocentric longitude of the center of the Moon
		var Î» = L_ + Î£l / 1000000;
		
		
		
		
		// Geocentric latitude of the center of the Moon
		var Î² = Î£b / 1000000;
		
		// Distance in kilometers between the centers of the Earth and Moon.
		var Î” = 385000.56 + Î£r / 1000;
		
		// Equatorial horizontal parallax
		var Ï€ = asin(6378.14 / Î”);

		
		
		// Nutation in Longitude
		var Î”Ïˆ = nutation.Î”Ïˆ / 60 / 60;
		
		// Nutation in Obliquity
		var Î”Îµ = nutation.Î”Îµ;

		

		// Time measured in units of 10000 Julian years since J2000.0
		var U = T / 100;

		
		var apparentÎ» = Î» + Î”Ïˆ;

		// Mean obliquity of the ecliptic
		var Îµ0 = nutation.Îµ0;
		
		// True obliquity of the ecliptic
		var Îµ = nutation.Îµ;
		
		// Apparent right ascension (ch. 13.3)
		var X = cos(Î»);
		var Y = (sin(Î») * cos(Îµ) - tan(Î²) * sin(Îµ));
		var Î± = deg(atan2(Y, X));
		//var Î± = atan((sin(Î») * cos(Îµ) - tan(Î²) * sin(Îµ)) / cos(Î»));
		
		// Apparent declination (ch. 13.4)
		var Î´ = asin(sin(Î²) * cos(Îµ) + cos(Î²) * sin(Îµ) * sin(Î»));
		
		// Mean perigee of the lunar orbit
		var Î  = 83.3532465 
					+ 4096.0137287 * T 
					- 0.0103200 * pow(T, 2)
					- pow(T, 3) / 80053
					+ pow(T, 4) / 18999000;

		var position = {
			T : T,
			Î£l : Î£l, 
			Î£r : Î£r, 
			Î£b : Î£b,
			Î» : Î»,
			apparentÎ» : apparentÎ»,
			Î²   : Î²,
			Î”  : Î”,
			Î©  : Î©,
			Î”Ïˆ : Î”Ïˆ,
			Î”Îµ : Î”Îµ,
			Îµ0 : Îµ0,
			Îµ : Îµ,
			Î±  : Î±,
			Î±By15 : Î± / 15,
			Î´ : Î´,
			Î  : Î ,
			Ï€     : Ï€,
			E      : E,
			L      : L,
			L_     : L_,
			D      : D,
			M      : M,
			M_     : M_,
			F      : F,
			A1     : A1,
			A2     : A2,
			A3     : A3
		};
		
		if (lunarContext) {
			lunarContext.position = position;
		}
		
		return position;
	}





	function opticalLibrationsOfTheMoon(T, lunarContext) {
		
		var position;
		if (!lunarContext || !lunarContext.position || lunarContext.position.T != T) {
			position = positionOfTheMoon(T, lunarContext);
		} else {
			position = lunarContext.position;
		}

		var nutation;
		if (!lunarContext || !lunarContext.obliquity || lunarContext.obliquity.T != T) {
			nutation = nutationAndObliquity(T, lunarContext);
		} else {
			nutation = lunarContext.obliquity;
		}

		// Inclination of the mean lunar equator to the ecliptic
		var I = 1.54242; 	
		
		
		var W = position.Î» - secToDecimal(nutation.Î”Ïˆ) - nutation.Î©;
		W = deg(W);
		
		var X = (sin(W) * cos(position.Î²) * cos(I) - sin(position.Î²) * sin(I));
		var Y = cos(W) * cos(position.Î²);
		var A = deg(atan2(X, Y), 360);
		//var A = atan((sin(W) * cos(position.Î²) * cos(I) - sin(position.Î²) * sin(I)) / (cos(W) * cos(position.Î²)))
		
		// Optical libration in longitude
		var l_ = A - position.F;
		
		// Optical libration in latitude
		var b_ = asin(-sin(W) * cos(position.Î²) * sin(I) - sin(position.Î²) * cos(I));
		
		var optLibr = {
			T : T,
			I : I,
			W : W,
			A : A,
			l_ : l_,
			b_ : b_
		};
		
		if (lunarContext) {
			lunarContext.optLibr = optLibr;
		}
		
		return optLibr;
	}




	function physicalLibrationsOfTheMoon(T, lunarContext) {
		
		var optLibr, position, nutation;
		
		if (!lunarContext || !lunarContext.optLibr || lunarContext.optLibr.T != T) {
			optLibr = opticalLibrationsOfTheMoon(T, lunarContext);
		} else {
			optLibr = lunarContext.optLibr;
		}
		
		if (!lunarContext || !lunarContext.position || lunarContext.position.T != T) {
			position = positionOfTheMoon(T, lunarContext);
		} else {
			position = lunarContext.position;
		}
		
		if (!lunarContext || !lunarContext.obliquity || lunarContext.obliquity.T != T) {
			nutation = nutationAndObliquity(T, lunarContext);
		} else {
			nutation = lunarContext.obliquity;
		}
		
		
		var A = optLibr.A;
		var M_ = position.M_;
		var M = position.M;
		var F = position.F;
		var D = position.D;
		var E = position.E;
		var Î© = nutation.Î©;
		
		var b_ = optLibr.b_;
		
		var K1 = 119.75 + 131.849 * T;
		var K2 = 72.56 + 20.186 * T;
		
		var Ï = - 0.02752 * cos(M_)
				- 0.02245 * sin(F)
				+ 0.00684 * cos(M_ - 2 * F)
				- 0.00293 * cos(2 * F)
				- 0.00085 * cos(2 * F - 2 * D)
				- 0.00054 * cos(M_ - 2 * D)
				- 0.00020 * sin(M_ + F)
				- 0.00020 * cos(M_ + 2 * F)
				- 0.00020 * cos(M_ - F)
				+ 0.00014 * cos(M_ + 2 * F - 2 * D);
				
		
		var Ïƒ = - 0.02816 * sin(M_)
				+ 0.02244 * cos(F)
				- 0.00682 * sin(M_ - 2 * F)
				- 0.00279 * sin(2 * F)
				- 0.00083 * sin(2 * F - 2 * D)
				+ 0.00069 * sin(M_ - 2 * D)
				+ 0.00040 * cos(M_ + F)
				- 0.00025 * sin(2 * M_)
				- 0.00023 * sin(M_ + 2 * F)
				+ 0.00020 * cos(M_ - F)
				+ 0.00019 * sin(M_ - F)
				+ 0.00013 * sin(M_ + 2 * F - 2 * D)
				- 0.00010 * cos(M_ - 3 * F);
		
		var Ï„ = + 0.02520 * E * sin(M)
				+ 0.00473 * sin(2 * M_ - 2 * F)
				- 0.00467 * sin(M_)
				+ 0.00396 * sin(K1)
				+ 0.00276 * sin(2 * M_ - 2 * D)
				+ 0.00196 * sin(Î©)
				- 0.00183 * cos(M_ - F)
				+ 0.00115 * sin(M_ - 2 * D)
				- 0.00096 * sin(M_ - D)
				+ 0.00046 * sin(2 * F - 2 * D)
				- 0.00039 * sin(M_ - F)
				- 0.00032 * sin(M_ - M - D)
				+ 0.00027 * sin(2 * M_ - M - 2 * D)
				+ 0.00023 * sin(K2)
				- 0.00014 * sin(2 * D)
				+ 0.00014 * cos(2 * M_ - 2 * F)
				- 0.00012 * sin(M_ - 2 * F)
				- 0.00012 * sin(2 * M_)
				+ 0.00011 * sin(2 * M_ - 2 * M - 2 * D);
		
		var l__ = -Ï„ + (Ï * cos(A) + Ïƒ * sin(A)) * tan(b_);
		var b__ = Ïƒ * cos(A) - Ï * sin(A);
		
		
		var physLibr = {
			M : M,
			M_ : M_,
			F : F,
			D : D,
			E : E,
			A : A,
			Ï : Ï,
			Ïƒ : Ïƒ,
			Ï„ : Ï„,
			K1 : K1,
			K2 : K2,
			l__ : l__,
			b__ : b__
		};
		
		if (lunarContext) {
			lunarContext.physLibr = physLibr;
		}
		
		return physLibr;
		
	}



	function totalLibrationsOfTheMoon(T, lunarContext) {
		
		var optLibr, physLibr;
		
		if (!lunarContext || !lunarContext.optLibr || lunarContext.optLibr.T != T) {
			optLibr = opticalLibrationsOfTheMoon(T, lunarContext);
		} else {
			optLibr = lunarContext.optLibr;
		}
		
		if (!lunarContext || !lunarContext.physLibr || lunarContext.physLibr.T != T) {
			physLibr = physicalLibrationsOfTheMoon(T, lunarContext);
		} else {
			physLibr = lunarContext.physLibr;
		}
		
		var l = optLibr.l_ + physLibr.l__;
		var b = optLibr.b_ + physLibr.b__;
		
		
		var ttlLibr = {
			T : T,
			l : l,
			b : b
		};
		
		if (lunarContext) {
			lunarContext.ttlLibr = ttlLibr;
		}
		
		return ttlLibr;
		
	}

	function selenographicPositionOfTheSun(T, lunarContext) {
		
		var position, sunPos, nutation, physLibr;
		
		if (!lunarContext || !lunarContext.position || lunarContext.position.T != T) {
			position = positionOfTheMoon(T, lunarContext);
		} else {
			position = lunarContext.position;
		}
		
		if (!lunarContext || !lunarContext.sunPosition || lunarContext.sunPosition.T != T) {
			sunPos = positionOfTheSun(T, lunarContext);
		} else {
			sunPos = lunarContext.sunPosition;
		}
		
		if (!lunarContext || !lunarContext.obliquity || lunarContext.obliquity.T != T) {
			nutation = nutationAndObliquity(T, lunarContext);
		} else {
			nutation = lunarContext.obliquity;
		}
		
		if (!lunarContext || !lunarContext.physLibr || lunarContext.physLibr.T != T) {
			physLibr = physicalLibrationsOfTheMoon(T, lunarContext);
		} else {
			physLibr = lunarContext.physLibr;
		}
		
		
		// Geocentric right ascension of the Sun
		var Î±0 = sunPos.Î±;
		
		// Geocentric declination of the Sun
		var Î´0 = sunPos.Î´;
		
		// Geocentric longitude of Sun
		var Î»0 = sunPos.O;

		// Geocentric right ascension of the Moon
		var Î± = position.Î±;
		
		// Geocentric declination of the Moon
		var Î´ = position.Î´;
		
		// Geocentric longitude of Moon
		var Î» = position.Î»;
		
		
		// Distance from the Earth to the Sun
		var R = sunPos.R * 149597870.700;
		
		// Distance from the Earth to the Moon
		var Î” = position.Î”;
		
		// Geocentric latitude of the center of the Moon
		var Î² = position.Î²;
		
		
		
		var Î»H = Î»0 + 180 + (Î”/R) * 57.296 * cos(Î²) * sin(Î»0 - Î»);
		
		var Î²H =  Î” / R * Î²;
		
		
		
		
		// Inclination of the mean lunar equator to the ecliptic
		var I = 1.54242; 	
		
		var W = Î»H - secToDecimal(nutation.Î”Ïˆ) - nutation.Î©;
		W = deg(W);
		
		var X = (sin(W) * cos(Î²H) * cos(I) - sin(Î²H) * sin(I));
		var Y = cos(W) * cos(Î²H);
		var A = deg(atan2(X, Y), 360);

		// Optical libration in longitude
		var l_0 = A - position.F;
		
		// Optical libration in latitude
		var b_0 = asin(-sin(W) * cos(Î²H) * sin(I) - sin(Î²H) * cos(I));
		
		
		var l__0 = -physLibr.Ï„ + (physLibr.Ï * cos(A) + physLibr.Ïƒ * sin(A)) * tan(b_0);
		var b__0 = physLibr.Ïƒ * cos(A) - physLibr.Ï * sin(A)
		
		var l0 = l_0 + l__0;
		var b0 = b_0 + b__0;;
		
		// Selenographic colongitude of the Sun
		var c0;
		
		if (l0 < 90) {
			c0 = 90 - l0;
		} else {
			c0 = 450 - l0;
		}

		
		var seleSunPosition = {
			T : T,
			Î»H : Î»H,
			Î²H : Î²H,
			l0 : l0,
			b0 : b0,
			c0 : c0,
			l_0 : l_0,
			b_0 : b_0,
			l__0 : l__0,
			b__0 : b__0,
			W : W,
			A : A,
			R : R,
			Î” : Î”
		};
		
		if (lunarContext) {
			lunarContext.seleSunPosition = seleSunPosition;
		}
		
		return seleSunPosition;
		
	}
	
	function phaseOfTheMoon(T, lunarContext) {
			
		var seleSunPosition;
		
		if (!lunarContext || !lunarContext.seleSunPosition || lunarContext.seleSunPosition.T != T) {
			seleSunPosition = selenographicPositionOfTheSun(T, lunarContext);
		} else {
			seleSunPosition = lunarContext.seleSunPosition;
		}
		
		
		
		var p = "";
		
		
		var c0 = seleSunPosition.c0;
		
		if (c0 >= 355 || c0 < 5) {
			p = "First Quarter";
		} else if (c0 < 85) {
			p = "Waxing Gibbous";
		} else if (c0 >= 85 && c0 < 95) {
			p = "Full Moon";
		} else if (c0 < 175) {
			p = "Waning Gibbous";
		} else if (c0 >= 175 && c0 < 185) {
			p = "Last Quarter";
		} else if (c0 < 265) {
			p = "Waning Crescent";
		} else if (c0 >= 265 && c0 < 275) {
			p = "New Moon";
		} else if (c0 < 355) {
			p = "Waxing Crescent";
		}
		
		
		var phase = {
			phase : p
		};
		
		if (lunarContext) {
			lunarContext.phase = phase;
		}
		
		return phase;
	}


	function positionAngleOfTheMoon(T, lunarContext) {
		
		var nutation, position, physLibr, ttlLibr;
		
		if (!lunarContext || !lunarContext.obliquity || lunarContext.obliquity.T != T) {
			nutation = nutationAndObliquity(T, lunarContext);
		} else {
			nutation = lunarContext.obliquity;
		}
		
		if (!lunarContext || !lunarContext.position || lunarContext.position.T != T) {
			position = positionOfTheMoon(T, lunarContext);
		} else {
			position = lunarContext.position;
		}
		
		if (!lunarContext || !lunarContext.physLibr || lunarContext.physLibr.T != T) {
			physLibr = physicalLibrationsOfTheMoon(T, lunarContext);
		} else {
			physLibr = lunarContext.physLibr;
		}
		
		if (!lunarContext || !lunarContext.ttlLibr || lunarContext.ttlLibr.T != T) {
			ttlLibr = totalLibrationsOfTheMoon(T, lunarContext);
		} else {
			ttlLibr = lunarContext.ttlLibr;
		}
		
		var b = ttlLibr.b;
		
		var Î© = nutation.Î©;
		
		// Inclination of the mean lunar equator to the ecliptic
		var I = 1.54242
		
		var Î”Ïˆ = nutation.Î”Ïˆ;
		
		var Ï = physLibr.Ï;
		
		var Îµ = position.Îµ;
		
		var Î± = position.Î±;
		
		var Ïƒ = physLibr.Ïƒ;
		
		var V = Î© + Î”Ïˆ + Ïƒ / sin(I);
		
		var Y = sin(I + Ï) * sin(V);
		
		var X = sin(I + Ï) * cos(V) * cos(Îµ) - cos(I + Ï) * sin(Îµ);
		
		var Ï‰ = atan2(Y, X);
		
		var P = asin((sqrt(pow(X, 2) + pow(Y, 2)) * cos(Î± - Ï‰)) / cos(b));
		
		var posAngle = {
			P : P
		};
		
		if (lunarContext) {
			lunarContext.posAngle = posAngle;
		}
		
		return posAngle;
		
	}



	function illuminatedFractionOfTheMoonsDisk(T, lunarContext) {
		
		var position, sunPos;
		
		if (!lunarContext || !lunarContext.position || lunarContext.position.T != T) {
			position = positionOfTheMoon(T, lunarContext);
		} else {
			position = lunarContext.position;
		}
		
		if (!lunarContext || !lunarContext.sunPosition || lunarContext.sunPosition.T != T) {
			sunPos = positionOfTheSun(T, lunarContext);
		} else {
			sunPos = lunarContext.sunPosition;
		}
		
		
		// Geocentric right ascension of the Sun
		var Î±0 = sunPos.Î±App;
		
		// Geocentric declination of the Sun
		var Î´0 = sunPos.Î´App;
		
		// Geocentric longitude of Sun
		var Î»0 = sunPos.O;
		
		// Geocentric right ascension of the Moon
		var Î± = position.Î±;
		
		// Geocentric declination of the Moon
		var Î´ = position.Î´;
		
		// Geocentric longitude of Moon
		var Î» = position.Î»;
		
		// Geocentric elongation of the Moon from the Sun
		var Ïˆ = acos(sin(Î´0) * sin(Î´) + cos(Î´0) * cos(Î´) * cos(Î±0 - Î±));
		
		// Distance from the Earth to the Sun
		var R = sunPos.R * 149597870.700;
		
		// Distance from the Earth to the Moon
		var Î” = position.Î” ;
		
		var Y = R * sin(Ïˆ);
		var X =  Î” - R * cos(Ïˆ)
		
		// Phase angle (Selenocentric elongation of the Earth from the Sun)
		var i = atan2(Y, X) ;
		
		
		var D = position.D;
		
		var M = position.M;
		
		var M_ = position.M_;
		
		
		// Phase angle (Selenocentric elongation of the Earth from the Sun)
		// Less accurate method
		/*
		var i = 180 - D
				- 6.289 * sin(M_)
				+ 2.100 * sin(M)
				- 1.274 * sin(2 * D - M_)
				- 0.658 * sin(2 * D)
				- 0.214 * sin(2 * M_)
				- 0.110 * sin(D);
		*/
		
		// Illuminated fraction of the Moon's disk
		var k = (1 + cos(i)) / 2;
		
		var Y = cos(Î´0) * sin(Î±0 - Î±);
		var X = sin(Î´0) * cos(Î´) - cos(Î´0) * sin(Î´) * cos(Î±0 - Î±);
		
		// Position angle of the Moon's bright limb
		var Ï‡ = atan2(Y, X);
		
		
		var illumFrac = {
			T : T,
			k : k,
			i : i,
			Ï‡ : Ï‡
		};
		
		if (lunarContext) {
			lunarContext.illumFrac = illumFrac;
		}
		
		return illumFrac;
	}



	function calculateAll(jd) {
		var T = (jd - 2451545) / 36525; // Julian Centuries since Epoch JD2000.0
		
		var context = {T : T};
		
		positionOfTheSun(T, context);
		nutationAndObliquity(T, context);
		positionOfTheMoon(T, context);
		opticalLibrationsOfTheMoon(T, context);
		physicalLibrationsOfTheMoon(T, context);
		totalLibrationsOfTheMoon(T, context);
		positionAngleOfTheMoon(T, context);
		illuminatedFractionOfTheMoonsDisk(T, context);
		selenographicPositionOfTheSun(T, context);
		phaseOfTheMoon(T, context);
		
		return context;
	}

	return {
		degToDecimal : degToDecimal,
		secToDecimal : secToDecimal,
		positionOfTheSun : positionOfTheSun,
		nutationAndObliquity : nutationAndObliquity,
		positionOfTheMoon : positionOfTheMoon,
		opticalLibrationsOfTheMoon : opticalLibrationsOfTheMoon,
		physicalLibrationsOfTheMoon : physicalLibrationsOfTheMoon,
		totalLibrationsOfTheMoon : totalLibrationsOfTheMoon,
		positionAngleOfTheMoon : positionAngleOfTheMoon,
		illuminatedFractionOfTheMoonsDisk : illuminatedFractionOfTheMoonsDisk,
		selenographicPositionOfTheSun : selenographicPositionOfTheSun,
		phaseOfTheMoon : phaseOfTheMoon,
		calculateAll : calculateAll
	};
};

/* File: Orbit.js */



KMG.SolveKeplerFunc1 = function(ecc, M) {
	this.solve = function(x) {
		return M + ecc * Math.sin(x);
	};
};

KMG.SolveKeplerFunc2 = function(ecc, M) {
	this.solve = function(x) {
		return x + (M + ecc * Math.sin(x) - x) / (1 - ecc * Math.cos(x));
	};
};

KMG.SolveKeplerLaguerreConway = function(ecc, M) {
	this.solve = function(x) {
		var s = ecc * Math.sin(x);
		var c = ecc * Math.cos(x);
		var f = x - s - M;
		var f1 = 1 - c;
		var f2 = s;

		x += -5 * f / (f1 + KMG.Math.sign(f1) * Math.sqrt(Math.abs(16 * f1 * f1 - 20 * f * f2)));
		return x;
	};
};

KMG.SolveKeplerLaguerreConwayHyp = function(ecc, M) {
	this.solve = function(x) {
		var s = ecc * KMG.Math.sinh(x);
		var c = ecc * KMG.Math.cosh(x);
		var f = x - s - M;
		var f1 = c - 1;
		var f2 = s;

		x += -5 * f / (f1 + KMG.Math.sign(f1) * Math.sqrt(Math.abs(16 * f1 * f1 - 20 * f * f2)));
		return x;
	};
};

KMG.Orbit = function() 
{



};

// Values valid from 1800 AD through 2050 AD
// See http://iau-comm4.jpl.nasa.gov/keplerformulae/kepform.pdf
KMG.OrbitDefinitions = {
	
	template : {
		semiMajorAxis : 0,
		longitudeOfPerihelion : 0,
		eccentricity : 0,
		inclination : 0,
		ascendingNode : 0, 
		argOfPeriapsis : 0,
		meanAnomalyAtEpoch : 0,
		period : 0
	},
	
	mercury : {
		semiMajorAxis : 0.38709927,
		longitudeOfPerihelion : 77.45779628, //longitudeOfPerihelion
		eccentricity : 0.20563593, //eccentricity
		inclination : 7.00497902, // inclination
		ascendingNode : 48.33076593, //longitudeOfAscendingNode
		argOfPeriapsis : 29.124, // = longitudeOfPerihelion - longitudeOfAscendingNode
		meanAnomalyAtEpoch : 174.796,
		period : 0.240876 * 365.25
	},
	
	venus : {
		semiMajorAxis : 0.72333566,
		longitudeOfPerihelion : 131.60246718,
		eccentricity : 0.00677672,
		inclination : 3.39467605,
		ascendingNode : 76.67984255, 
		argOfPeriapsis : 55.186,
		meanAnomalyAtEpoch : 50.115,
		period : 0.615198 * 365.25
	},
	
	earth : {
		semiMajorAxis : 1.00000261,
		longitudeOfPerihelion : 102.947,
		eccentricity : 0.0167,
		inclination : 0.0001,
		ascendingNode : 348.73936,
		argOfPeriapsis : 114.20783,
		meanAnomalyAtEpoch : 357.51716,
		period : 1.000017421 * 365.25
	},

	mars : {
		semiMajorAxis : 1.52371034,
		longitudeOfPerihelion : -23.94362959,
		eccentricity : 0.09339410,
		inclination : 1.84969142,
		ascendingNode : 49.55953891, 
		argOfPeriapsis : 286.537,
		meanAnomalyAtEpoch : 19.3564,
		period : 1.8808 * 365.25
	},

	ceres : {
		semiMajorAxis : 2.7654,
		longitudeOfPerihelion : 0,
		eccentricity : 0.079138,
		inclination : 10.587,
		ascendingNode : 80.3932, 
		argOfPeriapsis : 72.5898,
		meanAnomalyAtEpoch : 113.410,
		period : 4.60 * 365.25
	},
	vesta : {
		semiMajorAxis : 2.361534940452743E+00,
		longitudeOfPerihelion : 149.84,
		eccentricity : 9.002246842706077E-02,
		inclination : 7.133937445524650E+00,
		ascendingNode : 1.039514249511780E+02, 
		argOfPeriapsis : 1.495866622389732E+02,
		meanAnomalyAtEpoch : 3.410238523604547E+02,
		period : 1.325531309325364E+03
	},
	
	jupiter : {
		semiMajorAxis : 5.20288700,
		longitudeOfPerihelion : 14.72847983,
		eccentricity : 0.04838624,
		inclination : 1.30439695,
		ascendingNode : 100.47390909, 
		argOfPeriapsis : 275.066, 
		meanAnomalyAtEpoch : 18.818,
		period : 11.8618 * 365.25
	},
	
	saturn : {
		semiMajorAxis : 9.53667594,
		longitudeOfPerihelion : 92.59887831,
		eccentricity : 0.05386179,
		inclination : 2.48599187,
		ascendingNode : 113.66242448, 
		argOfPeriapsis : 336.013862, //-21.063546169999995
		meanAnomalyAtEpoch : 320.349750,
		period : 29.4571 * 365.25
	},
	
	uranus : {
		semiMajorAxis : 19.18916464,
		longitudeOfPerihelion : 170.95427630,
		eccentricity : 0.04725744,
		inclination : 0.77263783,
		ascendingNode : 74.01692503, 
		argOfPeriapsis : 96.93735127000001,
		meanAnomalyAtEpoch : 142.955717,
		period : 84.323326 * 365.25
	},
	
	neptune : {
		semiMajorAxis : 30.06992276,
		longitudeOfPerihelion : 44.96476227,
		eccentricity : 0.00859048,
		inclination : 1.77004347,
		ascendingNode : 131.78422574, 
		argOfPeriapsis : 265.646853,
		meanAnomalyAtEpoch : 267.767281,
		period : 164.79 * 365.25
	},
	
	pluto : {
		semiMajorAxis : 39.48211675,
		longitudeOfPerihelion : 224.06891629,
		eccentricity : 0.24882730,
		inclination : 17.14001206,
		ascendingNode : 110.30393684,
		argOfPeriapsis : 113.76498945, 
		meanAnomalyAtEpoch : 14.86012204,
		period : 247.68 * 365.25
	},
	
	sedna : {
		semiMajorAxis : 518.57,
		longitudeOfPerihelion : 0,
		eccentricity : 0.8527,
		inclination : 11.927,
		ascendingNode : 144.26, 
		argOfPeriapsis : 311.02,
		meanAnomalyAtEpoch : 358.01,
		period : 11400 * 365.25
	},
	makemake : {
		semiMajorAxis : 4.537149503754902E+01,
		longitudeOfPerihelion : 0,
		eccentricity : 1.645302661137667E-01,
		inclination : 2.900018092674307E+01,
		ascendingNode : 7.927479351325880E+01, 
		argOfPeriapsis : 2.962796702827131E+02,
		meanAnomalyAtEpoch : 1.397247535166562E+02,
		period : 1.116279789467439E+05
	},
	haumea : {
		semiMajorAxis : 4.290900504570640E+01,
		longitudeOfPerihelion : 0,
		eccentricity : 1.999240087754753E-01,
		inclination : 2.820613695665376E+01,
		ascendingNode : 1.219331357048411E+02, 
		argOfPeriapsis : 2.405918328387456E+02,
		meanAnomalyAtEpoch : 1.895938765545494E+02,
		period : 1.026646884377227E+05
	},
	eris : {
		semiMajorAxis : 6.814528383022676E+01,
		longitudeOfPerihelion : 0,
		eccentricity : 4.324547411204651E-01,
		inclination : 4.374037864588535E+01,
		ascendingNode : 3.612861006165989E+01, 
		argOfPeriapsis : 1.508355993252542E+02,
		meanAnomalyAtEpoch : 1.943095415904719E+02,
		period : 2.054717566990577E+05
	},
	
	
	
	/*
	moon : {
		semiMajorAxis : 2.552673530695038E-03,
		longitudeOfPerihelion : 0,
		eccentricity : 6.314721694601848E-02,
		inclination : 2.094230382118301E+01,
		ascendingNode : 1.223643870385490E+01, 
		argOfPeriapsis : 6.154181757216567E+01,
		meanAnomalyAtEpoch : 1.466732745658298E+02,
		period : 0.07396621937613547, 
		epoch : 2451545
	}*/
	
	moon : {
		moon : true,
		semiMajorAxis : 0.00256955529,
		longitudeOfPerihelion : 0,
		eccentricity : 0.0549,
		inclination : 5.145,
		ascendingNode : 1.239580563903234E+02, 
		argOfPeriapsis : 3.089226717609726E+02,
		meanAnomalyAtEpoch : 260.5603266810552,
		period : 2.701616162713348E+01//27.321582//0.07396621937613547 * 365.25
	},
	titan : {
		semiMajorAxis : 8.168127483657287E-03,
		longitudeOfPerihelion : 0,
		eccentricity : 2.860074434716717E-02,
		inclination : 2.771833743784899E+01,
		ascendingNode : 1.692391586820226E+02, 
		argOfPeriapsis : 1.644078851778261E+02,
		meanAnomalyAtEpoch : 1.643780911447081E+02,
		period : 1.594734092046106E+01//27.321582//0.07396621937613547 * 365.25
	}

};





/**
 * Adapted from http://sourceforge.net/p/celestia/code/5229/tree/trunk/celestia/src/celephem/orbit.cpp
 */
KMG.EllipticalOrbit = function(orbitProperties)
{
	KMG.Orbit.call( this );
	
	this.semiMajorAxis = orbitProperties.semiMajorAxis;
	this.eccentricity = orbitProperties.eccentricity;
	this.inclination = orbitProperties.inclination * (Math.PI / 180.0);
	this.ascendingNode = orbitProperties.ascendingNode * (Math.PI / 180.0);
	this.argOfPeriapsis = orbitProperties.argOfPeriapsis * (Math.PI / 180.0);
	this.meanAnomalyAtEpoch = orbitProperties.meanAnomalyAtEpoch;
	this.period = orbitProperties.period ;
	
	this.orbitProperties = orbitProperties;
	
	this.epoch = (orbitProperties.epoch) ? orbitProperties.epoch : 2451545;
	this.derivativeOfMeanMotion = (orbitProperties.derivativeOfMeanMotion) ? orbitProperties.derivativeOfMeanMotion : 0;
	
	//this.pericenterDistance = (orbitProperties.pericenterDistance) ? orbitProperties.pericenterDistance : this.semiMajorAxis * (1 - this.eccentricity);
	this.pericenterDistance = this.semiMajorAxis * (1 - this.eccentricity);
	//this.meanMotion = (orbitProperties.meanMotion) ? (orbitProperties.meanMotion) : (2.0 * Math.PI) / this.period;
	//this.meanMotion = 1 / this.period;
	this.meanMotion = (orbitProperties.meanMotion) ? (orbitProperties.meanMotion) : 1 / this.period;
	
	var ascendingNodeRotation = new THREE.Matrix4();
	ascendingNodeRotation.makeRotationZ(this.ascendingNode);
	
	var inclinationRotation = new THREE.Matrix4();
	inclinationRotation.makeRotationX(this.inclination);
	
	var argOfPeriapsisRotation = new THREE.Matrix4();
	argOfPeriapsisRotation.makeRotationZ(this.argOfPeriapsis );
	
	this.orbitPlaneRotation = new THREE.Matrix4();
	this.orbitPlaneRotation.identity();
	
	this.orbitPlaneRotation.multiplyMatrices( ascendingNodeRotation, inclinationRotation );
	this.orbitPlaneRotation.multiply( argOfPeriapsisRotation );
	
	
	var scope = this;
	
	function solveIterationFixed(f, x0, maxIter) {
		
		var x = 0;
		var x2 = x0;
		
		for (var i = 0; i < maxIter; i++) {
			x = x2;
			x2 = f.solve(x);
		}
		
		return [x2, x2 - x];
	}
	
	

	
	function eccentricAnomaly(M) {
		if (scope.eccentricity == 0.0) {
			return M;
		} else if (scope.eccentricity < 0.2) {
		
			var sol = solveIterationFixed(new KMG.SolveKeplerFunc1(scope.eccentricity, M), M, 5);

			return sol[0];
		
		} else if (scope.eccentricity < 0.9) {
		
			var sol = solveIterationFixed(new KMG.SolveKeplerFunc2(scope.eccentricity, M), M, 6);
			return sol[0];
		
		} else if (scope.eccentricity < 1.0) {
			var E = M + 0.85 * scope.eccentricity * ((Math.sin(M) >= 0.0) ? 1 : -1);
			
			var sol = solveIterationFixed(new KMG.SolveKeplerLaguerreConway(scope.eccentricity, M), E, 8);
			return sol[0];
			
		} else if (scope.eccentricity == 1.0) {
			return M;
		} else {
			var E = Math.log(2 * M / scope.eccentricity + 1.85);
			
			var sol = solveIterationFixed(new KMG.SolveKeplerLaguerreConwayHyp(scope.eccentricity, M), E, 30);
			return sol[0];
		}
	}
	
	this.positionAtE = function(E) {
		var x, y;
		
		if (this.eccentricity < 1.0) {
			var a = this.pericenterDistance / (1.0 - this.eccentricity);
			x = a * (Math.cos(E) - this.eccentricity);
			y = a * Math.sqrt(1 - this.eccentricity * this.eccentricity) * Math.sin(E);
		} else if (this.eccentricity > 1.0) {
			var a = this.pericenterDistance / (1.0 - this.eccentricity);
			x = -a * (this.eccentricity - KMG.Math.cosh(E));
			y = -a * Math.sqrt(this.eccentricity * this.eccentricity - 1) * KMG.Math.sinh(E);
		} else {
			x = 0.0;
			y = 0.0;
		}
		
		var pos = new THREE.Vector3(x, y, 0);
		pos.applyMatrix4(this.orbitPlaneRotation);
		
		return pos;
	};
	
	
	this.velocityAtE = function(E) {
		var x, y;

		if (this.eccentricity < 1.0) {
			var a = this.pericenterDistance / (1.0 - this.eccentricity);
			var sinE = Math.sin(E);
			var cosE = Math.cos(E);
        
			x = -a * sinE;
			y =  a * Math.sqrt(1 - KMG.Math.sqr(this.eccentricity)) * cosE;
		
			var meanMotion = 2.0 * Math.PI / this.period;
			var edot = meanMotion / (1 - this.eccentricity * cosE);
			x *= edot;
			y *= edot;
		} else if (this.eccentricity > 1.0) {
			var a = this.pericenterDistance / (1.0 - this.eccentricity);
			x = -a * (this.eccentricity - KMG.Math.cosh(E));
			y = -a * Math.sqrt(KMG.Math.sqr(this.eccentricity) - 1) * KMG.Math.sinh(E);
		} else {
			// TODO: Handle parabolic orbits
			x = 0.0;
			y = 0.0;
		}
		
		var v = new THREE.Vector3(x, y, 0);
		v.applyMatrix4(this.orbitPlaneRotation);
		
		return new THREE.Vector3(v.x, v.z, -v.y);
	};
	
	function trimTo360(x) {	
		if( x > 0.0 ) {
			while( x > 360.0 )
				x = x-360.0;
		} else {
			while( x< 0.0 )
				x =x+ 360.0;
		}
		return(x)
	}
	
	this.meanAnomalyAtTime = function(t) {
		var timeSinceEpoch = (t - this.epoch);
		var meanAnomaly = this.meanAnomalyAtEpoch*1+(360*(this.meanMotion*(timeSinceEpoch)+0.5*this.derivativeOfMeanMotion*(timeSinceEpoch)*(timeSinceEpoch))) ; 
		meanAnomaly = trimTo360(meanAnomaly) * (Math.PI / 180);
		return meanAnomaly;
	};
	
	this.trueAnomalyAtTime = function(t) {
		var meanAnomaly = this.meanAnomalyAtTime(t);
		var E = eccentricAnomaly(meanAnomaly);
		
		var true_anomaly=Math.acos((  Math.cos(E)-this.eccentricity)/(1-this.eccentricity*Math.cos(E))  ) ;
		return true_anomaly; // In radians
	};
	
	this.eccentricAnomalyAtTime = function(t) {
		var meanAnomaly = this.meanAnomalyAtTime(t);
		var E = eccentricAnomaly(meanAnomaly);
		return E;
	};
	
	this.velocityAtTime = function(t) {
		var E = this.eccentricAnomalyAtTime(t);
		var v = this.velocityAtE(E);
		v.multiplyScalar(1.0 / 86400.0);
		v.magnitude = Math.sqrt(KMG.Math.sqr(v.x) + KMG.Math.sqr(v.y) + KMG.Math.sqr(v.z));
		return v;
	};
	
	this.positionAtTime = function(t) {
		var meanAnomaly = this.meanAnomalyAtTime(t);
		var E = eccentricAnomaly(meanAnomaly);
		var pos = this.positionAtE(E);
		return new THREE.Vector3(pos.x, pos.z, -pos.y);
	};
	
	this.distanceAtTime = function(t) {
		var trueAnomaly = this.trueAnomalyAtTime(t);
		var p = this.semiMajorAxis * (1 - KMG.Math.sqr(this.eccentricity));
		var r = p / (1 + this.eccentricity * Math.cos(trueAnomaly));
		return r;
	
	};
	
	this.propertiesAtTime = function(t) {
		var timeSinceEpoch = (t - this.epoch);
		
		var meanAnomalyAtTime = this.meanAnomalyAtTime(t);
		meanAnomalyAtTime = KMG.Math.trimTo360Radians(meanAnomalyAtTime * (Math.PI / 180));
		
		var distanceAtTime = this.distanceAtTime(t);
		var velocityAtTime = this.velocityAtTime(t);
		var trueAnomalyAtTime = this.trueAnomalyAtTime(t);
		
		var eccentricAnomalyAtTime = this.eccentricAnomalyAtTime(meanAnomalyAtTime);
		var positionAtTime = this.positionAtE(eccentricAnomalyAtTime);
		var coordinatesAtTime = new THREE.Vector3(positionAtTime.x, positionAtTime.z, -positionAtTime.y);
		
		
		
		var props = {
			time : t,
			epoch : this.epoch,
			timeSinceEpoch : timeSinceEpoch,
			meanAnomalyAtEpoch : this.meanAnomalyAtEpoch,
			meanAnomalyAtTime : meanAnomalyAtTime,
			distanceAtTime : distanceAtTime, // To center of orbit
			velocityAtTime : velocityAtTime, // km per second
			velocityMagnitudeAtTime : velocityAtTime.magnitude, // km per second
			trueAnomalyAtTime : trueAnomalyAtTime,
			eccentricAnomalyAtTime : eccentricAnomalyAtTime,
			positionAtTime : positionAtTime,
			coordinatesAtTime : coordinatesAtTime,
			meanMotion : this.meanMotion,
			ephemeris : this.orbitProperties
		};
		return props;
	};
	
};
KMG.EllipticalOrbit.prototype = Object.create( KMG.Orbit.prototype );







/* File: VSOP87Orbits.js */




KMG.VSOPTerms = {};


KMG.VSOPTerms.earth_L0 = [
    [ 1.75347045673, 0, 0 ],
    [ 0.03341656453, 4.66925680415, 6283.07584999 ],
    [ 0.00034894275, 4.62610242189, 12566.1517 ],
    [ 3.417572e-05, 2.82886579754, 3.523118349 ],
    [ 3.497056e-05, 2.74411783405, 5753.3848849 ],
    [ 3.135899e-05, 3.62767041756, 77713.7714681 ],
    [ 2.676218e-05, 4.41808345438, 7860.41939244 ],
    [ 2.342691e-05, 6.13516214446, 3930.20969622 ],
    [ 1.273165e-05, 2.03709657878, 529.690965095 ],
    [ 1.324294e-05, 0.74246341673, 11506.7697698 ],
    [ 9.01854e-06, 2.04505446477, 26.2983197998 ],
    [ 1.199167e-05, 1.10962946234, 1577.34354245 ],
    [ 8.57223e-06, 3.50849152283, 398.149003408 ],
    [ 7.79786e-06, 1.17882681962, 5223.6939198 ],
    [ 9.9025e-06, 5.23268072088, 5884.92684658 ],
    [ 7.53141e-06, 2.53339052847, 5507.55323867 ],
    [ 5.05267e-06, 4.58292599973, 18849.22755 ],
    [ 4.92392e-06, 4.20505711826, 775.522611324 ],
    [ 3.56672e-06, 2.91954114478, 0.0673103028 ],
    [ 2.84125e-06, 1.89869240932, 796.298006816 ],
    [ 2.42879e-06, 0.34481445893, 5486.77784318 ],
    [ 3.17087e-06, 5.84901948512, 11790.6290887 ],
    [ 2.71112e-06, 0.31486255375, 10977.0788047 ],
    [ 2.06217e-06, 4.80646631478, 2544.31441988 ],
    [ 2.05478e-06, 1.86953770281, 5573.14280143 ],
    [ 2.02318e-06, 2.45767790232, 6069.77675455 ],
    [ 1.26225e-06, 1.08295459501, 20.7753954924 ],
    [ 1.55516e-06, 0.83306084617, 213.299095438 ],
    [ 1.15132e-06, 0.64544911683, 0.9803210682 ],
    [ 1.02851e-06, 0.63599845579, 4694.00295471 ],
    [ 1.01724e-06, 4.2667980198, 7.1135470008 ],
    [ 9.9206e-07, 6.20992926918, 2146.16541648 ],
    [ 1.32212e-06, 3.41118292683, 2942.46342329 ],
    [ 9.7607e-07, 0.68101342359, 155.420399434 ],
    [ 8.5128e-07, 1.29870764804, 6275.96230299 ],
    [ 7.4651e-07, 1.755089133, 5088.62883977 ],
    [ 1.01895e-06, 0.97569280312, 15720.8387849 ],
    [ 8.4711e-07, 3.67080093031, 71430.6956181 ],
    [ 7.3547e-07, 4.67926633877, 801.820931124 ],
    [ 7.3874e-07, 3.50319414955, 3154.6870849 ],
    [ 7.8757e-07, 3.03697458703, 12036.4607349 ],
    [ 7.9637e-07, 1.80791287082, 17260.1546547 ],
    [ 8.5803e-07, 5.9832263126, 161000.685738 ],
    [ 5.6963e-07, 2.78430458592, 6286.59896834 ],
    [ 6.1148e-07, 1.81839892984, 7084.89678112 ],
    [ 6.9627e-07, 0.83297621398, 9437.76293489 ],
    [ 5.6116e-07, 4.38694865354, 14143.4952424 ],
    [ 6.2449e-07, 3.97763912806, 8827.39026987 ],
    [ 5.1145e-07, 0.28306832879, 5856.47765912 ],
    [ 5.5577e-07, 3.47006059924, 6279.55273164 ],
    [ 4.1036e-07, 5.36817592855, 8429.24126647 ],
    [ 5.1605e-07, 1.33282739866, 1748.01641307 ],
    [ 5.1992e-07, 0.18914947184, 12139.5535091 ],
    [ 4.9e-07, 0.48735014197, 1194.44701022 ],
    [ 3.92e-07, 6.16833020996, 10447.3878396 ],
    [ 3.557e-07, 1.775968892, 6812.76681509 ],
    [ 3.677e-07, 6.04133863162, 10213.2855462 ],
    [ 3.6596e-07, 2.56957481827, 1059.38193019 ],
    [ 3.3296e-07, 0.59310278598, 17789.8456198 ],
    [ 3.5954e-07, 1.70875808777, 2352.86615377 ],
    [ 4.0938e-07, 2.39850938714, 19651.0484811 ],
    // 61 terms retained
];

KMG.VSOPTerms.earth_L1 = [
    [ 6283.07584999, 0, 0 ],
    [ 0.00206058863, 2.67823455808, 6283.07584999 ],
    [ 4.303419e-05, 2.63512233481, 12566.1517 ],
    [ 4.25264e-06, 1.59046982018, 3.523118349 ],
    [ 1.09017e-06, 2.96631010675, 1577.34354245 ],
    [ 9.3479e-07, 2.59211109542, 18849.22755 ],
    [ 1.19305e-06, 5.79555765566, 26.2983197998 ],
    [ 7.2121e-07, 1.13840581212, 529.690965095 ],
    [ 6.7784e-07, 1.87453300345, 398.149003408 ],
    [ 6.735e-07, 4.40932832004, 5507.55323867 ],
    [ 5.9045e-07, 2.88815790631, 5223.6939198 ],
    [ 5.5976e-07, 2.17471740035, 155.420399434 ],
    [ 4.5411e-07, 0.39799502896, 796.298006816 ],
    [ 3.6298e-07, 0.46875437227, 775.522611324 ],
    [ 2.8962e-07, 2.64732254645, 7.1135470008 ],
    [ 1.9097e-07, 1.84628376049, 5486.77784318 ],
    [ 2.0844e-07, 5.34138275149, 0.9803210682 ],
    [ 1.8508e-07, 4.96855179468, 213.299095438 ],
    [ 1.6233e-07, 0.03216587315, 2544.31441988 ],
    [ 1.7293e-07, 2.9911676063, 6275.96230299 ],
    [ 1.5832e-07, 1.43049301283, 2146.16541648 ],
    [ 1.4608e-07, 1.2046979369, 10977.0788047 ],
    [ 1.1877e-07, 3.25805082007, 5088.62883977 ],
    [ 1.1514e-07, 2.07502080082, 4694.00295471 ],
    [ 9.721e-08, 4.2392586526, 1349.86740966 ],
    [ 9.969e-08, 1.30263423409, 6286.59896834 ],
    [ 9.452e-08, 2.69956827011, 242.728603974 ],
    [ 1.2461e-07, 2.83432282119, 1748.01641307 ],
    [ 1.1808e-07, 5.27379760438, 1194.44701022 ],
    [ 8.577e-08, 5.6447608598, 951.718406251 ],
    [ 1.0641e-07, 0.76614722966, 553.569402842 ],
    [ 7.576e-08, 5.30056172859, 2352.86615377 ],
    [ 5.764e-08, 1.77228445837, 1059.38193019 ],
    [ 6.385e-08, 2.65034514038, 9437.76293489 ],
    [ 5.223e-08, 5.66135782131, 71430.6956181 ],
    [ 5.315e-08, 0.91110018969, 3154.6870849 ],
    [ 6.101e-08, 4.66633726278, 4690.47983636 ],
    [ 4.335e-08, 0.23934560382, 6812.76681509 ],
    [ 5.041e-08, 1.42489704722, 6438.49624943 ],
    [ 4.259e-08, 0.77355543889, 10447.3878396 ],
    [ 5.2e-08, 1.85528830215, 801.820931124 ],
    // 41 terms retained
];

KMG.VSOPTerms.earth_L2 = [
    [ 8.721859e-05, 1.07253635559, 6283.07584999 ],
    [ 9.9099e-06, 3.14159265359, 0 ],
    [ 2.94833e-06, 0.43717350256, 12566.1517 ],
    [ 2.7338e-07, 0.05295636147, 3.523118349 ],
    [ 1.6333e-07, 5.18820215724, 26.2983197998 ],
    [ 1.5745e-07, 3.68504712183, 155.420399434 ],
    [ 9.425e-08, 0.29667114694, 18849.22755 ],
    [ 8.938e-08, 2.05706319592, 77713.7714681 ],
    [ 6.94e-08, 0.82691541038, 775.522611324 ],
    [ 5.061e-08, 4.6624323168, 1577.34354245 ],
    [ 4.06e-08, 1.03067032318, 7.1135470008 ],
    [ 3.464e-08, 5.14021224609, 796.298006816 ],
    [ 3.172e-08, 6.05479318507, 5507.55323867 ],
    [ 3.02e-08, 1.19240008524, 242.728603974 ],
    [ 2.885e-08, 6.11705865396, 529.690965095 ],
    [ 3.809e-08, 3.44043369494, 5573.14280143 ],
    [ 2.719e-08, 0.30363248164, 398.149003408 ],
    [ 2.365e-08, 4.37666117992, 5223.6939198 ],
    [ 2.538e-08, 2.27966434314, 553.569402842 ],
    [ 2.078e-08, 3.75435095487, 0.9803210682 ],
    [ 1.675e-08, 0.90149951436, 951.718406251 ],
    [ 1.534e-08, 5.75895831192, 1349.86740966 ],
    [ 1.224e-08, 2.97285792195, 2146.16541648 ],
    [ 1.449e-08, 4.36401639552, 1748.01641307 ],
    [ 1.341e-08, 3.72019379666, 1194.44701022 ],
    [ 1.253e-08, 2.9488872631, 6438.49624943 ],
    [ 9.99e-09, 5.98665341008, 6286.59896834 ],
    // 27 terms retained
];

KMG.VSOPTerms.earth_L3 = [
    [ 2.89058e-06, 5.84173149732, 6283.07584999 ],
    [ 2.0712e-07, 6.0498393902, 12566.1517 ],
    [ 2.962e-08, 5.1956057957, 155.420399434 ],
    [ 2.527e-08, 3.14159265359, 0 ],
    [ 1.288e-08, 4.7219761197, 3.523118349 ],
    // 5 terms retained
];

KMG.VSOPTerms.earth_L4 = [
    [ 7.714e-08, 4.14117321449, 6283.07584999 ],
    // 1 terms retained
];

KMG.VSOPTerms.earth_L5 = [
    [ 0, 0, 0 ],
    // 0 terms retained
];

KMG.VSOPTerms.earth_B0 = [
    [ 2.7962e-06, 3.19870156017, 84334.6615813 ],
    // 1 terms retained
];

KMG.VSOPTerms.earth_B1 = [
    [ 0.00227777722, 3.4137662053, 6283.07584999 ],
    [ 3.805678e-05, 3.37063423795, 12566.1517 ],
    [ 3.619589e-05, 0, 0 ],
    [ 7.1542e-07, 3.32777549735, 18849.22755 ],
    // 4 terms retained
];

KMG.VSOPTerms.earth_B2 = [
    [ 9.721424e-05, 5.1519280992, 6283.07584999 ],
    [ 2.33002e-06, 3.14159265359, 0 ],
    [ 1.34188e-06, 0.64406212977, 12566.1517 ],
    [ 6.504e-08, 1.07333397797, 18849.22755 ],
    // 4 terms retained
];


KMG.VSOPTerms.earth_R0 = [
    [ 1.00013988784, 0, 0 ],
    [ 0.01670699632, 3.09846350258, 6283.07584999 ],
    [ 0.00013956024, 3.05524609456, 12566.1517 ],
    [ 3.08372e-05, 5.19846674381, 77713.7714681 ],
    [ 1.628463e-05, 1.17387558054, 5753.3848849 ],
    [ 1.575572e-05, 2.84685214877, 7860.41939244 ],
    [ 9.24799e-06, 5.45292236722, 11506.7697698 ],
    [ 5.42439e-06, 4.56409151453, 3930.20969622 ],
    [ 4.7211e-06, 3.66100022149, 5884.92684658 ],
    [ 3.2878e-06, 5.89983686142, 5223.6939198 ],
    [ 3.45969e-06, 0.96368627272, 5507.55323867 ],
    [ 3.06784e-06, 0.29867139512, 5573.14280143 ],
    [ 1.74844e-06, 3.01193636733, 18849.22755 ],
    [ 2.43181e-06, 4.2734953079, 11790.6290887 ],
    [ 2.11836e-06, 5.84714461348, 1577.34354245 ],
    [ 1.8574e-06, 5.02199710705, 10977.0788047 ],
    [ 1.09835e-06, 5.0551063586, 5486.77784318 ],
    [ 9.8316e-07, 0.88681311278, 6069.77675455 ],
    [ 8.65e-07, 5.68956418946, 15720.8387849 ],
    [ 8.5831e-07, 1.27079125277, 161000.685738 ],
    [ 6.2917e-07, 0.92177053978, 529.690965095 ],
    [ 5.7056e-07, 2.01374292245, 83996.8473181 ],
    [ 6.4908e-07, 0.27251341435, 17260.1546547 ],
    [ 4.9384e-07, 3.24501240359, 2544.31441988 ],
    [ 5.5736e-07, 5.2415979917, 71430.6956181 ],
    [ 4.252e-07, 6.01110257982, 6275.96230299 ],
    [ 4.6966e-07, 2.57799853213, 775.522611324 ],
    [ 3.8963e-07, 5.36063832897, 4694.00295471 ],
    [ 4.4666e-07, 5.53715663816, 9437.76293489 ],
    [ 3.5661e-07, 1.67447135798, 12036.4607349 ],
    [ 3.1922e-07, 0.18368299942, 5088.62883977 ],
    [ 3.1846e-07, 1.77775642078, 398.149003408 ],
    [ 3.3193e-07, 0.24370221704, 7084.89678112 ],
    [ 3.8245e-07, 2.39255343973, 8827.39026987 ],
    [ 2.8468e-07, 1.21344887533, 6286.59896834 ],
    [ 3.7486e-07, 0.82961281844, 19651.0484811 ],
    [ 3.6957e-07, 4.90107587287, 12139.5535091 ],
    [ 3.4537e-07, 1.84270693281, 2942.46342329 ],
    [ 2.6275e-07, 4.58896863104, 10447.3878396 ],
    [ 2.4596e-07, 3.78660838036, 8429.24126647 ],
    [ 2.3587e-07, 0.26866098169, 796.298006816 ],
    [ 2.7795e-07, 1.89934427832, 6279.55273164 ],
    [ 2.3927e-07, 4.99598548145, 5856.47765912 ],
    [ 2.0345e-07, 4.65282190725, 2146.16541648 ],
    [ 2.3287e-07, 2.80783632869, 14143.4952424 ],
    [ 2.2099e-07, 1.95002636847, 3154.6870849 ],
    [ 1.9509e-07, 5.38233922479, 2352.86615377 ],
    [ 1.7958e-07, 0.1987136996, 6812.76681509 ],
    [ 1.7178e-07, 4.43322156854, 10213.2855462 ],
    [ 1.619e-07, 5.23159323213, 17789.8456198 ],
    [ 1.7315e-07, 6.15224075188, 16730.4636896 ],
    [ 1.3814e-07, 5.18962074032, 8031.09226306 ],
    [ 1.8834e-07, 0.67280058021, 149854.400135 ],
    [ 1.833e-07, 2.25348717053, 23581.2581773 ],
    [ 1.3639e-07, 3.68511810757, 4705.73230754 ],
    [ 1.3142e-07, 0.65267698994, 13367.9726311 ],
    [ 1.0414e-07, 4.33285688501, 11769.8536932 ],
    [ 9.978e-08, 4.20126336356, 6309.37416979 ],
    [ 1.017e-07, 1.59366684542, 4690.47983636 ],
    [ 7.564e-08, 2.62560597391, 6256.77753019 ],
    [ 9.654e-08, 3.67583728703, 27511.4678735 ],
    [ 6.743e-08, 0.56269927047, 3340.6124267 ],
    [ 8.743e-08, 6.06359123461, 1748.01641307 ],
    [ 7.786e-08, 3.67371235367, 12168.0026966 ],
    [ 6.633e-08, 5.66149277789, 11371.7046898 ],
    [ 7.712e-08, 0.31242577788, 7632.94325965 ],
    [ 6.586e-08, 3.13580054586, 801.820931124 ],
    [ 7.46e-08, 5.6475806666, 11926.2544137 ],
    [ 6.933e-08, 2.92384586372, 6681.2248534 ],
    [ 6.805e-08, 1.42327153767, 23013.5395396 ],
    [ 6.118e-08, 5.13395999022, 1194.44701022 ],
    [ 6.477e-08, 2.64986648493, 19804.8272916 ],
    // 72 terms retained
];

KMG.VSOPTerms.earth_R1 = [
    [ 0.00103018607, 1.10748968172, 6283.07584999 ],
    [ 1.721238e-05, 1.06442300386, 12566.1517 ],
    [ 7.02217e-06, 3.14159265359, 0 ],
    [ 3.2345e-07, 1.02168583254, 18849.22755 ],
    [ 3.0801e-07, 2.84358443952, 5507.55323867 ],
    [ 2.4978e-07, 1.31906570344, 5223.6939198 ],
    [ 1.8487e-07, 1.42428709076, 1577.34354245 ],
    [ 1.0077e-07, 5.91385248388, 10977.0788047 ],
    [ 8.635e-08, 0.27158192945, 5486.77784318 ],
    [ 8.654e-08, 1.42046854427, 6275.96230299 ],
    // 10 terms retained
];

KMG.VSOPTerms.earth_R2 = [
    [ 4.359385e-05, 5.78455133808, 6283.07584999 ],
    [ 1.23633e-06, 5.57935427994, 12566.1517 ],
    [ 1.2342e-07, 3.14159265359, 0 ],
    [ 8.792e-08, 3.62777893099, 77713.7714681 ],
    [ 5.689e-08, 1.86958905084, 5573.14280143 ],
    [ 3.302e-08, 5.47034879713, 18849.22755 ],
    // 6 terms retained
];

KMG.VSOPTerms.earth_R3 = [
    [ 1.44595e-06, 4.27319433901, 6283.07584999 ],
    [ 6.729e-08, 3.91706261708, 12566.1517 ],
    // 2 terms retained
];

KMG.VSOPTerms.earth_R4 = [
    [ 3.858e-08, 2.56389016346, 6283.07584999 ],
    // 1 terms retained
];

KMG.VSOPTerms.earth_R5 = [
    [ 0, 0, 0 ],
    // 0 terms retained
];

KMG.VSOPSeries = {};

KMG.VSOPSeries.earth_L = [
	KMG.VSOPTerms.earth_L0,
	KMG.VSOPTerms.earth_L1,
	KMG.VSOPTerms.earth_L2,
	KMG.VSOPTerms.earth_L3,
	KMG.VSOPTerms.earth_L4,
	KMG.VSOPTerms.earth_L5
];


KMG.VSOPSeries.earth_B = [
	KMG.VSOPTerms.earth_B0,
	KMG.VSOPTerms.earth_B1,
	KMG.VSOPTerms.earth_B2
];

KMG.VSOPSeries.earth_R = [
	KMG.VSOPTerms.earth_R0,
	KMG.VSOPTerms.earth_R1,
	KMG.VSOPTerms.earth_R2,
	KMG.VSOPTerms.earth_R3,
	KMG.VSOPTerms.earth_R4,
	KMG.VSOPTerms.earth_R5
];












KMG.VSOPTerms.mars_L0 = [
    [ 6.20347711581, 0, 0 ],
    [ 0.18656368093, 5.0503710027, 3340.6124267 ],
    [ 0.01108216816, 5.40099836344, 6681.2248534 ],
    [ 0.00091798406, 5.75478744667, 10021.8372801 ],
    [ 0.00027744987, 5.97049513147, 3.523118349 ],
    [ 0.00010610235, 2.93958560338, 2281.23049651 ],
    [ 0.00012315897, 0.84956094002, 2810.92146161 ],
    [ 8.926784e-05, 4.15697846427, 0.0172536522 ],
    [ 8.715691e-05, 6.11005153139, 13362.4497068 ],
    [ 6.797556e-05, 0.36462229657, 398.149003408 ],
    [ 7.774872e-05, 3.33968761376, 5621.84292321 ],
    [ 3.575078e-05, 1.6618650571, 2544.31441988 ],
    [ 4.161108e-05, 0.22814971327, 2942.46342329 ],
    [ 3.075252e-05, 0.85696614132, 191.448266112 ],
    [ 2.628117e-05, 0.64806124465, 3337.08930835 ],
    [ 2.937546e-05, 6.07893711402, 0.0673103028 ],
    [ 2.389414e-05, 5.03896442664, 796.298006816 ],
    [ 2.579844e-05, 0.02996736156, 3344.13554505 ],
    [ 1.528141e-05, 1.14979301996, 6151.5338883 ],
    [ 1.798806e-05, 0.65634057445, 529.690965095 ],
    [ 1.264357e-05, 3.62275122593, 5092.15195812 ],
    [ 1.286228e-05, 3.06796065034, 2146.16541648 ],
    [ 1.546404e-05, 2.91579701718, 1751.53953142 ],
    [ 1.024902e-05, 3.69334099279, 8962.45534991 ],
    [ 8.91566e-06, 0.18293837498, 16703.0621335 ],
    [ 8.58759e-06, 2.4009381194, 2914.01423582 ],
    [ 8.32715e-06, 2.46418619474, 3340.59517305 ],
    [ 8.3272e-06, 4.49495782139, 3340.62968035 ],
    [ 7.12902e-06, 3.66335473479, 1059.38193019 ],
    [ 7.48723e-06, 3.82248614017, 155.420399434 ],
    [ 7.23861e-06, 0.67497311481, 3738.76143011 ],
    [ 6.35548e-06, 2.92182225127, 8432.76438482 ],
    [ 6.55162e-06, 0.48864064125, 3127.31333126 ],
    [ 5.50474e-06, 3.81001042328, 0.9803210682 ],
    [ 5.5275e-06, 4.47479317037, 1748.01641307 ],
    [ 4.25966e-06, 0.55364317304, 6283.07584999 ],
    [ 4.15131e-06, 0.49662285038, 213.299095438 ],
    [ 4.72167e-06, 3.62547124025, 1194.44701022 ],
    [ 3.06551e-06, 0.38052848348, 6684.74797175 ],
    [ 3.12141e-06, 0.99853944405, 6677.70173505 ],
    [ 2.93198e-06, 4.22131299634, 20.7753954924 ],
    [ 3.02375e-06, 4.48618007156, 3532.06069281 ],
    [ 2.74027e-06, 0.54222167059, 3340.5451164 ],
    [ 2.81079e-06, 5.88163521788, 1349.86740966 ],
    [ 2.31183e-06, 1.28242156993, 3870.30339179 ],
    [ 2.83602e-06, 5.7688543494, 3149.16416059 ],
    [ 2.36117e-06, 5.75503217933, 3333.4988797 ],
    [ 2.74033e-06, 0.13372524985, 3340.679737 ],
    [ 2.99395e-06, 2.78323740866, 6254.62666252 ],
    [ 2.04162e-06, 2.82133445874, 1221.84856632 ],
    [ 2.38866e-06, 5.37153646326, 4136.91043352 ],
    [ 1.88648e-06, 1.4910406604, 9492.146315 ],
    [ 2.21228e-06, 3.50466812198, 382.896532223 ],
    [ 1.79196e-06, 1.00561962003, 951.718406251 ],
    [ 1.72117e-06, 0.43943649536, 5486.77784318 ],
    [ 1.93118e-06, 3.35716641911, 3.5904286518 ],
    [ 1.44304e-06, 1.41874112114, 135.065080035 ],
    [ 1.60016e-06, 3.94857092451, 4562.46099302 ],
    [ 1.74072e-06, 2.41361337725, 553.569402842 ],
    [ 1.30989e-06, 4.04491134956, 12303.0677766 ],
    [ 1.38243e-06, 4.30145122848, 7.1135470008 ],
    [ 1.28062e-06, 1.8066581622, 5088.62883977 ],
    [ 1.39898e-06, 3.32595559208, 2700.71514039 ],
    [ 1.28105e-06, 2.20807538189, 1592.59601363 ],
    [ 1.16944e-06, 3.12806863456, 7903.07341972 ],
    [ 1.10378e-06, 1.05194545948, 242.728603974 ],
    [ 1.13481e-06, 3.70070432339, 1589.07289528 ],
    [ 1.00099e-06, 3.24340223714, 11773.3768115 ],
    [ 9.5594e-07, 0.53950648295, 20043.6745602 ],
    [ 9.8947e-07, 4.84558326403, 6681.24210705 ],
    [ 1.04542e-06, 0.78532737699, 8827.39026987 ],
    [ 8.4186e-07, 3.98971116025, 4399.99435689 ],
    [ 8.6928e-07, 2.20183965407, 11243.6858464 ],
    [ 7.1438e-07, 2.80307223477, 3185.19202727 ],
    [ 7.2095e-07, 5.84669532401, 5884.92684658 ],
    [ 7.3482e-07, 2.18421190324, 8429.24126647 ],
    [ 9.8946e-07, 2.81481171439, 6681.20759975 ],
    [ 6.8413e-07, 2.73834597183, 2288.34404351 ],
    [ 8.6747e-07, 1.02091867465, 7079.37385681 ],
    [ 6.5316e-07, 2.68114882713, 28.4491874678 ],
    [ 8.3745e-07, 3.20254912006, 4690.47983636 ],
    [ 7.5031e-07, 0.76647765061, 6467.92575796 ],
    [ 6.8983e-07, 3.76403440528, 6041.32756709 ],
    [ 6.6706e-07, 0.73630288873, 3723.50895892 ],
    [ 6.3313e-07, 4.5277185022, 426.598190876 ],
    [ 6.1684e-07, 6.16831461502, 2274.11694951 ],
    [ 5.226e-07, 0.89938935091, 9623.68827669 ],
    [ 5.5485e-07, 4.60622447136, 4292.33083295 ],
    [ 5.1331e-07, 4.14823934301, 3341.59274777 ],
    [ 5.6633e-07, 5.06250402329, 15.252471185 ],
    [ 6.3376e-07, 0.91293637746, 3553.91152214 ],
    [ 4.5822e-07, 0.78790300125, 1990.74501704 ],
    [ 4.8553e-07, 3.95677994023, 4535.05943692 ],
    [ 4.1223e-07, 6.02013764154, 3894.18182954 ],
    [ 4.1941e-07, 3.58309124437, 8031.09226306 ],
    [ 5.6395e-07, 1.68727941626, 6872.67311951 ],
    [ 5.5907e-07, 3.46261441099, 263.083923373 ],
    [ 5.1677e-07, 2.81307639242, 3339.63210563 ],
    [ 4.0669e-07, 3.13838566327, 9595.23908922 ],
    [ 3.8111e-07, 0.73396370751, 10025.3603984 ],
    [ 3.9498e-07, 5.6322574136, 3097.88382273 ],
    [ 4.4175e-07, 3.19530118759, 5628.95647021 ],
    [ 3.6718e-07, 2.63750919104, 692.157601227 ],
    [ 4.5905e-07, 0.28717581576, 5614.72937621 ],
    [ 3.8351e-07, 5.82880639987, 3191.04922957 ],
    [ 3.8198e-07, 2.34832438823, 162.466636132 ],
    [ 3.2561e-07, 0.48401318272, 6681.2921637 ],
    [ 3.7135e-07, 0.68510839331, 2818.03500861 ],
    [ 3.1169e-07, 3.98160436995, 20.3553193988 ],
    [ 3.2561e-07, 0.89250965753, 6681.1575431 ],
    [ 3.7749e-07, 4.15481250779, 2803.8079146 ],
    [ 3.3626e-07, 6.11997987693, 6489.77658729 ],
    [ 2.9007e-07, 2.42707198395, 3319.83703121 ],
    [ 3.8794e-07, 1.35194224244, 10018.3141618 ],
    [ 3.3149e-07, 1.140241952, 5.5229243074 ],
    [ 2.7583e-07, 1.59721760699, 7210.91581849 ],
    [ 2.8699e-07, 5.7204755094, 7477.52286022 ],
    [ 3.4039e-07, 2.59525636978, 11769.8536932 ],
    [ 2.538e-07, 0.52092092633, 10.6366653498 ],
    [ 2.6355e-07, 1.34519007001, 3496.03282613 ],
    [ 2.4555e-07, 4.00321315879, 11371.7046898 ],
    [ 2.5637e-07, 0.24963503109, 522.577418094 ],
    [ 2.7275e-07, 4.55649766071, 3361.38782219 ],
    [ 2.3766e-07, 1.84063759173, 12832.7587417 ],
    [ 2.2814e-07, 3.52628452806, 1648.4467572 ],
    [ 2.2272e-07, 0.72111173236, 266.607041722 ],
    // 126 terms retained
];

KMG.VSOPTerms.mars_L1 = [
    [ 3340.61242701, 0, 0 ],
    [ 0.01457554523, 3.60433733236, 3340.6124267 ],
    [ 0.00168414711, 3.92318567804, 6681.2248534 ],
    [ 0.00020622975, 4.26108844583, 10021.8372801 ],
    [ 3.452392e-05, 4.7321039319, 3.523118349 ],
    [ 2.586332e-05, 4.60670058555, 13362.4497068 ],
    [ 8.41535e-06, 4.45864030426, 2281.23049651 ],
    [ 5.37567e-06, 5.01581256923, 398.149003408 ],
    [ 5.20948e-06, 4.99428054039, 3344.13554505 ],
    [ 4.32635e-06, 2.56070853083, 191.448266112 ],
    [ 4.29655e-06, 5.31645299471, 155.420399434 ],
    [ 3.81751e-06, 3.53878166043, 796.298006816 ],
    [ 3.2853e-06, 4.95632685192, 16703.0621335 ],
    [ 2.82795e-06, 3.15966768785, 2544.31441988 ],
    [ 2.05657e-06, 4.56889279932, 2146.16541648 ],
    [ 1.68866e-06, 1.3293655906, 3337.08930835 ],
    [ 1.57593e-06, 4.18519540728, 1751.53953142 ],
    [ 1.33686e-06, 2.23327245555, 0.9803210682 ],
    [ 1.16965e-06, 2.21414273762, 1059.38193019 ],
    [ 1.17503e-06, 6.02411290806, 6151.5338883 ],
    [ 1.13718e-06, 5.42753341019, 3738.76143011 ],
    [ 1.33565e-06, 5.97420357518, 1748.01641307 ],
    [ 9.1099e-07, 1.09626613064, 1349.86740966 ],
    [ 8.4256e-07, 5.29330740437, 6684.74797175 ],
    [ 1.13886e-06, 2.12863726524, 1194.44701022 ],
    [ 8.0823e-07, 4.42818326716, 529.690965095 ],
    [ 7.9847e-07, 2.24822372859, 8962.45534991 ],
    [ 7.2505e-07, 5.84203374239, 242.728603974 ],
    [ 7.2945e-07, 2.50193599662, 951.718406251 ],
    [ 7.149e-07, 3.85645759558, 2914.01423582 ],
    [ 8.534e-07, 3.90856932983, 553.569402842 ],
    [ 6.758e-07, 5.0233489507, 382.896532223 ],
    [ 6.506e-07, 1.01810963274, 3340.59517305 ],
    [ 6.5061e-07, 3.04888114328, 3340.62968035 ],
    [ 6.1478e-07, 4.15185188249, 3149.16416059 ],
    [ 4.8482e-07, 4.87339233007, 213.299095438 ],
    [ 4.6581e-07, 1.31461442691, 3185.19202727 ],
    [ 5.6642e-07, 3.88772102421, 4136.91043352 ],
    [ 4.7615e-07, 1.18228660215, 3333.4988797 ],
    [ 4.2052e-07, 5.30826745759, 20043.6745602 ],
    [ 4.133e-07, 0.71392238704, 1592.59601363 ],
    [ 4.028e-07, 2.72571311592, 7.1135470008 ],
    [ 3.304e-07, 5.40823104809, 6283.07584999 ],
    [ 2.8676e-07, 0.04305323493, 9492.146315 ],
    [ 2.2322e-07, 5.86718681699, 3870.30339179 ],
    [ 2.2432e-07, 5.46596961275, 20.3553193988 ],
    [ 2.2606e-07, 0.83782540818, 3097.88382273 ],
    [ 2.1416e-07, 5.37936489667, 3340.5451164 ],
    [ 2.3347e-07, 6.167744339, 3532.06069281 ],
    [ 2.6573e-07, 3.8900063113, 1221.84856632 ],
    [ 2.28e-07, 1.54501542908, 2274.11694951 ],
    [ 2.0474e-07, 2.3623686167, 1589.07289528 ],
    [ 2.0179e-07, 3.36390759347, 5088.62883977 ],
    [ 2.0013e-07, 2.57546546037, 12303.0677766 ],
    [ 1.992e-07, 0.44761063096, 6677.70173505 ],
    [ 2.655e-07, 5.11303525089, 2700.71514039 ],
    [ 2.1104e-07, 3.52541056271, 15.252471185 ],
    [ 2.1424e-07, 4.97083417225, 3340.679737 ],
    [ 1.8502e-07, 5.57854926842, 1990.74501704 ],
    [ 1.7805e-07, 6.12513609945, 4292.33083295 ],
    [ 1.6463e-07, 2.60307709195, 3341.59274777 ],
    [ 1.6592e-07, 1.25515357212, 3894.18182954 ],
    [ 1.9864e-07, 2.52765519587, 4399.99435689 ],
    [ 1.5002e-07, 1.03518790208, 2288.34404351 ],
    [ 2.0011e-07, 4.73112374598, 4690.47983636 ],
    [ 1.5431e-07, 2.46932776517, 4535.05943692 ],
    [ 2.0193e-07, 5.78561467842, 7079.37385681 ],
    [ 1.5298e-07, 2.26504738206, 3723.50895892 ],
    [ 1.5019e-07, 3.36690751539, 6681.24210705 ],
    [ 1.3219e-07, 5.61412860968, 10025.3603984 ],
    [ 1.3517e-07, 2.12392880454, 5486.77784318 ],
    [ 1.5019e-07, 1.33613594479, 6681.20759975 ],
    [ 1.2676e-07, 2.95036175206, 3496.03282613 ],
    [ 1.3644e-07, 1.97710249337, 5614.72937621 ],
    [ 1.3011e-07, 1.51458564766, 5628.95647021 ],
    [ 1.1353e-07, 6.23411904718, 135.065080035 ],
    [ 1.3508e-07, 3.42721826602, 5621.84292321 ],
    [ 1.0866e-07, 5.28165480979, 2818.03500861 ],
    [ 1.188e-07, 3.12847055823, 426.598190876 ],
    [ 1.0467e-07, 2.7359860705, 2787.04302386 ],
    [ 1.1131e-07, 5.84122566289, 2803.8079146 ],
    [ 1.177e-07, 2.58277425311, 8432.76438482 ],
    [ 1.1861e-07, 5.47552055459, 3553.91152214 ],
    [ 8.54e-08, 1.91739325491, 11773.3768115 ],
    [ 9.819e-08, 4.52958330672, 6489.77658729 ],
    [ 8.552e-08, 3.16147568714, 162.466636132 ],
    [ 1.0957e-07, 4.15775327007, 2388.89402045 ],
    [ 8.948e-08, 4.23164385777, 7477.52286022 ],
    [ 8.131e-08, 1.61308074119, 2957.71589448 ],
    [ 8.352e-08, 2.18475645206, 23.8784377478 ],
    [ 8.03e-08, 5.69889507906, 6041.32756709 ],
    [ 7.878e-08, 5.71359767892, 9623.68827669 ],
    [ 8.713e-08, 4.43300582398, 5092.15195812 ],
    [ 8.421e-08, 3.1635506725, 3347.7259737 ],
    [ 6.67e-08, 5.07423317095, 8031.09226306 ],
    [ 8.656e-08, 4.33239148117, 3339.63210563 ],
    [ 7.354e-08, 6.17934256606, 3583.34103067 ],
    [ 5.749e-08, 3.67719823582, 8429.24126647 ],
    [ 6.235e-08, 3.54003325209, 692.157601227 ],
    [ 5.458e-08, 1.05139431657, 4933.20844033 ],
    [ 6.132e-08, 1.66182646558, 6525.80445397 ],
    [ 5.197e-08, 1.14841109166, 28.4491874678 ],
    [ 4.95e-08, 5.28919125231, 6681.2921637 ],
    [ 5.516e-08, 6.12492946392, 2487.41604495 ],
    [ 4.89e-08, 3.10255139433, 5.5229243074 ],
    [ 5.354e-08, 0.37154896863, 12832.7587417 ],
    [ 4.751e-08, 0.2337468155, 36.0278666774 ],
    [ 6.362e-08, 2.11339432269, 5884.92684658 ],
    [ 4.996e-08, 2.44835744792, 5099.26550512 ],
    [ 4.952e-08, 5.69770765577, 6681.1575431 ],
    [ 4.678e-08, 0.27799012787, 10018.3141618 ],
    [ 4.746e-08, 0.00950199989, 7210.91581849 ],
    [ 4.862e-08, 5.60331599025, 6467.92575796 ],
    [ 5.544e-08, 2.00929051393, 522.577418094 ],
    [ 4.998e-08, 1.51094959078, 1744.42598442 ],
    [ 5.397e-08, 0.1884215497, 2942.46342329 ],
    [ 4.098e-08, 3.95776844736, 3.881335358 ],
    [ 5.414e-08, 5.66147396313, 23384.2869869 ],
    [ 5.467e-08, 0.19258681316, 7632.94325965 ],
    [ 4.305e-08, 2.8945229483, 2810.92146161 ],
    [ 4.118e-08, 1.59475420886, 7234.79425624 ],
    [ 4.489e-08, 4.16951490492, 2906.90068882 ],
    [ 5.277e-08, 2.22681020305, 3127.31333126 ],
    [ 3.882e-08, 2.26433789475, 2699.73481932 ],
    [ 3.544e-08, 1.76658498504, 1758.65307842 ],
    [ 3.408e-08, 2.65743533541, 4929.68532198 ],
    [ 4.336e-08, 4.43081904792, 640.877607382 ],
    [ 3.804e-08, 2.91373968131, 15643.6802033 ],
    [ 3.176e-08, 1.75893480952, 9595.23908922 ],
    [ 3.309e-08, 6.13831291678, 10419.9862835 ],
    [ 3.077e-08, 2.56194751001, 7064.12138562 ],
    [ 3.236e-08, 2.32387839882, 5085.03841111 ],
    [ 3.284e-08, 2.8621647971, 7740.60678359 ],
    [ 2.958e-08, 1.27767445188, 574.344798335 ],
    [ 2.805e-08, 0.43144651568, 5828.02847165 ],
    [ 2.851e-08, 0.98625869565, 3191.04922957 ],
    [ 3.324e-08, 2.5901098785, 2118.76386038 ],
    [ 3.039e-08, 1.86739127757, 7.046236698 ],
    [ 2.738e-08, 1.76460911547, 639.897286314 ],
    [ 2.757e-08, 3.70511041849, 10021.8545338 ],
    [ 3.376e-08, 1.53123149565, 6674.1113064 ],
    [ 2.757e-08, 1.67433972403, 10021.8200264 ],
    [ 2.67e-08, 3.11556212899, 6836.64525283 ],
    [ 2.583e-08, 3.77302627584, 2921.12778282 ],
    [ 2.51e-08, 0.30461555756, 3475.67750674 ],
    [ 2.288e-08, 2.81266012379, 7875.67186362 ],
    [ 2.411e-08, 0.97123911611, 3319.83703121 ],
    [ 2.41e-08, 2.95969382172, 6682.20517447 ],
    [ 2.211e-08, 0.61268074323, 10973.5556864 ],
    [ 2.246e-08, 4.12573972297, 59.3738619136 ],
    [ 2.183e-08, 2.17530786579, 15113.9892382 ],
    [ 2.445e-08, 5.91435376684, 5331.35744374 ],
    // 152 terms retained
];

KMG.VSOPTerms.mars_L2 = [
    [ 0.00058152577, 2.04961712429, 3340.6124267 ],
    [ 0.00013459579, 2.45738706163, 6681.2248534 ],
    [ 2.432575e-05, 2.79737979284, 10021.8372801 ],
    [ 4.01065e-06, 3.13581149963, 13362.4497068 ],
    [ 4.51384e-06, 0, 0 ],
    [ 2.22025e-06, 3.19437046607, 3.523118349 ],
    [ 1.20954e-06, 0.54327128607, 155.420399434 ],
    [ 6.2971e-07, 3.47765178989, 16703.0621335 ],
    [ 5.3644e-07, 3.54171478781, 3344.13554505 ],
    [ 3.4273e-07, 6.00208464365, 2281.23049651 ],
    [ 3.1659e-07, 4.14001980084, 191.448266112 ],
    [ 2.9839e-07, 1.9983873938, 796.298006816 ],
    [ 2.3172e-07, 4.33401932281, 242.728603974 ],
    [ 2.1663e-07, 3.44500841809, 398.149003408 ],
    [ 1.605e-07, 6.11000263211, 2146.16541648 ],
    [ 2.0369e-07, 5.42202383442, 553.569402842 ],
    [ 1.4924e-07, 6.09549588012, 3185.19202727 ],
    [ 1.6229e-07, 0.65685105422, 0.9803210682 ],
    [ 1.4317e-07, 2.61898820749, 1349.86740966 ],
    [ 1.4411e-07, 4.01941740099, 951.718406251 ],
    [ 1.1944e-07, 3.86196758615, 6684.74797175 ],
    [ 1.5655e-07, 1.22093822826, 1748.01641307 ],
    [ 1.1261e-07, 4.71857181601, 2544.31441988 ],
    [ 1.336e-07, 0.60151621438, 1194.44701022 ],
    [ 1.0395e-07, 0.25075540193, 382.896532223 ],
    [ 9.415e-08, 0.68050215057, 1059.38193019 ],
    [ 9.58e-08, 3.82256319681, 20043.6745602 ],
    [ 8.996e-08, 3.88272784458, 3738.76143011 ],
    [ 7.498e-08, 5.46428174266, 1751.53953142 ],
    [ 6.499e-08, 5.47802397833, 1592.59601363 ],
    [ 6.307e-08, 2.34134269478, 3097.88382273 ],
    [ 6.864e-08, 2.57523762859, 3149.16416059 ],
    [ 5.871e-08, 1.1486285578, 7.1135470008 ],
    [ 6.675e-08, 2.37862627319, 4136.91043352 ],
    [ 4.655e-08, 4.4310225149, 6151.5338883 ],
    [ 4.201e-08, 3.68638044545, 5614.72937621 ],
    [ 4.796e-08, 2.89378142432, 3333.4988797 ],
    [ 4.074e-08, 6.12610105396, 5628.95647021 ],
    [ 3.66e-08, 4.06581319964, 1990.74501704 ],
    [ 3.284e-08, 2.79214099721, 3894.18182954 ],
    [ 3.615e-08, 2.46526861067, 529.690965095 ],
    [ 3.214e-08, 0.68469193035, 8962.45534991 ],
    [ 3.087e-08, 4.56932030502, 3496.03282613 ],
    [ 2.918e-08, 5.41494777349, 2914.01423582 ],
    [ 2.925e-08, 1.23098223044, 2787.04302386 ],
    [ 2.808e-08, 1.38431632694, 4292.33083295 ],
    [ 2.652e-08, 1.05282528913, 3341.59274777 ],
    [ 2.92e-08, 3.41297158184, 3337.08930835 ],
    [ 2.423e-08, 0.9648433024, 4535.05943692 ],
    [ 2.311e-08, 4.84742235872, 9492.146315 ],
    [ 2.597e-08, 5.74792546254, 3340.59517305 ],
    [ 2.19e-08, 3.26596280325, 213.299095438 ],
    [ 2.598e-08, 1.49506860128, 3340.62968035 ],
    [ 2.365e-08, 4.1830384242, 10025.3603984 ],
    [ 2.63e-08, 4.67732434694, 3583.34103067 ],
    [ 2.606e-08, 2.64976204169, 2388.89402045 ],
    [ 1.822e-08, 0.97105743952, 1589.07289528 ],
    [ 2.397e-08, 1.04493547179, 4399.99435689 ],
    [ 2.203e-08, 0.16281603659, 6525.80445397 ],
    [ 2.373e-08, 4.26885534124, 7079.37385681 ],
    [ 2.366e-08, 0.00564620006, 4690.47983636 ],
    [ 1.623e-08, 4.95374152644, 5088.62883977 ],
    [ 2.143e-08, 0.47993241836, 2700.71514039 ],
    [ 1.646e-08, 4.94105214632, 1221.84856632 ],
    [ 1.588e-08, 1.11405721408, 12303.0677766 ],
    [ 1.518e-08, 0.11076145171, 2957.71589448 ],
    [ 1.774e-08, 3.80344931471, 3723.50895892 ],
    [ 1.364e-08, 3.86744855408, 6283.07584999 ],
    [ 1.764e-08, 2.51992889432, 2810.92146161 ],
    [ 1.394e-08, 2.7360876673, 7477.52286022 ],
    [ 1.28e-08, 5.47285286548, 6677.70173505 ],
    [ 1.447e-08, 2.97506973239, 6489.77658729 ],
    [ 1.248e-08, 3.77100223369, 2699.73481932 ],
    [ 1.527e-08, 2.92629955117, 640.877607382 ],
    [ 1.197e-08, 1.89205359446, 6681.24210705 ],
    [ 1.418e-08, 1.54599865534, 3347.7259737 ],
    [ 1.423e-08, 4.17063094406, 23384.2869869 ],
    [ 1.042e-08, 5.83283345776, 4933.20844033 ],
    [ 1.196e-08, 6.14479114175, 6681.20759975 ],
    [ 1.153e-08, 1.50265359557, 426.598190876 ],
    [ 1.099e-08, 3.80358943061, 3870.30339179 ],
    [ 9.09e-09, 3.81838122072, 5092.15195812 ],
    [ 1.071e-08, 5.04949161471, 5621.84292321 ],
    [ 8.46e-09, 3.82219998207, 3340.5451164 ],
    [ 1.075e-08, 3.81844135104, 3553.91152214 ],
    [ 8.56e-09, 3.42045045625, 3340.679737 ],
    [ 9.16e-09, 1.91472787569, 3532.06069281 ],
    [ 7.14e-09, 4.26169501052, 9623.68827669 ],
    [ 9.07e-09, 4.12943952579, 162.466636132 ],
    [ 6.53e-09, 3.10816357251, 7234.79425624 ],
    [ 7.92e-09, 5.20659969594, 87.3082045398 ],
    [ 6.54e-09, 1.57331630734, 2487.41604495 ],
    [ 6.49e-09, 2.78892909992, 574.344798335 ],
    [ 6.48e-09, 5.181110771, 12832.7587417 ],
    [ 7.07e-09, 5.8319586932, 3339.63210563 ],
    [ 5.2e-09, 4.64660657418, 6836.64525283 ],
    [ 6.6e-09, 0.24998045706, 8969.56889691 ],
    [ 6.4e-09, 1.70935421799, 7632.94325965 ],
    [ 5.28e-09, 0.3110540935, 8031.09226306 ],
    [ 5.1e-09, 4.63676288319, 10419.9862835 ],
    [ 6.04e-09, 3.85002715377, 5486.77784318 ],
    [ 5.14e-09, 1.38796992796, 7740.60678359 ],
    // 102 terms retained
];

KMG.VSOPTerms.mars_L3 = [
    [ 1.467867e-05, 0.4442983946, 3340.6124267 ],
    [ 6.92668e-06, 0.88679887123, 6681.2248534 ],
    [ 1.89478e-06, 1.28336839921, 10021.8372801 ],
    [ 4.1615e-07, 1.64210455567, 13362.4497068 ],
    [ 2.266e-07, 2.05278956965, 155.420399434 ],
    [ 8.126e-08, 1.99049724299, 16703.0621335 ],
    [ 1.0455e-07, 1.57992093693, 3.523118349 ],
    [ 4.902e-08, 2.8251687501, 242.728603974 ],
    [ 5.379e-08, 3.14159265359, 0 ],
    [ 3.782e-08, 2.01848153986, 3344.13554505 ],
    [ 3.181e-08, 4.59108786647, 3185.19202727 ],
    [ 3.133e-08, 0.65141319517, 553.569402842 ],
    [ 1.698e-08, 5.53803382831, 951.718406251 ],
    [ 1.525e-08, 5.71698515888, 191.448266112 ],
    [ 1.451e-08, 0.4606849022, 796.298006816 ],
    [ 1.473e-08, 2.33727441522, 20043.6745602 ],
    [ 1.314e-08, 5.36403056955, 0.9803210682 ],
    [ 1.178e-08, 4.14644990348, 1349.86740966 ],
    [ 1.138e-08, 2.37914351932, 6684.74797175 ],
    [ 1.046e-08, 1.76915268602, 382.896532223 ],
    [ 9.02e-09, 5.35475854699, 1194.44701022 ],
    [ 8.13e-09, 2.74852234414, 1748.01641307 ],
    [ 6.29e-09, 6.08292992203, 3496.03282613 ],
    [ 5.64e-09, 1.87914711325, 398.149003408 ],
    [ 5.66e-09, 5.8543921654, 7.1135470008 ],
    [ 6.46e-09, 3.17980126471, 3583.34103067 ],
    // 26 terms retained
];

KMG.VSOPTerms.mars_L4 = [
    [ 2.7242e-07, 5.6399774232, 6681.2248534 ],
    [ 2.5511e-07, 5.13956279086, 3340.6124267 ],
    [ 1.1147e-07, 6.03556608878, 10021.8372801 ],
    [ 3.19e-08, 3.56206901204, 155.420399434 ],
    [ 3.251e-08, 0.1291561646, 13362.4497068 ],
    // 5 terms retained
];

KMG.VSOPTerms.mars_L5 = [
    [ 7.62e-09, 4.03556368806, 6681.2248534 ],
    [ 5.11e-09, 4.4877039364, 10021.8372801 ],
    [ 3.6e-09, 5.07296615717, 155.420399434 ],
    // 3 terms retained
];

KMG.VSOPTerms.mars_B0 = [
    [ 0.03197134986, 3.76832042431, 3340.6124267 ],
    [ 0.00298033234, 4.10616996305, 6681.2248534 ],
    [ 0.00289104742, 0, 0 ],
    [ 0.00031365539, 4.4465105309, 10021.8372801 ],
    [ 3.4841e-05, 4.7881254926, 13362.4497068 ],
    [ 4.42999e-06, 5.65233014206, 3337.08930835 ],
    [ 4.43401e-06, 5.02642622964, 3344.13554505 ],
    [ 3.99109e-06, 5.13056816928, 16703.0621335 ],
    [ 2.92506e-06, 3.79290674178, 2281.23049651 ],
    [ 1.81982e-06, 6.13648041445, 6151.5338883 ],
    [ 1.63159e-06, 4.26399640691, 529.690965095 ],
    [ 1.59678e-06, 2.23194572851, 1059.38193019 ],
    [ 1.39323e-06, 2.41796458896, 8962.45534991 ],
    [ 1.49297e-06, 2.16501221175, 5621.84292321 ],
    [ 1.42686e-06, 1.18215016908, 3340.59517305 ],
    [ 1.42685e-06, 3.21292181638, 3340.62968035 ],
    [ 8.2544e-07, 5.36667920373, 6684.74797175 ],
    [ 7.3639e-07, 5.0918769577, 398.149003408 ],
    [ 7.266e-07, 5.53775735826, 6283.07584999 ],
    [ 8.6377e-07, 5.74429749104, 3738.76143011 ],
    [ 8.3276e-07, 5.98866355811, 6677.70173505 ],
    [ 6.0116e-07, 3.67960801961, 796.298006816 ],
    [ 6.3111e-07, 0.73049101791, 5884.92684658 ],
    [ 6.2338e-07, 4.8507212869, 2942.46342329 ],
    // 24 terms retained
];

KMG.VSOPTerms.mars_B1 = [
    [ 0.00217310991, 6.04472194776, 3340.6124267 ],
    [ 0.00020976948, 3.14159265359, 0 ],
    [ 0.00012834709, 1.60810667915, 6681.2248534 ],
    [ 3.320981e-05, 2.62947004077, 10021.8372801 ],
    [ 6.272e-06, 3.11898601248, 13362.4497068 ],
    [ 1.0199e-06, 3.52113557592, 16703.0621335 ],
    [ 7.5107e-07, 0.95983758515, 3337.08930835 ],
    [ 2.9264e-07, 3.4030768271, 3344.13554505 ],
    [ 2.3251e-07, 3.69342549027, 5621.84292321 ],
    [ 2.219e-07, 2.21703408598, 2281.23049651 ],
    [ 1.5454e-07, 3.89610159362, 20043.6745602 ],
    [ 1.1867e-07, 3.83861019788, 6684.74797175 ],
    [ 1.2038e-07, 2.13866775328, 6151.5338883 ],
    [ 9.697e-08, 5.48941186798, 3340.62968035 ],
    [ 9.697e-08, 3.45863925102, 3340.59517305 ],
    [ 1.1537e-07, 1.90395033905, 3532.06069281 ],
    [ 9.276e-08, 0.71941312462, 2942.46342329 ],
    [ 9.24e-08, 2.51747952408, 5884.92684658 ],
    [ 9.876e-08, 6.13507416822, 1059.38193019 ],
    [ 9.265e-08, 4.55759125226, 8962.45534991 ],
    [ 7.822e-08, 6.10932267009, 2810.92146161 ],
    [ 1.0369e-07, 0.60195347181, 529.690965095 ],
    [ 8.522e-08, 4.40106741096, 3496.03282613 ],
    [ 7.683e-08, 1.21169696624, 6677.70173505 ],
    [ 7.134e-08, 1.93610705535, 2544.31441988 ],
    [ 6.512e-08, 3.11636422105, 3738.76143011 ],
    [ 6.278e-08, 6.23176923902, 3185.19202727 ],
    [ 5.833e-08, 0.74324094343, 398.149003408 ],
    [ 5.033e-08, 2.28727456802, 3149.16416059 ],
    [ 4.958e-08, 1.54200127913, 6283.07584999 ],
    // 30 terms retained
];

KMG.VSOPTerms.mars_B2 = [
    [ 8.888446e-05, 1.06196052751, 3340.6124267 ],
    [ 2.595393e-05, 3.14159265359, 0 ],
    [ 9.18914e-06, 0.1153843119, 6681.2248534 ],
    [ 2.67883e-06, 0.78837893063, 10021.8372801 ],
    [ 6.6911e-07, 1.39435595847, 13362.4497068 ],
    [ 1.4267e-07, 1.87268116087, 16703.0621335 ],
    [ 7.948e-08, 2.58819177832, 3337.08930835 ],
    [ 2.709e-08, 2.29241371893, 20043.6745602 ],
    [ 2.911e-08, 1.36634316448, 3344.13554505 ],
    [ 2.528e-08, 6.00423798411, 3496.03282613 ],
    [ 1.617e-08, 5.72212771018, 5621.84292321 ],
    [ 1.625e-08, 4.63140305669, 3185.19202727 ],
    // 12 terms retained
];

KMG.VSOPTerms.mars_B3 = [
    [ 3.30418e-06, 2.04215300484, 3340.6124267 ],
    [ 9.3057e-07, 0, 0 ],
    [ 1.4546e-07, 5.38525967237, 10021.8372801 ],
    [ 8.731e-08, 4.90252313032, 6681.2248534 ],
    [ 5.215e-08, 5.97441462813, 13362.4497068 ],
    [ 1.422e-08, 0.21283650226, 16703.0621335 ],
    // 6 terms retained
];

KMG.VSOPTerms.mars_B4 = [
    [ 6.007e-08, 3.37637101191, 3340.6124267 ],
    [ 6.625e-08, 0, 0 ],
    // 2 terms retained
];

KMG.VSOPTerms.mars_B5 = [
    [ 0, 0, 0 ],
    // 0 terms retained
];

KMG.VSOPTerms.mars_R0 = [
    [ 1.53033488271, 0, 0 ],
    [ 0.1418495316, 3.47971283528, 3340.6124267 ],
    [ 0.00660776362, 3.81783443019, 6681.2248534 ],
    [ 0.00046179117, 4.15595316782, 10021.8372801 ],
    [ 8.109733e-05, 5.55958416318, 2810.92146161 ],
    [ 7.485318e-05, 1.77239078402, 5621.84292321 ],
    [ 5.523191e-05, 1.3643630377, 2281.23049651 ],
    [ 3.82516e-05, 4.49407183687, 13362.4497068 ],
    [ 2.306537e-05, 0.09081579001, 2544.31441988 ],
    [ 1.999396e-05, 5.36059617709, 3337.08930835 ],
    [ 2.484394e-05, 4.9254563992, 2942.46342329 ],
    [ 1.960195e-05, 4.74249437639, 3344.13554505 ],
    [ 1.167119e-05, 2.11260868341, 5092.15195812 ],
    [ 1.102816e-05, 5.00908403998, 398.149003408 ],
    [ 8.99066e-06, 4.40791133207, 529.690965095 ],
    [ 9.92252e-06, 5.83861961952, 6151.5338883 ],
    [ 8.07354e-06, 2.10217065501, 1059.38193019 ],
    [ 7.97915e-06, 3.44839203899, 796.298006816 ],
    [ 7.40975e-06, 1.49906336885, 2146.16541648 ],
    [ 6.92339e-06, 2.13378874689, 8962.45534991 ],
    [ 6.33144e-06, 0.89353283242, 3340.59517305 ],
    [ 7.25583e-06, 1.24516810723, 8432.76438482 ],
    [ 6.3314e-06, 2.92430446399, 3340.62968035 ],
    [ 5.74355e-06, 0.82896244455, 2914.01423582 ],
    [ 5.26166e-06, 5.38292991236, 3738.76143011 ],
    [ 6.29978e-06, 1.28737486495, 1751.53953142 ],
    [ 4.72775e-06, 5.19850522346, 3127.31333126 ],
    [ 3.48095e-06, 4.83219199976, 16703.0621335 ],
    [ 2.83713e-06, 2.90692064724, 3532.06069281 ],
    [ 2.79543e-06, 5.2574968538, 6283.07584999 ],
    [ 2.33857e-06, 5.10545987572, 5486.77784318 ],
    [ 2.19427e-06, 5.58340231744, 191.448266112 ],
    [ 2.69896e-06, 3.76393625127, 5884.92684658 ],
    [ 2.08335e-06, 5.25476078693, 3340.5451164 ],
    [ 2.75217e-06, 2.90817482492, 1748.01641307 ],
    [ 2.75506e-06, 1.21767950614, 6254.62666252 ],
    [ 2.39119e-06, 2.03669934656, 1194.44701022 ],
    [ 2.23189e-06, 4.19861535147, 3149.16416059 ],
    [ 1.82689e-06, 5.08062725665, 6684.74797175 ],
    [ 1.86207e-06, 5.6987157241, 6677.70173505 ],
    [ 1.76e-06, 5.95341919657, 3870.30339179 ],
    [ 1.78617e-06, 4.18423004741, 3333.4988797 ],
    [ 2.0833e-06, 4.84626439637, 3340.679737 ],
    [ 2.28126e-06, 3.25526555588, 6872.67311951 ],
    [ 1.44312e-06, 0.2130621946, 5088.62883977 ],
    [ 1.63527e-06, 3.79888811958, 4136.91043352 ],
    [ 1.33126e-06, 1.53906679361, 7903.07341972 ],
    [ 1.41755e-06, 2.47792380112, 4562.46099302 ],
    [ 1.14927e-06, 4.31748869065, 1349.86740966 ],
    [ 1.18789e-06, 2.12168482244, 1589.07289528 ],
    [ 1.02094e-06, 6.18145185708, 9492.146315 ],
    [ 1.2857e-06, 5.49884728795, 8827.39026987 ],
    [ 1.11546e-06, 0.55346108403, 11243.6858464 ],
    [ 8.2498e-07, 1.62220096558, 11773.3768115 ],
    [ 8.3204e-07, 0.61551135046, 8429.24126647 ],
    [ 8.4463e-07, 0.62274409931, 1592.59601363 ],
    [ 8.6666e-07, 1.74984525176, 2700.71514039 ],
    [ 7.1813e-07, 2.4749406548, 12303.0677766 ],
    [ 8.5321e-07, 1.61634750496, 4690.47983636 ],
    [ 6.3641e-07, 2.67334163937, 426.598190876 ],
    [ 6.8601e-07, 2.40188234283, 4399.99435689 ],
    [ 5.8559e-07, 4.7205283999, 213.299095438 ],
    [ 6.2009e-07, 1.10068565926, 1221.84856632 ],
    [ 6.6499e-07, 2.21296335919, 6041.32756709 ],
    [ 5.581e-07, 1.2328806632, 3185.19202727 ],
    [ 5.4969e-07, 5.72695354791, 951.718406251 ],
    [ 5.243e-07, 3.0236809553, 4292.33083295 ],
    [ 5.5688e-07, 5.44688671707, 3723.50895892 ],
    [ 5.8959e-07, 3.26242460622, 6681.24210705 ],
    [ 4.4638e-07, 2.01459444131, 8031.09226306 ],
    [ 5.8959e-07, 1.2316529679, 6681.20759975 ],
    [ 4.2439e-07, 2.26554261514, 155.420399434 ],
    [ 3.8955e-07, 2.57760417339, 3341.59274777 ],
    [ 5.155e-07, 5.72324451485, 7079.37385681 ],
    [ 4.894e-07, 5.61613493545, 3553.91152214 ],
    [ 4.5406e-07, 5.43303278149, 6467.92575796 ],
    [ 3.6438e-07, 4.43922435395, 3894.18182954 ],
    [ 3.598e-07, 1.15972378713, 2288.34404351 ],
    [ 3.5268e-07, 5.49032233898, 1990.74501704 ],
    [ 4.2192e-07, 1.63254827838, 5628.95647021 ],
    [ 4.4292e-07, 5.00344221303, 5614.72937621 ],
    [ 3.3616e-07, 5.17029030468, 20043.6745602 ],
    [ 4.3256e-07, 1.03722397198, 11769.8536932 ],
    [ 3.9237e-07, 1.24237030858, 3339.63210563 ],
    [ 3.1949e-07, 4.59259676953, 2274.11694951 ],
    [ 3.0352e-07, 2.44163963455, 11371.7046898 ],
    [ 3.2269e-07, 2.38222363233, 4535.05943692 ],
    [ 3.1855e-07, 4.37536980289, 3.523118349 ],
    [ 2.9342e-07, 4.06035002188, 3097.88382273 ],
    [ 3.1967e-07, 1.93969979134, 382.896532223 ],
    [ 2.6164e-07, 5.58463559826, 9623.68827669 ],
    [ 2.7903e-07, 4.25809486053, 3191.04922957 ],
    [ 3.3044e-07, 0.85475620169, 553.569402842 ],
    [ 2.7544e-07, 1.5766864517, 9595.23908922 ],
    [ 2.5163e-07, 0.81337734264, 10713.9948813 ],
    [ 2.2045e-07, 0.85711201558, 3319.83703121 ],
    [ 2.4759e-07, 5.38993953923, 2818.03500861 ],
    [ 2.3352e-07, 6.0145897459, 3496.03282613 ],
    [ 2.4723e-07, 2.58025225634, 2803.8079146 ],
    [ 1.9361e-07, 5.18528881954, 6681.2921637 ],
    [ 1.9118e-07, 5.419693554, 10025.3603984 ],
    [ 1.9361e-07, 5.59378511334, 6681.1575431 ],
    [ 1.8331e-07, 5.7956572331, 7064.12138562 ],
    [ 1.8188e-07, 5.61299105522, 7.1135470008 ],
    [ 2.0393e-07, 4.53615443964, 6489.77658729 ],
    [ 2.1258e-07, 6.19174428363, 14054.607308 ],
    [ 1.7094e-07, 1.54988538094, 2957.71589448 ],
    [ 2.2794e-07, 3.41719468533, 7632.94325965 ],
    [ 2.0561e-07, 2.98654120324, 3361.38782219 ],
    [ 1.705e-07, 6.15529583629, 10404.7338123 ],
    [ 1.8007e-07, 2.81505100996, 4032.77002793 ],
    [ 1.6487e-07, 3.84534133372, 10973.5556864 ],
    [ 1.6056e-07, 0.92819026247, 14584.2982731 ],
    [ 2.1008e-07, 2.38506850221, 4989.0591839 ],
    [ 1.6291e-07, 1.92190075688, 7373.38245463 ],
    [ 1.6286e-07, 6.28252184173, 7210.91581849 ],
    [ 1.8575e-07, 4.07319565284, 2388.89402045 ],
    [ 1.5976e-07, 4.58379703739, 3264.34635542 ],
    [ 1.9909e-07, 2.73523951203, 5099.26550512 ],
    [ 1.9667e-07, 1.86294734899, 3443.70520092 ],
    [ 1.65e-07, 4.1406165717, 7477.52286022 ],
    [ 1.9492e-07, 6.03778625701, 10018.3141618 ],
    [ 1.5097e-07, 2.65433832872, 2787.04302386 ],
    [ 1.9099e-07, 0.22623513076, 13745.346239 ],
    [ 1.7164e-07, 3.1882629935, 3347.7259737 ],
    [ 1.3407e-07, 2.12775612449, 3344.20285535 ],
    [ 1.5407e-07, 2.20766468871, 2118.76386038 ],
    [ 1.7246e-07, 3.67064642858, 3205.54734666 ],
    [ 1.3091e-07, 4.27475419816, 14314.168113 ],
    [ 1.6437e-07, 2.86612474805, 14712.3171165 ],
    [ 1.6648e-07, 4.521351492, 6674.1113064 ],
    [ 1.3718e-07, 1.68586111426, 3337.02199805 ],
    [ 1.1824e-07, 0.19675650045, 3475.67750674 ],
    [ 1.1757e-07, 3.23020638064, 5828.02847165 ],
    [ 1.1884e-07, 4.82075035433, 7234.79425624 ],
    [ 1.0608e-07, 1.73995972784, 639.897286314 ],
    [ 1.1143e-07, 0.23833349966, 12832.7587417 ],
    [ 1.1028e-07, 0.4455568729, 10213.2855462 ],
    [ 1.0238e-07, 5.74731032428, 242.728603974 ],
    [ 1.0052e-07, 2.45096419672, 4929.68532198 ],
    [ 1.0061e-07, 0.78904152333, 9381.93999379 ],
    [ 1.0065e-07, 5.37509927353, 5085.03841111 ],
    [ 1.1897e-07, 0.79890074455, 3265.83082813 ],
    [ 8.983e-08, 0.96474320941, 4933.20844033 ],
    [ 8.976e-08, 4.18310051894, 9225.53927328 ],
    [ 8.982e-08, 1.98499607259, 15113.9892382 ],
    [ 8.325e-08, 1.93706224943, 1648.4467572 ],
    [ 7.832e-08, 2.04997038646, 1758.65307842 ],
    [ 7.964e-08, 3.92258783522, 2921.12778282 ],
    [ 1.0223e-07, 2.66509814753, 2487.41604495 ],
    [ 8.277e-08, 0.94860765545, 2906.90068882 ],
    [ 7.371e-08, 0.84436508721, 692.157601227 ],
    [ 7.529e-08, 5.68043313811, 13916.0191096 ],
    [ 7.907e-08, 2.81314645975, 15643.6802033 ],
    [ 6.956e-08, 3.32212696002, 3230.40610548 ],
    [ 7.426e-08, 6.09654676653, 3583.34103067 ],
    [ 6.402e-08, 4.19806999276, 5202.35827934 ],
    [ 6.523e-08, 6.11927838278, 135.065080035 ],
    [ 6.127e-08, 0.00122595969, 6836.64525283 ],
    [ 6.223e-08, 6.1065313699, 17256.6315363 ],
    [ 8.161e-08, 5.24822786208, 10575.4066829 ],
    [ 6.163e-08, 3.60026818309, 10021.8545338 ],
    [ 6.163e-08, 1.56949585888, 10021.8200264 ],
    [ 5.673e-08, 0.13638905291, 13524.9163429 ],
    [ 6.257e-08, 4.50450316951, 8425.65083781 ],
    [ 5.249e-08, 2.70116504868, 4459.3682188 ],
    [ 6.47e-08, 2.74232480124, 7740.60678359 ],
    [ 5.523e-08, 6.06378363783, 10419.9862835 ],
    [ 5.548e-08, 5.75002125481, 12168.0026966 ],
    [ 6.827e-08, 4.69340338938, 17654.7805397 ],
    [ 4.993e-08, 4.68464837021, 522.577418094 ],
    [ 6.32e-08, 3.3193809127, 3767.21061758 ],
    [ 4.735e-08, 0.00770324607, 3325.35995551 ],
    [ 5.025e-08, 2.33675441772, 1052.26838319 ],
    [ 4.656e-08, 5.15033151106, 1066.49547719 ],
    [ 4.728e-08, 5.77993082374, 9808.53818466 ],
    [ 5.128e-08, 1.57178942294, 6525.80445397 ],
    [ 4.523e-08, 1.44233177206, 3369.06161417 ],
    [ 6.205e-08, 4.48163731718, 22747.2907149 ],
    [ 6.169e-08, 4.59085555242, 6531.66165626 ],
    [ 5.329e-08, 4.55141789349, 1744.42598442 ],
    [ 4.514e-08, 5.94508421612, 6894.52394884 ],
    [ 4.33e-08, 3.10899106071, 4569.57454002 ],
    [ 5.367e-08, 5.08071026709, 2707.82868739 ],
    [ 5.138e-08, 1.28584065229, 8439.87793182 ],
    [ 4.12e-08, 5.48544036931, 2699.73481932 ],
    [ 5.398e-08, 5.21710209952, 5305.45105355 ],
    [ 4.45e-08, 5.56771154217, 16865.5287696 ],
    [ 3.898e-08, 1.48753002285, 9168.64089835 ],
    [ 3.858e-08, 1.23056079731, 16858.4825329 ],
    [ 3.764e-08, 0.27080818668, 17395.2197347 ],
    [ 4.687e-08, 3.0570907584, 5518.75014899 ],
    [ 4.264e-08, 2.79046663043, 3503.07906283 ],
    [ 3.864e-08, 0.37957786186, 10177.2576795 ],
    [ 3.992e-08, 1.84425142473, 3134.42687826 ],
    [ 3.658e-08, 2.95544843123, 6144.4203413 ],
    [ 3.65e-08, 1.58041651396, 6680.24453233 ],
    [ 3.945e-08, 1.98631850445, 8969.56889691 ],
    // 198 terms retained
];

KMG.VSOPTerms.mars_R1 = [
    [ 0.01107433345, 2.03250524857, 3340.6124267 ],
    [ 0.00103175887, 2.37071847807, 6681.2248534 ],
    [ 0.000128772, 0, 0 ],
    [ 0.0001081588, 2.70888095665, 10021.8372801 ],
    [ 1.19455e-05, 3.04702256206, 13362.4497068 ],
    [ 4.38582e-06, 2.88835054603, 2281.23049651 ],
    [ 3.957e-06, 3.42323670971, 3344.13554505 ],
    [ 1.82576e-06, 1.58427562964, 2544.31441988 ],
    [ 1.35851e-06, 3.38507063082, 16703.0621335 ],
    [ 1.28199e-06, 0.62991771813, 1059.38193019 ],
    [ 1.27059e-06, 1.95391155885, 796.298006816 ],
    [ 1.18443e-06, 2.99762091382, 2146.16541648 ],
    [ 1.28362e-06, 6.04343227063, 3337.08930835 ],
    [ 8.7534e-07, 3.42053385867, 398.149003408 ],
    [ 8.3021e-07, 3.85575072018, 3738.76143011 ],
    [ 7.5604e-07, 4.45097659377, 6151.5338883 ],
    [ 7.2002e-07, 2.76443992447, 529.690965095 ],
    [ 6.6545e-07, 2.5487838147, 1751.53953142 ],
    [ 5.4305e-07, 0.67754203387, 8962.45534991 ],
    [ 5.1043e-07, 3.72584855417, 6684.74797175 ],
    [ 6.6413e-07, 4.40596377334, 1748.01641307 ],
    [ 4.786e-07, 2.28524521788, 2914.01423582 ],
    [ 4.942e-07, 5.72961379219, 3340.59517305 ],
    [ 4.942e-07, 1.47720011103, 3340.62968035 ],
    [ 5.7519e-07, 0.5435613312, 1194.44701022 ],
    [ 4.832e-07, 2.58061402348, 3149.16416059 ],
    [ 3.6383e-07, 6.02729341698, 3185.19202727 ],
    [ 3.7161e-07, 5.81436290851, 1349.86740966 ],
    [ 3.6035e-07, 5.89515829011, 3333.4988797 ],
    [ 3.1111e-07, 0.97820401887, 191.448266112 ],
    [ 3.8957e-07, 2.31902442004, 4136.91043352 ],
    [ 2.7256e-07, 5.41369838171, 1592.59601363 ],
    [ 2.4302e-07, 3.75838444077, 155.420399434 ],
    [ 2.2808e-07, 1.74818178182, 5088.62883977 ],
    [ 2.2322e-07, 0.93941901193, 951.718406251 ],
    [ 2.1712e-07, 3.83569490817, 6283.07584999 ],
    [ 2.1302e-07, 0.78030571909, 1589.07289528 ],
    [ 2.1631e-07, 4.56903942095, 3532.06069281 ],
    [ 1.7957e-07, 4.21923537063, 3870.30339179 ],
    [ 1.8241e-07, 0.41334220202, 5486.77784318 ],
    [ 1.625e-07, 3.80772429678, 3340.5451164 ],
    [ 1.6803e-07, 5.54855432911, 3097.88382273 ],
    [ 1.6852e-07, 4.53696884484, 4292.33083295 ],
    [ 1.5749e-07, 4.75766175289, 9492.146315 ],
    [ 1.5747e-07, 3.72356261757, 20043.6745602 ],
    [ 2.0429e-07, 3.13541604634, 4690.47983636 ],
    [ 1.4699e-07, 5.95340513928, 3894.18182954 ],
    [ 1.6251e-07, 3.39910570757, 3340.679737 ],
    [ 1.4256e-07, 3.99914527335, 1990.74501704 ],
    [ 1.6529e-07, 0.96740368703, 4399.99435689 ],
    [ 1.3011e-07, 5.14215010082, 6677.70173505 ],
    [ 1.2482e-07, 1.03238555854, 3341.59274777 ],
    [ 1.6454e-07, 3.53827765951, 2700.71514039 ],
    [ 1.6167e-07, 2.3489111087, 553.569402842 ],
    [ 1.3169e-07, 0.41462220221, 5614.72937621 ],
    [ 1.127e-07, 1.02387117266, 12303.0677766 ],
    [ 1.241e-07, 6.23139144626, 5628.95647021 ],
    [ 1.2747e-07, 0.69046237163, 3723.50895892 ],
    [ 1.1828e-07, 6.25270937134, 2274.11694951 ],
    [ 1.0382e-07, 1.23229650709, 426.598190876 ],
    [ 1.1207e-07, 1.31732435116, 3496.03282613 ],
    [ 1.0345e-07, 0.90062869301, 4535.05943692 ],
    [ 1.2214e-07, 4.22347837212, 7079.37385681 ],
    [ 9.764e-08, 3.45310129694, 382.896532223 ],
    [ 8.583e-08, 1.1647889051, 2787.04302386 ],
    [ 7.879e-08, 5.73808303461, 2288.34404351 ],
    [ 9.192e-08, 1.81719352796, 6681.24210705 ],
    [ 7.752e-08, 4.15038634174, 6041.32756709 ],
    [ 9.192e-08, 6.06960723129, 6681.20759975 ],
    [ 9.008e-08, 2.58179552398, 2388.89402045 ],
    [ 6.77e-08, 0.240118807, 11773.3768115 ],
    [ 7.088e-08, 3.51428380287, 8031.09226306 ],
    [ 9.159e-08, 3.90203365989, 3553.91152214 ],
    [ 7.233e-08, 3.70260535699, 2818.03500861 ],
    [ 6.701e-08, 4.25537421062, 242.728603974 ],
    [ 6.534e-08, 0.04317593308, 2957.71589448 ],
    [ 8.783e-08, 2.19764346848, 1221.84856632 ],
    [ 6.54e-08, 2.11811131682, 8429.24126647 ],
    [ 6.835e-08, 4.04527289029, 10025.3603984 ],
    [ 7.279e-08, 4.26969778292, 2803.8079146 ],
    [ 7.679e-08, 1.00816125095, 8432.76438482 ],
    [ 5.736e-08, 3.13988802339, 213.299095438 ],
    [ 5.343e-08, 3.7818416468, 5092.15195812 ],
    [ 5.985e-08, 2.96429619989, 6489.77658729 ],
    [ 5.132e-08, 3.98288020531, 7.1135470008 ],
    [ 6.264e-08, 1.90345600186, 5621.84292321 ],
    [ 5.238e-08, 2.67050910776, 7477.52286022 ],
    [ 6.264e-08, 1.60046198142, 3347.7259737 ],
    [ 6.527e-08, 2.76220386403, 3339.63210563 ],
    [ 4.594e-08, 1.82031785094, 2810.92146161 ],
    [ 5.46e-08, 4.60869963415, 3583.34103067 ],
    [ 4.73e-08, 0.90611934427, 5099.26550512 ],
    [ 5.484e-08, 4.91405753832, 7632.94325965 ],
    [ 4.002e-08, 4.1410000521, 9623.68827669 ],
    [ 3.836e-08, 0.03411499404, 7234.79425624 ],
    [ 3.618e-08, 5.76553319747, 4933.20844033 ],
    [ 3.747e-08, 0.08776717073, 6525.80445397 ],
    [ 3.016e-08, 3.73804058695, 6681.2921637 ],
    [ 3.975e-08, 4.91286826343, 2942.46342329 ],
    [ 3.911e-08, 0.67457174687, 3127.31333126 ],
    [ 3.923e-08, 3.07698893109, 3.523118349 ],
    [ 3.943e-08, 0.53936955267, 5884.92684658 ],
    [ 2.902e-08, 4.66228680082, 7210.91581849 ],
    [ 2.803e-08, 1.00505054832, 7064.12138562 ],
    [ 3.152e-08, 4.54611126545, 2487.41604495 ],
    [ 2.797e-08, 0.05226680768, 639.897286314 ],
    [ 2.758e-08, 5.17057629399, 5828.02847165 ],
    [ 3.02e-08, 4.14658810846, 6681.1575431 ],
    [ 3e-08, 0.82762095066, 5085.03841111 ],
    [ 3.022e-08, 2.59437829291, 2906.90068882 ],
    [ 2.673e-08, 0.69433657973, 2699.73481932 ],
    [ 2.593e-08, 1.08691889359, 4929.68532198 ],
    [ 3.127e-08, 0.99947199034, 2118.76386038 ],
    [ 2.597e-08, 5.01157388627, 10018.3141618 ],
    [ 2.606e-08, 5.34395258978, 10973.5556864 ],
    [ 2.779e-08, 3.98360727591, 6467.92575796 ],
    [ 2.457e-08, 1.52659064342, 6836.64525283 ],
    [ 2.381e-08, 3.93615187831, 11371.7046898 ],
    [ 2.584e-08, 5.08907827632, 12832.7587417 ],
    // 119 terms retained
];

KMG.VSOPTerms.mars_R2 = [
    [ 0.00044242249, 0.47930604954, 3340.6124267 ],
    [ 8.138042e-05, 0.86998389204, 6681.2248534 ],
    [ 1.274915e-05, 1.22593985222, 10021.8372801 ],
    [ 1.87388e-06, 1.57298976045, 13362.4497068 ],
    [ 4.0745e-07, 1.97082077028, 3344.13554505 ],
    [ 5.2395e-07, 3.14159265359, 0 ],
    [ 2.6617e-07, 1.91665337822, 16703.0621335 ],
    [ 1.7828e-07, 4.43491476419, 2281.23049651 ],
    [ 1.1713e-07, 4.52509926559, 3185.19202727 ],
    [ 1.021e-07, 5.3914732206, 1059.38193019 ],
    [ 9.95e-08, 0.41865678448, 796.298006816 ],
    [ 9.236e-08, 4.53559625376, 2146.16541648 ],
    [ 7.299e-08, 3.1421451312, 2544.31441988 ],
    [ 7.214e-08, 2.29302335628, 6684.74797175 ],
    [ 6.81e-08, 5.26707245601, 155.420399434 ],
    [ 6.526e-08, 2.307724561, 3738.76143011 ],
    [ 7.783e-08, 5.93373461009, 1748.01641307 ],
    [ 5.84e-08, 1.0519182029, 1349.86740966 ],
    [ 6.75e-08, 5.30191763402, 1194.44701022 ],
    [ 4.695e-08, 0.76881032874, 3097.88382273 ],
    [ 5.39e-08, 1.0020006836, 3149.16416059 ],
    [ 4.406e-08, 2.45557331437, 951.718406251 ],
    [ 4.286e-08, 3.89642578846, 1592.59601363 ],
    [ 3.516e-08, 1.84991934524, 398.149003408 ],
    [ 3.699e-08, 2.26016989021, 20043.6745602 ],
    [ 3.378e-08, 3.81703201748, 1751.53953142 ],
    [ 4.585e-08, 0.80785643853, 4136.91043352 ],
    [ 3.201e-08, 2.11661594157, 5614.72937621 ],
    [ 3.62e-08, 1.32428600053, 3333.4988797 ],
    [ 2.915e-08, 1.19342490174, 529.690965095 ],
    [ 2.979e-08, 2.86468474914, 6151.5338883 ],
    [ 3.057e-08, 4.55288594507, 5628.95647021 ],
    [ 2.906e-08, 1.20300479533, 3894.18182954 ],
    [ 3.848e-08, 3.86071515455, 553.569402842 ],
    [ 2.819e-08, 2.48714583532, 1990.74501704 ],
    [ 2.657e-08, 6.07409846258, 4292.33083295 ],
    [ 2.698e-08, 2.92100135189, 3496.03282613 ],
    [ 2.396e-08, 5.94193484091, 2787.04302386 ],
    [ 2.263e-08, 2.56188049651, 191.448266112 ],
    [ 2.169e-08, 5.36834559071, 8962.45534991 ],
    [ 2.149e-08, 2.74919289456, 242.728603974 ],
    [ 2.218e-08, 1.85260509629, 3337.08930835 ],
    [ 1.998e-08, 5.76396921426, 3341.59274777 ],
    [ 1.999e-08, 3.82347205028, 2914.01423582 ],
    [ 1.835e-08, 5.68648448195, 1589.07289528 ],
    [ 1.81e-08, 3.32122811143, 5088.62883977 ],
    [ 1.968e-08, 4.17404480033, 3340.59517305 ],
    [ 2.411e-08, 4.68376177281, 4690.47983636 ],
    [ 1.967e-08, 6.2057036343, 3340.62968035 ],
    [ 1.626e-08, 5.67648778513, 4535.05943692 ],
    [ 2.161e-08, 1.07446445419, 2388.89402045 ],
    [ 1.965e-08, 3.10811453974, 3583.34103067 ],
    [ 1.985e-08, 5.75867975763, 4399.99435689 ],
    [ 1.504e-08, 4.95929390466, 382.896532223 ],
    [ 1.276e-08, 4.82147500391, 2957.71589448 ],
    [ 1.475e-08, 2.22614544794, 3723.50895892 ],
    [ 1.196e-08, 3.26743061042, 9492.146315 ],
    [ 1.349e-08, 4.87558985925, 6525.80445397 ],
    [ 1.436e-08, 2.6975402327, 7079.37385681 ],
    [ 1.223e-08, 2.61880227353, 10025.3603984 ],
    [ 1.402e-08, 5.19177439326, 2700.71514039 ],
    [ 1.202e-08, 0.93436294282, 2810.92146161 ],
    [ 8.7e-09, 5.81258009514, 12303.0677766 ],
    [ 8.67e-09, 2.20048756217, 2699.73481932 ],
    [ 8.31e-09, 2.01782919511, 5092.15195812 ],
    [ 8.56e-09, 5.96129932558, 426.598190876 ],
    [ 8.47e-09, 2.26415579047, 6283.07584999 ],
    [ 9.17e-09, 1.4025908126, 6489.77658729 ],
    [ 8.33e-09, 1.17376008822, 7477.52286022 ],
    [ 1.041e-08, 6.27097603149, 3347.7259737 ],
    [ 9.65e-09, 3.40293030184, 5621.84292321 ],
    [ 7.23e-09, 4.26276570887, 4933.20844033 ],
    [ 7.7e-09, 2.06490049164, 5486.77784318 ],
    [ 7.06e-09, 2.34080074294, 7.1135470008 ],
    [ 9.54e-09, 2.11093711712, 3870.30339179 ],
    [ 8.44e-09, 2.2379157639, 3553.91152214 ],
    [ 6.47e-09, 2.24565892529, 3340.5451164 ],
    [ 6.53e-09, 3.98464883505, 6677.70173505 ],
    [ 7.17e-09, 0.29523050971, 6681.24210705 ],
    [ 8.28e-09, 0.22887694811, 3532.06069281 ],
    [ 6.12e-09, 1.56040446304, 7234.79425624 ],
    [ 7.17e-09, 4.54583138124, 6681.20759975 ],
    [ 5.85e-09, 3.29614213819, 1221.84856632 ],
    [ 6.46e-09, 1.8361516834, 3340.679737 ],
    [ 5.6e-09, 5.05995427063, 8031.09226306 ],
    [ 6.51e-09, 0.16211451692, 7632.94325965 ],
    // 86 terms retained
];

KMG.VSOPTerms.mars_R3 = [
    [ 1.113108e-05, 5.14987305093, 3340.6124267 ],
    [ 4.24447e-06, 5.61343952053, 6681.2248534 ],
    [ 1.00044e-06, 5.99727457548, 10021.8372801 ],
    [ 1.9606e-07, 0.07631453783, 13362.4497068 ],
    [ 3.478e-08, 0.42912010211, 16703.0621335 ],
    [ 4.693e-08, 3.14159265359, 0 ],
    [ 2.87e-08, 0.44692002393, 3344.13554505 ],
    [ 2.428e-08, 3.02114808809, 3185.19202727 ],
    // 8 terms retained
];

KMG.VSOPTerms.mars_R4 = [
    [ 1.9551e-07, 3.58210746512, 3340.6124267 ],
    [ 1.6322e-07, 4.05115851142, 6681.2248534 ],
    [ 5.848e-08, 4.4638164658, 10021.8372801 ],
    [ 1.533e-08, 4.84332951095, 13362.4497068 ],
    [ 3.75e-09, 1.50951652931, 3185.19202727 ],
    [ 3.4e-09, 5.20519444932, 16703.0621335 ],
    // 6 terms retained
];

KMG.VSOPTerms.mars_R5 = [
    [ 4.75e-09, 2.47621038205, 6681.2248534 ],
    [ 2.7e-09, 2.90961348988, 10021.8372801 ],
    // 2 terms retained
];



KMG.VSOPSeries.mars_L = [
	KMG.VSOPTerms.mars_L0,
	KMG.VSOPTerms.mars_L1,
	KMG.VSOPTerms.mars_L2,
	KMG.VSOPTerms.mars_L3,
	KMG.VSOPTerms.mars_L4,
	KMG.VSOPTerms.mars_L5
];


KMG.VSOPSeries.mars_B = [
	KMG.VSOPTerms.mars_B0,
	KMG.VSOPTerms.mars_B1,
	KMG.VSOPTerms.mars_B2,
	KMG.VSOPTerms.mars_B3,
	KMG.VSOPTerms.mars_B4,
	KMG.VSOPTerms.mars_B5
];

KMG.VSOPSeries.mars_R = [
	KMG.VSOPTerms.mars_R0,
	KMG.VSOPTerms.mars_R1,
	KMG.VSOPTerms.mars_R2,
	KMG.VSOPTerms.mars_R3,
	KMG.VSOPTerms.mars_R4,
	KMG.VSOPTerms.mars_R5
];



















KMG.VSOP87Orbit = function(L, B, R, period) {
	
	
	function line(A, B, C, t) {
		return A * Math.cos(B + C * t);
	}
	
	function sum(series, t) {
		var t = 0;
		
		for (var i = 0; i < series.length; i++) {
			t += line(series[i][0], series[i][1], series[i][2], t);
		}
		return t;
	}
	
	function evaluate(terms, t) {
		var v = 0;
		
		var T = 1;
		for (var i = 0; i < terms.length; i++) {
			v += sum(terms[i], t) * T;
            T = t * T;
		}
		
		return v;
	}
	
	function longitude(t) {
		var l = evaluate(L, t);
		return l;
	}
	
	function latitude(t) {
		var b = evaluate(B, t);
		return b;
	}
	
	function radius(t) {
		var r = evaluate(R, t);
		return r;
	}
	
	function positionAtTime(jd) {
		var t = (jd - 2451545) / 365250;
		
		var l = longitude(t);
		var b = latitude(t);
		var r = radius(t);
		
		b -= Math.PI / 2;
        l += Math.PI;
		
		var x = Math.cos(l) * Math.sin(b) * r;
		var y = Math.cos(b) * r;
		var z = -Math.sin(l) * Math.sin(b) * r;

		var position = new THREE.Vector3(x, y, z);
		position.l = l;
		position.b = b;
		position.r = r;
		return position;
	}
	
	return {
		positionAtTime : positionAtTime,
		period : period,
		epoch : KMG.Util.julianNow()
	};
	
};
KMG.VSOP87Orbit.prototype = Object.create( KMG.Orbit.prototype );


/* File: CustomOrbits.js */

// CustomOrbits.js
// Largely influenced by Celestia
//    - astro.cpp
//    - customorbit.cpp

KMG.OrbitUtil = {};

KMG.OrbitUtil.anomaly = function(meanAnomaly, eccentricity)
{
    var e, delta, err;
    var tol = 0.00000001745;
    var iterations = 20;	// limit while() to maximum of 20 iterations.

    e = meanAnomaly - 2 * Math.PI *  Math.floor(meanAnomaly / (2*Math.PI));
    err = 1;
    while(Math.abs(err) > tol && iterations > 0)
    {
        err = e - eccentricity*Math.sin(e) - meanAnomaly;
        delta = err / (1 - eccentricity * Math.cos(e));
        e -= delta;
        iterations--;
    }

    var trueAnomaly = 2*Math.atan(Math.sqrt((1+eccentricity)/(1-eccentricity))*Math.tan(e/2));
    var eccentricAnomaly = e;
    
    
    return {
		trueAnomaly : trueAnomaly,
		eccentricAnomaly : eccentricAnomaly
	};
};

/**
 * Returns value in radians
 */
KMG.OrbitUtil.meanAnomalySun = function(t)
{
    var t2, a, b;

	t2 = t*  t;
	a = 9.999736042e1 * t;
	b = 360 * (a - Math.floor(a));

    return (3.5847583e2 - (1.5e-4 + 3.3e-6*t)*t2 + b) * KMG.PI_BY_180;
};












KMG.CustomEarthOrbit = function()
{
	KMG.Orbit.call( this );
	
	var vsop87Earth = new KMG.VSOP87Orbit(KMG.VSOPSeries.earth_L, KMG.VSOPSeries.earth_B, KMG.VSOPSeries.earth_R, 365.25);

	function positionAtTime(jd) {
		return vsop87Earth.positionAtTime(jd);
	}
	
	function distanceAtTime(jd) {
		var pos = positionAtTime(jd);
		return pos.r;
	}
	
	return {
		positionAtTime : positionAtTime,
		distanceAtTime : distanceAtTime,
		period : 365.25,
		epoch : KMG.Util.julianNow()
	};
};
KMG.CustomEarthOrbit.prototype = Object.create( KMG.Orbit.prototype );



KMG.CustomMoonOrbit = function()
{
	KMG.Orbit.call( this );
	
	var moonCalc = new KMG.MoonCalc();
	var context = {};
	
	function julianDayToCenturies(jd) {
		 // Julian Centuries since Epoch JD2000.0
		return (jd - 2451545) / 36525;
	}
	
	function meanAnomalyAtTime(t) {
		var pos = moonCalc.positionOfTheMoon(t, context);
		return (pos.M_ * (Math.PI / 180));
	}
	
	function velocityAtTime(t) {
		
	}
	
	function distanceAtTime(jd) {
		var t = julianDayToCenturies(jd);
		var pos = moonCalc.positionOfTheMoon(t, context);
		return pos.Î” / 149597870.700;
	}
	
	function positionAtTime(jd) {
		var t = julianDayToCenturies(jd);
		var pos = moonCalc.positionOfTheMoon(t, context);
		var distance = distanceAtTime(jd);
		
		var l = pos.Î» * KMG.PI_BY_180;
		var b = pos.Î² * KMG.PI_BY_180;
		
		var x = distance * Math.cos(b) * Math.cos(l);
		var y = distance * Math.cos(b) * Math.sin(l);
		var z = distance * Math.sin(b);

		return new THREE.Vector3(x, z, -y);
	}
	

	
	return {
		meanAnomalyAtTime : meanAnomalyAtTime,
		velocityAtTime : velocityAtTime,
		positionAtTime : positionAtTime,
		distanceAtTime : distanceAtTime,
		period : 2.701616162713348E+01,
		epoch : KMG.Util.julianNow()
	};
	
};
KMG.CustomMoonOrbit.prototype = Object.create( KMG.Orbit.prototype );



KMG.CustomMarsOrbit = function()
{
	KMG.Orbit.call( this );
	
	var vsop87 = new KMG.VSOP87Orbit(KMG.VSOPSeries.mars_L, KMG.VSOPSeries.mars_B, KMG.VSOPSeries.mars_R, 689.998725);

	function positionAtTime(jd) {
		return vsop87.positionAtTime(jd);
	}
	
	function distanceAtTime(jd) {
		var pos = positionAtTime(jd);
		return pos.r;
	}
	
	return {
		positionAtTime : positionAtTime,
		distanceAtTime : distanceAtTime,
		period : 689.998725,
		epoch : KMG.Util.julianNow()
	};
};
KMG.CustomMarsOrbit.prototype = Object.create( KMG.Orbit.prototype );





KMG.Jupiter = {};
KMG.Jupiter.radius = 71398.0;

KMG.Jupiter.computeElements = function(t) {
	
	var l1 = 106.07719 + 203.488955790 * t;
	var l2 = 175.73161 + 101.374724735 * t;
	var l3 = 120.55883 + 50.317609207 * t;
	var l4 = 84.44459 + 21.571071177 * t;
	
	var p1 = 97.0881 + 0.16138586 * t;
	var p2 = 154.8663 + 0.04726307 * t;
	var p3 = 188.1840 + 0.00712734 * t;
	var p4 = 335.2868 + 0.00184000 * t;
	
	var w1 = 312.3346 - 0.13279386 * t;
	var w2 = 100.4411 - 0.03263064 * t;
	var w3 = 119.1942 - 0.00717703 * t;
	var w4 = 322.6186 - 0.00175934 * t;
	
	// Principle inequality in the longitude of Jupiter
	var Î“ = 0.33033 * KMG.Math.dsin(163.679 + 0.0010512 * t) + 0.03439 * KMG.Math.dsin(34.486 - 0.0161731 * t);
	
	// Phase of free libration
	var Î¦ = 199.6766 + 0.17379190 * t;
	
	// Longitude of the node of the equator of Jupiter on the ecliptic
	var Î¨ = 316.5182 - 0.00000208 * t;
	
	// Mean anomalies of Jupiter and Saturn
	var G = 30.23756 + 0.0830925701 * t + Î“;
	var G_ = 31.97853 + 0.0334597339 * t;
	
	// Longitude of the perihelion of Jupiter
	var Î  = 13.469942;
	
	return {
		l1 : l1,
		l2 : l2,
		l3 : l3,
		l4 : l4,
		
		p1 : p1,
		p2 : p2,
		p3 : p3,
		p4 : p4,
		
		w1 : w1,
		w2 : w2,
		w3 : w3,
		w4 : w4,
		
		Î“ : Î“,
		Î¦ : Î¦,
		Î¨ : Î¨,
		G : G,
		G_ : G_,
		Î  : Î 
		
	};
	
	
};




KMG.CustomIoOrbit = function() {
	KMG.Orbit.call( this );
	
	function distanceAtTime(jd) {
		var pos = positionAtTime(jd);
		return pos.r;
	}
	
	function degToRad(v) {
		return v * KMG.PI_BY_180;
	}
	
	function positionAtTime(jd) {
		//var t = (jd - 2451545) / 36525;
		var t = jd - 2443000.5;
		//var t = (jd - 2443000.5) / 36525;
		var e = KMG.Jupiter.computeElements(t);
		
		var LPEJ = e.Î ;
		
		// Calculate periodic terms for longitude
		var Î£1 = 0.47259*KMG.Math.dsin(2*(e.l1 - e.l2)) - 0.03478*KMG.Math.dsin(e.p3 - e.p4)
				+ 0.01081*KMG.Math.dsin(e.l2 - 2*e.l3 + e.p3) + 7.38e-3*KMG.Math.dsin(e.Î¦)
				+ 7.13e-3*KMG.Math.dsin(e.l2 - 2*e.l3 + e.p2) - 6.74e-3*KMG.Math.dsin(e.p1 + e.p3 - 2*LPEJ - 2*e.G)
				+ 6.66e-3*KMG.Math.dsin(e.l2 - 2*e.l3 + e.p4) + 4.45e-3*KMG.Math.dsin(e.l1 - e.p3)
				- 3.54e-3*KMG.Math.dsin(e.l1 - e.l2) - 3.17e-3*KMG.Math.dsin(2*(e.Î¨ - LPEJ))
				+ 2.65e-3*KMG.Math.dsin(e.l1 - e.p4) - 1.86e-3*KMG.Math.dsin(e.G)
				+ 1.62e-3*KMG.Math.dsin(e.p2 - e.p3) + 1.58e-3*KMG.Math.dsin(4*(e.l1 - e.l2))
				- 1.55e-3*KMG.Math.dsin(e.l1 - e.l3) - 1.38e-3*KMG.Math.dsin(e.Î¨ + e.w3 - 2*LPEJ - 2*e.G)
				- 1.15e-3*KMG.Math.dsin(2*(e.l1 - 2*e.l2 + e.w2)) + 8.9e-4*KMG.Math.dsin(e.p2 - e.p4)
				+ 8.5e-4*KMG.Math.dsin(e.l1 + e.p3 - 2*LPEJ - 2*e.G) + 8.3e-4*KMG.Math.dsin(e.w2 - e.w3)
				+ 5.3e-4*KMG.Math.dsin(e.Î¨ - e.w2);
		Î£1 = KMG.Math.clamp(Î£1, 360.0);
		//Î£1 = degToRad(Î£1);
		var L = e.l1 + Î£1;

		// Calculate periodic terms for the tangent of the latitude
		var B = 6.393e-4*KMG.Math.dsin(L - e.w1) + 1.825e-4*KMG.Math.dsin(L - e.w2)
			+ 3.29e-5*KMG.Math.dsin(L - e.w3) - 3.11e-5*KMG.Math.dsin(L - e.Î¨)
			+ 9.3e-6*KMG.Math.dsin(L - e.w4) + 7.5e-6*KMG.Math.dsin(3*L - 4*e.l2 - 1.9927*Î£1 + e.w2)
			+ 4.6e-6*KMG.Math.dsin(L + e.Î¨ - 2*LPEJ - 2*e.G);
		B = KMG.Math.datan(B);

		// Calculate the periodic terms for distance
		var R = -4.1339e-3*KMG.Math.dcos(2*(e.l1 - e.l2)) - 3.87e-5*KMG.Math.dcos(e.l1 - e.p3)
		  - 2.14e-5*KMG.Math.dcos(e.l1 - e.p4) + 1.7e-5*KMG.Math.dcos(e.l1 - e.l2)
		  - 1.31e-5*KMG.Math.dcos(4*(e.l1 - e.l2)) + 1.06e-5*KMG.Math.dcos(e.l1 - e.l3)
		  - 6.6e-6*KMG.Math.dcos(e.l1 + e.p3 - 2*LPEJ - 2*e.G);
		R = 5.90569 * KMG.Jupiter.radius * (1 + R) / KMG.AU_TO_KM;

		var T = (jd - 2433282.423) / 36525.0;
		var P = 1.3966626*T + 3.088e-4*T*T;
		L += P;

		//L += 22.203;
	
		
		L = L * KMG.PI_BY_180;
		B = B * KMG.PI_BY_180;
		
		B -= Math.PI / 2;
        L += Math.PI;
		
		var x = Math.cos(L) * Math.sin(B) * R;
		var y = Math.cos(B) * R;
		var z = -Math.sin(L) * Math.sin(B) * R;

		var position = new THREE.Vector3(x, y, z);
		position.l = L;
		position.b = B;
		position.r = R;
		return position;
	}
	

	
	return {
		positionAtTime : positionAtTime,
		distanceAtTime : distanceAtTime,
		period : 1.769138,
		epoch : KMG.Util.julianNow()
	};
	
};
KMG.CustomIoOrbit.prototype = Object.create( KMG.Orbit.prototype );



KMG.CustomEuropaOrbit = function() {
	KMG.Orbit.call( this );
	
	function distanceAtTime(jd) {
		var pos = positionAtTime(jd);
		return pos.r;
	}
	
	function degToRad(v) {
		return v * KMG.PI_BY_180;
	}
	
	function positionAtTime(jd) {
		//var t = (jd - 2451545) / 36525;
		var t = (jd - 2443000.5);// / 36525;
		var e = KMG.Jupiter.computeElements(t);
		
		var LPEJ = e.Î ;
		
		
		// Calculate periodic terms for lone.Gitude
		var Î£1 = 1.06476*KMG.Math.dsin(2*(e.l2 - e.l3)) + 0.04256*KMG.Math.dsin(e.l1 - 2*e.l2 + e.p3)
			  + 0.03581*KMG.Math.dsin(e.l2 - e.p3) + 0.02395*KMG.Math.dsin(e.l1 - 2*e.l2 + e.p4)
			  + 0.01984*KMG.Math.dsin(e.l2 - e.p4) - 0.01778*KMG.Math.dsin(e.Î¦)
			  + 0.01654*KMG.Math.dsin(e.l2 - e.p2) + 0.01334*KMG.Math.dsin(e.l2 - 2*e.l3 + e.p2)
			  + 0.01294*KMG.Math.dsin(e.p3 - e.p4) - 0.01142*KMG.Math.dsin(e.l2 - e.l3)
			  - 0.01057*KMG.Math.dsin(e.G) - 7.75e-3*KMG.Math.dsin(2*(e.Î¨ - LPEJ))
			  + 5.24e-3*KMG.Math.dsin(2*(e.l1 - e.l2)) - 4.6e-3*KMG.Math.dsin(e.l1 - e.l3)
			  + 3.16e-3*KMG.Math.dsin(e.Î¨ - 2*e.G + e.w3 - 2*LPEJ) - 2.03e-3*KMG.Math.dsin(e.p1 + e.p3 - 2*LPEJ - 2*e.G)
			  + 1.46e-3*KMG.Math.dsin(e.Î¨ - e.w3) - 1.45e-3*KMG.Math.dsin(2*e.G)
			  + 1.25e-3*KMG.Math.dsin(e.Î¨ - e.w4) - 1.15e-3*KMG.Math.dsin(e.l1 - 2*e.l3 + e.p3)
			  - 9.4e-4*KMG.Math.dsin(2*(e.l2 - e.w2)) + 8.6e-4*KMG.Math.dsin(2*(e.l1 - 2*e.l2 + e.w2))
			  - 8.6e-4*KMG.Math.dsin(5*e.G_ - 2*e.G + 0.9115) - 7.8e-4*KMG.Math.dsin(e.l2 - e.l4)
			  - 6.4e-4*KMG.Math.dsin(3*e.l3 - 7*e.l4 + 4*e.p4) + 6.4e-4*KMG.Math.dsin(e.p1 - e.p4)
			  - 6.3e-4*KMG.Math.dsin(e.l1 - 2*e.l3 + e.p4) + 5.8e-4*KMG.Math.dsin(e.w3 - e.w4)
			  + 5.6e-4*KMG.Math.dsin(2*(e.Î¨ - LPEJ - e.G)) + 5.6e-4*KMG.Math.dsin(2*(e.l2 - e.l4))
			  + 5.5e-4*KMG.Math.dsin(2*(e.l1 - e.l3)) + 5.2e-4*KMG.Math.dsin(3*e.l3 - 7*e.l4 + e.p3 +3*e.p4)
			  - 4.3e-4*KMG.Math.dsin(e.l1 - e.p3) + 4.1e-4*KMG.Math.dsin(5*(e.l2 - e.l3))
			  + 4.1e-4*KMG.Math.dsin(e.p4 - LPEJ) + 3.2e-4*KMG.Math.dsin(e.w2 - e.w3)
			  + 3.2e-4*KMG.Math.dsin(2*(e.l3 - e.G - LPEJ));
		Î£1 = KMG.Math.clamp(Î£1, 360.0);
		//Î£1 = dee.GToRad(Î£1);
		var L = e.l2 + Î£1;

		// Calculate periodic terms for the tane.Gent of the latitude
		var B = 8.1004e-3*KMG.Math.dsin(L - e.w2) + 4.512e-4*KMG.Math.dsin(L - e.w3)
		  - 3.284e-4*KMG.Math.dsin(L - e.Î¨) + 1.160e-4*KMG.Math.dsin(L - e.w4)
		  + 2.72e-5*KMG.Math.dsin(e.l1 - 2*e.l3 + 1.0146*Î£1 + e.w2) - 1.44e-5*KMG.Math.dsin(L - e.w1)
		  + 1.43e-5*KMG.Math.dsin(L + e.Î¨ - 2*LPEJ - 2*e.G) + 3.5e-6*KMG.Math.dsin(L - e.Î¨ + e.G)
		  - 2.8e-6*KMG.Math.dsin(e.l1 - 2*e.l3 + 1.0146*Î£1 + e.w3);
		B = KMG.Math.datan(B);

		// Calculate the periodic terms for distance
		R = 9.3848e-3*KMG.Math.dcos(e.l1 - e.l2) - 3.116e-4*KMG.Math.dcos(e.l2 - e.p3)
		  - 1.744e-4*KMG.Math.dcos(e.l2 - e.p4) - 1.442e-4*KMG.Math.dcos(e.l2 - e.p2)
		  + 5.53e-5*KMG.Math.dcos(e.l2 - e.l3) + 5.23e-5*KMG.Math.dcos(e.l1 - e.l3)
		  - 2.9e-5*KMG.Math.dcos(2*(e.l1 - e.l2)) + 1.64e-5*KMG.Math.dcos(2*(e.l2 - e.w2))
		  + 1.07e-5*KMG.Math.dcos(e.l1 - 2*e.l3 + e.p3) - 1.02e-5*KMG.Math.dcos(e.l2 - e.p1)
		  - 9.1e-6*KMG.Math.dcos(2*(e.l1 - e.l3));
		R = 9.39657 * KMG.Jupiter.radius * (1 + R) / KMG.AU_TO_KM;

		T = (jd - 2433282.423) / 36525.0;
		P = 1.3966626*T + 3.088e-4*T*T;
		L += P;
		//L += dee.GToRad(P);
		//L += 22.203;
		
		
		//console.info([L, B, R]);
		
		L = L * KMG.PI_BY_180;
		B = B * KMG.PI_BY_180;
		
		B -= Math.PI / 2;
        L += Math.PI;
                   
		var x = Math.cos(L) * Math.sin(B) * R;
		var y = Math.cos(B) * R;
		var z = -Math.sin(L) * Math.sin(B) * R;

		var position = new THREE.Vector3(x, y, z);
		position.l = L;
		position.b = B;
		position.r = R;
		return position;
	};
	
	return {
		positionAtTime : positionAtTime,
		distanceAtTime : distanceAtTime,
		period : 3.5511810791,
		epoch : KMG.Util.julianNow()
	};
	
	
};
KMG.CustomEuropaOrbit.prototype = Object.create( KMG.Orbit.prototype );





KMG.CustomGanymedeOrbit = function() {
	KMG.Orbit.call( this );
	
	function distanceAtTime(jd) {
		var pos = positionAtTime(jd);
		return pos.r;
	}
	
	function degToRad(v) {
		return v * KMG.PI_BY_180;
	}
	
	function positionAtTime(jd) {
		//var t = (jd - 2451545) / 36525;
		var t = (jd - 2443000.5);// / 36525;
		var e = KMG.Jupiter.computeElements(t);
		
		var LPEJ = e.Î ;
		var psi = e.Î¨;
		var phi = e.Î¦;

		  
		  
		//Calculate periodic terms for lone.Gitude
		var Î£1 = 0.1649*KMG.Math.dsin(e.l3 - e.p3) + 0.09081*KMG.Math.dsin(e.l3 - e.p4)
			  - 0.06907*KMG.Math.dsin(e.l2 - e.l3) + 0.03784*KMG.Math.dsin(e.p3 - e.p4)
			  + 0.01846*KMG.Math.dsin(2*(e.l3 - e.l4)) - 0.01340*KMG.Math.dsin(e.G)
			  - 0.01014*KMG.Math.dsin(2*(psi - LPEJ)) + 7.04e-3*KMG.Math.dsin(e.l2 - 2*e.l3 + e.p3)
			  - 6.2e-3*KMG.Math.dsin(e.l2 - 2*e.l3 + e.p2) - 5.41e-3*KMG.Math.dsin(e.l3 - e.l4)
			  + 3.81e-3*KMG.Math.dsin(e.l2 - 2*e.l3 + e.p4) + 2.35e-3*KMG.Math.dsin(psi - e.w3)
			  + 1.98e-3*KMG.Math.dsin(psi - e.w4) + 1.76e-3*KMG.Math.dsin(phi)
			  + 1.3e-3*KMG.Math.dsin(3*(e.l3 - e.l4)) + 1.25e-3*KMG.Math.dsin(e.l1 - e.l3)
			  - 1.19e-3*KMG.Math.dsin(5*e.G_ - 2*e.G + 0.9115) + 1.09e-3*KMG.Math.dsin(e.l1 - e.l2)
			  - 1.0e-3*KMG.Math.dsin(3*e.l3 - 7*e.l4 + 4*e.p4) + 9.1e-4*KMG.Math.dsin(e.w3 - e.w4)
			  + 8.0e-4*KMG.Math.dsin(3*e.l3 - 7*e.l4 + e.p3 + 3*e.p4) - 7.5e-4*KMG.Math.dsin(2*e.l2 - 3*e.l3 + e.p3)
			  + 7.2e-4*KMG.Math.dsin(e.p1 + e.p3 - 2*LPEJ - 2*e.G) + 6.9e-4*KMG.Math.dsin(e.p4 - LPEJ)
			  - 5.8e-4*KMG.Math.dsin(2*e.l3 - 3*e.l4 + e.p4) - 5.7e-4*KMG.Math.dsin(e.l3 - 2*e.l4 + e.p4)
			  + 5.6e-4*KMG.Math.dsin(e.l3 + e.p3 - 2*LPEJ - 2*e.G) - 5.2e-4*KMG.Math.dsin(e.l2 - 2*e.l3 + e.p1)
			  - 5.0e-4*KMG.Math.dsin(e.p2 - e.p3) + 4.8e-4*KMG.Math.dsin(e.l3 - 2*e.l4 + e.p3)
			  - 4.5e-4*KMG.Math.dsin(2*e.l2 - 3*e.l3 + e.p4) - 4.1e-4*KMG.Math.dsin(e.p2 - e.p4)
			  - 3.8e-4*KMG.Math.dsin(2*e.G) - 3.7e-4*KMG.Math.dsin(e.p3 - e.p4 + e.w3 - e.w4)
			  - 3.2e-4*KMG.Math.dsin(3*e.l3 - 7*e.l4 + 2*e.p3 + 2*e.p4) + 3.0e-4*KMG.Math.dsin(4*(e.l3 - e.l4))
			  + 2.9e-4*KMG.Math.dsin(e.l3 + e.p4 - 2*LPEJ - 2*e.G) - 2.8e-4*KMG.Math.dsin(e.w3 + psi - 2*LPEJ - 2*e.G)
			  + 2.6e-4*KMG.Math.dsin(e.l3 - LPEJ - e.G) + 2.4e-4*KMG.Math.dsin(e.l2 - 3*e.l3 + 2*e.l4)
			  + 2.1e-4*KMG.Math.dsin(2*(e.l3 - LPEJ - e.G)) - 2.1e-4*KMG.Math.dsin(e.l3 - e.p2)
			  + 1.7e-4*KMG.Math.dsin(e.l3 - e.p3);
		Î£1 = KMG.Math.clamp(Î£1, 360.0);
		//sie.Gma = dee.GToRad(sie.Gma);
		var L = e.l3 + Î£1;

		//Calculate periodic terms for the tane.Gent of the latitude
		var B = 3.2402e-3*KMG.Math.dsin(L - e.w3) - 1.6911e-3*KMG.Math.dsin(L - psi)
		  + 6.847e-4*KMG.Math.dsin(L - e.w4) - 2.797e-4*KMG.Math.dsin(L - e.w2)
		  + 3.21e-5*KMG.Math.dsin(L + psi - 2*LPEJ - 2*e.G) + 5.1e-6*KMG.Math.dsin(L - psi + e.G)
		  - 4.5e-6*KMG.Math.dsin(L - psi - e.G) - 4.5e-6*KMG.Math.dsin(L + psi - 2*LPEJ)
		  + 3.7e-6*KMG.Math.dsin(L + psi - 2*LPEJ - 3*e.G) + 3.0e-6*KMG.Math.dsin(2*e.l2 - 3*L + 4.03*Î£1 + e.w2)
		  - 2.1e-6*KMG.Math.dsin(2*e.l2 - 3*L + 4.03*Î£1 + e.w3);
		B = KMG.Math.datan(B);

		//Calculate the periodic terms for distance
		var R = -1.4388e-3*KMG.Math.dcos(e.l3 - e.p3) - 7.919e-4*KMG.Math.dcos(e.l3 - e.p4)
		  + 6.342e-4*KMG.Math.dcos(e.l2 - e.l3) - 1.761e-4*KMG.Math.dcos(2*(e.l3 - e.l4))
		  + 2.94e-5*KMG.Math.dcos(e.l3 - e.l4) - 1.56e-5*KMG.Math.dcos(3*(e.l3 - e.l4))
		  + 1.56e-5*KMG.Math.dcos(e.l1 - e.l3) - 1.53e-5*KMG.Math.dcos(e.l1 - e.l2)
		  + 7.0e-6*KMG.Math.dcos(2*e.l2 - 3*e.l3 + e.p3) - 5.1e-6*KMG.Math.dcos(e.l3 + e.p3 - 2*LPEJ - 2*e.G);
		R = 14.98832 * KMG.Jupiter.radius * (1 + R) / KMG.AU_TO_KM;
		
		var T = (jd - 2433282.423) / 36525.0;
		var P = 1.3966626*T + 3.088e-4*T*T;
		L += P;
		//L += dee.GToRad(P);

		//L += JupAscendingNode;
		  
		
		//console.info([L, B, R]);
		
		L = L * KMG.PI_BY_180;
		B = B * KMG.PI_BY_180;
		
		B -= Math.PI / 2;
        L += Math.PI;
                   
		var x = Math.cos(L) * Math.sin(B) * R;
		var y = Math.cos(B) * R;
		var z = -Math.sin(L) * Math.sin(B) * R;

		var position = new THREE.Vector3(x, y, z);
		position.l = L;
		position.b = B;
		position.r = R;
		return position;
	};
	
	return {
		positionAtTime : positionAtTime,
		distanceAtTime : distanceAtTime,
		period : 3.5511810791,
		epoch : KMG.Util.julianNow()
	};
	
	
};
KMG.CustomGanymedeOrbit.prototype = Object.create( KMG.Orbit.prototype );




KMG.CustomCallistoOrbit = function() {
	KMG.Orbit.call( this );
	
	function distanceAtTime(jd) {
		var pos = positionAtTime(jd);
		return pos.r;
	}
	
	function degToRad(v) {
		return v * KMG.PI_BY_180;
	}
	
	function positionAtTime(jd) {
		//var t = (jd - 2451545) / 36525;
		var t = (jd - 2443000.5);// / 36525;
		var e = KMG.Jupiter.computeElements(t);
		
		var LPEJ = e.Î ;
		var psi = e.Î¨;
		var phi = e.Î¦;

		  
		  
		//Calculate periodic terms for lone.Gitude
		var Î£1 =
			0.84287*KMG.Math.dsin(e.l4 - e.p4)
			+ 0.03431*KMG.Math.dsin(e.p4 - e.p3)
			- 0.03305*KMG.Math.dsin(2*(psi - LPEJ))
			- 0.03211*KMG.Math.dsin(e.G)
			- 0.01862*KMG.Math.dsin(e.l4 - e.p3)
			+ 0.01186*KMG.Math.dsin(psi - e.w4)
			+ 6.23e-3*KMG.Math.dsin(e.l4 + e.p4 - 2*e.G - 2*LPEJ)
			+ 3.87e-3*KMG.Math.dsin(2*(e.l4 - e.p4))
			- 2.84e-3*KMG.Math.dsin(5*e.G_ - 2*e.G + 0.9115)
			- 2.34e-3*KMG.Math.dsin(2*(psi - e.p4))
			- 2.23e-3*KMG.Math.dsin(e.l3 - e.l4)
			- 2.08e-3*KMG.Math.dsin(e.l4 - LPEJ)
			+ 1.78e-3*KMG.Math.dsin(psi + e.w4 - 2*e.p4)
			+ 1.34e-3*KMG.Math.dsin(e.p4 - LPEJ)
			+ 1.25e-3*KMG.Math.dsin(2*(e.l4 - e.G - LPEJ))
			- 1.17e-3*KMG.Math.dsin(2*e.G)
			- 1.12e-3*KMG.Math.dsin(2*(e.l3 - e.l4))
			+ 1.07e-3*KMG.Math.dsin(3*e.l3 - 7*e.l4 + 4*e.p4)
			+ 1.02e-3*KMG.Math.dsin(e.l4 - e.G - LPEJ)
			+ 9.6e-4*KMG.Math.dsin(2*e.l4 - psi - e.w4)
			+ 8.7e-4*KMG.Math.dsin(2*(psi - e.w4))
			- 8.5e-4*KMG.Math.dsin(3*e.l3 - 7*e.l4 + e.p3 + 3*e.p4)
			+ 8.5e-4*KMG.Math.dsin(e.l3 - 2*e.l4 + e.p4)
			- 8.1e-4*KMG.Math.dsin(2*(e.l4 - psi))
			+ 7.1e-4*KMG.Math.dsin(e.l4 + e.p4 - 2*LPEJ - 3*e.G)
			+ 6.1e-4*KMG.Math.dsin(e.l1 - e.l4)
			- 5.6e-4*KMG.Math.dsin(psi - e.w3)
			- 5.4e-4*KMG.Math.dsin(e.l3 - 2*e.l4 + e.p3)
			+ 5.1e-4*KMG.Math.dsin(e.l2 - e.l4)
			+ 4.2e-4*KMG.Math.dsin(2*(psi - e.G - LPEJ))
			+ 3.9e-4*KMG.Math.dsin(2*(e.p4 - e.w4))
			+ 3.6e-4*KMG.Math.dsin(psi + LPEJ - e.p4 - e.w4)
			+ 3.5e-4*KMG.Math.dsin(2*e.G_ - e.G + 3.2877)
			- 3.5e-4*KMG.Math.dsin(e.l4 - e.p4 + 2*LPEJ - 2*psi)
			- 3.2e-4*KMG.Math.dsin(e.l4 + e.p4 - 2*LPEJ - e.G)
			+ 3.0e-4*KMG.Math.dsin(2*e.G_ - 2*e.G + 2.6032)
			+ 2.9e-4*KMG.Math.dsin(3*e.l3 - 7*e.l4 + 2*e.p3 + 2*e.p4)
			+ 2.8e-4*KMG.Math.dsin(e.l4 - e.p4 + 2*psi - 2*LPEJ)
			- 2.8e-4*KMG.Math.dsin(2*(e.l4 - e.w4))
			- 2.7e-4*KMG.Math.dsin(e.p3 - e.p4 + e.w3 - e.w4)
			- 2.6e-4*KMG.Math.dsin(5*e.G_ - 3*e.G + 3.2877)
			+ 2.5e-4*KMG.Math.dsin(e.w4 - e.w3)
			- 2.5e-4*KMG.Math.dsin(e.l2 - 3*e.l3 + 2*e.l4)
			- 2.3e-4*KMG.Math.dsin(3*(e.l3 - e.l4))
			+ 2.1e-4*KMG.Math.dsin(2*e.l4 - 2*LPEJ - 3*e.G)
			- 2.1e-4*KMG.Math.dsin(2*e.l3 - 3*e.l4 + e.p4)
			+ 1.9e-4*KMG.Math.dsin(e.l4 - e.p4 - e.G)
			- 1.9e-4*KMG.Math.dsin(2*e.l4 - e.p3 - e.p4)
			- 1.8e-4*KMG.Math.dsin(e.l4 - e.p4 + e.G)
			- 1.6e-4*KMG.Math.dsin(e.l4 + e.p3 - 2*LPEJ - 2*e.G);
		Î£1 = KMG.Math.clamp(Î£1, 360.0);
		//Î£1 = dee.GToRad(Î£1);
		var L = e.l4 + Î£1;

		//Calculate periodic terms for the tane.Gent of the latitude
		var B =
			- 7.6579e-3 * KMG.Math.dsin(L - psi)
			+ 4.4134e-3 * KMG.Math.dsin(L - e.w4)
			- 5.112e-4  * KMG.Math.dsin(L - e.w3)
			+ 7.73e-5   * KMG.Math.dsin(L + psi - 2*LPEJ - 2*e.G)
			+ 1.04e-5   * KMG.Math.dsin(L - psi + e.G)
			- 1.02e-5   * KMG.Math.dsin(L - psi - e.G)
			+ 8.8e-6    * KMG.Math.dsin(L + psi - 2*LPEJ - 3*e.G)
			- 3.8e-6    * KMG.Math.dsin(L + psi - 2*LPEJ - e.G);
		B = KMG.Math.datan(B);

		//Calculate the periodic terms for distance
		var R =
			- 7.3546e-3 * KMG.Math.dcos(e.l4 - e.p4)
			+ 1.621e-4  * KMG.Math.dcos(e.l4 - e.p3)
			+ 9.74e-5   * KMG.Math.dcos(e.l3 - e.l4)
			- 5.43e-5   * KMG.Math.dcos(e.l4 + e.p4 - 2*LPEJ - 2*e.G)
			- 2.71e-5   * KMG.Math.dcos(2*(e.l4 - e.p4))
			+ 1.82e-5   * KMG.Math.dcos(e.l4 - LPEJ)
			+ 1.77e-5   * KMG.Math.dcos(2*(e.l3 - e.l4))
			- 1.67e-5   * KMG.Math.dcos(2*e.l4 - psi - e.w4)
			+ 1.67e-5   * KMG.Math.dcos(psi - e.w4)
			- 1.55e-5   * KMG.Math.dcos(2*(e.l4 - LPEJ - e.G))
			+ 1.42e-5   * KMG.Math.dcos(2*(e.l4 - psi))
			+ 1.05e-5   * KMG.Math.dcos(e.l1 - e.l4)
			+ 9.2e-6    * KMG.Math.dcos(e.l2 - e.l4)
			- 8.9e-6    * KMG.Math.dcos(e.l4 - LPEJ -e.G)
			- 6.2e-6    * KMG.Math.dcos(e.l4 + e.p4 - 2*LPEJ - 3*e.G)
			+ 4.8e-6    * KMG.Math.dcos(2*(e.l4 - e.w4));

		R = 26.36273 * KMG.Jupiter.radius * (1 + R) / KMG.AU_TO_KM;
		T = (jd - 2433282.423) / 36525.0;
		P = 1.3966626*T + 3.088e-4*T*T;
		L += P;
		//L += degToRad(P);

		//L += JupAscendingNode;
		  
		
		//console.info([L, B, R]);
		
		L = L * KMG.PI_BY_180;
		B = B * KMG.PI_BY_180;
		
		B -= Math.PI / 2;
        L += Math.PI;
                   
		var x = Math.cos(L) * Math.sin(B) * R;
		var y = Math.cos(B) * R;
		var z = -Math.sin(L) * Math.sin(B) * R;

		var position = new THREE.Vector3(x, y, z);
		position.l = L;
		position.b = B;
		position.r = R;
		return position;
	};
	
	return {
		positionAtTime : positionAtTime,
		distanceAtTime : distanceAtTime,
		period : 3.5511810791,
		epoch : KMG.Util.julianNow()
	};
	
	
};
KMG.CustomCallistoOrbit.prototype = Object.create( KMG.Orbit.prototype );





KMG.Saturn = {};
KMG.Saturn.radius = 60330.0;
KMG.Saturn.ascendingNode = 168.8112;
KMG.Saturn.tilt = 28.0817;

KMG.Saturn.computeSaturnElements = function(t) {
	
	
};


KMG.Saturn.saturnMoonPosition = function(lam, gam, Om, r) {
	
	
};


KMG.CustomMimasOrbit = function() {
	KMG.Orbit.call( this );
	
	function distanceAtTime(jd) {
		var pos = positionAtTime(jd);
		return pos.r;
	};
	
	
	function positionAtTime(jd) {
		
	};
	
	return {
		positionAtTime : positionAtTime,
		distanceAtTime : distanceAtTime,
		period : 0,
		epoch : KMG.Util.julianNow()
	};
	
	
};
KMG.CustomMimasOrbit.prototype = Object.create( KMG.Orbit.prototype );
	
	

KMG.CustomEnceladusOrbit = function() {
	KMG.Orbit.call( this );
	
	function distanceAtTime(jd) {
		var pos = positionAtTime(jd);
		return pos.r;
	};
	
	
	function positionAtTime(jd) {
		
	};
	
	return {
		positionAtTime : positionAtTime,
		distanceAtTime : distanceAtTime,
		period : 0,
		epoch : KMG.Util.julianNow()
	};
	
	
};
KMG.CustomEnceladusOrbit.prototype = Object.create( KMG.Orbit.prototype );



KMG.CustomTethysOrbit = function() {
	KMG.Orbit.call( this );
	
	function distanceAtTime(jd) {
		var pos = positionAtTime(jd);
		return pos.r;
	};
	
	
	function positionAtTime(jd) {
		
	};
	
	return {
		positionAtTime : positionAtTime,
		distanceAtTime : distanceAtTime,
		period : 0,
		epoch : KMG.Util.julianNow()
	};
	
	
};
KMG.CustomTethysOrbit.prototype = Object.create( KMG.Orbit.prototype );



KMG.CustomDioneOrbit = function() {
	KMG.Orbit.call( this );
	
	function distanceAtTime(jd) {
		var pos = positionAtTime(jd);
		return pos.r;
	};
	
	
	function positionAtTime(jd) {
		
	};
	
	return {
		positionAtTime : positionAtTime,
		distanceAtTime : distanceAtTime,
		period : 0,
		epoch : KMG.Util.julianNow()
	};
	
	
};
KMG.CustomDioneOrbit.prototype = Object.create( KMG.Orbit.prototype );



KMG.CustomRheaOrbit = function() {
	KMG.Orbit.call( this );
	
	function distanceAtTime(jd) {
		var pos = positionAtTime(jd);
		return pos.r;
	};
	
	
	function positionAtTime(jd) {
		
	};
	
	return {
		positionAtTime : positionAtTime,
		distanceAtTime : distanceAtTime,
		period : 0,
		epoch : KMG.Util.julianNow()
	};
	
	
};
KMG.CustomRheaOrbit.prototype = Object.create( KMG.Orbit.prototype );


KMG.CustomTitanOrbit = function() {
	KMG.Orbit.call( this );
	
	function distanceAtTime(jd) {
		var pos = positionAtTime(jd);
		return pos.r;
	};
	
	
	function positionAtTime(jd) {
		
	};
	
	return {
		positionAtTime : positionAtTime,
		distanceAtTime : distanceAtTime,
		period : 15.94544758,
		epoch : KMG.Util.julianNow()
	};
	
	
};
KMG.CustomTitanOrbit.prototype = Object.create( KMG.Orbit.prototype );
	
	
	
	
	

KMG.CustomHyperionOrbit = function() {
	KMG.Orbit.call( this );
	
	function distanceAtTime(jd) {
		var pos = positionAtTime(jd);
		return pos.r;
	};
	
	
	function positionAtTime(jd) {
		
	};
	
	return {
		positionAtTime : positionAtTime,
		distanceAtTime : distanceAtTime,
		period : 0,
		epoch : KMG.Util.julianNow()
	};
	
	
};
KMG.CustomHyperionOrbit.prototype = Object.create( KMG.Orbit.prototype );



KMG.CustomIapetusOrbit = function() {
	KMG.Orbit.call( this );
	
	function distanceAtTime(jd) {
		var pos = positionAtTime(jd);
		return pos.r;
	};
	
	
	function positionAtTime(jd) {
		
	};
	
	return {
		positionAtTime : positionAtTime,
		distanceAtTime : distanceAtTime,
		period : 0,
		epoch : KMG.Util.julianNow()
	};
	
	
};
KMG.CustomIapetusOrbit.prototype = Object.create( KMG.Orbit.prototype );



KMG.CustomPhoebeOrbit = function() {
	KMG.Orbit.call( this );
	
	function distanceAtTime(jd) {
		var pos = positionAtTime(jd);
		return pos.r;
	};
	
	
	function positionAtTime(jd) {
		
	};
	
	return {
		positionAtTime : positionAtTime,
		distanceAtTime : distanceAtTime,
		period : 0,
		epoch : KMG.Util.julianNow()
	};
	
	
};
KMG.CustomPhoebeOrbit.prototype = Object.create( KMG.Orbit.prototype );


	




KMG.CustomOrbits = {};


KMG.CustomOrbits.mercury = function() {
	return new KMG.EllipticalOrbit(KMG.OrbitDefinitions.mercury);
};

KMG.CustomOrbits.venus = function() {
	return new KMG.EllipticalOrbit(KMG.OrbitDefinitions.venus);
};

KMG.CustomOrbits.earth = function() {
	return new KMG.CustomEarthOrbit();
	//return new KMG.EllipticalOrbit(KMG.OrbitDefinitions.earth);
};

KMG.CustomOrbits.moon = function() {
	return new KMG.CustomMoonOrbit();
};

/*
KMG.CustomOrbits.moon = function() {
	return new KMG.EllipticalOrbit(KMG.OrbitDefinitions.moon);
};
*/

KMG.CustomOrbits.mars = function() {
	return new KMG.EllipticalOrbit(KMG.OrbitDefinitions.mars);
};

KMG.CustomOrbits.ceres = function() {
	return new KMG.EllipticalOrbit(KMG.OrbitDefinitions.ceres);
};

KMG.CustomOrbits.vesta = function() {
	return new KMG.EllipticalOrbit(KMG.OrbitDefinitions.vesta);
};

KMG.CustomOrbits.jupiter = function() {
	return new KMG.EllipticalOrbit(KMG.OrbitDefinitions.jupiter);
};

KMG.CustomOrbits.saturn = function() {
	return new KMG.EllipticalOrbit(KMG.OrbitDefinitions.saturn);
};

KMG.CustomOrbits.titan = function() {
	return new KMG.EllipticalOrbit(KMG.OrbitDefinitions.titan);
};

KMG.CustomOrbits.uranus = function() {
	return new KMG.EllipticalOrbit(KMG.OrbitDefinitions.uranus);
};

KMG.CustomOrbits.neptune = function() {
	return new KMG.EllipticalOrbit(KMG.OrbitDefinitions.neptune);
};

KMG.CustomOrbits.pluto = function() {
	return new KMG.EllipticalOrbit(KMG.OrbitDefinitions.pluto);
};

KMG.CustomOrbits.sedna = function() {
	return new KMG.EllipticalOrbit(KMG.OrbitDefinitions.sedna);
};

KMG.CustomOrbits.makemake = function() {
	return new KMG.EllipticalOrbit(KMG.OrbitDefinitions.makemake);
};

KMG.CustomOrbits.haumea = function() {
	return new KMG.EllipticalOrbit(KMG.OrbitDefinitions.haumea);
};

KMG.CustomOrbits.eris = function() {
	return new KMG.EllipticalOrbit(KMG.OrbitDefinitions.eris);
};



/* File: IAURotation.js */


/*
	Î±0 => Right Ascension
	Î´0 => Declination
	W => Meridian
*/


KMG.IAU_SECULAR_TERM_VALID_CENTURIES = 50.0;


KMG.IAURotation = function() {

	var scope = this;
	
	function clampCenturies(t) {
        if (t < -KMG.IAU_SECULAR_TERM_VALID_CENTURIES)
            t = -KMG.IAU_SECULAR_TERM_VALID_CENTURIES;
        else if (t > KMG.IAU_SECULAR_TERM_VALID_CENTURIES)
            t = KMG.IAU_SECULAR_TERM_VALID_CENTURIES;
		return t;
    };
	
	function julianCentury(jd) {
		return (jd - 2451545.0) / 36525.0;
	}
	
	// T = Julian Centuries of 36525 days from epoch
	// d = Julian Days from epoch
	this.calculateOrientation = function(jd) {
		var t = julianCentury(jd);
		jd = jd - 2451545.0;
		
		var result = this.__calculateOrientation(jd, t);
		var ra = result.ra;
		var dec = result.dec;
		
		var node = ra + 90.0;
        var inclination = 90.0 - dec;

		return {
			ra : ra,
			dec : dec,
			node : node,
			inclination : inclination
		};
	
	};
	
	// T = Julian Centuries of 36525 days from epoch
	// d = Julian Days from epoch
	this.computeSiderealRotation = function(jd) {
		jd = jd - 2451545.0;

		return {
			meridian : this.__computeSiderealRotation(jd).meridian
		};
		
	};
	
	this.computeRotationalQuaternion = function(jd, skipMeridian) {
	
		var orientation = this.calculateOrientation(jd);
		var meridian = this.computeSiderealRotation(jd).meridian + 90;
		
		var nodeAxis = new THREE.Vector3( 1, 0, 0 );
		nodeAxis.rotateY((-orientation.node + 90) * KMG.PI_BY_180);
		
		var inclinationQ = new THREE.Quaternion();
		inclinationQ.setFromAxisAngle( nodeAxis, -orientation.inclination * KMG.PI_BY_180 );
	
		var noMeridian = inclinationQ.clone();
		if (!skipMeridian) {
			var meridianQ = new THREE.Quaternion();
			meridianQ.setFromAxisAngle(new THREE.Vector3( 0, 1, 0 ), meridian * KMG.PI_BY_180);
			inclinationQ.multiply(meridianQ);
		}
		
		inclinationQ.meridian = meridian - 90;
		inclinationQ.ra = orientation.ra;
		inclinationQ.dec = orientation.dec;
		inclinationQ.inclination = orientation.inclination;
		inclinationQ.node = orientation.node;
		inclinationQ.noMeridian = noMeridian;
		return inclinationQ;
	};
	
};



//////////////////////////////////////////////
// EARTH
//////////////////////////////////////////////

KMG.IAUEarthRotation = function() {
	
	KMG.IAURotation.call( this );
	
	this.__calculateOrientation = function(jd, t) {
		var ra = 0.00 - 0.641 * t;
		var dec = 90.00 - 23.4;// 90.00 - 0.557 * t;

		return {
			ra : ra,
			dec : dec
		};
	};
	
	this.__computeSiderealRotation = function(jd) {
		var meridian = 190.147 + 360.9856235 * jd;

		return {
			meridian : meridian
		};
	};
};
KMG.IAUEarthRotation.prototype = Object.create( KMG.IAURotation.prototype );






//////////////////////////////////////////////
// Moon
//////////////////////////////////////////////


KMG.IAULunarRotation = function() {
	
	KMG.IAURotation.call( this );

	function makeArgs(jd, t) {
		var E = [];
		E[0] = 0;
		E[1]  = (125.045 -  0.0529921 * jd);
        E[2]  = (250.089 -  0.1059842 * jd);
        E[3]  = (260.008 + 13.012009 * jd);
        E[4]  = (176.625 + 13.3407154 * jd);
        E[5]  = (357.529 +  0.9856993 * jd);
        E[6]  = (311.589 + 26.4057084 * jd);
        E[7]  = (134.963 + 13.0649930 * jd);
        E[8]  = (276.617 +  0.3287146 * jd);
        E[9]  = ( 34.226 +  1.7484877 * jd);
        E[10] = ( 15.134 -  0.1589763 * jd);
        E[11] = (119.743 +  0.0036096 * jd);
        E[12] = (239.961 +  0.1643573 * jd);
        E[13] = ( 25.053 + 12.9590088 * jd);
		return E;
	}
	

	// T = Julian Centuries of 36525 days from epoch
	// d = Julian Days from epoch
	this.__calculateOrientation = function(jd, t) {

		var E = makeArgs(jd);
		
		var ra = 269.9949
            + 0.0013 * t
            - 3.8787 * KMG.Math.dsin(E[1]) 
            - 0.1204 * KMG.Math.dsin(E[2])
            + 0.0700 * KMG.Math.dsin(E[3])
            - 0.0172 * KMG.Math.dsin(E[4])
            + 0.0072 * KMG.Math.dsin(E[6])
            - 0.0052 * KMG.Math.dsin(E[10])
            + 0.0043 * KMG.Math.dsin(E[13]);
            
        var dec = 66.5392
            + 0.0130 * t
            + 1.5419 * KMG.Math.dcos(E[1])
            + 0.0239 * KMG.Math.dcos(E[2])
            - 0.0278 * KMG.Math.dcos(E[3])
            + 0.0068 * KMG.Math.dcos(E[4])
            - 0.0029 * KMG.Math.dcos(E[6])
            + 0.0009 * KMG.Math.dcos(E[7])
            + 0.0008 * KMG.Math.dcos(E[10])
            - 0.0009 * KMG.Math.dcos(E[13]);
			
		return {
			ra : ra,
			dec : dec
		};
		
	};
	
	this.__computeSiderealRotation = function(jd) {

		var E = makeArgs(jd);
		var meridian = (38.3213
                + 13.17635815 * jd
                - 1.4e-12 * (jd * jd)
                + 3.5610 * KMG.Math.dsin(E[1])
                + 0.1208 * KMG.Math.dsin(E[2])
                - 0.0642 * KMG.Math.dsin(E[3])
                + 0.0158 * KMG.Math.dsin(E[4])
                + 0.0252 * KMG.Math.dsin(E[5])
                - 0.0066 * KMG.Math.dsin(E[6])
                - 0.0047 * KMG.Math.dsin(E[7])
                - 0.0046 * KMG.Math.dsin(E[8])
                + 0.0028 * KMG.Math.dsin(E[9])
                + 0.0052 * KMG.Math.dsin(E[10])
                + 0.0040 * KMG.Math.dsin(E[11])
                + 0.0019 * KMG.Math.dsin(E[12])
                - 0.0044 * KMG.Math.dsin(E[13]));
		
		return {
			meridian : meridian
		};
		
	};
	
	
};
KMG.IAULunarRotation.prototype = Object.create( KMG.IAURotation.prototype );



//////////////////////////////////////////////
// MARS
//////////////////////////////////////////////

KMG.IAUMarsRotation = function() {
	
	KMG.IAURotation.call( this );
	
	this.__calculateOrientation = function(jd, t) {
		var ra = 317.68143 - 0.1061 * t;
		var dec = 52.88650 - 0.0609 * t;

		return {
			ra : ra,
			dec : dec
		};
	};
	
	this.__computeSiderealRotation = function(jd) {
		var meridian = 176.630 + 350.89198226 * jd;

		return {
			meridian : meridian
		};
	};
};
KMG.IAUMarsRotation.prototype = Object.create( KMG.IAURotation.prototype );



//////////////////////////////////////////////
// JUPITER
//////////////////////////////////////////////

KMG.IAUJupiterRotation = function() {
	
	KMG.IAURotation.call( this );
	
	
	function calculateElements(t) {
		var Ja = 99.360714 + 4850.4046 * t;
		var Jb = 175.895369 + 1191.9605 * t;
		var Jc = 300.323162 + 262.5475 * t;
		var Jd = 114.012305 + 6070.2476 * t;
		var Je = 49.511251 + 64.3000 * t;
		
		return {
			Ja : Ja,
			Jb : Jb,
			Jc : Jc,
			Jd : Jd,
			Je : Je
		};
		
	};
	
	this.__calculateOrientation = function(jd, t) {
		
		var e = calculateElements(t);
		
		var Î±0 = 268.056595 - 0.006499 * t 
				+ 0.000117 * KMG.Math.dsin(e.Ja) 
				+ 0.000938 * KMG.Math.dsin(e.Jb)
				+ 0.001432 * KMG.Math.dsin(e.Jc)
				+ 0.000030 * KMG.Math.dsin(e.Jd) 
				+ 0.002150 * KMG.Math.dsin(e.Je);
				
		var Î´0 = 64.495303 + 0.002413 * t 
				+ 0.000050 * KMG.Math.dcos(e.Ja)
				+ 0.000404 * KMG.Math.dcos(e.Jb)
				+ 0.000617 * KMG.Math.dcos(e.Jc)
				- 0.000013 * KMG.Math.dcos(e.Jd) 
				+ 0.000926 * KMG.Math.dcos(e.Je);
		Î´0 = 86.87;
		return {
			ra : Î±0,
			dec : Î´0
		};
	};
	
	this.__computeSiderealRotation = function(jd) {
		var W = 284.95 + 870.5360000 * jd;
		
		return {
			meridian : W
		};
	};
};
KMG.IAUJupiterRotation.prototype = Object.create( KMG.IAURotation.prototype );


//////////////////////////////////////////////
// SATURN
//////////////////////////////////////////////

KMG.IAUSaturnRotation = function() {
	
	KMG.IAURotation.call( this );
	
	this.__calculateOrientation = function(jd, t) {

		var ra = 40.589 - 0.036 * t;
		var dec = 83.537 - 0.004 * t;
		
		dec = 63.27;
		
		return {
			ra : ra,
			dec : dec
		};
	};
	
	this.__computeSiderealRotation = function(jd) {
		var meridian = 38.90 + 810.7939024 * jd;

		return {
			meridian : meridian
		};
	};
};
KMG.IAUSaturnRotation.prototype = Object.create( KMG.IAURotation.prototype );

/* File: BaseObject.js */
KMG.BaseObject = function ( ) {
	
	THREE.Object3D.call( this );
	var scope = this;
	
	this.setVisibility = function(visible) {
		this.traverse(function(obj) {
			obj.visible = visible;
		});
	};
	
	this.setShadowInteraction = function(enable) {
		this.traverse(function(obj) {
			obj.castShadow = enable;
			obj.receiveShadow = enable;
		});
	};
	
};
KMG.BaseObject.prototype = Object.create( THREE.Object3D.prototype );



/*
KMG.TemplateObject = function ( context, config ) {
	
	KMG.BaseObject.call( this );
	this.config = config;
	this.context = context;
	var scope = this;
	
	
	// Create Stuff
	
	this.uniforms = uniforms;
	this.mesh = mesh;
	this.material = material;
	this.geometry = geometry;
	
	this.add(mesh);
	
	this.update = function()
	{
		if (!this.context.configChanged) 
			return;
			
	};
};
KMG.TemplateObject.prototype = Object.create( KMG.BaseObject.prototype );
*/


/* File: SurfaceObject.js */

KMG.DefaultSurfaceObjectConfig = {
	texture : KMG.textures[1].name,
	surfaceDetail : 1.0,
	elevationScale : 0,
	shininess : 60,
	diffuseIntensity : 170,
	specularIntensity : 4,
	ambientIntensity : 0,
	emissiveIntensity : 0,
	enableCityLights : true,
	cityLightsIntensity : 1.0,
	flattening : 0.0033528,
	axialTilt : 0.0,
	surfaceColorMode : "Normal",
	surfaceHue : 0.5,
	surfaceSaturation : 0.0,
	surfaceLightness : 0.75,
	surfaceWrapRGB : 0.031,
	surfaceRotation : 0.0,
	scaleSurface : 1.0
};

KMG.SurfaceObject = function ( context, config ) {
	
	KMG.BaseObject.call( this );
	this.config = config = KMG.Util.extend(config, KMG.DefaultSurfaceObjectConfig);
	this.context = context;
	var scope = this;
	
	var imageUtils = new KMG.ImageUtils();
	
	//var geometry = new THREE.SphereGeometry( scope.config.radius, 256, 256 );
	var geometry = new THREE.IcosahedronGeometry( scope.config.radius, 6 );
	geometry.computeTangents();
	
	var ambient = 0x000000, diffuse = 0xFFFFFF, specular = 0x040404, shininess = 15;

	var shader = KMG.ExtendedNormalMapShader;
	var uniforms = THREE.UniformsUtils.clone( shader.uniforms );
	
	var parameters = { 
		fragmentShader: shader.fragmentShader
		, vertexShader: shader.vertexShader
		, uniforms: uniforms
		, lights: true
		, fog : true
		, shading : THREE.SmoothShading
		, alphaTest : 0.2
		//, wireframe : true
	};
	var material = new THREE.ShaderMaterial( parameters );
	material.wrapAround = true;

	var mesh = new THREE.Mesh( geometry, material );
	mesh.position = new THREE.Vector3( 0, 0, 0 );
	this.position = new THREE.Vector3( 0, 0, 0 ); 
	
	this.props = {
		mesh : mesh,
		material : material,
		geometry : geometry
	};
	this.rotation.y = 180 * (Math.PI / 180);
	
	this.add(mesh);
	
	var lastCapture = (new Date()).getTime();
	
	
	this.update = function()
	{
		var texDefinition = KMG.TextureMap.getTextureDefinitionByName(this.config.texture);
	
		if (!this.context.configChanged && !(texDefinition.name === "Webcam")) {
			return;
		}
	
		var tDiffuse = null;
		if (texDefinition.name == "Webcam") {
			tDiffuse = texDefinition.texture;
		} else {
			tDiffuse = (texDefinition.texture) ? KMG.TextureMap.loadTexture(texDefinition.texture) : null;
		}
		
		
		var tNormal = (texDefinition.normalMap) ? KMG.TextureMap.loadTexture(texDefinition.normalMap) : null;
		var tSpecular = (texDefinition.specularMap) ? KMG.TextureMap.loadTexture(texDefinition.specularMap) : null;
		var tCityLights = KMG.TextureMap.loadTexture(KMG.lights[0].texture);
		var tDisplacement = (texDefinition.bumpMap) ? KMG.TextureMap.loadTexture(texDefinition.bumpMap) : null;
		
		var tAO = null;
		if (this.config.displayClouds && this.config.cloudsCastShadows) {
			var cloudTexDefinition = KMG.TextureMap.getCloudDefinitionByName(this.config.cloudsTexture);
			tAO = (cloudTexDefinition.aoMap) ? KMG.TextureMap.loadTexture(cloudTexDefinition.aoMap) : null;
		}
		
		var diffuseIntensity = KMG.Util.intensityToWhiteColor(this.config.diffuseIntensity);
		var specularIntensity = KMG.Util.intensityToWhiteColor(this.config.specularIntensity);
		var ambientIntensity = KMG.Util.intensityToWhiteColor(this.config.ambientIntensity);
		

		var diffuse = KMG.Util.intensityToWhiteColor(this.config.diffuseIntensity);
		var specular = KMG.Util.intensityToWhiteColor(this.config.specularIntensity);
		var ambient = KMG.Util.intensityToWhiteColor(this.config.ambientIntensity);
		var emissive = KMG.Util.intensityToWhiteColor(this.config.emissiveIntensity);

		uniforms[ "enableDiffuse" ].value = true;
		uniforms[ "enableDisplacement" ].value = true;
		uniforms[ "enableCityLights" ].value = this.config.enableCityLights;
		
		
		uniforms[ "enableSpecular" ].value = (tSpecular != null);
		uniforms[ "enableAO" ].value = (tAO != null);
		
		var grayScale = false;
		var inverted = false;
		switch (this.config.surfaceColorMode) {
		case "Normal":
			// Keep both as false
			break;
		case "Grayscale":
			grayScale = true;
			break;
		case "Inverted":
			inverted = true;
			break;
		case "Inverted Grayscale":
			grayScale = true;
			inverted = true;
			break;
		};
		
		uniforms[ "enableGrayscale" ].value = grayScale;
		uniforms[ "uInvertedColor" ].value = inverted;
		
		
		uniforms[ "tDiffuse" ].value = tDiffuse;
		uniforms[ "tNormal" ].value = tNormal;
		uniforms[ "tSpecular" ].value = tSpecular;
		uniforms[ "tCityLights" ].value = tCityLights;
		uniforms["tDisplacement"].value = tDisplacement;
		uniforms["tAO"].value = tAO;
		
		if (tNormal) {
			uniforms[ "uNormalScale" ].value.set( this.config.surfaceDetail, this.config.surfaceDetail );
		} else {
			uniforms[ "uNormalScale" ].value.set( 0, 0 );
		}
		uniforms["uDisplacementScale"].value = this.config.elevationScale;
	
		
		var hslColor = new THREE.Color(0xFFFFFF);
		hslColor.setHSL(this.config.surfaceHue, this.config.surfaceSaturation, this.config.surfaceLightness);
		
		var hslEmissiveColor = new THREE.Color(0xFFFFFF);
		hslEmissiveColor.setHSL(this.config.surfaceHue, this.config.surfaceSaturation, this.config.surfaceLightness);
		hslEmissiveColor.multiplyScalar( this.config.emissiveIntensity / 255.0 );
		
		
		uniforms["usingDirectionalLighting"].value = (this.config.lightingType === "Directional");
		
		uniforms[ "uDiffuseColor" ].value = hslColor;
		uniforms[ "uSpecularColor" ].value = specular ;
		uniforms[ "uAmbientColor" ].value = ambient ;
		uniforms[ "uEmissiveColor" ].value = hslEmissiveColor;
		uniforms[ "uCityLightsIntensity" ].value = (this.config.cityLightsIntensity <= 5.0) ? this.config.cityLightsIntensity : 5;
		uniforms[ "uShininess" ].value = this.config.shininess;
		
		uniforms[ "uAOLevel" ].value = this.config.cloudsShadowLevel;
		
		uniforms[ "wrapRGB" ].value = new THREE.Vector3(this.config.surfaceWrapRGB, this.config.surfaceWrapRGB, this.config.surfaceWrapRGB); 
		
		uniforms["enableFog"].value = this.config.displayAtmosphere;
		
		mesh.castShadow = scope.config.shadows;
		mesh.receiveShadow = scope.config.shadows;
		
		mesh.rotation.set(0, this.config.surfaceRotation*(Math.PI/180.0), 0.0);
		
		// Doesn't really work this way, but visually, it's close enough
		this.scale.set(this.config.scaleSurface, this.config.scaleSurface - this.config.flattening, this.config.scaleSurface);
		//this.scale.y = scaleSurface - this.config.flattening;
		
		//
		this.rotation.z = -this.config.axialTilt * (Math.PI/180);
	};

};
KMG.SurfaceObject.prototype = Object.create( KMG.BaseObject.prototype );


/* File: CloudObject.js */


KMG.DefaultCloudConfig = {
	cloudsTexture : KMG.clouds[1].name,
	displayClouds : true,
	cloudsHue : 0.5,
	cloudsSaturation : 0.0,
	cloudsLightness : 0.75,
	cloudsDetail : 0.6,
	cloudsElevation : 0.25,
	cloudsThickness : 0,
	cloudsOpacity : 1.0,
	cloudsCastShadows : true,
	cloudsShadowLevel : 0.8,
	cloudsDiffuseIntensity : 170,
	cloudsSpecularIntensity : 4,
	cloudsAmbientIntensity : 60

};

KMG.CloudObject = function ( context, config ) {
	
	KMG.BaseObject.call( this );
	this.config = config = KMG.Util.extend(config, KMG.DefaultCloudConfig);
	this.context = context;
	var scope = this;
	
	
	//var geometry = new THREE.SphereGeometry( scope.config.cloudsRadius, 64, 32 );
	var geometry = new THREE.IcosahedronGeometry( scope.config.cloudsRadius, 5 );
	geometry.computeTangents();
	
	var shader = KMG.ExtendedNormalMapShader;
	var uniforms = THREE.UniformsUtils.clone( shader.uniforms );
	
	
	var parameters = { 
		fragmentShader: shader.fragmentShader, 
		vertexShader: shader.vertexShader, 
		uniforms: uniforms, 
		lights: true, 
		fog : true, 
		transparent: true,
		depthWrite: false, 
		depthTest: true,
		blending : THREE.AdditiveBlending
	};
	var material = new THREE.ShaderMaterial( parameters );
	material.wrapAround = true;

	var mesh = new THREE.Mesh( geometry, material );
	
	mesh.position = new THREE.Vector3( 0, 0, 0 );

	this.add(mesh);
	
	
	this.update = function()
	{
		if (!this.context.configChanged)
			return;
			
		this.traverse(function(obj) {
			obj.visible = scope.config.displayClouds;
		});
		if (!mesh.visible) {
			return;
		}
		
		
		var texDefinition = KMG.TextureMap.getCloudDefinitionByName(scope.config.cloudsTexture);
		var tDiffuse = (texDefinition.texture) ? KMG.TextureMap.loadTexture(texDefinition.texture) : null;
		var tBumpMap = (texDefinition.bumpMap) ? KMG.TextureMap.loadTexture(texDefinition.bumpMap) : null;
		var tNormals = (texDefinition.normalMap) ? KMG.TextureMap.loadTexture(texDefinition.normalMap) : null;
	
		tDiffuse.format = THREE.RGBAFormat;
		
		var hslColor = new THREE.Color(0xFFFFFF);
		hslColor.setHSL(this.config.cloudsHue, this.config.cloudsSaturation, this.config.cloudsLightness);
		
		var diffuse = KMG.Util.intensityToWhiteColor(this.config.cloudsDiffuseIntensity);
		var specular = KMG.Util.intensityToWhiteColor(this.config.cloudsSpecularIntensity);
		var ambient = KMG.Util.intensityToWhiteColor(this.config.cloudsAmbientIntensity);
		
		uniforms[ "enableAO" ].value = false;
		uniforms[ "enableDiffuse" ].value = true;
		uniforms[ "enableSpecular" ].value = false;
		uniforms[ "enableCityLights" ].value = false;
		uniforms[ "enableDisplacement" ].value = true;
		
		uniforms[ "tDiffuse" ].value = tDiffuse;
		uniforms[ "tNormal" ].value = tNormals;
		uniforms["tDisplacement"].value = tBumpMap;
		
		uniforms["enableFog"].value = this.config.displayAtmosphere;
		uniforms[ "uAlphaMulitplier" ].value = this.config.cloudsOpacity;
		
		uniforms[ "uDiffuseColor" ].value = hslColor;
		//uniforms[ "uDiffuseColor" ].value = diffuse;
		uniforms[ "uSpecularColor" ].value = specular ;
		uniforms[ "uAmbientColor" ].value = ambient ;
		
		uniforms["usingDirectionalLighting"].value = (this.config.lightingType === "Directional");
		
		if (tNormals) {
			uniforms[ "uNormalScale" ].value.set( this.config.cloudsDetail, this.config.cloudsDetail );
		} else {
			uniforms[ "uNormalScale" ].value.set( 0, 0 );
		}
		uniforms["uDisplacementScale"].value = this.config.cloudsThickness;

		
		var scale = 1.0 + this.config.cloudsElevation / 100.0;
		mesh.scale.set(scale, scale, scale);
		
		// Doesn't really work this way, but visually, it's close enough
	//	this.scale.y = (1.0 - this.config.flattening) * scale;
		this.scale.set(this.config.scaleSurface * scale, (this.config.scaleSurface - this.config.flattening) * scale, this.config.scaleSurface * scale);
		this.rotation.y = 180 * (Math.PI / 180);
		this.rotation.z = -this.config.axialTilt * (Math.PI/180);
		
		mesh.rotation.set(0, this.config.surfaceRotation*(Math.PI/180.0), 0.0);
		mesh.castShadow = false;
		mesh.receiveShadow = scope.config.shadows;
	};
};
KMG.CloudObject.prototype = Object.create( KMG.BaseObject.prototype );


/* File: RingObject.js */

KMG.DefaultRingConfig = {
	displayRing : false,
	ringTexture : KMG.rings[0].name,
	ringHue : 0.5,
	ringSaturation : 0.0,
	ringLightness : 0.75,
	ringInnerRadius : 260.0,
	ringOutterRadius : 400.0,
	ringAngle : 0.0,
	showShadows : true,
	ringOpacity : 1.0,
	targetObject : 0
};

KMG.RingObject = function ( context, config ) {
	
	KMG.BaseObject.call( this );
	this.config = config = KMG.Util.extend(config, KMG.DefaultRingConfig);
	this.context = context;
	var scope = this;
	

	function createMesh() 
	{	
		var texDefinition = KMG.TextureMap.getRingDefinitionByName(scope.config.ringTexture);
		var ringTexture = (texDefinition.texture != null) ? KMG.TextureMap.loadTexture(texDefinition.texture) : null;
		ringTexture.format = THREE.RGBAFormat;
		
		var hslColor = new THREE.Color(0xFFFFFF);
		hslColor.setHSL(scope.config.ringHue, scope.config.ringSaturation, scope.config.ringLightness);

		var material = new THREE.MeshLambertMaterial({
									ambient		: hslColor,
									color		: hslColor,
									shininess	: 150, 
									specular	: new THREE.Color(0x000000),
									shading		: THREE.SmoothShading,
									map		: ringTexture,
									transparent: true,
									side: THREE.DoubleSide,
									fog : false,
									opacity : scope.config.ringOpacity,
									depthWrite: false, 
									depthTest: true
								});

		var innerRadius = scope.config.ringInnerRadius;
		var outterRadius = scope.config.ringOutterRadius;
		
		innerRadius = (innerRadius < outterRadius) ? innerRadius : outterRadius;
		outterRadius = (outterRadius > innerRadius) ? outterRadius : innerRadius;
		
		var geometry = new THREE.RingGeometry2( innerRadius, outterRadius, 180, 1, 0, Math.PI * 2);
		geometry.computeFaceNormals();
		
		var mesh = new THREE.Mesh( geometry, material );
		mesh.position = new THREE.Vector3( 0, 0, 0 );

		mesh.rotation.x = 90.0 * (Math.PI/180);
		mesh.rotation.y = scope.config.ringAngle * (Math.PI/180.0);
		
		mesh.updateMatrix();
		
		mesh.castShadow = scope.config.shadows;
		mesh.receiveShadow = scope.config.shadows;

		scope.uniforms = null;
		scope.mesh = mesh;
		scope.material = material;
		scope.geometry = geometry;
		
		return mesh;

	}
	this.add(createMesh());
	
	this.update = function()
	{
		if (!this.context.configChanged)
			return;
		
		this.remove(this.mesh);
		this.add(createMesh());

		this.mesh.visible = this.config.displayRing;

		if (scope.config.targetObject) {
			this.position = scope.config.targetObject.position.clone();
		} else {
			this.rotation.z = scope.config.axialTilt * (Math.PI/180);
		}
		
	};
};
KMG.RingObject.prototype = Object.create( KMG.BaseObject.prototype );


/* File: CatalogStarsObject.js */

KMG.StarUtil = {};
KMG.StarUtil.colorForSpectralClass = function(code) {
	if (code == "O")
		return 0x9db4ff;
	else if (code == "B")
		return 0xaabfff;
	else if (code == "A")
		return 0xcad8ff;
	else if (code == "F")
		return 0xfbf8ff;
	else if (code == "G")
		return 0xfff4e8;
	else if (code == "K")
		return 0xffddb4;
	else if (code == "M")
		return 0xffbd6f;
	else if (code == "L")
		return 0xf84235;
	else if (code == "T")
		return 0xba3059;
	else if (code == "Y")
		return 0x605170;
	else // Including D,C,W,S,N,P for now until I get some concrete colors on these
		return 0xFFFFFF;
}



KMG.StarParticlesShader = {

	uniforms: THREE.UniformsUtils.merge( [
		{
			"tParticle"	   : { type: "t", value: null },
			"vAlpha": { type: "f", value: 0.15 },
			"vSizeMultiplier": { type: "f", value:3.5 },
			"color" : { type: "v3", value: new THREE.Vector3( 1, 1, 1 ) },
		}]),

	vertexShader: [
		'attribute float alpha;',
		'varying float vAlpha;',
		'uniform float vSizeMultiplier;',
		'void main() {',
		'	vAlpha = alpha;',
		'	vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );',
		'	gl_PointSize = (vSizeMultiplier * alpha);',
		'	gl_Position = projectionMatrix * mvPosition;',
		'}'
	].join("\n"),

	fragmentShader: [
		"uniform sampler2D tParticle;",
		'uniform vec3 color;',
		'varying float vAlpha;',
		'varying float vSizeMultiplier;',
		'void main() {',
		'	gl_FragColor = vec4( color, vAlpha );',
		'	gl_FragColor = gl_FragColor * texture2D( tParticle, vec2( gl_PointCoord.x, 1.0 - gl_PointCoord.y ) );',
		'}'
	].join("\n")

};


KMG.DefaultSpectralTypeStarParticleSystemOptions = {
	texture : 'img/star_particle.png',
	radius : 90000.0,
	sizeMultiplier : 6.5
};

KMG.SpectralTypeStarParticleSystem = function(context, config, typeCode) {
	KMG.BaseObject.call( this );
	this.config = config = KMG.Util.extend(config, KMG.DefaultSpectralTypeStarParticleSystemOptions);
	this.context = context;
	var scope = this;
	
	var particleTexture = KMG.TextureMap.loadTexture(config.texture);
	particleTexture.wrapS = particleTexture.wrapT = THREE.ClampToEdgeWrapping;
	particleTexture.format = THREE.RGBAFormat;
	particleTexture.needsUpdate = true;
	
	var geometry = new THREE.Geometry();

	var shader = KMG.StarParticlesShader;
	var uniforms = THREE.UniformsUtils.clone( shader.uniforms );

	uniforms[ "color" ].value = KMG.Util.rgbToArray(KMG.StarUtil.colorForSpectralClass(typeCode));
	uniforms[ "vSizeMultiplier" ].value = config.sizeMultiplier;
	uniforms[ "tParticle" ].value = particleTexture;
	
	var attributes = {
        alpha: { type: 'f', value: [] },
    };
	
	var material = new THREE.ShaderMaterial( {
        uniforms:       uniforms,
        attributes:     attributes,
        vertexShader: shader.vertexShader,
		fragmentShader: shader.fragmentShader,
        transparent:    true
    });
	

	this.addStar = function(equatorialRightAscension, equatorialDeclination, visualMagnitude) {	
		
		var coords = KMG.Math.convertEquatorialToEcliptic(equatorialRightAscension, equatorialDeclination);
		
		var alpha = 1.0 - ((visualMagnitude + 1.46) / 9.42);
		alpha = (alpha * 0.85) + (0.15);
		
		attributes.alpha.value.push(alpha);

		var vertex = KMG.Math.getPoint3D(coords.l, coords.b, this.config.radius);
		vertex.magnitude = visualMagnitude;
		geometry.vertices.push( vertex );
	};
	
	this.build = function() {
		var particles = new THREE.ParticleSystem( geometry, material );
		scope.add(particles);
	
	};
	
	
	this.update = function()
	{
		if (!this.context.configChanged)
			return;
			
		uniforms[ "vSizeMultiplier" ].value = this.config.sizeMultiplier;
		
	};
};
KMG.SpectralTypeStarParticleSystem.prototype = Object.create( KMG.BaseObject.prototype );




KMG.DefaultCatalogStarsObjectOptions = {
	
};
KMG.DefaultCatalogStarsObjectOptions = KMG.Util.extend(KMG.DefaultCatalogStarsObjectOptions, KMG.DefaultSpectralTypeStarParticleSystemOptions);


KMG.CatalogStarsObject = function ( context, config ) {
	
	KMG.BaseObject.call( this );
	this.config = config = KMG.Util.extend(config, KMG.DefaultCatalogStarsObjectOptions);
	this.context = context;
	var scope = this;
	
	var particleTexture = KMG.TextureMap.loadTexture('img/star_particle.png');
	particleTexture.wrapS = particleTexture.wrapT = THREE.ClampToEdgeWrapping;
	particleTexture.format = THREE.RGBAFormat;
	
	
	var spectralTypes = {};
	this.add(spectralTypes["O"] = new KMG.SpectralTypeStarParticleSystem(context, config, "O"));
	this.add(spectralTypes["B"] = new KMG.SpectralTypeStarParticleSystem(context, config, "B"));
	this.add(spectralTypes["A"] = new KMG.SpectralTypeStarParticleSystem(context, config, "A"));
	this.add(spectralTypes["F"] = new KMG.SpectralTypeStarParticleSystem(context, config, "F"));
	this.add(spectralTypes["G"] = new KMG.SpectralTypeStarParticleSystem(context, config, "G"));
	this.add(spectralTypes["K"] = new KMG.SpectralTypeStarParticleSystem(context, config, "K"));
	this.add(spectralTypes["M"] = new KMG.SpectralTypeStarParticleSystem(context, config, "M"));
	this.add(spectralTypes["L"] = new KMG.SpectralTypeStarParticleSystem(context, config, "L"));
	this.add(spectralTypes["T"] = new KMG.SpectralTypeStarParticleSystem(context, config, "T"));
	this.add(spectralTypes["Y"] = new KMG.SpectralTypeStarParticleSystem(context, config, "Y"));
	
	
	this.add(spectralTypes["D"] = new KMG.SpectralTypeStarParticleSystem(context, config, "D"));
	this.add(spectralTypes["C"] = new KMG.SpectralTypeStarParticleSystem(context, config, "C"));
	this.add(spectralTypes["W"] = new KMG.SpectralTypeStarParticleSystem(context, config, "W"));
	this.add(spectralTypes["S"] = new KMG.SpectralTypeStarParticleSystem(context, config, "S"));
	this.add(spectralTypes["N"] = new KMG.SpectralTypeStarParticleSystem(context, config, "N"));
	this.add(spectralTypes["P"] = new KMG.SpectralTypeStarParticleSystem(context, config, "P"));

	// With respect to the equatorial pole
	// North pole:
	//	Right Ascension:  12h 51.4m
	//  Declination:      27.13 deg

	// South Pole:
	//  Right Ascension:  0h 51.4m
	//  Declination:      -27.13 deg
	
	// Galactic Center (0 deg longitude)
	//  Right Ascension:  17h 45.5m
	//  Declination:      -28.94 deg

	function createSystemForSpectralClass(classCode) {
	
	
	
	};
	
	
	
	
	
	$.ajax({
		url: "/data/stars/bright_star_db_v5-1_rest.json",
		dataType: "json",
		error: function( jqXHR, textStatus, errorThrown ) {
			console.warn("Error: " + errorThrown);
		
		},
		success: function(data, textStatus, jqxhr) {
			
		}
	}).done(function(data) {

		
		
		for (var i = 0; i < data.length; i++) {
			if (spectralTypes[data[i][1]]) {
				spectralTypes[data[i][1]].addStar((data[i][2]), data[i][3], data[i][0]);
			} else {
				console.warn("No particle system for spectral type " + data[i][3]);
			}
		}
		
		for (var key in spectralTypes) {
			spectralTypes[key].build();
		}
		
		
	});
	
	
	this.update = function()
	{
		if (!this.context.configChanged)
			return;
			
		for (var key in spectralTypes) {
			spectralTypes[key].update();
		}
	};
};
KMG.CatalogStarsObject.prototype = Object.create( KMG.BaseObject.prototype );

/* File: ConstellationLines.js */
KMG.DefaultConstellationLinesConfig = {
	
	color : 0x12110C,
	radius : 90000.0,
	opacity : 0.45,
	lineThickness : 1.0
	
};

KMG.ConstellationLines = function ( context, config ) {
	
	KMG.BaseObject.call( this );
	this.config = config = KMG.Util.extend(config, KMG.DefaultConstellationLinesConfig);
	this.context = context;
	var scope = this;
	
	function buildPath(path) {
		
		var geometry = new THREE.Geometry();
		
		for (var i = 0; i < path.length; i++) {
			var point = path[i];
			
			var coords = KMG.Math.convertEquatorialToEcliptic(point[0] * 15, point[1]);
			var vertex = KMG.Math.getPoint3D(coords.l, coords.b, config.radius);
			geometry.vertices.push( vertex );
			
		}
		
		var material = new THREE.LineBasicMaterial( { opacity: config.opacity, transparent : true, fog : false, color : config.color, linewidth:config.lineThickness } );
		var line = new THREE.Line( geometry,  material);

		return line;
	}
	
	function buildConstellation(constellation) {
		
		var const3d = new THREE.Object3D();
		
		for (var i = 0; i < constellation.paths.length; i++) {
			var path = constellation.paths[i];
			var path3d = buildPath(path);
			const3d.add(path3d);
		}
		
		return const3d;
		
	}
	
	
	$.ajax({
		url: "/data/stars/sfa_constellation_lines.json",
		dataType: "json",
		error: function( jqXHR, textStatus, errorThrown ) {
			console.warn("Error: " + errorThrown);
		
		},
		success: function(data, textStatus, jqxhr) {
			
		}
	}).done(function(data) {

		console.info("Adding " + data.length + " constellations");
		
		for (var i = 0; i < data.length; i++) {
			
			scope.add(buildConstellation(data[i]));

		}
		
		
	
	});
	
	
	this.update = function() {
		
		
	};
};
KMG.ConstellationLines.prototype = Object.create( KMG.BaseObject.prototype );


/* File: StarsObject.js */

KMG.StarsObject = function ( context, config ) {
	
	KMG.BaseObject.call( this );
	this.config = config;
	this.context = context;
	var scope = this;
	
	var particleTexture = KMG.TextureMap.loadTexture('img/star_particle.png');
	particleTexture.wrapS = particleTexture.wrapT = THREE.ClampToEdgeWrapping;
	particleTexture.format = THREE.RGBAFormat;
		
	function buildStarsMeshWithIntensity(quantity, intensity, size)
	{
		
		var starfield = new THREE.Object3D();
		
		var  particles, geometry, material, parameters, i, h, color;
		
		geometry = new THREE.Geometry();
		
		var radius = 90000.0;
		material = new THREE.ParticleBasicMaterial( { map: particleTexture
													, color: intensity
													, size: size
													, fog : false
													, sizeAttenuation : false
													, transparent : true
													, blending : THREE.AdditiveBlending
													, depthTest : false
													, depthWrite : false
													} );
		
		for ( i = 0; i < quantity; i ++ ) {
			
			var u = Math.random() * 360.0;
			var v = Math.random() * 180.0;

			var vertex = new THREE.Vector3();
			vertex.x = -radius * Math.cos( 0 + u * Math.PI * 2 ) * Math.sin( 0 + v * Math.PI );
			vertex.y = radius * Math.cos( 0 + v * Math.PI );
			vertex.z = radius * Math.sin( 0 + u * Math.PI * 2 ) * Math.sin( 0 + v * Math.PI );

			geometry.vertices.push( vertex );

		}

		
		particles = new THREE.ParticleSystem( geometry, material );
		particles.rotation.x = Math.random() * 6;
		particles.rotation.y = Math.random() * 6;
		particles.rotation.z = Math.random() * 6;
		
		
		starfield.add( particles );
		
		return starfield;
	}
	
	
	function buildStarsWithRandomSizeFluctuation(quantity, intensity, size, starsMesh) {
	
		for (var i = 0; i <= quantity; i+=25) {
			
			starsMesh.add(buildStarsMeshWithIntensity(25, intensity, size + (Math.random() * 2.0 - 1.0)));
			
		}
	
	}
	
	
	
	var largeStarSize = 2;
	var smallStarSize = 2;
	
	var starsMesh = new THREE.Object3D();
	buildStarsWithRandomSizeFluctuation(75, 0xFFBBBB, largeStarSize, starsMesh);
	buildStarsWithRandomSizeFluctuation(250, 0xBBBBFF, largeStarSize, starsMesh);
	buildStarsWithRandomSizeFluctuation(175, 0xFFFFBB, largeStarSize, starsMesh);
	buildStarsWithRandomSizeFluctuation(500, 0xFFFFFF, largeStarSize, starsMesh);
	
	buildStarsWithRandomSizeFluctuation(625, 0xFFBBBB, smallStarSize, starsMesh);
	buildStarsWithRandomSizeFluctuation(1250, 0xBBBBFF, smallStarSize, starsMesh);
	buildStarsWithRandomSizeFluctuation(625, 0xFFFFBB, smallStarSize, starsMesh);
	buildStarsWithRandomSizeFluctuation(2500, 0xFFFFFF, smallStarSize, starsMesh);
	
	this.mesh = starsMesh;
	
	this.add(starsMesh);
	
	this.update = function()
	{
		if (!this.context.configChanged)
			return;
	};
};
KMG.StarsObject.prototype = Object.create( KMG.BaseObject.prototype );

/* File: StarGroupObject.js */

KMG.StarGroupObject = function ( context, config ) {
	
	KMG.BaseObject.call( this );
	this.config = config;
	this.context = context;
	var scope = this;
	
	
	this.starObjects = new Array();
	for (var i = 0; i < 10; i++) {
		var starObject = new KMG.StarsObject(this.context, this.config);
	
		this.starObjects[this.starObjects.length] = starObject;
		this.add(starObject);
	}

	this.update = function()
	{
		if (!this.context.configChanged)
			return;
		
		for (var i = 0; i < 10; i++) {
			this.starObjects[i].update();
			var isVisible = i < this.config.starQuantity && this.config.backgroundType === "stars";
			this.starObjects[i].traverse(function(stars) {
				stars.visible = isVisible;
			});
		}
	
	};
};
KMG.StarGroupObject.prototype = Object.create( KMG.BaseObject.prototype );

/* File: StarMapSphereObject.js */
KMG.DefaultStarMapSphereOptions = {
	texture : "Yale Bright Star Map"

};


KMG.StarMapSphereObject = function ( context, config ) {
	
	KMG.BaseObject.call( this );
	this.config = config = KMG.Util.extend(config, KMG.DefaultStarMapSphereOptions);
	this.context = context;
	var scope = this;

	
	
	var texDefinition = KMG.TextureMap.getBackgroundDefinitionByName(config.texture);
	var tDiffuse = (texDefinition.texture != null) ? KMG.TextureMap.loadTexture(texDefinition.texture) : null;
	
	var shader = THREE.StarMapShader;
	var uniforms = THREE.UniformsUtils.clone( shader.uniforms );
	
	
	uniforms[ "tStarMap" ].value = tDiffuse;
	
	var geometry = new THREE.SphereGeometry( 10000000, 96, 96 );
	geometry.computeTangents();
	
	
	var material = new THREE.ShaderMaterial({
		uniforms: uniforms,
		vertexShader: shader.vertexShader,
		fragmentShader: shader.fragmentShader,
		transparent : true,
		side : THREE.BackSide,
		blending : THREE.AdditiveBlending,
		depthWrite: false, depthTest: true,
		lights: true
	});
	
	var mesh = new THREE.Mesh(geometry, material);

	mesh.updateMatrix();
	
	this.add(mesh);
	
	
	
	this.update = function()
	{
	
	};
};
KMG.StarMapSphereObject.prototype = Object.create( KMG.BaseObject.prototype );




THREE.StarMapShader = {

	uniforms: THREE.UniformsUtils.merge( [
		THREE.UniformsLib[ "shadowmap" ],
		THREE.UniformsLib[ "lights" ],

		{
			"tStarMap"	   : { type: "t", value: null },
					
			"minimumRedLevel": { type: "f", value: 0.15 },		
			"uOffset" : { type: "v2", value: new THREE.Vector2( 0.001, 0.001 ) },
			"uRepeat" : { type: "v2", value: new THREE.Vector2( 0.998, 0.998 ) }
		}]),

	vertexShader: [
		
		"varying vec2 vUv;",
		"uniform vec2 uOffset;",
		"uniform vec2 uRepeat;",
		
		'void main() {',

		'	vUv = uv * uRepeat + uOffset;',
		'	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 ); ',
		'}'
	].join("\n"),

	fragmentShader: [
		
		"uniform sampler2D tStarMap;",
		"varying vec2 vUv;",
		"uniform float minimumRedLevel;",
		
		'void main() {',
		'	vec4 texelColor = texture2D( tStarMap, vUv );',
		'	if (texelColor.x >= minimumRedLevel) {',
		'	gl_FragColor = texelColor;', 
		'	}',

		'}'
	].join("\n")

};


/* File: BackgroundImageSphereObject.js */

KMG.BackgroundImageSphereObject = function ( context, config ) {
	
	KMG.BaseObject.call( this );
	this.config = config;
	this.context = context;
	var scope = this;
	
	var geometry = new THREE.SphereGeometry( 10000000, 64, 32 );
	geometry.computeTangents();
	
	
	var texDefinition = KMG.TextureMap.getBackgroundDefinitionByName(scope.config.backgroundImage);
	var tDiffuse = (texDefinition.texture != null) ? KMG.TextureMap.loadTexture(texDefinition.texture) : null;

	var material = new THREE.MeshBasicMaterial({
								shading		: THREE.SmoothShading,
								map			: tDiffuse,
								fog			: false,
								side		: THREE.BackSide,
								depthWrite  : false
							});
	
	
	var mesh = new THREE.Mesh( geometry, material );
	
	mesh.position = new THREE.Vector3( 0, 0, 0 );

	// Create Stuff

	this.mesh = mesh;
	this.material = material;
	this.geometry = geometry;
	
	this.add(mesh);
	
	this.update = function()
	{
		if (!this.context.configChanged) 
			return;
		
		
		var texDefinition = KMG.TextureMap.getBackgroundDefinitionByName(scope.config.backgroundImage);
		var tDiffuse = null;
		if (texDefinition.name == "Webcam") {
			tDiffuse = texDefinition.texture;
		} else {
			tDiffuse = (texDefinition.texture) ? KMG.TextureMap.loadTexture(texDefinition.texture) : null;
		}

		this.material.map = tDiffuse;
		
	};
};
KMG.BackgroundImageSphereObject.prototype = Object.create( KMG.BaseObject.prototype );


/* File: BackgroundImageSpriteObject.js */


KMG.BackgroundImageSpriteObject = function ( context, config ) {
	
	KMG.BaseObject.call( this );
	this.config = config;
	this.context = context;
	var scope = this;

	
	var texDefinition = KMG.TextureMap.getBackgroundDefinitionByName(scope.config.backgroundImage);
	var tDiffuse = (texDefinition.texture != null) ? KMG.TextureMap.loadTexture(texDefinition.texture) : null;

	var material = new THREE.SpriteMaterial({
								shading		: THREE.SmoothShading,
								map			: tDiffuse,
								fog			: false,
								useScreenCoordinates : true,
								alignment: THREE.SpriteAlignment.topLeft,
								blending: THREE.AdditiveBlending
							});
	
	var sprite = new THREE.Sprite( material );
	sprite.position.set( 0, 0, -1000 );
	sprite.scale.set( 1000, 1000, 1 );

	this.sprite = sprite;
	this.material = material;
	
	this.add(sprite);
	
	this.update = function()
	{

		if (this.config.backgroundImageFitType === "stretch") {
			this.sprite.scale.set(this.context.containerWidth, this.context.containerHeight, 1);
		} /*else if (this.config.backgroundImageFitType === "center") {
		
		} else if (this.config.backgroundImageFitType === "fill") {
		
		} else if (this.config.backgroundImageFitType === "fit") {
		
		}*/
		
		if (!this.context.configChanged) 
			return;
			
		var texDefinition = KMG.TextureMap.getBackgroundDefinitionByName(scope.config.backgroundImage);
		
		
		var tDiffuse = null;
		if (texDefinition.name == "Webcam") {
			tDiffuse = texDefinition.texture;
		} else {
			tDiffuse = (texDefinition.texture) ? KMG.TextureMap.loadTexture(texDefinition.texture) : null;
		}
		//var tDiffuse = (texDefinition.texture != null) ? KMG.TextureMap.loadTexture(texDefinition.texture) : null;
		
		this.material.map = tDiffuse;
	};
};
KMG.BackgroundImageSpriteObject.prototype = Object.create( KMG.BaseObject.prototype );

/* File: BackgroundObject.js */

KMG.DefaultBackgroundConfig = {
	backgroundType : 'stars',
	backgroundImage : 'Starfield',
	backgroundImageType : 'flat',
	backgroundImageFitType : 'stretch',
	starQuantity : 3.5, // 0 - 10
	noStars : false
};

KMG.BackgroundObject = function ( context, config ) {
	
	KMG.BaseObject.call( this );
	this.config = config = KMG.Util.extend(config, KMG.DefaultBackgroundConfig);
	this.context = context;
	var scope = this;
	
	
	this.starsConfig = {
		alphaMultiplier : 2.0
	};
	// Create Stuff
	if (!config.noStars) {
		this.stars = new KMG.CatalogStarsObject(context, this.starsConfig);
		this.add(this.stars);
	}
	
	this.imageSphere = new KMG.BackgroundImageSphereObject(context, config);
	this.imageFlat = new KMG.BackgroundImageSpriteObject(context, config);
	
	
	this.add(this.imageSphere);
	this.add(this.imageFlat);
	
	
	this.setShadowInteraction(false);
	
	this.update = function()
	{
	
		this.starsConfig.sizeMultiplier = scope.config.starQuantity;
	
		//if (scope.config.backgroundType === "stars") {
		if (this.stars) {
			this.stars.update();
		}
		//}
		
		if (scope.config.backgroundType === "image" && scope.config.backgroundImageType === "sphere") {
			this.imageSphere.update();
		}
		
		if (scope.config.backgroundType === "image" && scope.config.backgroundImageType === "flat") {
			this.imageFlat.update();
		}
		
		if (!this.context.configChanged) 
			return;
		
		// Handled within StarGroupObject object
		//this.stars.traverse(function(obj) {
		//
		//});
		
		this.imageSphere.traverse(function(obj) {
			obj.visible = (scope.config.backgroundType === "image" && scope.config.backgroundImageType === "sphere");
		});
		
		this.imageFlat.traverse(function(obj) {
			obj.visible = (scope.config.backgroundType === "image" && scope.config.backgroundImageType === "flat");
		});
	};
};
KMG.BackgroundObject.prototype = Object.create( KMG.BaseObject.prototype );

/* File: HaloObject.js */

KMG.HaloObject = function ( context, config ) {
	
	KMG.BaseObject.call( this );
	this.config = config;
	this.context = context;
	var scope = this;

	
	var shader = THREE.HaloShader;
	var uniforms = THREE.UniformsUtils.clone( shader.uniforms );

	var geometry = new THREE.SphereGeometry( this.config.atmosphereRadius, 96, 96 );
	geometry.computeTangents();
	
	var material = new THREE.ShaderMaterial({
		uniforms: uniforms,
		vertexShader: shader.vertexShader,
		fragmentShader: shader.fragmentShader,
		transparent : true,
		side : THREE.BackSide,
		blending : THREE.AdditiveBlending,
		depthWrite: false, depthTest: true,
		lights: true
	});
	
	//material.blending = THREE.CustomBlending;
	//material.blendSrc = THREE.SrcAlphaFactor;
	//material.blendDst = THREE.OneMinusSrcAlphaFactor;
	//material.blendEquation = THREE.AddEquation;
	
	var mesh = new THREE.Mesh(geometry, material);
	mesh.flipSided = true;
	mesh.matrixAutoUpdate = false;

	mesh.receiveShadow = scope.config.initWithShadows;
	mesh.updateMatrix();
	
	this.add(mesh);
	
	
	function getRadius() {
		return scope.config.atmosphereRadius * scope.context.controls.scale;
	}
	
	function getManipulationMatrix(applyQuaternion, applyPitchAndRoll) {
		
		var radius = getRadius();
	
		var rotation = new THREE.Matrix4();
		rotation.identity();
		
		if (applyQuaternion) {
			rotation.makeRotationFromQuaternion(scope.context.controls.orientation);
		}
		
		if (applyPitchAndRoll) {
			var matrixPitch = new THREE.Matrix4();
			matrixPitch.identity().makeRotationX(-scope.context.controls._pitch);
			
			var matrixRoll = new THREE.Matrix4();
			matrixRoll.identity().makeRotationZ(scope.context.controls._roll);
			matrixRoll.multiply(matrixPitch);
			
			var translateMatrix = new THREE.Matrix4();
			translateMatrix.makeTranslation(0, 0, radius);
			rotation.multiply( translateMatrix );
			rotation.multiply( matrixRoll );
			
			translateMatrix.makeTranslation(0, 0, -radius);
			rotation.multiply( translateMatrix );
		}
		
		return rotation;
	
	}
	
	function getViewManipulation() {
		return getManipulationMatrix(true, true);
	}
	
	function getPositionManipulation() {
		return getManipulationMatrix(true, false);
	}
	
	function getDistanceToCenter() {
		var origin = new THREE.Vector3(0, 0, 0);
		var distanceToCenter = origin.distanceTo(scope.context.camera.position);
		return distanceToCenter;
	}
	
	function getDistanceToSurface() {
		return getDistanceToCenter() - getRadius();
	}
	
	function getTranslateToHorizonDistance() {
		return getDistanceToCenter() - KMG.Util.horizonDistance(scope.context, getRadius());
	}
	
	
	var pitchRotation = new THREE.Matrix4();
	var rollRotation = new THREE.Matrix4();
	
	this.update = function()
	{
		mesh.visible = this.config.displayAtmosphere;
		if (!this.config.displayAtmosphere) {
			return;
		}
		
		var r = getRadius();
		var p = this.context.controls._pitch;
		var d1 = this.context.controls.distance;
		var d2 = d1 + r * Math.cos(p);
		var h = r * Math.sin(p);
		var d3 = Math.sqrt(Math.pow(d2, 2) + Math.pow(h, 2));
		var a = Math.asin(h / d3);
		var d4 = d3 - r;
		var v = (90 * (Math.PI / 180)) - a;
		var u = a;

		var d5 = Math.sqrt(d4 * (2 * r + d4));
		var b = (90 * (Math.PI / 180)) - Math.acos(r / (r + d4));
		var e = Math.tan(b) * d3;
		
		var distToCntrHeight = Math.sqrt(Math.pow(e, 2)+Math.pow(d2, 2));
		var distPastHorizon = distToCntrHeight - d5;
		var t = Math.cos(b) * distPastHorizon;

		var f = p / 90;
		
		var angle = (b * f) + (u * (1 - f));
		
		pitchRotation.makeRotationX(this.context.controls._pitch - angle);
		rollRotation.makeRotationZ(this.context.controls._roll);
		
		mesh.position = new THREE.Vector3(0, 0, t);
		mesh.position.applyMatrix4(pitchRotation);
		mesh.position.applyMatrix4(rollRotation);
		mesh.position.applyMatrix4(getManipulationMatrix(true, false));
		mesh.updateMatrix();
		
		var pow = 1;// + (3.5 - 1) * (1 - frac);
		var scale = 1.0;//Math.pow(e / r, pow);

		var scaleXZ = scale + this.config.atmosphereScale / 100.0;
		
		// Doesn't really work this way, but visually, it's close enough
		var scaleY = (scale + this.config.atmosphereScale / 100.0) * (1.0 - this.config.flattening);

		mesh.scale.set(scaleXZ, scaleY, scaleXZ);

		var viewer = new THREE.Vector3(0, 0, d1);

		viewer.applyMatrix4(pitchRotation);
		viewer.applyMatrix4(rollRotation);
		viewer.applyMatrix4(getManipulationMatrix(true, false));

		uniforms["viewVector"].value = viewer;
		
		if (this.context.configChanged) {
			var color = new THREE.Vector4(this.config.atmosphereColor[0] / 255.0, this.config.atmosphereColor[1] / 255.0, this.config.atmosphereColor[2] / 255.0, 1.0);
			uniforms["uColor"].value = color;
			uniforms["usingDirectionalLighting"].value = (this.config.lightingType === "Directional");
		}
		
		this.rotation.z = -this.config.axialTilt * (Math.PI/180);
	};
};
KMG.HaloObject.prototype = Object.create( KMG.BaseObject.prototype );


/* File: FogObject.js */

KMG.FogObject = function ( context, config ) {
	
	var e = KMG.Util.surfaceDistance(context, config.radius);
	
	THREE.Fog.call( this, 0xAAAAAA, e, e + config.radius );
	this.config = config;
	this.context = context;
	var scope = this;

	this.uniforms = null;
	this.mesh = null;
	this.material = null;
	this.geometry = null;

	
	this.update = function()
	{
	
		var radius = this.config.radius * this.context.controls.scale;
		var distanceToCenter = KMG.Util.eyeDistanceToCenter(this.context);
		var surfaceDist = KMG.Util.surfaceDistance(this.context, this.config.radius);

		var near = distanceToCenter - radius;
		var far = KMG.Util.horizonDistance(this.context, this.config.radius);

		
		var intensityFactor = -1 * (this.config.atmosphereIntensity - 1.0);
		near = near + ((far - near) * intensityFactor);

		this.far = far;
		this.near = near;
		
		if (this.context.configChanged) {
			var color = KMG.Util.arrayToColor(this.config.atmosphereColor);
			color
			this.color = color;
			
			if (!this.config.displayAtmosphere) {
				//var color = new THREE.Color(0x000000);
				//this.color = color;
				//this.near = 0.1;
				//this.far = 100000000000;
				
			} else {
				//this.context.primaryScene.fog = this;
			}
		}
			
			
	};
};
KMG.FogObject.prototype = Object.create( THREE.Fog.prototype );

/* File: LocalStarObject.js */

KMG.DefaultLocalStarConfig = {
	localStarDistance : 1.0,
	displayLocalStar : true,
	localStarTexture : KMG.starFlares[0].name,
	localStarColor : [ 255, 255, 255 ],
	starColorAffectsPlanetLighting : true
};

KMG.LocalStarObject = function ( context, config ) {
	
	KMG.BaseObject.call( this );
	this.config = config = KMG.Util.extend(config, KMG.DefaultLocalStarConfig);
	this.context = context;
	var scope = this;
	
	
	var star = new THREE.Object3D();

	var material = new THREE.SpriteMaterial({fog : false
											, color : 0xFFFFFF
											, sizeAttenuation : false
											, transparent : true
											, blending : THREE.AdditiveBlending
											, useScreenCoordinates: false
											, depthWrite: false
											, depthTest: true
											});

	var sprite = new THREE.Sprite(material);

	star.add(sprite);
	
	this.add(star);
		
	function getPosition(type, direction) {
		var position = null;
		
		if (type === "Directional") {
			position = new THREE.Vector3(-5000.0, 0, 0);
			position.rotateY(direction*(Math.PI/180.0));
		} else {
			position = new THREE.Vector3(0, 0, 0);
		}

		return position;
	}
	
	this.update = function()
	{
		//if (!this.context.configChanged) 
		//	return;
		
		var texDefinition = KMG.TextureMap.getFlareDefinitionByName(scope.config.localStarTexture);
		var tDiffuse = (texDefinition.texture != null) ? KMG.TextureMap.loadTexture(texDefinition.texture) : null;
		tDiffuse.wrapS = tDiffuse.wrapT = THREE.ClampToEdgeWrapping;
		tDiffuse.format = THREE.RGBAFormat;
		tDiffuse.needsUpdate = true;

		var starColor = KMG.Util.arrayToColor(config.localStarColor);
		
		
		material.map = tDiffuse;
		material.color = starColor;
		
		sprite.position = getPosition(this.config.lightingType, this.config.sunlightDirection);

		sprite.scale.set( 100 * this.config.localStarDistance, 100 * this.config.localStarDistance, 1 );
		
		
		this.traverse(function(obj) {
			obj.visible = scope.config.displayLocalStar;
		});
		
		sprite.updateMatrix();
		star.updateMatrix();
	};
	this.update();
};
KMG.LocalStarObject.prototype = Object.create( KMG.BaseObject.prototype );



/* File: LensFlareObject.js */

KMG.DefaultLensFlareConfig = {
	lensFlareEnabled : false
};

/**
 * Shamelessly copied from http://threejs.org/examples/webgl_lensflares.html
 */
KMG.LensFlareObject = function ( context, config ) {
	
	KMG.BaseObject.call( this );
	this.config = config = KMG.Util.extend(config, KMG.DefaultLensFlareConfig);
	this.context = context;
	var scope = this;

	
	// Create Stuff
	// See http://planetmaker.wthr.us/img/LICENSE.txt
	var textureFlare1 = KMG.TextureMap.loadTexture( "/img/lensflare1.png" );
	var textureFlare2 = KMG.TextureMap.loadTexture( "/img/lensflare2.png" );
	var textureFlare3 = KMG.TextureMap.loadTexture( "/img/lensflare3.png" );
	
	var lensFlare = new THREE.LensFlare( textureFlare1, 1000, 1.0, THREE.AdditiveBlending, 0xFFFFFF );
	
	lensFlare.add( textureFlare2, 512, 0.0, THREE.AdditiveBlending );
	lensFlare.add( textureFlare3, 60, 0.6, THREE.AdditiveBlending );
	lensFlare.add( textureFlare3, 70, 0.7, THREE.AdditiveBlending );
	lensFlare.add( textureFlare3, 120, 0.9, THREE.AdditiveBlending );
	lensFlare.add( textureFlare3, 70, 1.0, THREE.AdditiveBlending );

	this.lensFlare = lensFlare;
	
	this.add(lensFlare);
	
	this.update = function()
	{
		if (!this.context.configChanged) 
			return;
		
		
		this.lensFlare.traverse(function(obj) {
			obj.visible = scope.config.lensFlareEnabled;
		});
		
		if (!this.config.lensFlareEnabled) {
			this.remove(this.lensFlare);
			return;
		} else {
			this.add(lensFlare);
		}

		
		if (this.config.lightingType === "Directional") {
			this.lensFlare.position = new THREE.Vector3(-5000.0, 0, 0);
			this.lensFlare.position.rotateY(scope.config.sunlightDirection*(Math.PI/180.0));
		} else {
			this.lensFlare.position = new THREE.Vector3(0, 0, 0);
		}
		
		this.lensFlare.updateMatrix();

	};
};
KMG.LensFlareObject.prototype = Object.create( KMG.BaseObject.prototype );

/* File: CometObject.js */

KMG.DefaultCometObjectConfig = {
	lookingTowards : null
};

KMG.CometObject = function ( context, config, ephemeris, tickController, centerObject, lookingTowards ) {
	
	KMG.BaseObject.call( this );
	this.config = config = KMG.Util.extend(config, KMG.DefaultCometObjectConfig);
	var scope = this;
	
	this.lookingTowards = (config.lookingTowards) ? config.lookingTowards : { position: new THREE.Vector3(0, 0, 0) };
	
	var cometTexture = KMG.TextureMap.loadTexture("/img/basic-comet-3-trans.png");
	cometTexture.wrapS = cometTexture.wrapT = THREE.ClampToEdgeWrapping;
	cometTexture.format = THREE.RGBAFormat;
	cometTexture.needsUpdate = true;
	
	function createFaceMesh(rotate) {

		var geometry = new THREE.PlaneGeometry(400, 100, 10, 10);
		var materialOptions = { color: 0xFFFFFF
							, ambient : 0xFFFFFF
							, shading : THREE.NoShading
							, map : cometTexture
							, transparent : true
							, side: THREE.DoubleSide
							, blending : THREE.AdditiveBlending
							, depthWrite: false
							, depthTest: false
							};
		var mesh = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial( materialOptions ));
		
		mesh.rotation.set(rotate, KMG.RAD_90, 0, 'YXZ');
		mesh.position.z -= 160;

		return mesh;
	}

	this.add(createFaceMesh(0));
	this.add(createFaceMesh(-KMG.RAD_90));
	this.add(createFaceMesh(-KMG.RAD_45));
	this.add(createFaceMesh(KMG.RAD_45));

	this.update = function() {

		if (this.lookingTowards && this.lookingTowards.position) {
			var lookAt = this.lookingTowards.position.clone();
			this.lookAt( lookAt );
		}
		
	};
};
KMG.CometObject.prototype = Object.create( KMG.BaseObject.prototype );
	
	
/* File: MoonObject.js */

KMG.DefaultMoonConfig = {
	id : "",
	displayMoon : true,
	moonTexture : KMG.textures[12].name,
	moonColorMode : "Normal",
	moonHue : 0.5,
	moonSaturation : 0.0,
	moonLightness : 0.75,
	moonSurfaceDetail : 0.2,
	moonElevationScale : 0,
	moonShininess : 60,
	moonDiffuseIntensity : 90,
	moonSpecularIntensity : 0,
	moonAmbientIntensity : 8,
	moonEmissiveIntensity : 0,
	moonDistance : 1.0,
	moonScale : 1.0,
	moonAngle : 45,
	moonRotation : 160.0,
	shadows : false
};

KMG.MoonObject = function ( context, config ) {
	
	KMG.BaseObject.call( this );
	this.config = config = KMG.Util.extend(config, KMG.DefaultMoonConfig);
	this.context = context;
	var scope = this;
	
	var shader = KMG.ExtendedNormalMapShader;
	var uniforms = THREE.UniformsUtils.clone( shader.uniforms );
	
	var parameters = { fragmentShader: shader.fragmentShader, vertexShader: shader.vertexShader, uniforms: uniforms, lights: true, fog : false };
	var material = new THREE.ShaderMaterial( parameters );
	material.wrapAround = true;
	material.blending = THREE.AdditiveBlending;

	//var geometry = new THREE.SphereGeometry( 75, 64, 64 );
	var geometry = new THREE.IcosahedronGeometry( 75, 4 );
	geometry.computeTangents();
	
	var mesh = new THREE.Mesh( geometry, material );
	//mesh.position = new THREE.Vector3( 0, 0, -1000 );
	

	this.add(mesh);
	
	this.update = function()
	{
		if (!this.context.configChanged) 
			return;

		this.traverse(function(obj) {
			obj.visible = scope.config.displayMoon;
		});
		
		var texDefinition = KMG.TextureMap.getTextureDefinitionByName(scope.config.moonTexture);
		if (texDefinition) {
			var tDiffuse = null;
			if (texDefinition.name == "Webcam") {
				tDiffuse = texDefinition.exture;
			} else {
				tDiffuse = (texDefinition.texture) ? KMG.TextureMap.loadTexture(texDefinition.texture) : null;
			}
			
			var tNormal = (texDefinition.normalMap) ? KMG.TextureMap.loadTexture(texDefinition.normalMap) : null;
			var tSpecular = (texDefinition.specularMap) ? KMG.TextureMap.loadTexture(texDefinition.specularMap) : null;
			var tDisplacement = (texDefinition.bumpMap) ? KMG.TextureMap.loadTexture(texDefinition.bumpMap) : null;
			
			
			uniforms[ "tDiffuse" ].value = tDiffuse;
			uniforms[ "tNormal" ].value = tNormal;
			uniforms[ "tSpecular" ].value = tSpecular;

			uniforms["tDisplacement"].value = tDisplacement;
			
			if (tNormal) {
				uniforms[ "uNormalScale" ].value.set( this.config.moonSurfaceDetail, this.config.moonSurfaceDetail );
			} else {
				uniforms[ "uNormalScale" ].value.set( 0, 0 );
			}
		}
		
		var diffuseIntensity = KMG.Util.intensityToWhiteColor(this.config.moonDiffuseIntensity);
		var specularIntensity = KMG.Util.intensityToWhiteColor(this.config.moonSpecularIntensity);
		var ambientIntensity = KMG.Util.intensityToWhiteColor(this.config.moonAmbientIntensity);
		

		var diffuse = KMG.Util.intensityToWhiteColor(this.config.moonDiffuseIntensity);
		var specular = KMG.Util.intensityToWhiteColor(this.config.moonSpecularIntensity);
		var ambient = KMG.Util.intensityToWhiteColor(this.config.moonAmbientIntensity);

		uniforms[ "enableAO" ].value = false;
		uniforms[ "enableDiffuse" ].value = true;
		uniforms[ "enableCityLights" ].value = false;
		uniforms[ "enableDisplacement" ].value = true;
		
		uniforms[ "enableSpecular" ].value = (tSpecular != null);
		
		var grayScale = false;
		var inverted = false;
		switch (this.config.moonColorMode) {
		case "Normal":
			// Keep both as false
			break;
		case "Grayscale":
			grayScale = true;
			break;
		case "Inverted":
			inverted = true;
			break;
		case "Inverted Grayscale":
			grayScale = true;
			inverted = true;
			break;
		};
		
		uniforms[ "enableGrayscale" ].value = grayScale;
		uniforms[ "uInvertedColor" ].value = inverted;

		

		
		uniforms["uDisplacementScale"].value = this.config.moonElevationScale;
	
		var hslColor = new THREE.Color(0xFFFFFF);
		hslColor.setHSL(this.config.moonHue, this.config.moonSaturation, this.config.moonLightness);
		
		var hslEmissiveColor = new THREE.Color(0xFFFFFF);
		hslEmissiveColor.setHSL(this.config.moonHue, this.config.moonSaturation, this.config.moonLightness);
		hslEmissiveColor.multiplyScalar( this.config.moonEmissiveIntensity / 255.0 );
		
		uniforms[ "uDiffuseColor" ].value = hslColor;
		uniforms[ "uSpecularColor" ].value = specular ;
		uniforms[ "uAmbientColor" ].value = ambient ;
		uniforms[ "uEmissiveColor" ].value = hslEmissiveColor;
		uniforms[ "uShininess" ].value = this.config.moonShininess;
		
		uniforms[ "wrapRGB" ].value = new THREE.Vector3(this.config.moonAmbientIntensity/255, this.config.moonAmbientIntensity/255, this.config.moonAmbientIntensity/255); 
		
		mesh.rotation.set(0, this.config.moonRotation*(Math.PI/180.0), 0.0);
		mesh.scale.set(this.config.moonScale, this.config.moonScale, this.config.moonScale);
		this.position = new THREE.Vector3( 0, 0, -1000 );
		this.position.multiplyScalar(this.config.moonDistance);
		this.position.rotateY(this.config.moonAngle*(Math.PI/180.0));
		mesh.castShadow = scope.config.shadows;
		mesh.receiveShadow = scope.config.shadows;
	};
};
KMG.MoonObject.prototype = Object.create( KMG.BaseObject.prototype );

/* File: BillboardTextObject.js */


KMG.DefaultBillBoardTextConfig = {
	textColor : 0xFFFFFF,
	fillStyle : "rgba(255,255,255,0.95)",
	font : "10px sans-serif"

};

KMG.BillBoardTextObject = function(context, text, config) {
	KMG.BaseObject.call( this );
	this.config = config = KMG.Util.extend(config, KMG.DefaultBillBoardTextConfig);
	this.context = context;
	var _text = text;
	var scope = this;
	
	function createTextTexture(text, width, height) {
		var canvas1 = document.createElement('canvas');
		var context1 = canvas1.getContext('2d');
		canvas1.width = width;
		canvas1.height = height;
		context1.font = scope.config.font;
		context1.fillStyle = scope.config.fillStyle;

		context1.textAlign="center";				
		context1.fillText(text
							, canvas1.width / 2
							, canvas1.height / 2 + 20);	
		context1.fill();

		var texture1 = new THREE.Texture(canvas1) 
		texture1.needsUpdate = true;

		return texture1;
	}
	
	
	
	var geometry = new THREE.Geometry();

	var material = new THREE.ParticleBasicMaterial( { map: createTextTexture(_text, 100, 100)
													, color: this.config.textColor
													, size: 100
													, fog : false
													, sizeAttenuation : false
													, transparent : true
													, opacity : 1.0
													, blending : THREE.AdditiveBlending
													, depthWrite: false
													, depthTest: false
													} );
	var vertex = new THREE.Vector3(0, 0, 0);
	geometry.vertices.push( vertex );
	
	var particles = new THREE.ParticleSystem( geometry, material );
	this.add(particles);
	
	
	this.setText = function(text) {
		_text = text;
		material.map = createTextTexture(_text, 100, 100);
	};

	this.update = function()
	{
		if (!this.context.configChanged)
			return;
			

	};
};
KMG.BillBoardTextObject.prototype = Object.create( KMG.BaseObject.prototype );
	
	
/* File: TexturedSphereObject.js */

KMG.MaterialPhong = 1;
KMG.MaterialLambert = 2;

KMG.DefaultTexturedSphereOptions = {
	texture : "Earth - Blue Marble",
	scale : 1,
	radius : 200,
	ambient : 0x888888,
	color : 0xDDDDDD,
	emissive : 0x000000,
	material : KMG.MaterialLambert,
	specular : 0x444444,
	shadows : true,
	slices : 32

};

/** A simpler sphere for small planets or moons
 *
 */
KMG.TexturedSphereObject = function(context, config) {
	KMG.BaseObject.call( this );
	this.config = config = KMG.Util.extend(config, KMG.DefaultTexturedSphereOptions);
	this.context = context;
	var scope = this;
	
	var geometry = new THREE.SphereGeometry( this.config.radius, this.config.slices, this.config.slices );
	
	var texDefinition = KMG.TextureMap.getTextureDefinitionByName(this.config.texture);
	var tDiffuse = (texDefinition.texture) ? KMG.TextureMap.loadTexture(texDefinition.texture) : null;
	
	var material;
	
	if (this.config.material == KMG.MaterialLambert) {
		material = new THREE.MeshLambertMaterial({
									ambient		: new THREE.Color(this.config.ambient),
									color		: new THREE.Color(this.config.color),
									emissive	: new THREE.Color(this.config.emissive),
									shading		: THREE.SmoothShading,
									map			: tDiffuse,
									fog			: this.config.fog
								});
	} else if (this.config.material == KMG.MaterialPhong) {
		var tSpecular = (texDefinition.specularMap) ? KMG.TextureMap.loadTexture(texDefinition.specularMap) : null;
		material = new THREE.MeshPhongMaterial({
									ambient		: new THREE.Color(this.config.ambient),
									color		: new THREE.Color(this.config.color),
									emissive	: new THREE.Color(this.config.emissive),
									specular	: new THREE.Color(this.config.specular),
									shading		: THREE.SmoothShading,
									map			: tDiffuse,
									specularMap	: tSpecular,
									fog			: this.config.fog
								});
	} 
								
	var mesh = new THREE.Mesh( geometry, material );
	mesh.position = new THREE.Vector3( 0, 0, 0 );
	
	
	this.add(mesh);
		
	
	this.sphereMesh = mesh;
	
	this.update = function()
	{
		if (!this.context.configChanged)
			return;
		
		this.scale.set(this.config.scale, this.config.scale, this.config.scale);
		mesh.castShadow = scope.config.shadows;
		mesh.receiveShadow = scope.config.shadows;
	};
};
KMG.TexturedSphereObject.prototype = Object.create( KMG.BaseObject.prototype );
	
	

/* File: SunObject.js */
KMG.DefaultSunOptions = {
	texture : "Sun",
	scale : 1,
	radius : 200,
	coronaRadius : -1,
	ambient : 0xFFFFFF,
	color : 0xDDDDDD,
	emissive : 0xFFFFFF,
	material : KMG.MaterialLambert,
	specular : 0x000000,
	shadows : false,
	coronaTexture : "/img/sparkle.png"
};


KMG.SunObject = function(context, config) {
	KMG.BaseObject.call( this );
	this.config = config = KMG.Util.extend(config, KMG.DefaultSunOptions);
	this.context = context;
	var scope = this;
	
	var tDiffuse = KMG.TextureMap.loadTexture(config.coronaTexture);
	
	tDiffuse.wrapS = tDiffuse.wrapT = THREE.ClampToEdgeWrapping;
	tDiffuse.format = THREE.RGBAFormat;
	
	var coronaRadius = (config.coronaRadius > 0) ? config.coronaRadius : config.radius * 2 * 20;
	console.info(coronaRadius);
	var geometry = new THREE.Geometry();
	 
	var material = new THREE.SpriteMaterial({fog : false
											, map : tDiffuse
											, color : 0xFFFFFF
											, sizeAttenuation : true
											, transparent : false
											, blending : THREE.AdditiveBlending
											, useScreenCoordinates: false
											, depthWrite: false
											, depthTest: true
											});

	var sprite = new THREE.Sprite(material);
	sprite.scale.set(coronaRadius, coronaRadius, coronaRadius);
	this.add(sprite);
	
	/*
	var material = new THREE.ParticleBasicMaterial( { map : tDiffuse
													, color: 0xFFFA70
													, size: coronaRadius // This is stupid
													, fog : false
													, sizeAttenuation : true
													, transparent : true
													, opacity : 1.0
													, blending : THREE.AdditiveBlending
													, depthWrite: false
													, depthTest: true
													} );
	var vertex = new THREE.Vector3(0, 0, 0);
	geometry.vertices.push( vertex );
	particles = new THREE.ParticleSystem( geometry, material );
	
	this.add(particles);
	*/
	
	
	var sunSphere = new KMG.TexturedSphereObject(context, this.config);
	this.add(sunSphere);
	
	

	
	
	this.update = function()
	{
		if (!this.context.configChanged)
			return;
		
		
		
		material.map = tDiffuse;
	};
	
};
KMG.SunObject.prototype = Object.create( KMG.BaseObject.prototype );
	

/* File: AxisLinesObject.js */
KMG.DefaultAxisLinesConfig = {
	radius: 200,
	ringRadius: 200,
	ringWidth : 5
};


KMG.AxisLinesObject = function(context, config) {
	KMG.BaseObject.call( this );
	this.config = config = KMG.Util.extend(config, KMG.DefaultAxisLinesConfig);
	this.context = context;
	var scope = this;
	

	var tex = KMG.TextureMap.loadTexture("/img/BrushedMetal.jpg");
	tex.format = THREE.RGBAFormat;
	
	function createLine(length, width) {
		var line = new THREE.Mesh( new THREE.CylinderGeometry(width*.5, width*.5, length*2, 360, 1, false),
								 new THREE.MeshLambertMaterial({
										ambient		: 0x444444,
										color		: 0xAAAAAA,
										specular	: 0xEEEEEE,
										shininess	: 150, 
										shading		: THREE.SmoothShading,
										transparent: false,
										side: THREE.DoubleSide,
										map : tex,
										fog : false,
										opacity : 1.0
									}) );
		line.castShadow = false;
		line.receiveShadow = false;
		return line;
	}
	
	var radius = (config.radius) ? config.radius : 2200 * modelOptions.kmScalar;
	
	var axisLineY = createLine(radius, config.ringWidth);
	this.add(axisLineY);
	
	var axisLineX = createLine(radius, config.ringWidth);
	axisLineX.rotation.x = KMG.RAD_90;
	this.add(axisLineX);
	
	var axisLineZ = createLine(radius, config.ringWidth);
	axisLineZ.rotation.z = KMG.RAD_90;
	this.add(axisLineZ);

	function createAxisRing(radius, ringWidth) {
		
		var ring = new THREE.Object3D();
			
		
		ring.add(new THREE.Mesh( new THREE.CylinderGeometry(radius, radius, ringWidth, 360, 1, true),
								 new THREE.MeshLambertMaterial({
										ambient		: 0x444444,
										color		: 0xAAAAAA,
										specular	: 0xC0C0C0,
										shininess	: 150, 
										shading		: THREE.SmoothShading,
										transparent: false,
										side: THREE.FrontSide,
										fog : false,
										map : tex,
										opacity : 1.0
									}) ));
		
		ring.add(new THREE.Mesh( new THREE.CylinderGeometry(radius*0.98, radius*0.98, ringWidth, 360, 1, true),
								 new THREE.MeshLambertMaterial({
										ambient		: 0x444444,
										color		: 0xAAAAAA,
										specular	: 0xC0C0C0,
										shininess	: 150, 
										shading		: THREE.SmoothShading,
										transparent: false,
										side: THREE.BackSide,
										fog : false,
										map : tex,
										opacity : 1.0
									}) ));
								
									
		var material = new THREE.MeshLambertMaterial({
									ambient		: 0x444444,
									color		: 0xAAAAAA,
									specular	: 0xC0C0C0,
									shininess	: 150, 
									shading		: THREE.SmoothShading,
									specular	: 0xC0C0C0,
									transparent: false,
									side: THREE.FrontSide,
									fog : false,
									map : tex,
									opacity : 1.0
									
								});

		var geometry = new THREE.RingGeometry2( radius*0.98, radius, 180, 1, 0, Math.PI * 2);
		geometry.computeFaceNormals();
		
		var mesh = new THREE.Mesh( geometry, material );
		mesh.rotation.x = KMG.RAD_90;
		mesh.position.y = -ringWidth * 0.5;
		ring.add(mesh);
		
		
		var material = new THREE.MeshLambertMaterial({
									ambient		: 0x444444,
									color		: 0xAAAAAA,
									specular	: 0xC0C0C0,
									shininess	: 150, 
									shading		: THREE.SmoothShading,
									specular	: 0xC0C0C0,
									transparent: false,
									side: THREE.BackSide,
									fog : false,
									map : tex,
									opacity : 1.0
									
								});
								
		var geometry = new THREE.RingGeometry2( radius*0.98, radius, 180, 1, 0, Math.PI * 2);
		geometry.computeFaceNormals();
		
		var mesh = new THREE.Mesh( geometry, material );
		mesh.rotation.x = KMG.RAD_90;
		mesh.position.y = ringWidth * 0.5;
		ring.add(mesh);
		
		
		
		
		return ring;
	}

	
	var xRing = createAxisRing(config.ringRadius, config.ringWidth);
	xRing.rotation.z = KMG.RAD_90;
	this.add(xRing);
	
	
	var zRing = createAxisRing(config.ringRadius, config.ringWidth);
	zRing.rotation.x = KMG.RAD_90;
	this.add(zRing);
	
	
	var yRing = createAxisRing(config.ringRadius, config.ringWidth);
	this.add(yRing);
	
	
	this.setShadowInteraction(false);

	this.update = function()
	{
		if (!this.context.configChanged)
			return;
			
	}
};
KMG.AxisLinesObject.prototype = Object.create( KMG.BaseObject.prototype );

/* File: OrbitLineShader.js */

KMG.OrbitLineShader = {

	uniforms: THREE.UniformsUtils.merge( [
		{
			"uThickness" : { type: "f", value: 2.0 },
			"alpha": { type: "f", value: 1.0 },
			"color" : { type: "v3", value: new THREE.Vector3( 1, 1, 1 ) },
		}]),

	vertexShader: [
		'uniform float alpha;',
		'varying float vAlpha;',
		'uniform float uThickness;',
		'void main() {',
		'	vAlpha = alpha;',
		'	gl_PointSize = uThickness;',
		'	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
		'}'
	].join("\n"),

	fragmentShader: [

		'uniform vec3 color;',
		'varying float vAlpha;',
		'varying float uThickness;',
		'void main() {',
		'	gl_FragColor = vec4( color, vAlpha );',
		'}'
	].join("\n")

};



/* File: OrbitPathLine.js */


KMG.DefaultBasicOrbitPathLineConfig = {

	distance : 1.0,
	opacity : 0.75,
	transparent : true,
	color : [ 255, 255, 255 ]

};

KMG.BasicOrbitPathLine = function ( context, config) {
	
	KMG.BaseObject.call( this );
	this.config = config = KMG.Util.extend(config, KMG.DefaultBasicOrbitPathLineConfig);
	this.context = context;
	var scope = this;

	var segments = 60;
	var radius = 1000;
	var size = 360 / segments;

	var geometry = new THREE.Geometry();

	for ( var i = 0; i <= segments; i ++ ) {
		var segment = ( i * size ) * Math.PI / 180;
		geometry.vertices.push( new THREE.Vector3( Math.cos( segment ) * radius, 0, Math.sin( segment ) * radius )  );
	}
	
	var material = new THREE.LineBasicMaterial( { opacity: config.opacity, transparent : config.transparent, fog : false, linewidth: 1 } );
	
	var line = new THREE.Line( geometry,  material);
	line.position.set( 0, 0, 0 );

	this.add( line );
	
	
	this.update = function()
	{
		if (!this.context.configChanged) 
			return;
		
		var color = KMG.Util.arrayToColor(config.color);
		material.color = color;
		material.opacity = config.opacity;
		
		line.scale.set( config.distance, config.distance, config.distance );
	};
};
KMG.BasicOrbitPathLine.prototype = Object.create( KMG.BaseObject.prototype );


KMG.DefaultOrbitPathLineConfig = {
	scale : 5,
	opacity : 0.55,
	transparent : true,
	color : 0xFFFFFF,
	segments : 100,
	closeOrbit : true,
	subdivisions : 12,
	lineThickness : 1.0
};
KMG.DefaultOrbitPathLineConfig = KMG.Util.extend(KMG.DefaultOrbitPathLineConfig, KMG.OrbitDefinitions.template);

KMG.OrbitPathLine = function ( context, config, orbit, centerObject, start /* Julian Days */, stop /* Julian Days */) {
	
	KMG.BaseObject.call( this );
	this.config = config = KMG.Util.extend(config, KMG.DefaultOrbitPathLineConfig);
	this.context = context;
	var scope = this;
	
	this.centerObject = centerObject;
	

	var julianPeriod = orbit.period;
	
	var epoch = (orbit.epoch) ? orbit.epoch : 2451545;
	var startTime = (start) ? start : epoch;
	var stopTime = (stop) ? stop : startTime + julianPeriod;
	
	
	var segments = config.segments;
	var d = (stopTime - startTime) / segments;
	var geometry = new THREE.Geometry();
	
	var first = null;
	
	var curve = new THREE.CurvePath();
	var points = [];
	for (var t = startTime; t <= stopTime; t += d) {
		var p = orbit.positionAtTime(t);
		points.push(p);
		if (!first) {
			first = p;
		}
	}
	
	if (config.closeOrbit) {
		points.push(first);
	}
	
	var spline = new THREE.Spline( points );
	for ( i = 0; i < points.length * config.subdivisions; i ++ ) {
		var index = i / ( points.length * config.subdivisions );
		var position = spline.getPoint( index );
		geometry.vertices[ i ] = new THREE.Vector3( position.x, position.y, position.z );
	
	}
	
	/*
	var shader = KMG.OrbitLineShader;
	var uniforms = THREE.UniformsUtils.clone( shader.uniforms );

	uniforms[ "color" ].value = KMG.Util.rgbToArray( config.color);
	uniforms[ "uThickness" ].value = config.lineThickness;
	uniforms[ "alpha" ].value = config.opacity;
	var attributes = { };
	
	var material = new THREE.ShaderMaterial( {
				uniforms:       uniforms,
				attributes:     attributes,
				vertexShader: shader.vertexShader,
				fragmentShader: shader.fragmentShader,
				transparent : true
			});
	*/
	
	var material = new THREE.LineBasicMaterial( { opacity: config.opacity, transparent : true, fog : false, color : config.color, linewidth: config.lineThickness } );
	var line = new THREE.Line( geometry,  material, THREE.LineStrip);
	line.position.set( 0, 0, 0 );
	line.scale.set( config.scale, config.scale, config.scale );	
	this.add( line );

	this.lineMaterial = material;

	this.update = function()
	{
		if (scope.centerObject) {
			var centerPosition = scope.centerObject.position.clone();
			this.position = centerPosition;
		}
		
		if (!this.context.configChanged) 
			return;
		
		//uniforms[ "color" ].value = KMG.Util.rgbToArray( config.color);
		//uniforms[ "alpha" ].value = config.opacity;
		
		this.traverse(function(obj) {
			obj.visible = (config.opacity != 0);
		});

		line.scale.set( config.scale, config.scale, config.scale );	
	};
};
KMG.OrbitPathLine.prototype = Object.create( KMG.BaseObject.prototype );











/* File: VectorPathLine.js */
KMG.DefaultVectorPathLineConfig = {
	scale : 5,
	opacity : 0.75,
	transparent : true,
	color : 0xFFFFFF,
	segments : 100,
	subdivisions : 12,
	lineThickness : 1.0
};


/**
 * Vectors: an array of objects containing x/y/z values in terms of AU
 */
KMG.VectorPathLine = function ( context, config, centerObject, vectors ) {
	
	KMG.BaseObject.call( this );
	this.config = config = KMG.Util.extend(config, KMG.DefaultVectorPathLineConfig);
	this.context = context;
	var scope = this;
	this.centerObject = centerObject;
	
	
	
	var geometry = new THREE.Geometry();
	var points = [];
	console.info("Adding " + vectors.length + " vectors");
	for (var i = 0; i < vectors.length; i++) {
		var vector = vectors[i];
		points.push(new THREE.Vector3(vector.x, vector.z, -vector.y));
	}

	var spline = new THREE.Spline( points );
	for ( i = 0; i < points.length * config.subdivisions; i ++ ) {
		var index = i / ( points.length * config.subdivisions );
		var position = spline.getPoint( index );
		geometry.vertices[ i ] = new THREE.Vector3( position.x, position.y, position.z );
	
	}
	
	var material = new THREE.LineBasicMaterial( { opacity: config.opacity, transparent : true, fog : false, color : config.color, linewidth:config.lineThickness } );
	var line = new THREE.Line( geometry,  material);
	line.position.set( 0, 0, 0 );
	line.scale.set( config.scale, config.scale, config.scale );	
	this.add( line );
	
	
	
	
	this.update = function()
	{
		if (!this.context.configChanged) 
			return;

		if (scope.centerObject) {
			var centerPosition = scope.centerObject.position.clone();
			this.position = centerPosition;
		}
	};

};
KMG.VectorPathLine.prototype = Object.create( KMG.BaseObject.prototype );

/* File: BasicAsteroidBeltObject.js */

KMG.DefaultBasicAsteroidBeltConfig = {

	innerRadius : 260.0,
	outterRadius : 400.0,
	quantity : 2000,
	sizeAttenuation : true,
	size : 2,
	color : 0xFFFFFF,
	hue : 0.5,
	saturation : 0.0,
	lightness : 0.75,
	targetObject : 0
};


KMG.BasicAsteroidBeltObject = function ( context, config ) {
	
	KMG.BaseObject.call( this );
	
	
	this.config = config = KMG.Util.extend(config, KMG.DefaultBasicAsteroidBeltConfig);
	this.context = context;
	var scope = this;
	
	var lastBeltObject = null;
	
	function createBelt3dObject()
	{
		var innerRadius = config.innerRadius;
		var outterRadius = config.outterRadius;
		var quantity = config.quantity;
		
		var belt = new THREE.Object3D();
		
		var particleTexture = KMG.TextureMap.loadTexture('img/star_particle.png');
		particleTexture.wrapS = particleTexture.wrapT = THREE.ClampToEdgeWrapping;
		particleTexture.format = THREE.RGBAFormat;
		
		var particles, geometry, material, parameters, i, h, color;
		
		var hslColor = new THREE.Color(config.color);
		hslColor.setHSL(config.hue, config.saturation, config.lightness);
		
		geometry = new THREE.Geometry();
		material = new THREE.ParticleBasicMaterial( { color: hslColor
														, size: config.size
														, map: particleTexture
														, fog : false
														, sizeAttenuation : config.sizeAttenuation
														, transparent : true
														, blending : THREE.AdditiveBlending
														} );

		for ( i = 0; i < quantity; i ++ ) {
			var u = Math.random() * 360.0;
			var v = Math.random() * 180.0;
			
			var radius = innerRadius + (outterRadius - innerRadius) * Math.random();
			
			var vertex = new THREE.Vector3(0, 0, radius);
			vertex.rotateY(Math.random() * 360.0 *(Math.PI/180.0));
			geometry.vertices.push( vertex );
		
		}
		
		particles = new THREE.ParticleSystem( geometry, material );
			
		belt.add( particles );
	
		return belt;
	}
	
	
	
	
	
	this.update = function()
	{
		if (!this.context.configChanged) 
			return;
		
		if (lastBeltObject) {
			this.remove(lastBeltObject);
		}
		lastBeltObject = createBelt3dObject();
		this.add(lastBeltObject);	
		
		if (scope.config.targetObject) {
			this.position = scope.config.targetObject.position.clone();
		}
	};
	this.update();
};
KMG.BasicAsteroidBeltObject.prototype = Object.create( KMG.BaseObject.prototype );
/* File: DotPlotObject.js */

KMG.DefaultDotPlotConfig = {
	opacity : 1.0,
	color : 0xFFFFFF,
	texture : 'img/star_particle.png',
	size : 4

};

KMG.DotPlotObject = function(context, config) {
	KMG.BaseObject.call( this );
	this.config = config = KMG.Util.extend(config, KMG.DefaultDotPlotConfig);
	this.context = context;
	var scope = this;
	
	var particleTexture = KMG.TextureMap.loadTexture(config.texture);
	particleTexture.wrapS = particleTexture.wrapT = THREE.ClampToEdgeWrapping;
	particleTexture.format = THREE.RGBAFormat;
	
	
	var  particles, geometry, material, parameters, i, h, color;
		
	geometry = new THREE.Geometry();

	material = new THREE.ParticleBasicMaterial( { map: particleTexture
													, color: config.color
													, size: config.size
													, fog : false
													, sizeAttenuation : false
													, transparent : true
													, opacity : 1.0
													, blending : THREE.AdditiveBlending
													, depthWrite: false
													, depthTest: true
													} );
	var vertex = new THREE.Vector3(0, 0, 0);
	geometry.vertices.push( vertex );
	
	particles = new THREE.ParticleSystem( geometry, material );
	
	this.material = material;
	
	this.add( particles );

	this.update = function()
	{
		if (!this.context.configChanged)
			return;
			
		//material.color = new THREE.Color(config.color);
		
		this.traverse(function(obj) {
			obj.visible = (config.opacity != 0);
		});
	};
};
KMG.DotPlotObject.prototype = Object.create( KMG.BaseObject.prototype );

/* File: StandardComposer.js */

KMG.StraightThroughRenderPass = function(scene, camera) {

	this.enabled = true;
	this.clear = true;
	this.needsSwap = false;
	
	this.render = function( renderer, writeBuffer, readBuffer, delta ) {
		renderer.render( scene, camera );
	}
};

KMG.StandardComposer = function(context, scene, camera, renderer) {

	THREE.EffectComposer.call( this, renderer );
	
	var scope = this;
	
	var renderPass = new KMG.StraightThroughRenderPass( scene, camera );
	this.addPass( renderPass );

	
	this.update = function() {
	
	
	};


};
KMG.StandardComposer.prototype = Object.create( THREE.EffectComposer.prototype );

/* File: FilmPassComposer.js */

KMG.DefaultFilmPassOptions = {
	noiseIntensity : 0.35,
	scanlinesIntensity : 0.75,
	scanlinesCount : 2048,
	grayscale : false
};


KMG.FilmPassComposer = function(context, scene, camera, renderer, config) {

	THREE.EffectComposer.call( this, renderer );
	this.config = config = KMG.Util.extend((config) ? config : {}, KMG.DefaultFilmPassOptions);
	var scope = this;
	
	var renderPass = new THREE.RenderPass( scene, camera );
	var effectFilm = new THREE.FilmPass( config.noiseIntensity, config.scanlinesIntensity, config.scanlinesCount, config.grayscale );
	effectFilm.renderToScreen = true;

	this.addPass( renderPass );
	this.addPass( effectFilm );
	
	
	this.update = function() {
	
	
	};
	

};

KMG.FilmPassComposer.prototype = Object.create( THREE.EffectComposer.prototype );
/* File: BlurPassComposer.js */

KMG.DefaultBlurPassOptions = {
	hBlurAmount : 0.5,
	vBlurAmount : 0.5
};

KMG.BlurPassComposer = function(context, scene, camera, renderer, config) {

	THREE.EffectComposer.call( this, renderer );
	this.config = config = KMG.Util.extend((config) ? config : {}, KMG.DefaultBlurPassOptions);
	var scope = this;
	
	var renderPass = new THREE.RenderPass( scene, camera );
	
	var width = window.innerWidth || 2;
	var height = window.innerHeight || 2;
	
	var effectHBlur = new THREE.ShaderPass( THREE.HorizontalBlurShader );
	var effectVBlur = new THREE.ShaderPass( THREE.VerticalBlurShader );
	effectHBlur.uniforms[ 'h' ].value = config.hBlurAmount / ( width / 2 );
	effectVBlur.uniforms[ 'v' ].value = config.vBlurAmount / ( height / 2 );
	effectVBlur.renderToScreen = true;
	
	this.addPass( renderPass );
	this.addPass( effectHBlur );
	this.addPass( effectVBlur );
	
	this.update = function() {
		
		effectHBlur.uniforms[ 'h' ].value = config.hBlurAmount / ( width / 2 );
		effectVBlur.uniforms[ 'v' ].value = config.vBlurAmount / ( height / 2 );
	
	};
	

};

KMG.BlurPassComposer.prototype = Object.create( THREE.EffectComposer.prototype );
/* File: DynamicEffectsComposer.js */

KMG.DefaultEffectsConfig = {

	enableGodRays : false,
	godRaysIntensity : 0.75,
	
	enableBlur : false,
	blurAmount : 0.5,
	
	enableBloom : false,
	bloomStrength : 0.5,
	
	enableBleach : false,
	bleachAmount : 0.95,
	
	enableSepia : false,
	sepiaAmount : 0.9,
	
	enableFilm : false,
	noiseIntensity : 0.35,
	scanlinesIntensity : 0.75,
	scanlinesCount : 2048,
	filmGrayscale : false
};


KMG.DynamicEffectsComposer = function(context, scene, camera, secondaryCamera, renderer, config) {

	THREE.EffectComposer.call( this, renderer );
	this.context = context;
	this.config = config = KMG.Util.extend(config, KMG.DefaultEffectsConfig);
	var scope = this;
	
	//var fxaaShader = THREE.FXAAShader;
	//var effectFXAA = new THREE.ShaderPass( fxaaShader );
	
	var shaderBleach = THREE.BleachBypassShader;
	var effectBleach = new THREE.ShaderPass( shaderBleach );
	
	var shaderSepia = THREE.SepiaShader;
	var effectSepia = new THREE.ShaderPass( shaderSepia );
	effectSepia.uniforms[ "amount" ].value = 0.9;
	
	//var godRaysPass = new THREE.GodRaysPass(config, context.primaryScene, context.secondaryScene, camera);
	var renderBackgroundPass = new THREE.RenderPass( [context.secondaryScene], secondaryCamera );
	var renderPass = new THREE.RenderPass( context.primaryScene, camera);
	renderPass.clear = false;
	
	var effectHBlur = new THREE.ShaderPass( THREE.HorizontalBlurShader );
	var effectVBlur = new THREE.ShaderPass( THREE.VerticalBlurShader );
	//var effectDotScreen = new THREE.DotScreenPass( new THREE.Vector2( 0, 0 ), 0.5, 0.8 );
	var effectBloom = new THREE.BloomPass(0.5);
	var effectFilm = new THREE.FilmPass( config.noiseIntensity, config.scanlinesIntensity, config.scanlinesCount, config.grayscale );
	effectFilm.renderToScreen = true;
	//effectFXAA.renderToScreen = true;
	
	this.addPass( renderBackgroundPass );
	this.addPass( renderPass );
	//this.addPass( effectFXAA );
	//this.addPass( godRaysPass );

	this.addPass( effectBleach );
	this.addPass( effectBloom );
	this.addPass( effectHBlur );
	this.addPass( effectVBlur );
	this.addPass( effectSepia );
	this.addPass( effectFilm );
	
	
	//this.addPass( effectDotScreen );
	
	this.update = function() {
	
		if (!this.context.configChanged) 
			return;
		
		var width = window.innerWidth || 2;
		var height = window.innerHeight || 2;
		
		//renderPass.enabled = !this.config.enableGodRays;
		//godRaysPass.enabled = this.config.enableGodRays;
		
		//effectFXAA.uniforms["resolution"].value.x = 1 / width;
		//effectFXAA.uniforms["resolution"].value.y = 1 / height;
		
		//godRaysPass.setIntensity(this.config.godRaysIntensity);
		
		effectHBlur.enabled = this.config.enableBlur;
		effectVBlur.enabled = this.config.enableBlur;
		var blurAmount = (this.config.enableBlur) ? this.config.blurAmount : 0;
		effectHBlur.uniforms[ 'h' ].value = blurAmount / ( width / 2 );
		effectVBlur.uniforms[ 'v' ].value = blurAmount / ( height / 2 );
		
		
		effectBloom.enabled = this.config.enableBloom;
		var bloomStrength = (this.config.enableBloom) ? this.config.bloomStrength : 0;
		effectBloom.copyUniforms["opacity"].value = bloomStrength;
		
		effectBleach.enabled = this.config.enableBleach;
		var bleachAmount = (this.config.enableBleach) ? this.config.bleachAmount : 0;
		effectBleach.uniforms[ "opacity" ].value = bleachAmount;
	
		
		effectSepia.enabled = this.config.enableSepia;
		effectSepia.uniforms[ "amount" ].value = (this.config.enableSepia) ? this.config.sepiaAmount : 0;
		
		//effectFilm.enabled = this.config.enableFilm;
		effectFilm.uniforms.grayscale.value = (this.config.enableFilm) ? this.config.filmGrayscale : false;
		effectFilm.uniforms.nIntensity.value = (this.config.enableFilm) ? this.config.noiseIntensity : 0;
		effectFilm.uniforms.sIntensity.value = (this.config.enableFilm) ? this.config.scanlinesIntensity : 0;
		effectFilm.uniforms.sCount.value = (this.config.enableFilm) ? this.config.scanlinesCount : 0;
	};


};
KMG.DynamicEffectsComposer.prototype = Object.create( THREE.EffectComposer.prototype );
/* File: Engine.js */


KMG.SCENE = { NONE : -1, PRIMARY : 0, SECONDARY : 1 };

KMG.Engine = function ( domElement, config, sceneCallbacks, cameraConfig, view ) {

	this.config = config;
	this.sceneCallbacks = sceneCallbacks;
	this.cameraConfig = cameraConfig;
	this.domElement = ( domElement !== undefined ) ? domElement : document;
	
	
	
	this.context = {
		composer : null,
		container : null, 
		stats : null,
		camera : null, 
		secondaryCamera : null,
		primaryScene : null,
		secondaryScene : null,
		renderer : null,
		controls : null,
		windowHalfX : window.innerWidth / 2,
		windowHalfY : window.innerHeight / 2,
		containerWidth : 0,
		containerHeight : 0,
		objects : [],
		configChanged : true,
		moons : [],
		animationID : 0,
		script : null,
		background : null,
		lights : {
			ambient : null,
			primaryDirectional : null,
			secondaryDirectional : null,
			primaryPoint : null,
			secondaryPoint : null
		}
	};
	
	this.animators = [];
	
	this.stopAnimation = false;
	
	// Internals
	var scope = this;
	
	this.reset = function()
	{
	
	};
	
	
	
	function onWindowResize() 
	{
		scope.context.windowHalfX = $("#container").width() / 2;
		scope.context.windowHalfY = $("#container").height() / 2;
		
		scope.context.containerWidth = $("#container").width();
		scope.context.containerHeight = $("#container").height();
		
		scope.context.camera.aspect = $("#container").width() / $("#container").height();
		scope.context.camera.updateProjectionMatrix();

		scope.context.renderer.setSize( $("#container").width(), $("#container").height() );
	
		//scope.context.composer.reset();
	}
	
	function onDocumentMouseMove( event ) 
	{
		scope.context.mouseX = ( event.clientX - scope.context.windowHalfX );
		scope.context.mouseY = ( event.clientY - scope.context.windowHalfY );
	}
	
	this.start = function()
	{
		animate();
	};
	
	this.stop = function()
	{
		this.stopAnimation = true;
	
	};
	
	function checkGlError()
	{
		var err = scope.context.renderer.getContext().getError();
		if (err !== 0) {
			onWebGlException("WebGL Error Code " + err);
		}
	}
	
	function onWebGlException(ex)
	{
		if (scope.sceneCallbacks.webGlErrorCallback) {
			scope.sceneCallbacks.webGlErrorCallback(ex);
		}
	}
	

	
	function animate() 
	{	

		if (scope.stopAnimation) {
			scope.stopAnimation = false;
			
			if (scope.sceneCallbacks.animationStoppedCallback) {
				scope.sceneCallbacks.animationStoppedCallback();
			}
			
			return;
		}
		

		scope.context.animationID = requestAnimationFrame( animate );
		
		if (scope.config.useScript && fireOnFrameHandler()) {
			scope.context.configChanged = true;
		}
		
		
		for (var i = 0; i < scope.animators.length; i++) {
			var animator = scope.animators[i];
			animator.next();
		}

		scope.context.controls.update();
		
		
		if (scope.config.enableFps && scope.context.stats) {
			scope.context.stats.update();
		}
		

		render();
	}
	
	
	function updateDirectionalLight(configChanged, light)
	{
		
		if (scope.config.realtimeSunlight) {
			var positioner = new KMG.SunlightPositioning();
			
			// I'm not sure this is 100% correct... Need more validation...
			var sunlightDateTime = new Date(scope.config.sunlightDate);
			
			var position = positioner.getSunPositionOnDate(sunlightDateTime);
			light.position = position;
		}
	
		if (configChanged) {
			
			if (scope.config.lightingType === "Point") {
				light.intensity = 0.0;
				return;
			} else {
				light.intensity = 2.0;
			}
			
			
		
			var localStarLightColor = null;
			
			if (config.starColorAffectsPlanetLighting) {
				localStarLightColor = KMG.Util.arrayToColor(config.localStarColor);
			} else {
				localStarLightColor = new THREE.Color(0xFFFFFF);
			}
			light.color = localStarLightColor;
			
			if (!scope.config.realtimeSunlight) {
				light.position = new THREE.Vector3(-10000.0, 0, 0);
				light.position.rotateY(scope.config.sunlightDirection*(Math.PI/180.0)).normalize();
			}
				
			light.castShadow = scope.config.shadows;
				
			light.shadowDarkness = scope.config.shadowDarkness;
			light.updateMatrix();
		}
	
		
	}
	
	function updatePointLight(configChanged, light)
	{
		if (configChanged) {
			
			if (scope.config.lightingType === "Directional") {
				light.intensity = 0.0;
				return;
			} else {
				light.intensity = 2.0;
			}
			
			
			
			var localStarLightColor = null;
			
			if (config.starColorAffectsPlanetLighting) {
				localStarLightColor = KMG.Util.arrayToColor(config.localStarColor);
			} else {
				localStarLightColor = new THREE.Color(0xFFFFFF);
			}
			light.color = localStarLightColor;
		}

	}
	
	function updateLights(configChanged)
	{
		updateDirectionalLight(configChanged, scope.context.lights.primaryDirectional);
		updateDirectionalLight(configChanged, scope.context.lights.secondaryDirectional);
		updatePointLight(configChanged, scope.context.lights.primaryPoint);
		updatePointLight(configChanged, scope.context.lights.secondaryPoint);
	}
	
	function updateShadows()
	{
		if (!scope.context.configChanged) {
			return;
		}
		
		scope.context.renderer.shadowMapEnabled = scope.config.shadows;
		scope.context.renderer.shadowMapAutoUpdate = scope.config.shadows;
		
		if (!scope.config.shadows) {
			for (var i = 0; i < scope.context.lights.length; i++) {
				scope.context.renderer.clearTarget( scope.context.lights[i].shadowMap );
			}
		}
	}
	
	function areEffectsEnabled() {
		return (scope.config.enableBlur
			|| scope.config.enableBloom
			|| scope.config.enableBleach
			|| scope.config.enableFilm
			|| scope.config.enableSepia);
	}
	
	function render() 
	{	
	
		if (scope.config.ringAngle + scope.config.axialTilt > 0.0) {
			renderer.shadowMapCullFace = THREE.CullFaceFront;
		} else {
			renderer.shadowMapCullFace = THREE.CullFaceBack;
		}
		
		if (scope.context.configChanged) {
			for (var i = 0; i < scope.context.moons.length; i++) {
				scope.context.moons[i].config.shadows = scope.config.shadows;
			}
		}
		
		updateShadows();
		
		scope.context.containerWidth = $("#container").width();
		scope.context.containerHeight = $("#container").height();
		KMG.TextureMap.textureResolution = scope.config.textureResolution;

		updateLights(scope.context.configChanged);
		
		for (var i = 0; i < scope.context.objects.length; i++) {
			scope.context.objects[i].update();
		}
		
		scope.context.configChanged = false;

		var time = Date.now() * 0.0004;
		
		if (scope.config.useScript) {
			fireOnRenderHandler();
		}
		
		if (areEffectsEnabled() && scope.config.postprocessingEnabled) {
			scope.context.composer.render( time );
		} else {
			scope.context.renderer.clear();
			scope.context.renderer.render(scope.context.secondaryScene, scope.context.secondaryCamera);
			scope.context.renderer.render(scope.context.primaryScene, scope.context.camera);
		}
		
		
		

	}
	
	function configContainsMoon(moonConfig)
	{
		if (!scope.config.moons) {
			return false;
		}
		for (var i = 0; i < scope.config.moons.length; i++) {
			if (scope.config.moons[i].id == moonConfig.id) {
				return true;
			}
		}
		return false;
	}
	
	this.addMoon = function(moonConfig)
	{
		if (!moonConfig) {
			moonConfig = $.extend(true, {}, KMG.DefaultConfig.moonTemplate);
		}
		
		if (!moonConfig.id) {
			moonConfig.id = KMG.GUID.guid();
		}
		
		if (!this.config.moons) {
			this.config.moons = [];
		}
		
		if (!configContainsMoon(moonConfig)) {
			this.config.moons.push(moonConfig);
		}
		
		var moonObject = new KMG.MoonObject(scope.context, moonConfig);
		scope.context.objects.push(moonObject);
		scope.context.primaryScene.add(moonObject);
		
		var moonContainer = {
			id : moonConfig.id,
			config : moonConfig,
			object : moonObject
		};
		
		this.context.moons.push(moonContainer);
		
		
		return moonContainer;
	};
	
	function getMoonContainerById(id) 
	{
		for (var i = 0; i < scope.context.moons.length; i++) {
			if (scope.context.moons[i].id == id) {
				return scope.context.moons[i];
			}
		}
		return null;
	}
	
	this.removeMoon = function(moonConfig) 
	{
		var moonContainer = getMoonContainerById(moonConfig.id);
		if (!moonContainer) {
			return;
		}
		
		// Remove moon config
		var newList = [];
		for (var i = 0; i < this.config.moons.length; i++) {
			if (this.config.moons[i].id != moonConfig.id) {
				newList.push(this.config.moons[i]);
			}
		}
		this.config.moons = newList;
		
		// Remove moon object container from context & scene
		newList = [];
		for (var i = 0; i < scope.context.moons.length; i++) {
			if (scope.context.moons[i].id != moonContainer.id) {
				newList.push(scope.context.moons[i]);
			}
		}
		scope.context.moons = newList;
		scope.context.primaryScene.remove(moonContainer.object);
		
		
	};
	
	function fireOnFrameHandler()
	{
		if (scope.config.useScript && scope.context.script && scope.context.script.onFrameHandler) {
			return scope.context.script.onFrameHandler(scope, scope.config, scope.context);
		} else {
			return false;
		}
	}
	
	function fireOnRenderHandler()
	{
		if (scope.config.useScript && scope.context.script && scope.context.script.onRenderHandler) {
			return scope.context.script.onRenderHandler(scope, scope.config, scope.context);
		} else {
			return false;
		}
	}
	
	this.applySceneScriptInstance = function(scriptInstance) {
		
		var sceneChanged = false;
		if (this.context.script && this.context.script.onScriptDestroy(this, this.config, this.context)) {
			sceneChanged = true;
		}
		
		this.context.script = scriptInstance;
		
		// Make sure we weren't passed a null script instance (which effectively 
		// disables the script interface)
		if (this.context.script && this.context.script.onScriptInitialize(this, this.config, this.context)) {
			sceneChanged = true;
		}
		
		if (sceneChanged) {
			this.context.configChanged = true;
		}
	};

	this.context.container = this.domElement;
	
	
	KMG.TextureMap.sceneReadyCallback = this.sceneCallbacks.sceneReadyCallback;
	KMG.TextureMap.resourceLoadingStart = this.sceneCallbacks.resourceLoadingStart;
	KMG.TextureMap.resourceLoadingFinish = this.sceneCallbacks.resourceLoadingFinish;
	KMG.TextureMap.renderCallback = render;

	this.context.camera = new THREE.PerspectiveCamera( this.config.camera.fieldOfView, $("#container").width() / $("#container").height(), this.config.camera.near, this.config.camera.far );
	this.context.camera.forceDefaultDistance = false;
	
	if (this.config.camera.useSecondaryParameters) {
		this.context.secondaryCamera = new THREE.PerspectiveCamera( this.config.camera.fieldOfViewSecondary, $("#container").width() / $("#container").height(), this.config.camera.nearSecondary, this.config.camera.farSecondary );
	} else {
		this.context.secondaryCamera = new THREE.PerspectiveCamera( this.config.camera.fieldOfView, $("#container").width() / $("#container").height(), this.config.camera.near, this.config.camera.far );
	}
	this.context.secondaryCamera.forceDefaultDistance = true;
	
	var renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true, preserveDrawingBuffer : true} );
	renderer.setSize( window.innerWidth, window.innerHeight );
	
	if (this.config.initWithShadows) {
		renderer.shadowMapEnabled = true;
		renderer.shadowMapSoft = true;
		renderer.shadowMapType = THREE.PCFSoftShadowMap;
		renderer.shadowMapCullFace = THREE.CullFaceBack;
	}
	
	renderer.autoClear = false;
	renderer.setClearColor(0x000000);
	renderer.gammaInput = true;
	renderer.gammaOutput = true;
	renderer.physicallyBasedShading = true;
	
	this.context.renderer = renderer;
	renderer.context.canvas.addEventListener("webglcontextlost", function(event) {
		event.preventDefault();
		console.error("WebGL Context has been lost!");
		if (scope.context.animationID) {
			//cancelAnimationFrame(scope.context.animationID); 
		}
		
		if (sceneCallbacks.contextLostCallback) {
			sceneCallbacks.contextLostCallback(event);
		}
		
	}, false);

	renderer.context.canvas.addEventListener("webglcontextrestored", function(event) {
		animate();
	}, false);

	
	this.context.container.appendChild( renderer.domElement );
	
	if (this.config.enableFps) {
		var stats = new Stats();
		stats.domElement.style.position = 'absolute';
		stats.domElement.style.bottom = '0px';
		stats.domElement.style.right = '0px';
		this.context.container.appendChild( stats.domElement );
		this.context.stats = stats;
	}
	
	document.addEventListener( 'mousemove', onDocumentMouseMove, false );
	window.addEventListener( 'resize', onWindowResize, false );


	this.context.controls = new KMG.ExamineControls( renderer.getContext(), [this.context.camera, this.context.secondaryCamera], this.context.container );
	if (view) {
		this.context.controls.fromConfig(view);
	}
	this.context.controls.update(true);
	
	this.context.controls.addEventListener( 'change', render );
	if (this.cameraConfig != null && this.cameraConfig.controlCenter !== undefined) {
		this.context.controls.center.set(this.cameraConfig.controlCenter.x, this.cameraConfig.controlCenter.y, this.cameraConfig.controlCenter.z);
	}
	
	
	this.initializePostProcessing = function() {
		this.context.composer = new KMG.DynamicEffectsComposer(this.context, this.context.primaryScene, this.context.camera, this.context.secondaryCamera, this.context.renderer, this.config);
		this.context.objects.push(this.context.composer);
	};
	
	
	
	
	
	
};

/* File: Planet.js */

KMG.Planet = function ( domElement, config, sceneCallbacks, cameraConfig, view) {
	
	KMG.Engine.call( this, domElement, config, sceneCallbacks, cameraConfig, view );

	// Internals
	var scope = this;
	

	
	function addObjectToScene(object, scene)
	{
		scope.context.objects.push(object);
		
		if (!scene || scene === KMG.SCENE.PRIMARY) {
			scope.context.primaryScene.add( object );
		} else if (scene === KMG.SCENE.SECONDARY) {
			scope.context.secondaryScene.add( object );
		}
		
		return object;
	}
	
	function initShadows(light) {
		light.castShadow = true;
		light.shadowCameraVisible = false;
		light.shadowMapWidth = 2048;
		light.shadowMapHeight = 2048;
		light.shadowCameraNear = -4000;
		light.shadowCameraFar = 100000;
		light.shadowCameraFov = 45.0;
		
		light.shadowCameraRight     =  700;
		light.shadowCameraLeft     = -700;
		light.shadowCameraTop      =  700;
		light.shadowCameraBottom   = -700;
		//light0.shadowBias = 0.03001;
		//light0.shadowDarkness = 0.5;
	}
	
	function buildScene()
	{
		scope.context.primaryScene = new THREE.Scene();

		scope.context.lights.primaryDirectional = new THREE.DirectionalLight( 0xFFFFFF, 2.0, 100);
		scope.context.lights.primaryDirectional.position.set( -10000, 0, 0 ).normalize();
		scope.context.primaryScene.add(scope.context.lights.primaryDirectional);

			
		
		scope.context.lights.primaryPoint = new THREE.PointLight( 0xFFFFFF, 0.0);
		scope.context.lights.primaryPoint.position.set( 0, 0, 0 );
		scope.context.primaryScene.add(scope.context.lights.primaryPoint);

		scope.context.lights.ambient = new THREE.AmbientLight( 0x888888 );
		scope.context.primaryScene.add( scope.context.lights.ambient );
		
		scope.context.lights.ambient = new THREE.AmbientLight( 0x888888 )
		
		if (scope.config.initWithShadows) {
			initShadows(scope.context.lights.primaryDirectional);
			//initShadows(scope.context.lights.primaryPoint);
		}
		
		
		if (!scope.config.noPlanet) {
			scope.context.surfaceObject = addObjectToScene(new KMG.SurfaceObject(scope.context, scope.config));
			scope.context.cloudObject = addObjectToScene(new KMG.CloudObject(scope.context, scope.config));
			addObjectToScene(new KMG.HaloObject(scope.context, scope.config), KMG.SCENE.PRIMARY);
			addObjectToScene(new KMG.RingObject(scope.context, scope.config));
		}
		if (!scope.config.noFog) {
			scope.context.primaryScene.fog = addObjectToScene(new KMG.FogObject(scope.context, scope.config), KMG.SCENE.NONE);
		}
		
		scope.context.secondaryScene = new THREE.Scene();
		
		scope.context.lights.secondaryDirectional = scope.context.lights.primaryDirectional.clone();
		scope.context.lights.secondaryPoint = scope.context.lights.primaryPoint.clone();

		scope.context.secondaryScene.add(scope.context.lights.secondaryDirectional);
		scope.context.secondaryScene.add(scope.context.lights.secondaryPoint);
		
		
		
		addObjectToScene(new KMG.LocalStarObject(scope.context, scope.config), KMG.SCENE.SECONDARY);
		addObjectToScene(new KMG.LensFlareObject(scope.context, scope.config), KMG.SCENE.SECONDARY);
		
		if (!scope.config.noBackground) {
			scope.context.background = new KMG.BackgroundObject(scope.context, scope.config);
			addObjectToScene(scope.context.background, KMG.SCENE.SECONDARY);
		}
		

		
		scope.context.primaryScene.updateMatrix();
		scope.context.secondaryScene.updateMatrix();
	}
	
	
	
	buildScene();
	
	this.initializePostProcessing();
	
	
};
KMG.Planet.prototype = Object.create( KMG.Engine.prototype );

/* File: RingGeometry2.js */

/** A modification of the standard three.js RingGeometry class, but with changes to support 
 * Celestia-like ring textures.
 */
THREE.RingGeometry2 = function ( innerRadius, outerRadius, thetaSegments, phiSegments, thetaStart, thetaLength ) {

    THREE.Geometry.call( this );

    innerRadius = innerRadius || 0;
    outerRadius = outerRadius || 50;

    thetaStart = thetaStart !== undefined ? thetaStart : 0;
    thetaLength = thetaLength !== undefined ? thetaLength : Math.PI * 2;

    thetaSegments = thetaSegments !== undefined ? Math.max( 3, thetaSegments ) : 8;
    phiSegments = phiSegments !== undefined ? Math.max( 3, phiSegments ) : 8;
    
    var i, o, uvs = [], radius = innerRadius, radiusStep = ( ( outerRadius - innerRadius ) / phiSegments);
	

	
    for( i = 0; i <= phiSegments; i++) {//concentric circles inside ring

        for( o = 0; o <= thetaSegments; o++) {//number of segments per circle

            var vertex = new THREE.Vector3();
            
            vertex.x = radius * Math.cos( thetaStart + o / thetaSegments * thetaLength );
            vertex.y = radius * Math.sin( thetaStart + o / thetaSegments * thetaLength );
            
            this.vertices.push( vertex );
			uvs.push( new THREE.Vector2((i / phiSegments), ( vertex.y / radius + 1 ) / 2));
        }
        
        radius += radiusStep;

    }
	
	
    var n = new THREE.Vector3( 0, 0, 1 );
    
    for( i = 0; i < phiSegments; i++) {//concentric circles inside ring

        for( o = 0; o <= thetaSegments; o++) {//number of segments per circle
            
            var v1, v2, v3;

            v1 = o + (thetaSegments * i) + i;
            v2 = o + (thetaSegments * i) + thetaSegments + i;
            v3 = o + (thetaSegments * i) + thetaSegments + 1 + i;
            
            this.faces.push( new THREE.Face3( v1, v2, v3, [ n, n, n ] ) );
            this.faceVertexUvs[ 0 ].push( [ uvs[ v1 ], uvs[ v2 ], uvs[ v3 ] ]);
            
            v1 = o + (thetaSegments * i) + i;
            v2 = o + (thetaSegments * i) + thetaSegments + 1 + i;
            v3 = o + (thetaSegments * i) + 1 + i;
            
            this.faces.push( new THREE.Face3( v1, v2, v3, [ n, n, n ] ) );
            this.faceVertexUvs[ 0 ].push( [ uvs[ v1 ], uvs[ v2 ], uvs[ v3 ] ]);

        }
    }
    
    this.computeCentroids();
    this.computeFaceNormals();

    this.boundingSphere = new THREE.Sphere( new THREE.Vector3(), radius ); 

};

THREE.RingGeometry2.prototype = Object.create( THREE.Geometry.prototype );

/* File: Vector3.js */

THREE.Vector3.prototype.rotateX = function (angle) {

	var cosX = Math.cos(angle);
	var sinX = Math.sin(angle);
			
	var ry = cosX * this.y + -sinX * this.z;
	var rz = sinX * this.y + cosX * this.z;
			
	this.y = ry;
	this.z = rz;
	
	return this;
};

THREE.Vector3.prototype.rotateY = function (angle) {

	var cosY = Math.cos(angle);
	var sinY = Math.sin(angle);
	
	var rx = cosY * this.x + sinY * this.z;
	var rz = -sinY * this.x + cosY * this.z;
	
	this.x = rx;
	this.z = rz;
	
	return this;
};

THREE.Vector3.prototype.rotateZ = function (angle) {

	var cosZ = Math.cos(angle);
	var sinZ = Math.sin(angle);
	
	var rx = cosZ * this.x + -sinZ * this.y;
	var ry = sinZ * this.x + cosZ * this.y;

	this.x = rx;
	this.y = ry;
	
	return this;
};


THREE.Vector3.prototype.rotate = function (angle, axis) {
	if (axis === undefined || axis === 'X') {
		return this.rotateX(angle);
	} else if (axis === 'Y') {
		return this.rotateY(angle);
	} else if (axis === 'Z') {
		return this.rotateZ(angle);
	}
	return this;
};

/* File: ConfigWrapper.js */

/** A very simple structure for creating property name aliases.
 *
 */
KMG.ConfigWrapper = function ( config ) {
	
	var scope = this;
	var config = config;
	var nameToPropMap = {};
	var propToNameMap = {};
	this.changeListener = null;
	
	this.add = function ( name, prop ) {
		propToNameMap[prop] = name;
		nameToPropMap[name] = prop;
		
		Object.defineProperty(this, name, {
			get : function()  { return config[nameToPropMap[name]]; },
			set : function(v) { 
				config[nameToPropMap[name]] = v;
				if (scope.changeListener) {
					scope.changeListener(nameToPropMap[name], v);
				}
			}
		});
		
	};
};

/* File: AnimateController.js */

KMG.AnimateController = function ( config, object ) {
	
	this.config = config;
	this.object = object;
	var scope = this;
	
	this.current = config.integralStart;
	
	this.isActive = false;

	function nextDistance()
	{
		var rawDistance = scope.config.distanceIntegral(scope.current);
		var distance = ((scope.config.startDistance - scope.config.minDistance) * ((rawDistance - scope.config.integralMin) / (scope.config.integralMax - scope.config.integralMin))) + scope.config.minDistance;
		return distance;
	}
	
	function nextRotation()
	{
		var rawRotation = scope.config.rotateIntegral(scope.current);
		return rawRotation*(Math.PI/180.0);
	}
	
	function onNext(direction)
	{
		if (!scope.isActive) {
			return;
		}
		
		if (!direction) {
			direction = 1.0;
		}
		
		scope.current += (scope.config.speed * direction);
		var distance = nextDistance();
		var rotation = nextRotation() * direction;
		
		var position = scope.object.position;
		var offset = position.clone();
		
		var theta = Math.atan2( offset.x, offset.z );
		var phi = Math.atan2( Math.sqrt( offset.x * offset.x + offset.z * offset.z ), offset.y );

		theta += rotation;
		phi += 0.0;
		
		offset.x = distance * Math.sin( phi ) * Math.sin( theta );
		offset.y = distance * Math.cos( phi );
		offset.z = distance * Math.sin( phi ) * Math.cos( theta );
	
		scope.object.position = offset;

		if (scope.current >= scope.config.integralEnd || scope.current <= scope.config.integralStart) {
			scope.stop();
		}
	}
	
	this.next = function() {
		onNext();
	};
	
	this.start = function() {
		this.isActive = true;
	};
	
	this.stop = function() {
		this.isActive = false;
	};
	
	
	this.rewind = function() {
		this.isActive = true;
		this.current = this.config.integralEnd;
		for (var i = this.config.integralEnd; i >= this.config.integralStart; i-=this.config.speed) {
			onNext(-1);
		}
		this.current = this.config.integralStart;
		this.isActive = false;
	};
};
/* File: SunlightPositioning.js */

KMG.SunlightPositioning = function() {
	

	
	function limitDegrees(degrees) {
		var limited;
		degrees /= 360.0;
		limited = 360.0 * (degrees - Math.floor(degrees));
		if (limited < 0) {
			limited += 360.0;
		}
		return limited;
	}
	
	function julianDay(year, month, day, hour, minute, second, tz) {
		var day_decimal, julian_day, a;

		day_decimal = day + (hour - tz + (minute + second / 60.0) / 60.0) / 24.0;

		if (month < 3) {
			month += 12;
			year--;
		}

		julian_day = Math.floor(365.25 * (year + 4716.0)) + Math.floor(30.6001 * (month + 1)) + day_decimal - 1524.5;
		if (julian_day > 2299160.0) {
			a = Math.floor(year / 100);
			julian_day += (2 - a + Math.floor(a / 4));
		}
		console.info("Julian Day: " + julian_day);
		return julian_day;
		
	}
	
	function julianDayFromDate(date) {
		return julianDay(date.getFullYear()
					, date.getMonth() + 1
					, date.getDate()
					, date.getHours()
					, date.getMinutes()
					, date.getSeconds()
					, 0);
	}
	
	
	function julianCentury(jd) {
		return (jd - 2451545.0) / 36525.0;
	}
	

	
	//http://stackoverflow.com/questions/8619879/javascript-calculate-days-in-a-year-year-to-date
	function dayOfYear(date) {
		var start = new Date(date.getFullYear(), 0, 0);
		var diff = date - start;
		var oneDay = 1000 * 60 * 60 * 24;
		var day = Math.floor(diff / oneDay);
		return day;
	}
	
	function dayOfYearFromJulianDay(jd) {
		var dt = KMG.Util.julianToDate(jd);
		return dayOfYear(dt);
	}
	
	function toMinutes(date) {
        var hour = date.getHours();
        var minute = date.getMinutes();
        var second = date.getSeconds();
        
		var tod = hour * 60.0 + minute + (second / 60.0);
		
        return tod;
    }
	
	function toMinutesFromJulianDay(jd) {
		var dt = KMG.Util.julianToDate(jd);
		return toMinutes(dt);
	}
	
	function radians(d) {
		return d*(Math.PI/180.0);
	}
	
	function degrees(r) {
		return r*(180.0/Math.PI);
	}
	
	// Doesn't account for atmospheric influence
	this.getSunPositionOnDate = function(date){
		var jd = julianDayFromDate(date);
		return this.getSunPositionOnJulianDay(jd);
	};
	
	// Doesn't account for atmospheric influence
	this.getSunPositionOnJulianDay = function(jd) {
	

		var latitude = 0.0;
		var longitude = 0.0;
			
		
		var jc = julianCentury(jd);
		
		var n = jd - 2451545.0; // Number of days from J2000.0
		var L = 280.460 + 0.9856474 * n; // Mean longitude of the Sun,
		
		var g = 357.528 + 0.9856003 * n; // Mean anomaly of the sun
		L = limitDegrees(L);
		g = limitDegrees(g);

		var _g = radians(g);
		var _L = radians(L);

		var eclipticLongitude = L + 1.915 * Math.sin(_g) + 0.020 * Math.sin(2 * _g);
		var eclipticLatitude = 0;

		// Distance of the sun in astronomical units
		var R = 1.00014 - 0.01671 * Math.cos(_g) - 0.00014 * Math.cos(2 * _g);

                // Obliquity of the ecliptic
		var e = 23.439 - 0.0000004 * n;

		var eccentricityEarthOrbit = 0.016708634 - jc * (0.000042037 + 0.0000001267 * jc);

		var _eclipticLongitude = radians(eclipticLongitude);
		var _eclipticLatitude = radians(eclipticLatitude);

		var _e = radians(e);

		var N = dayOfYearFromJulianDay(jd);

		var rightAscension = Math.atan((Math.sin(_eclipticLongitude) * Math.cos(_e) - Math.tan(_eclipticLatitude) * Math.sin(_e)) / Math.cos(_eclipticLongitude));
		var declination = Math.atan((Math.sin(_e) * Math.sin(_eclipticLongitude) * Math.cos(_eclipticLatitude) + Math.cos(_e) * Math.sin(_eclipticLatitude)));
		var o = -e * (Math.cos(radians((360.0 / 365.0) * (N + 10.0))));


		var obliquityCorrection = e + 0.00256 * Math.cos(radians(125.04 - 1934.136 * jc));
		var y = Math.pow(Math.tan(radians(obliquityCorrection) / 2.0), 2);

		var equationOfTime = degrees(y * Math.sin(2.0 * _L) - 2.0 * eccentricityEarthOrbit * Math.sin(_g) + 4.0 * eccentricityEarthOrbit * y * Math.sin(_g) * Math.cos(2.0 * _L)
                                - 0.5 * y * y * Math.sin(4.0 * _L) - 1.25 * eccentricityEarthOrbit * eccentricityEarthOrbit * Math.sin(2.0 * _g)) * 4.0; // in
                                                                                                                                                                                                                                                                                                // minutes
                                                                                                                                                                                                                                                                                                // of
                                                                                                                                                                                                                                                                                                // time

		var tod = toMinutesFromJulianDay(jd);
		
		var trueSolarTime = (tod + equationOfTime + 4.0 * longitude - 60.0 * 0 /* 0==tz*/);

		var ha = 0;
		if (trueSolarTime / 4.0 < 0.0)
			ha = trueSolarTime / 4.0 + 180.0;
		else
			ha = trueSolarTime / 4.0 - 180.0;
		
		
		

		var rotateY = rightAscension + (ha - longitude);
		var rotateX = declination;
		
		var e = new THREE.Euler( radians(rotateX), radians(-rotateY), radians(o), 'XYZ' );
		
		
		var xyz = new THREE.Vector3(R * 149598000000.0, 0, 0); // R (AU) in meters
		xyz.applyEuler(e);
		xyz.solarY = radians(-rotateY);
		xyz.euler = e;
		return xyz;
    };
	
};
/* File: HaloShader.js */

THREE.HaloShader = {

	uniforms: THREE.UniformsUtils.merge( [
		THREE.UniformsLib[ "shadowmap" ],
		THREE.UniformsLib[ "lights" ],

		{

		"uColor": { type: "v4", value: new THREE.Vector4(1.0, 1.0, 1.0, 1.0) },
		"viewVector": { type: "v3", value: new THREE.Vector4(1.0, 1.0, 1.0, 1.0) },
		"uTop":  { type: "f", value: 0.94 },//0.94 },
		"uPower":  { type: "f", value: 13.0 },//13.0 },
		"usingDirectionalLighting": { type: "i", value: 1 }
		}]),

	vertexShader: [
		'uniform vec3 viewVector;',
		"attribute vec4 tangent;",
		'varying vec3 vNormal; ',
		'varying float intensity;',
		'uniform float uTop;',
		'uniform float uPower;',
		
		'void main() {',
		'	vNormal = normalize( normalMatrix * normal );',
		'	vec3 vNormel = normalize( normalMatrix * viewVector );',
		'	intensity = pow( uTop - dot(vNormal, vNormel), uPower );',
		'	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 ); ',
		'}'
	].join("\n"),

	fragmentShader: [
		'uniform vec4 uColor;',
		'varying vec3 vNormal; ',
		'varying float intensity;',
		'uniform bool usingDirectionalLighting;',
		
		"#if MAX_DIR_LIGHTS > 0",

			"uniform vec3 directionalLightColor[ MAX_DIR_LIGHTS ];",
			"uniform vec3 directionalLightDirection[ MAX_DIR_LIGHTS ];",

		"#endif",
		
		'void main() {',

		"	vec3 dirDiffuse = vec3( 0.0 );",
		"	vec3 dirSpecular = vec3( 0.0 );",
		
		"	if (usingDirectionalLighting) {",
				"for( int i = 0; i < MAX_DIR_LIGHTS; i++ ) {",
					"vec4 lDirection = viewMatrix * vec4( directionalLightDirection[ i ], 0.0 );",
					"vec3 dirVector = normalize( lDirection.xyz );",
					
					"float directionalLightWeightingFull = max( dot( vNormal, dirVector ), 0.0);",
					"float directionalLightWeightingHalf = max(0.5 * dot( vNormal, dirVector ) + 0.5, 0.0);",
					"vec3 dirDiffuseWeight = mix( vec3( directionalLightWeightingFull ), vec3( directionalLightWeightingHalf ) , vec3(0.4) );",

					"dirDiffuse += dirDiffuseWeight;",
				"}",

		"	} else {",
			"	dirDiffuse = vec3( 1.0 );",
		"	}",

		//"	if (gl_FrontFacing) {",
		//"		gl_FragColor = vec4(0.0);",
		//"	} else {",
		'		gl_FragColor = uColor * intensity * intensity *  vec4(dirDiffuse, 1.0);', 
		//"	}",
		'}'
	].join("\n")

};




/* File: ExtendedNormalMapShader.js */

KMG.ExtendedNormalMapShader = {

	uniforms: THREE.UniformsUtils.merge( [

		THREE.UniformsLib[ "fog" ],
		THREE.UniformsLib[ "lights" ],
		THREE.UniformsLib[ "shadowmap" ],

		{

		"enableAO"		  : { type: "i", value: 0 },
		"enableDiffuse"	  : { type: "i", value: 0 },
		"enableSpecular"  : { type: "i", value: 0 },
		"enableReflection": { type: "i", value: 0 },
		"enableDisplacement": { type: "i", value: 0 },
		"enableCityLights": { type: "i", value: 0 },
		"enableGrayscale"  : { type: "i", value: 0 },
		"usingDirectionalLighting" : { type : "i", value: 1 },
		"enableFog"		  : { type: "i", value: 1 },
		
		"tDisplacement": { type: "t", value: null }, // must go first as this is vertex texture
		"tDiffuse"	   : { type: "t", value: null },
		"tCube"		   : { type: "t", value: null },
		"tNormal"	   : { type: "t", value: null },
		"tSpecular"	   : { type: "t", value: null },
		"tAO"		   : { type: "t", value: null },
		"tCityLights"  : { type: "t", value: null },
		
		"uNormalScale": { type: "v2", value: new THREE.Vector2( 1, 1 ) },

		"uDisplacementBias": { type: "f", value: 0.0 },
		"uDisplacementScale": { type: "f", value: 1.0 },

		"uDiffuseColor": { type: "c", value: new THREE.Color( 0xffffff ) },
		"uSpecularColor": { type: "c", value: new THREE.Color( 0x111111 ) },
		"uAmbientColor": { type: "c", value: new THREE.Color( 0xffffff ) },
		"uEmissiveColor": { type: "c", value: new THREE.Color( 0x000000 ) },
		"uCityLightsColor": { type: "c", value: new THREE.Color( 0xffffff ) },
		"uShininess": { type: "f", value: 30 },
		"uOpacity": { type: "f", value: 1 },
		"uCityLightsIntensity": { type: "f", value: 1 },
		
		"useRefract": { type: "i", value: 0 },
		"uRefractionRatio": { type: "f", value: 0.98 },
		"uReflectivity": { type: "f", value: 0.5 },
	
		"uAOLevel": { type: "f", value: 1.0 },
		"uAlphaMulitplier": { type: "f", value: 1.0 },
		
		"uOffset" : { type: "v2", value: new THREE.Vector2( 0.001, 0.001 ) },
		"uRepeat" : { type: "v2", value: new THREE.Vector2( 0.998, 0.998 ) },

		"wrapRGB"  : { type: "v3", value: new THREE.Vector3( 0, 0, 0 ) },
		
		"uInvertedColor" : { type: "i", value: 0 }

		}

	] ),

	fragmentShader: [

		"uniform vec3 uAmbientColor;",
		"uniform vec3 uDiffuseColor;",
		"uniform vec3 uSpecularColor;",
		"uniform vec3 uEmissiveColor;",
		"uniform vec3 uCityLightsColor;",
		"uniform float uShininess;",
		"uniform float uOpacity;",
		"uniform float uAOLevel;",
		"uniform float uCityLightsIntensity;",
		"uniform float uAlphaMulitplier;",
		
		"uniform bool uInvertedColor;",
		
		"uniform bool enableGrayscale;",
		"uniform bool enableDiffuse;",
		"uniform bool enableSpecular;",
		"uniform bool enableAO;",
		"uniform bool enableReflection;",
		"uniform bool enableCityLights;",
		"uniform bool usingDirectionalLighting;",
		"uniform bool enableFog;",
		
		"uniform sampler2D tDiffuse;",
		"uniform sampler2D tNormal;",
		"uniform sampler2D tSpecular;",
		"uniform sampler2D tAO;",
		"uniform sampler2D tCityLights;",
		
		"uniform samplerCube tCube;",

		"uniform vec2 uNormalScale;",

		"uniform bool useRefract;",
		"uniform float uRefractionRatio;",
		"uniform float uReflectivity;",

		"varying vec3 vTangent;",
		"varying vec3 vBinormal;",
		"varying vec3 vNormal;",
		"varying vec2 vUv;",

		"uniform vec3 ambientLightColor;",
		
		"#if MAX_DIR_LIGHTS > 0",

			"uniform vec3 directionalLightColor[ MAX_DIR_LIGHTS ];",
			"uniform vec3 directionalLightDirection[ MAX_DIR_LIGHTS ];",

		"#endif",

		"#if MAX_HEMI_LIGHTS > 0",

			"uniform vec3 hemisphereLightSkyColor[ MAX_HEMI_LIGHTS ];",
			"uniform vec3 hemisphereLightGroundColor[ MAX_HEMI_LIGHTS ];",
			"uniform vec3 hemisphereLightDirection[ MAX_HEMI_LIGHTS ];",

		"#endif",

		"#if MAX_POINT_LIGHTS > 0",

			"uniform vec3 pointLightColor[ MAX_POINT_LIGHTS ];",
			"uniform vec3 pointLightPosition[ MAX_POINT_LIGHTS ];",
			"uniform float pointLightDistance[ MAX_POINT_LIGHTS ];",

		"#endif",

		"#if MAX_SPOT_LIGHTS > 0",

			"uniform vec3 spotLightColor[ MAX_SPOT_LIGHTS ];",
			"uniform vec3 spotLightPosition[ MAX_SPOT_LIGHTS ];",
			"uniform vec3 spotLightDirection[ MAX_SPOT_LIGHTS ];",
			"uniform float spotLightAngleCos[ MAX_SPOT_LIGHTS ];",
			"uniform float spotLightExponent[ MAX_SPOT_LIGHTS ];",
			"uniform float spotLightDistance[ MAX_SPOT_LIGHTS ];",

		"#endif",

		"#ifdef WRAP_AROUND",

			"uniform vec3 wrapRGB;",

		"#endif",

		"varying vec3 vWorldPosition;",
		"varying vec3 vViewPosition;",

		THREE.ShaderChunk[ "shadowmap_pars_fragment" ],
		THREE.ShaderChunk[ "fog_pars_fragment" ],

		"void main() {",

			"gl_FragColor = vec4( vec3( 1.0 ), uOpacity );",
			
			"vec3 specularTex = vec3( 1.0 );",
			
			"vec3 normalTex = texture2D( tNormal, vUv ).xyz * 2.0 - 1.0;",
			"normalTex.xy *= uNormalScale;",
			"normalTex = normalize( normalTex );",
			
			
			"vec4 texelColor = texture2D( tDiffuse, vUv );",
			
			"texelColor = vec4(texelColor.xyz, texelColor.w * uAlphaMulitplier);",
			
			"if (enableGrayscale) {",
			"	float grayIntensity = texelColor.x * 0.2989 + texelColor.y * 0.5870 + texelColor.z * 0.1140;",
			"	texelColor = vec4( grayIntensity, grayIntensity, grayIntensity,  texelColor.w);",
			"}",
			
			"if (uInvertedColor) {",
				"texelColor.x = 1.0 - texelColor.x;",
				"texelColor.y = 1.0 - texelColor.y;",
				"texelColor.z = 1.0 - texelColor.z;",
			"}",
			
			
			
			
			
			"if( enableDiffuse ) {",

				"#ifdef GAMMA_INPUT",
					
					
					//"texelColor.xyz *= texelColor.xyz;",

					"gl_FragColor = gl_FragColor * (texelColor * texelColor);",

				"#else",

					"gl_FragColor = gl_FragColor * texture2D( tDiffuse, vUv );",

				"#endif",

			"}",
			
			"vec3 aoColor;",
			"if( enableAO ) {",

				"#ifdef GAMMA_INPUT",

					"vec4 _aoColor = texture2D( tAO, vUv );",
					"_aoColor.xyz *= _aoColor.xyz;",

					"aoColor = _aoColor.xyz;",

				"#else",

					"aoColor = texture2D( tAO, vUv ).xyz;",
			
				"#endif",
				
				"aoColor = aoColor.xyz + (1.0 - aoColor.xyz) * (1.0 - uAOLevel);",
				"gl_FragColor.xyz = gl_FragColor.xyz * aoColor;",
			"}",

			"if( enableSpecular && !enableAO) {",
				"specularTex = texture2D( tSpecular, vUv ).xyz;",
			"} else if( enableSpecular && enableAO) {",
				"specularTex = aoColor * texture2D( tSpecular, vUv ).xyz;",
			"}",
			"mat3 tsb = mat3( normalize( vTangent ), normalize( vBinormal ), normalize( vNormal ) );",
			"vec3 finalNormal = tsb * normalTex;",

			"#ifdef FLIP_SIDED",

				"finalNormal = -finalNormal;",

			"#endif",

			"vec3 normal = normalize( finalNormal );",
			"vec3 viewPosition = normalize( vViewPosition );",

			// point lights

			"#if MAX_POINT_LIGHTS > 0",

				"vec3 pointDiffuse = vec3( 0.0 );",
				"vec3 pointSpecular = vec3( 0.0 );",

				"for ( int i = 0; i < MAX_POINT_LIGHTS; i ++ ) {",

					"vec4 lPosition = viewMatrix * vec4( pointLightPosition[ i ], 1.0 );",
					"vec3 pointVector = lPosition.xyz + vViewPosition.xyz;",

					"float pointDistance = 1.0;",
					"if ( pointLightDistance[ i ] > 0.0 )",
						"pointDistance = 1.0 - min( ( length( pointVector ) / pointLightDistance[ i ] ), 1.0 );",

					"pointVector = normalize( pointVector );",

					// diffuse

					"#ifdef WRAP_AROUND",

						"float pointDiffuseWeightFull = max( dot( normal, pointVector ), 0.0 );",
						"float pointDiffuseWeightHalf = max( 0.5 * dot( normal, pointVector ) + 0.5, 0.0 );",

						"vec3 pointDiffuseWeight = mix( vec3 ( pointDiffuseWeightFull ), vec3( pointDiffuseWeightHalf ), wrapRGB );",

					"#else",

						"float pointDiffuseWeight = max( dot( normal, pointVector ), 0.0 );",

					"#endif",

					"pointDiffuse += pointDistance * pointLightColor[ i ] * uDiffuseColor * pointDiffuseWeight;",

					// specular

					"vec3 pointHalfVector = normalize( pointVector + viewPosition );",
					"float pointDotNormalHalf = max( dot( normal, pointHalfVector ), 0.0 );",
					"float pointSpecularWeight = specularTex.r * max( pow( pointDotNormalHalf, uShininess ), 0.0 );",

					"#ifdef PHYSICALLY_BASED_SHADING",

						// 2.0 => 2.0001 is hack to work around ANGLE bug

						"float specularNormalization = ( uShininess + 2.0001 ) / 8.0;",

						"vec3 schlick = uSpecularColor + vec3( 1.0 - uSpecularColor ) * pow( 1.0 - dot( pointVector, pointHalfVector ), 5.0 );",
						"pointSpecular += schlick * pointLightColor[ i ] * pointSpecularWeight * pointDiffuseWeight * pointDistance * specularNormalization;",

					"#else",

						"pointSpecular += pointDistance * pointLightColor[ i ] * uSpecularColor * pointSpecularWeight * pointDiffuseWeight;",

					"#endif",

				"}",

			"#endif",

			// spot lights

			"#if MAX_SPOT_LIGHTS > 0",

				"vec3 spotDiffuse = vec3( 0.0 );",
				"vec3 spotSpecular = vec3( 0.0 );",

				"for ( int i = 0; i < MAX_SPOT_LIGHTS; i ++ ) {",

					"vec4 lPosition = viewMatrix * vec4( spotLightPosition[ i ], 1.0 );",
					"vec3 spotVector = lPosition.xyz + vViewPosition.xyz;",

					"float spotDistance = 1.0;",
					"if ( spotLightDistance[ i ] > 0.0 )",
						"spotDistance = 1.0 - min( ( length( spotVector ) / spotLightDistance[ i ] ), 1.0 );",

					"spotVector = normalize( spotVector );",

					"float spotEffect = dot( spotLightDirection[ i ], normalize( spotLightPosition[ i ] - vWorldPosition ) );",

					"if ( spotEffect > spotLightAngleCos[ i ] ) {",

						"spotEffect = max( pow( spotEffect, spotLightExponent[ i ] ), 0.0 );",

						// diffuse

						"#ifdef WRAP_AROUND",

							"float spotDiffuseWeightFull = max( dot( normal, spotVector ), 0.0 );",
							"float spotDiffuseWeightHalf = max( 0.5 * dot( normal, spotVector ) + 0.5, 0.0 );",

							"vec3 spotDiffuseWeight = mix( vec3 ( spotDiffuseWeightFull ), vec3( spotDiffuseWeightHalf ), wrapRGB );",

						"#else",

							"float spotDiffuseWeight = max( dot( normal, spotVector ), 0.0 );",

						"#endif",

						"spotDiffuse += spotDistance * spotLightColor[ i ] * uDiffuseColor * spotDiffuseWeight * spotEffect;",

						// specular

						"vec3 spotHalfVector = normalize( spotVector + viewPosition );",
						"float spotDotNormalHalf = max( dot( normal, spotHalfVector ), 0.0 );",
						"float spotSpecularWeight = specularTex.r * max( pow( spotDotNormalHalf, uShininess ), 0.0 );",

						"#ifdef PHYSICALLY_BASED_SHADING",

							// 2.0 => 2.0001 is hack to work around ANGLE bug

							"float specularNormalization = ( uShininess + 2.0001 ) / 8.0;",

							"vec3 schlick = uSpecularColor + vec3( 1.0 - uSpecularColor ) * pow( 1.0 - dot( spotVector, spotHalfVector ), 5.0 );",
							"spotSpecular += schlick * spotLightColor[ i ] * spotSpecularWeight * spotDiffuseWeight * spotDistance * specularNormalization * spotEffect;",

						"#else",

							"spotSpecular += spotDistance * spotLightColor[ i ] * uSpecularColor * spotSpecularWeight * spotDiffuseWeight * spotEffect;",

						"#endif",

					"}",

				"}",

			"#endif",

			// directional lights

			"#if MAX_DIR_LIGHTS > 0",

				"vec3 dirDiffuse = vec3( 0.0 );",
				"vec3 dirSpecular = vec3( 0.0 );",

				"for( int i = 0; i < MAX_DIR_LIGHTS; i++ ) {",

					"vec4 lDirection = viewMatrix * vec4( directionalLightDirection[ i ], 0.0 );",
					"vec3 dirVector = normalize( lDirection.xyz );",

					// diffuse

					"#ifdef WRAP_AROUND",

						"float directionalLightWeightingFull = max( dot( normal, dirVector ), 0.0 );",
						"float directionalLightWeightingHalf = max( 0.5 * dot( normal, dirVector ) + 0.5, 0.0 );",

						"vec3 dirDiffuseWeight = mix( vec3( directionalLightWeightingFull ), vec3( directionalLightWeightingHalf ), wrapRGB );",

					"#else",

						"float dirDiffuseWeight = max( dot( normal, dirVector ), 0.0 );",

					"#endif",

					"dirDiffuse += directionalLightColor[ i ] * uDiffuseColor * dirDiffuseWeight;",

					// specular

					"vec3 dirHalfVector = normalize( dirVector + viewPosition );",
					"float dirDotNormalHalf = max( dot( normal, dirHalfVector ), 0.0 );",
					"float dirSpecularWeight = specularTex.r * max( pow( dirDotNormalHalf, uShininess ), 0.0 );",

					"#ifdef PHYSICALLY_BASED_SHADING",

						// 2.0 => 2.0001 is hack to work around ANGLE bug

						"float specularNormalization = ( uShininess + 2.0001 ) / 8.0;",

						"vec3 schlick = uSpecularColor + vec3( 1.0 - uSpecularColor ) * pow( 1.0 - dot( dirVector, dirHalfVector ), 5.0 );",
						"dirSpecular += schlick * directionalLightColor[ i ] * dirSpecularWeight * dirDiffuseWeight * specularNormalization;",

					"#else",

						"dirSpecular += directionalLightColor[ i ] * uSpecularColor * dirSpecularWeight * dirDiffuseWeight;",

					"#endif",

				"}",

			"#endif",

			// hemisphere lights

			"#if MAX_HEMI_LIGHTS > 0",

				"vec3 hemiDiffuse  = vec3( 0.0 );",
				"vec3 hemiSpecular = vec3( 0.0 );" ,

				"for( int i = 0; i < MAX_HEMI_LIGHTS; i ++ ) {",

					"vec4 lDirection = viewMatrix * vec4( hemisphereLightDirection[ i ], 0.0 );",
					"vec3 lVector = normalize( lDirection.xyz );",

					// diffuse

					"float dotProduct = dot( normal, lVector );",
					"float hemiDiffuseWeight = 0.5 * dotProduct + 0.5;",

					"vec3 hemiColor = mix( hemisphereLightGroundColor[ i ], hemisphereLightSkyColor[ i ], hemiDiffuseWeight );",

					"hemiDiffuse += uDiffuseColor * hemiColor;",

					// specular (sky light)


					"vec3 hemiHalfVectorSky = normalize( lVector + viewPosition );",
					"float hemiDotNormalHalfSky = 0.5 * dot( normal, hemiHalfVectorSky ) + 0.5;",
					"float hemiSpecularWeightSky = specularTex.r * max( pow( hemiDotNormalHalfSky, uShininess ), 0.0 );",

					// specular (ground light)

					"vec3 lVectorGround = -lVector;",

					"vec3 hemiHalfVectorGround = normalize( lVectorGround + viewPosition );",
					"float hemiDotNormalHalfGround = 0.5 * dot( normal, hemiHalfVectorGround ) + 0.5;",
					"float hemiSpecularWeightGround = specularTex.r * max( pow( hemiDotNormalHalfGround, uShininess ), 0.0 );",

					"#ifdef PHYSICALLY_BASED_SHADING",

						"float dotProductGround = dot( normal, lVectorGround );",

						// 2.0 => 2.0001 is hack to work around ANGLE bug

						"float specularNormalization = ( uShininess + 2.0001 ) / 8.0;",

						"vec3 schlickSky = uSpecularColor + vec3( 1.0 - uSpecularColor ) * pow( 1.0 - dot( lVector, hemiHalfVectorSky ), 5.0 );",
						"vec3 schlickGround = uSpecularColor + vec3( 1.0 - uSpecularColor ) * pow( 1.0 - dot( lVectorGround, hemiHalfVectorGround ), 5.0 );",
						"hemiSpecular += hemiColor * specularNormalization * ( schlickSky * hemiSpecularWeightSky * max( dotProduct, 0.0 ) + schlickGround * hemiSpecularWeightGround * max( dotProductGround, 0.0 ) );",

					"#else",

						"hemiSpecular += uSpecularColor * hemiColor * ( hemiSpecularWeightSky + hemiSpecularWeightGround ) * hemiDiffuseWeight;",

					"#endif",

				"}",

			"#endif",

			// all lights contribution summation

			"vec3 totalDiffuse = vec3( 0.0 );",
			"vec3 totalSpecular = vec3( 0.0 );",

			"#if MAX_DIR_LIGHTS > 0",

				"totalDiffuse += dirDiffuse;",
				"totalSpecular += dirSpecular;",

			"#endif",

			"#if MAX_HEMI_LIGHTS > 0",

				"totalDiffuse += hemiDiffuse;",
				"totalSpecular += hemiSpecular;",

			"#endif",

			"#if MAX_POINT_LIGHTS > 0",

				"totalDiffuse += pointDiffuse;",
				"totalSpecular += pointSpecular;",

			"#endif",

			"#if MAX_SPOT_LIGHTS > 0",

				"totalDiffuse += spotDiffuse;",
				"totalSpecular += spotSpecular;",

			"#endif",
			

			THREE.ShaderChunk[ "shadowmap_fragment" ],

			"vec3 emissiveColor = uEmissiveColor * (texelColor.xyz + texelColor.xyz * uEmissiveColor);",
			
			"#ifdef METAL",

				"gl_FragColor.xyz = gl_FragColor.xyz * ( totalDiffuse + ambientLightColor * uAmbientColor + emissiveColor + totalSpecular );",

			"#else",
				
				"gl_FragColor.xyz = gl_FragColor.xyz * ( totalDiffuse + ambientLightColor * uAmbientColor) + totalSpecular + emissiveColor;",
				
			"#endif",
			
			
			
			
			
			THREE.ShaderChunk[ "linear_to_gamma_fragment" ],
			
			"if (enableFog) { ",
				"#ifdef USE_FOG",
				"float depth = gl_FragCoord.z / gl_FragCoord.w;",
				
				"vec3 _fogColor = fogColor;",
				
				"if (usingDirectionalLighting) { ",
					"_fogColor = _fogColor * dirDiffuse;",
				"}",
				
				"#ifdef FOG_EXP2",

					"const float LOG2 = 1.442695;",
					"float fogFactor = exp2( - fogDensity * fogDensity * depth * depth * LOG2 );",
					"fogFactor = 1.0 - clamp( fogFactor, 0.0, 1.0 );",

				"#else",

					"float fogFactor = smoothstep( fogNear, fogFar, depth );",

				"#endif",
				"gl_FragColor = mix( gl_FragColor, vec4( _fogColor, gl_FragColor.w ), fogFactor );",
				
				"#endif",
			"}",
			//////////////////////////////////////////////////////////////////////////////////////
			// City Lights - A three.js NormalMap shader extension to light up night-time cities
			//               using the global lights image from the NASA Blue Marble project
			//////////////////////////////////////////////////////////////////////////////////////
			
			"if( enableCityLights ) {",
				"vec3 dirDiffuse = vec3( 0.0 );",
				"vec3 dirSpecular = vec3( 0.0 );",
				"for( int i = 0; i < MAX_DIR_LIGHTS; i++ ) {",
				
					"vec4 lDirection = viewMatrix * vec4( directionalLightDirection[ i ], 0.0 );",
					"vec3 dirVector = normalize( lDirection.xyz );",
					
					"float directionalLightWeightingFull = max(-1.0 * dot( normal, dirVector ), 0.0);",
					"float directionalLightWeightingHalf = max(-1.0 * 0.5 * dot( normal, dirVector ) + 0.5, 0.0);",

					"vec3 dirDiffuseWeight = mix( vec3( directionalLightWeightingFull ), vec3( directionalLightWeightingHalf ), wrapRGB );",
					"dirDiffuse += uCityLightsColor * uCityLightsColor * dirDiffuseWeight;",
				"}",
				"vec4 texelColor = texture2D( tCityLights, vUv );",
				"gl_FragColor = gl_FragColor + (uCityLightsIntensity * vec4(dirDiffuse, 1.0) * (texelColor.x / 1.0));",
			"}",
			
			
			//THREE.ShaderChunk[ "fog_fragment" ],


			

			
			
			
			
		"}"

	].join("\n"),

	vertexShader: [

		"attribute vec4 tangent;",

		"uniform vec2 uOffset;",
		"uniform vec2 uRepeat;",

		"uniform bool enableDisplacement;",

		"#ifdef VERTEX_TEXTURES",

			"uniform sampler2D tDisplacement;",
			"uniform float uDisplacementScale;",
			"uniform float uDisplacementBias;",

		"#endif",

		"varying vec3 vTangent;",
		"varying vec3 vBinormal;",
		"varying vec3 vNormal;",
		"varying vec2 vUv;",

		"varying vec3 vWorldPosition;",
		"varying vec3 vViewPosition;",

		THREE.ShaderChunk[ "skinning_pars_vertex" ],
		THREE.ShaderChunk[ "shadowmap_pars_vertex" ],

		"void main() {",

			THREE.ShaderChunk[ "skinbase_vertex" ],
			THREE.ShaderChunk[ "skinnormal_vertex" ],

			// normal, tangent and binormal vectors

			"#ifdef USE_SKINNING",

				"vNormal = normalize( normalMatrix * skinnedNormal.xyz );",

				"vec4 skinnedTangent = skinMatrix * vec4( tangent.xyz, 0.0 );",
				"vTangent = normalize( normalMatrix * skinnedTangent.xyz );",

			"#else",

				"vNormal = normalize( normalMatrix * normal );",
				"vTangent = normalize( normalMatrix * tangent.xyz );",

			"#endif",

			"vBinormal = normalize( cross( vNormal, vTangent ) * tangent.w );",

			"vUv = uv * uRepeat + uOffset;",

			// displacement mapping

			"vec3 displacedPosition;",

			"#ifdef VERTEX_TEXTURES",

				"if ( enableDisplacement ) {",

					"vec3 dv = texture2D( tDisplacement, uv ).xyz;",
					"float df = uDisplacementScale * dv.x + uDisplacementBias;",
					"displacedPosition = position + normalize( normal ) * df;",

				"} else {",

					"#ifdef USE_SKINNING",

						"vec4 skinVertex = vec4( position, 1.0 );",

						"vec4 skinned  = boneMatX * skinVertex * skinWeight.x;",
						"skinned 	  += boneMatY * skinVertex * skinWeight.y;",

						"displacedPosition  = skinned.xyz;",

					"#else",

						"displacedPosition = position;",

					"#endif",

				"}",

			"#else",

				"#ifdef USE_SKINNING",

					"vec4 skinVertex = vec4( position, 1.0 );",

					"vec4 skinned  = boneMatX * skinVertex * skinWeight.x;",
					"skinned 	  += boneMatY * skinVertex * skinWeight.y;",

					"displacedPosition  = skinned.xyz;",

				"#else",

					"displacedPosition = position;",

				"#endif",

			"#endif",

			//

			"vec4 mvPosition = modelViewMatrix * vec4( displacedPosition, 1.0 );",
			"vec4 worldPosition = modelMatrix * vec4( displacedPosition, 1.0 );",

			"gl_Position = projectionMatrix * mvPosition;",

			//

			"vWorldPosition = worldPosition.xyz;",
			"vViewPosition = -mvPosition.xyz;",

			// shadows

			"#ifdef USE_SHADOWMAP",

				"for( int i = 0; i < MAX_SHADOWS; i ++ ) {",

					"vShadowCoord[ i ] = shadowMatrix[ i ] * worldPosition;",

				"}",

			"#endif",

		"}"

	].join("\n")

}




/* File: ExamineControls.js */

KMG.CenterPivot = 1;
KMG.SurfacePivot = 2;

KMG.ExamineControls = function ( gl, object, domElement ) {

	this.gl = gl;
	this.object = object;
	this.domElement = ( domElement !== undefined ) ? domElement : document;
	
	this.orientation = new THREE.Quaternion();
	
	console.info("Initializing examine controls");
	
	// API
	this.enabled = true;
	
	this.keys = { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40 };
	
	this.center = new THREE.Vector3(0, 0, 0);
	this.lastPosition = new THREE.Vector3(0, 0, 0);
	
	this.translate = new THREE.Vector3(0, 0, 0);
	
	this.pitchType = KMG.SurfacePivot;
	
	this.maxDistance = 10000;
	this.minDistance = 210;
	this.distance = 700;
	this.defaultDistance = 700;
		
	this.maxScale = 10000.0;
	this.minScale = 0.0001;
	this.scale = 1.0;
	
	this.maxPitch = 90.0 * (Math.PI / 180.0);
	this.minPitch = 0.0;
	this._pitch = 0.0;
	this._yaw = 0.0;
	this._roll = 0.0;
	
	this.panVertical = 0;
	this.panHorizontal = 0;
	
	this.radius = 200;
	
	this.distanceMoveSpeed = 0.2;
	this.zoomSpeed = 0.001;
	this.rotateSpeed = 0.5;
	
	this.modelView = new THREE.Matrix4();
	
	var matrixRoll = new THREE.Matrix4();
	var matrixPitch = new THREE.Matrix4();
	var matrixYaw = new THREE.Matrix4();
	

	var lastX = -1;
	var lastY = -1;
	var mouseDownX = -1;
	var mouseDownY = -1;
	
	var scope = this;
	var changeEvent = { type: 'change' };
	
	var lastRotateX = 0;
	var lastRotateY = 0;
	
	var STATE = { NONE: -1, ROTATE: 0, ZOOM: 1, PAN: 2, TOUCH_ROTATE : 3, TOUCH_ZOOM : 4, TOUCH_PAN : 5, PITCH_ROLL_YAW : 6, ZOOM_SMOOTH : 7 };
	var state = STATE.NONE;
	
	var DIRECTION = { VERTICAL : 0, HORIZONTAL : 1 };
	
	this.toConfig = function() {
		var config = {
			type : "ExamineControls",
			pitch : this._pitch,
			roll : this._roll,
			yaw : this._yaw,
			orientation : this.orientation.toArray(),
			distance : this.distance,
			scale : this.scale
		};
		
		return config;
	};
	
	this.fromConfig = function(view) {
		this._pitch = view.pitch;
		this._roll = view.roll;
		this._yaw = view.yaw;
		this.distance = view.distance;
		this.scale = view.scale;
		this.orientation.fromArray(view.orientation);
		this._update();
	};
	
	this.reset = function()
	{
		this._pitch = 0;
		this._roll = 0;
		this._yaw = 0;
		this.orientation = new THREE.Quaternion();
		
		this._update();
	};
	
	
	this.rotate = function( rotateX, rotateY ) {
		lastRotateX = rotateX;
		lastRotateY = rotateY;
		
		rotateX *= this.rotateSpeed;
		rotateY *= this.rotateSpeed;
	
		var xAxis = new THREE.Vector3(1, 0, 0);
		var yAxis = new THREE.Vector3(0, 1, 0);
		
		xAxis.rotateX(this._pitch);
		xAxis.rotateZ(this._roll);
		yAxis.rotateX(this._pitch);
		yAxis.rotateZ(this._roll);
	
		var xRot = new THREE.Quaternion();
		xRot.setFromAxisAngle(xAxis, -rotateX);
		
		var yRot = new THREE.Quaternion();
		yRot.setFromAxisAngle(yAxis, -rotateY);
		
		var newRot = yRot.multiply(xRot);
		this.orientation = this.orientation.multiply(newRot);
		
		this._update();
	};
	
	this.update = function(force) {
		if (force) {
			this._update();
		} else {
			if (state == STATE.NONE && (lastRotateX || lastRotateY) ) {
			//	this.rotate(lastRotateX, lastRotateY);
			}
		}
	};
	
	
	this._update = function(skipEventDispatch) {
		
		if (this.object instanceof Array) {
			for (var i = 0; i < this.object.length; i++) {
				this._updateObject(this.object[i]);
			}
		} else {
			this._updateObject(this.object);
		}
		
		if (!skipEventDispatch) {
			this.dispatchEvent( changeEvent );
		}
	}
	
	this._updateObject = function(object) {
	
		var translateMatrix = new THREE.Matrix4();

		matrixPitch.identity().makeRotationX(this._pitch);
		matrixYaw.identity().makeRotationY(this._yaw);
		matrixRoll.identity().makeRotationZ(this._roll);
		matrixRoll.multiply(matrixPitch);
		this.modelView.identity();
		
		
		var m = new THREE.Matrix4();
		m.identity();
		m.makeRotationFromQuaternion(this.orientation);
		this.modelView.multiply(m);
		
		if (this.pitchType == KMG.SurfacePivot) {
			translateMatrix.makeTranslation(0, 0, this.radius);
			this.modelView.multiply( translateMatrix );
		}
		
		this.modelView.multiply( matrixYaw );
		this.modelView.multiply( matrixRoll );
		
		if (this.pitchType == KMG.SurfacePivot) {
			translateMatrix.makeTranslation(0, 0, -this.radius);
			this.modelView.multiply( translateMatrix );
		}
		
		if (!object.forceDefaultDistance) {
			translateMatrix.makeTranslation(0, 0, this.distance);
			this.modelView.multiply( translateMatrix );
		} else {
			translateMatrix.makeTranslation(0, 0, this.defaultDistance);
			this.modelView.multiply( translateMatrix );
		}

		translateMatrix.makeTranslation(0, this.panVertical, 0);
		this.modelView.multiply( translateMatrix );
		
		translateMatrix.makeTranslation(this.panHorizontal, 0, 0);
		this.modelView.multiply( translateMatrix );
		
		//
		if (this.translate) {
			translateMatrix.makeTranslation(this.translate.x, this.translate.y, this.translate.z);
			this.modelView.multiply( translateMatrix );
		}
		
		object.matrix.identity();
		object.applyMatrix(this.modelView);

		
	};
	
	this.eyeDistanceToCenter = function() {
		var position = new THREE.Vector3(0.0, 0.0, this.radius);
		position.rotate(this.pitch, "X");
		position.negate();
		
		var a = this.distance + position.z;
		
		var distanceToCenter = Math.sqrt((position.y * position.y) + (a * a));
		return distanceToCenter;
	};
	
	this.eyeDistanceToSurface = function() {
		var distanceToSurface = this.eyeDistanceToCenter();// - (this.radius * this.scale);
		return distanceToSurface;
	};
	
	this.setScale = function( scale ) {
		if (scale > this.maxScale)
			scale = this.maxScale;
		if (scale < this.minScale)
			scale = this.minScale;
		this.scale = scale;
	};
	
	this.setMinScale = function( minScale ) {
		this.minScale = minScale;
		if (this.scale < minScale)
			this.scale = minScale;
	};
	
	this.setMaxScale = function( maxScale ) {
		this.maxScale = maxScale;
		if (this.scale > maxScale)
			this.scale = maxScale;
	};
	
	this.pitch = function ( pitch ) {
		this.setPitch(this._pitch + (pitch * this.rotateSpeed));
	};
	
	this.setPitch = function( pitch ) {
		if (pitch > this.maxPitch) 
			pitch = this.maxPitch;
		if (pitch < this.minPitch)
			pitch = this.minPitch;
		this._pitch = pitch;
		this._update();
	};
	
	this.setMinPitch = function( minPitch ) {
		this.minPitch = minPitch;
		if (this._pitch < minPitch)
			this._pitch = minPitch;
	};
	
	this.setMaxPitch = function( maxPitch ) {
		this.maxPitch = maxPitch;
		if (this._pitch > maxPitch)
			this._pitch = maxPitch;
	};
	
	this.roll = function ( roll ) {
		this.setRoll(this._roll + (roll * this.rotateSpeed));
	};
	
	this.setRoll = function( roll ) {
		this._roll = roll;
		this._update();
	};
	
	
	this.setDistance = function( distance ) {
		if (distance > this.maxDistance)
			distance = this.maxDistance;
		if (distance < this.minDistance)
			distance = this.minDistance;
		this.distance = distance;
		this._update();
	};
	
	this.setMinDistance = function( minDistance ) {
		this.minDistance = minDistance;
		if (this.distance < minDistance)
			this.distance = minDistance;
	};
	
	this.setMaxDistance = function( maxDistance ) {
		this.maxDistance = maxDistance;
		if (this.distance > maxDistance)
			this.distance = maxDistance;
	};
	
	
	this.pan = function(amount, direction) {
		if (!direction || direction === DIRECTION.VERTICAL) {
			this.panVertical = this.panVertical + amount;
		} else if (direction === DIRECTION.HORIZONTAL) {
			this.panHorizontal = this.panHorizontal + amount;
		}
		this._update();
	};
	
	
	function _adjustDistanceByDelta(delta) {
		// Adjust the distance by a proportional amount every time
		var ratio = scope.distanceMoveSpeed / scope.defaultDistance;
		var distanceMove = ratio * scope.distance;
		
		scope.setDistance(scope.distance + (-delta * distanceMove));
	}
	
	// Events
	function onMouseDown( event ) {
		if (!scope.enabled) return;
		
		lastX = event.clientX;
		lastY = event.clientY;
		
		mouseDownX = event.clientX;
		mouseDownY = event.clientY;
		
		lastRotateX = 0;
		lastRotateY = 0;
		
		// Should be:
		// Left Button -> Rotate
		// Shift + Left Button -> Pitch/Roll
		// Ctrl + Left Button -> Pan
		// Middle Button -> Pitch/Roll
		// Right Button -> Zoom

		if ( event.button === 0 && !event.ctrlKey && !event.shiftKey) {
			state = STATE.ROTATE;
		} else if (event.button == 0 && event.ctrlKey) {
			state = STATE.PAN;
		} else if (event.button == 0 && event.shiftKey) {
			state = STATE.PITCH_ROLL_YAW;
		} else if ( event.button === 1 ) {
			state = STATE.PITCH_ROLL_YAW;
		} else if ( event.button === 2) {
			state = STATE.ZOOM_SMOOTH;
		} 

		document.addEventListener( 'mousemove', onMouseMove, false );
		document.addEventListener( 'mouseup', onMouseUp, false );
	}
	
	function onMouseMove( event ) {
		if (!scope.enabled) return;
	
		event.preventDefault();
		
		if (state === STATE.NONE) {
			return;
		}
		
		var xDelta = event.clientX - lastX;
		var yDelta = event.clientY - lastY;
		
		if ( state === STATE.ROTATE ) {
			scope.rotate( (yDelta * (Math.PI / 180)), (xDelta * (Math.PI / 180)) );
		} else if ( state === STATE.ZOOM ) {
			_adjustDistanceByDelta(-yDelta);
		} else if ( state === STATE.ZOOM_SMOOTH) {
			_adjustDistanceByDelta(event.clientY - mouseDownY);
		} else if ( state === STATE.PAN ) {
			scope.pan(yDelta, DIRECTION.VERTICAL);
			scope.pan(-xDelta, DIRECTION.HORIZONTAL);
		} else if ( state === STATE.PITCH_ROLL_YAW ) {
			scope.pitch(yDelta * (Math.PI / 180));
			scope.roll(xDelta * (Math.PI / 180));
		}
		
		lastX = event.clientX;
		lastY = event.clientY;
	}
	
	function onMouseUp( event ) {
		if (!scope.enabled) return;
		
		document.removeEventListener( 'mousemove', onMouseMove, false );
		document.removeEventListener( 'mouseup', onMouseUp, false );
		
		
		mouseDownX = -1;
		mouseDownY = -1;
		lastX = -1;
		lastY = -1;
		state = STATE.NONE;
		
	}
	
	function onMouseWheel( event ) {
		if ( scope.enabled === false ) return;
		
		var delta = 0;

		if ( event.wheelDelta ) { // WebKit / Opera / Explorer 9
			delta = event.wheelDelta;
		} else if ( event.detail ) { // Firefox
			delta = -event.detail * 20;
		}
		
		_adjustDistanceByDelta(delta);
	}
	
	function onKeyDown( event ) {
		
	}
	
	
	
	
	this.domElement.addEventListener( 'contextmenu', function ( event ) { event.preventDefault(); }, false );
	this.domElement.addEventListener( 'mousedown', onMouseDown, false );
	this.domElement.addEventListener( 'mousewheel', onMouseWheel, false );
	this.domElement.addEventListener( 'DOMMouseScroll', onMouseWheel, false ); // firefox
	this.domElement.addEventListener( 'keydown', onKeyDown, false );

};

KMG.ExamineControls.prototype = Object.create( THREE.EventDispatcher.prototype );
/* File: OrbitControls.js */


/**
 * @author qiao / https://github.com/qiao
 * @author mrdoob / http://mrdoob.com
 * @author alteredq / http://alteredqualia.com/
 * @author WestLangley / http://github.com/WestLangley
 */

THREE.OrbitControls = function ( object, domElement ) {

	this.object = object;
	this.domElement = ( domElement !== undefined ) ? domElement : document;

	// API

	this.enabled = true;

	this.center = new THREE.Vector3();

	this.userZoom = true;
	this.userZoomSpeed = 1.0;

	this.userRotate = true;
	this.userRotateSpeed = 1.0;

	this.userPan = true;
	this.userPanSpeed = 2.0;

	this.autoRotate = false;
	this.autoRotateSpeed = 2.0; // 30 seconds per round when fps is 60

	this.minPolarAngle = 0; // radians
	this.maxPolarAngle = Math.PI; // radians

	this.minDistance = 0;
	this.maxDistance = Infinity;

	this.keys = { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40 };

	// internals

	var scope = this;

	var EPS = 0.000001;
	var PIXELS_PER_ROUND = 1800;

	var rotateStart = new THREE.Vector2();
	var rotateEnd = new THREE.Vector2();
	var rotateDelta = new THREE.Vector2();

	var zoomStart = new THREE.Vector2();
	var zoomEnd = new THREE.Vector2();
	var zoomDelta = new THREE.Vector2();
	
	var touchZoomDistanceStart = 0;
	var touchZoomDistanceEnd = 0;
	
	var phiDelta = 0;
	var thetaDelta = 0;
	var scale = 1;

	this.lastPosition = new THREE.Vector3();

	var STATE = { NONE: -1, ROTATE: 0, ZOOM: 1, PAN: 2, TOUCH_ROTATE : 3, TOUCH_ZOOM : 4, TOUCH_PAN : 5 };
	var state = STATE.NONE;

	// events

	var changeEvent = { type: 'change' };


	this.rotateLeft = function ( angle ) {

		if ( angle === undefined ) {

			angle = getAutoRotationAngle();

		}

		thetaDelta -= angle;

	};

	this.rotateRight = function ( angle ) {

		if ( angle === undefined ) {

			angle = getAutoRotationAngle();

		}

		thetaDelta += angle;

	};

	this.rotateUp = function ( angle ) {

		if ( angle === undefined ) {

			angle = getAutoRotationAngle();

		}

		phiDelta -= angle;

	};

	this.rotateDown = function ( angle ) {

		if ( angle === undefined ) {

			angle = getAutoRotationAngle();

		}

		phiDelta += angle;

	};

	this.zoomIn = function ( zoomScale ) {

		if ( zoomScale === undefined ) {

			zoomScale = getZoomScale();

		}

		scale /= zoomScale;

	};

	this.zoomOut = function ( zoomScale ) {

		if ( zoomScale === undefined ) {

			zoomScale = getZoomScale();

		}

		scale *= zoomScale;

	};

	this.pan = function ( distance ) {

		distance.transformDirection( this.object.matrix );
		distance.multiplyScalar( scope.userPanSpeed );

		//this.object.position.add( distance );
		this.center.add( distance );

	};

	this.update = function () {

		var position = this.object.position;
		var offset = position.clone().sub( this.center );

		// angle from z-axis around y-axis

		var theta = Math.atan2( offset.x, offset.z );

		// angle from y-axis

		var phi = Math.atan2( Math.sqrt( offset.x * offset.x + offset.z * offset.z ), offset.y );

		if ( this.autoRotate ) {

			this.rotateLeft( getAutoRotationAngle() );

		}

		theta += thetaDelta;
		phi += phiDelta;

		// restrict phi to be between desired limits
		phi = Math.max( this.minPolarAngle, Math.min( this.maxPolarAngle, phi ) );

		// restrict phi to be betwee EPS and PI-EPS
		phi = Math.max( EPS, Math.min( Math.PI - EPS, phi ) );

		var radius = offset.length() * scale;

		// restrict radius to be between desired limits
		radius = Math.max( this.minDistance, Math.min( this.maxDistance, radius ) );

		offset.x = radius * Math.sin( phi ) * Math.sin( theta );
		offset.y = radius * Math.cos( phi );
		offset.z = radius * Math.sin( phi ) * Math.cos( theta );

		position.copy( this.center ).add( offset );

		this.object.lookAt( this.center );
		
		if (state == STATE.ROTATE) {
			thetaDelta = 0;
			phiDelta = 0;
		}
		
		
		scale = 1;

		if ( this.lastPosition.distanceTo( this.object.position ) > 0 ) {

			this.dispatchEvent( changeEvent );

			this.lastPosition.copy( this.object.position );

		}

	};


	function getAutoRotationAngle() {

		return 2 * Math.PI / 60 / 60 * scope.autoRotateSpeed;

	}

	function getZoomScale() {

		return Math.pow( 0.95, scope.userZoomSpeed );

	}

	function onMouseDown( event ) {

		if ( scope.enabled === false ) return;
		if ( scope.userRotate === false ) return;
		
		thetaDelta = 0;
		phiDelta = 0;
		
		event.preventDefault();

		if ( event.button === 0 ) {

			state = STATE.ROTATE;

			rotateStart.set( event.clientX, event.clientY );

		} else if ( event.button === 1 ) {

			state = STATE.ZOOM;

			zoomStart.set( event.clientX, event.clientY );

		} else if ( event.button === 2 ) {

			state = STATE.PAN;

		}

		document.addEventListener( 'mousemove', onMouseMove, false );
		document.addEventListener( 'mouseup', onMouseUp, false );

	}

	function onMouseMove( event ) {

		if ( scope.enabled === false ) return;

		event.preventDefault();

		if ( state === STATE.ROTATE ) {

			rotateEnd.set( event.clientX, event.clientY );
			rotateDelta.subVectors( rotateEnd, rotateStart );

			scope.rotateLeft( 2 * Math.PI * rotateDelta.x / PIXELS_PER_ROUND * scope.userRotateSpeed );
			scope.rotateUp( 2 * Math.PI * rotateDelta.y / PIXELS_PER_ROUND * scope.userRotateSpeed );

			rotateStart.copy( rotateEnd );

		} else if ( state === STATE.ZOOM ) {

			zoomEnd.set( event.clientX, event.clientY );
			zoomDelta.subVectors( zoomEnd, zoomStart );

			if ( zoomDelta.y > 0 ) {

				scope.zoomIn();

			} else {

				scope.zoomOut();

			}

			zoomStart.copy( zoomEnd );

		} else if ( state === STATE.PAN ) {

			var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
			var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

			scope.pan( new THREE.Vector3( - movementX, movementY, 0 ) );

		}

	}

	function onMouseUp( event ) {

		if ( scope.enabled === false ) return;
		if ( scope.userRotate === false ) return;

		document.removeEventListener( 'mousemove', onMouseMove, false );
		document.removeEventListener( 'mouseup', onMouseUp, false );

		state = STATE.NONE;

	}

	function onMouseWheel( event ) {

		if ( scope.enabled === false ) return;
		if ( scope.userZoom === false ) return;

		var delta = 0;

		if ( event.wheelDelta ) { // WebKit / Opera / Explorer 9

			delta = event.wheelDelta;

		} else if ( event.detail ) { // Firefox

			delta = - event.detail;

		}

		if ( delta > 0 ) {

			scope.zoomOut();

		} else {

			scope.zoomIn();

		}

	}

	function onKeyDown( event ) {

		if ( scope.enabled === false ) return;
		if ( scope.userPan === false ) return;
		
		/*
		scope.rotateLeft( 2 * Math.PI * rotateDelta.x / PIXELS_PER_ROUND * scope.userRotateSpeed );
			scope.rotateUp( 2 * Math.PI * rotateDelta.y / PIXELS_PER_ROUND * scope.userRotateSpeed );
		*/
		
		switch ( event.keyCode ) {
		
			case scope.keys.UP:
				scope.pan( new THREE.Vector3( 0, 1, 0 ) );
				break;
			case scope.keys.BOTTOM:
				scope.pan( new THREE.Vector3( 0, - 1, 0 ) );
				break;
			case scope.keys.LEFT:
				scope.pan( new THREE.Vector3( - 1, 0, 0 ) );
				break;
			case scope.keys.RIGHT:
				scope.pan( new THREE.Vector3( 1, 0, 0 ) );
				break;
		}

	}

	this.domElement.addEventListener( 'contextmenu', function ( event ) { event.preventDefault(); }, false );
	this.domElement.addEventListener( 'mousedown', onMouseDown, false );
	this.domElement.addEventListener( 'mousewheel', onMouseWheel, false );
	this.domElement.addEventListener( 'DOMMouseScroll', onMouseWheel, false ); // firefox
	this.domElement.addEventListener( 'keydown', onKeyDown, false );
	
	// KMG: Adding touch support for OrbitControls, mainly as a migration of the code
	//      from TrackballControls.js
	function touchstart( event ) {
		if ( scope.enabled === false ) return;
		
		event.preventDefault();
		
		switch ( event.touches.length ) {

			case 1:
				state = STATE.TOUCH_ROTATE;
				rotateStart.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
				break;

			case 2:
				state = STATE.TOUCH_ZOOM;

				break;

			case 3:
				state = STATE.TOUCH_PAN;
				break;

			default:
				state = STATE.NONE;

		}
	}

	function touchmove( event ) {
		if ( scope.enabled === false ) return;

		event.preventDefault();
		event.stopPropagation();

		switch ( event.touches.length ) {

			case 1:
			
				rotateEnd.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
				rotateDelta.subVectors( rotateEnd, rotateStart );

				scope.rotateLeft( 2 * Math.PI * rotateDelta.x / PIXELS_PER_ROUND * scope.userRotateSpeed );
				scope.rotateUp( 2 * Math.PI * rotateDelta.y / PIXELS_PER_ROUND * scope.userRotateSpeed );

				rotateStart.copy( rotateEnd );
			
				break;

			case 2:

				break;

			case 3:
				//_panEnd = _this.getMouseOnScreen( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
				break;

			default:
				state = STATE.NONE;

		}

	}

	function touchend( event ) {
		if ( scope.enabled === false ) return;

		if ( scope.enabled === false ) return;
		if ( scope.userRotate === false ) return;

		//document.removeEventListener( 'mousemove', onMouseMove, false );
		//document.removeEventListener( 'mouseup', onMouseUp, false );

		state = STATE.NONE;


	}
	
	this.domElement.addEventListener( 'touchstart', touchstart, false );
	this.domElement.addEventListener( 'touchend', touchend, false );
	this.domElement.addEventListener( 'touchmove', touchmove, false );
};

THREE.OrbitControls.prototype = Object.create( THREE.EventDispatcher.prototype );

/* File: GUI.js */
/**
 * PlanetMaker JavaScript Controller API
 * http://planetmaker.wthr.us
 * 
 * Copyright 2013 Kevin M. Gill
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 */
 
KMG.TopLeft = "TL";
KMG.TopRight = "TR";
KMG.BottomLeft = "BL";
KMG.BottomRight = "BR";

KMG.Opened = 0;
KMG.Closed = 1;

//http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
KMG.GUID = {

	guid : function() {
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
			return v.toString(16);
		});
	}

};


KMG.OptionController = function(property, title) {

	var changeListeners = [];
	
	this.addChangeListener = function(changeListener) {
		changeListeners.push(changeListener);
	};

	this.onChange = function(oldValue, newValue) {
		
		for (var i = 0; i < changeListeners.length; i++) {
			changeListeners[i](property, title, oldValue, newValue);
		}
	
	};

};

/**
 * @class Provides an individual block of controllers. This is the base component as the user
 * will see it (though not the base in terms of the DOM). Individual controls will
 * be added to instances of this object.
 *
 * @param {string} title Title of the block
 * @param {Object} config Property object backing the controls
 * @param {function} changeListener Callback function fired when a control's value is modified by the user
 *
 * @member KMG
 */
KMG.Block = function ( title, config, changeListener ) {
	
	this.config = config;
	this.changeListener = changeListener;
	var scope = this;
	
	var expandState = KMG.Opened;
	
	var container = $("<div/>").addClass("control-outter-container");
	
	var id = KMG.GUID.guid();
	var element = $("<div/>");
	element.attr("id", id);
	element.addClass("control-container");
	element.appendTo(container);
	
	var expandIcon = $("<a/>").addClass("expand-icon")
							.attr("href", "#")
							.text("-")
							.attr("title", "Click to expand or retract")
							.click(function() { 
								scope.setExpandedState(
									(expandState == KMG.Opened) ? KMG.Closed : KMG.Opened
								);
							}).appendTo(element);
	
	element.append($("<div class='header-title'>" + title + "</div>"));

	var controlContainer = $("<div/>").addClass("inner-container").appendTo(element);

	var controlList = $("<ul/>");
	controlList.appendTo(controlContainer);
	
	var scrollBar = $("<div/>").addClass("control-container-scrollbar-vertical").appendTo(controlContainer);
	$("<hr/>").appendTo(scrollBar);
	
	var lastY = -1;
	var mouseDown = false;
	scrollBar.mousedown(function(e) {
		mouseDown = true;
		lastY = e.clientY;
		scrollBar.addClass("unselectable");
		//console.debug('Mouse Down');
	});
	
	$(document).mouseup(function(e) {
		mouseDown = false;
		scrollBar.removeClass("unselectable");
		//console.debug('Mouse Up');
	});
	
	controlList.hasScrollBar = function() {
        return this.get(0).scrollHeight > this.height();
    };

	
	$(document).mousemove(function(e) {
		if (!mouseDown || (lastY <= e.clientY && !controlList.hasScrollBar())) {
			return;
		}
		e.preventDefault();
		var height = e.clientY - controlList.offset().top - 5;
		//console.debug("Setting height to " + height);
		controlList.css("height", height);
		
		lastY = e.clientY;
	});
	
	function fireChangeListener() {
		if (changeListener != null) {
			changeListener();
		}
	}
	
	this.getElement = function()
	{
		return container;
	}
	
	function isValueFloatingPoint(n) {
		return !isNaN(parseFloat(n)) && isFinite(n);
	}
	
	/**
     * 
     * @param property
	 * @param title
	 * @param min
	 * @param max
	 * @param step
     */
	this.addRange = function(property, title, min, max, step) {
		if (!min)
			min = 0;
		if (!max) 
			max = 100;
		if (!step) 
			step = 1;
	
		var slider, text;
		
		var controller = new KMG.OptionController(property, title);
		
		var onSlide = function( event, ui ) {
			var oldValue = config[property];
			config[property] = ui.value;
			text.val(ui.value);
			controller.onChange(oldValue, config[property]);
			fireChangeListener();
		};
	
		var id = KMG.GUID.guid();
		var li = $("<li/>");
		$("<label for='" + id + "'>"+title+"</label>").addClass("control-label").appendTo(li);
		slider = $("<div/>").attr("id", id)
				.addClass("slider-control")
				.slider({
					value : config[property],
					min : min,
					max : max,
					step : step,
					range : "min",
					slide : onSlide,
					change : onSlide
				})
				.appendTo(li);
		text = $("<input/>").attr("type", "text")
					.addClass("value-text")
					.css("width", "40px")
					.css("margin-left", "10px")
					.on('input', function(e) {

						var value = $(this).val();
						
						// If the user blanked the input, let them enter something new before we start messing with it
						if (value === "") {
							return;
						}
						
						// Validate that the input value is a number
						if (!isValueFloatingPoint(value)) {
							$(this).val(config[property]);
							return;
						}

						// Validate that the input value falls within proper ranges
						if (value < min) {
							value = min;
							$(this).val(value);
						} else if (value > max) {
							value = max;
							$(this).val(value);
						}
						
						slider.slider("value", value);
						fireChangeListener();
					}).val(config[property])
					.appendTo(li);
		li.appendTo(controlList);
		
		return controller;
	};
	
	/**
     * 
     * @param property
	 * @param title
	 * @param options
     */
	this.addSelect = function(property, title, options) {
		var id = KMG.GUID.guid();
		var li = $("<li/>");
		$("<label for='" + id + "'>"+title+"</label>").addClass("control-label").appendTo(li);
		var select = $("<select id='" + id + "'></select>").appendTo(li);
		
		
		var controller = new KMG.OptionController(property, title);
		
		select.change(function(e) {
			var oldValue = config[property];
			config[property] = $(select).val();
			controller.onChange(oldValue, config[property]);
			fireChangeListener();
		});
		
		if (options) {
			$.each(options, function(key, value) {
				var option = $("<option/>").attr("value", value).text(value);
				if (value === config[property]) {
					option.attr("selected", "true");
				}
				option.appendTo(select);
			});
		}
		li.appendTo(controlList);
		
		return controller;
	};
	
	/**
     * 
     * @param property
	 * @param title
     */
	this.addToggle = function(property, title) {
		var id = KMG.GUID.guid();
		var li = $("<li/>");
		var oldValue;
		
		$("<label for='" + id + "'>"+title+"</label>").addClass("control-label").appendTo(li);
		var check = $("<input type='checkbox'/>").attr("id", id);
		if (config[property] === true) {
			check.attr("checked", "true");
		}

		var controller = new KMG.OptionController(property, title);
		
		check.click(function(e) {
			oldValue = config[property];
			config[property] = check.prop('checked');
			controller.onChange(oldValue, config[property]);
			//console.debug("Setting '" + property + "' to '" + config[property] + "'");
			fireChangeListener();
		});
		check.appendTo(li);
		
		li.appendTo(controlList);
		return controller;
	};
	
	/**
     * 
     * @param array
     */
	function arrayToColor(array)
	{
		var r = parseInt(array[0]);
		var g = parseInt(array[1]);
		var b = parseInt(array[2]);
		var rgb = "rgb("+r+","+g+","+b+")";
		return rgb;
	}
	
	// https://github.com/vanderlee/colorpicker
	/**
     * 
     * @param property
	 * @param title
     */
	this.addColor = function(property, title) {
		var id = KMG.GUID.guid();
		var li = $("<li/>");
		$("<label for='" + id + "'>"+title+"</label>").addClass("control-label").appendTo(li);
		$("<input/>").attr("id", id)
					.attr("type", "text")
					.val(arrayToColor(config[property]))
					.colorpicker({
						colorFormat : "RGB",
						color : arrayToColor(config[property]),
						ok: function(event, color) {
							config[property] = [color.rgb.r*255, color.rgb.g*255, color.rgb.b*255];
							//console.debug("Set '" + property + "' to '" + config[property] + "'");
							fireChangeListener();
						}
					}).appendTo(li);

		li.appendTo(controlList);
	};
	
	/**
     * 
     */
	function getLocalTimeZoneOffsetMillis()
	{
		var dt = new Date();
		return dt.getTimezoneOffset() * 60000;
	}
	
	// http://trentrichardson.com/examples/timepicker/
	/**
     * 
     * @param property
	 * @param title
     */
	this.addDateTime = function(property, title) {
		var id = KMG.GUID.guid();
		var li = $("<li/>");
		
		$("<label for='" + id + "'>"+title+"</label>").addClass("control-label").appendTo(li);
		
		var picker = $("<input/>").attr("type", "text")
								.attr("id", id)
								.datetimepicker({
									showButtonPanel: true,
									changeMonth: true,
									changeYear: true,
									yearRange : "c-25:c+25",
									onSelect : function(dateText, el) {
										config[property] = picker.datetimepicker('getDate').getTime();// - getLocalTimeZoneOffsetMillis();
										//console.debug("Setting '" + property + "' to '" + (new Date(config[property] - getLocalTimeZoneOffsetMillis())) + "'");
										fireChangeListener();
									}
								}).appendTo(li);
		if (config[property]) {
			picker.datetimepicker('setDate', (new Date(config[property])) );
		}
		
		li.appendTo(controlList);
	};
	
	
	
	/**
     * 
     * @param property
	 * @param title
     */
	this.addDate = function(property, title) {
		var id = KMG.GUID.guid();
		var li = $("<li/>");
		
		$("<label for='" + id + "'>"+title+"</label>").addClass("control-label").appendTo(li);
		
		var picker = $("<input/>").attr("type", "text")
								.attr("id", id)
								.datepicker({
									showButtonPanel: true,
									changeMonth: true,
									changeYear: true,
									yearRange : "c-25:c+25",
									onSelect : function(dateText, el) {
										config[property] = picker.datepicker('getDate').getTime() - getLocalTimeZoneOffsetMillis();
										//console.debug("Setting '" + property + "' to '" + (new Date(config[property] - getLocalTimeZoneOffsetMillis())) + "'");
										fireChangeListener();
									}
								}).appendTo(li);
		if (config[property]) {
			picker.datetimepicker('setDate', (new Date(config[property] + getLocalTimeZoneOffsetMillis())) );
		}
		
		li.appendTo(controlList);
	};
	
	/**
     * 
     * @param input
	 * @param label
	 * @param property
	 * @param validation
     */
	function onTextInput(input, label, property, validation) {
		var valid = true;
		if (validation && typeof validation === 'function' ) {
			valid = validation(input.val());
		} else if (validation && validation instanceof RegExp) {
			valid = validation.test(input.val());
		}
		if (valid) {
			input.removeClass('invalid-value-input');
			label.removeClass('invalid-value-label');
			config[property] = input.val();
		} else {
			input.addClass('invalid-value-input');
			label.addClass('invalid-value-label');
		}
	}
	
	/**
     * 
     * @param property
	 * @param title
	 * @param validation
     */
	this.addText = function(property, title, validation) {
		var id = KMG.GUID.guid();
		var li = $("<li/>");
		
		var label = $("<label for='" + id + "'>"+title+"</label>").addClass("control-label").appendTo(li);

		var text = $("<input/>").attr("type", "text")
								.on('input', function(e) {
									onTextInput($(this), label, property, validation);
								}).val(config[property]).appendTo(li);
		
		li.appendTo(controlList);
		
		onTextInput(text, label, property, validation);
	};
	
	/**
     * 
     * @param title
	 * @param callback
     */
	this.addAction = function(title, callback) {
		var id = KMG.GUID.guid();
		var li = $("<li/>");

		$("<button/>").text(title)
					.attr("id", id)
					.button()
					.click(function(e) {
						callback(e, $(this));
					}).appendTo(li);
		
		li.appendTo(controlList);
	};
	
	/**
     * 
     * @param href
	 * @param text
	 * @param title
     */
	this.addLink = function(href, text, title, target) {
		if (!title) {
			title = text;
		}
		if (!target) {
			target = "_self";
		}
		var id = KMG.GUID.guid();
		var li = $("<li/>");
		$("<a/>").text(text)
				.attr("id", id)
				.attr("href", href)
				.attr("title", title)
				.attr("target", target)
				.appendTo(li);
		
		li.appendTo(controlList);
	};

	/**
     * 
     * @param el
     */
	this.addElement = function(el) {
		var id = KMG.GUID.guid();
		var li = $("<li/>");
		$(el).appendTo(li);
		li.appendTo(controlList);
	};
	
	/**
     * 
     * @param anchor
	 * @param x
	 * @param y
     */
	this.setPosition = function(anchor, x, y) {
		switch(anchor[0]) {
		case "T":
			element.css("top", y);
			break;
		case "B":
			element.css("bottom", y);
			break;
		};
		
		switch(anchor[1]) {
		case "L":
			element.css("left", x);
			break;
		case "R":
			element.css("right", x);
			break;
		};
	};
	
	/**
     * 
     * @param visible
     */
	this.setVisible = function(visible) {
		element.css("display", (visible ? "inline-block" : "none"));
	};
	
	/**
     * 
     * @param state
     */
	this.setExpandedState = function(state) {
		expandState = state;
		if (state == KMG.Opened) {
			controlContainer.css("display", "inline-block");
			element.removeClass().addClass("control-container");
			controlContainer.addClass("inner-container");
			expandIcon.text("-");
		} else {
			controlContainer.css("display", "none");
			expandIcon.text("+");
		}
		
	};
	
};



/**
 * @class 
 *
 * @param {Object} config 
 * @param {function} changeListener
 *
 * @member KMG
 */
KMG.SideBar = function(config, changeListener, addClasses) {
	this.defaultConfig = config;
	this.defaultChangeListener = changeListener;
	var scope = this;
	
	var id = KMG.GUID.guid();
	var element = $("<div/>");
	element.attr("id", id);
	element.addClass("control-sidebar");
	element.css("display", "inline");
	element.css("position", "absolute");
	element.appendTo('body');
	
	for (var i = 0; i < addClasses.length; i++) {
		element.addClass(addClasses[i]);
	}
	
	/**
     * 
     * @param block
     */
	this.addBlock = function(block) {
		element.append(block.getElement());
	};
	
	this.removeBlock = function(block) {
		block.getElement().remove();
	};
	
	/**
     * 
     * @param title
	 * @param config
	 * @param changeListener
     */
	this.createBlock = function( title, config, changeListener ) {
		if (!config) {
			config = this.defaultConfig;
		}
		
		if (!changeListener) {
			changeListener = this.defaultChangeListener;
		}
		
		var block = new KMG.Block(title, config, changeListener);
		this.addBlock(block);
		return block;
	};
	

	
	
	/**
     * 
     * @param anchor
	 * @param x
	 * @param y
     */
	this.setPosition = function(anchor, x, y) {
		switch(anchor[0]) {
		case "T":
			element.css("top", y);
			break;
		case "B":
			element.css("bottom", y);
			break;
		};
		
		switch(anchor[1]) {
		case "L":
			element.css("left", x);
			break;
		case "R":
			element.css("right", x);
			break;
		};
	};
	
	/**
     * 
     * @param opacity
     */
	this.setOpacity = function(opacity) {
		element.css("opacity", opacity);
	};
	
	/**
     * 
     * @param visible
     */
	this.setVisible = function(visible) {
		element.css("display", (visible ? "inline-block" : "none"));
	};
};


/**
 * @class 
 *
 * @param {Object} config 
 * @param {function} changeListener
 *
 * @member KMG
 */
KMG.GUI = function(config, changeListener) {

	
	var scope = this;
	
	this.onVisibilityChanged = null;
	
	this.left = new KMG.SideBar(config, changeListener, ["control-sidebar-left"]);
	this.right = new KMG.SideBar(config, changeListener, ["control-sidebar-right"]);
	
	this.left.setPosition("TL", "10px", "100px");
	this.right.setPosition("TR", "10px", "100px");
	
	var showGui = $("<div/>").addClass('control-show-gui')
							.css('display', 'none')
							.appendTo('body');
	$("<a/>").attr("href", "#")
			.text('Show Controls')
			.on('click', function(e) {
				scope.setVisible(true);
			}).appendTo(showGui);
	
	/**
     * 
     * @param opacity
     */
	this.setOpacity = function(opacity) {
		this.left.setOpacity(opacity);
		this.right.setOpacity(opacity);
	};
	
	/**
     * 
     * @param visible
     */
	this.setVisible = function(visible, suppressShowBlock) {
		this.left.setVisible(visible);
		this.right.setVisible(visible);
		
		if (!suppressShowBlock) {
			showGui.css('display', (visible ? 'none' : 'inline-block'));
		}
		
		if (this.onVisibilityChanged) {
			this.onVisibilityChanged(visible);
		}
	};

	
};

/* File: WebCam.js */
/**
 * PlanetMaker JavaScript Webcam Interface API
 * http://planetmaker.wthr.us
 * 
 * Copyright 2013 Kevin M. Gill
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 */

KMG.WebCamUtil = {

	isWebcamAvailable : function() {
		navigator.getUserMedia = ( navigator.getUserMedia ||
								navigator.webkitGetUserMedia ||
								navigator.mozGetUserMedia ||
								navigator.msGetUserMedia);
		return (navigator.getUserMedia) ? true : false;
	}

};


KMG.WebCam = function() {

	var scope = this;
	
	navigator.getUserMedia = ( navigator.getUserMedia ||
								navigator.webkitGetUserMedia ||
								navigator.mozGetUserMedia ||
								navigator.msGetUserMedia);
	
	var tVideo = document.getElementById('kmg-video');
	var tCanvas = document.createElement( 'canvas' );
	var tCtx = tCanvas.getContext( '2d' );
	

	var wcStream = null;
	
	var webcamReady = false;
	
	this.onError = function(title, body) { 
		console.error("Error: " + title + ": " + body);
	}

	
	this.capture = function(onReady, onFail, toGreyscale) {
		
		if (!webcamReady) {
			onFail();
			return;
		}
		
		try {
			tCtx.drawImage(tVideo, 0, 0, tVideo.videoWidth, tVideo.videoHeight, 0, 0, tCanvas.width, tCanvas.height);
		} catch (ex) {
			scope.onError("Webcam Error", "Failed to capture webcam frame");
			return;
		}
		
		var img = new Image();
		img.onload = function() {
			onReady(img);
		};
		img.onabort = img.onerror = function() {
			onFail();
		};
		
		if (toGreyscale) {
			var data = tCtx.getImageData(0, 0, tCanvas.width, tCanvas.height);
			
			for(var n = 0; n < data.width * data.height; n++) {
				var index = n*4;
				var intesity = data.data[index+0] * 0.2989 + data.data[index+1] * 0.5870 + data.data[index+2] * 0.1140;
				
				data.data[index+0] = intesity;
				data.data[index+1] = intesity;
				data.data[index+2] = intesity;
			}
			
			tCtx.putImageData(data, 0, 0);
		}
		
		img.src = tCanvas.toDataURL('image/webp');

	};


	
	function gotStream( stream ) {
		
		wcStream = stream;
		
		if( typeof webkitURL !== 'undefined' && webkitURL.createObjectURL ) {
			tVideo.src = webkitURL.createObjectURL( stream );
		} else if( window.URL ) {
			tVideo.src = window.URL.createObjectURL( stream );
		} else {
			tVideo.src = stream;
		}
        
		tVideo.onerror = function () {
			stream.stop();
			scope.onError("Error", "Failed to initialize webcam");
		};

		tVideo.onloadedmetadata = function(e) {
			tCanvas.width = tVideo.videoWidth;
            tCanvas.height = tVideo.videoHeight;
		};
		
		webcamReady = true;
    }
	
	function noStream() {
		scope.onError("Error", "No camera available.");
	}
	
	this.isCameraAvailable = function() {
		return (navigator.getUserMedia) ? true : false;
	};
	
	this.isActive = function() {
		return webcamReady;
	};
	
	this.start = function() {
		if (navigator.getUserMedia) {
			navigator.getUserMedia( { 'video': true }, gotStream, noStream);
			console.info("Started video");
		} else {
			scope.onError("Error", "Cannot start video: no user media or no camera available");
		}
	};
	
	this.pause = function() {
		if (wcStream) {
			wcStream.stop();
			webcamReady = false;
			console.info("Stopped video");
		}
	};
};

/* File: AppEnv.js */

var AppEnv = {

	config : {
		devMode : false,
		embedded : false,
		disablePlanet : false,
		noAnalytics : false
	},
	
	_getConfig : function(urlParam, defaultValue) {
		var param = AppEnv.getUrlVar(urlParam);
		if (param) {
			return true;
		} else {
			return defaultValue;
		}
	
	},
	
	isDevMode : function() {
		return AppEnv._getConfig("devMode", AppEnv.config.devMode);
	},
	
	isEmbedded : function() {
		return AppEnv._getConfig("embedded", AppEnv.config.embedded);
	},
	
	isPlanetDisabled : function() {
		return AppEnv._getConfig("disablePlanet", AppEnv.config.disablePlanet);
	},
	
	noAnalytics : function() {
		return AppEnv._getConfig("noga", AppEnv.config.noAnalytics);
	},
	

	getUrlVars: function() {
		var vars = [], hash;
		var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
		for(var i = 0; i < hashes.length; i++) {
			hash = hashes[i].split('=');
			vars.push(hash[0]);
			vars[hash[0]] = hash[1];
		}
		return vars;
	},
	getUrlVar: function(name){
		return AppEnv.getUrlVars()[name];
	}

};


/* File: ObjectRotator.js */

KMG.ObjectRotator = function(context, object, rotationSpeed) {
	KMG.BaseObject.call( this );
	var scope = this;
	this.rotationSpeed = rotationSpeed;
	this.object = object;
	
	var active = false;
	
	context.objects.push(this);
	
	function rotateObject(obj) {
		obj.rotation.y += (rotationSpeed*(Math.PI/180.0));
	}
	
	
	this.stop = function() {
		active = false;
	};
	
	this.start = function() {
		active = true;
	};
	
	this.update = function()
	{
		if (active) {
			if (object instanceof Array) {
				for (var i = 0; i < object.length; i++) {
					rotateObject(object[i]);
				}
			} else {
				rotateObject(object);
			}
		}
	};
};
KMG.ObjectRotator.prototype = Object.create( KMG.BaseObject.prototype );



KMG.PeriodObjectRotator = function(context, object, rotationalPeriod, tickController) {
	KMG.BaseObject.call( this );
	var scope = this;
	this.rotationalPeriod = rotationalPeriod;
	this.tickController = tickController;
	this.object = object;

	context.objects.push(this);

	
	this.update = function()
	{

		var rotation = ((this.tickController.tickJulian - this.tickController.getEpoch()) % this.rotationalPeriod) * 360 * (Math.PI / 180);
		if (!isNaN(rotation)) {
			if (object instanceof Array) {
				for (var i = 0; i < object.length; i++) {
					object[i].rotation.y = rotation;
				}
			} else {
				object.rotation.y = rotation;
			}
		}
		
		

	};
};
KMG.PeriodObjectRotator.prototype = Object.create( KMG.BaseObject.prototype );


/* File: EllipticalOrbiter.js */

KMG.BasicOrbiter = function(context, object, distance, rotationSpeed) {
	KMG.BaseObject.call( this );
	var scope = this;
	this.distance = distance;
	this.rotationSpeed = rotationSpeed;
	this.object = object;
	
	context.objects.push(this);

	function advanceOrbit(obj) {
		if (!obj.lastYRotation) {
			obj.lastYRotation = 0;
		}
		
		obj.lastYRotation += rotationSpeed;
		
		obj.position = new THREE.Vector3( 0, 0, -1000 );
		obj.position.multiplyScalar(distance);
		obj.position.rotateY(obj.lastYRotation*(Math.PI/180.0));
		
	}
	
	this.update = function()
	{
		if (object instanceof Array) {
			for (var i = 0; i < object.length; i++) {
				advanceOrbit(object[i]);
			}
		} else {
			advanceOrbit(object);
		}
		
	};
};
KMG.BasicOrbiter.prototype = Object.create( KMG.BaseObject.prototype );



KMG.EllipticalOrbiter = function(context, object, scale, orbitSpeed, orbit, centerObject, tickController, skipIfInvisible, dontAddToScene) {

	KMG.BaseObject.call( this );
	var scope = this;
	this.scale = (scale) ? scale : 5.0;
	this.orbitSpeed = (orbitSpeed) ? orbitSpeed : 1.0;
	//this.orbitConfig = orbitConfig;
	this.object = object;
	var epoch = 2451545;
	this.centerObject = centerObject;
	this.skipIfInvisible = skipIfInvisible;
	this.period = orbit.period;
	
	this.ownTickController = (tickController) ? false : true;
	this.tickController = (tickController) ? tickController : new KMG.TimeBasedTickController(orbitSpeed);
	if (this.ownTickController) {
		this.tickController.start();
	}
	
	if (!dontAddToScene) {
		context.objects.push(this);
	}
	

	function advanceOrbit(obj) {
		if (scope.ownTickController) {
			scope.tickController.update();
		}
		
		if (this.skipIfInvisible && !obj.visible) {
			return;
		}
		
		
		var t;
		if (!this.ownTickController && scope.tickController.tickJulian) {
			t = scope.tickController.tickJulian;
		} else {
			var tickPeriod = (360 / scope.orbitSpeed);
			t = epoch + (scope.tickController.ticks * tickPeriod);
		}

		var p = orbit.positionAtTime(t);
		
		obj.position = p;
		obj.position.multiplyScalar(scope.scale);
		
		if (scope.centerObject) {
			var centerPosition = scope.centerObject.position.clone();
			var centerOnEcliptic = new THREE.Vector3(centerPosition.x, 0, centerPosition.z);
			var centerObjectOrbitAngle = Math.abs(centerOnEcliptic.normalize().angleTo(new THREE.Vector3(0.0, 0.0, 1)));

			if (centerPosition.x < 0) {
				centerObjectOrbitAngle = KMG.RAD_180 + (KMG.RAD_180 - centerObjectOrbitAngle);
			}
			obj.position.add(centerPosition);
		
		}
		
		obj.updateMatrix();
	}
	
	this.update = function()
	{
		if (object instanceof Array) {
			for (var i = 0; i < object.length; i++) {
				advanceOrbit(object[i]);
			}
		} else {
			advanceOrbit(object);
		}
	};
	

};
KMG.EllipticalOrbiter.prototype = Object.create( KMG.BaseObject.prototype );

/* File: EphemerisOrbiter.js */



KMG.EphemerisOrbiter = function(context, object, scale, orbitSpeed, orbit, vectors, displayFuture, centerObjectVectors, centerObjectElements, tickController, skipIfInvisible) {

	KMG.BaseObject.call( this );
	var scope = this;
	this.scale = (scale) ? scale : 5.0;
	this.orbitSpeed = (orbitSpeed) ? orbitSpeed : 1.0;
	this.centerObjectVectors = centerObjectVectors;
	this.centerObjectElements = centerObjectElements;
	this.displayFuture = displayFuture;
	this.period = orbit.period;
	
	this.ownTickController = (tickController) ? false : true;
	this.tickController = (tickController) ? tickController : new KMG.TimeBasedTickController(orbitSpeed);
	if (this.ownTickController) {
		this.tickController.start();
	}
	
	var vectorsStartDate = vectors.data[0].epoch;
	var vectorsEndDate = vectors.data[vectors.data.length - 1].epoch;
	

	var ellipticalOrbiter = orbit;
	
	context.objects.push(this);
	
	function getTickTime() {
		if (scope.ownTickController) {
			scope.tickController.update();
		}

		var t;
		if (!this.ownTickController && scope.tickController.tickJulian) {
			t = scope.tickController.tickJulian;
		} else {
			var tickPeriod = (360 / scope.orbitSpeed);
			t = epoch + (scope.tickController.ticks * tickPeriod);
		}
		
		return t;
	}
	
	
	function isDateInVectorRange(t) {
		return (t <= vectorsEndDate || (!scope.displayFuture && t >= vectorsEndDate));
	}
	
	function getDateFraction(t) {
		if (!isDateInVectorRange(t)) {
			return -1;
		}
		
		var f = (t - vectorsStartDate) / (vectorsEndDate - vectorsStartDate);
		return f;
	}
	
	function getVectorIndexForDateFraction(f) {
		var i = f * vectors.data.length;
		return i;
	}
	
	function getVectorsForDate(t) {
	
	
	
		if (!isDateInVectorRange(t)) {
			return -1;
		}

		// if the request date is before the vectors, then we assume it to be before the launch.
		// This should only apply to artificial spacecraft
		if (t < vectorsStartDate) {
			return {
				f : 0,
				lower : vectors.data[0],
				upper : vectors.data[0]
			};
		} else if (!scope.displayFuture && t >= vectorsEndDate) {
			return {
				f : 0,
				lower : vectors.data[ephemeris.vectors.data.length - 1],
				upper : vectors.data[ephemeris.vectors.data.length - 1]
			};
		} else {
		
			var f = getDateFraction(t);
			var i = getVectorIndexForDateFraction(f);
			
			var lower = parseInt(i);
			var upper = parseInt(Math.round(i+0.5));
			
			if (upper >= vectors.data.length) {
				upper = lower;
			}

			return {
				f : i - Math.floor(i),
				lower : vectors.data[lower],
				upper : vectors.data[upper]
			};
		}
		
	}
	
	function getInterpolatedVectorForDate(t) {
		if (!isDateInVectorRange(t)) {
			return -1;
		}
		
		var vectors = getVectorsForDate(t);
		if (vectors == -1) {
			return -1;
		}
		
		var x = (vectors.upper.x * vectors.f) + (vectors.lower.x * (1-vectors.f));
		var y = (vectors.upper.y * vectors.f) + (vectors.lower.y * (1-vectors.f));
		var z = (vectors.upper.z * vectors.f) + (vectors.lower.z * (1-vectors.f));

		return new THREE.Vector3(x, z, -y);
	}
	
	
	function advanceOrbit(object) {
		
		var t = getTickTime();
		
		if (scope.skipIfInvisible && !object.visible) {
			return;
		}
		
		
		if (isDateInVectorRange(t)) {
			
			var vector = getInterpolatedVectorForDate(t);
			
			object.position = vector;
			object.position.multiplyScalar(scope.scale);
			
			if (scope.centerObjectVectors) {
				var centerPosition = scope.centerObjectVectors.position.clone();
				var centerOnEcliptic = new THREE.Vector3(centerPosition.x, 0, centerPosition.z);
				var centerObjectOrbitAngle = Math.abs(centerOnEcliptic.normalize().angleTo(new THREE.Vector3(0.0, 0.0, 1)));

				if (centerPosition.x < 0) {
					centerObjectOrbitAngle = KMG.RAD_180 + (KMG.RAD_180 - centerObjectOrbitAngle);
				}
				object.position.add(centerPosition);
			
			}
			
			object.updateMatrix();
			
		} else {
			ellipticalOrbiter.update();
		}
		
	}
	
	this.update = function()
	{
		if (object instanceof Array) {
			for (var i = 0; i < object.length; i++) {
				advanceOrbit(object[i]);
			}
		} else {
			advanceOrbit(object);
		}
	};


};
KMG.EphemerisOrbiter.prototype = Object.create( KMG.BaseObject.prototype );

/* File: TickController.js */

KMG.TickController = function(tickSpeed) {

	this.ticks = 0;
	
	this.tickSpeed = (tickSpeed) ? tickSpeed : 1.0;
	
	var active = false;
	var scope = this;
	
	this.start = function() {
		active = true;
	};
	
	this.stop = function() {
		active = false;
	};
	
	this.update = function() {
		if (active) {
			this.ticks += (this.tickSpeed * 1);
		}
	};

};

KMG.TimeBasedTickController = function(speed) {
	
	// Defaults to realtime starting now
	var epoch = KMG.Util.julianNow();
	this.speed = (speed) ? speed : 1;
	this.ticks = 0;

	this.tickJulian = epoch;
	this.tickDate = KMG.Util.julianToDate(this.tickJulian);
	
	var last = 0;
	
	var active = false;
	var scope = this;
	
	this.getEpoch = function() {
		return epoch;
	};
	
	this.resetToToday = function() {
		epoch = KMG.Util.julianNow();
		this.ticks = 0;
		this.update(true);
	};
	
	this.resetToJulianDay = function(jd) {
		epoch = jd;
		this.ticks = 0;
		this.update(true);
	};
	
	this.resetToDate = function(millis) {
		var d = new Date(millis);
		epoch =  KMG.Util.dateToJulian(d.getFullYear(),
							d.getMonth() + 1,
							d.getDate(),
							d.getHours(),
							d.getMinutes(),
							d.getSeconds());
		last = d.getTime();
		this.ticks = 0;
		this.tickJulian = epoch;
		this.tickDate = KMG.Util.julianToDate(this.tickJulian);
	};

	
	
	this.isActive = function() {
		return active;
	};
	
	this.start = function() {
		active = true;
		last = (new Date()).getTime();
	};
	
	this.stop = function() {
		active = false;
	};
	
	this.update = function(force) {
		if (active || force) {
			var d = new Date();
			var now = d.getTime();
			if (last > 0) {
				var elapsed = (((now - last) / 1000 / 60 / 60 / 24) );
				this.ticks += elapsed* this.speed;
			}
			last = now;

			this.tickJulian = epoch + this.ticks;
			this.tickDate = KMG.Util.julianToDate(this.tickJulian);
			
			//console.info("Julian: " + this.tickJulian + ", Date: " + this.tickDate);
		}
	};

};





KMG.IntervalTimeBasedTickController = function(speed, interval) {
	
	// Defaults to realtime starting now
	var epoch = KMG.Util.julianNow();
	this.speed = (speed) ? speed : 1;
	this.interval = interval;
	this.ticks = 0;

	this.tickJulian = epoch;
	this.tickDate = KMG.Util.julianToDate(this.tickJulian);
	
	var last = 0;
	
	var active = false;
	var scope = this;
	
	this.getEpoch = function() {
		return epoch;
	};
	
	this.resetToToday = function() {
		epoch = KMG.Util.julianNow();
		this.ticks = 0;
		this.update(true);
	};
	
	this.resetToJulianDay = function(jd) {
		epoch = jd;
		this.ticks = 0;
		this.update(true);
	};
	
	this.resetToDate = function(millis) {
		var d = new Date(millis);
		epoch =  KMG.Util.dateToJulian(d.getFullYear(),
							d.getMonth() + 1,
							d.getDate(),
							d.getHours(),
							d.getMinutes(),
							d.getSeconds());
		last = d.getTime();
		this.ticks = 0;
		this.tickJulian = epoch;
		this.tickDate = KMG.Util.julianToDate(this.tickJulian);
	};

	
	
	this.isActive = function() {
		return active;
	};
	
	this.start = function() {
		active = true;
		last = (new Date()).getTime();
	};
	
	this.stop = function() {
		active = false;
	};
	
	this.update = function(force) {
		if (active || force) {
			var d = new Date();
			var now = d.getTime();
			
			this.ticks += this.interval;

			this.tickJulian = epoch + this.ticks;
			this.tickDate = KMG.Util.julianToDate(this.tickJulian);

		}
	};

};



/* File: SceneScript.js */









KMG.SceneScript = function(source) {
	
	var scope = this;
	var planet, config, context;
	this.source = source;
	
	// TODO:  Add some error handling...
	eval(source);
	
	if (!onFrame) {
		var onFrame = function(planet, config, context) { }
	}
	
	if (!onRender) {
		var onRender = function(planet, config, context) { }
	}
	
	if (!onScriptInitialize) {
		var onScriptInitialize = function(planet, config, context) { }
	}
	
	if (!onScriptDestroy) {
		var onScriptDestroy = function(planet, config, context) { }
	}
	
	var _onFrame = onFrame;
	var _onRender = onRender;
	var _onScriptInitialize = onScriptInitialize;
	var _onScriptDestroy = onScriptDestroy;
	
	function radians(deg) {
		return deg * KMG.PI_BY_180;
	}
	
	function degrees(rad) {
		return rad * KMG._180_BY_PI;
	}
	
	function rotatePlanet(r) {
		config.surfaceRotation += r;
		context.configChanged = true;
	}
	
	function rotateScene(r) {
		context.controls.rotate(0, radians(r) );
	}
	
	function rotateMoon(moonIndex, r) {
		config.moons[moonIndex].moonRotation += r;
		context.configChanged = true;
	}
	
	function rotateMoons(r) {
		for (var i = 0; i < config.moons.length; i++) {
			if (r instanceof Array) {
				rotateMoon(i, r[i]);
			} else {
				rotateMoon(i, r);
			}
		}
	}
	
	function advanceMoonOrbit(moonIndex, r) {
		config.moons[moonIndex].moonAngle += r;
		context.configChanged = true;
	}
	
	function advanceMoonOrbits(r) {
		for (var i = 0; i < config.moons.length; i++) {
			if (r instanceof Array) {
				advanceMoonOrbit(i, r[i]);
			} else {
				advanceMoonOrbit(i, r);
			}
		}
	}
	
	function addToPrimaryScene(obj) {
		context.objects.push(obj);
		context.primaryScene.add(obj);
	}
	
	function addToSecondaryScene(obj) {
		context.objects.push(obj);
		context.secondaryScene.add(obj);
	}
	
	this.onScriptInitialize = function(_planet, _config, _context) {
		planet = _planet;
		config = _config;
		context = _context;
		
		if (_onScriptInitialize) {
			return _onScriptInitialize(planet, config, context);
		} else {
			return false;
		}
	};
	
	this.onScriptDestroy = function(planet, config, context) {
		if (_onScriptDestroy) {
			return _onScriptDestroy(planet, config, context);
		} else {
			return false;
		}
	};
	
	this.onFrameHandler = function(planet, config, context) {
		if (_onFrame) {
			return _onFrame(planet, config, context);
		} else {
			return false;
		}
	};
	
	this.onRenderHandler = function(planet, config, context) {
		if (_onRender) {
			return _onRender(planet, config, context);
		} else {
			return false;
		}
	};

};


/* File: KeyCommandBindManager.js */
KMG.KeyCommandBindManager = function(engine) {
	
	var screenshotUnbind = null;
	var fullscreenUnbind = null;
	
	this.engine = engine;
	
	this.bindScreenshot = function() {
		if (screenshotUnbind) {
			return false;
		}
		if (this.engine && this.engine.context) {
			screenshotUnbind = THREEx.Screenshot.bindKey(this.engine.context.renderer);
			return true;
		} else {
			console.info("Failed to bind screenshot keys: Engine not found");
			return false;
		}
	};
	
	this.unbindScreenshot = function() {
		if (screenshotUnbind) {
			screenshotUnbind.unbind();
			screenshotUnbind = null;
		}
	};
	
	this.bindFullscreen = function() {
		if (fullscreenUnbind) {
			return false;
		}
		
		if( THREEx.FullScreen.available() ){
			fullscreenUnbind = THREEx.FullScreen.bindKey();
			return true;
		} else {
			return false;
		}
	};
	
	this.unbindFullscreen = function() {
		if (fullscreenUnbind) {
			fullscreenUnbind.unbind();
			fullscreenUnbind = null;
		}
	};
	
	this.bindAll = function() {
		var ssOk = this.bindScreenshot();
		var fsOk = this.bindFullscreen();
		return {
			screenshot : ssOk,
			fullscreen : fsOk
		};
	};
	
	this.unbindAll = function() {
		this.unbindScreenshot();
		this.unbindFullscreen();
	};
};
KMG.keyCommandBindManager = new KMG.KeyCommandBindManager();
/* File: ConfigPersistenceService.js */

KMG.DefaultPersistenceServiceConfig = {
	serviceUrl : "/modelService.php",
	supportCustomTextures : true,
	supportCustomBackground : true,
	supportSceneScript : false
};

KMG.ConfigPersistenceService = function ( serviceConfig ) {

	this.serviceUrl = (serviceConfig && serviceConfig.serviceUrl) ? serviceConfig.serviceUrl : KMG.DefaultPersistenceServiceConfig.serviceUrl;
	this.supportCustomTextures = (serviceConfig && serviceConfig.supportCustomTextures !== undefined) ? serviceConfig.supportCustomTextures : KMG.DefaultPersistenceServiceConfig.supportCustomTextures;
	this.supportCustomBackground = (serviceConfig && serviceConfig.supportCustomBackground !== undefined) ? serviceConfig.supportCustomBackground : KMG.DefaultPersistenceServiceConfig.supportCustomBackground;
	this.supportSceneScript = (serviceConfig && serviceConfig.supportSceneScript !== undefined) ? serviceConfig.supportSceneScript : KMG.DefaultPersistenceServiceConfig.supportSceneScript;
	
	var scope = this;
	
	function usesCustomTextures(config) {
		if (config.texture === "Custom") {
			return true;
		}
		
		for (var i = 0; i < config.moons.length; i++) {
			if (config.moons[i].moonTexture === "Custom") {
				return true;
			}
		}
		
		return false;
	}
	
	function usesCustomBackground(config) {
		
		// If the image is set to Custom but type is 'stars' with custom backgrounds 
		// disabled, set image to a built-in image tag in serialize function (this  method 
		// does not modify the config).
		if (config.backgroundImage === "Custom" && config.backgroundType === "image") {
			return true;
		}
		
		return false;
	}
	
	function serialize(engine) {
	
		
		
		var texDef = (scope.supportCustomTextures) ? KMG.TextureMap.getTextureDefinitionByName("Custom") : null;
		var bgTexDef = (scope.supportCustomBackground) ? KMG.TextureMap.getBackgroundDefinitionByName("Custom") : null;
		var scriptBase64 = (scope.supportSceneScript) ? Base64.encode(engine.context.script.source) : "";
		
		
		var userModel = {
			config : engine.config,
			camera : {
				type : "PerspectiveCamera",
				fov : engine.context.camera.fov,
				aspect : engine.context.camera.aspect,
				near : engine.context.camera.near,
				far : engine.context.camera.far,
				position : {
					x : engine.context.camera.position.x,
					y : engine.context.camera.position.y,
					z : engine.context.camera.position.z
				},
				rotation : {
					x : engine.context.camera.rotation.x,
					y : engine.context.camera.rotation.y,
					z : engine.context.camera.rotation.z
				}
			},
			view : engine.context.controls.toConfig(),
			customTexture : {
				texture : (texDef) ? texDef.texture : null,
				normalMap : (texDef) ? texDef.normalMap : null,
				specularMap : (texDef) ? texDef.specularMap : null,
				bumpMap : (texDef) ? texDef.bumpMap : null,
				background : (bgTexDef) ? bgTexDef.texture : null,
				sourceProperties : (texDef) ? texDef.sourceProperties : null
			}, 
			sceneScript : 
				(engine.context.script) ? scriptBase64 : null
			
		};

		
		
		var userModel_json = JSON.stringify(userModel);
		return userModel_json;
	}
	
	function deserialize(data) {
		
		
		var loadedConfig = data.config;
		var loadedCameraConfig = data.camera;
		var loadedView = data.view;
		var loadedCustomTextures = data.customTexture;
		var loadedScript = (data.sceneScript) ? Base64.decode(data.sceneScript) : null;
		
		if (!loadedConfig.version) {
			loadedConfig.version = 1.0;
		}
			
		var config = KMG.Util.extend(loadedConfig, KMG.DefaultConfig);
		
		
		return {
			config : config,
			textures : loadedCustomTextures,
			sceneScript : loadedScript,
			view : loadedView,
			camera : loadedCameraConfig
		};
	}
	
	this.save = function(engine, onSuccess, onFailure) {
		
		if (!this.supportCustomTextures && usesCustomTextures(engine.context.config)) {
			if (onFailure) {
				onFailure("Saving with custom textures is not supported");
			}
			return;
		}
		
		if (!this.supportCustomBackground && usesCustomBackground(engine.context.config)) {
			if (onFailure) {
				onFailure("Saving with custom backgrounds is not supported");
			}
			return;
		}
		
		$.ajax({
		  url: scope.serviceUrl,
		  type : "POST",
		  dataType : "json",
		  data : serialize(engine)
		}).done(function(data) {
			
			if (data.status !== undefined && data.status === 200) {
				var modelId = data.id;
				onSuccess(modelId);
			} else if (onFailure) {
				onFailure(data.errormsg);
			}
			
		}).fail(function(data, textStatus, jqXHR) {
			console.info("Error on request: " + textStatus);
			if (onFailure) {
				onFailure(textStatus);
			}
		});
		
	};
	
	this.load = function(id, onSuccess, onFailure) {
		
		$.ajax({
			url: scope.serviceUrl,
			type : "GET",
			data : { id : id }
		}).done(function(data) {
			if (data.status !== undefined && data.status === 200) {
				var result = deserialize(data.data);
				onSuccess(result.config, result.view, result.camera, result.textures, result.sceneScript);
			} else if (onFailure) {
				onFailure(data.errormsg);
			}
		
			
		}).fail(function(data, textStatus, jqXHR) {
			console.info("Error on request: " + textStatus);
			if (onFailure) {
				onFailure(textStatus);
			}
		});
		
		
	};

};


	