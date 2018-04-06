/*
 * Oris Space Smart Contract.  Copyright © 2018 by ABDK Consulting.
 * Author: Mikhail Vladimirov <mikhail.vladimirov@gmail.com>
 */
pragma solidity ^0.4.20;

import "./SafeMath.sol";
import "./OrgonToken.sol";

/**
 * Oris Space smart contract that holds own and referral Orgon tokens for Orgon.
 */
contract OrisSpace is SafeMath {
  /**
   * Minimal allowed value for transferLimit.
   */
  uint256 internal constant MIN_TRANSFER_LIMIT = 0.01e9;

  /**
   * Deploy new Oris Space smart contract with given Orgon Token and owner.
   *
   * @param _orgonToken Orgon Token smart contract
   * @param _owner address of Oris Space owner
   */
  function OrisSpace (OrgonToken _orgonToken, address _owner) public {
    orgonToken = _orgonToken;
    owner = _owner;
  }

  /**
   * Send certain amount of Orgon Tokens from Oris Space balance to the owner
   * of given address.
   *
   * @param _to address to send Orgon Tokens to
   * @param _value amount of tokens to be sent
   */
  function sendOrgonTokens (address _to, uint256 _value) public returns (bool) {
    require (msg.sender == owner);
    require (started);

    if (_value > 0) {
      uint256 oldTransferred = transferred [_to];
      uint256 newTransferred = safeAdd (oldTransferred, _value);
      require (newTransferred <= transferLimit);
      transferred [_to] = newTransferred;
      if (orgonToken.transfer (_to, _value)) return true;
      else {
        transferred [_to] = oldTransferred;
        return false;
      }
    } return true;
  }

  /**
   * Set maximum amount of tokens that could be sent from Oris Space to a single
   * address.
   *
   * @param _transferLimit new transfer limit value
   */
  function setTransferLimit (uint256 _transferLimit) public {
    require (msg.sender == owner);
    require (_transferLimit < transferLimit);
    require (_transferLimit >= MIN_TRANSFER_LIMIT);

    transferLimit = _transferLimit;
  }

  /**
   * Start Oris Space smart contract.
   *
   * @param _returnAmount amount of tokens to return to message sender.
   */
  function start (uint256 _returnAmount) public {
    require (!started);
    require (msg.sender == orgonToken.owner ());

    started = true;
    if (_returnAmount > 0)
      require (orgonToken.transfer (msg.sender, _returnAmount));
  }

  /**
   * Orgon Token smart contract.
   */
  OrgonToken internal orgonToken;

  /**
   * Address of the owner of Oris Space smart contract.
   */
  address internal owner;

  /**
   * Maximum amount of Orgon Tokens that could be sent to single address.
   */
  uint256 internal transferLimit = 100e9;

  /**
   * Mapping from address to amount of Orgon Tokens transferred from Oris Space
   * to this address.
   */
  mapping (address => uint256) internal transferred;

  /**
   * Whether Oris Space smart contract is started and may do transfers.
   */
  bool internal started = false;
}
