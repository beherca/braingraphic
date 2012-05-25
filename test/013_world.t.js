StartTest(function(t) {
    t.diag("World");

    t.ok(Ext, 'ExtJS is here');
    t.ok(Ext.Window, '.. indeed');

    t.ok(World, 'World is defined');
    t.ok(World.Object, 'World Object is defined');
    t.ok(World.Point, 'World Point is defined');
    t.ok(World.Circle, 'World Circle is defined');
    t.ok(World.Engine, 'World Engine is defined');
    
    var world = World.create({op : {x : 0}});
    var preP = world.add({type: 'point', x : 100, y : 100});
    var postP = world.add({type: 'point', x : 100, y : 200});
    var link = world.link({pre : pre, post : post, distance : 10, effDis : 20, isDual: true});
    link.destroy();
    link = preP.link2(postP);
    link.destroy();
    link = postP.link2(preP, false);//true for one way link
    world.tick();
//    Ext.TaskManager.start({
//      interval : 1000,
//      run: function(){
//        world.tick();
//      }
//    }); 

    t.done();   // Optional, marks the correct exit point from the test
});