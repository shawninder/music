import runLighthouse from '../helpers/runLighthouse'

const opts = {
  chromeFlags: [
    '--headless'
  ]
}

describe('Lighthouse audits', () => {
  test('Index Page is auditable', () => {
    return runLighthouse('http://localhost:3000', opts)
      .then(results => {
        expect(results.report)
      })
  }, 30000)
})
