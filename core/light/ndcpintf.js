ndcp = {};

ndcp.NdcpIntf = Utils.cls.extend(Observable, {
  /**
   * Peer Manager
   */
  peerm : null,
  
  /**
   * Package manager
   */
  packm : null,
  
  init : function(config){
    this.config = config;
    this.peerm = Utils.cls.create(PeerManager);
    this.packm = Utils.cls.create(PackageManager);
    this.packm.on({
      added : function(pack){
        var peer = this.peerm.first();
        peer.work(pack);
      }
    });
  },
  
  process : function(scene){
    var peers = this.peerm.getPeers();
    var numofPeers = peers.length;
    //Split scene into sub scene for multiple worker to work on
    var subscenes = scene.split(numofPeers);
    scene.topo = peers;
    //Pack scenes with package proxy, will return packages contain sub-scenes
    var packs = PackProxy.pack(subscenes, {
      finished : function(pack){
        var f = pack.input;
        f.nodeId = pack.to;
        f.status = 'Finished';
        scene.upateFrame(f);
      }
    });
    
    //package manage communication and synchronization
    this.packm.manage(packs);
  }
});