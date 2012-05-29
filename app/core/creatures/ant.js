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
  Utils.apply(this, config);
  this.init();
};

Creatures.Ant.prototype = new World.Object();
Creatures.Ant.prototype.constructor = World.Circle;
Creatures.Ant.prototype = {
  init : function(){
    this.brain = BrainBuilder.build(this.gene);// build cortex
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
  lf : function(){
    
  },
  
  /**
   * Action : left foot backward
   */
  lb : function(){
    
  },
  
  /**
   * Action : right foot Forwad
   */
  rf : function(){
    
  },
  
  /**
   * Action : right foot backward
   */
  rf : function(){
    
  }
};