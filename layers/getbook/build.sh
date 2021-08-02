#!/bin/bash

zip GetBook.zip index.js package.json
aws s3 cp GetBook.zip s3://ee-assets-prod-us-east-1/modules/09f302bc1c3b49efa121cb0cc01302d3/v1/functions/GetBook.zip

