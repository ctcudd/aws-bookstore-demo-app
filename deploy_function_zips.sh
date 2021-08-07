#!/bin/bash
BUCKET_PATH="ee-assets-prod-us-east-1/modules/09f302bc1c3b49efa121cb0cc01302d3/v1"


function createFunctionZip(){
  local path=${1}
  local ext=${path: -3}
  local target="index${ext}"
  local zipname="$(basename "${path}" "${ext}").zip"
  cp "${path}" "temp/${target}"
  if [[ "${ext}" == ".js" ]]; then
    target="${target} package.json"
    echo "{}">>temp/package.json
  fi
  pushd temp
  zip "${zipname}" ${target}
  mv  "${zipname}" ..
  rm *
  popd
}

rm -rf build/*
mkdir -p build/temp



pushd build
for f in ../functions/*/{*.js,*.py}; do
  createFunctionZip "${f}";
done;
rm -rf temp

for f in *.zip; do
  aws s3 cp "${f}" "s3://${BUCKET_PATH}/functions/${f}"
done
popd
