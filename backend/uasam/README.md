# To start UASAM

> docker compose -f docker-compose/docker-compose-local.yml up --build

# To migrate DataBases

> docker exec -it docker-compose-uasam-backend-1 bash
> python manage.py makemigrations

You should see a new file in the migrations folder

> python manage.py migrate

This applies those migration files

# To accesss DB

> docker exec -it docker-compose-uasam-db-1 bash
> psql -U uasamuser -d uasamdb

# To create superuser

> docker exec -it docker-compose-uasam-backend-1 bash
> python manage.py createsuperuser

Access the Admin Panel here

> http://localhost:8000/admin/login/?next=/admin/
