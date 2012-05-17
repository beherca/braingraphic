Ext.define('AM.controller.NeuronMap', {
  extend : 'Ext.app.Controller',

  models : [ 'NeuronMap' ],

  stores : [ 'NeuronMaps' ],

  view : [ 'neuronmap.NeuronMap', 'neuronmap.NeuronMapList' ],

  refs : [ {
    ref : 'list',
    selector : 'neuronmaplist'
  }, {
    ref : 'designer',
    selector : 'neuronmapview'
  } ],

  init : function() {
    console.log('NeuronMap Controller Start OK');
    this.control({
      'neuronmapview' : {
        mapSave : this.saveMap,
        mapListShow : this.showMapList
      },
      'neuronmaplist' : {
        mapAdd : this.showBrainDesigner,
        mapDelete : this.deleteMap
      }
    });
  },
  
  deleteMap : function(evtData){
    var store = this.getNeuronMapsStore();
    var record = store.getAt(evtData.rowIndex);
    if(record) {
      store.remove(record);
      store.sync();
    }
  },

  showMapList : function() {
    this.getList().show();
    this.getDesigner().hide();
  },

  showBrainDesigner : function() {
    this.getList().hide();
    this.getDesigner().show();
  },

  saveMap : function(data) {
//    console.log('saving map');
    var store = this.getNeuronMapsStore();
    var nJson = Ext.JSON.encode(data.neurons);
//    console.log(nJson);
    store.add({
      name : data.name,
      mapsdata : nJson
    });
    store.sync();
  }
});