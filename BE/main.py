from fastapi import FastAPI, HTTPException, Response
from fastapi.responses import HTMLResponse, FileResponse
import json
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from fastapi_utils.tasks import repeat_every
import time
import random




app = FastAPI()

# The true/false in data means whether or not it is private or public

#passwords = {
#        'max': 'foo',
#        'luke': 'funk'}
#data = {
#        'max': [[true, 543, 'foo bar lool'], [false, 4353453, 'I eat eggs']],
#        'luke': [[true, 534534523, 'smelly eggs']}
#

# The current type for data entries is a list of [is_private (bool), timestamp (int), text (str)]
data, passwords = json.load(open('datapasswords.json', 'r'))

admins = ['max']


def generate_password():
    silly_word = random.choice(['snoopy', 'floppy', 'pants'])
    serious_word = random.choice(['password', 'rake', 'nineteen'])
    security = random.choice(['3421', '&&12', '*uwu*'])
    return silly_word + serious_word + security

def send_text(number, message):
    ''' This just prints it to the console for now, but in the future will
    actually send a text message'''
    print('===================')
    print('Text to', number)
    print(message)
    print('===================')

class Login(BaseModel):
    userid: str
    password: str

class LoginWithChar(Login):
    charr: str

class LoginWithIsPrivate(Login):
    is_private: bool

def initialize_user_if_not_initialized(userid):
    if userid not in data:
        data[userid] = [[False, time.time(), ""]]

def authenticate(args: Login):
    # setting new password
    if args.password.strip() == '' and args.userid.strip() != '':
        new_password = generate_password()
        passwords[args.userid] = new_password
        send_text(args.userid, new_password)
        initialize_user_if_not_initialized(args.userid)
        return False, f'your password has been texted to {args.userid}'
    # Invalid username 
    if args.userid not in passwords:
        return False, 'userid unknown'
    # Incorrect password
    if passwords[args.userid] != args.password:
        return False, 'password incorrect. Password is ' + passwords[args.userid];
    # Make the first entry for this new user
    initialize_user_if_not_initialized(args.userid)
    return True, 'okay'

# Admin commands
@app.post("/save/")
async def save(args: Login):
    okay, msg = authenticate(args) 
    if not okay: return msg
    if args.userid not in admins:
        return 'ur not an admin.'
    json.dump([data, passwords], open('datapasswords.json', 'w'))

@app.post("/load/")
async def load(args: Login):
    okay, msg = authenticate(args) 
    if not okay: return msg
    if args.userid not in admins:
        return 'ur not an admin.'

    data, passwords = json.load(open('datapasswords.json', 'r'))

def newline_to_br(text):
    return text.replace('\n', '<br>')

def style_if_private(is_private):
    if is_private:
        return 'style="background-color:powderblue;"'
    else:
        return ''

#User API
@app.post("/get_entries/")
async def get_entries(args: Login):
    okay, msg = authenticate(args) 
    if not okay: 
        raise HTTPException(status_code=400, detail=msg)

    return ''.join(
            [f'<p class="box" {style_if_private(x[0])}>{newline_to_br(x[2])}</p>' 
                for x in data[args.userid][::-1] if x[2].strip() != ""])


@app.post("/commit_char/")
async def commit_char(args: LoginWithChar):
    okay, msg = authenticate(args) 
    if not okay: return msg

    # Add the new char onto the user's last post
    data[args.userid][-1][2] = data[args.userid][-1][2] + args.charr
    return 'okay'


@app.post("/commit_entry/")
async def commit_entry(args: LoginWithIsPrivate):
    okay, msg = authenticate(args)
    if not okay: return msg

    # Make a new post
    data[args.userid].append([args.is_private, time.time(), ""])
    return 'okay'


# Saves user data to file every 10 seconds
@app.on_event("startup")
@repeat_every(seconds=10)
def write_user_data():
    print("saving user data to json")
    json.dump([data, passwords], open('datapasswords.json', 'w'))




#File server


@app.get("/wall")
def wall():
    html_parts = []
    for user, entries in data.items():
        for (is_private, time_stamp, text) in entries:
            if not is_private and text.strip() != "":
                html_parts.append([time_stamp,
                    f'<p class="nospace">{user} at {time.ctime(time_stamp)}</p>' +
                    f'<p class="box">{newline_to_br(text)}</p>'])
    html_parts.sort(key=lambda x: x[0])

    html = ('''<head>
<link rel="icon" type="image/x-icon" href="favicon.ico"/>
<link rel="stylesheet" href="index.css">
</head>
<body>
    <h1>Undeltable</h1>
    <h1>Latest Public Posts</h1>'''
    + ''.join([post for t,post in html_parts[::-1]])
    + '</body>')
    print(html)
    return HTMLResponse(html)
    

@app.get("/", include_in_schema=False)
def root():
     return FileResponse('../typey-canvas/index.html')
app.mount("/", StaticFiles(directory="../typey-canvas/"), name="static")
