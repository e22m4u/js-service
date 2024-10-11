## @e22m4u/js-service

*English | [Русский](README-ru.md)*

Implementation of the «Service Locator» pattern using
the Dependency Injection approach.

## Installation

```bash
npm install @e22m4u/js-service
```

To load the ES-module, you need to set `"type": "module"`
in the `package.json` file, or use the `.mjs` extension.

## Purpose

The module offers `ServiceContainer` and `Service` classes,
which can be used separately or together.

- `ServiceContainer` - classic version of the service locator
- `Service` - hides the creation of the container and its distribution

The `Service` class is convenient when the application has a single
entry point created by the `new` operator. For example, if such
a point is the `App` class, we could inherit it from the `Service`
class and access other services using the `getService` method
without worrying about creating and storing their instances.

Moreover, if other services also inherit from the `Service` class,
they can refer to each other using the `getService` method,
as if we were passing the service container between them.

## ServiceContainer

Methods:

- `get(ctor, ...args)` returns an existing or new instance
- `has(ctor)` checks if a constructor exists in the container
- `add(ctor, ...args)` adds a constructor to the container
- `use(ctor, ...args)` adds a constructor and creates its instance
- `set(ctor, service)` adds a constructor and its instance

### get

The `get` method of the `ServiceContainer` class creates
an instance of the given constructor and saves it for next
requests following the "singleton" principle.

Example:

```js
import {ServiceContainer} from '@e22m4u/js-service';

// create a new container
const container = new ServiceContainer();

// pass a constructor to the "get" method
// (the Date class is used as an example)
const myDate1 = container.get(Date); // creates an instance
const myDate2 = container.get(Date); // returns existing instance

console.log(myDate1); // Tue Sep 12 2023 19:50:16
console.log(myDate2); // Tue Sep 12 2023 19:50:16
console.log(myDate1 === myDate2); // true
```

The `get` method can accept constructor arguments.
If the container already has an instance of this
constructor, it will be recreated with new arguments.

Example:

```js
const myDate1 = container.get(Date, '2025-01-01'); // creates an instance
const myDate2 = container.get(Date);               // returns existing instance
const myDate3 = container.get(Date, '2025-05-05'); // recreates
console.log(myDate1); // Wed Jan 01 2025 03:00:00
console.log(myDate2); // Wed Jan 01 2025 03:00:00
console.log(myDate3); // Sun May 05 2030 03:00:00
```

### Inheritance

The `ServiceContainer` constructor takes a parent container
as its first parameter, which is used as an alternative
if the constructor of the requested instance (service)
is not registered in the current one.

```js
class MyService {}

// create the ServiceContainer instance
// and register a new service (MyService)
const parentContainer = new ServiceContainer();
parentContainer.add(MyService);

// provide the previous container as a parent
// for a new one, and check the service existence
// in a child container
const childContainer = new ServiceContainer(parentContainer);
const hasService = childContainer.has(MyService);
console.log(hasService); // true
```

## Service

Methods:

- `getService(ctor, ...args)` returns an existing or new instance
- `hasService(ctor)` checks if a constructor exists in the container
- `addService(ctor, ...args)` adds a constructor to the container
- `useService(ctor, ...args)` adds a constructor and creates its instance
- `setService(ctor, service)` adds a constructor and its instance

A service is just an instance of a class. However, if a service
inherits the `Service` class, such a service allows encapsulating
the creation of the service container, its storage, and transfer
to other services.

Example:

```js
import {Service} from '@e22m4u/js-service';

// the Foo service
class Foo extends Service {
  method() {
    // access to the Bar
    const bar = this.getService(Bar);
    // ...
  }
}

// the Bar service
class Bar extends Service {
  method() {
    // access to the Foo
    const foo = this.getService(Foo);
    // ...
  }
}

// the App service (entry point)
class App extends Service {
  method() {
    // access to Foo and Bar services
    const foo = this.getService(Foo);
    const bar = this.getService(Bar);
    // ...
  }
}

const app = new App();
```

In the example above, we didn't worry about creating
a service container and passing it between services,
because this logic is encapsulated in the `Service`
class and its `getService` method.

### getService

The `getService` method ensures the existence of a single
instance of the requested service, rather than creating
a new one each time. However, when passing additional
arguments, the service will be recreated with these
arguments passed to the constructor.

Example:

```js
const foo1 = this.getService(Foo, 'arg'); // creates an instance
const foo2 = this.getService(Foo);        // returns existing instance
console.log(foo1 === foo2);               // true

const foo3 = this.getService(Foo, 'arg'); // recreates instance
const foo4 = this.getService(Foo);        // returns already recreated instance
console.log(foo3 === foo4);               // true
```

## Tests

```bash
npm run test
```

## License

MIT
