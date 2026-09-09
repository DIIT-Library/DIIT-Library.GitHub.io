"""
Database initialization script for Library Management System
Run this once to create all required tables
"""
import MySQLdb
import os
from datetime import datetime, timedelta

# Database connection parameters
HOST = os.environ.get('MYSQLHOST', 'localhost')
USER = os.environ.get('MYSQLUSER', 'root')
PASSWORD = os.environ.get('MYSQLPASSWORD', '')
DATABASE = os.environ.get('MYSQLDATABASE', 'railway')
PORT = int(os.environ.get('MYSQLPORT', 3306))

try:
    conn = MySQLdb.connect(
        host=HOST,
        user=USER,
        passwd=PASSWORD,
        db=DATABASE,
        port=PORT,
        charset='utf8mb4'
    )
    cursor = conn.cursor()
    print("✓ Database connected successfully")
    
    # Create users table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            user_id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            role VARCHAR(50) DEFAULT 'staff',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    """)
    print("✓ Created 'users' table")
    
    # Create books table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS books (
            book_id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            author VARCHAR(255) NOT NULL,
            isbn VARCHAR(20) UNIQUE,
            category VARCHAR(100),
            total_copies INT DEFAULT 1,
            available_copies INT DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    """)
    print("✓ Created 'books' table")
    
    # Create members table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS members (
            member_id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(100),
            phone VARCHAR(20),
            address TEXT,
            member_code VARCHAR(20) UNIQUE,
            membership_expire DATE,
            status VARCHAR(50) DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    """)
    print("✓ Created 'members' table")
    
    # Create transactions table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS transactions (
            transaction_id INT AUTO_INCREMENT PRIMARY KEY,
            book_id INT NOT NULL,
            member_id INT NOT NULL,
            issue_date DATE DEFAULT CURRENT_DATE,
            due_date DATE NOT NULL,
            return_date DATE,
            fine_amount INT DEFAULT 0,
            status VARCHAR(50) DEFAULT 'issued',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (book_id) REFERENCES books(book_id),
            FOREIGN KEY (member_id) REFERENCES members(member_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    """)
    print("✓ Created 'transactions' table")
    
    # Insert default admin user
    cursor.execute("""
        INSERT IGNORE INTO users (username, password, role)
        VALUES ('admin', 'admin123', 'admin')
    """)
    print("✓ Inserted default admin user (username: admin, password: admin123)")
    
    conn.commit()
    cursor.close()
    conn.close()
    print("\n✓ Database initialization completed successfully!")
    
except MySQLdb.Error as e:
    print(f"✗ Database Error: {e}")
except Exception as e:
    print(f"✗ Error: {e}")

