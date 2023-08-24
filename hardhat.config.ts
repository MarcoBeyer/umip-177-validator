import { HardhatUserConfig } from "hardhat/config";
import "@typechain/hardhat";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-ethers";
import "@nomicfoundation/hardhat-chai-matchers";

const config: HardhatUserConfig = {
  solidity: "0.8.19",
  typechain: {
    outDir: "./scripts/types",
    target: "ethers-v6",
    externalArtifacts: ["scripts/abis/*.json"],
  },
};

export default config;
