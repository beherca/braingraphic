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
        var isInitLoop = true;
        var key4NextD = -1;
        while(true){
          var nextD = this.next(currentD);
          var curObjP = obj[currentD];
          var nextObjP = obj[nextD];
          var dimdata = this['d' + currentD];
          var currDim = dimdata[curObjP];
          if(currDim != null){
            key4NextD = currDim[currDim.indexOf(nextObjP)];
            if(key4NextD >= 0){
              console.log('found key4NextD : ' + key4NextD + ' on dimension ' + currentD);
              if(initD == currentD && !isInitLoop){
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
          isInitLoop = false;
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
    t.is(ds.has(obj3, 'y'), false, 'has no obj');
    
    t.diag('move to 3d');
    ds.dim = ['x', 'y', 'z'];
    ds.dx = {1 : [2, 4], 3 : [3], 4 : [2]};
    ds.dy = {2 : [2, 3], 3 : [9]};
    ds.dz = {2 : [1], 3 : [2], 9 : [1]};
    
    var obj4 = {x : 1, y : 2, z : 2};
  
    var obj5 = {x : 2, y : 2, z : 3};
    
    var obj6 = {x : 1, y : 3, z : 9};
    
    t.is(ds.has(obj4, 'x'), true, 'x has obj');
    t.is(ds.has(obj4, 'y'), true, 'y has obj');
    t.is(ds.has(obj4, 'y'), true, 'y has obj');
    t.is(ds.has(obj5, 'x'), false, 'z has no obj');
    t.is(ds.has(obj6, 'z'), false, 'z has no obj');
    
    t.done();   // Optional, marks the correct exit point from the test
});