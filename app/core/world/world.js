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
  objects : {},
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
  
  detectCrash : function(){
    var keys = Object.keys(this.points);
    var pi = 0;//point index
    var len = keys.length;
    for(; pi < len; pi++){
      /*start point as pi, will not test the 
       * object with id ahead of pi
       */
      var pk = pi + 1;
      var key = keys[pi];
      var currentP = this.points[key];
      if(!isEmpty(currentP)){
        for(; pk < len; pk++){
          var testKey = keys[pk];
          var testP = this.points[testKey];
          if(!isEmpty(testP) && currentP.crashable && testP.crashable){
            //cancel crash test if isGroupCrash is false
            if(currentP.group && testP.group 
                && (currentP.group == testP.group)){
              if (!currentP.isGroupCrash || !testP.isGroupCrash){
                continue;
              }
            }
            if(currentP.crash(testP)){
              this.link({pre : currentP, post : testP, 
                unitForce : 0.9, elasticity : 0.8, 
                //TODO don't know how far is good , 10?
                distance : currentP.crashRadius + testP.crashRadius, 
                maxEffDis : currentP.crashRadius + testP.crashRadius + 2/*see notes below*/, 
                isDual: true, repeat : 10/*see notes below*/}); 
                // NOTES :  about the number 2 and 10, they are experiment value, 
                //which help to stablize the crash objects 
            }
          }
        }
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
      this.points[p.iid] = p;
      if(!isEmpty(this.gForce) && p.isApplyGForce){
        this.gLink(p);
      }
      this.fireEvent('onAdd', {type : config.type, obj :p});
      return p;
    }else if(config.type == 'ant'){
      var ant = Utils.cls.create(Creature.Ant, Utils.apply({world : this, iid : this.iidor.get()}, config));
      ant.on({'onDestroy' : {fn : me.remove, scope : me}});
      this.objects[ant.iid] = ant;
      this.fireEvent('onAdd', {type : config.type, obj :ant});
      return ant;
    }else if(config.type == 'life'){
      var life = Utils.cls.create(Creature.Life, Utils.apply({world : this, iid : this.iidor.get()}, config));
      life.on({'onDestroy' : {fn : me.remove, scope : me}});
      this.objects[life.iid] = life;
      this.fireEvent('onAdd', {type : config.type, obj : life});
      return life;
    }else if(config.type == 'triangle'){
      var tri = Utils.cls.create(World.Triangle, Utils.apply({world : this, iid : this.iidor.get()}, config));
      tri.on({'onDestroy' : {fn : me.remove, scope : me}});
      this.objects[tri.iid] = tri;
      this.fireEvent('onAdd', {type : config.type, obj : tri});
      return tri;
    }else if(config.type == 'circle'){
      var circle = Utils.cls.create(World.Circle, Utils.apply({world : this, iid : this.iidor.get()}, config));
      circle.on({'onDestroy' : {fn : me.remove, scope : me}});
      this.objects[circle.iid] = circle;
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
    }else if(obj instanceof World.Object){
      delete this.objects[obj.iid];
      this.fireEvent('onRemove', 'object', obj.iid);
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
   * which group is this point belongs to, 
   * usually the object
   */
  group : null,
  
  weight : 1,
  
  /**
   * Whether crashable with other points in the same group
   */
  isGroupCrash : false,
  
  crashable : true,
  /**
   * Define the circle crash-detect area with radius
   */
  crashRadius : 10,
  
  /**
   * for internal use, to check whether is in crashing
   */
  crashing : false,
  
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
      var vx = Math.abs(this.vx + point.vx);
      var vy = Math.abs(this.vy + point.vy);
      this.vx = parseInt(this.vx > 0 ? -vx : vx);
      this.vy = parseInt(this.vy > 0 ? -vy : vy);
      point.vx = parseInt(point.vx > 0 ? -vx : vx);
      point.vy = parseInt(point.vx > 0 ? -vx : vx);
      this.crashing = true;
      this.fireEvent('onCrash', point, this);
    }else{
      this.crashing = false;
    }
    return this.crashing;
  },
  
  move : function(){
//    console.log('move to : x =' + this.x + '  y =' + this.y);
    this.x += this.vx;
    this.y += this.vy;
    this.z += this.vz;
    this.fireEvent('onMove', this);
  },
  
  link2 : function(post, config){
    return this.world.link(Utils.apply({pre : this, post : post}, config));
  },
  
  destroy : function(){
    //for link to use, usually, the link with current point will not be update immediately 
    //after this point has been removed
    this.destroyed = true;
    this.fireEvent('onDestroy', this);
  }
});

/**
 * Actually is a set of points, or a group of points
 */
World.Object = Utils.cls.extend(Observable, {
  x: 0,
  y: 0,
  z: 0,
  vx : 0,
  vy : 0,
  vz : 0,
  iid: 0,
  config : {},
  
  init : function(config){
    this.config = config;
    Utils.apply(this, config);
  },
  
  destroy : function(){
    //for link to use, usually, the link with current point will not be update immediately 
    //after this point has been removed
    this.destroyed = true;
    this.fireEvent('onDestroy', this);
  }
});

World.Triangle = Utils.cls.extend(World.Object, {
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

World.Circle = Utils.cls.extend(World.Object, {
  radius : 10,
  /**
   * minimum is 3
   */
  edges : 3,
  
  points : [],
  
  //  World.Circle.prototype.constructor.call(World.Circle.prototype, config);
  init : function(config){
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
    var center = this.world.add({
      type : 'point', 
      group : me,
      name : 'center',
      isApplyGForce : this.config.isApplyGForce,//oome in with config
      x : me.x, y : me.y, z : me.z,
    });
    this.points.push(center);
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
      this.points.push(point);
      this.world.link({pre : center, post : point, 
        unitForce : config.unitForce, elasticity : config.elasticity, 
        distance : radius, 
        maxEffDis : config.maxEffDis, 
        minEffDis : 0,
        isDual: true});
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
    this.world.link({pre : prePoint, post : this.points[1], 
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
    var postv = {}; // velocity of post
    var uf = this.unitForce ?  this.unitForce : 1;
    var w = post.weight ?  post.weight : 1;
    var angle = Utils.getAngle(post, pre);

    for (var key in this.fn){
      var axisDis = parseInt(this.distance * this.fn[key].call(this, angle));
      
      postv['v' + key] = parseInt(
          post['v' + key] + 
          (pre[key] - axisDis - post[key]) * uf/w * this.elasticity
          );
    }
//    console.log('softLink work done');
    return postv;
  },
  
  bounceLink : function(pre, post){
    var postv = {}; // velocity of post
    var uf = this.unitForce ?  this.unitForce : 1;
    var w = post.weight ?  post.weight : 1;
    var angle = Utils.getAngle(post, pre);
    for (var key in this.fn){
      var axisDis = parseInt(this.distance * this.fn[key].call(this, angle));
      postv['v' + key] = parseInt(-post['v' + key] + (post['v' + key] > 0 ? 1 : -1) * (pre[key] - axisDis - post[key]) * uf/w);
//      console.log('v' + key + postv['v' + key]);
    }
    Utils.apply(post, postv); 
    post.move();
    for(var key in this.fn){
      post['v' + key] = parseInt(post['v' + key]* 0.0001); // apply plasity
    }
    return post;
  },
  
  destroy : function(){
//    console.log('destroy ' + this.type + this.iid);
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
