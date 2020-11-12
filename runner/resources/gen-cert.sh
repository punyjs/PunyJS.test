#!/bin/bash
openssl genrsa -out rootCA.key 4096
openssl req -x509 -new -nodes -key rootCA.key -sha256 -days 1024 -out rootCA.crt

openssl genrsa -out localhost.key 2048
openssl req -new -sha256 -key localhost.key -subj "//CN=localhost" -out localhost.csr

openssl req -in localhost.csr -noout -text

openssl x509 -req -in localhost.csr -CA rootCA.crt -CAkey rootCA.key -CAcreateserial -out localhost.crt -days 500 -sha256

openssl x509 -in localhost.crt -text -noout