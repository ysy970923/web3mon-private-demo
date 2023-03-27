export function showSelectCard(title, content, yes, no) {
    document.getElementById('battleCard').innerHTML = `
    <div class="battle_modal_content">
    <h2>${title}</h2>
    ${content}
    <div>
    <button id="yesBattleBtn" class="nes-btn is-success">YES</button>
    <button id="noBattleBtn" class="nes-btn is-error">NO</button>
    </div>
    </div>
    `

    document.getElementById('yesBattleBtn').addEventListener('click', yes)
    document.getElementById('noBattleBtn').addEventListener('click', no)

    document.getElementById('battleCard').style.display = 'block'
}

export function closeCard() {
    document.getElementById('battleCard').style.display = 'none'
    document.getElementById('battleCard').innerHTML = ''
}

export function showCard(title, content) {
    document.getElementById('battleCard').innerHTML = `
    <div class="battle_modal_content">
    <h2>${title}</h2>
    ${content}
    </div>
    `
    document.getElementById('battleCard').style.display = 'block'
}