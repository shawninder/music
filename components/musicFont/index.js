import React from 'react'

import C from './C.js'
import r from './r.js'
import o from './o.js'
import w from './w.js'
import d from './d.js'
import s from './s.js'
import P from './P.js'
import l from './l.js'
import a from './a.js'
import y from './y.js'

const replaced = {
  C,
  r,
  o,
  w,
  d,
  s,
  P,
  l,
  a,
  y
}

function MusicFont (props) {
  const letters = props.children.split('').map((char) => {
    return replaced[char] || char
  })
  return (
    <React.Fragment>
      {letters}
    </React.Fragment>
  )
}
export default MusicFont
