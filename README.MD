# TDD-Driven Event Sourcing

Test-Driven Development (TDD) focuses on solving tasks incrementally, one small step at a time. In this weekend assignment, you'll create a function to generate an aggregate from an event stream. Don't worry if you're unfamiliar with event streaming; we assume this might be new to you.

See [Event Sourcing 101](./event-sourcing-101.md) for a quick introduction. A quick note: avoid spending too much time reading about event streaming details online. This is a big subject but all you need to know for today is the very basics.

## Instructions

In this assignment, you will write functions for handling banking events to generate the status of a bank account. We have supplied a starting boilerplate for you in the [./src/accountAggregate.ts](./src/accountAggregate.ts) file and your mission is by using a TDD approach, step-by-step implement more and more functionality. The tests are here to guide you, and not to be changed at any point.

The first three tests should already pass, and you can continue from there. You’re finished once all the tests pass and you feel confident that the code reflects your best work. Remember to refactor!

## Info

Each test is using an array of events that can be found in the [./src/test-streams](./src/test-streams) folder. The supplied `readEventStream` function deserializes the .json file for you so that you have the array available as a normal JavaScript array. Feel free to review the files once you arrive at a correlating test.

We have also supplied you with the types for the events under [./src/accountAggregate.types.ts](./src/accountAggregate.types.ts). They are here to guide you on the expected format of each event. You will not have to create any types for yourself. It's fine to use `any` as the type for the generated `account` for now.

The tests are expecting a few certain errors. Here is the list of those errors:
```text
128 ERROR_ACCOUNT_UNINSTANTIATED
162 ERROR_EVENT_NOT_SUPPORTED
281 ERROR_BALANCE_SUCCEED_MAX_BALANCE
285 ERROR_BALANCE_IN_NEGATIVE
344 ERROR_TRANSACTION_REJECTED_ACCOUNT_DEACTIVATED
502 ERROR_ACCOUNT_CLOSED
511 ERROR_INVALID_EVENT_STREAM
```

### Note about the test

In this test, we are using the test-runner `vitest`and it's built-in method `expect(result).toMatchObject(expected);`. This verifies that the object `result` contains **at least** the same fields and content as the object `expected`, but it might contain more. This is done to prevent you from having to modify the tests. In a typical coding scenario, you would update the tests as new features are implemented.

## Tips

One way to keep your code clean is to use something called a [Guard Clause](https://deviq.com/design-patterns/guard-clause) 

## Evaluation and Handing in the solution

The tests will run automatically each time you push your code to GitHub. You can push as many times as you want.  
If you commit, but forget to push the code to GitHub, we will not have anything to evaluate.

## FAQ

I feel lost and overwhelmed!

> Remember to take it slow, and to solve the tests one at a time!

Am I done if all tests pass?

> We evaluate you on your code as a whole, not only if the tests pass or fail. So remember to think about formatting, naming and refactoring.

---

Good luck and Have Fun!
