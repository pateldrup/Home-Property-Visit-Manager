import * as Clipboard from 'expo-clipboard';

export const copyToClipboard = async (text) => {
  try {
    await Clipboard.setStringAsync(text);
    return true;
  } catch (error) {
    console.error('Error copying to clipboard', error);
    return false;
  }
};
