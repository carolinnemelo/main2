import type { AccountCreatedEvent, BankEvent, DepositEvent } from './accountAggregate.types';

export const generateAggregate = (events: BankEvent[]) => {

  let account: any = null;

  events.forEach((event) => {
    switch (event.type) {
			case "account-created":
				account = initializeAccount(event);
				break;
			case "deposit":
				if (!account) {
					throw new Error("128 ERROR_ACCOUNT_UNINSTANTIATED");
				}
				account = applyDeposit(account, event);
				break;
			default:
				throw new Error("162 ERROR_EVENT_NOT_SUPPORTED");
		}
  });

  return account;
};

function initializeAccount(event: AccountCreatedEvent) {
  return {
    accountId: event.accountId,
    customerId: event.customerId,
    balance: event.initialBalance,
    currency: event.currency,
  };
}

function applyDeposit(account: any, event: DepositEvent) {
  return {
    ...account,
    balance: account.balance + event.amount,
  };
}
