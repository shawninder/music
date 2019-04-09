import NextHead from 'next/head'
import PropTypes from 'prop-types'
import defaultProps from '../helpers/defaultProps'
import propTypes from '../helpers/propTypes'

function Head (props) {
  return (
    <NextHead>
      <title>{props.title}</title>
      {props.children}
    </NextHead>
  )
}

const props = [
  { name: 'title', type: PropTypes.string.isRequired }
]

Head.defaultProps = defaultProps(props)
Head.propTypes = propTypes(props)

export default Head
