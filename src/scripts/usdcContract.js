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
  async tokenContract() {
    const connectedContract = new Contract(
      this.contractAddress,
      abi,
      this.provider.getSigner()
    );
    return connectedContract;
  }
  async transferWithAuthorization(amount, from, to) {
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
      domain: {
        name: "USD Coin",
        version: "2",
        chainId: 5,
        verifyingContract: this.contractAddress,
      },
      primaryType: "TransferWithAuthorization",
      message: {
        from: from,
        to: to,
        value: amount,
        validAfter: 0,
        validBefore: valueBefore, // Valid for an hour
        nonce: nonce,
      },
    };

    const signature = await this.provider.provider.request({
      method: "eth_signTypedData_v4",
      params: [from, JSON.stringify(data)],
    });

    console.log(signature);
  }
}
