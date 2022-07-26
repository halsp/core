ts-node scripts/copy-package-file.ts base.gitignore .gitignore
ts-node scripts/copy-package-file.ts jest.config.js
ts-node scripts/copy-package-file.ts jest.setup.js
ts-node scripts/copy-package-file.ts ../LICENSE LICENSE

cp README.md packages/core/README.md