from dotenv import load_dotenv
load_dotenv()

from flask import Flask
app = Flask(__name__)

@app.route('/')
def hello():
    return "Hello World"

if __name__ == '__main__':
    print("Starting basic Flask...")
    app.run(host='0.0.0.0', port=5001, debug=True)
