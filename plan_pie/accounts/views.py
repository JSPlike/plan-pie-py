from django.shortcuts import render, redirect
from django.contrib.auth import login
from django.http import JsonResponse
from .forms import SignUpForm

def signup(request):
    if request.method == "POST":
        form = SignUpForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return JsonResponse({
                "success": True,
                "message": "회원가입 성공!",
                "redirect_url": "/events/"  # 회원가입 성공 후 리다이렉트할 URL
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
