import pexpect
import sys

def run_cmd():
    if len(sys.argv) < 2:
        print("Usage: python run_prod_cmd.py '<command>'")
        sys.exit(1)
        
    cmd = sys.argv[1]
    child = pexpect.spawn('ssh -o StrictHostKeyChecking=no ubuntu@51.255.204.71', encoding='utf-8')
    child.expect('assword:')
    child.sendline('plx-2025-2026')
    child.expect(r'\$')
    
    child.sendline('sudo su')
    i = child.expect([r'\[sudo\] password for ubuntu:', r'\#'])
    if i == 0:
        child.sendline('plx-2025-2026')
        child.expect(r'\#')
        
    child.sendline(cmd)
    child.expect(r'\#')
    print(child.before)
    child.sendline('exit')

if __name__ == '__main__':
    run_cmd()
