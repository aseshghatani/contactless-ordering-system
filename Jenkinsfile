pipeline {
    agent any

    environment {
        // Optionally define environment variables if needed
        DOCKER_COMPOSE_PROJECT = 'todolist1'
        GIT_REPO_URL = 'https://github.com/Sylviahmar/COS.git'
        GITHUB_CREDENTIALS = 'my-github-token'
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out code...'
                checkout([ 
                    $class: 'GitSCM', 
                    branches: [[name: '*/main']], 
                    userRemoteConfigs: [[ 
                        url: GIT_REPO_URL, 
                        credentialsId: GITHUB_CREDENTIALS 
                    ]] 
                ])
            }
        }

        stage('Build') {
            steps {
                echo 'Building Docker Compose services...'
                // Use sh for Linux agents, bat for Windows
                sh 'docker-compose -p ${DOCKER_COMPOSE_PROJECT} build'
            }
        }

        stage('Run Tests') {
            steps {
                echo 'Skipping tests for now...'
                // Optionally add your test steps here
            }
        }

        stage('Deploy') {
            steps {
                echo 'Deploying the application using Docker Compose...'
                script {
                    // ✅ ADD: Remove existing container first to avoid conflict
                    sh 'docker rm -f chatapp || true'

                    // Stop and remove existing containers, volumes, and networks
                    sh """
                        docker-compose -p todolist1 down --remove-orphans
                        docker-compose -p todolist1 up -d --build
                    """
                }
            }
        }
    }

    post {
        always {
            echo 'Cleaning up Docker resources...'
            // Optionally stop containers or perform cleanup tasks
            sh 'docker-compose -p ${DOCKER_COMPOSE_PROJECT} down'
        }

        success {
            echo 'Deployment was successful!'
        }

        failure {
            echo 'Deployment failed.'
        }
    }
}
