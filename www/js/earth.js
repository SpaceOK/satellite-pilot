// Created by Bjorn Sandvik - thematicmapping.org
(function () {

	var webglEl = document.getElementById('webgl');

	if (!Detector.webgl) {
		Detector.addGetWebGLMessage(webglEl);
		return;
	}

	var width  = window.innerWidth,
		  height = window.innerHeight;

	// Earth params
	var radius   = 0.5,
		segments = 32,
		rotation = 10;

	var scene = new THREE.Scene();

	var camera = new THREE.PerspectiveCamera(45, width / height, 0.01, 1000);
	camera.position.z = 1;

	var renderer = new THREE.WebGLRenderer();
	renderer.setSize(width, height);

	scene.add(new THREE.AmbientLight(0x333333));

	var light = new THREE.DirectionalLight(0xffffff, .5);
	light.position.set(5,3,5);
	scene.add(light);

    var sphere = createSphere(radius, segments);
	sphere.rotation.y = rotation;
	//sphere.position.set(5, 3, 5);
	scene.add(sphere)

    var clouds = createClouds(radius, segments);
	clouds.rotation.y = rotation;
	//scene.add(clouds);

	var stars = createStars(90, 64);
	scene.add(stars);

	var controls = new THREE.TrackballControls(camera);

	webglEl.appendChild(renderer.domElement);

	render();

	function render() {
		//controls.update();
		//sphere.rotation.y += 0.0005;
		//clouds.rotation.y += 0.0005;
		//camera.position.y += 0.001;
		//camera.position.z -= 0.001
		rotateCamera();
		requestAnimationFrame(render);
		renderer.render(scene, camera);
	}

	function rotateCamera(){

    var x = camera.position.x,
        y = camera.position.y,
        z = camera.position.z;

		var rotSpeed = .0002;

    camera.position.x = x * Math.cos(rotSpeed) + z * Math.sin(rotSpeed);
  	camera.position.z = z * Math.cos(rotSpeed) - x * Math.sin(rotSpeed);

    camera.lookAt(scene.position);

}

	function createSphere(radius, segments) {
		return new THREE.Mesh(
			new THREE.SphereGeometry(radius, segments, segments),
			new THREE.MeshPhongMaterial({
				//map:         THREE.ImageUtils.loadTexture('images/2_no_clouds_4k.jpg'),
				//bumpMap:     THREE.ImageUtils.loadTexture('images/elev_bump_4k.jpg'),
				//bumpScale:   0.005,
				//specularMap: THREE.ImageUtils.loadTexture('images/water_4k.png'),
				specular:    new THREE.Color('grey')
			})
		);
	}

	function createClouds(radius, segments) {
		return new THREE.Mesh(
			new THREE.SphereGeometry(radius + 0.003, segments, segments),
			new THREE.MeshPhongMaterial({
				map:         THREE.ImageUtils.loadTexture('images/fair_clouds_4k.png'),
				transparent: true
			})
		);
	}

	function createStars(radius, segments) {
		return new THREE.Mesh(
			new THREE.SphereGeometry(radius, segments, segments),
			new THREE.MeshBasicMaterial({
				map:  THREE.ImageUtils.loadTexture('images/galaxy_starfield.png'),
				side: THREE.BackSide
			})
		);
	}

}());
