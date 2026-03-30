from pydantic import BaseModel

class TutorSubjectsOut(BaseModel):
    tutor_id: int
    subject_name: str
    