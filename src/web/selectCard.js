export function showSelectCard(title, content, yes, no) {
    document.getElementById('battleCard').innerHTML = `
    <h2>${title}</h2>
    ${content}
    <button id="yesBattleBtn" class="nes-btn is-success">YES</button>
    <button id="noBattleBtn" class="nes-btn is-error">NO</button>
    `

    document.getElementById('yesBattleBtn').addEventListener('click', yes)
    document.getElementById('noBattleBtn').addEventListener('click', no)

    document.getElementById('battleCard').style.display = 'block'
}

export function closeSelectCard() {
    document.getElementById('battleCard').style.display = 'none'
    document.getElementById('battleCard').innerHTML = ''
}