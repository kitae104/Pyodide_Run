export async function connectSerial() {
    try {
        // WebSerial API로 포트를 요청
        const port = await navigator.serial.requestPort();
        console.log("Selected port:", port.getInfo());

        // 포트를 열고 COM3 설정 안내
        console.log("Ensure the selected port is COM3.");
        await port.open({ baudRate: 9600 });

        const writer = port.writable.getWriter();
        const reader = port.readable.getReader();

        // 데이터 전송
        console.log("Sending data to COM3...");
        await writer.write(new TextEncoder().encode("1"));
        
        // 잠시 대기 
        await new Promise(resolve => setTimeout(resolve, 1000));

        await writer.write(new TextEncoder().encode("2"));
        
        // 데이터 읽기
        const { value, done } = await reader.read();
        if (!done) {
            console.log("Received from COM3:", new TextDecoder().decode(value));
        }

        // 리소스 해제
        writer.releaseLock();
        reader.releaseLock();
        await port.close();
        console.log("Connection to COM3 closed.");
    } catch (err) {
        console.error("Error in connectSerial:", err);
    }
}