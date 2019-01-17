# -*- coding: utf-8 -*-

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

bd_addr='00:14:03:06:8E:56'
port=1

if __name__ == '__main__':

    sock = BluetoothSocket (RFCOMM)
    sock.connect((bd_addr,port))
    
    i=sys.argv[1]

    #traitement
    sock.send(str(i))
        
    sock.close()

