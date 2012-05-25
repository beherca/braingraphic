/**
 * This class mainly work as data manipulation, 
 * to create a virtual world data, which is used 
 * for present visual world
 */
var World = {};
World.Point = function(x, y, z, iid){
  this.x = x;
  this.y = y;
  this.z = z;
};

World.Object = function(x, y, z, iid){
  this.x = x;
  this.y = y;
  this.z = z;
  this.iid = iid;
};

World.Circle = function(x, y, z, radius, iid){
  this.radius = radius;
  World.Circle.prototype.constructor.call(World.Circle.prototype, x, y, z, iid);
};

World.Circle.prototype = new World.Object();

/**
 * 
 * @param pre previous point
 * @param post post point
 * @returns {World.Link}
 */
World.Link = function(pre, post, distance, effDis, iid){
  this.pre = pre;
  this.post = post;
  this.distance = distance;
  this.effDis = effDis;
  this.iid = iid;
};

World.Builder = function(){
  
};

World.Engine = function(){
  
};

