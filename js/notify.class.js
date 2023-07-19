class Notify {
    constructor(type, body) {
        this.type = type;
        if (type == "friendRequest") {
            this.body = {
                id: body.id,
                message: ""
            }
        } else if (type == "boardDeleted") {
            this.body = body;
        }
    }

    // TBD

    renderNotifications = () => {
        
    }
}