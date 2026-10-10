import pandas as pd
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
import pickle
import os

def train_clinical_model(data_path: str, model_save_path: str):
    """
    Trains an XGBoost baseline model for Stage 1 risk prediction.
    """
    if not os.path.exists(data_path):
        print(f"Data file {data_path} not found. Please place the dataset here.")
        return

    # Load dataset
    df = pd.read_csv(data_path) # Adjust as per actual dataset

    target_col = "Osteoporosis"
    if target_col not in df.columns:
        print(f"Target column {target_col} not found.")
        return

    X = df.drop(columns=[target_col])
    y = df[target_col]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # Train XGBoost
    model = xgb.XGBClassifier(use_label_encoder=False, eval_metric='logloss')
    model.fit(X_train, y_train)

    # Evaluate
    preds = model.predict(X_test)
    acc = accuracy_score(y_test, preds)
    print(f"Baseline Accuracy: {acc:.4f}")
    print(classification_report(y_test, preds))

    # Save model
    with open(model_save_path, 'wb') as f:
        pickle.dump(model, f)
    print(f"Model saved to {model_save_path}")

if __name__ == "__main__":
    train_clinical_model(
        data_path="../datasets/clinical/clinical_harmonized.csv", 
        model_save_path="clinical_xgboost.pkl"
    )
