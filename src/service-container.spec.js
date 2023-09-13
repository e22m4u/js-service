import {expect} from 'chai';
import {Service} from './service.js';
import {format} from '@e22m4u/format';
import {ServiceContainer} from './service-container.js';

describe('ServiceContainer', function () {
  describe('get', function () {
    it('throws an error if no constructor given', function () {
      const container = new ServiceContainer();
      const throwable = v => () => container.get(v);
      const error = v =>
        format(
          'The first argument of ServicesContainer.get must be ' +
            'a class constructor, but %s given.',
          v,
        );
      expect(throwable('str')).to.throw(error('"str"'));
      expect(throwable(10)).to.throw(error('10'));
      expect(throwable(true)).to.throw(error('true'));
      expect(throwable(false)).to.throw(error('false'));
      expect(throwable(undefined)).to.throw(error('undefined'));
      expect(throwable(null)).to.throw(error('null'));
      expect(throwable([])).to.throw(error('Array'));
      expect(throwable({})).to.throw(error('Object'));
    });

    describe('Service', function () {
      it('passes itself and given arguments to the given constructor', function () {
        let executed = 0;
        let givenContainer;
        let givenArgs;
        class MyService extends Service {
          constructor(container, ...args) {
            super(container);
            executed++;
            givenContainer = container;
            givenArgs = args;
          }
        }
        const container = new ServiceContainer();
        const service = container.get(MyService, 'foo', 'bar');
        expect(service).to.be.instanceof(MyService);
        expect(executed).to.be.eq(1);
        expect(givenContainer).to.be.eq(container);
        expect(givenArgs).to.be.eql(['foo', 'bar']);
      });

      it('instantiates from an existing factory function', function () {
        let executed = 0;
        let givenContainer;
        let givenArgs;
        class MyService extends Service {
          constructor(container, ...args) {
            super(container);
            executed++;
            givenContainer = container;
            givenArgs = args;
          }
        }
        const container = new ServiceContainer();
        container.add(MyService, 'foo', 'bar');
        expect(executed).to.be.eq(0);
        const service = container.get(MyService);
        expect(service).to.be.instanceof(MyService);
        expect(executed).to.be.eq(1);
        expect(givenContainer).to.be.eq(container);
        expect(givenArgs).to.be.eql(['foo', 'bar']);
      });

      it('overrides an existing factory function', function () {
        let executed = 0;
        let givenContainer;
        let givenArgs;
        class MyService extends Service {
          constructor(container, ...args) {
            super(container);
            executed++;
            givenContainer = container;
            givenArgs = args;
          }
        }
        const container = new ServiceContainer();
        container.add(MyService, 'foo', 'bar');
        expect(executed).to.be.eq(0);
        const service = container.get(MyService, 'baz', 'qux');
        expect(service).to.be.instanceof(MyService);
        expect(executed).to.be.eq(1);
        expect(givenContainer).to.be.eq(container);
        expect(givenArgs).to.be.eql(['baz', 'qux']);
      });

      it('caches a new instance', function () {
        let executed = 0;
        class MyService extends Service {
          constructor(container) {
            super(container);
            ++executed;
          }
        }
        const container = new ServiceContainer();
        const myService1 = container.get(MyService);
        const myService2 = container.get(MyService);
        expect(myService1).to.be.instanceof(MyService);
        expect(myService2).to.be.instanceof(MyService);
        expect(myService1).to.be.eq(myService2);
        expect(executed).to.be.eq(1);
      });

      it('overrides the cached instance', function () {
        let executed = 0;
        const givenArgs = [];
        class MyService extends Service {
          constructor(container, arg) {
            super(container);
            ++executed;
            givenArgs.push(arg);
          }
        }
        const container = new ServiceContainer();
        const myService1 = container.get(MyService, 'foo');
        const myService2 = container.get(MyService);
        const myService3 = container.get(MyService, 'bar');
        const myService4 = container.get(MyService);
        expect(myService1).to.be.instanceof(MyService);
        expect(myService2).to.be.instanceof(MyService);
        expect(myService3).to.be.instanceof(MyService);
        expect(myService4).to.be.instanceof(MyService);
        expect(myService1).to.be.eq(myService2);
        expect(myService2).to.be.not.eq(myService3);
        expect(myService3).to.be.eq(myService4);
        expect(executed).to.be.eq(2);
        expect(givenArgs).to.be.eql(['foo', 'bar']);
      });
    });

    describe('non-Service', function () {
      it('passes given arguments to the given constructor', function () {
        let executed = 0;
        let givenArgs;
        class MyService {
          constructor(...args) {
            executed++;
            givenArgs = args;
          }
        }
        const container = new ServiceContainer();
        const service = container.get(MyService, 'foo', 'bar');
        expect(service).to.be.instanceof(MyService);
        expect(executed).to.be.eq(1);
        expect(givenArgs).to.be.eql(['foo', 'bar']);
      });

      it('instantiates from an existing factory function', function () {
        let executed = 0;
        let givenArgs;
        class MyService {
          constructor(...args) {
            executed++;
            givenArgs = args;
          }
        }
        const container = new ServiceContainer();
        container.add(MyService, 'foo', 'bar');
        expect(executed).to.be.eq(0);
        const service = container.get(MyService);
        expect(service).to.be.instanceof(MyService);
        expect(executed).to.be.eq(1);
        expect(givenArgs).to.be.eql(['foo', 'bar']);
      });

      it('overrides an existing factory function', function () {
        let executed = 0;
        let givenArgs;
        class MyService {
          constructor(...args) {
            executed++;
            givenArgs = args;
          }
        }
        const container = new ServiceContainer();
        container.add(MyService, 'foo', 'bar');
        expect(executed).to.be.eq(0);
        const service = container.get(MyService, 'baz', 'qux');
        expect(service).to.be.instanceof(MyService);
        expect(executed).to.be.eq(1);
        expect(givenArgs).to.be.eql(['baz', 'qux']);
      });

      it('caches a new instance', function () {
        let executed = 0;
        class MyService {
          constructor() {
            ++executed;
          }
        }
        const container = new ServiceContainer();
        const myService1 = container.get(MyService);
        const myService2 = container.get(MyService);
        expect(myService1).to.be.instanceof(MyService);
        expect(myService2).to.be.instanceof(MyService);
        expect(myService1).to.be.eq(myService2);
        expect(executed).to.be.eq(1);
      });

      it('overrides the cached instance', function () {
        let executed = 0;
        const givenArgs = [];
        class MyService {
          constructor(arg) {
            ++executed;
            givenArgs.push(arg);
          }
        }
        const container = new ServiceContainer();
        const myService1 = container.get(MyService, 'foo');
        const myService2 = container.get(MyService);
        const myService3 = container.get(MyService, 'bar');
        const myService4 = container.get(MyService);
        expect(myService1).to.be.instanceof(MyService);
        expect(myService2).to.be.instanceof(MyService);
        expect(myService3).to.be.instanceof(MyService);
        expect(myService4).to.be.instanceof(MyService);
        expect(myService1).to.be.eq(myService2);
        expect(myService2).to.be.not.eq(myService3);
        expect(myService3).to.be.eq(myService4);
        expect(executed).to.be.eq(2);
        expect(givenArgs).to.be.eql(['foo', 'bar']);
      });
    });
  });

  describe('has', function () {
    describe('Service', function () {
      it('returns true when a given constructor has its cached instance or false', function () {
        const container = new ServiceContainer();
        class MyService extends Service {}
        expect(container.has(MyService)).to.be.false;
        container.get(MyService);
        expect(container.has(MyService)).to.be.true;
      });

      it('returns true when a given constructor has its factory function or false', function () {
        const container = new ServiceContainer();
        class MyService extends Service {}
        expect(container.has(MyService)).to.be.false;
        container.add(MyService);
        expect(container.has(MyService)).to.be.true;
      });
    });

    describe('non-Service', function () {
      it('returns true when a given constructor has its cached instance or false', function () {
        const container = new ServiceContainer();
        class MyService {}
        expect(container.has(MyService)).to.be.false;
        container.get(MyService);
        expect(container.has(MyService)).to.be.true;
      });

      it('returns true when a given constructor has its factory function or false', function () {
        const container = new ServiceContainer();
        class MyService {}
        expect(container.has(MyService)).to.be.false;
        container.add(MyService);
        expect(container.has(MyService)).to.be.true;
      });
    });
  });

  describe('add', function () {
    it('throws an error if no constructor given', function () {
      const container = new ServiceContainer();
      const throwable = v => () => container.add(v);
      const error = v =>
        format(
          'The first argument of ServicesContainer.add must be ' +
            'a class constructor, but %s given.',
          v,
        );
      expect(throwable()).to.throw(error('undefined'));
      expect(throwable('str')).to.throw(error('"str"'));
      expect(throwable(10)).to.throw(error('10'));
      expect(throwable(true)).to.throw(error('true'));
      expect(throwable(false)).to.throw(error('false'));
      expect(throwable(null)).to.throw(error('null'));
      expect(throwable([])).to.throw(error('Array'));
      expect(throwable({})).to.throw(error('Object'));
    });

    describe('Service', function () {
      it('provides given arguments to the factory function', function () {
        let executed = 0;
        let givenContainer;
        let givenArgs;
        class MyService extends Service {
          constructor(container, ...args) {
            super(container);
            executed++;
            givenContainer = container;
            givenArgs = args;
          }
        }
        const container = new ServiceContainer();
        container.add(MyService, 'foo', 'bar');
        expect(executed).to.be.eq(0);
        const service = container.get(MyService);
        expect(service).to.be.instanceof(MyService);
        expect(executed).to.be.eq(1);
        expect(givenContainer).to.be.eq(container);
        expect(givenArgs).to.be.eql(['foo', 'bar']);
      });

      it('overrides a cached instance of the given constructor', function () {
        class MyService extends Service {}
        const container = new ServiceContainer();
        const service1 = container.get(MyService);
        const service2 = container.get(MyService);
        expect(service1).to.be.eq(service2);
        container.add(MyService);
        const service3 = container.get(MyService);
        const service4 = container.get(MyService);
        expect(service3).to.be.eq(service4);
        expect(service3).to.be.not.eq(service1);
      });

      it('overrides constructor arguments of the factory function', function () {
        let executed = 0;
        let givenContainer;
        let givenArgs;
        class MyService extends Service {
          constructor(container, ...args) {
            super(container);
            executed++;
            givenContainer = container;
            givenArgs = args;
          }
        }
        const container = new ServiceContainer();
        container.add(MyService, 'foo', 'bar');
        expect(executed).to.be.eq(0);
        container.add(MyService, 'baz', 'qux');
        const service = container.get(MyService);
        expect(service).to.be.instanceof(MyService);
        expect(executed).to.be.eq(1);
        expect(givenContainer).to.be.eq(container);
        expect(givenArgs).to.be.eql(['baz', 'qux']);
      });
    });

    describe('non-Service', function () {
      it('provides given arguments to the factory function', function () {
        let executed = 0;
        let givenArgs;
        class MyService {
          constructor(...args) {
            executed++;
            givenArgs = args;
          }
        }
        const container = new ServiceContainer();
        container.add(MyService, 'foo', 'bar');
        expect(executed).to.be.eq(0);
        const service = container.get(MyService);
        expect(service).to.be.instanceof(MyService);
        expect(executed).to.be.eq(1);
        expect(givenArgs).to.be.eql(['foo', 'bar']);
      });

      it('overrides a cached instance of the given constructor', function () {
        class MyService {}
        const container = new ServiceContainer();
        const service1 = container.get(MyService);
        const service2 = container.get(MyService);
        expect(service1).to.be.eq(service2);
        container.add(MyService);
        const service3 = container.get(MyService);
        const service4 = container.get(MyService);
        expect(service3).to.be.eq(service4);
        expect(service3).to.be.not.eq(service1);
      });

      it('overrides constructor arguments of the factory function', function () {
        let executed = 0;
        let givenArgs;
        class MyService {
          constructor(...args) {
            executed++;
            givenArgs = args;
          }
        }
        const container = new ServiceContainer();
        container.add(MyService, 'foo', 'bar');
        expect(executed).to.be.eq(0);
        container.add(MyService, 'baz', 'qux');
        const service = container.get(MyService);
        expect(service).to.be.instanceof(MyService);
        expect(executed).to.be.eq(1);
        expect(givenArgs).to.be.eql(['baz', 'qux']);
      });
    });
  });
});
