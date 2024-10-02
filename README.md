# Mutex Decorators Library

This library provides two TypeScript decorators, `Mutex` and `ReentrantMutex`, for locking methods to ensure mutual exclusion in asynchronous contexts.

Under the hood, the library uses [composable-locks](https://www.npmjs.com/package/composable-locks) to provide the Mutex locking mechanism.

In contrast to `composable-locks`, the `ReentrantMutex` decorator doesn't depend on domain symbols use and instead uses `AsyncLocalStorage` to keep the recursive lock state.

## Installation

Install the library using npm:

```sh
npm install composable-locks
```

## Usage

### Mutex Decorator

The `Mutex` decorator ensures that the decorated method is locked with a mutex, allowing only one execution at a time. It queues concurrent calls and executes them sequentially.

#### Example

```typescript
import { Mutex } from './mutex';

class ExampleClass {
  @Mutex
  async criticalSection() {
    // Your code here
  }
}

const instance = new ExampleClass();
instance.criticalSection();
```

### ReentrantMutex Decorator

The `ReentrantMutex` decorator allows reentrant locking in the same asynchronous context. It uses `AsyncLocalStorage` to check if the lock is already acquired in the current async context.

Because the use of `AsyncLocalStorage` is used, a minimal performance and/or memory overhead is expected. Thus, it is recommended to use `ReentrantMutex` only when recursive calls are expected.

#### Example

```typescript
import { ReentrantMutex } from './reentrantMutex';

class ExampleClass {
  @ReentrantMutex
  async criticalSection() {
    // Your code here
  }
}

const instance = new ExampleClass();
instance.criticalSection();
```

## Testing

The library includes tests for both decorators using Jest. To run the tests, use the following command:

```sh
npm test
```

## License

This project is licensed under the MIT License.
