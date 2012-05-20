ParseEngine = function(json, addNeuron, connectNeuron, scope) {
  if (typeof (json) != 'string' || !addNeuron || !connectNeuron)
    return;
  var neurons = '';
  try {
    neurons = JSON.parse(json);
  } catch (e) {
    throw new Error('Invalid Map Json : ', e);
  }
  var i = 0;
  for (; i < neurons.length; i++) {
    var neuron = neurons[i];
    addNeuron.apply(scope, [neuron]);
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
        connectNeuron.apply(scope, [synpase]);
      }
    }
  }
};