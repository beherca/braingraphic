/**
 * World is used to display the object data
 */
Ext.define('AM.view.world.World', {
  extend : 'Ext.panel.Panel',
  alias : 'widget.world',
  title : 'World',

  layout : {
    type : 'border',
    border : 2
  },
  
  world : null,
  
  iidor : null,
  
  worldTick : null,
  
  offset : OP.add(0, 0),
  
  initComponent : function() {
    var me = this;
    this.addEvents('modeChanged', 'addClick');
    me.iidor = new Iid();
    me.world.on('onAdd', me.addPoint);
//    me.world = World.create({x : 0, y : 0, resistance : 0.09});
//    me.ant = me.world.add({
//      type: 'ant', 
//      x : 300, y : 300,
//      gene : Ext.isEmpty(this.gene) ? JSON.stringify(gene) : this.gene,
//      sex : Creature.SEX.M
//    });
//
    me.items = [{
        xtype : 'toolbar',
        title : 'bar',
        region : 'north',
        items : [ {
          text : 'Add',
          listeners : {
            click : function() {
              me.fireEvent('pointAdd');
            }
          }
        }
      ]}, {
        xtype : 'draw',
        region : 'center',
        itemId : 'drawpanel',
        orderSpritesByZIndex : true,
        viewBox : false,
        neuronmapview : me,
        listeners : {
          click : function(e, t, opts) {
            // console.log('draw panel click');
            // only happen when user click on the neruon object
            if (e.target instanceof SVGRectElement) {
              var box = me.down('draw').getBox();
              me.offset = OP.add(-box.x, -box.y);
              if (me.mode == MODE.NEURON) {
                
              }
            }
          }
        }
    }];
    this.callParent(arguments);
    this.start();
  },
  
  start : function(){
    console.log('start');
    var me = this;
    if(isEmpty(this.worldTick)){
      this.worldTick = Ext.TaskManager.start({
        interval : 100,
        run: function(){
          me.world.tick();
        }
      });
    }else{
      Ext.TaskManager.start(this.worldTick);
    }
  },
  
  stop : function(){
    console.log('stop');
    if(this.worldTick){
      Ext.TaskManager.stop(this.worldTick);
    }
  },

  addPoint : function(type, point) {
    if(type != 'point') return;
    var me = this, drawComp = me.down('draw');
    var bno = Ext.create('AM.view.ground.Point', {
      drawComp : drawComp,
      x : point.x,
      y : point.y, 
      radius : 5,
      iid : point.iid,
      point : point,
      text : point.text
    });
    me.iidor.set(point.iid);
    point.on({
      onMove :  function(p){
        bno.syncPos();
      }, 
      onDestroy : function(p){
        bno.destroy();
        bno = null;
      }
    });
    bno.on({
      'onMove' : function(n){
        point.x = n.x + me.offset.x;
        point.y = n.y + me.offset.y;
      }
    });
    return bno;
  },
  
  destroy : function(){
    this.stop();
    this.callParent(arguments);
  }
});