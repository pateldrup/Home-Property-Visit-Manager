import AsyncStorage from '@react-native-async-storage/async-storage';

const PROPERTIES_KEY = '@properties';
const VISITS_KEY = '@visits';
const SETTINGS_KEY = '@settings';
const PROFILE_PHOTO_KEY = '@profile_photo';

// Mock initial data
const MOCK_PROPERTIES = [
  {
    id: 'prop-1',
    name: '3 BHK Modern House',
    type: 'House',
    address: '124 Maple Street',
    city: 'Ahmedabad',
    pincode: '380015',
    price: 4500000,
    bedrooms: 3,
    bathrooms: 3,
    area: 2500,
    ownerName: 'Rahul Patel',
    ownerPhone: '9876543210',
    description: 'A beautiful modern house with great amenities.',
    notes: 'Key is with security.',
    status: 'Visited',
    isFavorite: false,
    photos: [],
    location: { latitude: 23.0225, longitude: 72.5714 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prop-2',
    name: 'Luxury Penthouse Skyline',
    type: 'Apartment',
    address: 'Apt 4B, Skyline Tower',
    city: 'Mumbai',
    pincode: '400001',
    price: 8500000,
    bedrooms: 4,
    bathrooms: 4,
    area: 4000,
    ownerName: 'Amit Shah',
    ownerPhone: '9876543211',
    description: 'Amazing sea view penthouse.',
    notes: 'Call owner before visit.',
    status: 'Active',
    isFavorite: false,
    photos: [],
    location: { latitude: 18.9220, longitude: 72.8347 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export const getProperties = async (filters = {}) => {
  try {
    let queryParams = [];
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        queryParams.push(`${key}=${encodeURIComponent(filters[key])}`);
      }
    });
    const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';

    try {
      const { getSession } = require('./authService');
      const session = await getSession();
      if (session?.token) {
        const response = await fetch(`http://localhost:5000/api/properties${queryString}`, {
          headers: { 'Authorization': `Bearer ${session.token}` }
        });
        if (response.ok) {
          const apiData = await response.json();
          await AsyncStorage.setItem(PROPERTIES_KEY, JSON.stringify(apiData));
          return apiData;
        }
      }
    } catch (apiError) {
      console.warn('Backend API not reachable (getProperties), falling back to local.', apiError.message);
    }

    const data = await AsyncStorage.getItem(PROPERTIES_KEY);
    if (!data) {
      await AsyncStorage.setItem(PROPERTIES_KEY, JSON.stringify(MOCK_PROPERTIES));
      return MOCK_PROPERTIES;
    }
    let localData = JSON.parse(data);
    
    if (filters.search) localData = localData.filter(p => (p.name && p.name.toLowerCase().includes(filters.search.toLowerCase())) || (p.title && p.title.toLowerCase().includes(filters.search.toLowerCase())));
    if (filters.type && filters.type !== 'All') localData = localData.filter(p => p.type === filters.type);
    if (filters.minPrice) localData = localData.filter(p => p.price >= Number(filters.minPrice));
    if (filters.maxPrice) localData = localData.filter(p => p.price <= Number(filters.maxPrice));
    if (filters.beds) localData = localData.filter(p => (p.bedrooms || p.beds) >= Number(filters.beds));
    if (filters.baths) localData = localData.filter(p => (p.bathrooms || p.baths) >= Number(filters.baths));
    if (filters.status) localData = localData.filter(p => p.status === filters.status || p.visitStatus === filters.status);
    if (filters.isFavorite) localData = localData.filter(p => p.isFavorite === true);
    if (filters.tags) {
      const tagArr = filters.tags.split(',').map(t => t.trim().toLowerCase());
      localData = localData.filter(p => p.tags && p.tags.some(t => tagArr.includes(t.toLowerCase())));
    }
    
    if (filters.sort) {
      if (filters.sort === 'priceAsc') localData.sort((a,b) => a.price - b.price);
      if (filters.sort === 'priceDesc') localData.sort((a,b) => b.price - a.price);
      if (filters.sort === 'newest') localData.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
      if (filters.sort === 'oldest') localData.sort((a,b) => new Date(a.createdAt) - new Date(b.createdAt));
      if (filters.sort === 'ratingDesc') localData.sort((a,b) => (b.rating||0) - (a.rating||0));
    }

    return localData;
  } catch (error) {
    console.error('Error fetching properties', error);
    return [];
  }
};

export const saveProperty = async (property) => {
  try {
    try {
      const { getSession } = require('./authService');
      const session = await getSession();
      if (session?.token) {
        await fetch(`http://localhost:5000/api/properties`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.token}` },
          body: JSON.stringify(property)
        });
      }
    } catch(e) { console.warn('Backend save failed'); }

    const current = await getProperties();
    const updated = [...current, property];
    await AsyncStorage.setItem(PROPERTIES_KEY, JSON.stringify(updated));
    return true;
  } catch (error) {
    console.error('Error saving property', error);
    return false;
  }
};

export const updateProperty = async (property) => {
  try {
    try {
      const { getSession } = require('./authService');
      const session = await getSession();
      if (session?.token) {
        await fetch(`http://localhost:5000/api/properties/${property.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.token}` },
          body: JSON.stringify(property)
        });
      }
    } catch(e) { console.warn('Backend update failed'); }

    const current = await getProperties();
    const updated = current.map(p => p.id === property.id ? property : p);
    await AsyncStorage.setItem(PROPERTIES_KEY, JSON.stringify(updated));
    return true;
  } catch (error) {
    console.error('Error updating property', error);
    return false;
  }
};

export const toggleFavoriteProperty = async (id, isFavorite) => {
  try {
    // 1. Optimistic UI update in AsyncStorage
    const current = await getProperties();
    const property = current.find(p => p.id === id);
    if (!property) return false;
    
    const updatedProperty = { ...property, isFavorite };
    const updatedList = current.map(p => p.id === id ? updatedProperty : p);
    await AsyncStorage.setItem(PROPERTIES_KEY, JSON.stringify(updatedList));

    // 2. Real Backend API Call (will fail gracefully if not connected)
    try {
      const { getSession } = require('./authService');
      const session = await getSession();
      const token = session?.token || '';
      
      const response = await fetch(`http://localhost:5000/api/properties/${id}/favorite`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isFavorite })
      });
      
      if (!response.ok) {
        throw new Error('API request failed');
      }
    } catch (apiError) {
      console.warn('Backend API not reachable, falling back to local storage only:', apiError.message);
      // Optional: Rollback logic could go here if strict data consistency is required
    }
    
    return true;
  } catch (error) {
    console.error('Error toggling favorite', error);
    return false;
  }
};

export const deleteProperty = async (id) => {
  try {
    const current = await getProperties();
    const updated = current.filter(p => p.id !== id);
    await AsyncStorage.setItem(PROPERTIES_KEY, JSON.stringify(updated));
    return true;
  } catch (error) {
    console.error('Error deleting property', error);
    return false;
  }
};

export const getVisits = async () => {
  try {
    const data = await AsyncStorage.getItem(VISITS_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch (error) {
    console.error('Error fetching visits', error);
    return [];
  }
};

export const saveVisit = async (visit) => {
  try {
    // Local storage
    const current = await getVisits();
    const updated = [...current, visit];
    await AsyncStorage.setItem(VISITS_KEY, JSON.stringify(updated));
    
    // Backend API Call
    try {
      const { getSession } = require('./authService');
      const session = await getSession();
      const token = session?.token || '';
      
      await fetch(`http://localhost:5000/api/visits`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(visit)
      });
    } catch (apiError) {
      console.warn('Backend API not reachable (saveVisit)', apiError.message);
    }

    return true;
  } catch (error) {
    console.error('Error saving visit', error);
    return false;
  }
};

export const updateVisit = async (visit) => {
  try {
    // Local storage
    const current = await getVisits();
    const updated = current.map(v => v.id === visit.id ? visit : v);
    await AsyncStorage.setItem(VISITS_KEY, JSON.stringify(updated));
    
    // Backend API Call
    try {
      const { getSession } = require('./authService');
      const session = await getSession();
      const token = session?.token || '';
      
      // if visit.id is just local string (e.g. 'visit_123'), backend might have trouble if it expects ObjectId
      // But we will send it anyway. The backend should ideally map it or we use proper IDs.
      await fetch(`http://localhost:5000/api/visits/${visit.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(visit)
      });
    } catch (apiError) {
      console.warn('Backend API not reachable (updateVisit)', apiError.message);
    }
    
    return true;
  } catch (error) {
    console.error('Error updating visit', error);
    return false;
  }
};

export const clearData = async () => {
  try {
    await AsyncStorage.multiRemove([PROPERTIES_KEY, VISITS_KEY, SETTINGS_KEY, PROFILE_PHOTO_KEY]);
    return true;
  } catch (error) {
    console.error('Error clearing data', error);
    return false;
  }
};

export const getProfilePhoto = async () => {
  try {
    return await AsyncStorage.getItem(PROFILE_PHOTO_KEY);
  } catch (error) {
    return null;
  }
};

export const saveProfilePhoto = async (uri) => {
  try {
    await AsyncStorage.setItem(PROFILE_PHOTO_KEY, uri);
    return true;
  } catch (error) {
    return false;
  }
};
