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