// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =`
  attribute vec4 a_Position;
  uniform float u_Size;
  void main() {
    gl_Position = a_Position;
    gl_PointSize = u_Size;
  }`

// Fragment shader program
var FSHADER_SOURCE =`
  precision mediump float;
  uniform vec4 u_FragColor;  // uniform
  void main() {
  gl_FragColor = u_FragColor;
  }`

// global var
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;


function setupWebGL(){
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  //gl = getWebGLContext(canvas);
  gl = canvas.getContext("webgl",{preserveDrawingBuffer: true})
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

}


function connectVariablesToGLSL(){

  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  // Get the storage location of u_Size
  u_Size = gl.getUniformLocation(gl.program, 'u_Size');
  if (!u_Size) {
    console.log('Failed to get the storage location of u_Size');
    return;
  }



}

//constant
const POINT =0
const TRIANGLE =1
const CIRCLE =2
//global ui
let g_selectedColor =[1.0,1.0,1.0,1.0];
let g_selectedSize =5;
let g_segNumber =10;
let g_selectedType = POINT

  function addActionsforHtmlUI(){
    //button
    document.getElementById("clear").onclick = function(){ g_shapesList = []; renderALLshapes();}
    document.getElementById("draw").onclick = function(){ DrawPicture();}
    document.getElementById("pointButton").onclick = function(){ g_selectedType = POINT}
    document.getElementById("triangleButton").onclick = function(){ g_selectedType = TRIANGLE}
    document.getElementById("circleButton").onclick = function(){ g_selectedType = CIRCLE}
    //slider
    document.getElementById("redSlide").addEventListener("mouseup", function(){ g_selectedColor[0] = this.value/100; colorpreview();}) 
    document.getElementById("greenSlide").addEventListener("mouseup", function(){ g_selectedColor[1] = this.value/100; colorpreview();}) 
    document.getElementById("blueSlide").addEventListener("mouseup", function(){ g_selectedColor[2] = this.value/100; colorpreview();})
    document.getElementById("sizeSlide").addEventListener("mouseup", function(){ g_selectedSize= this.value;})
    document.getElementById("segSlide").addEventListener("mouseup", function(){ g_segNumber= this.value;})
    
  };

function main() {
  
  //canvas
  setupWebGL();
  //GLSL shader
  connectVariablesToGLSL();
  //button
  addActionsforHtmlUI()

  
   
  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = click;
  canvas.onmousemove = function(ev){ if(ev.buttons == 1){ click(ev)}};

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
}

function colorpreview(){
  // Retrieve <canvas> element
  var colorpre = document.getElementById('colorpreview');

  // Get the rendering context for WebGL
  var cl = getWebGLContext(colorpre);
  //cl = cl.getContext("color",{preserveDrawingBuffer: true})
  if (!cl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  cl.clearColor(g_selectedColor[0], g_selectedColor[1], g_selectedColor[2], 1.0);
  cl.clear(cl.COLOR_BUFFER_BIT);
}

var g_shapesList = [];

 
function click(ev) {
  
  //Extract 
  let [x,y] = convertCoordinatesEventToGL(ev);
  let point
  if(g_selectedType == POINT){
    point = new Point();
  } else if(g_selectedType == TRIANGLE){
    point = new Triangle();
  }else{
    point = new Circle();
    point.segments=g_segNumber
  }
  point.position = [x,y]
  point.color = g_selectedColor.slice();
  point.size=g_selectedSize
  g_shapesList.push(point);


  renderALLshapes();
}

function convertCoordinatesEventToGL(ev){
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return([x,y]);
}

function renderALLshapes(){

  var startTime = performance.now();
  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  var len = g_shapesList.length;
  for(var i = 0; i < len; i++) {
    //render
    g_shapesList[i].render()
  }

  var duration = performance.now() - startTime;
  sendTextToHTML("numdot: " + len + "ms: " + Math.floor(duration) + "fps: " + Math.floor(10000/duration),"numdot")

}

function sendTextToHTML(text,htmlID){
  var htmlElm = document.getElementById(htmlID);
  if(!htmlElm){
    console.log("Fialed to get " + htmlID + "from HTML")
    return;
  }
  htmlElm.innerHTML = text;

}

function DrawPicture(){
  //bottom head
  gl.uniform4f(u_FragColor, 0.9,0.7,0.65,1.0);
  drawTriangle([-0.5,-0.6, 0,-1, .5,-0.6])

  gl.uniform4f(u_FragColor, 0.8,0.6,0.5,1.0);
  drawTriangle([0.5,-0.6, 0,-1, .5,-1.0])
  drawTriangle([-0.5,-0.6, 0,-1, -0.5,-1])


  gl.uniform4f(u_FragColor, 0.8,0.6,0.5,1.0);
  drawTriangle([0.8,-1, .8,-.8, .5,-1.0])
  drawTriangle([-0.8,-1, -.8,-.8, -0.5,-1])

  gl.uniform4f(u_FragColor, 0.3,0.65,0.47,1.0);
  drawTriangle([0.8,-1, .8,-.8, 1,-0.8])
  drawTriangle([-0.8,-1, -.8,-.8, -1,-.8])

  gl.uniform4f(u_FragColor, 0.5,0.8,0.65,1.0);
  drawTriangle([0.5,-.8, .5,-.3, 1,-0.8])
  drawTriangle([-0.5,-.8, -.5,-.3, -1,-.8])
  

  gl.uniform4f(u_FragColor, 0.5,0.8,0.65,1.0);
  drawTriangle([-0.5,-0.6, 0,-.3, .5,-0.6])

  gl.uniform4f(u_FragColor, 0.5,0.85,0.7,1.0);
  drawTriangle([0.5,-0.6, 0,-.3, .5,-.3])
  drawTriangle([-0.5,-0.6, 0,-.3, -0.5,-.3])

  gl.uniform4f(u_FragColor, 0.9,0.7,0.65,1.0);
  drawTriangle([0.5,-0.6, .8,-.8, .5,-1.0])
  drawTriangle([-0.5,-0.6, -.8,-.8, -0.5,-1])

  //nose
  gl.uniform4f(u_FragColor, 0.1,0.2,0.1,1.0);
  drawTriangle([-0.2,-0.45, -.25,-.4, -.2,-0.35])
  drawTriangle([0.2,-0.45, .25,-.4, .2,-0.35])

  //eye left
  gl.uniform4f(u_FragColor, 0.5,0.8,0.65,1.0);
  drawTriangle([-0.2,-0.3, -.5,-.3, -0.6,-.2])

  gl.uniform4f(u_FragColor, 1.,0.2,0.1,1.0);
  drawTriangle([-0.6,-0.4, -.5,-.3, -0.6,-.2])
  gl.uniform4f(u_FragColor, 1.,0.3,0.1,1.0);
  drawTriangle([-0.6,-0.4, -.7,-.3, -0.6,-.2])

  //eye right
  gl.uniform4f(u_FragColor, 0.5,0.8,0.65,1.0);
  drawTriangle([0.2,-0.3, .5,-.3, 0.6,-.2])

  gl.uniform4f(u_FragColor, 1.,0.2,0.1,1.0);
  drawTriangle([0.6,-0.4, .5,-.3, 0.6,-.2])
  gl.uniform4f(u_FragColor, 1.,0.3,0.1,1.0);
  drawTriangle([0.6,-0.4, .7,-.3, 0.6,-.2])

  //hat
  gl.uniform4f(u_FragColor, 0.4,0.1,0.5,1.0);
  drawTriangle([-0.2,-0.3, 0,-.2, .2,-0.3])

  gl.uniform4f(u_FragColor, 0.6,0.1,0.8,1.0);
  drawTriangle([-0.25,0.3, 0,-.2, .25,0.3])

  gl.uniform4f(u_FragColor, 1.0,1.0,1.0,1.0);
  drawTriangle([-0.035,-0.15, 0,-.2, .035,-0.15])


}
