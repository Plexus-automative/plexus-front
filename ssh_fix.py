import pexpect

def fix_server():
    child = pexpect.spawn('ssh -o StrictHostKeyChecking=no ubuntu@51.255.204.71', encoding='utf-8')
    child.expect('assword:')
    child.sendline('plx-2025-2026')
    child.expect(r'\$')
    
    # Let's fix the healthcheck locally using sed on the server
    child.sendline("sed -i 's/localhost:3000/127.0.0.1:3000/g' docker-compose.yml")
    child.expect(r'\$')
    print("Sed executed.")

    child.sendline('sudo su')
    i = child.expect([r'\[sudo\] password for ubuntu:', r'\#'])
    if i == 0:
        child.sendline('plx-2025-2026')
        child.expect(r'\#')
        
    child.sendline('docker compose up -d')
    child.expect(r'\#', timeout=60)
    print("Docker compose up executed.")
    
    child.sendline('exit')
    
fix_server()
