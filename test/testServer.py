import socket

server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

server.bind(('',8081))

server.listen()
while True:
    Conn, Addr = server.accept()
    msg = Conn.recv(1024).decode()
    print(msg)
    Conn.close()