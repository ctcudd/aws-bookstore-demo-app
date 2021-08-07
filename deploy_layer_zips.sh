#!/bin/bash
BUCKET_PATH="ee-assets-prod-us-east-1/modules/09f302bc1c3b49efa121cb0cc01302d3/v1"


function createLayerZip(){
  local d=${1}

  pushd temp
  cp -r  ../../layers/${d}/* .
  if [[ $dir == node* ]]; then
    pushd nodejs
    npm install
    popd
  elif [[ $dir == python* ]]; then
    pushd python
    pip install -r requirements.txt --target .
    popd
  fi
  zip -r ${d}.zip .
  mv ${d}.zip ..
  rm -rf *
  popd
}

rm -rf build/*
mkdir -p build/temp
pushd build

for d in node-redis node-aws-xray-sdk python-aws-xray-sdk python-gremlinpython collector-config; do
  createLayerZip ${d}
done

exit

for f in *.zip; do
  aws s3 cp "${f}" "s3://${BUCKET_PATH}/layers/${f}"
done
popd
