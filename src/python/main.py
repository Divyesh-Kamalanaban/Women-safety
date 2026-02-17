import pandas as pd
import numpy as np

# Load dataset
df = pd.read_csv("src/python/CrimesOnWomenData.csv")

# ----------------------------
# CONFIGURATION
# ----------------------------

FEATURE_WEIGHTS = {
    "Rape": 5.0,
    "WT": 4.5,
    "K&A": 4.0,
    "AoM": 3.5,
    "AoW": 3.0
}

REQUIRED_COLUMNS = list(FEATURE_WEIGHTS.keys()) + ["State"]

missing = [col for col in REQUIRED_COLUMNS if col not in df.columns]
if missing:
    raise ValueError(f"Missing required columns: {missing}")

# ----------------------------
# CLEAN STATE NAMES
# ----------------------------

df["State"] = (
    df["State"]
    .astype(str)
    .str.strip()
    .str.upper()
)

state_name_corrections = {
    "A & N ISLANDS": "ANDAMAN AND NICOBAR ISLANDS",
    "D & N HAVELI": "DADRA AND NAGAR HAVELI",
    "DAMAN & DIU": "DAMAN AND DIU",
    "LAKSHADWEEP": "LAKSHADWEEP"
}

df["State"] = df["State"].replace(state_name_corrections)

# ----------------------------
# AGGREGATE BY STATE
# ----------------------------

state_df = df.groupby("State")[list(FEATURE_WEIGHTS.keys())].sum().reset_index()

# ----------------------------
# NORMALIZE EACH FEATURE (0–1)
# ----------------------------

for feature in FEATURE_WEIGHTS:
    max_value = state_df[feature].max()
    if max_value == 0:
        state_df[f"{feature}_norm"] = 0
    else:
        state_df[f"{feature}_norm"] = state_df[feature] / max_value

# ----------------------------
# WEIGHTED RAW DATASET SCORE
# ----------------------------

state_df["Raw_Dataset_Score"] = sum(
    FEATURE_WEIGHTS[feature] * state_df[f"{feature}_norm"]
    for feature in FEATURE_WEIGHTS
)

# ----------------------------
# NORMALIZE TO 0–100
# ----------------------------

max_raw = state_df["Raw_Dataset_Score"].max()

if max_raw == 0:
    state_df["Dataset_Risk_0_100"] = 0
else:
    state_df["Dataset_Risk_0_100"] = (
        state_df["Raw_Dataset_Score"] / max_raw
    ) * 100

# ----------------------------
# SCALE TO 20% CONTRIBUTION
# ----------------------------

state_df["Dataset_Contribution_20pct"] = (
    state_df["Dataset_Risk_0_100"] * 0.20
)

# ----------------------------
# FINAL OUTPUT
# ----------------------------

result = state_df[
    [
        "State",
        "Raw_Dataset_Score",
        "Dataset_Risk_0_100",
        "Dataset_Contribution_20pct"
    ]
].sort_values("Dataset_Risk_0_100", ascending=False)
resultdf = pd.DataFrame(result)
resultdf.to_csv("result.csv", index=False)
print(result)
