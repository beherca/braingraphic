StartTest(function(t) {
  t.diag("World");

  t.ok(Ext, 'ExtJS is here');
  t.ok(Ext.Window, '.. indeed');

  t.ok(Utils, 'Utils is defined');

  var A = Utils.cls.extend(Observable, {
    a : 1
  });

  var a = Utils.cls.create(A, {
    a : 2
  });
  
  var funcCall = [];

  var f1 = function() {
    funcCall.push('f1');
  };

  var f2 = function() {
    funcCall.push('f2');
  };

  var f3 = function() {
    funcCall.push('f3');
  };

  a.on('f', f1);
  a.on('f', f2, a, 1);
  a.on('f', f3, a, 1);

  t.diag("Test 1 whether the repeat work");
  /*
   * =======================Test Description===========
   * next test: check whether repeat work correctly to delete repeat specify listeners
   * ==================================================
   */
  testFireEvent(3); // f1,f2,f3 is called
  
  //call again
  testFireEvent(1); // f1 is called

  /*
   * =======================Test Description===========
   * next test: check whether repeat work correctly for listeners that has
   * listened same event, but has different handler
   * ==================================================
   */
  
  a.on('f', f2, a, 1);
  a.on('f', f3, a, 2);

  t.diag("Test 2 check whether repeat work correctly for listeners that has listened same event, but has different handler");
  
  testFireEvent(3); // f1,f2,f3 is called
  
  //call again
  testFireEvent(2); // f1 is called

  
  function testFireEvent(expectTimes){
    funcCall = [];
    a.fireEvent('f'); // output 1,2,3
    t.is(expectTimes, funcCall.length, funcCall.length + ' functions have been called');
    t.diag(funcCall.join(', ') + ' are called');
  }
  t.done(); // Optional, marks the correct exit point from the test
});

/*
code example for cosole test

A = Utils.cls.extend(Observable, {a :1});

a = Utils.cls.create(A, {a :2})
f1 = function(){console.log(1)}
f2 = function(){console.log(2)}
f3 = function(){console.log(3)}
a.on('f', f1, a);
a.on('f', f2, a, 1);
a.on('f', f3, a, 2);
a.fireEvent('f');

*/