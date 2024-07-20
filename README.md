# OpenBanking Gateway Installation Guide  

Welcome to the OpenBanking Gateway project. This guide provides detailed instructions for setting up the web and server services using pnpm in a mono-repository structure.  

## Prerequisites  

You can choose to run this on your local environment or using Docker/Docker Compose. Docker is the preferred method for ease of setup and consistency as all dependencies are defined within the docker-compose configuration file.  

## Docker Installation Steps

### 0. Quick Setup

For a rapid deployment, bypass manual configuration steps 1 through 4 by executing the setup script below. This script automates the cloning of the OpenBanking Gateway repository, the setup of necessary environment variables, and the initiation of the Docker containers.

Execute the following command in your terminal:

```shell  
curl -fsSL raw.githubusercontent.com/openbankingnigeria/obn-gateway/main/install.sh -o install.sh && sh install.sh
cd obn-gateway
```

### 1. Docker Version

Confirm your Docker version is v23.0 or higher

### 2. Clone the Repository  

Start by cloning the OpenBanking Gateway repository:  

```shell  
git clone https://github.com/openbankingnigeria/obn-gateway
cd obn-gateway  
```  

### 3. Configure Environment Variables  

- For a quick start, you can use the provided `.env.example` file as is, using this command:

```shell  
cp .env.example .env  
```

- `.env` file would be created in the root of the project folder you have cloned
- Update these variables on the `.env` to configure the app for your specific environment. At a minimum, you'll need to provide values for the following variables:  
- `COMPANY_NAME`  - This is your institution name
- `DEFAULT_EMAIL`  - This is the root email you would be logging into the platform with when the application is deployed
- `DEFAULT_PASSWORD`  - This is the root password you be logging into the platform with when the application is deployed
- `JWT_SECRET`  - This can be any random secure value you choose

**Important**: Don't use default credentials for production.  

Additional environment variables are defined in the `.env.example` file and can be customized as necessary for your setup.  

### 4. Setting up your Docker env

To launch the services using Docker Compose, run the following command:  

```shell  
docker compose --profile "*" up -d --build --force-recreate  
```

This command will set up the web and server services along with other dependencies like Kong, Elasticsearch, Logstash, and MySQL.  

### 5. Email service  

Configure your email service if you have one, you'll need to update the `env` variables with respect to the chosen email service.

#### Mock Email Service using MailDev (optional)  

Alternatively, in cases where you don't have a running email server, you can use `maildev` for *development purposes only*.

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

Visit <http://localhost:1080> to view all messages sent from the application.  

### 6. Verify Installation

To verify that the installation was successful, check that all Docker containers are in a 'healthy' status:  

```shell  
docker ps  
```

Ensure each container's `STATUS` is `healthy`.  

### 7. Accessing the Services  

- **Backend Service:** Exposes the management application APIs, available on port 4000 by default.  e.g. <http://localhost:4000>
- **Web App:** Exposes the management application interface, available on port 3000 by default.  e.g. <http://localhost:3000>
- **Kong:** Exposes the API gateway APIs, available on ports 8000 (development) and 8100 (production) by default.  e.g. <http://localhost:8000> or e.g. <http://localhost:8100>

- **Logstash:** Collects logs from the Kong service.  
- **Elastic Service:** Provides search and analytics on logs from Kong.  

## Local Installation Steps (optional)

### 1 Local Setup Requirements

Ensure the below dependencies are available on the applicable environment:

- Node.js (v18 or higher)  
- MySQL (v8)  
- Kong (v3.5.0 or higher)  
- Elasticsearch (v8.11.1 or higher)  
- Logstash (v8.11.1 or higher)  

### 2. Clone the Repository

Start by cloning the OpenBanking Gateway repository:  

```shell  
git clone https://github.com/openbankingnigeria/obn-gateway
cd obn-gateway  
```

### 3. Configure Environment Variables

Same as step 3 for Docker installation

### 4. Email service  

Same as step 4 for Docker installation

### 5. Local Setup

If you prefer to set up the project locally, install and run the project dependencies locally using pnpm:  

```bash  
pnpm install  
pnpm dev  
```  

### 6. Accessing the Services  

Same as step 7 for Docker installation

## Troubleshooting  

If you encounter any problems, check the Docker container logs for any errors:  

```shell  
docker compose --profile "*"  logs  
```  

Most issues can be resolved by reviewing the logs. If problems persist, consult the [project documentation](https://docs.google.com/document/d/17clf2IJ0nr0XdXWFL9S9POgsFPmUOwTlqeJnkyxzkQc/edit?usp=sharing) or seek help from the community.
