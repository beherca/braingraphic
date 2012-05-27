Ext.define('AM.view.ground.Ground', {
  extend : 'Ext.panel.Panel',
  alias : 'widget.ground',
  title : 'Playground',

  layout : 'fit',
  
  initComponent : function() {
    var me = this;
    me.items = [{
      xtype : 'draw',
      itemId : 'drawpanel',
      orderSpritesByZIndex : true,
      viewBox : false,
      flex : 1,
      neuronmapview : me,
      listeners : {
        click : function(e, t, opts) {
        }
      }
    } ];
    this.callParent(arguments);
  },
  
  afterRender : function(){
    var me = this;
    me.callParent(arguments);
    var preNeuron = me.addNeuron(OP.add(100, 100), 40, 1);
    var postNeuron = me.addNeuron(OP.add(400, 400), 40, 2);
    var world = World.create({x : 0, y : 0});
    //pre Point and post Point which will be attached to Neurons
    var pre = world.add({type: 'point', x : 100, y : 100});
    var post = world.add({type: 'point', x : 400, y : 400});
    var link = world.link({pre : pre, post : post, unitForce : 20, distance : 1000, effDis : 2000, isDual: true});
    var task = Ext.TaskManager.start({
    interval : 100,
    run: function(){
      world.tick();
      console.log(pre.x);
      me.setXy(preNeuron, OP.add(pre.x, pre.y),  preNeuron.draw);
      me.setXy(postNeuron, OP.add(post.x, post.y),  postNeuron.draw);
    }, 
    repeat : 50
    });
  },
  
  setXy : function(n, xy, callback){
    Utils.apply(n, xy);
    callback.call(n);
  },
  
  addNeuron : function(xy, offset, iid) {
    var me = this, drawComp = me.down('draw');
    var bno = Ext.create('Brain.Neuron', {
      drawComp : drawComp,
      x : xy.x,
      y : xy.y + (offset ? offset: 0),
      iid : iid
    });
    return bno;
  },

});