import sqlite3

# Connect to the SQLite database
conn = sqlite3.connect("/Users/krishnagaurav/uniplexa/src/test.db")
cursor = conn.cursor()

# Add a new column to the table
cursor.execute("ALTER TABLE users ADD COLUMN building_id INTEGER")

# Commit the changes and close the connection
conn.commit()
conn.close()