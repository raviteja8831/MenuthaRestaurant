import React, { useState } from 'react';
import { View, Text, Pressable, TextInput, StyleSheet, Modal } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const categories = [
  'Hot & Cold Beverages',
  'Soups',
  'Breakfast',
  'Starter',
  'Indian Bread',
  'Main Course',
  'Salads',
  'Ice Cream & Desert',
];

export default function AddMenuItemScreen({ visible, onClose, onSave, menuId }) {
  const [menu, setMenu] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [type, setType] = useState('');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <Pressable style={styles.closeBtn} onPress={onClose}>
            <MaterialCommunityIcons name="close" size={28} color="#222" />
          </Pressable>
          <Text style={styles.modalTitle}>Add Menu Item</Text>
          {/* Category Dropdown */}
          <Text style={styles.label}>Menu</Text>
          <Pressable style={styles.dropdown} onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}>
            <Text style={styles.dropdownText}>{menu || 'Select menu'}</Text>
            <MaterialCommunityIcons name={showCategoryDropdown ? 'chevron-up' : 'chevron-down'} size={24} color="#222" />
          </Pressable>
          {showCategoryDropdown && (
            <View style={styles.dropdownMenu}>
              <Text style={styles.dropdownMenuTitle}>Menu</Text>
              {categories.map((cat) => (
                <Pressable key={cat} style={styles.dropdownMenuItem} onPress={() => { setMenu(cat); setShowCategoryDropdown(false); }}>
                  <Text style={styles.dropdownMenuItemText}>• {cat}</Text>
                </Pressable>
              ))}
            </View>
          )}
          {/* Type */}
          <Text style={styles.label}>Type</Text>
          <TextInput
            style={styles.input}
            placeholder="Veg/Non-Veg"
            value={type}
            onChangeText={setType}
            placeholderTextColor="#888"
          />
          {/* Name */}
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Name"
            value={name}
            onChangeText={setName}
            placeholderTextColor="#888"
          />
          {/* Price */}
          <Text style={styles.label}>Price</Text>
          <TextInput
            style={styles.input}
            placeholder="Price"
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
            placeholderTextColor="#888"
          />
          <Pressable style={styles.saveBtn} onPress={() => { onSave && onSave({ menu, type, name, price, menuId }); onClose && onClose(); }}>
            <Text style={styles.saveBtnText}>Save</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    backgroundColor: '#d6d1f7',
    borderRadius: 24,
    padding: 24,
    width: 320,
    alignItems: 'center',
    alignSelf: 'center',
    elevation: 8,
    position: 'relative',
  },
  closeBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 18,
    marginTop: 8,
    textAlign: 'center',
  },
  label: {
    color: '#222',
    fontSize: 16,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
    marginBottom: 4,
    marginTop: 10,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ece9fa',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    width: '100%',
    marginBottom: 8,
  },
  dropdownText: {
    color: '#222',
    fontSize: 15,
  },
  dropdownMenu: {
    backgroundColor: '#c7c2f3',
    borderRadius: 16,
    padding: 16,
    position: 'absolute',
    top: 110,
    left: 0,
    right: 0,
    zIndex: 30,
    width: 320,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  dropdownMenuTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 10,
    textAlign: 'center',
  },
  dropdownMenuItem: {
    paddingVertical: 6,
  },
  dropdownMenuItemText: {
    color: '#222',
    fontSize: 16,
  },
  input: {
    width: '100%',
    minHeight: 40,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 15,
    marginBottom: 8,
    color: '#222',
  },
  saveBtn: {
    backgroundColor: '#7b6eea',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    width: '100%',
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
