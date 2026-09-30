// babel-preset-expo already resolves tsconfig "paths" (@/*) and adds the
// Reanimated/Worklets plugin when installed, so only NativeWind is added here.
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }], 'nativewind/babel'],
  };
};
