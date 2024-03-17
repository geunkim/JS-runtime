"use strict";
import { deepCopy } from "./modules"; // utils
import { SHA256 } from "./modules"; // crypto
import { db } from "./modules"; // database

class BlockHeader { //������
    constructor(version, index, previousHash, timestamp, merkleRoot, difficulty, nonce) {
        this.version = version;
        this.index = index;
        this._previousHash = previousHash;
        this.timestamp = timestamp;
        this.merkleRoot = merkleRoot;
        this.difficulty = difficulty;
        this.nonce = nonce;
    }

    get previousHash() { //(get)���� �ؽø� ����(�ڹٽ�ũ��Ʈ _)(get, set)
        return this._previousHash.toUpperCase(); // always return upper case letters.
    }

    /**
     * @param {string} newPreviousHash
     */
    set previousHash(newPreviousHash) { //���ο� �ؽø� �޾��� ��, ���ο� �ؽø� ���� �ؽ÷� ��R���Ѵ�
        this._previousHash = newPreviousHash;
    }

    hash() { //�ؽ� �� �����
        return SHA256([
            this.version,
            this.index,
            this.previousHash,
            this.timestamp,
            this.merkleRoot,
            this.difficulty,
            this.nonce
        ]);
    }
}

class Block { //�������� ��ϵ����� ���� ����ϱ�
    constructor(header, data) {
        this.header = deepCopy(header); //��� ������ ����ϱ�(deepclone �������)
        this.data = deepCopy(data);
    }

    hash() { //�ؽð� ���
        return this.header.hash();
    }

    encode() { //���ڵ� ���̽� ���ڿ��� ��ȯ
        return JSON.stringify(this);
    }

    decode(encodedBlock) { //���ڵ� ����
        var decodedBlock = JSON.parse(encodedBlock);
        var objectifiedBlock = Object.assign(new Block(), decodedBlock);///(assign)
        objectifiedBlock.header = Object.assign(new BlockHeader(), objectifiedBlock.header);
        return objectifiedBlock;
    }
}

class Blockchain { //���ü��
    constructor(blocks) { //��� ���� ���
        this._blocks = deepCopy(blocks);
        try { this._length = this.blocks.length; } catch (err) { /* console.log(err); */ } // for decode()
    }

    get blocks() {//��� ���ϱ�
        return this._blocks;
    }

    get length() { //����
        return this._length;
    }

    push(newBlock) {
        this.blocks.push(newBlock); //��� ���ϱ�
        this._length = this.blocks.length;
    }

    indexWith(index) {//���� �߻� ����
        if (index >= this.length || index < (-1) * this.length) { throw RangeError(); }

        if (index < 0) { return this.blocks[this.length + index]; } //�ε��� �� �´ٸ� �ش� �ε��� ��ȯ
        else { return this.blocks[index]; }
    }

    latestBlock() { //�ֱ� ��� ����
        return this.indexWith(-1);
    }

    latestBlockHash() { //�ֱ� ��� �ؽ� ���
        return this.latestBlock().hash();
    }

    encode() { //���ڵ� ���
        return JSON.stringify(this);
    }

    decode(encodedBlockchain) { //���ڵ� ���
        var decodedBlockchain = JSON.parse(encodedBlockchain);
        var objectifiedBlockchain = Object.assign(new Blockchain(), decodedBlockchain);

        var decodedBlocks = objectifiedBlockchain.blocks.map(function (encodedBlock) {
            /**
             * TODO: optimization.
             * Meaningless repetition of JSON.stringify and JSON.parse in Block().decode()
             */
            return new Block().decode(JSON.stringify(encodedBlock));
        });

        return new Blockchain(decodedBlocks);
    }

    async save() { //������ ���̽��� ��� ����
        const encodedBlockchain = this.encode();
        try { await db.put("Blockchain", encodedBlockchain); }
        catch (err) { throw err; }
    }

    async load() { //���ü�� ��������
        try {
            const encodedBlockchain = await db.get("Blockchain");
            return new Blockchain().decode(encodedBlockchain);
        }
        catch (err) {
            return undefined;
        }
    }
}

export default {
    BlockHeader,
    Block,
    Blockchain
};
