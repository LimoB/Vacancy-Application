from flask import Flask, request, jsonify, make_response
from flask_migrate import Migrate
from flask_restful import Api, Resource
from flask_jwt_extended import create_access_token, JWTManager, jwt_required, get_jwt_identity
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from models import db, User, Job, Application
import os

app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'dev-secret-key')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///job_seeker.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.json.compact = False

db.init_app(app)
migrate = Migrate(app, db)
api = Api(app)
jwt = JWTManager(app)
bcrypt = Bcrypt(app)
CORS(app)

# --- AUTH ---
class Register(Resource):
    def post(self):
        data = request.get_json()
        try:
            hashed = bcrypt.generate_password_hash(data['password']).decode('utf-8')
            user = User(
                username=data['username'],
                email=data['email'],
                password=hashed,
                user_type=data.get('user_type', 'seeker'),
                user_role='user',
                about=data.get('about'),
                location=data.get('location')
            )
            db.session.add(user)
            db.session.commit()
            return {"success": True, "message": "Account created successfully!"}, 201
        except Exception as e:
            return {"success": False, "message": "Registration failed.", "error": str(e)}, 422

class Login(Resource):
    def post(self):
        data = request.get_json()
        user = User.query.filter_by(email=data.get('email')).first()
        if user and bcrypt.check_password_hash(user.password, data.get('password')):
            token = create_access_token(identity=str(user.id))
            return {
                "success": True,
                "message": f"Welcome back, {user.username}!",
                "token": token,
                "user": user.to_dict()
            }, 200
        return {"success": False, "message": "Invalid email or password."}, 401

# --- USERS ---
class All_Users(Resource):
    @jwt_required()
    def get(self):
        admin_id = get_jwt_identity()
        admin = User.query.get(admin_id)
        if admin.user_role != 'admin':
            return {"success": False, "message": "Admin access required"}, 403
        
        users = [u.to_dict() for u in User.query.all()]
        return users, 200

class User_By_Id(Resource):
    @jwt_required()
    def get(self, id):
        user = User.query.get_or_404(id)
        return user.to_dict(), 200

    @jwt_required()
    def patch(self, id):
        current_user_id = get_jwt_identity()
        user = User.query.get_or_404(id)
        
        admin = User.query.get(current_user_id)
        if str(current_user_id) != str(id) and admin.user_role != 'admin':
            return {"success": False, "message": "Unauthorized"}, 403

        data = request.get_json()
        for attr in data:
            if hasattr(user, attr) and attr != 'password':
                setattr(user, attr, data[attr])
        
        db.session.commit()
        return {"success": True, "user": user.to_dict()}, 200

    @jwt_required()
    def delete(self, id):
        current_user_id = get_jwt_identity()
        admin = User.query.get(current_user_id)
        
        if admin.user_role != 'admin':
            return {"success": False, "message": "Admin privileges required"}, 403
            
        user = User.query.get_or_404(id)
        db.session.delete(user)
        db.session.commit()
        return {"success": True, "message": "User deleted successfully"}, 200

# --- JOBS ---
class Job_List(Resource):
    def get(self):
        jobs = [j.to_dict() for j in Job.query.all()]
        return jobs, 200

    @jwt_required()
    def post(self):
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        if user.user_type != 'employer' and user.user_role != 'admin':
            return {"success": False, "message": "Only employers can post jobs."}, 403
        
        data = request.get_json()
        # FIXED: Now includes employer_id from JWT
        job = Job(
            company=data['company'],
            job_title=data['job_title'],
            job_description=data['job_description'],
            salary=data.get('salary'),
            employer_id=user.id 
        )
        db.session.add(job)
        db.session.commit()
        return {"success": True, "job": job.to_dict()}, 201

class Job_By_Id(Resource):
    @jwt_required()
    def delete(self, id):
        user = User.query.get(get_jwt_identity())
        job = Job.query.get_or_404(id)
        
        # Security: Only the owner of the job or an admin can delete it
        if user.user_role != 'admin' and job.employer_id != user.id:
            return {"success": False, "message": "Unauthorized."}, 403
            
        db.session.delete(job)
        db.session.commit()
        return {"success": True, "message": "Job deleted."}, 200

# --- APPLICATIONS ---
class Apply(Resource):
    @jwt_required()
    def post(self):
        user_id = get_jwt_identity()
        data = request.get_json()
        
        existing = Application.query.filter_by(user_id=user_id, job_id=data['job_id']).first()
        if existing:
            return {"success": False, "message": "Already applied."}, 400

        new_app = Application(user_id=user_id, job_id=data['job_id'])
        db.session.add(new_app)
        db.session.commit()
        return {"success": True, "application": new_app.to_dict()}, 201

    @jwt_required()
    def get(self):
        user = User.query.get(get_jwt_identity())
        if user.user_type == 'employer' or user.user_role == 'admin':
            apps = Application.query.all()
        else:
            apps = Application.query.filter_by(user_id=user.id).all()
        return [a.to_dict() for a in apps], 200

# NEW: Specific endpoint for the Employer Talent Pipeline
class EmployerApplications(Resource):
    @jwt_required()
    def get(self):
        user_id = get_jwt_identity()
        user = User.query.get(user_id)

        if user.user_type != 'employer' and user.user_role != 'admin':
            return {"success": False, "message": "Unauthorized access"}, 403

        # Join Jobs and Applications to find applicants for THIS employer's jobs
        if user.user_role == 'admin':
            apps = Application.query.all()
        else:
            apps = Application.query.join(Job).filter(Job.employer_id == user.id).all()

        results = []
        for app in apps:
            results.append({
                "id": app.id,
                "job_title": app.job.job_title,
                "seeker_name": app.user.username,
                "seeker_email": app.user.email,
                "seeker_about": app.user.about,
                "status": app.status,
                "applied_at": app.application_date.isoformat()
            })
        
        return results, 200

class Application_By_Id(Resource):
    @jwt_required()
    def patch(self, id):
        user = User.query.get(get_jwt_identity())
        app_record = Application.query.get_or_404(id)

        # Security: Only the employer who owns the job can change the status
        if user.user_role != 'admin' and app_record.job.employer_id != user.id:
             return {"success": False, "message": "Permission denied."}, 403
        
        data = request.get_json()
        if 'status' in data:
            app_record.status = data['status']
            db.session.commit()
            return {"success": True, "message": f"Status updated to {data['status']}"}, 200
        return {"success": False, "message": "No status provided."}, 400

    @jwt_required()
    def delete(self, id):
        user_id = get_jwt_identity()
        app_record = Application.query.get_or_404(id)
        
        if str(app_record.user_id) != str(user_id) and User.query.get(user_id).user_role != 'admin':
            return {"success": False, "message": "Unauthorized withdrawal."}, 403
            
        db.session.delete(app_record)
        db.session.commit()
        return {"success": True, "message": "Application removed."}, 200

# --- ROUTES ---
api.add_resource(Register, '/register')
api.add_resource(Login, '/login')
api.add_resource(All_Users, '/users')
api.add_resource(User_By_Id, '/users/<int:id>')
api.add_resource(Job_List, '/jobs')
api.add_resource(Job_By_Id, '/jobs/<int:id>')
api.add_resource(Apply, '/applications')
api.add_resource(Application_By_Id, '/applications/<int:id>')
api.add_resource(EmployerApplications, '/employer/applications') # NEW ROUTE

if __name__ == "__main__":
    app.run(port=5555, debug=True)