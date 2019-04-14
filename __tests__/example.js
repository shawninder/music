import { shallow } from 'enzyme'
import React from 'react'
import renderer from 'react-test-renderer'

import CopyButton from '../components/CopyButton'

describe('With Enzyme', () => {
  it('CopyButton shows "copy" by default', () => {
    const app = shallow(<CopyButton />)

    expect(app.find('.copyButton').text()).toEqual('copy')
  })
})

describe('With Snapshot Testing', () => {
  it('CopyButton shows "copy" by default', () => {
    const component = renderer.create(<CopyButton />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
