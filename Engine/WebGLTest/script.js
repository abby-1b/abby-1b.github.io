let gl = null;
let glCanvas = null;

// Aspect ratio and coordinate system
// details
let aspectRatio = 1
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

// Texture
let texture;

window.addEventListener("load", startup, false);

function startup() {
	glCanvas = document.getElementById("glcanvas");
	gl = glCanvas.getContext("webgl2", {antialias: false});

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

	// let x1 = 5;
	// let y1 = 9;
	// let x2 = 55;
	// let y2 = 37;
	// let a = Math.atan2(x2 - x1, y2 - y1);
	// sin = Math.sin(a - Math.PI / 2) * 0.5; // 0.5
	// cos = Math.cos(a - Math.PI / 2) * 0.5;
	// vertexArray = new Float32Array([
	// 	x1 - sin, y1 - cos, x1 + sin, y1 + cos, x2 + sin, y2 + cos,
	// 	x1 - sin, y1 - cos, x2 - sin, y2 - cos, x2 + sin, y2 + cos
	// ]);

	vertexArray = new Float32Array([
		0, 0, glCanvas.width, 0, glCanvas.width, glCanvas.height,
		0, 0, 0, glCanvas.height, glCanvas.width, glCanvas.height
	])

	vertexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, vertexArray, gl.STATIC_DRAW);

	vertexNumComponents = 2;
	vertexCount = vertexArray.length / vertexNumComponents;

	// Image
	texture = loadImageAndCreateTextureInfo("../Tiles/BouncePad.png");

	// Start animation
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

	gl.bindTexture(gl.TEXTURE_2D, texture.texture);

	gl.useProgram(shaderProgram);

	uScalingFactor = gl.getUniformLocation(shaderProgram, "uScalingFactor");
	uGlobalColor = gl.getUniformLocation(shaderProgram, "uGlobalColor");

	gl.uniform2fv(uScalingFactor, currentScale);
	gl.uniform4fv(uGlobalColor, [0.0, 0.2, 0.8, 1.0]);

	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

	aVertexPosition =
		gl.getAttribLocation(shaderProgram, "aVertexPosition");

	gl.enableVertexAttribArray(aVertexPosition);
	gl.vertexAttribPointer(aVertexPosition, vertexNumComponents,
		gl.FLOAT, false, 0, 0);
	
	// Tell the shader to get the texture from texture unit 0
	gl.uniform1i(gl.getUniformLocation(shaderProgram, "u_texture"), 0);

	// draw the quad (2 triangles, 6 vertices)
	gl.drawArrays(gl.TRIANGLES, 0, 6);

	window.requestAnimationFrame(function(currentTime) {
		animateScene();
	});
}

function loadImageAndCreateTextureInfo(url) {
	var tex = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, tex);
   
	// let's assume all images are not a power of 2
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
   
	var textureInfo = {
		width: 1, // we don't know the size until it loads
		height: 1,
		texture: tex,
	};
	var img = new Image();
	img.addEventListener('load', function() {
		textureInfo.width = img.width;
		textureInfo.height = img.height;

		gl.bindTexture(gl.TEXTURE_2D, textureInfo.texture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
	});
	img.src = url
	return textureInfo;
}
