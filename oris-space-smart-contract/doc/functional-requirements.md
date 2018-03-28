# Oris Space Smart Contract Functional Requirements

This document describes functional requirements for Oris Space Smart Contract.

## 1. Introduction

Oris Space Smart Contract is an Ethereum smart contracts that hold Orgon tokens belonging to Orgon as well as referral Orgon tokens.
The smart contract applies certain restrictions on how these tokens could be used.
Here is the list of these restrictions:
1. No tokens may be sent from Oris Space Smart Contract balance before "reserve" phase of token sale is finished.
2. Total number of tokens that could be sent to any single address is limited, where initial value for the limit is 100 Orgon tokens, this limit may be increasesd by Oris Space administrator, but the limit may not go below 0.01 Orgon tokens.

The following sections describe in details all use cases of Oris Space smart contract.

## 2. Use Cases

This section describes all use cases of Oris Space Smart Contract.

### 2.1. Deply

**Actors:** _User_, _Smart Contract_

**Goal:** _User_ wants to deploy _Smart Contract_

##### Main Flow:

1. _User_ deploys _Smart Contract_ providing the following information as constructor parameters: address of Orgon Token Smart Contract, address of the owner of Oris Space Smrt Contract
2. _Smart Contract_ remembers given address of Orgon Tokens smart contract
3. _Smart Contract_ remembers address of its owner
4. _Smart Contract_ sent transfer limit to initial value, i.e. to 100 Orgon tokens

### 2.2. Send

**Actors:** _User_, _Smart Contract_

**Goal:** _User_ wants to send some Orgon tokens from the balance of _Smart Contact_ to the owner of certain address

##### Main Flow:

1. _User_ calls method of _Smart Contract_ providing the following information as method parameters: address to send Orgon tokens to the owner of and number of Orgon tokens to be sent
2. _User_ is the owner of _Smart Contract_
3. _Smart Contract_ is started
4. After sending requested number of Orgon tokens to requested address, total number of Orgon tokens sent from Oris Space smart contract to this address (excluding tokens sent in "Start" use case) will not exceed current transfer limit
5. _Smart Contract_ sends requested number of Orgon tokens to the owner of given address
6. Token transfer succeeded
7. _Smart Contract_ returns success indicator to _User_

##### Exceptional Flow 1:

1. Same as in Main Flow
2. _User_ is not the owner of _Smart Contract_
3. _Smart Contract_ cancels transaction

##### Exceptional Flow 2:

1. Same as in Main Flow
2. Same as in Main Flow
3. _Smart Contract_ is not started
4. _Smart Contract_ cancels transaction

##### Exceptional Flow 3:

1. Same as in Main Flow
2. Same as in Main Flow
3. Same as in Main Flow
4. After sending requested number of Orgon tokens to requested address, total number of Orgon tokens sent from Oris Space smart contract ot thie address (excluding tokens sent in "Start" use case) will exceed current transfer limit
5. _Smart Contract_ cancels transaction

##### Exceptional Flow 4:

1. Same as in Main Flow
2. Same as in Main Flow
3. Same as in Main Flow
4. Same as in Main Flow
5. Same as in Main Flow
6. Token transfer failed
7. _Smart Contract_ returns error indicator to _User_

### 2.3. SetTransferLimit

**Actors:** _User_, _Smart Contract_

**Goal:** _User_ wants to set new transfer limit, i.e. maximum number of Orgon tokens that could be sent to from Oris Space smart contract to any single address, excluding tokens sent in "Start" use case

##### Main Flow:

1. _User_ calls method on _Smart Contract_ providing the following information as method parameters: new transfer limit value
2. _User_ is the owner of _Smart Contract_
3. New transfer limit is less than current transfer limit
4. New transfer limit is greater than or equal to minimum allowed transfer limit, i.e. to 0.01 Orgon tokens
5. _Smart Contract_ remembers new transfer limit value

##### Exceptional Flow 1:

1. Same as in Main Flow
2. _User_ is not the owner of _Smart Contract_
3. _Smart Contract_ cancels transaction

##### Exceptional Flow 2:

1. Same as in Main Flow
2. Same as in Main Flow
3. New transfer limit is less than or equal to current transfer limit
4. _Smart Contract_ cancels transaction

##### Exceptional Flow 3:

1. Same as in Main Flow
2. Same as in Main Flow
3. Same as in Main Flow
4. New transfer limit is less than minimum allowed transfer limit, i.e. than 0.01 orgon tokens
5. _Smart Contract_ cancels transaction

### 2.4. Start

**Actors:** _User_, _Smart Contract_

**Goal:** _User_ wants to start _Smart Contract_ and get some Orgon tokens from it

##### Main Flow:

1. _User_ calls method on _Smart Conract_ providing the following information as method parameters: number of Orgon tokens to get from _Smart Contract_
2. _User_ is the owner of Orgon Token Smart Contract (not _Smart Contract_)
3. _Smart Contract_ is not started
4. Number of Orgon tokens _User_ wants to get from _Smart Contract_ is greater than zero
5. _Smart Contract_ sends requested number of Orgon tokens to _User_
6. Token transfer succeeded
7. _Smart Contract_ starts

##### Exceptional flow 1:

1. Same as in Main Flow
2. _User_ is not the owner of Orgon Token Smart Contract
3. _Smart Contract_ cancels transaction

##### Exceptional Flow 2:

1. Same as in Main Flow
2. Same as in Main Flow
3. _Smart Contract_ is already started
4. _Smart Contract_ cancels transaction

##### Exceptional Flow 3:

1. Same as in Main Flow
2. Same as in Main Flow
3. Same as in Main Flow
4. Number of Orgon tokens _User_ wants to get from _Smart Contract_ is zero
5. _Smart Contract_ starts

##### Exceptional flow 4:

1. Same as in Main Flow
2. Same as in Main Flow
3. Same as in Main Flow
4. Same as in Main Flow
5. Same as in Main Flow
6. Token transfer failed
7. _Smart Contract_ cancels transaction


