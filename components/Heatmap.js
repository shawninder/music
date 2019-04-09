import React from 'react'
import CalendarHeatmap from 'react-calendar-heatmap'
import moment from 'moment'

import pad from '../helpers/padNb'
import colors from '../styles/colors'

const getTime = ({ year, month, day }) => {
  const date = `${year}-${pad(month)}-${pad(day)}`
  return date
}

function Heatmap (props) {
  if (props.items.length === 0) {
    return null
  }
  let earliest = moment()
  let latest = moment(0)
  const values = props.items.map(({ _id, count }) => {
    const date = getTime(_id)
    const m = moment(date)
    if (m.isBefore(earliest)) {
      earliest = m
    }
    if (m.isAfter(latest)) {
      latest = m
    }
    return { date, count }
  })

  const span = moment.duration(latest.diff(earliest))
  const nbWeeks = Math.ceil(Math.abs(span.asWeeks()))

  return (
    <section className='heatmap'>
      <style jsx global>{`
        .react-calendar-heatmap {
          width: 640px;
          max-width: 100%;
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

          .color-filled {
            fill: #8cc665;
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

          /*
           * Gitlab color scale
           */
          .color-gitlab-0 {
            fill: #ededed;
          }
          .color-gitlab-1 {
            fill: #acd5f2;
          }
          .color-gitlab-2 {
            fill: #7fa8d1;
          }
          .color-gitlab-3 {
            fill: #49729b;
          }
          .color-gitlab-4 {
            fill: #254e77;
          }
        }
      `}</style>
      <style jsx>{`
        .legend {
          div {
            display: inline-block;
            width: 20px;
            height: 20px;
            &.color-github-0 {
              background: #eeeeee;
            }
            &.color-github-1 {
              background: #d6e685;
            }
            &.color-github-2 {
              background: #8cc665;
            }
            &.color-github-3 {
              background: #44a340;
            }
            &.color-github-4 {
              background: #1e6823;
            }
            &.color-gitlab-0 {
              background: #ededed;
            }
            &.color-gitlab-1 {
              background: #acd5f2;
            }
            &.color-gitlab-2 {
              background: #7fa8d1;
            }
            &.color-gitlab-3 {
              background: #49729b;
            }
            &.color-gitlab-4 {
              background: #254e77;
            }
          }
        }
      `}</style>
      <p>Showing {nbWeeks} weeks ending on {latest.format('MMM Do YYYY')} ({latest.calendar()})</p>
      <CalendarHeatmap
        startDate={earliest}
        endDate={latest}
        values={values}
        classForValue={(value) => {
          if (!value) {
            return 'color-empty'
          }
          const count = value.count
          if (count === 1) {
            return `color-gitlab-0`
          }
          if (count < 3) {
            return `color-gitlab-1`
          }
          if (count < 9) {
            return `color-gitlab-2`
          }
          if (count < 27) {
            return `color-gitlab-3`
          }
          if (count < 81) {
            return `color-gitlab-4`
          }
          if (count < 243) {
            return `color-github-1`
          }
          if (count < 729) {
            return `color-github-2`
          }
          if (count < 2187) {
            return `color-github-3`
          }
          if (count < 6561) {
            return `color-github-4`
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
      <div className='legend'>
        <div className='color-gitlab-0' />
        <div className='color-gitlab-1' />
        <div className='color-gitlab-2' />
        <div className='color-gitlab-3' />
        <div className='color-gitlab-4' />
        <div className='color-github-1' />
        <div className='color-github-2' />
        <div className='color-github-3' />
        <div className='color-github-4' />
      </div>
    </section>
  )
}

export default Heatmap
