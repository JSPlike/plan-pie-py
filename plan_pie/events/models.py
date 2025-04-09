from django.db import models
from django.conf import settings
from django.utils import timezone

class Event(models.Model):
    title = models.CharField(max_length=200)
    start_date = models.DateField(default=timezone.now)
    start_time = models.TimeField(null=True, blank=True)
    end_date = models.DateField(default=timezone.now)
    end_time = models.TimeField(null=True, blank=True)
    is_all_day = models.BooleanField(default=True)
    color = models.CharField(max_length=20, default='#0000FF')
    memo = models.TextField(null=True, blank=True)  # 📝 메모 필드 추가!
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.title
    
class EventParticipant(models.Model):
    ROLE_CHOICES = [
        ('owner', 'Owner'),
        ('participant', 'Participant'),
        ('invited', 'Invited'),
    ]

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('declined', 'Declined'),
    ]

    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='participants')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='participant')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    def __str__(self):
        return f"{self.user.email} - {self.event.title} ({self.role}, {self.status})"
