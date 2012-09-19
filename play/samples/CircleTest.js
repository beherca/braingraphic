/**
 * World is used to display the object data
 */
Ext.define('AM.world.CircleTest', {
  extend : 'AM.view.world.World',
  alias : 'widget.circletest',
  title : 'Circle Test',

  afterRender : function(){
    this.callParent(arguments);
    this.world.add({
      type: 'point', 
      isApplyGForce : true,
      x : 200, y : 150
    });
//    this.world.add({
//      type : 'triangle',
//      top : OP.add(50, 60, 0),
//      right : OP.add(150, 60, 0),
//      left : OP.add(250, 160, 0),
//      isApplyGForce : true,
//      unitForce : 1, elasticity : 0.8, maxEffDis : 2
//    });
//    this.world.add({
//      type : 'circle',
//      x : 400, 
//      y : 300,
//      z : 0,
//      edges : 10,
//      radius : 100,
//      unitForce : 1, elasticity : 0.8, maxEffDis : 20
//    });
    function c(me, x, y){
      me.world.add({
        type : 'circle',
        x : x, 
        y : y,
        z : 0,
        edges : 30,
        radius : 50,
        isApplyGForce : false,
        unitForce : 1, elasticity : 0.8, maxEffDis : 2,
        isAnchor : true
      });
    };
    c(this, 300, 150);
    c(this,  600, 180);
    c(this,  800, 120);
    c(this,  900, 120);
    c(this,  1000, 120);
    
//    this.world.add({
//      type : 'circle',
//      x : 800, 
//      y : 200,
//      z : 0,
//      edges : 10,
//      radius : 100,
//      isApplyGForce : false,
//      unitForce : 1, elasticity : 0.6, maxEffDis : 2000
//    });
  }
});