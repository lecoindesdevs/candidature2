const express = require('express')
const path = require('path');
var bodyParser = require('body-parser')
// const { spawn } = require('child_process');
const Docker = require('dockerode');
const app = express()

async function pullImageIfNotFound(docker, name) {
  return new Promise((resolve, reject) => {
    docker.listImages((err, images) => {
      if (err) {
        reject(err);
      }
      else if (images.find(image => image.RepoTags.find(tag => tag === name)) === undefined) {
        docker.pull(name)
          .then(res => {
            res.resume();
            res.on('end', () => {
              if (!res.complete)
                reject(new Error('docker pull error'));
              else
                resolve();
            });
          })
          .catch(reject);
      } else {
        resolve();
      }
    })
  })
}

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

app.post('/api/execute', express.json(), async (req, res) => {
  console.log(req.body);
  const languages = {
    python3: {
      docker_image: 'python:3.9',
      command: ['python', '-c'],
    },
    python2: {
      docker_image: 'python:2.7',
      command: ['python', '-c'],
    },
    node: {
      docker_image: 'node:latest',
      command: ['node', '--eval'],
    },
  };
  const language = languages[req.body.language];
  if (!language) {
    res.status(400).send('Language not supported');
    return;
  }
  let docker = new Docker({ socketPath: '/var/run/docker.sock' });
  await pullImageIfNotFound(docker, language.docker_image).catch(err => {
    console.log(err);
    res.send("error");
  });

  let container = await docker.createContainer({
    Image: language.docker_image,
    Cmd: language.command.concat([req.body.code]),
    HostConfig: {
      AutoRemove: true
    },
    Tty: true,
    AttachStdout: true,
  });
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
