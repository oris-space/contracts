# Orgon Token Smart Contract: Functional Requirements #

This document summarizes functional requirements for a smart contract that manages Orgon tokens.

## 1. Functional Blocks ##

This section describes high-level blocks of functionality and lists use cases for each block.

### 1.1. EIP-20 API Support ###

To make Orgon tokens compatible with existing wallets, exchanges, blockchain explorers and other software constituting Ethereum ecosystem, Orgon Token Smart Contract has to implement standard Ethereum Token API known as EIP-20.
This API is defined here: https://github.com/ethereum/EIPs/blob/master/EIPS/eip-20-token-standard.md.

#### Use cases: ####

1. EIP20:Name - Get name of the token
2. EIP20:Symbol - Get symbol of the token
3. EIP20:Decimals - Get number of decimals for the token
4. EIP20:TotalSupply - Retrieve the total number of tokens in circulation
5. EIP20:BalanceOf - Know how many tokens belongs to the owner of a certain address
6. EIP20:Transfer - Transfer own tokens to a certain address
7. EIP20:TransferFrom - Transfer other's tokens to a certain address
8. EIP20:Approve - Allow certain number of own tokens to be transferred by the owner of the certain address
9. EIP20:Allowance - Know how many tokens belonging to the owner of one address the owner of another address is currently allowed to transfer

### 1.2. Creating and Burning Tokens ###

This functional block allows smart contract owner to create and burn tokens.

#### Use Cases: ####

1. Token:Create - Create tokens
2. Token:Burn - Burn (i.e. destroy) tokens

### 1.3. Administration ###

This functional block contains various administration functionality.

#### Use Cases: ####

1. Admin:Deploy: - Deploy smart contract and issue tokens
2. Admin:SetOwner - Set new owner for the contract
3. Admin:Owner - Get address of the owner of smart contract

## 2. EIP-20 API Support Use Cases ##

This section describes use cases from EIP-20 API Support functional block.

### 2.1. EIP20:Name ###

**Actors:** User, Smart Contract

**Goal:** User wants to know name of the token

#### Main Flow: ####

1. User calls constant method on Smart Contract (constant method means method that does not modify blockchain state, so such method may be called locally consuming zero gas)
2. Smart Contract returns name of the token to the User

### 2.2. EIP20:Symbol ###

**Actors:** User, Smart Contract

**Goal:** User wants to know symbol of the token

#### Main Flow: ####

1. User calls constant method on Smart Contract (constant method means method that does not modify blockchain state, so such method may be called locally consuming zero gas)
2. Smart Contract returns symbol of the token to the User

### 2.3. EIP20:Decimals ###

**Actors:** User, Smart Contract

**Goal:** User wants to know how many tokens are currently in circulation

#### Main Flow: ####

1. User calls constant method on Smart Contract
2. Smart Contract returns number of decimals for the token to the User

### 2.4. EIP20:TotalSupply ###

**Actors:** User, Smart Contract

**Goal:** User wants to know how many tokens are currently in circulation

#### Main Flow: ####

1. User calls constant method on Smart Contract
2. Smart Contract returns total number of tokens in circulation to the User

### 2.5. EIP20:BalanceOf ###

**Actors:** User, Smart Contract

**Goal:** User wants to know how many tokens currently belong to the owner of certain address

#### Main Flow: ####

1. User calls constant method on Smart Contract providing the following information as method parameters: address User wants to know number of tokens belonging to
2. Smart Contract returns to User number of tokens currently belonging to the given address

### 2.6. EIP20:Transfer ###

**Actors:** Owner, Smart Contract

**Goal:** Owner wants to transfer certain amount of his tokens to the owner of certain address

#### Main Flow: ####

1. Owner calls method on Smart Contract providing the following information as method parameters: number of tokens to transfer, address Owner wants to transfer tokens to the owner of
2. Owner currently has enough tokens to transfer
3. Smart Contract transfers requested number of tokens from Owner to the owner of the given address
4. Smart Contract logs token transfer event with the following information: number of tokens transferred, Owner's address, the address tokens were transferred to the owner of
5. Smart Contract returns success indicator to Owner

#### Exceptional Flow 1: ####

1. Same as in main flow
2. Owner currently does not have enough tokens to transfer
3. Smart Contract returns error indicator to Owner

### 2.7. EIP20:TransferFrom ###

**Actors:** Spender, Smart Contract

**Goal:** Spender wants to transfer certain number of tokens from the owner of certain source address to the owner of certain destination address

#### Main Flow: ####

1. Spender calls method on Smart Contract providing the following information as method parameters: number of tokens to transfer, source address, destination address
2. Spender is currently allowed to transfer requested number of tokens belonging to the owner of source address
3. The owner of the source address has enough tokens to transfer
4. Smart Contract transfers requested number of tokens from the owner of source address to the source address to the owner of the destination address
5. Smart Contract reduces number of tokens belonging to the owner of source address that Spender is allowed to transfer
6. Smart Contract logs token transfer event with the following information: number of tokens transferred, source address, destination address
7. Smart Contract returns success indicator to Spender

#### Exceptional Flow 1: ####

1. Same as in main flow
2. Spender is currently not allowed to transfer requested number of tokens belonging to the owner of source address
3. Smart Contract returns error indicator to Spender

#### Exceptional Flow 2: ####

1. Same as in main flow
2. Same as in main flow
3. The owner of the source address does not have enough tokens to transfer
4. Smart Contract returns error indicator to Spender

### 2.8. EIP20:Approve ###

**Actors:** Owner, Smart Contract

**Goal:** Owner wants to set how many of the tokens belonging to Owner, the owner of certain address is allowed to transfer

#### Main Flow: ####

1. Owner calls method on Smart Contract providing the following information as method parameters: number of tokens to allow to be transferred by the owner of the certain address, address to allow the owner of to transfer certain number of tokens belonging to the Owner
2. Smart Contract sets to given value the number of tokens belonging to Owner that are allowed to be transferred by the owner of the given address
3. Smart Contract logs token transfer approval event with the following information: number of tokens allowed to transfer, Owner's address, address tokens were approved to be transferred by the owner of
4. Smart Contract returns success indicator to Owner

### 2.9. EIP20:Allowance ###

**Actors:** User, Smart Contract

**Goal:** User wants to know how many tokens belonging to the owner of certain source address, the owner of the certain spender's address is currently allowed to transfer

#### Main Flow: ####

1. User calls constant method on Smart Contract providing the following information as method parameters: source address, spender's address
2. Smart Contract returns to User the number of tokens belonging to the owner of given source address the owner of given spender's address is currently allowed to transfer

## 3. Creating and Burning Tokens Use Cases ##

This section describes use cases from Creating and Burning Tokens functional block.

### 3.1. Token:Create ###

**Actors:** User, Smart Contract

**Goal:** User wants to create more tokens

#### Main Flow: ####

1. User calls method on Smart Contract providing the following information as method parameters: number of tokens to create
2. User is the owner of Smart Contract
3. After creating requested number of new tokens, total number of tokens in circulation will not exceed maximum number of tokens in circulation
4. Smart Contract created requested number of tokens
5. Smart Contract given newly created tokens to User
6. Smart Contract logs transfer event with the following information: zero source address, User' address as destination address, number of created tokens as number of tokens transferred
7. Smart Contract returns success indicator User

#### Exceptional Flow 1: ####

1. Same as in main flow
2. User is not the owner of Smart Contract
3. Smart Contract cancels transaction

#### Exceptional Flow 2: ####

1. Same as in Main Flow
2. Same as in Main Flow
3. After creating requested number of new tokens, total number of tokens in circulation will exceed maximum number of tokens in circulation
4. Smart Contract returns error indicator to User

### 3.2. Token:Burn ###

**Actors:** User, Smart Contract

**Goal:** User wants to burn (i.e. destroy) some of his tokens

#### Main Flow: ####

1. User calls method on Smart Contract providing the following information as method parameters: number of tokens to burn
2. User is the owner of Smart Contract
3. Smart Contract burns requested number of tokens belonging to User
4. Smart Contract logs transfer event with the following information: User's address as source address, zero destination address, number of burned tokens as number of tokens transferred
5. Smart Contract returns success indicator User

#### Exceptional Flow 1: ####

1. Same as in main flow
2. User is not the owner of Smart Contract
3. Smart Contract cancels transaction

## 4. Administration Use Cases ##

This section describes use cases from Administration functional block.

### 4.1. Admin:Deploy

**Actors:** Administrator, Smart Contract

**Goal:** Administrator wants to deploy Smart Contract

#### Main Flow: ####

1. Administrator deploys Smart Contract
2. Smart Contract makes Administrator the owner of Smart Contract

### 4.2. Admin:SetOwner ###

**Actors:** Administrator, Smart Contract

**Goal:** Administrator wants to change owner of Smart Contract

#### Main Flow: ####

1. Administrator calls method on Smart Contract providing the following information as method parameters: address of the new owner of Smart Contract
2. Administrator is currently an owner of Smart Contract
3. Smart Contract changes its owner to the owner of given address

#### Exceptional Flow 1: ####

1. Same as in main flow
2. Administrator is currently not an owner of Smart Contract
3. Smart Contract cancels the transaction

### 4.3. Admin:SetOwner ###

**Actors:** User, Smart Contract

**Goal:** User wants to known current owner of Smart Contract

#### Main Flow: ####

1. User calls constant method on Smart Contract
2. Smart Contract returns addresses of current owner of Smart Contract to User

## 5. Limits

The following limits are applied:

Limit                                   | Value
--------------------------------------- | ---------
Maximum number of tokens in circulation | 2^256 - 1
