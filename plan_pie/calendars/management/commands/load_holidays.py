from django.core.management.base import BaseCommand
import redis
import requests
import json
import xml.etree.ElementTree as ET
from django.conf import settings

class Command(BaseCommand):
    help = '공공데이터에서 휴일 정보를 가져와 Redis에 저장합니다.'

    def handle(self, *args, **kwargs):
        try:
            print("⚙️ settings:", settings)
            # settins 파일에 정의된 api key
            key = settings.HOLIDAY_API_KEY;
            # redis 접속정보
            r = redis.StrictRedis(host='127.0.0.1', port=6379, db=0, decode_responses=True)

            for year in range(2025, 2041):  # 2040년까지 포함
                for month in range(1, 13):
                    api_url = self.build_api_url(key, year, month)
                    response = requests.get(api_url)

                    # 정상적으로 응답을 받았다면 실행한다
                    if response.status_code == 200:
                        holidays = self.parse_response(response.text)
                        
                        if not holidays:
                            self.stdout.write(f"⛔ {year}-{str(month).zfill(2)} 휴일 정보 없음. 루프 중단.")
                            continue  # 이 달부터는 더 이상 데이터 없다고 판단
                        
                        for holiday in holidays:
                            date_key = holiday['locdate']
                            r.set(f'holiday:{date_key}', holiday['dateName'])
                            self.stdout.write(f"Saved: {date_key} - {holiday['dateName']}")
                            self.stdout.write(self.style.SUCCESS('✅ 휴일 정보를 Redis에 저장했습니다.'))
                    else:
                        self.stderr.write(f"Failed: {year}-{month} (Status {response.status_code})")
                        self.stderr.write(f"⚠️ API 호출 실패: {response.status_code}")
        except Exception as e:
            self.stderr.write(f"❌ Redis 저장 실패: {e}")

    # 공공데이터 포털에 요청을 보내기위해 엔드포인트를 만들어준다.
    def build_api_url(self, key, year, month):
        base_url = 'http://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getHoliDeInfo'
        return (
            f'{base_url}?serviceKey={key}'
            f'&solYear={year}&solMonth={str(month).zfill(2)}&_type=xml'
        )

    # 불러온 xml형식의 휴일데이터를 키별로 잘라서 저장한다.      
    def parse_response(self, xml_data):
        root = ET.fromstring(xml_data)
        items = root.find('.//items')
        holidays = []

        if items is not None:
            for item in items.findall('item'):
                locdate = item.findtext('locdate')  # 예: '20250101'
                dateName = item.findtext('dateName')  # 예: '신정'
                holidays.append({'locdate': locdate, 'dateName': dateName})
        return holidays    