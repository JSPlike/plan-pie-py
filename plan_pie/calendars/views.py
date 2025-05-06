from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from .models import Calendar, Event, CalendarParticipant
from django.db.models import Q
import redis
import json
from django.conf import settings
from django.core.serializers import serialize
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import get_user_model
from datetime import time
from django.shortcuts import render

@csrf_exempt 
def create_event(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        print(data)  # 디버깅용
        
        # 📌 기본 이벤트 생성
        event = Event.objects.create(
            title=data.get('title'),
            start_date=data.get('sdate'),
            start_time=parse_time(data.get('stime')),
            end_date=data.get('edate'),
            end_time=parse_time(data.get('etime')),
            is_all_day=data.get('isAllday', False),
            color=data.get('color'),
            memo=data.get('memo')
        )

        print(event);

        # 현재 로그인한 유저가 있다면 작성자로 등록 (필요한 경우)
        if request.user.is_authenticated:
            CalendarParticipant.objects.get_or_create(
                event=event,
                user=request.user,
                defaults={'role': 'owner', 'status': 'accepted'}
            )
 
        # 📌 참여자 저장
        participants = data.get('participants', [])
        User = get_user_model()

        for email in participants:
            if not isinstance(email, str):  # 예외처리
                continue
            try:
                user = User.objects.get(email=email)
                CalendarParticipant.objects.get_or_create(
                    event=event,
                    user=user,
                    defaults={'role': 'participant', 'status': 'pending'}
                )
            except User.DoesNotExist:
                print(f"[!] 유저를 찾을 수 없음: {email}")
        
        return JsonResponse({
            'status': 'success',
            'title' : data.get('title'),
            'start_date' : data.get('sdate'),
            'end_date' : data.get('edate'),
            'start_time' : parse_time(data.get('stime')),
            'end_time' : parse_time(data.get('etime')),
            'color' : data.get('color'),
            'memo' : data.get('memo')
        })

    return JsonResponse({'error': 'Invalid request'}, status=400)

# time 데이터를 파싱한다.
def parse_time(value):
    if value:
        try:
            return time.fromisoformat(value)
        except ValueError:
            pass
    return None

@login_required
def accept_invite(request, event_id):
    event = get_object_or_404(Event, id=event_id)
    participant = get_object_or_404(CalendarParticipant, event=event, user=request.user, status='pending')
    participant.status = 'accepted'
    participant.save()
    return redirect('events:event_monthly')

@login_required
def decline_invite(request, event_id):
    event = get_object_or_404(Event, id=event_id)
    participant = get_object_or_404(CalendarParticipant, event=event, user=request.user, status='pending')
    participant.status = 'declined'
    participant.save()
    return redirect('events:event_monthly') 

@login_required
def monthly(request):
    
     # 현재 로그인한 유저
    user = request.user
    print("===========================================")
    print(user.profileimage)
    print("========================================")
    print(user);

    # 로그인한 유저가 소유한 캘린더와 참여한 캘린더를 가져옵니다.
    calendars = Calendar.objects.filter(
                    Q(owner=user) | Q(participants__user=user, participants__status='accepted')
                ).distinct()

    # 수락하지 않은 상태(pending)의 캘린더
    pending_calendars = Calendar.objects.filter(
        participants__user=user, participants__status='pending'
    ).distinct()

    events = Event.objects.filter(calendar__in=calendars)
    invites = Event.objects.filter(calendar__in=pending_calendars)
    
    participants_json = {}

    for calendar in calendars:
        participants_json[calendar.id] = [
            {
                'user_email': p.user.email,
                'role': p.role,
                'status': p.status,
            }
            for p in calendar.participants.all()
        ]

    # 이벤트 목록을 수동으로 JSON으로 변환
    events_json = []
    for event in events:
        event_data = {
            'pk': event.pk,
            'title': event.title,
            'start_date': event.start_date.strftime('%Y-%m-%d'),  # 날짜 형식 지정
            'start_time': event.start_time.strftime('%H:%M:%S') if event.start_time else None,  # 시간 형식 지정
            'end_date': event.end_date.strftime('%Y-%m-%d'),  # 날짜 형식 지정
            'end_time': event.end_time.strftime('%H:%M:%S') if event.end_time else None,  # 시간 형식 지정
            'is_all_day': event.is_all_day,  # 종일 여부 추가
            'color': event.color,  # 색 추가
            'memo': event.memo,  # 메모 추가
        }
        events_json.append(event_data)
    
    # 초대도 수동으로 JSON 형식으로 변환 (필요시 추가 필드 처리 가능)
    invites_json = []
    for invite in invites:
        invite_data = {
            'pk': invite.pk,
            'title': invite.title,
            'start_date': invite.start_date.strftime('%Y-%m-%d'),
            'start_time': invite.start_time.strftime('%H:%M:%S') if invite.start_time else None,
            'end_date': invite.end_date.strftime('%Y-%m-%d'),
            'end_time': invite.end_time.strftime('%H:%M:%S') if invite.end_time else None,
            'is_all_day': invite.is_all_day,  # 종일 여부 추가
            'color': invite.color,  # 색 추가
            'memo': invite.memo,  # 메모 추가
        }
        invites_json.append(invite_data)
    
    
    # 🔥 Redis에서 휴일 가져오기
    r = redis.StrictRedis(host='127.0.0.1', port=6379, db=0, decode_responses=True)
    holiday_keys = r.keys('holiday:*') # redis key

    holidays_json = []
    for key in holiday_keys:
        date_str = key.split(':')[1]
        title = r.get(key)
        holidays_json.append({
            'title': title,
            'start_time': f"{date_str[:4]}-{date_str[4:6]}-{date_str[6:]}" + " 00:00:00",
            'end_time': f"{date_str[:4]}-{date_str[4:6]}-{date_str[6:]}" + " 23:59:59",
            'allDay': True,
            'type': 'holiday',
        })    

    return render(request, 'calendars/monthly.html', {
        'events': events, 
        'invites': invites, 
        'events_json': json.dumps(events_json, indent=4, ensure_ascii=False),
        'invites_json': invites_json,
        'holidays_json': json.dumps(holidays_json, ensure_ascii=False),
        'calendars': calendars, # 현재유저가 참여중인 달력 목록
        'participants_json': json.dumps(participants_json, ensure_ascii=False),
    })
    
# 새로운 캘린더를 생성할 프로세스를 실행한다.    
@login_required
def calendar_new(request):
    # 캘린더 생성화면으로 이동한다.
    print(request);

    return '';

# 데이터베이스에 새로운 캘린더를 저장한다.
@login_required
def calendar_create(request):
    
    return '';