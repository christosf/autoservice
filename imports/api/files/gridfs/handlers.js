import fs from 'fs'
import { Meteor } from 'meteor/meteor'
import { createObjectId } from './bucket'

const createOnAfterUpload = (bucket) => (
  function onAfterUpload (file) {
    const self = this

    // here you could manipulate your file
    // and create a new version, for example a scaled 'thumbnail'
    // ...

    // then we read all versions we have got so far
    Object.keys(file.versions).forEach((versionName) => {
      const metadata = { ...file.meta, versionName, fileId: file._id }
      fs.createReadStream(file.versions[versionName].path)

      // this is where we upload the binary to the bucket using bucket.openUploadStream
      // see http://mongodb.github.io/node-mongodb-native/3.6/api/GridFSBucket.html#openUploadStream
        .pipe(bucket.openUploadStream(
          file.name,
          {
            contentType: file.type || 'binary/octet-stream',
            metadata
          }
        ))

        // and we unlink the file from the fs on any error
        // that occurred during the upload to prevent zombie files
        .on('error', (err) => {
          console.error(err)
          self.unlink(this.collection.findOne(file._id), versionName) // Unlink files from FS
        })

        // once we are finished, we attach the gridFS Object id on the
        // FilesCollection document's meta section and finally unlink the
        // upload file from the filesystem
        .on('finish', Meteor.bindEnvironment((ver) => {
          const property = `versions.${versionName}.meta.gridFsFileId`

          self.collection.update(file._id, {
            $set: {
              [property]: ver._id.toHexString()
            }
          })

          self.unlink(this.collection.findOne(file._id), versionName) // Unlink files from FS
        }))
    })
  }
)

const createInterceptDownload = (bucket) => (
  function interceptDownload (http, file, versionName) {
    const { gridFsFileId } = file.versions[versionName].meta || {}
    if (gridFsFileId) {
      // opens the download stream using a given gfs id
      // see: http://mongodb.github.io/node-mongodb-native/3.6/api/GridFSBucket.html#openDownloadStream
      const gfsId = createObjectId({ gridFsFileId })
      const readStream = bucket.openDownloadStream(gfsId)

      readStream.on('data', (data) => {
        http.response.write(data)
      })

      readStream.on('end', () => {
        http.response.end('end')
      })

      readStream.on('error', () => {
        // not found probably
        // eslint-disable-next-line no-param-reassign
        http.response.statusCode = 404
        http.response.end('not found')
      })

      http.response.setHeader('Cache-Control', this.cacheControl)

      const encodedFileName = encodeURIComponent(file.name)
      const dispositionName = `filename="${encodedFileName}"; filename=*UTF-8"${encodedFileName}"; `
      const dispositionEncoding = 'charset=utf-8'

      http.response.setHeader('Content-Disposition', dispositionName + dispositionEncoding)
    }
    return Boolean(gridFsFileId) // Serve file from either GridFS or FS if it wasn't uploaded yet
  }
)

const createOnAfterRemove = (bucket) => (
  function onAfterRemove (files) {
    files.forEach((file) => {
      Object.keys(file.versions).forEach((versionName) => {
        const { gridFsFileId } = file.versions[versionName].meta || {}
        if (gridFsFileId) {
          const gfsId = createObjectId({ gridFsFileId })
          bucket.delete(gfsId, (err) => {
            if (err) {
              console.error(err)
            }
          })
        }
      })
    })
  }
)

export {
  createOnAfterUpload,
  createInterceptDownload,
  createOnAfterRemove
}
