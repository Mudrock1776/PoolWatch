import socket
import json
import time

HOST = 'test.skadi'
PORT = 80   

client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
with open("./jsonMessages/exist.json","r") as f:
    body = json.load(f)
    body = json.dumps(body)
    msg = (
        f"POST /device/exists HTTP/1.1\r\n"
        f"Host: {HOST}:{PORT}\r\n"
        "Content-Type: application/json\r\n"
        f"Content-Length: {len(body)}\r\n"
        "Connection: close\r\n"
        "\r\n"
        f"{body}"
    )

client.connect((HOST,PORT))
print(msg+"\n")
client.sendall(msg.encode())
response = client.recv(1024).decode()
print(response)
client.close()
answer = json.loads(response.split("\r\n\r\n")[1])
print(answer["answer"])

if not answer["answer"]:
    client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    with open("./jsonMessages/createDevice.json","r") as f:
        body = json.load(f)
        body = json.dumps(body)
        msg = (
            f"POST /device/create HTTP/1.1\r\n"
            f"Host: {HOST}:{PORT}\r\n"
            "Content-Type: application/json\r\n"
            f"Content-Length: {len(body)}\r\n"
            "Connection: close\r\n"
            "\r\n"
            f"{body}"
        )
    client.connect((HOST,PORT))
    print(msg+"\n")
    client.sendall(msg.encode())
    response = client.recv(1024).decode()
    print(response)
    client.close()

client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
with open("./jsonMessages/report.json","r") as f:
    body = json.load(f)
    body = json.dumps(body)
    msg = (
        f"POST /report/add HTTP/1.1\r\n"
        f"Host: {HOST}:{PORT}\r\n"
        "Content-Type: application/json\r\n"
        f"Content-Length: {len(body)}\r\n"
        "Connection: close\r\n"
        "\r\n"
        f"{body}"
    )
client.connect((HOST,PORT))
print(msg+"\n")
client.sendall(msg.encode())
response = client.recv(1024).decode()
print(response)
client.close()

time.sleep(10)

client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
with open("./jsonMessages/report2.json","r") as f:
    body = json.load(f)
    body = json.dumps(body)
    msg = (
        f"POST /report/add HTTP/1.1\r\n"
        f"Host: {HOST}:{PORT}\r\n"
        "Content-Type: application/json\r\n"
        f"Content-Length: {len(body)}\r\n"
        "Connection: close\r\n"
        "\r\n"
        f"{body}"
    )
client.connect((HOST,PORT))
print(msg+"\n")
client.sendall(msg.encode())
response = client.recv(1024).decode()
print(response)
client.close()