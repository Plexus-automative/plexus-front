import pexpect
import sys

def list_containers():
    child = pexpect.spawn('ssh -o StrictHostKeyChecking=no ubuntu@51.255.204.71', encoding='utf-8')
    child.expect('assword:')
    child.sendline('plx-2025-2026')
    child.expect(r'\$')
    
    child.sendline('sudo docker ps')
    i = child.expect([r'\[sudo\] password for ubuntu:', r'\n'])
    if i == 0:
        child.sendline('plx-2025-2026')
        child.expect(r'\n')
    
    child.expect(r'\$')
    print("DOCKER PS:\n" + child.before)
    
    child.sendline('exit')
    
if __name__ == "__main__":
    list_containers()
