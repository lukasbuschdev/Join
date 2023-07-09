const submitUpload = async () => {
    const formData = new FormData();
    const img = $('[type="file"]').files[0];
    if (!img) return;
    const uid = currentUserId();

    formData.append('user-img', img);
    formData.append('uid', uid)
    
    const userImg = await (await fetch('../php/uploadImg.php', {
        method: 'POST',
        body: formData
    })).json()

    $('#user-img').src = userImg.imageSrc;
    $('.picture-container').dataset.img = 'true';
}

const removeUpload = async () => {
    const container = event.currentTarget;
    if (container.dataset.img == 'false') return;
    
    const uid = currentUserId();
    const formData = new FormData();
    formData.append('uid', uid)
    await fetch('../php/uploadImg.php', {
        method: 'POST',
        body: formData
    });

    container.$('img').src = '';
    container.dataset.img = false;
}