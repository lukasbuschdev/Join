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
    // log(contactsData)
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

function closeAddContact() {
    $('#add-contact-modal').closeModal();
}

function clearInput(){
    let input = $("#input-name");
      if (input.value !="") {
          input.value = "";
      }
}

function clearImage() {
    let image = $('.user-img-gray');
    image.src = "../assets/img/icons/user_img_gray.svg";
}

function clearResult() {
    $('#user-search-result').innerHTML = '';
    unsetSearchResultStyle();
}

const getInput = debounce(async function () {
    let input = $('#input-name');
    const userId = currentUserId();

    if(input.value.length >= 2) {
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
}

function renderSelectedContact(selectedContact) {
    const selectedContactContainer = $('#selected-contact-container');

    selectedContactContainer.innerHTML = selectedContactTemplate(selectedContact);
}

function selectedContactTemplate({img, name, email, phone, color}) {
    return /*html*/`
    <div class="contact-container column">
        <div class="img-name row">
            <div class="user-img-container" style="--user-clr: ${color}">
                <h1>${name.slice(0, 2).toUpperCase()}</h1>
                <img src="${img}" alt="">
            </div>

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
            <a id="phone-number" href="${(phone == 'N/A') ? 'return false;' : 'tel:${phone}'}">${phone}</a>
        </div>
    </div>
    `;
}



// RENDER USER SERACH RESULTS

function renderSearchResults(sortedUsers) {
    const searchResultsContainer = $('#user-search-result');
    searchResultsContainer.innerHTML = '';
    // log(sortedUsers)

    for(let i = 0; i < sortedUsers.length; i++) {
        const user = sortedUsers[i];
        searchResultsContainer.innerHTML += searchResultTemplates(user);
    }
}

function searchResultTemplates({id, img, name, email}) {
        return /*html*/`
            <div class="search-result-contact row" id="search-result-contact" onclick="selectNewContact('${id}', '${img}', '${name}')">
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
    let image = $('.user-img-gray');
    let input = $('#input-name');
    let userImgContainer = image.previousElementSibling;
    
    userImgContainer.innerHTML = name.slice(0, 2).toUpperCase();
    image.src = img;
    input.value = name;
    const selectedContact = id;
    console.log(selectedContact);
}

function addOpenTaskModal() {
    let modalContainer = $('');

    modalContainer.innerHTML = renderAddTaskModal();
}

function renderAddTaskModal() {
    return `
        <dialog id="add-task-modal" type="modal">
            <div include-template="../assets/templates/index/add-task_template.html"></div>
        </dialog>
    `;
}