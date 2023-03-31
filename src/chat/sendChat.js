import { log, safe_send } from '../network/websocket'
import { closeForm } from './chatForm'
import { CHAT } from '../network/callType'
import { player } from '../js/global'
import { battle } from '../battle/battleClient'

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

  if (!battle.playing) {
    player.showChat(chat)

    safe_send({
      BoardCastChat: {
        content: chat,
      },
    })
  } else {
    battle.sendChat(chat)
  }
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
