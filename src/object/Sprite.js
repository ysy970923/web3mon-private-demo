import { canva } from '../js/index'

export class Sprite {
  image
  width
  height
  shouldDraw
  constructor({
    position,
    frames = { max: 1, hold: 10 },
    animate = false,
    rotation = 0,
    scale = 1,
    map = 'MAIN',
  }) {
    this.map = map
    this.position = position
    this.frames = { ...frames, val: 0, elapsed: 0 }

    this.animate = animate
    this.opacity = 1
    this.rotation = rotation
    this.scale = scale
    this.shouldDraw = false
  }

  setImage(image) {
    this.shouldDraw = false
    this.image = image
    this.image.onload = () => {
      this.width = (image.width / this.frames.max) * this.scale
      this.height = image.height * this.scale
      this.shouldDraw = true
    }
    if (image.complete) {
      this.width = (image.width / this.frames.max) * this.scale
      this.height = image.height * this.scale
      this.shouldDraw = true
    }
  }

  draw() {
    if (!this.shouldDraw) return
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

    canva.drawImage(
      this.image,
      crop.position.x,
      crop.position.y,
      crop.width,
      crop.height,
      this.position.x,
      this.position.y,
      this.width * this.scale,
      this.height * this.scale
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
