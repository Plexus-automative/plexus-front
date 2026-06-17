import pexpect

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
        
    child.sendline('docker inspect plexus-frontend --format "{{.State.Health.Status}} {{json .State.Health.Log}}"')
    child.expect(r'\#')
    print("FRONTEND HEALTH LOG:\n" + child.before)
    
    child.sendline('docker exec plexus-frontend wget --no-verbose --tries=1 --spider http://localhost:3000/api/auth/session')
    child.expect(r'\#')
    print("WGET COMMAND:\n" + child.before)

    child.sendline('exit')
    
check_server()
