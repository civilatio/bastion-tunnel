# bastion-tunnel to RDS
A bastion host to establish a tunnel to a private AWS VPC network which contains a RDS database.

# Prerequisites
1. Terraform
2. Node & NPM
    1. Gulp
    2. Typescript
    3. ts-node
3. AWS Cli

# Instructions
1. Execute ```terraform apply```
2. Execute ```npm i```
3. Execute ```gulp bastion:tunnel```

Now a tunnel to your AWS VPC is established and you can connect to the RDS as if it is on your local machine.