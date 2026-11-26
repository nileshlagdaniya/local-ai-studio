"""Initial migration

Revision ID: 20240101_000000
Revises:
Create Date: 2024-01-01 00:00:00.000000
"""
import sqlalchemy as sa
from alembic import op

revision = "20240101_000000"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Users
    op.create_table(
        "users",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("email", sa.String(255), unique=True, nullable=False),
        sa.Column("hashed_password", sa.String(255), nullable=False),
        sa.Column("full_name", sa.String(255), nullable=True),
        sa.Column("is_active", sa.Boolean(), default=True, nullable=False),
        sa.Column("is_superuser", sa.Boolean(), default=False, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
        sa.Column("last_login", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_users_email_active", "users", ["email", "is_active"])

    # Modules
    op.create_table(
        "modules",
        sa.Column("id", sa.String(100), primary_key=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("description", sa.String(1000), nullable=True),
        sa.Column("version", sa.String(50), default="0.1.0", nullable=False),
        sa.Column("enabled", sa.Boolean(), default=True, nullable=False),
        sa.Column("config_schema", sa.JSON(), default={}, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
    )

    # Module Configs
    op.create_table(
        "module_configs",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("user_id", sa.String(36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("module_id", sa.String(100), sa.ForeignKey("modules.id", ondelete="CASCADE"), nullable=False),
        sa.Column("config", sa.JSON(), default={}, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
    )
    op.create_index("ix_module_configs_user_module", "module_configs", ["user_id", "module_id"], unique=True)

    # Jobs
    op.create_table(
        "jobs",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("type", sa.String(100), nullable=False),
        sa.Column("user_id", sa.String(36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("module_id", sa.String(100), sa.ForeignKey("modules.id", ondelete="SET NULL"), nullable=True),
        sa.Column("status", sa.String(20), default="pending", nullable=False),
        sa.Column("priority", sa.Integer(), default=50, nullable=False),
        sa.Column("payload", sa.JSON(), default={}, nullable=False),
        sa.Column("result", sa.JSON(), nullable=True),
        sa.Column("error", sa.String(5000), nullable=True),
        sa.Column("progress", sa.Float(), default=0.0, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_jobs_user_status", "jobs", ["user_id", "status"])
    op.create_index("ix_jobs_module_status", "jobs", ["module_id", "status"])
    op.create_index("ix_jobs_created_status", "jobs", ["created_at", "status"])
    op.create_index("ix_jobs_type", "jobs", ["type"])

    # Job Logs
    op.create_table(
        "job_logs",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("job_id", sa.String(36), sa.ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False),
        sa.Column("level", sa.String(20), nullable=False),
        sa.Column("message", sa.String(5000), nullable=False),
        sa.Column("context", sa.JSON(), default={}, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_job_logs_job_level", "job_logs", ["job_id", "level"])

    # Files
    op.create_table(
        "files",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("filename", sa.String(500), nullable=False),
        sa.Column("path", sa.String(1000), nullable=False),
        sa.Column("size", sa.Integer(), nullable=False),
        sa.Column("mime_type", sa.String(100), nullable=False),
        sa.Column("checksum", sa.String(64), nullable=False),
        sa.Column("user_id", sa.String(36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("job_id", sa.String(36), sa.ForeignKey("jobs.id", ondelete="SET NULL"), nullable=True),
        sa.Column("module_id", sa.String(100), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
    )
    op.create_index("ix_files_user_module", "files", ["user_id", "module_id"])
    op.create_index("ix_files_checksum", "files", ["checksum"])

    # File Tags
    op.create_table(
        "file_tags",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("file_id", sa.String(36), sa.ForeignKey("files.id", ondelete="CASCADE"), nullable=False),
        sa.Column("tag", sa.String(100), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_file_tags_file_tag", "file_tags", ["file_id", "tag"], unique=True)

    # AI Usage Logs
    op.create_table(
        "ai_usage_logs",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("user_id", sa.String(36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("provider", sa.String(50), nullable=False),
        sa.Column("model", sa.String(100), nullable=False),
        sa.Column("prompt_tokens", sa.Integer(), default=0, nullable=False),
        sa.Column("completion_tokens", sa.Integer(), default=0, nullable=False),
        sa.Column("total_tokens", sa.Integer(), default=0, nullable=False),
        sa.Column("estimated_cost", sa.Float(), default=0.0, nullable=False),
        sa.Column("request_type", sa.String(50), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_ai_usage_user_provider", "ai_usage_logs", ["user_id", "provider"])
    op.create_index("ix_ai_usage_user_model", "ai_usage_logs", ["user_id", "model"])
    op.create_index("ix_ai_usage_created", "ai_usage_logs", ["created_at"])
    op.create_index("ix_ai_usage_type_date", "ai_usage_logs", ["request_type", "created_at"])

    # Settings
    op.create_table(
        "settings",
        sa.Column("id", sa.String(100), primary_key=True),
        sa.Column("category", sa.String(50), nullable=False),
        sa.Column("description", sa.String(500), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
    )

    op.create_table(
        "setting_values",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("settings_id", sa.String(100), sa.ForeignKey("settings.id", ondelete="CASCADE"), nullable=False),
        sa.Column("key", sa.String(100), nullable=False),
        sa.Column("value", sa.String(5000), nullable=False),
        sa.Column("value_type", sa.String(20), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
    )
    op.create_index("ix_setting_values_settings_key", "setting_values", ["settings_id", "key"], unique=True)


def downgrade() -> None:
    op.drop_table("setting_values")
    op.drop_table("settings")
    op.drop_table("ai_usage_logs")
    op.drop_table("file_tags")
    op.drop_table("files")
    op.drop_table("job_logs")
    op.drop_table("jobs")
    op.drop_table("module_configs")
    op.drop_table("modules")
    op.drop_table("users")
