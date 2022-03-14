var cubeRotation = 0.0;

const shift = 2;


function convertorRGB(R,G,B)
{
    return [R/255, G/255, B/255, 1]
}


let rotateMatrix = 
    [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0]
];
    let allRotate=0;

window.onload = function main() {
    const canvas = document.querySelector('#glcanvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

    if (!gl) {
        alert('Unable to initialize WebGL. Your browser or machine may not support it.');
        return;
    }

    const vsSource = `
    attribute vec4 aVertexPosition;
    attribute vec4 aVertexColor;
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;
    varying lowp vec4 vColor;

    void main(void) {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      vColor = aVertexColor;
    }
    `;

    const fsSource = `
    varying lowp vec4 vColor;
    
    void main(void) {
      gl_FragColor = vColor;
    }
    `;

    const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

    const programInfo = {
        program: shaderProgram,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
            vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor'),
        },
        uniformLocations: {
            projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
            modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
        }
    };

    const buffers = initBuffers(gl);

    var then = 0;

    function clier(){
        rotateMatrix.forEach(element => {
            element[1]=0
        });
    }

    function render(now) {
        now *= 0.0005;  // convert to seconds
        const deltaTime = now - then;
        then = now; 
        
         window.onkeydown = (e) => {

            switch(e.code){
                case 'Digit1':
                    rotateMatrix.forEach(element => {
                        element[1]=1
                    });
                    allRotate=0;
                    break;

                case 'Digit2':
                    clier();
                    rotateMatrix[0][1] = 1;
                    allRotate=0;
                    break;

                case 'Digit3':
                    clier();
                    rotateMatrix[1][1] = 1;
                    allRotate=0;
                    break;
                case 'Digit4':
                    clier();
                    rotateMatrix[2][1] = 1;
                    allRotate=0;
                    break;
                case 'Digit5':
                    clier();
                    rotateMatrix[3][1] = 1;
                    allRotate=0;
                    break;
                case 'Digit6':
                    clier();
                    allRotate=1;
                    break;

                case 'Digit7':
                    clier();
                    allRotate=2;
                    break;

            }  
         }
        drawScene(gl, programInfo, buffers, deltaTime, rotateMatrix, allRotate);
        requestAnimationFrame(render);
      
    }

    
    requestAnimationFrame(render);
}

function initColorBuffer(gl, color){
    const faceColors = [
        [1.0,  1.0,  1.0,  1.0],    // Front face: white
        [1.0,  0.0,  0.0,  1.0],    // Back face: red
        [0.0,  1.0,  0.0,  1.0],    // Top face: green
        [0.0,  0.0,  1.0,  1.0],    // Bottom face: blue
        [1.0,  1.0,  0.0,  1.0],    // Right face: yellow
        [1.0,  0.0,  1.0,  1.0],    // Left face: purple
    ];

    var colors = [];
    for (var j = 0; j < faceColors.length; ++j) {
        const c = color;

        colors = colors.concat(c, c, c, c);
    }

    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

    return colorBuffer;

}

function initBuffers(gl) {
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);


    const positions = [
        // Front face
        -1.0, -1.0,  1.0,
        1.0, -1.0,  1.0,
        1.0,  1.0,  1.0,
        -1.0,  1.0,  1.0,

        // Back face
        -1.0, -1.0, -1.0,
        -1.0,  1.0, -1.0,
        1.0,  1.0, -1.0,
        1.0, -1.0, -1.0,

        // Top face
        -1.0,  1.0, -1.0,
        -1.0,  1.0,  1.0,
        1.0,  1.0,  1.0,
        1.0,  1.0, -1.0,

        // Bottom face
        -1.0, -1.0, -1.0,
        1.0, -1.0, -1.0,
        1.0, -1.0,  1.0,
        -1.0, -1.0,  1.0,

        // Right face
        1.0, -1.0, -1.0,
        1.0,  1.0, -1.0,
        1.0,  1.0,  1.0,
        1.0, -1.0,  1.0,

        // Left face
        -1.0, -1.0, -1.0,
        -1.0, -1.0,  1.0,
        -1.0,  1.0,  1.0,
        -1.0,  1.0, -1.0,
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

    const indices = [
        0,  1,  2,      0,  2,  3,    // front
        4,  5,  6,      4,  6,  7,    // back
        8,  9,  10,     8,  10, 11,   // top
        12, 13, 14,     12, 14, 15,   // bottom
        16, 17, 18,     16, 18, 19,   // right
        20, 21, 22,     20, 22, 23,   // left
    ];

    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(indices), gl.STATIC_DRAW);

    return {
        position: positionBuffer,
        indices: indexBuffer,
    };
}

function drawCube(gl, programInfo, buffers, deltaTime, projectionMatrix, translateList, rotateList, c, allRotate, color){

    const modelViewMatrix = mat4.create();

    mat4.translate(modelViewMatrix,
        modelViewMatrix,
        translateList);

    
    mat4.rotate(modelViewMatrix,
            modelViewMatrix,
            cubeRotation,
            rotateList);

    if(allRotate === 1){

    mat4.translate(modelViewMatrix,
        modelViewMatrix,
        [c[0] - translateList[0], c[1] - translateList[1], c[2] - translateList[2]]);

    
    mat4.rotate(modelViewMatrix,
            modelViewMatrix,
            cubeRotation,
            [0,1,0]);
    
    mat4.translate(modelViewMatrix,
        modelViewMatrix,
        [translateList[0] - c[0], translateList[1] - c[1], translateList[2] - c[2]]);
    }

    if(allRotate === 2){

        mat4.translate(modelViewMatrix,
            modelViewMatrix,
            [c[0] - translateList[0]+shift, c[1] - translateList[1], c[2] - translateList[2]+shift]);
    
        
        mat4.rotate(modelViewMatrix,
                modelViewMatrix,
                cubeRotation,
                [0,1,0]);
        
        mat4.translate(modelViewMatrix,
            modelViewMatrix,
            [translateList[0] - c[0]+shift, translateList[1] - c[1], translateList[2] - c[2]+shift]);
        }



    {
        const numComponents = 3;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
        gl.vertexAttribPointer(
            programInfo.attribLocations.vertexPosition,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        gl.enableVertexAttribArray(
            programInfo.attribLocations.vertexPosition);
    }

    {
        const numComponents = 4;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        gl.bindBuffer(gl.ARRAY_BUFFER, initColorBuffer(gl, color));//buffers.color);
        gl.vertexAttribPointer(
            programInfo.attribLocations.vertexColor,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        gl.enableVertexAttribArray(
            programInfo.attribLocations.vertexColor);
    }

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
    gl.useProgram(programInfo.program);
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.projectionMatrix,
        false,
        projectionMatrix);
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.modelViewMatrix,
         false,
         modelViewMatrix);

    {
        const vertexCount = 36;
        const type = gl.UNSIGNED_SHORT;
        const offset = 0;
        gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
    }

    cubeRotation += deltaTime;
}

function drawScene(gl, programInfo, buffers, deltaTime, rotateMatrix, allRotate) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const fieldOfView = 45 * Math.PI / 180;   // in radians
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100.0;
    const projectionMatrix = mat4.create();

    mat4.perspective(projectionMatrix,
        fieldOfView,
        aspect,
        zNear,
        zFar);

    const zOffset = -12;
    const yOffset = -1.0;
    const side = 2;
    const space = 0.8;
    const center = [0, yOffset, zOffset];

    //midTop
    drawCube(gl, programInfo, buffers, deltaTime, projectionMatrix, translateList=[0, yOffset+side+space, zOffset], 
        rotateList=rotateMatrix[0], c=center, allRotate, color=convertorRGB(2,0,238));


    //left
    drawCube(gl, programInfo, buffers, deltaTime, projectionMatrix, translateList=[-(side+space), yOffset, zOffset], 
    rotateList=rotateMatrix[2], c=center, allRotate, color=convertorRGB(62, 176, 25));

    //midBotton
    drawCube(gl, programInfo, buffers, deltaTime, projectionMatrix, translateList=center, rotateList=rotateMatrix[1],
         c=center, allRotate, color=convertorRGB(201, 161, 16)); 

    
    //right
    drawCube(gl, programInfo, buffers, deltaTime, projectionMatrix, translateList=[side+space, yOffset, zOffset], 
        rotateList=rotateMatrix[3], c=center, allRotate, color=convertorRGB(161, 26, 26));
}

function initShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
        return null;
    }

    return shaderProgram;
}

function loadShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}
