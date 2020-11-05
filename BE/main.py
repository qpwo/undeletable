from fastapi import FastAPI, HTTPException, Response
from fastapi.responses import HTMLResponse, FileResponse
import json
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from fastapi_utils.tasks import repeat_every
import time
import random
import hashlib
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse

import os
from twilio.rest import Client

# Find these values at https://twilio.com/user/account
# To set up environmental variables, see http://twil.io/secure
secrets = json.load(open("secrets.json"))
account_sid = secrets["sid"]
auth_token = secrets["token"]
client = Client(account_sid, auth_token)

words = open("words.txt").readlines()



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

tokens = dict()

admins = ['max']

firstnames = [line.strip() for line in open('firstnames.txt')]
lastnames = [line.strip() for line in open('lastnames.txt')]


def generate_password():
    return '-'.join([random.choice(words).strip() for _ in range(3)])

print("sample passwords:")
for i in range(5):
    print(generate_password())

def send_text(number, message):
    print('===================')
    print('Text to', number)
    print(message)
    if len(number) == 10 and all([c in '0123456789' for c in number]):
        print("Send an actual Text message! Yay!")
        client.api.account.messages.create(
                to="+1"+number,
                from_="+12059740720",
                body=message)
    print('===================')

class UserId(BaseModel):
    userid: str

class Token(BaseModel):
    token: str

class TokenWithChar(Token):
    charr: str

class TokenWithIsPrivate(Token):
    is_private: bool

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

def newline_to_br(text):
    return text.replace('\n', '<br>')

def style_if_private(is_private):
    if is_private:
        return 'style="background-color:powderblue;"'
    else:
        return ''


def make_token():
    return str(random.randrange(0,23048239048))

#User API
@app.post("/get_token/")
async def get_token(args: Login):
    print(args)
    print(passwords)
    if args.userid in passwords:
        if passwords[args.userid].strip() == args.password.strip():
            token = make_token()
            tokens[token] = args.userid
            return token
        else:
            return HTTPException(status_code=400, detail="Wrong passowrd")
    else:
        return HTTPException(status_code=400, detail="Invalid username")

@app.post("/logout/")
async def logout(args: Token):
    print(args)
    tokens.pop(args.token, None)


@app.post("/send_text/")
async def send_text_(args: UserId):
    new_password = generate_password()
    passwords[args.userid] = new_password
    send_text(args.userid, 'Your new password is: ' + new_password)
    initialize_user_if_not_initialized(args.userid)

def check_token(args):
    if args.token not in tokens:
        raise HTTPException(status_code=400, detail="invalid token please log in again")
    else:
        return tokens[args.token]

@app.post("/get_entries/")
async def get_entries(args: Token):
    userid = check_token(args)
    return ''.join(
            [f'<p class="box" {style_if_private(x[0])}>{newline_to_br(x[2])}</p>' 
                for x in data[userid][::-1] if x[2].strip() != ""])


@app.post("/commit_char/")
async def commit_char(args: TokenWithChar):
    userid = check_token(args)

    # Add the new char onto the user's last post
    data[userid][-1][2] = data[userid][-1][2] + args.charr
    return 'okay'

@app.post("/commit_entry/")
async def commit_entry(args: TokenWithIsPrivate):
    userid = check_token(args)

    # Make a new post
    data[userid].append([args.is_private, time.time(), ""])
    return 'okay'


# Saves user data to file every 10 seconds
@app.on_event("startup")
@repeat_every(seconds=10)
def write_user_data():
    print("saving user data to json")
    json.dump([data, passwords], open('datapasswords.json', 'w'))




#File server

def userid_to_alias(userid):
    numbers = list(hashlib.sha224(str.encode(userid)).digest())
    return firstnames[numbers[0]] + ' ' + lastnames[numbers[1] % len(lastnames)]

@app.get("/wall")
def wall():
    html_parts = []
    for user, entries in data.items():
        alias = userid_to_alias(user)
        for (is_private, time_stamp, text) in entries:
            if not is_private and text.strip() != "":
                html_parts.append([time_stamp,
                    f'<p class="nospace">{alias} at {time.ctime(time_stamp)}</p>' +
                    f'<p class="box">{newline_to_br(text)}</p>'])
    html_parts.sort(key=lambda x: x[0])

    html = ('''<head>
<link rel="icon" type="image/x-icon" href="favicon.ico"/>
<link rel="stylesheet" href="index.css">
</head>
<body>
    <h1>Undeltable.net</h1>
    <h1>Latest Public Posts</h1>'''
    + ''.join([post for t,post in html_parts[::-1]])
    + '</body>')
    print(html)
    return HTMLResponse(html)
    

@app.get("/", include_in_schema=False)
def root():
     return FileResponse('../typey-canvas/index.html')
app.mount("/", StaticFiles(directory="../typey-canvas/"), name="static")
