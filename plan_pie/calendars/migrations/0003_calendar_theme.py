# Generated by Django 5.1.7 on 2025-05-09 05:49

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('calendars', '0002_calendar_calendar_image'),
    ]

    operations = [
        migrations.AddField(
            model_name='calendar',
            name='theme',
            field=models.CharField(default='personal', max_length=50),
        ),
    ]
