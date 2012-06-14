/**
 * World is used to display the object data
 */
Ext.define('AM.world.LinkTest', {
  extend : 'AM.view.world.World',
  alias : 'widget.linktest',
  title : 'Link Test',

  afterRender : function(){
    this.callParent(arguments);
    

    function p(me, x, y, isApplyGForce){
      return me.world.add({
        type: 'point', 
        isApplyGForce : isApplyGForce,
        isCrashable : true,
        x : x, y : y
      });
    };
    function l(me, pre, post, isDual){
      me.world.link({pre : pre, post : post, unitForce : 1, elasticity : 0.2,
        maxEffDis : 2000, 
        distance : 20, isDual: isDual, type : World.LinkType.B});
    };
    var p1 = p(this, 300, 150, false);
    var p2 = p(this,  600, 450, false);
    l(this, p1, p2, false);
    
    function c(me, x, y){
      me.world.add({
        type : 'circle',
        x : x, 
        y : y,
        z : 0,
        edges : 30,
        radius : 50,
        isApplyGForce : true,
        unitForce : 1, elasticity : 0.5, maxEffDis : 200,
        isAnchor : false
      });
    };
    c(this, 500, 250);
  }
});