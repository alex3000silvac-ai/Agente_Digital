from setuptools import setup, find_packages

setup(
    name="agente-digital",
    version="1.0.0",
    packages=find_packages(),
    install_requires=[
        "Flask==2.3.3",
        "Flask-CORS==4.0.0",
        "Flask-Login==0.6.2",
        "pyodbc==5.0.1",
        "psycopg2-binary==2.9.9",
        "SQLAlchemy==2.0.23",
        "PyJWT==2.8.0",
        "python-dotenv==1.0.0",
        "werkzeug==2.3.7",
        "python-docx==1.1.0",
        "gunicorn==21.2.0",
        "requests==2.31.0",
        "pytz==2023.3"
    ]
)