StartTest(function(t) {
    t.diag("Brain");

    t.ok(Ext, 'ExtJS is here');
    t.ok(Ext.Window, '.. indeed');

    //dimensions
//    var ds = ['x', 'y'];
    var dx = {1 : [2,4], 3 : [3], 4 : [2]};
    var dy = {2 : [1,4], 3 : [3], 4 : [1]};
    
    function has(obj){
      var ky = -1;
      if(dx[obj.x] && dx[obj.x].indexOf(obj.y) >= 0){
        ky = dx[obj.x][dx[obj.x].indexOf(obj.y)];
        if(ky > 0){
          console.log('found ky :' + ky);
        }else{
          return false;
        }
        
      }else{
        return false;
      }
      var kx = -1;
      if(dy[ky] && dy[ky].indexOf(obj.x) >= 0){
        kx = dy[ky][dy[ky].indexOf(obj.x)];
        if(kx && kx == obj.x){
          return true;
        }else{
          return false;
        }
      }else{
        return false;
      }
    }
    
    var obj1 = {x : 1, y : 2};
    t.is(has(obj1), true, 'has obj');
    
    var obj2 = {x : 2, y : 2};
    t.is(has(obj2), false, 'has no obj');
    
    var obj3 = {x : 1, y : 3};
    t.is(has(obj3), false, 'has no obj');

    t.done();   // Optional, marks the correct exit point from the test
});