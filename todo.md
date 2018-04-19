# TODO

No. 1 : Resolve deployment problems!

Songs added my one remote aren't propagated to other remotes!

onNext doesn't propagate either

Move most functions from index to App methods, excluding, dispatch, getState, and probably more-related and a new getMedia

Proper Party server

Proper Collection with database (graph?)

Proper Metadata with database(s)

Proper Party authorization control

Q: How to mitigate DOS risks on web-sockets?

Multiple cloud service provider fallbacks

Separate the DOM from logic in Party, in part to avoid running the DOM render function every time logic says player.t and player.f have changed

Make sure playing is set to false on play end if no next

Solve 'Prop `disabled` did not match. Server: "null" Client: "true"'

Offer compatibility with YouTube Red for background play

Fix jumpTo, not only is it glitchy, it shouldn't even be complicated at all

Handle disconnects

Make sure Start Party can also join...

How to let a remote action (such as `prev`) have side effects other than modifying state (such as `App.playerEl.seekTo(0)`)?
- Overload the dispatch function again in App?

Alternative method of deployment than zeit (npm start on Amazon I suppose)

Make sure we get back to the start when we change tracks (next, jumpTo, prev, play)

`cat "NODE_ENV=production" > .env` ?
