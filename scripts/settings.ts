import { IMA } from "@skalenetwork/ima-js";
import { Contract, ethers, providers, Wallet } from "ethers";
import Web3 from "web3";
import getRevertReason from "eth-revert-reason";

import abiMainnet from "./mainnetAbi.json"; // your local sources
import abiRinkeby from "./rinkebyAbi.json"; // your local sources
import abiSchain from "./schainAbi.json"; // your local sources
import brawlerDeliveryAbi from "./brawlDeliveryAbi.json"; // your local sources
import { TransactionRequest } from "@ethersproject/abstract-provider";

interface Settings {
  mainnetName: string;
  schainName: string;
  mainnetRpc: string;
  schainRPC: string;
  defiHubRPC: string;
  nftHubRPC: string;
  schainId: number;
  mainnetId: number;
  defiHubChainId: number;
  nftHubChainId: number;
  privateKey: string;
  addressForKey: string;
  blockBuyerContractAddress: string;
  blockDeliveryContractAddress: string;
  defiHubName: string;
  nftHubName: string;
  mainnetAbi: typeof abiMainnet;
  schainAbi: typeof abiSchain;
  erc20: {
    mainnet: string;
    origin: string;
    defiHub: string;
  };
  erc721: {
    origin: string;
    nftHub: string;
  };
}

const rinkebySettings: Settings = {
  mainnetName: "Mainnet",
  schainName: "whispering-turais",
  mainnetRpc: "https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
  schainRPC: "https://testnet-proxy.skalenodes.com/v1/whispering-turais",
  defiHubRPC: "https://testnet-proxy.skalenodes.com/v1/stocky-pleione",
  nftHubRPC:
    "https://testnet-proxy.skalenodes.com/v1/honorable-steel-rasalhague",
  privateKey:
    "11b0275c26eb8b6ce0fd130776faf5f7293e0cdbe63f6017b8b843906f60080f",
  schainId: 132333505628089,
  mainnetId: 4,
  defiHubChainId: 1250011826715177,
  nftHubChainId: 1564830818,
  addressForKey: "0x905173B6C0A51925d3C9B619466c623c754Fb7BB",
  blockBuyerContractAddress: "0x23913c0468971e84ceec48da9e95f7e46b3cf6df",
  blockDeliveryContractAddress: "0xA295FF1379a02c57150bB40275c80c338fE0121F", // current
  defiHubName: "stocky-pleione",
  nftHubName: "honorable-steel-rasalhague",
  mainnetAbi: abiRinkeby,
  schainAbi: abiSchain,
  erc20: {
    mainnet: "",
    origin: "0x2b81ad7120491839F0D55445A8560107d85Ce801", // was "0x98d85E1AfC400565AEdb62c099165D814b731Ac0",
    defiHub: "", // was "0x4c2d861aeC8220EDCF39561EcF91efb787aa8F5f",
  },
  erc721: {
    origin: "0x23C1bbDfec452656ab91FD55E940220daC9D4341",
    nftHub: "",
  },
};

const brawlKey = process.env["BRAWL_CHAIN_KEY"] || "failed";

const mainnetSettings: Settings = {
  mainnetName: "Mainnet",
  schainName: "frayed-decent-antares",
  mainnetRpc: "https://rpc.ankr.com/eth",
  schainRPC: "https://mainnet.skalenodes.com/v1/frayed-decent-antares",
  defiHubRPC: "https://mainnet.skalenodes.com/v1/elated-tan-skat",
  nftHubRPC: "https://mainnet.skalenodes.com/v1/honorable-steel-rasalhague",
  schainId: 391845894,
  mainnetId: 1,
  defiHubChainId: 2046399126,
  nftHubChainId: 1564830818,
  privateKey: brawlKey,
  addressForKey: "0x4d923E303ce661C7A5562f1693209212fC131000",
  blockBuyerContractAddress: "0x2D1B617B978b140ec1662ec452Cd50f28c7104Af",
  blockDeliveryContractAddress: "0x3a5317d58090e67D74cEC50Ac8b6C18CB426fFe4",
  defiHubName: "elated-tan-skat",
  nftHubName: "honorable-steel-rasalhague",
  mainnetAbi: abiMainnet,
  schainAbi: abiSchain,
  erc20: {
    mainnet: "",
    origin: "0xae17C9f2f1d80809C16B4DFfEc630Ea10b105E12", // was "0x2b81ad7120491839F0D55445A8560107d85Ce801",
    defiHub: "",
  },
  erc721: {
    origin: "0xD2963F7e218609B91373cDdA853b20746bA24D61",
    nftHub: "",
  },
};

const internalSettings = rinkebySettings;

// ethers.js for contracts
const skaleProvider = new providers.JsonRpcProvider(internalSettings.schainRPC);

const mainnetProvider = new providers.JsonRpcProvider(
  internalSettings.mainnetRpc
);
const defiHubProvider = new providers.JsonRpcProvider(
  internalSettings.defiHubRPC
);

const mainnetWeb3 = new Web3(internalSettings.mainnetRpc);
const sChainWeb3 = new Web3(internalSettings.schainRPC);
const defiHubWeb3 = new Web3(internalSettings.defiHubRPC);
const nftHubWeb3 = new Web3(internalSettings.nftHubRPC);

export const settings = {
  ...internalSettings,
  skaleProvider,
  skaleSigner: new Wallet(internalSettings.privateKey, skaleProvider),
  mainnetProvider,
  mainnetSigner: new Wallet(internalSettings.privateKey, mainnetProvider),
  defiHubSigner: new Wallet(
    "3e4da933deecae77aed4618e0848145365486c65503efc76017a540275666ca6",
    defiHubProvider
  ),
  mainnetWeb3,
  sChainWeb3,
  txOpts: {
    address: internalSettings.addressForKey, // skale test addy
    privateKey: internalSettings.privateKey, // SKALE test priv key
  },
  ima: new IMA(
    mainnetWeb3,
    sChainWeb3,
    internalSettings.mainnetAbi,
    internalSettings.schainAbi
  ),
  defiHubIma: new IMA(
    mainnetWeb3,
    defiHubWeb3,
    internalSettings.mainnetAbi,
    internalSettings.schainAbi
  ),
  nftHubIma: new IMA(
    mainnetWeb3,
    defiHubWeb3,
    internalSettings.mainnetAbi,
    internalSettings.schainAbi
  ),
};
