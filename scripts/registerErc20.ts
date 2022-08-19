import { settings } from "./settings";

const { defiHubName, nftHubName, schainName, erc20, txOpts, ima, defiHubIma } =
  settings;

const defiTxOpts = {
  address: "0x7bBc0e7a47857Bf0154FbAccBcbdd3079280955E", // skale test addy
  privateKey:
    "3e4da933deecae77aed4618e0848145365486c65503efc76017a540275666ca6", // SKALE test priv key
};

async function RegisterErc20() {
  // Link to defi hub
  console.log(
    "linking erc20 from origin to defi hub",
    defiHubName,
    erc20.origin,
    erc20.defiHub
  );
  /*await ima.schain.erc20.addTokenByOwner(
    defiHubName,
    erc20.origin,
    erc20.defiHub,
    txOpts
  );*/

  console.log("linking back erc20 from defi hub to origin");
  await defiHubIma.schain.erc20.addTokenByOwner(
    schainName,
    erc20.origin,
    erc20.defiHub,
    defiTxOpts
  );

  // Later, link mainnet

  // Later, link erc721 tokens
}

async function SendErc20toDefiHub() {
  // Link to defi hub
  /*console.log("sending 1000 BRAWL to defi hub");
  const result = await ima.schain.erc20.transferToSchain(
    defiHubName,
    erc20.origin,
    "1000000000000000000000",
    txOpts
  );
  console.log(result);*/

  console.log("send 500 BRAWL back to origin");
  await defiHubIma.schain.erc20.transferToSchain(
    schainName,
    erc20.origin,
    "55000000000000000000",
    txOpts
  );

  /*console.log("fail to send 50001 BRAWL back to origin");
  await defiHubIma.schain.erc20.transferToSchain(
    schainName,
    erc20.origin,
    "50001000000000000000000",
    txOpts
  );*/
}

async function main() {
  console.log("starting");
  //await RegisterErc20();
  await SendErc20toDefiHub();
  console.log("finished");
}

main();
