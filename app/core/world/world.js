/**
 * This class mainly work as data manipulation, 
 * to create a virtual world data, which is used 
 * for present visual world
 */
var World = {
  create : function(config){
    return Utils.cls.create(World.World, config);
  }
};

World.World = Utils.cls.extend(Observable, {
  iidor : new Iid(),
  x : 0,
  y : 0,
  z : 0,
  links : {},
  points : {},
  
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
  },
  
  detectCrash : function(currentP){
    var me = this;
    var keys = Object.keys(this.points);
    var len = keys.length;
    //private utils
    var detectFn = function(currentP, start){
      var pk = start;
      if(!isEmpty(currentP)){
        for(; pk < len; pk++){
          var testKey = keys[pk];
          var testP = me.points[testKey];
          if(!isEmpty(testP) && testP != currentP && currentP.isCrashable && testP.isCrashable){
            //cancel crash test if isGroupCrash is false
            if(currentP.group && testP.group 
                && (currentP.isSameGroup(testP))){
              if (!currentP.isGroupCrash || !testP.isGroupCrash){
                continue;
              }
            }
            if(currentP.crash(testP)){
              /*
               *create surface link, which is a part of crash, this link both push
               *points away and attach each other
               */
              me.surfaceLink(currentP, testP);
            }
          }
        }
      }
    };
    if(!isEmpty(currentP)){
      //TODO lazy crash detect don't know why, this is just not working
      detectFn(currentP, 0);
    }else{
      var pi = 0;//point index
      for(; pi < len; pi++){
        /*start point as pi, will not test the 
         * object with id ahead of pi
         */
        var pk = pi + 1;
        var key = keys[pi];
        var currentP = this.points[key];
        detectFn(currentP, pk);
      }
    }
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
      if(!isEmpty(this.gForce) && p.isApplyGForce){
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
    }
  },
  
  remove : function(obj){
    if(isEmpty(obj))return;
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
    this.detectCrash();
    this.run(this.links);
  },
  
  run : function(links){
    for(var key in links){
      var link = links[key];
      link.calc();
    }
  },
  
  link :  function(config){
    var link = Utils.cls.create(World.Link, Utils.apply({world : this, iid : this.iidor.get()}, config));
    link.on({'onDestroy' : {fn : this.remove, scope :this}});
    this.links[link.iid] = link;
    this.fireEvent('onAdd', {type : 'link', obj : link});
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
        unitForce : 1, elasticity : 0.8, 
        //TODO don't know how far is good , 10?
        distance : pre.crashRadius + post.crashRadius, 
        maxEffDis : 10/*see notes above*/, 
        repeat : 10/*see notes above*/};

    var preSfc = isEmpty(pre.surfaceLinkConfig) ? defaultSfc : pre.surfaceLinkConfig;
    var postSfc = isEmpty(post.surfaceLinkConfig) ? defaultSfc : post.surfaceLinkConfig;
    var mergeLink = {};
    for(var key in defaultSfc){
      mergeLink[key] = (preSfc[key] + postSfc[key])/2;
    }
    if(!pre.isCrashable && post.isCrashable){
      this.link(Utils.apply(mergeLink, {pre : pre, post : post, isDual: false}));
    }else if(pre.isCrashable && !post.isCrashable){
      this.link(Utils.apply(mergeLink, {pre : post, post : pre, isDual: false}));
    }else if(pre.isCrashable && post.isCrashable){
      this.link(Utils.apply(mergeLink, {pre : post, post : pre, isDual: true}));
    }
    
  }
});

World.Point = Utils.cls.extend(Observable, {
  x : 0,
  y : 0,
  z : 0,
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
  
  init : function(config){
    this.config = config;
    Utils.apply(this, config);
  },
  
  crash : function(point){
    if(Utils.getDisXY(this, point) < (this.crashRadius + point.crashRadius)){
      console.log('crashed');
      var pos = {vx : 0, vy : 0, vz : 0};

      if(!this.isCrashable && point.isCrashable){
        for(var key in pos){
          point[key] = parseInt(point[key] > 0 ? -point[key] : point[key]);
        }
      }else if(this.isCrashable && !point.isCrashable){
        for(var key in pos){
          this[key] = parseInt(this[key] > 0 ? -this[key] : this[key]);
        }
      }else if(this.isCrashable && point.isCrashable){
        for(var key in pos){
          pos[key] = Math.abs(this[key] + point[key]);
          this[key] = parseInt(this[key] > 0 ? -pos[key] : pos[key]);
          point[key] = parseInt(point[key] > 0 ? -pos[key] : pos[key]);
        }
      }
      this.isCrashing = true;
      this.fireEvent('onCrash', point, this);
    }else{
      this.isCrashing = false;
    }
    return this.isCrashing;
  },
  
  move : function(){
//    console.log('move to : x =' + this.x + '  y =' + this.y);
//    console.log('speed  : vx =' + this.vx + '  vy =' + this.vy);
    if(this.vx != 0 || this.vy !=0 || this.vz !=0){
      this.x += this.vx;
      this.y += this.vy;
      this.z += this.vz;
      this.isMoving = true;
      this.fireEvent('onMove', this);
    }else{
      this.isMoving = false;
      this.fireEvent('onStop', this);
    }
  },
  
  link2 : function(post, config){
    return this.world.link(Utils.apply({pre : this, post : post}, config));
  },
  
  /**
   * Check candidate point and its parent to see whether is the same group
   */
  isSameGroup : function(point){
    //search to the top of the inherent tree, if this is root, the group should be null
    if(!isEmpty(this.group)){
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
  }
});

World.Triangle = Utils.cls.extend(World.Point, {
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
  radius : 10,
  /**
   * minimum is 3
   */
  edges : 3,
  
  //  World.Circle.prototype.constructor.call(World.Circle.prototype, config);
  init : function(config){
    this.text = 'center';
    this.isCrashable = !this.isAnchor;
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
      head = !isEmpty(head) ? head : point;
      
      this.world.link({pre : me, post : point, 
        unitForce : config.unitForce, elasticity : config.elasticity, 
        distance : radius, 
        maxEffDis : config.maxEffDis, 
        minEffDis : 0,
        isDual: !this.isAnchor});
      if(prePoint){
        dis2Pre = !isEmpty(dis2Pre) ? dis2Pre : Utils.getDisXY(prePoint, point);
        this.world.link({pre : prePoint, post : point, 
          unitForce : config.unitForce, elasticity : config.elasticity, 
          distance : dis2Pre, 
          maxEffDis : config.maxEffDis, 
          minEffDis : 0,
          isDual: true});
      }
      prePoint = point;
    }
    this.world.link({pre : prePoint, post : head, 
      unitForce : config.unitForce, elasticity : config.elasticity, 
      distance : dis2Pre, 
      maxEffDis : config.maxEffDis, 
      minEffDis : 0,
      isDual: true});
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
    if(!isEmpty(this.value) && !isEmpty(this.direction)){
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
   */
  minEffDis : null, 
  
  /**
   * link will be broken when : realDistance - this.distance > maxEffDis
   */
  maxEffDis : null,

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
    if(isEmpty(pre) || isEmpty(post) || pre.destroyed || post.destroyed){
      this.destroy();
      return;
    }
    var linkType = this.type;
    var linkImpl = isFunction(this[linkType]) ? this[linkType] : {};
    if(this.checkBrakeForce()){
      if(this.isBreakable){
        this.destroy();
      }
    }else{
      var postv = linkImpl.call(this, pre, post);
      var prev = null;
      if(this.isDual){
        prev = linkImpl.call(this, post, pre);
      }
      Utils.apply(post, postv); 
      post.move();
      for(var key in this.fn){
        post['v' + key] = parseInt(post['v' + key] * this.world.resistance); 
      }
      if(this.isDual){
        Utils.apply(pre, prev); 
        pre.move();
        for(var key in this.fn){
          pre['v' + key] = parseInt(pre['v' + key] * this.world.resistance); 
        }
      }
    }
    if(this.repeat > 0 ){
      this.repeatedCount++;
      if(this.repeatedCount >= this.repeat){
        this.destroy();
      }
    }
  },
  
  checkBrakeForce : function(){
    var realDisDiff = Math.abs(Utils.getDisXY(this.pre, this.post) - this.distance);
    var min = !isEmpty(this.minEffDis) ? realDisDiff < this.minEffDis : false;
    var max = !isEmpty(this.maxEffDis) ? realDisDiff > this.maxEffDis : false;
    
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
      postv['v' + key] = parseInt(
          post['v' + key] + 
          (pre[key] - axisDis - post[key]) * uf/w * this.elasticity
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
    if(this.pre && this.pre.goneWithLink){
      this.pre.destroy();
    }
    if(this.post && this.post.goneWithLink){
      this.post.destroy();
    }
    this.fireEvent('onDestroy', this);
  }
});

World.ForceLink = Utils.cls.extend(World.Link, {
  force : null,
  
  calc : function(){
    if(!isEmpty(this.force) && !isEmpty(this.post)){
      this.force.calc();
      this.pre = OP.add(this.post.x + this.force.fx, this.post.y + this.force.fy);
      this.callParent();
    }
  }
});
