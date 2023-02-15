import { Sprite } from '../object/Sprite'
import { startMoveSender } from '../control/move'
import { canva } from '../js/index'
import { selectedClothId, playerUrl } from './logIn'
import { animate } from '../animate'

const clothStorageLink = 'https://web3mon.s3.amazonaws.com/nftv1/'

export const worker = new Worker('./worker.js')

const chatBubble = new Image()
chatBubble.src = './../img/chatBubble2.png'

export let myID
export const users = {}

const terraLogo = new Image()
terraLogo.src = './../img/terra.png'

const nearLogo = new Image()
nearLogo.src = './../img/near.png'

export function setMyID(id) {
  myID = id
}

worker.onmessage = function (event) {
  console.log(event.data.id === myID)
  if (event.data) {
    users[event.data.id].setSpriteImages('up', event.data.up)
    users[event.data.id].setSpriteImages('down', event.data.down)
    users[event.data.id].setSpriteImages('left', event.data.left)
    users[event.data.id].setSpriteImages('right', event.data.right)
    users[event.data.id].setSpriteImages('base', event.data.base)
    users[event.data.id].setDirection('down')

    if (event.data.id === myID) {
      document.getElementById('loading').style.display = 'none'
      animate()
    }
  }
}
worker.onerror = function (err) {
  console.log(err)
}

export class User {
  id
  name
  nftCollection
  tokenId
  chain
  sprite
  spriteImgs
  nftUrl
  position
  map
  moving
  chat
  chatShowTime
  clothId

  constructor(id, nftCollection, tokenId, chain, nftUrl, clothId, map) {
    users[id] = this
    this.id = id
    this.nftCollection = nftCollection
    this.tokenId = tokenId
    if (chain === 'tmp') chain = 'near'
    this.chain = chain
    if (nftUrl === 'tmp') nftUrl = playerUrl
    this.nftUrl = nftUrl
    if (clothId === 'tmp') clothId = selectedClothId
    this.clothId = clothId
    this.map = map
    this.name = `${nftCollection}-${tokenId}`
    this.position = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    }
    this.sprite = new Sprite({
      position: this.position,
      frames: {
        max: 4,
        hold: 10,
      },
    })
    this.spriteImgs = {
      up: new Image(),
      down: new Image(),
      left: new Image(),
      right: new Image(),
      base: new Image(),
    }

    worker.postMessage({
      id: id,
      url: nftUrl,
      leftSource: clothStorageLink + this.clothId + '/left.png',
      rightSource: clothStorageLink + this.clothId + '/right.png',
      downSource: clothStorageLink + this.clothId + '/down.png',
      upSource: clothStorageLink + this.clothId + '/up.png',
      contractAddress: nftCollection,
    })
    this.moving = false
    this.chat = ''
    this.chatShowTime = 0
    if (id === myID) startMoveSender()
    console.log(id)
  }

  setSpriteImages(direction, imageSrc) {
    this.spriteImgs[direction].src = imageSrc
  }

  setDirection(direction) {
    this.sprite.setImage(this.spriteImgs[direction])
  }

  setPosition(position) {
    this.position = position
    this.sprite.position = position
  }

  showChat(chat) {
    this.chat = chat
    this.chatShowTime = 0
  }

  setMoving(moving) {
    this.moving = moving
    this.sprite.animate = moving
  }

  draw() {
    if (this.chat.length > 0) {
      this.chatShowTime += 1
      canva.drawImage(
        chatBubble,
        this.position.x + 40,
        this.position.y - 70,
        150,
        80
      )

      canva.fillText(this.chat, this.position.x + 55, this.position.y - 39)

      if (this.chatShowTime > 600) this.chat = ''
    }

    // canva.font = '10px "Press Start 2P"'
    var textWidth = canva.measureText(this.name).width
    canva.fillText(
      this.name,
      this.position.x + this.sprite.width / 2 - textWidth / 2,
      this.position.y - 5
    )
    // draw logo
    if (this.chain === 'terra') {
      canva.drawImage(
        terraLogo,
        this.position.x + this.sprite.width / 2 - 5,
        this.position.y - 36,
        17,
        17
      )
    } else if (this.chain === 'near') {
      canva.drawImage(
        nearLogo,
        this.position.x + this.sprite.width / 2 - 5,
        this.position.y - 36,
        17,
        17
      )
    }

    this.sprite.draw()
  }
}
