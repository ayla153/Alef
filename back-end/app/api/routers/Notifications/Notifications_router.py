from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect, status
from jose import JWTError
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin, get_current_student, get_current_tutor
from app.core.security import decode_access_token
from app.core.websocket import manager
from app.database import get_db
from app.models.admins import Admin
from app.models.students import Student
from app.models.tutors import Tutor
from app.schemas.notifications import NotificationOut
from app.services import notification_service

router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"],
)

ws_router = APIRouter(tags=["Notifications"])


@ws_router.websocket("/ws/notifications")
async def notifications_websocket(websocket: WebSocket):
    token = websocket.query_params.get("token")
    if not token:
        auth_header = websocket.headers.get("authorization") or websocket.headers.get("Authorization")
        if auth_header and auth_header.lower().startswith("bearer "):
            token = auth_header.split(" ", 1)[1]

    if not token:
        await websocket.close(code=1008, reason="Missing JWT token")
        return

    try:
        claims = decode_access_token(token)
        role = claims.get("role")
        sub = claims.get("sub")
        if role not in {"student", "tutor", "admin"} or sub is None:
            raise ValueError("Invalid token claims")
        user_id = int(sub)
    except (JWTError, ValueError, TypeError):
        await websocket.close(code=1008, reason="Invalid or expired token")
        return

    await manager.connect(websocket, role, user_id)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, role, user_id)


@router.get("/student/me", response_model=list[NotificationOut])
def list_student_notifications(
    db: Session = Depends(get_db),
    current_student: Student = Depends(get_current_student),
):
    return notification_service.list_notifications_for_user(
        db,
        recipient_role="student",
        recipient_id=current_student.student_id,
    )


@router.get("/student/unread-count")
def student_unread_count(
    db: Session = Depends(get_db),
    current_student: Student = Depends(get_current_student),
):
    return notification_service.unread_count_for_user(
        db,
        recipient_role="student",
        recipient_id=current_student.student_id,
    )


@router.get("/tutor/me", response_model=list[NotificationOut])
def list_tutor_notifications(
    db: Session = Depends(get_db),
    current_tutor: Tutor = Depends(get_current_tutor),
):
    return notification_service.list_notifications_for_user(
        db,
        recipient_role="tutor",
        recipient_id=current_tutor.tutor_id,
    )


@router.get("/tutor/unread-count")
def tutor_unread_count(
    db: Session = Depends(get_db),
    current_tutor: Tutor = Depends(get_current_tutor),
):
    return notification_service.unread_count_for_user(
        db,
        recipient_role="tutor",
        recipient_id=current_tutor.tutor_id,
    )


@router.get("/admin/me", response_model=list[NotificationOut])
def list_admin_notifications(
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    return notification_service.list_notifications_for_user(
        db,
        recipient_role="admin",
        recipient_id=current_admin.admin_id,
    )


@router.get("/admin/unread-count")
def admin_unread_count(
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    return notification_service.unread_count_for_user(
        db,
        recipient_role="admin",
        recipient_id=current_admin.admin_id,
    )


@router.patch("/{notification_id}/read", response_model=NotificationOut)
def mark_notification_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_student: Student = Depends(get_current_student),
):
    return notification_service.mark_notification_read(
        db,
        notification_id,
        recipient_role="student",
        recipient_id=current_student.student_id,
    )


@router.patch("/{notification_id}/read/tutor", response_model=NotificationOut)
def mark_tutor_notification_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_tutor: Tutor = Depends(get_current_tutor),
):
    return notification_service.mark_notification_read(
        db,
        notification_id,
        recipient_role="tutor",
        recipient_id=current_tutor.tutor_id,
    )


@router.patch("/{notification_id}/read/admin", response_model=NotificationOut)
def mark_admin_notification_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    return notification_service.mark_notification_read(
        db,
        notification_id,
        recipient_role="admin",
        recipient_id=current_admin.admin_id,
    )


@router.post("/mark-all-read/student", status_code=status.HTTP_200_OK)
def mark_student_notifications_read(
    db: Session = Depends(get_db),
    current_student: Student = Depends(get_current_student),
):
    return {"updated": notification_service.mark_all_notifications_read(db, "student", current_student.student_id)}


@router.post("/mark-all-read/tutor", status_code=status.HTTP_200_OK)
def mark_tutor_notifications_read(
    db: Session = Depends(get_db),
    current_tutor: Tutor = Depends(get_current_tutor),
):
    return {"updated": notification_service.mark_all_notifications_read(db, "tutor", current_tutor.tutor_id)}


@router.post("/mark-all-read/admin", status_code=status.HTTP_200_OK)
def mark_admin_notifications_read(
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    return {"updated": notification_service.mark_all_notifications_read(db, "admin", current_admin.admin_id)}
