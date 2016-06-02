var vertexShaderText = 
[
'precision mediump float;',
'',
'attribute vec2 vertPosition;',
'attribute vec3 vertColor;',
'varying vec3 fragColor;',
'',
'void main()',
'{',
'  fragColor = vertColor;',
'  gl_Position = vec4(vertPosition, 0.0, 1.0);',
'}'
].join('\n');

var fragmentShaderText =
[
'precision mediump float;',
'',
'varying vec3 fragColor;',
'',
'void main()',
'{',
'  gl_FragColor = vec4(fragColor, 1.0);',
'}'
].join('\n');


var InitDemo = function() {
	console.log('This is working');

	var canvas = document.getElementById('game-surface');
	var gl = canvas.getContext('webgl');
	
	if (!gl) {
		console.log('Falling back to experimental-webgl');
		gl = canvas.getContext('experimental-webgl');
	}

	if (!gl) {
		alert('Your browser does not support WebGL');
		return;
	}
	//
	//Create shaders
	//
	gl.clearColor(0.75, 0.85, 0.8, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	var vertexShader = gl.createShader(gl.VERTEX_SHADER);
	var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

	gl.shaderSource(vertexShader, vertexShaderText);
	gl.shaderSource(fragmentShader, fragmentShaderText);

	gl.compileShader(vertexShader);
	if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
		console.log("ERROR Compiling vertex shader!", gl.getShaderInfoLog(vertexShader));
		return;
	}
	gl.compileShader(fragmentShader);
	if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
		console.log("ERROR Compiling fragment shader!", gl.getShaderInfoLog(fragmentShader));
		return;
	}

	var program = gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		console.log('ERROR linking program!', gl.getProgramInfoLog(program));
		return;
	}
	gl.validateProgram(program);
	if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
		console.log('ERROR validating program!', gl.getProgramInfoLog(program));
		return;
	}

	//
	// Create buffer
	//
	var triangleVertices =
	[ // X, Y      R, G, B
	   0.0, 0.5,   1.0,1.0,0.0,
	   -0.5, -0.5, 0.7,0.0,1.0,
	   0.5, -0.5,  0.1,1.0,0.6
	];

	var triangleVertexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexBufferObject);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertices), gl.STATIC_DRAW);

	var positionAtrribLocation = gl.getAttribLocation(program, 'vertPosition');
	var colorAtrribLocation = gl.getAttribLocation(program, 'vertColor');
	gl.vertexAttribPointer(
		positionAtrribLocation, //attribute location
		2, //number of elements per attribute
		gl.FLOAT, //type of elements
		gl.FALSE, //data normalised
		5 * Float32Array.BYTES_PER_ELEMENT, //size of an individual vertex
		0 //offset from the beginning of a single vertex to this attribute
	);
	gl.vertexAttribPointer(
		colorAtrribLocation, //attribute location
		3, //number of elements per attribute
		gl.FLOAT, //type of elements
		gl.FALSE, //data normalised
		5 * Float32Array.BYTES_PER_ELEMENT, //size of an individual vertex
		2 * Float32Array.BYTES_PER_ELEMENT //offset from the beginning of a single vertex to this attribute
	);


	gl.enableVertexAttribArray(positionAtrribLocation);
	gl.enableVertexAttribArray(colorAtrribLocation);

	//
	//Main render loop
	//
	gl.useProgram(program);
	gl.drawArrays(gl.TRIANGLES, 0, 3);
};