import { IMA } from "@skalenetwork/ima-js";
import { Contract, ethers } from "ethers";

import brawlerDeliveryAbi from "./brawlDeliveryAbi.json"; // your local sources
import { TransactionRequest } from "@ethersproject/abstract-provider";
import { settings } from "./settings";

const {
  mainnetAbi,
  mainnetWeb3,
  mainnetSigner,
  schainAbi,
  sChainWeb3,
  skaleSigner,
  txOpts,
  skaleProvider,
} = settings;

// set up linkages on the sidechain.

async function EnableAutomaticDeploy() {
  let ima = new IMA(mainnetWeb3, sChainWeb3, mainnetAbi, schainAbi);
  // erc20
  let automaticDeploy = await ima.schain.erc20.automaticDeploy();
  await ima.schain.erc20.enableAutomaticDeploy(txOpts);
  // await ima.schain.erc20.disableAutomaticDeploy(txOpts);
  let automaticDeployAfter = await ima.schain.erc20.automaticDeploy();
  console.log("erc20", automaticDeploy, automaticDeployAfter);

  // erc721zx
  automaticDeploy = await ima.schain.erc721.automaticDeploy();
  await ima.schain.erc721.enableAutomaticDeploy(txOpts);
  // await ima.schain.erc721.disableAutomaticDeploy(txOpts);
  console.log("erc721", automaticDeploy, automaticDeployAfter);

  // erc1155
  automaticDeploy = await ima.schain.erc1155.automaticDeploy();
  await ima.schain.erc1155.enableAutomaticDeploy(txOpts);
  // await ima.schain.erc1155.disableAutomaticDeploy(txOpts);
  console.log("erc1155", automaticDeploy, automaticDeployAfter);
}

// need ethers contracts & real signers here
async function TokenManagerLinkerConnectSchain() {
  // Register the mainnet block receiver contract to receive from mainnet
  let transaction, result;

  const tokenManagerLinker = new Contract(
    schainAbi.token_manager_linker_address,
    schainAbi.token_manager_linker_abi,
    skaleSigner
  );

  console.log("ConnectSchain: Europa");
  transaction = await tokenManagerLinker.functions["connectSchain"](
    settings.nftHubName,
    { gasLimit: 500000 }
  );
  console.log("ConnectSchain: Europa tx: ", transaction);
  result = await transaction.wait();
  console.log("ConnectSchain: Europa result: ", result);

  console.log("ConnectSchain: NFT");
  transaction = await tokenManagerLinker.functions["connectSchain"](
    settings.defiHubName,
    { gasLimit: 500000 }
  );
  console.log("ConnectSchain: NFT tx: ", transaction);
  result = await transaction.wait();
  console.log("ConnectSchain: NFT result: ", result);
}

// need ethers contracts & real signers here
async function RegisterMessages() {
  // Register the mainnet block receiver contract to receive from mainnet
  let transaction, result;

  console.log("RegisterMessages: creating skalechain message proxy");
  const messageProxySC = new Contract(
    schainAbi.message_proxy_chain_address,
    schainAbi.message_proxy_chain_abi,
    skaleSigner
  );

  /*const role = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes("EXTRA_CONTRACT_REGISTRAR_ROLE")
  );
  // Add the role to the deployer accrt
  transaction = await messageProxySC.functions["grantRole"](
    role,
    skaleSigner.getAddress(),
    { gasLimit: 500000 }
  );
  console.log("RegisterMessages: grant role: ", transaction);
  result = await transaction.wait();
  console.log("RegisterMessages: granted role: ", result);*/

  transaction = await messageProxySC.functions["registerExtraContract"](
    settings.mainnetName,
    settings.blockDeliveryContractAddress,
    { gasLimit: 500000 }
  );
  console.log("RegisterMessages: skalechain tx: ", transaction);
  result = await transaction.wait();
  console.log("RegisterMessages: skalechain result: ", result);

  // This one works
  /*console.log("RegisterMessages: creating mainnet message proxy");
  // Register the skalechain block buyer contract to send to the skale chain
  const messageProxyMainnet = new Contract(
    mainnetAbi.message_proxy_mainnet_address,
    mainnetAbi.message_proxy_mainnet_abi,
    mainnetSigner
  );
  transaction = await messageProxyMainnet.functions["registerExtraContract"](
    settings.schainName,
    settings.blockBuyerContractAddress,
    { gasLimit: 500000, gasPrice: 3000000000 }
  );
  console.log("RegisterMessages: mainnet tx: ", transaction);
  result = await transaction.wait();
  console.log("RegisterMessages: mainnet result: ", result);*/
}

async function MakeTransaction() {
  const encoded = ethers.utils.defaultAbiCoder.encode(
    ["address", "uint256"],
    ["0x33229637c43A8A2C7e33678bD6C238d91f855307", 1]
  );
  console.log(encoded);
  const decoded = ethers.utils.defaultAbiCoder.decode(
    ["address", "uint256"],
    encoded
  );
  console.log(decoded);
  const brawlDelivery = new Contract(
    (brawlerDeliveryAbi as any).networks["132333505628089"].address,
    (brawlerDeliveryAbi as any).abi,
    skaleSigner
  );
  // Add the role to the deployer accrt
  let transaction = await brawlDelivery.functions["postMessage"](
    "0xc1e661d1c18b8141e17cb5011f0fa1d68ec270327891916387787f9478632d82", // chain hash (ignored)
    "0x9CcE81F49b7C5C8c01E35c8960CE9c3704EA4BF7", // to address
    "0x00000000000000000000000033229637c43a8a2c7e33678bd6c238d91f8553070000000000000000000000000000000000000000000000000000000000000001", // data
    { gasLimit: 500000 }
  );
  console.log("MakeTransaction: postMessage: ", transaction);
  let result = await transaction.wait();
  console.log("MakeTransaction: postMessage complete: ", result);
}

async function main() {
  // await EnableAutomaticDeploy();
  // await LinkSchains();

  console.log("linking schains");
  await TokenManagerLinkerConnectSchain();
  console.log("linked schains");

  /*console.log("registering messages");
  await RegisterMessages();
  console.log("registered messages");*/
  //await MakeTransaction();
  /*await getTransaction(
    "0xc1e661d1c18b8141e17cb5011f0fa1d68ec270327891916387787f9478632d82"
  );*/
  //0x51641abf24fe863c31ffd3692e37aa40e92f9578a7afeecdd66fcb9951a241f9
}

main();

async function getTransaction(hash: string) {
  const tx = await skaleProvider.getTransactionReceipt(hash);
  console.log("tx: ", tx);
  //await reason(hash);
  //console.log("revert reason: ", await getRevertReason(hash));
}

function hex_to_ascii(str1: string) {
  var hex = str1.toString();
  var str = "";
  for (var n = 0; n < hex.length; n += 2) {
    str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
  }
  return str;
}

async function reason(hash: string) {
  console.log("tx hash:", hash);

  let tx = await skaleProvider.getTransaction(hash);

  const req: TransactionRequest = {
    to: tx.to,
    from: tx.from,
    nonce: tx.nonce,

    gasLimit: tx.gasLimit,
    gasPrice: tx.gasPrice,

    data: tx.data,
    value: tx.value,
    chainId: tx.chainId,
    type: tx.type || undefined,
    accessList: tx.accessList,

    maxPriorityFeePerGas: tx.maxPriorityFeePerGas,
    maxFeePerGas: tx.maxFeePerGas,
  };
  if (!tx) {
    console.log("tx not found");
  } else {
    try {
      let code = await skaleProvider.call(req, tx.blockNumber);
      console.log("did not revert", code);
    } catch (err: any) {
      const code = err.data.replace("Reverted ", "");
      console.log({ err });
      let reason = ethers.utils.toUtf8String("0x" + code.substr(138));
      console.log("revert reason:", reason);
    }
  }
}
