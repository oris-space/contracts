/*
 * Wrapper for Orgon Token Smart Contract.
 * Copyright © 2018 by ABDK Consulting.
 * Author: Mikhail Vladimirov <mikhail.vladimirov@gmail.com>
 */
pragma solidity ^0.4.20;

import "./../../src/sol/OrgonToken.sol";

/**
 * Wrapper for Orgon Token Smart Contract.
 */
contract OrgonTokenWrapper is OrgonToken {
  /**
   * Deploy Orgon Token smart contract and make message sender to be the owner
   * of the smart contract.
   */
  function OrgonTokenWrapper ()
    public OrgonToken () {
    // Do nothing
  }

  /**
   * Transfer given number of tokens from message sender to given recipient.
   *
   * @param _to address to transfer tokens from the owner of
   * @param _value number of tokens to transfer to the owner of given address
   * @return true if tokens were transferred successfully, false otherwise
   */
  function transfer (address _to, uint256 _value) public returns (bool success) {
    Result (success = AbstractToken.transfer (_to, _value));
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
  public returns (bool success)
  {
    Result (success = AbstractToken.transferFrom (_from, _to, _value));
  }

  /**
   * Allow given spender to transfer given number of tokens from message sender.
   *
   * @param _spender address to allow the owner of to transfer tokens from
   *        message sender
   * @param _value number of tokens to allow to transfer
   * @return true if token transfer was successfully approved, false otherwise
   */
  function approve (address _spender, uint256 _value)
  public returns (bool success) {
    Result (success = AbstractToken.approve (_spender, _value));
  }

  /**
   * Create certain number of new tokens and give them to the owner of the
   * contract.
   * 
   * @param _value number of new tokens to create
   * @return true if tokens were created successfully, false otherwise
   */
  function createTokens (uint256 _value) public returns (bool success) {
    Result (success = OrgonToken.createTokens (_value));
  }

  /**
   * Burn given number of tokens belonging to message sender.
   *
   * @param _value number of tokens to burn
   * @return true on success, false on error
   */
  function burnTokens (uint256 _value) public returns (bool success) {
    Result (success = OrgonToken.burnTokens (_value));
  }

  /**
   * Holds result of operation.
   *
   * @param _value result of operation
   */
  event Result (bool _value);
}
