/**
 * World is used to display the object data
 */
Ext.define('AM.world.LineTest', {
  extend : 'AM.view.world.World',
  alias : 'widget.linetest',
  title : 'Line Test',
  interval : 10,
  
  afterRender : function(){
    this.showText = false;
    this.callParent(arguments);
    this.world.resistance = 0.05;
    this.world.gForce.value = 20;
    function p(me, x, y, isApplyGForce, isCrashable, weight){
      return me.world.add({
        type: 'point', 
        isApplyGForce : isApplyGForce,
        isCrashable : isCrashable,
        crashRadius : 20,
        weight : weight,
        x : x, y : y
      });
    };
    
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
//    t(this, 100, 100);
//    c(this, 100, 250);
    for(var i = 0; i < 20; i++){
      p(this,  150 * Math.random(), 120 * Math.random(), true, true);
//      t(this, 200* Math.random(), 200* Math.random());
    }
//      p(this,  100, 120, true, true);
//      p(this,  150, 120, true, true);
//      p(this,  200, 100, false, true);
//      p(this,  200, 100, false, true);
//    p1.vx = 20;
//    p(this,  300, 250, true, true);
    function ln(me, start, end){
      me.world.add({
        type : 'line',
        start : start,
        end : end,
        isApplyGForce : false,
        unitForce : 1, elasticity : 0.1, maxEffDis : 200
      });
    };
//    ln(this, OP.add(0, 0), OP.add(600, 0));
    ln(this, OP.add(600, 0), OP.add(600, 400));
    ln(this, OP.add(700, 0), OP.add(700, 400));
    ln(this, OP.add(800, 0), OP.add(800, 400));
//    ln(this, OP.add(600, 210), OP.add(600, 300));
//    ln(this, OP.add(600, 400), OP.add(0, 400));
//    ln(this, OP.add(0, 400), OP.add(0, 0));
  }
});