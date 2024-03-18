'use strict';
import { cloneDeep, split } from "lodash";
import { existsSync, mkdirSync, readFileSync } from "fs";

function deepCopy(src) { //���� ���� (cloneDeep)
    return cloneDeep(src);
}

function deepEqual(value, other) { //�ݼ� ���ϱ�
    // return _.isEqual(value, other); // Can not get rid of functions.
    return JSON.stringify(value) === JSON.stringify(other); //���̽� ������ ������ Ȯ���ϱ�
}

function recursiveMkdir(path) { //(split)
    var pathSplited = path.split('/'); //���ϰ�θ� �����ô�� ������ �迭ȭ
    var tempPath = '';
    for (var i = 0; i < pathSplited.length; i++) {
        tempPath += (pathSplited[i] + '/'); //�����ø� �ֱ�
        if (!existsSync(tempPath)) { mkdirSync(tempPath); } //������ �������� �ʴٸ� 
    }
}

function hexToBinary(s) { //�� �б�
    const lookupTable = {
        '0': '0000', '1': '0001', '2': '0010', '3': '0011',
        '4': '0100', '5': '0101', '6': '0110', '7': '0111',
        '8': '1000', '9': '1001', 'A': '1010', 'B': '1011',
        'C': '1100', 'D': '1101', 'E': '1110', 'F': '1111'
    };

    var ret = "";
    for (var i = 0; i < s.length; i++) {
        if (lookupTable[s[i]]) { ret += lookupTable[s[i]]; } //������ ��ȯ�Ͽ� ���̱�
        else { return null; }
    }
    return ret;
}

function getCurrentTimestamp() {
    return Math.round(new Date().getTime() / 1000); //�����Ϳ��� �ʴ��� �ð��� ���� �и�����Ʈ�� �����(math.round)
}

function getCurrentVersion() {
    const packageJson = readFileSync("./package.json"); //��Ű���� ���̽� ���� �б�
    const currentVersion = JSON.parse(packageJson).version; //���̽� ���ڿ��� �ڹٽ�ũ��Ʈ ��ü�� ��ȯ
    return currentVersion;
}

export default {
    deepCopy,
    deepEqual,
    recursiveMkdir,
    hexToBinary,
    getCurrentTimestamp,
    getCurrentVersion
};
