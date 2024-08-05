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

#count number of each letter in the words
def count_letters(doc):
    letter_counts = []
    for word in doc:
        word_letters = {"a":0, "b":0, "c":0, "d":0, "e":0, "f":0, "g":0, "h":0, "i":0, "j":0, "k":0, "l":0, "m":0, "n":0, "o":0, "p":0, "q":0, "r":0, "s":0, "t":0, "u":0, "v":0, "w":0, "x":0, "y":0, "z":0}
        for letter in word_letters:
            word_letters[letter] = word.text.casefold().count(letter)
        letter_counts.append(word_letters)
    return letter_counts

# posts words and word info to database
def post_words(doc, db, app, word_list, postDate):
    from main import words
    letter_counts = count_letters(doc)
    with app.app_context():
        for wordNum, word in enumerate(word_list):
            wordDB = words(
                word_num=word[0],  
                word=word[1], 
                num_letters=word[2], 
                pos=word[3], 
                auto_revealed=word[4], 
                date=postDate, 
                a=letter_counts[wordNum]["a"], 
                b=letter_counts[wordNum]["b"], 
                c=letter_counts[wordNum]["c"], 
                d=letter_counts[wordNum]["d"], 
                e=letter_counts[wordNum]["e"], 
                f=letter_counts[wordNum]["f"], 
                g=letter_counts[wordNum]["g"], 
                h=letter_counts[wordNum]["h"],
                i=letter_counts[wordNum]["i"],
                j=letter_counts[wordNum]["j"],
                k=letter_counts[wordNum]["k"],
                l=letter_counts[wordNum]["l"],
                m=letter_counts[wordNum]["m"],
                n=letter_counts[wordNum]["n"],
                o=letter_counts[wordNum]["o"],
                p=letter_counts[wordNum]["p"],
                q=letter_counts[wordNum]["q"],
                r=letter_counts[wordNum]["r"],
                s=letter_counts[wordNum]["s"],
                t=letter_counts[wordNum]["t"],
                u=letter_counts[wordNum]["u"],
                v=letter_counts[wordNum]["v"],
                w=letter_counts[wordNum]["w"],
                x=letter_counts[wordNum]["x"],
                y=letter_counts[wordNum]["y"],
                z=letter_counts[wordNum]["z"])
            db.session.add(wordDB)
        db.session.commit()

# adds non-dictionary words, any strings containing numbers, and capitalized words to the reveal_words list and sets auto_revealed flag to true for that word


def reveal_proper(word_list, doc):
    noun_phrases = [chunk.text for chunk in doc.noun_chunks]
    # verbs = [token for token in doc if token.pos_ == "VERB"]
    for word in word_list:
        if word[3] in ["PROPN", "PUNCT", "NUM", "AUX", "SYM"]:
            # will be a future issue where reveal_words keeps growing
            reveal_words.append(word[1])
        lower = word[1].casefold()
        if lower != speller.correction(lower) or any(char.isdigit() for char in lower) or (word[1][:1] != word[1][:1].casefold() and word[0] != 0):
            reveal_words.append(word[1])
    # for phrase in noun_phrases:
    #     for word in phrase.split():
    #         if any(word == w for w in state_list):
    #             reveal_words.extend(phrase.split())
    for wordNum in range(len(word_list)):
        if word_list[wordNum][1].casefold() in [w.casefold() for w in reveal_words]:
            word_list[wordNum][4] = True

# analyzes and activates title from database


def init_title(db, app, postDate):
    title_string = get_title(app, postDate)
    doc = nlp(title_string)
    title_words = extract_words(doc)
    reveal_proper(title_words, doc)
    post_words(doc, db, app, title_words, postDate)
