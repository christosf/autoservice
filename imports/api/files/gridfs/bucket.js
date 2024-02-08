// @ts-ignore
import { MongoInternals } from 'meteor/mongo'

const createBucket = ({ name }) => {
  const options = name ? { name } : undefined

  return new MongoInternals.NpmModules.mongodb.module.GridFSBucket(
    MongoInternals.defaultRemoteCollectionDriver().mongo.db,
    options
  )
}

const createObjectId = ({ gridFsFileId }) => (
  new MongoInternals.NpmModules.mongodb.module.ObjectID(gridFsFileId)
)

export {
  createBucket,
  createObjectId
}
