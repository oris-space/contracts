/*
 * Orgon Token Smart Contract.  Copyright © 2018 by ABDK Consulting.
 * Author: Mikhail Vladimirov <mikhail.vladimirov@gmail.com>
 */
pragma solidity ^0.4.20;

import "./Token.sol";

/**
 * Orgon Token smart contract.
 */
contract OrgonToken is Token {
  /**
   * Create _value new tokens and give new created tokens to msg.sender.
   * May only be called by smart contract owner.
   *
   * @param _value number of tokens to create
   * @return true if tokens were created successfully, false otherwise
   */
  function createTokens (uint256 _value) public returns (bool);

  /**
   * Burn given number of tokens belonging to message sender.
   * May only be called by smart contract owner.
   *
   * @param _value number of tokens to burn
   * @return true on success, false on error
   */
  function burnTokens (uint256 _value) public returns (bool);
}