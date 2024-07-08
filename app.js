const express = require('express');
const app = express();
const http = require("http");
const path = require('path');
const socketio = require("socket.io");

const server = http.createServer(app);
const io = socketio(server);

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));

// Set the view engine to EJS
app.set("view engine", "ejs");

// Store locations of connected users
const userLocations = {};

// Handle socket.io connections
io.on("connection", function (socket) {
    // Send the current state of all users' locations to the new user
    socket.emit("initialize", userLocations);

    socket.on("send-location", function (data) {
        userLocations[socket.id] = data;
        io.emit("receive-location", { id: socket.id, ...data });
    });

    socket.on("disconnect", function () {
        delete userLocations[socket.id];
        io.emit("user-disconnected", socket.id);
    });

    console.log("connected");
});

// Route for the index page
app.get('/', function (req, res) {
    res.render('index');
});

// Start the server
server.listen(3000, () => {
    console.log('Server is running on port 3000');
});
