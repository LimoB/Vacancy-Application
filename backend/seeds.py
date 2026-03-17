from app import app
from models import db, User, Job, Application
from flask_bcrypt import Bcrypt
from faker import Faker
from random import choice as rc, randint

bcrypt = Bcrypt()
fake = Faker()

with app.app_context():
    print("--- Starting Seed ---")
    
    # 1. Cleanup
    print("Clearing old data...")
    Application.query.delete()
    Job.query.delete()
    User.query.delete()

    # 2. Create Users with Roles
    print("Creating users, admins, and employers...")
    
    # Global Admin
    admin = User(
        username="admin_lee",
        email="admin@gmail.com",
        password=bcrypt.generate_password_hash('admin123').decode('utf-8'),
        user_type="employer", 
        user_role="admin",    
        about="Platform Administrator & System Overseer.",
        location="Nairobi, KE"
    )

    # Standard Employer
    employer = User(
        username="tech_talent_hr",
        email="hr@gmail.com",
        password=bcrypt.generate_password_hash('password123').decode('utf-8'),
        user_type="employer",
        user_role="user",
        about="Hiring manager at a leading Fintech startup.",
        location="San Francisco, CA"
    )

    # Standard Seeker
    seeker = User(
        username="kali_seeker",
        email="kali@gmail.com",
        password=bcrypt.generate_password_hash('password123').decode('utf-8'),
        user_type="seeker",
        user_role="user",
        about="Security researcher looking for Fullstack dev roles.",
        location="Remote"
    )

    db.session.add_all([admin, employer, seeker])

    # Generate more random seekers for variety
    all_seekers = [seeker]
    for _ in range(5):
        s = User(
            username=fake.user_name(),
            email=f"{fake.first_name().lower()}@gmail.com",
            password=bcrypt.generate_password_hash('password123').decode('utf-8'),
            user_type="seeker",
            user_role="user",
            about=fake.sentence(),
            location=fake.city()
        )
        all_seekers.append(s)
        db.session.add(s)

    db.session.commit() 

    # 3. Create Jobs
    print("Creating job vacancies...")
    jobs_list = []
    salaries = ['$3000', '$5500', '$8000', '$10000', '$15000']
    titles = ['Full Stack Engineer', 'Cybersecurity Analyst', 'DevOps Lead', 'AI Researcher', 'React Developer', 'Product Manager', 'Data Scientist']
    
    for _ in range(15):
        job = Job(
            company=fake.company(), 
            job_title=rc(titles), 
            job_description=fake.paragraph(nb_sentences=5), 
            salary=rc(salaries)
        )
        jobs_list.append(job)
        
    db.session.add_all(jobs_list)
    db.session.commit()

    # 4. Create Sample Applications with Statuses
    print("Linking seekers to jobs with statuses...")
    
    statuses = ['Pending', 'Accepted', 'Rejected']
    all_jobs = Job.query.all()
    
    # Make the main seeker apply to 5 jobs with random statuses
    for i in range(5):
        app_entry = Application(
            user_id=seeker.id,
            job_id=all_jobs[i].id,
            status=rc(statuses) # Testing the new status field
        )
        db.session.add(app_entry)

    # Make other random seekers apply to some jobs
    for _ in range(10):
        random_seeker = rc(all_seekers)
        random_job = rc(all_jobs)
        
        # Check if application already exists to avoid unique constraint issues if any
        existing = Application.query.filter_by(user_id=random_seeker.id, job_id=random_job.id).first()
        if not existing:
            app_entry = Application(
                user_id=random_seeker.id,
                job_id=random_job.id,
                status=rc(statuses)
            )
            db.session.add(app_entry)

    db.session.commit()
    print("--- Database Seeded Successfully! ---")