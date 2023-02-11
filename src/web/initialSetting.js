export let chosenCloth = 1
import { clothesList } from '../js/clothes'
import { battle } from '../battle/battleClient'
import { ATTACKS, DEFENCES, SKILL_DESCRIPTIONS } from '../js/skills'

export let selectedSkill = []
export let selectedDefenceSkills = []

const renderClothes = () => {
  document.querySelector('#clothesBox').innerHTML = ''

  clothesList.forEach((item) => {
    let img = document.createElement('img')
    img.src = item.source
    img.style.width = 'min(100px, 15%)'
    img.style.transition = 'all 0.2s'
    img.style.background =
      chosenCloth === item.id
        ? 'rgba(255,255,255,0.35)'
        : 'rgba(255,255,255,0.15)'
    img.style.boxShadow = '0 8px 32px 0 rgba( 31, 38, 135, 0.37 )'
    img.style.backdropFilter = 'blur( 5px )'
    img.style.borderRadius = '2px'
    img.style.border = '0.6px solid rgba( 255, 255, 255, 0.18 )'
    img.style.margin = '3px'
    img.onclick = () => {
      chosenCloth = item.id
      renderClothes()
    }
    document.querySelector('#clothesBox').append(img)
  })
}

/**
 * Choose which skill to bring in battle
 */
const skillBoxAdd = () => {
  console.log('스킬 박스 생성')
  let div = document.querySelector('.attack_skill_box')
  let attackSkills = []

  let tooltip = document.createElement('div')
  tooltip.className = 'skill_hover_tooltip'
  tooltip.id = 'tooltip'

  for (let i = 0; i < ATTACKS.length; i++) {
    let skillBox = document.createElement('div')
    var skillName = ATTACKS[i]
    skillBox.className = 'one_atk_skill_box'
    skillBox.innerHTML = `
      <img src=".././../img/skillThumbnails/${SKILL_DESCRIPTIONS[skillName].img}" />
    `
    skillBox.id = skillName

    skillBox.onmouseover = (e) => {
      hoverTooltip(e.currentTarget.id, tooltip, skillBox)
    }
    skillBox.onmouseleave = (e) => {
      tooltip.style.display = 'none'
    }

    skillBox.onclick = (e) => {
      if (selectedSkill.includes(i)) {
        skillBox.style.background = 'white'
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

//   document.querySelector('#skill_box_wrapper').append(div)

  // defence add.
  let defdiv = document.querySelector('.defense_skill_box')
  let defenceSkills = []

  let tooltip2 = document.createElement('div')
  tooltip2.className = 'skill_hover_tooltip'
  tooltip2.id = 'tooltip'

  for (let i = 0; i < DEFENCES.length; i++) {
    let skillBox = document.createElement('div')
    var skillName = DEFENCES[i]

    skillBox.className = 'one_atk_skill_box'
    skillBox.innerHTML = `
    <img src=".././../img/skillThumbnails/${SKILL_DESCRIPTIONS[skillName].img}" />
    `

    skillBox.id = skillName

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

//   document.querySelector('#skill_box_wrapper').append(defdiv)
}

export const addBattleSkillBox = () => {
  let box = document.getElementById('battle_skills_attack')
  let box2 = document.getElementById('battle_skills_defense')

  let tooltip = document.createElement('div')
  tooltip.className = 'battle_skill_hover_tooltip'
  tooltip.id = 'battle_tooltip'
  tooltip.style.width = '300px'

  let attackSkills = []
  let defenseSkills = []
  for (let i = 0; i < 3; i++) {
    let skillBox = document.createElement('div')
    var skillName = ATTACKS[selectedSkill[i]]
    skillBox.className = `battle_one_skill a${i} atk_skill_buttons`
    skillBox.innerHTML = `
    <img src="../../img/skillThumbnails/${SKILL_DESCRIPTIONS[skillName].img}" />
    `
    skillBox.id =  `Box-${skillName}`
    skillBox.value = i
    skillBox.onmouseover = (e) => {
      hoverTooltip(e.currentTarget.id.substring(4), tooltip, skillBox)
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
        '공격 스킬 사용!' + e.currentTarget.id.substring(4)
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
    var skillName = DEFENCES[selectedSkill[i]]
    skillBox.className = `battle_one_skill a${i} def_skill_buttons`
    skillBox.innerHTML = `
    <img src="../../img/skillThumbnails/${SKILL_DESCRIPTIONS[skillName].img}" />
    `
    skillBox.id =  `Box-${skillName}`
    skillBox.value = i + 3
    skillBox.onmouseover = (e) => {
      hoverTooltip(e.currentTarget.id.substring(4), tooltip, skillBox)
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
        '방어 스킬 사용!' + e.currentTarget.id.substring(4)
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

const hoverTooltip = (skillName, tooltip, skillBox) => {
  var skillDesc = SKILL_DESCRIPTIONS[skillName]
  tooltip.innerHTML = `
    <p><strong>${skillDesc.name}</strong></p>
    <p>${skillDesc.desc}</p>
  `
  tooltip.style.display = 'flex'
  // if (type === 'defense') tooltip.style.bottom = '73px'
  // else tooltip.style.top = '73px'

  skillBox.append(tooltip)
}

skillBoxAdd()
renderClothes()
// addBattleSkillBox()
// 배틀화면 테스트 용도
// document.getElementById('login_screen').style.display = 'none'
// document.getElementById('game_screen').style.display = 'block'
// document.querySelector('canvas').style.display = 'block'
// battle.initiated = true
// initBattle()

// document.getElementById('modal_container').addEventListener('click', (e) => {
//   document.getElementById('modal_container').style.display = 'none'
//   document.getElementById('skill_box_temp').style.display = 'none'
// })