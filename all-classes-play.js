/*
Copyright(c) 2012 Company Name
*/
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
/*

@Author : Kai Li

Copyright (c) 2012 Kai Li

Contact:  http://weibo.com/beherca

This work is to simulate the nature brain 

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

 */

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
  this.watchedNeurons = [];

  this.idCount = 0;

  this.inputs = [];

  this.outputs = [];
  
  /**
   * global g_accuracy, back to 6 decimal
   */
  this.g_accuracy = 6;

  /**
   * g_maxNeurons is the max number of neurons in current cortex
   */
  this.g_maxNeurons = 1000;
  /**
   * g_minWatchValue is the threshold for WatchedNeurons to determine whether the
   * neuron should be removed from watched list, less than this value mean that
   * neuron is in silent for a long enough time.
   */
  this.g_minWatchValue = 0.1;

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
      neuron.fire();
    }
  },

  get : function() {// return outputs
    var i = 0;
    var outputs = [];
    for (; i < this.outputs.length; i++) {
      var neuron = this.outputs[i];
      outputs.push(neuron.getNormalizedOutput());
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
    var i = 0;
    for (; i < this.watchedNeurons.length; i++) {
      var neuron = this.watchedNeurons[i];
      if(!neuron) continue;
      //check whether neuron's output meet the watching stander 
      if ((neuron.output - this.g_minWatchValue) > 0.001) {
        neuron.isWatched = false;
        this.watchedNeurons.splice(i, 1);
      } else {
        neuron.decay();
      }
    }
  },

  connect : function(soma, postSynapse, isInhibit) {
    if (soma && postSynapse) {
      var synapse = new Synapse(soma, postSynapse, isInhibit, this.g_synapseStrength);
      soma.addAxons(synapse);
      return synapse;
    } else {
      console.log("invalid soma or postSynape");
    }
  },

  destroy : function() {
    this.watchedNeurons = null;
    for ( var i = 0; i < this.neurons.length; i++) {
      this.neurons[i].destroy();
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
    this.output += synapse.getOutput();
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
      synapse.fired();
      // ###### IMPORTANT #####
      var nextNeuron = synapse.postSynapse;
      if (nextNeuron) {
        nextNeuron.compute(synapse);
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
    this.output = this.output * this.decayRate;
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
    var out = this.soma.getNormalizedOutput() * this.strength;
    return this.isInhibit ? -out : out;
  },

  destory : function() {
    this.soma = null;
  }
};

var isEmpty = function(obj) {
  return obj == null || typeof (obj) == "undefined";
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
  
  run : function(scope){
    if(scope.cortex){
      scope.cortex.updateWatch();
    }
  }
};

Ext.define('AM.view.Viewport', {
    extend: 'Ext.container.Viewport',
    layout: 'fit',
    items: [{
      xtype : 'braindashboard'
    }]
});
Ext.define('AM.model.NeuronMap', {
  extend : 'Ext.data.Model',
  //why use _id?
  idProperty : '_id',
  
  fields : [ {
    name : '_id',
    type : 'string'
  }, {
    name : 'name',
    type : 'string'
  }, {
    name : 'mapsdata',
    type : 'string'
  }, {
    name : 'updatetime',
    type : 'date'
  }, {
    name : 'archived',
    type : 'boolean'
  } ]
});
Ext.define('AM.store.NeuronMaps', {
    extend: 'Ext.data.Store',

    autoLoad: true,
    autoSync: false,
    
    fields: ['_id', 'name', 'mapsdata', 'updatetime', 'archived'],
    
    proxy: {
        type: 'rest',
        url: '/neuronmaps',
        model: 'AM.model.NeuronMap',
        reader: {
            type: 'json',
            root: 'data',
            successProperty: 'success'
        }
    }
});
Ext.define('AM.view.neuronmap.BrainCharts', {
  
  extend : 'Ext.panel.Panel',
  alias : 'widget.dbcharts',

  requires : [ 'Ext.form.*', 'Ext.data.*', 'Ext.chart.*',
      'Ext.grid.Panel', 'Ext.layout.container.Column' ],
  title : 'Brain Data',
  bodyPadding : 5,
  width : 870,
  height : 720,

  fieldDefaults : {
    labelAlign : 'left',
    msgTarget : 'side'
  },

  layout : {
    type : 'vbox',
    align : 'stretch'
  },

  initComponent : function() {
    var me = this;
    // use a renderer for values in the data view.
    function perc(v) {
      return v + '%';
    }

    var form = false, rec = false, selectedStoreItem = false,
    // performs the highlight of an item in the bar series
    selectItem = function(storeItem) {
      var name = storeItem.get('company'), series = barChart.series
          .get(0), i, items, l;

      series.highlight = true;
      series.unHighlightItem();
      series.cleanHighlights();
      for (i = 0, items = series.items, l = items.length; i < l; i++) {
        if (name == items[i].storeItem.get('company')) {
          selectedStoreItem = items[i].storeItem;
          series.highlightItem(items[i]);
          break;
        }
      }
      series.highlight = false;
    },
    // updates a record modified via the form
    updateRecord = function(rec) {
      var name, series, i, l, items, json = [ {
        'Name' : 'Price',
        'Data' : rec.get('price')
      }, {
        'Name' : 'Revenue %',
        'Data' : rec.get('revenue %')
      }, {
        'Name' : 'Growth %',
        'Data' : rec.get('growth %')
      }, {
        'Name' : 'Product %',
        'Data' : rec.get('product %')
      }, {
        'Name' : 'Market %',
        'Data' : rec.get('market %')
      } ];
      chs.loadData(json);
      selectItem(rec);
    }, createListeners = function() {
      return {
        // buffer so we don't refire while the user is still typing
        buffer : 200,
        change : function(field, newValue, oldValue, listener) {
          if (rec && form) {
            if (newValue > field.maxValue) {
              field.setValue(field.maxValue);
            } else {
              form.updateRecord(rec);
              updateRecord(rec);
            }
          }
        }
      };
    };

    // sample static data for the store
    var myData = [ [ '3m Co' ], [ 'Alcoa Inc' ],
        [ 'Altria Group Inc' ], [ 'American Express Company' ],
        [ 'American International Group, Inc.' ], [ 'AT&T Inc' ],
        [ 'Boeing Co.' ], [ 'Caterpillar Inc.' ],
        [ 'Citigroup, Inc.' ],
        [ 'E.I. du Pont de Nemours and Company' ],
        [ 'Exxon Mobil Corp' ], [ 'General Electric Company' ],
        [ 'General Motors Corporation' ], [ 'Hewlett-Packard Co' ],
        [ 'Honeywell Intl Inc' ], [ 'Intel Corporation' ],
        [ 'International Business Machines' ], [ 'Johnson & Johnson' ],
        [ 'JP Morgan & Chase & Co' ], [ 'McDonald\'s Corporation' ],
        [ 'Merck & Co., Inc.' ], [ 'Microsoft Corporation' ],
        [ 'Pfizer Inc' ], [ 'The Coca-Cola Company' ],
        [ 'The Home Depot, Inc.' ], [ 'The Procter & Gamble Company' ],
        [ 'United Technologies Corporation' ],
        [ 'Verizon Communications' ], [ 'Wal-Mart Stores, Inc.' ] ];

    for ( var i = 0, l = myData.length, rand = Math.random; i < l; i++) {
      var data = myData[i];
      data[1] = ((rand() * 10000) >> 0) / 100;
      data[2] = ((rand() * 10000) >> 0) / 100;
      data[3] = ((rand() * 10000) >> 0) / 100;
      data[4] = ((rand() * 10000) >> 0) / 100;
      data[5] = ((rand() * 10000) >> 0) / 100;
    }

    // create data store to be shared among the grid and bar series.
    var ds = Ext.create('Ext.data.ArrayStore', {
      fields : [ {
        name : 'company'
      }, {
        name : 'price',
        type : 'float'
      }, {
        name : 'revenue %',
        type : 'float'
      }, {
        name : 'growth %',
        type : 'float'
      }, {
        name : 'product %',
        type : 'float'
      }, {
        name : 'market %',
        type : 'float'
      } ],
      data : myData
    });

    // create radar dataset model.
    var chs = Ext.create('Ext.data.JsonStore', {
      fields : [ 'Name', 'Data' ],
      data : [ {
        'Name' : 'Price',
        'Data' : 100
      }, {
        'Name' : 'Revenue %',
        'Data' : 100
      }, {
        'Name' : 'Growth %',
        'Data' : 100
      }, {
        'Name' : 'Product %',
        'Data' : 100
      }, {
        'Name' : 'Market %',
        'Data' : 100
      } ]
    });

    // Radar chart will render information for a selected company in the
    // list. Selection can also be done via clicking on the bars in the
    // series.
    var radarChart = Ext.create('Ext.chart.Chart', {
      margin : '0 0 0 0',
      insetPadding : 20,
      flex : 1.2,
      animate : true,
      store : chs,
      theme : 'Blue',
      axes : [ {
        steps : 5,
        type : 'Radial',
        position : 'radial',
        maximum : 100
      } ],
      series : [ {
        type : 'radar',
        xField : 'Name',
        yField : 'Data',
        showInLegend : false,
        showMarkers : true,
        markerConfig : {
          radius : 4,
          size : 4,
          fill : 'rgb(69,109,159)'
        },
        style : {
          fill : 'rgb(194,214,240)',
          opacity : 0.5,
          'stroke-width' : 0.5
        }
      } ]
    });

    // create a grid that will list the dataset items.
    var gridPanel = Ext.create('Ext.grid.Panel', {
      id : 'company-form',
      flex : 0.60,
      store : ds,
      title : 'Company Data',

      columns : [ {
        id : 'company',
        text : 'Company',
        flex : 1,
        sortable : true,
        dataIndex : 'company'
      }, {
        text : 'Price',
        width : 75,
        sortable : true,
        dataIndex : 'price',
        align : 'right',
        renderer : 'usMoney'
      }, {
        text : 'Revenue',
        width : 75,
        sortable : true,
        align : 'right',
        dataIndex : 'revenue %',
        renderer : perc
      }, {
        text : 'Growth',
        width : 75,
        sortable : true,
        align : 'right',
        dataIndex : 'growth %',
        renderer : perc
      }, {
        text : 'Product',
        width : 75,
        sortable : true,
        align : 'right',
        dataIndex : 'product %',
        renderer : perc
      }, {
        text : 'Market',
        width : 75,
        sortable : true,
        align : 'right',
        dataIndex : 'market %',
        renderer : perc
      } ],

      listeners : {
        selectionchange : function(model, records) {
          var json, name, i, l, items, series, fields;
          if (records[0]) {
            rec = records[0];
            if (!form) {
              form = me.down('form').getForm();
              fields = form.getFields();
              fields.each(function(field) {
                if (field.name != 'company') {
                  field.setDisabled(false);
                }
              });
            } else {
              fields = form.getFields();
            }

            // prevent change events from firing
            fields.each(function(field) {
              field.suspendEvents();
            });
            form.loadRecord(rec);
            updateRecord(rec);
            fields.each(function(field) {
              field.resumeEvents();
            });
          }
        }
      }
    });

    // create a bar series to be at the top of the panel.
    var barChart = Ext
        .create(
            'Ext.chart.Chart',
            {
              flex : 1,
              shadow : true,
              animate : true,
              store : ds,
              axes : [ {
                type : 'Numeric',
                position : 'left',
                fields : [ 'price' ],
                minimum : 0,
                hidden : true
              }, {
                type : 'Category',
                position : 'bottom',
                fields : [ 'company' ],
                label : {
                  renderer : function(v) {
                    return Ext.String.ellipsis(v, 15, false);
                  },
                  font : '9px Arial',
                  rotate : {
                    degrees : 270
                  }
                }
              } ],
              series : [ {
                type : 'column',
                axis : 'left',
                highlight : true,
                style : {
                  fill : '#456d9f'
                },
                highlightCfg : {
                  fill : '#a2b5ca'
                },
                label : {
                  contrast : true,
                  display : 'insideEnd',
                  field : 'price',
                  color : '#000',
                  orientation : 'vertical',
                  'text-anchor' : 'middle'
                },
                listeners : {
                  'itemmouseup' : function(item) {
                    var series = barChart.series.get(0), index = Ext.Array
                        .indexOf(series.items, item), selectionModel = gridPanel
                        .getSelectionModel();

                    selectedStoreItem = item.storeItem;
                    selectionModel.select(index);
                  }
                },
                xField : 'name',
                yField : [ 'price' ]
              } ]
            });

    // disable highlighting by default.
    barChart.series.get(0).highlight = false;

    // add listener to (re)select bar item after sorting or refreshing
    // the
    // dataset.
    barChart.addListener('beforerefresh', (function() {
      var timer = false;
      return function() {
        clearTimeout(timer);
        if (selectedStoreItem) {
          timer = setTimeout(function() {
            selectItem(selectedStoreItem);
          }, 900);
        }
      };
    })());
    this.items = [{
      height : 200,
      layout : 'fit',
      margin : '0 0 3 0',
      items : [ barChart ]
    }, {

      layout : {
        type : 'hbox',
        align : 'stretch'
      },
      flex : 3,
      border : false,
      bodyStyle : 'background-color: transparent',

      items : [ gridPanel, {
        flex : 0.4,
        layout : {
          type : 'vbox',
          align : 'stretch'
        },
        margin : '0 0 0 5',
        title : 'Company Details',
        items : [ {
          margin : '5',
          xtype : 'fieldset',
          flex : 1,
          title : 'Company details',
          defaults : {
            width : 240,
            labelWidth : 90,
            disabled : true
          },
          defaultType : 'numberfield',
          items : [ {
            fieldLabel : 'Name',
            name : 'company',
            xtype : 'textfield'
          }, {
            fieldLabel : 'Price',
            name : 'price',
            maxValue : 100,
            minValue : 0,
            enforceMaxLength : true,
            maxLength : 5,
            listeners : createListeners('price')
          }, {
            fieldLabel : 'Revenue %',
            name : 'revenue %',
            maxValue : 100,
            minValue : 0,
            enforceMaxLength : true,
            maxLength : 5,
            listeners : createListeners('revenue %')
          }, {
            fieldLabel : 'Growth %',
            name : 'growth %',
            maxValue : 100,
            minValue : 0,
            enforceMaxLength : true,
            maxLength : 5,
            listeners : createListeners('growth %')
          }, {
            fieldLabel : 'Product %',
            name : 'product %',
            maxValue : 100,
            minValue : 0,
            enforceMaxLength : true,
            maxLength : 5,
            listeners : createListeners('product %')
          }, {
            fieldLabel : 'Market %',
            name : 'market %',
            maxValue : 100,
            minValue : 0,
            enforceMaxLength : true,
            maxLength : 5,
            listeners : createListeners('market %')
          } ]
        }, radarChart ]
      } ]
    }];
    this.callParent(arguments);
  }
});
/**
 * This is the dashboard to monitor the neurons and synapse data
 */
Ext.define('AM.view.neuronmap.BrainDashboard', {
  extend : 'Ext.window.Window',
  alias : 'widget.braindashboard',

  requires : [ 'Ext.form.Panel' ],

  title : 'Brain Dashboard',
  layout : {
    type : 'border',
    border : 2
  },
  modal : true,
  autoShow : true,
  height : 600,
  width : 900,

  defaults : {
    split : true
  },
  
  neuronsMapView : null,

  initComponent : function() {
    var me = this;
    this.items = [ {
      xtype : 'panel',
      title : 'Settings',
      region : 'west',
      collapsible : true,
      flex : 1,
      layout : {
        type : 'vbox',
        align : 'stretch'
      },
      bodyPadding : '10 10 10 10',
      fieldDefaults : {
        labelAlign : 'top',
        labelWidth : 100,
        labelStyle : 'font-weight:bold'
      },
      
      items : [{
        xtype : 'form',
        layout : {
          type : 'vbox',
          align : 'stretch'
        },
        border : false,
        bodyPadding : 10,

        fieldDefaults : {
          labelAlign : 'top',
          labelWidth : 100,
          labelStyle : 'font-weight:bold'
        },
        items :[{
          xtype : 'numberfield',
          itemId : 'intervalTime',
          fieldLabel : 'Cortex Interval Time',
          value : 500,
          step : 100,
          allowBlank : false
        },{
          xtype : 'numberfield',
          itemId : 'decayRate',
          fieldLabel : 'Neuron Decay Rate',
          value : 0.5,
          step : 0.1,
          tooltip : 'it is about the short term memory of the creature',
          allowBlank : false
        },{
          xtype : 'numberfield',
          itemId : 'step',
          fieldLabel : 'synapse strength step',
          value : 0.1,
          step : 0.1,
          tooltip : 'it is about how easy the creature would be excited',
          allowBlank : false
        }, {
          xtype : 'numberfield',
          itemId : 'decayRate',
          fieldLabel : 'World Interval Time',
          value : 300,
          step : 100,
          allowBlank : false
        }, {
          xtype : 'textfield',
          itemId : 'inputs',
          fieldLabel : 'Inputs Array',
          allowBlank : true
        }]
      }],

      buttons : [{
        text : 'Update',
        handler : function() {
          me.updateSettings();
        }
      }]
    }, {
      xtype : 'dbcharts',
      region : 'center',
      flex : 4
    }];
    this.callParent(arguments);
  },
  
  render : function(){
    var me = this;
    me.updateSettings();
    this.callParent(arguments);
  },
  
  updateSettings : function(){
    var me = this;
    var form = me.down('form').getForm();
    if (form.isValid()) {
      var vals = form.getValues();
      var txts = Object.keys(vals);
      var interval = parseFloat(vals[txts[0]]);
      var decayRate = parseFloat(vals[txts[1]]);
      var synapseStrength = parseFloat(vals[txts[2]]);
      var worldInterval = parseFloat(vals[txts[3]]);
      var inputs = '[' + vals[txts[4]] + ']';
      try{
        inputs = eval(inputs);
        if(!(inputs instanceof Array)){
          inputs = [];
        }
      }catch(e){
        console.log('Input error');
        inputs = [];
      }
      if(me.neuronsMapView){
        me.neuronsMapView.buildBrain(interval, decayRate, synapseStrength, worldInterval, inputs);
      }
    }
  }
});

STATE = {
  N : 'normal',
  /* Rollover and click */
  A : 'activated',
  /* Rollover without click */
  R : 'rollover',
  /*
   * During Dragging
   */
  D : 'drag'
};
/**
 * Internal Id for neuron and Synapse
 */
IID = {
  iid : 0,

  get : function() {
    return this.iid++;
  },
  // set offset
  set : function(offset) {
    offset++;
    this.iid = (this.iid < offset) ? offset : this.iid;
  },

  // reset to
  reset : function() {
    this.iid = 0;
  }
},

MODE = {
  NORMAL : 'normal',
  NEURON : 'neurontoolactivated',
  SYNAPSE : 'synapsetoolactivated',
  SYNAPSE_R : 'synapsereverttoolactivated',
  DELETE : 'delete',
  INPUT : 'input',
  OUTPUT : 'output'
};
/**
 * Origin Point
 */
OP = {
  x : 0,
  y : 0,
  add : function(x, y) {
    return {
      x : x,
      y : y
    };
  }
};

Utils = {
  /**
   * To get the curve path
   * 
   * @test Utils.getCurvePath({x : 0, y :0}, {x : 100, y :0}, 20, 40) "M 0 0 C 0
   *       20 30 20 50 20 S 100 20 100 0" Utils.getCurvePath({x : 0, y :0}, {x :
   *       100, y :0}, 20, 50) "M 0 0 C 0 20 25 20 50 20 S 100 20 100 0"
   *       Utils.getCurvePath({x : 0, y :0}, {x : 100, y :0}, 20, 60) "M 0 0 C 0
   *       20 20 20 50 20 S 100 20 100 0" Utils.getCurvePath({x : 0, y :0}, {x :
   *       100, y :0}, 20, 20) "M 0 0 C 0 20 40 20 50 20 S 100 20 100 0"
   *       Utils.getCurvePath({x : 0, y :0}, {x : 100, y :100}, 20, 20) "M 0 0 C
   *       0 20 40 70 50 70 S 100 70 100 100"
   * @param startP
   * @param endP
   * @param curveHeight
   * @param curveWidth
   * @returns
   */
  getCurvePath : function(startP, endP, curveHeight, curveWidth) {
    var me = this;
    var angle = me.getAngle(startP, endP, Math.PI);
    var disXY = me.getDisXY(startP, endP);
    var midPoint = {
      x : disXY / 2,
      y : curveHeight
    };
    var oringPoints = [/* P0 */OP, /* P1 */{
      x : 0,
      y : curveHeight
    },
    /* P2 */{
      x : midPoint.x - curveWidth / 2,
      y : midPoint.y
    },
    /* P3 */{
      x : midPoint.x,
      y : midPoint.y
    },
    /* P4 */{
      x : disXY,
      y : curveHeight
    }, /* P5 */OP.add(disXY, 0) ];
    var points = [];
    Ext.each(oringPoints, function(point) {
      points.push(me.rotate(point, angle, OP, startP));
    });
    var path = [ "M", points[0].x, points[0].y, "C", points[1].x, points[1].y,
        points[2].x, points[2].y, points[3].x, points[3].y, "S", points[4].x,
        points[4].y, points[5].x, points[5].y ].join(' ');
    var pathObj = {
      path : path,
      points : points
    };
    // console.log('Synapse path:'+ path);
    return pathObj;
  },

  rotate : function(point, angle, originPoint, offset) {
    offset = offset ? offset : OP;
    originPoint = originPoint ? originPoint : OP;
    var relativeX = point.x - originPoint.x;
    var relativeY = point.y - originPoint.y;
    return {
      x : relativeX * Math.cos(angle) + relativeY * Math.sin(angle) + offset.x,
      y : relativeY * Math.cos(angle) - relativeX * Math.sin(angle) + offset.y
    };
  },

  getAngle : function(startP, endP, offset) {
    var disX = this.getDisX(startP, endP);
    var disY = this.getDisY(startP, endP);
    var angle = 0;
    angle = Math.atan2(disY, -disX) + (offset > 0 ? offset : 0);
    // console.log(angle*180/3.14);
    return angle;
  },

  getDisX : function(startP, endP) {
    return endP.x - startP.x;
  },

  getDisY : function(startP, endP) {
    return endP.y - startP.y;
  },

  getDisXY : function(startP, endP) {
    var disX = this.getDisX(startP, endP);
    var disY = this.getDisY(startP, endP);
    return Math.sqrt(disX * disX + disY * disY);
  },

  /**
   * Desc : this is the util to generate triagle path
   * 
   * @param startP
   *          of angle
   * @param endP
   *          of angel
   * @param sideLength
   *          is the side length of triagle
   */
  getTriPath : function(startP, endP, sideLength) {
    var me = this;
    var pi = Math.PI;
    var angle = this.getAngle(startP, endP, pi * 0.5);// anti-clockwise 90
    // degree as offset;
    // triangle has 3 points, 1 is p0 which is origin point, p1, p2 is the rest
    var cosLengh = Math.cos(pi / 6);
    var p1 = {
      x : sideLength * 0.5,
      y : sideLength * cosLengh
    };
    var p2 = {
      x : -sideLength * 0.5,
      y : sideLength * cosLengh
    };
    var origPoints = [ OP, OP.add(p1.x, p1.y), OP.add(p2.x, p2.y) ];
    var points = [];
    Ext.each(origPoints, function(point) {
      points.push(me.rotate(point, angle, OP, startP));
    });
    var path = [ 'M', points[0].x, points[0].y, 'L', points[1].x, points[1].y,
        'L', points[2].x, points[2].y, 'z' ].join(' ');
    var pathObj = {
      path : path,
      points : points
    };
    // console.log('tri path' + path);
    return pathObj;
  }
};

Ext.define('Brain.Object', {
  mixins : {
    observable : 'Ext.util.Observable'
  },

  iid : 0,
  x : 0,
  y : 0,
  z : 0,
  // sprite than under managing
  s : null,
  //text on object
  t : null, 
  state : STATE.N,

  // svg surface component
  drawComp : null,

  constructor : function(config) {
    this.iid = Ext.isEmpty(this.iid) ? IID.get() : this.iid;
    Ext.apply(this, config);
    this.mixins.observable.constructor.call(this, config);
    this.callParent(config);
    // this.draw();
  },
  
  appendText : function(x, y){
    var me = this;
    x = (Ext.isEmpty(x) ? (me.x) : x) + 10;
    y =  Ext.isEmpty(y) ? me.y : y;
    if (!Ext.isEmpty(me.drawComp)) {
      if (Ext.isEmpty(me.t)) {
        me.t = me.drawComp.surface.add({
          type : 'text',
          text : me.iid,
          fill : 'black',
          font : '14px "Lucida Grande", Helvetica, Arial, sans-serif;',
          x : x,
          y : y,
          zIndex : 201 //one level up 
        });
      }else {
        me.t.setAttributes({
          text : me.iid,
          x : x,
          y : y
        });
      }
      me.t.redraw();
    }
  },
  
  draw : function() {
    var me = this;
    if (!Ext.isEmpty(me.drawComp)) {
      if (Ext.isEmpty(me.s)) {
        me.s = me.drawComp.surface.add({
          draggable : true,
          type : 'circle',
          fill : '#ff0000',
          radius : 10,
          x : me.x,
          y : me.y
        });
        me.registerListeners();
      } else {
        me.s.setAttributes({
          x : me.x,
          y : me.y
        });
      }
      me.s.redraw();
    }
  },

  destroy : function(){
    me.t.destroy();
    me.t = null;
  },
  
  /**
   * provide custom stringify
   * 
   * @returns
   */
  toJSON : function() {
    return JSON.stringify({
      iid : this.iid,
      x : this.x,
      y : this.y,
      z : this.z,
      state : this.state
    });
  }
});

Ext.define('Brain.Neuron', {
  extend : 'Brain.Object',

  radius : 10,

  dendrites : null,

  // persistent
  axons : null,

  groupedPreNeurons : null,

  constructor : function(config) {
    var me = this;
    Ext.apply(this, config);
    this.groupedPreNeurons = new Ext.util.HashMap();
    this.axons = new Ext.util.HashMap();
    this.dendrites = new Ext.util.HashMap();
    this.addEvents('stateChanged');
    this.callParent(config);
    this.on('stateChanged', me.updateState);
    this.draw();
  },

  draw : function() {
    var me = this;
    if (!Ext.isEmpty(me.drawComp)) {
      if (Ext.isEmpty(me.s)) {
        me.s = me.drawComp.surface.add({
          draggable : true,
          type : 'circle',
          fill : '#ff0000',
          // path : [ 'M', me.x - this.width/2, me.y - this.height - 10, 'l',
          // this.width, '0 l', -this.width/2, this.height * 0.7, 'z'].join('
          // '),
          radius : this.radius,
          x : me.x,
          y : me.y,
          zIndex : 100
        });
        me.registerListeners();
      } else {
        me.s.setAttributes({
          x : me.x,
          y : me.y
        });
      }
      me.s.redraw();
      me.appendText();
    }
  },

  registerListeners : function() {
    var me = this;
    if (Ext.isEmpty(me.s))
      return;
    // add custom method to Ext.draw.SpriteDD, after drop (actually an invalid
    // drop because there is no drop zone)
    me.s.dd.afterInvalidDrop = function(target, e, id) {
      // console.log('after drag over');
      me.updateXY();
    };
    me.s.on('mouseover', function(sprite) {
      // console.log('mouseover');
      if (me.state == STATE.N) {
        me.fireEvent('stateChanged', STATE.R, me);
      }
    });
    me.s.on('mouseout', function(sprite) {
      // console.log('mouseout');
      if (me.state == STATE.R) {
        me.fireEvent('stateChanged', STATE.N, me);
      }
    });
    me.s.on('click', function(sprite) {
      // console.log('click');
      me.fireEvent('stateChanged', STATE.A, me);
    });
  },

  updateState : function(state) {
    var me = this;
    me.state = state;
    if (state == STATE.N) {
      if (state == STATE.N) {
        me.s.setAttributes({
          fill : '#ff0000',
          stroke : 'none'
        }, true);
        me.s.redraw();
      }
    } else if (state == STATE.A || state == STATE.R) {
      me.s.setAttributes({
        fill : '#ffff00',
        stroke : '#00ff00',
        style : {
          strokeWidth : 1
        }
      }, true);
      me.s.redraw();
    }
  },

  /**
   * Add synapse as Axon
   * 
   * @param preNeuron
   * @param postNeuron
   * @returns
   */
  addAxonSynapse : function(postNeuron, mode, iid) {
    var me = this;
    var syn = Ext.create('Brain.Synapse', {
      drawComp : me.drawComp,
      preNeuron : this,
      postNeuron : postNeuron,
      isInhibit : mode == MODE.SYNAPSE_R,
      iid : iid
    });
    me.axons.add(syn.iid, syn);
    postNeuron.addDendriteSynapse(syn);
    me.updateSynapse();
    return syn;
  },

  addDendriteSynapse : function(synapse) {
    this.dendrites.add(synapse.iid, synapse);
    // neuron that has grouped synapses.
    var neuron = null;
    if (this.groupedPreNeurons.containsKey(synapse.preNeuron.iid)) {
      // neuron here is actually an array.
      neuron = this.groupedPreNeurons.get(synapse.preNeuron.iid);
      neuron.push(synapse);
    } else {
      neuron = this.groupedPreNeurons.add(synapse.preNeuron.iid, [ synapse ]);
    }
    // for performance concern, dont call updateSynapse which will update all
    // synapses in dendrite and axon
    synapse.updateLevel(neuron.length - 1);
  },

  // this remove the synapses from the array
  removeAxonSynapse : function(synapse) {
    this.axons.removeAtKey(synapse.iid);
  },
  
  removeDendriteSynapse :function(synapse){
    this.dendrites.removeAtKey(synapse.iid);
    var synapses = this.groupedPreNeurons.get(synapse.preNeuron.iid);
    synapses = Ext.Array.remove(synapses, synapse);
    this.groupedPreNeurons.replace(synapse.preNeuron.iid, synapses);
  },

  /**
   * This is called after dragging to update x y and redraw synapse
   */
  updateXY : function() {
    // console.log('update xy');
    this.x = this.s.x + this.s.attr.translation.x;
    this.y = this.s.y + this.s.attr.translation.y;
    this.appendText();
    this.updateSynapse();
  },

  updateSynapse : function() {
    var me = this;
    me.dendrites.each(function(key, value) {
      value.updateXY(true);
    });
    
    me.groupedPreNeurons.each(function(key, value) {
      var dendrites = value;
      Ext.each(dendrites, function(syn, index) {
        syn.updateLevel(index);
      });
    });

    me.axons.each(function(key, value) {
      value.updateXY();
    });
  },

  destroy : function() {
    this.dendrites.each(function(key, value) {
      value.destroy();
    });
    this.dendrites = null;
    this.axons.each(function(key, value) {
      value.destroy();
    });
    this.axons = null;
    this.groupedPreNeurons = null;
    this.s.destroy();
    this.s = null;
  },

  toJSON : function() {
    return JSON.stringify({
      iid : this.iid,
      x : this.x,
      y : this.y,
      z : this.z,
      axons : this.axons.getValues(),
      state : this.state
    });
  }
});

Ext.define('Brain.Synapse', {
  extend : 'Brain.Object',
  arrow : null,
  arrowSideLength : 10,

  preNeuron : null,

  // persistent
  postNeuron : null,

  endX : 0,
  endY : 0,
  // use for set up curve height, this level is determine by queue number in
  // where is this synapse
  level : 0,
  levelStep : 10,
  curveWidth : 20,
  
  isInhibit : false,

  constructor : function(config) {
    Ext.apply(this, config);
    this.setXY();// no draw() call ,because parent class will do
    this.callParent(config);
  },

  /**
   * Draw Synapse, will be call when initialed and redraw
   */
  draw : function() {
    var me = this;
    if (!Ext.isEmpty(me.drawComp)) {
      var sPathObj = Utils.getCurvePath(OP.add(me.x, me.y), OP.add(me.endX,
          me.endY), me.level * me.levelStep, me.curveWidth);
      var sPath = sPathObj.path;
      // [ 'M', me.x, me.y, 'Q', ((me.x + me.endX)/2 + 100), ((me.y + me.endY)/2
      // + 100), 'T', me.endX, me.endY ].join(' ');
      var arrawStartP = sPathObj.points[2]; // the curve control point
      var arrawEndP = sPathObj.points[3]; // the curve control point
      var arrowPath = Utils.getTriPath(OP.add(arrawStartP.x, arrawStartP.y), OP
          .add(arrawEndP.x, arrawEndP.y), me.arrowSideLength).path;
      if (Ext.isEmpty(me.s)) {
        me.s = this.drawComp.surface.add({
          type : 'path',
          fill : 'none',
          stroke : 'blue',
          path : sPath,
          x : me.x,
          y : me.y
        });
        me.arrow = me.drawComp.surface.add({
          type : 'path',
          fill : me.isInhibit ? '#ff' : '#ffffff',
          stroke : 'blue',
          // path : [ 'M', (me.x + me.endX) / 2, (me.y + me.endY) / 2, 'L',
          // me.endX, me.endY ].join(' '),
          path : arrowPath,
          x : (me.x + me.endX) / 2,
          y : (me.y + me.endY) / 2
        });
      } else {
        me.s.setAttributes({
          path : sPath,
          x : me.x,
          y : me.y
        });
        me.arrow.setAttributes({
          path : arrowPath,
          x : (me.x + me.endX) / 2,
          y : (me.y + me.endY) / 2
        });
      }
      me.appendText(arrawStartP.x, arrawStartP.y);
      me.s.redraw();
      me.arrow.redraw();
    }
  },

  setXY : function() {
    this.x = this.preNeuron ? this.preNeuron.x : this.x;
    this.y = this.preNeuron ? this.preNeuron.y : this.y;
    this.endX = this.postNeuron ? this.postNeuron.x : this.endX;
    this.endY = this.postNeuron ? this.postNeuron.y : this.endY;
  },

  updateXY : function(deferRender) {
    this.setXY();
    if (!deferRender){
      this.draw();
    }
  },

  updateLevel : function(index, deferRender) {
    var level = index > 0 ? (index + 1) / 2 : 0;
    this.level = index % 2 == 0 ? level : -level;
    if (!deferRender){
      this.draw();
    }
  },

  destroy : function() {
    var me = this;
    me.s.destroy();
    me.arrow.destroy();
    me.preNeuron.removeAxonSynapse(me);
    me.postNeuron.removeDendriteSynapse(me);
  },

  toJSON : function() {
    return JSON.stringify({
      iid : this.iid,
      x : this.x,
      y : this.y,
      z : this.z,
      isInhibit : this.isInhibit,
      postNeuron : {
        iid : this.postNeuron.iid
      }
    });
  }

});

Ext.define('Brain.Input', {
  extend : 'Brain.Neuron',
  
  draw : function() {
    var me = this;
    if (!Ext.isEmpty(me.drawComp)) {
      if (Ext.isEmpty(me.s)) {
        me.s = me.drawComp.surface.add({
          draggable : true,
          type : 'circle',
          fill : '#0f00ff',
          radius : me.radius,
          x : me.x,
          y : me.y,
          zIndex : 200
        });
        me.registerListeners();
      } else {
        me.s.setAttributes({
          x : me.x,
          y : me.y
        });
      }
      me.s.redraw();
      me.appendText();
    }
  },
  
  updateState : function(state) {
    var me = this;
    me.state = state;
    if (state == STATE.N) {
      if (state == STATE.N) {
        me.s.setAttributes({
          fill : '#0f00ff',
          stroke : 'none'
        }, true);
        me.s.redraw();
      }
    } else if (state == STATE.A || state == STATE.R) {
      me.s.setAttributes({
        fill : '#0f00ff',
        stroke : '#ff0000',
        style : {
          strokeWidth : 1
        }
      }, true);
      me.s.redraw();
    }
  }
});

Ext.define('Brain.Output', {
  extend : 'Brain.Neuron',

  draw : function() {
    var me = this;
    if (!Ext.isEmpty(me.drawComp)) {
      if (Ext.isEmpty(me.s)) {
        me.s = me.drawComp.surface.add({
          draggable : true,
          type : 'circle',
          fill : '#ff00ff',
          radius : me.radius,
          x : me.x,
          y : me.y,
          zIndex : 200
        });
        me.registerListeners();
      } else {
        me.s.setAttributes({
          x : me.x,
          y : me.y
        });
      }
      me.s.redraw();
      me.appendText();
    }
  },
  
  updateState : function(state) {
    var me = this;
    me.state = state;
    if (state == STATE.N) {
      if (state == STATE.N) {
        me.s.setAttributes({
          fill : '#ff00ff',
          stroke : 'none'
        }, true);
        me.s.redraw();
      }
    } else if (state == STATE.A || state == STATE.R) {
      me.s.setAttributes({
        fill : '#ff00ff',
        stroke : '#ff0000',
        style : {
          strokeWidth : 1
        }
      }, true);
      me.s.redraw();
    }
  }
});

Ext.define('AM.view.neuronmap.NeuronMap', {
  requires : [ 'Ext.data.UuidGenerator' ],
  // DOM id
  id : 'neuron-map',
  itemId : 'neuronMap',
  extend : 'Ext.panel.Panel',
  alias : 'widget.neuronmapview',

  layout : {
    type : 'border',
    border : 2
  },

  viewName : 'Neuron Map Designer',

  title : 'Untitle Map',

  mode : MODE.NORMAL,

  neurons : [],
  
  inputs : [],
  
  outputs : [],

  /** This is the neurons to be connected */
  activatedNeuron : null,
  
  // the neuron to be connected
  candidateNeuron : null,

  offset : null,

  saveWindow : null,
  
  settingWindow : null,
  
  synapseCache : [],
  
  brainRunner : null,
  
  brainTick : null,
  
  worldTick : null,

  // store: 'Users'
  initComponent : function() {
    var me = this;
    this.addEvents([ 'mapSave', 'mapListShow', 'modeChanged' ]);
    this.items = [ {
      xtype : 'toolbar',
      title : 'Brain Map Designer',
      itemId : 'brainMapMenu',
      items : [ {
        iconCls : 'show-list-btn',
        id : 'show-list-btn',
        text : 'Back to List',
        tooltip : 'Back to map list',
        listeners : {
          click : function() {
            me.fireEvent('mapListShow');
          }
        }
      }, '|', {
        iconCls : 'neuron-active-btn',
        id : 'neuron-active-btn',
        text : 'Neuron',
        tooltip : 'Active Neuron tool',
        toggleGroup : 'brainbuttons',
        listeners : {
          toggle : function(btn, pressed, opts) {
            if (pressed) {
              me.mode = MODE.NEURON;
            } else if (me.mode == MODE.NEURON) {
              me.mode = MODE.NORMAL;
            }
            me.fireEvent('modeChanged');
          }
        }
      }, {
        iconCls : 'synapse-active-btn',
        id : 'synapse-active-btn',
        text : 'Synapse',
        tooltip : 'Active Synapse tool',
        toggleGroup : 'brainbuttons',
        listeners : {
          toggle : function(btn, pressed, opts) {
            if (pressed) {
              me.mode = MODE.SYNAPSE;
            } else if (me.mode == MODE.SYNAPSE) {
              me.mode = MODE.NORMAL;
            }
            me.fireEvent('modeChanged');
          }
        }
      }, {
        iconCls : 'synapse-r-active-btn',
        id : 'synapse-r-active-btn',
        text : 'Inhibit Synapse',
        tooltip : 'Active Synapse tool',
        toggleGroup : 'brainbuttons',
        listeners : {
          toggle : function(btn, pressed, opts) {
            if (pressed) {
              me.mode = MODE.SYNAPSE_R;
            } else if (me.mode == MODE.SYNAPSE_R) {
              me.mode = MODE.NORMAL;
            }
            me.fireEvent('modeChanged');
          }
        }
      }, '|' ,{
        iconCls : 'input-btn',
        id : 'input-btn',
        text : 'Input',
        tooltip : 'Input Neuron',
        toggleGroup : 'brainbuttons',
        listeners : {
          toggle : function(btn, pressed, opts) {
            if (pressed) {
              me.mode = MODE.INPUT;
            } else if (me.mode == MODE.INPUT) {
              me.mode = MODE.NORMAL;
            }
            me.fireEvent('modeChanged');
          }
        }
      }, {
        iconCls : 'output-btn',
        id : 'output-btn',
        text : 'Output',
        tooltip : 'Output Neuron',
        toggleGroup : 'brainbuttons',
        listeners : {
          toggle : function(btn, pressed, opts) {
            if (pressed) {
              me.mode = MODE.OUTPUT;
            } else if (me.mode == MODE.OUTPUT) {
              me.mode = MODE.NORMAL;
            }
            me.fireEvent('modeChanged');
          }
        }
      }, '|' ,{
        iconCls : 'remove-btn',
        id : 'remove-btn',
        text : 'Remove',
        tooltip : 'Remove Synapse or Neuron',
        toggleGroup : 'brainbuttons',
        listeners : {
          toggle : function(btn, pressed, opts) {
            if (pressed) {
              me.mode = MODE.DELETE;
            } else if (me.mode == MODE.DELETE) {
              me.mode = MODE.NORMAL;
            }
          }
        }
      }, '->', {
        iconCls : 'run-btn',
        id : 'run-btn',
        text : 'Run',
        tooltip : 'Run Brain',
        toggleGroup : 'runbrainbtn',
        listeners : {
          toggle : function(btn, pressed, opts) {
//          console.log('save');
            if (pressed) {
              btn.setText('Stop');
              btn.setTooltip('Stop Brain');
              if (!me.settingWindow) {
                me.settingWindow = Ext.widget('braindashboard', {
                  neuronsMapView : me,
                  listeners : {
                    beforeclose : function(){
                      btn.toggle(false);
                    }
                  }
                });
                me.add(me.settingWindow);
              }
              me.settingWindow.show();
            }else{
              btn.setText('Run');
              btn.setTooltip('Run Brain');
              me.stopBrain();
            }
          }
        }
      }, {
        iconCls : 'save-btn',
        id : 'save-btn',
        text : 'Save Map',
        action : 'save',
        tooltip : 'Save the map',
        listeners : {
          click : function(btn, opts) {
//            console.log('save');
            if (!me.saveWindow) {
              var form = Ext.widget('form', {
                layout : {
                  type : 'vbox',
                  align : 'stretch'
                },
                border : false,
                bodyPadding : 10,

                fieldDefaults : {
                  labelAlign : 'top',
                  labelWidth : 100,
                  labelStyle : 'font-weight:bold'
                },
                items : [ {
                  xtype : 'textfield',
                  fieldLabel : 'Map Name',
                  allowBlank : true
                } ],

                buttons : [ {
                  text : 'Cancel',
                  handler : function() {
                    this.up('form').getForm().reset();
                    this.up('window').hide();
                  }
                }, {
                  text : 'Save',
                  handler : function() {
                    var form = this.up('form').getForm();
                    if (form.isValid()) {
                      me.fireEvent('mapSave', {
                        name : this.up('form').query('textfield')[0].value,
                        nJson : me.toJson()
                      });
                      form.reset();
                      me.saveWindow.hide();
                    }
                  }
                } ]
              });
              me.saveWindow = Ext.widget('window', {
                title : 'Save Map',
                closeAction : 'hide',
                layout : 'fit',
                resizable : true,
                modal : true,
                items : form
              });
              me.add(me.saveWindow);
            }
            me.saveWindow.show();
          }
        }
      } ],
      region : 'north',
    }, {
      xtype : 'draw',
      region : 'center',
      itemId : 'drawpanel',
      orderSpritesByZIndex : true,
      viewBox : false,
      /**
       * this is the array to store the object that get the focus usually, only
       * one get focuse, when it get focus, this can prevent user from adding
       * neuron when the mouse cusor is on existing another neuron
       */
      focusObjects : [],
      neuronmapview : this,
      listeners : {
        click : function(e, t, opts) {
          // console.log('draw panel click');
          // only happen when user click on the neruon object
          if (e.target instanceof SVGRectElement) {
            me.offset = me.offset ? me.offset : me.down('draw').getBox().y;
            if (me.mode == MODE.NEURON) {
              me.addNeuron(OP.add(e.getXY()[0], e.getXY()[1]), -me.offset);
            } else if(me.mode == MODE.SYNAPSE || me.mode == MODE.SYNAPSE_R){
              if(me.candidateNeuron){
                me.cancelConnect();
              }
              if(me.activatedNeuron){
                me.removeFocus();
              }
            }else if(me.mode == MODE.INPUT){
              me.addInput(OP.add(e.getXY()[0], e.getXY()[1]), -me.offset);
            }else if(me.mode == MODE.OUTPUT){
              me.addOutput(OP.add(e.getXY()[0], e.getXY()[1]), -me.offset);
            }
          }
        }
      }
    } ];
    this.on('modeChanged', function(){
      me.removeFocus();
      me.cancelConnect();
    });
    this.callParent(arguments);
  },

  addNeuron : function(xy, offset, iid) {
    var me = this, drawComp = me.down('draw');
    var bno = Ext.create('Brain.Neuron', {
      drawComp : drawComp,
      x : xy.x,
      y : xy.y + (offset ? offset: 0),
      iid : iid
    });
    bno.on('stateChanged' , me.neuronScHandler, this);
    this.neurons.push(bno);
    return bno;
  },
  
  neuronScHandler : function(state, neuron){
    if(state == STATE.A){//one neuron is activated
      this.updateFocus(state, neuron);
      this.manageConnect(state, neuron);
      this.removeClick(state, neuron);
    }
  },
  
  removeClick : function(state, neuron){
    var me = this;
    if(me.mode ==MODE.DELETE){//one neuron is activated
      if(me.activatedNeuron == neuron){
        me.activatedNeuron = null;
      }
      if(me.candidateNeuron == neuron){
        me.candidateNeuron = null;
      }
      if(neuron instanceof Brain.Input){
        me.inputs = Ext.Array.remove(me.inputs, neuron);
      }else if(neuron instanceof Brain.Output){
        me.outputs = Ext.Array.remove(me.outputs, neuron);
      }else {
        me.neurons = Ext.Array.remove(me.neurons, neuron);
      }
      neuron.destroy();
    }
  },
  
  updateFocus : function(state, neuron){
    var me = this;
    if(!Ext.isEmpty(me.activatedNeuron) && me.activatedNeuron != neuron){
      //change last neuron back to Normal
      me.activatedNeuron.updateState(STATE.N);
    }
    //neuron already state == Activated
    me.activatedNeuron = neuron;
  },
  
  removeFocus : function(){
    var me = this;
    if(me.activatedNeuron){
      me.activatedNeuron.updateState(STATE.N);
      me.activatedNeuron = null;
    }
  },
  
  //TODO I hate this implementation, will seperate the logic for input and output,
  // keep it simple and clean
  manageConnect : function(state, neuron){
    var me = this;
    if(me && (me.mode == MODE.SYNAPSE || me.mode == MODE.SYNAPSE_R)){
      if(!Ext.isEmpty(me.candidateNeuron) && me.candidateNeuron != neuron){
        if(!(neuron instanceof Brain.Input)){//the neuron to connect must not be input
          if( me.candidateNeuron instanceof Brain.Input  && neuron instanceof Brain.Output) {
            //input can not connect to output directly
            Ext.Msg.alert('Message', 'You can not connect input to output directly');
          }else{
            // going to connect both
            me.candidateNeuron.addAxonSynapse(neuron, me.mode);
          }
        }else{
          Ext.Msg.alert('Message', 'You can not connect neuron to Input');
        }
        me.candidateNeuron = null;
      }else if(!(neuron instanceof Brain.Output)) {//can not start connecting, reset state
        me.candidateNeuron = neuron;
      }
    }
  },
  
  cancelConnect : function(){
    this.candidateNeuron = null;
  },

  addInput : function(xy, offset, iid) {
    var me = this, drawComp = me.down('draw');
    var input = Ext.create('Brain.Input', {
      drawComp : drawComp,
      x : xy.x,
      y : xy.y + (offset ? offset: 0),
      iid : iid
    });
    input.on('stateChanged' , me.neuronScHandler, this);
    this.inputs.push(input);
    return input;
  },
  
  addOutput : function(xy, offset, iid) {
    var me = this, drawComp = me.down('draw');
    var output = Ext.create('Brain.Output', {
      drawComp : drawComp,
      x : xy.x,
      y : xy.y + (offset ? offset: 0),
      iid : iid
    });
    output.on('stateChanged' , me.neuronScHandler, this);
    this.outputs.push(output);
    return output;
  },
  
  startEngine : function(mapsdata, name) {
    this.clean();
    this.setTitle (this.viewName + ' : ' + name);
    ParseEngine(mapsdata, this.engAddN, this.engAddI, this.engAddO, this.engConnHandler, this.engFinish, this);
  },

  engAddN : function(neuron){
    //let IID has the correct offset
    IID.set(neuron.iid);
    var newNeuron = this.addNeuron(OP.add(neuron.x, neuron.y), 0, neuron.iid);
    return newNeuron;
  },
  
  engAddI : function(neuron){
    //let IID has the correct offset
    IID.set(neuron.iid);
    newNeuron = this.addInput(OP.add(neuron.x, neuron.y), 0, neuron.iid);
    return newNeuron;
  },
  
  engAddO : function(neuron){
    //let IID has the correct offset
    IID.set(neuron.iid);
    var newNeuron = this.addOutput(OP.add(neuron.x, neuron.y), 0, neuron.iid);
    return newNeuron;
  },
  
  engConnHandler : function(neuron, synapse){
    this.synapseCache.push({neuron : neuron, synapse : synapse});
  },
  
  engFinish : function(){
    //rebuild the synapse
    var me = this;
    Ext.each(me.synapseCache, function(sc){
      var results = me.findNeuron(sc.synapse.postNeuron);
      if (results && results.length > 0){
        var pn = results[0];
        IID.set(sc.synapse.iid);
        sc.neuron.addAxonSynapse(pn, sc.synapse.isInhibit ? MODE.SYNAPSE_R : MODE.SYNAPSE, sc.synapse.iid);
        //let IID has the correct offset
      }
    });
  },
  
  findNeuron : function(neuron){
    var all = this.neurons.concat(this.outputs);
    var results = Ext.Array.filter(all, function(item){
      if(item && item.iid == neuron.iid){
        return true;
      }
      return false;
    }, this);
    return results;
  },
  
  buildBrain : function(interval, decayRate, synapseStrength, worldInterval, inputs){
    var nJson = this.toJson();
    var brainBuilder = new BrainBuilder(nJson);
    brainBuilder.startEngine();
    this.worldTick = Ext.TaskManager.start({
      interval : worldInterval,
      run: function(){
        gBrain.set(inputs);
      }
    });
    this.brainTick = Ext.TaskManager.start({
      interval : interval,
      run: function(){
        brainBuilder.run(brainBuilder);
        console.log(gBrain.get());
      }
    });
  },
  
  stopBrain : function(){
    Ext.TaskManager.stop(this.worldTick);
    Ext.TaskManager.stop(this.brainTick);
  },
  
  clean : function() {
    // clean title
    this.setTitle(this.viewName);
    var drawComp = this.down('draw');
    drawComp.surface.removeAll(true);
    // destroy neurons, neuron will handle detail ifseft
    Ext.each(this.neurons, function(n) {
      n.destroy();
      n = null;
    });
    // destroy input and output, neuron will handle detail ifseft
    Ext.each(this.inputs, function(n) {
      n.destroy();
      n = null;
    });
    Ext.each(this.outputs, function(n) {
      n.destroy();
      n = null;
    });
    this.activatedNeuron = null;
    this.candidateNeuron = null;
    this.neurons = [];
    this.inputs = [];
    this.outputs = [];
    this.synapseCache = [];
    if(this.worldTick){
      Ext.TaskManager.stop(this.worldTick);
    }
    if(this.brainTick){
      Ext.TaskManager.stop(this.brainTick);
    }
    IID.reset();
  },
  
  toJson : function(){
    var me = this;
    return Ext.JSON.encode({
      inputs : me.inputs,
      outputs : me.outputs,
      neurons : me.neurons
    });
  }
});
/**
 * The Grid of maps
 */
Ext.define('AM.view.neuronmap.NeuronMapList', {
  extend : 'Ext.grid.Panel',
  alias : 'widget.neuronmaplist',
  selType : 'rowmodel',

  rowEditor : Ext.create('Ext.grid.plugin.RowEditing', {
    clicksToEdit : 2
  }),

  store : 'NeuronMaps',

  initComponent : function() {
    var me = this;
    this.addEvents([ 'mapEdit', 'mapDelete', 'mapAdd' ]);

    this.columns = [ {
      header : 'Name',
      dataIndex : 'name',
      editor : {
        xtype : 'textfield',
        allowBlank : true
      },
      width : 100
    }, {
      header : 'Map Data',
      dataIndex : 'mapsdata',
      editor : {
        xtype : 'textfield',
        allowBlank : false
      },
      flex : 10
    }, {
      header : 'Update Time',
      dataIndex : 'updatetime',
      editable : false,
      draggable : false,
      resizable : false,
      renderer : Ext.util.Format.dateRenderer('m/d/Y'),
      flex : 1
    }, {
      xtype : 'actioncolumn',
      width : 20,
      draggable : false,
      resizable : false,
      sortable : false,
      hidable : false,
      menuDisabled : true,
      items : [ {
        icon : 'images/edit.png', // Use a URL in the icon config
        flex : 1,
        tooltip : 'Edit',
        handler : function(grid, rowIndex, colIndex) {
          me.fireEvent('mapEdit', {
            rowIndex : rowIndex,
            colIndex : colIndex
          });
        }
      }]
    }, {
      xtype : 'actioncolumn',
      width : 20,
      draggable : false,
      resizable : false,
      sortable : false,
      hidable : false,
      menuDisabled : true,
      items : [{
        icon : 'images/delete.png',
        tooltip : 'Delete',
        handler : function(grid, rowIndex, colIndex) {
          me.fireEvent('mapDelete', {
            rowIndex : rowIndex,
            colIndex : colIndex
          });
        }
      }]
    }];
    this.plugins = [ this.rowEditor ];
    this.tbar = [ '->', {
      xtype : 'button',
      text : 'Add map',
      listeners : {
        click : function(e, opt) {
          me.fireEvent('mapAdd');
        }
      }
    } ], this.callParent(arguments);
  }
});

Ext.define('AM.controller.NeuronMap', {
  extend : 'Ext.app.Controller',

  models : [ 'NeuronMap' ],

  stores : [ 'NeuronMaps' ],

  view : [ 'neuronmap.NeuronMap', 'neuronmap.NeuronMapList' ],

  refs : [ {
    ref : 'list',
    selector : 'neuronmaplist'
  }, {
    ref : 'designer',
    selector : 'neuronmapview'
  } ],

  init : function() {
    console.log('NeuronMap Controller Start OK');
    this.control({
      'neuronmapview' : {
        mapSave : this.saveMap,
        mapListShow : this.listMap
      },
      'neuronmaplist' : {
        mapAdd : this.addMap,
        mapDelete : this.deleteMap,
        mapEdit : this.editMap
      }
    });
  },
  
  editMap : function(evtData){
    var designer = this.getDesigner();
    designer.show();
    var store = this.getNeuronMapsStore();
    var record = store.getAt(evtData.rowIndex);
    if(record){
      designer.startEngine(record.get('mapsdata'), record.get('name'));
    }
    this.getList().hide();
  },
  
  deleteMap : function(evtData){
    var store = this.getNeuronMapsStore();
    var record = store.getAt(evtData.rowIndex);
    if(record) {
      store.remove(record);
      store.sync();
    }
  },

  listMap : function() {
    this.getList().show();
    this.getDesigner().hide();
  },

  addMap : function() {
    this.getList().hide();
    var designer = this.getDesigner();
    designer.clean();
    designer.show();
  },

  saveMap : function(data) {
//    console.log('saving map');
    var store = this.getNeuronMapsStore();
    var nJson = data.nJson;
//    console.log(nJson);
    store.add({
      name : data.name,
      mapsdata : nJson
    });
    store.sync();
  }
});
/*
 * TODO we can use sencha sdk to generate all-class.js and app.jsb3, 
 */
//Ext.Loader.loadScript('./app/controller/NeuronMap.js');
//Ext.Loader.loadScript('./app/view/neuronmap/NeuronMap.js');
//Ext.Loader.loadScript('./app/view/Viewport.js');

//Ext.onReady(function(){
  Ext.application({
    name: 'AM',
    // automatically create an instance of AM.view.Viewport
    autoCreateViewport: true,

    controllers: [
        'NeuronMap'
    ]
});



