userid = "max";
password = "foo";

function api(url, data, callback)
{
    const bullshit = {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify(data)
    }
    fetch(url, bullshit)
        .then(response => response.json())
        .then(callback)
        .catch(function(res){ console.log(res) })
}

function login(e) {
    console.log("loggin in");
    api("/commit_entry/", {userid,password}, ()=>{})

    api("/get_entries/", {userid,password},
        function(data) {
            document.getElementById("old_posts").innerHTML = data;
            show_canvas();
        });
}

function commit_canvas() {
    x = 10;
    y = h;
    context.clearRect(0, 0, canvas.width, canvas.height);
    login();
}


function hide_canvas() {
    document.getElementById("canvas_container").style.display = "none";
}
function show_canvas() {
    document.getElementById("canvas_container").style.display = "block";
}

hide_canvas()



var canvas = document.getElementById("my_canvas");
var userid_box = document.getElementById("userid");
var password_box = document.getElementById("password");
var keyboard_bringer = document.getElementById("keyboard_bringer");
var context = canvas.getContext("2d");
context.fillStyle = "blue";
context.font = "bold 16px Arial";

var x = 10;
var h = 16;
var under = 8
var y = h;

function commit_char(c) {
    api("/commit_char/", {charr:c, userid, password}, () => {})
}
    
function newline() {
    commit_char("\n");
    erasecursor();
    x = 10;
    y += h+under;
    drawcursor();
}
function drawblock(xx, yy, color) {
    context.beginPath();
    context.rect(xx, yy-h/4, 10, h/4);
    context.fillStyle = color;
    context.fill();
}

function drawcursor() {
    drawblock(x+2, y, "blue");
}

function erasecursor() {
    context.clearRect(x+1, y-h, 12, h);
    //drawblock(x, y, "white");
}

function drawchar(c) {
    commit_char(c);
    erasecursor();
    dx = context.measureText(c).width;
    drawblock(x, "white");
    if (x+2*dx >= canvas.width) {
        newline();
    }
    context.fillStyle = "blue";
    context.fillText(c, x, y);
    x += dx;
    drawcursor();
}

function drawkeypress(e) {
    if (event.target == userid_box || event.target == password_box) {
        console.log("event in a real text field", e);
        return;
    }

    if (e.key == "Backspace" || e.key == "Delete") {
        alert("NO! YOU CAN'T DO THAT!");
    } else if (e.key == "Enter") {
        newline();
    } else if (e.key == "Space") {
        drawchar(" ");
    } else if (e.key == "Tab") {
        drawchar("\t"); // TO NOT DO: doesn't work bc tab only make keydown
    } else if (e.key.length == 1) {
        drawchar(e.key);
    }

    e.preventDefault();
    console.log(e);
}

window.addEventListener("keypress", drawkeypress, true);
canvas.addEventListener("click", (e) => {keyboard_bringer.focus()})
document.getElementById("userid").addEventListener("change", (e) => {userid = e.target.value})
document.getElementById("password").addEventListener("change", (e) => {password = e.target.value})
document.getElementById("login").addEventListener("click", login);
document.getElementById("write_another").addEventListener("click", commit_canvas);

window.setInterval(function(){
    drawcursor();
    setTimeout(erasecursor, 500)
}, 1000);
