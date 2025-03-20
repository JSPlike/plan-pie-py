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
from django.contrib.auth.models import User
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
        user = kwargs.pop('user', None)  # 로그인한 사용자
        super().__init__(*args, **kwargs)

        if user:
            # 로그인한 사용자를 제외한 모든 사용자 목록을 공유 대상을 선택할 수 있도록 설정
            self.fields['shared_with'].queryset = User.objects.exclude(id=user.id)
