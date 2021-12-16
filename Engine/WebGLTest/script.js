"use strict";

let gl = null
let glCanvas = null

// Material used for everything
let material = null

// Texture
let texture = [-1, -1]

// Frames
let frameCount = 0

// Shader parameters (user changeable)
let vOffs, tOffs, colorParam;

// Auto shader parameters
let tSize;

window.addEventListener("load", startup, false)

function startup() {
	glCanvas = document.getElementById("glcanvas")
	gl = glCanvas.getContext("webgl2", {antialias: false, alpha: true})

	// Initialized the material
	material = buildShaderProgram(`
		attribute vec2 vPos;
		uniform vec2 vOffs;
		uniform vec2 screenScale;
		varying vec2 tPos;
		uniform vec2 tOffs;

		void main() {
			tPos = vPos + vOffs + tOffs;
			gl_Position = vec4((vPos + vOffs) * screenScale - vec2(1.0, -1.0), 0.0, 1.0);
		}`, `
		varying vec2 tPos;
		uniform vec2 tSize;
		uniform vec4 colorParam;
		uniform sampler2D sTexture;

		void main() {
			if (colorParam.w == 0.0) { // Change this to LESS THAN when deployed! < <=
				gl_FragColor = texture2D(sTexture, tPos / tSize);
			} else {
				gl_FragColor = colorParam;
			}
		}`)

	// Create vertex buffer for later use
	gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())

	// Set 'vPos' as the shader-side vertex buffer
	let vPos = gl.getAttribLocation(material, "vPos")
	gl.enableVertexAttribArray(vPos)
	gl.vertexAttribPointer(vPos, 2, gl.FLOAT, false, 0, 0)

	// Images
	texture[0] = loadImageAndCreateTextureInfo("../Sprites/Player.png")
	texture[1] = loadImageAndCreateTextureInfo("../Tiles/SmallBrick.png")

	// Use shader
	gl.useProgram(material)

	// Set screen scaling (pass screen size, basically)
	let screenScale = gl.getUniformLocation(material, "screenScale")
	gl.uniform2fv(screenScale, [2 / glCanvas.width, -2 / glCanvas.height])

	// Start animation
	animateScene()
}

function color(r, g, b, a) {
	// Set the current color
	colorParam = gl.getUniformLocation(material, "colorParam")
	gl.uniform4fv(colorParam, [r, g, b, a])
}

function rect(x, y, w, h) {
	// Set vertex data
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
		x, y, x + w, y,
		x, y + h, x + h, y + h,
	]), gl.DYNAMIC_DRAW)

	// draw the quad
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4) // LAST NUMBER IS MAGIC, IT'S JUST HALF THE VERTEX BUFFER LENGTH
}

function animateScene() {

	// Tell the shader to get the texture from texture unit 0 (???)
	// gl.uniform1i(gl.getUniformLocation(shaderProgram, "sTexture"), 0)

	// Clear the screen
	gl.clearColor(0.8, 0.9, 1.0, 1.0)
	gl.clear(gl.COLOR_BUFFER_BIT)

	// Setup 3D (depth testing)
	gl.enable(gl.DEPTH_TEST)
	gl.depthFunc(gl.LEQUAL)
	gl.enable(gl.BLEND)
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

	// let currTexture = texture[0]//texture[+(frameCount % 60 < 30)]

	// // Bind texture
	// gl.bindTexture(gl.TEXTURE_2D, currTexture.texture)

	// // Set the current texture size
	// tSize = gl.getUniformLocation(material, "tSize")
	// gl.uniform2fv(tSize, [currTexture.width, currTexture.height])

	// // Set texture offset
	// tOffs = gl.getUniformLocation(material, "tOffs")
	// gl.uniform2fv(tOffs, [0, 0])

	// // Set vertex data
	// gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
	// 	0, 0, 16 + Math.sin(frameCount / 50) * 6, 0,
	// 	0, 16, 16, 16,
	// ]), gl.DYNAMIC_DRAW)

	// // Set vertex offset
	// vOffs = gl.getUniformLocation(material, "vOffs")
	// gl.uniform2fv(vOffs, [10, 10])

	// // Set the current color
	// color = gl.getUniformLocation(material, "color")
	// gl.uniform4fv(color, [0.6, 0.1, 0.9, 1.0])

	// // draw the quad
	// gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4) // LAST NUMBER IS MAGIC, IT'S JUST HALF THE VERTEX BUFFER LENGTH

	color(1, 0, 0, 1)
	rect(0, 0, 16, 16)

	// Setup for next frame
	frameCount++
	window.requestAnimationFrame(animateScene)
}

function buildShaderProgram(vert, frag) {
	let program = gl.createProgram()

	// Compile vertex shader
	let vShader = gl.createShader(gl.VERTEX_SHADER)
	gl.shaderSource(vShader, vert)
	gl.compileShader(vShader)
	if (!gl.getShaderParameter(vShader, gl.COMPILE_STATUS))
		console.log("Error compiling vertex shader:\n" + gl.getShaderInfoLog(vShader))
	gl.attachShader(program, vShader)

	// Compile fragment shader
	let fShader = gl.createShader(gl.FRAGMENT_SHADER)
	gl.shaderSource(fShader, "#ifdef GL_ES\nprecision highp float;\n#endif" + frag)
	gl.compileShader(fShader)
	if (!gl.getShaderParameter(fShader, gl.COMPILE_STATUS))
		console.log("Error compiling fragment shader:\n" + gl.getShaderInfoLog(fShader))
	gl.attachShader(program, fShader)

	gl.linkProgram(program)

	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		console.log("Error linking shader program:")
		console.log(gl.getProgramInfoLog(program))
	}

	return program
}

function loadImageAndCreateTextureInfo(url) {
	var tex = gl.createTexture()
	gl.bindTexture(gl.TEXTURE_2D, tex)

	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT)
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT)
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)

	var textureInfo = { width: 1, height: 1, texture: tex }
	var img = new Image()
	img.addEventListener('load', function() {
		textureInfo.width = img.width
		textureInfo.height = img.height
		gl.bindTexture(gl.TEXTURE_2D, textureInfo.texture)
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)
	})
	img.src = url
	return textureInfo
}
