set -e

npm install
npm run build

cd demo/js && npm install && cd ../..
cd demo/ts && npm install && cd ../..
cd test/command && npm install && cd ../..

npm run test