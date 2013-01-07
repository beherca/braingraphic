/**
 * @author Kai Li
 * @desc this is to test utils misc
 */
StartTest(function(t) {
  t.diag("Iider Test start");

  t.ok(Ext, 'ExtJS is here');
  t.ok(Ext.Window, '.. indeed');

  t.ok(Utils, 'Utils is defined');
  
  t.diag("Test Utils Misc");
  var isArray = Utils.isArray;
  var isFunction = Utils.isFunction;
  var isObject = Utils.isObject;
  
  var obj = {a : 1};
  var array = ['1', '2'];
  var func = function(){console.log('hi');};
  var obj2 = new func();
  
  t.diag("Test Utils isArray");
  t.is(isArray(obj), false,  'Not an Array');
  t.is(isArray(array), true, 'is an Array');
  t.is(isArray(func), false, 'Not an Array');
  t.is(isArray(null), false, 'Not an Array');
  t.is(isArray(undefined), false, 'Not an Array');
  t.is(isArray('hi'), false, 'Not an Array');
  t.is(isArray(9), false, 'Not an Array');
  t.is(isArray(/9/), false, 'Not an Array');
  
  t.diag("Test Utils isFunction");
  t.is(isFunction(obj), false,  'Not a Function');
  t.is(isFunction(array), false, 'Not a Function');
  t.is(isFunction(func), true, 'Not a Function');
  t.is(isFunction(null), false, 'Not a Function');
  t.is(isFunction(undefined), false, 'Not a Function');
  t.is(isFunction('hi'), false, 'Not a Function');
  t.is(isFunction(9), false, 'Not a Function');
  t.is(isFunction(/9/), false, 'Not a Function');
  
  t.diag("Test Utils isObject");
  t.is(isObject(obj), true,  'is an Object');
  t.is(isObject(obj, true), true,  'is an Object');
  t.is(isObject(obj2), true,  'is an Object');
  t.is(isObject(obj2, true), false,  'is not an Object restrictly');
  t.is(isObject(array), true, 'is an Object');
  t.is(isObject(array, true), false, 'Not an Object restrictly');
  t.is(isObject(func), false, 'Not an Object');
  t.is(isObject(null), false, 'is an Object');
  t.is(isObject(undefined), false, 'Not an Object');
  t.is(isObject('hi'), false, 'Not an Object');
  t.is(isObject(9), false, 'Not an Object');
  t.is(isObject(/9/), true, 'is an Object');
  t.is(isObject(/9/, true), false, 'is not an Object restrictly');
  
  
  t.done(); // Optional, marks the correct exit point from the test
});
