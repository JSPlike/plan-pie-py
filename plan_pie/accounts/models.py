from django.contrib.auth.models import AbstractUser
from django.db import models

# Create your models here.

class CustomUser(AbstractUser):
    username = None  # 기본 username 필드를 제거
    email = models.EmailField(unique=True)
    
    USERNAME_FIELD = 'email'  # 로그인 필드를 이메일로 설정
    REQUIRED_FIELDS = []  # 필수 필드에서 username을 제외

    def __str__(self):
        return self.email