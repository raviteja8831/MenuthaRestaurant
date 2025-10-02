// metro.config.js
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  "@": __dirname, // maps "@/..." to project root
};

module.exports = config;