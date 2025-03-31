/*
$(document).ready(function() {
    // 달력 DOM 요소 선택
    var calendarEl = $('#calendar')[0];  // 제이쿼리로 선택 후 DOM 요소로 변환
    //var events = JSON.parse('{{ events_json | escapejs }}');  // 서버에서 전달받은 JSON을 파싱
    var events = JSON.parse(document.getElementById('events_json').textContent);
    console.log(events);
    // FullCalendar 초기화
    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',  // 초기 보기 설정: 월 단위
        events: function(info, successCallback, failureCallback) {
            // 서버에서 전달받은 이벤트 데이터를 기반으로 FullCalendar의 이벤트 목록을 설정
            var eventData = events.map(function(event) {
                return {
                    title: event.fields.title,  // 이벤트 제목
                    start: new Date(event.fields.start_time),  // 시작 시간 (Date 객체로 변환)
                    end: new Date(event.fields.end_time),      // 종료 시간 (Date 객체로 변환)
                    url: "/events/" + event.pk + "/accept/",  // URL (예시)
                };
            });
            
            // 성공 콜백으로 이벤트 데이터를 전달
            successCallback(eventData);
        },
        eventClick: function(info) {
            // 일정 클릭 시의 동작
            alert('이벤트: ' + info.event.title + '\n' + '시작 시간: ' + info.event.start.toISOString());
        }
    });

    // 달력 렌더링
    calendar.render();
});
*/
document.addEventListener("DOMContentLoaded", function () {
    const calendarEl = document.getElementById("calendar");
    const today = new Date();
    
    function renderCalendar(year, month) {
        calendarEl.innerHTML = ""; // 기존 내용 지우기
        
        const firstDay = new Date(year, month, 1).getDay(); // 월의 첫째 날 요일
        const daysInMonth = new Date(year, month + 1, 0).getDate(); // 월의 총 일수

        let calendarHTML = `<div class="calendar-header">
                                <button id="prev">&lt;</button>
                                <span>${year}년 ${month + 1}월</span>
                                <button id="next">&gt;</button>
                            </div>
                            <div class="calendar-grid">`;

        // 요일 헤더 추가
        const weekDays = ["일", "월", "화", "수", "목", "금", "토"];
        weekDays.forEach(day => calendarHTML += `<div class="day-header">${day}</div>`);

        // 첫 주 빈 칸 추가
        for (let i = 0; i < firstDay; i++) {
            calendarHTML += `<div class="empty"></div>`;
        }

        // 날짜 채우기
        for (let day = 1; day <= daysInMonth; day++) {
            calendarHTML += `<div class="day">${day}</div>`;
        }

        calendarHTML += `</div>`;
        calendarEl.innerHTML = calendarHTML;

        // 버튼 이벤트 추가
        document.getElementById("prev").addEventListener("click", () => renderCalendar(year, month - 1));
        document.getElementById("next").addEventListener("click", () => renderCalendar(year, month + 1));
    }

    renderCalendar(today.getFullYear(), today.getMonth());
});
