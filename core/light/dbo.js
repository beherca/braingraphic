/*
 * Copyright(c) 2012 Kai Li
 * Dbo
 */
/**
 * BlockIndex is an index for all blocks in one frame, which is a B-tree
 */
BlockIndex = Utils.cls.extend(Observable, {
  /**
   * which axis to divide
   */
  dividedBy : 'x',
  
  /**
   * Left tree
   */
  l : null,
  
  /**
   * Right tree
   */
  r : null
});

/**
 * Block that contains particles
 */
Block = Utils.cls.extend(Observable, {
  /**
   * start points
   */
  x : 0,
  y : 0,
  z : 0,
  
  /**
   * End points
   */
  ex : 0,
  ey : 0,
  ez : 0,
  
  /**
   * Children contains other blocks
   */
  children : [],
  
  /**
   * particles in current block, only block on leaf has ps.length > 0
   */
  ps : [],
  
  /**
   * the particles that exit current block
   */
  shadows : [],
  
  init : function(config){
    
  },
  
  /**
   * Split current block into next level sub-blocks
   */
  split : function(){
    
  },
  
  /**
   * To check whether the particle is in this block 
   * @param particle
   */
  has : function(particle){
    
  },
  
  /**
   * To search the particles in current block
   * @param particle
   */
  search : function(particle){
    
  }, 
  
  /**
   * To add particle to current block
   * @param particle
   */
  add : function(particle){
    
  },
  
  /**
   * To remove particle from current block
   * @param particle
   */
  remove : function(particle){
    
  }
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