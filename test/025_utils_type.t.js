/**
 * @author Kai Li
 * @desc this is to test utils misc
 */
StartTest(function(t) {
  t.diag("Iider Test start");

  t.ok(Ext, 'ExtJS is here');
  t.ok(Ext.Window, '.. indeed');

  t.ok(Utils, 'Utils is defined');
  t.ok(Utils.type, 'Utils type is defined');
  t.ok(Utils.T, 'Utils TYPE is defined');
  t.ok(Utils.cls, 'Utils class is defined');
  
  t.diag("Test Utils ToJson ");
  var tj = Utils.tj;
  var cls = Utils.cls;
  var TestClass = cls.extend(Observable, {
    alias : 'TestClass',
    child : null,
    children : null,
    num : 1,
    str : 'ok',
    regx : /^-/g,
    bool : true,
    undf : undefined,
    date : new Date(),
    func : function(){
      console.log('test');
    },
    plainobj : { a : 1 , b : 'ok'},
    arry_primitives : ['1', '2', 3],
    arry_booleans : [true, false],
    arry_dates : [new Date(), new Date()],
    arry_funcs : [
      function(){
        console.log('test func0');
        this.a  = 'func0';
      },function(){
        console.log('test func1');
        this.a  = 'func2';
      }
     ],
     empty : null,
     arry_mixed : [[1, 2, 3], [{g : 1}, {g : 2}], [function(){console.log('test func2');this.a  = 'func2';}] ],
     toJson : function(){
       return Utils.tj({
         child : this.child,
         children : this.children,
         num : this.num,
         str : this.str,
         regx : this.regx,
         bool : this.bool,
         date : this.date,
         func : this.func,
         plainobj : this.plainobj,
         arry_primitives : this.arry_primitives,
         arry_booleans : this.arry_booleans,
         arry_dates : this.arry_dates,
         arry_funcs : this.arry_funcs,
         arry_mixed : this.arry_mixed
       });
     }
  });
  
  var child = cls.create(TestClass);
  var children = [cls.create(TestClass)];
  var root = cls.create(TestClass, {
    child : child,
    children : children
  });
  
  var type = Utils.type;
  var T = Utils.T;
  /*EMPTY : 'empty',
  ARRAY : 'array',
  FUNC : 'function',
  INST : 'instance',
  STR : 'string',
  NUM : 'number',
  REGX : 'regx',
  DATE : 'date',
  BOOL : 'boolean',
  OBJ : 'objext'*/
  t.is(type(root.str), T.STR, 'String Test');
  t.is(type(root.num), T.NUM, 'Number Test');
  t.is(type(root.empty), T.EMPTY, 'Null Test');
  t.is(type(root.undf), T.EMPTY, 'Undefined Test');
  t.is(type(root.date), T.DATE, 'Date Test');
  t.is(type(root.bool), T.BOOL, 'Boolean Test');
  t.is(type(root.regx), T.REGX, 'Regular Express Test');
  t.is(type(root.arry_primitives), T.ARRAY, 'String Test');
  t.is(type(root.plainobj), T.OBJ, 'Object Test');
  t.is(type(root.child), T.INST, 'Instance Test');
  
  t.done(); // Optional, marks the correct exit point from the test
});
