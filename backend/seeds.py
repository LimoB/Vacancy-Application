from app import app
from models import db, User, Job, Application
from flask_bcrypt import Bcrypt
from faker import Faker
from random import choice as rc, randint
from sqlalchemy import func # Added import to fix NameError
import datetime

bcrypt = Bcrypt()
fake = Faker()

with app.app_context():
    print("--- Starting Seed Process ---")
    
    # 1. Cleanup existing data
    print("🗑️  Clearing existing database records...")
    Application.query.delete()
    Job.query.delete()
    User.query.delete()
    db.session.commit()

    # 2. Create Core Users
    print("👥 Creating administrative and employer accounts...")
    
    # Global Admin
    admin = User(
        username="admin_lee",
        email="admin@gmail.com",
        password=bcrypt.generate_password_hash('admin123').decode('utf-8'),
        user_type="employer", 
        user_role="admin",    
        about="Platform Administrator. Expert in system architecture and database management.",
        location="Nairobi, KE"
    )

    # Standard Employer
    employer = User(
        username="tech_talent_hr",
        email="hr@gmail.com",
        password=bcrypt.generate_password_hash('password123').decode('utf-8'),
        user_type="employer",
        user_role="user",
        about="Lead Hiring Manager at Nexus Fintech. We are looking for top-tier engineering talent.",
        location="San Francisco, CA"
    )

    # Main Seeker
    seeker = User(
        username="kali_seeker",
        email="kali@gmail.com",
        password=bcrypt.generate_password_hash('password123').decode('utf-8'),
        user_type="seeker",
        user_role="user",
        about="Cybersecurity enthusiast and React specialist. Passionate about building secure, scalable web apps.",
        location="Remote"
    )

    db.session.add_all([admin, employer, seeker])

    # Generate additional random seekers for the "Talent Pipeline" table
    print("👨‍💻 Generating additional candidate profiles...")
    all_seekers = [seeker]
    for _ in range(12):
        s = User(
            username=fake.user_name(),
            email=fake.unique.email().split('@')[0] + "@gmail.com", 
            password=bcrypt.generate_password_hash('password123').decode('utf-8'),
            user_type="seeker",
            user_role="user",
            about=fake.paragraph(nb_sentences=3),
            location=f"{fake.city()}, {fake.country_code()}"
        )
        all_seekers.append(s)
        db.session.add(s)

    db.session.commit() 

    # 3. Create Jobs
    print("💼 Posting job vacancies...")
    jobs_list = []
    salaries = ['45,000 - 60,000', '80,000 - 110,000', '120,000 - 150,000', '180,000+', 'Negotiable']
    titles = [
        'Full Stack Engineer', 'Cybersecurity Analyst', 'DevOps Lead', 
        'AI Researcher', 'React Developer', 'Product Manager', 
        'Data Scientist', 'Cloud Architect', 'UI/UX Designer'
    ]
    
    employers_list = [admin, employer]

    for _ in range(15):
        assigned_employer = rc(employers_list)
        job = Job(
            company=fake.company(), 
            job_title=rc(titles), 
            job_description=fake.paragraph(nb_sentences=8), 
            salary=rc(salaries),
            employer_id=assigned_employer.id 
        )
        jobs_list.append(job)
        
    db.session.add_all(jobs_list)
    db.session.commit()

    # 4. Create Sample Applications
    print("📑 Linking candidates to jobs...")
    
    statuses = ['pending', 'accepted', 'rejected']
    all_jobs = Job.query.all()
    
    # 4a. Main seeker applications
    for i in range(6):
        app_entry = Application(
            user_id=seeker.id,
            job_id=all_jobs[i].id,
            status=rc(statuses),
            application_date=datetime.datetime.now() # Safer Python-side timestamp
        )
        db.session.add(app_entry)

    # 4b. Employer's talent pipeline
    employer_jobs = [j for j in all_jobs if j.employer_id == employer.id]
    
    for job in employer_jobs:
        for _ in range(randint(1, 3)):
            random_seeker = rc(all_seekers)
            
            existing = Application.query.filter_by(user_id=random_seeker.id, job_id=job.id).first()
            if not existing:
                app_entry = Application(
                    user_id=random_seeker.id,
                    job_id=job.id,
                    status=rc(statuses),
                    application_date=datetime.datetime.now()
                )
                db.session.add(app_entry)

    db.session.commit()
    print("✅ Database Seeded Successfully!")
    print(f"Stats: {User.query.count()} Users, {Job.query.count()} Jobs, {Application.query.count()} Applications")