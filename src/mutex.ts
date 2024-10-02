/* eslint-disable @typescript-eslint/no-explicit-any */
import { Mutex as ComposableMutex } from 'composable-locks';

/**
 * Method decorator that locks the method with a mutex.
 * Decorator must be used on an async method.
 * @param _target
 * @param _propertyKey
 * @param descriptor
 * @constructor
 */
export const Mutex = <
  Key extends string | number | symbol,
  R,
  Fn extends (...args: any[]) => Promise<R>,
  Target extends { [K in Key]: Fn },
>(
  _target: Target,
  _propertyKey: Key,
  descriptor: TypedPropertyDescriptor<Fn>,
) => {
  const composableMutex = new ComposableMutex();
  const originalMethod = descriptor.value!;
  descriptor.value = async function (this: Target, ...args: any[]) {
    const release = await composableMutex.acquire();
    try {
      return await originalMethod.apply(this, args);
    } finally {
      release();
    }
  } as Fn;
};
