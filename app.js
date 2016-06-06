var gl;
var model;

var InitDemo = function() {
    loadTextResource('/shader.vs.glsl', function(vsErr, vsText) {
        if (vsErr) {
            alert('Fatal Error loading Vertex Shader');
            console.error(vsErr);
        } else {
            loadTextResource('/shader.fs.glsl', function(fsErr, fsText) {
                if (fsErr) {
                    alert('Fatal Error loading Fragment Shader');
                    console.error(fsErr);
                } else {
                    loadJSONResource('/obj.json',function(modelErr, modelObj){
                        if (modelErr) {
                            alert('Fatal Error loading model JSON');
                            console.error(modelErr);
                        } else {
                            loadImage('/texture.png', function(imgErr, img){
                                if (imgErr) {
                                    alert('Error loading image (see console)');
                                    console.log(imgErr);
                                } else {
                                    RunDemo(vsText, fsText, img, modelObj);
                                }
                            });
                        }
                    });
                }
                });
        }
    });
};
var RunDemo = function(vertexShaderText, fragmentShaderText, textureImg, modelObj) {
	console.log('This is working');
	model = modelObj;

	var canvas = document.getElementById('game-surface');
	gl = canvas.getContext('webgl');

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
	gl.enable(gl.DEPTH_TEST);
	gl.enable(gl.CULL_FACE);
	gl.frontFace(gl.CCW);
	gl.cullFace(gl.BACK);

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
	var objVertices = modelObj.meshes[0].vertices;
	var objIndicies = [].concat.apply([], modelObj.meshes[0].faces);
	var texCoords = modelObj.meshes[0].texturecoords[0];

	var modelPosVertexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, modelPosVertexBufferObject);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(objVertices), gl.STATIC_DRAW);

	var modelTexCoordVertexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, modelTexCoordVertexBufferObject);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);

	var modelIndexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, modelIndexBufferObject);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(objIndicies), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, modelPosVertexBufferObject);
	var positionAtrribLocation = gl.getAttribLocation(program, 'vertPosition');
	gl.vertexAttribPointer(
		positionAtrribLocation, //attribute location
		3, //number of elements per attribute
		gl.FLOAT, //type of elements
		gl.FALSE, //data normalised
		3 * Float32Array.BYTES_PER_ELEMENT, //size of an individual vertex
		0 //offset from the beginning of a single vertex to this attribute
	);
	gl.enableVertexAttribArray(positionAtrribLocation);

    gl.bindBuffer(gl.ARRAY_BUFFER, modelTexCoordVertexBufferObject);
	var texCoordAtrribLocation = gl.getAttribLocation(program, 'vertTexCoord');
	gl.vertexAttribPointer(
		texCoordAtrribLocation, //attribute location
		2, //number of elements per attribute
		gl.FLOAT, //type of elements
		gl.FALSE, //data normalised
		2 * Float32Array.BYTES_PER_ELEMENT, //size of an individual vertex
		0
	);
	gl.enableVertexAttribArray(texCoordAtrribLocation);

	//
	//create texture
	//
	var objTexture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, objTexture);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texImage2D(
		gl.TEXTURE_2D,
		0,
		gl.RGBA,
		gl.RGBA,
		gl.UNSIGNED_BYTE,
		textureImg
	);
	gl.bindTexture(gl.TEXTURE_2D, null);

	// Tell WebGL state machine which program should be active;
	gl.useProgram(program);

	var matWorldUniformLocation = gl.getUniformLocation(program, 'mWorld');
	var matViewUniformLocation = gl.getUniformLocation(program, 'mView');
	var matProjUniformLocation = gl.getUniformLocation(program, 'mProj');

	var worldMatrix = new Float32Array(16);
	var viewMatrix = new Float32Array(16);
	var projMatrix = new Float32Array(16);
	mat4.identity(worldMatrix);
	//mat4.identity(viewMatrix);
	mat4.lookAt(viewMatrix, [0,0,-8],[0,0,0],[0,1,0]);
	//mat4.identity(projMatrix);
	mat4.perspective(projMatrix, glMatrix.toRadian(45), canvas.width/canvas.height, 0.1, 1000.0);

	gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
	gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
	gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);

	var xRotationMatrix = new Float32Array(16);
	var yRotationMatrix = new Float32Array(16);


	//
	//Main render loop
	//
	var identityMatrix = new Float32Array(16);
	mat4.identity(identityMatrix);
	var angle = 0;
	var loop = function () {
		angle = performance.now() / 1000 / 12 * 2 * Math.PI;
		//mat4.rotate(worldMatrix, identityMatrix, angle, [0,1,0]);
		mat4.rotate(yRotationMatrix, identityMatrix, angle, [0,1,0]);
		mat4.rotate(xRotationMatrix, identityMatrix, angle, [1,0,0]);
		mat4.mul(worldMatrix, yRotationMatrix, xRotationMatrix);
		gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);

		gl.clearColor(0.75, 0.85, 0.8, 1.0);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		gl.bindTexture(gl.TEXTURE_2D,objTexture);
		gl.activeTexture(gl.TEXTURE0);
		gl.drawElements(gl.TRIANGLES, objIndicies.length, gl.UNSIGNED_SHORT, 0);

		requestAnimationFrame(loop);
	};
	requestAnimationFrame(loop);
};
