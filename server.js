const mongo = require('mongodb').MongoClient
const bcrypt = require('bcrypt');
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const SALT_WORK_FACTOR = 10;

const { Server } = require('socket.io') //.listen(3000).sockets
const io = new Server(server);


//app.set('port', process.env.PORT || 3000);
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
});


mongo.connect('mongodb://localhost/login', function(err, db) {
    if (err) throw error;

    console.log('Connected to the database!!');

    io.on('connection', (socket) => {
        let login = db.collection('login');
        socket.on('submit', function(data) {
            let user = data.name
            let pass = data.password

            if (user == '' || pass == '') {
                console.log("Empty field");
            } else {
                //hash the password
                bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
                    if (err) throw error;
                    bcrypt.hash(pass, salt, function(err, hash) {
                        if (err) throw error;

                        pass = hash;
                        login.insert({ username: user, password: pass }, function() {
                            console.log("User was signed up:" + user);
                            console.log('hashed password:' + pass);
                        });
                    });
                });
            }
        });
    });

    console.log('user connected');
});



server.listen(3000, function() {
    console.log('Express started on http://localhost:' +
        +'; press Ctrl-C to terminate.');
});