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
  
  t.diag("Test Include && Exclude suite");
  var cpfrom = {
    a : 1,
    b : 2,
    c : 3,
    d : 4,
    _d : 5,
    _e : 6,
    e : null,
    f : undefined,
    g : 0, 
    h : [2, 3]
  };
  
  t.diag("Test Include Array");
  var includeCopyto = {};
  var includes = ['a', 'b'];
  Utils.include(includeCopyto, cpfrom, {includes : includes});
  for(var key in cpfrom){
    if(includes.indexOf(key) >= 0 && cpfrom[key] != null){
      t.is(includeCopyto.hasOwnProperty(key), true, 'target has property ' + key);
    }
    else{
      t.is(includeCopyto.hasOwnProperty(key), false, 'target has NO!!!! property ' + key);
    }
  }
  
  t.diag("Test Include Array with option excludeEmpty = false");
  includeCopyto = {};
  includes = ['a', 'b', 'e', 'f', 'g'];
  Utils.include(includeCopyto, cpfrom, {includes : includes, excludeEmpty : false});
  for(var key in cpfrom){
    if(includes.indexOf(key) >= 0 || cpfrom[key] == null){
      t.is(includeCopyto.hasOwnProperty(key), true, 'target has property ' + key);
    }
    else{
      t.is(includeCopyto.hasOwnProperty(key), false, 'target has NO!!!! property ' + key);
    }
  }
  
  t.diag("Test Exclude Array");
  var excludeCopyto = {};
  var excludes = ['c', 'd'];
  Utils.exclude(excludeCopyto, cpfrom, {excludes : excludes});
  for(var key in cpfrom){
    if(excludes.indexOf(key) >= 0 || cpfrom[key] == null/*default to exclude all */){
      t.is(excludeCopyto.hasOwnProperty(key), false, 'target has NO!!!! property ' + key);
    }
    else{
      t.is(excludeCopyto.hasOwnProperty(key), true, 'target has property ' + key);
    }
  }
  
  t.diag("Test Include Regular Expression");
  includeCopyto = {};
  var regx = /^_/g;
  Utils.include(includeCopyto, cpfrom, {regx : regx});
  for(var key in cpfrom){
    if(regx.test(key)){
      t.is(includeCopyto.hasOwnProperty(key), true, 'target has property ' + key);
    }else{
      t.is(includeCopyto.hasOwnProperty(key), false, 'target has NO!!!! property ' + key);
    }
  }
  
  t.diag("Test Exclude Regular Expression");
  excludeCopyto = {};
  Utils.exclude(excludeCopyto, cpfrom, {regx : regx});
  for(var key in cpfrom){
    if(regx.test(key) || cpfrom[key] == null){
      t.is(excludeCopyto.hasOwnProperty(key), false, 'target has NO!!!! property ' + key);
    }
    else{
      t.is(excludeCopyto.hasOwnProperty(key), true, 'target has property ' + key);
    }
  }
  
  t.diag("Test Exclude Regular Expression with option excludeEmpty = false");
  excludeCopyto = {};
  Utils.exclude(excludeCopyto, cpfrom, {regx : regx, excludeEmpty : false});
  for(var key in cpfrom){
    if(regx.test(key)){
      t.is(excludeCopyto.hasOwnProperty(key), false, 'target has NO!!!! property ' + key);
    }
    else{
      t.is(excludeCopyto.hasOwnProperty(key), true, 'target has property ' + key);
    }
  }
  
  t.done(); // Optional, marks the correct exit point from the test
});
