from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from .models import Event, EventParticipant
import redis
import json
from django.conf import settings
from django.core.serializers import serialize
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import get_user_model
from datetime import time

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
            EventParticipant.objects.get_or_create(
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
                EventParticipant.objects.get_or_create(
                    event=event,
                    user=user,
                    defaults={'role': 'participant', 'status': 'pending'}
                )
            except User.DoesNotExist:
                print(f"[!] 유저를 찾을 수 없음: {email}")
        
        return JsonResponse({
            'status': 'success',
            'title' : data.get('title'),
            'start_data' : data.get('sdate'),
            'end_data' : data.get('edate'),
            'start_tiem' : parse_time(data.get('stime')),
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
    participant = get_object_or_404(EventParticipant, event=event, user=request.user, status='pending')
    participant.status = 'accepted'
    participant.save()
    return redirect('events:event_list')

@login_required
def decline_invite(request, event_id):
    event = get_object_or_404(Event, id=event_id)
    participant = get_object_or_404(EventParticipant, event=event, user=request.user, status='pending')
    participant.status = 'declined'
    participant.save()
    return redirect('events:event_list') 

@login_required
def event_list(request):
    events = Event.objects.filter(participants__user=request.user, participants__status='accepted')
    invites = Event.objects.filter(participants__user=request.user, participants__status='pending')
    
    # 이벤트 목록을 수동으로 JSON으로 변환
    events_json = []
    for event in events:
        participants_data = []
        for participant in event.participants.all():
            participants_data.append({
                'user_email': participant.user.email,  # 참가자 이메일
                'role': participant.role,  # 참가자 역할
                'status': participant.status,  # 참가자 상태
            })
        
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
            'participants': participants_data,  # 참가자 정보 추가
        }
        events_json.append(event_data)
    
    # 초대도 수동으로 JSON 형식으로 변환 (필요시 추가 필드 처리 가능)
    invites_json = []
    for invite in invites:
        participants_data = []
        for participant in invite.participants.all():
            participants_data.append({
                'user_email': participant.user.email,  # 참가자 이메일
                'role': participant.role,  # 참가자 역할
                'status': participant.status,  # 참가자 상태
            })
        
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
            'participants': participants_data,  # 참가자 정보 추가
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

    return render(request, 'events/event_list.html', {
        'events': events, 
        'invites': invites, 
        'events_json': events_json, 
        'invites_json': invites_json,
        'holidays_json': json.dumps(holidays_json, ensure_ascii=False),
    })
