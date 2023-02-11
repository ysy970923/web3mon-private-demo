import { NearWallet } from './near-wallet'
import { TerraWallet } from './terra-wallet'

export class MultiWallet {
  wallets

  constructor() {
    this.wallets = {}
    this.wallets['near'] = new NearWallet({
      createAccessKeyFor: 'web3mon.testnet',
      network: 'testnet',
    })
    this.wallets['terra'] = new TerraWallet()
  }

  startUp() {
    this.wallets['near'].startUp()
    this.wallets['terra'].startUp()
  }

  getAccountId() {
    if (window.chain === undefined) return undefined
    return this.wallets[window.chain].accountId
  }

  signIn() {
    if (this.getAccountId() !== undefined)
      document.getElementById('loggedInWith').innerText = this.getAccountId()
    document.getElementById('connect_modal_box').style.display = 'flex'
  }

  signOut() {
    this.wallets[window.chain].signOut()
  }

  async viewMethod(kargs) {
    return await this.wallets[window.chain].viewMethod(kargs)
  }

  async callMethod(kargs) {
    return await this.wallets[window.chain].callMethod(kargs)
  }

  async verifyOwner(collection, token_id) {
    return await this.wallets[window.chain].verifyOwner(collection, token_id)
  }
}
