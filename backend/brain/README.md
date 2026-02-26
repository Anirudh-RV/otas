# To start BRAIN

docker compose -f docker-compose/docker-compose-local.yml up --build

# To migrate DataBases
> docker exec -it docker-compose-brain-backend-1 bash
> python manage.py makemigrations
> python manage.py migrate

# To accesss DB

> docker exec -it docker-compose-brain-db-1 bash
> psql -U brainuser -d braindb
