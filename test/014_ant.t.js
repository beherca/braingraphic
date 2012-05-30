StartTest(function(t) {
  t.diag("Ant");

  t.ok(Ext, 'ExtJS is here');
  t.ok(Ext.Window, '.. indeed');

  t.ok(Creature, 'World is defined');
  t.ok(Creature.Ant, 'World Object is defined');
  
  var gene = {"inputs":[{"iid":8,"x":385,"y":117,"z":0,"axons":["{\"iid\":16,\"x\":385,\"y\":117,\"z\":0,\"isInhibit\":false,\"postNeuron\":{\"iid\":0}}","{\"iid\":33,\"x\":385,\"y\":117,\"z\":0,\"isInhibit\":true,\"postNeuron\":{\"iid\":2}}"],"state":"normal"},{"iid":9,"x":467,"y":119,"z":0,"axons":["{\"iid\":18,\"x\":467,\"y\":119,\"z\":0,\"isInhibit\":false,\"postNeuron\":{\"iid\":2}}","{\"iid\":32,\"x\":467,\"y\":119,\"z\":0,\"isInhibit\":true,\"postNeuron\":{\"iid\":0}}"],"state":"normal"},{"iid":10,"x":611,"y":114,"z":0,"axons":["{\"iid\":20,\"x\":611,\"y\":114,\"z\":0,\"isInhibit\":false,\"postNeuron\":{\"iid\":4}}","{\"iid\":36,\"x\":611,\"y\":114,\"z\":0,\"isInhibit\":true,\"postNeuron\":{\"iid\":6}}"],"state":"normal"},{"iid":11,"x":704,"y":114,"z":0,"axons":["{\"iid\":22,\"x\":704,\"y\":114,\"z\":0,\"isInhibit\":false,\"postNeuron\":{\"iid\":6}}","{\"iid\":38,\"x\":704,\"y\":114,\"z\":0,\"isInhibit\":true,\"postNeuron\":{\"iid\":4}}"],"state":"normal"}],"outputs":[{"iid":12,"x":502,"y":341,"z":0,"axons":[],"state":"normal"},{"iid":13,"x":500,"y":419,"z":0,"axons":[],"state":"normal"},{"iid":14,"x":597,"y":332,"z":0,"axons":[],"state":"normal"},{"iid":15,"x":597,"y":419,"z":0,"axons":[],"state":"normal"}],"neurons":[{"iid":0,"x":386,"y":188,"z":0,"axons":["{\"iid\":17,\"x\":386,\"y\":188,\"z\":0,\"isInhibit\":false,\"postNeuron\":{\"iid\":1}}","{\"iid\":24,\"x\":386,\"y\":188,\"z\":0,\"isInhibit\":false,\"postNeuron\":{\"iid\":14}}","{\"iid\":35,\"x\":386,\"y\":188,\"z\":0,\"isInhibit\":true,\"postNeuron\":{\"iid\":3}}"],"state":"normal"},{"iid":1,"x":378,"y":289,"z":0,"axons":["{\"iid\":25,\"x\":378,\"y\":289,\"z\":0,\"isInhibit\":false,\"postNeuron\":{\"iid\":14}}"],"state":"activated"},{"iid":2,"x":464,"y":192,"z":0,"axons":["{\"iid\":19,\"x\":464,\"y\":192,\"z\":0,\"isInhibit\":false,\"postNeuron\":{\"iid\":3}}","{\"iid\":26,\"x\":464,\"y\":192,\"z\":0,\"isInhibit\":false,\"postNeuron\":{\"iid\":12}}","{\"iid\":34,\"x\":464,\"y\":192,\"z\":0,\"isInhibit\":true,\"postNeuron\":{\"iid\":1}}"],"state":"normal"},{"iid":3,"x":469,"y":290,"z":0,"axons":["{\"iid\":27,\"x\":469,\"y\":290,\"z\":0,\"isInhibit\":false,\"postNeuron\":{\"iid\":12}}"],"state":"normal"},{"iid":4,"x":617,"y":198,"z":0,"axons":["{\"iid\":21,\"x\":617,\"y\":198,\"z\":0,\"isInhibit\":false,\"postNeuron\":{\"iid\":5}}","{\"iid\":28,\"x\":617,\"y\":198,\"z\":0,\"isInhibit\":false,\"postNeuron\":{\"iid\":13}}","{\"iid\":39,\"x\":617,\"y\":198,\"z\":0,\"isInhibit\":true,\"postNeuron\":{\"iid\":7}}"],"state":"normal"},{"iid":5,"x":620,"y":267,"z":0,"axons":["{\"iid\":29,\"x\":620,\"y\":267,\"z\":0,\"isInhibit\":false,\"postNeuron\":{\"iid\":13}}"],"state":"normal"},{"iid":6,"x":711,"y":192,"z":0,"axons":["{\"iid\":23,\"x\":711,\"y\":192,\"z\":0,\"isInhibit\":false,\"postNeuron\":{\"iid\":7}}","{\"iid\":30,\"x\":711,\"y\":192,\"z\":0,\"isInhibit\":false,\"postNeuron\":{\"iid\":15}}","{\"iid\":37,\"x\":711,\"y\":192,\"z\":0,\"isInhibit\":true,\"postNeuron\":{\"iid\":5}}"],"state":"normal"},{"iid":7,"x":720,"y":270,"z":0,"axons":["{\"iid\":31,\"x\":720,\"y\":270,\"z\":0,\"isInhibit\":false,\"postNeuron\":{\"iid\":15}}"],"state":"normal"}]};
  var world = World.create({x : 0, y : 0});
  t.ok(world, 'World Created');
  t.is(world instanceof World.World, true, 'world is instance');
  
  t.diag("Creating Ants");
  var ant_m = world.add({
    type: 'ant', 
    x : 300, y : 300,
    gene : JSON.stringify(gene),
    sex : Creature.SEX.M
  });
  var ant_m = world.add({
    type: 'ant', 
    x : 300, y : 100,
    gene : gene,
    sex : Creature.SEX.F
  });
  
  world.tick();
  /*
  Ext.TaskManager.start({
    interval : 1000,
    run : function() {
      world.tick();
    }
  });
  */
  t.done();   // Optional, marks the correct exit point from the test
});