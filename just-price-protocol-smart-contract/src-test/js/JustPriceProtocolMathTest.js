/*
 * Test for Just Price Protocol Smart Contract.
 * Copyright © 2018 by ABDK Consulting.
 * Author: Mikhail Vladimirov <mikhail.vladimirov@gmail.com>
 */

tests.push ({
  name: "JustPriceProtocolMath",
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
    { name: "Alice deploys JustPriceProtocolWrapper contract",
      body: function (test) {
        var justPriceProtocolWrapperCode =
          loadContractCode ("JustPriceProtocolWrapper");
        test.justPriceProtocolWrapperContract =
          loadContract ("JustPriceProtocolWrapper");

        personal.unlockAccount (test.alice, "");
        test.tx = test.justPriceProtocolWrapperContract.new (
          '0x0000000000000000000000000000000000000000',
          '0x0000000000000000000000000000000000000000',
          '0x0000000000000000000000000000000000000000',
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
      }},
    { name: "Calculate 0^10",
      body: function (test) {
        var result = test.justPriceProtocolWrapper.doPow_10 (0);

        assert ('result [0]', result [0]);
        assertBNEquals ('result [1]', 0, result [1]);
      }},
    { name: "Calculate (1/2^128)^10",
      body: function (test) {
        var result = test.justPriceProtocolWrapper.doPow_10 (1);

        assert ('result [0]', result [0]);
        assertBNEquals ('result [1]', 0, result [1]);
      }},
    { name: "Calculate 0.00014022195^10",
      body: function (test) {
        var result = test.justPriceProtocolWrapper.doPow_10 ('47715060000000000000000000000000000');

        assert ('result [0]', result [0]);
        assertBNEquals ('result [1]', 0, result [1]);
      }},
    { name: "Calculate 0.00014022196^10",
      body: function (test) {
        var result = test.justPriceProtocolWrapper.doPow_10 ('47715070000000000000000000000000000');

        assert ('result [0]', result [0]);
        assertBNEquals ('result [1]', 1, result [1]);
      }},
    { name: "Calculate 0.314^10",
      body: function (test) {
        var result = test.justPriceProtocolWrapper.doPow_10 ('106848660000000000000000000000000000000');

        assert ('result [0]', result [0]);
        assertBNEquals ('result [1]', '3170558677781238025581471816040904', result [1]);
      }},
    { name: "Calculate 0.99999^10",
      body: function (test) {
        var result = test.justPriceProtocolWrapper.doPow_10 ('340278960000000000000000000000000000000');

        assert ('result [0]', result [0]);
        assertBNEquals ('result [1]', '340248299246473261503693189814891279584', result [1]);
      }},
    { name: "Calculate 1^10",
      body: function (test) {
        var result = test.justPriceProtocolWrapper.doPow_10 ('340282366920938463463374607431768211456');

        assert ('result [0]', result [0]);
        assertBNEquals ('result [1]', '340282366920938463463374607431768211456', result [1]);
      }},
    { name: "Calculate (1+1/2^128)^10",
      body: function (test) {
        var result = test.justPriceProtocolWrapper.doPow_10 ('340282366920938463463374607431768211457');

        assert ('!result [0]', !result [0]);
      }},
    { name: "Calculate (2^128-1/2^128)^10",
      body: function (test) {
        var result = test.justPriceProtocolWrapper.doPow_10 ('115792089237316195423570985008687907853269984665640564039457584007913129639935');

        assert ('!result [0]', !result [0]);
      }},
    { name: "Calculate 0^0.1",
      body: function (test) {
        var result = test.justPriceProtocolWrapper.doRoot_10 (0);

        assert ('result [0]', result [0]);
        assertBNEquals ('result [1]', 0, result [1]);
      }},
    { name: "Calculate (1/2^128)^0.1",
      body: function (test) {
        var result = test.justPriceProtocolWrapper.doRoot_10 (1);

        assert ('result [0]', result [0]);
        assertBNEquals ('result [1]', '47715566613009649023927708302818976', result [1]);
      }},
    { name: "Calculate 0.00014022195^0.1",
      body: function (test) {
        var result = test.justPriceProtocolWrapper.doRoot_10 ('47715060000000000000000000000000000');

        assert ('result [0]', result [0]);
        assertBNEquals ('result [1]', '140126749519405644894857482878810786189', result [1]);
      }},
    { name: "Calculate 0.00014022196^0.1",
      body: function (test) {
        var result = test.justPriceProtocolWrapper.doRoot_10 ('47715070000000000000000000000000000');

        assert ('result [0]', result [0]);
        assertBNEquals ('result [1]', '140126752456145875423229767930631677505', result [1]);
      }},
    { name: "Calculate 0.314^0.1",
      body: function (test) {
        var result = test.justPriceProtocolWrapper.doRoot_10 ('106848660000000000000000000000000000000');

        assert ('result [0]', result [0]);
        assertBNEquals ('result [1]', '303062644472102731423026817756563181300', result [1]);
      }},
    { name: "Calculate 0.99999^0.1",
      body: function (test) {
        var result = test.justPriceProtocolWrapper.doRoot_10 ('340278960000000000000000000000000000000');

        assert ('result [0]', result [0]);
        assertBNEquals ('result [1]', '340282026227309646970325757807269252538', result [1]);
      }},
    { name: "Calculate 1^0.1",
      body: function (test) {
        var result = test.justPriceProtocolWrapper.doRoot_10 ('340282366920938463463374607431768211456');

        assert ('result [0]', result [0]);
        assertBNEquals ('result [1]', '340282366920938463463374607431768211456', result [1]);
      }},
    { name: "Calculate (1+1/2^128)^0.1",
      body: function (test) {
        var result = test.justPriceProtocolWrapper.doRoot_10 ('340282366920938463463374607431768211457');

        assert ('result [0]', result [0]);
        assertBNEquals ('result [1]', '340282366920938463463374607431768211484', result [1]);
      }},
    { name: "Calculate 99999^0.1",
      body: function (test) {
        var result = test.justPriceProtocolWrapper.doRoot_10 ('34027896000000000000000000000000000000000000');

        assert ('result [0]', result [0]);
        assertBNEquals ('result [1]', '1076066249695451838784132198408152393148', result [1]);
      }},
    { name: "Calculate (2^128-1/2^128)^0.1",
      body: function (test) {
        var result = test.justPriceProtocolWrapper.doRoot_10 ('115792089237316195423570985008687907853269984665640564039457584007913129639935');

        assert ('result [0]', result [0]);
        assertBNEquals ('result [1]', '2426740786813021215327117000974911278137344', result [1]);
      }}
  ]});
