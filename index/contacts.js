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
            user => (user.name.toLowerCase().includes(input.value.toLowerCase()) && !(userId == user.id))
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
    
        // console.log(sortedUsers);
    
        renderSearchResults(sortedUsers);
        $('#input-name').style.borderRadius = '10px 10px 0 0';
        $('#input-name').style.borderBottomStyle = 'none';
        $('#user-search-result').style.border = '1px solid #d1d1d1';
        $('#user-search-result').style.borderTopStyle = 'none';

    } else {
        $('#user-search-result').innerHTML = '';
        $('#user-search-result').style.border = 'none';
        $('#input-name').style.borderRadius = '10px 10px 10px 10px';
        $('#input-name').style.border = '1px solid #d1d1d1';

    }

}, 200);

async function selectContact(id) {
    let userData = await getContactsData();

    let selectedContact = userData.find(user => user.id == id);
    // log(selectedContact)
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



// RENDER USER SERACH RESULTS

function renderSearchResults(sortedUsers) {
    const searchResultsContainer = $('#user-search-result');
    searchResultsContainer.innerHTML = searchResultTemplates(sortedUsers);
}

function searchResultTemplates([{id, img, name, email}]) {
    return /*html*/`
        <div class="search-result-contact row" onclick="addContact(${id})">
            <div class="contact-img">
                <img src="${img}">
            </div>
            <span class="txt-normal result-name-email">${name}</span>
            <span class="txt-normal result-name-email mail-clr">${email}</span>
        </div>
    `;
}




// SEARCH BAR SECTION
// $('#input-name').onfocus = setSearchBarAnimation();
// $('#input-name').onblur = unsetSearchBarAnimation();

// function setSearchBarAnimation() {
//     log('aaa')
//     $('#user-search-result-active').style.height = '100%'; 
// }

// function unsetSearchBarAnimation() {
//     $('#user-search-result').style.height = '0px'; 
// }