pipeline {
    agent any

    options {
        disableConcurrentBuilds()                       // one deploy at a time
        buildDiscarder(logRotator(numToKeepStr: '10'))  // keep the last 10 builds
        timeout(time: 20, unit: 'MINUTES')
    }

    triggers {
        // check GitHub for new commits every ~2 minutes
        // (a VirtualBox NAT VM cannot receive GitHub webhooks)
        pollSCM('H/2 * * * *')
    }

    parameters {
        booleanParam(name: 'CLEAN_VOLUMES', defaultValue: false,
                     description: 'Delete the MySQL volume (resets the database)')
    }

    stages {
        stage('Prepare .env') {
            steps {
                withCredentials([
                    string(credentialsId: 'MYSQL_ROOT_PASSWORD', variable: 'MYSQL_ROOT_PASSWORD'),
                    string(credentialsId: 'MYSQL_PASSWORD', variable: 'MYSQL_PASSWORD')
                ]) {
                    // single quotes: the shell fills in the secrets, not Groovy,
                    // so they never appear in the build log
                    sh '''
cat > .env <<EOF
MYSQL_ROOT_PASSWORD=$MYSQL_ROOT_PASSWORD
MYSQL_DATABASE=6090059_mydb
MYSQL_USER=u6090059
MYSQL_PASSWORD=$MYSQL_PASSWORD
EOF
'''
                }
                sh 'docker compose config -q'
            }
        }

        stage('Build') {
            steps {
                sh 'docker compose build web'
            }
        }

        stage('Deploy') {
            steps {
                script {
                    if (params.CLEAN_VOLUMES) {
                        sh 'docker compose down -v'
                    }
                }
                sh 'docker compose up -d'
            }
        }

        stage('Health Check') {
            steps {
                sh 'timeout 120 sh -c "until curl -fs http://localhost:8081/api/courses; do sleep 3; done"'
            }
        }
    }

    post {
        success {
            echo 'Deployed: http://localhost:8081'
        }
        failure {
            sh 'docker compose logs --tail=50 || true'
        }
        always {
            sh 'docker image prune -f'  // remove old untagged images
        }
    }
}