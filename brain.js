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
 * g_maxNeurons is the max number of neurons in current cortex
 */
var g_maxNeurons = 1000;
/**
 * g_minWatchValue is the threshold for WatchedNeurons to determine whether the
 * neuron should be removed from watched list, less than this value mean that
 * neuron is in silent for a long enough time.
 */
var g_g_minWatchValue = 0.1;


/**
 * Neuron Act like a differentiator, multi-synapses as inputs, and
 * multi-synapses as output
 * 
 * @returns
 */
var Neuron = function() {
  /*default id as null, DO NOT CHANGE THIS */
  this.id = null;
  this.output = 0;
  this.axons = [];
  this.threshold = 1;
  /*This decay Rate is for multiple output, output will be decay in a fixed time */
  this.decayRate = 0.5; 
  this.isWatched = false;
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
var Synapse = function(soma, postSynapse) {
  this.soma = soma;
  this.postSynapse = postSynapse;
  /*
   * initial strength is 0.1 when this synapse fired, this variable will be
   * strengthen by adding 0.01(TBD), but always less than 1,
   * in neurosciences, strength is controlled by postSynapse, strength should not be the property of 
   * axon's synapse's property, however, to simple the implementation, I put it here
   */
  this.strength = 0.1;
  this.isInhibiting = false;
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
  forget : function(){
    
  }
};

var MotorCortex = function() {
};
/**
 * The basal ganglia are thus thought to facilitate movement by channelling
 * information from various regions of the cortex to the supplementary motor
 * area (SMA) The basal ganglia may also act as a filter, blocking the execution
 * of movements that are unsuited to the situation
 * in computer, it is a engine that drive all action of living thing. 
 * it will check all neurons in motor cortex in certain interval (TBD, but must greater than cortex loop)
 * and only those fired neurons will allow to invoke actions. 
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

/**
 * this is a array that pool all inputs, like cortex in the brain, which ship
 * all neurons, there will be cortexs for different level.
 * 
 * @returns
 */
var Cortex = {
  /**
   * all neurons
   */
  neurons : [],
  /**
   * this is watched neurons, watched neurons refers to the neuron that with compute() once called
   * we will loop through this array to update the
   * decay output, update interval would be 1/30 s(TBD) the neuron which has
   * output as 0 will be remove from this array, because it is inactivated
   */
  watchedNeurons : [],
  
  idCount : 0, 
  
  addNeuron : function(){
    var neuron = new Neuron();
    neuron.id = this.idCount++;
    this.neurons.push(neuron);
    return neuron;
  },
  
  addNeurons : function(numofNeurons) {
    if(numofNeurons && numofNeurons > 0 && numofNeurons < (g_maxNeurons - this.neurons.length)){
      var i = 0;
      for(; i < numofNeurons; i++){
        this.addNeuron();
      }
      return this.neurons;
    }else {
      console.log('invalid neuron numbers');
    }
  },
  
  /**
   * this function is called by new activated neuron, which will register itself
   */
  addWatch : function(neuron) {
    if (neuron.id!=null && neuron.id < g_maxNeurons
        && !this.watchedNeurons[neuron.id]) {
      this.watchedNeurons[neuron.id] = neuron;
    }
  },

  /**
   * this function will be call periods to exclude the silent neurons the
   * interval is TBD
   */
  updateWatch : function() {
    var i = 0;
    for (; i < this.watchedNeurons.length; i++) {
      var neuron = this.watchedNeurons[i];
      if (!neuron.stillExcited()) {
        neuron.isWatched = false;
        this.watchedNeurons[neuron.id] = null;
      } else {
        neuron.decay();
      }
    }
  },
  
  connect : function(soma, postSynapse){
    if(soma && postSynapse){
      var synapse = new Synapse(soma, postSynapse);
      soma.addAxons(synapse);
      return synapse;
    }else{
      console.log("invalid soma or postSynape");
    }
  }
};

Neuron.prototype = {
  compute : function(synapse) {
    // once call, means that this should be watched
    if(!this.isWatched){
      this.isWatched = true;
      Cortex.addWatch(this);
    }
    this.output += synapse.getOutput();
    if (this.output > this.threshold) {// if the sum is bigger than threshold
      this.fire();
    }
  },
  
  addAxons : function(synapse){
    this.axons.push(synapse);
  },

  fire : function() {
    var i = 0;
    for (; i < this.axons.length; i++) {
      var synapse = this.axons[i];
      // ###### IMPORTANT #####
      // synapse strength will be strength since soma fired
      synapse.fired();
      // ###### IMPORTANT #####
      var nextNeuron = synapse.postSynapse;
      if (nextNeuron) {
        nextNeuron.compute(synapse);
      }
    }
  },

  stillExcited : function() {
    return (this.output - g_minWatchValue) > 0.001;
  },
  
  getNormalizedOutput : function() {
    return this.output > this.threshold ? 1 : 0;
  },
  
  /**
   * this will slow the activity of neuron, simulate the water drop of neuron
   */ 
  decay : function() {
    this.output = this.output * this.decayRate;
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
    var out = this.soma.getNormalizedOutput() * this.strength;
    return this.isInhibiting ? -out : out;
  }
};