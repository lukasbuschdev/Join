function initContacts () {
    renderContacts();
}

async function renderContacts() {
    const contactsData = await getContactsData();
    const initialLetters = [...new Set(
        contactsData.map(
            ({name}) => name[0]
        )
    )];

    $('#contacts-container').innerHTML = '';

    initialLetters.forEach(letter => {
        $('#contacts-container').innerHTML += contactListLetterTemplate(letter);
        const filteredContacts = contactsData.filter(({name}) => name[0] == letter)
        $('#contacts-container').renderItems(filteredContacts, contactListTemplate);
    });
}

const contactListLetterTemplate = (letter) => {
    return /*html*/`
        <div class="contact-letter">
            <span class="txt-normal">${letter}</span>
        </div>
    `
}

const contactListTemplate = ({img, name, email, id}) => {
    return /*html*/`
        <div class="contact row" onclick="selectContact(${id})">
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

const getInput = debounce(async function () {
    let input = $('#input-name');
    const userId = currentUserId();

    if(input.value.length >= 3) {
        const allUsers = await REMOTE_getData('users');
    
        const filteredUsers = Object.values(allUsers).filter(
            user => (user.name.includes(input.value) && !(userId == user.id))
        )
    
        const sortedUsers = filteredUsers.sort(
            function(a, b) {
                if(a.name > b.name) {
                    return 1
                } else {
                    return -1
                } 
            }
        );
    
        console.log(sortedUsers);
    
        renderUserSearch(sortedUsers);
    }

}, 200);

async function selectContact(id) {
    let userData = await getContactsData();

    let selectedContact = userData.find(user => user.id == id);
    log(selectedContact)
    renderSelectedContact(selectedContact);
}

function renderSelectedContact(selectedContact) {
    const selectedContactContainer = $('#selected-contact-container');

    selectedContactContainer.innerHTML = selectedContactTemplate(selectedContact);
}

function selectedContactTemplate({img, name, email, phone}) {
    return /*html*/`
    <div class="contact-container column">
        <div class="img-name row">
            <img src="${img}">

            <div class="column contact-name">
                <span>${name}</span>
                <button data-lang="add-task" class="row">Add Task</button>
            </div>
        </div>

        <div class="edit-contact row">
            <span data-lang="contact-info">Contact Information</span>
        </div>

        <div class="mail-container column">
            <span class="txt-700">E-Mail</span>
            <a class="email" href="mailto:${email}">${email}</a>                 
        </div>

        <div class="phone-container column">
            <span data-lang="phone" class="txt-700">Phone</span>
            <a id="phone-number" href="${(phone == 'N/A') ? '#' : 'tel:${phone}'}">${phone}</a>
        </div>
    </div>
    `;
}




// SEARCH BAR SECTION
// $('#input-name').onfocus = setSearchBarAnimation();
// $('#input-name').onblur = unsetSearchBarAnimation();

function setSearchBarAnimation() {
    log('aaa')
    $('.search-contact.row').style.top = '15%'; 
}

function unsetSearchBarAnimation() {
    $('.search-contact.row').style.top = '40%'; 
}


function renderUserSearch(sortedUsers) {

}