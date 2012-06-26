/**
 * World is used to display the object data
 */
Ext.define('AM.world.LineTest', {
  extend : 'AM.view.world.World',
  alias : 'widget.linetest',
  title : 'Line Test',

  afterRender : function(){
    this.callParent(arguments);

    function p(me, x, y, isApplyGForce, isCrashable, weight){
      return me.world.add({
        type: 'point', 
        isApplyGForce : isApplyGForce,
        isCrashable : isCrashable,
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
        isApplyGForce : false,
        unitForce : 1, elasticity : 0.1, maxEffDis : 200,
        isAnchor : true
      });
    };
//    c(this, 500, 250);
    p(this,  0, 120, true, true);
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
    ln(this, OP.add(100, 100), OP.add(200, 200));
  }
});