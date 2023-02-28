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
    if (window.ethereum !== undefined) {
      this.provider = new ethers.providers.Web3Provider(window.ethereum)
      this.signer = this.provider.getSigner()
      console.log(this.signer)
      const nftAddress = '0x419e82D502f598Ca63d821D3bBD8dFEFAf9Bbc8D'
      this.abi = ['function tokenURI(uint) view returns (string)']

      const nftContract = new ethers.Contract(
        nftAddress,
        this.abi,
        this.provider
      )
      var name = await nftContract.tokenURI(2104)
      try {
        var accountId = await this.signer.getAddress()
        this.accountId = accountId
        wallet.selectedChain = 'polygon'
        document.querySelector('#find_my_nft').style.display = 'block'
        document.querySelector('#sign_out').style.display = 'block'
        wallet.signIn()
      } catch (e) {}
    }
    await this.setUpSignInModal()
  }

  async setUpSignInModal() {
    document.getElementById('metamaskBtn').addEventListener('click', () => {
      if (window.ethereum === undefined) {
        window.alert('Install Metamask First')
        return
      }
      this.provider.send('eth_requestAccounts', []).then(() => {
        location.reload()
      })
    })
  }

  signOut() {
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
        'fd76dd8eb884aea25aff476f20c99cca8ff8e60f37cc6e882abacae86e8f36be36ab67120baf0534fd528449bb66962b386600dd27e9f38db4549ae1c6ab7f00',
      message: {
        chain: 'NEAR',
        collection: 'asac.web3mon.testnet',
        token_id: 'polygon',
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
