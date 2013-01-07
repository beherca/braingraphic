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
  t.ok(Utils.deepcopy, 'Utils deepcopy function is defined');
  
  var tj = Utils.tj;
  var cls = Utils.cls;
  var dc = Utils.deepcopy;

  t.diag('Test ordinary object');
  var dt = new Date();
  var origin = {
    num : 1,
    str : '1',
    regx : /^-{1}/,
    bool : true,
    date : dt,
    func : function(){
      console.log(3);
      this.val = 3;
    },

    nul : null,
    
    udf : undefined,
    
    objnum : {//number
      val : 2
    },
    objstr : {//string
      val : '2'
    },
    objregx : {//regx
      val : /^_/g
    },
    objdate : {//date
      val : dt
    },
    objbool : {//boolean
      val : true
    },
    objfunc : {
      val : function(){console.log(1); this.val = 1;}
    },
    
    objarr : {
      val : [
        1,
        '1',
        dt,
        /^_/,
        true,
        function(){console.log(2); this.val = 2;}
      ]
    },
    
    arr : [
       1,
       '1',
       dt,
       /^_/,
       true,
       function(){console.log(4); this.val = 4;},
       {
         num : 1,
         str : '1',
         regx : /^-/,
         bool : true,
         date : dt,
         func : function(){
           console.log(5);
           this.val = 5;
         },

         nul : null,
         
         udf : undefined,
         
         objnum : {//number
           val : 2
         },
         objstr : {//string
           val : '2'
         },
         objregx : {//regx
           val : /^_/g
         },
         objdate : {//date
           val : dt
         },
         objbool : {//boolean
           val : true
         },
         objfunc : {
           val : function(){console.log(6); this.val = 6;}
         },
         
         objarr : {
           val : [
             1,
             '1',
             dt,
             /^_/,
             true,
             function(){console.log(7); this.val = 7;}
           ]
         }
       }
     ]
  };
  
  var copy = dc(origin);
  console.log(copy);
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
        t.is(Utils.type(obj) ,  etype, 'type is matched:' + etype);  
        t.is(Utils.type(to) , etype, 'type is matched:' + etype);
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
  match(copy, origin);
  
  function erase(obj){
    if(obj == null){//empty means both null and undefined
      obj = null;
    }else if(typeof obj === 'string'){//string
      obj = null;
    }else if(typeof obj === 'number'){//number
      obj = null;
    }else if(typeof obj === 'boolean'){//boolean
      obj = null;
    }else if(typeof obj === 'function' && obj.constructor && obj.constructor === Function){//function 
      obj = null;
    }else if(typeof obj === 'object'){//Object
      if(obj.constructor && obj.constructor === Array){//array
        obj.forEach(function(o, i){
          o = null;
        });
      }else if(obj.constructor && obj.constructor === RegExp){//regular expression
        obj = null;
      }else if(obj.constructor && obj.constructor === Date){//date
        obj = null;
      }else if(obj.constructor && obj.constructor === Object /*equals to obj instanceof Object*/){//instance
        for(var key in obj){
          obj[key] = null;
        }
      }else{
        for(var key in obj){
          if(obj.hasOwnProperty(key)){
            obj[key] = null;
          }
        }
      }
    }
  };
  
  function check(obj){
    if(obj == null){//empty means both null and undefined
      
    }else if(typeof obj === 'string'){//string
      t.ok(obj, 'String ok ' + obj);
    }else if(typeof obj === 'number'){//number
      t.ok(obj, 'Num ok ' + obj);
    }else if(typeof obj === 'boolean'){//boolean
      t.ok(obj, 'Boolean ok ' + obj);
    }else if(typeof obj === 'function' && obj.constructor && obj.constructor === Function){//function 
      t.ok(obj, 'Function ok ' + obj);
    }else if(typeof obj === 'object'){//Object
      if(obj.constructor && obj.constructor === Array){//array
        obj.forEach(function(o, i){
          if(key != 'nul' && key != 'udf')
            t.ok(obj[key], 'Object Ref ' + key);
        });
      }else if(obj.constructor && obj.constructor === RegExp){//regular expression
        t.ok(obj, 'RegExp ok ' + obj);
      }else if(obj.constructor && obj.constructor === Date){//date
        t.ok(obj, 'Date ok ' + obj);
      }else if(obj.constructor && obj.constructor === Object /*equals to obj instanceof Object*/){//instance
        for(var key in obj){
          if(key != 'nul' && key != 'udf')
            t.ok(obj[key], 'Object Ref ' + key);
        }
      }else{
        for(var key in obj){
          if(obj.hasOwnProperty(key)){
            if(key != 'nul' && key != 'udf')
              t.ok(obj[key], 'Object Ref ' + key);
          }
        }
      }
    }
  };
  
  //erase all value in copy object
  erase(copy);
  //then check origin, all should remain there
  check(origin);
  
  //+++++++++++++++++++++++++++++++++++++Test Instances
  t.diag('Test Instances');
  var TestClass = cls.extend(Observable, {
    alias : 'TestClass',
    child : null,
    children : null,
    num : 1,
    str : 'ok',
    regx : /^-/,
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
  origin = cls.create(TestClass, {
    child : child,
    children : children
  });
  
  copy = dc(origin);
  
  match(copy, origin);
  
  erase(copy);
  check(origin);
  
  t.done(); // Optional, marks the correct exit point from the test
});
