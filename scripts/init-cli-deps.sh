set -e

cd ./node_modules/@halsp/cli
if [ ! -d "core-deps-temp" ]; then
  mkdir "core-deps-temp"
fi
cd "core-deps-temp"
npm init -y
npm install @halsp/core
npm install @halsp/inject

cd ..

if [ ! -d "node_modules/@halsp" ];then
  mkdir "node_modules/@halsp"
fi
cp -r -f core-deps-temp/node_modules/@halsp/core node_modules/@halsp/core
cp -r -f core-deps-temp/node_modules/@halsp/inject node_modules/@halsp/inject
