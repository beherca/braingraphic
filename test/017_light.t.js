StartTest(function(t) {
  t.diag("Light");

  t.ok(Ext, 'ExtJS is here');
  t.ok(Ext.Window, '.. indeed');

  t.ok(Utils, 'Utils is defined');

  t.ok(Scene, 'Scene is defined');

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