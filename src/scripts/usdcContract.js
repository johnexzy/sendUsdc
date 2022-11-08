import {
  BigNumber,
  providers,
  Contract,
  utils,
  Wallet,
  ContractFactory,
  Transaction,
} from "ethers";
import Web3 from "web3";
import abi from "./abi.json";

export default class USDCContract {
  provider;
  contractAddress;
  constructor(provider, contractAddress) {
    this.provider = new providers.Web3Provider(provider);
    this.contractAddress = contractAddress;
  }
  async tokenContract(signer) {
    const connectedContract = new Contract(this.contractAddress, abi, signer);
    return connectedContract;
  }
  async processSignature(amount, from, to) {
    // timestamp for expiry of this signature
    const valueBefore = Math.floor(Date.now() / 1000) + 3600;
    // random nonce.
    const nonce = Web3.utils.randomHex(32);

    // message data
    const data = {
      types: {
        EIP712Domain: [
          { name: "name", type: "string" },
          { name: "version", type: "string" },
          { name: "chainId", type: "uint256" },
          { name: "verifyingContract", type: "address" },
        ],
        TransferWithAuthorization: [
          { name: "from", type: "address" },
          { name: "to", type: "address" },
          { name: "value", type: "uint256" },
          { name: "validAfter", type: "uint256" },
          { name: "validBefore", type: "uint256" },
          { name: "nonce", type: "bytes32" },
        ],
      },
      // this helps the user validate the token
      domain: {
        name: "USD Coin",
        version: "2",
        chainId: 5,
        // the contract address of USDC
        verifyingContract: this.contractAddress,
      },
      primaryType: "TransferWithAuthorization",
      message: {
        from: from,
        to: to,
        value: Math.pow(10, 6) * amount,
        validAfter: 0,
        validBefore: valueBefore, // Valid for an hour
        nonce: nonce,
      },
    };

    const signature = await this.provider.provider.request({
      method: "eth_signTypedData_v4",
      params: [from, JSON.stringify(data)],
    });

    // v, r and s from signature
    const v = "0x" + signature.slice(130, 132);
    const r = signature.slice(0, 66);
    const s = "0x" + signature.slice(66, 130);
    data.v = v;
    data.s = s;
    data.r = r;
    return data;
  }

  // delegate call to master wallet
  async transferWithAuthorization(data) {
    // create master wallet with private key
    // master wallet pays the gas fee on behalf of the user
    const masterWallet = new Wallet(process.env.MASTERWALLET);

    // generate a signer for the master wallet by connectin to a provider
    const signer = masterWallet.connect(
      new providers.JsonRpcProvider(
        "https://eth-goerli.g.alchemy.com/v2/MbhgMXsdTaM8wSMpDfz5uDI-J8G_IJ3j"
      )
    );

    console.log(signer.address)
    // call the contract method using the master wallet
    const tx = await (await this.tokenContract(signer)).transferWithAuthorization(
      data.message.from,
      data.message.to,
      data.message.value,
      data.message.validAfter,
      data.message.validBefore,
      data.message.nonce,
      data.v,
      data.r,
      data.s
    );

    return tx;
  }
}
