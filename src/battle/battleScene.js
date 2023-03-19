import { animate } from '../animate'
import { Sprite } from '../object/Sprite'
import { battle } from './battleClient'
import { Monster } from '../object/Monster'
import { gsap } from 'gsap'
import { battleAnimationId } from './enterBattle'
import { users, player } from '../js/global'
import { removeBattleSkillBox } from './initialSetting'
import { adjustMapPosition } from '../control/map'
import { battleNameTagMaker } from '../web/battleNameTag'

export const battleBackground = new Sprite({
  position: {
    x: 0,
    y: 0,
  },
})

export function setBattleBackground(i) {
  battle.data.battleBackground = i
  var im = new Image()
  im.src = `../img/Battle background/${i + 1}.png`
  battleBackground.setImage(im)
}

export let renderedSprites = {}

/** 공격이 들어와서 내가 공격을 받음 */
export function renderState(data, battleState) {
  var myMonster = renderedSprites['me']
  var opponent = renderedSprites['op']
  var mySkill = battle.getPlayerAction(data.my_index)
  var opSkill = battle.getPlayerAction(1 - data.my_index)
  document
    .querySelector('#battleHistoryContent')
    .append(
      myMonster.name +
      ' used ' +
      mySkill.type +
      '\n' +
      opponent.name +
      ' used ' +
      opSkill.type
    )

  myMonster.adjustHealth(battleState.player_lp[data.my_index])
  opponent.adjustHealth(battleState.player_lp[1 - data.my_index])
  mySkill.render(myMonster, opponent, renderedSprites)
  opSkill.render(opponent, myMonster, renderedSprites)
  myMonster.addEffects(battleState.lasting_effect)
  opponent.addEffects(battleState.lasting_effect)

  if (myMonster.health <= 0) {
    myMonster.faint()
  }
  // 내가 이긴 경우
  else if (opponent.health <= 0) {
    opponent.faint()
  }
}

export function setUpNextSetting() {
  if (battle.isMyAttack())
    document.querySelector('#atk_or_def').innerText = 'ATTACK'
  else document.querySelector('#atk_or_def').innerText = 'DEFENSE'

  document.querySelector(
    '#battle_sequence'
  ).innerText = `Round: ${battle.battleState.sequence}`
}

/**
 *
 * @param {'win' | 'lose'} result 이겼으면 win, 졌으면 lose
 */
export function endBattle(result) {
  if (result === 'WIN') {
    console.log('이겼다.')
  } else if (result === 'LOSE') {
    console.log('졌다.')
  }
  removeBattleSkillBox()
  adjustMapPosition()

  // fade back to black
  gsap.to('#overlappingDiv', {
    opacity: 1,
    onComplete: () => {
      cancelAnimationFrame(battleAnimationId)
      animate()
      document.querySelector('#userInterface').style.display = 'none'
      document.getElementById('battleResultCard').style.display = 'block'
      document.getElementById(
        'battleResult'
      ).innerText = `You ${result}!\r\n${battle.data.bet_amount.substring(
        0,
        2
      )}$ MOVE To WINNER!`
      document.querySelector('#joyDiv').style.display = 'block'
      gsap.to('#overlappingDiv', {
        opacity: 0,
      })
      battle.started = false
    },
  })
}

/**
 * 진짜 배틀 시작, 배틀 맵으로 이동
 */
export function initBattle() {
  document.querySelector('#joyDiv').style.display = 'none'

  var opponent_user = users[battle.data.opponent_id]
  battleNameTagMaker(player.name, player.nftUrl, 'ME')
  battleNameTagMaker(opponent_user.name, opponent_user.nftUrl, 'OP')

  document.querySelector('#userInterface').style.display = 'block'

  var battleState = battle.battleState
  const opponentUser = {
    me_or_op: 'OP',
    name: opponent_user.name,
    health: battle.data.player_init_lp[1 - battle.data.my_index],
    skills: battleState.player_skills[1 - battle.data.my_index],
  }

  var opponent = new Monster(opponentUser)
  opponent.setScale(1.5)
  opponent.setImage(opponent_user.spriteImgs.base)
  opponent.adjustHealth(battleState.player_lp[1 - battle.data.my_index])

  const myCharacter = {
    me_or_op: 'ME',
    name: player.name,
    health: battle.data.player_init_lp[battle.data.my_index],
    skills: battleState.player_skills[battle.data.my_index],
  }

  var myMonster = new Monster(myCharacter)
  myMonster.setScale(1.5)
  myMonster.setImage(player.spriteImgs.base)
  myMonster.adjustHealth(battleState.player_lp[battle.data.my_index])

  renderedSprites['op'] = opponent
  renderedSprites['me'] = myMonster
  console.log(renderedSprites)

  document.getElementById('battle_skills').style.display = 'block'
}
