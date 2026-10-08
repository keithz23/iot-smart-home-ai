"""ensure audit logs table exists

Revision ID: b7d4e8f1a2c3
Revises: a6fc1172ec7b
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "b7d4e8f1a2c3"
down_revision: Union[str, Sequence[str], None] = "a6fc1172ec7b"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    if "audit_logs" in inspector.get_table_names():
        return

    op.create_table(
        "audit_logs",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=True),
        sa.Column("device_id", sa.Integer(), nullable=True),
        sa.Column("event_type", sa.String(length=100), nullable=False),
        sa.Column("source", sa.String(length=50), nullable=False),
        sa.Column("target", sa.String(length=100), nullable=True),
        sa.Column("value_before", sa.Integer(), nullable=True),
        sa.Column("value_after", sa.Integer(), nullable=True),
        sa.Column("request_text", sa.Text(), nullable=True),
        sa.Column("reason", sa.Text(), nullable=True),
        sa.Column("status", sa.String(length=50), nullable=False),
        sa.Column("confirmed_by_user", sa.Boolean(), nullable=False),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.Column("metadata_json", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["device_id"], ["devices.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_audit_logs_user_id", "audit_logs", ["user_id"])
    op.create_index("ix_audit_logs_device_id", "audit_logs", ["device_id"])


def downgrade() -> None:
    bind = op.get_bind()
    if "audit_logs" not in sa.inspect(bind).get_table_names():
        return
    op.drop_index("ix_audit_logs_device_id", table_name="audit_logs")
    op.drop_index("ix_audit_logs_user_id", table_name="audit_logs")
    op.drop_table("audit_logs")
