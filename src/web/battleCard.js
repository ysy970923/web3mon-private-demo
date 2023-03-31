export function showCard(title, content, yes, no) {
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
    if (!yes) {
        document.getElementById('yesBattleBtn').style.display = 'none'
    } else {
        document.getElementById('yesBattleBtn').addEventListener('click', yes)
        document.getElementById('yesBattleBtn').style.display = 'inline-block'
    }

    if (!no) {
        document.getElementById('noBattleBtn').style.display = 'none'
    } else {
        document.getElementById('noBattleBtn').addEventListener('click', no)
        document.getElementById('noBattleBtn').style.display = 'inline-block'
    }

    document.getElementById('battleCard').style.display = 'block'
}

export function closeCard() {
    document.getElementById('battleCard').style.display = 'none'
    document.getElementById('battleCard').innerHTML = ''
}