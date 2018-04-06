/*
 * Orgon Token Smart Contract.  Copyright © 2018 by ABDK Consulting.
 * Author: Mikhail Vladimirov <mikhail.vladimirov@gmail.com>
 */
pragma solidity ^0.4.20;

import "./AbstractToken.sol";

/**
 * Orgon Token smart contract.
 */
contract OrgonToken is AbstractToken {
  /**
   * Maximum allowed number of tokens in circulation (2^256 - 1).
   */
  uint256 constant MAX_TOKEN_COUNT =
    0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF;

  /**
   * Deploy Orgon Token smart contract and make message sender to be the owner
   * of the smart contract.
   */
  function OrgonToken () public {
    owner = msg.sender;
  }
  /**
   * Get name of this token.
   *
   * @return name of this token
   */
  function name () public pure returns (string) {
    return "Orgon";
  }

  /**
   * Get symbol of this token.
   *
   * @return symbol of this token
   */
  function symbol () public pure returns (string) {
    return "ORGN";
  }

  /**
   * Get number of decimals for this token.
   *
   * @return number of decimals for this token
   */
  function decimals () public pure returns (uint8) {
    return 9;
  }

  /**
   * Get total number of tokens in circulation.
   *
   * @return total number of tokens in circulation
   */
  function totalSupply () public view returns (uint256 supply) {
    return tokenCount;
  }

  /**
   * Create _value new tokens and give new created tokens to msg.sender.
   * May only be called by smart contract owner.
   *
   * @param _value number of tokens to create
   * @return true if tokens were created successfully, false otherwise
   */
  function createTokens (uint256 _value) public returns (bool) {
    require (msg.sender == owner);

    if (_value > 0) {
      if (_value > safeSub (MAX_TOKEN_COUNT, tokenCount)) return false;
      accounts [msg.sender] = safeAdd (accounts [msg.sender], _value);
      tokenCount = safeAdd (tokenCount, _value);

      Transfer (address (0), msg.sender, _value);
    }

    return true;
  }

  /**
   * Burn given number of tokens belonging to message sender.
   * May only be called by smart contract owner.
   *
   * @param _value number of tokens to burn
   * @return true on success, false on error
   */
  function burnTokens (uint256 _value) public returns (bool) {
    require (msg.sender == owner);

    if (_value > accounts [msg.sender]) return false;
    else if (_value > 0) {
      accounts [msg.sender] = safeSub (accounts [msg.sender], _value);
      tokenCount = safeSub (tokenCount, _value);

      Transfer (msg.sender, address (0), _value);

      return true;
    } else return true;
  }

  /**
   * Set new owner for the smart contract.
   * May only be called by smart contract owner.
   *
   * @param _newOwner address of new owner of the smart contract
   */
  function setOwner (address _newOwner) public {
    require (msg.sender == owner);

    owner = _newOwner;
  }

  /**
   * Total number of tokens in circulation.
   */
  uint256 internal tokenCount;

  /**
   * Owner of the smart contract.
   */
  address public owner;
}
