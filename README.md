# OpenBanking Gateway Installation Guide

Welcome to the OpenBanking Gateway project. This guide provides detailed instructions for setting up the web and server services using pnpm in a mono-repository structure.

## Prerequisites

You can choose to run this on your local environment or using Docker/Docker Compose. Before you begin, ensure you have the following installed depending on your preference.

### Docker

- Docker (v23.0 or higher)

### Local Setup (optional)

- Node.js (v18 or higher)
- MySQL (v8)
- Kong (v3.5.0 or higher)
- Elasticsearch (v8.11.1 or higher)
- Logstash (v8.11.1 or higher)


## Installation Steps

### 1. Clone the Repository

Start by cloning the OpenBanking Gateway repository:

```shell
git clone https://github.com/openbankingnigeria/obn-gateway
cd obn-gateway
```

### 2. Configure Environment Variables

Set up the required environment variables. For a quick start, you can use the provided `.env.example` file as is. Copy it to a new `.env` file in the root of the project:

```shell
cp .env.example .env
```

**Do not use default credentials for production.**

To configure the app for your specific environment, edit the .env file to update the following variables:

- `COMPANY_NAME`
- `COMPANY_EMAIL`
- `DEFAULT_PASSWORD`
- `MANAGEMENT_URL`
- `EMAIL_PORT`
- `EMAIL_PASSWORD`
- `EMAIL_USER`
- `EMAIL_SECURE`
- `EMAIL_FROM`
- `EMAIL_HOST`
- `ELASTICSEARCH_USERNAME`
- `ELASTICSEARCH_PASSWORD`

For optimal functionality, review the additional environment variables defined in the .env.example file and customize them as necessary for your setup.

### 3. Docker setup (preferred)

To launch the services using Docker Compose, run the following command:

```shell
docker compose --profile "*" up -d --build
```

This command will set up the web and server services along with other dependencies like Kong, Elasticsearch, Logstash, and MySQL.

### 4. Local Setup (optional)

If you prefer to set up the project locally, follow these steps.

Install and run the project dependencies locally using pnpm:

```bash
pnpm install
pnpm dev
```

### 5. Accessing the Services

- **server:** Exposes the management application APIs, available on port 4000 by default.
- **web:** Exposes the management application interface, available on port 3000 by default.
- **kong:** Exposes the API gateway APIs, available on ports 8000 (development) and 8100 (production) by default.
- **logstash:** Collects logs from the Kong service.
- **elasticsearch:** Provides search and analytics on logs from Kong.
- **maildev (`dev` only):** A developer interface for testing emails. The web app runs on [http://localhost:1080]().

### 6. Verify Installation

To verify that the installation was successful, check that all Docker containers are in a 'healthy' status:

```shell
docker ps
```

Ensure each container's `STATUS` is `healthy`.

## Troubleshooting

If you encounter any problems, check the Docker container logs for any errors:

```shell
docker logs <container_name>
```

Most issues can be resolved by reviewing the logs. If problems persist, consult the project documentation or seek help from the community.
