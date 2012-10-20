/**
 * @author Kai Li
 * @desc this is to test mixin function in the Utils.cls.create
 */
StartTest(function(t) {
  t.diag("World");

  t.ok(Ext, 'ExtJS is here');
  t.ok(Ext.Window, '.. indeed');

  t.ok(Utils, 'Utils is defined');
  t.ok(Observable, 'Observable is defined');
  t.ok(Utils.cls, 'Utils Class is defined');
  
  var cls = Utils.cls;

  
  var C = cls.extend(Observable, {
    alias : 'C',
    value : 3,
    testC : function(){
      return 'I am C';
    },
    get$c : function(){
      return this.value;
    }, 
    
    set$c : function(v){
      this.value = v;
    }
  });
//  
//  var D = cls.extend(Observable, {
//    alias : 'D',
//    value : 4,
//    get$c : function(){
//      return this.value;
//    }
//  });
  
  var A = cls.extend(C, {
    alias : 'A_C',
    avalue : 4,
    get$a : function(){
      return this.avalue;
    }
  });
//
//  t.diag('Test getter setter normal');
//  var c = cls.create(C);
//  console.log(c);
//  t.is(Utils.isFunction(c.__lookupGetter__('c')), true, 'C contains getter');
//  t.is(Utils.isFunction(c.__lookupSetter__('c')), true, 'C contains setter');
//  //set value to 4
//  c.c = 4;
//  t.is(c.c, 4, 'Value is set successfully');
//  
//  t.diag('Test getter setter without setter');
//  var d = cls.create(D);
//  console.log(d);
//  t.is(Utils.isFunction(d.__lookupGetter__('c')), true, 'D contains getter');
//  t.is(Utils.isFunction(d.__lookupSetter__('c')), false, 'D does not contain setter');
//  t.is(d.c, 4, 'D\' value is 4');
//  d.c = 5;
//  t.is(d.c, 4, 'D\' value is still 4');
//  
//  t.diag('Test inheritance again');
  var a = cls.create(A);
  console.log(a);
  t.is(Utils.isFunction(a.__lookupGetter__('c')), true, 'A contains getter from C');
  t.is(Utils.isFunction(a.__lookupSetter__('c')), true, 'A contains setter from C');
  t.is(Utils.isFunction(a.__lookupGetter__('a')), true, 'A contains setter from A');
  t.is(Utils.isFunction(a.__lookupSetter__('a')), false, 'A does not contain setter from A');
  
  t.is(a.c, 3, 'A\' value c is 3');
  a.c = 4;
  t.is(a.c, 4, 'A\' value c is changes to 4');
  
  t.is(a.a, 4, 'A\' value a is 4');
  a.a = 5;
  t.is(a.a, 4, 'A\' value a is still 4');
  
  t.done(); // Optional, marks the correct exit point from the test
});
