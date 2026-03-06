import {expect} from 'chai';
import {format} from '@e22m4u/js-format';
import {Service, SERVICE_CLASS_NAME} from './service.js';

import {
  ServiceContainer,
  SERVICE_CONTAINER_CLASS_NAME,
} from './service-container.js';

describe('Service', function () {
  it('should expose static property "kinds"', function () {
    expect(Service.kinds).to.be.eql([SERVICE_CLASS_NAME]);
    const MyService = class extends Service {};
    expect(MyService.kinds).to.be.eql([SERVICE_CLASS_NAME]);
  });

  describe('constructor', function () {
    it('should require the parameter "container" to be an instance of ServiceContainer', function () {
      const throwable = v => () => {
        new Service(v);
      };
      const error = s =>
        format(
          'Parameter "container" must be an instance ' +
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
      expect(throwable({})).to.throw(error('Object'));
      expect(throwable(null)).to.throw(error('null'));
      throwable(new ServiceContainer())();
      throwable(undefined)();
    });

    it('should instantiate with a services container', function () {
      const service = new Service();
      expect(service.container).to.be.instanceof(ServiceContainer);
    });

    it('should set a given service container', function () {
      const container = new ServiceContainer();
      const service = new Service(container);
      expect(service.container).to.be.eq(container);
    });

    it('should set a given object as service container by the kinds property', function () {
      class MyServiceContainer {
        static kinds = [SERVICE_CONTAINER_CLASS_NAME];
      }
      const container = new MyServiceContainer();
      const service = new Service(container);
      expect(service.container).to.be.eq(container);
    });

    it('should not register the current instance in the internal container', function () {
      const service = new Service();
      expect(service.container.has(Service)).to.be.false;
    });

    describe('for an extended classes', function () {
      it('should register the current instance in the internal container', function () {
        class ServiceA extends Service {}
        class ServiceB extends Service {}
        const serviceA = new ServiceA();
        expect(serviceA.container.has(ServiceA)).to.be.true;
        expect(serviceA.container.has(ServiceB)).to.be.false;
      });

      it('should not register the current instance in a custom container', function () {
        class ServiceA extends Service {}
        class ServiceB extends Service {}
        const container = new ServiceContainer();
        const serviceA = new ServiceA(container);
        expect(serviceA).to.be.instanceOf(ServiceA);
        expect(container.has(ServiceA)).to.be.false;
        expect(container.has(ServiceB)).to.be.false;
      });
    });
  });

  describe('getService', function () {
    it('should call the container "get" method', function () {
      const service = new Service();
      service.container.get = function (ctor, ...args) {
        expect(ctor).to.be.eq(Date);
        expect(args).to.be.eql(['foo', 'bar', 'baz']);
        return 'OK';
      };
      const res = service.getService(Date, 'foo', 'bar', 'baz');
      expect(res).to.be.eq('OK');
    });
  });

  describe('getRegisteredService', function () {
    it('should call the container "getRegisteredService" method', function () {
      const service = new Service();
      service.container.getRegistered = function (ctor, ...args) {
        expect(ctor).to.be.eq(Date);
        expect(args).to.be.eql(['foo', 'bar', 'baz']);
        return 'OK';
      };
      const res = service.getRegisteredService(Date, 'foo', 'bar', 'baz');
      expect(res).to.be.eq('OK');
    });
  });

  describe('hasService', function () {
    it('should call the container "has" method', function () {
      const service = new Service();
      service.container.has = function (ctor) {
        expect(ctor).to.be.eq(Date);
        return 'OK';
      };
      const res = service.hasService(Date);
      expect(res).to.be.eq('OK');
    });
  });

  describe('addService', function () {
    it('should call the container "add" method', function () {
      const service = new Service();
      service.container.add = function (ctor, ...args) {
        expect(ctor).to.be.eq(Date);
        expect(args).to.be.eql(['foo', 'bar', 'baz']);
      };
      const res = service.addService(Date, 'foo', 'bar', 'baz');
      expect(res).to.be.eq(service);
    });
  });

  describe('useService', function () {
    it('should call the container "use" method', function () {
      const service = new Service();
      service.container.use = function (ctor, ...args) {
        expect(ctor).to.be.eq(Date);
        expect(args).to.be.eql(['foo', 'bar', 'baz']);
      };
      const res = service.useService(Date, 'foo', 'bar', 'baz');
      expect(res).to.be.eq(service);
    });
  });

  describe('setService', function () {
    it('should call the container "set" method', function () {
      const service = new Service();
      const date = new Date();
      service.container.set = function (ctor, input) {
        expect(ctor).to.be.eq(Date);
        expect(input).to.be.eq(date);
      };
      const res = service.setService(Date, date);
      expect(res).to.be.eq(service);
    });
  });

  describe('findService', function () {
    it('should call the container "find" method', function () {
      const service = new Service();
      const predicate = () => true;
      const noParent = true;
      service.container.find = function (arg1, arg2) {
        expect(predicate).to.be.eq(arg1);
        expect(noParent).to.be.eq(arg2);
        return 'OK';
      };
      const res = service.findService(predicate, noParent);
      expect(res).to.be.eq('OK');
    });
  });
});
