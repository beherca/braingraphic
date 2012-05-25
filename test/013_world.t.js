StartTest(function(t) {
    t.diag("World");

    t.ok(Ext, 'ExtJS is here');
    t.ok(Ext.Window, '.. indeed');

    t.ok(World, 'World is defined');
    t.ok(World.Object, 'World Object is defined');
    t.ok(World.Point, 'World Point is defined');
    t.ok(World.Circle, 'World Circle is defined');
    t.ok(World.LinkEngine, 'World LinkEngine is defined');
    
    var world = World.create({x : 300, y : 300});
    t.ok(world, 'World Created');
    t.is(world instanceof World.World, true, 'world is instance');
    var pre = world.add({type: 'point', x : 100, y : 100});
    var post = world.add({type: 'point', x : 100, y : 200});
    var link = world.link({pre : pre, post : post, distance : 10, effDis : 20, isDual: true});
    link.destroy();
    link = pre.link2(post);
    link.destroy();
    link = post.link2(pre, false);//true for one way link
    world.tick();
//    Ext.TaskManager.start({
//      interval : 1000,
//      run: function(){
//        world.tick();
//      }
//    }); 

    t.done();   // Optional, marks the correct exit point from the test
});