import React, { Component } from 'react'
import Clipboard from 'clipboard'

import colors from '../styles/colors'

const extractCubicBezier = /cubic-bezier\((.?[0-9]{1,3}), ?(.?[0-9]{1,3}), ?(.?[0-9]{1,3}), ?(.?[0-9]{1,3})\)/

class TimingFunction extends Component {
  componentDidMount () {
    this.clipboard = new Clipboard(this.figure, {
      target: () => {
        return this.caption
      }
    })
  }
  componentWillUnmount () {
    this.clipboard.destroy()
  }
  render () {
    return (
      <figure
        style={{ cursor: 'pointer' }}
        ref={(el) => {
          this.figure = el
        }}
      >
        <canvas
          width={100}
          height={100}
          ref={(el) => {
            if (el) {
              const ctx = el.getContext('2d')
              const matches = extractCubicBezier.exec(this.props.fn)

              // Define the points as {x, y}
              let start = { x: 5, y: 95 }
              let cp1 = { x: 90 * matches[1], y: 100 - (90 * matches[2]) }
              let cp2 = { x: 90 * matches[3], y: 100 - (90 * matches[4]) }
              let end = { x: 95, y: 5 }

              // Cubic Bézier curve
              ctx.beginPath()
              ctx.moveTo(start.x, start.y)
              ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, end.x, end.y)
              ctx.stroke()

              // Start and end points
              ctx.fillStyle = colors.text
              ctx.beginPath()
              ctx.arc(start.x, start.y, 5, 0, 2 * Math.PI) // Start point
              ctx.arc(end.x, end.y, 5, 0, 2 * Math.PI) // End point
              ctx.fill()

              // First control point
              ctx.fillStyle = colors.hosting
              ctx.strokeStyle = colors.hostingBg
              ctx.beginPath()
              ctx.arc(cp1.x, cp1.y, 5, 0, 2 * Math.PI) // Control point one
              ctx.fill()
              ctx.beginPath()
              ctx.moveTo(start.x, start.y)
              ctx.lineTo(cp1.x, cp1.y)
              ctx.stroke()

              // Second control point
              ctx.fillStyle = colors.attending
              ctx.strokeStyle = colors.attendingBg
              ctx.beginPath()
              ctx.arc(cp2.x, cp2.y, 5, 0, 2 * Math.PI) // Control point two
              ctx.fill()
              ctx.beginPath()
              ctx.moveTo(end.x, end.y)
              ctx.lineTo(cp2.x, cp2.y)
              ctx.stroke()
            }
          }}
        />
        <figcaption ref={(el) => {
          this.caption = el
        }}>{this.props.name}</figcaption>
      </figure>
    )
  }
}
export default TimingFunction
