const chatBubble = new Image()
chatBubble.src = './../img/chatBubble2.png'

export const terraLogo = new Image()
terraLogo.src = './../img/terra.png'

export const nearLogo = new Image()
nearLogo.src = './../img/near.png'

import { canva } from '../js/index'

export class Sprite {
  constructor({
    position,
    image,
    frames = { max: 1, hold: 10 },
    sprites,
    animate = false,
    rotation = 0,
    scale = 1,
    name = '',
    baseImage = '',
    map = 'MAIN',
    nftName = '',
    myCharacter = false,
  }) {
    this.map = map
    this.relative_position = { x: 0, y: 0 }
    this.position = position
    this.image = new Image()
    this.frames = { ...frames, val: 0, elapsed: 0 }
    this.image.onload = () => {
      this.width = (this.image.width / this.frames.max) * scale
      this.height = this.image.height * scale
    }
    this.image.src = image.src

    this.animate = animate
    this.sprites = sprites
    this.opacity = 1

    this.rotation = rotation
    this.scale = scale
    this.name = name
    this.chat = ''
    this.chatShowTime = 0
    this.baseImage = baseImage
    this.nftName = nftName
    this.myCharacter = myCharacter
  }

  draw() {
    canva.save()
    canva.translate(
      this.position.x + this.width / 2,
      this.position.y + this.height / 2
    )
    canva.rotate(this.rotation)
    canva.translate(
      -this.position.x - this.width / 2,
      -this.position.y - this.height / 2
    )
    canva.globalAlpha = this.opacity

    const crop = {
      position: {
        x: this.frames.val * this.width,
        y: 0,
      },
      width: this.image.width / this.frames.max,
      height: this.image.height,
    }

    const image = {
      position: {
        x: this.position.x,
        y: this.position.y,
      },
      width: this.image.width / this.frames.max,
      height: this.image.height,
    }

    if (this.name.length > 0) {
      canva.font = '10px "Press Start 2P"'
      var textWidth = canva.measureText(this.name).width
      canva.fillText(
        this.name,
        image.position.x + image.width / 2 - textWidth / 2,
        image.position.y - 5
      )
      // draw logo
      if (this.nftName) {
        if (this.nftName === 'terra') {
          canva.drawImage(
            terraLogo,
            image.position.x + image.width / 2 - 5,
            image.position.y - 36,
            17,
            17
          )
        } else if (this.nftName === 'Npunks') {
          canva.drawImage(
            nearLogo,
            image.position.x + image.width / 2 - 5,
            image.position.y - 36,
            17,
            17
          )
        }
      }
      if (this.myCharacter) {
        // canva.drawImage(
        //   nearLogo,
        //   image.position.x + image.width / 2 - 5,
        //   image.position.y + image.height / 2 + 50,
        //   17,
        //   17
        // )
      }
    }

    if (this.chat.length > 0) {
      this.chatShowTime += 1
      canva.drawImage(
        chatBubble,
        image.position.x + 40,
        image.position.y - 70,
        150,
        80
      )

      canva.fillText(this.chat, image.position.x + 55, image.position.y - 39)

      if (this.chatShowTime > 600) {
        this.chatShowTime = 0
        this.chat = ''
      }
    }
    canva.drawImage(
      this.image,
      crop.position.x,
      crop.position.y,
      crop.width,
      crop.height,
      image.position.x,
      image.position.y,
      image.width * this.scale,
      image.height * this.scale
    )

    canva.restore()

    if (!this.animate) return

    if (this.frames.max > 1) {
      this.frames.elapsed++
    }

    if (this.frames.elapsed % this.frames.hold === 0) {
      if (this.frames.val < this.frames.max - 1) this.frames.val++
      else this.frames.val = 0
    }
  }
}
