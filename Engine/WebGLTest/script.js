let gl = null;
let glCanvas = null;

// Aspect ratio and coordinate system
// details
let aspectRatio;
let currentScale = [1.0, 1.0];

// Vertex information
let vertexArray;
let vertexBuffer;
let vertexNumComponents;
let vertexCount;

// Rendering data shared with the
// scalers.
let uScalingFactor;
let uGlobalColor;

// Animation timing
let previousTime = 0.0;
let degreesPerSecond = 90.0;

window.addEventListener("load", startup, false);

function startup() {
	glCanvas = document.getElementById("glcanvas");
	gl = glCanvas.getContext("webgl", {antialias: false});

	const shaderSet = [
		{
			type: gl.VERTEX_SHADER,
			id: "vertex-shader"
		},
		{
			type: gl.FRAGMENT_SHADER,
			id: "fragment-shader"
		}
	];

	shaderProgram = buildShaderProgram(shaderSet);

	aspectRatio = glCanvas.width / glCanvas.height;
	// currentScale = [1.0, aspectRatio];
	currentScale = [2 / glCanvas.width, -2 / glCanvas.height];

	let x1 = 10;
	let y1 = 5;
	let x2 = 40;
	let y2 = 35;
	let a = Math.atan2(x2 - x1, y2 - y1);
	sin = Math.sin(a - Math.PI / 2) * 0.5;
	cos = Math.cos(a - Math.PI / 2) * 0.5;
	vertexArray = new Float32Array([
		x1 - sin, y1 - cos, x1 + sin, y1 + cos, x2 + sin, y2 + cos,
		x1 - sin, y1 - cos, x2 - sin, y2 - cos, x2 + sin, y2 + cos
	]);

	vertexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, vertexArray, gl.STATIC_DRAW);

	vertexNumComponents = 2;
	vertexCount = vertexArray.length/vertexNumComponents;

	currentAngle = 0.0;

	// Image
	let texture = loadTexture(gl, "../Tiles/Bounce.png");

	animateScene();
}

function buildShaderProgram(shaderInfo) {
	let program = gl.createProgram();

	shaderInfo.forEach(function(desc) {
		let shader = compileShader(desc.id, desc.type);

		if (shader) {
			gl.attachShader(program, shader);
		}
	});

	gl.linkProgram(program)

	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		console.log("Error linking shader program:");
		console.log(gl.getProgramInfoLog(program));
	}

	return program;
}

function compileShader(id, type) {
	let code = document.getElementById(id).firstChild.nodeValue;
	let shader = gl.createShader(type);

	gl.shaderSource(shader, code);
	gl.compileShader(shader);

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		console.log(`Error compiling ${type === gl.VERTEX_SHADER ? "vertex" : "fragment"} shader:`);
		console.log(gl.getShaderInfoLog(shader));
	}
	return shader;
}

function animateScene() {
	gl.viewport(0, 0, glCanvas.width, glCanvas.height);
	gl.clearColor(0.8, 0.9, 1.0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);

	gl.useProgram(shaderProgram);

	uScalingFactor =
		gl.getUniformLocation(shaderProgram, "uScalingFactor");
	uGlobalColor =
		gl.getUniformLocation(shaderProgram, "uGlobalColor");

	gl.uniform2fv(uScalingFactor, currentScale);
	gl.uniform4fv(uGlobalColor, [0.0, 0.2, 0.8, 1.0]);

	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

	aVertexPosition =
		gl.getAttribLocation(shaderProgram, "aVertexPosition");

	gl.enableVertexAttribArray(aVertexPosition);
	gl.vertexAttribPointer(aVertexPosition, vertexNumComponents,
		gl.FLOAT, false, 0, 0);

	gl.drawArrays(gl.TRIANGLES, 0, vertexCount);

	window.requestAnimationFrame(function(currentTime) {
		let deltaAngle = ((currentTime - previousTime) / 1000.0)
			* degreesPerSecond;

		currentAngle = 0; //(currentAngle + deltaAngle) % 360;
		previousTime = currentTime;
		animateScene();
	});
}

function loadTexture(gl, url) {
	const texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);
	const level = 0;
	const internalFormat = gl.RGBA;
	const width = 1;
	const height = 1;
	const border = 0;
	const srcFormat = gl.RGBA;
	const srcType = gl.UNSIGNED_BYTE;
	const pixel = new Uint8Array([0, 0, 255, 255]);
	gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
		width, height, border, srcFormat, srcType, pixel);
	const image = new Image();
	image.onload = function() {
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
			srcFormat, srcType, image);

		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	};
	image.src = url;
	return texture;
}
