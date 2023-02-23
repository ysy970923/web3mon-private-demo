export class PopUp {
  btnID
  cardID
  clickOutsideEvent

  constructor(id) {
    this.btnID = id + 'Btn'
    this.cardID = id + 'Card'
    this.clickOutsideEvent = (e) => {
      if (!document.getElementById(this.cardID).contains(e.target)) {
        document.body.removeEventListener('click', this.clickOutsideEvent, true)
        document.getElementById(this.cardID).style.display = 'none'
      }
    }
    document.getElementById(this.btnID).addEventListener('click', (e) => {
      document.getElementById(this.cardID).style.display = 'block'
      document.body.addEventListener('click', this.clickOutsideEvent, true)
    })
  }
}

const guidancePopUp = new PopUp('guidance')
const profilePopUp = new PopUp('profile')
const historyPopUp = new PopUp('battleHistory')
