from enum import Enum

class gender_enum(str, Enum):
    MALE = "male"
    FEMALE = "female"

class tution_type_enum(str, Enum):
    ONLINE = "online"
    OFFLINE = "offline"
    BOTH = "both"

class post_status_enum(str, Enum):
    NO_RESPONSE = "no_response"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    CLOSED = "closed"