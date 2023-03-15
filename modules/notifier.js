const { Provider, Notification } = require('apn');

class Notifier {
    constructor(options) {
        this.provider = new Provider(options);
    }

    notify(title, description, category) {
        const notification = new Notification({
            alert: {
                title: title,
                body: description,
            },
            badge: 1,
            topic: process.env.apnTopic,
            collapseId: category,
        });
        this.provider.send(notification, process.env.apnDeviceId);
    }
}

module.exports = Notifier;
