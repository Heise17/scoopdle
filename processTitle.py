import pandas as pd
from spellchecker import SpellChecker
import spacy
from spacy.matcher import Matcher

# read reveal words and states from files
reveal_words = pd.read_csv('revealWords.txt')['RevealWords'].to_list()
state_list = pd.read_csv('states.txt')['States'].to_list()

# initialize spell checker and natural language processing instances
speller = SpellChecker()
nlp = spacy.load("en_core_web_sm")

# Extract title string from DB
def get_title(app, postDate):
    from main import title
    with app.app_context():
        tt = title.query.filter_by(date=postDate).one()
    return tt.title

# extracts words from nlp output to list
def extract_words(doc):
    titleWords = []
    for wordNum, word in enumerate(doc):
        titleWords.append(
            [wordNum, word.text, len(word.text), word.pos_, False])
    return titleWords

# posts words and word info to database
def post_words(db, app, word_list, postDate):
    from main import words
    with app.app_context():
        for word in word_list:
            wordDB = words(
                word_num=word[0]+1,  word=word[1], num_letters=word[2], pos=word[3], auto_revealed=word[4], date=postDate)
            db.session.add(wordDB)
        db.session.commit()

# adds non-dictionary words, any strings containing numbers, and capitalized words to the reveal_words list and sets auto_revealed flag to true for that word
def reveal_proper(word_list, doc):
    noun_phrases = [chunk.text for chunk in doc.noun_chunks]
    verbs = [token for token in doc if token.pos_ == "VERB"]
    for word in word_list:
        if word[3] in ["PROPN", "PUNCT", "NUM", "AUX", "SYM"]:
            # will be a future issue where reveal_words keeps growing
            reveal_words.append(word[1])
        lower = word[1].casefold()
        if lower != speller.correction(lower) or any(char.isdigit() for char in lower) or (word[1][:1] != word[1][:1].casefold() and word[0] != 0):
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

# analyzes and activates title from database
def init_title(db, app, postDate):
    title_string = get_title(app, postDate)
    doc = nlp(title_string)
    title_words = extract_words(doc)
    reveal_proper(title_words, doc)
    post_words(db, app, title_words, postDate)
