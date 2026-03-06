## @e22m4u/js-service

![npm version](https://badge.fury.io/js/@e22m4u%2Fjs-service.svg)
![license](https://img.shields.io/badge/license-mit-blue.svg)

Реализация принципа инверсии управления для JavaScript.

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

- `ServiceContainer` *(IoC-контейнер)*  
  Реализация сервис-контейнера для хранения и разрешения зависимостей.

- `Service` *(базовый класс для наследования сервисами)*  
  Позволяет скрывать работу с контейнером и внедрением зависимостей.

Дополнительно:

- `DebuggableService` *(логируемый Service)*  
  Расширенная версия класса `Service` с дополнительными возможностями
  логирования.

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

В роли IoC-контейнера выступает класс `ServiceContainer`. Он отвечает
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
- [`find(predicate, noParent = false)`](#servicecontainerfind) найти сервис удовлетворяющий условию;
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

// успешное получение, так как сервис зарегистрирован
const service = container.getRegistered(RegisteredService);

// этот вызов выбросит ошибку InvalidArgumentError
container.getRegistered(UnregisteredService);
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

Метод регистрирует конструктор для ленивой инициализации. Экземпляр сервиса
создается не в момент вызова `add`, а при первом обращении к нему через
метод `get`.

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
  constructor() {
    console.log('MyService instantiated!');
  }
}

const container = new ServiceContainer();
container.add(MyService); // регистрация, конструктор еще не вызван

console.log('Before get');
const service = container.get(MyService); // <- "MyService instantiated!"
console.log('After get');
```

Аргументы, переданные в `add`, будут использованы при создании
экземпляра, если `get` будет вызван без аргументов.

### serviceContainer.use

В отличие от `add`, метод `use` немедленно создает и кэширует
экземпляр сервиса (моментальная инициализация).

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
  constructor() {
    console.log('MyService instantiated!');
  }
}

const container = new ServiceContainer();
console.log('Before use');
container.use(MyService); // <- "MyService instantiated!"
console.log('After use');

const service = container.get(MyService); // возвращает готовый экземпляр
```

### serviceContainer.set

Метод `set` позволяет связать конструктор с уже существующим объектом.
Это особенно полезно для подмены реализаций в тестах или для интеграции
с объектами, созданными вне контейнера.

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

// теперь при запросе ApiService будет возвращаться mock
container.set(ApiService, mock);

const api = container.get(ApiService);
console.log(api.fetch()); // "mock data"
console.log(api === mock); // true
```

### serviceContainer.find

Позволяет найти сервис по произвольному условию, заданному в функции-предикате.
Предикат получает конструктор и текущий контейнер в качестве аргументов.
Поиск ведется рекурсивно вверх по иерархии контейнеров.

Сигнатура:

```ts
/**
 * Найти сервис удовлетворяющий условию.
 *
 * @param predicate
 * @param noParent
 */
find<T extends object>(
  predicate: FindServicePredicate<T>,
  noParent?: boolean,
): T | undefined;

/**
 * Определение функции-предиката.
 */
type FindServicePredicate<T extends object> = (
  ctor: Constructor<T>,
  container: ServiceContainer,
) => boolean;
```

Пример:

```js
class ReportService {
  static type = 'report';
}

class DashboardService {
  static type = 'dashboard';
}

const container = new ServiceContainer();
container.add(ReportService);
container.add(DashboardService);

// найти сервис, у которого есть статическое свойство type = 'dashboard'
const dashboard = container.find((ctor) => ctor.type === 'dashboard');

console.log(dashboard instanceof DashboardService); // true
```

Вторым необязательным аргументом `noParent` можно ограничить поиск только
текущим контейнером. Если передать `true`, поиск в родительских контейнерах
выполняться не будет.

```js
class SharedService {
  static id = 'shared';
}

const parent = new ServiceContainer();
parent.add(SharedService);

const child = new ServiceContainer(parent);

// поиск по умолчанию (рекурсивный)
const service1 = child.find(ctor => ctor.id === 'shared');
console.log(service1 instanceof SharedService); // true

// поиск только в дочернем контейнере
const service2 = child.find(ctor => ctor.id === 'shared', true);
console.log(service2); // undefined
```

### serviceContainer.getParent

Метод возвращает родительский контейнер. Если у текущего контейнера
нет родителя, метод выбрасывает ошибку. Метод позволяет безопасно
перемещаться вверх по иерархии, когда наличие родителя гарантировано
логикой приложения.

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
запрашиваемого сервиса не зарегистрирован в текущем. Это позволяет
создавать иерархические области видимости для зависимостей.

```js
class MyService {}

// создание контейнера и регистрация
// в нем сервиса MyService
const parentContainer = new ServiceContainer();
parentContainer.add(MyService);

// использование предыдущего контейнера в качестве родителя,
// и проверка доступности сервиса MyService
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
- [`findService(predicate, noParent = false)`](#servicefindservice) найти сервис удовлетворяющий условию;

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

В примере выше мы не заботились о создании сервис-контейнера
и его передачу между сервисами, так как эта логика инкапсулирована
в базовом классе `Service`

### service.getService

Метод `getService` обеспечивает существование единственного экземпляра
запрашиваемого сервиса, а не создает каждый раз новый. Тем не менее при
передаче дополнительных аргументов, сервис будет пересоздан с передачей
этих аргументов конструктору.

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
    
    // успешное получение
    const service = this.getRegisteredService(RegisteredService);
    
    // этот вызов выбросит ошибку InvalidArgumentError
    this.getRegisteredService(UnregisteredService);
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

Регистрирует конструктор для ленивой инициализации. Экземпляр будет создан
только при первом обращении к `getService`. Это позволяет сервисам настраивать
или добавлять другие сервисы в контейнер.

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

Позволяет связать конструктор с уже существующим объектом. Может быть
использован для подмены зависимостей на мок-объекты, например,
при тестировании.

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
    // подменяем реальный ApiService на его мок-версию
    this.setService(ApiService, new MockApiService());
  }

  fetchData() {
    // этот вызов вернет экземпляр MockApiService
    const api = this.getService(ApiService);
    return api.fetch();
  }
}
```

### service.findService

Находит сервис по заданному условию (предикату). Поиск по умолчанию
ведется рекурсивно вверх по иерархии контейнеров.

Сигнатура:

```ts
/**
 * Найти сервис удовлетворяющий условию.
 *
 * @param predicate
 * @param noParent
 */
findService<T extends object>(
  predicate: FindServicePredicate<T>,
  noParent?: boolean,
): T | undefined;

/**
 * Определение функции-предиката.
 */
type FindServicePredicate<T extends object> = (
  ctor: Constructor<T>,
  container: ServiceContainer,
) => boolean;
```

Пример:

```js
class ReportService {
  static type = 'report';
}

class DashboardService {
  static type = 'dashboard';
}

class App extends Service {
  init() {
    this.addService(ReportService);
    this.addService(DashboardService);
  }
  
  getDashboard() {
    // найти сервис по статическому свойству
    return this.findService(ctor => ctor.type === 'dashboard');
  }
}
```

Второй аргумент `noParent` позволяет ограничить поиск только
текущим контейнером, в котором находится сервис.

## DebuggableService

Данный класс-сервис наследует `Debuggable` из встроенной отладочной библиотеки
и использует композицию для получения функциональности `Service`.  
*(см. подробнее [@e22m4u/js-debug](https://www.npmjs.com/package/@e22m4u/js-debug#класс-debuggable#класс-debuggable) раздел «Класс Debuggable»)*

```js
import {apiClient} from './path/to/apiClient';
import {DebuggableService} from '@e22m4u/js-service';

process.env['DEBUGGER_NAMESPACE'] = 'myApp';
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
