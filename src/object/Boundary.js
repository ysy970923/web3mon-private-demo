import { canva } from '../js/index'
export class Boundary {
  static width = 80
  static height = 80
  constructor({ position, type }) {
    this.position = position
    this.width = 80
    this.height = 80
    this.type = type
  }

  draw() {
    if (this.type === 'battle') {
      canva.fillStyle = 'rgba(255, 0, 0, 0.5)'
      canva.fillRect(this.position.x, this.position.y, this.width, this.height)
      canva.fillStyle = 'rgba(0, 0, 0, 1.0)'
    }
  }
}
