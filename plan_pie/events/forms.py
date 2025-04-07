''' 기존 소스
from django import forms
from .models import Event

class EventForm(forms.ModelForm):
    shared_with = forms.ModelMultipleChoiceField(
        queryset=None,  # 로그인한 유저 목록 불러오기
        widget=forms.CheckboxSelectMultiple,
        required=False
    )

    class Meta:
        model = Event
        fields = ['title', 'description', 'start_time', 'end_time', 'shared_with']

    def __init__(self, *args, **kwargs):
        user = kwargs.pop('user', None)
        super().__init__(*args, **kwargs)
        if user:
            self.fields['shared_with'].queryset = user.__class__.objects.exclude(id=user.id)  # 본인 제외
'''
from django import forms
#from django.contrib.auth.models import User
from django.contrib.auth import get_user_model  # ✅ 이걸 사용해야 함
from .models import Event

User = get_user_model()

class EventForm(forms.ModelForm):
    shared_with = forms.ModelMultipleChoiceField(
        queryset=None,
        widget=forms.CheckboxSelectMultiple,
        required=False
    )

    class Meta:
        model = Event
        fields = ['title', 'description', 'start_time', 'end_time', 'shared_with']

    def __init__(self, *args, **kwargs):
        user = kwargs.pop('user', None)
        super().__init__(*args, **kwargs)

        if user:
            self.fields['shared_with'].queryset = User.objects.exclude(id=user.id)
        else:
            self.fields['shared_with'].queryset = User.objects.none()
