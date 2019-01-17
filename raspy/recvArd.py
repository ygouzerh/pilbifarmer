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

bd_addr='00:14:03:06:8E:56'
port=1

if __name__ == '__main__':

    t=time.time()

    while True:
	if time.time()>=t+10:
	    sock = BluetoothSocket (RFCOMM)
	    sock.connect((bd_addr,port))
	    rec=""
	    rec+=sock.recv(1024)
	    rec_end=rec.find('\n')
	    if rec_end != -1:
		data=rec[:rec_end]
		print(data)
		tab=data.split('#')
		print(tab)
		rec=rec[rec_end+1:]
	    sock.close()
	    t=time.time()

