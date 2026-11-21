import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import { Colors } from '../constants/Colors';
import { StatusBadge } from './ui/StatusBadge';
import { formatCurrency } from '../utils/formatCurrency';

export const PropertyCard = ({ property, onPress, onMorePress, onFavoritePress, isSelectedForCompare, onSelectCompare }) => {
  return (
    <TouchableOpacity style={[styles.card, isSelectedForCompare && styles.cardSelected]} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.imageContainer}>
        {property.photos && property.photos.length > 0 ? (
          <Image source={{ uri: property.photos[0] }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="home" size={48} color={Colors.border} />
          </View>
        )}
        <View style={styles.badgeContainer}>
          <StatusBadge status={property.status} />
        </View>
        {onFavoritePress && (
          <TouchableOpacity 
            style={styles.favoriteButton} 
            onPress={(e) => { e.stopPropagation(); onFavoritePress(property); }}
          >
            <Ionicons 
              name={property.isFavorite ? "heart" : "heart-outline"} 
              size={22} 
              color={property.isFavorite ? "#e74c3c" : Colors.surface} 
            />
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.title} numberOfLines={1}>{property.name}</Text>
          <TouchableOpacity onPress={onMorePress} style={styles.moreButton}>
            <Ionicons name="ellipsis-vertical" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={14} color={Colors.textSecondary} />
          <Text style={styles.locationText} numberOfLines={1}>
            {property.address}, {property.city}
          </Text>
        </View>
        
        <View style={styles.footerRow}>
          <Text style={styles.price}>{formatCurrency(property.price)}</Text>
          {onSelectCompare && (
            <TouchableOpacity 
              style={[styles.compareBtn, isSelectedForCompare && styles.compareBtnActive]} 
              onPress={(e) => { e.stopPropagation(); onSelectCompare(property); }}
            >
              <Ionicons 
                name={isSelectedForCompare ? "checkbox" : "square-outline"} 
                size={18} 
                color={isSelectedForCompare ? Colors.primary : Colors.textSecondary} 
              />
              <Text style={[styles.compareText, isSelectedForCompare && styles.compareTextActive]}>Compare</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: theme.borderRadius.l,
    marginBottom: theme.spacing.m,
    ...theme.shadows.small,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardSelected: {
    borderColor: Colors.primary,
  },
  imageContainer: {
    height: 180,
    width: '100%',
    backgroundColor: Colors.background,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EAEDED',
  },
  badgeContainer: {
    position: 'absolute',
    top: theme.spacing.s,
    left: theme.spacing.s,
  },
  favoriteButton: {
    position: 'absolute',
    top: theme.spacing.s,
    right: theme.spacing.s,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
    padding: 6,
  },
  content: {
    padding: theme.spacing.m,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  title: {
    ...theme.typography.h4,
    flex: 1,
    marginRight: theme.spacing.s,
  },
  moreButton: {
    padding: theme.spacing.xs,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.s,
  },
  locationText: {
    ...theme.typography.body2,
    marginLeft: 4,
    flex: 1,
  },
  price: {
    ...theme.typography.h3,
    color: Colors.primary,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
  },
  compareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  compareBtnActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10', // light primary
  },
  compareText: {
    ...theme.typography.body2,
    marginLeft: 4,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  compareTextActive: {
    color: Colors.primary,
  }
});
