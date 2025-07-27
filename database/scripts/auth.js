#!/bin/bash

mongosh <<EOF
use admin;
db.createUser({user: "secret-santa-admin", pwd: "password", roles:[{role: "root", db: "admin"}]});
exit;
EOF
