/**
 * This class mainly work as data manipulation, 
 * to create a virtual world data, which is used 
 * for present visual world
 */
var Creature = {
    SEX : {
      M : 'male',
      F : 'female'
    }
};

Creature.Ant = function(config){
  this.iid = 0;
  this.brain = null;
  this.gene = '';
  this.body = [];
  this.ra = null;//right antenna
  this.la = null;
  this.world = null;
  /**
   * the force that pull the feet
   * this represent the desire of ant, how fast it run, how fast it turn to its food
   * and this is reduce when energy weak
   */
  this.strength  = 10;
  /**
   * regiester all input handlers
   */
  this.sensers = [];
  /**
   * regiester all output handlers
   */
  this.actions = [];
  this.age = 0;
  this.energyCapacity = 10000;
  this.energy = this.energyCapacity;
  this.sex = Creature.SEX.M;
  Utils.apply(this, config);
  this.init();
};

Creature.Ant.prototype = new World.Object();
Creature.Ant.prototype.constructor = World.Ant;

Creature.Ant.prototype = {
  init : function(){
    if(!isEmpty(this.gene)){
      var bb = new BrainBuilder(this.gene);
      this.brain = bb.build();// build cortex
      this.createBody();
      this.sensers = [this.actLa, this.actRa, this.actLOlf, this.actROlf];
      this.actions = [this.lff, this.lbf, this.rff, this.rbf];
    }
  },
  
  createBody : function(){
    var me = this;
    //right antenna
    this.ra = this.world.add({type: 'point', x : this.x, y : this.y + 10, 
      crashable : true, onCrash : function(){me.actRa.call(me);},
      crashRadius : 1
      });
    //left antenna
    this.la = this.world.add({type: 'point', x : this.x, y : this.y - 10, 
      crashable : true, onCrash : function(){me.actLa.call(me);},
      crashRadius : 1
      });
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
  
  /**
   * 
   * @param inputs 0 left antenna, 1 right antenna, 2-3 olfaction
   */
  set : function(inputs){
    this.brain.set.call(this.brain, inputs);
  },
  
  think : function(){
    this.brain.updateWatch.call(this.brain);
    this.energy += -1;
  },
  
  act : function(){
    var outputs = this.brain.get();
    for(var i in outputs){
      var o = outputs[i];//return 0 or 1
      if(!!o){//1
        var a = this.actions[i];
        if(a){
          a.call(this);
        }
      }
    }
  },
  
  tick : function(){
    this.think();
    this.act();
    if(this.energy < 0){
      this.die();
    }
  },
  
  /*-------------------Sensors below-------------------------- */
  /*
   * Activate left Antenna
   */
  actLa : function(){
    this.set([2, 0, 0, 0]);
  },
  
  actRa : function(){
    this.set([0, 2, 0, 0]);
  },
  
  actLOlf : function(inputs){
    this.set([0, 0, 2, 0]);
  },
  
  actROlf : function(inputs){
    this.set([0, 0, 0, 2]);
  },
  
  hurger : function(inputs){
    
  },
  
  fear : function(){
//    this.strength 
  },
  
  /*-------------------Actions below-------------------------- */
  /**
   * Action : left foot Forwad
   */
  lff : function(){
    var crawlP = this.getCrawlPoint(this.la, Math.PI/2); //left forward point
    this.crawl(crawlP, this.la);
  },
  
  /**
   * Action : left foot backward
   */
  lfb : function(){
    var crawlP = this.getCrawlPoint(this.la, -Math.PI/2); //left forward point
    this.crawl(crawlP, this.la);
  },
  
  /**
   * Action : right foot Forwad
   */
  rff : function(){
    var crawlP = this.getCrawlPoint(this.ra, Math.PI/2); //left forward point
    this.crawl(crawlP, this.ra);
  },
  
  /**
   * Action : right foot backward
   */
  rfb : function(){
    var crawlP = this.getCrawlPoint(this.ra, -Math.PI/2); //left forward point
    this.crawl(crawlP, this.ra);
  },
  
  getCrawlPoint : function(startP, offset){
    var angle =  Utils.getAngle(this.ra, this.la, offset);
    var px = startP.x + this.strength * Math.cos(angle);
    var py = startP.y + this.strength * Math.sin(angle);
    var point = this.world.add({type: 'point', x : px, y : py, 
      crashable : false, goneWithLink : true});
    return point;
  },
  
  crawl : function(pre, post){
    /*
     * every move require energy
     */
    this.energy += -1;
    this.world.link({
      pre : pre, 
      post : post, 
      elasticity : 0.9, 
      unitForce : 0.9, 
      distance : 0, 
      effDis : 2000, 
      isDual: false,
      repeat : 1
    });
  },
  
  die : function(){
    delete this.world.objects[this.iid];
  }
  
};