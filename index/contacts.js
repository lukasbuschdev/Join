function initContacts () {
    renderContacts();
}

async function renderContacts() {
    const {contacts: contactIds} = await REMOTE_getData(`users/${currentUserId()}`);
    
    const contactsData = await getContactsData(contactIds);
    const initialLetters = [...new Set(
        contactsData.map(
            (contact) => contact.credentials.name[0]
        )
    )];

    initialLetters.forEach(letter => {
        $('#contacts-container').innerHTML += contactListLetterTemplate(letter);
        const filteredContacts = contactsData.filter(({credentials}) => credentials.name[0] == letter)
        $('#contacts-container').renderItems(filteredContacts, contactListTemplate);
    }
    )

}

const contactListLetterTemplate = (letter) => {
    return /*html*/`
        <div class="contact-letter">
            <span class="txt-normal">${letter}</span>
            <div class="contact-letter-bottom">
                <div></div>
            </div>
        </div>
    `
}

const contactListTemplate = ({img, credentials: {name, email}}) => {
    return /*html*/`
        <div class="contact row">
            <div class="contact-img">
                <img src="${img}">
            </div>
            <div class="column">
                <span class="txt-normal contact-name">${name}</span>
                <span class="txt-small contact-email">${email}</span>
            </div>
        </div>
    `;
}
