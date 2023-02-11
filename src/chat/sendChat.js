import { log, safe_send, myID } from '../network/websocket'
import { player } from '../js/index'
import { closeForm } from './chatForm'
import { CHAT } from '../network/callType'

document
  .getElementById('sendChatBtn')
  .addEventListener('click', sendChat, false)

document.getElementById('chatForm').addEventListener('submit', (e) => {
  e.preventDefault()
  sendChat()
})

export function sendChat() {
  console.log('클릭은됨')

  const chat = document.querySelector('#chat').value
  player.chat = chat

  safe_send({
    BoardCastChat: {
      content: chat,
    },
  })
  closeForm()
}

export function sendWhisperChat(receiver_id) {
  const chat = document.querySelector('#chat').value

  safe_send({
    WhisperChat: {
      content: chat,
      receiver_player_id: receiver_id,
    },
  })
  closeForm()
}

export function sendMapChat() {
  const chat = document.querySelector('#chat').value
  player.chat = chat

  safe_send({
    MapChat: {
      content: chat,
    },
  })
  closeForm()
}
