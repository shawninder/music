# TODO

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
