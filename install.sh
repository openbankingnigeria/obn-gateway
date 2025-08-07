#!/bin/bash

# Function to update or add environment variable in .env file
update_env_variable() {
    local key="$1"
    local value="$2"
    if grep -q "^$key=" .env; then
        if sed -i '' "s/^$key=.*/$key=$value/" .env >/dev/null 2>&1; then
            return 0
        else
            # Try sed -i without empty string argument
            sed -i "s/^$key=.*/$key=$value/" .env
        fi
    else
        echo "$key=$value" >> .env
    fi
}

# Prompt user to provide values for missing or empty environment variables in .env file
read_and_update_env_variable() {
    local key="$1"
    local prompt_message="$2"
    local value

    if ! grep -q "^$key=" .env || [ -z "$(grep "^$key=" .env | cut -d'=' -f2-)" ]; then
        read -p "$prompt_message" value
        if [ -z "$value" ]; then
            echo "Value cannot be empty. Please provide a value."
            read_and_update_env_variable "$key" "$prompt_message"
        else
            update_env_variable "$key" "$value"
        fi
    fi
}

# Check if Docker is installed and its version is at least 23
if ! [ -x "$(command -v docker)" ]; then
    # Docker not installed, download and install the latest version
    echo "Docker is not installed. Downloading and installing the latest version..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh || exit 1
elif [[ "$(docker --version | awk '{print $3}' | cut -d',' -f1 | cut -d'.' -f1)" -lt 23 ]]; then
    # Docker version is below 23, prompt user to update
    echo "Docker version is below 23. Please update to a newer version."
    exit 1
fi

# Check if Git is installed, if not, install it
if ! [ -x "$(command -v git)" ]; then
    echo "Git is not installed. Installing Git..."
    if [ -x "$(command -v apt-get)" ]; then
        sudo apt-get update
        sudo apt-get install -y git || exit 1
    elif [ -x "$(command -v yum)" ]; then
        sudo yum install -y git || exit 1
    else
        echo "Unable to install Git. Please install Git manually."
        exit 1
    fi
fi

# Check if script is in repository directory, if not, clone the repository
if [ ! -d ".git" ]; then
    echo "Not in a repository directory. Cloning repository..."
    git clone https://github.com/openbankingnigeria/obn-gateway.git
    cd obn-gateway
fi

# Check if .env file exists, if not, copy content from .env.example
if [ ! -f ".env" ]; then
    echo ".env file not found. Copying content from .env.example..."
    cp .env.example .env
fi

# Check if .env.test file exists, if not, copy content from .env.test.example
if [ ! -f ".env.test" ]; then
    echo ".env.test file not found. Copying content from .env.test.example..."
    cp .env.test.example .env.test
fi

# Prompt user to provide values for environment variables
read_and_update_env_variable "COMPANY_NAME" "Enter COMPANY_NAME (institution name): "
read_and_update_env_variable "DEFAULT_EMAIL" "Enter DEFAULT_EMAIL (root email): "
read_and_update_env_variable "DEFAULT_PASSWORD" "Enter DEFAULT_PASSWORD (root password): "
read_and_update_env_variable "JWT_SECRET" "Enter JWT_SECRET (random secure value): "

# Run Docker Compose command
docker compose --profile "*" up -d --build --force-recreate
