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

  var A = function(){
    this.a  =1;
  };
  
  A.prototype.testA = function(){
    return 'I am A';
  };
  
  var B = function(){
    this.b = 2;
    this.testB = function(){
      return 'I am B';
    };
  };
  
  var C = cls.extend(Observable, {
    c : 3,
    testC : function(){
      return 'I am C';
    }
  });
  
  var D = cls.extend(Observable, {
    d : 4,
    testD : function(){
      return 'I am D';
    }
  });

  var c_no_mixin = cls.create(C);
  t.is(c_no_mixin.hasOwnProperty('a'), false, 'C contains no property \'a\' from class A');
  t.is(c_no_mixin.hasOwnProperty('c'), true, 'C contains  property \'c\' from class C');
  t.is(c_no_mixin.c, 3, 'C  \'c\' is 3');
  
  var c_minxin = cls.create(C, {}, [A]);
  console.log(c_minxin);
  t.is(c_minxin.hasOwnProperty('a'), true, 'C contains property \'a\' from class A');
  t.is(c_minxin.hasOwnProperty('c'), true, 'C contains  property \'c\' from class C');
  t.is(c_minxin.a, 1, 'C  \'a\' is 1');
  t.is(c_minxin.c, 3, 'C  \'c\' is 3');
  
  c_minxin = cls.create(C, {}, [A, B, D]);
  console.log(c_minxin);
  t.is(c_minxin.hasOwnProperty('a'), true, 'C contains property \'a\' from class A');
  t.is(c_minxin.hasOwnProperty('b'), true, 'C contains property \'b\' from class B');
  t.is(c_minxin.hasOwnProperty('c'), true, 'C contains  property \'c\' from class C');
  t.is(c_minxin.a, 1, 'C  \'a\' is 1');
  t.is(c_minxin.c, 3, 'C  \'c\' is 3');
  
  t.done(); // Optional, marks the correct exit point from the test
});
