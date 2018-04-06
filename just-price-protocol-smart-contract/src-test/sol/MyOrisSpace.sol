/*
 * Implementation of Oris Space Smart Contract interface to be used for tests.
 * Copyright © 2018 by ABDK Consulting.
 * Author: Mikhail Vladimirov <mikhail.vladimirov@gmail.com>
 */
pragma solidity ^0.4.20;

import "./../../src/sol/OrisSpace.sol";

/**
 * Implementation of Oris Space Smart Contract interface to be used for tests.
 */
contract MyOrisSpace is OrisSpace {
  /**
   * Start Oris Space smart contract.
   *
   * @param _returnAmount amount of tokens to return to message sender.
   */
  function start (uint256 _returnAmount) public {
    require (startEnabled);

    Start (msg.sender, _returnAmount);
  }

  /**
   * Sets whether start is enabled.
   *
   * @param _startEnabled true to enable start, false to disable it
   */
  function setStartEnabled (bool _startEnabled) public {
    startEnabled = _startEnabled;
  }

  /**
   * Whether start is enabled.
   */
  bool internal startEnabled = false;

  /**
   * Logged when contract is started.
   *
   * @param initiator address of the one who started smart contract
   * @param returnAmount amount of tokens returned to initiator
   */
  event Start (address initiator, uint256 returnAmount);
}
