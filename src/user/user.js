import { Sprite } from '../object/Sprite'
import { canva, setRenderables } from '../js/index'
import { selectedClothId, playerUrl } from './logIn'
import { animate } from '../animate'
import { background, foreground } from '../control/map'
import { battle } from '../battle/battleClient'
import { safe_send } from '../network/websocket'
import axios from 'axios'
import { movePlayerToPosition, moveUser, stopUser } from '../control/move'

const clothStorageLink = 'https://web3mon.s3.amazonaws.com/nftv1/'

export const worker = new Worker('./worker.js')

const chatBubble = new Image()
chatBubble.src = './../img/chatBubble2.png'

export let player
export let myID
export const users = {}

const terraLogo = new Image()
terraLogo.src = './../img/terra.png'

const nearLogo = new Image()
nearLogo.src = './../img/near.png'

const READYTEXT = 'Ready for Battle'

export function setMyID(id) {
  myID = id
}

worker.onmessage = function (event) {
  console.log(event.data.id === myID)
  if (event.data) {
    if (!(event.data.id in users)) return
    users[event.data.id].setSpriteImages('up', event.data.up)
    users[event.data.id].setSpriteImages('down', event.data.down)
    users[event.data.id].setSpriteImages('left', event.data.left)
    users[event.data.id].setSpriteImages('right', event.data.right)
    users[event.data.id].setSpriteImages('base', event.data.base)
    users[event.data.id].setDirection('down')

    var resume_data = sessionStorage.getItem('resume-data')
    if (resume_data !== null) {
      resume_data = JSON.parse(resume_data)
      if (
        event.data.id === myID ||
        event.data.id === resume_data.battle_data.opponent_id
      )
        if (myID in users && resume_data.battle_data.opponent_id in users) {
          document.getElementById('loading').style.display = 'none'
          animate()
          battle.resume(resume_data.battle_data)
        }
    } else {
      if (event.data.id === myID) {
        movePlayerToPosition(1500, 350, false)
        document.getElementById('loading').style.display = 'none'
        animate()
      }
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
  readyForBattle

  constructor(id, nftCollection, tokenId, chain, nftUrl, clothId, map) {
    console.log(id)
    console.log(myID)
    if (id === myID) {
      player = this
      this.position = {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      }
    } else {
      this.position = {
        x: -200,
        y: -200,
      }
    }
    this.id = id
    this.nftCollection = nftCollection
    this.tokenId = tokenId
    this.chain = chain
    this.nftUrl = nftUrl
    if (clothId === 'tmp') clothId = selectedClothId
    this.clothId = clothId
    this.map = map

    if (nftCollection === 'asac.web3mon.testnet') nftCollection = 'ASAC'
    else if (nftCollection === 'nearnauts.web3mon.testnet')
      nftCollection = 'Nearnauts'

    this.name = `${nftCollection} #${tokenId}`

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
    this.readyForBattle = false
    console.log(id)
  }

  setSpriteImages(direction, imageSrc) {
    this.spriteImgs[direction].src = imageSrc
  }

  setDirection(direction) {
    this.sprite.setImage(this.spriteImgs[direction])
  }

  setPosition(position, instant) {
    this.position = position
    if (instant) {
      this.sprite.position = position
    }
  }

  getGlobalPosition() {
    return {
      x: this.position.x - background.position.x,
      y: this.position.y - background.position.y,
    }
  }

  getNextBlock(delta) {
    var globalPosition = this.getGlobalPosition()
    var i = Math.floor((globalPosition.y + this.sprite.height - delta.y) / 80)
    var j = Math.floor(
      (globalPosition.x + this.sprite.width / 2 - delta.x) / 80
    )
    return [i, j]
  }

  showChat(chat) {
    this.chat = chat
    this.chatShowTime = 0
  }

  setMoving(moving) {
    this.moving = moving
    this.sprite.animate = moving
  }

  changeBattleReadyState() {
    this.readyForBattle = !this.readyForBattle
    if (this.readyForBattle) {
      safe_send({
        ReadyBattle: {
          meaningless: 0,
        },
      })
    } else {
      safe_send({
        UnreadyBattle: {
          meaningless: 0,
        },
      })
    }
  }

  draw(passedTime) {
    var moveDistance = 0.2 * passedTime

    var moveInX = this.position.x - this.sprite.position.x
    var moveInY = this.position.y - this.sprite.position.y

    if (this.id !== myID)
      if (
        Math.abs(moveInX) < moveDistance &&
        Math.abs(moveInY) < moveDistance
      ) {
        this.setMoving(false)
      }

    if (moveInX > 100) {
      moveDistance *= 2
    }
    if (moveInY > 100) {
      moveDistance *= 2
    }
    if (moveInX >= moveDistance) {
      this.sprite.position.x += moveDistance
    } else if (moveInX <= -1 * moveDistance) {
      this.sprite.position.x -= moveDistance
    }

    if (moveInY >= moveDistance) {
      this.sprite.position.y += moveDistance
    } else if (moveInY <= -1 * moveDistance) {
      this.sprite.position.y -= moveDistance
    }

    canva.font = '15px "210L"'
    canva.textAlign = 'center'
    if (this.readyForBattle) {
      canva.fillStyle = 'red'
      canva.fillText(
        READYTEXT,
        this.sprite.position.x + this.sprite.width / 2,
        this.sprite.position.y - 50
      )
    }

    canva.fillStyle = 'black'
    if (this.chat.length > 0) {
      var textWidth = canva.measureText(this.chat).width
      this.chatShowTime += 1
      canva.drawImage(
        chatBubble,
        this.sprite.position.x + 40,
        this.sprite.position.y - 70,
        150,
        80
      )

      canva.fillText(
        this.chat,
        this.sprite.position.x + 55,
        this.sprite.position.y - 39
      )

      if (this.chatShowTime > 600) this.chat = ''
    }

    canva.fillText(
      this.name,
      this.sprite.position.x + this.sprite.width / 2,
      this.sprite.position.y
    )
    // draw logo
    if (this.chain === 'TERRA') {
      canva.drawImage(
        terraLogo,
        this.sprite.position.x + this.sprite.width / 2 - 5,
        this.sprite.position.y - 36,
        17,
        17
      )
    } else if (this.chain === 'NEAR') {
      canva.drawImage(
        nearLogo,
        this.sprite.position.x + this.sprite.width / 2 - 5,
        this.sprite.position.y - 36,
        17,
        17
      )
    }

    this.sprite.draw()
  }
}
