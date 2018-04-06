/*
 * Test for Abstract Token Smart Contract.
 * Copyright © 2017 by ABDK Consulting.
 * Author: Mikhail Vladimirov <mikhail.vladimirov@gmail.com>
 */

tests.push ({
  name: "AbstractToken",
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
    { name: "Alice deploys three Wallet contracts: Bob, Carol and Dave",
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
      }},
    { name: "Make sure contracts were deployed",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx1, test.tx2, test.tx3);
      },
      body: function (test) {
        miner.stop ();

        test.bob = getDeployedContract ("Bob", test.walletContract, test.tx1);
        test.carol = getDeployedContract ("Carol", test.walletContract, test.tx2);
        test.dave = getDeployedContract ("Dave", test.walletContract, test.tx3);
      }},
    { name: "Alice deploys AbstractTokenWrapper contract with Bob having 1000000 tokens",
      body: function (test) {
        var AbstractTokenWrapperCode =
          loadContractCode ("AbstractTokenWrapper");
        test.AbstractTokenWrapperContract =
          loadContract ("AbstractTokenWrapper");

        personal.unlockAccount (test.alice, "");
        test.tx = test.AbstractTokenWrapperContract.new (
          test.bob.address,
          1000000,
          {from: test.alice, data: AbstractTokenWrapperCode, gas:1000000}).
          transactionHash;
      }},
    { name: "Make sure contract was deployed and Bob now has 1000000 tokens",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        test.AbstractTokenWrapper = getDeployedContract (
          "AbstractTokenWrapper", test.AbstractTokenWrapperContract, test.tx);

        assertBNEquals (
            'test.AbstractTokenWrapper.balanceOf (test.bob.address)',
            1000000,
            test.AbstractTokenWrapper.balanceOf (test.bob.address));
      }},
    { name: "Bob transfers 1000 tokens to himself",
      body: function (test) {
        assertBNEquals (
            'test.AbstractTokenWrapper.balanceOf (test.bob.address)',
            1000000,
            test.AbstractTokenWrapper.balanceOf (test.bob.address));

        personal.unlockAccount (test.alice, "");
        test.tx = test.bob.execute (
          test.AbstractTokenWrapper.address,
          test.AbstractTokenWrapper.transfer.getData (
            test.bob.address,
            1000),
          0,
          {from: test.alice, gas: 1000000});
      }},
    { name: "Make sure transfer succeeded",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          'test.AbstractTokenWrapper.Transfer',
          test.AbstractTokenWrapper,
          test.AbstractTokenWrapper.Transfer,
          test.tx,
          {
            _from: test.bob.address,
            _to: test.bob.address,
            _value: 1000
          });

        assertEvents (
          'test.bob.Result',
          test.bob,
          test.bob.Result,
          test.tx,
          { _value: true });

        assertEvents (
          'test.AbstractTokenWrapper.Result',
          test.AbstractTokenWrapper,
          test.AbstractTokenWrapper.Result,
          test.tx,
          { _value: true });

        assertBNEquals (
            'test.AbstractTokenWrapper.balanceOf (test.bob.address)',
            1000000,
            test.AbstractTokenWrapper.balanceOf (test.bob.address));
      }},
    { name: "Bob transfers 0 tokens to Dave",
      body: function (test) {
        assertBNEquals (
            'test.AbstractTokenWrapper.balanceOf (test.bob.address)',
            1000000,
            test.AbstractTokenWrapper.balanceOf (test.bob.address));

        assertBNEquals (
            'test.AbstractTokenWrapper.balanceOf (test.dave.address)',
            0,
            test.AbstractTokenWrapper.balanceOf (test.dave.address));

        personal.unlockAccount (test.alice, "");
        test.tx = test.bob.execute (
          test.AbstractTokenWrapper.address,
          test.AbstractTokenWrapper.transfer.getData (
            test.dave.address,
            0),
          0,
          {from: test.alice, gas: 1000000});
      }},
    { name: "Make sure transfer succeeded",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          'test.AbstractTokenWrapper.Transfer',
          test.AbstractTokenWrapper,
          test.AbstractTokenWrapper.Transfer,
          test.tx,
          {
            _from: test.bob.address,
            _to: test.dave.address,
            _value: 0
          });

        assertEvents (
          'test.bob.Result',
          test.bob,
          test.bob.Result,
          test.tx,
          { _value: true });

        assertEvents (
          'test.AbstractTokenWrapper.Result',
          test.AbstractTokenWrapper,
          test.AbstractTokenWrapper.Result,
          test.tx,
          { _value: true });

        assertBNEquals (
            'test.AbstractTokenWrapper.balanceOf (test.bob.address)',
            1000000,
            test.AbstractTokenWrapper.balanceOf (test.bob.address));

        assertBNEquals (
            'test.AbstractTokenWrapper.balanceOf (test.dave.address)',
            0,
            test.AbstractTokenWrapper.balanceOf (test.dave.address));
      }},
    { name: "Bob allows Carol to transfer 1000 of his tokens",
      body: function (test) {
        assertBNEquals (
          'test.AbstractTokenWrapper.allowance (test.bob.address, test.carol.address)',
          0,
          test.AbstractTokenWrapper.allowance (test.bob.address, test.carol.address));

        personal.unlockAccount (test.alice, "");
        test.tx = test.bob.execute (
          test.AbstractTokenWrapper.address,
          test.AbstractTokenWrapper.approve.getData (
            test.carol.address,
            1000),
          0,
          {from: test.alice, gas: 1000000});
      }},
    { name: "Make sure Carol is now allowed to transfer 1000 of Bob's tokens",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          'test.AbstractTokenWrapper.Approval',
          test.AbstractTokenWrapper,
          test.AbstractTokenWrapper.Approval,
          test.tx,
          {
            _owner: test.bob.address,
            _spender: test.carol.address,
            _value: 1000
          });

        assertEvents (
          'test.bob.Result',
          test.bob,
          test.bob.Result,
          test.tx,
          { _value: true });

        assertEvents (
          'test.AbstractTokenWrapper.Result',
          test.AbstractTokenWrapper,
          test.AbstractTokenWrapper.Result,
          test.tx,
          { _value: true });

        assertBNEquals (
          'test.AbstractTokenWrapper.allowance (test.bob.address, test.carol.address)',
          1000,
          test.AbstractTokenWrapper.allowance (test.bob.address, test.carol.address));
      }},
    { name: "Carol transfers 100 Bob's tokens to himself",
      body: function (test) {
        assertBNEquals (
          'test.AbstractTokenWrapper.allowance (test.bob.address, test.carol.address)',
          1000,
          test.AbstractTokenWrapper.allowance (test.bob.address, test.carol.address));

        assertBNEquals (
          'test.AbstractTokenWrapper.balanceOf (test.bob.address)',
          1000000,
          test.AbstractTokenWrapper.balanceOf (test.bob.address));

        personal.unlockAccount (test.alice, "");
        test.tx = test.carol.execute (
          test.AbstractTokenWrapper.address,
          test.AbstractTokenWrapper.transferFrom.getData (
            test.bob.address,
            test.bob.address,
            100),
          0,
          {from: test.alice, gas: 1000000});
      }},
    { name: "Make sure transfer succeeded",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          'test.AbstractTokenWrapper.Transfer',
          test.AbstractTokenWrapper,
          test.AbstractTokenWrapper.Transfer,
          test.tx,
          {
            _from: test.bob.address,
            _to: test.bob.address,
            _value: 100
          });

        assertEvents (
          'test.carol.Result',
          test.carol,
          test.carol.Result,
          test.tx,
          { _value: true });

        assertEvents (
          'test.AbstractTokenWrapper.Result',
          test.AbstractTokenWrapper,
          test.AbstractTokenWrapper.Result,
          test.tx,
          { _value: true });

        assertBNEquals (
          'test.AbstractTokenWrapper.allowance (test.bob.address, test.carol.address)',
          900,
          test.AbstractTokenWrapper.allowance (test.bob.address, test.carol.address));

        assertBNEquals (
          'test.AbstractTokenWrapper.balanceOf (test.bob.address)',
          1000000,
          test.AbstractTokenWrapper.balanceOf (test.bob.address));
      }},
    { name: "Carol transfers 0 Bob's tokens to Dave",
      body: function (test) {
        assertBNEquals (
          'test.AbstractTokenWrapper.allowance (test.bob.address, test.carol.address)',
          900,
          test.AbstractTokenWrapper.allowance (test.bob.address, test.carol.address));

        assertBNEquals (
          'test.AbstractTokenWrapper.balanceOf (test.bob.address)',
          1000000,
          test.AbstractTokenWrapper.balanceOf (test.bob.address));

        assertBNEquals (
          'test.AbstractTokenWrapper.balanceOf (test.dave.address)',
          0,
          test.AbstractTokenWrapper.balanceOf (test.dave.address));

        personal.unlockAccount (test.alice, "");
        test.tx = test.carol.execute (
          test.AbstractTokenWrapper.address,
          test.AbstractTokenWrapper.transferFrom.getData (
            test.bob.address,
            test.dave.address,
            0),
          0,
          {from: test.alice, gas: 1000000});
      }},
    { name: "Make sure transfer succeeded",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          'test.AbstractTokenWrapper.Transfer',
          test.AbstractTokenWrapper,
          test.AbstractTokenWrapper.Transfer,
          test.tx,
          {
            _from: test.bob.address,
            _to: test.dave.address,
            _value: 0
          });

        assertEvents (
          'test.carol.Result',
          test.carol,
          test.carol.Result,
          test.tx,
          { _value: true });

        assertEvents (
          'test.AbstractTokenWrapper.Result',
          test.AbstractTokenWrapper,
          test.AbstractTokenWrapper.Result,
          test.tx,
          { _value: true });

        assertBNEquals (
          'test.AbstractTokenWrapper.allowance (test.bob.address, test.carol.address)',
          900,
          test.AbstractTokenWrapper.allowance (test.bob.address, test.carol.address));

        assertBNEquals (
          'test.AbstractTokenWrapper.balanceOf (test.bob.address)',
          1000000,
          test.AbstractTokenWrapper.balanceOf (test.bob.address));

        assertBNEquals (
          'test.AbstractTokenWrapper.balanceOf (test.dave.address)',
          0,
          test.AbstractTokenWrapper.balanceOf (test.dave.address));
      }},
    { name: "Dave tries to transfer 1000 tokens to himself while he does not have any tokens",
      body: function (test) {
        assertBNEquals (
          'test.AbstractTokenWrapper.balanceOf (test.dave.address)',
          0,
          test.AbstractTokenWrapper.balanceOf (test.dave.address));

        personal.unlockAccount (test.alice, "");
        test.tx = test.dave.execute (
          test.AbstractTokenWrapper.address,
          test.AbstractTokenWrapper.transfer.getData (
            test.dave.address,
            1000),
          0,
          {from: test.alice, gas: 1000000});
      }},
    { name: "Make sure transfer failed",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          'test.AbstractTokenWrapper.Transfer',
          test.AbstractTokenWrapper,
          test.AbstractTokenWrapper.Transfer,
          test.tx);

        assertEvents (
          'test.dave.Result',
          test.dave,
          test.dave.Result,
          test.tx,
          { _value: true });

        assertEvents (
          'test.AbstractTokenWrapper.Result',
          test.AbstractTokenWrapper,
          test.AbstractTokenWrapper.Result,
          test.tx,
          { _value: false });

        assertBNEquals (
          'test.AbstractTokenWrapper.balanceOf (test.dave.address)',
          0,
          test.AbstractTokenWrapper.balanceOf (test.dave.address));
      }},
    { name: "Dave tries to transfer 1000 tokens to Bob while Dave does not have any tokens",
      body: function (test) {
        assertBNEquals (
          'test.AbstractTokenWrapper.balanceOf (test.dave.address)',
          0,
          test.AbstractTokenWrapper.balanceOf (test.dave.address));

        personal.unlockAccount (test.alice, "");
        test.tx = test.dave.execute (
          test.AbstractTokenWrapper.address,
          test.AbstractTokenWrapper.transfer.getData (
            test.bob.address,
            1000),
          0,
          {from: test.alice, gas: 1000000});
      }},
    { name: "Make sure transfer failed",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          'test.AbstractTokenWrapper.Transfer',
          test.AbstractTokenWrapper,
          test.AbstractTokenWrapper.Transfer,
          test.tx);

        assertEvents (
          'test.dave.Result',
          test.dave,
          test.dave.Result,
          test.tx,
          { _value: true });

        assertEvents (
          'test.AbstractTokenWrapper.Result',
          test.AbstractTokenWrapper,
          test.AbstractTokenWrapper.Result,
          test.tx,
          { _value: false });

        assertBNEquals (
          'test.AbstractTokenWrapper.balanceOf (test.dave.address)',
          0,
          test.AbstractTokenWrapper.balanceOf (test.dave.address));
      }},
    { name: "Dave transfers 0 tokens to Bob",
      body: function (test) {
        assertBNEquals (
          'test.AbstractTokenWrapper.balanceOf (test.bob.address)',
          1000000,
          test.AbstractTokenWrapper.balanceOf (test.bob.address));

        assertBNEquals (
          'test.AbstractTokenWrapper.balanceOf (test.dave.address)',
          0,
          test.AbstractTokenWrapper.balanceOf (test.dave.address));

        personal.unlockAccount (test.alice, "");
        test.tx = test.dave.execute (
          test.AbstractTokenWrapper.address,
          test.AbstractTokenWrapper.transfer.getData (
            test.bob.address,
            0),
          0,
          {from: test.alice, gas: 1000000});
      }},
    { name: "Make sure transfer succeeded",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          'test.AbstractTokenWrapper.Transfer',
          test.AbstractTokenWrapper,
          test.AbstractTokenWrapper.Transfer,
          test.tx,
          {
            _from: test.dave.address,
            _to: test.bob.address,
            _value: 0
          });

        assertEvents (
          'test.dave.Result',
          test.dave,
          test.dave.Result,
          test.tx,
          { _value: true });

        assertEvents (
          'test.AbstractTokenWrapper.Result',
          test.AbstractTokenWrapper,
          test.AbstractTokenWrapper.Result,
          test.tx,
          { _value: true });

        assertBNEquals (
          'test.AbstractTokenWrapper.balanceOf (test.bob.address)',
          1000000,
          test.AbstractTokenWrapper.balanceOf (test.bob.address));

        assertBNEquals (
          'test.AbstractTokenWrapper.balanceOf (test.dave.address)',
          0,
          test.AbstractTokenWrapper.balanceOf (test.dave.address));
      }},
    { name: "Dave allows Carol to transfer 1000 of his tokens",
      body: function (test) {
        assertBNEquals (
          'test.AbstractTokenWrapper.allowance (test.dave.address, test.carol.address)',
          0,
          test.AbstractTokenWrapper.allowance (test.dave.address, test.carol.address));

        personal.unlockAccount (test.alice, "");
        test.tx = test.dave.execute (
          test.AbstractTokenWrapper.address,
          test.AbstractTokenWrapper.approve.getData (
            test.carol.address,
            1000),
          0,
          {from: test.alice, gas: 1000000});
      }},
    { name: "Make sure Carol is now allowed to transfer 1000 of Dave's tokens",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          'test.AbstractTokenWrapper.Approval',
          test.AbstractTokenWrapper,
          test.AbstractTokenWrapper.Approval,
          test.tx,
          {
            _owner: test.dave.address,
            _spender: test.carol.address,
            _value: 1000
          });

        assertEvents (
          'test.dave.Result',
          test.dave,
          test.dave.Result,
          test.tx,
          { _value: true });

        assertEvents (
          'test.AbstractTokenWrapper.Result',
          test.AbstractTokenWrapper,
          test.AbstractTokenWrapper.Result,
          test.tx,
          { _value: true });

        assertBNEquals (
          'test.AbstractTokenWrapper.allowance (test.dave.address, test.carol.address)',
          1000,
          test.AbstractTokenWrapper.allowance (test.dave.address, test.carol.address));
      }},
    { name: "Carol tries to transfer 100 Dave's tokens to himself while Dave does not have any tokens",
      body: function (test) {
        assertBNEquals (
          'test.AbstractTokenWrapper.allowance (test.dave.address, test.carol.address)',
          1000,
          test.AbstractTokenWrapper.allowance (test.dave.address, test.carol.address));

        assertBNEquals (
          'test.AbstractTokenWrapper.balanceOf (test.dave.address)',
          0,
          test.AbstractTokenWrapper.balanceOf (test.dave.address));

        personal.unlockAccount (test.alice, "");
        test.tx = test.carol.execute (
          test.AbstractTokenWrapper.address,
          test.AbstractTokenWrapper.transferFrom.getData (
            test.dave.address,
            test.dave.address,
            100),
          0,
          {from: test.alice, gas: 1000000});
      }},
    { name: "Make sure transfer failed",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          'test.AbstractTokenWrapper.Transfer',
          test.AbstractTokenWrapper,
          test.AbstractTokenWrapper.Transfer,
          test.tx);

        assertEvents (
          'test.carol.Result',
          test.carol,
          test.carol.Result,
          test.tx,
          { _value: true });

        assertEvents (
          'test.AbstractTokenWrapper.Result',
          test.AbstractTokenWrapper,
          test.AbstractTokenWrapper.Result,
          test.tx,
          { _value: false });

        assertBNEquals (
          'test.AbstractTokenWrapper.allowance (test.dave.address, test.carol.address)',
          1000,
          test.AbstractTokenWrapper.allowance (test.dave.address, test.carol.address));

        assertBNEquals (
          'test.AbstractTokenWrapper.balanceOf (test.dave.address)',
          0,
          test.AbstractTokenWrapper.balanceOf (test.dave.address));
      }},
    { name: "Carol transfers 0 Daves's tokens to Bob",
      body: function (test) {
        assertBNEquals (
          'test.AbstractTokenWrapper.allowance (test.dave.address, test.carol.address)',
          1000,
          test.AbstractTokenWrapper.allowance (test.dave.address, test.carol.address));

        assertBNEquals (
          'test.AbstractTokenWrapper.balanceOf (test.bob.address)',
          1000000,
          test.AbstractTokenWrapper.balanceOf (test.bob.address));

        assertBNEquals (
          'test.AbstractTokenWrapper.balanceOf (test.dave.address)',
          0,
          test.AbstractTokenWrapper.balanceOf (test.dave.address));

        personal.unlockAccount (test.alice, "");
        test.tx = test.carol.execute (
          test.AbstractTokenWrapper.address,
          test.AbstractTokenWrapper.transferFrom.getData (
            test.dave.address,
            test.bob.address,
            0),
          0,
          {from: test.alice, gas: 1000000});
      }},
    { name: "Make sure transfer succeeded",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          'test.AbstractTokenWrapper.Transfer',
          test.AbstractTokenWrapper,
          test.AbstractTokenWrapper.Transfer,
          test.tx,
          {
            _from: test.dave.address,
            _to: test.bob.address,
            _value: 0
          });

        assertEvents (
          'test.carol.Result',
          test.carol,
          test.carol.Result,
          test.tx,
          { _value: true });

        assertEvents (
          'test.AbstractTokenWrapper.Result',
          test.AbstractTokenWrapper,
          test.AbstractTokenWrapper.Result,
          test.tx,
          { _value: true });

        assertBNEquals (
          'test.AbstractTokenWrapper.allowance (test.dave.address, test.carol.address)',
          1000,
          test.AbstractTokenWrapper.allowance (test.dave.address, test.carol.address));

        assertBNEquals (
          'test.AbstractTokenWrapper.balanceOf (test.bob.address)',
          1000000,
          test.AbstractTokenWrapper.balanceOf (test.bob.address));

        assertBNEquals (
          'test.AbstractTokenWrapper.balanceOf (test.dave.address)',
          0,
          test.AbstractTokenWrapper.balanceOf (test.dave.address));
      }},
    { name: "Bob transfers 1000 tokens to Dave",
      body: function (test) {
        assertBNEquals (
          'test.AbstractTokenWrapper.totalSupply ()',
          1000000,
          test.AbstractTokenWrapper.totalSupply ());

        assertBNEquals (
          'test.AbstractTokenWrapper.balanceOf (test.bob.address)',
          1000000,
          test.AbstractTokenWrapper.balanceOf (test.bob.address));

        assertBNEquals (
          'test.AbstractTokenWrapper.balanceOf (test.dave.address)',
          0,
          test.AbstractTokenWrapper.balanceOf (test.dave.address));

        personal.unlockAccount (test.alice, "");
        test.tx = test.bob.execute (
          test.AbstractTokenWrapper.address,
          test.AbstractTokenWrapper.transfer.getData (
            test.dave.address,
            1000),
          0,
          {from: test.alice, gas: 1000000});
      }},
    { name: "Make sure transfer succeeded",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          'test.AbstractTokenWrapper.Transfer',
          test.AbstractTokenWrapper,
          test.AbstractTokenWrapper.Transfer,
          test.tx,
          {
            _from: test.bob.address,
            _to: test.dave.address,
            _value: 1000
          });


        assertEvents (
          'test.bob.Result',
          test.bob,
          test.bob.Result,
          test.tx,
          { _value: true });

        assertEvents (
          'test.AbstractTokenWrapper.Result',
          test.AbstractTokenWrapper,
          test.AbstractTokenWrapper.Result,
          test.tx,
          { _value: true });

        assertBNEquals (
          'test.AbstractTokenWrapper.totalSupply ()',
          1000000,
          test.AbstractTokenWrapper.totalSupply ());

        assertBNEquals (
          'test.AbstractTokenWrapper.balanceOf (test.bob.address)',
          999000,
          test.AbstractTokenWrapper.balanceOf (test.bob.address));

        assertBNEquals (
          'test.AbstractTokenWrapper.balanceOf (test.dave.address)',
          1000,
          test.AbstractTokenWrapper.balanceOf (test.dave.address));
      }},
    { name: "Carol transfers 100 Bob's tokens to Dave",
      body: function (test) {
        assertBNEquals (
          'test.AbstractTokenWrapper.totalSupply ()',
          1000000,
          test.AbstractTokenWrapper.totalSupply ());

        assertBNEquals (
          'test.AbstractTokenWrapper.allowance (test.bob.address, test.carol.address)',
          900,
          test.AbstractTokenWrapper.allowance (test.bob.address, test.carol.address));

        assertBNEquals (
          'test.AbstractTokenWrapper.balanceOf (test.bob.address)',
          999000,
          test.AbstractTokenWrapper.balanceOf (test.bob.address));

        assertBNEquals (
          'test.AbstractTokenWrapper.balanceOf (test.dave.address)',
          1000,
          test.AbstractTokenWrapper.balanceOf (test.dave.address));

        personal.unlockAccount (test.alice, "");
        test.tx = test.carol.execute (
          test.AbstractTokenWrapper.address,
          test.AbstractTokenWrapper.transferFrom.getData (
            test.bob.address,
            test.dave.address,
            100),
          0,
          {from: test.alice, gas: 1000000});
      }},
    { name: "Make sure transfer succeeded",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          'test.AbstractTokenWrapper.Transfer',
          test.AbstractTokenWrapper,
          test.AbstractTokenWrapper.Transfer,
          test.tx,
          {
            _from: test.bob.address,
            _to: test.dave.address,
            _value: 100
          });


        assertEvents (
          'test.carol.Result',
          test.carol,
          test.carol.Result,
          test.tx,
          { _value: true });

        assertEvents (
          'test.AbstractTokenWrapper.Result',
          test.AbstractTokenWrapper,
          test.AbstractTokenWrapper.Result,
          test.tx,
          { _value: true });

        assertBNEquals (
          'test.AbstractTokenWrapper.totalSupply ()',
          1000000,
          test.AbstractTokenWrapper.totalSupply ());

        assertBNEquals (
          'test.AbstractTokenWrapper.allowance (test.bob.address, test.carol.address)',
          800,
          test.AbstractTokenWrapper.allowance (test.bob.address, test.carol.address));

        assertBNEquals (
          'test.AbstractTokenWrapper.balanceOf (test.bob.address)',
          998900,
          test.AbstractTokenWrapper.balanceOf (test.bob.address));

        assertBNEquals (
          'test.AbstractTokenWrapper.balanceOf (test.dave.address)',
          1100,
          test.AbstractTokenWrapper.balanceOf (test.dave.address));
      }},
    { name: "Dave tries to transfer 1101 tokens to Carol while having only 1100 tokens",
      body: function (test) {
        assertBNEquals (
          'test.AbstractTokenWrapper.balanceOf (test.carol.address)',
          0,
          test.AbstractTokenWrapper.balanceOf (test.carol.address));

        assertBNEquals (
          'test.AbstractTokenWrapper.balanceOf (test.dave.address)',
          1100,
          test.AbstractTokenWrapper.balanceOf (test.dave.address));

        personal.unlockAccount (test.alice, "");
        test.tx = test.dave.execute (
          test.AbstractTokenWrapper.address,
          test.AbstractTokenWrapper.transfer.getData (
            test.carol.address,
            1101),
          0,
          {from: test.alice, gas: 1000000});
      }},
    { name: "Make sure transfer failed",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          'test.AbstractTokenWrapper.Transfer',
          test.AbstractTokenWrapper,
          test.AbstractTokenWrapper.Transfer,
          test.tx);

        assertEvents (
          'test.dave.Result',
          test.dave,
          test.dave.Result,
          test.tx,
          { _value: true });

        assertEvents (
          'test.AbstractTokenWrapper.Result',
          test.AbstractTokenWrapper,
          test.AbstractTokenWrapper.Result,
          test.tx,
          { _value: false });

        assertBNEquals (
          'test.AbstractTokenWrapper.balanceOf (test.carol.address)',
          0,
          test.AbstractTokenWrapper.balanceOf (test.carol.address));

        assertBNEquals (
          'test.AbstractTokenWrapper.balanceOf (test.dave.address)',
          1100,
          test.AbstractTokenWrapper.balanceOf (test.dave.address));
      }},
    { name: "Dave transfers 100 tokens to Carol",
      body: function (test) {
        assertBNEquals (
          'test.AbstractTokenWrapper.balanceOf (test.carol.address)',
          0,
          test.AbstractTokenWrapper.balanceOf (test.carol.address));

        assertBNEquals (
          'test.AbstractTokenWrapper.balanceOf (test.dave.address)',
          1100,
          test.AbstractTokenWrapper.balanceOf (test.dave.address));

        personal.unlockAccount (test.alice, "");
        test.tx = test.dave.execute (
          test.AbstractTokenWrapper.address,
          test.AbstractTokenWrapper.transfer.getData (
            test.carol.address,
            100),
          0,
          {from: test.alice, gas: 1000000});
      }},
    { name: "Make sure transfer succeeded",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          'test.AbstractTokenWrapper.Transfer',
          test.AbstractTokenWrapper,
          test.AbstractTokenWrapper.Transfer,
          test.tx,
          {
            _from: test.dave.address,
            _to: test.carol.address,
            _value: 100
          });


        assertEvents (
          'test.dave.Result',
          test.dave,
          test.dave.Result,
          test.tx,
          { _value: true });

        assertEvents (
          'test.AbstractTokenWrapper.Result',
          test.AbstractTokenWrapper,
          test.AbstractTokenWrapper.Result,
          test.tx,
          { _value: true });

        assertBNEquals (
          'test.AbstractTokenWrapper.balanceOf (test.carol.address)',
          100,
          test.AbstractTokenWrapper.balanceOf (test.carol.address));

        assertBNEquals (
          'test.AbstractTokenWrapper.balanceOf (test.dave.address)',
          1000,
          test.AbstractTokenWrapper.balanceOf (test.dave.address));
      }},
    { name: "Dave transfers 0 tokens to Carol",
      body: function (test) {
        assertBNEquals (
          'test.AbstractTokenWrapper.balanceOf (test.carol.address)',
          100,
          test.AbstractTokenWrapper.balanceOf (test.carol.address));

        assertBNEquals (
          'test.AbstractTokenWrapper.balanceOf (test.dave.address)',
          1000,
          test.AbstractTokenWrapper.balanceOf (test.dave.address));

        personal.unlockAccount (test.alice, "");
        test.tx = test.dave.execute (
          test.AbstractTokenWrapper.address,
          test.AbstractTokenWrapper.transfer.getData (
            test.carol.address,
            0),
          0,
          {from: test.alice, gas: 1000000});
      }},
    { name: "Make sure transfer succeeded",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          'test.AbstractTokenWrapper.Transfer',
          test.AbstractTokenWrapper,
          test.AbstractTokenWrapper.Transfer,
          test.tx,
          {
            _from: test.dave.address,
            _to: test.carol.address,
            _value: 0
          });

        assertEvents (
          'test.dave.Result',
          test.dave,
          test.dave.Result,
          test.tx,
          { _value: true });

        assertEvents (
          'test.AbstractTokenWrapper.Result',
          test.AbstractTokenWrapper,
          test.AbstractTokenWrapper.Result,
          test.tx,
          { _value: true });

        assertBNEquals (
          'test.AbstractTokenWrapper.balanceOf (test.carol.address)',
          100,
          test.AbstractTokenWrapper.balanceOf (test.carol.address));

        assertBNEquals (
          'test.AbstractTokenWrapper.balanceOf (test.dave.address)',
          1000,
          test.AbstractTokenWrapper.balanceOf (test.dave.address));
      }},
    { name: "Dave tries to transfer 1001 tokens to himself while having only 1000 tokens",
      body: function (test) {
        assertBNEquals (
          'test.AbstractTokenWrapper.balanceOf (test.dave.address)',
          1000,
          test.AbstractTokenWrapper.balanceOf (test.dave.address));

        personal.unlockAccount (test.alice, "");
        test.tx = test.dave.execute (
          test.AbstractTokenWrapper.address,
          test.AbstractTokenWrapper.transfer.getData (
            test.dave.address,
            1001),
          0,
          {from: test.alice, gas: 1000000});
      }},
    { name: "Make sure transfer failed",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          'test.AbstractTokenWrapper.Transfer',
          test.AbstractTokenWrapper,
          test.AbstractTokenWrapper.Transfer,
          test.tx);

        assertEvents (
          'test.dave.Result',
          test.dave,
          test.dave.Result,
          test.tx,
          { _value: true });

        assertEvents (
          'test.AbstractTokenWrapper.Result',
          test.AbstractTokenWrapper,
          test.AbstractTokenWrapper.Result,
          test.tx,
          { _value: false });

        assertBNEquals (
          'test.AbstractTokenWrapper.balanceOf (test.dave.address)',
          1000,
          test.AbstractTokenWrapper.balanceOf (test.dave.address));
      }},
    { name: "Dave transfers 100 tokens to himself",
      body: function (test) {
        assertBNEquals (
          'test.AbstractTokenWrapper.balanceOf (test.dave.address)',
          1000,
          test.AbstractTokenWrapper.balanceOf (test.dave.address));

        personal.unlockAccount (test.alice, "");
        test.tx = test.dave.execute (
          test.AbstractTokenWrapper.address,
          test.AbstractTokenWrapper.transfer.getData (
            test.dave.address,
            100),
          0,
          {from: test.alice, gas: 1000000});
      }},
    { name: "Make sure transfer succeeded",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          'test.AbstractTokenWrapper.Transfer',
          test.AbstractTokenWrapper,
          test.AbstractTokenWrapper.Transfer,
          test.tx,
          {
            _from: test.dave.address,
            _to: test.dave.address,
            _value: 100
          });

        assertEvents (
          'test.dave.Result',
          test.dave,
          test.dave.Result,
          test.tx,
          { _value: true });

        assertEvents (
          'test.AbstractTokenWrapper.Result',
          test.AbstractTokenWrapper,
          test.AbstractTokenWrapper.Result,
          test.tx,
          { _value: true });

        assertBNEquals (
          'test.AbstractTokenWrapper.balanceOf (test.dave.address)',
          1000,
          test.AbstractTokenWrapper.balanceOf (test.dave.address));
      }},
    { name: "Dave tries to transfer 1001 tokens to Bob while having only 1000 tokens",
      body: function (test) {
        assertBNEquals (
          'test.AbstractTokenWrapper.totalSupply ()',
          1000000,
          test.AbstractTokenWrapper.totalSupply ());

        assertBNEquals (
          'test.AbstractTokenWrapper.balanceOf (test.bob.address)',
          998900,
          test.AbstractTokenWrapper.balanceOf (test.bob.address));

        assertBNEquals (
          'test.AbstractTokenWrapper.balanceOf (test.dave.address)',
          1000,
          test.AbstractTokenWrapper.balanceOf (test.dave.address));

        personal.unlockAccount (test.alice, "");
        test.tx = test.dave.execute (
          test.AbstractTokenWrapper.address,
          test.AbstractTokenWrapper.transfer.getData (
            test.bob.address,
            1001),
          0,
          {from: test.alice, gas: 1000000});
      }},
    { name: "Make sure transfer failed",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          'test.AbstractTokenWrapper.Transfer',
          test.AbstractTokenWrapper,
          test.AbstractTokenWrapper.Transfer,
          test.tx);

        assertEvents (
          'test.dave.Result',
          test.dave,
          test.dave.Result,
          test.tx,
          { _value: true });

        assertEvents (
          'test.AbstractTokenWrapper.Result',
          test.AbstractTokenWrapper,
          test.AbstractTokenWrapper.Result,
          test.tx,
          { _value: false });

        assertBNEquals (
          'test.AbstractTokenWrapper.totalSupply ()',
          1000000,
          test.AbstractTokenWrapper.totalSupply ());

        assertBNEquals (
          'test.AbstractTokenWrapper.balanceOf (test.bob.address)',
          998900,
          test.AbstractTokenWrapper.balanceOf (test.bob.address));

        assertBNEquals (
          'test.AbstractTokenWrapper.balanceOf (test.dave.address)',
          1000,
          test.AbstractTokenWrapper.balanceOf (test.dave.address));
      }},
    { name: "Dave transfers 100 tokens to Bob",
      body: function (test) {
        assertBNEquals (
          'test.AbstractTokenWrapper.totalSupply ()',
          1000000,
          test.AbstractTokenWrapper.totalSupply ());

        assertBNEquals (
          'test.AbstractTokenWrapper.balanceOf (test.bob.address)',
          998900,
          test.AbstractTokenWrapper.balanceOf (test.bob.address));

        assertBNEquals (
          'test.AbstractTokenWrapper.balanceOf (test.dave.address)',
          1000,
          test.AbstractTokenWrapper.balanceOf (test.dave.address));

        personal.unlockAccount (test.alice, "");
        test.tx = test.dave.execute (
          test.AbstractTokenWrapper.address,
          test.AbstractTokenWrapper.transfer.getData (
            test.bob.address,
            100),
          0,
          {from: test.alice, gas: 1000000});
      }},
    { name: "Make sure transfer succeeded",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          'test.AbstractTokenWrapper.Transfer',
          test.AbstractTokenWrapper,
          test.AbstractTokenWrapper.Transfer,
          test.tx,
          {
            _from: test.dave.address,
            _to: test.bob.address,
            _value: 100
          });


        assertEvents (
          'test.dave.Result',
          test.dave,
          test.dave.Result,
          test.tx,
          { _value: true });

        assertEvents (
          'test.AbstractTokenWrapper.Result',
          test.AbstractTokenWrapper,
          test.AbstractTokenWrapper.Result,
          test.tx,
          { _value: true });

        assertBNEquals (
          'test.AbstractTokenWrapper.totalSupply ()',
          1000000,
          test.AbstractTokenWrapper.totalSupply ());

        assertBNEquals (
          'test.AbstractTokenWrapper.balanceOf (test.bob.address)',
          999000,
          test.AbstractTokenWrapper.balanceOf (test.bob.address));

        assertBNEquals (
          'test.AbstractTokenWrapper.balanceOf (test.dave.address)',
          900,
          test.AbstractTokenWrapper.balanceOf (test.dave.address));
      }},
    { name: "Carol tries to transfer 901 Dave's tokens to Carol while Dave has only 900 tokens",
      body: function (test) {
        assertBNEquals (
          'test.AbstractTokenWrapper.allowance (test.dave.address, test.carol.address)',
          1000,
          test.AbstractTokenWrapper.allowance (test.dave.address, test.carol.address));

        assertBNEquals (
          'test.AbstractTokenWrapper.balanceOf (test.carol.address)',
          100,
          test.AbstractTokenWrapper.balanceOf (test.carol.address));

        assertBNEquals (
          'test.AbstractTokenWrapper.balanceOf (test.dave.address)',
          900,
          test.AbstractTokenWrapper.balanceOf (test.dave.address));

        personal.unlockAccount (test.alice, "");
        test.tx = test.carol.execute (
          test.AbstractTokenWrapper.address,
          test.AbstractTokenWrapper.transferFrom.getData (
            test.dave.address,
            test.carol.address,
            901),
          0,
          {from: test.alice, gas: 1000000});
      }},
    { name: "Make sure transfer failed",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          'test.AbstractTokenWrapper.Transfer',
          test.AbstractTokenWrapper,
          test.AbstractTokenWrapper.Transfer,
          test.tx);

        assertEvents (
          'test.carol.Result',
          test.carol,
          test.carol.Result,
          test.tx,
          { _value: true });

        assertEvents (
          'test.AbstractTokenWrapper.Result',
          test.AbstractTokenWrapper,
          test.AbstractTokenWrapper.Result,
          test.tx,
          { _value: false });

        assertBNEquals (
          'test.AbstractTokenWrapper.allowance (test.dave.address, test.carol.address)',
          1000,
          test.AbstractTokenWrapper.allowance (test.dave.address, test.carol.address));

        assertBNEquals (
          'test.AbstractTokenWrapper.balanceOf (test.carol.address)',
          100,
          test.AbstractTokenWrapper.balanceOf (test.carol.address));

        assertBNEquals (
          'test.AbstractTokenWrapper.balanceOf (test.dave.address)',
          900,
          test.AbstractTokenWrapper.balanceOf (test.dave.address));
      }},
    { name: "Carol transfer 100 Dave's tokens to Carol",
      body: function (test) {
        assertBNEquals (
          'test.AbstractTokenWrapper.allowance (test.dave.address, test.carol.address)',
          1000,
          test.AbstractTokenWrapper.allowance (test.dave.address, test.carol.address));

        assertBNEquals (
          'test.AbstractTokenWrapper.balanceOf (test.carol.address)',
          100,
          test.AbstractTokenWrapper.balanceOf (test.carol.address));

        assertBNEquals (
          'test.AbstractTokenWrapper.balanceOf (test.dave.address)',
          900,
          test.AbstractTokenWrapper.balanceOf (test.dave.address));

        personal.unlockAccount (test.alice, "");
        test.tx = test.carol.execute (
          test.AbstractTokenWrapper.address,
          test.AbstractTokenWrapper.transferFrom.getData (
            test.dave.address,
            test.carol.address,
            100),
          0,
          {from: test.alice, gas: 1000000});
      }},
    { name: "Make sure transfer succeeded",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          'test.AbstractTokenWrapper.Transfer',
          test.AbstractTokenWrapper,
          test.AbstractTokenWrapper.Transfer,
          test.tx,
          {
            _from: test.dave.address,
            _to: test.carol.address,
            _value: 100
          });


        assertEvents (
          'test.carol.Result',
          test.carol,
          test.carol.Result,
          test.tx,
          { _value: true });

        assertEvents (
          'test.AbstractTokenWrapper.Result',
          test.AbstractTokenWrapper,
          test.AbstractTokenWrapper.Result,
          test.tx,
          { _value: true });

        assertBNEquals (
          'test.AbstractTokenWrapper.allowance (test.dave.address, test.carol.address)',
          900,
          test.AbstractTokenWrapper.allowance (test.dave.address, test.carol.address));

        assertBNEquals (
          'test.AbstractTokenWrapper.balanceOf (test.carol.address)',
          200,
          test.AbstractTokenWrapper.balanceOf (test.carol.address));

        assertBNEquals (
          'test.AbstractTokenWrapper.balanceOf (test.dave.address)',
          800,
          test.AbstractTokenWrapper.balanceOf (test.dave.address));
      }},
    { name: "Carol transfers 0 Dave's tokens to Carol",
      body: function (test) {
        assertBNEquals (
          'test.AbstractTokenWrapper.allowance (test.dave.address, test.carol.address)',
          900,
          test.AbstractTokenWrapper.allowance (test.dave.address, test.carol.address));

        assertBNEquals (
          'test.AbstractTokenWrapper.balanceOf (test.carol.address)',
          200,
          test.AbstractTokenWrapper.balanceOf (test.carol.address));

        assertBNEquals (
          'test.AbstractTokenWrapper.balanceOf (test.dave.address)',
          800,
          test.AbstractTokenWrapper.balanceOf (test.dave.address));

        personal.unlockAccount (test.alice, "");
        test.tx = test.carol.execute (
          test.AbstractTokenWrapper.address,
          test.AbstractTokenWrapper.transferFrom.getData (
            test.dave.address,
            test.carol.address,
            0),
          0,
          {from: test.alice, gas: 1000000});
      }},
    { name: "Make sure transfer succeeded",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          'test.AbstractTokenWrapper.Transfer',
          test.AbstractTokenWrapper,
          test.AbstractTokenWrapper.Transfer,
          test.tx,
          {
            _from: test.dave.address,
            _to: test.carol.address,
            _value: 0
          });

        assertEvents (
          'test.carol.Result',
          test.carol,
          test.carol.Result,
          test.tx,
          { _value: true });

        assertEvents (
          'test.AbstractTokenWrapper.Result',
          test.AbstractTokenWrapper,
          test.AbstractTokenWrapper.Result,
          test.tx,
          { _value: true });

        assertBNEquals (
          'test.AbstractTokenWrapper.allowance (test.dave.address, test.carol.address)',
          900,
          test.AbstractTokenWrapper.allowance (test.dave.address, test.carol.address));

        assertBNEquals (
          'test.AbstractTokenWrapper.balanceOf (test.carol.address)',
          200,
          test.AbstractTokenWrapper.balanceOf (test.carol.address));

        assertBNEquals (
          'test.AbstractTokenWrapper.balanceOf (test.dave.address)',
          800,
          test.AbstractTokenWrapper.balanceOf (test.dave.address));
      }},
    { name: "Carol tries to transfer 801 Dave's tokens to Dave while Date has only 800 tokens",
      body: function (test) {
        assertBNEquals (
          'test.AbstractTokenWrapper.allowance (test.dave.address, test.carol.address)',
          900,
          test.AbstractTokenWrapper.allowance (test.dave.address, test.carol.address));

        assertBNEquals (
          'test.AbstractTokenWrapper.balanceOf (test.dave.address)',
          800,
          test.AbstractTokenWrapper.balanceOf (test.dave.address));

        personal.unlockAccount (test.alice, "");
        test.tx = test.carol.execute (
          test.AbstractTokenWrapper.address,
          test.AbstractTokenWrapper.transferFrom.getData (
            test.dave.address,
            test.dave.address,
            801),
          0,
          {from: test.alice, gas: 1000000});
      }},
    { name: "Make sure transfer failed",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          'test.AbstractTokenWrapper.Transfer',
          test.AbstractTokenWrapper,
          test.AbstractTokenWrapper.Transfer,
          test.tx);

        assertEvents (
          'test.carol.Result',
          test.carol,
          test.carol.Result,
          test.tx,
          { _value: true });

        assertEvents (
          'test.AbstractTokenWrapper.Result',
          test.AbstractTokenWrapper,
          test.AbstractTokenWrapper.Result,
          test.tx,
          { _value: false });

        assertBNEquals (
          'test.AbstractTokenWrapper.allowance (test.dave.address, test.carol.address)',
          900,
          test.AbstractTokenWrapper.allowance (test.dave.address, test.carol.address));

        assertBNEquals (
          'test.AbstractTokenWrapper.balanceOf (test.dave.address)',
          800,
          test.AbstractTokenWrapper.balanceOf (test.dave.address));
      }},
    { name: "Carol tries to transfer 801 Dave's tokens to Bob while Dave has only 800 tokens",
      body: function (test) {
        assertBNEquals (
          'test.AbstractTokenWrapper.totalSupply ()',
          1000000,
          test.AbstractTokenWrapper.totalSupply ());

        assertBNEquals (
          'test.AbstractTokenWrapper.allowance (test.dave.address, test.carol.address)',
          900,
          test.AbstractTokenWrapper.allowance (test.dave.address, test.carol.address));

        assertBNEquals (
          'test.AbstractTokenWrapper.balanceOf (test.bob.address)',
          999000,
          test.AbstractTokenWrapper.balanceOf (test.bob.address));

        assertBNEquals (
          'test.AbstractTokenWrapper.balanceOf (test.dave.address)',
          800,
          test.AbstractTokenWrapper.balanceOf (test.dave.address));

        personal.unlockAccount (test.alice, "");
        test.tx = test.carol.execute (
          test.AbstractTokenWrapper.address,
          test.AbstractTokenWrapper.transferFrom.getData (
            test.dave.address,
            test.bob.address,
            801),
          0,
          {from: test.alice, gas: 1000000});
      }},
    { name: "Make sure transfer failed",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          'test.AbstractTokenWrapper.Transfer',
          test.AbstractTokenWrapper,
          test.AbstractTokenWrapper.Transfer,
          test.tx);

        assertEvents (
          'test.carol.Result',
          test.carol,
          test.carol.Result,
          test.tx,
          { _value: true });

        assertEvents (
          'test.AbstractTokenWrapper.Result',
          test.AbstractTokenWrapper,
          test.AbstractTokenWrapper.Result,
          test.tx,
          { _value: false });

        assertBNEquals (
          'test.AbstractTokenWrapper.totalSupply ()',
          1000000,
          test.AbstractTokenWrapper.totalSupply ());

        assertBNEquals (
          'test.AbstractTokenWrapper.allowance (test.dave.address, test.carol.address)',
          900,
          test.AbstractTokenWrapper.allowance (test.dave.address, test.carol.address));

        assertBNEquals (
          'test.AbstractTokenWrapper.balanceOf (test.bob.address)',
          999000,
          test.AbstractTokenWrapper.balanceOf (test.bob.address));

        assertBNEquals (
          'test.AbstractTokenWrapper.balanceOf (test.dave.address)',
          800,
          test.AbstractTokenWrapper.balanceOf (test.dave.address));
      }},
    { name: "Carol transfers 200 Dave's tokens to Dave",
      body: function (test) {
        assertBNEquals (
          'test.AbstractTokenWrapper.allowance (test.dave.address, test.carol.address)',
          900,
          test.AbstractTokenWrapper.allowance (test.dave.address, test.carol.address));

        assertBNEquals (
          'test.AbstractTokenWrapper.balanceOf (test.dave.address)',
          800,
          test.AbstractTokenWrapper.balanceOf (test.dave.address));

        personal.unlockAccount (test.alice, "");
        test.tx = test.carol.execute (
          test.AbstractTokenWrapper.address,
          test.AbstractTokenWrapper.transferFrom.getData (
            test.dave.address,
            test.dave.address,
            200),
          0,
          {from: test.alice, gas: 1000000});
      }},
    { name: "Make sure transfer succeeded",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          'test.AbstractTokenWrapper.Transfer',
          test.AbstractTokenWrapper,
          test.AbstractTokenWrapper.Transfer,
          test.tx,
          {
            _from: test.dave.address,
            _to: test.dave.address,
            _value: 200
          });

        assertEvents (
          'test.carol.Result',
          test.carol,
          test.carol.Result,
          test.tx,
          { _value: true });

        assertEvents (
          'test.AbstractTokenWrapper.Result',
          test.AbstractTokenWrapper,
          test.AbstractTokenWrapper.Result,
          test.tx,
          { _value: true });

        assertBNEquals (
          'test.AbstractTokenWrapper.allowance (test.dave.address, test.carol.address)',
          700,
          test.AbstractTokenWrapper.allowance (test.dave.address, test.carol.address));

        assertBNEquals (
          'test.AbstractTokenWrapper.balanceOf (test.dave.address)',
          800,
          test.AbstractTokenWrapper.balanceOf (test.dave.address));
      }},
    { name: "Carol tries to transfer 701 Dave's tokens to Carol while she is allowed to transfer only 700",
      body: function (test) {
        assertBNEquals (
          'test.AbstractTokenWrapper.allowance (test.dave.address, test.carol.address)',
          700,
          test.AbstractTokenWrapper.allowance (test.dave.address, test.carol.address));

        assertBNEquals (
          'test.AbstractTokenWrapper.balanceOf (test.carol.address)',
          200,
          test.AbstractTokenWrapper.balanceOf (test.carol.address));

        assertBNEquals (
          'test.AbstractTokenWrapper.balanceOf (test.dave.address)',
          800,
          test.AbstractTokenWrapper.balanceOf (test.dave.address));

        personal.unlockAccount (test.alice, "");
        test.tx = test.carol.execute (
          test.AbstractTokenWrapper.address,
          test.AbstractTokenWrapper.transferFrom.getData (
            test.dave.address,
            test.carol.address,
            701),
          0,
          {from: test.alice, gas: 1000000});
      }},
    { name: "Make sure transfer failed",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          'test.AbstractTokenWrapper.Transfer',
          test.AbstractTokenWrapper,
          test.AbstractTokenWrapper.Transfer,
          test.tx);

        assertEvents (
          'test.carol.Result',
          test.carol,
          test.carol.Result,
          test.tx,
          { _value: true });

        assertEvents (
          'test.AbstractTokenWrapper.Result',
          test.AbstractTokenWrapper,
          test.AbstractTokenWrapper.Result,
          test.tx,
          { _value: false });

        assertBNEquals (
          'test.AbstractTokenWrapper.allowance (test.dave.address, test.carol.address)',
          700,
          test.AbstractTokenWrapper.allowance (test.dave.address, test.carol.address));

        assertBNEquals (
          'test.AbstractTokenWrapper.balanceOf (test.carol.address)',
          200,
          test.AbstractTokenWrapper.balanceOf (test.carol.address));

        assertBNEquals (
          'test.AbstractTokenWrapper.balanceOf (test.dave.address)',
          800,
          test.AbstractTokenWrapper.balanceOf (test.dave.address));
      }},
    { name: "Carol tries to transfer 701 Dave's tokens to Bob while she is allowed to transfer only 700 tokens",
      body: function (test) {
        assertBNEquals (
          'test.AbstractTokenWrapper.totalSupply ()',
          1000000,
          test.AbstractTokenWrapper.totalSupply ());

        assertBNEquals (
          'test.AbstractTokenWrapper.allowance (test.dave.address, test.carol.address)',
          700,
          test.AbstractTokenWrapper.allowance (test.dave.address, test.carol.address));

        assertBNEquals (
          'test.AbstractTokenWrapper.balanceOf (test.bob.address)',
          999000,
          test.AbstractTokenWrapper.balanceOf (test.bob.address));

        assertBNEquals (
          'test.AbstractTokenWrapper.balanceOf (test.dave.address)',
          800,
          test.AbstractTokenWrapper.balanceOf (test.dave.address));

        personal.unlockAccount (test.alice, "");
        test.tx = test.carol.execute (
          test.AbstractTokenWrapper.address,
          test.AbstractTokenWrapper.transferFrom.getData (
            test.dave.address,
            test.bob.address,
            701),
          0,
          {from: test.alice, gas: 1000000});
      }},
    { name: "Make sure transfer failed",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          'test.AbstractTokenWrapper.Transfer',
          test.AbstractTokenWrapper,
          test.AbstractTokenWrapper.Transfer,
          test.tx);

        assertEvents (
          'test.carol.Result',
          test.carol,
          test.carol.Result,
          test.tx,
          { _value: true });

        assertEvents (
          'test.AbstractTokenWrapper.Result',
          test.AbstractTokenWrapper,
          test.AbstractTokenWrapper.Result,
          test.tx,
          { _value: false });

        assertBNEquals (
          'test.AbstractTokenWrapper.totalSupply ()',
          1000000,
          test.AbstractTokenWrapper.totalSupply ());

        assertBNEquals (
          'test.AbstractTokenWrapper.allowance (test.dave.address, test.carol.address)',
          700,
          test.AbstractTokenWrapper.allowance (test.dave.address, test.carol.address));

        assertBNEquals (
          'test.AbstractTokenWrapper.balanceOf (test.bob.address)',
          999000,
          test.AbstractTokenWrapper.balanceOf (test.bob.address));

        assertBNEquals (
          'test.AbstractTokenWrapper.balanceOf (test.dave.address)',
          800,
          test.AbstractTokenWrapper.balanceOf (test.dave.address));
      }},
    { name: "Carol transfers 100 Dave's tokens to Bob",
      body: function (test) {
        assertBNEquals (
          'test.AbstractTokenWrapper.totalSupply ()',
          1000000,
          test.AbstractTokenWrapper.totalSupply ());

        assertBNEquals (
          'test.AbstractTokenWrapper.allowance (test.dave.address, test.carol.address)',
          700,
          test.AbstractTokenWrapper.allowance (test.dave.address, test.carol.address));

        assertBNEquals (
          'test.AbstractTokenWrapper.balanceOf (test.bob.address)',
          999000,
          test.AbstractTokenWrapper.balanceOf (test.bob.address));

        assertBNEquals (
          'test.AbstractTokenWrapper.balanceOf (test.dave.address)',
          800,
          test.AbstractTokenWrapper.balanceOf (test.dave.address));

        personal.unlockAccount (test.alice, "");
        test.tx = test.carol.execute (
          test.AbstractTokenWrapper.address,
          test.AbstractTokenWrapper.transferFrom.getData (
            test.dave.address,
            test.bob.address,
            100),
          0,
          {from: test.alice, gas: 1000000});
      }},
    { name: "Make sure transfer succeeded",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          'test.AbstractTokenWrapper.Transfer',
          test.AbstractTokenWrapper,
          test.AbstractTokenWrapper.Transfer,
          test.tx,
          {
            _from: test.dave.address,
            _to: test.bob.address,
            _value: 100
          });

        assertEvents (
          'test.carol.Result',
          test.carol,
          test.carol.Result,
          test.tx,
          { _value: true });

        assertEvents (
          'test.AbstractTokenWrapper.Result',
          test.AbstractTokenWrapper,
          test.AbstractTokenWrapper.Result,
          test.tx,
          { _value: true });

        assertBNEquals (
          'test.AbstractTokenWrapper.totalSupply ()',
          1000000,
          test.AbstractTokenWrapper.totalSupply ());

        assertBNEquals (
          'test.AbstractTokenWrapper.allowance (test.dave.address, test.carol.address)',
          600,
          test.AbstractTokenWrapper.allowance (test.dave.address, test.carol.address));

        assertBNEquals (
          'test.AbstractTokenWrapper.balanceOf (test.bob.address)',
          999100,
          test.AbstractTokenWrapper.balanceOf (test.bob.address));

        assertBNEquals (
          'test.AbstractTokenWrapper.balanceOf (test.dave.address)',
          700,
          test.AbstractTokenWrapper.balanceOf (test.dave.address));
      }}
  ]});