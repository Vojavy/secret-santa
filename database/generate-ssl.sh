#!/bin/bash

DOMAIN="mongo.distrbyt.dev"
SSL_DIR="ssl"
CERT_FILE="server.pem"

echo "🔐 Creating SSL certificate for domain: $DOMAIN"

# Create SSL directory
mkdir -p $SSL_DIR
cd $SSL_DIR

# Generate private key (2048 bit RSA)
echo "📋 Generating private key..."
openssl genrsa -out server.key 2048

# Generate certificate signing request with SAN extension
echo "📋 Generating certificate signing request..."
cat > server.conf <<EOF
[req]
distinguished_name = req_distinguished_name
req_extensions = v3_req
prompt = no

[req_distinguished_name]
C = CZ
ST = Praha
L = Praha
O = DistrbytDev
OU = IT Department
CN = $DOMAIN

[v3_req]
keyUsage = keyEncipherment, dataEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names

[alt_names]
DNS.1 = $DOMAIN
DNS.2 = *.$DOMAIN
IP.1 = 141.147.28.19
EOF

# Generate certificate signing request
openssl req -new -key server.key -out server.csr -config server.conf

# Generate self-signed certificate (valid for 365 days)
echo "📋 Generating self-signed certificate..."
openssl x509 -req -days 3650 -in server.csr -signkey server.key -out server.crt -extensions v3_req -extfile server.conf

# Combine key and certificate into single PEM file
echo "📋 Creating combined PEM file..."
cat server.key server.crt > $CERT_FILE

# Set proper permissions
chmod 600 server.key $CERT_FILE
chmod 644 server.crt

# Clean up temporary files
rm server.csr server.conf

echo ""
echo "✅ SSL certificate created successfully!"
echo "📁 Files created in $SSL_DIR/:"
echo "   - server.key (private key)"
echo "   - server.crt (certificate)"
echo "   - server.pem (combined key + certificate)"
echo ""
echo "🔧 Certificate details:"
openssl x509 -in server.crt -text -noout | grep -E "(Subject:|DNS:|IP Address:|Not After)"
echo ""
echo "⚠️  This is a self-signed certificate. For production, use:"
echo "   - Let's Encrypt (certbot)"
echo "   - Commercial CA certificate"
echo "   - Internal CA certificate"
