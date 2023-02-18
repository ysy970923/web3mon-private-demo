export function rectangularCollision({ rectangle1, rectangle2 }) {
  return (
    rectangle1.position.x + rectangle1.width >= rectangle2.position.x &&
    rectangle1.position.x <= rectangle2.position.x + rectangle2.width &&
    rectangle1.position.y <= rectangle2.position.y + rectangle2.height &&
    rectangle1.position.y + rectangle1.height >= rectangle2.position.y
  )
}

export function userBoundaryCollision({user, boundary}) {
    var userFootX = user.position.x + user.width / 2
    var userFootY = user.position.y + user.height
    return (
        userFootX >= boundary.position.x &&
        userFootX < boundary.position.x + boundary.width &&
        userFootY >= boundary.position.y &&
        userFootY < boundary.position.y + boundary.height
    )
}

export function checkForCharacterCollision({
  characters,
  player,
  characterOffset = { x: 0, y: 0 },
}) {
  // monitor for character collision
  for (let i = 0; i < characters.length; i++) {
    const character = characters[i]

    if (
      rectangularCollision({
        rectangle1: player,
        rectangle2: {
          ...character,
          position: {
            x: character.position.x + characterOffset.x,
            y: character.position.y + characterOffset.y,
          },
        },
      })
    ) {
      console.log('go')
    }
  }
}
