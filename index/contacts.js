async function initContacts () {
    await getUser();
    return renderContacts();
}

async function renderContacts() {
    const contactsData = Object.values(CONTACTS);
    if(contactsData.length == 0) return noContactsYet();
    contactsExisting();
    log('Got Here 1')
    
    const initialLetters = [...new Set(
        contactsData.map(
            (singleContact) => singleContact.name[0]
        )
    )];

    $('#contacts-container').innerHTML = '';

    initialLetters.for(letter => {
        $('#contacts-container').innerHTML += contactListLetterTemplate(letter);
        const filteredContacts = contactsData.filter(({name}) => name[0] == letter);
        $('#contacts-container').renderItems(filteredContacts, contactListTemplate);
    });
    log('Got Here 2')
}

function noContactsYet() {
    document.getElementById('contacts-empty')?.classList.remove('d-none');
    document.getElementById('selected-contact-container').classList.add('grid-center');
}

function contactsExisting() {
    document.getElementById('contacts-empty')?.classList.add('d-none');
    document.getElementById('selected-contact-container').classList.remove('grid-center');
}

const contactListLetterTemplate = (letter) => {
    return /*html*/`
        <div class="contact-letter">
            <span class="txt-normal">${letter}</span>
        </div>
    `;
}

const contactListTemplate = ({img, name, email, id, color}) => {
    return /*html*/`
        <div class="contact row" onclick="selectContact(${id})">
            <div class="user-img-container" style="--user-clr: ${color}">
                <span>${name.slice(0, 2).toUpperCase()}</span>
                <img src="${img}" alt="">
            </div>
            <div class="column">
                <span class="txt-normal contact-name">${name}</span>
                <span class="txt-small contact-email">${email}</span>
            </div>
        </div>
    `;
}

function addContactModal() {
    const modal = $('#add-contact-modal');
    clearInput();
    clearImage();
    clearResult();
    modal.openModal();
}

function closeAddTaskModal() {
    $('#add-task-modal').closeModal();
}

function closeAddContact() {
    $('#add-contact-modal').closeModal();
}

function clearInput(){
    let input = $("#input-name");
      if (input.value !== "") {
          input.value = "";
      }
}

function clearImage() {
    let userImgContainer = $('.add-contact-field .user-img-container');
    userImgContainer.innerHTML = /*html*/ `
        <img class="user-img-gray" src="/Join/assets/img/icons/user_img_gray.svg">
    `;
}

function clearResult() {
    $('#user-search-result').innerHTML = '';
    unsetSearchResultStyle();
}

function clearCloseAddContact() {
    let userImgContainer = $('.add-contact-field .user-img-container');

    clearInput();
    clearResult();

    userImgContainer.innerHTML = /*html*/ `
        <img class="user-img-gray" src="/Join/assets/img/icons/user_img_gray.svg">
    `;

    closeAddContact();
}

const getInput = debounce(async function () {
    let input = $('#input-name');
    const userId = currentUserId();
    $('#user-search-result').textContent.trim();

    if(input.value.length >= 3) {
        const allUsers = ALL_USERS;
    
        const filteredUsers = Object.values(allUsers).filter(
            user => (user.name.toLowerCase().includes(input.value.toLowerCase()) && !(userId == user.id) && !(USER.contacts.includes(`${user.id}`)))
        );
    
        const sortedUsers = filteredUsers.sort(
            function(a, b) {
                if(a.name > b.name) {
                    return 1
                } else {
                    return -1
                } 
            }
        );
    
        renderSearchResults(sortedUsers);
        setSearchResultStyle();
    } else {
        unsetSearchResultStyle();
    }
}, 200);

function setSearchResultStyle() {
    $('#input-name').style.borderRadius = '10px 10px 0 0';
    $('#input-name').style.borderBottomStyle = 'none';
    $('#user-search-result').style.border = '1px solid #d1d1d1';
    $('#user-search-result').style.borderTopStyle = 'none';
}

function unsetSearchResultStyle() {
    $('#user-search-result').innerHTML = '';
    $('#user-search-result').style.border = 'none';
    $('#input-name').style.borderRadius = '10px 10px 10px 10px';
    $('#input-name').style.border = '1px solid #d1d1d1';
}

async function selectContact(id) {
    let userData = await getContactsData();
    let selectedContact = userData.find(user => user.id == id);
    renderSelectedContact(selectedContact);

    if (window.innerWidth <= 800) {
        $('#contacts-container').classList.add('d-none');
    } else {
        $('#contacts-container').classList.remove('d-none');
    }
}

function closeSelectedContact() {
    $('#contacts-container').classList.remove('d-none');
}

function renderSelectedContact(selectedContact) {
    const selectedContactContainer = $('#selected-contact-container');
    selectedContactContainer.innerHTML = selectedContactTemplate(selectedContact);
}

function selectedContactTemplate({id, img, name, email, phone, color}) {
    return /*html*/`
    <div class="contact-container column">
        <div class="img-name row">
            <div class="user-img-container" style="--user-clr: ${color}">
                <h1>${name.slice(0, 2).toUpperCase()}</h1>
                <img src="${img}" alt="">
            </div>

            <div class="column contact-name">
                <span>${name}</span>
                <div class="row gap-30">
                    <button data-lang="add-task" class="row" onclick="addTaskModal()">Add Task</button>
                    <div class="vertical-line"></div>
                    <button class="delete-contact-btn row gap-10" onclick="confirmation('delete-contact', () => deleteContact(${id}))">
                        <span data-lang="delete">Delete</span>
                        <img src="/Join/assets/img/icons/trash_red.svg" width="20">
                    </button>
                </div>
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
            <a id="phone-number" href="${(phone == 'N/A') ? 'return false;' : 'tel:${phone}'}">${phone}</a>
        </div>
    </div>
    `;
}



// RENDER USER SERACH RESULTS

function renderSearchResults(sortedUsers) {
    const searchResultsContainer = $('#user-search-result');
    searchResultsContainer.innerHTML = '';

    for(let i = 0; i < sortedUsers.length; i++) {
        const user = sortedUsers[i];
        searchResultsContainer.innerHTML += searchResultTemplates(user);
    }
}

function searchResultTemplates({id, img, name, email}) {
    return /*html*/`
        <div class="search-result-contact row gap-10" id="search-result-contact" onclick="selectNewContact('${id}', '${img}', '${name}')">
            <div class="contact-img user-img-container" data-img="false">
                <h3>${name.slice(0, 2).toUpperCase()}</h3>
                <img src="${img}">
            </div>
            <span class="txt-normal result-name-email">${name}</span>
            <span class="txt-normal result-name-email mail-clr">${email}</span>
        </div>   
    `;
}

function selectNewContact(id, img, name) {
    clearImage();
    clearInput();
    
    let image = $('.user-img-gray');
    let input = $('#input-name');
    let userImgContainer = $('.add-contact-field .user-img-container');
    let initials = name.slice(0, 2).toUpperCase();
    
    userImgContainer.innerHTML = initials;
    image.setAttribute('src', img);
    input.value = name;
    input.dataset.id = id;

    clearResult();
}

async function addContact() {
    const selectedUser = $('#input-name');
    const selectedUserId = selectedUser.dataset.id;
    const userName = USER.name;

    const notificationPrototype = new Notify({
        recipients: [selectedUserId],
        userName,
        userId: USER.id,
        type: 'friendshipRequest'
    });

    if(USER.pendingFriendshipRequests.includes(selectedUserId)) {
        log('Friendship request has already been sent!');
        return
    }

    USER.pendingFriendshipRequests.push(selectedUserId);
    await USER.update();

    notification('friendship-request');
    notificationPrototype.send();

    clearCloseAddContact();
}

async function deleteContact(id) {
    USER.contacts = USER.contacts.filter(item => item !== id.toString());
    await USER.update();

    CONTACTS[id].contacts = CONTACTS[id].contacts.filter(item => item !== USER.id);
    await CONTACTS[id].update();
    delete CONTACTS[id];

    $('.contact-container').classList.add('d-none');
    await renderContacts();
    await loadContent();
}