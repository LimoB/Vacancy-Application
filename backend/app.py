from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import MetaData, func
from sqlalchemy_serializer import SerializerMixin
from sqlalchemy.orm import validates
from flask_migrate import Migrate
from flask_restful import Api, Resource
from flask_jwt_extended import create_access_token, JWTManager, jwt_required, get_jwt_identity
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from flask_admin import Admin
from flask_admin.contrib.sqla import ModelView
from werkzeug.utils import secure_filename
from datetime import datetime, timedelta
import os

app = Flask(__name__)

# --- 1. CONFIGURATION ---
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'super-secret-vault-key-32-chars-minimum')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///job_seeker.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.json.compact = False
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=24)

# File Upload Setup
UPLOAD_FOLDER = 'static/uploads/cvs'
ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# --- 2. MODELS ---
metadata = MetaData(naming_convention={
    "ix": "ix_%(column_0_label)s", "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s", "fk": "fk_%(table_name)s_%(column_0_name)s", "pk": "pk_%(table_name)s"
})

db = SQLAlchemy(metadata=metadata)

class User(db.Model, SerializerMixin):
    __tablename__ = 'users'
    serialize_rules = ('-password', '-jobs_posted.employer', '-applications.user')
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String, nullable=False, unique=True)
    email = db.Column(db.String, unique=True, nullable=False)
    password = db.Column(db.String, nullable=False)
    user_type = db.Column(db.String, default='seeker') # 'seeker' or 'employer'
    user_role = db.Column(db.String, default='user')   # 'user' or 'admin'
    about = db.Column(db.String)
    location = db.Column(db.String)
    profile_picture = db.Column(db.String) 
    cv_url = db.Column(db.String, nullable=True) 
    date_created = db.Column(db.DateTime, default=func.now())

    jobs_posted = db.relationship('Job', backref='employer', lazy=True)
    applications = db.relationship('Application', backref='user', cascade="all, delete-orphan")

class Job(db.Model, SerializerMixin):
    __tablename__ = 'jobs'
    serialize_rules = ('-employer.jobs_posted', '-applications.job')
    id = db.Column(db.Integer, primary_key=True)
    company = db.Column(db.String, nullable=False)
    job_title = db.Column(db.String, nullable=False)
    job_description = db.Column(db.Text, nullable=False)
    salary = db.Column(db.String)
    date_created = db.Column(db.DateTime, default=func.now())
    employer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    applications = db.relationship('Application', backref='job', cascade="all, delete-orphan")

class Application(db.Model, SerializerMixin):
    __tablename__ = 'applications'
    serialize_rules = ('-user.applications', '-job.applications')
    id = db.Column(db.Integer, primary_key=True)
    status = db.Column(db.String, default='pending') 
    employer_message = db.Column(db.Text)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    job_id = db.Column(db.Integer, db.ForeignKey('jobs.id'), nullable=False)
    application_date = db.Column(db.DateTime, default=func.now())
    updated_at = db.Column(db.DateTime, onupdate=func.now())

# --- 3. EXTENSIONS ---
db.init_app(app)
migrate = Migrate(app, db)
api = Api(app)
jwt = JWTManager(app)
bcrypt = Bcrypt(app)
CORS(app)

# --- 4. ADMIN PANEL ---
admin_panel = Admin(app, name='Vacancy Portal Admin') 
admin_panel.add_view(ModelView(User, db.session))
admin_panel.add_view(ModelView(Job, db.session))
admin_panel.add_view(ModelView(Application, db.session))

# --- 5. AUTH RESOURCES ---
class Register(Resource):
    def post(self):
        data = request.get_json()
        hashed = bcrypt.generate_password_hash(data['password']).decode('utf-8')
        user = User(
            username=data['username'], 
            email=data['email'], 
            password=hashed, 
            user_type=data.get('user_type', 'seeker')
        )
        db.session.add(user)
        db.session.commit()
        return {"success": True, "message": "User registered."}, 201

class Login(Resource):
    def post(self):
        data = request.get_json()
        user = User.query.filter_by(email=data.get('email')).first()
        if user and bcrypt.check_password_hash(user.password, data.get('password')):
            token = create_access_token(identity=str(user.id))
            return {"success": True, "token": token, "user": user.to_dict()}, 200
        return {"success": False, "message": "Invalid credentials."}, 401

# --- 6. JOB RESOURCES ---
class Job_List(Resource):
    def get(self):
        return [j.to_dict() for j in Job.query.all()], 200

    @jwt_required()
    def post(self):
        user_id = get_jwt_identity()
        data = request.get_json()
        job = Job(
            company=data['company'], 
            job_title=data['job_title'], 
            job_description=data['job_description'], 
            salary=data.get('salary'), 
            employer_id=user_id
        )
        db.session.add(job)
        db.session.commit()
        return job.to_dict(), 201

class Job_By_Id(Resource):
    def get(self, id):
        return Job.query.get_or_404(id).to_dict(), 200

    @jwt_required()
    def patch(self, id):
        job = Job.query.get_or_404(id)
        data = request.get_json()
        for attr in data:
            setattr(job, attr, data[attr])
        db.session.commit()
        return job.to_dict(), 200

    @jwt_required()
    def delete(self, id):
        job = Job.query.get_or_404(id)
        db.session.delete(job)
        db.session.commit()
        return {"message": "Job deleted"}, 204

# --- 7. USER RESOURCES ---
class User_List(Resource):
    def get(self):
        return [u.to_dict() for u in User.query.all()], 200

class User_By_Id(Resource):
    @jwt_required()
    def get(self, id):
        return User.query.get_or_404(id).to_dict(), 200

    @jwt_required()
    def patch(self, id):
        user = User.query.get_or_404(id)
        data = request.get_json()
        if 'password' in data:
            data['password'] = bcrypt.generate_password_hash(data['password']).decode('utf-8')
        for attr in data:
            setattr(user, attr, data[attr])
        db.session.commit()
        return user.to_dict(), 200

class UploadCV(Resource):
    @jwt_required()
    def post(self, id):
        if 'cv' not in request.files: return {"message": "No file"}, 400
        file = request.files['cv']
        if file and allowed_file(file.filename):
            filename = secure_filename(f"user_{id}_{file.filename}")
            path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(path)
            user = db.session.get(User, id)
            user.cv_url = path
            db.session.commit()
            return {"cv_url": path, "user": user.to_dict()}, 200
        return {"message": "Invalid file"}, 400




# --- 8. APPLICATION RESOURCES (ENHANCED MESSAGING) ---
class Apply(Resource):
    @jwt_required()
    def get(self):
        user_id = get_jwt_identity()
        user = db.session.get(User, user_id)
        
        if not user:
            return {"message": "User not found"}, 404

        # --- 1. ADMIN OVERRIDE ---
        # If the user is an admin, they bypass all filters and get EVERYTHING
        if user.user_role.lower() == 'admin':
            print(f"⚡ Admin {user.username} is fetching all applications.")
            apps = Application.query.all()
            return [a.to_dict() for a in apps], 200

        # --- 2. EMPLOYER LOGIC ---
        if user.user_type.lower() == 'employer':
            # Get IDs of all jobs posted by this employer
            job_ids = [job.id for job in user.jobs_posted]
            # Filter applications that belong to those jobs
            apps = Application.query.filter(Application.job_id.in_(job_ids)).all()
            print(f"💼 Employer {user.username} fetching {len(apps)} apps for their jobs.")
        
        # --- 3. SEEKER LOGIC ---
        else:
            # Seekers only see their own applications
            apps = Application.query.filter_by(user_id=user_id).all()
            print(f"🔍 Seeker {user.username} fetching their own {len(apps)} apps.")
            
        return [a.to_dict() for a in apps], 200

    @jwt_required()
    def post(self):
        # ... (Keep your existing POST logic for applying)
        user_id = get_jwt_identity()
        data = request.get_json() if not request.files else request.form
        
        job_id = data.get('job_id')
        if not job_id:
            return {"message": "Job ID is required"}, 400

        new_app = Application(
            user_id=user_id, 
            job_id=job_id, 
            status='pending',
            employer_message="Thank you for your application. We have received your submission and our team is currently reviewing it. We will get back to you shortly."
        )
        db.session.add(new_app)
        db.session.commit()
        return new_app.to_dict(), 201

class Application_By_Id(Resource):
    @jwt_required()
    def patch(self, id):
        app_rec = Application.query.get_or_404(id)
        data = request.get_json()
        
        new_status = data.get('status', app_rec.status).lower()
        
        # Automated Employer Logic
        if new_status == 'accepted':
            default_msg = "Congratulations! Your application has been shortlisted. Our team will contact you soon with the next steps, including interview details. We look forward to potentially welcoming you to our team!"
        elif new_status == 'rejected':
            default_msg = "Thank you for your application. After careful consideration, we regret to inform you that we will not be proceeding with your application at this time. We appreciate your interest and wish you success in your job search."
        else:
            default_msg = app_rec.employer_message

        app_rec.status = new_status
        # Use provided message from frontend if it exists, otherwise use our automated default
        app_rec.employer_message = data.get('message', default_msg)
        
        db.session.commit()
        return app_rec.to_dict(), 200

    @jwt_required()
    def delete(self, id):
        app_rec = Application.query.get_or_404(id)
        db.session.delete(app_rec)
        db.session.commit()
        return {"message": "Application removed"}, 204

# --- 9. STATIC FILE SERVING ---
@app.route('/static/uploads/cvs/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# --- 10. ROUTE BINDING ---
api.add_resource(Register, '/register')
api.add_resource(Login, '/login')
api.add_resource(User_List, '/users')
api.add_resource(User_By_Id, '/users/<int:id>')
api.add_resource(UploadCV, '/users/<int:id>/cv')
api.add_resource(Job_List, '/jobs')
api.add_resource(Job_By_Id, '/jobs/<int:id>')
api.add_resource(Apply, '/applications')
api.add_resource(Application_By_Id, '/applications/<int:id>')

if __name__ == "__main__":
    app.run(port=5000, debug=True)