#!/bin/bash

# Function to update or add environment variable in .env file
update_env_variable() {
    local key="$1"
    local value="$2"
    if grep -q "^$key=" .env; then
        sed -i '' "s/^$key=.*/$key=$value/" .env
    else
        echo "$key=$value" >> .env
    fi
}

# Prompt user to provide values for missing or empty environment variables in .env file
read_and_update_env_variable() {
    local key="$1"
    local prompt_message="$2"

    if ! grep -q "^$key=" .env || [ -z "$(grep "^$key=" .env | cut -d'=' -f2-)" ]; then
        read -p "$prompt_message" value
        update_env_variable "$key" "$value"
    fi
}

# Check if Docker is installed and its version is at least 23
if ! [ -x "$(command -v docker)" ]; then
    # Docker not installed, download and install the latest version
    echo "Docker is not installed. Downloading and installing the latest version..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
elif [[ "$(docker --version | awk '{print $3}' | cut -d',' -f1 | cut -d'.' -f1)" -lt 23 ]]; then
    # Docker version is below 23, prompt user to update
    echo "Docker version is below 23. Please update to a newer version."
    exit 1
fi

# Check if .env file exists, if not, copy content from .env.example
if [ ! -f ".env" ]; then
    echo ".env file not found. Copying content from .env.example..."
    cp .env.example .env
fi

# Prompt user to provide values for environment variables
read_and_update_env_variable "COMPANY_NAME" "Enter COMPANY_NAME (institution name): "
read_and_update_env_variable "DEFAULT_EMAIL" "Enter DEFAULT_EMAIL (root email): "
read_and_update_env_variable "DEFAULT_PASSWORD" "Enter DEFAULT_PASSWORD (root password): "
read_and_update_env_variable "JWT_SECRET" "Enter JWT_SECRET (random secure value): "

# Run Docker Compose command
docker-compose --profile "*" up -d --build --force-recreate
