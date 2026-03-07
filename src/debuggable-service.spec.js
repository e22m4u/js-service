/* eslint-disable chai-expect/no-inner-literal */
import {expect} from 'chai';
import {Service} from './service.js';
import {format} from '@e22m4u/js-format';
import {Debuggable} from '@e22m4u/js-debug';
import {ServiceContainer} from './service-container.js';
import {DebuggableService} from './debuggable-service.js';

describe('DebuggableService', function () {
  it('should have the static property "kinds" extended from the base class', function () {
    expect(DebuggableService.kinds).to.be.eql(Service.kinds);
  });

  describe('constructor', function () {
    it('should require the first parameter to be a correct value', function () {
      const throwable = v => () => {
        new DebuggableService(v);
      };
      const error = s =>
        format(
          'First parameter must be an Object or an instance ' +
            'of ServiceContainer, but %s was given.',
          s,
        );
      expect(throwable('str')).to.throw(error('"str"'));
      expect(throwable('')).to.throw(error('""'));
      expect(throwable(10)).to.throw(error('10'));
      expect(throwable(0)).to.throw(error('0'));
      expect(throwable(true)).to.throw(error('true'));
      expect(throwable(false)).to.throw(error('false'));
      expect(throwable([])).to.throw(error('Array'));
      expect(throwable(null)).to.throw(error('null'));
      throwable(new ServiceContainer())();
      throwable({})();
      throwable(undefined)();
    });

    it('should require the second parameter to be an Object', function () {
      const throwable = v => () => {
        new DebuggableService(undefined, v);
      };
      const error = s =>
        format('Second parameter must be an Object, but %s was given.', s);
      expect(throwable('str')).to.throw(error('"str"'));
      expect(throwable('')).to.throw(error('""'));
      expect(throwable(10)).to.throw(error('10'));
      expect(throwable(0)).to.throw(error('0'));
      expect(throwable(true)).to.throw(error('true'));
      expect(throwable(false)).to.throw(error('false'));
      expect(throwable([])).to.throw(error('Array'));
      expect(throwable(null)).to.throw(error('null'));
      throwable({})();
      throwable(undefined)();
    });

    it('should instantiate properly without arguments', function () {
      const debuggableService = new DebuggableService();
      expect(debuggableService).to.be.an.instanceOf(DebuggableService);
      expect(debuggableService).to.be.an.instanceOf(Debuggable);
      expect(debuggableService.container).to.be.an.instanceOf(ServiceContainer);
    });

    it('should use a provided ServiceContainer instance', function () {
      const container = new ServiceContainer();
      const debuggableService = new DebuggableService(container);
      expect(debuggableService.container).to.be.eq(container);
    });

    it('should pass options from the first parameter to the base constructor', function () {
      const options = {namespace: 'myNamespace'};
      const debuggableService = new DebuggableService(options);
      expect(debuggableService.debug.state.nsSegments).to.be.eql([
        'myNamespace',
        'debuggableService',
      ]);
    });

    it('should pass options from the second parameter to the base constructor', function () {
      const options = {namespace: 'myNamespace'};
      const debuggableService = new DebuggableService(undefined, options);
      expect(debuggableService.debug.state.nsSegments).to.be.eql([
        'myNamespace',
        'debuggableService',
      ]);
    });

    it('should not register the current instance in the internal container', function () {
      const service = new DebuggableService();
      expect(service.container.has(DebuggableService)).to.be.false;
    });

    describe('for an extended classes', function () {
      it('should register the current instance in the service container', function () {
        class ServiceA extends DebuggableService {}
        class ServiceB extends DebuggableService {}
        const serviceA = new ServiceA();
        expect(serviceA.container.has(ServiceA)).to.be.true;
        expect(serviceA.container.has(ServiceB)).to.be.false;
      });

      it('should register the current instance even when the options is provided to the first argument', function () {
        class ServiceA extends DebuggableService {}
        class ServiceB extends DebuggableService {}
        const serviceA = new ServiceA({namespace: 'app'});
        expect(serviceA.container.has(ServiceA)).to.be.true;
        expect(serviceA.container.has(ServiceB)).to.be.false;
      });

      it('should not register the current instance in a custom container', function () {
        class ServiceA extends DebuggableService {}
        class ServiceB extends DebuggableService {}
        const container = new ServiceContainer();
        const serviceA = new ServiceA(container);
        expect(serviceA).to.be.instanceOf(DebuggableService);
        expect(container.has(ServiceA)).to.be.false;
        expect(container.has(ServiceB)).to.be.false;
      });
    });
  });

  describe('service method delegation', function () {
    it('should delegate the "container" getter to the container of an internal service', function () {
      const S = new DebuggableService();
      expect(S.container).to.be.eq(S._service.container);
    });

    it('should delegate the "getService" method to the internal service', function () {
      const S = new DebuggableService();
      const methodName = 'getService';
      const result = 'OK';
      const testArgs = [1, 2, 3, 4, 5];
      let invoked = false;
      S._service[methodName] = function (...args) {
        expect(args).to.be.eql(testArgs);
        expect(this).to.be.eq(S._service);
        invoked = true;
        return result;
      };
      const res = S[methodName](...testArgs);
      expect(res).to.be.eq(result);
      expect(invoked).to.be.true;
    });

    it('should delegate the "getRegisteredService" method to the internal service', function () {
      const S = new DebuggableService();
      const methodName = 'getRegisteredService';
      const result = 'OK';
      const testArgs = [1, 2, 3, 4, 5];
      let invoked = false;
      S._service[methodName] = function (...args) {
        expect(args).to.be.eql(testArgs);
        expect(this).to.be.eq(S._service);
        invoked = true;
        return result;
      };
      const res = S[methodName](...testArgs);
      expect(res).to.be.eq(result);
      expect(invoked).to.be.true;
    });

    it('should delegate the "hasService" method to the internal service', function () {
      const S = new DebuggableService();
      const methodName = 'hasService';
      const result = 'OK';
      const testArgs = [1];
      let invoked = false;
      S._service[methodName] = function (...args) {
        expect(args).to.be.eql(testArgs);
        expect(this).to.be.eq(S._service);
        invoked = true;
        return result;
      };
      const res = S[methodName](...testArgs);
      expect(res).to.be.eq(result);
      expect(invoked).to.be.true;
    });

    it('should delegate the "addService" method to the internal service', function () {
      const S = new DebuggableService();
      const methodName = 'addService';
      const testArgs = [1, 2, 3, 4, 5];
      let invoked = false;
      S._service[methodName] = function (...args) {
        expect(args).to.be.eql(testArgs);
        expect(this).to.be.eq(S._service);
        invoked = true;
        return 'OK';
      };
      const res = S[methodName](...testArgs);
      expect(res).to.be.eq(S);
      expect(invoked).to.be.true;
    });

    it('should delegate the "useService" method to the internal service', function () {
      const S = new DebuggableService();
      const methodName = 'useService';
      const testArgs = [1, 2, 3, 4, 5];
      let invoked = false;
      S._service[methodName] = function (...args) {
        expect(args).to.be.eql(testArgs);
        expect(this).to.be.eq(S._service);
        invoked = true;
        return 'OK';
      };
      const res = S[methodName](...testArgs);
      expect(res).to.be.eq(S);
      expect(invoked).to.be.true;
    });

    it('should delegate the "setService" method to the internal service', function () {
      const S = new DebuggableService();
      const methodName = 'setService';
      const testArgs = [1, 2];
      let invoked = false;
      S._service[methodName] = function (...args) {
        expect(args).to.be.eql(testArgs);
        expect(this).to.be.eq(S._service);
        invoked = true;
        return 'OK';
      };
      const res = S[methodName](...testArgs);
      expect(res).to.be.eq(S);
      expect(invoked).to.be.true;
    });
  });
});
