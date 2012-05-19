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
/**
 * Internal Id for neuron and Synapse
 */
IID = {
  iid : 0,

  get : function() {
    return this.iid++;
  },
  // set offset
  set : function(offset) {
    this.iid = offset;
  },

  // reset to
  reset : function() {
    this.iid = 0;
  }
},

MODE = {
  NORMAL : 'normal',
  NEURON : 'neurontoolactivated',
  SYNAPSE : 'synapsetoolactivated',
  SYNAPSE_R : 'synapsereverttoolactivated'
};
/**
 * Origin Point
 */
OP = {
  x : 0,
  y : 0,
  add : function(x, y) {
    return {
      x : x,
      y : y
    };
  }
};

Utils = {
  /**
   * To get the curve path
   * 
   * @test Utils.getCurvePath({x : 0, y :0}, {x : 100, y :0}, 20, 40) "M 0 0 C 0
   *       20 30 20 50 20 S 100 20 100 0" Utils.getCurvePath({x : 0, y :0}, {x :
   *       100, y :0}, 20, 50) "M 0 0 C 0 20 25 20 50 20 S 100 20 100 0"
   *       Utils.getCurvePath({x : 0, y :0}, {x : 100, y :0}, 20, 60) "M 0 0 C 0
   *       20 20 20 50 20 S 100 20 100 0" Utils.getCurvePath({x : 0, y :0}, {x :
   *       100, y :0}, 20, 20) "M 0 0 C 0 20 40 20 50 20 S 100 20 100 0"
   *       Utils.getCurvePath({x : 0, y :0}, {x : 100, y :100}, 20, 20) "M 0 0 C
   *       0 20 40 70 50 70 S 100 70 100 100"
   * @param startP
   * @param endP
   * @param curveHeight
   * @param curveWidth
   * @returns
   */
  getCurvePath : function(startP, endP, curveHeight, curveWidth) {
    var me = this;
    var angle = me.getAngle(startP, endP, Math.PI);
    var disXY = me.getDisXY(startP, endP);
    var midPoint = {
      x : disXY / 2,
      y : curveHeight
    };
    var oringPoints = [/* P0 */OP, /* P1 */{
      x : 0,
      y : curveHeight
    },
    /* P2 */{
      x : midPoint.x - curveWidth / 2,
      y : midPoint.y
    },
    /* P3 */{
      x : midPoint.x,
      y : midPoint.y
    },
    /* P4 */{
      x : disXY,
      y : curveHeight
    }, /* P5 */OP.add(disXY, 0) ];
    var points = [];
    Ext.each(oringPoints, function(point) {
      points.push(me.rotate(point, angle, OP, startP));
    });
    var path = [ "M", points[0].x, points[0].y, "C", points[1].x, points[1].y,
        points[2].x, points[2].y, points[3].x, points[3].y, "S", points[4].x,
        points[4].y, points[5].x, points[5].y ].join(' ');
    var pathObj = {
      path : path,
      points : points
    };
    // console.log('Synapse path:'+ path);
    return pathObj;
  },

  rotate : function(point, angle, originPoint, offset) {
    offset = offset ? offset : OP;
    originPoint = originPoint ? originPoint : OP;
    var relativeX = point.x - originPoint.x;
    var relativeY = point.y - originPoint.y;
    return {
      x : relativeX * Math.cos(angle) + relativeY * Math.sin(angle) + offset.x,
      y : relativeY * Math.cos(angle) - relativeX * Math.sin(angle) + offset.y
    };
  },

  getAngle : function(startP, endP, offset) {
    var disX = this.getDisX(startP, endP);
    var disY = this.getDisY(startP, endP);
    var angle = 0;
    angle = Math.atan2(disY, -disX) + (offset > 0 ? offset : 0);
    // console.log(angle*180/3.14);
    return angle;
  },

  getDisX : function(startP, endP) {
    return endP.x - startP.x;
  },

  getDisY : function(startP, endP) {
    return endP.y - startP.y;
  },

  getDisXY : function(startP, endP) {
    var disX = this.getDisX(startP, endP);
    var disY = this.getDisY(startP, endP);
    return Math.sqrt(disX * disX + disY * disY);
  },

  /**
   * Desc : this is the util to generate triagle path
   * 
   * @param startP
   *          of angle
   * @param endP
   *          of angel
   * @param sideLength
   *          is the side length of triagle
   */
  getTriPath : function(startP, endP, sideLength) {
    var me = this;
    var pi = Math.PI;
    var angle = this.getAngle(startP, endP, pi * 0.5);// anti-clockwise 90
                                                      // degree as offset;
    // triangle has 3 points, 1 is p0 which is origin point, p1, p2 is the rest
    var cosLengh = Math.cos(pi / 6);
    var p1 = {
      x : sideLength * 0.5,
      y : sideLength * cosLengh
    };
    var p2 = {
      x : -sideLength * 0.5,
      y : sideLength * cosLengh
    };
    var origPoints = [ OP, OP.add(p1.x, p1.y), OP.add(p2.x, p2.y) ];
    var points = [];
    Ext.each(origPoints, function(point) {
      points.push(me.rotate(point, angle, OP, startP));
    });
    var path = [ 'M', points[0].x, points[0].y, 'L', points[1].x, points[1].y,
        'L', points[2].x, points[2].y, 'z' ].join(' ');
    var pathObj = {
      path : path,
      points : points
    };
    // console.log('tri path' + path);
    return pathObj;
  }
};

Ext.define('Brain.Object', {
  mixins : {
    observable : 'Ext.util.Observable'
  },

  iid : 0,
  x : 0,
  y : 0,
  z : 0,
  // sprite than under managing
  s : null,
  state : STATE.N,

  // svg surface component
  drawComp : null,

  constructor : function(config) {
    this.iid = IID.get();
    Ext.apply(this, config);
    this.mixins.observable.constructor.call(this, config);
    this.callParent(config);
    // this.draw();
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

Ext.define('Brain.Neuron', {
  extend : 'Brain.Object',

  radius : 10,

  dendrites : [],

  // persistent
  axons : [],

  groupedPreNeurons : null,

  constructor : function(config) {
    var me = this;
    Ext.apply(this, config);
    this.groupedPreNeurons = new Ext.util.HashMap();
    this.listeners = {
      stateChanged : me.updateState
    };
    this.addEvents('stateChanged');
    this.callParent(config);
    this.draw();
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
    // add custom method to Ext.draw.SpriteDD, after drop (actually an invalid
    // drop because there is no drop zone)
    me.s.dd.afterInvalidDrop = function(target, e, id) {
      // console.log('after drag over');
      me.updateXY();
    };
    me.s.on('mouseover', function(sprite) {
      // console.log('mouseover');
      me.drawComp.focusObjects.push(sprite);
      if(me.state == STATE.N){
        me.fireEvent('stateChanged', STATE.R);
      }
    });
    me.s.on('mouseout', function(sprite) {
      // console.log('mouseout');
      me.drawComp.focusObjects.pop();
      if (me.state == STATE.R){
        me.fireEvent('stateChanged', STATE.N);
      }
    });
    me.s.on('click', function(sprite) {
      // console.log('click');
      var neuronmapview = me.drawComp.neuronmapview;
      neuronmapview.registerNeuron(me);
      if(me.state == STATE.A){
        me.fireEvent('stateChanged', STATE.N);
      }else{
        me.fireEvent('stateChanged', STATE.A);
      }
    });
  },

  updateState : function(state) {
    var me = this;
    me.state = state;
    if (state == STATE.N) {
      if (state == STATE.N) {
        me.s.setAttributes({
          fill : 'ff0000',
          stroke : 'none'
        }, true);
        me.s.redraw();
      }
    } else if (state == STATE.A || state == STATE.R) {
      me.s.setAttributes({
        fill : 'ffff00',
        stroke : '00ff00',
        style : {
          strokeWidth : 1
        }
      }, true);
      me.s.redraw();
    }
  },

  /**
   * Add synapse as Axon
   * 
   * @param preNeuron
   * @param postNeuron
   * @returns
   */
  addAxonSynapse : function(postNeuron, mode) {
    var me = this;
    var syn = Ext.create('Brain.Synapse', {
      drawComp : me.drawComp,
      preNeuron : this,
      postNeuron : postNeuron,
      isReverse : mode == MODE.SYNAPSE_R
    });
    me.axons[syn.iid] = syn;
    postNeuron.addDendriteSynapse(syn);
    me.updateSynapse();
    return syn;
  },

  addDendriteSynapse : function(synapse) {
    this.dendrites[synapse.iid] = synapse;
    // neuron that has grouped synapses.
    var neuron = null;
    if (this.groupedPreNeurons.containsKey(synapse.preNeuron.iid)) {
      // neuron here is actually an array.
      neuron = this.groupedPreNeurons.get(synapse.preNeuron.iid);
      neuron.push(synapse);
    } else {
      neuron = this.groupedPreNeurons.add(synapse.preNeuron.iid, [ synapse ]);
    }
    // for performance concern, dont call updateSynapse which will update all
    // synapses in dendrite and axon
    synapse.updateLevel(neuron.length - 1);
  },

  // this remove the synapses from the array
  removeSynapse : function(synapse) {
    if (Ext.isEmpty(this.axons[synapse.iid])) {
      delete this.axons[synapse.iid];
    } else if (Ext.isEmpty(this.dendrites[synapse.iid])) {
      delete this.dendrites[synapse.iid];
    } else {
      return false;
    }
    return true;
  },

  /**
   * This is called after dragging to update x y and redraw synapse
   */
  updateXY : function() {
    // console.log('update xy');
    this.x = this.s.x + this.s.attr.translation.x;
    this.y = this.s.y + this.s.attr.translation.y;
    this.updateSynapse();
  },

  updateSynapse : function() {
    var me = this;
    Ext.each(me.dendrites, function(s) {
      s.updateXY(true);
    });
    me.groupedPreNeurons.each(function(key, value) {
      var dendrites = value;
      Ext.each(dendrites, function(syn, index) {
        syn.updateLevel(index);
      });
    });

    Ext.each(me.axons, function(s) {
      s.updateXY();
    });
  },

  destroy : function() {
    Ext.each(this.dendrites, function(d) {
      d.destroy();
    });
    dendrites = null;
    Ext.each(this.axons, function(a) {
      a.destroy();
    });
    this.axons = null;
    this.groupedPreNeurons = null;
    this.s.destroy();
  },

  toJSON : function() {
    return JSON.stringify({
      iid : this.iid,
      x : this.x,
      y : this.y,
      z : this.z,
      axons : this.axons,
      state : this.state
    });
  }
});

Ext.define('Brain.Synapse', {
  extend : 'Brain.Object',
  arrow : null,
  arrowSideLength : 10,

  preNeuron : null,

  // persistent
  postNeuron : null,

  endX : 0,
  endY : 0,
  // use for set up curve height, this level is determine by queue number in
  // where is this synapse
  level : 0,
  levelStep : 10,
  curveWidth : 20,

  constructor : function(config) {
    Ext.apply(this, config);
    this.setXY();// no draw() call ,because parent class will do
    this.callParent(config);
  },

  isReverse : false,

  /**
   * Draw Synapse, will be call when initialed and redraw
   */
  draw : function() {
    var me = this;
    if (!Ext.isEmpty(me.drawComp)) {
      var sPathObj = Utils.getCurvePath(OP.add(me.x, me.y), OP.add(me.endX,
          me.endY), me.level * me.levelStep, me.curveWidth);
      var sPath = sPathObj.path;
      // [ 'M', me.x, me.y, 'Q', ((me.x + me.endX)/2 + 100), ((me.y + me.endY)/2
      // + 100), 'T', me.endX, me.endY ].join(' ');
      var arrawStartP = sPathObj.points[2]; // the curve control point
      var arrawEndP = sPathObj.points[3]; // the curve control point
      var arrowPath = Utils.getTriPath(OP.add(arrawStartP.x, arrawStartP.y), OP
          .add(arrawEndP.x, arrawEndP.y), me.arrowSideLength).path;
      if (Ext.isEmpty(me.s)) {
        me.s = this.drawComp.surface.add({
          type : 'path',
          fill : 'none',
          stroke : 'blue',
          path : sPath,
          x : me.x,
          y : me.y
        });
        me.arrow = me.drawComp.surface.add({
          type : 'path',
          fill : me.isReverse ? '#ff' : '#ffffff',
          stroke : 'blue',
          // path : [ 'M', (me.x + me.endX) / 2, (me.y + me.endY) / 2, 'L',
          // me.endX, me.endY ].join(' '),
          path : arrowPath,
          x : (me.x + me.endX) / 2,
          y : (me.y + me.endY) / 2
        });
        // this.registerListeners();
      } else {
        me.s.setAttributes({
          path : sPath,
          x : me.x,
          y : me.y
        });
        me.arrow.setAttributes({
          path : arrowPath,
          x : (me.x + me.endX) / 2,
          y : (me.y + me.endY) / 2
        });
      }

      me.s.redraw();
      me.arrow.redraw();
    }
  },

  setXY : function() {
    this.x = this.preNeuron ? this.preNeuron.x : this.x;
    this.y = this.preNeuron ? this.preNeuron.y : this.y;
    this.endX = this.postNeuron ? this.postNeuron.x : this.endX;
    this.endY = this.postNeuron ? this.postNeuron.y : this.endY;
  },

  updateXY : function(deferRender) {
    this.setXY();
    if (!deferRender)
      this.draw();
  },

  updateLevel : function(index, deferRender) {
    var level = index > 0 ? (index + 1) / 2 : 0;
    this.level = index % 2 == 0 ? level : -level;
    if (!deferRender)
      this.draw();
  },

  destroy : function() {
    var me = this;
    me.s.destroy();
    me.arrow.destroy();
    me.preNeuron.removeSynapse(me);
    me.postNeuron.removeSynapse(me);
    me = null;
    return true;
  },

  toJSON : function() {
    return JSON.stringify({
      iid : this.iid,
      x : this.x,
      y : this.y,
      z : this.z,
      postNeuron : {
        iid : this.postNeuron.iid
      }
    });
  }

});

Ext.define('AM.view.neuronmap.NeuronMap', {
  requires : [ 'Ext.data.UuidGenerator' ],
  // DOM id
  id : 'neuron-map',
  itemId : 'neuronMap',
  extend : 'Ext.panel.Panel',
  alias : 'widget.neuronmapview',

  layout : {
    type : 'border',
    border : 2
  },

  viewName : 'Neuron Map Designer',

  title : 'Untitle Map',

  mode : MODE.NORMAL,

  neurons : [],

  /** This is the neurons to be connected */
  activatedNeuron : null,

  offset : null,

  saveWindow : null,

  // store: 'Users'
  initComponent : function() {
    var me = this;
    this.addEvents([ 'mapSave', 'mapListShow' ]);
    this.items = [
        {
          xtype : 'toolbar',
          title : 'Brain Map Designer',
          itemId : 'brainMapMenu',
          items : [ {
            iconCls : 'show-list-btn',
            id : 'show-list-btn',
            text : 'Back to List',
            tooltip : 'Back to map list',
            listeners : {
              click : function() {
                me.fireEvent('mapListShow');
              }
            }
          }, '|', {
            iconCls : 'neuron-active-btn',
            id : 'neuron-active-btn',
            text : 'Neuron',
            tooltip : 'Active Neuron tool',
            toggleGroup : 'brainbuttons',
            listeners : {
              toggle : function(btn, pressed, opts) {
                var neuronmapview = btn.up('neuronmapview');
                if (pressed) {
                  neuronmapview.mode = MODE.NEURON;
                } else if (neuronmapview.mode == MODE.NEURON) {
                  neuronmapview.mode = MODE.NORMAL;
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
                var neuronmapview = btn.up('neuronmapview');
                if (pressed) {
                  neuronmapview.mode = MODE.SYNAPSE;
                } else if (neuronmapview.mode == MODE.SYNAPSE) {
                  neuronmapview.mode = MODE.NORMAL;
                }
              }
            }
          }, {
            iconCls : 'synapse-r-active-btn',
            id : 'synapse-r-active-btn',
            text : 'Synapse Revert',
            tooltip : 'Active Synapse tool',
            toggleGroup : 'brainbuttons',
            listeners : {
              toggle : function(btn, pressed, opts) {
                var neuronmapview = btn.up('neuronmapview');
                if (pressed) {
                  neuronmapview.mode = MODE.SYNAPSE_R;
                } else if (neuronmapview.mode == MODE.SYNAPSE_R) {
                  neuronmapview.mode = MODE.NORMAL;
                }
              }
            }
          }, '->', {
            iconCls : 'save-btn',
            id : 'save-btn',
            text : 'Save Map',
            action : 'save',
            tooltip : 'Save the map',
            listeners : {
              click : function(btn, opts) {
                console.log('save');
                if (!me.saveWindow) {
                  var form = Ext.widget('form', {
                    layout : {
                      type : 'vbox',
                      align : 'stretch'
                    },
                    border : false,
                    bodyPadding : 10,

                    fieldDefaults : {
                      labelAlign : 'top',
                      labelWidth : 100,
                      labelStyle : 'font-weight:bold'
                    },
                    items : [ {
                      xtype : 'textfield',
                      fieldLabel : 'Map Name',
                      allowBlank : true
                    } ],

                    buttons : [ {
                      text : 'Cancel',
                      handler : function() {
                        this.up('form').getForm().reset();
                        this.up('window').hide();
                      }
                    }, {
                      text : 'Save',
                      handler : function() {
                        var form = this.up('form').getForm();
                        if (form.isValid()) {
                          me.fireEvent('mapSave', {
                            name : this.up('form').query('textfield')[0].value,
                            neurons : me.neurons
                          });
                          form.reset();
                          me.saveWindow.hide();
                        }
                      }
                    } ]
                  });
                  me.saveWindow = Ext.widget('window', {
                    title : 'Save Map',
                    closeAction : 'hide',
                    layout : 'fit',
                    resizable : true,
                    modal : true,
                    items : form
                  });
                  me.add(me.saveWindow);
                }
                me.saveWindow.show();
              }
            }
          } ],
          region : 'north',
        },
        {
          xtype : 'draw',
          region : 'center',
          itemId : 'drawpanel',
          orderSpritesByZIndex : true,
          viewBox : false,
          /**
           * this is the array to store the object that get the focus usually,
           * only one get focuse, when it get focus, this can prevent user from
           * adding neuron when the mouse cusor is on existing another neuron
           */
          focusObjects : [],
          neuronmapview : this,
          listeners : {
            click : function(e, t, opts) {
              // console.log('draw panel click');
              //only happen when user click on the neruon object
              if (e.target instanceof SVGRectElement) {
                if (me.mode == MODE.NEURON) {
                  me.offset = me.offset ? me.offset : me.getComponent(
                      'brainMapMenu').getHeight()
                      + me.layout.border;
                  me.addNeuron(this, e.getXY(), me.offset);
                } else {
                  if(me.activatedNeuron){
                    me.activatedNeuron.updateState(STATE.N);
                    me.activatedNeuron = null;
                  }
                }
              }
            }
          }
        } ];
    this.callParent(arguments);
  },

  addNeuron : function(drawpanel, xy, offset) {
    var bno = Ext.create('Brain.Neuron', {
      drawComp : drawpanel,
      x : xy[0],
      y : xy[1] - offset
    });
    this.neurons.push(bno);
    return bno;
  },

  registerNeuron : function(neuron) {
    var me = this;
    if (me && (me.mode == MODE.SYNAPSE || me.mode == MODE.SYNAPSE_R)) {
      if (me.activatedNeuron && me.activatedNeuron != neuron) {// that means already has
                                                    // first neuron checked,this
                                                    // is the 2nd
        me.activatedNeuron.addAxonSynapse(neuron, me.mode);
        neuron.updateState(STATE.N);
        me.activatedNeuron = null;
      } else {
        me.activatedNeuron = neuron;
        neuron.updateState(STATE.A);
      }
    }
  },

  startEngine : function(record) {

  },

  clean : function() {
    // clean title
    this.setTitle(this.viewName);
    // destroy neurons, neuron will handle detail ifseft
    Ext.each(this.neurons, function(n) {
      n.destroy();
    });
  }
});