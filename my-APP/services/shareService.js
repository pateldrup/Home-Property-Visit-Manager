import { Share } from 'react-native';
import { formatCurrency } from '../utils/formatCurrency';

export const shareProperty = async (property) => {
  try {
    const message = `🏠 Agent Connect\n\nProperty:\n${property.name}\n\n📍 Location:\n${property.address}, ${property.city}\n\n💰 Price:\n${formatCurrency(property.price)}\n\n🛏 Bedrooms:\n${property.bedrooms}\n\n🚿 Bathrooms:\n${property.bathrooms}\n\n👤 Owner:\n${property.ownerName}\n\n📞 Contact:\n${property.ownerPhone}\n\n🗺 Location:\nhttps://maps.google.com/?q=${property.location?.latitude},${property.location?.longitude}`;

    const result = await Share.share({
      message: message,
      title: 'Property Details - Agent Connect'
    });
    
    return result.action === Share.sharedAction;
  } catch (error) {
    console.error('Error sharing property', error);
    return false;
  }
};
