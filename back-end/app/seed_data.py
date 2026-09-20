from app.database import Base
from app.models import admins, subjects, levels, cities, areas  # noqa: F401
from app.models.admins import Admin
from app.models.subjects import Subject
from app.models.levels import Level
from app.models.areas import Area
from app.models.cities import City
from sqlalchemy.orm import Session
from app.core.security import get_password_hash

def is_db_empty(db: Session) -> bool:
    for table in Base.metadata.sorted_tables:
        row = db.execute(table.select().limit(1)).first()
        if row is not None:
            return False
    return True

def seed_admins(db: Session):
    admin_exists = db.query(Admin).filter(Admin.email == "admin@admin.com").first()
    if admin_exists:
        return
    admin = Admin(
        first_name="Admin",
        last_name="Admin",
        email="admin@admin.com",
        password=get_password_hash("0000"),
    )
    db.add(admin)
    db.commit()

def seed_subjects(db: Session):
    subject_exists = db.query(Subject).filter(Subject.subject_title == "Math").first()
    if subject_exists:
        return
    subject = Subject(
        subject_title="Math",
        subject_description="Math is the study of numbers, shapes, and patterns.",
    )
    db.add(subject)
    db.commit()

def seed_levels(db: Session):
    level_titles = ["Low Level", "Medium Level", "High Level"]
    for title in level_titles:
        level_exists = db.query(Level).filter(Level.level_title == title).first()
        if not level_exists:
            level = Level(level_title=title)
            db.add(level)
    db.commit()
      
def seed_cities(db: Session):
    city_exists = db.query(City).filter(City.title == "Homs").first()
    if city_exists:
        return
    city = City(
        title="Homs",
    )
    db.add(city)
    db.commit()

def seed_areas(db: Session):
    area_exists = db.query(Area).first()
    if area_exists:
        return
    areas = [
        Area(
            title="Al-waar",
            city_id=1,
        ),
        Area(
            title="Al-mazaa",
            city_id=1,
        ),
        Area(
            title="Al-zahra",
            city_id=1,
        ),
    ]
    db.add_all(areas)
    db.commit()

def seed_data(db: Session):
    if is_db_empty(db):
        seed_admins(db)
        seed_subjects(db)
        seed_levels(db)
        seed_cities(db)
        seed_areas(db)

if __name__ == "__main__":
    from app.database import LocalSession
    with LocalSession() as db:
        seed_data(db)
        print("Database seeded successfully if empty.")
