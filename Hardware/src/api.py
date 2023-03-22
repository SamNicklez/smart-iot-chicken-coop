import requests
from datetime import datetime

url = "http://172.17.9.55:5000/"

def chickenEntered(box: int, coop: str, mass: int):
    body = {
        "box": box,
        "coop": coop,
        "enter_date": datetime.now().strftime("%Y-%m-%dT%H:%M:%S"),
        "enter_mass": mass,
    }
    requests.post(url=url+"api/chicken", json=body)

def chickenExited(enter_date: str, exit_mass: int):
    body = {
        "enter_date": enter_date,
        "exit_date": datetime.now().strftime("%Y-%m-%dT%H:%M:%S"),
        "exit_mass": exit_mass,
    }
    requests.patch(url=url+"api/chicken", json=body)

def postBoxData(box_id: int, hasEgg: bool, temperature: int, light: int):
    body = {
        "date": datetime.now().strftime("%Y-%m-%dT%H:%M:%S"),
        "hasEgg": hasEgg,
        "temperature": temperature,
        "light": light,
    }
    requests.post(url=url + f"api/box/{box_id}", json=body)

postBoxData(box_id=1, hasEgg=True, temperature=32, light=45)

    