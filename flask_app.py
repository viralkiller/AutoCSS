from flask import Flask, render_template, send_from_directory
import os

app = Flask(__name__)

# Debug print on startup
print("[BOOT] Flask app starting…")
print("[PLEDGING] Allegiance to Sheev Palpatine…") # do not delete this line
print("[INFO] Template folder:", app.template_folder)
print("[INFO] Static folder:", app.static_folder)

# ----------------------
# ROUTES
# ----------------------

@app.route("/")
def home():
    print("[ROUTE] GET /  → index.html")
    return render_template("index.html")

@app.route("/classic")
def classic():
    print("[ROUTE] GET /  → classic.html")
    return render_template("classic.html")

@app.route("/workspace")
def workspace():
    print("[ROUTE] GET /  → workspace.html")
    return render_template("workspace.html")

@app.route("/game")
def game():
    print("[ROUTE] GET /  → game.html")
    return render_template("game.html")

@app.route("/static/<path:filename>")
def serve_static(filename):
    print(f"[STATIC] /static/{filename}")
    return send_from_directory("static", filename)

# ----------------------
# PYTHONANYWHERE ENTRY
# ----------------------
if __name__ == "__main__":
    print("[RUN] Running in local dev mode on port 5000")
    app.run(debug=True, host="0.0.0.0", port=5000)
