/**
 * @author Kai Li
 * @desc this is to test mixin function in the Utils.cls.create
 */
StartTest(function(t) {
  t.diag("Iider Test start");

  t.ok(Ext, 'ExtJS is here');
  t.ok(Ext.Window, '.. indeed');

  t.ok(Utils, 'Utils is defined');
  t.ok(Utils.buildQ, 'BuildQ is ready');
  
  t.diag("Start Ascend Queue Adding");
  var a = [];
  var prop = 'x';
  
  function ts(array){
    var strs = [];
    array.forEach(function(p){
      strs.push(p[prop]);
    });
    return strs.join();
  };
  
  Utils.buildQ({x : 1}, prop, a);
  console.log(ts(a));
  t.is(ts(a), '1', 'done');
  Utils.buildQ({x : 2}, prop, a);
  console.log(ts(a));
  t.is(ts(a), '1,2', 'done');
  Utils.buildQ({x : 3}, prop, a);
  console.log(ts(a));
  t.is(ts(a), '1,2,3', 'done');
  Utils.buildQ({x : 0}, prop, a);
  console.log(ts(a));
  t.is(ts(a), '0,1,2,3', 'done');
  Utils.buildQ({x : 6}, prop, a);
  console.log(ts(a));
  t.is(ts(a), '0,1,2,3,6', 'done');
  Utils.buildQ({x : 5}, prop, a);
  console.log(ts(a));
  t.is(ts(a), '0,1,2,3,5,6', 'done');
  Utils.buildQ({x : 5}, prop, a);
  console.log(ts(a));
  t.is(ts(a), '0,1,2,3,5,5,6', 'done');
  
  
  t.diag('Generate Numbers Randomly and test match');
  var stress = [];
  a.length = 0;
  var totalTime = 0;
  var d = Date.now();
  var tm = Date.now() - d;
  for(var i = 0; i < 100000; i++){
    var obj = {};
    obj[prop] = (i%2 ? 1 : -1) * parseInt(Math.random() * 1000)/1000;
    stress.push(obj);
    d = Date.now();
    Utils.buildQ(obj, prop, a);
    tm = Date.now() - d;
    totalTime += tm;
  }
  
  
  console.log('Total Time of $$$$our$$$$ implementation Test1: ' + totalTime);
  
  var b = [];
  d = Date.now();
  stress.forEach(function(o){
    Utils.buildQ(o, prop, b);
  });
  tm = Date.now() - d;
  console.log('Total Time of $$$$our$$$$ implementation Test2: ' + tm);
  
  var c = [];
  var ttl2 = 0;
  stress.forEach(function(o){
    d = Date.now();
    Utils.buildQ(o, prop, c);
    tm = Date.now() - d;
    ttl2 += tm;
  });
  console.log('Total Time of $$$$our$$$$ implementation Test3: ' + ttl2);
  
  function compareNumbers(a, b)
  {
    return a[prop] - b[prop];
  }
  
  d = Date.now();
  stress.sort(compareNumbers);
  var buildinT = Date.now() - d;
  console.log('Total Time of ###Build-in### implementation: ' + buildinT);
  
  var s1 = ts(stress);
  var s2 = ts(a);
  
  t.is(s1, s2, 'All Match');
  console.log(buildinT);
  console.log(totalTime);
  t.is(buildinT > totalTime, false, 'Of course We Lost');
  
  d = Date.now();
  Utils.buildQ({x : -100}, prop, a);
  tm = Date.now() - d;
  console.log(tm);
  t.is(buildinT > tm, true, 'But we win here!!! We Win');
  
/***********  NOT SUPPORT *********************
  t.diag("Start Descend Queue Adding");
  a.length = 0;
  Utils.buildQ({x : 1}, prop, a, false);
  console.log(a.toString());
  t.is(a, '1', 'done');
  Utils.buildQ({x : 2}, prop, a, false);
  console.log(a.toString());
  t.is(a, '2,1', 'done');
  Utils.buildQ({x : 3}, prop, a, false);
  console.log(a.toString());
  t.is(a, '3,2,1', 'done');
  Utils.buildQ({x : 0}, prop, a, false);
  console.log(a.toString());
  t.is(a, '3,2,1,0', 'done');
  Utils.buildQ({x : 6}, prop, a, false);
  console.log(a.toString());
  t.is(a, '6,3,2,1,0', 'done');
  Utils.buildQ({x : 5}, prop, a, false);
  console.log(a.toString());
  t.is(a, '6,5,3,2,1,0', 'done');
  Utils.buildQ({x : 5}, prop, a, false);
  console.log(a.toString());
  t.is(a, '6,5,5,3,2,1,0', 'done');*/
  
  t.done(); // Optional, marks the correct exit point from the test
});
