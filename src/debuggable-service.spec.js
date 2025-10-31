import {expect} from 'chai';
import {Service} from './service.js';
import {Debuggable} from '@e22m4u/js-debug';
import {ServiceContainer} from './service-container.js';
import {DebuggableService} from './debuggable-service.js';

describe('DebuggableService', function () {
  it('should be instantiated correctly without arguments', function () {
    const debuggableService = new DebuggableService();
    expect(debuggableService).to.be.an.instanceOf(DebuggableService);
    expect(debuggableService).to.be.an.instanceOf(Debuggable);
    expect(debuggableService.container).to.be.an.instanceOf(ServiceContainer);
  });

  it('should accept an existing ServiceContainer', function () {
    const container = new ServiceContainer();
    const debuggableService = new DebuggableService(container);
    expect(debuggableService.container).to.eq(container);
  });

  it('should inherit the static "kinds" property from Service', function () {
    expect(DebuggableService.kinds).to.eql(Service.kinds);
  });

  it('should pass options to the Debuggable constructor', function () {
    const options = {namespace: 'myNamespace'};
    const debuggableService = new DebuggableService(undefined, options);
    expect(debuggableService.debug.state.nsSegments).to.eql([
      'myNamespace',
      'debuggableService',
    ]);
  });

  describe('service method delegation', function () {
    let debuggableService;

    beforeEach(function () {
      debuggableService = new DebuggableService();
    });

    it("should delegate the 'container' getter to the internal service's container", function () {
      expect(debuggableService.container).to.eq(
        debuggableService._service.container,
      );
    });

    it("should delegate the 'getService' getter to the internal service's getService method", function () {
      expect(debuggableService.getService).to.eq(
        debuggableService._service.getService,
      );
    });

    it("should delegate the 'hasService' getter to the internal service's hasService method", function () {
      expect(debuggableService.hasService).to.eq(
        debuggableService._service.hasService,
      );
    });

    it("should delegate the 'addService' getter to the internal service's addService method", function () {
      expect(debuggableService.addService).to.eq(
        debuggableService._service.addService,
      );
    });

    it("should delegate the 'useService' getter to the internal service's useService method", function () {
      expect(debuggableService.useService).to.eq(
        debuggableService._service.useService,
      );
    });

    it("should delegate the 'setService' getter to the internal service's setService method", function () {
      expect(debuggableService.setService).to.eq(
        debuggableService._service.setService,
      );
    });

    it("should delegate the 'findService' getter to the internal service's findService method", function () {
      expect(debuggableService.findService).to.eq(
        debuggableService._service.findService,
      );
    });
  });
});
