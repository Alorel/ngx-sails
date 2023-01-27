# Angular bindings for the sails socket client

Used the abandoned [ngx-sails](https://github.com/brandom/ngx-sails) as a base.

## Installation

Angular 15:

```javascript
npm install @aloreljs/ngx-sails@~3.0.0 socket.io-client@^2.0.0
```

Angular 14:

```javascript
npm install @aloreljs/ngx-sails@~2.1.0 socket.io-client@^2.0.0
```

Angular 13:

```
npm install @aloreljs/ngx-sails@~2.0.0 socket.io-client@^2.0.0
```

## Configuration

The following injection tokens can be included in your app module to configure the client:

Provide an existing socket.io instance:

```typescript
import {IO_INSTANCE} from '@aloreljs/ngx-sails';

@NgModule({
  providers: [{
    provide: IO_INSTANCE,
    useValue: someIoRef
  }]
})
export class AppModule {}
```

Provide client configuration:

```typescript
import {NGX_SAILS_CONFIG, NgxSailsConfig} from '@aloreljs/ngx-sails';

const config: NgxSailsConfig = {
  uri: '/foo',
  // socket.io options
  options: {
  
  },
  // default headers
  headers: {
  
  }
}

@NgModule({
  providers: [{
    provide: NGX_SAILS_CONFIG,
    useValue: config
  }]
})
export class AppModule {}
```

## Usage

```typescript
import {SailsClient} from '@aloreljs/ngx-sails';

@Component({})
export class MyComponent {
  public constructor(private readonly sails: SailsClient) {}

  public listenForEvent(): void {
    this.sails.on('eventName').subscribe(response => {});
  }
 
  public makeRequest(): void {
    this.sails.get('url').subscribe();
    this.sails.post('url', {foo: 'bar'}).subscribe(response => {});
  }

  public emitEventWithoutAResponse(): void {
    this.sails.emit('eventName', 'arg1', 'arg2');
  }

  public emitEventWithAResponse(): void {
    this.sails.emitAndWait('eventName', 'arg1', 'arg2').subscribe(response => {})
  }
}
```
