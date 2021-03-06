'use strict';

(function() {
  var dbConnectionPool = require('../../src/dbConnectionPool');
  var resetDatabase = require('../resetDatabase');
  var backend = require('../../src/backend');
  var async = require('async');
  var request = require('request');

  var theHash = 0;
  var generateHash = function () {
    return theHash;
  };

  var server = backend.init(dbConnectionPool, 8888, generateHash);

  describe('The experiments API', function () {

    beforeEach(function (done) {
      resetDatabase(function () {
       server.listen(function (err) {
          done(err);
        });
      });
    });

    afterEach(function (done) {
      server.close(function () {
        done();
      });
    });

    it('should return an experimentId when creating a new experiment', function (done) {

      var bodyData = {
        'name': 'Checkout page buttons',
        'scope': 100.0,
        'variations': [
          {
            'name': 'Group A',
            'weight': 70.0,
            'params': [
              {
                'name': 'foo',
                'value': 'bar'
              }
            ]
          },
          {
            'name': 'Group B',
            'weight': 30.0,
            'params': [
              {
                'name': 'foo',
                'value': 'baz'
              }
            ]
          }
        ]
      };

      request.post(
        {
          'url': 'http://localhost:8888/api/experiments/',
          'body': bodyData,
          'json': true,
          'headers': {
            'x-api-key': 'abcd'
          }
        },
        function (err, res, body) {
          expect(res.statusCode).toBe(200);
          expect(body.status).toEqual('success');
          expect(body.experimentId).toEqual(1);
          done(err);
        }
      );

    });

    it('should not allow to add two experiments with the same name', function (done) {

      var bodyData = {
        'name': 'Checkout page buttons',
        'scope': 100.0,
        'variations': [
          {
            'name': 'Group A',
            'weight': 70.0,
            'params': [
              {
                'name': 'foo',
                'value': 'bar'
              }
            ]
          },
          {
            'name': 'Group B',
            'weight': 30.0,
            'params': [
              {
                'name': 'foo',
                'value': 'baz'
              }
            ]
          }
        ]
      };

      request.post(
        {
          'url': 'http://localhost:8888/api/experiments/',
          'body': bodyData,
          'json': true,
          'headers': {
            'x-api-key': 'abcd'
          }
        },
        function (err, res, body) {
          request.post(
            {
              'url': 'http://localhost:8888/api/experiments/',
              'body': bodyData,
              'json': true,
              'headers': {
                'x-api-key': 'abcd'
              }
            },
            function (err, res, body) {
              expect(res.statusCode).toBe(400);
              expect(body.error.message).toEqual('Bad Request');
              expect(body.error.detail).toEqual('An experiment with this name already exists');
              done(err);
            });
        });
    });

    it('should not allow to add an experiment whose variations weights do not sum up to 100.0', function (done) {

      var bodyData = {
        'name': 'Checkout page buttons',
        'scope': 100.0,
        'variations': [
          {
            'name': 'Group A',
            'weight': 71.0,
            'params': [
              {
                'name': 'foo',
                'value': 'bar'
              }
            ]
          },
          {
            'name': 'Group B',
            'weight': 30.0,
            'params': [
              {
                'name': 'foo',
                'value': 'baz'
              }
            ]
          }
        ]
      };

      request.post(
        {
          'url': 'http://localhost:8888/api/experiments/',
          'body': bodyData,
          'json': true,
          'headers': {
            'x-api-key': 'abcd'
          }
        },
        function (err, res, body) {
          expect(res.statusCode).toBe(400);
          expect(body.error.message).toEqual('Bad Request');
          expect(body.error.detail).toEqual('The sum of the variation weights must be 100.0');
          done(err);
        }
      );

    });

    it('should not allow to add an experiment with less than 2 variations', function (done) {

      var bodyData = {
        'name': 'Checkout page buttons',
        'scope': 100.0,
        'variations': [
          {
            'name': 'Group A',
            'weight': 70.0,
            'params': [
              {
                'name': 'foo',
                'value': 'bar'
              }
            ]
          }
        ]
      };

      request.post(
        {
          'url': 'http://localhost:8888/api/experiments/',
          'body': bodyData,
          'json': true,
          'headers': {
            'x-api-key': 'abcd'
          }
        },
        function (err, res, body) {
          expect(res.statusCode).toBe(400);
          expect(body.error.message).toEqual('Bad Request');
          expect(body.error.detail).toEqual('An experiment needs at least 2 variations');
          done(err);
        }
      );

    });

    it('should not allow to add an experiment without a name', function (done) {

      var bodyData = {
        'scope': 100.0,
        'variations': [
          {
            'name': 'Group A',
            'weight': 70.0,
            'params': [
              {
                'name': 'foo',
                'value': 'bar'
              }
            ]
          },
          {
            'name': 'Group B',
            'weight': 30.0,
            'params': [
              {
                'name': 'foo',
                'value': 'baz'
              }
            ]
          }
        ]
      };

      request.post(
        {
          'url': 'http://localhost:8888/api/experiments/',
          'body': bodyData,
          'json': true,
          'headers': {
            'x-api-key': 'abcd'
          }
        },
        function (err, res, body) {
          expect(res.statusCode).toBe(400);
          expect(body.error.message).toEqual('Bad Request');
          expect(body.error.detail).toEqual('An experiment needs a name');
          done(err);
        }
      );

    });

    it('should not allow to add an experiment with an empty name', function (done) {

      var bodyData = {
        'name': '',
        'scope': 100.0,
        'variations': [
          {
            'name': 'Group A',
            'weight': 70.0,
            'params': [
              {
                'name': 'foo',
                'value': 'bar'
              }
            ]
          },
          {
            'name': 'Group B',
            'weight': 30.0,
            'params': [
              {
                'name': 'foo',
                'value': 'baz'
              }
            ]
          }
        ]
      };

      request.post(
        {
          'url': 'http://localhost:8888/api/experiments/',
          'body': bodyData,
          'json': true,
          'headers': {
            'x-api-key': 'abcd'
          }
        },
        function (err, res, body) {
          expect(res.statusCode).toBe(400);
          expect(body.error.message).toEqual('Bad Request');
          expect(body.error.detail).toEqual('The name of an experiment must not be empty');
          done(err);
        }
      );

    });

    it('should not allow to add an experiment without a scope', function (done) {

      var bodyData = {
        'name': 'Checkout page buttons',
        'variations': [
          {
            'name': 'Group A',
            'weight': 70.0,
            'params': [
              {
                'name': 'foo',
                'value': 'bar'
              }
            ]
          },
          {
            'name': 'Group B',
            'weight': 30.0,
            'params': [
              {
                'name': 'foo',
                'value': 'baz'
              }
            ]
          }
        ]
      };

      request.post(
        {
          'url': 'http://localhost:8888/api/experiments/',
          'body': bodyData,
          'json': true,
          'headers': {
            'x-api-key': 'abcd'
          }
        },
        function (err, res, body) {
          expect(res.statusCode).toBe(400);
          expect(body.error.message).toEqual('Bad Request');
          expect(body.error.detail).toEqual('An experiment needs a scope');
          done(err);
        }
      );

    });

    it('should not allow to add an experiment with a variation without a name', function (done) {

      var bodyData = {
        'name': 'Checkout page buttons',
        'scope': 100.0,
        'variations': [
          {
            'weight': 70.0,
            'params': [
              {
                'name': 'foo',
                'value': 'bar'
              }
            ]
          },
          {
            'name': 'Group B',
            'weight': 30.0,
            'params': [
              {
                'name': 'foo',
                'value': 'baz'
              }
            ]
          }
        ]
      };

      request.post(
        {
          'url': 'http://localhost:8888/api/experiments/',
          'body': bodyData,
          'json': true,
          'headers': {
            'x-api-key': 'abcd'
          }
        },
        function (err, res, body) {
          expect(res.statusCode).toBe(400);
          expect(body.error.message).toEqual('Bad Request');
          expect(body.error.detail).toEqual('Variations must have a name');
          done(err);
        }
      );

    });

    it('should not allow to add an experiment with a variation with an empty name', function (done) {

      var bodyData = {
        'name': 'Checkout page buttons',
        'scope': 100.0,
        'variations': [
          {
            'name': '',
            'weight': 70.0,
            'params': [
              {
                'name': 'foo',
                'value': 'bar'
              }
            ]
          },
          {
            'name': 'Group B',
            'weight': 30.0,
            'params': [
              {
                'name': 'foo',
                'value': 'baz'
              }
            ]
          }
        ]
      };

      request.post(
        {
          'url': 'http://localhost:8888/api/experiments/',
          'body': bodyData,
          'json': true,
          'headers': {
            'x-api-key': 'abcd'
          }
        },
        function (err, res, body) {
          expect(res.statusCode).toBe(400);
          expect(body.error.message).toEqual('Bad Request');
          expect(body.error.detail).toEqual('Variations must have a non-empty name');
          done(err);
        }
      );

    });

    it('should not allow to add an experiment with variations that have the same name', function (done) {

      var bodyData = {
        'name': 'Checkout page buttons',
        'scope': 100.0,
        'variations': [
          {
            'name': 'Group A',
            'weight': 70.0,
            'params': [
              {
                'name': 'foo',
                'value': 'bar'
              }
            ]
          },
          {
            'name': 'Group A',
            'weight': 30.0,
            'params': [
              {
                'name': 'foo',
                'value': 'baz'
              }
            ]
          }
        ]
      };

      request.post(
        {
          'url': 'http://localhost:8888/api/experiments/',
          'body': bodyData,
          'json': true,
          'headers': {
            'x-api-key': 'abcd'
          }
        },
        function (err, res, body) {
          expect(res.statusCode).toBe(500);
          expect(body.error.message).toEqual('Internal Server Error');
          done(err);
        }
      );

    });

    it('should not allow to add an experiment with a variation without params', function (done) {

      var bodyData = {
        'name': 'Checkout page buttons',
        'scope': 100.0,
        'variations': [
          {
            'name': 'Group A',
            'weight': 70.0,
            'params': [
              {
                'name': 'foo',
                'value': 'bar'
              }
            ]
          },
          {
            'name': 'Group B',
            'weight': 30.0,
          }
        ]
      };

      request.post(
        {
          'url': 'http://localhost:8888/api/experiments/',
          'body': bodyData,
          'json': true,
          'headers': {
            'x-api-key': 'abcd'
          }
        },
        function (err, res, body) {
          expect(res.statusCode).toBe(400);
          expect(body.error.message).toEqual('Bad Request');
          expect(body.error.detail).toEqual('Variation "Group B" does not have params');
          done(err);
        }
      );

    });

    it('should not allow to add an experiment with a variation with empty params', function (done) {

      var bodyData = {
        'name': 'Checkout page buttons',
        'scope': 100.0,
        'variations': [
          {
            'name': 'Group A',
            'weight': 70.0,
            'params': [
              {
                'name': 'foo',
                'value': 'bar'
              }
            ]
          },
          {
            'name': 'Group B',
            'weight': 30.0,
            'params': []
          }
        ]
      };

      request.post(
        {
          'url': 'http://localhost:8888/api/experiments/',
          'body': bodyData,
          'json': true,
          'headers': {
            'x-api-key': 'abcd'
          }
        },
        function (err, res, body) {
          expect(res.statusCode).toBe(400);
          expect(body.error.message).toEqual('Bad Request');
          expect(body.error.detail).toEqual('Variation "Group B" has empty params');
          done(err);
        }
      );

    });

    it('should not allow to add an experiment with a variation with params without name/value', function (done) {

      var bodyData = {
        'name': 'Checkout page buttons',
        'scope': 100.0,
        'variations': [
          {
            'name': 'Group A',
            'weight': 70.0,
            'params': [
              {
                'name': 'foo',
                'value': 'bar'
              }
            ]
          },
          {
            'name': 'Group B',
            'weight': 30.0,
            'params': [
              {
                '_name': 'foo',
                '_value': 'baz'
              }
            ]
          }
        ]
      };

      request.post(
        {
          'url': 'http://localhost:8888/api/experiments/',
          'body': bodyData,
          'json': true,
          'headers': {
            'x-api-key': 'abcd'
          }
        },
        function (err, res, body) {
          expect(res.statusCode).toBe(400);
          expect(body.error.message).toEqual('Bad Request');
          expect(body.error.detail).toEqual('Variation "Group B" has params without name/value');
          done(err);
        }
      );

    });

  });
})();
