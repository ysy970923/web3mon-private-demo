/* A helper file that simplifies using the wallet selector */

// near api js
import { providers, keyStores } from 'near-api-js'

// wallet selector UI
// import '@near-wallet-selector/modal-ui-js/styles.css';
import { setupModal } from '@near-wallet-selector/modal-ui-js'
import LedgerIconUrl from '@near-wallet-selector/ledger/assets/ledger-icon.png'
import MyNearIconUrl from '@near-wallet-selector/my-near-wallet/assets/my-near-wallet-icon.png'
import { setupMeteorWallet } from '@near-wallet-selector/meteor-wallet'
import meteorIconUrl from '@near-wallet-selector/meteor-wallet/assets/meteor-icon.png'

// wallet selector options
import { setupWalletSelector } from '@near-wallet-selector/core'
import { setupLedger } from '@near-wallet-selector/ledger'
import { setupMyNearWallet } from '@near-wallet-selector/my-near-wallet'
import { setupNearWallet } from '@near-wallet-selector/near-wallet'
import { sha256 } from 'js-sha256'
import axios from 'axios'
import { wallet } from './multi-wallet'

const THREEHUN_TGAS = '300000000000000'
const NO_DEPOSIT = '0'

// Wallet that simplifies using the wallet selector
export class NearWallet {
  walletSelector
  wallet
  network
  createAccessKeyFor
  accountId

  constructor({ createAccessKeyFor = undefined, network = 'testnet' }) {
    // Login to a wallet passing a contractId will create a local
    // key, so the user skips signing non-payable transactions.
    // Omitting the accountId will result in the user being
    // asked to sign all transactions.
    this.createAccessKeyFor = createAccessKeyFor
    this.network = network
    this.accountId = undefined
  }

  // To be called when the website loads
  async startUp() {
    this.walletSelector = await setupWalletSelector({
      network: this.network,
      modules: [
        setupNearWallet(),
        setupMeteorWallet({ iconUrl: meteorIconUrl }),
      ],
    })

    const isSignedIn = this.walletSelector.isSignedIn()

    if (isSignedIn) {
      this.wallet = await this.walletSelector.wallet()
      this.accountId =
        this.walletSelector.store.getState().accounts[0].accountId
      wallet.selectedChain = 'near'
      document.querySelector('#find_my_nft').style.display = 'block'
      document.querySelector('#sign_out').style.display = 'block'
      wallet.signIn()
    }
    this.setUpSignInModal()
    document.querySelector('#start_login_button').removeAttribute('disabled')
    return isSignedIn
  }

  // Sign-in method
  setUpSignInModal() {
    const description = 'Please select a wallet to sign in.'
    const modal = setupModal(this.walletSelector, {
      contractId: this.createAccessKeyFor,
      description,
    })
    modal.show()
    document
      .querySelector('#nearWallets')
      .insertBefore(
        document.querySelector('#near-wallet-selector-modal'),
        undefined
      )
    document.getElementsByClassName('modal-right')[0].innerHTML = ''
    document.getElementsByClassName('modal-left-title')[0].remove()
    const elements = document.getElementsByClassName('description')
    while (elements.length > 0) {
      elements[0].parentNode.removeChild(elements[0])
    }
  }

  // Sign-out method
  signOut() {
    this.wallet.signOut().then(() => {
      location.reload()
    })
  }

  // Make a read-only call to retrieve information from the network
  async viewMethod({ contractId, method, args = {} }) {
    const { network } = this.walletSelector.options
    const provider = new providers.JsonRpcProvider({ url: network.nodeUrl })

    let res = await provider.query({
      request_type: 'call_function',
      account_id: contractId,
      method_name: method,
      args_base64: Buffer.from(JSON.stringify(args)).toString('base64'),
      finality: 'optimistic',
    })
    return JSON.parse(Buffer.from(res.result).toString())
  }

  // Call a method that changes the contract's state
  async callMethod({
    contractId,
    method,
    args = {},
    gas = THREEHUN_TGAS,
    deposit = NO_DEPOSIT,
  }) {
    // Sign a transaction with the "FunctionCall" action
    const outcome = await this.wallet.signAndSendTransaction({
      signerId: this.accountId,
      receiverId: contractId,
      actions: [
        {
          type: 'FunctionCall',
          params: {
            methodName: method,
            args,
            gas,
            deposit,
          },
        },
      ],
    })

    return providers.getTransactionLastResult(outcome)
  }

  async verifyOwner(collection, tokenId) {
    const keyStore = new keyStores.BrowserLocalStorageKeyStore()
    const keyPair = await keyStore.getKey(this.network, this.accountId) // w

    let msg = {
      chain: 'NEAR',
      collection: collection,
      token_id: tokenId,
      pub_key: Buffer.from(keyPair.publicKey.data).toString('hex'),
      extra_info: {
        near_account_id: this.accountId,
      },
    }
    var hash_msg = JSON.stringify(msg)
    console.log(hash_msg)
    var hash = sha256.create()
    hash.update(hash_msg)
    hash_msg = hash.hex()
    var signature = keyPair.sign(Buffer.from(hash_msg))
    const body = {
      signature: Buffer.from(signature.signature).toString('hex'),
      message: msg,
    }
    console.log(body)

    var res = await axios.post(
      'http://ec2-44-201-5-87.compute-1.amazonaws.com:8080/login',
      body,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
    console.log('답 ', res)
    if (res.data.jwt !== undefined) {
      sessionStorage.setItem('jwt', res.data.jwt)
      return true
    } else return false
  }

  // Get transaction result from the network
  async getTransactionResult(txhash) {
    const { network } = this.walletSelector.options
    const provider = new providers.JsonRpcProvider({ url: network.nodeUrl })

    // Retrieve transaction result from the network
    const transaction = await provider.txStatus(txhash, 'unnused')
    return providers.getTransactionLastResult(transaction)
  }
}
