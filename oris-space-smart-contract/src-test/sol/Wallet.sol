/*
 * Simple Wallet Contract to be used for testing.
 * Copyright © 2017 – 2018 by ABDK Consulting.
 * Author: Mikhail Vladimirov <mikhail.vladimirov@gmail.com>
 */
pragma solidity ^0.4.20;

contract Wallet {
  /**
   * Execute transaction to given address with given data and value.
   *
   * @param _to address to execute transaction to
   * @param _data transaction data
   * @param _value transaction value
   * @return true if transaction was executed successfully, false otherwise 
   */
  function execute (address _to, bytes _data, uint256 _value)
  public returns (bool success) {
    Result (success = _to.call.value (_value)(_data));
  }

  /**
   * Holds result of operation.
   *
   * @param _value result of operation
   */
  event Result (bool _value);
}