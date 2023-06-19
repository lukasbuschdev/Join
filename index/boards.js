const addTaskModal = async () => {
    await includeTemplate($('#add-task-modal > div'));
    $('#add-task-modal').openModal();
}