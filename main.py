from processTitle import init_title
from datetime import date
from flask import request, jsonify, Flask
import io, base64, os
from PIL import Image
from openai import OpenAI
from dotenv import load_dotenv
from flask_cors import CORS, cross_origin
from flask.helpers import send_from_directory
from flask_sqlalchemy import SQLAlchemy
load_dotenv()

# initialize flask app and cross origin resource sharing
app = Flask(__name__, static_folder="client/dist", static_url_path="")
cors = CORS(app, origins='*')

# link SQLAlchemy to database
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("SQLALCHEMY_DATABASE_URI")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# SQLAlchemy and OpenAI instances
db = SQLAlchemy(app)
client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
    
# title database table
class title(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.Date, unique=True, nullable=False)
    title = db.Column(db.String(200), unique=False, nullable=False)
    link = db.Column(db.String(400), unique=False, nullable=False)

    def to_json(self):
        return {
            "id": self.id,
            "date": self.date,
            "title": self.title,
            "link": self.link
        }

# words databse table
class words(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    word_num = db.Column(db.Integer, unique=False, nullable=False)
    num_letters = db.Column(db.Integer, unique=False, nullable=False)
    word = db.Column(db.String(30), unique=False, nullable=False)
    pos = db.Column(db.String(30), unique=False, nullable=False)
    auto_revealed = db.Column(db.Boolean, unique=False, nullable=False)
    date = db.Column(db.Date, unique=False, nullable=False)
    
    def to_json(self):
        return {
            "id": self.id,
            "wordNum": self.word_num,
            "numLetters": self.num_letters,
            "word": self.word,
            "pos": self.pos,
            "autoRevealed": self.auto_revealed,
            "date": self.date
        }

# aimage database table
class aimage(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    image1 = db.Column(db.LargeBinary, unique=False, nullable=False)
    image2 = db.Column(db.LargeBinary, unique=False, nullable=False)
    image3 = db.Column(db.LargeBinary, unique=False, nullable=False)
    date = db.Column(db.Date, unique=False, nullable=False)
    
    def to_json(self):
        return {
            "id": self.id,
            "image1": bytes.decode(self.image1),
            "image2": bytes.decode(self.image2),
            "image3": bytes.decode(self.image3),
            "date": self.date
        }

# endpoint for title
@app.route("/api/title", methods=["GET"])
@cross_origin()
def fetch_title():
    tt = title.query.filter_by(date=date.today()).one()
    return jsonify({"title": tt.to_json()})

# endpoint for words and word info
@app.route("/api/words", methods=["GET"])
@cross_origin()
def fetch_words():
    ws = words.query.filter_by(date = date.today())
    json_words = list(map(lambda x: x.to_json(), ws))
    return jsonify({"words": json_words})

# endpoint for image
@app.route("/api/image", methods=["GET"])
@cross_origin()
def fetch_image():
    ii = aimage.query.filter_by(date = date.today()).one()
    return jsonify({"image": ii.to_json()})

# serves homepage
@app.route("/")
@cross_origin()
def serve():
    print("serving index.html")
    return send_from_directory(app.static_folder, "index.html")

# generate new image from title and activate
def update_title(newTitle, newTitleLink, y, m, d):
    
    print("update started")
    # #add new title to DB
    with app.app_context():
        tt = title(date=date(y, m, d), title=newTitle, link=newTitleLink)
        db.session.add(tt)
        db.session.commit()
        
    print("starting i1")
    # query OpenAI, return image as b64 string
    aImage1 = client.images.generate(
        response_format="b64_json",
        model="dall-e-3",
        prompt=newTitle,
        size="1024x1024",
        quality="standard",
        n=1
    )
    print("i1 generated")
    aImage2 = client.images.generate(
        response_format="b64_json",
        model="dall-e-3",
        prompt=newTitle,
        size="1024x1024",
        quality="standard",
        n=1
    )
    print("i2 generated")
    aImage3 = client.images.generate(
        response_format="b64_json",
        model="dall-e-3",
        prompt=newTitle,
        size="1024x1024",
        quality="standard",
        n=1
    )
    print("i3 generated")
    
    # post OpenAI image to database and activate title
    with app.app_context():
        mi = aimage(image1=bytes(aImage1.data[0].b64_json, "utf-8"), image2=bytes(aImage2.data[0].b64_json, "utf-8"), image3=bytes(aImage3.data[0].b64_json, "utf-8"), date=date(y, m, d))
        db.session.add(mi)
        db.session.commit()
        init_title(db, app, date(y, m, d))
        
    print("title init complete")
    
def switch_image(imageNum):
    with app.app_context():
        currTitle = title.query.filter_by(date = date.today()).one()
        aImageNew = client.images.generate(
            response_format="b64_json",
            model="dall-e-3",
            prompt=currTitle.title,
            size="1024x1024",
            quality="standard",
            n=1
        )
        daily_i = db.session.query(aimage).filter_by(date = date.today()).one()
        match imageNum:
            case 1:
                daily_i.image1 = bytes(aImageNew.data[0].b64_json, "utf-8")
                print("new image 1 added")
            case 2:
                daily_i.image2 = bytes(aImageNew.data[0].b64_json, "utf-8")
                print("new image 2 added")
            case 3:
                daily_i.image3 = bytes(aImageNew.data[0].b64_json, "utf-8")
                print("new image 3 added")
        db.session.commit()
        
    
# creates database tables if necessary
with app.app_context():
    db.create_all()

# local mode
if __name__ == "__main__":
    print("PYTHON APP LAUNCHED VIA MAIN")
    # app.run(debug=True, host="localhost")
    app.run(debug=True, host="0.0.0.0")