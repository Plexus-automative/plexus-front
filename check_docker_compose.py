import pexpect
import sys

def check_docker_compose():
    child = pexpect.spawn('ssh -o StrictHostKeyChecking=no ubuntu@51.255.204.71', encoding='utf-8')
    child.expect('assword:')
    child.sendline('plx-2025-2026')
    child.expect(r'\$')
    
    child.sendline('cat docker-compose.yml')
    child.expect(r'\$')
    print("DOCKER COMPOSE:\n" + child.before)

    child.sendline('cat piece-app/.env')
    child.expect(r'\$')
    print("PIECE APP .ENV:\n" + child.before)
    
    child.sendline('exit')
    
if __name__ == "__main__":
    check_docker_compose()
