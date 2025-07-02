import {expect} from 'chai';
import {Service} from './service.js';
import {format} from '@e22m4u/js-format';
import {ServiceContainer} from './service-container.js';
import {SERVICE_CONTAINER_CLASS_NAME} from './service-container.js';

describe('ServiceContainer', function () {
  it('exposes static property "kinds"', function () {
    expect(ServiceContainer.kinds).to.be.eql([SERVICE_CONTAINER_CLASS_NAME]);
    const MyContainer = class extends ServiceContainer {};
    expect(MyContainer.kinds).to.be.eql([SERVICE_CONTAINER_CLASS_NAME]);
  });

  describe('constructor', function () {
    it('does not require any arguments', function () {
      const res = new ServiceContainer();
      expect(res).to.be.instanceof(ServiceContainer);
    });

    it('sets the first argument as the parent container', function () {
      const parent = new ServiceContainer();
      const container = new ServiceContainer(parent);
      const res = container['_parent'];
      expect(res).to.be.eq(parent);
    });

    it('requires the first argument to be an instance of ServiceContainer', function () {
      const throwable = v => () => new ServiceContainer(v);
      const error = v =>
        format(
          'The provided parameter "parent" of ServicesContainer.constructor ' +
            'must be an instance ServiceContainer, but %s given.',
          v,
        );
      expect(throwable('str')).to.throw(error('"str"'));
      expect(throwable('')).to.throw(error('""'));
      expect(throwable(10)).to.throw(error('10'));
      expect(throwable(0)).to.throw(error('0'));
      expect(throwable(true)).to.throw(error('true'));
      expect(throwable(false)).to.throw(error('false'));
      expect(throwable([])).to.throw(error('Array'));
      expect(throwable({})).to.throw(error('Object'));
      throwable(undefined)();
      throwable(null)();
      throwable(new ServiceContainer())();
    });
  });

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
        const service1 = container.get(MyService);
        const service2 = container.get(MyService);
        expect(service1).to.be.instanceof(MyService);
        expect(service2).to.be.instanceof(MyService);
        expect(service1).to.be.eq(service2);
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
        const service1 = container.get(MyService, 'foo');
        const service2 = container.get(MyService);
        const service3 = container.get(MyService, 'bar');
        const service4 = container.get(MyService);
        expect(service1).to.be.instanceof(MyService);
        expect(service2).to.be.instanceof(MyService);
        expect(service3).to.be.instanceof(MyService);
        expect(service4).to.be.instanceof(MyService);
        expect(service1).to.be.eq(service2);
        expect(service2).to.be.not.eq(service3);
        expect(service3).to.be.eq(service4);
        expect(executed).to.be.eq(2);
        expect(givenArgs).to.be.eql(['foo', 'bar']);
      });

      describe('class inheritance', function () {
        it('should create an instance of the child class when the parent class is requested', function () {
          class ParentService extends Service {}
          class ChildService extends ParentService {}
          const container = new ServiceContainer();
          container.add(ChildService);
          const childService = container.get(ParentService);
          expect(childService).to.be.instanceof(ChildService);
        });

        it('should return the existing instance of the child class when the parent class is requested', function () {
          class ParentService extends Service {}
          class ChildService extends ParentService {}
          const container = new ServiceContainer();
          const childService1 = container.get(ChildService);
          expect(childService1).to.be.instanceof(ChildService);
          const childService2 = container.get(ParentService);
          expect(childService1).to.be.instanceof(ChildService);
          expect(childService2).to.be.eq(childService1);
        });

        it('should create an instance of the requested child class, even if its parent class is registered', function () {
          class ParentService extends Service {}
          class ChildService extends ParentService {}
          const container = new ServiceContainer();
          container.add(ParentService);
          const childService = container.get(ChildService);
          expect(childService).to.be.instanceof(ChildService);
        });

        it('should return an instance of the requested child class, not the existing instance of its parent class', function () {
          class ParentService extends Service {}
          class ChildService extends ParentService {}
          const container = new ServiceContainer();
          const parentService = container.get(ParentService);
          expect(parentService).to.be.instanceof(ParentService);
          const childService = container.get(ChildService);
          expect(childService).to.be.instanceof(ChildService);
          expect(childService).to.be.not.eq(parentService);
        });
      });

      describe('in case of a parent container', function () {
        it('instantiates in the parent container', function () {
          class MyService extends Service {}
          const parent = new ServiceContainer();
          parent.add(MyService);
          const child = new ServiceContainer(parent);
          const res = child.get(MyService);
          expect(res).to.be.instanceof(MyService);
        });

        it('returns an instance from the parent container', function () {
          class MyService extends Service {}
          const parent = new ServiceContainer();
          const service = parent.get(MyService);
          const child = new ServiceContainer(parent);
          const res = child.get(MyService);
          expect(res).to.be.eq(service);
        });

        it('does not adds the given constructor to the parent container', function () {
          class MyService extends Service {}
          const parent = new ServiceContainer();
          const child = new ServiceContainer(parent);
          const service = child.get(MyService);
          expect(service).to.be.instanceof(MyService);
          const res1 = child.has(MyService);
          const res2 = parent.has(MyService);
          expect(res1).to.be.true;
          expect(res2).to.be.false;
        });

        describe('class inheritance', function () {
          it('should resolve a parent class to an instance of its child class registered in a parent container', function () {
            class ParentService extends Service {}
            class ChildService extends ParentService {}
            const parentContainer = new ServiceContainer();
            const container = new ServiceContainer(parentContainer);
            parentContainer.add(ChildService);
            const childService = container.get(ParentService);
            expect(childService).to.be.instanceof(ChildService);
          });

          it('should return the existing instance of the child class from a parent container when the parent class is requested', function () {
            class ParentService extends Service {}
            class ChildService extends ParentService {}
            const parentContainer = new ServiceContainer();
            const container = new ServiceContainer(parentContainer);
            const childService1 = parentContainer.get(ChildService);
            expect(childService1).to.be.instanceof(ChildService);
            const childService2 = container.get(ParentService);
            expect(childService1).to.be.instanceof(ChildService);
            expect(childService2).to.be.eq(childService1);
          });

          it('should create an instance of the requested child class, even if its parent class is registered in a parent container', function () {
            class ParentService extends Service {}
            class ChildService extends ParentService {}
            const parentContainer = new ServiceContainer();
            const container = new ServiceContainer(parentContainer);
            parentContainer.add(ParentService);
            const childService = container.get(ChildService);
            expect(childService).to.be.instanceof(ChildService);
          });

          it('should create an instance of the requested child class, even if a parent container has an instance of its parent class', function () {
            class ParentService extends Service {}
            class ChildService extends ParentService {}
            const parentContainer = new ServiceContainer();
            const container = new ServiceContainer(parentContainer);
            const parentService = parentContainer.get(ParentService);
            expect(parentService).to.be.instanceof(ParentService);
            const childService = container.get(ChildService);
            expect(childService).to.be.instanceof(ChildService);
            expect(childService).to.be.not.eq(parentService);
          });
        });
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
        const service1 = container.get(MyService);
        const service2 = container.get(MyService);
        expect(service1).to.be.instanceof(MyService);
        expect(service2).to.be.instanceof(MyService);
        expect(service1).to.be.eq(service2);
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
        const service1 = container.get(MyService, 'foo');
        const service2 = container.get(MyService);
        const service3 = container.get(MyService, 'bar');
        const service4 = container.get(MyService);
        expect(service1).to.be.instanceof(MyService);
        expect(service2).to.be.instanceof(MyService);
        expect(service3).to.be.instanceof(MyService);
        expect(service4).to.be.instanceof(MyService);
        expect(service1).to.be.eq(service2);
        expect(service2).to.be.not.eq(service3);
        expect(service3).to.be.eq(service4);
        expect(executed).to.be.eq(2);
        expect(givenArgs).to.be.eql(['foo', 'bar']);
      });

      describe('class inheritance', function () {
        it('should create an instance of the child class when the parent class is requested', function () {
          class ParentService {}
          class ChildService extends ParentService {}
          const container = new ServiceContainer();
          container.add(ChildService);
          const childService = container.get(ParentService);
          expect(childService).to.be.instanceof(ChildService);
        });

        it('should return the existing instance of the child class when the parent class is requested', function () {
          class ParentService {}
          class ChildService extends ParentService {}
          const container = new ServiceContainer();
          const childService1 = container.get(ChildService);
          expect(childService1).to.be.instanceof(ChildService);
          const childService2 = container.get(ParentService);
          expect(childService1).to.be.instanceof(ChildService);
          expect(childService2).to.be.eq(childService1);
        });

        it('should create an instance of the requested child class, even if its parent class is registered', function () {
          class ParentService {}
          class ChildService extends ParentService {}
          const container = new ServiceContainer();
          container.add(ParentService);
          const childService = container.get(ChildService);
          expect(childService).to.be.instanceof(ChildService);
        });

        it('should return an instance of the requested child class, not the existing instance of its parent class', function () {
          class ParentService {}
          class ChildService extends ParentService {}
          const container = new ServiceContainer();
          const parentService = container.get(ParentService);
          expect(parentService).to.be.instanceof(ParentService);
          const childService = container.get(ChildService);
          expect(childService).to.be.instanceof(ChildService);
          expect(childService).to.be.not.eq(parentService);
        });
      });

      describe('in case of a parent container', function () {
        it('instantiates in the parent container', function () {
          class MyService {}
          const parent = new ServiceContainer();
          parent.add(MyService);
          const child = new ServiceContainer(parent);
          const res = child.get(MyService);
          expect(res).to.be.instanceof(MyService);
        });

        it('returns an instance from the parent container', function () {
          class MyService {}
          const parent = new ServiceContainer();
          const service = parent.get(MyService);
          const child = new ServiceContainer(parent);
          const res = child.get(MyService);
          expect(res).to.be.eq(service);
        });

        it('does not adds the given constructor to the parent container', function () {
          class MyService {}
          const parent = new ServiceContainer();
          const child = new ServiceContainer(parent);
          const service = child.get(MyService);
          expect(service).to.be.instanceof(MyService);
          const res1 = child.has(MyService);
          const res2 = parent.has(MyService);
          expect(res1).to.be.true;
          expect(res2).to.be.false;
        });

        describe('class inheritance', function () {
          it('should resolve a parent class to an instance of its child class registered in a parent container', function () {
            class ParentService {}
            class ChildService extends ParentService {}
            const parentContainer = new ServiceContainer();
            const container = new ServiceContainer(parentContainer);
            parentContainer.add(ChildService);
            const childService = container.get(ParentService);
            expect(childService).to.be.instanceof(ChildService);
          });

          it('should return the existing instance of the child class from a parent container when the parent class is requested', function () {
            class ParentService {}
            class ChildService extends ParentService {}
            const parentContainer = new ServiceContainer();
            const container = new ServiceContainer(parentContainer);
            const childService1 = parentContainer.get(ChildService);
            expect(childService1).to.be.instanceof(ChildService);
            const childService2 = container.get(ParentService);
            expect(childService1).to.be.instanceof(ChildService);
            expect(childService2).to.be.eq(childService1);
          });

          it('should create an instance of the requested child class, even if its parent class is registered in a parent container', function () {
            class ParentService {}
            class ChildService extends ParentService {}
            const parentContainer = new ServiceContainer();
            const container = new ServiceContainer(parentContainer);
            parentContainer.add(ParentService);
            const childService = container.get(ChildService);
            expect(childService).to.be.instanceof(ChildService);
          });

          it('should create an instance of the requested child class, even if a parent container has an instance of its parent class', function () {
            class ParentService {}
            class ChildService extends ParentService {}
            const parentContainer = new ServiceContainer();
            const container = new ServiceContainer(parentContainer);
            const parentService = parentContainer.get(ParentService);
            expect(parentService).to.be.instanceof(ParentService);
            const childService = container.get(ChildService);
            expect(childService).to.be.instanceof(ChildService);
            expect(childService).to.be.not.eq(parentService);
          });
        });
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

      describe('class inheritance', function () {
        it('returns true if the child class is registered', function () {
          class ParentService extends Service {}
          class ChildService extends ParentService {}
          const container = new ServiceContainer();
          container.add(ChildService);
          const res = container.has(ParentService);
          expect(res).to.be.true;
        });

        it('returns false if the parent class is registered', function () {
          class ParentService extends Service {}
          class ChildService extends ParentService {}
          const container = new ServiceContainer();
          container.add(ParentService);
          const res = container.has(ChildService);
          expect(res).to.be.false;
        });
      });

      describe('in case of a parent container', function () {
        it('returns true if the parent container has the given constructor', function () {
          class MyService extends Service {}
          const parent = new ServiceContainer();
          parent.add(MyService);
          const child = new ServiceContainer(parent);
          const res = child.has(MyService);
          expect(res).to.be.true;
        });
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

      describe('class inheritance', function () {
        it('returns true if the child class is registered', function () {
          class ParentService {}
          class ChildService extends ParentService {}
          const container = new ServiceContainer();
          container.add(ChildService);
          const res = container.has(ParentService);
          expect(res).to.be.true;
        });

        it('returns false if the parent class is registered', function () {
          class ParentService {}
          class ChildService extends ParentService {}
          const container = new ServiceContainer();
          container.add(ParentService);
          const res = container.has(ChildService);
          expect(res).to.be.false;
        });
      });

      describe('in case of a parent container', function () {
        it('returns true if the parent container has the given constructor', function () {
          class MyService {}
          const parent = new ServiceContainer();
          parent.add(MyService);
          const child = new ServiceContainer(parent);
          const res = child.has(MyService);
          expect(res).to.be.true;
        });
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
      it('returns itself', function () {
        class MyService extends Service {}
        const container = new ServiceContainer();
        const res = container.add(MyService);
        expect(res).to.be.eq(container);
      });

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
      it('returns itself', function () {
        class MyService {}
        const container = new ServiceContainer();
        const res = container.add(MyService);
        expect(res).to.be.eq(container);
      });

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

  describe('use', function () {
    it('throws an error if no constructor given', function () {
      const container = new ServiceContainer();
      const throwable = v => () => container.use(v);
      const error = v =>
        format(
          'The first argument of ServicesContainer.use must be ' +
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
      it('returns itself', function () {
        class MyService extends Service {}
        const container = new ServiceContainer();
        const res = container.use(MyService);
        expect(res).to.be.eq(container);
      });

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
        container.use(MyService, 'foo', 'bar');
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
        container.use(MyService, 'baz', 'qux');
        expect(executed).to.be.eq(1);
        expect(givenContainer).to.be.eq(container);
        expect(givenArgs).to.be.eql(['baz', 'qux']);
      });

      it('caches a new instance', function () {
        let executed = 0;
        let service;
        class MyService extends Service {
          constructor(container) {
            super(container);
            ++executed;
            service = this;
          }
        }
        const container = new ServiceContainer();
        container.use(MyService);
        const cachedService = container.get(MyService);
        expect(cachedService).to.be.instanceof(MyService);
        expect(cachedService).to.be.eq(service);
        expect(executed).to.be.eq(1);
      });

      it('overrides the cached instance', function () {
        let executed = 0;
        let service;
        let givenArgs;
        class MyService extends Service {
          constructor(container, ...args) {
            super(container);
            ++executed;
            service = this;
            givenArgs = args;
          }
        }
        const container = new ServiceContainer();
        container.use(MyService, 'foo');
        expect(executed).to.be.eq(1);
        expect(service).to.be.instanceof(MyService);
        expect(givenArgs).to.be.eql(['foo']);
        const service1 = service;
        container.use(MyService, 'bar');
        expect(executed).to.be.eq(2);
        expect(service).to.be.instanceof(MyService);
        expect(givenArgs).to.be.eql(['bar']);
        const service2 = service;
        expect(service2).to.be.not.eq(service1);
      });
    });

    describe('non-Service', function () {
      it('returns itself', function () {
        class MyService {}
        const container = new ServiceContainer();
        const res = container.use(MyService);
        expect(res).to.be.eq(container);
      });

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
        container.use(MyService, 'foo', 'bar');
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
        container.use(MyService, 'baz', 'qux');
        expect(executed).to.be.eq(1);
        expect(givenArgs).to.be.eql(['baz', 'qux']);
      });

      it('caches a new instance', function () {
        let executed = 0;
        let service;
        class MyService {
          constructor() {
            ++executed;
            service = this;
          }
        }
        const container = new ServiceContainer();
        container.use(MyService);
        const cachedService = container.get(MyService);
        expect(cachedService).to.be.instanceof(MyService);
        expect(cachedService).to.be.eq(service);
        expect(executed).to.be.eq(1);
      });

      it('overrides the cached instance', function () {
        let executed = 0;
        let service;
        let givenArgs;
        class MyService {
          constructor(...args) {
            ++executed;
            service = this;
            givenArgs = args;
          }
        }
        const container = new ServiceContainer();
        container.use(MyService, 'foo');
        expect(executed).to.be.eq(1);
        expect(service).to.be.instanceof(MyService);
        expect(givenArgs).to.be.eql(['foo']);
        const service1 = service;
        container.use(MyService, 'bar');
        expect(executed).to.be.eq(2);
        expect(service).to.be.instanceof(MyService);
        expect(givenArgs).to.be.eql(['bar']);
        const service2 = service;
        expect(service2).to.be.not.eq(service1);
      });
    });
  });

  describe('set', function () {
    it('requires the "ctor" argument to be a class constructor', function () {
      const container = new ServiceContainer();
      const throwable = v => () => container.set(v, {});
      const error = v =>
        format(
          'The first argument of ServicesContainer.set must be ' +
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
      throwable(String)();
    });

    it('requires the "service" argument to be an Object', function () {
      const container = new ServiceContainer();
      const throwable = v => () => container.set(String, v);
      const error = v =>
        format(
          'The second argument of ServicesContainer.set must be ' +
            'an Object, but %s given.',
          v,
        );
      expect(throwable()).to.throw(error('undefined'));
      expect(throwable('str')).to.throw(error('"str"'));
      expect(throwable(10)).to.throw(error('10'));
      expect(throwable(true)).to.throw(error('true'));
      expect(throwable(false)).to.throw(error('false'));
      expect(throwable(null)).to.throw(error('null'));
      expect(throwable([])).to.throw(error('Array'));
      throwable({})();
    });

    describe('Service', function () {
      it('returns itself', function () {
        class MyService extends Service {}
        const container = new ServiceContainer();
        const res = container.set(MyService, {});
        expect(res).to.be.eq(container);
      });

      it('sets the given service', function () {
        class MyService extends Service {}
        const container = new ServiceContainer();
        const service = {};
        container.set(MyService, service);
        const res = container.get(MyService);
        expect(res).to.be.eq(service);
      });

      it('overrides by the given service', function () {
        class MyService extends Service {}
        const container = new ServiceContainer();
        const service1 = {foo: 'bar'};
        const service2 = {bar: 'baz'};
        container.set(MyService, service1);
        container.set(MyService, service2);
        const res = container.get(MyService);
        expect(res).to.be.eq(service2);
      });
    });

    describe('non-Service', function () {
      it('returns itself', function () {
        class MyService {}
        const container = new ServiceContainer();
        const res = container.set(MyService, {});
        expect(res).to.be.eq(container);
      });

      it('sets the given service', function () {
        class MyService {}
        const container = new ServiceContainer();
        const service = {};
        container.set(MyService, service);
        const res = container.get(MyService);
        expect(res).to.be.eq(service);
      });

      it('overrides by the given service', function () {
        class MyService {}
        const container = new ServiceContainer();
        const service1 = {foo: 'bar'};
        const service2 = {bar: 'baz'};
        container.set(MyService, service1);
        container.set(MyService, service2);
        const res = container.get(MyService);
        expect(res).to.be.eq(service2);
      });
    });
  });
});
