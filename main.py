from processTitle import init_title
from datetime import datetime
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
    date = db.Column(db.Date, unique=False, nullable=True)
    title = db.Column(db.String(200), unique=False, nullable=False)
    link = db.Column(db.String(400), unique=False, nullable=True)

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
    num_letters = db.Column(db.Integer, unique=False, nullable=False)
    word = db.Column(db.String(30), unique=False, nullable=False)
    pos = db.Column(db.String(30), unique=False, nullable=False)
    auto_revealed = db.Column(db.Boolean, unique=False, nullable=False)
    
    def to_json(self):
        return {
            "id": self.id,
            "numLetters": self.num_letters,
            "word": self.word,
            "pos": self.pos,
            "autoRevealed": self.auto_revealed
        }

# aimage database table
class aimage(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    image_b64 = db.Column(db.LargeBinary, unique=False, nullable=False)
    
    def to_json(self):
        return {
            "id": self.id,
            "imageb64": bytes.decode(self.image_b64)
        }

# endpoint for title
@app.route("/api/title", methods=["GET"])
@cross_origin()
def fetch_title():
    tt = title.query.first()
    return jsonify({"title": tt.to_json()})

# endpoint for words and word info
@app.route("/api/words", methods=["GET"])
@cross_origin()
def fetch_words():
    ws = words.query.all()
    json_words = list(map(lambda x: x.to_json(), ws))
    return jsonify({"words": json_words})

# endpoint for image
@app.route("/api/image", methods=["GET"])
@cross_origin()
def fetch_image():
    ii = aimage.query.first().to_json()
    return jsonify({"image": ii})

# serves homepage
@app.route("/")
@cross_origin()
def serve():
    print("serving index.html")
    return send_from_directory(app.static_folder, "index.html")

# generate new image from title and activate
def update_title(newTitle, newTitleLink):
    
    # delete title table and add new title
    with app.app_context():
        title.query.delete()
        tt = title(date=datetime.today(), title=newTitle, link=newTitleLink)
        db.session.add(tt)
        db.session.commit()
        
    # query OpenAI, return image as b64 string
    aImage = client.images.generate(
        response_format="b64_json",
        model="dall-e-3",
        prompt=newTitle,
        size="1024x1024",
        quality="standard",
        n=1
    )
    
    # post OpenAI image to database and activate title
    with app.app_context():
        aimage.query.delete()
        mi = aimage(image_b64=bytes(aImage.data[0].b64_json, "utf-8"))
        db.session.add(mi)
        db.session.commit()
        init_title(db, app)
        
# creates database tables if necessary
with app.app_context():
    db.create_all()

# local mode
if __name__ == "__main__":
    print("PYTHON APP LAUNCHED VIA MAIN")
    # app.run(debug=True, host="localhost")
    app.run(debug=True, host="0.0.0.0")