/*
 * Orgon Token Smart Contract Interface.  Copyright © 2018 by ABDK Consulting.
 * Author: Mikhail Vladimirov <mikhail.vladimirov@gmail.com>
 */
pragma solidity ^0.4.20;

import "./Token.sol";

/**
 * Orgon Token Smart Contract Interface.
 */
contract OrgonToken is Token {
  /**
   * Get address of the owner of Orgon Token smart contract.
   *
   * @return address of the owner of Orgon Token smart contract
   */
  function owner () public view returns (address);
}
