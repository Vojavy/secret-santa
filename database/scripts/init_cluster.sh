#!/usr/bin/env sh

# ANSI colors and emojis
RED='\e[31m'
GREEN='\e[32m'
YELLOW='\e[33m'
BLUE='\e[34m'
NC='\e[0m'  # No Color

ADMIN_USER="secret-santa-admin"
ADMIN_PASS="password"

echo -e "${BLUE}🔧 Setting execute permissions on helper scripts...${NC}"
chmod +x /scripts/wait-for-it.sh
chmod +x /scripts/import_datasets.sh

echo -e "${BLUE}🚀 Step 2: Initializing replica sets (config server and shards)...${NC}"

echo -e "${YELLOW}⌛ Waiting for configsvr01:27017...${NC}"
/scripts/wait-for-it.sh configsvr01:27017 -t 30

echo -e "${YELLOW}⌛ Waiting for shard-01-node-a:27017...${NC}"
/scripts/wait-for-it.sh shard-01-node-a:27017 -t 30

echo -e "${YELLOW}⌛ Waiting for shard-02-node-a:27017...${NC}"
/scripts/wait-for-it.sh shard-02-node-a:27017 -t 30

echo -e "${YELLOW}⌛ Waiting for shard-03-node-a:27017...${NC}"
/scripts/wait-for-it.sh shard-03-node-a:27017 -t 30

echo -e "${GREEN}🔧 Initializing config server replica set...${NC}"
docker exec mongo-config-01 bash /scripts/init-configserver.js

echo -e "${GREEN}🔧 Initializing Shard 01 replica set...${NC}"
docker exec shard-01-node-a bash /scripts/init-shard01.js

echo -e "${GREEN}🔧 Initializing Shard 02 replica set...${NC}"
docker exec shard-02-node-a bash /scripts/init-shard02.js

echo -e "${GREEN}🔧 Initializing Shard 03 replica set...${NC}"
docker exec shard-03-node-a bash /scripts/init-shard03.js

echo -e "${BLUE}⌛ Waiting 10 seconds for primary election...${NC}"
sleep 10

echo -e "${BLUE}🚀 Step 3: Initializing the router...${NC}"
docker exec router-01 sh -c "mongosh < /scripts/init-router.js"

echo -e "${BLUE}🚀 Step 4: Setting up authentication...${NC}"
docker exec mongo-config-01 bash /scripts/auth.js
docker exec shard-01-node-a bash /scripts/auth.js
docker exec shard-02-node-a bash /scripts/auth.js
docker exec shard-03-node-a bash /scripts/auth.js

echo -e "${BLUE}🚀 Step 5: Creating collections with validation schemas...${NC}"
docker exec router-01 sh -c "mongosh --port 27017 -u '$ADMIN_USER' --password '$ADMIN_PASS' --authenticationDatabase admin < /scripts/init_schemas.js"

echo -e "${GREEN}🎉 Cluster initialization complete!${NC}"

