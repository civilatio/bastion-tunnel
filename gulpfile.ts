import * as gulp from 'gulp';
import * as minimist from 'minimist';
import * as AWS from 'aws-sdk';
import * as os from 'os';
import { execAsync } from './gulp.helpers';
import { config } from 'dotenv';

config();

process.env.TS_NODE_TRANSPILE_ONLY = 'true';

const OPTIONS_FOR_TUNNEL: minimist.Opts = {
    string: ['privateKey'],
    default: {
        privateKey: '~/.ssh/id_rsa'
    }
};

async function tunnel(): Promise<void> {
    const options = minimist(process.argv.slice(2), OPTIONS_FOR_TUNNEL);
    return openTunnel(options.privateKey);
}
tunnel.description = 'Bastion: Open tunnel to cloud resources (server, RDS, redis, etc.)';
tunnel.flags = {
    '--privateKey <path>': 'Optional. The EC2 private key to use. By default, the standard id_rsa is used.'
};
gulp.task('bastion:tunnel', tunnel);

const openTunnel = async function(key = ''): Promise<void> {
    console.log(`Opening tunnel`);

    const command: string[] = [];
    
    const bastion = await findBastionIP();
    const rds = await findRdsHost();

    command.push(`ec2-user@${bastion}`, '-i', key, '-q', '-o', '"UserKnownHostsFile /dev/null"', '-o', '"StrictHostKeyChecking no"');
    command.push('-L', `5432:${rds}:5432`);

    console.log(`ssh ${command.join(' ')}`);
    execAsync(`${os.platform() !== 'win32' ? 'sudo ' : ''}ssh`, command, '.').catch((e: Error | string) => {
        console.error(e);
        process.exit(1);
    });
};

async function findBastionIP(): Promise<string> {
    const ec2 = new AWS.EC2();
    const result = await ec2
        .describeInstances({
            Filters: [
                {
                    Name: 'tag:Name',
                    Values: ['stanglt-bastion'] // TODO: Make user dependent
                },
                {
                    Name: 'instance-state-name',
                    Values: ['running']
                }
            ],
            MaxResults: 10
        })
        .promise();
    const instances: AWS.EC2.Instance[] = [].concat.apply([], result.Reservations.map(res => res.Instances));
    if (instances.length === 1) {
        const ip = instances[0].PublicIpAddress;
        console.log(`Found bastion host IP ${ip}.`);
        return ip;
    } else {
        throw new Error('No bastion instance found / multiple instances found!');
    }
}

async function findRdsHost(): Promise<string> {
    const rds = new AWS.RDS();
    const instances = (await rds
        .describeDBInstances({
            DBInstanceIdentifier: 'stanglt-db' // TODO: Make user dependent
        })
        .promise()).DBInstances;
    if (instances.length === 1) {
        const host = instances[0].Endpoint.Address;
        console.log(`Found RDS host ${host}.`);
        return host;
    } else {
        throw new Error('No RDS instance found / multiple instances found!');
    }
}