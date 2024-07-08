const socket = io();
console.log("hey");

if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            socket.emit("send-location", { latitude, longitude });
        },
        (error) => {
            console.error(error);
        }, {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
    }
    );
}

const map = L.map("map").setView([0, 0], 16);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: 'faheeeeeeeeeeeeeeeeem'
}).addTo(map);

const markers = {};

// Initialize map with existing users' locations
socket.on("initialize", (userLocations) => {
    for (const id in userLocations) {
        const { latitude, longitude } = userLocations[id];
        markers[id] = L.marker([latitude, longitude]).addTo(map);
    }
});

socket.on("receive-location", (data) => {
    const { id, latitude, longitude } = data;
    map.setView([latitude, longitude]);
    if (markers[id]) {
        markers[id].setLatLng([latitude, longitude]);
    } else {
        markers[id] = L.marker([latitude, longitude]).addTo(map);
    }
});

socket.on("user-disconnected", (id) => {
    if (markers[id]) {
        map.removeLayer(markers[id]);
        delete markers[id];
    }
});
