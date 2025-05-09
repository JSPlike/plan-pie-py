from django import forms
from .models import Calendar

class CalendarForm(forms.ModelForm):
    class Meta:
        model = Calendar
        fields = ['calendar_name', 'theme', 'calendar_image']  # image 포함!
