/**
 * @author Kai Li
 * @desc this is to test mixin function in the Utils.cls.create
 */
StartTest(function(t) {
  t.diag("Iider Test start");

  t.ok(Ext, 'ExtJS is here');
  t.ok(Ext.Window, '.. indeed');

  t.ok(Utils, 'Utils is defined');
  t.ok(Utils.apply, 'Apply function is ready');
  
  t.diag("Test Apply");
  var cpfrom = {
    a : 1,
    b : 2,
    c : 3,
    d : 4,
    e : null,
    f : undefined,
    g : 0
  };
  
  var copyto = {};

  Utils.apply(copyto, cpfrom);
  t.ok(copyto.hasOwnProperty('a') 
      && copyto.hasOwnProperty('b')
      && copyto.hasOwnProperty('c')
      && copyto.hasOwnProperty('d'), 'Target Object has a, b, c, d');
  t.ok(!copyto.hasOwnProperty('e'), 'Target Object has no e because it is null');
  t.ok(!copyto.hasOwnProperty('f'), 'Target Object has no e because it is undefined');
  t.ok(copyto.hasOwnProperty('g'), 'Target Object has g, even it is 0');
  
  t.done(); // Optional, marks the correct exit point from the test
});
