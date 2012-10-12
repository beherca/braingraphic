/**
 * This class mainly work as data manipulation, 
 * to create a virtual world data, which is used 
 * for present visual world
 */
World = {
  create : function(config){
    return Utils.cls.create(World.World, config);
  }
};


World.Object = Utils.cls.extend(Observable, {
  alias : 'World_Object',
  _x : 0,
  _y : 0,
  _z : 0
});

World.Object.prototype.__defineSetter__('x', function(v){this._x = parseInt(v);});
World.Object.prototype.__defineSetter__('y', function(v){this._y = parseInt(v);});
World.Object.prototype.__defineSetter__('z', function(v){this._z = parseInt(v);});
World.Object.prototype.__defineGetter__('x', function(){return this._x;});
World.Object.prototype.__defineGetter__('y', function(){return this._y;});
World.Object.prototype.__defineGetter__('z', function(){return this._z;});

World.World = Utils.cls.extend(World.Object, {
  
  alias : 'World_World',
  
  iidor : new Iid(),
  links : {},
  points : {},
  
  indexer : null,
  
  //TODO
  boundary : null,
  /**
   * Global force apply to all
   */
  gForce : null,
  
  //resistant force, the smaller, swamper 
  resistance : 0.1, 
  //below is for the crash detector
  subW : {},
  minSubW : 0,
  bWSize : 20,
  worldCapacity : 4,
  
  init : function(config){
    Utils.apply(this, config);
    this.indexer = new Indexer(); 
  },
  
  //TODO this create sub new world to check crash
  newChild : function(){
    
  },
  
  add : function(config){
    var me = this;
    if(config.type == 'point'){
      var p = Utils.cls.create(World.Point, Utils.apply({world : this, iid : this.iidor.get()}, config));
      p.on({'onDestroy' : {fn : me.remove, scope : me}});
      //TODO lazy crash detect don't know why, this is just not working
      //p.on({'onMove' : {fn : me.detectCrash, scope : me}});
      this.points[p.iid] = p;
      if(!Utils.isEmpty(this.gForce) && p.isApplyGForce){
        this.gLink(p);
      }
      this.fireEvent('onAdd', {type : config.type, obj :p});
      return p;
    }else if(config.type == 'ant'){
      var ant = Utils.cls.create(Creature.Ant, Utils.apply({world : this, iid : this.iidor.get()}, config));
      ant.on({'onDestroy' : {fn : me.remove, scope : me}});
      this.points[ant.iid] = ant;
      this.fireEvent('onAdd', {type : config.type, obj :ant});
      return ant;
    }else if(config.type == 'life'){
      var life = Utils.cls.create(Creature.Life, Utils.apply({world : this, iid : this.iidor.get()}, config));
      life.on({'onDestroy' : {fn : me.remove, scope : me}});
      this.points[life.iid] = life;
      this.fireEvent('onAdd', {type : config.type, obj : life});
      return life;
    }else if(config.type == 'triangle'){
      var tri = Utils.cls.create(World.Triangle, Utils.apply({world : this, iid : this.iidor.get()}, config));
      tri.on({'onDestroy' : {fn : me.remove, scope : me}});
      this.points[tri.iid] = tri;
      this.fireEvent('onAdd', {type : config.type, obj : tri});
      return tri;
    }else if(config.type == 'circle'){
      var circle = Utils.cls.create(World.Circle, Utils.apply({world : this, iid : this.iidor.get()}, config));
      circle.on({'onDestroy' : {fn : me.remove, scope : me}});
      this.points[circle.iid] = circle;
      this.fireEvent('onAdd', {type : config.type, obj : circle});
      return circle;
    }else if(config.type == 'line'){
      var line = Utils.cls.create(World.Line, Utils.apply({world : this, iid : this.iidor.get()}, config));
      line.on({'onDestroy' : {fn : me.remove, scope : me}});
      this.points[line.iid] = line;
      this.fireEvent('onAdd', {type : config.type, obj : line});
      return line;
    }else if(config.type == 'polygon'){
      var polygon = Utils.cls.create(World.Polygon, Utils.apply({world : this, iid : this.iidor.get()}, config));
      polygon.on({'onDestroy' : {fn : me.remove, scope : me}});
      this.points[polygon.iid] = polygon;
      this.fireEvent('onAdd', {type : config.type, obj : polygon});
      return polygon;
    }
  },
  
  remove : function(obj){
    if(Utils.isEmpty(obj))return;
    obj.removeAllListeners();
    if(obj instanceof World.Point){
      delete this.points[obj.iid];
      this.fireEvent('onRemove', 'point', obj.iid);
    }else if(obj instanceof World.Link){
      delete this.links[obj.iid];
      this.fireEvent('onRemove', 'link', obj.iid);
    }
    obj = null;
  },
  
  tick : function(){
    for(var key in this.links){
      var l = this.links[key];
      l.calc();
    }
    for(var key in this.points){
      var p = this.points[key];
      p.move();
    }
  },
  
  link :  function(config){
//    console.log(Object.keys(this.links).length);
    var pre = config.pre;
    var post = config.post;
    var link = null;
    if(pre && post && pre != post 
        && Utils.isEmpty(pre.getIw(post)) 
        && Utils.isEmpty(post.getIw(pre))){
      link = Utils.cls.create(World.Link, Utils.apply({world : this, iid : this.iidor.get()}, config));
      pre.setIw(post, link);
      post.setIw(pre, link);
      link.on({'onDestroy' : {fn : this.remove, scope :this}});
      this.links[link.iid] = link;
      this.fireEvent('onAdd', {type : 'link', obj : link});
    }else{
      link = pre.getIw(post);
    }
    return link;
  },
  
  gLink : function(point){
    var config = {post : point,  unitForce : 1, elasticity : 0.8, maxEffDis : 2000, distance : 0,
        isDual: false, isBreakable : false};
    var link = Utils.cls.create(World.ForceLink, 
        Utils.apply({world : this, iid : this.iidor.get(), force : this.gForce}, config));
    link.on({'onDestroy' : {fn : this.remove, scope :this}});
    this.links[link.iid] = link;
    this.fireEvent('onAdd', {type : 'link', obj : link});
    return link;
  },
  
  surfaceLink : function(pre, post){
    // NOTES : about the repeat time and maxEffDis, they are experiment value, 
    // which help to stable the crash objects 
    var defaultSfc = { 
        unitForce : 1, elasticity : 0.01, 
        //TODO don't know how far is good , 10?
        distance : 1, 
        maxEffDis : 1/*see notes above*//*, 
        repeat : 10*//*see notes above*/};

    var preSfc = Utils.isEmpty(pre.surfaceLinkConfig) ? defaultSfc : pre.surfaceLinkConfig;
    var postSfc = Utils.isEmpty(post.surfaceLinkConfig) ? defaultSfc : post.surfaceLinkConfig;
    var mergeLink = {};
    for(var key in defaultSfc){
      mergeLink[key] = (preSfc[key] + postSfc[key])/2;
    }
    if(!pre.isCrashable && post.isCrashable){
      return this.link(Utils.apply(mergeLink, {pre : pre, post : post, isDual: false}));
    }else if(pre.isCrashable && !post.isCrashable){
      return this.link(Utils.apply(mergeLink, {pre : post, post : pre, isDual: false}));
    }else if(pre.isCrashable && post.isCrashable){
      return this.link(Utils.apply(mergeLink, {pre : post, post : pre, isDual: true}));
    }
  },
  
  getData : function(){
    var ps = {};
    for(var key in this.points){
      ps[key] = this.points[key].toJson();
    }
    return ps;
  },
  
  toJson : function(){
    return {iid : this.iid};
  }
});

World.Point = Utils.cls.extend(World.Object, {
  
  alias : 'World_Point',
  
  vx : 0,
  vy : 0,
  vz : 0,
  
  config : null,
  
  world : null,
  
  /**
   * Sub points
   */
  points : {},
  
  
  /**
   * True to anchor object to screen
   */
  isAnchor : false,
  
  /**
   * which group is this point belongs to, 
   * usually the object
   */
  group : null,
  
  weight : 1,
  
  visible : true,
  
  /**
   * Whether isCrashable with other points in the same group
   */
  isGroupCrash : false,
  
  isCrashable : true,
  /**
   * Define the circle crash-detect area with radius
   */
  crashRadius : 10,
  
  /**
   * for internal use, to check whether is in crashing
   */
  isCrashing : false,
  
  isPenetrated : false,
  
  /**
   * for internal use, to check whether is in moving
   */
  isMoving : false,
  
  /**
   * mark this point as destroyed and don't calculate in the link
   */
  destroyed : false,
  
  iid : 0,
  
  /**
   * description of this point
   */
  text : '',
  /**
   * link will destroy this point if set true
   */
  goneWithLink : false,
  
  /**
   * this is the configuration that define the surface feature of current point.
   * this configuration will be used by link which is created when the point crash other points
   */
  surfaceLinkConfig : null,
  
  /**
   * whether to apply global force
   */
  isApplyGForce : true,
  
  /**
   * record the object that currently interact with and the corresponding link.
   * this is to avoid adding duplicate link with the same object.
   * key : the iid
   * value : the link
   */
  interactWith : {},
  
  init : function(config){
    this.config = config;
    Utils.apply(this, config);
    this.world.indexer.add(this);
  },

  move : function(){
//    console.log('move to : x =' + this.x + '  y =' + this.y);
//    console.log('speed  : vx =' + this.vx + '  vy =' + this.vy);
    var me = this;
    var ds = {x : 'x', y : 'y', z : 'z'};
    for(var d in ds){
      if(me['v' + d] != 0){
        var len = Math.abs(me['v' + d]);
        var i = 0;
        var dir = me['v' + d] > 0 ? 1 : -1;
        var pos = 0;
        var testP = null;
        var isCrashed = false;
        while(i*dir < len){
          i += dir;
          pos = OP.add(parseInt(me.x), parseInt(me.y), parseInt(me.z));
          pos[d] += i;
          testP = me.world.indexer.get(pos, d);
          if(!Utils.isEmpty(testP)){
            pos[d] += -dir;
            isCrashed = true;
            break;
          }
        }
        me['old' + d] = me[d];
        this.world.indexer.remove(me);
        me[d] = pos[d];
        this.world.indexer.add(me);
        if(isCrashed && !Utils.isEmpty(testP)){
          if(!this.isCrashable && testP.isCrashable){
            if(!testP.isAnchor)
              testP['v' + d] = parseInt(testP['v' + d] > 0 ? -testP['v' + d] : testP['v' + d]);
          }else if(this.isCrashable && !testP.isCrashable){
            if(!this.isAnchor)
              this['v' + d] = parseInt(this['v' + d] > 0 ? -this['v' + d] : this['v' + d]);
          }else if(this.isCrashable && testP.isCrashable){
            var avg = Math.abs(this['v' + d] + testP['v' + d])/2;
            if(!this.isAnchor)
              this['v' + d] = parseInt(this['v' + d] > 0 ? -avg : avg);
            if(!testP.isAnchor)
              testP['v' + d] = parseInt(testP['v' + d] > 0 ? -avg : avg);
          }
          me.world.surfaceLink(me, testP);
        }
        me.isMoving = true;
//        me.fireEvent('onMove', me/*{obj : me, axis : d}*/);
      }
    }
  },
  
  link2 : function(post, config){
    return this.world.link(Utils.apply({pre : this, post : post}, config));
  },
  
  /**
   * This is a customized crash handler
   */
  crashHandler : function(point){
    if(Utils.isEmpty(this.getIw(point))){
      this.world.surfaceLink(this, point);
    }
  },
  
  /**
   * IW is short for get Interact With
   * set the link between this and the object that currently interact with
   */
  setIw : function(point, link){
    this.interactWith[point.iid] = link;
  },
  
  /**
   * IW is short for get Interact With
   * get the link between this and the object that currently interact with
   */
  getIw : function(point){
    return this.interactWith[point.iid];
  },
  
  /**
   * IW is short for get Interact With
   * get the link between this and the object that currently interact with
   */
  rmIw : function(point){
    if(!Utils.isEmpty(this.getIw(point))){
      delete this.interactWith[point.iid];
    }
  },
  
  /**
   * Check candidate point and its parent to see whether is the same group
   */
  isSameGroup : function(point){
    //search to the top of the inherent tree, if this is root, the group should be null
    if(!Utils.isEmpty(this.group)){
      return point.group == this || this.group.isSameGroup(point);
    }else {
      return point.group == this;
    }
  },
  
  destroy : function(){
    //for link to use, usually, the link with current point will not be update immediately 
    //after this point has been removed
    this.destroyed = true;
    this.fireEvent('onDestroy', this);
  },
  
  toJson : function(){
    var points = {};
    for(var key in this.points){
      points[key] = this.points[key].toJson();
    }
    return {
      iid : this.iid,
      x : this.x,
      y : this.y,
      z : this.z,
      text : this.text,
      visible : this.visible,
      points : points
    };
  }
});

World.Triangle = Utils.cls.extend(World.Point, {
  
  alias : 'World_Triangle',
  
  /**
   * Top point
   */
  top : null,
  /**
   * left point
   */
  left : null,
  /**
   * right point
   */
  right : null,
  
  /**
   * Side Top to right
   */
  sdTopRt : null,
  
  /**
   * Side Top to right
   */
  sdRtLf : null,
  
  /**
   * Side Top to right
   */
  sdLfTop : null,
  
  init : function(config){
    this.callParent(config);
    //make default value to config
    Utils.apply(config, {unitForce : 0.5, elasticity : 0.5, maxEffDis : 2000}, true);
    this.top = this.createPoint(config.top, 'top');
    this.left = this.createPoint(config.left, 'left');
    this.right = this.createPoint(config.right, 'right');
    this.genOnPoints(config);
  },
  
  createPoint : function(point, name){
    if(!(point instanceof World.Point)){
      point = this.world.add({
        type : 'point', 
        text : name,
        group : this,
        isGroupCrash : false,
        isApplyGForce : this.config.isApplyGForce,//oome in with config
        x : this.x + point.x, y : this.y + point.y, z : this.z + point.z,
      });
    }
    return point;
  },
  
  genOnPoints : function(config){
    this.sdTopRt = this.world.link({pre : this.top, post : this.right, 
      unitForce : config.unitForce, elasticity : config.elasticity, 
      distance : Utils.getDisXY(this.top, this.right), 
      maxEffDis : config.maxEffDis, 
      isDual: true});
    this.sdRtLf = this.world.link({pre : this.right, post : this.left, 
      unitForce : config.unitForce, elasticity : config.elasticity, 
      distance : Utils.getDisXY(this.right, this.left), 
      maxEffDis : config.maxEffDis, 
      isDual: true});
    this.sdLfTop = this.world.link({pre : this.left, post : this.top, 
      unitForce : config.unitForce, elasticity : config.elasticity, 
      distance : Utils.getDisXY(this.left, this.top), 
      maxEffDis : config.maxEffDis, 
      isDual: true});
  }
});

World.Circle = Utils.cls.extend(World.Point, {
  
  alias : 'World_Circle',
  
  radius : 10,
  /**
   * minimum is 3
   */
  edges : 3,
  
  //  World.Circle.prototype.constructor.call(World.Circle.prototype, config);
  init : function(config){
    this.text = 'center';
    this.callParent(config);
    //make default value to config
    Utils.apply(config, {unitForce : 0.5, elasticity : 0.5, maxEffDis : 2000}, true);
    Utils.apply(this, config);
    this.gen(config);
  },
  
  gen : function(config){
    var me = this;
    var edges = (this.edges > 2 ) ? this.edges : 3;
    var radiusStep = 2 * Math.PI / edges;
    var head = null;
    var prePoint = null;
    //distance to pre point, which is the same
    var dis2Pre = null;
    var radius = this.radius;
    for(var i = 0; i < edges ; i++){
      var angle = radiusStep * i;
      
      var px = radius * Math.cos(angle);
      var py = radius * Math.sin(angle);
      var pz = 0;
      var point = this.world.add({
        type : 'point', 
        group : me,
        isGroupCrash : false,
        isApplyGForce : this.config.isApplyGForce,//oome in with config
        x : me.x + px, y : me.y + py, z : me.z + pz,
      });
      this.points[point.iid] = point;
      head = !Utils.isEmpty(head) ? head : point;
      
      this.world.link({pre : me, post : point, 
        unitForce : config.unitForce, elasticity : config.elasticity, 
        distance : radius, 
        maxEffDis : config.maxEffDis, 
        isDual: !this.isAnchor});
      if(prePoint){
        dis2Pre = !Utils.isEmpty(dis2Pre) ? dis2Pre : Utils.getDisXY(prePoint, point);
        this.world.link({pre : prePoint, post : point, 
          unitForce : config.unitForce, elasticity : config.elasticity, 
          distance : dis2Pre, 
          maxEffDis : config.maxEffDis, 
          isDual: true});
      }
      prePoint = point;
    }
    this.world.link({pre : prePoint, post : head, 
      unitForce : config.unitForce, elasticity : config.elasticity, 
      distance : dis2Pre, 
      maxEffDis : config.maxEffDis, 
      isDual: true});
  }

});

World.Line = Utils.cls.extend(World.Point, {
  
  alias : 'World_Line',
  /**
   * Start Point
   */
  start : null,
  
  end :  null,
  
  /**
   * Line is bind to link, if link destroy, line should be destroy too
   * Whehter to build new link between start and end
   * usually in the polygen, this is set to false, because there are links between points in polygon
   */
  internalLink : null,
  
  init : function(config){
    this.callParent(config);
    this.isCrashable = false;
    this.isGroupCrash = false;
    this.visible = false;
    this.gen(config);
  },
  
  isCrashed : function(point){
    if(point.isCrashable && point.x > (this.start.x > this.end.x ? this.end.x : this.start.x) 
        && point.x <= (this.start.x > this.end.x ? this.start.x : this.end.x) 
        || this.start.x == this.end.x)
    {
      var angle = Utils.getAngle(this.start, this.end);
//    console.log(angle * 180 / Math.PI);
      var np = Utils.rotate(point, angle, this.start);
//      console.log('point ' + np.x + "-" + np.y);
      if(Math.abs(np.y) < (this.crashRadius + point.crashRadius)){
//        console.log('crashed');
        this.world.link({pre : this.start, post : point, 
          unitForce : 1, elasticity : 0.9, 
          distance : Utils.getDisXY(point, this.start), 
          maxEffDis : 3, 
          isDual: false});
        this.world.link({pre : this.end, post : point, 
          unitForce : 1, elasticity : 0.9, 
          distance : Utils.getDisXY(point, this.end), 
          maxEffDis : 3, 
          isDual: false});
        this.isCrashing = true;
        this.fireEvent('onCrashed', point, this);
      }else{
        this.isCrashing = false;
      }
    }
    
    return this.isCrashing;
  }, 

  gen : function(config){
    this.start = this.createPoint(config.start, 'start');
    this.start.on('onMove', this.updateCenterPt, this);
    this.end = this.createPoint(config.end, 'end');
    this.start.on('onMove', this.updateCenterPt, this);
    this.setLink();
    this.updateCenterPt();
  },
  
  setLink : function(){
    var dis = Utils.getDisXY(this.start, this.end);
    var config = this.config;
    this.internalLink = this.getLink();
    if(Utils.isEmpty(this.internalLink)){
      this.internalLink = this.world.link({pre : this.start, post : this.end, 
        unitForce : config.unitForce, elasticity : config.elasticity, 
        distance : dis,
        maxEffDis : config.maxEffDis, 
        isDual: true});
    }
    this.internalLink.on('onDestroy', this.destroy, this);
    return this.internalLink;
  },
  
  /**
   * check whether this.internalLink has assigned value by config
   * and check whether start has link to end
   */
  getLink : function(){
    var link = this.internalLink 
      ||this.start.getIw(this.end) || this.end.getIw(this.start);
    return link;
  },
  
  //once start or end point moved, we update the 
  updateCenterPt : function(){
    this.x = (this.start.x  + this.end.x) / 2;
    this.y = (this.start.y  + this.end.y) / 2;
    this.z = (this.start.z  + this.end.z) / 2; 
    this.isMoving = true;
    this.fireEvent('onMove', this);
  },
  
  crashHandler : function(point){
//    point.destroy();
  },
  
  createPoint : function(point, name){
    if(!(point instanceof World.Point)){
      point = this.world.add({
        type : 'point', 
        text : name,
        group : this,
        isGroupCrash : false,
        isCrashable : false,
        isApplyGForce : this.config.isApplyGForce,//oome in with config
        x : point.x, y : point.y, z : point.z,
      });
    }
    return point;
  },
  
  toJson : function(){
    return Utils.apply({
      start : this.start.toJson(),
      end : this.end.toJson()
    },
    this.callParent());
  }
});

World.Polygon = Utils.cls.extend(World.Point, {
  /**
   * keep location information of points
   */
  pointArray : null,
  
  /**
   * set 2 for 2d, set 3 for 3d
   */
  dimension : 2,
  
  init : function(config){
    this.callParent(config);
    this.visible = false;
    this.gen(config);
  },
  
  gen : function(config){
    if(!Utils.isEmpty(this.pointArray) && Utils.isArray(this.pointArray) && this.pointArray.length > 0){
      this.createPoints();
      this.createLinks();
      this.createBoundary();
    }
  },
  
  createBoundary : function(){
    var keys = Object.keys(this.points);
    var len = keys.length;
    var preP = null;
    var currentP = null;
    var headP = null;
    for(var ikeyArray = 0; ikeyArray < len; ikeyArray++){
      currentP = this.points[keys[ikeyArray]];
      if(preP){
        //IMPORTANT : create boundary
        this.line(preP, currentP);
      }else{
        headP = currentP;
      }
      preP = currentP;
    }
    this.line(preP, headP);
  },
  
  createLinks : function(){
    var keys = Object.keys(this.points);
    var len = keys.length;
    var preP = null;
    var currentP = null;
    for(var ikeyArray = 0; ikeyArray < len; ikeyArray++){
      currentP = this.points[keys[ikeyArray]];
      if(preP){
        this.link(preP, currentP);
        //trace back to the previouse points and link them
        var backLen = ikeyArray - this.dimension + 1;
        for(var isubKeyArray = 0; isubKeyArray < backLen; isubKeyArray++){
          var backTracP = this.points[keys[isubKeyArray]];
          this.link(currentP, backTracP);
        }
      }
      preP = currentP;
    }
  },
  
  /**
   * this create boundary by creating World.Line between two points
   */
  line :function(currentP, preP){
    this.world.add({
      type : 'line',
      start : preP,
      end : currentP,
      isApplyGForce : false,
      unitForce : 1, elasticity : 0.1, maxEffDis : 1
    });
  },
  
  link : function(currentP, backTracP){
    var dis = Utils.getDisXY(currentP, backTracP);
    return this.world.link({
      pre : currentP, post : backTracP, 
      unitForce : this.config.unitForce, 
      elasticity : this.config.elasticity, 
      distance : dis,
      maxEffDis : this.config.maxEffDis, 
      isDual: true});
  },
  
  createPoints : function(){
    var len = this.pointArray.length;
    for(var i = 0; i < len; i++){
      var currentP = this.createPoint(this.pointArray[i]);
      this.points[currentP.iid] = currentP;
    }
  },
  
  createPoint : function(point, name){
    if(!(point instanceof World.Point)){
      point = this.world.add({
        type : 'point', 
        text : name,
        group : this,
        isGroupCrash : false,
        isCrashable : this.isCrashable,
        isApplyGForce : this.isApplyGForce,//oome in with config
        x : point.x, y : point.y, z : point.z,
      });
    }
    return point;
  }
});

World.Force = Utils.cls.extend(Observable, {
  direction : null,
  /**
   * force value
   */
  value : 0,
  angle : 0,

  init : function(config){
    Utils.apply(this, config);
    this.calc();
  },
  
  setValue : function(value){
    this.value = value;
    this.calc();
    this.fireEvent('valueChange', value);
  },
  
  setDir : function(value){
    this.direction = value;
    this.calc();
    this.fireEvent('dirChange', value);
  },
  
  calc : function(){
    if(!Utils.isEmpty(this.value) && !Utils.isEmpty(this.direction)){
      this.angle = Utils.getAngle(OP, this.direction);
      this.fx = this.value * Math.cos(this.angle);
      this.fy = this.value * Math.sin(this.angle);
      this.fz = 0;
    }
  }
});

World.LinkType = {S : 'softLink', H : 'hardLink', B : 'bounceLink'};
/**
 * 
 * @param pre previous point
 * @param post post point
 * @returns {World.Link}
 */
World.Link = Utils.cls.extend(Observable, {
  iid : 0,
  world : null,
  /**
   * The points to follow when isDual set to false
   */
  pre : null,
  /**
   * Follower
   */
  post : null,
  distance : 10,
  
  /**
   * link will be broken when : realDistance - this.distance < minEffDis
   * minus number means that the link can be shrink to as far as 100 from point defined by this.distance
   */
  minEffDis : -100, 
  
  /**
   * link will be broken when : realDistance - this.distance > maxEffDis
   */
  maxEffDis : 100,

  isBreakable : true,
  isDual : true,
  
  unitForce : 2,
  //smaller harder
  elasticity : 0.9,
  
  type : World.LinkType.S,
  
  repeat : 0,
  
  repeatedCount : 0,
  
  fn : {x : Math.cos, y : Math.sin/*, z : Math.sin*/},
  
  init : function(config){
    Utils.apply(this, config);
  },
  
  calc : function() {
//    console.log('calc');
    var pre = this.pre;
    var post = this.post;
    if(Utils.isEmpty(pre) || Utils.isEmpty(post) || pre.destroyed || post.destroyed){
      this.destroy();
      return;
    }
    var linkType = this.type;
    var linkImpl = Utils.isFunction(this[linkType]) ? this[linkType] : {};
    if(this.checkBreakForce()){
      if(this.isBreakable){
        this.destroy();
      }
    }else{
      for(var key in this.fn){
        post['v' + key] = parseInt(post['v' + key] * this.world.resistance); 
      }
      for(var key in this.fn){
        pre['v' + key] = parseInt(pre['v' + key] * this.world.resistance); 
      }
      var postv = null;
      if(!post.isAnchor){
        postv = linkImpl.call(this, pre, post);
      }
      
      var prev = null;
      if(this.isDual && !pre.isAnchor){
        prev = linkImpl.call(this, post, pre);
      }
      Utils.apply(post, postv); 
      post.move();
      if(this.isDual){
        Utils.apply(pre, prev); 
        pre.move();
      }
    }
    if(this.repeat > 0 ){
      this.repeatedCount++;
      if(this.repeatedCount >= this.repeat){
        this.destroy();
      }
    }
  },
  
  checkBreakForce : function(){
    var realDisDiff = Utils.getDisXY(this.pre, this.post) - this.distance;
    var min = !Utils.isEmpty(this.minEffDis) ? realDisDiff < this.minEffDis : false;
    var max = !Utils.isEmpty(this.maxEffDis) ? realDisDiff > this.maxEffDis : false;
    
    return min|| max;
  },
  
  softLink : function(pre, post){
    var postv = {vx : post.vx, vy : post.vy, vz : post.vz}; // velocity of post
    var uf = this.unitForce ?  this.unitForce : 1;
    var w = post.weight ?  post.weight : 1;
    //TODO #3D# change required
    var angle = Utils.getAngle(post, pre);
    for (var key in this.fn){
      var axisDis = parseInt(this.distance * this.fn[key].call(this, angle));
      var dis = pre[key] - axisDis - post[key];
      postv['v' + key] = parseInt(
          post['v' + key] + 
          dis * uf/w * this.elasticity
          );
    }
    return postv;
  },
  
  bounceLink : function(pre, post){
    var postv = {vx : post.vx, vy : post.vy, vz : post.vz}; // velocity of post
    var uf = this.unitForce ?  this.unitForce : 1;
    var w = post.weight ?  post.weight : 1;
    //TODO #3D# change required
    var angle = Utils.getAngle(post, pre);
    for (var key in this.fn){
      var axisDis = parseInt(this.distance * this.fn[key].call(this, angle));
      postv['v' + key] = parseInt(
          post['v' + key]
          + ((pre[key] - axisDis - post[key])) * uf/w * this.elasticity
          );
    }
    return postv;
  },
  
  destroy : function(){
    //console.log('destroy ' + this.type + this.iid);
    if(this.pre){
      this.pre.rmIw(this.post);
      if(this.pre.goneWithLink){
        this.pre.destroy();
      }
    }
    if(this.post){
      this.post.rmIw(this.pre);
      if(this.post.goneWithLink){
        this.post.destroy();
      }
    }
    this.fireEvent('onDestroy', this);
  }
});

World.ForceLink = Utils.cls.extend(World.Link, {
  force : null,
  
  calc : function(){
    if(!Utils.isEmpty(this.force) && !Utils.isEmpty(this.post)){
      this.force.calc();
      this.pre = OP.add(this.post.x + this.force.fx, this.post.y + this.force.fy);
      this.callParent();
    }
  }
});
