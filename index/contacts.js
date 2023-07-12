function initContacts () {
    renderContacts();
}

async function renderContacts() {
    const {contacts: contactIds} = await REMOTE_getData(`users/${currentUserId()}`);
    if (contactIds == false) return;
    
    const contactsData = await getContactsData(contactIds);
    const initialLetters = [...new Set(
        contactsData.map(
            ({name}) => name[0]
        )
    )];

    initialLetters.forEach(letter => {
        $('#contacts-container').innerHTML += contactListLetterTemplate(letter);
        const filteredContacts = contactsData.filter(({name}) => name[0] == letter)
        $('#contacts-container').renderItems(filteredContacts, contactListTemplate);
    })
}

const contactListLetterTemplate = (letter) => {
    return /*html*/`
        <div class="contact-letter">
            <span class="txt-normal">${letter}</span>
        </div>
    `
}

const contactListTemplate = ({img, name, email}) => {
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

function addContactModal() {
    $('#add-contact-modal').openModal();
}

function closeAddContact() {
    $('#add-contact-modal').closeModal();
}