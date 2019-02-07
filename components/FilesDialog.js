import React, { Component } from 'react'
import PropTypes from 'prop-types'
import defaultProps from '../helpers/defaultProps'
import propTypes from '../helpers/propTypes'
import List from './List'
import AudioFileInput from './AudioFileInput'

import fileToKey from '../helpers/fileToKey'
import getFileMeta from '../features/fileInput/getFileMeta'

import durations from '../styles/durations'
import colors from '../styles/colors'

class FilesDialog extends Component {
  constructor (props) {
    super(props)
    this.onFiles = this.onFiles.bind(this)
  }
  onFiles (event) {
    const target = event.target
    const files = target.files
    const nbFiles = files.length
    let i = 0
    while (i < nbFiles) {
      const file = files[i]
      const key = fileToKey(file)
      this.props.visibleFiles[key] = file
      const filePath = window.URL.createObjectURL(file)
      this.props.dispatch({
        type: 'FileInput:newFile',
        file: file,
        key,
        filePath
      })
      if (this.props.attending) {
        const id = `sending:${key}`
        const handler = this.sendFile({
          key,
          arrayBuffer: []
        })
        handler.on('progress', (progress) => {
          this.props.notify({
            id,
            progress
          })
        })
        handler.on('success', () => {
          console.log('====B success')
          this.props.notify({
            id,
            body: this.dict.get('files.sending.success'),
            progress: 1,
            buttons: {
              no: {
                label: this.dict.get('files.sending.undo'),
                cb: () => {
                  console.log('====File sent successfully')
                }
              }
            }
          })
        })
        handler.on('error', (err) => {
          console.log('====C error', err)
          this.props.notify({
            id,
            body: this.dict.get('files.sending.error'),
            err,
            buttons: {
              no: null
            }
          })
        })
        console.log('====D sending')
        this.props.notify({
          id,
          body: this.dict.get('files.sending'),
          progress: 0,
          buttons: {
            ok: {
              label: this.dict.get('files.sending.ok'),
              cb: () => {
                this.dispatch({
                  type: 'Notice:remove',
                  id
                })
              }
            },
            no: {
              label: this.dict.get('files.sending.cancel'),
              cb: () => {
                handler.cancel()
                console.log('====E TODO: Tell receiver to clean up partial download')
                // TODO: Tell receiver to clean up partial download?
              }
            }
          }
        })
      }
      let meta
      getFileMeta(file)
        .then((_meta) => {
          meta = _meta
          this.props.dispatch({
            type: 'FileInput:meta',
            meta,
            target,
            key
          })
        })
        .catch((error) => {
          console.error("Can't get metadata", error)
        })
      i += 1
    }
  }
  render () {
    const fileInputProps = {
      ...this.props.getComponentProps(this.props.state),
      actionsAbove: true,
      onFiles: this.onFiles,
      onCancel: (event) => {
        this.props.dispatch({
          type: 'FileInput:cancelNew'
        })
      },
      actions: this.props.actions
    }
    return (
      <div className={`filesDialog ${this.props.showFiles ? 'showing' : 'hidden'}`}>
        <div className='card'>
          <List
            className='files'
            items={this.props.items}
            onItem={this.props.getTrackEvents()}
            defaultComponent={AudioFileInput}
            isDropDisabled
            areDraggable
            componentProps={fileInputProps}
          />
        </div>
        <style jsx>{`
          .filesDialog {
            position: fixed;
            bottom: 72px;
            left: 0;
            width: 100%;
            max-width: 640px;
            border-radius: 4px;
            color: ${colors.textBg};
            background: #333333;
            z-index: 1;
            transition-property: opacity;
            transition-duration: ${durations.instant};
            opacity: 0;
          }

          .filesDialog.showing {
            opacity: 1;
          }
          .filesDialog .card {
            width: 100%;
          }
        `}</style>
      </div>
    )
  }
}

const props = [
  { name: 'dispatch', type: PropTypes.func.isRequired },
  { name: 'visibleFiles', type: PropTypes.object.isRequired },
  { name: 'attending', type: PropTypes.bool.isRequired },
  { name: 'notify', type: PropTypes.func.isRequired },
  { name: 'state', type: PropTypes.object.isRequired },
  { name: 'actions', type: PropTypes.object.isRequired },
  { name: 'items', type: PropTypes.array.isRequired },
  { name: 'getComponentProps', type: PropTypes.func.isRequired },
  { name: 'getTrackEvents', type: PropTypes.func.isRequired }
]

FilesDialog.defaultProps = defaultProps(props)
FilesDialog.propTypes = propTypes(props)

export default FilesDialog
