"use strict";

describe('my awesome app', function() {
  var _rootScope, _q, _httpBackend, _AltKooponUsuariosDoAssinanteService,
      _lodash, _AltKooponUsuariosDoAssinanteUrlBase;

  var URL_BASE_USUARIOS = '/koopon-rest-api/usuarios';
  var URL_BASE_USUARIOS_LISTAGEM = URL_BASE_USUARIOS;
  var URL_CONVIDAR = URL_BASE_USUARIOS + '/enviar';
  var URL_DESVINCULAR = URL_BASE_USUARIOS + '/:id:/desvincular';

  beforeEach(module('alt.koopon.usuarios-assinante'));

  beforeEach(inject(function($injector) {
    _rootScope = $injector.get('$rootScope');
    _q = $injector.get('$q');
    _httpBackend = $injector.get('$httpBackend');
    _lodash = $injector.get('_');

    _AltKooponUsuariosDoAssinanteService = $injector.get('AltKooponUsuariosDoAssinanteService');
    _AltKooponUsuariosDoAssinanteUrlBase = $injector.get('AltKooponUsuariosDoAssinanteUrlBase');
  }));

  describe('config', function() {
    it('deve ter o a url base corretamente', function() {
      expect(_AltKooponUsuariosDoAssinanteUrlBase).toEqual('/koopon-rest-api/');
    })
  })

  describe('constant', function() {
    it('deve ter o lodash definido', function() {
      expect(_lodash).toBeDefined();
    })
  })

  describe('service', function() {
    describe('criação', function() {
      it('deve retornar um objeto', function() {
        expect(typeof _AltKooponUsuariosDoAssinanteService).toBe('object');
      })
    });

    describe('buscar', function() {
      it('deve tentar buscar as informações, mas service retorna erro', function() {
        _httpBackend.expectGET(URL_BASE_USUARIOS_LISTAGEM).respond(400, {});

        _AltKooponUsuariosDoAssinanteService
        .buscar()
        .then(function(escritorios) {
          expect(true).toBe(false);
        })
        .catch(function(erro) {
          expect(erro).toBeDefined();
        });

        _rootScope.$digest();
      });

      it('deve bucar todos corretamente', function () {
        var _idAssinante = '2002';
        var _usuarios = [{nome: 'abc', idUsuario: 1}, {nome: 'cde', idUsuario: 2}];
        _httpBackend.expectGET(URL_BASE_USUARIOS_LISTAGEM).respond(200, _usuarios);

        _AltKooponUsuariosDoAssinanteService
        .buscar(_idAssinante)
        .then(function (usuarios) {
          expect(usuarios.length).toBe(2);
        })
        .catch(function() {
          expect(true).toBe(false);
        });

        _httpBackend.flush();
      })

      it('deve agrupar todos que tiverem o id igual corretamente ', function () {
        var _idAssinante = '2002';
        var _usuarios = [{nome: 'abc', idUsuario: 1, emailUsuario: 'a'}, {
          nome: 'cde',
          idUsuario: 1,
          emailUsuario: 'b'
        }];
        _httpBackend.expectGET(URL_BASE_USUARIOS_LISTAGEM).respond(200, _usuarios);

        _AltKooponUsuariosDoAssinanteService
        .buscar(_idAssinante)
        .then(function (usuarios) {
          usuarios.forEach(function (usuario) {
            expect(usuario.arrayEmails.length).toBe(2);
          })

          expect(usuarios.length).toBe(1);
        })
        .catch(function() {
          expect(true).toBe(false);
        });

        _httpBackend.flush();
      })

      it('deve agrupar todos que tiverem o id igual corretamente - mais complexo', function () {
        var _idAssinante = '2002';
        var _usuarios = [
          {nome: 'abc', idUsuario: 1, emailUsuario: 'a'},
          {nome: 'abc', idUsuario: 999, emailUsuario: 'b'},
          {nome: 'abc', idUsuario: 1, emailUsuario: 'c'},
          {nome: 'abc', idUsuario: 222, emailUsuario: 'd'},
          {nome: 'cde', idUsuario: 777, emailUsuario: 'e'},
          {nome: 'cde', idUsuario: 777, emailUsuario: 'f'}
        ];

        _httpBackend.expectGET(URL_BASE_USUARIOS_LISTAGEM).respond(200, _usuarios);

        _AltKooponUsuariosDoAssinanteService
        .buscar(_idAssinante)
        .then(function (usuarios) {
          expect(usuarios.length).toBe(4);

          expect(usuarios[0].arrayEmails.length).toBe(2);
          expect(usuarios[0].arrayEmails[0]).toBe('a');
          expect(usuarios[0].arrayEmails[1]).toBe('c');
          expect(usuarios[0].arrayEmails[2]).toBeUndefined();

          expect(usuarios[1].arrayEmails.length).toBe(1);
          expect(usuarios[1].arrayEmails[0]).toBe('b');
          expect(usuarios[1].arrayEmails[1]).toBeUndefined();

          expect(usuarios[2].arrayEmails.length).toBe(1);
          expect(usuarios[2].arrayEmails[0]).toBe('d');
          expect(usuarios[2].arrayEmails[1]).toBeUndefined();

          expect(usuarios[3].arrayEmails.length).toBe(2);
          expect(usuarios[3].arrayEmails[0]).toBe('e');
          expect(usuarios[3].arrayEmails[1]).toBe('f');
          expect(usuarios[3].arrayEmails[2]).toBeUndefined();
        })
        .catch(function() {
          expect(true).toBe(false);
        });

        _httpBackend.flush();
      });
    });

    describe('convidar', function() {
      it('não deve tentar enviar o convite, info é undefined', function() {
        var _info = undefined;

        _AltKooponUsuariosDoAssinanteService
        .convidar(_info)
        .then(function() {
          expect(true).toBe(false);
        })
        .catch(function(erro) {
          expect(erro).toBeDefined();
          expect(erro instanceof TypeError).toBe(true);
          expect(erro.message).toEqual('Informação deve ser passada para convidar um usuário.');
        });

        _rootScope.$digest();
      });

      it('não deve tentar enviar o convite, info é string', function() {
        var _info = 'abc@def.com';

        _AltKooponUsuariosDoAssinanteService
        .convidar(_info)
        .then(function() {
          expect(true).toBe(false);
        })
        .catch(function(erro) {
          expect(erro).toBeDefined();
          expect(erro instanceof TypeError).toBe(true);
          expect(erro.message).toEqual('Informação deve ser passada para convidar um usuário.');
        });

        _rootScope.$digest();
      });

      it('deve tentar enviar o convite, mas service retorna erro', function() {
        var _info = {email: 'abc@def.com'};

        _httpBackend.expectPOST(URL_CONVIDAR).respond(400, {});

        _AltKooponUsuariosDoAssinanteService
        .convidar(_info)
        .then(function() {
          expect(true).toBe(false);
        })
        .catch(function(erro) {
          expect(erro).toBeDefined();
        });

        _httpBackend.flush();
      });

      it('deve enviar o convite corretamente', function() {
        var _info = {email: 'abc@def.com'};

        _httpBackend.expectPOST(URL_CONVIDAR).respond(200);

        _AltKooponUsuariosDoAssinanteService
        .convidar(_info)
        .then(function() {
          expect(true).toBe(true);
        })
        .catch(function(erro) {
          expect(true).toBe(false);
        });

        _httpBackend.flush();
      });
    });

    describe('desvincular', function() {
      it('não deve tentar desvincular, idUsuario é undefined', function() {
        var _idUsuario = undefined;

        _AltKooponUsuariosDoAssinanteService
        .desvincular(_idUsuario)
        .then(function() {
          expect(true).toBe(false);
        })
        .catch(function(erro) {
          expect(erro).toBeDefined();
          expect(erro instanceof TypeError).toBe(true);
          expect(erro.message).toEqual('Id do usuário deve ser informado para ser desvinculado.');
        });

        _rootScope.$digest();
      });

      it('deve tentar desvincular, mas service retorna erro', function() {
        var _idUsuario = 123;

        _httpBackend.expectDELETE(URL_DESVINCULAR.replace(':id:', _idUsuario)).respond(400, {});

        _AltKooponUsuariosDoAssinanteService
        .desvincular(_idUsuario)
        .then(function() {
          expect(true).toBe(false);
        })
        .catch(function(erro) {
          expect(erro).toBeDefined();
        });

        _httpBackend.flush();
      });

      it('deve desvincular corretamente', function() {
        var _idUsuario = 123;

        _httpBackend.expectDELETE(URL_DESVINCULAR.replace(':id:', _idUsuario)).respond(200);

        _AltKooponUsuariosDoAssinanteService
        .desvincular(_idUsuario)
        .then(function() {
          expect(true).toBe(true);
        })
        .catch(function(erro) {
          expect(true).toBe(false);
        });

        _httpBackend.flush();
      });
    });
  })
});
