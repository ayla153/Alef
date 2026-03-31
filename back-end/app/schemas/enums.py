from enum import Enum

class gender_enum(str, Enum):
    MALE = "male"
    FEMALE = "female"

class TuitionTypeEnum(str, Enum):
    ONLINE = "online"
    OFFLINE = "offline"
    BOTH = "both"

class post_status_enum(str, Enum):
    NO_RESPONSE = "no_response"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    CLOSED = "closed"

class student_grade_enum(str, Enum):
    PRIMARY_1 = "primary_1"
    PRIMARY_2 = "primary_2"
    PRIMARY_3 = "primary_3"
    PRIMARY_4 = "primary_4"
    PRIMARY_5 = "primary_5"
    PRIMARY_6 = "primary_6"

    MIDDLE_1 = "middle_1"
    MIDDLE_2 = "middle_2"
    MIDDLE_3 = "middle_3"

    HIGH_1 = "high_1"
    HIGH_2 = "high_2"
    HIGH_3 = "high_3"
