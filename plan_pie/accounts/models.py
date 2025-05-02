from django.contrib.auth.models import AbstractUser
from django.contrib.auth.base_user import BaseUserManager
from django.db import models

# Create your models here.

# 
class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("이메일은 필수입니다.")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if not password:
            raise ValueError("관리자는 비밀번호가 필요합니다.")
        if extra_fields.get("is_staff") is not True:
            raise ValueError("관리자는 is_staff=True 여야 합니다.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("관리자는 is_superuser=True 여야 합니다.")

        return self.create_user(email, password, **extra_fields)



#  ✅기본 유저 생성모델
class CustomUser(AbstractUser):
    username = None  # 기본 username 필드를 제거
    email = models.EmailField(unique=True)
    
    nickname = models.CharField(max_length=100, blank=True, null=True)
    birthdate = models.DateField(blank=True, null=True)
    profileimage = models.ImageField(upload_to='editImage/', blank=True, null=True, default='editImage/user.png')
    
    USERNAME_FIELD = 'email'  # 로그인 필드를 이메일로 설정
    REQUIRED_FIELDS = []  # 필수 필드에서 username을 제외
    

    # CustomUser 모델이 어떤 방식으로 사용자(User)를 생성할지 정의하는 "매니저"를 지정하는 것
    objects = CustomUserManager() 

    def __str__(self):
        return self.email