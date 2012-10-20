/**
 * @author Kai Li
 * @desc this is to test mixin function in the Utils.cls.create
 */
StartTest(function(t) {
  t.diag("Iider Test start");

  t.ok(Ext, 'ExtJS is here');
  t.ok(Ext.Window, '.. indeed');

  t.ok(Utils, 'Utils is defined');
  t.ok(Iider, 'Iider Class is defined');
  
  var A_id = 'a';
  var Aexpectname  = 'ACLASSNAME';
  var A_name = Aexpectname + '#$!!@_--';
  
  var A = {
    id : A_id,
    name : A_name
  };
  
  var B_id = 'b';
  var Bexpectname  = 'BCLASSNAME';
  var B_name = Bexpectname + '#$!!@_--AD';
  var B = {
    id : B_id,
    name : B_name,
    special : '#D$D%F^G&G---___!@#$%^&*()_'
  };
  
  var normalprefix = 'root';
  var inormalprefix = '!@#!@#!$$' + normalprefix + '_)(*&^%$#@!1112345432';
  
  var aiid = Iider.get(A, ['id', 'name'], normalprefix);
  console.log("A's Iid is " + aiid);
  var expectAIid = '[' + [normalprefix, A_id, Aexpectname].join('/-') + ']';
  console.log('expect A\'s iid is ' + expectAIid);
  var exp = new RegExp(expectAIid + "{1}", 'gi');
  var result = exp.test(aiid);
  
  t.is(result, true, 'A\'s iid is correct');
  
  var biid = Iider.get(B, ['id', 'name'], inormalprefix);
  
  console.log("B's Iid is " + biid);
  
  // expect id should contain A's whold id
  var expectBIid = '[' + [aiid.replace(/-{1}/gi, '/-'), B_id, Bexpectname].join('/-') + ']';
  
  console.log('expect B\'s iid is ' + expectBIid);
  
  exp = new RegExp(expectBIid + "{1}", 'gi');
  result = exp.test(biid);
  
  t.is(result, true, 'B\'s iid is correct');
  
  t.done(); // Optional, marks the correct exit point from the test
});
