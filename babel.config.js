module.exports = {
  presets: [
    'module:metro-react-native-babel-preset',
    '@babel/preset-react',  // 👈 add this
  ],
  plugins: [
    'react-native-reanimated/plugin', // keep this last if you use reanimated
  ],
};
