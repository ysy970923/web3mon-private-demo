/* A helper file that simplifies using the wallet selector */

import {
  getChainOptions,
  WalletController,
} from '@terra-money/wallet-controller'

import {
  Connection,
  ConnectType,
  WalletStates,
  WalletStatus,
} from '@terra-money/wallet-controller'

import {
  ConnectedWallet,
  createLCDClient,
} from '@terra-money/wallet-controller'

import { Subscription, combineLatest } from 'rxjs'

const THIRTY_TGAS = '30000000000000'
const NO_DEPOSIT = '0'

export class TerraWallet {
  availableConnections
  controller
  accountId

  async startUp() {
    const chainOptions = await getChainOptions()

    var controller = new WalletController({
      ...chainOptions,
    })

    const availableConnectTypes = []
    const availableInstallTypes = []
    this.availableConnections = []
    const states = []
    const supportFeatures = []

    let subscription = null

    subscription = await combineLatest([
      controller.availableConnectTypes(),
      controller.availableInstallTypes(),
      controller.availableConnections(),
      controller.states(),
    ]).subscribe(
      ([
        _availableConnectTypes,
        _availableInstallTypes,
        _availableConnections,
        _states,
      ]) => {
        availableInstallTypes.value = _availableInstallTypes
        availableConnectTypes.value = _availableConnectTypes
        this.availableConnections.value = _availableConnections
        states.value = _states
        supportFeatures.value =
          _states.status === WalletStatus.WALLET_CONNECTED
            ? Array.from(_states.supportFeatures)
            : []
      }
    )
    this.controller = controller

    var connectedWallet = {}
    var balance = {}

    subscription = controller
      .connectedWallet()
      .subscribe((_connectedWallet) => {
        connectedWallet.value = _connectedWallet

        if (_connectedWallet) {
          const lcd = createLCDClient({ network: _connectedWallet.network })

          lcd.bank.balance(_connectedWallet.terraAddress).then(([coins]) => {
            balance.value = coins
          })
          this.accountId = _connectedWallet.terraAddress
          window.chain = 'terra'
          document.querySelector('#find_my_nft').style.display = 'block'
          document.querySelector('#sign_out').style.display = 'block'
          window.wallet.signIn()
        } else {
          balance.value = null
        }
        this.signIn()
        document
          .querySelector('#start_login_button')
          .removeAttribute('disabled')
      })
  }

  signIn() {
    document.querySelector('#terraWallets').innerHTML = ''
    this.availableConnections.value.forEach((e) => {
      if (e.name[0] !== 'V') {
        var button = document.createElement('button')
        button.classList.add('one_collection')
        button.innerHTML = `<div class="img_outer">
        <img src=${e.icon} />
      </div>
      <div class="collection_name">${e.name}</div>`
        button.addEventListener('click', (ev) => {
          this.controller.connect(e.type, e.identifier).then(() => {
            location.reload()
          })
        })

        document.querySelector('#terraWallets').appendChild(button)
      }
    })
  }

  signOut() {
    this.controller.disconnect()
    location.reload()
  }

  async viewMethod({ contractId, method, args = {} }) {
    var base_url = `https://phoenix-lcd.terra.dev/cosmwasm/wasm/v1/contract/${contractId}/smart/`
    var url = `${window.btoa(`{"${method}":${JSON.stringify(args)}}`)}`
    var res = await fetch(base_url + url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    document.querySelector('#nftListBox').innerHTML = ''
    document.getElementById('tokenId').value = ''
    res = await res.json()
    console.log(res)
    return res
  }
}
