import { ReentrantMutex } from './reentrantMutex';

class TestClass {
  private pending: boolean = false;
  private callCount: number = 0;

  public async operation(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 1));
  }

  @ReentrantMutex
  async method(initialCall = true): Promise<number> {
    // check if the method is already running
    if (initialCall && this.pending) {
      throw new Error('Method is already running');
    }

    if (initialCall) {
      this.pending = true;
      this.callCount++;
    }

    try {
      await this.operation();

      // do some recursion
      if (initialCall) {
        return this.method(false);
      }

      return this.callCount;
    } finally {
      this.pending = false;
    }
  }
}

describe('ReentrantMutex Decorator', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should handle concurrent calls by queuing them', async () => {
    const operationSpy = jest.spyOn(TestClass.prototype, 'operation');

    const instance = new TestClass();
    const promise1 = instance.method();
    const promise2 = instance.method();
    const [result1, result2] = await Promise.all([promise1, promise2]);
    expect(result1).toBe(1);
    expect(result2).toBe(2);
    expect(operationSpy).toHaveBeenCalledTimes(4);
  });

  it('should release the lock even if the method throws an error', async () => {
    const operationSpy = jest
      .spyOn(TestClass.prototype, 'operation')
      .mockRejectedValueOnce(new Error('test error'));

    const instance = new TestClass();
    await expect(instance.method()).rejects.toThrow('test error');
    await expect(instance.method()).resolves.toBe(2);

    expect(operationSpy).toHaveBeenCalledTimes(3);
  });
});
