## @e22m4u/service

Разновидность сервис-локатора для инкапсуляции процесса разрешения
зависимостей.

## Установка

```bash
npm install @e22m4u/service
```

## ServiceContainer

Метод `get` класса `ServiceContainer` инкапсулирует
создание экземпляра полученного конструктора и сохраняет
его для последующих обращений по принципу "одиночки".

Пример:

```js
import {ServiceContainer} from '@e22m4u/service';

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

## Service

Сервисом может являться совершенно любой класс. Однако,
если это наследник встроенного класса `Service`, то такой
сервис позволяет инкапсулировать создание сервис-контейнера,
его хранение и передачу другим сервисам.

Пример:

```js
import {Service} from '@e22m4u/service';

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

### this.getService

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

## Тесты

```bash
npm run test
```

## Лицензия

MIT
