from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional

class AddressOut(BaseModel):
    address_id: int
    tutor_id: int
    city: str
    state: str
    country: str
    postal_code: str
    created_at: datetime
    updated_at: datetime