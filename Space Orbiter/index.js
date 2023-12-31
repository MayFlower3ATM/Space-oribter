import * as THREE from 'three';
import * as Movement from './movement.js';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';


let fpsSmooth = 60;
let cameraDistance = 4;
function updateFps(fps)
{
	fpsSmooth = (fpsSmooth*3+fps)/4;
	document.getElementById("fps").innerText = "FPS: " + Math.floor(fps);
}

const G = 0.0000000000667;


function calculateGravity(object1, object2) //object1 is the lighter object
{
	const r = object1.position.distanceTo(object2.position);
	if(r < 3)
		return 0;

	let gravity = (object1.mass + object2.mass * G)/(r*r);

	let gravityAcceleration = gravity/object2.mass; //a=F/m
	let relativePosition = object1.position.clone().add(object2.position.clone().negate());
	let gravityVector = relativePosition.multiplyScalar(-gravityAcceleration);
	return gravityVector;
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
		playerMesh.mass = 300;

		scene.add( playerMesh );
		playerMesh.position.set(0, 0, 0); //spawn 40m over planet2
		playerLoaded = true;

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
		planet2.mass = 100;

		scene.add( planet2 );
		planet2.position.set(120, 0, 0);

	} );


	loader.load( './models/Scrap.stl', function ( geometry ) {

		scrap = new THREE.Mesh( geometry, planet );
		scrap.scale.set(5, 5, 5);

		scrap.castShadow = true;
		scrap.receiveShadow = true;
		scrap.mass = 200;

		scene.add( scrap );
		scrap.position.set(-300, 400, -150);

	} );

	loader.load( './models/planet1.stl', function ( geometry ) {

		planet1 = new THREE.Mesh( geometry, planet );
		planet1.scale.set(5, 5, 5);

		planet1.castShadow = true;
		planet1.receiveShadow = true;
		planet1.mass = 100;

		scene.add( planet1 );
		planet1.position.set(-130, 400, -150);
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
	let velocity = new THREE.Vector3();
	velocity.z = 8;

	let velocityScrap = new THREE.Vector3();
	velocityScrap.z = 15;

	setInterval(()=>{ //its more accurate
		if(!(playerLoaded && planet1Loaded) )
			return;
		let gravP1 = calculateGravity(planet1, playerMesh);
		let gravP2 = calculateGravity(planet2, playerMesh);

		let gravSP1 = calculateGravity(planet1, scrap);
		let gravSP2 = calculateGravity(planet2, scrap);



		velocity.add(gravP2.multiplyScalar(1));
		velocity.add(gravP1.multiplyScalar(1));

		velocityScrap.add(gravSP1.multiplyScalar(1));
		velocityScrap.add(gravSP2.multiplyScalar(1));

		playerMesh.position.x -= velocity.x * 1 * 0.01; //physics of movement
		playerMesh.position.y -= velocity.y * 1 * 0.01;
		playerMesh.position.z -= velocity.z * 1 * 0.01;

		scrap.position.x -= velocityScrap.x * 1 * 0.01;
		scrap.position.y -= velocityScrap.y * 1 * 0.01;
		scrap.position.z -= velocityScrap.z * 1 * 0.01;
	}, 1);


	function animate()
	{
		
		requestAnimationFrame( animate );
		if(!(playerLoaded && planet1Loaded) )
		return;


		let current = performance.now();
		currentFrameLength = Math.max(current - oldFrameDate, 1);
		oldFrameDate = current;


		//Movement.setCurrentDelta(currentFrameLength); //this maybe could be useful if all physics and movement were moved into movement.js



		camera.rotateZ(Movement.keys.zRotation*0.001*currentFrameLength); //controls
		camera.rotateY(Movement.keys.yRotation*0.001*currentFrameLength);
		camera.rotateX(Movement.keys.xRotation*0.001*currentFrameLength);


		


		let currentRotation = new THREE.Vector3(0, 0, cameraDistance);
		currentRotation.applyEuler(camera.rotation);
		camera.position.x = playerMesh.position.x +currentRotation.x;
		camera.position.z = playerMesh.position.z +currentRotation.z;
		camera.position.y = playerMesh.position.y + currentRotation.y; //camera following player spaceship

		playerMesh.rotation.x = camera.rotation.x;
		playerMesh.rotation.y = camera.rotation.y;
		playerMesh.rotation.z = camera.rotation.z;
		playerMesh.rotation.order = camera.rotation.order;
		playerMesh.rotateX(0.4);

		let acc = new THREE.Vector3(0,0,  Movement.keys.accelerate*0.01);
		velocity.add(acc.applyEuler(playerMesh.rotation));

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
