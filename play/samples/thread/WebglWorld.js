var gl;
function initGL(canvas) {
  try {
    gl = canvas.getContext("experimental-webgl");
    gl.viewportWidth = canvas.width;
    gl.viewportHeight = canvas.height;
  } catch (e) {
  }
  if (!gl) {
    alert("Could not initialise WebGL, sorry :-(");
  }
}

function getShader(gl, id) {
  var shaderScript = document.getElementById(id);
  if (!shaderScript) {
    return null;
  }

  var str = "";
  var k = shaderScript.firstChild;
  while (k) {
    if (k.nodeType == 3) {
      str += k.textContent;
    }
    k = k.nextSibling;
  }

  var shader;
  if (shaderScript.type == "x-shader/x-fragment") {
    shader = gl.createShader(gl.FRAGMENT_SHADER);
  } else if (shaderScript.type == "x-shader/x-vertex") {
    shader = gl.createShader(gl.VERTEX_SHADER);
  } else {
    return null;
  }

  gl.shaderSource(shader, str);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(shader));
    return null;
  }

  return shader;
}

var shaderProgram;

function initShaders() {
  var fragmentShader = getShader(gl, "shader-fs");
  var vertexShader = getShader(gl, "shader-vs");

  shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert("Could not initialise shaders");
  }

  gl.useProgram(shaderProgram);

  shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram,
      "aVertexPosition");
  gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

  shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram,
      "uPMatrix");
  shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram,
      "uMVMatrix");
}

var mvMatrix = mat4.create();
var pMatrix = mat4.create();

function setMatrixUniforms() {
  gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
  gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
}

var triangleVertexPositionBuffer;
var squareVertexPositionBuffer;

function initBuffers() {
  triangleVertexPositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
  var vertices = [ 0.0, 1.0, 0.0, 
                   -1.0, -1.0, 0.0, 
                   1.0, -1.0, 0.0,
                   1.0, 2.0, 1.0,
                   0.0, 0.0, 1.0,
                   2.0, 0.0, 1.0];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  triangleVertexPositionBuffer.itemSize = 3;
  triangleVertexPositionBuffer.numItems = 6;

  /*
   * squareVertexPositionBuffer = gl.createBuffer();
   * gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer); vertices = [
   * 1.0, 1.0, 0.0, -1.0, 1.0, 0.0, 1.0, -1.0, 0.0, -1.0, -1.0, 0.0 ];
   * gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
   * squareVertexPositionBuffer.itemSize = 3;
   * squareVertexPositionBuffer.numItems = 4;
   */
}

var WorldWorker = Utils.cls.extend(World.Object,{
  posData : null,
  syncing : false,
  
  newWorker : function(){
    var me = this;
    var worker = new Worker("play/samples/thread/RealWorld.js");
    // Watch for messages from the worker
    worker.onmessage = function(e){
      // The message from the client:
      var data = e.data;
      if(data.event === 'onAdd'){
//        console.log('onAdd');
        if(data.type == 'line'){
//          me.addLine(data.obj);
        }else{
          me.addPoint(data.obj);
        }
      }else if(data.event === 'onTick'){
//        me.syncPos(data.obj);
        me.updatePosData(data.obj);
      }else if(data.event === 'onInit'){
//        me.syncPos(data.obj);
        worker.postMessage("start");
      }else{
        console.log(data);
      }
    };
    
    worker.onerror = function(e){
      console.log(e);
    };
    worker.postMessage("init");
    self.setInterval(function(){me.syncPos.call(me);}, 10);
  },
  
  updatePosData : function(data){
    if(!this.syncing){
      this.posData = data;
    }
  },
  
  syncPos : function(objs){
    if(this.posData)
      drawScene(this.posData);
    this.syncing = false;
//    if(Ext.isEmpty(this.posData))return;
//    for(var i in this.objs){
//      if(Ext.isEmpty(this.posData[i])){
//        delete this.objs[i];
//      }else{
//        var obj = this.objs[i];
//        if(obj instanceof AM.view.world.Line){
//          obj.line = this.posData[i];
//        }else if(obj instanceof AM.view.world.Point){
//          obj.point = this.posData[i];
//        }
//        obj.syncPos();
//      }
//    }
  },
  
  addLine : function(line) {
//    var me = this, drawComp = me.down('draw');
//    var ln = Ext.create('AM.view.world.Line', {
//      drawComp : drawComp,
//      line : line,
//      iid : line.iid,
//      x : line.start.x,
//      y : line.start.y,
//      endX : line.end.x,
//      endY : line.end.y
//    });
//    me.objs[ln.iid] = ln;
//    me.iidor.set(ln.iid);
  },

  addPoint : function(point) {
//    console.log(point);
//    t(point.x, point.y);
//    var me = this, drawComp = me.down('draw');
//    var bno = Ext.create('AM.view.world.Point', {
//      drawComp : drawComp,
//      x : point.x,
//      y : point.y,
//      radius : 5,
//      iid : point.iid,
//      point : point,
//      text : point.text,
//      showText : this.showText
//    });
//    me.objs[bno.iid] = bno;
//    me.iidor.set(point.iid);
//    return bno;
  }
});

function drawScene(objs) {
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  mat4.perspective(450, gl.viewportWidth / gl.viewportHeight, 0.2, 100.0,
      pMatrix);
  var vertices = [
                  0, 0, -100, 
                  20, -20, -100, 
                  -20, -20, -100
                  ];
  var numItems = 3; 
  for(var key in objs){
    var obj = objs[key];
    if(obj.points){
      for(var key in obj.points){
        var point = obj.points[key];
        vertices.push(point.x);
        vertices.push(point.y);
        vertices.push(-100);
        numItems++;
      }
    }
  }
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  triangleVertexPositionBuffer.itemSize = 3;
  triangleVertexPositionBuffer.numItems = numItems;
  mat4.identity(mvMatrix);
  mat4.translate(mvMatrix, [ 0, 0, 0 ]);
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,
      triangleVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
  setMatrixUniforms();
  gl.drawArrays(gl.TRIANGLES, 0, triangleVertexPositionBuffer.numItems);
//  t(2, 2);
//  t(3, 3);
  // mat4.translate(mvMatrix, [1.0, 0.0, 0.0]);
  // gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
  // gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,
  // squareVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
  // setMatrixUniforms();
  // gl.drawArrays(gl.TRIANGLE_STRIP, 0, squareVertexPositionBuffer.numItems);
}

function t(x, y) {
  mat4.identity(mvMatrix);
  mat4.translate(mvMatrix, [ x, y, -100.0 ]);
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,
      triangleVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
  setMatrixUniforms();
  gl.drawArrays(gl.TRIANGLES, 0, triangleVertexPositionBuffer.numItems);
}

function webGLStart() {
  var canvas = document.getElementById("lesson01-canvas");
  initGL(canvas);
  initShaders();
  initBuffers();

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);

  var ww = new WorldWorker();
  ww.newWorker();

}
