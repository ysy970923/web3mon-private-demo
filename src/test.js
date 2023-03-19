import { animate } from "./animate"
import { adjustMapPosition } from "./control/map"
import { battle } from "./battle/battleClient"
import { initBattle } from "./battle/battleScene"
import { addBattleSkillBox } from "./battle/initialSetting"
import { setPlayer } from "./js/global"
import { users } from "./js/global"

function checkBattle() {
    setTimeout(() => {
        setPlayer({})
        player.nftUrl =
            'https://ipfs.io/ipfs/bafybeicj5zfhe3ytmfleeiindnqlj7ydkpoyitxm7idxdw2kucchojf7v4/1256.png'
        player.nftCollection = 'tmp'
        player.name = 'NearNauts #1312'
        player.spriteImgs = {
            base: 'https://ipfs.io/ipfs/bafybeicj5zfhe3ytmfleeiindnqlj7ydkpoyitxm7idxdw2kucchojf7v4/1256.png',
        }
        var data = {
            next_turn_expired_at: 100000,
            opponent_battle_exclusive_pub_key: 'safsaf',
            manager_battle_exclusive_pub_key: 'asdfsdf',
            battle_id: '0',
        }
        battle.start(data)
        battle.data.opponent_id = '0'
        users[battle.data.opponent_id] = {}
        users[battle.data.opponent_id].nftUrl =
            'https://ipfs.io/ipfs/bafybeicj5zfhe3ytmfleeiindnqlj7ydkpoyitxm7idxdw2kucchojf7v4/1256.png'
        users[battle.data.opponent_id].nftCollection = 'tmp'
        users[battle.data.opponent_id].name = 'ASAC #1232'
        users[battle.data.opponent_id].spriteImgs = {
            base: 'https://ipfs.io/ipfs/bafybeicj5zfhe3ytmfleeiindnqlj7ydkpoyitxm7idxdw2kucchojf7v4/1256.png',
        }
        battle.battleState.setPlayerSkills([
            { attacks: [0, 1, 5], defences: [0, 1, 2], random_number: 0 },
            { attacks: [0, 1, 5], defences: [0, 1, 2], random_number: 0 },
        ])
        battle.receiveStateSignature('{ "msg": "tmp" }')
        battle.data.my_index = 0

        battle.timerId = setInterval(() => battle.timer(), 1000)

        addBattleSkillBox()
        // 배틀화면 테스트 용도
        document.getElementById('login_screen').style.display = 'none'
        document.getElementById('game_screen').style.display = 'block'
        document.querySelector('canvas').style.display = 'block'
    }, 1000)
}

function checkSkillBox() {
    initBattle()
    document.getElementById('modal_container').addEventListener('click', (e) => {
        document.getElementById('modal_container').style.display = 'none'
        document.getElementById('skill_box_temp').style.display = 'none'
    })
}

function checkGuidanceCard() {
    adjustMapPosition()
    document.getElementById('loading').style.display = 'none'
    animate()
}

// checkGuidanceCard()