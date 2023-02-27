/* A helper file that simplifies using the wallet selector */
const { ethers } = require('ethers')

import { wallet } from './multi-wallet'
import axios from 'axios'

const THIRTY_TGAS = '30000000000000'
const NO_DEPOSIT = '0'

export class PolygonWallet {
  provider
  signer
  abi
  accountId

  async startUp() {
    this.provider = new ethers.providers.Web3Provider(window.ethereum)
    console.log()
    this.signer = this.provider.getSigner()
    const nftAddress = '0x419e82D502f598Ca63d821D3bBD8dFEFAf9Bbc8D'
    this.abi = [
      'function tokenURI(uint) view returns (string)',
    ]

    const nftContract = new ethers.Contract(nftAddress, this.abi, this.provider)
    var name = await nftContract.tokenURI(2104)
    console.log(name)
  }

  setUpSignInModal() {
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

  async verifyOwner(collection, token_id) {
    var body = {
      signature:
        'e47a8c30822b2e7281d834c19f1802ce9374fe1efc62d4a81405b27bd712d747cc0b9cd443f9ad170fe0970667215145744bd92be70292fb225d73675e8a8602',
      message: {
        chain: 'NEAR',
        collection: 'asac.web3mon.testnet',
        token_id: 'terra',
        pub_key:
          '95e02bcf0707b4c9b0fc1d650d01cbd1f2d611036ae4a9690c9677e5068e0c82',
        extra_info: { near_account_id: 'bob.web3mon.testnet' },
        clothes_nft_id: '2',
      },
    }

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
}
