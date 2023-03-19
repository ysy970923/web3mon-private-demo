export class MultiPageDialog {
  id
  constructor(id) {
    this.id = id
    var buttonContainer = document.createElement('div')
    buttonContainer.classList.add('buttonContainer')
    buttonContainer.id = id + 'ButtonContainer'
    document.getElementById(id + 'Card').appendChild(buttonContainer)

    var contentContainer = document.createElement('div')
    contentContainer.classList.add('contentContainer')
    contentContainer.id = id + 'Container'
    document.getElementById(id + 'Card').appendChild(contentContainer)
  }

  addPage(title, content) {
    var page = document.createElement('div')
    page.classList.add('page', this.id + 'Page')
    document.getElementById(this.id + 'Container').appendChild(page)

    var pageNumber = document.getElementsByClassName(this.id + 'Page').length

    var titleElement = document.createElement('h2')
    titleElement.innerText = title
    page.appendChild(titleElement)
    page.innerHTML += content

    var button = document.createElement('div')
    button.classList.add('pageBtn')
    button.innerText = pageNumber
    button.setAttribute('value', pageNumber - 1)

    document.getElementById(this.id + 'ButtonContainer').appendChild(button)

    button.addEventListener('click', (e) => {
      document.getElementById(this.id + 'Container').scrollTop =
        350 * e.currentTarget.getAttribute('value')
    })
  }
}

const guidanceCard = new MultiPageDialog('guidance')
guidanceCard.addPage(
  'Game Guidance',
  `<p>This is a multiplayer game.</p>
  <p>
    You can walk, chat and battle with other players within the
    game.
  </p>
  <p>
    Step into the same Battle Zone box with other player to enter
    battle.
  </p>`
)

guidanceCard.addPage(
  'Control',
  `<p>Move with keyboard 'w,a,s,d'</p>`
)