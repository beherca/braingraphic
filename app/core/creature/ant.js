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

Creature.Life = World.Object.extend({
  world : null,
  //default center dot, represent body
  body : null,
  brain : null,
  energyCapacity : 10000,
  energy : this.energyCapacity,
  age : 0,
  init :function(config){
    Utils.apply(this, config);
    this.body = this.world.add({type: 'point', x : this.x, y : this.y, 
      crashable : true, crashRadius : 1
    });
  }
});

Creature.Ant = Creature.Life.extend({
    gene : '',
    ra : null,//right antenna
    la : null,
    mouth : null,
    /**
     * the force that pull the feet
     * this represent the desire of ant, how fast it run, how fast it turn to its food
     * and this is reduce when energy weak
     */
    strength  : 10,
    /**
     * regiester all input handlers
     */
    sensers : [],
    /**
     * regiester all output handlers
     */
    actions : [],
    sex : Creature.SEX.M,
    
    init : function(config){
      Utils.apply(this, config);
      if(!isEmpty(this.gene)){
        var bb = new BrainBuilder(this.gene);
        this.brain = bb.build();// build cortex
        this.createBody();
        this.sensers = [this.actLa, this.actRa, this.actLOlf, this.actROlf];
        this.actions = [this.lff, this.lfb, this.rff, this.rfb];
      }
//      this._super(config);
    },
    
    createBody : function(){
      var me = this;
      //right antenna
      this.ra = this.world.add({type: 'point', x : this.x + 20, y : this.y + 15, 
        crashable : true, onCrash : function(){me.actRa.call(me);},
        crashRadius : 1
        });
      //left antenna
      this.la = this.world.add({type: 'point', x : this.x + 20, y : this.y - 15, 
        crashable : true, onCrash : function(){me.actLa.call(me);},
        crashRadius : 1
        });
      this.mouth = this.world.add({type: 'point', x : this.x +10, y : this.y, 
        crashable : true, onCrash : function(other, self){me.eat.call(me, other);},
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
      this.world.link({
        pre : this.ra, 
        post : this.mouth, 
        elasticity : 0.9, 
        unitForce : 0.9, 
        distance : 20, 
        effDis : 2000, 
        isDual: false
      });
      this.world.link({
        pre : this.la, 
        post : this.mouth, 
        elasticity : 0.9, 
        unitForce : 0.9, 
        distance : 20, 
        effDis : 2000, 
        isDual: false
      });
//      this.world.link({
//        pre : this.mouth, 
//        post : this.body, 
//        elasticity : 0.9, 
//        unitForce : 0.9, 
//        distance : 10, 
//        effDis : 2000, 
//        isDual: false
//      });
    },
    
    /**
     * 
     * @param inputs 0 left antenna, 1 right antenna, 2-3 olfaction
     */
    set : function(inputs){
      console.log('set :' + inputs);
      this.brain.set.call(this.brain, inputs);
    },
    
    think : function(){
      this.brain.updateWatch.call(this.brain);
      this.energy += -1;
    },
    
    act : function(){
      var outputs = this.brain.get();
      console.log('act : ' + outputs);
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
      this.desire();
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
    
    /**
     * it is the desire of this little ant, the ambitions of this little creature
     */
    desire : function(){
      var dis = -1;
      var target = null;
      for(var key in this.world.objects){
        var o = this.world.objects[key];
        if(o instanceof Creature.Life){
          var ndis = Utils.getDisXY(this.ra, OP.add(o.x, o.y));
          if(dis < 0 || ndis < dis){
            dis = ndis;
            target = o;
          }
        }
      }
      if(!isEmpty(target)){
        this.smell(target);
      }
    },
    
    hunger : function(){
      
    },
    
    fear : function(){
//      this.strength 
    },
    
    /*-------------------Actions below-------------------------- */
    smell : function(life){
      var rDis = Utils.getDisXY(this.ra, OP.add(life.x, life.y));
      var lDis = Utils.getDisXY(this.la, OP.add(life.x, life.y));
      if(rDis > lDis){
        this.actROlf();
      }else{
        this.actLOlf();
      }
    },
    
    eat : function(other){
      if(!isEmpty(other) && other instanceof Creature.Life){
        this.energy += other.energy;
        other.destroy();
      }
    },
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
});