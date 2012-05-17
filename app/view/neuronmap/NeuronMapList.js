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
      flex : 1
    }, {
      xtype : 'actioncolumn',
      width : 150,
      draggable : false,
      resizable : false,
      items : [ {
        icon : 'images/edit.png', // Use a URL in the icon config
        tooltip : 'Edit',
        handler : function(grid, rowIndex, colIndex) {
          me.fireEvent('mapEdit', {
            rowIndex : rowIndex,
            colIndex : colIndex
          });
        }
      }, {
        icon : 'images/delete.png',
        tooltip : 'Delete',
        handler : function(grid, rowIndex, colIndex) {
          me.fireEvent('mapDelete', {
            rowIndex : rowIndex,
            colIndex : colIndex
          });
        }
      } ]
    } ];
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
