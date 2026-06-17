import pexpect
import sys

def check_auth_env():
    print("Connecting...")
    child = pexpect.spawn('ssh -o StrictHostKeyChecking=no ubuntu@51.255.204.71', encoding='utf-8')
    child.expect('assword:')
    child.sendline('plx-2025-2026')
    
    # Wait for bash prompt
    child.expect(r'\$')
    print("Connected.")
    
    # Check current directory
    child.sendline('ls -la')
    child.expect(r'\$')
    print("FILES ON SERVER:\n" + child.before)
    
    # Try to find .env file
    child.sendline('find . -name ".env"')
    child.expect(r'\$')
    print("FOUND .ENV FILES:\n" + child.before)
    
    # Check docker-compose or running env
    child.sendline('sudo docker exec plexus-frontend env | grep NEXTAUTH')
    i = child.expect([r'\[sudo\] password for ubuntu:', r'\n'])
    if i == 0:
        child.sendline('plx-2025-2026')
        child.expect(r'\n')
    
    child.expect(r'\$')
    print("NEXTAUTH ENV IN CONTAINER:\n" + child.before)

    # Check Nginx config too, as it might be a proxy issue
    child.sendline('sudo cat /etc/nginx/sites-enabled/default || sudo cat /etc/nginx/conf.d/default.conf')
    child.expect(r'\$')
    print("NGINX CONFIG:\n" + child.before)
    
    child.sendline('exit')
    
if __name__ == "__main__":
    check_auth_env()
