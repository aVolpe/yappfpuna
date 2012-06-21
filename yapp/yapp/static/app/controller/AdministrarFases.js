Ext.define('YAPP.controller.AdministrarFases', {
	extend: 'Ext.app.Controller',
	
	views: [
		'fase.ListarFase',
		'fase.NuevaFase', 
		'fase.NuevoAtributoFase',
		'fase.ListarAtributoFase',
		'fase.NuevoAtributoFase',
		'fase.EditarAtributoFase',
		'fase.ListarTipoFase',
		'fase.EditarFase',
		'tipoItem.Edit'
		],
	stores:['Fases', 'AtributoFase', 'TipoFase'],
	models:['Fase', 'AtributoFase'],
	
	refs: [	{
    			selector: 'listarfase gridview',
    			ref: 'grilla'
			},
			{
    			selector: 'viewport combobox[name=proyectos]',
    			ref: 'proyectos'
			},
			{
    			selector: 'editarfase textfield[name=_color]',
    			ref: 'colorTextoEditar'
			},
			{
    			selector: 'nuevafase textfield[name=_color]',
    			ref: 'colorTextoNuevo'
			},
			{
    			selector: 'listartipofase combobox',
    			ref: 'comboTipoItem'
			},

			

	],
		
	init:function(){
		console.log('Cargado controller AdministrarFases');
		this.control({
				'listarfase button[action=crear]':{
            		click: this.crearFase
            	},
            	
            	'nuevafase button[action=guardar]': {
            		click: this.guardarNuevaFase
            	},
            	
            	'listarfase': {
            		itemdblclick: this.editarFase,
            		itemclick : this.faseListSelectChange
            	},
            	
            	'editarfase button[action=guardar]': {
            		click: this.guardarEditarFase
            	},
				
				'listarfase button[action=borrar]': {
            		click: this.borrarFase
            	},
            	
            	//Atributos particulares
            	
        		'listaratributofase button[action=crear]': {
            		click: this.crearAtributo
            	},
            	
            	'nuevoatributofase button[action=guardar]': {
            		click: this.guardarNuevoAtributoFase
            	},
            	
				'listaratributofase': {
            		itemdblclick: this.editarAtributoFase
            	},
				
				
            	'editaratributofase button[action=guardar]': {
            		click: this.guardarEditarAtributoFase
            	},
            	
            	
            	'listaratributofase button[action=borrar]': {
            		click: this.borrarAtributoFase
            	},
			
            	//Tipos de items
            	
            	'listartipofase button[action=agregar]': {
            		click: this.agregarTipo
            	},
            	'listartipofase button[action=quitar]': {
            		click: this.quitarTipo
            	},
            	
            	'editarfase colorpicker': {
            		select: this.seleccionoColorEditar
            	},
            	'nuevafase colorpicker': {
            		select: this.seleccionoColorNuevo
            	},

				'listartipofase combobox[name=tipoItems]' : {
					afterrender : this.actualizarTipoItems
				},
            	
            	
        });
	},
	
	crearFase: function(button){
		var view = Ext.widget('nuevafase');
        var fase = new YAPP.model.Fase();
        		
		var cb = this.getProyectos();
		
		fase.data._proyecto_id = cb.getValue();
		fase.data._estado = "Pendiente";

		view.down('form').loadRecord(fase);
	},
	
	guardarNuevaFase: function(button){
		var win = button.up('window');
		var form = win.down('form');
		var record = form.getRecord();
		var values = form.getValues();
		record.set(values);
		var storeFases = this.getFasesStore();
		//verificamos si ya existe una fase con ese nro de orden
		var existe = storeFases.findExact('_orden', values._orden);
		var me = this;
		if(existe == -1){
			record.save({
				success: function(fase){
					me.getFasesStore().insert(me.getFasesStore().getTotalCount(),fase);
					me.getStore('Fases').sort('_orden', 'ASC');
					Ext.example.msg("YAPP", "Fase creada con éxito");
					win.close();
				},
				
				failure: function(fase){
					alert('No se pudo crear la fase');
				}
			});
			
			
		}
		else{
			alert("Existe ya una fase con ese orden");
		}		
	},
	
	editarFase: function(grid, record){
		var view = Ext.widget('editarfase');
        view.down('form').loadRecord(record);
	},
	
	guardarEditarFase: function(button){
		var win = button.up('window');
		var form = win.down('form');
		var record = form.getRecord();
		var values = form.getValues();
		
		var storeFases = this.getFasesStore();
		var existe = storeFases.findExact('_orden', values._orden);
		var me = this;
		if(existe == -1){
			//No existe el nro de orden
			record.set(values);
			record.save({
				success: function(fase){
					me.getStore('Fases').sort('_orden', 'ASC');
					Ext.example.msg("YAPP", "Cambios guardados correctamente");
					win.close();
				},
				
				failure : function(fase){
					alert("No se modifico la fase");
				}	
			});
			
			
		}else{
			var fase = storeFases.getAt(existe);
			if(fase.data.id == record.data.id)
			{
				//en caso que sea la misma fase
				record.set(values);
				record.save({
					success: function(fase){
						me.getStore('Fases').sort('_orden', 'ASC');
						Ext.example.msg("YAPP", "Cambios guardados correctamente");
						win.close();		
					},
					
					failure : function(fase){
						alert("No se modifico la fase");
					}
					
				});
				
			}
			else{
				alert("Existe ya una fase con ese orden");	
			}
		}
	},
	
	borrarFase: function(button) {
		var win = button.up('grid');
		var grilla = win.down('gridview')
		var selection = grilla.getSelectionModel().getSelection()[0];
		var me = this;
		selection.destroy({
			success: function(fase){
				me.getFasesStore().remove(selection);
				Ext.example.msg("YAPP", "Se elimino con éxito la fase");
			},
			
			failure: function(fase){
				alert("No se elimino la fase");
			}
		});
	},
	
	
	faseListSelectChange : function(grid, record) {
		//actualizamos los atributos particulares de la fase
		//y los tipos de items que soporta
		
		var store = this.getStore('AtributoFase');
		store.load({
			params: {
				id : record.get('id')
			}
		});
		
		var store2 = this.getStore('TipoFase');
		store2.load({
			params: {
				id : record.get('id')
			}
		});
		
	},
//////////////////////////////////////////////////////////////////////	
//Atributos
//////////////////////////////////////////////////////////////////////
	crearAtributo: function(button){
		//Para crear los atributos particulares de la fase
		var view = Ext.widget('nuevoatributofase');
        var atributofase = new YAPP.model.AtributoFase();
        
       	var g = this.getGrilla();
       	var selection = g.getSelectionModel().getSelection()[0];
       	
       	atributofase.data._fase_id = selection.data.id;
	
        
		view.down('form').loadRecord(atributofase);
	},
	
	
	guardarNuevoAtributoFase: function(button){
		var win = button.up('window');
		var form = win.down('form');
		var record = form.getRecord();
		var values = form.getValues();
		record.set(values);
		var me = this;
		record.save({
			success: function(atributo){
				me.getAtributoFaseStore().insert(0, atributo);
				Ext.example.msg("YAPP", "Atributo de fase creado con éxito");
				win.close();
			},
			
			failure: function(atributo){
				alert("No se pudo crear el atributo particular");
			}
		});
		

	},
	
	editarAtributoFase: function(grid, record){
		var view = Ext.widget('editaratributofase');
        view.down('form').loadRecord(record);
	},
	
	guardarEditarAtributoFase: function(button){
		var win = button.up('window');
		var form = win.down('form');
		var record = form.getRecord();
		var values = form.getValues();
		record.set(values);
		record.save({
			success: function(atributo){
				Ext.example.msg("YAPP", "Se modifico con éxito el atributo")
				win.close();
			},
			
			failure: function(atributo){
				alert("No se pudo modificar el atributo");
			}
		});
	},
	
	borrarAtributoFase: function(button) {
		var win = button.up('grid');
		var grilla = win.down('gridview')
		var selection = grilla.getSelectionModel().getSelection()[0];
		var me = this;
		selection.destroy({
			success: function(atributo){
				me.getAtributoFaseStore().remove(selection)
				Ext.example.msg("YAPP", "Atributo de fase eliminado con éxito");
			},
			failure: function(atributo){
				alert("No se pudo eliminar el atributo");
			}
		});
	},
	
//////////////////////////////////////////////////////////////////////	
//Tipos de items
//////////////////////////////////////////////////////////////////////
	agregarTipo: function(button){
		var win = button.up('grid');
		var cb = win.down('combobox');
		
		var storeTipo = cb.getStore();
		var tipo = storeTipo.findRecord('id',cb.getValue());
		
		var g = this.getGrilla();
		var fase = g.getSelectionModel().getSelection()[0];

 		var tipoFase = Ext.create('YAPP.model.TipoFase', {
    		_tipo : tipo.data.id,
    		tipo_nombre : tipo.data._nombre,
    		_fase  : fase.data.id
		});
		
		var storeTipoFase = win.getStore();
		var existe = storeTipoFase.findExact('_tipo', tipo.data.id);
		if(existe == -1){
			tipoFase.save({
				success: function(tipo){
					storeTipoFase.insert(0, tipo);
					Ext.example.msg("YAPP", "Operación exitosa");					
				},
				
				failure: function(tipo){
					alert('No se pudo agregar el tipo de item');
				}
			});
		}else{
			Ext.example.msg("YAPP", "La fase ya soporta ese tipo de ítem");
		}
		
	},
	
	quitarTipo: function(button){
		var win = button.up('grid');
		var grilla = win.down('gridview')
		var selection = grilla.getSelectionModel().getSelection()[0];
		var storeTipoFase = win.getStore()
		selection.destroy({
			success: function(tipo){
				storeTipoFase.remove(selection);
				Ext.example.msg("YAPP", "Operación exitosa");	
			},
			
			failure: function(tipo){
				alert('No se pudo realizar la operacion');
			}
			
		});
		
	},
	
	actualizarTipoItems: function(){
		//se actualizan los tipos de items despues de visualizar el combo
		var tipos = this.getStore('TipoItems');
		this.getComboTipoItem().store = tipos;
	},
	
	seleccionoColorEditar: function(picker, selColor){
		var texto = selColor;
		this.getColorTextoEditar().setValue(texto);
	},
	
	seleccionoColorNuevo: function(picker, selColor){
		var texto = selColor;
		this.getColorTextoNuevo().setValue(texto);
	}
	
});