# OpenBanking Gateway Installation Guide

Welcome to the OpenBanking Gateway project. This guide provides detailed instructions for setting up the web and server services using pnpm in a mono-repository structure.

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v16 or higher)
- MySQL (v8)
- Docker and Docker Compose

## Installation Steps

1. **Clone the Repository**

Start by cloning the OpenBanking Gateway repository:

```bash
git clone https://github.com/openbankingnigeria/obn-gateway
cd obn-gateway
```

2. **Environment Variables**

Configure the required environment variables. In the Docker Compose file, set the following:
- `COMPANY_NAME`
- `COMPANY_EMAIL`
- `DEFAULT_PASSWORD`

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
docker-compose up -d --build
```

This command will set up the web and server services along with other dependencies like Kong, Elasticsearch, Logstash, and MySQL.

5. **Accessing the Services**

By default, the server service is available at http://localhost:4000.
By default, the web service is available at http://localhost:3000.

6. **Verify Installation**

To verify that the installation was successful, check that all Docker containers are in a 'healthy' status.

## Troubleshooting

If you encounter any problems, check the Docker container logs for any errors. Since there are no major known issues, most problems should be resolvable by reviewing the logs.
