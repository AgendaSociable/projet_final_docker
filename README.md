# projet_final_docker

---

## Arborescence importante (la racine du repo)

```
back-end/
    Dockerfile
    requirements.txt
    main.py, models.py, database.py, ...
    .dockerignore

front-end/
    index.html, app.js

nginx/
    nginx.conf

docker-compose.yml
docker-compose.prod.yml

secrets/
    cat_name.txt (non commité en clair ; ici c'est un exemple)

README.md
.env.example
```

---

## Objectifs / résumé fonctionnel

- Stack multi-conteneurs : frontend (static), backend (FastAPI), DB (Postgres), reverse-proxy (nginx).
- Au moins 2 réseaux Docker (frontend exposé / backend interne).
- Persistance via volumes (DB).
- Dockerfile multi-stage, non-root, healthcheck.
- Compose: mode dev + simulation prod (override).
- Secrets via Docker Compose (fichiers locaux).
- Build multi-architecture (instructions).

---

## Prérequis

- Docker (version récente)
- docker-compose (ou Docker Compose V2 intégré : `docker compose`)
- (optionnel) docker buildx pour multi-arch
- Git


## 1 Structure réseau et services (rappel)

### Réseaux créés par compose :

- **frontend_network** (exposé) — nginx + front-end
- **backend_network** (interne) — backend + db

Le backend est connecté aux deux réseaux.  
La DB (Postgres) est uniquement sur `backend_network`.

---

## 2 Secrets

Les secrets sont fournis via Compose et montés depuis `secrets/`.

Dans un vrai projet les secrets seront dans le .gitignore

---

## 3 Build & Exécution — Mode développement (rapide)

Reconstruire et lancer :

```bash
docker compose build
docker compose up
```
OU

```bash
docker compose up --build
```

Vérifier les logs :

```bash
docker compose logs
docker compose ps
```


**Endpoints utiles** :

- `/health` (backend) — renvoie 200 si OK
- page HTML minimale servie par le frontend (via nginx)

---

## 4 Mode "prod locale" (simulation)

On utilise le fichier `docker-compose.prod.yml` pour basculer sur le target `prod` du Dockerfile.

Lancer (depuis la racine) :

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up --build
```

Ce mode construit les images en target `prod` (optimisées, sans dépendances dev) et démarre la stack comme en "prod locale".

---

## 5 Vérifications / critères demandés

### Non-root

Le Dockerfile crée un utilisateur non-root (`appuser`) et passe en `USER appuser` avant l'exécution. Vérifier depuis l'hôte :

```bash
docker exec -it fastapi_app whoami
# doit afficher : appuser
```

### Healthcheck

Le service applicatif expose un healthcheck.
Vérifier avec :

```bash
docker compose ps
```

### Persistance (volumes)

La DB utilise un volume. Test de persistance :

1. Démarrer la stack
2. Se connecter à l'API ou à la DB et créer une donnée (ex : POST /items ou créer une table + ligne)
3. Redémarrer le service DB :

```bash
docker compose restart db
# ou
docker compose down
docker compose up
```

4. Vérifier que la donnée est toujours présente.


### Réseaux

Vérifier que la DB n'est pas exposée :

```bash
docker network inspect projet_final_docker_backend_network
docker network inspect projet_final_docker_frontend_network
```

La DB doit apparaître uniquement dans `backend_network`.

### Secrets

Vérifier que les secrets sont montés et non présents dans l'image :

```bash
docker exec -it fastapi_app cat /run/secrets/cat_name
```

### Multi-stage & .dockerignore & optimisation

- Le Dockerfile est multi-stage (base/dev/prod).
- `.dockerignore` exclut test_ignore.txt


## 6 Build multi-architecture (AMD64 + ARM64)

Pour produire des images multi-arch (push vers un registry) :

Initialiser buildx si nécessaire :

```bash
docker buildx create --use
docker buildx inspect --bootstrap
```

Construire et pousser (exemple avec GHCR ou Docker Hub) :

```bash
docker buildx build --platform linux/amd64,linux/arm64 \
  --tag agendasociable/fastapi_app:latest \
  --tag agendasociable/fastapi_app:1.0.0 \
  --push \
  -f back-end/Dockerfile back-end/
```


## 11 Exemples rapides de tests automatiques (à exécuter en local)

**Lancer en mode dev** :

**Vérifier health** :

```bash
curl -I http://localhost:8080/health
```

**Vérifier non-root** :

```bash
docker exec -it fastapi_app whoami
# attendu : appuser
```

**Vérifier persistance** :

1. POST une entité via l'API (ou créer une ligne en SQL)
2. `docker compose down`
3. `docker compose up -d`
4. GET l'entité → doit être toujours présente

