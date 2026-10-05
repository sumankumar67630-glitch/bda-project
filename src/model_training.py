"""
Machine Learning Model Training Pipeline
Trains and evaluates predictive classification models to forecast campaign approval
(Thumbs Up vs. Thumbs Down) using product metadata, campaign inputs, and NLP features.
"""

import os
import json
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, Tuple

from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, HistGradientBoostingClassifier, GradientBoostingClassifier
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, confusion_matrix, classification_report
)

CATEGORICAL_FEATURES = [
    'category',
    'input_tone',
    'input_target_audience',
    'channel'
]

NUMERICAL_FEATURES = [
    'discounted_price',
    'actual_price',
    'discount_percentage',
    'product_rating',
    'char_count',
    'word_count',
    'sentence_count',
    'reading_ease',
    'sentiment_score',
    'has_urgency',
    'urgency_intensity',
    'has_cta',
    'has_discount_callout',
    'spec_density',
    'has_emoji',
    'emoji_count',
    'exclamation_count',
    'question_count',
    'lexical_diversity',
    'channel_fit_penalty'
]

TARGET = 'feedback_rating'


def build_preprocessor() -> ColumnTransformer:
    """Creates scikit-learn ColumnTransformer for preprocessing."""
    cat_pipeline = Pipeline([
        ('onehot', OneHotEncoder(handle_unknown='ignore', sparse_output=False))
    ])
    
    num_pipeline = Pipeline([
        ('scaler', StandardScaler())
    ])
    
    preprocessor = ColumnTransformer(
        transformers=[
            ('cat', cat_pipeline, CATEGORICAL_FEATURES),
            ('num', num_pipeline, NUMERICAL_FEATURES)
        ]
    )
    return preprocessor


def train_and_evaluate_models(
    data_path: str = "data/campaign_feedback_logs.parquet",
    models_dir: str = "models"
) -> Dict[str, Any]:
    """
    Trains multiple models, evaluates their performance, identifies the best one,
    and persists the model pipeline and diagnostic metadata.
    """
    print(f"Loading campaign feedback logs from {data_path}...")
    df = pd.read_parquet(data_path) if data_path.endswith('.parquet') else pd.read_csv(data_path)
    
    X = df[CATEGORICAL_FEATURES + NUMERICAL_FEATURES]
    y = df[TARGET]
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    preprocessor = build_preprocessor()
    
    models = {
        'Logistic Regression': LogisticRegression(max_iter=1000, random_state=42),
        'Random Forest': RandomForestClassifier(n_estimators=150, max_depth=12, random_state=42, n_jobs=-1),
        'Gradient Boosting': GradientBoostingClassifier(n_estimators=120, learning_rate=0.08, max_depth=5, random_state=42)
    }
    
    evaluation_results = {}
    best_model_name = None
    best_f1 = -1.0
    best_pipeline = None
    
    print("\n--- Model Training & Cross-Validation ---")
    for name, clf in models.items():
        pipe = Pipeline([
            ('preprocessor', preprocessor),
            ('classifier', clf)
        ])
        
        # 5-fold cross validation
        cv_scores = cross_val_score(pipe, X_train, y_train, cv=5, scoring='f1')
        pipe.fit(X_train, y_train)
        
        y_pred = pipe.predict(X_test)
        y_prob = pipe.predict_proba(X_test)[:, 1]
        
        acc = accuracy_score(y_test, y_pred)
        prec = precision_score(y_test, y_pred)
        rec = recall_score(y_test, y_pred)
        f1 = f1_score(y_test, y_pred)
        auc = roc_auc_score(y_test, y_prob)
        cm = confusion_matrix(y_test, y_pred).tolist()
        
        evaluation_results[name] = {
            'cv_f1_mean': round(float(np.mean(cv_scores)), 4),
            'cv_f1_std': round(float(np.std(cv_scores)), 4),
            'test_accuracy': round(float(acc), 4),
            'test_precision': round(float(prec), 4),
            'test_recall': round(float(rec), 4),
            'test_f1': round(float(f1), 4),
            'test_roc_auc': round(float(auc), 4),
            'confusion_matrix': cm
        }
        
        print(f"[{name}] Test Accuracy: {acc:.4f} | F1-Score: {f1:.4f} | ROC-AUC: {auc:.4f}")
        
        if f1 > best_f1:
            best_f1 = f1
            best_model_name = name
            best_pipeline = pipe
            
    print(f"\nBest Performing Model: {best_model_name} (F1 = {best_f1:.4f})")
    
    # Extract Feature Importances from best model
    feature_importances = []
    try:
        ohe = best_pipeline.named_steps['preprocessor'].named_transformers_['cat'].named_steps['onehot']
        cat_feature_names = ohe.get_feature_names_out(CATEGORICAL_FEATURES).tolist()
        all_feature_names = cat_feature_names + NUMERICAL_FEATURES
        
        clf = best_pipeline.named_steps['classifier']
        if hasattr(clf, 'feature_importances_'):
            importances = clf.feature_importances_
            feat_imp_pairs = sorted(zip(all_feature_names, importances), key=lambda x: x[1], reverse=True)
            feature_importances = [
                {'feature': f, 'importance': round(float(imp), 5)}
                for f, imp in feat_imp_pairs
            ]
        elif hasattr(clf, 'coef_'):
            coefs = clf.coef_[0]
            feat_imp_pairs = sorted(zip(all_feature_names, np.abs(coefs)), key=lambda x: x[1], reverse=True)
            feature_importances = [
                {'feature': f, 'importance': round(float(imp), 5)}
                for f, imp in feat_imp_pairs
            ]
    except Exception as e:
        print(f"Notice during feature importance extraction: {e}")
        
    os.makedirs(models_dir, exist_ok=True)
    model_save_path = os.path.join(models_dir, "campaign_success_model.joblib")
    metadata_save_path = os.path.join(models_dir, "model_metadata.json")
    
    # Save the pipeline
    joblib.dump(best_pipeline, model_save_path)
    print(f"Saved best pipeline model to {model_save_path}")
    
    # Save metadata
    metadata = {
        'best_model': best_model_name,
        'evaluation_results': evaluation_results,
        'feature_importances_top20': feature_importances[:20],
        'categorical_features': CATEGORICAL_FEATURES,
        'numerical_features': NUMERICAL_FEATURES,
        'total_training_samples': len(X_train),
        'total_test_samples': len(X_test)
    }
    
    with open(metadata_save_path, 'w') as f:
        json.dump(metadata, f, indent=2)
    print(f"Saved model metadata to {metadata_save_path}")
    
    return metadata


if __name__ == '__main__':
    train_and_evaluate_models()
