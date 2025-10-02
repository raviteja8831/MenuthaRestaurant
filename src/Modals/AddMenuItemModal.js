


import React, { useState, useEffect } from "react";
import { View, Modal, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from '@expo/vector-icons';

// menus: [{ id, name, items: [{id, name}] }]
// menuItemIds: [id] (all menu item ids for the user)
// allottedMenuItemIds: [id] (allotted to user)
// onAdd: callback(selectedIds)
export default function AddMenuItemModal({
  visible,
  onClose,
  menus = [],
  menuItemIds = [],
  allottedMenuItemIds = [],
  onAdd
}) {
  const [selectedMenuId, setSelectedMenuId] = useState(null);
  // Store selected items per menu: { [menuId]: string[] }
  const [selectedMenuItemsByMenu, setSelectedMenuItemsByMenu] = useState({});

  // Normalize ids
  const allMenuItemIdsStr = (menuItemIds || []).map(String);
  const allottedIdsStr = (allottedMenuItemIds || []).map(String);

  // Prepare menus
  const filteredMenus = (menus || []).map(menu => ({
    ...menu,
    items: Array.isArray(menu.items)
      ? menu.items
      : Array.isArray(menu.menuItems)
        ? menu.menuItems
        : [],
  })).map(menu => ({
    ...menu,
    items: allMenuItemIdsStr.length > 0 ? menu.items.filter(item => allMenuItemIdsStr.includes(String(item.id))) : menu.items
  })).filter(menu => menu.items.length > 0);

  // On open, always select first menu and preselect allotted items + previously selected for that menu
  useEffect(() => {
    if (visible && filteredMenus.length > 0) {
      const menuToSelect = filteredMenus[0];
      setSelectedMenuId(menuToSelect.id);
      setSelectedMenuItemsByMenu(prev => {
        const updated = { ...prev };
        filteredMenus.forEach(menu => {
          const menuItemIdsInMenu = (menu.items || []).map(item => String(item.id));
          const prevForMenu = prev[menu.id] || [];
          // Always include allotted for this menu
          updated[menu.id] = Array.from(new Set([
            ...menuItemIdsInMenu.filter(id => allottedIdsStr.includes(id)),
            ...prevForMenu.filter(id => menuItemIdsInMenu.includes(id))
          ]));
        });
        return updated;
      });
    } else if (visible) {
      setSelectedMenuId(null);
      setSelectedMenuItemsByMenu({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, allottedMenuItemIds, menuItemIds, menus]);

  const selectedMenu = filteredMenus.find(m => m.id === selectedMenuId);
  const menuItems = selectedMenu ? selectedMenu.items : [];
  const selectedMenuItemIds = selectedMenuItemsByMenu[selectedMenuId] || [];

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.title}>Allot Menu Items</Text>
          {filteredMenus.length === 0 ? (
            <Text style={{ color: '#888', marginVertical: 24, textAlign: 'center' }}>
              No menu items available to assign.
            </Text>
          ) : (
            <>
              <Text style={styles.label}>Menu</Text>
              <ScrollView style={styles.dropdown}>
                {filteredMenus.map(menu => (
                  <Pressable
                    key={menu.id}
                    style={[styles.dropdownItem, selectedMenuId === menu.id && styles.selected]}
                    onPress={() => {
                      setSelectedMenuId(menu.id);
                      setSelectedMenuItemsByMenu(prev => {
                        const updated = { ...prev };
                        const menuItemIdsInMenu = (menu.items || []).map(item => String(item.id));
                        const prevForMenu = prev[menu.id] || [];
                        updated[menu.id] = Array.from(new Set([
                          ...menuItemIdsInMenu.filter(id => allottedIdsStr.includes(id)),
                          ...prevForMenu.filter(id => menuItemIdsInMenu.includes(id))
                        ]));
                        return updated;
                      });
                    }}
                  >
                    <Text>{menu.name}</Text>
                  </Pressable>
                ))}
              </ScrollView>
              {selectedMenu && (
                <>
                  <Text style={styles.label}>Menu Items</Text>
                  <ScrollView style={styles.dropdown}>
                    {menuItems.map(item => {
                      const itemIdStr = String(item.id);
                      const isSelected = selectedMenuItemIds.includes(itemIdStr);
                      const isAllotted = allottedIdsStr.includes(itemIdStr);
                      return (
                        <Pressable
                          key={item.id}
                          style={[styles.dropdownItem, isSelected && styles.selected]}
                          onPress={() => {
                            setSelectedMenuItemsByMenu(prev => {
                              const updated = { ...prev };
                              const prevForMenu = updated[selectedMenuId] || [];
                              if (!prevForMenu.includes(itemIdStr)) {
                                updated[selectedMenuId] = [...prevForMenu, itemIdStr];
                              } else {
                                updated[selectedMenuId] = prevForMenu.filter(id => id !== itemIdStr);
                              }
                              return updated;
                            });
                          }}
                          disabled={false}
                        >
                          <View style={{ flexDirection: 'row', alignItems: 'center', minWidth: 0 }}>
                            <Text style={{ flexShrink: 1 }}>{item.name}</Text>
                            {isSelected ? (
                              <Ionicons name="checkmark" size={18} color="#4b5cff" style={{ marginLeft: 10, minWidth: 18 }} />
                            ) : null}
                            {/* {isAllotted ? (
                              <Text style={{ color: '#888', marginLeft: 4 }}></Text>
                            ) : null} */}
                          </View>
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                </>
              )}
            </>
          )}
          <View style={styles.actions}>
            <Pressable onPress={onClose} style={styles.cancelBtn}>
              <Ionicons name="close" size={24} color="#333" />
            </Pressable>
            <Pressable
              onPress={() => {
                // Collect only currently selected items from all menus
                let allSelected = [];
                filteredMenus.forEach(menu => {
                  const selectedForMenu = selectedMenuItemsByMenu[menu.id] || [];
                  allSelected = allSelected.concat(selectedForMenu);
                });
                // Remove duplicates
                allSelected = Array.from(new Set(allSelected));
                onAdd(allSelected);
              }}
              style={[
                styles.addBtn,
                (filteredMenus.length === 0) && { opacity: 0.5 }
              ]}
              disabled={filteredMenus.length === 0}
            >
              <Ionicons name="checkmark" size={24} color="#fff" />
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}


const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  content: { backgroundColor: '#fff', borderRadius: 12, padding: 20, width: 320, maxHeight: 480 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  label: { fontSize: 15, fontWeight: 'bold', marginTop: 8, marginBottom: 4 },
  dropdown: { maxHeight: 90, borderWidth: 1, borderColor: '#eee', borderRadius: 8, marginBottom: 8 },
  dropdownItem: { padding: 10, borderBottomWidth: 1, borderColor: '#eee' },
  selected: { backgroundColor: '#e0e0ff' },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16 },
  cancelBtn: { marginRight: 16 },
  addBtn: { backgroundColor: '#4b5cff', borderRadius: 20, padding: 8 },
});