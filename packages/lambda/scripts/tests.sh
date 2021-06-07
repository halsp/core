set -e

npm install
npm run build

cd demo && npm install && cd ..

npm run test