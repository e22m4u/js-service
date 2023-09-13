import chai from 'chai';
import {expect} from 'chai';
import {Service} from './service.js';
import {ServiceContainer} from './service-container.js';
const {spy} = chai;

describe('Service', function () {
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
      spy.on(service.container, 'get', (ctor, ...args) => {
        expect(ctor).to.be.eq(Date);
        expect(args).to.be.eql(['foo', 'bar', 'baz']);
        return 'OK';
      });
      const res = service.getService(Date, 'foo', 'bar', 'baz');
      expect(res).to.be.eq('OK');
    });
  });

  describe('hasService', function () {
    it('calls the container "has" method', function () {
      const service = new Service();
      spy.on(service.container, 'has', ctor => {
        expect(ctor).to.be.eq(Date);
        return 'OK';
      });
      const res = service.hasService(Date);
      expect(res).to.be.eq('OK');
    });
  });

  describe('addService', function () {
    it('calls the container "add" method', function () {
      const service = new Service();
      spy.on(service.container, 'add', (ctor, ...args) => {
        expect(ctor).to.be.eq(Date);
        expect(args).to.be.eql(['foo', 'bar', 'baz']);
      });
      const res = service.addService(Date, 'foo', 'bar', 'baz');
      expect(res).to.be.eq(service);
    });
  });
});
