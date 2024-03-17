import { SHA256 as _SHA256 } from "crypto-js";
import merkle from "merkle";
import { ec as _ec } from "elliptic";

const ec = new _ec("secp256k1");

function SHA256(elems) { //Ÿ���Ű (reduce)
    return _SHA256(elems.reduce(function (acc, elem) {
        return acc + elem;
    })).toString().toUpperCase();
}

function calculateMerkleTree(data) { //��Ŭ��Ʈ Ʈ�� ���
    return merkle("sha256").sync(data);
}

function calculateMerkleRoot(data) { //��ŬƮ���� ��Ʈ�� ����ϱ�
    const merkleTree = calculateMerkleTree(data);
    const merkleRoot = merkleTree.root() || '0'.repeat(64);
    return merkleRoot;
}

export default {
    ec,
    SHA256,
    calculateMerkleTree,
    calculateMerkleRoot
};
