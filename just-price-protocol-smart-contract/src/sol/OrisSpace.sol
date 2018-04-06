/*
 * Oris Space Smart Contract Interface.  Copyright © 2018 by ABDK Consulting.
 * Author: Mikhail Vladimirov <mikhail.vladimirov@gmail.com>
 */
pragma solidity ^0.4.20;

/**
 * Oris Space smart contract that holds own and referral Orgon tokens for Orgon.
 */
contract OrisSpace {
  /**
   * Start Oris Space smart contract.
   *
   * @param _returnAmount amount of tokens to return to message sender.
   */
  function start (uint256 _returnAmount) public;
}