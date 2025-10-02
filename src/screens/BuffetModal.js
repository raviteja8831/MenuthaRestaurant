import React from 'react';
import { View, Text, TextInput, Modal, Pressable, StyleSheet } from 'react-native';
import { Surface } from 'react-native-paper';
import { BUFFET_TYPES } from '../constants/buffetTypes';
import { saveBuffetDetails, getBuffetDetails } from '../api/buffetApi';
import { useAlert } from '../services/alertService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function BuffetModal({ visible, onClose, buffet, setBuffet, initialType }) {
  const alert = useAlert();
  const [name, setName] = React.useState('');
  const [menu, setMenu] = React.useState('');
  const [type, setType] = React.useState(initialType || 'Paid');
  const [price, setPrice] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const [buffetList, setBuffetList] = React.useState([]);
  const [selectedBuffetId, setSelectedBuffetId] = React.useState('new');
  const [restaurantId, setRestaurantId] = React.useState('');
  const [status, setStatus] = React.useState(true);

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
            setName(buffets[0].name || '');
            setMenu(buffets[0].menu || '');
            setType(buffets[0].type || 'Paid');
            setPrice(buffets[0].price || '');
            setStatus(typeof buffets[0].isActive === 'boolean' ? buffets[0].isActive : true);
          } else {
            setSelectedBuffetId('new');
            setName('');
            setMenu('');
            setType(initialType || 'Paid');
            setPrice('');
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
      setName('');
      setMenu('');
      setType(initialType || 'Paid');
      setPrice('');
      setStatus(true);
    } else {
      const b = buffetList.find((x) => String(x.id) === selectedId);
      console.log('Selected buffet:', b);
      if (b) {
        setName(b.name || '');
        setMenu(b.menu || '');
        setType(b.type || 'Paid');
        setPrice(b.price || '');
        setStatus(typeof b.isActive === 'boolean' ? b.isActive : true);
      }
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const buffetObj = { name, menu: menu, type, price, restaurantId, status };
      if (selectedBuffetId !== 'new') {
        buffetObj.id = selectedBuffetId;
      }
      await saveBuffetDetails(buffetObj, token);
      setBuffet && setBuffet(buffetObj);
      alert.success('Buffet details saved successfully!');
      onClose && onClose();
    } catch (err) {
      alert.error(err?.message || 'Failed to save buffet details');
    }
    setSaving(false);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Surface style={styles.card}>
          <Text style={styles.title}>Buffet</Text>
          {/* Dropdown for buffet selection */}
          <View style={styles.row}>
            <Text style={styles.label}>Select Buffet :</Text>
            <View style={{ flex: 1 }}>
              <select
                style={{ height: 32, minWidth: 160, borderRadius: 6, borderWidth: 1, borderColor: '#aaa', backgroundColor: '#fff', fontSize: 14 }}
                value={selectedBuffetId}
                onChange={e => handleBuffetSelect(e.target.value)}
              >
                <option value="new">+ New Buffet</option>
                {buffetList.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </View>
          </View>
   
          <View style={styles.row}><Text style={styles.label}>Buffet Name :</Text><TextInput style={styles.input} value={name} onChangeText={setName} /></View>
          <View style={styles.row}><Text style={styles.label}>Buffet Menu :</Text><TextInput style={[styles.input, styles.menuInput]} value={menu} onChangeText={setMenu} multiline /></View>
          <View style={styles.row}><Text style={styles.label}>Type :</Text>
            {BUFFET_TYPES.map((t) => (
              <Pressable
                key={t.value}
                style={[styles.typeBtn, { backgroundColor: type === t.value ? '#bcb3f7' : '#fff', marginRight: 8 }]}
                onPress={() => setType(t.value)}
              >
                <Text style={{ color: type === t.value ? '#6c63b5' : '#222', fontWeight: type === t.value ? 'bold' : 'normal' }}>{t.label}</Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.row}><Text style={styles.label}>Price :</Text><TextInput style={[styles.input, styles.priceInput]} value={price} onChangeText={setPrice} keyboardType="numeric" /></View>
          <View style={styles.row}><Text style={styles.label}>Status :</Text>
            <Pressable
              style={[styles.toggleBtn, status ? styles.toggleOn : styles.toggleOff]}
              onPress={() => setStatus(v => !v)}
            >
              <View style={[styles.toggleCircle, status ? styles.toggleCircleOn : styles.toggleCircleOff]} />
            </Pressable>
            <Text style={{ marginLeft: 8, color: status ? '#43a047' : '#aaa', fontWeight: 'bold' }}>{status ? 'Enabled' : 'Disabled'}</Text>
          </View>
          <View style={styles.btnRow}>
            <Pressable style={styles.saveBtn} onPress={handleSave} disabled={saving}>
              <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save'}</Text>
            </Pressable>
            <Pressable style={styles.cancelBtn} onPress={onClose} disabled={saving}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </Pressable>
          </View>
        </Surface>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'center', alignItems: 'center' },
  card: { backgroundColor: '#d6d1fa', borderRadius: 16, padding: 18, width: 320, alignItems: 'flex-start', borderWidth: 1, borderColor: '#222' },
  title: { alignSelf: 'center', fontWeight: 'bold', fontSize: 16, marginBottom: 8, color: '#222' },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  label: { width: 110, fontSize: 14, color: '#222', fontWeight: '500' },
  input: { backgroundColor: '#fff', borderRadius: 6, fontSize: 14, paddingHorizontal: 8, height: 32, minWidth: 120, borderWidth: 1, borderColor: '#aaa' },
  menuInput: { height: 60, minWidth: 160, textAlignVertical: 'top' },
  typeBtn: { backgroundColor: '#fff', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: '#aaa' },
  priceInput: { width: 60 },
  btnRow: { flexDirection: 'row', alignSelf: 'center', marginTop: 10 },
  saveBtn: { backgroundColor: '#6c63b5', borderRadius: 8, paddingHorizontal: 18, paddingVertical: 8, marginRight: 10 },
  saveBtnText: { color: '#fff', fontWeight: 'bold' },
  cancelBtn: { backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 18, paddingVertical: 8, borderWidth: 1, borderColor: '#6c63b5' },
  cancelBtnText: { color: '#6c63b5', fontWeight: 'bold' },
  toggleBtn: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginLeft: 8,
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
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#222',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  toggleCircleOn: {
    backgroundColor: '#fff',
  },
  toggleCircleOff: {
    backgroundColor: '#fff',
  },
});
