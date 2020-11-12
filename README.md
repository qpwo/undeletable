# Undeletable
An app that allows you to append to a notebook of sorts, but prohibits you from deleting anything from said notebook thing.

## 2020-11-12

- [ ] Keyboard thing working on mobile
- [ ] Make checkbox behavior clear
- [ ] 

## Uses
- Write a cookbook
- Write a stream of consciousness novel
- Think of a lot of ways to say "I like peaches."
- Write a ledger that can't be modified

# Spec


[ ] Bullets
    - No nesting. Or one-layer nesting.
[ ] Each bullet shows a timestamp
[ ] Each bullet is numbered
[ ] You can type eg #37 and it’s automatically a link
    [ ] Hover on a link to see the text
    [ ] Click a bullet to expand all the links in a list below?
[ ] You can add tags to old bullets
[ ] You edit within a bullet until you hit enter? Backspace permitted or not?
[ ] A single document per user — minimal logic per bullet, or use memoization
    - Support for thousands of bullets
[ ] Copy-paste disallowed?
    - Max says it breaks standard textbox interface expectations
        - Not a problem if backspace if forbidden
        - UI should heavily indicate that this isn’t your regular text box, maybe some magical CSS moving BS and sparkles come out when you type
[ ] Sends you to the bottom when you open it
[ ] Random sort is available
[ ] Sign-in with phone number
    - Have to send a text with passcode
    - Either make it ourselves or use a service
    - How to pay cost?
[ ] Have the ability to make public posts, and you can see when others are typing in real time
    - Hofstadter talks about a linux chat thing that worked like that, where every keystroke was visible.
    - Could have two documents per user, one public and one private. Hope they never post anything in public.
    - You could have unlimited private and public posts. Each post has a number. Can link any bullet from any post with e.g. #15.99
        - Private links are only visible when you’re signed in? Or you can view just the bullet?
        - Private/public on the bullet level?
        - Can you change between private/public at any time or only on creation?
        - **Probably just one public doc and one private doc.**
- How should usernames work?
    - `undeletable.app/luke/private` and `undeletable.app/luke/public`. Or you could have `undeletable.app/private`. 
    - Can you change it? Do you even choose it?
    - Not a hash of the (or at least not a publicly known hash) phone number. Or salted hash might work. But others should not be able to find your account from your IRL identity.


> First, we will make a working product without public posts.

Probably 300-500 engineers. Launch in early 2023.

**Idea**: Seek funding. Probably any grant-funding open-source institutions would hate this idea though, especially the private ownership of all this data.

**Question**: Is there a way to encrypt their data on our servers without a password.

    - Maybe we can have a separate server own the encryption key?
    - Could private/public keys solve this somehow?
    - Could encrypt data with a hash of the phone numbers and not store the hash or the phone number. One hash function for getting user ID and another for encrypting data. That way we can’t encrypt data on our own servers without using a phone number.
        - Might break sign-in.


Backend functionality:

- Store a (userid, login key, text, timestamp) data
- Retrieve all of a user’s writings, takes (userid, login key)
- Generate and send a login key to phone, takes (userid)


## Security

(TODO: move other stuff into this section)

- Separate database tables for separate users?

Database

- https://en.wikipedia.org/wiki/Entity%E2%80%93attribute%E2%80%93value_model
- https://en.wikipedia.org/wiki/Associative_entity


