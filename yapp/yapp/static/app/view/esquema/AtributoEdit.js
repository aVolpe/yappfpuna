var formulario = Ext.define('YAPP.view.esquema.AtributoEdit', {
	extend : 'Ext.window.Window',
	alias : 'widget.atributoesquemaedit',
	
	title : 'Editar Atributo Esquema',
	layout : 'fit',
	autoShow : true,
	stores : [ 'AtributoEsquema' ],
	
	initComponent : function() {
		this.items = [ {
			xtype : 'form',
			items : [ form_atributo_esquema ]
		} ];
		
		this.buttons = [  {
			text : 'Guardar',
			action : 'guardarAtributo'
		}, {
			text : 'Cancel',
			scope : this,
			handler : this.close
		} ];
		
		this.callParent(arguments);
	}

});
var form_atributo_esquema = {
	xtype : 'fieldset',
	title : 'Atributo Esquema',
	items : [ {
		xtype : 'textfield',
		name : '_nombre',
		fieldLabel : 'Nombre',
		allowBlank : false
	},{
		xtype : 'textfield',
		name : '_tipo',
		fieldLabel : 'Tipo',
		allowBlank : false
	},{
		xtype : 'textfield',
		name : '_valor',
		fieldLabel : 'Valor',
	},{
		xtype : 'textfield',
		name : '_descripcion',
		fieldLabel : 'Descripcion',
		allowBlank : false
	}, ] 
};
