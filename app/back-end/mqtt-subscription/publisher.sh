./mqtt-subscription/Mosquitto/mosquitto_pub.exe --cert ./mqtt-subscription/certs/cert.crt \
              --key ./mqtt-subscription/certs/private.key \
              --cafile ./mqtt-subscription/certs/rootCA.pem \
              -h "a1cxrn2jmoxkss-ats.iot.us-east-1.amazonaws.com" \
              -p 8883 \
              -q 1 \
              -t "test_project" \
              -m "$1" \
              -u "admin" \
              -P "password"
