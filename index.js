const express = require("express");
const app = express();
const { exec, execSync } = require('child_process');
const port = process.env.SERVER_PORT || process.env.PORT || 7860;        
const UUID = process.env.UUID || 'dbeb3764-a826-4722-bed8-2c1d6bde5f85'; 
const SERVER = process.env.SERVER || 'nz.abc.cn';     
const NZPORT = process.env.NZPORT || '5555';                    
const NEZ_KY = process.env.NEZ_KY || '';
const DOMAIN = process.env.DOMAIN || '';                      
const TOKEN = process.env.TOKEN || '';
const CFIP = process.env.CFIP || 'na.ma';
const NAME = process.env.NAME || 'Huggingface';

// root route
app.get("/", function(req, res) {
  res.send("Hello world!");
});

const metaInfo = execSync(
  'curl -s https://speed.cloudflare.com/meta | awk -F\\" \'{print $26"-"$18}\' | sed -e \'s/ /_/g\'',
  { encoding: 'utf-8' }
);
const ISP = metaInfo.trim();

// sub subscription
app.get('/sub', (req, res) => {
  const VMESS = { v: '2', ps: `${NAME}-${ISP}`, add: CFIP, port: '443', id: UUID, aid: '0', scy: 'none', net: 'ws', type: 'none', host: DOMAIN, path: '/vmess?ed=2048', tls: 'tls', sni: DOMAIN, alpn: '' };
  const vlessURL = `vless://${UUID}@${CFIP}:443?encryption=none&security=tls&sni=${DOMAIN}&type=ws&host=${DOMAIN}&path=%2Fvless?ed=2048#${NAME}-${ISP}`;
  const vmessURL = `vmess://${Buffer.from(JSON.stringify(VMESS)).toString('base64')}`;
  const trojanURL = `trojan://${UUID}@${CFIP}:443?security=tls&sni=${DOMAIN}&type=ws&host=${DOMAIN}&path=%2Ftrojan?ed=2048#${NAME}-${ISP}`;
  
  const base64Content = Buffer.from(`${vlessURL}\n${vmessURL}\n${trojanURL}`).toString('base64');

  res.type('text/plain; charset=utf-8').send(base64Content);
});


// run-nezha
  let TLS = '';
  if (SERVER && NZPORT && NEZ_KY) {
    const tlsPorts = ['443', '8443', '2096', '2087', '2083', '2053'];
    if (tlsPorts.includes(NZPORT)) {
      TLS = '--tls';
    } else {
      TLS = '';
    }
  const command = `nohup ./npm -s ${SERVER}:${NZPORT} -p ${NEZ_KY} ${TLS} >/dev/null 2>&1 &`;
  try {
    exec(command);
    console.log('npm is running');

    setTimeout(() => {
      runWeb();
    }, 2000);
  } catch (error) {
    console.error(`npm running error: ${error}`);
  }
} else {
  console.log('npm variable is empty, skip running');
}

// run-xr-ay
function runWeb() {
  const command1 = `nohup ./php -c ./config.json >/dev/null 2>&1 &`;
  exec(command1, (error) => {
    if (error) {
      console.error(`web running error: ${error}`);
    } else {
      console.log('web is running');

      setTimeout(() => {
        runServer();
      }, 2000);
    }
  });
}

// run-server
function runServer() {

  const command2 = `nohup ./php1 tunnel --edge-ip-version auto --no-autoupdate --protocol http2 run --token ${TOKEN} >/dev/null 2>&1 &`;

  exec(command2, (error) => {
    if (error) {
      console.error(`php1 running error: ${error}`);
    } else {
      console.log('php1 is running');
    }
  });
}

function cleanfiles() {
  setTimeout(() => {
    exec('rm -rf config.json npm php php1', (error, stdout, stderr) => {
      if (error) {
        console.error(`Error while deleting file: ${error}`);
        return;
      }
      console.log('server is running');
    });
  }, 70000);
}
cleanfiles();

app.listen(port, () => console.log(`App is listening on port ${port}!`));
