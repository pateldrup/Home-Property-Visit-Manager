import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { theme } from '../../constants/theme';
import { Header } from '../../components/ui/Header';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { ChecklistCategories, VisitStatus } from '../../constants/propertyTypes';
import { updateVisit, getVisits } from '../../services/storageService';
import { Ionicons } from '@expo/vector-icons';

export default function InspectionScreen() {
  const { visitId } = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [visit, setVisit] = useState(null);
  
  const [checklist, setChecklist] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState({});

  useEffect(() => {
    const loadVisit = async () => {
      const visits = await getVisits();
      const v = visits.find(val => val.id === visitId);
      if (v) {
        setVisit(v);
        if (v.checklist && v.checklist.length > 0) {
          setChecklist(v.checklist);
        } else {
          const initial = [];
          Object.keys(ChecklistCategories).forEach(cat => {
            ChecklistCategories[cat].forEach(item => {
              initial.push({ category: cat, item, checked: false, note: '' });
            });
          });
          setChecklist(initial);
        }
        
        const firstCat = Object.keys(ChecklistCategories)[0];
        setExpandedCategories({ [firstCat]: true });
      } else {
        Alert.alert('Error', 'Visit not found.');
        router.back();
      }
    };
    loadVisit();
  }, [visitId]);

  const saveChanges = async (newChecklist) => {
    if (visit) {
      const updatedVisit = { ...visit, checklist: newChecklist };
      await updateVisit(updatedVisit);
      setVisit(updatedVisit);
    }
  };

  const toggleItem = (category, item) => {
    const newChecklist = checklist.map(c => 
      (c.category === category && c.item === item) ? { ...c, checked: !c.checked } : c
    );
    setChecklist(newChecklist);
    saveChanges(newChecklist);
  };

  const updateNote = (category, item, text) => {
    const newChecklist = checklist.map(c => 
      (c.category === category && c.item === item) ? { ...c, note: text } : c
    );
    setChecklist(newChecklist);
    saveChanges(newChecklist);
  };

  const toggleCategory = (cat) => {
    setExpandedCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const handleComplete = async () => {
    const totalItems = checklist.length;
    const completedItems = checklist.filter(c => c.checked).length;
    
    if (completedItems < totalItems * 0.8) { // if less than 80% complete show warning
      Alert.alert(
        'Incomplete Checklist',
        `${totalItems - completedItems} checklist items are still incomplete. Are you sure you want to finish the visit?`,
        [
          { text: 'Go Back', style: 'cancel' },
          { text: 'Continue', onPress: finishVisit }
        ]
      );
    } else {
      finishVisit();
    }
  };

  const finishVisit = async () => {
    setLoading(true);
    if (visit) {
      const updatedVisit = { ...visit, status: VisitStatus.COMPLETED, checklist };
      await updateVisit(updatedVisit);
      setLoading(false);
      Alert.alert('Visit Complete', 'The property visit has been marked as completed.', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    }
  };

  if (!visit || checklist.length === 0) return <View style={styles.container}><Header title="Visit Checklist" /></View>;

  const totalItems = checklist.length;
  const completedItems = checklist.filter(c => c.checked).length;
  const progressPercent = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  return (
    <View style={styles.container}>
      <Header title="Visit Checklist" />
      
      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>Checklist Progress</Text>
          <Text style={styles.progressText}>{completedItems} / {totalItems} completed</Text>
        </View>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {Object.keys(ChecklistCategories).map((cat) => {
          const isExpanded = expandedCategories[cat];
          const catItems = checklist.filter(c => c.category === cat);
          const catCompleted = catItems.filter(c => c.checked).length;
          
          return (
            <View key={cat} style={styles.categoryCard}>
              <TouchableOpacity style={styles.categoryHeader} onPress={() => toggleCategory(cat)}>
                <View style={styles.categoryHeaderLeft}>
                  <Text style={styles.categoryTitle}>{cat}</Text>
                  <Text style={styles.categoryProgress}>{catCompleted}/{catItems.length}</Text>
                </View>
                <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
              
              {isExpanded && (
                <View style={styles.itemsContainer}>
                  {catItems.map((itemObj, idx) => (
                    <View key={idx} style={styles.itemRow}>
                      <TouchableOpacity style={styles.checkboxContainer} onPress={() => toggleItem(cat, itemObj.item)}>
                        <Ionicons 
                          name={itemObj.checked ? "checkbox" : "square-outline"} 
                          size={24} 
                          color={itemObj.checked ? Colors.primary : Colors.textSecondary} 
                        />
                        <Text style={[styles.itemText, itemObj.checked && styles.itemTextChecked]}>{itemObj.item}</Text>
                      </TouchableOpacity>
                      
                      <TextInput 
                        style={styles.noteInput}
                        placeholder="Add optional note..."
                        value={itemObj.note}
                        onChangeText={(text) => updateNote(cat, itemObj.item, text)}
                        placeholderTextColor={Colors.textSecondary}
                      />
                    </View>
                  ))}
                </View>
              )}
            </View>
          );
        })}

        <PrimaryButton 
          title="Complete Visit" 
          onPress={handleComplete}
          loading={loading}
          style={styles.completeBtn}
        />
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  progressContainer: { padding: theme.spacing.m, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.xs },
  progressTitle: { ...theme.typography.h4 },
  progressText: { ...theme.typography.body2, color: Colors.textSecondary, fontWeight: '600' },
  progressBarBg: { height: 8, backgroundColor: Colors.border, borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: Colors.primary },
  content: { padding: theme.spacing.m },
  categoryCard: { backgroundColor: Colors.surface, borderRadius: theme.borderRadius.m, marginBottom: theme.spacing.m, overflow: 'hidden', ...theme.shadows.small },
  categoryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: theme.spacing.m, backgroundColor: Colors.surface },
  categoryHeaderLeft: { flexDirection: 'row', alignItems: 'center' },
  categoryTitle: { ...theme.typography.h4, marginRight: theme.spacing.s },
  categoryProgress: { ...theme.typography.body2, color: Colors.textSecondary },
  itemsContainer: { padding: theme.spacing.m, paddingTop: 0, borderTopWidth: 1, borderTopColor: Colors.border },
  itemRow: { marginTop: theme.spacing.m },
  checkboxContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.xs },
  itemText: { ...theme.typography.body1, marginLeft: theme.spacing.s, color: Colors.text },
  itemTextChecked: { color: Colors.textSecondary, textDecorationLine: 'line-through' },
  noteInput: { backgroundColor: Colors.background, borderRadius: theme.borderRadius.s, padding: theme.spacing.s, ...theme.typography.body2, marginLeft: 32, borderWidth: 1, borderColor: Colors.border },
  completeBtn: { marginVertical: theme.spacing.l }
});
