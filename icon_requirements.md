# App Icon Issues and Requirements

## Current Problems:
1. **Icon Cutting Off**: The "M" letters in both menutha.png and menuva.png are too close to the edges
2. **Adaptive Icon Issues**: Android adaptive icons require a safe zone of 66% in the center
3. **Monochrome Issues**: Current icons aren't suitable for monochrome display

## Android Adaptive Icon Requirements:
- **Total Size**: 1024x1024px (recommended)
- **Safe Zone**: 684x684px (66% of total) - all important content must fit here
- **Foreground**: The main icon content (the "M" letter)
- **Background**: Solid color or simple pattern

## Solutions Applied:
1. ✅ Removed `monochromeImage` from adaptive icon config
2. ✅ Set white background color (#FFFFFF) for better visibility
3. ✅ Updated build script to exclude monochrome image

## Next Steps (Manual):
To properly fix the icon cutting issue, the icon files need to be recreated with:
- Smaller "M" letter positioned in the center safe zone (684x684px area)
- Adequate padding around the letter
- Consider creating separate foreground image with transparent background
- Alternatively, use a solid colored background in the adaptive icon config

## Files Modified:
- `app.json`: Updated android.adaptiveIcon configuration
- `build_multi_app_cleartext.sh`: Removed monochromeImage from jq command