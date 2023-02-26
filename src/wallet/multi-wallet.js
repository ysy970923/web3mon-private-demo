import { NearWallet } from './near-wallet'
import { TerraWallet } from './terra-wallet'

class MultiWallet {
  wallets
  selectedChain

  constructor() {
    this.wallets = {}
    this.wallets['NEAR'] = new NearWallet({
      createAccessKeyFor: 'web3mon.testnet',
      network: 'testnet',
    })
    this.wallets['terra'] = new TerraWallet()
  }

  startUp() {
    this.wallets['NEAR'].startUp()
    this.wallets['terra'].startUp()
  }

  getAccountId() {
    if (this.selectedChain === undefined) return ''
    return this.wallets[this.selectedChain].accountId
  }

  signIn() {
    if (this.getAccountId() !== undefined)
      document.getElementById('loggedInWith').innerText = this.getAccountId()
    document.getElementById('connect_modal_box').style.display = 'flex'
  }

  signOut() {
    this.wallets[this.selectedChain].signOut()
  }

  async viewMethod(kargs) {
    return await this.wallets[this.selectedChain].viewMethod(kargs)
  }

  async callMethod(kargs) {
    return await this.wallets[this.selectedChain].callMethod(kargs)
  }

  async verifyOwner(collection, token_id, cloth_id) {
    return await this.wallets[this.selectedChain].verifyOwner(
      collection,
      token_id,
      cloth_id
    )
  }
}

export const wallet = new MultiWallet()
wallet.startUp()
