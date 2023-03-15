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
  }

  setScale(scale) {
    this.shouldDraw = false
    this.scale = scale
  }

  draw() {
    if (!this.shouldDraw) {
      if (this.image !== undefined)
        if (this.image.complete) {
          this.width = (this.image.width / this.frames.max) * this.scale
          this.height = this.image.height * this.scale
          this.shouldDraw = true
        } else return
      else return
    }
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

    canva.drawImage(
      this.image,
      (this.frames.val * this.image.width) / this.frames.max,
      0,
      this.image.width / this.frames.max,
      this.image.height,
      this.position.x,
      this.position.y,
      this.width,
      this.height
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
