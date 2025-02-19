pipeline {
    agent {
        kubernetes {
            yaml '''
                apiVersion: v1
                kind: Pod
                metadata:
                  labels:
                    app: jenkins-agent
                spec:
                  containers:
                  - name: nodejs
                    image: node:18
                    command:
                    - cat
                    tty: true
                  - name: kubectl
                    image: bitnami/kubectl
                    command:
                    - cat
                    tty: true
            '''
        }
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
                container('nodejs') {
                    sh 'npm install'
                }
            }
        }

        stage('Run Script') {
            steps {
                container('nodejs') {
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
