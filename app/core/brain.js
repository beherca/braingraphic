/*

@Author : Kai Li

Copyright (c) 2012 Kai Li

Contact:  http://weibo.com/beherca

This work is to simulate the nature brain 

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

 */

  /**
   * global g_accuracy, back to 6 decimal
   */
  var g_accuracy = 6;
  
/**
 * Neuron Act like a differentiator, multi-synapses as inputs, and
 * multi-synapses as output
 * 
 * @returns
 */
var Neuron = function(iid, decayRate) {
  /* default id as null, DO NOT CHANGE THIS */
  this.iid = isEmpty(iid)? 0 : iid;
  this.output = 0;
  this.axons = [];
  this.threshold = 1;
  /*
   * This decay Rate is for multiple output, output will be decay in a fixed
   * time
   */
  this.decayRate = isEmpty(decayRate) ? 0.5 : decayRate;
  this.isWatched = false;
  
  /*
   * cortex
   */
  this.cortex = null;
};
/**
 * Synapse is the connection between two neuron
 * 
 * @param soma
 *          is where the synapse from
 * @param postSynapse
 *          is where the synapse to
 * @returns
 */
var Synapse = function(soma, postSynapse, isInhibit, strength) {
  this.iid = 0;
  this.soma = soma;
  this.postSynapse = postSynapse;
  /*
   * initial strength is 0.1 when this synapse fired, this variable will be
   * strengthen by adding 0.01(TBD), but always less than 1, in neurosciences,
   * strength is controlled by postSynapse, strength should not be the property
   * of axon's synapse's property, however, to simple the implementation, I put
   * it here
   * functionally, it means that whether this creature is easy to exited 
   */
  this.strength = strength;
  this.isInhibit = isInhibit;
};

/**
 * this is a array that pool all inputs, like cortex in the brain, which ship
 * all neurons, there will be cortexs for different level.
 * 
 * @returns
 */
var Cortex = function() {
  /**
   * all neurons
   */
  this.neurons = [];
  /**
   * this is watched neurons, watched neurons refers to the neuron that with
   * compute() once called we will loop through this array to update the decay
   * output, update interval would be 1/30 s(TBD) the neuron which has output as
   * 0 will be remove from this array, because it is inactivated
   */
  this.watchedNeurons = {};

  this.idCount = 0;

  this.inputs = [];

  this.outputs = [];
  
  /**
   * g_maxNeurons is the max number of neurons in current cortex
   */
  this.g_maxNeurons = 1000;
  /**
   * g_minWatchValue is the threshold for WatchedNeurons to determine whether the
   * neuron should be removed from watched list, less than this value mean that
   * neuron is in silent for a long enough time.
   */
  this.g_minWatchValue = 1/Math.pow(10, g_accuracy);

  /**
   * g_decayRate is rate to decay the activity of neurons
   */
  this.g_decayRate = 0.5;
  
  /**
   * for detail, please check out the description in Synapse Object
   */
  this.g_synapseStrength = 0.1;

};

/**
 * Hippocampus will loop through neurons within cortex and find the most
 * activated neurons and link them
 * 
 * @param
 * @returns
 */
var Hippocampus = function() {

};

/**
 * Sleep will reduce the strength of synapse connections
 * 
 * @returns
 */
var Sleep = {
  forget : function() {

  }
};

var MotorCortex = function() {
};
/**
 * The basal ganglia are thus thought to facilitate movement by channelling
 * information from various regions of the cortex to the supplementary motor
 * area (SMA) The basal ganglia may also act as a filter, blocking the execution
 * of movements that are unsuited to the situation in computer, it is a engine
 * that drive all action of living thing. it will check all neurons in motor
 * cortex in certain interval (TBD, but must greater than cortex loop) and only
 * those fired neurons will allow to invoke actions.
 */
var BasalGanglia = function() {
};

/**
 * Engine is used to loop the activated neuron, we will never loop through all
 * neuron, only those activated.
 * 
 * @returns
 */
var Engine = {
  go : function(neuron) {
    neuron.compute();// compute will handle compute the input and determine
    // whether to fire
  }
};

Cortex.prototype = {
  addNeuron : function(iid) {
    iid = isEmpty(iid) ? this.idCount++ : iid;
    var neuron = new Neuron(iid, this.g_decayRate);
    neuron.cortex = this;
    this.neurons.push(neuron);
    return neuron;
  },

  addInput : function(iid) {
    var neuron = this.addNeuron(iid);
    this.inputs.push(neuron);
    return neuron;
  },

  addOutput : function(iid) {
    var neuron = this.addNeuron(iid);
    this.outputs.push(neuron);
    return neuron;
  },

  set : function(inputs) {// inputs
    var i = 0;
    var len = this.inputs.length > inputs.length ? inputs.length
        : this.inputs.length;
    for (; i < len; i++) {
      var neuron = this.inputs[i];
      neuron.output = inputs[i];
      neuron.fire.call(neuron);
    }
  },

  get : function() {// return outputs
    var i = 0;
    var outputs = [];
    for (; i < this.outputs.length; i++) {
      var neuron = this.outputs[i];
      outputs.push(neuron.getNormalizedOutput.call(neuron));
    }
    return outputs;
  },

  addNeurons : function(numofNeurons) {
    if (numofNeurons && numofNeurons > 0
        && numofNeurons < (this.g_maxNeurons - this.neurons.length)) {
      var i = 0;
      for (; i < numofNeurons; i++) {
        this.addNeuron();
      }
      return this.neurons;
    } else {
      console.log('invalid neuron numbers');
    }
  },

  /**
   * this function is called by new activated neuron, which will register itself
   */
  addWatch : function(neuron) {
    if (neuron.iid != null && neuron.iid < this.g_maxNeurons
        && !this.watchedNeurons[neuron.iid]) {
      this.watchedNeurons[neuron.iid] = neuron;
      return true;
    }
    return null;
  },

  /**
   * this function will be call periods to exclude the silent neurons the
   * interval is TBD
   */
  updateWatch : function() {
    for (var key in this.watchedNeurons) {
      var neuron = this.watchedNeurons[key];
      if(!neuron) continue;
      //check whether neuron's output meet the watching stander 
      if (((neuron.output > 0 ? neuron.output : -neuron.output) - this.g_minWatchValue) < 0) {
        neuron.isWatched = false;
        delete this.watchedNeurons[key];
      } else {
        neuron.decay();
      }
    }
  },

  connect : function(soma, postSynapse, isInhibit) {
    if (soma && postSynapse) {
      var synapse = new Synapse(soma, postSynapse, isInhibit, this.g_synapseStrength);
      soma.addAxons.call(soma, synapse);
      return synapse;
    } else {
      console.log("invalid soma or postSynape");
    }
  },

  destroy : function() {
    this.watchedNeurons = null;
    for ( var i = 0; i < this.neurons.length; i++) {
      var n =this.neurons[i];
      n.destroy.call(n);
    }
    this.neurons = null;
    this.inputs = null;
    this.outputs = null;
  }
};

Neuron.prototype = {
  compute : function(synapse) {
    // once call, means that this should be watched
    if (!this.isWatched) {
      this.isWatched = this.cortex.addWatch(this);
    }
    this.output = round(synapse.getOutput.call(synapse) + this.output, g_accuracy);
    if (this.output > this.threshold) {// if the sum is bigger than threshold
      this.fire();
    }
  },

  addAxons : function(synapse) {
    this.axons.push(synapse);
  },

  fire : function() {
    var i = 0;
    for (; i < this.axons.length; i++) {
      var synapse = this.axons[i];
      // ###### IMPORTANT #####
      // synapse strength will be strength since soma fired
      synapse.fired.call(synapse);
      // ###### IMPORTANT #####
      var nextNeuron = synapse.postSynapse;
      if (nextNeuron) {
        nextNeuron.compute.call(nextNeuron, synapse);
      }
    }
  },

  getNormalizedOutput : function() {
    return this.output > this.threshold ? 1 : 0;
  },

  /**
   * this will slow the activity of neuron, simulate the water drop of neuron
   */
  decay : function() {
    this.output = round(this.output * this.decayRate, g_accuracy);
  },

  destory : function() {
    for ( var i = 0; i < this.axons.length; i++) {
      this.axons[i].destroy();
    }
    this.axons = null;
  }
};

Synapse.prototype = {
  // the strength will be improved since it is fired
  fired : function() {
    this.strength += 0.01;
  },

  // get output of this synapse, this represent that all output are from soma
  // immediatly
  // no latency.
  getOutput : function() {
    var out = round(this.soma.getNormalizedOutput.call(this.soma) * this.strength, g_accuracy);
    return this.isInhibit ? -out : out;
  },

  destory : function() {
    this.soma = null;
  }
};

var isEmpty = function(obj) {
  return obj == null || typeof (obj) == "undefined";
};

var round = function(value, accuracy){
  var e = Math.pow(10, accuracy);
  var v = (parseInt (value * e))/e;
  if((v > 0 && v < 1/e) || (v < 0 && v > -1/e)){
    v = 0;
  }
  return v;
};

var BrainBuilder = function(mapsdata) {
  this.synapseCache = [];
  this.cortex = null;
  this.mapsdata = mapsdata;
};
var gBrain = {
  cortex : null, // cortex instance

  set : function(inputs) {
    if (isEmpty(this.cortex)) {
      return null;
    }
    if (!isEmpty(arguments)) {
      this.cortex.set(inputs);
    }
  },

  get : function() {
    if (isEmpty(this.cortex)) {
      return null;
    }
    return this.cortex.get();
  }
};

BrainBuilder.prototype = {
  startEngine : function() {
    this.cortex = new Cortex();
    gBrain.cortex = this.cortex;// explore the cortex for global access
    ParseEngine(this.mapsdata, this.engAddN, this.engAddI, this.engAddO,
        this.engConnHandler, this.engFinish, this);
  },

  engAddN : function(neuron) {
    var newNeuron = this.cortex.addNeuron(neuron.iid);
    return newNeuron;
  },

  engAddI : function(neuron) {
    var newNeuron = this.cortex.addInput(neuron.iid);
    return newNeuron;
  },

  engAddO : function(neuron) {
    var newNeuron = this.cortex.addOutput(neuron.iid);
    return newNeuron;
  },

  engConnHandler : function(neuron, synapse) {
    this.synapseCache.push({
      neuron : neuron,
      synapse : synapse
    });
  },

  engFinish : function() {
    // rebuild the synapse
    var i = 0;
    var gsp = {};// grouped Synapse By PostNeuron iid
    for (; i < this.synapseCache.length; i++) {
      var sc = this.synapseCache[i];
      if (isEmpty(gsp[sc.synapse.postNeuron.iid])) {
        gsp[sc.synapse.postNeuron.iid] = [ sc ];
      } else {
        gsp[sc.synapse.postNeuron.iid].push(sc);
      }
    }
    for ( var iid in gsp) {
      var pn = this.findNeuron(iid); // post neuron
      if(pn){
        var snCachedObjs = gsp[iid]; // cached object in the synapseCache
        var k = 0;
        for (; k < snCachedObjs.length; k++) {
          var sco = snCachedObjs[k];
          var soma = sco.neuron; // pre synapse neuron, which is soma
          var sobj = sco.synapse;
          var s = this.cortex.connect(soma, pn, sobj.isInhibit);
          s.iid = sobj.iid;
        }
      }
    }
  },

  findNeuron : function(iid) {
    var i = 0;
    var neurons = this.cortex.neurons;
    for (; i < neurons.length; i++) {
      var n = neurons[i];
      if (n.iid == iid) {
        return n;
      }
    }
    return null;
  },
  
  run : function(){
    this.cortex.updateWatch.apply(this.cortex);
  }
};
