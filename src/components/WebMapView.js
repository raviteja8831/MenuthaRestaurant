import React from 'react';
import { LoadScript, GoogleMap, Marker as GMarker } from '@react-google-maps/api';
import { View } from 'react-native';

// Simple web map wrapper that mimics the MapView/Marker API surface used in
// the app. This keeps web bundling away from native-only react-native-maps
// internals which import native code.

const containerStyle = {
  width: '100%',
  height: '100%'
};

export function MapView({ style, initialRegion, children }) {
  // Use a reasonable default API key; app code already uses a key for
  // geocoding — for brevity we rely on that same key here. Replace if
  // you prefer an env/config value.
  const apiKey = typeof __DEV__ !== 'undefined' && __DEV__ ? null : null;
  // Try to obtain API key from window.__EAS ? fallback to a hardcoded one if needed
  const webKey = (global?.__expoConfig?.extra && global.__expoConfig.extra.GOOGLE_MAPS_API_KEY) ||
    (global?.GOOGLE_MAPS_API_KEY) ||
    // fallback to a permissive key used in the project for geocoding (may be restricted)
    'AIzaSyB5P-PTRn7E0xkRlkiHWkjadh3nbT7yu7U';

  const center = initialRegion
    ? { lat: initialRegion.latitude, lng: initialRegion.longitude }
    : { lat: 17.4375, lng: 78.4456 };

  // Convert children (Marker placeholders) into data for Google markers
  const markers = React.Children.toArray(children)
    .map((c) => (c && c.props && c.props.coordinate ? c.props : null))
    .filter(Boolean);

  // basic zoom mapping: smaller latitudeDelta -> larger zoom
  const zoom = initialRegion && initialRegion.latitudeDelta
    ? Math.max(2, Math.round(12 - Math.log(initialRegion.latitudeDelta + 0.0001)))
    : 13;

  return (
    <View style={style}>
      <LoadScript googleMapsApiKey={webKey}>
        <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={zoom}>
          {markers.map((m, i) => (
            <GMarker
              key={i}
              position={{ lat: m.coordinate.latitude, lng: m.coordinate.longitude }}
              title={m.title}
              onClick={() => m.onPress && m.onPress()}
            />
          ))}
        </GoogleMap>
      </LoadScript>
    </View>
  );
}

// Marker is just a placeholder component so children are easier to write.
export function Marker() {
  return null;
}

export default { MapView, Marker };
