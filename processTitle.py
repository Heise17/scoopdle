import pandas as pd
from spellchecker import SpellChecker
import spacy
from spacy.matcher import Matcher

reveal_words = pd.read_csv('revealWords.txt')['RevealWords'].to_list()
state_list = pd.read_csv('states.txt')['States'].to_list()

speller = SpellChecker()
nlp = spacy.load("en_core_web_sm")

# Extract title string from DB
def get_title(app):
    from main import title
    with app.app_context():
        tt = title.query.order_by(-title.id).first()
    return tt.title


def extract_words(app, doc):
    titleWords = []
    for wordNum, word in enumerate(doc):
        titleWords.append(
            [wordNum, word.text, len(word.text), word.pos_, False])
    return titleWords


def post_words(db, app, word_list):
    from main import words
    with app.app_context():
        words.query.delete()
        for word in word_list:
            wordDB = words(
                id=word[0],  word=word[1], num_letters=word[2], pos=word[3], auto_revealed=word[4])
            db.session.add(wordDB)
        db.session.commit()

# Adds non-dictionary words, any strings containing numbers, and capitalized words to the reveal_words list and sets auto_revealed flag to true for that word
def reveal_proper(app, word_list, doc):
    noun_phrases = [chunk.text for chunk in doc.noun_chunks]
    verbs = [token for token in doc if token.pos_ == "VERB"]
    print("Noun phrases:", noun_phrases)
    print("Verbs:", verbs)
    for word in word_list:
        if word[3] in ["PROPN", "PUNCT", "NUM", "AUX"]:
            # will be a future issue where reveal_words keeps growing
            reveal_words.append(word[1])
        lower = word[1].casefold()
        if lower != speller.correction(lower) or any(char.isdigit() for char in lower) or word[1][:1] != word[1][:1].casefold():
            reveal_words.append(word[1])
        noun_phrases = [chunk.text for chunk in doc.noun_chunks]
    for phrase in noun_phrases:
        for word in phrase.split():
            if any(word == w for w in state_list):
                reveal_words.extend(phrase.split())
    for wordNum in range(len(word_list)):
        wordLength = len(word_list[wordNum][1])
        if word_list[wordNum][1].casefold() in [w.casefold() for w in reveal_words]:
            word_list[wordNum][4] = True

# Chooses a title and populates titleWords
def init_title(db, app):
    title_string = get_title(app)
    doc = nlp(title_string)
    title_words = extract_words(app, doc)
    reveal_proper(app, title_words, doc)
    post_words(db, app, title_words)
