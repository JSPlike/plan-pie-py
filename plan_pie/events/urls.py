from django.urls import path
from .views import monthly, event_new, create_event, accept_invite, decline_invite

app_name = 'event'  # 'event' 네임스페이스 설정

urlpatterns = [
    path('', monthly, name="monthly"),
    path('new/', event_new, name="event_new"),
    path('new/', create_event, name="create_event"),
    path('<int:event_id>/accept/', accept_invite, name="accept_invite"),
    path('<int:event_id>/decline/', decline_invite, name="decline_invite"),
]
