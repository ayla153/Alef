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

class NotificationType(str, Enum):
    PUBLIC_LEAD_CREATED = "public_lead_created"
    PUBLIC_LEAD_SLOTS_FULL = "public_lead_slots_full"
    PUBLIC_LEAD_EXPIRED = "public_lead_expired"
    PUBLIC_LEAD_CLOSED_MATCHED = "public_lead_closed_matched"
    PUBLIC_LEAD_CLOSED_NO_MATCH = "public_lead_closed_no_match"

    NEW_OFFER_RECEIVED = "new_offer_received"
    OFFER_ACCEPTED = "offer_accepted"
    OFFER_REJECTED = "offer_rejected"
    OFFER_SLOT_OPENED = "offer_slot_opened"

    PRIVATE_LEAD_RECEIVED = "private_lead_received"
    PRIVATE_LEAD_ACCEPTED = "private_lead_accepted"
    PRIVATE_LEAD_REJECTED = "private_lead_rejected"

    NEW_TUTOR_PENDING = "new_tutor_pending"
    TUTOR_VERIFIED = "tutor_verified"
    TUTOR_VERIFICATION_REJECTED = "tutor_verification_rejected"
class AuthUserRoleEnum(str, Enum):
    STUDENT = "student"
    TUTOR = "tutor"


class OtpPurposeEnum(str, Enum):
    REGISTRATION = "registration"
    PASSWORD_RESET = "password_reset"


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
