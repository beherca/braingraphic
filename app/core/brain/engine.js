ParseEngine = function(json, addNeuron, addInput, addOutput, connectNeuron, onFinish, scope) {
  if (typeof (json) != 'string' || !addNeuron || !connectNeuron)
    return;
  var obj = null;
  try {
     obj = JSON.parse(json);
  } catch (e) {
    throw new Error('Invalid Map Json : ', e);
  }
  var neurons = obj.neurons;
  var inputs = obj.inputs;
  var outputs = obj.outputs;
  parse(neurons, addNeuron);
  parse(inputs, addInput);
  parse(outputs, addOutput);
  
  function parse (neurons, addNeuron){
    var i = 0;
    for (; i < neurons.length; i++) {
      var neuron = neurons[i];
      // the real neuron object return from implementation
      var implNeuron = addNeuron.apply(scope, [neuron]);
      if(neuron.axons && neuron.axons.length > 0){
        var k = 0;
        var axons = neuron.axons, 
        len = axons.length, synpase;
        for(;k < len; k++) {
          synpase = axons[k];
          try {
            synpase = JSON.parse(synpase);
          } catch (e) {
            throw new Error('Invalid Synapse Json : ', e);
          }
          connectNeuron.apply(scope, [implNeuron, synpase]);
        }
      }
    }
  }
  onFinish.apply(scope,[]);
};