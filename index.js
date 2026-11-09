const express = require("express");
const app = express();

app.use(express.static("public"));

const port = 3000;



// Songs Data
let songs = [
    {
        id: 1,
        name: "Dil To Bachcha Hai",
        artist: "Unknown",
        image: "/Assets/bollywood-hits.jpg",
        audio: "/Assets/DIL TO BACHCHA HAI.mp3"
    },
    {
        id: 2,
        name: "Tum Ho Rockstar",
        artist: "Unknown",
        image: "/Assets/daylight.png",
        audio: "/Assets/Tum Ho Rockstar 320 Kbps.mp3"
    }
];

// get all songs
app.get("/api/songs",(req,res)=>{
    res.json(songs);
});

// home route 
app.get("/",(req,res)=>{
    res.sendFile(__dirname + "/public/Refloi.html");
});

// start over
app.listen(port,() =>{
    console.log(`refloi server running on port ${port}`);
});