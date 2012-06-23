Ext.define('YAPP.controller.LineasBase', {
	extend : 'Ext.app.Controller',
	views : [ 'linea_base.Edit' ],
	models : [ 'LineaBase', 'Item' ],
	stores : [ 'LineasBase', 'Item', 'Fases' ],
	refs : [ {
		selector : 'lineabaseedit gridpanel[name=firstGrid]',
		ref : 'firstGrid'
	}, {
		selector : 'lineabaseedit gridpanel[name=secondGrid]',
		ref : 'secondGrid'
	}, {
		selector : 'viewport combobox[name=proyectos]',
		ref : 'proyectos'
	}, {
		selector : 'lineasbaseabm grid[name=gridItems]',
		ref : 'gridItems'
	}, {
		selector : 'viewport combobox[name=fases]',
		ref : 'comboFase'
	} ],
	
	init : function() {
		this.control({
			'lineasbaselist' : {
				// itemdblclick : this.editUser,
				itemclick : this.lineaBaseClick,
				render : this.onRender
			},
			'lineasbaselist button[action=crear]' : {
				click : this.botonCrearApretado
			},
			'lineasbaselist button[action=borrar]' : {
				click : this.botonBorrarApretado
			},
			'viewport combobox[name=fases]' : {
				change : this.changeFase
			},
			'lineabaseedit button[action=guardar]' : {
				click : this.botonEditGuardarApretado
			},
		});
	},
	lineaBaseClick : function(grid, record) {
		// var store = this.getGridItems().getStore();
		var store = this.getItemStore();
		store.load({
			params : {
				id_linea_base : record.get('id')
			}
		});
	},
	botonCrearApretado : function(button) {
		nuevaLineaBase = new YAPP.model.LineaBase();
		this.ventanaLineaBase(nuevaLineaBase);
	},
	ventanaLineaBase : function(record) {
		var view = Ext.widget('lineabaseedit');
		if (record != null)
			view.down('form').loadRecord(record);
		var grid1 = this.getFirstGrid();
		var grid2 = this.getSecondGrid();
		grid2.store.removeAll();
		var combo = this.getComboFase();
		var store = grid1.store;
		store.autoSync = false;
		store.load({
			params : {
				id : combo.getValue(),
				linea_base : "false"
			}
		});
	},
	onRender : function() {
		var combo = this.getComboFase();
		var store = this.getFasesStore();
		var object = this.getProyectos().getValue();
		if (object == '') {
			return;
		}
		combo.store = store;
		store.load({
			params : {
				id : object
			}
		});
	},
	changeFase : function(object, newValue, oldValue, eOpts) {
		var store = this.getLineasBaseStore();
		var fase = this.getComboFase();
		if (fase.getValue() != null){
			store.load({
				params : {
					id : fase.getValue()
				}
			});
		}
	},
	botonEditGuardarApretado : function(button) {
		var win = button.up('window');
		var form = win.down('form');
		var record = form.getRecord();
		var values = form.getValues();
		var grid2 = this.getSecondGrid();
		record.set(values);
		
		if (grid2.store.count() == 0) {
			alert("Seleccione al menos un item para la linea base");
			return;
		}
		var fase = this.getComboFase();
		var items = grid2.store.getRange();
		
		var itemsDTO = new Array();
		for ( var i in items) {
			itemsDTO[i] = items[i].data.id;
		}
		record.data._items = itemsDTO;
		record.data._fase = fase.getValue()
		// console.log(record)
		var store = this.getLineasBaseStore()
		win.close();
		record.save({
			success : function(linea_base) {
				store.insert(0, linea_base);
				Ext.example.msg("Linea Base", "Creada con exito");
			},
			failure : function(linea_base) {
				alert("No se pudo crear la linea base");
			}
		});
	},
	botonBorrarApretado : function(button) {
		var win = button.up('grid');
		var grilla = win.down('gridview')
		var selection = grilla.getSelectionModel().getSelection()[0];
		var store = this.getLineasBaseStore();
		var me = this;
		selection.destroy({
			success : function(linea_base) {
				Ext.example.msg("Linea Base", "Eliminada con exito");
				store.remove(selection);
				var store2 = me.getItemStore();
				store2.removeAll();
			},
			failure : function(linea_base) {
				alert("No se pudo eliminar la linea base");
			}
		});
	}
});
