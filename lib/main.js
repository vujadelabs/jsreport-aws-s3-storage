const awsSDK = require('aws-sdk')

module.exports = function (reporter, definition) {
  if (reporter.options.blobStorage.provider !== 'aws-s3-storage') {
    definition.options.enabled = false
    return
  }

  console.log(definition.options)
  const options = Object.assign({}, definition.options)
  // avoid exposing connection string through /api/extensions
  definition.options = {}

  if (!options.accessKeyId) {
    throw new Error('accessKeyId must be provided to jsreport-aws-s3-storage')
  }

  if (!options.secretAccessKey) {
    throw new Error('secretAccessKey must be provided to jsreport-aws-s3-storage')
  }

  if (!options.bucket) {
    throw new Error('bucket must be provided to jsreport-aws-s3-storage')
  }

  const s3 = new awsSDK.S3({
    accessKeyId: options.accessKeyId,
    secretAccessKey: options.secretAccessKey,
    ...options.s3Options
  })
  reporter.blobStorage.registerProvider({
    init: () => {
      console.log("\n\n[jsreport-s3-uploader] BlobStorage initialized.");
    },
    read: (blobName) => {
      const params = {
        Bucket: options.bucket,
        Key: blobName
      }

      return new Promise((resolve, reject) => {
        resolve(s3.getObject(params)
          .createReadStream()
          .on('error', (err) => reject(err)))
      })
    },
    write: (defaultBlobName, buffer, request, response) => {

      let fileName = defaultBlobName
        , folderName = ""
        , fileNameSent = false;

      /* x------------------------------------x File Name Support x--------------------------------------x */

        let fileExtension = request.template.recipe;

        if (fileExtension === "chrome-pdf" || fileExtension === "phantom-pdf") {
          fileExtension = "pdf"
        }

        if (typeof request.data.fileName === "string" && request.data.fileName.trim() !== "") {
          fileNameSent = true;
          fileName = request.data.fileName.replace(/ /g, "_");
        }

      /* x--------------------------------------------x END x--------------------------------------------x */

      /* x------------------------------------x Folder Name Support x------------------------------------x */

        if (typeof request.data.bucketFolder === "string" && request.data.bucketFolder.trim() !== "") {
          folderName = request.data.bucketFolder.replace(/ /g, "_");
        }

        if (options.groupByTemplate) {
          if (typeof folderName === "string" && folderName.trim() !== "") {
            folderName += "/";
          }
            
          folderName += `${request.template.name}`;
          folderName = folderName.replace(/ /g, "_").toLowerCase();
        }

      /* x--------------------------------------------x END x--------------------------------------------x */
        
      let reportKey = "";

      if (typeof folderName === "string" && folderName.trim() !== "") {
        reportKey += `${folderName}/`;
      }

      if (fileNameSent) {
        reportKey += `${fileName}.${fileExtension}`;
      } else {
        reportKey += fileName;
      }

      const params = {
        Bucket: options.bucket,
        Key: reportKey,
        Body: buffer
      };

      if (options.publicRead) {
        params["ACL"] = "public-read";
      }

      response.meta.headers['s3-Link'] = `https://${options.bucket}/${reportKey}`;

      return new Promise((resolve, reject) => {
        s3.upload(params, (err, data) => {
          if (err) {
            return reject(err)
          }
          console.log("\n\n[jsreport-s3-uploader] S3 Link of uploaded file --> ", response.meta.headers['s3-Link'], "\n\n");
          resolve(defaultBlobName)
        })
      })
    },
    remove: (blobName) => {
      const params = {
        Bucket: options.bucket,
        Key: blobName
      }

      return new Promise((resolve, reject) => {
        s3.deleteObject(params, (err) => {
          if (err) {
            return reject(err)
          }
          resolve()
        })
      })
    }
  })
}
