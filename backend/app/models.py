"""HR data models: login accounts, employees, attendance, leave and tasks."""
from sqlalchemy import (
    Boolean, Column, Date, DateTime, ForeignKey, Integer, String, Text, Time,
    UniqueConstraint, func,
)
from sqlalchemy.orm import relationship

from .database import Base

# Allowed values (kept as plain strings so SQLite and Postgres both work)
ROLES = ("admin", "hr", "employee")
EMPLOYEE_STATUS = ("active", "probation", "on_leave", "resigned")
ATTENDANCE_STATUS = ("present", "late", "absent", "on_leave")
LEAVE_TYPES = ("vacation", "sick", "emergency", "unpaid")
LEAVE_STATUS = ("pending", "approved", "rejected")
TASK_STATUS = ("todo", "in_progress", "done")


class User(Base):
    """A login account. Every employee has one; role decides what they may see."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False, default="employee")  # admin | hr | employee
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, server_default=func.now())

    employee = relationship("Employee", back_populates="user", uselist=False)


class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True)
    name = Column(String(100), unique=True, nullable=False)

    employees = relationship("Employee", back_populates="department")


class Employee(Base):
    """The person's HR record (separate from their login)."""
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    employee_no = Column(String(20), unique=True, nullable=False)  # e.g. "EMP-0001"
    first_name = Column(String(80), nullable=False)
    last_name = Column(String(80), nullable=False)
    phone = Column(String(30))
    position = Column(String(100))
    department_id = Column(Integer, ForeignKey("departments.id"))
    manager_id = Column(Integer, ForeignKey("employees.id"))  # who they report to (another employee)
    status = Column(String(20), nullable=False, default="active")  # active | probation | on_leave | resigned
    hire_date = Column(Date, nullable=False)

    user = relationship("User", back_populates="employee")
    department = relationship("Department", back_populates="employees")
    attendance = relationship("Attendance", back_populates="employee", cascade="all, delete-orphan")
    leave_requests = relationship(
        "LeaveRequest", back_populates="employee", foreign_keys="LeaveRequest.employee_id",
        cascade="all, delete-orphan",
    )
    tasks = relationship("Task", back_populates="assignee", foreign_keys="Task.assignee_id")


class Attendance(Base):
    """One row per employee per day."""
    __tablename__ = "attendance"
    __table_args__ = (UniqueConstraint("employee_id", "work_date", name="uq_attendance_day"),)

    id = Column(Integer, primary_key=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False, index=True)
    work_date = Column(Date, nullable=False, index=True)
    time_in = Column(Time)
    time_out = Column(Time)
    status = Column(String(20), nullable=False, default="present")  # present | late | absent | on_leave
    note = Column(String(200), default="")

    employee = relationship("Employee", back_populates="attendance")


class LeaveRequest(Base):
    __tablename__ = "leave_requests"

    id = Column(Integer, primary_key=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False, index=True)
    leave_type = Column(String(20), nullable=False)  # vacation | sick | emergency | unpaid
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    reason = Column(Text, default="")
    status = Column(String(20), nullable=False, default="pending")  # pending | approved | rejected
    reviewed_by = Column(Integer, ForeignKey("employees.id"))  # the HR person who decided
    reviewed_at = Column(DateTime)
    created_at = Column(DateTime, server_default=func.now())

    employee = relationship("Employee", back_populates="leave_requests", foreign_keys=[employee_id])


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, default="")
    assignee_id = Column(Integer, ForeignKey("employees.id"), nullable=False, index=True)
    assigned_by = Column(Integer, ForeignKey("employees.id"))
    status = Column(String(20), nullable=False, default="todo")  # todo | in_progress | done
    due_date = Column(Date)
    created_at = Column(DateTime, server_default=func.now())

    assignee = relationship("Employee", back_populates="tasks", foreign_keys=[assignee_id])
