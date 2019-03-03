import React from 'react'
import CalendarHeatmap from 'react-calendar-heatmap'
import moment from 'moment'

import getTime from '../helpers/timestampFromObjectId'

import colors from '../styles/colors'

export default (props) => {
  const values = props.items.map(({ _id }) => {
    const date = getTime(_id)
    return { date, count: 1 }
  })

  const startDate = values.length > 0 ? moment(values[values.length - 1].date) : moment().add(-5, 'weeks')
  const endDate = values.length > 0 ? moment(values[0].date) : moment()

  const span = moment.duration(endDate.diff(startDate))

  const nbWeeks = Math.ceil(span.asWeeks())

  return (
    <section className='heatmap'>
      <style jsx global>{`
        .react-calendar-heatmap {
          text {
            font-size: 10px;
            fill: ${colors.text};
          }

          .react-calendar-heatmap-small-text {
            font-size: 5px;
          }

          rect:hover {
            stroke: #555;
            stroke-width: 1px;
          }

          /*
           * Default color scale
           */

          .color-empty {
            fill: #eeeeee;
          }

          /*
           * Github color scale
           */

          .color-github-0 {
            fill: #eeeeee;
          }
          .color-github-1 {
            fill: #d6e685;
          }
          .color-github-2 {
            fill: #8cc665;
          }
          .color-github-3 {
            fill: #44a340;
          }
          .color-github-4 {
            fill: #1e6823;
          }
        }
      `}</style>
      <p>Showing {nbWeeks} weeks ending on {endDate.format('MMM Do YYYY')} ({endDate.calendar()})</p>
      <div style={{
        width: `${nbWeeks * 20}px`
      }}>
        <CalendarHeatmap
          startDate={startDate}
          endDate={endDate}
          values={values}
          classForValue={(value) => {
            if (!value) {
              return 'color-empty'
            }
            return `color-github-${value.count}`
          }}
          titleForValue={(value) => {
            if (value) {
              return `${value.count} ${moment(value.date).calendar()}`
            }
            return '0'
          }}
          showMonthLabels={false}
        />
      </div>
    </section>
  )
}
