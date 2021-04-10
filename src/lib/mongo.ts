/* eslint functional/no-expression-statement: "off" */
/* eslint functional/immutable-data: "off" */
import { Db, MongoClient } from 'mongodb'

export const mongo = (connectionString: string) => new Promise<Db>((resolve, reject) => {
  MongoClient.connect(connectionString, (err, database) => {
    if (err) {
      console.log(connectionString)
      reject(err)
      return
    }

    resolve(database.db(process.env.MONGO_DATABASE))
  })
})
