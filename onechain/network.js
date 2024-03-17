"use strict";
import { Blockchain } from "./modules"; // types
import { getLatestBlock, addBlock, replaceChain, getBlockchain } from "./modules"; // blockchain

import WebSocket, { Server, on } from "ws";

const p2p_port = process.env.P2P_PORT || 6001; //������ ȭ�ᤷ����

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

function responseChainMsg() { //���ü���� ���̽����� ��ȯ�Ǽ� �°� ������
    return ({
        "type": MessageType.RESPONSE_BLOCKCHAIN,
        "data": getBlockchain().encode()
    });
}

function responseLatestMsg() { //�ֱ� ��� ���̽� �Ǽ� ������
    return ({
        "type": MessageType.RESPONSE_BLOCKCHAIN,
        "data": new Blockchain([getLatestBlock()]).encode()
    });
}

var sockets = []; //����

function write(ws, message) { ws.send(JSON.stringify(message)); } //���� ����

function broadcast(message) { //��ε�ĳ��Ʈ ����
    sockets.forEach(function (socket) { //�� ���ϸ��� ����
        write(socket, message);
    });
}

function getSockets() { return sockets; } //���Ϲ迭 ���ϱ�

function initP2PServer() { //������ ���� �ʱ�ȭ
    const server = new Server({ port: p2p_port });
    server.on("connection", function (ws) { initConnection(ws); }); //�����̶�� �̸����� �Լ��迭 ���� �ش� �Լ��� ȣ����� �� ������ �۵��ǵ��� ��
    console.log("Listening websocket p2p port on: " + p2p_port);
}

function initConnection(ws) { //���� �ʱ�ȭ
    sockets.push(ws);
    initMessageHandler(ws);// �޼��� ��鷯 �ʱ�ȭ
    initErrorHandler(ws); //���� �ڵ鷯 �ʱ�ȭ
    write(ws, queryChainLengthMsg());
}

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

function initErrorHandler(ws) { //�����ڵ鷯 �ʱ�ȭ
    ws.on("close", function () { closeConnection(ws); });
    ws.on("error", function () { closeConnection(ws); });
}

function closeConnection(ws) { //(splice)
    console.log("Connection failed to peer: " + ws.url);
    sockets.splice(sockets.indexOf(ws), 1);
}

function connectToPeers(newPeers) { //�����ϱ�(on)
    newPeers.forEach(
        function (peer) {
            const ws = new WebSocket(peer);
            ws.on("open", function () { initConnection(ws); });
            ws.on("error", function () { console.log("Connection failed"); });
        }
    );
}

function handleBlockchainResponse(message) { //�ڵ鷯 ����
    const receivedBlockchain = new Blockchain().decode(message.data); //�޼����� �޾� �ش� �޼����� �ִ� ���ü���� ���ڵ��Ͽ� ��
    const latestBlockReceived = receivedBlockchain.latestBlock(); //�ֱ� �� �ޱ�
    const latestBlockHeld = getLatestBlock();

    if (latestBlockReceived.header.index > latestBlockHeld.header.index) { //���� ����� �� ��Ϻ��� ���� ���̴�
        console.log(
            "Blockchain possibly behind."
            + " We got: " + latestBlockHeld.header.index + ", "
            + " Peer got: " + latestBlockReceived.header.index
        );
        if (latestBlockHeld.hash() === latestBlockReceived.header.previousHash) { //�ٷ� ���̴�
            // A received block refers the latest block of my ledger.
            console.log("We can append the received block to our chain");
            if (addBlock(latestBlockReceived)) { //�ٷ� ���Ѵ�
                broadcast(responseLatestMsg());
            }
        }
        else if (receivedBlockchain.length === 1) { //���̰� 1�̸� ���� �����Ѵ�
            // Need to reorganize.
            console.log("We have to query the chain from our peer");
            broadcast(queryAllMsg());
        }
        else { //�ƴ϶�� �ƿ� ����� �ٲ۴�
            // Replace chain.
            console.log("Received blockchain is longer than current blockchain");
            replaceChain(receivedBlockchain);
        }
    }
    else { console.log("Received blockchain is not longer than current blockchain. Do nothing"); }
}

export default {
    responseLatestMsg,
    broadcast,
    connectToPeers,
    getSockets,
    initP2PServer
};
