import {expect} from 'chai';
import {Service} from './service.js';
import {ServiceContainer} from './service-container.js';

describe('Service', function () {
  it('exposes kind getter', function () {
    const service = new Service();
    expect(service.kind).to.be.eq('Service');
    expect(Service.prototype.kind).to.be.eq('Service');
  });

  describe('constructor', function () {
    it('instantiates with a services container', function () {
      const service = new Service();
      expect(service.container).to.be.instanceof(ServiceContainer);
    });

    it('sets a given service container', function () {
      const container = new ServiceContainer();
      const service = new Service(container);
      expect(service.container).to.be.eq(container);
    });
  });

  describe('getService', function () {
    it('calls the container "get" method', function () {
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

  describe('hasService', function () {
    it('calls the container "has" method', function () {
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
    it('calls the container "add" method', function () {
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
    it('calls the container "use" method', function () {
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
    it('calls the container "set" method', function () {
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
