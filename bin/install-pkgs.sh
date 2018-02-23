#!/bin/bash
source /home/ec2-user/.bash_profile
cd /home/ec2-user/sds
npm install
sudo touch /etc/ld.so.conf
export LD_LIBRARY_PATH=/usr/local/lib
sudo ldconfig
