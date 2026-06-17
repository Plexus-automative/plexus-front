import pty
import os
import sys
import time

def read_until(fd, expected):
    buffer = b""
    if isinstance(expected, str):
        expected = expected.encode()
    while True:
        try:
            chunk = os.read(fd, 1024)
            if not chunk: break
            buffer += chunk
            if expected in buffer:
                return buffer
        except BlockingIOError:
            time.sleep(0.1)
    return buffer

pid, fd = pty.fork()
if pid == 0:
    os.execlp("ssh", "ssh", "-o", "StrictHostKeyChecking=no", "ubuntu@51.255.204.71")
else:
    os.set_blocking(fd, False)
    out = read_until(fd, "assword:")
    os.write(fd, b"plx-2025-2026\n")
    out = read_until(fd, "$")
    
    # run docker inspect frontend
    os.write(fd, b"sudo docker inspect plexus-frontend --format '{{.State.Status}} {{.State.OOMKilled}} {{.State.ExitCode}}'\n")
    out = read_until(fd, "password for ubuntu:")
    if b"password for ubuntu:" in out:
        os.write(fd, b"plx-2025-2026\n")
        out = read_until(fd, "$")
    else:
        out += read_until(fd, "$")
    print("=== FRONTEND STATUS ===")
    print(out.decode())

    # run docker inspect backend
    os.write(fd, b"sudo docker inspect plexus-backend --format '{{.State.Status}} {{.State.OOMKilled}} {{.State.ExitCode}}'\n")
    out = read_until(fd, "$")
    print("=== BACKEND STATUS ===")
    print(out.decode())
    
    # get backend logs
    os.write(fd, b"sudo docker logs --tail 50 plexus-backend\n")
    out = read_until(fd, "$")
    print("=== BACKEND LOGS ===")
    print(out.decode())

    # get frontend logs
    os.write(fd, b"sudo docker logs --tail 20 plexus-frontend\n")
    out = read_until(fd, "$")
    print("=== FRONTEND LOGS ===")
    print(out.decode())

    os.write(fd, b"exit\n")
    os.waitpid(pid, 0)
