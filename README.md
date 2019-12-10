

# jsreport-aws-s3-storage
[![NPM Version](http://img.shields.io/npm/v/jsreport-aws-s3-storage.svg?style=flat-square)](https://npmjs.com/package/jsreport-aws-s3-storage)
[![Build Status](https://travis-ci.org/jsreport/jsreport-aws-s3-storage.png?branch=master)](https://travis-ci.org/jsreport/jsreport-aws-s3-storage)

> jsreport extension adding support for storing blobs in aws s3

Some of the jsreport extensions requires a blob storage for storing binary objects. This implementation stores these objects like output reports inside cost effective aws s3.

See the blob sorages general documentation
https://jsreport.net/learn/blob-storages

See how to persist jsreport output reports
https://jsreport.net/learn/reports


## Installation

```bash
git clone https://github.com/vujadelabs/jsreport-s3-uploader.git
cd jsreport-s3-uploader/
npm i
```

## Configuration

Required options are:
- `accessKeyId`
- `secretAccessKey`
- `bucket`

Optionally you can set
- `s3Options`: azure blob storage container, this defaults to jsreport
- `groupByTemplate`: Enabling this adds up name of the template before report in s3 key.
- `publicRead`: Uses aws [s3's ACL option](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#putObject-property) file will be public-read supported.

Support for following keys in `request.data` (we are replacing `spaces` with `_` in below options):
- `bucketFolder`: Places bucket folder provided by user in s3 key. Allows to nest files in a folder of a bucket.
- `fileName`: Allows user to provide a name for their file. This replaces name being generated by our code.

```js
{
	"blobStorage": {  
		"provider": "aws-s3-storage"
	},
	"extensions": {
		"aws-s3-storage": {
			"accessKeyId": "...",
			"secretAccessKey": "...",
			"bucket": "...",
			"s3Options": {...},
			"groupByTemplate": boolean,
			"publicRead": boolean
		}
	}
}
```
## jsreport-core
```js
var jsreport = require('jsreport-core')({ blobStorage: { provider: 'aws-s3-storage' } })
jsreport.use(require('jsreport-aws-s3-storage')({...}))
```

## Response
Returns key `s3-Link` in response headers, for user api to store path if needed.

## Changes (10-12-2019) -
**Note:** This is a fork of repo [jsreport-aws-s3-storage](https://github.com/jsreport/jsreport-aws-s3-storage) with support of following things -

- `groupByTemplate`
- `publicRead`
- `request.data.bucketFolder`
- `request.data.fileName`
- Return `s3-Link` in response headers.