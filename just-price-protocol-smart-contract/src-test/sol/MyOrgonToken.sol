/*
 * Implementation of Orgon Token Smart Contract interface to be used for tests.
 * Copyright © 2018 by ABDK Consulting.
 * Author: Mikhail Vladimirov <mikhail.vladimirov@gmail.com>
 */
pragma solidity ^0.4.20;

import "./../../src/sol/OrgonToken.sol";

/**
 * Implementation of Orgon Token Smart Contract interface to be used for tests.
 */
contract MyOrgonToken is OrgonToken {
  /**
   * Get total number of tokens in circulation.
   *
   * @return total number of tokens in circulation
   */
  function totalSupply () public view returns (uint256 supply) {
    return tokensCount;
  }

  /**
   * Get number of tokens currently belonging to given owner.
   *
   * @return number of tokens currently belonging to the owner of given address
   */
  function balanceOf (address) public view returns (uint256) {
    revert ();
  }

  /**
   * Transfer given number of tokens from message sender to given recipient.
   *
   * @param _to address to transfer tokens to the owner of
   * @param _value number of tokens to transfer to the owner of given address
   * @return true if tokens were transferred successfully, false otherwise
   */
  function transfer (address _to, uint256 _value)
  public returns (bool success) {
    if (transfersEnabled > 0) {
      transfersEnabled -= 1;
      Transfer (msg.sender, _to, _value);
      return true;
    } else return false;
  }

  /**
   * Transfer given number of tokens from given owner to given recipient.
   *
   * @param _from address to transfer tokens from the owner of
   * @param _to address to transfer tokens to the owner of
   * @param _value number of tokens to transfer from given owner to given
   *        recipient
   * @return true if tokens were transferred successfully, false otherwise
   */
  function transferFrom (address _from, address _to, uint256 _value)
  public returns (bool success) {
    if (transfersEnabled > 0) {
      transfersEnabled -= 1;
      Transfer (_from, _to, _value);
      return true;
    } else return false;
  }

  /**
   * Allow given spender to transfer given number of tokens from message sender.
   *
   * @return true if token transfer was successfully approved, false otherwise
   */
  function approve (address, uint256) public returns (bool) {
    revert ();
  }

  /**
   * Tell how many tokens given spender is currently allowed to transfer from
   * given owner.
   *
   * @return number of tokens given spender is currently allowed to transfer
   *         from given owner
   */
  function allowance (address, address) public view returns (uint256) {
    revert ();
  }

  /**
   * Create _value new tokens and give new created tokens to msg.sender.
   * May only be called by smart contract owner.
   *
   * @param _value number of tokens to create
   * @return true if tokens were created successfully, false otherwise
   */
  function createTokens (uint256 _value) public returns (bool) {
    if (creationEnabled) {
      tokensCount += _value;
      Transfer (address (0), msg.sender, _value);
      return true;
    } else return false;
  }

  /**
   * Burn given number of tokens belonging to message sender.
   * May only be called by smart contract owner.
   *
   * @param _value number of tokens to burn
   * @return true on success, false on error
   */
  function burnTokens (uint256 _value) public returns (bool) {
    if (burningEnabled) {
      tokensCount -= _value;
      Transfer (msg.sender, address (0), _value);
      return true;
    } else return false;
  }

  /**
   * Set whether token transfer are enabled.
   *
   * @param _transfersEnabled number of token transfers to enable
   */
  function setTransfersEnabled (uint256 _transfersEnabled) public {
    transfersEnabled = _transfersEnabled;
  }

  /**
   * Set whether token creation is enabled.
   *
   * @param _creationEnabled true to enable token creation, false to disable it
   */
  function setCreationEnabled (bool _creationEnabled) public {
    creationEnabled = _creationEnabled;
  }

  /**
   * Set whether token burning is enabled.
   *
   * @param _burningEnabled true to enable token burning, false to disable it
   */
  function setBurningEnabled (bool _burningEnabled) public {
    burningEnabled = _burningEnabled;
  }

  /**
   * Set total number of tokens in circulation.
   */
  function setTotalSupply (uint256 _tokensCount) public {
    tokensCount = _tokensCount;
  }

  /**
   * Total number of tokens in circulation.
   */
  uint256 tokensCount = 0;

  /**
   * Number of enabled token transfers.
   */
  uint256 internal transfersEnabled = 0;

  /**
   * Whether token creation is enabled.
   */
  bool internal creationEnabled = false;

  /**
   * Whether token burning is enabled.
   */
  bool internal burningEnabled = false;
}
