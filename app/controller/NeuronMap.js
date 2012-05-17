Ext.define('AM.controller.NeuronMap', {
  extend : 'Ext.app.Controller',
  view : [ {
    xtype : 'neuronmap'
  } ],
  init : function() {
    console.log('NeuronMap Controller Start');
    this.control({
      'container > toolbar>button[action=save]' : {
        click : this.saveMap
      }
    });
  },
  
  saveMap : function(btn){
    console.log('saving map');
    var me = this;
    var nm = btn.up('neuronmap');
    var json = Ext.JSON.encode(nm.neurons);
    console.log(json);
  }
});