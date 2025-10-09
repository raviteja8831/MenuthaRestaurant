#!/usr/bin/env node
/**
 * Script to patch build.gradle with release signing config after expo prebuild
 * This ensures the release APK is signed with the production keystore
 */

const fs = require('fs');
const path = require('path');

const buildGradlePath = path.join(__dirname, '..', 'android', 'app', 'build.gradle');

console.log('🔧 Patching build.gradle with release signing config...');

try {
  let content = fs.readFileSync(buildGradlePath, 'utf8');

  // Check if release signing config already exists
  if (content.includes('menutha-release.keystore')) {
    console.log('✅ Release signing config already present');
    process.exit(0);
  }

  // Pattern to find signingConfigs block
  const signingConfigPattern = /(signingConfigs\s*\{[^}]*debug\s*\{[^}]*\})\s*\}/;

  // Release signing config to add
  const releaseSigningConfig = `$1
        release {
            storeFile file('menutha-release.keystore')
            storePassword 'menutha2025'
            keyAlias 'menutha-key-alias'
            keyPassword 'menutha2025'
        }
    }`;

  // Add release signing config
  content = content.replace(signingConfigPattern, releaseSigningConfig);

  // Update release buildType to use release signing config
  content = content.replace(
    /(release\s*\{[^}]*signingConfig\s+signingConfigs\.)debug/,
    '$1release'
  );

  fs.writeFileSync(buildGradlePath, content, 'utf8');
  console.log('✅ Successfully patched build.gradle with release signing config');
  process.exit(0);
} catch (error) {
  console.error('❌ Error patching build.gradle:', error.message);
  process.exit(1);
}
