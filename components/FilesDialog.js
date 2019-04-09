import React, { useContext } from 'react'
import PropTypes from 'prop-types'
import defaultProps from '../helpers/defaultProps'
import propTypes from '../helpers/propTypes'
import List from './List'
import AudioFileInput from './AudioFileInput'

import fileToKey from '../helpers/fileToKey'
import getFileMeta from '../features/fileInput/getFileMeta'

import DictContext from '../features/dict/context'
import NoticeContext from '../features/notice/context'
import FileInputContext from '../features/fileInput/context'

import durations from '../styles/durations'
import colors from '../styles/colors'

function FilesDialog (props) {
  const { dict } = useContext(DictContext)
  const { notify } = useContext(NoticeContext)
  const { dispatch } = useContext(FileInputContext)
  function onFiles (event) {
    const target = event.target
    const files = target.files
    const nbFiles = files.length
    let i = 0
    while (i < nbFiles) {
      const file = files[i]
      const key = fileToKey(file)
      props.visibleFiles[key] = file
      const filePath = window.URL.createObjectURL(file)
      dispatch({
        type: 'FileInput:newFile',
        file: file,
        key,
        filePath
      })
      if (props.attending) {
        const id = `sending:${key}`
        const handler = props.sendFile({
          key,
          arrayBuffer: []
        })
        handler.on('progress', (progress) => {
          notify({
            id,
            progress
          })
        })
        handler.on('success', () => {
          console.log('====B success')
          notify({
            id,
            body: dict.get('files.sending.success'),
            progress: 1,
            buttons: {
              no: {
                label: dict.get('files.sending.undo'),
                fn: () => {
                  console.log('====File sent successfully')
                }
              }
            }
          })
        })
        handler.on('error', (err) => {
          console.log('====C error', err)
          notify({
            id,
            body: dict.get('files.sending.error'),
            err,
            buttons: {
              no: null
            }
          })
        })
        console.log('====D sending')
        notify({
          id,
          body: dict.get('files.sending'),
          progress: 0,
          buttons: {
            ok: {
              label: dict.get('files.sending.ok'),
              fn: ({ remove }) => {
                remove()
              }
            },
            no: {
              label: dict.get('files.sending.cancel'),
              fn: () => {
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
          dispatch({
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
  const fileInputProps = {
    ...props.getComponentProps(props.state),
    actionsAbove: true,
    onFiles: onFiles,
    onCancel: (event) => {
      dispatch({
        type: 'FileInput:cancelNew'
      })
    },
    actions: props.actions
  }
  return (
    <div className={`filesDialog ${props.showFiles ? 'showing' : 'hidden'}`}>
      <div className='card'>
        <List
          className='files'
          items={props.items}
          onItem={props.getTrackEvents()}
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

const props = [
  { name: 'visibleFiles', type: PropTypes.object.isRequired },
  { name: 'attending', type: PropTypes.bool.isRequired },
  { name: 'state', type: PropTypes.object.isRequired },
  { name: 'actions', type: PropTypes.object.isRequired },
  { name: 'items', type: PropTypes.array.isRequired },
  { name: 'getComponentProps', type: PropTypes.func.isRequired },
  { name: 'getTrackEvents', type: PropTypes.func.isRequired },
  { name: 'sendFile', type: PropTypes.func.isRequired }
]

FilesDialog.defaultProps = defaultProps(props)
FilesDialog.propTypes = propTypes(props)

export default FilesDialog
