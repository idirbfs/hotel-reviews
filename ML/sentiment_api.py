from flask import Flask, request, jsonify
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

app = Flask(__name__)

def analyze_sentiment(sentence):
    analyzer = SentimentIntensityAnalyzer()
    sentiment_scores = analyzer.polarity_scores(sentence)

    # The compound score is a metric that represents the overall sentiment
    compound_score = sentiment_scores['compound']

    # Classify the sentiment based on the compound score
    if compound_score >= 0.05:
        return 'Positive'
    elif compound_score <= -0.05:
        return 'Negative'
    else:
        return 'Neutral'

@app.route('/analyze_sentiment', methods=['POST'])
def analyze_sentiment_route():
    data = request.get_json()
    sentence = data.get('sentence', '')
    sentiment = analyze_sentiment(sentence)
    return jsonify({'sentiment': sentiment})

if __name__ == "__main__":
    app.run(debug=True)
