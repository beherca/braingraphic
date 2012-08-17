StartTest(function(t) {
  t.diag("World");

  t.ok(Ext, 'ExtJS is here');
  t.ok(Ext.Window, '.. indeed');

  t.ok(Utils, 'Utils is defined');

  t.ok(Looper, 'UnblockLooper is defined');

  t.diag("Test Looper");

  var l = new Looper();
  var count = 0;
  var capsuleObj = null;
  l.run({
    name : 'test',
    start : 0,
    end : 3,
    step : 1,
    handler : function(i, capsule){
      console.log('i=' + i);
      console.log('capsule=' +capsule);
      capsuleObj = capsule;
      count++;
      return count;
    },
    scope : this
  });
  
  t.is(l.loopees.hasOwnProperty('test'), true, "loopee 'test' has been added");
  l.tick();
  t.is(count, 1, "tick one");
  t.is(capsuleObj, null, 'capsule is null');
  l.tick();
  t.is(count, 2, "tick two");
  t.is(capsuleObj, 1, 'capsule is 1');
  l.tick();
  t.is(capsuleObj, 2, 'capsule is 2');
  l.tick();
  t.is(capsuleObj, 2, 'capsule is 2 still');
  t.is(count, 3, "tick four");
  t.is(l.loopees.hasOwnProperty('test'), false, "loopee 'test' has been remove");
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