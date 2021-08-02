#!/bin/bash

zip collector-config.zip config.yaml
aws s3 cp collector-config.zip s3://ee-assets-prod-us-east-1/modules/09f302bc1c3b49efa121cb0cc01302d3/v1/collector-config.zip

