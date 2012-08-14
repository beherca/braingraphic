StartTest(function(t) {
  t.diag("World");

  t.ok(Ext, 'ExtJS is here');
  t.ok(Ext.Window, '.. indeed');

  t.ok(Utils, 'Utils is defined');

  t.ok(Looper, 'UnblockLooper is defined');

  t.diag("Test Looper");

  var l = new Looper();
  var count = 0;
  l.run({
    name : 'test',
    start : 0,
    end : 3,
    step : 1,
    handler : function(i){
      console.log(i);
      count++;
    },
    caller : this
  });
  
  t.is(l.loopees.hasOwnProperty('test'), true, "loopee 'test' has been added");
  l.tick();
  t.is(count, 1, "tick one");
  l.tick();
  t.is(count, 2, "tick two");
  l.tick();
  l.tick();
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