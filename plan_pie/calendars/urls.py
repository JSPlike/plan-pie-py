from django.urls import path
from .views import monthly, calendar_new, calendar_create, create_event, accept_invite, decline_invite

app_name = 'calendar'  # 'event' 네임스페이스 설정

urlpatterns = [
    path('', monthly, name="monthly"),
    path('new/', calendar_new, name="calendar_new"),
    path('create/', calendar_create, name='calendar_create'),

    path('new/', create_event, name="create_event"),
    
    path('<int:event_id>/accept/', accept_invite, name="accept_invite"),
    path('<int:event_id>/decline/', decline_invite, name="decline_invite"),
]
