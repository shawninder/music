import highlight from './highlight'

function highlighted (key, matches) {
  return highlight(key, matches).map((span, idx) => {
    return (
      <span key={`${key}:${idx}`} className={span.match ? 'fuzz--match' : 'fuzz--no-match'}>
        {span.text}
        <style jsx>{`
          .fuzz--match {
            font-weight: bold;
          }
        `}</style>
      </span>

    )
  })
}

export default highlighted
