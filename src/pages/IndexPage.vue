<template>
  <q-page padding class="flex flex-center">
    <div class="mainContainer">
      <div class="dataContainer">
        <div class="header">👋 Hey there! welcome to SendUSDC</div>

        <div class="bio q-mb-md">
          This is an implementation of a gasless tranfer using EIP-3009
          specifications. <br />
          Note: This is a Goerli testnet implementation. Get Goerli USDC
          <a
            href="https://usdcfaucet.com/"
            target="_blank"
            rel="noopener noreferrer"
            >here</a
          >
        </div>
        <div v-if="currentAccount">
          <div>
            <label>Recipient's Address</label>
            <q-input
              v-model="recipient"
              class="mdi-pap"
              standout
              placeholder="recipient's address"
            ></q-input>
          </div>
          <div>
            <label>Amount in USDC</label>
            <q-input
              v-model="amount"
              class="mdi-pap"
              type="number"
              standout
              placeholder="amount"
            ></q-input>
          </div>
          <div class="row justify-center">
            <q-btn
              color="primary"
              rounded
              @click="makeTransfer"
              icon="fas fa-paper-plane"
              class="sendBtn q-pa-md"
            />
          </div>
        </div>

        <button v-else class="connectBtn" @click="connectWallet">
          Connect Wallet to Say Hi
        </button>
      </div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent } from "vue";
import USDCContract from "../scripts/usdcContract";
export default defineComponent({
  name: "IndexPage",
  data() {
    return {
      currentAccount: "",
      recipient: "",
      amount: 0,
    };
  },
  methods: {
    async connectWallet() {
      try {
        // get injected ethereum from metamask
        const { ethereum } = window;
        if (!ethereum) {
          alert("Ethereum Provider does not exist, get metamask");
          return;
        }

        // request accounts
        const accounts = await ethereum.request({
          method: "eth_requestAccounts",
        });
        this.setCurrentAccount(accounts[0]);
      } catch (error) {
        console.log(error);
      }
    },
    async makeTransfer() {
      if (!this.currentAccount) {
        await this.connectWallet();
      }
      const usdcContract = new USDCContract(
        window.ethereum,
        "0x07865c6E87B9F70255377e024ace6630C1Eaa37F"
      );
      await usdcContract.transferWithAuthorization(
        this.amount,
        this.currentAccount,
        this.recipient
      );
    },
    setCurrentAccount(account) {
      this.currentAccount = account;
    },
  },
});
</script>
