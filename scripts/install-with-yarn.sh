set -e

npm install -g yarn
yarn config set registry https://registry.npmjs.org

yarn install
