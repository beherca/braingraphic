StartTest(function(t) {
    t.diag("Test Cortex function including add, connect neuron");

    t.ok(Neuron, 'Neuron is defined');
    t.ok(Cortex, 'Cortex is defined');
    t.ok(Synapse, 'Cortex is defined');

    t.diag("Create first neuron");
    var neuron = Cortex.addNeuron();
    t.ok(neuron, 'neuron created');
    t.is(neuron.id, 0, 'initial neuron id is 0');
    
    t.diag("Create sec neuron");
    var sec_n = Cortex.addNeuron();
    t.ok(sec_n, 'neuron created');
    t.is(sec_n.id, 1, 'second neuron id is 1');
    
    t.diag("Connect both neuron");
    var s = Cortex.connect(neuron, sec_n);//connect() return synapse
    t.ok(s, 'synapse is created');
    t.ok(s.soma, 'soma is added');
    t.ok(s.postSynapse, 'postSynapse is added');
    
    t.diag("Check the neurons after Connect");
    t.isGreater(neuron.axons.length, 0, 'neuron\'s axons should be greater than 0 after connect');
    
    t.diag("set up the output of first neuron, and test the value train");
    //staticInput is a special neuron, for setting the output convinient
    var staticInput = new Neuron();
    var inputValue = 2;
    staticInput.output = inputValue;
    var synapse1 = Cortex.connect(staticInput, neuron);
    neuron.compute(synapse1);
    // 1.5 * 0.1, 0.1 is default strength of synapse
    t.is(neuron.output.toFixed(3), 0.1, 'neuron\'s output after compute');
    t.is(Cortex.watchedNeurons.length, 1, 'number of watched neurons should be 1 after compute, because sec_n is not activated');
    
    neuron.compute(synapse1);
    t.is(Cortex.watchedNeurons.length, 1, 'number of watched neurons should be still 1 after dual compute() call');
    t.is(neuron.getNormalizedOutput(), 0, 'no output ,should be 0');
    
    t.diag("Sitimulation comming twice, need to compute again. but the input is not strong enough to activate the neuron, so do not enhance the synapse strength");
    t.is(neuron.axons[0].strength, 0.1, 'Synapse connection strength has not been enhance.');
    
    t.diag("test neuron's  cache, new comming input will be added to last decay output");
    neuron.compute(synapse1);
    t.is(neuron.output.toFixed(3), 0.3, 'neuron\'s output should be equal to after 3 times compute accumulate');
    t.is(neuron.getNormalizedOutput(), 0, 'no output ,should be 0');
    
    t.diag("Test Neuron fire, and synapse strength should be updated");
    var i = 0;
    for(;i < 8; i ++){//accuracy concern, compute one more time to get rid of it
      neuron.compute(synapse1);
    }
    console.log(neuron.getNormalizedOutput());
    console.log(sec_n.output);
    t.is(neuron.output.toFixed(3), 1.1, 'neuron\'s output should be equal to 1 after 10 times compute accumulate');
    t.is(neuron.getNormalizedOutput(), 1, 'fired and output is 1');
    
    t.is(sec_n.output.toFixed(3), 0.11, "second neuron has the value");
    
    t.diag('test neuron decay');
    neuron.decay();
    console.log(neuron.output);
    t.isLess(neuron.output, 1, 'would be less than one');
    t.isLess(neuron.getNormalizedOutput(), 1, 'obviously, not activated');
    
    t.done();   // Optional, marks the correct exit point from the test
});