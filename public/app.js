new Vue({
    el: '#app',

    data: {
        ws: null, // Our websocket
        newMsg: '', // Holds new messages to be sent to the server
        chatContent: '', // A running list of chat messages displayed on the screen
        email: null, // Email address used for grabbing an avatar
        username: null, // Our username
        joined: false, // True if email and username have been filled in
        userInfo: null
    },

    created: function () {
        this.connect("ws://10.1.2.73:8000/ws");
        this._getUserInfo();
    },

    methods: {

        connect: function (host) {
            this.ws = new ReconnectingWebSocket(host, null, { debug: true, reconnectInterval: 3000 });
            this.ws.binaryType = 'arraybuffer';
            this.ws.addEventListener('message', this.onMessage.bind(this));
        },

        onMessage: function (e) {
            if (e) {
                this._readMessage(e.data, this._addMessage.bind(this));
            }
        },

        send: function () {
            var msss = {
                "email": this.email,
                "username": this.username,
                "message": this.newMsg
            };
            if (this.newMsg != '') {
                this._sendMessage(msss);
                this.newMsg = '';
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

            this._login();
            this._setUserInfo(this.email, this.username);
        },


        _sendMessage: function (data) {
            if (!data) {
                return;
            }
            let msg = msgpack.encode(data);
            this.ws.send(msg);
        },

        _readMessage: function (data, callback) {
            var arrayBuffer;
            var fileReader = new FileReader();
            arrayBuffer = fileReader.readAsArrayBuffer(data);
            fileReader.onload = function (event) {
                arrayBuffer = event.target.result;
                var msg = msgpack.decode(new Uint8Array(arrayBuffer));
                console.log('_readMessage', msg);
                callback && callback(msg);
            };
        },

        _addMessage: function (msg) {
            var isSelf = msg.username === this.username;
            this.chatContent += '<div class="message-cont ' + (isSelf ? 'self' : '') + '">'
                + '<div class="message-title">' + msg.username + '</div>'
                + '<div class="message">' + msg.message + '</div>'
                + '</div>';
            setTimeout(function () {
                document.getElementById('chat-messages').scrollTop = document.getElementById('chat-messages').scrollHeight + 100;
            }, 1);
        },


        _setUserInfo: function (email, username) {
            let userInfo = JSON.stringify({
                email: username,
                username: username
            });
            window.localStorage.setItem('userInfo', userInfo);
        },

        _getUserInfo: function () {
            let userInfo = window.localStorage.getItem('userInfo');
            if (userInfo) {
                userInfo = JSON.parse(userInfo);
                this.username = userInfo.username;
                this.email = userInfo.email;
                this._login();
            }
        },

        _login: function () {
            $('#user').html(this.username + '　');
            this.joined = true;
        }

    }
});