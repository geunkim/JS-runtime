"use strict";
import { getCurrentVersion } from "./modules"; // 
import { initBlockchain, getBlockchain, mineBlock } from "./modules"; // 
import { getSockets, connectToPeers, initP2PServer } from "./modules"; // 
import { getPublicFromWallet, initWallet } from "./modules"; // 

import cors from "cors";
import express from "express";
import { json } from "body-parser";

const http_port = process.env.HTTP_PORT || 3001; // ȯ�漳���� ��Ʈ��ȣ �Ҵ� 
const initialPeers = process.env.PEERS ? process.env.PEERS.split(',') : []; //�Ǿ��ʱ�ȭ �Ҵ� (split)

function initHttpServer() { //���� �ʱ�ȭ
    const app = express(); //express ��ũ������ ��� �Ҵ�
    app.use(cors()); //(cors)
    app.use(json()); //(use.json)

    app.get("/blocks", function (req, res) { //��ü�� ������ ȣ�� -> ��ü ��� ��� ����
        res.send(getBlockchain()); // ������ Ŭ���̾�Ʈ���� ���ü���� ������
    });
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
    app.get("/version", function (req, res) { //���� Ȯ��
        res.send(getCurrentVersion()); //���� ��������
    });
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
    app.get("/peers", function (req, res) { //���� ����� �Ǿ� ��� ȣ�� (�ݹ��Լ��� �񵿱�)
        res.send(getSockets().map(function (s) { //��� ��ȯ(������, ��)
            return s._socket.remoteAddress + ':' + s._socket.remotePort;
        }));
    });
    app.post("/addPeers", function (req, res) { //�Ǿ� ���ϱ�(�Ǿ� �߰�)
        const peers = req.body.peers || []; //�Ǿ� �Ҵ�
        connectToPeers(peers); //�Ǿ� ����
        res.send(); //����Ϸ� ������
    });
    app.get("/address", function (req, res) { //�ּ�Ȯ��
        const address = getPublicFromWallet().toString(); //������ ����Ű���� ���ڿ� ����ȭ�� �ּ� �Ҵ�
        res.send({ "address": address }); //�޼��� ������
    });
    app.post("/stop", function (req, res) { //���� ���߱�
        res.send({ "msg": "Stopping server" });
        process.exit(); //��ũ ������ ����
    });

    app.listen(http_port, function () { console.log("Listening http port on: " + http_port) }); //���� ���
}

// main
(async function () { // (async)
    await initBlockchain(); // (await)
    connectToPeers(initialPeers); //�ʱ� �Ǿ� ����
    initHttpServer(); //http ���� �ʱ�ȭ
    initP2PServer(); //������ ���� �ʱ�ȭ
    initWallet(); //���� �ʱ�ȭ
})();
