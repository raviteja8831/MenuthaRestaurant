


import React, { useState, useEffect } from "react";
import { View, Modal, Text, Pressable, StyleSheet, ScrollView, SafeAreaView } from "react-native";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Surface } from 'react-native-paper';

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
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <SafeAreaView style={styles.overlay}>
        <View style={styles.modalContainer}>
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
            <Surface style={styles.content}>
              <Text style={styles.title}>Allot Menu Items</Text>
              {filteredMenus.length === 0 ? (
                <Text style={styles.noItemsText}>
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
                          <View style={styles.itemRow}>
                            <Text style={styles.itemText}>{item.name}</Text>
                            {isSelected ? (
                              <MaterialCommunityIcons name="check" size={18} color="#6c6cf2" style={styles.checkIcon} />
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
                  <Text style={styles.cancelText}>Cancel</Text>
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
                  <Text style={styles.addText}>Save</Text>
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
  content: {
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
  noItemsText: {
    color: '#ece9fa',
    marginVertical: 24,
    textAlign: 'center',
    fontSize: 16,
    fontStyle: 'italic',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
  },
  dropdown: {
    maxHeight: 120,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selected: {
    backgroundColor: '#e6e1fa',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minWidth: 0,
  },
  itemText: {
    flex: 1,
    fontSize: 16,
    color: '#212529',
  },
  checkIcon: {
    marginLeft: 10,
    minWidth: 18,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    width: '100%',
    marginTop: 24,
  },
  cancelBtn: {
 flex: 1,
    backgroundColor: '#6c6cf2',
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
  cancelText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  addBtn: {
    flex: 1,
    backgroundColor: '#6c6cf2',
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
  addText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
});