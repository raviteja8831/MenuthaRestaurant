import React from 'react';
import { View, Text, TextInput, Modal, Pressable, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { Surface } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BUFFET_TYPES } from '../constants/buffetTypes';
import { saveBuffetDetails, getBuffetDetails } from '../api/buffetApi';
import { useAlert } from '../services/alertService';
import { FormInput, useFormValidation } from '../components/formHelper';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function BuffetModal({ visible, onClose, buffet, setBuffet, initialType }) {
  const alert = useAlert();
  const [saving, setSaving] = React.useState(false);
  const [buffetList, setBuffetList] = React.useState([]);
  const [selectedBuffetId, setSelectedBuffetId] = React.useState('new');
  const [restaurantId, setRestaurantId] = React.useState('');
  const [status, setStatus] = React.useState(true);
  const [showBuffetDropdown, setShowBuffetDropdown] = React.useState(false);

  // Form validation function
  const validateForm = (values) => {
    const errors = {};
    if (!values.name?.trim()) errors.name = "Buffet name is required";
    if (!values.menu?.trim()) errors.menu = "Buffet menu is required";
    if (!values.type?.trim()) errors.type = "Buffet type is required";
    if (!values.price?.trim()) errors.price = "Price is required";
    if (values.price && isNaN(Number(values.price))) errors.price = "Price must be a valid number";
    if (values.price && Number(values.price) < 0) errors.price = "Price must be positive";
    return errors;
  };

  // Use form validation hook
  const {
    values: form,
    setValues: setForm,
    errors,
    touched,
    handleChange,
    handleBlur,
  } = useFormValidation({
    name: "",
    menu: "",
    type: initialType || "Complimentary",
    price: "",
  }, validateForm);

  React.useEffect(() => {
    const fetchBuffets = async () => {
      try {
        const userStr = await AsyncStorage.getItem('user_profile');
        let rid = '';
        if (userStr) {
          const user = JSON.parse(userStr);
          rid = user?.restaurant?.id
        }
        setRestaurantId(rid);
        if (visible && rid) {
          const token = await AsyncStorage.getItem('auth_token');
          const res = await getBuffetDetails(rid, token);
          let buffets = Array.isArray(res) ? res : (res ? [res] : []);
          // Always add a 'New Buffet' option to the list for dropdown
          buffets = [...buffets];
          setBuffetList(buffets);
          if (buffets.length > 0) {
            setSelectedBuffetId(buffets[0].id);
            setForm({
              name: buffets[0].name || '',
              menu: buffets[0].menu || '',
              type: buffets[0].type || 'Complimentary',
              price: buffets[0].price || '',
            });
            setStatus(typeof buffets[0].isActive === 'boolean' ? buffets[0].isActive : true);
          } else {
            setSelectedBuffetId('new');
            setForm({
              name: '',
              menu: '',
              type: initialType || 'Complimentary',
              price: '',
            });
            setStatus(true);
          }
        }
      } catch (_err) {
        // Optionally handle error
      }
    };
    if (visible) fetchBuffets();
  }, [visible, initialType]);

  const handleBuffetSelect = (id) => {
    const selectedId = typeof id === 'string' ? id : String(id);
    setSelectedBuffetId(selectedId);
    if (selectedId === 'new') {
      setForm({
        name: '',
        menu: '',
        type: initialType || 'Complimentary',
        price: '',
      });
      setStatus(true);
    } else {
      const b = buffetList.find((x) => String(x.id) === selectedId);
      console.log('Selected buffet:', b);
      if (b) {
        setForm({
          name: b.name || '',
          menu: b.menu || '',
          type: b.type || 'Complimentary',
          price: b.price || '',
        });
        setStatus(typeof b.isActive === 'boolean' ? b.isActive : true);
      }
    }
  };

  const handleSave = async () => {
    // Validate form before saving
    const validationErrors = validateForm(form);
    if (Object.keys(validationErrors).length > 0) {
      alert.error('Please fill in all required fields correctly');
      return;
    }

    setSaving(true);
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const buffetObj = {
        name: form.name,
        menu: form.menu,
        type: form.type,
        price: form.price,
        restaurantId,
        status
      };
      if (selectedBuffetId !== 'new') {
        buffetObj.id = selectedBuffetId;
      }
      await saveBuffetDetails(buffetObj, token);
      setBuffet && setBuffet(buffetObj);
      // Reset form after successful save
      setForm({
        name: '',
        menu: '',
        type: initialType || 'Complimentary',
        price: '',
      });
      setSelectedBuffetId('new');
      setStatus(true);
      alert.success('Buffet details saved successfully!');
      onClose && onClose();
    } catch (err) {
      alert.error(err?.message || 'Failed to save buffet details');
    }
    setSaving(false);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <SafeAreaView style={styles.overlay}>
        <View style={styles.modalContainer}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <Surface style={styles.card}>
              <Text style={styles.title}>Buffet Management</Text>

              {/* Dropdown for buffet selection */}
              <View style={styles.dropdownSection}>
                <Text style={styles.sectionLabel}>Select Buffet</Text>
                <View style={styles.dropdownContainer}>
                  <Pressable
                    style={styles.dropdownButton}
                    onPress={() => setShowBuffetDropdown(!showBuffetDropdown)}
                  >
                    <Text style={styles.dropdownButtonText}>
                      {selectedBuffetId === 'new'
                        ? '+ New Buffet'
                        : buffetList.find(b => String(b.id) === String(selectedBuffetId))?.name || 'Select Buffet'
                      }
                    </Text>
                    <MaterialCommunityIcons
                      name={showBuffetDropdown ? "chevron-up" : "chevron-down"}
                      size={20}
                      color="#666"
                    />
                  </Pressable>
                  {showBuffetDropdown && (
                    <View style={styles.dropdownList}>
                      <Pressable
                        style={[styles.dropdownItem, selectedBuffetId === 'new' && styles.dropdownItemSelected]}
                        onPress={() => {
                          handleBuffetSelect('new');
                          setShowBuffetDropdown(false);
                        }}
                      >
                        <Text style={[styles.dropdownItemText, selectedBuffetId === 'new' && styles.dropdownItemTextSelected]}>
                          + New Buffet
                        </Text>
                      </Pressable>
                      {buffetList.map(b => (
                        <Pressable
                          key={b.id}
                          style={[styles.dropdownItem, String(selectedBuffetId) === String(b.id) && styles.dropdownItemSelected]}
                          onPress={() => {
                            handleBuffetSelect(b.id);
                            setShowBuffetDropdown(false);
                          }}
                        >
                          <Text style={[styles.dropdownItemText, String(selectedBuffetId) === String(b.id) && styles.dropdownItemTextSelected]}>
                            {b.name}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  )}
                </View>
              </View>

              {/* Form Fields */}
              <View style={styles.formContainer}>
                <FormInput
                  label="Buffet Name *"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.name}
                  touched={touched.name}
                  type="text"
                />

                <FormInput
                  label="Buffet Menu *"
                  name="menu"
                  value={form.menu}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.menu}
                  touched={touched.menu}
                  type="textarea"
                />

                <FormInput
                  label="Type *"
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.type}
                  touched={touched.type}
                  type="select"
                  options={BUFFET_TYPES}
                  placeholder="Select Type"
                />

                <FormInput
                  label="Price *"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.price}
                  touched={touched.price}
                  type="number"
                  keyboardType="numeric"
                />

                {/* Status Toggle */}
                <View style={styles.statusContainer}>
                  <Text style={styles.sectionLabel}>Status</Text>
                  <View style={styles.statusRow}>
                    <Pressable
                      style={[styles.toggleBtn, status ? styles.toggleOn : styles.toggleOff]}
                      onPress={() => setStatus(v => !v)}
                    >
                      <View style={[styles.toggleCircle, status ? styles.toggleCircleOn : styles.toggleCircleOff]} />
                    </Pressable>
                    <Text style={[styles.statusText, { color: status ? '#43a047' : '#666' }]}>
                      {status ? 'Enabled' : 'Disabled'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.buttonRow}>
                <Pressable
                  style={[styles.button, styles.cancelButton]}
                  onPress={onClose}
                  disabled={saving}
                >
                  <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={[styles.button, styles.saveButton, saving && styles.disabledButton]}
                  onPress={handleSave}
                  disabled={saving}
                >
                  <Text style={styles.buttonText}>
                    {saving ? 'Saving...' : 'Save'}
                  </Text>
                </Pressable>
              </View>
            </Surface>
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  scrollView: {
    maxHeight: '90%',
    width: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#8D8BEA',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 24,
    letterSpacing: 0.5,
  },
  dropdownSection: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  formContainer: {
    width: '100%',
  },
  statusContainer: {
    marginTop: 16,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  toggleBtn: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#aaa',
    padding: 2,
  },
  toggleOn: {
    backgroundColor: '#43a047',
    alignItems: 'flex-end',
    borderColor: '#43a047',
  },
  toggleOff: {
    backgroundColor: '#eee',
    alignItems: 'flex-start',
    borderColor: '#aaa',
  },
  toggleCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  toggleCircleOn: {
    backgroundColor: '#fff',
  },
  toggleCircleOff: {
    backgroundColor: '#fff',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    width: '100%',
    marginTop: 24,
  },
  button: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cancelButton: {
     backgroundColor: '#6c6cf2',
  },
  saveButton: {
    backgroundColor: '#6c6cf2',
  },
  disabledButton: {
    backgroundColor: '#aaa',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  cancelButtonText: {
    color: '#fff',
  },
  // Dropdown styles
  dropdownContainer: {
    position: 'relative',
    zIndex: 1000,
  },
  dropdownButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dee2e6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 48,
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#212529',
    flex: 1,
  },
  dropdownList: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 12,
    maxHeight: 200,
    zIndex: 1001,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  dropdownItemSelected: {
    backgroundColor: '#e6e1fa',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#212529',
  },
  dropdownItemTextSelected: {
    color: '#6c63b5',
    fontWeight: 'bold',
  },
});
