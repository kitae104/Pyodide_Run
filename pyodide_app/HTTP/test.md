Pyodide-HTTP
PyPI 최신 릴리스 GHA

JupyterLite와 같은 Pyodide 환경에서 작동하도록 많이 사용되는 http 확장에 대한 패치를 제공합니다.

용법
# 1. Install this package
import micropip
await micropip.install('pyodide-http')

# 2. Patch requests
import pyodide_http
pyodide_http.patch_all()  # Patch all libraries

# 3. Use requests
import requests
response = requests.get('https://raw.githubusercontent.com/statsbomb/open-data/master/data/lineups/15946.json')
어떻게 작동할까요?
이 패키지는 일반적인 http://blog.daum.net/publish/packages/packages를 적용합니다. 기능 작동 방식은 패키지에 따라 요청합니다.

모든 비스트리밍 요청은 사용하는 호출로 중복 XMLHttpRequest됩니다.

스트리밍 요청(즉, 요청이 된 호출)은 웹 스레딩을 복제할 수 있는 상태(원본 간 격리가 활성화된 경우)에 포함된 경우에만 별도의 웹 농부에 대한 stream=True호출로 복제됩니다. fetch당신은 웹 농부에서 pyodide를 실행하고 있습니다. 그렇지 않으면 WebAssembly 스택 전환이 가능할 때까지 가능하며 모든 것을 다음 메모리 버퍼에 스트림을 반환하는 구현으로 반환합니다.

Cross-Origin 활성화 격리
스트리밍 요청 구현은 Atomics.wait 및 SharedArrayBuffer를 사용하여 별도의 웹 농부에서 가져오기를 수행합니다. 복잡한 웹 상의 중단 중단 중단을 활성화하지 않으면 SharedArrayBuffers를 웹 농부에게 계속할 수 없습니다. 다음 2개의 헤더를 사용하여 페이지를 제공하여 활성화합니다.

Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
페이지에 삽입할 수 있는 항목에 영향을 주는 것은 점에 유의 하세요. 자세한 내용은 https://web.dev/cross-origin-isolation-guide/ 를 확인하세요.

지원되는 패키지