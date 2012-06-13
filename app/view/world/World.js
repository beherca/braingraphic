STATE = {
  N : 'normal',
  /* Rollover and click */
  A : 'activated',
  /* Rollover without click */
  R : 'rollover',
  /*
   * During Dragging
   */
  D : 'drag'
};

Ext.define('AM.view.world.Object', {
  mixins : {
    observable : 'Ext.util.Observable'
  },

  iid : 0,
  x : 0,
  y : 0,
  z : 0,
  // sprite than under managing
  s : null,
  //text on object
  t : null, 
  state : STATE.N,
  
  /**
   * description of this object, will show at side of neuron
   */
  text : '',

  // svg surface component
  drawComp : null,

  constructor : function(config) {
    this.iid = Ext.isEmpty(this.iid) ? IID.get() : this.iid;
    Ext.apply(this, config);
    this.mixins.observable.constructor.call(this, config);
    this.addEvents(['onStateChange', 'onMove']);
    this.on('onStateChange', this.updateState);
    this.callParent(config);
    this.draw();
  },
  
  appendText : function(x, y){
    var me = this;
    x = (Ext.isEmpty(x) ? (me.x) : x) + 10;
    y =  Ext.isEmpty(y) ? me.y : y;
    var txt = !Ext.isEmpty(me.text) ? me.iid + "-" + me.text : me.iid;
    if (!Ext.isEmpty(me.drawComp)) {
      if (Ext.isEmpty(me.t)) {
        me.t = me.drawComp.surface.add({
          type : 'text',
          text : txt,
          fill : 'black',
          font : '14px "Lucida Grande", Helvetica, Arial, sans-serif;',
          x : x,
          y : y,
          zIndex : 201 //one level up 
        });
      }else {
        me.t.setAttributes({
          text : txt,
          x : x,
          y : y
        });
      }
      me.t.redraw();
    }
  },
  
  draw : function() {
    var me = this;
    if (!Ext.isEmpty(me.drawComp)) {
      if (Ext.isEmpty(me.s)) {
        me.s = me.drawComp.surface.add({
          draggable : true,
          type : 'circle',
          fill : '#ff0000',
          // path : [ 'M', me.x - this.width/2, me.y - this.height - 10, 'l',
          // this.width, '0 l', -this.width/2, this.height * 0.7, 'z'].join('
          // '),
          radius : this.radius,
          x : me.x,
          y : me.y,
          zIndex : 100
        });
        me.registerListeners();
      } else {
        me.s.setAttributes({
          x : me.x,
          y : me.y
        });
      }
      me.s.redraw();
      me.appendText();
    }
  },

  registerListeners : function() {
    var me = this;
    if (Ext.isEmpty(me.s))
      return;
    // add custom method to Ext.draw.SpriteDD, after drop (actually an invalid
    // drop because there is no drop zone)
    if(me.s.dd){
      me.s.dd.afterInvalidDrop = function(target, e, id) {
        // console.log('after drag over');
        me.updateXY();
        me.fireEvent('onMove', me);
      };
    }
    me.s.on('mouseover', function(sprite) {
      // console.log('mouseover');
      if (me.state == STATE.N) {
        me.fireEvent('onStateChange', STATE.R, me);
      }
    });
    me.s.on('mouseout', function(sprite) {
      // console.log('mouseout');
      if (me.state == STATE.R) {
        me.fireEvent('onStateChange', STATE.N, me);
      }
    });
    me.s.on('click', function(sprite) {
      // console.log('click');
      me.fireEvent('onStateChange', STATE.A, me);
    });
  },

  updateState : function(state) {
    var me = this;
    me.state = state;
    if (state == STATE.N) {
      if (state == STATE.N) {
        me.s.setAttributes({
          fill : '#ff0000',
          stroke : 'none'
        }, true);
        me.s.redraw();
      }
    } else if (state == STATE.A || state == STATE.R) {
      me.s.setAttributes({
        fill : '#ffff00',
        stroke : '#00ff00',
        style : {
          strokeWidth : 1
        }
      }, true);
      me.s.redraw();
    }
  },
  
  /**
   * This is called after dragging to update x y and redraw synapse
   */
  updateXY : function() {
    // console.log('update xy');
    this.s.x += this.s.attr.translation.x;
    this.s.y += this.s.attr.translation.y;
    this.s.setAttributes({
      x : this.s.x,
      y : this.s.y,
      translation : {x : 0, y : 0}
    });
    this.x = this.s.x;
    this.y = this.s.y;
    this.appendText();
  },

  destroy : function(){
    this.s.destroy();
    this.s = null;
    this.t.destroy();
    this.t = null;
    this.callParent(arguments);
  },
  
  /**
   * provide custom stringify
   * 
   * @returns
   */
  toJSON : function() {
    return JSON.stringify({
      iid : this.iid, 
      x : this.x,
      y : this.y,
      z : this.z,
      state : this.state
    });
  }
});
/**
 * Binding data point and view point
 */
Ext.define('AM.view.world.Point', {
  extend : 'AM.view.world.Object',
  
  point : null,
  
  syncPos : function(){
    this.x = this.point.x;
    this.y = this.point.y;
    this.draw();
  }
});


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
    me.world = World.create({x : 0, y : 0, resistance : 0.09});
    me.world.on('onAdd', me.addPoint, this);
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
  },
  
  afterRender : function(){
    this.callParent(arguments);
    this.start();
    this.world.add({
      type: 'point', 
      x : 200, y : 300
    });
    this.world.add({
      type : 'triangle',
      top : OP.add(50, 60, 0),
      right : OP.add(150, 60, 0),
      left : OP.add(250, 160, 0),
      unitForce : 0.5, elasticity : 0.8, effDis : 2000
    });
    this.world.add({
      type : 'circle',
      x : 400, 
      y : 400,
      z : 0,
      edges : 50,
      radius : 100,
      unitForce : 1, elasticity : 0.8, effDis : 2000
    });
    this.world.add({
      type : 'circle',
      x : 800, 
      y : 400,
      z : 0,
      edges : 5,
      radius : 100,
      unitForce : 1, elasticity : 0.89, effDis : 2000
    });
  },
  
  start : function(){
    console.log('start');
    var me = this;
    if(isEmpty(this.worldTick)){
      this.worldTick = Ext.TaskManager.start({
        interval : 10,
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

  addPoint : function(obj, eventName) {
    if(isEmpty(obj) || obj.type != 'point') return;
    var point = obj.obj;
    var me = this, drawComp = me.down('draw');
    var bno = Ext.create('AM.view.world.Point', {
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