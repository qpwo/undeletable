from fastapi import FastAPI
import json
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel



app = FastAPI()
app.mount("/static", StaticFiles(directory="../typey-canvas/"), name="static")

#passwords = {
#        'max': 'foo',
#        'luke': 'funk'}
#data = {
#        'max': ['foo bar lool', 'I eat eggs'],
#        'luke': ['smelly eggs']}
#
data, passwords = json.load(open('datapasswords.json', 'r'))

admins = ['max']

@app.get("/")
async def read_root():
    return {"Hello": "World"}


class Login(BaseModel):
    userid: str
    password: str

class LoginWithChar(Login):
    charr: str

def authenticate(args: Login):
    if args.userid not in passwords:
        return False, 'userid unknown'
    if passwords[args.userid] != args.password:
        return False, 'password incorrect. Password is ' + passwords[args.userid];
    if args.userid not in data:
        data[args.userid] = [""]
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

#User API
@app.post("/get_entries/")
async def get_entries(args: Login):
    okay, msg = authenticate(args) 
    if not okay: return msg

    return ''.join([f'<p>{newline_to_br(x)}</p>' for x in data[args.userid][::-1] if x != ""])



@app.post("/commit_char/")
async def commit_char(args: LoginWithChar):
    okay, msg = authenticate(args) 
    if not okay: return msg

    # Add the new char onto the user's last post
    data[args.userid][-1] = data[args.userid][-1] + args.charr
    return 'okay'


@app.post("/commit_entry/")
async def commit_entry(args: Login):
    okay, msg = authenticate(args) 
    if not okay: return msg

    # Make a new post
    data[args.userid].append("")
    return 'okay'

#File server
@app.get("/.*", include_in_schema=False)
def root():
    return HTMLResponse(pkg_resources.resource_string(__name__, 'static/index.html'))
