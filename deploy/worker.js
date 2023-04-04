importScripts('https://unpkg.com/jimp@0.14.0/browser/lib/jimp.js')

const nftCropOffsets = {
  'nearnautnft.near': { x: 25, y: 0, w: 150, h: 150 },
  'near-punks.near': { x: 0, y: 40, w: 140, h: 150 },
  'asac.near': { x: 15, y: 15, w: 145, h: 145 },
  'tinkerunion_nft.enleap.near': { x: 27, y: 20, w: 140, h: 127 },
  'v0.apemetaerror.near': { x: 10, y: 0, w: 170, h: 170 },
  'cartelgen1.neartopia.near': { x: 30, y: 0, w: 115, h: 115 },
  'realbirds.near': { x: 27, y: 0, w: 127, h: 127 },
  'mrbrownproject.near': { x: 0, y: 0, w: 180, h: 180 },
  'rocketbois.neartopia.near': { x: 0, y: 0, w: 180, h: 180 },
  'lacrove.near': { x: 0, y: 0, w: 180, h: 180 },
  'near_starter.near': { x: 0, y: 0, w: 180, h: 180 },
  'nearcrashnft.near': { x: 0, y: 0, w: 180, h: 180 },
  'classykangaroos1.near': { x: 0, y: 0, w: 180, h: 180 },
  'nft.classykangaroosv2.near': { x: 0, y: 0, w: 180, h: 180 },
  'nft.goodfortunefelines.near': { x: 0, y: 0, w: 180, h: 180 },
  'ff.nekotoken.near': { x: 0, y: 0, w: 180, h: 180 },
  'mmc-pups.nfts.fewandfar.near': { x: 0, y: 0, w: 180, h: 180 },
  'nftv1.web3mon.near': { x: 0, y: 0, w: 180, h: 180 },
}

onmessage = function (event) {
  var data = event.data
  makeChracterImage(
    data.url,
    data.contractAddress,
    data.leftSource,
    data.rightSource,
    data.upSource,
    data.downSource
  ).then((sprite) => {
    sprite.id = data.id
    postMessage(sprite)
  })
}

const colorDistance = (c1, c2) =>
  Math.sqrt(
    Math.pow(c1.r - c2.r, 2) +
    Math.pow(c1.g - c2.g, 2) +
    Math.pow(c1.b - c2.b, 2) +
    Math.pow(c1.a - c2.a, 2)
  )

async function makeChracterImage(url, contractAddress, lis, ris, ups, downs) {
  var image = await Jimp.read({ url: url })
  image = image.resize(48 * 4, 48 * 4)
  var h = image.bitmap.height
  var w = image.bitmap.width

  const targetColors = []
  for (var i = 0; i < 10; i++) {
    targetColors.push(
      Jimp.intToRGBA(image.getPixelColor(0, Math.floor((i * h) / 20)))
    )
    targetColors.push(
      Jimp.intToRGBA(image.getPixelColor(w - 1, Math.floor((i * h) / 20)))
    )
  }
  // Distance between two colors
  const threshold = 32 // Replace colors under this threshold. The smaller the number, the more specific it is.
  image.scan(0, 0, image.bitmap.width, image.bitmap.height, (x, y, idx) => {
    if (x < 48 * 2 + 10 && x > 48 * 2 - 10 && y > 48 * 1) return

    const thisColor = {
      r: image.bitmap.data[idx + 0],
      g: image.bitmap.data[idx + 1],
      b: image.bitmap.data[idx + 2],
      a: image.bitmap.data[idx + 3],
    }
    for (var i = 0; i < 20; i++) {
      var targetColor = targetColors[i]
      if (colorDistance(targetColor, thisColor) <= threshold) {
        image.bitmap.data[idx + 0] = 0
        image.bitmap.data[idx + 1] = 0
        image.bitmap.data[idx + 2] = 0
        image.bitmap.data[idx + 3] = 0
        break
      }
    }
  })

  var sprite = {}

  sprite.base = await image.getBase64Async('image/png')

  var cropOffsets = nftCropOffsets[contractAddress]
  image = image.crop(cropOffsets.x, cropOffsets.y, cropOffsets.w, cropOffsets.h)
  image = image.resize(46, 48)

  var downImage = await Jimp.read({ url: downs })
  downImage = downImage.composite(image, 1, 0)
  downImage = downImage.composite(image, 48 + 1, 0)
  downImage = downImage.composite(image, 48 * 2 + 1, 0)
  downImage = downImage.composite(image, 48 * 3 + 1, 0)
  sprite.down = await downImage.getBase64Async('image/png')

  var upImage = await Jimp.read({ url: ups })
  upImage = upImage.composite(image, 1, 0)
  upImage = upImage.composite(image, 48 + 1, 0)
  upImage = upImage.composite(image, 48 * 2 + 1, 0)
  upImage = upImage.composite(image, 48 * 3 + 1, 0)
  sprite.up = await upImage.getBase64Async('image/png')

  var leftImage = await Jimp.read({ url: lis })
  leftImage = leftImage.composite(image, 1, 0)
  leftImage = leftImage.composite(image, 48 + 1, 0)
  leftImage = leftImage.composite(image, 48 * 2 + 1, 0)
  leftImage = leftImage.composite(image, 48 * 3 + 1, 0)
  sprite.left = await leftImage.getBase64Async('image/png')

  var rightImage = await Jimp.read({ url: ris })
  rightImage = rightImage.composite(image, 1, 0)
  rightImage = rightImage.composite(image, 48 + 1, 0)
  rightImage = rightImage.composite(image, 48 * 2 + 1, 0)
  rightImage = rightImage.composite(image, 48 * 3 + 1, 0)
  sprite.right = await rightImage.getBase64Async('image/png')

  return sprite
}
