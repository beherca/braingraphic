/*
 * TODO we can use sencha sdk to generate all-class.js and app.jsb3, 
 */
//Ext.Loader.loadScript('./app/controller/NeuronMap.js');
//Ext.Loader.loadScript('./app/view/neuronmap/NeuronMap.js');
//Ext.Loader.loadScript('./app/view/Viewport.js');

//Ext.onReady(function(){
  Ext.application({
    name: 'AM',
    // automatically create an instance of AM.view.Viewport
    autoCreateViewport: true,

    controllers: [
        'NeuronMap',
        'World'
    ]
});
