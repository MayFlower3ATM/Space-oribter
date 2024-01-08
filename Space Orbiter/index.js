import * as THREE from 'three';
import calculateGravity from './gravity.js';
import * as Movement from './movement.js';
import StandardOrbit from './orbit.js';

import { STLLoader } from 'three/addons/loaders/STLLoader.js';

let score;
function updateScore(score)
{
	document.getElementById("score").innerText = "Score: " + score;
}

let fpsSmooth = 60;
let cameraDistance = 4;
function updateFps(fps)
{
	fpsSmooth = (fpsSmooth*3+fps)/4;
	document.getElementById("fps").innerText = "FPS: " + Math.floor(fps);
}


function main()
{
	const scene = new THREE.Scene();
	const camera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.1, 10000 );
	  

	scene.background = new THREE.Color(0x121212);

	const ambient = new THREE.AmbientLight( 0x606060 );
	scene.add( ambient );
	const sun = new THREE.DirectionalLight( 0xffffff, 4 );
	sun.position.set( 0, 20, 30 );
	scene.add( sun );

	//Set up shadow properties for the light
	sun.shadow.mapSize.width = 512; // default
	sun.shadow.mapSize.height = 512; // default
	sun.shadow.camera.near = 0.5; // default
	sun.shadow.camera.far = 500; // default


	sun.shadow.camera.left = -50;
	sun.shadow.camera.right = 50;
	sun.shadow.camera.top = 70;
	sun.shadow.camera.bottom = -30;
	let currentFrameLength;

	console.log(sun);
	sun.castShadow = true;

	const helper = new THREE.DirectionalLightHelper( sun, 2 );
	scene.add( helper );
	
	const renderer = new THREE.WebGLRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );

	renderer.shadowMap.type = THREE.PCFSoftShadowMap;    //shaders
	renderer.outputColorSpace = THREE.SRGBColorSpace;
	renderer.shadowMap.enabled = true;
	Movement.setupMouseAndKeyboard(renderer);


	window.addEventListener('resize', ()=> {
		var newWidth = window.innerWidth;
		var newHeight = window.innerHeight;

		camera.aspect = newWidth / newHeight;
		camera.updateProjectionMatrix();

		renderer.setSize(newWidth, newHeight);
	}, false);


let playerLoaded = false;
let planet1Loaded = false;
	let playerMesh;
	camera.position.set(0, 5, 10);

	const playerMaterial = new THREE.MeshPhongMaterial( { color: 0x474747, specular: 0x494949, shininess: 200 } );
	const loader = new STLLoader();
	loader.load( './models/spaceship.stl', function ( geometry ) {

		playerMesh = new THREE.Mesh( geometry, playerMaterial );
		playerMesh.scale.set(0.25, 0.25, 0.25);

		playerMesh.castShadow = true;
		playerMesh.receiveShadow = true;

		playerMesh.velocity = new THREE.Vector3(0, 0, 0);
		playerMesh.mass = 70;
		playerMesh.velocity.z = 25;

		scene.add( playerMesh );
		playerMesh.position.set(0, 0, 0); //spawn 40m over planet2
		playerLoaded = true;
		const hex = 0xffff00;

	} );

	const planet = new THREE.MeshPhongMaterial( { color: 0x672317, specular: 0x494949, shininess: 5 } );
	let planet1;
	let planet2;
	let scrap;

	loader.load( './models/planet2.stl', function ( geometry ) {

		planet2 = new THREE.Mesh( geometry, planet );
		planet2.scale.set(5, 5, 5);

		planet2.castShadow = true;
		planet2.receiveShadow = true;
		planet2.mass = 100000000000;

		scene.add( planet2 );
		planet2.position.set(120, 0, 0);

	} );


	loader.load( './models/Scrap.stl', function ( geometry ) {

		scrap = new THREE.Mesh( geometry, planet );
		scrap.scale.set(5, 5, 5);

		scrap.castShadow = true;
		scrap.receiveShadow = true;

		scrap.mass = 30;
		scrap.velocity = new THREE.Vector3(0, 0, 0);
		scrap.velocity.x = 17;

		scene.add( scrap );
		scrap.position.set(-4000, 0, 200);

	} );

	loader.load( './models/planet1.stl', function ( geometry ) {

		planet1 = new THREE.Mesh( geometry, planet );
		planet1.scale.set(5, 5, 5);

		planet1.castShadow = true;
		planet1.receiveShadow = true;
		planet1.mass = 100000000000;

		scene.add( planet1 );
		planet1.position.set(-4000, 0, 0);
		planet1Loaded = true;

	} );



	renderer.domElement.addEventListener('wheel',function(event){ //zoom on mouse wheel
		cameraDistance -= event.wheelDelta/1000;
		cameraDistance = Math.max(2, Math.min(cameraDistance, 7))
		return false; 
	}, false);






	let oldFrameDate = performance.now();
	let fpsTimer = 0;
	let tenFramesLengthOld = 0;
	let tenFramesLengthRaw = 0;


	const overShip = 0.1;
	
	const stepTime = 0.01;

	setInterval(()=>{ //its more accurate
		if(!(playerLoaded && planet1Loaded) )
			return;
		let gravP1 = calculateGravity(planet1, playerMesh);
		let gravP2 = calculateGravity(planet2, playerMesh);

		let gravSP1 = calculateGravity(planet1, scrap);
		let gravSP2 = calculateGravity(planet2, scrap);

		playerMesh.velocity.add(gravP2.multiplyScalar(stepTime));
		playerMesh.velocity.add(gravP1.multiplyScalar(stepTime));

		scrap.velocity.add(gravSP1.multiplyScalar(stepTime));
		scrap.velocity.add(gravSP2.multiplyScalar(stepTime));

		if(Movement.keys.magnet == 1)
		{
			if(scrap.position.distanceTo(playerMesh.position) < 40)
			{
				//let distanceBetween = scrap.position.clone().negate().add(playerMesh.position);
				//scrap.position.add(distanceBetween.multiplyScalar(0.01));

				scene.remove(scrap);
			}
			console.log("m");
		}

		playerMesh.position.add(playerMesh.velocity.clone().multiplyScalar(-1 * stepTime)); //physics of movement
		scrap.position.add(scrap.velocity.clone().multiplyScalar(-1 * stepTime));

	}, stepTime*1000);

	let orbit;
	let orbitScrap;
	let playerRotationOverlay = new THREE.Vector3(0, 0, 0);
	
	let executeOnce = true;

	function animate()
	{

		requestAnimationFrame( animate );
		if(!(playerLoaded && planet1Loaded) )
			return;

		if(executeOnce)
		{
			executeOnce = false;
			orbit = new StandardOrbit(scene, playerMesh, 0xff0000);
			orbit.addPulledBy(planet1);
			orbit.addPulledBy(planet2);

			orbitScrap = new StandardOrbit(scene, scrap, 0x464646);
			orbitScrap.addPulledBy(planet1);
			orbitScrap.addPulledBy(planet2);


			
			setInterval(()=>{
				orbit.updateOrbit(0.1);
				orbitScrap.updateOrbit(0.1);
		
			}, stepTime*1000);
		
		}

		let current = performance.now();
		currentFrameLength = Math.max(current - oldFrameDate, 1);
		oldFrameDate = current;


		//Movement.setCurrentDelta(currentFrameLength); //this maybe could be useful if all physics and movement were moved into movement.js

		camera.rotateZ(Movement.keys.zRotation*0.002*currentFrameLength); //controls
		camera.rotateY(Movement.keys.yRotation*0.002*currentFrameLength);
		camera.rotateX(Movement.keys.xRotation*0.002*currentFrameLength);


		let currentRotation = new THREE.Vector3(0, 0, cameraDistance);
		currentRotation.applyEuler(camera.rotation);
		camera.position.x = playerMesh.position.x +currentRotation.x;
		camera.position.z = playerMesh.position.z +currentRotation.z;
		camera.position.y = playerMesh.position.y + currentRotation.y; //camera following player spaceship

		playerMesh.rotation.x = camera.rotation.x;
		playerMesh.rotation.y = camera.rotation.y;
		playerMesh.rotation.z = camera.rotation.z;
		playerMesh.rotation.order = camera.rotation.order;

		let acc = new THREE.Vector3(Movement.keys.accelerateX*0.02 ,0,  Movement.keys.accelerateZ*0.02);
		playerMesh.velocity.add(acc.applyEuler(camera.rotation));

		//for spaceship
	
		playerMesh.rotateX(Math.PI/2); //because playerMesh model is rotated and any prevoius rotating model would be overridden 
		playerMesh.rotateZ(Math.PI/2);
	

		if(fpsTimer++ >= 19)
		{
			tenFramesLengthRaw = performance.now();
			updateFps(20000/Math.max(tenFramesLengthRaw-tenFramesLengthOld, 1));
			tenFramesLengthOld = tenFramesLengthRaw;
			fpsTimer = 0;
		}

		renderer.render( scene, camera );  
 	}
	
		animate();	
}


export {main}; 
