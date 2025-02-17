# hardhat-blockscout-verify

[Hardhat](https://hardhat.org) plugin for solidity contract verification on Blockscout block explorer

## What

This plugin will help you to verify your solidity contract on Blockscout block explorer. Blockscout block explorer is a block explorer implmented for EVM-supported blockchain. Unlike Ethscan, Blockscout is an open-sourced project. There are many EVM-supported blockchain and sidechains has adopted Blockscout as their block explorer, including Moonriver (Moonbeam on Kusama), POA Network, xDai Chain, Ethereum Classic. Blockscout block explorer offers an API where you can verify your solidity contracts, but you will have to flatten the contract beforehand. This plugin helps you to do it in one shot.

## Installation

```bash
npm install @sekmet/hardhat-blockscout-verify
```

Import the plugin in your `hardhat.config.js`:

```js
require("@sekmet/hardhat-blockscout-verify");
```

Or if you are using TypeScript, in your `hardhat.config.ts`:

```ts
import "@sekmet/hardhat-blockscout-verify";
import {SOLIDITY_VERSION, EVM_VERSION} from "@sekmet/hardhat-blockscout-verify";
```

## Tasks

This plugin adds the `blockscout-verify` task to Hardhat:
```bash
npx hardhat blockscout-verify <contract file path> <contract address>
```

## Configuration

This plugin extends the `HardhatUserConfig` object with an optional `blockscoutVerify` field.

This is an example of how to set it:

```js
module.exports = {
  blockscoutVerify: {
    blockscoutURL: "<BLOCKSCOUT_EXPLORER_URL>",
    config: {
        compilerVersion: SOLIDITY_VERSION.<CONTRACT_COMPILER_VERSION>, // checkout enum SOLIDITY_VERSION
        optimization: true,
        evmVersion: EVM_VERSION.<EVM_VERSION>, // checkout enum SOLIDITY_VERSION
        optimizationRuns: 999999,
    },
    contracts: {
      "<CONTRACT_NAME>": {
        compilerVersion: SOLIDITY_VERSION.<CONTRACT_COMPILER_VERSION>, // checkout enum SOLIDITY_VERSION
        optimization: true,
        evmVersion: EVM_VERSION.<EVM_VERSION>, // checkout enum SOLIDITY_VERSION
        optimizationRuns: 999999,
      },
    },
  },
};
```

## Usage

There are no additional steps you need to take for this plugin to work.

Install it and access ethers through the Hardhat Runtime Environment anywhere
you need it (tasks, scripts, tests, etc).

You can use the plugin as CLI
```bash
npx hardhat blockscout-verify <contract file path> <contract address>
```

If you use it in a script, the task parameters are `filePath` and `address`.

Example:
```js
await hre.run("blockscout-verify", {
    filePath: "<contract file path>",
    address: "<contract address>",
    constructorArguments: "<constructor arguments>", //if any 
})
```

## Known Issue

- Upgradeable contracts is current not supported.
