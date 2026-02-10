# Frontend

TODO:

- Set up ReactJS with NodeJS
- Use TypeScript

# Run

## Running frontend for dev

> npm run dev

## For building the Frontend

> cd frontend
> npm install
> npm run build

## To run the server

> npx tsc
> `node dist/index.js`

## For Docker

- To Run the projects run:

  > docker compose -f docker-compose/docker-compose-local.yml up -d --build
  > docker compose -f docker-compose/docker-compose-local.yml up --build

- To Stop:

  > docker compose -f docker-compose/docker-compose-local.yml down
