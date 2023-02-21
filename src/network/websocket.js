import { endBattle } from '../battle/battleScene'
import { local_position } from '../js/index'
import { ACTION, CHAT, NETWORK } from './callType'
import { npc_list } from '../data/npc'
import { displayBattleAcceptPopup } from '../battle/battleStart'
import { battle } from '../battle/battleClient'
import { myID, setMyID, users, User, player } from '../user/user'
import { turnToGameScreen } from '../user/logIn'

export let ws = null
const wsQueue = []

function onmessage(type, data) {
  if (type !== ACTION.MOVE) console.log('내려왔습니다', type, data)

  let id = data.id

  switch (type) {
    case 'your_player_id':
      setMyID(data)
      turnToGameScreen()
      console.log('My ID: ' + myID)
    case NETWORK.JOIN:
      console.log('실행합니다')
      // 유저가 들어왔다.
      break

    case NETWORK.LEAVE:
      delete users[data.leaved_player_id]
      break

    case NETWORK.MAP_STATUS:
      var currentUsers = new Set()
      data['player_infos_for_view'].forEach((avatar) => {
        currentUsers.add(avatar.player_id)
        if (!(avatar.player_id in users)) {
          var newUser = new User(
            avatar.player_id,
            'tmp',
            'tmp',
            'tmp',
            'tmp',
            'tmp',
            'MAIN'
          )
          //   newUser.setPosition(avatar.coordinate)
        }
      })
      for (var key in users) if (!currentUsers.has(key)) delete users[key]

      break

    case ACTION.MOVE:
      if (data.player_key === myID) {
        return
      } else {
        const id = data.player_key

        if (data.coordinate[0] === 1 && data.coordinate[1] === 1) {
          users[id].setMoving(false)
        } else {
          // 디렉션 계산해서 이미지 부여하기
          const newPosition = local_position({
            x: data.coordinate[0],
            y: data.coordinate[1],
          })

          const isRight = users[id].position.x - newPosition.x < -1
          const isBottom = users[id].position.y - newPosition.y < -1
          const isLeft = users[id].position.x - newPosition.x > 1
          const isUp = users[id].position.y - newPosition.y > 1

          if (isUp) users[id].setDirection('up')
          else if (isBottom) users[id].setDirection('down')
          else if (isLeft) users[id].setDirection('left')
          else if (isRight) users[id].setDirection('right')

          // 포지션 이동이 아니라 새로운 포지션까지 이동하는 애니메이션이어야 하는데?
          users[id].setPosition(newPosition)
          users[id].setMoving(true)
        }
      }
      break

    case CHAT.BOARD_CAST_CHAT:
      if (data.send_player_id !== myID)
        users[data.send_player_id].showChat(data['content'])
      break

    case ACTION.MAP_TRANSFER:
      console.log('유저의 맵이동', type, data)
      break

    case NETWORK.BATTLE_INIT:
      console.log('배틀 열림!', data)
      battle.start(data.battle_id, data.opponent_battle_exclusive_pub_key)
      break

    case NETWORK.BATTLE_OFFER:
      console.log('누가 나한테 배틀 신청함!', data)
      // 우선 수락할건지 말건지 화면을 보여줘야한다.
      displayBattleAcceptPopup(data.proposer_player_id)

      document
        .getElementById('acceptBattleBtn')
        .addEventListener('click', (e) => {
          battle.accept(data.battle_id, data.proposer_player_id)
        })

      document
        .getElementById('refuseBattleBtn')
        .addEventListener('click', (e) => {
          battle.refuse(data.battle_id, data.proposer_player_id)
        })
      break

    case NETWORK.BATTLE_REJECT:
      console.log('누가 내 배틀 거절함!', data.reason)
      if (!battle.started) {
        if (data.reason === 0) window.alert('Opponent is already on Battle')
        else if (data.reason === 1) window.alert('Opponent Refused to Battle')
      }

      break

    case NETWORK.BATTLE:
      if (data.message_type === 'Ok') {
      } else if (data.message_type === 'Next') {
      } else if (data.message_type === 'ByPass') {
        battle.receiveQueue.push(data.content)
      }
      break

    case NETWORK.LEAVE_BATTLE:
      if (battle.started && id === battle.data.opponent_id) {
        window.alert('opponent left the battle')
        endBattle()
      }
      break

    default:
      log_error('Unknown message received:')
      log_error(type)
  }
}
var wsInterval

export function onopen() {
  log('Server Connected')
  clearInterval(wsInterval)
  wsInterval = setInterval(() => {
    if (!checkOrReconnect()) return
    var msg = wsQueue.shift()
    if (msg != null)
      try {
        console.log(msg)
        ws.send(msg)
      } catch (e) {
        console.log(e)
        wsQueue.push(msg)
      }
  }, 1000)
}

export function onerror(data) {
  console.dir(data)
}

export function log(text) {
  var time = new Date()
}

export function log_error(text) {
  var time = new Date()
  console.trace('[' + time.toLocaleTimeString() + '] ' + text)
}

export function reportError(errMessage) {
  log_error(`Error ${errMessage.name}: ${errMessage.message}`)
}

function checkOrReconnect() {
  if (!ws) {
    // 연결이 끊겨 있으면 연결하기
    connect()
    return false
  }
  if (ws.readyState === WebSocket.CONNECTING) return false

  if (ws.readyState === WebSocket.OPEN) {
    return true
  }
  // connect()
  return false
}

// used to prevent websocket send failure
export function safe_send(msg) {
  console.log(msg)
  wsQueue.push(JSON.stringify(msg))
}

/**
 * 서버와 연결하도록 하는 함수
 * ws = new WebSocket(serverUrl)
 */
export function connect() {
  let serverUrl
  let scheme = 'ws'
  const hostName = 'ec2-44-201-5-87.compute-1.amazonaws.com:8080/ws'
  // var hostName = 'web3mon.yusangyoon.com'
  log('Hostname: ' + hostName)

  if (document.location.protocol === 'https:') {
    scheme += 's'
  }

  serverUrl = scheme + '://' + hostName
  log(`Connecting to server: ${serverUrl}`)

  if (ws != undefined) {
    ws.onerror = ws.onopen = ws.onclose = null
    ws.close()
  }

  serverUrl =
    'ws://ec2-44-201-5-87.compute-1.amazonaws.com:8080/ws-login?token='
  serverUrl = serverUrl + sessionStorage.getItem('jwt')

  ws = new WebSocket(serverUrl)

  console.log('웹소켓', ws)

  ws.binaryType = 'arraybuffer'

  ws.onopen = (e) => {
    // console.log('오픈 되었다', e)
    onopen()
  }

  ws.onerror = ({ data }) => onerror(data)
  ws.onmessage = ({ data }) => {
    const msg = JSON.parse(data)
    console.log(msg)
    const type = Object.keys(msg)[0]
    onmessage(type, msg[type])
  }
  ws.onclose = function (e) {
    console.log('Websocket Server is Closed! with : ', e)
    ws = null
  }
}
