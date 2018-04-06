/*
 * Wrapper for Just Price Protocol Smart Contract to be used for tests.
 * Copyright © 2018 by ABDK Consulting.
 * Author: Mikhail Vladimirov <mikhail.vladimirov@gmail.com>
 */
pragma solidity ^0.4.20;

import "./../../src/sol/JustPriceProtocol.sol";

/**
 * Just Price Protocol Smart Contract that serves as market maker for Orgon
 * tokens.
 */
contract JustPriceProtocolWrapper is JustPriceProtocol {

  /**
   * Deploy Just Price Protocol smart contract with given Orgon Token,
   * Oris Space, and K1 wallet.
   *
   * @param _orgonToken Orgon Token to use
   * @param _orisSpace Oris Space to use
   * @param _k1 address of K1 wallet
   */
  function JustPriceProtocolWrapper (
    OrgonToken _orgonToken, OrisSpace _orisSpace, address _k1)
  public JustPriceProtocol (_orgonToken, _orisSpace, _k1) {
    // Do nothing
  }

  /**
   * Get current time in seconds since epoch.
   *
   * @return current time in seconds since epoch
   */
  function currentTime () internal view returns (uint256) {
    assert (JustPriceProtocol.currentTime () == block.timestamp);

      return time;
  }

  /**
   * Set override value for current time.
   *
   * @param _time override value for current time
   */
  function setCurrentTime (uint256 _time) public {
    time = _time;
  }

  /**
   * Get current reserve amount.
   *
   * @return current reserve amount
   */
  function getReserveAmount () public view returns (uint256) {
    return reserveAmount;
  }

  /**
   * Get current fee numerator
   *
   * return current fee numerator.
   */
  function getFee () public view returns (uint256) {
    return fee;
  }

    /**
   * Calculate 2^128 * (x / 2^128)^(1/10).
   *
   * @param x parameter x
   * @return 2^128 * (x / 2^128)^(1/10)
   */
  function doRoot_10 (uint256 x) public pure returns (bool, uint256) {
    return (true, root_10 (x));
  }

  /**
   * Calculate 2^128 * (x / 2^128)^10.
   *
   * @param x parameter x
   * @return 2^128 * (x / 2^128)^10
   */
  function doPow_10 (uint256 x) public pure returns (bool, uint256) {
    return (true, pow_10 (x));
  }

  /**
   * Time to override current time.
   */
  uint256 internal time = 0;
}
