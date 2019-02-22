new Vue({
    el: '#app',

    data: {
        ws: null, // Our websocket
        newMsg: '', // Holds new messages to be sent to the server
        chatContent: '', // A running list of chat messages displayed on the screen
        email: null, // Email address used for grabbing an avatar
        username: null, // Our username
        joined: false // True if email and username have been filled in
    },

    created: function() {
        var self = this;
        // this.ws = new WebSocket('ws://' + window.location.host + '/ws');
        this.ws = new ReconnectingWebSocket('ws://' + window.location.host + '/ws', null, {debug: true, reconnectInterval: 3000});
        this.ws.binaryType = 'arraybuffer';
        this.ws.addEventListener('message', function(e) {
            var arrayBuffer;
            var fileReader = new FileReader();
            arrayBuffer = fileReader.readAsArrayBuffer(e.data);
            fileReader.onload = function(event) {
                arrayBuffer = event.target.result
                console.log(arrayBuffer);
                var msg = msgpack.decode(new Uint8Array(arrayBuffer));
                self.chatContent += '<div class="chip">'
                    + '<img src="' + self.gravatarURL(msg.email) + '">' // Avatar
                    + msg.username
                    + '</div>'
                    + emojione.toImage(msg.message) + '<br/>'; // Parse emojis

                var element = document.getElementById('chat-messages');
                element.scrollTop = element.scrollHeight; // Auto scroll to the bottom
            };
        });
    },

    methods: {
        send: function () {
            // var msgpack = require("msgpack-lite");
            var msss = msgpack.encode({"email": this.email, "username": this.username, "message": $('<p>').html(this.newMsg).text()});
            if (this.newMsg != '') {
                this.ws.send(msss);
                this.newMsg = ''; // Reset newMsg
            }
        },

        join: function () {
            if (!this.email) {
                Materialize.toast('You must enter an email', 2000);
                return
            }
            if (!this.username) {
                Materialize.toast('You must choose a username', 2000);
                return
            }
            this.email = $('<p>').html(this.email).text();
            this.username = $('<p>').html(this.username).text();
            this.joined = true;
        },

        gravatarURL: function(email) {
            return 'http://www.gravatar.com/avatar/' + CryptoJS.MD5(email);
        }
    }
});