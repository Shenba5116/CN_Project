#!/usr/bin/env python3
"""NetResQ Mininet Triangle Topology Generator.

Builds a 3-switch OpenFlow 1.3 triangle core with 4 attached hosts
for real network emulation under Linux / WSL.

Topology:
         [s1]
        /    \
      [s2]--[s3]

Hosts:
  h1 -> s1 (10.0.0.1)
  h2 -> s1 (10.0.0.2)
  h3 -> s2 (10.0.0.3)
  h4 -> s3 (10.0.0.4)
"""

from mininet.topo import Topo
from mininet.net import Mininet
from mininet.node import RemoteController, OVSSwitch
from mininet.cli import CLI
from mininet.log import setLogLevel, info
from mininet.link import TCLink


class NetResQTriangleTopo(Topo):
    def build(self):
        # 1. Add OpenFlow 1.3 switches
        s1 = self.addSwitch('s1', dpid='0000000000000001', protocols='OpenFlow13')
        s2 = self.addSwitch('s2', dpid='0000000000000002', protocols='OpenFlow13')
        s3 = self.addSwitch('s3', dpid='0000000000000003', protocols='OpenFlow13')

        # 2. Add Hosts
        h1 = self.addHost('h1', ip='10.0.0.1/24', mac='00:00:00:00:00:01')
        h2 = self.addHost('h2', ip='10.0.0.2/24', mac='00:00:00:00:00:02')
        h3 = self.addHost('h3', ip='10.0.0.3/24', mac='00:00:00:00:00:03')
        h4 = self.addHost('h4', ip='10.0.0.4/24', mac='00:00:00:00:00:04')

        # 3. Add Host-Switch Edge Links (low baseline delay)
        self.addLink(h1, s1, cls=TCLink, delay='1ms', bw=100)
        self.addLink(h2, s1, cls=TCLink, delay='1ms', bw=100)
        self.addLink(h3, s2, cls=TCLink, delay='1ms', bw=100)
        self.addLink(h4, s3, cls=TCLink, delay='1ms', bw=100)

        # 4. Add Core Inter-Switch Links
        self.addLink(s1, s2, cls=TCLink, delay='5ms', loss=0, bw=1000)
        self.addLink(s2, s3, cls=TCLink, delay='6ms', loss=0, bw=1000)
        self.addLink(s1, s3, cls=TCLink, delay='7ms', loss=0, bw=1000)


def run():
    setLogLevel('info')
    info('*** Creating NetResQ Triangle Network in Mininet\n')
    topo = NetResQTriangleTopo()
    net = Mininet(
        topo=topo,
        switch=OVSSwitch,
        controller=RemoteController('c0', ip='127.0.0.1', port=6653),
        link=TCLink,
        autoSetMacs=True
    )
    info('*** Starting Network & Connecting to OpenFlow Controller...\n')
    net.start()
    info('*** Mininet Ready. Use CLI to test ping or simulate link failure.\n')
    info('*** Example: link s1 s3 down\n')
    CLI(net)
    info('*** Stopping Network...\n')
    net.stop()


if __name__ == '__main__':
    run()
