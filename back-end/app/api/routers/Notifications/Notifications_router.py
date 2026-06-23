from typing import Tuple

from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect, status
from jose import JWTError
from sqlalchemy.orm import Session

from app.api.deps import DbSession, get_current_user_role_id
from app.core.security import decode_access_token
from app.core.websocket import manager
from app.database import get_db
from app.schemas.notifications import NotificationOut, NotificationUnreadCountOut
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


@router.get("/", response_model=list[NotificationOut])
def list_notifications(
    db: Session = Depends(get_db),
    current_user: Tuple[str, int] = Depends(get_current_user_role_id),
):
    role, user_id = current_user
    return notification_service.list_notifications_for_user(db, role, user_id)


@router.get("/unread-count", response_model=NotificationUnreadCountOut)
def unread_count(
    db: Session = Depends(get_db),
    current_user: Tuple[str, int] = Depends(get_current_user_role_id),
):
    role, user_id = current_user
    return notification_service.unread_count_for_user(db, role, user_id)


@router.patch("/{notification_id}/read", response_model=NotificationOut)
def mark_notification_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: Tuple[str, int] = Depends(get_current_user_role_id),
):
    role, user_id = current_user
    return notification_service.mark_notification_read(db, notification_id, role, user_id)


@router.post("/read-all", status_code=status.HTTP_200_OK)
def mark_all_notifications_read(
    db: Session = Depends(get_db),
    current_user: Tuple[str, int] = Depends(get_current_user_role_id),
):
    role, user_id = current_user
    return {"updated": notification_service.mark_all_notifications_read(db, role, user_id)}
