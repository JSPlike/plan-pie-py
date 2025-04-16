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
    const eventsJson = JSON.parse(document.getElementById('events_json').textContent);
    const holidaysJson = JSON.parse(document.getElementById('holidays-data').textContent); 

    // 저장된 이벤트 처리

    // 해당 유저에 저장되어진 이벤트를 가져온다.
    
    console.log(eventsJson);

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

        // 달력의 이벤트 및 요소들 초기 세팅
        initWindow();
        
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
                    `<div class="holiday-event-item">${name}</div>`
                ).join('');
            }

            calendarHTML += `<div class="${dayClass}" data-year="${year}" data-month="${month + 1}" data-day="${day}">
                                <div class="day-number-container"><div class="day-number">${day}</div></div>
                                <div class="holiday-container">${holidayHTML}</div>
                                <div class="day-events-container"></div>
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
        // 시간 요소를 숨긴다.
        $('.time-input').css('visibility', 'hidden');

        // 렌더링시 해당 년월을 달력 인풋창의 기본으로 사용한다.

        // 렌더링시 해당 년월에 존재하는 이벤트를 달력에 그려준다.
        /*
        const startDate = new Date(startDateStr);
        const endDate = new Date(endDateStr);
        
        // 시작일 데이터 부터 종료일 데이터 까지 읽어서 해당 이벤트를 그려준다.
        for(let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const year = d.getFullYear();
            const month = d.getMonth() + 1; // 월은 0부터 시작
            const day = d.getDate();

            const container = document.querySelector(
                `[data-year="${year}"][data-month="${month}"][data-day="${day}"]`
            );
            
            const eventContainer = container.querySelector('.day-events-container');

            
            // 만약 추가해야할 이벤트 해당 날짜에 대해 위에 휴일이 있거나 첫번째 이벤트가 아닐경우에는 상단마진 2px 설정
            const hasHoliday = container.querySelector('.holiday-container')?.innerHTML.trim() !== ''; // 휴일 요소
            const existingEvents = container.querySelectorAll('.event-item').length > 0; // 이벤트 요소


            if (eventContainer) {
                const eventDiv = document.createElement('div');
                eventDiv.classList.add('event-item');
                eventDiv.style.backgroundColor = color;

                if(hasHoliday || existingEvents) {
                    eventDiv.style.marginTop = '2px';
                }

                // 시작일만 시간 표시
                const label = `${title}`

                eventDiv.innerHTML = label;
                eventContainer.appendChild(eventDiv);
            }
        }
        */

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
        // 클릭한 개체를 탐지한다. 날짜 값을 받는다.
        const year = $(this).data('year');
        const month = $(this).data('month');
        const day = $(this).data('day');

        // 현재 클릭한 날짜데이터
        // javascript에서 0은 1월로 표현된다.
        const clickedDate = new Date(year, month - 1, day);

        const format = (date) => `${date.getFullYear()}-${String(date.getMonth()).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

        // 1. 모든 날짜 포커스 해제
        document.querySelectorAll('.day').forEach(d => d.classList.remove('focused'));

        // ✅ 1. 기존 포커스 해제
        $('#calendar .day.focused').removeClass('focused');

        // ✅ 2. 현재 클릭된 요소에 포커스 클래스 추가
        $(this).addClass('focused');

        // 초기 날짜 세팅 (둘다 오늘날짜)
        $('#start-date').val(format(clickedDate));
        $('#end-date').val(format(clickedDate));

        // 3. flatpickr 인스턴스에 날짜 반영
        $('#start-date')[0]._flatpickr.setDate(clickedDate, true);  // true는 onChange 트리거 포함
        $('#end-date')[0]._flatpickr.setDate(clickedDate, true);

        /* 선택된 날짜에 New Event 박스 생성 */

        drawEvent("New Event", clickedDate)
    });

    /**
     * 달력화면에 해당 이벤트를 그려준다.
     */
    function drawEvent(title, clickedDate) {
        const d = new Date(clickedDate);

        // 기존에 이미 새 이벤트 아이템이 있으면 지워준다.
        const existingEventItems = document.querySelectorAll('.new-event-item');
        existingEventItems.forEach(item => item.remove());
        
        // 클릭한 날짜에 대한 정보
        const year = d.getFullYear();
        const month = d.getMonth() + 1; // 월은 0부터 시작
        const day = d.getDate();

        const container = document.querySelector(
            `[data-year="${year}"][data-month="${month}"][data-day="${day}"]`
        );
        
        const eventContainer = container.querySelector('.day-events-container');

        
        // 만약 추가해야할 이벤트 해당 날짜에 대해 위에 휴일이 있거나 첫번째 이벤트가 아닐경우에는 상단마진 2px 설정
        const hasHoliday = container.querySelector('.holiday-container')?.innerHTML.trim() !== ''; // 휴일 요소
        const existingEvents = container.querySelectorAll('.new-event-item').length > 0; // 이벤트 요소


        if (eventContainer) {
            const eventDiv = document.createElement('div');
            eventDiv.classList.add('new-event-item');
            const color = $('#event-color-select').val();
            eventDiv.style.backgroundColor = color;

            if(hasHoliday || existingEvents) {
                eventDiv.style.marginTop = '2px';
            }

            // 시작일만 시간 표시
            const label = `${title}`

            eventDiv.innerHTML = label;
            eventContainer.appendChild(eventDiv);
        }
    }

    flatpickr("#start-date", {
        dateFormat: "Y-m-d",
        defaultDate: new Date(),
        allowInput: false,
        onChange: function (selectedDates, dateStr, instance) {
            // 만약 선택된 날짜가 종료일보다 뒤라면 종료일도 같은 날짜로 맞춰준다.
            if( $('#start-date').val() > $('#end-date').val() ) {
                $('#end-date').val(dateStr);
                $('#end-date')[0]._flatpickr.setDate(dateStr, true);
                $('#end-date').removeClass('invalid-data');
            }
        }
    });

    flatpickr("#end-date", {
        dateFormat: "Y-m-d",
        defaultDate: new Date(),
        allowInput: false,
        onChange: function (selectedDates, dateStr, instance) {
            // 만약 선택된 날짜가 시작일보다 앞이라면 불가능 하다는 표시가 필요
            if( $('#start-date').val() > $('#end-date').val() ){
                $('#end-date').addClass('invalid-data');
            }
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

        $('.option-section .icon').css('stroke', selectedColor);
        $('.new-event-item').css('background', selectedColor);
    });

    /**
     * 일정 저장 로직
     */
    $('#save-section-btn').on('click', function() {
        // 유효성확인
        if(saveValidate() == false) { return; }

        if (confirm("저장하시겠습니까?")) {
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
                '/event/new/', 
                formData,
                function (res) {
                    // 성공했으면 화면에 그려주는 로직
                    //drawEvent(res.title, res.color, res.start_date, res.end_date)

                    // 화면에 반영해주는 로직필요
                },
                function (xhr, status, error) {
                    console.error('저장 실패:', error);
                }
            );
        }
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
