import { IMA } from "@skalenetwork/ima-js";
import TokenType from "@skalenetwork/ima-js/build/TokenType";
import { Contract, providers, Wallet } from "ethers";
import Web3 from "web3";

import mainnetAbi from "./mainnetAbi.json"; // your local sources
import schainAbi from "./schainAbi.json"; // your local sources

interface Settings {
  mainnetName: string;
  schainName: string;
  mainnetRpc: string;
  schainRPC: string;
  privateKey: string;
  addressForKey: string;
  blockBuyerContractAddress: string;
  blockDeliveryContractAddress: string;
}

const DEFI_HUB_NAME = "defi hub";
const NFT_HUB_NAME = "nft hub";

const rinkebySettings: Settings = {
  mainnetName: "Rinkeby",
  schainName: "whispering-turais",
  mainnetRpc: "https://rinkeby.arbitrum.io/rpc",
  schainRPC: "https://testnet-proxy.skalenodes.com/v1/whispering-turais",
  privateKey:
    "11b0275c26eb8b6ce0fd130776faf5f7293e0cdbe63f6017b8b843906f60080f",
  addressForKey: "0x905173B6C0A51925d3C9B619466c623c754Fb7BB",
  blockBuyerContractAddress: "",
  blockDeliveryContractAddress: "",
};

const mainnetSettings: Settings = {
  mainnetName: "Mainnet",
  schainName: "",
  mainnetRpc: "https://rpc.ankr.com/eth",
  schainRPC: "",
  privateKey: "",
  addressForKey: "",
  blockBuyerContractAddress: "",
  blockDeliveryContractAddress: "",
};

const settings = rinkebySettings;

// ethers.js for contracts
const skaleProvider = new providers.JsonRpcProvider(settings.schainRPC);
const skaleSigner = new Wallet(settings.privateKey, skaleProvider);

const mainnetProvider = new providers.JsonRpcProvider(settings.mainnetRpc);
const mainnetSigner = new Wallet(settings.privateKey, mainnetProvider);

const mainnetWeb3 = new Web3(settings.mainnetRpc);
const sChainWeb3 = new Web3(settings.schainRPC);
let ima = new IMA(mainnetWeb3, sChainWeb3, mainnetAbi, schainAbi);

// set up linkages on the sidechain.

const txOpts = {
  address: settings.addressForKey, // skale test addy
  privateKey: settings.privateKey, // SKALE test priv key
};

async function EnableAutomaticDeploy() {
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

async function LinkSchains() {
  // Link to defi hub
  await ima.schain.tokenManagerLinker.connectSchain(DEFI_HUB_NAME, txOpts);

  // Link to nft hub
  await ima.schain.tokenManagerLinker.connectSchain(NFT_HUB_NAME, txOpts);

  // Link to mainnet
  await ima.schain.tokenManagerLinker.connectSchain(
    settings.mainnetName,
    txOpts
  );
}

// need ethers contracts & real signers here
async function RegisterMessages() {
  // Register the skalechain block received contract to send/receive from mainnet
  const messageProxyMainnet = new Contract(
    ima.mainnet.messageProxyMainnet.address,
    mainnetAbi.message_proxy_mainnet_abi,
    mainnetSigner
  );
  await messageProxyMainnet.functions["registerExtraContract"](
    settings.schainName,
    settings.blockDeliveryContractAddress
  );

  // Register the mainnet block buyer contract to send/receive from the skalechain
  const messageProxySC = new Contract(
    schainAbi.message_proxy_chain_address,
    schainAbi.message_proxy_chain_abi,
    skaleSigner
  );
  await messageProxySC.functions["registerExtraContract"](
    settings.mainnetName,
    settings.blockBuyerContractAddress
  );
}

async function main() {
  await EnableAutomaticDeploy();
  await LinkSchains();
  await RegisterMessages();
}
