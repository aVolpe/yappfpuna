from .models import DBSession
from pyramid.authentication import AuthTktAuthenticationPolicy
from pyramid.authorization import ACLAuthorizationPolicy
from pyramid.config import Configurator
from sqlalchemy import engine_from_config
from yapp.security import groupfinder
import os
import vistas.roles



here = os.path.dirname(os.path.abspath(__file__))

def main(global_config, **settings):
    
    authn_policy = AuthTktAuthenticationPolicy(
        'sosecret', callback=groupfinder)
    authz_policy = ACLAuthorizationPolicy()
    
    
    """ This function returns a Pyramid WSGI application.
    """
    engine = engine_from_config(settings, 'sqlalchemy.')
    DBSession.configure(bind=engine)
    config = Configurator(settings=settings,
                          root_factory='yapp.models.root_factory.RootFactory')
    config.set_authentication_policy(authn_policy)
    config.set_authorization_policy(authz_policy)
    
    config.scan()
    
    config.add_static_view('static', os.path.join(here, 'static'))
    config.add_route('main', '/main')
#   config.add_route('olvide', '/olvide')
    config.add_route('login', '/login')
    config.add_route('logout', '/logout')
    config.add_route('crearProyecto', '/crearProyecto')
    config.add_route('crearRol', '/crearRol')
    config.add_route('roles', '/roles')
    config.add_route('estados_roles', '/roles/estados')
    config.add_route('test', '/test')
    config.add_route('test2', '/test2')
#    config.scan("views")

    return config.make_wsgi_app()


