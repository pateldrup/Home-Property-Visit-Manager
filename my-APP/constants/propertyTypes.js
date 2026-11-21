export const PropertyTypes = [
  { id: 'house', label: 'House' },
  { id: 'apartment', label: 'Apartment' },
  { id: 'villa', label: 'Villa' },
  { id: 'commercial', label: 'Commercial' },
  { id: 'plot', label: 'Plot' },
];

export const PropertyStatus = {
  ACTIVE: 'Active',
  PENDING: 'Pending',
  VISITED: 'Visited',
  SOLD: 'Sold'
};

export const VisitStatus = {
  SCHEDULED: 'Scheduled',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled'
};

export const RoomTypes = [
  'Living Room',
  'Kitchen',
  'Bedroom',
  'Bathroom',
  'Balcony',
  'Exterior'
];

export const RoomConditions = [
  'Good',
  'Average',
  'Needs Repair'
];

export const ChecklistCategories = {
  'Property Exterior': ['Building condition', 'Entrance', 'Parking', 'Security', 'Neighborhood'],
  'Interior': ['Living room', 'Bedrooms', 'Bathrooms', 'Kitchen', 'Flooring', 'Doors/windows', 'Lighting', 'Ventilation'],
  'Utilities': ['Electricity', 'Water supply', 'Gas', 'Internet availability'],
  'Documents': ['Ownership documents', 'Property tax', 'Electricity bill', 'Society documents', 'Other documents'],
  'Additional': ['Maintenance condition', 'Noise level', 'Nearby facilities', 'Overall condition']
};

export const FollowUpStatus = {
  NONE: 'NONE',
  CONTACT_OWNER: 'CONTACT_OWNER',
  SECOND_VISIT: 'SECOND_VISIT',
  NEGOTIATION: 'NEGOTIATION',
  DOCUMENT_VERIFICATION: 'DOCUMENT_VERIFICATION',
  FINAL_DECISION: 'FINAL_DECISION',
  CLOSED: 'CLOSED'
};

export const getFollowUpStatusLabel = (status) => {
  const labels = {
    'NONE': 'None',
    'CONTACT_OWNER': 'Contact Owner',
    'SECOND_VISIT': 'Second Visit',
    'NEGOTIATION': 'Negotiation',
    'DOCUMENT_VERIFICATION': 'Doc Verification',
    'FINAL_DECISION': 'Final Decision',
    'CLOSED': 'Closed'
  };
  return labels[status] || status;
};
