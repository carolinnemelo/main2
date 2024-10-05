import type {
	AccountCreatedEvent,
	BankEvent,
	DeactivateEvent,
	DepositEvent,
	WithdrawalEvent,
} from "./accountAggregate.types";

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
				if (account.balance > account.maxBalance) {
					throw new Error("281 ERROR_BALANCE_SUCCEED_MAX_BALANCE");
				}
				break;
      case "withdrawal":
        if (!account) {
					throw new Error("128 ERROR_ACCOUNT_UNINSTANTIATED");
				}
        account = applyWithdrawal(account, event);
        if (account.balance < 0) {
					throw new Error("285 ERROR_BALANCE_IN_NEGATIVE");
				}
        break;
      case "deactivate":
        account = deactivateAccount(account, event);
        console.log(event.type)
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
		maxBalance: event.maxBalance,
		status: "active",
	};
}

function applyDeposit(account: any, event: DepositEvent) {
	return {
		...account,
		balance: account.balance + event.amount,
	};
}

function applyWithdrawal(account: any, event: WithdrawalEvent) {
	return {
		...account,
		balance: account.balance - event.amount,
	};
}

function deactivateAccount(account: any, event: DeactivateEvent) {
	return {
		...account,
		status: "disabled",
	};
}