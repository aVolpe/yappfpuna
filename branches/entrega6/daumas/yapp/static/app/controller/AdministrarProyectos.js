Ext.define('YAPP.controller.AdministrarProyectos', {
	extend: 'Ext.app.Controller',
	
	views: [
		'proyecto.ListarProyecto',
		'proyecto.NuevoProyecto',
		'proyecto.EditarProyecto'
		],
	stores:['Proyectos'],
	models:['Proyecto'],
	
	refs : [ 	{
                	selector : 'editarproyecto combobox[name=_autor]',
                	ref : 'comboAutor'
        		},
        		{
                	selector : 'editarproyecto combobox[name=_lider]',
                	ref : 'comboLider'
        		}
        	],
	
	init:function(){
		this.control({			
        
				'listarproyecto button[action=crear]': {
                	click: this.crearProyecto
            	},
            	
            	'listarproyecto button[action=borrar]' : {
					click : this.borrarProyecto
				},
            	
            	'listarproyecto': {
            		itemdblclick: this.editarProyecto
            	},
            	
            	'nuevoproyecto button[action=guardar]': {
            		click: this.guardarNuevoProyecto
            	},
            	
            	'editarproyecto button[action=guardar]': {
            		click: this.guardarEditarProyecto
            	}
            	
        });
	},
	
	crearProyecto: function(){
		var view = Ext.widget('nuevoproyecto');
        var proyecto = new YAPP.model.Proyecto();
		
		proyecto.data._estado = "Elaboración";
		var fecha = new Date();
		var hoy = Ext.Date.format(fecha,'Y-m-d, g:i a');
		proyecto.data._fecha_creacion = hoy;
		proyecto.data._fecha_modificacion = hoy;
		
		view.down('form').loadRecord(proyecto);  
	},
	
	editarProyecto: function(grid, record){
		var view = Ext.widget('editarproyecto');
		var fecha = new Date();
		var hoy = Ext.Date.format(fecha,'Y-m-d, g:i a');
		record.data._fecha_modificacion = hoy;
        view.down('form').loadRecord(record);
        var cb1 = this.getComboAutor().setValue(record.data._autor_id);
        var cb2 = this.getComboLider().setValue(record.data._lider_id);
	},
	
	
	borrarProyecto: function(button) {
		var win = button.up('grid');
		var grilla = win.down('gridview')
		var selection = grilla.getSelectionModel().getSelection()[0];
		var me = this;
		selection.destroy({
			success: function(proyecto){
				me.getProyectosStore().remove(selection)
				Ext.example.msg("YAPP", "Proyecto eliminado exitosamente");
			},
			
			failure: function(proyecto){
				alert("No se elimino el proyecto");
			}
		});
	},	
	
	guardarEditarProyecto: function(button){
		var win = button.up('window');
		var form = win.down('form');
		var record = form.getRecord();
		var values = form.getValues();
		record.set(values);
		var cb1 = this.getComboAutor();
		var cb2 = this.getComboLider();
		record.data._autor_id = cb1.getValue();
		record.data._lider_id = cb2.getValue();
		record.save({
			success: function(proyecto){
				Ext.example.msg("YAPP", "Cambios guardados correctamente");
				win.close();				
			},
			
			failure: function(proyector){
				alert("No se modifico el proyecto");
			}
		});
		
		
	},
	
	guardarNuevoProyecto: function(button){
		var win = button.up('window');
		var form = win.down('form');
		var record = form.getRecord();
		var values = form.getValues();
		record.set(values);
		record.set('_autor_id',record.data._autor);
		record.set('_lider_id',record.data._lider);
		var me = this;
	
		record.save({
			success: function(proyecto){
				me.getProyectosStore().insert(me.getProyectosStore().getCount(),proyecto);
				win.close();
				Ext.example.msg("YAPP", "Proyecto creado con éxito");
			},
			
			failure: function(proyecto){
				alert("No se pudo crear el proyecto");
			}
		});	
		
		
		
	}
	
});