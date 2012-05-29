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
  this.x = 0;
  this.y = 0;
  this.z = 0;
  this.links = {};
  this.points = {};
  this.objects = {};
  this.iid = new Iid();
  Utils.apply(this, config);
};

World.World.prototype = {
  add : function(config){
    var p = new World.Point(Utils.apply({world : this, iid : this.iid.get()}, config));
    this.points[p.iid] = p;
    return p;
  },
  
  tick : function(){
    World.LinkEngine.run(this.links);
  },
  
  link :  function(config){
    var link = new World.Link(Utils.apply({world : this, iid : this.iid.get()}, config));
    this.links[link.iid] = link;
    return link;
  }
};

World.Segment = function(config){
  this.points = {};
  this.x = 0;
  this.y = 0;
  this.z = 0;
  Utils.apply(this, config);
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
  this.neighbours = {};
  this.iid = 0;
  Utils.apply(this, config);
};

World.Point.prototype = {
   move : function(){
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
  this.elasticity = 0.7;
  this.type = 'softLink';
  Utils.apply(this, config);
};

World.Link.prototype = {
  TYPE : {S : 'softLink', H : 'hardLink'},
  
  fn : {x : Math.cos, y : Math.sin/*, z : Math.sin*/},
  
  calc : function() {
    var pre = this.pre;
    var post = this.post;
    var linkType = this.type;
    var linkImpl = isFunction(this[linkType]) ? this[linkType] : {};
    var angle = Utils.getAngle(post, pre);
    if(Utils.getDisXY(pre, post) < this.effDis){
      post = linkImpl.call(this, pre, post, angle);
      if(this.isDual !=true){
        pre = linkImpl.call(this, post, pre, angle);
      }
//      post.move();
//      pre.move();
    }
  },
  
  softLink : function(pre, post, angle){
    var postv = {}; // velocity of post
    var uf = this.unitForce ?  this.unitForce : 1;
    var w = post.weight ?  post.weight : 1;
    for (var key in this.fn){
      var axisDis = parseInt(this.distance * this.fn[key].call(this, angle));
      postv['v' + key] = parseInt(post['v' + key] + (pre[key] - axisDis - post[key]) * uf/w);
    }
    Utils.apply(post, postv); 
    post.move();
    for(var key in this.fn){
      postv['v' + key] =  postv['v' + key] * this.elasticity; // apply plasity
    }
    Utils.apply(post, postv);
    return post;
  },
  
  destroy : function(){
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