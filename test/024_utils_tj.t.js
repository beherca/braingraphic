/**
 * @author Kai Li
 * @desc this is to test utils misc
 */
StartTest(function(t) {
  t.diag("Iider Test start");

  t.ok(Ext, 'ExtJS is here');
  t.ok(Ext.Window, '.. indeed');

  t.ok(Utils, 'Utils is defined');
  t.ok(Utils.tj, 'Utils ToJson is defined');
  t.ok(Utils.cls, 'Utils ToJson is defined');
  
  t.diag("Test Utils ToJson ");
  var tj = Utils.tj;
  var cls = Utils.cls;
  var TestClass = cls.extend(Observable, {
    alias : 'TestClass',
    child : null,
    children : null,
    toJson : function(){
       return Utils.tj({
         child : this.child,
         children : this.children
       });
     }
  });
  
  var child = cls.create(TestClass);
  var children = [cls.create(TestClass)];
  var root = cls.create(TestClass, {
    child : child,
    children : children
  });
  
  var json = root.toJson();
  
  function match(obj, to){
    var etype = '';
    if(obj == null){//empty means both null and undefined
      etype = Utils.T.EMPTY;
      t.is(obj, to, 'Value is the same');
      t.is(Utils.type(obj) ,  etype, 'type is matched:' + etype);  
      t.is(Utils.type(to) , etype, 'type is matched:' + etype);
    }else if(typeof obj === 'string'){//string
      etype = Utils.T.STR;
      t.is(obj, to, 'Value is the same');
      t.is(Utils.type(obj) ,  etype, 'type is matched:' + etype);  
      t.is(Utils.type(to) , etype, 'type is matched:' + etype);
    }else if(typeof obj === 'number'){//number
      etype = Utils.T.NUM;
      t.is(obj, to, 'Value is the same');
      t.is(Utils.type(obj) ,  etype, 'type is matched:' + etype);  
      t.is(Utils.type(to) , etype, 'type is matched:' + etype);
    }else if(typeof obj === 'boolean'){//boolean
      etype = Utils.T.BOOL;
      t.is(obj, to, 'Value is the same');
      t.is(Utils.type(obj) ,  etype, 'type is matched:' + etype);  
      t.is(Utils.type(to) , etype, 'type is matched:' + etype);
    }else if(typeof obj === 'function' && obj.constructor && obj.constructor === Function){//function 
      etype = Utils.T.FUNC;
      t.is(obj, to, 'Reference is the same');
      t.is(Utils.type(obj) ,  etype, 'type is matched:' + etype);  
      t.is(Utils.type(to) , etype, 'type is matched:' + etype);
    }else if (typeof obj === 'object'){//Object
      if(obj.constructor && obj.constructor === Array){//array
        etype = Utils.T.ARRAY;
        t.isNot(obj, to, 'Reference MUST NOT the same');
        t.is(obj.length, to.length, 'Length is not the same');
        obj.forEach(function(o, i){
          match(o, to[i]);
        });
        t.is(Utils.type(obj) ,  etype, 'type is matched:' + etype);  
        t.is(Utils.type(to) , etype, 'type is matched:' + etype);
      }else if(obj.constructor && obj.constructor === RegExp){//regular expression
        etype = Utils.T.REGX;
        t.is(obj, to, 'Value is the same');
        t.ok(obj.test, 'Test is valid');
        var testtext = '-hi';//test result true
        t.is(obj.test(testtext), to.test(testtext), 'Test result true ok');
        testtext = 'hi';//test result false
        t.is(obj.test(testtext), to.test(testtext), 'Test result false ok');
        t.is(Utils.type(obj) ,  etype, 'type is matched:' + etype);  
        t.is(Utils.type(to) , etype, 'type is matched:' + etype);
      }else if(obj.constructor && obj.constructor === Date){//date
        etype = Utils.T.DATE;
        t.is(obj, to, 'Value is the same');
        t.is(Utils.type(obj) ,  etype, 'type is matched:' + etype);  
        t.is(Utils.type(to) , etype, 'type is matched:' + etype);
      }else if(obj.constructor && obj.constructor === Object /*equals to obj instanceof Object*/){//instance
        etype = Utils.T.OBJ;
        t.isNot(obj, to, 'Reference MUST NOT the same');
        for(var key in obj){
          var prop = obj[key];
          var testp = to[key];
          match(prop, testp);
        }
        t.is(Utils.type(obj),  etype, 'type is matched:' + etype);  
      }else{
        etype = Utils.T.INST;
        t.isNot(obj, to, 'Reference MUST NOT the same');
        for(var key in obj){
          if(obj.hasOwnProperty(key)){
            var prop = obj[key];
            var testp = to[key];
            match(prop, testp);
          }
        }
        t.is(Utils.type(obj) ,  etype, 'type is matched:' + etype);  
        t.is(Utils.type(to) , etype, 'type is matched:' + etype);
      }
    }
    return null;
  };
  
  match(json, root);
  
  t.done(); // Optional, marks the correct exit point from the test
});
