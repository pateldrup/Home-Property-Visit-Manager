import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { theme } from '../constants/theme';
import { VisitStatus } from '../constants/propertyTypes';

const getStatusColor = (status) => {
  switch (status) {
    case VisitStatus.SCHEDULED: return Colors.primary;
    case VisitStatus.IN_PROGRESS: return Colors.warning;
    case VisitStatus.COMPLETED: return Colors.success;
    case VisitStatus.CANCELLED: return Colors.danger;
    default: return Colors.primary;
  }
};

export const CalendarView = ({ visits = [], selectedDate, onSelectDate }) => {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date(selectedDate || new Date());
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  });

  // Keep currentMonth in sync if selectedDate jumps to a different month
  useEffect(() => {
    if (selectedDate) {
      const d = new Date(selectedDate);
      if (d.getMonth() !== currentMonth.getMonth() || d.getFullYear() !== currentMonth.getFullYear()) {
        const newMonth = new Date(d);
        newMonth.setDate(1);
        newMonth.setHours(0, 0, 0, 0);
        setCurrentMonth(newMonth);
      }
    }
  }, [selectedDate]);

  const { daysInMonth, startDayOffset, monthName, year } = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startDayOffset = new Date(year, month, 1).getDay();
    const monthName = currentMonth.toLocaleString('default', { month: 'long' });
    return { daysInMonth, startDayOffset, monthName, year };
  }, [currentMonth]);

  const visitsByDate = useMemo(() => {
    const map = {};
    visits.forEach(v => {
      if (v.date) {
        const dateStr = new Date(v.date).toISOString().split('T')[0];
        if (!map[dateStr]) map[dateStr] = [];
        map[dateStr].push(v);
      }
    });
    return map;
  }, [visits]);

  const handlePrevMonth = () => {
    setCurrentMonth(prev => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() - 1);
      return d;
    });
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + 1);
      return d;
    });
  };

  const handleToday = () => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    onSelectDate(todayStr);
  };

  const renderDays = () => {
    const days = [];
    const todayStr = new Date().toISOString().split('T')[0];

    // Empty cells for days before the 1st
    for (let i = 0; i < startDayOffset; i++) {
      days.push(<View key={`empty-${i}`} style={styles.dayCell} />);
    }

    // Actual days
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, currentMonth.getMonth(), i, 12, 0, 0);
      const dateStr = d.toISOString().split('T')[0];
      const isSelected = selectedDate === dateStr;
      const isToday = dateStr === todayStr;
      const dayVisits = visitsByDate[dateStr] || [];

      days.push(
        <TouchableOpacity
          key={dateStr}
          style={[
            styles.dayCell,
            isSelected && styles.selectedDayCell,
            isToday && !isSelected && styles.todayDayCell
          ]}
          onPress={() => onSelectDate(dateStr)}
        >
          <Text style={[
            styles.dayText,
            isSelected && styles.selectedDayText,
            isToday && !isSelected && styles.todayDayText
          ]}>
            {i}
          </Text>
          <View style={styles.markersContainer}>
            {dayVisits.slice(0, 3).map((v, idx) => (
              <View 
                key={v.id || idx} 
                style={[styles.marker, { backgroundColor: getStatusColor(v.status) }]} 
              />
            ))}
            {dayVisits.length > 3 && (
              <Text style={styles.moreMarkersText}>+</Text>
            )}
          </View>
        </TouchableOpacity>
      );
    }

    // Fill remaining cells to complete the grid (optional, but keeps height consistent)
    const totalCells = days.length;
    const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
    for (let i = 0; i < remaining; i++) {
      days.push(<View key={`empty-end-${i}`} style={styles.dayCell} />);
    }

    return days;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handlePrevMonth} style={styles.navButton}>
          <Ionicons name="chevron-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        
        <View style={styles.monthYearContainer}>
          <Text style={styles.monthYearText}>{monthName} {year}</Text>
          <TouchableOpacity onPress={handleToday} style={styles.todayButton}>
            <Text style={styles.todayText}>Today</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={handleNextMonth} style={styles.navButton}>
          <Ionicons name="chevron-forward" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.weekDaysHeader}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <Text key={day} style={styles.weekDayText}>{day}</Text>
        ))}
      </View>

      <View style={styles.daysGrid}>
        {renderDays()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    padding: theme.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.m,
  },
  navButton: {
    padding: theme.spacing.xs,
  },
  monthYearContainer: {
    alignItems: 'center',
  },
  monthYearText: {
    ...theme.typography.h3,
    color: Colors.primary,
  },
  todayButton: {
    marginTop: 4,
    backgroundColor: Colors.background,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  todayText: {
    ...theme.typography.caption,
    color: Colors.primary,
    fontWeight: '600',
  },
  weekDaysHeader: {
    flexDirection: 'row',
    marginBottom: theme.spacing.s,
  },
  weekDayText: {
    flex: 1,
    textAlign: 'center',
    ...theme.typography.body2,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%', // 100% / 7
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: theme.borderRadius.s,
  },
  selectedDayCell: {
    backgroundColor: Colors.primary,
  },
  todayDayCell: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  dayText: {
    ...theme.typography.body1,
    color: Colors.text,
  },
  selectedDayText: {
    color: Colors.surface,
    fontWeight: 'bold',
  },
  todayDayText: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
  markersContainer: {
    flexDirection: 'row',
    marginTop: 4,
    height: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  marker: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 1,
  },
  moreMarkersText: {
    fontSize: 8,
    color: Colors.textSecondary,
    marginLeft: 1,
  }
});
