import { rm, readdir } from "node:fs/promises";
import {
  getDirname,
  joinPath,
  joinPosixPath,
  getSSHClient,
  sshConnect,
  sshPutFile,
  zipFolder,
  sshExecCommand,
  parseEnvFiles,
  logInfo,
  logError
} from '#lib/index'

const __dirname = getDirname(import.meta.url)
const pathEnv = joinPath(__dirname, '../../aimian/.env')

parseEnvFiles([
  pathEnv
])

const {
  MODE = '',
  SSH_HOST = '',
  SSH_PORT = '',
  SSH_USERNAME = '',
  SSH_PASSWORD = ''
} = process.env

const cwd = MODE === 'production'
  ? '/www/sites/www.verysites.com/public'
  : `/www/sites/www-${MODE}.verysites.com/public`
const pathRemote = joinPosixPath(cwd, 'docs/nsuite')

const pathLocalDocsRoot = joinPath(__dirname, '../.docs')
const pathLocalDocs = joinPath(pathLocalDocsRoot, 'nsuite')

async function doDeployment() {
  let pathLocalDist = ''
  const files = await readdir(pathLocalDocs, { withFileTypes: true })
  for (const file of files) {
    if (file.isDirectory()) {
      pathLocalDist = joinPath(pathLocalDocs, file.name)
      break
    }
  }
  if (!pathLocalDist) {
    throw new Error('No dist folder found')
  }

  const pathLocalZip = joinPath(pathLocalDocs, 'dist.zip')
  const pathRemoteZip = joinPosixPath(pathRemote, 'dist.zip')
  await zipFolder({
    pathFolder: pathLocalDist,
    pathOutputFile: pathLocalZip
  })

  const ssh = getSSHClient()
  await sshConnect({
    ssh,
    host: SSH_HOST,
    port: Number(SSH_PORT),
    username: SSH_USERNAME,
    password: SSH_PASSWORD
  })

  const execCommand = async (command: string): Promise<void> => {
    await sshExecCommand({
      ssh,
      cwd,
      command,
    });
  };

  await execCommand('rm -rf ./docs/nsuite')
  await execCommand('mkdir ./docs/nsuite')
  await sshPutFile({
    ssh,
    localFile: pathLocalZip,
    remoteFile: pathRemoteZip,
  })
  await execCommand(`cd ./docs/nsuite && unzip -o dist.zip`)
  await execCommand(`rm -rf ./docs/nsuite/dist.zip`)
  await rm(pathLocalDocsRoot, { force: true, recursive: true })
}

doDeployment()
  .then(() => {
    logInfo('Deployment successful')
  })
  .catch(err => {
    logError('Deployment failed', err)
  })
  .finally(() => {
    process.exit(0)
  })
