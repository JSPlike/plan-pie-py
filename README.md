# plan-pie-py
plan pie app with django

## 관리자페이지

## 달력페이지

#### 설명
캘린더(Calendar)
→ owner 필드: 캘린더를 소유한 사용자
→ participants: CalendarParticipant 모델을 통해 참여자 관리


이벤트(Event)
→ 특정 캘린더에 소속됨
→ 참여자 정보는 없음 (정확히 Event 자체에는 participants 필드가 없음)

캘린더 참여자(CalendarParticipant)
→ 특정 유저가 어떤 Calendar에 대해 어떤 role, status를 가지는지를 관리
→ 즉, 참여자 정보는 캘린더 단위에 있음!


#### 사용자 플로우
1. 로그인
2-1. 해당 유저에 저장된 달력이 있으면 달력화면(/calendar)

2-2. 해당유저에 저장된 달력이 없으면 달력생성화면(/caledar/new)
2-2

#### 해야하는일  

1. 공휴일데이터
-- 공공데이터포털 한국천문연구원_특일 정보

데이터를 읽어와 날짜와 날짜명 추출후 화면에 렌더링

2. 주말데이터
-- DayOfWeek 0(일요일), 6(토요일) 각각 색상처리

## 일정리스트

## 고객페이지

## 배포요약

✍️ 기본 흐름 요약 (EC2 예시 기준)
1. EC2 인스턴스 생성 (Ubuntu 추천)

2. 보안그룹에서 포트 열기 (22, 8000, 80, 443)

3. SSH로 접속

4. Python, pip, venv 설치

5. Django 프로젝트 업로드

6. python manage.py runserver 0.0.0.0:8000 로 테스트

7. Gunicorn + Nginx 세팅 (운영처럼 돌리고 싶을 때)

8. 필요 시 도메인 연결 + HTTPS