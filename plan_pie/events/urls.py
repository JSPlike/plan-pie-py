from django.urls import path
from .views import event_list, create_event, accept_invite, decline_invite

app_name = 'event'  # 'event' 네임스페이스 설정

urlpatterns = [
    path('', event_list, name="event_list"),
    path('new/', create_event, name="create_event"),
    path('<int:event_id>/accept/', accept_invite, name="accept_invite"),
    path('<int:event_id>/decline/', decline_invite, name="decline_invite"),
]
