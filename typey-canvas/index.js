const canvasContainer = document.getElementById("canvasContainer")
const canvas = document.getElementById("my_canvas");
const userid_box = document.getElementById("userid");
const password_box = document.getElementById("password");
const private_checkbox = document.getElementById("private");
const keyboard_bringer = document.getElementById("keyboard_bringer");
const context = canvas.getContext("2d");

const userid1 = document.getElementById("userid1")
const password1 = document.getElementById("password1")
const login1 = document.getElementById("login1")
const userid2 = document.getElementById("userid2")
const password2 = document.getElementById("password2")
const login2 = document.getElementById("login2")
const textPasswordArea = document.getElementById("textPasswordArea")
const sendText = document.getElementById("sendText")
const sendTextAgain = document.getElementById("sendTextAgain")
const appArea = document.getElementById("appArea")
const loginArea = document.getElementById("loginArea")
const logoutButton = document.getElementById("logout")


// from w3 schools
function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  var expires = "expires="+d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
  var name = cname + "=";
  var ca = document.cookie.split(';');
  for(var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

// shorthand get token
function gt() {
    return getCookie("token")
}

function show(el) {
    el.style.display = null
}
function hide(el) {
    el.style.display = "none"
}

function typing_mode(token) {
    hide(loginArea)
    show(appArea)
    get_entries(token)
    commit_entries(token)
}
function link_enter_key_to_button(element, button) {
    element.addEventListener("keyup", event => {
        if(event.key !== "Enter") 
            return
        button.click()
        event.preventDefault()
    })
}



//********************
// Network stuff
// ********************

async function async_api(url, data) {
    const bullshit = {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify(data)
    }
    return (await fetch(url, bullshit)).json()
}


function commit_entries(token) {
    var is_private = private_checkbox.checked
    async_api("/commit_entry/", {token,is_private}, ()=>{})
}

function has_prop(obj, prop) {
    return Object.keys(obj).indexOf(prop) !== -1
}

// TODO this is probably a bad way to do this lol
function is_error(res) {
    return has_prop(res, 'detail')
}

async function get_entries(token) {
    res = await async_api("/get_entries/", {token})
    if (is_error(res)) {
        document.getElementById("old_posts").innerHTML = res.detail
        hide(canvasContainer)
    } else {
        document.getElementById("old_posts").innerHTML = await res
        show(canvasContainer)
    }
}

// returns success
async function get_token(userid,password) {
    res = async_api("/get_token/", {userid,password})
    if (is_error(res)) {
        console.log("did not get token good")
        console.log(res)
        return false
    } else {
        console.log("got token good")
        console.log(res)
        setCookie("token", await res, 1)
        return true
    }
}

function is_phone_number(str) {
    return /^\d+$/.test(str) && str.length == 10
}

// returns success
async function send_text(userid) {
    if (!is_phone_number(userid)) {
        alert("That's not a phone number. Type only digits, no country code (10 digits).")
        return false
    }
    res = async_api("/send_text/", {userid})
    if (is_error(res)) {
        console.log(res)
        return false
    } else {
        return true
    }
}
async function logout(token) {
    setCookie("token", "", 1)
    async_api("/logout/", {token})
    show(loginArea)
    hide(appArea)
}

function commit_char(token, c) {
    async_api("/commit_char/", {token, charr:c})
}


//********************
// Canvas graphics stuff
// ********************



function commit_canvas() {
    x = 10;
    y = h;
    context.clearRect(0, 0, canvas.width, canvas.height);
    commit_entries(gt())
    get_entries(gt())
}

context.fillStyle = "blue";
context.font = "bold 16px Arial";

var x = 10;
var h = 16;
var under = 8
var y = h;

    
function newline() {
    commit_char(gt(), "\n");
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
}

function drawchar(c) {
    commit_char(gt(), c);
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
    if (gt() == "") {
        return
    }
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
    console.log("drew char", e);
}

// blink the cursor
window.setInterval(function(){
    drawcursor();
    setTimeout(erasecursor, 500)
}, 1000);

// makes is so all keypresses are used for the canvas
window.addEventListener("keypress", drawkeypress, true);
window.addEventListener("keyup", (e)=>{e.preventDefault()}, true);
// trying to get it to work on mobile
canvas.addEventListener("click", (e) => {keyboard_bringer.focus()})

document.getElementById("write_another").addEventListener("click", commit_canvas);

private_checkbox.addEventListener("change", commit_canvas)
//********************
// Login stuff
// ********************


link_enter_key_to_button(userid1, login1)
link_enter_key_to_button(password1, login1)
link_enter_key_to_button(userid2, login2)
link_enter_key_to_button(password2, login2)


// first login box
login1.addEventListener("click", async ()=>{
    var success = await get_token(userid1.value, password1.value)
    console.log("suvves?", success)
    if (success) {
        typing_mode(gt())
    }
})

// second (text-sending) login box
sendText.addEventListener("click", async ()=>{
    var success = await send_text(userid2.value)
    if (success) {
        hide(sendText)
        show(textPasswordArea)
    }
})
login2.addEventListener("click", async ()=>{
    var success = await get_token(userid2.value, password2.value)
    if (success) {
        typing_mode(gt())
    }
})
sendTextAgain.addEventListener("click", async ()=>{
    send_text(userid2.value)
})

logoutButton.addEventListener("click", ()=>{
    logout(gt())
})

if (gt() != "") {
    console.log("found a token")
    console.log(gt())
    typing_mode(gt())
}

