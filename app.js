/*
 * TODO we can use sencha sdk to generate all-class.js and app.jsb3, 
 */
//Ext.Loader.loadScript('./app/controller/NeuronMap.js');
//Ext.Loader.loadScript('./app/view/neuronmap/NeuronMap.js');
//Ext.Loader.loadScript('./app/view/Viewport.js');

//Ext.onReady(function(){
  Ext.application({
    requires : ['AM.view.Viewport'],
    name: 'AM',
    // automatically create an instance of AM.view.Viewport
    autoCreateViewport: true,

    controllers: [
        'NeuronMap'
//        'Users'
    ]
});
//});
//
//
//Ext.application({
//  name : 'HelloExt',
//  launch : function() {
//    Ext.create('Ext.container.Viewport', {
//      layout : 'fit',
//      items : [ {
//        title : 'Hello Ext',
//        html : 'Hello! Welcome to Ext JS.'
//      } ]
//    });
//  }
//});