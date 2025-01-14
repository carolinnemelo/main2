import type {
	AccountCreatedEvent,
	ActivateEvent,
	BankEvent,
	ClosureEvent,
	CurrencyChangeEvent,
	DeactivateEvent,
	DepositEvent,
	WithdrawalEvent,
} from "./accountAggregate.types";

export const generateAggregate = (events: BankEvent[]) => {
	let account: any = null;

	events.forEach((event) => {
		if (account && account.status === "closed") {
			throw new Error("502 ERROR_ACCOUNT_CLOSED");
		}
		if (account && account.revision + 1 !== event.eventId) {
			throw new Error("511 ERROR_INVALID_EVENT_STREAM");
		}

		switch (event.type) {
			case "account-created":
				account = initializeAccount(event);
				break;
			case "deposit":
				account = applyDeposit(account, event);
				break;
			case "withdrawal":
				account = applyWithdrawal(account, event);
				break;
			case "deactivate":
				account = deactivateAccount(account, event);
				break;
			case "activate":
				account = activateAccount(account, event);
				break;
			case "closure":
				account = closeAccount(account, event);
				break;
			case "currency-change":
				account = currencyChange(account, event);
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
		accountLog: [],
		revision: event.eventId,
	};
}

function applyDeposit(account: any, event: DepositEvent) {
	if (!account) {
		throw new Error("128 ERROR_ACCOUNT_UNINSTANTIATED");
	}
	if (account.status === "disabled") {
		throw new Error("344 ERROR_TRANSACTION_REJECTED_ACCOUNT_DEACTIVATED");
	}
	if (account.balance + event.amount > account.maxBalance) {
		throw new Error("281 ERROR_BALANCE_SUCCEED_MAX_BALANCE");
	}
	return {
		...account,
		revision: account.revision + 1,
		balance: account.balance + event.amount,
	};
}

function applyWithdrawal(account: any, event: WithdrawalEvent) {
	if (!account) {
		throw new Error("128 ERROR_ACCOUNT_UNINSTANTIATED");
	}
	if (account.status === "disabled") {
		throw new Error("344 ERROR_TRANSACTION_REJECTED_ACCOUNT_DEACTIVATED");
	}
	if (account.balance - event.amount < 0) {
		throw new Error("285 ERROR_BALANCE_IN_NEGATIVE");
	}
	return {
		...account,
		revision: account.revision + 1,
		balance: account.balance - event.amount,
	};
}

function deactivateAccount(account: any, event: DeactivateEvent) {
	if (account.accountLog.length > 0) {
		account.accountLog.push({
			type: event.type.toUpperCase(),
			timestamp: event.timestamp,
			message: event.reason,
		});
		return {
			...account,
			revision: account.revision + 1,
			status: "disabled",
		};
	}

	return {
		...account,
		revision: account.revision + 1,
		status: "disabled",
		accountLog: [
			{
				type: event.type.toUpperCase(),
				timestamp: event.timestamp,
				message: event.reason,
			},
		],
	};
}

function activateAccount(account: any, event: ActivateEvent) {
	if (account.status === "active") {
		return { ...account };
	}
	account.accountLog.push({
		type: event.type.toUpperCase(),
		timestamp: event.timestamp,
		message: "Account reactivated",
	});
	return {
		...account,
		revision: account.revision + 1,
		status: "active",
	};
}

function closeAccount(account: any, event: ClosureEvent) {
	account.accountLog.push({
		type: event.type.toUpperCase(),
		timestamp: event.timestamp,
		message: `Reason: ${event.reason}, Closing Balance: '${account.balance}'`,
	});
	return {
		...account,
		status: "closed",
	};
}

function currencyChange(account: any, event: CurrencyChangeEvent) {
	account.accountLog.push({
		type: event.type.toUpperCase(),
		timestamp: event.timestamp,
		message: `Change currency from '${account.currency}' to '${event.newCurrency}'`,
	});
	return {
		...account,
		revision: account.revision + 1,
		balance: event.newBalance,
		currency: event.newCurrency,
	};
}