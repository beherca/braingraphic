ndcp.PackageManager = Utils.cls.extend(Observable, {
  
  watchedPacks : [],
  
  add : function(pack){
    var me = this;
    watchedPacks.push(pack);
    pack.on('finished', me.update, me);
    this.fireEvent('added', pack);
  },
  
  udpate : function(pack){
    //TODO remote pack from watched package list
  },
  
  manage : function(packs){
    var me = this;
    packs.forEach(function(p){
      me.add(p);
    });
  }
});

/**
 * Monitor peers' communication on frame level,
 * this is a interface to communicate with NDCP (Node Distributed compute platform) to 
 */
ndcp.PeersManager = Utils.cls.extend(Observable, {
  
  peers : [],
  
  first : function(){
    
  },
  
  getPeers : function(){
    
  }
});

ndcp.Peer = Utils.cls.extend(Observable, {
  
  pre : null,
  
  post : null,
  
  /**
   * connect to the real process or node
   */
  connect : function(){
    
  },
  
  work : function(pack){
    var me = this;
    var scene = pack.input;
    scene.fill();
    scene.initBlockIndex();
    scene.roll();
//    scene.udpateBlock();
//    scene.mergeShadow(me.merge, {
//      finished : function(){
//        
//      }
//    });
//    scene.done();
    pack.finish();
  },
  
  merge : function(peer){
    
  }
});

