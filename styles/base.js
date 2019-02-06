export default `
html, body, #__next, .App {
  height: 100%;
  width: 100%;
}

#__next-error {
  position: fixed;
  z-index: 1000;
}

body {
  /* Approximate system fonts
    -apple-system, BlinkMacSystemFont, // Safari Mac/iOS, Chrome
    "Segoe UI", Roboto, Oxygen, // Windows, Android, KDE
    Ubuntu, Cantarell, "Fira Sans", // Ubuntu, Gnome, Firefox OS
    "Droid Sans", "Helvetica Neue", sans-serif; // Old Android
  */
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
}

svg {
  fill: currentColor; /* For SVGs, see https://css-tricks.com/cascading-svg-fill-color/ */
}
`
