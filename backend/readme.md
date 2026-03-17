from flask import Flask, request, make_response, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_restful import Api, Resource
from flask_jwt_extended import create_access_token, JWTManager, get_jwt_identity, jwt_required
from flask_bcrypt import Bcrypt
from sqlalchemy import func
from models import db, User, Job

# Set up the Flask app and configurations
app = Flask("__name__")
app.config['JWT_SECRET_KEY'] = os.urandom(32).hex()
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///job_seeker.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.json.compact = False

# Initialize extensions
jwt = JWTManager(app)
bcrypt = Bcrypt(app)
api = Api(app)

# Database Models

# Admin Job Posting
class JobPost(Resource):
    @jwt_required()
    def post(self):
        current_user = get_jwt_identity()
        user = User.query.get_or_404(current_user)
        if user.user_role != 'admin':
            return jsonify({"message": "Unauthorized, only admins can post jobs"}), 403

        new_job = Job(
            company=request.json['company'],
            job_title=request.json['job_title'],
            job_description=request.json['job_description'],
            salary=request.json['salary']
        )

        db.session.add(new_job)
        db.session.commit()

        return jsonify(new_job.to_dict()), 201

# View all jobs (available to all users)
class JobList(Resource):
    def get(self):
        jobs = [job.to_dict() for job in Job.query.all()]
        if not jobs:
            return jsonify({"message": "No jobs found"}), 404
        return jsonify(jobs), 200

# View jobs posted by the current admin (only for admin)
class AdminJobList(Resource):
    @jwt_required()
    def get(self):
        current_user = get_jwt_identity()
        user = User.query.get_or_404(current_user)
        if user.user_role != 'admin':
            return jsonify({"message": "Unauthorized, only admins can view their posted jobs"}), 403

        jobs = [job.to_dict() for job in Job.query.filter_by(company=user.username).all()]
        if not jobs:
            return jsonify({"message": "No jobs found"}), 404
        return jsonify(jobs), 200

# Apply for a job (only job seekers can apply)
class ApplyJob(Resource):
    @jwt_required()
    def post(self, job_id):
        current_user = get_jwt_identity()
        user = User.query.get_or_404(current_user)
        if user.user_role != 'job_seeker':
            return jsonify({"message": "Unauthorized, only job seekers can apply for jobs"}), 403

        job = Job.query.get_or_404(job_id)
        # Here you can add logic to save the job application (e.g., upload resume)
        # For simplicity, we assume the applicant is applying directly without uploading a resume.
        
        return jsonify({"message": f"Applied for {job.job_title} successfully"}), 201

# View job applications (only the admin who posted the job can view applications)
class JobApplications(Resource):
    @jwt_required()
    def get(self, job_id):
        current_user = get_jwt_identity()
        user = User.query.get_or_404(current_user)
        if user.user_role != 'admin':
            return jsonify({"message": "Unauthorized, only admins can view applications"}), 403

        job = Job.query.get_or_404(job_id)
        if job.company != user.username:  # Ensure that the admin only sees their own job applications
            return jsonify({"message": "Unauthorized, you can only view applications for your posted jobs"}), 403

        # Fetch applications for the job (You would need to implement an Application model for this)
        applications = []  # Add logic here to fetch applications for this job
        return jsonify(applications), 200


# Add resources to the API
api.add_resource(JobPost, '/post-job')
api.add_resource(JobList, '/jobs')
api.add_resource(AdminJobList, '/admin/jobs')
api.add_resource(ApplyJob, '/apply-job/<int:job_id>')
api.add_resource(JobApplications, '/job-applications/<int:job_id>')

if __name__ == '__main__':
    app.run(port=5555, debug=True)


# models

from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import MetaData
from sqlalchemy_serializer import SerializerMixin
from sqlalchemy.orm import validates
from sqlalchemy import func

convention = {
    "ix": "ix_%(column_0_label)s",                   
    "uq": "uq_%(table_name)s_%(column_0_name)s",    
    "ck": "ck_%(table_name)s_%(constraint_name)s", 
    "fk": "fk_%(table_name)s_%(column_0_name)s",    
    "pk": "pk_%(table_name)s"                       
}

metadata = MetaData(naming_convention=convention)
db = SQLAlchemy(metadata=metadata)

# User model
class User(db.Model, SerializerMixin):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String, nullable=False, unique=True)
    email = db.Column(db.String)
    password = db.Column(db.String)
    user_role = db.Column(db.String)  # 'admin', 'job_seeker'
    about = db.Column(db.String)
    location = db.Column(db.String)
    date_created = db.Column(db.DateTime, default=func.now())
    user_type = db.Column(db.String)
    last_active = db.Column(db.DateTime, default=func.now(), onupdate=func.now())

    @validates('email')
    def validate_email(self, key, email):
        if not email.endswith('@gmail.com'):
            raise ValueError("Invalid email. @ keyword required")
        return email

    def __repr__(self):
        return f'<User {self.id}, {self.username}, {self.email}>'

# Job model
class Job(db.Model, SerializerMixin):
    __tablename__ = 'jobs'

    id = db.Column(db.Integer, primary_key=True)
    company = db.Column(db.String)  # Company that posted the job (linked to an admin)
    job_title = db.Column(db.String)
    job_description = db.Column(db.String)
    salary = db.Column(db.String)
    date_created = db.Column(db.DateTime, default=func.now())

    # One-to-many relationship: One job can have multiple applications
    applications = db.relationship('Application', backref='job', lazy=True)

    def __repr__(self):
        return f'<Job {self.id}, {self.company}, {self.job_title}>'

# Application model to track job applications
class Application(db.Model, SerializerMixin):
    __tablename__ = 'applications'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)  # Reference to job seeker (user)
    job_id = db.Column(db.Integer, db.ForeignKey('jobs.id'), nullable=False)  # Reference to the job
    application_date = db.Column(db.DateTime, default=func.now())
    
    # Relationship back to User and Job models
    user = db.relationship('User', backref=db.backref('applications', lazy=True))
    job = db.relationship('Job', backref=db.backref('applications', lazy=True))

    def __repr__(self):
        return f'<Application {self.id}, Job: {self.job_id}, User: {self.user_id}>'
