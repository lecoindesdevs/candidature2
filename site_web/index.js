const express = require('express')
const path = require('path');
var bodyParser = require('body-parser')
// const { spawn } = require('child_process');
const Docker = require('dockerode');
const app = express()

app.get('/', function (req, res) {
  res.redirect('/www/index.html')
})
app.use('/www/:path([a-zA-z0-9_\\-/.]+)',  (req, res) => {
  let pathfile = path.join(__dirname,"www",req.params.path)
  res.sendFile(pathfile);
})
app.use('/monaco/:path([a-zA-z0-9_\\-/.]+)', (req, res) => {
  let pathfile = path.join(__dirname,"node_modules", "monaco-editor", "dev",req.params.path)
  res.sendFile(pathfile);
})

app.post('/api/execute', express.text(), async (req, res) => {
  let docker = new Docker({ socketPath: '/var/run/docker.sock' });
  let container = await docker.createContainer({
    Image: 'node',
    Cmd: ['node', '--eval', req.body],
    HostConfig: {
      AutoRemove: true
    },
    Tty: true,
    AttachStdout: true,
  });
  let sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  let output = await container.attach({ stream: true, stdout: true, stderr: false });
  await container.start();

  output.on("readable", () => {
    let data;
    while ((data = output.read()) !== null) {
      res.write(data);
    }
    res.send()
  });
})

app.listen(8080)
