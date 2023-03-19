import { ethers } from 'ethers'

const P2 = 43
const P3 = 8353
const P4 = 7643
const P5 = 9973

export function random_success_reflection(r, prob) {
  return (r % P2) % 100 < prob
}

export function random_success_nullify_attack(r, prob) {
  return (r % P3) % 100 < prob
}

export function random_success_nullify_defence(r, prob) {
  return (r % P4) % 100 < prob
}

export function random_success_defence(r, prob) {
  return (r % P5) % 100 < prob
}

export async function signMessage(signingKey, msg) {
  var messageHash = ethers.utils.id(msg)
  var messageHashBytes = ethers.utils.arrayify(messageHash)
  var signature = await signingKey.signDigest(messageHashBytes)
  var signature_hex =
    signature.r + signature.s.substring(2) + '0' + signature.recoveryParam
  signature_hex = signature_hex.substring(2)
  return signature_hex
}

export async function verifyMessage(vk_hex, msg, sig) {
  sig = '0x' + sig
  vk_hex = '0x' + vk_hex

  var messageHash = ethers.utils.id(msg)
  var messageHashBytes = ethers.utils.arrayify(messageHash)
  var addr = ethers.utils.recoverAddress(messageHashBytes, sig)
  var op_addr = ethers.utils.computeAddress(vk_hex)
  return addr === op_addr
}
