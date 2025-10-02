
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator, Alert } from 'react-native';

export default function EditUserScreen({ user, onSave, onClose }) {
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFirstname(user.firstname || user.name?.split(' ')[0] || '');
      setLastname(user.lastname || user.name?.split(' ')[1] || '');
      setPhone(user.phone || '');
      // Accept both role_id (number) and role (string/number)
      if (user.role_id) {
        setRole(user.role_id);
      } else if (user.role && (user.role === 1 || user.role === 2)) {
        setRole(user.role);
      } else if (user.role && typeof user.role === 'string') {
        setRole(user.role === 'Manager' ? 1 : user.role === 'Chef' ? 2 : '');
      } else {
        setRole('');
      }
    }
  }, [user]);

  const roleOptions = [
    { label: 'Chef', value: 2 },
    { label: 'Manager', value: 1 },
  ];

  const handleSave = async () => {
    if (!firstname || !lastname || !phone || !role) {
      Alert.alert('Validation', 'All fields are required.');
      return;
    }
    setLoading(true);
    try {
      await onSave({ id: user.id, firstname, lastname, phone, password: password || undefined, role_id: role });
      Alert.alert('Success', 'User updated successfully!');
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to update user');
    }
    setLoading(false);
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.form}>
        <Text style={styles.title}>Edit Profile</Text>
        <TextInput style={styles.input} placeholder="First Name" value={firstname} onChangeText={setFirstname} />
        <TextInput style={styles.input} placeholder="Last Name" value={lastname} onChangeText={setLastname} />
        <TextInput style={styles.input} placeholder="Phone No." value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        {/* Password field (optional) */}
        <TextInput style={styles.input} placeholder="New Password (leave blank to keep)" value={password} onChangeText={setPassword} secureTextEntry />
        {/* Role Dropdown */}
        <View style={{ width: '100%', marginBottom: 15 }}>
          <Pressable
            style={[styles.input, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}
            onPress={() => setShowRoleDropdown(v => !v)}
          >
            <Text style={{ color: '#fff' }}>{roleOptions.find(r => r.value === role)?.label || 'Select Role'}</Text>
            <Text style={{ color: '#fff' }}>{showRoleDropdown ? '\u25B2' : '\u25BC'}</Text>
          </Pressable>
          {showRoleDropdown && (
            <View style={{ backgroundColor: '#a18cd1', borderRadius: 8, marginTop: 4 }}>
              {roleOptions.map(opt => (
                <Pressable
                  key={opt.value}
                  style={{ padding: 10 }}
                  onPress={() => { setRole(opt.value); setShowRoleDropdown(false); }}
                >
                  <Text style={{ color: '#fff' }}>{opt.label}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
          <Pressable style={[styles.button, { backgroundColor: '#aaa' }]} onPress={onClose} disabled={loading}>
            <Text style={styles.buttonText}>Cancel</Text>
          </Pressable>
          <Pressable style={styles.button} onPress={handleSave} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Save</Text>}
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#DAD6FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  form: {
    backgroundColor: '#DAD6FE',
    borderRadius: 20,
    padding: 30,
    width: 300,
    alignItems: 'center',
  },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  input: {
    width: '100%',
    height: 44,
    borderRadius: 8,
    marginBottom: 18,
    paddingHorizontal: 14,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    fontSize: 16,
    color: '#222',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  button: {
    backgroundColor: '#7b6eea',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 40,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  dropdown: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownItemText: {
    color: '#222',
    fontSize: 16,
  },
});
