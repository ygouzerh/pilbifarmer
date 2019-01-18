# -*- coding: utf-8 -*-

from base64 import b64encode, b64decode
from hashlib import sha256
from urllib import quote_plus, urlencode
from hmac import HMAC
import requests
import json
import os
import time

from bluetooth import *

# Azure IoT Hub
URI = 'RMAiothub.azure-devices.net'
KEY = 'Gs/KU8nn5HOz5IDsVZwRBXPsTfCSXHyFOG4Tq8ueuXU='
IOT_DEVICE_ID = 'RaspberryPi'
POLICY = 'iothubowner'

bd_addr='00:14:03:06:8E:56'
port=1

def generate_sas_token():
    expiry=3600
    ttl = time.time() + expiry
    sign_key = "%s\n%d" % ((quote_plus(URI)), int(ttl))
    signature = b64encode(HMAC(b64decode(KEY), sign_key, sha256).digest())

    rawtoken = {
        'sr' :  URI,
        'sig': signature,
        'se' : str(int(ttl))
    }

    rawtoken['skn'] = POLICY

    return 'SharedAccessSignature ' + urlencode(rawtoken)

def send_message(token, message):
    url = 'https://{0}/devices/{1}/messages/events?api-version=2016-11-14'.format(URI, IOT_DEVICE_ID)
    headers = {"Content-Type": "application/json","Authorization": token}
    data = json.dumps(message)
    print data
    response = requests.post(url, data=data, headers=headers)

if __name__ == '__main__':

    token = generate_sas_token()

    t=time.time()

    while True:
        if time.time()>=t+10:
            try:
                sock = BluetoothSocket (RFCOMM)
                sock.connect((bd_addr,port))
            except:
                print("---")
            rec=""
            rec+=sock.recv(1024)
            rec_end=rec.find('\n')

            if rec_end != -1:
                data=rec[:rec_end]
                print(data)
                tab=data.split('#')
                print(tab)
                message= {"soilhum":tab[0], "lum":tab[1], "temp":tab[2].replace('\r','')}
                print(message)
                send_message(token, message)
                rec=rec[rec_end+1:]

            sock.close()
            t=time.time()

