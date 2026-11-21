export const generateAnalytics = (properties, visits) => {
  const stats = {
    totalProperties: properties.length,
    visitedProperties: properties.filter(p => p.visitStatus === 'Confirmed' || p.status === 'Visited').length,
    favoriteProperties: properties.filter(p => p.isFavorite).length,
    completedVisits: visits.filter(v => v.status === 'Completed').length,
    scheduledVisits: visits.filter(v => v.status === 'Scheduled').length,
    pendingFollowUps: visits.filter(v => v.followUpStatus && v.followUpStatus !== 'NONE' && v.followUpStatus !== 'CLOSED').length,
    
    // Properties by Status
    propertiesAvailable: properties.filter(p => p.visitStatus === 'Available' || !p.visitStatus).length,
    propertiesPending: properties.filter(p => p.visitStatus === 'Visit Pending').length,
    propertiesConfirmed: properties.filter(p => p.visitStatus === 'Confirmed').length,
    
    // Average Property Rating
    averagePropertyRating: properties.length > 0 
      ? (properties.reduce((sum, p) => sum + (p.rating || 0), 0) / properties.length).toFixed(1)
      : '0.0',
      
    // Average Visit Score (based on checklist)
    averageVisitScore: 0,
  };

  // Calculate Visit Score
  let totalChecklistItems = 0;
  let checkedItems = 0;
  visits.forEach(v => {
    if (v.checklist && v.checklist.length > 0) {
      totalChecklistItems += v.checklist.length;
      checkedItems += v.checklist.filter(i => i.checked).length;
    }
  });
  
  stats.averageVisitScore = totalChecklistItems > 0 
    ? Math.round((checkedItems / totalChecklistItems) * 100) 
    : 0;

  // Generate Timeline
  const events = [];

  properties.forEach(p => {
    if (p.createdAt) {
      events.push({
        id: `prop_add_${p.id}`,
        type: 'PROPERTY_ADDED',
        title: `Added property: ${p.name || p.title}`,
        date: new Date(p.createdAt),
        icon: 'home-outline',
        color: '#4CAF50'
      });
    }
    if (p.isFavorite && p.updatedAt && p.updatedAt !== p.createdAt) {
      events.push({
        id: `prop_fav_${p.id}`,
        type: 'PROPERTY_FAVORITED',
        title: `Favorited ${p.name || p.title}`,
        date: new Date(p.updatedAt),
        icon: 'star',
        color: '#FFC107'
      });
    }
  });

  visits.forEach(v => {
    const pName = properties.find(p => p.id === v.propertyId)?.name || properties.find(p => p.id === v.propertyId)?.title || 'property';
    
    if (v.createdAt) {
      events.push({
        id: `vis_sched_${v.id}`,
        type: 'VISIT_SCHEDULED',
        title: `Scheduled visit to ${pName}`,
        date: new Date(v.createdAt),
        icon: 'calendar-outline',
        color: '#2196F3'
      });
    }
    
    if (v.status === 'Completed' && v.updatedAt) {
      events.push({
        id: `vis_comp_${v.id}`,
        type: 'VISIT_COMPLETED',
        title: `Visited ${pName}`,
        date: new Date(v.updatedAt),
        icon: 'checkmark-circle-outline',
        color: '#4CAF50'
      });
    }
  });

  // Sort descending
  events.sort((a, b) => b.date - a.date);

  // Group by relative time
  const groupedEvents = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  events.slice(0, 15).forEach(e => {
    const eDate = new Date(e.date);
    eDate.setHours(0, 0, 0, 0);
    
    let group = '';
    const diffTime = Math.abs(today - eDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    
    if (eDate.getTime() === today.getTime()) {
      group = 'Today';
    } else if (eDate.getTime() === yesterday.getTime()) {
      group = 'Yesterday';
    } else {
      group = `${diffDays} days ago`;
    }

    const existingGroup = groupedEvents.find(g => g.label === group);
    if (existingGroup) {
      existingGroup.data.push(e);
    } else {
      groupedEvents.push({ label: group, data: [e] });
    }
  });

  return { stats, recentActivity: groupedEvents };
};
