"""Mininet Adapter and Scripts Generator for NetResQ.

Provides helper specifications and verification for running NetResQ within
Mininet network emulation under Linux / WSL.
"""

from typing import Dict, Any

MININET_TRIANGLE_SCRIPT = """#!/usr/bin/env python3
\"\"\"
NetResQ Mininet Triangle Topology Generator
Topology:
    S1 --- S2
     \\   /
      S3
Hosts:
    h1, h2 connected to s1
    h3 connected to s2
    h4 connected to s3
\"\"\"

from mininet.topo import Topo
from mininet.net import Mininet
from mininet.node import RemoteController, OVSSwitch
from mininet.cli import CLI
from mininet.log import setLogLevel, info
from mininet.link import TCLink

class NetResQTriangleTopo(Topo):
    def build(self):
        # Add Switches
        s1 = self.addSwitch('s1', dpid='0000000000000001', protocols='OpenFlow13')
        s2 = self.addSwitch('s2', dpid='0000000000000002', protocols='OpenFlow13')
        s3 = self.addSwitch('s3', dpid='0000000000000003', protocols='OpenFlow13')

        # Add Hosts
        h1 = self.addHost('h1', ip='10.0.0.1/24', mac='00:00:00:00:00:01')
        h2 = self.addHost('h2', ip='10.0.0.2/24', mac='00:00:00:00:00:02')
        h3 = self.addHost('h3', ip='10.0.0.3/24', mac='00:00:00:00:00:03')
        h4 = self.addHost('h4', ip='10.0.0.4/24', mac='00:00:00:00:00:04')

        # Connect Hosts to Switches
        self.addLink(h1, s1, cls=TCLink, delay='1ms', bw=100)
        self.addLink(h2, s1, cls=TCLink, delay='1ms', bw=100)
        self.addLink(h3, s2, cls=TCLink, delay='1ms', bw=100)
        self.addLink(h4, s3, cls=TCLink, delay='1ms', bw=100)

        # Core Triangle Links
        self.addLink(s1, s2, cls=TCLink, delay='5ms', loss=0, bw=1000)
        self.addLink(s2, s3, cls=TCLink, delay='6ms', loss=0, bw=1000)
        self.addLink(s1, s3, cls=TCLink, delay='7ms', loss=0, bw=1000)

def run():
    setLogLevel('info')
    topo = NetResQTriangleTopo()
    net = Mininet(
        topo=topo,
        switch=OVSSwitch,
        controller=RemoteController('c0', ip='127.0.0.1', port=6653),
        link=TCLink,
        autoSetMacs=True
    )
    info('*** Starting network\\n')
    net.start()
    info('*** Testing basic reachability\\n')
    CLI(net)
    info('*** Stopping network\\n')
    net.stop()

if __name__ == '__main__':
    run()
"""

class MininetAdapter:
    """Helper class providing Mininet topology definitions and CLI instructions."""

    @staticmethod
    def get_topology_script() -> str:
        return MININET_TRIANGLE_SCRIPT

    @staticmethod
    def get_instructions() -> Dict[str, Any]:
        return {
            "title": "Mininet Emulation Setup Guide",
            "prerequisites": [
                "Ubuntu 20.04 / 22.04 LTS or WSL2 with systemd enabled",
                "Open vSwitch (sudo apt install openvswitch-switch)",
                "Mininet (sudo apt install mininet)",
                "Ryu or OS-Ken Controller (pip install ryu or pip install os-ken)"
            ],
            "commands": {
                "start_controller": "ryu-manager ryu.app.rest_topology ryu.app.ofctl_rest ryu.app.simple_switch_13",
                "start_mininet": "sudo python3 scripts/mininet_topology.py",
                "test_failure": "mininet> link s1 s2 down",
                "test_restore": "mininet> link s1 s2 up",
                "test_ping": "mininet> h1 ping -c 4 h4"
            }
        }
