from flask import Flask, render_template, request, redirect, url_for, jsonify
from flask_sqlalchemy import SQLAlchemy
import os

app = Flask(__name__)

# Configure database
db_path = os.environ.get('DATABASE_URL', 'sqlite:///todo.db')
# Handle Render PostgreSQL URL format
if db_path.startswith("postgres://"):
    db_path = db_path.replace("postgres://", "postgresql://", 1)
app.config['SQLALCHEMY_DATABASE_URI'] = db_path
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

class Todo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.String(200), nullable=False)
    completed = db.Column(db.Boolean, default=False)
    deleted = db.Column(db.Boolean, default=False)

    def serialize(self):
        return {
            "id": self.id,
            "content": self.content,
            "completed": self.completed,
            "deleted": self.deleted,
        }

with app.app_context():
    db.create_all()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/todos', methods=['GET'])
def get_todos():
    active = Todo.query.filter_by(deleted=False).all()
    deleted = Todo.query.filter_by(deleted=True).all()
    return jsonify({
        "active": [todo.serialize() for todo in active],
        "deleted": [todo.serialize() for todo in deleted]
    })

@app.route("/add", methods=["POST"])
def add_todo():
    todo_item = request.json.get("todo")
    if todo_item:
        new_todo = Todo(content=todo_item)
        db.session.add(new_todo)
        db.session.commit()
        active = Todo.query.filter_by(deleted=False).all()
        deleted = Todo.query.filter_by(deleted=True).all()
        return jsonify({
            "status": "success",
            "active": [t.serialize() for t in active],
            "deleted": [t.serialize() for t in deleted]
        })
    return jsonify({"status": "error", "message": "No todo provided"}), 400

@app.route("/delete", methods=["POST"])
def delete_todo():
    todo_id = request.json.get("id")
    todo = Todo.query.get(todo_id)
    if todo:
        todo.deleted = True
        db.session.commit()
        active = Todo.query.filter_by(deleted=False).all()
        deleted = Todo.query.filter_by(deleted=True).all()
        return jsonify({
            "status": "success",
            "active": [t.serialize() for t in active],
            "deleted": [t.serialize() for t in deleted]
        })
    return jsonify({"status": "error", "message": "Invalid id"}), 400

@app.route("/update", methods=["POST"])
def update_todo():
    todo_id = request.json.get("id")
    completed = request.json.get("completed")
    todo = Todo.query.get(todo_id)
    if todo is not None:
        todo.completed = completed
        db.session.commit()
        active = Todo.query.filter_by(deleted=False).all()
        deleted = Todo.query.filter_by(deleted=True).all()
        return jsonify({
            "status": "success",
            "active": [t.serialize() for t in active],
            "deleted": [t.serialize() for t in deleted]
        })
    return jsonify({"status": "error", "message": "Todo not found"}), 400

@app.route("/restore", methods=["POST"])
def restore_todo():
    todo_id = request.json.get("id")
    todo = Todo.query.get(todo_id)
    if todo:
        todo.deleted = False
        db.session.commit()
        active = Todo.query.filter_by(deleted=False).all()
        deleted = Todo.query.filter_by(deleted=True).all()
        return jsonify({
            "status": "success",
            "active": [t.serialize() for t in active],
            "deleted": [t.serialize() for t in deleted]
        })
    return jsonify({"status": "error", "message": "Invalid id"}), 400

if __name__ == "__main__":
    app.run(debug=False, host="0.0.0.0")
