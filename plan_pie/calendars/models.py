from django.db import models
from django.conf import settings
from django.utils import timezone
from accounts.models import CustomUser

class Calendar(models.Model):
    calendar_name = models.CharField(max_length=100)
    theme = models.CharField(max_length=50, default='personal')
    owner = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='owned_calendars')
    calendar_image = models.ImageField(upload_to='calendarimage/', blank=True, null=True)  # 이미지 필드 추가
    # 초대된 사용자들을 관리하기 위한 ManyToMany 관계
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.calendar_name} (Owner: {self.owner.username})"

class CalendarParticipant(models.Model):
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

    calendar = models.ForeignKey(Calendar, on_delete=models.CASCADE, related_name='participants')
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='participant')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    def __str__(self):
        return f"{self.user.email} - {self.calendar.title} ({self.role}, {self.status})"
        
class Event(models.Model):
    calendar = models.ForeignKey(Calendar, on_delete=models.CASCADE, related_name='events', null=True, blank=True)
    title = models.CharField(max_length=200)
    start_date = models.DateField(default=timezone.now)
    start_time = models.TimeField(null=True, blank=True)
    end_date = models.DateField(default=timezone.now)
    end_time = models.TimeField(null=True, blank=True)
    is_all_day = models.BooleanField(default=True)
    color = models.CharField(max_length=20, default='#0000FF')
    memo = models.TextField(null=True, blank=True)  # 📝 메모 필드 추가!
    is_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.title
    

