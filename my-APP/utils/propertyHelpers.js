export const getPropertyStatusColor = (status, Colors) => {
  switch (status) {
    case 'Active':
      return Colors.success;
    case 'Pending':
      return Colors.warning;
    case 'Visited':
      return Colors.secondary;
    case 'Sold':
      return Colors.danger;
    default:
      return Colors.textSecondary;
  }
};
