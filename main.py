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
from whitenoise import WhiteNoise
load_dotenv()

app = Flask(__name__, static_folder="client/dist", static_url_path="")
app.wsgi_app = WhiteNoise(app.wsgi_app, root="static/")
cors = CORS(app, origins='*')

# app.secret_key=os.environ.get("SECRET_KEY")
# app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("SQLALCHEMY_DATABASE_URI")
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("SQLALCHEMY_DATABASE_URI")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)
client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
    
class title(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.Date, unique=False, nullable=True)
    title = db.Column(db.String(150), unique=False, nullable=False)

    def to_json(self):
        return {
            "id": self.id,
            "date": self.date,
            "title": self.title,
        }

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
    
with app.app_context():
    db.create_all()
    print("all tables created")

@app.route("/api/title", methods=["GET"])
@cross_origin()
def fetch_title():
    tt = title.query.first()
    return jsonify({"title": tt.to_json()})


@app.route("/api/words", methods=["GET"])
@cross_origin()
def fetch_words():
    ws = words.query.all()
    json_words = list(map(lambda x: x.to_json(), ws))
    return jsonify({"words": json_words})


@app.route("/api/image", methods=["GET"])
@cross_origin()
def fetch_image():
    with open("static/my-image.jpeg", "rb") as image_file:
        image_b64 = base64.b64encode(image_file.read())
    return jsonify({"image": image_b64.decode()})

@app.route("/")
@cross_origin()
def serve():
    print("serving index.html")
    return send_from_directory(app.static_folder, "index.html")

def update_title(newTitle):
    with app.app_context():
        title.query.delete()
        tt = title(date=datetime.today(), title=newTitle)
        db.session.add(tt)
        db.session.commit()
    aImage = client.images.generate(
        response_format="b64_json",
        model="dall-e-3",
        prompt=newTitle,
        size="1024x1024",
        quality="standard",
        n=1
    )
    img = Image.open(io.BytesIO(base64.decodebytes(bytes(aImage.data[0].b64_json, "utf-8"))))
    img.save('my-image.jpeg')
    with app.app_context():
        init_title(db, app)


if __name__ == "__main__":
    print("PYTHON APP LAUNCHED VIA MAIN")
    app.run(debug=True, host="0.0.0.0")