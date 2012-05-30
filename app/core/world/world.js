/**
 * This class mainly work as data manipulation, 
 * to create a virtual world data, which is used 
 * for present visual world
 */
var World = {
  create : function(config){
    return new World.World(Utils.apply({world:this}, config));
  }
};

World.World = function(config){
  this.iidor = new Iid();
  this.x = 0;
  this.y = 0;
  this.z = 0;
  this.links = {};
  this.points = {};
  this.objects = {};
  this.resistance = 0.9; //resistant force
  //below is for the crash detector
  this.subW = {}; 
  this.minSu;bWSize = 20;
  this.worldCapacity = 4;
  Utils.apply(this, config);
};

World.World.prototype = {
  
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
      for(; pk < len; pk++){
        var testKey = keys[pk];
        var testP = this.points[testKey];
        if(!isEmpty(testP) && currentP.crashable && testP.crashable){
          if(currentP.crash(testP)){
            this.link({pre : currentP, post : testP, unitForce : 0.1, elasticity : 0.5, distance : currentP.crashRadius + testP.crashRadius, effDis : currentP.crashRadius + testP.crashRadius + 20, isDual: true});
          }
        }
      }
    }
  },
  
  //TODO this create sub new world to check crash
  newChild : function(){
    
  },
  
  add : function(config){
    var p = new World.Point(Utils.apply({world : this, iid : this.iidor.get()}, config));
    this.points[p.iid] = p;
    return p;
  },
  
  tick : function(){
    this.detectCrash();
    World.LinkEngine.run(this.links);
  },
  
  link :  function(config){
    var link = new World.Link(Utils.apply({world : this, iid : this.iidor.get()}, config));
    this.links[link.iid] = link;
    return link;
  }
};

World.Point = function(config){
  this.x = 0;
  this.y = 0;
  this.z = 0;
  this.vx = 0;
  this.vy = 0;
  this.vz = 0;
  this.world = null;
  this.weight = 1;
  this.crashable = true;
  /*
   * Define the circle crash-detect area with radius
   */
  this.crashRadius = 30;
  this.crashing = false;
  this.neighbours = {};
  this.iid = 0;
  Utils.apply(this, config);
};

World.Point.prototype = {
    
   crash : function(point){
     if(Utils.getDisXY(this, point) < (this.crashRadius + point.crashRadius)){
//       console.log('crashed');
       //if crash, reset the position of points
//       console.log(this.vx);
//       this.x += -parseInt(this.vx);
//       this.y += -parseInt(this.vy);
//       console.log(this.vx);
//       this.move();
//       //if crash, reset the position of points
//       point.x += -parseInt(point.vx);
//       point.y += -parseInt(point.vy);
//       point.move();
       var vx = Math.abs(this.vx + point.vx);
       console.log('crashed ' +vx);
       var vy = Math.abs(this.vy + point.vy);
       this.vx = parseInt(this.vx > 0 ? -vx : vx);
       this.vy = parseInt(this.vy > 0 ? -vy : vy);
       point.vx = parseInt(point.vx > 0 ? -vx : vx);
       point.vy = parseInt(point.vx > 0 ? -vx : vx);
       this.crashing = true;
     }else{
       this.crashing = false;
     }
     return this.crashing;
   },
   
   move : function(){
//     console.log('move to : x =' + this.x + '  y =' + this.y);
       this.x += this.vx;
       this.y += this.vy;
       this.z += this.vz;
   },
   
   link2 : function(post, config){
     return this.world.link(Utils.apply({pre : this, post : post}, config));
   },
   
   destroy : function(){
     delete this.world.points[this.iid];
   }
};

/**
 * Actually is a set of points
 */
World.Object = function(config){
  this.x = 0;
  this.y = 0;
  this.z = 0;
  this.iid = 0;
  Utils.apply(this, config);
};


World.Circle = function(config){
  this.radius = 10;
  this.edgePoints = 6;
//  World.Circle.prototype.constructor.call(World.Circle.prototype, config);
  Utils.apply(this, config);
  this.init();
};

World.Circle.prototype = new World.Object();
World.Circle.prototype.constructor = World.Circle;
World.Circle.prototype = {
  init : function(){
    
  }
};

World.LinkType = {S : 'softLink', H : 'hardLink', B : 'bounceLink'};
/**
 * 
 * @param pre previous point
 * @param post post point
 * @returns {World.Link}
 */
World.Link = function(config){
  this.pre = null;
  this.post = null;
  this.distance = 10;
  this.effDis = 200;
  this.iid = 0;
  this.unitForce = 2;
  this.isDual = true;
  this.world = null;
  //smaller harder
  this.elasticity = 0.9;
  this.type = World.LinkType.S;
  Utils.apply(this, config);
};

World.Link.prototype = {
  fn : {x : Math.cos, y : Math.sin/*, z : Math.sin*/},
  
  calc : function() {
    var pre = this.pre;
    var post = this.post;
    var linkType = this.type;
    var linkImpl = isFunction(this[linkType]) ? this[linkType] : {};
    if(Utils.getDisXY(pre, post) < this.effDis){
      post = linkImpl.call(this, pre, post);
      if(this.isDual){
        pre = linkImpl.call(this, post, pre);
      }
    }else{
      this.destroy();
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
    Utils.apply(post, postv); 
    post.move();
    for(var key in this.fn){
      post['v' + key] = parseInt(post['v' + key] * this.world.resistance); 
    }
//    console.log('softLink work done');
    return post;
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
    delete this.world.links[this.iid];
  }
};

World.LinkEngine = {
  run : function(links){
    for(var key in links){
      var link = links[key];
      link.calc();
    }
  }
};