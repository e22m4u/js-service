## @e22m4u/js-service

![npm version](https://badge.fury.io/js/@e22m4u%2Fjs-service.svg)
![license](https://img.shields.io/badge/license-mit-blue.svg)

Модуль реализует принцип инверсии управления (*Inversion of Control*) через
паттерн *Service Locator*. Встроенные классы модуля берут на себя
ответственность за создание, хранение и жизненный цикл объектов, освобождая
компоненты приложения от жёстких связей и ручного вызова конструкторов.

## Содержание

- [Установка](#установка)
- [Описание](#описание)
- [Базовые примеры](#базовые-примеры)
- [ServiceContainer](#servicecontainer)
- [Иерархия контейнеров](#иерархия-контейнеров)
- [Service](#service)
- [DebuggableService](#debuggableservice)
- [Тесты](#тесты)
- [Лицензия](#лицензия)

## Установка

```bash
npm install @e22m4u/js-service
```

Модуль поддерживает ESM и CommonJS стандарты.

*ESM*

```js
import {Service} from '@e22m4u/js-service';
```

*CommonJS*

```js
const {Service} = require('@e22m4u/js-service');
```

## Описание

Модуль экспортирует два основных класса `ServiceContainer` и `Service`,
которые можно использовать как по отдельности, так и вместе для построения
слабосвязанной архитектуры.

- `ServiceContainer` *(сервис-локатор)*  
  Реализация сервис-контейнера для хранения и разрешения зависимостей.

- `Service` *(базовый класс для наследования сервисами)*  
  Инкапсулирует работу с сервис-контейнером, предоставляя наследуемым
  от него сервисам простой интерфейс для доступа к зависимостям.

Дополнительно:

- `DebuggableService` *(базовый Service + инструменты логирования)*  
  Расширенная версия класса `Service` с дополнительным функционалом
  для логирования.

## Базовые примеры

Создание контейнера и экземпляра сервиса по принципу *«одиночки»*.

```js
import {ServiceContainer} from '@e22m4u/js-service';

class LoggerService {
  log(message) {
    console.log(`[LOG]: ${message}`);
  }
}

const container = new ServiceContainer();

const logger1 = container.get(LoggerService); // создание и кэширование экземпляра
const logger2 = container.get(LoggerService); // возврат существующего экземпляра

console.log(logger1 === logger2); // true
```

Использование сервиса внутри другого как зависимость.

```js
import {Service} from '@e22m4u/js-service';
import {ServiceContainer} from '@e22m4u/js-service';

// сервис логирования
class LoggerService {
  log(message) {
    console.log(`[LOG]: ${message}`);
  }
}

// сервис калькуляции
class CalculatorService extends Service {
  // так как для работы данного сервиса требуется другой сервис,
  // выполняется наследование класса Service, чтобы иметь доступ
  // к методу getService, через который запрашиваются зависимости
  add(a, b) {
    const logger = this.getService(LoggerService); // <= зависимость
    // при первом обращении к сервису LoggerService создается
    // новый экземпляр, который возвращается при повторном доступе
    const result = a + b;
    logger.log(`${a} + ${b} = ${result}`);
    return result;
  }
}

// создание экземпляра и вызов метода
const calculator = new CalculatorService();
calculator.add(4, 6);
// [LOG]: 4 + 6 = 10

// альтернативный способ (явное создание контейнера)
//   const container = new ServiceContainer();
//   const calculator = container.get(CalculatorService);
//   calculator.add(4, 6);
```

Сервис как точка входа приложения.

```js
import {Service} from '@e22m4u/js-service';

// сервис логирования
class LoggerService {
  log(message) {
    console.log(`[LOG]: ${message}`);
  }
}

// сервис пользователей
class UserService extends Service { // наследование метода getService
  findUserById(id) {
    const logger = this.getService(LoggerService); // <= зависимость
    logger.log(`Finding user by id ${id}`);
    
    const user = {id, name: 'Jane Doe'};
    logger.log(`Found user with name "${user.name}".`);
    return user;
  }
}

// приложение (точка входа)
class App extends Service { // наследование метода getService
  start() {
    const logger = this.getService(LoggerService); // <= зависимость
    logger.log('Starting App...');
    
    const userService = this.getService(UserService);
    const user = userService.findUserById(123);
    
    logger.log('Done.');
  }
}

// создание экземпляра из запуск приложения
const app = new App();
app.start();

// альтернативный способ (явное создание контейнера)
//   const container = new ServiceContainer();
//   const app = container.get(App);
//   app.start();
```

Подмена сервиса в контейнере.

```js
import {ApiService} from './api-service';
import {MockApiService} from './mock-api-service';
import {ServiceContainer} from '@e22m4u/js-service';

const container = new ServiceContainer();
// подмена реализации ApiService
container.set(ApiService, new MockApiService());

// любой сервис, который запросит ApiService
// из этого контейнера, получит MockApiService

// MyService зависит от ApiService
const myService = container.get(MyService);
```

## ServiceContainer

В роли сервис-локатора выступает класс `ServiceContainer`. Он отвечает
за регистрацию, создание и предоставление экземпляров сервисов (зависимостей).

Методы:

- [`get(ctor, ...args)`](#servicecontainerget) получить существующий или новый экземпляр;
- [`getRegistered(ctor, ...args)`](#servicecontainergetregistered) получить существующий или новый
  экземпляр, только если указанный конструктор зарегистрирован
  в контейнере, в противном случае выбрасывается ошибка;
- [`has(ctor)`](#servicecontainerhas) проверить существование конструктора в контейнере;
- [`add(ctor, ...args)`](#servicecontaineradd) добавить конструктор в контейнер (ленивая инициализация);
- [`use(ctor, ...args)`](#servicecontaineruse) добавить конструктор и сразу создать экземпляр;
- [`set(ctor, service)`](#servicecontainerset) добавить конструктор и связанный с ним готовый экземпляр;
- [`getParent()`](#servicecontainergetparent) получить родительский сервис-контейнер;
- [`hasParent()`](#servicecontainerhasparent) проверить наличие родительского сервис-контейнера;

В сигнатурах методов используется вспомогательный тип конструктора:

```ts
/**
 * Конструктор класса.
 */
interface Constructor<T extends object = object> {
  new (...args: any[]): T;
}
```

### serviceContainer.get

Метод `get` класса `ServiceContainer` создает экземпляр
полученного конструктора и сохраняет его для последующих
обращений по принципу "одиночки" (Singleton).

Сигнатура:

```ts
/**
 * Получить существующий или новый экземпляр.
 *
 * @param ctor
 * @param args
 */
get<T extends object>(ctor: Constructor<T>, ...args: any[]): T;
```

Пример:

```js
import {ServiceContainer} from '@e22m4u/js-service';

// создание контейнера
const container = new ServiceContainer();

// в качестве сервиса используется класс Date (как пример)
const myDate1 = container.get(Date); // создает и кэширует экземпляр
const myDate2 = container.get(Date); // возвращает существующий экземпляр

console.log(myDate1 === myDate2); // true
```

Метод `get` может принимать аргументы конструктора. При этом, если контейнер
уже имеет экземпляр данного конструктора, то он будет пересоздан с новыми
аргументами.

Пример:

```js
const myDate1 = container.get(Date, '2025-01-01'); // создание экземпляра
const myDate2 = container.get(Date);               // возврат существующего
const myDate3 = container.get(Date, '2030-05-05'); // пересоздание
console.log(myDate1); // Wed Jan 01 2025 03:00:00
console.log(myDate2); // Wed Jan 01 2025 03:00:00
console.log(myDate3); // Sun May 05 2030 03:00:00
```

### serviceContainer.getRegistered

Работает аналогично `get`, но выбрасывает ошибку, если конструктор
сервиса не был предварительно зарегистрирован через `add`, `use` или `set`.
Это обеспечивает более строгий контроль над зависимостями.

Сигнатура:

```ts
/**
 * Получить существующий или новый экземпляр,
 * только если конструктор зарегистрирован.
 *
 * @param ctor
 * @param args
 */
getRegistered<T extends object>(ctor: Constructor<T>, ...args: any[]): T;
```

Пример:

```js
class RegisteredService {}
class UnregisteredService {}

const container = new ServiceContainer();
container.add(RegisteredService);

// успешный доступ к зарегистрированному сервису
const service = container.getRegistered(RegisteredService);
// следующий вызов выбросит ошибку,
// так как сервис не зарегистрирован
container.getRegistered(UnregisteredService);
// InvalidArgumentError:
// Constructor UnregisteredService is not registered.
```

### serviceContainer.has

Проверяет, зарегистрирован ли конструктор в контейнере (или в одном
из его родительских контейнеров). Возвращает `true` или `false`.

Сигнатура:

```ts
/**
 * Проверить существование конструктора в контейнере.
 *
 * @param ctor
 */
has<T extends object>(ctor: Constructor<T>): boolean;
```

Пример:

```js
class MyService {}

const container = new ServiceContainer();
console.log(container.has(MyService)); // false

container.add(MyService);
console.log(container.has(MyService)); // true
```

### serviceContainer.add

Регистрирует конструктор в контейнере, но не создает экземпляр в момент
вызова. Экземпляр будет создан только при первом доступе к сервису. Метод
позволяет указать аргументы, которые будут использованы для создания
экземпляра.

Сигнатура:

```ts
/**
 * Добавить конструктор в контейнер.
 *
 * @param ctor
 * @param args
 */
add<T extends object>(ctor: Constructor<T>, ...args: any[]): this;
```

Пример:

```js
class MyService {
  constructor(name) {
    console.log('MyService instantiated!');
    console.log(`Hello ${name}!`);
  }
}

const container = new ServiceContainer();

console.log('Before add');
container.add(MyService, 'World'); // регистрация, конструктор еще не вызван
console.log('Before get');
const service = container.get(MyService); // создание экземпляра

// Before add
// Before get
// MyService instantiated!
// Hello World!
```

Аргументы, переданные в `add`, будут использованы при создании
экземпляра, если `get` будет вызван без аргументов.

### serviceContainer.use

Немедленно создает и кэширует экземпляр сервиса. Может использоваться, когда
сервис должен быть проинициализирован сразу при настройке другого компонента.

Сигнатура:

```ts
/**
 * Добавить конструктор и создать экземпляр.
 *
 * @param ctor
 * @param args
 */
use<T extends object>(ctor: Constructor<T>, ...args: any[]): this;
```

Пример:

```js
class MyService {
  constructor(name) {
    console.log('MyService instantiated!');
    console.log(`Hello ${name}!`);
  }
}

const container = new ServiceContainer();

console.log('Before use');
container.use(MyService, 'World'); // создание экземпляра
console.log('Before get');
const service = container.get(MyService); // извлечение экземпляр

// Before use
// MyService instantiated!
// Hello World!
// Before get
```

### serviceContainer.set

Метод позволяет связать конструктор с уже существующим экземпляром.
Может быть использован для подмены зависимостей в тестах или для внедрения
экземпляров, созданных вне контейнера.

Сигнатура:

```ts
/**
 * Добавить конструктор и связанный экземпляр.
 *
 * @param ctor
 * @param service
 */
set<T extends object>(ctor: Constructor<T>, service: T): this;
```

Пример:

```js
class ApiService {}

class MockApiService {
  // имитация реального ApiService
  fetch() {
    return 'mock data';
  }
}

const container = new ServiceContainer();
const mock = new MockApiService();

// установка экземпляра для ApiService
container.set(ApiService, mock);

const api = container.get(ApiService);
console.log(api.fetch()); // "mock data"
console.log(api === mock); // true
```

### serviceContainer.getParent

Метод возвращает родительский контейнер. Если у текущего контейнера
нет родителя, то метод выбрасывает ошибку.

Сигнатура:

```ts
/**
 * Получить родительский сервис-контейнер или выбросить ошибку.
 */
getParent(): ServiceContainer;
```

Пример:

```js
const parentContainer = new ServiceContainer();
const childContainer = new ServiceContainer(parentContainer);

// получение ссылки на родительский контейнер
const parent = childContainer.getParent();
console.log(parent === parentContainer); // true

// попытка получить родителя у корневого
// контейнера вызовет ошибку
try {
  parentContainer.getParent();
} catch (error) {
  console.log(error.message);
  // InvalidArgumentError:
  // Service container has no parent.
}
```

### serviceContainer.hasParent

Метод проверяет наличие родительского контейнера и возвращает логическое
значение. Данный метод полезен перед вызовом метода `getParent`, который
выбрасывает ошибку при отсутствии родителя.

Сигнатура:

```ts
/**
 * Проверить наличие родительского сервис-контейнера.
 */
hasParent(): boolean;
```

Пример:

```js
const parentContainer = new ServiceContainer();
const childContainer = new ServiceContainer(parentContainer);

console.log(parentContainer.hasParent()); // false
console.log(childContainer.hasParent());  // true

if (childContainer.hasParent()) {
  const parent = childContainer.getParent();
  // логика работы с родителем
}
```

### Иерархия контейнеров

Конструктор `ServiceContainer` первым параметром принимает родительский
контейнер, который используется как альтернативный, если конструктор
запрашиваемого сервиса не зарегистрирован в текущем.

```js
class MyService {}

// создание контейнера и регистрация сервиса MyService
const parentContainer = new ServiceContainer();
parentContainer.add(MyService);

// использование созданного ранее контейнера в качестве
// родителя, и проверка наличия сервиса MyService
const childContainer = new ServiceContainer(parentContainer);
const hasService = childContainer.has(MyService);
console.log(hasService); // true
```

## Service

Методы:

- [`getService(ctor, ...args)`](#servicegetservice) получить существующий или новый экземпляр;
- [`getRegisteredService(ctor, ...args)`](#servicegetregisteredservice) получить существующий или новый
  экземпляр, только если указанный конструктор зарегистрирован
  в контейнере, в противном случае выбрасывается ошибка;
- [`hasService(ctor)`](#servicehasservice) проверить существование конструктора в контейнере;
- [`addService(ctor, ...args)`](#serviceaddservice) добавить конструктор в контейнер;
- [`useService(ctor, ...args)`](#serviceuseservice) добавить конструктор и создать экземпляр;
- [`setService(ctor, service)`](#servicesetservice) добавить конструктор и его экземпляр;

Сервисом может являться совершенно любой класс. Однако, если это
наследник класса `Service`, то такой сервис позволяет инкапсулировать
создание сервис-контейнера, его хранение и передачу другим сервисам.

Пример:

```js
import {Service} from '@e22m4u/js-service';

// сервис Foo
class Foo extends Service {
  method() {
    // доступ к сервису Bar
    const bar = this.getService(Bar);
    // ...
  }
}

// сервис Bar
class Bar extends Service {
  method() {
    // доступ к сервису Foo
    const foo = this.getService(Foo);
    // ...
  }
}

// сервис App (точка входа)
class App extends Service {
  method() {
    // доступ к сервисам Foo и Bar
    const foo = this.getService(Foo);
    const bar = this.getService(Bar);
    // ...
  }
}

const app = new App();
```

В примере выше мы не заботились о создании контейнера и его передачу
между сервисами, так как эта логика инкапсулирована в базовом
классе `Service`.

### service.getService

Метод `getService` обеспечивает существование единственного экземпляра
запрашиваемого сервиса, и не создает новый экземпляр при повторных
обращениях. Однако, при передаче дополнительных аргументов, сервис
будет переопределен с новыми аргументами конструктора.

Сигнатура:

```ts
/**
 * Получить существующий или новый экземпляр.
 *
 * @param ctor
 * @param args
 */
getService<T extends object>(ctor: Constructor<T>, ...args: any[]): T;
```

Пример:

```js
const foo1 = this.getService(Foo, 'arg'); // создание экземпляра
const foo2 = this.getService(Foo);        // возврат существующего
console.log(foo1 === foo2);               // true

const foo3 = this.getService(Foo, 'arg'); // пересоздание экземпляра
const foo4 = this.getService(Foo);        // возврат уже пересозданного
console.log(foo3 === foo4);               // true
```

### service.getRegisteredService

Работает аналогично `getService`, но выбрасывает ошибку, если конструктор
сервиса не был предварительно зарегистрирован, что обеспечивает более
строгий контроль над зависимостями.

Сигнатура:

```ts
/**
 * Получить существующий или новый экземпляр,
 * только если конструктор зарегистрирован.
 *
 * @param ctor
 * @param args
 */
getRegisteredService<T extends object>(
  ctor: Constructor<T>,
  ...args: any[],
): T;
```

Пример:

```js
class RegisteredService {}
class UnregisteredService {}

class MyService extends Service {
  run() {
    this.addService(RegisteredService);
    // успешный доступ к зарегистрированному сервису
    const service = this.getRegisteredService(RegisteredService);
    // следующий вызов выбросит ошибку,
    // так как сервис не зарегистрирован
    this.getRegisteredService(UnregisteredService);
    // InvalidArgumentError:
    // Constructor UnregisteredService is not registered.
  }
}
```

### service.hasService

Проверяет, зарегистрирован ли конструктор в контейнере. Возвращает
`true` или `false`. Полезно для условного запроса зависимостей.

Сигнатура:

```ts
/**
 * Проверка существования конструктора в контейнере.
 *
 * @param ctor
 */
hasService<T extends object>(ctor: Constructor<T>): boolean;
```

Пример:

```js
class OptionalLogger {}

class MyService extends Service {
  log(message) {
    if (this.hasService(OptionalLogger)) {
      const logger = this.getService(OptionalLogger);
      logger.log(message);
    }
  }
}
```

### service.addService

Регистрирует конструктор в контейнере, но не создает экземпляр в момент
вызова. Экземпляр будет создан только при первом доступе к сервису. Метод
позволяет указать аргументы, которые будут использованы для создания
экземпляра.

Сигнатура:

```ts
/**
 * Добавить конструктор в контейнер.
 *
 * @param ctor
 * @param args
 */
addService<T extends object>(ctor: Constructor<T>, ...args: any[]): this;
```

Пример:

```js
class DatabaseService {}
class Config {}

class App extends Service {
  setupDatabase() {
    const config = new Config();
    // регистрация сервиса с аргументами для конструктора
    this.addService(DatabaseService, config);
  }
}
```

### service.useService

Немедленно создает и кэширует экземпляр сервиса. Может использоваться, когда
сервис должен быть проинициализирован сразу при настройке другого компонента.

Сигнатура:

```ts
/**
 * Добавить конструктор и создать экземпляр.
 *
 * @param ctor
 * @param args
 */
useService<T extends object>(ctor: Constructor<T>, ...args: any[]): this;
```

Пример:

```js
class Logger {
  constructor() {
    console.log('Logger is ready.');
  }
}

class App extends Service {
  init() {
    // немедленно создает и кэширует экземпляр Logger
    this.useService(Logger); // -> "Logger is ready."
  }
}
```

### service.setService

Метод позволяет связать конструктор с уже существующим экземпляром.
Может быть использован для подмены зависимостей в тестах или для внедрения
экземпляров, созданных вне контейнера.

Сигнатура:

```ts
/**
 * Добавить конструктор и связанный экземпляр.
 *
 * @param ctor
 * @param service
 */
setService<T extends object>(ctor: Constructor<T>, service: T): this;
```

Пример:

```js
class ApiService {}
class MockApiService {}

class MyComponent extends Service {
  setupForTest() {
    // подмена реального ApiService на его мок-версию
    this.setService(ApiService, new MockApiService());
  }

  fetchData() {
    // следующий вызов вернет экземпляр MockApiService
    const api = this.getService(ApiService);
    return api.fetch();
  }
}
```

## DebuggableService

Данный сервис наследует класс `Debuggable` и использует композицию
для получения функциональности класса `Service`.  
*(см. подробнее [@e22m4u/js-debug](https://www.npmjs.com/package/@e22m4u/js-debug#класс-debuggable#класс-debuggable) раздел «Класс Debuggable»)*

```js
import {apiClient} from './path/to/apiClient';
import {DebuggableService} from '@e22m4u/js-service';

// определение глобального префикса (область имен)
// для отладочных сообщений текущего приложения
process.env['DEBUGGER_NAMESPACE'] = 'myApp';

// переменная DEBUG обычно устанавливается перед
// запуском Node.js процесса, и указывает на область
// имен для логирования, пример: DEBUG=myApp* node .
process.env['DEBUG'] = 'myApp*';

class UserService extends DebuggableService {
  async getUserById(userId) {
    // получение отладчика для данного метода
    // (для каждого вызова генерируется хэш)
    const debug = this.getDebuggerFor(this.getUserById);
    debug('Fetching user with ID %v...', userId);
    try {
      const user = await apiClient.get(`/users/${userId}`);
      debug.inspect('User data received:', user);
      return user;
    } catch (error) {
      debug('Failed to fetch user. Error: %s', error.message);
      throw error;
    }
  }
}

const userService = new UserService();
await userService.getUserById(123);
// myApp:userService:constructor:a4f1 Instantiated.
// myApp:userService:getUserById:b9c2 Fetching user with ID 123...
// myApp:userService:getUserById:b9c2 User data received:
// myApp:userService:getUserById:b9c2   {
// myApp:userService:getUserById:b9c2     id: 123,
// myApp:userService:getUserById:b9c2     name: 'John Doe',
// myApp:userService:getUserById:b9c2     email: 'john.doe@example.com'
// myApp:userService:getUserById:b9c2   }
```

## Тесты

```bash
npm run test
```

## Лицензия

MIT
