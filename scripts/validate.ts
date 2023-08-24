import { ethers } from "ethers";

import {
  OptimisticOracleV3__factory,
  RatedOracle__factory,
} from "./types/factories";
import { RatedOracle } from "./types";

// Replace with the actual contract addresses
const ratedOracleAddress =
  process.env.RATED_ORACLE_ADDRESS ||
  "0x51881A1Cde5DBAE15D02aE1824940b19768d8F2b";
const optimisticOracleV3Address =
  process.env.OPTIMISTIC_ORACLE_V3_ADDRESS ||
  "0xfb55F43fB9F48F63f9269DB7Dde3BbBe1ebDC0dE";

const provider: ethers.Provider = new ethers.JsonRpcProvider(
  process.env.ETHEREUM_RPC_URL || "https://eth.llamarpc.com"
);

const ratedOracleContract = RatedOracle__factory.connect(
  ratedOracleAddress,
  provider
);

const optimisticOracleContract = OptimisticOracleV3__factory.connect(
  optimisticOracleV3Address,
  provider
);

// Function to fetch a report from Rated Oracle
async function fetchReport(reportId: number) {
  const report = await ratedOracleContract.reports(reportId);
  return report;
}

// Function to fetch violations for a report
async function fetchReportViolations(reportId: number) {
  const violations = ratedOracleContract.getViolationsInReport(reportId);
  return violations;
}

// Function to validate a violation
async function validateViolation(violation: RatedOracle.ViolationStructOutput) {
  // Fetch validator's public key using getPubkeyRoot function
  const validatorPubkey = await ratedOracleContract.getPubkeyRoot(
    violation.validatorIdentifier
  );

  // Fetch Ethereum block data using provider
  const block = await provider.getBlock(violation.epochNumber);
  if (block === null) {
    return false;
  }

  // Validate the fee recipient address against the predefined addresses
  const expectedAddresses: string[] = [
    /* List of acceptable addresses based on penalty type */
  ];

  const isValidRecipient = expectedAddresses.includes(block.miner);

  return isValidRecipient && validatorPubkey === block.miner;
}

// Function to validate a report
async function validateReport(reportId: number) {
  // 2. Voters should read the storage of the Rated smart contract in
  //    the reports mapping to access the corresponding report.
  const violations = await fetchReportViolations(reportId);

  for (const violation of violations) {
    const isValidViolation = await validateViolation(violation);
    if (!isValidViolation) {
      return false;
    }
  }

  return true;
}

// 1. Voters should decode the ancillary data to get the corresponding ID of the report to examine.
const reportId = 7; // Replace with the actual report ID
validateReport(reportId).then((isValid) => {
  if (isValid) {
    console.log("The report is valid.");
  } else {
    console.log("The report is invalid.");
  }
});
