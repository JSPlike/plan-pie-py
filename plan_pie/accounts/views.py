from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login as auth_login
from django.http import JsonResponse
from .models import CustomUser
from .forms import SignUpForm
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth.decorators import login_required

# '/' url 진입시 세션체크후 화면 분기
def home_view(request):
    if request.session.get('sessionid'):
        return redirect('/calendar/monthly')  # 세션이 있으면 이벤트로
    return redirect('/accounts/login/')  # 세션 없으면 로그인으로

# 회원가입 뷰
def signup(request):
    if request.method == "POST":
        if 'email' in request.POST and 'password' in request.POST:
            # HTML 폼 데이터 직접 처리
            email = request.POST.get('email')
            password = request.POST.get('password1')
            password2 = request.POST.get('password2')
            terms = request.POST.get('terms')
            
            # 유효성 검사
            errors = {}
            
            if not email:
                errors['email'] = ['이메일을 입력해주세요.']
                
            elif CustomUser.objects.filter(email=email).exists():
                errors['email'] = ['이미 존재하는 이메일입니다.']
            
            if not password:
                errors['password'] = ['비밀번호를 입력해주세요.']
            elif len(password) < 8:
                errors['password'] = ['비밀번호는 8자 이상이어야 합니다.']
            
            if password != password2:
                errors['password2'] = ['비밀번호가 일치하지 않습니다.']
            
            if not terms:
                errors['terms'] = ['이용약관에 동의해주세요.']
            
            if errors:
                return JsonResponse({
                    "success": False,
                    "message": "회원가입 실패. 입력값을 확인해주세요.",
                    "errors": errors
                })
            
            try:
                # CustomUser 생성
                user = CustomUser.objects.create_user(
                    email=email,
                    password=password
                )
                
                return JsonResponse({
                    "success": True,
                    "message": "회원가입 성공!",
                    "redirect_url": "/accounts/login"
                })
                
            except Exception as e:
                return JsonResponse({
                    "success": False,
                    "message": f"회원가입 중 오류가 발생했습니다: {str(e)}"
                })
        else:
            # Django 폼으로 처리 (기존 코드)
            form = SignUpForm(request.POST)
            if form.is_valid():
                user = form.save()
                return JsonResponse({
                    "success": True,
                    "message": "회원가입 성공!",
                    "redirect_url": "/accounts/login"
                })
            else:
                return JsonResponse({
                    "success": False,
                    "message": "회원가입 실패. 입력값을 확인해주세요.",
                    "errors": form.errors
                })
    else:
        form = SignUpForm()
    return render(request, 'accounts/signup.html', {'form': form})

# 로그인 뷰
def login(request):
    if request.method == "POST":
        form = AuthenticationForm(request, data=request.POST)
        if form.is_valid():
            user = form.get_user()
            auth_login(request, user)
            return JsonResponse({
                "success": True,
                "message": "로그인 성공",
                "redirect_url": "/calendar/monthly"
            })
        else:
            return JsonResponse({
                "success": False,
                "message": "로그인 실패",
                "errors": form.errors
            })
    else:
        form = AuthenticationForm()
    return render(request, 'accounts/login.html', {'form': form})

# 유저 프로필 수정
@login_required
def update_profile(request):
    if request.method == 'POST':
        
        print(request);
        nickname = request.POST.get('nickname')
        birth_date = request.POST.get('birthDate')
        profile_image = request.FILES.get('profilePhoto')  # 프로필 사진 파일

        
        # 확인용 출력 (디버깅)
        print(f"Nickname: {nickname}")
        print(f"Birth Date: {birth_date}")
        print(f"Profile Image: {profile_image}")
        
        # 유저의 프로필을 업데이트하는 로직
        user = request.user
        user.nickname = nickname
        user.birth_date = birth_date
        
        if profile_image:
            user.profileimage = profile_image  # 사진 업데이트
        
        user.save()

        return JsonResponse({'message': 'Profile updated successfully.'})
    
    return JsonResponse({'message': 'Invalid request.'}, status=400)