function deleteContact (id) {
    log(id);
}

function clickFunction (event) {
    const id = event.currentTarget.dataset.id;
    deleteContact(id);
}

// deleteContact(id);
// $('#header-title').addEventListener('click', clickFunction);