module.exports = {
    preset: '@shelf/jest-mongodb',
    testRegex: 'src/.*\\.test\\.ts$',
    transform: {
        '^.+\\.(t|j)s?$': [
            '@swc-node/jest', {
                dynamicImport: true,
            }]
    },
    collectCoverage: true,
    coverageProvider: 'v8',
    extensionsToTreatAsEsm: ['.ts'],
    watchPathIgnorePatterns: ['globalConfig'],
    resolver: 'jest-node-exports-resolver',
    // jest still use facebooks "haste" module resolver in case of cold run or --no-cache option
    modulePathIgnorePatterns: ['<rootDir>/data/']
};
