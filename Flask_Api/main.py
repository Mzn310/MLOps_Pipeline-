import matplotlib
matplotlib.use('Agg') # Use non-interactive backend before importing pyplot

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

app= Flask(__name__)
CORS(app) # Enable CORS for all routes


def preprocess_comment(comment):
    """"Preprocess the comment"""
    try:
        # Convert to lowercase
        comment = comment.lower()
  
        # Remove trailing and leading whitespace
        comment = comment.strip()

        # Remove newlines characters
        comment = re.sub(r'\n', ' ', comment)

        # Remove non-alphanumeric characters, except punctuation
        comment = re.sub(r'[^A-Za-z0-9\s!?.,]', '', comment)

        # Remove stops words
        stop_words = set(stopwords.words('english'))-{"not","but","however","no","yet"}
        comment = ' '.join([word for word in comment.split() if word not in stop_words])

        # Lemmatize the words
        lemmatizer = WordNetLemmatizer()
        comment = ' '.join([lemmatizer.lemmatize(word) for word in comment.split()])

        return comment
    
    except Exception as e:
        print(f"Error occurred while preprocessing comment: {e}")
        return comment
    
# Load the model and vectorizer from the model registry and local storage
def load_model_and_vectorizer(model_name, model_version, vectorizer_path):
    # Set MLflow tracking URI to your server
    mlflow.set_tracking_uri("http://ec2-52-204-122-132.compute-1.amazonaws.com:5000/")
    client= MlflowClient()
    model_uri= f"models:/{model_name}/{model_version}"
    model= mlflow.sklearn.load_model(model_uri)
    with open(vectorizer_path, 'rb') as file:
        vectorizer= pickle.load(file)
    return model, vectorizer

def load_model(model_path, vectorizer_path):
    """"Load the trained model"""
    try:
        with open(model_path, 'rb') as file:
            model = pickle.load(file)
        with open(vectorizer_path, 'rb') as file:
            vectorizer = pickle.load(file)
        return model, vectorizer
    except Exception as e:
        print(f"Error occurred while loading model and vectorizer: {e}")
        return None, None
    
# Initialize the model and vectorizer
model, vectorizer = load_model("model.pkl","tfidf_vectorizer.pkl")

@app.route('/')
def home():
    return "Welcome to our flask api"

@app.route('/predict', methods=['POST'])
def predict():
    data=request.json
    comments=data.get('comments')
    print('i am the comment:',comments)
    print('i am the type of comment:',type(comments)) 

    if not comments:
        return jsonify({'error': 'No comment provided'}), 400
    
    try:
        # Preprocess the comment
        preprocessed_comment = [preprocess_comment(comment) for comment in comments]

        # Transform comments using the vectorize
        transformed_comments = vectorizer.transform(preprocessed_comment)

        # Convert the sparse matrix to a dense array
        dense_comments = transformed_comments.toarray()

        # Make predictions
        predictions = model.predict(dense_comments).tolist()

    except Exception as e:
        print(f"Error occurred during prediction: {e}")
        return jsonify({'error': 'An error occurred during prediction'}), 500
    
    # Return the response with origin comments and predicted sentiments
    return jsonify([{'comment': comment, "sentiment": sentiment} for comment, sentiment in zip(comments, predictions)])

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000,debug=True)