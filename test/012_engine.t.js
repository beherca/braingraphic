StartTest(function(t) {
    t.diag("Brain");

    t.ok(Ext, 'ExtJS is here');
    t.ok(Ext.Window, '.. indeed');

    t.ok(ParseEngine, 'ParseEngine is defined');
//    var nJson = '[{"iid":0,"x":436,"y":76,"z":0}]';
//    this.axonNumber =0;
//    this.synapseNumber = 0;
//    ParseEngine(nJson, this.addNeuronHandler, this.addSynapseHandler, function(){
//      console.log('done');
//    }, this
//    );
//    this.addNeuronHandler = function(neuron){
//      this.axonNumber += 1;
//    };
//    this.addSynapseHandler = function(neuron, synapse){
//      this.synapseNumber += 1;
//    };
//    t.diag("Number of neurons");
//    t.is(this.axonNumber, 1, '1 at total');
//    t.is(this.synapseNumber, 1, '1 at total');

    t.done();   // Optional, marks the correct exit point from the test
});