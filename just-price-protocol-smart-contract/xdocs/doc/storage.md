# Just Price Protocol Smart Contract: Storage

This document describes storage structure of Just Price Protocol Smart Contract.

## 1. Fields

### 1.1. orgonToken

##### Signature:

    OrgonToken internal orgonToken

##### Description:

Address of Orgon Token Smart Contract.

##### Used in Use Cases:

* Trading:Buy
* Trading:Sell
* Trading:Deliver
* Transition:BeforeGrowth

##### Modified in Use Cases

*Admin:Deploy

### 1.2. orisSpace

##### Signature:

    OrisSpace internal orisSpace

##### Description:

Address of Oris Space Smart Contract.

##### Used in Use Cases:

* Trading:Buy
* Transition:BeforeGrowth

##### Modified in Use Cases:

* Admin:Deploy

### 1.3. k1

##### Signature:

    address internal k1

##### Description:

K1 address.

##### Used in Use Cases:

* Trading:Buy
* DAO:SetFee

##### Modified in Use Cases:

* Admin:Deploy
* DAO:Vote

### 1.4. stage

##### Signature:

    Stage internal stage
    
    enum Stage {
      BEFORE_RESERVE,
      RESERVE,
      BEFORE_GROWTH,
      GROWTH,
      LIFE,
      REFUND
    }

##### Description:

Last known stage of Just Price Protocol Smart Contract.

##### Used in Use Cases:

* Trading:Buy
* Trading:Sell
* Trading:Deliver
* Trading:Refund
* Trading:GetStage
* DAO:Vote
* DAO:SetFee
* Transition:BeforeGrowth

##### Modified in Use Cases:

* Trading:Buy
* Trading:Deliver
* Transition:BeforeGrowth
* Admin:Deploy

### 1.5. reserveAmount

##### Signature:

    uint256 internal reserveAmount

##### Description:

Amount of ether in reserve.

##### Used in Use Cases:

* Trading:Buy
* Trading:Sell
* Trading:GetStage
* Trandition:BeforeGrowth

##### Modified in Use Cases:

* Trading:Buy
* Trading:Sell

### 1.6. reserveTokensSold

##### Signature:

    uint256 internal reserveTokensSold

##### Description:

Number of tokens sold to investors during reserve stage.

##### Used in Use Cases:

* Trading:Buy
* Trading:Deliver
* Transition:BeforeGrowth

##### Modified in Use Cases:

* Trasing:Buy

### 1.7. reserveTokensDelivered

##### Signature:

    uint256 internal reserveTokensDelivered

##### Description:

Number of tokens sold to investors during reserve stage that were already delivered to corresponding investors.

##### Used in Use Cases:

* Trading:Deliver

##### Modified in Use Cases:

* Trading:Deliver

### 1.8. growthDeadline

##### Signature:

    uint256 internal growthDeadline

##### Description:

Timestamp of growth deadline, or zero if growth stage didn't start yet.

##### Used in Use Cases:

* Trading:GetStage

##### Modified in Use Cases:

* Trading:Deliver

### 1.9. investors

##### Signature:

    mapping (address => Investor) internal investors
    
    struct Investor {
      uint256 tokensBought;
      uint256 etherInvested;
    }

##### Description:

Maps investor address to a structure encapsulating information about investor.
Value `investors [investor].tokensBought` is the number of tokens that investor with address `investor` bought during reserve stage and that are not yet delivered to him, or zero if this investor already received refund.
Value `investors [investor].etherInvested` is amount of ether that investor with address `investor` invested during reserve stage and that is not yet refunded, or zero if tokens were already delivered to this investor.

##### Used in Use Cases:

* Trading:Buy
* Trading:Deliver
* Trading:Refund
* Trading:OutstandingTokens

##### Modified in Use Cases:

* Trading:Buy
* Trading:Deliver
* Trading:Refund

### 1.10. voteNumbers

##### Signature:

    mapping (address => uint256) internal voteNumbers

##### Description:

Maps investor address to the number of votes eligible for choosing new K1 address that this investor has.

##### Used in Use Cases:

* DAO:Vote
* DAO: EligibleVotes

##### Modified in Use Cases:

* Trading:Buy

### 1.11. votes

##### Signature:

    mapping (address => address) internal votes

##### Description:

Maps investor address to the new K1 address this investor voted for or to zero address is this investor didn't vote for any new K1 address or revoked his vote.

##### Used in Use Cases:

* DAO:Vote

##### Modified in Use Cases:

* DAO:Vote

### 1.12. voteResults

##### Signature:

    mapping (address => uint256) internal voteResults

##### Description:

Maps suggested new K1 address to the number of votes for this address.

##### Used in Use Cases:

* DAO:Vote
* DAO:VotesFor

##### Modified in Use Cases:

* DAO:Vote

### 1.13. totalVotesNumber

##### Signature:

    uint256 internal totalVotesNumber

##### Description:

Total number of votes eligible for choosing new K1 address.

##### Used in Use Cases:

* DAO:Vote
* DAO:TotalEligibleVotes

##### Modified in Use Cases:

* Trading:Buy

### 1.14. k1Changed

##### Signature:

    bool internal k1Changed

##### Description:

Whether K1 address was already changed.

##### Used in Use Cases:

* DAO:Vote

##### Modified in Use Cases:

* DAO:Vote

### 1.15. fee

##### Signature:

    uint256 internal fee

##### Description:

Current fee numerator.
Fee denominator is 20000.

##### Used in Use Cases:

* Trading:Buy
* DAO:SetFee

##### Modified in Use Cases:

* DAO:SetFee
* Admin:Deploy

### 1.16. feeChangeEnableTime

##### Signature:

    uint256 internal feeChangeEnableTime

##### Description:

Time stamp of the moment when fee changing becomes enabled.

##### Used in Use Cases:

* DAO:SetFee

##### Modified in Use Cases:

* DAO:Deliver
