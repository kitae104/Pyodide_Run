let port;        // 전역 변수로 직렬 포트 유지
let writer;      // 쓰기 객체
let reader;      // 읽기 객체

export async function connectSerial() {
    try {
        // 직렬 포트를 사용자로부터 요청
        port = await navigator.serial.requestPort();
        await port.open({ baudRate: 9600 });

        // 쓰기 및 읽기 객체 생성
        writer = port.writable.getWriter();
        reader = port.readable.getReader();

        console.log("Serial connection established.");
    } catch (err) {
        console.error("Error in connectSerial:", err);
    }
}

export async function sendData(data) {
    try {
        if (writer) {
            await writer.write(new TextEncoder().encode(data));
            console.log(`Sent: ${data}`);
        } else {
            console.error("No serial connection. Call connectSerial first.");
        }
    } catch (err) {
        console.error("Error in sendData:", err);
    }
}

export async function readData(callback) {
    try {
        if (reader) {
            while (true) {
                const { value, done } = await reader.read();
                if (done) {
                    console.log("Serial connection closed.");
                    break;
                }
                if (value) {
                    const decodedData = new TextDecoder().decode(value);
                    console.log(`Received: ${decodedData}`);
                    if (callback) {
                        callback(decodedData);
                    }
                }
            }
        } else {
            console.error("No serial connection. Call connectSerial first.");
        }
    } catch (err) {
        console.error("Error in readData:", err);
    }
}

export async function closeSerial() {
    try {
        if (writer) {
            writer.releaseLock();
        }
        if (reader) {
            reader.releaseLock();
        }
        if (port) {
            await port.close();
            console.log("Serial connection closed.");
        }
    } catch (err) {
        console.error("Error in closeSerial:", err);
    }
}
