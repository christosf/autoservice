import { Meteor } from 'meteor/meteor'
import { FilesCollection } from 'meteor/ostrio:files'

const Files = new FilesCollection({
  debug: false, // Change to `true` for debugging
  collectionName: 'files',
  allowClientCode: false,
  onBeforeUpload(file) {
    if (/png|jpg|jpeg|pdf/i.test(file.extension)) {
      return true
    }
    return 'file-type-not-supported'
  }
})

if (Meteor.isServer) {
  const initFiles = async() => {
    const { createBucket } = await import('./gridfs/bucket')

    const {
      createInterceptDownload,
      createOnAfterRemove,
      createOnAfterUpload
    } = await import('./gridfs/handlers')

    const fileBucket = createBucket({ name: 'file_bucket' })

    // @ts-ignore
    Files.onAfterUpload = createOnAfterUpload(fileBucket)
    // @ts-ignore
    Files.interceptDownload = createInterceptDownload(fileBucket)
    // @ts-ignore
    Files.onAfterRemove = createOnAfterRemove(fileBucket)
  }
  initFiles()

  // @ts-ignore
  Files.denyClient()
}

export default Files
