## Railway connection Shortcuts
Added to zsh alias
alias fleetdb='psql "postgresql://postgres:REDACTED@your-db-host:5432/railway"'
which enables connecting to the DB with just writing `fleetdb`

To run migrations after deploy
DATABASE_URL="postgresql://postgres:REDACTED@your-db-host:5432/railway" npx prisma migrate deploy

For seeding
DATABASE_URL="postgresql://postgres:REDACTED@your-db-host:5432/railway" npx prisma db seed