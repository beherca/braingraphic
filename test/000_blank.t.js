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
        var currD = initD;
        //result of search
        var hasObj = false;
        //check whether is the first loop
        var isInitLoop = true;
        //the key store in current dimension and will be used to search next dimension array
        var key4NextD = -1;
        while(true){
          var nextD = this.next(currD);
          var currPropVal = obj[currD];
          var nextPropVal = obj[nextD];
          //get dimension data array according to currD prefix with d
          var currDim = this['d' + currD];
          //get next 
          var nextDim = currDim[currPropVal];
          if(nextDim != null){
            //nextDim's index
            var ndi = nextDim.indexOf(nextPropVal);
            if(ndi >= 0){
              key4NextD = nextDim[ndi];
              console.log('found key4NextD : ' + key4NextD + ' on dimension ' + currD);
              if(initD == currD && !isInitLoop){
                hasObj = true;
                break;
              }
            }else{
              break;
            }
          }else{
            break;
          }
          currD = nextD;
          //set isInitLoop to be false to mark first loop is done
          if(isInitLoop){
            isInitLoop = false;
          }
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