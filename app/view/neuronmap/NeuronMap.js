statics = {
  STATE : {
    N : 'normal',
    A : 'activated',
    R : 'rollover',
    D : 'dragover'
  },
  TYPE : {
    N : 'neuron',
    S : 'synapse'
  }
};

MODE = {
  NORMAL : 'normal',
  NEURON : 'neurontoolactivated',
  SYNAPSE : 'synapsetoolactivated'
};

Utils = {
  /**
   * Desc : this is the util to generate triagle path
   * 
   * @param startP of angle
   * @param endP of angel
   * @param sideLength is the side length of triagle
   */
  getTriPath : function(startP, endP, sideLength) {
    var disX = endP.x - startP.x;
    var disY = endP.y - startP.y;
    var angle = 0;
    angle = Math.atan2(disY, -disX) + Math.PI * 0.5;//anti-clockwise 90 degree
    console.log(angle*180/3.14);
    
    // triangle has 3 points, 1 is p0 which is origin point, p1, p2 is the rest
    var p1 = {
      x : sideLength * 0.5,
      y : sideLength * 0.866
    };
    var p2 = {
      x : -sideLength * 0.5,
      y : sideLength * 0.866
    };
    var path = [ 'M', startP.x, startP.y,
        'L', 
        matrix(p1.x, p1.y, angle, startP.x)/* pointx */,
        matrix(p1.y, -p1.x, angle, startP.y)/* pointy */, 
        'L', 
        matrix(p2.x, p2.y, angle, startP.x)/* pointx */,
        matrix(p2.y, -p2.x, angle, startP.y)/* pointy */,
        'z'
    ].join(' ');
    
    console.log(path);
    
    return path;
    
    function matrix(m1, m2, radians, offset) {
      return m1 * Math.cos(angle) + m2 * Math.sin(angle) + offset;
    };
  }
};

Ext.define('Brain.Object', {
  x : 0,
  y : 0,
  z : 0,
  s : null,
  state : statics.STATE.N,
  drawComp : null,

  constructor : function(args) {
    Ext.apply(this, args);
    this.callParent(args);
    this.draw();
  },

  registerListeners : function() {
  },

  draw : function() {
    var me = this;
    if (!Ext.isEmpty(me.drawComp)) {
      if (Ext.isEmpty(me.s)) {
        me.s = me.drawComp.surface.add({
          draggable : true,
          type : 'circle',
          fill : '#ff0000',
          radius : 10,
          x : me.x,
          y : me.y
        });
        me.registerListeners();
      } else {
        me.s.setAttributes({
          x : me.x,
          y : me.y
        });
      }
      me.s.redraw();
    }
  }
});

Ext.define('Brain.Neuron', {
  extend : 'Brain.Object',

  radius : 20,

  synapses : [],

  constructor : function(args) {
    Ext.apply(this, args);
    this.callParent(args);
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
    }
  },

  registerListeners : function() {
    var me = this;
    if (Ext.isEmpty(me.s))
      return;
    me.s.on('mouseover', function(sprite) {
      console.log('mouseover');
      me.drawComp.focusObjects.push(sprite);
      sprite.setAttributes({
        fill : 'ffff00',
        stroke : '00ff00',
        style : {
          strokeWidth : 1
        }
      }, true);
      sprite.redraw();
    });
    me.s.on('mouseout', function(sprite) {
      console.log('mouseout');
      me.drawComp.focusObjects.pop();
      sprite.setAttributes({
        fill : 'ff0000',
        stroke : 'none'
      }, true);
      sprite.redraw();
    });
    me.s.on('click', function(sprite) {
      console.log('click');
      var neuronMap = me.drawComp.neuronMap;
      neuronMap.registerNeuron(me);
    });
  }
});

Ext.define('Brain.Synapse', {
  extend : 'Brain.Object',
  dot : null,

  preNeuron : null,

  postNeuron : null,

  endX : 0,
  endY : 0,

  constructor : function(args) {
    Ext.apply(this, args);
    this.x = this.preNeuron ? this.preNeuron.x : this.x;
    this.y = this.preNeuron ? this.preNeuron.y : this.y;
    this.endX = this.postNeuron ? this.postNeuron.x : this.endX;
    this.endY = this.postNeuron ? this.postNeuron.y : this.endY;
    this.callParent(args);
  },

  isReverse : false,
  draw : function() {
    var me = this;
    if (!Ext.isEmpty(me.drawComp)) {
      if (Ext.isEmpty(me.s)) {
        me.s = this.drawComp.surface.add({
          type : 'path',
          fill : 'none',
          stroke : 'blue',
          path : [ 'M', me.x, me.y, 'L', me.endX, me.endY ].join(' '),
          x : me.x,
          y : me.y
        });
        me.dot = me.drawComp.surface.add({
          type : 'path',
          fill : me.isReverse ? '#ff' : '#ffffff',
          stroke : 'blue',
          // path : [ 'M', (me.x + me.endX) / 2, (me.y + me.endY) / 2, 'L',
          // me.endX, me.endY ].join(' '),
          path : Utils.getTriPath({x : (me.x + me.endX) / 2, y : (me.y + me.endY) / 2}, {x :me.endX, y : me.endY}, 70),
          x : (me.x + me.endX) / 2,
          y : (me.y + me.endY) / 2
        });
        // this.registerListeners();
      } else {
        me.s.setAttributes({
          x : me.x,
          y : me.y
        });
        me.dot.setAttributes({
          x : me.x,
          y : me.y
        });
      }

      me.s.redraw();
      me.dot.redraw();
    }
  }

});

Ext.define('AM.view.neuronmap.NeuronMap', {
  // DOM id
  id : 'neuron-map',
  extend : 'Ext.container.Container',
  alias : 'widget.neuronmap',

  layout : {
    type : 'border',
    border : 2
  },

  mode : MODE.NORMAL,

  /** This is the neurons to be connected */
  preNeuron : null,

  items : [ {
    xtype : 'toolbar',
    itemId : 'brainMapMenu',
    items : [ {
      iconCls : 'neuron-active-btn',
      id : 'neuron-active-btn',
      text : 'Neuron',
      tooltip : 'Active Neuron tool',
      toggleGroup : 'brainbuttons',
      listeners : {
        toggle : function(btn, pressed, opts) {
          var neuronMap = btn.up('neuronmap');
          if (pressed) {
            neuronMap.mode = MODE.NEURON;
          } else if (neuronMap.mode != MODE.SYNAPSE) {
            neuronMap.mode = MODE.NORMAL;
          }
        }
      }
    }, {
      iconCls : 'synapse-active-btn',
      id : 'synapse-active-btn',
      text : 'Synapse',
      tooltip : 'Active Synapse tool',
      toggleGroup : 'brainbuttons',
      listeners : {
        toggle : function(btn, pressed, opts) {
          var neuronMap = btn.up('neuronmap');
          if (pressed) {
            neuronMap.mode = MODE.SYNAPSE;
          } else if (neuronMap.mode != MODE.NEURON) {
            neuronMap.mode = MODE.NORMAL;
          }
        }
      }
    } ],
    region : 'north',
  }, {
    xtype : 'draw',
    region : 'center',
    itemId : 'drawpanel',
    orderSpritesByZIndex : true,
    viewBox : false,
    /**
     * this is the array to store the object that get the focus usually, only
     * one get focuse, when it get focus, this can prevent user from adding
     * neuron when the mouse cusor is on existing another neuron
     */
    focusObjects : [],
    neuronMap : null,
    items : [ {
      type : 'rect',
      fill : '#79BB3F',
      height : 100,
      width : 100,
      x : 100,
      y : 100,
      stroke : '#00ff00',
      style : {
        strokeWidth : 3
      }
    } ]
  } ],

  // store: 'Users'

  afterRender : function() {
    var me = this;
    console.log('view ok');
    me.callParent(arguments);
    var drawpanel = me.getComponent('drawpanel');
    drawpanel.neuronMap = me;
    drawpanel.on('click', function(e, t, opts) {
      console.log('draw panel click');
      if (drawpanel.focusObjects.length > 0) {

      } else {
        if (me.mode == MODE.NEURON) {
          var offset = me.getComponent('brainMapMenu').getHeight()
              + me.layout.border;
          me.addNeuron(drawpanel, e.getXY(), offset);
        } else {
          me.preNeuron = null;
        }
      }
    });
    var bno = Ext.create('Brain.Neuron', {
      drawComp : drawpanel,
      x : 40,
      y : 40
    });
    // bno.draw();
    var syn = Ext.create('Brain.Synapse', {
      drawComp : me.getComponent('drawpanel'),
      x : 10,
      y : 10,
      endX : 100,
      endY : 100
    });
    // syn.draw();
  },

  addNeuron : function(drawpanel, xy, offset) {
    var bno = Ext.create('Brain.Neuron', {
      drawComp : drawpanel,
      x : xy[0],
      y : xy[1] - offset
    });
    return bno;
  },

  addSynapse : function(preNeuron, postNeuron) {
    var syn = Ext.create('Brain.Synapse', {
      drawComp : this.getComponent('drawpanel'),
      preNeuron : preNeuron,
      postNeuron : postNeuron
    });
    return syn;
  },

  registerNeuron : function(neuron) {
    var me = this;
    if (me && me.mode == MODE.SYNAPSE) {
      if (me.preNeuron && me.preNeuron != neuron) {// that means already has
                                                    // first neuron checked,
                                                    // this is the 2nd
        var synapse = me.addSynapse(me.preNeuron, neuron);
        me.preNeuron.synapses.push(synapse);
        neuron.synapses.push(synapse);
        me.preNeuron = null;
      } else {
        me.preNeuron = neuron;
      }
    }
  }
});