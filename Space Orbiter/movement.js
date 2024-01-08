let keys =
{
	xRotation: 0,
	yRotation: 0,
	zRotation: 0,
	accelerateZ: 0,
	accelerateX: 0,
	magnet: 0
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

			case "ArrowUp":
				keys.accelerateZ = 1;
				break;

			case "ArrowDown":
				keys.accelerateZ = -1;
				break;

			case "ArrowLeft":
				keys.accelerateX = 1;
				break;

			case "ArrowRight":
				keys.accelerateX = -1;
				break;

			case "KeyM":
				keys.magnet = 1;
				break;

				default:
					break;
			}
			console.log(e.code);
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
				case "ArrowUp":
				case "ArrowDown":
					keys.accelerateZ = 0;
				case "ArrowLeft":
				case "ArrowRight":
					keys.accelerateX = 0;
					break;

				case "KeyM":
					keys.magnet = 0;
					break;
			default:
				break;
		}
	};
}
	
	export {keys, direction, setCurrentDelta, setupMouseAndKeyboard};