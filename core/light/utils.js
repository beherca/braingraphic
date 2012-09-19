/**
 * Block Index Updater, update all particles within shadow
 */
BiUpdater = Utils.cls.extend(Observable, {
  /**
   * Move shadow particle to new block, and update block index
   * @param particle
   */
  update : function(particle){
    
  }
});

/**
 * Particle generator creates new particles and fill the specific space with new particles
 */
ParticlesGenerator = Utils.cls.extend(Observable, {
  /**
   * generate particles according to space definition
   * @param sd
   */
  gen : function(sd){
    var ps = [];
    //TODO
    return ps;
  }
});

/**
 * Dedicate to splitting scene, not block
 */
SceneSpliter = Utils.cls.extend(Observable, {
  div : function(sd){
    return sd;
  }
});
