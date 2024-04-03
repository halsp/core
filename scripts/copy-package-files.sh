ts-node scripts/copy-package-file.ts base.gitignore .gitignore
ts-node scripts/copy-package-file.ts jest.config.js
ts-node scripts/copy-package-file.ts jest.setup.js
ts-node scripts/copy-package-file.ts tsconfig.base.json
ts-node scripts/copy-package-file.ts tsconfig.code.json tsconfig.json
ts-node scripts/copy-package-file.ts tsconfig.cjs.json
ts-node scripts/copy-package-file.ts tsconfig.mjs.json
ts-node scripts/copy-package-file.ts ../LICENSE LICENSE
ts-node scripts/copy-package-file.ts ../.eslintignore .eslintignore
ts-node scripts/copy-package-file.ts ../.eslintrc.cjs .eslintrc.cjs

ts-node scripts/create-readme.ts

cp README.md packages/core/README.md