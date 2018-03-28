# Oris Space Smart Contract API

This document describes public API of Oris Space smart contract.

## 1. Constructors

### 1.1. OrisSpace(OrgonToken,address)

##### Signature:

    function OrisSpace(OrgonToken _orgonToken, address _owner) public

##### Description:

Deploy Oris Space smart contract that uses given Orgon Token smart contract `_orgonToken` and make the owner of given `_owner` address to be the owner of the smart contract.
May be called by anybody.
Does not accept ether.

##### Use Cases:

* Deploy

## 2. Methods

### 2.1. sendOrgonTokens(address,uint256)

##### Signature:

    function sendOrgonTokens (address _to, uint256 _value) public returns (bool)

##### Description:

Send given number `_value` of Orgon tokens from balance of Oris Space smart contract to the owner of given `_to` address.
Return `true` if tokens were transferred successfully, `false` otherwise.
May only be called by the owner of Oris Space smart contract.
Does not accept ether.

##### Use Cases:

* Send

### 2.2. setTransferLimit(uint256)

##### Signature:

    function setTransferLimit (uint256 _transferLimit) public

##### Description

Set maximum number of Orgon tokens that could be sent (via sendOrgonTokens method) in total from the balance of Oris Space smart contract to any single address to given value `_transactionLimit`.
May only be called by the owner of Oris Space smart contract.
Does not accept ether.

##### Use Cases:

* SetTransferLimit

### 2.3. start(uint256)

##### Signature:

    function start (uint256 _returnAmount) public

###### Description:

Start Oris Space smart contract, i.e. allow token transfers from it, and send given number `_returnAmount` of Orgon tokens to message sender.
May only be called the owner of **Orgon Token** smart contract (Note: not the owner of Oris Space smart contract, but thw owner of Orgon Token smart contract).
Does not accept ether.

##### Use Cases:

* Start
