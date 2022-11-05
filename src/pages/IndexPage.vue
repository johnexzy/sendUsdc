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
    setCurrentAccount(account) {
      this.currentAccount = account;
    },
  },
});
</script>
<style>
.mainContainer {
  display: flex;
  justify-content: center;
  width: 100%;
  background: radial-gradient(#eee, #fff);
  padding: 20px 0;
  margin-top: 64px;
}
.tableContainer {
  display: flex;
  justify-content: center;
  width: 100%;
  /* background: #eee; */
  margin-top: 20px;
}
.dataContainer {
  display: flex;
  flex-direction: column;
  justify-content: center;
  max-width: 600px;
}
.header {
  text-align: center;
  font-size: 31px;
  font-weight: 600;
}
.bio {
  text-align: center;
  color: rgb(67, 66, 66);
  margin-top: 16px;
  font-size: 16px;
}
.sendBtn {
  cursor: pointer;
  margin-top: 16px;
  /* padding: 8px; */
  border: 1px solid gray;
  /* border-radius: 5px; */
  background: rgba(126, 117, 151, 0.253);
  font-weight: bold;
  text-align: center;
}
.connectBtn {
  cursor: pointer;
  margin-top: 16px;
  padding: 8px;
  border: 1px solid gray;
  /* border-radius: 5px; */
  background: rgba(126, 117, 151, 0.253);
  font-weight: bold;
  text-align: center;
}
.wave {
  font-size: 25px;
}
.textarea {
  background: rgba(221, 221, 221, 0.658);
}
.my-card {
  width: 100%;
  max-width: 250px;
}
</style>
