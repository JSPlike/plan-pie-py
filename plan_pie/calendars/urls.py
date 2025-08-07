from django.urls import path
from .views import monthly, daily, calendar_new, calendar_create, create_event, accept_invite, decline_invite, toggle_event_completion, update_event_time, quick_add_event

app_name = 'calendar'  # 'event' 네임스페이스 설정

urlpatterns = [
    path('', monthly, name="monthly"),
    #path('monthly/', monthly, name="monthly"),
    path('daily/', daily, name="daily"),
    path('new/', calendar_new, name="calendar_new"),
    
    path('create/', calendar_create, name='calendar_create'),

    path('event/new/', create_event, name="create_event"),
    
    path('<int:event_id>/accept/', accept_invite, name="accept_invite"),
    path('<int:event_id>/decline/', decline_invite, name="decline_invite"),
    
    
    
    # daily
    path('event/<int:event_id>/toggle-completion/', toggle_event_completion, name='toggle_completion'),
    path('event/<int:event_id>/update-time/', update_event_time, name='update_time'),
    path('quick-add/', quick_add_event, name='quick_add'),
]