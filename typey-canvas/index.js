var canvas = document.getElementById("my-canvas");
var context = canvas.getContext("2d");
context.fillStyle = "blue";
context.font = "bold 16px Arial";

var x = 10;
var h = 16;
var under = 8
var y = h;
var ldx = NaN;

function newline() {
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
    erasecursor();
    dx = context.measureText(c).width;
    drawblock(x, "white");
    if (x+2*dx >= canvas.width) {
        newline();
    }
    context.fillStyle = "blue";
    context.fillText(c, x, y);
    x += dx;
    ldx = dx;
    drawcursor();
}

function drawkeypress(e) {

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
window.setInterval(function(){
    drawcursor();
    setTimeout(erasecursor, 500)
}, 1000);
