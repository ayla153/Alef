from enum import Enum


def enum_values_callable(enum_cls):
    """Persist str Enum .value in PostgreSQL (e.g. high_3), not member name (HIGH_3)."""
    return [member.value for member in enum_cls]


class gender_enum(str, Enum):
    MALE = "male"
    FEMALE = "female"

class TuitionTypeEnum(str, Enum):
    ONLINE = "online"
    OFFLINE = "offline"
    BOTH = "both"

class post_status_enum(str, Enum):
    """Legacy — removed with post_status table; kept for migration downgrade only."""

    NO_RESPONSE = "no_response"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    CLOSED = "closed"


class LeadStatusEnum(str, Enum):
    OPEN = "open"
    CLOSED_SHORTLIST = "closed_shortlist"
    CLOSED_EMPTY = "closed_empty"
    CLOSED_MATCHED = "closed_matched"
    CLOSED_EXPIRED = "closed_expired"


class LeadApplicationStatusEnum(str, Enum):
    PENDING = "pending"
    REJECTED = "rejected"
    WITHDRAWN = "withdrawn"

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
