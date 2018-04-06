# Oris Space Smart Contract Storage

This document describes storage structure of Oris Space smart contract.

## 1. Storage Variables

### 1.1. orgonToken

##### Signature:

    OrgonToken internal orgonToken;

##### Description:

Address of Orgon Token smart contract.

##### Used in Use Cases:

* Send
* Start

##### Modified on Use Cases:

* Deploy

### 1.2. owner

##### Signature:

    address internal owner;

##### Description:

Address of the owner of the Oris Space smart contract.

##### Used in Use Cases:

* Send
* SetTransferLimit

##### Modified in Use Cases:

* Deploy

### 1.3. transferLimit

##### Signature:

    uint256 internal transferLimit;

##### Description:

Maximum number of Orgon tokens that could be sent (using sendOrgonTokens method) in total from balance of Oris Space smart contract to any particular address.

##### Used in Use Cases:

* Send
* SetTransferLimit

##### Modified in Use Cases

* Deploy
* SetTransferLimit

### 1.4. transferred

##### Signature:

    mapping (address => uint256) internal transferred;

##### Description:

Mapping from address to the total number of Orgon tokens sent to this address using sendOrgonTokens method from balance of Oris Space smart contract.

##### Used in Use Cases:

* Send

##### Modified in Use Cases:

* Send

### 1.5. started

##### Signature:

  bool internal started;

##### Description:

`True` if Oris Space smart contract is already started, `false` otherwise.

##### Used in Use Cases:

* Send
* Start

##### Modified in Use Cases:

* Start
