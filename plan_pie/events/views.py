from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from .models import Event, EventParticipant
from .forms import EventForm
import redis
import json
from django.conf import settings
from django.core.serializers import serialize

@login_required
def create_event(request):
    if request.method == "POST":
        form = EventForm(request.POST)
        if form.is_valid():
            event = form.save()
            # Owner 추가
            EventParticipant.objects.create(
                event=event, user=request.user, role='owner', status='accepted'
            )
            return redirect('event:event_list')
    else:
        form = EventForm(user=request.user)
    return render(request, 'events/event_form.html', {'form': form})

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
    events = Event.objects.filter(eventparticipant__user=request.user, eventparticipant__status='accepted')
    invites = Event.objects.filter(eventparticipant__user=request.user, eventparticipant__status='pending')
    
     # 이벤트 목록을 수동으로 JSON으로 변환
    events_json = []
    for event in events:
        event_data = {
            'pk': event.pk,
            'title': event.title,
            'start_time': event.start_time.strftime('%Y-%m-%d %H:%M:%S'),  # 날짜 형식 지정
            'end_time': event.end_time.strftime('%Y-%m-%d %H:%M:%S'),  # 날짜 형식 지정
        }
        events_json.append(event_data)
    
    # 초대도 수동으로 JSON 형식으로 변환 (필요시 추가 필드 처리 가능)
    invites_json = []
    for invite in invites:
        invite_data = {
            'pk': invite.pk,
            'title': invite.title,
            'start_time': invite.start_time.strftime('%Y-%m-%d %H:%M:%S'),
            'end_time': invite.end_time.strftime('%Y-%m-%d %H:%M:%S'),
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
