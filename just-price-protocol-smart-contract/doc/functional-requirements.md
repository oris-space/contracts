# Just Price Protocol Smart Contract: Functional Requirements

This document describes functional requirements for Just Price Protocol smart contract: Ethereum smart contract that acts as a market maker for Orgon tokens.

## 1. Introduction

Just Price Protocol Smart Contract is an Ethereum smart contract that buys and sells Orgon tokens according to rules coded into the contract.
Tokens are issued right before being sold by Just Price Protocol Smart Contract and are burned right after there were bought by it.
It also holds ether reserve that guarantees value of Orgon tokens.
When Just Price Protocol Smart Contract sells tokens, it adds revenue to the reserve.
When it buys tokens, it pays from the reserve.
During its life span Just Price Protocol Smart Contract goes through several stages, and functionality of Just Price Protocol Smart Contract greatly depends of current stage.
The following sections describe stages, transitions between them and main use cases.
Related use cases are grouped into functional blocks.

## 2. Stages

This section describes all stages Just Price Protocol Smart Contract may go through during its life span as well as all valid transitions between them.
Here is stages diagram:

    +----------------+
    | BEFORE_RESERVE |
    +----------------+
            |
            | Sale start time reached
            V
       +---------+   Reserve deadline reached
       | RESERVE |-------------------------------+
       +---------+                               |
            |                                    |
            | 72500 ETH collected                |
            V                                    |
    +---------------+ 39013.174672 ETH collected |
    | BEFORE_GROWTH |<---------------------------O
    +---------------+                            |
            |                                    | 39013.174672 ETH not collected
            | 80% of tokens delivered            |
            V                                    V
     +------------+                         +--------+
     |   GROWTH   |                         | REFUND |
     +------------+                         +--------+
            |
            | 1,500,000,000 tokens issued or 365 days passed since start of "GROWTH" stage
            V
        +------+
        | LIFE |
        +------+

### 2.1. BEFORE_RESERVE Stage

##### Description:

This stage lasts from the deployment of Just Price Protocol Smart Contract till sale start.
In case smart contract is deployed after sale start, this stage is skipped.
During this stage tokens may not be bought nor sold.

##### Transitions:

* To RESERVE stage: when sale start time is reached

### 2.2. RESERVE Stage

##### Description:

This stage lasts from sale start time till the moment 72500 ETH is collected or till reserve deadline, whichever comes first.
In case smart contract is deployed after reserve deadline, this stage is skipped.
In case RESERVE stage ended by reaching deadline, number of tokens in circulation is reduced to maintain reserve / tokens count ratio to be equal to 0.0001 ETH per whole token.
Number of tokens is reduced by burning some tokens belonging to Oris Space.
During this stage tokens may be bought from the smart contract but not sold to it.
Once bought, tokens are not delivered to the buyer immediately, but delivery is postponed until the end of RESERVE stage.
Token price depends on how may ETH is collected in reserve according to the following table:

ETH collected  | Token price (ETH per token)
---------------|----------------------------
0 .. 10000     | 0.00080
10000 .. 20000 | 0.00082
20000 .. 30000 | 0.00085
30000 .. 40000 | 0.00088
40000 .. 50000 | 0.00090
50000 .. 60000 | 0.00092
60000 .. 70000 | 0.00095
70000 .. 72500 | 0.00098

In case single purchase crosses price boundary, two or more prices are applied to corresponding parts.
Let's consider an example.
There is 37000 ETH already collected in reserve.
Alice wants to buy tokens for 15000 ETH, but there is only 3000 ETH to be collected till price change.
So, three prices will be applied in a sequence like shown in the following table:

Alice's ETH remaining | ETH in reserve       | ETH till next price  | Price   | Tokens (9 decimals) | ETH spent
----------------------|----------------------|----------------------|---------|---------------------|--------------------
15000                 | 37000                | 3000                 | 0.00088 | 3409090.909090909   | 2999.99999999999992
12000.00000000000008  | 39999.99999999999992 | 10000.00000000000008 | 0.00090 | 11111111.111111111  | 9999.9999999999999
2000.00000000000018   | 49999.99999999999982 | 10000.00000000000018 | 0.00092 | 2173913.043478261   | 2000.00000000000012

So Alice will buy 16694115.063680281 tokens and will get 0.00000000000006 unspent ether back.

If purchase crosses reserve target of 72500 ETH, then unspent ether is returned to the buyer.

##### Transitions:

* To BEFORE_GROWTH stage: when amount of collected ether is so big that it is impossible to buy another token unit without crossing hard cap of 72500 ETH.
* To BEFORE_GROWTH stage: when reserve deadline is reached and at least 39013.174672 ETH collected.
* To REFUND stage: when reserve deadline is reached and less than 39013.174672 ETH collected.

### 2.3. BEFORE_GROWTH Stage

##### Description:

This stage lasts from the end of successful RESERVE stage (i.e. RESERVE stage that was able to collect at least 39013.174672 ETH) till the moment when at least 80% of tokens bought during RESERVE stage are delivered to their corresponding buyers.
During this stage tokens may not be bought nor sold.

#### Transitions:

* To GROWTH stage: when at least 80% of tokens bought during RESERVE state are delivered to their corresponding buyers.

### 2.4. GROWTH Stage

##### Description:

This stage lasts from the end of BEFORE_GROWTH stage till the moment when there will be at least 1,500,000,000 tokens in circulation, but not longer than for one year.
During this stage tokens may be bought from the smart contract but not sold to it.
Number of tokens to be bought for given amount of ether is calculated individually for each purchase via the following formula:

    T ((1 + e/E)^0.1 - 1)

Here `T` is current number of tokens in circulation, `E` is amount of ether in reserve, and `e` is an amount of ether buyer wants to buy tokens for.
For every purchase, small fraction of purchased tokens is withheld by Just Price Protocol smart contract and sent to special address, known as K1.

##### Transitions:

* To LIFE stage: when there are at least 1,500,000,000 tokens in circulation
* To LIFE stage: when 365 days passed since the start of GROWTH stage

### 2.5. LIFE Stage

##### Description:

This stage lasts from the end of GROWTH stage.
During this stage tokens may be both, bought from the smart contract and sold to it.
Buying from the smart contract works exactly as during GROWTH phase.
Amount of ether to be payed for given number of tokens sold to the smart contract if calculated individually for each sell via the following formula:

    E (1 - (1 - t/T)^10)

Here `E` is amount of ether in reserve, `t` it number of tokens seller wants to sell and `T` is current number of tokens in circulation.

##### Transitions:

None

## 3. Functional Blocks

In this document, use cases for Just Price Protocol Smart Contract are grouped into the following functional blocks:

* Administration – smart contract deployment and administration
* Trading – buying and selling tokens
* DAO – collaborative actions of early investors
* Transition – transitions between stages

In the following sections use cases for these functional blocks are described in details.

## 4. Administration Use Cases

This section describes use cases related to smart contract deployment and administration.

### 4.1. Admin:Deploy

**Actors:** _Administrator_, _Smart Contract_

**Goal:** _Administrator wants to deploy _Smart Contract_

##### Main Flow:

1. _Administrator_ deploys _Smart Contract_ providing the following information as constructor parameters: address of Orgon Token Smart Contract, address of Oris Space Smart Contract, address K1
2. _Smart Contract_ remembers addresses passed as constructor parameters

## 5. Trading Use Cases

This section describes use cases related to buyibng and selling tokens.

### 5.1. Trading:Buy

**Actors:** _User_, _Smart Contract_

**Goal:** _User_ wants to buy tokens from _Smart Contract_

##### Main Flow RESERVE:

1. _User_ calls method on _Smart Contract_ or sends no-data transaction to it attaching some ether to the transaction
2. Amount of ether provided by _User_ is greater than zero
3. _Smart Contract_ is currently in RESERVE stage
4. _Smart Contract_ calculates number of tokens that could be bought for the amount of ether provided by _User_ and not exceeding hard cap
5. _Smart Contract_ calculates exact amount of ether _User_ should pay for the number of tokens calculated at step 4
6. _Smart Contract_ issues tokens (number of tokens to be issued was calculated at step 4)
7. Tokens are issued successfully
8. Amount of ether provided by _User_ is greater than amount of ether calculated at step 5
9. _Smart Contract_ sends unspent ether back to _User_ (amount of ether to be sent is amount provided by _User_ minus amount calculated at step 5)
10. Ether transfer succeeded
11. Number of tokens calculated at step 4 is greater than zero
12. _Smart Contract_ logs investment event with the following information: _User_ address, amount of ether invested as calculated at step 5, number of tokens bought as calculated at step 4

##### Main Flow GROWTH/LIFE:

1. Same as in Main Flow RESERVE
2. Same as in Main Flow RESERVE
3. _Smart Contract_ is currently in GROWTH of LIFE stage
4. Amount of ether provided by _User_ does not exceed maximum purchase ether amount
5. _Smart Contract_ calculates number of tokens that could be bought for amount of ether provided by _User_
6. After adding ether provided by _User_ to reserve, amount of ether in reserve will not exceed maximum reserve amount
7. Number of tokens calculated at step 5 is greater than zero
8. _Smart Contract_ issues tokens (number of tokens to be issued was calculated at step 5)
9. Tokens are issued successfully
10. After issuing new tokens, total number of tokens in circulation does not exceed maximum number of tokens in circulation
11. _Smart Contract_ transfers new issued tokens to _User_ withholding fee
12. Token transfer succeeded
13. Fee is greater than zero
14. _Smart Contract_ transfers fee tokens to K1 address
15. Fee token transfer succeeded

##### Exceptional Flow 1:

1. Same as in Main Flow RESERVE
2. Amount of ether attached provided by _User_ is zero
3. _Smart Contract_ cancels transaction

##### Exceptional Flow 2:

1. Same as in Main Flow RESERVE
2. Same as in Main Flow RESERVE
3. _Smart Contract_ is not in RESERVE, GROWTH, or LIFE stage
4. _Smart Contract_ cancels transaction

##### Exceptional Flow 3:

1. Same as in Main Flow RESERVE
2. Same as in Main Flow RESERVE
3. Same as in Main Flow RESERVE
4. Same as in Main Flow RESERVE
5. Same as in Main Flow RESERVE
6. Same as in Main Flow RESERVE
7. Token issuing failed
8. _Smart Contract_ cancels transaction

##### Exceptional Flow 4:

1. Same as in Main Flow RESERVE
2. Same as in Main Flow RESERVE
3. Same as in Main Flow RESERVE
4. Same as in Main Flow RESERVE
5. Same as in Main Flow RESERVE
6. Same as in Main Flow RESERVE
7. Same as in Main Flow RESERVE
8. Amount of ether provided by _User_ is exactly the same as amount of ether calculated at step 6

##### Exceptional Flow 5:

1. Same as in Main Flow RESERVE
2. Same as in Main Flow RESERVE
3. Same as in Main Flow RESERVE
4. Same as in Main Flow RESERVE
5. Same as in Main Flow RESERVE
6. Same as in Main Flow RESERVE
7. Same as in Main Flow RESERVE
8. Same as in Main Flow RESERVE
9. Same as in Main Flow RESERVE
10. Ether transfer failed
11. _Smart Contract_ cancels transaction

##### Exceptional Flow 6:

1. Same as in Main Flow RESERVE
2. Same as in Main Flow RESERVE
3. Same as in Main Flow RESERVE
4. Same as in Main Flow RESERVE
5. Same as in Main Flow RESERVE
6. Same as in Main Flow RESERVE
7. Same as in Main Flow RESERVE
8. Same as in Main Flow RESERVE
9. Same as in Main Flow RESERVE
10. Same as in Main Flow RESERVE
11. Number of tokens calculated at step 4 is zero
11. _Smart Contract_ does nothing

##### Exceptional Flow 7:

1. Same as in Main Flow RESERVE
2. Same as in Main Flow RESERVE
3. Same as in Main Flow GROWTH/LIFE
4. Amount of ether provided by User exceeds maximum purchase ether amount
5. _Smart Contract_ cancels transaction

##### Exceptional Flow 8:

1. Same as in Main Flow RESERVE
2. Same as in Main Flow RESERVE
3. Same as in Main Flow GROWTH/LIFE
4. Same as in Main Flow GROWTH/LIFE
5. Same as in Main Flow GROWTH/LIFE
6. After adding ether provided by _User_ to reserve, amount of ether in reserve will exceed maximum reserve amount
7. _Smart Contract_ cancels transaction

##### Exceptional Flow 9:

1. Same as in Main Flow RESERVE
2. Same as in Main Flow RESERVE
3. Same as in Main Flow GROWTH/LIFE
4. Same as in Main Flow GROWTH/LIFE
5. Same as in Main Flow GROWTH/LIFE
6. Same as in Main Flow GROWTH/LIFE
7. Number of tokens calculated at step 5 is zero
8. _Smart Contract_ does nothing

##### Exceptional Flow 10:

1. Same as in Main Flow RESERVE
2. Same as in Main Flow RESERVE
3. Same as in Main Flow GROWTH/LIFE
4. Same as in Main Flow GROWTH/LIFE
5. Same as in Main Flow GROWTH/LIFE
6. Same as in Main Flow GROWTH/LIFE
7. Same as in Main Flow GROWTH/LIFE
8. Same as in Main Flow GROWTH/LIFE
9. Tokens issuing failed
10. _Smart Contract_ cancels transaction

##### Exceptional Flow 11:

1. Same as in Main Flow RESERVE
2. Same as in Main Flow RESERVE
3. Same as in Main Flow GROWTH/LIFE
4. Same as in Main Flow GROWTH/LIFE
5. Same as in Main Flow GROWTH/LIFE
6. Same as in Main Flow GROWTH/LIFE
7. Same as in Main Flow GROWTH/LIFE
8. Same as in Main Flow GROWTH/LIFE
9. Same as in Main Flow GROWTH/LIFE
10. After issuing new tokens, total number of tokens in circulation exceeds maximum number of tokens in circulation
11. _Smart Contract_ cancels transaction

##### Exceptional Flow 12:

1. Same as in Main Flow RESERVE
2. Same as in Main Flow RESERVE
3. Same as in Main Flow GROWTH/LIFE
4. Same as in Main Flow GROWTH/LIFE
5. Same as in Main Flow GROWTH/LIFE
6. Same as in Main Flow GROWTH/LIFE
7. Same as in Main Flow GROWTH/LIFE
8. Same as in Main Flow GROWTH/LIFE
9. Same as in Main Flow GROWTH/LIFE
10. Same as in Main Flow GROWTH/LIFE
11. Same as in Main Flow GROWTH/LIFE
12. Token transfer failed
13. _Smart Contract_ cancels transaction

##### Exceptional Flow 13:

1. Same as in Main Flow RESERVE
2. Same as in Main Flow RESERVE
3. Same as in Main Flow GROWTH/LIFE
4. Same as in Main Flow GROWTH/LIFE
5. Same as in Main Flow GROWTH/LIFE
6. Same as in Main Flow GROWTH/LIFE
7. Same as in Main Flow GROWTH/LIFE
8. Same as in Main Flow GROWTH/LIFE
9. Same as in Main Flow GROWTH/LIFE
10. Same as in Main Flow GROWTH/LIFE
11. Same as in Main Flow GROWTH/LIFE
12. Same as in Main Flow GROWTH/LIFE
13. Fee is zero
14. _Smart Contract_ does nothing

##### Exceptional Flow 14:

1. Same as in Main Flow RESERVE
2. Same as in Main Flow RESERVE
3. Same as in Main Flow GROWTH/LIFE
4. Same as in Main Flow GROWTH/LIFE
5. Same as in Main Flow GROWTH/LIFE
6. Same as in Main Flow GROWTH/LIFE
7. Same as in Main Flow GROWTH/LIFE
8. Same as in Main Flow GROWTH/LIFE
9. Same as in Main Flow GROWTH/LIFE
10. Same as in Main Flow GROWTH/LIFE
11. Same as in Main Flow GROWTH/LIFE
12. Same as in Main Flow GROWTH/LIFE
13. Same as in Main Flow GROWTH/LIFE
14. Same as in Main Flow GROWTH/LIFE
15. Fee token transfer failed
16. _Smart Contract_ cancels transaction

### 5.2. Trading:Sell

**Actors:** _User_, _Smart Contract_

**Goal:** _User_ wants to sell tokens to _Smart Contract_

##### Main Flow:

1. _User_ calls method on _Smart Contract_ providing the following information as method parameters: number of tokens to be sold
2. Number of tokens to be sold is greater than zero
3. Number of tokens to be sold is less than maximum sell token number
4. _Smart Contract_ is currently in LIFE stage
5. Number of tokens in circulation is less than maximum number of tokens in circulation
6. Number of tokens to be sold is less than or equal to number of tokens in circulation
7. _Smart Contract_ calculates amount of ether to be payed to _User_ for tokens
8. _Smart Contract_ transfer tokens from _User_ to its own balance
9. Token transfer succeeded
10. _Smart Contract_ burns tokens transferred from _User_
11. Token burning succeeded
12. _Smart Contract_ sends amount of ether calculated at step 7
13. Ether transfer succeeded

##### Exceptional Flow 1:

1. Same as in Main Flow
2. Number of tokens to be sold is zero
3. _Smart Contract_ cancels transaction

##### Exceptional Flow 2:

1. Same as in Main Flow
2. Same as in Main Flow
3. Number of tokens to be sold is greater than or equal to maximum sell token number
4. _Smart Contract_ cancels transaction

##### Exceptional Flow 3:

1. Same as in Main Flow
2. Same as in Main Flow
3. Same as in Main Flow
4. _Smart Contract_ is currently not in LIFE stage
5. _Smart Contract_ cancels transaction

##### Exceptional Flow 4:

1. Same as in Main Flow
2. Same as in Main Flow
3. Same as in Main Flow
4. Same as in Main Flow
5. Number of tokens in circulation is greater than or equal to maximum number of tokens in circulation
6. _Smart Contract_ cancels transaction

##### Exceptional Flow 5:

1. Same as in Main Flow
2. Same as in Main Flow
3. Same as in Main Flow
4. Same as in Main Flow
5. Same as in Main Flow
6. Number of tokens to be sold is greater than number of tokens in circulation
7. _Smart Contract_ cancels transaction

##### Exceptional Flow 6:

1. Same as in Main Flow
2. Same as in Main Flow
3. Same as in Main Flow
4. Same as in Main Flow
5. Same as in Main Flow
6. Same as in Main Flow
7. Same as in Main Flow
8. Same as in Main Flow
9. Token transfer failed
10. _Smart Contract_ cancels transaction

##### Exceptional Flow 7:

1. Same as in Main Flow
2. Same as in Main Flow
3. Same as in Main Flow
4. Same as in Main Flow
5. Same as in Main Flow
6. Same as in Main Flow
7. Same as in Main Flow
8. Same as in Main Flow
9. Same as in Main Flow
10. Same as in Main Flow
11. Token burning failed
12. _Smart Contract_ cancels transaction

##### Exceptional Flow 8:

1. Same as in Main Flow
2. Same as in Main Flow
3. Same as in Main Flow
4. Same as in Main Flow
5. Same as in Main Flow
6. Same as in Main Flow
7. Same as in Main Flow
8. Same as in Main Flow
9. Same as in Main Flow
10. Same as in Main Flow
11. Same as in Main Flow
12. Same as in Main Flow
13. Ether transfer failed
14. _Smart Contract_ cancels transaction

### 5.3. Trading:Deliver

**Actors:** _User_, _Smart Contract_

**Goal:** _User_ wants tokens bought at RESERVE stage to be delivered to certain investors

##### Main Flow:

1. _User_ calls method on _Smart Contract_ providing the following information as method parameters: list of addresses of investors to deliver tokens to
2. _Smart Contract_ is currently in BEFORE_GROWTH, GROWTH, or LIFE stage
3. The following steps are repeated for every investor in the list
4. Number of tokens bought by investor during RESERVE stage and not yet delivered to him is greater than zero
5. _Smart Contract_ transfers proper number of tokens to _User_
6. Token transfer succeeded
7. _Smart Contract_ logs delivery event with the following information: investor address, number of tokens delivered

##### Exceptional Flow 1:

1. Same as in Main Flow
2. _Smart Contract_ is currently not in BEFORE_GROWTH, GROWTH, nor LIFE stage
3. _Smart Contract_ cancels transaction

##### Exceptional Flow 2:

1. Same as in Main Flow
2. Same as in Main Flow
3. Same as in Main Flow
4. Number of tokens bought by investor during RESERVE stage and not yet delivered to him is zero
5. _Smart Contract_ proceeds to next investor

##### Exceptional Flow 3:

1. Same as in Main Flow
2. Same as in Main Flow
3. Same as in Main Flow
4. Same as in Main Flow
5. Same as in Main Flow
6. Token transfer failed
7. _Smart Contract_ cancels transaction

### 5.4. Trading:Refund

**Actors:** _User_, _Smart Contract_

**Goal:** _User_ wants certain investors to receive refund for their investments made during RESERVE stage

##### Main Flow:

1. _User_ calls method on _Smart Contract_ providing the following information as method parameters: list of addresses of investors to receive refund
2. _Smart Contract_ is currently in REFUND stage
3. The following steps are repeated for every investor in the list
4. Amount of ether invested by investor during RESERVE stage and not yet refunded is greater than zero
5. _Smart Contract_ sends refund to investor
6. Ether transfer succeeded
7. _Smart Contract_ logs refund event with the following information: address of investor that was refunded, refund amount

##### Exceptional Flow 1:

1. Same as in Main Flow
2. _Smart Contract_ is currently not in  REFUND stage
3. _Smart Contract_ cancels transaction

##### Exceptional Flow 2:

1. Same as in Main Flow
2. Same as in Main Flow
3. Same as in Main Flow
4. Amount of ether invested by investor during RESERVE stage and not yet refunded is zero
5. _Smart Contract_ proceeds to next investor

##### Exceptional Flow 3:

1. Same as in Main Flow
2. Same as in Main Flow
3. Same as in Main Flow
4. Same as in Main Flow
5. Same as in Main Flow
6. Ether transfer failed
7. _Smart Contract_ cancels transaction

### 5.5. Trading:GetStage

**Actors:** _User_, _Smart Contract_

**Goal:** _User_ wants to know what stage _Smart Contract_ is currently in

##### Main Flow:

1. _User_ calls constant method on _Smart Contract_ providing the following information as method parameters: current UNIX timestamp
2. _Smart Contract_ returns stage it is currently in to _User_

### 5.6. Trading:OutstandingTokens

**Actors:** _User_, _Smart Contract_

**Goal:** _User_ wants to know number of tokens that certain investor bought during RESERVE stage and that are not yet delivered to the investor

##### Main Flow:

1. _User_ calls constant method on _Smart Contract_ providing the following information as method parameters: address of an investor to get number of outstanding tokens for
2. _Smart Contract_ returns number of outstanding tokens for given investor to _User_

## 6. DAO Use Cases

This section describes use cases related to collective actions of early investors performed via DAO smart contract.

### 6.1. DAO:Vote

**Actors:** _User_, _Smart Contract_

**Goal:** _User_ wants to vote for new K1 address

##### Main Flow:

1. _User_ calls method on _Smart Contract_ providing the following information as method parameters: new K1 address to vote for
2. _Smart Contract_ is currently in LIFE stage
3. K1 address was not yet changed
4. Number of tokens _User_ bought during RESERVE and GROWTH stages (number of votes _User_ has) is greater than zero
5. _User_ already voted for new K1 address and his last votes were not revoked
6. New K1 address provided by User is not the same as K1 address he voted previously
7. _Smart Contract_ revokes votes belonging to _User_ from K1 address he voted previously for
8. _Smart Contract_ logs vote revocation event with the following information: address of _User_, K1 address _User_ voted previously, number of votes _User_ has
9. New K1 address provided by _User_ is not zero
10. _Smart Contract_ adds number of votes _User_ has to the new K1 address provided by _User_
11. _Smart Contract_ logs vote event with the following information: address of _User_, K1 address _User_ voted for, number of votes _User_ has
12. After adding _User_ votes, total number of votes given for K1 address provided by _User_ is greater than or equal to 51% of total number of votes all users have
13. _Smart Contract_ changes K1 address to the address provided by _User_
14. _Smart Contract_ logs K1 change event with the following information: new K1 address

If _User_ performed token purchase when _Smart Contract_ was in GROWTH stage and this particular purchase crossed the limit of tokens to be issued in GROWTH stage, then only number of tokens bought by _User_ that fit under the limit a counted as _User_ votes.  Here is an example:

1. _Smart Contract_ is in GROWTH stage and total number of tokens in circulation is 1,499,999,000 whole tokens
2. Alice buys 2500 tokens crossing GROWTH stage limit of 1,500,000,000 tokens by 1500, so only 1000 tokens fit under limit
3. Alice obtains only 1000 votes for this purchase

##### Exceptional Flow 1:

1. Same as in Main Flow
2. _Smart Contract_ is currently no in LIFE stage
3. _Smart Contract_ cancels transaction

##### Exceptional Flow 2:

1. Same as in Main Flow
2. Same as in Main Flow
3. K1 address was already changed
4. _Smart Contract_ cancels transaction

##### Exceptional Flow 3:

1. Same as in Main Flow
2. Same as in Main Flow
3. Same as in Main Flow
4. Number of tokens _User_ bought during RESERVE and GROWTH stages (number of votes _User_ has) is zero
5. _Smart Contract_ does nothing

##### Exceptional Flow 4:

1. Same as in Main Flow
2. Same as in Main Flow
3. Same as in Main Flow
4. Same as in Main Flow
5. _User_ didn't vote for new K1 address yet or his last votes were revoked
6. New K1 address provided by _User_ is not zero
7. Proceed to step 10 of Main Flow

##### Exceptional Flow 5:

1. Same as in Main Flow
2. Same as in Main Flow
3. Same as in Main Flow
4. Same as in Main Flow
5. Same as in Exceptional Flow 4
6. New K1 address provided by _User_ is zero
7. _Smart Contract_ does nothing

##### Exceptional Flow 6:

1. Same as in Main Flow
2. Same as in Main Flow
3. Same as in Main Flow
4. Same as in Main Flow
5. Same as in Main Flow
6. New K1 address provided by _User_ is the same as K1 address he voted previously for
7. _Smart Contract_ does nothing

##### Exceptional Flow 7:

1. Same as in Main Flow
2. Same as in Main Flow
3. Same as in Main Flow
4. Same as in Main Flow
5. Same as in Main Flow
6. Same as in Main Flow
7. Same as in Main Flow
8. Same as in Main Flow
9. New K1 address provided by _User_ is zero
10. _Smart Contract_ does nothing

### 6.2. DAO:SetFee

**Actors:** _User_, _Smart Contract_

**Goal:** _User_ wants to change fee being withheld by _Smart Contract_ when tokens are bought from it during GROWTH or LIFE stage

##### Main Flow:

1. _User_ calls method on _Smart Contract_ providing the following information: new fee as the number of base points, where base point is 0.005%.
2. _User_ is K1
3. New fee provided by _User_ is greater than or equal to 1 base point (0.005%)
4. New fee provided by _User_ is less than or equal to 2000 base points (10%)
5. _Smart Contract_ is currently in GROWTH or LIFE stage
6. At least 730 days passed since the beginning of GROWTH stage
7. New fee differs from current fee by not more than 1 base point (0.005%)
8. New fee differs from current fee
9. _Smart Contract_ sets new fee value
10. _Smart Contract_ logs fee change event with the following information: new fee

##### Exceptional Flow 1:

1. Same as in Main Flow
2. _User_ is not K1
3. _Smart Contract_ cancels transaction

##### Exceptional Flow 2:

1. Same as in Main Flow
2. Same as in Main Flow
3. New fee provided by _User_ is less than 1 base point (0.005%)
4. _Smart Contract_ cancels transaction

##### Exceptional Flow 3:

1. Same as in Main Flow
2. Same as in Main Flow
3. Same as in Main Flow
4. New fee provided by _User_ is greater than 2000 base points (10%)
5. _Smart Contract_ cancels transaction

##### Exceptional Flow 4:

1. Same as in Main Flow
2. Same as in Main Flow
3. Same as in Main Flow
4. Same as in Main Flow
5. _Smart Contract_ is currently not in GROWTH nor LIFE stage
6. _Smart Contract_ cancels transaction

##### Exceptional Flow 5:

1. Same as in Main Flow
2. Same as in Main Flow
3. Same as in Main Flow
4. Same as in Main Flow
5. Same as in Main Flow
6. Less than 730 days passed since the beginning of GROWTH stage
7. _Smart Contract_ cancels transaction

##### Exceptional Flow 6:

1. Same as in Main Flow
2. Same as in Main Flow
3. Same as in Main Flow
4. Same as in Main Flow
5. Same as in Main Flow
6. Same as in Main Flow
7. New fee differs from current fee by more than 1 base point (0.005%)
8. _Smart Contract_ cancels transaction

##### Exceptional Flow 7:

1. Same as in Main Flow
2. Same as in Main Flow
3. Same as in Main Flow
4. Same as in Main Flow
5. Same as in Main Flow
6. Same as in Main Flow
7. Same as in Main Flow
8. New fee provided by _User_ is the same as current fee
9. _Smart Contract_ does nothing

### 6.3. DAO:TotalEligibleVotes

**Actors:** _User_, _Smart Contract_

**Goal:** _User_ wants to know total number of votes eligible for choosing new K1 address

##### Main Flow:

1. _User_ calls constant method on _Smart Contract_
2. _Smart Contract_ returns total number of eligible votes to _User_

### 6.4. DAO:EligibleVotes

**Actors:** _User_, _Smart Contract_

**Goal:** _User_ wants to know number of votes eligible for choosing new K1 address certain investor has

##### Main Flow:

1. _User_ calls constant method on _Smart Contract_ providing the following information as method parameters: address of investor to get number of eligible votes for
2. _Smart Contract_ returns to _User_ number of eligible votes given investor has

### 6.5. DAO:EligibleVotes

**Actors:** _User_, _Smart Contract_

**Goal:** _User_ wants to know number of votes for certain new K1 address

##### Main Flow:

1. _User_ calls constant method on _Smart Contract_ providing the following information as method parameters: new K1 address to get number of votes for
2. _Smart Contract_ returns to _User_ number of votes for given new K1 address

## 7. Transition Use Cases

This section contains use cases that are executed by _Smart Contract_ automatically when it goes from one stage to another.
For transitions that are triggered by reaching certain deadline, corresponding transition use case is executed in a lazy way right before any use case whose behavior depends on current smart contract stage.
For transitions that are triggered by executing some method on smart contract, corresponding transition use case is executed right after the use implemented by the method that was called.

### 7.1. Transition:BeforeGrowth

**Actors:** _Smart Contract_, _Oris Space_

**Goal:** _Smart Contract_ goes from RESERVE to BEFORE_GROWTH stage

##### Main Flow DEADLINE:

1. RESERVE stage deadline reached
2. _Smart Contract_ calculates number of _Oris Space_ tokens to be burned in order to make reserve amount / total number of tokens ratio to be the same as it would be in case reserve cap would be reached, which is currently 0.0001 ETH per whole token
3. _Smart Contract_ orders _Order Space_ to start and return number of tokens calculated at step 2 to _Smart Contract_
4. Number of tokens calculated at step 2 is greater than zero
5. _Smart Contract_ burns number of tokens calculated at step 2
6. Token burning succeeded

##### Main Flow CAP:

1. Amount of ether collected during RESERVE stage reached reserve stage cap of 72500 ETH
2. _Smart Contract_ orders _Oris Space_ to start and return zero tokens

##### Exceptional Flow 1:

1. Same as in Main Flow DEADLINE
2. Same as in Main Flow DEADLINE
3. Same as in Main Flow DEADLINE
4. Number of tokens calculated at step 2 is zero
5. _Smart Contract_ does nothing

##### Exceptional Flow 2:

1. Same as in Main Flow DEADLINE
2. Same as in Main Flow DEADLINE
3. Same as in Main Flow DEADLINE
4. Same as in Main Flow DEADLINE
5. Same as in Main Flow DEADLINE
6. Token burning failed
7. _Smart Contract_ cancels transaction

## 8. Limits

This section describes limits established for technical reasons.

Limit                                   | Value
----------------------------------------|----------------------
Maximum amount of ether in reserve      | 2^128 - 1 Wei
Maximum number of tokens in circulation | 2^128 - 1 token units
