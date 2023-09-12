## @e22m4u/service

Разновидность сервис-локатора для инкапсуляции процесса разрешения
зависимостей.

## Установка

```bash
npm install @e22m4u/service
```

## ServiceContainer

Метод `get` контейнера `ServiceContainer` инкапсулирует
создание экземпляра полученного конструктора и сохраняет
его для последующих обращений по принципу "одиночки".

Пример:

```js
import {ServiceContainer} from '@e22m4u/service';

// создание контейнера
const container = new ServiceContainer();

// для примера используется конструктор Date
const myDate1 = container.get(Date);
const myDate2 = container.get(Date);

console.log(myDate1); // Tue Sep 12 2023 19:50:16
console.log(myDate2); // Tue Sep 12 2023 19:50:16
console.log(myDate1 === myDate2); // true
```

Метод `get` может принимать аргументы конструктора. При этом,
если контейнер уже имеет сохраненный экземпляр данного
конструктора, то он будет пересоздан с новыми аргументами.

Пример:

```js
const myDate1 = container.get(Date, '2025-01-01');
const myDate2 = container.get(Date);
const myDate3 = container.get(Date, '2025-05-05');
console.log(myDate1); // Wed Jan 01 2025 03:00:00
console.log(myDate2); // Wed Jan 01 2025 03:00:00
console.log(myDate3); // Sun May 05 2030 03:00:00
```

## Service

Сервисом может являться совершенно любой класс. Однако,
если это наследник встроенного класса `Service`, то такой
сервис позволяет инкапсулировать создание самого
сервис-контейнера и его хранение.

Пример:

```js
// создадим сервис сообщений Messenger
class Messenger {
  // и метод выводящий полученное сообщение
  send(message) {
    console.log(`[Messenger] ${message}`);
  }
}

// создадим сервис приветствия Greeter
// наследуя поведение класса Service
class Greeter extends Service {
  // и приветствующий метод hello
  hello(name) {
    // в котором получим сервис Messenger,
    // используя унаследованный метод getService
    const messenger = this.getService(Messenger);
    // и отправим наше приветствие методом send
    messenger.send(`Hello ${name}!`);
  }
}

// создадим экземпляр сервиса Greeter
const greeter = new Greeter();

greeter.hello('Peter');
// [Messenger] Hello Peter!

greeter.hello('Jesse');
// [Messenger] Hello Jesse!
```

В примере выше мы не заботились о создании экземпляра
сервис-контейнера и его передачу между сервисами, так как
эта логика инкапсулирована в классе `Service` и его методе
`getService`

## Тесты

```bash
npm run test
```

## Лицензия

MIT
