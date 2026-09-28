#!/bin/sh

if [ -n "${DB_URL:-}" ]; then
    case "$DB_URL" in
        jdbc:*) ;;
        *) DB_URL="jdbc:$DB_URL" ;;
    esac
    export DB_URL
fi

exec java -jar /app/app.jar