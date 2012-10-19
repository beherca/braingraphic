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
  
  var D = cls.extend(Observable, {
    value : 4,
    get$c : function(){
      return this.value;
    }
  });

  var c = cls.create(C);
  console.log(c);
  t.is(Utils.isFunction(c.__lookupGetter__('c')), true, 'C contains getter');
  t.is(Utils.isFunction(c.__lookupSetter__('c')), true, 'C contains setter');
  //set value to 4
  c.c = 4;
  t.is(c.c, 4, 'Value is set successfully');
  
  var d = cls.create(D);
  console.log(d);
  t.is(Utils.isFunction(d.__lookupGetter__('c')), true, 'D contains getter');
  t.is(Utils.isFunction(d.__lookupSetter__('c')), false, 'D does not contain setter');
  t.is(d.c, 4, 'D\' value is 4');
  d.c = 5;
  t.is(d.c, 4, 'D\' value is still 4');
  
  t.done(); // Optional, marks the correct exit point from the test
});
