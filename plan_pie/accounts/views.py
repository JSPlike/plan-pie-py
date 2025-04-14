from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login as auth_login
from django.http import JsonResponse
from .forms import SignUpForm
from django.contrib.auth.forms import AuthenticationForm

# '/' url 진입시 세션체크후 화면 분기
def home_view(request):
    if request.session.get('sessionid'):
        return redirect('/event/')  # 세션이 있으면 이벤트로
    return redirect('/accounts/login/')  # 세션 없으면 로그인으로

# 회원가입 뷰
def signup(request):
    if request.method == "POST":
        form = SignUpForm(request.POST)
        if form.is_valid():
            user = form.save()
            auth_login(request, user)
            return JsonResponse({
                "success": True,
                "message": "회원가입 성공!",
                "redirect_url": "/event/"  # 회원가입 성공 후 리다이렉트할 URL
            })
        else:
            # 폼이 유효하지 않을 경우, 오류 메시지를 JSON으로 반환
            return JsonResponse({
                "success": False,
                "message": "회원가입 실패. 입력값을 확인해주세요.",
                "errors": form.errors  # 폼 오류 반환 (클라이언트에서 오류 메시지 처리 가능)
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
                "redirect_url": "/event/"
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