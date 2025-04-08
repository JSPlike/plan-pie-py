document.addEventListener("DOMContentLoaded", function () {
    const calendarEl = document.getElementById("calendar");
    const calendarHd = document.getElementById("calendarHd");
    const today = new Date();
    
    function renderCalendar(year, month) {
        calendarEl.innerHTML = ""; // 기존 내용 지우기
        calendarHd.innerHTML = "";

        const firstDay = new Date(year, month, 1).getDay(); // 월의 첫째 날 요일
        const daysInMonth = new Date(year, month + 1, 0).getDate(); // 월의 총 일수

        let calendarHdHTML = `<div class="calendar-header">
                                <button id="prev">&lt;</button>
                                <span>${year}년 ${month + 1}월</span>
                                <button id="next">&gt;</button>
                            </div>`
        let calendarHTML =  `<div class="calendar-grid">`;

        // 요일 헤더 추가
        const weekDays = ["일", "월", "화", "수", "목", "금", "토"];
        weekDays.forEach(day => calendarHTML += `<div class="day-header">${day}</div>`);

        // 첫 주 빈 칸 추가
        for (let i = 0; i < firstDay; i++) {
            calendarHTML += `<div class="empty"></div>`;
        }

        // 날짜 채우기
        for (let day = 1; day <= daysInMonth; day++) {
            calendarHTML += `<div class="day" data-year="${year}" data-month="${month}" data-day="${day}"><span>${day}</span></div>`;
        }

        calendarHTML += `</div>`;
        calendarEl.innerHTML = calendarHTML;
        calendarHd.innerHTML = calendarHdHTML;

        // 버튼 이벤트 추가
        document.getElementById("prev").addEventListener("click", () => renderCalendar(year, month - 1));
        document.getElementById("next").addEventListener("click", () => renderCalendar(year, month + 1));
    }

    renderCalendar(today.getFullYear(), today.getMonth());

    /**
     * 일정 생성 섹션을 닫는다
     */
    $('#close-section-btn').on('click', function () {
        $('.right-section').addClass('slide-out-right');
        $('.left-section').addClass('expand-main');
    });

    /**
     * 일정 생성 섹션을 호출한다
     */
    $('#toggleEvent').on('click', function() {
        $('.right-section').removeClass('slide-out-right');
        $('.left-section').removeClass('expand-main');
    });

    /**
     * 캘린더에서 특정 날짜를 클릭했을때 이벤트를 발생시킨다
     */
    $('.day').on('click', function() {

        // 클릭한 개체를 탐지한다.
        const year = $(this).data('year');
        const month = $(this).data('month');
        const day = $(this).data('day');

        const clickedDate = new Date(year, month, day);
    
        // 하루 더하기
        const nextDate = new Date(clickedDate);
        nextDate.setDate(clickedDate.getDate() + 1);

        const format = (date) => 
            `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

        // 개체의 요소값을 추출한다.
        console.log("클릭한 날짜:", format(clickedDate));
        
        console.log("클릭한 날짜 + 1:", format(nextDate));
    });


    flatpickr("#start-date", {
        dateFormat: "Y-m-d",
        defaultDate: new Date(),
        allowInput: false,
        onChange: function (selectedDates, dateStr, instance) {
            console.log("선택된 날짜:", dateStr);
        }
    });

    flatpickr("#end-date", {
        dateFormat: "Y-m-d",
        defaultDate: new Date(),
        allowInput: false,
        onChange: function (selectedDates, dateStr, instance) {
            console.log("선택된 날짜:", dateStr);
        }
    });

    // 종일 체크박스 toggle
    $('#all-day').on('change', function () {
        if ($(this).is(':checked')) {
            $('.time-input').addClass('hidden');
        } else {
            $('.time-input').removeClass('hidden');
        }
    });
});
