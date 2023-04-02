import { users, player } from "../js/global"
import { SKILL_INFOS } from "../data/skill"

export const showBattleEnterScreen = (opponent_id, my_index, battleState) => {
    document.getElementById('enter_img').src = player.nftUrl
    document.getElementById('opp_enter_img').src = users[opponent_id].nftUrl
    document.getElementById('enter_collection').innerText = player.nftCollection
    document.getElementById('enter_name').innerText = player.name
    document.getElementById('op_enter_collection').innerText = users[opponent_id].nftCollection
    document.getElementById('op_enter_name').innerText = users[opponent_id].name

    for (var i = 0; i < 3; i++) {
      var skillType = battleState.player_skills[my_index][i].type
      var desc_item = document.createElement('div')
      desc_item.setAttribute('class', 'desc_item')
      var skill_label = document.createElement('div')
      skill_label.setAttribute('class', 'skill_label')
      skill_label.innerText = `Attack ${i + 1}`
      desc_item.append(skill_label)
      var skill_img_container = document.createElement('div')
      skill_img_container.setAttribute('class', 'skill_img_container')
      var skill_img = document.createElement('img')
      skill_img.setAttribute('class', 'skill_img')
      skill_img.src = `../../img/skillThumbnails/${SKILL_INFOS[skillType].img}`
      skill_img_container.append(skill_img)
      desc_item.append(skill_img_container)
      document.getElementById('selected_attack_skills').append(desc_item)
  
      var skillType = battleState.player_skills[my_index][i + 3].type
      var desc_item = document.createElement('div')
      desc_item.setAttribute('class', 'desc_item')
      var skill_label = document.createElement('div')
      skill_label.setAttribute('class', 'skill_label')
      skill_label.innerText = `Defence ${i + 1}`
      desc_item.append(skill_label)
      var skill_img_container = document.createElement('div')
      skill_img_container.setAttribute('class', 'skill_img_container')
      var skill_img = document.createElement('img')
      skill_img.setAttribute('class', 'skill_img')
      skill_img.src = `../../img/skillThumbnails/${SKILL_INFOS[skillType].img}`
      skill_img_container.append(skill_img)
      desc_item.append(skill_img_container)
      document.getElementById('selected_defence_skills').append(desc_item)
    }
  
    for (var i = 0; i < 3; i++) {
      var skillType = battleState.player_skills[1 - my_index][i].type
      var desc_item = document.createElement('div')
      desc_item.setAttribute('class', 'desc_item')
      var skill_label = document.createElement('div')
      skill_label.setAttribute('class', 'skill_label')
      skill_label.innerText = `Attack ${i + 1}`
      desc_item.append(skill_label)
      var skill_img_container = document.createElement('div')
      skill_img_container.setAttribute('class', 'skill_img_container')
      var skill_img = document.createElement('img')
      skill_img.setAttribute('class', 'skill_img')
      skill_img.src = `../../img/skillThumbnails/${SKILL_INFOS[skillType].img}`
      skill_img_container.append(skill_img)
      desc_item.append(skill_img_container)
      document.getElementById('op_selected_attack_skills').append(desc_item)
  
      var skillType = battleState.player_skills[1 - my_index][i + 3].type
      var desc_item = document.createElement('div')
      desc_item.setAttribute('class', 'desc_item')
      var skill_label = document.createElement('div')
      skill_label.setAttribute('class', 'skill_label')
      skill_label.innerText = `Defence ${i + 1}`
      desc_item.append(skill_label)
      var skill_img_container = document.createElement('div')
      skill_img_container.setAttribute('class', 'skill_img_container')
      var skill_img = document.createElement('img')
      skill_img.setAttribute('class', 'skill_img')
      skill_img.src = `../../img/skillThumbnails/${SKILL_INFOS[skillType].img}`
      skill_img_container.append(skill_img)
      desc_item.append(skill_img_container)
      document.getElementById('op_selected_defence_skills').append(desc_item)
    }
  
    document.querySelector('#battle_enter').style.transition = 'all 0s ease-out'
    document.querySelector('#battle_enter').style.opacity = 1
    document.querySelector('#battle_enter').style.zIndex = 1000
    setTimeout(() => {
      document.querySelector('#battle_enter').style.transition =
        'all 1.2s ease-out'
      document.querySelector('#battle_enter').style.opacity = 0
      document.querySelector('#battle_enter').style.zIndex = -5
    }, 5000)
  }
  