import { Mutex } from './mutex';

class TestClass {
  private pending: boolean = false;
  private callCount: number = 0;

  public async operation(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 1));
  }

  @Mutex
  async method(): Promise<number> {
    if (this.pending) {
      throw new Error('Method is already running');
    }
    this.pending = true;
    this.callCount++;

    try {
      // Await breaks the synchronous flow and allows other calls to be queued, potentially
      // causing the method to be called multiple times concurrently
      await this.operation();
    } finally {
      this.pending = false;
    }

    return this.callCount;
  }
}

describe('Mutex Decorator', () => {
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
    expect(operationSpy).toHaveBeenCalledTimes(2);
  });

  it('should release the lock even if the method throws an error', async () => {
    const operationSpy = jest
      .spyOn(TestClass.prototype, 'operation')
      .mockRejectedValueOnce(new Error('test error'));

    const instance = new TestClass();
    await expect(instance.method()).rejects.toThrow('test error');
    await expect(instance.method()).resolves.toBe(2);

    expect(operationSpy).toHaveBeenCalledTimes(2);
  });
});
