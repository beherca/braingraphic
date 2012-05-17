Ext.define('AM.controller.NeuronMap', {
  extend : 'Ext.app.Controller',
  
  models : [ 'NeuronMap'],

  stores : [ 'NeuronMaps' ],

  view : [ 'neuronmap.NeuronMap'],
  
  init : function() {
    console.log('NeuronMap Controller Start OK');
    this.control({
      'container > toolbar>button[action=save]' : {
        click : this.saveMap
      }
    });
  },

  saveMap : function(btn) {
    console.log('saving map');
    var me = this;
    var nm = btn.up('neuronmapview');
    var json = Ext.JSON.encode(nm.neurons);
    console.log(json);
  }
});