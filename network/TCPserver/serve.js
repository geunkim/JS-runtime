const net = require('net');

//1. ������ ������ �����ϰ�(socket�Լ�), 
//4. Ŭ���̾�Ʈ�� �����ϴ� ��(accept�Լ�)�� �Ǿ� �ִ�.
const serve = net.createServer((socket) => {
    console.log('client connect');

    // 5. Ŭ���̾�Ʈ���� �����͸� �ް�(recive�Լ�)
    socket.on('data', (data) => {
        console.log(`Recive data for client : ${data}`);
    
        // 6. ������ �ͱ���(send�Լ�) �����Ǿ��ִ�.
        socket.write(data);

        // ������ ��ģ��
        socket.end('end', () => {
            console.log('client disconnect');
        });
    });
});



//2. 1.���� ������ ������ �ּҿ� �� ���� �ּұ���ü�� ������ �Ҵ��ϰ�(bind�Լ�)
//3. Ŭ���̾�Ʈ���� �����û �ް� ����ϴ�(listen�Լ�) ���� �����Ǿ��ִ�.
// ���� �̺�Ʈ�� ���� �̺�Ʈ�� �߻��Ͽ��� Ŭ���̾�Ʈ�� ����Ǹ鼭 �޼����� �ް� �����ϴ� �Լ��� ����� �� �ִ�.
const port = 8080;
serve.listen(port, () => {
    console.log(`Server listen on port: ${port}`);
});
