import { log, safe_send } from '../network/websocket'
import { closeForm } from './chatForm'
import { CHAT } from '../network/callType'
import { player } from '../js/global'

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
  player.showChat(chat)

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
  player.showChat(chat)

  safe_send({
    MapChat: {
      content: chat,
    },
  })
  closeForm()
}
