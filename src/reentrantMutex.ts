/* eslint-disable @typescript-eslint/no-explicit-any */
import { Mutex, ReentrantMutex as CReentrantMutex } from 'composable-locks';
import { AsyncLocalStorage } from 'async_hooks';

/**
 * ReentrantMutex is a reentrant mutual exclusion lock decorator.
 * This allows reacquiring the lock in the same async context.
 * Uses async local storage to store to check if the lock is already acquired in
 * the current async context.
 */
export const ReentrantMutex = <
  Key extends string | number | symbol,
  R,
  Fn extends (...args: any[]) => Promise<R>,
  Target extends { [K in Key]: Fn },
>(
  _target: Target,
  _propertyKey: Key,
  descriptor: TypedPropertyDescriptor<Fn>,
) => {
  const composableMutex = new Mutex();
  const asyncLocalStorage = new AsyncLocalStorage<boolean>();

  const originalMethod = descriptor.value!;
  descriptor.value = async function (this: Target, ...args: any[]) {
    const isAcquired = asyncLocalStorage.getStore();
    if (isAcquired) {
      return originalMethod.apply(this, args);
    }

    const release = await composableMutex.acquire();
    return asyncLocalStorage.run(true, async () => {
      try {
        return await originalMethod.apply(this, args);
      } finally {
        release();
      }
    });
  } as Fn;
};
