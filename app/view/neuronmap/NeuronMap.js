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
  },

  registerListeners : function() {
    if (Ext.isEmpty(this.s))
      return;
    this.s.on('mouseover', function(sprite) {
      console.log('mouseover');
      sprite.setAttributes({
        fill : 'ffff00',
        stroke : '00ff00',
        style : {
          strokeWidth : 1
        }
      }, true);
      sprite.redraw();
    });
    this.s.on('mouseout', function(sprite) {
      console.log('mouseout');
      sprite.setAttributes({
        fill : 'ff0000',
        stroke : 'none'
      }, true);
      sprite.redraw();
    });
    this.s.on('click', function() {
      console.log('click');
    });
  },

  draw : function() {
    if (!Ext.isEmpty(this.drawComp)) {
      if (Ext.isEmpty(this.s)) {
        this.s = this.drawComp.surface.add({
          draggable : true,
          type : 'path',
          fill : '#ff0000',
          radius : 10,
          x : this.x,
          y : this.y
        });
        this.registerListeners();
      } else {
        this.s.setAttributes({
          x : this.x,
          y : this.y
        });
      }
      this.s.redraw();
    }
  }
});

Ext.define('Brain.Neuron', {
  extend : 'Brain.Object',

  constructor : function(args) {
    Ext.apply(this, args);
    this.callParent(args);
  },

  draw : function() {
    if (!Ext.isEmpty(this.drawComp)) {
      if (Ext.isEmpty(this.s)) {
        this.s = this.drawComp.surface.add({
          draggable : true,
          type : 'path',
          fill : '#ff0000',
          path : [ 'M0 0 L20 0 L10 10 Z' ].join(''),
          x : this.x,
          y : this.y
        });
        this.registerListeners();
      } else {
        this.s.setAttributes({
          x : this.x,
          y : this.y
        });
      }
      this.s.redraw();
    }
  }
});

Ext.define('Brain.Synapse', {
  extend : 'Brain.Object',
  dot : null,

  end : {
    x : 0,
    y : 0
  },

  constructor : function(args) {
    Ext.apply(this, args);
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
          path : [ 'M', me.x, me.y, 'l', me.end.x, me.end.y ].join(' '),
          x : me.x,
          y : me.y
        });
        me.dot = me.drawComp.surface.add({
          type : 'circle',
          fill : me.isReverse ? '#ff' : '#ffffff',
          stroke : 'blue',
          radius : 10,
          x : me.x + (me.end.x - me.x) / 2,
          y : me.y + (me.end.y - me.y) / 2
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
  extend : 'Ext.container.Container',
  alias : 'widget.neuronmap',
  layout : {
    type : 'border',
    border : 2
  },
  items : [ {
    xtype : 'panel',
    title : 'ok',
    region : 'north',
  }, {
    xtype : 'draw',
    region : 'center',
    itemId : 'drawpanel',
    viewBox : false,
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
    var bno = Ext.create('Brain.Neuron', {
      drawComp : me.getComponent('drawpanel'),
      x : 20,
      y : 20
    });
    bno.draw();
    bno.x = 300;
    bno.draw();
    var syn = Ext.create('Brain.Synapse', {
      drawComp : me.getComponent('drawpanel'),
      x : 10,
      y : 10,
      end : {
        x : 100,
        y : 100
      }
    });
    syn.draw();
  }
});