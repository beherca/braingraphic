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
            if(currentP.crash(testP)){
              this.link({pre : currentP, post : testP, 
                unitForce : 0.1, elasticity : 0.5, 
                distance : currentP.crashRadius + testP.crashRadius, 
                effDis : currentP.crashRadius + testP.crashRadius + 20, 
                isDual: true, repeat : 1});
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
    this.bWSize++;
    var me = this;
    if(config.type == 'point'){
      var p = Utils.cls.create(World.Point, Utils.apply({world : this, iid : this.iidor.get()}, config));
      p.on({'onDestroy' : {fn : me.remove, scope : me}});
      this.points[p.iid] = p;
      this.fireEvent('onAdd', config.type, p);
      return p;
    }else if(config.type == 'ant'){
      var ant = Utils.cls.create(Creature.Ant, Utils.apply({world : this, iid : this.iidor.get()}, config));
      ant.on({'onDestroy' : {fn : me.remove, scope : me}});
      this.objects[ant.iid] = ant;
      this.fireEvent('onAdd', config.type, ant);
      return ant;
    }else if(config.type == 'life'){
      var life = Utils.cls.create(Creature.Life, Utils.apply({world : this, iid : this.iidor.get()}, config));
      life.on({'onDestroy' : {fn : me.remove, scope : me}});
      this.objects[life.iid] = life;
      this.fireEvent('onAdd', config.type, life);
      return life;
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
  world : null,
  /**
   * which group is this point belongs to, 
   * usually the object
   */
  group : null,
  
  weight : 1,
  crashable : true,
  /**
   * Define the circle crash-detect area with radius
   */
  crashRadius : 30,
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
  
  init : function(config){
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
 * Actually is a set of points
 */
World.Object = Utils.cls.extend(Observable, {
  x: 0,
  y: 0,
  z: 0,
  iid: 0,
  init : function(config){
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
  right : null
});

World.Circle = Utils.cls.extend(World.Object, {
  radius : 10,
  /**
   * multiple of 3
   */
  edge : 1,
  //  World.Circle.prototype.constructor.call(World.Circle.prototype, config);
  init : function(config){
    
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
  pre : null,
  post : null,
  distance : 10,
  effDis : 200,
  iid : 0,
  unitForce : 2,
  isDual : true,
  world : null,
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
    if(Utils.getDisXY(pre, post) < this.effDis){
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
    }else{
      this.destroy();
    }
    if(this.repeat > 0 ){
      this.repeatedCount++;
      if(this.repeatedCount >= this.repeat){
        this.destroy();
      }
    }
  },
  
  softLink : function(pre, post){
    var postv = {}; // velocity of post
    var uf = this.unitForce ?  this.unitForce : 1;
    var w = post.weight ?  post.weight : 1;
    var angle = Utils.getAngle(post, pre);
    for (var key in this.fn){
      var axisDis = parseInt(this.distance * this.fn[key].call(this, angle));
      postv['v' + key] = parseInt(post['v' + key] + (pre[key] - axisDis - post[key]) * uf/w * this.elasticity);
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