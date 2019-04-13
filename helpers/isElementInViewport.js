function isElementInViewport (el) {
  var rect = el.getBoundingClientRect()

  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (global.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (global.innerWidth || document.documentElement.clientWidth)
  )
}

export default isElementInViewport
