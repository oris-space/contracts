/*
 * Simple Orgon Token.
 * Copyright © 2018 by ABDK Consulting.
 * Author: Mikhail Vladimirov <mikhail.vladimirov@gmail.com>
 */
pragma solidity ^0.4.20;

import "./../../src/sol/OrgonToken.sol";

/**
 * Simple Implementation of Orgon Token to be used for tests.
 */
contract SimpleOrgonToken is OrgonToken {
  /**
   * Deploy Simple Orgon Token with given owner address.
   *
   * @param _owner owner address
   */
  function SimpleOrgonToken (address _owner) public {
    ownerAddress = _owner;
  }

  /**
   * Get total number of tokens in circulation.
   *
   * @return total number of tokens in circulation
   */
  function totalSupply () public view returns (uint256) {
    revert ();
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
    if (transfersEnabled) {
      Transfer (msg.sender, _to, _value);
      return true;
    } else return false;
  }

  /**
   * Transfer given number of tokens from given owner to given recipient.
   *
   * @return true if tokens were transferred successfully, false otherwise
   */
  function transferFrom (address, address, uint256)
  public returns (bool) {
    revert ();
  }

  /**
   * Allow given spender to transfer given number of tokens from message sender.
   *
   * @return true if token transfer was successfully approved, false otherwise
   */
  function approve (address, uint256)
  public returns (bool) {
    revert ();
  }

  /**
   * Tell how many tokens given spender is currently allowed to transfer from
   * given owner.
   *
   * @return number of tokens given spender is currently allowed to transfer
   *         from given owner
   */
  function allowance (address, address)
  public view returns (uint256) {
    revert ();
  }

  /**
   * Get address of the owner of Orgon Token smart contract.
   *
   * @return address of the owner of Orgon Token smart contract
   */
  function owner () public view returns (address) {
    return ownerAddress;
  }

  /**
   * Set whether token transfers are enabled.
   *
   * @param _transfersEnabled true to enable token transfers, false otherwise
   */
  function setTransfersEnabled (bool _transfersEnabled) public {
    transfersEnabled = _transfersEnabled;
  }

  /**
   * Set owner of the smart contract.
   *
   * @param _owner address of the new owner of the smart contract
   */
  function setOwner (address _owner) public {
    ownerAddress = _owner;
  }

  /**
   * Whether token transfers are currently enabled.
   */
  bool internal transfersEnabled = true;

  /**
   * Address of the owner of the smart contract.
   */
  address internal ownerAddress = 0x0000000000000000000000000000000000000000;
}
