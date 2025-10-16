# COMPX374-Attendance-Tracker
Dockerized Spring Boot + MariaDB prototype for class attendance tracking. Staff can create sessions, upload rosters, and export reports. Students mark attendance via secure links with geolocation/IP verification. Built for COMPX374 Group Project , University of Waikato.

# How to run 

# Attendance App Backend

This project runs a **Spring Boot API** with a **MariaDB database** using **Docker Compose**.  
It handles attendance data and provides REST APIs connected to a relational database.

---

## Prerequisites

Before running the project, make sure you have:

- [Docker](https://www.docker.com/get-started) installed  
- (Optional) Docker Compose (usually included with Docker Desktop)
- Java 17+ (only needed if you plan to build/run outside Docker)
- Free ports **8080** (for backend) and **3307** (for database)

---

##  How to Run the Project

###  Start Docker

Make sure Docker Desktop or the Docker daemon is running on your system.

###  Build and Start Both Containers (Backend + Database)

In your project’s **root directory** (where `docker-compose.yml` is located), run:

docker compose build
docker compose up

Accessing the Database

Once the database container (attendance-db) is running, open a new terminal and enter:

docker exec -it attendance-db mariadb -u attend -p

enter the password:

attendpw


Now you’re inside the MariaDB shell.
You can verify the setup by running:

SHOW DATABASES;
USE attend;
SHOW TABLES;

These credentials are  in the  docker-compose.yml file:

Setting	Value
Database	attend
Username	attend
Password	attendpw
Root Password	rootpw
Host	localhost
Port	3307
