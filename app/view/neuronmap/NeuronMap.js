statics = {
  STATE : {
    N : 'normal',
    A : 'activated',
    R : 'rollover',
    D : 'dragover'
  }
};

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
    add : function (x, y){
      return {x : x, y : y};
    }
};

Utils = {
  /**
   * To get the curve path
   * @test Utils.getCurvePath({x : 0, y :0}, {x : 100, y :0}, 20, 40)
   * "M 0 0 C 0 20 30 20 50 20 S 100 20 100 0"
   * Utils.getCurvePath({x : 0, y :0}, {x : 100, y :0}, 20, 50)
   * "M 0 0 C 0 20 25 20 50 20 S 100 20 100 0"
   * Utils.getCurvePath({x : 0, y :0}, {x : 100, y :0}, 20, 60)
   * "M 0 0 C 0 20 20 20 50 20 S 100 20 100 0"
   * Utils.getCurvePath({x : 0, y :0}, {x : 100, y :0}, 20, 20)
   * "M 0 0 C 0 20 40 20 50 20 S 100 20 100 0"
   * Utils.getCurvePath({x : 0, y :0}, {x : 100, y :100}, 20, 20)
   * "M 0 0 C 0 20 40 70 50 70 S 100 70 100 100"
   * @param startP
   * @param endP
   * @param curveHeight
   * @param curveWidth
   * @returns
   */
  getCurvePath : function(startP, endP, curveHeight, curveWidth){
    var me = this;
    var angle = me.getAngle(startP, endP, Math.PI);
    var disXY = me.getDisXY(startP, endP);
    var midPoint = {x : disXY/2, y :curveHeight};
    var oringPoints = [/*P0*/OP, /*P1*/{x : 0, y : curveHeight},
                  /*P2*/{x : midPoint.x - curveWidth/2, y : midPoint.y}, 
                  /*P3*/{x : midPoint.x, y : midPoint.y },
                  /*P4*/{x : disXY, y : curveHeight}, /*P5*/OP.add(disXY, 0)];
    var points =[];
    Ext.each(oringPoints, function (point){
      points.push(me.rotate(point, angle, OP, startP));
    });
    var path = ["M", points[0].x, points[0].y,
                "C", points[1].x, points[1].y, points[2].x, points[2].y, points[3].x, points[3].y,
                "S", points[4].x, points[4].y, points[5].x, points[5].y
                ].join(' ');
    var pathObj = {path:path, points : points};
//    console.log('Synapse path:'+ path);
    return pathObj;
  },
  
  rotate : function(point, angle, originPoint, offset){
    offset = offset ? offset : OP;
    originPoint = originPoint ? originPoint: OP;
    var relativeX = point.x - originPoint.x;
    var relativeY = point.y - originPoint.y;
    return {
       x : relativeX * Math.cos(angle) + relativeY * Math.sin(angle) + offset.x,
       y : relativeY * Math.cos(angle) - relativeX * Math.sin(angle) + offset.y
    };
  },
  
  getAngle : function(startP, endP, offset){
    var disX = this.getDisX(startP, endP);
    var disY = this.getDisY(startP, endP);
    var angle = 0;
    angle = Math.atan2(disY, -disX) + (offset > 0 ? offset : 0);
//    console.log(angle*180/3.14);
    return angle;
  },
  
  getDisX : function(startP, endP){
    return endP.x - startP.x;
  },
  
  getDisY : function(startP, endP){
    return endP.y - startP.y;
  },
  
  getDisXY : function(startP, endP){
    var disX = this.getDisX(startP, endP);
    var disY = this.getDisY(startP, endP);
    return Math.sqrt(disX*disX +disY*disY);
  },
  
  /**
   * Desc : this is the util to generate triagle path
   * 
   * @param startP of angle
   * @param endP of angel
   * @param sideLength is the side length of triagle
   */
  getTriPath : function(startP, endP, sideLength) {
    var me = this;
    var pi = Math.PI;
    var angle = this.getAngle(startP, endP, pi * 0.5);//anti-clockwise 90 degree as offset;
    // triangle has 3 points, 1 is p0 which is origin point, p1, p2 is the rest
    var cosLengh = Math.cos(pi/6);
    var p1 = {
      x : sideLength * 0.5,
      y : sideLength * cosLengh
    };
    var p2 = {
      x : -sideLength * 0.5,
      y : sideLength * cosLengh
    };
    var origPoints = [OP, OP.add(p1.x, p1.y), OP.add(p2.x, p2.y)];
    var points = [];
    Ext.each(origPoints, function (point){
      points.push(me.rotate(point, angle, OP, startP));
    });
    var path = [ 'M', points[0].x, points[0].y,
        'L', 
        points[1].x, points[1].y,
        'L', 
        points[2].x, points[2].y,
        'z'
    ].join(' ');
    var pathObj = {path : path, points : points};
    console.log('tri path' + path);
    return pathObj;
  }
};

Ext.define('Brain.Object', {
  mapinternalId : 0,
  x : 0,
  y : 0,
  z : 0,
  //sprite than under managing
  s : null,
  state : statics.STATE.N,
  
  //svg surface component
  drawComp : null,

  constructor : function(args) {
    Ext.apply(this, args);
    this.callParent(args);
//    this.draw();
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
  },
  
  /**
   * provide custom stringify
   * @returns
   */
  toJSON : function(){
    return JSON.stringify({
      mapinternalId : this.mapinternalId,
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
  
  //persistent 
  axons : [],
  
  groupedPreNeurons : null,

  constructor : function(args) {
    Ext.apply(this, args);
    this.groupedPreNeurons = new Ext.util.HashMap();
    this.callParent(args);
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
    //add custom method to Ext.draw.SpriteDD, after drop (actually an invalid drop because there is no drop zone)
    me.s.dd.afterInvalidDrop = function(target, e, id){
//      console.log('after drag over');
      me.updateXY();
    };
    me.s.on('mouseover', function(sprite) {
//      console.log('mouseover');
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
//      console.log('mouseout');
      me.drawComp.focusObjects.pop();
      sprite.setAttributes({
        fill : 'ff0000',
        stroke : 'none'
      }, true);
      sprite.redraw();
    });
    me.s.on('click', function(sprite) {
//      console.log('click');
      var neuronMap = me.drawComp.neuronMap;
      neuronMap.registerNeuron(me);
    });
  },
  
  /**
   * Add synapse as Axon
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
    me.axons.push(syn);
    postNeuron.addDendriteSynapse(syn);
    me.updateSynapse();
    return syn;
  },
  
  addDendriteSynapse : function(synapse){
    this.dendrites.push(synapse);
    var neuron = null;
    if(this.groupedPreNeurons.containsKey(synapse.preNeuron.mapinternalId)){
      neuron = this.groupedPreNeurons.get(synapse.preNeuron.mapinternalId);
      neuron.push(synapse);
    }else{
      neuron = this.groupedPreNeurons.add(synapse.preNeuron.mapinternalId, [synapse]);
    }
    //for performance concern, dont call updateSynapse which will update all synapses in dendrite and axon
    synapse.updateLevel(neuron.length - 1);
  },
  
  /**
   * This is called after dragging to update x y and redraw synapse
   */
  updateXY : function(){
//    console.log('update xy');
    this.x = this.s.x + this.s.attr.translation.x;
    this.y = this.s.y + this.s.attr.translation.y;
    this.updateSynapse();
  },
  
  updateSynapse : function() {
    var me = this;
    Ext.each(me.dendrites,function(s){
      s.updateXY(true);
    });
    me.groupedPreNeurons.each(function(key, value){
      var dendrites = value;
      Ext.each(dendrites, function(syn, index){
        syn.updateLevel(index);
      });
    });
    
    Ext.each(me.axons,function(s){
      s.updateXY();
    });
  },
  
  toJSON : function(){
    return JSON.stringify({
      mapinternalId : this.mapinternalId,
      x : this.x,
      y : this.y,
      z : this.z,
      axons : this.axons,
      state : statics.STATE.N
    });
  }
});

Ext.define('Brain.Synapse', {
  extend : 'Brain.Object',
  arrow : null,
  arrowSideLength : 10,

  preNeuron : null,

  //persistent 
  postNeuron : null,

  endX : 0,
  endY : 0,
  //use for set up curve height, this level is determine by queue number in where is this synapse 
  level : 0,
  levelStep : 10,
  curveWidth : 20,
  
  constructor : function(args) {
    Ext.apply(this, args);
    this.setXY();// no draw() call ,because parent class will do 
    this.callParent(args);
  },

  isReverse : false,
  
  /**
   * Draw Synapse, will be call when initialed and redraw
   */
  draw : function() {
    var me = this;
    if (!Ext.isEmpty(me.drawComp)) {
      var sPathObj = Utils.getCurvePath(OP.add(me.x, me.y), OP.add(me.endX, me.endY), me.level * me.levelStep, me.curveWidth);
      var sPath = sPathObj.path;
        //[ 'M', me.x, me.y, 'Q', ((me.x + me.endX)/2 + 100), ((me.y + me.endY)/2 + 100), 'T', me.endX, me.endY ].join(' ');
      var arrawStartP = sPathObj.points[2]; //the curve control point 
      var arrawEndP = sPathObj.points[3]; //the curve control point 
      var arrowPath = Utils.getTriPath(OP.add(arrawStartP.x, arrawStartP.y), OP.add(arrawEndP.x, arrawEndP.y), me.arrowSideLength).path;
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
  
  setXY :function(){
    this.x = this.preNeuron ? this.preNeuron.x : this.x;
    this.y = this.preNeuron ? this.preNeuron.y : this.y;
    this.endX = this.postNeuron ? this.postNeuron.x : this.endX;
    this.endY = this.postNeuron ? this.postNeuron.y : this.endY;
  },
  
  updateXY : function(deferRender){
    this.setXY();
    if(!deferRender)
      this.draw();
  },
  
  updateLevel : function(index, deferRender){
    var level = index > 0 ? (index + 1)/2 : 0;
    this.level = index%2 == 0 ? level : -level;
    if(!deferRender)
      this.draw();
  },
  
  toJSON : function(){
    return JSON.stringify({
      mapinternalId : this.mapinternalId,
      x : this.x,
      y : this.y,
      z : this.z,
      postNeuron : {mapinternalId : this.postNeuron.mapinternalId}
    });
  }

});

Ext.define('AM.view.neuronmap.NeuronMap', {
  requires : ['Ext.data.UuidGenerator'],
  // DOM id
  id : 'neuron-map',
  itemId : 'neuronMap',
  extend : 'Ext.container.Container',
  alias : 'widget.neuronmap',

  layout : {
    type : 'border',
    border : 2
  },

  mode : MODE.NORMAL,
  
  neurons : [],

  /** This is the neurons to be connected */
  preNeuron : null,

  items : [ {
    xtype : 'toolbar',
    title : 'Brain Map Designer',
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
          } else if (neuronMap.mode == MODE.NEURON) {
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
          } else if (neuronMap.mode == MODE.SYNAPSE) {
            neuronMap.mode = MODE.NORMAL;
          }
        }
      }
    },{
      iconCls : 'synapse-r-active-btn',
      id : 'synapse-r-active-btn',
      text : 'Synapse Revert',
      tooltip : 'Active Synapse tool',
      toggleGroup : 'brainbuttons',
      listeners : {
        toggle : function(btn, pressed, opts) {
          var neuronMap = btn.up('neuronmap');
          if (pressed) {
            neuronMap.mode = MODE.SYNAPSE_R;
          } else if (neuronMap.mode == MODE.SYNAPSE_R) {
            neuronMap.mode = MODE.NORMAL;
          }
        }
      }
    },'->',{
      iconCls : 'save-btn',
      id : 'save-btn',
      text : 'Save Map',
      action: 'save',
      tooltip : 'Save the map',
      listeners : {
        click : function(btn, opts) {
          console.log('save');
        }
      }
    }],
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
    neuronMap : null/*,
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
    } ]*/
  } ],

  // store: 'Users'

  afterRender : function() {
    var me = this;
//    console.log('view ok');
    me.callParent(arguments);
    var drawpanel = me.getComponent('drawpanel');
    drawpanel.neuronMap = me;
    drawpanel.on('click', function(e, t, opts) {
//      console.log('draw panel click');
      if (drawpanel.focusObjects.length > 0) {

      } else {
        if (me.mode == MODE.NEURON) {
          var offset = me.getComponent('brainMapMenu').getHeight()
              + me.layout.border;
          me.addNeuron(drawpanel, e.getXY(), offset);
        } else{
          me.preNeuron = null;
        }
      }
    });
//    var bno = Ext.create('Brain.Neuron', {
//      drawComp : drawpanel,
//      x : 40,
//      y : 40
//    });
    // bno.draw();
//    var syn = Ext.create('Brain.Synapse', {
//      drawComp : me.getComponent('drawpanel'),
//      x : 10,
//      y : 10,
//      endX : 100,
//      endY : 100
//    });
    // syn.draw();
  },

  addNeuron : function(drawpanel, xy, offset) {
    var bno = Ext.create('Brain.Neuron', {
      drawComp : drawpanel,
      x : xy[0],
      y : xy[1] - offset,
      mapinternalId :Ext.data.IdGenerator.get('uuid').generate()
    });
    this.neurons.push(bno);
    return bno;
  },

  registerNeuron : function(neuron) {
    var me = this;
    if (me && (me.mode == MODE.SYNAPSE || me.mode == MODE.SYNAPSE_R)) {
      if (me.preNeuron && me.preNeuron != neuron) {// that means already has first neuron checked,this is the 2nd
        me.preNeuron.addAxonSynapse(neuron, me.mode);
        me.preNeuron = null;
      } else {
        me.preNeuron = neuron;
      }
    }
  }
});