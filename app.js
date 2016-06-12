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
                    loadJSONResource('/obj.json',function(modelErr, model1Obj){
                        if (modelErr) {
                            alert('Fatal Error loading model JSON');
                            console.error(modelErr);
                        } else {
                            loadImage('/texture.png', function(imgErr, img){
                                if (imgErr) {
                                    alert('Error loading image (see console)');
                                    console.log(imgErr);
                                } else {
                                    RunDemo(vsText, fsText, img, model1Obj);
                                }
                            });
                        }
                    });
                }
                });
        }
    });
};
var RunDemo = function(vertexShaderText, fragmentShaderText, textureImg, model) {
	console.log('This is working');
	model = model;

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
	//*
	var modelVertices = model.meshes[0].vertices;
	var modelIndices = [].concat.apply([], model.meshes[0].faces);
	var modelTexCoords = model.meshes[0].texturecoords[0];
	var modelNormals = model.meshes[0].normals;
    /*
	// bench mode
	var modelVertices = model.vertices;
	var modelIndices = [].concat.apply([], model.faces);
	var modelNormals = model.normals;
    //*/
	var modelPosVertexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, modelPosVertexBufferObject);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(modelVertices), gl.STATIC_DRAW);

	var modelTexCoordVertexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, modelTexCoordVertexBufferObject);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(modelTexCoords), gl.STATIC_DRAW);

	var modelIndexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, modelIndexBufferObject);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(modelIndices), gl.STATIC_DRAW);

	var modelNormalBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, modelNormalBufferObject);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(modelNormals), gl.STATIC_DRAW);

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
    //*
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
    //*/
	gl.bindBuffer(gl.ARRAY_BUFFER, modelNormalBufferObject);
	var normalAtrribLocation = gl.getAttribLocation(program, 'vertNormal');
	gl.vertexAttribPointer(
	    normalAtrribLocation,
	    3, gl.FLOAT,
	    gl.TRUE,
	    3 * Float32Array.BYTES_PER_ELEMENT,
	    0
	);
	gl.enableVertexAttribArray(normalAtrribLocation);

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
    //*/
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
	// Lighting Information
	//
	/*
	gl.useProgram(program);

	var ambientUniformLocation = gl.getUniformLocation(program, 'ambientLightIntensity');
	var sunlightDirUniformLocation = gl.getUniformLocation(program, 'sunlightDirection');
	var sunlightIntUniformLocation = gl.getUniformLocation(program, 'sunlightIntensity');

	gl.uniform3f(ambientUniformLocation, 0.2, 0.2, 0.2);
	gl.uniform3f(sunlightDirUniformLocation, 3.0, 4.0, -2.0);
	gl.uniform3f(sunlightIntUniformLocation, 0.9, 0.9, 0.9);
    */
	//
	//Main render loop
	//
	var identityMatrix = new Float32Array(16);
	mat4.identity(identityMatrix);
	var angle = 0;
	var loop = function () {
		angle = performance.now() / 1000 / 6 * 2 * Math.PI;
		//mat4.rotate(worldMatrix, identityMatrix, angle, [0,1,0]);
		mat4.rotate(yRotationMatrix, identityMatrix, angle, [0,1,0]);
		mat4.rotate(xRotationMatrix, identityMatrix, angle / 4, [1,0,0]);
		mat4.mul(worldMatrix, yRotationMatrix, xRotationMatrix);
		gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);

		gl.clearColor(0.75, 0.85, 0.8, 1.0);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		gl.bindTexture(gl.TEXTURE_2D,objTexture);
		gl.activeTexture(gl.TEXTURE0);
		gl.drawElements(gl.TRIANGLES, modelIndices.length, gl.UNSIGNED_SHORT, 0);

		requestAnimationFrame(loop);
	};
	requestAnimationFrame(loop);
};
