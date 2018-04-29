# TODO

Let's start syncing shit on ping and pong? :(

Make mock YouTube-search for offline development and manual testing (and eventually automated tested)

Make sure Start Party can also join...

Separate the DOM from logic in Party, in part to avoid running the DOM render function every time logic says player.t and player.f have changed

Proper Collection with database (graph?)

Proper Metadata with database(s)

Proper Party authorization control

Q: How to mitigate DOS risks on web-sockets?

Multiple cloud service provider fallbacks

Solve 'Prop `disabled` did not match. Server: "null" Client: "true"'

Offer compatibility with YouTube Red for background play

Alternative method of deployment than zeit (npm start on Amazon I suppose) (Heroku looks like it would work too, though apparently it gets real expensive real fast)

`cat "NODE_ENV=production" > .env` ?

Autofocus doesn't bring up keyboard, at least not on Samsunb Galaxy A5 (Android) on Chrome

Selecting a result doesn't automatically play it, though the UI button seems to think it worked. Pausing and resuming solves. (A5 chrome)

Results should appear above controls [x?] and they should be visually merged with the bar to make the clear button more obvious [ ]. Also should be visually "over" the app, perhaps by being thinner, finishing with bottom margin, and using box shadow?

Clear button should not open keyboard, perhaps even at the cost of not focusing the bar. Except when results aren't showing, then it should clear the content, focus the bar, and bring up the keyboard.

Last action used flickers between blue and black on app AS GUEST

Can't rely on "rotate to fullscreen player", it breaks on track change, forcing you to re-rotate...

Next button stays "active" for A WHILE!

Guests should be notified when host is unreachable, perhaps a timeout clock could also be shown to estimate how long the party will live? Eventually, there should also be a feature to claim hosthood somehow, or at least transfer it...

Only put results in list if query hasn't changed since results came in... In fact, it should be more than that, making sure there was no other requests in between.

On party end, what happens to guests?
