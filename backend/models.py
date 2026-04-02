from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import MetaData, func
from sqlalchemy_serializer import SerializerMixin
from sqlalchemy.orm import validates

metadata = MetaData(naming_convention={
    "ix": "ix_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s",
    "pk": "pk_%(table_name)s"
})

db = SQLAlchemy(metadata=metadata)

class User(db.Model, SerializerMixin):
    __tablename__ = 'users'
    serialize_rules = ('-applications.user', '-password', '-jobs_posted.employer')

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String, nullable=False, unique=True)
    email = db.Column(db.String, unique=True, nullable=False)
    password = db.Column(db.String, nullable=False)
    
    # Roles and Types
    user_role = db.Column(db.String, default='user')    # 'admin' or 'user'
    user_type = db.Column(db.String, default='seeker')  # 'seeker' or 'employer'
    
    about = db.Column(db.String)
    location = db.Column(db.String)
    profile_picture = db.Column(db.String) 
    
    # NEW: Store the path/URL to the seeker's CV
    cv_url = db.Column(db.String, nullable=True) 
    
    date_created = db.Column(db.DateTime, default=func.now())
    last_active = db.Column(db.DateTime, default=func.now(), onupdate=func.now())

    # Relationships
    applications = db.relationship('Application', backref='user', cascade="all, delete-orphan")
    jobs_posted = db.relationship('Job', backref='employer', lazy=True)

    @validates('email')
    def validate_email(self, key, email):
        if not email or '@gmail.com' not in email:
            raise ValueError("Registration currently limited to @gmail.com addresses.")
        return email

class Job(db.Model, SerializerMixin):
    __tablename__ = 'jobs'
    serialize_rules = ('-applications.job', '-employer.jobs_posted')

    id = db.Column(db.Integer, primary_key=True)
    company = db.Column(db.String, nullable=False)
    job_title = db.Column(db.String, nullable=False)
    job_description = db.Column(db.String)
    salary = db.Column(db.String)
    date_created = db.Column(db.DateTime, default=func.now())

    employer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    applications = db.relationship('Application', backref='job', cascade="all, delete-orphan")

class Application(db.Model, SerializerMixin):
    __tablename__ = 'applications'
    serialize_rules = ('-user.applications', '-job.applications')

    id = db.Column(db.Integer, primary_key=True)
    
    # Status: 'pending', 'accepted', 'rejected'
    status = db.Column(db.String, default='pending')
    
    # NEW: Store the employer's response/feedback message
    employer_message = db.Column(db.String, nullable=True)
    
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    job_id = db.Column(db.Integer, db.ForeignKey('jobs.id'), nullable=False)
    
    application_date = db.Column(db.DateTime, default=func.now())
    # Tracking when the status was last updated
    updated_at = db.Column(db.DateTime, onupdate=func.now())