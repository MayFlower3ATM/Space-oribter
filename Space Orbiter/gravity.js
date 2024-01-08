import * as THREE from 'three';


function clamp(val, min, max)
{
    return Math.max(min, Math.min(val, max));
}


//const G = 0.0000000000667;
const G = 0.000000667;


function calculateGravity(object1, object2) //object1 is the lighter object
{
	const r = object1.position.distanceTo(object2.position);
	if(r < 1)
		return new THREE.Vector3(0, 0, 0);

	let gravity = (object1.mass * object2.mass * G)/(r*r);

	let gravityAcceleration = gravity/object2.mass; //a=F/m
	let relativePosition = object1.position.clone().add(object2.position.clone().negate());
	relativePosition.normalize();
	let gravityVector = relativePosition.multiplyScalar(-gravityAcceleration);
	return gravityVector;
}




export default calculateGravity;