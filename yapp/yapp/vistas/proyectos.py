from jsonpickle.pickler import Pickler
from jsonpickle.unpickler import Unpickler
from pyramid.response import Response
from pyramid.view import view_config
from yapp.daos.fase_dao import FaseDAO
from yapp.daos.proyecto_dao import ProyectoDAO
from yapp.daos.tipo_fase_dao import TipoFaseDAO
from yapp.daos.tipo_item_dao import TipoItemDAO
from yapp.models.fase.fase import Fase
from yapp.models.proyecto.proyecto import Proyecto
from yapp.models.fase.tipo_fase import TipoFase
import json

@view_config(route_name='readproyectos')
def read_proyectos(request):
    """
    @summary: Maneja las solicitudes para recuperar los proyectos.
    """
    
    rd = ProyectoDAO()
    entidades = rd.get_all()
    lista = [];
    p = Pickler()
    for entidad in entidades:
        lista.append(p.flatten(entidad))    
    j_string = p.flatten(lista)
    a_ret = json.dumps({'sucess': 'true', 'proyectos':j_string})
    
    return Response(a_ret)

@view_config(route_name='createproyectos')
def create_proyectos(request):
    """
    @summary: Maneja las solicitudes para crear los proyectos. El proyecto nuevo se crea
            con una fase por defecto
    """
    u= Unpickler()
    entidad = u.restore(request.json_body);
    dao = ProyectoDAO()
    nuevo_proyecto = Proyecto(entidad["_nombre"],entidad["_autor"],entidad["_prioridad"],entidad["_estado"],entidad["_lider"],entidad["_nota"],entidad["_fecha_creacion"],entidad["_fecha_modificacion"])
    dao.crear(nuevo_proyecto)
#    for i in range(0,3):
    nombre_fase = "Fase por defecto de " + entidad["_nombre"]
    orden = 1
    comentario = "Fase creada por defecto"
    estado = "Pendiente"
    color = "0"
    nueva_fase = Fase(nombre_fase, nuevo_proyecto, orden, comentario, estado,color)
    dao_fase = FaseDAO()
    dao_fase.crear(nueva_fase)
    
    dao_tipo_item = TipoItemDAO()
    tipo_item = dao_tipo_item.get_by_id(1)
    
    nuevo_tipo_fase = TipoFase(nueva_fase,tipo_item)
    dao_tipo_fase = TipoFaseDAO()
    dao_tipo_fase.crear(nuevo_tipo_fase)
    
    lista = []
    p = Pickler()
    lista.append(p.flatten(nuevo_proyecto))
    j_string = p.flatten(lista)
    a_ret = json.dumps({'sucess': 'true', 'proyectos':j_string})
    
    return Response(a_ret)

@view_config(route_name='updateproyectos')
def update_proyectos(request):
    """
    @summary: Maneja las solicitudes para actualizacion de proyectos.
    """
    u= Unpickler()
    dao = ProyectoDAO()
    entidad = u.restore(request.json_body);
    vieja = dao.get_by_id(entidad["id"])
    vieja._nombre = entidad["_nombre"]
    vieja._autor = entidad["_autor"]
    vieja._prioridad = entidad["_prioridad"]
    vieja._estado = entidad["_estado"]
    vieja._lider = entidad["_lider"]
    vieja._nota = entidad["_nota"]
    vieja._fecha_creacion = entidad["_fecha_creacion"]
    vieja._fecha_modificacion = entidad["_fecha_modificacion"]
    
    dao.update(vieja)
    return Response(json.dumps({'sucess': 'true'}))

@view_config(route_name='deleteproyectos')
def delete_proyectos(request):
    """
    @summary: Maneja las solicitudes para eliminar proyectos. Al eliminar el proyecto
        se eliman sus fases e items.
    """
    u= Unpickler()
    entidad = u.restore(request.json_body);
    dao = ProyectoDAO()
    proyecto = dao.get_by_id(entidad["id"])
    fase_dao = FaseDAO()
    fases = fase_dao.get_query().filter(Fase._proyecto_id==proyecto._id).all();
    for fase in fases:
        fase_dao.borrar(fase);
         
    dao.borrar(proyecto)
    return Response(json.dumps({'sucess': 'true'}))