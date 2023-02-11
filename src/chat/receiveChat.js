export function receiveMsgFromAll(data) {
  console.log('온 채팅', data)

  var msg = JSON.parse(data)
  return msg
}

export function receiveMsgFromPeer(data) {
  var buf = new Uint8Array(data).slice(5)

  var decoder = new TextDecoder()
  var msg = JSON.parse(decoder.decode(buf))
  return msg
}
