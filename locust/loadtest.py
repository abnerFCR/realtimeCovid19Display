import time 
from locust import HttpUser, task
import json
import random

class QuickstartUser(HttpUser):
    casos = []
    with open('casos.json') as json_file:
        data = json.load(json_file)
        casos.extend(data)

    @task
    def insert_case(self):
        time.sleep(1)
        self.client.post("/",json=random.choice(self.casos))