;(function(ng) {
  "use strict";

  ng.module('alt.koopon.usuarios-assinante', ['ngResource'])
    .constant('_', _)
    .provider('AltKooponUsuariosDoAssinanteUrlBase', function() {
      this.URL_BASE = '/koopon-rest-api/';

      this.$get = function() {
        return this.URL_BASE;
      };
    })
    .factory('AltKooponUsuariosDoAssinanteResource', ['$resource', 'AltKooponUsuariosDoAssinanteUrlBase', function($resource, AltKooponUsuariosDoAssinanteUrlBase) {
      var _url = AltKooponUsuariosDoAssinanteUrlBase + 'usuarios/:id/:acao';
      var _params = {
        id: '@id',
        acao: '@acao'
      }
      var _methods = {
        buscar: {
          method: 'GET',
          isArray: true
        },
        convidar: {
          method: 'POST',
          params: {
            acao: 'enviar'
          }
        },
        desvincular: {
          method: 'DELETE',
          params: {
            acao: 'desvincular'
          }
        }
      }

      return $resource(_url, _params, _methods);
    }])
    .factory('AltKooponUsuariosDoAssinanteService', ['$q', 'AltKooponUsuariosDoAssinanteResource', '_', function($q, AltKooponUsuariosDoAssinanteResource, _) {
        var AltKooponUsuariosDoAssinanteService = function() {

        }

        AltKooponUsuariosDoAssinanteService.prototype.buscar = function() {
          return AltKooponUsuariosDoAssinanteResource
                  .buscar()
                  .$promise
                  .then(function(usuarios) {
                    var _usuariosUnicos = _.uniq(usuarios, 'idUsuario');

                    var _idsUnicos = _.map(_usuariosUnicos, function(usu) {
                      return usu.idUsuario;
                    });

                    _.forEach(_idsUnicos, function(id) {
                      var _emails = [];
                      var _idUsuario = undefined;

                      _.forEach(usuarios, function(usu) {
                        if (usu.idUsuario === id) {
                          _idUsuario = usu.idUsuario;
                          _emails.push(usu.emailUsuario);
                        }
                      });

                      _.filter(usuarios, {'idUsuario': _idUsuario})
                      .forEach(function(usu) {
                        usu.arrayEmails = _emails;
                      });
                    });

                    return _.uniqBy(usuarios, 'idUsuario');
                  });
        }

        AltKooponUsuariosDoAssinanteService.prototype.convidar = function(info) {
          if (!ng.isObject(info)) {
            return $q.reject(new TypeError('Informação deve ser passada para convidar um usuário.'));
          }

          return AltKooponUsuariosDoAssinanteResource.convidar(info).$promise;
        }

        AltKooponUsuariosDoAssinanteService.prototype.desvincular = function(idUsuario) {
          if (ng.isUndefined(idUsuario)) {
            return $q.reject(new TypeError('Id do usuário deve ser informado para ser desvinculado.'));
          }

          return AltKooponUsuariosDoAssinanteResource.desvincular({id: idUsuario}).$promise;
        }

        return new AltKooponUsuariosDoAssinanteService();
      }]);
}(window.angular));
