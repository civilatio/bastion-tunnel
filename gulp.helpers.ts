import { ChildProcess, spawn, SpawnOptions, StdioOptions } from "child_process";

export function exec(cmd: string, args: string[], relativePath, cb?: Function, stdio: StdioOptions = 'inherit'): ChildProcess {
    console.log(`Running command: '${cmd} ${args.join(' ')}' inside '${relativePath}'.`);
    const spawnOptions: SpawnOptions = {
        shell: true,
        cwd: `${process.cwd()}/${relativePath}`,
        stdio
    };
    const npm = spawn(cmd, args, spawnOptions);
    npm.on('close', function(code) {
        if (!cb) {
            return;
        }

        if (code === 0 || code === null) {
            cb();
        } else {
            cb(`Process exited with status ${code}`);
        }
    });
    process.once('SIGINT', function() {
        npm.kill();
    });

    return npm;
}

export function execAsync(cmd: string, args: string[], relativePath: string, stdio?: StdioOptions): Promise<void> {
    return new Promise((resolve, reject) => {
        exec(
            cmd,
            args,
            relativePath,
            err => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            },
            stdio
        );
    });
}