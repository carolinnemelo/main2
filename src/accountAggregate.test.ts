import { join } from 'node:path';
import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { generateAggregate } from './accountAggregate';

const readEventStream = (fileName: string) =>
  readFile(join('src', 'test-streams', fileName), { encoding: 'utf8' })
    .then(JSON.parse);

describe('AccountAggregation', () => {
  it('should return null from an empty stream', async () => {
    // Arrange
    const events = await readEventStream('stream-000.json');
    // Act
    const result = generateAggregate(events);
    // Assert
    expect(result).toBeNull();
  });

  it('should throw from an unsupported event', async () => {
    // Arrange
    const events = await readEventStream('stream-002.json');
    // Act
    expect(() => generateAggregate(events)).toThrowError(/162/);
  });

  describe("starting with an 'account-created' event", () => {
    it('should create an account', async () => {
      // Arrange
      const events = await readEventStream('stream-001.json');
      const expectedAccount = {
        accountId: 'ACC123456',
        balance: 5000,
        currency: 'USD',
        customerId: 'CUST001',
      };
      // Act
      const result = generateAggregate(events);
      // Assert
      expect(result).toMatchObject(expectedAccount);
    });
  });

  describe("containing 'deposit' events", () => {
    it('should increase amount of money from one deposit', async () => {
      // Arrange
      const events = await readEventStream('stream-003.json');
      const expectedAccount = {
        accountId: 'ACC123456',
        balance: 5500,
        currency: 'USD',
        customerId: 'CUST001',
      };
      // Act
      const result = generateAggregate(events);
      // Assert
      expect(result).toMatchObject(expectedAccount);
    });

    it('should chain multiple deposits', async () => {
      // Arrange
      const events = await readEventStream('stream-004.json');
      const expectedAccount = {
        accountId: 'ACC123456',
        balance: 5700,
        currency: 'USD',
        customerId: 'CUST001',
      };
      // Act
      const result = generateAggregate(events);
      // Assert
      expect(result).toMatchObject(expectedAccount);
    });

    it.skip("should throw if done before an 'account-created' event", async () => {
      // Arrange
      const events = await readEventStream('stream-005.json');

      // Assert
      expect(() => generateAggregate(events)).toThrowError(/128/);


    });

    it('should throw if total amount after deposit goes above account maxBalance', async () => {
      // Arrange
      const events = await readEventStream('stream-006.json');
      // Assert
      expect(() => generateAggregate(events)).toThrowError(/281/);
    });
  });

  describe("containing 'withdrawal' events", () => {
    it('should decrease amount of money from one deposit', async () => {
      // Arrange
      const events = await readEventStream('stream-007.json');
      const expectedAccount = {
        accountId: 'ACC123456',
        balance: 4500,
        currency: 'USD',
        customerId: 'CUST001',
      };
      // Act
      const result = generateAggregate(events);
      // Assert
      expect(result).toMatchObject(expectedAccount);
    });

    it('should chain multiple withdrawal', async () => {
      // Arrange
      const events = await readEventStream('stream-008.json');
      const expectedAccount = {
        accountId: 'ACC123456',
        balance: 4300,
        currency: 'USD',
        customerId: 'CUST001',
      };
      // Act
      const result = generateAggregate(events);
      // Assert
      expect(result).toMatchObject(expectedAccount);
    });

    it("should throw if done before an 'account-created' event", async () => {
      // Arrange
      const events = await readEventStream('stream-009.json');
      // Assert
      expect(() => generateAggregate(events)).toThrowError(/128/);
    });

    it('should chain together with deposit', async () => {
      // Arrange
      const events = await readEventStream('stream-010.json');
      const expectedAccount = {
        accountId: 'ACC123456',
        balance: 4600,
        currency: 'USD',
        customerId: 'CUST001',
      };
      // Act
      const result = generateAggregate(events);
      // Assert
      expect(result).toMatchObject(expectedAccount);
    });

    it('should throw if total amount after withdrawal goes below 0', async () => {
      // Arrange
      const events = await readEventStream('stream-011.json');
      // Assert
      expect(() => generateAggregate(events)).toThrowError(/285/);
    });
  });

  describe.skip("containing 'deactivate' events", () => {
    it('should deactivate an active account', async () => {
      // Arrange
      const events = await readEventStream('stream-012.json');
      const expectedAccount = {
        accountId: 'ACC123456',
        balance: 5000,
        currency: 'USD',
        customerId: 'CUST001',
        status: 'disabled',
      };
      // Act
      const result = generateAggregate(events);
      // Assert
      expect(result).toMatchObject(expectedAccount);
    });

    it('should add reason to the account log', async () => {
      // Arrange
      const events = await readEventStream('stream-012.json');
      const expectedAccount = {
        accountId: 'ACC123456',
        balance: 5000,
        currency: 'USD',
        customerId: 'CUST001',
        status: 'disabled',
        accountLog: [
          {
            type: 'DEACTIVATE',
            message: 'Account inactive for 270 days',
            timestamp: '2024-10-02T10:30:00Z',
          },
        ],
      };
      // Act
      const result = generateAggregate(events);
      // Assert
      expect(result).toMatchObject(expectedAccount);
    });

    it("should add additional 'deactivate' events to the account log", async () => {
      // Arrange
      const events = await readEventStream('stream-013.json');
      const expectedAccount = {
        accountId: 'ACC123456',
        balance: 5000,
        currency: 'USD',
        customerId: 'CUST001',
        status: 'disabled',
        accountLog: [
          {
            type: 'DEACTIVATE',
            message: 'Account inactive for 270 days',
            timestamp: '2024-10-02T10:30:00Z',
          },
          {
            type: 'DEACTIVATE',
            message: 'Security alert: suspicious activity',
            timestamp: '2024-10-03T10:30:00Z',
          },
        ],
      };
      // Act
      const result = generateAggregate(events);
      // Assert
      expect(result).toMatchObject(expectedAccount);
    });

    it('should throw if deposit is done after deactivation', async () => {
      // Arrange
      const events = await readEventStream('stream-014.json');
      // Assert
      expect(() => generateAggregate(events)).toThrowError(/344/);
    });

    it('should throw if withdrawal is done after deactivation', async () => {
      // Arrange
      const events = await readEventStream('stream-015.json');
      // Assert
      expect(() => generateAggregate(events)).toThrowError(/344/);
    });
  });

  describe.skip("containing 'activate' events", () => {
    it('should activate a deactivated account', async () => {
      // Arrange
      const events = await readEventStream('stream-016.json');
      const expectedAccount = {
        accountId: 'ACC123456',
        balance: 5000,
        currency: 'USD',
        customerId: 'CUST001',
        status: 'active',
      };
      // Act
      const result = generateAggregate(events);
      // Assert
      expect(result).toMatchObject(expectedAccount);
    });

    it("should add 'activation' event to the account log", async () => {
      // Arrange
      const events = await readEventStream('stream-016.json');
      const expectedAccount = {
        accountId: 'ACC123456',
        balance: 5000,
        currency: 'USD',
        customerId: 'CUST001',
        status: 'active',
        accountLog: [
          {
            type: 'DEACTIVATE',
            message: 'Account inactive for 270 days',
            timestamp: '2024-10-02T10:30:00Z',
          },
          {
            type: 'ACTIVATE',
            message: 'Account reactivated',
            timestamp: '2024-10-03T10:30:00Z',
          },
        ],
      };
      // Act
      const result = generateAggregate(events);
      // Assert
      expect(result).toMatchObject(expectedAccount);
    });

    it("should not add 'activation' event to the account log if account is already active", async () => {
      // Arrange
      const events = await readEventStream('stream-017.json');
      const expectedAccount = {
        accountId: 'ACC123456',
        balance: 5000,
        currency: 'USD',
        customerId: 'CUST001',
        status: 'active',
        accountLog: [
          {
            type: 'DEACTIVATE',
            message: 'Account inactive for 270 days',
            timestamp: '2024-10-02T10:30:00Z',
          },
          {
            type: 'ACTIVATE',
            message: 'Account reactivated',
            timestamp: '2024-10-03T10:30:00Z',
          },
        ],
      };
      // Act
      const result = generateAggregate(events);
      // Assert
      expect(result).toMatchObject(expectedAccount);
    });
  });

  describe.skip("containing a 'closure' event", () => {
    it('should close an account', async () => {
      // Arrange
      const events = await readEventStream('stream-018.json');
      const expectedAccount = {
        accountId: 'ACC123456',
        balance: 5000,
        currency: 'USD',
        customerId: 'CUST001',
        status: 'closed',
      };
      // Act
      const result = generateAggregate(events);
      // Assert
      expect(result).toMatchObject(expectedAccount);
    });

    it('should add the closure to the account log', async () => {
      // Arrange
      const events = await readEventStream('stream-018.json');
      const expectedAccount = {
        accountId: 'ACC123456',
        balance: 5000,
        currency: 'USD',
        customerId: 'CUST001',
        status: 'closed',
        accountLog: [
          {
            type: 'CLOSURE',
            message: "Reason: Customer request, Closing Balance: '5000'",
            timestamp: '2024-10-02T10:30:00Z',
          },
        ],
      };
      // Act
      const result = generateAggregate(events);
      // Assert
      expect(result).toMatchObject(expectedAccount);
    });

    it('should throw from any future events an account', async () => {
      // Arrange
      const events = await readEventStream('stream-019.json');
      // Assert
      expect(() => generateAggregate(events)).toThrowError(/502/);
    });
  });

  describe.skip("containing a 'currency-change' event", () => {
    it('should change currency', async () => {
      // Arrange
      const events = await readEventStream('stream-020.json');
      const expectedAccount = {
        accountId: 'ACC123456',
        balance: 51000,
        currency: 'SEK',
        customerId: 'CUST001',
      };
      // Act
      const result = generateAggregate(events);
      // Assert
      expect(result).toMatchObject(expectedAccount);
    });

    it("should add 'currency-change' event to the log", async () => {
      // Arrange
      const events = await readEventStream('stream-020.json');
      const expectedAccount = {
        accountId: 'ACC123456',
        balance: 51000,
        currency: 'SEK',
        customerId: 'CUST001',
        accountLog: [
          {
            type: 'CURRENCY-CHANGE',
            message: "Change currency from 'USD' to 'SEK'",
            timestamp: '2024-10-02T10:30:00Z',
          },
        ],
      };
      // Act
      const result = generateAggregate(events);
      // Assert
      expect(result).toMatchObject(expectedAccount);
    });
  });

  it.skip('should throw if event is missing from the event stream', async () => {
    // Arrange
    const events = await readEventStream('stream-021.json');
    // Assert
    expect(() => generateAggregate(events)).toThrowError(/511/);
  });
});
