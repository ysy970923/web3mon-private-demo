import { endBattle } from '../battle/battleScene'
import { local_position } from '../js/index'
import { ACTION, CHAT, NETWORK } from './callType'
import { npc_list } from '../data/npc'
import {
  displayBattleAcceptPopup,
  setUpBattleCard,
} from '../battle/battleStart'
import { battle } from '../battle/battleClient'
import { User, player } from '../user/user'
import { myID, setMyID } from '../js/global'
import { turnToGameScreen } from '../user/logIn'
import { moveUser } from '../control/move'
import { transferMapTo } from '../control/map'
import { users } from '../js/global'

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
        // temporary
        if (avatar.player_id === myID) {
          if (avatar.token_id === 'polygon')
            safe_send({
              BoardCastChat: {
                content: JSON.stringify({
                  nftCollection: 'Polygon Apes',
                  tokenId: '10',
                  chain: 'POLYGON',
                  nftUrl:
                    'https://ipfs.io/ipfs/Qmd6B6zQodChv6mMaWjMLidvRKvASXyjXEhF5McsiEr2tV/10.png',
                  clothes_nft_url: avatar.clothes_nft_url,
                  coordinate: [0, 0],
                }),
              },
            })
          if (avatar.token_id === 'polygon')
            safe_send({
              BoardCastChat: {
                content: JSON.stringify({
                  nftCollection: 'Galactic Punks',
                  tokenId: '100',
                  chain: 'TERRA',
                  nftUrl:
                    'https://ipfs.talis.art/ipfs/QmdUGyDFFBZMf92nf1fXxjoy2sNNL8oJbk1YBDCQzYfLuz/0.png',
                  clothes_nft_url: avatar.clothes_nft_url,
                  coordinate: [0, 0],
                }),
              },
            })
        }

        if (!(avatar.player_id in users)) {
          if (avatar.token_id !== 'terra' && avatar.token_id !== 'polygon') {
            var newUser = new User(
              avatar.player_id,
              avatar.collection,
              avatar.token_id,
              avatar.chain,
              avatar.nft_image_url,
              avatar.clothes_nft_url.substring(83).replace('.png', ''),
              'MAIN',
              avatar.coordinate
            )
            users[avatar.player_id] = newUser
          }
          //   newUser.setPosition(avatar.coordinate)
        }
      })
      for (var key in users) if (!currentUsers.has(key)) delete users[key]
      break

    case ACTION.MOVE:
      const id = data.player_key

      if (id === myID) {
        return
      }

      if (!(id in users)) {
        return
      }

      // 디렉션 계산해서 이미지 부여하기
      const newPosition = {
        x: data.coordinate[0],
        y: data.coordinate[1],
      }

      const isRight = users[id].targetPosition.x - newPosition.x < -1
      const isBottom = users[id].targetPosition.y - newPosition.y < -1
      const isLeft = users[id].targetPosition.x - newPosition.x > 1
      const isUp = users[id].targetPosition.y - newPosition.y > 1

      if (isUp) users[id].setDirection('up')
      else if (isBottom) users[id].setDirection('down')
      else if (isLeft) users[id].setDirection('left')
      else if (isRight) users[id].setDirection('right')

      // smooth move
      users[id].setPosition(newPosition, false)
      break

    // use as a tmp broadcaster
    case CHAT.BOARD_CAST_CHAT:
      console.log(data)
      if (data['content'][0] === '{') {
        var user_info = JSON.parse(data['content'])
        if (!(data.send_player_id in users))
          users[data.send_player_id] = new User(
            data.send_player_id,
            user_info.nftCollection,
            user_info.tokenId,
            user_info.chain,
            user_info.nftUrl,
            user_info.clothes_nft_url.substring(83).replace('.png', ''),
            'MAIN',
            user_info.coordinate
          )
      } else if (data.send_player_id !== myID) {
        users[data.send_player_id].showChat(data['content'])
      }
      break
    
    case CHAT.WHISPER_CHAT:
      console.log(data)
      battle.receiveChat(data)

    case 'ReadyBattle':
      console.log(data)
      break

    case ACTION.MAP_TRANSFER:
      console.log('유저의 맵이동', type, data)
      break

    case NETWORK.BATTLE_INIT:
      console.log('배틀 열림!', data)
      battle.init(data.battle_id, data.next_turn_expired_at)
      break

    case NETWORK.BATTLE_OFFER:
      console.log('누가 나한테 배틀 신청함!', data)
      // 우선 수락할건지 말건지 화면을 보여줘야한다.
      setUpBattleCard('accept', data.proposer_player_id, data.battle_id)
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
        battle.channelHandler.status.is_ok = true
      } else if (data.message_type === 'Next') {
        battle.channelHandler.receive_queue.push('next')
      } else if (data.message_type === 'ByPass') {
        battle.channelHandler.receive_queue.push(data.content)
      } else if (data.message_type === 'ConsensusState') {
        battle.channelHandler.receive_queue.push(data.content)
      }
      break

    case 'BattleCloseChannel':
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

  if (ws != undefined) {
    ws.onerror = ws.onopen = ws.onclose = null
    ws.close()
  }

  serverUrl = 'wss://dev-server.web3mon.io/ws-login?token='
  // serverUrl = 'wss://real-server.web3mon.io/ws-login?token='
  serverUrl = serverUrl + sessionStorage.getItem('jwt')
  log(`Connecting to server: ${serverUrl}`)

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
    const type = Object.keys(msg)[0]
    onmessage(type, msg[type])
  }
  ws.onclose = function (e) {
    console.log('Websocket Server is Closed! with : ', e)
    clearInterval(wsInterval)
    ws = null
  }
}
