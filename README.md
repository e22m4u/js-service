## @e22m4u/js-service

Реализация паттерна «Сервис-локатор» и принципа «Инверсия управления» (IoC)
для JavaScript.

## Оглавление

- [Установка](#Установка)
- [Назначение](#Назначение)
- [Базовые примеры](#базовые-примеры)
- [ServiceContainer](#ServiceContainer)
- [Наследование](#Наследование)
- [Service](#Service)
- [DebuggableService](#DebuggableService)
- [Тесты](#Тесты)
- [Лицензия](#Лицензия)

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

## Назначение

Модуль предлагает два основных класса, `ServiceContainer` и `Service`,
которые можно использовать как по отдельности, так и вместе для построения
слабосвязанной архитектуры.

- `ServiceContainer` *(IoC-контейнер)*  
  Реализация сервис-контейнера через паттерн «Сервис-локатор»;
- `Service` *(абстрактный сервис)*  
  Позволяет скрывать работу с контейнером и внедрением зависимостей;

**Инверсия управления (IoC)**

В основе данной архитектуры лежит принцип **Inversion of Control**.
Вместо того, чтобы сервис сам создавал свои зависимости (например,
`const api = new ApiClient()`), он запрашивает их у *IoC-контейнера*.
Контроль над созданием объектов и управлением их жизненным циклом
*инвертируется* от сервиса к контейнеру.

**Ключевые преимущества**

- **Слабая связанность (Loose Coupling)**  
  Сервисы не зависят от конкретных реализаций своих зависимостей. Они просто
  запрашивают другие сервисы по классу-конструктору.
- **Централизованное управление**  
  Вся конфигурация зависимостей находится в одном месте (в контейнере),
  что делает архитектуру более прозрачной и управляемой.
- **Упрощение тестирования**  
  Поскольку зависимости не создаются внутри класса, их легко подменить
  на мок-объекты в тестах.

## Базовые примеры

Создание контейнера и экземпляра сервиса (Singleton).

```js
import {ServiceContainer} from '@e22m4u/js-service';

class LoggerService {
  log(message) {
    console.log(`[LOG]: ${message}`);
  }
}

const sc = new ServiceContainer();

const logger1 = sc.get(LoggerService); // создание и кэширование экземпляра
const logger2 = sc.get(LoggerService); // возврат существующего экземпляра

console.log(logger1 === logger2); // true
```

Использование сервиса внутри другого как зависимость.

```js
import {Service} from '@e22m4u/js-service';
import {ServiceContainer} from '@e22m4u/js-service';

// сервис-зависимость
class LoggerService {
  log(message) {
    console.log(`[LOG]: ${message}`);
  }
}

// наследование класса Service используется, когда
// для работы сервиса требуются зависимости
class CalculatorService extends Service {
  add(a, b) {
    const logger = this.getService(LoggerService); // <= зависимость
    const result = a + b;
    logger.log(`${a} + ${b} = ${result}`);
    return result;
  }
}

const sc = new ServiceContainer();
const calc = sc.get(CalculatorService);
calc.add(4, 6);
// [LOG]: 4 + 6 = 10
```

Сервис как точка входа в приложение.

```js
import {Service} from '@e22m4u/js-service';

// сервис-зависимость
class LoggerService {
  log(message) {
    console.log(`[LOG]: ${message}`);
  }
}

// сервис, для работы которого нужны другие сервисы
// (наследует класс Service для доступа к getService)
class UserService extends Service {
  findUserById(id) {
    const logger = this.getService(LoggerService); // <= зависимость
    logger.log(`Finding user by id ${id}`);
    
    const user = {id, name: 'Jane Doe'};
    logger.log(`Found user with name "${user.name}".`);
    return user;
  }
}

// основной сервис (точка входа) также наследует
// класс Service для доступа к методу getService
class App extends Service {
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
//   const sc = new ServiceContainer();
//   const app = sc.get(App);
//   app.start();
```

Подмена сервиса в контейнере (тестирование).

```js
// в тестах легко подменить реальный сервис на мок
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

- `get(ctor, ...args)` получить существующий или новый экземпляр;
- `getRegistered(ctor, ...args)` получить существующий или новый
  экземпляр, только если указанный конструктор зарегистрирован
  в контейнере, в противном случае выбрасывается ошибка;
- `has(ctor)` проверить существование конструктора в контейнере;
- `add(ctor, ...args)` добавить конструктор в контейнер (ленивая инициализация);
- `use(ctor, ...args)` добавить конструктор и сразу создать экземпляр;
- `set(ctor, service)` добавить конструктор и связанный с ним готовый экземпляр;
- `getParent()` получить родительский сервис-контейнер;
- `hasParent()` проверить наличие родительского сервис-контейнера;

### get

Метод `get` класса `ServiceContainer` создает экземпляр
полученного конструктора и сохраняет его для последующих
обращений по принципу "одиночки" (Singleton).

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
const myDate3 = container.get(Date, '2025-05-05'); // пересоздание
console.log(myDate1); // Wed Jan 01 2025 03:00:00
console.log(myDate2); // Wed Jan 01 2025 03:00:00
console.log(myDate3); // Sun May 05 2030 03:00:00
```

### Наследование

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

- `getService(ctor, ...args)` получить существующий или новый экземпляр;
- `getRegisteredService(ctor, ...args)` получить существующий или новый
  экземпляр, только если указанный конструктор зарегистрирован
  в контейнере, в противном случае выбрасывается ошибка;
- `hasService(ctor)` проверить существование конструктора в контейнере;
- `addService(ctor, ...args)` добавить конструктор в контейнер;
- `useService(ctor, ...args)` добавить конструктор и создать экземпляр;
- `setService(ctor, service)` добавить конструктор и его экземпляр;

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
в классе `Service` и его методе `getService`

### getService

Метод `getService` обеспечивает существование единственного
экземпляра запрашиваемого сервиса, а не создает каждый раз
новый. Тем не менее при передаче дополнительных аргументов,
сервис будет пересоздан с передачей этих аргументов
конструктору.

Пример:

```js
const foo1 = this.getService(Foo, 'arg'); // создание экземпляра
const foo2 = this.getService(Foo);        // возврат существующего
console.log(foo1 === foo2);               // true

const foo3 = this.getService(Foo, 'arg'); // пересоздание экземпляра
const foo4 = this.getService(Foo);        // возврат уже пересозданного
console.log(foo3 === foo4);               // true
```

## DebuggableService

Класс-сервис расширенный возможностями по отладке.  
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
