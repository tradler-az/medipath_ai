"""
MediPATH AI — Flask Backend (Exact Notebook Match)
"""

import ast
import warnings
import numpy as np
import pandas as pd
from collections import defaultdict
from itertools import combinations
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
import sqlite3
import os
import json

warnings.filterwarnings("ignore")
app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = 'medi-path-super-secret-2024-change-in-prod!'
jwt = JWTManager(app)
CORS(app)


# SQLite DB
DB_PATH = 'patients.db'

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

# Demo users (hash: demo123)
DEMO_USERS = {
    'demo': generate_password_hash('demo123'),
    'reception': generate_password_hash('demo123'),
    'lab': generate_password_hash('demo123'),
    'consultant': generate_password_hash('demo123'),
    'pharmacy': generate_password_hash('demo123'),
    'admin': generate_password_hash('demo123'),
}

# Load CSV data (legacy)
patient_data = pd.read_csv('patient_records.csv')
disease_data = pd.read_csv('Diseases_Symptoms.csv')
pattern      = pd.read_csv('pattern.csv')

patient_data = patient_data.head(1000)

def parse_conditions(val):
    try:
        result = ast.literal_eval(str(val))
        return result if isinstance(result, list) else [str(val).strip()]
    except Exception:
        if isinstance(val, str) and val.strip() not in ('', 'nan'):
            return [v.strip() for v in val.split(',')]
        return []

patient_data['_conditions'] = patient_data['Medical Condition'].apply(parse_conditions)
patient_data['PatientID']   = patient_data['PatientID'].str.strip().str.upper()

print("\n" + "="*70)
print("NOTEBOOK PARSER RESULTS:")
print("="*70)
print(f"Total patients: {len(patient_data)}")
print(f"Avg conditions per patient: {patient_data['_conditions'].apply(len).mean():.1f}")
print(f"Patients with <3 conditions: {(patient_data['_conditions'].apply(len) < 3).sum()}")
print(f"Patients with >=3 conditions: {(patient_data['_conditions'].apply(len) >= 3).sum()}")
print("\nFirst 5 patients:")
for idx in range(min(5, len(patient_data))):
    row = patient_data.iloc[idx]
    print(f"  {row['PatientID']}: {row['_conditions']} ({len(row['_conditions'])} conditions)")
print("="*70 + "\n")


#  BUILD CONDITION-PAIR FREQUENCY TABLE  (NO len guard — matches notebook)

NON_DISEASE_OUTCOMES = {
    'Condition managed — monitoring only',
    'Palliative care recommended',
    'End of disease trajectory',
    'Stable — no progression expected',
    'Remission achieved',
    'End of trajectory',
}

pair_next_counts = defaultdict(lambda: defaultdict(float))

for _, record in patient_data.iterrows():
    conds  = record['_conditions']
    next_d = str(record.get('Predicted_Next_Disease', '')).strip()
    if not next_d or next_d in ('nan', '') or next_d in NON_DISEASE_OUTCOMES:
        continue
    # NO "if len(conds) >= 2" guard here — identical to notebook
    for pair in combinations(sorted(conds), 2):
        pair_next_counts[pair][next_d] += 1.0


#  BUILD PROGRESSION CHAIN STRUCTURES

chain_sequences = {
    name: grp.sort_values('Step_Number')['Disease_At_This_Step'].tolist()
    for name, grp in pattern.groupby('Chain_Name')
}

chain_lookup = (
    pattern[[
        'Disease_At_This_Step', 'Chain_Name', 'Step_Number',
        'Total_Steps_In_Chain', 'Avg_Years_To_Next_Disease',
        'Next_Disease_In_Progression', 'Key_Risk_Factors', 'Is_Last_Disease'
    ]]
    .drop_duplicates(subset='Disease_At_This_Step')
    .set_index('Disease_At_This_Step')
)

CLINICAL_RULES = {
    'Chronic Kidney Disease'    : ['Kidney Failure', 'Anemia due to Chronic Kidney Disease', 'Hypertension'],
    'Diabetic Kidney Disease'   : ['Chronic Kidney Disease', 'Kidney Failure'],
    'Obesity'                   : ['Type 2 Diabetes', 'Hypertension', 'Hypertensive Heart Disease'],
    'Type 2 Diabetes'           : ['Diabetic Kidney Disease', 'Diabetic retinopathy', 'Neuropathic Pain'],
    'Hypertension'              : ['Hypertensive Heart Disease', 'Stroke', 'Heart Block'],
    'Hypertensive Heart Disease': ['Heart Block', 'Atrial Fibrillation'],
    'Atrial Fibrillation'       : ['Stroke', 'Pulmonary Congestion'],
    'Depression'                : ['Chronic Fatigue Syndrome', 'Primary Insomnia'],
    'Osteoporosis'              : ['Fracture', 'Fracture of the Shoulder'],
    'Rheumatoid Arthritis'      : ['Osteoporosis', 'Arthritis'],
    'Lupus'                     : ['Chronic Kidney Disease', 'Anemia of Chronic Disease'],
    'Asthma'                    : ['Emphysema', 'Atelectasis'],
    'Cirrhosis'                 : ['Esophageal Varices', 'Liver Cancer', 'Hepatic Encephalopathy'],
    'Psoriasis'                 : ['Arthritis', 'Lymphoma'],
    'Fibromyalgia'              : ['Chronic Fatigue Syndrome', 'Primary Insomnia', 'Neuralgia'],
}


#  STEP 1 — PROGRESSION CHAIN MATCHING

def find_patient_chain(conditions_list):
    if len(conditions_list) < 2:
        return None

    cond_set     = set(conditions_list)
    best_chain   = None
    best_score   = (-1, -1)
    best_disease = None

    for chain_name, sequence in chain_sequences.items():
        overlap = len(cond_set & set(sequence))
        if overlap < 2:
            continue

        furthest_step    = -1
        furthest_disease = None
        for disease in conditions_list:
            if disease not in chain_lookup.index:
                continue
            entry = chain_lookup.loc[disease]
            if entry['Chain_Name'] != chain_name:
                continue
            step = int(entry['Step_Number'])
            if step > furthest_step:
                furthest_step    = step
                furthest_disease = disease

        if furthest_disease is None:
            continue

        score = (overlap, furthest_step)
        if score > best_score:
            best_score   = score
            best_disease = furthest_disease
            best_chain   = chain_name

    if best_chain is None:
        return None

    entry = chain_lookup.loc[best_disease]
    try:
        avg_years = float(entry['Avg_Years_To_Next_Disease'])
    except Exception:
        avg_years = 0.0

    next_disease = str(entry['Next_Disease_In_Progression']).strip()
    is_end = (
        str(entry['Is_Last_Disease']).strip().lower() == 'yes'
        or next_disease in ('', 'nan', 'End of trajectory')
    )

    return {
        'chain_name'   : entry['Chain_Name'],
        'current'      : best_disease,
        'step'         : int(entry['Step_Number']),
        'total_steps'  : int(entry['Total_Steps_In_Chain']),
        'next_disease' : next_disease if not is_end else None,
        'years_to_next': avg_years,
        'is_end'       : is_end,
        'overlap'      : best_score[0],
        'risk_factors' : str(entry.get('Key_Risk_Factors', '')),
    }


#  STEP 2 — SIMILAR PATIENT LOOKUP

def find_similar_patients(conditions, age=None, bmi=None):
    cond_set = set(conditions)
    strong   = {}
    moderate = {}

    for _, record in patient_data.iterrows():
        other_conds = set(record['_conditions'])
        overlap     = len(cond_set & other_conds)
        if overlap == 0:
            continue

        next_d = str(record.get('Predicted_Next_Disease', '')).strip()
        if not next_d or next_d in NON_DISEASE_OUTCOMES or next_d in ('nan', '', 'End of trajectory'):
            continue

        union   = len(cond_set | other_conds)
        jaccard = overlap / union if union else 0

        similarity_bonus = 0.0
        try:
            rec_age = float(record.get('Age', 0) or 0)
            rec_bmi = float(record.get('BMI', 0) or 0)
            if age and rec_age:
                similarity_bonus += 0.15 * max(0, 1 - abs(age - rec_age) / 40)
            if bmi and rec_bmi:
                similarity_bonus += 0.15 * max(0, 1 - abs(bmi - rec_bmi) / 20)
        except Exception:
            pass

        score = jaccard + similarity_bonus

        if overlap >= 2:
            strong[next_d]   = strong.get(next_d, 0.0) + score
        else:
            moderate[next_d] = moderate.get(next_d, 0.0) + score * 0.5

    combined = dict(strong)
    for disease, score in moderate.items():
        if disease not in combined:
            combined[disease] = score
        else:
            combined[disease] += score * 0.3

    # Amplify using condition-pair frequency table (NO len guard — matches notebook)
    pair_votes = defaultdict(float)
    for pair in combinations(sorted(cond_set), 2):
        if pair in pair_next_counts:
            for disease, count in pair_next_counts[pair].items():
                pair_votes[disease] += count

    if pair_votes:
        max_votes = max(pair_votes.values())
        for disease, votes in pair_votes.items():
            combined[disease] = combined.get(disease, 0.0) + (votes / max_votes) * 1.5

    # Fallback: age/BMI range
    if age and bmi and (not combined or max(combined.values(), default=0) < 0.5):
        for _, record in patient_data.iterrows():
            try:
                rec_age = float(record.get('Age', 0) or 0)
                rec_bmi = float(record.get('BMI', 0) or 0)
            except Exception:
                continue
            if abs(rec_age - age) > 10 or abs(rec_bmi - bmi) > 5:
                continue
            next_d = str(record.get('Predicted_Next_Disease', '')).strip()
            if not next_d or next_d in NON_DISEASE_OUTCOMES or next_d in ('nan', '', 'End of trajectory'):
                continue
            combined[next_d] = combined.get(next_d, 0.0) + 0.1

    return combined


#  STEP 3 — CLINICAL RULES

def apply_clinical_rules(conditions, age, bmi):
    cond_set = set(conditions)
    scores   = {}

    for condition, likely_next in CLINICAL_RULES.items():
        if condition in cond_set:
            for disease in likely_next:
                if disease not in cond_set:
                    scores[disease] = scores.get(disease, 0.0) + 10.0

    if age and age > 65:
        for disease in ['Stroke', 'Atrial Fibrillation', 'Osteoporosis', 'Macular Degeneration']:
            scores[disease] = scores.get(disease, 0.0) + 8.0
    elif age and age > 50:
        for disease in ['Type 2 Diabetes', 'Hypertension', 'Diabetic retinopathy']:
            scores[disease] = scores.get(disease, 0.0) + 4.0

    if bmi and bmi >= 35:
        for disease in ['Type 2 Diabetes', 'Hypertensive Heart Disease', 'Heart Block']:
            scores[disease] = scores.get(disease, 0.0) + 7.0
    elif bmi and bmi >= 30:
        for disease in ['Type 2 Diabetes', 'Hypertension']:
            scores[disease] = scores.get(disease, 0.0) + 4.0

    return scores


#  COMBINE ALL SIGNALS AND RANK

def scale_to_one(scores):
    if not scores:
        return {}
    lo, hi = min(scores.values()), max(scores.values())
    if hi == lo:
        return {k: 1.0 for k in scores}
    return {k: (v - lo) / (hi - lo) for k, v in scores.items()}


def rank_predictions(chain_match, similar_patient_scores, rule_scores, current_conditions):
    chain_scores = {}
    if chain_match and chain_match['next_disease']:
        chain_scores[chain_match['next_disease']] = 1.0

    chain_scaled  = scale_to_one(chain_scores)
    cohort_scaled = scale_to_one(similar_patient_scores)
    rules_scaled  = scale_to_one(rule_scores)

    if chain_match and chain_match['next_disease']:
        w_chain, w_cohort, w_rules = 0.50, 0.35, 0.15
    else:
        w_chain, w_cohort, w_rules = 0.00, 0.70, 0.30

    all_candidates = set(chain_scaled) | set(cohort_scaled) | set(rules_scaled)
    final_scores   = {}

    for disease in all_candidates:
        if disease in current_conditions:
            continue
        score = (
            w_chain  * chain_scaled.get(disease, 0)
            + w_cohort * cohort_scaled.get(disease, 0)
            + w_rules  * rules_scaled.get(disease, 0)
        )
        if score > 0:
            final_scores[disease] = score

    if not final_scores:
        return []

    top5          = sorted(final_scores.items(), key=lambda x: x[1], reverse=True)[:5]
    diseases      = [d for d, _ in top5]
    values        = np.array([v for _, v in top5])
    exp_vals      = np.exp((values - values.max()) / 0.15)
    probabilities = exp_vals / exp_vals.sum()

    return sorted(zip(diseases, probabilities), key=lambda x: x[1], reverse=True)


#  MODEL EVALUATION METRICS

def compute_model_metrics(sample_size=300):
    eligible = patient_data[
        patient_data['_conditions'].apply(len) >= 3
    ].copy()

    eligible = eligible[
        eligible['Predicted_Next_Disease'].notna() &
        (~eligible['Predicted_Next_Disease'].astype(str).str.strip().isin(
            NON_DISEASE_OUTCOMES | {'', 'nan', 'End of trajectory'}
        ))
    ]

    total = len(eligible)
    if total == 0:
        return None

    sample = eligible.sample(n=min(sample_size, total), random_state=42)

    correct   = 0
    top3_hit  = 0
    predicted = 0

    for _, record in sample.iterrows():
        actual     = str(record['Predicted_Next_Disease']).strip()
        conditions = record['_conditions']
        age        = record.get('Age')
        bmi        = record.get('BMI')

        chain_match    = find_patient_chain(conditions)
        similar_scores = find_similar_patients(conditions, age, bmi)
        rule_scores    = apply_clinical_rules(conditions, age, bmi)
        predictions    = rank_predictions(chain_match, similar_scores, rule_scores, set(conditions))

        if not predictions:
            continue

        predicted += 1
        top_names = [d for d, _ in predictions[:3]]

        if top_names[0] == actual:
            correct  += 1
            top3_hit += 1
        elif actual in top_names:
            top3_hit += 1

    accuracy      = (correct  / predicted * 100) if predicted else 0.0
    top3_accuracy = (top3_hit / predicted * 100) if predicted else 0.0
    coverage      = (predicted / len(sample) * 100) if len(sample) else 0.0

    return {
        'accuracy'      : accuracy,
        'top3_accuracy' : top3_accuracy,
        'coverage'      : coverage,
        'total_eligible': total,
        'sample_size'   : len(sample),
        'predicted'     : predicted,
        'correct'       : correct,
        'top3_hit'      : top3_hit,
    }

print("\n" + "="*70)
print("MediPATH AI - Computing Model Metrics...")
print("="*70)
model_metrics = compute_model_metrics()
if model_metrics:
    print(f"Top-1 Accuracy: {model_metrics['accuracy']:.1f}%")
    print(f"Top-3 Accuracy: {model_metrics['top3_accuracy']:.1f}%")
    print(f"Coverage: {model_metrics['coverage']:.1f}%")
    print(f"Eligible patients: {model_metrics['total_eligible']}")
else:
    print("Not enough labelled data for metrics")
print("="*70 + "\n")


#  API ROUTES


@app.route('/predict', methods=['GET'])
def predict():
    pid = request.args.get('patient_id', '').strip().upper()
    if not pid:
        return jsonify({'error': 'patient_id is required'}), 400

    row = patient_data[patient_data['PatientID'] == pid]
    if row.empty:
        similar = patient_data[patient_data['PatientID'].str.contains(pid[:3], na=False)]
        suggestions = similar['PatientID'].head(5).tolist() if not similar.empty else []
        return jsonify({
            'error'         : f"Patient '{pid}' not found",
            'suggestions'   : suggestions,
            'first_10_ids'  : patient_data['PatientID'].head(10).tolist()
        }), 404

    record     = row.iloc[0]
    conditions = record['_conditions']

    try:
        age = float(record.get('Age')) if record.get('Age') and str(record.get('Age')) != 'nan' else None
    except Exception:
        age = None
    try:
        bmi = float(record.get('BMI')) if record.get('BMI') and str(record.get('BMI')) != 'nan' else None
    except Exception:
        bmi = None

    # Base patient info always returned
    response_data = {
        'patient_id'     : pid,
        'name'           : str(record.get('Name', pid)).title(),
        'age'            : age,
        'bmi'            : bmi,
        'conditions'     : conditions,
        'condition_count': len(conditions),
    }

    # Not enough conditions — return info but flag it, same as notebook
    if len(conditions) < 3:
        response_data.update({
            'insufficient_data' : True,
            'warning'           : f"{response_data['name']} currently has {len(conditions)} condition(s) on record.",
            'message'           : "At least 3 conditions are needed before a prediction can be made.",
            'recommendation'    : "Please schedule a comprehensive medical check-up to identify more conditions.",
            'actions'           : [
                "🏥 Complete a full physical examination",
                "🩺 Get routine blood work and diagnostic tests",
                "📋 Update medical history with new symptoms",
                "🔍 Consider specialist consultations",
                "📅 Return for prediction after gathering more data"
            ],
            'predictions'       : [],
            'chain_match'       : None,
        })
        return jsonify(response_data)

    # Run all three engines — identical to notebook
    chain_match    = find_patient_chain(conditions)
    similar_scores = find_similar_patients(conditions, age, bmi)
    rule_scores    = apply_clinical_rules(conditions, age, bmi)
    predictions    = rank_predictions(chain_match, similar_scores, rule_scores, set(conditions))

    response_data['chain_match']           = chain_match
    response_data['similar_patients_count'] = len(similar_scores)
    response_data['predictions']           = []

    # Progression path — mirrors notebook print block exactly
    if chain_match:
        if chain_match['is_end']:
            response_data['progression_label'] = "end of known progression"
        else:
            response_data['progression_label'] = (
                f"{chain_match['next_disease']} "
                f"(expected in ~{chain_match['years_to_next']:.1f} years)"
            )
        response_data['progression_path']  = chain_match['chain_name']
        response_data['current_stage']     = f"Step {chain_match['step']} of {chain_match['total_steps']}"
        rf = chain_match.get('risk_factors', '')
        if rf and rf not in ('', 'nan', 'None'):
            response_data['risk_factors'] = rf
    else:
        response_data['progression_path']  = "No matching chain found for this condition combination."
        response_data['prediction_basis']  = "Prediction based on similar patients and clinical evidence."

    # Predictions with reasons — mirrors notebook output exactly
    for rank, (disease, probability) in enumerate(predictions[:3], 1):
        reasons = []
        if chain_match and chain_match.get('next_disease') == disease:
            reasons.append(f"follows the known progression: {chain_match['chain_name']}")
        if disease in similar_scores:
            reasons.append("commonly developed by patients with the same conditions")
        for condition, next_diseases in CLINICAL_RULES.items():
            if condition in set(conditions) and disease in next_diseases:
                reasons.append(f"medical evidence links {condition} to {disease}")
                break

        response_data['predictions'].append({
            'rank'           : rank,
            'disease'        : disease,
            'probability'    : round(float(probability) * 100, 1),
            'reasons'        : reasons,
            'is_highest_risk': rank == 1,
        })

    if response_data['predictions']:
        response_data['top_prediction_reason'] = ' | '.join(response_data['predictions'][0]['reasons'])

    return jsonify(response_data)


@app.route('/metrics', methods=['GET'])
def get_metrics():
    if model_metrics:
        return jsonify({
            'accuracy'            : round(model_metrics['accuracy'], 1),
            'top3_accuracy'       : round(model_metrics['top3_accuracy'], 1),
            'coverage'            : round(model_metrics['coverage'], 1),
            'total_eligible'      : model_metrics['total_eligible'],
            'sample_size'         : model_metrics['sample_size'],
            'predictions_generated': model_metrics['predicted'],
            'exact_matches'       : model_metrics['correct'],
            'top3_hits'           : model_metrics['top3_hit'],
        })
    return jsonify({'error': 'Not enough labelled data to evaluate metrics'}), 404


@app.route('/health', methods=['GET'])
def health():
    sample_patient = None
    if len(patient_data) > 0:
        s = patient_data.iloc[0]
        sample_patient = {
            'id'        : s['PatientID'],
            'conditions': s['_conditions'],
            'count'     : len(s['_conditions']),
        }
    return jsonify({
        'status'              : 'healthy',
        'total_patients'      : len(patient_data),
        'patients_with_3_plus': int((patient_data['_conditions'].apply(len) >= 3).sum()),
        'progression_chains'  : len(chain_sequences),
        'sample_patient'      : sample_patient,
        'metrics_available'   : model_metrics is not None,
    })


if __name__ == '__main__':
    W = 70
    print("\n" + "="*W)
    print("  MediPATH AI API Server - Exact Notebook Match")
    print("="*W)
    print(f"  Server:  http://localhost:5000")
    print(f"  Health:  http://localhost:5000/health")
    print(f"  Metrics: http://localhost:5000/metrics")
    print(f"  Predict: http://localhost:5000/predict?patient_id=P00020")
    print(f"\n  NOTE: Patients need 3+ conditions for predictions (matches notebook)")
    print("="*W + "\n")
    app.run(debug=True, port=5000)