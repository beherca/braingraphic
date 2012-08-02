/**
 * Internal Id for neuron and Synapse
 */
function Iid(){};
Iid.prototype = {
    iid : 0,

    get : function() {
      return this.iid++;
    },
    // set offset
    set : function(offset) {
      offset++;
      this.iid = (this.iid < offset) ? offset : this.iid;
    },

    // reset to
    reset : function() {
      this.iid = 0;
    }
};

/**
 * Indexer to space elements
 */
function Indexer(){
  /**
   * Index on x axis
   */
  this.xi = {};
  this.yi = {};
  this.zi = {};
  this.maxx = 1000;
  this.maxy = 1000;
  this.maxz = 1000;
  this.minx = 0;
  this.miny = 0;
  this.minz = 0;
};

Indexer.prototype = {
  /**
   * Dimensions 
   */
  ds : {x : 'y', y : 'x'},
  /**
   * 
   * @param point
   * @param axis which axis of the point is changed
   * @returns
   */
  get : function(point, axis){
    var result = null;
    if(!Utils.isEmpty(this[axis + 'i'][point[axis]])){
      result = this[axis + 'i'][point[axis]][point[this.ds[axis]]];
    }
    return result;
  },
  
  /**
   * add function will remove the previous point in the index with current point\
   * without checking
   * @param point
   */
  add : function(point){
    var isValid = true;
    for(var d in this.ds){
      if(point[d] < this['min' + d] || point[d] > this['max' + d]){
        isValid = false;
        break;
      }
    }
    if(isValid){
      for(var d in this.ds){
        var d1 = (point[d]);
        var d2 = (point[this.ds[d]]);
        if(Utils.isEmpty(this[d + 'i'][d1])){
          this[d + 'i'][d1] = {};
        }
        this[d + 'i'][d1][d2] = point;
      }
    }
  },
  
  /**
   * remove the point from index
   * @param point
   */
  remove : function(point){
    for(var d in this.ds){
      if(!Utils.isEmpty(this[d + 'i'][point[d]])){
        //this.xi.[x = 100][y = 100]
        delete this[d + 'i'][point[d]][point[this.ds[d]]];
        //TODO delete consume a lot cpu
        /*if(Object.keys(this[d + 'i'][point[d]]).length == 0){
          delete this[d + 'i'][point[d]];
        }*/
      }
    }
  }
};

/**
 * Enable event for core functions
 */
function Observable(){
  this.listeners = {};
  this.on = function(){
    var listeners;
    /*
     * Usage 1
     * this.on({
     *   onClick : function(){},
     *   onDestroy : function(){},
     * })
     */
    if(!Utils.isEmpty(arguments) && arguments.length == 1){
      listeners = arguments[0];
      for(var evtName in listeners){
        var eventHandler = listeners[evtName];
        this.addListener(evtName, eventHandler);
      }
    }
    /*
     * Usage 2 
     * this.obj.on('onClick', function(){}, scope[default obj])
     */
    else if(!Utils.isEmpty(arguments) && arguments.length > 1){
      var evtName = arguments[0];
      var eventHandler = Utils.isEmpty(arguments[2]) ? {fn : arguments[1], scope : this} : {fn : arguments[1], scope : arguments[2]};
      this.addListener(evtName, eventHandler);
    }
  };
  
  this.addListener = function(evtName, eventHandler, scope){
    if(this.listeners && this.listeners[evtName]){
      this.listeners[evtName].push(eventHandler);
    }else if(this.listeners && !this.listeners[evtName]){
      this.listeners[evtName] = [eventHandler];
    }
  };
  
  this.fireEvent = function(name, obj){
    var reglists = this.listeners[name];
    if(!Utils.isEmpty(reglists) && Array.isArray(reglists) && reglists.length > 0){
      for(var i in reglists){
        var listener = reglists[i];
        if(typeof(listener) == 'object'){
          listener.fn.call(listener.scope, obj, name);
        }else if(typeof(listener) == 'function'){
          listener.call(this, obj, name);
        }
      }
    }else if(!Utils.isEmpty(reglists) && !Array.isArray(reglists)){
      var listener = reglists;
      if(typeof(listener) == 'object'){
        listener.fn.call(listener.scope, obj, name);
      }else if(typeof(listener) == 'function'){
        listener.call(this, obj, name);
      }
    }
  };
  
  /**
   * @param evtName the registered event name
   * @param func the function that is registered, if this is null, all listeners which
   * listen to this event will be deleted 
   * @returns the objects that is deleted
   */
  this.removeListener = function(evtName, func){
    var removed = null;
    if(!Utils.isEmpty(evtName)){
      if(!Utils.isEmpty(func)){
        var reglist = this.listeners[evtName];
        if(!Utils.isEmpty(reglist)){
          var i = reglist.indexOf(func);
          removed = reglist.splice(i, i+1);
          this.listeners[evtName] = reglist;
        }
      }else{
        delete this.listeners[evtName];
      }
    }
    return removed;
  },
  
  this.removeAllListeners = function(){
    this.listeners = {};
  };
  
  this.destroy = function(){
    this.listeners = null;
  };
  return this;
};

/**
 * Origin Point
 */
OP = {
  x : 0,
  y : 0,
  z : 0,
  add : function(x, y, z) {
    return {
      x : x,
      y : y,
      z : Utils.isEmpty(z) ? 0 : z
    };
  }
};

Utils = {
  isEmpty : function(obj) {
    return obj == null || typeof obj === "undefined";
  },
  
  isObject : function(obj){
    return !Utils.isEmpty(obj) && typeof obj === "object";
  },

  isFunction : function(obj){
    return typeof obj === "function";
  },

  isArray : function(arr) {
    return !Utils.isEmpty(arr) && arr.constructor == Array;
  },

  round : function(value, accuracy){
    accuracy = Utils.isEmpty(accuracy) ? 0 : accuracy;
    var e = Math.pow(10, accuracy);
    var v = (parseInt (value * e))/e;
    if((v > 0 && v < 1/e) || (v < 0 && v > -1/e)){
      v = 0;
    }
    return v;
  },

  /**
   * 
   * @param target target to apply values
   * @param from is where the values are from
   * @param keepDup refer to whether to override the existed value in target
   * @returns
   */
  apply : function(target, from, keepDup){
    if(keepDup){
      for(var key in from){
        if(Utils.isEmpty(target[key]) && !Utils.isEmpty(from[key])){
          target[key] = from[key];
        }
      }
    }else{
      for(var key in from){
        if(!Utils.isEmpty(from[key])){
          target[key] = from[key];
        }
      }
    }
    return target;
  },
  
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
    var angle = - me.getAngle(startP, endP);
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

  /**
   * end Point to start
   * @param startP
   * @param endP
   * @param offset
   * @returns {Number}
   */
  getAngle : function(startP, endP, offset) {
    var disX = this.getDisX(startP, endP);
    var disY = this.getDisY(startP, endP);
    var angle = 0;
    angle = Math.atan2(disY, disX) + (Utils.isEmpty(offset) ? 0 : offset);
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
    var angle = -this.getAngle(startP, endP, pi * 0.5);// anti-clockwise 90
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
    var origPoints = [ OP, OP.add(p1.x, p1.y), OP.add(p2.x, p2.y)];
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
/**
 * Inspired By John Resig
 * 1 inheritable : the child can reuse method and properties without re-define them
 * 2 isolate : each instance has their own copy of prototype properties, change of these properties will not impact prototype
 * 3 call parent in the method body
 * 4 you can pass the parameters to the parent if you like
 * Test Case
  C = Utils.cls.extend(Observable, {c :3, cf: function(){return this.c}, init : function(){console.log('init C')}})
  B = Utils.cls.extend(C, {a : 2, init : function(){console.log('init B'); this.callParent()}}) 
  b = Utils.cls.create(B)
 */
Utils.cls = {
  fnTest : /xyz/.test(function(){xyz;}) ? /\bcallParent\b/ : /.*/,
  /**
   * @param parentClass 
   * @param propConfig configures of child class
   */
  extend : function(parentClass, propConfig){
    var me = this;
    var parentParent = parentClass.prototype;
    var parentInst = new parentClass();
    var constructorProps = {};
    for (var name in propConfig) {
      // Check if we're overwriting an existing function
      if(Utils.isFunction(propConfig[name])){
        // all the functions will copy to current class's prototype
        parentInst[name] = Utils.isFunction(parentInst[name]) && 
        //make sure that this function contains callParent
        this.fnTest.test(propConfig[name]) ? 
        (function(name, fn){
          return function() {
            //replace the callParent method with correct parent method
            this.callParent = parentParent[name];
            //call the function, and at the same time, callParent is called
            var ret = fn.apply(this, arguments);
            return ret;
          };
        })(name, propConfig[name]) : 
          propConfig[name];
      }else{//make deepcopy , so we can isolate the properties from prototype
        constructorProps[name] = me.deepCopy(propConfig[name]);
      }
    }
    
    //copy properties from parent Classs instance, 
    for(var name in parentInst){
      var p = parentInst[name];
      if(!Utils.isFunction(p)){
        constructorProps[name] = me.deepCopy(p);
      }
    }
    // set the properties in the constructor, so the properties change will not affect prototype
    var ChildClass = function(){
      //must use deep copy to copy the props config, otherwise, the prop will be changed during runtime
      Utils.apply(this, me.deepCopy(constructorProps));
    };
    ChildClass.prototype = parentInst;
    ChildClass.prototype.constructor = ChildClass;
    return ChildClass;//a function
  },
  
  /**
   * equal to new then call init()
   */
  create : function(classDef, valConfig){
    var instance = new classDef();
    Utils.apply(instance, valConfig);
    if(!Utils.isEmpty(instance.init) && Utils.isFunction(instance.init)){
      instance.init(valConfig);
    }
    return instance;// an object
  },
  
  /**
   * Deep copy all properties, so there are no conflicts
   */
  deepCopy : function(from, target){
    if(Utils.isObject(from)){
      target = target || ((Utils.isArray(from)) ? [] : {});
      for (var i in from){
        if(Utils.isObject(from[i])){
          target[i] = (Utils.isArray(from[i])) ? [] : {};
          this.deepCopy(from[i], target[i]);
        }else{
          target[i] = from[i];
        }
      }
      return target;
    }else{//if from is not a object, return itself
      return from;
    }
  }
};