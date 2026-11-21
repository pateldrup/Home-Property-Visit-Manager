import * as Contacts from 'expo-contacts';

export const getPhoneContacts = async () => {
  try {
    const { status } = await Contacts.requestPermissionsAsync();
    if (status === 'granted') {
      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers],
        sort: Contacts.SortTypes.FirstName,
      });

      if (data.length > 0) {
        // Filter contacts that have a name and phone number
        return data
          .filter(c => c.name && c.phoneNumbers && c.phoneNumbers.length > 0)
          .map(c => ({
            id: c.id,
            name: c.name,
            phone: c.phoneNumbers[0].number
          }));
      }
      return [];
    } else {
      throw new Error('Contacts permission denied');
    }
  } catch (error) {
    console.error('Error fetching contacts', error);
    throw error;
  }
};
