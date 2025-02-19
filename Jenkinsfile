pipeline {
    agent any

    triggers {
        cron('0 9 * * *')
    }

    environment {
        HOLIDAY_API_KEY = credentials('HOLIDAY_API_KEY')
        SLACK_WEBHOOK_URL = credentials('SLACK_WEBHOOK_URL')
    }

    stages {
        stage('Setup') {
            steps {
                sh '''
                    if ! command -v node &> /dev/null; then
                        curl -sL https://deb.nodesource.com/setup_16.x | sudo -E bash -
                        sudo apt-get install -y nodejs
                    fi
                '''
                sh 'npm install'
            }
        }

        stage('Run Holiday Check') {
            steps {
                sh 'node holiday_rates_checker.js'
            }
        }
    }

    post {
        failure {
            script {
                def webhookUrl = env.SLACK_WEBHOOK_URL
                sh """
                    curl -X POST -H 'Content-type: application/json' --data '{"text":"Ошибка при выполнении проверки праздников и курсов валют"}' ${webhookUrl}
                """
            }
        }
    }
}
