/**
 * This class mainly work as data manipulation, 
 * to create a virtual world data, which is used 
 * for present visual world
 */
var World = {
    create : function(config){
      return new World(config);
    }
};
World.World = function(rate){
  this.rate = rate;
  this.links = {};
  this.points = {};
  this.objects = {};
};

World.World.prototype = {
  add : function(config){
    var p = new World.Point(config);
    this.points[p.iid] = p;
  },
  
  tick : function(){
    World.LinkEngine.run(this.links);
  },
  
  link :  function(pre, post, config){
    var link = new World.Link(Utils.apply({pre : pre, post : post}, config));
    this.links[link.iid] = link;
  }
};

World.Point = function(config){
  this.x = 0;
  this.y = 0;
  this.z = 0;
  this.weight = 1;
  Utils.apply(this, config);
};

World.Object = function(config){
  this.x, this.y, this.z, this.iid;
  Utils.apply(this, config);
};

World.Circle = function(config){
  this.radius;
//  World.Circle.prototype.constructor.call(World.Circle.prototype, config);
  Utils.apply(this, config);
};

World.Circle.prototype = new World.Object();

/**
 * 
 * @param pre previous point
 * @param post post point
 * @returns {World.Link}
 */
World.Link = function(config){
  this.pre, 
  this.post, 
  this.distance,
  this.effDis, 
  this.iid, 
  this.unitForce,
  
  Utils.apply(this, config);
};

World.LinkEngine = {
  run : function(links){
    for(var key in links){
      var link = links[key];
      var pre = link.pre;
      var post = link.post;
      var point = World.LinkEngine.calc(pre, post, link);
      Utils.apply(pre, point);
      point = World.LinkEngine.calc(post, pre, link);
      Utils.apply(post, point);
    }
  },
  
  calc : function(pre, post, link){
    var point = {x : 0, y : 0, z : 0};
    var uf = link.unitForce ?  link.unitForce : 1;
    var w = pre.weight ?  pre.weight : 1;
    for (var key in point){
      point[key] = pre[key] + (post[key] - pre[key])/(uf * w);
    }
    return point;
  }
};

