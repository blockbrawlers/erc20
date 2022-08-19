import { IMA } from "@skalenetwork/ima-js";
import { Contract } from "ethers";
import { ethers } from "ethers";

import { settings } from "./settings";

const { defiHubName, nftHubName, skaleSigner, txOpts, ima } = settings;

async function LinkSchains() {
  // Link to defi hub
  console.log("linking erc20");
  await ima.schain.tokenManagerLinker.connectSchain(defiHubName, txOpts);

  // Link to nft hub
  console.log("linking erc721");
  await ima.schain.tokenManagerLinker.connectSchain(nftHubName, txOpts);

  // Link to mainnet
  console.log("linking mainnet");
  await ima.schain.tokenManagerLinker.connectSchain(
    settings.mainnetName,
    txOpts
  );
}

// need ethers contracts & real signers here
async function IncreaseLimit() {
  // Register the mainnet block receiver contract to receive from mainnet
  let transaction, result;

  console.log("RegisterMessages: creating skalechain message proxy");
  const messageProxySC = new Contract(
    settings.schainAbi.message_proxy_chain_address,
    settings.schainAbi.message_proxy_chain_abi,
    skaleSigner
  );

  const role = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes("CONSTANT_SETTER_ROLE")
  );
  // Add the role to the deployer accrt
  transaction = await messageProxySC.functions["grantRole"](
    role,
    skaleSigner.getAddress(),
    { gasLimit: 500000 }
  );
  console.log("IncreaseLimit: grant role: ", transaction);
  result = await transaction.wait();
  console.log("IncreaseLimit: granted role: ", result);

  transaction = await messageProxySC.functions["setNewGasLimit"]("5000000", {
    gasLimit: 500000,
  });
  console.log("IncreaseLimit: skalechain tx: ", transaction);
  result = await transaction.wait();
  console.log("IncreaseLimit: skalechain result: ", result);
}

async function main() {
  console.log("starting");
  await LinkSchains();
  // await IncreaseLimit();
  console.log("finished");
}

main();
