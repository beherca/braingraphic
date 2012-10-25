StartTest(function(t) {
    t.diag("Brain");

    t.ok(Ext, 'ExtJS is here');
    t.ok(Ext.Window, '.. indeed');

    //dimensions
    var ds = {
      dim : ['x', 'y'],
      dx : {1 : [2,4], 3 : [3], 4 : [2]},
      dy : {2 : [1,4], 3 : [3], 4 : [1]},
      next : function (d){
        var dim = this.dim;
        var currentIndex = dim.indexOf(d);
        var nextIndex = currentIndex + 1 >= dim.length ? 0 : currentIndex + 1;
        return dim[nextIndex];
      },
      
      has : function(obj, initD){
        var currentD = initD;
        var hasObj = false;
        var key = -1;
        while(true){
          var nextD = this.next(currentD);
          var curObjP = obj[currentD];
          var nextObjP = obj[nextD];
          var dimdata = this['d' + currentD];
          if(dimdata[curObjP] != null){
            key = dimdata[curObjP][dimdata[curObjP].indexOf(nextObjP)];
            if(key >= 0){
              console.log('found key : ' + key + ' on dimension ' + currentD);
              if(initD == currentD){
                hasObj = true;
                break;
              }
            }else{
              break;
            }
          }else{
            break;
          }
          currentD = nextD;
        }
        return hasObj;
      }
    };

    
    var obj1 = {x : 1, y : 2};
//    t.is(has(obj1), true, 'has obj');
    
    var obj2 = {x : 2, y : 2};
//    t.is(has(obj2), false, 'has no obj');
    
    var obj3 = {x : 1, y : 3};
//    t.is(has(obj3), false, 'has no obj');
    
    t.is(ds.has(obj1, 'x'), true, 'has obj');
    t.is(ds.has(obj1, 'y'), true, 'has obj');
    t.is(ds.has(obj2, 'x'), false, 'has no obj');
    t.is(ds.has(obj3, 'x'), false, 'has no obj');

    t.done();   // Optional, marks the correct exit point from the test
});