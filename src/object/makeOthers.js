import { others } from '../network/websocket'
import { Sprite } from './Sprite'
import { worker } from '../js/utils'
import { playerDownImage } from '../js/index'
import { clothesList } from '../js/clothes'

export const userDummy = {
  name: '김호진',
  userImageUrl:
    'data:image/jpeg;base64,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',
}

export const makeOthers = (id, coordinate, nickname, nft_image_url) => {
  let x = coordinate[0]
  let y = coordinate[1]
  if (x + y === 0) {
    x = window.innerWidth / 2 - 192 / 4 / 2
    y = window.innerHeight / 2 - 102 / 2
  }

  if (others[id] === undefined) {
    others[id] = {
      skillType: 1,
      draw: false,
      collection: 'msg.collection',
      sprite: new Sprite({
        position: {
          x: x,
          y: y,
        },
        image: playerDownImage,
        frames: {
          max: 4,
          hold: 10,
        },
        sprites: {
          up: new Image(),
          left: new Image(),
          right: new Image(),
          down: new Image(),
        },
        name: nickname,
        nftName: 'terra',
      }),
    }
    others[id].baseImage = new Image()
    worker.postMessage({
      url: userDummy.userImageUrl,
      contractAddress: 'test.collection',
      id: id,
      leftSource: clothesList[0].left,
      rightSource: clothesList[0].right,
      upSource: clothesList[0].up,
      downSource: clothesList[0].down,
    })
  }
  return
}
