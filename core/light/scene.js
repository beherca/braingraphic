/*
 * Copyright(c) 2012 Kai Li
 * Scene
 */
Distributable  = Utils.cls.extend(Observable, {
  /**
   * Top is parent
   */
  t : null,
  
  /**
   * left node
   */
  l : null,
  
  /**
   * right node
   */
  r : null,
  
  shadows : [],
  
  /**
   * Self-split into two sub self
   * @returns
   */
  split : function(){
    //return two new self
    return null;
  },
  
  /**
   * combine the sub-self into parent self
   */
  combine : function(){
    
  },
  
  /**
   * Margin merge
   */
  merge : function(){
    
  },
  
  /**
   * transfrom back to DNA
   */
  transform : function(){
    
  },
  
  /**
   * the logic part of computation
   */
  compute : function(){
    
  }
  
});

FrameConfig = Utils.cls.extend(Observable, {
  /**
   * Total of frames within this scene
   */
  count : 10,
  /**
   * Repeat times of calculation during one frame
   */
  rate : 10,
  
  enableMotionBlur : false,
});

/**
 * Frame is actually a index that points to the real particle set
 */
Frame = Utils.cls.extend(Observable, {
  /**
   * Internal Id for this frame.
   */
  iid : null,
  
  /**
   * Node id
   */
  nid : null,
  
  /**
   * Status of current frame
   * NOT_START
   * WIP
   * FINISHED
   */
  status : 'NOT_START'
  
});

FrameManager = Utils.cls.extend(Observable, {
  gen : function(fc){
    
  }
});

//module.exports.Frame = Frame;

/**
 * Space Definition is the specification to generate the scene
 */
SpaceDef = Utils.cls.extend(Observable, {
  width : 100,
  height : 100,
  depth : 100,
  data : []
});

//module.exports.SpaceDef = SpaceDef;

Scene  = Utils.cls.extend(Distributable, {
  /**
   * frames of current Scene
   */
  frames : [],
  
  /**
   * Frame Configurations for current Scene
   */
  fc : null,
  
  /**
   * Frames  manager
   */
  fm : null,
  /**
   * Space Definitions
   */
  sd : null,
  
  /**
   * config = {sd : sd, fc : fc}
   * @param config
   */
  init : function(config){
    this.config = config;
    this.fm = Utils.cls.create(FrameManager);
    this.start();
  },
  
  start : function(){
    this.generateFrames();
  },
  
  generateFrames : function(){
    this.frames = this.fm.gen(this.fc);
  },
  
  updateFrame : function(frame){
    this.fm.update(frame);
  }

});


//module.exports.Scene = Scene;

