# -*- coding: utf-8 -*-

# This script get a planteID in parameter (Bluetooth address) and a message,
# and he send it to the right bluetooth adress

from base64 import b64encode, b64decode
from hashlib import sha256
from urllib import quote_plus, urlencode
from hmac import HMAC
import requests
import json
import os
import time
import sys
from bluetooth import *

#bd_addr='00:14:03:06:8E:56'

if __name__ == '__main__':

    # Get back the arguments
    data = sys.argv[1]
    bd_addr = sys.argv[2]
    port=1

    # Create the bluetooth connection
    sock = BluetoothSocket (RFCOMM)
    sock.connect((bd_addr,port))
    
    # Send the data
    sock.send(str(data))

    # Close the connection
    sock.close()

