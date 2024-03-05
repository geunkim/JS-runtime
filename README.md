# JS-runtime

This repository is intended to gather materials and programs that researchers in our Lab can use to understand NodeJS.  

Contents

### 1. Node란 무엇인가?
   
   + : Node란 런타임 환경을 구축하는 자바스크립트 가상머신 엔진입니다. 보통 웹서버와 같은 네트워크 프로그램을 구축할 때 사용됩니다
     
   + 가상머신이란 : 하드웨어적 컴퓨터 시스템이 돌아가는 상태에서 돌아가는 소프트웨적 컴퓨터 시스템을 이야기 합니다. 간단히 말해 물리적 컴퓨터 안의 프로그램적 컴퓨터를 이야기합니다.
     
   + 런타임 환경이란 : 런타임은 컴퓨터 프로그램이 돌아가는 프로세스 (과정 및 상태)를 이야기합니다. 런타임 환경은 프로그램이 돌아가는 프로세스로 만든 컴퓨터 시스템 환경을 이야기 합니다.
   
따라서 node란 자바스크립트를 이용해 소프트웨어 컴퓨터를 구동시키는 프로그램이라고 할 수 있습니다.   
   
### 2. Node를 이용한 개발환경 구축 방법
   
   #### 1. https://nodejs.org/en/download 에서 시스템 운영체제에 맞는 노드를 다운로드 하여 설치해 줍니다.
      
      + 설치가 완료되었는지 확인하기 위해 cmd(명령 프롬프트)에서 node -version을 쳐서 노드의 버전을 확인할 수 있습니다.
        
         + cmd : Microsoft Windows의 기본 유틸리티로, Windows NT 계열 운영 체제의 명령줄 해석기(CLI)입니다. 여기서 유틸리티란 관리시스템 프로그램을 이야기합니다
           
  #### 2. node를 사용하기 위해서는 npm 설치가 필요합니다. cmd에서 npm install를 통해 설치할 수 있습니다.
      
      + npm이란 : nodejs에서 구동되는 자바스크립트 패키지 관리자를 이야기합니다. 여기서 패키지란 node에서 구동되는 동작단위로 모듈화된 특정 기능들을 하나의 단위로 묶은 것을 이야기합니다.

      > 잠깐! 패키지는 왜 사용하는 것일까?
      > 패키지를 사용하는 이유는 개발시 더 편리하게 하기 위함입니다.
      > 개발시 필요한 특정 기능들을 바로바로 쓸수 있도록 따로 정의한 함수 혹은 클래스 같은 것입니다.

      + 추가로 npm install babel을 통해 babel 설치하여 하위 브라우저에서도 최신 코드가 돌아가는 환경을 구축할 수 있습니다.
        
        + babel이란 : 최신 버전으로 작성한 코드가 하위법전의 브라우저에서도 구동될 수 있도록 하는 컴파일러입니다.
          
        + 컴파일러는 : 어떤 프로그램이 실행되기전 처리를 하는 프로그램이므로 babel도 컴파일러라 할 수 있습니다.

      > babel이 나타난 이유는 node가 기본적으로 브라우저 환경을 구축한 런타임 환경이기 때문입니다.
      > 브라우저는 프로그램이므로 업데이트되며 버전이 갱신되는데, 버전 갱신은 사용자가 직접 해주어야 합니다.
      > 따라서 브라우저를 배포한 개발사의 의도와 다르게 하위 브라우저에서 최신 코드가 구동되므로 해당 웹을 브라우저에서 구동시 오류가 발생할 수 있습니다.
      > 따라서 babel은 해당 상황을 방지하기 위해 사용되는 것입니다.

   #### 3. 설치 후 환경변수에 %NODE_HOME%을 추가한다   

      + 환경변수란 : 
5. 간단한 Hello World 출력하는 프로그램 실행
