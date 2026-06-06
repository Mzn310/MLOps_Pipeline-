import matplotlib
matplotlib.use('Agg')

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import io
import matplotlib.pyplot as plt
from wordcloud import WordCloud
import mlflow
import numpy as np
import re
import pandas as pd
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from mlflow.tracking import MlflowClient
import matplotlib.dates as mdates
import pickle

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes


def preprocess_comment(comment):
    """Preprocess a single comment."""
    try:
        comment = comment.lower()
        comment = comment.strip()
        comment = re.sub(r'\n', ' ', comment)
        comment = re.sub(r'[^A-Za-z0-9\s!?.,]', '', comment)

        stop_words = set(stopwords.words('english')) - {"not", "but", "however", "no", "yet"}
        comment = ' '.join([w for w in comment.split() if w not in stop_words])

        lemmatizer = WordNetLemmatizer()
        comment = ' '.join([lemmatizer.lemmatize(w) for w in comment.split()])
        return comment
    except Exception as e:
        print(f"Preprocessing error: {e}")
        return comment


def load_model(model_path, vectorizer_path):
    """Load trained model and vectorizer from disk."""
    try:
        with open(model_path, 'rb') as f:
            model = pickle.load(f)
        with open(vectorizer_path, 'rb') as f:
            vectorizer = pickle.load(f)
        return model, vectorizer
    except Exception as e:
        print(f"Error loading model: {e}")
        return None, None


model, vectorizer = load_model("model.pkl", "tfidf_vectorizer.pkl")


@app.route('/')
def home():
    return "Social Sentiment Analyzer API — YouTube, Facebook, Twitter/X"


@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    comments = data.get('comments')

    if not comments:
        return jsonify({'error': 'No comment provided'}), 400

    try:
        preprocessed = [preprocess_comment(c) for c in comments]
        transformed = vectorizer.transform(preprocessed).toarray()
        predictions = model.predict(transformed).tolist()
    except Exception as e:
        print(f"Prediction error: {e}")
        return jsonify({'error': 'An error occurred during prediction'}), 500

    return jsonify([
        {'comment': comment, 'sentiment': int(sentiment)}
        for comment, sentiment in zip(comments, predictions)
    ])


# ── /analyze_video — used by the browser extension ───────────────────────────
@app.route('/analyze_video', methods=['POST'])
def analyze_video():
    data = request.json
    comments = data.get('comments', [])

    if not comments:
        return jsonify({'error': 'No comments provided'}), 400

    try:
        # Filter out very short / empty strings
        comments = [c for c in comments if c and len(c.strip()) >= 3]

        if not comments:
            return jsonify({'error': 'All comments were too short to analyze'}), 400

        preprocessed = [preprocess_comment(c) for c in comments]
        transformed = vectorizer.transform(preprocessed).toarray()
        predictions = model.predict(transformed).tolist()

        results = [
            {'comment': c, 'sentiment': int(s)}
            for c, s in zip(comments, predictions)
        ]

        total = len(results)
        positive = sum(1 for r in results if r['sentiment'] == 1)
        negative = total - positive

        return jsonify({
            'results': results,
            'summary': {
                'total': total,
                'positive': positive,
                'negative': negative,
                'positive_pct': round(positive / total * 100, 1) if total > 0 else 0,
            },
            'platform': data.get('platform', 'unknown'),
        })

    except Exception as e:
        print(f"analyze_video error: {e}")
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True)