export type BankEvent =
  | AccountCreatedEvent
  | DepositEvent
  | WithdrawalEvent
  | DeactivateEvent
  | ActivateEvent
  | ClosureEvent
  | CurrencyChangeEvent;

interface BaseEvent {
  eventId: number;
  timestamp: string;
  accountId: string;
}

export interface AccountCreatedEvent extends BaseEvent {
  type: 'account-created';
  customerId: string;
  initialBalance: number;
  maxBalance: number;
  currency: 'USD' | 'SEK' | 'GBP';
}

export interface DepositEvent extends BaseEvent {
  type: 'deposit';
  amount: number;
  transactionId: string;
  currency: 'USD' | 'SEK' | 'GBP';
}

export interface WithdrawalEvent extends BaseEvent {
  type: 'withdrawal';
  amount: number;
  transactionId: string;
  currency: 'USD' | 'SEK' | 'GBP';
}

export interface CurrencyChangeEvent extends BaseEvent {
  type: 'currency-change';
  newBalance: number;
  newCurrency: 'USD' | 'SEK' | 'GBP';
}

export interface DeactivateEvent extends BaseEvent {
  type: 'deactivate';
  reason: string;
}

export interface ActivateEvent extends BaseEvent {
  type: 'activate';
}

export interface ClosureEvent extends BaseEvent {
  type: 'closure';
  reason: string;
}

export type LogMessage = {
  type: string;
  message: string;
  timestamp: string;
};
