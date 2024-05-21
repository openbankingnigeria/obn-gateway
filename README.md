# OpenBanking Gateway Installation Guide

Welcome to the OpenBanking Gateway project. This guide provides detailed instructions for setting up the web and server services using pnpm in a mono-repository structure.

## Prerequisites

You can choose to run this on your local environment or using Docker/Docker Compose. Docker is the preferred method for ease of setup and consistency.

### Docker (preferred)

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

Update these variables to configure the app for your specific environment. At a minimum, you'll need to provide values for the following variables:

- `COMPANY_NAME`
- `COMPANY_EMAIL`
- `DEFAULT_PASSWORD`
- `ELASTICSEARCH_PASSWORD`

**Important**: Don't use default credentials for production.

Additional environment variables are defined in the .env.example file and can be customized as necessary for your setup.

### 3. Docker Setup (preferred)

To launch the services using Docker Compose, run the following command:

```shell
docker compose --profile "*" up -d --build
```

This command will set up the web and server services along with other dependencies like Kong, Elasticsearch, Logstash, and MySQL.

### 4. Email service

You will need to configure `EMAIL_` to connect your external email service.

#### maildev (optional for development)

During local development, in cases where you don't have a running email server, you can use `maildev`.

To run `maildev` using Docker:

 ```shell
 docker run -d \
   --name maildev.net \
   -p 3007:3007 \
   -p 1080:80 \
   -e MAILDEV_SMTP_PORT=${EMAIL_PORT} \
   -e MAILDEV_USER=${EMAIL_USER} \
   -e MAILDEV_PASS=${EMAIL_PASSWORD} \
   --network obn-net \
   maildev/maildev bin/maildev --web 80 --smtp 3007
 ```
 
Visit [http://localhost:1080]() to view all messages sent from the application.

### 5. Local Setup (optional)

If you prefer to set up the project locally, follow these steps.

Install and run the project dependencies locally using pnpm:

```bash
pnpm install
pnpm dev
```

### 6. Accessing the Services

- **server:** Exposes the management application APIs, available on port 4000 by default.
- **web:** Exposes the management application interface, available on port 3000 by default.
- **kong:** Exposes the API gateway APIs, available on ports 8000 (development) and 8100 (production) by default.
- **logstash:** Collects logs from the Kong service.
- **elasticsearch:** Provides search and analytics on logs from Kong.

### 7. Verify Installation

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
