set -e

npm install
npm run build

cd test/command && npm install && cd ../..

npm run lint
npm run test