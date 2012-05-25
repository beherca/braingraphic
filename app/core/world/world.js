/**
 * This class mainly work as data manipulation, 
 * to create a virtual world data, which is used 
 * for present visual world
 */
var World = {
  create : function(config){
    return new World(Utils.apply({world:this}, config));
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
  },
  
  tick : function(){
    World.LinkEngine.run(this.links);
  },
  
  link :  function(pre, post, config){
    var link = new World.Link(Utils.apply({iid : this.iid.get()}, config));
    this.links[link.iid] = link;
  }
};

World.Point = function(config){
  this.x = 0;
  this.y = 0;
  this.z = 0;
  this.world;
  this.weight = 1;
  Utils.apply(this, config);
};

World.Point.prototype = {
   link : function(post, config){
     this.world.link(this, post, config);
   },
   
   destroy : function(){
     delete this.world.points[this.iid];
   }
};

World.Object = function(config){
  this.x, this.y, this.z, this.iid;
  Utils.apply(this, config);
};

World.Circle = function(config){
  this.radius = 10;
  this.edgePoints = 6;
//  World.Circle.prototype.constructor.call(World.Circle.prototype, config);
  Utils.apply(this, config);
};

World.Circle.prototype = new World.Object();
World.Circle.prototype.constructor = World.Circle;

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
  
  Utils.apply(this, config);
};

World.Link.prototype = {
  destroy : function(){
    delete this.world.links[this.iid];
  }  
};

World.LinkEngine = {
  run : function(links){
    for(var key in links){
      var link = links[key];
      var pre = link.pre;
      var post = link.post;
      var point = World.LinkEngine.calc(post, pre, link);
      Utils.apply(post, point);
      if(link.isDual){
        point = World.LinkEngine.calc(pre, post, link);
        Utils.apply(pre, point);
      }
    }
  },
  
  calc : function(pre, post, link){
    var point = {x : 0, y : 0, z : 0};
    var uf = link.unitForce ?  link.unitForce : 1;
    var w = post.weight ?  post.weight : 1;
    for (var key in point){
      point[key] = post[key] + (pre[key] - post[key])/(uf * w);
    }
    return point;
  }
};

