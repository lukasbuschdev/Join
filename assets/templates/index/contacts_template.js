export function contactListLetterTemplate(letter) {
	return /*html*/ `
        <div class="contact-letter">
            <span class="txt-normal">${letter}</span>
        </div>
    `;
};

export function contactListTemplate({ img, name, email, id, color }) {
	return /*html*/ `
        <div class="contact row" onclick="selectContact(${id})">
            <div class="user-img-container" style="--user-clr: ${color}">
                <span>${getInitialsOfName(name)}</span>
                <img src="${img}" alt="">
            </div>
            <div class="column">
                <span class="txt-normal contact-name">${name}</span>
                <span class="txt-small contact-email">${email}</span>
            </div>
        </div>
    `;
};

export function userImgGrayTemplate() {
    return /*html*/ `
        <img class="user-img-gray" src="/Join/assets/img/icons/user_img_gray.svg">
    `;
}

export function userImgTemplate() {
    return /*html*/ `
        <img class="user-img-gray" src="/Join/assets/img/icons/user_img_gray.svg">
    `;
}

export function contactImgNameTemplate(color, name, img, id) {
	return /*html*/ `
        <div class="img-name row">
            <div class="user-img-container" style="--user-clr: ${color}">
                <h1>${getInitialsOfName(name)}</h1>
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
            <a id="phone-number" href="${
				phone == "N/A" ? "return false;" : "tel:${phone}"
			}">${phone}</a>
        </div>
    `;
}

export function searchResultTemplates({ id, img, name, email, color }) {
	return /*html*/ `
        <div class="search-result-contact row gap-10" id="search-result-contact" onclick="selectNewContact('${id}', '${img}', '${name}', '${color}')">
            <div class="contact-img user-img-container" data-img="false" style="--user-clr: ${color}">
                <h3>${getInitialsOfName(name)}</h3>
                <img src="${img}">
            </div>
            <span class="txt-normal result-name-email">${name}</span>
            <span class="txt-normal result-name-email mail-clr">${email}</span>
        </div>   
    `;
}