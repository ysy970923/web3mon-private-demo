import { animate } from '../animate'
import { Sprite } from '../object/Sprite'
import { Monster } from '../object/Monster'
import { gsap } from 'gsap'
import { battleAnimationId } from './enterBattle'
import { users, player, battleRenderedSprites } from '../js/global'
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
  var im = new Image()
  im.src = `../img/Battle background/${i + 1}.png`
  battleBackground.setImage(im)
}

/** 공격이 들어와서 내가 공격을 받음 */
export function renderState(battleState, actions, my_index) {
  var myMonster = battleRenderedSprites['me']
  var opponent = battleRenderedSprites['op']
  var mySkill = battleState.player_skills[my_index][actions[my_index].action_index]
  var op_index = 1 - my_index
  var opSkill = battleState.player_skills[op_index][actions[op_index].action_index]

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

  myMonster.adjustHealth(battleState.player_lp[my_index])
  opponent.adjustHealth(battleState.player_lp[1 - my_index])
  mySkill.render(myMonster, opponent, battleRenderedSprites)
  opSkill.render(opponent, myMonster, battleRenderedSprites)
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

export function fillBanner(is_my_attack, sequence, pick_time_left) {
  if (is_my_attack)
    document.querySelector('#atk_or_def').innerText = 'ATTACK'
  else document.querySelector('#atk_or_def').innerText = 'DEFENSE'

  document.getElementById('battle_sequence').innerText = `Round: ${sequence}`

  document.getElementById('battle_left_time').innerText = `00:${pick_time_left}`
}

/**
 *
 * @param {'win' | 'lose'} result 이겼으면 win, 졌으면 lose
 */
export function endBattle(result, bet_amount) {
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
      ).innerText = `You ${result}!\r\n${bet_amount.substring(
        0,
        2
      )}$ MOVE To WINNER!`
      document.querySelector('#joyDiv').style.display = 'block'
      gsap.to('#overlappingDiv', {
        opacity: 0,
      })
    },
  })
}

/**
 * 진짜 배틀 시작, 배틀 맵으로 이동
 */
export function initBattle(opponent_id, battleState, my_index) {
  document.querySelector('#joyDiv').style.display = 'none'

  var opponent_user = users[opponent_id]
  battleNameTagMaker(player.name, player.nftUrl, 'ME')
  battleNameTagMaker(opponent_user.name, opponent_user.nftUrl, 'OP')

  document.querySelector('#userInterface').style.display = 'block'

  const opponentUser = {
    me_or_op: 'OP',
    name: opponent_user.name,
    health: 100,
    skills: battleState.player_skills[1 - my_index],
  }

  var opponent = new Monster(opponentUser)
  opponent.setScale(1.5)
  opponent.setImage(opponent_user.spriteImgs.base)
  opponent.adjustHealth(battleState.player_lp[1 - my_index])

  const myCharacter = {
    me_or_op: 'ME',
    name: player.name,
    health: 100,
    skills: battleState.player_skills[my_index],
  }

  var myMonster = new Monster(myCharacter)
  myMonster.setScale(1.5)
  myMonster.setImage(player.spriteImgs.base)
  myMonster.adjustHealth(battleState.player_lp[my_index])

  battleRenderedSprites['op'] = opponent
  battleRenderedSprites['me'] = myMonster

  document.getElementById('battle_skills').style.display = 'block'
}
