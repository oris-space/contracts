/*
 * Test for Just Price Protocol Smart Contract.
 * Copyright © 2018 by ABDK Consulting.
 * Author: Mikhail Vladimirov <mikhail.vladimirov@gmail.com>
 */

tests.push ({
  name: "JustPriceProtocol",
  steps: [
    { name: "Ensure there is at least one account: Alice",
      body: function (test) {
        while (!web3.eth.accounts || web3.eth.accounts.length < 1)
          personal.newAccount ("");

        test.alice = web3.eth.accounts [0];
      }},
    { name: "Ensure Alice has at least 5 ETH",
      precondition: function (test) {
        miner.start ();
        return web3.eth.getBalance (test.alice).gte (web3.toWei ("5", "ether"));
      },
      body: function (test) {
        miner.stop ();
      }},
    { name: "Alice deploys five Wallet contracts: Bob, Carol, Dave, Elly, and Frank",
      body: function (test) {
        var walletCode = loadContractCode ("Wallet");
        test.walletContract = loadContract ("Wallet");

        personal.unlockAccount (test.alice, "");
        test.tx1 = test.walletContract.new (
          {from: test.alice, data: walletCode, gas: 1000000}).
          transactionHash;
        test.tx2 = test.walletContract.new (
          {from: test.alice, data: walletCode, gas: 1000000}).
          transactionHash;
        test.tx3 = test.walletContract.new (
          {from: test.alice, data: walletCode, gas: 1000000}).
          transactionHash;
        test.tx4 = test.walletContract.new (
          {from: test.alice, data: walletCode, gas: 1000000}).
          transactionHash;
        test.tx5 = test.walletContract.new (
          {from: test.alice, data: walletCode, gas: 1000000}).
          transactionHash;
      }},
    { name: "Make sure contracts were deployed",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (
          test.tx1, test.tx2, test.tx3, test.tx4, test.tx5);
      },
      body: function (test) {
        miner.stop ();

        test.bob = getDeployedContract ("Bob", test.walletContract, test.tx1);
        test.carol = getDeployedContract ("Carol", test.walletContract, test.tx2);
        test.dave = getDeployedContract ("Dave", test.walletContract, test.tx3);
        test.elly = getDeployedContract ("Elly", test.walletContract, test.tx4);
        test.frank = getDeployedContract ("Frank", test.walletContract, test.tx5);
      }},
    { name: "Alice deploys MyOrgonToken contract",
      body: function (test) {
        var myOrgonTokenCode = loadContractCode ("MyOrgonToken");
        test.myOrgonTokenContract = loadContract ("MyOrgonToken");

        personal.unlockAccount (test.alice, "");
        test.tx = test.myOrgonTokenContract.new (
          {from: test.alice, data: myOrgonTokenCode, gas:1000000}).
          transactionHash;
      }},
    { name: "Make sure contract was deployed",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        test.myOrgonToken = getDeployedContract (
          "MyOrgonToken",
          test.myOrgonTokenContract,
          test.tx);
      }},
    { name: "Alice deploys MyOrisSpace contract",
      body: function (test) {
        var myOrisSpaceCode = loadContractCode ("MyOrisSpace");
        test.myOrisSpaceContract = loadContract ("MyOrisSpace");

        personal.unlockAccount (test.alice, "");
        test.tx = test.myOrisSpaceContract.new (
          {from: test.alice, data: myOrisSpaceCode, gas:1000000}).
          transactionHash;
      }},
    { name: "Make sure contract was deployed",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        test.myOrisSpace = getDeployedContract (
          "MyOrisSpace",
          test.myOrisSpaceContract,
          test.tx);
      }},
    { name: "Alice deploys JustPriceProtocolWrapper contract",
      body: function (test) {
        var justPriceProtocolWrapperCode =
          loadContractCode ("JustPriceProtocolWrapper");
        test.justPriceProtocolWrapperContract =
          loadContract ("JustPriceProtocolWrapper");

        personal.unlockAccount (test.alice, "");
        test.tx = test.justPriceProtocolWrapperContract.new (
          test.myOrgonToken.address,
          test.myOrisSpace.address,
          test.bob.address,
          {from: test.alice, data: justPriceProtocolWrapperCode, gas:3000000}).
          transactionHash;
      }},
    { name: "Make sure contract was deployed",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        test.justPriceProtocolWrapper = getDeployedContract (
          "JustPriceProtocolWrapper",
          test.justPriceProtocolWrapperContract,
          test.tx);

        assertBNEquals (
          'test.justPriceProtocolWrapper.getStage (1524117599)',
          0, // BEFORE_RESERVE
          test.justPriceProtocolWrapper.getStage (1524117599));

        assertBNEquals (
          'test.justPriceProtocolWrapper.getStage (1524117600)',
          1, // RESERVE
          test.justPriceProtocolWrapper.getStage (1524117600));

        assertBNEquals (
          'test.justPriceProtocolWrapper.getStage (1531007999)',
          1, // RESERVE
          test.justPriceProtocolWrapper.getStage (1531007999));

        assertBNEquals (
          'test.justPriceProtocolWrapper.getStage (1531008000)',
          5, // REFUND
          test.justPriceProtocolWrapper.getStage (1531008000));
      }},
    { name: "Alice enables token transfers",
      body: function (test) {
        personal.unlockAccount (test.alice, "");
        test.tx = test.myOrgonToken.setTransfersEnabled (
          1000,
          {from: test.alice, gas:1000000});
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();
      }},
    { name: "Alice enables token creation",
      body: function (test) {
        personal.unlockAccount (test.alice, "");
        test.tx = test.myOrgonToken.setCreationEnabled (
          true,
          {from: test.alice, gas:1000000});
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();
      }},
    { name: "Alice enables token burning",
      body: function (test) {
        personal.unlockAccount (test.alice, "");
        test.tx = test.myOrgonToken.setBurningEnabled (
          true,
          {from: test.alice, gas:1000000});
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();
      }},
    { name: "Alice enables Oris.Space start",
      body: function (test) {
        personal.unlockAccount (test.alice, "");
        test.tx = test.myOrisSpace.setStartEnabled (
          true,
          {from: test.alice, gas:1000000});
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();
      }},
    { name: "Alice tells Bob to accept payments",
      body: function (test) {
        personal.unlockAccount (test.alice, "");
        test.tx = test.bob.setAcceptsPayments (
          true,
          {from: test.alice, gas:1000000});
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();
      }},
    { name: "Alice tells Elly to accept payments",
      body: function (test) {
        personal.unlockAccount (test.alice, "");
        test.tx = test.elly.setAcceptsPayments (
          true,
          {from: test.alice, gas:1000000});
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();
      }},
    { name: "Alice sets current time to 1 second before reserve stage start",
      body: function (test) {
        personal.unlockAccount (test.alice, "");
        test.tx = test.justPriceProtocolWrapper.setCurrentTime (
          1524117599,
          {from: test.alice, gas:1000000});
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();
      }},
    { name: "Bob tries to buy tokens for 0.0008 ether, but reserve stage didn't start yet",
      body: function (test) {
        assertBalance (
          'test.justPriceProtocolWrapper',
          '0',
          'ether',
          test.justPriceProtocolWrapper.address);

        assertBalance (
          'test.bob',
          '0',
          'ether',
          test.bob.address);

        assertBNEquals (
          'test.justPriceProtocolWrapper.getStage (1524117599)',
          0, // BEFORE_RESERVE
          test.justPriceProtocolWrapper.getStage (1524117599));

        assertBNEquals (
          'test.justPriceProtocolWrapper.outstandingTokens (test.bob.address)',
          0,
          test.justPriceProtocolWrapper.outstandingTokens (test.bob.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.eligibleVotes (test.bob.address)',
          0,
          test.justPriceProtocolWrapper.eligibleVotes (test.bob.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.totalEligibleVotes ()',
          0,
          test.justPriceProtocolWrapper.totalEligibleVotes ());

        personal.unlockAccount (test.alice, "");
        test.tx = test.bob.execute (
          test.justPriceProtocolWrapper.address,
          test.justPriceProtocolWrapper.buyTokens.getData (),
          web3.toWei ('0.0008', 'ether'),
          {
            from: test.alice,
            value: web3.toWei ('0.0008', 'ether'),
            gas:1000000
          });
      }},
    { name: "Make sure transaction failed",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.bob.Result",
          test.bob,
          test.bob.Result,
          test.tx,
          { value: false });

        assertEvents (
          "test.myOrgonToken.Transfer",
          test.myOrgonToken,
          test.myOrgonToken.Transfer,
          test.tx);

        assertEvents (
          "test.justPriceProtocolWrapper.Investment",
          test.justPriceProtocolWrapper,
          test.justPriceProtocolWrapper.Investment,
          test.tx);

        assertBalance (
          'test.justPriceProtocolWrapper',
          '0',
          'ether',
          test.justPriceProtocolWrapper.address);

        assertBalance (
          'test.bob',
          '0',
          'ether',
          test.bob.address);

        assertBNEquals (
          'test.justPriceProtocolWrapper.getStage (1524117599)',
          0, // BEFORE_RESERVE
          test.justPriceProtocolWrapper.getStage (1524117599));

        assertBNEquals (
          'test.justPriceProtocolWrapper.outstandingTokens (test.bob.address)',
          0,
          test.justPriceProtocolWrapper.outstandingTokens (test.bob.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.eligibleVotes (test.bob.address)',
          0,
          test.justPriceProtocolWrapper.eligibleVotes (test.bob.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.totalEligibleVotes ()',
          0,
          test.justPriceProtocolWrapper.totalEligibleVotes ());
      }},
    { name: "Elly tries to sells 10 tokens but smart contract is not in LIFE stage",
      body: function (test) {
        assertBNEquals (
          'test.justPriceProtocolWrapper.getStage (1524117599)',
          0, // BEFORE_RESERVE
          test.justPriceProtocolWrapper.getStage (1524117599));

        assertBalance (
          'test.justPriceProtocolWrapper',
          '0',
          'ether',
          test.justPriceProtocolWrapper.address);

        assertBalance (
          'test.elly',
          '0',
          'ether',
          test.elly.address);

        assertBNEquals (
          'test.justPriceProtocolWrapper.outstandingTokens (test.dave.address)',
          0,
          test.justPriceProtocolWrapper.outstandingTokens (test.dave.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.eligibleVotes (test.dave.address)',
          0,
          test.justPriceProtocolWrapper.eligibleVotes (test.dave.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.totalEligibleVotes ()',
          0,
          test.justPriceProtocolWrapper.totalEligibleVotes ());

        personal.unlockAccount (test.alice, "");
        test.tx = test.elly.execute (
          test.justPriceProtocolWrapper.address,
          test.justPriceProtocolWrapper.sellTokens.getData ('10000000000'),
          0,
          {
            from: test.alice,
            gas:1000000
          });
      }},
    { name: "Make sure transaction failed",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.elly.Result",
          test.elly,
          test.elly.Result,
          test.tx,
          { value: false });

        assertEvents (
          "test.myOrgonToken.Transfer",
          test.myOrgonToken,
          test.myOrgonToken.Transfer,
          test.tx);

        assertBNEquals (
          'test.justPriceProtocolWrapper.getStage (1524117599)',
          0, // BEFORE_RESERVE
          test.justPriceProtocolWrapper.getStage (1524117599));

        assertBalance (
          'test.justPriceProtocolWrapper',
          '0',
          'ether',
          test.justPriceProtocolWrapper.address);

        assertBalance (
          'test.elly',
          '0',
          'ether',
          test.elly.address);

        assertBNEquals (
          'test.justPriceProtocolWrapper.outstandingTokens (test.dave.address)',
          0,
          test.justPriceProtocolWrapper.outstandingTokens (test.dave.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.eligibleVotes (test.dave.address)',
          0,
          test.justPriceProtocolWrapper.eligibleVotes (test.dave.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.totalEligibleVotes ()',
          0,
          test.justPriceProtocolWrapper.totalEligibleVotes ());
      }},
    { name: "Carol tries to initiate token delivery to Bob but reserve stage didn't start yet",
      body: function (test) {
        assertBNEquals (
          'test.justPriceProtocolWrapper.getStage (1524117599)',
          0, // BEFORE_RESERVE
          test.justPriceProtocolWrapper.getStage (1524117599));

        assertBNEquals (
          'test.justPriceProtocolWrapper.outstandingTokens (test.bob.address)',
          '0',
          test.justPriceProtocolWrapper.outstandingTokens (test.bob.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.eligibleVotes (test.bob.address)',
          0,
          test.justPriceProtocolWrapper.eligibleVotes (test.bob.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.totalEligibleVotes ()',
          0,
          test.justPriceProtocolWrapper.totalEligibleVotes ());

        personal.unlockAccount (test.alice, "");
        test.tx = test.carol.execute (
          test.justPriceProtocolWrapper.address,
          test.justPriceProtocolWrapper.deliver.getData (
            [ test.bob.address ]),
          0,
          {
            from: test.alice,
            gas:1000000
          });
      }},
    { name: "Make sure transaction failed",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.carol.Result",
          test.carol,
          test.carol.Result,
          test.tx,
          { value: false });

        assertEvents (
          "test.myOrgonToken.Transfer",
          test.myOrgonToken,
          test.myOrgonToken.Transfer,
          test.tx);

        assertEvents (
          "test.justPriceProtocolWrapper.Delivery",
          test.justPriceProtocolWrapper,
          test.justPriceProtocolWrapper.Delivery,
          test.tx);

        assertBNEquals (
          'test.justPriceProtocolWrapper.getStage (1524117599)',
          0, // BEFORE_RESERVE
          test.justPriceProtocolWrapper.getStage (1524117599));

        assertBNEquals (
          'test.justPriceProtocolWrapper.outstandingTokens (test.bob.address)',
          '0',
          test.justPriceProtocolWrapper.outstandingTokens (test.bob.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.eligibleVotes (test.bob.address)',
          0,
          test.justPriceProtocolWrapper.eligibleVotes (test.bob.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.totalEligibleVotes ()',
          0,
          test.justPriceProtocolWrapper.totalEligibleVotes ());
      }},
    { name: "Carol tries to initiate refund for Bob but it is not refund stage",
      body: function (test) {
        assertBNEquals (
          'test.justPriceProtocolWrapper.getStage (1524117599)',
          0, // BEFORE_RESERVE
          test.justPriceProtocolWrapper.getStage (1524117599));

        assertBalance (
          'test.bob',
          '0',
          'ether',
          test.bob.address);

        personal.unlockAccount (test.alice, "");
        test.tx = test.carol.execute (
          test.justPriceProtocolWrapper.address,
          test.justPriceProtocolWrapper.refund.getData (
            [ test.bob.address ]),
          0,
          {
            from: test.alice,
            gas:1000000
          });
      }},
    { name: "Make sure transaction failed",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.carol.Result",
          test.carol,
          test.carol.Result,
          test.tx,
          { value: false });

        assertEvents (
          "test.justPriceProtocolWrapper.Refund",
          test.justPriceProtocolWrapper,
          test.justPriceProtocolWrapper.Refund,
          test.tx);

        assertBNEquals (
          'test.justPriceProtocolWrapper.getStage (1524117599)',
          0, // BEFORE_RESERVE
          test.justPriceProtocolWrapper.getStage (1524117599));

        assertBalance (
          'test.bob',
          '0',
          'ether',
          test.bob.address);
      }},
    { name: "Carol tries to vote for Frank but it is not life stage",
      body: function (test) {
        assertBNEquals (
          'test.justPriceProtocolWrapper.getStage (1524117599)',
          0, // BEFORE_RESERVE
          test.justPriceProtocolWrapper.getStage (1524117599));

        assertBNEquals (
          'test.justPriceProtocolWrapper.votesFor (test.frank.address)',
          0,
          test.justPriceProtocolWrapper.votesFor (test.frank.address));

        personal.unlockAccount (test.alice, "");
        test.tx = test.carol.execute (
          test.justPriceProtocolWrapper.address,
          test.justPriceProtocolWrapper.vote.getData (test.frank.address),
          0,
          {
            from: test.alice,
            gas:1000000
          });
      }},
    { name: "Make sure transaction failed",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.carol.Result",
          test.carol,
          test.carol.Result,
          test.tx,
          { value: false });

        assertEvents (
          "test.justPriceProtocolWrapper.Vote",
          test.justPriceProtocolWrapper,
          test.justPriceProtocolWrapper.Vote,
          test.tx);

        assertEvents (
          "test.justPriceProtocolWrapper.VoteRevocation",
          test.justPriceProtocolWrapper,
          test.justPriceProtocolWrapper.VoteRevocation,
          test.tx);

        assertEvents (
          "test.justPriceProtocolWrapper.K1Change",
          test.justPriceProtocolWrapper,
          test.justPriceProtocolWrapper.K1Change,
          test.tx);

        assertBNEquals (
          'test.justPriceProtocolWrapper.getStage (1524117599)',
          0, // BEFORE_RESERVE
          test.justPriceProtocolWrapper.getStage (1524117599));

        assertBNEquals (
          'test.justPriceProtocolWrapper.votesFor (test.frank.address)',
          '0',
          test.justPriceProtocolWrapper.votesFor (test.frank.address));
      }},
    { name: "Alice sets current time to reserve stage start time",
      body: function (test) {
        personal.unlockAccount (test.alice, "");
        test.tx = test.justPriceProtocolWrapper.setCurrentTime (
          1524117600,
          {from: test.alice, gas:1000000});
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();
      }},
    { name: "Elly tries to sells 10 tokens but smart contract is not in LIFE stage",
      body: function (test) {
        assertBNEquals (
          'test.justPriceProtocolWrapper.getStage (1524117600)',
          1, // RESERVE
          test.justPriceProtocolWrapper.getStage (1524117600));

        assertBalance (
          'test.justPriceProtocolWrapper',
          '0',
          'ether',
          test.justPriceProtocolWrapper.address);

        assertBalance (
          'test.elly',
          '0',
          'ether',
          test.elly.address);

        assertBNEquals (
          'test.justPriceProtocolWrapper.outstandingTokens (test.dave.address)',
          0,
          test.justPriceProtocolWrapper.outstandingTokens (test.dave.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.eligibleVotes (test.dave.address)',
          0,
          test.justPriceProtocolWrapper.eligibleVotes (test.dave.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.totalEligibleVotes ()',
          0,
          test.justPriceProtocolWrapper.totalEligibleVotes ());

        personal.unlockAccount (test.alice, "");
        test.tx = test.elly.execute (
          test.justPriceProtocolWrapper.address,
          test.justPriceProtocolWrapper.sellTokens.getData ('10000000000'),
          0,
          {
            from: test.alice,
            gas:1000000
          });
      }},
    { name: "Make sure transaction failed",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.elly.Result",
          test.elly,
          test.elly.Result,
          test.tx,
          { value: false });

        assertEvents (
          "test.myOrgonToken.Transfer",
          test.myOrgonToken,
          test.myOrgonToken.Transfer,
          test.tx);

        assertBNEquals (
          'test.justPriceProtocolWrapper.getStage (1524117600)',
          1, // RESERVE
          test.justPriceProtocolWrapper.getStage (1524117600));

        assertBalance (
          'test.justPriceProtocolWrapper',
          '0',
          'ether',
          test.justPriceProtocolWrapper.address);

        assertBalance (
          'test.elly',
          '0',
          'ether',
          test.elly.address);

        assertBNEquals (
          'test.justPriceProtocolWrapper.outstandingTokens (test.dave.address)',
          0,
          test.justPriceProtocolWrapper.outstandingTokens (test.dave.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.eligibleVotes (test.dave.address)',
          0,
          test.justPriceProtocolWrapper.eligibleVotes (test.dave.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.totalEligibleVotes ()',
          0,
          test.justPriceProtocolWrapper.totalEligibleVotes ());
      }},
    { name: "Bob tries to buys tokens for 0 ether",
      body: function (test) {
        assertBNEquals (
          'test.justPriceProtocolWrapper.getStage (1524117600)',
          1, // RESERVE
          test.justPriceProtocolWrapper.getStage (1524117600));

        assertBalance (
          'test.justPriceProtocolWrapper',
          '0',
          'ether',
          test.justPriceProtocolWrapper.address);

        assertBalance (
          'test.bob',
          '0',
          'ether',
          test.bob.address);

        assertBNEquals (
          'test.justPriceProtocolWrapper.outstandingTokens (test.bob.address)',
          0,
          test.justPriceProtocolWrapper.outstandingTokens (test.bob.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.eligibleVotes (test.bob.address)',
          0,
          test.justPriceProtocolWrapper.eligibleVotes (test.bob.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.totalEligibleVotes ()',
          0,
          test.justPriceProtocolWrapper.totalEligibleVotes ());

        personal.unlockAccount (test.alice, "");
        test.tx = test.bob.execute (
          test.justPriceProtocolWrapper.address,
          test.justPriceProtocolWrapper.buyTokens.getData (),
          0,
          {
            from: test.alice,
            value: 0,
            gas:1000000
          });
      }},
    { name: "Make sure transaction failed",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.bob.Result",
          test.bob,
          test.bob.Result,
          test.tx,
          { value: false });

        assertEvents (
          "test.myOrgonToken.Transfer",
          test.myOrgonToken,
          test.myOrgonToken.Transfer,
          test.tx);

        assertEvents (
          "test.myOrisSpace.Start",
          test.myOrisSpace,
          test.myOrisSpace.Start,
          test.tx);

        assertEvents (
          "test.justPriceProtocolWrapper.Investment",
          test.justPriceProtocolWrapper,
          test.justPriceProtocolWrapper.Investment,
          test.tx);

        assertBalance (
          'test.justPriceProtocolWrapper',
          '0',
          'ether',
          test.justPriceProtocolWrapper.address);

        assertBalance (
          'test.bob',
          '0',
          'ether',
          test.bob.address);

        assertBNEquals (
          'test.justPriceProtocolWrapper.getStage (1524117600)',
          1, // RESERVE
          test.justPriceProtocolWrapper.getStage (1524117600));

        assertBNEquals (
          'test.justPriceProtocolWrapper.outstandingTokens (test.bob.address)',
          0,
          test.justPriceProtocolWrapper.outstandingTokens (test.bob.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.eligibleVotes (test.bob.address)',
          0,
          test.justPriceProtocolWrapper.eligibleVotes (test.bob.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.totalEligibleVotes ()',
          0,
          test.justPriceProtocolWrapper.totalEligibleVotes ());
      }},
    { name: "Alice disables token creation",
      body: function (test) {
        personal.unlockAccount (test.alice, "");
        test.tx = test.myOrgonToken.setCreationEnabled (
          false,
          {from: test.alice, gas:1000000});
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();
      }},
    { name: "Bob tries to buys tokens for 0.0008 ether but token creation is disabled",
      body: function (test) {
        assertBNEquals (
          'test.justPriceProtocolWrapper.getStage (1524117600)',
          1, // RESERVE
          test.justPriceProtocolWrapper.getStage (1524117600));

        assertBalance (
          'test.justPriceProtocolWrapper',
          '0',
          'ether',
          test.justPriceProtocolWrapper.address);

        assertBalance (
          'test.bob',
          '0',
          'ether',
          test.bob.address);

        assertBNEquals (
          'test.justPriceProtocolWrapper.outstandingTokens (test.bob.address)',
          0,
          test.justPriceProtocolWrapper.outstandingTokens (test.bob.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.eligibleVotes (test.bob.address)',
          0,
          test.justPriceProtocolWrapper.eligibleVotes (test.bob.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.totalEligibleVotes ()',
          0,
          test.justPriceProtocolWrapper.totalEligibleVotes ());

        personal.unlockAccount (test.alice, "");
        test.tx = test.bob.execute (
          test.justPriceProtocolWrapper.address,
          test.justPriceProtocolWrapper.buyTokens.getData (),
          web3.toWei ('0.0008', 'ether'),
          {
            from: test.alice,
            value: web3.toWei ('0.0008', 'ether'),
            gas:1000000
          });
      }},
    { name: "Make sure transaction failed",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.bob.Result",
          test.bob,
          test.bob.Result,
          test.tx,
          { value: false });

        assertEvents (
          "test.myOrgonToken.Transfer",
          test.myOrgonToken,
          test.myOrgonToken.Transfer,
          test.tx);

        assertEvents (
          "test.myOrisSpace.Start",
          test.myOrisSpace,
          test.myOrisSpace.Start,
          test.tx);

        assertEvents (
          "test.justPriceProtocolWrapper.Investment",
          test.justPriceProtocolWrapper,
          test.justPriceProtocolWrapper.Investment,
          test.tx);

        assertBalance (
          'test.justPriceProtocolWrapper',
          '0',
          'ether',
          test.justPriceProtocolWrapper.address);

        assertBalance (
          'test.bob',
          '0',
          'ether',
          test.bob.address);

        assertBNEquals (
          'test.justPriceProtocolWrapper.getStage (1524117600)',
          1, // RESERVE
          test.justPriceProtocolWrapper.getStage (1524117600));

        assertBNEquals (
          'test.justPriceProtocolWrapper.outstandingTokens (test.bob.address)',
          0,
          test.justPriceProtocolWrapper.outstandingTokens (test.bob.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.eligibleVotes (test.bob.address)',
          0,
          test.justPriceProtocolWrapper.eligibleVotes (test.bob.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.totalEligibleVotes ()',
          0,
          test.justPriceProtocolWrapper.totalEligibleVotes ());
      }},
    { name: "Bob tries to buy tokens for 0.000000000000799999 ether",
      body: function (test) {
        assertBNEquals (
          'test.justPriceProtocolWrapper.getStage (1524117600)',
          1, // RESERVE
          test.justPriceProtocolWrapper.getStage (1524117600));

        assertBalance (
          'test.justPriceProtocolWrapper',
          '0',
          'ether',
          test.justPriceProtocolWrapper.address);

        assertBalance (
          'test.bob',
          '0',
          'ether',
          test.bob.address);

        assertBNEquals (
          'test.justPriceProtocolWrapper.outstandingTokens (test.bob.address)',
          0,
          test.justPriceProtocolWrapper.outstandingTokens (test.bob.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.eligibleVotes (test.bob.address)',
          0,
          test.justPriceProtocolWrapper.eligibleVotes (test.bob.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.totalEligibleVotes ()',
          0,
          test.justPriceProtocolWrapper.totalEligibleVotes ());

        personal.unlockAccount (test.alice, "");
        test.tx = test.bob.execute (
          test.justPriceProtocolWrapper.address,
          test.justPriceProtocolWrapper.buyTokens.getData (),
          web3.toWei ('0.000000000000799999', 'ether'),
          {
            from: test.alice,
            value: web3.toWei ('0.000000000000799999', 'ether'),
            gas:1000000
          });
      }},
    { name: "Make sure transaction succeeded nut not events were logged",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.bob.Result",
          test.bob,
          test.bob.Result,
          test.tx,
          { value: true });

        assertEvents (
          "test.myOrgonToken.Transfer",
          test.myOrgonToken,
          test.myOrgonToken.Transfer,
          test.tx);

        assertEvents (
          "test.myOrisSpace.Start",
          test.myOrisSpace,
          test.myOrisSpace.Start,
          test.tx);

        assertEvents (
          "test.justPriceProtocolWrapper.Investment",
          test.justPriceProtocolWrapper,
          test.justPriceProtocolWrapper.Investment,
          test.tx);

        assertBalance (
          'test.justPriceProtocolWrapper',
          '0',
          'ether',
          test.justPriceProtocolWrapper.address);

        assertBalance (
          'test.bob',
          '0.000000000000799999',
          'ether',
          test.bob.address);

        assertBNEquals (
          'test.justPriceProtocolWrapper.getStage (1524117600)',
          1, // RESERVE
          test.justPriceProtocolWrapper.getStage (1524117600));

        assertBNEquals (
          'test.justPriceProtocolWrapper.outstandingTokens (test.bob.address)',
          '0',
          test.justPriceProtocolWrapper.outstandingTokens (test.bob.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.eligibleVotes (test.bob.address)',
          0,
          test.justPriceProtocolWrapper.eligibleVotes (test.bob.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.totalEligibleVotes ()',
          0,
          test.justPriceProtocolWrapper.totalEligibleVotes ());
      }},
    { name: "Alice tells Bob to deny payments",
      body: function (test) {
        personal.unlockAccount (test.alice, "");
        test.tx = test.bob.setAcceptsPayments (
          false,
          {from: test.alice, gas:1000000});
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();
      }},
    { name: "Alice enables token creation",
      body: function (test) {
        personal.unlockAccount (test.alice, "");
        test.tx = test.myOrgonToken.setCreationEnabled (
          true,
          {from: test.alice, gas:1000000});
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();
      }},
    { name: "Bob buys tokens for 0.0008 ether",
      body: function (test) {
        assertBNEquals (
          'test.justPriceProtocolWrapper.getStage (1524117600)',
          1, // RESERVE
          test.justPriceProtocolWrapper.getStage (1524117600));

        assertBalance (
          'test.justPriceProtocolWrapper',
          '0',
          'ether',
          test.justPriceProtocolWrapper.address);

        assertBalance (
          'test.bob',
          '0.000000000000799999',
          'ether',
          test.bob.address);

        assertBNEquals (
          'test.justPriceProtocolWrapper.outstandingTokens (test.bob.address)',
          0,
          test.justPriceProtocolWrapper.outstandingTokens (test.bob.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.eligibleVotes (test.bob.address)',
          0,
          test.justPriceProtocolWrapper.eligibleVotes (test.bob.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.totalEligibleVotes ()',
          0,
          test.justPriceProtocolWrapper.totalEligibleVotes ());

        personal.unlockAccount (test.alice, "");
        test.tx = test.bob.execute (
          test.justPriceProtocolWrapper.address,
          test.justPriceProtocolWrapper.buyTokens.getData (),
          web3.toWei ('0.0008', 'ether'),
          {
            from: test.alice,
            value: web3.toWei ('0.0008', 'ether'),
            gas:1000000
          });
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.bob.Result",
          test.bob,
          test.bob.Result,
          test.tx,
          { value: true });

        assertEvents (
          "test.myOrgonToken.Transfer",
          test.myOrgonToken,
          test.myOrgonToken.Transfer,
          test.tx,
          {
            _from: '0x0000000000000000000000000000000000000000',
            _to: test.justPriceProtocolWrapper.address,
            _value: '1000000000'
          });

        assertEvents (
          "test.myOrisSpace.Start",
          test.myOrisSpace,
          test.myOrisSpace.Start,
          test.tx);

        assertEvents (
          "test.justPriceProtocolWrapper.Investment",
          test.justPriceProtocolWrapper,
          test.justPriceProtocolWrapper.Investment,
          test.tx,
          {
            investor: test.bob.address,
            value: web3.toWei ('0.0008', 'ether'),
            amount: '1000000000'
          });

        assertBalance (
          'test.justPriceProtocolWrapper',
          '0.0008',
          'ether',
          test.justPriceProtocolWrapper.address);

        assertBalance (
          'test.bob',
          '0.000000000000799999',
          'ether',
          test.bob.address);

        assertBNEquals (
          'test.justPriceProtocolWrapper.getStage (1524117600)',
          1, // RESERVE
          test.justPriceProtocolWrapper.getStage (1524117600));

        assertBNEquals (
          'test.justPriceProtocolWrapper.outstandingTokens (test.bob.address)',
          '1000000000',
          test.justPriceProtocolWrapper.outstandingTokens (test.bob.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.eligibleVotes (test.bob.address)',
          '1000000000',
          test.justPriceProtocolWrapper.eligibleVotes (test.bob.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.totalEligibleVotes ()',
          '1000000000',
          test.justPriceProtocolWrapper.totalEligibleVotes ());
      }},
    { name: "Alice tells Bob to accept payments",
      body: function (test) {
        personal.unlockAccount (test.alice, "");
        test.tx = test.bob.setAcceptsPayments (
          true,
          {from: test.alice, gas:1000000});
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();
      }},
    { name: "Bob performs transaction to non-existing method sending 0.0008 ether",
      body: function (test) {
        assertBNEquals (
          'test.justPriceProtocolWrapper.getStage (1524117600)',
          1, // RESERVE
          test.justPriceProtocolWrapper.getStage (1524117600));

        assertBalance (
          'test.justPriceProtocolWrapper',
          '0.0008',
          'ether',
          test.justPriceProtocolWrapper.address);

        assertBalance (
          'test.bob',
          '0.000000000000799999',
          'ether',
          test.bob.address);

        assertBNEquals (
          'test.justPriceProtocolWrapper.outstandingTokens (test.bob.address)',
          '1000000000',
          test.justPriceProtocolWrapper.outstandingTokens (test.bob.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.eligibleVotes (test.bob.address)',
          '1000000000',
          test.justPriceProtocolWrapper.eligibleVotes (test.bob.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.totalEligibleVotes ()',
          '1000000000',
          test.justPriceProtocolWrapper.totalEligibleVotes ());

        personal.unlockAccount (test.alice, "");
        test.tx = test.bob.execute (
          test.justPriceProtocolWrapper.address,
          '0xF00BA700',
          web3.toWei ('0.0008', 'ether'),
          {
            from: test.alice,
            value: web3.toWei ('0.0008', 'ether'),
            gas:1000000
          });
      }},
    { name: "Make sure transaction failed",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.bob.Result",
          test.bob,
          test.bob.Result,
          test.tx,
          { value: false });

        assertEvents (
          "test.myOrgonToken.Transfer",
          test.myOrgonToken,
          test.myOrgonToken.Transfer,
          test.tx);

        assertEvents (
          "test.myOrisSpace.Start",
          test.myOrisSpace,
          test.myOrisSpace.Start,
          test.tx);

        assertEvents (
          "test.justPriceProtocolWrapper.Investment",
          test.justPriceProtocolWrapper,
          test.justPriceProtocolWrapper.Investment,
          test.tx);

        assertBalance (
          'test.justPriceProtocolWrapper',
          '0.0008',
          'ether',
          test.justPriceProtocolWrapper.address);

        assertBalance (
          'test.bob',
          '0.000000000000799999',
          'ether',
          test.bob.address);

        assertBNEquals (
          'test.justPriceProtocolWrapper.getStage (1524117600)',
          1, // RESERVE
          test.justPriceProtocolWrapper.getStage (1524117600));

        assertBNEquals (
          'test.justPriceProtocolWrapper.outstandingTokens (test.bob.address)',
          '1000000000',
          test.justPriceProtocolWrapper.outstandingTokens (test.bob.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.eligibleVotes (test.bob.address)',
          '1000000000',
          test.justPriceProtocolWrapper.eligibleVotes (test.bob.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.totalEligibleVotes ()',
          '1000000000',
          test.justPriceProtocolWrapper.totalEligibleVotes ());
      }},
    { name: "Alice tells Bob to deny payments",
      body: function (test) {
        personal.unlockAccount (test.alice, "");
        test.tx = test.bob.setAcceptsPayments (
          false,
          {from: test.alice, gas:1000000});
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();
      }},
    { name: "Bob performs no-data transaction sending 0.0008 ether",
      body: function (test) {
        assertBNEquals (
          'test.justPriceProtocolWrapper.getStage (1524117600)',
          1, // RESERVE
          test.justPriceProtocolWrapper.getStage (1524117600));

        assertBalance (
          'test.justPriceProtocolWrapper',
          '0.0008',
          'ether',
          test.justPriceProtocolWrapper.address);

        assertBalance (
          'test.bob',
          '0.000000000000799999',
          'ether',
          test.bob.address);

        assertBNEquals (
          'test.justPriceProtocolWrapper.outstandingTokens (test.bob.address)',
          '1000000000',
          test.justPriceProtocolWrapper.outstandingTokens (test.bob.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.eligibleVotes (test.bob.address)',
          '1000000000',
          test.justPriceProtocolWrapper.eligibleVotes (test.bob.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.totalEligibleVotes ()',
          '1000000000',
          test.justPriceProtocolWrapper.totalEligibleVotes ());

        personal.unlockAccount (test.alice, "");
        test.tx = test.bob.execute (
          test.justPriceProtocolWrapper.address,
          '',
          web3.toWei ('0.0008', 'ether'),
          {
            from: test.alice,
            value: web3.toWei ('0.0008', 'ether'),
            gas:1000000
          });
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.bob.Result",
          test.bob,
          test.bob.Result,
          test.tx,
          { value: true });

        assertEvents (
          "test.myOrgonToken.Transfer",
          test.myOrgonToken,
          test.myOrgonToken.Transfer,
          test.tx,
          {
            _from: '0x0000000000000000000000000000000000000000',
            _to: test.justPriceProtocolWrapper.address,
            _value: '1000000000'
          });

        assertEvents (
          "test.myOrisSpace.Start",
          test.myOrisSpace,
          test.myOrisSpace.Start,
          test.tx);

        assertEvents (
          "test.justPriceProtocolWrapper.Investment",
          test.justPriceProtocolWrapper,
          test.justPriceProtocolWrapper.Investment,
          test.tx,
          {
            investor: test.bob.address,
            value: web3.toWei ('0.0008', 'ether'),
            amount: '1000000000'
          });

        assertBalance (
          'test.justPriceProtocolWrapper',
          '0.0016',
          'ether',
          test.justPriceProtocolWrapper.address);

        assertBalance (
          'test.bob',
          '0.000000000000799999',
          'ether',
          test.bob.address);

        assertBNEquals (
          'test.justPriceProtocolWrapper.getStage (1524117600)',
          1, // RESERVE
          test.justPriceProtocolWrapper.getStage (1524117600));

        assertBNEquals (
          'test.justPriceProtocolWrapper.outstandingTokens (test.bob.address)',
          '2000000000',
          test.justPriceProtocolWrapper.outstandingTokens (test.bob.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.eligibleVotes (test.bob.address)',
          '2000000000',
          test.justPriceProtocolWrapper.eligibleVotes (test.bob.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.totalEligibleVotes ()',
          '2000000000',
          test.justPriceProtocolWrapper.totalEligibleVotes ());
      }},
    { name: "Alice tells Bob to accept payments",
      body: function (test) {
        personal.unlockAccount (test.alice, "");
        test.tx = test.bob.setAcceptsPayments (
          true,
          {from: test.alice, gas:1000000});
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();
      }},
    { name: "Carol tries to initiate token delivery to Bob but reserve stage didn't end yet",
      body: function (test) {
        assertBNEquals (
          'test.justPriceProtocolWrapper.getStage (1524117600)',
          1, // RESERVE
          test.justPriceProtocolWrapper.getStage (1524117600));

        assertBNEquals (
          'test.justPriceProtocolWrapper.outstandingTokens (test.bob.address)',
          '2000000000',
          test.justPriceProtocolWrapper.outstandingTokens (test.bob.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.eligibleVotes (test.bob.address)',
          '2000000000',
          test.justPriceProtocolWrapper.eligibleVotes (test.bob.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.totalEligibleVotes ()',
          '2000000000',
          test.justPriceProtocolWrapper.totalEligibleVotes ());

        personal.unlockAccount (test.alice, "");
        test.tx = test.carol.execute (
          test.justPriceProtocolWrapper.address,
          test.justPriceProtocolWrapper.deliver.getData (
            [ test.bob.address ]),
          0,
          {
            from: test.alice,
            gas:1000000
          });
      }},
    { name: "Make sure transaction failed",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.carol.Result",
          test.carol,
          test.carol.Result,
          test.tx,
          { value: false });

        assertEvents (
          "test.myOrgonToken.Transfer",
          test.myOrgonToken,
          test.myOrgonToken.Transfer,
          test.tx);

        assertEvents (
          "test.justPriceProtocolWrapper.Delivery",
          test.justPriceProtocolWrapper,
          test.justPriceProtocolWrapper.Delivery,
          test.tx);

        assertBNEquals (
          'test.justPriceProtocolWrapper.getStage (1524117600)',
          1, // RESERVE
          test.justPriceProtocolWrapper.getStage (1524117600));

        assertBNEquals (
          'test.justPriceProtocolWrapper.outstandingTokens (test.bob.address)',
          '2000000000',
          test.justPriceProtocolWrapper.outstandingTokens (test.bob.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.eligibleVotes (test.bob.address)',
          '2000000000',
          test.justPriceProtocolWrapper.eligibleVotes (test.bob.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.totalEligibleVotes ()',
          '2000000000',
          test.justPriceProtocolWrapper.totalEligibleVotes ());
      }},
    { name: "Carol tries to initiate refund for Bob but it is not refund stage",
      body: function (test) {
        assertBNEquals (
          'test.justPriceProtocolWrapper.getStage (1524117600)',
          1, // RESERVE
          test.justPriceProtocolWrapper.getStage (1524117600));

        assertBalance (
          'test.bob',
          '0.000000000000799999',
          'ether',
          test.bob.address);

        personal.unlockAccount (test.alice, "");
        test.tx = test.carol.execute (
          test.justPriceProtocolWrapper.address,
          test.justPriceProtocolWrapper.refund.getData (
            [ test.bob.address ]),
          0,
          {
            from: test.alice,
            gas:1000000
          });
      }},
    { name: "Make sure transaction failed",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.carol.Result",
          test.carol,
          test.carol.Result,
          test.tx,
          { value: false });

        assertEvents (
          "test.justPriceProtocolWrapper.Refund",
          test.justPriceProtocolWrapper,
          test.justPriceProtocolWrapper.Refund,
          test.tx);

        assertBNEquals (
          'test.justPriceProtocolWrapper.getStage (1524117600)',
          1, // RESERVE
          test.justPriceProtocolWrapper.getStage (1524117600));

        assertBalance (
          'test.bob',
          '0.000000000000799999',
          'ether',
          test.bob.address);
      }},
    { name: "Carol tries to vote for Frank but it is not life stage",
      body: function (test) {
        assertBNEquals (
          'test.justPriceProtocolWrapper.getStage (1524117600)',
          1, // RESERVE
          test.justPriceProtocolWrapper.getStage (1524117600));

        assertBNEquals (
          'test.justPriceProtocolWrapper.votesFor (test.frank.address)',
          0,
          test.justPriceProtocolWrapper.votesFor (test.frank.address));

        personal.unlockAccount (test.alice, "");
        test.tx = test.carol.execute (
          test.justPriceProtocolWrapper.address,
          test.justPriceProtocolWrapper.vote.getData (test.frank.address),
          0,
          {
            from: test.alice,
            gas:1000000
          });
      }},
    { name: "Make sure transaction failed",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.carol.Result",
          test.carol,
          test.carol.Result,
          test.tx,
          { value: false });

        assertEvents (
          "test.justPriceProtocolWrapper.Vote",
          test.justPriceProtocolWrapper,
          test.justPriceProtocolWrapper.Vote,
          test.tx);

        assertEvents (
          "test.justPriceProtocolWrapper.VoteRevocation",
          test.justPriceProtocolWrapper,
          test.justPriceProtocolWrapper.VoteRevocation,
          test.tx);

        assertEvents (
          "test.justPriceProtocolWrapper.K1Change",
          test.justPriceProtocolWrapper,
          test.justPriceProtocolWrapper.K1Change,
          test.tx);

        assertBNEquals (
          'test.justPriceProtocolWrapper.getStage (1524117600)',
          1, // RESERVE
          test.justPriceProtocolWrapper.getStage (1524117600));

        assertBNEquals (
          'test.justPriceProtocolWrapper.votesFor (test.frank.address)',
          '0',
          test.justPriceProtocolWrapper.votesFor (test.frank.address));
      }},
    { name: "Bob tries to increases fee by one, but GROWTH stage not started yet",
      body: function (test) {
        assertBNEquals (
          'test.justPriceProtocolWrapper.getFee ()',
          2,
          test.justPriceProtocolWrapper.getFee ());

        personal.unlockAccount (test.alice, "");
        test.tx = test.bob.execute (
          test.justPriceProtocolWrapper.address,
          test.justPriceProtocolWrapper.setFee.getData (3),
          0,
          {
            from: test.alice,
            gas:1000000
          });
      }},
    { name: "Make sure transaction failed",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.bob.Result",
          test.bob,
          test.bob.Result,
          test.tx,
          { value: false });

        assertEvents (
          "test.justPriceProtocolWrapper.FeeChange",
          test.justPriceProtocolWrapper,
          test.justPriceProtocolWrapper.FeeChange,
          test.tx);

        assertBNEquals (
          'test.justPriceProtocolWrapper.getFee ()',
          2,
          test.justPriceProtocolWrapper.getFee ());
      }},
    { name: "Alice tells Bob to deny payments",
      body: function (test) {
        personal.unlockAccount (test.alice, "");
        test.tx = test.bob.setAcceptsPayments (
          false,
          {from: test.alice, gas:1000000});
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();
      }},
    { name: "Bob tries to buy tokens for 13000 ether but he does not accept payment and some change ought to be returned",
      body: function (test) {
        assertBalance (
          'test.justPriceProtocolWrapper',
          '0.0016',
          'ether',
          test.justPriceProtocolWrapper.address);

        assertBalance (
          'test.bob',
          '0.000000000000799999',
          'ether',
          test.bob.address);

        assertBNEquals (
          'test.justPriceProtocolWrapper.getStage (1524117600)',
          1, // RESERVE
          test.justPriceProtocolWrapper.getStage (1524117600));

        assertBNEquals (
          'test.justPriceProtocolWrapper.outstandingTokens (test.bob.address)',
          '2000000000',
          test.justPriceProtocolWrapper.outstandingTokens (test.bob.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.eligibleVotes (test.bob.address)',
          '2000000000',
          test.justPriceProtocolWrapper.eligibleVotes (test.bob.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.totalEligibleVotes ()',
          '2000000000',
          test.justPriceProtocolWrapper.totalEligibleVotes ());

        personal.unlockAccount (test.alice, "");
        test.tx = test.bob.execute (
          test.justPriceProtocolWrapper.address,
          test.justPriceProtocolWrapper.buyTokens.getData (),
          web3.toWei ('13000', 'ether'),
          {
            from: test.alice,
            value: web3.toWei ('13000', 'ether'),
            gas:1000000
          });
      }},
    { name: "Make sure transaction failed",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.bob.Result",
          test.bob,
          test.bob.Result,
          test.tx,
          { value: false });

        assertEvents (
          "test.myOrgonToken.Transfer",
          test.myOrgonToken,
          test.myOrgonToken.Transfer,
          test.tx);

        assertEvents (
          "test.myOrisSpace.Start",
          test.myOrisSpace,
          test.myOrisSpace.Start,
          test.tx);

        assertEvents (
          "test.justPriceProtocolWrapper.Investment",
          test.justPriceProtocolWrapper,
          test.justPriceProtocolWrapper.Investment,
          test.tx);

        assertBalance (
          'test.justPriceProtocolWrapper',
          '0.0016',
          'ether',
          test.justPriceProtocolWrapper.address);

        assertBalance (
          'test.bob',
          '0.000000000000799999',
          'ether',
          test.bob.address);

        assertBNEquals (
          'test.justPriceProtocolWrapper.getStage (1524117600)',
          1, // RESERVE
          test.justPriceProtocolWrapper.getStage (1524117600));

        assertBNEquals (
          'test.justPriceProtocolWrapper.outstandingTokens (test.bob.address)',
          '2000000000',
          test.justPriceProtocolWrapper.outstandingTokens (test.bob.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.eligibleVotes (test.bob.address)',
          '2000000000',
          test.justPriceProtocolWrapper.eligibleVotes (test.bob.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.totalEligibleVotes ()',
          '2000000000',
          test.justPriceProtocolWrapper.totalEligibleVotes ());
      }},
    { name: "Alice tells Bob to accept payments",
      body: function (test) {
        personal.unlockAccount (test.alice, "");
        test.tx = test.bob.setAcceptsPayments (
          true,
          {from: test.alice, gas:1000000});
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();
      }},
    { name: "Bob buys tokens for 13000 ether",
      body: function (test) {
        assertBalance (
          'test.justPriceProtocolWrapper',
          '0.0016',
          'ether',
          test.justPriceProtocolWrapper.address);

        assertBalance (
          'test.bob',
          '0.000000000000799999',
          'ether',
          test.bob.address);

        assertBNEquals (
          'test.justPriceProtocolWrapper.getStage (1524117600)',
          1, // RESERVE
          test.justPriceProtocolWrapper.getStage (1524117600));

        assertBNEquals (
          'test.justPriceProtocolWrapper.outstandingTokens (test.bob.address)',
          '2000000000',
          test.justPriceProtocolWrapper.outstandingTokens (test.bob.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.eligibleVotes (test.bob.address)',
          '2000000000',
          test.justPriceProtocolWrapper.eligibleVotes (test.bob.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.totalEligibleVotes ()',
          '2000000000',
          test.justPriceProtocolWrapper.totalEligibleVotes ());

        personal.unlockAccount (test.alice, "");
        test.tx = test.bob.execute (
          test.justPriceProtocolWrapper.address,
          test.justPriceProtocolWrapper.buyTokens.getData (),
          web3.toWei ('13000', 'ether'),
          {
            from: test.alice,
            value: web3.toWei ('13000', 'ether'),
            gas:1000000
          });
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.bob.Result",
          test.bob,
          test.bob.Result,
          test.tx,
          { value: true });

        assertEvents (
          "test.myOrgonToken.Transfer",
          test.myOrgonToken,
          test.myOrgonToken.Transfer,
          test.tx,
          {
            _from: '0x0000000000000000000000000000000000000000',
            _to: test.justPriceProtocolWrapper.address,
            _value: '16158536536585365'
          });

        assertEvents (
          "test.myOrisSpace.Start",
          test.myOrisSpace,
          test.myOrisSpace.Start,
          test.tx);

        assertEvents (
          "test.justPriceProtocolWrapper.Investment",
          test.justPriceProtocolWrapper,
          test.justPriceProtocolWrapper.Investment,
          test.tx,
          {
            investor: test.bob.address,
            value: web3.toWei ('12999.9999999999993', 'ether'),
            amount: '16158536536585365'
          });

        assertBalance (
          'test.justPriceProtocolWrapper',
          '13000.0015999999993',
          'ether',
          test.justPriceProtocolWrapper.address);

        assertBalance (
          'test.bob',
          '0.000000000001499999',
          'ether',
          test.bob.address);

        assertBNEquals (
          'test.justPriceProtocolWrapper.getStage (1524117600)',
          1, // RESERVE
          test.justPriceProtocolWrapper.getStage (1524117600));

        assertBNEquals (
          'test.justPriceProtocolWrapper.outstandingTokens (test.bob.address)',
          '16158538536585365',
          test.justPriceProtocolWrapper.outstandingTokens (test.bob.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.eligibleVotes (test.bob.address)',
          '16158538536585365',
          test.justPriceProtocolWrapper.eligibleVotes (test.bob.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.totalEligibleVotes ()',
          '16158538536585365',
          test.justPriceProtocolWrapper.totalEligibleVotes ());
      }},
    { name: "Bob buys tokens for 67000 ether",
      body: function (test) {
        assertBalance (
          'test.justPriceProtocolWrapper',
          '13000.0015999999993',
          'ether',
          test.justPriceProtocolWrapper.address);

        assertBalance (
          'test.bob',
          '0.000000000001499999',
          'ether',
          test.bob.address);

        assertBNEquals (
          'test.justPriceProtocolWrapper.getStage (1524117600)',
          1, // RESERVE
          test.justPriceProtocolWrapper.getStage (1524117600));

        assertBNEquals (
          'test.justPriceProtocolWrapper.outstandingTokens (test.bob.address)',
          '16158538536585365',
          test.justPriceProtocolWrapper.outstandingTokens (test.bob.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.eligibleVotes (test.bob.address)',
          '16158538536585365',
          test.justPriceProtocolWrapper.eligibleVotes (test.bob.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.totalEligibleVotes ()',
          '16158538536585365',
          test.justPriceProtocolWrapper.totalEligibleVotes ());

        personal.unlockAccount (test.alice, "");
        test.tx = test.bob.execute (
          test.justPriceProtocolWrapper.address,
          test.justPriceProtocolWrapper.buyTokens.getData (),
          web3.toWei ('67000', 'ether'),
          {
            from: test.alice,
            value: web3.toWei ('67000', 'ether'),
            gas:1000000
          });
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.bob.Result",
          test.bob,
          test.bob.Result,
          test.tx,
          { value: true });

        assertEvents (
          "test.myOrgonToken.Transfer",
          test.myOrgonToken,
          test.myOrgonToken.Transfer,
          test.tx,
          {
            _from: '0x0000000000000000000000000000000000000000',
            _to: test.justPriceProtocolWrapper.address,
            _value: '66722938186762816'
          });

        assertEvents (
          "test.myOrisSpace.Start",
          test.myOrisSpace,
          test.myOrisSpace.Start,
          test.tx,
          {
            initiator: test.justPriceProtocolWrapper.address,
            returnAmount: 0
          });

        assertEvents (
          "test.justPriceProtocolWrapper.Investment",
          test.justPriceProtocolWrapper,
          test.justPriceProtocolWrapper.Investment,
          test.tx,
          {
            investor: test.bob.address,
            value: web3.toWei ('59499.99839999999981', 'ether'),
            amount: '66722938186762816'
          });

        assertBalance (
          'test.justPriceProtocolWrapper',
          '72499.99999999999911',
          'ether',
          test.justPriceProtocolWrapper.address);

        assertBalance (
          'test.bob',
          '7500.001600000001689999',
          'ether',
          test.bob.address);

        assertBNEquals (
          'test.justPriceProtocolWrapper.getStage (1524117600)',
          2, // BEFORE_GROWTH
          test.justPriceProtocolWrapper.getStage (1524117600));

        assertBNEquals (
          'test.justPriceProtocolWrapper.outstandingTokens (test.bob.address)',
          '82881476723348181',
          test.justPriceProtocolWrapper.outstandingTokens (test.bob.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.eligibleVotes (test.bob.address)',
          '82881476723348181',
          test.justPriceProtocolWrapper.eligibleVotes (test.bob.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.totalEligibleVotes ()',
          '82881476723348181',
          test.justPriceProtocolWrapper.totalEligibleVotes ());
      }},
    { name: "Elly tries to sells 10 tokens but smart contract is not in LIFE stage",
      body: function (test) {
        assertBNEquals (
          'test.justPriceProtocolWrapper.getStage (1524117600)',
          2, // BEFORE_GROWTH
          test.justPriceProtocolWrapper.getStage (1524117600));

        assertBalance (
          'test.justPriceProtocolWrapper',
          '72499.99999999999911',
          'ether',
          test.justPriceProtocolWrapper.address);

        assertBalance (
          'test.elly',
          '0',
          'ether',
          test.elly.address);

        assertBNEquals (
          'test.justPriceProtocolWrapper.outstandingTokens (test.dave.address)',
          0,
          test.justPriceProtocolWrapper.outstandingTokens (test.dave.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.eligibleVotes (test.dave.address)',
          '0',
          test.justPriceProtocolWrapper.eligibleVotes (test.dave.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.totalEligibleVotes ()',
          '82881476723348181',
          test.justPriceProtocolWrapper.totalEligibleVotes ());

        personal.unlockAccount (test.alice, "");
        test.tx = test.elly.execute (
          test.justPriceProtocolWrapper.address,
          test.justPriceProtocolWrapper.sellTokens.getData ('10000000000'),
          0,
          {
            from: test.alice,
            gas:1000000
          });
      }},
    { name: "Make sure transaction failed",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.elly.Result",
          test.elly,
          test.elly.Result,
          test.tx,
          { value: false });

        assertEvents (
          "test.myOrgonToken.Transfer",
          test.myOrgonToken,
          test.myOrgonToken.Transfer,
          test.tx);

        assertBNEquals (
          'test.justPriceProtocolWrapper.getStage (1524117600)',
          2, // BEFORE_GROWTH
          test.justPriceProtocolWrapper.getStage (1524117600));

        assertBalance (
          'test.justPriceProtocolWrapper',
          '72499.99999999999911',
          'ether',
          test.justPriceProtocolWrapper.address);

        assertBalance (
          'test.elly',
          '0',
          'ether',
          test.elly.address);

        assertBNEquals (
          'test.justPriceProtocolWrapper.outstandingTokens (test.dave.address)',
          0,
          test.justPriceProtocolWrapper.outstandingTokens (test.dave.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.eligibleVotes (test.dave.address)',
          '0',
          test.justPriceProtocolWrapper.eligibleVotes (test.dave.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.totalEligibleVotes ()',
          '82881476723348181',
          test.justPriceProtocolWrapper.totalEligibleVotes ());
      }},
    { name: "Bob tries to buy tokens for 1 ether but smart contract is in BEFORE_GROWTH stage",
      body: function (test) {
        assertBalance (
          'test.justPriceProtocolWrapper',
          '72499.99999999999911',
          'ether',
          test.justPriceProtocolWrapper.address);

        assertBalance (
          'test.bob',
          '7500.001600000001689999',
          'ether',
          test.bob.address);

        assertBNEquals (
          'test.justPriceProtocolWrapper.getStage (1524117600)',
          2, // BEFORE_GROWTH
          test.justPriceProtocolWrapper.getStage (1524117600));

        assertBNEquals (
          'test.justPriceProtocolWrapper.outstandingTokens (test.bob.address)',
          '82881476723348181',
          test.justPriceProtocolWrapper.outstandingTokens (test.bob.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.eligibleVotes (test.bob.address)',
          '82881476723348181',
          test.justPriceProtocolWrapper.eligibleVotes (test.bob.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.totalEligibleVotes ()',
          '82881476723348181',
          test.justPriceProtocolWrapper.totalEligibleVotes ());

        personal.unlockAccount (test.alice, "");
        test.tx = test.bob.execute (
          test.justPriceProtocolWrapper.address,
          test.justPriceProtocolWrapper.buyTokens.getData (),
          web3.toWei ('1', 'ether'),
          {
            from: test.alice,
            value: web3.toWei ('1', 'ether'),
            gas:1000000
          });
      }},
    { name: "Make sure transaction failed",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.bob.Result",
          test.bob,
          test.bob.Result,
          test.tx,
          { value: false });

        assertEvents (
          "test.myOrgonToken.Transfer",
          test.myOrgonToken,
          test.myOrgonToken.Transfer,
          test.tx);

        assertEvents (
          "test.myOrisSpace.Start",
          test.myOrisSpace,
          test.myOrisSpace.Start,
          test.tx);

        assertEvents (
          "test.justPriceProtocolWrapper.Investment",
          test.justPriceProtocolWrapper,
          test.justPriceProtocolWrapper.Investment,
          test.tx);

        assertBalance (
          'test.justPriceProtocolWrapper',
          '72499.99999999999911',
          'ether',
          test.justPriceProtocolWrapper.address);

        assertBalance (
          'test.bob',
          '7500.001600000001689999',
          'ether',
          test.bob.address);

        assertBNEquals (
          'test.justPriceProtocolWrapper.getStage (1524117600)',
          2, // BEFORE_GROWTH
          test.justPriceProtocolWrapper.getStage (1524117600));

        assertBNEquals (
          'test.justPriceProtocolWrapper.outstandingTokens (test.bob.address)',
          '82881476723348181',
          test.justPriceProtocolWrapper.outstandingTokens (test.bob.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.eligibleVotes (test.bob.address)',
          '82881476723348181',
          test.justPriceProtocolWrapper.eligibleVotes (test.bob.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.totalEligibleVotes ()',
          '82881476723348181',
          test.justPriceProtocolWrapper.totalEligibleVotes ());
      }},
    { name: "Alice disables token transfers",
      body: function (test) {
        personal.unlockAccount (test.alice, "");
        test.tx = test.myOrgonToken.setTransfersEnabled (
          0,
          {from: test.alice, gas:1000000});
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();
      }},
    { name: "Carol tries to initiate token delivery to Bob but token transfers are disabled",
      body: function (test) {
        assertBNEquals (
          'test.justPriceProtocolWrapper.getStage (1524117600)',
          2, // BEFORE_GROWTH
          test.justPriceProtocolWrapper.getStage (1524117600));

        assertBNEquals (
          'test.justPriceProtocolWrapper.outstandingTokens (test.bob.address)',
          '82881476723348181',
          test.justPriceProtocolWrapper.outstandingTokens (test.bob.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.eligibleVotes (test.bob.address)',
          '82881476723348181',
          test.justPriceProtocolWrapper.eligibleVotes (test.bob.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.totalEligibleVotes ()',
          '82881476723348181',
          test.justPriceProtocolWrapper.totalEligibleVotes ());

        personal.unlockAccount (test.alice, "");
        test.tx = test.carol.execute (
          test.justPriceProtocolWrapper.address,
          test.justPriceProtocolWrapper.deliver.getData (
            [ test.bob.address ]),
          0,
          {
            from: test.alice,
            gas:1000000
          });
      }},
    { name: "Make sure transaction failed",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.carol.Result",
          test.carol,
          test.carol.Result,
          test.tx,
          { value: false });

        assertEvents (
          "test.myOrgonToken.Transfer",
          test.myOrgonToken,
          test.myOrgonToken.Transfer,
          test.tx);

        assertEvents (
          "test.justPriceProtocolWrapper.Delivery",
          test.justPriceProtocolWrapper,
          test.justPriceProtocolWrapper.Delivery,
          test.tx);

        assertBNEquals (
          'test.justPriceProtocolWrapper.getStage (1524117600)',
          2, // BEFORE_GROWTH
          test.justPriceProtocolWrapper.getStage (1524117600));

        assertBNEquals (
          'test.justPriceProtocolWrapper.outstandingTokens (test.bob.address)',
          '82881476723348181',
          test.justPriceProtocolWrapper.outstandingTokens (test.bob.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.eligibleVotes (test.bob.address)',
          '82881476723348181',
          test.justPriceProtocolWrapper.eligibleVotes (test.bob.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.totalEligibleVotes ()',
          '82881476723348181',
          test.justPriceProtocolWrapper.totalEligibleVotes ());
      }},
    { name: "Carol tries to initiate refund for Bob but it is not refund stage",
      body: function (test) {
        assertBNEquals (
          'test.justPriceProtocolWrapper.getStage (1524117600)',
          2, // BEFORE_GROWTH
          test.justPriceProtocolWrapper.getStage (1524117600));

        assertBalance (
          'test.bob',
          '7500.001600000001689999',
          'ether',
          test.bob.address);

        personal.unlockAccount (test.alice, "");
        test.tx = test.carol.execute (
          test.justPriceProtocolWrapper.address,
          test.justPriceProtocolWrapper.refund.getData (
            [ test.bob.address ]),
          0,
          {
            from: test.alice,
            gas:1000000
          });
      }},
    { name: "Make sure transaction failed",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.carol.Result",
          test.carol,
          test.carol.Result,
          test.tx,
          { value: false });

        assertEvents (
          "test.justPriceProtocolWrapper.Refund",
          test.justPriceProtocolWrapper,
          test.justPriceProtocolWrapper.Refund,
          test.tx);

        assertBNEquals (
          'test.justPriceProtocolWrapper.getStage (1524117600)',
          2, // BEFORE_GROWTH
          test.justPriceProtocolWrapper.getStage (1524117600));

        assertBalance (
          'test.bob',
          '7500.001600000001689999',
          'ether',
          test.bob.address);
      }},
    { name: "Carol tries to vote for Frank but it is not life stage",
      body: function (test) {
        assertBNEquals (
          'test.justPriceProtocolWrapper.getStage (1524117600)',
          2, // BEFORE_GROWTH
          test.justPriceProtocolWrapper.getStage (1524117600));

        assertBNEquals (
          'test.justPriceProtocolWrapper.votesFor (test.frank.address)',
          0,
          test.justPriceProtocolWrapper.votesFor (test.frank.address));

        personal.unlockAccount (test.alice, "");
        test.tx = test.carol.execute (
          test.justPriceProtocolWrapper.address,
          test.justPriceProtocolWrapper.vote.getData (test.frank.address),
          0,
          {
            from: test.alice,
            gas:1000000
          });
      }},
    { name: "Make sure transaction failed",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.carol.Result",
          test.carol,
          test.carol.Result,
          test.tx,
          { value: false });

        assertEvents (
          "test.justPriceProtocolWrapper.Vote",
          test.justPriceProtocolWrapper,
          test.justPriceProtocolWrapper.Vote,
          test.tx);

        assertEvents (
          "test.justPriceProtocolWrapper.VoteRevocation",
          test.justPriceProtocolWrapper,
          test.justPriceProtocolWrapper.VoteRevocation,
          test.tx);

        assertEvents (
          "test.justPriceProtocolWrapper.K1Change",
          test.justPriceProtocolWrapper,
          test.justPriceProtocolWrapper.K1Change,
          test.tx);

        assertBNEquals (
          'test.justPriceProtocolWrapper.getStage (1524117600)',
          2, // BEFORE_GROWTH
          test.justPriceProtocolWrapper.getStage (1524117600));

        assertBNEquals (
          'test.justPriceProtocolWrapper.votesFor (test.frank.address)',
          '0',
          test.justPriceProtocolWrapper.votesFor (test.frank.address));
      }},
    { name: "Alice enables token transfers",
      body: function (test) {
        personal.unlockAccount (test.alice, "");
        test.tx = test.myOrgonToken.setTransfersEnabled (
          1000,
          {from: test.alice, gas:1000000});
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();
      }},
    { name: "Carol initiates token delivery to Bob",
      body: function (test) {
        assertBNEquals (
          'test.justPriceProtocolWrapper.getStage (1524117600)',
          2, // BEFORE_GROWTH
          test.justPriceProtocolWrapper.getStage (1524117600));

        assertBNEquals (
          'test.justPriceProtocolWrapper.outstandingTokens (test.bob.address)',
          '82881476723348181',
          test.justPriceProtocolWrapper.outstandingTokens (test.bob.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.eligibleVotes (test.bob.address)',
          '82881476723348181',
          test.justPriceProtocolWrapper.eligibleVotes (test.bob.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.totalEligibleVotes ()',
          '82881476723348181',
          test.justPriceProtocolWrapper.totalEligibleVotes ());

        personal.unlockAccount (test.alice, "");
        test.tx = test.carol.execute (
          test.justPriceProtocolWrapper.address,
          test.justPriceProtocolWrapper.deliver.getData (
            [ test.bob.address ]),
          0,
          {
            from: test.alice,
            gas:1000000
          });
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.carol.Result",
          test.carol,
          test.carol.Result,
          test.tx,
          { value: true });

        assertEvents (
          "test.myOrgonToken.Transfer",
          test.myOrgonToken,
          test.myOrgonToken.Transfer,
          test.tx,
          {
            _from: test.justPriceProtocolWrapper.address,
            _to: test.bob.address,
            _value: '82881476723348181'
          });

        assertEvents (
          "test.justPriceProtocolWrapper.Delivery",
          test.justPriceProtocolWrapper,
          test.justPriceProtocolWrapper.Delivery,
          test.tx,
          {
            investor: test.bob.address,
            amount: '82881476723348181'
          });

        assertBNEquals (
          'test.justPriceProtocolWrapper.getStage (1524117600)',
          3, // GROWTH
          test.justPriceProtocolWrapper.getStage (1524117600));

        assertBNEquals (
          'test.justPriceProtocolWrapper.outstandingTokens (test.bob.address)',
          '0',
          test.justPriceProtocolWrapper.outstandingTokens (test.bob.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.eligibleVotes (test.bob.address)',
          '82881476723348181',
          test.justPriceProtocolWrapper.eligibleVotes (test.bob.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.totalEligibleVotes ()',
          '82881476723348181',
          test.justPriceProtocolWrapper.totalEligibleVotes ());
      }},
    { name: "Carol initiates token delivery to Bob",
      body: function (test) {
        assertBNEquals (
          'test.justPriceProtocolWrapper.getStage (1524117600)',
          3, // GROWTH
          test.justPriceProtocolWrapper.getStage (1524117600));

        assertBNEquals (
          'test.justPriceProtocolWrapper.outstandingTokens (test.bob.address)',
          '0',
          test.justPriceProtocolWrapper.outstandingTokens (test.bob.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.eligibleVotes (test.bob.address)',
          '82881476723348181',
          test.justPriceProtocolWrapper.eligibleVotes (test.bob.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.totalEligibleVotes ()',
          '82881476723348181',
          test.justPriceProtocolWrapper.totalEligibleVotes ());

        personal.unlockAccount (test.alice, "");
        test.tx = test.carol.execute (
          test.justPriceProtocolWrapper.address,
          test.justPriceProtocolWrapper.deliver.getData (
            [ test.bob.address ]),
          0,
          {
            from: test.alice,
            gas:1000000
          });
      }},
    { name: "Make sure transaction succeeded but no tokens were delivered",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.carol.Result",
          test.carol,
          test.carol.Result,
          test.tx,
          { value: true });

        assertEvents (
          "test.myOrgonToken.Transfer",
          test.myOrgonToken,
          test.myOrgonToken.Transfer,
          test.tx);

        assertEvents (
          "test.justPriceProtocolWrapper.Delivery",
          test.justPriceProtocolWrapper,
          test.justPriceProtocolWrapper.Delivery,
          test.tx);

        assertBNEquals (
          'test.justPriceProtocolWrapper.getStage (1524117600)',
          3, // GROWTH
          test.justPriceProtocolWrapper.getStage (1524117600));

        assertBNEquals (
          'test.justPriceProtocolWrapper.outstandingTokens (test.bob.address)',
          '0',
          test.justPriceProtocolWrapper.outstandingTokens (test.bob.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.eligibleVotes (test.bob.address)',
          '82881476723348181',
          test.justPriceProtocolWrapper.eligibleVotes (test.bob.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.totalEligibleVotes ()',
          '82881476723348181',
          test.justPriceProtocolWrapper.totalEligibleVotes ());
      }},
    { name: "Carol tries to initiate refund for Bob but it is not refund stage",
      body: function (test) {
        assertBNEquals (
          'test.justPriceProtocolWrapper.getStage (1524117600)',
          3, // GROWTH
          test.justPriceProtocolWrapper.getStage (1524117600));

        assertBalance (
          'test.bob',
          '7500.001600000001689999',
          'ether',
          test.bob.address);

        personal.unlockAccount (test.alice, "");
        test.tx = test.carol.execute (
          test.justPriceProtocolWrapper.address,
          test.justPriceProtocolWrapper.refund.getData (
            [ test.bob.address ]),
          0,
          {
            from: test.alice,
            gas:1000000
          });
      }},
    { name: "Make sure transaction failed",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.carol.Result",
          test.carol,
          test.carol.Result,
          test.tx,
          { value: false });

        assertEvents (
          "test.justPriceProtocolWrapper.Refund",
          test.justPriceProtocolWrapper,
          test.justPriceProtocolWrapper.Refund,
          test.tx);

        assertBNEquals (
          'test.justPriceProtocolWrapper.getStage (1524117600)',
          3, // GROWTH
          test.justPriceProtocolWrapper.getStage (1524117600));

        assertBalance (
          'test.bob',
          '7500.001600000001689999',
          'ether',
          test.bob.address);
      }},
    { name: "Carol tries to vote for Frank but it is not life stage",
      body: function (test) {
        assertBNEquals (
          'test.justPriceProtocolWrapper.getStage (1524117600)',
          3, // GROWTH
          test.justPriceProtocolWrapper.getStage (1524117600));

        assertBNEquals (
          'test.justPriceProtocolWrapper.votesFor (test.frank.address)',
          0,
          test.justPriceProtocolWrapper.votesFor (test.frank.address));

        personal.unlockAccount (test.alice, "");
        test.tx = test.carol.execute (
          test.justPriceProtocolWrapper.address,
          test.justPriceProtocolWrapper.vote.getData (test.frank.address),
          0,
          {
            from: test.alice,
            gas:1000000
          });
      }},
    { name: "Make sure transaction failed",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.carol.Result",
          test.carol,
          test.carol.Result,
          test.tx,
          { value: false });

        assertEvents (
          "test.justPriceProtocolWrapper.Vote",
          test.justPriceProtocolWrapper,
          test.justPriceProtocolWrapper.Vote,
          test.tx);

        assertEvents (
          "test.justPriceProtocolWrapper.VoteRevocation",
          test.justPriceProtocolWrapper,
          test.justPriceProtocolWrapper.VoteRevocation,
          test.tx);

        assertEvents (
          "test.justPriceProtocolWrapper.K1Change",
          test.justPriceProtocolWrapper,
          test.justPriceProtocolWrapper.K1Change,
          test.tx);

        assertBNEquals (
          'test.justPriceProtocolWrapper.getStage (1524117600)',
          3, // GROWTH
          test.justPriceProtocolWrapper.getStage (1524117600));

        assertBNEquals (
          'test.justPriceProtocolWrapper.votesFor (test.frank.address)',
          '0',
          test.justPriceProtocolWrapper.votesFor (test.frank.address));
      }},
    { name: "Elly tries to sells 10 tokens but smart contract is not in LIFE stage",
      body: function (test) {
        assertBNEquals (
          'test.justPriceProtocolWrapper.getStage (1524117600)',
          3, // GROWTH
          test.justPriceProtocolWrapper.getStage (1524117600));

        assertBalance (
          'test.justPriceProtocolWrapper',
          '72499.99999999999911',
          'ether',
          test.justPriceProtocolWrapper.address);

        assertBalance (
          'test.elly',
          '0',
          'ether',
          test.elly.address);

        assertBNEquals (
          'test.justPriceProtocolWrapper.outstandingTokens (test.dave.address)',
          0,
          test.justPriceProtocolWrapper.outstandingTokens (test.dave.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.eligibleVotes (test.dave.address)',
          '0',
          test.justPriceProtocolWrapper.eligibleVotes (test.dave.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.totalEligibleVotes ()',
          '82881476723348181',
          test.justPriceProtocolWrapper.totalEligibleVotes ());

        personal.unlockAccount (test.alice, "");
        test.tx = test.elly.execute (
          test.justPriceProtocolWrapper.address,
          test.justPriceProtocolWrapper.sellTokens.getData ('10000000000'),
          0,
          {
            from: test.alice,
            gas:1000000
          });
      }},
    { name: "Make sure transaction failed",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.elly.Result",
          test.elly,
          test.elly.Result,
          test.tx,
          { value: false });

        assertEvents (
          "test.myOrgonToken.Transfer",
          test.myOrgonToken,
          test.myOrgonToken.Transfer,
          test.tx);

        assertBNEquals (
          'test.justPriceProtocolWrapper.getStage (1524117600)',
          3, // GROWTH
          test.justPriceProtocolWrapper.getStage (1524117600));

        assertBalance (
          'test.justPriceProtocolWrapper',
          '72499.99999999999911',
          'ether',
          test.justPriceProtocolWrapper.address);

        assertBalance (
          'test.elly',
          '0',
          'ether',
          test.elly.address);

        assertBNEquals (
          'test.justPriceProtocolWrapper.outstandingTokens (test.dave.address)',
          0,
          test.justPriceProtocolWrapper.outstandingTokens (test.dave.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.eligibleVotes (test.dave.address)',
          '0',
          test.justPriceProtocolWrapper.eligibleVotes (test.dave.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.totalEligibleVotes ()',
          '82881476723348181',
          test.justPriceProtocolWrapper.totalEligibleVotes ());
      }},
    { name: "Alice sets total supply or Orgon tokens to 340282366920938463463374607431.768211455",
      body: function (test) {
        personal.unlockAccount (test.alice, "");
        test.tx = test.myOrgonToken.setTotalSupply (
          '340282366920938463463374607431768211455',
          {from: test.alice, gas:1000000});
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();
      }},
    { name: "Carol tries to buy tokens for 1 ether but this would make total number of tokens in circulation to exceed limit",
      body: function (test) {
        assertBNEquals (
          'test.justPriceProtocolWrapper.getStage (1524117600)',
          3, // GROWTH
          test.justPriceProtocolWrapper.getStage (1524117600));

        assertBalance (
          'test.justPriceProtocolWrapper',
          '72499.99999999999911',
          'ether',
          test.justPriceProtocolWrapper.address);

        assertBNEquals (
          'test.justPriceProtocolWrapper.outstandingTokens (test.carol.address)',
          0,
          test.justPriceProtocolWrapper.outstandingTokens (test.carol.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.eligibleVotes (test.carol.address)',
          '0',
          test.justPriceProtocolWrapper.eligibleVotes (test.carol.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.totalEligibleVotes ()',
          '82881476723348181',
          test.justPriceProtocolWrapper.totalEligibleVotes ());

        personal.unlockAccount (test.alice, "");
        test.tx = test.carol.execute (
          test.justPriceProtocolWrapper.address,
          test.justPriceProtocolWrapper.buyTokens.getData (),
          web3.toWei ('1', 'ether'),
          {
            from: test.alice,
            value: web3.toWei ('1', 'ether'),
            gas:1000000
          });
      }},
    { name: "Make sure transaction failed",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.carol.Result",
          test.carol,
          test.carol.Result,
          test.tx,
          { value: false });

        assertEvents (
          "test.myOrgonToken.Transfer",
          test.myOrgonToken,
          test.myOrgonToken.Transfer,
          test.tx);

        assertBNEquals (
          'test.justPriceProtocolWrapper.getStage (1524117600)',
          3, // GROWTH
          test.justPriceProtocolWrapper.getStage (1524117600));

        assertBalance (
          'test.justPriceProtocolWrapper',
          '72499.99999999999911',
          'ether',
          test.justPriceProtocolWrapper.address);

        assertBNEquals (
          'test.justPriceProtocolWrapper.outstandingTokens (test.carol.address)',
          0,
          test.justPriceProtocolWrapper.outstandingTokens (test.carol.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.eligibleVotes (test.carol.address)',
          '0',
          test.justPriceProtocolWrapper.eligibleVotes (test.carol.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.totalEligibleVotes ()',
          '82881476723348181',
          test.justPriceProtocolWrapper.totalEligibleVotes ());
      }},
    { name: "Alice sets total supply or Orgon tokens to 725000000",
      body: function (test) {
        personal.unlockAccount (test.alice, "");
        test.tx = test.myOrgonToken.setTotalSupply (
          '725000000000000000',
          {from: test.alice, gas:1000000});
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();
      }},
    { name: "Carol tries to buy tokens for 340282366920938463463.374607431768211456 ether but this is greater than maximum purchase ether amount",
      body: function (test) {
        assertBNEquals (
          'test.justPriceProtocolWrapper.getStage (1524117600)',
          3, // GROWTH
          test.justPriceProtocolWrapper.getStage (1524117600));

        assertBalance (
          'test.justPriceProtocolWrapper',
          '72499.99999999999911',
          'ether',
          test.justPriceProtocolWrapper.address);

        assertBNEquals (
          'test.justPriceProtocolWrapper.outstandingTokens (test.carol.address)',
          0,
          test.justPriceProtocolWrapper.outstandingTokens (test.carol.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.eligibleVotes (test.carol.address)',
          '0',
          test.justPriceProtocolWrapper.eligibleVotes (test.carol.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.totalEligibleVotes ()',
          '82881476723348181',
          test.justPriceProtocolWrapper.totalEligibleVotes ());

        personal.unlockAccount (test.alice, "");
        test.tx = test.carol.execute (
          test.justPriceProtocolWrapper.address,
          test.justPriceProtocolWrapper.buyTokens.getData (),
          web3.toWei ('340282366920938463463.374607431768211456', 'ether'),
          {
            from: test.alice,
            value: web3.toWei ('340282366920938463463.374607431768211456', 'ether'),
            gas:1000000
          });
      }},
    { name: "Make sure transaction failed",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.carol.Result",
          test.carol,
          test.carol.Result,
          test.tx,
          { value: false });

        assertEvents (
          "test.myOrgonToken.Transfer",
          test.myOrgonToken,
          test.myOrgonToken.Transfer,
          test.tx);

        assertBNEquals (
          'test.justPriceProtocolWrapper.getStage (1524117600)',
          3, // GROWTH
          test.justPriceProtocolWrapper.getStage (1524117600));

        assertBalance (
          'test.justPriceProtocolWrapper',
          '72499.99999999999911',
          'ether',
          test.justPriceProtocolWrapper.address);

        assertBNEquals (
          'test.justPriceProtocolWrapper.outstandingTokens (test.carol.address)',
          0,
          test.justPriceProtocolWrapper.outstandingTokens (test.carol.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.eligibleVotes (test.carol.address)',
          '0',
          test.justPriceProtocolWrapper.eligibleVotes (test.carol.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.totalEligibleVotes ()',
          '82881476723348181',
          test.justPriceProtocolWrapper.totalEligibleVotes ());
      }},
    { name: "Carol tries to buy tokens for 340282366920938390963.374607431769101456 ether but this would make reserve to exceed limit",
      body: function (test) {
        assertBNEquals (
          'test.justPriceProtocolWrapper.getStage (1524117600)',
          3, // GROWTH
          test.justPriceProtocolWrapper.getStage (1524117600));

        assertBalance (
          'test.justPriceProtocolWrapper',
          '72499.99999999999911',
          'ether',
          test.justPriceProtocolWrapper.address);

        assertBNEquals (
          'test.justPriceProtocolWrapper.outstandingTokens (test.carol.address)',
          0,
          test.justPriceProtocolWrapper.outstandingTokens (test.carol.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.eligibleVotes (test.carol.address)',
          '0',
          test.justPriceProtocolWrapper.eligibleVotes (test.carol.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.totalEligibleVotes ()',
          '82881476723348181',
          test.justPriceProtocolWrapper.totalEligibleVotes ());

        personal.unlockAccount (test.alice, "");
        test.tx = test.carol.execute (
          test.justPriceProtocolWrapper.address,
          test.justPriceProtocolWrapper.buyTokens.getData (),
          web3.toWei ('340282366920938390963.374607431769101456', 'ether'),
          {
            from: test.alice,
            value: web3.toWei ('340282366920938390963.374607431769101456', 'ether'),
            gas:1000000
          });
      }},
    { name: "Make sure transaction failed",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.carol.Result",
          test.carol,
          test.carol.Result,
          test.tx,
          { value: false });

        assertEvents (
          "test.myOrgonToken.Transfer",
          test.myOrgonToken,
          test.myOrgonToken.Transfer,
          test.tx);

        assertBNEquals (
          'test.justPriceProtocolWrapper.getStage (1524117600)',
          3, // GROWTH
          test.justPriceProtocolWrapper.getStage (1524117600));

        assertBalance (
          'test.justPriceProtocolWrapper',
          '72499.99999999999911',
          'ether',
          test.justPriceProtocolWrapper.address);

        assertBNEquals (
          'test.justPriceProtocolWrapper.outstandingTokens (test.carol.address)',
          0,
          test.justPriceProtocolWrapper.outstandingTokens (test.carol.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.eligibleVotes (test.carol.address)',
          '0',
          test.justPriceProtocolWrapper.eligibleVotes (test.carol.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.totalEligibleVotes ()',
          '82881476723348181',
          test.justPriceProtocolWrapper.totalEligibleVotes ());
      }},
    { name: "Alice disables token transfers",
      body: function (test) {
        personal.unlockAccount (test.alice, "");
        test.tx = test.myOrgonToken.setTransfersEnabled (
          0,
          {from: test.alice, gas:1000000});
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();
      }},
    { name: "Alice disables token creation",
      body: function (test) {
        personal.unlockAccount (test.alice, "");
        test.tx = test.myOrgonToken.setCreationEnabled (
          false,
          {from: test.alice, gas:1000000});
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();
      }},
    { name: "Carol buys tokens for 1 Wei",
      body: function (test) {
        assertBNEquals (
          'test.justPriceProtocolWrapper.getStage (1524117600)',
          3, // GROWTH
          test.justPriceProtocolWrapper.getStage (1524117600));

        assertBalance (
          'test.justPriceProtocolWrapper',
          '72499.99999999999911',
          'ether',
          test.justPriceProtocolWrapper.address);

        assertBNEquals (
          'test.justPriceProtocolWrapper.outstandingTokens (test.carol.address)',
          0,
          test.justPriceProtocolWrapper.outstandingTokens (test.carol.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.eligibleVotes (test.carol.address)',
          '0',
          test.justPriceProtocolWrapper.eligibleVotes (test.carol.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.totalEligibleVotes ()',
          '82881476723348181',
          test.justPriceProtocolWrapper.totalEligibleVotes ());

        personal.unlockAccount (test.alice, "");
        test.tx = test.carol.execute (
          test.justPriceProtocolWrapper.address,
          test.justPriceProtocolWrapper.buyTokens.getData (),
          web3.toWei ('1', 'Wei'),
          {
            from: test.alice,
            value: web3.toWei ('1', 'Wei'),
            gas:1000000
          });
      }},
    { name: "Make sure transaction succeeded but not tokens were sold",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.carol.Result",
          test.carol,
          test.carol.Result,
          test.tx,
          { value: true });

        assertEvents (
          "test.myOrgonToken.Transfer",
          test.myOrgonToken,
          test.myOrgonToken.Transfer,
          test.tx);

        assertBNEquals (
          'test.justPriceProtocolWrapper.getStage (1524117600)',
          3, // GROWTH
          test.justPriceProtocolWrapper.getStage (1524117600));

        assertBalance (
          'test.justPriceProtocolWrapper',
          '72499.999999999999110001',
          'ether',
          test.justPriceProtocolWrapper.address);

        assertBNEquals (
          'test.justPriceProtocolWrapper.outstandingTokens (test.carol.address)',
          0,
          test.justPriceProtocolWrapper.outstandingTokens (test.carol.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.eligibleVotes (test.carol.address)',
          '0',
          test.justPriceProtocolWrapper.eligibleVotes (test.carol.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.totalEligibleVotes ()',
          '82881476723348181',
          test.justPriceProtocolWrapper.totalEligibleVotes ());
      }},
    { name: "Alice enables token transfers",
      body: function (test) {
        personal.unlockAccount (test.alice, "");
        test.tx = test.myOrgonToken.setTransfersEnabled (
          1000,
          {from: test.alice, gas:1000000});
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();
      }},
    { name: "Carol tries to buy tokens for 1 ether but token creation is disabled",
      body: function (test) {
        assertBNEquals (
          'test.justPriceProtocolWrapper.getStage (1524117600)',
          3, // GROWTH
          test.justPriceProtocolWrapper.getStage (1524117600));

        assertBalance (
          'test.justPriceProtocolWrapper',
          '72499.999999999999110001',
          'ether',
          test.justPriceProtocolWrapper.address);

        assertBNEquals (
          'test.justPriceProtocolWrapper.outstandingTokens (test.carol.address)',
          0,
          test.justPriceProtocolWrapper.outstandingTokens (test.carol.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.eligibleVotes (test.carol.address)',
          '0',
          test.justPriceProtocolWrapper.eligibleVotes (test.carol.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.totalEligibleVotes ()',
          '82881476723348181',
          test.justPriceProtocolWrapper.totalEligibleVotes ());

        personal.unlockAccount (test.alice, "");
        test.tx = test.carol.execute (
          test.justPriceProtocolWrapper.address,
          test.justPriceProtocolWrapper.buyTokens.getData (),
          web3.toWei ('1', 'ether'),
          {
            from: test.alice,
            value: web3.toWei ('1', 'ether'),
            gas:1000000
          });
      }},
    { name: "Make sure transaction failed",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.carol.Result",
          test.carol,
          test.carol.Result,
          test.tx,
          { value: false });

        assertEvents (
          "test.myOrgonToken.Transfer",
          test.myOrgonToken,
          test.myOrgonToken.Transfer,
          test.tx);

        assertBNEquals (
          'test.justPriceProtocolWrapper.getStage (1524117600)',
          3, // GROWTH
          test.justPriceProtocolWrapper.getStage (1524117600));

        assertBalance (
          'test.justPriceProtocolWrapper',
          '72499.999999999999110001',
          'ether',
          test.justPriceProtocolWrapper.address);

        assertBNEquals (
          'test.justPriceProtocolWrapper.outstandingTokens (test.carol.address)',
          0,
          test.justPriceProtocolWrapper.outstandingTokens (test.carol.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.eligibleVotes (test.carol.address)',
          '0',
          test.justPriceProtocolWrapper.eligibleVotes (test.carol.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.totalEligibleVotes ()',
          '82881476723348181',
          test.justPriceProtocolWrapper.totalEligibleVotes ());
      }},
    { name: "Alice enables token creation",
      body: function (test) {
        personal.unlockAccount (test.alice, "");
        test.tx = test.myOrgonToken.setCreationEnabled (
          true,
          {from: test.alice, gas:1000000});
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();
      }},
    { name: "Alice disables token transfers",
      body: function (test) {
        personal.unlockAccount (test.alice, "");
        test.tx = test.myOrgonToken.setTransfersEnabled (
          0,
          {from: test.alice, gas:1000000});
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();
      }},
    { name: "Carol tries to buy tokens for 1 ether but token transfers are disabled",
      body: function (test) {
        assertBNEquals (
          'test.justPriceProtocolWrapper.getStage (1524117600)',
          3, // GROWTH
          test.justPriceProtocolWrapper.getStage (1524117600));

        assertBalance (
          'test.justPriceProtocolWrapper',
          '72499.999999999999110001',
          'ether',
          test.justPriceProtocolWrapper.address);

        assertBNEquals (
          'test.justPriceProtocolWrapper.outstandingTokens (test.carol.address)',
          0,
          test.justPriceProtocolWrapper.outstandingTokens (test.carol.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.eligibleVotes (test.carol.address)',
          '0',
          test.justPriceProtocolWrapper.eligibleVotes (test.carol.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.totalEligibleVotes ()',
          '82881476723348181',
          test.justPriceProtocolWrapper.totalEligibleVotes ());

        personal.unlockAccount (test.alice, "");
        test.tx = test.carol.execute (
          test.justPriceProtocolWrapper.address,
          test.justPriceProtocolWrapper.buyTokens.getData (),
          web3.toWei ('1', 'ether'),
          {
            from: test.alice,
            value: web3.toWei ('1', 'ether'),
            gas:1000000
          });
      }},
    { name: "Make sure transaction failed",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.carol.Result",
          test.carol,
          test.carol.Result,
          test.tx,
          { value: false });

        assertEvents (
          "test.myOrgonToken.Transfer",
          test.myOrgonToken,
          test.myOrgonToken.Transfer,
          test.tx);

        assertBNEquals (
          'test.justPriceProtocolWrapper.getStage (1524117600)',
          3, // GROWTH
          test.justPriceProtocolWrapper.getStage (1524117600));

        assertBalance (
          'test.justPriceProtocolWrapper',
          '72499.999999999999110001',
          'ether',
          test.justPriceProtocolWrapper.address);

        assertBNEquals (
          'test.justPriceProtocolWrapper.outstandingTokens (test.carol.address)',
          0,
          test.justPriceProtocolWrapper.outstandingTokens (test.carol.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.eligibleVotes (test.carol.address)',
          '0',
          test.justPriceProtocolWrapper.eligibleVotes (test.carol.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.totalEligibleVotes ()',
          '82881476723348181',
          test.justPriceProtocolWrapper.totalEligibleVotes ());
      }},
    { name: "Alice enables one token transfer",
      body: function (test) {
        personal.unlockAccount (test.alice, "");
        test.tx = test.myOrgonToken.setTransfersEnabled (
          1,
          {from: test.alice, gas:1000000});
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();
      }},
    { name: "Carol buys tokens for 0.0000000001 ether",
      body: function (test) {
        assertBNEquals (
          'test.justPriceProtocolWrapper.getStage (1524117600)',
          3, // GROWTH
          test.justPriceProtocolWrapper.getStage (1524117600));

        assertBalance (
          'test.justPriceProtocolWrapper',
          '72499.999999999999110001',
          'ether',
          test.justPriceProtocolWrapper.address);

        assertBNEquals (
          'test.justPriceProtocolWrapper.outstandingTokens (test.carol.address)',
          0,
          test.justPriceProtocolWrapper.outstandingTokens (test.carol.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.eligibleVotes (test.carol.address)',
          '0',
          test.justPriceProtocolWrapper.eligibleVotes (test.carol.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.totalEligibleVotes ()',
          '82881476723348181',
          test.justPriceProtocolWrapper.totalEligibleVotes ());

        personal.unlockAccount (test.alice, "");
        test.tx = test.carol.execute (
          test.justPriceProtocolWrapper.address,
          test.justPriceProtocolWrapper.buyTokens.getData (),
          web3.toWei ('0.0000000001', 'ether'),
          {
            from: test.alice,
            value: web3.toWei ('0.0000000001', 'ether'),
            gas:1000000
          });
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.carol.Result",
          test.carol,
          test.carol.Result,
          test.tx,
          { value: true });

        assertEvents (
          "test.myOrgonToken.Transfer",
          test.myOrgonToken,
          test.myOrgonToken.Transfer,
          test.tx,
          {
            _from: '0x0000000000000000000000000000000000000000',
            _to: test.justPriceProtocolWrapper.address,
            _value: '99'
          },
          {
            _from: test.justPriceProtocolWrapper.address,
            _to: test.carol.address,
            _value: '99'
          });

        assertBNEquals (
          'test.justPriceProtocolWrapper.getStage (1524117600)',
          3, // GROWTH
          test.justPriceProtocolWrapper.getStage (1524117600));

        assertBalance (
          'test.justPriceProtocolWrapper',
          '72500.000000000099110001',
          'ether',
          test.justPriceProtocolWrapper.address);

        assertBNEquals (
          'test.justPriceProtocolWrapper.outstandingTokens (test.carol.address)',
          0,
          test.justPriceProtocolWrapper.outstandingTokens (test.carol.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.eligibleVotes (test.carol.address)',
          '99',
          test.justPriceProtocolWrapper.eligibleVotes (test.carol.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.totalEligibleVotes ()',
          '82881476723348280',
          test.justPriceProtocolWrapper.totalEligibleVotes ());
      }},
    { name: "Alice enables one token transfer",
      body: function (test) {
        personal.unlockAccount (test.alice, "");
        test.tx = test.myOrgonToken.setTransfersEnabled (
          1,
          {from: test.alice, gas:1000000});
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();
      }},
    { name: "Carol tries to buy tokens for 1 ether but fee transfer is not enabled",
      body: function (test) {
        assertBNEquals (
          'test.justPriceProtocolWrapper.getStage (1524117600)',
          3, // GROWTH
          test.justPriceProtocolWrapper.getStage (1524117600));

        assertBalance (
          'test.justPriceProtocolWrapper',
          '72500.000000000099110001',
          'ether',
          test.justPriceProtocolWrapper.address);

        assertBNEquals (
          'test.justPriceProtocolWrapper.outstandingTokens (test.carol.address)',
          0,
          test.justPriceProtocolWrapper.outstandingTokens (test.carol.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.eligibleVotes (test.carol.address)',
          '99',
          test.justPriceProtocolWrapper.eligibleVotes (test.carol.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.totalEligibleVotes ()',
          '82881476723348280',
          test.justPriceProtocolWrapper.totalEligibleVotes ());

        personal.unlockAccount (test.alice, "");
        test.tx = test.carol.execute (
          test.justPriceProtocolWrapper.address,
          test.justPriceProtocolWrapper.buyTokens.getData (),
          web3.toWei ('1', 'ether'),
          {
            from: test.alice,
            value: web3.toWei ('1', 'ether'),
            gas:1000000
          });
      }},
    { name: "Make sure transaction failed",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.carol.Result",
          test.carol,
          test.carol.Result,
          test.tx,
          { value: false });

        assertEvents (
          "test.myOrgonToken.Transfer",
          test.myOrgonToken,
          test.myOrgonToken.Transfer,
          test.tx);

        assertBNEquals (
          'test.justPriceProtocolWrapper.getStage (1524117600)',
          3, // GROWTH
          test.justPriceProtocolWrapper.getStage (1524117600));

        assertBalance (
          'test.justPriceProtocolWrapper',
          '72500.000000000099110001',
          'ether',
          test.justPriceProtocolWrapper.address);

        assertBNEquals (
          'test.justPriceProtocolWrapper.outstandingTokens (test.carol.address)',
          0,
          test.justPriceProtocolWrapper.outstandingTokens (test.carol.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.eligibleVotes (test.carol.address)',
          '99',
          test.justPriceProtocolWrapper.eligibleVotes (test.carol.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.totalEligibleVotes ()',
          '82881476723348280',
          test.justPriceProtocolWrapper.totalEligibleVotes ());
      }},
    { name: "Alice enables token transfers",
      body: function (test) {
        personal.unlockAccount (test.alice, "");
        test.tx = test.myOrgonToken.setTransfersEnabled (
          1000,
          {from: test.alice, gas:1000000});
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();
      }},
    { name: "Carol buys tokens for 1 ether",
      body: function (test) {
        assertBNEquals (
          'test.justPriceProtocolWrapper.getStage (1524117600)',
          3, // GROWTH
          test.justPriceProtocolWrapper.getStage (1524117600));

        assertBalance (
          'test.justPriceProtocolWrapper',
          '72500.000000000099110001',
          'ether',
          test.justPriceProtocolWrapper.address);

        assertBNEquals (
          'test.justPriceProtocolWrapper.outstandingTokens (test.carol.address)',
          0,
          test.justPriceProtocolWrapper.outstandingTokens (test.carol.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.eligibleVotes (test.carol.address)',
          '99',
          test.justPriceProtocolWrapper.eligibleVotes (test.carol.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.totalEligibleVotes ()',
          '82881476723348280',
          test.justPriceProtocolWrapper.totalEligibleVotes ());

        personal.unlockAccount (test.alice, "");
        test.tx = test.carol.execute (
          test.justPriceProtocolWrapper.address,
          test.justPriceProtocolWrapper.buyTokens.getData (),
          web3.toWei ('1', 'ether'),
          {
            from: test.alice,
            value: web3.toWei ('1', 'ether'),
            gas:1000000
          });
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.carol.Result",
          test.carol,
          test.carol.Result,
          test.tx,
          { value: true });

        assertEvents (
          "test.myOrgonToken.Transfer",
          test.myOrgonToken,
          test.myOrgonToken.Transfer,
          test.tx,
          {
            _from: '0x0000000000000000000000000000000000000000',
            _to: test.justPriceProtocolWrapper.address,
            _value: '999993793157'
          },
          {
            _from: test.justPriceProtocolWrapper.address,
            _to: test.carol.address,
            _value: '999893793778'
          },
          {
            _from: test.justPriceProtocolWrapper.address,
            _to: test.bob.address,
            _value: '99999379'
          });

        assertBNEquals (
          'test.justPriceProtocolWrapper.getStage (1524117600)',
          3, // GROWTH
          test.justPriceProtocolWrapper.getStage (1524117600));

        assertBalance (
          'test.justPriceProtocolWrapper',
          '72501.000000000099110001',
          'ether',
          test.justPriceProtocolWrapper.address);

        assertBNEquals (
          'test.justPriceProtocolWrapper.outstandingTokens (test.carol.address)',
          0,
          test.justPriceProtocolWrapper.outstandingTokens (test.carol.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.eligibleVotes (test.carol.address)',
          '999993793256',
          test.justPriceProtocolWrapper.eligibleVotes (test.carol.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.totalEligibleVotes ()',
          '82882476717141437',
          test.justPriceProtocolWrapper.totalEligibleVotes ());
      }},
    { name: "Dave buys tokens for 200000000 ether",
      body: function (test) {
        assertBNEquals (
          'test.justPriceProtocolWrapper.getStage (1524117600)',
          3, // GROWTH
          test.justPriceProtocolWrapper.getStage (1524117600));

        assertBalance (
          'test.justPriceProtocolWrapper',
          '72501.000000000099110001',
          'ether',
          test.justPriceProtocolWrapper.address);

        assertBNEquals (
          'test.justPriceProtocolWrapper.outstandingTokens (test.dave.address)',
          0,
          test.justPriceProtocolWrapper.outstandingTokens (test.dave.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.eligibleVotes (test.dave.address)',
          '0',
          test.justPriceProtocolWrapper.eligibleVotes (test.dave.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.totalEligibleVotes ()',
          '82882476717141437',
          test.justPriceProtocolWrapper.totalEligibleVotes ());

        personal.unlockAccount (test.alice, "");
        test.tx = test.dave.execute (
          test.justPriceProtocolWrapper.address,
          test.justPriceProtocolWrapper.buyTokens.getData (),
          web3.toWei ('200000000', 'ether'),
          {
            from: test.alice,
            value: web3.toWei ('200000000', 'ether'),
            gas:1000000
          });
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.dave.Result",
          test.dave,
          test.dave.Result,
          test.tx,
          { value: true });

        assertEvents (
          "test.myOrgonToken.Transfer",
          test.myOrgonToken,
          test.myOrgonToken.Transfer,
          test.tx,
          {
            _from: '0x0000000000000000000000000000000000000000',
            _to: test.justPriceProtocolWrapper.address,
            _value: '876115547691919713'
          },
          {
            _from: test.justPriceProtocolWrapper.address,
            _to: test.dave.address,
            _value: '876027936137150522'
          },
          {
            _from: test.justPriceProtocolWrapper.address,
            _to: test.bob.address,
            _value: '87611554769191'
          });

        assertBNEquals (
          'test.justPriceProtocolWrapper.getStage (1524117600)',
          4, // LIFE
          test.justPriceProtocolWrapper.getStage (1524117600));

        assertBalance (
          'test.justPriceProtocolWrapper',
          '200072501.000000000099110001',
          'ether',
          test.justPriceProtocolWrapper.address);

        assertBNEquals (
          'test.justPriceProtocolWrapper.outstandingTokens (test.dave.address)',
          0,
          test.justPriceProtocolWrapper.outstandingTokens (test.dave.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.eligibleVotes (test.dave.address)',
          '774999000006206744',
          test.justPriceProtocolWrapper.eligibleVotes (test.dave.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.totalEligibleVotes ()',
          '857881476723348181',
          test.justPriceProtocolWrapper.totalEligibleVotes ());
      }},
    { name: "Alice disables token transfers",
      body: function (test) {
        personal.unlockAccount (test.alice, "");
        test.tx = test.myOrgonToken.setTransfersEnabled (
          0,
          {from: test.alice, gas:1000000});
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();
      }},
    { name: "Carol initiates token delivery to Bob",
      body: function (test) {
        assertBNEquals (
          'test.justPriceProtocolWrapper.getStage (1524117600)',
          4, // LIFE
          test.justPriceProtocolWrapper.getStage (1524117600));

        assertBNEquals (
          'test.justPriceProtocolWrapper.outstandingTokens (test.bob.address)',
          '0',
          test.justPriceProtocolWrapper.outstandingTokens (test.bob.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.eligibleVotes (test.bob.address)',
          '82881476723348181',
          test.justPriceProtocolWrapper.eligibleVotes (test.bob.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.totalEligibleVotes ()',
          '857881476723348181',
          test.justPriceProtocolWrapper.totalEligibleVotes ());

        personal.unlockAccount (test.alice, "");
        test.tx = test.carol.execute (
          test.justPriceProtocolWrapper.address,
          test.justPriceProtocolWrapper.deliver.getData (
            [ test.bob.address ]),
          0,
          {
            from: test.alice,
            gas:1000000
          });
      }},
    { name: "Make sure transaction succeeded but no tokens were delivered",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.carol.Result",
          test.carol,
          test.carol.Result,
          test.tx,
          { value: true });

        assertEvents (
          "test.myOrgonToken.Transfer",
          test.myOrgonToken,
          test.myOrgonToken.Transfer,
          test.tx);

        assertEvents (
          "test.justPriceProtocolWrapper.Delivery",
          test.justPriceProtocolWrapper,
          test.justPriceProtocolWrapper.Delivery,
          test.tx);

        assertBNEquals (
          'test.justPriceProtocolWrapper.getStage (1524117600)',
          4, // LIFE
          test.justPriceProtocolWrapper.getStage (1524117600));

        assertBNEquals (
          'test.justPriceProtocolWrapper.outstandingTokens (test.bob.address)',
          '0',
          test.justPriceProtocolWrapper.outstandingTokens (test.bob.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.eligibleVotes (test.bob.address)',
          '82881476723348181',
          test.justPriceProtocolWrapper.eligibleVotes (test.bob.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.totalEligibleVotes ()',
          '857881476723348181',
          test.justPriceProtocolWrapper.totalEligibleVotes ());
      }},
    { name: "Carol tries to initiate refund for Bob but it is not refund stage",
      body: function (test) {
        assertBNEquals (
          'test.justPriceProtocolWrapper.getStage (1524117600)',
          4, // LIFE
          test.justPriceProtocolWrapper.getStage (1524117600));

        assertBalance (
          'test.bob',
          '7500.001600000001689999',
          'ether',
          test.bob.address);

        personal.unlockAccount (test.alice, "");
        test.tx = test.carol.execute (
          test.justPriceProtocolWrapper.address,
          test.justPriceProtocolWrapper.refund.getData (
            [ test.bob.address ]),
          0,
          {
            from: test.alice,
            gas:1000000
          });
      }},
    { name: "Make sure transaction failed",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.carol.Result",
          test.carol,
          test.carol.Result,
          test.tx,
          { value: false });

        assertEvents (
          "test.justPriceProtocolWrapper.Refund",
          test.justPriceProtocolWrapper,
          test.justPriceProtocolWrapper.Refund,
          test.tx);

        assertBNEquals (
          'test.justPriceProtocolWrapper.getStage (1524117600)',
          4, // LIFE
          test.justPriceProtocolWrapper.getStage (1524117600));

        assertBalance (
          'test.bob',
          '7500.001600000001689999',
          'ether',
          test.bob.address);
      }},
    { name: "Alice enables token transfers",
      body: function (test) {
        personal.unlockAccount (test.alice, "");
        test.tx = test.myOrgonToken.setTransfersEnabled (
          1000,
          {from: test.alice, gas:1000000});
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();
      }},
    { name: "Elly tries to sells 0 tokens",
      body: function (test) {
        assertBNEquals (
          'test.justPriceProtocolWrapper.getStage (1524117600)',
          4, // LIFE
          test.justPriceProtocolWrapper.getStage (1524117600));

        assertBalance (
          'test.justPriceProtocolWrapper',
          '200072501.000000000099110001',
          'ether',
          test.justPriceProtocolWrapper.address);

        assertBalance (
          'test.elly',
          '0',
          'ether',
          test.elly.address);

        assertBNEquals (
          'test.justPriceProtocolWrapper.outstandingTokens (test.dave.address)',
          0,
          test.justPriceProtocolWrapper.outstandingTokens (test.dave.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.eligibleVotes (test.dave.address)',
          '774999000006206744',
          test.justPriceProtocolWrapper.eligibleVotes (test.dave.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.totalEligibleVotes ()',
          '857881476723348181',
          test.justPriceProtocolWrapper.totalEligibleVotes ());

        personal.unlockAccount (test.alice, "");
        test.tx = test.elly.execute (
          test.justPriceProtocolWrapper.address,
          test.justPriceProtocolWrapper.sellTokens.getData ('0'),
          0,
          {
            from: test.alice,
            gas:1000000
          });
      }},
    { name: "Make sure transaction failed",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.elly.Result",
          test.elly,
          test.elly.Result,
          test.tx,
          { value: false });

        assertEvents (
          "test.myOrgonToken.Transfer",
          test.myOrgonToken,
          test.myOrgonToken.Transfer,
          test.tx);

        assertBNEquals (
          'test.justPriceProtocolWrapper.getStage (1524117600)',
          4, // LIFE
          test.justPriceProtocolWrapper.getStage (1524117600));

        assertBalance (
          'test.justPriceProtocolWrapper',
          '200072501.000000000099110001',
          'ether',
          test.justPriceProtocolWrapper.address);

        assertBalance (
          'test.elly',
          '0',
          'ether',
          test.elly.address);

        assertBNEquals (
          'test.justPriceProtocolWrapper.outstandingTokens (test.dave.address)',
          0,
          test.justPriceProtocolWrapper.outstandingTokens (test.dave.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.eligibleVotes (test.dave.address)',
          '774999000006206744',
          test.justPriceProtocolWrapper.eligibleVotes (test.dave.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.totalEligibleVotes ()',
          '857881476723348181',
          test.justPriceProtocolWrapper.totalEligibleVotes ());
      }},
    { name: "Elly tries to sells 340282366920938463463374607431.768211456 tokens",
      body: function (test) {
        assertBNEquals (
          'test.justPriceProtocolWrapper.getStage (1524117600)',
          4, // LIFE
          test.justPriceProtocolWrapper.getStage (1524117600));

        assertBalance (
          'test.justPriceProtocolWrapper',
          '200072501.000000000099110001',
          'ether',
          test.justPriceProtocolWrapper.address);

        assertBalance (
          'test.elly',
          '0',
          'ether',
          test.elly.address);

        assertBNEquals (
          'test.justPriceProtocolWrapper.outstandingTokens (test.dave.address)',
          0,
          test.justPriceProtocolWrapper.outstandingTokens (test.dave.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.eligibleVotes (test.dave.address)',
          '774999000006206744',
          test.justPriceProtocolWrapper.eligibleVotes (test.dave.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.totalEligibleVotes ()',
          '857881476723348181',
          test.justPriceProtocolWrapper.totalEligibleVotes ());

        personal.unlockAccount (test.alice, "");
        test.tx = test.elly.execute (
          test.justPriceProtocolWrapper.address,
          test.justPriceProtocolWrapper.sellTokens.getData ('340282366920938463463374607431768211456'),
          0,
          {
            from: test.alice,
            gas:1000000
          });
      }},
    { name: "Make sure transaction failed",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.elly.Result",
          test.elly,
          test.elly.Result,
          test.tx,
          { value: false });

        assertEvents (
          "test.myOrgonToken.Transfer",
          test.myOrgonToken,
          test.myOrgonToken.Transfer,
          test.tx);

        assertBNEquals (
          'test.justPriceProtocolWrapper.getStage (1524117600)',
          4, // LIFE
          test.justPriceProtocolWrapper.getStage (1524117600));

        assertBalance (
          'test.justPriceProtocolWrapper',
          '200072501.000000000099110001',
          'ether',
          test.justPriceProtocolWrapper.address);

        assertBalance (
          'test.elly',
          '0',
          'ether',
          test.elly.address);

        assertBNEquals (
          'test.justPriceProtocolWrapper.outstandingTokens (test.dave.address)',
          0,
          test.justPriceProtocolWrapper.outstandingTokens (test.dave.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.eligibleVotes (test.dave.address)',
          '774999000006206744',
          test.justPriceProtocolWrapper.eligibleVotes (test.dave.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.totalEligibleVotes ()',
          '857881476723348181',
          test.justPriceProtocolWrapper.totalEligibleVotes ());
      }},
    { name: "Alice sets total supply or Orgon tokens to 340282366920938463463374607431.768211456",
      body: function (test) {
        console.log (test.myOrgonToken.totalSupply());

        personal.unlockAccount (test.alice, "");
        test.tx = test.myOrgonToken.setTotalSupply (
          '340282366920938463463374607431768211456',
          {from: test.alice, gas:1000000});
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();
      }},
    { name: "Elly tries to sells 10 tokens but total number of tokens in circulation exceeds limit",
      body: function (test) {
        assertBNEquals (
          'test.justPriceProtocolWrapper.getStage (1524117600)',
          4, // LIFE
          test.justPriceProtocolWrapper.getStage (1524117600));

        assertBalance (
          'test.justPriceProtocolWrapper',
          '200072501.000000000099110001',
          'ether',
          test.justPriceProtocolWrapper.address);

        assertBalance (
          'test.elly',
          '0',
          'ether',
          test.elly.address);

        assertBNEquals (
          'test.justPriceProtocolWrapper.outstandingTokens (test.dave.address)',
          0,
          test.justPriceProtocolWrapper.outstandingTokens (test.dave.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.eligibleVotes (test.dave.address)',
          '774999000006206744',
          test.justPriceProtocolWrapper.eligibleVotes (test.dave.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.totalEligibleVotes ()',
          '857881476723348181',
          test.justPriceProtocolWrapper.totalEligibleVotes ());

        personal.unlockAccount (test.alice, "");
        test.tx = test.elly.execute (
          test.justPriceProtocolWrapper.address,
          test.justPriceProtocolWrapper.sellTokens.getData ('10000000000'),
          0,
          {
            from: test.alice,
            gas:1000000
          });
      }},
    { name: "Make sure transaction failed",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.elly.Result",
          test.elly,
          test.elly.Result,
          test.tx,
          { value: false });

        assertEvents (
          "test.myOrgonToken.Transfer",
          test.myOrgonToken,
          test.myOrgonToken.Transfer,
          test.tx);

        assertBNEquals (
          'test.justPriceProtocolWrapper.getStage (1524117600)',
          4, // LIFE
          test.justPriceProtocolWrapper.getStage (1524117600));

        assertBalance (
          'test.justPriceProtocolWrapper',
          '200072501.000000000099110001',
          'ether',
          test.justPriceProtocolWrapper.address);

        assertBalance (
          'test.elly',
          '0',
          'ether',
          test.elly.address);

        assertBNEquals (
          'test.justPriceProtocolWrapper.outstandingTokens (test.dave.address)',
          0,
          test.justPriceProtocolWrapper.outstandingTokens (test.dave.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.eligibleVotes (test.dave.address)',
          '774999000006206744',
          test.justPriceProtocolWrapper.eligibleVotes (test.dave.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.totalEligibleVotes ()',
          '857881476723348181',
          test.justPriceProtocolWrapper.totalEligibleVotes ());
      }},
    { name: "Alice sets total supply or Orgon tokens to 1601116547.685712969",
      body: function (test) {
        personal.unlockAccount (test.alice, "");
        test.tx = test.myOrgonToken.setTotalSupply (
          '1601116547685712969',
          {from: test.alice, gas:1000000});
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();
      }},
    { name: "Elly tries to sells 1601116547.685712970 tokens but this is more than total number of tokens in circulation",
      body: function (test) {
        assertBNEquals (
          'test.justPriceProtocolWrapper.getStage (1524117600)',
          4, // LIFE
          test.justPriceProtocolWrapper.getStage (1524117600));

        assertBalance (
          'test.justPriceProtocolWrapper',
          '200072501.000000000099110001',
          'ether',
          test.justPriceProtocolWrapper.address);

        assertBalance (
          'test.elly',
          '0',
          'ether',
          test.elly.address);

        assertBNEquals (
          'test.justPriceProtocolWrapper.outstandingTokens (test.dave.address)',
          0,
          test.justPriceProtocolWrapper.outstandingTokens (test.dave.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.eligibleVotes (test.dave.address)',
          '774999000006206744',
          test.justPriceProtocolWrapper.eligibleVotes (test.dave.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.totalEligibleVotes ()',
          '857881476723348181',
          test.justPriceProtocolWrapper.totalEligibleVotes ());

        personal.unlockAccount (test.alice, "");
        test.tx = test.elly.execute (
          test.justPriceProtocolWrapper.address,
          test.justPriceProtocolWrapper.sellTokens.getData ('1601116547685712970'),
          0,
          {
            from: test.alice,
            gas:1000000
          });
      }},
    { name: "Make sure transaction failed",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.elly.Result",
          test.elly,
          test.elly.Result,
          test.tx,
          { value: false });

        assertEvents (
          "test.myOrgonToken.Transfer",
          test.myOrgonToken,
          test.myOrgonToken.Transfer,
          test.tx);

        assertBNEquals (
          'test.justPriceProtocolWrapper.getStage (1524117600)',
          4, // LIFE
          test.justPriceProtocolWrapper.getStage (1524117600));

        assertBalance (
          'test.justPriceProtocolWrapper',
          '200072501.000000000099110001',
          'ether',
          test.justPriceProtocolWrapper.address);

        assertBalance (
          'test.elly',
          '0',
          'ether',
          test.elly.address);

        assertBNEquals (
          'test.justPriceProtocolWrapper.outstandingTokens (test.dave.address)',
          0,
          test.justPriceProtocolWrapper.outstandingTokens (test.dave.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.eligibleVotes (test.dave.address)',
          '774999000006206744',
          test.justPriceProtocolWrapper.eligibleVotes (test.dave.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.totalEligibleVotes ()',
          '857881476723348181',
          test.justPriceProtocolWrapper.totalEligibleVotes ());
      }},
    { name: "Alice disables token transfers",
      body: function (test) {
        personal.unlockAccount (test.alice, "");
        test.tx = test.myOrgonToken.setTransfersEnabled (
          0,
          {from: test.alice, gas:1000000});
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();
      }},
    { name: "Elly tries to sells 10 tokens but token transfers are disabled",
      body: function (test) {
        assertBNEquals (
          'test.justPriceProtocolWrapper.getStage (1524117600)',
          4, // LIFE
          test.justPriceProtocolWrapper.getStage (1524117600));

        assertBalance (
          'test.justPriceProtocolWrapper',
          '200072501.000000000099110001',
          'ether',
          test.justPriceProtocolWrapper.address);

        assertBalance (
          'test.elly',
          '0',
          'ether',
          test.elly.address);

        assertBNEquals (
          'test.justPriceProtocolWrapper.outstandingTokens (test.dave.address)',
          0,
          test.justPriceProtocolWrapper.outstandingTokens (test.dave.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.eligibleVotes (test.dave.address)',
          '774999000006206744',
          test.justPriceProtocolWrapper.eligibleVotes (test.dave.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.totalEligibleVotes ()',
          '857881476723348181',
          test.justPriceProtocolWrapper.totalEligibleVotes ());

        personal.unlockAccount (test.alice, "");
        test.tx = test.elly.execute (
          test.justPriceProtocolWrapper.address,
          test.justPriceProtocolWrapper.sellTokens.getData ('10000000000'),
          0,
          {
            from: test.alice,
            gas:1000000
          });
      }},
    { name: "Make sure transaction failed",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.elly.Result",
          test.elly,
          test.elly.Result,
          test.tx,
          { value: false });

        assertEvents (
          "test.myOrgonToken.Transfer",
          test.myOrgonToken,
          test.myOrgonToken.Transfer,
          test.tx);

        assertBNEquals (
          'test.justPriceProtocolWrapper.getStage (1524117600)',
          4, // LIFE
          test.justPriceProtocolWrapper.getStage (1524117600));

        assertBalance (
          'test.justPriceProtocolWrapper',
          '200072501.000000000099110001',
          'ether',
          test.justPriceProtocolWrapper.address);

        assertBalance (
          'test.elly',
          '0',
          'ether',
          test.elly.address);

        assertBNEquals (
          'test.justPriceProtocolWrapper.outstandingTokens (test.dave.address)',
          0,
          test.justPriceProtocolWrapper.outstandingTokens (test.dave.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.eligibleVotes (test.dave.address)',
          '774999000006206744',
          test.justPriceProtocolWrapper.eligibleVotes (test.dave.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.totalEligibleVotes ()',
          '857881476723348181',
          test.justPriceProtocolWrapper.totalEligibleVotes ());
      }},
    { name: "Alice enables token transfers",
      body: function (test) {
        personal.unlockAccount (test.alice, "");
        test.tx = test.myOrgonToken.setTransfersEnabled (
          1000,
          {from: test.alice, gas:1000000});
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();
      }},
     { name: "Alice disables token burning",
      body: function (test) {
        personal.unlockAccount (test.alice, "");
        test.tx = test.myOrgonToken.setBurningEnabled (
          false,
          {from: test.alice, gas:1000000});
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();
      }},
    { name: "Elly tries to sells 10 tokens but token burning is disabled",
      body: function (test) {
        assertBNEquals (
          'test.justPriceProtocolWrapper.getStage (1524117600)',
          4, // LIFE
          test.justPriceProtocolWrapper.getStage (1524117600));

        assertBalance (
          'test.justPriceProtocolWrapper',
          '200072501.000000000099110001',
          'ether',
          test.justPriceProtocolWrapper.address);

        assertBalance (
          'test.elly',
          '0',
          'ether',
          test.elly.address);

        assertBNEquals (
          'test.justPriceProtocolWrapper.outstandingTokens (test.dave.address)',
          0,
          test.justPriceProtocolWrapper.outstandingTokens (test.dave.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.eligibleVotes (test.dave.address)',
          '774999000006206744',
          test.justPriceProtocolWrapper.eligibleVotes (test.dave.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.totalEligibleVotes ()',
          '857881476723348181',
          test.justPriceProtocolWrapper.totalEligibleVotes ());

        personal.unlockAccount (test.alice, "");
        test.tx = test.elly.execute (
          test.justPriceProtocolWrapper.address,
          test.justPriceProtocolWrapper.sellTokens.getData ('10000000000'),
          0,
          {
            from: test.alice,
            gas:1000000
          });
      }},
    { name: "Make sure transaction failed",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.elly.Result",
          test.elly,
          test.elly.Result,
          test.tx,
          { value: false });

        assertEvents (
          "test.myOrgonToken.Transfer",
          test.myOrgonToken,
          test.myOrgonToken.Transfer,
          test.tx);

        assertBNEquals (
          'test.justPriceProtocolWrapper.getStage (1524117600)',
          4, // LIFE
          test.justPriceProtocolWrapper.getStage (1524117600));

        assertBalance (
          'test.justPriceProtocolWrapper',
          '200072501.000000000099110001',
          'ether',
          test.justPriceProtocolWrapper.address);

        assertBalance (
          'test.elly',
          '0',
          'ether',
          test.elly.address);

        assertBNEquals (
          'test.justPriceProtocolWrapper.outstandingTokens (test.dave.address)',
          0,
          test.justPriceProtocolWrapper.outstandingTokens (test.dave.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.eligibleVotes (test.dave.address)',
          '774999000006206744',
          test.justPriceProtocolWrapper.eligibleVotes (test.dave.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.totalEligibleVotes ()',
          '857881476723348181',
          test.justPriceProtocolWrapper.totalEligibleVotes ());
      }},
    { name: "Alice enables token burning",
      body: function (test) {
        personal.unlockAccount (test.alice, "");
        test.tx = test.myOrgonToken.setBurningEnabled (
          true,
          {from: test.alice, gas:1000000});
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();
      }},
    { name: "Alice tells Elly to deny payments",
      body: function (test) {
        personal.unlockAccount (test.alice, "");
        test.tx = test.elly.setAcceptsPayments (
          false,
          {from: test.alice, gas:1000000});
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();
      }},
    { name: "Elly tries to sells 10 tokens but does not accept payments",
      body: function (test) {
        assertBNEquals (
          'test.justPriceProtocolWrapper.getStage (1524117600)',
          4, // LIFE
          test.justPriceProtocolWrapper.getStage (1524117600));

        assertBalance (
          'test.justPriceProtocolWrapper',
          '200072501.000000000099110001',
          'ether',
          test.justPriceProtocolWrapper.address);

        assertBalance (
          'test.elly',
          '0',
          'ether',
          test.elly.address);

        assertBNEquals (
          'test.justPriceProtocolWrapper.outstandingTokens (test.dave.address)',
          0,
          test.justPriceProtocolWrapper.outstandingTokens (test.dave.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.eligibleVotes (test.dave.address)',
          '774999000006206744',
          test.justPriceProtocolWrapper.eligibleVotes (test.dave.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.totalEligibleVotes ()',
          '857881476723348181',
          test.justPriceProtocolWrapper.totalEligibleVotes ());

        personal.unlockAccount (test.alice, "");
        test.tx = test.elly.execute (
          test.justPriceProtocolWrapper.address,
          test.justPriceProtocolWrapper.sellTokens.getData ('10000000000'),
          0,
          {
            from: test.alice,
            gas:1000000
          });
      }},
    { name: "Make sure transaction failed",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.elly.Result",
          test.elly,
          test.elly.Result,
          test.tx,
          { value: false });

        assertEvents (
          "test.myOrgonToken.Transfer",
          test.myOrgonToken,
          test.myOrgonToken.Transfer,
          test.tx);

        assertBNEquals (
          'test.justPriceProtocolWrapper.getStage (1524117600)',
          4, // LIFE
          test.justPriceProtocolWrapper.getStage (1524117600));

        assertBalance (
          'test.justPriceProtocolWrapper',
          '200072501.000000000099110001',
          'ether',
          test.justPriceProtocolWrapper.address);

        assertBalance (
          'test.elly',
          '0',
          'ether',
          test.elly.address);

        assertBNEquals (
          'test.justPriceProtocolWrapper.outstandingTokens (test.dave.address)',
          0,
          test.justPriceProtocolWrapper.outstandingTokens (test.dave.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.eligibleVotes (test.dave.address)',
          '774999000006206744',
          test.justPriceProtocolWrapper.eligibleVotes (test.dave.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.totalEligibleVotes ()',
          '857881476723348181',
          test.justPriceProtocolWrapper.totalEligibleVotes ());
      }},
    { name: "Alice tells Elly to accept payments",
      body: function (test) {
        personal.unlockAccount (test.alice, "");
        test.tx = test.elly.setAcceptsPayments (
          true,
          {from: test.alice, gas:1000000});
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();
      }},
    { name: "Elly sells 10 tokens",
      body: function (test) {
        assertBNEquals (
          'test.justPriceProtocolWrapper.getStage (1524117600)',
          4, // LIFE
          test.justPriceProtocolWrapper.getStage (1524117600));

        assertBalance (
          'test.justPriceProtocolWrapper',
          '200072501.000000000099110001',
          'ether',
          test.justPriceProtocolWrapper.address);

        assertBalance (
          'test.elly',
          '0',
          'ether',
          test.elly.address);

        assertBNEquals (
          'test.justPriceProtocolWrapper.outstandingTokens (test.dave.address)',
          0,
          test.justPriceProtocolWrapper.outstandingTokens (test.dave.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.eligibleVotes (test.dave.address)',
          '774999000006206744',
          test.justPriceProtocolWrapper.eligibleVotes (test.dave.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.totalEligibleVotes ()',
          '857881476723348181',
          test.justPriceProtocolWrapper.totalEligibleVotes ());

        personal.unlockAccount (test.alice, "");
        test.tx = test.elly.execute (
          test.justPriceProtocolWrapper.address,
          test.justPriceProtocolWrapper.sellTokens.getData ('10000000000'),
          0,
          {
            from: test.alice,
            gas:1000000
          });
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.elly.Result",
          test.elly,
          test.elly.Result,
          test.tx,
          { value: true });

        assertEvents (
          "test.myOrgonToken.Transfer",
          test.myOrgonToken,
          test.myOrgonToken.Transfer,
          test.tx,
          {
            _from: test.elly.address,
            _to: test.justPriceProtocolWrapper.address,
            _value: '10000000000'
          },
          {
            _from: test.justPriceProtocolWrapper.address,
            _to: '0x0000000000000000000000000000000000000000',
            _value: '10000000000'
          });

        assertBNEquals (
          'test.justPriceProtocolWrapper.getStage (1524117600)',
          4, // LIFE
          test.justPriceProtocolWrapper.getStage (1524117600));

        assertBalance (
          'test.justPriceProtocolWrapper',
          '200072488.504189144476264761',
          'ether',
          test.justPriceProtocolWrapper.address);

        assertBalance (
          'test.elly',
          '12.495810855622845240',
          'ether',
          test.elly.address);

        assertBNEquals (
          'test.justPriceProtocolWrapper.outstandingTokens (test.dave.address)',
          0,
          test.justPriceProtocolWrapper.outstandingTokens (test.dave.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.eligibleVotes (test.dave.address)',
          '774999000006206744',
          test.justPriceProtocolWrapper.eligibleVotes (test.dave.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.totalEligibleVotes ()',
          '857881476723348181',
          test.justPriceProtocolWrapper.totalEligibleVotes ());
      }},
    { name: "Carol tries to revoke vote but she didn't vote yet",
      body: function (test) {
        personal.unlockAccount (test.alice, "");
        test.tx = test.carol.execute (
          test.justPriceProtocolWrapper.address,
          test.justPriceProtocolWrapper.vote.getData (
            '0x0000000000000000000000000000000000000000'),
          0,
          {
            from: test.alice,
            gas:1000000
          });
      }},
    { name: "Make sure transaction succeeded but no events were logged",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.carol.Result",
          test.carol,
          test.carol.Result,
          test.tx,
          { value: true });

        assertEvents (
          "test.justPriceProtocolWrapper.Vote",
          test.justPriceProtocolWrapper,
          test.justPriceProtocolWrapper.Vote,
          test.tx);

        assertEvents (
          "test.justPriceProtocolWrapper.VoteRevocation",
          test.justPriceProtocolWrapper,
          test.justPriceProtocolWrapper.VoteRevocation,
          test.tx);

        assertEvents (
          "test.justPriceProtocolWrapper.K1Change",
          test.justPriceProtocolWrapper,
          test.justPriceProtocolWrapper.K1Change,
          test.tx);
      }},
    { name: "Carol votes for Dave",
      body: function (test) {
        assertBNEquals (
          'test.justPriceProtocolWrapper.votesFor (test.dave.address)',
          0,
          test.justPriceProtocolWrapper.votesFor (test.dave.address));

        personal.unlockAccount (test.alice, "");
        test.tx = test.carol.execute (
          test.justPriceProtocolWrapper.address,
          test.justPriceProtocolWrapper.vote.getData (test.dave.address),
          0,
          {
            from: test.alice,
            gas:1000000
          });
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.carol.Result",
          test.carol,
          test.carol.Result,
          test.tx,
          { value: true });

        assertEvents (
          "test.justPriceProtocolWrapper.Vote",
          test.justPriceProtocolWrapper,
          test.justPriceProtocolWrapper.Vote,
          test.tx,
          {
            investor: test.carol.address,
            newK1: test.dave.address,
            votes: '999993793256'
          });

        assertEvents (
          "test.justPriceProtocolWrapper.VoteRevocation",
          test.justPriceProtocolWrapper,
          test.justPriceProtocolWrapper.VoteRevocation,
          test.tx);

        assertEvents (
          "test.justPriceProtocolWrapper.K1Change",
          test.justPriceProtocolWrapper,
          test.justPriceProtocolWrapper.K1Change,
          test.tx);

        assertBNEquals (
          'test.justPriceProtocolWrapper.votesFor (test.dave.address)',
          '999993793256',
          test.justPriceProtocolWrapper.votesFor (test.dave.address));
      }},
    { name: "Carol votes for herself",
      body: function (test) {
        assertBNEquals (
          'test.justPriceProtocolWrapper.votesFor (test.carol.address)',
          '0',
          test.justPriceProtocolWrapper.votesFor (test.carol.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.votesFor (test.dave.address)',
          '999993793256',
          test.justPriceProtocolWrapper.votesFor (test.dave.address));

        personal.unlockAccount (test.alice, "");
        test.tx = test.carol.execute (
          test.justPriceProtocolWrapper.address,
          test.justPriceProtocolWrapper.vote.getData (test.carol.address),
          0,
          {
            from: test.alice,
            gas:1000000
          });
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.carol.Result",
          test.carol,
          test.carol.Result,
          test.tx,
          { value: true });

        assertEvents (
          "test.justPriceProtocolWrapper.Vote",
          test.justPriceProtocolWrapper,
          test.justPriceProtocolWrapper.Vote,
          test.tx,
          {
            investor: test.carol.address,
            newK1: test.carol.address,
            votes: '999993793256'
          });

        assertEvents (
          "test.justPriceProtocolWrapper.VoteRevocation",
          test.justPriceProtocolWrapper,
          test.justPriceProtocolWrapper.VoteRevocation,
          test.tx,
          {
            investor: test.carol.address,
            newK1: test.dave.address,
            votes: '999993793256'
          });

        assertEvents (
          "test.justPriceProtocolWrapper.K1Change",
          test.justPriceProtocolWrapper,
          test.justPriceProtocolWrapper.K1Change,
          test.tx);

        assertBNEquals (
          'test.justPriceProtocolWrapper.votesFor (test.carol.address)',
          '999993793256',
          test.justPriceProtocolWrapper.votesFor (test.carol.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.votesFor (test.dave.address)',
          '0',
          test.justPriceProtocolWrapper.votesFor (test.dave.address));
      }},
    { name: "Carol revokes vote",
      body: function (test) {
        assertBNEquals (
          'test.justPriceProtocolWrapper.votesFor (test.carol.address)',
          '999993793256',
          test.justPriceProtocolWrapper.votesFor (test.carol.address));

        personal.unlockAccount (test.alice, "");
        test.tx = test.carol.execute (
          test.justPriceProtocolWrapper.address,
          test.justPriceProtocolWrapper.vote.getData (
            '0x0000000000000000000000000000000000000000'),
          0,
          {
            from: test.alice,
            gas:1000000
          });
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.carol.Result",
          test.carol,
          test.carol.Result,
          test.tx,
          { value: true });

        assertEvents (
          "test.justPriceProtocolWrapper.Vote",
          test.justPriceProtocolWrapper,
          test.justPriceProtocolWrapper.Vote,
          test.tx);

        assertEvents (
          "test.justPriceProtocolWrapper.VoteRevocation",
          test.justPriceProtocolWrapper,
          test.justPriceProtocolWrapper.VoteRevocation,
          test.tx,
          {
            investor: test.carol.address,
            newK1: test.carol.address,
            votes: '999993793256'
          });

        assertEvents (
          "test.justPriceProtocolWrapper.K1Change",
          test.justPriceProtocolWrapper,
          test.justPriceProtocolWrapper.K1Change,
          test.tx);

        assertBNEquals (
          'test.justPriceProtocolWrapper.votesFor (test.carol.address)',
          '0',
          test.justPriceProtocolWrapper.votesFor (test.carol.address));
      }},
    { name: "Carol votes for Frank",
      body: function (test) {
        assertBNEquals (
          'test.justPriceProtocolWrapper.votesFor (test.frank.address)',
          0,
          test.justPriceProtocolWrapper.votesFor (test.frank.address));

        personal.unlockAccount (test.alice, "");
        test.tx = test.carol.execute (
          test.justPriceProtocolWrapper.address,
          test.justPriceProtocolWrapper.vote.getData (test.frank.address),
          0,
          {
            from: test.alice,
            gas:1000000
          });
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.carol.Result",
          test.carol,
          test.carol.Result,
          test.tx,
          { value: true });

        assertEvents (
          "test.justPriceProtocolWrapper.Vote",
          test.justPriceProtocolWrapper,
          test.justPriceProtocolWrapper.Vote,
          test.tx,
          {
            investor: test.carol.address,
            newK1: test.frank.address,
            votes: '999993793256'
          });

        assertEvents (
          "test.justPriceProtocolWrapper.VoteRevocation",
          test.justPriceProtocolWrapper,
          test.justPriceProtocolWrapper.VoteRevocation,
          test.tx);

        assertEvents (
          "test.justPriceProtocolWrapper.K1Change",
          test.justPriceProtocolWrapper,
          test.justPriceProtocolWrapper.K1Change,
          test.tx);

        assertBNEquals (
          'test.justPriceProtocolWrapper.votesFor (test.frank.address)',
          '999993793256',
          test.justPriceProtocolWrapper.votesFor (test.frank.address));
      }},
    { name: "Dave votes for Frank",
      body: function (test) {
        assertBNEquals (
          'test.justPriceProtocolWrapper.votesFor (test.frank.address)',
          '999993793256',
          test.justPriceProtocolWrapper.votesFor (test.frank.address));

        personal.unlockAccount (test.alice, "");
        test.tx = test.dave.execute (
          test.justPriceProtocolWrapper.address,
          test.justPriceProtocolWrapper.vote.getData (test.frank.address),
          0,
          {
            from: test.alice,
            gas:1000000
          });
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.dave.Result",
          test.dave,
          test.dave.Result,
          test.tx,
          { value: true });

        assertEvents (
          "test.justPriceProtocolWrapper.Vote",
          test.justPriceProtocolWrapper,
          test.justPriceProtocolWrapper.Vote,
          test.tx,
          {
            investor: test.dave.address,
            newK1: test.frank.address,
            votes: '774999000006206744'
          });

        assertEvents (
          "test.justPriceProtocolWrapper.VoteRevocation",
          test.justPriceProtocolWrapper,
          test.justPriceProtocolWrapper.VoteRevocation,
          test.tx);

        assertEvents (
          "test.justPriceProtocolWrapper.K1Change",
          test.justPriceProtocolWrapper,
          test.justPriceProtocolWrapper.K1Change,
          test.tx,
          {
            k1: test.frank.address
          });

        assertBNEquals (
          'test.justPriceProtocolWrapper.votesFor (test.frank.address)',
          '775000000000000000',
          test.justPriceProtocolWrapper.votesFor (test.frank.address));
      }},
    { name: "Dave tries to vote for Bob but K1 address was already changed",
      body: function (test) {
        assertBNEquals (
          'test.justPriceProtocolWrapper.votesFor (test.frank.address)',
          '775000000000000000',
          test.justPriceProtocolWrapper.votesFor (test.frank.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.votesFor (test.bob.address)',
          '0',
          test.justPriceProtocolWrapper.votesFor (test.bob.address));

        personal.unlockAccount (test.alice, "");
        test.tx = test.dave.execute (
          test.justPriceProtocolWrapper.address,
          test.justPriceProtocolWrapper.vote.getData (test.bob.address),
          0,
          {
            from: test.alice,
            gas:1000000
          });
      }},
    { name: "Make sure transaction failed",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.dave.Result",
          test.dave,
          test.dave.Result,
          test.tx,
          { value: false });

        assertEvents (
          "test.justPriceProtocolWrapper.Vote",
          test.justPriceProtocolWrapper,
          test.justPriceProtocolWrapper.Vote,
          test.tx);

        assertEvents (
          "test.justPriceProtocolWrapper.VoteRevocation",
          test.justPriceProtocolWrapper,
          test.justPriceProtocolWrapper.VoteRevocation,
          test.tx);

        assertEvents (
          "test.justPriceProtocolWrapper.K1Change",
          test.justPriceProtocolWrapper,
          test.justPriceProtocolWrapper.K1Change,
          test.tx);

        assertBNEquals (
          'test.justPriceProtocolWrapper.votesFor (test.frank.address)',
          '775000000000000000',
          test.justPriceProtocolWrapper.votesFor (test.frank.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.votesFor (test.bob.address)',
          '0',
          test.justPriceProtocolWrapper.votesFor (test.bob.address));
      }},
    { name: "Carol buys tokens for 1 ether",
      body: function (test) {
        assertBNEquals (
          'test.justPriceProtocolWrapper.getStage (1524117600)',
          4, // LIFE
          test.justPriceProtocolWrapper.getStage (1524117600));

        assertBalance (
          'test.justPriceProtocolWrapper',
          '200072488.504189144476264761',
          'ether',
          test.justPriceProtocolWrapper.address);

        personal.unlockAccount (test.alice, "");
        test.tx = test.carol.execute (
          test.justPriceProtocolWrapper.address,
          test.justPriceProtocolWrapper.buyTokens.getData (),
          web3.toWei ('1', 'ether'),
          {
            from: test.alice,
            value: web3.toWei ('1', 'ether'),
            gas:1000000
          });
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.carol.Result",
          test.carol,
          test.carol.Result,
          test.tx,
          { value: true });

        assertEvents (
          "test.myOrgonToken.Transfer",
          test.myOrgonToken,
          test.myOrgonToken.Transfer,
          test.tx,
          {
            _from: '0x0000000000000000000000000000000000000000',
            _to: test.justPriceProtocolWrapper.address,
            _value: '800268215'
          },
          {
            _from: test.justPriceProtocolWrapper.address,
            _to: test.carol.address,
            _value: '800188189'
          },
          {
            _from: test.justPriceProtocolWrapper.address,
            _to: test.frank.address,
            _value: '80026'
          });

        assertBNEquals (
          'test.justPriceProtocolWrapper.getStage (1524117600)',
          4, // LIFE
          test.justPriceProtocolWrapper.getStage (1524117600));

        assertBalance (
          'test.justPriceProtocolWrapper',
          '200072489.504189144476264761',
          'ether',
          test.justPriceProtocolWrapper.address);
      }},
    { name: "Alice sets current time to 1 second before fee changes are allowed",
      body: function (test) {
        personal.unlockAccount (test.alice, "");
        test.tx = test.justPriceProtocolWrapper.setCurrentTime (
          1587189599,
          {from: test.alice, gas:1000000});
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();
      }},
    { name: "Frank tries to increase fee, but fee change is not allowed yet",
      body: function (test) {
        assertBNEquals (
          'test.justPriceProtocolWrapper.getFee ()',
          2,
          test.justPriceProtocolWrapper.getFee ());

        personal.unlockAccount (test.alice, "");
        test.tx = test.frank.execute (
          test.justPriceProtocolWrapper.address,
          test.justPriceProtocolWrapper.setFee.getData (3),
          0,
          {
            from: test.alice,
            gas:1000000
          });
      }},
    { name: "Make sure transaction failed",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.frank.Result",
          test.frank,
          test.frank.Result,
          test.tx,
          { value: false });

        assertEvents (
          "test.justPriceProtocolWrapper.FeeChange",
          test.justPriceProtocolWrapper,
          test.justPriceProtocolWrapper.FeeChange,
          test.tx);

        assertBNEquals (
          'test.justPriceProtocolWrapper.getFee ()',
          2,
          test.justPriceProtocolWrapper.getFee ());
      }},
    { name: "Alice sets current time to fee changes allowed time",
      body: function (test) {
        personal.unlockAccount (test.alice, "");
        test.tx = test.justPriceProtocolWrapper.setCurrentTime (
          1587189600,
          {from: test.alice, gas:1000000});
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();
      }},
    { name: "Frank tries to increase fee by two steps, but fee change is allowed only by one step at a time",
      body: function (test) {
        assertBNEquals (
          'test.justPriceProtocolWrapper.getFee ()',
          2,
          test.justPriceProtocolWrapper.getFee ());

        personal.unlockAccount (test.alice, "");
        test.tx = test.frank.execute (
          test.justPriceProtocolWrapper.address,
          test.justPriceProtocolWrapper.setFee.getData (4),
          0,
          {
            from: test.alice,
            gas:1000000
          });
      }},
    { name: "Make sure transaction failed",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.frank.Result",
          test.frank,
          test.frank.Result,
          test.tx,
          { value: false });

        assertEvents (
          "test.justPriceProtocolWrapper.FeeChange",
          test.justPriceProtocolWrapper,
          test.justPriceProtocolWrapper.FeeChange,
          test.tx);

        assertBNEquals (
          'test.justPriceProtocolWrapper.getFee ()',
          2,
          test.justPriceProtocolWrapper.getFee ());
      }},
    { name: "Carol tries to increase fee by one, but she is not the DAO",
      body: function (test) {
        assertBNEquals (
          'test.justPriceProtocolWrapper.getFee ()',
          2,
          test.justPriceProtocolWrapper.getFee ());

        personal.unlockAccount (test.alice, "");
        test.tx = test.carol.execute (
          test.justPriceProtocolWrapper.address,
          test.justPriceProtocolWrapper.setFee.getData (3),
          0,
          {
            from: test.alice,
            gas:1000000
          });
      }},
    { name: "Make sure transaction failed",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.carol.Result",
          test.carol,
          test.carol.Result,
          test.tx,
          { value: false });

        assertEvents (
          "test.justPriceProtocolWrapper.FeeChange",
          test.justPriceProtocolWrapper,
          test.justPriceProtocolWrapper.FeeChange,
          test.tx);

        assertBNEquals (
          'test.justPriceProtocolWrapper.getFee ()',
          2,
          test.justPriceProtocolWrapper.getFee ());
      }},
    { name: "Frank increases fee by one",
      body: function (test) {
        assertBNEquals (
          'test.justPriceProtocolWrapper.getFee ()',
          2,
          test.justPriceProtocolWrapper.getFee ());

        personal.unlockAccount (test.alice, "");
        test.tx = test.frank.execute (
          test.justPriceProtocolWrapper.address,
          test.justPriceProtocolWrapper.setFee.getData (3),
          0,
          {
            from: test.alice,
            gas:1000000
          });
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.frank.Result",
          test.frank,
          test.frank.Result,
          test.tx,
          { value: true });

        assertEvents (
          "test.justPriceProtocolWrapper.FeeChange",
          test.justPriceProtocolWrapper,
          test.justPriceProtocolWrapper.FeeChange,
          test.tx,
          { fee: 3 });

        assertBNEquals (
          'test.justPriceProtocolWrapper.getFee ()',
          3,
          test.justPriceProtocolWrapper.getFee ());
      }},
    { name: "Frank sets fee to current value",
      body: function (test) {
        assertBNEquals (
          'test.justPriceProtocolWrapper.getFee ()',
          3,
          test.justPriceProtocolWrapper.getFee ());

        personal.unlockAccount (test.alice, "");
        test.tx = test.frank.execute (
          test.justPriceProtocolWrapper.address,
          test.justPriceProtocolWrapper.setFee.getData (3),
          0,
          {
            from: test.alice,
            gas:1000000
          });
      }},
    { name: "Make sure transaction succeeded but no events were logged",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.frank.Result",
          test.frank,
          test.frank.Result,
          test.tx,
          { value: true });

        assertEvents (
          "test.justPriceProtocolWrapper.FeeChange",
          test.justPriceProtocolWrapper,
          test.justPriceProtocolWrapper.FeeChange,
          test.tx);

        assertBNEquals (
          'test.justPriceProtocolWrapper.getFee ()',
          3,
          test.justPriceProtocolWrapper.getFee ());
      }},
    { name: "Frank tries to decrease fee by two steps, but fee change is allowed only by one step at a time",
      body: function (test) {
        assertBNEquals (
          'test.justPriceProtocolWrapper.getFee ()',
          3,
          test.justPriceProtocolWrapper.getFee ());

        personal.unlockAccount (test.alice, "");
        test.tx = test.frank.execute (
          test.justPriceProtocolWrapper.address,
          test.justPriceProtocolWrapper.setFee.getData (1),
          0,
          {
            from: test.alice,
            gas:1000000
          });
      }},
    { name: "Make sure transaction failed",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.frank.Result",
          test.frank,
          test.frank.Result,
          test.tx,
          { value: false });

        assertEvents (
          "test.justPriceProtocolWrapper.FeeChange",
          test.justPriceProtocolWrapper,
          test.justPriceProtocolWrapper.FeeChange,
          test.tx);

        assertBNEquals (
          'test.justPriceProtocolWrapper.getFee ()',
          3,
          test.justPriceProtocolWrapper.getFee ());
      }},
    { name: "Frank decreases fee by one",
      body: function (test) {
        assertBNEquals (
          'test.justPriceProtocolWrapper.getFee ()',
          3,
          test.justPriceProtocolWrapper.getFee ());

        personal.unlockAccount (test.alice, "");
        test.tx = test.frank.execute (
          test.justPriceProtocolWrapper.address,
          test.justPriceProtocolWrapper.setFee.getData (2),
          0,
          {
            from: test.alice,
            gas:1000000
          });
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.frank.Result",
          test.frank,
          test.frank.Result,
          test.tx,
          { value: true });

        assertEvents (
          "test.justPriceProtocolWrapper.FeeChange",
          test.justPriceProtocolWrapper,
          test.justPriceProtocolWrapper.FeeChange,
          test.tx,
          { fee: 2 });

        assertBNEquals (
          'test.justPriceProtocolWrapper.getFee ()',
          2,
          test.justPriceProtocolWrapper.getFee ());
      }}
  ]});
