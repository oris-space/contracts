# Just Price Protocol Smart Contract #

Just Price Protocol Ethereum smart contract that serves as merket maker for Orgon tokens.
Copyright © 2018 by ABDK Consulting.

**Author:** Mikhail Vladimirov <mikhail.vladimirov@gmail.com>

## How to Deploy ##

In order to deploy Just Price Protocol Smart Contract you need the following
software to be properly installed on your system:

1. Geth 1.6.5+ (https://geth.ethereum.org/)

Also, you need Ethereum node running on your system and synchronized with the
network.  If you do not have one, you may run it via one of the following
commands depending on whether you want to connect to PRODNET or TESTNET:

    geth
    geth --testnet

If you are running Ethereum node for the first time, you may also add "--fast"
flag to speed up initial synchronization:

    geth --fast
    geth --testnet --fast

Also you need at least one account in your node.  If you do not have any
accounts, you may create one using the following commands:

    geth attach
    > personal.newAccount ();
    > exit

It will ask you to choose passphrase and enter it twice, and it will output an
address of your new created account.

You will also need some ether on your primary account.

In order to deploy Just Price Protocol Smart Contract do the following:

1. Go to the directory containing deployment script, i.e. file named
   `JustPriceProtocolDeploy.js`.
2. Attach to your local Ethereum node: `geth attach`
3. Set address of Orgon token smart contract: `var orgonToken = '0x0123456789012345678901234567890123456789;`
4. Set address of Oris.Space smart contract: `var orgonToken = '0x9876543210987654321098765432109876543210;`
5. Set address of K1 wallet: `var k1 = '0x0192837465019283746501928374650192837465;`
6. Unlock your primary account:
   `personal.unlockAccount (web3.eth.accounts [0]);` (you will be
   asked for your passphrase here)
7. Run deployment script: `loadScript ("JustPriceProtocolDeploy.js");`
8. If everything will go fine, after several seconds you will see message like
   the following: `Deployed at ... (tx: ...)`,
   which means that your contract was deployed (message shows address of the
   contract and hash of the transaction the contract was deployed by)
