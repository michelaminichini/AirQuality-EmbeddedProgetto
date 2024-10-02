#!/bin/bash
mosquitto_pub --cert ./mqtt-subscription/secrets/cert.crt \
              --key ./mqtt-subscription/secrets/private.key \
              --cafile ./mqtt-subscription/secrets/rootCA.pem \
              -h "a1cxrn2jmoxkss-ats.iot.us-east-1.amazonaws.com" \
              -p 8883 \
              -q 1 \
              -t "test_project" \
              -m "$1" \
              -u "admin" \
              -P "password"
