// Centralized form helper for input rendering, validation, and error display
// Design: Material-like validation, unified UI for all forms
// Usage: Import and use Form, FormInput, and useFormValidation in your screens

import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Switch,
  Pressable,
  Platform,
} from "react-native";
import {
  TextInput as PaperTextInput,
  Text,
  Checkbox,
  RadioButton,
  Button,
} from "react-native-paper";
import { TextInput as RNTextInput } from "react-native";
import { Picker } from '@react-native-picker/picker';
let DateTimePicker;
try {
  DateTimePicker = require("@react-native-community/datetimepicker").default;
} catch {}

// Validation hook
export function useFormValidation(initialValues, validate) {
  const [values, setValues] = React.useState(initialValues);
  const [errors, setErrors] = React.useState({});
  const [touched, setTouched] = React.useState({});

  const handleChange = (name, value) => {
    setValues({ ...values, [name]: value });
    setTouched({ ...touched, [name]: true });
    if (validate) {
      const validationErrors = validate({ ...values, [name]: value });
      setErrors(validationErrors);
    }
  };

  const handleBlur = (name) => {
    setTouched({ ...touched, [name]: true });
    if (validate) {
      const validationErrors = validate(values);
      setErrors(validationErrors);
    }
  };

  return {
    values,
    setValues,
    errors,
    touched,
    handleChange,
    handleBlur,
    setErrors,
    setTouched,
  };
}

// Material-like input supporting all types
export function FormInput(props) {
  const {
    label,
    name,
    value,
    onChange,
    onBlur,
    error,
    touched,
    type = "text",
    customError,
    customLabel,
    options = [],
    ...rest
  } = props;
  const [showDate, setShowDate] = useState(false);
  let inputComponent = null;
  const showError = (customError || error) && touched;
  const labelText = customLabel || label;

  if (type === "switch") {
    inputComponent = (
      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>{labelText}</Text>
        <Switch
          value={!!value}
          onValueChange={(val) => onChange(name, val)}
          {...props}
        />
      </View>
    );
  } else if (type === "checkbox") {
    inputComponent = (
      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>{labelText}</Text>
        <Checkbox
          status={!!value ? "checked" : "unchecked"}
          onPress={() => onChange(name, !value)}
          {...props}
        />
      </View>
    );
  } else if (type === "select") {
    inputComponent = (
      <View style={styles.inputWrapper}>
        <Text style={styles.inputLabel}>{labelText}</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={value}
            onValueChange={(itemValue) => onChange(name, itemValue)}
            style={styles.selectPicker}
            dropdownIconColor="#666"
          >
            <Picker.Item label={props.placeholder || "Select"} value="" />
            {options.map((opt) => (
              <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
            ))}
          </Picker>
        </View>
      </View>
    );
  } else if (type === "radio") {
    inputComponent = (
      <View style={styles.inputWrapper}>
        <Text style={styles.selectLabel}>{labelText}</Text>
        <RadioButton.Group
          onValueChange={(val) => onChange(name, val)}
          value={value}
        >
          {options.map((opt) => (
            <View key={opt.value} style={styles.radioRow}>
              <RadioButton value={opt.value} />
              <Text style={styles.selectOptionText}>{opt.label}</Text>
            </View>
          ))}
        </RadioButton.Group>
      </View>
    );
  } else if (type === "textarea") {
    inputComponent = (
      <View style={styles.inputWrapper}>
        <Text style={styles.inputLabel}>{labelText}</Text>
        <RNTextInput
          placeholder=""
          value={value}
          onChangeText={(text) => onChange(name, text)}
          onBlur={() => onBlur(name)}
          style={[styles.input, { minHeight: 80 }, showError && styles.inputError]}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
          {...props}
        />
      </View>
    );
  } else if (type === "date") {
    const displayValue = value ? new Date(value).toLocaleDateString() : "";
    inputComponent = (
      <View>
        <Button mode="outlined" onPress={() => setShowDate(true)}>
          {displayValue || labelText}
        </Button>
        {showDate && DateTimePicker && (
          <DateTimePicker
            value={value ? new Date(value) : new Date()}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(event, selectedDate) => {
              setShowDate(false);
              if (
                selectedDate &&
                selectedDate.nativeEvent &&
                selectedDate.nativeEvent.timestamp
              ) {
                onChange(
                  name,
                  new Date(selectedDate.nativeEvent.timestamp).toISOString()
                );
              } else if (selectedDate) {
                onChange(name, selectedDate.toISOString());
              }
            }}
          />
        )}
      </View>
    );
  } else {
    inputComponent = (
      <View style={styles.inputWrapper}>
        <Text style={styles.inputLabel}>{labelText}</Text>
        <RNTextInput
          value={value}
          onChangeText={(text) => onChange(name, text)}
          onBlur={() => onBlur(name)}
          placeholder={showError ? "" : ""}
          style={[styles.input, showError && styles.inputError]}
        secureTextEntry={type === "password"}
        keyboardType={
          type === "number"
            ? "numeric"
            : type === "email"
            ? "email-address"
            : "default"
        }
        {...props}
      />
      </View>
    );
  }

  return (
    <View style={styles.inputWrapper}>
      {inputComponent}
      {!!showError && (
        <Text style={styles.errorText}>{customError || error}</Text>
      )}
    </View>
  );
}

// Form wrapper (optional, for layout)
export function Form({ children, style }) {
  return <View style={[styles.form, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  form: {
    width: "100%",
    alignItems: "center",
  },
  inputWrapper: {
    width: '100%',
    alignSelf: 'center',
    marginBottom: 16,
    paddingHorizontal: 0,
  },
  input: {
    backgroundColor: '#f8f9fa',
    width: '100%',
    alignSelf: 'center',
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#dee2e6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 0,
    color: '#212529',
    height: 48,
  },
  inputLabel: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 6,
    fontWeight: '400',
  },
  inputError: {
    borderColor: '#dc3545',
    borderWidth: 2,
    backgroundColor: '#fff5f5',
  },
  errorText: {
    color: "#dc3545",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
    fontWeight: '500',
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 8,
  },
  switchLabel: {
    fontSize: 15,
    color: "#333",
  },
  selectLabel: {
    fontSize: 14,
    color: "#fff",
    marginBottom: 6,
    fontWeight: '400',
  },
  selectOption: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#eae6ff",
    marginBottom: 6,
  },
  selectOptionActive: {
    backgroundColor: "#d1c4e9",
    borderColor: "#7b6eea",
    borderWidth: 2,
  },
  selectOptionText: {
    fontSize: 14,
    color: "#333",
  },
  pickerContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dee2e6',
    overflow: 'hidden',
    marginBottom: 0,
  },
  selectPicker: {
    height: 48,
    backgroundColor: 'transparent',
    color: "#212529",
    fontSize: 16,
  },
  radioRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: "#7b6eea",
    marginRight: 8,
    backgroundColor: "#fff",
  },
  radioCircleActive: {
    backgroundColor: "#7b6eea",
  },
});
