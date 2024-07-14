import { bindInlineFunctions, getContext } from "../../js/setup.js";
bindInlineFunctions(getContext(), [
    '/Join/index/index/index.js',
    '/Join/js/utilities.js',
    '/Join/index/add_task/add_task.js',
    '/Join/js/language.js'
]);

import { STORAGE } from "../../js/storage.js";
import { $, debounce, notification, throwErrors } from "../../js/utilities.js";

export function initContacts () {
    return renderContacts();
}

export function renderContacts() {
    const contactsData = Object.values(STORAGE.currentUserContacts);
    $('#selected-contact-container').classList.toggle('d-none', !contactsData.length);
    
    const initialLetters = new Set(contactsData.map((singleContact) => singleContact.name[0]));
    const contactsContainer = $('#contacts-container');
    contactsContainer.innerHTML = '';

    initialLetters.forEach(letter => {
        contactsContainer.innerHTML += contactListLetterTemplate(letter);
        const filteredContacts = contactsData.filter(({name}) => name[0] == letter);
        contactsContainer.renderItems(filteredContacts, contactListTemplate);
    });
}

export const contactListLetterTemplate = (letter) => {
    return /*html*/`
        <div class="contact-letter">
            <span class="txt-normal">${letter}</span>
        </div>
    `;
}

export const contactListTemplate = ({img, name, email, id, color}) => {
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

export function addContactModal() {
    const modal = $('#add-contact-modal');
    clearInput();
    clearImage();
    clearResult();
    modal.openModal();

    modal.addEventListener('close', clearCloseAddContact, {once: true});
}

export function closeAddContact() {
    $('#add-contact-modal').closeModal();
}

export function clearInput() {
    $("#input-name").value = '';
}

export function clearImage() {
    $('.add-contact-field .user-img-container').innerHTML = /*html*/ `
        <img class="user-img-gray" src="/Join/assets/img/icons/user_img_gray.svg">
    `;
}

export function clearResult() {
    $('#user-search-result').innerHTML = '';
    unsetSearchResultStyle();
}

export function clearCloseAddContact() {
    let userImgContainer = $('.add-contact-field .user-img-container');

    clearInput();
    clearResult();

    userImgContainer.innerHTML = /*html*/ `
        <img class="user-img-gray" src="/Join/assets/img/icons/user_img_gray.svg">
    `;
    userImgContainer.style.setProperty('--user-clr', 'unset');
}

export const getInput = debounce(async function () {
    const inputValue = $('#input-name').value;
    
    if(!inputValue.length) return unsetSearchResultStyle();
    
    const filteredUsers = Object.values(STORAGE.data.users).filter(
        user => ((user.name.toLowerCase().includes(inputValue.toLowerCase())) && !(STORAGE.currentUser.id == user.id) && !(STORAGE.currentUser.contacts.includes(user.id)) && !(STORAGE.currentUser.pendingFriendshipRequests.includes(user.id)))
    );

    const sortedUsers = filteredUsers.sort((a, b) => a.name > b.name);
    renderSearchResults(sortedUsers);
    setSearchResultStyle();
}, 200);

export function setSearchResultStyle() {
    $('#input-name').style.borderRadius = '10px 10px 0 0';
    $('#input-name').style.borderBottomStyle = 'none';
    $('#user-search-result').style.border = '1px solid #d1d1d1';
    $('#user-search-result').style.borderTopStyle = 'none';
}

export function unsetSearchResultStyle() {
    $('#user-search-result').innerHTML = '';
    $('#user-search-result').style.border = 'none';
    $('#input-name').style.borderRadius = '10px 10px 10px 10px';
    $('#input-name').style.border = '1px solid #d1d1d1';
}

export function selectContact(id) {
    renderSelectedContact(STORAGE.currentUserContacts[id]);
    $('#contacts-container').classList.toggle('d-none', window.innerWidth <= 800);
}

export function closeSelectedContact() {
    $('#contacts-container').classList.remove('d-none');
}

export function renderSelectedContact(selectedContact) {
    $('#selected-contact-container').innerHTML = selectedContactTemplate(selectedContact);
}

export function selectedContactTemplate({id, img, name, email, phone, color}) {
    return /*html*/`
        <div class="contact-container column">
            ${contactImgNameTemplate(color, name, img, id)}
            ${contactInfoTemplate()}
            ${contactMailTemplate(email)}
            ${contactPhoneTemplate(phone)}
        </div>
    `;
}

export function contactImgNameTemplate(color, name, img, id) {
    return /*html*/ `
        <div class="img-name row">
            <div class="user-img-container" style="--user-clr: ${color}">
                <h1>${name.slice(0, 2).toUpperCase()}</h1>
                <img src="${img}">
            </div>

            <div class="column contact-name">
                <span>${name}</span>
                <div class="row gap-30">
                    <button class="delete-contact-btn row gap-10" onclick="confirmation('delete-contact', () => deleteContact(${id}))">
                        <span data-lang="delete">Delete</span>
                        <img src="/Join/assets/img/icons/trash_red.svg" width="20">
                    </button>
                </div>
            </div>
        </div>
    `;
}

export function contactInfoTemplate() {
    return /*html*/ `
        <div class="contact-info-container row">
            <span data-lang="contact-info">Contact Information</span>
        </div>
    `;
}

export function contactMailTemplate(email) {
    return /*html*/ `
        <div class="mail-container column">
            <span class="txt-700">E-Mail</span>
            <a class="email" href="mailto:${email}">${email}</a>                 
        </div>
    `;
}

export function contactPhoneTemplate(phone) {
    return /*html*/ `
        <div class="phone-container column">
            <span data-lang="phone" class="txt-700">Phone</span>
            <a id="phone-number" href="${(phone == 'N/A') ? 'return false;' : 'tel:${phone}'}">${phone}</a>
        </div>
    `;
}



// RENDER USER SERACH RESULTS

export function renderSearchResults(sortedUsers) {
    const searchResultsContainer = $('#user-search-result');
    searchResultsContainer.innerHTML = '';

    for(let i = 0; i < sortedUsers.length; i++) {
        const user = sortedUsers[i];
        searchResultsContainer.innerHTML += searchResultTemplates(user);
    }
}

export function searchResultTemplates({id, img, name, email, color}) {
    return /*html*/`
        <div class="search-result-contact row gap-10" id="search-result-contact" onclick="selectNewContact('${id}', '${img}', '${name}', '${color}')">
            <div class="contact-img user-img-container" data-img="false" style="--user-clr: ${color}">
                <h3>${name.slice(0, 2).toUpperCase()}</h3>
                <img src="${img}">
            </div>
            <span class="txt-normal result-name-email">${name}</span>
            <span class="txt-normal result-name-email mail-clr">${email}</span>
        </div>   
    `;
}

export function selectNewContact(id, img, name, color) {
    clearImage();
    clearInput();

    const input = $('#input-name');
    const userImgContainer = $('.add-contact-field .user-img-container');
    const initials = name.slice(0, 2).toUpperCase();

    userImgContainer.innerHTML = img ? `<img src="${img}" alt="${name}">` : initials;
    userImgContainer.style.setProperty('--user-clr', color);
    input.value = name;
    input.dataset.id = id;

    clearResult();
}

export async function addContact() {
    const selectedUser = $('#input-name');
    const userExists = STORAGE.getUserByInput(selectedUser.value);
    throwErrors({identifier: 'select-valid-user', bool: !userExists});
    if(!userExists) return unsetSearchResultStyle();
    const selectedUserId = selectedUser.dataset.id;

    const contactWasAdded = await STORAGE.currentUser.addContact(selectedUserId);
    if(!contactWasAdded) return notification(`network-error`);
    
    $('#add-contact-modal').closeModal();
    notification(`friendship-request, {name: '${STORAGE.data.users[selectedUserId].name}'}`);
}

export async function deleteContact(id) {
    const selectedContact = STORAGE.currentUserContacts[id];
    await Promise.all([
        selectedContact.deleteContact(STORAGE.currentUser.id),
        STORAGE.currentUser.deleteContact(`${id}`)
    ]);

    $('.contact-container').classList.add('d-none');
    renderContacts();
    location.reload();
}