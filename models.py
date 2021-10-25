from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class User(db.Model):
    __tablename__ = 'usr'

    usrid = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.Text, unique=True)
    email = db.Column(db.String(50), index=True, unique=True)
    hashed_password = db.Column(db.String(50), index=True, unique=True)
    roles = db.Column(db.Text, default=True, server_default="operator")
    is_active = db.Column(db.Boolean, default=True, server_default="true")

    @property
    def identity(self):
        return self.usrid

    @property
    def rolenames(self):
        try:
            return self.roles.split(",")
        except Exception:
            return []

    @property
    def password(self):
        return self.hashed_password

    @classmethod
    def lookup(cls, email):
        return cls.query.filter_by(email=email).one_or_none()

    @classmethod
    def identify(cls, usrid):
        return cls.query.get(usrid)

    def is_valid(self):
        return self.is_active
    