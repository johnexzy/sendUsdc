<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <q-page padding class="flex flex-center">
        <div class="mainContainer">
          <div class="dataContainer">
            <div class="header">👋 Hey there! welcome to SendUSDC</div>
            <div class="q-my-lg bio-main text-uppercase">
              Transfer USDC without holding ETH in your wallet.
            </div>
            <div class="bio q-mb-lg q-pa-lg">
              "This is an implementation of a gasless tranfer using EIP-3009
              specifications on
              <span class="text-orange-14">Goerli testnet, </span>
              you'll need some Goerli USDC to play around; get some
              <a
                href="https://usdcfaucet.com/"
                target="_blank"
                class="text-grey"
                rel="noopener noreferrer"
                >here</a
              >"
            </div>
            <div v-if="currentAccount">
              <div class="q-pa-md">
                <label class="text-white q-mb-md">Recipient's Address</label>
                <q-input
                  v-model="recipient"
                  outlined
                  color="primary"
                  class="q-mt-md"
                  input-style="color: white;  font-weight: 600;"
                  placeholder="e.g 0x87Fa...1333"
                ></q-input>
              </div>
              <div class="q-pa-md">
                <label class="text-white q-mb-md">Amount in USDC</label>
                <q-input
                  v-model="amount"
                  type="number"
                  outlined
                  color="primary"
                  class="q-mt-md"
                  input-style="color: white;  font-weight: 600;"
                  placeholder="10"
                ></q-input>
              </div>
              <div class="row justify-center">
                <q-btn
                  color="primary"
                  rounded
                  :loading="sending"
                  @click="makeTransfer"
                  icon="fas fa-paper-plane"
                  class="sendBtn q-pa-md bg-orange-10"
                />
              </div>
            </div>

            <button v-else class="connectBtn q-mt-lg" @click="connectWallet">
              Connect Wallet
            </button>
            <q-banner v-show="hash" inline-actions rounded class="bio  q-mt-lg">
              Transaction successful! You sent <span class="text-weight-bold"> {{ amount }} USDC </span> to
              {{ recipient }}. view transaction details
              <a
                :href="'https://goerli.etherscan.io/tx/' + hash"
                target="_blank"   class="text-grey"
                rel="noopener noreferrer"
              >here</a>

              <template v-slot:action>
                <q-btn flat @click="hash = null" label="Dismiss" />
              </template>
            </q-banner>
          </div>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
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
      amount: null,
      sending: false,
      hash: null,
    };
  },
  mounted() {
    (async () => {
      this.checkIfWalletIsConnected();
    })();
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
    async checkIfWalletIsConnected() {
      try {
        const { ethereum } = window;

        /*
         * Check if we're authorized to access the user's wallet
         */
        const accounts = await ethereum.request({ method: "eth_accounts" });

        // Validate that we have an account
        if (accounts.length !== 0) {
          const account = accounts[0];

          // Set the current account
          this.setCurrentAccount(account);

          // Display a success message to the user that they are connected
          console.log("🦄 Wallet is Connected!");
        } else {
          console.log("Make sure you have MetaMask Connected!");
        }
      } catch (error) {
        console.log(`${error.message}`);
      }
    },

    async makeTransfer() {
      // check is wallet is connected
      if (!this.currentAccount) {
        await this.connectWallet();
      }
      try {
        // clear any existing hash
        this.hash = null;
        const usdcContract = new USDCContract(
          window.ethereum,
          "0x07865c6E87B9F70255377e024ace6630C1Eaa37F"
        );

        // create message and get signature
        const signature = await usdcContract.processSignature(
          this.amount,
          this.currentAccount,
          this.recipient
        );
        // set sending to true
        this.sending = true;

        // call transfer
        const result = await usdcContract.transferWithAuthorization(signature);

        await result.wait();

        // set sending to false
        this.sending = false;

        // set transaction hash
        this.hash = result.hash;
      } catch (error) {}
      // create a USDC contract factory
    },
    setCurrentAccount(account) {
      this.currentAccount = account;
    },
  },
});
</script>
