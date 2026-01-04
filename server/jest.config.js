module.exports = {
  transformIgnorePatterns: ['/node_modules/(?!uuid).+\\.js$'],
  moduleNameMapper: {
    uuid: require.resolve('uuid'),
  },
};
