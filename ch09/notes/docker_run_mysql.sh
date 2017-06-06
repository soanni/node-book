#!/bin/sh
docker run --name mysql-server -e MYSQL_ROOT_PASSWORD=secret -d -p 3306:3306 mysql
