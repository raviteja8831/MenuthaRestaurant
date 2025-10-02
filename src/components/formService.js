// formService.js
// Dynamically renders a form using formHelper and a config, handles submit, and returns values/errors via callback.

import React from "react";
import { View } from "react-native";
import { Form, FormInput, useFormValidation } from "./formHelper.js";
import { Button } from "react-native-paper";

export default function FormService({
  config = [],
  values,
  setValues,
  validate,
  onSubmit,
  submitLabel = "Submit",
  loading = false,
  style = {},
  hiddenFields = [],
}) {
  // Only use controlled mode
  const [errors, setErrors] = React.useState({});
  const [touched, setTouched] = React.useState({});

  const handleChange = (name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };
  const handleBlur = (name) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleFormSubmit = () => {
    // Only validate fields present in the current config
    const formVals = {};
    config.forEach((field) => {
      formVals[field.name] = values[field.name];
    });
    console.log("Form values at submit:", formVals);
    const validationErrors = validate ? validate(formVals) : {};
    setErrors(validationErrors);
    setTouched(
      Object.keys(formVals).reduce((acc, k) => ({ ...acc, [k]: true }), {})
    );
    if (Object.keys(validationErrors).length > 0) {
      console.log("Validation errors:", validationErrors);
    }
    if (Object.keys(validationErrors).length === 0 && onSubmit) {
      onSubmit(values); // submit full form state
    }
  };

  return (
    <Form style={style}>
      {config.map((field) => (
        <View
          key={field.name}
          style={hiddenFields.includes(field.name) ? { display: "none" } : {}}
        >
          <FormInput
            {...field}
            value={values[field.name]}
            onChange={(name, value) => {
              if ((field.type == "number" || field.type == "phone") && value) {
                const numericValue = value.replace(/[^0-9]/g, "");
                handleChange(name, numericValue);
              } else {
                handleChange(name, value);
              }
            }}
            onBlur={handleBlur}
            error={errors[field.name]}
            touched={touched[field.name]}
          />
        </View>
      ))}
      {submitLabel ? (
        <Button
          mode="contained"
          onPress={handleFormSubmit}
          loading={loading}
          disabled={loading}
          style={{ marginTop: 16 }}
        >
          {submitLabel}
        </Button>
      ) : null}
    </Form>
  );
}
