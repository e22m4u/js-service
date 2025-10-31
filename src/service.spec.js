import {expect} from 'chai';
import {Service} from './service.js';
import {SERVICE_CLASS_NAME} from './service.js';
import {ServiceContainer} from './service-container.js';
import {SERVICE_CONTAINER_CLASS_NAME} from './service-container.js';

describe('Service', function () {
  it('should expose static property "kinds"', function () {
    expect(Service.kinds).to.be.eql([SERVICE_CLASS_NAME]);
    const MyService = class extends Service {};
    expect(MyService.kinds).to.be.eql([SERVICE_CLASS_NAME]);
  });

  describe('constructor', function () {
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
      const res = service.addService(Date, 'foo', 'bar', 'baz');
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
      const res = service.addService(Date, date);
      expect(res).to.be.eq(service);
    });
  });
});
