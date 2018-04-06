/*
 * Wrapper for Oris Space Smart Contract.
 * Copyright © 2018 by ABDK Consulting.
 * Author: Mikhail Vladimirov <mikhail.vladimirov@gmail.com>
 */
pragma solidity ^0.4.20;

import "./../../src/sol/OrisSpace.sol";

/**
 * Wrapper for Oris Space Smart Contract.
 */
contract OrisSpaceWrapper is OrisSpace {
  /**
   * Deploy new Oris Space smart contract with given Orgon Token and owner.
   *
   * @param _orgonToken Orgon Token smart contract
   * @param _owner address of Oris Space owner
   */
  function OrisSpaceWrapper (OrgonToken _orgonToken, address _owner)
    public OrisSpace (_orgonToken, _owner) {
    // Do nothing
  }

  /**
   * Send certain amount of Orgon Tokens from Oris Space balance to the owner
   * of given address.
   *
   * @param _to address to send Orgon Tokens to
   * @param _value amount of tokens to be sent
   */
  function sendOrgonTokens (address _to, uint256 _value)
    public returns (bool success) {
    Result (success = OrisSpace.sendOrgonTokens (_to, _value));
  }

  /**
   * Get current transfer limit.
   *
   * @return current transfer limit
   */
  function getTransferLimit () public view returns (uint256) {
    return transferLimit;
  }

  /**
   * Get number of tokens transferred to given address.
   *
   * @param _address address to get number of transferred tokens to
   * @return number of tokens transferred to given address
   */
  function getTransferred (address _address) public view returns (uint256) {
    return transferred [_address];
  }

  /**
   * Reset started flag back to false.
   */
  function resetStarted () public {
    started = false;
  }

  /**
   * Used to log result of operation.
   *
   * @param _value result of operation
   */
  event Result (bool _value);
}
