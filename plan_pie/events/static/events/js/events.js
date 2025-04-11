document.addEventListener("DOMContentLoaded", function () {
    lucide.createIcons();  // 아이콘 렌더링
    //offEventForm();
    const calendarEl = document.getElementById("calendar");
    const calendarYm = document.querySelector(".calendar-ym");
    const today = new Date();
    const countryCode = 'KR';
    let showHolidays = true;
    let holidayDates = {}; // 공휴일 날짜 저장용
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    console.log("저장되어진 이벤트");
    console.log(JSON.parse($('#events_json').text));

    const holidaysJson = JSON.parse(document.getElementById('holidays-data').textContent); 
    holidaysJson.forEach(event => {
        const dateStr = event.start_time.split(' ')[0]; // 'YYYY-MM-DD'
        
        // holidayDates[dateStr]이 없으면 배열 생성
        if (!holidayDates[dateStr]) {
            holidayDates[dateStr] = [];
        }
    
        // 해당 날짜에 공휴일 이름 추가
        holidayDates[dateStr].push(event.title);
    });

    function renderCalendar(year, month) {
        initWindow();

        calendarEl.innerHTML = ""; // 기존 내용 지우기
        calendarYm.innerHTML = "";

        const firstDay = new Date(year, month, 1).getDay(); // 월의 첫째 날 요일
        const daysInMonth = new Date(year, month + 1, 0).getDate(); // 월의 총 일수

        let calendarYmHTML = `<span>${year}년 ${month + 1}월</span>`
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
            const fullDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

            let dayClass = 'day';
            let holidayHTML = '';

            const date = new Date(year, month, day);
            const dayOfWeek = date.getDay();

            // 달력의 날짜가 오늘날짜라면 표시해준다
            if(fullDateStr == todayStr) {   
                dayClass += ' today'
            }

            // 일요일과 토요일 날짜색상을 적용해준다
            if (dayOfWeek === 0) {
                dayClass += ' sunday'
            } else if (dayOfWeek === 6) {
                dayClass += ' saturday'
            }

            // 공휴일 체크박스에 체크되어있는경우 실행한다.
            if (showHolidays && holidayDates[fullDateStr]) {
                dayClass += ' holiday';
                holidayHTML = holidayDates[fullDateStr].map(name => 
                    `<div class="holiday-label">${name}</div>`
                ).join('');
            }

            calendarHTML += `<div class="${dayClass}" data-year="${year}" data-month="${month}" data-day="${day}">
                                <div class="day-number-container"><div class="day-number">${day}</div></div>
                                <div class="holiday-container">${holidayHTML}</div>
                                <div class="day-events"></div>
                            </div>`;
        }

        calendarHTML += `</div>`;
        calendarEl.innerHTML = calendarHTML;
        calendarYm.innerHTML = calendarYmHTML;

        // 버튼 이벤트 추가
        document.getElementById("prev").addEventListener("click", () => renderCalendar(year, month - 1));
        document.getElementById("next").addEventListener("click", () => renderCalendar(year, month + 1));
    }

    renderCalendar(today.getFullYear(), today.getMonth());

    function initWindow() {
        $('.time-input').css('visibility', 'hidden');
    }

    function onEventForm() {
        $('.right-section').removeClass('slide-out-right');
        $('.left-section').removeClass('expand-main');
    }

    function offEventForm() {
        $('.right-section').addClass('slide-out-right');
        $('.left-section').addClass('expand-main');
    }

    /**
     * 일정 생성 섹션을 호출한다
     */
    $('#toggleEvent').on('click', function() {
        onEventForm();
    });

    /**
     * 일정 생성 섹션을 닫는다
     */
    $('#close-section-btn').on('click', function () {
        offEventForm();
    });

    /**
     * 캘린더에서 특정 날짜를 클릭했을때 이벤트를 발생시킨다
     */
    $('#calendar').on('click', '.day', function() {
        onEventForm();
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

        // 초기 날짜 세팅
        $('#start-date').val(format(clickedDate));
        $('#end-date').val(format(nextDate));
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
            console.log("종일 체크")
            $('.time-input').css('visibility', 'hidden');
        } else {
            console.log("종일 체크해제")
            $('.time-input').css('visibility', 'visible');
        }
    });

    /**
     * 태그 색상 변경 이벤트
     */
    $('#event-color-select').on('change', function () {
        const selectedColor = $(this).val();

        $('.icon').css('stroke', selectedColor);
    });

    /**
     * 일정 저장 로직
     */
    $('#save-section-btn').on('click', function() {
        // 유효성확인
        if(saveValidate() == false) { return; }
        const formData = {};
        $('#custom-event-form').find('input, select, textarea').each(function () {
            const name = $(this).attr('name');
            let value;
      
            if ($(this).attr('type') === 'checkbox') {
                value = $(this).is(':checked');
            } else {
                value = $(this).val();
            }
      
            if (name) {
                formData[name] = value;
            }
        });

        const participants = [];
        $('#participant-list span').each(function () {
            const email = $(this).data('email');
            if (email) {
                participants.push(email);
            }
        });

        formData['participants'] = participants;

        // JSON으로 출력 확인 (디버깅용)
        console.log(JSON.stringify(formData));


        // post send (url, data, onSuccess, onError)
        post (
            '/create_event/', 
            formData,
            function (response) {
                console.log('저장 성공:', response);
            },
            function (xhr, status, error) {
                console.error('저장 실패:', error);
            }
        );

    });

    function saveValidate() {
        if($('#event-title').val().trim() === "") {
            alert("제목을 입력해주세요.");
            $('#event-title').focus();
            return false;
        }

        if($('#start-date').val().trim === "") {
            alert("시작일을 입력해주세요.");
            $('#start-date').focus();
            return false;
        }

        if($('#end-date').val().trim === "") {
            alert("종료을 입력해주세요.");
            $('#end-date').focus();
            return false;
        }

        // 종일 체크박스에 체크해제 되어있는 경우
        if($('#all-day')) {
            if($('#start-time').val().trim === "") {
                alert("시작시간을 입력해주세요.");
                $('#start-time').focus();
                return false;
            }

            if($('#end-time').val().trim === "") {
                alert("종료시간을 입력해주세요.");
                $('#end-time').focus();
                return false;
            }
        }

        return true;
    }
});
