import joblib
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import pandas as pd

# Define base directory
BASE_DIR = Path(__file__).resolve().parent

# Load model, scaler, and expected columns (actual file names)
model = joblib.load(BASE_DIR / "KNN_heart.pkl")
scaler = joblib.load(BASE_DIR / "scaler (1).pkl")
expected_columns = joblib.load(BASE_DIR / "columns.pkl")

app = FastAPI()

# Allow the frontend (opened as a local file or served) to call the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class InputData(BaseModel):
    age: int
    sex: str
    chest_pain: str
    resting_bp: int
    cholesterol: int
    fasting_bs: int
    resting_ecg: str
    max_hr: int
    exercise_angina: str
    oldpeak: float
    st_slope: str


@app.post("/predict")
async def predict(data: InputData):
    # Build one-hot encoded row matching pd.get_dummies(drop_first=True)
    raw_input = {
        "Age": data.age,
        "RestingBP": data.resting_bp,
        "Cholesterol": data.cholesterol,
        "FastingBS": data.fasting_bs,
        "MaxHR": data.max_hr,
        "Oldpeak": data.oldpeak,
        "Sex_M": 1 if data.sex == "M" else 0,
        "ChestPainType_ATA": 1 if data.chest_pain == "ATA" else 0,
        "ChestPainType_NAP": 1 if data.chest_pain == "NAP" else 0,
        "ChestPainType_TA": 1 if data.chest_pain == "TA" else 0,
        "RestingECG_Normal": 1 if data.resting_ecg == "Normal" else 0,
        "RestingECG_ST": 1 if data.resting_ecg == "ST" else 0,
        "ExerciseAngina_Y": 1 if data.exercise_angina == "Y" else 0,
        "ST_Slope_Flat": 1 if data.st_slope == "Flat" else 0,
        "ST_Slope_Up": 1 if data.st_slope == "Up" else 0,
    }

    # Build DataFrame in the correct column order and scale
    input_df = pd.DataFrame([raw_input])[expected_columns]
    scaled = scaler.transform(input_df)
    pred = model.predict(scaled)[0]
    return {"prediction": int(pred)}

