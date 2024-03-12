//chapter-1
"use strict"; //엄격모드 사용 - 약간의 오류나 예상되는 오류를 잡아준다
const fs = require("fs"); //디렉토리의 외부 모듈을 사용하겠다라는 의미 commonjs모드에 있음
const merkle = require("merkle"); // 3줄과 같음
const CryptoJS = require("crypto-js"); //3줄과 같음

class BlockHeader{ //블록헤더 클래스
    constructor(version, index, previousHash, timestamp, merkleRoot){ //생성자
        this.version = version; //클래스 내부에서 사용할 속성 따로 명시하진 않고 this로 명시한다 블록체인의 자체 버전 
        this.index = index; // 블록의 길이(인덱스)
        this.previousHash = previousHash; //이전블록의 해시값(블록의 무결성 검증)
        this.timestamp = timestamp; //타임스탬프(시간)
        this.merkleRoot = merkleRoot; // 머클루트(데이터의 무결성 검증)
    }
    //블록헤더의 정보를 짠 자료구조 클래스이다 
}

class Block{//블록 클래스
    constructor(header, data){ // 생성자
        this.header = header; // 클래스 내부 속성. 헤더(블록체인 헤더부분)
        this.data = data; // 클래스 내부 속성 데이터필드
    }
}

var blockchain = [getGenesisBlock()]; //블록체인, 배열로 선언, 배열 값 첫번째는 제네시스 블록이 있다.

function getBlockchain() { return blockchain; } //블록체인을 반환하는 함수
function getLatestBlock() {return blockchain[blockchain.length - 1];} //블록체인의 마지막 블록을 반환하는 함수, 인덱스로 연산하여 반환한다   

function getGenesisBlock(){ //제네시스 블록 생성 함수
    const version = "1.0.0"; //버전
    const index = 0; //인덱스
    const previousHash = '0'.repeat(64); //이전 해시값. 초기 값이니 전부 0으로 만든다. sha256이 64개 문자열을 반환하니까
    const timestamp = 1231006505; //시간
    const data = ["The Times 03/Jan/2009 Chancellor on brink of second bailout for banks"]; //데이터

    const merkleTree = merkle("sha256").sync(data); //"sha256" 타입으로 머클트리를 만들고 데이터가 업데이트 되면 바로 반영하기로 한다 데이터는 블록의 멤버변수 중 하나다
    const merkleRoot = merkleTree.root() || '0'.repeat(64); //머클루트 머클트리에서 루트를 만들어 낸다. 만약 데이터가 비어있어서 루트를 만들 수 없다면 0으로 한다

    const header = new BlockHeader(version, index, previousHash, timestamp, merkleRoot); //블록헤더 클래스 객체를 선언한다
    return new Block(header, data); //블록헤더와 데이터로 블록 클래스 객체르 선언한다 그리고 함수의 값을 반환한다
}

function genrateNextBlock(blockData){ //다음 블록을 생성한다
    const previousBlock = getLatestBlock(); // 블록체인 마지막 블록 가져오는 함수를 이용해 마지막 블록을 함수 블럭의 변수에 저장. 블럭에서 추출할 멤버변수를 위해 저장한것
    const currentVersion = getCurrentVersion(); // 현재 블록체인의 버전을 가져오는 함수를 이용해 버전 변수에 저장
    const nextIndex = previousBlock.header.index + 1; //마지막 블록의 인덱스에 1을 더한 인덱스 값을 변수에 저장
    const previousHash = calculateHashForBlock(previousBlock); //마지막 블록을 매개변수로 해서 해시값을 계산하여 해시값 멤버변수에 저장   
    const nextTimestamp = getCurrentTimestamp(); //현재 시간을 반환하는 함수를 이용해 타임스탬프 멤버변수에 저장   

    const merkleTree = merkle("sha256").sync(blockData);  //"sha256" 타입으로 머클트리를 만들고 데이터가 업데이트 되면 바로 반영하기로 한다 데이터는 블록의 멤버변수 중 하나다
    const merkleRoot = merkleTree.root() || '0'.repeat(64); //머클루트 머클트리에서 루트를 만들어 낸다. 만약 데이터가 비어있어서 루트를 만들 수 없다면 0으로 한다
    const newBlockHeader = new BlockHeader(currentVersion, nextIndex, previousHash, nextTimestamp, merkleRoot); //블록헤더 클래스 객체를 선언한다

    return new Block(newBlockHeader, blockData); //블록헤더와 데이터로 블록 클래스 객체르 선언한다 그리고 함수의 값을 반환한다
}

function getCurrentVersion(){ //현재 버전 구하는 함수
    const packageJson = fs.readFileSync("./package.json"); //메타데이터가 정리된 패키지 제이슨파일에서 파일시스템 클래스의 함수인 파일읽기 함수로 제이슨 파일 읽고 저장
    const currentVersion = JSON.parse(packageJson).version; //제이슨 모듈에서 제이슨파일 매개변수에서 버전이라는 이름을 가진 것을 파싱함(버전이라 되어 있는 것을 찾고 그에 맞게 해석하고 읽어옴)
    return currentVersion; //버전 반환
}

function getCurrentTimestamp(){ //현재 타임 구하기
    return Math.round(new Date().getTime() / 1000); //숫자 모듈에서 반올립 함수를 이용한다. 값은 데이터 클래스 객체를 사용하고 클래스 객체의 시간을 구하는 함수로 시간을 얻고 시간이 밀리초이기에 1초로 만들어야해서 1000으로 나눈다
}

function calculateHash(version, index, previousHash, timestamp, merkleRoot){ //해시 계산 함수
    return CryptoJS.SHA256(version + index + previousHash + timestamp + merkleRoot).toString().
    toUpperCase(); //암호와 알고리즘 라이브러리에서 sha56해시 알고리즘을 통해 해시값을 만든다. 해시값을 문자열로 만들고, 문자열의 알파벳을 다 대문자로 만들어준다
}

function calculateHashForBlock(block){ //블록에서 값을 찾아 그 값으로 해시 계산하기
    return calculateHash( //블록 헤더의 버전, 인덱스, 해시, 타임스탬프, 머클루트를 매개변수로 받는다
        block.header.version,
        block.header.index,
        block.header.previousHash,
        block.header.timestamp,
        block.header.merkleRoot
    );
}

function isValidNewBlock(newBlock, previousBlock){ //생성된 블록이 유효한지 확인하는 함수
    if(!isValidBlockStructure(newBlock)){ //블록 구조가 유효하지 않다면 펄스 반환
        console.log('invalid block structure : %s', JSON.stringify(newBlock));
        return false;
    }
    else if(previousBlock.header.index + 1 != newBlock.header.index){  //생성된 블록의 인데긋가 이전 블록 인덱스에서 1 더한 값이 아닌 경우 펄스 반환
        console.log("invalid index");
        return false;
    }
    else if (calculateHashForBlock(previousBlock) != newBlock.header.previousHash){ //이전 블록에서 계산한 해시값과 생성된 블록의 이전해시값이 같지 않은 경우 펄스 반환
        console.log("Invalied previous Hash")
        return false;
    }
    else if(
        (newBlock.data.length != 0 && (merkle("sha256").sync(newBlock.data).root() != newBlock.header.merkleRoot)) //생성된 블록 데이터의 머클루트와 헤더 머클루트가 다른경우
        || (newBlock.data.length == 0 && ('0'.repeat(64) !=  newBlock.header.merkleRoot)) // 펄스 반환, 앞의 생성된 데이터의 길이를 조사하는 이유는 데이터가 없다면 머클루트가 0이기에 이것을 판별하기 위해 넣어줌
    ){
        console.log('Invalid merkleRoot');
        return false;
    }
    return true;
}

function isValidBlockStructure(block){ //블록구조가 유효한지 조사하는 함수 블록헤더에 있는 데이터들의 타입을 확인한다
    return typeof(block.header.version) === 'string' //엄격한 일치 비교연산자로 형변환을 전혀 고려하지 않는다. 
        && typeof(block.header.index) === 'number'
        && typeof(block.header.previousHash) === 'string'
        && typeof(block.header.timestamp) === 'number'
        && typeof(block.header.merkleRoot) === 'string'
        && typeof(block.data) === 'object';
}

function isValidChain(blockchainToValidate){ //체인이 유효한지 확인하는 함수 생성블록 유효 함수를 반복하는 것이다
    if (JSON.stringify(blockchainToValidate[0]) != JSON.stringify(getGenesisBlock())){ //블록의 데이터를 제이슨 형태의 문자열 데이터로 표시한다 최초의 제네시스 블록과 같은지 확인하여 체인이 유효한지 확인한다
        return false;
    }
    var tempBlocks = [blockchainToValidate[0]]; //블록체인의 첫번째 값을 저장한다 배열에
    for (var i = 1; i < blockchainToValidate.length; i++){ //반복문을 이용하여 i를 1로 초기화 하고 블록체인 인덱스까지 반복하고 블럭이 끝날때 마다 i를 1올린다 
        if(isValidNewBlock(blockchainToValidate[i], tempBlocks[i - 1])){ //각 블럭들이 유효하다면 (블록유효 함수)
            tempBlocks.push(blockchainToValidate[i]); //선언한 배열에 뒤에서 부터 넣어준다. 해당 함수를 쓸때마다 덮어 써진다
        }
        else { return false};
    }
    return true;
}

function addBlock(newBlock) { // 블록을 더한다
    if(isValidNewBlock(newBlock, getLatestBlock())){ //블록 유효함수를 통해  생성된 블록이 마지막 블록과 비교하여 유효한지 검증하고
        blockchain.push(newBlock); //검증이 완료되면 블록체인에 추가한다
        return true;
    }
    return false;
}


//chapter-2
const http_port = process.env.HTTP_PORT || 3001; //구동되는 런타임 환경의 환경변수, 앞의 것이 0이 아니면 앞의 것을 적용시키고 0이면 뒤에것을 적용시킨다. 포트번호가 할당되엉야 노드끼리 통신이 가능하기 때문이다
const p2p_port = process.env.P2P_PORT || 6001; //마찬가지

const express = require("express"); //익스플로 모듈을 불러와 저장한다. 익스플로는 웹서비스 워크프레임을 말한다. 이것이 있으면 개발자는 따로 웹개발 틀을 만들지 않고 해당 프레임워크 안에서 작업하면된다
const bodyParser = require("body-parser"); //바디프레져를 불러와 저장한다. http에서 보내는 메시지의 몸체, 데이터를 쉽게 추출하게 하는 모듈이다. 

const WebSocket = require("ws"); //서버와 클라이언트간의 양방향 통신을 만들어주는 웹소켓이다. 이것이 있어야 서버 클라이언트 구조가 아닌 p2p구조가 되어 블록체인 네트워크를 형성할 수 있따

const random = require("random"); // 랜덤수 모듈 불러와 저장

const MessageType = {
    QUERY_LATEST : 0,
    QUERY_ALL : 1,
    RESPONSE_BLOCKCHAIN :2 
};

function initHttpServer() { //http서버를 초기화 한다
    const app = express(); // express모듈을 app 상수변수 객체에 저장한다   
    app.use(bodyParser.json());  // 패키지제이슨파일의 몸체 메세지를 파싱하는 것으로 모듈을 설정한다

    app.get("/blocks", function(_req, res){ //블럭체인 정보를 알려달라는 요청 
        res.send(getBlockchain());//res가 getBlockcain 값을 url에 붙여 보낸다.
    });

    app.post("/mineBlock", function (req, res) {//블럭을 생성해달라는 요청
        const data = req.body.data || []; //req의 http 프로토콜의 몸체인 데이터를 변수로 지정한다. 만약 몸체가 비어있다면 공란값으로 지정한다
        const newBlock = mineBlock(data); //데이터를 받아 블럭으로 만든 값을 변수에 저장한다
        if (newBlock == null) {//만약 새로운 블럭변수가 null값이면 블럭만들기에 실패했다는 의미가 되므로
            res.status(400).send('Bad Request'); //처리상태를 오류상태 400으로 설정하고, 실패했다는 내용의 문자열을 몸체에 실어 보낸다
        }
        else{//블럭이 성공적으로 생성됐다면, 그것을 저장한 값을 보낸다 
            res.send(newBlock);
        }
    });

    app.get("/version", function(req, res) {//블럭의 버전을 알려달라는 요청
        res.send(getCurrentVersion()); // 블럭의 값을 현재 버전에 실어 보낸다
    });

    app.post("/stop", function (req, res){//서버구동을 멈추라는 요청
        res.send({"msg" : "Stopping server"}); //req에게 해당 쿼리스트링을 담아서 보낸다
        process.exit(); //그리고 엔진을 종료시킨다
    })

    app.get("/peers", function(req, res){ //연결된 피어를 확인하는 요청
        res.send(getSockets().map(function (s){
            return s._socket.remoteAddress + ':' + s._socket.remotePort;
        })); 
    });

    app.post("/addpeers", function (req, res){//피어를 추가해달라는 요청
        const peers = req.body.peers || []; //요청쪽에서 포트 주소가 담긴 http 프로토콜의 메세지 몸체 객체를 저장
        connectToPeers(peers); //그 메시지 몸체의 피어의 주소를 담음
        res.send(); //응답한다
    })

    app.listen(http_port, function() { console.log("Listening http port on:" + http_port) });//서비스 대기 상태
}

function initP2PServer(){ //웹소켓 서버  초기화
    const server = new WebSocket.Server({port : p2p_port}); // 웹소켓의 서버 객체를 할당된 포트번호로 생성
    server.on("connection", function (ws) {initConnection(ws);}); // 웹소켓를 서비스 전 대기열로 올리는데 연결이라는 이름의 대기열에 연결초기화함수 처리 후 올린다 
    console.log("listeing websocket p2p port on:"+ p2p_port);
}

function connectToPeers(newPeers){ //요청된 피어주소에 순차적으로 웹소켓을 만들고 소켓 배열에 넣어준다 
    newPeers.forEach(
        function(peer){
            const ws = new WebSocket(peer);
            ws.on("open", function () {initConnection(ws);});
            ws.on("error", function () {console.log("connection failed");});
        }
    );
}

var sockets = []; //소켓들을 저장하는 객체

function getSockets() { return sockets; } //소켓배열을 반환한다

function initConnection(ws){ //연결초기화 함수
    sockets.push(ws); //배열형 객체에 요소 객체를 넣음 -> 소켓을 소켓배열객체에 넣음
    intiMessageHandler(ws); //소켓의 메세지 핸들러를 초기화한다
    initErrorHandler(ws); //소켓의 에러 핸들러를 초기화한다
    write(ws, queryChainLengthMsg()); //해당 주소 소켓의 블럭 길이를 제이슨화시켜 요청자에게 보낸다
}

function write(ws, message) {ws.send(JSON.stringify(message));} //서버 소켓이 클라이언트에게 객체를 제이슨화 시켜 보낸다

function broadcast(message){ // 브로드 캐스트
    sockets.forEach(function (socket){ //소켓배열의 각 객체에게 메세지 내용을 전달한다
        write(socket, message);
    }) 
}

function initErrorHandler(ws) { //에러 핸들러를 초기화한다
    ws.on("close", function () {closeConnection(ws);}); //연결끊음 대기열에 연결끊기 함수가 적용되는 소켓을 올린다
    ws.on("error", function () {closeConnection(ws);}); // 오류 대기열에 올린다
}

function intiMessageHandler(ws) { //메세지 핸들러 초기화 함수
    ws.on("message", function (data){ //메세지 대기열에 메세지를 확인하는 함수를 적용시킨 객체 소켓을 올린다 
        const message = JSON.parse(data); // 제이슨을 객체로 변화

        switch (message.type) { // 메세지의 타입 확인
            case MessageType.QUERY_LATEST : //타입이 최근 쿼리를 갖오는 거라면
                write(ws, responseLatestMsg()); //나의 최근 블록을 객체로 받아 제이슨으로 보낸다
                break;
            case MessageType.QUERY_ALL : //타입이 모든 쿼리를 가지고는 오는 거라면
                write(ws, responseChainMsg());  //나의 블록체인를 객체로 받아 제이슨으로 보낸다
                break;
            case MassgeType.RESPONSE_BLOCKCHAIN : //타입이 블록체인을 처리하는 거라면
                handleBlockchainResponse(message);
                break;
        }
    });
}

function queryAllMsg(){ //모든 블럭의 데이터를 객체로 보낸다
    return ({
        "type" : MessageType.QUERY_ALL,
        "data" : null
    });
}

function queryChainLengthMsg() { // 최신 블럭의 데이터를 객체로 보낸다
    return ({
        "type" : MessageType.QUERY_LATEST,
        "data" : null
    });
}

function responseChainMsg(){ //반응으로 모든 블럭의 데이터를 객체로 보낸다
    return ({
        "type" : MessageType.RESPONSE_BLOCKCHAIN,
        "data" : JSON.stringify([getBlockchain()]) //블록체인 전체를 문자열 제이슨화 시킨다
    });
}

function responseLatestMsg() { //반응으로 최신 블럭의 데이터를 객체로 보낸다
    return ({
        "type" : MessageType.RESPONSE_BLOCKCHAIN,
        "data" : JSON.stringify([getLatestBlock()]) //최신 블록을 문자열 제이슨화 시킨다
    });
}

function handleBlockchainResponse(message) {
    const receivedBlocks = JSON.parse(message.data); //전파받은 블록 데이터의 제이슨을 블록체인 배열 객체로 변환한다
    const latestBlockReceived = receivedBlocks[receivedBlocks.length - 1]; //받아온 블록체인의 최신 블록을 얻는다
    const latestBlockHeld = getLatestBlock(); // 자신의 최근 블록을 가져온다

    if (latestBlockReceived.header.index > latestBlockHeld.header.index) { // 받은 블록의 인덱스가 가지고 있는 인덱스보다 길다면 갱신해야하나든 의미가 된다
        console.log(
            "Blockchain possibly behind."
            + " we got:" + latestBlockHeld.header.index + ", "
            + " Peer got: " + latestBlockReceived.header.index
        );

        if (calculateHashForBlock(latestBlockHeld) == latestBlockReceived.header.previousHash){ // 받은 블록의 이전해시가 내 최신 블럭의 해시와 값이 같다면 
            console.log("We can append the received block to our chain"); //새로운 블록 하나라는 의미가 된다
            if (addBlock(latestBlockReceived)) { //받은 블록은 자신의 블록체인에 더하고
                broadcast(responseLatestMsg()); // 다른 피어들에게 이 새 블록을 원장에 넣으라고 요청한다
            }
        }
        else if (receivedBlocks.length == 1){ // 받은 블록체인 길이가 1이라면
            console.log("We have to query the chain from our peer"); //중간에 블록을 놓쳤다는 의미가 된다
            broadcast(queryAllMsg()); // 따라서 다른 피어의 블록체인의 데이터를 받아 어디서 놓쳤는지 확인한다
        }
        else{ // 블록체인 길이가 내가 가진 길이보다 길고, 인덱스도 크고  받은 블록의 이전 해시값이 자신의 최신 블록의 해시값이 아니면 
            console.log("Received blockchain is longer than current blockchain"); // 새로운 블록이 여러개라는 의미가 된다
            replaceChain(receivedBlocks); //따라서 내 원장을 받은 블록체인으로 바꾼다
        }
    }
    else {console.log("Receied blockchain is not longer than current blockchain. Do nothing");} //인덱스가 크지 않다는 것은 자신의 블록체인에 갱신할 내용이 없는드 의미가된다
}

function mineBlock(blockData) { // 블록생성 함수
    const newBlock = generateNextBlock(blockData); //다음 블록을 지금 블록데이터를 받아 생성

    if(addBlock(newBlock)) {//블록을 추가한것이 성공하면
        broadcast(responselaatestMsg()); //브로드캐스트를 한다
        return newBlock; //생성된 블럭을 반환한다
    }
    else{
        return null;
    }
}

function replaceChain(newBlocks) { // 블록체인 변경
    if (
        isValidChain(newBlocks) //만약 새로운 블록체인이 유효하고 길이가 내 블록길이보다 크거나 그렇지 않으면 두 블록체인의 길이 자료 타입을 확인하고 무작위로 새로운 블록체인으로 갱신할지 정한다  
        && (newBlocks.length > blockchain.length || (newBlocks.length === blockchain.length) && random.boolean())
    ) {
        console.log("Received blockchain is valid. Replacing current blockchain with received blockchain");
        blockchain = newBlocks;
        broadcast(responseLatestMsg()); //내 최신 블록을 다른 피어들에게 전달한다
    }
    else { console.log("Received blockchain invalid"); }
}

function closeConnection(ws) { //연결을 끊는다
    console.log("Connection failed to peer: " + ws.url);
    sockets.splice(sockets.index0f(ws), 1);
}

initP2PServer();
initHttpServer();