# Load environment variables from .env file
if (Test-Path ".\.env") {
    Get-Content ".\.env" | ForEach-Object {
        if ($_ -match '^([^#][^=]*)=(.*)$') {
            $name = $matches[1].Trim()
            $value = $matches[2].Trim()
            # Remove quotes if present
            $value = $value.Trim('"').Trim("'")
            [System.Environment]::SetEnvironmentVariable($name, $value, [System.EnvironmentVariableTarget]::Process)
            Write-Host "✅ Set $name"
        }
    }
    Write-Host "✅ Loaded environment variables from .env file"
} else {
    Write-Host "⚠️ Warning: .env file not found"
}

# Get the values
$ADMIN_USER = [System.Environment]::GetEnvironmentVariable("MONGO_ADMIN_USER") ?? "secret-santa-admin"
$ADMIN_PASS = [System.Environment]::GetEnvironmentVariable("MONGO_ADMIN_PASSWORD") ?? "password"

Write-Host "🔐 Using admin user: $ADMIN_USER"
Write-Host "🔐 Password length: $($ADMIN_PASS.Length) characters"

# Execute cluster initialization with proper environment variables
Write-Host "🚀 Step 4: Setting up authentication..."
docker exec -e "MONGO_ADMIN_USER=$ADMIN_USER" -e "MONGO_ADMIN_PASSWORD=$ADMIN_PASS" mongo-config-01 bash -c "chmod +x /scripts/auth.sh && /scripts/auth.sh"
docker exec -e "MONGO_ADMIN_USER=$ADMIN_USER" -e "MONGO_ADMIN_PASSWORD=$ADMIN_PASS" shard-01-node-a bash -c "chmod +x /scripts/auth.sh && /scripts/auth.sh"
docker exec -e "MONGO_ADMIN_USER=$ADMIN_USER" -e "MONGO_ADMIN_PASSWORD=$ADMIN_PASS" shard-02-node-a bash -c "chmod +x /scripts/auth.sh && /scripts/auth.sh"
docker exec -e "MONGO_ADMIN_USER=$ADMIN_USER" -e "MONGO_ADMIN_PASSWORD=$ADMIN_PASS" shard-03-node-a bash -c "chmod +x /scripts/auth.sh && /scripts/auth.sh"

Write-Host "🚀 Step 5: Creating collections with validation schemas..."
docker exec router-01 sh -c "mongosh --port 27017 --tls --tlsCertificateKeyFile /etc/ssl/server.pem --tlsCAFile /etc/ssl/server.pem --tlsAllowInvalidCertificates -u '$ADMIN_USER' --password '$ADMIN_PASS' --authenticationDatabase admin < /scripts/init_schemas.js"

Write-Host "🎉 Authentication and schema setup complete!"
