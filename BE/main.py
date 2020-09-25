from fastapi import FastAPI
import json
from fastapi.staticfiles import StaticFiles


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

def authenticate(userid:str, password:str):
    if userid not in passwords:
        return False, 'userid unknown'
    if passwords[userid] != password:
        return False, 'password incorrect. Password is ' + passwords[userid];
    if userid not in data:
        data[userid] = [""]
    return True, 'okay'

@app.get("/save")
async def save(userid:str, password:str):
    okay, msg = authenticate(userid, password) 
    if not okay: return msg
    if userid not in admins:
        return 'ur not an admin.'
    json.dump([data, passwords], open('datapasswords.json', 'w'))

@app.get("/load")
async def load(userid:str, password:str):
    okay, msg = authenticate(userid, password) 
    if not okay: return msg
    if userid not in admins:
        return 'ur not an admin.'

    data, passwords = json.load(open('datapasswords.json', 'r'))

def newline_to_br(text):
    return text.replace('\n', '<br>')

@app.get("/get_entries")
async def get_entries(userid:str, password:str):
    okay, msg = authenticate(userid, password) 
    if not okay: return msg

    return ''.join([f'<p>{newline_to_br(x)}</p>' for x in data[userid][::-1] if x != ""])


@app.get("/commit_char")
async def commit_char(userid:str, password:str, charr:str):
    okay, msg = authenticate(userid, password) 
    if not okay: return msg

    data[userid][-1] = data[userid][-1] + charr
    return 'okay'


@app.get("/commit_entry")
async def commit_entry(userid:str, password:str):
    okay, msg = authenticate(userid, password) 
    if not okay: return msg

    data[userid].append("")
    return 'okay'

@app.get("/.*", include_in_schema=False)
def root():
    return HTMLResponse(pkg_resources.resource_string(__name__, 'static/index.html'))
