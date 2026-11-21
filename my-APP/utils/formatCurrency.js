export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return '₹0';
  
  // Format as Indian Rupee
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};
