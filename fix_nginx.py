import pexpect
import sys

def fix_nginx():
    child = pexpect.spawn('ssh -o StrictHostKeyChecking=no ubuntu@51.255.204.71', encoding='utf-8')
    child.expect('assword:')
    child.sendline('plx-2025-2026')
    child.expect(r'\$')
    
    # Read current config
    child.sendline('sudo docker exec makrem-nginx cat /etc/nginx/conf.d/default.conf')
    i = child.expect([r'\[sudo\] password for ubuntu:', r'\n'])
    if i == 0:
        child.sendline('plx-2025-2026')
        child.expect(r'\n')
    child.expect(r'ubuntu@vps-cb2dc380:~')
    current_conf = child.before
    
    # Add X-Forwarded-Host to all proxy locations
    new_conf = current_conf.replace('proxy_set_header X-Forwarded-Proto $scheme;', 
                                   'proxy_set_header X-Forwarded-Proto $scheme;\n        proxy_set_header X-Forwarded-Host $host;')
    
    # Write to a temporary file on the server
    with open('new_default.conf', 'w') as f:
        f.write(new_conf)
    
    # I can't easily upload a file, so I'll use a heredoc
    # First, escape backslashes and dollar signs for bash
    escaped_conf = new_conf.replace('\\', '\\\\').replace('$', '\\$').replace('"', '\\"')
    
    child.sendline(f'cat <<EOF > ~/default.conf.new\n{new_conf}\nEOF')
    child.expect(r'\$')
    
    # Copy it into the container
    child.sendline('sudo docker cp ~/default.conf.new makrem-nginx:/etc/nginx/conf.d/default.conf')
    child.expect(r'\$')
    
    # Reload Nginx
    child.sendline('sudo docker exec makrem-nginx nginx -s reload')
    child.expect(r'\$')
    print("NGINX RELOADED WITH X-FORWARDED-HOST")
    
    child.sendline('exit')
    
if __name__ == "__main__":
    fix_nginx()
