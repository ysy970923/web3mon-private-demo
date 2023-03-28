import { ethers } from 'ethers'

const P1 = 8353
const P2 = 7643

export function random_success_critical(r, prob) {
  return (r % P1) % 100 < prob
}

export function random_success_defence(r, prob) {
  return (r % P2) % 100 < prob
}

export function signMessage(signingKey, msg) {
  var messageHash = ethers.utils.id(msg)
  var messageHashBytes = ethers.utils.arrayify(messageHash)
  var signature = signingKey.signDigest(messageHashBytes)
  var signature_hex =
    signature.r + signature.s.substring(2) + '0' + signature.recoveryParam
  signature_hex = signature_hex.substring(2)
  return signature_hex
}

export function verifyMessage(vk_hex, msg, sig) {
  sig = '0x' + sig
  vk_hex = '0x' + vk_hex

  var messageHash = ethers.utils.id(msg)
  var messageHashBytes = ethers.utils.arrayify(messageHash)
  var addr = ethers.utils.recoverAddress(messageHashBytes, sig)
  var op_addr = ethers.utils.computeAddress(vk_hex)
  return addr === op_addr
}

export function hashMessage(msg) {
  return ethers.utils.id(msg).substring(2)
}

export function randInt() {
  return Math.floor(Math.random() * 1000000)
  // return 0
}

export function getCurrentTime() {
  return Math.floor(Date.now() / 1000)
}

export function battleLog(msg) {
  console.log(JSON.stringify(msg))
}