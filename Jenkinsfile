pipeline {
    agent any

    triggers {
        cron('0 9 * * *')
    }

    environment {
        HOLIDAY_API_KEY = credentials('HOLIDAY_API_KEY')
        SLACK_WEBHOOK_URL = credentials('SLACK_WEBHOOK_URL')
        PATH = "$PATH:/var/lib/jenkins/node/bin"
    }

    stages {
        stage('Setup') {
            steps {
                sh '''
                    # Проверяем наличие Node.js
                    if ! command -v node &> /dev/null; then
                        # Создаем директорию для Node.js
                        mkdir -p /var/lib/jenkins/node
                        
                        # Скачиваем и распаковываем Node.js (.tar.gz вместо .tar.xz)
                        curl -fsSL https://nodejs.org/dist/v16.20.2/node-v16.20.2-linux-x64.tar.gz | tar -xz -C /var/lib/jenkins/node --strip-components=1
                        
                        # Проверяем установку
                        /var/lib/jenkins/node/bin/node --version
                        /var/lib/jenkins/node/bin/npm --version
                    fi
                    
                    # Устанавливаем зависимости
                    cd $WORKSPACE  # Переходим в директорию проекта
                    /var/lib/jenkins/node/bin/npm install
                '''
            }
        }

        stage('Run Holiday Check') {
            steps {
                sh '''
                    cd $WORKSPACE
                    /var/lib/jenkins/node/bin/node holiday_rates_checker.js
                '''
            }
        }
    }

    post {
        failure {
            script {
                sh """
                    curl -X POST -H 'Content-type: application/json' --data '{"text":"Ошибка при выполнении проверки праздников и курсов валют"}' ${SLACK_WEBHOOK_URL}
                """
            }
        }
    }
}
