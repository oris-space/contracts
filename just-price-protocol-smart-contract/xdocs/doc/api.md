# Just Price Protocol Smart Contract: API

This document describes API of Just Price Protocol Smart Contract.

## 1. Constructors

### 1.1. JustPriceProtocol(OrgonToken,OrisSpace,address)

##### Signature:

    function JustPriceProtocol (
      OrgonToken _orgonToken,
      OrisSpace _orisSpace,
      address _k1)
    public

##### Description:

Create new Just Price Protocol smart contract with given Orgon Token smart contract address `_orgonToken`, Oris Space smart contract address `_orisSpace`, and given K1 address `k1`.
May be called by anyone.
Does not accept ether.

##### Use Cases:

* Admin:Deploy

## 2. Methods

### 2.1. ()

##### Signature:

    function () public payable

##### Description:

When called with no data works exactly the same as `buyTokens()` method.
When called with non-empty data reverts transaction.

##### Use Cases:

* Trading:Buy

### 2.2. buyTokens()

##### Signature:

    function buyTokens ()
    public payable

##### Description:

Buy tokens for ther sent along with the call.
May be called by anyone.

##### Use Cases:

* Trading:Buy

### 2.3. sellTokens(uint256)

##### Signature:

    function sellTokens (uint256 _value)
    public

##### Description:

Sell `_vaue` tokens.
Just Price Protocol Smart Contract should be allowed to transfer at least `_value` tokens from message sender.
May be called by anyone.
Does not accept ether.

##### Use Cases:

* Trading:Sell

### 2.4. deliver(address[])

##### Signature:

    function deliver (address [] _investors)
    public

##### Description:

Deliver tokens bought during reserve stage by given investors `_investors`.
May be called by anyone.
Does not accept ether.

##### Use Cases:

* Trading:Deliver

### 2.5. refund(address[])

##### Signature:

    function refund (address [] _investors)
    public

##### Description:

Refund given investors `_investors`.
May be called by anyone.
Does not accept ether.

##### Use Cases:

* Trading:Refund

### 2.6. vote(address)

##### Signature:

    function vote (address _newK1)
    public

##### Description:

Vote for new K1 address `_newK1`.
May be called by anyone.
Does not accept ether.

##### Use Cases:

* DAO:Vote

### 2.7. setFee(uint256)

##### Signature:

    function setFee (uint256 _fee)
    public

##### Description:

Set new fee numerator to `_fee`.
Actual fee will be `_fee / 20000`.
May be called by K1 address only.
Does not accept ether.

##### Use Cases:

* DAO:SetFee

### 2.7. outstandingToken(address)

##### Signature:

    function outstandingTokens (address _investor)
    public view returns (uint256)

##### Description:

Return number of tokens that were bought by given investor `_investor` during reserve stage and are not yet delivered.
May be called by anyone.
Does not accept ether.

##### Use Cases:

* Trading:OutstandingTokens

### 2.8. getStage(uint256)

##### Signature:

    function getStage (uint256 _currentTime)
    public view returns (Stage)

    enum Stage {
      BEFORE_RESERVE,
      RESERVE,
      BEFORE_GROWTH,
      GROWTH,
      LIFE,
      REFUND
    }

##### Description:

Return current stage of Just Price Token Smart Contract.
May be called by anyone.
Does not accept ether.

##### Use Cases:

* Trading:GetStage

### 2.9. totalEligibleVotes()

##### Signature:

    function totalEligibleVotes ()
    public view returns (uint256)

##### Description:

Return total number of votes eligible for choosing new K1 address.
May be called by anyone.
Does not accept ether.

##### Use Cases:

* DAO:TotalEligibleVotes

### 2.10. eligibleVotes(address)

##### Signature:

    function eligibleVotes (address _investor)
    public view returns (uint256)

##### Description:

Return number of votes eligible for choosing new K1 address given investor `_investor` has.
May be called by anyone.
Does not accept ether.

##### Use Cases:

* DAO:EligibleVotes

### 2.11. votesFor(address)

##### Signature:

    function votesFor (address _newK1)
    public view returns (uint256)

##### Description:

REturn number of votes for given new K1 address `_newK1`.
May be called by anyone.
Does not accept ether.

##### Use Cases:

* DAO:VotesFor

## 3. Events

### 3.1. Investment(address,uint256,uint256)

##### Signature:

    event Investment (address indexed investor, uint256 value, uint256 amount)

##### Description:

Logged when an investment of `value` Wei was made by `investor` during reserve stage and `amount` of token units were sold.

##### Use Cases:

* Trading:Buy

### 3.2. Delivery(address,uint256)

##### Signature:

    event Delivery (address indexed investor, uint256 amount)

##### Description:

Logged when `amount` tokens units bought during reserve stage were delivered to investor `investor`.

##### Use Cases:

* Trading:Deliver

### 3.3. Refund(address,uint256)

##### Signature:

    event Refund (address indexed investor, uint256 value)

##### Description:

Logged when `value` Wei were sent to investor `investor` as refund.

##### Use Cases:

* Trading:Refund

### 3.4. K1Change(address)

##### Signature:

  event K1Change (address k1)

##### Description:

Logged when K1 address was changed to `k1`.

##### Use Cases:

* DAO:Vote

### 3.5. Vote(address,address,uint256)

##### Signature:

    event Vote (address indexed investor, address indexed newK1, uint256 votes)

##### Description:

Logged when investor `investor` gave `votes` votes for new K1 address `newK1`.

##### Use Cases:

* DAO:Vote

### 3.6. VoteRevocation(address,address,uint256)

##### Signature:

    event VoteRevocation (
      address indexed investor, address indexed newK1, uint256 votes)

##### Description:

Logged when investor `investor` revoked `votes` votes from suggested new K1 address `newK1`.

##### Use Cases:

* DAO:Vote

### 3.7. FeeChange(uint256)

##### Signature:

    event FeeChange (uint256 fee)

##### Description:

Logged when fee numerator was changed to `fee`.

##### Use Cases:

* DAO:SetFee
