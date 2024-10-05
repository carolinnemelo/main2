import { timeStamp } from "node:console";
import type {
	AccountCreatedEvent,
	ActivateEvent,
	BankEvent,
	ClosureEvent,
	DeactivateEvent,
	DepositEvent,
	WithdrawalEvent,
} from "./accountAggregate.types";
import type { an } from "vitest/dist/chunks/reporters.DAfKSDh5.js";

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
        if (account.status === "disabled") {
					throw new Error("344 ERROR_TRANSACTION_REJECTED_ACCOUNT_DEACTIVATED");
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
        if (account.status === "disabled") {
					throw new Error("344 ERROR_TRANSACTION_REJECTED_ACCOUNT_DEACTIVATED");
				}
				account = applyWithdrawal(account, event);
				if (account.balance < 0) {
					throw new Error("285 ERROR_BALANCE_IN_NEGATIVE");
				}
				break;
			case "deactivate":
				account = deactivateAccount(account, event);
				break;
      case "activate":
				account = activateAccount(account, event);
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
  if (account.accountLog.length > 0) {
		account.accountLog.push({
			type: event.type.toUpperCase(),
			timestamp: event.timestamp,
			message: event.reason,
		});
		return {
			...account,
			status: "disabled",
		};
	}

	return {
		...account,
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
    status: "active"
  }

}

function closeAccount(account: any, event: ClosureEvent) {
  return {
    ...account,
    status: "closed"
  }
}