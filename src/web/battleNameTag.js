export function battleNameTagMaker(name, nft_img_src, me_or_op) {
    var nameTag = document.createElement('div')
    nameTag.classList.add('battleNameTag')
    if (me_or_op === 'ME') {
        nameTag.style.top = '30px'
    } else {
        nameTag.style.top = '200px'
    }
    document.getElementById('userInterface').appendChild(nameTag)

    var container = document.createElement('div')
    container.classList.add('container')
    nameTag.appendChild(container)

    var nameText = document.createElement('div')
    nameText.classList.add('text')
    nameText.innerText = `${name} (${me_or_op})`
    container.appendChild(nameText)

    var nft_img_container = document.createElement('div')
    nft_img_container.classList.add('image')
    var nft_img = document.createElement('img')
    nft_img.src = nft_img_src
    nft_img_container.appendChild(nft_img)
    container.appendChild(nft_img_container)

    var health_container = document.createElement('div')
    health_container.classList.add('health_container')
    nameTag.appendChild(health_container)

    var hp_desc = document.createElement('div')
    hp_desc.classList.add('hp_desc')
    hp_desc.innerText = 'LP'
    health_container.appendChild(hp_desc)

    var health_bar = document.createElement('div')
    health_bar.classList.add('health_bar')
    health_container.appendChild(health_bar)

    var health_bar_outer = document.createElement('div')
    health_bar_outer.classList.add('health_bar_outer')
    health_bar.appendChild(health_bar_outer)

    var health_bar_inner = document.createElement('div')
    health_bar_inner.classList.add('health_bar_inner')
    health_bar_inner.style.width = '100%'
    health_bar_inner.id = me_or_op + 'HealthBar'
    health_bar.appendChild(health_bar_inner)

    var effect_box = document.createElement('div')
    effect_box.classList.add('effect_box')
    effect_box.id = me_or_op + 'EffectBox'
    nameTag.appendChild(effect_box)
}

export function addEffect(effect_img_src, me_or_op, title, description, effect_counter) {
    var effect_box = document.getElementById(`${me_or_op}EffectBox`)

    var effect_img_container = document.createElement('div')
    effect_img_container.classList.add('effect_img_container')
    effect_img_container.setAttribute('value', `${effect_counter}${me_or_op}ToolTip`)
    effect_box.appendChild(effect_img_container)

    var effect_img = document.createElement('img')
    effect_img.src = effect_img_src
    effect_img.title = title
    effect_img_container.append(effect_img)

    var tooltip = document.createElement('div')
    tooltip.classList.add('tooltip')
    tooltip.id = `${effect_counter}${me_or_op}ToolTip`
    tooltip.style.display = 'none'

    tooltip.innerHTML = `
    <p><strong>${title}<strong></p>
    <p>${description}</p>
  `

    effect_img_container.append(tooltip)

    effect_img_container.onmouseenter = (e) => {
        var tooltip = document.getElementById(e.target.getAttribute('value'))
        tooltip.style.display = 'block'
    }

    effect_img_container.onmouseleave = (e) => {
        var tooltip = document.getElementById(e.target.getAttribute('value'))
        tooltip.style.display = 'none'
    }
    effect_counter += 1
}