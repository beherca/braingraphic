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
  // smaller, swamper
  this.resistance = 0.1; //resistant force
  //below is for the crash detector
  this.subW = {}; 
  this.minSu;
  this.bWSize = 20;
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
                isDual: true});
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
    if(config.type == 'point'){
      var p = new World.Point(Utils.apply({world : this, iid : this.iidor.get()}, config));
      this.points[p.iid] = p;
      return p;
    }else if(config.type == 'ant'){
      var ant = new Creature.Ant(Utils.apply({world : this, iid : this.iidor.get()}, config));
      this.objects[ant.iid] = ant;
      return ant;
    }else if(config.type == 'life'){
      var life = new Creature.Life(Utils.apply({world : this, iid : this.iidor.get()}, config));
      this.objects[life.iid] = life;
      return life;
    }
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

World.Point = Class.extend(Observable.apply({
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
   * Callback function when crashed, return crashed point ant itself
   */
  onCrash : null,
  /**
   * Callback function when point moved 
   */
  onMoved : null,
  onDestroyed : null,
  
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
      if(!isEmpty(this.onCrash)){
        this.onCrash(point, this);
      }
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
      if(!isEmpty(this.onMoved)){
        this.onMoved(this);
        this.fireEvent('onMoved', this);
      }
  },
  
  link2 : function(post, config){
    return this.world.link(Utils.apply({pre : this, post : post}, config));
  },
  
  destroy : function(){
    if(this.onDestroyed){
      this.onDestroyed.call(this);
    }
    delete this.world.points[this.iid];
    this.destroyed = true;
  }
}));

/**
 * Actually is a set of points
 */
World.Object = Class.extend({
  x: 0,
  y: 0,
  z: 0,
  iid: 0,
  init : function(config){
    Utils.apply(this, config);
  }
});

World.Circle = World.Object.extend({
  radius : 10,
  edgePoints : 6,
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
  this.repeat = 0;
  this.repeatedCount = 0;
  Utils.apply(this, config);
};

World.Link.prototype = {
  fn : {x : Math.cos, y : Math.sin/*, z : Math.sin*/},
  
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
    delete this.world.links[this.iid];
    if(this.onDestroyed){
      this.onDestroyed.call(this);
    }
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