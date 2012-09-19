StartTest(function(t) {
    t.diag("Brain");

    t.ok(Ext, 'ExtJS is here');
    t.ok(Ext.Window, '.. indeed');

    t.ok(Neuron, 'Neuron is defined');

    t.done();   // Optional, marks the correct exit point from the test
});