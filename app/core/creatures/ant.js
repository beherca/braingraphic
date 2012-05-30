/**
 * This class mainly work as data manipulation, 
 * to create a virtual world data, which is used 
 * for present visual world
 */
var Creatures = {
    
};
Creatures.Ant = function(config){
  this.brain = null;
  this.gene = '';
  this.body = [];
  this.ra = null;//right antenna
  this.la = null;
  this.world = null;
  //the forca that pull the feet
  this.strength  = 10;
  Utils.apply(this, config);
  this.init();
};

Creatures.Ant.prototype = new World.Object();
Creatures.Ant.prototype.constructor = World.Ant;

Creatures.Ant.prototype = {
  init : function(){
    this.createBody();
    if(!isEmpty(this.gene)){
      this.brain = BrainBuilder.build(this.gene);// build cortex
    }
  },
  
  createBody : function(){
    //right antenna
    this.ra = this.world.add({type: 'point', x : this.x, y : this.y - 10, crashable : true});
    //left antenna
    this.la = this.world.add({type: 'point', x : this.x, y : this.y + 10, crashable : true});
    this.world.link({
      pre : this.ra, 
      post : this.la, 
      elasticity : 0.9, 
      unitForce : 0.9, 
      distance : 20, 
      effDis : 2000, 
      isDual: true
    });
  },
  
  set : function(inputs){
    this.brain.set(inputs);
  },
  
  get : function(){
    return this.brain.get();
  },
  
  /*-------------------Sensors below-------------------------- */
  smell : function(inputs){
    
  },
  
  touch : function(inputs){
    
  },
  
  hurger : function(inputs){
    
  },
  
  /*-------------------Actions below-------------------------- */
  /**
   * Action : left foot Forwad
   */
  lff : function(){
    var crawlP = this.getCrawlPoint(-Math.PI/2); //left forward point
    this.crawl(crawlP, this.la);
  },
  
  /**
   * Action : left foot backward
   */
  lfb : function(){
    var crawlP = this.getCrawlPoint(this.la, Math.PI/2); //left forward point
    this.crawl(crawlP, this.la);
  },
  
  /**
   * Action : right foot Forwad
   */
  rff : function(){
    var crawlP = this.getCrawlPoint(this.ra, -Math.PI/2); //left forward point
    this.crawl(crawlP, this.ra);
  },
  
  /**
   * Action : right foot backward
   */
  rfb : function(){
    var crawlP = this.getCrawlPoint(this.ra, Math.PI/2); //left forward point
    this.crawl(crawlP, this.ra);
  },
  
  getCrawlPoint : function(startP, offset){
    var angle =  Utils.getAngle(this.ra, this.la, offset);
    var px = startP.x + this.strength * Math.cos(angle);
    var py = startP.y + this.strength * Math.sin(angle);
    var point = world.add({type: 'point', x : px.x, y : py.y, crashable : false});
    return point;
  },
  
  crawl : function(pre, post){
    this.world.link({
      pre : pre, 
      post : post, 
      elasticity : 0.9, 
      unitForce : 0.9, 
      distance : 0, 
      effDis : 2000, 
      isDual: false 
    });
  }
  
};