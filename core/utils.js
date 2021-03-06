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
Iid.constructor = Iid;

/**
 * This is an iid generator
 * @param prefix the prefix that inherited from parent
 * @param obj the object that iider live in
 * @param props the properties of object
 */
Iider = {
  get : function(obj, props, prefix){
    prefix = prefix != null ? this.refine(prefix) :'root';
    var idElements = [prefix];
    if(Utils.isObject(obj)){
      for(var i in props){
        var prop = props[i];
        if(obj[prop] != null){
          var elem = this.refine(obj[prop]);
          if(elem != ''){
            idElements.push(elem);
          }
        }
      }
    }else{
      var elem = this.refine(obj.toString());
      if(elem != ''){
        idElements.push(elem);
      }
    }
    var suffix = [Date.now()/*, Math.random().toString().replace('.', '')*/]; 
    var iid = this.build(idElements.concat(suffix));
    return iid;
  },
  
  build : function(idElements){
    return idElements != null ? idElements.join('-') : '';
  },
  
  refine : function(str){
    return str != null ? str.replace(/[^A-Za-z0-9\/-]+/gi, '') : '';
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

function Euclidean(){
  this._x = 0;
  this._y = 0;
  this._z = 0;
  this._ex = 0;
  this._ey = 0;
  this._ez = 0;
};

Euclidean.prototype = {
  get x(){
    return this._x;
  },
  
  set x(v){
    this._x = v;
  },
  
  get y(){
    return this._y;
  },
  
  set y(v){
    this._y = v;
  },
  
  get z(){
    return this._z;
  },
  
  set z(v){
    this._z = v;
  },
  
  get ex(){
    return this._ex;
  },
  
  set ex(v){
    this._ex = v;
  },
  
  get ey(){
    return this._ey;
  },
  
  set ey(v){
    this._ey = v;
  },
  
  get ez(){
    return this._ez;
  },
  
  set ez(v){
    this._ez = v;
  },

  get width(){
    return (this.ex - this.x);
  },
  
  
  get height(){
    return (this.ey - this.y);
  },
  
  get depth(){
    return (this.ez - this.z);
  },
  
  toJson : function(){
    return {
      x : this.x,
      y : this.y,
      z : this.z,
      ex : this.ex,
      ey : this.ey,
      ez : this.ez
    };
  }
};

Euclidean.prototype.constructor = Euclidean;


function Dims(dims, start){
  this.dims = dims ? dims : ['x', 'y', 'z'];
  this.currDim = start;
}

Dims.prototype = {
  next : function (){
    var currentIndex = this.dims.indexOf(this.currDim);
    var nextIndex = currentIndex + 1 >= this.dims.length ? 0 : currentIndex + 1;
    var dim = this.dims[nextIndex];
    this.currDim = dim;
    return dim;
  }, 
  
  all : function(){
    return this.dims;
  }
};

Dims.prototype.constructor = Dims;

/**
 * Enable event for core functions
 */
function Observable(){
  this._listeners = {};
  this.on = function(){
    var listeners;
    /*
     * Usage 1
     * this.on({
     *   onClick : {
     *     fn : function(){},
     *     scope : function(){}
     *   },
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
     * this.obj.on('onClick', function(){}, [scope(default obj)], [repeat])
     */
    else if(!Utils.isEmpty(arguments) && arguments.length > 1){
      var evtName = arguments[0];
      var eventHandler = Utils.isEmpty(arguments[2]) ? {fn : arguments[1], scope : this} : {fn : arguments[1], scope : arguments[2]};
      /*
       * set repeat time for event handler, 
       * when repeat times reduce to zero, this handler will be destroy automatically
      */
      if(!Utils.isEmpty(arguments[3]) && arguments[3] > 0){
        eventHandler.repeat = arguments[3];
      }
      this.addListener(evtName, eventHandler);
    }
  };
  
  this.addListener = function(evtName, eventHandler, scope){
    if(this._listeners && this._listeners[evtName]){
      this._listeners[evtName].push(eventHandler);
    }else if(this._listeners && !this._listeners[evtName]){
      this._listeners[evtName] = [eventHandler];
    }
  };
  
  this.fireEvent = function(name, obj){
    var reglists = this._listeners[name];
    //collect all listeners return results if it has any, for RuleEngine to use
    var collectedResults = [];
    if(!Utils.isEmpty(reglists) && Array.isArray(reglists) && reglists.length > 0){
      for(var i in reglists){
        var listener = reglists[i];
        var result = null;
        if(typeof(listener) == 'object'){
          /*
           * Check whether current listener comes to the end of its life,
           * if yes, remove it
           */
          if(!Utils.isEmpty(listener.repeat)){
            if( listener.repeat > 0){
              listener.repeat += -1;
              result = listener.fn.call(listener.scope, obj, name, this);
            }else{
              /**
               * delete the handler for that listener
               */
              if(reglists.length > 1){//more than one
                //copy the list
                var newListeners = [].concat(reglists);
                newListeners.splice(i, i);
                this._listeners[name] = newListeners;
              }else{
                delete this._listeners[name];
              }
            }
          }else{
            result = listener.fn.call(listener.scope, obj, name, this);
          }
        }
        if(result != null){
          collectedResults.push(result);
        }
      }
    }
    return collectedResults;
  };
  
  /**
   * @param evtName the registered event name
   * @param func the function that is registered, if this is null, all listeners which
   * listen to this event will be deleted 
   * @returns the objects that is deleted
   */
  this.removeListener = function(evtName, fn){
    var removed = null;
    if(!Utils.isEmpty(evtName)){
      if(!Utils.isEmpty(fn)){
        var reglist = this._listeners[evtName];
        if(!Utils.isEmpty(reglist)){
          var ls = reglist.filter(function(obj){
            if(obj.fn === fn){
              return true;
            }
          });
          if(ls.length > 0){
            //found
            if(reglist.length > 1){
              var i = reglist.indexOf(ls[0]);
              removed = reglist.splice(i, i);
              this._listeners[evtName] = reglist;
            }else{
              delete this._listeners[evtName];
            }
          }
        }
      }else{
        delete this._listeners[evtName];
      }
    }
    return removed;
  },
  
  this.removeAllListeners = function(){
    this._listeners = {};
  };
  
  this.destroy = function(){
    this._listeners = null;
  };
  return this;
};

/**
 * Unblock looper example, equal to for(var i =start; i< end ; i + step){console.log(i)}
 * l = Utils.cls.create(Looper)
 * l.run({name : name, start : 0, end : 10, step : 1, function(i){console.log(i)}})
 * setInterval(l.tick, 1000); // in browser
 * process.tick(l.tick) // in nodejs
 * @returns
 */
function Looper(ticker){
  this.loopees = {};
  this.forceStop = false;
  this.ticker = ticker;
};

Looper.prototype =  {
  start : function(){
    this.forceStop = false;
    this.tick();
  },
  
  stop : function(){
    this.forceStop = true;
  },
  
  tick : function(){
    var me = this;
    for(var name in me.loopees){
      var loopee = me.loopees[name];
      if(loopee['index'] < loopee['end']){
        var i = loopee['index'];
        loopee['capsule'] = loopee['handler'](i, loopee['capsule']);
        loopee['index'] = i + loopee['step'];
      }else{
        me.remove(name);
      }
    }
    if(me.forceStop){
      me.forceStop = false;
    }else if(me.ticker){
      me.ticker(function(){
        me.tick();
      });
    }
  },
  
  /**
   * loopee : {
        name : name, 
        start :  start,
        end : end,
        step : step,
        handler : handler,
        callder : caller
      }
   */
  run : function(loopee){
    loopee['handler'] = loopee['handler'].bind(loopee['scope']);
    loopee['index'] = loopee['start'];
    loopee['capsule'] = null;
    this.loopees[loopee.name] = loopee;
  },
  
  /**
   * remove loopee
   * @param name loopee name
   */
  remove : function(name){
    delete this.loopees[name];
  },
  
  destroy : function(){
    this.loopees = null;
  }
};

Looper.prototype.constructor = Looper;
  


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

AXIS = {X : 'x', Y : 'y', Z : 'z'};

var Utils = {
  isEmpty : function(obj) {
    return obj == null /*implecit convert null, and undefined*/|| typeof obj === "undefined";
  },
  
  /**
   * set restrict true : Must be an object, not array, function ,regx, number, string and so on
   */
  isObject : function(obj, restrict){
    return !Utils.isEmpty(obj) && typeof obj === "object" 
      && (!restrict || (obj.constructor && obj.constructor === Object));
  },

  isFunction : function(obj){
    return typeof obj === "function" && obj.constructor && obj.constructor === Function;
  },

  isArray : function(arr) {
    return !Utils.isEmpty(arr) && arr.constructor == Array;
  },
  
  T : {
    EMPTY : 'empty',
    ARRAY : 'array',
    FUNC : 'function',
    INST : 'instance',
    STR : 'string',
    NUM : 'number',
    REGX : 'regx',
    DATE : 'date',
    BOOL : 'boolean',
    OBJ : 'object'
  },
  
  type : function(obj){
    if(obj == null){//empty means both null and undefined
      return Utils.T.EMPTY;
    }else if(typeof obj === 'string'){//string
      return Utils.T.STR;
    }else if(typeof obj === 'number'){//number
      return Utils.T.NUM;
    }else if(typeof obj === 'boolean'){//boolean
      return Utils.T.BOOL;
    }else if(typeof obj === 'function' && obj.constructor && obj.constructor === Function){//function 
      return Utils.T.FUNC;
    }else if (typeof obj === 'object'){//Object
      if(obj.constructor && obj.constructor === Array){//array
        return Utils.T.ARRAY;
      }else if(obj.constructor && obj.constructor === RegExp){//regular expression
        return Utils.T.REGX;
      }else if(obj.constructor && obj.constructor === Date){//date
        return Utils.T.DATE;
      }else if(obj.constructor && obj.constructor === Object /*equals to obj instanceof Object*/){//instance
        return Utils.T.OBJ;
      }else{
        return Utils.T.INST;
      }
    }
    return null;
  },
  
  deepcopy : function(from, options){
    var target = null;
    switch(Utils.type(from)){
      case Utils.T.OBJ :
        target = {};
        for(var key in from){
          var prop = from[key];
          if(prop != null){
            target[key] = Utils.deepcopy(prop);
          }
        }
        break;
      case Utils.T.INST :
        target = Utils.cls.create(from.constructor);
        for(var key in from){
          if(from.hasOwnProperty(key)){//exclude properties from prototype
            var prop = from[key];
            if(prop != null){
              target[key] = Utils.deepcopy(prop);
            }
          }
        }
        break;
      case Utils.T.ARRAY :
        target = [];
        from.forEach(function(obj){
          target.push(Utils.deepcopy(obj));
        });
        break;
      default : //either string, number, booean, function, come to here
        target = from;
        break;
    }
    return target;
  },
  
  /**
   * Tojson helper
   * the purpose of this function is to automatically call toJson of the object's property,
   * and if property is an array, it will loop the array and call toJson for each element.
   * this function has no intend to make any deep copy of target object 
   * @param options contain
   *  excludeEmpty :  if an object is null or an array contains no element, then exclude it 
   */
  tj : function(from, options){
    var target = {};
    options = options ? options : {};
    var excludeEmpty = options.excludeEmpty != null ? options.excludeEmpty : true;
    for(var key in from){
      if(from.hasOwnProperty(key)){
        var prop = from[key];
        switch(Utils.type(prop)){
          case Utils.T.INST :
            if(prop.toJson){
              target[key] = prop.toJson();
            }else{
              target[key] = prop;
            }
            break;
          case Utils.T.ARRAY :
            if(!excludeEmpty || prop.length > 0){
              var copy = [];
              prop.forEach(function(obj){
                //simple check
                if(obj.toJson){
                  copy.push(obj.toJson());
                }else{
                  copy.push(obj);
                }
              });
              target[key] = copy;
            }
            break;
          default : 
            if(!excludeEmpty || prop != null){
              target[key] = prop;
            }
            break;
        }
      }
    }
    return target;
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
   * Partial apply, include the listed part only
   * @param target target to apply values
   * @param from is where the values are from
   * @param options contain
   *         keepDup true to retain the existed value in target but not override it by from object
   *         solver the customized function to copy object
   *         includes copy specify properties only
   *         regx regular expression to include
   *         excludeEmpty true to exclude Empty
   * @returns new target
   */
  include : function(target, from, options){
    options = options ? options : {};
    var keepDup = options.keepDup;
    var solver = options.solver;
    var includes = options.includes;
    var regx = (options.regx && (options.regx instanceof RegExp)) ? options.regx : null;
    var excludeEmpty = options.excludeEmpty != null ? options.excludeEmpty : true;
    for(var key in from){
      if((includes && includes.indexOf(key) >= 0) || regx && regx.test(key)){
        var value = solver ? solver(from[key]) : from[key];
        if((Utils.isEmpty(target[key]) || !keepDup) //check duplicate
            && (!excludeEmpty || value != null)){ //check exclude empty
            target[key] = value;
        }
      }
    }
    return target;
  },
  
  /**
   * Partial apply, copy those properties in which is not the list
   * @param target target to apply values
   * @param from is where the values are from
   * @param options contain
   *         keepDup true to retain the existed value in target but not override it by from object
   *         solver the customized function to copy object
   *         excludes copy those properties in which is not the list
   *         regx regular expression to exclude
   *         excludeEmpty true to exclude Empty
   * @returns new target
   */
  exclude : function(target, from, options){
    options = options ? options : {};
    var keepDup = options.keepDup;
    var solver = options.solver;
    var excludes = options.excludes;
    var regx = (options.regx && (options.regx instanceof RegExp)) ? options.regx : null;
    var excludeEmpty = options.excludeEmpty != null ? options.excludeEmpty : true;
    for(var key in from){
      if(excludes && excludes.length > 0){
        if(excludes.indexOf(key) >= 0){
          continue;
        }
      }
      if(regx && regx.test(key)){
        continue;
      }
      var value = solver ? solver(from[key]) : from[key];
      if((Utils.isEmpty(target[key]) || !keepDup) //check duplicate
          && (!excludeEmpty || value != null)){ //check exclude empty
          target[key] = value;
      }
    }
    return target;
  },

  /**
   * 
   * @param target target to apply values
   * @param from is where the values are from
   * @param keepDup refer to whether to override the existed value in target
   * @returns
   */
  apply : function(target, from, keepDup, solver){
    if(keepDup){
      for(var key in from){
        var value = solver ? solver(from[key]) : from[key];
        if(Utils.isEmpty(target[key]) && value != null){
          target[key] = value;
        }
      }
    }else{
      for(var key in from){
        var value = solver ? solver(from[key]) : from[key];
        if(!Utils.isEmpty(from[key]) && value != null){
          target[key] = value;
        }
      }
    }
    return target;
  },
  
  /**
   * Build ascend queue of descend queue
   * @param ps
   * @param point
   * @param prop
   */
  buildQ : function(point, prop, ps, ascend){
    if(!ps || !point || !prop || point[prop] == null || isNaN(point[prop])){
      return;
    }
    //default as ascend sort
    if(ascend == null){
      ascend = true;
    }
    var len = ps.length;
    //point's property to compare with
    var pp = point[prop];
    //candidate point to compare with pp
    var cp = null;
    if(len == 0){
      ps.push(point);
    }else if(len == 1){
      cp = ps[0];
      var cpp = cp[prop];
      if(cpp < pp){
        ps.push(point);
      }else{
        ps.unshift(point);
      }
    }else if(len >= 2){
      var start = 0;// >= start
      var end = len - 1;// < end
      if(pp <= ps[start][prop]){
          //add to the begining
          ps.unshift(point);
      }else if(pp >= ps[end][prop]){
          //add to last one
          ps.push(point);
      }else{
        while(true){
          //number of elements in array ps
          var numofEl = end - start + 1;
          //the middle key of array;
          var mid = parseInt(numofEl / 2) + start;
          //the object in the array's middle
          var midp = ps[mid];
          //middle point property
          var mpp = midp[prop];
          if( mpp == pp){
            //add before middle point
            ps.splice(mid, 0, point);
            break;
          }else if(mpp > pp){
            if(numofEl < 3){
              ps.splice(mid, 0, point);
              break;
            }else{
              end = mid;
            }
          }else if(mpp < pp){
            if(numofEl < 3){
              ps.splice(mid + 1, 0, point);
              break;
            }else{
              start = mid;
            }
          }
        }
      }
    }else{
      //DO NOTHING
    }
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
  /**
   * @param parentClass 
   * @param configs configures of child class
   */
  extend : function(parentClass, configs){
    var me = this;
    //init some usefull constants
    var CLASS_ALIAS = 'alias';
    var hasCallParent = /xyz/.test(function(){xyz;}) ? /\bcallParent\b/ : /.*/;
    var hasSet = /^set\$(?=([A-Za-z]+$))/;//prefix is set$ and end with characters
    var hasGet = /^get\$(?=([A-Za-z]+$))/;//prefix is get$ and end with characters
    
    //keep useful informations
    var parentParent = parentClass.prototype;
    var parentInst = new parentClass();
    var constructorProps = {};
    
    //loop through user-define properties or functions
    for (var name in configs) {
      var configItem = configs[name];
      // all the functions will be copied to current class's prototype
      if(configItem != null && Utils.isFunction(configItem)){
        //Check if we're overwriting an existing function
        //and whether this function contains callParent
        if(!Utils.isEmpty(parentInst[name]) && hasCallParent.test(configItem)){
          parentInst[name] = (function(name, fn){
            return function() {
              /*  
               * in case call parent is call twice from 
               * one function like 
               * function a(){
               *   b();
               *   this.callParent();
               * },
               * 
               * function b(){
               *   this.callParent();
               * }
               * */
              var tmp = this.callParent;
              //replace the callParent method with correct parent method
              this.callParent = parentParent[name];
              //call the function, and at the same time, callParent is called
              var ret = fn.apply(this, arguments);
              //recover previous call parent
              this.callParent = tmp;
              return ret;
            };
          })(name, configItem);
        }else if(hasSet.test(name)){
          ///^set\$(?=([A-Za-z]+$))/.exec('set$abv') should return ["set$", "abv"]
          var regx = hasSet.exec(name);
          var proportyName = regx && regx.length > 1 ? regx[1] : null;
          if(proportyName){
            Object.defineProperty(parentInst, proportyName, {
              set : configItem,
              enumerable : false,
              configurable : true
            });
          }
        }else if(hasGet.test(name)){
          var regx = hasGet.exec(name);
          var proportyName = regx && regx.length > 1 ? regx[1] : null;
          if(proportyName){
            Object.defineProperty(parentInst, proportyName, {
              get : configItem,
              enumerable : false,
              configurable : true
            });
          }
        }else{//the function name in configs without callParent() or set$, get$ prefix
          parentInst[name] = configItem;
        }
      }else{
        //make deepcopy , so we can isolate the properties from prototype
        constructorProps[name] = Utils.deepcopy(configItem);
      }
    }
    
    //copy properties from parent Classs instance, 
    for(var name in parentInst){
      var p = parentInst[name];
      if(!Utils.isFunction(p)){
        //'cls' is a key word of class system, skip it 
        if(name !== CLASS_ALIAS){
          constructorProps[name] = Utils.deepcopy(p);
        }
      }
    }
    // set the properties in the constructor, so the properties change will not affect prototype
    //must use deep copy to copy the props config, otherwise, the prop will be changed during runtime
    var holder = {};
    //check null and replace all non-charactors case-insensitive but keep $
    var clsName = configs[CLASS_ALIAS] == null ? '' : configs[CLASS_ALIAS].replace(/[^A-Za-z$_]+/gi, '');
    var expName = (clsName == '') ? 'ChildClass' : clsName;
    var evalStr = 'holder["'+ expName +'"] = function ' + clsName + '(){ Utils.apply(this, Utils.deepcopy(constructorProps));}';
    var cls = null;
    try{
      eval(evalStr);
      cls = holder[expName];
      cls.prototype = parentInst;
      cls.prototype.constructor = cls;
    }catch(e){
      console.log(e);
    }
    return cls;//a function
  },
  
  /**
   * equal to new then call init()
   */
  create : function(classDef, valConfig, mixins){
    var instance = new classDef();
    if(mixins && Utils.isArray(mixins) && mixins.length > 0){
      mixins.forEach(function(cls){
        var mixin = new cls();
        //never override instance properties and function with mixin's
        Utils.apply(instance, mixin, true);
      });
    }
    if(!Utils.isEmpty(valConfig)){
      Utils.apply(instance, valConfig);
    }
    if(!Utils.isEmpty(instance.init) && Utils.isFunction(instance.init)){
      instance.init.call(instance, valConfig);
    }
    return instance;// an object
  }
};


/**
 * Utility to Set up rules
 */
var RulesEngine = Utils.cls.extend(Observable, {
  _scope : null,

  check : function(ruleName, config){
    var rs = this.fireEvent(ruleName, config);
    var isValid = true;
    rs.every(function(r){
      var result = r.result;
      var operator = r.opt;
      isValid = operator == '&&' ? isValid && result : isValid || result; 
    });
    return isValid;
  },
  
  /**
   * rule = {name : name, desc : desc, opt : opt, fn : fn}
   * @param rule
   */
  add : function(rule){
    var name = rule.name;
    var operator = rule.opt;
    var fn = rule.fn;
    this.on(name, function(obj, name, target){
      return {result : fn.apply(this.scope, obj, target), opt : operator};
    });
  },
  
  get$scope : function(){
    return this._scope;
  },
  
  set$scope : function(v){
    this._scope = v;
  }
});

