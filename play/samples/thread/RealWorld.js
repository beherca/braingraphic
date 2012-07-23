onmessage = function(e){
  var ticker;
  if ( e.data === "init" ) {
    // Do some computation
    importScripts('../../../core/core.js');
    this.world = World.create({
      x : 0,
      y : 0,
      resistance : 0.1,
      gForce : Utils.cls.create(World.Force, {
        value : 3,
        direction : OP.add(10, 0)
      })
    });
    this.world.indexer.minx = -500;
    this.world.indexer.miny = -500;
    this.world.resistance = 0.3;
    this.world.gForce.value = 9;
    this.world.gForce.direction = OP.add(0, -10);
    
    this.world.on('onAdd', onAdd, this);
    
    for(var i =0; i < 100; i++){
      p(i + 20,  i -20, false, true, 1, true, true);
    }
    for(var i =0; i < 100; i++){
      p(i - 100, -20 - i, false, true, 1, true, true);
    }
    
//    for(var i =0; i < 50; i ++){
//      pg1(20, 40, OP.add(500 - 100*i, 0));
//      pg1(3, 20, OP.add(300 - 70*i, 100));
//      pg1(4, 20, OP.add(600 - 5*i, 200));
//    }
    for(var i =0; i < 100; i ++){
//      pg1(20, 20, OP.add(100 - 10*i, 100));
      pg1(3, 10, OP.add(100 - 20*i, 100));
//      pg1(4, 10, OP.add(600 - 10*i, 100));
    }
    postMessage({event : "onInit", obj : this.world.getData()});
  }else if(e.data === 'start'){
//    tick();
    ticker = self.setInterval("tick()", 10);
  }else if(e.data === 'stop'){
    self.clearInterval(ticker);
  }
};

tick = function(){
  this.world.tick();
  postMessage({event : "onTick", obj : this.world.getData()});
};

function onAdd(e){
  var obj = e.obj;
  var type = e.type;
  if(type === 'line' || type === 'point'){
    postMessage({event : "onAdd", obj : obj.toJson(), type : type});
  }
};

function pg(pointArray, isApplyGForce, isCrashable){
  world.add({
    type: 'polygon', 
    pointArray : pointArray,
    isApplyGForce : isApplyGForce,
    isCrashable : isCrashable,
    visible : false,
    unitForce : 1, elasticity : 0.6, maxEffDis : 100
  });
};

function pg2(edges, radius, startP){
  var arr= [];
  for(var i = 0; i < edges ; i++){
    var px = radius * Math.random() + startP.x;
    var py = radius * Math.random() + startP.y;
    arr.push(OP.add(px, py));
  }
  pg(arr, true, true);
}

function pg1(edges, radius, startP){
  var radiusStep = 2 * Math.PI / edges;
  var arr= [];
  for(var i = 0; i < edges ; i++){
    var angle = radiusStep * i;
    var px = radius * Math.cos(angle) + startP.x;
    var py = radius * Math.sin(angle) + startP.y;
    arr.push(OP.add(px, py));
  }
  pg(arr, true, true);
}

function p(x, y, isApplyGForce, isCrashable, weight, isAnchor, isVisible){
  this.world.add({
    type: 'point', 
    isApplyGForce : isApplyGForce,
    isCrashable : isCrashable,
    crashRadius : 4,
    weight : weight,
    visible : isVisible ,
    isAnchor : isAnchor,
    surfaceLinkConfig : { 
        unitForce : 1, elasticity : 0, 
        //TODO don't know how far is good , 10?
        distance : 1, 
        maxEffDis : 1/*see notes above*//*, 
        repeat : 10*//*see notes above*/},
    x : x, y : y
  });
};

function l(pre, post, isDual){
  this.world.link({pre : pre, post : post, unitForce : 1, elasticity : 0.3,
    maxEffDis : 2000, 
    distance : 20, isDual: isDual, type : World.LinkType.S});
};

function c(x, y){
  this.world.add({
    type : 'circle',
    x : x, 
    y : y,
    z : 0,
    edges : 30,
    radius : 50,
    isApplyGForce : true,
    unitForce : 1, elasticity : 0.1, maxEffDis : 200,
    isAnchor : false
  });
};
function t(x, y){
  this.world.add({
    type : 'triangle',
    top : OP.add(50 + x, 60 + y, 0),
    right : OP.add(150 + x , 60 + y, 0),
    left : OP.add(250 + x, 160 + y, 0),
    isApplyGForce : true,
    unitForce : 1, elasticity : 0.6, maxEffDis : 200
  });
};

function ln(start, end){
  this.world.add({
    type : 'line',
    start : start,
    end : end,
    isApplyGForce : false,
    unitForce : 1, elasticity : 0.8, maxEffDis : 200
  });
};