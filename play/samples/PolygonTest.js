/**
 * World is used to display the object data
 */
Ext.define('AM.world.PolygonTest', {
  extend : 'AM.view.world.World',
  alias : 'widget.polygontest',
  title : 'Polygon Test',
  
  interval : 10,
  
  afterRender : function(){
    this.showText = false;
    this.callParent(arguments);
    this.world.resistance = 0.8;
    this.world.gForce.value = 16;
    this.world.gForce.direction = OP.add(3, 10);
    
    function pg(me, pointArray, isApplyGForce, isCrashable){
      return me.world.add({
        type: 'polygon', 
        pointArray : pointArray,
        isApplyGForce : isApplyGForce,
        isCrashable : isCrashable,
        unitForce : 1, elasticity : 0.7, maxEffDis : 20
      });
    };
//    for(var i = 0; i < 1; i++){
//      pg(this, [OP.add(100, 100), OP.add(200, 100), 
//                OP.add(150, 250)/*, OP.add(140, 250),
//                OP.add(130, 200), OP.add(100, 160)*/
//                ], true, true);
//    }
//    pg(this, [OP.add(250, 100), OP.add(300, 100), 
//              OP.add(250, 250), OP.add(140, 250),
//              OP.add(130, 200), OP.add(100, 160)
//              ], true, true);
//    pg(this, [OP.add(50, 50), OP.add(100, 50), 
//              OP.add(100, 100), OP.add(50, 100)/*, OP.add(140, 250),
//              OP.add(130, 200), OP.add(100, 160)*/
//              ], true, true);
    
    function pg2(me, edges, radius, startP){
//      var radiusStep = 2 * Math.PI / edges;
      var arr= [];
      for(var i = 0; i < edges ; i++){
        var px = radius * Math.random() + startP.x;
        var py = radius * Math.random() + startP.y;
        arr.push(OP.add(px, py));
      }
      pg(me, arr, true, true);
    }
//    pg2(this, 10, 140, OP.add(200, 300));
    
    function pg1(me, edges, radius, startP){
      var radiusStep = 2 * Math.PI / edges;
      var arr= [];
      for(var i = 0; i < edges ; i++){
        var angle = radiusStep * i;
        var px = radius * Math.cos(angle) + startP.x;
        var py = radius * Math.sin(angle) + startP.y;
        arr.push(OP.add(px, py));
      }
      pg(me, arr, true, true);
    }
//    pg1(this, 20, 40, OP.add(200, 300));
//    pg1(this, 3, 40, OP.add(300, 300));
//    pg1(this, 4, 40, OP.add(400, 300));
    
    function p(me, x, y, isApplyGForce, isCrashable, weight, isAnchor, isVisible){
      return me.world.add({
        type: 'point', 
        isApplyGForce : isApplyGForce,
        isCrashable : isCrashable,
        crashRadius : 4,
        weight : weight,
        visible : Ext.isEmpty(isVisible) ? true : isVisible ,
        isAnchor : isAnchor,
        x : x, y : y
      });
    };
    p(this, 400, 100, true, true, 1, false);
    for(var i =0; i < 200; i ++){
      p(this, i + 200, 500, false, true, 1, true, false);
    }
    for(var i =0; i < 200; i ++){
      p(this, i + 400, 500-i, false, true, 1, false, true);
    }
    
    for(var i =0; i < 200; i ++){
      p(this, i + 450, 500-i, false, true, 1, false, true);
    }
    
    for(var i =0; i < 200; i ++){
      p(this, i + 480, 500-i, false, true, 1, false, true);
    }
    function l(me, pre, post, isDual){
      me.world.link({pre : pre, post : post, unitForce : 1, elasticity : 0.3,
        maxEffDis : 2000, 
        distance : 20, isDual: isDual, type : World.LinkType.S});
    };
//    var p1 = p(this, 300, 150, false, true, 3);
//    var p2 = p(this,  600, 650, false, true, 1);
    
//    l(this, p1, p2, true);
    
    function c(me, x, y){
      me.world.add({
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
//    c(this, 100, 250);
    function t(me, x, y){
      return me.world.add({
        type : 'triangle',
        top : OP.add(50 + x, 60 + y, 0),
        right : OP.add(150 + x , 60 + y, 0),
        left : OP.add(250 + x, 160 + y, 0),
        isApplyGForce : true,
        unitForce : 1, elasticity : 0.6, maxEffDis : 200
      });
    };
//    t(this, 200, 120);
    for(var i = 0; i < 1; i++){
      p(this,  150 , 100 * Math.random(), true, true, 1, false, true);
//      t(this, 200* Math.random(), 200* Math.random());
    }
    
    function ln(me, start, end){
      me.world.add({
        type : 'line',
        start : start,
        end : end,
        isApplyGForce : false,
        unitForce : 1, elasticity : 0.8, maxEffDis : 200
      });
    };
//    ln(this, OP.add(0, 0), OP.add(600, 0));
//    ln(this, OP.add(100, 400), OP.add(180, 400));
//    ln(this, OP.add(100, 500), OP.add(180, 500));
//    ln(this, OP.add(220, 400), OP.add(380, 400));
//    ln(this, OP.add(220, 500), OP.add(380, 500));
//    ln(this, OP.add(0, -500), OP.add(0, 1000));
//    ln(this, OP.add(-600, 500), OP.add(1600, 500));
//    ln(this, OP.add(-600, 550), OP.add(1600, 550));
//    ln(this, OP.add(700, 0), OP.add(700, 400));
//    ln(this, OP.add(800, 0), OP.add(800, 400));
//    ln(this, OP.add(600, 400), OP.add(0, 400));
//    ln(this, OP.add(0, 400), OP.add(0, 0));
  }
});