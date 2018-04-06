/*
 * Test for Oris Space Smart Contract.
 * Copyright © 2018 by ABDK Consulting.
 * Author: Mikhail Vladimirov <mikhail.vladimirov@gmail.com>
 */

tests.push ({
  name: "OrisSpace",
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
    { name: "Alice deploys three Wallet contracts: Bob, Carol, Dave",
      body: function (test) {
        test.walletContract =
          loadContract ("Wallet");
        var walletCode =
          loadContractCode ("Wallet");

        personal.unlockAccount (test.alice, "");
        test.tx1 = test.walletContract.new (
          {from: test.alice, data: walletCode, gas:1000000}).
          transactionHash;
        test.tx2 = test.walletContract.new (
          {from: test.alice, data: walletCode, gas:1000000}).
          transactionHash;
        test.tx3 = test.walletContract.new (
          {from: test.alice, data: walletCode, gas:1000000}).
          transactionHash;
      }},
    { name: "Make sure contracts were deployed",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx1, test.tx2, test.tx3);
      },
      body: function (test) {
        miner.stop ();

        test.bob = getDeployedContract (
          "Bob",
          test.walletContract,
          test.tx1);

        test.carol = getDeployedContract (
          "Carol",
          test.walletContract,
          test.tx2);

        test.dave = getDeployedContract (
          "Dave",
          test.walletContract,
          test.tx3);
      }},
    { name: "Alice deploys SimpleOrgonToken contract",
      body: function (test) {
        var simpleOrgonTokenCode = loadContractCode ("SimpleOrgonToken");
        test.simpleOrgonTokenContract = loadContract ("SimpleOrgonToken");

        personal.unlockAccount (test.alice, "");
        test.tx = test.simpleOrgonTokenContract.new (
          test.carol.address,
          {from: test.alice, data: simpleOrgonTokenCode, gas:1000000}).
          transactionHash;
      }},
    { name: "Make sure contract was deployed",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        test.simpleOrgonToken = getDeployedContract (
          "SimpleOrgonToken", test.simpleOrgonTokenContract, test.tx);
      }},
    { name: "Alice deploys OrisSpaceWrapper contract",
      body: function (test) {
        var orisSpaceWrapperCode = loadContractCode ("OrisSpaceWrapper");
        test.orisSpaceWrapperContract = loadContract ("OrisSpaceWrapper");

        personal.unlockAccount (test.alice, "");
        test.tx = test.orisSpaceWrapperContract.new (
          test.simpleOrgonToken.address,
          test.bob.address,
          {from: test.alice, data: orisSpaceWrapperCode, gas:1000000}).
          transactionHash;
      }},
    { name: "Make sure contract was deployed",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        test.orisSpaceWrapper = getDeployedContract (
          "OrisSpaceWrapper", test.orisSpaceWrapperContract, test.tx);

        assertBNEquals (
          'test.orisSpaceWrapper.getTransferLimit ()',
          '100000000000',
          test.orisSpaceWrapper.getTransferLimit ());

        assertBNEquals (
          'test.orisSpaceWrapper.getTransferred (test.bob.address)',
          0,
          test.orisSpaceWrapper.getTransferred (test.bob.address));

        assertBNEquals (
          'test.orisSpaceWrapper.getTransferred (test.carol.address)',
          0,
          test.orisSpaceWrapper.getTransferred (test.carol.address));

        assertBNEquals (
          'test.orisSpaceWrapper.getTransferred (test.dave.address)',
          0,
          test.orisSpaceWrapper.getTransferred (test.dave.address));
      }},
    { name: "Bob tries to set transfer limit to 0.01e9 - 1 but this is less than minimum transfer limit allowed",
      body: function (test) {
        assertBNEquals (
          'test.orisSpaceWrapper.getTransferLimit ()',
          '100000000000',
          test.orisSpaceWrapper.getTransferLimit ());

        personal.unlockAccount (test.alice, "");
        test.tx = test.bob.execute (
          test.orisSpaceWrapper.address,
          test.orisSpaceWrapper.setTransferLimit.getData (9999999),
          0,
          { from: test.alice, gas: 1000000 });
      }},
    { name: "Make sure transaction failed",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          'test.bob.Result',
          test.bob,
          test.bob.Result,
          test.tx,
          { _value: false });

        assertBNEquals (
          'test.orisSpaceWrapper.getTransferLimit ()',
          '100000000000',
          test.orisSpaceWrapper.getTransferLimit ());
      }},
    { name: "Bob tries to set transfer limit to 100e9 but this is not less than current transfer limit",
      body: function (test) {
        assertBNEquals (
          'test.orisSpaceWrapper.getTransferLimit ()',
          '100000000000',
          test.orisSpaceWrapper.getTransferLimit ());

        personal.unlockAccount (test.alice, "");
        test.tx = test.bob.execute (
          test.orisSpaceWrapper.address,
          test.orisSpaceWrapper.setTransferLimit.getData ('100000000000'),
          0,
          { from: test.alice, gas: 1000000 });
      }},
    { name: "Make sure transaction failed",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          'test.bob.Result',
          test.bob,
          test.bob.Result,
          test.tx,
          { _value: false });

        assertBNEquals (
          'test.orisSpaceWrapper.getTransferLimit ()',
          '100000000000',
          test.orisSpaceWrapper.getTransferLimit ());
      }},
    { name: "Bob sets transfer limit to 100e9 - 1",
      body: function (test) {
        assertBNEquals (
          'test.orisSpaceWrapper.getTransferLimit ()',
          '100000000000',
          test.orisSpaceWrapper.getTransferLimit ());

        personal.unlockAccount (test.alice, "");
        test.tx = test.bob.execute (
          test.orisSpaceWrapper.address,
          test.orisSpaceWrapper.setTransferLimit.getData ('99999999999'),
          0,
          { from: test.alice, gas: 1000000 });
      }},
    { name: "Make sure transfer limit set successfully",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          'test.bob.Result',
          test.bob,
          test.bob.Result,
          test.tx,
          { _value: true });

        assertBNEquals (
          'test.orisSpaceWrapper.getTransferLimit ()',
          '99999999999',
          test.orisSpaceWrapper.getTransferLimit ());
      }},
    { name: "Bob sets transfer limit to 0.01e9",
      body: function (test) {
        assertBNEquals (
          'test.orisSpaceWrapper.getTransferLimit ()',
          '99999999999',
          test.orisSpaceWrapper.getTransferLimit ());

        personal.unlockAccount (test.alice, "");
        test.tx = test.bob.execute (
          test.orisSpaceWrapper.address,
          test.orisSpaceWrapper.setTransferLimit.getData ('10000000'),
          0,
          { from: test.alice, gas: 1000000 });
      }},
    { name: "Make sure transfer limit set successfully",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          'test.bob.Result',
          test.bob,
          test.bob.Result,
          test.tx,
          { _value: true });

        assertBNEquals (
          'test.orisSpaceWrapper.getTransferLimit ()',
          '10000000',
          test.orisSpaceWrapper.getTransferLimit ());
      }},
    { name: "Bob tries to send 1 Orgon token to Carol but smart contract is not started yet",
      body: function (test) {
        assertBNEquals (
          'test.orisSpaceWrapper.getTransferred (test.carol.address)',
          0,
          test.orisSpaceWrapper.getTransferred (test.carol.address));

        personal.unlockAccount (test.alice, "");
        test.tx = test.bob.execute (
          test.orisSpaceWrapper.address,
          test.orisSpaceWrapper.sendOrgonTokens.getData (test.carol.address, 1),
          0,
          { from: test.alice, gas: 1000000 });
      }},
    { name: "Make sure transaction failed",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          'test.bob.Result',
          test.bob,
          test.bob.Result,
          test.tx,
          { _value: false });

        assertEvents (
          'test.orisSpaceWrapper.Result',
          test.orisSpaceWrapper,
          test.orisSpaceWrapper.Result,
          test.tx);

        assertEvents (
          'test.simpleOrgonToken.Transfer',
          test.simpleOrgonToken,
          test.simpleOrgonToken.Transfer,
          test.tx);

        assertBNEquals (
          'test.orisSpaceWrapper.getTransferred (test.carol.address)',
          0,
          test.orisSpaceWrapper.getTransferred (test.carol.address));
      }},
    { name: "Bob tries to start smart contract but he is not the owner of Orgon Token",
      body: function (test) {
        personal.unlockAccount (test.alice, "");
        test.tx = test.bob.execute (
          test.orisSpaceWrapper.address,
          test.orisSpaceWrapper.start.getData (13),
          0,
          { from: test.alice, gas: 1000000 });
      }},
    { name: "Make sure transaction failed",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          'test.bob.Result',
          test.bob,
          test.bob.Result,
          test.tx,
          { _value: false });

        assertEvents (
          'test.simpleOrgonToken.Transfer',
          test.simpleOrgonToken,
          test.simpleOrgonToken.Transfer,
          test.tx);
      }},
    { name: "Alice tells Orgon Token to disable transfers",
      body: function (test) {
        personal.unlockAccount (test.alice, "");
        test.tx = test.simpleOrgonToken.setTransfersEnabled (
          false,
          { from: test.alice, gas: 1000000 });
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();
      }},
    { name: "Carol tries to start smart contract and requests 13 tokens but token transfers are disabled",
      body: function (test) {
        personal.unlockAccount (test.alice, "");
        test.tx = test.carol.execute (
          test.orisSpaceWrapper.address,
          test.orisSpaceWrapper.start.getData (13),
          0,
          { from: test.alice, gas: 1000000 });
      }},
    { name: "Make sure transaction failed",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          'test.carol.Result',
          test.carol,
          test.carol.Result,
          test.tx,
          { _value: false });

        assertEvents (
          'test.simpleOrgonToken.Transfer',
          test.simpleOrgonToken,
          test.simpleOrgonToken.Transfer,
          test.tx);
      }},
    { name: "Carol starts smart contract and requests 0 tokens",
      body: function (test) {
        personal.unlockAccount (test.alice, "");
        test.tx = test.carol.execute (
          test.orisSpaceWrapper.address,
          test.orisSpaceWrapper.start.getData (0),
          0,
          { from: test.alice, gas: 1000000 });
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          'test.carol.Result',
          test.carol,
          test.carol.Result,
          test.tx,
          { _value: true });

        assertEvents (
          'test.simpleOrgonToken.Transfer',
          test.simpleOrgonToken,
          test.simpleOrgonToken.Transfer,
          test.tx);
      }},
    { name: "Alice tells Oris Space to reset started flag",
      body: function (test) {
        personal.unlockAccount (test.alice, "");
        test.tx = test.orisSpaceWrapper.resetStarted (
          { from: test.alice, gas: 1000000 });
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();
      }},
    { name: "Alice tells Orgon Token to enable transfers",
      body: function (test) {
        personal.unlockAccount (test.alice, "");
        test.tx = test.simpleOrgonToken.setTransfersEnabled (
          true,
          { from: test.alice, gas: 1000000 });
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();
      }},
    { name: "Carol starts smart contract and requests 13 tokens",
      body: function (test) {
        personal.unlockAccount (test.alice, "");
        test.tx = test.carol.execute (
          test.orisSpaceWrapper.address,
          test.orisSpaceWrapper.start.getData (13),
          0,
          { from: test.alice, gas: 1000000 });
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          'test.carol.Result',
          test.carol,
          test.carol.Result,
          test.tx,
          { _value: true });

        assertEvents (
          'test.simpleOrgonToken.Transfer',
          test.simpleOrgonToken,
          test.simpleOrgonToken.Transfer,
          test.tx,
          {
            _from: test.orisSpaceWrapper.address,
            _to: test.carol.address,
            _value: 13
          });
      }},
    { name: "Carol tries to start smart contract and requests 13 tokens but smart contract is already started",
      body: function (test) {
        personal.unlockAccount (test.alice, "");
        test.tx = test.carol.execute (
          test.orisSpaceWrapper.address,
          test.orisSpaceWrapper.start.getData (13),
          0,
          { from: test.alice, gas: 1000000 });
      }},
    { name: "Make sure transaction failed",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          'test.carol.Result',
          test.carol,
          test.carol.Result,
          test.tx,
          { _value: false });

        assertEvents (
          'test.simpleOrgonToken.Transfer',
          test.simpleOrgonToken,
          test.simpleOrgonToken.Transfer,
          test.tx);
      }},
    { name: "Carol tries to send 1 orgon token to Bob but she is not the owner of smart contract",
      body: function (test) {
        personal.unlockAccount (test.alice, "");
        test.tx = test.carol.execute (
          test.orisSpaceWrapper.address,
          test.orisSpaceWrapper.sendOrgonTokens.getData (test.bob.address, 1),
          0,
          { from: test.alice, gas: 1000000 });
      }},
    { name: "Make sure transaction failed",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          'test.carol.Result',
          test.carol,
          test.carol.Result,
          test.tx,
          { _value: false });

        assertEvents (
          'test.simpleOrgonToken.Transfer',
          test.simpleOrgonToken,
          test.simpleOrgonToken.Transfer,
          test.tx);
      }},
    { name: "Alice tells Orgon Token to disable transfers",
      body: function (test) {
        personal.unlockAccount (test.alice, "");
        test.tx = test.simpleOrgonToken.setTransfersEnabled (
          false,
          { from: test.alice, gas: 1000000 });
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();
      }},
    { name: "Bob tries to send 1 Orgon token to Carol but token transfer are disabled",
      body: function (test) {
        assertBNEquals (
          'test.orisSpaceWrapper.getTransferred (test.carol.address)',
          0,
          test.orisSpaceWrapper.getTransferred (test.carol.address));

        personal.unlockAccount (test.alice, "");
        test.tx = test.bob.execute (
          test.orisSpaceWrapper.address,
          test.orisSpaceWrapper.sendOrgonTokens.getData (test.carol.address, 1),
          0,
          { from: test.alice, gas: 1000000 });
      }},
    { name: "Make sure transaction succeeded but no tokens were transferred",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          'test.bob.Result',
          test.bob,
          test.bob.Result,
          test.tx,
          { _value: true });

        assertEvents (
          'test.orisSpaceWrapper.Result',
          test.orisSpaceWrapper,
          test.orisSpaceWrapper.Result,
          test.tx,
          { _value: false });

        assertEvents (
          'test.simpleOrgonToken.Transfer',
          test.simpleOrgonToken,
          test.simpleOrgonToken.Transfer,
          test.tx);

        assertBNEquals (
          'test.orisSpaceWrapper.getTransferred (test.carol.address)',
          0,
          test.orisSpaceWrapper.getTransferred (test.carol.address));
      }},
    { name: "Alice tells Orgon Token to enable transfers",
      body: function (test) {
        personal.unlockAccount (test.alice, "");
        test.tx = test.simpleOrgonToken.setTransfersEnabled (
          true,
          { from: test.alice, gas: 1000000 });
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();
      }},
    { name: "Bob sends 1 Orgon token to Carol",
      body: function (test) {
        assertBNEquals (
          'test.orisSpaceWrapper.getTransferred (test.carol.address)',
          0,
          test.orisSpaceWrapper.getTransferred (test.carol.address));

        personal.unlockAccount (test.alice, "");
        test.tx = test.bob.execute (
          test.orisSpaceWrapper.address,
          test.orisSpaceWrapper.sendOrgonTokens.getData (test.carol.address, 1),
          0,
          { from: test.alice, gas: 1000000 });
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          'test.bob.Result',
          test.bob,
          test.bob.Result,
          test.tx,
          { _value: true });

        assertEvents (
          'test.orisSpaceWrapper.Result',
          test.orisSpaceWrapper,
          test.orisSpaceWrapper.Result,
          test.tx,
          { _value: true });

        assertEvents (
          'test.simpleOrgonToken.Transfer',
          test.simpleOrgonToken,
          test.simpleOrgonToken.Transfer,
          test.tx,
          {
            _from: test.orisSpaceWrapper.address,
            _to: test.carol.address,
            _value: 1
          });

        assertBNEquals (
          'test.orisSpaceWrapper.getTransferred (test.carol.address)',
          1,
          test.orisSpaceWrapper.getTransferred (test.carol.address));
      }},
    { name: "Bob tries to send 0.01e9 Orgon tokens to Carol but this would exceed transfer limit for Carol",
      body: function (test) {
        assertBNEquals (
          'test.orisSpaceWrapper.getTransferred (test.carol.address)',
          1,
          test.orisSpaceWrapper.getTransferred (test.carol.address));

        personal.unlockAccount (test.alice, "");
        test.tx = test.bob.execute (
          test.orisSpaceWrapper.address,
          test.orisSpaceWrapper.sendOrgonTokens.getData (
            test.carol.address, 10000000),
          0,
          { from: test.alice, gas: 1000000 });
      }},
    { name: "Make sure transaction failed",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          'test.bob.Result',
          test.bob,
          test.bob.Result,
          test.tx,
          { _value: false });

        assertEvents (
          'test.orisSpaceWrapper.Result',
          test.orisSpaceWrapper,
          test.orisSpaceWrapper.Result,
          test.tx);

        assertEvents (
          'test.simpleOrgonToken.Transfer',
          test.simpleOrgonToken,
          test.simpleOrgonToken.Transfer,
          test.tx);

        assertBNEquals (
          'test.orisSpaceWrapper.getTransferred (test.carol.address)',
          1,
          test.orisSpaceWrapper.getTransferred (test.carol.address));
      }},
    { name: "Bob sends 0.01e9 Orgon tokens to Dave",
      body: function (test) {
        assertBNEquals (
          'test.orisSpaceWrapper.getTransferred (test.dave.address)',
          0,
          test.orisSpaceWrapper.getTransferred (test.dave.address));

        personal.unlockAccount (test.alice, "");
        test.tx = test.bob.execute (
          test.orisSpaceWrapper.address,
          test.orisSpaceWrapper.sendOrgonTokens.getData (
            test.dave.address, 10000000),
          0,
          { from: test.alice, gas: 1000000 });
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          'test.bob.Result',
          test.bob,
          test.bob.Result,
          test.tx,
          { _value: true });

        assertEvents (
          'test.orisSpaceWrapper.Result',
          test.orisSpaceWrapper,
          test.orisSpaceWrapper.Result,
          test.tx,
          { _value: true });

        assertEvents (
          'test.simpleOrgonToken.Transfer',
          test.simpleOrgonToken,
          test.simpleOrgonToken.Transfer,
          test.tx,
          {
            _from: test.orisSpaceWrapper.address,
            _to: test.dave.address,
            _value: 10000000
          });

        assertBNEquals (
          'test.orisSpaceWrapper.getTransferred (test.dave.address)',
          10000000,
          test.orisSpaceWrapper.getTransferred (test.dave.address));
      }},
    { name: "Bob tries to send 1 Orgon token to Dave but this would exceed transfer limit for Dave",
      body: function (test) {
        assertBNEquals (
          'test.orisSpaceWrapper.getTransferred (test.dave.address)',
          10000000,
          test.orisSpaceWrapper.getTransferred (test.dave.address));

        personal.unlockAccount (test.alice, "");
        test.tx = test.bob.execute (
          test.orisSpaceWrapper.address,
          test.orisSpaceWrapper.sendOrgonTokens.getData (
            test.dave.address, 1),
          0,
          { from: test.alice, gas: 1000000 });
      }},
    { name: "Make sure transaction failed",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          'test.bob.Result',
          test.bob,
          test.bob.Result,
          test.tx,
          { _value: false });

        assertEvents (
          'test.orisSpaceWrapper.Result',
          test.orisSpaceWrapper,
          test.orisSpaceWrapper.Result,
          test.tx);

        assertEvents (
          'test.simpleOrgonToken.Transfer',
          test.simpleOrgonToken,
          test.simpleOrgonToken.Transfer,
          test.tx);

        assertBNEquals (
          'test.orisSpaceWrapper.getTransferred (test.dave.address)',
          10000000,
          test.orisSpaceWrapper.getTransferred (test.dave.address));
      }}
  ]});
