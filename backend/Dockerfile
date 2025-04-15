FROM mysql:8.0

ENV MYSQL_ROOT_PASSWORD=root
ENV MYSQL_DATABASE=jeelaqua_water_db

# Copy the schema to initialize the DB (only runs if /var/lib/mysql is empty)
COPY jeelaqua_water_db.sql /docker-entrypoint-initdb.d/
