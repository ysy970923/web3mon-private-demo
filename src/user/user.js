import { Sprite } from '../object/Sprite'
import { local_position, setRenderables } from '../js/index'
import { animate } from '../animate'
import { adjustMapPosition, background, foreground, transferMapTo } from '../control/map'
import { battle } from '../battle/battleClient'
import { safe_send } from '../network/websocket'
import { myID, setPlayer, users } from '../js/global'
import { endLoadingScreen, startLoadingScreen } from '../web/loading'
import { partner_nfts } from '../data/accountsAndUrls'

const clothStorageLink = 'https://web3mon.s3.amazonaws.com/nftv1/'

export const worker = new Worker('./worker.js')

const chatBubble = new Image()
chatBubble.src = './../img/chatBubble2.png'

const terraLogo = new Image()
terraLogo.src = './../img/terra.png'

const nearLogo = new Image()
nearLogo.src = './../img/near.png'

const polygonLogo = new Image()
polygonLogo.src = './../img/polygonlogo.png'

const READYTEXT = 'Ready for Battle'

const canvas = document.getElementById('game_canvas')

const canva = canvas.getContext('2d')

export function startGame() {
  adjustMapPosition()
  endLoadingScreen()
  animate()
}

worker.onmessage = function (event) {
  if (event.data === undefined) return

  var user_id = event.data.id
  if (!(user_id in users)) return

  users[user_id].setSpriteImages('up', event.data.up)
  users[user_id].setSpriteImages('down', event.data.down)
  users[user_id].setSpriteImages('left', event.data.left)
  users[user_id].setSpriteImages('right', event.data.right)
  users[user_id].setSpriteImages('base', event.data.base)
  users[user_id].setDirection('down')
  users[user_id].made = true

  var resume_data = sessionStorage.getItem('resume-data')
  if (resume_data !== null) {
    resume_data = JSON.parse(resume_data)
    var opponent_id = resume_data.battle_data.opponent_id
    transferMapTo(resume_data.map, false)
    if (event.data.id === myID || event.data.id === opponent_id)
      if (myID in users && opponent_id in users) {
        if (users[myID].made && users[opponent_id].made) {
          startGame()
          battle.resume(resume_data.battle_data)
        }
      }
  } else {
    if (event.data.id === myID) {
      startGame()
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
  targetPosition
  position
  map
  moving
  chat
  chatShowTime
  clothId
  readyForBattle
  made

  constructor(
    id,
    nftCollection,
    tokenId,
    chain,
    nftUrl,
    clothId,
    map,
    coordinate
  ) {
    console.log(clothId)
    if (id === myID) {
      setPlayer(this)
    }

    this.position = { x: coordinate[0], y: coordinate[1] }
    if (coordinate[0] === 0 && coordinate[1] === 0) {
      this.position.x = 1500
      this.position.y = 350
    }
    this.targetPosition = this.position

    this.id = id
    this.nftCollection = nftCollection
    this.tokenId = tokenId
    this.chain = chain
    if (nftCollection === 'tinkerunion_nft.enleap.near') {
      nftUrl = nftUrl.replace('https://ipfs.fleek.co/ipfs', 'https://ipfs.io/ipfs')
    }
    console.log(nftUrl)
    this.nftUrl = nftUrl
    this.clothId = clothId
    this.map = map

    if (tokenId.length > 4)
      this.name = `${partner_nfts[nftCollection].name} #${tokenId.substring(0, 2)}...${tokenId.substring(tokenId.length - 2)}`
    else
      this.name = `${partner_nfts[nftCollection].name} #${tokenId}`

    this.sprite = new Sprite({
      position: this.position,
      frames: {
        max: 4,
        fps: 8,
      },
    })
    this.spriteImgs = {
      up: new Image(),
      down: new Image(),
      left: new Image(),
      right: new Image(),
      base: new Image(),
    }
    this.moving = false
    this.chat = ''
    this.chatShowTime = 0
    this.readyForBattle = false
    this.made = false

    worker.postMessage({
      id: id,
      url: nftUrl,
      leftSource: clothStorageLink + this.clothId + '/left.png',
      rightSource: clothStorageLink + this.clothId + '/right.png',
      downSource: clothStorageLink + this.clothId + '/down.png',
      upSource: clothStorageLink + this.clothId + '/up.png',
      contractAddress: nftCollection,
    })
  }

  setSpriteImages(direction, imageSrc) {
    this.spriteImgs[direction].src = imageSrc
  }

  setDirection(direction) {
    this.sprite.setImage(this.spriteImgs[direction])
  }

  setPosition(position, instant) {
    if (instant) {
      this.targetPosition = position
      this.position = position
      this.sprite.position = local_position(position)
    } else {
      this.targetPosition = position
    }
  }

  getNextBlock(delta) {
    var i = Math.floor((this.position.y + this.sprite.height - delta.y) / 80)
    var j = Math.floor((this.position.x + this.sprite.width / 2 - delta.x) / 80)
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
    if (this.id !== myID) {
      var moveDistance = 0.2 * passedTime

      var moveInX = this.targetPosition.x - this.position.x
      var moveInY = this.targetPosition.y - this.position.y

      if (moveInX > 100) {
        moveDistance *= 2
      }
      if (moveInY > 100) {
        moveDistance *= 2
      }
      this.setMoving(true)
      if (moveInX >= moveDistance) {
        this.position.x += moveDistance
      } else if (moveInX <= -1 * moveDistance) {
        this.position.x -= moveDistance
      } else if (moveInY >= moveDistance) {
        this.position.y += moveDistance
      } else if (moveInY <= -1 * moveDistance) {
        this.position.y -= moveDistance
      } else {
        this.setMoving(false)
      }
    }

    this.sprite.position = local_position(this.position)

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

    canva.font = '15px "210L"'
    canva.textAlign = 'center'
    if (this.id === myID) {
      canva.fillStyle = 'red'
      canva.fillText(
        '▼',
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
        this.sprite.position.x + textWidth / 2 + 60,
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
    } else if (this.chain === 'POLYGON') {
      canva.drawImage(
        polygonLogo,
        this.sprite.position.x + this.sprite.width / 2 - 5,
        this.sprite.position.y - 36,
        17,
        17
      )
    }

    this.sprite.draw(passedTime)
  }
}
