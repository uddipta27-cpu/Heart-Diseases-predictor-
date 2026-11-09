// script.js
// Build the Heart Stroke Prediction form and handle the Predict button.

const formContainer = document.getElementById("form-container");
const resultDiv = document.getElementById("result");

// Helper to create a labeled input/select element
function createField(labelText, element) {
    const wrapper = document.createElement("div");
    const label = document.createElement("label");
    label.textContent = labelText;
    wrapper.appendChild(label);
    wrapper.appendChild(element);
    return wrapper;
}

// Fields definitions (same as the Streamlit app)
const fields = [
    {
        name: "age",
        label: "Age",
        type: "range",
        attrs: { min: 18, max: 100, value: 40 },
    },
    {
        name: "sex",
        label: "Sex",
        type: "select",
        options: ["M", "F"],
    },
    {
        name: "chest_pain",
        label: "Chest Pain Type",
        type: "select",
        options: ["ATA", "NAP", "TA", "ASY"],
    },
    {
        name: "resting_bp",
        label: "Resting Blood Pressure (mm Hg)",
        type: "number",
        attrs: { min: 80, max: 200, value: 120 },
    },
    {
        name: "cholesterol",
        label: "Cholesterol (mg/dL)",
        type: "number",
        attrs: { min: 100, max: 600, value: 200 },
    },
    {
        name: "fasting_bs",
        label: "Fasting Blood Sugar > 120 mg/dL",
        type: "select",
        options: ["0", "1"],
    },
    {
        name: "resting_ecg",
        label: "Resting ECG",
        type: "select",
        options: ["Normal", "ST", "LVH"],
    },
    {
        name: "max_hr",
        label: "Max Heart Rate",
        type: "range",
        attrs: { min: 60, max: 220, value: 150 },
    },
    {
        name: "exercise_angina",
        label: "Exercise‑Induced Angina",
        type: "select",
        options: ["Y", "N"],
    },
    {
        name: "oldpeak",
        label: "Oldpeak (ST Depression)",
        type: "range",
        attrs: { min: 0, max: 6, step: 0.1, value: 1 },
    },
    {
        name: "st_slope",
        label: "ST Slope",
        type: "select",
        options: ["Up", "Flat", "Down"],
    },
];

// Dynamically create the form fields
fields.forEach((field) => {
    let input;
    if (field.type === "select") {
        input = document.createElement("select");
        field.options.forEach((opt) => {
            const option = document.createElement("option");
            option.value = opt;
            option.textContent = opt;
            input.appendChild(option);
        });
    } else {
        input = document.createElement("input");
        input.type = field.type;
        Object.entries(field.attrs || {}).forEach(([k, v]) => {
            input[k] = v;
        });
    }
    input.id = field.name;
    formContainer.appendChild(createField(field.label, input));
});

// Predict button handler
document.getElementById("predict-btn").addEventListener("click", async () => {
  // Gather values
  const payload = {};
  fields.forEach((field) => {
    const el = document.getElementById(field.name);
    payload[field.name] = el.type === "range" ? Number(el.value) : el.value;
  });

  try {
    const response = await fetch("http://127.0.0.1:8000/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    // Expect data.prediction to be 0 or 1
    if (data.prediction === 1) {
      resultDiv.innerHTML = '<span style="color:#d32f2f; font-weight:bold;">⚠️ High Risk of Heart Disease</span>';
    } else {
      resultDiv.innerHTML = '<span style="color:#388e3c; font-weight:bold;">✅ Low Risk of Heart Disease</span>';
    }
  } catch (err) {
    console.error("Prediction error:", err);
    resultDiv.innerHTML = `<span style="color:#d32f2f;">Error contacting prediction service.</span>`;
  }

  console.log("Submitted payload:", payload);
});