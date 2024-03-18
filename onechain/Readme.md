# onechain �ڵ� �ż��� ���� ���� ����

## �⺻ �����Լ� ����� �ż��� �۵� ���� ���� 
```
// main
(async function () { // (async)
    await initBlockchain(); // (await)
    connectToPeers(initialPeers); //�ʱ� �Ǿ� ����
    initHttpServer(); //http ���� �ʱ�ȭ
    initP2PServer(); //������ ���� �ʱ�ȭ
    initWallet(); //���� �ʱ�ȭ
})();
```

===

### 1. initBlockchain(): �����ͺ��̽����� ������ ���ü���� �ε��ϰų�, ���׽ý� ������� �����ϴ� �� ���ü���� �����Ͽ� ���ü���� �ʱ�ȭ�Ѵ�.

+ blockchain.js�� �ش� �Լ� ����

```
var blockchain;

async function initBlockchain() { 
    /* 1 */ 
    const loadedBlockchain = await new Blockchain().load(); 
    /* 2 */
    if (loadedBlockchain !== undefined) {
        blockchain = loadedBlockchain; 
    }
    /*3*/
    else { 
        const newBlockchain = new Blockchain([getGenesisBlock()]);
    /*4*/ 
        try { newBlockchain.save(); } catch (err) { throw err; } 
        blockchain = newBlockchain; 
    }
}
```

  1. type.js�� ���ǵ� blockchain�� Ŭ���� ��ü�� �ε��� �����Ͽ� ��ü������ �����Ѵ�

```
  /*1*/
  class Blockchain { //��� ü�� Ŭ����
    constructor(blocks) { //��ü����
        this._blocks = deepCopy(blocks); // ���� ���ü���� ���� �����Ͽ� �����Ѵ� (�ּ� ��������)
        try { this._length = this.blocks.length; } catch (err) { /* console.log(err); */ } // for decode()
    }}

    function deepCopy(src) { //���� ���� ����
    return cloneDeep(src); //��ü ���� ���� �����
  } 

  /*2*/
    async load() { //�ε�
        try {
            const encodedBlockchain = await db.get("Blockchain"); //�����ͺ��̽����� ���ü���̶�� ������ ������ ��ü�� �����Ѵ�
            return new Blockchain().decode(encodedBlockchain); //���̽����Ϸ� �Ǿ��ִ� ���� js��ü�� ��ȯ�Ͽ� ��ȯ�Ѵ�
        }
        catch (err) {
            return undefined; //���� ������ �������� �ʴ´ٸ� ���ǵ��� ������ ��ȯ�Ѵ�
        }
    }

  /*3*/
    const dbLocation = "db/" + (process.env.DB || process.env.P2P_PORT || 6001); // ����������θ� �����Ѵ�
          recursiveMkdir(dbLocation); //������ҿ� �����ϱ�

          const db = level(dbLocation);//(level) //� ��ο� �ִ� ������ �����ö� ����� ��ü �����̴�

  /*4*/
    decode(encodedBlock) { //js�� ���� �� �ִ� ���·� ��ȯ
        var decodedBlock = JSON.parse(encodedBlock); //json������ js�� ��ü������ �ٲ۴�
        var objectifiedBlock = Object.assign(new Block(), decodedBlock);// �ٲ� ��ü���� ��� ��ü�� �����ǰ� ����� ��ȯ�Ѵ�
        objectifiedBlock.header = Object.assign(new BlockHeader(), objectifiedBlock.header); // ���ϵ������� ����� ����� ��ȯ�Ѵ�
        return objectifiedBlock; ������Ʈ ��ȯ
    }

```

  2. ��ü������ �ƹ��͵� ���ǵ��� ���� ��, null ���°� �ƴ� ���ǵ� ��ü�� �� �ִٸ� �ռ� ������ �� ���� ��ü�� �����Ѵ�

  3. �׷��� �ʴٸ� �����ý� ��� ���� �ż��带 ���� ȣ���Ͽ� ���ü�� ��ü�� ������ �����Ѵ�.

  4. �̶� ���ü���� ���̺� �ż��带 ���� ���̽� ���Ϸ� �����Ѵ�

```
/*1*/
    async save() { //������ ����
        const encodedBlockchain = this.encode(); //�ش� ������ ���ڵ�
        try { await db.put("Blockchain", encodedBlockchain); } //���ü�� ���ϰ�ο� ���ڵ��� ��������
        catch (err) { throw err; }
    }

/*2*/
    encode() { //�����͸� ���̽����Ϸ� ���ڵ�
        return JSON.stringify(this);
    }
```

===

### 2. initHttpServer(): Express �����ӿ�ũ�� ����Ͽ� HTTP ������ �ʱ�ȭ�ϰ�, �پ��� API ��������Ʈ�� �����Ͽ� ���ü�� �����Ϳ� ���� �׼��� �� 

   ��� ���� ���� ����� �����Ѵ�.

```
    const app = express(); //express ��ũ������ ��� �Ҵ�
    app.use(cors()); //(cors)��� �̵����(���� ���� �������ӿ�ũ(get,post ����� �޼��� ����)) �������� ȣȯ�� ����
    app.use(json()); //(use.json) ���� ���� �ַ� ���̽����Ͽ� ���� ó�� ���

    /*�߷�*/

    app.listen(http_port, function () { console.log("Listening http port on: " + http_port) }); //���� ���

```

===

### 3. connectToPeers(): �ʱ� �Ǿ� ����� ������� �ٸ� ��忡 ������ �õ��ϰ�, P2P ��Ʈ��ũ�� �����Ѵ�.

```
function connectToPeers(newPeers) { //�����ϱ�(on)
    newPeers.forEach( // ���Ϲ迭�� �����ϸ��� �����ϱ�
        function (peer) {
          /*1*/
            const ws = new WebSocket(peer);
            /*2*/
            ws.on("open", function () { initConnection(ws); });
            ws.on("error", function () { console.log("Connection failed"); });
        }
    );
}
```
  1. ���ϰ�ü�� �����Ѵ�

===

  2. ����ü�� �̺�Ʈ�� ���� �̺�Ʈ�� ����ϴ� �Լ��� �����Ѵ�

   ```
   function initConnection(ws) { //���� �ʱ�ȭ
      /*1*/
       sockets.push(ws);
       /*2*/
       initMessageHandler(ws);// �޼��� ��鷯 �ʱ�ȭ
       /*3*/
       initErrorHandler(ws); //���� �ڵ鷯 �ʱ�ȭ
       /*4*/
       write(ws, queryChainLengthMsg());
    }
   ```
     + 1. ���Ϲ迭�� ����Ǵ� �ٸ� �������� �߰��Ѵ�
     
     + 2. ������ �޼����ڵ鷯�� �ʱ�ȭ�Ѵ�

     ```
      function initMessageHandler(ws) { //�޼��� �ڵ鷯
       ws.on("message", function (data) {
        const message = JSON.parse(data); //���̽� ������ ��ü�� �޴´�
        // console.log("Received message" + JSON.stringify(message));

        switch (message.type) {
            case MessageType.QUERY_LATEST:
                write(ws, responseLatestMsg()); //����ֽ� ������
                break;
            case MessageType.QUERY_ALL:
                write(ws, responseChainMsg()); //���ü�� ���� ������
                break;
            case MessageType.RESPONSE_BLOCKCHAIN:
                handleBlockchainResponse(message); //��ϻ��� ���� ������
                break;
        }
       });
     }
     ```
     + �޼��� ������ ����ü

     ```
          const MessageType = { //�޼��� Ÿ��
          QUERY_LATEST: 0,
          QUERY_ALL: 1,
          RESPONSE_BLOCKCHAIN: 2
          };

          function queryAllMsg() { //���� ��� ���̽� Ÿ��
          return ({
          "type": MessageType.QUERY_ALL,
          "data": null
          });
          }

          function queryChainLengthMsg() { //���ü�� ���
          return ({
          "type": MessageType.QUERY_LATEST,
          "data": null
          });
          }

          function responseChainMsg() { //���ü���� ���̽����� ��ȯ�Ǿ �°� ������
          return ({
          "type": MessageType.RESPONSE_BLOCKCHAIN,
          "data": getBlockchain().encode()
          });
          }

          function responseLatestMsg() { //�ֱ� ��� ���̽����� ���� ������
          return ({
          "type": MessageType.RESPONSE_BLOCKCHAIN,
          "data": new Blockchain([getLatestBlock()]).encode()
          });
          }
     ```

     + 3. ���� �ڵ鷯�� �ʱ�ȭ �Ѵ�

     ```
     
          function initErrorHandler(ws) { //�����ڵ鷯 �ʱ�ȭ
          ws.on("close", function () { closeConnection(ws); });
          ws.on("error", function () { closeConnection(ws); });
          }

          function closeConnection(ws) { //���Ϲ迭���� ������ �� �ϳ��� �����Ѥ���
          console.log("Connection failed to peer: " + ws.url);
          sockets.splice(sockets.indexOf(ws), 1);
          }
     ```

     + 4. �ش� ������ �ٸ� ����� �Ǿ�� �˸��� 

     ```
     function write(ws, message) { ws.send(JSON.stringify(message)); } //http���� �������� ���̽����·� ���� ������
     ```
===

### 4. initP2PServer(): WebSocket�� ����Ͽ� P2P ������ �ʱ�ȭ�ϰ�, �ٸ� ������ �ǽð� ������ ��ȯ�� �����ϰ� �Ѵ�.

```
function initP2PServer() { //������ ���� �ʱ�ȭ
    const server = new Server({ port: p2p_port });
    server.on("connection", function (ws) { initConnection(ws); }); //�����̶�� �̸����� �Լ��迭 ���� �ش� �Լ��� ȣ����� �� ������ �۵��ǵ��� ��
    console.log("Listening websocket p2p port on: " + p2p_port);
}
```

+ connection�� ���� 3���� ����. 3���� �������� �ƿ� �������� ������ �� �ִ� ������ ���� ���̴�

===

### 5. initWallet(): ������ ���� Ű�� ���� ��� ���� �����ϰ�, �ִٸ� �ش� Ű�� �ε��Ͽ� ������ �ʱ�ȭ�Ѵ�.

```
function initWallet() {
/*1*/
    if (existsSync(privateKeyFile)) {
        console.log("Load wallet with private key from: " + privateKeyFile);
        return;
    }

/*2*/
    recursiveMkdir(privateKeyLocation);

/*3*/
    const newPrivateKey = generatePrivateKey();
    /*4*/
    writeFileSync(privateKeyFile, newPrivateKey);
    console.log("Create new wallet with private key to: " + privateKeyFile);
}
```

  1. ���Ű ������ �����Ѵٸ� �ٷ� ��ȯ���� ���� �Լ��� ������

  2. �׷��� �ʴٸ� ������ ������ ������θ� �����

  3. ���Ű�� �����Ѵ�

  ```
  function generatePrivateKey() { //Ű ����
    const keyPair = ec.genKeyPair(); //����Ű ���Ű ���� Ÿ������� �����´�
    const privateKey = keyPair.getPrivate(); //Ű �ֿ��� ���Ű�� �����´�
    return privateKey.toString(16); //���ڿ��� �ٲ۴�
  }
  ```
  4. ���Ű���Ͽ� �ش� Ű�� ���´�
===

## http �޼��� ���� ����

### 1.
app.get("/blocks"): Ŭ���̾�Ʈ���� ��ü ���ü���� �����Ѵ�. blockchain ����� getBlockchain() �Լ��� ����Ͽ� �����͸� �˻��Ѵ�.

```
    app.get("/blocks", function (req, res) { //��ü�� ������ ȣ�� -> ��ü ��� ��� ����
        res.send(getBlockchain()); // ������ Ŭ���̾�Ʈ���� ���ü���� ������
    });
```

### 2.
app.get('/block/:number'): ��ȣ�� Ư�� ����� �˻��Ѵ�. getBlockchain()�� indexWith()�� �����Ͽ� ��� ����� ã�´�.

```
    app.get('/block/:number', function (req, res) { //���ϴ� ��� ȣ�� (:number)
        try { //���� �߻� ���� (javascript try and catch)
            const targetBlock = getBlockchain().indexWith(req.params.number); //���� �Ҵ� (params.number, indexwith)
            res.send(targetBlock); // ������ ������ Ŭ���̾�Ʈ���� ������
        }
        catch (err) { //���� �߻� ����
            res.status(400).send('Bad Request'); //���� ���� ������
            console.log(err); // �����޼��� �α����
        }
    });
```

### 3.
app.post("/mineBlock"): ������ �����ͷ� �� ����� ä���Ѵ�. blockchain ����� mineBlock() �Լ��� ��� ������ ó���ϰ� ���ü�ο� �߰��Ѵ�.

```
    app.post("/mineBlock", function (req, res) { // ��ϻ���(post get)
        const data = req.body.data || []; //��ϻ����� �ʿ� ������ (body.data)
        const newBlock = mineBlock(data); //�����͸� ������ ��ϻ���
        if (newBlock === null) { //����� ������(===)
            res.status(400).send('Bad Request'); //�������� ������
        }
        else { //����� ����� �Ҵ�ɽ�
            res.send(newBlock); //��Ϻ������� �˸���(reset api, react api)
        }
    });
```

### 4.
app.get("/version"): ��� ����Ʈ������ ���� ������ �����Ѵ�. utils ����� getCurrentVersion()�� ����Ѵ�.

```
    app.get("/version", function (req, res) { //���� Ȯ��
        res.send(getCurrentVersion()); //���� ��������
    });
```

### 5.
app.get("/blockVersion/:number"): Ư�� ����� ������ �����Ѵ�. ���⼭ ������ ��� ����� �Ӽ�����, app.get('/block/:number')�� �����ϰ� ��´�.

```
    app.get("/blockVersion/:number", function (req, res) { //���ϴ� ����� ���� Ȯ��
        try {//���� ���� ����(try)
            const targetBlock = getBlockchain().indexWith(req.params.number); //Ÿ�� ��� �Ҵ�
            res.send(targetBlock.header.version); //Ÿ�ٺ���� ����� ���� ������
        }
        catch (err) { //���� �߻���
            res.status(400).send('Bad Request'); // �����޼��� �߼�
            console.log(err);
        }
    });
```

### 6.
app.get("/peers"): ����� �Ǿ� ����� ��ȯ�Ѵ�. network ����� getSockets()�� ����Ͽ� �����͸� �����Ѵ�.

```
    app.get("/peers", function (req, res) { //���� ����� �Ǿ� ��� ȣ�� (�ݹ��Լ��� �񵿱�)
        res.send(getSockets().map(function (s) { //��� ��ȯ(������, ��)
            return s._socket.remoteAddress + ':' + s._socket.remotePort;
        }));
    });
```

### 7.
app.post("/addPeers"): �� �Ǿ �����Ѵ�. ��û ������ ������ �Ǿ� URL ������� network ����� connectToPeers()�� ȣ���Ѵ�.

```
    app.post("/addPeers", function (req, res) { //�Ǿ� ���ϱ�(�Ǿ� �߰�)
        const peers = req.body.peers || []; //�Ǿ� �Ҵ�
        connectToPeers(peers); //�Ǿ� ����
        res.send(); //����Ϸ� ������
    });
```

### 8.
app.get("/address"): ����� �������� ������ ���� �ּҸ� �ǵ��� ������. wallet ����� getPublicFromWallet()�� ����Ѵ�.

```
    app.get("/address", function (req, res) { //�ּ�Ȯ��
        const address = getPublicFromWallet().toString(); //������ ����Ű���� ���ڿ� ����ȭ�� �ּ� �Ҵ�
        res.send({ "address": address }); //�޼��� ������
    });
```

### 9.
app.post("/stop"): HTTP ������ �����Ѵ�. �̴� ��� �Լ��� ���ư��� ������, ���μ����� �����ϴ� Node.js�� ���� �Լ��� process.exit()�� ���� ���� ȣ���̴�.

```
    app.post("/stop", function (req, res) { //���� ���߱�
        res.send({ "msg": "Stopping server" });
        process.exit(); //��ũ ������ ����
    });
```