./mqtt-subscription/mosquitto/mosquitto_sub.exe --cert ./mqtt-subscription/secrets/AirQualitySensor.cert.pem \
             --key ./mqtt-subscription/secrets/AirQualitySensor.private.key \
             --cafile ./mqtt-subscription/secrets/rootCA.pem \
             -h "a1cxrn2jmoxkss-ats.iot.us-east-1.amazonaws.com" \
             -p 8883 \
             -q 1 \
             -t "test_project" \
             -u "admin" \
             -P "password" -v > ./mqtt-subscription/output.txt
