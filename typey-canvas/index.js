function get(string) {
    return document.getElementById(string)
}

const canvasContainer = get("canvasContainer")
const canvas = get("my_canvas");
const userid_box = get("userid");
const password_box = get("password");
const private_checkbox = get("private");
const keyboard_bringer = get("keyboard_bringer");
const context = canvas.getContext("2d");

const userid1 = get("userid1")
const password1 = get("password1")
const login1 = get("login1")
const userid2 = get("userid2")
const password2 = get("password2")
const login2 = get("login2")
const textPasswordArea = get("textPasswordArea")
const sendText = get("sendText")
const sendTextAgain = get("sendTextAgain")
const appArea = get("appArea")
const loginArea = get("loginArea")
const logoutButton = get("logout")


// from w3 schools
function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    document.cookie = `${cname}=${cvalue};expires=${d.toUTCString()};path=/`
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
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
        if (event.key !== "Enter")
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
    async_api("/commit_entry/", { token, is_private }, () => { })
}

function has_prop(obj, prop) {
    return Object.keys(obj).indexOf(prop) !== -1
}

// TODO this is probably a bad way to do this lol
function is_error(res) {
    return has_prop(res, 'detail')
}

async function get_entries(token) {
    res = await async_api("/get_entries/", { token })
    if (is_error(res)) {
        document.getElementById("old_posts").innerHTML = res.detail
        hide(canvasContainer)
    } else {
        document.getElementById("old_posts").innerHTML = await res
        show(canvasContainer)
    }
}

// returns success
async function get_token(userid, password) {
    res = await async_api("/get_token/", { userid, password })
    if (is_error(res)) {
        console.log("did not get token good")
        console.log(res)
        setCookie("token", "", 1)
        return false
    } else {
        console.log("got token good")
        console.log(res)
        setCookie("token", res, 1)
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
    res = async_api("/send_text/", { userid })
    if (is_error(res)) {
        console.log(res)
        return false
    } else {
        return true
    }
}
async function logout(token) {
    setCookie("token", "", 1)
    async_api("/logout/", { token })
    show(loginArea)
    hide(appArea)
}

function commit_char(token, c) {
    async_api("/commit_char/", { token, charr: c })
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
    erasecursor();
    x = 10;
    y += h + under;
}
function drawblock(xx, yy, color) {
    context.beginPath();
    context.rect(xx, yy - h / 4, 10, h / 4);
    context.fillStyle = color;
    context.fill();
}

function drawcursor() {
    drawblock(x + 2, y, "blue");
}

function erasecursor() {
    context.clearRect(x + 1, y - h, 12, h);
}

const dashWidth = context.measureText('-').width
function drawchar(c) {
    commit_char(gt(), c);
    erasecursor();
    dx = context.measureText(c).width;
    drawblock(x, "white");
    if (x + 2 * dx >= canvas.width - dashWidth) {
        if (c != ' ') {
            context.fillText('-', x, y);
            x += dashWidth;
        }
        newline();
    }
    context.fillStyle = "blue";
    context.fillText(c, x, y);
    x += dx;
    drawcursor();
}

// only used for hacky mobile stuff
function drawtextchange(e) {
    var str = keyboard_bringer.value;
    var key = str.charAt(str.length-1)
    if (e.key == "Enter" || e.key == "Space" || e.key == "Backspace" || e.key == " ") {
        return
    }
    drawchar(key)
}

function drawkeypress(e) {
    if (gt() == "") {
        return
    }
    var key = e.key

    if (event.target == userid_box || event.target == password_box) {
        console.log("event in a real text field", e);
        return;
    }
    if (key == "Backspace" || key == "Delete") {
        alert("NO! YOU CAN'T DO THAT!");
    } else if (key == "Enter") {
        commit_char(gt(), "\n")
        newline();
    } else if (key == "Space") {
        drawchar(" ");
    } else if (key == "Tab") {
        drawchar("\t"); // TO NOT DO: doesn't work bc tab only make keydown
    } else if (key.length == 1) {
        drawchar(e.key);
    } else {
        alert("unknown key: ", key)
    }
    e.preventDefault();
    console.log("drew char", e);
    //alert(e.keyCode)
    //alert(JSON.stringify(e, null, 4));
}

// blink the cursor
window.setInterval(function () {
    drawcursor();
    setTimeout(erasecursor, 500)
}, 1000);

// makes is so all keypresses are used for the canvas
//window.addEventListener("keypress", drawkeypress, true);
keyboard_bringer.addEventListener("keypress", drawkeypress, true);
keyboard_bringer.addEventListener("keyup", drawtextchange, true);
keyboard_bringer.addEventListener("blur", ()=>{keyboard_bringer.value=""}, true);
keyboard_bringer.addEventListener("click", ()=>{keyboard_bringer.value=""}, true);
window.addEventListener("keyup", (e) => { e.preventDefault() }, true);

// trying to get it to work on mobile
canvas.addEventListener("click", (e) => { keyboard_bringer.focus() })

document.getElementById("write_another").addEventListener("click", commit_canvas);

private_checkbox.addEventListener("change", commit_canvas)
//********************
// Login stuff
// ********************


link_enter_key_to_button(userid1, login1)
link_enter_key_to_button(password1, login1)
link_enter_key_to_button(userid2, sendText)
link_enter_key_to_button(password2, login2)


// first login box
login1.addEventListener("click", async () => {
    var success = await get_token(userid1.value, password1.value)
    console.log("suvves?", success)
    if (success) {
        typing_mode(gt())
    }
})

// second (text-sending) login box
sendText.addEventListener("click", async () => {
    var success = await send_text(userid2.value)
    if (success) {
        hide(sendText)
        show(textPasswordArea)
    }
})
login2.addEventListener("click", async () => {
    var success = await get_token(userid2.value, password2.value)
    if (success) {
        typing_mode(gt())
    }
})
sendTextAgain.addEventListener("click", async () => {
    send_text(userid2.value)
})

logoutButton.addEventListener("click", () => {
    logout(gt())
})

if (gt() != "") {
    console.log("found a token")
    console.log(gt())
    typing_mode(gt())
}

