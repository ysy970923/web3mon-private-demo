import { player, setPlayer, users } from '../user/user'
import { battle } from './battleClient'
import { ATTACKS, DEFENCES, SKILL_DESCRIPTIONS } from './skills'

export let selectedSkill = []
export let selectedDefenceSkills = []

/**
 * Choose which skill to bring in battle
 */
const skillBoxAdd = () => {
  let div = document.querySelector('.attack_skill_box')
  div.innerHTML = ''
  let attackSkills = []

  let tooltip = document.createElement('div')
  tooltip.className = 'skill_hover_tooltip'
  tooltip.id = 'tooltip'

  for (let i = 0; i < ATTACKS.length; i++) {
    let skillBox = document.createElement('div')
    var skillType = ATTACKS[i]
    skillBox.className = 'one_atk_skill_box'
    skillBox.innerHTML = `
      <img src="../../img/skillThumbnails/${SKILL_DESCRIPTIONS[skillType].img}" />
    `
    skillBox.id = skillType

    skillBox.onmouseover = (e) => {
      hoverTooltip(e.currentTarget.id, tooltip, skillBox)
    }
    skillBox.onmouseleave = (e) => {
      tooltip.style.display = 'none'
    }

    skillBox.onclick = (e) => {
      if (selectedSkill.includes(i)) {
        skillBox.style.background = null
        selectedSkill = selectedSkill.filter((doc) => doc !== i)
      } else {
        console.log(selectedSkill, 'Qq')
        if (selectedSkill.length < 3) {
          selectedSkill.push(i)
          skillBox.style.background = 'var(--primary-color01)'
        }
      }
    }

    attackSkills.push(skillBox)
  }
  attackSkills.forEach((doc) => {
    div.append(doc)
  })

  // defence add.
  let defdiv = document.querySelector('.defense_skill_box')
  defdiv.innerHTML = ''
  let defenceSkills = []

  let tooltip2 = document.createElement('div')
  tooltip2.className = 'skill_hover_tooltip'
  tooltip2.id = 'tooltip'

  for (let i = 0; i < DEFENCES.length; i++) {
    let skillBox = document.createElement('div')
    var skillType = DEFENCES[i]

    skillBox.className = 'one_atk_skill_box'
    skillBox.innerHTML = `
    <img src=".././../img/skillThumbnails/${SKILL_DESCRIPTIONS[skillType].img}" />
    `

    skillBox.id = skillType

    skillBox.onmouseover = (e) => {
      hoverTooltip(e.currentTarget.id, tooltip2, skillBox)
    }
    skillBox.onmouseleave = (e) => {
      tooltip2.style.display = 'none'
    }

    skillBox.onclick = (e) => {
      if (selectedDefenceSkills.includes(i)) {
        skillBox.style.background = 'white'
        selectedDefenceSkills = selectedDefenceSkills.filter((doc) => doc !== i)
      } else {
        console.log(selectedDefenceSkills, 'Qq')
        if (selectedDefenceSkills.length < 3) {
          selectedDefenceSkills.push(i)
          skillBox.style.background = 'var(--primary-color)'
        }
      }
    }

    defenceSkills.push(skillBox)
  }
  defenceSkills.forEach((doc) => {
    defdiv.append(doc)
  })
}

export const addBattleSkillBox = () => {
  let box = document.getElementById('battle_skills_attack')
  let box2 = document.getElementById('battle_skills_defense')

  box.innerHTML = ''
  box2.innerHTML = ''

  let tooltip = document.createElement('div')
  tooltip.className = 'battle_skill_hover_tooltip'
  tooltip.id = 'battle_tooltip'
  tooltip.style.width = '300px'

  let attackSkills = []
  let defenseSkills = []
  for (let i = 0; i < 3; i++) {
    let skillBox = document.createElement('div')
    var skillType =
      battle.battleState.player_skills[battle.data.my_index][i].type
    skillBox.className = `battle_one_skill a${i} atk_skill_buttons`
    skillBox.innerHTML = `
    <img src="../../img/skillThumbnails/${SKILL_DESCRIPTIONS[skillType].img}" />
    `
    skillBox.id = `Box-${skillType}`
    skillBox.value = i
    skillBox.onmouseover = (e) => {
      hoverBattleToolTip(e.currentTarget.value, tooltip, skillBox)
    }
    skillBox.onmouseleave = (e) => {
      tooltip.style.display = 'none'
    }
    skillBox.onclick = (e) => {
      // 스킬 사용
      if (e.currentTarget.disabled) {
        window.alert('Please use Defense Skill')
        return
      }

      battle.chooseAction(e.currentTarget.value)
      document.querySelector('#actionContent').innerText =
        'Used ' + e.currentTarget.id.substring(4)
      document.querySelector('#battlePopUpCard').style.display = 'block'
      setTimeout(() => {
        document.querySelector('#battlePopUpCard').style.display = 'none'
      }, 5000)
    }

    attackSkills.push(skillBox)
  }

  // 방어 스킬들 넣기
  for (let i = 0; i < 3; i++) {
    let skillBox = document.createElement('div')
    var skillType =
      battle.battleState.player_skills[battle.data.my_index][i + 3].type
    skillBox.className = `battle_one_skill a${i} def_skill_buttons`
    skillBox.innerHTML = `
    <img src="../../img/skillThumbnails/${SKILL_DESCRIPTIONS[skillType].img}" />
    `
    skillBox.id = `Box-${skillType}`
    skillBox.value = i + 3
    skillBox.onmouseover = (e) => {
      hoverBattleToolTip(e.currentTarget.value, tooltip, skillBox)
    }
    skillBox.onmouseleave = (e) => {
      tooltip.style.display = 'none'
    }
    skillBox.onclick = (e) => {
      // 스킬 사용
      if (e.currentTarget.disabled) {
        window.alert('Please use Attack Skill')
        return
      }
      battle.chooseAction(e.currentTarget.value)
      document.querySelector('#actionContent').innerText =
        'Used ' + e.currentTarget.id.substring(4)
      document.querySelector('#battlePopUpCard').style.display = 'block'
      setTimeout(() => {
        document.querySelector('#battlePopUpCard').style.display = 'none'
      }, 5000)
    }

    defenseSkills.push(skillBox)
  }

  attackSkills.forEach((doc) => {
    box.append(doc)
  })
  defenseSkills.forEach((doc) => {
    box2.append(doc)
  })
}

const hoverTooltip = (skillType, tooltip, skillBox) => {
  var skillDesc = SKILL_DESCRIPTIONS[skillType]
  tooltip.innerHTML = `
    <p><strong>${skillDesc.name}</strong></p>
    <p>${skillDesc.desc}</p>
  `
  tooltip.style.display = 'flex'
  // if (type === 'defense') tooltip.style.bottom = '73px'
  // else tooltip.style.top = '73px'

  skillBox.append(tooltip)
}

const hoverBattleToolTip = (i, tooltip, skillBox) => {
  var skill = battle.battleState.player_skills[battle.data.my_index][i]
  var skillDesc = SKILL_DESCRIPTIONS[skill.type]

  tooltip.innerHTML = `
    <p><strong>${skillDesc.name}</strong></p>
    <p>${JSON.stringify(skill.write())}</p>
    <p>${skillDesc.desc}</p>
  `
  tooltip.style.display = 'flex'

  skillBox.append(tooltip)
}

skillBoxAdd()

// setTimeout(() => {
//   setPlayer({})
//   player.nftUrl =
//     'https://ipfs.io/ipfs/bafybeicj5zfhe3ytmfleeiindnqlj7ydkpoyitxm7idxdw2kucchojf7v4/1256.png'
//   player.nftCollection = 'tmp'
//   player.name = 'tmp'
//   player.spriteImgs = {
//     base: 'https://ipfs.io/ipfs/bafybeicj5zfhe3ytmfleeiindnqlj7ydkpoyitxm7idxdw2kucchojf7v4/1256.png',
//   }
//   var data = {
//     next_turn_expired_at: 100000,
//     opponent_battle_exclusive_pub_key: 'safsaf',
//     manager_battle_exclusive_pub_key: 'asdfsdf',
//     battle_id: '0',
//   }
//   battle.start(data)
//   battle.data.opponent_id = '0'
//   users[battle.data.opponent_id] = {}
//   users[battle.data.opponent_id].nftUrl =
//     'https://ipfs.io/ipfs/bafybeicj5zfhe3ytmfleeiindnqlj7ydkpoyitxm7idxdw2kucchojf7v4/1256.png'
//   users[battle.data.opponent_id].nftCollection = 'tmp'
//   users[battle.data.opponent_id].name = 'tmp'
//   users[battle.data.opponent_id].spriteImgs = {
//     base: 'https://ipfs.io/ipfs/bafybeicj5zfhe3ytmfleeiindnqlj7ydkpoyitxm7idxdw2kucchojf7v4/1256.png',
//   }
//   battle.battleState.setPlayerSkills([
//     { attacks: [0, 1, 5], defences: [0, 1, 2], random_number: 0 },
//     { attacks: [0, 1, 5], defences: [0, 1, 2], random_number: 0 },
//   ])
//   battle.receiveStateSignature('{ "msg": "tmp" }')
//   battle.data.my_index = 0

//   battle.timerId = setInterval(() => battle.timer(), 1000)

//   addBattleSkillBox()
//   // 배틀화면 테스트 용도
//   document.getElementById('login_screen').style.display = 'none'
//   document.getElementById('game_screen').style.display = 'block'
//   document.querySelector('canvas').style.display = 'block'
// }, 1000)
// initBattle()

// document.getElementById('modal_container').addEventListener('click', (e) => {
//   document.getElementById('modal_container').style.display = 'none'
//   document.getElementById('skill_box_temp').style.display = 'none'
// })
