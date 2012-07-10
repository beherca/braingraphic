/**
 * World is used to display the object data
 */
Ext.define('AM.world.TPolygonTest', {
  extend : 'AM.view.world.World',
  alias : 'widget.tpolygontest',
  title : 'Thread Polygon Test',
  
  interval : 10,
  
  syncing : false,
  
  posData : null,
  
  start : function(){
    var me = this;
    var worker = me.newWorker();
    if (isEmpty(this.worldTick)) {
      this.worldTick = Ext.TaskManager.start({
        interval : me.interval,
        run : function() {
          me.syncing = true;
          me.syncPos.call(me);
          me.syncing = false;
        }
      });
    } else {
      Ext.TaskManager.start(this.worldTick);
    }
  },
  
  newWorker : function(){
    var me = this;
    var worker = new Worker("play/samples/thread/RealWorld.js");
    // Watch for messages from the worker
    worker.onmessage = function(e){
      // The message from the client:
      var data = e.data;
      if(data.event === 'onAdd'){
//        console.log('onAdd');
        if(data.type == 'line'){
          me.addLine(data.obj);
        }else{
          me.addPoint(data.obj);
        }
      }else if(data.event === 'onTick'){
//        me.syncPos(data.obj);
        me.updatePosData(data.obj);
      }else if(data.event === 'onInit'){
//        me.syncPos(data.obj);
        worker.postMessage("start");
      }
    };
    
    worker.onerror = function(e){
      console.log(e);
    };
    worker.postMessage("init");
  },
  
  updatePosData : function(data){
    if(!this.syncing){
      this.posData = data;
    }
  },
  
  syncPos : function(){
    if(Ext.isEmpty(this.posData))return;
    for(var i in this.objs){
      if(Ext.isEmpty(this.posData[i])){
        delete this.objs[i];
      }else{
        var obj = this.objs[i];
        if(obj instanceof AM.view.world.Line){
          obj.line = this.posData[i];
        }else if(obj instanceof AM.view.world.Point){
          obj.point = this.posData[i];
        }
        obj.syncPos();
      }
    }
  },
  
  addLine : function(line) {
    var me = this, drawComp = me.down('draw');
    var ln = Ext.create('AM.view.world.Line', {
      drawComp : drawComp,
      line : line,
      iid : line.iid,
      x : line.start.x,
      y : line.start.y,
      endX : line.end.x,
      endY : line.end.y
    });
    me.objs[ln.iid] = ln;
    me.iidor.set(ln.iid);
//    line.on({
//      onDestroy : function(l) {
//        delete me.objs[ln.iid];
//        ln.destroy();
//        ln = null;
//      }
//    });
  },

  addPoint : function(point) {
    var me = this, drawComp = me.down('draw');
    var bno = Ext.create('AM.view.world.Point', {
      drawComp : drawComp,
      x : point.x,
      y : point.y,
      radius : 5,
      iid : point.iid,
      point : point,
      text : point.text,
      showText : this.showText
    });
    me.objs[bno.iid] = bno;
    me.iidor.set(point.iid);
//    point.on({
//      onMove : function(p) {
//        bno.syncPos();
//      },
//      onDestroy : function(p) {
//        bno.destroy();
//        delete me.objs[bno.iid];
//        bno = null;
//      }
//    });
//    bno.on({
//      'onMove' : function(n) {
//        point.x = n.x + me.offset.x;
//        point.y = n.y + me.offset.y;
//      }
//    });
    return bno;
  },
  
  afterRender : function(){
    this.showText = false;
    this.callParent(arguments);
//    this.world.resistance = 0.3;
//    this.world.gForce.value = 10;
//    this.world.gForce.direction = OP.add(0, 10);
    
  }
});