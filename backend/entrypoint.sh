#!/bin/sh

if [ -z "${DB_URL:-}" ]; then
    echo "DB_URL is required in the deployment environment" >&2
    exit 1
fi

case "$DB_URL" in
    jdbc:*) ;;
    postgres://*|postgresql://*)
        DB_URL="${DB_URL#*://}"
        DB_URL="${DB_URL#*@}"
        DB_URL="jdbc:postgresql://$DB_URL"
        ;;
    *) DB_URL="jdbc:$DB_URL" ;;
esac

case "$DB_URL" in
    jdbc:postgresql://*) echo "Using PostgreSQL datasource" ;;
    jdbc:mysql://*) echo "Using MySQL datasource" ;;
    *) echo "Unsupported database URL scheme" >&2; exit 1 ;;
esac

export DB_URL

exec java -jar /app/app.jar