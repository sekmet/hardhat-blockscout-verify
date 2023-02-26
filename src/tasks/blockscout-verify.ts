import { task, types } from "hardhat/config";
import { NomicLabsHardhatPluginError } from "hardhat/plugins";
import {
  HardhatConfig,
  HardhatRuntimeEnvironment,
  TaskArguments,
} from "hardhat/types";
import fetch from "node-fetch";
import path from "path";

function r(e:string) {
  var t:any = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
  };
  return e.replace(/[&<>"']/g, (function(e:string) {
      return t[e]
  }
  ))
}

function transformContent(content:string) {
  // Replace all occurrences of "foo" with "bar"
  return r(`${content}`);
}

task("blockscout-verify")
  .addPositionalParam("filePath", "File path to the contract", "", types.string)
  .addPositionalParam("address", "Deployed contract address", "", types.string)
  .setAction(async function (
    args: TaskArguments,
    hre: HardhatRuntimeEnvironment
  ) {
    if (!validateArgs(args)) {
      throw new NomicLabsHardhatPluginError(
        "hardhat-blockscout-verify",
        "Missing args for this task"
      );
    }
    const fileName = `${args.filePath}`.split(':')[0];
    const address = args.address;
    const constructorArguments = args.constructorArguments;
    const contractName = path.basename(fileName, ".sol");
    if (!validateContractName(hre.config, contractName) && !hre.config.blockscoutVerify!.config) {
      throw new NomicLabsHardhatPluginError(
        "hardhat-blockscout-verify",
        "Contracts is not defined in Hardhat config"
      );
    }
    if (!validateBlockscoutURL(hre.config)) {
      throw new NomicLabsHardhatPluginError(
        "hardhat-blockscout-verify",
        "Blockscout URL is not defined in Hardhat config"
      );
    }
    console.log(`Task will process ${contractName} in ${fileName}`);
    const flattenContent = await hre.run("smart-flatten", {
      files: [fileName],
    });
    console.log("File flatten has completed");
    const verifyConfig = hre.config.blockscoutVerify!.config
      ? hre.config.blockscoutVerify!.config
      : hre.config.blockscoutVerify!.contracts[contractName];
    const params: any = {
      addressHash: address,
      name: contractName,
      compilerVersion: verifyConfig!.compilerVersion,
      optimization: verifyConfig!.optimization,
      contractSourceCode: transformContent(flattenContent),
      constructorArguments: constructorArguments,
      autodetectConstructorArguments: constructorArguments ? "false" : "true",
      evmVersion: verifyConfig!.evmVersion,
      optimizationRuns: verifyConfig!.optimizationRuns,
    };
    const blockscoutURL = hre.config.blockscoutVerify.blockscoutURL;
    console.log(`Sending file for verification to ${blockscoutURL}`);
    console.log(`Contract address is ${address}`);
    console.log("Verification could take some time... ");
    let x = 0;
    const loader = setInterval(() => {
      process.stdout.write(`\r${P[x++]}`);
      x %= P.length;
    }, 250);
    try {
      const verifyRes = await fetch(
        `${blockscoutURL}/api?module=contract&action=verify`,
        {
          method: "POST",
          body: JSON.stringify(params),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      clearInterval(loader);
      if (verifyRes.status === 200) {
        console.log(`${contractName} is verified`);
      } else if (verifyRes.status === 524) {
        // special handling for cloudflare timeout
        const contractRes = await fetch(
          `${blockscoutURL}/api?module=contract&action=getsourcecode&address=${address}`
        );
        const resBody = await contractRes.json();
        if (resBody.result.length > 0) {
          if (resBody.result[0].ABI !== null) {
            console.log(`${contractName} is verified`);
          } else {
            throw new NomicLabsHardhatPluginError(
              "hardhat-blockscout-verify",
              "[524] Fail to verify contract - NO ABI"
            );
          }
        } else {
          throw new NomicLabsHardhatPluginError(
            "hardhat-blockscout-verify",
            "[524] Fail to verify contract - NOT FOUND"
          );
        }
      } else {
        throw new NomicLabsHardhatPluginError(
          "hardhat-blockscout-verify",
          `Fail to verify contract - OTHER ERROR :( [ ${JSON.stringify(verifyRes)} ]`
        );

      }
    } catch (e:any) {
      clearInterval(loader);
      throw new NomicLabsHardhatPluginError(
        "hardhat-blockscout-verify",
        e
      );
    }
  });

function validateArgs(args: TaskArguments): boolean {
  return args.fileName !== null && args.address !== null;
}

function validateBlockscoutURL(hreConfig: HardhatConfig) {
  if (hreConfig.blockscoutVerify.blockscoutURL === null) {
    return false;
  }
  let url;
  try {
    url = new URL(hreConfig.blockscoutVerify.blockscoutURL);
  } catch (_) {
    return false;
  }
  return true;
}

function validateContractName(hreConfig: HardhatConfig, contractName: string) {
  return (
    hreConfig.blockscoutVerify !== undefined &&
    hreConfig.blockscoutVerify.contracts !== undefined &&
    hreConfig.blockscoutVerify.contracts[contractName] !== undefined
  );
}

const P = ["\\", "|", "/", "-"];
