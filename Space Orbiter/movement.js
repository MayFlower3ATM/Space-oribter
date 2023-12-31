let keys =
{
	xRotation: 0,
	yRotation: 0,
	zRotation: 0,
	accelerate: 0
};

let direction = 
{
	x: 0,
	y: 0,
	cameraRotation: 0
}

let delta = 0;

function setCurrentDelta(del)
{
	delta = del;
}

function setupMouseAndKeyboard(renderer)
{
	document.onkeydown = function (e) {
		console.log(e);
		switch(e.code)
		{
			case "KeyW":
				keys.xRotation = 1;
				break;
			case "KeyS":
				keys.xRotation = -1;
				break;

			case "KeyA":
				keys.yRotation = 1;
				break;
			case "KeyD":
				keys.yRotation = -1;
				break;

			case "KeyE":
				keys.zRotation = -1;
				break;
			case "KeyQ":
				keys.zRotation = 1;
				break;

			case "Space":
				keys.accelerate = 1;
				break;

			case "Shift":
				keys.accelerate = -1;
				break;

			default:
				break;
		}
	};

	document.onkeyup = function (e) {
		switch(e.code)
		{
			case "KeyW":
			case "KeyS":
				keys.xRotation = 0;
				break;
			case "KeyA":
			case "KeyD":
				keys.yRotation = 0;
				break;
			case "KeyQ":
			case "KeyE":
				keys.zRotation = 0;
				break;
			case "Space":
			case "KeyShift":
				keys.accelerate = 0;
				break;
			default:
				break;
		}
	};
}
	
	
	  



export {keys, direction, setCurrentDelta, setupMouseAndKeyboard};