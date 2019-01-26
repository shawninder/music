function highlight (str, matches) {
  const spans = []
  var len = matches.length

  let first = matches[0]
  if (first !== 0) {
    // First match is not the first character
    // Push non-matching leading characters
    spans.push({
      text: str.slice(0, first),
      match: false
    })
  }
  for (var i = 0; i < len; i += 1) {
    let curr = matches[i]
    let prev = matches[i - 1]
    let delta = curr - prev
    if (delta > 1) {
      // There is at least 1 character between the previous match and current one
      // Push non-matching characters between previous and current matches
      spans.push({
        text: str.substring(prev + 1, curr)
      })
    }

    // Push the current match
    spans.push({
      text: str.substr(curr, 1),
      match: true
    })
  }
  if (matches[len - 1] < str.length - 1) {
    // last match is not on last character
    // Push the remaining non-matching characters
    spans.push({
      text: str.substring(matches[len - 1] + 1)
    })
  }
  return spans
}

export default highlight
