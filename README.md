## @e22m4u/js-service

Реализация паттерна «Сервис-локатор» для JavaScript.

## Оглавление

- [Установка](#Установка)
- [Назначение](#Назначение)
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

Модуль предлагает классы `ServiceContainer` и `Service`,
которые можно использовать как по отдельности, так и вместе.

- `ServiceContainer` - классическая версия сервис-локатора  
- `Service` - скрывает создание контейнера и его распространение

Класс `Service` удобен, когда приложение имеет единственную точку
входа, которая создается оператором `new`. Например, если такой
точкой является класс `Application`, то мы могли бы унаследовать
его от класса `Service`, и обращаться к другим сервисам методом
`getService` не заботясь о создании и хранении их экземпляров.

Кроме того, если другие сервисы так же наследуют от класса
`Service`, то они могут обращаться друг к другу используя
тот же метод `getService`, как если бы мы передавали
сервис-контейнер между ними.

## ServiceContainer

Методы:

- `get(ctor, ...args)` получить существующий или новый экземпляр
- `has(ctor)` проверить существование конструктора в контейнере
- `add(ctor, ...args)` добавить конструктор в контейнер
- `use(ctor, ...args)` добавить конструктор и создать экземпляр
- `set(ctor, service)` добавить конструктор и его экземпляр

- `getParent()` получить родительский сервис-контейнер
- `hasParent()` проверить наличие родительского сервис-контейнера

### get

Метод `get` класса `ServiceContainer` создает экземпляр
полученного конструктора и сохраняет его для последующих
обращений по принципу "одиночки".

Пример:

```js
import {ServiceContainer} from '@e22m4u/js-service';

// создание контейнера
const container = new ServiceContainer();

// в качестве сервиса используем класс Date
const myDate1 = container.get(Date); // создание экземпляра
const myDate2 = container.get(Date); // возврат существующего

console.log(myDate1); // Tue Sep 12 2023 19:50:16
console.log(myDate2); // Tue Sep 12 2023 19:50:16
console.log(myDate1 === myDate2); // true
```

Метод `get` может принимать аргументы конструктора. При этом,
если контейнер уже имеет экземпляр данного конструктора, то
он будет пересоздан с новыми аргументами.

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
запрашиваемого экземпляра (сервиса) не зарегистрирован в текущем.

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

- `getService(ctor, ...args)` получить существующий или новый экземпляр
- `hasService(ctor)` проверить существование конструктора в контейнере
- `addService(ctor, ...args)` добавить конструктор в контейнер
- `useService(ctor, ...args)` добавить конструктор и создать экземпляр
- `setService(ctor, service)` добавить конструктор и его экземпляр

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
и его передачу между сервисами, так как эта логика
инкапсулирована в классе `Service` и его методе `getService`

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

Данный класс расширяет базовый класс [Service](#service)
возможностями по отладке, предоставляемые модулем 
[@e22m4u/js-debug](https://www.npmjs.com/package/@e22m4u/js-debug#класс-debuggable)
(см. раздел *Класс Debuggable*).

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
