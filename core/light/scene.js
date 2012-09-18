/*
 * Copyright(c) 2012 Kai Li
 * Scene
 */
FrameConfig = Utils.cls.extend(Observable, {
  /**
   * Total of frames within this scene
   */
  count : 10,
  /**
   * Repeat times to calculate during one frame
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

Scene  = Utils.cls.extend(Observable, {
  /**
   * frames of current Scene
   */
  frames : [],
  
  /**
   * Frame Configurations for current Scene
   */
  fc : null,
  
  /**
   * Space Definitions
   */
  sd : null
});


//module.exports.Scene = Scene;

