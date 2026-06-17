import pexpect
import sys

def check_nginx_full():
    child = pexpect.spawn('ssh -o StrictHostKeyChecking=no ubuntu@51.255.204.71', encoding='utf-8')
    child.expect('assword:')
    child.sendline('plx-2025-2026')
    child.expect(r'\$')
    
    child.sendline('sudo docker exec makrem-nginx cat /etc/nginx/conf.d/default.conf')
    i = child.expect([r'\[sudo\] password for ubuntu:', r'\n'])
    if i == 0:
        child.sendline('plx-2025-2026')
        child.expect(r'\n')
    
    # Wait for the whole output by expecting the prompt
    child.expect(r'ubuntu@vps-cb2dc380:~')
    print("NGINX FULL CONF:\n" + child.before)
    
    child.sendline('exit')
    
if __name__ == "__main__":
    check_nginx_full()
