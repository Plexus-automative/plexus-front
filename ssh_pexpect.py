import pexpect
import sys

def check_server():
    print("Connecting...")
    child = pexpect.spawn('ssh -o StrictHostKeyChecking=no ubuntu@51.255.204.71', encoding='utf-8')
    child.expect('assword:')
    child.sendline('plx-2025-2026')
    
    # Wait for bash prompt
    child.expect(r'\$')
    print("Connected.")
    
    child.sendline('sudo su')
    i = child.expect([r'\[sudo\] password for ubuntu:', r'\#'])
    if i == 0:
        child.sendline('plx-2025-2026')
        child.expect(r'\#')
        
    print("Got root.")
    
    child.sendline('docker inspect plexus-frontend --format "{{.State.Status}} {{.State.OOMKilled}} {{.State.ExitCode}}"')
    child.expect(r'\#')
    print("FRONTEND STATUS:\n" + child.before)
    
    child.sendline('docker inspect plexus-backend --format "{{.State.Status}} {{.State.OOMKilled}} {{.State.ExitCode}}"')
    child.expect(r'\#')
    print("BACKEND STATUS:\n" + child.before)

    child.sendline('docker logs --tail 30 plexus-backend')
    child.expect(r'\#')
    print("BACKEND LOGS:\n" + child.before)
    
    child.sendline('docker logs --tail 30 plexus-frontend')
    child.expect(r'\#')
    print("FRONTEND LOGS:\n" + child.before)
    
    child.sendline('exit')
    
check_server()
