## Railway connection Shortcuts
Added to zsh alias
alias fleetdb='psql "$FLEET_PROD_DATABASE_URL"'
which enables connecting to the DB with just writing `fleetdb`
(set `FLEET_PROD_DATABASE_URL` in your shell profile, or fetch it on demand with `railway variables`)

To run migrations after deploy
DATABASE_URL="$FLEET_PROD_DATABASE_URL" npx prisma migrate deploy

For seeding
DATABASE_URL="$FLEET_PROD_DATABASE_URL" npx prisma db seed
