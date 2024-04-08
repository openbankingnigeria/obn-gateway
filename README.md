# OpenBanking Gateway Installation Guide

Welcome to the OpenBanking Gateway project. This guide provides detailed instructions for setting up the web and server services using pnpm in a mono-repository structure.

## Prerequisites

You can choose to run this on your local environment, or using docker/docker compose. Before you begin, ensure you have the following installed depending on your preference.

### Local Setup

- Node.js (v18 or higher)
- MySQL (v8)
- Kong (v3.5.0 or higher)
- Elastic Search (v8.11.1 or higher)
- Logstash (v8.11.1 or higher)

### Docker

- Docker (v23.0 or higher)

## Installation Steps

1. **Clone the Repository**

Start by cloning the OpenBanking Gateway repository:

```bash
git clone https://github.com/openbankingnigeria/obn-gateway
cd obn-gateway
```

2. **Environment Variables**

Configure the required environment variables. In your environment or `.env` file in the root of the project, set the following:
- `COMPANY_NAME`
- `COMPANY_EMAIL`
- `DEFAULT_PASSWORD`
- `EMAIL_PORT`
- `EMAIL_PASSWORD`
- `EMAIL_USER`
- `EMAIL_SECURE`
- `EMAIL_FROM`
- `EMAIL_HOST`
- `ELASTICSEARCH_USERNAME`
- `ELASTICSEARCH_PASSWORD`

These variables can be adjusted to fit your specific requirements.

Other environment variables that may be needed for optimal functionality of the platform exist in the `.env.example` file.

3. **Local Setup**

Install and run the project dependencies locally using pnpm:

```bash
pnpm install
pnpm dev
```

4. **Docker Compose**

Launch the services using Docker Compose:

```bash
docker compose --profile "*" up -d --build
```

This command will set up the web and server services along with other dependencies like Kong, Elasticsearch, Logstash, and MySQL.

5. **Accessing the Services**

- server: exposes the management application APIs, available on port :4000 by default
- web: exposes the management application interface, available on port :3000 by default
- kong: exposes the api gateway APIs, available on port :8000/:8100 by default
- logstash: collects logs from the kong service
- elasticsearch: provides search and analytics on logs from kong

6. **Verify Installation**

To verify that the installation was successful, check that all Docker containers are in a 'healthy' status.

## Troubleshooting

If you encounter any problems, check the Docker container logs for any errors. Since there are no major known issues, most problems should be resolvable by reviewing the logs.
