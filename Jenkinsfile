pipeline {
    agent {
        label 'node1'
    }

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
                sh 'npm install'
            }
        }

        stage('Run Script') {
            steps {
                withCredentials([
                    string(credentialsId: 'HOLIDAY_API_KEY', variable: 'HOLIDAY_API_KEY'),
                    string(credentialsId: 'SLACK_WEBHOOK_URL', variable: 'SLACK_WEBHOOK_URL')
                ]) {
                    sh 'node holiday_rates_checker.js'
                }
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
