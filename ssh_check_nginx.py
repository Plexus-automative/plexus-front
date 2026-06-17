import pexpect
import sys

def check_server():
    child = pexpect.spawn('ssh -o StrictHostKeyChecking=no ubuntu@51.255.204.71', encoding='utf-8')
    child.expect('assword:')
    child.sendline('plx-2025-2026')
    child.expect(r'\$')
    
    child.sendline('sudo su')
    i = child.expect([r'\[sudo\] password for ubuntu:', r'\#'])
    if i == 0:
        child.sendline('plx-2025-2026')
        child.expect(r'\#')
        
    child.sendline('docker logs --tail 50 makrem-nginx')
    child.expect(r'\#')
    print("NGINX LOGS:\n" + child.before)
    
    child.sendline('docker ps')
    child.expect(r'\#')
    print("DOCKER PS:\n" + child.before)
    
    child.sendline('docker stats --no-stream')
    child.expect(r'\#')
    print("DOCKER STATS:\n" + child.before)
    
    child.sendline('exit')
    
check_server()
