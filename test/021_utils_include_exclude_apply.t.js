/**
 * @author Kai Li
 * @desc this is to test mixin function in the Utils.cls.create
 */
StartTest(function(t) {
  t.diag("Iider Test start");

  t.ok(Ext, 'ExtJS is here');
  t.ok(Ext.Window, '.. indeed');

  t.ok(Utils, 'Utils is defined');
  t.ok(Utils.include, 'Include is ready');
  t.ok(Utils.exclude, 'Exclude is ready');
  
  t.diag("Test Include");
  var cpfrom = {
    a : 1,
    b : 2,
    c : 3,
    d : 4
  };
  var includeCopyto = {};
  var excludeCopyto = {};
  var includes = ['a', 'b'];
  var excludes = ['c', 'd'];
  
  Utils.include(includeCopyto, cpfrom, {include : includes});
  Utils.exclude(excludeCopyto, cpfrom, {exclude : excludes});
  
  for(var key in includeCopyto){
    if(includes.indexOf(key) >= 0){
      t.is(includeCopyto.hasOwnProperty(key), true, 'target has property ' + key + ' in which is the includes list');
    }
    else{
      t.is(includeCopyto.hasOwnProperty(key), false, 'target has no property ' + key + ' in which is not the includes list');
    }
  }
  
  for(var key in excludeCopyto){
    if(excludes.indexOf(key) >= 0){
      t.is(excludeCopyto.hasOwnProperty(key), false, 'target has no property ' + key + ' in which is the exludes list');
    }
    else{
      t.is(excludeCopyto.hasOwnProperty(key), true, 'target has property ' + key + ' in which is not the exludes list');
    }
  }
  
  t.done(); // Optional, marks the correct exit point from the test
});
