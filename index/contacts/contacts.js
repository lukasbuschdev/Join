import { contactImgNameTemplate, contactInfoTemplate, contactListLetterTemplate, contactListTemplate, contactMailTemplate, contactPhoneTemplate, searchResultTemplates, userImgGrayTemplate, userImgTemplate } from "../../assets/templates/index/contacts_template.js";
import { bindInlineFunctions, getContext } from "../../js/setup.js";
bindInlineFunctions(getContext(), [
	"/Join/index/index/index.js",
	"/Join/js/utilities.js",
	"/Join/index/add_task/add_task.js",
	"/Join/js/language.js"
]);

import { STORAGE } from "../../js/storage.js";
import { User } from "../../js/user.class.js";
import { $, debounce, getInitialsOfName, notification, throwErrors } from "../../js/utilities.js";

/**
 * Initializes the contacts by rendering them.
 * @returns {void}
 */
export function initContacts() {
    return renderContacts();
}

/**
 * Renders the contacts in the contacts container grouped by first letter of username.
 * @returns {void}
 */
export function renderContacts() {
    const contactsData = Object.values(STORAGE.currentUserContacts);
    $("#selected-contact-container").classList.toggle("d-none", !contactsData.length);

    const initialLetters = new Set(contactsData.map((singleContact) => singleContact.name[0]));
    const contactsContainer = $("#contacts-container");
    contactsContainer.innerHTML = "";

    initialLetters.forEach((letter) => {
        contactsContainer.innerHTML += contactListLetterTemplate(letter);
        const filteredContacts = contactsData.filter(({ name }) => name[0] == letter);
        contactsContainer.renderItems(filteredContacts, contactListTemplate);
    });
}

/**
 * Opens the modal to add a new contact.
 * @returns {void}
 */
export function addContactModal() {
    const modal = $("#add-contact-modal");
    clearInput();
    clearImage();
    clearResult();
    modal.openModal();

    modal.addEventListener("close", clearCloseAddContact, { once: true });
}

/**
 * Closes the add contact modal.
 * @returns {void}
 */
export function closeAddContact() {
    $("#add-contact-modal").closeModal();
}

/**
 * Clears the input field for the contact name.
 * @returns {void}
 */
export function clearInput() {
    $("#input-name").value = "";
}

/**
 * Clears the contact image field.
 * @returns {void}
 */
export function clearImage() {
    $(".add-contact-field .user-img-container").innerHTML = userImgGrayTemplate();
}

/**
 * Clears the search result field.
 * @returns {void}
 */
export function clearResult() {
    $("#user-search-result").innerHTML = "";
    unsetSearchResultStyle();
}

/**
 * Clears the add contact modal fields and resets the user image container.
 * @returns {void}
 */
export function clearCloseAddContact() {
    let userImgContainer = $(".add-contact-field .user-img-container");

    clearInput();
    clearResult();

    userImgContainer.innerHTML = userImgTemplate();
    userImgContainer.style.setProperty("--user-clr", "unset");
}

/**
 * Oninput, gets the input value, filters users, and renders search results with debouncing.
 * @function
 * @returns {Promise<void>}
 */
export const getInput = debounce(async function () {
    const inputValue = $("#input-name").value;

    if (!inputValue.length) return unsetSearchResultStyle();

    const filteredUsers = Object.values(STORAGE.data.users).filter(
        (user) =>
            user.name.toLowerCase().includes(inputValue.toLowerCase()) &&
            !(STORAGE.currentUser.id == user.id) &&
            !STORAGE.currentUser.contacts.includes(user.id) &&
            !STORAGE.currentUser.pendingFriendshipRequests.includes(user.id)
    );

    const sortedUsers = filteredUsers.sort((a, b) => a.name > b.name);
    renderSearchResults(sortedUsers);
    setSearchResultStyle();
}, 200);

/**
 * Sets the style for the search result container.
 * @returns {void}
 */
export function setSearchResultStyle() {
    $("#input-name").style.borderRadius = "10px 10px 0 0";
    $("#input-name").style.borderBottomStyle = "none";
    $("#user-search-result").style.border = "1px solid #d1d1d1";
    $("#user-search-result").style.borderTopStyle = "none";
}

/**
 * Unsets the style for the search result container.
 * @returns {void}
 */
export function unsetSearchResultStyle() {
    $("#user-search-result").innerHTML = "";
    $("#user-search-result").style.border = "none";
    $("#input-name").style.borderRadius = "10px 10px 10px 10px";
    $("#input-name").style.border = "1px solid #d1d1d1";
}

/**
 * Selects a contact and renders the selected contact.
 * @param {string} id - The ID of the selected contact.
 * @returns {void}
 */
export function selectContact(id) {
    renderSelectedContact(STORAGE.currentUserContacts[id]);
    $("#contacts-container").classList.toggle("d-none", window.innerWidth <= 800);
}

/**
 * Closes the selected contact view.
 * @returns {void}
 */
export function closeSelectedContact() {
    $("#contacts-container").classList.remove("d-none");
}

/**
 * Renders the selected contact.
 * @param {Object} selectedContact - The selected contact object.
 * @returns {void}
 */
export function renderSelectedContact(selectedContact) {
    $("#selected-contact-container").innerHTML = selectedContactTemplate(selectedContact);
}

/**
 * Generates the HTML template for the selected contact.
 * @param {User} contact - The contact object.
 * @returns {string} - The HTML string for the selected contact.
 */
export function selectedContactTemplate({ id, img, name, email, phone, color }) {
    return /*html*/ `
        <div class="contact-container column">
            ${contactImgNameTemplate(color, name, img, id)}
            ${contactInfoTemplate()}
            ${contactMailTemplate(email)}
            ${contactPhoneTemplate(phone)}
        </div>
    `;
}

export function renderSearchResults(sortedUsers) {
    const searchResultsContainer = $("#user-search-result");
    searchResultsContainer.innerHTML = "";

    for (let i = 0; i < sortedUsers.length; i++) {
        const user = sortedUsers[i];
        searchResultsContainer.innerHTML += searchResultTemplates(user);
    }
}

/**
 * Selects a new contact and updates the input and image fields.
 * @param {string} id - The ID of the contact.
 * @param {string} img - The image URL of the contact.
 * @param {string} name - The name of the contact.
 * @param {string} color - The color associated with the contact.
 * @returns {void}
 */
export function selectNewContact(id, img, name, color) {
    clearImage();
    clearInput();

    const input = $("#input-name");
    const userImgContainer = $(".add-contact-field .user-img-container");
    const initials = getInitialsOfName(name);

    userImgContainer.innerHTML = img ? `<img src="${img}" alt="${name}">` : initials;
    userImgContainer.style.setProperty("--user-clr", color);
    input.value = name;
    input.dataset.id = id;

    clearResult();
}

/**
 * Sends friendship request to the selected user.
 * @returns {Promise<void>}
 */
export async function addContact() {
    const selectedUser = $("#input-name");
    const userExists = STORAGE.getUserByInput(selectedUser.value);
    throwErrors({ identifier: "select-valid-user", bool: !userExists });
    if (!userExists) return unsetSearchResultStyle();
    const selectedUserId = selectedUser.dataset.id;

    await STORAGE.currentUser.addContact(selectedUserId);

    $("#add-contact-modal").closeModal();
    return notification(`friendship-request, {name: '${STORAGE.data.users[selectedUserId].name}'}`);
}

/**
 * Deletes a contact from the current user's contacts.
 * @param {string} id - The ID of the contact to be deleted.
 * @returns {Promise<void>}
 */
export async function deleteContact(id) {
    const selectedContact = STORAGE.currentUserContacts[id];
    await Promise.all([
        selectedContact.deleteContact(STORAGE.currentUser.id),
        STORAGE.currentUser.deleteContact(`${id}`)
    ]);

    $(".contact-container").classList.add("d-none");
    renderContacts();
    location.reload();
}