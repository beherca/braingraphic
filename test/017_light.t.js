StartTest(function(t) {
  t.diag("Light");

  t.ok(Ext, 'ExtJS is here');
  t.ok(Ext.Window, '.. indeed');

  t.ok(Utils, 'Utils is defined');

  t.ok(Scene, 'Scene is defined');
  var c = Utils.cls;
  var sd = c.create(SpaceDef);
  var fc = c.create(FrameConfig);
  var scene = c.create(Scene, {sd : sd, fc : fc});
  //multi-workers process frames
  ndcp.process(scene, 
      {
        rollnext : function(pack){
          //TODO update frame info : node, status
          var frame = pack.data;
          frame.update(frame);
        },
        finished : function(pack){
          var scene = pack.data;
          scene.finish();
        },
        error : function(e){
        }
      }
  );
  
  //search phase
  var camera = c.create(Camera, {
        startFrame : 0, endFrame : 'end', 
        resolution : 'full/half/auto/custom', 
        rolltype : 'auto/manual'
      });
  worldEngine.view(scene, camera);
  
  t.ok(scene, 'scene is created');
  t.diag("Test Scene");

  t.done();
});

/*
 * code example for cosole test
 * 
 * A = Utils.cls.extend(Observable, {a :1});
 * 
 * a = Utils.cls.create(A, {a :2}) f1 = function(){console.log(1)} f2 =
 * function(){console.log(2)} f3 = function(){console.log(3)} a.on('f', f1, a);
 * a.on('f', f2, a, 1); a.on('f', f3, a, 2); a.fireEvent('f');
 * 
 */