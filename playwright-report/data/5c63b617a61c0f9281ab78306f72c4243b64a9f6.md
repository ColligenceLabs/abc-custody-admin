# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e4]:
    - generic [ref=e5]:
      - heading "로그인" [level=1] [ref=e6]
      - paragraph [ref=e7]: 관리자 계정으로 로그인하세요
    - generic [ref=e8]:
      - generic [ref=e9]:
        - img [ref=e11]
        - generic [ref=e13]: 이메일
        - img [ref=e14]
      - generic [ref=e16]:
        - img [ref=e18]
        - generic [ref=e20]: OTP 인증
        - img [ref=e21]
      - generic [ref=e23]:
        - img [ref=e25]
        - generic [ref=e27]: SMS 인증
    - generic [ref=e28]:
      - generic [ref=e29]:
        - img [ref=e31]
        - heading "이메일 확인" [level=2] [ref=e33]
        - paragraph [ref=e34]: 등록된 이메일 주소를 입력하세요
      - generic [ref=e35]:
        - generic [ref=e36]:
          - generic [ref=e37]: 이메일 주소
          - textbox "your-email@company.com" [ref=e38]: ceo@company.com
        - button "다음 단계" [ref=e39] [cursor=pointer]
        - generic [ref=e41]:
          - paragraph [ref=e42]: "남은 시도:"
          - paragraph [ref=e49]: (5회)
    - paragraph [ref=e51]:
      - text: 로그인에 문제가 있으신가요?
      - button "관리자에게 문의" [ref=e52] [cursor=pointer]
  - alert [ref=e53]
```