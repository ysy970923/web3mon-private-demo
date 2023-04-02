import { partner_nfts } from '../data/accountsAndUrls'
import { wallet } from '../wallet/multi-wallet'
import { collection, setClothId, setNFTInfo, setPlayerUrl } from './logIn'

export async function findMyNFT() {
  document.getElementById('chain_containers').style.display = 'none'
  document.getElementById('loading_container').style.display = 'block'
  if (wallet.selectedChain === '' || wallet.getAccountId() === '') return
  var imgs = []
  var clothes = []
  // 초기화
  document.querySelector('#nftListBox').innerHTML = ''
  document.querySelector('#clothesBox').innerHTML = ''

  // 체인이 니어일 때
  if (wallet.selectedChain === 'NEAR') {
    var args = {
      account_id: wallet.getAccountId(),
      from_index: '0',
      limit: 50,
    }

    for (var collection of partner_nfts) {
      var data = await wallet.viewMethod({
        contractId: collection.account_id,
        method: 'nft_tokens_for_owner',
        args: args,
      })

      if (data.length !== 0) {
        data.forEach((nft) => {
          let img = document.createElement('img')
          if (nft.metadata.media.includes('https://'))
            img.src = nft.metadata.media
          else img.src = collection.base_uri + '/' + nft.metadata.media

          img.style = 'width: min(70px, 15%); opacity: 0.5;'
          img.setAttribute('collection', collection.account_id)
          img.setAttribute('asset_id', nft.token_id)
          if (collection.account_id.includes('nftv1')) {
            clothes.push(img)
            img.onclick = onClothClick
          } else {
            imgs.push(img)
            img.onclick = onImgClick
          }
        })
      }
    }

    imgs.forEach((i) => {
      document.querySelector('#nftListBox').appendChild(i)
    })

    clothes.forEach((i) => {
      document.querySelector('#clothesBox').appendChild(i)
    })

    if (imgs.length === 0) {
      let p = document.createElement('p')
      p.innerHTML = 'There is no NFT'
      document.querySelector('#nftListBox').appendChild(p)
    }

    if (clothes.length === 0) {
      let p = document.createElement('p')
      p.innerHTML = 'There are no Clothes'
      document.querySelector('#clothesBox').appendChild(p)
    }
  }

  // terra
  if (wallet.selectedChain === 'terra') {
    var nft_contract_list = [
      'terra17vysjt8ws64v8w696mavjpqs8mksf8s993qghlust9yey8qcmppqnhgw0e',
    ]
    document.querySelector('#nftListBox').innerHTML = ''
    document.getElementById('tokenId').value = ''
    var tmpClothes = [
      {
        src: 'https://bafybeihppeux4ojitk5nii4znq4t4vw6oa26arg2u7tv276vnhsklibpgy.ipfs.dweb.link/2.png',
        collection: 'tmp',
        asset_id: '2',
        name: 'Web3Mon #2',
      },
    ]
    for (var contract_id of nft_contract_list) {
      //   var args = {
      //     owner: wallet.getAccountId(),
      //   }
      var args = {}
      var res = await wallet.viewMethod({
        contractId: contract_id,
        method: 'all_tokens',
        args: args,
      })
      console.log(res)
      var key = Object.keys(res.data)[0]
      for (var i in res.data[key]) {
        var img = document.createElement('img')
        // var img_url = nft_data.extension.image
        // if (img_url === undefined) {
        var response = await fetch(res.data[key][i].metadata_uri, {
          method: 'GET',
        })
        response = await response.json()
        var nft_data = response
        // } else if (!img_url.includes('https://'))
        //   img_url = `https://ipfs.io/ipfs/${img_url.replace('ipfs://', '')}`
        img.src = nft_data.media
        img.style = 'width: min(100px, 15%); opacity: 0.5;'
        img.setAttribute('asset_id', nft)
        img.setAttribute('collection', contract_id)
        img.setAttribute('name', nft_data.title)
        img.onclick = onImgClick
        imgs.push(img)
      }
    }

    tmpClothes.forEach((e) => {
      var img = document.createElement('img')
      img.src = e.src
      img.style = 'width: min(100px, 15%); opacity: 0.5;'
      img.setAttribute('collection', e.collection)
      img.setAttribute('asset_id', e.asset_id)
      img.setAttribute('name', e.name)
      clothes.push(img)
      img.onclick = onClothClick
    })

    imgs.forEach((i) => {
      document.querySelector('#nftListBox').appendChild(i)
    })

    clothes.forEach((i) => {
      document.querySelector('#clothesBox').appendChild(i)
    })

    if (imgs.length === 0) {
      let p = document.createElement('p')
      p.innerHTML = 'There is no NFT'
      document.querySelector('#nftListBox').appendChild(p)
    }

    if (clothes.length === 0) {
      let p = document.createElement('p')
      p.innerHTML = 'There are no Clothes'
      document.querySelector('#clothesBox').appendChild(p)
    }
  }

  if (wallet.selectedChain === 'polygon') {
    var tmpImgs = [
      {
        asset_id: '10',
        name: 'tmp',
        src: 'https://ipfs.io/ipfs/Qmd6B6zQodChv6mMaWjMLidvRKvASXyjXEhF5McsiEr2tV/10.png',
        collection: 'tmp',
      },
    ]
    var tmpClothes = [
      {
        src: 'https://bafybeihppeux4ojitk5nii4znq4t4vw6oa26arg2u7tv276vnhsklibpgy.ipfs.dweb.link/2.png',
        collection: 'tmp',
        asset_id: '2',
        name: 'Web3Mon #2',
      },
    ]

    tmpImgs.forEach((e) => {
      var img = document.createElement('img')
      img.src = e.src
      img.style = 'width: min(100px, 15%); opacity: 0.5;'
      img.setAttribute('collection', e.collection)
      img.setAttribute('asset_id', e.asset_id)
      img.setAttribute('name', e.name)
      imgs.push(img)
      img.onclick = onImgClick
    })

    tmpClothes.forEach((e) => {
      var img = document.createElement('img')
      img.src = e.src
      img.style = 'width: min(100px, 15%); opacity: 0.5;'
      img.setAttribute('collection', e.collection)
      img.setAttribute('asset_id', e.asset_id)
      img.setAttribute('name', e.name)
      clothes.push(img)
      img.onclick = onClothClick
    })

    imgs.forEach((i) => {
      document.querySelector('#nftListBox').appendChild(i)
    })

    clothes.forEach((i) => {
      document.querySelector('#clothesBox').appendChild(i)
    })

    if (imgs.length === 0) {
      let p = document.createElement('p')
      p.innerHTML = 'There is no NFT'
      document.querySelector('#nftListBox').appendChild(p)
    }

    if (clothes.length === 0) {
      let p = document.createElement('p')
      p.innerHTML = 'There are no Clothes'
      document.querySelector('#clothesBox').appendChild(p)
    }
  }

  // 체인이 알고랜드일 때
  if (wallet.seletedChain === 'algo') {
    const base_url =
      'https://broken-spring-moon.algorand-mainnet.discover.quiknode.pro/index/v2/'
    const url = `accounts/${window.accountId}/assets`

    var res = await fetch(base_url + url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    res = await res.json()

    // 초기화
    document.querySelector('#nftListBox').innerHTML = ''
    document.getElementById('tokenId').value = ''
    let imgs = []

    for (var i in res.assets) {
      var nft = res.assets[i]
      if (nft.amount !== 1) continue
      let url = `assets/${nft['asset-id']}`

      var nft_data = await fetch(base_url + url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      nft_data = await nft_data.json()
      if (nft_data.asset.params['unit-name'] === undefined) continue
      if (nft_data.asset.params['unit-name'].startsWith(collection)) {
        let img = document.createElement('img')
        console.log(nft['asset-id'])

        img.src = `https://ipfs.io/ipfs/${nft_data.asset.params.url.replace(
          'ipfs://',
          ''
        )}`
        img.style = 'width: 100px; opacity: 0.5;'
        img.onclick = onImgClick(img, nft['asset-id'], nft['name'])
        imgs.push(img)
      }
    }

    imgs.forEach((i) => {
      document.querySelector('#nftListBox').appendChild(i)
    })
  }
  document.getElementById('loading_container').style.display = 'none'
  document.getElementById('nft_choose_container').style.display = 'flex'
}

let prevSelect = undefined
let prevSelectCloth = undefined

function onImgClick(e) {
  if (prevSelect !== undefined) prevSelect.style.opacity = 0.5
  e.target.style.opacity = 1.0
  prevSelect = e.target
  setPlayerUrl(e.target.src)
  setNFTInfo(
    e.target.getAttribute('collection'),
    e.target.getAttribute('asset_id')
  )
}

function onClothClick(e) {
  if (prevSelectCloth !== undefined) prevSelectCloth.style.opacity = 0.5
  e.target.style.opacity = 1.0
  prevSelectCloth = e.target
  setClothId(e.target.getAttribute('asset_id'))
}
