import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, KeyboardAvoidingView, Platform, Alert, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '../constants/Colors';
import { theme } from '../constants/theme';
import { Header } from '../components/ui/Header';
import { CustomInput } from '../components/ui/CustomInput';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import { getProperties, updateProperty } from '../services/storageService';
import { Ionicons } from '@expo/vector-icons';

export default function CalculatorScreen() {
  const router = useRouter();
  const { propertyId } = useLocalSearchParams();
  
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState(propertyId || '');
  const [propertySelectorVisible, setPropertySelectorVisible] = useState(false);
  
  const [inputs, setInputs] = useState({
    propertyPrice: '',
    downPayment: '',
    interestRate: '8.5',
    loanTenure: '20',
    monthlyMaintenance: '',
    registrationCost: '',
    otherExpenses: ''
  });

  const [results, setResults] = useState({
    loanAmount: 0,
    calculatedEMI: 0,
    totalMonthlyCost: 0,
    totalInitialCost: 0
  });

  useEffect(() => {
    const fetchProps = async () => {
      const data = await getProperties();
      setProperties(data);
      if (propertyId) {
        const prop = data.find(p => p.id === propertyId);
        if (prop) {
          if (prop.costCalculation) {
            setInputs({
              propertyPrice: prop.costCalculation.propertyPrice?.toString() || prop.price?.toString() || '',
              downPayment: prop.costCalculation.downPayment?.toString() || '',
              interestRate: prop.costCalculation.interestRate?.toString() || '8.5',
              loanTenure: prop.costCalculation.loanTenure?.toString() || '20',
              monthlyMaintenance: prop.costCalculation.monthlyMaintenance?.toString() || '',
              registrationCost: prop.costCalculation.registrationCost?.toString() || '',
              otherExpenses: prop.costCalculation.otherExpenses?.toString() || ''
            });
          } else {
            setInputs(prev => ({ ...prev, propertyPrice: prop.price?.toString() || '' }));
          }
        }
      }
    };
    fetchProps();
  }, [propertyId]);

  useEffect(() => {
    calculateCosts();
  }, [inputs]);

  const updateInput = (key, value) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  };

  const calculateCosts = () => {
    const price = parseFloat(inputs.propertyPrice) || 0;
    const down = parseFloat(inputs.downPayment) || 0;
    const rate = parseFloat(inputs.interestRate) || 0;
    const tenureYears = parseFloat(inputs.loanTenure) || 0;
    const maintenance = parseFloat(inputs.monthlyMaintenance) || 0;
    const regCost = parseFloat(inputs.registrationCost) || 0;
    const other = parseFloat(inputs.otherExpenses) || 0;

    const loanAmt = Math.max(0, price - down);
    
    let emi = 0;
    if (loanAmt > 0 && rate > 0 && tenureYears > 0) {
      const r = rate / 12 / 100;
      const n = tenureYears * 12;
      emi = (loanAmt * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    }

    setResults({
      loanAmount: loanAmt,
      calculatedEMI: Math.round(emi),
      totalMonthlyCost: Math.round(emi + maintenance),
      totalInitialCost: Math.round(down + regCost + other)
    });
  };

  const handleSave = async () => {
    if (!selectedPropertyId) {
      Alert.alert('Error', 'Please select a property to save this calculation.');
      return;
    }
    const prop = properties.find(p => p.id === selectedPropertyId);
    if (!prop) return;

    setLoading(true);
    const updatedProp = {
      ...prop,
      costCalculation: {
        propertyPrice: parseFloat(inputs.propertyPrice) || 0,
        downPayment: parseFloat(inputs.downPayment) || 0,
        loanAmount: results.loanAmount,
        interestRate: parseFloat(inputs.interestRate) || 0,
        loanTenure: parseFloat(inputs.loanTenure) || 0,
        monthlyMaintenance: parseFloat(inputs.monthlyMaintenance) || 0,
        registrationCost: parseFloat(inputs.registrationCost) || 0,
        otherExpenses: parseFloat(inputs.otherExpenses) || 0,
        calculatedEMI: results.calculatedEMI,
        totalMonthlyCost: results.totalMonthlyCost,
        totalInitialCost: results.totalInitialCost
      }
    };

    const success = await updateProperty(updatedProp);
    setLoading(false);
    if (success) {
      Alert.alert('Success', 'Calculation saved to property successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } else {
      Alert.alert('Error', 'Failed to save calculation.');
    }
  };

  const selectedPropObj = properties.find(p => p.id === selectedPropertyId);

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Header title="Cost Calculator" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.disclaimerBox}>
          <Ionicons name="information-circle-outline" size={20} color={Colors.warning} />
          <Text style={styles.disclaimerText}>All values are estimates for planning purposes only and do not represent official government/legal rates.</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Link to Property (Optional)</Text>
          <TouchableOpacity style={styles.selectorBtn} onPress={() => setPropertySelectorVisible(!propertySelectorVisible)}>
            <Text style={[styles.selectorBtnText, !selectedPropObj && {color: Colors.textSecondary}]}>
              {selectedPropObj ? selectedPropObj.name || selectedPropObj.title : 'Select a property to save...'}
            </Text>
            <Ionicons name="chevron-down" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
          
          {propertySelectorVisible && (
            <View style={styles.selectorList}>
              {properties.map(p => (
                <TouchableOpacity key={p.id} style={styles.selectorItem} onPress={() => {
                  setSelectedPropertyId(p.id);
                  setPropertySelectorVisible(false);
                  if(!inputs.propertyPrice) updateInput('propertyPrice', p.price?.toString() || '');
                }}>
                  <Text style={styles.selectorItemText}>{p.name || p.title}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={styles.selectorItem} onPress={() => {
                setSelectedPropertyId('');
                setPropertySelectorVisible(false);
              }}>
                <Text style={[styles.selectorItemText, {color: Colors.danger}]}>Clear Selection</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Base Inputs</Text>
          <CustomInput label="Property Price (₹)" value={inputs.propertyPrice} onChangeText={(v) => updateInput('propertyPrice', v)} keyboardType="numeric" />
          <CustomInput label="Down Payment (₹)" value={inputs.downPayment} onChangeText={(v) => updateInput('downPayment', v)} keyboardType="numeric" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Loan Details</Text>
          <CustomInput label="Loan Amount (₹) [Auto-calculated]" value={results.loanAmount.toString()} editable={false} style={{backgroundColor: Colors.background}} />
          <View style={styles.row}>
            <View style={styles.col}>
              <CustomInput label="Interest Rate (%)" value={inputs.interestRate} onChangeText={(v) => updateInput('interestRate', v)} keyboardType="numeric" />
            </View>
            <View style={styles.col}>
              <CustomInput label="Tenure (Years)" value={inputs.loanTenure} onChangeText={(v) => updateInput('loanTenure', v)} keyboardType="numeric" />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Estimates</Text>
          <CustomInput label="Registration & Stamp Duty (₹)" value={inputs.registrationCost} onChangeText={(v) => updateInput('registrationCost', v)} keyboardType="numeric" />
          <CustomInput label="Other Expenses (₹)" value={inputs.otherExpenses} onChangeText={(v) => updateInput('otherExpenses', v)} keyboardType="numeric" />
          <CustomInput label="Monthly Maintenance (₹)" value={inputs.monthlyMaintenance} onChangeText={(v) => updateInput('monthlyMaintenance', v)} keyboardType="numeric" />
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryHeader}>Estimated Calculation Summary</Text>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Est. Monthly EMI</Text>
            <Text style={styles.summaryValue}>₹{results.calculatedEMI.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Est. Monthly Maintenance</Text>
            <Text style={styles.summaryValue}>₹{(parseFloat(inputs.monthlyMaintenance) || 0).toLocaleString()}</Text>
          </View>
          <View style={[styles.summaryRow, styles.summaryTotalRow]}>
            <Text style={styles.summaryTotalLabel}>Est. Total Monthly Cost</Text>
            <Text style={styles.summaryTotalValue}>₹{results.totalMonthlyCost.toLocaleString()}</Text>
          </View>

          <View style={{height: 1, backgroundColor: Colors.border, marginVertical: 12}} />

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Down Payment</Text>
            <Text style={styles.summaryValue}>₹{(parseFloat(inputs.downPayment) || 0).toLocaleString()}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Est. Reg. & Other Costs</Text>
            <Text style={styles.summaryValue}>₹{((parseFloat(inputs.registrationCost) || 0) + (parseFloat(inputs.otherExpenses) || 0)).toLocaleString()}</Text>
          </View>
          <View style={[styles.summaryRow, styles.summaryTotalRow]}>
            <Text style={styles.summaryTotalLabel}>Est. Total Initial Cost</Text>
            <Text style={styles.summaryTotalValue}>₹{results.totalInitialCost.toLocaleString()}</Text>
          </View>
        </View>

        {selectedPropertyId ? (
          <PrimaryButton title="Save to Property" onPress={handleSave} loading={loading} style={{marginVertical: 20}} />
        ) : (
          <View style={{height: 40}} />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { padding: theme.spacing.m },
  disclaimerBox: { flexDirection: 'row', backgroundColor: Colors.warning + '15', padding: theme.spacing.m, borderRadius: theme.borderRadius.m, marginBottom: theme.spacing.l, alignItems: 'center' },
  disclaimerText: { ...theme.typography.body2, color: Colors.warning, flex: 1, marginLeft: 8 },
  section: { backgroundColor: Colors.surface, padding: theme.spacing.m, borderRadius: theme.borderRadius.m, marginBottom: theme.spacing.m, ...theme.shadows.small },
  sectionTitle: { ...theme.typography.h4, color: Colors.primary, marginBottom: theme.spacing.m },
  row: { flexDirection: 'row', gap: theme.spacing.m },
  col: { flex: 1 },
  selectorBtn: { borderWidth: 1, borderColor: Colors.border, padding: theme.spacing.m, borderRadius: theme.borderRadius.s, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  selectorBtnText: { ...theme.typography.body1, color: Colors.text },
  selectorList: { borderWidth: 1, borderColor: Colors.border, borderTopWidth: 0, borderBottomLeftRadius: theme.borderRadius.s, borderBottomRightRadius: theme.borderRadius.s, maxHeight: 150 },
  selectorItem: { padding: theme.spacing.m, borderBottomWidth: 1, borderBottomColor: Colors.border },
  selectorItemText: { ...theme.typography.body1 },
  summaryCard: { backgroundColor: Colors.primary, padding: theme.spacing.l, borderRadius: theme.borderRadius.m, marginTop: theme.spacing.m, ...theme.shadows.medium },
  summaryHeader: { ...theme.typography.h3, color: Colors.surface, marginBottom: theme.spacing.m, textAlign: 'center' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { ...theme.typography.body2, color: Colors.surface, opacity: 0.9 },
  summaryValue: { ...theme.typography.body1, color: Colors.surface, fontWeight: 'bold' },
  summaryTotalRow: { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: Colors.surface + '40' },
  summaryTotalLabel: { ...theme.typography.body1, color: Colors.surface, fontWeight: 'bold' },
  summaryTotalValue: { ...theme.typography.h3, color: Colors.surface }
});
