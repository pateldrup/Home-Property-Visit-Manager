import * as Location from 'expo-location';
import { Linking, Platform } from 'react-native';

export const getCurrentLocation = async () => {
  try {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Permission to access location was denied');
    }

    let location = await Location.getCurrentPositionAsync({});
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  } catch (error) {
    console.error('Error getting location', error);
    throw error;
  }
};

export const getReverseGeocodedLocation = async () => {
  try {
    const coords = await getCurrentLocation();
    const geocode = await Location.reverseGeocodeAsync({
      latitude: coords.latitude,
      longitude: coords.longitude
    });

    if (geocode && geocode.length > 0) {
      const place = geocode[0];
      const address = [place.streetNumber, place.street].filter(Boolean).join(' ') || place.name || '';
      return {
        address: address,
        city: place.city || place.subregion || place.region || '',
        pincode: place.postalCode || '',
        ...coords
      };
    }
    return null;
  } catch (error) {
    console.error('Error reverse geocoding', error);
    throw error;
  }
};

export const openInMaps = (latitude, longitude, label = 'Property Location') => {
  const scheme = Platform.select({ ios: 'maps://0,0?q=', android: 'geo:0,0?q=' });
  const latLng = `${latitude},${longitude}`;
  const url = Platform.select({
    ios: `${scheme}${label}@${latLng}`,
    android: `${scheme}${latLng}(${label})`
  });

  Linking.openURL(url);
};
