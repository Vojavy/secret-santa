#!/bin/bash

# Use environment variables (automatically passed via docker exec -e)
ADMIN_USER="${MONGO_ADMIN_USER:-secret-santa-admin}"
ADMIN_PASS="${MONGO_ADMIN_PASSWORD:-password}"

mongosh --tls --tlsCertificateKeyFile /etc/ssl/server.pem --tlsCAFile /etc/ssl/server.pem --tlsAllowInvalidCertificates <<EOF
use admin;
db.createUser({user: "$ADMIN_USER", pwd: "$ADMIN_PASS", roles:[{role: "root", db: "admin"}]});
exit;
EOF
